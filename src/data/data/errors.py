"""Typed errors raised by the data area. `code` maps to `ErrorResponse.error.code`."""

from __future__ import annotations


class DataError(Exception):
    """Base class for data-area errors."""

    code = "data_error"


class UnknownVariableError(DataError):
    """The variable id is not in the catalog."""

    code = "unknown_variable"

    def __init__(self, variable: str) -> None:
        self.variable = variable
        super().__init__(f"Unknown variable '{variable}'")


class NoDataError(DataError):
    """The source has no usable values for the requested region and period."""

    code = "no_data"


class UpstreamError(DataError):
    """NASA POWER failed or answered something unexpected.

    `retryable` is True for timeouts, network errors and 5xx answers.
    """

    code = "upstream_error"

    def __init__(self, message: str, *, retryable: bool, status_code: int | None = None) -> None:
        self.retryable = retryable
        self.status_code = status_code
        super().__init__(message)
