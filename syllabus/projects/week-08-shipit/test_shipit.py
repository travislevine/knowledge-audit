"""Tests for shipit. Run with: python -m unittest test_shipit -v"""
import io
import json
import math
import random
import unittest

from shipit import JsonLogger, LatencyTracker, bucket, retry, rollout_enabled


class Flaky:
    """Fails `failures` times with `error`, then returns "ok"."""

    def __init__(self, failures, error=ConnectionError):
        self.failures, self.error, self.calls = failures, error, 0

    def __call__(self):
        self.calls += 1
        if self.calls <= self.failures:
            raise self.error(f"failure {self.calls}")
        return "ok"


class TestRetry(unittest.TestCase):
    def test_success_after_failures(self):
        sleeps = []
        fn = Flaky(2)
        self.assertEqual(retry(fn, attempts=3, sleep=sleeps.append, rand=lambda: 1.0), "ok")
        self.assertEqual(fn.calls, 3)
        self.assertEqual(sleeps, [0.1, 0.2])

    def test_gives_up_and_raises_last_error(self):
        sleeps = []
        fn = Flaky(10)
        with self.assertRaises(ConnectionError) as ctx:
            retry(fn, attempts=4, sleep=sleeps.append, rand=lambda: 1.0)
        self.assertEqual(str(ctx.exception), "failure 4")
        self.assertEqual(fn.calls, 4)
        self.assertEqual(len(sleeps), 3, "no sleep after the final attempt")

    def test_backoff_is_capped_and_jittered(self):
        sleeps = []
        with self.assertRaises(ConnectionError):
            retry(Flaky(10), attempts=7, base_delay=0.5, max_delay=3.0, sleep=sleeps.append, rand=lambda: 0.0)
        self.assertEqual(sleeps, [0.25, 0.5, 1.0, 1.5, 1.5, 1.5])

    def test_jitter_range(self):
        rng = random.Random(1)
        sleeps = []
        with self.assertRaises(ConnectionError):
            retry(Flaky(10), attempts=4, base_delay=1.0, max_delay=100, sleep=sleeps.append, rand=rng.random)
        for i, s in enumerate(sleeps):
            self.assertTrue(0.5 * 2 ** i <= s <= 2 ** i, f"sleep {s} out of range for attempt {i}")

    def test_does_not_retry_other_errors(self):
        fn = Flaky(5, error=ValueError)
        with self.assertRaises(ValueError):
            retry(fn, attempts=5, retry_on=(ConnectionError, TimeoutError), sleep=lambda s: None)
        self.assertEqual(fn.calls, 1)

    def test_no_sleep_on_first_success(self):
        sleeps = []
        self.assertEqual(retry(lambda: 42, sleep=sleeps.append), 42)
        self.assertEqual(sleeps, [])


class TestLatencyTracker(unittest.TestCase):
    def test_nearest_rank(self):
        t = LatencyTracker()
        for v in [15, 20, 35, 40, 50]:
            t.record(v)
        self.assertEqual(t.count, 5)
        self.assertEqual(t.percentile(30), 20)
        self.assertEqual(t.percentile(40), 20)
        self.assertEqual(t.percentile(50), 35)
        self.assertEqual(t.percentile(100), 50)

    def test_tail(self):
        t = LatencyTracker()
        for _ in range(989):
            t.record(50)
        for _ in range(11):
            t.record(4000)
        s = t.summary()
        self.assertEqual((s["count"], s["p50"], s["p95"], s["p99"], s["max"]), (1000, 50, 50, 4000, 4000))
        self.assertAlmostEqual(s["mean"], (989 * 50 + 11 * 4000) / 1000)

    def test_unsorted_input(self):
        t = LatencyTracker()
        values = list(range(1, 101))
        random.Random(2).shuffle(values)
        for v in values:
            t.record(v)
        self.assertEqual(t.percentile(95), 95)
        self.assertEqual(t.percentile(99), 99)
        self.assertEqual(t.percentile(1), 1)

    def test_errors(self):
        t = LatencyTracker()
        with self.assertRaises(ValueError):
            t.percentile(50)
        with self.assertRaises(ValueError):
            t.summary()
        t.record(10)
        for bad in (0, -5, 101):
            with self.assertRaises(ValueError):
                t.percentile(bad)


