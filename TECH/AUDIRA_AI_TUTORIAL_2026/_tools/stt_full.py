"""Whisper the whole vo.wav per episode and list script words whisper missed (rough listen check). Writes EPxx_*/qc/stt.txt."""
import os, re, json, glob, difflib
os.environ["HF_HOME"] = "F:/hf-cache"
from faster_whisper import WhisperModel
name = "small" if os.path.isdir("F:/hf-cache/models--Systran--faster-whisper-small") else "base"
m = WhisperModel(name, device="cpu", compute_type="int8", download_root="F:/hf-cache")
norm = lambda s: re.findall(r"[a-z0-9]+", s.lower())
for d in sorted(glob.glob("EP0*_*")):
    n = d[2:4]; seg, _ = m.transcribe(f"studio/public/audio/ep{n}/vo.wav", language="id", beam_size=3, vad_filter=True)
    heard = " ".join(s.text.strip() for s in seg)
    os.makedirs(f"{d}/qc", exist_ok=True); open(f"{d}/qc/stt.txt", "w", encoding="utf8").write(heard)
    ref = norm(" ".join(l["display"] for l in json.load(open(f"{d}/voiceover.json", encoding="utf8"))["lines"]))
    hyp = norm(heard); sm = difflib.SequenceMatcher(None, ref, hyp)
    miss = [" ".join(ref[a:b]) + " -> " + " ".join(hyp[c:e]) for op, a, b, c, e in sm.get_opcodes() if op != "equal"]
    print(f"== {d} ({name}) match {sm.ratio():.2f}; diffs:", " | ".join(miss)[:1500], flush=True)
