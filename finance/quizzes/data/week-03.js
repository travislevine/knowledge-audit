/* Markets week 3 quiz: Reading a company */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "3.1 The income statement",
  "short": "The income statement",
  "res": [
   [
    "Reread lesson 3.1",
    "../weeks/week-03.html#w3-l1"
   ],
   [
    "How to Read Company Financial Statements (Basics Explained)",
    "https://www.youtube.com/watch?v=__5MtdoKHfx"
   ]
  ]
 },
 "l2": {
  "name": "3.2 The balance sheet",
  "short": "The balance sheet",
  "res": [
   [
    "Reread lesson 3.2",
    "../weeks/week-03.html#w3-l2"
   ]
  ]
 },
 "l3": {
  "name": "3.3 The cash flow statement",
  "short": "The cash flow statement",
  "res": [
   [
    "Reread lesson 3.3",
    "../weeks/week-03.html#w3-l3"
   ]
  ]
 },
 "l4": {
  "name": "3.4 Moats and quality",
  "short": "Moats",
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
  "c": "Gross margin",
  "p": "What does a consistently high gross margin often indicate?",
  "o": [
   "Pricing power: customers pay well above what the product costs to make",
   "Fast growth",
   "High debt",
   "Low taxes"
  ],
  "a": 0,
  "e": "Software and strong brands have high gross margins; commodities low ones.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Dilution",
  "p": "Net income grew 10% but the number of shares grew 8%. Roughly how much did EPS grow?",
  "o": [
   "About 2%",
   "8%",
   "18%",
   "10%"
  ],
  "a": 0,
  "e": "1.10 / 1.08 ≈ 1.02. Dilution from share issues and stock-based pay eats per-share growth.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Operating leverage",
  "p": "What is operating leverage?",
  "o": [
   "Borrowing to invest",
   "A type of option",
   "Paying high dividends",
   "When costs grow slower than revenue, so profits grow faster than sales"
  ],
  "a": 3,
  "e": "It works in reverse too: in a downturn, profits fall faster than sales.",
  "s": "Reread lesson 3.1."
 },
 {
  "id": "t3q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Balance sheet identity",
  "p": "What does a balance sheet always satisfy?",
  "o": [
   "Cash = profit",
   "Debt = equity",
   "Assets = liabilities + equity",
   "Revenue = costs"
  ],
  "a": 2,
  "e": "Equity is what's left for shareholders after liabilities.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q05",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Refinancing risk",
  "p": "Two companies have the same debt. One's debt is due in 9 years, the other's mostly next year, in the middle of a credit crunch. Which is riskier?",
  "o": [
   "The one that must refinance next year, when lenders may refuse or charge far more",
   "Neither",
   "The 9-year one",
   "They're equal"
  ],
  "a": 0,
  "e": "When debt is due can matter as much as how much there is.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q06",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Goodwill",
  "p": "What is goodwill on a balance sheet?",
  "o": [
   "The premium paid over the value of identifiable assets when acquiring another company",
   "Cash reserves",
   "Charitable donations",
   "Customer satisfaction"
  ],
  "a": 0,
  "e": "Large goodwill write-downs signal acquisitions that went badly.",
  "s": "Reread lesson 3.2."
 },
 {
  "id": "t3q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Profit vs cash",
  "p": "Why is the cash flow statement harder to manipulate than the income statement?",
  "o": [
   "It records actual cash moving, while profit depends on accounting judgements about timing and estimates",
   "It's audited more",
   "It's not published",
   "It's shorter"
  ],
  "a": 0,
  "e": "Cash is a fact; profit is partly an opinion.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Dividend funding",
  "p": "A company's dividends exceed its free cash flow every year, and its debt keeps rising. What's happening?",
  "o": [
   "It's borrowing to pay dividends, which can't last",
   "It's very healthy",
   "It's buying back shares",
   "Nothing unusual"
  ],
  "a": 0,
  "e": "Sustainable dividends come from free cash flow.",
  "s": "Reread lesson 3.3."
 },
 {
  "id": "t3q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "ROIC",
  "p": "What does return on invested capital measure?",
  "o": [
   "Dividend yield",
   "Share price growth",
   "Revenue growth",
   "How much operating profit a business earns on the capital tied up in it"
  ],
  "a": 3,
  "e": "Sustained high ROIC is the fingerprint of a moat.",
  "s": "Reread lesson 3.4."
 },
 {
  "id": "t3q10",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Quality vs price",
  "p": "A company has a wide moat and 30% ROIC, and trades at 60 times earnings. What's the key question?",
  "o": [
   "Whether the CEO is famous",
   "What growth that price assumes, and whether it's realistic; great businesses can still be poor investments at the wrong price",
   "Its share price",
   "None: buy it"
  ],
  "a": 1,
  "e": "Quality and price are separate questions.",
  "s": "Reread lesson 3.4."
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
 "lede": "Reading a company. 10 questions; take it after the scenario exercise, without notes.",
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
