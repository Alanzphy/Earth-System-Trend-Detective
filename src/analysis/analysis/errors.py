"""Errors raised by the analysis area."""


class AnalysisError(Exception):
    """Base class for analysis errors."""


class InsufficientDataError(AnalysisError):
    """The series is too short or too sparse to estimate a trend."""
