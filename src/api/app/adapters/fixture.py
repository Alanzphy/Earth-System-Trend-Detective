import math
from datetime import date

from app.adapters.base import Series, Trend


class FixtureDataAdapter:
    def get_series(
        self,
        *,
        variable: str,
        bbox: tuple[float, float, float, float],
        start: str,
        end: str,
        resolution: str,
    ) -> Series:
        if resolution != "monthly":
            raise ValueError("The fixture adapter only supports monthly resolution")

        time = _month_range(start, end)
        values = [
            10.0 + 5.0 * math.sin(2 * math.pi * (index % 12) / 12) + 0.02 * index
            for index, _month in enumerate(time)
        ]

        return {
            "variable": variable,
            "units": "degC",
            "region": {"type": "bbox", "coords": list(bbox)},
            "resolution": resolution,
            "time": time,
            "values": values,
            "source": "fixture",
        }


class FixtureAnalysisAdapter:
    def compute_trend(self, series: Series) -> Trend:
        time = series["time"]
        return {
            "method": "mann-kendall+sen",
            "deseasonalized": True,
            "slope": 0.02,
            "slope_units": f"{series['units']}/decade",
            "p_value": 0.01,
            "significant": True,
            "alpha": 0.05,
            "ci": [0.01, 0.03],
            "n": len(series["values"]),
            "period": [time[0], time[-1]],
        }


def _month_range(start: str, end: str) -> list[str]:
    start_date = date.fromisoformat(f"{start}-01")
    end_date = date.fromisoformat(f"{end}-01")

    if start_date > end_date:
        raise ValueError("start must be before or equal to end")

    months: list[str] = []
    current = start_date
    while current <= end_date:
        months.append(current.strftime("%Y-%m"))
        if current.month == 12:
            current = date(current.year + 1, 1, 1)
        else:
            current = date(current.year, current.month + 1, 1)
    return months
