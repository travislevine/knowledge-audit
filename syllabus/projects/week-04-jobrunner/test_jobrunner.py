"""Tests for jobrunner. Run with: python -m unittest -v"""
import random
import sys
import threading
import time
import unittest

import jobrunner
from jobrunner import (Bank, BoundedQueue, InsufficientFunds, QueueClosed, SafeCounter,
                       ThreadPool, parallel_map, run_command)


def run_threads(target, count, timeout=20):
    """Start `count` threads running target(i), join them, and fail if any hang."""
    threads = [threading.Thread(target=target, args=(i,), daemon=True) for i in range(count)]
    for t in threads:
        t.start()
    deadline = time.monotonic() + timeout
    for t in threads:
        t.join(max(0, deadline - time.monotonic()))
    return [t for t in threads if t.is_alive()]


class TestSafeCounter(unittest.TestCase):
    def test_no_lost_updates(self):
        counter = SafeCounter()

        def work(_):
            for _ in range(300):
                counter.increment()

        stuck = run_threads(work, 8)
        self.assertEqual(stuck, [])
        self.assertEqual(counter.value, 8 * 300)


class TestBoundedQueue(unittest.TestCase):
    def test_fifo(self):
        q = BoundedQueue(5)
        for i in range(5):
            q.put(i)
        self.assertEqual(len(q), 5)
        self.assertEqual([q.get() for _ in range(5)], [0, 1, 2, 3, 4])

    def test_invalid_capacity(self):
        with self.assertRaises(ValueError):
            BoundedQueue(0)

    def test_put_times_out_when_full(self):
        q = BoundedQueue(1)
        q.put("a")
        start = time.monotonic()
        with self.assertRaises(TimeoutError):
            q.put("b", timeout=0.2)
        self.assertGreaterEqual(time.monotonic() - start, 0.15)

    def test_get_times_out_when_empty(self):
        with self.assertRaises(TimeoutError):
            BoundedQueue(3).get(timeout=0.1)

    def test_blocking_put_is_released_by_get(self):
        q = BoundedQueue(1)
        q.put(1)
        done = threading.Event()

        def producer():
            q.put(2)          # blocks until the consumer takes item 1
            done.set()

        threading.Thread(target=producer, daemon=True).start()
        time.sleep(0.1)
        self.assertFalse(done.is_set(), "put() should block while the queue is full")
        self.assertEqual(q.get(timeout=1), 1)
        self.assertTrue(done.wait(1), "put() should finish once there's space")
        self.assertEqual(q.get(timeout=1), 2)

    def test_many_producers_and_consumers(self):
        q = BoundedQueue(4)
        received, lock = [], threading.Lock()

        def producer(i):
            for n in range(200):
                q.put((i, n), timeout=5)

        def consumer(_):
            while True:
                try:
                    item = q.get(timeout=5)
                except QueueClosed:
                    return
                with lock:
                    received.append(item)

        consumers = [threading.Thread(target=consumer, args=(i,), daemon=True) for i in range(3)]
        for c in consumers:
            c.start()
        self.assertEqual(run_threads(producer, 4), [])
        q.close()
        for c in consumers:
            c.join(5)
            self.assertFalse(c.is_alive(), "consumers must exit once the queue is closed and empty")
        self.assertEqual(sorted(received), sorted((i, n) for i in range(4) for n in range(200)))
        for i in range(4):
            self.assertEqual([n for p, n in received if p == i], list(range(200)), "per-producer order must be kept")

    def test_close(self):
        q = BoundedQueue(3)
        q.put("x")
        q.close()
        with self.assertRaises(QueueClosed):
            q.put("y")
        self.assertEqual(q.get(), "x", "items already queued are still delivered")
        with self.assertRaises(QueueClosed):
            q.get(timeout=1)

    def test_close_wakes_waiting_getter(self):
        q = BoundedQueue(2)
        outcome = []

        def waiter():
            try:
                q.get()
            except QueueClosed:
                outcome.append("closed")

        t = threading.Thread(target=waiter, daemon=True)
        t.start()
        time.sleep(0.1)
        q.close()
        t.join(2)
        self.assertEqual(outcome, ["closed"])


class TestThreadPool(unittest.TestCase):
    def test_results(self):
        with ThreadPool(4) as pool:
            tasks = [pool.submit(pow, 2, n) for n in range(10)]
            self.assertEqual([t.result(timeout=5) for t in tasks], [2 ** n for n in range(10)])

    def test_kwargs(self):
        with ThreadPool(2) as pool:
            self.assertEqual(pool.submit(int, "ff", base=16).result(timeout=5), 255)

    def test_exception_is_reraised(self):
        with ThreadPool(2) as pool:
            task = pool.submit(int, "not a number")
            with self.assertRaises(ValueError):
                task.result(timeout=5)
            self.assertEqual(pool.submit(int, "7").result(timeout=5), 7, "a failing job must not kill the worker")

    def test_result_timeout(self):
        with ThreadPool(1) as pool:
            task = pool.submit(time.sleep, 0.5)
            with self.assertRaises(TimeoutError):
                task.result(timeout=0.05)
            self.assertIsNone(task.result(timeout=5))

    def test_runs_concurrently(self):
        start = time.monotonic()
        with ThreadPool(8) as pool:
            tasks = [pool.submit(jobrunner.io_bound, 0.2) for _ in range(8)]
            for t in tasks:
                t.result(timeout=5)
        self.assertLess(time.monotonic() - start, 1.0, "8 sleeps of 0.2s on 8 workers should overlap")

    def test_shutdown(self):
        pool = ThreadPool(2)
        tasks = [pool.submit(jobrunner.io_bound, 0.05) for _ in range(6)]
        pool.shutdown(wait=True)
        self.assertTrue(all(t.done() for t in tasks), "queued jobs still run after shutdown")
        with self.assertRaises(RuntimeError):
            pool.submit(print, "too late")


