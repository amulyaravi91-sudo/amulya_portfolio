import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import type {
  AmbulanceRouteResult,
  AqiAnalysisResult,
  FoodAnalysisResult,
  TrafficOptimizationResult,
} from '../types/portfolio';

export type LabTab = 'food' | 'traffic' | 'aqi' | 'ambulance';

interface PythonLabSectionProps {
  activeTab: LabTab;
  onChangeTab: (tab: LabTab) => void;
}

const FOOD_PRESETS: Record<
  string,
  {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fiber_g: number;
    sugar_g: number;
    fat_g: number;
    sodium_mg: number;
  }
> = {
  'Masala Oats & Chia Bowl': {
    calories: 310,
    protein_g: 12.5,
    carbs_g: 46,
    fiber_g: 8.2,
    sugar_g: 3.5,
    fat_g: 7.5,
    sodium_mg: 280,
  },
  'Paneer Tikka Wrap': {
    calories: 485,
    protein_g: 24,
    carbs_g: 42,
    fiber_g: 4.5,
    sugar_g: 5,
    fat_g: 22,
    sodium_mg: 690,
  },
  'Iced Caramel Frappe': {
    calories: 390,
    protein_g: 4,
    carbs_g: 61,
    fiber_g: 0.5,
    sugar_g: 52,
    fat_g: 14,
    sodium_mg: 240,
  },
  'Sprouted Moong Salad': {
    calories: 215,
    protein_g: 15,
    carbs_g: 31,
    fiber_g: 9.4,
    sugar_g: 2.8,
    fat_g: 3.2,
    sodium_mg: 190,
  },
};

const AQI_PRESETS: Record<
  string,
  { pm25: number; pm10: number; no2: number; so2: number }
> = {
  Bengaluru: { pm25: 34, pm10: 68, no2: 29, so2: 9 },
  Chennai: { pm25: 38, pm10: 74, no2: 26, so2: 11 },
  Hyderabad: { pm25: 46, pm10: 89, no2: 33, so2: 12 },
  Mumbai: { pm25: 54, pm10: 112, no2: 41, so2: 15 },
  Kolkata: { pm25: 69, pm10: 134, no2: 47, so2: 14 },
  Delhi: { pm25: 142, pm10: 248, no2: 68, so2: 18 },
};

const TAB_ITEMS: Array<{ id: LabTab; label: string; moduleName: string }> = [
  { id: 'food', label: '01. Food Scanner', moduleName: 'food_nutrition_scorer.py' },
  { id: 'traffic', label: '02. Traffic Matrix', moduleName: 'webster_matrix_optimizer.py' },
  { id: 'aqi', label: '03. Indian City AQI', moduleName: 'cpcb_aqi_statistics.py' },
  { id: 'ambulance', label: '04. Ambulance Corridor', moduleName: 'dijkstra_ambulance_corridor.py' },
];

