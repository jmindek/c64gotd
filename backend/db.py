import sqlite3
from typing import List
from datetime import date
from model import GameInfo
from games_data import GAMES_DATA

DB_PATH = "games.db"

def get_game_db():
    return GameDB()

def get_db_connection(db_path=DB_PATH):
    try:
        return sqlite3.connect(db_path)
    except sqlite3.Error as e:
        print(f"Error connecting to db: {e}")
        return None

class GameDB:
    def __init__(self, db_path=None):
        self.db_path = db_path or DB_PATH
        print(f"[GameDB] Created with db_path={self.db_path}")
        self._init_db()

    def ensure_ratings_table_exists(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS ratings (
                game_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK(rating BETWEEN 0 AND 5),
                PRIMARY KEY (game_id, user_id)
            )
        ''')
        conn.commit()
        conn.close()

    def create_ratings_table(self):
        self.ensure_ratings_table_exists()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                d64Path TEXT NOT NULL,
                thumbnailPath TEXT NOT NULL,
                description TEXT NOT NULL,
                year INTEGER NOT NULL,
                publisher TEXT NOT NULL,
                genre TEXT NOT NULL,
                players TEXT NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

    def get_all_games(self) -> List[GameInfo]:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            c.execute('SELECT * FROM games ORDER BY id')
            games = c.fetchall()
            conn.close()
            fields = ["id", "name", "d64Path", "thumbnailPath", "description", "year", "publisher", "genre", "players"]
            return [GameInfo(**dict(zip(fields, game))) for game in games]

    def get_game_of_the_day(self) -> GameInfo:
        games = self.get_all_games()
        if not games:
            raise ValueError("No games found")
        idx = (date.today().toordinal()) % len(games)
        return games[idx]

    def populate_with_games_data(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('SELECT COUNT(*) FROM games')
        if c.fetchone()[0] == 0:
            for game in GAMES_DATA:
                c.execute('''
                    INSERT INTO games (id, name, d64Path, thumbnailPath, description, year, publisher, genre, players)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    game["id"], game["name"], game["d64Path"], game["thumbnailPath"],
                    game["description"], game["year"], game["publisher"], game["genre"], game["players"]
                ))
            conn.commit()
        conn.close()
