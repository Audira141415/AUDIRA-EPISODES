# Tighten VO pauses: every inter-word gap > CAP s is shortened to CAP (cut in the middle of the gap, 10 ms fades).
import json, wave, numpy as np, sys
CAP = 0.38; FADE = 0.01
src, words_src, dst, words_dst = 'audio/vo_raw.wav', 'audio/vo-words_raw.json', 'audio/vo.wav', 'audio/vo-words.json'
with wave.open(src) as w:
    sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch).astype(np.float32)
W = json.load(open(words_src, encoding='utf8'))
cuts = []  # (start_s, end_s) removed
for i in range(1, len(W)):
    g = W[i]['start'] - W[i - 1]['end']
    if g > CAP:
        rm = g - CAP; mid = W[i - 1]['end'] + CAP / 2
        cuts.append((mid, mid + rm))
keep, pos = [], 0
f = int(FADE * sr)
for s, e in cuts:
    seg = a[pos:int(s * sr)].copy(); seg[-f:] *= np.linspace(1, 0, f)[:, None]
    if keep: seg[:f] *= np.linspace(0, 1, f)[:, None]
    keep.append(seg); pos = int(e * sr)
tail = a[pos:].copy(); tail[:f] *= np.linspace(0, 1, f)[:, None]; keep.append(tail)
out = np.concatenate(keep)
end_pad = int(0.3 * sr)
last = W[-1]['end'] - sum(e - s for s, e in cuts)
out = out[:int(last * sr) + end_pad]
with wave.open(dst, 'wb') as w:
    w.setnchannels(ch); w.setsampwidth(sw); w.setframerate(sr); w.writeframes(out.astype(np.int16).tobytes())
def shift(t): return t - sum(e - s for s, e in cuts if e <= t + 1e-6)
for x in W: x['start'], x['end'] = round(shift(x['start']), 3), round(shift(x['end']), 3)
json.dump(W, open(words_dst, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(f'sr={sr} ch={ch} cuts={len(cuts)} removed={sum(e-s for s,e in cuts):.2f}s dur={len(out)/sr:.2f}s last={W[-1]}')
