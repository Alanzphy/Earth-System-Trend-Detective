import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";
import { useWaking, WAKING_MESSAGE } from "../lib/useWaking";

type Status = "loading" | "ok" | "error";

const LABELS: Record<Status, string> = {
  loading: "Checking the live service…",
  ok: "Live analysis available",
  error: "Live analysis is asleep — demos and maps still work",
};

/**
 * Health of the free backend, phrased for a visitor rather than for a developer:
 * "API unavailable" in red told a judge the product was broken when only the
 * on-demand analysis was.
 */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const waking = useWaking(status === "loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    getHealth()
      .then(() => {
        if (active) {
          setStatus("ok");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  if (status === "ok") {
    return (
      <p className="status status-ok" role="status">
        {LABELS.ok}
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="status status-error" role="status">
        {LABELS.error}
        <button type="button" className="status__retry" onClick={() => setAttempt((n) => n + 1)}>
          Try again
        </button>
      </p>
    );
  }

  return (
    <p className="status status-waking" role="status">
      {waking ? WAKING_MESSAGE : LABELS.loading}
    </p>
  );
}
