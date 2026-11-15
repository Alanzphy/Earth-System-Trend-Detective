"""Precomputed analyses for every catalog variable over fixed regions (static UI files)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

from analysis import compute_trend
from contracts import AnalysisResponse, BBox
from data import get_catalog, get_series

START, END = "1981-01", "2025-12"
STEP = 0.25
HALF_SIDE = 1.0  # NASA POWER regional requests need at least 2° per side

Group = Literal["chihuahua", "world"]


@dataclass(frozen=True)
class RegionSpec:
    id: str
    name: str
    group: Group
    bbox: BBox


def city_box(lat: float, lon: float) -> BBox:
    """2° × 2° box centred on the city, with the centre snapped to a 0.25° grid."""
    clat, clon = round(lat / STEP) * STEP, round(lon / STEP) * STEP
    return BBox(min_lon=clon - HALF_SIDE, min_lat=clat - HALF_SIDE,
                max_lon=clon + HALF_SIDE, max_lat=clat + HALF_SIDE)


def _box(min_lon: float, min_lat: float, max_lon: float, max_lat: float) -> BBox:
    return BBox(min_lon=min_lon, min_lat=min_lat, max_lon=max_lon, max_lat=max_lat)


def _city(id: str, name: str, lat: float, lon: float) -> RegionSpec:
    return RegionSpec(id, name, "chihuahua", city_box(lat, lon))


REGIONS: tuple[RegionSpec, ...] = (
    _city("cuauhtemoc", "Cuauhtémoc area, Chihuahua", 28.41, -106.87),
    _city("delicias", "Delicias area, Chihuahua", 28.19, -105.47),
    _city("chihuahua-city", "Chihuahua City area", 28.63, -106.07),
    _city("ciudad-juarez", "Ciudad Juárez area, Chihuahua", 31.69, -106.42),
    _city("parral", "Hidalgo del Parral area, Chihuahua", 26.93, -105.66),
    _city("nuevo-casas-grandes", "Nuevo Casas Grandes area, Chihuahua", 30.42, -107.91),
    _city("jimenez", "Jiménez area, Chihuahua", 27.13, -104.92),
    _city("ojinaga", "Ojinaga area, Chihuahua", 29.56, -104.41),
    RegionSpec("chihuahua-state", "State of Chihuahua", "chihuahua",
               _box(-109, 25.5, -103.3, 31.8)),
    RegionSpec("iberia", "Iberian Peninsula", "world", _box(-10, 36, 3, 44)),
    RegionSpec("western-sahel", "Western Sahel", "world", _box(-17, 12, -2, 18)),
    RegionSpec("central-chile", "Central Chile", "world", _box(-73, -38, -70, -30)),
    RegionSpec("central-amazon", "Central Amazon", "world", _box(-70, -10, -55, 0)),
)


def _bbox_list(bbox: BBox) -> list[float]:
    return [bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat]


def build_region(spec: RegionSpec) -> dict:
    """Same path as POST /trend: get_series + compute_trend. Any failure propagates."""
    variables: dict[str, AnalysisResponse] = {}
    for var in get_catalog().variables:
        series = get_series(var.id, spec.bbox, START, END)
        variables[var.id] = compute_trend(series, variable_name=var.name)
    return {
        "id": spec.id,
        "name": spec.name,
        "bbox": _bbox_list(spec.bbox),
        "period": [START, END],
        "variables": {k: v.model_dump(mode="json") for k, v in variables.items()},
    }


def build_manifest(specs: tuple[RegionSpec, ...] = REGIONS) -> dict:
    return {
        "version": 1,
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "regions": [
            {"id": s.id, "name": s.name, "group": s.group, "bbox": _bbox_list(s.bbox),
             "file": f"{s.id}.json"}
            for s in specs
        ],
    }


def build_summary(built: list[dict]) -> dict:
    """Small file for the cases section: headline numbers and yearly temperature per region,
    so a phone does not download every full region file to draw a comparison strip."""
    regions = {}
    for region in built:
        variables = {}
        for var_id, analysis in region["variables"].items():
            values = [v for v in analysis["series"]["values"] if v is not None]
            trend = analysis["trend"]
            variables[var_id] = {
                "mean": sum(values) / len(values),
                "total_change": trend["total_change"],
                "slope_per_decade": trend["slope_per_decade"],
                "slope_units": trend["slope_units"],
                "p_value": trend["p_value"],
                "alpha": trend["alpha"],
                "significant": trend["significant"],
                "direction": trend["direction"],
                "period_start": trend["period_start"],
                "period_end": trend["period_end"],
            }
        heat = region["variables"]["temperature_2m"]
        years: dict[str, list[float]] = {}
        for month, value in zip(heat["series"]["time"], heat["anomalies"], strict=True):
            if value is not None:
                years.setdefault(month[:4], []).append(value)
        regions[region["id"]] = {
            "name": region["name"],
            "temperature_annual": [
                {"year": year, "value": sum(vals) / 12}
                for year, vals in years.items()
                if len(vals) == 12
            ],
            "variables": variables,
        }
    generated_at = datetime.now(UTC).isoformat(timespec="seconds")
    return {"version": 1, "generated_at": generated_at, "regions": regions}


def write_regions(out_dir: Path, specs: tuple[RegionSpec, ...] = REGIONS) -> dict:
    # Build everything first so a failure never leaves a partial set on disk.
    built = [build_region(spec) for spec in specs]
    out_dir.mkdir(parents=True, exist_ok=True)
    for region in built:
        (out_dir / f"{region['id']}.json").write_text(json.dumps(region, ensure_ascii=False) + "\n")
        t = {k: region["variables"][k]["trend"] for k in ("temperature_2m", "precipitation")}
        print(
            f"{region['id']:20s} "
            + " ".join(
                f"{k}={v['slope_per_decade']:+.4f} {v['slope_units']} p={v['p_value']:.4f}"
                for k, v in t.items()
            )
        )
    summary = json.dumps(build_summary(built), ensure_ascii=False, separators=(",", ":"))
    (out_dir / "summary.json").write_text(summary + "\n")
    manifest = build_manifest(specs)
    text = json.dumps(manifest, ensure_ascii=False, indent=1)
    (out_dir / "manifest.json").write_text(text + "\n")
    return manifest
