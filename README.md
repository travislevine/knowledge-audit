# Knowledge Audit

Self-assessment quizzes for finding gaps in my CS knowledge and reasoning.
Each audit has three levels that get harder, unlocks the next level at 70%,
and builds a gap report with a study plan and links to resources.

| Audit | Questions | Areas |
| --- | --- | --- |
| CS Foundations | 75 | Networking, web, encryption, security, OS, data representation, databases, programming |
| Engineering Theory | 45 | Architecture, DevOps, CS concepts, how software businesses run |
| Thinking Skills | 75 | Logic, evidence and probability, biases, problem solving and decisions |

## How it works

- Pick an answer, then lock it in as **Guessing**, **Fairly sure** or **Certain**.
  Wrong-but-certain answers are flagged as misconceptions, and the report shows
  how well your confidence matches your accuracy (calibration).
- Skipping is allowed and counts as a gap.
- Retakes are allowed, but the report always uses your first attempt.

## Running it

```bash
python3 serve.py
```

This opens `http://localhost:8000` and saves every answer to
`results/<audit>.json`. Commit those files to keep a history of your progress:

```bash
git add results/
git commit -m "Update audit results"
```

No dependencies, just Python 3.8+. Use `--port` to change the port and
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
serve.py              local server + results API
results/              saved progress (one JSON file per audit)
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
