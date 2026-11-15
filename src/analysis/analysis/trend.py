"""Trend of a monthly series: deseasonalized anomalies, Theil–Sen slope, Mann–Kendall test.

Pure functions, no I/O. The pipeline is documented in docs/science.md.
"""

from __future__ import annotations

import math

import numpy as np
import pymannkendall as mk
from scipy.stats import theilslopes

from analysis.errors import InsufficientDataError
from contracts import AnalysisResponse, TimeSeries, TrendResult

METHOD = "Theil–Sen slope + Mann–Kendall (Hamed–Rao)"
MIN_MONTHS = 24
MONTHS_PER_DECADE = 120
CI_LEVEL = 0.95
# Autocorrelation lags (months) considered by the Hamed–Rao variance correction.
HAMED_RAO_LAGS = 12


def compute_trend(
    series: TimeSeries,
    alpha: float = 0.05,
    variable_name: str | None = None,
) -> AnalysisResponse:
    """Deseasonalize a monthly series and estimate its linear trend and significance.

    Raises InsufficientDataError when fewer than 24 months have data (24 distinct months
    always span at least 2 years) and ValueError when `time` is not strictly increasing.
    """
    if not 0 < alpha < 1:
        raise ValueError("alpha must be between 0 and 1")
    if not series.time:
        raise InsufficientDataError("the series is empty")

    t = _month_index(series.time)
    span = int(t[-1]) + 1
    y = np.array([np.nan if v is None else v for v in series.values], dtype=float)
    valid = np.isfinite(y)
    n = int(valid.sum())
    if n < MIN_MONTHS:
        raise InsufficientDataError(
            f"need at least {MIN_MONTHS} months with data to estimate a trend, got {n}"
        )

    anomalies = _anomalies(y, series.time)
    ta, ya = t[valid].astype(float), anomalies[valid]

    slope, intercept, low, high = theilslopes(ya, ta, alpha=CI_LEVEL)
    p_value = _mann_kendall_p(ya)
    significant = bool(p_value < alpha)
    slope_dec = float(slope) * MONTHS_PER_DECADE
    if significant and slope_dec > 0:
        direction = "increasing"
    elif significant and slope_dec < 0:
        direction = "decreasing"
    else:
        direction = "no trend"

    trend = TrendResult(
        method=METHOD,
        deseasonalized=True,
        slope_per_decade=slope_dec,
        slope_units=f"{series.units}/decade",
        ci_low=float(low) * MONTHS_PER_DECADE,
        ci_high=float(high) * MONTHS_PER_DECADE,
        p_value=p_value,
        alpha=alpha,
        significant=significant,
        direction=direction,
        total_change=slope_dec * span / MONTHS_PER_DECADE,
        n=n,
        period_start=series.time[0],
        period_end=series.time[-1],
    )
    trend_line = [float(intercept + slope * ti) for ti in t]
    return AnalysisResponse(
        series=series,
        anomalies=[float(a) if np.isfinite(a) else None for a in anomalies],
        trend_line=trend_line,
        trend=trend,
        verdict=_verdict(trend, variable_name or series.variable, series.units),
    )


def _month_index(time: list[str]) -> np.ndarray:
    """Months elapsed since the first entry of `time` (YYYY-MM strings)."""
    months = np.array([int(s[:4]) * 12 + int(s[5:7]) - 1 for s in time])
    if np.any(np.diff(months) <= 0):
        raise ValueError("time must be strictly increasing")
    return months - months[0]


def _anomalies(y: np.ndarray, time: list[str]) -> np.ndarray:
    """Values minus the mean of their calendar month over the period (NaN stays NaN)."""
    calendar_month = np.array([int(s[5:7]) for s in time])
    anomalies = np.full_like(y, np.nan)
    for m in range(1, 13):
        sel = (calendar_month == m) & np.isfinite(y)
        if sel.any():
            anomalies[sel] = y[sel] - y[sel].mean()
    return anomalies


def _mann_kendall_p(x: np.ndarray) -> float:
    """Two-sided Mann–Kendall p-value with the Hamed–Rao autocorrelation correction.

    Only the first HAMED_RAO_LAGS autocorrelation lags enter the correction: using every lag
    (the library default) inflates false positives on white noise (see docs/science.md).
    The variance factor can become non-positive under strong negative autocorrelation; the
    uncorrected test is conservative in that case, so we use it.
    """
    with np.errstate(divide="ignore", invalid="ignore"):
        result = mk.hamed_rao_modification_test(x, lag=HAMED_RAO_LAGS)
    p = float(result.p)
    if result.var_s <= 0 or not math.isfinite(p):
        p = float(mk.original_test(x).p)
    return min(max(p, 0.0), 1.0)


def _verdict(trend: TrendResult, name: str, units: str) -> str:
    period = _format_period(trend.period_start, trend.period_end)
    magnitude = f"{_format_number(abs(trend.slope_per_decade))} {units} per decade"
    p = _format_p(trend.p_value)
    if trend.significant:
        verb = "increased" if trend.direction == "increasing" else "decreased"
        chance = "very unlikely" if trend.p_value < 0.01 else "unlikely"
        return (
            f"{name} {verb} by about {magnitude} ({period}). "
            f"This trend is statistically significant ({p}): it is {chance} to be just chance."
        )
    if trend.slope_per_decade > 0:
        change = f"rose slightly, by about {magnitude}"
    elif trend.slope_per_decade < 0:
        change = f"fell slightly, by about {magnitude}"
    else:
        change = "shows no clear change"
    return (
        f"{name} {change} ({period}), but we cannot rule out chance ({p}). "
        "A longer period might reveal a trend."
    )


def _format_period(start: str, end: str) -> str:
    if start.endswith("-01") and end.endswith("-12"):
        return f"{start[:4]}–{end[:4]}"
    return f"{start} to {end}"


def _format_p(p: float) -> str:
    """'< 0.001' when tiny; otherwise two significant figures, truncated (never rounded up
    across alpha, so a significant p is never shown as 0.05)."""
    if p < 0.001:
        return "p < 0.001"
    decimals = 1 - math.floor(math.log10(p))
    scale = 10**decimals
    return f"p = {math.floor(p * scale + 1e-9) / scale:.{decimals}f}"


def _format_number(x: float) -> str:
    """Two significant figures, without scientific notation for big values."""
    if x == 0:
        return "0"
    if x >= 10:
        return f"{x:.0f}"
    decimals = max(0, 1 - math.floor(math.log10(x)))
    return f"{x:.{decimals}f}"
