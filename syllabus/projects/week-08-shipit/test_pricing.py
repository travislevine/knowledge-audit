"""Part 1: your tests for pricing.py.

Write tests that pass against pricing.py and fail when it has a bug.
Then run:  python check_my_tests.py
"""
import unittest

from pricing import discount, order_total, shipping, subtotal


class TestPricing(unittest.TestCase):
    def test_simple_order(self):
        # Example: 2 items at 10.00 = 20.00, plus 4.99 standard shipping.
        self.assertEqual(order_total([(10.00, 2)]), 24.99)

    # Add your tests here. Think about boundaries (exactly 50.00), every
    # coupon, express shipping, and the inputs that should raise ValueError.


if __name__ == "__main__":
    unittest.main()
