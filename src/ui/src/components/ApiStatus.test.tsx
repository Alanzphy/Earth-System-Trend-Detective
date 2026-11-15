import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureAwake } from "../lib/api";
import { WAKING_AFTER_MS } from "../lib/useWaking";
import { ApiStatus } from "./ApiStatus";

vi.mock("../lib/api", () => ({
  ensureAwake: vi.fn(),
}));

describe("ApiStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the API as connected", async () => {
    vi.mocked(ensureAwake).mockResolvedValue();

    render(<ApiStatus />);

    expect(await screen.findByText("Live analysis available")).toBeInTheDocument();
  });

  it("reports the service as not responding only after waiting for it", async () => {
    vi.mocked(ensureAwake).mockRejectedValue(new Error("down"));

    render(<ApiStatus />);

    expect(await screen.findByText(/Live analysis is not responding/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("warns that the server is waking up when /health is slow", () => {
    vi.useFakeTimers();
    vi.mocked(ensureAwake).mockReturnValue(new Promise(() => {}));

    render(<ApiStatus />);
    expect(screen.getByText("Checking the live service…")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WAKING_AFTER_MS);
    });

    expect(screen.getByText(/Waking up the server/)).toBeInTheDocument();
  });
});
