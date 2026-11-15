import { useEffect, useState } from "react";
import { plainChangeOf } from "../lib/evidence";
import { formatPValue } from "../lib/format";
import { loadSummary, type PlaceSummaryNumbers, type RegionsSummary, type SummaryVariable } from "../lib/summary";
import type { VariableId } from "../lib/variables";
import { verdictHeadline } from "../lib/verdict";
import { Stripes } from "./CaseCard";

export type CaseTarget = { place: string; compare: string; focus: VariableId };

type Props = { onOpen: (target: CaseTarget) => void };

const ZONES = ["cuauhtemoc", "delicias", "chihuahua-city", "ciudad-juarez", "parral", "nuevo-casas-grandes", "jimenez", "ojinaga"];

function shortName(name: string): string {
  return name.replace(/ area,? Chihuahua$| area$/, "");
}

function figure(variable: VariableId, place: PlaceSummaryNumbers): { figure: string; caption: string; significant: boolean; p: string } {
  const numbers: SummaryVariable = place.variables[variable];
  const significant = verdictHeadline(numbers).significant;
  const change = plainChangeOf(variable, numbers, numbers.mean);
  return { ...change, significant, p: formatPValue(numbers.p_value) };
}

function Figure({ variable, place, tone }: { variable: VariableId; place: PlaceSummaryNumbers; tone?: "dry" | "wet" }) {
  const value = figure(variable, place);
  return (
    <p className={`cases__figure ${tone ? `is-${tone}` : ""}`}>
      <span className="num-display">{value.significant ? value.figure : "No clear trend"}</span>
      <span>
        {value.caption} · <span className="num">{value.p}</span>
      </span>
    </p>
  );
}

function percentOf(variable: VariableId, place: PlaceSummaryNumbers): string {
  const numbers = place.variables[variable];
  const percent = (numbers.total_change / numbers.mean) * 100;
  return `${percent > 0 ? "+" : "−"}${Math.abs(percent).toFixed(0)}%`;
}

/** Real cases from Chihuahua, each one a door into the investigation above. */
export function Cases({ onOpen }: Props) {
  const [summary, setSummary] = useState<RegionsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadSummary()
      .then((value) => active && setSummary(value))
      .catch((loadError: unknown) => active && setError(loadError instanceof Error ? loadError.message : "Unknown error"));
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p className="error" role="alert">
        Could not load the cases: {error}
      </p>
    );
  }
  if (!summary) {
    return <p role="status">Loading cases…</p>;
  }

  const r = summary.regions;
  const open = (target: CaseTarget) => () => onOpen(target);

  return (
    <ul className="cases">
      <li className="cases__item">
        <h3>Delicias is heating up</h3>
        <Stripes years={r.delicias.temperature_annual} label="Yearly temperature in Delicias" />
        <Figure variable="temperature_2m" place={r.delicias} />
        <button type="button" className="cases__open" onClick={open({ place: "delicias", compare: "", focus: "temperature_2m" })}>
          Open this case
        </button>
      </li>

      <li className="cases__item">
        <h3>Less rain, drier soil in Cuauhtémoc</h3>
        <Figure variable="precipitation" place={r.cuauhtemoc} tone="dry" />
        <Figure variable="soil_wetness_root" place={r.cuauhtemoc} tone="dry" />
        <button type="button" className="cases__open" onClick={open({ place: "cuauhtemoc", compare: "", focus: "precipitation" })}>
          Open this case
        </button>
      </li>

      <li className="cases__item cases__item--wide">
        <h3>Not one town: all of Chihuahua</h3>
        <p className="cases__lede">Every zone we measured got warmer and drier since 1981. All of these changes are statistically significant.</p>
        <table className="cases__table">
          <thead>
            <tr>
              <th scope="col">Zone</th>
              <th scope="col">Yearly temperature, 1981–2025</th>
              <th scope="col">Heat</th>
              <th scope="col">Rain</th>
            </tr>
          </thead>
          <tbody>
            {ZONES.filter((id) => r[id]).map((id) => (
              <tr key={id}>
                <th scope="row">{shortName(r[id].name)}</th>
                <td>
                  <Stripes compact years={r[id].temperature_annual} label={`Yearly temperature in ${shortName(r[id].name)}`} />
                </td>
                <td className="num">{figure("temperature_2m", r[id]).figure}</td>
                <td className="num">{percentOf("precipitation", r[id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="cases__open" onClick={open({ place: "chihuahua-state", compare: "", focus: "temperature_2m" })}>
          Open the whole state
        </button>
      </li>

      <li className="cases__item cases__item--wide">
        <h3>Same rain, opposite directions</h3>
        <p className="cases__lede">One variable can fall in one place and rise in another. That is why every place needs its own investigation.</p>
        <div className="cases__pair">
          <div>
            <p className="cases__place">State of Chihuahua</p>
            <Figure variable="precipitation" place={r["chihuahua-state"]} tone="dry" />
          </div>
          <div>
            <p className="cases__place">Western Sahel, Africa</p>
            <Figure variable="precipitation" place={r["western-sahel"]} tone="wet" />
          </div>
        </div>
        <button type="button" className="cases__open" onClick={open({ place: "chihuahua-state", compare: "western-sahel", focus: "precipitation" })}>
          Compare them
        </button>
      </li>
    </ul>
  );
}
