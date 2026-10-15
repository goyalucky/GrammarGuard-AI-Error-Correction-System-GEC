# backend/services/document_processor.py
import re
from typing import List, Dict, Any
from agents.workflow import gec_app
from models.schemas import ErrorDetail

class DocumentProcessor:
    @staticmethod
    def split_into_sentences(text: str) -> List[str]:
        # Sentence boundary detection respecting periods, question marks, and exclamation marks
        sentence_endings = re.compile(r'(?<=[.!?])\s+')
        sentences = [s.strip() for s in sentence_endings.split(text) if s.strip()]
        return sentences if sentences else [text]

    @classmethod
    def process_document_text(cls, text: str, context_type: str = "general") -> Dict[str, Any]:
        sentences = cls.split_into_sentences(text)
        corrected_sentences = []
        all_errors: List[ErrorDetail] = []
        global_offset = 0

        for sentence in sentences:
            initial_state = {
                "original_text": sentence,
                "current_text": sentence,
                "context_type": context_type,
                "iteration_count": 0,
                "max_retries": 2,
                "detected_errors": [],
                "verification_passed": False,
                "verification_reason": "",
                "needs_retry": False,
                "status": "initialized"
            }

            final_state = gec_app.invoke(initial_state)
            corrected_sentence = final_state["current_text"]
            corrected_sentences.append(corrected_sentence)

            # Adjust character offsets to reflect positions in the full document
            for err in final_state["detected_errors"]:
                adjusted_err = ErrorDetail(
                    original_span=err.original_span,
                    corrected_span=err.corrected_span,
                    start_idx=err.start_idx + global_offset,
                    end_idx=err.end_idx + global_offset,
                    category=err.category,
                    explanation=err.explanation,
                    rule_title=err.rule_title,
                    pedagogical_tip=err.pedagogical_tip,
                    examples=err.examples
                )
                all_errors.append(adjusted_err)

            # Update offset (+1 for space between sentences)
            global_offset += len(sentence) + 1

        full_corrected_text = " ".join(corrected_sentences)
        categories = list({e.category for e in all_errors})

        return {
            "original_text": text,
            "corrected_text": full_corrected_text,
            "error_count": len(all_errors),
            "categories": categories,
            "errors": all_errors,
            "sentence_count": len(sentences)
        }

document_processor = DocumentProcessor()