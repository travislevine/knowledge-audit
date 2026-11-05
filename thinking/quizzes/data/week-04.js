/* Thinking Skills week 4 quiz: Problem solving and decision making */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "4.1 Defining and breaking down problems",
  "short": "Defining",
  "res": [
   [
    "Reread lesson 4.1",
    "../weeks/week-04.html#w4-l1"
   ]
  ]
 },
 "l2": {
  "name": "4.2 Root causes and first principles",
  "short": "Root causes",
  "res": [
   [
    "Reread lesson 4.2",
    "../weeks/week-04.html#w4-l2"
   ],
   [
    "Video: The First Principles Method Explained by Elon Musk",
    "https://www.youtube.com/watch?v=NV3sBlRgzTI"
   ]
  ]
 },
 "l3": {
  "name": "4.3 Making decisions",
  "short": "Making decisions",
  "res": [
   [
    "Reread lesson 4.3",
    "../weeks/week-04.html#w4-l3"
   ]
  ]
 },
 "l4": {
  "name": "4.4 Systems, incentives and second-order effects",
  "short": "Systems",
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
  "c": "Problem statements",
  "p": "What's wrong with the problem statement \"We need a mobile app\"?",
  "o": [
   "It's too short",
   "Mobile apps are expensive",
   "It's a solution, not a problem, so it rules out other answers before the real need is understood",
   "Nothing"
  ],
  "a": 2,
  "e": "State the underlying need: who struggles with what, measurably.",
  "s": "Reread lesson 4.1."
 },
 {
  "id": "t4q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "MECE",
  "p": "What does it mean for a problem breakdown to be MECE?",
  "o": [
   "Minimal and complete",
   "Measurable, efficient, clear and exact",
   "Managed by each team",
   "Mutually exclusive and collectively exhaustive: no overlaps and nothing missing"
  ],
  "a": 3,
  "e": "MECE breakdowns let you test each branch without double-counting or gaps.",
  "s": "Practice building issue trees."
 },
 {
  "id": "t4q03",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Reframing",
  "p": "Users complain an elevator is slow. Which response shows reframing?",
  "o": [
   "Recognize the complaint may be about waiting feeling slow, and consider mirrors or displays in the lobby",
   "Survey users",
   "Buy a faster elevator",
   "Ignore the complaints"
  ],
  "a": 0,
  "e": "Reframing reveals cheaper solutions to the underlying problem.",
  "s": "Reread lesson 4.1."
 },
 {
  "id": "t4q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Five whys",
  "p": "Which is the most useful end point for a five-whys analysis of an outage?",
  "o": [
   "\"Bad luck\"",
   "\"The disk filled up\"",
   "\"An engineer made a mistake\"",
   "A process or system change that would prevent the whole class of failure, like automated provisioning"
  ],
  "a": 3,
  "e": "Root causes are things you can change in the system, not people or chance.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "First principles",
  "p": "What distinguishes reasoning from first principles from reasoning by analogy?",
  "o": [
   "First principles ignores costs",
   "Analogy is always wrong",
   "First principles uses more data",
   "It rebuilds the answer from fundamental facts and constraints instead of copying how similar problems were solved"
  ],
  "a": 3,
  "e": "Analogy is fast and often right; first principles finds answers convention misses.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q06",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Widening options",
  "p": "A manager asks \"should we hire a contractor or not?\" What's the most useful first response?",
  "o": [
   "Delay",
   "Ask for a budget",
   "Answer yes or no",
   "Widen the options: reprioritize work, train someone internally, buy a tool, or hire part-time"
  ],
  "a": 3,
  "e": "Two-option framings are a known predictor of poor decisions.",
  "s": "Reread lesson 4.3."
 },
 {
  "id": "t4q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Criteria first",
  "p": "Why set and weight criteria before scoring options?",
  "o": [
   "It's faster",
   "To involve more people",
   "Criteria don't matter",
   "It prevents choosing a favorite and then rationalizing criteria to fit it"
  ],
  "a": 3,
  "e": "Deciding what matters before seeing the options counters bias.",
  "s": "Reread lesson 4.3."
 },
 {
  "id": "t4q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Reversibility",
  "p": "Which decision deserves the most deliberation?",
  "o": [
   "Signing a five-year exclusive contract with a vendor",
   "Picking a name for a feature flag",
   "Trying a new meeting format for a month",
   "Choosing a code formatter"
  ],
  "a": 0,
  "e": "It's a one-way door: costly or impossible to reverse.",
  "s": "Reread two-way and one-way doors."
 },
 {
  "id": "t4q09",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Reinforcing loops",
  "p": "An overloaded service times out, clients retry, and the extra retries make it more overloaded. What kind of feedback is this, and what's a fix?",
  "o": [
   "Balancing; it will settle",
   "No feedback; add servers",
   "Balancing; add more retries",
   "Reinforcing; use exponential backoff with jitter, retry budgets or circuit breakers to break the loop"
  ],
  "a": 3,
  "e": "Retry storms are reinforcing loops. Breaking the loop matters more than adding capacity.",
  "s": "Reread lesson 4.4."
 },
 {
  "id": "t4q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Goodhart's law",
  "p": "How do you best protect a metric from Goodhart's law?",
  "o": [
   "Pair it with balancing metrics, keep it close to the real goal, and watch for gaming",
   "Measure only one thing",
   "Keep it secret",
   "Make the target higher"
  ],
  "a": 0,
  "e": "No metric is ungameable, but balanced sets and close attention help.",
  "s": "Reread lesson 4.4."
 }
];
window.AUDIT = Object.assign({
 "id": "thinking-04-quiz",
 "title": "Thinking Skills Week 4 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-04.html",
  "label": "Week 4"
 },
 "lede": "Problem solving and decision making. 10 questions; take it after the exercise, without notes.",
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
