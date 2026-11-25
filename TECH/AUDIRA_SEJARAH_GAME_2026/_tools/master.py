"""Two-pass loudness master for a rendered episode: -14 LUFS integrated, true peak <= -1.5 dBTP.

Usage: python master.py <in.mp4> <out.mp4>
Pass 1 measures, pass 2 applies a linear gain (no pumping), a limiter catches the peaks; video is copied.
"""
import json, re, subprocess, sys

src, dst = sys.argv[1], sys.argv[2]
I, TP, LRA = -14, -1.5, 11
p1 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.findall(r"\{[^{}]*\}", p1)[-1])
af = (
    f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
    f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.8:attack=2:release=60:level=disabled"
)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", dst], check=True)
p3 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", dst, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
i = re.findall(r"I:\s+(-?[\d.]+) LUFS", p3)[-1]
tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", p3)[-1]
print(f"{dst}: {i} LUFS integrated, true peak {tp} dBTP")
