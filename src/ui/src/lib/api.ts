import type {
  AnalysisResponse,
  CatalogResponse,
  ErrorResponse,
  TrendRequest,
} from "../types/contracts";
import { isRecord } from "./guards";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/** Error with the API's `ErrorResponse` code and a message ready to show to students. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number | null;

  constructor(code: string, message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "network_error",
      "Could not reach the server. Check your connection and try again in a minute.",
    );
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (isErrorResponse(body)) {
      throw new ApiError(body.error.code, body.error.message, response.status);
    }
    throw new ApiError(
      `http_${response.status}`,
      `The server could not complete the request (HTTP ${response.status}).`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return fetchJson<{ status: string }>("/health");
}

export function getVariables() {
  return fetchJson<CatalogResponse>("/variables");
}

export function postTrend(request: TrendRequest) {
  return fetchJson<AnalysisResponse>("/trend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

/** How long to wait for Render's free plan to start the server before giving up. */
export const WAKE_TIMEOUT_MS = 90_000;
const WAKE_RETRY_MS = 3_000;

/** While the server starts, requests fail with a network error or a 502–504 from the proxy. */
export function isWakingError(error: unknown): boolean {
  return error instanceof ApiError && (error.code === "network_error" || [502, 503, 504].includes(error.status ?? 0));
}

let wake: Promise<void> | null = null;

/**
 * Resolves once /health answers, retrying while the server starts (up to WAKE_TIMEOUT_MS).
 * One shared attempt for every caller, so eight analyses do not each poll the server.
 */
export function ensureAwake(): Promise<void> {
  wake ??= (async () => {
    const deadline = Date.now() + WAKE_TIMEOUT_MS;
    for (;;) {
      try {
        await getHealth();
        return;
      } catch (error) {
        if (!isWakingError(error) || Date.now() + WAKE_RETRY_MS > deadline) {
          wake = null;
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_MS));
      }
    }
  })();
  return wake;
}

/** POST /trend once the server is up; if it fell asleep again since, wake it once more. */
export async function postTrendWhenAwake(request: TrendRequest): Promise<AnalysisResponse> {
  await ensureAwake();
  try {
    return await postTrend(request);
  } catch (error) {
    if (!isWakingError(error)) {
      throw error;
    }
    wake = null;
    await ensureAwake();
    return postTrend(request);
  }
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    isRecord(value) &&
    isRecord(value.error) &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string"
  );
}
