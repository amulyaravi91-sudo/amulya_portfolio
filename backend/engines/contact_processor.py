"""Contact & Enquiry Processor — validates, categorizes, and persists portfolio enquiries."""

from __future__ import annotations

import argparse
import datetime
import json
import re
import sys
import uuid
from pathlib import Path
from typing import Any

ENQUIRIES_PATH = Path(__file__).resolve().parent.parent / "data" / "enquiries.json"
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def classify_enquiry(message: str) -> str:
    """Classify an incoming enquiry into Collaboration, Research, Internship, or General."""
    lower = message.lower()
    if any(k in lower for k in ("intern", "role", "hiring", "opportunity", "job")):
        return "Opportunity / Internship"
    if any(k in lower for k in ("research", "paper", "ai", "ml", "dataset", "model")):
        return "AI & Research"
    if any(k in lower for k in ("project", "collaborate", "hackathon", "build", "python")):
        return "Project Collaboration"
    return "General Enquiry"


def load_enquiries(storage_path: Path = ENQUIRIES_PATH) -> list[dict[str, Any]]:
    if not storage_path.exists():
        return []
    try:
        with storage_path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def submit_enquiry(
    payload: dict[str, Any],
    storage_path: Path = ENQUIRIES_PATH,
) -> dict[str, Any]:
    """Validate and record a contact form submission using Python backend processing."""
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    message = str(payload.get("message", "")).strip()

    errors: list[str] = []
    if len(name) < 2:
        errors.append("Please provide your name (at least 2 characters).")
    if not EMAIL_PATTERN.match(email):
        errors.append("Please provide a valid email address.")
    if len(message) < 8:
        errors.append("Please write a brief message (at least 8 characters).")

    if errors:
        return {"ok": False, "errors": errors}

    category = classify_enquiry(message)
    record = {
        "id": str(uuid.uuid4())[:8],
        "name": name,
        "email": email,
        "category": category,
        "message": message,
        "receivedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    records = load_enquiries(storage_path)
    records.insert(0, record)
    storage_path.parent.mkdir(parents=True, exist_ok=True)
    with storage_path.open("w", encoding="utf-8") as handle:
        json.dump(records[:50], handle, indent=2)

    return {
        "ok": True,
        "record": record,
        "totalStored": len(records[:50]),
    }


def list_enquiries(storage_path: Path = ENQUIRIES_PATH) -> dict[str, Any]:
    records = load_enquiries(storage_path)
    return {"count": len(records), "enquiries": records}


def main() -> None:
    parser = argparse.ArgumentParser(description="Process portfolio contact enquiries.")
    parser.add_argument("--action", choices=["submit", "list"], default="list")
    parser.add_argument("--payload", default="{}")
    args = parser.parse_args()

    if args.action == "submit":
        raw = sys.stdin.read() if args.payload.strip() == "-" else args.payload
        result = submit_enquiry(json.loads(raw or "{}"))
    else:
        result = list_enquiries()

    print(json.dumps(result))


if __name__ == "__main__":
    main()
