"""Tile draft stills into chapter contact sheets (run from project/).

python src/scenes/haram/sheets.py long  out/draft/long  out/draft_times.txt 30 ../draft/DRAFT_LONG
python src/scenes/haram/sheets.py short out/draft/s01   "0.5s,..." 30 ../draft/DRAFT_SHORTS ...
"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONT = ImageFont.truetype("public/fonts/SpaceGrotesk-Variable.ttf", 18)


def frame_file(d, sec, fps):
    return f"{d}/f{int(sec * fps + 0.5):04d}.png"


def sheet(rows, cell_w, cols, out):
    """rows: list of (label, [paths])."""
    imgs = []
    for label, paths in rows:
        ims = [Image.open(p).convert("RGB") for p in paths]
        h = round(ims[0].height * cell_w / ims[0].width)
        n = len(ims)
        r = (n + cols - 1) // cols
        band = Image.new("RGB", (cell_w * cols, 30 + h * r), "#111114")
        ImageDraw.Draw(band).text((8, 5), label, fill="#ffd166", font=FONT)
        for i, im in enumerate(ims):
            band.paste(im.resize((cell_w, h)), ((i % cols) * cell_w, 30 + (i // cols) * h))
        imgs.append(band)
    H = sum(i.height for i in imgs)
    canvas = Image.new("RGB", (imgs[0].width, H), "#111114")
    y = 0
    for i in imgs:
        canvas.paste(i, (0, y))
        y += i.height
    canvas.save(out, quality=88)
    print(out, canvas.size)


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "long":
        d, times, fps, out = sys.argv[2], sys.argv[3], float(sys.argv[4]), sys.argv[5]
        rows = []
        for line in open(times):
            cid, ts = line.split()
            secs = [float(x.rstrip("s")) for x in ts.split(",")]
            rows.append((f"{cid}  " + "  ".join(f"{s:.1f}s" for s in secs), [frame_file(d, s, fps) for s in secs]))
        half = (len(rows) + 1) // 2
        sheet(rows[:half], 300, 4, out + "_1.jpg")
        sheet(rows[half:], 300, 4, out + "_2.jpg")
    else:
        out, fps = sys.argv[2], float(sys.argv[3])
        rows = []
        for spec in sys.argv[4:]:
            d, ts = spec.split("=")
            secs = [float(x.rstrip("s")) for x in ts.split(",")]
            rows.append((d.split("/")[-1] + "  " + "  ".join(f"{s:.1f}s" for s in secs), [frame_file(d, s, fps) for s in secs]))
        sheet(rows, 150, 8, out)
