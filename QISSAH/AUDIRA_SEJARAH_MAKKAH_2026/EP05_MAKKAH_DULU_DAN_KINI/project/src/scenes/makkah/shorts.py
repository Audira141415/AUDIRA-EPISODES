"""Assemble the two short narration tracks from the locked voice (run from project/).

hook clip -> reused spans cut from vo.wav at word times -> outro clip, 0.4 s gaps, -16 LUFS.
Writes public/audio/short0N_vo.wav and src/scenes/makkah/short0N.json (segments + words on the short clock).
"""
import json
import re
import subprocess
import wave

import numpy as np

SR = 48000
EP = "../"
TL = json.load(open("src/scenes/makkah/timeline.json", encoding="utf8"))
GAP = 0.4

# reused spans: (chapter, first words, last words), from audio/vo-chapters.json "lines"
SPANS = {
    "short01": [
        ("c02_lembah", "Ka'bah berada di bagian terendah", "Ke Masjidil Haram."),
        ("c04_banjir_1941", "Tahun 1941, atau 1360", "sedikit foto banjir itu."),
        ("c04_banjir_1941", "Tahun 1969, banjir besar", "Masjidil Haram tinggal kenangan."),
    ],
    "short02": [
        ("c06_nusantara", "Sebelum ada kapal uap,", "dari lima bulan."),
        ("c06_nusantara", "Kapal-kapal Kongsi Tiga", "enam ratus tiga puluh empat orang meninggal."),
        ("c06_nusantara", "Tahun 1952, Indonesia", "di akhir 1970-an."),
        ("c09_payoff", "Yang tidak berubah hanya satu.", "empat puluh tujuh tahun."),
    ],
}
# where the 3D world is during the hook / outro (vo.wav seconds); the film keeps moving from there
HOOK_WORLD = {"short01": ("c04_banjir_1941", "Bertawaf"), "short02": ("c06_nusantara", "Soekaboemi.")}
OUTRO_WORLD = {"short01": ("c04_banjir_1941", "Kini,"), "short02": ("c09_payoff", "Menurutmu,")}


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).astype(np.float64)


def save(path, a, ch=1):
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()
    with wave.open(path, "wb") as o:
        o.setnchannels(ch)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes(pcm)


norm = lambda w: re.sub(r"[^\w'-]", "", w.lower())


def chapter_words(cid):
    return [w for c in TL["clips"] if c["chapter"] == cid for w in c["words"]]


def find(cid, first, last):
    ws = chapter_words(cid)
    toks = [norm(w["w"]) for w in ws]
    f = [norm(x) for x in first.split()]
    l = [norm(x) for x in last.split()]
    for i in range(len(toks)):
        if toks[i : i + len(f)] == f:
            for j in range(i, len(toks)):
                if toks[j : j + len(l)] == l:
                    return ws, i, j + len(l) - 1
    raise SystemExit(f"span not found: {cid} {first} .. {last}")


def word_time(cid, w, nth=0):
    hits = [x for x in chapter_words(cid) if norm(x["w"]) == norm(w)]
    return hits[nth]["s"]


def fade(x, ms=12):
    n = int(SR * ms / 1000)
    if len(x) > 2 * n:
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
    return x


vo = read(EP + "audio/vo.wav")

for sid, spans in SPANS.items():
    meta = TL["shorts"][sid]
    parts, segs, words = [], [], []
    t = 0.0

    def add(sig, seg, ws, offset):
        global t
        segs.append({**seg, "start": round(t, 3), "end": round(t + len(sig) / SR, 3)})
        for w in ws:
            words.append({"w": w["w"], "s": round(t + w["s"] - offset, 3), "e": round(t + w["e"] - offset, 3)})
        parts.append(sig)
        t += len(sig) / SR

    def gap():
        global t
        parts.append(np.zeros(int(GAP * SR)))
        t += GAP

    hook = fade(read(EP + "audio/" + meta["hook"]["file"]))
    hc, hw = HOOK_WORLD[sid]
    add(hook, {"kind": "hook", "worldStart": round(word_time(hc, hw) - 0.5, 3)}, meta["hook"]["words"], 0.0)
    for cid, a, b in spans:
        gap()
        ws, i, j = find(cid, a, b)
        s0 = ws[i]["s"] - 0.08
        nxt = ws[j + 1]["s"] if j + 1 < len(ws) else ws[j]["e"] + 0.6
        s1 = min(ws[j]["e"] + 0.28, nxt - 0.03)
        sig = fade(vo[int(s0 * SR) : int(s1 * SR)].copy())
        add(sig, {"kind": "span", "chapter": cid, "srcStart": round(s0, 3), "srcEnd": round(s1, 3), "worldStart": round(s0, 3)}, ws[i : j + 1], s0)
    gap()
    out = fade(read(EP + "audio/" + meta["outro"]["file"]))
    oc, ow = OUTRO_WORLD[sid]
    add(out, {"kind": "outro", "worldStart": round(word_time(oc, ow) - 0.3, 3)}, meta["outro"]["words"], 0.0)
    tail = 3.2  # end card + outro logo after the last word
    parts.append(np.zeros(int(tail * SR)))
    total = t + tail
    raw = np.concatenate(parts)
    save("out/_tmp_short.wav", raw)
    # two-pass loudnorm to -16 LUFS (linear)
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/_tmp_short.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    blk = p.stderr[p.stderr.rindex("{") :]
    m = json.loads(blk[: blk.index("}") + 1])
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "out/_tmp_short.wav", "-af", af, "-ar", str(SR), "-ac", "1", f"public/audio/{sid}_vo.wav"], check=True)
    json.dump({"id": sid, "total": round(total, 3), "voEnd": round(t, 3), "segments": segs, "words": words}, open(f"src/scenes/makkah/{sid}.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(sid, "length", round(total, 2), "s; voice ends", round(t, 2))
