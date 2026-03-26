import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import Base


class Calculation(Base):
    __tablename__ = "calculations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # 'hvac' or 'solar'
    inputs_json = Column(JSON, nullable=False)
    results_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="calculations")
    documents = relationship("Document", back_populates="calculation", cascade="all, delete-orphan")
