from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.security import decode_token, get_password_hash
from database import get_db
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# TEST MODE: auth bypass enabled — remove for production
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Try token auth first
    if token:
        payload = decode_token(token)
        if payload:
            email: str = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
                if user:
                    return user

    # Fallback: return first user in DB for testing
    user = db.query(User).first()
    if user:
        return user

    # No users at all — create a test user on the fly
    test_user = User(
        email="test@dev.local",
        name="Dev Test",
        hashed_password=get_password_hash("devpass"),
        plan="pro",
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    return test_user


def require_role(role: str):
    def role_dependency(current_user: User = Depends(get_current_user)):
        # currently user plan represents roles in our simplified context
        # normally you would have a specific role field
        # We will mock admin access to users with Pro/Enterprise plans for now
        # You can expand this logic later
        if role == "admin" and current_user.plan == "Basic":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        return current_user

    return role_dependency
