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

  describe("waiting for a sleeping server", () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.resetModules();
    });

    // A fresh module per test: the shared wake-up attempt is module state.
    async function freshApi() {
      vi.resetModules();
      return import("./api");
    }

    it("retries /health while the server starts, then sends the analysis once", async () => {
      vi.useFakeTimers();
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        .mockResolvedValueOnce(jsonResponse({}, 503))
        .mockResolvedValueOnce(jsonResponse({ status: "ok" }))
        .mockResolvedValueOnce(jsonResponse(makeAnalysis()));
      vi.stubGlobal("fetch", fetchMock);
      const api = await freshApi();

      const result = api.postTrendWhenAwake(request);
      await vi.advanceTimersByTimeAsync(6_000);

      await expect(result).resolves.toEqual(makeAnalysis());
      const urls = fetchMock.mock.calls.map(([url]) => String(url));
      expect(urls.filter((url) => url.endsWith("/health"))).toHaveLength(3);
      expect(urls.filter((url) => url.endsWith("/trend"))).toHaveLength(1);
    });

    it("gives up after the wake-up timeout instead of waiting forever", async () => {
      vi.useFakeTimers();
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
      const api = await freshApi();

      const result = api.ensureAwake().catch((error: unknown) => error);
      await vi.advanceTimersByTimeAsync(api.WAKE_TIMEOUT_MS + 3_000);

      expect(await result).toMatchObject({ code: "network_error" });
    });

    it("does not retry a real error from the API", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ status: "ok" }))
        .mockResolvedValue(jsonResponse({ error: { code: "invalid_bbox", message: "Bad box." } }, 422));
      vi.stubGlobal("fetch", fetchMock);
      const api = await freshApi();

      await expect(api.postTrendWhenAwake(request)).rejects.toMatchObject({ code: "invalid_bbox" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
