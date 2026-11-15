import { lazy, Suspense, useId, useState } from "react";
import { analysisBoxError, box, isSmallBox, MIN_BOX_DEGREES } from "../lib/flow";
import type { PlaceSummary } from "../lib/places";
import type { BBox } from "../types/contracts";

// MapLibre for drawing loads only when a student opens the drawing map.
const BboxPicker = lazy(() => import("./BboxPicker").then((module) => ({ default: module.BboxPicker })));

export const CUSTOM = "custom";

type Props = {
  places: PlaceSummary[] | null;
  value: string;
  onSelect: (id: string) => void;
  onCustom: (bbox: BBox) => void;
  customBbox: BBox | null;
};

const QUICK = ["cuauhtemoc", "delicias", "chihuahua-city", "ciudad-juarez", "parral"];

function shortName(name: string): string {
  return name.replace(/ area,? Chihuahua$| area$/, "");
}

/** Where to investigate: Chihuahua first, the world next, any rectangle last. */
export function PlacePicker({ places, value, onSelect, onCustom, customBbox }: Props) {
  const id = useId();
  const chihuahua = places?.filter((place) => place.group === "chihuahua") ?? [];
  const world = places?.filter((place) => place.group === "world") ?? [];

  return (
    <div className="picker">
      <label className="picker__label" htmlFor={id}>
        Choose a place
      </label>
      <select id={id} className="picker__select" value={value} disabled={!places} onChange={(event) => onSelect(event.target.value)}>
        {!places && <option>Loading places…</option>}
        {chihuahua.length > 0 && (
          <optgroup label="Chihuahua, Mexico">
            {chihuahua.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </optgroup>
        )}
        {world.length > 0 && (
          <optgroup label="Around the world">
            {world.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </optgroup>
        )}
        <option value={CUSTOM}>Somewhere else: draw or type an area…</option>
      </select>

      <div className="picker__quick" role="group" aria-label="Quick picks in Chihuahua">
        {QUICK.map((quick) => {
          const place = chihuahua.find((item) => item.id === quick);
          return place ? (
            <button key={quick} type="button" aria-pressed={value === quick} onClick={() => onSelect(quick)}>
              {shortName(place.name)}
            </button>
          ) : null;
        })}
      </div>

      {value === CUSTOM && <CustomArea initial={customBbox} onSubmit={onCustom} />}
    </div>
  );
}

const FIELDS: Array<{ key: keyof BBox; label: string; min: number; max: number }> = [
  { key: "min_lon", label: "West (longitude)", min: -180, max: 180 },
  { key: "max_lon", label: "East (longitude)", min: -180, max: 180 },
  { key: "min_lat", label: "South (latitude)", min: -90, max: 90 },
  { key: "max_lat", label: "North (latitude)", min: -90, max: 90 },
];

function CustomArea({ initial, onSubmit }: { initial: BBox | null; onSubmit: (bbox: BBox) => void }) {
  const [bbox, setBbox] = useState<BBox>(initial ?? box(-107, 28, -105, 30));
  const [drawing, setDrawing] = useState(false);
  const error = analysisBoxError(bbox);

  return (
    <form
      className="custom"
      onSubmit={(event) => {
        event.preventDefault();
        if (!error) onSubmit(bbox);
      }}
    >
      <div className="custom__coords">
        {FIELDS.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              type="number"
              step="any"
              min={field.min}
              max={field.max}
              value={bbox[field.key]}
              onChange={(event) => {
                const next = event.target.valueAsNumber;
                if (Number.isFinite(next)) setBbox({ ...bbox, [field.key]: next });
              }}
            />
          </label>
        ))}
      </div>
      <button type="button" className="button button--ghost" aria-expanded={drawing} onClick={() => setDrawing((open) => !open)}>
        {drawing ? "Hide the drawing map" : "Draw the area on a map"}
      </button>
      {drawing && (
        <Suspense fallback={<p className="hint">Loading map…</p>}>
          <BboxPicker bbox={bbox} onChange={setBbox} label="Map to draw your area" />
        </Suspense>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!error && isSmallBox(bbox) && (
        <p className="hint">
          Smaller than {MIN_BOX_DEGREES}° × {MIN_BOX_DEGREES}°: NASA POWER grid cells are about 50 km wide, so only the
          nearest points are used.
        </p>
      )}
      <button type="submit" className="button button--sun" disabled={Boolean(error)}>
        Investigate this area
      </button>
      <p className="hint">Live analysis of a new area takes a few seconds per variable (up to a minute if the server is waking up).</p>
    </form>
  );
}
