"""Tests for routes. Run with: python -m unittest -v"""
import math
import random
import unittest

from routes import (binary_search, course_order, dijkstra, grid_path, lower_bound,
                    merge_sort, min_coins, shortest_route)


class TestBinarySearch(unittest.TestCase):
    def test_found_and_missing(self):
        items = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 77, 81, 90, 95, 99, 104]
        for i, v in enumerate(items):
            self.assertEqual(binary_search(items, v), i)
        for missing in [0, 3, 50, 105]:
            self.assertEqual(binary_search(items, missing), -1)

    def test_edges(self):
        self.assertEqual(binary_search([], 5), -1)
        self.assertEqual(binary_search([5], 5), 0)
        self.assertEqual(binary_search([5], 4), -1)

    def test_random(self):
        rng = random.Random(10)
        for _ in range(200):
            items = sorted(set(rng.sample(range(1000), rng.randint(0, 50))))
            target = rng.randint(-5, 1005)
            expected = items.index(target) if target in items else -1
            self.assertEqual(binary_search(items, target), expected)

    def test_lower_bound(self):
        items = [1, 3, 3, 3, 7]
        self.assertEqual(lower_bound(items, 0), 0)
        self.assertEqual(lower_bound(items, 1), 0)
        self.assertEqual(lower_bound(items, 3), 1)
        self.assertEqual(lower_bound(items, 4), 4)
        self.assertEqual(lower_bound(items, 7), 4)
        self.assertEqual(lower_bound(items, 8), 5)
        self.assertEqual(lower_bound([], 1), 0)

    def test_lower_bound_random(self):
        rng = random.Random(11)
        for _ in range(200):
            items = sorted(rng.randint(0, 30) for _ in range(rng.randint(0, 25)))
            t = rng.randint(-2, 32)
            expected = next((i for i, v in enumerate(items) if v >= t), len(items))
            self.assertEqual(lower_bound(items, t), expected)


