import numpy as np
import pymannkendall as mk
import pytest

from analysis import InsufficientDataError, compute_trend
from analysis.trend import _format_p
from contracts import BBox, TimeSeries

N_MONTHS = 540  # 1981-01..2025-12
T = np.arange(N_MONTHS)
SEASONAL = 8.0 * np.sin(2 * np.pi * T / 12)


def make_series(values, start_year: int = 1981, units: str = "°C") -> TimeSeries:
    time = [f"{start_year + i // 12}-{i % 12 + 1:02d}" for i in range(len(values))]
    return TimeSeries(
        variable="temperature_2m",
        units=units,
        bbox=BBox(min_lon=-10, min_lat=36, max_lon=3, max_lat=44),
        time=time,
        values=[None if v is None or np.isnan(v) else float(v) for v in values],
        source="synthetic",
        grid_points=1,
    )


def ar1(rng: np.random.Generator, phi: float, n: int = N_MONTHS) -> np.ndarray:
    e = np.empty(n)
    e[0] = rng.normal() / np.sqrt(1 - phi**2)
    for i in range(1, n):
        e[i] = phi * e[i - 1] + rng.normal()
    return e


def test_recovers_linear_trend_with_seasonal_cycle():
    rng = np.random.default_rng(42)
    slope_decade = 0.26
    values = SEASONAL + slope_decade / 120 * T + rng.normal(0, 0.5, N_MONTHS)
    result = compute_trend(make_series(values), variable_name="Air temperature at 2 m")
    trend = result.trend

    assert trend.slope_per_decade == pytest.approx(slope_decade, abs=0.03)
    assert trend.ci_low < slope_decade < trend.ci_high
    assert trend.significant and trend.p_value < 0.05
    assert trend.direction == "increasing"
    assert trend.deseasonalized
    assert trend.method == "Theil–Sen slope + Mann–Kendall (Hamed–Rao)"
    assert trend.slope_units == "°C/decade"
    assert trend.n == N_MONTHS
    assert (trend.period_start, trend.period_end) == ("1981-01", "2025-12")
    assert trend.total_change == pytest.approx(trend.slope_per_decade * 4.5)
    # Anomalies have the seasonal cycle removed: residual amplitude ≈ noise + trend.
    assert np.std(result.anomalies) < 1.5
    assert len(result.trend_line) == N_MONTHS
    assert result.trend_line[-1] - result.trend_line[0] == pytest.approx(
        trend.slope_per_decade * (N_MONTHS - 1) / 120
    )
    assert (
        result.verdict.startswith("Air temperature at 2 m increased by about 0.2")
        and "°C per decade (1981–2025)" in result.verdict
    )
    assert "statistically significant (p < 0.001)" in result.verdict


def test_no_trend_false_positive_rate_near_alpha():
    flagged = sum(
        compute_trend(
            make_series(SEASONAL + np.random.default_rng(seed).normal(0, 1, N_MONTHS))
        ).trend.significant
        for seed in range(40)
    )
    # Expected ≈ alpha × 40 = 2; allow up to 10 %.
    assert flagged <= 4


def test_hamed_rao_controls_autocorrelated_noise():
    hamed_rao = plain = 0
    for seed in range(40):
        noise = ar1(np.random.default_rng(100 + seed), phi=0.9)
        result = compute_trend(make_series(SEASONAL + noise))
        hamed_rao += result.trend.significant
        plain += bool(mk.original_test(np.array(result.anomalies)).h)
    # Plain Mann–Kendall often mistakes persistence for a trend; Hamed–Rao rarely does.
    assert plain >= 15
    assert hamed_rao <= 6
    assert plain >= 3 * hamed_rao


