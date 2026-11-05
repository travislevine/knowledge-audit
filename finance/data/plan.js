/* The Markets and Investing course plan. Week pages, the overview page and the progress summary all read from this. */
window.SYLLABUS = {
  "id": "finance",
  "title": "Markets and Investing",
  "hoursPerWeek": 5,
  "lede": "A 5-week course on understanding the global stock market: how it works, what makes companies and markets go up and down, the great crashes from 1929 to 2022 and why they happened, and today's AI-driven market, ending with the evidence-based basics of investing. Education, not financial advice.",
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
      "A 10-question quiz each week, then a 30-question <a href=\"quizzes/final.html\">final exam</a> across the whole course. 70% to pass."
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
      "title": "What moves markets",
      "summary": "The big forces behind market-wide moves: interest rates and central banks, inflation, bonds and yields, the economic and credit cycle, and sentiment.",
      "objectives": [
        {
          "id": "w3-o1",
          "text": "Explain how central banks set interest rates and why rates affect stock valuations"
        },
        {
          "id": "w3-o2",
          "text": "Explain inflation, its causes, and why markets fear it"
        },
        {
          "id": "w3-o3",
          "text": "Explain how bonds work, why bond prices fall when yields rise, and what the yield curve signals"
        },
        {
          "id": "w3-o4",
          "text": "Describe the business and credit cycle, and the role of sentiment and liquidity"
        }
      ],
      "lessons": [
        {
          "id": "w3-l1",
          "title": "Central banks and interest rates",
          "minutes": 45
        },
        {
          "id": "w3-l2",
          "title": "Inflation",
          "minutes": 35
        },
        {
          "id": "w3-l3",
          "title": "Bonds and the yield curve",
          "minutes": 40
        },
        {
          "id": "w3-l4",
          "title": "Cycles, debt and sentiment",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: read the macro picture",
        "path": "finance/exercises/week-03.md"
      },
      "quiz": "finance-03-quiz",
      "quizQuestions": 10
    },
    {
      "n": 4,
      "slug": "week-04",
      "status": "ready",
      "title": "Bubbles and crashes",
      "summary": "Six crashes that shaped modern markets: 1929, 1987, the dot-com bust, the 2008 financial crisis, the 2020 COVID crash and the 2022 rate shock. What caused each, and the patterns they share.",
      "objectives": [
        {
          "id": "w4-o1",
          "text": "Explain the causes and consequences of the 1929 crash and the Great Depression"
        },
        {
          "id": "w4-o2",
          "text": "Explain the 1987 crash, the dot-com bust and the 2008 financial crisis, and what each taught"
        },
        {
          "id": "w4-o3",
          "text": "Contrast the 2020 COVID crash and the 2022 rate-driven bear market with earlier crashes"
        },
        {
          "id": "w4-o4",
          "text": "Identify the recurring ingredients of bubbles and crashes, and how recoveries differ"
        }
      ],
      "lessons": [
        {
          "id": "w4-l1",
          "title": "1929 and the Great Depression",
          "minutes": 40
        },
        {
          "id": "w4-l2",
          "title": "1987 and the dot-com bust",
          "minutes": 45
        },
        {
          "id": "w4-l3",
          "title": "The 2008 global financial crisis",
          "minutes": 45
        },
        {
          "id": "w4-l4",
          "title": "2020, 2022 and the patterns",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: live through a crash",
        "path": "finance/exercises/week-04.md"
      },
      "quiz": "finance-04-quiz",
      "quizQuestions": 10
    },
    {
      "n": 5,
      "slug": "week-05",
      "status": "ready",
      "title": "Today's market: AI, news and investing",
      "summary": "The AI boom and how it compares with the dot-com era, market concentration, reading earnings and financial news critically, investor psychology, and the evidence-based basics of investing.",
      "objectives": [
        {
          "id": "w5-o1",
          "text": "Compare the AI boom with the dot-com bubble using valuations, profits, spending and concentration"
        },
        {
          "id": "w5-o2",
          "text": "Read an earnings report and financial headlines critically"
        },
        {
          "id": "w5-o3",
          "text": "Recognise the behavioural mistakes that most hurt investors"
        },
        {
          "id": "w5-o4",
          "text": "Explain the evidence-based basics of long-term investing"
        }
      ],
      "lessons": [
        {
          "id": "w5-l1",
          "title": "The AI boom through a historical lens",
          "minutes": 50
        },
        {
          "id": "w5-l2",
          "title": "Reading earnings and the news",
          "minutes": 40
        },
        {
          "id": "w5-l3",
          "title": "Investor psychology",
          "minutes": 35
        },
        {
          "id": "w5-l4",
          "title": "Evidence-based investing basics",
          "minutes": 35
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Scenario exercise: your own market view",
        "path": "finance/exercises/week-05.md"
      },
      "quiz": "finance-05-quiz",
      "quizQuestions": 10
    }
  ]
};
