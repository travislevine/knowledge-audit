# Week 9 project: distributed systems toolkit

Build five building blocks that real distributed systems rely on, each small
enough to understand completely and tested thoroughly. Every class takes an
injected `clock`, so the tests control time instead of waiting for it.

**Time:** 4–5 hours · **Files:** `distkit.py` (yours to finish), `test_distkit.py` (don't edit)

On macOS or Linux, type `python3` where these instructions say `python`.

## Run the tests

```bash
python -m unittest -v
python -m unittest -v -k TTLCache      # one class at a time
```

## Rules

Use only the standard library. `bisect`, `OrderedDict` and `threading` are
all fine (and helpful).

## Tasks

1. **`HashRing`**: consistent hashing with virtual nodes (lesson 9.4). Adding
   a sixth node to five should move only about a sixth of the keys, all of
   them to the new node.
2. **`TTLCache`**: thread-safe, with expiry, LRU eviction, and
   **single-flight** `get_or_load`, so a cache stampede (lesson 9.2) calls the
   loader once while other threads wait for its result.
3. **`TokenBucket`**: a rate limiter that allows bursts up to its capacity,
   then a steady rate (lesson 9.5).
4. **`CircuitBreaker`**: closed, open and half-open, exactly as in the lesson
   9.5 widget.
5. **`IdempotentConsumer`**: makes at-least-once delivery take effect exactly
   once (lesson 9.3). The last test throws redeliveries, duplicates and
   transient failures at it, and checks every account balance comes out exact.

## Hints

- Hash ring: keep a sorted list of points and a dict from point to node. To
  find a key's owner, `bisect.bisect_left(points, stable_hash(key))`, and
  wrap the index around with `% len(points)`.
- TTL cache: store `(value, expires_at)` in an `OrderedDict`. `move_to_end`
  marks an entry as recently used; `popitem(last=False)` evicts the oldest.
  Guard everything with one `threading.Lock`.
- Single-flight: keep a dict of in-flight loads, `key -> {"event": threading.Event(), ...}`.
  The first thread to miss becomes the leader: it runs the loader, stores the
  value (or the exception) in the slot, removes the slot, and sets the
  event. Other threads wait on the event and use the leader's result. Don't
  hold the main lock while the loader runs, or different keys can't load in
  parallel.
- Token bucket: you don't need a timer. Each time you check, add
  `(now - last_check) * refill_rate` tokens, capped at capacity.
- Circuit breaker: store the failure count and the time the circuit opened
  (or `None` when closed). `state` can be computed from those two values.
- Consumer: record the message id only *after* the handler succeeds. In a
  real system the id and the handler's changes would be written in the same
  database transaction, so one can't happen without the other.

## Stretch goals (optional, no tests)

- Give `TTLCache` "probabilistic early refresh": occasionally reload an entry
  shortly *before* it expires, so popular keys never all expire at once.
- Make `TokenBucket` thread-safe, and add a `retry_after()` method that says
  how many seconds until a request of a given cost would be allowed (useful
  for the `Retry-After` HTTP header in the capstone).
- Combine the pieces: a `ResilientClient` that wraps a function with a
  circuit breaker, your week 8 `retry`, and a cache.

## Design write-up

Pick **one** of these and answer it here in 200–400 words, using this week's
concepts and back-of-envelope numbers:

1. Design the backend for a "like" button on a site with 50 million daily
   users, where posts can go viral. How do you store and display counts?
2. Design a notification service that sends emails and push notifications
   for an app with 5 million users, without ever sending a duplicate.
3. Your product page calls a recommendations service that's sometimes slow.
   How do you keep the page fast and available?

_Your answer:_

When you're done, commit your work and update the project status and notes
on the Week 9 page.
