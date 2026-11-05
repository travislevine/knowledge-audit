/* Thinking Skills week 3 quiz: Cognitive biases and judgement */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "3.1 Two systems of thinking",
  "short": "Two systems of thinking",
  "res": [
   [
    "Reread lesson 3.1",
    "../weeks/week-03.html#w3-l1"
   ]
  ]
 },
 "l2": {
  "name": "3.2 Biases that matter most",
  "short": "Biases that matter most",
  "res": [
   [
    "Reread lesson 3.2",
    "../weeks/week-03.html#w3-l2"
   ],
   [
    "Video: The Most Common Cognitive Bias",
    "https://www.youtube.com/watch?v=vKA4w2O61Xo"
   ]
  ]
 },
 "l3": {
  "name": "3.3 Overconfidence and the planning fallacy",
  "short": "Overconfidence",
  "res": [
   [
    "Reread lesson 3.3",
    "../weeks/week-03.html#w3-l3"
   ]
  ]
 },
 "l4": {
  "name": "3.4 Debiasing that works",
  "short": "Debiasing that works",
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
  "k": "concept",
  "c": "Bat and ball",
  "p": "Why do most people answer the bat-and-ball question wrongly?",
  "o": [
   "System 1 produces a plausible answer instantly and System 2 doesn't check it",
   "They're tired",
   "It's ambiguous",
   "They lack arithmetic skills"
  ],
  "a": 0,
  "e": "The error isn't about ability; it's about not engaging deliberate checking.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Trusting intuition",
  "p": "A venture capitalist with 20 years' experience feels strongly that a startup will succeed. How much weight should that intuition get?",
  "o": [
   "Limited: startup outcomes are noisy and feedback takes years, so intuition has had little chance to calibrate",
   "Total, if they've had successes",
   "None at all",
   "A lot: 20 years is plenty"
  ],
  "a": 0,
  "e": "Experience only builds reliable intuition with regular environments and fast feedback.",
  "s": "Reread the end of lesson 3.1."
 },
 {
  "id": "t3q03",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Confirmation bias",
  "p": "You suspect a cache bug. You find one log line consistent with it and start writing a fix. What's the bias-resistant next step?",
  "o": [
   "Ship the fix",
   "Find more logs that agree",
   "Ask a colleague to approve the fix",
   "Ask what you'd expect to see if the cache were not the cause, and check for that"
  ],
  "a": 3,
  "e": "Look for disconfirming evidence: it's far more informative than more confirming evidence.",
  "s": "Reread confirmation bias in lesson 3.2."
 },
 {
  "id": "t3q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Availability",
  "p": "After a widely reported data breach, a company spends heavily on the exact attack type in the news while ignoring more common risks. Which bias?",
  "o": [
   "Framing",
   "Sunk cost",
   "Availability: vivid, recent events feel more likely than they are",
   "Anchoring"
  ],
  "a": 2,
  "e": "Base risk decisions on frequency data, not on what comes to mind.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Resulting",
  "p": "What does it mean to judge a decision by its process rather than its outcome?",
  "o": [
   "Ask whether the decision was reasonable given what was known then, since good decisions can have bad outcomes through luck",
   "Always blame the process",
   "Outcomes don't matter",
   "Ignore results entirely"
  ],
  "a": 0,
  "e": "Confusing decision quality with outcome quality teaches the wrong lessons.",
  "s": "Reread the end of lesson 3.2."
 },
 {
  "id": "t3q06",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Framing",
  "p": "Option A is described as \"saves 200 of 600 jobs\"; option B as \"400 of 600 jobs lost\". They're identical, yet people prefer A. What's the defense?",
  "o": [
   "Restate options in a common, neutral form (and in both gain and loss terms) before deciding",
   "Ignore the numbers",
   "Choose the riskier option",
   "Always pick the first option"
  ],
  "a": 0,
  "e": "Rewriting in a consistent frame removes the effect of wording.",
  "s": "Reread framing in lesson 3.2."
 },
 {
  "id": "t3q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Planning fallacy",
  "p": "What's the main cause of the planning fallacy?",
  "o": [
   "Taking the inside view, which lists only foreseeable steps and leaves out the unforeseen problems that delay most projects",
   "Laziness",
   "Too much data",
   "Bad managers"
  ],
  "a": 0,
  "e": "The outside view (reference class forecasting) corrects for it.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Reference class",
  "p": "Which is the best reference class for estimating how long your team's next API integration will take?",
  "o": [
   "Your team's past integrations of similar size, including the ones that overran",
   "Your most successful integration",
   "The vendor's estimate",
   "Industry averages for all software projects"
  ],
  "a": 0,
  "e": "The closer and more complete the reference class, the better the baseline.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Premortem",
  "p": "Why does a premortem surface more risks than asking \"does anyone have concerns?\"",
  "o": [
   "It uses a checklist",
   "It takes longer",
   "It removes the leader",
   "It assumes failure has happened and makes finding reasons the task, so raising doubts is expected rather than disloyal"
  ],
  "a": 3,
  "e": "It changes the social situation, which is what suppresses doubts.",
  "s": "Reread lesson 3.4."
 },
 {
  "id": "t3q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Process over awareness",
  "p": "Why do debiasing techniques focus on process rather than on learning the list of biases?",
  "o": [
   "Biases don't exist",
   "Awareness alone barely reduces biases; changing how decisions are made (independent estimates, criteria first, premortems) does",
   "Process is cheaper",
   "Lists are too long"
  ],
  "a": 1,
  "e": "Build the defenses into how you and your team work.",
  "s": "Reread lesson 3.4."
 }
];
window.AUDIT = Object.assign({
 "id": "thinking-03-quiz",
 "title": "Thinking Skills Week 3 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-03.html",
  "label": "Week 3"
 },
 "lede": "Cognitive biases and judgement. 10 questions; take it after the exercise, without notes.",
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
