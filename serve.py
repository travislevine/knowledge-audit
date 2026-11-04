#!/usr/bin/env python3
"""Serve the audits locally and save quiz progress into results/.

    python3 serve.py              # http://localhost:8000
    python3 serve.py --port 9000
    python3 serve.py --no-browser

Every answer is written to results/<audit-id>.json, so progress can be
committed with git. Uses only the standard library (Python 3.8+).
"""
import argparse
import json
import os
import re
import sys
import tempfile
import threading
import webbrowser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RESULTS = ROOT / "results"
API_PREFIX = "/api/results/"
AUDIT_ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,63}$")
MAX_BODY = 2 * 1024 * 1024
write_lock = threading.Lock()


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Always serve fresh files so edits to question banks show up on reload.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def audit_id(self):
        """None for non-API paths, "" for a malformed id, otherwise the id."""
        path = self.path.split("?", 1)[0]
        if not path.startswith(API_PREFIX):
            return None
        audit_id = path[len(API_PREFIX):]
        return audit_id if AUDIT_ID.match(audit_id) else ""

    def send_json(self, status, payload=None):
        body = b"" if payload is None else json.dumps(payload).encode("utf-8")
        self.send_response(status)
        # The quiz pages look for this header to know the save server is running.
        self.send_header("X-Knowledge-Audit", "1")
        if body:
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self):
        audit_id = self.audit_id()
        if audit_id is None:
            return super().do_GET()
        if not audit_id:
            return self.send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid audit id"})
        path = RESULTS / f"{audit_id}.json"
        if not path.exists():
            return self.send_json(HTTPStatus.NOT_FOUND, {"error": "no results saved yet"})
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            return self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": f"could not read {path.name}: {exc}"})
        self.send_json(HTTPStatus.OK, data)

    def do_PUT(self):
        audit_id = self.audit_id()
        if audit_id is None:
            return self.send_json(HTTPStatus.NOT_FOUND, {"error": "unknown endpoint"})
        if not audit_id:
            return self.send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid audit id"})

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY:
            return self.send_json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"error": "body missing or too large"})
        try:
            data = json.loads(self.rfile.read(length))
        except ValueError:
            return self.send_json(HTTPStatus.BAD_REQUEST, {"error": "body is not valid JSON"})
        if not isinstance(data, dict) or data.get("audit") != audit_id:
            return self.send_json(HTTPStatus.BAD_REQUEST, {"error": "body does not match this audit"})

        RESULTS.mkdir(exist_ok=True)
        text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
        with write_lock:
            # Write to a temp file and rename, so a crash never leaves half a file.
            fd, tmp = tempfile.mkstemp(dir=RESULTS, prefix=f".{audit_id}.", suffix=".tmp")
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as fh:
                    fh.write(text)
                os.replace(tmp, RESULTS / f"{audit_id}.json")
            except OSError as exc:
                if os.path.exists(tmp):
                    os.unlink(tmp)
                return self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(exc)})
        self.send_json(HTTPStatus.NO_CONTENT)

    def log_message(self, fmt, *args):
        # Keep the console quiet except for saves and errors.
        is_error = fmt.startswith("code ") or (len(args) > 1 and str(args[1])[:1] in ("4", "5"))
        if self.command == "PUT" or is_error:
            super().log_message(fmt, *args)


def main():
    parser = argparse.ArgumentParser(description="Serve the audits and save results to results/.")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--no-browser", action="store_true", help="don't open a browser tab")
    args = parser.parse_args()

    handler = partial(Handler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as exc:
        sys.exit(f"Couldn't start on port {args.port} ({exc.strerror}). Try: python3 serve.py --port {args.port + 1}")

    url = f"http://localhost:{args.port}/"
    print(f"Serving audits at {url}")
    print(f"Results are saved to {RESULTS.relative_to(ROOT)}/. Press Ctrl+C to stop.")
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
