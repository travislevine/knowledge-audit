-- Sample data (given). Tests rely on these exact rows.
INSERT INTO authors (id, name) VALUES
  (1, 'Ursula K. Le Guin'), (2, 'Terry Pratchett'), (3, 'N. K. Jemisin'),
  (4, 'Ted Chiang'), (5, 'Octavia E. Butler'), (6, 'Liu Cixin');

INSERT INTO books (id, title, author_id, published, copies, available) VALUES
  (1, 'A Wizard of Earthsea', 1, 1968, 3, 2),
  (2, 'The Left Hand of Darkness', 1, 1969, 2, 2),
  (3, 'The Dispossessed', 1, 1974, 1, 1),
  (4, 'Guards! Guards!', 2, 1989, 2, 1),
  (5, 'Small Gods', 2, 1992, 1, 0),
  (6, 'Going Postal', 2, 2004, 2, 2),
  (7, 'The Fifth Season', 3, 2015, 2, 1),
  (8, 'The Obelisk Gate', 3, 2016, 1, 1),
  (9, 'Stories of Your Life and Others', 4, 2002, 1, 1),
  (10, 'Exhalation', 4, 2019, 1, 0),
  (11, 'Kindred', 5, 1979, 2, 2),
  (12, 'Parable of the Sower', 5, 1993, 1, 1);

INSERT INTO members (id, name) VALUES
  (1, 'Ana'), (2, 'Ben'), (3, 'Chloe'), (4, 'Dev'), (5, 'Eli'), (6, 'Fatima');

INSERT INTO loans (id, book_id, member_id, borrowed_on, due_on, returned_on) VALUES
  (1, 1, 1, '2026-09-01', '2026-09-22', '2026-09-20'),
  (2, 7, 1, '2026-10-01', '2026-10-22', NULL),
  (3, 4, 2, '2026-10-10', '2026-10-31', NULL),
  (4, 1, 2, '2026-08-01', '2026-08-22', '2026-08-21'),
  (5, 1, 3, '2026-10-20', '2026-11-10', NULL),
  (6, 10, 3, '2026-09-15', '2026-10-06', NULL),
  (7, 7, 4, '2026-07-01', '2026-07-22', '2026-07-30'),
  (8, 7, 2, '2026-08-05', '2026-08-26', '2026-08-25'),
  (9, 5, 4, '2026-10-25', '2026-11-15', NULL),
  (10, 11, 1, '2026-06-01', '2026-06-22', '2026-06-20');
