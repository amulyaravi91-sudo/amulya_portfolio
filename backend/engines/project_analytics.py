"""Interactive Python analytical engines powering Amulya R's 4 portfolio projects:
1. Food Scanner — Nutrition & Glycemic Heuristic Scorer
2. Traffic Signal Optimization — Webster Matrix Cycle & Delay Solver
3. Air Quality Index Analysis — CPCB Sub-Index & Multi-City Statistical Engine
4. Smart Traffic Signal for Ambulances — Dijkstra Shortest-Path & Green-Wave Preemption
"""

from __future__ import annotations

import argparse
import heapq
import json
import math
import statistics
import sys
from typing import Any


# ---------------------------------------------------------------------------
# 1. Food Scanner — Nutrition & AI Rating Processor
# ---------------------------------------------------------------------------
SAMPLE_FOOD_PRESETS: dict[str, dict[str, Any]] = {
    "Masala Oats & Chia Bowl": {
        "calories": 310,
        "protein_g": 12.5,
        "carbs_g": 46.0,
        "fiber_g": 8.2,
        "sugar_g": 3.5,
        "fat_g": 7.5,
        "sodium_mg": 280,
    },
    "Paneer Tikka Wrap": {
        "calories": 485,
        "protein_g": 24.0,
        "carbs_g": 42.0,
        "fiber_g": 4.5,
        "sugar_g": 5.0,
        "fat_g": 22.0,
        "sodium_mg": 690,
    },
    "Iced Caramel Frappe": {
        "calories": 390,
        "protein_g": 4.0,
        "carbs_g": 61.0,
        "fiber_g": 0.5,
        "sugar_g": 52.0,
        "fat_g": 14.0,
        "sodium_mg": 240,
    },
    "Sprouted Moong Salad": {
        "calories": 215,
        "protein_g": 15.0,
        "carbs_g": 31.0,
        "fiber_g": 9.4,
        "sugar_g": 2.8,
        "fat_g": 3.2,
        "sodium_mg": 190,
    },
}


def analyze_food_nutrition(payload: dict[str, Any]) -> dict[str, Any]:
    """Score food nutritional quality on a 0-100 scale with macro shares and flags."""
    item_name = str(payload.get("name", "Custom Meal")).strip() or "Custom Meal"
    calories = max(1.0, float(payload.get("calories", 310)))
    protein_g = max(0.0, float(payload.get("protein_g", 12.5)))
    carbs_g = max(0.0, float(payload.get("carbs_g", 46.0)))
    fiber_g = max(0.0, float(payload.get("fiber_g", 8.2)))
    sugar_g = max(0.0, float(payload.get("sugar_g", 3.5)))
    fat_g = max(0.0, float(payload.get("fat_g", 7.5)))
    sodium_mg = max(0.0, float(payload.get("sodium_mg", 280)))

    macro_kcal = max(1.0, (protein_g * 4.0) + (carbs_g * 4.0) + (fat_g * 9.0))
    protein_pct = round((protein_g * 4.0 / macro_kcal) * 100.0, 1)
    carb_pct = round((carbs_g * 4.0 / macro_kcal) * 100.0, 1)
    fat_pct = round((fat_g * 9.0 / macro_kcal) * 100.0, 1)

    net_carbs = max(0.0, carbs_g - fiber_g)
    fiber_ratio = fiber_g / max(1.0, carbs_g)
    estimated_glycemic_load = round((net_carbs * 0.55) + (sugar_g * 0.35), 1)

    score = 68.0
    score += min(18.0, protein_g * 0.85)
    score += min(14.0, fiber_g * 1.45)
    score -= min(28.0, max(0.0, sugar_g - 6.0) * 0.72)
    score -= min(18.0, max(0.0, sodium_mg - 400.0) / 35.0)
    if fat_pct > 45.0:
        score -= (fat_pct - 45.0) * 0.35
    if fiber_ratio >= 0.16:
        score += 4.0

    bounded_score = int(round(max(12.0, min(98.0, score))))
    if bounded_score >= 82:
        grade, verdict = "A", "Nutrient-Dense & Balanced"
    elif bounded_score >= 66:
        grade, verdict = "B", "Moderately Balanced"
    elif bounded_score >= 48:
        grade, verdict = "C", "Occasional / Watch Sugar or Sodium"
    else:
        grade, verdict = "D", "High Sugar or Calorie Density"

    insights: list[str] = []
    if protein_g >= 15.0:
        insights.append("Strong protein contribution supports satiety.")
    elif protein_g < 8.0:
        insights.append("Low protein density; pair with legumes, dairy, or seeds.")

    if fiber_g >= 6.0:
        insights.append("High dietary fiber moderates glucose absorption.")
    if sugar_g > 18.0:
        insights.append("Elevated free sugar raises estimated glycemic load.")
    if sodium_mg > 600.0:
        insights.append("Sodium exceeds 25% of a typical 2,300 mg daily budget.")
    if not insights:
        insights.append("Balanced macro distribution for an everyday meal.")

    return {
        "engine": "food_nutrition_scorer.py",
        "item": item_name,
        "score": bounded_score,
        "grade": grade,
        "verdict": verdict,
        "calories": round(calories, 1),
        "estimatedGlycemicLoad": estimated_glycemic_load,
        "macroSharePct": {
            "protein": protein_pct,
            "carbs": carb_pct,
            "fat": fat_pct,
        },
        "insights": insights,
        "presets": list(SAMPLE_FOOD_PRESETS.keys()),
    }


