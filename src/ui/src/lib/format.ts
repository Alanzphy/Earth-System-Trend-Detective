import type { BBox } from "../types/contracts";

/** Same rule as the API verdict: 2 significant figures, truncated, so p = 0.0499 never reads 0.05. */
export function formatPValue(pValue: number): string {
  if (pValue < 0.001) {
    return "p < 0.001";
  }
  const decimals = 1 - Math.floor(Math.log10(pValue));
  const scale = 10 ** decimals;
  return `p = ${(Math.floor(pValue * scale + 1e-9) / scale).toFixed(decimals)}`;
}

/** Number with enough decimals for small climate slopes, and an explicit sign. */
export function formatSigned(value: number): string {
  const magnitude = Math.abs(value);
  const decimals = magnitude >= 10 ? 1 : magnitude >= 1 ? 2 : 3;
  const text = value.toFixed(decimals);
  return value > 0 ? `+${text}` : text;
}

function formatCoordinate(value: number, positive: string, negative: string): string {
  const hemisphere = value > 0 ? positive : value < 0 ? negative : "";
  return `${Math.abs(value)}°${hemisphere}`;
}

/** "10°W to 3°E, 36°N to 44°N" */
export function formatRegion(bbox: BBox): string {
  const lon = `${formatCoordinate(bbox.min_lon, "E", "W")} to ${formatCoordinate(bbox.max_lon, "E", "W")}`;
  const lat = `${formatCoordinate(bbox.min_lat, "N", "S")} to ${formatCoordinate(bbox.max_lat, "N", "S")}`;
  return `${lon}, ${lat}`;
}

/** Number of months from start to end inclusive (YYYY-MM). */
export function monthsBetween(start: string, end: string): number {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}
