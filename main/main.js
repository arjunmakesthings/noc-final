/*
can you beat a 1-byte-per-second computer?
by arjun & aram-pundak; april 2026. largely hand-programmed by arjun.

arduino-states to reference:
idle        -> idle face
smug        -> smug face
sad         -> sad face
win         -> win face
slap_1_on   -> pin 12 high
slap_1_off  -> pin 12 low
slap_2_on   -> pin 13 high
slap_2_off  -> pin 13 low
*/

let human, machine, host, speaker; //actors.

let dict; //dictionary to store all words.
let human_to_guess, machine_to_guess;

let dialogues;

// // temp words for testing:
// let human_to_guess = "apple";
// let machine_to_guess = "apple";

let global_state = "begin"; //it has to be begin because everything in key pressed is wrapped inside this condition being true. to test a stage, change state in mousePressed() because chrome needs a user-activation for audio.

let reg_font;
let bold_font;

let winner;
let loser;

/* dialogue mp3s. loaded in preload(). all under ../assets/dialogues/{host,machine}/.
   pan: host -> left speaker, machine -> right speaker (handled in Speaker.next()).

   host/{1,2,3}.mp3      = intro lines (welcome, fighters-ready, objective).
   host/close_*.mp3      = guess-feedback lines. odd # = addressed to machine,
                           even # = addressed to human. close_1..14 are positive
                           ("close / almost"), close_15..30 are negative
                           ("bad guess / wrong / etc."), close_25, 26 are skipped
                           (errors), close_31, 32 are winner gloats.
   machine/1.mp3         = "i'm ready, taking this human down".
   machine/2..39.mp3     = thinking-line synonyms.
*/
let host_intro = [];
let host_close_machine = [];
let host_close_human = [];
let host_bad_machine = [];
let host_bad_human = [];
let host_machine_won;
let host_human_won;
let machine_ready;
let machine_thinking = [];

let winner_announced = false; //one-shot guard for winner_declaration().

let cursor_hide = false;

function preload() {
  dict = loadJSON("./words.json");
  reg_font = loadFont("../assets/fonts/JetBrainsMonoNL-Regular.ttf");
  bold_font = loadFont("../assets/fonts/JetBrainsMonoNL-SemiBold.ttf");
  dialogues = loadJSON("./dialogues.json");

  //host intros: 1, 2, 3 (0.mp3 is a test file, skipped).
  for (let n of [1, 2, 3]) {
    host_intro.push(loadSound(`../assets/dialogues/host/${n}.mp3`));
  }

  //host close-* lines. odd # = machine-addressed, even # = human-addressed.
  for (let n of [1, 3, 5, 7, 9, 11, 13]) {
    host_close_machine.push(loadSound(`../assets/dialogues/host/close_${n}.mp3`));
  }
  for (let n of [2, 4, 6, 8, 10, 12, 14]) {
    host_close_human.push(loadSound(`../assets/dialogues/host/close_${n}.mp3`));
  }
  //close_15..30 are negative-feedback. close_25, 26 are error files - skipped.
  for (let n of [15, 17, 19, 21, 23, 27, 29]) {
    host_bad_machine.push(loadSound(`../assets/dialogues/host/close_${n}.mp3`));
  }
  for (let n of [16, 18, 20, 22, 24, 28, 30]) {
    host_bad_human.push(loadSound(`../assets/dialogues/host/close_${n}.mp3`));
  }
  //winner gloats.
  host_machine_won = loadSound("../assets/dialogues/host/close_31.mp3");
  host_human_won   = loadSound("../assets/dialogues/host/close_32.mp3");

  //machine: 1.mp3 = ready line, 2..39.mp3 = thinking-synonyms (0.mp3 skipped).
  machine_ready = loadSound("../assets/dialogues/machine/1.mp3");
  for (let i = 2; i <= 39; i++) {
    machine_thinking.push(loadSound(`../assets/dialogues/machine/${i}.mp3`));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  dict = Object.values(dict).filter((w) => w.length === 5); //keep only 5-character words.

  //prevent default backspace operation on browsers, since we'll use the backspace.
  window.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") e.preventDefault();
  });

  //make single instances of actors.
  human = new Human();
  machine = new Machine();
  host = new Host();
  speaker = new Speaker();

  send_serial("idle");
}

