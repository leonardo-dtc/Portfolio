#!/usr/bin/env python3
"""Serve the site over http for local checking.

Two reasons this exists rather than `python3 -m http.server`:

  - that evaluates os.getcwd() while parsing its own arguments, which some
    sandboxes refuse, so the root is taken explicitly here;
  - it answers conditional requests with 304 and lets the browser cache, which
    on a site edited between reloads means looking at the *previous* stylesheet
    while reading the new source and wondering why nothing changed. Everything
    here is served no-store.

    python3 tools/serve.py [port] [root]
"""
import functools, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Fresh(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def send_header(self, key, value):
        if key.lower() == 'last-modified':
            return                      # no validator, so no conditional 304
        super().send_header(key, value)


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
root = sys.argv[2] if len(sys.argv) > 2 else '.'
handler = functools.partial(Fresh, directory=root)
print('serving %s on http://127.0.0.1:%d (no-store)' % (root, port), flush=True)
ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
