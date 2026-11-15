# Precomputed regions

Generated files — do not edit by hand.

- `manifest.json`: list of regions (`id`, `name`, `group` = `chihuahua` | `world`, `bbox` as `[minLon, minLat, maxLon, maxLat]`, `file`), Chihuahua first.
- `<id>.json`: `{id, name, bbox, period, variables}` where `variables` maps each of the 8 catalog variables to the exact `AnalysisResponse` that `POST /trend` returns for that bbox and 1981-01..2025-12 (solar radiation starts 1984-01).

- `summary.json`: per place, headline numbers for each variable (`mean`, `total_change`, slope, p-value, significance, period) and yearly temperature anomalies, used by the cases section.

Regenerate from the repo root (NASA POWER, no token needed):

```sh
uv run python -m pipeline regions
```

Regions are defined in `src/pipeline/pipeline/regions.py`.
