import { useId, useState } from "react";
import { annualAnomalies, isSignificant, plainChange } from "../lib/evidence";
import { formatPValue } from "../lib/format";
import { colorForValue } from "../lib/palette";
import { saveCaseImage } from "../lib/shareCard";
import type { PlaceAnalyses } from "../lib/usePlaceAnalyses";
import { VARIABLE_META, VARIABLE_ORDER, type VariableId } from "../lib/variables";
import { WAKING_MESSAGE } from "../lib/useWaking";

type Props = {
  name: string;
  analyses: PlaceAnalyses;
  focus: VariableId;
  onFocus: (variable: VariableId) => void;
  waking: boolean;
};

export function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One stripe per year: blue cooler, red warmer than the place's normal. */
export function Stripes({ years, label, compact = false }: { years: Array<{ year: string; value: number }>; label: string; compact?: boolean }) {
  const max = Math.max(...years.map((year) => Math.abs(year.value)), 0.001);
  const first = years[0]?.year;
  const last = years[years.length - 1]?.year;
  return (
    <figure className={`stripes ${compact ? "stripes--compact" : ""}`} aria-label={label}>
      <div className="stripes__bars" role="img" aria-label={`${label}, ${first} to ${last}`}>
        {years.map((year) => (
          <i
            key={year.year}
            title={`${year.year}: ${year.value > 0 ? "+" : ""}${year.value.toFixed(2)} °C vs normal`}
            style={{ background: colorForValue(year.value, "RdBu", { min: -max, max }) }}
          />
        ))}
      </div>
      {!compact && (
        <figcaption>
          <span className="num">{first}</span>
          <span>One stripe per year · blue cooler, red warmer than normal</span>
          <span className="num">{last}</span>
        </figcaption>
      )}
    </figure>
  );
}

/**
 * The case file a student builds: what changed in their place across all eight variables,
 * with the focused variable's change as the headline and its evidence one line below.
 */
export function CaseCard({ name, analyses, focus, onFocus, waking }: Props) {
  const [saving, setSaving] = useState(false);
  const [alias, setAlias] = useState("");
  const [club, setClub] = useState("");
  const heat = analyses.temperature_2m;
  const focused = analyses[focus];
  const ready = VARIABLE_ORDER.every((id) => analyses[id].status !== "loading");
  const titleId = useId();

  return (
    <article className="case" aria-labelledby={titleId}>
      <h2 id={titleId}>{name}</h2>
      <p className="case__file">Case file · NASA POWER monthly data</p>

      {heat.status === "done" ? (
        <Stripes years={annualAnomalies(heat.analysis)} label={`Yearly temperature in ${name}`} />
      ) : (
        <div className="stripes stripes--empty" aria-hidden="true" />
      )}

      <div className="case__headline" aria-live="polite">
        {focused.status === "done" && <Headline variable={focus} state={focused} />}
        {focused.status === "loading" && <p className="case__wait">{waking ? WAKING_MESSAGE : "Reading 45 years of NASA data…"}</p>}
        {focused.status === "error" && <p className="case__error" role="alert">{focused.message}</p>}
      </div>

      <h3 className="case__subhead">What changed here</h3>
      <ul className="case__stats">
        {VARIABLE_ORDER.map((id) => {
          const state = analyses[id];
          const significant = state.status === "done" && isSignificant(state.analysis);
          return (
            <li key={id}>
              <button type="button" aria-pressed={focus === id} onClick={() => onFocus(id)} className={significant ? "" : "is-unclear"}>
                <span className="case__label">{VARIABLE_META[id].short}</span>
                <span className="case__value">
                  {state.status === "loading" && <span className="case__dots" aria-label="loading" />}
                  {state.status === "error" && "Not available"}
                  {state.status === "done" && (significant ? plainChange(id, state.analysis).figure : "No clear trend")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="case__save">
        {!saving ? (
          <button type="button" className="button button--sun" disabled={!ready} onClick={() => setSaving(true)}>
            Save my case card
          </button>
        ) : (
          <form
            className="case__form"
            onSubmit={(event) => {
              event.preventDefault();
              void saveCaseImage({ name, analyses, focus, alias: alias.trim(), club: club.trim() });
            }}
          >
            <label>
              Detective name
              <input value={alias} onChange={(event) => setAlias(event.target.value)} maxLength={24} placeholder="First name or nickname" />
            </label>
            <label>
              School or club <span>(optional)</span>
              <input value={club} onChange={(event) => setClub(event.target.value)} maxLength={40} />
            </label>
            <p className="case__privacy">Never add your full name, phone or address. The image is made on your phone and is not uploaded.</p>
            <div className="case__actions">
              <button type="submit" className="button button--sun">Save image</button>
              <button type="button" className="button button--ghost" onClick={() => setSaving(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}

function Headline({ variable, state }: { variable: VariableId; state: Extract<PlaceAnalyses[VariableId], { status: "done" }> }) {
  const { analysis } = state;
  const significant = isSignificant(analysis);
  const change = plainChange(variable, analysis);
  const { trend } = analysis;
  return (
    <>
      <p className="case__label case__label--focus">{VARIABLE_META[variable].name}</p>
      {significant ? (
        <p className="case__figure">
          <span className="num-display">{change.figure}</span>
          <span className="case__caption">{change.caption}</span>
        </p>
      ) : (
        <p className="case__figure case__figure--unclear">
          <span className="num-display">No clear trend</span>
          <span className="case__caption">The change could be chance. A longer record might reveal more.</span>
        </p>
      )}
      <p className={`case__verdict ${significant ? "is-yes" : "is-no"}`}>
        {significant && <CheckIcon />}
        {significant ? "Statistically significant: unlikely to be chance" : "Not statistically significant"}
        <span className="num"> · {formatPValue(trend.p_value)}</span>
      </p>
    </>
  );
}
