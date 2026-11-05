"""Watering controller logic and a battery-life estimate.

Pure logic: readings and time come in as arguments, and the pump state comes
out, so it runs (and is tested) on a laptop and drives real hardware unchanged.
Run the tests with:  python -m unittest -v
"""

DAY = 86400


class WateringController:
    """Decide when to run the pump.

    States: "idle", "watering", "soaking", "fault".
    - idle: if moisture < dry_below and today's budget isn't used up, start watering.
    - watering: pump on. Stop after burst_s seconds, when moisture > wet_above,
      or when the daily budget (max_daily_s seconds of pumping per calendar day,
      days counted as now // 86400) is used up; then soak.
    - soaking: pump off for soak_s seconds; then, if moisture is still at or
      below wet_above and budget remains, water again, else go idle.
    - fault: any reading that is None or outside valid_range turns the pump off
      immediately; the next valid reading returns to idle.
    update() returns True if the pump should be on.
    """

    def __init__(self, dry_below=30, wet_above=45, burst_s=10, soak_s=300, max_daily_s=120, valid_range=(0, 100)):
        self.dry_below, self.wet_above = dry_below, wet_above
        self.burst_s, self.soak_s, self.max_daily_s = burst_s, soak_s, max_daily_s
        self.valid_range = valid_range
        self.state = "idle"
        self._since = 0
        self._day = None
        self.used_today = 0


    def update(self, moisture, now):
        raise NotImplementedError


def battery_life_days(capacity_mah, active_ma, active_s, sleep_ma, period_s, usable=0.8):
    """Days a battery lasts for a device awake `active_s` seconds out of every
    `period_s`, counting only `usable` of the rated capacity."""
    raise NotImplementedError
