import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiStatus } from "./components/ApiStatus";
import { DemoGallery } from "./components/DemoGallery";
import { ComparisonScale } from "./components/ComparisonScale";
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
  // A guided example can be opened from the introduction without configuring a request.
  const [openCase, setOpenCase] = useState<{ id: string; nonce: number } | null>(null);
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
  }, []);

  useEffect(() => {
    if (submitted) {
      resultsHeadingRef.current?.focus();
      document.getElementById("analysis")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [submitted]);

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
    <div className="site">
      <a className="skip-link" href="#explore">Skip to exploration</a>
      <header className="site-header">
        <a className="brand" href="#top">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="13" />
            <ellipse cx="16" cy="16" rx="6" ry="13" />
            <path d="M3 16h26M6 8.5h20M6 23.5h20" />
          </svg>
          Earth Trend Detective
        </a>
        <nav className="site-nav" aria-label="Sections">
          <a href="#explore">Explore</a>
          <a href="#demos">Cases</a>
          <a href="#method">How it works</a>
        </nav>
      </header>

      <main className="app" id="top">
        <section className="introduction" aria-labelledby="page-heading">
          <h1 id="page-heading">What is changing<br />on <span>Earth?</span></h1>
          <div className="introduction__copy">
            <p>Warmer here. Drier there. Explore NASA data to find what is changing,
              where, and whether the change stands out from natural variation.</p>
            <button className="text-action" type="button" onClick={() =>
              setOpenCase((current) => ({
                id: "rain-opposite-directions",
                nonce: (current?.nonce ?? 0) + 1,
              }))
            }>New here? Start with a real example <span aria-hidden="true">→</span></button>
          </div>
        </section>

        <div className="workspace">
          <section className="investigation" id="explore" aria-labelledby="explore-heading">
            <div className="investigation__heading">
              <h2 id="explore-heading">Your investigation</h2>
              <p>A variable. A place. A little curiosity.</p>
            </div>
            <GuidedFlow
              catalog={catalog}
              flow={flow}
              onChange={setFlow}
              onAnalyze={() => analyze(flow)}
            />
          </section>

          <section className="atlas" id="trend-map-section" aria-labelledby="trend-map-heading">
            <div className="atlas__heading">
              <div>
                <h2 id="trend-map-heading">Where is it changing?</h2>
                <p>Click a cell to investigate its trend.</p>
              </div>
              <a href="#map-reading">How to read this map</a>
            </div>
            <TrendMap onAnalyzeRegion={analyzeMapRegion} />
          </section>
        </div>

        {panels.length > 0 && (
          <section className="results section-wrap" id="analysis" aria-labelledby="analysis-heading">
            <div className="section-heading">
              <div>
                <h2 id="analysis-heading" ref={resultsHeadingRef} tabIndex={-1}>
                  {panels.length > 1 ? "Comparing two regions" : "What the data tells us"}
                </h2>
                <p className="results__meta">
                  {variableName ?? submitted?.flow.variable} · {submitted?.flow.start} to{" "}
                  {submitted?.flow.end}
                  {panels.length > 1 && " · same variable and period for both regions"}
                </p>
              </div>
              <a href="#explore">Change your investigation</a>
            </div>
            <ComparisonScale key={submitted?.run}>
            <div className={panels.length > 1 ? "compare-grid" : undefined}>
              {panels.map((panel) => (
                <LiveAnalysis key={panel.key} label={panel.label} request={panel.request} />
              ))}
            </div>
            </ComparisonScale>
          </section>
        )}

        <section className="cases section-wrap" id="demos" aria-labelledby="demos-heading">
          <div className="section-heading">
            <h2 id="demos-heading">One planet. Different stories.</h2>
            <p>Start with the evidence. These real examples work even when live analysis is asleep.</p>
          </div>
          <DemoGallery autoOpen={openCase} />
        </section>

        <section className="method section-wrap" id="method" aria-labelledby="method-heading">
          <div className="method__intro">
            <h2 id="method-heading">Find a trend.<br />Question the evidence.</h2>
            <p>We describe past change. This is not a forecast.</p>
          </div>
          <div className="method__explanations">
            <div id="map-reading">
              <h3>Read the map</h3>
              <p>Color shows the direction and speed of change, not the temperature or rainfall
                itself. Gray cells do not pass the statistical test. The scale changes with the variable.</p>
            </div>
            <div>
              <h3>Look beyond the seasons</h3>
              <p>We remove the repeating seasonal cycle before fitting a trend. That helps separate
                a long-term change from a normal summer or winter.</p>
            </div>
            <div>
              <h3>Ask: could it be chance?</h3>
              <p>A statistical test checks the evidence for a trend. Not significant does not mean
                no change; a longer record may reveal more. Open “How we measured it” for the method and uncertainty.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>NASA POWER data · MERRA-2 &amp; CERES<br />Independent project. Not affiliated with or endorsed by NASA.</p>
        <ApiStatus />
      </footer>
    </div>
  );
}

export default App;
