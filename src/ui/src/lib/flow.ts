import type { BBox } from "../types/contracts";

export const DEFAULT_START = "1981-01";
export const DEFAULT_END = "2025-12";
export const MIN_BOX_DEGREES = 2;
// The API rejects boxes wider or taller than this (protects the free-tier backend).
export const MAX_BOX_DEGREES = 40;

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
