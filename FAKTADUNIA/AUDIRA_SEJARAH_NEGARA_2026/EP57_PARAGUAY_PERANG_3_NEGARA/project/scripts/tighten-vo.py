"""Shorten pauses > MAX_GAP between words in vo.wav and shift vo-words.json to match (EP57)."""
import json, sys, wave
MAX_GAP = float(sys.argv[1]) if len(sys.argv) > 1 else 0.45
src_wav, src_words, out_wav, out_words = "vo-raw.wav", "vo-words-raw.json", "vo.wav", "vo-words.json"
words = json.load(open(src_words, encoding="utf8"))
with wave.open(src_wav, "rb") as r:
    params = r.getparams(); rate = r.getframerate(); width = r.getsampwidth() * r.getnchannels()
    pcm = r.readframes(r.getnframes())
cuts = []
if words[0]["start"] > 0.05: cuts.append((0.0, words[0]["start"] - 0.05))
for a, b in zip(words, words[1:]):
    gap = b["start"] - a["end"]
    if gap > MAX_GAP:
        mid = a["end"] + MAX_GAP / 2
        cuts.append((mid, mid + gap - MAX_GAP))
end = words[-1]["end"] + 0.3
total = len(pcm) / width / rate
if total > end: cuts.append((end, total))
out = bytearray(); pos = 0
fade = int(0.008 * rate)
for c0, c1 in cuts:
    i0, i1 = int(c0 * rate) * width, int(c1 * rate) * width
    out += pcm[pos:i0]; pos = i1
out += pcm[pos:]
def shift(t):
    s = 0.0
    for c0, c1 in cuts:
        if t >= c1: s += c1 - c0
        elif t > c0: s += t - c0
    return t - s
for w in words:
    w["start"] = round(shift(w["start"]), 3); w["end"] = round(shift(w["end"]), 3)
with wave.open(out_wav, "wb") as o:
    o.setparams(params); o.writeframes(bytes(out))
json.dump(words, open(out_words, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("cuts", len(cuts), "new duration", round(len(out) / width / rate, 2))
