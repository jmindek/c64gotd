# test_ratings.py - Edge case: cannot set rating <0 or >5
import os
import sqlite3
import pytest

from model.ratings import (
    get_rating, set_rating, get_average_rating, get_db_connection
)
from db import GameDB

TEST_DB_PATH = "test_ratings.sqlite3"

def setup_module(module):
    # Patch get_db for testing
    global get_db_connection
    def get_test_db():
        return sqlite3.connect(TEST_DB_PATH)
    import model.ratings as ratings_mod
    ratings_mod.get_db_connection = get_test_db
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    GameDB(TEST_DB_PATH).ensure_ratings_table_exists()

def teardown_module(module):
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)

def test_set_and_get_rating():
    db = GameDB(TEST_DB_PATH)
    set_rating(10, "alice", 4, db)
    set_rating(10, "bob", 5, db)
    assert get_rating(10, "alice", db) == 4
    assert get_rating(10, "bob", db) == 5
    assert get_rating(10, "charlie", db) == 0  # No rating yet

def test_get_average_rating():
    db = GameDB(TEST_DB_PATH)
    set_rating(11, "alice", 2, db)
    set_rating(11, "bob", 4, db)
    set_rating(11, "charlie", 3, db)
    avg = get_average_rating(11, db)
    assert abs(avg - 3.0) < 1e-6
    # Overwrite a rating and check average updates
    set_rating(11, "alice", 5, db)
    avg2 = get_average_rating(11, db)
    assert abs(avg2 - 4.0) < 1e-6

def test_set_rating_out_of_bounds():
    db = GameDB(TEST_DB_PATH)
    # Should raise sqlite3.IntegrityError for rating < 0
    with pytest.raises(sqlite3.IntegrityError):
        set_rating(1, "user1", -1, db)
    # Should raise sqlite3.IntegrityError for rating > 5
    with pytest.raises(sqlite3.IntegrityError):
        set_rating(1, "user1", 6, db)
    # No rating should be set
    assert get_rating(1, "user1", db) == 0

def test_overwrite_rating():
    db = GameDB(TEST_DB_PATH)
    # Set initial rating
    set_rating(2, "user1", 3, db)
    assert get_rating(2, "user1", db) == 3
    # Overwrite rating
    set_rating(2, "user1", 5, db)
    assert get_rating(2, "user1", db) == 5
    # Add another user and check average
    set_rating(2, "user2", 1, db)
    avg = get_average_rating(2, db)
    assert abs(avg - 3.0) < 1e-6
