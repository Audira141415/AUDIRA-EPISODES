"""SUBTITLES.srt per episode from timeline.json word times (chunks of <=42 chars, break at punctuation).
Usage (from BATCH02): python _tools/write_srt.py ep042 [...]"""
import sys, json, glob
def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
for ep in sys.argv[1:]:
    d = glob.glob(f"EP{ep[2:]}-*")[0]
    tl = json.load(open(f"studio/src/scenes/{ep}/timeline.json", encoding="utf-8"))
    cues = []
    for c in tl["clips"]:
        cur = []
        ws = c["words"]
        for k, w in enumerate(ws):
            cur.append(w)
            if 0 < len(ws) - k - 1 <= 2: continue  # never leave a 1-2 word orphan at the end of a sentence
            text = " ".join(x["w"] for x in cur)
            if len(text) >= 34 or w["w"][-1] in ".,?!:;" and len(text) > 18 or w is c["words"][-1]:
                cues.append((cur[0]["s"], max(cur[-1]["e"], cur[0]["s"] + 0.8), text)); cur = []
    out = []
    for i, (a, b, t) in enumerate(cues, 1):
        nxt = cues[i][0] if i < len(cues) else b
        out += [str(i), f"{ts(a)} --> {ts(min(b + 0.15, nxt - 0.02))}", t, ""]
    open(f"{d}/SUBTITLES.srt", "w", encoding="utf-8").write("\n".join(out))
    print(d, len(cues), "cues")