function draw() {
  //since draw loops over time, we'll use it as a state change manager.

  if (global_state == "welcome") {
    welcome();
  } else if (global_state == "generate") {
    generate();
  } else if (global_state == "await") {
    human.think();
    machine.think();
  }

  ui();

  if (global_state == "winner_declaration") {
    winner_declaration();
  }

  if (cursor_hide){
    noCursor();
  }
}

//global helpers:

function evaluate(guess, from) {
  let result = [];

  let word;
  if (from == "human") {
    word = human_to_guess;
  } else if (from == "machine") {
    word = machine_to_guess;
  }

  // convert word into mutable pool
  let pool = word.split("");

  // 1st pass: greens
  for (let i = 0; i < 5; i++) {
    let c = guess[i];

    if (c === word[i]) {
      result[i] = "correct";
      pool[i] = null; // consume it
    }
  }

  // 2nd pass: yellows / greys
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;

    let c = guess[i];

    let idx = pool.indexOf(c);

    if (idx !== -1) {
      result[i] = "wrong-pos";
      pool[idx] = null; // consume matched letter
    } else {
      result[i] = "wrong";
    }
  }

  let correct = result.filter((r) => r === "correct").length;
  let wrong_pos = result.filter((r) => r === "wrong-pos").length;
  let wrong_char = result.filter((r) => r === "wrong").length;

  let dominant = Math.max(correct, wrong_pos, wrong_char);

  if (correct === 5) {
    //all are correct.
    winner = from;
    loser = from === "human" ? "machine" : "human";

    if (winner === "human") {
      //we slap the machine.
      send_serial("slap_1_on");
      setTimeout(() => send_serial("slap_1_off"), 3000);
    } else if (winner === "machine") {
      send_serial("slap_2_on");
      setTimeout(() => send_serial("slap_2_off"), 3000);
    }

    global_state = "winner_declaration";
  } else if (correct === dominant) {
    //more correct characters: pick a random close-* line addressed to whoever guessed.
    let pool_close = from === "machine" ? host_close_machine : host_close_human;
    speaker.say("host", random(pool_close));
  } else if (wrong_char === dominant) {
    //just wrong position: pick a random bad-guess line addressed to whoever guessed.
    let pool_bad = from === "machine" ? host_bad_machine : host_bad_human;

    speaker.say("host", random(pool_bad), () => {
      let on_msg;
      let off_msg;

      // decide which actuator
      if (from === "human") {
        on_msg = "slap_2_on";
        off_msg = "slap_2_off";
      } else if (from === "machine") {
        on_msg = "slap_1_on";
        off_msg = "slap_1_off";
        send_serial("sad");
      }

      // 🔥 immediate trigger (after speech ends)
      send_serial(on_msg);

      // 🔥 safety reset (ensures motor always turns off even if something glitches)
      setTimeout(() => {
        send_serial(off_msg);
      }, 3000);
    });
  } else {
  }

  return {
    result,
    correct,
    wrong_pos,
    wrong_char,
    dominant,
  };
}
function mousePressed() {
  if (global_state === "begin") {
    userStartAudio();
    global_state = "welcome";
    connect_serial();
    cursor_hide = true;
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (show_start_prompt) {
      show_start_prompt = false;
      global_state = "generate";
      return;
    }
    if (global_state === "winner_declaration") {
      restart_game();
      return;
    }
  }

  if (human.local_state === "thinking") {
    human.type(key);
  }

  if (key === " ") {
    speaker.skip();
  }
}

function restart_game() {
  //full reset. pick new words and jump straight to await — like generate()
  //but without the host intro speech.
  global_state = "null";        //freeze state-machine while we tear things down.
  speaker.reset();              //drop the gloat (and any queued lines) cleanly.
  human = new Human();
  machine = new Machine();
  winner = null;
  loser = null;
  winner_announced = false;
  send_serial("idle");
  human_to_guess = random(dict);
  machine_to_guess = human_to_guess;
  global_state = "await";
}

