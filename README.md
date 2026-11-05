# Knowledge Audit

Self-assessment quizzes for finding gaps in my CS knowledge and reasoning.
Each audit has three levels that get harder, unlocks the next level at 70%,
and builds a gap report with a study plan and links to resources.

| Audit | Questions | Areas |
| --- | --- | --- |
| CS Foundations | 75 | Networking, web, encryption, security, OS, data representation, databases, programming |
| Engineering Theory | 45 | Architecture, DevOps, CS concepts, how software businesses run |
| Thinking Skills | 75 | Logic, evidence and probability, biases, problem solving and decisions |

## CS Breadth Syllabus

A 10-week plan covering the core of a computer science degree, about 10 hours
a week. Each week has written lessons with interactive widgets and
checkpoint questions, short videos, a Python mini-project with tests, a
15-question quiz and a self-rating:

1. How computers represent and run things
2. Programming fundamentals and data structures
3. Algorithms
4. Operating systems and concurrency
5. Networking
6. The web, cryptography and security
7. Databases and SQL
8. Software engineering practice
9. System design and distributed systems
10. The business of software, and review (with a capstone project)

Open `syllabus/index.html` (or the link on the landing page). Projects live
in `syllabus/projects/` and run with `python -m unittest -v`.

Progress is summarized in `results/REPORT.md`, rebuilt after every save. See
`syllabus/REVIEW.md` for how someone else can review it.

## Thinking Skills course

A 4-week course, about 5 hours a week, following the areas of the Thinking
Skills audit:

1. Logic and arguments
2. Evidence, statistics and probability
3. Cognitive biases and judgement
4. Problem solving and decision making

Open `thinking/index.html`. Each week has four lessons with checkpoints, a
video, a practice exercise written in `thinking/exercises/`, and a
10-question quiz. Progress saves to `results/thinking.json` and appears in
`results/REPORT.md`.

## Embedded Systems and IoT course

A 4-week hands-on course, about 8 hours a week, using an ESP32, an Arduino,
a Raspberry Pi and a soil moisture sensor:

1. Microcontrollers, GPIO and timing
2. Sensors, actuators and buses
3. IoT connectivity and MQTT
4. Control, power and reliable devices

Open `embedded/index.html`. Each week has lessons with checkpoints, a
mini-project tested on the laptop (`embedded/projects/week-NN-*`), and a
quiz. Three hardware projects build on each other: an ESP32 plant monitor,
a Raspberry Pi MQTT pipeline, and an automatic watering system. Progress
saves to `results/embedded.json`.

## Markets and Investing course

A 5-week course, about 5 hours a week, on understanding the global stock
market:

1. How the stock market works
2. Value, return and risk
3. What moves markets
4. Bubbles and crashes (1929, 1987, 2000, 2008, 2020, 2022)
5. Today's market: AI, news and investing

Open `finance/index.html`. Each week has lessons with checkpoints and
widgets, a video or tool, a written scenario exercise in
`finance/exercises/`, and a 10-question quiz, followed by a 30-question
final exam. Progress saves to `results/finance.json`. It's educational, not
financial advice.

## How it works

- Pick an answer, then lock it in as **Guessing**, **Fairly sure** or **Certain**.
  Wrong-but-certain answers are flagged as misconceptions, and the report shows
  how well your confidence matches your accuracy (calibration).
- Skipping is allowed and counts as a gap.
- Retakes are allowed. The report scores your first attempt, and also shows
  your latest score once you've retaken a quiz.

## Running it

```bash
python serve.py
```

This opens `http://localhost:8000` and saves every answer to
`results/<id>.json` (audits, weekly quizzes and `syllabus.json`), then
rebuilds `results/REPORT.md`. Commit those files to keep a history of your
progress:

```bash
git add results/
git commit -m "Update audit results"
```

No dependencies, just Python 3.8+. Commands here use `python`, which is
what Windows installs; on macOS and Linux, use `python3` instead. Use `--port` to change the port and
`--no-browser` to skip opening a tab.

You can also open `index.html` directly without the server. Progress is then
stored in the browser, and each audit's **Export results** / **Import results**
buttons move it to and from a JSON file (same format as `results/`).

## Layout

```
index.html            landing page
audits/*.html         one page per audit
audits/data/*.js      question banks
assets/audit.js       quiz engine (scoring, levels, report, saving)
assets/audit.css      shared styles
syllabus/             10-week syllabus: lessons, quizzes, projects
assets/syllabus.*     syllabus engine and styles
serve.py              local server + results API
report.py             builds results/REPORT.md from results/*.json
results/              saved progress (one JSON file per audit or quiz)
```

## Adding an audit

1. Copy one of the files in `audits/data/` and change the `id`, `title`,
   topics, levels and questions. Each question looks like:

   ```js
   { id: "x01", l: 1, t: "topicKey", k: "concept", c: "Short concept name",
     p: "Question prompt", o: ["Option A", "Option B", "Option C", "Option D"], a: 1,
     e: "Explanation shown after answering", s: "What to study if you miss it" }
   ```

   Optional: `x` for a code snippet or passage, `xl` for its label, and
   `xt: "prose"` to show it as text instead of code.
2. Copy an HTML page in `audits/` and point it at the new data file.
3. Add a card for it to `index.html`.
