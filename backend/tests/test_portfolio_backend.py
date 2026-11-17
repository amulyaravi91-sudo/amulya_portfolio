"""Unit tests for Amulya R's Python portfolio backend engines."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from backend.engines.contact_processor import list_enquiries, submit_enquiry
from backend.engines.portfolio_processor import filter_projects, process_portfolio_data
from backend.engines.project_analytics import (
    analyze_food_nutrition,
    analyze_indian_aqi,
    optimize_traffic_signals,
    simulate_ambulance_corridor,
)
from backend.engines.repo_linguist import analyze_repo_languages


class PortfolioBackendTests(unittest.TestCase):
    def test_portfolio_processor_enriches_data(self) -> None:
        processed = process_portfolio_data(persist=False)
        self.assertEqual(processed["profile"]["name"], "Amulya R")
        self.assertEqual(processed["summary"]["totalProjects"], 4)
        self.assertGreaterEqual(processed["summary"]["pythonBackedProjects"], 4)
        self.assertTrue(len(processed["skillMatrix"]) >= 4)

    def test_project_filtering(self) -> None:
        res = filter_projects(domain="math", query="traffic")
        self.assertEqual(res["count"], 1)
        self.assertEqual(res["projects"][0]["id"], "traffic-optimization")

    def test_food_nutrition_scorer(self) -> None:
        healthy = analyze_food_nutrition(
            {
                "name": "Sprouted Moong Salad",
                "calories": 215,
                "protein_g": 15.0,
                "carbs_g": 31.0,
                "fiber_g": 9.4,
                "sugar_g": 2.8,
                "fat_g": 3.2,
                "sodium_mg": 190,
            }
        )
        sugary = analyze_food_nutrition(
            {
                "name": "Iced Caramel Frappe",
                "calories": 390,
                "protein_g": 4.0,
                "carbs_g": 61.0,
                "fiber_g": 0.5,
                "sugar_g": 52.0,
                "fat_g": 14.0,
                "sodium_mg": 240,
            }
        )
        self.assertGreater(healthy["score"], sugary["score"])
        self.assertIn(healthy["grade"], ("A", "B"))

    def test_webster_traffic_optimizer(self) -> None:
        res = optimize_traffic_signals(
            {"north_vph": 720, "south_vph": 540, "east_vph": 410, "west_vph": 360}
        )
        self.assertGreaterEqual(res["optimalCycleSec"], 40.0)
        self.assertEqual(len(res["phases"]), 2)

    def test_cpcb_aqi_statistics(self) -> None:
        res = analyze_indian_aqi({"city": "Bengaluru", "pm25": 34, "pm10": 68, "no2": 29, "so2": 9})
        self.assertEqual(res["category"], "Satisfactory")
        self.assertEqual(len(res["cityComparison"]), 6)

    def test_ambulance_corridor_dijkstra(self) -> None:
        res = simulate_ambulance_corridor(
            {"origin": "Dispatch Hub", "destination": "Manipal Hospital", "congestion_factor": 1.6}
        )
        self.assertLess(res["greenWaveTransitMin"], res["normalTransitMin"])
        self.assertGreater(res["timeSavedSec"], 0)

    def test_contact_enquiry_persistence(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp) / "enquiries.json"
            bad = submit_enquiry({"name": "A", "email": "invalid", "message": "hi"}, storage_path=store)
            self.assertFalse(bad["ok"])
            good = submit_enquiry(
                {
                    "name": "Rohan Kumar",
                    "email": "rohan@example.com",
                    "message": "Interested in collaborating on your Python AI food scanner project.",
                },
                storage_path=store,
            )
            self.assertTrue(good["ok"])
            listed = list_enquiries(storage_path=store)
            self.assertEqual(listed["count"], 1)

    def test_repo_language_target_exceeds_forty_percent(self) -> None:
        report = analyze_repo_languages()
        self.assertGreaterEqual(report["projected"]["pythonSharePct"], 45.0)
        self.assertTrue(report["projected"]["targetMet"])


if __name__ == "__main__":
    unittest.main()