function ui() {
  background(0);

  //global ui:
  fill(255);

  push();
  textSize(34);
  textAlign(CENTER, CENTER);
  textFont(bold_font);
  text("the ultimate battle of (wordle) wits", width / 2, 100);

  textSize (14); 
  fill (190); 
  textFont(reg_font);
  text("a project by aram & arjun; april, 2026.", width / 2, height-30);

  
  text ("grey letters are wrong, yellow are right but in the wrong position, and green are correct.", width / 2, 140);
  pop();

  push();
  fill(100);
  textSize(18);
  textAlign(CENTER, CENTER);
  textFont(reg_font);
  let hint =
    global_state === "winner_declaration"
      ? "press enter to restart."
      : "press spacebar to skip dialogue.";
  text(hint, width / 2, height - 100);
  pop();

  if (show_start_prompt) {
    push();
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    textFont(bold_font);
    text("press enter to start.", width / 2, height / 2);
    pop();
  }

  if (global_state == "await" || global_state == "winner_declaration") {
    textFont(reg_font);
    textSize(18);
    textAlign(LEFT, TOP);

    //human stuff:
    let lx = 100;
    let ly = 200;

    fill(190);
    text("human-being:", lx, ly);

    let y = ly + 30;

    fill(255);
    for (let t = 0; t < human.attempts.length; t++) {
      let attempt = human.attempts[t];

      let line = "> " + attempt.word;

      for (let i = 0; i < line.length; i++) {
        let c = line[i];

        if (i < 2) {
          fill(120);
        } else {
          let idx = i - 2;

          if (attempt.result[idx] === "correct") fill(0, 255, 0);
          else if (attempt.result[idx] === "wrong-pos") fill(255, 200, 0);
          else fill(120);
        }

        text(c, lx + textWidth(line.slice(0, i)), y);
      }

      y += 28;
    }

    // current typing (no result yet)
    fill(255);
    text("> " + human.current, lx, y);

    let rx = width / 2 + 200;
    let ry = 200;

    fill(190);
    text("1-byte/second machine:", rx, ry);

    let my = ry + 30;

    // committed machine guesses (same rendering logic as human)
    for (let t = 0; t < machine.attempts.length; t++) {
      let attempt = machine.attempts[t];

      let line = "> " + attempt.word;

      for (let i = 0; i < line.length; i++) {
        let c = line[i];

        if (i < 2) {
          fill(120);
        } else {
          let idx = i - 2;

          if (attempt.result[idx] === "correct") fill(0, 255, 0);
          else if (attempt.result[idx] === "wrong-pos") fill(255, 200, 0);
          else fill(120);
        }

        text(c, rx + textWidth(line.slice(0, i)), my);
      }

      my += 28;
    }

    // live machine typing stream (NO evaluation yet)
    fill(255);
    text("> " + machine.current, rx, my);
  }
}

//stages:
function winner_declaration() {
  // one-shot: this function is called every frame from draw() until noLoop()
  // fires from the callback. without the guard we'd queue the gloat mp3 dozens
  // of times before the first one even finishes.
  if (!winner_announced) {
    winner_announced = true;
    let gloat = winner === "machine" ? host_machine_won : host_human_won;
    speaker.say("host", gloat, () => {
      send_serial("win");
    });
  }

  push();
  // rectMode(CENTER, CENTER);
  // fill(255);
  translate(width / 2, height / 2);
  // angleMode(DEGREES);
  // rotate(-10);
  // rect(0, 0, 800, 200);
  textAlign(CENTER, CENTER);
  // fill(212,175,55);
  fill(207, 181, 59);
  textSize(95);
  text(winner + ` won.\n suck it,` + loser + `.`, 0, -10);
  pop();
}

function generate() {
  human_to_guess = random(dict);
  // machine_to_guess = random(dict);
  machine_to_guess = human_to_guess;

  // console.log(human_to_guess, machine_to_guess);

  speaker.say("host", host_intro[2], () => {     //"the objective is to..."
    global_state = "await";
  });
  global_state = "null"; //prevent from looping. onEnd for the speech runs independently.
}
function welcome() {
  speaker.say("host", host_intro[0]);     //"welcome to the itp show ..."
  speaker.say("host", host_intro[1]);     //"fighters, are you ready?"
  speaker.say("machine", machine_ready, () => {
    send_serial("smug");
    show_ready_btn();
  });

  global_state = "null";
}
let show_start_prompt = false;
function show_ready_btn() {
  show_start_prompt = true;
}

/* actors */
class Human {
  constructor() {
    this.current = "";
    this.log = [];

    this.sent_word = null;
    this.result = null;

    this.local_state = "null";

    this.attempts = [];
  }

