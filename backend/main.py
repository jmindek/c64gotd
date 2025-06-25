from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from db import GameDB
from models import GameInfo
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

game_db = GameDB()

@app.get("/health")
def health():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/game_of_the_day", response_model=GameInfo)
@limiter.limit("10/minute")
def get_game_of_the_day(request: Request):
    try:
        return game_db.get_game_of_the_day()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
