let words;

function preload() {
  words = loadJSON("./words.json");
}

function setup() {
  //only keep 5 letter words:
  words = Object.values(words);
  words = words.filter((w) => w.length === 5);
}

function draw() {
  console.log(words[0]);
}
