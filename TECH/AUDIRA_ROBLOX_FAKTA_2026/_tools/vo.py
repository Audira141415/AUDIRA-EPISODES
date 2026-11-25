"""Voice pipeline for one episode. Run from F:/AUDIRA-VIDEO-MOTION.
python AUDIRA_ROBLOX_FAKTA_2026/_tools/vo.py <EP folder> tts [--speed 1.1] [--only s1 s2]
python AUDIRA_ROBLOX_FAKTA_2026/_tools/vo.py <EP folder> build [--tempo 1.05]
tts: writes voiceover.json from script-lines.json markup {display|spoken}, calls Cartesia per line, tightens silence.
build: joins clips, applies atempo, normalizes to -16 LUFS, writes AUDIO/voiceover.wav and timeline.json with display words."""
import array, json, os, re, subprocess, sys, wave
from pathlib import Path

ep = Path("AUDIRA_ROBLOX_FAKTA_2026") / sys.argv[1]
cmd = sys.argv[2]


def opt(k, d):
    return float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d


SPEED, TEMPO = opt("--speed", 1.0), opt("--tempo", 1.0)
LEAD, GAP, HOLD = 0.1, 0.16, 3.0
lines = json.loads((ep / "script-lines.json").read_text(encoding="utf8"))
TOK = re.compile(r"\{([^|}]*)\|([^}]*)\}|(\S+)")


def parse(text):
    out = []
    for a, b, c in TOK.findall(text):
        out.append((a.split(), b.split()) if b else ([c], [c]))
    return out


work = ep / "AUDIO" / "work"
work.mkdir(parents=True, exist_ok=True)
if cmd == "tts":
    tts = [{"id": l["id"], "text": " ".join(" ".join(s) for _, s in parse(l["text"]))} for l in lines]
    req = {"model": "sonic-3", "language": "id", "voice": "04b567df-2923-4b0c-896b-4b7df0a07e1a", "speed": SPEED,
           "out_dir": (work / "clips-raw").as_posix(), "lines": tts}
    (ep / "voiceover.json").write_text(json.dumps(req, ensure_ascii=False, indent=1), encoding="utf8")
    only = sys.argv[sys.argv.index("--only") + 1:] if "--only" in sys.argv else []
    a = ["node", "scripts/tts-cartesia.mjs", "--request", (ep / "voiceover.json").as_posix(), "--meta", (work / "meta-raw.json").as_posix()]
    if only:
        a += ["--only", ",".join(only)]
    env = dict(os.environ)
    env.pop("CARTESIA_API_KEY", None)
    subprocess.run(a, check=True, env=env)
    meta = json.loads((work / "meta-raw.json").read_text(encoding="utf8"))
    (work / "clips").mkdir(exist_ok=True)
    MAX, WIN, THR, HEAD, TAIL = 0.34, 0.01, 120, 0.05, 0.16
    for vid, v in meta["voices"].items():
        with wave.open(str(work / "clips-raw" / f"{vid}.wav"), "rb") as r:
            rate = r.getframerate()
            s16 = array.array("h", r.readframes(r.getnframes()))
        n = int(WIN * rate)
        loud = []
        for i in range(0, len(s16), n):
            s = s16[i:i + n]
            loud.append((sum(x * x for x in s) / max(1, len(s))) ** .5 >= THR)
        dur = len(s16) / rate
        first = loud.index(True) * WIN
        last = (len(loud) - loud[::-1].index(True)) * WIN
        cuts = []
        if first > HEAD:
            cuts.append((0.0, first - HEAD))
        i = loud.index(True)
        while i < len(loud):
            if not loud[i]:
                j = i
                while j < len(loud) and not loud[j]:
                    j += 1
                t0, t1 = i * WIN, j * WIN
                if j < len(loud) and t1 - t0 > MAX:
                    cuts.append((t0 + MAX / 2, t1 - MAX / 2))
                i = j
            else:
                i += 1
        if dur > last + TAIL:
            cuts.append((last + TAIL, dur))
        shift = lambda t: t - sum(min(max(t - c0, 0), c1 - c0) for c0, c1 in cuts)
        o = array.array("h")
        pos = 0.0
        for c0, c1 in cuts:
            o.extend(s16[int(pos * rate):int(c0 * rate)])
            pos = c1
        o.extend(s16[int(pos * rate):])
        words = [dict(w) for w in v["words"]]
        for w in words:
            w["start"], w["end"] = round(shift(w["start"]), 3), round(shift(w["end"]), 3)
        v["words_tight"] = words
        p = work / "clips" / f"{vid}.wav"
        with wave.open(str(p), "wb") as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(rate); f.writeframes(o.tobytes())
        v["tight_path"] = p.as_posix()
        v["tight_s"] = round(len(o) / rate, 3)
        long = [(w["text"], round(w["end"] - w["start"], 2)) for w in words if w["end"] - w["start"] > .95]
        print(vid, v["tight_s"], "words", len(words), "long:", long)
    (work / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf8")
    print("total", round(sum(v["tight_s"] for v in meta["voices"].values()), 2))
if cmd == "build":
    meta = json.loads((work / "meta.json").read_text(encoding="utf8"))
    rate = 44100
    out = bytearray(b"\0\0" * int(LEAD * rate))
    t = LEAD
    scenes, words = [], []
    for i, l in enumerate(lines):
        v = meta["voices"][l["id"]]
        ws = v["words_tight"]
        with wave.open(v["tight_path"], "rb") as r:
            pcm = r.readframes(r.getnframes())
        j = 0
        start = t
        for disp, sp in parse(l["text"]):
            seg = ws[j:j + len(sp)]
            if [w["text"].strip() for w in seg] != sp:
                print("MISMATCH", l["id"], sp, [w["text"] for w in seg])
            j += len(sp)
            s0, e0 = seg[0]["start"], seg[-1]["end"]
            total = sum(len(d) for d in disp)
            pos = s0
            for d in disp:
                e = pos + (e0 - s0) * len(d) / total
                words.append({"text": d, "start": start + pos, "end": start + e, "scene": l["id"]})
                pos = e
        if j != len(ws):
            print("LEFTOVER", l["id"], len(ws) - j)
        out += pcm
        t += len(pcm) / 2 / rate
        scenes.append({"id": l["id"], "start": start, "end": t})
        if i < len(lines) - 1:
            out += b"\0\0" * int(GAP * rate)
            t += int(GAP * rate) / rate
    with wave.open(str(work / "vo-slow.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(bytes(out))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(work / "vo-slow.wav"), "-af",
                    f"atempo={TEMPO},loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur={HOLD}", "-ar", "44100",
                    str(ep / "AUDIO" / "VO_MASTER.wav")], check=True)
    k = 1 / TEMPO
    for s in scenes:
        s["start"], s["end"] = round(s["start"] * k, 3), round(s["end"] * k, 3)
    for w in words:
        w["start"], w["end"] = round(w["start"] * k, 3), round(w["end"] * k, 3)
    speech = round(t * k, 3)
    dur = round(speech + HOLD, 2)
    (ep / "timeline.json").write_text(json.dumps({"duration": dur, "speech_end": speech, "scenes": scenes, "words": words}, ensure_ascii=False, indent=0), encoding="utf8")
    print("speech", speech, "film", dur, "display words", len(words), "wpm", round(len(words) / speech * 60))
    for s in scenes:
        print(s)
