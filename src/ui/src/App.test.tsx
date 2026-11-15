import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import centralChile from "../public/regions/central-chile.json?raw";
import delicias from "../public/regions/delicias.json?raw";
import manifest from "../public/regions/manifest.json?raw";
import westernSahel from "../public/regions/western-sahel.json?raw";
import App from "./App";
import type { TrendRegionSelection } from "./lib/trendMaps";
import { jsonResponse, makeAnalysis } from "./test/fixtures";
import type { TrendRequest } from "./types/contracts";

vi.mock("./components/ApiStatus", () => ({ ApiStatus: () => <p>API status</p> }));
vi.mock("./components/AnalysisChart", () => ({ AnalysisChart: () => <div>Chart</div> }));
vi.mock("./components/DemoGallery", () => ({ DemoGallery: () => <p>Demos</p> }));

const cell: TrendRegionSelection = {
  id: "cell",
  label: "28.75°N, 106.25°W (2.5° cell)",
  slope: 0.5,
  p_value: 0.001,
  significant: true,
  bbox: [-107.5, 27.5, -105, 30],
  variable: "precipitation",
  units: "mm/day",
  slope_units: "mm/day/decade",
  period: ["1981-01", "2025-12"],
  palette: "BrBG",
};

vi.mock("./components/TrendMap", () => ({
  TrendMap: ({ onAnalyzeRegion }: { onAnalyzeRegion: (region: TrendRegionSelection) => void }) => (
    <button type="button" onClick={() => onAnalyzeRegion(cell)}>
      Analyze this region
    </button>
  ),
}));

// The precomputed files the app ships in public/regions.
const FILES: Record<string, string> = {
  "regions/manifest.json": manifest,
  "regions/delicias.json": delicias,
  "regions/western-sahel.json": westernSahel,
  "regions/central-chile.json": centralChile,
};

type FetchMock = Mock<(url: string, init?: RequestInit) => Promise<Response>>;

function mockNetwork(): FetchMock {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const file = Object.keys(FILES).find((suffix) => url.endsWith(suffix));
    if (file) {
      return jsonResponse(JSON.parse(FILES[file]));
    }
    if (url.endsWith("/trend")) {
      const request = JSON.parse(init?.body as string) as TrendRequest;
      return jsonResponse(makeAnalysis({ slope_per_decade: 0.2, total_change: 0.9, significant: request.variable !== "wind_speed_10m", p_value: request.variable === "wind_speed_10m" ? 0.4 : 0.001 }));
    }
    return jsonResponse({}, 404);
  });
}

function trendCalls(fetchMock: FetchMock) {
  return fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/trend"));
}

describe("App", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens on a precomputed Chihuahua case without calling the live API", async () => {
    const fetchMock = mockNetwork();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    const card = await screen.findByRole("article", { name: "Delicias area, Chihuahua" });
    // Real Delicias data: warming of about +2.4 °C since 1981, and water vapor without a clear trend.
    expect(await within(card).findByText("+2.4 °C", { selector: ".num-display" })).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /Water vapor No clear trend/ })).toBeInTheDocument();
    expect(within(card).getByText(/Statistically significant/)).toBeInTheDocument();
    expect(trendCalls(fetchMock)).toHaveLength(0);
    expect(new URLSearchParams(window.location.search).get("place")).toBe("delicias");
  });

  it("restores a comparison from the URL and focuses the variable it names", async () => {
    vi.stubGlobal("fetch", mockNetwork());
    window.history.replaceState(null, "", "/?place=western-sahel&compare=central-chile&var=precipitation");

    render(<App />);

    const sahel = await screen.findByRole("article", { name: "Western Sahel" });
    const chile = await screen.findByRole("article", { name: "Central Chile" });
    // Same variable, opposite directions: more rain in the Sahel, less in central Chile.
    expect(await within(sahel).findByText(/more rain per year/)).toBeInTheDocument();
    expect(await within(chile).findByText(/less rain per year/)).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: /Evidence: Precipitation/ })).toHaveLength(2);
  });

  it("switches the focused variable and keeps it in the URL", async () => {
    vi.stubGlobal("fetch", mockNetwork());

    render(<App />);
    const card = await screen.findByRole("article", { name: "Delicias area, Chihuahua" });
    fireEvent.click(await within(card).findByRole("button", { name: /^Rain/ }));

    expect(within(card).getByRole("button", { name: /^Rain/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: /Evidence: Precipitation in Delicias/ })).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("var")).toBe("precipitation");
  });

  it("investigates a map cell live, one request per variable", async () => {
    const fetchMock = mockNetwork();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await screen.findByRole("article", { name: "Delicias area, Chihuahua" });
    fireEvent.click(screen.getByRole("button", { name: "Analyze this region" }));

    const card = await screen.findByRole("article", { name: "Area 107.5°W to 105°W, 27.5°N to 30°N" });
    await waitFor(() => expect(trendCalls(fetchMock)).toHaveLength(8));
    const variables = trendCalls(fetchMock).map(([, init]) => (JSON.parse(init?.body as string) as TrendRequest).variable);
    expect(new Set(variables).size).toBe(8);
    expect(await within(card).findByRole("button", { name: /Wind No clear trend/ })).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /^Rain/ })).toHaveAttribute("aria-pressed", "true");
    expect(new URLSearchParams(window.location.search).get("bbox")).toBe("-107.5,27.5,-105,30");
  });
});
