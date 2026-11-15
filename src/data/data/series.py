"""Gridded and area-averaged monthly data for one catalog variable."""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import cache

import numpy as np

from contracts import BBox, Resolution, TimeSeries
from data.catalog import get_entry
from data.errors import NoDataError
from data.power import PowerClient

_YEAR_MONTH = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


@dataclass(frozen=True)
class Grid:
    """Source grid points of one variable, already in the catalog units.

    `values` has shape (len(lons), len(time)); NaN = missing.
    """

    lons: np.ndarray
    lats: np.ndarray
    time: list[str]  # "YYYY-MM", ascending
    values: np.ndarray
    units: str


@cache
def default_client() -> PowerClient:
    """Process-wide client, so its in-memory cache is shared by every caller."""
    return PowerClient()


def fetch_grid(
    variable: str,
    bbox: BBox,
    start: str,
    end: str,
    *,
    client: PowerClient | None = None,
) -> Grid:
    """Grid points of `variable` inside `bbox` for months `start..end` (inclusive `YYYY-MM`).

    The period is clipped to the variable's availability. Points shared by adjacent
    tiles appear once.
    """
    for value in (start, end):
        if not _YEAR_MONTH.match(value):
            raise ValueError(f"Expected YYYY-MM, got '{value}'")
    if start > end:
        raise ValueError("start must not be after end")

    entry = get_entry(variable)
    meta = entry.variable
    first = max(start, meta.available_from)
    last = min(end, meta.available_to)
    if first > last:
        raise NoDataError(
            f"{meta.name} is available from {meta.available_from} to {meta.available_to}; "
            f"nothing in {start}..{end}"
        )

    raw = (client or default_client()).fetch_region(
        meta.source_parameter, bbox, int(first[:4]), int(last[:4])
    )
    cols = [j for j, m in enumerate(raw.months) if first <= m <= last]
    if len(raw) == 0 or not cols:
        raise NoDataError(f"NASA POWER returned no {meta.name.lower()} data for this region")

    values = raw.values[:, cols] / entry.divisor
    values.flags.writeable = False
    return Grid(
        lons=raw.lon,
        lats=raw.lat,
        time=[raw.months[j] for j in cols],
        values=values,
        units=meta.units,
    )


def get_series(
    variable: str,
    bbox: BBox,
    start: str,
    end: str,
    *,
    resolution: Resolution = "monthly",
    client: PowerClient | None = None,
) -> TimeSeries:
    """Cosine-of-latitude weighted monthly mean of `variable` over `bbox`.

    Same period rules as `fetch_grid`. Months where no grid point has data are `None`.
    """
    if resolution != "monthly":
        raise ValueError(f"Unsupported resolution '{resolution}'")
    meta = get_entry(variable).variable
    grid = fetch_grid(variable, bbox, start, end, client=client)

    weights = np.cos(np.radians(grid.lats))[:, None] * ~np.isnan(grid.values)
    total = weights.sum(axis=0)
    sums = np.nansum(grid.values * weights, axis=0)
    means = np.divide(sums, total, out=np.full(len(grid.time), np.nan), where=total > 0)

    out = [None if np.isnan(v) else round(float(v), 4) for v in means]
    if all(v is None for v in out):
        raise NoDataError(f"NASA POWER has only missing {meta.name.lower()} values here")

    return TimeSeries(
        variable=meta.id,
        units=meta.units,
        bbox=bbox,
        time=grid.time,
        values=out,
        source=meta.source,
        grid_points=len(grid.lons),
    )
