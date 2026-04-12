"""Simple SPA-friendly static server for SmartHire dist build.
Serves all 404 routes as index.html so React Router BrowserRouter works.
Run: python server.py
"""
import http.server
import os
import sys
from pathlib import Path

DIST_DIR = Path(__file__).parent / "dist"
PORT = 3000


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        # Check if the requested file exists in dist
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            # Return index.html for all SPA routes (BrowserRouter fallback)
            self.path = "/index.html"
        super().do_GET()

    def log_message(self, format, *args):
        # Suppress verbose logging, only show start message
        pass


if __name__ == "__main__":
    os.chdir(str(DIST_DIR))
    handler = SPAHandler
    with http.server.HTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"\n✅  SmartHire running at http://localhost:{PORT}")
        print("    Press Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
