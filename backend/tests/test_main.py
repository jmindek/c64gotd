import tempfile
import os
import pytest
from fastapi.testclient import TestClient
from ..main import app, get_game_db
from ..model import GameInfo
from ..db import GameDB

@pytest.fixture
def test_app_empty_db():
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        db_path = tmp.name
    db = GameDB(db_path=db_path)
    print(f"[fixture] test_app_empty_db app id={id(app)}")
    app.dependency_overrides[get_game_db] = lambda: db
    yield app
    app.dependency_overrides = {}
    os.unlink(db_path)

@pytest.fixture
def test_app_populated_db():
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        db_path = tmp.name
    db = GameDB(db_path=db_path)
    db.populate_with_games_data()
    print(f"[fixture] test_app_populated_db app id={id(app)}")
    app.dependency_overrides[get_game_db] = lambda: db
    yield app
    app.dependency_overrides = {}
    os.unlink(db_path)

def test_game_of_the_day_success(test_app_populated_db):
    client = TestClient(test_app_populated_db)
    response = client.get("/api/game_of_the_day")
    assert response.status_code == 200
    data = response.json()
    for field in GameInfo.model_fields:
        assert field in data
    assert isinstance(data["id"], int) and data["id"]
    assert isinstance(data["name"], str) and data["name"]

def test_get_games_success(test_app_populated_db):
    client = TestClient(test_app_populated_db)
    response = client.get("/api/games")
    assert response.status_code == 200
    games = response.json()
    assert isinstance(games, list)
    if games:
        for field in GameInfo.model_fields:
            assert field in games[0]

def test_game_of_the_day_not_found(test_app_empty_db):
    client = TestClient(test_app_empty_db)
    response = client.get("/api/game_of_the_day")
    assert response.status_code == 404
    assert response.json()["detail"] == "No games found"

def test_cors_headers(test_app_populated_db):
    client = TestClient(test_app_populated_db)
    response = client.options(
        "/api/game_of_the_day",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "GET" in response.headers.get("access-control-allow-methods", "")

def test_game_of_the_day_rate_limit(test_app_populated_db):
    client = TestClient(test_app_populated_db)
    test_app_populated_db.state.limiter.reset()
    for _ in range(10):
        response = client.get("/api/game_of_the_day")
        assert response.status_code in (200, 404)
    response = client.get("/api/game_of_the_day")
    assert response.status_code == 429
    assert "rate limit" in response.text.lower()
