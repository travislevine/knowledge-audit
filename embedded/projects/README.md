# Embedded Systems and IoT projects

Two kinds of project:

- **Mini-projects** (`week-01-buttons` … `week-04-control`) are pure logic,
  tested on your laptop with simulated time and readings. Make the tests pass
  with `python -m unittest -v` in each folder. The same files then run
  unchanged on the ESP32 under MicroPython.
- **Projects 1–3** run on your real hardware and build on each other:
  1. `project-1-plant-monitor`: ESP32 and soil sensor, with LED status (week 2)
  2. `project-2-mqtt-pipeline`: the Pi as MQTT broker and data collector (week 3)
  3. `project-3-watering-system`: the ESP32 waters the plant, safely (week 4)

On macOS or Linux, type `python3` where these instructions say `python`.

## Setting up the ESP32 with MicroPython (once)

1. Install the tools on your laptop: `pip install esptool mpremote`.
2. Download the latest ESP32 firmware (`ESP32_GENERIC-*.bin`) from
   <https://micropython.org/download/ESP32_GENERIC/>.
3. Plug in the ESP32 and flash it (on Windows the port looks like `COM5`;
   check Device Manager):

   ```bash
   esptool --port COM5 erase_flash
   esptool --port COM5 --baud 460800 write_flash 0x1000 ESP32_GENERIC-xxxx.bin
   ```

   If you have trouble, check the download page above: newer firmware and
   ESP32 variants (S2, S3, C3) use different offsets.
4. Test it: `mpremote` opens a Python prompt on the board. Try
   `import machine; machine.freq()`. Press Ctrl+] to exit.

Useful `mpremote` commands:

```bash
mpremote fs cp buttons.py :buttons.py     # copy a file to the board
mpremote fs ls                            # list files on the board
mpremote run board_demo.py                # run a file from your laptop without copying
mpremote fs cp main.py :main.py           # main.py runs automatically at boot
mpremote reset
```

## Safety

- ESP32 and Pi pins are **3.3 V only**. Never connect 5 V to them.
- Never drive a motor, pump or relay coil straight from a pin: use a relay
  module or a logic-level MOSFET with a flyback diode, and a separate supply.
- Water and electronics: keep the electronics above and away from the
  water, use a drip tray, and stay with low-voltage DC (5–12 V). Don't
  switch mains power.
