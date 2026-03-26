from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from database import get_db
from models.user import User

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str

    class Config:
        from_attributes = True


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenSchema)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            {"sub": user.email}, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token({"sub": user.email}),
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenSchema)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("sub") is None:
        raise HTTPException(status_code=400, detail="Invalid refresh token")

    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            {"sub": user.email}, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token({"sub": user.email}),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # Na arquitetura JWT state-less, logout real geralmente é feito apagando token no client
    # ou usando Redis para blacklist de tokens. Aqui faremos retorno de sucesso simples.
    return {"message": "Logout exitoso."}
