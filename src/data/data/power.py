"""NASA POWER monthly `regional` client: tiling, parsing and caching.

The regional endpoint only accepts boxes whose latitude and longitude ranges are
each between 2° and 10°. Larger boxes are split into equal tiles of at most 10°;
smaller ones are widened to 2° around their center and the returned grid points
are filtered back to the requested box (or the nearest point when none is inside).
"""

from __future__ import annotations

import json
import math
import os
import time
from collections import OrderedDict
from collections.abc import Callable
from dataclasses import dataclass
from itertools import product
from pathlib import Path
from typing import Any

import httpx
import numpy as np

from contracts import BBox
from data.errors import UpstreamError

BASE_URL = "https://power.larc.nasa.gov/api/temporal/monthly/regional"
COMMUNITY = "AG"
MIN_SPAN_DEG = 2.0
MAX_SPAN_DEG = 10.0
FILL_VALUE = -999.0
DEFAULT_TIMEOUT_SECONDS = 60.0
DEFAULT_CACHE_TTL_SECONDS = 24 * 3600.0
DEFAULT_CACHE_SIZE = 64
# Waits (exponential, or the server's Retry-After) before giving up on HTTP 429.
RATE_LIMIT_RETRIES = 4

TIMEOUT_ENV = "ESTD_POWER_TIMEOUT_SECONDS"
CACHE_DIR_ENV = "ESTD_CACHE_DIR"
CACHE_TTL_ENV = "ESTD_CACHE_TTL_SECONDS"

# (min_lon, min_lat, max_lon, max_lat) sent to POWER.
Tile = tuple[float, float, float, float]
CacheKey = tuple[str, Tile, int, int]


@dataclass(frozen=True)
class GridData:
    """Grid points of one parameter. `values` has shape (points, months); NaN = missing."""

    lon: np.ndarray
    lat: np.ndarray
    months: tuple[str, ...]  # "YYYY-MM", ascending
    values: np.ndarray

    def __len__(self) -> int:
        return len(self.lon)


def _axis_ranges(lo: float, hi: float, limit: float) -> list[tuple[float, float]]:
    span = hi - lo
    if span < MIN_SPAN_DEG:
        half = MIN_SPAN_DEG / 2
        center = min(max((lo + hi) / 2, -limit + half), limit - half)
        return [(center - half, center + half)]
    n = math.ceil(span / MAX_SPAN_DEG - 1e-9)
    step = span / n
    return [(lo + i * step, hi if i == n - 1 else lo + (i + 1) * step) for i in range(n)]


def plan_tiles(bbox: BBox) -> list[Tile]:
    """Split/widen `bbox` into boxes the regional endpoint accepts."""
    lons = _axis_ranges(bbox.min_lon, bbox.max_lon, 180.0)
    lats = _axis_ranges(bbox.min_lat, bbox.max_lat, 90.0)
    return [
        (round(lo0, 4), round(la0, 4), round(lo1, 4), round(la1, 4))
        for (la0, la1), (lo0, lo1) in product(lats, lons)
    ]


def parse_response(payload: dict[str, Any], parameter: str) -> GridData:
    """Parse a regional GeoJSON answer. Drops `YYYY13` annual means; -999 becomes NaN."""
    features = payload.get("features")
    if features is None and payload.get("type") == "Feature":
        features = [payload]
    if not isinstance(features, list):
        raise UpstreamError("NASA POWER answered without grid points", retryable=False)

    rows: list[tuple[float, float, dict[str, Any]]] = []
    keys: set[str] = set()
    for feature in features:
        lon, lat = feature["geometry"]["coordinates"][:2]
        series = feature["properties"]["parameter"].get(parameter, {})
        monthly = {k: v for k, v in series.items() if len(k) == 6 and k[4:] != "13"}
        keys.update(monthly)
        rows.append((float(lon), float(lat), monthly))

    ordered = sorted(keys)
    values = np.full((len(rows), len(ordered)), np.nan)
    for i, (_, _, monthly) in enumerate(rows):
        for j, key in enumerate(ordered):
            v = monthly.get(key)
            if v is not None and v != FILL_VALUE:
                values[i, j] = float(v)
    return _frozen(
        np.array([r[0] for r in rows]),
        np.array([r[1] for r in rows]),
        tuple(f"{k[:4]}-{k[4:]}" for k in ordered),
        values,
    )


