"""Run this once the tests pass: python3 demo.py"""
from routes import binary_search, course_order, grid_path, merge_sort, min_coins, shortest_route
from test_routes import MAZE, TOWNS


def show_maze(grid, path):
    on_path = set(path or [])
    for r, row in enumerate(grid):
        print("   " + "".join("*" if (r, c) in on_path and ch == "." else ch for c, ch in enumerate(row)))


def main():
    print("Town routes (Dijkstra)")
    for a, b in [("Ashford", "Elston"), ("Bexley", "Fenwick"), ("Ashford", "Gilford")]:
        cost, path = shortest_route(TOWNS, a, b)
        print(f"   {a} -> {b}: " + (f"{cost} km via {' -> '.join(path)}" if path else "no route"))

    print("\nMaze (BFS)")
    path = grid_path(MAZE, (0, 0), (4, 9))
    show_maze(MAZE, path)
    print(f"   shortest path: {len(path) - 1} steps")

    print("\nTowns sorted by distance from Ashford (merge sort, stable)")
    trips = [(town, shortest_route(TOWNS, "Ashford", town)[0]) for town in TOWNS if town != "Ashford"]
    reachable = merge_sort([t for t in trips if t[1] != float("inf")], key=lambda t: t[1])
    print("   " + ", ".join(f"{t} ({d})" for t, d in reachable))
    distances = [d for _, d in reachable]
    print(f"   is any town exactly 20 km away? index {binary_search(distances, 20)} in {distances}")

    print("\nCourse plan (topological sort)")
    plan = course_order({
        "Data Structures": ["Intro to Programming"],
        "Algorithms": ["Data Structures", "Discrete Maths"],
        "Operating Systems": ["Data Structures", "Computer Architecture"],
        "Computer Architecture": ["Intro to Programming"],
        "Networks": ["Intro to Programming"],
        "Distributed Systems": ["Operating Systems", "Networks"],
        "Capstone": ["Algorithms", "Distributed Systems"],
    })
    for i, course in enumerate(plan, 1):
        print(f"   {i}. {course}")

    print("\nMaking change (dynamic programming)")
    for coins, amount in [([1, 5, 10, 25], 63), ([1, 3, 4], 6), ([4, 10], 13)]:
        n = min_coins(coins, amount)
        print(f"   {amount} with {coins}: " + (f"{n} coins" if n >= 0 else "impossible"))


if __name__ == "__main__":
    main()
