"""
Phasmophobia Investigation Journal Web App
Server chay bang Python chuan (khong can cai dat them thu vien).
"""

import http.server
import socketserver
import json
import os
import sys
import webbrowser
import threading
from urllib.parse import urlparse, parse_qs

# Dam bao terminal Windows khong bi loi font Unicode
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_json_file(filename):
    path = os.path.join(BASE_DIR, filename)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Loi doc file {filename}: {e}")
    return []

GHOSTS_DATA = load_json_file("phasmophobia_ghosts_vi.json")
TOOLS_CURSED_DATA = load_json_file("phasmophobia_tools_and_cursed_vi.json")

class PhasmophobiaJournalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # API Endpoints
        if path == "/api/ghosts":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            
            q = query.get("q", [""])[0].lower().strip()
            if q:
                filtered = [
                    g for g in GHOSTS_DATA
                    if q in g.get("name_en", "").lower()
                    or q in g.get("name_vi", "").lower()
                    or any(q in a.lower() for a in g.get("alias", []))
                    or q in g.get("traits", {}).get("strength", "").lower()
                    or q in g.get("traits", {}).get("weakness", "").lower()
                    or q in g.get("hidden_test", "").lower()
                ]
                self.wfile.write(json.dumps(filtered, ensure_ascii=False).encode("utf-8"))
            else:
                self.wfile.write(json.dumps(GHOSTS_DATA, ensure_ascii=False).encode("utf-8"))
            return

        elif path == "/api/cursed":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            cursed = TOOLS_CURSED_DATA.get("cursed_possessions", []) if isinstance(TOOLS_CURSED_DATA, dict) else []
            self.wfile.write(json.dumps(cursed, ensure_ascii=False).encode("utf-8"))
            return

        elif path == "/api/tools":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            tools = TOOLS_CURSED_DATA.get("tools_and_equipment", []) if isinstance(TOOLS_CURSED_DATA, dict) else []
            self.wfile.write(json.dumps(tools, ensure_ascii=False).encode("utf-8"))
            return

        elif path == "/api/voice":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            voice = TOOLS_CURSED_DATA.get("voice_commands_en", {}) if isinstance(TOOLS_CURSED_DATA, dict) else {}
            self.wfile.write(json.dumps(voice, ensure_ascii=False).encode("utf-8"))
            return

        super().do_GET()

def start_server():
    global PORT
    for attempt_port in range(8080, 8095):
        try:
            handler = PhasmophobiaJournalHandler
            with socketserver.ThreadingTCPServer(("", attempt_port), handler) as httpd:
                PORT = attempt_port
                print("===============================================================")
                print("[PHASMOPHOBIA JOURNAL SERVER DANG CHAY]")
                print(f">> Mo trinh duyet tai: http://127.0.0.1:{PORT}")
                print(">> Nhan Ctrl + C de dung server.")
                print("===============================================================")
                
                def open_browser():
                    webbrowser.open(f"http://127.0.0.1:{PORT}")
                threading.Timer(1.0, open_browser).start()

                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    start_server()
