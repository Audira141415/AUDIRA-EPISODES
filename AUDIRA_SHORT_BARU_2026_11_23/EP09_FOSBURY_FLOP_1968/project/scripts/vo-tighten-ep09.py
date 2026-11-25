"""Tighten the Cartesia take: cap silences between words, rebuild vo.wav + vo-words.json.
python scripts/vo-tighten-ep09.py   (run from project/)
In:  public/audio/work/vo-raw.wav + vo-raw-words.json
Out: public/audio/vo.wav (lead 0.15 s, gaps capped, loudnorm -16 LUFS) + public/audio/vo-words.json
"""
import array, json, subprocess, wave
from pathlib import Path

A = Path("public/audio")
W = json.loads((A / "work/vo-raw-words.json").read_text(encoding="utf8"))
with wave.open(str(A / "work/vo-raw.wav"), "rb") as r:
    rate, ch, sw = r.getframerate(), r.getnchannels(), r.getsampwidth()
    assert sw == 2
    pcm = array.array("h", r.readframes(r.getnframes()))

LEAD, GAP_IN, GAP_SEC, PAD = 0.15, 0.30, 0.45, 0.25
idx = lambda t: int(round(t * rate)) * ch
out = array.array("h", [0] * idx(LEAD))
words, t_out = [], LEAD
seg_start = W[0]["start"]
for i, w in enumerate(W):
    nxt = W[i + 1]["start"] if i + 1 < len(W) else None
    end = w["end"]
    if nxt is None:
        cut_end = min(end + PAD, len(pcm) / ch / rate)
    else:
        gap = nxt - end
        cap = GAP_SEC if w["text"][-1:] in ".?!," else GAP_IN
        cut_end = end + min(gap, cap) if gap > cap else nxt
    words.append({"text": w["text"], "start": round(t_out + (w["start"] - seg_start), 3),
                  "end": round(t_out + (end - seg_start), 3)})
    if nxt is None or cut_end != nxt:
        out.extend(pcm[idx(seg_start):idx(cut_end)])
        t_out += cut_end - seg_start
        seg_start = nxt if nxt is not None else cut_end
    # else: contiguous, keep accumulating
tmp = A / "work/vo-tight.wav"
with wave.open(str(tmp), "wb") as o:
    o.setnchannels(ch); o.setsampwidth(2); o.setframerate(rate); o.writeframes(out.tobytes())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(tmp), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar", "48000", "-ac", "1", str(A / "vo.wav")], check=True)
(A / "vo-words.json").write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf8")
print(f"words {len(words)}  duration {t_out:.2f}s  last word end {words[-1]['end']:.2f}s")
