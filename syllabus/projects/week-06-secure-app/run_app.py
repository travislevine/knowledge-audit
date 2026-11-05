"""Serve MiniBank in a browser at http://127.0.0.1:8001

    python run_app.py              # your copy (app.py)
    python run_app.py --original   # the untouched vulnerable copy

Log in as alice / wonderland42 or bob / builder99. Data lives in memory and
resets every time you restart. It only listens on 127.0.0.1, so nothing
outside your machine can reach it.
"""
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

if "--original" in sys.argv:
    from vulnerable.app import App
else:
    from app import App

PORT = 8001
app = App()


class Handler(BaseHTTPRequestHandler):
    def _serve(self, method):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length).decode("utf-8", "replace") if length else ""
        response = app.handle(method, self.path, dict(self.headers.items()), body)
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


if __name__ == "__main__":
    which = "ORIGINAL vulnerable copy" if "--original" in sys.argv else "your app.py"
    print(f"MiniBank ({which}) at http://127.0.0.1:{PORT}  (Ctrl+C to stop)")
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
