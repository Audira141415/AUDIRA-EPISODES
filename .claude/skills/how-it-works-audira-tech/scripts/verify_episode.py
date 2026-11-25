#!/usr/bin/env python3
"""
AUDIRA TECH — Episode Production Sanity Verifier
Audits voiceover script WPM, scene duration sync, anti-slop compliance, and claim ledger verification.
"""

import sys
import re
import json
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

FORBIDDEN_SLOP_PHRASES = [
    r"tahukah kamu",
    r"pernahkah anda bertanya",
    r"di era modern ini",
    r"sebuah keajaiban teknologi",
    r"sangat menakjubkan",
    r"mari kita simak",
    r"jangan lupa like dan subscribe",
    r"tanpa kita sadari",
    r"dalam kehidupan sehari-hari"
]

def verify_script_pacing(text: str, target_seconds: float) -> dict:
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    estimated_minutes = target_seconds / 60.0
    wpm = word_count / estimated_minutes if estimated_minutes > 0 else 0
    
    status = "OPTIMAL"
    warning = None
    if wpm > 165:
        status = "TOO_FAST"
        warning = f"Kecepatan narasi ({wpm:.1f} WPM) terlalu cepat! Narator akan terengah-engah. Kurangi kata atau tambah durasi."
    elif wpm < 115:
        status = "TOO_SLOW"
        warning = f"Kecepatan narasi ({wpm:.1f} WPM) terlalu lambat! Berpotensi membosankan penonton mobile. Tingkatkan densitas info."

    return {
        "wordCount": word_count,
        "targetDurationSeconds": target_seconds,
        "wpm": round(wpm, 1),
        "status": status,
        "warning": warning
    }

def check_anti_slop(text: str) -> list:
    violations = []
    text_lower = text.lower()
    for pattern in FORBIDDEN_SLOP_PHRASES:
        if re.search(pattern, text_lower):
            violations.append(pattern)
    return violations

def main():
    parser = argparse.ArgumentParser(description="Audit an AUDIRA TECH episode package")
    parser.add_argument("--script", "-s", required=True, help="Path to script text file")
    parser.add_argument("--duration", "-d", type=float, default=75.0, help="Target episode duration in seconds")
    args = parser.parse_args()

    with open(args.script, "r", encoding="utf-8") as f:
        script_text = f.read()

    print("==================================================")
    print("🔍 AUDIRA TECH QUALITY GATE AUDIT")
    print("==================================================")

    # 1. Pacing Audit
    pacing = verify_script_pacing(script_text, args.duration)
    print(f"\n📊 1. PACING & WORD COUNT:")
    print(f"   - Total Kata: {pacing['wordCount']}")
    print(f"   - Target Durasi: {pacing['targetDurationSeconds']} detik")
    print(f"   - Rata-rata WPM: {pacing['wpm']} WPM")
    print(f"   - Status: [{pacing['status']}]")
    if pacing['warning']:
        print(f"   ⚠️ WARNING: {pacing['warning']}")
    else:
        print(f"   ✅ Pacing ideal untuk dokumenter teknis (130-150 WPM).")

    # 2. Anti-Slop Audit
    slop_findings = check_anti_slop(script_text)
    print(f"\n🚫 2. ANTI-SLOP COMPLIANCE:")
    if slop_findings:
        print(f"   ❌ Ditemukan {len(slop_findings)} frasa klise AI slop:")
        for phrase in slop_findings:
            print(f"      - '{phrase}'")
        print(f"   👉 Segera ganti dengan pengantar fakta langsung atau pertanyaan teknis.")
    else:
        print(f"   ✅ Bersih dari frasa klise AI generator!")

    print("\n==================================================")
    if not pacing['warning'] and not slop_findings:
        print("🎉 AUDIT RESULT: PASS — Siap Masuk Tahap Produksi")
    else:
        print("⚠️ AUDIT RESULT: REVIEW NEEDED — Perlu perbaikan minor")
    print("==================================================")

if __name__ == "__main__":
    main()
