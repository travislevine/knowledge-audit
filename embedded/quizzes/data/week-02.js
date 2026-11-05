/* Embedded week 2 quiz: Sensors, actuators and buses */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "2.1 Analog sensors and the ADC",
  "short": "Analog sensors",
  "res": [
   [
    "Reread lesson 2.1",
    "../weeks/week-02.html#w2-l1"
   ]
  ]
 },
 "l2": {
  "name": "2.2 PWM and driving actuators",
  "short": "PWM",
  "res": [
   [
    "Reread lesson 2.2",
    "../weeks/week-02.html#w2-l2"
   ]
  ]
 },
 "l3": {
  "name": "2.3 UART, I2C and SPI",
  "short": "UART",
  "res": [
   [
    "Reread lesson 2.3",
    "../weeks/week-02.html#w2-l3"
   ],
   [
    "Reading: I2C, SPI and UART compared",
    "https://www.mischianti.org/2022/04/13/i2c-spi-and-uart-compared/"
   ]
  ]
 },
 "l4": {
  "name": "2.4 Taming noisy data",
  "short": "Taming noisy data",
  "res": [
   [
    "Reread lesson 2.4",
    "../weeks/week-02.html#w2-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t2q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "ADC resolution",
  "p": "What does a 10-bit ADC with a 5 V reference give you?",
  "o": [
   "A maximum of 10 V",
   "10 mV accuracy",
   "10 readings per second",
   "1024 steps of about 4.9 mV"
  ],
  "a": 3,
  "e": "2¹⁰ = 1024 steps across 0–5 V.",
  "s": "Reread lesson 2.1."
 },
 {
  "id": "t2q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "ESP32 ADC2",
  "p": "Your ESP32 sensor reads fine until you enable Wi-Fi, then reads garbage. Why?",
  "o": [
   "The sensor is resistive",
   "The ADC needs attenuation",
   "The sensor is on an ADC2 pin, which can't be used while Wi-Fi is active; move it to an ADC1 pin (GPIO 32–39)",
   "Wi-Fi uses too much power"
  ],
  "a": 2,
  "e": "A well-known ESP32 limitation.",
  "s": "Reread lesson 2.1."
 },
 {
  "id": "t2q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Calibration",
  "p": "Why must you calibrate each soil moisture sensor individually?",
  "o": [
   "Calibration makes it waterproof",
   "Raw readings vary between units and installations, so you need your own dry and wet reference points",
   "It doesn't matter",
   "The formula changes with temperature only"
  ],
  "a": 1,
  "e": "Record dry and wet readings, then map between them.",
  "s": "Do Project 1's calibration step."
 },
 {
  "id": "t2q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Servos",
  "p": "How does a hobby servo know which angle to move to?",
  "o": [
   "From I2C commands",
   "From the pulse width, typically 1–2 ms repeated every 20 ms",
   "From the supply voltage",
   "From the PWM duty cycle's average voltage"
  ],
  "a": 1,
  "e": "Servos decode pulse width, not average voltage.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Flyback diode",
  "p": "Why put a diode across a relay coil or motor?",
  "o": [
   "To reverse the motor",
   "To make it faster",
   "To reduce power use",
   "To absorb the voltage spike the inductive load produces when switched off, protecting the transistor"
  ],
  "a": 3,
  "e": "Inductors resist changes in current, producing a spike at switch-off.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q06",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Switching a pump",
  "p": "Which component lets an ESP32 vary a 12 V DC pump's speed?",
  "o": [
   "A resistor",
   "A relay module",
   "The 3.3 V pin directly",
   "A logic-level N-channel MOSFET driven by PWM, with a flyback diode"
  ],
  "a": 3,
  "e": "Relays can't switch fast enough for PWM; MOSFETs can.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "I2C addressing",
  "p": "How does an I2C controller choose which of several devices to talk to?",
  "o": [
   "A separate chip-select pin for each",
   "Each device has an address, sent at the start of every transaction",
   "Different voltages",
   "Different baud rates"
  ],
  "a": 1,
  "e": "Scan the bus to see which addresses respond.",
  "s": "Reread lesson 2.3."
 },
 {
  "id": "t2q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Fast display",
  "p": "You need to update a colour display quickly. Which bus is the usual choice?",
  "o": [
   "UART at 9600 baud",
   "SPI, which runs at many MHz",
   "Analog",
   "I2C at 100 kHz"
  ],
  "a": 1,
  "e": "SPI is the fastest of the three.",
  "s": "Reread the table in lesson 2.3."
 },
 {
  "id": "t2q09",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Two's complement",
  "p": "A sensor's 12-bit two's complement reading is 0xFF0 (in units of 0.0625 °C). What's the temperature?",
  "o": [
   "-1 °C",
   "255 °C",
   "-0.0625 °C",
   "4080 °C"
  ],
  "a": 0,
  "e": "0xFF0 = 4080; minus 4096 = −16; × 0.0625 = −1 °C.",
  "s": "Do the decode_tmp102 task in the mini-project."
 },
 {
  "id": "t2q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Median vs mean",
  "p": "Why does a median filter handle occasional spikes better than a moving average?",
  "o": [
   "It uses less memory",
   "The median ignores extreme values, while a single spike shifts the mean",
   "It has no lag",
   "It's faster"
  ],
  "a": 1,
  "e": "Use a median for glitches, an average or EMA for steady noise.",
  "s": "Reread lesson 2.4."
 }
];
window.AUDIT = Object.assign({
 "id": "embedded-02-quiz",
 "title": "Embedded Week 2 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-02.html",
  "label": "Week 2"
 },
 "lede": "Sensors, actuators and buses. 10 questions; take it after the projects, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 2 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
