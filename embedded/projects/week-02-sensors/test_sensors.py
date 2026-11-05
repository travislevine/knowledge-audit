"""Tests for sensors.py. Run with: python -m unittest -v"""
import unittest

from sensors import Ema, MedianFilter, adc_to_voltage, decode_tmp102, is_plausible, moisture_percent


class TestConversion(unittest.TestCase):
    def test_adc_to_voltage(self):
        self.assertAlmostEqual(adc_to_voltage(4095), 3.3)
        self.assertAlmostEqual(adc_to_voltage(0), 0.0)
        self.assertAlmostEqual(adc_to_voltage(512, bits=10, vref=5.0), 2.502, places=3)
        for bad in (-1, 4096):
            with self.assertRaises(ValueError):
                adc_to_voltage(bad)
        with self.assertRaises(ValueError):
            adc_to_voltage(1024, bits=10)

    def test_moisture_capacitive(self):
        self.assertAlmostEqual(moisture_percent(2150, dry=3000, wet=1300), 50.0)
        self.assertEqual(moisture_percent(3000, 3000, 1300), 0.0)
        self.assertEqual(moisture_percent(1300, 3000, 1300), 100.0)

    def test_moisture_resistive_and_clamped(self):
        self.assertAlmostEqual(moisture_percent(600, dry=200, wet=1000), 50.0, msg="sensors that read higher when wet")
        self.assertEqual(moisture_percent(3500, 3000, 1300), 0.0)
        self.assertEqual(moisture_percent(900, 3000, 1300), 100.0)
        with self.assertRaises(ValueError):
            moisture_percent(100, 500, 500)

    def test_plausible(self):
        self.assertTrue(is_plausible(2000))
        self.assertFalse(is_plausible(0))
        self.assertFalse(is_plausible(4095))
        self.assertFalse(is_plausible(10))
        self.assertFalse(is_plausible(1020, bits=10))


class TestFilters(unittest.TestCase):
    def test_median_ignores_spikes(self):
        f = MedianFilter(5)
        out = [f.update(x) for x in [52, 51, 0, 53, 52, 100, 51]]
        self.assertEqual(out[2:], [51, 51.5, 52, 52, 52])
        self.assertEqual(out[:2], [52, 51.5])

    def test_median_size(self):
        for bad in (0, 4, -3):
            with self.assertRaises(ValueError):
                MedianFilter(bad)
        f = MedianFilter(3)
        for x in [1, 2, 3, 100, 100]:
            r = f.update(x)
        self.assertEqual(r, 100)
        self.assertEqual(len(f.values), 3)

    def test_ema(self):
        e = Ema(0.5)
        self.assertEqual([e.update(x) for x in [10, 20, 20, 20]], [10, 15, 17.5, 18.75])
        self.assertEqual(Ema(1).update(7), 7)
        for bad in (0, 1.5, -0.1):
            with self.assertRaises(ValueError):
                Ema(bad)


class TestRegisters(unittest.TestCase):
    def test_tmp102(self):
        self.assertAlmostEqual(decode_tmp102(0x19, 0x00), 25.0)
        self.assertAlmostEqual(decode_tmp102(0x00, 0x10), 0.0625)
        self.assertAlmostEqual(decode_tmp102(0xFF, 0xF0), -0.0625)
        self.assertAlmostEqual(decode_tmp102(0xE7, 0x00), -25.0)
        self.assertAlmostEqual(decode_tmp102(0x7F, 0xF0), 127.9375)
        self.assertAlmostEqual(decode_tmp102(0x19, 0x0F), 25.0, msg="the low 4 bits aren't part of the reading")


if __name__ == "__main__":
    unittest.main()
