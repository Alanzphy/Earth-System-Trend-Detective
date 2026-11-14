# Trend map files

Static files consumed by the trend map view (#23). The pipeline in #22 should write these files here. Until then, `manifest.json` and `sample-precipitation.geojson` contain clearly marked sample data.

## Manifest

`manifest.json`:

```json
{
  "version": 1,
  "isSample": false,
  "maps": [
    {
      "id": "precipitation-1981-2024",
      "title": "Precipitation trends",
      "variable": "precipitation",
      "units": "mm/day",
      "period": ["1981-01", "2024-12"],
      "slopeUnits": "mm/day/decade",
      "file": "precipitation-1981-2024.geojson",
      "legend": {
        "min": -0.08,
        "max": 0.08,
        "breaks": [-0.08, -0.04, 0, 0.04, 0.08]
      }
    }
  ]
}
```

Fields:

| Field | Required | Meaning |
|---|---|---|
| `version` | yes | Manifest format version. |
| `isSample` | no | `true` for demo fixtures. |
| `maps` | yes | One or more map entries. |
| `id` | yes | Stable identifier. |
| `title` | yes | Human-readable title. |
| `variable` | yes | Catalog variable id. |
| `units` | yes | Units of the variable. |
| `period` | yes | Start and end month. |
| `slopeUnits` | yes | Units of the trend slope, normally per decade. |
| `file` | yes | GeoJSON file relative to this folder. |
| `legend` | yes | Minimum and maximum slope for the diverging scale. |

## GeoJSON

Each feature represents a pixel or a simplified region. Properties:

| Property | Type | Meaning |
|---|---|---|
| `id` | string | Stable identifier. |
| `label` | string | Region name shown to the user. |
| `slope` | number | Trend slope in `slopeUnits`. |
| `significant` | boolean | Result after the significance test and FDR correction. |
| `bbox` | number[4] | `[minLon, minLat, maxLon, maxLat]` used by "Analyze this region". |

Geometry must be `Polygon` or `MultiPolygon`. Keep files small enough for the web: simplify polygons and prefer one or two decimals.
