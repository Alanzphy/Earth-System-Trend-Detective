import { useEffect, useState } from "react";
import { ApiError, postTrend } from "../lib/api";
import { useWaking, WAKING_MESSAGE } from "../lib/useWaking";
import type { AnalysisResponse, TrendRequest } from "../types/contracts";
import { AnalysisResult } from "./AnalysisResult";

type Props = {
  label: string;
  request: TrendRequest;
};

type State =
  | { status: "loading" }
  | { status: "done"; analysis: AnalysisResponse }
  | { status: "error"; code: string; message: string };

/** Runs POST /trend for one region. Remount (via `key`) to run a new request. */
export function LiveAnalysis({ label, request }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });
  const waking = useWaking(state.status === "loading");

  useEffect(() => {
    let active = true;
    postTrend(request)
      .then((analysis) => {
        if (active) {
          setState({ status: "done", analysis });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState(
            error instanceof ApiError
              ? { status: "error", code: error.code, message: error.message }
              : { status: "error", code: "unknown", message: "Something went wrong." },
          );
        }
      });
    return () => {
      active = false;
    };
  }, [request]);

  if (state.status === "done") {
    return <AnalysisResult label={label} analysis={state.analysis} />;
  }

  return (
    <section className="analysis-result" aria-label={label} aria-busy={state.status === "loading"}>
      <h3>{label}</h3>
      {state.status === "loading" ? (
        <p className="analysis-result__loading" role="status">
          {waking ? WAKING_MESSAGE : "Preparing NASA data…"}
        </p>
      ) : (
        <div className="analysis-result__error" role="alert">
          <p>
            <strong>Could not analyze this region.</strong> {state.message}
          </p>
          <p className="analysis-result__code">Error code: {state.code}</p>
        </div>
      )}
    </section>
  );
}
