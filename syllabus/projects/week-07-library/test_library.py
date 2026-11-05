"""Tests for library. Run with: python -m unittest -v"""
import os
import sqlite3
import tempfile
import threading
import unittest

import library
from library import LimitReached, NotAvailable, borrow, create_database, return_book

TODAY = "2026-11-01"


class TestReviewsSchema(unittest.TestCase):
    def setUp(self):
        self.db = create_database()

    def insert(self, book_id=1, member_id=1, rating=4, body="Great"):
        self.db.execute("INSERT INTO reviews (book_id, member_id, rating, body) VALUES (?, ?, ?, ?)",
                        (book_id, member_id, rating, body))

    def test_valid_review(self):
        self.insert()
        self.insert(book_id=2, body=None)
        created = self.db.execute("SELECT created_at FROM reviews").fetchall()
        self.assertEqual(len(created), 2)
        self.assertTrue(all(c[0] for c in created), "created_at should default to the current date")

    def test_rating_range(self):
        for bad in (0, 6, -1):
            with self.assertRaises(sqlite3.IntegrityError, msg=f"rating {bad}"):
                self.insert(rating=bad)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO reviews (book_id, member_id) VALUES (1, 1)")

    def test_one_review_per_member_per_book(self):
        self.insert()
        with self.assertRaises(sqlite3.IntegrityError):
            self.insert(rating=2)
        self.insert(member_id=2)   # a different member is fine

    def test_foreign_keys(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.insert(book_id=999)
        with self.assertRaises(sqlite3.IntegrityError):
            self.insert(member_id=999)


class TestQueries(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = create_database()

    def run_query(self, name, **params):
        return [tuple(r) for r in self.db.execute(library.QUERIES[name], params).fetchall()]

    def test_books_by_author(self):
        self.assertEqual(self.run_query("books_by_author", author="Terry Pratchett"),
                         [("Guards! Guards!",), ("Small Gods",), ("Going Postal",)])
        self.assertEqual(self.run_query("books_by_author", author="Nobody"), [])

    def test_authors_with_book_counts(self):
        self.assertEqual(self.run_query("authors_with_book_counts"), [
            ("Terry Pratchett", 3), ("Ursula K. Le Guin", 3), ("N. K. Jemisin", 2),
            ("Octavia E. Butler", 2), ("Ted Chiang", 2), ("Liu Cixin", 0)])

    def test_overdue_loans(self):
        self.assertEqual(self.run_query("overdue_loans", today=TODAY), [
            ("Chloe", "Exhalation", "2026-10-06"),
            ("Ana", "The Fifth Season", "2026-10-22"),
            ("Ben", "Guards! Guards!", "2026-10-31")])
        self.assertEqual(self.run_query("overdue_loans", today="2026-10-01"), [])

    def test_top_borrowed(self):
        self.assertEqual(self.run_query("top_borrowed"),
                         [("A Wizard of Earthsea", 3), ("The Fifth Season", 3), ("Exhalation", 1)])

    def test_members_never_borrowed(self):
        self.assertEqual(self.run_query("members_never_borrowed"), [("Eli",), ("Fatima",)])

    def test_latest_book_per_author(self):
        self.assertIn("OVER", library.QUERIES["latest_book_per_author"].upper(), "use a window function")
        self.assertEqual(self.run_query("latest_book_per_author"), [
            ("N. K. Jemisin", "The Obelisk Gate"), ("Octavia E. Butler", "Parable of the Sower"),
            ("Ted Chiang", "Exhalation"), ("Terry Pratchett", "Going Postal"),
            ("Ursula K. Le Guin", "The Dispossessed")])


class TestIndexes(unittest.TestCase):
    QUERIES = {
        "loans for a member": ("SELECT * FROM loans WHERE member_id = ?", (1,), "loans"),
        "books by an author": ("SELECT * FROM books WHERE author_id = ?", (1,), "books"),
        "overdue loans": ("SELECT * FROM loans WHERE returned_on IS NULL AND due_on < ?", (TODAY,), "loans"),
    }

    @classmethod
    def setUpClass(cls):
        cls.db = create_database()

    def plan(self, sql, params):
        return " ".join(row[-1] for row in self.db.execute("EXPLAIN QUERY PLAN " + sql, params).fetchall())

    def test_queries_use_indexes(self):
        for label, (sql, params, table) in self.QUERIES.items():
            plan = self.plan(sql, params)
            self.assertIn("USING", plan, f"{label}: plan is {plan!r}")
            self.assertNotRegex(plan, rf"^SCAN {table}\b", f"{label} scans the whole table")

    def test_not_too_many_indexes(self):
        self.assertLessEqual(len(library.INDEXES), 5)


class TestLoanReport(unittest.TestCase):
    def test_same_result_with_few_queries(self):
        db = create_database()
        statements = []
        db.set_trace_callback(statements.append)
        report = library.active_loan_report(db)
        db.set_trace_callback(None)
        self.assertEqual(report, [
            ("Chloe", "Exhalation", "2026-10-06"), ("Ana", "The Fifth Season", "2026-10-22"),
            ("Ben", "Guards! Guards!", "2026-10-31"), ("Chloe", "A Wizard of Earthsea", "2026-11-10"),
            ("Dev", "Small Gods", "2026-11-15")])
        self.assertLessEqual(len(statements), 2, f"{len(statements)} queries: this is still N+1")


class TestBorrowing(unittest.TestCase):
    def setUp(self):
        self.db = create_database()

    def available(self, book_id, db=None):
        return (db or self.db).execute("SELECT available FROM books WHERE id = ?", (book_id,)).fetchone()[0]

    def active_loans(self, member_id, db=None):
        return (db or self.db).execute("SELECT COUNT(*) FROM loans WHERE member_id = ? AND returned_on IS NULL",
                                       (member_id,)).fetchone()[0]

    def test_borrow_and_return(self):
        loan_id = borrow(self.db, 5, 2, TODAY, "2026-11-22")
        self.assertEqual(self.available(2), 1)
        row = self.db.execute("SELECT book_id, member_id, borrowed_on, due_on, returned_on FROM loans WHERE id = ?",
                              (loan_id,)).fetchone()
        self.assertEqual(tuple(row), (2, 5, TODAY, "2026-11-22", None))
        return_book(self.db, loan_id, "2026-11-05")
        self.assertEqual(self.available(2), 2)
        with self.assertRaises(ValueError):
            return_book(self.db, loan_id, "2026-11-06")
        with self.assertRaises(ValueError):
            return_book(self.db, 9999, "2026-11-06")

    def test_not_available(self):
        with self.assertRaises(NotAvailable):
            borrow(self.db, 5, 10, TODAY, "2026-11-22")      # Exhalation: 0 available
        self.assertEqual(self.available(10), 0)
        self.assertEqual(self.active_loans(5), 0, "a failed borrow must not leave a loan behind")

    def test_limit(self):
        borrow(self.db, 3, 2, TODAY, "2026-11-22")           # Chloe already has 2
        with self.assertRaises(LimitReached):
            borrow(self.db, 3, 6, TODAY, "2026-11-22")
        self.assertEqual(self.available(6), 2, "nothing may change when the limit is hit")
        self.assertEqual(self.active_loans(3), 3)

    def test_concurrent_borrowers_one_book(self):
        path = os.path.join(tempfile.mkdtemp(), "library.db")
        create_database(path).close()
        setup = library.connect(path)
        setup.executemany("INSERT INTO members (id, name) VALUES (?, ?)", [(100 + i, f"m{i}") for i in range(10)])
        setup.close()
        results = []

        def worker(i):
            conn = library.connect(path)
            try:
                borrow(conn, 100 + i, 2, TODAY, "2026-11-22")   # 2 copies of The Left Hand of Darkness
                results.append("ok")
            except NotAvailable:
                results.append("none")
            finally:
                conn.close()

        threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(30)
        check = library.connect(path)
        self.assertEqual(results.count("ok"), 2, f"results: {results}")
        self.assertEqual(self.available(2, check), 0)
        self.assertEqual(check.execute("SELECT COUNT(*) FROM loans WHERE book_id = 2 AND returned_on IS NULL").fetchone()[0], 2)
        check.close()

    def test_concurrent_same_member(self):
        path = os.path.join(tempfile.mkdtemp(), "library.db")
        create_database(path).close()
        results = []

        def worker(book_id):
            conn = library.connect(path)
            try:
                borrow(conn, 6, book_id, TODAY, "2026-11-22")    # Fatima has no loans yet
                results.append("ok")
            except (LimitReached, NotAvailable):
                results.append("refused")
            finally:
                conn.close()

        threads = [threading.Thread(target=worker, args=(b,)) for b in (2, 3, 6, 8, 9, 11, 12)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(30)
        check = library.connect(path)
        self.assertEqual(results.count("ok"), 3, f"results: {results}")
        self.assertEqual(self.active_loans(6, check), 3)
        check.close()


if __name__ == "__main__":
    unittest.main()
