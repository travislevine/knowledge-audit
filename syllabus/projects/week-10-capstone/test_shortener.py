"""Tests for the capstone. Run with: python -m unittest -v"""
import io
import json
import random
import unittest

import shortener
from shortener import AliasTaken, Shortener, decode_base62, encode_base62


class FakeClock:
    def __init__(self, t=1793856600.0):
        self.t = t

    def __call__(self):
        return self.t

    def advance(self, s):
        self.t += s


def post_link(app, url, alias=None, client="1.2.3.4"):
    payload = {"url": url}
    if alias is not None:
        payload["alias"] = alias
    return app.handle("POST", "/api/links", {"Content-Type": "application/json", "X-Client-IP": client}, json.dumps(payload))


class TestBase62(unittest.TestCase):
    def test_known_values(self):
        self.assertEqual(encode_base62(0), "0")
        self.assertEqual(encode_base62(61), "Z")
        self.assertEqual(encode_base62(62), "10")
        self.assertEqual(encode_base62(10_000), "2Bi")
        self.assertEqual(decode_base62("2Bi"), 10_000)

    def test_round_trip(self):
        rng = random.Random(1)
        for _ in range(500):
            n = rng.randrange(62 ** 8)
            self.assertEqual(decode_base62(encode_base62(n)), n)

    def test_errors(self):
        with self.assertRaises(ValueError):
            encode_base62(-1)
        for bad in ["", "ab!c", "a b"]:
            with self.assertRaises(ValueError):
                decode_base62(bad)


class TestCore(unittest.TestCase):
    def setUp(self):
        self.clock = FakeClock()
        self.app = Shortener(clock=self.clock)

    def test_create_and_resolve(self):
        code, created = self.app.create_link("https://example.com/a/long/path?x=1")
        self.assertTrue(created)
        self.assertEqual(code, "2Bj", "the first link has id 1: encode_base62(1 + 10000)")
        self.assertEqual(self.app.resolve(code), "https://example.com/a/long/path?x=1")
        self.assertIsNone(self.app.resolve("nope"))

    def test_same_url_returns_same_code(self):
        a, _ = self.app.create_link("https://example.com/x")
        b, created = self.app.create_link("https://example.com/x")
        self.assertEqual(a, b)
        self.assertFalse(created)
        c, _ = self.app.create_link("https://example.com/y")
        self.assertNotEqual(a, c)

    def test_url_validation(self):
        bad = ["ftp://example.com/file", "javascript:alert(1)", "https://", "not a url", "https://exa mple.com",
               "https://example.com/" + "a" * 2100, "http://127.0.0.1:8002/2Bj", "https://example.com/\x00", 42]
        for url in bad:
            with self.assertRaises(ValueError, msg=repr(url)[:60]):
                self.app.create_link(url)
        for good in ["http://example.com", "https://sub.example.co.uk/path?q=1#frag", "https://example.com:8443/x"]:
            self.app.create_link(good)

    def test_aliases(self):
        code, created = self.app.create_link("https://example.com/docs", alias="docs-2026")
        self.assertEqual((code, created), ("docs-2026", True))
        self.assertEqual(self.app.resolve("docs-2026"), "https://example.com/docs")
        with self.assertRaises(AliasTaken):
            self.app.create_link("https://example.com/other", alias="docs-2026")
        again, created = self.app.create_link("https://example.com/docs")
        self.assertTrue(created, "a link created with an alias doesn't count as the URL's generated link")
        self.assertNotEqual(again, "docs-2026")
        for bad in ["ab", "has space", "x" * 33, "API", "metrics", "emoji😀", "abc\n", 7]:
            with self.assertRaises(ValueError, msg=bad):
                self.app.create_link("https://example.com/z", alias=bad)

    def test_generated_code_skips_taken_alias(self):
        self.app.create_link("https://example.com/manual", alias="2Bk")    # what link id 2 would get
        first, _ = self.app.create_link("https://example.com/one")
        second, _ = self.app.create_link("https://example.com/two")
        self.assertNotIn(first, ("2Bk",))
        self.assertNotEqual(second, "2Bk")
        self.assertEqual(len({first, second, "2Bk"}), 3)
        self.assertEqual(self.app.resolve("2Bk"), "https://example.com/manual")

    def test_url_lookup_uses_index(self):
        plan = " ".join(r[-1] for r in self.app.db.execute("EXPLAIN QUERY PLAN SELECT code FROM links WHERE url = ?", ("x",)))
        self.assertIn("INDEX", plan, plan)

    def test_constraints(self):
        self.app.create_link("https://example.com/a", alias="taken")
        import sqlite3
        with self.assertRaises(sqlite3.IntegrityError):
            self.app.db.execute("INSERT INTO links (code, url, created_at) VALUES ('taken', 'https://x.com', 0)")
        with self.assertRaises(sqlite3.IntegrityError):
            self.app.db.execute("INSERT INTO links (code, created_at) VALUES ('nourl', 0)")

    def test_cache_avoids_database(self):
        code, _ = self.app.create_link("https://example.com/cached")
        statements = []
        self.app.db.set_trace_callback(statements.append)
        self.app.resolve(code)
        first = len(statements)
        for _ in range(20):
            self.app.resolve(code)
        self.app.db.set_trace_callback(None)
        self.assertLessEqual(first, 1)
        self.assertEqual(len(statements), first, "cached resolves (and their clicks) must not touch the database")
        self.assertEqual(self.app.metrics["cache_hits_total"], 20)

    def test_cache_is_bounded(self):
        app = Shortener(clock=self.clock, cache_size=3)
        codes = [app.create_link(f"https://example.com/{i}")[0] for i in range(5)]
        for c in codes:
            app.resolve(c)
        statements = []
        app.db.set_trace_callback(statements.append)
        app.resolve(codes[0])          # evicted long ago: must hit the database
        app.resolve(codes[4])          # most recent: cached
        app.db.set_trace_callback(None)
        self.assertEqual(len([s for s in statements if s.lstrip().upper().startswith("SELECT")]), 1)

    def test_clicks(self):
        code, _ = self.app.create_link("https://example.com/clicky")
        for _ in range(7):
            self.app.resolve(code)
        s = self.app.stats(code)
        self.assertEqual((s["code"], s["url"], s["clicks"]), (code, "https://example.com/clicky", 7))
        self.assertEqual(s["created_at"], self.clock())
        self.assertIsNone(self.app.stats("missing"))

    def test_clicks_flush_automatically(self):
        code, _ = self.app.create_link("https://example.com/busy")
        for _ in range(150):
            self.app.resolve(code)
        stored = self.app.db.execute("SELECT clicks FROM links WHERE code = ?", (code,)).fetchone()[0]
        self.assertGreaterEqual(stored, 100, "pending clicks should be written once 100 are waiting")
        self.assertEqual(self.app.stats(code)["clicks"], 150)


