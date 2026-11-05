"""Part 2: does your FIXED app.py block the attacks?

Each test runs your own exploit from exploits.py plus some standard attacks.
Run with: python -m unittest test_security -v
"""
import os
import sqlite3
import unittest
from urllib.parse import quote

import exploits
from app import App
from client import TestClient
from test_exploits import SECRET_MARKER, run_csrf_page

HERE = os.path.dirname(os.path.abspath(__file__))


def attempt(fn, *args):
    """Run an exploit; an exception counts as the attack failing."""
    try:
        return fn(*args)
    except Exception as e:  # noqa: BLE001 - any failure means the attack didn't work
        return e


class TestSqlInjection(unittest.TestCase):
    def test_your_exploit_fails(self):
        client = TestClient(App())
        attempt(exploits.sql_injection_login, client)
        self.assertIsNone(client.logged_in_as())

    def test_standard_payloads_fail(self):
        for username, password in [("admin' --", "x"), ("' OR '1'='1' --", ""), ("admin", "' OR '1'='1"),
                                   ("x' UNION SELECT 'admin' --", "")]:
            client = TestClient(App())
            client.login(username, password)
            self.assertIsNone(client.logged_in_as(), f"logged in with {username!r} / {password!r}")

    def test_usernames_with_quotes_still_work(self):
        app = App()
        app.create_user("o'brien", "irish-coffee-7")
        client = TestClient(app)
        client.login("o'brien", "irish-coffee-7")
        self.assertIn("Logged in as o'brien", client.page().replace("&#x27;", "'").replace("&#39;", "'"))


class TestPasswordStorage(unittest.TestCase):
    def all_stored_text(self, app):
        rows = app.db.execute("SELECT * FROM users").fetchall()
        return " ".join(str(v) for row in rows for v in row)

    def test_your_exploit_fails(self):
        app = App()
        stolen = attempt(exploits.steal_passwords, app)
        if isinstance(stolen, dict):
            self.assertNotEqual(stolen.get("alice"), "wonderland42")
            self.assertNotEqual(stolen.get("bob"), "builder99")

    def test_no_plaintext_in_database(self):
        app = App()
        app.create_user("carol", "correct-horse-battery")
        text = self.all_stored_text(app)
        for password in ["wonderland42", "builder99", "correct-horse-battery"]:
            self.assertNotIn(password, text)

    def test_hashes_are_salted(self):
        app = App()
        app.create_user("twin1", "same-password-123")
        app.create_user("twin2", "same-password-123")
        rows = app.db.execute("SELECT * FROM users WHERE username IN ('twin1', 'twin2')").fetchall()
        stored = [tuple(v for v in row if isinstance(v, (str, bytes)) and v not in ("twin1", "twin2")) for row in rows]
        self.assertNotEqual(stored[0], stored[1], "the same password must be stored differently for different users")


class TestSessions(unittest.TestCase):
    def test_your_exploit_fails(self):
        client = TestClient(App())
        attempt(exploits.forge_session, client)
        self.assertIsNone(client.logged_in_as())

    def test_cannot_forge_username_cookie(self):
        client = TestClient(App())
        for value in ["admin", "alice", "YWRtaW4="]:
            client.cookies = {"session": value}
            self.assertIsNone(client.logged_in_as(), f"session={value} should not log anyone in")

    def test_cookie_is_random_and_flagged(self):
        app = App()
        client = TestClient(app)
        response = client.login("alice", "wonderland42")
        header = response.header("Set-Cookie") or ""
        token = client.cookies.get("session", "")
        self.assertGreaterEqual(len(token), 20, "session IDs should be long random values")
        self.assertNotIn("alice", token)
        self.assertIn("httponly", header.lower())
        self.assertIn("samesite", header.lower())
        other = TestClient(app)
        other.login("alice", "wonderland42")
        self.assertNotEqual(other.cookies.get("session"), token, "each login gets a new session ID")

    def test_logout_invalidates_session(self):
        app = App()
        client = TestClient(app)
        client.login("alice", "wonderland42")
        stolen = dict(client.cookies)
        client.form_post("/logout", {})
        thief = TestClient(app)
        thief.cookies = stolen
        self.assertIsNone(thief.logged_in_as(), "an old session cookie must stop working after logout")


