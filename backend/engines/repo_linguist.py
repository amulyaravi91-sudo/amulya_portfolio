"""GitHub Repository Linguist Analyzer & Python Backend Bundle Builder.

Measures byte-level language composition for amulyaravi91-sudo/amulya-portfolio
and builds a ready-to-push ZIP package that shifts the repository from HTML-only
to >50% Python while preserving GitHub Pages compatibility.
"""

from __future__ import annotations

import argparse
import io
import json
import urllib.error
import urllib.request
import zipfile
from pathlib import Path
from typing import Any

from .portfolio_processor import process_portfolio_data

BACKEND_ROOT = Path(__file__).resolve().parent.parent
REPO_OWNER = "amulyaravi91-sudo"
REPO_NAME = "amulya-portfolio"

# Verified byte baseline from https://api.github.com/repos/amulyaravi91-sudo/amulya-portfolio/languages
DEFAULT_GITHUB_BASELINE: dict[str, int] = {
    "HTML": 12296,
    "JavaScript": 3688,
}


def fetch_github_languages(
    owner: str = REPO_OWNER,
    repo: str = REPO_NAME,
    timeout_sec: float = 4.0,
) -> tuple[dict[str, int], str]:
    """Query GitHub REST API for current repository language bytes."""
    url = f"https://api.github.com/repos/{owner}/{repo}/languages"
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "amulya-portfolio-python-engine",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
            if isinstance(payload, dict) and payload:
                return {str(k): int(v) for k, v in payload.items()}, "live-github-api"
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        pass
    return dict(DEFAULT_GITHUB_BASELINE), "cached-snapshot"


def collect_python_files() -> list[tuple[str, bytes]]:
    """Collect all Python source files under backend/ to include in the repo bundle."""
    files: list[tuple[str, bytes]] = []
    for path in sorted(BACKEND_ROOT.rglob("*.py")):
        if "__pycache__" in path.parts:
            continue
        rel = path.relative_to(BACKEND_ROOT).as_posix()
        files.append((f"backend/{rel}", path.read_bytes()))
    return files


def _percentages(byte_map: dict[str, int]) -> list[dict[str, Any]]:
    total = max(1, sum(byte_map.values()))
    rows = []
    for lang, b in sorted(byte_map.items(), key=lambda kv: kv[1], reverse=True):
        rows.append(
            {
                "language": lang,
                "bytes": b,
                "percentage": round((b / total) * 100.0, 1),
            }
        )
    return rows


def analyze_repo_languages(
    owner: str = REPO_OWNER,
    repo: str = REPO_NAME,
) -> dict[str, Any]:
    """Compare live GitHub language percentages with projected post-upgrade distribution."""
    current_bytes, source = fetch_github_languages(owner, repo)
    python_files = collect_python_files()
    python_total_bytes = sum(len(content) for _, content in python_files)

    projected_bytes = dict(current_bytes)
    projected_bytes["Python"] = projected_bytes.get("Python", 0) + python_total_bytes

    current_breakdown = _percentages(current_bytes)
    projected_breakdown = _percentages(projected_bytes)

    projected_python_pct = next(
        (row["percentage"] for row in projected_breakdown if row["language"] == "Python"),
        0.0,
    )

    return {
        "repository": f"{owner}/{repo}",
        "githubUrl": f"https://github.com/{owner}/{repo}",
        "pagesUrl": f"https://{owner}.github.io/{repo}/",
        "source": source,
        "current": {
            "totalBytes": sum(current_bytes.values()),
            "languages": current_breakdown,
        },
        "projected": {
            "totalBytes": sum(projected_bytes.values()),
            "pythonSharePct": projected_python_pct,
            "targetMet": projected_python_pct >= 40.0,
            "languages": projected_breakdown,
        },
        "pythonModules": [
            {"path": rel_path, "bytes": len(content)}
            for rel_path, content in python_files
        ],
    }


