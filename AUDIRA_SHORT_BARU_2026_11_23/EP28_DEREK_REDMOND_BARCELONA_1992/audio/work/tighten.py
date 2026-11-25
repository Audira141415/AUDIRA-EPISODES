import array, json, sys, wave
src_wav, src_words, out_wav, out_words = sys.argv[1:5]
LEAD, GAP_IN, GAP_SEC, TAIL = 0.1, 0.30, 0.45, 0.08
W = json.load(open(src_words, encoding="utf8"))
with wave.open(src_wav, "rb") as r:
    rate = r.getframerate(); params = r.getparams()
    pcm = array.array("h", r.readframes(r.getnframes()))
import math
def rms(a, b):
    x = pcm[int(a * rate):int(b * rate)]
    return math.sqrt(sum(v * v for v in x) / max(1, len(x)))
out = array.array("h", [0] * int(LEAD * rate))
new = []
i = 0
# group words into runs where gaps are small; copy raw audio per run, insert capped silence between runs
runs = []; cur = [W[0]]
for a, b in zip(W, W[1:]):
    gap = b["start"] - a["end"]
    cap = GAP_SEC if a["text"][-1] in ".:" else GAP_IN
    if gap > cap: runs.append((cur, cap)); cur = [b]
    else: cur.append(b)
runs.append((cur, 0))
for ws, cap in runs:
    s = max(0, ws[0]["start"] - 0.03)
    while s > 0.05 and rms(s - 0.02, s) > 60 and ws[0]["start"] - s < 0.4: s -= 0.01
    e = ws[-1]["end"] + TAIL
    while rms(e, e + 0.02) > 60 and e - ws[-1]["end"] < 0.4: e += 0.01
    t0 = len(out) / rate
    for w in ws:
        new.append({**w, "start": round(t0 + w["start"] - s, 3), "end": round(t0 + w["end"] - s, 3)})
    out.extend(pcm[int(s * rate):int(e * rate)])
    pad = max(0, cap - TAIL - 0.03)
    out.extend([0] * int(pad * rate))
out.extend([0] * int(0.5 * rate))
with wave.open(out_wav, "wb") as w:
    w.setparams(params); w.writeframes(out.tobytes())
json.dump(new, open(out_words, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("dur", len(out) / rate, "last", new[-1])
