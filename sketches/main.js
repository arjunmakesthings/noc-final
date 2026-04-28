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

*/

let global_state = "null";

let human, machine, host, speaker;

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
  speaker = new Speaker();
}

function draw() {
  //draw runs all the time. so we use it as a global state manager.

  if (global_state == "welcome") {
    welcome();
  }

  ui();
}

//global functions:
function welcome() {
  // host.speech.speak(
  //   `"welcome puny human ... we've been hearing your declarations on the news about humans being smarter than computers. let's put that to the test now; shall we? ......... you & the machine on your right have been assigned a random 5-letter word. the first one to guess wins ...... are you game? .......,,,, `,
  // );
  speaker.say("host", "welcome ... blah blah ... are you game?");
  speaker.say("machine", "i'm ready ... i'm going to take you DOWN!");

  speaker.say("host", "alright. both of you have been assigned a 5-letter word");

  global_state = "null";
}

function mousePressed() {
  userStartAudio();
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
  constructor() {}
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

      // run callback for JUST-finished line
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

    // set voice
    if (who == "host") {
      this.speech.setVoice("Grandpa (English (United Kingdom))");
      this.speech.setRate(0.9);
    } else if (who == "machine") {
      this.speech.setVoice("Boing");
      this.speech.setRate(1.0);
      this.speech.setPitch(1.3);
    }

    this.currentCallback = done; // store callback for THIS line

    this.isSpeaking = true;
    this.speech.speak(txt);
  }
}
