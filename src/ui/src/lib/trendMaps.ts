import type {
  Palette,
  TrendCellProperties,
  TrendMapEntry,
  TrendMapManifest,
} from "../types/contracts";
import { isRecord } from "./guards";

export type TrendCellFeature = {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: TrendCellProperties;
};

export type TrendCellCollection = {
  type: "FeatureCollection";
  features: TrendCellFeature[];
};

export type TrendRegionSelection = TrendCellProperties & {
  variable: string;
  units: string;
  slope_units: string;
  period: [string, string];
  palette: Palette;
};

const TREND_MAPS_DIR = "trend-maps";
const MANIFEST_VERSION = 2;
const PALETTE_IDS: Palette[] = ["RdBu", "BrBG"];
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function assetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${path.replace(/^\//, "")}`;
}

export async function loadTrendMapManifest(
  baseUrl = import.meta.env.BASE_URL,
): Promise<TrendMapManifest> {
  const response = await fetch(assetUrl(`${TREND_MAPS_DIR}/manifest.json`, baseUrl));

  if (!response.ok) {
    throw new Error(`Could not load trend map manifest (${response.status})`);
  }

  return parseTrendMapManifest(await response.json());
}

export async function loadTrendMapData(
  entry: TrendMapEntry,
  baseUrl = import.meta.env.BASE_URL,
): Promise<TrendCellCollection> {
  const response = await fetch(assetUrl(`${TREND_MAPS_DIR}/${entry.file}`, baseUrl));

  if (!response.ok) {
    throw new Error(`Could not load trend map data (${response.status})`);
  }

  return parseTrendCellCollection(await response.json());
}

export function parseTrendMapManifest(value: unknown): TrendMapManifest {
  if (!isRecord(value)) {
    throw new Error("Invalid trend map manifest: expected an object");
  }

  if (value.version !== MANIFEST_VERSION) {
    throw new Error(`Invalid trend map manifest: expected version ${MANIFEST_VERSION}`);
  }

  if (!Array.isArray(value.maps) || value.maps.length === 0) {
    throw new Error("Invalid trend map manifest: expected at least one map");
  }

  return {
    version: MANIFEST_VERSION,
    generated_at: requiredString(value, "generated_at"),
    maps: value.maps.map((entry) => parseTrendMapEntry(entry)),
  };
}

export function parseTrendCellCollection(value: unknown): TrendCellCollection {
  if (!isRecord(value) || value.type !== "FeatureCollection") {
    throw new Error("Invalid trend map data: expected a FeatureCollection");
  }

  if (!Array.isArray(value.features)) {
    throw new Error("Invalid trend map data: missing features");
  }

  return {
    type: "FeatureCollection",
    features: value.features.map((feature) => parseTrendCellFeature(feature)),
  };
}

export function formatSlope(slope: number, slopeUnits: string): string {
  const sign = slope > 0 ? "+" : "";
  return `${sign}${slope.toFixed(3)} ${slopeUnits}`;
}

export function significanceLabel(significant: boolean): string {
  return significant ? "Statistically significant" : "Not significant";
}

export function formatBbox(bbox: readonly number[]): string {
  return bbox.map((value) => value.toFixed(1)).join(", ");
}

export function toRegionSelection(
  properties: TrendCellProperties,
  entry: TrendMapEntry,
): TrendRegionSelection {
  return {
    ...properties,
    variable: entry.variable,
    units: entry.units,
    slope_units: entry.slope_units,
    period: entry.period,
    palette: entry.palette,
  };
}

/**
 * MapLibre serializes nested feature properties (such as `bbox`) to JSON strings
 * in `queryRenderedFeatures`, so parse them back before use.
 */
export function cellPropertiesFromRendered(
  properties: Record<string, unknown>,
): TrendCellProperties {
  const bbox =
    typeof properties.bbox === "string" ? (JSON.parse(properties.bbox) as unknown) : properties.bbox;
  return parseCellProperties({ ...properties, bbox });
}

function parseTrendMapEntry(value: unknown): TrendMapEntry {
  if (!isRecord(value)) {
    throw new Error("Invalid trend map manifest: map entry must be an object");
  }

  const period = value.period;
  if (
    !Array.isArray(period) ||
    period.length !== 2 ||
    !period.every((month) => typeof month === "string" && YEAR_MONTH.test(month))
  ) {
    throw new Error("Invalid trend map manifest: period must be two YYYY-MM months");
  }

  const palette = value.palette;
  if (!PALETTE_IDS.includes(palette as Palette)) {
    throw new Error("Invalid trend map manifest: palette must be RdBu or BrBG");
  }

  if (!isRecord(value.legend)) {
    throw new Error("Invalid trend map manifest: missing legend");
  }

  const min = requiredNumber(value.legend, "min");
  const max = requiredNumber(value.legend, "max");
  if (!(min < 0 && 0 < max)) {
    throw new Error("Invalid trend map manifest: legend must span zero (min < 0 < max)");
  }

  const cellSize = requiredNumber(value, "cell_size_deg");
  if (cellSize <= 0) {
    throw new Error("Invalid trend map manifest: cell_size_deg must be positive");
  }

  const alpha = requiredNumber(value, "alpha");
  if (alpha <= 0 || alpha >= 1) {
    throw new Error("Invalid trend map manifest: alpha must be between 0 and 1");
  }

  return {
    id: requiredString(value, "id"),
    title: requiredString(value, "title"),
    variable: requiredString(value, "variable"),
    units: requiredString(value, "units"),
    slope_units: requiredString(value, "slope_units"),
    period: [period[0] as string, period[1] as string],
    palette: palette as Palette,
    cell_size_deg: cellSize,
    file: requiredString(value, "file"),
    legend: { min, max },
    alpha,
    fdr: requiredBoolean(value, "fdr"),
    is_sample: value.is_sample === undefined ? false : requiredBoolean(value, "is_sample"),
  };
}

function parseTrendCellFeature(value: unknown): TrendCellFeature {
  if (!isRecord(value) || value.type !== "Feature") {
    throw new Error("Invalid trend map data: feature must be a Feature");
  }

  if (!isRecord(value.geometry) || value.geometry.type !== "Polygon") {
    throw new Error("Invalid trend map data: geometry must be a Polygon");
  }

  if (!Array.isArray(value.geometry.coordinates)) {
    throw new Error("Invalid trend map data: missing coordinates");
  }

  if (!isRecord(value.properties)) {
    throw new Error("Invalid trend map data: missing properties");
  }

  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: value.geometry.coordinates as number[][][] },
    properties: parseCellProperties(value.properties),
  };
}

function parseCellProperties(properties: Record<string, unknown>): TrendCellProperties {
  const bbox = properties.bbox;
  if (
    !Array.isArray(bbox) ||
    bbox.length !== 4 ||
    bbox.some((coordinate) => typeof coordinate !== "number") ||
    bbox[0] >= bbox[2] ||
    bbox[1] >= bbox[3]
  ) {
    throw new Error("Invalid trend map data: bbox must be [minLon, minLat, maxLon, maxLat]");
  }

  const pValue = requiredNumber(properties, "p_value");
  if (pValue < 0 || pValue > 1) {
    throw new Error("Invalid trend map data: p_value must be between 0 and 1");
  }

  return {
    id: requiredString(properties, "id"),
    label: requiredString(properties, "label"),
    slope: requiredNumber(properties, "slope"),
    p_value: pValue,
    significant: requiredBoolean(properties, "significant"),
    bbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
  };
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid trend map data: ${key} must be a string`);
  }
  return value;
}

function requiredNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Invalid trend map data: ${key} must be a number`);
  }
  return value;
}

function requiredBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new Error(`Invalid trend map data: ${key} must be a boolean`);
  }
  return value;
}
