"""Assemble the two shorts' narration from the locked voice (run from project/).

hook clip + gap + span cut from vo.wav (word-time bounds) + gap + outro clip -> -16 LUFS.
Writes public/audio/short0N_vo.wav and src/scenes/kabah/short0N.json (segments + re-timed words).
"""
import json, re, subprocess, wave
import numpy as np

SR = 48000
TL = json.load(open("src/scenes/kabah/timeline.json", encoding="utf8"))
GAP = 0.4
TAIL = 3.0  # outro logo card after the narration

SPANS = {
    "short01": {"chapter": "c04_hijr", "first": ("dana", 0), "world_hook": ("c04_hijr", "enam", 0), "world_outro": ("c05_zubair", "dua", 0)},
    "short02": {"chapter": "c07_qaramithah", "first": ("tahun", 0), "world_hook": ("c07_qaramithah", "tetap", 1), "world_outro": ("c10_payoff", "jajarkan", 0)},
}

norm = lambda s: re.sub(r"[.,:;?!]", "", s.lower())


def read(path):
    with wave.open(path) as w:
        sr, n = w.getframerate(), w.getnframes()
        a = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(1)
    if sr != SR:
        x = np.arange(int(len(a) * SR / sr)) * sr / SR
        a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
    return a


def words_of(chapter):
    out = []
    for c in TL["clips"]:
        if c["chapter"] == chapter:
            out += c["words"]
    return out


def word_time(chapter, w, nth):
    k = 0
    for x in words_of(chapter):
        if norm(x["w"]) == w:
            if k == nth:
                return x["s"]
            k += 1
    raise KeyError((chapter, w, nth))


vo = read("public/audio/vo.wav")
for sid, cfg in SPANS.items():
    sh = TL["shorts"][sid]
    ws = words_of(cfg["chapter"])
    i0 = next(i for i, x in enumerate(ws) if norm(x["w"]) == cfg["first"][0])
    first, last = ws[i0], ws[-1]
    prev_e = ws[i0 - 1]["e"] if i0 > 0 else first["s"] - 0.3
    src0 = max(prev_e, first["s"] - 0.22)
    src1 = last["e"] + 0.35
    hook = read("../audio/" + sh["hook"]["file"])
    outro = read("../audio/" + sh["outro"]["file"])
    body = vo[int(src0 * SR): int(src1 * SR)]
    g = np.zeros(int(GAP * SR), np.float32)
    t_body = len(hook) / SR + GAP
    t_outro = t_body + len(body) / SR + GAP
    track = np.concatenate([hook, g, body, g, outro, np.zeros(int(TAIL * SR), np.float32)])
    dur = len(track) / SR
    raw = f"public/audio/{sid}_raw.wav"
    with wave.open(raw, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(track, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "1", f"public/audio/{sid}_vo.wav"], check=True)
    import os; os.remove(raw)
    # loudnorm one-pass can land a few tenths off: trim with a linear gain to exactly -16 LUFS
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", f"public/audio/{sid}_vo.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    li = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", meas)[-1])
    tmp = f"public/audio/{sid}_tmp.wav"
    os.replace(f"public/audio/{sid}_vo.wav", tmp)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", f"volume={-16 - li:.2f}dB", "-ar", str(SR), f"public/audio/{sid}_vo.wav"], check=True)
    os.remove(tmp)
    words = []
    for x in sh["hook"]["words"]:
        words.append({"w": x["w"], "s": round(x["s"], 3), "e": round(x["e"], 3), "part": "hook"})
    for x in ws[i0:]:
        words.append({"w": x["w"], "s": round(x["s"] - src0 + t_body, 3), "e": round(x["e"] - src0 + t_body, 3), "part": "body"})
    for x in sh["outro"]["words"]:
        words.append({"w": x["w"], "s": round(x["s"] + t_outro, 3), "e": round(x["e"] + t_outro, 3), "part": "outro"})
    hc, hw, hn = cfg["world_hook"]; oc, ow, on = cfg["world_outro"]
    out = {
        "id": sid,
        "duration": round(dur, 3),
        "narrationEnd": round(t_outro + len(outro) / SR, 3),
        "segments": [
            {"part": "hook", "file": sh["hook"]["file"], "at": 0, "len": round(len(hook) / SR, 3), "world": round(word_time(hc, hw, hn), 3)},
            {"part": "body", "src0": round(src0, 3), "src1": round(src1, 3), "at": round(t_body, 3), "len": round(src1 - src0, 3)},
            {"part": "outro", "file": sh["outro"]["file"], "at": round(t_outro, 3), "len": round(len(outro) / SR, 3), "world": round(word_time(oc, ow, on), 3)},
        ],
        "words": words,
    }
    json.dump(out, open(f"src/scenes/kabah/{sid}.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(sid, "duration", round(dur, 2), "body", round(src0, 2), round(src1, 2))
