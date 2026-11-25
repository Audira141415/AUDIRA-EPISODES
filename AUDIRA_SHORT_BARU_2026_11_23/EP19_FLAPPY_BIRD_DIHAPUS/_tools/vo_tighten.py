"""Tighten one MCP Cartesia take (audira_generate_voiceover) into the vo.py "build" outputs.
python AUDIRA_FAKTA_OLAHRAGA_2026/_tools/vo_tighten.py <EP folder>
In:  <EP>/audio/work/vo-raw.wav + vo-raw-words.json (one take, sections in docs/script-lines.json order)
Out: <EP>/audio/vo.wav (lead 0.1 s, gaps capped, loudnorm -16 LUFS, +3 s pad) and
     <EP>/audio/timeline.json {duration, speech_end, scenes[{id,start,end}], words[{text,start,end,scene}]}
     with display words from the {display|spoken} markup, same schema as vo.py build (feeds make-timeline.py)."""
import array, json, re, subprocess, sys, wave
from pathlib import Path

ep = Path(__file__).resolve().parent.parent / sys.argv[1]
work = ep / "audio" / "work"
LEAD, GAP_IN, GAP_SEC, HOLD = 0.1, 0.6, 1.0, 3.0
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")


def parse(text):
    return [(a.split(), b.split()) if b else ([c], [c]) for a, b, c in TOK.findall(text)]


lines = json.loads((ep / "docs" / "script-lines.json").read_text(encoding="utf8"))
W = json.loads((work / "vo-raw-words.json").read_text(encoding="utf8"))
with wave.open(str(work / "vo-raw.wav"), "rb") as r:
    rate = r.getframerate()
    pcm = array.array("h", r.readframes(r.getnframes()))

# section index of every spoken word
sec_of = []
for i, l in enumerate(lines):
    sec_of += [i] * sum(len(sp) for _, sp in parse(l["text"]))
assert len(sec_of) == len(W), (len(sec_of), len(W))

# keep [cut_start, cut_end) ranges of the raw audio; map raw time -> new time
keep, t_new = [], LEAD
out = array.array("h", [0] * int(LEAD * rate))
starts = []  # new start time of each word
pos = W[0]["start"]
for i, w in enumerate(W):
    nxt = W[i + 1] if i + 1 < len(W) else None
    if nxt is None:
        seg_end = w["end"] + 0.15
    else:
        g = nxt["start"] - w["end"]
        cap = GAP_SEC if sec_of[i + 1] != sec_of[i] else GAP_IN
        seg_end = w["end"] + min(g, cap) / 2 if g > cap else nxt["start"]
    starts.append(t_new + (w["start"] - pos))
    a, b = int(pos * rate), int(seg_end * rate)
    out.extend(pcm[a:b])
    t_new += (b - a) / rate
    if nxt is not None and sec_of[i + 1] != sec_of[i] and nxt["start"] - w["end"] < GAP_SEC:
        pad = int((GAP_SEC - max(0.0, nxt["start"] - w["end"])) * rate)  # breath between sections
        out.extend(array.array("h", [0] * pad))
        t_new += pad / rate
    if nxt is not None:
        g = nxt["start"] - w["end"]
        cap = GAP_SEC if sec_of[i + 1] != sec_of[i] else GAP_IN
        pos = nxt["start"] - min(g, cap) / 2 if g > cap else nxt["start"]
speech = round(t_new, 3)
ends = [s + (w["end"] - w["start"]) for s, w in zip(starts, W)]

with wave.open(str(work / "vo-tight.wav"), "wb") as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(rate); o.writeframes(out.tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(work / "vo-tight.wav"), "-af",
                f"loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur={HOLD}", "-ar", "44100", str(ep / "audio" / "vo.wav")], check=True)

words, scenes, j = [], [], 0
for i, l in enumerate(lines):
    first = j
    for disp, sp in parse(l["text"]):
        seg = list(range(j, j + len(sp)))
        if [W[k]["text"] for k in seg] != sp:
            print("MISMATCH", l["id"], sp, [W[k]["text"] for k in seg])
        s0, e0 = starts[seg[0]], ends[seg[-1]]
        tot, p = sum(len(d) for d in disp), s0
        for d in disp:
            e = p + (e0 - s0) * len(d) / tot
            words.append({"text": d, "start": round(p, 3), "end": round(e, 3), "scene": l["id"]})
            p = e
        j += len(sp)
    scenes.append({"id": l["id"], "start": round(starts[first], 3), "end": round(ends[j - 1], 3)})
(ep / "audio" / "timeline.json").write_text(json.dumps({"duration": round(speech + HOLD, 2), "speech_end": speech, "scenes": scenes, "words": words}, ensure_ascii=False, indent=0), encoding="utf8")
print("speech", speech, "film", round(speech + HOLD, 2), "display words", len(words), "wpm", round(len(words) / speech * 60))
for s in scenes:
    print(s)
