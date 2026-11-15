import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";
import { useWaking, WAKING_MESSAGE } from "../lib/useWaking";

type Status = "loading" | "ok" | "error";

const LABELS: Record<Status, string> = {
  loading: "Checking API…",
  ok: "API connected",
  error: "API unavailable",
};

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const waking = useWaking(status === "loading");

  useEffect(() => {
    let active = true;

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
  }, []);

  return (
    <p className={`status status-${waking ? "waking" : status}`} role="status">
      {waking ? WAKING_MESSAGE : LABELS[status]}
    </p>
  );
}
