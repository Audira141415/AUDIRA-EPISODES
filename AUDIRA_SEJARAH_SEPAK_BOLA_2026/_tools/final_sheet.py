"""Frames from final MP4s into one review sheet. Usage: python _tools/final_sheet.py out.jpg EP04 EP05 ..."""
import sys, glob, subprocess, io
from PIL import Image
out, eps = sys.argv[1], sys.argv[2:]
W, H = 200, 356
rows = []
for ep in eps:
    f = glob.glob(f"{ep}_*/FINAL_VIDEO.mp4")[0]
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
    ts = [0.5, dur * 0.2, dur * 0.4, dur * 0.6, dur * 0.8, dur - 4.5, dur - 1.0]
    row = Image.new("RGB", (W * len(ts), H))
    for i, t in enumerate(ts):
        b = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", f, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
        row.paste(Image.open(io.BytesIO(b)).convert("RGB").resize((W, H)), (i * W, 0))
    rows.append(row)
sheet = Image.new("RGB", (rows[0].width, H * len(rows)))
for i, r in enumerate(rows): sheet.paste(r, (0, i * H))
sheet.save(out, quality=85); print(out, sheet.size)
