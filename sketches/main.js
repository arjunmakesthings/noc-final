/*
are you faster than a 1-byte-per-second computer? 

a project by arjun & aram-pundak; april 2026. hand-programmed by arjun.

there are three actors in this game: 
- human (player-a)
- machine (player-b)
- host

all three function independently. 

there is a global state-machine for the whole game. states are: 
welcome (t.a.) -> give word (t.a.) -> await (n.t.) -> declare result (n.t. to play again).
* t.a is triggered automatically; while n.t. is needs trigger by actors.

a thing i realized after a while is that p5.speech can't be instanced. there has to be a global speaker object. 

another annoying thing that browsers do is force a click to play any sound or do any speech thing. so, to test individual stages, go to the mousePressed function and change state from there (otherwise the audio(s) won't play).  
*/

let human, machine, host, speaker; //actors.

let dict; //dictionary to store all words.
// let human_to_guess, machine_to_guess;

// temp words for testing:
let human_to_guess = "apple";
let machine_to_guess = "mango";

let global_state = "begin";

let font;

function preload() {
  dict = loadJSON("./words.json");
  font = loadFont("../assets/fonts/JetBrainsMonoNL-Regular.ttf");
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
}

function draw() {
  //since draw loops over time, we'll use it as a state change manager.
  if (global_state === "winner_declaration") {
    ui();
    return; 
  }

  if (global_state == "welcome") {
    welcome();
  } else if (global_state == "generate") {
    generate();
  } else if (global_state == "await") {
    human.think();
    machine.think();
  }

  ui();
}

//global helpers:
function evaluate(guess, from) {
  let result = [];

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
    global_state = "winner_declaration";
  } else if (correct === dominant) {
    //more correct characters:
    speaker.say("host", "ooh, the " + from + "is close!");
  } else if (wrong_char === dominant) {
    //just wrong position:
    speaker.say("host", "nope " + from + "... bad guess");
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
    global_state = "await";
  }
}

function keyPressed() {
  if (human.local_state === "thinking") {
    human.type(key);
  }
}

function ui() {
  background(0);

  if (global_state == "await") {
    textFont(font);
    textSize(16);
    textAlign(LEFT, TOP);

    //human stuff:
    let lx = 50;
    let ly = 50;

    fill(255);
    text("human-representative:", lx, ly);

    let y = ly + 30;

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

    let rx = width / 2 + 50;
    let ry = 50;

    fill(255);
    text("machine-representative:", rx, ry);

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
function generate() {
  human_to_guess = random(dict);
  machine_to_guess = random(dict);

  console.log(human_to_guess, machine_to_guess);

  speaker.say(
    "host",
    "alright, you two. you've both been assigned a random 5-letter english word. put your thinking caps on — may the quickest win!!!",
  );

  global_state = "await";
}
function welcome() {
  speaker.say("host", "welcome ... blah blah ... are you game?");
  speaker.say("machine", "i'm ready ... i'm going to take you DOWN!", () => {
    show_ready_btn();
  });

  global_state = "null";
}
let ready_btn;
function show_ready_btn() {
  if (ready_btn) return;

  ready_btn = createButton("ready.");
  ready_btn.position(width / 2 - 40, height / 2);

  ready_btn.mousePressed(() => {
    ready_btn.remove();
    ready_btn = null;
    global_state = "generate";
  });
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
  }

  think() {
    if (global_state !== "await") return;

    // 1. THINKING PHASE (5 sec pause)
    if (this.phase === "thinking") {
      if (this.timer === 0) {
        this.timer = millis();
        this.current = "> thinking";
      }

      if (millis() - this.timer < 5000) return;

      // move to typing
      this.phase = "typing";
      this.timer = millis();
      this.reveal_index = 0;

      this.buffer = this.type(); // generate guess ONCE
    }

    // 2. TYPING PHASE (1 char per second)
    if (this.phase === "typing") {
      this.current = "> " + this.buffer.slice(0, this.reveal_index);

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

    for (let i = 0; i < 5; i++) {
      let r = result.result[i];
      let c = this.buffer[i];

      if (r === "correct") {
        this.knowledge.fixed[i] = c;
      }

      if (r === "wrong") {
        this.knowledge.banned.add(c);
      }

      if (r === "wrong-pos") {
        // THIS is the key fix
        this.knowledge.mustContain.add(c);
      }
    }

    this.current = "";
  }
}

class Host {
  constructor() {}
}

/*
p5.speech does this annoying thing where it can't make instances of the speech object. so, we have to deal with a global speaker. 

furthermore, inside a function, we can only have one .onEnd callback. so, to get around that, i asked chatgpt to make a queue system; with the option of a callback (so that i can do a state change). 

usage: 
function welcome() {
  speaker.say("host", "welcome");
  speaker.say("machine", "i'm ready. are you?");
  speaker.say("host", "let's begin", () => {
    global_state = "generate"; // 🔑 state change happens here
  });
  global_state = "null";
}
*/

class Speaker {
  constructor() {
    this.speech = new p5.Speech();
    this.queue = [];
    this.isSpeaking = false;
    this.currentCallback = null;

    this.speech.onEnd = () => {
      this.isSpeaking = false;

      if (this.currentCallback) {
        this.currentCallback();
        this.currentCallback = null;
      }

      this.next();
    };
  }

  say(who, txt, done = null) {
    this.queue.push({ who, txt, done });
    this.next();
  }

  next() {
    if (this.isSpeaking || this.queue.length === 0) return;

    let { who, txt, done } = this.queue.shift();

    if (who == "host") {
      this.speech.setVoice("Grandpa (English (United Kingdom))");
      this.speech.setRate(0.9);
    } else if (who == "machine") {
      this.speech.setVoice("Boing");
      this.speech.setRate(1.1);
      this.speech.setPitch(1.3);
    }

    this.currentCallback = done;
    this.isSpeaking = true;
    this.speech.speak(txt);
  }
}
