# backend/services/gec_engine.py
import os
import re
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

class GecEngine:
    def __init__(self):
        self.model_name = os.getenv("MODEL_NAME", "vennify/t5-base-grammar-correction")
        requested_device = os.getenv("DEVICE", "cpu")
        self.device = "cuda" if requested_device == "cuda" and torch.cuda.is_available() else "cpu"
        
        print(f"[*] Loading GEC model '{self.model_name}' on {self.device}...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name).to(self.device)
        self.model.eval()
        print("[+] Model loaded successfully.")

    def correct_single_sentence(self, sentence: str) -> str:
        clean_text = sentence.strip()
        if not clean_text:
            return ""

        # Format prefix for grammar-correction fine-tuned models
        prompt = f"grammar: {clean_text}"
        
        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            max_length=256,
            truncation=True
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=256,
                num_beams=4,
                early_stopping=True
            )

        corrected = self.tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        return corrected

    def correct_text(self, text: str) -> str:
        paragraphs = text.split("\n")
        corrected_paragraphs = []

        for para in paragraphs:
            if not para.strip():
                corrected_paragraphs.append("")
                continue

            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', para) if s.strip()]
            corrected_sentences = [self.correct_single_sentence(s) for s in sentences]
            corrected_paragraphs.append(" ".join(corrected_sentences))

        return "\n".join(corrected_paragraphs)

# Singleton instance
gec_engine = GecEngine()