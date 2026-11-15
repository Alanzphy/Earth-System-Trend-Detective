import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import iberiaDemo from "../../public/demos/iberia-warming.json?raw";
import realManifest from "../../public/demos/manifest.json?raw";
import rainDemo from "../../public/demos/rain-opposite-directions.json?raw";
import { jsonResponse } from "../test/fixtures";
import { DemoGallery } from "./DemoGallery";

vi.mock("./AnalysisChart", () => ({
  AnalysisChart: () => <div>Chart</div>,
}));

// Serve the static files shipped in public/demos (no API involved).
const FILES: Record<string, string> = {
  "demos/manifest.json": realManifest,
  "demos/iberia-warming.json": iberiaDemo,
  "demos/rain-opposite-directions.json": rainDemo,
};

function mockStaticFiles() {
  return vi.fn(async (url: string) => {
    const match = Object.keys(FILES).find((suffix) => url.endsWith(suffix));
    return match ? jsonResponse(JSON.parse(FILES[match])) : jsonResponse({}, 404);
  });
}

describe("DemoGallery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists the shipped demos from the static manifest", async () => {
    const fetchMock = mockStaticFiles();
    vi.stubGlobal("fetch", fetchMock);

    render(<DemoGallery />);

    const cards = await screen.findAllByRole("button");
    expect(cards.map((card) => card.querySelector("strong")?.textContent)).toEqual([
      "Warming over the Iberian Peninsula",
      "Same variable, opposite directions",
    ]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/demos\/manifest\.json$/));
  });

  it("opens the two-panel demo side by side", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());

    render(<DemoGallery />);
    const card = await screen.findByRole("button", { name: /Same variable, opposite directions/ });
    fireEvent.click(card);

    const demo = await screen.findByRole("article", { name: "Same variable, opposite directions" });
    const panels = within(demo).getAllByRole("region");
    expect(panels.map((panel) => panel.getAttribute("aria-label"))).toEqual([
      "Western Sahel",
      "Central Chile",
    ]);
    expect(panels[0].parentElement).toHaveClass("compare-grid");
    expect(within(panels[0]).getByRole("heading", { name: /Increasing/ })).toBeInTheDocument();
    expect(within(panels[1]).getByRole("heading", { name: /Decreasing/ })).toBeInTheDocument();
    expect(card).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the single-panel demo without the compare layout", async () => {
    vi.stubGlobal("fetch", mockStaticFiles());

    render(<DemoGallery />);
    fireEvent.click(
      await screen.findByRole("button", { name: /Warming over the Iberian Peninsula/ }),
    );

    const panel = await screen.findByRole("region", { name: "Iberian Peninsula" });
    expect(panel.parentElement).not.toHaveClass("compare-grid");
    expect(within(panel).getByRole("heading", { name: /Increasing/ })).toBeInTheDocument();
  });

  it("shows an error when the manifest is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 404)));

    render(<DemoGallery />);

    expect(await screen.findByRole("alert")).toHaveTextContent("404");
  });
});