  think() {
    //the human thinks themselves.
    if (global_state !== "await") return;

    if (this.current.length != 5) {
      this.local_state = "thinking";
    } else {
      this.send();
      this.local_state = "null";
    }
  }

  type(key) {
    if (keyCode === BACKSPACE || key === "backspace") {
      this.current = this.current.slice(0, -1);
      return;
    }

    if (key.length === 1) {
      this.current += key.toLowerCase();
    }
  }

  send() {
    this.sent_word = this.current;

    this.result = evaluate(this.sent_word, "human");

    this.log.push(this.current);

    this.attempts.push({
      word: this.current,
      result: this.result.result,
    });

    // 🔥 NEW: machine learns from human guess
    machine.learn(this.current, this.result.result);

    this.current = "";
  }
}

//machine is programmed with the help of chat-gpt.
class Machine {
  constructor() {
    this.current = "";
    this.log = [];
    this.sent_word = null;
    this.local_state = "thinking";

    this.attempts = [];

    this.knowledge = {
      fixed: Array(5).fill(null),
      banned: new Set(),
      mustContain: new Set(),
    };

    this.phase = "thinking"; // thinking → typing → sending

    this.timer = 0;
    this.reveal_index = 0;
    this.buffer = "";

    this.thinkAnim = [".", "..", "...", ".."];
    this.thinkFrame = 0;
    this.lastThinkTick = 0;

    this.first_think = true;
    this.thinking_synonym = "thinking";
  }

  think() {
    if (global_state !== "await") return;

    // 1. THINKING PHASE (5 sec pause)
    // 1. THINKING PHASE (5 sec pause + animated dots)
    if (this.phase === "thinking") {
      send_serial("idle");
      if (this.timer === 0) {
        //machine_thinking[i] audio matches dialogues.thinking_synonyms[i] text
        //(both arrays are aligned: 2.mp3 = "accomplishing", 3.mp3 = "actioning", ...).
        let idx;
        if (this.first_think) {
          idx = dialogues.thinking_synonyms.indexOf("thinking");
          this.first_think = false;
        } else {
          idx = Math.floor(Math.random() * machine_thinking.length);
        }
        this.thinking_synonym = dialogues.thinking_synonyms[idx];
        speaker.say("machine", machine_thinking[idx]);

        this.timer = millis();
        this.thinkFrame = 0;
        this.lastThinkTick = millis();

        this.current = this.thinking_synonym;
      }

      // animate dots
      if (millis() - this.lastThinkTick > 400) {
        this.lastThinkTick = millis();
        this.thinkFrame = (this.thinkFrame + 1) % this.thinkAnim.length;

        this.current =
          this.thinking_synonym + " " + this.thinkAnim[this.thinkFrame];
      }

      if (millis() - this.timer < 5000) return;

      this.phase = "typing";
      this.timer = millis();
      this.reveal_index = 0;

      this.buffer = this.type();
    }

    // 2. TYPING PHASE (1 char per second)
    if (this.phase === "typing") {
      this.current = this.buffer.slice(0, this.reveal_index);

      if (millis() - this.timer > 1000) {
        this.timer = millis();
        this.reveal_index++;
      }

      // finished typing
      if (this.reveal_index > this.buffer.length) {
        this.send();
        this.phase = "thinking";
        this.timer = 0;
      }
    }
  }

  type() {
    let guess = "";

    for (let i = 0; i < 5; i++) {
      // 1. fixed letters (green)
      if (this.knowledge.fixed[i]) {
        guess += this.knowledge.fixed[i];
        continue;
      }

      let pool = "abcdefghijklmnopqrstuvwxyz"
        .split("")
        .filter((c) => !this.knowledge.banned.has(c));

      // 2. ensure mustContain letters are prioritized somewhere else
      let must = Array.from(this.knowledge.mustContain);

      // avoid placing a known yellow in same slot? (weak constraint, ok for now)
      pool = pool.filter((c) => c !== must[i]);

      let chosen;

      // bias: if we still need to place a mustContain letter, prefer it
      if (must.length > 0 && Math.random() < 0.5) {
        chosen = random(must);
      } else {
        chosen = random(pool);
      }

      guess += chosen;
    }

    return guess;
  }

