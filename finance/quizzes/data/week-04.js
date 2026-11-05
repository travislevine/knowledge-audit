/* Markets week 4 quiz: Bubbles and crashes */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "4.1 1929 and the Great Depression",
  "short": "1929",
  "res": [
   [
    "Reread lesson 4.1",
    "../weeks/week-04.html#w4-l1"
   ]
  ]
 },
 "l2": {
  "name": "4.2 1987 and the dot-com bust",
  "short": "1987",
  "res": [
   [
    "Reread lesson 4.2",
    "../weeks/week-04.html#w4-l2"
   ]
  ]
 },
 "l3": {
  "name": "4.3 The 2008 global financial crisis",
  "short": "The 2008 global financial crisis",
  "res": [
   [
    "Reread lesson 4.3",
    "../weeks/week-04.html#w4-l3"
   ],
   [
    "How it Happened: The 2008 Financial Crisis",
    "https://www.youtube.com/watch?v=GPOv72Awo68"
   ]
  ]
 },
 "l4": {
  "name": "4.4 2020, 2022 and the patterns",
  "short": "2020",
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
  "c": "1929 depth",
  "p": "Roughly how far did the Dow fall from its 1929 peak to the 1932 low?",
  "o": [
   "25%",
   "About 89%",
   "50%",
   "100%"
  ],
  "a": 1,
  "e": "The deepest US crash on record.",
  "s": "Reread lesson 4.1."
 },
 {
  "id": "t4q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Legacy",
  "p": "Which reform followed the 1929 crash and bank failures?",
  "o": [
   "Circuit breakers",
   "Bitcoin",
   "Quantitative easing",
   "Deposit insurance and securities regulation (the SEC)"
  ],
  "a": 3,
  "e": "Bank runs were a central cause of the Depression's depth.",
  "s": "Reread lesson 4.1."
 },
 {
  "id": "t4q03",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "1987",
  "p": "What amplified the 1987 crash?",
  "o": [
   "Portfolio insurance: automated selling that triggered more selling as prices fell",
   "High oil prices",
   "Bank failures",
   "A war"
  ],
  "a": 0,
  "e": "Circuit breakers were introduced afterwards.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Dot-com",
  "p": "An investor in 2000 says, \"The internet will change everything, so these stocks can't be overpriced.\" What's the flaw?",
  "o": [
   "Tech stocks are always overpriced",
   "Nothing",
   "The internet didn't matter",
   "A real revolution doesn't justify any price: returns depend on what you pay versus the profits that actually arrive"
  ],
  "a": 3,
  "e": "Both statements can be true: transformative technology, terrible returns.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Nasdaq recovery",
  "p": "How long did the Nasdaq take to regain its March 2000 peak?",
  "o": [
   "It never has",
   "About 15 years",
   "6 months",
   "2 years"
  ],
  "a": 1,
  "e": "It regained the peak in 2015.",
  "s": "Reread lesson 4.2."
 },
 {
  "id": "t4q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "2008 trigger",
  "p": "Which event in September 2008 turned a housing bust into a global panic?",
  "o": [
   "A pandemic",
   "The dot-com crash",
   "The Fed raising rates",
   "The failure of Lehman Brothers, which froze credit markets worldwide"
  ],
  "a": 3,
  "e": "No one knew who else held losses, so lending stopped.",
  "s": "Watch the CrashCourse video."
 },
 {
  "id": "t4q07",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Leverage maths",
  "p": "A bank is leveraged 25:1. Roughly what fall in its assets wipes out its equity?",
  "o": [
   "25%",
   "1%",
   "50%",
   "4%"
  ],
  "a": 3,
  "e": "Equity is 1/25 = 4% of assets.",
  "s": "Reread lesson 4.3."
 },
 {
  "id": "t4q08",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "COVID speed",
  "p": "What was unusual about the 2020 crash?",
  "o": [
   "It was the fastest fall into a bear market in history, followed by one of the fastest recoveries",
   "It lasted 10 years",
   "Only bonds fell",
   "It was the deepest ever"
  ],
  "a": 0,
  "e": "About −34% in 33 days, recovered within about six months.",
  "s": "Reread lesson 4.4."
 },
 {
  "id": "t4q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "2022",
  "p": "What drove the 2022 bear market?",
  "o": [
   "An oil glut",
   "A pandemic",
   "Bank failures",
   "High inflation and the fastest rate rises in four decades"
  ],
  "a": 3,
  "e": "Rates up, valuations down, especially for long-duration growth stocks.",
  "s": "Reread lesson 4.4."
 },
 {
  "id": "t4q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Market timing",
  "p": "Why is selling during crashes and buying back later usually a losing strategy?",
  "o": [
   "The best days tend to cluster near the worst ones, so sellers often miss the rebound that drives long-run returns",
   "Crashes never recover",
   "It's illegal",
   "Brokers forbid it"
  ],
  "a": 0,
  "e": "Missing a handful of the best days dramatically cuts returns.",
  "s": "Reread lesson 4.4."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-04-quiz",
 "title": "Markets Week 4 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-04.html",
  "label": "Week 4"
 },
 "lede": "Bubbles and crashes. 10 questions; take it after the scenario exercise, without notes.",
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
