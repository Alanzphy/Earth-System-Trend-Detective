import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, postTrend } from "../lib/api";
import type * as ApiModule from "../lib/api";
import { WAKING_AFTER_MS } from "../lib/useWaking";
import { makeAnalysis } from "../test/fixtures";
import { LiveAnalysis } from "./LiveAnalysis";

vi.mock("../lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof ApiModule>()),
  postTrend: vi.fn(),
}));

vi.mock("./AnalysisChart", () => ({
  AnalysisChart: () => <div>Chart</div>,
}));

const request = {
  variable: "temperature_2m",
  bbox: { min_lon: -10, min_lat: 36, max_lon: 3, max_lat: 44 },
  start: "1981-01",
  end: "2025-12",
};

describe("LiveAnalysis", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(postTrend).mockReset();
  });

  it("shows the result with chart and verdict", async () => {
    vi.mocked(postTrend).mockResolvedValue(makeAnalysis());

    render(<LiveAnalysis label="Iberian Peninsula" request={request} />);

    expect(screen.getByText("Preparing NASA data…")).toBeInTheDocument();
    expect(await screen.findByText("Chart")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Verdict" })).toBeInTheDocument();
    expect(postTrend).toHaveBeenCalledWith(request);
  });

  it("tells the user the server is waking up after 5 seconds", () => {
    vi.useFakeTimers();
    vi.mocked(postTrend).mockReturnValue(new Promise(() => {}));

    render(<LiveAnalysis label="Iberian Peninsula" request={request} />);
    act(() => {
      vi.advanceTimersByTime(WAKING_AFTER_MS);
    });

    expect(screen.getByText(/Waking up the server/)).toBeInTheDocument();
  });

  it("shows the API error message and code", async () => {
    vi.mocked(postTrend).mockRejectedValue(
      new ApiError("upstream_unavailable", "NASA POWER did not answer. Try again later.", 502),
    );

    render(<LiveAnalysis label="Iberian Peninsula" request={request} />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("NASA POWER did not answer. Try again later.");
    expect(alert).toHaveTextContent("upstream_unavailable");
  });
});
