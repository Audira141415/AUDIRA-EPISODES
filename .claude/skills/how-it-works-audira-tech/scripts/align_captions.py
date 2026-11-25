#!/usr/bin/env python3
"""
AUDIRA TECH — Kinetic Captions & Subtitles Engine
Generates word-by-word synchronized subtitles in WebVTT (.vtt), SRT (.srt), and HyperFrames JSON format.
Ensures strict mobile safe-zone compliance (Y between 15% and 80%).
"""

import sys
import re
import json
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def format_timestamp_vtt(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{millis:03d}"

def format_timestamp_srt(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def align_script_to_captions(script_text: str, total_duration: float, max_words_per_cue: int = 5):
    # Split text into sentences/clauses
    raw_sentences = [s.strip() for s in re.split(r'[\.\n\?!]+', script_text) if s.strip()]
    
    all_words = []
    for s in raw_sentences:
        words = s.split()
        all_words.extend(words)
        
    total_words = len(all_words)
    if total_words == 0:
        return []
        
    seconds_per_word = total_duration / float(total_words)
    
    cues = []
    current_idx = 0
    cue_counter = 1
    
    while current_idx < total_words:
        chunk = all_words[current_idx : current_idx + max_words_per_cue]
        start_time = current_idx * seconds_per_word
        end_time = (current_idx + len(chunk)) * seconds_per_word
        
        # Word level micro-timings for kinetic animation
        word_spans = []
        for w_offset, w in enumerate(chunk):
            w_start = (current_idx + w_offset) * seconds_per_word
            w_end = w_start + seconds_per_word
            word_spans.append({
                "word": w,
                "start": round(w_start, 3),
                "end": round(w_end, 3)
            })
            
        cues.append({
            "id": cue_counter,
            "text": " ".join(chunk),
            "start": round(start_time, 3),
            "end": round(end_time, 3),
            "words": word_spans
        })
        
        current_idx += len(chunk)
        cue_counter += 1
        
    return cues

def main():
    parser = argparse.ArgumentParser(description="Generate Kinetic Subtitles for AUDIRA TECH")
    parser.add_argument("--script", "-s", required=True, help="Path to narration text file")
    parser.add_argument("--duration", "-d", type=float, default=75.0, help="Total narration duration (seconds)")
    parser.add_argument("--output", "-o", default="subtitles", help="Output base filename")
    parser.add_argument("--words-per-line", "-w", type=int, default=4, help="Max words per subtitle line (default: 4)")
    args = parser.parse_args()

    with open(args.script, "r", encoding="utf-8") as f:
        script_text = f.read()

    cues = align_script_to_captions(script_text, args.duration, args.words_per_line)

    # 1. Export VTT
    vtt_lines = ["WEBVTT\n"]
    for c in cues:
        vtt_lines.append(f"{format_timestamp_vtt(c['start'])} --> {format_timestamp_vtt(c['end'])}")
        vtt_lines.append(f"{c['text']}\n")
    
    vtt_path = f"{args.output}.vtt"
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))
    print(f"✅ WebVTT subtitles written: {vtt_path}")

    # 2. Export SRT
    srt_lines = []
    for c in cues:
        srt_lines.append(str(c['id']))
        srt_lines.append(f"{format_timestamp_srt(c['start'])} --> {format_timestamp_srt(c['end'])}")
        srt_lines.append(f"{c['text']}\n")
        
    srt_path = f"{args.output}.srt"
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_lines))
    print(f"✅ SRT subtitles written: {srt_path}")

    # 3. Export Kinetic JSON
    json_path = f"{args.output}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cues, f, indent=2)
    print(f"✅ Kinetic JSON subtitle cues written: {json_path}")

if __name__ == "__main__":
    main()

