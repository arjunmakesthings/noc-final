let human, machine, host;

let target_word;
let all_words;

let game_state = "welcome"; // welcome → generate → await → result → repeat

function preload() {
  all_words = loadJSON("./words.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  all_words = Object.values(all_words).filter((w) => w.length === 5);

  human = new Player("human");
  machine = new Player("machine");
  host = new Host();
}

function draw() {
  background(0);

  drawSplitUI();

  if (game_state === "welcome") {
    host.welcome();
    game_state = "generate";
  }

  if (game_state === "generate") {
    target_word = random(all_words);

    human.reset();
    machine.reset();

    game_state = "await";
  }

  if (game_state === "await") {
    human.update();
    machine.update();

    human.display(0); // left
    machine.display(width / 2); // right

    if (human.done || machine.done) {
      game_state = "evaluate";
    }
  }

  if (game_state === "evaluate") {
    human.evaluate(target_word);
    machine.evaluate(target_word);

    game_state = "result";
  }

  if (game_state === "result") {
    host.react(human, machine, target_word);

    if (human.correct || machine.correct) {
      game_state = "generate";
    } else {
      human.prepareNext();
      machine.prepareNext();
      game_state = "await";
    }
  }
}

class Player {
  constructor(type) {
    this.type = type;

    this.input = "";
    this.attempts = [];

    this.done = false;
    this.correct = false;

    this.lastTypeTime = 0;

    // 🧠 memory (only used by machine)
    this.greens = Array(5).fill(null);
    this.yellows = [];
    this.grays = new Set();

    this.thinkingQueue = []; // letters it plans to type
  }

  reset() {
    this.input = "";
    this.attempts = [];
    this.done = false;
    this.correct = false;

    this.greens = Array(5).fill(null);
    this.yellows = [];
    this.grays = new Set();
    this.thinkingQueue = [];
  }

  update() {
    if (this.type === "human") return;

    // if no plan → think
    if (this.thinkingQueue.length === 0 && this.input.length === 0) {
      this.planNextGuess();
    }

    // type 1 char/sec
    if (millis() - this.lastTypeTime > 1000 && this.input.length < 5) {
      let nextChar = this.thinkingQueue.shift();

      if (nextChar) {
        this.speakThinking(nextChar);
        this.input += nextChar;
        this.lastTypeTime = millis();
      }
    }

    if (this.input.length === 5) {
      this.done = true;
    }
  }

  // 🧠 CORE LOGIC
  planNextGuess() {
    let alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    let guess = Array(5).fill(null);

    // 1. place greens
    for (let i = 0; i < 5; i++) {
      if (this.greens[i]) {
        guess[i] = this.greens[i];
      }
    }

    // 2. place yellows (wrong positions)
    for (let y of this.yellows) {
      let possible = [];
      for (let i = 0; i < 5; i++) {
        if (!guess[i] && this.greens[i] !== y) {
          possible.push(i);
        }
      }

      if (possible.length > 0) {
        let idx = random(possible);
        guess[idx] = y;
      }
    }

    // 3. fill remaining with safe random letters
    for (let i = 0; i < 5; i++) {
      if (!guess[i]) {
        let pool = alphabet.filter(
          (c) => !this.grays.has(c) && !this.yellows.includes(c),
        );

        guess[i] = random(pool);
      }
    }

    this.thinkingQueue = guess;
  }

  evaluate(target) {
    let result = Array(5).fill("wrong");
    let targetChars = target.split("");
    let used = Array(5).fill(false);

    // PASS 1: greens
    for (let i = 0; i < 5; i++) {
      if (this.input[i] === target[i]) {
        result[i] = "correct";
        used[i] = true;
        this.greens[i] = this.input[i];
      }
    }

    // PASS 2: yellows (only if unused match exists)
    for (let i = 0; i < 5; i++) {
      if (result[i] === "correct") continue;

      let c = this.input[i];

      let foundIndex = -1;

      for (let j = 0; j < 5; j++) {
        if (!used[j] && targetChars[j] === c) {
          foundIndex = j;
          break;
        }
      }

      if (foundIndex !== -1) {
        result[i] = "wrong-pos";
        used[foundIndex] = true;

        if (!this.yellows.includes(c)) this.yellows.push(c);
      } else {
        result[i] = "wrong";
        this.grays.add(c);
      }
    }

    this.attempts.push({ word: this.input, result });
    this.correct = result.every((r) => r === "correct");
  }

  prepareNext() {
    this.input = "";
    this.done = false;
  }

  speakThinking(char) {
    // placeholder “thinking out loud”
    console.log("machine thinking:", char);

    // if you want voice:
    // this.speech.speak("maybe " + char);
  }

  display(offsetX) {
    push();
    translate(offsetX, 0);

    textSize(40);
    fill(255);
    textAlign(CENTER);

    // current input
    for (let i = 0; i < this.input.length; i++) {
      text(this.input[i], width / 4 - 100 + i * 50, height - 100);
    }

    // attempts
    for (let j = 0; j < this.attempts.length; j++) {
      let attempt = this.attempts[j];

      for (let i = 0; i < 5; i++) {
        let x = width / 4 - 100 + i * 50;
        let y = 100 + j * 60;

        if (attempt.result[i] === "correct") fill(0, 255, 0);
        else if (attempt.result[i] === "wrong-pos") fill(255, 200, 0);
        else fill(100);

        text(attempt.word[i], x, y);
      }
    }

    pop();
  }
}

function keyPressed() {
  if (game_state !== "await") return;

  if (human.input.length < 5 && key.length === 1) {
    human.input += key.toLowerCase();
  }

  if (human.input.length === 5) {
    human.done = true;
  }
}

class Host {
  constructor() {
    this.speech = new p5.Speech();
  }

  welcome() {
    this.speech.speak("welcome. human versus machine begins.");
  }

  react(human, machine, word) {
    if (human.correct && machine.correct) {
      this.speech.speak("both guessed it.");
    } else if (human.correct) {
      this.speech.speak("human wins.");
    } else if (machine.correct) {
      this.speech.speak("machine wins.");
    } else {
      this.speech.speak("no one got it. next round.");
    }
  }
}

function drawSplitUI() {
  stroke(80);
  line(width / 2, 0, width / 2, height);

  noStroke();
  fill(255);
  textAlign(CENTER);

  text("HUMAN", width / 4, 40);
  text("MACHINE", (3 * width) / 4, 40);
}