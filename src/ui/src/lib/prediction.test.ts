import { describe, expect, it } from "vitest";
import { makeAnalysis } from "../test/fixtures";
import { scorePrediction } from "./prediction";
import type { PlaceAnalyses } from "./usePlaceAnalyses";
import { VARIABLE_ORDER } from "./variables";

function analyses(overrides: Partial<PlaceAnalyses>): PlaceAnalyses {
  const base = Object.fromEntries(VARIABLE_ORDER.map((id) => [id, { status: "loading" }])) as PlaceAnalyses;
  return { ...base, ...overrides };
}

const warmer = { status: "done", analysis: makeAnalysis({ total_change: 2.4, p_value: 0.001, significant: true }) } as const;
const unclearRain = { status: "done", analysis: makeAnalysis({ total_change: -0.02, p_value: 0.4, significant: false }) } as const;

describe("scorePrediction", () => {
  it("counts 'no clear change' as right when the trend is not significant, whatever its sign", () => {
    const score = scorePrediction(
      { temperature_2m: "up", precipitation: "unclear" },
      analyses({ temperature_2m: warmer, precipitation: unclearRain }),
    );
    expect(score?.right).toBe(2);
  });

  it("marks a direction guess wrong when the change is not significant", () => {
    const score = scorePrediction({ precipitation: "down" }, analyses({ precipitation: unclearRain }));
    expect(score?.results).toEqual([{ id: "precipitation", guess: "down", actual: "unclear", right: false }]);
  });

  it("only scores questions whose data has loaded", () => {
    const score = scorePrediction({ temperature_2m: "down", soil_wetness_root: "down" }, analyses({ temperature_2m: warmer }));
    expect(score).toEqual({ results: [{ id: "temperature_2m", guess: "down", actual: "up", right: false }], right: 0 });
  });
});
