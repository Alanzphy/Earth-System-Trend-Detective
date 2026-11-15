import { describe, expect, it } from "vitest";
import { analysisBoxError, bboxFromCorners, bboxToParam, box, parseBboxParam } from "./flow";

describe("bbox URL parameter", () => {
  it("round-trips decimal coordinates", () => {
    const madrid = box(-4.75, 39.4, -2.75, 41.4);
    expect(parseBboxParam(bboxToParam(madrid))).toEqual(madrid);
  });

  it("rejects malformed or inverted boxes", () => {
    expect(parseBboxParam("3,44,-10,36")).toBeNull();
    expect(parseBboxParam("1,2")).toBeNull();
    expect(parseBboxParam("a,b,c,d")).toBeNull();
  });
});

describe("custom areas", () => {
  it("builds a box from two corners in any order, snapped to 0.25°", () => {
    expect(bboxFromCorners({ lng: 3.1, lat: 36.02 }, { lng: -10.13, lat: 44.2 })).toEqual(
      box(-10.25, 36, 3, 44.25),
    );
  });

  it("enforces the API's maximum box size", () => {
    expect(analysisBoxError(box(-60, 0, 0, 10))).toBe("Boxes can be at most 40° × 40°. Draw a smaller one.");
  });
});
