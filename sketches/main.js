//260414; noc-final-wip.

let word;

/* 
we use the following states: 
generate -> wait -> evaluate -> result -> if right: go to generate; else if wrong: go to wait.
*/
let state = "null";

let speech;

//dialogues are a 2-dimensional array. with each stage, you can pick a random dialogue.
let dialogues = [["guess this stupid word"]];

function setup() {
  // createCanvas(1000, 562); //in 16:9 aspect ratio.
  createCanvas(800, 800); //square to handle calculations better.

  speech = new p5.Speech();

  //assign a random voice. we wait a little bit to run this block of code for it to get all the voices.
  setTimeout(() => {
    let all_voices = speech.voices;
    let voice = Math.floor(random(all_voices.length));
    speech.setVoice(voice);
    console.log("current voice:", all_voices[voice].name);
  }, 500);
}

function draw() {
  background(0);

  if (state === "generate") {
    state = "loading"; //temp state to avoid looping.
    fetch_word().then((result) => {
      word = result;
      console.log(word);
    });

    // speech.speak(dialogues[0][0]);

    speech.speak("set"); 

    state = "await";
  } else if (state === "await") {
  } else if (state === "evaluate") {
  } else if (state === "result") {
  }

  // console.log(state); 
}

function mousePressed() {
  //text to speech needs a user-action to begin everything. so, we keep this to start.
  state="generate"; 
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
