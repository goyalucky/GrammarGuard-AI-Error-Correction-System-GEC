# backend/scripts/evaluate_gec.py
import os
import sys
import re

# Ensure the backend root directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from typing import List, Dict, Any
from tabulate import tabulate
import nltk
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.translate.gleu_score import sentence_gleu

# Ensure required tokenizers are available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

from agents.workflow import gec_app
from services.diff_analyzer import DiffAnalyzer

# Standard benchmark evaluation pairs representing common real-world ESL error patterns
BENCHMARK_DATASET = [
    {
        "id": "BM-01",
        "category": "Subject-Verb Agreement",
        "source": "He don't know the answer to this question.",
        "target": "He doesn't know the answer to this question."
    },
    {
        "id": "BM-02",
        "category": "Verb Tense",
        "source": "She go to the library yesterday and buyed three books.",
        "target": "She went to the library yesterday and bought three books."
    },
    {
        "id": "BM-03",
        "category": "Articles",
        "source": "I bought an book and a apple.",
        "target": "I bought a book and an apple."
    },
    {
        "id": "BM-04",
        "category": "Word Order / Concord",
        "source": "There is many people in the room.",
        "target": "There are many people in the room."
    },
    {
        "id": "BM-05",
        "category": "Prepositions",
        "source": "He arrived to the station on time.",
        "target": "He arrived at the station on time."
    },
    {
        "id": "BM-06",
        "category": "Punctuation & Capitalization",
        "source": "where are you going",
        "target": "Where are you going?"
    }
]

def tokenize(text: str) -> List[str]:
    return [w.lower() for w in re.findall(r'\b\w+\b|[^\w\s]', text)]

def calculate_f05(precision: float, recall: float) -> float:
    beta_sq = 0.5 ** 2  # 0.25
    if precision + recall == 0:
        return 0.0
    return (1 + beta_sq) * (precision * recall) / ((beta_sq * precision) + recall)

def run_benchmark():
    print("\n=======================================================")
    print("  GrammarGuard AI: Multi-Agent Model Evaluation Suite  ")
    print("=======================================================\n")
    
    results = []
    total_gleu = 0.0
    total_bleu = 0.0
    smooth = SmoothingFunction().method1

    tp_total = 0
    fp_total = 0
    fn_total = 0

    for item in BENCHMARK_DATASET:
        initial_state = {
            "original_text": item["source"],
            "current_text": item["source"],
            "context_type": "general",
            "iteration_count": 0,
            "max_retries": 2,
            "detected_errors": [],
            "verification_passed": False,
            "verification_reason": "",
            "needs_retry": False,
            "status": "initialized"
        }

        # Run through the agent workflow
        final_state = gec_app.invoke(initial_state)
        prediction = final_state["current_text"]

        ref_tokens = [tokenize(item["target"])]
        pred_tokens = tokenize(prediction)

        # 1. GLEU Score
        gleu = sentence_gleu(ref_tokens, pred_tokens)
        total_gleu += gleu

        # 2. BLEU Score
        bleu = sentence_bleu(ref_tokens, pred_tokens, smoothing_function=smooth)
        total_bleu += bleu

        # 3. Exact String Match
        exact_match = 1 if prediction.strip().lower() == item["target"].strip().lower() else 0

        # Span alignment proxy for Precision/Recall
        pred_diffs = DiffAnalyzer.extract_errors(item["source"], prediction)
        gold_diffs = DiffAnalyzer.extract_errors(item["source"], item["target"])

        gold_spans = {(d.original_span.lower(), d.corrected_span.lower()) for d in gold_diffs}
        pred_spans = {(d.original_span.lower(), d.corrected_span.lower()) for d in pred_diffs}

        tp = len(pred_spans.intersection(gold_spans))
        fp = len(pred_spans - gold_spans)
        fn = len(gold_spans - pred_spans)

        tp_total += tp
        fp_total += fp
        fn_total += fn

        results.append([
            item["id"],
            item["category"],
            item["source"][:25] + "...",
            prediction[:25] + "...",
            f"{gleu * 100:.1f}",
            f"{bleu * 100:.1f}",
            "PASSED" if exact_match else "DIFF"
        ])

    # Aggregate Metrics
    n = len(BENCHMARK_DATASET)
    mean_gleu = (total_gleu / n) * 100
    mean_bleu = (total_bleu / n) * 100

    precision = tp_total / (tp_total + fp_total) if (tp_total + fp_total) > 0 else 1.0
    recall = tp_total / (tp_total + fn_total) if (tp_total + fn_total) > 0 else 0.0
    f05 = calculate_f05(precision, recall) * 100

    # Print Itemized Table
    headers = ["ID", "Category", "Input", "Model Output", "GLEU", "BLEU", "Status"]
    print(tabulate(results, headers=headers, tablefmt="fancy_grid"))

    # Print Summary Metrics
    print("\n-------------------------------------------------------")
    print("                   AGGREGATE METRICS                   ")
    print("-------------------------------------------------------")
    print(f"  Mean GLEU Score        : {mean_gleu:.2f} / 100")
    print(f"  Mean BLEU Score        : {mean_bleu:.2f} / 100")
    print(f"  Span Precision         : {precision * 100:.2f}%")
    print(f"  Span Recall            : {recall * 100:.2f}%")
    print(f"  ERRANT F0.5 Benchmark  : {f05:.2f} / 100")
    print("-------------------------------------------------------\n")

if __name__ == "__main__":
    run_benchmark()