def _frozen(
    lon: np.ndarray, lat: np.ndarray, months: tuple[str, ...], values: np.ndarray
) -> GridData:
    for arr in (lon, lat, values):
        arr.flags.writeable = False
    return GridData(lon=lon, lat=lat, months=months, values=values)


def _merge(parts: list[GridData]) -> GridData:
    """Concatenate tiles, aligning months and dropping points shared by adjacent tiles."""
    months = tuple(sorted({m for p in parts for m in p.months}))
    index = {m: j for j, m in enumerate(months)}
    seen: set[tuple[float, float]] = set()
    lon: list[float] = []
    lat: list[float] = []
    rows: list[np.ndarray] = []
    for part in parts:
        cols = [index[m] for m in part.months]
        for i in range(len(part)):
            key = (round(float(part.lon[i]), 4), round(float(part.lat[i]), 4))
            if key in seen:
                continue
            seen.add(key)
            row = np.full(len(months), np.nan)
            row[cols] = part.values[i]
            lon.append(key[0])
            lat.append(key[1])
            rows.append(row)
    values = np.vstack(rows) if rows else np.empty((0, len(months)))
    return _frozen(np.array(lon), np.array(lat), months, values)


def _select(grid: GridData, bbox: BBox) -> GridData:
    """Keep points inside `bbox`; if none, keep the one nearest to its center."""
    if len(grid) == 0:
        return grid
    eps = 1e-6
    inside = (
        (grid.lon >= bbox.min_lon - eps)
        & (grid.lon <= bbox.max_lon + eps)
        & (grid.lat >= bbox.min_lat - eps)
        & (grid.lat <= bbox.max_lat + eps)
    )
    if not inside.any():
        c_lon = (bbox.min_lon + bbox.max_lon) / 2
        c_lat = (bbox.min_lat + bbox.max_lat) / 2
        dist = ((grid.lon - c_lon) * math.cos(math.radians(c_lat))) ** 2 + (grid.lat - c_lat) ** 2
        inside = np.zeros(len(grid), dtype=bool)
        inside[int(np.argmin(dist))] = True
    return _frozen(grid.lon[inside], grid.lat[inside], grid.months, grid.values[inside])


class _TtlLru:
    def __init__(self, maxsize: int, ttl: float) -> None:
        self._maxsize = maxsize
        self._ttl = ttl
        self._items: OrderedDict[CacheKey, tuple[float, GridData]] = OrderedDict()

    def get(self, key: CacheKey) -> GridData | None:
        item = self._items.get(key)
        if item is None:
            return None
        if time.monotonic() - item[0] > self._ttl:
            del self._items[key]
            return None
        self._items.move_to_end(key)
        return item[1]

    def put(self, key: CacheKey, value: GridData) -> None:
        self._items[key] = (time.monotonic(), value)
        self._items.move_to_end(key)
        while len(self._items) > self._maxsize:
            self._items.popitem(last=False)