export function PythonLabSection({ activeTab, onChangeTab }: PythonLabSectionProps) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Food state
  const [foodName, setFoodName] = useState('Masala Oats & Chia Bowl');
  const [foodInputs, setFoodInputs] = useState(FOOD_PRESETS['Masala Oats & Chia Bowl']);
  const [foodResult, setFoodResult] = useState<FoodAnalysisResult | null>(null);

  // Traffic state
  const [trafficInputs, setTrafficInputs] = useState({
    north_vph: 680,
    south_vph: 540,
    east_vph: 410,
    west_vph: 360,
    lost_time_sec: 4,
  });
  const [trafficResult, setTrafficResult] = useState<TrafficOptimizationResult | null>(null);

  // AQI state
  const [aqiCity, setAqiCity] = useState('Bengaluru');
  const [aqiInputs, setAqiInputs] = useState(AQI_PRESETS.Bengaluru);
  const [aqiResult, setAqiResult] = useState<AqiAnalysisResult | null>(null);

  // Ambulance state
  const [ambulanceInputs, setAmbulanceInputs] = useState({
    origin: 'Dispatch Hub',
    destination: 'Manipal Hospital',
    congestion_factor: 1.5,
    preemption_efficiency: 0.85,
  });
  const [ambulanceResult, setAmbulanceResult] = useState<AmbulanceRouteResult | null>(null);

  async function runPythonSolver(tab: LabTab, payload: unknown) {
    setBusy(true);
    setErrorMsg(null);
    try {
      const resp = await fetch(`/api/analyze/${tab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        throw new Error(`Python backend returned status ${resp.status}`);
      }
      const data = await resp.json();
      if (tab === 'food') setFoodResult(data as FoodAnalysisResult);
      if (tab === 'traffic') setTrafficResult(data as TrafficOptimizationResult);
      if (tab === 'aqi') setAqiResult(data as AqiAnalysisResult);
      if (tab === 'ambulance') setAmbulanceResult(data as AmbulanceRouteResult);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'food' && !foodResult) {
      runPythonSolver('food', { name: foodName, ...foodInputs });
    } else if (activeTab === 'traffic' && !trafficResult) {
      runPythonSolver('traffic', trafficInputs);
    } else if (activeTab === 'aqi' && !aqiResult) {
      runPythonSolver('aqi', { city: aqiCity, ...aqiInputs });
    } else if (activeTab === 'ambulance' && !ambulanceResult) {
      runPythonSolver('ambulance', ambulanceInputs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <section id="python-lab" className="border-b border-stone-200 dark:border-zinc-800">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-stone-500 dark:text-zinc-400">
              03. Interactive Python Data Lab
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl dark:text-zinc-50">
              Live Python backend processing.
            </h2>
          </div>
          <p className="max-w-md text-sm text-stone-600 dark:text-zinc-400">
            Each control executes Python 3 algorithms in real time via the Express-to-Python bridge
            using standard-library mathematical and statistical solvers.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-1.5 rounded-xl bg-stone-200/70 p-1.5 dark:bg-zinc-900">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-stone-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mt-6 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
            Error running Python engine: {errorMsg}
          </div>
        )}

        <div className="mt-6 grid gap-8 rounded-2xl border border-stone-200 bg-white p-6 lg:grid-cols-12 lg:p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          {/* FOOD SCANNER */}
          {activeTab === 'food' && (
            <>
              <div className="space-y-5 lg:col-span-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                    Meal Nutrition Input
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                    Choose a preset meal or adjust grams to evaluate nutrition density in Python.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(FOOD_PRESETS).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setFoodName(preset);
                        setFoodInputs(FOOD_PRESETS[preset]);
                        runPythonSolver('food', { name: preset, ...FOOD_PRESETS[preset] });
                      }}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        foodName === preset
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'calories', label: 'Calories (kcal)' },
                    { key: 'protein_g', label: 'Protein (g)' },
                    { key: 'carbs_g', label: 'Carbs (g)' },
                    { key: 'fiber_g', label: 'Fiber (g)' },
                    { key: 'sugar_g', label: 'Sugar (g)' },
                    { key: 'sodium_mg', label: 'Sodium (mg)' },
                  ].map((field) => (
                    <label key={field.key} className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                      {field.label}
                      <input
                        type="number"
                        step="0.5"
                        min={0}
                        value={foodInputs[field.key as keyof typeof foodInputs]}
                        onChange={(e) =>
                          setFoodInputs((prev) => ({
                            ...prev,
                            [field.key]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 font-mono text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runPythonSolver('food', { name: foodName, ...foodInputs })}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{busy ? 'Computing...' : 'Run Nutrition Scorer'}</span>
                </button>
              </div>

              <div className="border-t border-stone-200 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-800">
                {foodResult ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          {foodResult.engine}
                        </span>
                        <h4 className="mt-1 font-display text-2xl font-bold text-stone-950 dark:text-zinc-50">
                          {foodResult.item}
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-zinc-300">
                          {foodResult.verdict}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-3xl font-bold text-emerald-800 tabular-nums dark:text-emerald-400">
                          {foodResult.score}/100
                        </div>
                        <div className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          Grade {foodResult.grade} · GL {foodResult.estimatedGlycemicLoad}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-stone-100 py-4 dark:border-zinc-800">
                      <div>
                        <div className="text-xs text-stone-500 dark:text-zinc-400">Protein Share</div>
                        <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-stone-950 dark:text-zinc-100">
                          {foodResult.macroSharePct.protein}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 dark:text-zinc-400">Carb Share</div>
                        <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-stone-950 dark:text-zinc-100">
                          {foodResult.macroSharePct.carbs}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 dark:text-zinc-400">Fat Share</div>
                        <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-stone-950 dark:text-zinc-100">
                          {foodResult.macroSharePct.fat}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                        Python Dietary Assessment
                      </h5>
                      <ul className="mt-2 space-y-1.5 text-sm text-stone-600 dark:text-zinc-400">
                        {foodResult.insights.map((line, i) => (
                          <li key={i}>· {line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Loading Python food scorer...</p>
                )}
              </div>
            </>
          )}

          {/* TRAFFIC SIGNAL OPTIMIZER */}
          {activeTab === 'traffic' && (
            <>
              <div className="space-y-5 lg:col-span-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                    Intersection Approach Volumes
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                    Adjust vehicles per hour (vph) per approach to solve Webster&apos;s optimum cycle.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'north_vph', label: 'Northbound (vph)' },
                    { key: 'south_vph', label: 'Southbound (vph)' },
                    { key: 'east_vph', label: 'Eastbound (vph)' },
                    { key: 'west_vph', label: 'Westbound (vph)' },
                  ].map((field) => (
                    <label key={field.key} className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                      {field.label}
                      <input
                        type="number"
                        min={60}
                        max={1400}
                        step={20}
                        value={trafficInputs[field.key as keyof typeof trafficInputs]}
                        onChange={(e) =>
                          setTrafficInputs((prev) => ({
                            ...prev,
                            [field.key]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 font-mono text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runPythonSolver('traffic', trafficInputs)}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{busy ? 'Solving...' : 'Solve Optimal Signal Cycle'}</span>
                </button>
              </div>

              <div className="border-t border-stone-200 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-800">
                {trafficResult ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          {trafficResult.engine}
                        </span>
                        <h4 className="mt-1 font-display text-2xl font-bold text-stone-950 dark:text-zinc-50">
                          {trafficResult.optimalCycleSec}s Optimal Cycle
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-zinc-300">
                          Effective green {trafficResult.effectiveGreenSec}s · Flow sum Y ={' '}
                          <span className="font-mono">{trafficResult.totalFlowRatioY}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-emerald-800 tabular-nums dark:text-emerald-400">
                          {trafficResult.delayReductionPct > 0 ? '-' : ''}
                          {Math.abs(trafficResult.delayReductionPct)}% delay
                        </div>
                        <div className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          {trafficResult.avgOptimizedDelaySec}s vs {trafficResult.avgFixedBaselineDelaySec}s fixed
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {trafficResult.phases.map((phase) => (
                        <div
                          key={phase.phase}
                          className="rounded-xl border border-stone-200 bg-[#F9F9F6] p-4 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-zinc-200">
                            <span>{phase.phase}</span>
                            <span className="font-mono">
                              Green: {phase.allocatedGreenSec}s · {phase.criticalFlowVph} vph
                            </span>
                          </div>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-emerald-700 dark:bg-emerald-500"
                              style={{
                                width: `${Math.min(100, (phase.allocatedGreenSec / trafficResult.optimalCycleSec) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Loading Python Webster solver...</p>
                )}
              </div>
            </>
          )}

          {/* INDIAN CITIES AQI ANALYZER */}
          {activeTab === 'aqi' && (
            <>
              <div className="space-y-5 lg:col-span-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                    CPCB Pollutant Readings
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                    Select an Indian city baseline or enter custom particulate and gas concentrations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(AQI_PRESETS).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setAqiCity(city);
                        setAqiInputs(AQI_PRESETS[city]);
                        runPythonSolver('aqi', { city, ...AQI_PRESETS[city] });
                      }}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        aqiCity === city
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'pm25', label: 'PM2.5 (µg/m³)' },
                    { key: 'pm10', label: 'PM10 (µg/m³)' },
                    { key: 'no2', label: 'NO2 (µg/m³)' },
                    { key: 'so2', label: 'SO2 (µg/m³)' },
                  ].map((field) => (
                    <label key={field.key} className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                      {field.label}
                      <input
                        type="number"
                        min={0}
                        max={600}
                        value={aqiInputs[field.key as keyof typeof aqiInputs]}
                        onChange={(e) =>
                          setAqiInputs((prev) => ({
                            ...prev,
                            [field.key]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 font-mono text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runPythonSolver('aqi', { city: aqiCity, ...aqiInputs })}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{busy ? 'Calculating...' : 'Calculate CPCB AQI'}</span>
                </button>
              </div>

              <div className="border-t border-stone-200 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-800">
                {aqiResult ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          {aqiResult.engine}
                        </span>
                        <h4 className="mt-1 font-display text-2xl font-bold text-stone-950 dark:text-zinc-50">
                          {aqiResult.city} · AQI {aqiResult.aqi}
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-zinc-300">
                          Band: {aqiResult.category} · Dominant: {aqiResult.dominantPollutant}
                        </p>
                      </div>
                      <div className="text-right font-mono text-xs text-stone-500 dark:text-zinc-400">
                        <div>Mean 6-City AQI: {aqiResult.nationalBenchmark.meanAqi}</div>
                        <div>PM2.5–NO2 r = {aqiResult.nationalBenchmark.pm25No2PearsonR}</div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {aqiResult.cityComparison.map((row) => (
                        <div key={row.city} className="grid grid-cols-12 items-center gap-3 text-xs">
                          <span className="col-span-3 font-medium text-stone-800 dark:text-zinc-200">
                            {row.city}
                          </span>
                          <div className="col-span-6 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-emerald-700 dark:bg-emerald-500"
                              style={{ width: `${Math.min(100, (row.aqi / 350) * 100)}%` }}
                            />
                          </div>
                          <span className="col-span-3 text-right font-mono text-stone-600 tabular-nums dark:text-zinc-400">
                            {row.aqi} · {row.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Loading Python AQI analyzer...</p>
                )}
              </div>
            </>
          )}

          {/* AMBULANCE CORRIDOR SIMULATOR */}
          {activeTab === 'ambulance' && (
            <>
              <div className="space-y-5 lg:col-span-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-950 dark:text-zinc-100">
                    Emergency Corridor Parameters
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                    Simulate Dijkstra shortest-path routing with green-wave signal preemption.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                    Origin Node
                    <select
                      value={ambulanceInputs.origin}
                      onChange={(e) =>
                        setAmbulanceInputs((prev) => ({ ...prev, origin: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="Dispatch Hub">Dispatch Hub</option>
                      <option value="MG Road Junction">MG Road Junction</option>
                      <option value="Richmond Circle">Richmond Circle</option>
                    </select>
                  </label>

                  <label className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                    Hospital Destination
                    <select
                      value={ambulanceInputs.destination}
                      onChange={(e) =>
                        setAmbulanceInputs((prev) => ({ ...prev, destination: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      <option value="Manipal Hospital">Manipal Hospital</option>
                      <option value="St. Martha's Hospital">St. Martha&apos;s Hospital</option>
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                      Congestion Multiplier
                      <input
                        type="number"
                        step="0.1"
                        min={1}
                        max={2.5}
                        value={ambulanceInputs.congestion_factor}
                        onChange={(e) =>
                          setAmbulanceInputs((prev) => ({
                            ...prev,
                            congestion_factor: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 font-mono text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>
                    <label className="block text-xs font-medium text-stone-600 dark:text-zinc-400">
                      Preemption Efficiency
                      <input
                        type="number"
                        step="0.05"
                        min={0.5}
                        max={0.95}
                        value={ambulanceInputs.preemption_efficiency}
                        onChange={(e) =>
                          setAmbulanceInputs((prev) => ({
                            ...prev,
                            preemption_efficiency: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-[#F9F9F6] px-3 py-2 font-mono text-xs text-stone-900 focus:border-emerald-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runPythonSolver('ambulance', ambulanceInputs)}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{busy ? 'Routing...' : 'Simulate Green-Wave Corridor'}</span>
                </button>
              </div>

              <div className="border-t border-stone-200 pt-6 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-800">
                {ambulanceResult ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          {ambulanceResult.engine}
                        </span>
                        <h4 className="mt-1 font-display text-2xl font-bold text-stone-950 dark:text-zinc-50">
                          {ambulanceResult.greenWaveTransitMin} min Green-Wave ETA
                        </h4>
                        <p className="text-sm text-stone-600 dark:text-zinc-300">
                          Normal signalized transit: {ambulanceResult.normalTransitMin} min
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold text-emerald-800 tabular-nums dark:text-emerald-400">
                          -{ambulanceResult.timeSavedSec}s saved
                        </div>
                        <div className="font-mono text-xs text-stone-500 dark:text-zinc-400">
                          {ambulanceResult.timeSavedPct}% faster · {ambulanceResult.intersectionsPreempted} signals
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-[#F9F9F6] p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                        Optimal Dijkstra Route Sequence
                      </div>
                      <p className="mt-2 font-mono text-xs leading-relaxed text-stone-800 dark:text-zinc-200">
                        {ambulanceResult.route.join(' → ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">Loading Python corridor router...</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