# ---------------------------------------------------------------------------
# 2. Traffic Signal Optimization — Webster Matrix Solver
# ---------------------------------------------------------------------------
def optimize_traffic_signals(payload: dict[str, Any]) -> dict[str, Any]:
    """Compute Webster's optimum cycle time, phase green splits, and delay reduction."""
    north_vph = max(60.0, float(payload.get("north_vph", 640)))
    south_vph = max(60.0, float(payload.get("south_vph", 520)))
    east_vph = max(60.0, float(payload.get("east_vph", 410)))
    west_vph = max(60.0, float(payload.get("west_vph", 380)))
    saturation_flow = max(1200.0, float(payload.get("saturation_flow_vph", 1850)))
    lost_time_per_phase = max(2.0, float(payload.get("lost_time_sec", 4.0)))

    # Two-phase orthogonal intersection: Phase 1 (N-S critical), Phase 2 (E-W critical)
    ns_critical_flow = max(north_vph, south_vph)
    ew_critical_flow = max(east_vph, west_vph)

    y_ns = ns_critical_flow / saturation_flow
    y_ew = ew_critical_flow / saturation_flow
    total_y = min(0.88, y_ns + y_ew)
    total_lost_time = 2.0 * lost_time_per_phase

    raw_cycle = (1.5 * total_lost_time + 5.0) / max(0.12, (1.0 - total_y))
    optimal_cycle = round(max(40.0, min(140.0, raw_cycle)), 1)
    effective_green = optimal_cycle - total_lost_time

    green_ns = round((y_ns / max(0.01, y_ns + y_ew)) * effective_green, 1)
    green_ew = round(effective_green - green_ns, 1)

    # Compare against naive fixed 60s equal-split signal (26s NS, 26s EW)
    def webster_delay(cycle: float, green: float, flow: float) -> float:
        lam = green / cycle
        x = min(0.96, (flow / saturation_flow) / max(0.1, lam))
        term1 = (cycle * ((1.0 - lam) ** 2)) / (2.0 * max(0.05, 1.0 - (lam * x)))
        term2 = (x ** 2) / (2.0 * max(0.05, (flow / 3600.0) * (1.0 - x)))
        return 0.9 * (term1 + term2)

    opt_delay_ns = webster_delay(optimal_cycle, green_ns, ns_critical_flow)
    opt_delay_ew = webster_delay(optimal_cycle, green_ew, ew_critical_flow)
    avg_opt_delay = round((opt_delay_ns + opt_delay_ew) / 2.0, 1)

    fixed_delay_ns = webster_delay(60.0, 26.0, ns_critical_flow)
    fixed_delay_ew = webster_delay(60.0, 26.0, ew_critical_flow)
    avg_fixed_delay = round((fixed_delay_ns + fixed_delay_ew) / 2.0, 1)

    delay_improvement_pct = round(
        max(-10.0, ((avg_fixed_delay - avg_opt_delay) / max(1.0, avg_fixed_delay)) * 100.0),
        1,
    )

    return {
        "engine": "webster_matrix_optimizer.py",
        "optimalCycleSec": optimal_cycle,
        "effectiveGreenSec": round(effective_green, 1),
        "totalFlowRatioY": round(total_y, 3),
        "phases": [
            {
                "phase": "North-South Corridor",
                "criticalFlowVph": int(ns_critical_flow),
                "flowRatio": round(y_ns, 3),
                "allocatedGreenSec": green_ns,
                "saturationPct": round(min(99.0, (y_ns / (green_ns / optimal_cycle)) * 100.0), 1),
            },
            {
                "phase": "East-West Corridor",
                "criticalFlowVph": int(ew_critical_flow),
                "flowRatio": round(y_ew, 3),
                "allocatedGreenSec": green_ew,
                "saturationPct": round(min(99.0, (y_ew / (green_ew / optimal_cycle)) * 100.0), 1),
            },
        ],
        "avgOptimizedDelaySec": avg_opt_delay,
        "avgFixedBaselineDelaySec": avg_fixed_delay,
        "delayReductionPct": delay_improvement_pct,
    }


