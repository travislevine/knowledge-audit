"""MiniBank: the ORIGINAL vulnerable version. Don't edit this file.

test_exploits.py runs your exploits against this copy, so you can always
check an attack works before you fix it in ../app.py.
"""
import html
import os
import secrets
import sqlite3
from urllib.parse import parse_qs, urlsplit

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES_DIR = os.path.join(BASE_DIR, "files")


class Response:
    def __init__(self, status=200, body="", headers=None, content_type="text/html; charset=utf-8"):
        self.status = status
        self.body = body
        self.headers = [("Content-Type", content_type)] + list(headers or [])

    def header(self, name):
        """Return the first value of a header, or None."""
        for key, value in self.headers:
            if key.lower() == name.lower():
                return value
        return None

    def all_headers(self, name):
        return [value for key, value in self.headers if key.lower() == name.lower()]


def redirect(location, extra_headers=None):
    return Response(303, "", [("Location", location)] + list(extra_headers or []))


def parse_cookies(header):
    cookies = {}
    for part in (header or "").split(";"):
        if "=" in part:
            name, value = part.split("=", 1)
            cookies[name.strip()] = value.strip()
    return cookies


def parse_form(body):
    return {key: values[0] for key, values in parse_qs(body or "", keep_blank_values=True).items()}


