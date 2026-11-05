/* Embedded week 4 quiz: Control, power and reliable devices */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "4.1 Control loops",
  "short": "Control loops",
  "res": [
   [
    "Reread lesson 4.1",
    "../weeks/week-04.html#w4-l1"
   ],
   [
    "Video: What Is PID Control? (11 min)",
    "https://au.mathworks.com/videos/understanding-pid-control-part-1-what-is-pid-control--1527089264373.html"
   ]
  ]
 },
 "l2": {
  "name": "4.2 Power and batteries",
  "short": "Power",
  "res": [
   [
    "Reread lesson 4.2",
    "../weeks/week-04.html#w4-l2"
   ]
  ]
 },
 "l3": {
  "name": "4.3 Reliability and fail-safes",
  "short": "Reliability",
  "res": [
   [
    "Reread lesson 4.3",
    "../weeks/week-04.html#w4-l3"
   ]
  ]
 },
 "l4": {
  "name": "4.4 Testing and the road to a product",
  "short": "Testing",
  "res": [
   [
    "Reread lesson 4.4",
    "../weeks/week-04.html#w4-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t4q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Hysteresis",
  "p": "What problem does hysteresis solve in on/off control?",
  "o": [
   "Slow response",
   "Integral windup",
   "Rapid on/off switching (chatter) when the measurement is near a single threshold",
   "Sensor drift"
  ],
  "a": 2,
  "e": "Two thresholds create a band where the current state is held.",
  "s": "Reread lesson 4.1."
 },
 {
  "id": "t4q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Soak delay",
  "p": "Water takes 3 minutes to reach your sensor. What's the risk of watering until the sensor reads wet?",
  "o": [
   "The pump runs dry",
   "None",
   "The sensor breaks",
   "Overshoot: by the time the sensor responds you've overwatered; water in bursts and wait between them"
  ],
  "a": 3,
  "e": "Delays in a loop cause overshoot and oscillation.",
  "s": "Reread lesson 4.1."
 },
 {
  "id": "t4q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Derivative",
  "p": "What does the D term in a PID controller respond to?",
  "o": [
   "How fast the error is changing",
   "The sensor's noise level",
   "The total accumulated error",
   "The setpoint"
  ],
  "a": 0,
  "e": "D damps overshoot, but amplifies noise.",
  "s": "Watch the MathWorks PID video."
 },
 {
  "id": "t4q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Battery life",
  "p": "A node averages 0.5 mA. Roughly how long does a 1000 mAh battery last, allowing 80% usable capacity?",
  "o": [
   "About 2 years",
   "About 20 hours",
   "About 67 days",
   "About 2 days"
  ],
  "a": 2,
  "e": "800 mAh / 0.5 mA = 1600 h ≈ 67 days.",
  "s": "Do the battery_life_days task."
 },
 {
  "id": "t4q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Deep sleep",
  "p": "What must firmware account for when an ESP32 wakes from deep sleep?",
  "o": [
   "Wi-Fi stays connected",
   "It resumes exactly where it stopped",
   "Nothing",
   "It restarts from the beginning of the program, so variables are lost unless saved in RTC memory or flash"
  ],
  "a": 3,
  "e": "Deep sleep is close to a reset.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q06",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Radio cost",
  "p": "What's usually the biggest power cost on a battery IoT node?",
  "o": [
   "Flash storage",
   "Reading sensors",
   "The CPU doing calculations",
   "The radio: connecting and transmitting"
  ],
  "a": 3,
  "e": "Send less, less often, and sleep.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Watchdog",
  "p": "What does a watchdog timer do?",
  "o": [
   "Logs errors",
   "Encrypts firmware",
   "Prevents brownouts",
   "Resets the device if the firmware stops feeding it, recovering from hangs"
  ],
  "a": 3,
  "e": "Feed it from the healthy main loop only.",
  "s": "Reread lesson 4.3."
 },
 {
  "id": "t4q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Safe default",
  "p": "Which wiring choice is fail-safe for a pump?",
  "o": [
   "The pump runs only when the control pin actively drives the switch on; a reset or unpowered MCU leaves it off",
   "It doesn't matter",
   "Use two relays in parallel",
   "The pump runs when the control pin is low"
  ],
  "a": 0,
  "e": "During boot and resets pins float or are low; that state must mean off.",
  "s": "Reread lesson 4.3."
 },
 {
  "id": "t4q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Testable firmware",
  "p": "What's the key design choice that makes firmware logic testable on a laptop?",
  "o": [
   "Avoiding classes",
   "Using more interrupts",
   "Using MicroPython",
   "Separating decision logic (pure functions taking readings and time) from the thin layer that touches hardware"
  ],
  "a": 3,
  "e": "Inject time and readings; return actions.",
  "s": "Look at how the mini-projects are structured."
 },
 {
  "id": "t4q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Certification",
  "p": "Why can't you sell a Wi-Fi device in Australia straight off the breadboard?",
  "o": [
   "Radio devices need regulatory compliance (RCM), and products need proper PCBs, enclosures and safety testing",
   "You need a patent",
   "Breadboards are illegal",
   "Wi-Fi is restricted"
  ],
  "a": 0,
  "e": "Using pre-certified radio modules like the ESP32 modules simplifies certification.",
  "s": "Reread lesson 4.4."
 }
];
window.AUDIT = Object.assign({
 "id": "embedded-04-quiz",
 "title": "Embedded Week 4 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-04.html",
  "label": "Week 4"
 },
 "lede": "Control, power and reliable devices. 10 questions; take it after the projects, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 4 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
