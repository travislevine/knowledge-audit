/* Markets week 5 quiz: Today's market: AI, news and investing */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "5.1 The AI boom through a historical lens",
  "short": "The AI boom through a historical lens",
  "res": [
   [
    "Reread lesson 5.1",
    "../weeks/week-05.html#w5-l1"
   ],
   [
    "What Caused the Dot-Com Bubble and Its Crash?",
    "https://www.youtube.com/watch?v=25_WjiZnvQk"
   ]
  ]
 },
 "l2": {
  "name": "5.2 Reading earnings and the news",
  "short": "Reading earnings",
  "res": [
   [
    "Reread lesson 5.2",
    "../weeks/week-05.html#w5-l2"
   ]
  ]
 },
 "l3": {
  "name": "5.3 Investor psychology",
  "short": "Investor psychology",
  "res": [
   [
    "Reread lesson 5.3",
    "../weeks/week-05.html#w5-l3"
   ]
  ]
 },
 "l4": {
  "name": "5.4 Evidence-based investing basics",
  "short": "Evidence-based investing basics",
  "res": [
   [
    "Reread lesson 5.4",
    "../weeks/week-05.html#w5-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t5q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Bubble ingredients",
  "p": "Which of these is a bubble ingredient that the AI boom shares with the dot-com era?",
  "o": [
   "A real technological revolution combined with extrapolation and heavy concentration in a few stocks",
   "Deflation",
   "High bank leverage",
   "Falling interest rates only"
  ],
  "a": 0,
  "e": "Several ingredients are present; others (leverage, profitability) differ.",
  "s": "Reread lesson 5.1."
 },
 {
  "id": "t5q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Capex",
  "p": "Why do investors watch big tech companies' capital expenditure on AI so closely?",
  "o": [
   "It's illegal",
   "It's small",
   "It's enormous, and the key question is whether AI revenue will grow enough to justify it; it's also revenue for chip makers",
   "It's tax-deductible"
  ],
  "a": 2,
  "e": "One company's spending is another's sales.",
  "s": "Reread lesson 5.1."
 },
 {
  "id": "t5q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "History of tech booms",
  "p": "What does history suggest about transformative technologies and their stocks?",
  "o": [
   "Stocks always rise steadily",
   "Only the first company wins",
   "They often go through boom-bust cycles even when the technology succeeds",
   "They always fail"
  ],
  "a": 2,
  "e": "Railways, radio and the internet all followed this pattern.",
  "s": "Reread lesson 5.1."
 },
 {
  "id": "t5q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Guidance",
  "p": "Why can a company's shares fall after strong results?",
  "o": [
   "Strong results are bad",
   "They never do",
   "Analysts sell",
   "Results or guidance fell short of high expectations already in the price"
  ],
  "a": 3,
  "e": "Expectations are the benchmark.",
  "s": "Reread lesson 5.2."
 },
 {
  "id": "t5q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Adjusted earnings",
  "p": "What's a warning sign in a company's reported earnings?",
  "o": [
   "Paying dividends",
   "Large, recurring \"one-off\" adjustments that make adjusted profit look much better than official profit",
   "GAAP earnings",
   "Rising revenue"
  ],
  "a": 1,
  "e": "Recurring one-offs aren't one-offs.",
  "s": "Reread lesson 5.2."
 },
 {
  "id": "t5q06",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Forecasts",
  "p": "How much weight should you give to strategists' year-end index targets?",
  "o": [
   "Only if they're bullish",
   "A lot: they're experts",
   "Full weight",
   "Little: their track record is poor, and media rewards confidence over accuracy"
  ],
  "a": 3,
  "e": "Thinking Skills week 3: overconfidence and incentives.",
  "s": "Reread lesson 5.2."
 },
 {
  "id": "t5q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Loss aversion",
  "p": "How does loss aversion hurt investors?",
  "o": [
   "It doesn't",
   "It makes them diversify",
   "It reduces fees",
   "It drives panic selling in downturns and holding losers to 'get back to even'"
  ],
  "a": 3,
  "e": "Losses hurt about twice as much as equal gains feel good.",
  "s": "Reread lesson 5.3."
 },
 {
  "id": "t5q08",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Trading frequency",
  "p": "What do studies of individual brokerage accounts find about frequent traders?",
  "o": [
   "They earn the most",
   "They avoid crashes",
   "They match the market",
   "They tend to earn the least, after costs"
  ],
  "a": 3,
  "e": "Overconfidence plus costs.",
  "s": "Reread lesson 5.3."
 },
 {
  "id": "t5q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Foundations",
  "p": "What should usually come before investing in shares?",
  "o": [
   "Buying a home",
   "Picking individual stocks",
   "Nothing",
   "An emergency fund and paying off high-interest debt"
  ],
  "a": 3,
  "e": "Foundations protect you from forced selling.",
  "s": "Reread lesson 5.4."
 },
 {
  "id": "t5q10",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Too good",
  "p": "An investment promises 2% a month with \"no risk\". What should you conclude?",
  "o": [
   "High return with low risk is almost always a misunderstanding or a fraud",
   "It's normal",
   "Great deal",
   "Buy it with leverage"
  ],
  "a": 0,
  "e": "Return and risk go together.",
  "s": "Reread lesson 5.4."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-05-quiz",
 "title": "Markets Week 5 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-05.html",
  "label": "Week 5"
 },
 "lede": "Today's market: AI, news and investing. 10 questions; take it after the scenario exercise, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 5 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
