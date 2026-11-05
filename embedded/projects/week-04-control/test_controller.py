"""Tests for controller.py. Run with: python -m unittest -v"""
import unittest

from controller import WateringController, battery_life_days

T0 = 1793856600   # an arbitrary start time, early on a day


class Sim:
    """A pot of soil: pumping raises moisture by `rate` %/s, which reaches the sensor straight away."""

    def __init__(self, ctl, moisture, rate=1.0):
        self.ctl, self.m, self.rate, self.t = ctl, moisture, rate, T0
        self.pump_seconds = 0
        self.log = []

    def run(self, seconds, step=1):
        for _ in range(0, seconds, step):
            on = self.ctl.update(self.m, self.t)
            self.log.append((self.t, on, self.ctl.state))
            if on:
                self.m += self.rate * step
                self.pump_seconds += step
            self.t += step


class TestController(unittest.TestCase):
    def test_wet_soil_does_nothing(self):
        s = Sim(WateringController(), 60)
        s.run(600)
        self.assertEqual(s.pump_seconds, 0)

    def test_bursts_and_soaks_until_wet(self):
        s = Sim(WateringController(), 20, rate=1.0)
        s.run(1200)
        self.assertEqual(s.pump_seconds, 26, "two 10 s bursts (20 → 40%), then a third that stops early once above 45%")
        self.assertGreater(s.m, 45)
        self.assertEqual(s.ctl.state, "idle")
        starts = [t - T0 for (t, on, _), (_, prev, _) in zip(s.log[1:], s.log) if on and not prev]
        self.assertEqual(starts, [310, 620], "each burst after the first waits soak_s")

    def test_hysteresis(self):
        c = WateringController()
        self.assertFalse(c.update(35, T0), "35% is between the thresholds: stay idle")
        self.assertTrue(c.update(29, T0 + 1))

    def test_stops_early_when_wet(self):
        c = WateringController()
        c.update(20, T0)
        self.assertTrue(c.update(40, T0 + 3))
        self.assertFalse(c.update(46, T0 + 4))
        self.assertEqual(c.state, "soaking")

    def test_fault_turns_pump_off(self):
        c = WateringController()
        self.assertTrue(c.update(10, T0))
        for bad in (None, -5, 150):
            self.assertFalse(c.update(bad, T0 + 2))
            self.assertEqual(c.state, "fault")
        self.assertTrue(c.update(10, T0 + 3), "a valid dry reading recovers and waters again")

    def test_daily_limit_with_stuck_sensor(self):
        c = WateringController(max_daily_s=120)
        s = Sim(c, 5, rate=0.0)      # the sensor fell out of the pot: always reads 5%
        s.run(6 * 3600, step=1)
        self.assertEqual(s.pump_seconds, 120, "never more than the daily budget")
        tomorrow = (T0 // 86400 + 1) * 86400
        s.t = tomorrow
        s.run(400)
        self.assertGreater(s.pump_seconds, 120, "the budget resets the next day")

    def test_battery_life(self):
        self.assertAlmostEqual(battery_life_days(2000, 120, 5, 0.01, 600, usable=1.0), 82.5, delta=0.5)
        self.assertAlmostEqual(battery_life_days(1000, 0.5, 600, 0.5, 600), 66.67, delta=0.1)
        with self.assertRaises(ValueError):
            battery_life_days(1000, 50, 0, 0.1, 60)


if __name__ == "__main__":
    unittest.main()
