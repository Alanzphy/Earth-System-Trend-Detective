"""Precomputed trend maps: one Theil–Sen + Mann–Kendall test per grid cell.

NASA POWER regional tiles (10° × 10°) are averaged into CELL_DEG cells with
cos(latitude) weights; each cell's monthly series goes through the same
analysis as the live API. Benjamini–Hochberg FDR is applied across all cells.
"""

from __future__ import annotations

import json
import math
from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

import numpy as np

from analysis import InsufficientDataError, compute_trend
from contracts import BBox, TimeSeries, TrendCellProperties, TrendMapEntry, TrendMapManifest
from data import fetch_grid, get_catalog
from pipeline.fdr import benjamini_hochberg

START, END = "1981-01", "2025-12"
TILE_DEG = 10
CELL_DEG = 2.5
LAT_RANGE = (-60, 70)
ALPHA = 0.05
WORKERS = 6


@dataclass(frozen=True)
class CellResult:
    bbox: tuple[float, float, float, float]
    slope: float
    p_value: float


def tiles() -> Iterator[BBox]:
    for lat in range(LAT_RANGE[0], LAT_RANGE[1], TILE_DEG):
        for lon in range(-180, 180, TILE_DEG):
            yield BBox(min_lon=lon, min_lat=lat, max_lon=lon + TILE_DEG, max_lat=lat + TILE_DEG)


def cell_series(
    lons: np.ndarray, lats: np.ndarray, values: np.ndarray, tile: BBox
) -> Iterator[tuple[tuple[float, float, float, float], np.ndarray, int]]:
    """Yield (cell bbox, weighted mean series, n points) for cells inside `tile`.

    Half-open tile bounds so points on a shared edge belong to exactly one tile.
    """
    inside = (
        (lons >= tile.min_lon)
        & (lons < tile.max_lon)
        & (lats >= tile.min_lat)
        & (lats < tile.max_lat)
    )
    lons, lats, values = lons[inside], lats[inside], values[inside]
    col = np.floor((lons - tile.min_lon) / CELL_DEG).astype(int)
    row = np.floor((lats - tile.min_lat) / CELL_DEG).astype(int)
    for c, r in sorted(set(zip(col.tolist(), row.tolist(), strict=True))):
        members = (col == c) & (row == r)
        weights = np.cos(np.radians(lats[members]))[:, None]
        block = values[members]
        valid = ~np.isnan(block)
        total = np.where(valid, weights, 0).sum(axis=0)
        mean = np.where(valid, block * weights, 0).sum(axis=0) / np.where(total > 0, total, np.nan)
        min_lon = tile.min_lon + c * CELL_DEG
        min_lat = tile.min_lat + r * CELL_DEG
        yield (min_lon, min_lat, min_lon + CELL_DEG, min_lat + CELL_DEG), mean, int(members.sum())


def tile_results(variable: str, tile: BBox) -> list[CellResult]:
    grid = fetch_grid(variable, tile, START, END)
    results = []
    for bbox, mean, n_points in cell_series(grid.lons, grid.lats, grid.values, tile):
        series = TimeSeries(
            variable=variable,
            units=grid.units,
            bbox=BBox(min_lon=bbox[0], min_lat=bbox[1], max_lon=bbox[2], max_lat=bbox[3]),
            time=grid.time,
            values=[None if math.isnan(v) else round(float(v), 4) for v in mean],
            source="NASA POWER",
            grid_points=n_points,
        )
        try:
            trend = compute_trend(series, alpha=ALPHA).trend
        except InsufficientDataError:
            continue
        results.append(CellResult(bbox, trend.slope_per_decade, trend.p_value))
    return results


def _label(bbox: tuple[float, float, float, float]) -> str:
    lat = (bbox[1] + bbox[3]) / 2
    lon = (bbox[0] + bbox[2]) / 2
    ns = "N" if lat >= 0 else "S"
    ew = "E" if lon >= 0 else "W"
    return f"{abs(lat):.2f}°{ns}, {abs(lon):.2f}°{ew} ({CELL_DEG}° cell)"


def _legend_limit(slopes: np.ndarray) -> float:
    """Symmetric limit at the 98th percentile of |slope|, rounded to 2 significant digits."""
    raw = float(np.percentile(np.abs(slopes), 98)) or 1e-6
    magnitude = 10 ** math.floor(math.log10(raw))
    return round(math.ceil(raw / magnitude * 10) / 10 * magnitude, 10)


def build_map(variable: str, out_dir: Path) -> TrendMapEntry:
    catalog = {v.id: v for v in get_catalog().variables}
    meta = catalog[variable]
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        cells = [cell for result in pool.map(lambda t: tile_results(variable, t), tiles())
                 for cell in result]

    p_values = np.array([c.p_value for c in cells])
    significant = benjamini_hochberg(p_values, ALPHA)
    features = []
    for cell, sig in zip(cells, significant, strict=True):
        props = TrendCellProperties(
            id=f"{cell.bbox[0]:g}_{cell.bbox[1]:g}",
            label=_label(cell.bbox),
            slope=round(cell.slope, 5),
            p_value=round(cell.p_value, 5),
            significant=bool(sig),
            bbox=cell.bbox,
        )
        x0, y0, x1, y1 = cell.bbox
        features.append({
            "type": "Feature",
            "geometry": {"type": "Polygon",
                         "coordinates": [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]},
            "properties": props.model_dump(mode="json"),
        })

    file = f"{variable}-{START[:4]}-{END[:4]}.geojson"
    (out_dir / file).write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":"))
    )
    limit = _legend_limit(np.array([c.slope for c in cells]))
    print(f"{variable}: {len(cells)} cells, {int(significant.sum())} significant after FDR, "
          f"legend ±{limit}")
    return TrendMapEntry(
        id=f"{variable}-{START[:4]}-{END[:4]}",
        title=f"{meta.name}: trend {START[:4]}–{END[:4]}",
        variable=variable,
        units=meta.units,
        slope_units=f"{meta.units}/decade",
        period=(START, END),
        palette=meta.palette,
        cell_size_deg=CELL_DEG,
        file=file,
        legend={"min": -limit, "max": limit},
        alpha=ALPHA,
        fdr=True,
    )


def write_trend_maps(variables: list[str], out_dir: Path) -> TrendMapManifest:
    out_dir.mkdir(parents=True, exist_ok=True)
    for stale in out_dir.glob("*.geojson"):
        stale.unlink()
    manifest = TrendMapManifest(
        generated_at=datetime.now(UTC).isoformat(timespec="seconds"),
        maps=[build_map(variable, out_dir) for variable in variables],
    )
    (out_dir / "manifest.json").write_text(manifest.model_dump_json(indent=1) + "\n")
    return manifest
