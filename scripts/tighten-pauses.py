"""Shortens long pauses inside Cartesia clips and shifts their word timestamps to match.

Usage: python scripts/tighten-pauses.py <vo-meta.json> [max_gap_s]
Gaps between words longer than max_gap (default 0.5 s) are cut down to it; leading
silence is cut to 0.05 s and the tail to 0.15 s after the last word. Rewrites the WAVs in place.
"""
import json
import sys
import wave
from pathlib import Path

meta_path = Path(sys.argv[1])
MAX_GAP = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
LEAD, TAIL = 0.05, 0.15
meta = json.loads(meta_path.read_text(encoding="utf8"))
total = 0.0
for vid, v in meta["voices"].items():
    with wave.open(v["path"], "rb") as r:
        rate = r.getframerate()
        pcm = r.readframes(r.getnframes())
    words = v["words"]
    # Keep spans: [cut_from, cut_to) removed from the clip
    cuts = []
    if words[0]["start"] > LEAD:
        cuts.append((0.0, words[0]["start"] - LEAD))
    for a, b in zip(words, words[1:]):
        gap = b["start"] - a["end"]
        if gap > MAX_GAP:
            mid = a["end"] + MAX_GAP / 2
            cuts.append((mid, mid + gap - MAX_GAP))
    end = min(v["duration_s"], words[-1]["end"] + TAIL)
    cuts.append((end, v["duration_s"]))
    shift = lambda t: t - sum(min(max(t - c0, 0), c1 - c0) for c0, c1 in cuts)
    out = bytearray()
    pos = 0.0
    for c0, c1 in cuts:
        out += pcm[int(pos * rate) * 2 : int(c0 * rate) * 2]
        pos = c1
    for w in words:
        w["start"], w["end"] = round(shift(w["start"]), 3), round(shift(w["end"]), 3)
    with wave.open(v["path"], "wb") as o:
        o.setnchannels(1)
        o.setsampwidth(2)
        o.setframerate(rate)
        o.writeframes(bytes(out))
    v["duration_s"] = round(len(out) / 2 / rate, 3)
    total += v["duration_s"]
    print(f"{vid}: {v['duration_s']:.2f}s")
meta["total_duration_s"] = round(total, 3)
meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf8")
print(f"total {total:.2f}s")
