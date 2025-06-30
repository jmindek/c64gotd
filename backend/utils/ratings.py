# utils/ratings.py - Ratings table setup utility for app startup
from db import GameDB, get_game_db
from fastapi import Depends

def setup_ratings(db: GameDB = Depends(get_game_db)):
    db.ensure_ratings_table_exists()
    db.populate_with_ratings_data()