class TestBank(unittest.TestCase):
    def test_simple_transfer(self):
        bank = Bank({"alice": 100, "bob": 50})
        bank.transfer("alice", "bob", 30)
        self.assertEqual(bank.accounts["alice"].balance, 70)
        self.assertEqual(bank.accounts["bob"].balance, 80)
        self.assertEqual(bank.total(), 150)

    def test_validation(self):
        bank = Bank({"alice": 100, "bob": 50})
        with self.assertRaises(InsufficientFunds):
            bank.transfer("bob", "alice", 51)
        with self.assertRaises(ValueError):
            bank.transfer("alice", "alice", 10)
        with self.assertRaises(ValueError):
            bank.transfer("alice", "bob", 0)
        with self.assertRaises(ValueError):
            bank.transfer("alice", "bob", -5)
        with self.assertRaises(KeyError):
            bank.transfer("alice", "mallory", 5)
        self.assertEqual((bank.accounts["alice"].balance, bank.accounts["bob"].balance), (100, 50))

    def test_no_deadlock_under_contention(self):
        names = ["a", "b", "c", "d", "e"]
        bank = Bank({n: 1000 for n in names})
        bank._pause = lambda: time.sleep(0.0005)     # widen the window between locks

        def worker(i):
            rng = random.Random(i)
            for _ in range(250):
                src, dst = rng.sample(names, 2)
                try:
                    bank.transfer(src, dst, rng.randint(1, 50))
                except InsufficientFunds:
                    pass

        stuck = run_threads(worker, 8, timeout=30)
        self.assertEqual(stuck, [], "threads are stuck: transfer() deadlocked")
        self.assertEqual(bank.total(), 5000, "money was created or destroyed")
        self.assertTrue(all(a.balance >= 0 for a in bank.accounts.values()))

    def test_opposite_directions(self):
        bank = Bank({"x": 10_000, "y": 10_000})
        bank._pause = lambda: time.sleep(0.001)

        def worker(i):
            for _ in range(150):
                if i % 2:
                    bank.transfer("x", "y", 1)
                else:
                    bank.transfer("y", "x", 1)

        self.assertEqual(run_threads(worker, 6, timeout=30), [], "deadlock between x->y and y->x")
        self.assertEqual(bank.total(), 20_000)


class TestRunCommand(unittest.TestCase):
    def test_captures_output_and_exit_code(self):
        r = run_command([sys.executable, "-c", "import sys; print('hi'); print('oops', file=sys.stderr); sys.exit(3)"])
        self.assertEqual(r.returncode, 3)
        self.assertEqual(r.stdout.strip(), "hi")
        self.assertEqual(r.stderr.strip(), "oops")
        self.assertFalse(r.timed_out)

    def test_input(self):
        r = run_command([sys.executable, "-c", "print(input().upper())"], input_text="hello\n")
        self.assertEqual(r.stdout.strip(), "HELLO")

    def test_timeout(self):
        start = time.monotonic()
        r = run_command([sys.executable, "-c", "import time; time.sleep(10)"], timeout=0.5)
        self.assertTrue(r.timed_out)
        self.assertEqual(r.returncode, -1)
        self.assertLess(time.monotonic() - start, 5, "the process must be killed on timeout")

    def test_arguments_are_not_interpreted_by_a_shell(self):
        tricky = "a; echo injected && echo $HOME | x"
        r = run_command([sys.executable, "-c", "import sys; print(sys.argv[1])", tricky])
        self.assertEqual(r.stdout.strip(), tricky)


class TestParallelMap(unittest.TestCase):
    def test_threads_keep_order(self):
        items = list(range(20))
        self.assertEqual(parallel_map(lambda x: x * x, items, workers=4), [x * x for x in items])

    def test_processes(self):
        items = [1000, 2000, 3000, 4000]
        self.assertEqual(parallel_map(jobrunner.cpu_bound, items, workers=2, kind="process"),
                         [jobrunner.cpu_bound(n) for n in items])

    def test_empty(self):
        self.assertEqual(parallel_map(abs, [], workers=3), [])

    def test_bad_kind(self):
        with self.assertRaises(ValueError):
            parallel_map(abs, [1], kind="fibers")


if __name__ == "__main__":
    unittest.main()
