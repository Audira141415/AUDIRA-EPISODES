"""Writes SUBTITLES/subtitles.srt from timeline.json with the same phrase rules as the burned-in captions. Run from an episode folder."""
import json
T = json.load(open("timeline.json", encoding="utf8"))
g, cur = [], []
for w in T["words"]:
    if cur:
        p = cur[-1]
        n = sum(len(x["text"]) + 1 for x in cur) + len(w["text"])
        if p["scene"] != w["scene"] or p["text"][-1] in ".?:;!" or (p["text"][-1] == "," and len(cur) >= 2) or len(cur) >= 6 or n > 30:
            g.append(cur)
            cur = []
    cur.append(w)
g.append(cur)


def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


with open("SUBTITLES/subtitles.srt", "w", encoding="utf8") as f:
    for i, c in enumerate(g):
        end = g[i + 1][0]["start"] - .02 if i < len(g) - 1 else c[-1]["end"] + .4
        f.write(f"{i+1}\n{ts(c[0]['start'])} --> {ts(end)}\n{' '.join(x['text'] for x in c)}\n\n")
print(len(g), "cues", len(T["words"]), "words")
