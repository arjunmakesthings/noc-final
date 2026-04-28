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

*/

let global_state = "null";

let human, machine, host;

let dict; //dictionary to store all words.

function preload() {
  dict = loadJSON("./words.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  dict = Object.values(dict).filter((w) => w.length === 5); //keep 5-letter words.

  human = new Human();
  machine = new Machine();
  host = new Host();
}

function draw() {
  //draw runs all the time. so we use it as a global state manager.

  if (global_state == "welcome") {
    welcome();
  }

  ui();
}

//global functions:

// we have to add .onEnd before the speaking. so, dialogues can only be two-sequence long.
function welcome() {
  // host.speech.speak(
  //   `"welcome puny human ... we've been hearing your declarations on the news about humans being smarter than computers. let's put that to the test now; shall we? ......... you & the machine on your right have been assigned a random 5-letter word. the first one to guess wins ...... are you game? .......,,,, `,
  // );

  host.speech.speak("welcome");
  host.speech.onEnd = () => {
    machine.speech.setVoice("Boing"); 
    machine.speech.speak("i'm ready. are you?");
    background(255);
  };
  global_state = "null";
}

function mousePressed() {
  global_state = "welcome";
}

function ui() {
  background(0);
}

/* actors */
class Human {
  constructor() {}
}

class Machine {
  constructor() {
    this.speech = new p5.Speech("Boing");
    this.speech.setRate(1.0);
    this.speech.setPitch(1.3);
  }
}

class Host {
  constructor() {
    this.speech = new p5.Speech("Grandpa (English (United Kingdom))");
    this.speech.setRate(0.9);
  }
}
