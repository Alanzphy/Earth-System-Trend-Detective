import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getHealth } from "../lib/api";
import { WAKING_AFTER_MS } from "../lib/useWaking";
import { ApiStatus } from "./ApiStatus";

vi.mock("../lib/api", () => ({
  getHealth: vi.fn(),
}));

describe("ApiStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the API as connected", async () => {
    vi.mocked(getHealth).mockResolvedValue({ status: "ok" });

    render(<ApiStatus />);

    expect(await screen.findByText("API connected")).toBeInTheDocument();
  });

  it("shows the API as unavailable", async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error("down"));

    render(<ApiStatus />);

    expect(await screen.findByText("API unavailable")).toBeInTheDocument();
  });

  it("warns that the server is waking up when /health is slow", () => {
    vi.useFakeTimers();
    vi.mocked(getHealth).mockReturnValue(new Promise(() => {}));

    render(<ApiStatus />);
    expect(screen.getByText("Checking API…")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WAKING_AFTER_MS);
    });

    expect(screen.getByText(/Waking up the server/)).toBeInTheDocument();
  });
});
