"""Route planner: search, sort and shortest paths.

Week 3 project. See README.md for the rules.
Run the tests with:  python3 -m unittest -v
"""
import heapq
import math
from collections import deque


# --- 1. Binary search -------------------------------------------------------

def binary_search(items, target):
    """Return an index of target in the sorted list items, or -1.

    >>> binary_search([2, 5, 8, 12], 8)
    2
    """
    raise NotImplementedError


def lower_bound(items, target):
    """Return the first index i where items[i] >= target, or len(items).

    >>> lower_bound([1, 3, 3, 3, 7], 3)
    1
    >>> lower_bound([1, 3, 7], 4)
    2
    """
    raise NotImplementedError


# --- 2. Merge sort ------------------------------------------------------------

def merge_sort(items, key=None):
    """Return a new list with items sorted (stable), optionally by key(item).

    >>> merge_sort([3, 1, 2])
    [1, 2, 3]
    >>> merge_sort(["bb", "a", "cc"], key=len)
    ['a', 'bb', 'cc']
    """
    raise NotImplementedError


# --- 3. BFS on a grid ----------------------------------------------------------

def grid_path(grid, start, goal):
    """Return the shortest path from start to goal as a list of (row, col).

    grid is a list of equal-length strings; '#' is a wall, anything else is
    open. Moves are up, down, left and right. Return None if there's no path,
    and [start] if start == goal.
    """
    raise NotImplementedError


# --- 4. Dijkstra ------------------------------------------------------------------

def dijkstra(graph, source):
    """Cheapest costs from source in a graph {node: {neighbor: cost}}.

    Return (dist, prev). dist maps each reachable node to its cheapest cost
    (dist[source] == 0). prev maps each reachable node other than source to
    its predecessor on a cheapest path. Nodes may appear only as neighbors.
    Raise ValueError if any cost is negative.
    """
    raise NotImplementedError


def shortest_route(graph, source, target):
    """Return (cost, path) for the cheapest route, or (math.inf, None).

    >>> g = {"A": {"B": 4, "C": 1}, "C": {"B": 2}, "B": {}}
    >>> shortest_route(g, "A", "B")
    (3, ['A', 'C', 'B'])
    """
    raise NotImplementedError


# --- 5. Topological sort ----------------------------------------------------------

def course_order(prereqs):
    """Order courses so each comes after all its prerequisites.

    prereqs maps course -> list of courses it requires. Include every course
    mentioned anywhere. Raise ValueError if the requirements form a cycle.

    >>> course_order({"algorithms": ["programming"], "programming": []})
    ['programming', 'algorithms']
    """
    raise NotImplementedError


# --- 6. Dynamic programming --------------------------------------------------------

def min_coins(coins, amount):
    """Fewest coins (unlimited supply of each value) summing to amount, or -1.

    >>> min_coins([1, 3, 4], 6)
    2
    >>> min_coins([2], 3)
    -1
    """
    raise NotImplementedError
