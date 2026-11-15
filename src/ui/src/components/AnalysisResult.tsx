import { lazy, Suspense } from "react";
import type { AnalysisResponse } from "../types/contracts";
import { GlossaryTerm } from "./GlossaryTerm";
import { VerdictCard } from "./VerdictCard";

// Plotly is the heaviest dependency; load it only when a chart is shown.
const AnalysisChart = lazy(() =>
  import("./AnalysisChart").then((module) => ({ default: module.AnalysisChart })),
);

type Props = {
  label: string;
  analysis: AnalysisResponse;
};

/** Chart + verdict for one region; shared by live analysis and demos. */
export function AnalysisResult({ label, analysis }: Props) {
  return (
    <section className="analysis-result" aria-label={label}>
      <h3>{label}</h3>
      <VerdictCard analysis={analysis} />
      <figure className="analysis-result__chart">
        <Suspense fallback={<p>Loading chart…</p>}>
          <AnalysisChart analysis={analysis} />
        </Suspense>
        <figcaption>
          Monthly <GlossaryTerm term="anomaly">anomalies</GlossaryTerm>, with the{" "}
          <GlossaryTerm term="seasonalCycle">seasonal cycle</GlossaryTerm> removed.
          The solid line shows the <GlossaryTerm term="trend">trend</GlossaryTerm>, not a forecast.
        </figcaption>
      </figure>
    </section>
  );
}
