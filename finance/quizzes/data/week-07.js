/* Markets week 7 quiz: Traders, funds and market players */
(function () {
"use strict";
const TOPICS = {
 "l1": {
  "name": "7.1 How day traders try to make money",
  "short": "How day traders try to make money",
  "res": [
   [
    "Reread lesson 7.1",
    "../weeks/week-07.html#w7-l1"
   ],
   [
    "Research: Day Trading for a Living? (Chague, De-Losso and Giovannetti)",
    "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101"
   ]
  ]
 },
 "l2": {
  "name": "7.2 Who profits from trading activity",
  "short": "Who profits from trading activity",
  "res": [
   [
    "Reread lesson 7.2",
    "../weeks/week-07.html#w7-l2"
   ]
  ]
 },
 "l3": {
  "name": "7.3 Hedge funds and short sellers",
  "short": "Hedge funds",
  "res": [
   [
    "Reread lesson 7.3",
    "../weeks/week-07.html#w7-l3"
   ]
  ]
 },
 "l4": {
  "name": "7.4 Options and leverage",
  "short": "Options",
  "res": [
   [
    "Reread lesson 7.4",
    "../weeks/week-07.html#w7-l4"
   ]
  ]
 }
};
const Q = [
 {
  "id": "t7q01",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Edge vs costs",
  "p": "What must a day trader's edge exceed to make money?",
  "o": [
   "Their broker's profit",
   "The index return",
   "Zero",
   "All trading costs: spreads, commissions, financing and taxes"
  ],
  "a": 3,
  "e": "Most retail edges are smaller than costs.",
  "s": "Reread lesson 7.1."
 },
 {
  "id": "t7q02",
  "l": 1,
  "t": "l1",
  "k": "concept",
  "c": "Evidence",
  "p": "What do large studies of retail day traders consistently find?",
  "o": [
   "Experience guarantees success",
   "The large majority lose money, and very few earn a reliable income",
   "Women lose more",
   "Most are profitable"
  ],
  "a": 1,
  "e": "Brazil: 97% of persistent traders lost; Taiwan: under 1% predictably profitable.",
  "s": "Reread lesson 7.1."
 },
 {
  "id": "t7q03",
  "l": 1,
  "t": "l1",
  "k": "scenario",
  "c": "CFD disclosure",
  "p": "A platform states \"74% of retail investor accounts lose money when trading CFDs\". What is this?",
  "o": [
   "A regulator-required risk warning based on the platform's own clients",
   "An estimate for professionals",
   "A guarantee",
   "Marketing"
  ],
  "a": 0,
  "e": "These numbers come from real client accounts.",
  "s": "Reread lesson 7.1."
 },
 {
  "id": "t7q04",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Market makers",
  "p": "How do market makers mainly earn money?",
  "o": [
   "Predicting direction",
   "Government fees",
   "Capturing the bid-ask spread on large volumes of two-way trading",
   "Dividends"
  ],
  "a": 2,
  "e": "They profit from flow, not forecasts.",
  "s": "Reread lesson 7.2."
 },
 {
  "id": "t7q05",
  "l": 1,
  "t": "l2",
  "k": "concept",
  "c": "Payment for order flow",
  "p": "What is payment for order flow?",
  "o": [
   "A tax",
   "Market makers paying brokers to fill their customers' orders",
   "A dividend",
   "An exchange fee"
  ],
  "a": 1,
  "e": "It funds zero-commission trading, and rewards brokers for more trading.",
  "s": "Reread lesson 7.2."
 },
 {
  "id": "t7q06",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "2 and 20",
  "p": "What does the traditional hedge fund fee of \"2 and 20\" mean?",
  "o": [
   "2% return, 20% risk",
   "20 trades per day",
   "2% of assets a year plus 20% of profits",
   "A 2-year lock-up"
  ],
  "a": 2,
  "e": "High fees are a large hurdle to beating an index.",
  "s": "Reread lesson 7.3."
 },
 {
  "id": "t7q07",
  "l": 1,
  "t": "l3",
  "k": "concept",
  "c": "Buffett's bet",
  "p": "What was the result of Buffett's 10-year bet against hedge funds?",
  "o": [
   "It was a draw",
   "The hedge funds won",
   "It was cancelled",
   "An S&P 500 index fund returned about 7% a year against about 2% for the funds"
  ],
  "a": 3,
  "e": "Costs and the difficulty of beating the market.",
  "s": "Reread lesson 7.3."
 },
 {
  "id": "t7q08",
  "l": 1,
  "t": "l3",
  "k": "scenario",
  "c": "Short squeeze",
  "p": "Why can a heavily shorted stock rise explosively?",
  "o": [
   "Short sellers rushing to buy back shares to limit losses push the price higher, forcing more to buy",
   "Dividends rise",
   "Companies buy their own shares",
   "Regulators intervene"
  ],
  "a": 0,
  "e": "GameStop, January 2021.",
  "s": "Reread lesson 7.3."
 },
 {
  "id": "t7q09",
  "l": 1,
  "t": "l4",
  "k": "concept",
  "c": "Put options",
  "p": "How can a shareholder use a put option?",
  "o": [
   "To borrow money",
   "To receive dividends",
   "As insurance: it gains value if the share falls below the strike, limiting losses",
   "To vote"
  ],
  "a": 2,
  "e": "Options can reduce risk as well as add it.",
  "s": "Reread lesson 7.4."
 },
 {
  "id": "t7q10",
  "l": 1,
  "t": "l4",
  "k": "scenario",
  "c": "Margin call",
  "p": "An investor uses 5:1 leverage and the position falls 20%. What happens?",
  "o": [
   "They lose 4%",
   "Nothing until they sell",
   "Their capital is wiped out, and the broker closes the position",
   "They lose 20%"
  ],
  "a": 2,
  "e": "5 × 20% = 100% of their capital.",
  "s": "Reread lesson 7.4."
 }
];
window.AUDIT = Object.assign({
 "id": "finance-07-quiz",
 "title": "Markets Week 7 Quiz",
 "eyebrow": "End-of-week quiz",
 "noun": "quiz",
 "back": {
  "href": "../weeks/week-07.html",
  "label": "Week 7"
 },
 "lede": "Traders, funds and market players. 10 questions; take it after the scenario exercise, without notes.",
 "topicOrder": [
  "l1",
  "l2",
  "l3",
  "l4"
 ],
 "levels": {
  "1": {
   "name": "Week 7 quiz",
   "desc": "10 questions across all four lessons. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
