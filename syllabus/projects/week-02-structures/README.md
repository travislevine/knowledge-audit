# Week 2 project: build your own data structures

Implement four classic data structures in plain Python. Each one shows a
different idea from this week: amortized growth, hashing, the heap property,
and combining two structures to get O(1) operations.

**Time:** 4–5 hours · **Files:** `structures.py` (yours to finish), `test_structures.py` (don't edit)

## Run the tests

```bash
python3 -m unittest -v
python3 -m unittest -v -k HashMap     # one class at a time
```

## Rules

Build each structure from simpler parts:

- `DynamicArray` may only store items in a fixed-size Python list created
  with `[None] * capacity`. Treat it like raw memory: no `append`, `insert`,
  `pop`, `extend` or slicing on it.
- `HashMap` must use your own buckets (a list of lists is fine) and Python's
  `hash()`. No `dict` or `set` inside it.
- `MinHeap` stores items in a list and must not use the `heapq` module.
- `LRUCache` may use a `dict` to find nodes, but must keep recency order with
  your own doubly linked list. No `OrderedDict`.

## Tasks

1. **`DynamicArray`**: starts with capacity 4 and doubles when full. Supports
   `append`, `pop`, indexing (including negative indexes), assignment by
   index, `len()` and iteration. Out-of-range indexes raise `IndexError`.
2. **`HashMap`**: separate chaining, starting with 8 buckets. When an insert
   pushes the load factor (entries ÷ buckets) **above 0.75**, double the
   buckets and rehash everything. Supports `put`, `get`, `remove`, `len()`,
   `in`, and `keys()`.
3. **`MinHeap`**: a binary min-heap in a list. `push`, `pop`, `peek`, `len()`,
   and a `from_iterable` constructor. Items can be anything comparable,
   including `(priority, value)` tuples.
4. **`LRUCache`**: a fixed-size cache. `get` and `put` are both O(1), and when
   the cache is full, `put` evicts the **least recently used** key. Both
   `get` and `put` count as using a key.

## Hints

- DynamicArray: write a private `_grow()` that allocates `[None] * (2 * capacity)`
  and copies items over one by one.
- HashMap: store `[key, value]` pairs in each bucket so you can update values
  in place. Write a helper that returns the bucket for a key.
- MinHeap: write `_sift_up(i)` and `_sift_down(i)` first. Children of `i` are
  `2*i + 1` and `2*i + 2`; the parent is `(i - 1) // 2`.
- LRUCache: sentinel head and tail nodes (dummy nodes that are always there)
  remove most of the edge cases from linked-list code.

## Stretch goals (optional, no tests)

- Make `DynamicArray` shrink to half its capacity when it's only a quarter
  full. (Why a quarter and not a half? Think about alternating append and pop.)
- Make `MinHeap.from_iterable` run in O(n) by sifting down from the middle,
  instead of n pushes at O(n log n).
- Time your `HashMap` against `dict` for 100,000 inserts. How big is the gap,
  and why?

## Fill in this table

Give the Big-O you achieved for each operation (average case for the hash map,
amortized where that applies), with one line of reasoning for each.

| Structure | Operation | Big-O | Why |
| --- | --- | --- | --- |
| DynamicArray | `append` | | |
| DynamicArray | `a[i]` | | |
| HashMap | `put` / `get` | | |
| HashMap | resize | | |
| MinHeap | `push` / `pop` | | |
| MinHeap | `peek` | | |
| LRUCache | `get` / `put` | | |

When you're done, commit your work and update the project status and notes
on the Week 2 page.