class App:
    def __init__(self, db_path=":memory:", files_dir=FILES_DIR):
        self.db = sqlite3.connect(db_path, check_same_thread=False)
        self.files_dir = files_dir
        self._setup()

    # --- Setup -----------------------------------------------------------------

    def _setup(self):
        self.db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                balance INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY,
                author TEXT NOT NULL,
                body TEXT NOT NULL
            );
        """)
        if not self.db.execute("SELECT 1 FROM users").fetchone():
            self.create_user("alice", "wonderland42", 100)
            self.create_user("bob", "builder99", 100)
            self.create_user("admin", secrets.token_urlsafe(16), 10_000)   # nobody knows this password
            self.db.execute("INSERT INTO comments (author, body) VALUES ('admin', 'Welcome to MiniBank!')")
            self.db.commit()

    # --- Users and passwords ---------------------------------------------------------

    def create_user(self, username, password, balance=100):
        self.db.execute("INSERT INTO users (username, password, balance) VALUES (?, ?, ?)",
                        (username, password, balance))
        self.db.commit()

    def check_login(self, username, password):
        """Return the username if the credentials are right, else None."""
        query = f"SELECT username FROM users WHERE username = '{username}' AND password = '{password}'"
        try:
            row = self.db.execute(query).fetchone()
        except sqlite3.Error:
            return None
        return row[0] if row else None

    def balance(self, username):
        row = self.db.execute("SELECT balance FROM users WHERE username = ?", (username,)).fetchone()
        return row[0] if row else None

    # --- Sessions ------------------------------------------------------------------------

    def start_session(self, username):
        """Create a session for a logged-in user. Return (cookie_value, Set-Cookie header value)."""
        return username, f"session={username}; Path=/"

    def current_user(self, cookies):
        """Return the logged-in username for this request, or None."""
        name = cookies.get("session")
        if name and self.balance(name) is not None:
            return name
        return None

    def end_session(self, cookies):
        """Log out. Return a Set-Cookie header value that clears the cookie."""
        return "session=; Path=/; Max-Age=0"

    def csrf_token(self, cookies):
        """The token to embed in this user's forms."""
        return ""

    def check_csrf(self, cookies, form):
        """True if a state-changing request carries a valid token."""
        return True

    # --- Request handling ---------------------------------------------------------------

    def handle(self, method, path, headers=None, body=""):
        headers = {k.lower(): v for k, v in (headers or {}).items()}
        url = urlsplit(path)
        query = parse_form(url.query)
        form = parse_form(body) if method == "POST" else {}
        cookies = parse_cookies(headers.get("cookie"))
        user = self.current_user(cookies)

        routes = {
            ("GET", "/"): lambda: self.home(user, cookies),
            ("POST", "/login"): lambda: self.login(form),
            ("POST", "/logout"): lambda: self.logout(cookies),
            ("POST", "/comment"): lambda: self.comment(user, cookies, form),
            ("POST", "/transfer"): lambda: self.transfer(user, cookies, form),
            ("GET", "/download"): lambda: self.download(query),
        }
        handler = routes.get((method, url.path))
        if handler is None:
            return Response(404, page("Not found", "<p>No such page.</p>"))
        return handler()

    def home(self, user, cookies):
        comments = self.db.execute("SELECT author, body FROM comments ORDER BY id").fetchall()
        items = "".join(f"<li><b>{author}</b>: {body}</li>" for author, body in comments)
        files = sorted(os.listdir(self.files_dir))
        file_links = "".join(f'<li><a href="/download?file={name}">{name}</a></li>' for name in files)

        if not user:
            account = """
            <h2>Log in</h2>
            <form method="post" action="/login">
              <label>Username <input name="username"></label>
              <label>Password <input name="password" type="password"></label>
              <button>Log in</button>
            </form>"""
            post_form = ""
        else:
            token = self.csrf_token(cookies)
            account = f"""
            <p>Logged in as {user}. Balance: {self.balance(user)}</p>
            <form method="post" action="/logout"><button>Log out</button></form>
            <h2>Send money</h2>
            <form method="post" action="/transfer">
              <input type="hidden" name="csrf_token" value="{token}">
              <label>To <input name="to"></label>
              <label>Amount <input name="amount"></label>
              <button>Send</button>
            </form>"""
            post_form = f"""
            <form method="post" action="/comment">
              <input type="hidden" name="csrf_token" value="{token}">
              <label>Comment <input name="body" size="50"></label>
              <button>Post</button>
            </form>"""

        return Response(200, page("MiniBank", f"""
            {account}
            <h2>Message board</h2>
            <ul>{items}</ul>
            {post_form}
            <h2>Public files</h2>
            <ul>{file_links}</ul>"""))

    def login(self, form):
        username = self.check_login(form.get("username", ""), form.get("password", ""))
        if not username:
            return Response(401, page("Login failed", '<p>Incorrect username or password. <a href="/">Try again</a></p>'))
        _, cookie_header = self.start_session(username)
        return redirect("/", [("Set-Cookie", cookie_header)])

    def logout(self, cookies):
        return redirect("/", [("Set-Cookie", self.end_session(cookies))])

    def comment(self, user, cookies, form):
        if not user:
            return Response(401, page("Not logged in", "<p>Log in first.</p>"))
        if not self.check_csrf(cookies, form):
            return Response(403, page("Forbidden", "<p>Invalid or missing CSRF token.</p>"))
        body = form.get("body", "").strip()
        if not body or len(body) > 500:
            return Response(400, page("Bad request", "<p>Comments must be 1 to 500 characters.</p>"))
        self.db.execute("INSERT INTO comments (author, body) VALUES (?, ?)", (user, body))
        self.db.commit()
        return redirect("/")

    def transfer(self, user, cookies, form):
        if not user:
            return Response(401, page("Not logged in", "<p>Log in first.</p>"))
        if not self.check_csrf(cookies, form):
            return Response(403, page("Forbidden", "<p>Invalid or missing CSRF token.</p>"))
        target = form.get("to", "")
        if self.balance(target) is None:
            return Response(400, page("Bad request", "<p>No such recipient.</p>"))
        try:
            amount = int(form.get("amount", ""))
        except ValueError:
            return Response(400, page("Bad request", "<p>Amount must be a whole number.</p>"))
        if self.balance(user) < amount:
            return Response(400, page("Bad request", "<p>Insufficient funds.</p>"))
        self.db.execute("UPDATE users SET balance = balance - ? WHERE username = ?", (amount, user))
        self.db.execute("UPDATE users SET balance = balance + ? WHERE username = ?", (amount, target))
        self.db.commit()
        return redirect("/")

    def download(self, query):
        name = query.get("file", "")
        path = os.path.join(self.files_dir, name)
        if not name or not os.path.isfile(path):
            return Response(404, page("Not found", "<p>No such file.</p>"))
        with open(path, encoding="utf-8") as f:
            return Response(200, f.read(), content_type="text/plain; charset=utf-8")


def page(title, content):
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{html.escape(title)}</title>
<style>body{{font-family:system-ui,sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem}}
label{{display:block;margin:.4rem 0}}form{{margin:.6rem 0}}</style></head>
<body><h1>{html.escape(title)}</h1>{content}</body></html>"""
