//untitled; arjun; month, 2026.

/*
ask: 

*/

/*
thought: 

*/

let speech;

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
}

function mousePressed() {
  speech.speak("guess this stupid word");
}
