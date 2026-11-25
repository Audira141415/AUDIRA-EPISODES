"""Estimated timeline.json for one episode (no voice yet). Same model as estimate.py but scoped to one folder, so it never touches finished episodes.
Run from AUDIRA_IJAZAH_2026: python _tools/estimate1.py EP05_RANTAI_FOTO"""
import json, re, sys
from pathlib import Path
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")
SYL, LEAD, GAP, HOLD = 0.163, 0.1, 0.16, 3.0
syl = lambda w: max(1, len(re.findall(r"[aiueoAIUEO]+", w)))
d = Path(sys.argv[1])
lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
t, scenes, words, spoken = LEAD, [], [], 0
for l in lines:
    start = t
    for a, b, c in TOK.findall(l["text"]):
        disp, sp = (a.split(), b.split()) if b else ([c], [c])
        spoken += len(sp)
        dur = sum(syl(x) for x in sp) * SYL
        total = sum(len(x) for x in disp)
        pos = t
        for x in disp:
            e = pos + dur * len(x) / total
            words.append({"text": x, "start": round(pos, 3), "end": round(e, 3), "scene": l["id"]})
            pos = e
        t += dur
        last = sp[-1][-1]
        t += .3 if last in ".?!:" else .14 if last == "," else .025
    scenes.append({"id": l["id"], "start": round(start, 3), "end": round(t, 3)})
    t += GAP
speech = round(t - GAP, 3)
(d / "timeline.json").write_text(json.dumps({"duration": round(speech + HOLD, 2), "speech_end": speech, "estimated": True, "scenes": scenes, "words": words}, ensure_ascii=False, indent=0), encoding="utf8")
print(d.name, "speech", speech, "film", round(speech + HOLD, 2), "spoken", spoken, "wpm", round(spoken / speech * 60))
