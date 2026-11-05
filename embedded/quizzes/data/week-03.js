/* Embedded week 3 quiz: IoT connectivity and MQTT */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "3.1 Choosing a radio",
  "short": "Choosing a radio",
  "res": [
   [
    "Reread lesson 3.1",
    "../weeks/week-03.html#w3-l1"
   ]
  ]
 },
 "l2": {
  "name": "3.2 MQTT",
  "short": "MQTT",
  "res": [
   [
    "Reread lesson 3.2",
    "../weeks/week-03.html#w3-l2"
   ],
   [
    "MQTT Essentials (video series)",
    "https://dev.to/hivemq/the-mqtt-essentials-are-back-new-hivemq-video-series-1d49"
   ]
  ]
 },
 "l3": {
  "name": "3.3 From device to dashboard",
  "short": "From device to dashboard",
  "res": [
   [
    "Reread lesson 3.3",
    "../weeks/week-03.html#w3-l3"
   ]
  ]
 },
 "l4": {
  "name": "3.4 Fleets and security",
  "short": "Fleets",
  "res": [
   [
    "Reread lesson 3.4",
    "../weeks/week-03.html#w3-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t3q01",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Radio choice",
  "p": "A smart light bulb in a home needs low power, works with a hub, and should relay messages for other devices. Which fits best?",
  "o": [
   "Zigbee or Thread (mesh)",
   "UART",
   "LoRaWAN",
   "Cellular"
  ],
  "a": 0,
  "e": "Mesh networks let mains-powered devices relay for others.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Trade-offs",
  "p": "What three properties do wireless technologies trade against each other?",
  "o": [
   "Range, data rate and power",
   "Voltage, current and resistance",
   "Latency, jitter and security",
   "Cost, colour and size"
  ],
  "a": 0,
  "e": "You rarely get all three.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q03",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Pub/sub",
  "p": "What's the main benefit of MQTT's publish/subscribe model?",
  "o": [
   "It's encrypted by default",
   "It's faster than TCP",
   "It needs no server",
   "Publishers and subscribers are decoupled through the broker, so you can add consumers without changing devices"
  ],
  "a": 3,
  "e": "A new dashboard or logger is just another subscriber.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Wildcards",
  "p": "Which subscription receives every message under garden, at any depth?",
  "o": [
   "garden/*",
   "#/garden",
   "garden/#",
   "garden/+"
  ],
  "a": 2,
  "e": "# matches all remaining levels and must be last.",
  "s": "Do the topic_matches task."
 },
 {
  "id": "t3q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "QoS 1",
  "p": "What can happen with QoS 1 that can't with QoS 2?",
  "o": [
   "A message can be delivered more than once",
   "Messages arrive encrypted",
   "Messages are lost",
   "The broker stores messages"
  ],
  "a": 0,
  "e": "At-least-once delivery means duplicates; handle them idempotently.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q06",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Retained",
  "p": "A new dashboard subscribes and immediately shows each device's current status. Which feature makes that possible?",
  "o": [
   "Retained messages on the status topics",
   "Keepalive",
   "Last will alone",
   "QoS 2"
  ],
  "a": 0,
  "e": "The broker keeps the last retained message per topic for new subscribers.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Store and forward",
  "p": "Why cap the size of a device's offline buffer, dropping the oldest readings when full?",
  "o": [
   "A long outage would otherwise exhaust the device's small RAM and crash it; recent data is usually most valuable",
   "To save power",
   "To avoid duplicates",
   "MQTT limits it"
  ],
  "a": 0,
  "e": "Bounded buffers fail gracefully.",
  "s": "Do the Outbox task."
 },
 {
  "id": "t3q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Payload size",
  "p": "You're sending readings over LoRaWAN, where airtime is precious. What payload format should you use?",
  "o": [
   "A compact binary encoding (for example two bytes for moisture × 10, one for battery)",
   "Pretty-printed JSON",
   "XML",
   "CSV with headers"
  ],
  "a": 0,
  "e": "Every byte costs airtime and battery on LoRa.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Device identity",
  "p": "Why give each device its own credentials instead of one shared password?",
  "o": [
   "Brokers require it",
   "It's faster",
   "It saves memory",
   "A compromised device can be revoked without affecting others, and access rules can be per device"
  ],
  "a": 3,
  "e": "Shared secrets mean one leak compromises the fleet.",
  "s": "Reread lesson 3.4."
 },
 {
  "id": "t3q10",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Secrets in git",
  "p": "Where should your Wi-Fi password live in a MicroPython project you push to GitHub?",
  "o": [
   "In the README",
   "In a secrets.py file listed in .gitignore, with a committed secrets_example.py showing the format",
   "In a comment",
   "In main.py"
  ],
  "a": 1,
  "e": "Never commit credentials.",
  "s": "See Project 2's setup."
 }
];
window.AUDIT = Object.assign({
 "id": "embedded-03-quiz",
 "title": "Embedded Week 3 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-03.html",
  "label": "Week 3"
 },
 "lede": "IoT connectivity and MQTT. 10 questions; take it after the projects, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 3 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
