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

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    isRecord(value) &&
    isRecord(value.error) &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string"
  );
}
