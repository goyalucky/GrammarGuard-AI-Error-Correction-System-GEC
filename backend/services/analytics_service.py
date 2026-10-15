# backend/services/analytics_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from models.history import ActivityLog

class AnalyticsService:
    @staticmethod
    def log_activity(
        db: Session,
        activity_type: str,
        title: str,
        text: str,
        error_count: int,
        confidence_score: float,
        categories: list
    ) -> ActivityLog:
        words = len(text.strip().split()) if text.strip() else 0
        chars = len(text)
        
        record = ActivityLog(
            activity_type=activity_type,
            title=title,
            char_count=chars,
            word_count=words,
            error_count=error_count,
            confidence_score=confidence_score,
            categories=categories,
            status="completed"
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_user_analytics(db: Session):
        total_sessions = db.query(ActivityLog).count()
        if total_sessions == 0:
            return {
                "total_sessions": 0,
                "total_words_processed": 0,
                "total_errors_detected": 0,
                "overall_accuracy_rate": 100.0,
                "category_breakdown": {},
                "recent_activities": []
            }

        total_words = db.query(func.sum(ActivityLog.word_count)).scalar() or 0
        total_errors = db.query(func.sum(ActivityLog.error_count)).scalar() or 0
        avg_confidence = db.query(func.avg(ActivityLog.confidence_score)).scalar() or 1.0

        # Calculate category frequency
        all_logs = db.query(ActivityLog).all()
        category_counter = Counter()
        for log in all_logs:
            if isinstance(log.categories, list):
                for cat in log.categories:
                    category_counter[cat] += 1

        # Fetch the 10 most recent activities
        recent = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(10).all()
        recent_list = [
            {
                "id": str(r.id),
                "title": r.title,
                "date": r.timestamp.strftime("%Y-%m-%d %H:%M"),
                "errorsDetected": r.error_count,
                "wordCount": r.word_count,
                "status": r.status,
                "type": r.activity_type
            }
            for r in recent
        ]

        return {
            "total_sessions": total_sessions,
            "total_words_processed": total_words,
            "total_errors_detected": total_errors,
            "overall_accuracy_rate": round(avg_confidence * 100, 1),
            "category_breakdown": dict(category_counter),
            "recent_activities": recent_list
        }

analytics_service = AnalyticsService()