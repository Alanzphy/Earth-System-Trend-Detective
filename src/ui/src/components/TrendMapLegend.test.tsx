import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrendMapLegend } from "./TrendMapLegend";
import type { TrendMapManifestEntry } from "../lib/trendMaps";

const entry: TrendMapManifestEntry = {
  id: "sample-precipitation",
  title: "Precipitation trends",
  variable: "precipitation",
  units: "mm/day",
  period: ["1981-01", "2024-12"],
  slopeUnits: "mm/day/decade",
  file: "sample-precipitation.geojson",
  legend: { min: -0.08, max: 0.08, breaks: [-0.08, 0, 0.08] },
  isSample: true,
};

describe("TrendMapLegend", () => {
  it("renders the scale, units and significance note", () => {
    render(<TrendMapLegend entry={entry} isSample />);

    expect(screen.getByText("Precipitation trends")).toBeInTheDocument();
    expect(screen.getByText("Sample data")).toBeInTheDocument();
    expect(screen.getByText(/mm\/day\/decade/)).toBeInTheDocument();
    expect(screen.getByText(/FDR correction/)).toBeInTheDocument();
    expect(screen.getByText("-0.08")).toBeInTheDocument();
    expect(screen.getByText("0.00")).toBeInTheDocument();
    expect(screen.getByText("0.08")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAccessibleName(/Color scale/);
  });

  it("hides the sample badge for generated maps", () => {
    render(<TrendMapLegend entry={{ ...entry, isSample: false }} />);

    expect(screen.queryByText("Sample data")).not.toBeInTheDocument();
  });
});
