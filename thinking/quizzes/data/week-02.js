/* Thinking Skills week 2 quiz: Evidence, statistics and probability */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "2.1 Base rates and Bayes' rule",
  "short": "Base rates",
  "res": [
   [
    "Reread lesson 2.1",
    "../weeks/week-02.html#w2-l1"
   ],
   [
    "Video: Bayes theorem, the geometry of changing beliefs",
    "https://www.youtube.com/watch?v=HZGCoVF3YvM"
   ]
  ]
 },
 "l2": {
  "name": "2.2 Correlation and causation",
  "short": "Correlation",
  "res": [
   [
    "Reread lesson 2.2",
    "../weeks/week-02.html#w2-l2"
   ]
  ]
 },
 "l3": {
  "name": "2.3 Reading studies and statistics",
  "short": "Reading studies",
  "res": [
   [
    "Reread lesson 2.3",
    "../weeks/week-02.html#w2-l3"
   ]
  ]
 },
 "l4": {
  "name": "2.4 Expected value and risk",
  "short": "Expected value",
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
  "k": "scenario",
  "c": "Base rate neglect",
  "p": "A CV-screening keyword appears in 90% of strong candidates' CVs and 30% of weak candidates' CVs. 10% of applicants are strong. What fraction of applicants with the keyword are strong?",
  "o": [
   "About 10%",
   "About 50%",
   "90%",
   "About 25%"
  ],
  "a": 3,
  "e": "Per 1,000: 100 strong, 90 with the keyword; 900 weak, 270 with it. 90 / 360 = 25%.",
  "s": "Practice Bayes with natural frequencies."
 },
 {
  "id": "t2q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Likelihood ratio",
  "p": "Evidence is equally likely whether or not a hypothesis is true. How should it change your belief?",
  "o": [
   "It depends on how vivid it is",
   "Not at all: the likelihood ratio is 1",
   "Weaken it",
   "Strengthen it"
  ],
  "a": 1,
  "e": "Evidence only discriminates between hypotheses if it's more likely under one than the other.",
  "s": "Reread lesson 2.1."
 },
 {
  "id": "t2q03",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Confounding",
  "p": "Cities with more hospitals have more deaths. Why doesn't that show hospitals are dangerous?",
  "o": [
   "The data is wrong",
   "Population size is a confounder: bigger cities have more of both",
   "Correlation is never meaningful",
   "It does show that"
  ],
  "a": 1,
  "e": "A third factor (population) drives both. Compare death rates, not totals, and control for who goes to hospital.",
  "s": "Review confounding, reverse causation and selection."
 },
 {
  "id": "t2q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Survivorship bias",
  "p": "Why can studying only successful companies mislead you about what causes success?",
  "o": [
   "There aren't enough successful companies",
   "Failed companies may have done the same things, but they're missing from the sample",
   "It can't mislead you",
   "Successful companies lie"
  ],
  "a": 1,
  "e": "Without the failures you can't tell whether a trait helps, or is just common.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q05",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Regression to the mean",
  "p": "After the worst outage month in a year, a team adopts a new checklist and the next month is much better. What's the most important caveat?",
  "o": [
   "The next month must have been lucky",
   "Checklists don't work",
   "One month proves it works",
   "Extreme months tend to be followed by more ordinary ones anyway, so you need a comparison to credit the checklist"
  ],
  "a": 3,
  "e": "Regression to the mean makes any intervention after an extreme result look effective.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Relative vs absolute",
  "p": "Why should you ask for absolute numbers when you see \"risk doubled\"?",
  "o": [
   "Absolute numbers are easier to fake",
   "Relative numbers are always wrong",
   "They mean the same thing",
   "Doubling a tiny risk may still be tiny; the absolute change tells you how much it matters"
  ],
  "a": 3,
  "e": "1 in a million to 2 in a million is a doubling, and negligible.",
  "s": "Reread lesson 2.3."
 },
 {
  "id": "t2q07",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Multiple comparisons",
  "p": "A team tests 40 metrics after a redesign and reports that 2 improved significantly at p < 0.05. What should you conclude?",
  "o": [
   "The redesign worked",
   "About 2 of 40 would be expected to pass by chance alone, so this is weak evidence; pre-register one main metric",
   "Nothing can be concluded from A/B tests",
   "The p-values are wrong"
  ],
  "a": 1,
  "e": "At a 5% threshold, 40 tests give about 2 false positives on average.",
  "s": "Read about p-hacking and pre-registration."
 },
 {
  "id": "t2q08",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Mean vs median",
  "p": "Which better describes a typical customer's spend when a few customers spend enormous amounts?",
  "o": [
   "The mean",
   "The median",
   "The total",
   "The maximum"
  ],
  "a": 1,
  "e": "Outliers drag the mean; the median is the middle customer.",
  "s": "Reread lesson 2.3."
 },
 {
  "id": "t2q09",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Expected value",
  "p": "Option A: certain gain of $30. Option B: 50% chance of $100, 50% chance of $0. You'll make this choice 1,000 times. Which should you pick?",
  "o": [
   "B: its expected value is $50, and over 1,000 trials the luck averages out",
   "A: certainty is better",
   "Neither",
   "Either: they're equivalent"
  ],
  "a": 0,
  "e": "Over many repetitions, expected value dominates.",
  "s": "Reread lesson 2.4."
 },
 {
  "id": "t2q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Calibration",
  "p": "What does it mean to be well calibrated?",
  "o": [
   "Never being certain",
   "Your confidence matches your accuracy: things you call 70% likely happen about 70% of the time",
   "Agreeing with experts",
   "Always being right"
  ],
  "a": 1,
  "e": "Calibration is measured over many predictions, and it improves with practice and feedback.",
  "s": "Keep the calibration log from this week's exercise."
 }
];
window.AUDIT = Object.assign({
 "id": "thinking-02-quiz",
 "title": "Thinking Skills Week 2 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-02.html",
  "label": "Week 2"
 },
 "lede": "Evidence, statistics and probability. 10 questions; take it after the exercise, without notes.",
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
