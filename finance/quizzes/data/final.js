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
  "name": "Week 3: Reading a company",
  "short": "Reading a company",
  "res": [
   [
    "Review week 3",
    "../weeks/week-03.html"
   ]
  ]
 },
 "w4": {
  "name": "Week 4: What moves markets",
  "short": "What moves markets",
  "res": [
   [
    "Review week 4",
    "../weeks/week-04.html"
   ]
  ]
 },
 "w5": {
  "name": "Week 5: Beyond shares: other asset classes",
  "short": "Beyond shares",
  "res": [
   [
    "Review week 5",
    "../weeks/week-05.html"
   ]
  ]
 },
 "w6": {
  "name": "Week 6: Bubbles and crashes",
  "short": "Bubbles and crashes",
  "res": [
   [
    "Review week 6",
    "../weeks/week-06.html"
   ]
  ]
 },
 "w7": {
  "name": "Week 7: Traders, funds and market players",
  "short": "Traders",
  "res": [
   [
    "Review week 7",
    "../weeks/week-07.html"
   ]
  ]
 },
 "w8": {
  "name": "Week 8: Today's market: AI, news and psychology",
  "short": "Today's market",
  "res": [
   [
    "Review week 8",
    "../weeks/week-08.html"
   ]
  ]
 },
 "w9": {
  "name": "Week 9: Personal investing with ETFs (Australia)",
  "short": "Personal investing with ETFs (Australia)",
  "res": [
   [
    "Review week 9",
    "../weeks/week-09.html"
   ]
  ]
 },
 "w10": {
  "name": "Week 10: Investing legends, frauds and review",
  "short": "Investing legends",
  "res": [
   [
    "Review week 10",
    "../weeks/week-10.html"
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
  "k": "scenario",
  "c": "Margins",
  "p": "Revenue is $200m and operating income $50m. What's the operating margin?",
  "o": [
   "400%",
   "25%",
   "4%",
   "50%"
  ],
  "a": 1,
  "e": "50 / 200 = 25%.",
  "s": "Review week 3"
 },
 {
  "id": "fq14",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Cash vs profit",
  "p": "Which is the clearest red flag in financial statements?",
  "o": [
   "A low P/E",
   "Paying dividends",
   "Rising revenue",
   "Profits that consistently fail to turn into operating cash flow"
  ],
  "a": 3,
  "e": "Enron and Wirecard both showed it.",
  "s": "Review week 3"
 },
 {
  "id": "fq15",
  "l": 1,
  "t": "w3",
  "k": "concept",
  "c": "Moat",
  "p": "What best indicates a durable competitive advantage?",
  "o": [
   "A rising share price",
   "A famous brand alone",
   "One great year",
   "High returns on invested capital sustained over many years"
  ],
  "a": 3,
  "e": "Sustained high ROIC.",
  "s": "Review week 3"
 },
 {
  "id": "fq16",
  "l": 1,
  "t": "w3",
  "k": "scenario",
  "c": "Net debt",
  "p": "Debt $6bn, cash $1bn, EBITDA $2.5bn. Net debt to EBITDA?",
  "o": [
   "3×",
   "2.4×",
   "0.5×",
   "2×"
  ],
  "a": 3,
  "e": "(6 − 1) / 2.5 = 2×.",
  "s": "Review week 3"
 },
 {
  "id": "fq17",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Rates and growth stocks",
  "p": "Why are long-duration growth stocks most sensitive to rising rates?",
  "o": [
   "Most of their value comes from distant profits, which higher discount rates shrink most",
   "They have more debt",
   "They pay dividends",
   "They're in the Dow"
  ],
  "a": 0,
  "e": "Duration applies to stocks too.",
  "s": "Review week 4"
 },
 {
  "id": "fq18",
  "l": 1,
  "t": "w4",
  "k": "scenario",
  "c": "Bonds",
  "p": "Yields on 10-year bonds rise from 3% to 4.5%. What happens to existing 10-year bond prices?",
  "o": [
   "They rise",
   "They fall",
   "No change",
   "They're repaid"
  ],
  "a": 1,
  "e": "Prices and yields move oppositely.",
  "s": "Review week 4"
 },
 {
  "id": "fq19",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Inverted curve",
  "p": "What has an inverted US yield curve historically signalled?",
  "o": [
   "Rising stocks next week",
   "Booms",
   "Recessions, with variable timing",
   "Inflation"
  ],
  "a": 2,
  "e": "Short rates above long rates.",
  "s": "Review week 4"
 },
 {
  "id": "fq20",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Inflation shock",
  "p": "High inflation typically leads central banks to do what?",
  "o": [
   "Cut rates",
   "Raise rates, which tends to lower bond and stock prices",
   "Nothing",
   "Buy shares"
  ],
  "a": 1,
  "e": "2022 is the recent example.",
  "s": "Review week 4"
 },
 {
  "id": "fq21",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Forward-looking",
  "p": "Why can stocks rise during a recession?",
  "o": [
   "Errors",
   "Markets price expected future profits and often turn up before the economic data improves",
   "They can't",
   "Governments buy shares"
  ],
  "a": 1,
  "e": "The market leads the economy.",
  "s": "Review week 4"
 },
 {
  "id": "fq22",
  "l": 1,
  "t": "w4",
  "k": "concept",
  "c": "Minsky",
  "p": "According to Minsky, what does a long period of stability tend to produce?",
  "o": [
   "More risk-taking and borrowing, setting up instability",
   "Higher taxes",
   "Deflation",
   "Permanent stability"
  ],
  "a": 0,
  "e": "Stability breeds instability.",
  "s": "Review week 4"
 },
 {
  "id": "fq23",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "Bonds' role",
  "p": "What is the main role of high-quality government bonds in a portfolio?",
  "o": [
   "Maximum growth",
   "Inflation protection in all cases",
   "Speculation",
   "Stability, and usually a cushion when shares fall in recessions"
  ],
  "a": 3,
  "e": "With 2022 as the exception.",
  "s": "Review week 5"
 },
 {
  "id": "fq24",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "Non-productive",
  "p": "Why is gold described as a non-productive asset?",
  "o": [
   "It's hard to buy",
   "It produces no cash flow; returns depend only on what the next buyer pays",
   "It's illegal to own",
   "It always falls"
  ],
  "a": 1,
  "e": "Productive vs non-productive assets.",
  "s": "Review week 5"
 },
 {
  "id": "fq25",
  "l": 1,
  "t": "w5",
  "k": "scenario",
  "c": "Currency",
  "p": "You hold unhedged global shares and the Australian dollar rises sharply. What happens to your returns in Australian dollars?",
  "o": [
   "They double",
   "No effect",
   "They fall, because foreign assets are worth fewer Australian dollars",
   "They rise"
  ],
  "a": 2,
  "e": "Currency is part of the return.",
  "s": "Review week 5"
 },
 {
  "id": "fq26",
  "l": 1,
  "t": "w5",
  "k": "concept",
  "c": "Allocation",
  "p": "Which choice matters most for a diversified portfolio's long-run risk?",
  "o": [
   "The mix of asset classes",
   "Broker",
   "Which day you buy",
   "The fund's logo"
  ],
  "a": 0,
  "e": "Asset allocation.",
  "s": "Review week 5"
 },
 {
  "id": "fq27",
  "l": 1,
  "t": "w6",
  "k": "concept",
  "c": "1929",
  "p": "What made the Great Depression so severe after the 1929 crash?",
  "o": [
   "Strong policy response",
   "High stock prices",
   "Low unemployment",
   "Bank failures, a passive central bank, the gold standard, tariffs and deflation"
  ],
  "a": 3,
  "e": "Policy mistakes deepened the bust.",
  "s": "Review week 6"
 },
 {
  "id": "fq28",
  "l": 1,
  "t": "w6",
  "k": "concept",
  "c": "1987",
  "p": "What was distinctive about the 1987 crash?",
  "o": [
   "It lasted a decade",
   "Bank failures",
   "It hit only Japan",
   "A 22.6% one-day fall amplified by automated selling, with no recession and a recovery in about two years"
  ],
  "a": 3,
  "e": "Market structure can cause crashes.",
  "s": "Review week 6"
 },
 {
  "id": "fq29",
  "l": 1,
  "t": "w6",
  "k": "concept",
  "c": "Dot-com",
  "p": "What's the key investing lesson of the dot-com bust?",
  "o": [
   "Profits are irrelevant",
   "Avoid all tech",
   "A world-changing technology can still be a poor investment if prices assume too much",
   "The internet failed"
  ],
  "a": 2,
  "e": "Price determines return.",
  "s": "Review week 6"
 },
 {
  "id": "fq30",
  "l": 1,
  "t": "w6",
  "k": "concept",
  "c": "2008",
  "p": "What combination made 2008 a global financial crisis rather than a housing slump?",
  "o": [
   "High interest rates only",
   "Low leverage",
   "Bad mortgages securitised and spread worldwide, held by highly leveraged banks, leading to a credit freeze",
   "A pandemic"
  ],
  "a": 2,
  "e": "Leverage plus complexity plus panic.",
  "s": "Review week 6"
 },
 {
  "id": "fq31",
  "l": 1,
  "t": "w6",
  "k": "concept",
  "c": "2020",
  "p": "Why did the 2020 crash recover in about six months?",
  "o": [
   "The banking system was sound and policy support was immediate and massive",
   "Only bonds fell",
   "The economy was booming",
   "Stocks were cheap"
  ],
  "a": 0,
  "e": "External shock, fast response.",
  "s": "Review week 6"
 },
 {
  "id": "fq32",
  "l": 1,
  "t": "w6",
  "k": "concept",
  "c": "Common thread",
  "p": "What do the most severe crashes (1929, 2008) have in common?",
  "o": [
   "Heavy debt and leverage, which turned falling prices into self-reinforcing spirals",
   "Tech stocks",
   "Pandemics",
   "High dividends"
  ],
  "a": 0,
  "e": "Debt-driven crashes are the worst.",
  "s": "Review week 6"
 },
 {
  "id": "fq33",
  "l": 1,
  "t": "w7",
  "k": "concept",
  "c": "Day trading evidence",
  "p": "What fraction of persistent Brazilian day traders lost money in the major study?",
  "o": [
   "None",
   "About 30%",
   "About 97%",
   "About 50%"
  ],
  "a": 2,
  "e": "And experience didn't help.",
  "s": "Review week 7"
 },
 {
  "id": "fq34",
  "l": 1,
  "t": "w7",
  "k": "concept",
  "c": "Who wins",
  "p": "Who most reliably profits from heavy retail trading?",
  "o": [
   "The average day trader",
   "Regulators",
   "Index investors",
   "Brokers, market makers, exchanges and course sellers"
  ],
  "a": 3,
  "e": "Follow the money.",
  "s": "Review week 7"
 },
 {
  "id": "fq35",
  "l": 1,
  "t": "w7",
  "k": "scenario",
  "c": "Options",
  "p": "A put option with a $50 strike costs $3. The share falls to $40 at expiry. What's the put buyer's profit per share?",
  "o": [
   "$7",
   "$10",
   "$3",
   "−$3"
  ],
  "a": 0,
  "e": "Worth $10 at expiry, minus the $3 premium.",
  "s": "Review week 7"
 },
 {
  "id": "fq36",
  "l": 1,
  "t": "w7",
  "k": "concept",
  "c": "Leveraged ETF decay",
  "p": "Why do daily-reset leveraged ETFs lose value in volatile, sideways markets?",
  "o": [
   "Fees only",
   "Compounding of daily leveraged moves: losses after gains and gains after losses don't cancel",
   "They're frauds",
   "They hold bonds"
  ],
  "a": 1,
  "e": "Volatility decay.",
  "s": "Review week 7"
 },
 {
  "id": "fq37",
  "l": 1,
  "t": "w8",
  "k": "concept",
  "c": "AI vs dot-com",
  "p": "Which statement best compares the AI boom with the dot-com bubble?",
  "o": [
   "They're identical",
   "AI is risk-free",
   "The AI leaders are far more profitable, but concentration and investment spending are very high, so both boom and bust outcomes are possible",
   "The dot-com companies were more profitable"
  ],
  "a": 2,
  "e": "Use evidence, not narratives.",
  "s": "Review week 8"
 },
 {
  "id": "fq38",
  "l": 1,
  "t": "w8",
  "k": "concept",
  "c": "Concentration",
  "p": "What does high concentration mean for an index investor?",
  "o": [
   "Nothing",
   "They pay more fees",
   "Their returns depend heavily on a few large companies sharing similar exposures",
   "They own fewer companies"
  ],
  "a": 2,
  "e": "Know what you own.",
  "s": "Review week 8"
 },
 {
  "id": "fq39",
  "l": 1,
  "t": "w8",
  "k": "scenario",
  "c": "Earnings reaction",
  "p": "Revenue grew 40% but shares fell 12% after results. Most likely why?",
  "o": [
   "Markets are random",
   "Fraud",
   "Dividends cut",
   "Expectations or guidance were even higher"
  ],
  "a": 3,
  "e": "Results versus expectations.",
  "s": "Review week 8"
 },
 {
  "id": "fq40",
  "l": 1,
  "t": "w8",
  "k": "concept",
  "c": "Behaviour gap",
  "p": "What is the investor behaviour gap?",
  "o": [
   "The shortfall between investors' returns and their funds' returns caused by poorly timed buying and selling",
   "A tax",
   "A spread",
   "Fund fees"
  ],
  "a": 0,
  "e": "Buying high, selling low.",
  "s": "Review week 8"
 },
 {
  "id": "fq41",
  "l": 1,
  "t": "w8",
  "k": "concept",
  "c": "Basics",
  "p": "Which set of principles does the evidence most support for long-term investors?",
  "o": [
   "Broad, low-cost diversification, a mix you can stick with, regular investing and staying invested",
   "Frequent trading of hot stocks",
   "Leverage in bull markets",
   "Market timing with forecasts"
  ],
  "a": 0,
  "e": "Simple, cheap and disciplined.",
  "s": "Review week 8"
 },
 {
  "id": "fq42",
  "l": 1,
  "t": "w8",
  "k": "scenario",
  "c": "Crash response",
  "p": "Your diversified index portfolio falls 35% in a crash. Your plan and time horizon haven't changed. What does history suggest?",
  "o": [
   "Stick to the plan (and rebalance if that's your rule); selling locks in losses and risks missing the rebound",
   "Switch to a hot stock",
   "Borrow to buy more",
   "Sell everything"
  ],
  "a": 0,
  "e": "Every broad-market crash so far has eventually recovered, though some took many years.",
  "s": "Review weeks 6 and 8"
 },
 {
  "id": "fq43",
  "l": 1,
  "t": "w9",
  "k": "concept",
  "c": "Choosing ETFs",
  "p": "For a core holding, what's the sensible order of priorities when choosing an ETF?",
  "o": [
   "Recent return, then logo",
   "Share price",
   "Theme popularity",
   "The index (what you own), then fees, size and structure"
  ],
  "a": 3,
  "e": "What you own, then cost.",
  "s": "Review week 9"
 },
 {
  "id": "fq44",
  "l": 1,
  "t": "w9",
  "k": "concept",
  "c": "Lump sum",
  "p": "Historically, how has investing a lump sum immediately compared with spreading it out?",
  "o": [
   "Only better in crashes",
   "Identical",
   "Always worse",
   "Better about two-thirds of the time, since markets usually rise"
  ],
  "a": 3,
  "e": "Spreading mainly reduces regret.",
  "s": "Review week 9"
 },
 {
  "id": "fq45",
  "l": 1,
  "t": "w9",
  "k": "concept",
  "c": "CHESS",
  "p": "What does CHESS sponsorship give you?",
  "o": [
   "Higher returns",
   "Free trades",
   "Tax exemption",
   "Holdings registered in your own name under your HIN"
  ],
  "a": 3,
  "e": "Ownership doesn't depend on the broker.",
  "s": "Review week 9"
 },
 {
  "id": "fq46",
  "l": 1,
  "t": "w9",
  "k": "concept",
  "c": "Franking",
  "p": "Who benefits most from franking credits?",
  "o": [
   "Nobody",
   "Short sellers",
   "Australian investors with a tax rate below the company tax rate, including many retirees and super funds",
   "High-income foreign investors"
  ],
  "a": 2,
  "e": "Excess credits are refundable.",
  "s": "Review week 9"
 },
 {
  "id": "fq47",
  "l": 1,
  "t": "w10",
  "k": "concept",
  "c": "Margin of safety",
  "p": "What is Graham's margin of safety?",
  "o": [
   "Buying well below estimated value to protect against errors",
   "Diversifying across sectors",
   "Holding cash",
   "A stop-loss"
  ],
  "a": 0,
  "e": "Protection against your own mistakes.",
  "s": "Review week 10"
 },
 {
  "id": "fq48",
  "l": 1,
  "t": "w10",
  "k": "concept",
  "c": "Bogle",
  "p": "What is Bogle's main lesson for ordinary investors?",
  "o": [
   "Buy gold",
   "Pick star managers",
   "Own the whole market cheaply: costs are the one thing you can control",
   "Trade often"
  ],
  "a": 2,
  "e": "\"Buy the haystack.\"",
  "s": "Review week 10"
 },
 {
  "id": "fq49",
  "l": 1,
  "t": "w10",
  "k": "concept",
  "c": "Madoff",
  "p": "What made Madoff's returns suspicious?",
  "o": [
   "They were too smooth and consistent for years, from a strategy nobody could replicate",
   "They were negative",
   "He charged nothing",
   "They were too low"
  ],
  "a": 0,
  "e": "Real investments have bad months.",
  "s": "Review week 10"
 },
 {
  "id": "fq50",
  "l": 1,
  "t": "w10",
  "k": "scenario",
  "c": "Scam",
  "p": "An unlicensed online \"adviser\" guarantees 20% a month and wants payment in crypto. What should you do?",
  "o": [
   "Invest a little",
   "Negotiate",
   "Don't engage; check ASIC's register and Moneysmart's warnings, and report it",
   "Ask for references"
  ],
  "a": 2,
  "e": "Classic red flags.",
  "s": "Review week 10"
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
 "lede": "50 questions across all ten weeks: markets, valuation, companies, macro, other assets, crashes, traders, today's market, personal investing and the legends. Take it after week 5, without notes.",
 "topicOrder": [
  "w1",
  "w2",
  "w3",
  "w4",
  "w5",
  "w6",
  "w7",
  "w8",
  "w9",
  "w10"
 ],
 "levels": {
  "1": {
   "name": "Final exam",
   "desc": "50 questions, about 5 per week. Score 70% to pass."
  }
 }
}, { topics: TOPICS, questions: Q });
})();
