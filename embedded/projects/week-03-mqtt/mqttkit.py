"""MQTT toolkit: topic filters with wildcards, and a store-and-forward outbox.

Pure Python that runs on a laptop and on MicroPython.
Run the tests with:  python -m unittest -v
"""


def valid_filter(f):
    """True if f is a valid MQTT subscription filter.

    Rules: non-empty; "+" and "#" must each occupy a whole level; "#" may only
    be the last level; no level other than "+" or "#" may contain them.
    Levels may be empty ("a//b" is valid).
    """
    raise NotImplementedError


def topic_matches(f, topic):
    """True if the topic matches the filter f.

    "+" matches exactly one level (which may be empty). "#" matches the
    parent level and any number of levels below it ("a/#" matches "a",
    "a/b" and "a/b/c"). Wildcards at the first level don't match topics
    starting with "$" (like "$SYS/broker/uptime"). Raise ValueError for
    an invalid filter.
    """
    raise NotImplementedError


class Outbox:
    """Holds messages while offline and sends them, oldest first, when possible.

    Holds at most `capacity` messages; adding to a full outbox drops the
    oldest message and counts it in `dropped`.
    """

    def __init__(self, capacity=100):
        self.capacity = capacity
        self.messages = []
        self.dropped = 0

    def add(self, topic, payload):
        raise NotImplementedError


    def flush(self, send):
        """Call send(topic, payload) for each message in order. If send raises
        OSError or returns False, stop and keep that message and the rest.
        Return the number sent."""
        raise NotImplementedError
