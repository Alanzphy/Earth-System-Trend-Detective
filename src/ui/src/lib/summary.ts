import type { TrendResult } from "../types/contracts";
import { isRecord } from "./guards";
import { assetUrl } from "./trendMaps";
import type { VariableId } from "./variables";

/** public/regions/summary.json, written by `uv run python -m pipeline regions`. */
export type SummaryVariable = Pick<
  TrendResult,
  "total_change" | "slope_per_decade" | "slope_units" | "p_value" | "alpha" | "significant" | "direction" | "period_start" | "period_end"
> & { mean: number };

export type PlaceSummaryNumbers = {
  name: string;
  temperature_annual: Array<{ year: string; value: number }>;
  variables: Record<VariableId, SummaryVariable>;
};

export type RegionsSummary = { version: 1; generated_at: string; regions: Record<string, PlaceSummaryNumbers> };

export async function loadSummary(baseUrl = import.meta.env.BASE_URL): Promise<RegionsSummary> {
  const response = await fetch(assetUrl("regions/summary.json", baseUrl));
  if (!response.ok) {
    throw new Error(`Could not load the cases (${response.status})`);
  }
  const value: unknown = await response.json();
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.regions)) {
    throw new Error("Invalid summary: expected version 1 with regions");
  }
  return value as RegionsSummary;
}
