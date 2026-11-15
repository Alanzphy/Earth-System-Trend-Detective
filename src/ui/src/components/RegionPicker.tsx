import { useId, useState } from "react";
import {
  analysisBoxError,
  box,
  EXAMPLE_REGIONS,
  isSmallBox,
  MIN_BOX_DEGREES,
  sameBbox,
} from "../lib/flow";
import type { BBox } from "../types/contracts";
import { BboxPicker } from "./BboxPicker";

type Props = {
  title: string;
  bbox: BBox | null;
  onChange: (bbox: BBox) => void;
};

const FIELDS: Array<{ key: keyof BBox; label: string; min: number; max: number }> = [
  { key: "min_lon", label: "West (longitude)", min: -180, max: 180 },
  { key: "max_lon", label: "East (longitude)", min: -180, max: 180 },
  { key: "min_lat", label: "South (latitude)", min: -90, max: 90 },
  { key: "max_lat", label: "North (latitude)", min: -90, max: 90 },
];

export function RegionPicker({ title, bbox, onChange }: Props) {
  const error = bbox ? analysisBoxError(bbox) : null;
  const id = useId();
  const [drawing, setDrawing] = useState(false);
  const [custom, setCustom] = useState(false);
  const example = bbox ? EXAMPLE_REGIONS.find((region) => sameBbox(bbox, region.bbox)) : null;
  return (
    <fieldset className="region-picker">
      <legend>{title}</legend>

      <label className="field" htmlFor={id}>
        <span className="sr-only">{title}: choose a place</span>
        <select id={id} value={custom || (bbox && !example) ? "custom" : example?.id ?? ""}
          onChange={(event) => {
            setCustom(event.target.value === "custom");
            const region = EXAMPLE_REGIONS.find((item) => item.id === event.target.value);
            if (region) onChange(region.bbox);
          }}>
          <option value="">Choose a region…</option>
          {EXAMPLE_REGIONS.map((region) => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
          <option value="custom">Custom area / map cell</option>
        </select>
      </label>

      <details className="region-picker__more" open={custom || undefined}
        onToggle={(event) => setDrawing(event.currentTarget.open)}>
        <summary>Draw a box or type coordinates</summary>
        {drawing && <BboxPicker bbox={bbox} onChange={onChange} label={`${title}: map to draw a box`} />}
        <div className="coords">
        {FIELDS.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              type="number"
              step="any"
              min={field.min}
              max={field.max}
              value={bbox ? bbox[field.key] : ""}
              onChange={(event) => {
                const value = event.target.valueAsNumber;
                if (Number.isFinite(value)) {
                  onChange({ ...(bbox ?? box(0, 0, 0, 0)), [field.key]: value });
                }
              }}
            />
          </label>
        ))}
        </div>
      </details>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {bbox && !error && isSmallBox(bbox) && (
        <p className="hint hint--warning">
          This box is smaller than {MIN_BOX_DEGREES}° × {MIN_BOX_DEGREES}°. NASA POWER works on a
          grid of about 0.5° × 0.625°, so only the few grid points inside it (or the nearest one)
          are used.
        </p>
      )}
      {!bbox && <p className="field-help">Pick a place, or draw your own area.</p>}
    </fieldset>
  );
}
