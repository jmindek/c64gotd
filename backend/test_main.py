from fastapi.testclient import TestClient
from main import app
from models import GameInfo

def test_game_of_the_day_success():
    client = TestClient(app)
    response = client.get("/game_of_the_day")
    assert response.status_code == 200
    data = response.json()
    # Check that all required fields are present
    for field in GameInfo.model_fields:
        assert field in data
    # Check some expected values (id and name must be non-empty strings)
    assert isinstance(data["id"], str) and data["id"]
    assert isinstance(data["name"], str) and data["name"]

def test_game_of_the_day_not_found(monkeypatch):
    # Patch GameDB.get_game_of_the_day to raise ValueError
    from main import game_db
    def raise_value_error():
        raise ValueError("No games found")
    monkeypatch.setattr(game_db, "get_game_of_the_day", raise_value_error)
    client = TestClient(app)
    response = client.get("/game_of_the_day")
    assert response.status_code == 404
    assert response.json()["detail"] == "No games found"

def test_cors_headers():
    client = TestClient(app)
    # Simulate a browser preflight request
    response = client.options(
        "/game_of_the_day",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert "GET" in response.headers.get("access-control-allow-methods", "")
