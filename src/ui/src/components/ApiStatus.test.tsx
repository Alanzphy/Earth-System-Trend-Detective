import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getHealth } from "../lib/api";
import { ApiStatus } from "./ApiStatus";

vi.mock("../lib/api", () => ({
  getHealth: vi.fn(),
}));

describe("ApiStatus", () => {
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
});
