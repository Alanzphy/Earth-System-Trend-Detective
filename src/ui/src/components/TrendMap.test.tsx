import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import sampleGeojson from "../../public/trend-maps/sample-precipitation.geojson?raw";
import sampleManifest from "../../public/trend-maps/manifest.json?raw";
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

const sampleFeatures = JSON.parse(sampleGeojson).features as Array<{
  properties: Record<string, unknown>;
}>;

// Serve the real files from public/trend-maps so the test follows their shape.
function mockStaticFiles() {
  return vi.fn(async (url: string) => {
    if (url.endsWith("trend-maps/manifest.json")) {
      return { ok: true, status: 200, json: async () => JSON.parse(sampleManifest) };
    }
    if (url.endsWith("trend-maps/sample-precipitation.geojson")) {
      return { ok: true, status: 200, json: async () => JSON.parse(sampleGeojson) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
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

  it("shows the sample badge for the bundled sample manifest", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());

    render(<TrendMap />);

    expect(await screen.findByText("Sample data")).toBeInTheDocument();
    expect(screen.getByText("Sample: precipitation trends")).toBeInTheDocument();
  });

  it("colors the map with the entry palette centered at 0", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());

    render(<TrendMap />);
    await screen.findByText("Sample data");

    act(() => {
      mapMock.handlers.load?.forEach((handler) => handler());
    });

    await waitFor(() => expect(mapMock.addLayer).toHaveBeenCalled());
    const fillLayer = mapMock.addLayer.mock.calls
      .map(([layer]) => layer as { id: string; paint: Record<string, unknown> })
      .find((layer) => layer.id === "trend-map-significant");
    expect(fillLayer?.paint["fill-color"]).toEqual([
      "interpolate",
      ["linear"],
      ["get", "slope"],
      -0.12,
      "#8c510a",
      0,
      "#f5f5f5",
      0.12,
      "#01665e",
    ]);
  });

  it("selects a region and hands it to the analysis", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());
    // MapLibre returns nested properties serialized as JSON strings.
    const rendered = sampleFeatures[0].properties;
    mapMock.queryRenderedFeatures.mockReturnValue([
      { properties: { ...rendered, bbox: JSON.stringify(rendered.bbox) } },
    ]);
    const onSelectRegion = vi.fn();
    const onAnalyzeRegion = vi.fn();

    render(<TrendMap onSelectRegion={onSelectRegion} onAnalyzeRegion={onAnalyzeRegion} />);
    await screen.findByText("Sample data");

    act(() => {
      mapMock.handlers.load?.forEach((handler) => handler());
    });

    await waitFor(() => {
      expect(mapMock.handlers.click?.length).toBeGreaterThan(0);
    });

    const clickHandler = mapMock.handlers.click?.[0] as
      | ((event: { point: { x: number; y: number } }) => void)
      | undefined;
    act(() => {
      clickHandler?.({ point: { x: 10, y: 10 } });
    });

    fireEvent.click(await screen.findByRole("button", { name: "Analyze this region" }));

    const expected = expect.objectContaining({
      label: rendered.label,
      variable: "precipitation",
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

    render(<TrendMap />);

    expect(await screen.findByRole("alert")).toHaveTextContent("503");
  });
});
