import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";

type Status = "loading" | "waking" | "ok" | "error";

// Render's free tier sleeps after 15 min idle and takes ~1 min to wake up.
export const WAKING_AFTER_MS = 5000;

const LABELS: Record<Status, string> = {
  loading: "Checking API…",
  waking: "Waking up the server… this can take up to 1 minute",
  ok: "API connected",
  error: "API unavailable",
};

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    const wakingTimer = setTimeout(() => {
      if (active) {
        setStatus((current) => (current === "loading" ? "waking" : current));
      }
    }, WAKING_AFTER_MS);

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
      clearTimeout(wakingTimer);
    };
  }, []);

  return <p className={`status status-${status}`}>{LABELS[status]}</p>;
}
