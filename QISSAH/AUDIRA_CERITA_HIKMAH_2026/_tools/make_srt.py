# SUBTITLES.srt from the real voice timeline: one cue per clip, split into chunks of <= 8 words / 42 chars.
# usage (from series root): python _tools/make_srt.py ep02 EP02_TEMPAYAN_RETAK
import json, sys

ep, folder = sys.argv[1], sys.argv[2]
studio = sys.argv[3] if len(sys.argv) > 3 else "studio"
tl = json.load(open(f"{studio}/src/scenes/{ep}/timeline.json", encoding="utf-8"))
NAMES = {}

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

cues = []
for c in tl["clips"]:
    words = c["words"]; chunk = []
    for i, w in enumerate(words):
        chunk.append(w)
        text = " ".join(x["w"] for x in chunk)
        end_sentence = w["w"].endswith((".", "?", "!", ",")) and len(chunk) >= 4
        if len(chunk) >= 8 or len(text) >= 42 or end_sentence or i == len(words) - 1:
            cues.append([chunk[0]["s"], chunk[-1]["e"], text, c["who"]]); chunk = []
# keep cues on screen until the next one starts (max 0.6 s extra), never overlapping
for i, q in enumerate(cues):
    nxt = cues[i + 1][0] if i + 1 < len(cues) else q[1] + 0.6
    q[1] = min(max(q[1], q[0] + 0.7), nxt - 0.02, q[1] + 0.6) if nxt > q[1] else nxt - 0.02
out = []
for i, (s, e, text, who) in enumerate(cues, 1):
    out.append(f"{i}\n{ts(s)} --> {ts(e)}\n{text}\n")
open(f"{folder}/SUBTITLES.srt", "w", encoding="utf-8").write("\n".join(out))
print(folder, len(cues), "cues, last", ts(cues[-1][1]))
