import pytest

from app.adapters.fixture import FixtureAnalysisAdapter, FixtureDataAdapter

BBOX = (-10.0, 35.0, 5.0, 45.0)


def _series() -> dict[str, object]:
    return FixtureDataAdapter().get_series(
        variable="temperature_2m",
        bbox=BBOX,
        start="2020-01",
        end="2021-12",
        resolution="monthly",
    )


def test_series_shape() -> None:
    series = _series()

    assert series["variable"] == "temperature_2m"
    assert series["units"] == "degC"
    assert series["region"] == {"type": "bbox", "coords": list(BBOX)}
    assert series["resolution"] == "monthly"
    assert series["source"] == "fixture"
    assert series["time"][0] == "2020-01"
    assert series["time"][-1] == "2021-12"
    assert len(series["time"]) == 24
    assert len(series["values"]) == 24


def test_trend_shape() -> None:
    series = _series()
    trend = FixtureAnalysisAdapter().compute_trend(series)

    assert trend["method"] == "mann-kendall+sen"
    assert trend["deseasonalized"] is True
    assert trend["slope"] == 0.02
    assert trend["slope_units"] == "degC/decade"
    assert trend["p_value"] == 0.01
    assert trend["significant"] is True
    assert trend["alpha"] == 0.05
    assert trend["ci"] == [0.01, 0.03]
    assert trend["n"] == 24
    assert trend["period"] == ["2020-01", "2021-12"]


def test_only_monthly_resolution() -> None:
    with pytest.raises(ValueError, match="monthly"):
        FixtureDataAdapter().get_series(
            variable="temperature_2m",
            bbox=BBOX,
            start="2020-01",
            end="2021-12",
            resolution="daily",
        )


def test_invalid_period() -> None:
    with pytest.raises(ValueError, match="start must be before"):
        FixtureDataAdapter().get_series(
            variable="temperature_2m",
            bbox=BBOX,
            start="2022-01",
            end="2021-01",
            resolution="monthly",
        )
