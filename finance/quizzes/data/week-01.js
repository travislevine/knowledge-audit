/* Markets week 1 quiz: How the stock market works */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "1.1 Shares, companies and owners",
  "short": "Shares",
  "res": [
   [
    "Reread lesson 1.1",
    "../weeks/week-01.html#w1-l1"
   ],
   [
    "How does the stock market work? (4 min)",
    "https://www.youtube.com/watch?v=p7HKvqRI_Bo"
   ]
  ]
 },
 "l2": {
  "name": "1.2 Exchanges and how prices are set",
  "short": "Exchanges",
  "res": [
   [
    "Reread lesson 1.2",
    "../weeks/week-01.html#w1-l2"
   ]
  ]
 },
 "l3": {
  "name": "1.3 Indices: what \"the market\" means",
  "short": "Indices: what \"the market\" means",
  "res": [
   [
    "Reread lesson 1.3",
    "../weeks/week-01.html#w1-l3"
   ]
  ]
 },
 "l4": {
  "name": "1.4 Ways to own the market",
  "short": "Ways to own the market",
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
  "c": "Source of value",
  "p": "Ultimately, what determines a share's long-run value?",
  "o": [
   "The exchange it's listed on",
   "Its share price history",
   "The number of people talking about it",
   "The cash the business will generate for its owners over its life"
  ],
  "a": 3,
  "e": "Prices swing with sentiment, but value is anchored to future cash flows.",
  "s": "Reread lesson 1.1."
 },
 {
  "id": "t1q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Buybacks",
  "p": "How does a share buyback benefit remaining shareholders?",
  "o": [
   "It pays them cash directly",
   "It doesn't",
   "It lowers the share price",
   "Each remaining share owns a larger slice of the company and its profits"
  ],
  "a": 3,
  "e": "Buybacks are an alternative to dividends for returning cash.",
  "s": "Reread lesson 1.1."
 },
 {
  "id": "t1q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Risk order",
  "p": "If a company goes bankrupt, who is paid first?",
  "o": [
   "The government",
   "Employees' pension funds only",
   "Lenders and bondholders; shareholders get what's left, often nothing",
   "Shareholders"
  ],
  "a": 2,
  "e": "Shareholders bear the most risk, which is why they expect the highest return.",
  "s": "Reread lesson 1.1."
 },
 {
  "id": "t1q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Spread",
  "p": "What is the bid-ask spread?",
  "o": [
   "The daily price range",
   "The broker's commission",
   "The dividend yield",
   "The gap between the highest price a buyer offers and the lowest a seller accepts; a cost of trading"
  ],
  "a": 3,
  "e": "Liquid stocks have tiny spreads; illiquid ones can be costly.",
  "s": "Reread lesson 1.2."
 },
 {
  "id": "t1q05",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Limit orders",
  "p": "You want to buy a thinly traded stock but not pay more than $4.20. Which order type?",
  "o": [
   "A limit order at $4.20",
   "A stop-loss",
   "A short sale",
   "A market order"
  ],
  "a": 0,
  "e": "A market order in an illiquid stock can fill at a surprisingly bad price.",
  "s": "Reread lesson 1.2."
 },
 {
  "id": "t1q06",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Market cap",
  "p": "A company has 2 billion shares at $50. What's its market cap?",
  "o": [
   "$100 billion",
   "$2 billion",
   "$50 billion",
   "$25 billion"
  ],
  "a": 0,
  "e": "2 billion × $50 = $100 billion.",
  "s": "Practice market cap calculations."
 },
 {
  "id": "t1q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Cap weighting",
  "p": "Why can a handful of companies drive the S&P 500's return?",
  "o": [
   "The index only has 30 members",
   "It's market-cap weighted, and a few very large companies make up a big share of it",
   "They're chosen by a committee",
   "They pay the most dividends"
  ],
  "a": 1,
  "e": "Concentration is a key feature of today's market.",
  "s": "Try the cap-weighting widget again."
 },
 {
  "id": "t1q08",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "US weight",
  "p": "Roughly what share of global stock market value is in US companies?",
  "o": [
   "About 25%",
   "Around 60% or more",
   "About 10%",
   "Almost 100%"
  ],
  "a": 1,
  "e": "Far more than the US share of world GDP, because US companies are large and highly valued.",
  "s": "Reread lesson 1.3."
 },
 {
  "id": "t1q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Index funds",
  "p": "What does an index fund aim to do?",
  "o": [
   "Pick the best sectors",
   "Beat the market",
   "Avoid all losses",
   "Match an index's return, minus a very small fee, by holding its members in their weights"
  ],
  "a": 3,
  "e": "It deliberately gives up trying to beat the market, and wins on cost.",
  "s": "Reread lesson 1.4."
 },
 {
  "id": "t1q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "SPIVA",
  "p": "What do S&P's SPIVA reports consistently find?",
  "o": [
   "Active funds are cheaper",
   "Index funds lose money",
   "Most active funds beat their index",
   "Most active funds underperform their index over long periods"
  ],
  "a": 3,
  "e": "Around 85–90% of US large-cap funds trail the S&P 500 over 15 years.",
  "s": "Reread lesson 1.4."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-01-quiz",
 "title": "Markets Week 1 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-01.html",
  "label": "Week 1"
 },
 "lede": "How the stock market works. 10 questions; take it after the scenario exercise, without notes.",
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
