# backend/agents/nodes.py
from agents.state import AgentGraphState
from services.gec_engine import gec_engine
from services.diff_analyzer import DiffAnalyzer
from services.rag_service import rag_service
from models.schemas import ErrorDetail

def input_agent_node(state: AgentGraphState) -> AgentGraphState:
    cleaned = state["original_text"].strip()
    return {
        **state,
        "current_text": cleaned,
        "iteration_count": 0,
        "status": "input_processed"
    }

def analysis_agent_node(state: AgentGraphState) -> AgentGraphState:
    return {
        **state,
        "status": "analysis_completed"
    }

def correction_agent_node(state: AgentGraphState) -> AgentGraphState:
    current = state["current_text"]
    new_correction = gec_engine.correct_text(current)
    
    return {
        **state,
        "current_text": new_correction,
        "iteration_count": state["iteration_count"] + 1,
        "status": "correction_applied"
    }

def verification_agent_node(state: AgentGraphState) -> AgentGraphState:
    original = state["original_text"]
    current = state["current_text"]
    
    diff_errors = DiffAnalyzer.extract_errors(original, current)
    
    # RAG ENRICHMENT: Retrieve context-aware grammar rules from Qdrant
    enriched_errors = []
    for err in diff_errors:
        search_query = f"Error changing '{err.original_span}' to '{err.corrected_span}' in category {err.category}"
        matched_rule = rag_service.retrieve_rule(query=search_query)
        
        if matched_rule:
            enriched_err = ErrorDetail(
                original_span=err.original_span,
                corrected_span=err.corrected_span,
                start_idx=err.start_idx,
                end_idx=err.end_idx,
                category=err.category,
                explanation=matched_rule.get("description", err.explanation),
                rule_title=matched_rule.get("title"),
                pedagogical_tip=matched_rule.get("pedagogical_tip"),
                examples=matched_rule.get("examples")
            )
            enriched_errors.append(enriched_err)
        else:
            enriched_errors.append(err)

    # Residual verification check
    residual = gec_engine.correct_text(current)
    residual_errors = DiffAnalyzer.extract_errors(current, residual)
    
    has_remaining_issues = len(residual_errors) > 0
    can_retry = state["iteration_count"] < state["max_retries"]
    
    needs_retry = has_remaining_issues and can_retry
    verification_passed = not has_remaining_issues or not can_retry
    
    reason = "Verification passed" if not has_remaining_issues else (
        "Residual errors detected, scheduling retry" if can_retry else "Max retry limit reached, final output approved"
    )

    return {
        **state,
        "detected_errors": enriched_errors,
        "needs_retry": needs_retry,
        "verification_passed": verification_passed,
        "verification_reason": reason,
        "status": "verified"
    }

def feedback_agent_node(state: AgentGraphState) -> AgentGraphState:
    return {
        **state,
        "status": "completed"
    }