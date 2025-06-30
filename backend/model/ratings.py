# model.py - Ratings table definition and CRUD operations
from db import get_db_connection
from db import GameDB
from pydantic import BaseModel

class UserRating(BaseModel):
    game_id: int
    rating: int
    user_id: str

class AverageRating(BaseModel):
    game_id: int
    rating: int


def get_rating(game_id: int, user_id: str, db: GameDB) -> int:
    """Get a user's rating for a game. Requires a GameDB instance."""
    db.ensure_ratings_table_exists()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT rating FROM ratings WHERE game_id=? AND user_id=?", (game_id, user_id))
    row = cur.fetchone()
    conn.close()
    return row[0] if row else 0

def set_rating(game_id: int, user_id: str, rating: int, db: GameDB) -> None:
    """Set a user's rating for a game. Requires a GameDB instance."""
    db.ensure_ratings_table_exists()
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO ratings (game_id, user_id, rating) VALUES (?, ?, ?) "
            "ON CONFLICT(game_id, user_id) DO UPDATE SET rating=excluded.rating",
            (game_id, user_id, rating)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def get_average_rating(game_id: int, db: GameDB) -> float:
    """Get the average rating for a game. Requires a GameDB instance."""
    db.ensure_ratings_table_exists()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT AVG(rating) FROM ratings WHERE game_id=?", (game_id,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row and row[0] is not None else 0.0
