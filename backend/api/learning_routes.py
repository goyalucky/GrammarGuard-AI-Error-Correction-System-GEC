# backend/api/learning_routes.py
import json
import os
from fastapi import APIRouter, HTTPException

learning_router = APIRouter(prefix="/api/v1/learning", tags=["Grammar Learning"])

RULES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "grammar_rules.json")

@learning_router.get("/topics")
def get_grammar_topics():
    if not os.path.exists(RULES_PATH):
        raise HTTPException(status_code=404, detail="Grammar rules knowledge base not found.")
    
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        rules = json.load(f)

    formatted_topics = []
    for r in rules:
        examples = r.get("examples", {}) if isinstance(r.get("examples"), dict) else {}
        incorrect = examples.get("incorrect") or r.get("incorrect_example", "")
        corrected = examples.get("correct") or r.get("corrected_example", "")

        formatted_topics.append({
            "id": str(r.get("id")),
            "category": r.get("category", "General"),
            "title": r.get("title") or r.get("rule_title", "Grammar Rule"),
            "explanation": r.get("description") or r.get("explanation", ""),
            "incorrectExample": incorrect,
            "correctedExample": corrected,
            "practiceTip": r.get("pedagogical_tip", ""),
            "tags": r.get("tags", [])
        })
    return formatted_topics

@learning_router.get("/quiz")
def get_quiz_questions():
    if not os.path.exists(RULES_PATH):
        raise HTTPException(status_code=404, detail="Grammar rules knowledge base not found.")
    
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        rules = json.load(f)

    quiz_questions = []
    for idx, r in enumerate(rules):
        examples = r.get("examples", {}) if isinstance(r.get("examples"), dict) else {}
        incorrect = examples.get("incorrect") or r.get("incorrect_example")
        correct = examples.get("correct") or r.get("corrected_example")
        
        if not incorrect or not correct:
            continue

        desc = r.get("description") or r.get("explanation", "")
        tip = r.get("pedagogical_tip", "")

        quiz_questions.append({
            "id": f"q-{idx + 1}",
            "topic": r.get("category", "Grammar Concept").replace("_", " ").title(),
            "question": "Which sentence is grammatically correct?",
            "choices": [
                incorrect,
                correct
            ],
            "correctIndex": 1,
            "explanation": f"{desc} {tip}".strip()
        })
    return quiz_questions