"""Cap pauses between words to MAX seconds; rewrite wav + word timings.
usage: python tighten.py in.wav in-words.json out.wav out-words.json [max=0.42] [lead=0.25]"""
import json, sys, wave
import numpy as np

src, wsrc, dst, wdst = sys.argv[1:5]
MAX = float(sys.argv[5]) if len(sys.argv) > 5 else 0.42
LEAD = float(sys.argv[6]) if len(sys.argv) > 6 else 0.25
with wave.open(src) as w:
    sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
    data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16 if sw == 2 else np.int32).reshape(-1, ch)
words = json.load(open(wsrc, encoding="utf-8"))
FADE = int(0.012 * sr)

# keep-regions: [start, end] in seconds of the source
keep, removed = [], []
cur = max(0.0, words[0]["start"] - LEAD)
prev_end = words[0]["start"]
for i, wd in enumerate(words):
    if i > 0:
        gap = wd["start"] - prev_end
        if gap > MAX:
            cut_a = prev_end + MAX / 2
            cut_b = wd["start"] - MAX / 2
            keep.append((cur, cut_a))
            cur = cut_b
    prev_end = max(prev_end, wd["end"])
tail = min(len(data) / sr, prev_end + 0.35)
keep.append((cur, tail))

out, mapping, t_out = [], [], 0.0
for a, b in keep:
    seg = data[int(a * sr):int(b * sr)].astype(np.float32)
    n = len(seg)
    if n > 2 * FADE:
        ramp = np.linspace(0, 1, FADE)[:, None]
        seg[:FADE] *= ramp
        seg[-FADE:] *= ramp[::-1]
    out.append(seg)
    mapping.append((a, b, t_out))
    t_out += n / sr

def remap(t):
    for a, b, o in mapping:
        if t <= b + 1e-6:
            return o + max(0.0, t - a)
    a, b, o = mapping[-1]
    return o + (t - a)

for wd in words:
    wd["start"], wd["end"] = round(remap(wd["start"]), 3), round(remap(wd["end"]), 3)
arr = np.concatenate(out).clip(-32768, 32767).astype(np.int16)
with wave.open(dst, "wb") as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr); w.writeframes(arr.tobytes())
json.dump(words, open(wdst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(data)/sr:.2f}s -> {len(arr)/sr:.2f}s, segments={len(keep)}")
