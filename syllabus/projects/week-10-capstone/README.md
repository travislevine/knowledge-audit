# Week 10 capstone: a production-style URL shortener

Build the URL shortener from lesson 9.6 as a small but real service. It pulls
together the whole syllabus: base62 encoding (number systems, week 1), a cache
and a dictionary of rate limiters (data structures, week 2), SQLite with
constraints, indexes and transactions (week 7), an HTTP API with validation
that blocks dangerous URLs (weeks 5 and 6), structured logs and metrics
(week 8), and caching, rate limiting and buffered writes (week 9). Then you
write a design document and an architecture decision record, as you would at
work.

**Time:** 4–5 hours · **Files:** `shortener.py` (yours to finish), `test_shortener.py` (don't edit), `server.py` (given), `DESIGN.md` and `docs/adr/` (yours to write)

On macOS or Linux, type `python3` where these instructions say `python`.

## Run it

```bash
python -m unittest -v
python -m unittest -v -k TestCore      # one class at a time
python server.py                       # then open http://127.0.0.1:8002
```

The home page has a small form for creating links. You can also use `curl`
(built into Windows 10 and later, macOS and Linux):

```bash
curl -i -X POST http://127.0.0.1:8002/api/links -H "Content-Type: application/json" -d "{\"url\": \"https://example.com/a/long/path\"}"
curl -i http://127.0.0.1:8002/2Bj
curl http://127.0.0.1:8002/api/links/2Bj
curl http://127.0.0.1:8002/metrics
```

Links live in memory unless you run `python server.py --db links.db`.

## Rules

Use only the standard library. Everything in the "Given helpers" section of
`shortener.py` is yours to use, including a `TokenBucket` like the one you
built in week 9.

## The API

| Request | Success | Errors |
|---|---|---|
| `GET /` | 200, the HTML home page | |
| `POST /api/links` with a JSON object `{"url": ..., "alias": ...}` (alias optional) | 201 `{"code", "short_url", "url"}` for a new link, or 200 with the same body if this URL already has a generated code | 400 `{"error": ...}` for invalid JSON, a non-object, or a bad URL or alias; 409 if the alias is taken; 429 with a `Retry-After` header when rate limited |
| `GET /{code}` | 302 with `Location: <url>` | 404 |
| `GET /api/links/{code}` | 200 `{"code", "url", "clicks", "created_at"}` | 404 |
| `GET /healthz` | 200 `{"status": "ok"}` | |
| `GET /metrics` | 200, `text/plain`, one `name value` line per counter in `self.metrics` | |

Anything else gets a 404 with a JSON error. Ignore any query string when
routing (`/healthz?x=1` is `/healthz`).

**Rate limiting.** Only `POST /api/links` is limited, with one token bucket
per client, keyed by the `X-Client-IP` request header (`server.py` sets it
from the real connection, overwriting anything the client sent).
Each bucket holds `rate_capacity` tokens and refills at `rate_per_sec`. Check
the limit before parsing the body. Count refusals in `rate_limited_total`.

**Metrics.** Update the counters in `self.metrics`: `requests_total` (every
request, counted before it's handled, so `/metrics` includes itself),
`links_created_total` (each new link), `redirects_total` (each 302),
`not_found_total` (each 404), `cache_hits_total` and `cache_misses_total`
(in `resolve`), and `rate_limited_total`.

**Logs.** If `log_stream` is set, write one JSON object per line for every
request, with `ts` (from the clock), `method`, `path`, `status` and
`duration_ms` (use `time.perf_counter()`). Don't log request bodies.

## Tasks

Work in this order; each step has its own tests.

1. **Base62** (`TestBase62`): `encode_base62` and `decode_base62` with the
   given `ALPHABET`. `encode_base62(10_000)` is `"2Bi"`.
2. **Schema** (`test_url_lookup_uses_index`, `test_constraints`): write
   `SCHEMA` so the database enforces the rules, and the URL lookup uses an
   index.
3. **Validation** (`test_url_validation`, `test_aliases`): `validate_url` and
   the alias rules. This is a security boundary: think about what a
   `javascript:` link would do on someone else's page, and why the service
   mustn't shorten links to itself (a redirect loop).
4. **Creating links** (`test_create_and_resolve`, `test_same_url_returns_same_code`,
   `test_generated_code_skips_taken_alias`): `create_link`. The first
   generated code is `encode_base62(1 + CODE_OFFSET)`, which is `"2Bj"`.
5. **Resolving, the cache and clicks** (`test_cache_*`, `test_clicks*`):
   `resolve`, `flush_clicks` and `stats`.
6. **HTTP** (`TestHttp`): `handle`. Then run `server.py` and try it in a
   browser and with `curl`.
7. **Design document**: fill in `DESIGN.md`, including the estimates.
8. **ADR**: copy `docs/adr/0000-template.md` to `docs/adr/0001-<something>.md`
   and record one real decision you made, such as how codes are generated,
   302 versus 301 redirects, or buffering clicks.

## Hints

- Base62: repeatedly `divmod(n, 62)`, collect the remainders, and reverse.
  Zero is a special case. To decode, `n = n * 62 + ALPHABET.index(ch)`, but
  turn a missing character into a `ValueError`.
- Creating a generated code: you only know the id after inserting. Insert with
  `code` left NULL, read `cursor.lastrowid`, then `UPDATE` the code. If the
  update raises `sqlite3.IntegrityError`, an alias already has that code: try
  the next number. Wrap the insert and update in `BEGIN IMMEDIATE` …
  `COMMIT` (with `ROLLBACK` on error), as in week 7, so no half-created row
  is left behind. The connection uses `isolation_level=None`, so you control
  transactions yourself.
- A link with a custom alias doesn't count as the URL's generated link, which
  is what the `is_alias` column is for.
- URL checks: `urllib.parse.urlsplit(url)` gives you `.scheme` and
  `.hostname`. Reading `.port` raises `ValueError` for a bad port. Check for
  whitespace and control characters (`ch.isspace()` or `ord(ch) < 32`)
  yourself. Compare the host with `urlsplit(self.base_url).hostname`.
- Alias checks: `ALIAS_PATTERN.fullmatch(alias)`, not `match`, so an alias
  like `"abc\n"` is rejected.
- The cache is an `OrderedDict` of `code -> url`, as in week 9: on a hit,
  `move_to_end`; on a miss, query the database, store the result, and
  `popitem(last=False)` once it's over `cache_size`. Only fill it on reads
  (cache-aside), and don't cache codes that don't exist.
- Clicks: keep a dict of `code -> pending clicks` and a running total. When
  the total reaches 100, flush. `executemany("UPDATE links SET clicks = clicks + ? WHERE code = ?", ...)`
  inside one transaction writes them all at once.
- `handle`: normalize the headers with `{k.lower(): v for k, v in headers.items()}`,
  then route on `(method, path)`. Catch unexpected exceptions and return a 500,
  so one bad request can't crash the server. Measure and log in one place, at
  the end of `handle`.
- `json.loads` raises `ValueError` (`json.JSONDecodeError` is a subclass) on
  bad input. `json.loads("[1, 2]")` succeeds but isn't an object.

## Questions to answer in DESIGN.md or your notes

1. Codes from sequential ids are guessable: anyone can walk `2Bj`, `2Bk`, …
   and find every link. When does that matter, and how would you avoid it?
2. Why does the service return 302 rather than 301? What would 301 do to the
   click counts, and to your server's load?
3. If the process crashes, how many clicks can you lose? Is that acceptable,
   and what would you change if it weren't?
4. The rate limiter's dictionary grows by one bucket per client, forever. How
   would you bound it? And what changes when you run three servers behind a
   load balancer?
5. The cache can serve a stale URL if links could be edited or deleted. How
   would you handle that?

## Stretch goals (optional, no tests)

- Add link expiry: an optional `expires_in` seconds field, with a 410 Gone
  after it passes.
- Make `Shortener` thread-safe with its own lock (or a lock per area), so
  `server.py` doesn't need one around every request.
- Replace sequential codes with random 7-character codes, and handle
  collisions. Use `secrets`, not `random`.
- Add a latency histogram to `/metrics` using your week 8 `LatencyTracker`,
  and report p50, p95 and p99.
- Put a blocklist check in `validate_url` for known bad domains, and write a
  test for it.

When you're done, commit your work and update the project status and notes
on the Week 10 page.
