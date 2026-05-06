made with aram pundak; april, 2026. 

---

### title: 
can you beat a 1-byte-per-second computer? 

### description: 
we live in a world where 'intelligence' is highly-debated. with technology & artificial 'intelligence' on the rise, human-beings are increasingly faced with absurd questions such as am i smarter than a machine? and, if so, for how long; by how much; and in what? 

this forms a compelling premise for a showdown.

in this installation, aram & arjun invite you to go head-on with a barebones machine — capable of thinking in 1-byte-per-second — in a game of wordle. the machine learns with every guess that is made in the round, with a genetic algorithm, and gets better as you or it gets closer to the answer. the first one to get the answer right is declared superior than the other.  

---

### how it works: 
-> add video 

---

# build notes: 

### equipment / parts: 
- 1x mac-mini, power.
- 1x big display unit, power, hdmi -> hdmi. 
- 1x arduino zero + type-c -> type-c cable.
- 2x 32 x 32 led-matrix + 2x rgb-matrix-driver-boards. 
- 2x high-torque d.c. motors. 
- 1x variable power supply to power motors at 24v. 
- 1x motor control circuit (tip 102s, breaking grounds) on a breadboard. 
- 2x display casing — one for host, one for machine.
- 2x slap hands, tripods for mounting. 
- 3x pedestals. 
- 1x usb -> usb keyboard. 
- 1x jbl-speaker, 3.5 -> 3.5 cable.

### system: 
a p5.js sketch runs on a 'main' computer (mac-mini). this controls everything. 

the arduino is flashed beforehand, and communicates via serial with p5. this controls the facial-expressions on the led-matrix & motors. 

### file-structure:
- /main 
    - `main.js` is the script that controls everything, via a p5.js sketch. 
    - `words.json` contains a list of all english words. 
    - `index.html` is what is displayed on any browser. we also load the libraries here.
    - `dialogues.json` contains all dialogues that are spoken from this system. this is done this way to have the option of variance for each dialogue (since stages are finite, but may be repeated). 

### algorithm: 
arjun to write later. 

---