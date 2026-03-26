import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Fallback to SQLite if DATABASE_URL is not provided
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./engineering_platform.db")

# SQLite requires specific args for threading, PostgreSQL does not
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
