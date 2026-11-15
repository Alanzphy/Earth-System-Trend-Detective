import type { AnalysisResponse, TrendResult } from "../types/contracts";
import type { VariableId } from "./variables";
import { verdictHeadline } from "./verdict";

export type PlainChange = {
  /** The figure a student remembers, e.g. "+2.3 °C" or "−153 mm". */
  figure: string;
  /** What the figure means, e.g. "warmer since 1981". */
  caption: string;
};

function signed(value: number, digits: number): string {
  const text = Math.abs(value).toFixed(digits);
  if (Number(text) === 0) {
    return text;
  }
  return value > 0 ? `+${text}` : `−${text}`;
}

export function seriesMean(analysis: AnalysisResponse): number {
  const values = analysis.series.values.filter((value): value is number => value !== null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.NaN;
}

/** The trend fields the plain-language figures need; both full analyses and the summary have them. */
export type ChangeTrend = Pick<TrendResult, "total_change" | "period_start">;

/**
 * The total change over the analysed period in units a student can picture. Uses the
 * API's own total_change (trend × period), so the card never disagrees with the verdict.
 */
export function plainChange(variable: VariableId, analysis: AnalysisResponse): PlainChange {
  return plainChangeOf(variable, analysis.trend, seriesMean(analysis));
}

export function plainChangeOf(variable: VariableId, trend: ChangeTrend, mean: number): PlainChange {
  const { total_change: total, period_start: start } = trend;
  const since = `since ${start.slice(0, 4)}`;

  if (variable === "temperature_2m") {
    return { figure: `${signed(total, 1)} °C`, caption: total >= 0 ? `warmer ${since}` : `cooler ${since}` };
  }
  const percent = mean ? (total / mean) * 100 : 0;
  if (variable === "precipitation") {
    return {
      figure: `${signed(total * 365, 0)} mm`,
      caption: `${total >= 0 ? "more" : "less"} rain per year ${since} (${signed(percent, 0)}%)`,
    };
  }
  if (variable === "relative_humidity_2m") {
    return { figure: `${signed(total, 0)} pts`, caption: `relative humidity ${since}` };
  }
  return { figure: `${signed(percent, 0)}%`, caption: since };
}

export function isSignificant(analysis: AnalysisResponse): boolean {
  return verdictHeadline(analysis.trend).significant;
}

/** Mean anomaly per complete calendar year, for the warming stripes. */
export function annualAnomalies(analysis: AnalysisResponse): Array<{ year: string; value: number }> {
  const years = new Map<string, number[]>();
  analysis.series.time.forEach((month, index) => {
    const value = analysis.anomalies[index];
    if (value === null || value === undefined) {
      return;
    }
    const year = month.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), value]);
  });
  return [...years.entries()]
    .filter(([, values]) => values.length === 12)
    .map(([year, values]) => ({ year, value: values.reduce((sum, value) => sum + value, 0) / 12 }));
}
