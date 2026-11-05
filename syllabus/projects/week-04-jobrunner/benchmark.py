"""Compare sequential, threaded and multi-process execution.

Run once the tests pass:  python benchmark.py
Paste the output into the README.
"""
import os
import threading
import time

from jobrunner import SafeCounter, UnsafeCounter, cpu_bound, io_bound, parallel_map

WORKERS = min(8, os.cpu_count() or 2)


def timed(label, fn):
    start = time.perf_counter()
    fn()
    elapsed = time.perf_counter() - start
    print(f"  {label:<26}{elapsed:6.2f} s")
    return elapsed


def race_demo():
    for cls in (UnsafeCounter, SafeCounter):
        counter = cls()
        threads = [threading.Thread(target=lambda: [counter.increment() for _ in range(500)]) for _ in range(8)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        print(f"  {cls.__name__:<26}{counter.value:>6} (expected 4000)")


def main():
    print(f"Using {WORKERS} workers on a machine with {os.cpu_count()} logical CPUs\n")

    print("Race condition")
    race_demo()

    cpu_items = [1_500_000] * WORKERS
    print("\nCPU-bound work (sum of squares)")
    timed("sequential", lambda: [cpu_bound(n) for n in cpu_items])
    timed("threads", lambda: parallel_map(cpu_bound, cpu_items, WORKERS, "thread"))
    timed("processes", lambda: parallel_map(cpu_bound, cpu_items, WORKERS, "process"))

    io_items = [0.25] * (WORKERS * 2)
    print("\nI/O-bound work (sleeping, like waiting on a network)")
    timed("sequential", lambda: [io_bound(s) for s in io_items])
    timed("threads", lambda: parallel_map(io_bound, io_items, WORKERS * 2, "thread"))
    timed("processes", lambda: parallel_map(io_bound, io_items, WORKERS * 2, "process"))


if __name__ == "__main__":
    main()
