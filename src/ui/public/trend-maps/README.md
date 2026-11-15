# Trend map files

Static files consumed by the trend map view (#23). The pipeline in #22 writes these files here. Until then, `manifest.json` and `sample-precipitation.geojson` are **sample data** (`"is_sample": true`): four region polygons using the precipitation values validated in `docs/product.md` (the Western Mediterranean and full-Sahel slopes are illustrative; only their p-values were validated). The UI shows a "Sample data" badge for sample entries.

The format is the shared contract `TrendMapManifest` / `TrendCellProperties` (version 2) in `src/contracts/contracts/models.py`; TypeScript types come from `src/types/contracts.gen.ts`.

## Manifest

`manifest.json`:

```json
{
  "version": 2,
  "generated_at": "2026-11-14T00:00:00Z",
  "maps": [
    {
      "id": "precipitation-1981-2025",
      "title": "Precipitation trends",
      "variable": "precipitation",
      "units": "mm/day",
      "slope_units": "mm/day/decade",
      "period": ["1981-01", "2025-12"],
      "palette": "BrBG",
      "cell_size_deg": 2.0,
      "file": "precipitation-1981-2025.geojson",
      "legend": { "min": -0.12, "max": 0.12 },
      "alpha": 0.05,
      "fdr": true,
      "is_sample": false
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `version` | Always `2`. |
| `generated_at` | ISO timestamp of the pipeline run. |
| `maps[].id`, `title` | Stable identifier and human-readable title. |
| `variable`, `units` | Catalog variable id and its units. |
| `slope_units` | Units of the slope, per decade. |
| `period` | Start and end month (`YYYY-MM`). |
| `palette` | `RdBu` (temperature-like: blue = decrease, red = increase) or `BrBG` (water-like: brown = drier, blue-green = wetter). |
| `cell_size_deg` | Cell size in degrees. |
| `file` | GeoJSON file relative to this folder. |
| `legend` | `min < 0 < max`; the neutral color is always at 0. |
| `alpha` | Significance level. |
| `fdr` | `true` if Benjamini–Hochberg correction was applied across cells. |
| `is_sample` | `true` for sample fixtures (shows the "Sample data" badge). |

## GeoJSON

A `FeatureCollection` of `Polygon` features. Properties:

| Property | Type | Meaning |
|---|---|---|
| `id` | string | Stable identifier. |
| `label` | string | Cell or region name shown to the user. |
| `slope` | number | Trend per decade in `slope_units`. |
| `p_value` | number | Mann–Kendall p-value (0–1). |
| `significant` | boolean | Result after the test (and FDR correction when `fdr` is `true`). |
| `bbox` | number[4] | `[minLon, minLat, maxLon, maxLat]` used by "Analyze this region". |

Keep files small enough for the web: one or two decimals in coordinates.
