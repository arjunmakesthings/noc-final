// generate 5 letter word, but mess it up -> the computer does not understand.

let word;

function setup() {
  // createCanvas(1000, 562); //in 16:9 aspect ratio.
  createCanvas(800, 800); //square to handle calculations better.
}

function draw() {
  background(0);
}

function mousePressed() {
  fetch_word().then((result) => {
    word = result;
    console.log(word);
  });
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
