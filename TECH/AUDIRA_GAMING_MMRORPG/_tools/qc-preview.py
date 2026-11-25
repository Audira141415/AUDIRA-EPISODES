"""Measures each PREVIEW.mp4 and writes PROJECT/qc/preview.json plus a frame sheet taken from the MP4 itself. Run from AUDIRA_GAMING_MMRORPG."""
import json, re, subprocess
from pathlib import Path

run = lambda a: subprocess.run(a, capture_output=True, text=True, encoding="utf8", errors="ignore")
for d in sorted(Path(".").glob("EP0*")):
    F = d / "PREVIEW.mp4"
    if not F.exists():
        print(d.name, "MISSING")
        continue
    v = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,nb_frames:format=duration", "-of", "json", str(F)]).stdout)
    dec = run(["ffmpeg", "-v", "error", "-i", str(F), "-f", "null", "-"]).stderr.strip()
    fr = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(F), "-vf", "freezedetect=n=0.0005:d=2.5,blackdetect=d=0.3:pix_th=0.04", "-an", "-f", "null", "-"]).stderr
    eb = run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(F), "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"]).stderr
    dur = float(v["format"]["duration"])
    m = {"video": v["streams"][0], "duration": dur, "decode_errors": len(dec.splitlines()) if dec else 0, "freezes": re.findall(r"freeze_start: ([\d.]+)", fr), "black": re.findall(r"black_start:([\d.]+)", fr), "lufs": re.findall(r"I:\s+(-?[\d.]+) LUFS", eb)[-1]}
    (d / "PROJECT/qc").mkdir(parents=True, exist_ok=True)
    json.dump(m, open(d / "PROJECT/qc/preview.json", "w"), indent=1)
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(F), "-vf", f"fps=8/{dur},scale=270:-1,tile=8x1", "-frames:v", "1", str(d / "PROJECT/qc/sheet.jpg")])
    print(d.name, m)
