"""Build the two 9:16 short narration tracks and their timing maps (run from project/).

short0N_vo.wav = hook clip + reused spans cut from vo.wav (word-accurate) + outro clip,
0.4 s gaps, loudness-normalised to -16 LUFS. short0N.json maps every segment from the short
clock to its source clock and re-times the words onto the short clock.
"""
import json, re, subprocess, wave
import numpy as np

SR = 48000
GAP = 0.4
TL = json.load(open("src/scenes/zamzam/timeline.json", encoding="utf8"))
VC = json.load(open("../audio/vo-chapters.json", encoding="utf8"))


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).astype(np.float64)


norm = lambda w: re.sub(r"[^\w'-]", "", w.lower())
VO = read("public/audio/vo.wav")


def chapter_words(cid):
    return [w for c in TL["clips"] if c["chapter"] == cid for w in c["words"]]


def find_span(cid, first, last):
    """Word index range [i, j] of the phrase starting with `first` and ending with `last`."""
    ws = chapter_words(cid)
    toks = [norm(w["w"]) for w in ws]
    f = [norm(x) for x in first.split()]
    l = [norm(x) for x in last.split()]
    for i in range(len(toks)):
        if toks[i:i + len(f)] == f:
            for j in range(i, len(toks)):
                if toks[j - len(l) + 1:j + 1] == l:
                    return ws[i:j + 1]
    raise SystemExit(f"span not found in {cid}: {first!r} .. {last!r}")


def spans_for(sh):
    if "reuseFrom" in sh:
        return [(sh["reuse"][0], sh["reuseFrom"], sh["reuseTo"])]
    out = []
    for line in sh["reuseLines"]:
        m = re.match(r"(\w+): dari '(.+)' sampai '(.+)'", line)
        cid, a, b = m.group(1), m.group(2), m.group(3)
        out.append((cid, a.replace("...", "").strip(), b.replace("...", "").strip()))
    return out


for sh in VC["shorts"]:
    sid = sh["id"]
    n = sid[-2:]
    meta = TL["shorts"][sid]
    parts, segs, words = [], [], []
    t = 0.0

    def add(sig, kind, src0, src1, ws, offset):
        global t
        segs.append({"kind": kind, "start": round(t, 3), "end": round(t + len(sig) / SR, 3), "srcStart": round(src0, 3), "srcEnd": round(src1, 3)})
        for w in ws:
            words.append({"w": w["w"], "s": round(w["s"] - offset + t, 3), "e": round(w["e"] - offset + t, 3)})
        parts.append(sig)
        t += len(sig) / SR

    hook = read(f"../audio/{meta['hook']['file']}")
    add(hook, "hook", 0, len(hook) / SR, meta["hook"]["words"], 0)
    for cid, a, b in spans_for(sh):
        ws = find_span(cid, a, b)
        s0, s1 = ws[0]["s"] - 0.06, ws[-1]["e"] + 0.18
        parts.append(np.zeros(int(GAP * SR))); t += GAP
        add(VO[int(s0 * SR):int(s1 * SR)], "reuse", s0, s1, ws, s0)
    parts.append(np.zeros(int(GAP * SR))); t += GAP
    outro = read(f"../audio/{meta['outro']['file']}")
    add(outro, "outro", 0, len(outro) / SR, meta["outro"]["words"], 0)
    tail = 1.2  # breath, then the end card holds while the outro plays
    parts.append(np.zeros(int(tail * SR))); t += tail
    sig = np.concatenate(parts)
    raw = f"out/short{n}_raw.wav"
    with wave.open(raw, "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
        o.writeframes((np.clip(sig, -1, 1) * 32767).astype(np.int16).tobytes())
    # two-pass loudnorm to -16 LUFS
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    st = json.loads(p.stderr[p.stderr.rindex("{"):p.stderr.rindex("}") + 1])
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={st['input_i']}:measured_TP={st['input_tp']}:measured_LRA={st['input_lra']}:measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", str(SR), "-ac", "1", f"public/audio/short{n}_vo.wav"], check=True)
    out = {"id": sid, "title": sh["title"], "duration": round(t, 3), "segments": segs, "words": words}
    json.dump(out, open(f"src/scenes/zamzam/short{n}.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(sid, round(t, 2), "s", [(s["kind"], s["start"], s["end"]) for s in segs])
