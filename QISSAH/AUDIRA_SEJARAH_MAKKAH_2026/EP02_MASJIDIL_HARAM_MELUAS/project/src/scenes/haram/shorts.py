"""Assemble the two short narrations from the locked voice (run from project/).

hook clip -> reused sentences cut from vo.wav at word times -> outro clip, -16 LUFS.
Writes public/audio/short0N_vo.wav and src/scenes/haram/short0N.json (segments + words on the short clock).
"""
import json
import re
import subprocess

import numpy as np

SR = 48000
EP = "../audio"
TL = json.load(open("src/scenes/haram/timeline.json", encoding="utf8"))
VC = json.load(open(f"{EP}/vo-chapters.json", encoding="utf8"))
GAP_PART = 0.45   # between hook / body / outro
GAP_JUMP = 0.32   # between non-adjacent reused sentences
TAIL = 3.6        # outro card after the last word (logo), seconds


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).astype(np.float64)


def norm(w):
    return re.sub(r"[^\w']", "", w.lower())


VO = read(f"{EP}/vo.wav")


def find_line(chapters, line):
    toks = [norm(x) for x in line.split()]
    for ch in chapters:
        words = [(w, c["id"]) for c in TL["clips"] if c["chapter"] == ch for w in c["words"]]
        seq = [norm(w["w"]) for w, _ in words]
        for i in range(len(seq) - len(toks) + 1):
            if seq[i : i + len(toks)] == toks:
                return ch, [w for w, _ in words[i : i + len(toks)]]
    raise SystemExit(f"line not found: {line}")


def fade(x, ms=12):
    n = min(len(x) // 2, int(SR * ms / 1000))
    if n:
        r = np.linspace(0, 1, n)
        x[:n] *= r
        x[-n:] *= r[::-1]
    return x


for sh in VC["shorts"]:
    sid = sh["id"]
    n = sid[-2:]
    tls = TL["shorts"][sid]
    parts, segs, words = [], [], []
    t = 0.0

    def add(audio, kind, src, s0, s1, ws, chapter):
        global t
        audio = fade(audio.copy())
        segs.append({"kind": kind, "src": src, "srcStart": round(s0, 3), "srcEnd": round(s1, 3), "start": round(t, 3), "end": round(t + len(audio) / SR, 3), "chapter": chapter})
        for w in ws:
            words.append({"w": w["w"], "s": round(t + w["s"] - s0, 3), "e": round(t + w["e"] - s0, 3), "seg": len(segs) - 1})
        parts.append(audio)
        t += len(audio) / SR

    def gap(sec):
        global t
        parts.append(np.zeros(int(sec * SR)))
        t += sec

    hook = read(f"{EP}/{tls['hook']['file']}")
    add(hook, "hook", tls["hook"]["file"], 0.0, len(hook) / SR, tls["hook"]["words"], sid)
    gap(GAP_PART)
    prev_end = None
    for line in sh["lines"]:
        ch, ws = find_line(sh["reuse"], line)
        s0, s1 = ws[0]["s"] - 0.06, ws[-1]["e"] + 0.14
        if prev_end is not None:
            if abs(s0 - prev_end) < 1.2:   # adjacent sentence in the source: keep the natural pause
                s0 = prev_end
            else:
                gap(GAP_JUMP)
        add(VO[int(s0 * SR) : int(s1 * SR)], "vo", "vo.wav", s0, s1, ws, ch)
        prev_end = s1
    gap(GAP_PART)
    outro = read(f"{EP}/{tls['outro']['file']}")
    add(outro, "outro", tls["outro"]["file"], 0.0, len(outro) / SR, tls["outro"]["words"], sid)
    audio = np.concatenate(parts)
    raw = f"out/{sid}_raw.wav"
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    import wave

    with wave.open(raw, "wb") as o:
        o.setnchannels(1)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes(pcm.tobytes())
    # two-pass loudnorm to -16 LUFS
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{") : m.rindex("}") + 1])
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", str(SR), "-ac", "1", f"public/audio/short{n}_vo.wav"], check=True)
    voEnd = round(t, 3)
    total = round(t + TAIL, 3)
    json.dump({"id": sid, "title": sh["title"], "voEnd": voEnd, "total": total, "segments": segs, "words": words}, open(f"src/scenes/haram/short{n}.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(sid, "vo", voEnd, "total", total, "segments", len(segs))
