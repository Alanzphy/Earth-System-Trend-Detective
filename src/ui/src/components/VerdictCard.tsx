import { formatPValue, formatRegion, formatSigned, monthsBetween } from "../lib/format";
import { significanceText, verdictHeadline } from "../lib/verdict";
import type { AnalysisResponse } from "../types/contracts";
import { GlossaryTerm } from "./GlossaryTerm";

type Props = {
  analysis: AnalysisResponse;
};

export function VerdictCard({ analysis }: Props) {
  const { trend, series } = analysis;
  const headline = verdictHeadline(trend);
  const years = (monthsBetween(trend.period_start, trend.period_end) / 12).toFixed(0);

  return (
    <article
      className={`verdict ${headline.significant ? "verdict--significant" : "verdict--not-significant"}`}
      aria-label="Verdict"
    >
      <h4 className="verdict__headline">
        <span className="verdict__icon" aria-hidden="true">
          {headline.icon}
        </span>
        {headline.text}
      </h4>

      <p className={`verdict__badge ${headline.significant ? "verdict__badge--yes" : "verdict__badge--no"}`}>
        <span aria-hidden="true">{headline.significant ? "✓ " : "✗ "}</span>
        {significanceText(headline.significant, trend.alpha)}
      </p>

      <p className="verdict__summary">{analysis.verdict}</p>

      <dl className="verdict__facts">
        <div>
          <dt>
            <GlossaryTerm term="trendSlope">Trend</GlossaryTerm> per decade
          </dt>
          <dd>
            {formatSigned(trend.slope_per_decade)} {trend.slope_units}
          </dd>
        </div>
        <div>
          <dt>
            95% <GlossaryTerm term="confidenceInterval">confidence interval</GlossaryTerm>
          </dt>
          <dd>
            {formatSigned(trend.ci_low)} to {formatSigned(trend.ci_high)} {trend.slope_units}
          </dd>
        </div>
        <div>
          <dt>Total change over the period</dt>
          <dd>
            {formatSigned(trend.total_change)} {series.units} in about {years} years
          </dd>
        </div>
        <div>
          <dt>
            <GlossaryTerm term="pValue" />
          </dt>
          <dd>{formatPValue(trend.p_value)}</dd>
        </div>
        <div>
          <dt>
            <GlossaryTerm term="significance" /> level
          </dt>
          <dd>α = {trend.alpha}</dd>
        </div>
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
            <span className="verdict__learn">
              Learn: <GlossaryTerm term="theilSen" /> <GlossaryTerm term="mannKendall" />
            </span>
          </dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd>
            {trend.period_start} to {trend.period_end} (monthly)
          </dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{formatRegion(series.bbox)}</dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>
            n = {trend.n} months · {series.grid_points} grid points · {series.source}
          </dd>
        </div>
      </dl>

      <p className="verdict__note">
        We describe past change; this is not a forecast.
        {!headline.significant &&
          " Not significant does not mean no change: the signal may need a longer period to stand out from natural variability."}
      </p>
    </article>
  );
}
