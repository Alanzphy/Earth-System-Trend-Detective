import pytest
from pydantic import ValidationError

from contracts import BBox, TimeSeries, TrendCellProperties, TrendMapLegend, TrendRequest

IBERIA = {"min_lon": -10, "min_lat": 36, "max_lon": 3, "max_lat": 44}


def test_bbox_rejects_inverted_corners() -> None:
    with pytest.raises(ValidationError, match="lower than max"):
        BBox(min_lon=3, min_lat=36, max_lon=-10, max_lat=44)


def test_time_series_lengths_must_match() -> None:
    with pytest.raises(ValidationError, match="same length"):
        TimeSeries(
            variable="temperature_2m",
            units="°C",
            bbox=BBox(**IBERIA),
            time=["2020-01", "2020-02"],
            values=[1.0],
            source="NASA POWER",
            grid_points=1,
        )


def test_time_series_rejects_bad_month() -> None:
    with pytest.raises(ValidationError):
        TimeSeries(
            variable="temperature_2m",
            units="°C",
            bbox=BBox(**IBERIA),
            time=["2020-13"],
            values=[1.0],
            source="NASA POWER",
            grid_points=1,
        )


def test_trend_request_period_order() -> None:
    with pytest.raises(ValidationError, match="start must be before end"):
        TrendRequest(variable="t", bbox=BBox(**IBERIA), start="2020-01", end="2010-01")


def test_legend_must_span_zero() -> None:
    with pytest.raises(ValidationError, match="span zero"):
        TrendMapLegend(min=0.1, max=0.5)


def test_cell_bbox_validated() -> None:
    with pytest.raises(ValidationError):
        TrendCellProperties(
            id="c", label="c", slope=0.1, p_value=0.2, significant=False, bbox=(5, 0, 0, 5)
        )