class TestMergeSort(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(merge_sort([]), [])
        self.assertEqual(merge_sort([1]), [1])
        self.assertEqual(merge_sort([5, 2, 9, 1, 5, 6]), [1, 2, 5, 5, 6, 9])

    def test_returns_new_list(self):
        data = [3, 1, 2]
        result = merge_sort(data)
        self.assertEqual(data, [3, 1, 2], "input must not be modified")
        self.assertIsNot(result, data)

    def test_random(self):
        rng = random.Random(12)
        for _ in range(100):
            data = [rng.randint(-50, 50) for _ in range(rng.randint(0, 60))]
            self.assertEqual(merge_sort(data), sorted(data))

    def test_key(self):
        self.assertEqual(merge_sort(["ccc", "a", "bb"], key=len), ["a", "bb", "ccc"])

    def test_stable(self):
        people = [("Ana", 30), ("Ben", 25), ("Cho", 30), ("Dev", 25), ("Eve", 30)]
        by_age = merge_sort(people, key=lambda p: p[1])
        self.assertEqual([p[0] for p in by_age], ["Ben", "Dev", "Ana", "Cho", "Eve"])


MAZE = [
    "S..#......",
    ".#.#.####.",
    ".#...#....",
    ".####.#.#.",
    "......#.#G",
]


class TestGridPath(unittest.TestCase):
    def assertValidPath(self, grid, path, start, goal):
        self.assertEqual(path[0], start)
        self.assertEqual(path[-1], goal)
        for (r1, c1), (r2, c2) in zip(path, path[1:]):
            self.assertEqual(abs(r1 - r2) + abs(c1 - c2), 1, "each step moves one cell")
        for r, c in path:
            self.assertNotEqual(grid[r][c], "#", "path goes through a wall")
        self.assertEqual(len(set(path)), len(path), "path repeats a cell")

    def test_maze(self):
        path = grid_path(MAZE, (0, 0), (4, 9))
        self.assertIsNotNone(path)
        self.assertValidPath(MAZE, path, (0, 0), (4, 9))
        self.assertEqual(len(path) - 1, 17, "BFS must find a shortest path (17 steps)")

    def test_start_is_goal(self):
        self.assertEqual(grid_path(MAZE, (0, 0), (0, 0)), [(0, 0)])

    def test_no_path(self):
        walled = ["S#.", "##.", "..G"]
        self.assertIsNone(grid_path(walled, (0, 0), (2, 2)))

    def test_open_grid(self):
        grid = ["....."] * 5
        path = grid_path(grid, (0, 0), (4, 4))
        self.assertValidPath(grid, path, (0, 0), (4, 4))
        self.assertEqual(len(path) - 1, 8)


TOWNS = {
    "Ashford": {"Bexley": 7, "Crowley": 9, "Fenwick": 14},
    "Bexley": {"Ashford": 7, "Crowley": 10, "Dunmore": 15},
    "Crowley": {"Ashford": 9, "Bexley": 10, "Dunmore": 11, "Fenwick": 2},
    "Dunmore": {"Bexley": 15, "Crowley": 11, "Elston": 6},
    "Elston": {"Dunmore": 6, "Fenwick": 9},
    "Fenwick": {"Ashford": 14, "Crowley": 2, "Elston": 9},
    "Gilford": {"Hartley": 3},
    "Hartley": {"Gilford": 3},
}


class TestDijkstra(unittest.TestCase):
    def test_distances(self):
        dist, prev = dijkstra(TOWNS, "Ashford")
        self.assertEqual(dist, {"Ashford": 0, "Bexley": 7, "Crowley": 9, "Fenwick": 11, "Dunmore": 20, "Elston": 20})
        self.assertEqual(prev["Fenwick"], "Crowley")
        self.assertEqual(prev["Elston"], "Fenwick")
        self.assertNotIn("Ashford", prev)

    def test_unreachable_not_in_dist(self):
        dist, _ = dijkstra(TOWNS, "Ashford")
        self.assertNotIn("Gilford", dist)

    def test_shortest_route(self):
        self.assertEqual(shortest_route(TOWNS, "Ashford", "Elston"), (20, ["Ashford", "Crowley", "Fenwick", "Elston"]))
        self.assertEqual(shortest_route(TOWNS, "Ashford", "Ashford"), (0, ["Ashford"]))
        cost, path = shortest_route(TOWNS, "Ashford", "Gilford")
        self.assertEqual(cost, math.inf)
        self.assertIsNone(path)

    def test_directed_and_sink_nodes(self):
        g = {"S": {"A": 2, "B": 5}, "A": {"B": 1, "T": 6}, "B": {"T": 2}}   # T only appears as a neighbor
        self.assertEqual(shortest_route(g, "S", "T"), (5, ["S", "A", "B", "T"]))
        self.assertEqual(shortest_route(g, "T", "S"), (math.inf, None))

    def test_rejects_negative(self):
        with self.assertRaises(ValueError):
            dijkstra({"A": {"B": -1}, "B": {}}, "A")

    def test_matches_brute_force(self):
        rng = random.Random(13)
        for _ in range(30):
            n = 7
            g = {i: {j: rng.randint(1, 20) for j in range(n) if j != i and rng.random() < 0.35} for i in range(n)}
            dist, _ = dijkstra(g, 0)
            best = {0: 0}                                  # Bellman-Ford as a reference
            for _ in range(n):
                for u in g:
                    if u in best:
                        for v, w in g[u].items():
                            if best[u] + w < best.get(v, math.inf):
                                best[v] = best[u] + w
            self.assertEqual(dist, best)


class TestCourseOrder(unittest.TestCase):
    def assertValidOrder(self, prereqs, order):
        courses = set(prereqs) | {p for ps in prereqs.values() for p in ps}
        self.assertEqual(sorted(order), sorted(courses), "every course exactly once")
        position = {c: i for i, c in enumerate(order)}
        for course, needs in prereqs.items():
            for p in needs:
                self.assertLess(position[p], position[course], f"{p} must come before {course}")

    def test_simple(self):
        prereqs = {"algorithms": ["programming"], "programming": []}
        self.assertEqual(course_order(prereqs), ["programming", "algorithms"])

    def test_degree_plan(self):
        prereqs = {
            "Intro to Programming": [],
            "Discrete Maths": [],
            "Data Structures": ["Intro to Programming"],
            "Algorithms": ["Data Structures", "Discrete Maths"],
            "Operating Systems": ["Data Structures", "Computer Architecture"],
            "Computer Architecture": ["Intro to Programming"],
            "Distributed Systems": ["Operating Systems", "Networks"],
            "Networks": ["Intro to Programming"],
            "Capstone": ["Algorithms", "Distributed Systems"],
        }
        self.assertValidOrder(prereqs, course_order(prereqs))

    def test_prereq_only_courses_included(self):
        order = course_order({"B": ["A"]})
        self.assertEqual(order, ["A", "B"])

    def test_cycle(self):
        with self.assertRaises(ValueError):
            course_order({"X": ["Y"], "Y": ["Z"], "Z": ["X"]})
        with self.assertRaises(ValueError):
            course_order({"A": [], "B": ["A", "C"], "C": ["B"]})


class TestMinCoins(unittest.TestCase):
    def test_examples(self):
        self.assertEqual(min_coins([1, 3, 4], 6), 2)
        self.assertEqual(min_coins([1, 5, 6, 9], 11), 2)
        self.assertEqual(min_coins([1, 5, 10, 25], 63), 6)
        self.assertEqual(min_coins([2], 3), -1)
        self.assertEqual(min_coins([7, 3], 0), 0)

    def test_beats_greedy(self):
        coins, amount = [1, 3, 4], 6
        greedy, left = 0, amount
        for c in sorted(coins, reverse=True):
            greedy += left // c
            left %= c
        self.assertEqual(greedy, 3)
        self.assertLess(min_coins(coins, amount), greedy)

    def test_larger_amount_is_fast(self):
        self.assertEqual(min_coins([1, 7, 23, 47], 5000), 112)


if __name__ == "__main__":
    unittest.main()
