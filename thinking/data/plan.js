/* The Thinking Skills course plan. Week pages, the overview page and the progress summary all read from this. */
window.SYLLABUS = {
  "id": "thinking",
  "title": "Thinking Skills",
  "hoursPerWeek": 5,
  "lede": "A short course on reasoning well: how to evaluate arguments, reason with evidence and probability, catch the predictable errors in your own judgement, and solve problems and make decisions with structure. It follows the four areas of the Thinking Skills audit.",
  "how": [
    [
      "Lessons (about 3 h)",
      "Read each lesson, answer the checkpoints and watch the linked video. Mark each lesson complete as you go."
    ],
    [
      "Exercise (60–90 min)",
      "Apply the week to a real situation in <code>thinking/exercises/</code>. Then record your status and notes."
    ],
    [
      "Quiz and reflection (35 min)",
      "Finish with the 10-question quiz (70% to pass), then rate yourself on each objective and write a short reflection."
    ]
  ],
  "passingLabel": "Drafted",
  "notesPlaceholder": "e.g. The Bayes part clicked; the causal claim was harder. Not sure my issue tree is really MECE.",
  "weeks": [
    {
      "n": 1,
      "slug": "week-01",
      "status": "ready",
      "title": "Logic and arguments",
      "summary": "What makes an argument good: structure, validity and soundness, deduction versus induction and abduction, and the fallacies that make bad arguments sound convincing.",
      "objectives": [
        {
          "id": "w1-o1",
          "text": "Break an argument into premises and a conclusion, including unstated assumptions"
        },
        {
          "id": "w1-o2",
          "text": "Tell valid from sound arguments, and recognize the valid and invalid conditional forms"
        },
        {
          "id": "w1-o3",
          "text": "Distinguish deductive, inductive and abductive reasoning, and judge the strength of each"
        },
        {
          "id": "w1-o4",
          "text": "Name and counter the most common informal fallacies"
        }
      ],
      "lessons": [
        {
          "id": "w1-l1",
          "title": "Anatomy of an argument",
          "minutes": 40
        },
        {
          "id": "w1-l2",
          "title": "Validity, soundness and conditionals",
          "minutes": 45
        },
        {
          "id": "w1-l3",
          "title": "Deduction, induction and abduction",
          "minutes": 40
        },
        {
          "id": "w1-l4",
          "title": "Fallacies and rhetorical tricks",
          "minutes": 45
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Dissect a real argument",
        "path": "thinking/exercises/week-01.md"
      },
      "quiz": "thinking-01-quiz",
      "quizQuestions": 10
    },
    {
      "n": 2,
      "slug": "week-02",
      "status": "ready",
      "title": "Evidence, statistics and probability",
      "summary": "Reasoning with uncertainty: base rates and Bayes, correlation versus causation, how studies and statistics mislead, and thinking in expected values.",
      "objectives": [
        {
          "id": "w2-o1",
          "text": "Use base rates and Bayes' rule to update a belief on new evidence"
        },
        {
          "id": "w2-o2",
          "text": "Explain why correlation doesn't establish causation, and name confounders, reverse causation and selection effects"
        },
        {
          "id": "w2-o3",
          "text": "Critically read a statistic or study: sample, comparison, absolute vs relative risk, p-values"
        },
        {
          "id": "w2-o4",
          "text": "Compare options using expected value, and know when variance matters more"
        }
      ],
      "lessons": [
        {
          "id": "w2-l1",
          "title": "Base rates and Bayes' rule",
          "minutes": 50
        },
        {
          "id": "w2-l2",
          "title": "Correlation and causation",
          "minutes": 45
        },
        {
          "id": "w2-l3",
          "title": "Reading studies and statistics",
          "minutes": 45
        },
        {
          "id": "w2-l4",
          "title": "Expected value and risk",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Reason with numbers",
        "path": "thinking/exercises/week-02.md"
      },
      "quiz": "thinking-02-quiz",
      "quizQuestions": 10
    },
    {
      "n": 3,
      "slug": "week-03",
      "status": "ready",
      "title": "Cognitive biases and judgement",
      "summary": "Why smart people make predictable errors: fast and slow thinking, the biases that matter most at work, overconfidence, and practical debiasing techniques.",
      "objectives": [
        {
          "id": "w3-o1",
          "text": "Explain fast (System 1) and slow (System 2) thinking and when each misleads"
        },
        {
          "id": "w3-o2",
          "text": "Recognize confirmation bias, anchoring, availability, framing and hindsight bias in real situations"
        },
        {
          "id": "w3-o3",
          "text": "Explain overconfidence and the planning fallacy, and estimate using reference classes"
        },
        {
          "id": "w3-o4",
          "text": "Apply debiasing techniques: premortems, considering the opposite, checklists and independent estimates"
        }
      ],
      "lessons": [
        {
          "id": "w3-l1",
          "title": "Two systems of thinking",
          "minutes": 35
        },
        {
          "id": "w3-l2",
          "title": "Biases that matter most",
          "minutes": 50
        },
        {
          "id": "w3-l3",
          "title": "Overconfidence and the planning fallacy",
          "minutes": 40
        },
        {
          "id": "w3-l4",
          "title": "Debiasing that works",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Catch your own biases",
        "path": "thinking/exercises/week-03.md"
      },
      "quiz": "thinking-03-quiz",
      "quizQuestions": 10
    },
    {
      "n": 4,
      "slug": "week-04",
      "status": "ready",
      "title": "Problem solving and decision making",
      "summary": "Structured methods for hard problems and important decisions: defining the problem, root causes, first principles, decision frameworks, and thinking in systems and second-order effects.",
      "objectives": [
        {
          "id": "w4-o1",
          "text": "Define a problem precisely, and break it down into mutually exclusive, collectively exhaustive parts"
        },
        {
          "id": "w4-o2",
          "text": "Find root causes with the five whys and fault trees, and reason from first principles"
        },
        {
          "id": "w4-o3",
          "text": "Structure a decision: options, criteria, weights, reversibility and the value of more information"
        },
        {
          "id": "w4-o4",
          "text": "Think in systems: feedback loops, second-order effects, incentives and Goodhart's law"
        }
      ],
      "lessons": [
        {
          "id": "w4-l1",
          "title": "Defining and breaking down problems",
          "minutes": 40
        },
        {
          "id": "w4-l2",
          "title": "Root causes and first principles",
          "minutes": 40
        },
        {
          "id": "w4-l3",
          "title": "Making decisions",
          "minutes": 45
        },
        {
          "id": "w4-l4",
          "title": "Systems, incentives and second-order effects",
          "minutes": 45
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Solve a real problem, end to end",
        "path": "thinking/exercises/week-04.md"
      },
      "quiz": "thinking-04-quiz",
      "quizQuestions": 10
    }
  ]
};
