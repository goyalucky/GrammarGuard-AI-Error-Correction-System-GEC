# backend/services/diff_analyzer.py
import difflib
import re
from typing import List, Tuple
from models.schemas import ErrorDetail

class DiffAnalyzer:
    @staticmethod
    def _categorize(orig_word: str, corr_word: str) -> Tuple[str, str]:
        orig_clean = orig_word.strip().lower()
        corr_clean = corr_word.strip().lower()

        # Punctuation check
        if re.sub(r'\w+', '', orig_word) != re.sub(r'\w+', '', corr_word) and orig_clean == corr_clean:
            return "Punctuation", "Corrected punctuation usage."

        # Common auxiliary / SVA markers
        sva_markers = {"don't": "doesn't", "dont": "doesn't", "is": "are", "are": "is", "was": "were"}
        if orig_clean in sva_markers and sva_markers[orig_clean] == corr_clean:
            return "Subject-Verb Agreement", f"Changed '{orig_word}' to '{corr_word}' for grammatical agreement."

        # Past tense / verb forms
        tense_pairs = {
            "send": "sent", "go": "went", "come": "came", 
            "make": "made", "take": "took", "know": "knew"
        }
        if orig_clean in tense_pairs and tense_pairs[orig_clean] == corr_clean:
            return "Verb Tense", f"Adjusted verb tense from '{orig_word}' to '{corr_word}'."

        # Default classification
        return "Grammar & Phrasing", f"Refined '{orig_word}' to '{corr_word}' for correct usage."

    @classmethod
    def extract_errors(cls, original_text: str, corrected_text: str) -> List[ErrorDetail]:
        orig_words = original_text.split()
        corr_words = corrected_text.split()
        
        matcher = difflib.SequenceMatcher(None, orig_words, corr_words)
        errors: List[ErrorDetail] = []
        
        current_idx = 0
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            orig_segment = " ".join(orig_words[i1:i2])
            corr_segment = " ".join(corr_words[j1:j2])
            
            # Find char position in original text
            start_char = original_text.find(orig_segment, current_idx) if orig_segment else current_idx
            end_char = start_char + len(orig_segment) if orig_segment else start_char
            if orig_segment:
                current_idx = end_char

            if tag in ("replace", "delete"):
                category, explanation = cls._categorize(orig_segment, corr_segment)
                errors.append(
                    ErrorDetail(
                        original_span=orig_segment,
                        corrected_span=corr_segment if corr_segment else "[Removed]",
                        start_idx=start_char,
                        end_idx=end_char,
                        category=category,
                        explanation=explanation
                    )
                )
            elif tag == "insert":
                errors.append(
                    ErrorDetail(
                        original_span="",
                        corrected_span=corr_segment,
                        start_idx=start_char,
                        end_idx=start_char,
                        category="Missing Element",
                        explanation=f"Inserted missing token '{corr_segment}'."
                    )
                )

        return errors