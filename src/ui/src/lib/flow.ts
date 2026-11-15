import type { BBox, TrendRequest, Variable, VariableCategory } from "../types/contracts";

export const TOPICS: Array<{ category: VariableCategory; label: string; question: string }> = [
  { category: "temperature", label: "Temperature", question: "Is it getting warmer or colder?" },
  { category: "water", label: "Water", question: "Is it getting wetter or drier?" },
  { category: "air", label: "Air", question: "Is the wind changing?" },
  { category: "energy", label: "Energy", question: "Is more or less sunlight reaching the ground?" },
  { category: "soil", label: "Soil", question: "Is the soil getting wetter or drier?" },
];

// Example regions from docs/product.md.
export const EXAMPLE_REGIONS: Array<{ id: string; name: string; kind: string; bbox: BBox }> = [
  { id: "iberia", name: "Iberian Peninsula", kind: "Demo 1", bbox: box(-10, 36, 3, 44) },
  { id: "western-sahel", name: "Western Sahel", kind: "Demo 2A", bbox: box(-17, 12, -2, 18) },
  { id: "central-chile", name: "Central Chile", kind: "Demo 2B", bbox: box(-73, -38, -70, -30) },
  { id: "western-sahara", name: "Western Sahara", kind: "Desert", bbox: box(-15, 15, 5, 30) },
  { id: "central-amazon", name: "Central Amazon", kind: "Rainforest", bbox: box(-70, -10, -55, 0) },
  { id: "rio-de-la-plata", name: "Río de la Plata", kind: "Estuary", bbox: box(-59, -36, -55, -33) },
  { id: "madrid", name: "Madrid area", kind: "City", bbox: box(-4.75, 39.4, -2.75, 41.4) },
];

export const DEFAULT_START = "1981-01";
export const DEFAULT_END = "2025-12";
export const MIN_BOX_DEGREES = 2;
// The API rejects boxes wider or taller than this (protects the free-tier backend).
export const MAX_BOX_DEGREES = 40;

export type FlowState = {
  variable: string | null;
  bbox: BBox | null;
  start: string;
  end: string;
  /** Second region when comparing; same variable and period. */
  compare: BBox | null;
};

export const EMPTY_FLOW: FlowState = {
  variable: null,
  bbox: null,
  start: DEFAULT_START,
  end: DEFAULT_END,
  compare: null,
};

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function box(minLon: number, minLat: number, maxLon: number, maxLat: number): BBox {
  return { min_lon: minLon, min_lat: minLat, max_lon: maxLon, max_lat: maxLat };
}

export function bboxToParam(bbox: BBox): string {
  return [bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat].join(",");
}

export function parseBboxParam(value: string | null): BBox | null {
  if (!value) {
    return null;
  }
  const parts = value.split(",").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  const bbox = box(parts[0], parts[1], parts[2], parts[3]);
  return bboxError(bbox) ? null : bbox;
}

/** Reads `variable`, `bbox`, `start`, `end` and `compare` from a query string. */
export function parseFlowState(search: string): FlowState {
  const params = new URLSearchParams(search);
  const start = params.get("start");
  const end = params.get("end");
  return {
    variable: params.get("variable") || null,
    bbox: parseBboxParam(params.get("bbox")),
    start: start && YEAR_MONTH.test(start) ? start : DEFAULT_START,
    end: end && YEAR_MONTH.test(end) ? end : DEFAULT_END,
    compare: parseBboxParam(params.get("compare")),
  };
}

export function serializeFlowState(state: FlowState): string {
  const params = new URLSearchParams();
  if (state.variable) {
    params.set("variable", state.variable);
  }
  if (state.bbox) {
    params.set("bbox", bboxToParam(state.bbox));
  }
  params.set("start", state.start);
  params.set("end", state.end);
  if (state.compare) {
    params.set("compare", bboxToParam(state.compare));
  }
  return params.toString();
}

