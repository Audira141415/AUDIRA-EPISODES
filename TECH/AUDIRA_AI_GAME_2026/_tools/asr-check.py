"""Transcribes each VO_MASTER.wav from a locally cached Whisper model, to catch mispronounced words. Never downloads a model.
Run from AUDIRA_AI_GAME_2026: python _tools/asr-check.py"""
import io, sys
from pathlib import Path
from faster_whisper import WhisperModel

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8", errors="replace")
model = None
for size in ("large-v3", "medium", "small", "base", "tiny"):
    try:
        model = WhisperModel(size, device="cpu", compute_type="int8", local_files_only=True)
        print("model", size)
        break
    except Exception as e:
        print("no cached", size, str(e)[:60])
if model is None:
    sys.exit("no cached Whisper model")
for d in sorted(Path(".").glob("EP0*")):
    segs, _ = model.transcribe(str(d / "AUDIO" / "VO_MASTER.wav"), language="id", beam_size=1, vad_filter=True)
    print("==", d.name)
    print(" ".join(s.text.strip() for s in segs))
