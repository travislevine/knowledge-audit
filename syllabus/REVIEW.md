# Reviewing progress

This guide is for whoever reviews my progress through the syllabus: a tutor,
a mentor, or anyone I share the repo with. It explains where everything lives
and what kind of feedback is most useful.

## Start here

1. **`results/REPORT.md`**: a summary of everything, rebuilt automatically
   whenever I save progress. It covers each week's lessons, checkpoint
   misses, project status and notes, quiz gaps, my self-ratings and my
   reflections, plus the results of the three knowledge audits.
2. **The project code** in `syllabus/projects/week-NN-*/`: my
   implementations, and my answers to the written questions at the bottom of
   each project README.
3. **Git history**: `git log --stat -- syllabus/projects results` shows when
   work was done and how it evolved.

If `REPORT.md` looks out of date, run `python3 report.py` to rebuild it from
the JSON files in `results/`.

## What the data means

| Source | Where | What it tells you |
| --- | --- | --- |
| Checkpoints | `results/syllabus.json` → `checks` | My first answer to each inline question while reading a lesson. Misses point at concepts that didn't land on first read. |
| Lessons done | `results/syllabus.json` → `lessons` | Which lessons I marked complete, and when. |
| Weekly quiz | `results/week-NN-quiz.json` | First-attempt answers with a confidence rating. **Misconceptions** (wrong but "Certain") matter most. Retakes are recorded separately and don't overwrite first attempts. |
| Self-ratings | `results/syllabus.json` → `ratings` | 1–5 per learning objective (1 = can't do it yet, 5 = could teach it). |
| Reflections | `results/syllabus.json` → `notes` | What I found hard, in my own words. |
| Projects | `results/syllabus.json` → `projects` + the code | Status (not started → in progress → tests passing → done) and my notes. |
| Audits | `results/{cs-foundations,engineering-theory,thinking-skills}.json` | Baseline knowledge checks taken before or alongside the syllabus. |

## How to run my work

```bash
cd syllabus/projects/week-01-bitkit && python3 -m unittest -v
cd syllabus/projects/week-02-structures && python3 -m unittest -v
cd syllabus/projects/week-03-routes && python3 -m unittest -v && python3 demo.py
```

Tests passing is the minimum. Code quality, clarity and the written answers
are where feedback helps most.

## Useful kinds of feedback

- **Mismatches between confidence and results.** A high self-rating but
  missed quiz or checkpoint questions on the same topic (or the reverse) is
  the most valuable thing to point out.
- **Misconceptions**: quiz answers marked "Certain" that were wrong.
- **Code review** of the projects: correctness beyond the tests, edge cases,
  naming, structure, and whether the Big-O matches what I claimed.
- **What to revisit or practice** before moving on, and whether the pace is
  right. The plan is about 10 hours a week.
- **Changes to the plan**: topics to add, cut or reorder in the remaining
  weeks.

## Leaving feedback

Write it in `syllabus/feedback/week-NN.md` (create the folder if it doesn't
exist), or open an issue or pull request on the repo. Please reference
specific files, quiz questions (for example `w2q11`) or checkpoints (for
example `w2-c7`) so I can find what you mean.

## Structure of the syllabus

- `syllabus/data/plan.js`: the weeks, lessons, objectives and projects (the
  source of truth for the plan).
- `syllabus/weeks/week-NN.html`: lesson pages, with written content,
  interactive widgets, checkpoints and videos.
- `syllabus/quizzes/data/week-NN.js`: quiz questions, explanations and study
  pointers.
- `syllabus/projects/`: weekly projects with tests.
- Weeks 1–3 are written. Weeks 4–10 are outlined in `plan.js`.
