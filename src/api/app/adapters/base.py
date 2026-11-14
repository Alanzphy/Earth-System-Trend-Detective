from typing import Any, Protocol

Series = dict[str, Any]
Trend = dict[str, Any]


class DataAdapter(Protocol):
    def get_series(
        self,
        *,
        variable: str,
        bbox: tuple[float, float, float, float],
        start: str,
        end: str,
        resolution: str,
    ) -> Series: ...


class AnalysisAdapter(Protocol):
    def compute_trend(self, series: Series) -> Trend: ...
