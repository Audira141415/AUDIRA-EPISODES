"""Assemble the two short narrations and their timing files. Run from project/:
    python src/scenes/kiswah/shorts.py
Writes public/audio/short0N_vo.wav (-16 LUFS) and src/scenes/kiswah/short0N.json.
Order per short: sNN_hook clip, the reused span cut from vo.wav (word times), sNN_outro clip."""
import json
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
AUDIO = os.path.join(EP, "audio")
OUT = os.path.join(EP, "project", "public", "audio")
TL = json.load(open(os.path.join(AUDIO, "timeline.json"), encoding="utf8"))
VC = json.load(open(os.path.join(AUDIO, "vo-chapters.json"), encoding="utf8"))
GAP = 0.4
# moment of the long film the hook holds on (anchored to a word)
HOOK_AT = {"short01": ("c07_pabrik", "sebenarnya", 0, 0.4), "short02": ("c06_1927", "waktunya", 0, 0.6)}

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def words_of(ch):
    return [w for c in TL["clips"] if c["chapter"] == ch for w in c["words"]]


def find_span(ch, frm, to):
    ws = words_of(ch)
    keys = [norm(w["w"]) for w in ws]
    a = [norm(x) for x in frm.split()]
    b = [norm(x) for x in to.split()]
    i0 = next(i for i in range(len(keys)) if keys[i : i + len(a)] == a)
    i1 = next(i for i in range(i0, len(keys)) if keys[i : i + len(b)] == b) + len(b) - 1
    return ws, i0, i1


def word_at(ch, w, n):
    hits = [x for x in words_of(ch) if norm(x["w"]) == norm(w)]
    return hits[n]["s"]


def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout)


os.makedirs(OUT, exist_ok=True)
for sd in VC["shorts"]:
    sid = sd["id"]
    meta = TL["shorts"][sid]
    hook, outro = meta["hook"], meta["outro"]
    hook_f = os.path.join(AUDIO, hook["file"])
    outro_f = os.path.join(AUDIO, outro["file"])
    ch = sd["reuse"][0]
    ws, i0, i1 = find_span(ch, sd["reuseFrom"], sd["reuseTo"])
    src0 = ws[i0]["s"] - 0.08
    src1 = ws[i1]["e"] + 0.25
    hook_len = dur(hook_f)
    outro_len = dur(outro_f)
    body0 = hook_len + GAP
    body1 = body0 + (src1 - src0)
    out0 = body1 + GAP
    out1 = out0 + outro_len
    outro_from = out1 + 0.4
    total = outro_from + 3.0
    words = [dict(w=w["w"], s=round(w["s"], 3), e=round(w["e"], 3)) for w in hook["words"]]
    words += [dict(w=w["w"], s=round(w["s"] - src0 + body0, 3), e=round(w["e"] - src0 + body0, 3)) for w in ws[i0 : i1 + 1]]
    words += [dict(w=w["w"], s=round(w["s"] + out0, 3), e=round(w["e"] + out0, 3)) for w in outro["words"]]
    hc, hw, hn, hd = HOOK_AT[sid]
    spec = {
        "id": sid,
        "duration": round(total, 3),
        "hookSrc": round(word_at(hc, hw, hn) + hd, 3),
        "bodyStart": round(body0, 3),
        "bodyEnd": round(body1, 3),
        "srcStart": round(src0, 3),
        "srcEnd": round(src1, 3),
        "endCardFrom": round(out0, 3),
        "outroFrom": round(outro_from, 3),
        "segments": [
            {"part": "hook", "file": f"audio/{hook['file']}", "start": 0, "end": round(hook_len, 3)},
            {"part": "body", "source": "audio/vo.wav", "srcStart": round(src0, 3), "srcEnd": round(src1, 3), "start": round(body0, 3), "end": round(body1, 3)},
            {"part": "outro", "file": f"audio/{outro['file']}", "start": round(out0, 3), "end": round(out1, 3)},
        ],
        "words": words,
    }
    json.dump(spec, open(os.path.join(HERE, f"{sid}.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    vo = os.path.join(AUDIO, "vo.wav")
    fc = (
        f"[0:a]aformat=sample_rates=48000:channel_layouts=mono[h];"
        f"[1:a]atrim={src0:.3f}:{src1:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,afade=t=in:d=0.03,afade=t=out:st={src1 - src0 - 0.06:.3f}:d=0.06[b];"
        f"[2:a]aformat=sample_rates=48000:channel_layouts=mono[o];"
        f"anullsrc=r=48000:cl=mono,atrim=0:{GAP}[g1];anullsrc=r=48000:cl=mono,atrim=0:{GAP}[g2];anullsrc=r=48000:cl=mono,atrim=0:{total - out1:.3f}[g3];"
        f"[h][g1][b][g2][o][g3]concat=n=6:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[m]"
    )
    dst = os.path.join(OUT, f"{sid}_vo.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", hook_f, "-i", vo, "-i", outro_f, "-filter_complex", fc, "-map", "[m]", "-ar", "48000", "-ac", "1", dst], check=True)
    print(sid, f"total {total:.1f}s", f"body {src1 - src0:.1f}s from {src0:.1f}", "file", round(dur(dst), 2))
