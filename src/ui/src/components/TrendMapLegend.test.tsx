import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TrendMapEntry } from "../types/contracts";
import { TrendMapLegend } from "./TrendMapLegend";

const entry: TrendMapEntry = {
  id: "precipitation",
  title: "Precipitation trends",
  variable: "precipitation",
  units: "mm/day",
  slope_units: "mm/day/decade",
  period: ["1981-01", "2025-12"],
  palette: "BrBG",
  cell_size_deg: 2,
  file: "precipitation.geojson",
  legend: { min: -0.05, max: 0.15 },
  alpha: 0.05,
  fdr: true,
  is_sample: true,
};

describe("TrendMapLegend", () => {
  it("renders the scale, units, palette meaning and significance note", () => {
    render(<TrendMapLegend entry={entry} />);

    expect(screen.getByText("Precipitation trends")).toBeInTheDocument();
    expect(screen.getByText("Sample data")).toBeInTheDocument();
    expect(screen.getByText(/mm\/day\/decade/)).toBeInTheDocument();
    expect(screen.getByText(/FDR\) correction/)).toBeInTheDocument();
    expect(screen.getByText("Brown: drier / decrease")).toBeInTheDocument();
    expect(screen.getByText("Blue-green: wetter / increase")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(/Color scale/);
  });

  it("places the 0 tick at the neutral point with neutral text color", () => {
    render(<TrendMapLegend entry={entry} />);

    const zero = screen.getByText("0.00");
    expect(zero).toHaveStyle({ left: "25%" });
    expect(zero.getAttribute("style")).not.toContain("color");
    expect(screen.getByText("-0.05")).toHaveStyle({ left: "0%" });
    expect(screen.getByText("0.15")).toHaveStyle({ left: "100%" });
    expect(screen.getByRole("img").getAttribute("style")).toContain("25.00%");
  });

  it("explains the RdBu palette for temperature-like maps", () => {
    render(<TrendMapLegend entry={{ ...entry, palette: "RdBu" }} />);

    expect(screen.getByText("Blue: decrease")).toBeInTheDocument();
    expect(screen.getByText("Red: increase")).toBeInTheDocument();
  });

  it("hides the sample badge for generated maps", () => {
    render(<TrendMapLegend entry={{ ...entry, is_sample: false, fdr: false }} />);

    expect(screen.queryByText("Sample data")).not.toBeInTheDocument();
    expect(screen.getByText(/\(p ≥ 0.05\)/)).toBeInTheDocument();
  });
});
