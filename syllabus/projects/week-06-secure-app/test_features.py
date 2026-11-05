"""Normal use must keep working while you fix things.

These tests pass on the original app too: run them often as you make changes.
Run with: python -m unittest test_features -v
"""
import unittest

from app import App
from client import TestClient


class FeatureTests(unittest.TestCase):
    def setUp(self):
        self.app = App()
        self.alice = TestClient(self.app)

    def test_anonymous_home_shows_login(self):
        page = self.alice.page()
        self.assertIn('action="/login"', page)
        self.assertIsNone(self.alice.logged_in_as())

    def test_login_and_logout(self):
        response = self.alice.login("alice", "wonderland42")
        self.assertEqual(response.status, 303)
        self.assertEqual(self.alice.logged_in_as(), "alice")
        self.assertIn("Balance: 100", self.alice.page())
        self.alice.form_post("/logout", {})
        self.assertIsNone(self.alice.logged_in_as())

    def test_wrong_password(self):
        response = self.alice.login("alice", "wrong")
        self.assertEqual(response.status, 401)
        self.assertIsNone(self.alice.logged_in_as())
        self.assertEqual(TestClient(self.app).login("nobody", "x").status, 401)

    def test_new_user_can_log_in(self):
        self.app.create_user("dana", "s3cure-enough-pass", 25)
        client = TestClient(self.app)
        client.login("dana", "s3cure-enough-pass")
        self.assertEqual(client.logged_in_as(), "dana")
        self.assertEqual(self.app.balance("dana"), 25)

    def test_comments(self):
        self.alice.login("alice", "wonderland42")
        response = self.alice.form_post("/comment", {"body": "Nice weather today"})
        self.assertEqual(response.status, 303)
        bob = TestClient(self.app)
        self.assertIn("Nice weather today", bob.page(), "comments are visible to everyone")

    def test_comment_requires_login(self):
        self.assertEqual(TestClient(self.app).post("/comment", {"body": "hi"}).status, 401)

    def test_transfer(self):
        self.alice.login("alice", "wonderland42")
        response = self.alice.form_post("/transfer", {"to": "bob", "amount": "30"})
        self.assertEqual(response.status, 303)
        self.assertEqual((self.app.balance("alice"), self.app.balance("bob")), (70, 130))

    def test_transfer_errors(self):
        self.alice.login("alice", "wonderland42")
        self.assertEqual(self.alice.form_post("/transfer", {"to": "bob", "amount": "101"}).status, 400)
        self.assertEqual(self.alice.form_post("/transfer", {"to": "nobody", "amount": "5"}).status, 400)
        self.assertEqual((self.app.balance("alice"), self.app.balance("bob")), (100, 100))
        self.assertEqual(TestClient(self.app).post("/transfer", {"to": "bob", "amount": "5"}).status, 401)

    def test_download(self):
        response = self.alice.get("/download?file=welcome.txt")
        self.assertEqual(response.status, 200)
        self.assertIn("Welcome to MiniBank", response.body)
        self.assertEqual(self.alice.get("/download?file=missing.txt").status, 404)

    def test_unknown_page(self):
        self.assertEqual(self.alice.get("/admin").status, 404)


if __name__ == "__main__":
    unittest.main()
