"""SUBTITLES.srt (long form, from audio/timeline.json) and SUBTITLES_SHORT_0N.srt (from the short0N.json word
times) per episode. Cues of <=42 chars, broken at punctuation, no 1-2 word orphans.
Usage (from the series folder): python _tools/write_srt.py EP01 [...]"""
import sys, json, glob

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def cues_of(groups):
    cues = []
    for ws in groups:
        cur = []
        for k, w in enumerate(ws):
            cur.append(w)
            if 0 < len(ws) - k - 1 <= 2: continue
            text = " ".join(x["w"] for x in cur)
            if len(text) >= 34 or (w["w"][-1] in ".,?!:;" and len(text) > 18) or k == len(ws) - 1:
                cues.append((cur[0]["s"], max(cur[-1]["e"], cur[0]["s"] + 0.8), text)); cur = []
    return cues

def write(path, cues):
    out = []
    for i, (a, b, t) in enumerate(cues, 1):
        nxt = cues[i][0] if i < len(cues) else b + 1
        out += [str(i), f"{ts(a)} --> {ts(min(b + 0.15, nxt - 0.02))}", t, ""]
    open(path, "w", encoding="utf-8").write("\n".join(out))
    return len(cues)

for ep in sys.argv[1:]:
    d = glob.glob(f"{ep}_*")[0]
    tl = json.load(open(f"{d}/audio/timeline.json", encoding="utf-8"))
    print(d, "long", write(f"{d}/SUBTITLES.srt", cues_of([c["words"] for c in tl["clips"]])), "cues")
    for n in ("01", "02"):
        sj = json.load(open(glob.glob(f"{d}/project/src/scenes/*/short{n}.json")[0], encoding="utf-8"))
        ws = sj["words"]
        # split into sentence groups at gaps > 0.25 s so cues never bridge two parts
        groups, cur = [], []
        for w in ws:
            if cur and w["s"] - cur[-1]["e"] > 0.25: groups.append(cur); cur = []
            cur.append(w)
        if cur: groups.append(cur)
        print(d, f"short{n}", write(f"{d}/SUBTITLES_SHORT_{n}.srt", cues_of(groups)), "cues")
