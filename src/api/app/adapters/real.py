from app.adapters.base import Series, Trend


class RealDataAdapter:
    def get_series(
        self,
        *,
        variable: str,
        bbox: tuple[float, float, float, float],
        start: str,
        end: str,
        resolution: str,
    ) -> Series:
        try:
            from data import get_series
        except ImportError as exc:
            raise RuntimeError(
                "data.get_series is not available yet; see issue #3"
            ) from exc

        return get_series(
            variable=variable,
            bbox=bbox,
            start=start,
            end=end,
            resolution=resolution,
        )


class RealAnalysisAdapter:
    def compute_trend(self, series: Series) -> Trend:
        try:
            from analysis import compute_trend
        except ImportError as exc:
            raise RuntimeError(
                "analysis.compute_trend is not available yet"
            ) from exc

        return compute_trend(series)
