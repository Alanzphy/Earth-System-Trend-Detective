import { afterEach, describe, expect, it, vi } from "vitest";
import {
  colorForSlope,
  formatBbox,
  formatSlope,
  loadTrendMapManifest,
  parseTrendFeatureCollection,
  parseTrendMapManifest,
  significanceLabel,
  toRegionSelection,
  type TrendMapManifestEntry,
} from "./trendMaps";

const entry: TrendMapManifestEntry = {
  id: "sample-precipitation",
  title: "Precipitation trends",
  variable: "precipitation",
  units: "mm/day",
  period: ["1981-01", "2024-12"],
  slopeUnits: "mm/day/decade",
  file: "sample-precipitation.geojson",
  legend: { min: -0.08, max: 0.08, breaks: [-0.08, 0, 0.08] },
  isSample: true,
};

const manifest = { version: 1, isSample: true, maps: [entry] };

const featureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-15, 12],
            [30, 12],
            [30, 18],
            [-15, 18],
            [-15, 12],
          ],
        ],
      },
      properties: {
        id: "sahel",
        label: "Sahel",
        slope: 0.06,
        significant: true,
        bbox: [-15, 12, 30, 18],
      },
    },
  ],
};

describe("trend map manifest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a valid manifest", () => {
    expect(parseTrendMapManifest(manifest)).toEqual(manifest);
  });

  it("rejects a manifest without maps", () => {
    expect(() => parseTrendMapManifest({ version: 1, maps: [] })).toThrow(
      "at least one map",
    );
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
    expect(parseTrendFeatureCollection(featureCollection)).toEqual(featureCollection);
  });

  it("rejects features without a valid bbox", () => {
    expect(() =>
      parseTrendFeatureCollection({
        ...featureCollection,
        features: [
          {
            ...featureCollection.features[0],
            properties: { ...featureCollection.features[0].properties, bbox: [0, 0, 1] },
          },
        ],
      }),
    ).toThrow("bbox");
  });
});

describe("trend map formatting", () => {
  it("formats positive and negative slopes", () => {
    expect(formatSlope(0.06, "mm/day/decade")).toBe("+0.06 mm/day/decade");
    expect(formatSlope(-0.05, "mm/day/decade")).toBe("-0.05 mm/day/decade");
  });

  it("formats significance and bbox values", () => {
    expect(significanceLabel(true)).toBe("Statistically significant");
    expect(significanceLabel(false)).toBe("Not significant");
    expect(formatBbox([-15, 12, 30, 18])).toBe("-15.0, 12.0, 30.0, 18.0");
  });

  it("builds a region selection with variable metadata", () => {
    expect(
      toRegionSelection(
        {
          id: "sahel",
          label: "Sahel",
          slope: 0.06,
          significant: true,
          bbox: [-15, 12, 30, 18],
        },
        entry,
      ),
    ).toEqual({
      id: "sahel",
      label: "Sahel",
      slope: 0.06,
      significant: true,
      bbox: [-15, 12, 30, 18],
      variable: "precipitation",
      units: "mm/day",
      slopeUnits: "mm/day/decade",
      period: ["1981-01", "2024-12"],
    });
  });

  it("uses different colors for opposite trends", () => {
    expect(colorForSlope(-0.08, entry.legend)).toBe("#2166ac");
    expect(colorForSlope(0, entry.legend)).toBe("#f7f7f7");
    expect(colorForSlope(0.08, entry.legend)).toBe("#b2182b");
  });
});
