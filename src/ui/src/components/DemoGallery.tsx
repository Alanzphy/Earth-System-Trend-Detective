import { useCallback, useEffect, useRef, useState } from "react";
import { loadDemo, loadDemoManifest } from "../lib/demos";
import { formatPValue, formatSigned } from "../lib/format";
import type { Demo, DemoSummary } from "../types/contracts";
import { AnalysisResult } from "./AnalysisResult";
import { ComparisonScale } from "./ComparisonScale";

type Opened =
  | { status: "loading"; id: string }
  | { status: "done"; id: string; demo: Demo }
  | { status: "error"; id: string; message: string };

type Props = {
  /** Open a guided case from the introduction; nonce supports repeated requests. */
  autoOpen?: { id: string; nonce: number } | null;
};

function Preview({ demo }: { demo: Demo }) {
  const extent = Math.max(0.001, ...demo.panels.flatMap(({ analysis }) =>
    analysis.anomalies.map((value) => Math.abs(value ?? 0))));
  return (
    <span className="case-evidence">
      {demo.panels.map(({ label, analysis }) => {
        function path(values: (number | null)[]) {
          let penDown = false;
          return values.map((value, index) => {
            if (value === null) { penDown = false; return ""; }
            const command = penDown ? "L" : "M";
            penDown = true;
            return `${command}${(index / Math.max(1, values.length - 1) * 240).toFixed(1)},${(38 - value / extent * 30).toFixed(1)}`;
          }).join(" ");
        }
        return (
          <span className={`case-evidence__region ${
            (analysis.series.variable === "precipitation"
              ? analysis.trend.slope_per_decade > 0
              : analysis.trend.slope_per_decade < 0) ? "is-cool" : ""
          }`} key={label}>
            <span className="case-evidence__place">{label}</span>
            <span className="case-evidence__value num">
              {formatSigned(analysis.trend.slope_per_decade)} <small>{analysis.trend.slope_units}</small>
            </span>
            <svg viewBox="0 0 240 76" aria-hidden="true" preserveAspectRatio="none">
              <path d="M0 38H240" className="case-evidence__zero" />
              <path d={path(analysis.anomalies)} className="case-evidence__series" />
              <path d={path(analysis.trend_line)} className="case-evidence__trend" />
            </svg>
            <span className="case-evidence__confidence">
              {analysis.trend.significant ? "Statistically significant" : "Not significant"} · {formatPValue(analysis.trend.p_value)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Precomputed demos from public/demos/; they work while the API sleeps. */
export function DemoGallery({ autoOpen }: Props = {}) {
  const [demos, setDemos] = useState<DemoSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [previews, setPreviews] = useState<Record<string, Demo>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const openedRef = useRef<HTMLElement>(null);
  const handledNonce = useRef(0);

  useEffect(() => {
    let active = true;
    loadDemoManifest()
      .then((manifest) => {
        if (active) {
          setDemos(manifest.demos);
        }
        for (const summary of manifest.demos) {
          loadDemo(summary.file).then((demo) => {
            if (active) setPreviews((current) => ({ ...current, [summary.id]: demo }));
          }).catch((error: unknown) => {
            if (active) setPreviewErrors((current) => ({
              ...current, [summary.id]: error instanceof Error ? error.message : "Preview unavailable",
            }));
          });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setListError(error instanceof Error ? error.message : "Unknown error");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const open = useCallback(async (summary: DemoSummary) => {
    setOpened({ status: "loading", id: summary.id });
    try {
      const demo = previews[summary.id] ?? await loadDemo(summary.file);
      setOpened((current) =>
        current?.id === summary.id ? { status: "done", id: summary.id, demo } : current,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setOpened((current) =>
        current?.id === summary.id ? { status: "error", id: summary.id, message } : current,
      );
    }
  }, [previews]);

  useEffect(() => {
    if (!autoOpen || !demos || autoOpen.nonce === handledNonce.current) {
      return;
    }
    const summary = demos.find((item) => item.id === autoOpen.id);
    if (!summary) {
      return;
    }
    handledNonce.current = autoOpen.nonce;
    void open(summary);
    document.getElementById("demos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [autoOpen, demos, open]);

  useEffect(() => {
    if (opened?.status === "done") {
      openedRef.current?.focus();
      openedRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [opened]);

  if (listError) {
    return (
      <p className="error" role="alert">
        Could not load the demos: {listError}
      </p>
    );
  }

  if (!demos) {
    return <p role="status">Loading demos…</p>;
  }

  return (
    <div className="demos">
      <ul className="demos__list">
        {demos.map((summary) => (
          <li key={summary.id}>
            <button
              type="button"
              className="demo-card"
              aria-pressed={opened?.id === summary.id}
              onClick={() => open(summary)}
            >
              <strong>{summary.title}</strong>
              <span>{summary.summary}</span>
              {previews[summary.id] && <Preview demo={previews[summary.id]} />}
              {previewErrors[summary.id] && <span>Preview unavailable: {previewErrors[summary.id]}. Open the story to try again.</span>}
              <span className="demo-card__action">Explore this story <span aria-hidden="true">↗</span></span>
            </button>
          </li>
        ))}
      </ul>

      {opened?.status === "loading" && <p role="status">Loading demo…</p>}
      {opened?.status === "error" && (
        <p className="error" role="alert">
          Could not load the demo: {opened.message}
        </p>
      )}
      {opened?.status === "done" && (
        <article className="demo" aria-label={opened.demo.title} tabIndex={-1} ref={openedRef}>
          <div className="section-heading">
            <div><h3>{opened.demo.title}</h3><p>{opened.demo.summary}</p></div>
            <button type="button" className="secondary-button" onClick={() => setOpened(null)}>Close example</button>
          </div>
          <ComparisonScale key={opened.demo.id}>
          <div className={opened.demo.panels.length > 1 ? "compare-grid" : undefined}>
            {opened.demo.panels.map((panel) => (
              <AnalysisResult key={panel.label} label={panel.label} analysis={panel.analysis} />
            ))}
          </div>
          </ComparisonScale>
        </article>
      )}
    </div>
  );
}
