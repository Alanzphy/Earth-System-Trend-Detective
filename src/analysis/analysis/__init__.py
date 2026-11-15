"""Analysis area: deseasonalization, trend and significance. See src/analysis/AGENTS.md."""

from analysis.errors import AnalysisError, InsufficientDataError
from analysis.trend import compute_trend

__all__ = ["AnalysisError", "InsufficientDataError", "compute_trend"]
