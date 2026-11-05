"""Order pricing for a small online shop. This code is correct: don't edit it.

Part 1 of the project is to write tests for it in test_pricing.py.
"""

FREE_SHIPPING_THRESHOLD = 50.00
STANDARD_SHIPPING = 4.99
EXPRESS_SURCHARGE = 9.99
COUPONS = {"SAVE10": ("percent", 10), "FLAT5": ("fixed", 5.00)}


def subtotal(items):
    """Sum of price * quantity for (price, quantity) pairs.

    Quantities must be positive whole numbers and prices must not be negative.
    """
    total = 0.0
    for price, quantity in items:
        if not isinstance(quantity, int) or quantity <= 0:
            raise ValueError(f"bad quantity: {quantity!r}")
        if price < 0:
            raise ValueError(f"bad price: {price!r}")
        total += price * quantity
    return total


def discount(amount, coupon):
    """How much a coupon takes off `amount`. Never more than the amount itself."""
    if coupon is None:
        return 0.0
    if coupon not in COUPONS:
        raise ValueError(f"unknown coupon: {coupon!r}")
    kind, value = COUPONS[coupon]
    if kind == "percent":
        return amount * value / 100
    return min(value, amount)


def shipping(discounted_amount, express=False):
    """Standard shipping is free from FREE_SHIPPING_THRESHOLD upwards
    (judged after discounts). Express adds a surcharge on top."""
    cost = 0.0 if discounted_amount >= FREE_SHIPPING_THRESHOLD else STANDARD_SHIPPING
    if express:
        cost += EXPRESS_SURCHARGE
    return cost


def order_total(items, coupon=None, express=False):
    """The amount to charge, rounded to cents."""
    amount = subtotal(items)
    amount -= discount(amount, coupon)
    return round(amount + shipping(amount, express), 2)
