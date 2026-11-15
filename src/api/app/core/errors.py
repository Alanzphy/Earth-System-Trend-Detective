from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(message)


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
    )


async def api_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, ApiError)
    return _error_response(exc.status_code, exc.code, exc.message)


async def unhandled_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return _error_response(500, "internal_error", "Unexpected error")


async def validation_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    first = exc.errors()[0] if exc.errors() else {}
    where = ".".join(str(part) for part in first.get("loc", ()) if part != "body")
    message = first.get("msg", "Invalid request")
    return _error_response(422, "invalid_request", f"{where}: {message}" if where else message)
