"""Tests for mqttkit.py. Run with: python -m unittest -v"""
import unittest

from mqttkit import Outbox, topic_matches, valid_filter


class TestFilters(unittest.TestCase):
    def test_valid(self):
        for f in ["a/b", "+", "#", "a/+/c", "a/#", "+/+/#", "a//b", "/"]:
            self.assertTrue(valid_filter(f), f)
        for f in ["", "a/#/c", "a/b#", "a+/b", "#/a", "a/+b", None, "a\x00b"]:
            self.assertFalse(valid_filter(f), repr(f))

    def test_exact_and_plus(self):
        self.assertTrue(topic_matches("garden/bed1/moisture", "garden/bed1/moisture"))
        self.assertFalse(topic_matches("garden/bed1/moisture", "garden/bed2/moisture"))
        self.assertTrue(topic_matches("garden/+/moisture", "garden/bed2/moisture"))
        self.assertFalse(topic_matches("garden/+/moisture", "garden/bed1/soil/moisture"))
        self.assertFalse(topic_matches("garden/+", "garden"))
        self.assertTrue(topic_matches("garden/+", "garden/"), "+ matches an empty level")
        self.assertFalse(topic_matches("garden/bed1", "garden/bed1/x"))

    def test_hash(self):
        self.assertTrue(topic_matches("garden/#", "garden"))
        self.assertTrue(topic_matches("garden/#", "garden/bed1/soil/moisture"))
        self.assertFalse(topic_matches("garden/#", "gardens/x"))
        self.assertTrue(topic_matches("#", "anything/at/all"))
        self.assertTrue(topic_matches("+/+/#", "a/b"))

    def test_dollar_topics(self):
        self.assertFalse(topic_matches("#", "$SYS/broker/uptime"))
        self.assertFalse(topic_matches("+/broker/uptime", "$SYS/broker/uptime"))
        self.assertTrue(topic_matches("$SYS/#", "$SYS/broker/uptime"))

    def test_invalid_filter_raises(self):
        with self.assertRaises(ValueError):
            topic_matches("a/#/b", "a/x/b")


class TestOutbox(unittest.TestCase):
    def test_flush_in_order(self):
        box, sent = Outbox(), []
        for i in range(3):
            box.add("t", str(i))
        self.assertEqual(box.flush(lambda t, p: sent.append(p)), 3)
        self.assertEqual(sent, ["0", "1", "2"])
        self.assertEqual(len(box), 0)

    def test_capacity_drops_oldest(self):
        box = Outbox(capacity=3)
        for i in range(5):
            box.add("t", i)
        self.assertEqual([p for _, p in box.messages], [2, 3, 4])
        self.assertEqual(box.dropped, 2)

    def test_failure_keeps_rest(self):
        box, sent = Outbox(), []

        def flaky(topic, payload):
            if payload == 2:
                raise OSError("network down")
            sent.append(payload)

        for i in range(4):
            box.add("t", i)
        self.assertEqual(box.flush(flaky), 2)
        self.assertEqual([p for _, p in box.messages], [2, 3])
        self.assertEqual(box.flush(lambda t, p: False), 0, "send returning False also stops")
        self.assertEqual(box.flush(lambda t, p: sent.append(p)), 2)
        self.assertEqual(sent, [0, 1, 2, 3])


if __name__ == "__main__":
    unittest.main()
