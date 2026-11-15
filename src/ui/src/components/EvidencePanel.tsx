import { lazy, Suspense } from "react";
import { formatPValue, formatRegion, formatSigned } from "../lib/format";
import type { VariableState } from "../lib/usePlaceAnalyses";
import { VARIABLE_META, type VariableId } from "../lib/variables";
import { GlossaryTerm } from "./GlossaryTerm";

// Plotly is the heaviest dependency; load it only when a chart is shown.
const AnalysisChart = lazy(() => import("./AnalysisChart").then((module) => ({ default: module.AnalysisChart })));

type Props = {
  place: string;
  variable: VariableId;
  state: VariableState;
};

/** How sure we are: the chart, the plain verdict and the numbers behind it, always visible. */
export function EvidencePanel({ place, variable, state }: Props) {
  return (
    <section className="evidence" aria-label={`Evidence: ${VARIABLE_META[variable].name} in ${place}`}>
      <h3>How we know it&apos;s real</h3>
      {state.status === "loading" && <p className="evidence__wait">Waiting for the data…</p>}
      {state.status === "error" && (
        <p className="evidence__error" role="alert">
          Could not analyze this variable: {state.message} <span className="num">({state.code})</span>
        </p>
      )}
      {state.status === "done" && (
        <>
          <p className="evidence__lede">{state.analysis.verdict}</p>
          <figure className="evidence__chart">
            <Suspense fallback={<p className="evidence__wait">Loading chart…</p>}>
              <AnalysisChart analysis={state.analysis} />
            </Suspense>
            <figcaption>
              Key words: <GlossaryTerm term="anomaly">anomaly</GlossaryTerm> ·{" "}
              <GlossaryTerm term="seasonalCycle">seasonal cycle</GlossaryTerm> ·{" "}
              <GlossaryTerm term="trend">trend</GlossaryTerm>. The trend describes the past; it is not a forecast.
            </figcaption>
          </figure>
          <dl className="evidence__facts">
            <div>
              <dt>Change per decade</dt>
              <dd className="num">
                {formatSigned(state.analysis.trend.slope_per_decade)} {state.analysis.trend.slope_units}
              </dd>
            </div>
            <div>
              <dt>
                <GlossaryTerm term="confidenceInterval">95% confidence</GlossaryTerm>
              </dt>
              <dd className="num">
                {Math.min(state.analysis.trend.ci_low, state.analysis.trend.ci_high).toFixed(2)} to{" "}
                {Math.max(state.analysis.trend.ci_low, state.analysis.trend.ci_high).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>
                <GlossaryTerm term="pValue">p-value</GlossaryTerm>
              </dt>
              <dd className="num">{formatPValue(state.analysis.trend.p_value)}</dd>
            </div>
            <div>
              <dt>Months analyzed</dt>
              <dd className="num">
                {state.analysis.trend.n} · {state.analysis.trend.period_start} to {state.analysis.trend.period_end}
              </dd>
            </div>
          </dl>
          <details className="evidence__method">
            <summary>How we measured it</summary>
            <p>
              Area-weighted average of {state.analysis.series.grid_points} grid points of {state.analysis.series.source}{" "}
              over {formatRegion(state.analysis.series.bbox)}. Trend:{" "}
              <GlossaryTerm term="theilSen">Theil–Sen slope</GlossaryTerm>; significance:{" "}
              <GlossaryTerm term="mannKendall">Mann–Kendall test</GlossaryTerm> corrected for autocorrelation, α ={" "}
              {state.analysis.trend.alpha}. We describe past change; this is not a forecast and not farming advice.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
