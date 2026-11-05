"""Job runner: threads, locks and processes.

Week 4 project. See README.md for the rules.
Run the tests with:  python -m unittest -v
"""
import subprocess
import threading
import time
from concurrent.futures import ProcessPoolExecutor   # allowed in parallel_map only
from dataclasses import dataclass


# --- Helpers used by the tests and benchmark (don't change) ------------------

def cpu_bound(n):
    """Busy work: sum of squares below n. Pure computation, holds the GIL."""
    total = 0
    for i in range(n):
        total += i * i
    return total


def io_bound(seconds):
    """Simulated I/O: sleeps, like waiting on a network or disk. Releases the GIL."""
    time.sleep(seconds)
    return seconds


class UnsafeCounter:
    """A counter with a deliberate race condition, for comparison.

    The sleep(0) between reading and writing gives other threads a chance to
    run in the middle of the update, which makes lost updates easy to see.
    """

    def __init__(self):
        self.value = 0

    def increment(self):
        current = self.value
        time.sleep(0)
        self.value = current + 1


# --- 1. A thread-safe counter -------------------------------------------------

class SafeCounter:
    """Like UnsafeCounter, but no increments are ever lost.

    Keep the read / sleep(0) / write shape so the race window is still there,
    and make it safe with a lock.
    """

    def __init__(self):
        self.value = 0

    def increment(self):
        raise NotImplementedError


# --- 2. A bounded producer-consumer queue -----------------------------------------

class QueueClosed(Exception):
    """Raised by put() after close(), and by get() once a closed queue is empty."""


class BoundedQueue:
    """A thread-safe FIFO queue holding at most `capacity` items.

    Build it with threading.Condition. Don't use the queue module.
    """

    def __init__(self, capacity):
        if capacity < 1:
            raise ValueError("capacity must be at least 1")
        self.capacity = capacity

    def __len__(self):
        raise NotImplementedError

    def put(self, item, timeout=None):
        """Add item, waiting while the queue is full.

        Raise TimeoutError if still full after `timeout` seconds (None waits
        forever). Raise QueueClosed if the queue is closed.
        """
        raise NotImplementedError

    def get(self, timeout=None):
        """Remove and return the oldest item, waiting while the queue is empty.

        Raise TimeoutError if still empty after `timeout` seconds. If the
        queue is closed, keep returning remaining items, then raise
        QueueClosed once it's empty.
        """
        raise NotImplementedError

    def close(self):
        """Stop accepting new items and wake every waiting thread."""
        raise NotImplementedError


# --- 3. A thread pool ------------------------------------------------------------------

class Task:
    """The result of a submitted job, filled in by a worker thread."""

    def __init__(self):
        self._done = threading.Event()
        self._result = None
        self._error = None

    def done(self):
        return self._done.is_set()

    def result(self, timeout=None):
        """Wait for the job and return its value, or re-raise its exception.

        Raise TimeoutError if it isn't finished within `timeout` seconds.
        """
        raise NotImplementedError

    # Workers call these:
    def _set_result(self, value):
        self._result = value
        self._done.set()

    def _set_error(self, error):
        self._error = error
        self._done.set()


class ThreadPool:
    """A fixed number of worker threads taking jobs from a BoundedQueue.

    with ThreadPool(4) as pool:
        task = pool.submit(pow, 2, 10)
        print(task.result())   # 1024
    """

    def __init__(self, workers, queue_size=1000):
        raise NotImplementedError

    def submit(self, fn, *args, **kwargs):
        """Queue fn(*args, **kwargs) and return a Task.

        Raise RuntimeError if the pool has been shut down.
        """
        raise NotImplementedError

    def shutdown(self, wait=True):
        """Stop accepting jobs. Queued jobs still run. If wait, join the workers."""
        raise NotImplementedError

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.shutdown(wait=True)


# --- 4. Deadlock-free transfers ---------------------------------------------------------

class InsufficientFunds(ValueError):
    pass


class Account:
    def __init__(self, name, balance):
        self.name = name
        self.balance = balance
        self.lock = threading.Lock()


class Bank:
    def __init__(self, balances):
        self.accounts = {name: Account(name, amount) for name, amount in balances.items()}

    def _pause(self):
        """Called between taking the two locks. Tests replace this with a short
        sleep to make deadlocks likely, so keep the call in transfer()."""

    def transfer(self, source, target, amount):
        """Move `amount` from account `source` to account `target`, atomically.

        Lock both accounts, calling self._pause() after taking the first lock
        and before taking the second. Must never deadlock, even with many
        threads transferring in opposite directions at once.

        Raise ValueError if source == target or amount <= 0, KeyError for an
        unknown account, and InsufficientFunds if the source can't cover it.
        """
        raise NotImplementedError

    def total(self):
        """The sum of all balances, read consistently (hold every lock)."""
        raise NotImplementedError


# --- 5. Running external commands -------------------------------------------------------

@dataclass
class CommandResult:
    returncode: int
    stdout: str
    stderr: str
    timed_out: bool = False


def run_command(args, timeout=10, input_text=None):
    """Run a program (args is a list, e.g. ["git", "status"]) and capture its output.

    Never use shell=True. On timeout, return a CommandResult with
    timed_out=True and returncode -1 (the process must be killed).
    """
    raise NotImplementedError


# --- 6. Parallel map ------------------------------------------------------------------

def parallel_map(fn, items, workers=4, kind="thread"):
    """Return [fn(x) for x in items], computed concurrently, in input order.

    kind="thread" uses your ThreadPool. kind="process" uses
    concurrent.futures.ProcessPoolExecutor (fn must be a top-level function).
    """
    raise NotImplementedError
