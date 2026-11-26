import http.server, os, sys
ROOT = r"F:\AUDIRA-EPISODES\_UPLOAD_FAKTADUNIA"
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "https://studio.youtube.com")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()
    def do_OPTIONS(self):
        self.send_response(204); self.end_headers()
    def do_GET(self):
        if self.path.startswith("/c/"):
            _, _, i, name = self.path.split("/", 3)
            name = os.path.basename(name)
            p = os.path.join(ROOT, name)
            if not name.endswith(".mp4") or not os.path.isfile(p):
                return self.send_error(404)
            C = 32 * 1024 * 1024
            with open(p, "rb") as f:
                f.seek(int(i) * C); data = f.read(C)
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("X-Total", str(os.path.getsize(p)))
            self.send_header("Access-Control-Expose-Headers", "X-Total")
            self.end_headers(); self.wfile.write(data); return
        return super().do_GET()
    def list_directory(self, path):
        self.send_error(404); return None
http.server.ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
