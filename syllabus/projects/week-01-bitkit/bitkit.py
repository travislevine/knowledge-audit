"""bitkit: number and text encodings from scratch.

Week 1 project. See README.md for the rules (no bin/hex/int(x, 2)/encode).
Run the tests with:  python3 -m unittest -v
"""
import struct

HEX_DIGITS = "0123456789ABCDEF"


# --- 1. Unsigned binary ---------------------------------------------------

def to_binary(n, width=8):
    """Return n as a string of exactly `width` binary digits.

    >>> to_binary(5, 8)
    '00000101'

    Raise ValueError if n is negative or doesn't fit in `width` bits.
    """
    raise NotImplementedError


def from_binary(bits):
    """Return the unsigned integer for a string of 0s and 1s.

    Spaces and underscores are ignored, so "1010 0001" and "1010_0001" work.

    >>> from_binary("1010 0001")
    161

    Raise ValueError if the string is empty or has any other character.
    """
    raise NotImplementedError


# --- 2. Hexadecimal ----------------------------------------------------------

def to_hex(n):
    """Return n (n >= 0) in uppercase hex with no prefix.

    >>> to_hex(255)
    'FF'
    >>> to_hex(0)
    '0'

    Raise ValueError if n is negative.
    """
    raise NotImplementedError


def from_hex(text):
    """Return the integer for a hex string.

    Accepts an optional "0x" or "0X" prefix and either letter case.

    >>> from_hex("0xff")
    255

    Raise ValueError for an empty string or invalid digits.
    """
    raise NotImplementedError


# --- 3. Two's complement --------------------------------------------------

def to_twos_complement(n, width=8):
    """Return the `width`-bit two's complement bit string for n.

    >>> to_twos_complement(-6, 8)
    '11111010'

    Raise ValueError if n is outside -2**(width-1) .. 2**(width-1) - 1.
    """
    raise NotImplementedError


def from_twos_complement(bits):
    """Return the signed integer for a two's complement bit string.

    The width is the length of the string (ignoring spaces and underscores).

    >>> from_twos_complement("11111010")
    -6
    """
    raise NotImplementedError


# --- 4. Fixed-width arithmetic --------------------------------------------

def add_wrapping(a, b, width=8):
    """Add two signed integers in a `width`-bit register.

    Return (result, overflowed): the wrapped two's complement result, and
    whether the true sum didn't fit.

    >>> add_wrapping(100, 27, 8)
    (127, False)
    >>> add_wrapping(127, 1, 8)
    (-128, True)
    """
    raise NotImplementedError


# --- 5. UTF-8 -----------------------------------------------------------------

def utf8_encode(text):
    """Encode a str as UTF-8 bytes, by hand.

    >>> utf8_encode("é")
    b'\\xc3\\xa9'

    Raise ValueError for surrogate code points (U+D800 to U+DFFF), which
    UTF-8 isn't allowed to encode.
    """
    raise NotImplementedError


def utf8_decode(data):
    """Decode UTF-8 bytes into a str, by hand.

    >>> utf8_decode(b"caf\\xc3\\xa9")
    'café'

    Raise ValueError for invalid input: a continuation byte where a character
    should start, an invalid lead byte, a missing continuation byte, or a
    sequence cut off at the end of the data.
    """
    raise NotImplementedError


# --- 6. IEEE 754 float32 ---------------------------------------------------

def float32_fields(x):
    """Return (sign, exponent, fraction) of x stored as a 32-bit float.

    sign is 0 or 1, exponent is the raw 8-bit field (0-255), and fraction is
    the raw 23-bit field. You may use struct here, and only here.

    >>> float32_fields(1.0)
    (0, 127, 0)
    """
    raise NotImplementedError


def float32_from_fields(sign, exponent, fraction):
    """Rebuild the float value from raw float32 fields, using arithmetic.

    Handle normal numbers, subnormals (exponent 0), zero, infinity and NaN
    (exponent 255). Don't use struct.

    >>> float32_from_fields(0, 127, 0)
    1.0
    >>> float32_from_fields(1, 128, 0b100_0000_0000_0000_0000_0000)
    -3.0
    """
    raise NotImplementedError


if __name__ == "__main__":
    for value in (5, 202, 255):
        print(value, to_binary(value), to_hex(value))
