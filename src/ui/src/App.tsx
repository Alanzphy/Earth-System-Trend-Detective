import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiStatus } from "./components/ApiStatus";
import { DemoGallery } from "./components/DemoGallery";
import { GuidedFlow, type CatalogState } from "./components/GuidedFlow";
import { LiveAnalysis } from "./components/LiveAnalysis";
import { TrendMap } from "./components/TrendMap";
import { getVariables } from "./lib/api";
import {
  box,
  clampPeriod,
  parseFlowState,
  serializeFlowState,
  trendRequests,
  type FlowState,
} from "./lib/flow";
import type { TrendRegionSelection } from "./lib/trendMaps";
import { useWaking } from "./lib/useWaking";
import type { Variable } from "./types/contracts";

type CatalogResult =
  | { status: "loading" }
  | { status: "ready"; variables: Variable[] }
  | { status: "error"; message: string };

function App() {
  const [flow, setFlow] = useState<FlowState>(() => parseFlowState(window.location.search));
  // A shared link with a complete flow runs the analysis right away.
  const [submitted, setSubmitted] = useState<{ flow: FlowState; run: number } | null>(() => {
    const initial = parseFlowState(window.location.search);
    return initial.variable && initial.bbox ? { flow: initial, run: 0 } : null;
  });
  const [catalogResult, setCatalogResult] = useState<CatalogResult>({ status: "loading" });
  const catalogWaking = useWaking(catalogResult.status === "loading");
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const catalog: CatalogState =
    catalogResult.status === "loading" ? { status: "loading", waking: catalogWaking } : catalogResult;

  useEffect(() => {
    let active = true;
    getVariables()
      .then((response) => {
        if (active) {
          setCatalogResult({ status: "ready", variables: response.variables });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setCatalogResult({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = serializeFlowState(flow);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
  }, [flow]);

  const analyze = useCallback((next: FlowState) => {
    setSubmitted((current) => ({ flow: next, run: (current?.run ?? 0) + 1 }));
    resultsHeadingRef.current?.focus();
    document.getElementById("analysis")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, []);

  const analyzeMapRegion = useCallback(
    (region: TrendRegionSelection) => {
      const [minLon, minLat, maxLon, maxLat] = region.bbox;
      const period = { start: region.period[0], end: region.period[1] };
      const variable =
        catalogResult.status === "ready"
          ? catalogResult.variables.find((item) => item.id === region.variable)
          : undefined;
      const next: FlowState = {
        variable: region.variable,
        bbox: box(minLon, minLat, maxLon, maxLat),
        compare: null,
        ...(variable ? clampPeriod(period, variable) : period),
      };
      setFlow(next);
      analyze(next);
    },
    [analyze, catalogResult],
  );

  const panels = useMemo(
    () =>
      submitted
        ? trendRequests(submitted.flow).map((panel) => ({
            ...panel,
            key: `${submitted.run}-${panel.label}-${serializeFlowState(submitted.flow)}`,
          }))
        : [],
    [submitted],
  );

  const variableName =
    catalogResult.status === "ready" && submitted
      ? catalogResult.variables.find((item) => item.id === submitted.flow.variable)?.name
      : undefined;

  return (
    <main className="app">
      <header>
        <p className="eyebrow">NASA Space Apps 2026</p>
        <h1>Earth System Trend Detective</h1>
        <p className="lead">
          Pick an Earth variable, a region and a period to see how it changed and whether the
          trend is statistically significant.
        </p>
        <p className="disclaimer">We describe past change; this is not a forecast.</p>
        <ApiStatus />
      </header>

      <section className="panel" id="demos" aria-labelledby="demos-heading">
        <h2 id="demos-heading">Start with a demo</h2>
        <p>Ready-made, precomputed examples. They load instantly, even if the server is asleep.</p>
        <DemoGallery />
      </section>

      <section className="panel" id="trend-map-section" aria-labelledby="trend-map-heading">
        <h2 id="trend-map-heading">Where is it changing?</h2>
        <p>
          Click a cell on the map to see its trend. Faded gray areas are not statistically
          significant. Use “Analyze this region” to open it in the full analysis.
        </p>
        <TrendMap onAnalyzeRegion={analyzeMapRegion} />
      </section>

      <section className="panel" id="explore" aria-labelledby="explore-heading">
        <h2 id="explore-heading">Explore a region</h2>
        <GuidedFlow
          catalog={catalog}
          flow={flow}
          onChange={setFlow}
          onAnalyze={() => analyze(flow)}
        />
      </section>

      <section className="panel" id="analysis" aria-labelledby="analysis-heading">
        <h2 id="analysis-heading" ref={resultsHeadingRef} tabIndex={-1}>
          {panels.length > 1 ? "Comparing two regions" : "Results"}
        </h2>
        {panels.length === 0 && (
          <p>Choose a variable, a region and a period above, then press “Analyze”.</p>
        )}
        {panels.length > 0 && (
          <p>
            {variableName ?? submitted?.flow.variable} · {submitted?.flow.start} to{" "}
            {submitted?.flow.end}
            {panels.length > 1 && " · same variable and period for both regions"}
          </p>
        )}
        <div className={panels.length > 1 ? "compare-grid" : undefined}>
          {panels.map((panel) => (
            <LiveAnalysis key={panel.key} label={panel.label} request={panel.request} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