# ---------------------------------------------------------------------------
# 3. Air Quality Index Analysis — CPCB Statistical Engine
# ---------------------------------------------------------------------------
CITY_AIR_BASELINE: list[dict[str, Any]] = [
    {"city": "Bengaluru", "pm25": 34.0, "pm10": 68.0, "no2": 29.0, "so2": 9.0, "o3": 38.0},
    {"city": "Chennai", "pm25": 38.0, "pm10": 74.0, "no2": 26.0, "so2": 11.0, "o3": 42.0},
    {"city": "Hyderabad", "pm25": 46.0, "pm10": 89.0, "no2": 33.0, "so2": 12.0, "o3": 45.0},
    {"city": "Mumbai", "pm25": 54.0, "pm10": 112.0, "no2": 41.0, "so2": 15.0, "o3": 49.0},
    {"city": "Kolkata", "pm25": 69.0, "pm10": 134.0, "no2": 47.0, "so2": 14.0, "o3": 51.0},
    {"city": "Delhi", "pm25": 142.0, "pm10": 248.0, "no2": 68.0, "so2": 18.0, "o3": 64.0},
]


def _linear_sub_index(conc: float, breakpoints: list[tuple[float, float, float, float]]) -> float:
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if conc <= c_hi:
            return ((i_hi - i_lo) / (c_hi - c_lo)) * (conc - c_lo) + i_lo
    return 500.0


