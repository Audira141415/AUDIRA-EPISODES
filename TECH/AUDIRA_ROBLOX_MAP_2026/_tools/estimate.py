"""Builds an estimated timeline.json when the Cartesia voice is unavailable. Timing comes from syllables and punctuation, tuned to about 145 WPM.
vo.py build overwrites this file with real word times, and every scene, reveal and cue follows because they key to words.
Run from AUDIRA_ROBLOX_MAP_2026: python _tools/estimate.py"""
import json, re
from pathlib import Path

TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")
SYL, LEAD, GAP, HOLD = 0.163, 0.1, 0.16, 3.0
syl = lambda w: max(1, len(re.findall(r"[aiueoAIUEO]+", w)))
for d in sorted(Path(".").glob("EP0*")):
    lines = json.loads((d / "script-lines.json").read_text(encoding="utf8"))
    t, scenes, words, spoken = LEAD, [], [], 0
    for i, l in enumerate(lines):
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
