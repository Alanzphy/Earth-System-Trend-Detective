import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getHealth } from "../lib/api";
import { ApiStatus, WAKING_AFTER_MS } from "./ApiStatus";

vi.mock("../lib/api", () => ({
  getHealth: vi.fn(),
}));

describe("ApiStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra la API conectada", async () => {
    vi.mocked(getHealth).mockResolvedValue({ status: "ok" });

    render(<ApiStatus />);

    expect(await screen.findByText("API conectada")).toBeInTheDocument();
  });

  it("muestra la API no disponible", async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error("down"));

    render(<ApiStatus />);

    expect(await screen.findByText("API no disponible")).toBeInTheDocument();
  });

  it("avisa que el servidor está despertando si /health tarda", () => {
    vi.useFakeTimers();
    vi.mocked(getHealth).mockReturnValue(new Promise(() => {}));

    render(<ApiStatus />);
    expect(screen.getByText("Comprobando API…")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WAKING_AFTER_MS);
    });

    expect(screen.getByText(/Despertando el servidor/)).toBeInTheDocument();
  });
});
