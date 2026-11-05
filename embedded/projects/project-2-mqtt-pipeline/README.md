# Project 2: Raspberry Pi MQTT pipeline

Turn your Raspberry Pi into the hub: it runs an MQTT broker, and a Python
service that stores every reading in SQLite, tracks which devices are
online, and raises an alert when a plant stays dry. The ESP32 from Project 1
publishes its readings over Wi-Fi.

**Time:** 4–5 hours · **Hardware:** Raspberry Pi (Raspberry Pi OS) on your home network, and the ESP32 plant monitor

```
ESP32 ──Wi-Fi──► Mosquitto (Pi) ──► collector.py (Pi) ──► plants.db
                       ▲                     │
               mosquitto_sub (you)      alerts printed / published
```

## Topics

| Topic | Payload | Retained | Who publishes |
|---|---|---|---|
| `garden/<device>/reading` | `{"moisture": 41.5, "raw": 2190, "ts": 1793856600}` | no | device |
| `garden/<device>/status` | `online` or `offline` (offline is the last will) | yes | device, broker |
| `garden/<device>/alert` | `dry` or `ok` | yes | collector |

## Steps

1. **Broker on the Pi.**

   ```bash
   sudo apt update && sudo apt install -y mosquitto mosquitto-clients
   sudo mosquitto_passwd -c /etc/mosquitto/passwd plant1      # the ESP32's login
   sudo mosquitto_passwd /etc/mosquitto/passwd collector       # the collector's login
   sudo cp pi/mosquitto-local.conf /etc/mosquitto/conf.d/local.conf
   sudo systemctl restart mosquitto
   mosquitto_sub -h localhost -u collector -P <password> -t 'garden/#' -v
   ```

   Mosquitto 2 only accepts local connections until you add a listener, which
   is what `local.conf` does, with passwords required.
2. **Finish the week 3 mini-project**, then copy `mqttkit.py` and the Project 1
   `sensors.py` and `config.py` to the ESP32. Install the MQTT client on the
   board: `mpremote mip install umqtt.simple`.
3. **Device.** Copy `device/secrets_example.py` to `device/secrets.py` (it's
   ignored by git) and fill in your Wi-Fi and MQTT details. Finish the TODOs in
   `device/main.py`: connect with a last will, publish a retained `online`
   status, publish readings through an `Outbox` so readings taken while
   offline are sent later, and reconnect after failures without blocking forever.
4. **Collector on the Pi.** In a virtual environment:
   `python -m venv ~/plantenv && ~/plantenv/bin/pip install paho-mqtt`.
   Finish the TODOs in `pi/collector.py` and run it with
   `~/plantenv/bin/python collector.py`.
5. **Break things on purpose**: unplug the ESP32 (status should go
   `offline` within about 1.5 × keepalive), turn the Pi's broker off for a few
   minutes (readings should arrive late, not be lost), and dry out the soil
   (one `dry` alert, not one per reading).

## Checklist

- [ ] Readings arrive in `plants.db`; `sqlite3 plants.db "select count(*), max(moisture) from readings"` works
- [ ] Unplugging the ESP32 changes its status to `offline`
- [ ] Readings taken during a broker outage arrive afterwards, with their original timestamps
- [ ] Dry alerts use hysteresis and a sustain time: no alert storms
- [ ] No passwords in any committed file

## Stretch goals

- A dashboard: Grafana or Node-RED on the Pi, or a small page served by Python.
- TLS on port 8883 with a self-signed certificate authority.
- An access control list so `plant1` can only publish under `garden/plant1/#`.

## Questions for NOTES.md

1. Which QoS did you use for readings and for status, and why?
2. What happens to readings if the ESP32 reboots while offline? How could you avoid losing them?
3. How would this design change for 200 devices on a farm with no Wi-Fi?
