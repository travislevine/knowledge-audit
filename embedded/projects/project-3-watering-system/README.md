# Project 3: automatic watering system (capstone)

The ESP32 waters your plant by itself, using the controller you tested in
week 4. It reports to the Pi over MQTT, accepts safe remote commands, and
fails safe when anything goes wrong.

**Time:** 5–6 hours · **Hardware:** everything from Projects 1 and 2, plus a small 5–12 V DC pump or solenoid valve, a 1-channel 3.3 V-compatible relay module **or** a logic-level N-channel MOSFET (IRLZ44N or similar) with a 1N4007 flyback diode and a 10 kΩ pull-down resistor, a separate power supply for the pump, silicone tubing and a water container

## Wiring

**Option A: relay module.** IN to GPIO 26, VCC and GND per the module's
label (many need 5 V for the coil; check that IN works with 3.3 V logic). The
pump's supply goes through the relay's COM and NO (normally open) contacts, so
the pump is off when the relay is unpowered.

**Option B: MOSFET (quieter, and can PWM).** Gate to GPIO 26 through a
100 Ω resistor, with a 10 kΩ resistor from gate to ground so the pump stays off
while the ESP32 boots. Source to ground. Drain to the pump's negative wire;
pump positive to the pump supply's positive. Diode across the pump (stripe
towards positive). **Connect the pump supply's ground to the ESP32's ground.**

Either way, the pump is never powered from the ESP32, and an unpowered,
resetting or crashed ESP32 means the pump is off.

Test the pump with water in a bucket over a sink before trusting it with a plant.

## Steps

1. **Finish the week 4 mini-project**, then copy `controller.py` to the board
   along with the files from Projects 1 and 2.
2. **Finish `main.py`**: each reading goes through your filters and into
   `WateringController.update()`, and the pump pin follows the result. Add:
   - a **watchdog** (`WDT(timeout=8000)`) fed only at the end of a healthy loop pass
   - the **pump off at boot**, before anything else
   - an **absolute pump timeout** in `main.py` itself (independent of the
     controller), as a second line of defense
   - MQTT: publish readings, `garden/<device>/pump` (`on`/`off`), controller
     state, uptime, reset reason (`machine.reset_cause()`) and today's pump
     seconds
   - a **command** topic `garden/<device>/cmd` accepting `{"water_s": 5}`
     for a manual burst, clamped to at most 15 s, refused in fault state,
     and counted against the daily budget
3. **Tune** `dry_below`, `wet_above`, `burst_s` and `soak_s` for your pot.
   Start conservative: short bursts and long soaks.
4. **Extend the collector** on the Pi to store pump events, and add an alert
   if the plant is still dry after the daily budget is used up (the reservoir
   may be empty or the tube blocked).
5. **Write `DESIGN.md`** (one page): the wiring diagram (a photo of a sketch is
   fine), the states and transitions, every safety mechanism and what failure
   it handles, your tuning values, and what you'd change to make 20 of these.

## Fault checklist

Test each of these and record the result in `NOTES.md`:

- [ ] Sensor pulled out of the soil (reads dry): the pump stops at the daily budget
- [ ] Sensor unplugged (implausible reading): fault state, pump off, reported over MQTT
- [ ] The ESP32 reset while pumping: the pump stops immediately and stays off during boot
- [ ] An infinite loop added on purpose: the watchdog resets the board
- [ ] Wi-Fi or the broker down: watering still works locally; data arrives later
- [ ] A command of `{"water_s": 600}`: clamped to 15 s
- [ ] Reservoir empty: the dry-after-budget alert fires on the Pi

## Questions for NOTES.md

1. Which of your safety mechanisms would have prevented each fault above? Which faults needed more than one?
2. What is still unsafe or unreliable about your build? What would you fix first?
3. Estimate the cost per unit (bill of materials) if you made 20.
