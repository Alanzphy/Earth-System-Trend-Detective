import { useEffect, useState } from "react";

// Render's free tier sleeps after 15 min idle and takes ~1 min to wake up.
export const WAKING_AFTER_MS = 5000;

export const WAKING_MESSAGE = "Waking up the server… this can take up to 1 minute";

/** True once a request has been pending for WAKING_AFTER_MS (the API is probably asleep). */
export function useWaking(pending: boolean): boolean {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    if (!pending) {
      return;
    }
    const timer = setTimeout(() => setWaking(true), WAKING_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setWaking(false);
    };
  }, [pending]);

  return pending && waking;
}
