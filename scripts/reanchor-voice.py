"""Re-anchors a project after its voiceover is regenerated with another voice.

Usage (from F:/AUDIRA-VIDEO-MOTION): python scripts/reanchor-voice.py <project> <old-meta.json>

Scenes were authored on the old voice's clock (beat = OFF + old word start). For every
spoken word this writes an anchor [old beat, "word#n"] into voice-lock.json, so
scripts/voice-lock.py warps each scene from the old voice onto the new one. "old" (the
authored scene length) is kept from the old voice.
"""
import json
import sys
from pathlib import Path

OFF = 0.15
proj = Path(sys.argv[1])
old_meta = json.loads(Path(sys.argv[2]).read_text(encoding="utf8"))["voices"]
new_meta = json.loads((proj / "video/assets/audio/vo-meta.json").read_text(encoding="utf8"))["voices"]
cfg_path = proj / "voice-lock.json"
cfg = json.loads(cfg_path.read_text(encoding="utf8"))
n_scenes = len(cfg["scenes"])

for i, s in enumerate(cfg["scenes"]):
    old_w = old_meta[s["id"]]["words"]
    new_w = new_meta[s["id"]]["words"]
    assert [w["text"] for w in old_w] == [w["text"] for w in new_w], s["id"]
    new_dur = OFF + new_meta[s["id"]]["duration_s"] + 0.45 + (1.8 if i == n_scenes - 1 else 0)
    anchors = []
    last_a = last_b = 0.0
    for k, (ow, nw) in enumerate(zip(old_w, new_w)):
        # "word#n" counts prefix matches the same way voice-lock's find() does
        name = ow["text"]
        nth = sum(1 for w in old_w[: k + 1] if w["text"].lower().startswith(name.lower()))
        hits = [w for w in new_w if w["text"].lower().startswith(name.lower())]
        if hits[nth - 1] is not nw:
            continue
        a, b = round(OFF + ow["start"], 3), OFF + nw["start"]
        if a - last_a < 0.08 or b - last_b < 0.08 or a > s["old"] - 0.5 or b > new_dur - 0.5:
            continue
        anchors.append([a, f"{name}#{nth}"])
        last_a, last_b = a, b
    s["anchors"] = anchors
cfg_path.write_text(json.dumps(cfg, ensure_ascii=False, indent=1), encoding="utf8")
print(proj, [len(s["anchors"]) for s in cfg["scenes"]])
