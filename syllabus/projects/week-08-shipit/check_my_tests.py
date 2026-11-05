"""Part 1 checker: how many bugs do your tests catch?

    python check_my_tests.py

Runs test_pricing.py against the real pricing.py (every test must pass), then
against 8 mutants: copies of pricing.py with one small deliberate bug each.
A mutant is "killed" if at least one of your tests fails on it.
"""
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))

MUTANTS = [
    ("free shipping starts above 50 instead of at 50",
     "if discounted_amount >= FREE_SHIPPING_THRESHOLD", "if discounted_amount > FREE_SHIPPING_THRESHOLD"),
    ("SAVE10 takes off 1% instead of 10%",
     "return amount * value / 100", "return amount * value / 1000"),
    ("FLAT5 can take off more than the order is worth",
     "return min(value, amount)", "return value"),
    ("a quantity of 0 is accepted",
     "or quantity <= 0:", "or quantity < 0:"),
    ("express replaces standard shipping instead of adding to it",
     "cost += EXPRESS_SURCHARGE", "cost = EXPRESS_SURCHARGE"),
    ("free shipping is judged before the discount",
     "return round(amount + shipping(amount, express), 2)", "return round(amount + shipping(subtotal(items), express), 2)"),
    ("unknown coupons are silently ignored",
     "        raise ValueError(f\"unknown coupon: {coupon!r}\")", "        return 0.0"),
    ("negative prices are accepted",
     "        if price < 0:", "        if price < -1e9:"),
]


def run_tests(directory):
    result = subprocess.run([sys.executable, "-m", "unittest", "-q", "test_pricing"], cwd=directory,
                            capture_output=True, text=True, timeout=120)
    return result.returncode == 0, result.stderr


def main():
    if not os.path.exists(os.path.join(HERE, "test_pricing.py")):
        sys.exit("Write your tests in test_pricing.py first.")
    with open(os.path.join(HERE, "pricing.py"), encoding="utf-8") as f:
        original = f.read()

    with tempfile.TemporaryDirectory() as tmp:
        shutil.copy(os.path.join(HERE, "test_pricing.py"), tmp)
        with open(os.path.join(tmp, "pricing.py"), "w", encoding="utf-8") as f:
            f.write(original)
        ok, output = run_tests(tmp)
        if not ok:
            print("Your tests fail against the REAL pricing.py, so fix them first:\n")
            print(output[-3000:])
            sys.exit(1)
        test_count = output.strip().splitlines()[-3] if output.strip() else ""
        print(f"All tests pass against the real code. {test_count}\n")

        killed = 0
        for description, old, new in MUTANTS:
            assert original.count(old) == 1, f"mutant no longer applies: {description}"
            with open(os.path.join(tmp, "pricing.py"), "w", encoding="utf-8") as f:
                f.write(original.replace(old, new))
            caught, _ = run_tests(tmp)
            caught = not caught
            killed += caught
            print(f"  {'KILLED  ' if caught else 'SURVIVED'}  {description}")

    print(f"\nMutation score: {killed}/{len(MUTANTS)}")
    if killed >= 7:
        print("Great: your tests catch almost every deliberate bug.")
    else:
        print("Each survivor is a bug your tests would miss. Add a test that would fail if it existed.")
    sys.exit(0 if killed >= 7 else 1)


if __name__ == "__main__":
    main()
