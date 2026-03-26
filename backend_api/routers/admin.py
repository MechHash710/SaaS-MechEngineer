from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.dependencies import require_role
from database import get_db
from models.calculation import Calculation
from models.document import Document
from models.user import User

router = APIRouter(dependencies=[Depends(require_role("admin"))])


class PlanUpdateRequest(BaseModel):
    plan: str


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()

    # MRR (Mock calculation based on current plans)
    pro_users = db.query(User).filter(User.plan == "pro").count()
    enterprise_users = db.query(User).filter(User.plan == "enterprise").count()
    mrr = (pro_users * 97) + (enterprise_users * 297)

    # Sims by day (last 30 days mock data or real)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    total_sims_30d = db.query(Calculation).filter(Calculation.created_at >= thirty_days_ago).count()
    sims_per_day = round(total_sims_30d / 30.0, 1) if total_sims_30d > 0 else 0

    total_pdfs = db.query(Document).count()

    # Graph data (last 7 days for simplicity)
    graph_data = []
    for i in range(7, 0, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(Calculation)
            .filter(Calculation.created_at >= day_start, Calculation.created_at < day_end)
            .count()
        )
        graph_data.append({"date": day_start.strftime("%d/%m"), "simulations": count})

    return {
        "total_users": total_users,
        "mrr": mrr,
        "sims_per_day": sims_per_day,
        "total_pdfs": total_pdfs,
        "graph_data": graph_data,
    }


@router.get("/users")
def get_admin_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()
    user_list = []
    for u in users:
        sims_count = db.query(Calculation).filter(Calculation.project.has(user_id=u.id)).count()
        user_list.append(
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "plan": u.plan,
                "created_at": u.created_at,
                "simulations": sims_count,
            }
        )
    return {"data": user_list, "total": db.query(User).count()}


@router.patch("/users/{user_id}/plan")
def update_user_plan(user_id: str, request: PlanUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.plan = request.plan
    if request.plan != "free":
        user.plan_expires_at = datetime.utcnow() + timedelta(days=30)
    else:
        user.plan_expires_at = None

    db.commit()
    return {"message": "Plan updated successfully", "plan": user.plan}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
