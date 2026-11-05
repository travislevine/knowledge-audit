"""Sensor toolkit: ADC conversion, calibration, filtering and register decoding.

Pure logic that runs on a laptop and on MicroPython (no imports needed).
Run the tests with:  python -m unittest -v
"""


def adc_to_voltage(raw, bits=12, vref=3.3):
    """Convert a raw ADC reading to volts. Raise ValueError if raw is outside 0..2**bits - 1."""
    raise NotImplementedError


def moisture_percent(raw, dry, wet):
    """Map a raw reading to 0-100% using calibration points (raw in air = dry, in water = wet).

    Works whichever way the sensor runs (capacitive sensors read lower when
    wetter). Clamp to 0-100. Raise ValueError if dry == wet.
    """
    raise NotImplementedError


def is_plausible(raw, bits=12, margin=20):
    """False for readings within `margin` counts of either end of the ADC range,
    which usually means a disconnected or shorted sensor."""
    raise NotImplementedError


class MedianFilter:
    """Median of the last `size` readings (size must be odd and positive)."""

    def __init__(self, size=5):
        if size < 1 or size % 2 == 0:
            raise ValueError("size must be odd and positive")
        self.size = size
        self.values = []

    def update(self, x):
        """Add a reading and return the median of the readings so far (up to `size`)."""
        raise NotImplementedError


class Ema:
    """Exponential moving average: avg += alpha * (x - avg). The first reading initializes it."""

    def __init__(self, alpha):
        if not 0 < alpha <= 1:
            raise ValueError("alpha must be in (0, 1]")
        self.alpha = alpha
        self.value = None

    def update(self, x):
        raise NotImplementedError


def decode_tmp102(msb, lsb):
    """Decode a TMP102 temperature register: the top 12 bits of (msb, lsb) are a
    two's complement count of 0.0625 degC steps. Return degrees Celsius."""
    raise NotImplementedError
