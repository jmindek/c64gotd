"""
Games API endpoints for C64 Game of the Day.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Request, Depends
from db import get_game_db, GameDB
from model.game_info import GameInfo
from utils.limiter import limiter

router = APIRouter()

@router.get("/api/game_of_the_day", response_model=GameInfo)
@limiter.limit("10/minute")
def get_game_of_the_day(request: Request, db: GameDB = Depends(get_game_db)):
    try:
        return db.get_game_of_the_day()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/games", response_model=List[GameInfo])
def get_games(request: Request, db: GameDB = Depends(get_game_db)):
    return db.get_all_games()
