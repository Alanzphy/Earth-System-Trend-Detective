import { useEffect, useRef, useState } from "react";
import { loadDemo, loadDemoManifest } from "../lib/demos";
import type { Demo, DemoSummary } from "../types/contracts";
import { AnalysisResult } from "./AnalysisResult";

type Opened =
  | { status: "loading"; id: string }
  | { status: "done"; id: string; demo: Demo }
  | { status: "error"; id: string; message: string };

type Props = {
  /** Open a case on request (the hero CTA); `nonce` re-opens it on repeat clicks. */
  autoOpen?: { id: string; nonce: number } | null;
};

/** Precomputed demos from public/demos/; they work while the API sleeps. */
export function DemoGallery({ autoOpen }: Props = {}) {
  const [demos, setDemos] = useState<DemoSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const handledNonce = useRef(0);

  useEffect(() => {
    let active = true;
    loadDemoManifest()
      .then((manifest) => {
        if (active) {
          setDemos(manifest.demos);
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

  async function open(summary: DemoSummary) {
    setOpened({ status: "loading", id: summary.id });
    try {
      const demo = await loadDemo(summary.file);
      setOpened((current) =>
        current?.id === summary.id ? { status: "done", id: summary.id, demo } : current,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setOpened((current) =>
        current?.id === summary.id ? { status: "error", id: summary.id, message } : current,
      );
    }
  }

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
  }, [autoOpen, demos]);

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
        <article className="demo" aria-label={opened.demo.title}>
          <h3>{opened.demo.title}</h3>
          <p>{opened.demo.summary}</p>
          <div className={opened.demo.panels.length > 1 ? "compare-grid" : undefined}>
            {opened.demo.panels.map((panel) => (
              <AnalysisResult key={panel.label} label={panel.label} analysis={panel.analysis} />
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