def test_outliers_barely_move_theil_sen_slope():
    rng = np.random.default_rng(7)
    values = SEASONAL + 0.3 / 120 * T + rng.normal(0, 0.5, N_MONTHS)
    clean = compute_trend(make_series(values)).trend.slope_per_decade
    spiked = values.copy()
    spiked[rng.choice(N_MONTHS // 2, 10, replace=False) + N_MONTHS // 2] += 25.0
    dirty = compute_trend(make_series(spiked)).trend.slope_per_decade
    assert dirty == pytest.approx(clean, abs=0.05)
    # Ordinary least squares would be pulled far away by the same spikes.
    ols = np.polyfit(T, spiked - SEASONAL, 1)[0] * 120
    assert abs(ols - clean) > 3 * abs(dirty - clean)


def test_missing_values_keep_time_spacing():
    rng = np.random.default_rng(3)
    values = SEASONAL + 0.5 / 120 * T + rng.normal(0, 0.3, N_MONTHS)
    values[rng.choice(N_MONTHS, 100, replace=False)] = np.nan
    values[:12] = np.nan  # a whole missing first year
    series = make_series(values)
    result = compute_trend(series)

    missing = [v is None for v in series.values]
    assert [a is None for a in result.anomalies] == missing
    assert all(v is not None for v in result.trend_line)
    assert result.trend.n == N_MONTHS - sum(missing)
    assert result.trend.period_start == "1981-01"
    assert result.trend.slope_per_decade == pytest.approx(0.5, abs=0.03)
    assert result.trend.significant


def test_insufficient_data_raises():
    short = make_series(SEASONAL[:23])
    with pytest.raises(InsufficientDataError):
        compute_trend(short)
    sparse = SEASONAL.copy()
    sparse[30:] = np.nan
    sparse[:10] = np.nan  # 20 valid months
    with pytest.raises(InsufficientDataError):
        compute_trend(make_series(sparse))
    with pytest.raises(InsufficientDataError):
        compute_trend(make_series([]))


def test_unsorted_time_rejected():
    series = make_series(SEASONAL[:36])
    swapped = series.model_copy(update={"time": [series.time[1], series.time[0], *series.time[2:]]})
    with pytest.raises(ValueError):
        compute_trend(swapped)


@pytest.mark.parametrize("seed", range(10))
def test_verdict_never_claims_significance_when_not_significant(seed):
    values = SEASONAL + np.random.default_rng(seed).normal(0, 1, N_MONTHS)
    result = compute_trend(make_series(values), alpha=0.01)
    trend = result.trend
    assert trend.significant == (trend.p_value < trend.alpha)
    if not trend.significant:
        assert trend.direction == "no trend"
        assert "significant" not in result.verdict.lower()
        assert "cannot rule out chance" in result.verdict
        assert "A longer period might reveal a trend." in result.verdict


def test_verdict_for_weak_trend_reports_p_value():
    values = SEASONAL[:120] + np.random.default_rng(0).normal(0, 1, 120)
    result = compute_trend(make_series(values, start_year=2000))
    assert not result.trend.significant
    assert "(2000–2009)" in result.verdict
    assert "p = 0." in result.verdict


def test_decreasing_trend():
    rng = np.random.default_rng(11)
    values = SEASONAL - 0.11 / 120 * T + rng.normal(0, 0.2, N_MONTHS)
    result = compute_trend(make_series(values, units="mm/day"), variable_name="Precipitation")
    assert result.trend.direction == "decreasing"
    assert result.trend.significant
    assert result.trend.slope_per_decade == pytest.approx(-0.11, abs=0.02)
    assert result.trend.total_change < 0
    assert result.verdict.startswith("Precipitation decreased by about 0.1")
    assert "mm/day per decade" in result.verdict


@pytest.mark.parametrize(
    ("p", "text"),
    [
        (0.0004, "p < 0.001"),
        (0.0012, "p = 0.0012"),
        (0.036, "p = 0.036"),
        (0.0499, "p = 0.049"),
        (0.32, "p = 0.32"),
        (0.29, "p = 0.29"),
    ],
)
def test_p_value_formatting_never_rounds_up(p, text):
    assert _format_p(p) == text
