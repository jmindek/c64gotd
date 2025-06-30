"""
Main FastAPI application for C64 Game of the Day backend.
Handles API setup, middleware, dependency injection, and endpoints.
"""

# --- Standard library imports ---
from contextlib import asynccontextmanager

# --- Third-party imports ---
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter

# --- Local imports ---
from db import get_game_db
from api.ratings import router as ratings_router
from utils.ratings import setup_ratings
from api.games import router as games_router

# --- App and lifespan setup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup_event] Starting up...")
    db = get_game_db()
    db.populate_with_games_data()
    db.create_ratings_table()
    yield

app = FastAPI(lifespan=lifespan)

# --- Middleware, routers, and exception handlers ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(ratings_router)
app.include_router(games_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---
@app.get("/health")
def health():
    return {"status": "ok"}

