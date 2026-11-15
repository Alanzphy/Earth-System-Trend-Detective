import { afterEach, describe, expect, it, vi } from "vitest";
import realManifest from "../../public/trend-maps/manifest.json?raw";
import precipitationGeojson from "../../public/trend-maps/precipitation-1981-2025.geojson?raw";
import { formatPValue } from "./format";
import type { TrendMapEntry } from "../types/contracts";
import {
  cellPropertiesFromRendered,
  formatBbox,
  formatSlope,
  loadTrendMapManifest,
  parseTrendCellCollection,
  parseTrendMapManifest,
  significanceLabel,
  toRegionSelection,
} from "./trendMaps";

const entry: TrendMapEntry = {
  id: "precipitation",
  title: "Precipitation trends",
  variable: "precipitation",
  units: "mm/day",
  slope_units: "mm/day/decade",
  period: ["1981-01", "2025-12"],
  palette: "BrBG",
  cell_size_deg: 2,
  file: "precipitation.geojson",
  legend: { min: -0.12, max: 0.12 },
  alpha: 0.05,
  fdr: true,
  is_sample: false,
};

const manifest = { version: 2, generated_at: "2026-11-14T00:00:00Z", maps: [entry] };

const cell = {
  id: "western-sahel",
  label: "Western Sahel",
  slope: 0.028,
  p_value: 0.036,
  significant: true,
  bbox: [-17, 12, -2, 18] as [number, number, number, number],
};

const featureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-17, 12],
            [-2, 12],
            [-2, 18],
            [-17, 18],
            [-17, 12],
          ],
        ],
      },
      properties: cell,
    },
  ],
};

describe("trend map manifest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a valid v2 manifest", () => {
    expect(parseTrendMapManifest(manifest)).toEqual(manifest);
  });

  it("parses the shipped manifest: two real maps with their palettes", () => {
    const parsed = parseTrendMapManifest(JSON.parse(realManifest));
    expect(parsed.maps.map((map) => [map.variable, map.palette, map.is_sample])).toEqual([
      ["temperature_2m", "RdBu", false],
      ["precipitation", "BrBG", false],
    ]);
    expect(parsed.maps.every((map) => map.fdr && map.cell_size_deg === 2.5)).toBe(true);
  });

  it("parses the shipped precipitation GeoJSON against the contract", () => {
    const collection = parseTrendCellCollection(JSON.parse(precipitationGeojson));
    expect(collection.features).toHaveLength(7488);
    expect(collection.features.some((feature) => feature.properties.significant)).toBe(true);
    expect(collection.features.some((feature) => !feature.properties.significant)).toBe(true);
  });

  it("defaults is_sample to false when omitted", () => {
    const withoutFlag: Partial<TrendMapEntry> = { ...entry };
    delete withoutFlag.is_sample;
    expect(parseTrendMapManifest({ ...manifest, maps: [withoutFlag] }).maps[0].is_sample).toBe(
      false,
    );
  });

  it("rejects v1 manifests", () => {
    expect(() => parseTrendMapManifest({ ...manifest, version: 1 })).toThrow("version 2");
  });

  it("rejects a manifest without maps", () => {
    expect(() => parseTrendMapManifest({ ...manifest, maps: [] })).toThrow("at least one map");
  });

  it("rejects a legend that does not span zero", () => {
    expect(() =>
      parseTrendMapManifest({ ...manifest, maps: [{ ...entry, legend: { min: 0.01, max: 1 } }] }),
    ).toThrow("span zero");
  });

  it("rejects an unknown palette", () => {
    expect(() =>
      parseTrendMapManifest({ ...manifest, maps: [{ ...entry, palette: "Viridis" }] }),
    ).toThrow("palette");
  });

  it("loads and validates the manifest", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => manifest,
    } as Response);

    await expect(loadTrendMapManifest("/")).resolves.toEqual(manifest);
  });

  it("rejects a failed manifest request", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    await expect(loadTrendMapManifest("/")).rejects.toThrow("503");
  });
});

describe("trend map data", () => {
  it("parses a FeatureCollection", () => {
    expect(parseTrendCellCollection(featureCollection)).toEqual(featureCollection);
  });

  it("rejects features without a p_value", () => {
    const withoutP: Partial<typeof cell> = { ...cell };
    delete withoutP.p_value;
    expect(() =>
      parseTrendCellCollection({
        ...featureCollection,
        features: [{ ...featureCollection.features[0], properties: withoutP }],
      }),
    ).toThrow("p_value");
  });

  it("rejects features without a valid bbox", () => {
    expect(() =>
      parseTrendCellCollection({
        ...featureCollection,
        features: [
          { ...featureCollection.features[0], properties: { ...cell, bbox: [0, 0, 1] } },
        ],
      }),
    ).toThrow("bbox");
  });

  it("restores properties serialized by MapLibre", () => {
    expect(cellPropertiesFromRendered({ ...cell, bbox: JSON.stringify(cell.bbox) })).toEqual(cell);
  });
});

describe("trend map formatting", () => {
  it("formats positive and negative slopes", () => {
    expect(formatSlope(0.028, "mm/day/decade")).toBe("+0.028 mm/day/decade");
    expect(formatSlope(-0.111, "mm/day/decade")).toBe("-0.111 mm/day/decade");
  });

  it("formats p-values, significance and bbox values", () => {
    expect(formatPValue(0.0004)).toBe("p < 0.001");
    expect(formatPValue(0.036)).toBe("p = 0.036");
    expect(significanceLabel(true)).toBe("Statistically significant");
    expect(significanceLabel(false)).toBe("Not significant");
    expect(formatBbox([-17, 12, -2, 18])).toBe("-17.0, 12.0, -2.0, 18.0");
  });

  it("builds a region selection with variable metadata", () => {
    expect(toRegionSelection(cell, entry)).toEqual({
      ...cell,
      variable: "precipitation",
      units: "mm/day",
      slope_units: "mm/day/decade",
      period: ["1981-01", "2025-12"],
      palette: "BrBG",
    });
  });
});
