"""Try your buttons.py on an ESP32 (MicroPython).

Wiring: a push button between GPIO 14 and GND (the internal pull-up is
used, so pressed reads 0). The on-board LED is GPIO 2 on most ESP32
DevKit boards; otherwise wire an LED and a 220 ohm resistor from GPIO 2 to GND.

    mpremote fs cp buttons.py :buttons.py
    mpremote run board_demo.py

click toggles the LED, double click blinks it three times, long press turns it off.
"""
import time

from machine import Pin

from buttons import ButtonEvents, Debouncer

button = Pin(14, Pin.IN, Pin.PULL_UP)
led = Pin(2, Pin.OUT)
debouncer = Debouncer(stable_ms=30)
gestures = ButtonEvents()

print("Ready: click, double click or long press")
while True:
    now = time.ticks_ms()
    edge = debouncer.update(button.value() == 0, now)    # active low: 0 means pressed
    gesture = gestures.feed(edge, now) if edge else gestures.tick(now)
    if gesture:
        print(gesture)
    if gesture == "click":
        led.value(not led.value())
    elif gesture == "double_click":
        for _ in range(3):
            led.on(); time.sleep_ms(100); led.off(); time.sleep_ms(100)
    elif gesture == "long_press":
        led.off()
    time.sleep_ms(2)
