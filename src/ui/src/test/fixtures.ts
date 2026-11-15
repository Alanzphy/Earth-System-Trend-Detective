import type { AnalysisResponse, TrendResult, Variable } from "../types/contracts";

export const VARIABLES: Variable[] = [
  {
    id: "temperature_2m",
    name: "Air temperature at 2 m",
    units: "°C",
    description: "How warm or cold the air is near the ground.",
    category: "temperature",
    palette: "RdBu",
    source: "NASA POWER",
    source_parameter: "T2M",
    available_from: "1981-01",
    available_to: "2025-12",
  },
  {
    id: "precipitation",
    name: "Precipitation",
    units: "mm/day",
    description: "Water falling as rain or snow.",
    category: "water",
    palette: "BrBG",
    source: "NASA POWER",
    source_parameter: "PRECTOTCORR",
    available_from: "1981-01",
    available_to: "2025-12",
  },
  {
    id: "solar_radiation",
    name: "Surface solar radiation",
    units: "kWh/m²/day",
    description: "Energy from the Sun reaching the surface.",
    category: "energy",
    palette: "RdBu",
    source: "NASA POWER",
    source_parameter: "ALLSKY_SFC_SW_DWN",
    available_from: "1984-01",
    available_to: "2025-12",
  },
];

const TREND: TrendResult = {
  method: "Theil–Sen slope + Mann–Kendall (Hamed–Rao)",
  deseasonalized: true,
  slope_per_decade: 0.26,
  slope_units: "°C/decade",
  ci_low: 0.2,
  ci_high: 0.32,
  p_value: 0.0002,
  alpha: 0.05,
  significant: true,
  direction: "increasing",
  total_change: 1.17,
  n: 540,
  period_start: "1981-01",
  period_end: "2025-12",
};

export function makeAnalysis(trend: Partial<TrendResult> = {}, verdict?: string): AnalysisResponse {
  const time = ["1981-01", "1981-02", "1981-03"];
  return {
    series: {
      variable: "temperature_2m",
      units: "°C",
      bbox: { min_lon: -10, min_lat: 36, max_lon: 3, max_lat: 44 },
      resolution: "monthly",
      time,
      values: [8.1, 9.0, 11.2],
      source: "NASA POWER",
      grid_points: 357,
    },
    anomalies: [0.1, -0.2, 0.05],
    trend_line: [-0.01, 0, 0.01],
    trend: { ...TREND, ...trend },
    verdict:
      verdict ??
      "Air temperature at 2 m increased by about 0.26 °C per decade (1981–2025). This trend is statistically significant (p < 0.001): it is very unlikely to be just chance.",
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
