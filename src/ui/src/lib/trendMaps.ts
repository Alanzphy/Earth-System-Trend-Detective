export type TrendMapLegend = {
  min: number;
  max: number;
  breaks?: number[];
};

export type TrendMapManifestEntry = {
  id: string;
  title: string;
  variable: string;
  units: string;
  period: [string, string];
  slopeUnits: string;
  file: string;
  legend: TrendMapLegend;
  isSample?: boolean;
};

export type TrendMapManifest = {
  version: number;
  isSample?: boolean;
  maps: TrendMapManifestEntry[];
};

export type TrendRegionProperties = {
  id: string;
  label: string;
  slope: number;
  significant: boolean;
  bbox: [number, number, number, number];
};

export type TrendPolygonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export type TrendFeature = {
  type: "Feature";
  geometry: TrendPolygonGeometry;
  properties: TrendRegionProperties;
};

export type TrendFeatureCollection = {
  type: "FeatureCollection";
  features: TrendFeature[];
};

export type TrendRegionSelection = TrendRegionProperties & {
  variable: string;
  units: string;
  slopeUnits: string;
  period: [string, string];
};

const TREND_MAPS_DIR = "trend-maps";

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
  entry: TrendMapManifestEntry,
  baseUrl = import.meta.env.BASE_URL,
): Promise<TrendFeatureCollection> {
  const response = await fetch(assetUrl(`${TREND_MAPS_DIR}/${entry.file}`, baseUrl));

  if (!response.ok) {
    throw new Error(`Could not load trend map data (${response.status})`);
  }

  return parseTrendFeatureCollection(await response.json());
}

export function parseTrendMapManifest(value: unknown): TrendMapManifest {
  if (!isRecord(value)) {
    throw new Error("Invalid trend map manifest: expected an object");
  }

  const version = value.version;
  if (typeof version !== "number") {
    throw new Error("Invalid trend map manifest: missing version");
  }

  if (!Array.isArray(value.maps) || value.maps.length === 0) {
    throw new Error("Invalid trend map manifest: expected at least one map");
  }

  return {
    version,
    isSample: typeof value.isSample === "boolean" ? value.isSample : undefined,
    maps: value.maps.map((entry) => parseTrendMapEntry(entry)),
  };
}

export function parseTrendFeatureCollection(value: unknown): TrendFeatureCollection {
  if (!isRecord(value) || value.type !== "FeatureCollection") {
    throw new Error("Invalid trend map data: expected a FeatureCollection");
  }

  if (!Array.isArray(value.features)) {
    throw new Error("Invalid trend map data: missing features");
  }

  return {
    type: "FeatureCollection",
    features: value.features.map((feature) => parseTrendFeature(feature)),
  };
}

export function formatSlope(slope: number, slopeUnits: string): string {
  const sign = slope > 0 ? "+" : "";
  return `${sign}${slope.toFixed(2)} ${slopeUnits}`;
}

export function significanceLabel(significant: boolean): string {
  return significant ? "Statistically significant" : "Not significant";
}

export function formatBbox(bbox: [number, number, number, number]): string {
  return bbox.map((value) => value.toFixed(1)).join(", ");
}

export function toRegionSelection(
  properties: TrendRegionProperties,
  entry: TrendMapManifestEntry,
): TrendRegionSelection {
  return {
    ...properties,
    variable: entry.variable,
    units: entry.units,
    slopeUnits: entry.slopeUnits,
    period: entry.period,
  };
}

export function colorForSlope(slope: number, legend: TrendMapLegend): string {
  const min = Math.min(legend.min, 0);
  const max = Math.max(legend.max, 0);

  if (slope <= min) {
    return "#2166ac";
  }
  if (slope >= max) {
    return "#b2182b";
  }
  if (slope < 0) {
    return interpolateColor("#2166ac", "#f7f7f7", (slope - min) / (0 - min));
  }
  return interpolateColor("#f7f7f7", "#b2182b", slope / max);
}

function parseTrendMapEntry(value: unknown): TrendMapManifestEntry {
  if (!isRecord(value)) {
    throw new Error("Invalid trend map manifest: map entry must be an object");
  }

  const period = value.period;
  if (
    !Array.isArray(period) ||
    period.length !== 2 ||
    typeof period[0] !== "string" ||
    typeof period[1] !== "string"
  ) {
    throw new Error("Invalid trend map manifest: period must have two ISO dates");
  }

  if (!isRecord(value.legend)) {
    throw new Error("Invalid trend map manifest: missing legend");
  }

  const min = value.legend.min;
  const max = value.legend.max;
  if (typeof min !== "number" || typeof max !== "number" || min >= max) {
    throw new Error("Invalid trend map manifest: legend min must be lower than max");
  }

  return {
    id: requiredString(value, "id"),
    title: requiredString(value, "title"),
    variable: requiredString(value, "variable"),
    units: requiredString(value, "units"),
    period: [period[0], period[1]],
    slopeUnits: requiredString(value, "slopeUnits"),
    file: requiredString(value, "file"),
    legend: {
      min,
      max,
      breaks: Array.isArray(value.legend.breaks)
        ? value.legend.breaks.filter((tick): tick is number => typeof tick === "number")
        : undefined,
    },
    isSample: typeof value.isSample === "boolean" ? value.isSample : undefined,
  };
}

function parseTrendFeature(value: unknown): TrendFeature {
  if (!isRecord(value) || value.type !== "Feature") {
    throw new Error("Invalid trend map data: feature must be a Feature");
  }

  if (!isRecord(value.geometry)) {
    throw new Error("Invalid trend map data: missing geometry");
  }

  const geometryType = value.geometry.type;
  if (geometryType !== "Polygon" && geometryType !== "MultiPolygon") {
    throw new Error("Invalid trend map data: geometry must be Polygon or MultiPolygon");
  }

  if (!isRecord(value.properties)) {
    throw new Error("Invalid trend map data: missing properties");
  }

  const bbox = value.properties.bbox;
  if (
    !Array.isArray(bbox) ||
    bbox.length !== 4 ||
    bbox.some((coordinate) => typeof coordinate !== "number")
  ) {
    throw new Error("Invalid trend map data: bbox must have four numbers");
  }

  return {
    type: "Feature",
    geometry: value.geometry as TrendPolygonGeometry,
    properties: {
      id: requiredString(value.properties, "id"),
      label: requiredString(value.properties, "label"),
      slope: requiredNumber(value.properties, "slope"),
      significant: requiredBoolean(value.properties, "significant"),
      bbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
    },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function interpolateColor(start: string, end: string, amount: number): string {
  const clamped = Math.max(0, Math.min(1, amount));
  const from = hexToRgb(start);
  const to = hexToRgb(end);
  const channels = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * clamped),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}
