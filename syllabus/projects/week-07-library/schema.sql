-- Library schema (given). You'll add a reviews table in library.py.
CREATE TABLE authors (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE
);

CREATE TABLE books (
    id         INTEGER PRIMARY KEY,
    title      TEXT NOT NULL,
    author_id  INTEGER NOT NULL REFERENCES authors(id),
    published  INTEGER NOT NULL,
    copies     INTEGER NOT NULL CHECK (copies >= 0),
    available  INTEGER NOT NULL CHECK (available >= 0 AND available <= copies)
);

CREATE TABLE members (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL
);

CREATE TABLE loans (
    id           INTEGER PRIMARY KEY,
    book_id      INTEGER NOT NULL REFERENCES books(id),
    member_id    INTEGER NOT NULL REFERENCES members(id),
    borrowed_on  TEXT NOT NULL,           -- ISO dates: 'YYYY-MM-DD'
    due_on       TEXT NOT NULL,
    returned_on  TEXT                     -- NULL while the book is still out
);
