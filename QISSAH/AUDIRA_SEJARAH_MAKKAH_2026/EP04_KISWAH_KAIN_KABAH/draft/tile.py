"""Tile draft stills into contact sheets. Run from project/.
Long:   python ../draft/tile.py long   -> out/draft/<chapter>/ copies + ../draft/DRAFT_LONG_1.jpg, _2.jpg
Shorts: python ../draft/tile.py shorts -> ../draft/DRAFT_SHORTS.jpg"""
import json
import os
import shutil
import sys

from PIL import Image, ImageDraw, ImageFont

mode = sys.argv[1]
font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 14) if os.path.exists("C:/Windows/Fonts/consola.ttf") else ImageFont.load_default()


def label(im, text):
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, len(text) * 8 + 10, 20], fill=(0, 0, 0))
    d.text((5, 2), text, fill=(240, 200, 90), font=font)


if mode == "long":
    times = json.load(open("out/draft_times.json"))
    cols, tw = 5, 240
    th = int(tw * 540 / 960)
    rows = []
    for ch, ts in times.items():
        os.makedirs(f"out/draft/{ch}", exist_ok=True)
        for t in ts:
            f = f"out/draft/all/f{int(t * 30 + 0.5):04d}.png"
            shutil.copy(f, f"out/draft/{ch}/{os.path.basename(f)}")
            rows.append((ch, t, f))
    # 70 frames -> two sheets of 36/34, 4 columns
    half = 35
    for k, part in enumerate([rows[:half], rows[half:]]):
        r = (len(part) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, r * th), (12, 10, 10))
        for i, (ch, t, f) in enumerate(part):
            im = Image.open(f).convert("RGB").resize((tw, th))
            label(im, f"{ch[:3]} {t:.1f}s")
            sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
        out = f"../draft/DRAFT_LONG_{k + 1}.jpg"
        sheet.save(out, quality=86)
        print(out, sheet.size, f"grid {cols}x{r}")
else:
    cols, tw = 7, 171
    th = int(tw * 960 / 540)
    rows = []
    for sid in ("short01", "short02"):
        ts = json.load(open(f"out/draft_{sid}.json"))[:-1]  # the flat outro card is checked by eye, not audited
        for t in ts:
            rows.append((sid, t, f"out/draft/{sid}/f{int(t * 30 + 0.5):04d}.png"))
    r = (len(rows) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, r * th), (12, 10, 10))
    for i, (sid, t, f) in enumerate(rows):
        im = Image.open(f).convert("RGB").resize((tw, th))
        label(im, f"{sid[-2:]} {t:.0f}s")
        sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
    sheet.save("../draft/DRAFT_SHORTS.jpg", quality=86)
    print("../draft/DRAFT_SHORTS.jpg", sheet.size, f"grid {cols}x{r}")
