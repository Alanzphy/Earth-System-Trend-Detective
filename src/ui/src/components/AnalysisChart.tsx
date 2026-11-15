import type { AnalysisResponse } from "../types/contracts";
import { Plot } from "./Plot";

type Props = {
  analysis: AnalysisResponse;
};

/**
 * Two stacked panels sharing the time axis: the raw monthly series on top and
 * the anomalies (seasonal cycle removed) with the fitted trend below. The trend
 * line is drawn only over the analyzed months; it is never extended.
 */
export function AnalysisChart({ analysis }: Props) {
  const { series, anomalies, trend_line: trendLine, trend } = analysis;
  const units = series.units;

  return (
    <Plot
      data={[
        {
          x: series.time,
          y: series.values,
          type: "scatter",
          mode: "lines",
          name: "Monthly values",
          line: { color: "#486581", width: 1 },
          hovertemplate: `%{x}: %{y:.2f} ${units}<extra></extra>`,
        },
        {
          x: series.time,
          y: anomalies,
          type: "scatter",
          mode: "lines",
          name: "Anomalies (seasonal cycle removed)",
          xaxis: "x2",
          yaxis: "y2",
          line: { color: "#9fb3c8", width: 1 },
          hovertemplate: `%{x}: %{y:+.2f} ${units}<extra></extra>`,
        },
        {
          x: series.time,
          y: trendLine,
          type: "scatter",
          mode: "lines",
          name: `Trend (${trend.slope_units})`,
          xaxis: "x2",
          yaxis: "y2",
          connectgaps: true,
          line: { color: "#102a43", width: 3, dash: "dash" },
          hovertemplate: `%{x}: %{y:+.2f} ${units}<extra></extra>`,
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 56, r: 16, t: 24, b: 40 },
        legend: { orientation: "h", y: -0.12 },
        xaxis: { anchor: "y", showticklabels: false, type: "date" },
        yaxis: { domain: [0.56, 1], title: { text: `Value (${units})` } },
        xaxis2: { anchor: "y2", matches: "x", type: "date" },
        yaxis2: {
          domain: [0, 0.44],
          title: { text: `Anomaly (${units})` },
          zeroline: true,
          zerolinecolor: "#829ab1",
        },
        annotations: [
          annotationTitle("Raw monthly series", 1),
          annotationTitle("Anomalies and trend", 0.44),
        ],
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "420px" }}
    />
  );
}

function annotationTitle(text: string, y: number) {
  return {
    text,
    xref: "paper" as const,
    yref: "paper" as const,
    x: 0,
    y,
    xanchor: "left" as const,
    yanchor: "bottom" as const,
    showarrow: false,
    font: { size: 12, color: "#334e68" },
  };
}