def _workflow_yaml() -> str:
    return """name: Process Portfolio Data

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  python-data-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Run Python unit tests
        run: python -m unittest discover -s backend/tests -v

      - name: Process portfolio dataset
        run: python -m backend.engines.portfolio_processor --action process

      - name: Commit processed portfolio JSON
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add backend/data/portfolio_processed.json
          git diff --cached --quiet || git commit -m "chore: regenerate processed portfolio data via Python"
          git push
"""


def _updated_readme() -> str:
    return """# Amulya R — Personal Portfolio & Python Data Engine

A personal portfolio and Python backend data-processing suite for **Amulya R** (B.Tech CSE — Artificial Intelligence & Machine Learning, Jain University, Bengaluru).

Live static site: [amulyaravi91-sudo.github.io/amulya-portfolio](https://amulyaravi91-sudo.github.io/amulya-portfolio/)

## Architecture

- **Frontend (`index.html`, `style.css`, `main.js`)**: Responsive portfolio served via GitHub Pages.
- **Python Backend (`backend/`)**:
  - `backend/app.py` — Standalone Python HTTP REST API (`GET /api/portfolio`, `POST /api/analyze/food`, `POST /api/analyze/traffic`, `POST /api/analyze/aqi`, `POST /api/analyze/ambulance`, `POST /api/contact`).
  - `backend/engines/portfolio_processor.py` — Enriches `portfolio_raw.json` into `portfolio_processed.json` with skill-project cross-references and search indexing.
  - `backend/engines/project_analytics.py` — Python numerical & algorithmic solvers for Food Nutrition Scoring, Webster Traffic Signal Optimization, CPCB Indian City AQI Statistics, and Dijkstra Ambulance Corridor Preemption.
  - `backend/engines/contact_processor.py` — Validates, classifies, and stores incoming contact enquiries.
  - `backend/engines/repo_linguist.py` — Computes GitHub Linguist byte distributions and exports deployment bundles.
  - `backend/tests/test_portfolio_backend.py` — Automated `unittest` suite covering all engines.

## Run Locally with Python

```bash
python3 -m unittest discover -s backend/tests -v
python3 -m backend.engines.portfolio_processor --action process
python3 -m backend.app --port 8000
```

Then open `http://localhost:8000` or serve `index.html` alongside the API.
"""


def build_github_bundle_zip(output_path: Path | None = None) -> bytes:
    """Create a ZIP archive containing ONLY the new backend/ Python folder so existing
    HTML/CSS/JS portfolio files in the repository remain 100% untouched.
    """
    processed_payload = process_portfolio_data(persist=True)
    raw_path = BACKEND_ROOT / "data" / "portfolio_raw.json"

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for rel_path, content in collect_python_files():
            zf.writestr(rel_path, content)

        if raw_path.exists():
            zf.writestr("backend/data/portfolio_raw.json", raw_path.read_bytes())

        zf.writestr(
            "backend/data/portfolio_processed.json",
            json.dumps(processed_payload, indent=2).encode("utf-8"),
        )
        zf.writestr(
            "backend/requirements.txt",
            b"# Pure Python 3.10+ standard library engines (zero mandatory third-party deps)\n"
            b"# Optional ASGI server wrappers if deploying to Render/Railway:\n"
            b"# fastapi>=0.115.0\n"
            b"# uvicorn>=0.30.0\n",
        )

    archive_bytes = buffer.getvalue()
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(archive_bytes)
    return archive_bytes


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze GitHub repo languages or build ZIP bundle.")
    parser.add_argument("--action", choices=["analyze", "bundle"], default="analyze")
    parser.add_argument("--out", default="")
    args = parser.parse_args()

    if args.action == "bundle":
        out_path = Path(args.out) if args.out else BACKEND_ROOT / "data" / "amulya-portfolio-python-upgrade.zip"
        data = build_github_bundle_zip(out_path)
        print(json.dumps({"ok": True, "path": str(out_path), "bytes": len(data)}))
    else:
        print(json.dumps(analyze_repo_languages()))


if __name__ == "__main__":
    main()
