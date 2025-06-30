from pydantic import BaseModel

class GameInfo(BaseModel):
    id: int
    name: str
    d64Path: str
    thumbnailPath: str
    description: str
    year: int
    publisher: str
    genre: str
    players: str