/** Returns a message when the box is not a valid lon/lat rectangle. */
export function bboxError(bbox: BBox): string | null {
  const { min_lon, min_lat, max_lon, max_lat } = bbox;
  if ([min_lon, max_lon].some((lon) => lon < -180 || lon > 180)) {
    return "Longitudes must be between -180 and 180.";
  }
  if ([min_lat, max_lat].some((lat) => lat < -90 || lat > 90)) {
    return "Latitudes must be between -90 and 90.";
  }
  if (min_lon >= max_lon || min_lat >= max_lat) {
    return "West must be lower than east, and south lower than north.";
  }
  return null;
}

/** bboxError plus the API's maximum size. */
export function analysisBoxError(bbox: BBox): string | null {
  const error = bboxError(bbox);
  if (error) {
    return error;
  }
  if (
    bbox.max_lon - bbox.min_lon > MAX_BOX_DEGREES ||
    bbox.max_lat - bbox.min_lat > MAX_BOX_DEGREES
  ) {
    return `Boxes can be at most ${MAX_BOX_DEGREES}° × ${MAX_BOX_DEGREES}°. Draw a smaller one.`;
  }
  return null;
}

export function isSmallBox(bbox: BBox): boolean {
  return (
    bbox.max_lon - bbox.min_lon < MIN_BOX_DEGREES || bbox.max_lat - bbox.min_lat < MIN_BOX_DEGREES
  );
}

/** Rectangle from two clicked corners, snapped to 0.25°. */
export function bboxFromCorners(
  first: { lng: number; lat: number },
  second: { lng: number; lat: number },
): BBox {
  const snap = (value: number) => Math.round(value * 4) / 4;
  return box(
    snap(Math.max(-180, Math.min(first.lng, second.lng))),
    snap(Math.max(-90, Math.min(first.lat, second.lat))),
    snap(Math.min(180, Math.max(first.lng, second.lng))),
    snap(Math.min(90, Math.max(first.lat, second.lat))),
  );
}

export function sameBbox(a: BBox, b: BBox): boolean {
  return bboxToParam(a) === bboxToParam(b);
}

export function regionName(bbox: BBox): string {
  return EXAMPLE_REGIONS.find((region) => sameBbox(region.bbox, bbox))?.name ?? "Custom region";
}

/** Keeps the period inside the variable's availability. */
export function clampPeriod(
  state: Pick<FlowState, "start" | "end">,
  variable: Variable,
): Pick<FlowState, "start" | "end"> {
  const start = state.start < variable.available_from ? variable.available_from : state.start;
  const end = state.end > variable.available_to ? variable.available_to : state.end;
  return start < end ? { start, end } : { start: variable.available_from, end: variable.available_to };
}

/** Problems that block the analysis, in the order the student should fix them. */
export function flowErrors(state: FlowState, variable: Variable | undefined): string[] {
  const errors: string[] = [];
  if (!variable) {
    errors.push("Choose a variable.");
  }
  if (!state.bbox) {
    errors.push("Choose a region.");
  } else {
    const error = analysisBoxError(state.bbox);
    if (error) {
      errors.push(`Region: ${error}`);
    }
  }
  if (state.compare) {
    const error = analysisBoxError(state.compare);
    if (error) {
      errors.push(`Second region: ${error}`);
    }
  }
  if (!YEAR_MONTH.test(state.start) || !YEAR_MONTH.test(state.end)) {
    errors.push("Choose a start and end month.");
  } else if (state.start >= state.end) {
    errors.push("The start month must be before the end month.");
  } else if (
    variable &&
    (state.start < variable.available_from || state.end > variable.available_to)
  ) {
    errors.push(
      `${variable.name} is available from ${variable.available_from} to ${variable.available_to}.`,
    );
  }
  return errors;
}

/** One request per region (two when comparing). */
export function trendRequests(
  state: FlowState,
): Array<{ label: string; request: TrendRequest }> {
  if (!state.variable || !state.bbox) {
    return [];
  }
  const regions = state.compare ? [state.bbox, state.compare] : [state.bbox];
  const variable = state.variable;
  return regions.map((bbox, index) => ({
    label: regions.length > 1 ? `Region ${index === 0 ? "A" : "B"}: ${regionName(bbox)}` : regionName(bbox),
    request: { variable, bbox, start: state.start, end: state.end },
  }));
}
