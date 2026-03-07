#!/usr/bin/env python3
"""
简单静态文件服务器
运行方式：python3 server.py
访问地址：http://localhost:8080
"""

import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        print(f"[访问] {self.address_string()} - {format % args}")


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✅ 服务器已启动：http://localhost:{PORT}")
        print(f"📁 服务目录：{DIRECTORY}")
        print("按 Ctrl+C 停止服务器\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 服务器已停止")

