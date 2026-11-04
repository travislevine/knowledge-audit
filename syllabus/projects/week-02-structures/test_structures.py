"""Tests for structures. Run with: python3 -m unittest -v"""
import random
import unittest

from structures import DynamicArray, HashMap, LRUCache, MinHeap


class TestDynamicArray(unittest.TestCase):
    def test_starts_empty(self):
        a = DynamicArray()
        self.assertEqual(len(a), 0)
        self.assertEqual(a.capacity, 4)

    def test_append_and_index(self):
        a = DynamicArray()
        for i in range(10):
            a.append(i * i)
        self.assertEqual(len(a), 10)
        self.assertEqual(a[0], 0)
        self.assertEqual(a[3], 9)
        self.assertEqual(a[9], 81)
        self.assertEqual(a[-1], 81)
        self.assertEqual(a[-10], 0)

    def test_capacity_doubles(self):
        a = DynamicArray()
        seen = []
        for i in range(17):
            a.append(i)
            seen.append(a.capacity)
        self.assertEqual(seen, [4] * 4 + [8] * 4 + [16] * 8 + [32])

    def test_set_item(self):
        a = DynamicArray()
        for ch in "abc":
            a.append(ch)
        a[1] = "B"
        a[-1] = "C"
        self.assertEqual(list(a), ["a", "B", "C"])

    def test_pop(self):
        a = DynamicArray()
        for i in range(6):
            a.append(i)
        self.assertEqual(a.pop(), 5)
        self.assertEqual(a.pop(), 4)
        self.assertEqual(len(a), 4)
        self.assertEqual(list(a), [0, 1, 2, 3])

    def test_errors(self):
        a = DynamicArray()
        with self.assertRaises(IndexError):
            a.pop()
        a.append(1)
        for bad in (1, 5, -2):
            with self.assertRaises(IndexError, msg=str(bad)):
                a[bad]
            with self.assertRaises(IndexError, msg=str(bad)):
                a[bad] = 0

    def test_many_items(self):
        a = DynamicArray()
        for i in range(5000):
            a.append(i)
        self.assertEqual(sum(a), sum(range(5000)))
        self.assertEqual(a.capacity, 8192)


class Collider:
    """A key whose hash is always the same, to force collisions."""

    def __init__(self, name):
        self.name = name

    def __eq__(self, other):
        return isinstance(other, Collider) and other.name == self.name

    def __hash__(self):
        return 42


class TestHashMap(unittest.TestCase):
    def test_put_get(self):
        m = HashMap()
        m.put("apple", 1)
        m.put("banana", 2)
        self.assertEqual(m.get("apple"), 1)
        self.assertEqual(m.get("banana"), 2)
        self.assertIsNone(m.get("cherry"))
        self.assertEqual(m.get("cherry", 0), 0)
        self.assertEqual(len(m), 2)

    def test_update_does_not_grow(self):
        m = HashMap()
        m.put("k", 1)
        m.put("k", 2)
        self.assertEqual(m.get("k"), 2)
        self.assertEqual(len(m), 1)

    def test_contains_and_keys(self):
        m = HashMap()
        for word in ["red", "green", "blue"]:
            m.put(word, len(word))
        self.assertIn("green", m)
        self.assertNotIn("purple", m)
        self.assertEqual(sorted(m.keys()), ["blue", "green", "red"])

    def test_remove(self):
        m = HashMap()
        m.put("a", 1)
        m.put("b", 2)
        self.assertEqual(m.remove("a"), 1)
        self.assertNotIn("a", m)
        self.assertEqual(len(m), 1)
        with self.assertRaises(KeyError):
            m.remove("a")

    def test_resizes_above_threshold(self):
        m = HashMap()
        for i in range(6):
            m.put(i, i)
        self.assertEqual(m.capacity, 8, "6/8 = 0.75 is not above the threshold")
        m.put(6, 6)
        self.assertEqual(m.capacity, 16, "7/8 > 0.75 should trigger a resize")
        for i in range(7):
            self.assertEqual(m.get(i), i, "every key must survive the rehash")
        self.assertLessEqual(m.load_factor, 0.75)

    def test_collisions(self):
        m = HashMap()
        keys = [Collider(name) for name in "abcdef"]
        for i, k in enumerate(keys):
            m.put(k, i)
        for i, k in enumerate(keys):
            self.assertEqual(m.get(Collider(k.name)), i)
        self.assertEqual(m.remove(Collider("c")), 2)
        self.assertNotIn(Collider("c"), m)
        self.assertEqual(len(m), 5)

    def test_matches_dict(self):
        rng = random.Random(7)
        m, ref = HashMap(), {}
        for _ in range(3000):
            k = rng.randint(0, 500)
            if rng.random() < 0.25 and k in ref:
                self.assertEqual(m.remove(k), ref.pop(k))
            else:
                v = rng.random()
                m.put(k, v)
                ref[k] = v
        self.assertEqual(len(m), len(ref))
        self.assertEqual(sorted(m.keys()), sorted(ref))
        for k, v in ref.items():
            self.assertEqual(m.get(k), v)
        self.assertLessEqual(m.load_factor, 0.75)


