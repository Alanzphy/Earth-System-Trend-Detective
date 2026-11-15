import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ChartScaleContext, type ChartDomain } from "../lib/chartScale";

/** All charts in one investigation share the union of their anomaly ranges. */
export function ComparisonScale({ children }: { children: ReactNode }) {
  const [ranges, setRanges] = useState<Record<string, ChartDomain>>({});
  const register = useCallback((id: string, domain: ChartDomain | null) => {
    setRanges((current) => {
      if (domain && current[id]?.[0] === domain[0] && current[id]?.[1] === domain[1]) return current;
      const next = { ...current };
      if (domain) next[id] = domain;
      else delete next[id];
      return next;
    });
  }, []);
  const value = useMemo(() => {
    const domains = Object.values(ranges);
    const extent = domains.length ? Math.max(...domains.map((range) => range[1])) : null;
    return { domain: extent === null ? null : [-extent, extent] as ChartDomain, register };
  }, [ranges, register]);
  return <ChartScaleContext.Provider value={value}>{children}</ChartScaleContext.Provider>;
}