class TestXss(unittest.TestCase):
    PAYLOADS = ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '"><svg onload=alert(1)>']

    def post_and_view(self, payload):
        app = App()
        bob = TestClient(app)
        bob.login("bob", "builder99")
        bob.form_post("/comment", {"body": payload})
        alice = TestClient(app)
        alice.login("alice", "wonderland42")
        return alice.page()

    def test_your_exploit_fails(self):
        payload = attempt(exploits.xss_payload)
        if isinstance(payload, str):
            self.assertNotIn(payload, self.post_and_view(payload))

    def test_standard_payloads_are_escaped(self):
        for payload in self.PAYLOADS:
            page = self.post_and_view(payload)
            self.assertNotIn(payload, page)
            self.assertNotIn("<script>alert", page)
            self.assertIn("alert(1)", page, "the comment text should still be shown, just escaped")


class TestCsrf(unittest.TestCase):
    def test_your_exploit_fails(self):
        app = App()
        victim = TestClient(app)
        victim.login("alice", "wonderland42")
        page = attempt(exploits.csrf_attack_page)
        if isinstance(page, str):
            attempt(run_csrf_page, app, page, victim)
        self.assertEqual(app.balance("alice"), 100)

    def test_requests_without_token_rejected(self):
        app = App()
        victim = TestClient(app)
        victim.login("alice", "wonderland42")
        victim.post("/transfer", {"to": "bob", "amount": "10"})
        victim.post("/transfer", {"to": "bob", "amount": "10", "csrf_token": "guess"})
        victim.post("/comment", {"body": "posted by a forged request"})
        self.assertEqual(app.balance("alice"), 100)
        self.assertNotIn("posted by a forged request", victim.page())

    def test_token_is_per_session(self):
        app = App()
        alice, bob = TestClient(app), TestClient(app)
        alice.login("alice", "wonderland42")
        bob.login("bob", "builder99")
        bobs_token = bob.csrf_token()
        self.assertTrue(bobs_token, "logged-in pages should include a csrf_token field")
        alice.post("/transfer", {"to": "bob", "amount": "10", "csrf_token": bobs_token})
        self.assertEqual(app.balance("alice"), 100, "another user's token must not work")


class TestPathTraversal(unittest.TestCase):
    def test_your_exploit_fails(self):
        client = TestClient(App())
        name = attempt(exploits.path_traversal_filename)
        if isinstance(name, str):
            self.assertNotIn(SECRET_MARKER, client.get("/download?file=" + quote(name)).body)

    def test_standard_payloads_fail(self):
        client = TestClient(App())
        secret = os.path.join(HERE, "secret_config.txt")
        for name in ["../secret_config.txt", "..%2fsecret_config.txt", "..\\secret_config.txt",
                     "files/../../secret_config.txt", "./../secret_config.txt", secret]:
            body = client.get("/download?file=" + quote(name, safe="%")).body
            self.assertNotIn(SECRET_MARKER, body, f"leaked the secret with {name!r}")


class TestBusinessLogic(unittest.TestCase):
    def test_your_exploit_fails(self):
        app = App()
        attempt(exploits.negative_transfer, TestClient(app))
        self.assertLessEqual(app.balance("bob"), 100)
        self.assertGreaterEqual(app.balance("alice"), 100)

    def test_bad_amounts_rejected(self):
        app = App()
        bob = TestClient(app)
        bob.login("bob", "builder99")
        for amount in ["-50", "0", "-0", "1e3", "ten"]:
            response = bob.form_post("/transfer", {"to": "alice", "amount": amount})
            self.assertEqual(response.status, 400, f"amount {amount!r} should be rejected")
        self.assertEqual((app.balance("alice"), app.balance("bob")), (100, 100))

    def test_cannot_send_to_self(self):
        app = App()
        bob = TestClient(app)
        bob.login("bob", "builder99")
        bob.form_post("/transfer", {"to": "bob", "amount": "10"})
        self.assertEqual(app.balance("bob"), 100)


if __name__ == "__main__":
    unittest.main()
