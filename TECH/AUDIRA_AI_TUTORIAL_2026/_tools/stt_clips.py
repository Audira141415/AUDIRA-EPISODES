"""Whisper-check suspicious clips. Usage: python _tools/stt_clips.py ep01:l02,l03 ep02:l03 ..."""
import os, sys, json
os.environ["HF_HOME"] = "F:/hf-cache"
from faster_whisper import WhisperModel
m = WhisperModel("base", device="cpu", compute_type="int8", download_root="F:/hf-cache")
for arg in sys.argv[1:]:
    ep, ids = arg.split(":")
    for i in ids.split(","):
        p = f"studio/public/audio/{ep}/clips/{i}.wav"
        seg, _ = m.transcribe(p, language="id", beam_size=1)
        print(ep, i, "|", " ".join(s.text.strip() for s in seg), flush=True)
