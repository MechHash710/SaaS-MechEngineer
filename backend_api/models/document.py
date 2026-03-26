import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from .base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    calculation_id = Column(String, ForeignKey("calculations.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # 'memorial', 'laudo', 'especificacao'
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    calculation = relationship("Calculation", back_populates="documents")
