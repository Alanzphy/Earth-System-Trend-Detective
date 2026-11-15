import { useContext, useEffect, useId, useMemo, useState } from "react";
import { ChartScaleContext } from "../lib/chartScale";
import { symmetricDomain } from "../lib/scale";
import type { AnalysisResponse } from "../types/contracts";
import { Plot } from "./Plot";

type Props = {
  analysis: AnalysisResponse;
};

/**
 * The anomalies (seasonal cycle removed) with the fitted trend are the answer;
 * the raw monthly values are evidence, so they start collapsed behind a toggle.
 * The trend line is solid and stops at the last month: solid means measured,
 * dashed would mean projected — the opposite of what this tool claims.
 */
export function AnalysisChart({ analysis }: Props) {
  const { series, anomalies, trend_line: trendLine, trend } = analysis;
  const [showRaw, setShowRaw] = useState(false);
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

  return (
    <div className="chart">
      <Plot
        data={[
          ...(showRaw
            ? [
                {
                  x: series.time,
                  y: series.values,
                  type: "scatter" as const,
                  mode: "lines" as const,
                  name: "Monthly values",
                  line: { color: "#9aa7b4", width: 1 },
                  yaxis: "y2",
                  hovertemplate: `%{x}: %{y:.2f} ${units}<extra></extra>`,
                },
              ]
            : []),
          {
            x: series.time,
            y: anomalies,
            type: "scatter",
            mode: "lines",
            name: "Anomalies",
            line: { color: "#8b95b8", width: 1.1 },
            hovertemplate: `%{x}: %{y:+.2f} ${units}<extra></extra>`,
          },
          {
            x: series.time,
            y: trendLine,
            type: "scatter",
            mode: "lines",
            name: `Trend · ${trend.slope_units}`,
            connectgaps: true,
            line: { color: "#ff6a1a", width: 3.5 },
            hovertemplate: `%{x}: %{y:+.2f} ${units}<extra></extra>`,
          },
        ]}
        layout={{
          autosize: true,
          margin: { l: 56, r: 16, t: 12, b: 36 },
          legend: { orientation: "h", y: -0.16, x: 0 },
          xaxis: { type: "date", showgrid: false },
          yaxis: {
            title: { text: `Anomaly (${units})` },
            zeroline: true,
            zerolinecolor: "#b3bdd6",
            range: anomalyDomain,
            domain: showRaw ? [0, 0.45] : [0, 1],
          },
          ...(showRaw ? { yaxis2: {
            title: { text: `Monthly value (${units})` },
            domain: [0.65, 1], anchor: "x",
            zeroline: false,
          } } : {}),
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { family: "Archivo Variable, system-ui, sans-serif", size: 12, color: "#39436a" },
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%", height: showRaw ? "480px" : "300px" }}
      />

      <button type="button" className="chart__toggle" onClick={() => setShowRaw((open) => !open)}>
        {showRaw ? "Hide the raw monthly values" : "Show the raw monthly values"}
      </button>
    </div>
  );
}
