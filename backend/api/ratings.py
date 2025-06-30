# api/ratings.py - Star Ratings Storage and Models
from fastapi import APIRouter, HTTPException
from model.ratings import get_average_rating, set_rating, get_rating, UserRating, AverageRating
from db import get_game_db, GameDB
from fastapi import Depends

router = APIRouter()

@router.get("/api/games/{game_id}/rating", response_model=UserRating)
def get_game_rating(game_id: int, user_id: str, db: GameDB = Depends(get_game_db)) -> UserRating:
    try:
        rating = get_rating(game_id, user_id, db)
    except Exception:
        rating = 0
    return UserRating(game_id=game_id, rating=rating, user_id=user_id)

@router.post("/api/games/{game_id}/rating", response_model=UserRating)
def set_game_rating(game_id: int, req: UserRating, db: GameDB = Depends(get_game_db)) -> UserRating:
    user_id = req.user_id
    rating = req.rating
    game_id = req.game_id
    try:
        if not user_id or user_id == 'unknown':
            raise ValueError("user_id must be provided and not 'unknown'")
        if not (0 <= rating <= 5):
            raise ValueError("Rating must be between 0 and 5")
        set_rating(game_id, user_id, rating, db)
        return UserRating(game_id=game_id, rating=rating, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/games/{game_id}/average_rating", response_model=AverageRating)
def get_average_game_rating(game_id: int, db: GameDB = Depends(get_game_db)) -> AverageRating:
    try:
        avg_rating = get_average_rating(game_id, db)
        avg_rating = round(avg_rating)
    except Exception:
        avg_rating = 0
    return AverageRating(game_id=game_id, rating=avg_rating)
