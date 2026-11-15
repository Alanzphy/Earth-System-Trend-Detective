import { useContext, useEffect, useId, useMemo, useState } from "react";
import { ChartScaleContext } from "../lib/chartScale";
import { symmetricDomain } from "../lib/scale";
import type { AnalysisResponse } from "../types/contracts";
import { Plot } from "./Plot";

type Props = {
  analysis: AnalysisResponse;
};

type View = "anomalies" | "raw";

const INK = "#39436a";
const SERIES = "#8b95b8";
const TREND = "#ff6a1a";

/**
 * Two views of the same months in one fixed-height frame, so switching never moves the
 * page: the anomalies with their trend (the answer) and the raw values (why the seasons
 * have to be removed first). The trend line is solid and stops at the last month: solid
 * means measured, dashed would mean projected.
 */
export function AnalysisChart({ analysis }: Props) {
  const { series, anomalies, trend_line: trendLine, trend } = analysis;
  const [view, setView] = useState<View>("anomalies");
  const units = series.units;
  const localDomain = useMemo(() => symmetricDomain(anomalies), [anomalies]);
  const sharedScale = useContext(ChartScaleContext);
  const register = sharedScale?.register;
  const id = useId();
  useEffect(() => {
    register?.(id, localDomain);
    return () => register?.(id, null);
  }, [id, localDomain, register]);
  const anomalyDomain = sharedScale?.domain ?? localDomain;
  const raw = view === "raw";

  return (
    <div className="chart">
      <div className="chart__views" role="group" aria-label="Chart view">
        <button type="button" aria-pressed={!raw} onClick={() => setView("anomalies")}>
          Without seasons
        </button>
        <button type="button" aria-pressed={raw} onClick={() => setView("raw")}>
          Raw monthly values
        </button>
      </div>

      <ul className="chart__legend" aria-hidden="true">
        {raw ? (
          <li>
            <i style={{ background: SERIES }} /> Monthly value ({units})
          </li>
        ) : (
          <>
            <li>
              <i style={{ background: SERIES }} /> Monthly anomaly
            </li>
            <li>
              <i className="is-thick" style={{ background: TREND }} /> Trend ({trend.slope_units})
            </li>
          </>
        )}
      </ul>

      <div className="chart__plot">
        <Plot
          data={
            raw
              ? [
                  {
                    x: series.time,
                    y: series.values,
                    type: "scatter",
                    mode: "lines",
                    name: "Monthly values",
                    line: { color: SERIES, width: 1.1 },
                    hovertemplate: `%{x|%b %Y}: %{y:.2f} ${units}<extra></extra>`,
                  },
                ]
              : [
                  {
                    x: series.time,
                    y: anomalies,
                    type: "scatter",
                    mode: "lines",
                    name: "Anomalies",
                    line: { color: SERIES, width: 1.1 },
                    hovertemplate: `%{x|%b %Y}: %{y:+.2f} ${units}<extra></extra>`,
                  },
                  {
                    x: series.time,
                    y: trendLine,
                    type: "scatter",
                    mode: "lines",
                    name: "Trend",
                    connectgaps: true,
                    line: { color: TREND, width: 3.5 },
                    hovertemplate: `%{x|%b %Y}: %{y:+.2f} ${units}<extra></extra>`,
                  },
                ]
          }
          layout={{
            autosize: true,
            showlegend: false,
            margin: { l: 8, r: 8, t: 8, b: 8 },
            xaxis: { type: "date", showgrid: false, automargin: true, fixedrange: true },
            yaxis: {
              title: { text: raw ? units : `Anomaly (${units})`, standoff: 8 },
              automargin: true,
              fixedrange: true,
              zeroline: !raw,
              zerolinecolor: "#b3bdd6",
              gridcolor: "#e9edf7",
              ...(raw ? {} : { range: anomalyDomain }),
            },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { family: "Archivo Variable, system-ui, sans-serif", size: 12, color: INK },
          }}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <p className="chart__note">
        {raw
          ? "The big waves are summer and winter. They hide slow change, so we compare each month with its own normal."
          : "Each month compared with its normal. Above zero: warmer, wetter or more than usual for that month."}
      </p>
    </div>
  );
}
