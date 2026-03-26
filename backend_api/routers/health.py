from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import get_db

router = APIRouter()

APP_VERSION = "1.0.0"


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for load balancers and container orchestrators.

    Returns:
        - status: "ok" if everything is healthy
        - db: "connected" if database query succeeds, "error" otherwise
        - version: application version string
        - timestamp: current UTC timestamp
    """
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "db": db_status,
        "version": APP_VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
