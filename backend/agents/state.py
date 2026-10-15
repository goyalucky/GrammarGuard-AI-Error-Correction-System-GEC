from typing import TypedDict, List
from models.schemas import ErrorDetail

class AgentGraphState(TypedDict):
    original_text: str
    current_text: str
    context_type: str
    iteration_count: int
    max_retries: int
    detected_errors: List[ErrorDetail]
    verification_passed: bool
    verification_reason: str
    needs_retry: bool
    status: str