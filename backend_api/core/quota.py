from datetime import datetime

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from core.plans import get_plan_config
from database import get_db
from models.calculation import Calculation
from models.project import Project
from models.user import User


def check_quota(action: str):
    def quota_dependency(
        current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
    ):
        return current_user  # TEST MODE: quota bypass — remove for production
        # --- original quota logic below ---
        plan_config = get_plan_config(current_user.plan)

        if action == "run_simulation":
            max_sims = plan_config.get("max_simulations_per_month", 5)
            if max_sims == -1:
                return current_user  # Unlimited

            now = datetime.utcnow()
            start_of_month = datetime(now.year, now.month, 1)

            # Count calculations for user's projects this month
            sims_count = (
                db.query(Calculation)
                .join(Project)
                .filter(
                    Project.user_id == current_user.id, Calculation.created_at >= start_of_month
                )
                .count()
            )

            if sims_count >= max_sims:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Limite de {max_sims} simulações mensais atingido no plano {current_user.plan.capitalize()}.",
                )

        elif action.startswith("generate_pdf_"):
            pdf_type = action.split("generate_pdf_")[1]
            allowed_pdfs = plan_config.get("allowed_pdfs", ["memorial"])
            if pdf_type not in allowed_pdfs:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"O documento '{pdf_type}' não está disponível no plano {current_user.plan.capitalize()}.",
                )

        return current_user

    return quota_dependency
