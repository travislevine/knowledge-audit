"""Library database: schema, queries, indexes and transactions.

Week 7 project. See README.md for the tasks.
Run the tests with:  python -m unittest -v
"""
import contextlib
import os
import sqlite3

HERE = os.path.dirname(os.path.abspath(__file__))


# --- Helpers (given; don't change) ----------------------------------------------

def connect(path=":memory:"):
    """Open a connection in autocommit mode, with foreign keys enforced.

    isolation_level=None means Python won't start transactions for you: use
    transaction() below whenever several statements must succeed together.
    """
    conn = sqlite3.connect(path, timeout=10, isolation_level=None, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextlib.contextmanager
def transaction(conn):
    """BEGIN IMMEDIATE ... COMMIT, or ROLLBACK if anything inside raises.

    IMMEDIATE takes the database's write lock at the start, so two
    transactions can't both read the same row and then both write it.
    """
    conn.execute("BEGIN IMMEDIATE")
    try:
        yield conn
    except BaseException:
        conn.execute("ROLLBACK")
        raise
    else:
        conn.execute("COMMIT")


def create_database(path=":memory:"):
    """Create the schema, your reviews table and indexes, and load the sample data."""
    conn = connect(path)
    with open(os.path.join(HERE, "schema.sql"), encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.executescript(REVIEWS_SCHEMA)
    for statement in INDEXES:
        conn.execute(statement)
    with open(os.path.join(HERE, "seed.sql"), encoding="utf-8") as f:
        conn.executescript(f.read())
    return conn


# --- 1. Schema design ------------------------------------------------------------------
#
# Members can review books. Design the table so the DATABASE enforces:
#   - every review belongs to an existing book and an existing member
#   - rating is a whole number from 1 to 5, and is required
#   - a member can review a given book at most once
#   - body (the text) is optional
#   - created_at is required and defaults to the current date (CURRENT_DATE)

REVIEWS_SCHEMA = """
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY
    -- add the other columns and constraints here
);
"""


# --- 2. Queries ------------------------------------------------------------------------
#
# Each value is one SQL statement. Use named parameters like :author or
# :today where the docstring in test_library.py says a parameter is passed.

QUERIES = {
    # Titles by the author called :author, oldest first.
    # Rows: (title,)
    "books_by_author": "SELECT 1",

    # Every author with how many books they have, including authors with
    # none. Most books first, then by name.
    # Rows: (name, book_count)
    "authors_with_book_counts": "SELECT 1",

    # Loans not yet returned whose due_on is before :today, earliest due first.
    # Rows: (member_name, title, due_on)
    "overdue_loans": "SELECT 1",

    # The 3 most-borrowed books of all time (count every loan, returned or not).
    # Ties broken by title. Rows: (title, loan_count)
    "top_borrowed": "SELECT 1",

    # Members who have never borrowed anything, by name. Rows: (name,)
    "members_never_borrowed": "SELECT 1",

    # Each author's most recently published book, using a window function
    # (ROW_NUMBER() OVER ...). Authors with no books are left out. By author
    # name. Rows: (author_name, title)
    "latest_book_per_author": "SELECT 1",
}


# --- 3. Indexes ------------------------------------------------------------------------
#
# Add CREATE INDEX statements so the queries in test_library.TestIndexes use
# an index instead of scanning. At most 5 indexes: only add what's needed.

INDEXES = [
]


# --- 4. Fix the N+1 query problem ---------------------------------------------------

def active_loan_report(conn):
    """Return [(member_name, title, due_on)] for every loan not yet returned,
    ordered by due_on then member_name.

    This version works, but runs 1 + 2 queries per loan. Rewrite it to use
    at most 2 queries in total (the tests count them).
    """
    report = []
    loans = conn.execute("SELECT member_id, book_id, due_on FROM loans WHERE returned_on IS NULL").fetchall()
    for member_id, book_id, due_on in loans:
        member = conn.execute("SELECT name FROM members WHERE id = ?", (member_id,)).fetchone()[0]
        title = conn.execute("SELECT title FROM books WHERE id = ?", (book_id,)).fetchone()[0]
        report.append((member, title, due_on))
    return sorted(report, key=lambda r: (r[2], r[0]))


# --- 5. Borrowing safely ---------------------------------------------------------------

class NotAvailable(Exception):
    """No copies of the book are available."""


class LimitReached(Exception):
    """The member already has MAX_ACTIVE_LOANS books out."""


MAX_ACTIVE_LOANS = 3


def borrow(conn, member_id, book_id, today, due_on):
    """Lend a book: decrease books.available and insert a loan, atomically.

    Raise LimitReached if the member already has MAX_ACTIVE_LOANS unreturned
    loans, and NotAvailable if no copies are available. Nothing may change
    if either error is raised. Must stay correct when many threads (each with
    its own connection) borrow at the same time. Return the new loan's id.
    """
    raise NotImplementedError


def return_book(conn, loan_id, today):
    """Mark a loan returned and make the copy available again, atomically.

    Raise ValueError if the loan doesn't exist or was already returned.
    """
    raise NotImplementedError
