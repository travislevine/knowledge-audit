# Project 1: ESP32 plant monitor

Read your soil moisture sensor with the ESP32, calibrate it, filter the
readings with your week 2 toolkit, and show the plant's status on an LED.
This is the device the next two projects build on.

**Time:** 3–4 hours · **Hardware:** ESP32, soil moisture sensor, LED and 220 Ω resistor (or the on-board LED), breadboard and jumper wires · **Optional:** a 0.96" SSD1306 I2C OLED display

## Wiring

| Sensor pin | ESP32 |
|---|---|
| VCC | GPIO 25 (we power the sensor from a pin only while reading, so it lasts longer and uses less power) |
| GND | GND |
| AOUT | GPIO 34 (an ADC1 pin, so it still works when Wi-Fi is on) |

The LED goes from GPIO 2 through the resistor to GND. For the optional
OLED: VCC to 3V3, GND to GND, SDA to GPIO 21, SCL to GPIO 22.

Check your sensor's supply voltage: most capacitive sensors (v1.2 and v2.0)
work at 3.3 V. If yours needs 5 V, its output may exceed 3.3 V; use a
voltage divider (two equal resistors) on AOUT.

## Steps

1. **Finish the week 2 mini-project** so `sensors.py` passes its tests, then
   copy it to the board: `mpremote fs cp ../week-02-sensors/sensors.py :sensors.py`.
2. **Calibrate.** Run `mpremote run calibrate.py`. Note the raw reading with
   the sensor in dry air, then in a glass of water (only up to the line
   marked on the sensor: keep the electronics dry). Put both numbers in
   `config.py` (copy `config_example.py`).
3. **Finish `main.py`** (the TODOs): read the sensor with oversampling, check
   plausibility, filter with a median then an EMA, convert to a percentage,
   and set the LED: off when moist, slow blink when getting dry, fast blink
   when dry or faulty. Print one line per reading. Keep the loop
   non-blocking (no long sleeps), as in week 1.
4. **Test it in a real pot.** Watch the readings over a day or two as the
   soil dries and after you water it.
5. **Optional:** show the moisture percentage on the OLED. Install the driver
   with `mpremote mip install ssd1306`, then use `I2C(0, scl=Pin(22), sda=Pin(21))`
   and `.scan()` to confirm its address (usually `0x3c`).

Copy the files with `mpremote fs cp config.py :config.py` and
`mpremote fs cp main.py :main.py`, then press the board's reset button.

## Checklist

- [ ] Calibration values recorded, with the date and how you measured them
- [ ] Readings move the right way when you squeeze the soil or add water
- [ ] Unplugging AOUT produces a fault (fast blink), not a fake reading
- [ ] Single-sample spikes don't change the status
- [ ] The loop stays responsive (e.g. it could still read a button)

## Questions for NOTES.md

1. What were your dry and wet readings, and how stable was each one?
2. How much did readings vary when nothing changed? Which filter settings did you choose, and why?
3. Why does powering the sensor only while reading make it last longer?
4. What would you need to change to run this on batteries for months? (Look ahead to week 4.)