  send() {
    this.sent_word = this.buffer;

    let result = evaluate(this.sent_word, "machine");

    this.log.push(this.buffer);

    this.attempts.push({
      word: this.buffer,
      result: result.result,
    });

    this.learn(this.buffer, result.result);

    this.current = "";
  }
  learn(word, resultArr) {
    // first pass: collect all non-wrong letters
    let confirmed = new Set();

    for (let i = 0; i < 5; i++) {
      let r = resultArr[i];
      let c = word[i];

      if (r === "correct") {
        this.knowledge.fixed[i] = c;
        confirmed.add(c);
      }

      if (r === "wrong-pos") {
        this.knowledge.mustContain.add(c);
        confirmed.add(c);
      }
    }

    // second pass: only ban if NOT confirmed anywhere
    for (let i = 0; i < 5; i++) {
      let r = resultArr[i];
      let c = word[i];

      if (r === "wrong" && !confirmed.has(c)) {
        this.knowledge.banned.add(c);
      }
    }
  }
}

class Host {
  constructor() {}
}

/*
Speaker: queues p5.SoundFile playbacks, panning host -> left and machine -> right.

usage:
  speaker.say("host",    host_intro[0]);
  speaker.say("machine", machine_ready, () => { ...callback when it ends... });
  speaker.skip();   // stops the current line + advances the queue.

`sound` should be a p5.SoundFile (loaded in preload via loadSound()).
the queue lets us serialise lines + run a state-change in onended.
*/
class Speaker {
  constructor() {
    this.queue = [];
    this.is_playing = false;
    this.current_sound = null;
    this.current_callback = null;
    this.advanced = false; //guards against skip() + onended both firing advance().
  }

  say(who, sound, done = null) {
    this.queue.push({ who, sound, done });
    this.next();
  }

  next() {
    if (this.is_playing || this.queue.length === 0) return;

    let { who, sound, done } = this.queue.shift();

    //missing or unloaded sound -> skip but still fire the callback so the
    //game's state-machine doesn't stall.
    if (!sound || typeof sound.play !== "function") {
      console.warn("speaker: missing sound, skipping", who);
      if (done) done();
      this.next();
      return;
    }

    sound.pan(who === "host" ? -1 : 1);

    this.current_sound = sound;
    this.current_callback = done;
    this.is_playing = true;
    this.advanced = false;

    sound.onended(() => this.advance());
    sound.play();
  }

  advance() {
    if (this.advanced) return;
    this.advanced = true;
    this.is_playing = false;
    let cb = this.current_callback;
    this.current_sound = null;
    this.current_callback = null;
    if (cb) cb();
    this.next();
  }

  skip() {
    if (!this.is_playing) return;
    if (this.current_sound && this.current_sound.isPlaying()) {
      this.current_sound.stop();
    }
    this.advance();
  }

  //hard reset: drop the queue and silence the current line WITHOUT firing
  //its onended callback. used on restart so a still-playing winner gloat
  //can't call noLoop() after we've already re-enabled the loop.
  reset() {
    if (this.current_sound) {
      this.current_sound.onended(() => {});  //detach handler.
      if (this.current_sound.isPlaying()) this.current_sound.stop();
    }
    this.queue = [];
    this.is_playing = false;
    this.current_sound = null;
    this.current_callback = null;
    this.advanced = false;
  }
}

/*
 serial stuff; written by aram's claude.

 usage:
 call connect_serial() once from a click / keypress handler. we do this when we do userStartAudio.

 send_serial() with character "x" will send "x\n" to the arduino. we use this to change every physical peripheral — the arduino is set up to read serial at 115200 baud.
*/

let serial_port = null;
let serial_writer = null;

async function connect_serial() {
  if (serial_writer || !("serial" in navigator)) return;
  try {
    //reuse previously authorized port (EDBG CMSIS-DAP) without re-prompting.
    //first time the user must pick it; chrome remembers it for the origin after that.
    let ports = await navigator.serial.getPorts();
    serial_port = ports[0] || (await navigator.serial.requestPort());
    await serial_port.open({ baudRate: 115200 });
    serial_writer = serial_port.writable.getWriter();
    console.log("serial: connected");
  } catch (e) {
    console.log("serial: not connected", e && e.message);
  }
}

function send_serial(c) {
  if (!serial_writer) return;
  serial_writer.write(new TextEncoder().encode(c + "\n")).catch((e) => {
    console.warn("serial write failed", e && e.message);
  });
}
