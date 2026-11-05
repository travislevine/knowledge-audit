"""Project 3: automatic watering system. Finish the TODOs. See README.md."""
from machine import Pin

pump = Pin(26, Pin.OUT, value=0)      # pump off first, before anything else can fail

import json
import time

import machine
from machine import ADC, WDT

import config
import secrets
from controller import WateringController
from mqttkit import Outbox
from sensors import Ema, MedianFilter, is_plausible, moisture_percent

PUMP_HARD_LIMIT_MS = 20_000           # independent of the controller: never pump longer than this at once
MAX_MANUAL_S = 15

controller = WateringController(dry_below=config.DRY_BELOW, wet_above=config.DRY_BELOW + 15,
                                burst_s=8, soak_s=600, max_daily_s=90)
reset_reason = machine.reset_cause()

# TODO: set up the sensor, filters, Wi-Fi, MQTT (with a last will and a callback
# for garden/<device>/cmd), the outbox and the watchdog. Reuse Projects 1 and 2.


def set_pump(on, now):
    """Drive the pump pin, enforce PUMP_HARD_LIMIT_MS, and queue a pump on/off message on changes."""
    # TODO
    raise NotImplementedError


def handle_command(topic, msg):
    """Parse {"water_s": n}; clamp to MAX_MANUAL_S; refuse in fault state; count it against
    the controller's daily budget. Ignore (and report) anything malformed."""
    # TODO
    raise NotImplementedError


while True:
    now = time.ticks_ms()
    # TODO, in order:
    #   1. take a reading when due and pass the filtered moisture (or None) to controller.update()
    #   2. apply any manual watering request
    #   3. set_pump(...) from the result
    #   4. MQTT housekeeping (reconnect, check_msg, flush the outbox, periodic status)
    #   5. feed the watchdog, only if everything above completed
    time.sleep_ms(20)
