# Week 3 project: route planner

Build the algorithms behind a small route planner, then run `demo.py` to see
them working together on a town map, a maze and a course plan.

**Time:** 4–5 hours · **Files:** `routes.py` (yours to finish), `test_routes.py` (don't edit), `demo.py`

## Run the tests

```bash
python -m unittest -v
python -m unittest -v -k Dijkstra
python demo.py           # once everything passes
```

## Rules

Write the algorithms yourself. **Don't use** `bisect`, `sorted()` /
`list.sort()` (inside `merge_sort`), `functools.cache` / `lru_cache` (write
the table yourself in `min_coins`), or graph libraries.

You **may** use `collections.deque` for queues and `heapq` for Dijkstra's
priority queue. You built a heap last week, so feel free to swap yours in.

## Tasks

1. **`binary_search(items, target)`**: index of target in a sorted list,
   or -1. **`lower_bound(items, target)`**: the first index where
   `items[i] >= target` (or `len(items)` if there isn't one).
2. **`merge_sort(items, key=None)`**: return a new sorted list. It must be
   **stable**, and support an optional `key` function like `sorted()` does.
3. **`grid_path(grid, start, goal)`**: BFS through a maze given as a list of
   strings, where `#` is a wall. Moves are up, down, left and right. Return
   the shortest path as a list of `(row, col)` tuples from start to goal, or
   `None` if there's no path.
4. **`dijkstra(graph, source)`**: graph is `{node: {neighbor: cost}}`. Return
   `(dist, prev)`, where `dist` maps every *reachable* node to its cheapest
   cost and `prev` maps each reachable node (except the source) to the node
   before it on that cheapest path. Raise `ValueError` if any cost is
   negative. **`shortest_route(graph, source, target)`** returns
   `(cost, [source, …, target])`, or `(math.inf, None)` if unreachable.
5. **`course_order(prereqs)`**: `prereqs` maps each course to the list of
   courses it requires. Return a list of every course (including ones that
   only appear as prerequisites) where each course comes after all of its
   prerequisites. Raise `ValueError` if there's a cycle.
6. **`min_coins(coins, amount)`**: the fewest coins that add up to `amount`
   (unlimited coins of each value), or -1 if it can't be done. Use dynamic
   programming.

## Hints

- Binary search: write the invariant down first. For `lower_bound`, a
  half-open range `lo, hi = 0, len(items)` with `while lo < hi` is cleanest.
- Merge sort stability comes down to one character: `<=` versus `<` in the
  merge.
- BFS paths: store `previous[cell]` when you first queue a cell, then walk
  backwards from the goal.
- Dijkstra with `heapq`: push `(distance, node)`. When you pop a node whose
  distance is worse than the best you've recorded, skip it (it's stale).
- Topological sort: Kahn's algorithm (in-degree counts and a queue). If you
  finish with fewer courses than you started with, there's a cycle.

## Stretch goals (optional, no tests)

- Add A* to `grid_path` using Manhattan distance as the estimate, and count
  how many cells each version visits on the demo maze.
- Make `course_order` return the alphabetically smallest valid order
  (hint: a heap instead of a queue).
- Add `edit_distance(a, b)` (the minimum insertions, deletions and
  substitutions to turn a into b) with a 2D DP table.

## Design questions

Answer briefly here before you commit.

1. Why does `grid_path` use BFS rather than DFS? What would DFS return on the
   demo maze?

   _Your answer:_

2. Why must `dijkstra` reject negative costs? Give a three-node example where
   it would go wrong.

   _Your answer:_

3. What's the time complexity of your `min_coins`, in terms of the number of
   coin types and the amount?

   _Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 3 page.
