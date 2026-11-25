"""Estimated timeline for a silent draft when Cartesia voice is unavailable. Run from an episode folder. Marks the file estimated:true; vo.py build overwrites it with real timings."""
import json, re, sys
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")
lines = json.load(open("script-lines.json", encoding="utf8"))
WPS, LEAD, GAP, HOLD = 2.42, .1, .16, 3.0
t, words, scenes = LEAD, [], []
for i, l in enumerate(lines):
    start = t
    toks = []
    for a, b, c in TOK.findall(l["text"]):
        if b:
            sp = len(b.split())
            ds = a.split()
            for d in ds:
                toks.append((d, sp / len(ds)))
        else:
            toks.append((c, 1))
    for d, w in toks:
        syl = max(1, len(re.findall(r"[aiueoAIUEO]+", d)))
        dur = max(.14, .165 * max(syl, w * 2)) * 1.0
        words.append({"text": d, "start": round(t, 3), "end": round(t + dur, 3), "scene": l["id"]})
        t += dur + .012
        if d[-1] in ".?!:":
            t += .24
        elif d[-1] == ",":
            t += .12
    scenes.append({"id": l["id"], "start": round(start, 3), "end": round(t, 3)})
    t += GAP
speech = round(t - GAP, 3)
json.dump({"duration": round(speech + HOLD, 2), "speech_end": speech, "scenes": scenes, "words": words, "estimated": True}, open("timeline.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
print("estimated speech", speech, "words", len(words), "wpm", round(len(words) / speech * 60))
