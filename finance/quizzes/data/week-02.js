/* Markets week 2 quiz: Value, return and risk */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "2.1 Valuing a company",
  "short": "Valuing a company",
  "res": [
   [
    "Reread lesson 2.1",
    "../weeks/week-02.html#w2-l1"
   ]
  ]
 },
 "l2": {
  "name": "2.2 Compounding and costs",
  "short": "Compounding",
  "res": [
   [
    "Reread lesson 2.2",
    "../weeks/week-02.html#w2-l2"
   ],
   [
    "Tool: compound interest calculator",
    "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator"
   ]
  ]
 },
 "l3": {
  "name": "2.3 Risk and return",
  "short": "Risk",
  "res": [
   [
    "Reread lesson 2.3",
    "../weeks/week-02.html#w2-l3"
   ]
  ]
 },
 "l4": {
  "name": "2.4 Diversification",
  "short": "Diversification",
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
  "k": "concept",
  "c": "P/E",
  "p": "What does a P/E ratio of 30 mean?",
  "o": [
   "The company has 30 years of cash",
   "The price is $30",
   "The stock returns 30% a year",
   "Investors pay $30 for each $1 of the company's annual earnings"
  ],
  "a": 3,
  "e": "Higher P/E implies investors expect faster growth.",
  "s": "Reread lesson 2.1."
 },
 {
  "id": "t2q02",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "Value trap",
  "p": "A company trades on a P/E of 6, far below the market. What should you consider before calling it a bargain?",
  "o": [
   "Its logo",
   "Its share price",
   "Whether its earnings are likely to shrink (a declining business can deserve a low multiple)",
   "Nothing: low P/E means cheap"
  ],
  "a": 2,
  "e": "A low multiple often reflects real problems.",
  "s": "Reread lesson 2.1."
 },
 {
  "id": "t2q03",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Free cash flow",
  "p": "Why do many investors focus on free cash flow as well as earnings?",
  "o": [
   "It's required by law",
   "It's the actual cash left after investment, and harder to flatter with accounting choices",
   "It ignores capital spending",
   "It's always higher"
  ],
  "a": 1,
  "e": "Earnings involve accounting judgements; cash is harder to fake.",
  "s": "Reread lesson 2.1."
 },
 {
  "id": "t2q04",
  "l": 1,
  "t": "l2",
  "k": "scenario",
  "c": "Compounding",
  "p": "$10,000 grows at 7% a year. Roughly what is it after 30 years?",
  "o": [
   "$21,000",
   "$76,000",
   "$210,000",
   "$31,000"
  ],
  "a": 1,
  "e": "1.07³⁰ ≈ 7.6.",
  "s": "Try the compounding widget."
 },
 {
  "id": "t2q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Real return",
  "p": "Your investments returned 8% in a year when inflation was 5%. What's your real return, roughly?",
  "o": [
   "13%",
   "8%",
   "−3%",
   "3%"
  ],
  "a": 3,
  "e": "Real ≈ nominal − inflation.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q06",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Time vs timing",
  "p": "Why does starting to invest early matter so much?",
  "o": [
   "Fees are lower",
   "Markets are cheaper for young people",
   "It doesn't matter",
   "Compounding means the later years add the most, so extra years at the start have an outsized effect"
  ],
  "a": 3,
  "e": "Time in the market is the biggest lever most people have.",
  "s": "Reread lesson 2.2."
 },
 {
  "id": "t2q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Equity risk premium",
  "p": "What is the equity risk premium?",
  "o": [
   "A guaranteed bonus on shares",
   "The extra expected return of shares over safe assets, as compensation for bearing their risk",
   "A tax",
   "A broker fee"
  ],
  "a": 1,
  "e": "It's expected, not guaranteed, over any given period.",
  "s": "Reread lesson 2.3."
 },
 {
  "id": "t2q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Leverage",
  "p": "An investor borrows to double their exposure. The market falls 30%. What happens to their equity?",
  "o": [
   "It falls 30%",
   "It falls about 60%, and a lender may force them to sell at the bottom",
   "It's protected",
   "It falls 15%"
  ],
  "a": 1,
  "e": "Leverage magnifies losses and adds forced-selling risk; it's central to most crashes (week 4).",
  "s": "Reread lesson 2.3."
 },
 {
  "id": "t2q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Free lunch",
  "p": "Why is diversification called a free lunch?",
  "o": [
   "It reduces risk without reducing expected return",
   "It's free to buy funds",
   "It removes all losses",
   "It guarantees profits"
  ],
  "a": 0,
  "e": "Specific risks cancel out; expected return is the average.",
  "s": "Reread lesson 2.4."
 },
 {
  "id": "t2q10",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Correlation in crises",
  "p": "Why does diversification across risky assets help less during a panic?",
  "o": [
   "Funds stop trading",
   "Correlations rise: many risky assets fall together as investors sell what they can",
   "It helps more",
   "Markets close"
  ],
  "a": 1,
  "e": "Diversification works best over the long run.",
  "s": "Reread lesson 2.4."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-02-quiz",
 "title": "Markets Week 2 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-02.html",
  "label": "Week 2"
 },
 "lede": "Value, return and risk. 10 questions; take it after the scenario exercise, without notes.",
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
