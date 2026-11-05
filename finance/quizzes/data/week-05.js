/* Markets week 5 quiz: Beyond shares: other asset classes */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "5.1 Bonds and cash in practice",
  "short": "Bonds",
  "res": [
   [
    "Reread lesson 5.1",
    "../weeks/week-05.html#w5-l1"
   ]
  ]
 },
 "l2": {
  "name": "5.2 Property, commodities and gold",
  "short": "Property",
  "res": [
   [
    "Reread lesson 5.2",
    "../weeks/week-05.html#w5-l2"
   ]
  ]
 },
 "l3": {
  "name": "5.3 Currencies and crypto",
  "short": "Currencies",
  "res": [
   [
    "Reread lesson 5.3",
    "../weeks/week-05.html#w5-l3"
   ]
  ]
 },
 "l4": {
  "name": "5.4 Asset allocation",
  "short": "Asset allocation",
  "res": [
   [
    "Reread lesson 5.4",
    "../weeks/week-05.html#w5-l4"
   ],
   [
    "Reading: Beginners' Guide to Asset Allocation, Diversification and Rebalancing",
    "https://www.investor.gov/sites/investorgov/files/2019-02/Beginners-Guide-to-Asset-Allocation.pdf"
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
  "c": "Yield to maturity",
  "p": "What does a bond's yield to maturity at purchase estimate?",
  "o": [
   "The annual return you'll earn if you hold it to maturity and it doesn't default",
   "Its price next year",
   "Its coupon only",
   "The inflation rate"
  ],
  "a": 0,
  "e": "Starting yields are a good guide to future bond returns.",
  "s": "Reread lesson 5.1."
 },
 {
  "id": "t5q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Inflation-linked bonds",
  "p": "What do inflation-linked bonds protect against?",
  "o": [
   "Currency moves",
   "Rising share prices",
   "Inflation eroding the real value of payments",
   "Default"
  ],
  "a": 2,
  "e": "Principal adjusts with inflation.",
  "s": "Reread lesson 5.1."
 },
 {
  "id": "t5q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Cash role",
  "p": "What's cash best used for?",
  "o": [
   "Long-term growth",
   "Speculation",
   "An emergency fund and money needed soon; its long-run real return is low",
   "Beating inflation"
  ],
  "a": 2,
  "e": "Safety, not growth.",
  "s": "Reread lesson 5.1."
 },
 {
  "id": "t5q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "REITs",
  "p": "Why do REITs often fall sharply in a share market crash, unlike the apparent stability of a house's value?",
  "o": [
   "They pay no rent",
   "REITs are riskier properties",
   "They're illegal in crashes",
   "They're priced every day on an exchange; a directly owned property just isn't priced daily"
  ],
  "a": 3,
  "e": "Lack of daily prices hides volatility; it doesn't remove it.",
  "s": "Reread lesson 5.2."
 },
 {
  "id": "t5q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Productive assets",
  "p": "Which of these is a productive asset?",
  "o": [
   "Bitcoin",
   "A company's shares",
   "Gold",
   "A painting"
  ],
  "a": 1,
  "e": "Productive assets generate cash flows.",
  "s": "Reread lesson 5.2."
 },
 {
  "id": "t5q06",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Commodities and inflation",
  "p": "Inflation surges due to an energy shortage. Which asset class is most likely to do well?",
  "o": [
   "Cash",
   "Long-term bonds",
   "Unprofitable tech stocks",
   "Commodities and energy producers"
  ],
  "a": 3,
  "e": "Commodities often rise when inflation hurts shares and bonds.",
  "s": "Reread lesson 5.2."
 },
 {
  "id": "t5q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Hedging",
  "p": "When is currency hedging most common, and why?",
  "o": [
   "Only for crypto",
   "For shares, because currencies always fall",
   "Never",
   "For foreign bonds, because currency swings would overwhelm their modest returns"
  ],
  "a": 3,
  "e": "Bonds are meant to be stable; currency risk undoes that.",
  "s": "Reread lesson 5.3."
 },
 {
  "id": "t5q08",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Safe haven",
  "p": "What tends to happen to the US dollar in a global panic?",
  "o": [
   "It collapses",
   "It's frozen",
   "Nothing",
   "It often strengthens as investors seek safety"
  ],
  "a": 3,
  "e": "Reserve currency status makes it a haven.",
  "s": "Reread lesson 5.3."
 },
 {
  "id": "t5q09",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Crypto sizing",
  "p": "How should a speculative asset like crypto be sized in a portfolio, if held at all?",
  "o": [
   "As the largest holding",
   "With leverage",
   "Equal to bonds",
   "Small enough that a 70–80% fall wouldn't seriously harm your finances"
  ],
  "a": 3,
  "e": "Size by worst case.",
  "s": "Reread lesson 5.3."
 },
 {
  "id": "t5q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Risk parity",
  "p": "What's the idea behind risk parity (All Weather)?",
  "o": [
   "Balance risk across assets that do well in different economic environments, rather than balancing dollars",
   "Avoid bonds",
   "Hold only shares",
   "Time the market"
  ],
  "a": 0,
  "e": "Diversify across environments.",
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
 "lede": "Beyond shares: other asset classes. 10 questions; take it after the scenario exercise, without notes.",
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
