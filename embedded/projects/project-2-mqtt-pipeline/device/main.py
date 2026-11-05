"""Project 2 device: publish plant readings over MQTT. Finish the TODOs. See ../README.md."""
import json
import time

import network
from machine import ADC, Pin
from umqtt.simple import MQTTClient

import config
import secrets
from mqttkit import Outbox
from sensors import Ema, MedianFilter, is_plausible, moisture_percent

BASE = "garden/" + secrets.DEVICE_ID
wlan = network.WLAN(network.STA_IF)
outbox = Outbox(capacity=200)
client = None


def wifi_up():
    """Start connecting if needed; return True once connected. Never block for long."""
    if not wlan.active():
        wlan.active(True)
    if not wlan.isconnected() and wlan.status() != network.STAT_CONNECTING:
        wlan.connect(secrets.WIFI_SSID, secrets.WIFI_PASSWORD)
    return wlan.isconnected()


def mqtt_connect():
    """Create a client with keepalive=30 and a retained last will of "offline" on BASE/status,
    connect, then publish a retained "online" status. Return the client."""
    # TODO
    raise NotImplementedError


def take_reading():
    """Return a dict like {"moisture": 41.5, "raw": 2190, "ts": ...}, or None for a fault.
    Reuse your Project 1 code. For ts, use time.time() once the clock is set by NTP
    (import ntptime; ntptime.settime() after Wi-Fi connects). Some MicroPython
    versions count from 2000-01-01: if time.time() is about 30 years behind, add
    946684800 to get Unix time."""
    # TODO
    raise NotImplementedError


def publish(topic, payload):
    """Used by outbox.flush. Return False (or raise OSError) when sending fails."""
    if client is None:
        return False
    client.publish(topic, payload)
    return True


last_read = time.ticks_add(time.ticks_ms(), -config.READ_EVERY_MS)
while True:
    now = time.ticks_ms()
    if time.ticks_diff(now, last_read) >= config.READ_EVERY_MS:
        last_read = now
        reading = take_reading()
        if reading is not None:
            outbox.add(BASE + "/reading", json.dumps(reading))
    # TODO: if Wi-Fi is up and there's no client, try mqtt_connect() (catch OSError
    # and don't retry more than every 10 seconds). Then flush the outbox; if publishing
    # fails, drop the client so the next pass reconnects. Call client.ping() every
    # ~15 s (or check_msg()) so the keepalive doesn't expire.
    time.sleep_ms(20)
