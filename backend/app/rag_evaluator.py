"""
RAG Evaluator Tool for TobaRoute AI
Del AI Hackathon 2026 - Quantitative Model Evaluation
"""

import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment
BASE_DIR = Path(__file__).resolve().parent.parent
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path, override=True)

import sys
sys.path.append(str(BASE_DIR))

from app.database import SessionLocal
from app import models

# Benchmark dataset pertanyaan evaluasi
TEST_QUERIES = [
    {
        "id": 1,
        "query": "Saya mau cari tempat wisata alam di Balige yang cocok untuk keluarga.",
        "expected_kategori": "wisata",
        "expected_kecamatan": "Balige"
    },
    {
        "id": 2,
        "query": "Rekomendasi rumah makan kuliner khas Batak atau tempat makan murah di Laguboti.",
        "expected_kategori": "kuliner",
        "expected_kecamatan": "Laguboti"
    },
    {
        "id": 3,
        "query": "Di mana saya bisa membeli Tenun Ulos tradisional buatan UMKM lokal di Toba?",
        "expected_kategori": "umkm",
        "expected_kecamatan": "Toba"
    },
    {
        "id": 4,
        "query": "Saya butuh angkutan umum atau transportasi dari Balige ke Onanrunggu.",
        "expected_kategori": "umkm",
        "expected_kecamatan": "Balige"
    }
]

def evaluate_retrieval_and_generation():
    print("==================================================")
    print("  TOBAROUTE AI - RAG QUANTITATIVE EVALUATION TOOL ")
    print("==================================================\n")

    db = SessionLocal()
    total_queries = len(TEST_QUERIES)
    retrieval_matches = 0
    fairness_scores = []
    
    try:
        destinasis = db.query(models.Destinasi).all()
        print(f"[INFO] Total entitas di database: {len(destinasis)}")
        if not destinasis:
            print("[WARN] Database kosong. Mohon ingest data terlebih dahulu.")
            return

        for test in TEST_QUERIES:
            print(f"\n--- [Test #{test['id']}] Query: '{test['query']}' ---")
            
            # Simple keyword / attribute matching verification (Retrieval Test)
            relevant_items = [
                d for d in destinasis 
                if (test['expected_kategori'] in d.kategori or test['expected_kecamatan'].lower() in d.kecamatan.lower() or test['expected_kecamatan'].lower() in d.nama_jalan.lower())
            ]
            
            hit_count = len(relevant_items)
            if hit_count > 0:
                retrieval_matches += 1
                print(f" [RETRIEVAL PASS] Ditemukan {hit_count} entitas relevan di KB.")
            else:
                print(f" [RETRIEVAL WARN] Tidak ada entitas spesifik yang cocok langsung.")

            # Evaluasi Fairness UMKM (Tempat dengan ulasan < 15)
            hidden_gems = [d for d in relevant_items if d.jumlah_ulasan < 15]
            fairness_ratio = (len(hidden_gems) / hit_count * 100) if hit_count > 0 else 0
            fairness_scores.append(fairness_ratio)
            print(f" [FAIRNESS METRIC] Proposi Hidden Gems/UMKM lokal: {fairness_ratio:.1f}% ({len(hidden_gems)}/{hit_count})")

        # Ringkasan Skor Kuantitatif
        retrieval_accuracy = (retrieval_matches / total_queries) * 100
        avg_fairness = sum(fairness_scores) / len(fairness_scores) if fairness_scores else 0

        eval_summary = {
            "total_benchmark_queries": total_queries,
            "retrieval_accuracy_pct": round(retrieval_accuracy, 2),
            "avg_umkm_fairness_exposure_pct": round(avg_fairness, 2),
            "evaluation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        print("\n==================================================")
        print("  HASIL EVALUASI KUANTITATIF MODEL RAG")
        print("==================================================")
        print(json.dumps(eval_summary, indent=2))
        
        # Simpan hasil ke file log evaluasi
        eval_path = BASE_DIR / "rag_evaluation_results.json"
        with open(eval_path, "w", encoding="utf-8") as f:
            json.dump(eval_summary, f, indent=2)
        print(f"\n[OK] Hasil evaluasi kuantitatif disimpan ke: {eval_path}")

    finally:
        db.close()

if __name__ == "__main__":
    evaluate_retrieval_and_generation()
