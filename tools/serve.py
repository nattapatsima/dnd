"""Local dev server for the sheet.

Forces the MIME types the app needs (Windows often maps .js to text/plain,
which breaks ES modules) and turns off HTTP caching so edits show up on reload.
Test pages opened with ?report POST their results to /__report; they are saved
under .superpowers/test-results/ for tools/check_results.py.

Usage: python tools/serve.py [--port 8000] [--root .]
"""
import argparse
import json
import os
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def results_name(page):
    """File name for a test page's saved results: 'tests/index.html' -> 'tests_index.html.json'."""
    page = str(page).lstrip("/") or "tests/index.html"
    if page.endswith("/"):
        page += "index.html"
    return re.sub(r"[^A-Za-z0-9._-]", "_", page) + ".json"

MIME = {
    ".js": "text/javascript",
    ".webmanifest": "application/manifest+json",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".html": "text/html",
}


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, **MIME}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path != "/__report":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(length) or b"{}")
        out_dir = os.path.join(self.directory, ".superpowers", "test-results")
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, results_name(data.get("page", ""))), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        self.send_response(204)
        self.end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--root", default=".")
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=args.root))
    print(f"Serving {args.root} at http://localhost:{args.port}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
