# Week 6 project: break it, then fix it

MiniBank is a small web app with a login, a wallet you can send money from,
a message board, and a public file download. It has **seven deliberate
security holes**. You'll exploit each one, then fix them all without
breaking the app.

**Time:** 4–5 hours · On macOS or Linux, type `python3` where these
instructions say `python`.

| File | What it is |
| --- | --- |
| `app.py` | The app. **You fix this one** in part 2. |
| `vulnerable/app.py` | An untouched copy of the original, for your exploits. Don't edit. |
| `exploits.py` | **Your attacks** (part 1). |
| `client.py` | A tiny browser stand-in that keeps cookies. Don't edit. |
| `test_exploits.py` | Checks your exploits work against the original. |
| `test_security.py` | Checks your fixed `app.py` blocks them (and standard attacks). |
| `test_features.py` | Checks normal use still works. Passes from the start. |
| `run_app.py` | Serves the app at http://127.0.0.1:8001 so you can poke at it in a browser. |
| `FINDINGS.md` | Your write-up. |

> Only use these techniques on systems you own or have permission to test.
> This app only listens on 127.0.0.1, so it's never reachable from outside
> your machine.

## Part 1: break it (about 2 hours)

Read `app.py` and look for the holes, try things in a browser with
`python run_app.py --original`, then write one function per hole in
`exploits.py`:

```bash
python -m unittest test_exploits -v
```

The seven areas to attack are:

1. **Login**: get in as `admin` without the password.
2. **Session cookie**: become `admin` without logging in at all.
3. **Password storage**: given the database, recover users' passwords.
4. **Message board**: post a comment that runs JavaScript in other users' browsers.
5. **Transfers, from another site**: write an attacker's page that moves a
   logged-in victim's money to bob.
6. **File downloads**: read `secret_config.txt`, which isn't meant to be public.
7. **Transfers, amounts**: as bob, take money *from* alice.

Each docstring in `exploits.py` says exactly what the test checks. Lesson 6.5
explains each attack.

## Part 2: fix it (about 2–3 hours)

Fix every hole in `app.py`. Your exploits must stop working, and so must a set
of standard attacks, while normal use keeps working:

```bash
python -m unittest test_security -v
python -m unittest test_features -v
python -m unittest -v                  # everything at once
```

`test_exploits` keeps passing throughout, because it always runs against the
untouched copy.

### Requirements for the fixes

- **SQL**: use parameterized queries (`?` placeholders) for every query that
  includes user input.
- **Passwords**: store a salted, slow hash: `hashlib.pbkdf2_hmac("sha256", ...)`
  with a random 16-byte salt from `secrets` and at least 200,000 iterations
  (or `hashlib.scrypt`). Compare with `hmac.compare_digest`. You'll need to
  change the `users` table (for example, rename the `password` column to
  `password_hash`).
- **Sessions**: random session IDs from `secrets.token_urlsafe(32)`, stored
  server-side (a dict or a table) and mapped to the username. The cookie must
  include `HttpOnly` and `SameSite=Lax`. Logout must delete the session on
  the server.
- **CSRF**: give each session its own random token, put it in the hidden
  `csrf_token` fields (they're already in the forms), and check it on every
  POST that changes something, with `hmac.compare_digest`.
- **XSS**: escape user content with `html.escape` before putting it in HTML.
- **Downloads**: make sure the resolved path is inside `files/`.
  `os.path.realpath` and `os.path.commonpath` are useful; so is simply
  rejecting any name that isn't a plain file name.
- **Amounts**: only accept positive whole numbers, and don't let users send
  money to themselves.

### Hints

- Make one fix at a time and run `test_features` after each one.
- Once passwords are hashed properly, the tests take noticeably longer
  (10–30 seconds). That slowness is the point: it's what makes stolen hashes
  expensive to crack.
- Don't trust anything in `form`, `query` or `cookies`: an attacker controls
  all of it.
- `test_security` also checks a username with a quote in it (`o'brien`) can
  log in, so escaping quotes by hand won't pass.
- In a real deployment the cookie would also be `Secure` (HTTPS only). It's
  optional here because the app runs over plain HTTP on localhost.

## Stretch goals (optional, no tests)

- Add a `Content-Security-Policy` header that blocks inline scripts, then
  check in a browser that an injected `<script>` wouldn't run even if
  escaping were missed.
- Rate-limit `/login` per username (for example, at most 5 failures per
  minute) and explain how an attacker might still get around it.
- Add a "change password" form that requires the current password and
  issues a new session ID.

## Write-up

Fill in `FINDINGS.md` with one short entry per vulnerability: where it is,
how to exploit it, its impact, how you fixed it, and how severe it is.

When you're done, commit your work and update the project status and notes
on the Week 6 page.
