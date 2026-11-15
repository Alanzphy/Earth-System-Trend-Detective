import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, makeAnalysis } from "../test/fixtures";
import { ApiError, getVariables, postTrend } from "./api";

const request = {
  variable: "temperature_2m",
  bbox: { min_lon: -10, min_lat: 36, max_lon: 3, max_lat: 44 },
  start: "1981-01",
  end: "2025-12",
};

describe("API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the TrendRequest as JSON and returns the AnalysisResponse", async () => {
    const analysis = makeAnalysis();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(analysis));
    vi.stubGlobal("fetch", fetchMock);

    await expect(postTrend(request)).resolves.toEqual(analysis);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/trend$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(request);
  });

  it("maps an ErrorResponse to an ApiError with its code and message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          { error: { code: "unknown_variable", message: "Unknown variable 'snow'." } },
          404,
        ),
      ),
    );

    const error = await postTrend(request).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: "unknown_variable",
      message: "Unknown variable 'snow'.",
      status: 404,
    });
  });

  it("maps errors without an ErrorResponse body to an HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError("not JSON");
        },
      }),
    );

    await expect(getVariables()).rejects.toMatchObject({
      code: "http_500",
      message: expect.stringContaining("HTTP 500"),
    });
  });

  it("maps a network failure to a friendly message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(getVariables()).rejects.toMatchObject({
      code: "network_error",
      message: expect.stringContaining("Could not reach the server"),
    });
  });
});
