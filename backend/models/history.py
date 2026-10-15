# backend/models/history.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50), nullable=False)  # "correction" or "document_review"
    title = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    char_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    confidence_score = Column(Float, default=1.0)
    
    categories = Column(JSON, default=list)  # Stored as JSON array
    status = Column(String(50), default="completed")