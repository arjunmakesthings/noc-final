//260414; noc-final-wip.

let word;

/* 
we use the following states: 
generate -> wait -> evaluate -> result -> if right: go to generate; else if wrong: go to wait.
*/
let state = "generate";

let speech;

let dialogues = ["guess this stupid word"];

function setup() {
  // createCanvas(1000, 562); //in 16:9 aspect ratio.
  createCanvas(800, 800); //square to handle calculations better.

  speech = new p5.Speech();
}

function draw() {
  background(0);

  if (state === "generate") {
    state = "loading"; //temp state to avoid looping.
    fetch_word().then((result) => {
      word = result;
      console.log(word);
    });

    speech.speak("guess this stupid word");

    state = "await";
  } else if (state === "await") {
  } else if (state === "evaluate") {
  } else if (state === "result") {
  }
}

function mousePressed() {}

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
