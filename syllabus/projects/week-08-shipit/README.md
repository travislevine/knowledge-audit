# Week 8 project: ship it

Two parts: write tests good enough to catch real bugs, then build four small
helpers that production services rely on.

**Time:** 4–5 hours · On macOS or Linux, type `python3` where these
instructions say `python`.

| File | What it is |
| --- | --- |
| `pricing.py` | Correct pricing code for a shop. **Don't edit.** |
| `test_pricing.py` | **Your tests** for it (part 1). One example is included. |
| `check_my_tests.py` | Runs your tests against 8 subtly broken versions of `pricing.py`. |
| `shipit.py` | **Your helpers** (part 2). |
| `test_shipit.py` | Tests for the helpers. Don't edit. |

## Part 1: tests that catch bugs (about 1.5 hours)

Read `pricing.py` carefully, then write tests in `test_pricing.py`. When
you think they're thorough, run the checker:

```bash
python check_my_tests.py
```

It first checks that your tests pass against the real code, then runs them
against 8 **mutants**: copies of `pricing.py` with one deliberate bug each
(they're listed in `check_my_tests.py`, but try not to peek until you've
written your tests). Your goal is to **kill at least 7 of the 8**. Each
survivor is a bug your tests would have let into production.

Think about:

- **Boundaries**: what happens at exactly 50.00?
- **Every branch**: each coupon, express on and off, discount before and
  after the free-shipping threshold.
- **Invalid input**: what should raise `ValueError`? Use `assertRaises`.
- **Exact values**: assert the precise total, not just "greater than zero".

## Part 2: production helpers (about 3 hours)

```bash
python -m unittest test_shipit -v
```

1. **`retry`**: call a function, retrying temporary failures with
   exponential backoff and jitter (lesson 9.5 explains why jitter matters).
   The exact delay formula is in the docstring; the tests pass a fake
   `sleep` that records delays instead of waiting.
2. **`LatencyTracker`**: record durations and report the mean, p50, p95, p99
   and max using the nearest-rank method.
3. **`rollout_enabled`**: decide whether a feature flag is on for a user at
   a given rollout percentage, using the provided `bucket` function. The
   result must be stable, and raising the percentage must only add users.
4. **`JsonLogger`**: structured logging with bound context (`bind`) and
   redaction of sensitive fields.

## Hints

- `retry`: loop `for i in range(attempts)`, `return fn()` inside `try`, and
  catch `except retry_on:`. On the last attempt, re-raise with a bare `raise`.
- Nearest rank: `sorted(values)[math.ceil(p / 100 * n) - 1]`.
- ISO 8601 UTC from a Unix time: `time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(t))`.
- `json.dumps(obj, default=str)` converts anything it can't serialize with `str()`.
- Python dicts keep insertion order, so build the log record in the order
  the docstring asks for.

## Stretch goals (optional, no tests)

- **Real CI:** create `.github/workflows/week-08.yml` in the repository root
  that runs on every push, sets up Python, and runs this folder's tests and
  `check_my_tests.py`. Push it and watch it run on GitHub (the Actions tab).
  Keep it limited to this folder, so unfinished projects don't fail the build.
- **A container:** write a `Dockerfile` that runs this folder's tests in
  `python:3.12-slim`, ordering the layers so code changes rebuild quickly.
  Build and run it if you have Docker installed.
- Add a `retry` option that only retries if a time budget (total seconds)
  hasn't been used up.

## Questions

Answer briefly here before you commit.

1. Which mutant was hardest to kill, and what does that tell you about where
   bugs hide?

   _Your answer:_

2. Why does `retry` add random jitter instead of waiting exactly
   `base_delay * 2 ** i`? Describe what happens to a recovering server when
   10,000 clients retry in perfect sync.

   _Your answer:_

3. Why must the rollout decision be stable per user, rather than
   `random.random() < percent / 100` on each request?

   _Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 8 page.
