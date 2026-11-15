"""Offline tests for the NASA POWER client and get_series/fetch_grid (httpx.MockTransport)."""

from __future__ import annotations

import json
import math
from pathlib import Path

import httpx
import numpy as np
import pytest

from contracts import BBox
from data import (
    NoDataError,
    PowerClient,
    UnknownVariableError,
    UpstreamError,
    fetch_grid,
    get_catalog,
    get_series,
)
from data.power import parse_response, plan_tiles

FIXTURE = json.loads(
    (Path(__file__).parent / "fixtures" / "power_regional_t2m_2000.json").read_text()
)
IBERIA_BOX = BBox(min_lon=-4, min_lat=40, max_lon=-2, max_lat=42)


@pytest.fixture(autouse=True)
def _no_env_cache(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("ESTD_CACHE_DIR", raising=False)


class FakePower:
    """Serves the pool features that fall inside each requested box, like POWER does."""

    def __init__(self, features: list[dict], statuses: list[int] | None = None) -> None:
        self.features = features
        self.statuses = list(statuses or [])
        self.requests: list[dict[str, str]] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        params = dict(request.url.params)
        self.requests.append(params)
        if self.statuses:
            status = self.statuses.pop(0)
            if status != 200:
                return httpx.Response(status, json={"messages": [f"fake error {status}"]})
        lo0, la0 = float(params["longitude-min"]), float(params["latitude-min"])
        lo1, la1 = float(params["longitude-max"]), float(params["latitude-max"])
        inside = [
            f
            for f in self.features
            if lo0 <= f["geometry"]["coordinates"][0] <= lo1
            and la0 <= f["geometry"]["coordinates"][1] <= la1
        ]
        return httpx.Response(200, json={"type": "FeatureCollection", "features": inside})

    def client(self, **kwargs) -> PowerClient:
        return PowerClient(transport=httpx.MockTransport(self), **kwargs)


def feature(lon: float, lat: float, parameter: str, value: float, year: int = 2000) -> dict:
    monthly = {f"{year}{m:02d}": value for m in range(1, 13)}
    monthly[f"{year}13"] = value
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat, 100.0]},
        "properties": {"parameter": {parameter: monthly}},
    }


def bounds(params: dict[str, str]) -> tuple[float, float, float, float]:
    return tuple(
        float(params[k]) for k in ("longitude-min", "latitude-min", "longitude-max", "latitude-max")
    )


def test_parse_drops_annual_key_and_fill_values() -> None:
    grid = parse_response(FIXTURE, "T2M")
    assert grid.months == tuple(f"2000-{m:02d}" for m in range(1, 13))
    assert len(grid) == 4
    assert np.isnan(grid.values[:, 11]).all()  # 200012 = -999 everywhere
    assert np.isnan(grid.values[1, 2])  # 200003 = -999 at the second point
    assert grid.values[0, 0] == 6.0


