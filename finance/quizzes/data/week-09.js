/* Markets week 9 quiz: Personal investing with ETFs (Australia) */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "9.1 Foundations and principles",
  "short": "Foundations",
  "res": [
   [
    "Reread lesson 9.1",
    "../weeks/week-09.html#w9-l1"
   ]
  ]
 },
 "l2": {
  "name": "9.2 Choosing an ETF",
  "short": "Choosing an ETF",
  "res": [
   [
    "Reread lesson 9.2",
    "../weeks/week-09.html#w9-l2"
   ],
   [
    "Guide: Exchange-Traded Funds (ETFs) Investing Guide",
    "https://www.morningstar.com.au/investing/exchange-traded-funds-etfs-investing-guide"
   ]
  ]
 },
 "l3": {
  "name": "9.3 Building a simple portfolio",
  "short": "Building a simple portfolio",
  "res": [
   [
    "Reread lesson 9.3",
    "../weeks/week-09.html#w9-l3"
   ]
  ]
 },
 "l4": {
  "name": "9.4 Australian practicalities",
  "short": "Australian practicalities",
  "res": [
   [
    "Reread lesson 9.4",
    "../weeks/week-09.html#w9-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t9q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Foundations",
  "p": "What should usually come before investing in shares?",
  "o": [
   "Buying a home",
   "Nothing",
   "An emergency fund and paying off high-interest debt",
   "Picking individual stocks"
  ],
  "a": 2,
  "e": "Foundations protect you from forced selling.",
  "s": "Reread lesson 9.1."
 },
 {
  "id": "t9q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Too good",
  "p": "An investment promises 2% a month with \"no risk\". What should you conclude?",
  "o": [
   "It's normal",
   "Great deal",
   "High return with low risk is almost always a misunderstanding or a fraud",
   "Buy it with leverage"
  ],
  "a": 2,
  "e": "Return and risk go together.",
  "s": "Reread lesson 9.1."
 },
 {
  "id": "t9q03",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Index first",
  "p": "When comparing ETFs, what matters most?",
  "o": [
   "Recent one-year return",
   "Its share price",
   "The index it tracks, then fees, size and structure",
   "The issuer's logo"
  ],
  "a": 2,
  "e": "What you own drives the result; then minimise costs.",
  "s": "Reread lesson 9.2."
 },
 {
  "id": "t9q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Domicile",
  "p": "Why might an Australian investor prefer an Australian-domiciled version of a US share ETF?",
  "o": [
   "It's always cheaper",
   "It's hedged",
   "Simpler tax handling, with no US tax form and fewer cross-border complications",
   "It holds different shares"
  ],
  "a": 2,
  "e": "Structure can matter even when holdings are the same.",
  "s": "Reread lesson 9.2."
 },
 {
  "id": "t9q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "DRP",
  "p": "What's a tax point to remember about dividend reinvestment plans?",
  "o": [
   "Reinvested distributions aren't taxed",
   "They're only for super",
   "Reinvested distributions are still taxable income, and each creates a new cost base parcel to record",
   "DRPs avoid CGT"
  ],
  "a": 2,
  "e": "Keep records for every parcel.",
  "s": "Reread lesson 9.2 and 9.4."
 },
 {
  "id": "t9q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Home bias",
  "p": "Why can a heavily Australian share portfolio be risky?",
  "o": [
   "Australia is a bad country",
   "The ASX is about 2% of world markets and concentrated in banks and miners",
   "Australian shares pay no dividends",
   "It can't be rebalanced"
  ],
  "a": 1,
  "e": "Global diversification reduces concentration.",
  "s": "Reread lesson 9.3."
 },
 {
  "id": "t9q07",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Rebalancing with contributions",
  "p": "How can you rebalance without selling and triggering CGT?",
  "o": [
   "Buy more of what's up",
   "You can't",
   "Stop investing",
   "Direct new contributions to the underweight parts of the portfolio"
  ],
  "a": 3,
  "e": "New money is the cheapest rebalancing tool.",
  "s": "Reread lesson 9.3."
 },
 {
  "id": "t9q08",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Franking credits",
  "p": "What is a franking credit?",
  "o": [
   "A credit for company tax already paid on an Australian dividend, offset against your tax and refundable if your rate is lower",
   "A government grant",
   "A broker rebate",
   "A fee discount"
  ],
  "a": 0,
  "e": "Valuable to low-tax investors and super funds.",
  "s": "Reread lesson 9.4."
 },
 {
  "id": "t9q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Super access",
  "p": "What's the main trade-off of investing through super rather than outside it?",
  "o": [
   "Super can't hold shares",
   "Super is taxed lightly but locked away until preservation age",
   "Super is taxed more",
   "There's no difference"
  ],
  "a": 1,
  "e": "Tax benefits in exchange for access.",
  "s": "Reread lesson 9.4."
 },
 {
  "id": "t9q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "CGT discount",
  "p": "What's needed for the 50% CGT discount as an individual?",
  "o": [
   "Selling at a loss",
   "Holding it in a custodial account",
   "Holding the asset for more than 12 months",
   "Using a DRP"
  ],
  "a": 2,
  "e": "Holding period matters.",
  "s": "Reread lesson 9.4."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-09-quiz",
 "title": "Markets Week 9 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-09.html",
  "label": "Week 9"
 },
 "lede": "Personal investing with ETFs (Australia). 10 questions; take it after the scenario exercise, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 9 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
