import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import sampleDemo from "../../public/demos/sample-rain-opposite-directions.json?raw";
import sampleManifest from "../../public/demos/manifest.json?raw";
import { jsonResponse, makeAnalysis } from "../test/fixtures";
import { DemoGallery } from "./DemoGallery";

vi.mock("./AnalysisChart", () => ({
  AnalysisChart: () => <div>Chart</div>,
}));

// Serve the real static files from public/demos (no API involved).
function mockStaticFiles(overrides: Record<string, unknown> = {}) {
  return vi.fn(async (url: string) => {
    for (const [suffix, body] of Object.entries(overrides)) {
      if (url.endsWith(suffix)) {
        return jsonResponse(body);
      }
    }
    if (url.endsWith("demos/manifest.json")) {
      return jsonResponse(JSON.parse(sampleManifest));
    }
    if (url.endsWith("demos/sample-rain-opposite-directions.json")) {
      return jsonResponse(JSON.parse(sampleDemo));
    }
    return jsonResponse({}, 404);
  });
}

describe("DemoGallery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists the demos from the static manifest", async () => {
    const fetchMock = mockStaticFiles();
    vi.stubGlobal("fetch", fetchMock);

    render(<DemoGallery />);

    expect(
      await screen.findByRole("button", { name: /Sample: same variable, opposite directions/ }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/demos\/manifest\.json$/));
  });

  it("opens a two-panel demo side by side", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());

    render(<DemoGallery />);
    const card = await screen.findByRole("button", { name: /opposite directions/ });
    fireEvent.click(card);

    const demo = await screen.findByRole("article", {
      name: "Sample: same variable, opposite directions",
    });
    const panels = within(demo).getAllByRole("region");
    expect(panels.map((panel) => panel.getAttribute("aria-label"))).toEqual([
      "Sample: Western Sahel",
      "Sample: Central Chile",
    ]);
    expect(panels[0].parentElement).toHaveClass("compare-grid");
    expect(within(panels[0]).getByRole("heading", { name: /Increasing/ })).toBeInTheDocument();
    expect(within(panels[1]).getByRole("heading", { name: /Decreasing/ })).toBeInTheDocument();
    expect(card).toHaveAttribute("aria-pressed", "true");
  });

  it("renders a single-panel demo without the compare layout", async () => {
    vi.stubGlobal(
      "fetch",
      mockStaticFiles({
        "demos/manifest.json": {
          version: 1,
          generated_at: "2026-11-14T00:00:00Z",
          demos: [{ id: "iberia", title: "Iberia warming", summary: "Warming", file: "iberia.json" }],
        },
        "demos/iberia.json": {
          id: "iberia",
          title: "Iberia warming",
          summary: "Warming",
          panels: [{ label: "Iberian Peninsula", analysis: makeAnalysis() }],
        },
      }),
    );

    render(<DemoGallery />);
    fireEvent.click(await screen.findByRole("button", { name: /Iberia warming/ }));

    const panel = await screen.findByRole("region", { name: "Iberian Peninsula" });
    expect(panel.parentElement).not.toHaveClass("compare-grid");
  });

  it("shows an error when the manifest is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 404)));

    render(<DemoGallery />);

    expect(await screen.findByRole("alert")).toHaveTextContent("404");
  });
});
