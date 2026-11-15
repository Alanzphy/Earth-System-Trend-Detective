import { describe, expect, it } from "vitest";
import { makeAnalysis } from "../test/fixtures";
import { annualAnomalies, plainChange } from "./evidence";

describe("plainChange", () => {
  it("turns a rainfall trend into millimetres per year and percent of normal", () => {
    const analysis = makeAnalysis({ total_change: -0.32, period_start: "1981-01" });
    analysis.series.values = [1.2, 1.2, 1.2];
    // −0.32 mm/day × 365 ≈ −117 mm per year, about −27 % of a 1.2 mm/day normal.
    expect(plainChange("precipitation", analysis)).toEqual({
      figure: "−117 mm",
      caption: "less rain per year since 1981 (−27%)",
    });
  });

  it("reports relative humidity in points, not a percent of a percent", () => {
    const analysis = makeAnalysis({ total_change: -8.1 });
    expect(plainChange("relative_humidity_2m", analysis).figure).toBe("−8 pts");
  });

  it("says cooler when temperature falls", () => {
    const analysis = makeAnalysis({ total_change: -0.44, period_start: "1990-01" });
    expect(plainChange("temperature_2m", analysis)).toEqual({ figure: "−0.4 °C", caption: "cooler since 1990" });
  });
});

describe("annualAnomalies", () => {
  it("skips years without twelve months of data", () => {
    const analysis = makeAnalysis();
    analysis.series.time = [...Array.from({ length: 12 }, (_, i) => `2000-${String(i + 1).padStart(2, "0")}`), "2001-01"];
    analysis.anomalies = [...Array(12).fill(0.5), 2];
    expect(annualAnomalies(analysis)).toEqual([{ year: "2000", value: 0.5 }]);
  });
});
