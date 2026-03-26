import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from .base import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    rating = Column(Integer, nullable=False)  # 1–5 stars
    category = Column(String, nullable=False, default="sugestao")  # 'bug' | 'sugestao' | 'elogio'
    message = Column(Text, nullable=True)
    page = Column(String, nullable=True)  # which page/module the feedback is from
    created_at = Column(DateTime, default=datetime.utcnow)


class BetaInvite(Base):
    __tablename__ = "beta_invites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=True)
    engineering_type = Column(String, nullable=True)  # 'mecanica', 'civil', 'eletrica', etc.
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
