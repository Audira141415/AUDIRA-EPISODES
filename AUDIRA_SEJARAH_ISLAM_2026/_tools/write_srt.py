"""SUBTITLES.srt per episode from audio/timeline.json word times (cues <= ~42 chars, broken at punctuation,
no 1-2 word orphans). Usage (from the series folder): python _tools/write_srt.py EP01 [...]"""
import sys, json, glob

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

for ep in sys.argv[1:]:
    d = glob.glob(f"{ep}_*")[0]
    tl = json.load(open(f"{d}/audio/timeline.json", encoding="utf-8"))
    cues = []
    for line in tl["lines"]:
        ws, cur = line["words"], []
        for k, w in enumerate(ws):
            cur.append(w)
            if 0 < len(ws) - k - 1 <= 2: continue
            text = " ".join(x["w"] for x in cur)
            if len(text) >= 34 or (w["w"][-1] in ".,?!:;" and len(text) > 18) or k == len(ws) - 1:
                cues.append((cur[0]["s"], max(cur[-1]["e"], cur[0]["s"] + 0.8), text)); cur = []
    out = []
    for i, (a, b, t) in enumerate(cues, 1):
        nxt = cues[i][0] if i < len(cues) else b + 1
        out += [str(i), f"{ts(a)} --> {ts(min(b + 0.15, nxt - 0.02))}", t, ""]
    open(f"{d}/SUBTITLES.srt", "w", encoding="utf-8").write("\n".join(out))
    print(d, len(cues), "cues")
