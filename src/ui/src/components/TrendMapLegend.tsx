import { colorForSlope, type TrendMapManifestEntry } from "../lib/trendMaps";

type Props = {
  entry: TrendMapManifestEntry;
  isSample?: boolean;
};

export function TrendMapLegend({ entry, isSample = false }: Props) {
  const ticks = [entry.legend.min, 0, entry.legend.max].filter(
    (tick, index, all) => all.indexOf(tick) === index && tick >= entry.legend.min && tick <= entry.legend.max,
  );

  return (
    <div className="trend-map__legend">
      <div className="trend-map__legend-header">
        <strong>{entry.title}</strong>
        {isSample && <span className="trend-map__badge">Sample data</span>}
      </div>

      <div
        className="trend-map__gradient"
        role="img"
        aria-label={`Color scale from ${entry.legend.min} to ${entry.legend.max} ${entry.slopeUnits}`}
      />

      <div className="trend-map__ticks">
        {ticks.map((tick) => (
          <span key={tick} style={{ color: colorForSlope(tick, entry.legend) }}>
            {tick.toFixed(2)}
          </span>
        ))}
      </div>

      <p className="trend-map__units">
        Trend in {entry.slopeUnits} · {entry.units} · {entry.period[0]} to {entry.period[1]}
      </p>
      <p className="trend-map__note">
        Faded areas are not statistically significant (p ≥ 0.05 after FDR correction).
      </p>
      {isSample && (
        <p className="trend-map__note">
          Sample data for the interface; generated maps from the pipeline will replace it.
        </p>
      )}
    </div>
  );
}
