"""/variables and /trend with stubbed data and analysis (no network)."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

import data
from app.core.cache import TTLCache
from app.main import app
from app.routers.trend import get_analyzer, get_cache, get_source
from contracts import (
    AnalysisResponse,
    BBox,
    CatalogResponse,
    TimeSeries,
    TrendResult,
    Variable,
)

VARIABLE = Variable(
    id="temperature_2m",
    name="Air temperature at 2 m",
    units="°C",
    description="How warm the air is near the ground.",
    category="temperature",
    palette="RdBu",
    source="NASA POWER",
    source_parameter="T2M",
    available_from="1981-01",
    available_to="2025-12",
)
IBERIA = {"min_lon": -10, "min_lat": 36, "max_lon": 3, "max_lat": 44}
REQUEST = {"variable": "temperature_2m", "bbox": IBERIA, "start": "1981-01", "end": "1981-03"}


class StubSource:
    def __init__(self, error: Exception | None = None) -> None:
        self.calls = 0
        self.error = error

    def catalog(self) -> CatalogResponse:
        return CatalogResponse(variables=[VARIABLE])

    def series(self, variable: str, bbox: BBox, start: str, end: str) -> TimeSeries:
        self.calls += 1
        if self.error:
            raise self.error
        return TimeSeries(
            variable=variable,
            units="°C",
            bbox=bbox,
            time=["1981-01", "1981-02", "1981-03"],
            values=[1.0, None, 3.0],
            source="stub",
            grid_points=4,
        )


def stub_analyzer(series: TimeSeries, name: str) -> AnalysisResponse:
    return AnalysisResponse(
        series=series,
        anomalies=[0.0, None, 0.0],
        trend_line=[0.0, 0.0, 0.0],
        trend=TrendResult(
            method="stub",
            deseasonalized=True,
            slope_per_decade=0.0,
            slope_units="°C/decade",
            ci_low=-1.0,
            ci_high=1.0,
            p_value=0.5,
            alpha=0.05,
            significant=False,
            direction="no trend",
            total_change=0.0,
            n=2,
            period_start=series.time[0],
            period_end=series.time[-1],
        ),
        verdict=f"{name}: no trend.",
    )


@pytest.fixture
def source() -> Iterator[StubSource]:
    stub = StubSource()
    cache = TTLCache[AnalysisResponse](ttl_seconds=60)
    app.dependency_overrides[get_source] = lambda: stub
    app.dependency_overrides[get_analyzer] = lambda: stub_analyzer
    app.dependency_overrides[get_cache] = lambda: cache
    yield stub
    app.dependency_overrides.clear()


client = TestClient(app)


def test_variables_returns_catalog(source: StubSource) -> None:
    response = client.get("/variables")

    assert response.status_code == 200
    assert response.json()["variables"][0]["id"] == "temperature_2m"


def test_trend_returns_analysis_and_caches(source: StubSource) -> None:
    first = client.post("/trend", json=REQUEST)
    second = client.post("/trend", json=REQUEST)

    assert first.status_code == 200
    body = AnalysisResponse.model_validate(first.json())
    assert body.verdict == "Air temperature at 2 m: no trend."
    assert body.series.values == [1.0, None, 3.0]
    assert second.json() == first.json()
    assert source.calls == 1


def test_unknown_variable_is_404(source: StubSource) -> None:
    response = client.post("/trend", json={**REQUEST, "variable": "nope"})

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "unknown_variable"


@pytest.mark.parametrize(
    ("override", "code"),
    [
        ({"bbox": {**IBERIA, "max_lon": 45}}, "region_too_large"),
        ({"start": "1990-01", "end": "1980-01"}, "invalid_request"),
        ({"bbox": {**IBERIA, "min_lat": 50}}, "invalid_request"),
    ],
)
def test_bad_requests_use_error_contract(
    source: StubSource, override: dict[str, object], code: str
) -> None:
    response = client.post("/trend", json={**REQUEST, **override})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == code
    assert source.calls == 0


@pytest.mark.parametrize(
    ("error", "status", "code"),
    [
        (data.NoDataError("nothing here"), 422, "no_data"),
        (data.UpstreamError("down", retryable=True), 503, "upstream_unavailable"),
        (data.UpstreamError("rejected", retryable=False), 502, "upstream_unavailable"),
    ],
)
def test_data_errors_map_to_error_contract(
    source: StubSource, error: Exception, status: int, code: str
) -> None:
    source.error = error

    response = client.post("/trend", json=REQUEST)

    assert response.status_code == status
    assert response.json()["error"]["code"] == code
