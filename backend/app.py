"""Standalone Python HTTP API server for Amulya R's portfolio backend.

Run directly with:
    python3 -m backend.app --port 8000
"""

from __future__ import annotations

import argparse
import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import parse_qs, urlparse

from .engines.contact_processor import list_enquiries, submit_enquiry
from .engines.portfolio_processor import filter_projects, get_portfolio_summary
from .engines.project_analytics import (
    analyze_food_nutrition,
    analyze_indian_aqi,
    optimize_traffic_signals,
    simulate_ambulance_corridor,
)
from .engines.repo_linguist import analyze_repo_languages, build_github_bundle_zip


class PortfolioRequestHandler(BaseHTTPRequestHandler):
    """REST JSON handler serving processed portfolio data and analytics engines."""

    server_version = "AmulyaPortfolioPython/1.0"

    def _send_json(self, status: int, payload: Any) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/api/health":
            self._send_json(HTTPStatus.OK, {"status": "ok", "runtime": "python"})
        elif path == "/api/portfolio":
            self._send_json(HTTPStatus.OK, get_portfolio_summary())
        elif path == "/api/portfolio/projects":
            domain = qs.get("domain", ["all"])[0]
            query = qs.get("q", [""])[0]
            self._send_json(HTTPStatus.OK, filter_projects(domain=domain, query=query))
        elif path == "/api/contact":
            self._send_json(HTTPStatus.OK, list_enquiries())
        elif path == "/api/github/languages":
            self._send_json(HTTPStatus.OK, analyze_repo_languages())
        elif path == "/api/export/github-bundle.zip":
            archive = build_github_bundle_zip()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", 'attachment; filename="amulya-portfolio-python-upgrade.zip"')
            self.send_header("Content-Length", str(len(archive)))
            self.end_headers()
            self.wfile.write(archive)
        else:
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "Endpoint not found"})

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        try:
            payload = self._read_json_body()
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON body"})
            return

        if path == "/api/analyze/food":
            self._send_json(HTTPStatus.OK, analyze_food_nutrition(payload))
        elif path == "/api/analyze/traffic":
            self._send_json(HTTPStatus.OK, optimize_traffic_signals(payload))
        elif path == "/api/analyze/aqi":
            self._send_json(HTTPStatus.OK, analyze_indian_aqi(payload))
        elif path == "/api/analyze/ambulance":
            self._send_json(HTTPStatus.OK, simulate_ambulance_corridor(payload))
        elif path == "/api/contact":
            result = submit_enquiry(payload)
            status = HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST
            self._send_json(status, result)
        else:
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "Endpoint not found"})


def run_server(host: str = "0.0.0.0", port: int = 8000) -> None:
    server = ThreadingHTTPServer((host, port), PortfolioRequestHandler)
    print(f"Python portfolio backend listening on http://{host}:{port}")
    server.serve_forever()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run standalone Python portfolio server.")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    run_server(host=args.host, port=args.port)


if __name__ == "__main__":
    main()
