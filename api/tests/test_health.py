from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

from app.database import get_database_engine
from app.main import create_app
from app.settings import Settings


def make_client():
    app = create_app(
        Settings(
            database_url="sqlite+pysqlite:///:memory:",
            cors_origins=("http://localhost:5173",),
        )
    )
    return app, TestClient(app)


def test_health_returns_service_status():
    _, client = make_client()

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "job-tracker-api"}


def test_openapi_exposes_health_routes_only():
    _, client = make_client()

    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert set(response.json()["paths"]) == {"/health", "/health/database"}
    assert client.get("/applications").status_code == 404
    assert client.get("/stats").status_code == 404


def test_database_health_executes_select_one():
    app, client = make_client()
    test_engine = create_engine("sqlite+pysqlite:///:memory:")
    app.dependency_overrides[get_database_engine] = lambda: test_engine

    response = client.get("/health/database")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "reachable"}
    test_engine.dispose()


class UnavailableEngine:
    def connect(self):
        raise OperationalError(
            "select 1",
            {},
            RuntimeError("sensitive connection detail"),
        )


def test_database_health_returns_sanitized_503():
    app, client = make_client()
    app.dependency_overrides[get_database_engine] = lambda: UnavailableEngine()

    response = client.get("/health/database")

    assert response.status_code == 503
    assert response.json() == {
        "detail": {"status": "unhealthy", "database": "unavailable"}
    }
    assert "sensitive connection detail" not in response.text
