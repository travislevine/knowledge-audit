"""Project 2 collector: runs on the Pi. Finish the TODOs. See ../README.md.

    ~/plantenv/bin/python collector.py
"""
import getpass
import json
import sqlite3
import time

import paho.mqtt.client as mqtt

DB = "plants.db"
DRY_BELOW, OK_ABOVE = 30, 40      # alert hysteresis, in %
SUSTAIN_S = 30 * 60               # alert only after this long below DRY_BELOW

db = sqlite3.connect(DB)
db.executescript("""
CREATE TABLE IF NOT EXISTS readings (
    device TEXT NOT NULL, ts REAL NOT NULL, moisture REAL, raw INTEGER,
    PRIMARY KEY (device, ts)                      -- a resent reading isn't stored twice
);
CREATE TABLE IF NOT EXISTS devices (
    device TEXT PRIMARY KEY, status TEXT, last_seen REAL
);
""")

dry_since = {}    # device -> time it first read below DRY_BELOW
alerting = set()  # devices currently in the "dry" alert state


def handle_reading(client, device, data):
    """Store the reading (ignore duplicates), update last_seen, and apply the alert rule:
    publish a retained "dry" to garden/<device>/alert once the moisture has stayed below
    DRY_BELOW for SUSTAIN_S, and "ok" once it rises above OK_ABOVE. Publish only on changes."""
    # TODO
    raise NotImplementedError


def handle_status(device, status):
    """Record online/offline in the devices table and print the change."""
    # TODO
    raise NotImplementedError


def on_message(client, userdata, msg):
    parts = msg.topic.split("/")          # garden/<device>/<kind>
    if len(parts) != 3:
        return
    _, device, kind = parts
    try:
        if kind == "reading":
            handle_reading(client, device, json.loads(msg.payload))
        elif kind == "status":
            handle_status(device, msg.payload.decode())
    except (ValueError, KeyError) as e:
        print("bad message on", msg.topic, e)   # never let one bad message kill the service


def on_connect(client, userdata, flags, reason_code, properties):
    print("connected:", reason_code)
    client.subscribe("garden/+/reading", qos=1)
    client.subscribe("garden/+/status", qos=1)   # subscribing here re-subscribes after reconnects


client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="collector")
client.username_pw_set("collector", getpass.getpass("MQTT password for collector: "))
client.on_connect = on_connect
client.on_message = on_message
client.connect("localhost", 1883, keepalive=30)
client.loop_forever()
