from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import ApiError, api_error_handler, unhandled_error_handler


def test_api_error_handler() -> None:
    app = FastAPI()
    app.add_exception_handler(ApiError, api_error_handler)

    @app.get("/boom")
    def boom() -> None:
        raise ApiError(503, "upstream_unavailable", "NASA no responde")

    response = TestClient(app).get("/boom")

    assert response.status_code == 503
    assert response.json() == {
        "error": {
            "code": "upstream_unavailable",
            "message": "NASA no responde",
        }
    }


def test_unhandled_error_returns_json_500() -> None:
    app = FastAPI()
    app.add_exception_handler(Exception, unhandled_error_handler)

    @app.get("/crash")
    def crash() -> None:
        raise RuntimeError("bug")

    response = TestClient(app, raise_server_exceptions=False).get("/crash")

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "internal_error", "message": "Unexpected error"}
    }
