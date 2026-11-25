"""Tile per-chapter draft stills into labelled contact sheets (~1200 px wide).
usage: python tile.py <out.jpg> <cols> <thumb_w> <dir1> [<dir2> ...]   (dirs hold f*.png from stills.mjs)
Prints the grid (CxR) for audit:visual.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
dirs = [Path(d) for d in sys.argv[4:]]
cells = []
for d in dirs:
    for f in sorted(d.glob("f*.png"), key=lambda p: int(p.stem[1:])):
        cells.append((d.name, f))
first = Image.open(cells[0][1])
th = round(tw * first.height / first.width)
rows = (len(cells) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), "black")
try:
    font = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", max(11, tw // 18))
except OSError:
    font = ImageFont.load_default()
g = ImageDraw.Draw(sheet)
for i, (name, f) in enumerate(cells):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im, (x, y))
    sec = int(f.stem[1:])
    g.rectangle([x, y, x + tw, y + font.size + 6], fill=(30, 27, 24))
    g.text((x + 4, y + 2), f"{name}  f{sec}", fill=(242, 201, 106), font=font)
sheet.save(out, quality=88)
print(f"{out}: {cols}x{rows} cells={len(cells)}")
