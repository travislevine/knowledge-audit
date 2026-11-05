/* Markets week 8 quiz: Today's market: AI, news and psychology */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "8.1 The AI boom through a historical lens",
  "short": "The AI boom through a historical lens",
  "res": [
   [
    "Reread lesson 8.1",
    "../weeks/week-08.html#w8-l1"
   ],
   [
    "What Caused the Dot-Com Bubble and Its Crash?",
    "https://www.youtube.com/watch?v=25_WjiZnvQk"
   ]
  ]
 },
 "l2": {
  "name": "8.2 Reading earnings and the news",
  "short": "Reading earnings",
  "res": [
   [
    "Reread lesson 8.2",
    "../weeks/week-08.html#w8-l2"
   ]
  ]
 },
 "l3": {
  "name": "8.3 Investor psychology",
  "short": "Investor psychology",
  "res": [
   [
    "Reread lesson 8.3",
    "../weeks/week-08.html#w8-l3"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t8q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Bubble ingredients",
  "p": "Which of these is a bubble ingredient that the AI boom shares with the dot-com era?",
  "o": [
   "Falling interest rates only",
   "High bank leverage",
   "Deflation",
   "A real technological revolution combined with extrapolation and heavy concentration in a few stocks"
  ],
  "a": 3,
  "e": "Several ingredients are present; others (leverage, profitability) differ.",
  "s": "Reread lesson 8.1."
 },
 {
  "id": "t8q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Capex",
  "p": "Why do investors watch big tech companies' capital expenditure on AI so closely?",
  "o": [
   "It's tax-deductible",
   "It's illegal",
   "It's small",
   "It's enormous, and the key question is whether AI revenue will grow enough to justify it; it's also revenue for chip makers"
  ],
  "a": 3,
  "e": "One company's spending is another's sales.",
  "s": "Reread lesson 8.1."
 },
 {
  "id": "t8q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "History of tech booms",
  "p": "What does history suggest about transformative technologies and their stocks?",
  "o": [
   "They always fail",
   "Stocks always rise steadily",
   "They often go through boom-bust cycles even when the technology succeeds",
   "Only the first company wins"
  ],
  "a": 2,
  "e": "Railways, radio and the internet all followed this pattern.",
  "s": "Reread lesson 8.1."
 },
 {
  "id": "t8q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Guidance",
  "p": "Why can a company's shares fall after strong results?",
  "o": [
   "Strong results are bad",
   "Results or guidance fell short of high expectations already in the price",
   "Analysts sell",
   "They never do"
  ],
  "a": 1,
  "e": "Expectations are the benchmark.",
  "s": "Reread lesson 8.2."
 },
 {
  "id": "t8q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Adjusted earnings",
  "p": "What's a warning sign in a company's reported earnings?",
  "o": [
   "Large, recurring \"one-off\" adjustments that make adjusted profit look much better than official profit",
   "Rising revenue",
   "GAAP earnings",
   "Paying dividends"
  ],
  "a": 0,
  "e": "Recurring one-offs aren't one-offs.",
  "s": "Reread lesson 8.2."
 },
 {
  "id": "t8q06",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Forecasts",
  "p": "How much weight should you give to strategists' year-end index targets?",
  "o": [
   "Full weight",
   "Only if they're bullish",
   "A lot: they're experts",
   "Little: their track record is poor, and media rewards confidence over accuracy"
  ],
  "a": 3,
  "e": "Thinking Skills week 3: overconfidence and incentives.",
  "s": "Reread lesson 8.2."
 },
 {
  "id": "t8q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Loss aversion",
  "p": "How does loss aversion hurt investors?",
  "o": [
   "It makes them diversify",
   "It reduces fees",
   "It drives panic selling in downturns and holding losers to 'get back to even'",
   "It doesn't"
  ],
  "a": 2,
  "e": "Losses hurt about twice as much as equal gains feel good.",
  "s": "Reread lesson 8.3."
 },
 {
  "id": "t8q08",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Trading frequency",
  "p": "What do studies of individual brokerage accounts find about frequent traders?",
  "o": [
   "They match the market",
   "They tend to earn the least, after costs",
   "They avoid crashes",
   "They earn the most"
  ],
  "a": 1,
  "e": "Overconfidence plus costs.",
  "s": "Reread lesson 8.3."
 },
 {
  "id": "t8q09",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Narratives",
  "p": "A news story says \"stocks rose as investors cheered strong jobs data\". Why be cautious about this explanation?",
  "o": [
   "Daily explanations are often fitted after the fact; many things move markets at once",
   "Jobs data never matters",
   "Markets only move on earnings",
   "Journalists can't read data"
  ],
  "a": 0,
  "e": "Thinking Skills: post hoc explanations.",
  "s": "Reread lesson 8.2."
 },
 {
  "id": "t8q10",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Hindsight",
  "p": "Why is \"everyone knew it was a bubble\" usually misleading?",
  "o": [
   "Hindsight bias: few acted at the time, and many who warned did so years too early",
   "Bubbles don't exist",
   "It's always true",
   "Everyone did know"
  ],
  "a": 0,
  "e": "Judge decisions by what was knowable then.",
  "s": "Reread lesson 8.3."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-08-quiz",
 "title": "Markets Week 8 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-08.html",
  "label": "Week 8"
 },
 "lede": "Today's market: AI, news and psychology. 10 questions; take it after the scenario exercise, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3"
 ],
 "levels": {
  "1": {
   "name": "Week 8 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
