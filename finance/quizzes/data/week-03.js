/* Markets week 3 quiz: What moves markets */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "3.1 Central banks and interest rates",
  "short": "Central banks",
  "res": [
   [
    "Reread lesson 3.1",
    "../weeks/week-03.html#w3-l1"
   ]
  ]
 },
 "l2": {
  "name": "3.2 Inflation",
  "short": "Inflation",
  "res": [
   [
    "Reread lesson 3.2",
    "../weeks/week-03.html#w3-l2"
   ]
  ]
 },
 "l3": {
  "name": "3.3 Bonds and the yield curve",
  "short": "Bonds",
  "res": [
   [
    "Reread lesson 3.3",
    "../weeks/week-03.html#w3-l3"
   ]
  ]
 },
 "l4": {
  "name": "3.4 Cycles, debt and sentiment",
  "short": "Cycles",
  "res": [
   [
    "Reread lesson 3.4",
    "../weeks/week-03.html#w3-l4"
   ],
   [
    "How The Economic Machine Works (31 min)",
    "https://www.youtube.com/watch?v=PHe0bXAIuk0"
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
  "c": "Rates and valuations",
  "p": "Why do higher interest rates tend to lower stock valuations?",
  "o": [
   "Future cash flows are discounted more heavily, bonds and cash become more attractive alternatives, and the economy slows",
   "They don't",
   "Companies stop paying dividends",
   "Stock exchanges charge more"
  ],
  "a": 0,
  "e": "Rates are gravity for asset prices.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "QE",
  "p": "What is quantitative easing?",
  "o": [
   "A central bank buying bonds to lower longer-term rates and add money to the financial system",
   "Printing physical cash for people",
   "Cutting taxes",
   "Raising interest rates"
  ],
  "a": 0,
  "e": "Used heavily after 2008 and in 2020.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Expectations",
  "p": "What moves markets on central bank decision days?",
  "o": [
   "Only the size of the rate change",
   "The time of the announcement",
   "Nothing",
   "The difference between what was expected and what the bank did or signalled"
  ],
  "a": 3,
  "e": "Prices already reflect expectations.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "2022",
  "p": "In 2022, why did shares and bonds both fall, hurting balanced portfolios?",
  "o": [
   "Bond defaults",
   "A currency crisis",
   "High inflation forced rapid rate rises, which lowered bond prices and stock valuations at the same time",
   "A tech scandal"
  ],
  "a": 2,
  "e": "Inflation shocks can make the usual diversification between stocks and bonds fail.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Volcker",
  "p": "What did Paul Volcker's Fed do in 1979–81?",
  "o": [
   "Raised rates to nearly 20% to break high inflation, causing a deep recession",
   "Introduced QE",
   "Cut rates to zero",
   "Printed money"
  ],
  "a": 0,
  "e": "It ended 1970s inflation and set up the long bond bull market.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q06",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Bond prices",
  "p": "Interest rates fall. What happens to the price of an existing long-term bond?",
  "o": [
   "It rises",
   "Unchanged",
   "It's repaid early",
   "It falls"
  ],
  "a": 0,
  "e": "Prices move opposite to yields; long bonds move most.",
  "s": "Try the bond widget again."
 },
 {
  "id": "t3q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Risk-free rate",
  "p": "Why is the 10-year US Treasury yield so important?",
  "o": [
   "It's the benchmark 'risk-free' rate used to value shares, mortgages and most other assets",
   "It's the highest yield",
   "It's fixed by law",
   "It sets oil prices"
  ],
  "a": 0,
  "e": "Changes ripple through every valuation.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q08",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Credit spreads",
  "p": "Corporate bond yields rise sharply relative to government yields. What does that suggest?",
  "o": [
   "Investors increasingly fear defaults: a sign of financial stress",
   "Investors are more confident",
   "Inflation is falling",
   "Nothing"
  ],
  "a": 0,
  "e": "Widening spreads often precede trouble in stocks.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Leading",
  "p": "Why does the stock market often bottom before the economy does?",
  "o": [
   "Central banks buy shares",
   "Companies lie",
   "It's a coincidence",
   "It prices expected future profits, so it turns when investors expect improvement, not when it arrives"
  ],
  "a": 3,
  "e": "The market is a forward-looking machine.",
  "s": "Reread lesson 3.4."
 },
 {
  "id": "t3q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Deleveraging",
  "p": "What makes a debt-driven crash especially severe?",
  "o": [
   "High dividends",
   "As debts are cut, spending and asset prices fall, which forces more selling and more debt reduction: a self-reinforcing spiral",
   "Strong currencies",
   "Low interest rates"
  ],
  "a": 1,
  "e": "Leverage turns falls into spirals (week 4's case studies).",
  "s": "Watch Ray Dalio's video."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-03-quiz",
 "title": "Markets Week 3 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-03.html",
  "label": "Week 3"
 },
 "lede": "What moves markets. 10 questions; take it after the scenario exercise, without notes.",
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
