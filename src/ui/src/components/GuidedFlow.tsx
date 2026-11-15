import { useId, useState, type FormEvent } from "react";
import {
  clampPeriod,
  DEFAULT_END,
  DEFAULT_START,
  flowErrors,
  TOPICS,
  type FlowState,
} from "../lib/flow";
import { WAKING_MESSAGE } from "../lib/useWaking";
import type { Variable, VariableCategory } from "../types/contracts";
import { RegionPicker } from "./RegionPicker";

export type CatalogState =
  | { status: "loading"; waking: boolean }
  | { status: "ready"; variables: Variable[] }
  | { status: "error"; message: string };

type Props = {
  catalog: CatalogState;
  flow: FlowState;
  onChange: (flow: FlowState) => void;
  onAnalyze: () => void;
};

export function GuidedFlow({ catalog, flow, onChange, onAnalyze }: Props) {
  const variables = catalog.status === "ready" ? catalog.variables : [];
  const variable = variables.find((item) => item.id === flow.variable);
  const [pickedTopic, setPickedTopic] = useState<VariableCategory | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const topic = variable?.category ?? pickedTopic;
  const shown = topic ? variables.filter((item) => item.category === topic) : variables;
  const comparing = compareOpen || flow.compare !== null;
  const errors = flowErrors(flow, variable);
  if (comparing && !flow.compare) {
    errors.push("Choose a second region.");
  }
  const id = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (errors.length === 0) {
      onAnalyze();
    }
  }

  return (
    <form className="flow" onSubmit={submit} aria-label="Guided analysis">
      <fieldset className="flow__step">
        <legend><span className="flow__number">1</span> What interests you?</legend>
        <div className="topics" role="group" aria-label="Filter variables by topic">
          <button type="button" aria-pressed={!topic} onClick={() => {
            setPickedTopic(null);
            onChange({ ...flow, variable: null });
          }}>All</button>
          {TOPICS.map((item) => (
            <button
              key={item.category}
              type="button"
              title={item.question}
              aria-pressed={topic === item.category}
              onClick={() => {
                setPickedTopic(item.category);
                if (variable?.category !== item.category) {
                  onChange({ ...flow, variable: null });
                }
              }}
            >{item.label}</button>
          ))}
        </div>
        <label className="field" htmlFor={`${id}-variable`}>
          Earth variable
          <select
            id={`${id}-variable`}
            value={flow.variable ?? ""}
            disabled={catalog.status !== "ready"}
            aria-describedby={`${id}-variable-help`}
            onChange={(event) => {
              const next = variables.find((item) => item.id === event.target.value);
              onChange(next
                ? { ...flow, variable: next.id, ...clampPeriod(flow, next) }
                : { ...flow, variable: null });
            }}
          >
            <option value="">Choose a variable…</option>
            {shown.map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.units})</option>
            ))}
          </select>
        </label>
        <p id={`${id}-variable-help`} className="field-help">
          {variable?.description ?? "Temperature, water, wind, sunlight or soil — follow what makes you curious."}
        </p>
        {catalog.status === "loading" && (
          <p role="status" className="hint">{catalog.waking ? WAKING_MESSAGE : "Loading variables…"}</p>
        )}
        {catalog.status === "error" && (
          <p className="error" role="alert">Could not load the variables: {catalog.message} You can still open the examples below.</p>
        )}
      </fieldset>

      <fieldset className="flow__step">
        <legend><span className="flow__number">2</span> Where shall we look?</legend>
        <RegionPicker
          title={comparing ? "Region A" : "Region"}
          bbox={flow.bbox}
          onChange={(bbox) => onChange({ ...flow, bbox })}
        />
        {comparing && (
          <RegionPicker
            title="Region B"
            bbox={flow.compare}
            onChange={(compare) => onChange({ ...flow, compare })}
          />
        )}
        <button type="button" className="text-action" onClick={() => {
          if (comparing) {
            setCompareOpen(false);
            onChange({ ...flow, compare: null });
          } else {
            setCompareOpen(true);
          }
        }}>{comparing ? "Remove the second region" : "Compare with another region"}</button>
      </fieldset>

      <fieldset className="flow__step">
        <legend><span className="flow__number">3</span> Over which years?</legend>
        <div className="period">
          <label className="field">
            Start month
            <input type="month" value={flow.start}
              min={variable?.available_from ?? DEFAULT_START}
              max={variable?.available_to ?? DEFAULT_END}
              onChange={(event) => onChange({ ...flow, start: event.target.value })} />
          </label>
          <label className="field">
            End month
            <input type="month" value={flow.end}
              min={variable?.available_from ?? DEFAULT_START}
              max={variable?.available_to ?? DEFAULT_END}
              onChange={(event) => onChange({ ...flow, end: event.target.value })} />
          </label>
        </div>
        <p className="field-help">
          {variable
            ? `${variable.source} · monthly · ${variable.available_from} to ${variable.available_to}`
            : "Monthly observations. Longer records make trends easier to detect."}
        </p>
      </fieldset>

      <div className="flow__submit">
        <button type="submit" className="primary-button"
          aria-disabled={errors.length > 0}
          aria-describedby={errors.length ? `${id}-errors` : undefined}>
          {comparing ? "Analyze both regions" : "Analyze"}
          <span aria-hidden="true">→</span>
        </button>
        <p id={`${id}-errors`} className="flow__guidance" role="status">
          {errors[0] ?? "Ready to follow the evidence."}
        </p>
      </div>
    </form>
  );
}
