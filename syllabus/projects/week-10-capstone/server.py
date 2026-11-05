"""Serve the URL shortener at http://127.0.0.1:8002

    python server.py                 # links live in memory and vanish on restart
    python server.py --db links.db   # keep links in a SQLite file

Logs are printed as one JSON line per request. It only listens on 127.0.0.1,
so nothing outside your machine can reach it.
"""
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from shortener import Shortener

PORT = 8002
db_path = sys.argv[sys.argv.index("--db") + 1] if "--db" in sys.argv else ":memory:"
app = Shortener(db_path=db_path, base_url=f"http://127.0.0.1:{PORT}", log_stream=sys.stdout)
lock = threading.Lock()   # Shortener isn't thread-safe, so handle one request at a time


class Handler(BaseHTTPRequestHandler):
    def _serve(self, method):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length).decode("utf-8", "replace") if length else ""
        headers = {k: v for k, v in self.headers.items() if k.lower() != "x-client-ip"}
        headers["X-Client-IP"] = self.client_address[0]   # never trust a client-supplied value
        with lock:
            response = app.handle(method, self.path, headers, body)
        data = response.body.encode("utf-8")
        self.send_response(response.status)
        for name, value in response.headers:
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        self._serve("GET")

    def do_POST(self):
        self._serve("POST")

    def log_message(self, *args):
        pass   # the app writes its own structured logs


if __name__ == "__main__":
    print(f"URL shortener at http://127.0.0.1:{PORT}  (database: {db_path}, Ctrl+C to stop)", flush=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        with lock:
            app.flush_clicks()
        print("\nStopped (pending clicks saved).")
