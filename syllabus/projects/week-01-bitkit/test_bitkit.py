"""Tests for bitkit. Run with: python3 -m unittest -v"""
import math
import random
import struct
import unittest

import bitkit


class TestBinary(unittest.TestCase):
    def test_to_binary(self):
        self.assertEqual(bitkit.to_binary(0, 8), "00000000")
        self.assertEqual(bitkit.to_binary(5, 8), "00000101")
        self.assertEqual(bitkit.to_binary(255, 8), "11111111")
        self.assertEqual(bitkit.to_binary(45, 6), "101101")
        self.assertEqual(bitkit.to_binary(1, 1), "1")
        self.assertEqual(bitkit.to_binary(1024, 16), "0000010000000000")

    def test_to_binary_rejects_values_that_do_not_fit(self):
        for n, width in [(256, 8), (-1, 8), (8, 3)]:
            with self.assertRaises(ValueError, msg=f"to_binary({n}, {width})"):
                bitkit.to_binary(n, width)

    def test_from_binary(self):
        self.assertEqual(bitkit.from_binary("0"), 0)
        self.assertEqual(bitkit.from_binary("101101"), 45)
        self.assertEqual(bitkit.from_binary("1010 0001"), 161)
        self.assertEqual(bitkit.from_binary("1111_1111"), 255)
        self.assertEqual(bitkit.from_binary("1" * 40), 2 ** 40 - 1)

    def test_from_binary_rejects_bad_input(self):
        for bad in ["", "   ", "102", "0b101", "abc"]:
            with self.assertRaises(ValueError, msg=repr(bad)):
                bitkit.from_binary(bad)

    def test_round_trip(self):
        rng = random.Random(1)
        for _ in range(200):
            width = rng.randint(1, 32)
            n = rng.randrange(2 ** width)
            self.assertEqual(bitkit.from_binary(bitkit.to_binary(n, width)), n)


class TestHex(unittest.TestCase):
    def test_to_hex(self):
        self.assertEqual(bitkit.to_hex(0), "0")
        self.assertEqual(bitkit.to_hex(10), "A")
        self.assertEqual(bitkit.to_hex(255), "FF")
        self.assertEqual(bitkit.to_hex(4096), "1000")
        self.assertEqual(bitkit.to_hex(3735928559), "DEADBEEF")

    def test_to_hex_rejects_negative(self):
        with self.assertRaises(ValueError):
            bitkit.to_hex(-1)

    def test_from_hex(self):
        self.assertEqual(bitkit.from_hex("FF"), 255)
        self.assertEqual(bitkit.from_hex("ff"), 255)
        self.assertEqual(bitkit.from_hex("0x2F"), 47)
        self.assertEqual(bitkit.from_hex("0XdeadBEEF"), 3735928559)
        self.assertEqual(bitkit.from_hex("0"), 0)

    def test_from_hex_rejects_bad_input(self):
        for bad in ["", "0x", "G1", "12 34", "-5"]:
            with self.assertRaises(ValueError, msg=repr(bad)):
                bitkit.from_hex(bad)

    def test_round_trip(self):
        rng = random.Random(2)
        for _ in range(200):
            n = rng.randrange(2 ** 64)
            self.assertEqual(bitkit.from_hex(bitkit.to_hex(n)), n)


class TestTwosComplement(unittest.TestCase):
    def test_encode(self):
        self.assertEqual(bitkit.to_twos_complement(5, 8), "00000101")
        self.assertEqual(bitkit.to_twos_complement(-5, 8), "11111011")
        self.assertEqual(bitkit.to_twos_complement(-6, 8), "11111010")
        self.assertEqual(bitkit.to_twos_complement(-1, 8), "11111111")
        self.assertEqual(bitkit.to_twos_complement(-128, 8), "10000000")
        self.assertEqual(bitkit.to_twos_complement(127, 8), "01111111")
        self.assertEqual(bitkit.to_twos_complement(-1, 16), "1" * 16)

    def test_encode_rejects_out_of_range(self):
        for n, width in [(128, 8), (-129, 8), (2, 2)]:
            with self.assertRaises(ValueError, msg=f"{n} in {width} bits"):
                bitkit.to_twos_complement(n, width)

    def test_decode(self):
        self.assertEqual(bitkit.from_twos_complement("00000101"), 5)
        self.assertEqual(bitkit.from_twos_complement("11111011"), -5)
        self.assertEqual(bitkit.from_twos_complement("1000 0000"), -128)
        self.assertEqual(bitkit.from_twos_complement("0111_1111"), 127)
        self.assertEqual(bitkit.from_twos_complement("1"), -1)
        self.assertEqual(bitkit.from_twos_complement("1" * 32), -1)

    def test_round_trip(self):
        for width in (4, 8, 16):
            for n in range(-(2 ** (width - 1)), 2 ** (width - 1)):
                self.assertEqual(bitkit.from_twos_complement(bitkit.to_twos_complement(n, width)), n)