class TestRollout(unittest.TestCase):
    USERS = [f"user-{i}" for i in range(20000)]

    def test_follows_bucket(self):
        for u in self.USERS[:200]:
            self.assertEqual(rollout_enabled("new-checkout", u, 30), bucket("new-checkout", u) < 30)

    def test_extremes(self):
        self.assertFalse(any(rollout_enabled("f", u, 0) for u in self.USERS[:500]))
        self.assertTrue(all(rollout_enabled("f", u, 100) for u in self.USERS[:500]))

    def test_proportion(self):
        on = sum(rollout_enabled("dark-mode", u, 25) for u in self.USERS)
        self.assertAlmostEqual(on / len(self.USERS), 0.25, delta=0.02)

    def test_monotonic(self):
        at10 = {u for u in self.USERS if rollout_enabled("search-v2", u, 10)}
        at20 = {u for u in self.USERS if rollout_enabled("search-v2", u, 20)}
        self.assertTrue(at10 <= at20, "raising the percentage must keep everyone already enabled")

    def test_flags_independent(self):
        a = {u for u in self.USERS if rollout_enabled("flag-a", u, 50)}
        b = {u for u in self.USERS if rollout_enabled("flag-b", u, 50)}
        self.assertAlmostEqual(len(a & b) / len(self.USERS), 0.25, delta=0.03,
                               msg="different flags should pick different users")

    def test_bad_percent(self):
        for bad in (-1, 101):
            with self.assertRaises(ValueError):
                rollout_enabled("f", "u", bad)


class TestJsonLogger(unittest.TestCase):
    def setUp(self):
        self.out = io.StringIO()
        self.log = JsonLogger(self.out, clock=lambda: 1793856600.0, service="shop")

    def lines(self):
        return [json.loads(line) for line in self.out.getvalue().splitlines()]

    def test_basic_line(self):
        self.log.info("order placed", order_id=42, amount=19.99)
        (line,) = self.lines()
        self.assertEqual(line, {"ts": "2026-11-05T05:30:00Z", "level": "info", "msg": "order placed",
                                "service": "shop", "order_id": 42, "amount": 19.99})
        self.assertEqual(list(line)[:3], ["ts", "level", "msg"])

    def test_one_line_per_call(self):
        self.log.info("a")
        self.log.error("b", code=500)
        lines = self.lines()
        self.assertEqual([l["level"] for l in lines], ["info", "error"])
        self.assertEqual(self.out.getvalue().count("\n"), 2)

    def test_bind(self):
        req = self.log.bind(request_id="abc123")
        req.info("start")
        self.log.info("unbound")
        first, second = self.lines()
        self.assertEqual(first["request_id"], "abc123")
        self.assertEqual(first["service"], "shop")
        self.assertNotIn("request_id", second, "bind must not change the original logger")

    def test_redaction(self):
        self.log.bind(Authorization="Bearer xyz").info("login", user="ana", password="hunter2", API_KEY="k", Token="t")
        (line,) = self.lines()
        self.assertEqual(line["user"], "ana")
        for key in ("password", "Authorization", "API_KEY", "Token"):
            self.assertEqual(line[key], "[REDACTED]", key)
        self.assertNotIn("hunter2", self.out.getvalue())

    def test_non_serializable(self):
        self.log.info("weird", value={1, 2}, obj=object)
        (line,) = self.lines()
        self.assertIsInstance(line["value"], str)
        self.assertIsInstance(line["obj"], str)


if __name__ == "__main__":
    unittest.main()
