"""Portfolio Data Processor — transforms raw portfolio JSON into enriched,
indexed, and normalized output for both live API endpoints and GitHub Pages.
"""

from __future__ import annotations

import argparse
import datetime
import json
from collections import Counter
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RAW_PATH = DATA_DIR / "portfolio_raw.json"
PROCESSED_PATH = DATA_DIR / "portfolio_processed.json"


def load_raw_portfolio(raw_path: Path = RAW_PATH) -> dict[str, Any]:
    """Load the raw portfolio JSON dataset from disk."""
    with raw_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def compute_skill_matrix(
    skills: list[dict[str, Any]],
    projects: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Compute cross-references between declared skills and portfolio projects."""
    usage_counter: Counter[str] = Counter()
    project_map: dict[str, list[str]] = {}

    for project in projects:
        for skill_name in project.get("skillsUsed", []):
            usage_counter[skill_name] += 1
            project_map.setdefault(skill_name, []).append(project["title"])

    matrix: list[dict[str, Any]] = []
    for group in skills:
        enriched_items = []
        for item in group.get("items", []):
            enriched_items.append(
                {
                    "name": item,
                    "projectCount": usage_counter.get(item, 0),
                    "linkedProjects": project_map.get(item, []),
                }
            )
        matrix.append(
            {
                "id": group["id"],
                "category": group["category"],
                "focus": group["focus"],
                "items": enriched_items,
                "totalReferences": sum(x["projectCount"] for x in enriched_items),
            }
        )
    return matrix


def build_search_index(data: dict[str, Any]) -> list[dict[str, str]]:
    """Generate a lightweight searchable index across projects, skills, and certificates."""
    records: list[dict[str, str]] = []
    for project in data.get("projects", []):
        tokens = " ".join(
            [
                project.get("title", ""),
                project.get("category", ""),
                project.get("summary", ""),
                " ".join(project.get("skillsUsed", [])),
            ]
        ).lower()
        records.append(
            {
                "type": "project",
                "id": project["id"],
                "title": project["title"],
                "searchable": tokens,
            }
        )

    for cert in data.get("certificates", []):
        tokens = " ".join(
            [cert.get("title", ""), cert.get("issuer", ""), " ".join(cert.get("topics", []))]
        ).lower()
        records.append(
            {
                "type": "certificate",
                "id": cert["id"],
                "title": cert["title"],
                "searchable": tokens,
            }
        )
    return records


def process_portfolio_data(
    raw_path: Path = RAW_PATH,
    output_path: Path = PROCESSED_PATH,
    persist: bool = True,
) -> dict[str, Any]:
    """Run the full portfolio enrichment pipeline and optionally write output JSON."""
    raw = load_raw_portfolio(raw_path)
    projects = raw.get("projects", [])
    skills = raw.get("skills", [])
    certificates = raw.get("certificates", [])

    domain_counts = Counter(p.get("domain", "other") for p in projects)
    skill_matrix = compute_skill_matrix(skills, projects)
    total_skills = sum(len(group.get("items", [])) for group in skills)
    python_backed_projects = sum(
        1 for p in projects if "Python" in p.get("skillsUsed", [])
    )

    processed = {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "processor": "python-portfolio-engine",
        "profile": raw.get("profile", {}),
        "education": raw.get("education", {}),
        "skills": skills,
        "skillMatrix": skill_matrix,
        "projects": projects,
        "certificates": certificates,
        "interests": raw.get("interests", []),
        "summary": {
            "totalProjects": len(projects),
            "pythonBackedProjects": python_backed_projects,
            "totalSkillTopics": total_skills,
            "verifiedCertificates": len(certificates),
            "domainBreakdown": dict(domain_counts),
        },
        "searchIndex": build_search_index(raw),
    }

    if persist:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w", encoding="utf-8") as handle:
            json.dump(processed, handle, indent=2)

    return processed


def filter_projects(domain: str = "all", query: str = "") -> dict[str, Any]:
    """Filter portfolio projects by domain ('all', 'ai', 'math', 'data') and keyword."""
    processed = process_portfolio_data(persist=False)
    normalized_domain = domain.strip().lower()
    normalized_query = query.strip().lower()

    matched = []
    for project in processed["projects"]:
        domain_ok = normalized_domain in ("", "all") or project.get("domain", "").lower() == normalized_domain
        if not domain_ok:
            continue
        if normalized_query:
            haystack = " ".join(
                [
                    project.get("title", ""),
                    project.get("category", ""),
                    project.get("summary", ""),
                    " ".join(project.get("skillsUsed", [])),
                ]
            ).lower()
            if normalized_query not in haystack:
                continue
        matched.append(project)

    return {
        "domain": normalized_domain or "all",
        "query": query,
        "count": len(matched),
        "projects": matched,
    }


def get_portfolio_summary() -> dict[str, Any]:
    """Return full processed portfolio payload."""
    return process_portfolio_data(persist=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Process Amulya R portfolio JSON data.")
    parser.add_argument("--action", choices=["process", "filter", "summary"], default="process")
    parser.add_argument("--domain", default="all")
    parser.add_argument("--query", default="")
    args = parser.parse_args()

    if args.action == "filter":
        result = filter_projects(domain=args.domain, query=args.query)
    elif args.action == "summary":
        result = get_portfolio_summary()
    else:
        result = process_portfolio_data(persist=True)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
