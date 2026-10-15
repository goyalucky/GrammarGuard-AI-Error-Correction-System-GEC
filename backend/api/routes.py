# backend/api/routes.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import CorrectionRequest, CorrectionResponse
from agents.workflow import gec_app
from services.analytics_service import analytics_service

router = APIRouter(prefix="/api/v1", tags=["Grammar Correction"])

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "GrammarGuard Backend"}

@router.post("/correct", response_model=CorrectionResponse)
def correct_text_endpoint(payload: CorrectionRequest, db: Session = Depends(get_db)):
    try:
        raw_input = payload.text.strip()
        if not raw_input:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Input text cannot be empty.")

        # 1. Initialize multi-agent workflow state
        initial_state = {
            "original_text": raw_input,
            "current_text": raw_input,
            "context_type": payload.context_type or "general",
            "iteration_count": 0,
            "max_retries": 2,
            "detected_errors": [],
            "verification_passed": False,
            "verification_reason": "",
            "needs_retry": False,
            "status": "initialized"
        }

        # 2. Run the agentic state machine (Input -> Analysis -> Correction <-> Verification -> Feedback)
        final_state = gec_app.invoke(initial_state)

        detected_errors = final_state["detected_errors"]
        categories = list({err.category for err in detected_errors})
        
        # 3. Dynamic confidence scoring based on verification
        base_confidence = 0.98 if final_state["verification_passed"] else 0.88
        confidence = 1.0 if len(detected_errors) == 0 else base_confidence

        # 4. Persist correction session to SQLite
        title_snippet = raw_input[:35] + ("..." if len(raw_input) > 35 else "")
        analytics_service.log_activity(
            db=db,
            activity_type="correction",
            title=f"Sentence: \"{title_snippet}\"",
            text=raw_input,
            error_count=len(detected_errors),
            confidence_score=confidence,
            categories=categories
        )

        return CorrectionResponse(
            original_text=final_state["original_text"],
            corrected_text=final_state["current_text"],
            error_count=len(detected_errors),
            categories=categories,
            confidence_score=confidence,
            verification_status=f"{final_state['verification_reason']} (Passes: {final_state['iteration_count']})",
            errors=detected_errors
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))