from __future__ import annotations

from collections.abc import Callable
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.cache import TTLCache
from app.core.config import Settings, get_settings
from app.core.errors import ApiError
from app.sources import DataSource, build_source
from contracts import AnalysisResponse, CatalogResponse, ErrorResponse, TimeSeries, TrendRequest

router = APIRouter(tags=["trend"])

# Protects the free-tier backend: NASA POWER tiles are ≤10°, so 40°×40° is at most 16 requests.
MAX_SPAN_DEG = 40.0

Analyzer = Callable[[TimeSeries, str], AnalysisResponse]

_cache: TTLCache[AnalysisResponse] | None = None


def get_source(settings: Annotated[Settings, Depends(get_settings)]) -> DataSource:
    return build_source(settings.data_adapter)


def get_analyzer() -> Analyzer:
    from analysis import compute_trend

    return lambda series, name: compute_trend(series, variable_name=name)


def get_cache(settings: Annotated[Settings, Depends(get_settings)]) -> TTLCache[AnalysisResponse]:
    global _cache
    if _cache is None:
        _cache = TTLCache(ttl_seconds=settings.cache_ttl_seconds)
    return _cache


ERRORS = {
    404: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
    502: {"model": ErrorResponse},
    503: {"model": ErrorResponse},
}


@router.get("/variables", response_model=CatalogResponse)
def list_variables(source: Annotated[DataSource, Depends(get_source)]) -> CatalogResponse:
    return source.catalog()


@router.post("/trend", response_model=AnalysisResponse, responses=ERRORS)
def compute(
    request: TrendRequest,
    source: Annotated[DataSource, Depends(get_source)],
    analyze: Annotated[Analyzer, Depends(get_analyzer)],
    cache: Annotated[TTLCache[AnalysisResponse], Depends(get_cache)],
) -> AnalysisResponse:
    import analysis
    import data

    bbox = request.bbox
    if bbox.max_lon - bbox.min_lon > MAX_SPAN_DEG or bbox.max_lat - bbox.min_lat > MAX_SPAN_DEG:
        raise ApiError(
            422,
            "region_too_large",
            f"Pick a region at most {MAX_SPAN_DEG:.0f}° wide and tall.",
        )

    variables = {v.id: v for v in source.catalog().variables}
    variable = variables.get(request.variable)
    if variable is None:
        raise ApiError(404, "unknown_variable", f"Unknown variable '{request.variable}'.")

    key = request.model_dump_json()
    cached = cache.get(key)
    if cached is not None:
        return cached

    try:
        series = source.series(request.variable, bbox, request.start, request.end)
        result = analyze(series, variable.name)
    except data.NoDataError as exc:
        raise ApiError(422, "no_data", str(exc)) from exc
    except data.UpstreamError as exc:
        status = 503 if exc.retryable else 502
        message = "NASA POWER did not respond. Try again in a minute."
        raise ApiError(status, "upstream_unavailable", message) from exc
    except analysis.InsufficientDataError as exc:
        raise ApiError(422, "insufficient_data", str(exc)) from exc

    cache.set(key, result)
    return result
