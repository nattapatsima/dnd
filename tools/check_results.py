"""Check the latest browser test results reported to the dev server.

Test pages opened with ?report in the browser pane POST their results to
tools/serve.py, which saves them under .superpowers/test-results/. This script
fails when a page has no saved results, when any source file changed after the
results were saved (a stale run), or when any test failed.

Usage: python tools/check_results.py [page ...]    (default: tests/index.html)
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from serve import results_name  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_DIRS = ["js", "css", "tests", "icons"]
SOURCE_FILES = ["index.html", "sw.js", "manifest.webmanifest"]


def newest_source_mtime():
    times = []
    for d in SOURCE_DIRS:
        for base, _, files in os.walk(os.path.join(ROOT, d)):
            times += [os.path.getmtime(os.path.join(base, f)) for f in files]
    for f in SOURCE_FILES:
        path = os.path.join(ROOT, f)
        if os.path.exists(path):
            times.append(os.path.getmtime(path))
    return max(times, default=0)


def main(pages):
    all_ok = True
    newest = newest_source_mtime()
    for page in pages or ["tests/index.html"]:
        path = os.path.join(ROOT, ".superpowers", "test-results", results_name(page))
        if not os.path.exists(path):
            print(f"{page}: no results reported yet (open it with ?report in the browser pane)")
            all_ok = False
            continue
        if os.path.getmtime(path) < newest:
            print(f"{page}: stale results (a source file changed after the last run)")
            all_ok = False
            continue
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        print(f"{page}: {data['passed']} passed, {data['failed']} failed")
        for failure in data.get("failures", []):
            print(f"  FAIL {failure}")
        all_ok = all_ok and data["failed"] == 0
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