def test_series_is_cos_lat_weighted_and_ignores_missing() -> None:
    fake = FakePower(FIXTURE["features"])
    series = get_series("temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=fake.client())

    w_south, w_north = math.cos(math.radians(40.25)), math.cos(math.radians(41.75))
    jan = (w_south * (6 + 7) + w_north * (5 + 4)) / (2 * w_south + 2 * w_north)
    mar = (w_south * 8 + w_north * (7 + 6)) / (w_south + 2 * w_north)  # point 2 missing
    assert series.values[0] == round(jan, 4)
    assert series.values[2] == round(mar, 4)
    assert series.values[0] != round((6 + 7 + 5 + 4) / 4, 4)
    assert series.values[11] is None
    assert series.grid_points == 4
    assert series.units == "°C"
    assert series.source == "NASA POWER"
    assert fake.requests[0]["start"] == "2000" and fake.requests[0]["end"] == "2000"


def test_series_is_trimmed_to_the_month_range() -> None:
    fake = FakePower(FIXTURE["features"])
    series = get_series("temperature_2m", IBERIA_BOX, "2000-03", "2000-05", client=fake.client())
    assert series.time == ["2000-03", "2000-04", "2000-05"]
    assert len(series.values) == 3


def test_large_box_is_split_into_tiles_with_correct_bounds() -> None:
    box = BBox(min_lon=-20, min_lat=0, max_lon=-5, max_lat=5)
    assert plan_tiles(box) == [(-20.0, 0.0, -12.5, 5.0), (-12.5, 0.0, -5.0, 5.0)]

    fake = FakePower([feature(-15, 2, "T2M", 20.0), feature(-8, 2, "T2M", 30.0)])
    series = get_series("temperature_2m", box, "2000-01", "2000-12", client=fake.client())
    assert [bounds(r) for r in fake.requests] == plan_tiles(box)
    assert series.grid_points == 2
    assert series.values[0] == 25.0


def test_points_on_shared_tile_edges_are_deduplicated() -> None:
    box = BBox(min_lon=-20, min_lat=0, max_lon=-5, max_lat=5)
    edge = feature(-12.5, 2.5, "T2M", 10.0)
    fake = FakePower([feature(-15, 2, "T2M", 20.0), edge, feature(-8, 2, "T2M", 30.0)])
    grid = fetch_grid("temperature_2m", box, "2000-01", "2000-12", client=fake.client())

    assert len(fake.requests) == 2  # both tiles returned the edge point
    assert sorted(grid.lons.tolist()) == [-15.0, -12.5, -8.0]
    assert grid.values.shape == (3, 12)
    assert grid.units == "°C"


def test_small_box_is_widened_and_filtered_back() -> None:
    box = BBox(min_lon=10, min_lat=20, max_lon=11, max_lat=21)
    assert plan_tiles(box) == [(9.5, 19.5, 11.5, 21.5)]

    fake = FakePower([feature(10.5, 20.5, "T2M", 15.0), feature(9.6, 19.6, "T2M", 99.0)])
    series = get_series("temperature_2m", box, "2000-01", "2000-12", client=fake.client())
    assert bounds(fake.requests[0]) == (9.5, 19.5, 11.5, 21.5)
    assert series.grid_points == 1
    assert series.values[0] == 15.0


def test_small_box_without_points_uses_the_nearest_one() -> None:
    box = BBox(min_lon=10.1, min_lat=20.1, max_lon=10.4, max_lat=20.4)
    fake = FakePower([feature(10.0, 20.0, "T2M", 1.0), feature(10.625, 20.5, "T2M", 2.0)])
    series = get_series("temperature_2m", box, "2000-01", "2000-12", client=fake.client())
    assert series.grid_points == 1
    assert series.values[0] == 1.0


@pytest.mark.parametrize(
    ("variable", "parameter", "raw", "expected", "units"),
    [
        ("solar_radiation", "ALLSKY_SFC_SW_DWN", 18.0, 5.0, "kWh/m²/day"),
        ("evapotranspiration", "EVLAND", 2.0, 2.0, "mm/day"),
    ],
)
def test_unit_conversion(
    variable: str, parameter: str, raw: float, expected: float, units: str
) -> None:
    fake = FakePower([feature(-3, 41, parameter, raw)])
    series = get_series(variable, IBERIA_BOX, "2000-01", "2000-12", client=fake.client())
    assert fake.requests[0]["parameters"] == parameter
    assert series.values == [expected] * 12
    assert series.units == units


def test_unknown_variable() -> None:
    with pytest.raises(UnknownVariableError):
        get_series("sea_level", IBERIA_BOX, "2000-01", "2000-12", client=FakePower([]).client())


def test_period_outside_availability_and_empty_region() -> None:
    fake = FakePower(FIXTURE["features"])
    with pytest.raises(NoDataError):
        get_series("solar_radiation", IBERIA_BOX, "1981-01", "1983-12", client=fake.client())
    assert fake.requests == []
    with pytest.raises(NoDataError):
        get_series(
            "temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=FakePower([]).client()
        )


def test_retries_once_on_5xx() -> None:
    fake = FakePower(FIXTURE["features"], statuses=[503, 200])
    series = get_series("temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=fake.client())
    assert len(fake.requests) == 2
    assert series.grid_points == 4

    fake = FakePower(FIXTURE["features"], statuses=[502, 503])
    with pytest.raises(UpstreamError) as err:
        get_series("temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=fake.client())
    assert err.value.retryable and err.value.status_code == 503


def test_client_errors_are_not_retried() -> None:
    fake = FakePower(FIXTURE["features"], statuses=[422])
    with pytest.raises(UpstreamError) as err:
        get_series("temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=fake.client())
    assert not err.value.retryable
    assert "fake error 422" in str(err.value)
    assert len(fake.requests) == 1

def test_rate_limit_waits_and_recovers() -> None:
    waits: list[float] = []
    fake = FakePower(FIXTURE["features"], statuses=[429, 429, 200, 200])
    series = get_series(
        "temperature_2m", IBERIA_BOX, "2000-01", "2000-12",
        client=fake.client(sleep=waits.append),
    )
    assert series.values[0] is not None
    assert waits == [4.0, 8.0]


def test_rate_limit_gives_up_as_retryable() -> None:
    waits: list[float] = []
    fake = FakePower(FIXTURE["features"], statuses=[429] * 10)
    with pytest.raises(UpstreamError) as err:
        get_series(
            "temperature_2m", IBERIA_BOX, "2000-01", "2000-12",
            client=fake.client(sleep=waits.append),
        )
    assert err.value.retryable and err.value.status_code == 429
    assert len(waits) == 4



def test_timeout_is_retryable() -> None:
    calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        raise httpx.ReadTimeout("slow", request=request)

    client = PowerClient(transport=httpx.MockTransport(handler))
    with pytest.raises(UpstreamError) as err:
        get_series("temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=client)
    assert err.value.retryable
    assert len(calls) == 2


def test_memory_and_disk_cache(tmp_path: Path) -> None:
    fake = FakePower(FIXTURE["features"])
    client = fake.client(cache_dir=tmp_path)
    first = get_series("temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=client)
    get_series("temperature_2m", IBERIA_BOX, "2000-03", "2000-06", client=client)
    assert len(fake.requests) == 1
    assert len(list(tmp_path.glob("T2M_*_2000-2000.json"))) == 1

    other = FakePower([])
    again = get_series(
        "temperature_2m", IBERIA_BOX, "2000-01", "2000-12", client=other.client(cache_dir=tmp_path)
    )
    assert other.requests == []
    assert again == first


def test_catalog_has_the_eight_variables() -> None:
    catalog = get_catalog()
    ids = [v.id for v in catalog.variables]
    assert ids == [
        "temperature_2m",
        "precipitation",
        "relative_humidity_2m",
        "specific_humidity_2m",
        "wind_speed_10m",
        "solar_radiation",
        "evapotranspiration",
        "soil_wetness_root",
    ]
    by_id = {v.id: v for v in catalog.variables}
    assert by_id["solar_radiation"].available_from == "1984-01"
    assert by_id["wind_speed_10m"].palette == "RdBu"
    assert by_id["evapotranspiration"].palette == "BrBG"
    assert all(v.source == "NASA POWER" for v in catalog.variables)
