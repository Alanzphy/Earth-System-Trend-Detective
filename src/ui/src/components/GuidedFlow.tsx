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

function VariableOption({
  item,
  flow,
  onChoose,
}: {
  item: Variable;
  flow: FlowState;
  onChoose: (next: Variable) => void;
}) {
  return (
    <label className="variable">
      <input
        type="radio"
        name="variable"
        value={item.id}
        checked={flow.variable === item.id}
        onChange={() => onChoose(item)}
      />
      <span>
        <strong>{item.name}</strong> <span className="variable__units">({item.units})</span>
        <span className="variable__description">{item.description}</span>
      </span>
    </label>
  );
}

export function GuidedFlow({ catalog, flow, onChange, onAnalyze }: Props) {
  const variables = catalog.status === "ready" ? catalog.variables : [];
  const variable = variables.find((item) => item.id === flow.variable);
  const [pickedTopic, setPickedTopic] = useState<VariableCategory | null>(null);
  const topic = variable?.category ?? pickedTopic;
  const shown = topic ? variables.filter((item) => item.category === topic) : variables;
  const errors = flowErrors(flow, variable);
  const errorsId = useId();

  function chooseVariable(next: Variable) {
    onChange({ ...flow, variable: next.id, ...clampPeriod(flow, next) });
  }

  function startCompare() {
    // Start from region A so the second slot is never filled with a region nobody chose.
    onChange({ ...flow, compare: flow.bbox ? { ...flow.bbox } : null });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (errors.length === 0) {
      onAnalyze();
    }
  }

  return (
    <form className="flow" onSubmit={submit} aria-label="Guided analysis">
      <fieldset className="flow__step">
        <legend>
          <span className="flow__number">1</span> What are you curious about?
        </legend>
        <div className="topics">
          {TOPICS.map((item) => (
            <button
              key={item.category}
              type="button"
              className="topic"
              aria-pressed={topic === item.category}
              onClick={() => {
                setPickedTopic(item.category);
                if (variable && variable.category !== item.category) {
                  onChange({ ...flow, variable: null });
                }
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.question}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flow__step">
        <legend>
          <span className="flow__number">2</span> Choose a variable
          {!variable && <span className="flow__needs">needed</span>}
        </legend>
        {catalog.status === "loading" && (
          <p role="status">{catalog.waking ? WAKING_MESSAGE : "Loading variables…"}</p>
        )}
        {catalog.status === "error" && (
          <p className="error" role="alert">
            Could not load the variables: {catalog.message}
          </p>
        )}
        {catalog.status === "ready" && shown.length === 0 && (
          <p>No variables for this topic yet. Try another topic.</p>
        )}
        {catalog.status === "ready" && shown.length > 0 && (
          <p className="flow__sourceline">
            {shown[0].source} · {shown[0].available_from} to {shown[0].available_to} for every
            variable here.
          </p>
        )}
        <div className="variables">
          {shown.slice(0, 3).map((item) => (
            <VariableOption key={item.id} item={item} flow={flow} onChoose={chooseVariable} />
          ))}
        </div>
        {shown.length > 3 && (
          <details className="variables__more">
            <summary>Show all {shown.length} variables</summary>
            <div className="variables">
              {shown.slice(3).map((item) => (
                <VariableOption key={item.id} item={item} flow={flow} onChoose={chooseVariable} />
              ))}
            </div>
          </details>
        )}
      </fieldset>

      <div className="flow__step">
        <h3 className="flow__heading">
          <span className="flow__number">3</span> Where?
          {!flow.bbox && <span className="flow__needs">needed</span>}
        </h3>
        <div className={flow.compare ? "compare-grid" : undefined}>
          <RegionPicker
            title={flow.compare ? "Region A" : "Region"}
            bbox={flow.bbox}
            onChange={(bbox) => onChange({ ...flow, bbox })}
          />
          {flow.compare && (
            <div>
              <RegionPicker
                title="Region B"
                bbox={flow.compare}
                onChange={(compare) => onChange({ ...flow, compare })}
              />
              <button
                type="button"
                className="link-button"
                onClick={() => onChange({ ...flow, compare: null })}
              >
                Remove the second region
              </button>
            </div>
          )}
        </div>
        {!flow.compare && (
          <button type="button" className="secondary-button" onClick={startCompare}>
            Compare with another region
          </button>
        )}
      </div>

      <div className="flow__final">
      <fieldset className="flow__step">
        <legend>
          <span className="flow__number">4</span> Which period?
        </legend>
        <div className="period">
          <label>
            Start month
            <input
              type="month"
              value={flow.start}
              min={variable?.available_from ?? DEFAULT_START}
              max={variable?.available_to ?? DEFAULT_END}
              onChange={(event) => onChange({ ...flow, start: event.target.value })}
            />
          </label>
          <label>
            End month
            <input
              type="month"
              value={flow.end}
              min={variable?.available_from ?? DEFAULT_START}
              max={variable?.available_to ?? DEFAULT_END}
              onChange={(event) => onChange({ ...flow, end: event.target.value })}
            />
          </label>
          <p className="hint">Resolution: monthly. Longer periods detect trends more reliably.</p>
        </div>
      </fieldset>

      <div className="flow__submit">
        <button
          type="submit"
          className="primary-button"
          aria-disabled={errors.length > 0}
          aria-describedby={errors.length > 0 ? errorsId : undefined}
        >
          {flow.compare ? "Analyze both regions" : "Analyze"}
        </button>
        {errors.length > 0 && (
          <ul id={errorsId} className="flow__errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </form>
  );
}
