"""Caption sync QA: whisper word times on vo.wav vs timeline.json word starts. Usage: python _tools/sync_check.py ep036 [...]"""
import sys, json, re, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel(r"F:/AUDIRA-CLIP-AI/ai-engine/models/models--Systran--faster-whisper-large-v3/snapshots/edaa852ec7e145841d8ffdb056a99866b5f0a478", device="cuda", compute_type="float16")
norm = lambda w: re.sub(r"[^\w]", "", w.lower())
for ep in sys.argv[1:]:
    tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    tw = [(norm(w["w"]), w["s"]) for c in tl["clips"] for w in c["words"]]
    segs, _ = m.transcribe(f"studio/public/audio/{ep}/vo.wav", language="id", word_timestamps=True, beam_size=5)
    ww = [(norm(w.word), w.start) for s in segs for w in s.words]
    j = 0; d = []
    for w, s in tw:
        for k in range(j, min(j + 6, len(ww))):
            if ww[k][0] == w and w: d.append(s - ww[k][1]); j = k + 1; break
    d = np.array(d); ok = (np.abs(d) <= 0.25).mean() * 100
    print(f"{ep}: matched {len(d)}/{len(tw)} words, median offset {np.median(d):+.3f}s (caption minus audio), |off|<=0.25s: {ok:.0f}%, p90 {np.percentile(np.abs(d),90):.2f}s")