def _cpcb_aqi(pm25: float, pm10: float, no2: float, so2: float) -> tuple[int, str, str]:
    pm25_bp = [(0, 30, 0, 50), (30, 60, 51, 100), (60, 90, 101, 200), (90, 120, 201, 300), (120, 250, 301, 400), (250, 500, 401, 500)]
    pm10_bp = [(0, 50, 0, 50), (50, 100, 51, 100), (100, 250, 101, 200), (250, 350, 201, 300), (350, 430, 301, 400), (430, 600, 401, 500)]
    no2_bp = [(0, 40, 0, 50), (40, 80, 51, 100), (80, 180, 101, 200), (180, 280, 201, 300), (280, 400, 301, 400), (400, 600, 401, 500)]
    so2_bp = [(0, 40, 0, 50), (40, 80, 51, 100), (80, 380, 101, 200), (380, 800, 201, 300), (800, 1600, 301, 400), (1600, 2100, 401, 500)]

    sub = {
        "PM2.5": _linear_sub_index(max(0.0, pm25), pm25_bp),
        "PM10": _linear_sub_index(max(0.0, pm10), pm10_bp),
        "NO2": _linear_sub_index(max(0.0, no2), no2_bp),
        "SO2": _linear_sub_index(max(0.0, so2), so2_bp),
    }
    dominant = max(sub, key=lambda k: sub[k])
    aqi = int(round(sub[dominant]))

    if aqi <= 50:
        band = "Good"
    elif aqi <= 100:
        band = "Satisfactory"
    elif aqi <= 200:
        band = "Moderate"
    elif aqi <= 300:
        band = "Poor"
    elif aqi <= 400:
        band = "Very Poor"
    else:
        band = "Severe"
    return aqi, band, dominant


def _pearson_corr(xs: list[float], ys: list[float]) -> float:
    mean_x = statistics.mean(xs)
    mean_y = statistics.mean(ys)
    num = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    den = math.sqrt(sum((x - mean_x) ** 2 for x in xs) * sum((y - mean_y) ** 2 for y in ys))
    return round(num / den, 3) if den > 0 else 0.0


def analyze_indian_aqi(payload: dict[str, Any]) -> dict[str, Any]:
    """Evaluate CPCB AQI for an Indian city or custom sensor reading plus multi-city stats."""
    city_name = str(payload.get("city", "Bengaluru")).strip() or "Bengaluru"
    pm25 = float(payload.get("pm25", 34.0))
    pm10 = float(payload.get("pm10", 68.0))
    no2 = float(payload.get("no2", 29.0))
    so2 = float(payload.get("so2", 9.0))

    aqi_val, band, dominant = _cpcb_aqi(pm25, pm10, no2, so2)

    city_scores = []
    for row in CITY_AIR_BASELINE:
        c_aqi, c_band, c_dom = _cpcb_aqi(row["pm25"], row["pm10"], row["no2"], row["so2"])
        city_scores.append(
            {
                "city": row["city"],
                "aqi": c_aqi,
                "category": c_band,
                "dominantPollutant": c_dom,
                "pm25": row["pm25"],
            }
        )

    all_aqis = [c["aqi"] for c in city_scores]
    pm25_series = [r["pm25"] for r in CITY_AIR_BASELINE]
    no2_series = [r["no2"] for r in CITY_AIR_BASELINE]

    return {
        "engine": "cpcb_aqi_statistics.py",
        "city": city_name,
        "aqi": aqi_val,
        "category": band,
        "dominantPollutant": dominant,
        "inputs": {"pm25": pm25, "pm10": pm10, "no2": no2, "so2": so2},
        "nationalBenchmark": {
            "meanAqi": round(statistics.mean(all_aqis), 1),
            "medianAqi": round(statistics.median(all_aqis), 1),
            "stdDevAqi": round(statistics.stdev(all_aqis), 1),
            "pm25No2PearsonR": _pearson_corr(pm25_series, no2_series),
        },
        "cityComparison": sorted(city_scores, key=lambda x: x["aqi"]),
    }


# ---------------------------------------------------------------------------
# 4. Smart Traffic Signal for Ambulances — Dijkstra Preemption Engine
# ---------------------------------------------------------------------------
CITY_CORRIDOR_GRAPH: dict[str, list[tuple[str, float, int]]] = {
    "Dispatch Hub": [("MG Road Junction", 2.1, 2), ("Richmond Circle", 2.8, 3)],
    "MG Road Junction": [("Trinity Metro", 1.8, 2), ("Cubbon Park Gate", 1.6, 1)],
    "Richmond Circle": [("Lalbagh West", 2.0, 2), ("Cubbon Park Gate", 1.9, 2)],
    "Trinity Metro": [("Indiranagar 100ft", 2.4, 2), ("Manipal Hospital", 2.9, 2)],
    "Cubbon Park Gate": [("Trinity Metro", 2.2, 2), ("St. Martha's Hospital", 1.7, 1)],
    "Lalbagh West": [("St. Martha's Hospital", 2.1, 2)],
    "Indiranagar 100ft": [("Manipal Hospital", 1.4, 1)],
    "St. Martha's Hospital": [("Manipal Hospital", 3.6, 3)],
    "Manipal Hospital": [],
}


