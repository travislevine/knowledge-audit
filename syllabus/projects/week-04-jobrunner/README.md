# Week 4 project: job runner

Build the core pieces of a small job-running system and see concurrency
problems (and their fixes) for yourself: a race condition, a producer–consumer
queue, a thread pool, deadlock-free locking, safe subprocesses, and threads vs
processes.

**Time:** 4–5 hours · **Files:** `jobrunner.py` (yours to finish), `test_jobrunner.py` (don't edit), `benchmark.py`

Everything here runs on Windows, macOS and Linux. On macOS or Linux, type
`python3` where these instructions say `python`.

## Run the tests

```bash
python -m unittest -v
python -m unittest -v -k BoundedQueue    # one section at a time
python benchmark.py                      # once everything passes
```

If a test hangs, you probably have a deadlock or a missed wake-up. The tests
use timeouts so they fail instead of hanging forever, but press Ctrl+C if
needed.

## Rules

- Build `BoundedQueue` with `threading.Condition`. Don't use the `queue` module.
- Build `ThreadPool` on your own `BoundedQueue` and `threading.Thread`. Don't
  use `concurrent.futures` for it.
- `parallel_map(kind="process")` may use `concurrent.futures.ProcessPoolExecutor`.
- `run_command` must use `subprocess` without `shell=True`.

## Tasks

1. **`SafeCounter.increment`**: keep the read / `time.sleep(0)` / write shape
   from `UnsafeCounter`, and add a lock so no updates are lost.
2. **`BoundedQueue`**: `put` blocks while full, `get` blocks while empty, both
   with optional timeouts that raise `TimeoutError`. `close()` stops new
   items, lets consumers drain what's left, then makes `get` raise
   `QueueClosed`. It must also wake any thread currently waiting.
3. **`Task.result` and `ThreadPool`**: workers loop taking jobs from the
   queue, run them, and store the result or the exception in the job's
   `Task`. A failing job must not kill its worker. `shutdown()` stops new
   submissions, lets queued jobs finish, and (if `wait`) joins the workers.
4. **`Bank.transfer` and `Bank.total`**: lock both accounts in a consistent
   order so transfers can never deadlock, even when two threads move money
   in opposite directions at once. Keep the `self._pause()` call between
   taking the two locks; the tests use it to make deadlocks likely.
5. **`run_command`**: run a program with `subprocess.run`, capture stdout and
   stderr as text, pass optional input, and handle timeouts.
6. **`parallel_map`**: results in input order, using your `ThreadPool` for
   threads or `ProcessPoolExecutor` for processes. Raise `ValueError` for an
   unknown `kind`.

## Hints

- `with cond:` holds the condition's lock. `cond.wait(timeout)` releases it
  while sleeping and returns `False` if it timed out. Always re-check your
  condition in a `while` loop after waking.
- For a deadline across several wake-ups, compute
  `end = time.monotonic() + timeout` once and wait for `end - time.monotonic()`
  each time round.
- Call `cond.notify_all()` whenever you add an item, remove an item, or close.
- To stop pool workers, close the queue: each worker exits when `get()`
  raises `QueueClosed`.
- Lock ordering: `first, second = sorted([a, b], key=lambda acct: acct.name)`.
- `subprocess.run(..., capture_output=True, text=True, timeout=...)` raises
  `subprocess.TimeoutExpired` after killing the child.

## Stretch goals (optional, no tests)

- Give `ThreadPool.submit` a `timeout` so it doesn't block forever when the
  queue is full.
- Write an `asyncio` version of the I/O benchmark using `asyncio.gather` and
  `asyncio.sleep`, and compare it with threads at 1,000 concurrent tasks.
- **Unix only (WSL, Linux or macOS):** write a short script that uses
  `os.fork()` to create a child process, prints both PIDs, and has the parent
  `os.waitpid()` for the child and print its exit code. Then install a
  `signal.SIGTERM` handler that prints a message and exits cleanly, and send
  it a signal with `kill <pid>` from another terminal.

## Benchmark results

Paste the output of `python benchmark.py` here:

```
(paste here)
```

## Questions

Answer briefly here before you commit.

1. In the benchmark, why do threads speed up the I/O-bound work but not the
   CPU-bound work? Why do processes help with both, and what do they cost?

   _Your answer:_

2. Explain in two or three sentences why your `Bank.transfer` can't deadlock.
   Which of the four deadlock conditions does it break?

   _Your answer:_

3. Why does `BoundedQueue.get` need a `while` loop around `wait()`, not an
   `if`? Describe a concrete sequence of events where `if` would go wrong.

   _Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 4 page.
