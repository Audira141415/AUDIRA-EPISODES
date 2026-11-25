"""Cap long pauses in a VO wav and remap word timestamps.
usage: python tighten_vo.py in.wav words.json out.wav outwords.json --cap 0.40 --tempo 1.03
"""
import json, re, subprocess, sys, argparse

ap = argparse.ArgumentParser()
ap.add_argument("inp"); ap.add_argument("words"); ap.add_argument("out"); ap.add_argument("outwords")
ap.add_argument("--cap", type=float, default=0.40)
ap.add_argument("--tempo", type=float, default=1.0)
a = ap.parse_args()

log = subprocess.run(["ffmpeg", "-hide_banner", "-i", a.inp, "-af", "silencedetect=n=-40dB:d=%.2f" % a.cap, "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.inp],
                           capture_output=True, text=True).stdout)
# keep segments: remove middle of each silence beyond cap (keep half cap at each side)
cuts = []
for s, e in zip(starts, ends):
    if e - s > a.cap:
        cuts.append((s + a.cap / 2, e - a.cap / 2))
keep = []
t = 0.0
for s, e in cuts:
    keep.append((t, s)); t = e
keep.append((t, dur))

def remap(x):
    removed = 0.0
    for s, e in cuts:
        if x >= e: removed += e - s
        elif x > s: removed += x - s
    return (x - removed) / a.tempo

expr = "+".join("between(t,%.4f,%.4f)" % k for k in keep)
af = "aselect='%s',asetpts=N/SR/TB" % expr
if a.tempo != 1.0:
    af += ",atempo=%.4f" % a.tempo
subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", a.inp, "-af", af, a.out], check=True)
words = json.load(open(a.words, encoding="utf-8"))
for w in words:
    w["start"] = round(remap(w["start"]), 3); w["end"] = round(remap(w["end"]), 3)
json.dump(words, open(a.outwords, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
nd = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out],
                          capture_output=True, text=True).stdout)
print("cuts", len(cuts), "dur", round(dur, 2), "->", round(nd, 2), "last word end", words[-1]["end"])
