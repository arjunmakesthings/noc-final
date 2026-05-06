/*
new sketch now. 

the idea is for the system to fetch two words. 

one is given to the person to guess, and the other is being guessed live by the computer. 

As of 2019, the average typing speed on a mobile phone was 36.2 wpm with 2.3% uncorrected errors—there were significant correlations with age, level of English proficiency, and number of fingers used to type.
^ wiki: https://en.wikipedia.org/wiki/Words_per_minute

the computer can guess once in 30s, and it takes 30s to arrive at a word. 

the stages remain the same as wordle; only that i will have to account for two entities: human & computer. 

stages: 
welcome -> generate -> await -> evaluate -> all_correct / some_correct / all_wrong.

each entitity will also have a local state.
*/

//three entitites; so each have their own class.
let human;
let machine;
let host;

let human_to_guess_word;
let machine_to_guess_word;

let global_state = "generate";
let p_global_state = "null"; //for state change detection.

let all_words;

function preload() {
  all_words = loadJSON("./words.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //fix words to an array of 5-char words:
  all_words = Object.values(all_words);
  all_words = all_words.filter((w) => w.length === 5);

  host = new Host();
  machine = new Machine();
  human = new Human();
}

function draw() {
  ui();

  host.state_manager();
  machine.state_manager();
  human.state_manager();

  if (global_state == "generate") {
    human_to_guess_word = fetch_word();
    machine_to_guess_word = fetch_word();
    global_state = "first_guess";
  } else if (global_state == "first_guess") {
    host.local_state = "first_guess";
    global_state = "null";
  }
}

//helper to generate word:
function fetch_word() {
  return random(all_words);
}

function ui() {
  background(0);
}

function keyPressed() {}

function mousePressed() {
  if (global_state == "null") {
    //to initialize everything, since chrome needs user-input to start sound playback.
    host.local_state = "welcome";
  }
}

class Human {
  constructor() {
    this.local_state = "null";
  }

  state_manager() {
    if (this.local_state == "await_begin") {
      this.await_begin();
    }
  }

  await_begin() {
    if (!this.readyBtn) {
      this.readyBtn = createButton("ready");
      this.readyBtn.position(width / 2 - 40, height / 2);

      this.readyBtn.mousePressed(() => {
        global_state = "generate";
        this.readyBtn.remove();
        this.local_state = null;
        this.readyBtn = null;
      });
    }
  }
}

class Machine {
  constructor() {
    this.speech = new p5.Speech("Fred");
    this.speech.setRate(0.9);

    this.local_state = "null";
  }

  state_manager() {
    if (this.local_state == "ready") {
      this.speech.speak("i'm ready. i'm going to take you down.");
      this.local_state = "null";
    }
  }
}

class Host {
  constructor() {
    this.speech = new p5.Speech("Grandpa (English (United Kingdom))");
    this.speech.setRate(0.9);
    // this.speech.setVoice("Fred");

    this.local_state = "null";
  }
  state_manager() {
    if (this.local_state == "welcome") {
      this.welcome();
      this.local_state = "null";
    }
    if (this.local_state == "first_guess") {
      this.speech.speak("alright participants ... time for your first guess.");
      this.local_state = "null";
    }
  }

  welcome() {
    // this.speech.speak(
    //   "welcome puny human ... we've been hearing your declarations on the news about humans being smarter than computers. let's put that to the test now; shall we? ......... you & the machine on your right have been assigned a random 5-letter word. the first one to guess wins ...... are you game?",
    // );

    this.speech.speak("tester");

    setTimeout(() => {
      machine.local_state = "ready";
      human.local_state = "await_begin";
    }, 2000); // delay in milliseconds
  }
}
