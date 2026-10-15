# backend/models/schemas.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ErrorDetail(BaseModel):
    original_span: str
    corrected_span: str
    start_idx: int
    end_idx: int
    category: str
    explanation: str
    # RAG enriched fields
    rule_title: Optional[str] = None
    pedagogical_tip: Optional[str] = None
    examples: Optional[Dict[str, Any]] = None

class CorrectionRequest(BaseModel):
    text: str
    context_type: Optional[str] = "general"

class CorrectionResponse(BaseModel):
    original_text: str
    corrected_text: str
    error_count: int
    categories: List[str]
    confidence_score: float
    verification_status: str
    errors: List[ErrorDetail]