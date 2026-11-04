# Week 1 project: bitkit

Build a small module that converts numbers and text to and from their raw
representations by hand. Python normally hides all of this. Writing it
yourself is the best way to make week 1 stick.

**Time:** 4–5 hours · **Files:** `bitkit.py` (yours to finish), `test_bitkit.py` (don't edit)

## Run the tests

```bash
python3 -m unittest -v          # from this folder
python3 -m unittest -v -k utf8  # just the UTF-8 tests
```

Everything starts out failing with `NotImplementedError`. Work through the
functions in order; each one builds on ideas from the one before.

## Rules

The point is to do the conversions yourself, so **don't use** `bin()`,
`hex()`, `format(x, "b")` / `format(x, "x")`, `int(text, 2)`,
`int(text, 16)`, `str.encode()`, `bytes.decode()` or the `codecs` module.

You **may** use `ord()`, `chr()`, arithmetic, bitwise operators
(`&`, `|`, `^`, `<<`, `>>`, `~`), and `struct` **only** inside
`float32_fields`.

## Tasks

1. **`to_binary(n, width)` and `from_binary(bits)`**: unsigned integers to
   and from strings of 0s and 1s. Raise `ValueError` for values that don't
   fit, or for bad input.
2. **`to_hex(n)` and `from_hex(text)`**: the same for base 16. Output is
   uppercase with no prefix; input may have a `0x` prefix and any case.
3. **`to_twos_complement(n, width)` and `from_twos_complement(bits)`**:
   signed integers in two's complement.
4. **`add_wrapping(a, b, width)`**: add two signed integers the way a
   fixed-width CPU register would. Return `(result, overflowed)`.
5. **`utf8_encode(text)` and `utf8_decode(data)`**: implement UTF-8 using the
   bit patterns from lesson 1.4. Decoding must reject invalid byte sequences
   with `ValueError`.
6. **`float32_fields(x)` and `float32_from_fields(sign, exponent, fraction)`**:
   split a float into its IEEE 754 fields, and rebuild the value from them
   (normal numbers, subnormals, zero, infinity and NaN).

## Hints

- To pull out bit *i* of `n`: `(n >> i) & 1`. To keep only the low 8 bits:
  `n & 0xFF`.
- For hex digits, a lookup string like `"0123456789ABCDEF"` saves a lot of
  `if` statements.
- Two's complement of a negative `n` in `width` bits is the unsigned value
  `n + 2**width`.
- For `add_wrapping`, add normally, wrap into `width` bits, then reinterpret
  the result as signed.
- For UTF-8 encoding, decide the byte count from the code point's range, then
  fill the `x` positions of the pattern from the low bits upward.
- `struct.pack(">f", x)` gives the 4 bytes of a float32, big-endian.
  `int.from_bytes(..., "big")` turns them into one integer you can mask.

## Stretch goals (optional, no tests)

- Make `utf8_decode` also reject *overlong* encodings (for example
  `C0 80` for U+0000), which have caused real security bugs.
- Write `float64_fields` for doubles (11 exponent bits, 52 fraction bits).
- Add a tiny command-line interface: `python3 bitkit.py 202` prints the
  number in binary, hex and two's complement.

## Written questions

Answer these briefly here, under each question, before you commit.

1. `add_wrapping(127, 1, 8)` returns `(-128, True)`. Explain in one or two
   sentences why the bit pattern means −128.

   _Your answer:_

2. Why does `utf8_decode(bytes([0xC3]))` have to fail rather than return
   something?

   _Your answer:_

3. What does `float32_fields(0.1)` tell you about why `0.1 + 0.2 != 0.3`?

   _Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 1 page.
