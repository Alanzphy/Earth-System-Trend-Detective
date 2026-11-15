import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import realManifest from "../../public/trend-maps/manifest.json?raw";
import precipitationGeojson from "../../public/trend-maps/precipitation-1981-2025.geojson?raw";
import temperatureGeojson from "../../public/trend-maps/temperature_2m-1981-2025.geojson?raw";
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
    fitBounds: vi.fn(),
    getStyle: vi.fn(() => ({ layers: [] })),
    moveLayer: vi.fn(),
  };
});

vi.mock("maplibre-gl", () => ({
  default: {
    Map: vi.fn(() => mapMock),
    NavigationControl: vi.fn(),
  },
}));

const temperatureFeatures = JSON.parse(temperatureGeojson).features as Array<{
  properties: Record<string, unknown>;
}>;

const sampleCell = {
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
  properties: {
    id: "western-sahel",
    label: "Western Sahel",
    slope: 0.028,
    p_value: 0.036,
    significant: true,
    bbox: [-17, 12, -2, 18],
  },
};

const sampleManifest = {
  version: 2,
  generated_at: "2026-11-14T00:00:00Z",
  maps: [
    {
      ...JSON.parse(realManifest).maps[1],
      id: "sample",
      title: "Sample: precipitation trends",
      file: "sample.geojson",
      is_sample: true,
    },
  ],
};

// Serve the files shipped in public/trend-maps so the test covers what we deploy.
function mockStaticFiles(files: Record<string, unknown> = {}) {
  const served: Record<string, unknown> = {
    "trend-maps/manifest.json": JSON.parse(realManifest),
    "trend-maps/temperature_2m-1981-2025.geojson": JSON.parse(temperatureGeojson),
    "trend-maps/precipitation-1981-2025.geojson": JSON.parse(precipitationGeojson),
    ...files,
  };
  return vi.fn(async (url: string) => {
    const match = Object.keys(served).find((suffix) => url.endsWith(suffix));
    return match
      ? { ok: true, status: 200, json: async () => served[match] }
      : { ok: false, status: 404, json: async () => ({}) };
  });
}

function fillColors() {
  return mapMock.addLayer.mock.calls
    .map(([layer]) => layer as { id: string; paint: Record<string, unknown> })
    .filter((layer) => layer.id === "trend-map-significant")
    .map((layer) => layer.paint["fill-color"]);
}

function loadMap() {
  act(() => {
    mapMock.handlers.load?.forEach((handler) => handler());
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

  it("renders the shipped maps without the sample badge", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());

    render(<TrendMap onAnalyzeRegion={vi.fn()} />);

    expect(
      await screen.findByRole("button", { name: "Precipitation: trend 1981–2025" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Air temperature at 2 m: trend 1981–2025" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByText(/Trend in °C\/decade/)).toBeInTheDocument();
    expect(screen.queryByText("Sample data")).not.toBeInTheDocument();
  });

  it("shows the sample badge for a sample entry", async () => {
    vi.stubGlobal(
      "fetch",
      mockStaticFiles({
        "trend-maps/manifest.json": sampleManifest,
        "trend-maps/sample.geojson": { type: "FeatureCollection", features: [sampleCell] },
      }),
    );

    render(<TrendMap onAnalyzeRegion={vi.fn()} />);

    expect(await screen.findByText("Sample data")).toBeInTheDocument();
    expect(screen.getByText("Sample: precipitation trends")).toBeInTheDocument();
  });

  it("colors each map with its palette centered at 0 and switches maps", async () => {
    const fetchMock = mockStaticFiles();
    vi.stubGlobal("fetch", fetchMock);

    render(<TrendMap onAnalyzeRegion={vi.fn()} />);
    loadMap();

    await waitFor(() => expect(fillColors()).toHaveLength(1));
    expect(fillColors()[0]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "slope"],
      -0.51,
      "#2166ac",
      0,
      "#f7f7f7",
      0.51,
      "#b2182b",
    ]);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringMatching(/precipitation-1981-2025\.geojson$/),
    );

    fireEvent.click(screen.getByRole("button", { name: "Precipitation: trend 1981–2025" }));

    await waitFor(() => expect(fillColors()).toHaveLength(2));
    expect(fillColors()[1]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "slope"],
      -0.43,
      "#8c510a",
      0,
      "#f5f5f5",
      0.43,
      "#01665e",
    ]);
    expect(screen.getByText("Brown: drier / decrease")).toBeInTheDocument();
  });

  it("selects a real cell and hands it to the analysis", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());
    // MapLibre returns nested properties serialized as JSON strings.
    const rendered = temperatureFeatures[0].properties;
    mapMock.queryRenderedFeatures.mockReturnValue([
      { properties: { ...rendered, bbox: JSON.stringify(rendered.bbox) } },
    ]);
    const onSelectRegion = vi.fn();
    const onAnalyzeRegion = vi.fn();

    render(<TrendMap onSelectRegion={onSelectRegion} onAnalyzeRegion={onAnalyzeRegion} />);
    await screen.findByText(/Trend in °C\/decade/);
    loadMap();

    await waitFor(() => {
      expect(mapMock.handlers.click?.length).toBeGreaterThan(0);
    });

    const clickHandler = mapMock.handlers.click?.at(-1) as
      | ((event: { point: { x: number; y: number } }) => void)
      | undefined;
    act(() => {
      clickHandler?.({ point: { x: 10, y: 10 } });
    });

    fireEvent.click(await screen.findByRole("button", { name: "Analyze this region" }));

    const expected = expect.objectContaining({
      label: rendered.label,
      variable: "temperature_2m",
      bbox: rendered.bbox,
      period: ["1981-01", "2025-12"],
    });
    expect(onSelectRegion).toHaveBeenCalledWith(expected);
    expect(onAnalyzeRegion).toHaveBeenCalledWith(expected);
    expect(screen.getByText(/Significance:/)).toHaveTextContent(/p [=<]/);
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

    render(<TrendMap onAnalyzeRegion={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("503");
  });
});
