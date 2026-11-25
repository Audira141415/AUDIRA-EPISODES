"""Assemble Cartesia clips into one VO track (Audio Master Clock) for a Batch 1 episode.
Usage (from BATCH01): python _tools/build_vo.py ep036
In : EPxxx-*/voiceover.json, studio/public/audio/<ep>/vo-meta.json + clips/*.wav
Out: studio/public/audio/<ep>/vo.wav (-16 LUFS, 48 kHz mono), studio/src/scenes/<ep>/timeline.json
Clip edges are trimmed by audio energy (10 ms RMS), not by Cartesia word times (those run late)."""
import sys, json, glob, subprocess, numpy as np, soundfile as sf
ep = sys.argv[1]
d = glob.glob(f"EP{ep[2:]}_*")[0]
req = json.load(open(f"{d}/voiceover.json", encoding="utf-8"))
A = f"studio/public/audio/{ep}"
meta = json.load(open(f"{A}/vo-meta.json", encoding="utf-8"))
SR = 48000
def load(p):
    x, sr = sf.read(p, dtype="float32")
    if x.ndim > 1: x = x.mean(1)
    if sr != SR:
        n = int(len(x) * SR / sr); x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype("float32")
    return x
def edges(x, thr=0.006):
    w = int(0.01 * SR); n = len(x) // w
    rms = np.sqrt((x[: n * w].reshape(n, w) ** 2).mean(1))
    on = np.where(rms > thr)[0]
    if len(on) == 0: return 0, len(x)
    return max(0, (on[0] - 2) * w), min(len(x), (on[-1] + 4) * w)
lead, tail = req.get("lead", 0.6), req.get("tail", 4.0)
t = lead; out = []; clips = []
out.append(np.zeros(int(lead * SR), "float32"))
for L in req["lines"]:
    v = meta["voices"][L["id"]]
    x = load(v["path"]); a, b = edges(x); seg = x[a:b]; off = a / SR
    disp = L.get("display", L["text"]).split(); raw = [w["text"] for w in v["words"]]
    words = []
    for i, w in enumerate(v["words"]):
        s = max(0.0, w["start"] - off); e = max(s + 0.05, w["end"] - off)
        lab = disp[i] if len(disp) == len(raw) else w["text"]
        words.append({"w": lab, "s": round(t + s, 3), "e": round(t + min(e, len(seg) / SR), 3)})
    # tighten internal pauses: silent runs (10 ms RMS) longer than MAXP shrink to MAXP; word times shift with them
    MAXP = req.get("max_pause", 0.32); w10 = int(0.01 * SR); n = len(seg) // w10
    rms = np.sqrt((seg[: n * w10].reshape(n, w10) ** 2).mean(1)); quiet = rms < 0.006
    keep = np.ones(len(seg), bool); cuts = []; i = 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            run = (j - i) * w10
            if run > MAXP * SR:
                a2 = i * w10 + int(MAXP * SR / 2); b2 = j * w10 - int(MAXP * SR / 2)
                keep[a2:b2] = False; cuts.append((a2 / SR, (b2 - a2) / SR))
            i = j
        else: i += 1
    seg = seg[keep]
    def shift(x):
        x0 = x - t
        return t + x0 - sum(d for c, d in cuts if c < x0)
    for w in words: w["s"] = round(shift(w["s"]), 3); w["e"] = round(max(w["s"] + 0.05, shift(w["e"])), 3)
    dur = len(seg) / SR
    for w in words: w["e"] = min(w["e"], round(t + dur, 3))
    clips.append({"id": L["id"], "section": L.get("section"), "text": L.get("display", L["text"]), "start": round(t, 3), "end": round(t + dur, 3), "words": words})
    out.append(seg); gap = L.get("gap", 0.4); out.append(np.zeros(int(gap * SR), "float32")); t += dur + gap
t -= req["lines"][-1].get("gap", 0.4); voEnd = clips[-1]["end"]
total = round(voEnd + tail, 3)
y = np.concatenate(out); y = np.concatenate([y, np.zeros(max(0, int(total * SR) - len(y)), "float32")])[: int(total * SR)]
# tempo: pitch-preserving atempo so speech ends near TARGET s (max x1.15); all times scale by 1/f
TARGET = req.get("target_vo_end", 86.0)
f = min(1.15, max(1.0, voEnd / TARGET))
sf.write(f"{A}/vo-raw.wav", y[: int(voEnd * SR) + SR // 10], SR)
if f > 1.0:
    for c in clips:
        c["start"] = round(c["start"] / f, 3); c["end"] = round(c["end"] / f, 3)
        for w in c["words"]: w["s"] = round(w["s"] / f, 3); w["e"] = round(w["e"] / f, 3)
    voEnd = clips[-1]["end"]
total = round(voEnd + tail, 3)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{A}/vo-raw.wav", "-af", f"atempo={f:.4f},apad=whole_dur={total},loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "1", f"{A}/vo.wav"], check=True)
sections = {}
for c in clips: sections.setdefault(c["section"], [c["start"], c["end"]])[1] = c["end"]
json.dump({"lead": lead, "voEnd": voEnd, "total": total, "sections": sections, "clips": clips}, open(f"studio/src/scenes/{ep}/timeline.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{ep}: tempo x{f:.3f}, {len(clips)} clips, VO ends {voEnd:.2f}s, film {total:.2f}s; sections:", {k: [round(a,1), round(b,1)] for k, (a, b) in sections.items()})
