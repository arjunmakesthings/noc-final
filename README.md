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
a p5.js sketch runs on a 'main' computer. this controls everything. 

draw() loops every 1/60th of a second. so, it is used as a state-manager. stages are the following: 






---

### old; 2604: 

made with aram pundak; april, 2026. 

---

title: artificial 'intelligence', machine 'learning' & human 'pressure'. 
description: 

---
# build notes: 

### equipment / parts: 
- two small computers docked on a station (computer-a & computer-b).
- punching glove + mechanism next to computer-a.
- projector projecting downwards on the floor.
- 26 switches coming into an arduino-mega.
- mac-mini connected to the arduino & projector, doing the computation.
- arduino mega needs to be connected to both monitors too (and send some kind of output). 

### basic flow:
- computer-a makes up a random 5-letter word. asks computer-b to guess it. 
- a person walks in space and presses keys with their legs. each key press has an audible reaction. 
- key-presses are shown in front as they're typed. 
- once 5 keys are pressed, the computer evaluates. 
- results are shown, computer-a scolds & hits computer-b. their reaction faces change.
- hints need to be given for the next one.


