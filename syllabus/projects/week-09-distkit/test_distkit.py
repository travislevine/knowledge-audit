"""Tests for distkit. Run with: python -m unittest -v"""
import random
import threading
import time
import unittest
from collections import Counter, deque

from distkit import (CircuitBreaker, CircuitOpenError, HashRing, IdempotentConsumer, TokenBucket, TTLCache,
                     stable_hash)


class FakeClock:
    def __init__(self, t=1000.0):
        self.t = t

    def __call__(self):
        return self.t

    def advance(self, seconds):
        self.t += seconds


KEYS = [f"user:{i}" for i in range(10000)]


class TestHashRing(unittest.TestCase):
    def test_empty(self):
        with self.assertRaises(LookupError):
            HashRing().get("anything")

    def test_basic(self):
        ring = HashRing(["a", "b", "c"])
        self.assertEqual(ring.nodes, {"a", "b", "c"})
        owners = {k: ring.get(k) for k in KEYS[:500]}
        self.assertTrue(set(owners.values()) <= {"a", "b", "c"})
        self.assertEqual(owners, {k: HashRing(["c", "a", "b"]).get(k) for k in KEYS[:500]},
                         "ownership must not depend on the order nodes were added")

    def test_add_moves_few_keys(self):
        ring = HashRing([f"cache-{i}" for i in range(5)])
        before = {k: ring.get(k) for k in KEYS}
        ring.add("cache-5")
        after = {k: ring.get(k) for k in KEYS}
        moved = [k for k in KEYS if before[k] != after[k]]
        self.assertTrue(0.10 < len(moved) / len(KEYS) < 0.25, f"{len(moved)} of {len(KEYS)} keys moved")
        self.assertTrue(all(after[k] == "cache-5" for k in moved), "keys may only move TO the new node")

    def test_remove_only_moves_its_keys(self):
        ring = HashRing([f"cache-{i}" for i in range(5)])
        before = {k: ring.get(k) for k in KEYS}
        ring.remove("cache-2")
        self.assertNotIn("cache-2", ring.nodes)
        for k in KEYS:
            if before[k] != "cache-2":
                self.assertEqual(ring.get(k), before[k])
            else:
                self.assertNotEqual(ring.get(k), "cache-2")
        with self.assertRaises(KeyError):
            ring.remove("cache-2")

    def test_balanced_with_virtual_nodes(self):
        ring = HashRing([f"cache-{i}" for i in range(5)], vnodes=150)
        load = Counter(ring.get(k) for k in KEYS)
        self.assertLess(max(load.values()) / (len(KEYS) / 5), 1.3, f"load: {dict(load)}")

    def test_add_twice_is_harmless(self):
        ring = HashRing(["a", "b"])
        before = {k: ring.get(k) for k in KEYS[:500]}
        ring.add("a")
        self.assertEqual({k: ring.get(k) for k in KEYS[:500]}, before)


