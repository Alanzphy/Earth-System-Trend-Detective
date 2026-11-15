"""Precomputed demos (docs/product.md) as static files for the UI."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from analysis import compute_trend
from contracts import BBox, Demo, DemoManifest, DemoPanel, DemoSummary
from data import get_catalog, get_series

START, END = "1981-01", "2025-12"


@dataclass(frozen=True)
class Region:
    label: str
    bbox: BBox


@dataclass(frozen=True)
class DemoSpec:
    id: str
    title: str
    summary: str
    variable: str
    regions: tuple[Region, ...]


def _box(min_lon: float, min_lat: float, max_lon: float, max_lat: float) -> BBox:
    return BBox(min_lon=min_lon, min_lat=min_lat, max_lon=max_lon, max_lat=max_lat)


DEMOS: tuple[DemoSpec, ...] = (
    DemoSpec(
        id="iberia-warming",
        title="Warming over the Iberian Peninsula",
        summary="Near-surface air temperature over Spain and Portugal since 1981, "
        "with the seasonal cycle removed.",
        variable="temperature_2m",
        regions=(Region("Iberian Peninsula", _box(-10, 36, 3, 44)),),
    ),
    DemoSpec(
        id="rain-opposite-directions",
        title="Same variable, opposite directions",
        summary="Rainfall is rising in the Western Sahel while Central Chile is drying: "
        "one variable, two regions, two directions.",
        variable="precipitation",
        regions=(
            Region("Western Sahel", _box(-17, 12, -2, 18)),
            Region("Central Chile", _box(-73, -38, -70, -30)),
        ),
    ),
)


def build_demo(spec: DemoSpec) -> Demo:
    name = {v.id: v.name for v in get_catalog().variables}[spec.variable]
    panels = [
        DemoPanel(
            label=region.label,
            analysis=compute_trend(
                get_series(spec.variable, region.bbox, START, END), variable_name=name
            ),
        )
        for region in spec.regions
    ]
    return Demo(id=spec.id, title=spec.title, summary=spec.summary, panels=panels)


def write_demos(out_dir: Path) -> DemoManifest:
    out_dir.mkdir(parents=True, exist_ok=True)
    summaries = []
    for spec in DEMOS:
        demo = build_demo(spec)
        file = f"{spec.id}.json"
        (out_dir / file).write_text(demo.model_dump_json(indent=1) + "\n")
        summaries.append(
            DemoSummary(id=demo.id, title=demo.title, summary=demo.summary, file=file)
        )
        for panel in demo.panels:
            trend = panel.analysis.trend
            print(
                f"{spec.id:26s} {panel.label:20s} {trend.slope_per_decade:+.4f} "
                f"{trend.slope_units} p={trend.p_value:.4f} {trend.direction}"
            )
    manifest = DemoManifest(generated_at=datetime.now(UTC).isoformat(timespec="seconds"),
                            demos=summaries)
    (out_dir / "manifest.json").write_text(manifest.model_dump_json(indent=1) + "\n")
    return manifest
