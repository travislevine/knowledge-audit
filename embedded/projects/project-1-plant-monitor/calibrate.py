"""Print raw readings every half second. Run with: mpremote run calibrate.py"""
import time

from machine import ADC, Pin

power = Pin(25, Pin.OUT)
adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)          # full range, about 0-3.3 V

power.on()
time.sleep_ms(200)                # let the sensor settle
while True:
    samples = [adc.read() for _ in range(16)]
    print("raw: %4d   (min %d, max %d)" % (sum(samples) // 16, min(samples), max(samples)))
    time.sleep_ms(500)
