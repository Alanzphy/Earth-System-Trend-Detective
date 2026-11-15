import { describe, expect, it } from "vitest";
import { VARIABLES } from "../test/fixtures";
import {
  bboxFromCorners,
  box,
  clampPeriod,
  EMPTY_FLOW,
  flowErrors,
  parseFlowState,
  serializeFlowState,
  trendRequests,
  type FlowState,
} from "./flow";

const iberia = box(-10, 36, 3, 44);
const chile = box(-73, -38, -70, -30);

describe("URL state", () => {
  it("round-trips variable, bbox, period and comparison region", () => {
    const state: FlowState = {
      variable: "precipitation",
      bbox: box(-17, 12, -2, 18),
      start: "1990-03",
      end: "2020-11",
      compare: chile,
    };

    const query = serializeFlowState(state);
    expect(query).toBe(
      "variable=precipitation&bbox=-17%2C12%2C-2%2C18&start=1990-03&end=2020-11&compare=-73%2C-38%2C-70%2C-30",
    );
    expect(parseFlowState(`?${query}`)).toEqual(state);
  });

  it("round-trips decimal coordinates", () => {
    const state: FlowState = { ...EMPTY_FLOW, variable: "temperature_2m", bbox: box(-4.75, 39.4, -2.75, 41.4) };
    expect(parseFlowState(serializeFlowState(state))).toEqual(state);
  });

  it("falls back to defaults for missing or invalid values", () => {
    expect(parseFlowState("")).toEqual(EMPTY_FLOW);
    expect(parseFlowState("?bbox=3,44,-10,36&start=1981-13&end=abc&compare=1,2")).toEqual(
      EMPTY_FLOW,
    );
  });
});

describe("regions and periods", () => {
  it("builds a box from two corners in any order, snapped to 0.25°", () => {
    expect(bboxFromCorners({ lng: 3.1, lat: 36.02 }, { lng: -10.13, lat: 44.2 })).toEqual(
      box(-10.25, 36, 3, 44.25),
    );
  });

  it("clamps the period to the variable availability", () => {
    const solar = VARIABLES[2];
    expect(clampPeriod({ start: "1981-01", end: "2025-12" }, solar)).toEqual({
      start: "1984-01",
      end: "2025-12",
    });
  });

  it("lists what is missing before analyzing", () => {
    expect(flowErrors(EMPTY_FLOW, undefined)).toEqual(["Choose a variable.", "Choose a region."]);
    expect(
      flowErrors(
        { ...EMPTY_FLOW, variable: "temperature_2m", bbox: iberia, start: "2000-01", end: "1999-01" },
        VARIABLES[0],
      ),
    ).toEqual(["The start month must be before the end month."]);
    expect(
      flowErrors({ ...EMPTY_FLOW, variable: "temperature_2m", bbox: box(-60, 0, 0, 10) }, VARIABLES[0]),
    ).toEqual(["Region: Boxes can be at most 40° × 40°. Draw a smaller one."]);
  });

  it("creates one request per region when comparing", () => {
    const requests = trendRequests({
      ...EMPTY_FLOW,
      variable: "precipitation",
      bbox: box(-17, 12, -2, 18),
      compare: chile,
    });
    expect(requests.map((item) => item.label)).toEqual([
      "Region A: Western Sahel",
      "Region B: Central Chile",
    ]);
    expect(requests[1].request).toEqual({
      variable: "precipitation",
      bbox: chile,
      start: "1981-01",
      end: "2025-12",
    });
  });
});
