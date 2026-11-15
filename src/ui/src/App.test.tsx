import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./components/ApiStatus", () => ({
  ApiStatus: () => <p>API connected</p>,
}));

vi.mock("./components/MapView", () => ({
  MapView: () => <div>Map</div>,
}));

vi.mock("./components/TrendChart", () => ({
  TrendChart: () => <div>Chart</div>,
}));

describe("App", () => {
  it("renders the interface in English by default", async () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Earth System Trend Detective" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Explore Earth system variables/)).toBeInTheDocument();
    expect(screen.getByText("Study region")).toBeInTheDocument();
    expect(await screen.findByText("Chart")).toBeInTheDocument();
  });
});
