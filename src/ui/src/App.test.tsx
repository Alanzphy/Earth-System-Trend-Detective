import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { TrendRegionSelection } from "./lib/trendMaps";
import { jsonResponse, makeAnalysis, VARIABLES } from "./test/fixtures";
import type { TrendRequest } from "./types/contracts";

vi.mock("./components/ApiStatus", () => ({
  ApiStatus: () => <p>API connected</p>,
}));

vi.mock("./components/BboxPicker", () => ({
  BboxPicker: () => <div>Map</div>,
}));

vi.mock("./components/AnalysisChart", () => ({
  AnalysisChart: () => <div>Chart</div>,
}));

const sahelCell: TrendRegionSelection = {
  id: "western-sahel",
  label: "Western Sahel",
  slope: 0.028,
  p_value: 0.036,
  significant: true,
  bbox: [-17, 12, -2, 18],
  variable: "precipitation",
  units: "mm/day",
  slope_units: "mm/day/decade",
  period: ["1981-01", "2025-12"],
  palette: "BrBG",
};

vi.mock("./components/TrendMap", () => ({
  TrendMap: ({ onAnalyzeRegion }: { onAnalyzeRegion: (region: TrendRegionSelection) => void }) => (
    <button type="button" onClick={() => onAnalyzeRegion(sahelCell)}>
      Analyze this region
    </button>
  ),
}));

vi.mock("./components/DemoGallery", () => ({
  DemoGallery: () => <p>Demos</p>,
}));

function mockApi() {
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith("/variables")) {
      return jsonResponse({ variables: VARIABLES });
    }
    if (url.endsWith("/trend")) {
      const request = JSON.parse(init?.body as string) as TrendRequest;
      const slope = request.bbox.min_lon < -50 ? -0.111 : 0.028;
      return jsonResponse(
        makeAnalysis({
          slope_per_decade: slope,
          direction: slope > 0 ? "increasing" : "decreasing",
          slope_units: "mm/day/decade",
        }),
      );
    }
    return jsonResponse({}, 404);
  });
}

describe("App", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the hero, disclaimer and sections in English", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Watch 45 years of Earth change." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Descriptive, not a forecast/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cases" })).toHaveAttribute("href", "#demos");
    expect(screen.getByRole("heading", { name: "Start with a demo" })).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: /Air temperature at 2 m/ })).toBeInTheDocument();
  });

  it("restores the flow from the URL and compares two regions side by side", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(
      null,
      "",
      "/?variable=precipitation&bbox=-17,12,-2,18&start=1981-01&end=2025-12&compare=-73,-38,-70,-30",
    );

    render(<App />);

    const results = screen.getByRole("region", { name: "Comparing two regions" });
    await waitFor(() => expect(within(results).getAllByRole("article")).toHaveLength(2));
    const panelA = within(results).getByRole("region", { name: "Region A: Western Sahel" });
    const panelB = within(results).getByRole("region", { name: "Region B: Central Chile" });
    expect(panelA.parentElement).toHaveClass("compare-grid");
    expect(within(panelA).getByRole("heading", { name: /Increasing/ })).toBeInTheDocument();
    expect(within(panelB).getByRole("heading", { name: /Decreasing/ })).toBeInTheDocument();

    const trendCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/trend"));
    expect(trendCalls).toHaveLength(2);
    expect(screen.getByRole("radio", { name: /Precipitation/ })).toBeChecked();
  });

  it("mirrors the guided flow in the URL", async () => {
    vi.stubGlobal("fetch", mockApi());

    render(<App />);
    fireEvent.click(await screen.findByRole("radio", { name: /Air temperature at 2 m/ }));
    fireEvent.click(screen.getByRole("button", { name: /Iberian Peninsula/ }));

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("variable")).toBe("temperature_2m");
      expect(params.get("bbox")).toBe("-10,36,3,44");
      expect(params.get("start")).toBe("1981-01");
      expect(params.get("end")).toBe("2025-12");
    });
  });

  it("fills the flow from the trend map and runs the analysis", async () => {
    const fetchMock = mockApi();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await screen.findByRole("radio", { name: /Air temperature at 2 m/ });
    const mapSection = screen.getByRole("region", { name: "Where is it changing?" });
    fireEvent.click(within(mapSection).getByRole("button", { name: "Analyze this region" }));

    await waitFor(() => {
      const panel = screen.getByRole("region", { name: "Western Sahel" });
      expect(within(panel).getByRole("article", { name: "Verdict" })).toBeInTheDocument();
    });
    expect(screen.getByRole("radio", { name: /Precipitation/ })).toBeChecked();
    expect(new URLSearchParams(window.location.search).get("bbox")).toBe("-17,12,-2,18");
  });
});
