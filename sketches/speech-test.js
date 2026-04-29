/*
all voices, from this example: https://idmnyu.github.io/p5.js-speech/examples/01simple.html

Samantha
Albert
Alice
Alva
Amélie
Amira
Anna
Bad News
Bahh
Bells
Boing
Bubbles
Carmit
Cellos
Damayanti
Daniel
Daria
Eddy (English (United States))
Eddy (English (United Kingdom))
Eddy (Chinese (China mainland))
Eddy (Chinese (Taiwan))
Eddy (German (Germany))
Eddy (Spanish (Spain))
Eddy (Spanish (Mexico))
Eddy (Finnish (Finland))
Eddy (French (Canada))
Eddy (French (France))
Eddy (Italian (Italy))
Eddy (Japanese (Japan))
Eddy (Korean (South Korea))
Eddy (Portuguese (Brazil))
Ellen
Flo (English (United States))
Flo (English (United Kingdom))
Flo (Chinese (China mainland))
Flo (Chinese (Taiwan))
Flo (German (Germany))
Flo (Spanish (Spain))
Flo (Spanish (Mexico))
Flo (Finnish (Finland))
Flo (French (Canada))
Flo (French (France))
Flo (Italian (Italy))
Flo (Japanese (Japan))
Flo (Korean (South Korea))
Flo (Portuguese (Brazil))
Fred
Geeta
Good News
Grandma (English (United States))
Grandma (English (United Kingdom))
Grandma (Chinese (China mainland))
Grandma (Chinese (Taiwan))
Grandma (German (Germany))
Grandma (Spanish (Spain))
Grandma (Spanish (Mexico))
Grandma (Finnish (Finland))
Grandma (French (Canada))
Grandma (French (France))
Grandma (Italian (Italy))
Grandma (Japanese (Japan))
Grandma (Korean (South Korea))
Grandma (Portuguese (Brazil))
Grandpa (English (United States))
Grandpa (English (United Kingdom))
Grandpa (Chinese (China mainland))
Grandpa (Chinese (Taiwan))
Grandpa (German (Germany))
Grandpa (Spanish (Spain))
Grandpa (Spanish (Mexico))
Grandpa (Finnish (Finland))
Grandpa (French (Canada))
Grandpa (French (France))
Grandpa (Italian (Italy))
Grandpa (Japanese (Japan))
Grandpa (Korean (South Korea))
Grandpa (Portuguese (Brazil))
Ioana
Jacques
Jester
Joana
Junior
Kanya
Karen
Kathy
Kyoko
Lana
Laura
Lekha
Lesya
Linh
Luciana
Majed
Meijia
Melina
Milena
Moira
Montse
Mónica
Nora
Organ
Paulina
Piya
Ralph
Reed (English (United States))
Reed (English (United Kingdom))
Reed (Chinese (China mainland))
Reed (Chinese (Taiwan))
Reed (German (Germany))
Reed (Spanish (Spain))
Reed (Spanish (Mexico))
Reed (Finnish (Finland))
Reed (French (Canada))
Reed (Italian (Italy))
Reed (Japanese (Japan))
Reed (Korean (South Korea))
Reed (Portuguese (Brazil))
Rishi
Rocko (English (United States))
Rocko (English (United Kingdom))
Rocko (Chinese (China mainland))
Rocko (Chinese (Taiwan))
Rocko (German (Germany))
Rocko (Spanish (Spain))
Rocko (Spanish (Mexico))
Rocko (Finnish (Finland))
Rocko (French (Canada))
Rocko (French (France))
Rocko (Italian (Italy))
Rocko (Japanese (Japan))
Rocko (Korean (South Korea))
Rocko (Portuguese (Brazil))
Sandy (English (United States))
Sandy (English (United Kingdom))
Sandy (Chinese (China mainland))
Sandy (Chinese (Taiwan))
Sandy (German (Germany))
Sandy (Spanish (Spain))
Sandy (Spanish (Mexico))
Sandy (Finnish (Finland))
Sandy (French (Canada))
Sandy (French (France))
Sandy (Italian (Italy))
Sandy (Japanese (Japan))
Sandy (Korean (South Korea))
Sandy (Portuguese (Brazil))
Sara
Satu
Shelley (English (United States))
Shelley (English (United Kingdom))
Shelley (Chinese (China mainland))
Shelley (Chinese (Taiwan))
Shelley (German (Germany))
Shelley (Spanish (Spain))
Shelley (Spanish (Mexico))
Shelley (Finnish (Finland))
Shelley (French (Canada))
Shelley (French (France))
Shelley (Italian (Italy))
Shelley (Japanese (Japan))
Shelley (Korean (South Korea))
Shelley (Portuguese (Brazil))
Sinji
Soumya
Superstar
Tessa
Thomas
Tina
Tingting
Trinoids
Tünde
Vani
Whisper
Wobble
Xander
Yelda
Yuna
Zarvox
Zosia
Zuzana
Google Deutsch
Google US English
Google UK English Female
Google UK English Male
Google español
Google español de Estados Unidos
Google français
Google हिन्दी
Google Bahasa Indonesia
Google italiano
Google 日本語
Google 한국의
Google Nederlands
Google polski
Google português do Brasil
Google русский
Google 普通话（中国大陆）
Google 粤語（香港）
Google 國語（臺灣）

*/
let dialogs = ["hello", "bye bye"];

let speaker;
let tog = false;

function setup() {
  // createCanvas(1000, 562); //in 16:9 aspect ratio.
  createCanvas(800, 800); //square to handle calculations better.

  speaker = new Speaker();

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

  speaker.say(
    "we are basically playing wordle. the objective is to guess a 5-letter-english word. ",
    "Bad News",
  );

  // if (frameCount % 60 == 0) {
  //   tog = !tog;
  //   if (tog == true) {
  //     speaker.say("hello", "Eddy (English (United Kingdom))");
  //   } else {
  //     speaker.say("hello", "Boing");
  //   }
  // }
}

function mousePressed() {
  userStartAudio();
}

class Speaker {
  constructor() {
    this.speech = new p5.Speech();
  }
  say(txt, voice) {
    this.speech.setVoice(voice);
    this.speech.setRate(1.5); 
    this.speech.speak(txt);
  }
}
