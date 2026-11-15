"""Where the API gets catalog and series from.

`power` uses the data area (NASA POWER). `fixture` synthesizes deterministic
series with the same catalog, for offline development and demos of the UI.
"""

from __future__ import annotations

import math
from typing import Protocol

from contracts import BBox, CatalogResponse, TimeSeries


class DataSource(Protocol):
    def catalog(self) -> CatalogResponse: ...

    def series(self, variable: str, bbox: BBox, start: str, end: str) -> TimeSeries: ...


class PowerDataSource:
    def catalog(self) -> CatalogResponse:
        from data import get_catalog

        return get_catalog()

    def series(self, variable: str, bbox: BBox, start: str, end: str) -> TimeSeries:
        from data import get_series

        return get_series(variable, bbox, start, end)


class FixtureDataSource:
    """Seasonal cycle + 0.02 units/month trend; same catalog as POWER."""

    MONTHLY_INCREMENT = 0.02

    def catalog(self) -> CatalogResponse:
        from data import get_catalog

        return get_catalog()

    def series(self, variable: str, bbox: BBox, start: str, end: str) -> TimeSeries:
        from data import UnknownVariableError

        known = {v.id: v for v in self.catalog().variables}
        if variable not in known:
            raise UnknownVariableError(variable)
        time = month_range(start, end)
        seasonal = [5.0 * math.sin(2 * math.pi * (i % 12) / 12) for i in range(len(time))]
        values: list[float | None] = [
            round(10.0 + s + self.MONTHLY_INCREMENT * i, 3) for i, s in enumerate(seasonal)
        ]
        return TimeSeries(
            variable=variable,
            units=known[variable].units,
            bbox=bbox,
            time=time,
            values=values,
            source="fixture",
            grid_points=1,
        )


def month_range(start: str, end: str) -> list[str]:
    y, m = map(int, start.split("-"))
    ey, em = map(int, end.split("-"))
    months: list[str] = []
    while (y, m) <= (ey, em):
        months.append(f"{y:04d}-{m:02d}")
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    return months


def build_source(name: str) -> DataSource:
    if name == "power":
        return PowerDataSource()
    if name == "fixture":
        return FixtureDataSource()
    raise ValueError(f"Unknown data source: {name}")
