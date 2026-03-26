from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.feedback import BetaInvite, Feedback
from models.user import User

router = APIRouter()


# ─── Schemas ──────────────────────────────────────────────────────────────────


class FeedbackCreate(BaseModel):
    rating: int  # 1–5
    category: str = "sugestao"  # bug | sugestao | elogio
    message: str | None = None
    page: str | None = None


class FeedbackResponse(BaseModel):
    id: str
    rating: int
    category: str
    message: str | None
    page: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class BetaInviteCreate(BaseModel):
    email: EmailStr
    name: str
    company: str | None = None
    engineering_type: str | None = None
    message: str | None = None


class FeedbackStats(BaseModel):
    total: int
    avg_rating: float
    by_category: dict


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.post("/submit", response_model=FeedbackResponse)
def submit_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit in-app feedback with star rating and optional message."""
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    feedback = Feedback(
        user_id=current_user.id,
        rating=data.rating,
        category=data.category,
        message=data.message,
        page=data.page,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.post("/beta_invite")
def beta_invite(data: BetaInviteCreate, db: Session = Depends(get_db)):
    """Public endpoint to register interest in the closed beta."""
    existing = db.query(BetaInvite).filter(BetaInvite.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered for beta.")

    invite = BetaInvite(
        email=data.email,
        name=data.name,
        company=data.company,
        engineering_type=data.engineering_type,
        message=data.message,
    )
    db.add(invite)
    db.commit()
    return {"status": "success", "message": f"Obrigado, {data.name}! Você está na lista beta."}


@router.get("/admin/feedbacks", response_model=list[FeedbackResponse])
def list_feedbacks(
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: list all feedback submissions."""
    if current_user.plan != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return db.query(Feedback).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/admin/stats", response_model=FeedbackStats)
def feedback_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: aggregate feedback statistics."""
    if current_user.plan != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    total = db.query(func.count(Feedback.id)).scalar()
    avg = db.query(func.avg(Feedback.rating)).scalar() or 0.0

    rows = db.query(Feedback.category, func.count(Feedback.id)).group_by(Feedback.category).all()
    by_category = {row[0]: row[1] for row in rows}

    return FeedbackStats(total=total, avg_rating=round(float(avg), 2), by_category=by_category)


@router.get("/admin/beta_invites")
def list_beta_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: list all beta invite registrations."""
    if current_user.plan != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    invites = db.query(BetaInvite).order_by(BetaInvite.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "email": i.email,
            "name": i.name,
            "company": i.company,
            "engineering_type": i.engineering_type,
            "created_at": i.created_at,
        }
        for i in invites
    ]