class TestHttp(unittest.TestCase):
    def setUp(self):
        self.clock = FakeClock()
        self.log = io.StringIO()
        self.app = Shortener(clock=self.clock, log_stream=self.log)

    def test_home_page(self):
        r = self.app.handle("GET", "/")
        self.assertEqual(r.status, 200)
        self.assertIn("text/html", r.header("Content-Type"))

    def test_create_redirect_stats(self):
        r = post_link(self.app, "https://example.com/page")
        self.assertEqual(r.status, 201)
        data = r.json()
        self.assertEqual(data["url"], "https://example.com/page")
        self.assertEqual(data["short_url"], "http://127.0.0.1:8002/" + data["code"])
        again = post_link(self.app, "https://example.com/page")
        self.assertEqual((again.status, again.json()["code"]), (200, data["code"]))

        redirect = self.app.handle("GET", "/" + data["code"])
        self.assertEqual(redirect.status, 302)
        self.assertEqual(redirect.header("Location"), "https://example.com/page")

        stats = self.app.handle("GET", f"/api/links/{data['code']}")
        self.assertEqual(stats.status, 200)
        self.assertEqual(stats.json()["clicks"], 1)

    def test_errors(self):
        self.assertEqual(self.app.handle("GET", "/doesnotexist").status, 404)
        self.assertEqual(self.app.handle("GET", "/api/links/doesnotexist").status, 404)
        bad_json = self.app.handle("POST", "/api/links", {"X-Client-IP": "9.9.9.9"}, "{not json")
        self.assertEqual(bad_json.status, 400)
        self.assertIn("error", bad_json.json())
        self.assertEqual(self.app.handle("POST", "/api/links", {"X-Client-IP": "9.9.9.9"}, "[1, 2]").status, 400)
        self.assertEqual(post_link(self.app, "javascript:alert(1)").status, 400)
        post_link(self.app, "https://example.com/1", alias="mine")
        self.assertEqual(post_link(self.app, "https://example.com/2", alias="mine").status, 409)

    def test_rate_limit(self):
        statuses = [post_link(self.app, f"https://example.com/{i}", client="5.5.5.5").status for i in range(12)]
        self.assertEqual(statuses, [201] * 10 + [429, 429])
        limited = post_link(self.app, "https://example.com/x", client="5.5.5.5")
        self.assertEqual(limited.header("Retry-After"), "1")
        self.assertEqual(post_link(self.app, "https://example.com/other-client", client="6.6.6.6").status, 201,
                         "each client has its own limit")
        self.clock.advance(3)
        self.assertEqual(post_link(self.app, "https://example.com/later", client="5.5.5.5").status, 201)
        self.assertEqual(self.app.metrics["rate_limited_total"], 3)

    def test_health_and_metrics(self):
        r = self.app.handle("GET", "/healthz")
        self.assertEqual((r.status, r.json()), (200, {"status": "ok"}))
        code = post_link(self.app, "https://example.com/m").json()["code"]
        self.app.handle("GET", "/" + code)
        self.app.handle("GET", "/" + code)
        self.app.handle("GET", "/nope")
        m = self.app.handle("GET", "/metrics")
        self.assertIn("text/plain", m.header("Content-Type"))
        values = dict(line.split() for line in m.body.strip().splitlines())
        self.assertEqual(values["links_created_total"], "1")
        self.assertEqual(values["redirects_total"], "2")
        self.assertEqual(values["not_found_total"], "1")
        self.assertEqual(values["cache_hits_total"], "1")
        self.assertEqual(values["requests_total"], "6")

    def test_structured_logs(self):
        post_link(self.app, "https://example.com/logged")
        self.app.handle("GET", "/nope")
        lines = [json.loads(line) for line in self.log.getvalue().splitlines()]
        self.assertEqual(len(lines), 2)
        self.assertEqual({k: lines[0][k] for k in ("method", "path", "status")}, {"method": "POST", "path": "/api/links", "status": 201})
        self.assertEqual(lines[1]["status"], 404)
        for line in lines:
            self.assertIn("ts", line)
            self.assertIsInstance(line["duration_ms"], (int, float))


if __name__ == "__main__":
    unittest.main()
