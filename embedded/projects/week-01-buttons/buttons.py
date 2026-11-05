"""Button handling for microcontrollers: debouncing and click detection.

Pure logic with no hardware access, so it runs (and is tested) on a laptop
and on MicroPython. Times are in milliseconds and passed in by the caller.
Run the tests with:  python -m unittest -v
"""


class Debouncer:
    """Turns a bouncy raw input into clean "press" and "release" events.

    `raw` is True while the button reads as pressed (invert active-low
    inputs before calling). A change is accepted only once the raw input
    has stayed at the new value for at least `stable_ms`.
    """

    def __init__(self, stable_ms=30, initial=False):
        self.stable_ms = stable_ms
        self.state = initial
        self._candidate = initial
        self._since = None

    def update(self, raw, now_ms):
        """Feed one raw sample. Return "press", "release" or None."""
        raise NotImplementedError


class ButtonEvents:
    """A state machine turning clean press/release events into gestures.

    Gestures: "click", "double_click" (second press starts within
    `double_ms` of the first release) and "long_press" (held for at least
    `long_ms`; reported once, and the release afterwards reports nothing).
    A single click can only be reported once the double-click window has
    passed, which is why tick() exists: call it every loop.
    """

    def __init__(self, long_ms=800, double_ms=300):
        self.long_ms = long_ms
        self.double_ms = double_ms
        self.state = "idle"
        self._since = 0

    def feed(self, event, now_ms):
        """Feed "press" or "release". Return a gesture or None."""
        raise NotImplementedError

    def tick(self, now_ms):
        """Call regularly. Return "click" or "long_press" when a timeout completes one."""
        raise NotImplementedError
