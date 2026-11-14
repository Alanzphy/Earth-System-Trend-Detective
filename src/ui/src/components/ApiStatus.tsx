import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";

type Status = "loading" | "ok" | "error";

const LABELS: Record<Status, string> = {
  loading: "Comprobando API…",
  ok: "API conectada",
  error: "API no disponible",
};

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("loading");

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

  return <p className={`status status-${status}`}>{LABELS[status]}</p>;
}
