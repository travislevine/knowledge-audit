/* Thinking Skills week 1 quiz: Logic and arguments */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "1.1 Anatomy of an argument",
  "short": "Anatomy of an argument",
  "res": [
   [
    "Reread lesson 1.1",
    "../weeks/week-01.html#w1-l1"
   ]
  ]
 },
 "l2": {
  "name": "1.2 Validity, soundness and conditionals",
  "short": "Validity",
  "res": [
   [
    "Reread lesson 1.2",
    "../weeks/week-01.html#w1-l2"
   ],
   [
    "Video: How to Argue: Philosophical Reasoning",
    "https://www.youtube.com/watch?v=NKEhdsnKKHs"
   ]
  ]
 },
 "l3": {
  "name": "1.3 Deduction, induction and abduction",
  "short": "Deduction",
  "res": [
   [
    "Reread lesson 1.3",
    "../weeks/week-01.html#w1-l3"
   ]
  ]
 },
 "l4": {
  "name": "1.4 Fallacies and rhetorical tricks",
  "short": "Fallacies",
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
  "c": "Hidden premises",
  "p": "Why is identifying hidden premises so valuable when evaluating an argument?",
  "o": [
   "Hidden premises make an argument deductive",
   "They make arguments longer",
   "They're always false",
   "The weakest assumption is often the one nobody stated, so it was never examined"
  ],
  "a": 3,
  "e": "Stated premises have usually been thought about. Unstated ones haven't, so they're where flawed reasoning hides.",
  "s": "Practice writing out the full premise list for arguments you read."
 },
 {
  "id": "t1q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Steelmanning",
  "p": "In a design review you believe the proposal is wrong. Which approach is most likely to lead to a good decision?",
  "o": [
   "Point out every flaw quickly",
   "Ask the most senior person to decide",
   "Propose an alternative without discussing the original",
   "Restate the proposal at its strongest, confirm the author agrees, then raise your strongest objection"
  ],
  "a": 3,
  "e": "Charity makes sure you're arguing with the real proposal, and it makes others more willing to listen.",
  "s": "Reread lesson 1.1 on the principle of charity."
 },
 {
  "id": "t1q03",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Validity vs soundness",
  "p": "\"All birds can fly. Penguins are birds. So penguins can fly.\" How would you describe this argument?",
  "o": [
   "Inductive",
   "Invalid",
   "Valid but unsound: the form is fine but a premise is false",
   "Sound"
  ],
  "a": 2,
  "e": "The conclusion follows from the premises, so it's valid. The first premise is false, so it's unsound.",
  "s": "Review the difference between form (validity) and truth (soundness)."
 },
 {
  "id": "t1q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Affirming the consequent",
  "p": "\"If there's a memory leak, memory usage grows over time. Memory usage is growing. So there's a memory leak.\" What's wrong?",
  "o": [
   "Nothing: it's modus ponens",
   "It denies the antecedent",
   "It's circular",
   "It affirms the consequent: growing memory has other causes, like a cache filling up or more traffic"
  ],
  "a": 3,
  "e": "Q being true doesn't establish P when other things can cause Q.",
  "s": "Practice classifying the four conditional forms."
 },
 {
  "id": "t1q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Only if",
  "p": "A policy says \"You may deploy only if the tests pass.\" Which follows?",
  "o": [
   "If you deployed, the tests passed",
   "Passing tests are sufficient for deploying",
   "If the tests fail, you may still deploy with approval",
   "If the tests pass, you may deploy"
  ],
  "a": 0,
  "e": "\"P only if Q\" means \"if P then Q\": passing tests are necessary, not sufficient.",
  "s": "Translate a few \"only if\" requirements into if-then form."
 },
 {
  "id": "t1q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Induction",
  "p": "What determines the strength of an inductive generalization?",
  "o": [
   "Sample size, how representative the sample is, and whether there's a plausible mechanism",
   "How confident the person sounds",
   "Whether it's logically valid",
   "The number of premises"
  ],
  "a": 0,
  "e": "Induction can never be certain, only stronger or weaker, and these are the main factors.",
  "s": "Reread lesson 1.3."
 },
 {
  "id": "t1q07",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Abduction",
  "p": "Two hypotheses explain a bug: (A) a race condition between two threads, and (B) cosmic rays flipping bits. The bug happens about once a day, only under load. Which is the better explanation, and why?",
  "o": [
   "Neither, until you have proof",
   "A: it explains the load dependence, fits what's known about the code, and suggests a test",
   "B: it's more unusual",
   "Both are equally good"
  ],
  "a": 1,
  "e": "Good explanations account for all the evidence (the load pattern), are plausible given background knowledge, and are testable.",
  "s": "Practice listing what each hypothesis predicts."
 },
 {
  "id": "t1q08",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "False dilemma",
  "p": "\"Either we hire three more engineers or we miss the deadline.\" What's the best response?",
  "o": [
   "Point out other options exist, such as cutting scope, moving the date or reducing other work",
   "Call it a slippery slope",
   "Agree: those are the options",
   "Argue for hiring four"
  ],
  "a": 0,
  "e": "A false dilemma hides alternatives. Scope, time and quality are usually adjustable too.",
  "s": "Review the list of fallacies in lesson 1.4."
 },
 {
  "id": "t1q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Appeal to authority",
  "p": "When is relying on an authority reasonable rather than a fallacy?",
  "o": [
   "When they're famous",
   "Never",
   "Whenever they're senior",
   "When the authority speaks within their expertise and reflects a broad consensus of experts"
  ],
  "a": 3,
  "e": "Expert consensus within its domain is good evidence. The fallacy is deferring outside expertise, or ignoring that experts disagree.",
  "s": "Reread the authority bullet in lesson 1.4."
 },
 {
  "id": "t1q10",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Motte and bailey",
  "p": "Someone claims \"AI will replace all programmers within five years.\" Challenged, they say \"I just mean AI tools will change how programmers work.\" Later they repeat the first claim. What is this?",
  "o": [
   "A valid argument",
   "An ad hominem",
   "A straw man",
   "Motte and bailey: retreating to a defensible claim when challenged, then returning to the bold one"
  ],
  "a": 3,
  "e": "Pin down which claim is being made, and evaluate that one.",
  "s": "Reread lesson 1.4."
 }
];
window.AUDIT = Object.assign({
 "id": "thinking-01-quiz",
 "title": "Thinking Skills Week 1 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-01.html",
  "label": "Week 1"
 },
 "lede": "Logic and arguments. 10 questions; take it after the exercise, without notes.",
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
