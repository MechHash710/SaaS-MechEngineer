"""
Seed script to create a test user for E2E tests.
Run: python seed_test_user.py
"""

import os
import sys

# Run from backend_api directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.security import get_password_hash
from database import engine, get_db
from models.base import Base
from models.user import User


def seed_test_user():
    Base.metadata.create_all(bind=engine)

    db = next(get_db())
    try:
        test_email = "engenheiro@teste.com"
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            print(f"✅ Test user already exists: {test_email}")
            return

        test_user = User(
            email=test_email,
            name="Engenheiro Teste",
            hashed_password=get_password_hash("senha123!"),
            plan="pro",
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"✅ Created test user: {test_email} / senha123!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_test_user()
