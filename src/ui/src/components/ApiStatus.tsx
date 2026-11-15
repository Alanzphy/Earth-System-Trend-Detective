import { useEffect, useState } from "react";
import { ensureAwake } from "../lib/api";
import { useWaking, WAKING_MESSAGE } from "../lib/useWaking";

type Status = "loading" | "ok" | "error";

/**
 * Health of the free backend, phrased for a visitor. It waits for a cold start (about a
 * minute on Render's free plan) instead of reporting the first failed request as an outage.
 */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const waking = useWaking(status === "loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    ensureAwake()
      .then(() => active && setStatus("ok"))
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [attempt]);

  if (status === "ok") {
    return (
      <p className="status status-ok" role="status">
        Live analysis available
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="status status-error" role="status">
        Live analysis is not responding — places, cases and maps still work
        <button type="button" className="status__retry" onClick={() => setAttempt((n) => n + 1)}>
          Try again
        </button>
      </p>
    );
  }

  return (
    <p className="status status-waking" role="status">
      {waking ? WAKING_MESSAGE : "Checking the live service…"}
    </p>
  );
}
