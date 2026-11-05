# Design: URL shortener

_One page is plenty. Replace every italic prompt with your own words, and
delete the prompts when you're done._

**Author:** _you_ · **Status:** _draft / reviewed_ · **Date:** _yyyy-mm-dd_

## 1. Problem and goals

_Who uses this, and what do they need? One short paragraph._

**Goals**

- _e.g. Create a short link in under 200 ms; redirect in under 20 ms at p99._

**Non-goals**

- _What you're deliberately not doing (user accounts? editing links? analytics dashboards?)._

## 2. Requirements

| Functional | Non-functional |
|---|---|
| _Create a link, optionally with a custom alias_ | _Availability target (SLO) for redirects_ |
| _Redirect a code to its URL_ | _Latency target_ |
| _Show click stats_ | _Durability: links must never be lost_ |

## 3. Estimates (back of the envelope)

Assume _N_ new links a day and a read:write ratio of _R_:1. Show the arithmetic.

- Writes per second (average and peak): _…_
- Redirects per second (average and peak): _…_
- Storage for five years (rows × bytes per row): _…_
- How many base62 characters do codes need for that many links? _…_
- How much memory would caching the hottest 20% of links take? _…_

## 4. API

| Method and path | Request | Responses |
|---|---|---|
| `POST /api/links` | `{"url": "...", "alias": "..."}` | _201, 200, 400, 409, 429_ |
| `GET /{code}` | | _…_ |
| `GET /api/links/{code}` | | _…_ |
| `GET /healthz`, `GET /metrics` | | _…_ |

## 5. Data model

_The `links` table, its constraints and indexes, and why each one exists._

## 6. How it works

_A request's path for a create and for a redirect: validation, rate limiting,
cache, database, click counting. A small diagram is welcome._

## 7. Trade-offs and alternatives

_At least three decisions, each with the alternative you rejected and why. For
example: sequential ids vs random codes (guessability vs collisions), 302 vs
301 (counting clicks vs fewer requests), buffered vs immediate click writes
(speed vs losing a few clicks in a crash), SQLite vs a server database._

## 8. Scaling to 100× traffic

_What breaks first, and what would you change? Think about weeks 7 and 9:
read replicas, a shared cache, sharding by code, a queue for click events,
rate limits shared across servers._

## 9. Security, privacy and operations

_Abuse (phishing, malware links, spam), what you log and how long you keep it,
which metrics you'd alert on, and how you'd roll out a change safely._
