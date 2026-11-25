"""Contact sheet of 14 frames for QC with sound off. Run: python _tools/qcsheet.py <EP folder>"""
import subprocess, sys, json
from PIL import Image
d = sys.argv[1]; T = json.load(open(f"{d}/timeline.json"))["duration"]
ts = [round(T * (i + .5) / 14, 2) for i in range(14)]
ims = []
for t in ts:
    out = f"{d}/PROJECT/qc/q{t}.jpg"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(t), "-i", f"{d}/{sys.argv[2] if len(sys.argv)>2 else "DRAFT_SILENT.mp4"}", "-frames:v", "1", "-vf", "scale=360:-1", out], check=True)
    ims.append(Image.open(out))
w, h = ims[0].size
S = Image.new("RGB", (w * 7, h * 2), "white")
for i, im in enumerate(ims): S.paste(im, ((i % 7) * w, (i // 7) * h))
S.save(f"{d}/PROJECT/qc/sheet-{(sys.argv[2] if len(sys.argv)>2 else "draft")[:5]}.jpg", quality=80); print(ts)
