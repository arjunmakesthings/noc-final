//260414; noc-final-wip.

let word;

/* 
we use the following states: 
generate -> wait -> evaluate -> result -> if right: go to generate; else if wrong: go to wait.
*/
let state = "null";
let p_state = state;

//text to speech stuff:
let speech;
//dialogues are a 2-dimensional array. with each stage, you can pick a random dialogue.
let dialogues = [["guess this stupid word"], ["god you're so stupid"]];

let input_str;

let result = [];

let attempts = [];

function setup() {
  // createCanvas(1000, 562); //in 16:9 aspect ratio.
  createCanvas(800, 800); //square to handle calculations better.

  speech = new p5.Speech();

  //assign a random voice. we wait a little bit to run this block of code for it to get all the voices.
  // setTimeout(() => {
  //   let all_voices = speech.voices;
  //   let voice = Math.floor(random(all_voices.length));
  //   speech.setVoice(voice);
  //   console.log("current voice:", all_voices[voice].name);
  // }, 500);
}

function draw() {
  background(0);

  for (let i = 0; i < attempts.length; i++) {
    attempts[i].display();
  }

  if (state === "generate") {
    state = "temp-hold"; //temp state to avoid looping multiple times (because it's in draw).

    fetch_word().then((result) => {
      word = result;
      console.log("garbled word -> " + word);
    });

    //say dialogue:
    speech.speak(dialogues[0][0]);

    //state change:
    state = "await";

    //prepare input string:
    input_str = "";
  } else if (state === "await") {
    // state = "temp-hold"; //temp state to avoid looping multiple times (because it's in draw).

    show_typing(input_str);

    if (input_str.length === 5) {
      //when it is 5, go to evaluate.
      state = "evaluate";
    }
  } else if (state === "evaluate") {
    result = [];

    for (let i = 0; i < 5; i++) {
      let c = input_str[i];

      if (c === word[i]) {
        result[i] = "correct";
      } else if (word.includes(c)) {
        result[i] = "wrong-pos";
      } else {
        result[i] = "wrong";
      }
    }

    console.log(result);

    attempts.push(new Attempt(input_str, result));

    state = "result";
  } else if (state === "result") {

    
    speech.speak(dialogues[1][0]);

    //reset input.
    input_str = ""; 
    state = "await"; 
  }

  if (state != p_state) {
    console.log("state -> " + state);
  }

  p_state = state;
}

//show what is being typed.
function show_typing(input_str) {
  textSize(24);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < input_str.length; i++) {
    fill(255);
    text(input_str[i], width / 2 - 100 + i * 50, height - 100);
  }
}

//shows result on screen.
function show_result() {}

function mousePressed() {
  //text to speech needs a user-action to begin everything. so, we keep this to start.
  state = "generate";
}

function keyPressed() {
  if (state === "await") {
    input_str += key;
  }
}

async function fetch_word() {
  let res = await fetch("https://random-word-api.herokuapp.com/word?length=5");
  let data = await res.json();
  word = data[0];

  console.log("og word -> " + word);

  //garble the word:
  let chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    let j = Math.floor(random(i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

class Attempt {
  constructor(word, result) {
    this.word = word;
    this.result = result;
  }

  display() {
    let index = attempts.indexOf(this);
    let y = 100 + index * 60;

    textSize(32);
    textAlign(CENTER, CENTER);

    for (let i = 0; i < this.word.length; i++) {
      let x = width / 2 - 100 + i * 50;

      if (this.result[i] === "correct") fill(0, 255, 0);
      else if (this.result[i] === "wrong-pos") fill(255, 200, 0);
      else fill(80);

      text(this.word[i], x, y);
    }
  }
}
