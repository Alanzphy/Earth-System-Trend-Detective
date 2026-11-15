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

  return (
    <fieldset className="region-picker">
      <legend>{title}</legend>

      <div className="chips">
        {EXAMPLE_REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            className="chip"
            aria-pressed={bbox ? sameBbox(bbox, region.bbox) : false}
            onClick={() => onChange(region.bbox)}
          >
            {region.name}
          </button>
        ))}
      </div>

      <details className="region-picker__more">
        <summary>Draw a box or type coordinates</summary>
        <BboxPicker bbox={bbox} onChange={onChange} label={`${title}: map to draw a box`} />
        <div className="coords">
        {FIELDS.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              type="number"
              step="0.25"
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
      {!bbox && (
        <p className="hint">Tip: boxes of at least {MIN_BOX_DEGREES}° × {MIN_BOX_DEGREES}° work best.</p>
      )}
    </fieldset>
  );
}
