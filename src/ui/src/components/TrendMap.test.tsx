import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrendMap } from "./TrendMap";

const mapMock = vi.hoisted(() => {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};

  return {
    handlers,
    addControl: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      handlers[event] = [...(handlers[event] ?? []), handler];
    }),
    off: vi.fn(),
    remove: vi.fn(),
    getSource: vi.fn(() => undefined),
    addSource: vi.fn(),
    getLayer: vi.fn(() => undefined),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    removeSource: vi.fn(),
    queryRenderedFeatures: vi.fn((): unknown[] => []),
    getCanvas: vi.fn(() => ({ style: {} })),
  };
});

vi.mock("maplibre-gl", () => ({
  default: {
    Map: vi.fn(() => mapMock),
    NavigationControl: vi.fn(),
  },
}));

const manifest = {
  version: 1,
  isSample: true,
  maps: [
    {
      id: "sample-precipitation",
      title: "Precipitation trends",
      variable: "precipitation",
      units: "mm/day",
      period: ["1981-01", "2024-12"],
      slopeUnits: "mm/day/decade",
      file: "sample-precipitation.geojson",
      legend: { min: -0.08, max: 0.08, breaks: [-0.08, 0, 0.08] },
      isSample: true,
    },
  ],
};

const feature = {
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
};

function mockFetchSequence() {
  return vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => manifest,
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ type: "FeatureCollection", features: [feature] }),
    });
}

describe("TrendMap", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    Object.keys(mapMock.handlers).forEach((key) => {
      delete mapMock.handlers[key];
    });
  });

  it("loads the map, renders the legend and selects a region", async () => {
    vi.stubGlobal("fetch", mockFetchSequence());
    mapMock.queryRenderedFeatures.mockReturnValue([feature]);
    const onSelectRegion = vi.fn();

    render(<TrendMap onSelectRegion={onSelectRegion} />);

    expect(await screen.findByText("Sample data")).toBeInTheDocument();

    act(() => {
      mapMock.handlers.load?.forEach((handler) => handler());
    });

    await waitFor(() => {
      expect(mapMock.addSource).toHaveBeenCalled();
      expect(mapMock.handlers.click?.length).toBeGreaterThan(0);
    });

    const clickHandler = mapMock.handlers.click?.[0] as
      | ((event: { point: { x: number; y: number } }) => void)
      | undefined;
    act(() => {
      clickHandler?.({ point: { x: 10, y: 10 } });
    });

    expect(await screen.findByText("Analyze this region")).toBeInTheDocument();
    expect(onSelectRegion).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Sahel", variable: "precipitation" }),
    );
  });

  it("shows an error when the manifest cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      }),
    );

    render(<TrendMap />);

    expect(await screen.findByRole("alert")).toHaveTextContent("503");
  });
});
