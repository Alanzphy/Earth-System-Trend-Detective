import type { TrendResult } from "../types/contracts";

export type VerdictHeadline = {
  icon: "↑" | "↓" | "→";
  text: string;
  significant: boolean;
};

/**
 * Only call a trend significant when the API says so AND p < alpha;
 * otherwise the headline never claims a direction as real.
 */
export function verdictHeadline(trend: TrendResult): VerdictHeadline {
  const significant = trend.significant && trend.p_value < trend.alpha;

  if (!significant || trend.direction === "no trend") {
    return { icon: "→", text: "No clear trend", significant: false };
  }
  return trend.direction === "increasing"
    ? { icon: "↑", text: "Increasing", significant: true }
    : { icon: "↓", text: "Decreasing", significant: true };
}

export function significanceText(significant: boolean, alpha: number): string {
  return significant
    ? `Statistically significant (p < ${alpha})`
    : `Not statistically significant (p ≥ ${alpha})`;
}