class PowerClient:
    """Fetches NASA POWER monthly regional data with retries and caching.

    Timeout: `timeout` or env `ESTD_POWER_TIMEOUT_SECONDS` (default 60 s).
    Disk cache: `cache_dir` or env `ESTD_CACHE_DIR` (off when unset).
    """

    def __init__(
        self,
        *,
        timeout: float | None = None,
        cache_dir: str | Path | None = None,
        transport: httpx.BaseTransport | None = None,
        base_url: str = BASE_URL,
        cache_size: int = DEFAULT_CACHE_SIZE,
        cache_ttl: float | None = None,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        if timeout is None:
            timeout = float(os.environ.get(TIMEOUT_ENV, DEFAULT_TIMEOUT_SECONDS))
        if cache_dir is None:
            cache_dir = os.environ.get(CACHE_DIR_ENV) or None
        if cache_ttl is None:
            cache_ttl = float(os.environ.get(CACHE_TTL_ENV, DEFAULT_CACHE_TTL_SECONDS))
        self._http = httpx.Client(timeout=timeout, transport=transport)
        self._base_url = base_url
        self._cache_dir = Path(cache_dir) if cache_dir else None
        self._memory = _TtlLru(cache_size, cache_ttl)
        self._sleep = sleep

    def close(self) -> None:
        self._http.close()

    def fetch_region(self, parameter: str, bbox: BBox, start_year: int, end_year: int) -> GridData:
        """Grid points of `parameter` inside `bbox` for whole years `start_year..end_year`."""
        parts = [self.fetch_tile(parameter, t, start_year, end_year) for t in plan_tiles(bbox)]
        return _select(_merge(parts), bbox)

    def fetch_tile(self, parameter: str, tile: Tile, start_year: int, end_year: int) -> GridData:
        key: CacheKey = (parameter, tile, start_year, end_year)
        cached = self._memory.get(key)
        if cached is not None:
            return cached
        raw = self._read_disk(key)
        if raw is None:
            raw = self._request(parameter, tile, start_year, end_year)
            payload = self._decode(raw)
            self._write_disk(key, raw)
        else:
            payload = self._decode(raw)
        grid = parse_response(payload, parameter)
        self._memory.put(key, grid)
        return grid

    def _request(self, parameter: str, tile: Tile, start_year: int, end_year: int) -> bytes:
        params = {
            "parameters": parameter,
            "community": COMMUNITY,
            "longitude-min": tile[0],
            "latitude-min": tile[1],
            "longitude-max": tile[2],
            "latitude-max": tile[3],
            "start": start_year,
            "end": end_year,
            "format": "JSON",
        }
        error: UpstreamError | None = None
        attempts = 0
        rate_limited = 0
        while attempts < 2:  # one retry on timeouts, network errors and 5xx
            attempts += 1
            try:
                response = self._http.get(self._base_url, params=params)
            except httpx.TimeoutException:
                error = UpstreamError("NASA POWER did not answer in time", retryable=True)
                continue
            except httpx.TransportError as exc:
                error = UpstreamError(f"Could not reach NASA POWER: {exc}", retryable=True)
                continue
            status = response.status_code
            if status == 429:
                error = UpstreamError(
                    "NASA POWER is rate limiting requests", retryable=True, status_code=status
                )
                if rate_limited < RATE_LIMIT_RETRIES:
                    rate_limited += 1
                    attempts -= 1  # rate-limit waits do not use the normal retry
                    self._sleep(_retry_after(response, default=2.0 * 2**rate_limited))
                    continue
                break
            if status >= 500:
                error = UpstreamError(
                    f"NASA POWER is unavailable (HTTP {status})", retryable=True, status_code=status
                )
                continue
            if status >= 400:
                raise UpstreamError(
                    f"NASA POWER rejected the request (HTTP {status}): {_messages(response)}",
                    retryable=False,
                    status_code=status,
                )
            return response.content
        assert error is not None
        raise error

    @staticmethod
    def _decode(raw: bytes) -> dict[str, Any]:
        try:
            payload = json.loads(raw)
        except ValueError:
            raise UpstreamError("NASA POWER answered with invalid JSON", retryable=False) from None
        if not isinstance(payload, dict):
            raise UpstreamError("NASA POWER answered with unexpected JSON", retryable=False)
        return payload

    def _disk_path(self, key: CacheKey) -> Path | None:
        if self._cache_dir is None:
            return None
        parameter, tile, start_year, end_year = key
        bounds = "_".join(f"{v:g}" for v in tile)
        return self._cache_dir / f"{parameter}_{bounds}_{start_year}-{end_year}.json"

    def _read_disk(self, key: CacheKey) -> bytes | None:
        path = self._disk_path(key)
        if path is None or not path.is_file():
            return None
        return path.read_bytes()

    def _write_disk(self, key: CacheKey, raw: bytes) -> None:
        path = self._disk_path(key)
        if path is None:
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        tmp.write_bytes(raw)
        tmp.replace(path)


def _retry_after(response: httpx.Response, default: float) -> float:
    try:
        return min(float(response.headers["Retry-After"]), 60.0)
    except (KeyError, ValueError):
        return default


def _messages(response: httpx.Response) -> str:
    try:
        body = response.json()
    except ValueError:
        return response.text[:300]
    if isinstance(body, dict):
        for field in ("messages", "errors", "detail"):
            if body.get(field):
                value = body[field]
                return "; ".join(map(str, value)) if isinstance(value, list) else str(value)
    return str(body)[:300]
