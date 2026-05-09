let socket;

function setup() {
  createCanvas(800, 800);

  // connect to OSC bridge (Node / Max / TouchDesigner)
  socket = new WebSocket("ws://localhost:8080");

  socket.onopen = () => {
    console.log("OSC bridge connected");
  };
}

function draw() {
  background(0);
  fill(255);
  text("click to speak test", 20, 20);
}

function mousePressed() {
  userStartAudio();

  speak("host", "hello from host");
  speak("machine", "hello from machine");
}

// THIS replaces p5.Speech completely
function speak(channel, text) {
  let msg = {
    channel: channel, // "host" or "machine"
    text: text,
  };

  socket.send(JSON.stringify(msg));
}
