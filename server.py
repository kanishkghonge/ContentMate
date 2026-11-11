"""Local HTTP server and WebDAV proxy for Content Mate.
Run: python server.py, then open http://127.0.0.1:8765
"""
import base64, http.client, json, os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.abspath(__file__))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_POST(self):
        if self.path != '/api/webdav':
            self.send_error(404); return
        try:
            length = int(self.headers.get('Content-Length', 0))
            data = json.loads(self.rfile.read(length))
            target = urlsplit(data['url'])
            if target.scheme != 'https' or target.hostname not in ('app.koofr.net', 'koofr.eu'):
                raise ValueError('Only Koofr HTTPS WebDAV URLs are allowed')
            conn = http.client.HTTPSConnection(target.hostname, timeout=30)
            headers = {'Authorization': 'Basic ' + base64.b64encode((data['username'] + ':' + data['password']).encode()).decode()}
            if data.get('method') == 'PROPFIND':
                headers['Depth'] = '1'
            body = data.get('body')
            if body is not None:
                headers['Content-Type'] = 'application/json; charset=utf-8'
            conn.request(data.get('method', 'GET'), target.path + (('?' + target.query) if target.query else ''), body, headers)
            response = conn.getresponse(); payload = response.read()
            self.send_response(response.status)
            self.send_header('Content-Type', response.getheader('Content-Type', 'application/octet-stream'))
            self.end_headers(); self.wfile.write(payload)
        except Exception as exc:
            self.send_error(502, str(exc))

if __name__ == '__main__':
    print('Content Mate running at http://127.0.0.1:8765')
    ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
