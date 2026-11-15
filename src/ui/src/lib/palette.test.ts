import { describe, expect, it } from "vitest";
import {
  colorForValue,
  divergingStops,
  fillColorExpression,
  legendGradient,
  legendPosition,
  PALETTES,
} from "./palette";

const asymmetric = { min: -0.05, max: 0.15 };

describe("diverging palettes", () => {
  it("uses blue for decrease and red for increase in RdBu", () => {
    expect(colorForValue(-1, "RdBu", asymmetric)).toBe(PALETTES.RdBu.negative);
    expect(colorForValue(1, "RdBu", asymmetric)).toBe(PALETTES.RdBu.positive);
    expect(PALETTES.RdBu.negative).toBe("#2166ac");
    expect(PALETTES.RdBu.positive).toBe("#b2182b");
  });

  it("uses brown for drier and blue-green for wetter in BrBG", () => {
    expect(colorForValue(-1, "BrBG", asymmetric)).toBe("#8c510a");
    expect(colorForValue(1, "BrBG", asymmetric)).toBe("#01665e");
  });

  it("centers the neutral color at 0, not at the legend midpoint", () => {
    expect(colorForValue(0, "RdBu", asymmetric)).toBe(PALETTES.RdBu.neutral);
    expect(colorForValue(0.05, "RdBu", asymmetric)).not.toBe(PALETTES.RdBu.neutral);
    expect(divergingStops("BrBG", asymmetric)[1]).toEqual([0, PALETTES.BrBG.neutral]);
  });

  it("drives the map expression and the legend gradient from the same stops", () => {
    expect(fillColorExpression("BrBG", asymmetric)).toEqual([
      "interpolate",
      ["linear"],
      ["get", "slope"],
      -0.05,
      "#8c510a",
      0,
      "#f5f5f5",
      0.15,
      "#01665e",
    ]);
    expect(legendPosition(0, asymmetric)).toBeCloseTo(0.25);
    expect(legendGradient("BrBG", asymmetric)).toBe(
      "linear-gradient(90deg, #8c510a 0.00%, #f5f5f5 25.00%, #01665e 100.00%)",
    );
  });
});
