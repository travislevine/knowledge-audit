# Week 7 project: library database

Work with a small library database in SQLite, which is built into Python (no
installation needed). You'll design a table with real constraints, write
reporting queries, add indexes and prove they're used, fix an N+1 problem,
and make borrowing safe when many people borrow at once.

**Time:** 4–5 hours · **Files:** `library.py` (yours to finish), `schema.sql` and `seed.sql` (given), `test_library.py` (don't edit)

On macOS or Linux, type `python3` where these instructions say `python`.

## Run the tests

```bash
python -m unittest -v
python -m unittest -v -k Queries       # one section at a time
```

To explore the data interactively:

```bash
python -c "import library, code; db = library.create_database(); code.interact(local=locals())"
>>> db.execute("SELECT * FROM books").fetchall()
```

## Tasks

1. **Schema** (`REVIEWS_SCHEMA`): design the `reviews` table so the database
   itself enforces the rules listed in `library.py`: foreign keys, a 1–5
   rating, one review per member per book, and a default creation date.
2. **Queries** (`QUERIES`): write six queries. The expected results for the
   sample data are in `test_library.py`. They cover joins, an outer join with
   a count, filtering with parameters, grouping with a limit, an anti-join
   ("members with no loans"), and a window function.
3. **Indexes** (`INDEXES`): add up to five `CREATE INDEX` statements so the
   queries in `TestIndexes` show `SEARCH ... USING INDEX` in their plans
   instead of `SCAN`.
4. **N+1** (`active_loan_report`): rewrite it to return exactly the same
   result with at most 2 queries. The tests count every statement you run.
5. **Borrowing** (`borrow` and `return_book`): update `books.available` and
   insert or update the loan in one transaction, enforce the 3-loan limit,
   and stay correct when ten threads borrow at the same moment.

## Hints

- SQLite only enforces foreign keys when `PRAGMA foreign_keys = ON`;
  `connect()` does that for you.
- `UNIQUE (book_id, member_id)` and `CHECK (rating BETWEEN 1 AND 5)` are
  table constraints. `DEFAULT CURRENT_DATE` gives a default.
- "Authors with 0 books" needs a `LEFT JOIN` and `COUNT(b.id)`, not `COUNT(*)`.
- "Members who never borrowed" can be a `LEFT JOIN ... WHERE l.id IS NULL`,
  or `NOT EXISTS (...)`.
- For the window function: number each author's books with
  `ROW_NUMBER() OVER (PARTITION BY author_id ORDER BY published DESC)` in a
  subquery or CTE, then keep row number 1.
- Check your plans in the interactive shell:
  `db.execute("EXPLAIN QUERY PLAN SELECT ...").fetchall()`.
- Borrowing: wrap the work in `with transaction(conn):`. Inside, count the
  member's active loans, then decrement availability with a conditional
  update, `UPDATE books SET available = available - 1 WHERE id = ? AND available > 0`,
  and check `cursor.rowcount` to see whether a copy was really taken.
  Raising inside the `with` block rolls everything back.
- Why `BEGIN IMMEDIATE`? With a plain `BEGIN`, two transactions can both read
  "1 copy available" before either writes, which is the lost-update race from
  lesson 7.4.

## Stretch goals (optional, no tests)

- Add a `reviews` query: each book's average rating and number of reviews,
  only for books with at least 2 reviews (`HAVING`).
- Load 100,000 extra loans with `executemany`, then time a query with and
  without its index.
- Rewrite `borrow` using optimistic concurrency (a version column and a
  retry loop) instead of `BEGIN IMMEDIATE`, and compare.

## Questions

Answer briefly here before you commit.

1. Which constraint in your `reviews` table would be easiest to forget to
   check in application code, and what bad data would get in without it?

   _Your answer:_

2. Paste the query plan for the overdue-loans query before and after your
   index. What changed, and why does the column order of the index matter?

   _Your answer:_

3. Describe the exact sequence of events that would let two people borrow
   the last copy of a book if `borrow` read `available` first and wrote it
   back later without a transaction.

   _Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 7 page.
