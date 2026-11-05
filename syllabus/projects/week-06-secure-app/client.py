"""A tiny browser stand-in for tests and exploits. Don't edit.

It keeps cookies between requests like a browser does, and calls
App.handle() directly, so no network or server is needed.
"""
import re
from urllib.parse import urlencode


class TestClient:
    def __init__(self, app):
        self.app = app
        self.cookies = {}

    def request(self, method, path, data=None, headers=None):
        body = urlencode(data or {})
        all_headers = dict(headers or {})
        if self.cookies:
            all_headers["Cookie"] = "; ".join(f"{k}={v}" for k, v in self.cookies.items())
        if method == "POST":
            all_headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
        response = self.app.handle(method, path, all_headers, body)
        for header in response.all_headers("Set-Cookie"):
            self._store_cookie(header)
        return response

    def _store_cookie(self, header):
        parts = [p.strip() for p in header.split(";")]
        name, _, value = parts[0].partition("=")
        attributes = {p.split("=", 1)[0].lower(): (p.split("=", 1)[1] if "=" in p else True) for p in parts[1:]}
        if value == "" or attributes.get("max-age") == "0":
            self.cookies.pop(name, None)
        else:
            self.cookies[name] = value

    def get(self, path):
        return self.request("GET", path)

    def post(self, path, data=None):
        return self.request("POST", path, data)

    def page(self):
        """The HTML of the home page, as this client currently sees it."""
        return self.get("/").body

    def login(self, username, password):
        return self.post("/login", {"username": username, "password": password})

    def csrf_token(self):
        """The CSRF token embedded in this client's home page, or None."""
        match = re.search(r'name="csrf_token" value="([^"]*)"', self.page())
        return match.group(1) if match else None

    def form_post(self, path, data):
        """Submit a form the way a real user would: including the page's CSRF token."""
        data = dict(data)
        token = self.csrf_token()
        if token:
            data["csrf_token"] = token
        return self.post(path, data)

    def logged_in_as(self):
        match = re.search(r"Logged in as ([^.<\s]+)", self.page())
        return match.group(1) if match else None
