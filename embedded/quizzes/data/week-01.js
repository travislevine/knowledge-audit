/* Embedded week 1 quiz: Microcontrollers, GPIO and timing */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "1.1 Microcontrollers vs single-board computers",
  "short": "Microcontrollers vs single-board computers",
  "res": [
   [
    "Reread lesson 1.1",
    "../weeks/week-01.html#w1-l1"
   ]
  ]
 },
 "l2": {
  "name": "1.2 Digital pins and basic electronics",
  "short": "Digital pins",
  "res": [
   [
    "Reread lesson 1.2",
    "../weeks/week-01.html#w1-l2"
   ]
  ]
 },
 "l3": {
  "name": "1.3 Timing, interrupts and debouncing",
  "short": "Timing",
  "res": [
   [
    "Reread lesson 1.3",
    "../weeks/week-01.html#w1-l3"
   ],
   [
    "Video: How to Use Interrupts",
    "https://docs.sunfounder.com/projects/beginners-lab-kit/en/latest/videos/video24_interrupt.html"
   ]
  ]
 },
 "l4": {
  "name": "1.4 State machines",
  "short": "State machines",
  "res": [
   [
    "Reread lesson 1.4",
    "../weeks/week-01.html#w1-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t1q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "MCU vs SBC",
  "p": "What's the main reason to put a microcontroller rather than a Raspberry Pi at the edge of an IoT system?",
  "o": [
   "MCUs run Linux",
   "MCUs have more memory",
   "MCUs are easier to program",
   "Low power, low cost, instant start-up and predictable timing"
  ],
  "a": 3,
  "e": "The Pi is better as a gateway or server. MCUs are better as many small, cheap, low-power nodes.",
  "s": "Reread lesson 1.1."
 },
 {
  "id": "t1q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Analog input",
  "p": "You want to read your analog soil moisture sensor with a Raspberry Pi. What do you need?",
  "o": [
   "Nothing: connect it to any GPIO",
   "A pull-up resistor",
   "A 5 V pin",
   "An external ADC chip (like an MCP3008 over SPI), or a microcontroller that reads it and sends the value"
  ],
  "a": 3,
  "e": "The Pi has no analog inputs. Its GPIO pins only read high or low.",
  "s": "Reread the comparison table in lesson 1.1."
 },
 {
  "id": "t1q03",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "LED resistor",
  "p": "An LED drops 2 V and you want about 10 mA from a 5 V Arduino pin. Roughly what resistor?",
  "o": [
   "No resistor needed",
   "3 kΩ",
   "300 Ω",
   "30 Ω"
  ],
  "a": 2,
  "e": "R = (5 − 2) / 0.01 = 300 Ω; 330 Ω is the nearest standard value.",
  "s": "Practice Ohm's law calculations."
 },
 {
  "id": "t1q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Logic levels",
  "p": "Why must you be careful connecting a 5 V sensor's output to an ESP32 pin?",
  "o": [
   "The ESP32 reads it as 0",
   "It needs a pull-up",
   "5 V is too slow",
   "ESP32 pins are 3.3 V and aren't 5 V tolerant, so the higher voltage can damage them; use a divider or level shifter"
  ],
  "a": 3,
  "e": "Match logic levels, and share grounds.",
  "s": "Reread lesson 1.2."
 },
 {
  "id": "t1q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Pull-ups",
  "p": "With a button wired from a pin to ground and the internal pull-up enabled, what does the pin read when the button is pressed?",
  "o": [
   "0",
   "It alternates",
   "It floats",
   "1"
  ],
  "a": 0,
  "e": "Pressing connects the pin to ground, so it reads 0. Released, the pull-up holds it at 1.",
  "s": "Reread lesson 1.2."
 },
 {
  "id": "t1q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Blocking",
  "p": "Why is time.sleep() (or delay()) in the main loop usually a mistake?",
  "o": [
   "Nothing else can run while it waits, so inputs and network events are missed",
   "It's inaccurate",
   "It wastes battery",
   "It's deprecated"
  ],
  "a": 0,
  "e": "Use elapsed-time checks so the loop keeps running.",
  "s": "Reread lesson 1.3."
 },
 {
  "id": "t1q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Bounce",
  "p": "Why can one press of a mechanical button be counted several times?",
  "o": [
   "The interrupt fires twice by design",
   "The contacts bounce, making and breaking contact for a few milliseconds",
   "Electrical noise from Wi-Fi",
   "The pin is floating"
  ],
  "a": 1,
  "e": "Debounce by requiring the input to be stable for 20–50 ms.",
  "s": "Do this week's mini-project."
 },
 {
  "id": "t1q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "ISR design",
  "p": "An ISR on a flow-meter pin must count pulses. What should it do?",
  "o": [
   "Calculate litres per minute and print it",
   "Send the count over Wi-Fi",
   "Increment a counter and return",
   "Wait for the next pulse"
  ],
  "a": 2,
  "e": "Do the minimum in the ISR; compute and report in the main loop.",
  "s": "Reread lesson 1.3."
 },
 {
  "id": "t1q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "State machines",
  "p": "What makes a finite state machine easier to verify than flag-based logic?",
  "o": [
   "It needs no timers",
   "It uses less code",
   "It runs faster",
   "The device is always in exactly one known state, and every transition is explicit, so you can enumerate and test them"
  ],
  "a": 3,
  "e": "You can draw it, test each transition and rule out invalid combinations.",
  "s": "Reread lesson 1.4."
 },
 {
  "id": "t1q10",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Fail safe",
  "p": "Which state should a watering controller enter when it can't trust its sensor?",
  "o": [
   "Restart repeatedly",
   "Water continuously",
   "Keep doing whatever it was doing",
   "A fault state with the pump off, and an alert"
  ],
  "a": 3,
  "e": "Default to the state that can't cause harm (flooding, burning out a dry-running pump).",
  "s": "Reread lesson 1.4."
 }
];
window.AUDIT = Object.assign({
 "id": "embedded-01-quiz",
 "title": "Embedded Week 1 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-01.html",
  "label": "Week 1"
 },
 "lede": "Microcontrollers, GPIO and timing. 10 questions; take it after the projects, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 1 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
