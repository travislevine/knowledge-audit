/* Markets week 10 quiz: Investing legends, frauds and review */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "10.1 Graham and Buffett: value investing",
  "short": "Graham",
  "res": [
   [
    "Reread lesson 10.1",
    "../weeks/week-10.html#w10-l1"
   ],
   [
    "Reading: Berkshire Hathaway shareholder letters",
    "https://www.berkshirehathaway.com/letters/letters.html"
   ]
  ]
 },
 "l2": {
  "name": "10.2 Other legends: Bogle, Lynch, Soros, Dalio, Simons",
  "short": "Other legends: Bogle",
  "res": [
   [
    "Reread lesson 10.2",
    "../weeks/week-10.html#w10-l2"
   ]
  ]
 },
 "l3": {
  "name": "10.3 Frauds and scams",
  "short": "Frauds",
  "res": [
   [
    "Reread lesson 10.3",
    "../weeks/week-10.html#w10-l3"
   ]
  ]
 },
 "l4": {
  "name": "10.4 Putting it all together",
  "short": "Putting it all together",
  "res": [
   [
    "Reread lesson 10.4",
    "../weeks/week-10.html#w10-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t10q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Mr. Market",
  "p": "What does Graham's \"Mr. Market\" metaphor teach?",
  "o": [
   "The market is always right",
   "Market prices swing with mood around business value, and you can use those swings rather than be ruled by them",
   "Follow the crowd",
   "Sell when prices fall"
  ],
  "a": 1,
  "e": "The market is there to serve you, not instruct you.",
  "s": "Reread lesson 10.1."
 },
 {
  "id": "t10q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Buffett's style",
  "p": "How did Buffett refine Graham's approach?",
  "o": [
   "Buying wonderful businesses with durable moats at fair prices and holding them for decades",
   "Only buying bonds",
   "Trading more often",
   "Using leverage"
  ],
  "a": 0,
  "e": "Quality and time.",
  "s": "Reread lesson 10.1."
 },
 {
  "id": "t10q03",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Index fund origin",
  "p": "Who launched the first index fund for ordinary investors?",
  "o": [
   "George Soros",
   "John Bogle at Vanguard, in 1976",
   "Warren Buffett",
   "Peter Lynch"
  ],
  "a": 1,
  "e": "\"Bogle's folly\" became one of the most important financial innovations.",
  "s": "Reread lesson 10.2."
 },
 {
  "id": "t10q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Invest in what you know",
  "p": "What did Peter Lynch actually mean by \"invest in what you know\"?",
  "o": [
   "Only buy local companies",
   "Avoid research",
   "Buy any company whose products you like",
   "Use everyday observations to find ideas, then do thorough research before buying"
  ],
  "a": 3,
  "e": "The observation is the start, not the analysis.",
  "s": "Reread lesson 10.2."
 },
 {
  "id": "t10q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Soros 1992",
  "p": "How did Soros make about $1 billion in 1992?",
  "o": [
   "Buying bonds",
   "Betting the UK couldn't keep the pound in the European exchange-rate mechanism",
   "Shorting gold",
   "Buying tech stocks"
  ],
  "a": 1,
  "e": "\"Breaking the Bank of England\".",
  "s": "Reread lesson 10.2."
 },
 {
  "id": "t10q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Ponzi",
  "p": "How does a Ponzi scheme pay its returns?",
  "o": [
   "With money from new investors",
   "From profitable investments",
   "From government grants",
   "From dividends"
  ],
  "a": 0,
  "e": "It collapses when new money dries up.",
  "s": "Reread lesson 10.3."
 },
 {
  "id": "t10q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "FTX",
  "p": "What was the core of the FTX fraud?",
  "o": [
   "Insider trading",
   "A hacked exchange",
   "Tax evasion",
   "Secretly using customers' deposits for an affiliated firm's trading and spending"
  ],
  "a": 3,
  "e": "Customer funds should be segregated.",
  "s": "Reread lesson 10.3."
 },
 {
  "id": "t10q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Red flags",
  "p": "Which combination is the strongest warning sign?",
  "o": [
   "A long track record with losing years",
   "Guaranteed high returns, pressure to act quickly, and difficulty withdrawing",
   "Low fees and an ASIC licence",
   "A large, well-known issuer"
  ],
  "a": 1,
  "e": "Classic scam features.",
  "s": "Reread lesson 10.3."
 },
 {
  "id": "t10q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Synthesis",
  "p": "Which habit ties the course together?",
  "o": [
   "Trading frequently",
   "Separating evidence from stories, thinking in probabilities, and knowing your own biases",
   "Following confident forecasts",
   "Avoiding all risk"
  ],
  "a": 1,
  "e": "Thinking well is the core investing skill.",
  "s": "Reread lesson 10.4."
 },
 {
  "id": "t10q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Outliers",
  "p": "Why are the legends' records weak evidence that ordinary investors should copy their strategies?",
  "o": [
   "They lost money",
   "Their strategies are illegal",
   "They're rare outliers selected from many who tried, often with unique skills or resources (survivorship bias)",
   "They lied"
  ],
  "a": 2,
  "e": "Study their discipline; don't assume you'll match their results.",
  "s": "Reread lesson 10.2."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-10-quiz",
 "title": "Markets Week 10 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-10.html",
  "label": "Week 10"
 },
 "lede": "Investing legends, frauds and review. 10 questions; take it after the scenario exercise, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 10 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
