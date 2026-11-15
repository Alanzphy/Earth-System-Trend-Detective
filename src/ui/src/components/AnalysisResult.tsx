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
          Key words: <GlossaryTerm term="anomaly">anomaly</GlossaryTerm> ·{" "}
          <GlossaryTerm term="seasonalCycle">seasonal cycle</GlossaryTerm> ·{" "}
          <GlossaryTerm term="trend">trend</GlossaryTerm>. The trend describes the past; it is not a forecast.
        </figcaption>
      </figure>
    </section>
  );
}
