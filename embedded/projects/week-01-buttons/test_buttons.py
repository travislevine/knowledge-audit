"""Tests for buttons.py. Run with: python -m unittest -v"""
import unittest

from buttons import ButtonEvents, Debouncer


def run(samples, d):
    """samples: list of (time_ms, raw). Returns [(time, event)]."""
    out = []
    for t, raw in samples:
        ev = d.update(raw, t)
        if ev:
            out.append((t, ev))
    return out


class TestDebouncer(unittest.TestCase):
    def test_clean_press_and_release(self):
        d = Debouncer(stable_ms=30)
        samples = [(t, 10 <= t < 200) for t in range(0, 300, 5)]
        self.assertEqual(run(samples, d), [(40, "press"), (230, "release")])

    def test_bounce_is_ignored(self):
        d = Debouncer(stable_ms=30)
        bouncy = [(0, False), (5, True), (7, False), (9, True), (12, False), (14, True)]
        steady = [(t, True) for t in range(15, 80, 5)]
        events = run(bouncy + steady, d)
        self.assertEqual(events, [(45, "press")], "one press, reported 30 ms after the bouncing stopped")

    def test_short_glitch_never_reports(self):
        d = Debouncer(stable_ms=30)
        samples = [(0, False), (10, True), (25, True), (30, False), (100, False)]
        self.assertEqual(run(samples, d), [])
        self.assertFalse(d.state)

    def test_sparse_samples(self):
        d = Debouncer(stable_ms=30)
        self.assertIsNone(d.update(True, 1000))
        self.assertEqual(d.update(True, 1050), "press", "works even when samples arrive slowly")


class TestButtonEvents(unittest.TestCase):
    def play(self, script, until):
        b, out, events = ButtonEvents(long_ms=800, double_ms=300), [], dict(script)
        for t in range(0, until, 10):
            g = b.feed(events[t], t) if t in events else b.tick(t)
            if g:
                out.append((t, g))
        return out

    def test_click(self):
        self.assertEqual(self.play([(0, "press"), (100, "release")], 1000), [(410, "click")])

    def test_double_click(self):
        self.assertEqual(self.play([(0, "press"), (100, "release"), (250, "press"), (330, "release")], 1500),
                         [(330, "double_click")])

    def test_slow_second_press_is_two_clicks(self):
        out = self.play([(0, "press"), (100, "release"), (600, "press"), (700, "release")], 1500)
        self.assertEqual([g for _, g in out], ["click", "click"])

    def test_long_press(self):
        self.assertEqual(self.play([(0, "press"), (2000, "release")], 3000), [(800, "long_press")])

    def test_long_press_then_click(self):
        out = self.play([(0, "press"), (1000, "release"), (1500, "press"), (1550, "release")], 2500)
        self.assertEqual(out, [(800, "long_press"), (1860, "click")])

    def test_feed_without_tick_still_reports_click(self):
        b = ButtonEvents(long_ms=800, double_ms=300)
        b.feed("press", 0)
        b.feed("release", 100)
        self.assertEqual(b.feed("press", 900), "click", "the late press first completes the earlier click")
        self.assertEqual(b.state, "pressed")


if __name__ == "__main__":
    unittest.main()
