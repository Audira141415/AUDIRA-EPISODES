"""Speeds every Cartesia clip up (or down) without changing pitch and scales its word timestamps.

Usage: python scripts/retime-voice.py <vo-meta.json> <tempo>
Rewrites the WAVs in place; run on a copy of clips-raw/ if you may want to undo it.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

meta_path = Path(sys.argv[1])
TEMPO = float(sys.argv[2])
meta = json.loads(meta_path.read_text(encoding="utf8"))
for vid, v in meta["voices"].items():
    src = Path(v["path"])
    tmp = src.with_suffix(".tmp.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", f"atempo={TEMPO}", "-ar", "44100", "-ac", "1", str(tmp)], check=True)
    tmp.replace(src)
    with wave.open(str(src), "rb") as r:
        v["duration_s"] = round(r.getnframes() / r.getframerate(), 3)
    for w in v["words"]:
        w["start"] = round(w["start"] / TEMPO, 3)
        w["end"] = round(w["end"] / TEMPO, 3)
    print(f"{vid}: {v['duration_s']}s")
meta["total_duration_s"] = round(sum(v["duration_s"] for v in meta["voices"].values()), 3)
meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf8")
print(f"total {meta['total_duration_s']}s")
