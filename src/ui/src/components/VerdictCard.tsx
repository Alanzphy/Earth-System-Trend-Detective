import { formatPValue, formatRegion, formatSigned, monthsBetween } from "../lib/format";
import { verdictHeadline } from "../lib/verdict";
import type { AnalysisResponse } from "../types/contracts";
import { GlossaryTerm } from "./GlossaryTerm";

type Props = {
  analysis: AnalysisResponse;
};

/**
 * The finding, framed as evidence: one number with its interval, then the plain
 * sentence, then the facts a judge needs — with the method and sample tucked
 * behind a disclosure instead of crowding the answer.
 */
export function VerdictCard({ analysis }: Props) {
  const { trend, series } = analysis;
  const headline = verdictHeadline(trend);
  const years = (monthsBetween(trend.period_start, trend.period_end) / 12).toFixed(0);
  const low = Math.min(trend.ci_low, trend.ci_high);
  const high = Math.max(trend.ci_low, trend.ci_high);
  // The band runs two spans wide so the estimate sits at its centre.
  const span = Math.abs(trend.slope_per_decade) || 1;
  const scale = 50 / (span * 2.1);
  const pText = formatPValue(trend.p_value);

  return (
    <article
      className={`verdict ${headline.significant ? "verdict--significant" : "verdict--not-significant"}`}
      aria-label="Verdict"
    >
      <h4 className="verdict__direction">
        <span aria-hidden="true">{headline.icon}</span>
        {headline.text}
      </h4>

      <div className="verdict__figure">
        <p className="verdict__number num">
          {formatSigned(trend.slope_per_decade)}
          <span>{trend.slope_units}</span>
        </p>
        <div
          className="verdict__band"
          role="img"
          aria-label={`95% confidence interval ${low.toFixed(2)} to ${high.toFixed(2)} ${trend.slope_units}`}
        >
          <i style={{ left: `${50 + low * scale}%`, width: `${(high - low) * scale}%` }} />
          <u style={{ left: `${50 + trend.slope_per_decade * scale}%` }} />
        </div>
        <p className="verdict__ci num">
          95% CI {low.toFixed(2)} → {high.toFixed(2)} · {pText}
        </p>
      </div>

      <p
        className={`verdict__badge ${headline.significant ? "verdict__badge--yes" : "verdict__badge--no"}`}
      >
        <span aria-hidden="true">{headline.significant ? "✓" : "✗"}</span>
        {headline.significant
          ? `Statistically significant · ${pText}`
          : `Not statistically significant · ${pText}`}
      </p>

      <p className="verdict__summary">{analysis.verdict}</p>

      <dl className="verdict__facts">
        <div>
          <dt>Total change</dt>
          <dd className="num">
            {formatSigned(trend.total_change)} {series.units} in {years} years
          </dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd className="num">
            {trend.period_start} → {trend.period_end}
          </dd>
        </div>
        <div>
          <dt>
            <GlossaryTerm term="pValue" />
          </dt>
          <dd className="num">{pText}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{formatRegion(series.bbox)}</dd>
        </div>
      </dl>

      <details className="verdict__details">
        <summary>How we measured it</summary>
        <dl>
          <div>
            <dt>Method</dt>
            <dd>
              {trend.method}
              {trend.deseasonalized && (
                <>
                  {" "}
                  on monthly <GlossaryTerm term="anomaly">anomalies</GlossaryTerm>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt>
              <GlossaryTerm term="significance" /> level
            </dt>
            <dd className="num">α = {trend.alpha}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd className="num">
              {trend.n} months · {series.grid_points} grid points · {series.source}
            </dd>
          </div>
          <div>
            <dt>Glossary</dt>
            <dd>
              <GlossaryTerm term="theilSen" /> · <GlossaryTerm term="mannKendall" /> ·{" "}
              <GlossaryTerm term="confidenceInterval" /> · <GlossaryTerm term="anomaly" />
            </dd>
          </div>
        </dl>
      </details>

      <p className="verdict__note">
        We describe past change; this is not a forecast.
        {!headline.significant &&
          " Not significant does not mean no change: the signal may need a longer period to stand out from natural variability."}
      </p>
    </article>
  );
}
