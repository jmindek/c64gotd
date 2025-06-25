from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import GameDB
from models import GameInfo

app = FastAPI()

game_db = GameDB()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/game_of_the_day", response_model=GameInfo)
def get_game_of_the_day():
    try:
        return game_db.get_game_of_the_day()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