class TestMinHeap(unittest.TestCase):
    def test_push_pop_sorted(self):
        rng = random.Random(8)
        values = [rng.randint(-1000, 1000) for _ in range(500)]
        h = MinHeap()
        for v in values:
            h.push(v)
        self.assertEqual(len(h), 500)
        out = [h.pop() for _ in range(500)]
        self.assertEqual(out, sorted(values))
        self.assertEqual(len(h), 0)

    def test_peek(self):
        h = MinHeap()
        for v in [5, 3, 8, 1]:
            h.push(v)
        self.assertEqual(h.peek(), 1)
        self.assertEqual(len(h), 4, "peek must not remove")

    def test_empty_errors(self):
        h = MinHeap()
        with self.assertRaises(IndexError):
            h.pop()
        with self.assertRaises(IndexError):
            h.peek()

    def test_priority_tuples(self):
        h = MinHeap()
        h.push((3, "low"))
        h.push((1, "urgent"))
        h.push((2, "normal"))
        self.assertEqual([h.pop()[1] for _ in range(3)], ["urgent", "normal", "low"])

    def test_from_iterable(self):
        h = MinHeap.from_iterable([9, 4, 7, 1, 8, 2])
        self.assertEqual([h.pop() for _ in range(6)], [1, 2, 4, 7, 8, 9])

    def test_interleaved(self):
        h = MinHeap()
        h.push(5); h.push(2)
        self.assertEqual(h.pop(), 2)
        h.push(1); h.push(9)
        self.assertEqual(h.pop(), 1)
        self.assertEqual(h.pop(), 5)
        self.assertEqual(h.pop(), 9)


class TestLRUCache(unittest.TestCase):
    def test_get_put(self):
        c = LRUCache(2)
        c.put("a", 1)
        c.put("b", 2)
        self.assertEqual(c.get("a"), 1)
        self.assertIsNone(c.get("z"))
        self.assertEqual(len(c), 2)

    def test_evicts_least_recently_used(self):
        c = LRUCache(2)
        c.put("a", 1)
        c.put("b", 2)
        c.put("c", 3)                 # evicts a
        self.assertIsNone(c.get("a"))
        self.assertEqual(c.keys(), ["b", "c"])

    def test_get_counts_as_use(self):
        c = LRUCache(2)
        c.put("a", 1)
        c.put("b", 2)
        c.get("a")                    # a is now most recent
        c.put("c", 3)                 # so b is evicted
        self.assertIsNone(c.get("b"))
        self.assertEqual(c.get("a"), 1)
        self.assertEqual(c.keys(), ["c", "a"])

    def test_update_counts_as_use(self):
        c = LRUCache(3)
        c.put("a", 1); c.put("b", 2); c.put("c", 3)
        c.put("a", 10)                # update moves a to most recent
        c.put("d", 4)                 # evicts b
        self.assertEqual(c.keys(), ["c", "a", "d"])
        self.assertEqual(c.get("a"), 10)
        self.assertEqual(len(c), 3)

    def test_capacity_one(self):
        c = LRUCache(1)
        c.put("x", 1)
        c.put("y", 2)
        self.assertIsNone(c.get("x"))
        self.assertEqual(c.get("y"), 2)

    def test_invalid_capacity(self):
        with self.assertRaises(ValueError):
            LRUCache(0)

    def test_matches_reference(self):
        from collections import OrderedDict
        rng = random.Random(9)
        c, ref = LRUCache(5), OrderedDict()
        for _ in range(2000):
            k = rng.randint(0, 12)
            if rng.random() < 0.5:
                expected = ref.get(k)
                if k in ref:
                    ref.move_to_end(k)
                self.assertEqual(c.get(k), expected)
            else:
                v = rng.random()
                ref[k] = v
                ref.move_to_end(k)
                if len(ref) > 5:
                    ref.popitem(last=False)
                c.put(k, v)
            self.assertEqual(c.keys(), list(ref))


if __name__ == "__main__":
    unittest.main()
