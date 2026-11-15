import { useEffect, useState } from "react";
import { loadDemo, loadDemoManifest } from "../lib/demos";
import { formatPValue, formatSigned } from "../lib/format";
import { significanceText, verdictHeadline } from "../lib/verdict";
import type { AnalysisResponse, DemoManifest } from "../types/contracts";

type State =
  | { status: "loading" }
  | { status: "ready"; analysis: AnalysisResponse; label: string; variable: string }
  | { status: "error" };

/**
 * The hero's evidence card: one real finding, framed as a finding (magnitude,
 * interval, p-value, region) rather than as a marketing stat. Reads the same
 * precomputed demo file the gallery opens, so it works with the API asleep.
 */
export function FindingCard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    loadDemoManifest()
      .then(async (manifest: DemoManifest) => {
        const summary = manifest.demos[0];
        if (!summary) {
          throw new Error("no demos");
        }
        const demo = await loadDemo(summary.file);
        const panel = demo.panels[0];
        if (active && panel) {
          setState({
            status: "ready",
            analysis: panel.analysis,
            label: panel.label,
            variable: demo.title,
          });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: "error" });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (state.status !== "ready") {
    return null;
  }

  const { trend, series } = state.analysis;
  const headline = verdictHeadline(trend);
  const period = `${trend.period_start.slice(0, 4)}–${trend.period_end.slice(0, 4)}`;
  const span = Math.abs(trend.slope_per_decade);
  const low = Math.min(trend.ci_low, trend.ci_high);
  const high = Math.max(trend.ci_low, trend.ci_high);
  // The bar runs two spans wide, so the point estimate sits exactly at its centre.
  const scale = span === 0 ? 0 : 50 / (span * 2.1);

  return (
    <article className="finding" aria-label="Example finding">
      <p className="finding__meta num">
        {state.label} · {series.units} · {period} · n={trend.n}
      </p>

      <p className="finding__value num">
        {formatSigned(trend.slope_per_decade)}
        <span>{trend.slope_units}</span>
      </p>

      <div
        className="finding__interval"
        role="img"
        aria-label={`95% confidence interval ${low.toFixed(2)} to ${high.toFixed(2)} ${trend.slope_units}`}
      >
        <i
          style={{
            left: `${50 + low * scale}%`,
            width: `${(high - low) * scale}%`,
          }}
        />
        <u style={{ left: `${50 + trend.slope_per_decade * scale}%` }} />
      </div>

      <p className="finding__p num">
        {formatPValue(trend.p_value)} · 95% CI {low.toFixed(2)} → {high.toFixed(2)}
      </p>

      <p className={`finding__badge ${headline.significant ? "is-yes" : "is-no"}`}>
        <span aria-hidden="true">{headline.significant ? "✓" : "✗"}</span>
        {significanceText(headline.significant, trend.alpha)}
      </p>

      <p className="finding__verdict">{state.analysis.verdict}</p>
    </article>
  );
}
