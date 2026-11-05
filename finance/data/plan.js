/* The Markets and Investing course plan. Week pages, the overview page and the progress summary all read from this. */
window.SYLLABUS = {
  "id": "finance",
  "title": "Markets and Investing",
  "hoursPerWeek": 5,
  "lede": "A 10-week course on understanding the global stock market: how it works, how to read a company, what moves markets, other asset classes, the great crashes from 1929 to 2022, traders and hedge funds, today's AI-driven market, personal investing with ETFs in Australia, and the great investors and frauds. Education, not financial advice.",
  "how": [
    [
      "Lessons (about 3 h)",
      "Read each lesson, answer the checkpoints, try the widgets and watch the linked video. Mark each lesson complete as you go."
    ],
    [
      "Scenario exercise (60–90 min)",
      "Apply the week to real markets and history in <code>finance/exercises/</code>, then record your status and notes."
    ],
    [
      "Quizzes (30 min a week)",
      "A 10-question quiz each week, then a 50-question <a href=\"quizzes/final.html\">final exam</a> across the whole course. 70% to pass."
    ]
  ],
  "passingLabel": "Drafted",
  "notesPlaceholder": "e.g. The bond widget finally made yields click. Unsure how to judge whether today's P/E is too high.",
  "weeks": [
    {
      "n": 1,
      "slug": "week-01",
      "status": "ready",
      "title": "How the stock market works",
      "summary": "What a share is, why companies list, how exchanges and prices work, what indices measure, and the main ways people own the market.",
      "objectives": [
        {
          "id": "w1-o1",
          "text": "Explain what a share is, why companies issue them, and how shareholders get paid"
        },
        {
          "id": "w1-o2",
          "text": "Describe how exchanges, order books, bid and ask prices and market makers set prices"
        },
        {
          "id": "w1-o3",
          "text": "Explain what an index measures and why most major indices are weighted by market capitalisation"
        },
        {
          "id": "w1-o4",
          "text": "Compare individual stocks, managed funds, index funds and ETFs"
        }
      ],
      "lessons": [
        {
          "id": "w1-l1",
          "title": "Shares, companies and owners",
          "minutes": 40
        },
        {
          "id": "w1-l2",
          "title": "Exchanges and how prices are set",
          "minutes": 40
        },
        {
          "id": "w1-l3",
          "title": "Indices: what \"the market\" means",
          "minutes": 40
        },
        {
          "id": "w1-l4",
          "title": "Ways to own the market",
          "minutes": 35
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: read the market",
        "path": "finance/exercises/week-01.md"
      },
      "quiz": "finance-01-quiz",
      "quizQuestions": 10
    },
    {
      "n": 2,
      "slug": "week-02",
      "status": "ready",
      "title": "Value, return and risk",
      "summary": "How investors value companies, the power of compounding and the damage of fees, the relationship between risk and return, and why diversification is the closest thing to a free lunch.",
      "objectives": [
        {
          "id": "w2-o1",
          "text": "Explain earnings, the P/E ratio and earnings yield, and what a high or low P/E implies"
        },
        {
          "id": "w2-o2",
          "text": "Calculate compound growth, and show how fees and time change outcomes"
        },
        {
          "id": "w2-o3",
          "text": "Explain the link between risk and expected return, and measure risk with volatility and drawdowns"
        },
        {
          "id": "w2-o4",
          "text": "Explain diversification and why it reduces risk without reducing expected return"
        }
      ],
      "lessons": [
        {
          "id": "w2-l1",
          "title": "Valuing a company",
          "minutes": 45
        },
        {
          "id": "w2-l2",
          "title": "Compounding and costs",
          "minutes": 40
        },
        {
          "id": "w2-l3",
          "title": "Risk and return",
          "minutes": 40
        },
        {
          "id": "w2-l4",
          "title": "Diversification",
          "minutes": 35
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: what's priced in?",
        "path": "finance/exercises/week-02.md"
      },
      "quiz": "finance-02-quiz",
      "quizQuestions": 10
    },
    {
      "n": 3,
      "slug": "week-03",
      "status": "ready",
      "title": "Reading a company",
      "summary": "The three financial statements, the numbers that matter in each, what makes a business durable (its moat), and how to put it together into a quick analysis of a real company.",
      "objectives": [
        {
          "id": "w3-o1",
          "text": "Read an income statement: revenue, gross and operating margins, net income and EPS"
        },
        {
          "id": "w3-o2",
          "text": "Read a balance sheet: assets, liabilities, equity, and how much debt is too much"
        },
        {
          "id": "w3-o3",
          "text": "Read a cash flow statement, and spot when profits aren't turning into cash"
        },
        {
          "id": "w3-o4",
          "text": "Judge a company's competitive advantage (moat), return on capital and management"
        }
      ],
      "lessons": [
        {
          "id": "w3-l1",
          "title": "The income statement",
          "minutes": 40
        },
        {
          "id": "w3-l2",
          "title": "The balance sheet",
          "minutes": 40
        },
        {
          "id": "w3-l3",
          "title": "The cash flow statement",
          "minutes": 35
        },
        {
          "id": "w3-l4",
          "title": "Moats and quality",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: analyse a real company",
        "path": "finance/exercises/week-03.md"
      },
      "quiz": "finance-03-quiz",
      "quizQuestions": 10
    },
    {
      "n": 4,
      "slug": "week-04",
      "status": "ready",
      "title": "What moves markets",
      "summary": "The big forces behind market-wide moves: interest rates and central banks, inflation, bonds and yields, the economic and credit cycle, and sentiment.",
      "objectives": [
        {
          "id": "w4-o1",
          "text": "Explain how central banks set interest rates and why rates affect stock valuations"
        },
        {
          "id": "w4-o2",
          "text": "Explain inflation, its causes, and why markets fear it"
        },
        {
          "id": "w4-o3",
          "text": "Explain how bonds work, why bond prices fall when yields rise, and what the yield curve signals"
        },
        {
          "id": "w4-o4",
          "text": "Describe the business and credit cycle, and the role of sentiment and liquidity"
        }
      ],
      "lessons": [
        {
          "id": "w4-l1",
          "title": "Central banks and interest rates",
          "minutes": 45
        },
        {
          "id": "w4-l2",
          "title": "Inflation",
          "minutes": 35
        },
        {
          "id": "w4-l3",
          "title": "Bonds and the yield curve",
          "minutes": 40
        },
        {
          "id": "w4-l4",
          "title": "Cycles, debt and sentiment",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: read the macro picture",
        "path": "finance/exercises/week-04.md"
      },
      "quiz": "finance-04-quiz",
      "quizQuestions": 10
    },
    {
      "n": 5,
      "slug": "week-05",
      "status": "ready",
      "title": "Beyond shares: other asset classes",
      "summary": "The other things investors own: bonds in practice, cash, property and REITs, commodities and gold, currencies and crypto, and how combining them changes a portfolio's risk.",
      "objectives": [
        {
          "id": "w5-o1",
          "text": "Explain the main types of bonds, their risks, and their role in a portfolio"
        },
        {
          "id": "w5-o2",
          "text": "Explain how property and REITs, commodities and gold earn (or don't earn) returns"
        },
        {
          "id": "w5-o3",
          "text": "Describe currency risk and the speculative nature of crypto assets"
        },
        {
          "id": "w5-o4",
          "text": "Explain asset allocation, and how mixing assets changes return and risk"
        }
      ],
      "lessons": [
        {
          "id": "w5-l1",
          "title": "Bonds and cash in practice",
          "minutes": 40
        },
        {
          "id": "w5-l2",
          "title": "Property, commodities and gold",
          "minutes": 40
        },
        {
          "id": "w5-l3",
          "title": "Currencies and crypto",
          "minutes": 35
        },
        {
          "id": "w5-l4",
          "title": "Asset allocation",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: build a multi-asset view",
        "path": "finance/exercises/week-05.md"
      },
      "quiz": "finance-05-quiz",
      "quizQuestions": 10
    },
    {
      "n": 6,
      "slug": "week-06",
      "status": "ready",
      "title": "Bubbles and crashes",
      "summary": "Six crashes that shaped modern markets: 1929, 1987, the dot-com bust, the 2008 financial crisis, the 2020 COVID crash and the 2022 rate shock. What caused each, and the patterns they share.",
      "objectives": [
        {
          "id": "w6-o1",
          "text": "Explain the causes and consequences of the 1929 crash and the Great Depression"
        },
        {
          "id": "w6-o2",
          "text": "Explain the 1987 crash, the dot-com bust and the 2008 financial crisis, and what each taught"
        },
        {
          "id": "w6-o3",
          "text": "Contrast the 2020 COVID crash and the 2022 rate-driven bear market with earlier crashes"
        },
        {
          "id": "w6-o4",
          "text": "Identify the recurring ingredients of bubbles and crashes, and how recoveries differ"
        }
      ],
      "lessons": [
        {
          "id": "w6-l1",
          "title": "1929 and the Great Depression",
          "minutes": 40
        },
        {
          "id": "w6-l2",
          "title": "1987 and the dot-com bust",
          "minutes": 45
        },
        {
          "id": "w6-l3",
          "title": "The 2008 global financial crisis",
          "minutes": 45
        },
        {
          "id": "w6-l4",
          "title": "2020, 2022 and the patterns",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: live through a crash",
        "path": "finance/exercises/week-06.md"
      },
      "quiz": "finance-06-quiz",
      "quizQuestions": 10
    },
    {
      "n": 7,
      "slug": "week-07",
      "status": "ready",
      "title": "Traders, funds and market players",
      "summary": "Who else is in the market and how they make money: day traders and the evidence on their results, market makers and high-frequency traders, brokers and payment for order flow, hedge funds, short sellers, and options and leverage.",
      "objectives": [
        {
          "id": "w7-o1",
          "text": "Explain how day traders try to make money, and what large studies show about their results"
        },
        {
          "id": "w7-o2",
          "text": "Explain how market makers, high-frequency traders and brokers earn money from trading activity"
        },
        {
          "id": "w7-o3",
          "text": "Describe hedge funds and short selling, including famous successes and blow-ups"
        },
        {
          "id": "w7-o4",
          "text": "Explain options and leverage at a basic level, and why they magnify both gains and losses"
        }
      ],
      "lessons": [
        {
          "id": "w7-l1",
          "title": "How day traders try to make money",
          "minutes": 45
        },
        {
          "id": "w7-l2",
          "title": "Who profits from trading activity",
          "minutes": 40
        },
        {
          "id": "w7-l3",
          "title": "Hedge funds and short sellers",
          "minutes": 40
        },
        {
          "id": "w7-l4",
          "title": "Options and leverage",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: follow the money",
        "path": "finance/exercises/week-07.md"
      },
      "quiz": "finance-07-quiz",
      "quizQuestions": 10
    },
    {
      "n": 8,
      "slug": "week-08",
      "status": "ready",
      "title": "Today's market: AI, news and psychology",
      "summary": "The AI boom and how it compares with the dot-com era, market concentration, reading earnings and financial news critically, and the investor psychology that costs people the most.",
      "objectives": [
        {
          "id": "w8-o1",
          "text": "Compare the AI boom with the dot-com bubble using valuations, profits, spending and concentration"
        },
        {
          "id": "w8-o2",
          "text": "Read an earnings report and financial headlines critically"
        },
        {
          "id": "w8-o3",
          "text": "Recognise the behavioural mistakes that most hurt investors"
        }
      ],
      "lessons": [
        {
          "id": "w8-l1",
          "title": "The AI boom through a historical lens",
          "minutes": 50
        },
        {
          "id": "w8-l2",
          "title": "Reading earnings and the news",
          "minutes": 40
        },
        {
          "id": "w8-l3",
          "title": "Investor psychology",
          "minutes": 35
        }
      ],
      "checkpoints": 6,
      "project": {
        "title": "Scenario exercise: your own market view",
        "path": "finance/exercises/week-08.md"
      },
      "quiz": "finance-08-quiz",
      "quizQuestions": 10
    },
    {
      "n": 9,
      "slug": "week-09",
      "status": "ready",
      "title": "Personal investing with ETFs (Australia)",
      "summary": "Putting the course into practice: foundations first, choosing ETFs, building and maintaining a simple portfolio, and the Australian practicalities of brokers, tax, franking credits and super.",
      "objectives": [
        {
          "id": "w9-o1",
          "text": "Explain the evidence-based basics of long-term investing"
        },
        {
          "id": "w9-o2",
          "text": "Compare ETFs on index, fees, size, structure, currency hedging and distribution policy"
        },
        {
          "id": "w9-o3",
          "text": "Describe how simple diversified ETF portfolios are built, funded and rebalanced"
        },
        {
          "id": "w9-o4",
          "text": "Explain Australian practicalities: brokers and CHESS, CGT, franking credits, and super versus investing outside it"
        }
      ],
      "lessons": [
        {
          "id": "w9-l1",
          "title": "Foundations and principles",
          "minutes": 35
        },
        {
          "id": "w9-l2",
          "title": "Choosing an ETF",
          "minutes": 40
        },
        {
          "id": "w9-l3",
          "title": "Building a simple portfolio",
          "minutes": 40
        },
        {
          "id": "w9-l4",
          "title": "Australian practicalities",
          "minutes": 45
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: design your own plan",
        "path": "finance/exercises/week-09.md"
      },
      "quiz": "finance-09-quiz",
      "quizQuestions": 10
    },
    {
      "n": 10,
      "slug": "week-10",
      "status": "ready",
      "title": "Investing legends, frauds and review",
      "summary": "What the great investors teach (Graham, Buffett, Bogle, Lynch, Soros, Dalio and Simons), how to recognise frauds and scams, and a review that ties the whole course together before the final exam.",
      "objectives": [
        {
          "id": "w10-o1",
          "text": "Explain the core ideas of value investing (Graham and Buffett)"
        },
        {
          "id": "w10-o2",
          "text": "Compare the approaches of Bogle, Lynch, Soros, Dalio and Simons, and what each teaches ordinary investors"
        },
        {
          "id": "w10-o3",
          "text": "Recognise the warning signs of investment frauds and scams"
        },
        {
          "id": "w10-o4",
          "text": "Connect the course's ideas into a coherent view of how markets work"
        }
      ],
      "lessons": [
        {
          "id": "w10-l1",
          "title": "Graham and Buffett: value investing",
          "minutes": 40
        },
        {
          "id": "w10-l2",
          "title": "Other legends: Bogle, Lynch, Soros, Dalio, Simons",
          "minutes": 45
        },
        {
          "id": "w10-l3",
          "title": "Frauds and scams",
          "minutes": 40
        },
        {
          "id": "w10-l4",
          "title": "Putting it all together",
          "minutes": 35
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: learn from a legend",
        "path": "finance/exercises/week-10.md"
      },
      "quiz": "finance-10-quiz",
      "quizQuestions": 10
    }
  ]
};
