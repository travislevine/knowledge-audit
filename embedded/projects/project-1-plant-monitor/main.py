"""Project 1: ESP32 plant monitor. Finish the TODOs. See README.md."""
import time

from machine import ADC, Pin

import config
from sensors import Ema, MedianFilter, is_plausible, moisture_percent

power = Pin(25, Pin.OUT)
adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)
led = Pin(2, Pin.OUT)

median = MedianFilter(5)
ema = Ema(0.3)


def read_raw():
    """Power the sensor, wait briefly for it to settle, average 16 readings, power it off."""
    # TODO
    raise NotImplementedError


def status_for(percent):
    """Return "ok", "dry" or "fault" (percent is None for a fault)."""
    # TODO
    raise NotImplementedError


BLINK_MS = {"ok": None, "dry": 150, "fault": 50}   # None = LED off
# TODO: you might prefer a slow blink for "getting dry" (e.g. within 10% of DRY_BELOW).

last_read = time.ticks_add(time.ticks_ms(), -config.READ_EVERY_MS)
last_blink = time.ticks_ms()
status = "ok"

while True:
    now = time.ticks_ms()
    if time.ticks_diff(now, last_read) >= config.READ_EVERY_MS:
        last_read = now
        # TODO: read, check plausibility, filter (median, then EMA), convert to %,
        # update `status`, and print a line like:  raw 2140  moisture 51.2%  ok
    # TODO: drive the LED from `status` without blocking (toggle every BLINK_MS[status] ms).
    time.sleep_ms(5)
