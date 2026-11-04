"""Build your own data structures.

Week 2 project. See README.md for the rules for each class.
Run the tests with:  python3 -m unittest -v
"""


class DynamicArray:
    """A growable array backed by a fixed-size list that doubles when full."""

    def __init__(self):
        self._capacity = 4
        self._data = [None] * self._capacity   # treat as raw, fixed-size memory
        self._size = 0

    @property
    def capacity(self):
        return self._capacity

    def __len__(self):
        raise NotImplementedError

    def append(self, item):
        """Add item at the end, growing (doubling) first if full."""
        raise NotImplementedError

    def pop(self):
        """Remove and return the last item. IndexError if empty."""
        raise NotImplementedError

    def __getitem__(self, index):
        """Return the item at index. Negative indexes count from the end."""
        raise NotImplementedError

    def __setitem__(self, index, item):
        """Replace the item at index. Negative indexes count from the end."""
        raise NotImplementedError

    def __iter__(self):
        raise NotImplementedError


class HashMap:
    """A hash map using separate chaining, resizing above load factor 0.75."""

    MAX_LOAD = 0.75

    def __init__(self, capacity=8):
        self._buckets = [[] for _ in range(capacity)]
        self._size = 0

    @property
    def capacity(self):
        """The number of buckets."""
        return len(self._buckets)

    @property
    def load_factor(self):
        return self._size / len(self._buckets)

    def __len__(self):
        raise NotImplementedError

    def put(self, key, value):
        """Insert or update key. Resize if the load factor goes above 0.75."""
        raise NotImplementedError

    def get(self, key, default=None):
        """Return the value for key, or default if it's missing."""
        raise NotImplementedError

    def remove(self, key):
        """Remove key and return its value. KeyError if missing."""
        raise NotImplementedError

    def __contains__(self, key):
        raise NotImplementedError

    def keys(self):
        """Return a list of all keys (any order)."""
        raise NotImplementedError


class MinHeap:
    """A binary min-heap stored in a list."""

    def __init__(self):
        self._items = []

    @classmethod
    def from_iterable(cls, items):
        """Build a heap containing every item in items."""
        raise NotImplementedError

    def __len__(self):
        raise NotImplementedError

    def push(self, item):
        raise NotImplementedError

    def peek(self):
        """Return the smallest item without removing it. IndexError if empty."""
        raise NotImplementedError

    def pop(self):
        """Remove and return the smallest item. IndexError if empty."""
        raise NotImplementedError


class LRUCache:
    """A fixed-capacity cache that evicts the least recently used key.

    Use a dict from key to node, plus your own doubly linked list that keeps
    nodes in order from least to most recently used.
    """

    def __init__(self, capacity):
        if capacity < 1:
            raise ValueError("capacity must be at least 1")
        self.capacity = capacity
        # Your linked list and dict go here.

    def __len__(self):
        raise NotImplementedError

    def get(self, key):
        """Return the value for key (marking it most recently used), or None."""
        raise NotImplementedError

    def put(self, key, value):
        """Insert or update key as most recently used, evicting if over capacity."""
        raise NotImplementedError

    def keys(self):
        """Return keys from least recently used to most recently used."""
        raise NotImplementedError
