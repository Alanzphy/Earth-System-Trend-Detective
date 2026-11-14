import Plot from "react-plotly.js";

const TIME = Array.from(
  { length: 24 },
  (_, index) => `2020-${String((index % 12) + 1).padStart(2, "0")}`,
);

const VALUES = TIME.map(
  (_, index) => 10 + 3 * Math.sin((2 * Math.PI * index) / 12) + 0.08 * index,
);

const TREND = TIME.map((_, index) => 10 + 0.08 * index);

export function TrendChart() {
  return (
    <Plot
      data={[
        {
          x: TIME,
          y: VALUES,
          type: "scatter",
          mode: "lines",
          name: "Serie de ejemplo",
        },
        {
          x: TIME,
          y: TREND,
          type: "scatter",
          mode: "lines",
          name: "Tendencia",
          line: { dash: "dash" },
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 48, r: 16, t: 16, b: 48 },
        legend: { orientation: "h" },
        yaxis: { title: { text: "Temperatura (°C)" } },
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "320px" }}
    />
  );
}