def simulate_ambulance_corridor(payload: dict[str, Any]) -> dict[str, Any]:
    """Compute shortest emergency route and green-wave signal preemption time savings."""
    origin = str(payload.get("origin", "Dispatch Hub"))
    destination = str(payload.get("destination", "Manipal Hospital"))
    congestion_factor = max(1.0, min(2.5, float(payload.get("congestion_factor", 1.45))))
    preemption_efficiency = max(0.5, min(0.95, float(payload.get("preemption_efficiency", 0.85))))

    if origin not in CITY_CORRIDOR_GRAPH:
        origin = "Dispatch Hub"
    if destination not in CITY_CORRIDOR_GRAPH:
        destination = "Manipal Hospital"

    # Dijkstra weighted by travel minutes under normal signalized traffic
    dist: dict[str, float] = {node: float("inf") for node in CITY_CORRIDOR_GRAPH}
    signals_on_path: dict[str, int] = {node: 0 for node in CITY_CORRIDOR_GRAPH}
    prev: dict[str, str | None] = {node: None for node in CITY_CORRIDOR_GRAPH}
    dist[origin] = 0.0
    pq: list[tuple[float, str]] = [(0.0, origin)]

    while pq:
        cur_d, u = heapq.heappop(pq)
        if cur_d > dist[u]:
            continue
        for v, base_min, sig_count in CITY_CORRIDOR_GRAPH.get(u, []):
            signal_wait_min = sig_count * 0.65 * congestion_factor
            edge_cost = (base_min * congestion_factor) + signal_wait_min
            if cur_d + edge_cost < dist[v]:
                dist[v] = cur_d + edge_cost
                signals_on_path[v] = signals_on_path[u] + sig_count
                prev[v] = u
                heapq.heappush(pq, (dist[v], v))

    path: list[str] = []
    cur: str | None = destination
    while cur is not None:
        path.append(cur)
        cur = prev[cur]
    path.reverse()

    normal_minutes = round(dist[destination], 2)
    total_signals = signals_on_path[destination]
    signal_delay_minutes = total_signals * 0.65 * congestion_factor
    saved_minutes = round(signal_delay_minutes * preemption_efficiency, 2)
    preempted_minutes = round(max(1.2, normal_minutes - saved_minutes), 2)
    improvement_pct = round((saved_minutes / max(0.1, normal_minutes)) * 100.0, 1)

    return {
        "engine": "dijkstra_ambulance_corridor.py",
        "origin": origin,
        "destination": destination,
        "route": path,
        "intersectionsPreempted": total_signals,
        "normalTransitMin": normal_minutes,
        "greenWaveTransitMin": preempted_minutes,
        "timeSavedSec": int(round(saved_minutes * 60)),
        "timeSavedPct": improvement_pct,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run project analytics engine.")
    parser.add_argument("--analyzer", required=True, choices=["food", "traffic", "aqi", "ambulance"])
    parser.add_argument("--payload", default="{}")
    args = parser.parse_args()

    raw_payload = args.payload.strip()
    if raw_payload == "-":
        raw_payload = sys.stdin.read() or "{}"
    payload = json.loads(raw_payload)

    if args.analyzer == "food":
        result = analyze_food_nutrition(payload)
    elif args.analyzer == "traffic":
        result = optimize_traffic_signals(payload)
    elif args.analyzer == "aqi":
        result = analyze_indian_aqi(payload)
    else:
        result = simulate_ambulance_corridor(payload)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