class TestAddWrapping(unittest.TestCase):
    def test_no_overflow(self):
        self.assertEqual(bitkit.add_wrapping(100, 27, 8), (127, False))
        self.assertEqual(bitkit.add_wrapping(-100, -28, 8), (-128, False))
        self.assertEqual(bitkit.add_wrapping(5, -5, 8), (0, False))

    def test_overflow_wraps(self):
        self.assertEqual(bitkit.add_wrapping(127, 1, 8), (-128, True))
        self.assertEqual(bitkit.add_wrapping(-128, -1, 8), (127, True))
        self.assertEqual(bitkit.add_wrapping(100, 100, 8), (-56, True))
        self.assertEqual(bitkit.add_wrapping(2 ** 31 - 1, 1, 32), (-(2 ** 31), True))

    def test_matches_reference(self):
        rng = random.Random(3)
        for _ in range(500):
            width = rng.choice([4, 8, 16, 32])
            lo, hi = -(2 ** (width - 1)), 2 ** (width - 1) - 1
            a, b = rng.randint(lo, hi), rng.randint(lo, hi)
            total = a + b
            wrapped = (total - lo) % (2 ** width) + lo
            self.assertEqual(bitkit.add_wrapping(a, b, width), (wrapped, not lo <= total <= hi))


class TestUtf8(unittest.TestCase):
    SAMPLES = ["", "A", "hello", "é", "café", "naïve", "€", "✓", "日本語", "😀", "Café ✓ 😀", "\x00", "\U0010FFFF"]

    def test_encode_matches_python(self):
        for text in self.SAMPLES:
            self.assertEqual(bitkit.utf8_encode(text), text.encode("utf-8"), msg=repr(text))

    def test_encode_lengths(self):
        self.assertEqual(len(bitkit.utf8_encode("A")), 1)
        self.assertEqual(len(bitkit.utf8_encode("é")), 2)
        self.assertEqual(len(bitkit.utf8_encode("€")), 3)
        self.assertEqual(len(bitkit.utf8_encode("😀")), 4)

    def test_encode_rejects_surrogates(self):
        with self.assertRaises(ValueError):
            bitkit.utf8_encode("\ud800")

    def test_decode_matches_python(self):
        for text in self.SAMPLES:
            self.assertEqual(bitkit.utf8_decode(text.encode("utf-8")), text, msg=repr(text))

    def test_decode_rejects_invalid(self):
        bad = [
            bytes([0x80]),               # continuation byte with no lead
            bytes([0xC3]),               # 2-byte sequence cut off
            bytes([0xE2, 0x82]),         # 3-byte sequence cut off
            bytes([0xC3, 0x41]),         # lead byte followed by a non-continuation
            bytes([0xFF]),               # never valid in UTF-8
            bytes([0xF8, 0x80, 0x80, 0x80, 0x80]),  # 5-byte form, not allowed
            b"ok\xe2\x82",               # valid start, broken end
        ]
        for data in bad:
            with self.assertRaises(ValueError, msg=data.hex(" ")):
                bitkit.utf8_decode(data)

    def test_round_trip_random(self):
        rng = random.Random(4)
        for _ in range(300):
            cp = rng.randint(0, 0x10FFFF)
            if 0xD800 <= cp <= 0xDFFF:
                continue
            ch = chr(cp)
            self.assertEqual(bitkit.utf8_decode(bitkit.utf8_encode(ch)), ch)


class TestFloat32(unittest.TestCase):
    def test_fields_of_known_values(self):
        self.assertEqual(bitkit.float32_fields(1.0), (0, 127, 0))
        self.assertEqual(bitkit.float32_fields(-2.0), (1, 128, 0))
        self.assertEqual(bitkit.float32_fields(0.5), (0, 126, 0))
        self.assertEqual(bitkit.float32_fields(0.0), (0, 0, 0))
        self.assertEqual(bitkit.float32_fields(0.1), (0, 123, 0x4CCCCD))
        self.assertEqual(bitkit.float32_fields(float("inf")), (0, 255, 0))

    def test_rebuild_known_values(self):
        self.assertEqual(bitkit.float32_from_fields(0, 127, 0), 1.0)
        self.assertEqual(bitkit.float32_from_fields(1, 128, 0x400000), -3.0)
        self.assertEqual(bitkit.float32_from_fields(0, 0, 0), 0.0)
        self.assertEqual(bitkit.float32_from_fields(0, 255, 0), math.inf)
        self.assertEqual(bitkit.float32_from_fields(1, 255, 0), -math.inf)
        self.assertTrue(math.isnan(bitkit.float32_from_fields(0, 255, 1)))

    def test_subnormal(self):
        smallest = struct.unpack(">f", (1).to_bytes(4, "big"))[0]   # about 1.4e-45
        self.assertEqual(bitkit.float32_from_fields(0, 0, 1), smallest)

    def test_round_trip_matches_float32(self):
        rng = random.Random(5)
        values = [0.1, 0.2, 0.3, 1 / 3, 3.14159, -2.75, 16777217.0, 1e-40, 6.02e23]
        values += [rng.uniform(-1e6, 1e6) for _ in range(200)]
        for x in values:
            as_float32 = struct.unpack(">f", struct.pack(">f", x))[0]
            fields = bitkit.float32_fields(x)
            self.assertEqual(bitkit.float32_from_fields(*fields), as_float32, msg=f"{x} -> {fields}")


if __name__ == "__main__":
    unittest.main()
