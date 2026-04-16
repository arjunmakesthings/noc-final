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
let dialogues = [["guess this stupid word"]];

let input_str;

let result =[]; 

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

  if (state === "generate") {
    state = "temp-hold"; //temp state to avoid looping multiple times (because it's in draw).

    fetch_word().then((result) => {
      word = result;
      console.log(word);
    });

    //say dialogue:
    speech.speak(dialogues[0][0]);

    //state change:
    state = "await";

    //prepare input string:
    input_str = "";
  } else if (state === "await") {
    // state = "temp-hold"; //temp state to avoid looping multiple times (because it's in draw).

    //wait for user input.
    console.log(input_str.length);

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

    state = "result";
  } else if (state === "result") {
    for (let i = 0; i<result.length; i++){
      // if 
    }
  }

  if (state != p_state) {
    console.log(state);
  }

  p_state = state;
}

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

  //garble the word:
  let chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    let j = Math.floor(random(i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