class TestTTLCache(unittest.TestCase):
    def test_get_set_and_expiry(self):
        clock = FakeClock()
        c = TTLCache(capacity=10, ttl=60, clock=clock)
        self.assertIsNone(c.get("a"))
        self.assertEqual(c.get("a", "dflt"), "dflt")
        c.set("a", 1)
        clock.advance(59)
        self.assertEqual(c.get("a"), 1)
        clock.advance(2)
        self.assertIsNone(c.get("a"), "entry should have expired")
        c.set("a", 2)
        clock.advance(30)
        c.set("a", 3)
        clock.advance(45)
        self.assertEqual(c.get("a"), 3, "set() must give the entry a fresh TTL")

    def test_lru_eviction(self):
        c = TTLCache(capacity=2, ttl=100, clock=FakeClock())
        c.set("a", 1)
        c.set("b", 2)
        c.get("a")                 # a is now most recently used
        c.set("c", 3)              # evicts b
        self.assertEqual((c.get("a"), c.get("b"), c.get("c")), (1, None, 3))
        self.assertEqual(len(c), 2)

    def test_get_or_load_caches(self):
        c = TTLCache(capacity=10, ttl=100, clock=FakeClock())
        calls = []
        loader = lambda: calls.append(1) or "value"
        self.assertEqual(c.get_or_load("k", loader), "value")
        self.assertEqual(c.get_or_load("k", loader), "value")
        self.assertEqual(len(calls), 1)

    def test_single_flight(self):
        c = TTLCache(capacity=10, ttl=100)
        calls, results = [], []
        lock = threading.Lock()

        def loader():
            with lock:
                calls.append(1)
            time.sleep(0.2)
            return "expensive"

        threads = [threading.Thread(target=lambda: results.append(c.get_or_load("hot", loader))) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(5)
        self.assertEqual(len(calls), 1, "a stampede: the loader ran more than once")
        self.assertEqual(results, ["expensive"] * 10)

    def test_different_keys_load_in_parallel(self):
        c = TTLCache(capacity=10, ttl=100)

        def slow(k):
            return lambda: (time.sleep(0.3), k)[1]

        threads = [threading.Thread(target=c.get_or_load, args=(f"k{i}", slow(i))) for i in range(4)]
        start = time.monotonic()
        for t in threads:
            t.start()
        for t in threads:
            t.join(5)
        self.assertLess(time.monotonic() - start, 0.9, "loads for different keys must not wait for each other")

    def test_loader_error(self):
        c = TTLCache(capacity=10, ttl=100)
        errors = []
        gate = threading.Event()

        def failing():
            gate.wait(1)
            raise RuntimeError("db down")

        def worker():
            try:
                c.get_or_load("k", failing)
            except RuntimeError as e:
                errors.append(str(e))

        threads = [threading.Thread(target=worker) for _ in range(5)]
        for t in threads:
            t.start()
        time.sleep(0.1)
        gate.set()
        for t in threads:
            t.join(5)
        self.assertEqual(errors, ["db down"] * 5)
        self.assertEqual(c.get_or_load("k", lambda: "recovered"), "recovered", "errors must not be cached")


class TestTokenBucket(unittest.TestCase):
    def test_burst_then_refill(self):
        clock = FakeClock()
        b = TokenBucket(capacity=10, refill_rate=1, clock=clock)
        self.assertEqual([b.allow() for _ in range(11)], [True] * 10 + [False])
        clock.advance(2.5)
        self.assertEqual([b.allow() for _ in range(3)], [True, True, False])
        self.assertAlmostEqual(b.tokens, 0.5)

    def test_capped_at_capacity(self):
        clock = FakeClock()
        b = TokenBucket(capacity=5, refill_rate=2, clock=clock)
        clock.advance(3600)
        self.assertEqual(b.tokens, 5)
        self.assertEqual(sum(b.allow() for _ in range(10)), 5)

    def test_cost(self):
        clock = FakeClock()
        b = TokenBucket(capacity=10, refill_rate=1, clock=clock)
        self.assertTrue(b.allow(cost=7))
        self.assertFalse(b.allow(cost=4))
        self.assertAlmostEqual(b.tokens, 3, msg="a refused request must not spend tokens")
        self.assertFalse(b.allow(cost=11))


class TestCircuitBreaker(unittest.TestCase):
    def setUp(self):
        self.clock = FakeClock()
        self.cb = CircuitBreaker(failure_threshold=3, reset_timeout=30, clock=self.clock)
        self.calls = 0

    def ok(self):
        self.calls += 1
        return "ok"

    def fail(self):
        self.calls += 1
        raise TimeoutError("slow dependency")

    def trip(self):
        for _ in range(3):
            with self.assertRaises(TimeoutError):
                self.cb.call(self.fail)

    def test_closed_passes_through(self):
        self.assertEqual(self.cb.call(self.ok), "ok")
        self.assertEqual(self.cb.call(lambda x, y=1: x + y, 2, y=3), 5)
        self.assertEqual(self.cb.state, "closed")

    def test_opens_after_threshold(self):
        self.trip()
        self.assertEqual(self.cb.state, "open")
        calls = self.calls
        with self.assertRaises(CircuitOpenError):
            self.cb.call(self.ok)
        self.assertEqual(self.calls, calls, "an open circuit must not call the dependency")

    def test_success_resets_count(self):
        for _ in range(2):
            with self.assertRaises(TimeoutError):
                self.cb.call(self.fail)
        self.cb.call(self.ok)
        for _ in range(2):
            with self.assertRaises(TimeoutError):
                self.cb.call(self.fail)
        self.assertEqual(self.cb.state, "closed", "failures must be consecutive")

    def test_half_open_success_closes(self):
        self.trip()
        self.clock.advance(29)
        self.assertEqual(self.cb.state, "open")
        self.clock.advance(1)
        self.assertEqual(self.cb.state, "half-open")
        self.assertEqual(self.cb.call(self.ok), "ok")
        self.assertEqual(self.cb.state, "closed")

    def test_half_open_failure_reopens(self):
        self.trip()
        self.clock.advance(30)
        with self.assertRaises(TimeoutError):
            self.cb.call(self.fail)
        self.assertEqual(self.cb.state, "open")
        self.clock.advance(20)
        with self.assertRaises(CircuitOpenError):
            self.cb.call(self.ok)
        self.clock.advance(10)
        self.assertEqual(self.cb.call(self.ok), "ok")


class Boom(Exception):
    pass


class TestIdempotentConsumer(unittest.TestCase):
    def test_duplicates_ignored(self):
        seen = []
        c = IdempotentConsumer(seen.append)
        self.assertEqual(c.process({"id": "m1", "body": "hello"}), "processed")
        self.assertEqual(c.process({"id": "m1", "body": "hello"}), "duplicate")
        self.assertEqual(c.process({"id": "m2", "body": "world"}), "processed")
        self.assertEqual(seen, ["hello", "world"])

    def test_failure_allows_retry(self):
        attempts = []

        def handler(body):
            attempts.append(body)
            if len(attempts) == 1:
                raise Boom()

        c = IdempotentConsumer(handler)
        with self.assertRaises(Boom):
            c.process({"id": "m1", "body": "x"})
        self.assertEqual(c.process({"id": "m1", "body": "x"}), "processed")
        self.assertEqual(len(attempts), 2)

    def test_exactly_once_effects_under_redelivery(self):
        rng = random.Random(9)
        balances = Counter()
        messages = [{"id": f"tx-{i}", "body": (f"acct-{i % 7}", rng.randint(1, 100))} for i in range(300)]
        expected = Counter()
        for m in messages:
            expected[m["body"][0]] += m["body"][1]

        def apply(body):
            if rng.random() < 0.1:
                raise Boom("transient failure before any effect")
            account, amount = body
            balances[account] += amount

        consumer = IdempotentConsumer(apply)
        queue = deque(messages)
        for m in messages[::5]:
            queue.append(dict(m))                       # the broker delivers some messages twice
        while queue:
            msg = queue.popleft()
            try:
                consumer.process(msg)
            except Boom:
                queue.append(msg)                       # nack: try again later
                continue
            if rng.random() < 0.3:
                queue.append(msg)                       # worker crashed before acking: redelivered
        self.assertEqual(balances, expected)


if __name__ == "__main__":
    unittest.main()
