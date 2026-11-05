/* Markets and Investing final exam */
(function () {
"use strict";
const TOPICS = {
 "w1": {
  "name": "Week 1: How the stock market works",
  "short": "How the stock market works",
  "res": [
   [
    "Review week 1",
    "../weeks/week-01.html"
   ]
  ]
 },
 "w2": {
  "name": "Week 2: Value, return and risk",
  "short": "Value",
  "res": [
   [
    "Review week 2",
    "../weeks/week-02.html"
   ]
  ]
 },
 "w3": {
  "name": "Week 3: What moves markets",
  "short": "What moves markets",
  "res": [
   [
    "Review week 3",
    "../weeks/week-03.html"
   ]
  ]
 },
 "w4": {
  "name": "Week 4: Bubbles and crashes",
  "short": "Bubbles and crashes",
  "res": [
   [
    "Review week 4",
    "../weeks/week-04.html"
   ]
  ]
 },
 "w5": {
  "name": "Week 5: Today's market: AI, news and investing",
  "short": "Today's market",
  "res": [
   [
    "Review week 5",
    "../weeks/week-05.html"
   ]
  ]
 }
};
const Q = [
 {
  "id": "fq01",
  "l": 1,
  "t": "w1",
  "k": "concept",
  "c": "Primary vs secondary",
  "p": "When does a company receive money from its shares?",
  "o": [
   "When it pays dividends",
   "Every time they trade",
   "When it issues them (an IPO or later share sale)",
   "When the price rises"
  ],
  "a": 2,
  "e": "Trading is between investors.",
  "s": "Review week 1"
 },
 {
  "id": "fq02",
  "l": 1,
  "t": "w1",
  "k": "scenario",
  "c": "Market cap",
  "p": "Company X: 500 million shares at $80. Company Y: 4 billion shares at $15. Which is larger?",
  "o": [
   "Can't tell",
   "They're equal",
   "Y: $60 billion versus $40 billion",
   "X, its price is higher"
  ],
  "a": 2,
  "e": "Market cap = price × shares.",
  "s": "Review week 1"
 },
 {
  "id": "fq03",
  "l": 1,
  "t": "w1",
  "k": "concept",
  "c": "Cap weighting",
  "p": "In a market-cap-weighted index, what drives most of the movement?",
  "o": [
   "The smallest companies",
   "All equally",
   "The largest companies",
   "The newest members"
  ],
  "a": 2,
  "e": "Weights follow size.",
  "s": "Review week 1"
 },
 {
  "id": "fq04",
  "l": 1,
  "t": "w1",
  "k": "concept",
  "c": "Bear market",
  "p": "What's the conventional definition of a bear market?",
  "o": [
   "Two quarters of falling GDP",
   "Any fall",
   "A fall of 20% or more from a peak",
   "A fall of 5%"
  ],
  "a": 2,
  "e": "10–20% is a correction.",
  "s": "Review week 1"
 },
 {
  "id": "fq05",
  "l": 1,
  "t": "w1",
  "k": "concept",
  "c": "Active vs passive",
  "p": "Why does the arithmetic favour index funds over the average active fund?",
  "o": [
   "They hold fewer stocks",
   "Before costs, active investors collectively earn the market return; after higher costs, they must on average trail it",
   "Indices are smarter",
   "Index funds pick better stocks"
  ],
  "a": 1,
  "e": "Sharpe's arithmetic.",
  "s": "Review week 1"
 },
 {
  "id": "fq06",
  "l": 1,
  "t": "w1",
  "k": "concept",
  "c": "Total return",
  "p": "What is total return?",
  "o": [
   "Price change only",
   "Price change plus dividends",
   "Return after tax",
   "Dividends only"
  ],
  "a": 1,
  "e": "Dividends are a large part of long-run returns.",
  "s": "Review week 1"
 },
 {
  "id": "fq07",
  "l": 1,
  "t": "w2",
  "k": "scenario",
  "c": "P/E",
  "p": "A stock at $90 earns $4.50 per share. What's its P/E?",
  "o": [
   "20",
   "4.5",
   "90",
   "40"
  ],
  "a": 0,
  "e": "90 / 4.5 = 20.",
  "s": "Review week 2"
 },
 {
  "id": "fq08",
  "l": 1,
  "t": "w2",
  "k": "concept",
  "c": "High P/E",
  "p": "What does a very high P/E usually imply?",
  "o": [
   "Investors expect fast earnings growth; disappointment can hit the price hard",
   "It pays big dividends",
   "The company is failing",
   "It's cheap"
  ],
  "a": 0,
  "e": "High expectations are fragile.",
  "s": "Review week 2"
 },
 {
  "id": "fq09",
  "l": 1,
  "t": "w2",
  "k": "scenario",
  "c": "Rule of 72",
  "p": "At 6% a year, roughly how long does money take to double?",
  "o": [
   "72 years",
   "18 years",
   "6 years",
   "12 years"
  ],
  "a": 3,
  "e": "72 / 6 = 12.",
  "s": "Review week 2"
 },
 {
  "id": "fq10",
  "l": 1,
  "t": "w2",
  "k": "scenario",
  "c": "Recovery maths",
  "p": "A portfolio falls 50%. What gain gets it back to even?",
  "o": [
   "75%",
   "25%",
   "100%",
   "50%"
  ],
  "a": 2,
  "e": "Half needs to double.",
  "s": "Review week 2"
 },
 {
  "id": "fq11",
  "l": 1,
  "t": "w2",
  "k": "concept",
  "c": "Diversification",
  "p": "What risk can't be diversified away by holding more shares?",
  "o": [
   "Fraud at one company",
   "A failed product",
   "Market-wide risk",
   "Company-specific risk"
  ],
  "a": 2,
  "e": "Systematic risk remains.",
  "s": "Review week 2"
 },
 {
  "id": "fq12",
  "l": 1,
  "t": "w2",
  "k": "concept",
  "c": "Fees",
  "p": "Why do small annual fees matter so much?",
  "o": [
   "They don't",
   "They're charged once",
   "They're tax-deductible",
   "They compound over decades, consuming a large share of final wealth"
  ],
  "a": 3,
  "e": "1.5% a year can cost about a third over 30 years.",
  "s": "Review week 2"
 },
 {
  "id": "fq13",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Rates and growth stocks",
  "p": "Why are long-duration growth stocks most sensitive to rising rates?",
  "o": [
   "They're in the Dow",
   "Most of their value comes from distant profits, which higher discount rates shrink most",
   "They have more debt",
   "They pay dividends"
  ],
  "a": 1,
  "e": "Duration applies to stocks too.",
  "s": "Review week 3"
 },
 {
  "id": "fq14",
  "l": 1,
  "t": "w3",
  "k": "scenario",
  "c": "Bonds",
  "p": "Yields on 10-year bonds rise from 3% to 4.5%. What happens to existing 10-year bond prices?",
  "o": [
   "They're repaid",
   "No change",
   "They rise",
   "They fall"
  ],
  "a": 3,
  "e": "Prices and yields move oppositely.",
  "s": "Review week 3"
 },
 {
  "id": "fq15",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Inverted curve",
  "p": "What has an inverted US yield curve historically signalled?",
  "o": [
   "Rising stocks next week",
   "Booms",
   "Inflation",
   "Recessions, with variable timing"
  ],
  "a": 3,
  "e": "Short rates above long rates.",
  "s": "Review week 3"
 },
 {
  "id": "fq16",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Inflation shock",
  "p": "High inflation typically leads central banks to do what?",
  "o": [
   "Buy shares",
   "Cut rates",
   "Nothing",
   "Raise rates, which tends to lower bond and stock prices"
  ],
  "a": 3,
  "e": "2022 is the recent example.",
  "s": "Review week 3"
 },
 {
  "id": "fq17",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Forward-looking",
  "p": "Why can stocks rise during a recession?",
  "o": [
   "Markets price expected future profits and often turn up before the economic data improves",
   "Errors",
   "Governments buy shares",
   "They can't"
  ],
  "a": 0,
  "e": "The market leads the economy.",
  "s": "Review week 3"
 },
 {
  "id": "fq18",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Minsky",
  "p": "According to Minsky, what does a long period of stability tend to produce?",
  "o": [
   "Permanent stability",
   "More risk-taking and borrowing, setting up instability",
   "Deflation",
   "Higher taxes"
  ],
  "a": 1,
  "e": "Stability breeds instability.",
  "s": "Review week 3"
 },
 {
  "id": "fq19",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "1929",
  "p": "What made the Great Depression so severe after the 1929 crash?",
  "o": [
   "Low unemployment",
   "Strong policy response",
   "Bank failures, a passive central bank, the gold standard, tariffs and deflation",
   "High stock prices"
  ],
  "a": 2,
  "e": "Policy mistakes deepened the bust.",
  "s": "Review week 4"
 },
 {
  "id": "fq20",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "1987",
  "p": "What was distinctive about the 1987 crash?",
  "o": [
   "It lasted a decade",
   "A 22.6% one-day fall amplified by automated selling, with no recession and a recovery in about two years",
   "It hit only Japan",
   "Bank failures"
  ],
  "a": 1,
  "e": "Market structure can cause crashes.",
  "s": "Review week 4"
 },
 {
  "id": "fq21",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Dot-com",
  "p": "What's the key investing lesson of the dot-com bust?",
  "o": [
   "The internet failed",
   "A world-changing technology can still be a poor investment if prices assume too much",
   "Profits are irrelevant",
   "Avoid all tech"
  ],
  "a": 1,
  "e": "Price determines return.",
  "s": "Review week 4"
 },
 {
  "id": "fq22",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "2008",
  "p": "What combination made 2008 a global financial crisis rather than a housing slump?",
  "o": [
   "Bad mortgages securitised and spread worldwide, held by highly leveraged banks, leading to a credit freeze",
   "A pandemic",
   "High interest rates only",
   "Low leverage"
  ],
  "a": 0,
  "e": "Leverage plus complexity plus panic.",
  "s": "Review week 4"
 },
 {
  "id": "fq23",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "2020",
  "p": "Why did the 2020 crash recover in about six months?",
  "o": [
   "The economy was booming",
   "Stocks were cheap",
   "Only bonds fell",
   "The banking system was sound and policy support was immediate and massive"
  ],
  "a": 3,
  "e": "External shock, fast response.",
  "s": "Review week 4"
 },
 {
  "id": "fq24",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Common thread",
  "p": "What do the most severe crashes (1929, 2008) have in common?",
  "o": [
   "Pandemics",
   "Heavy debt and leverage, which turned falling prices into self-reinforcing spirals",
   "High dividends",
   "Tech stocks"
  ],
  "a": 1,
  "e": "Debt-driven crashes are the worst.",
  "s": "Review week 4"
 },
 {
  "id": "fq25",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "AI vs dot-com",
  "p": "Which statement best compares the AI boom with the dot-com bubble?",
  "o": [
   "The dot-com companies were more profitable",
   "AI is risk-free",
   "The AI leaders are far more profitable, but concentration and investment spending are very high, so both boom and bust outcomes are possible",
   "They're identical"
  ],
  "a": 2,
  "e": "Use evidence, not narratives.",
  "s": "Review week 5"
 },
 {
  "id": "fq26",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "Concentration",
  "p": "What does high concentration mean for an index investor?",
  "o": [
   "Their returns depend heavily on a few large companies sharing similar exposures",
   "Nothing",
   "They own fewer companies",
   "They pay more fees"
  ],
  "a": 0,
  "e": "Know what you own.",
  "s": "Review week 5"
 },
 {
  "id": "fq27",
  "l": 1,
  "t": "w5",
  "k": "scenario",
  "c": "Earnings reaction",
  "p": "Revenue grew 40% but shares fell 12% after results. Most likely why?",
  "o": [
   "Fraud",
   "Markets are random",
   "Dividends cut",
   "Expectations or guidance were even higher"
  ],
  "a": 3,
  "e": "Results versus expectations.",
  "s": "Review week 5"
 },
 {
  "id": "fq28",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "Behaviour gap",
  "p": "What is the investor behaviour gap?",
  "o": [
   "Fund fees",
   "A tax",
   "A spread",
   "The shortfall between investors' returns and their funds' returns caused by poorly timed buying and selling"
  ],
  "a": 3,
  "e": "Buying high, selling low.",
  "s": "Review week 5"
 },
 {
  "id": "fq29",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "Basics",
  "p": "Which set of principles does the evidence most support for long-term investors?",
  "o": [
   "Leverage in bull markets",
   "Market timing with forecasts",
   "Broad, low-cost diversification, a mix you can stick with, regular investing and staying invested",
   "Frequent trading of hot stocks"
  ],
  "a": 2,
  "e": "Simple, cheap and disciplined.",
  "s": "Review week 5"
 },
 {
  "id": "fq30",
  "l": 1,
  "t": "w5",
  "k": "scenario",
  "c": "Crash response",
  "p": "Your diversified index portfolio falls 35% in a crash. Your plan and time horizon haven't changed. What does history suggest?",
  "o": [
   "Borrow to buy more",
   "Sell everything",
   "Stick to the plan (and rebalance if that's your rule); selling locks in losses and risks missing the rebound",
   "Switch to a hot stock"
  ],
  "a": 2,
  "e": "Every broad-market crash so far has eventually recovered, though some took many years.",
  "s": "Review week 4 and 5"
 }
];
window.AUDIT = Object.assign({
 "id": "finance-final",
 "title": "Markets and Investing Final Exam",
 "eyebrow": "Final exam",
 "noun": "exam",
 "back": {
  "href": "../index.html",
  "label": "Course overview"
 },
 "lede": "30 questions across all five weeks: how markets work, valuation and risk, macro forces, crash history, and today's market. Take it after week 5, without notes.",
 "topicOrder": [
  "w1",
  "w2",
  "w3",
  "w4",
  "w5"
 ],
 "levels": {
  "1": {
   "name": "Final exam",
   "desc": "30 questions, about 6 per week. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
