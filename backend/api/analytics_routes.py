# backend/api/analytics_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.analytics_service import analytics_service

analytics_router = APIRouter(prefix="/api/v1/analytics", tags=["Writing Analytics"])

@analytics_router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    return analytics_service.get_user_analytics(db)