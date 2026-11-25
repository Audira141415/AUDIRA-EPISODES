"""Tile the per-chapter draft stills into the draft contact sheets (run from the episode folder).

DRAFT_LONG_1.jpg (c00-c05) and DRAFT_LONG_2.jpg (c06-c10): 4 columns x 300 px wide (16:9 tiles).
DRAFT_SHORTS.jpg: short01 row(s) then short02, 4 columns x 300 px wide (9:16 tiles).
Each tile gets a small label: chapter id + second of the frame.
"""
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = "project/out/draft"
FPS_LONG, FPS_SHORT = 30, 30
try:
    FONT = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 15)
except OSError:
    FONT = ImageFont.load_default()


def frames(folder, fps):
    out = []
    files = glob.glob(f"{ROOT}/{folder}/f*.png")
    num = lambda f: int(os.path.basename(f)[1:].split(".")[0])
    for f in sorted(files, key=num):
        n = num(f)
        out.append((f, f"{folder} · {n / fps:.1f}s"))
    return out


def sheet(items, tw, th, cols, path):
    rows = (len(items) + cols - 1) // cols
    img = Image.new("RGB", (cols * tw, rows * th), (20, 20, 20))
    d = ImageDraw.Draw(img)
    for i, (f, label) in enumerate(items):
        x, y = (i % cols) * tw, (i // cols) * th
        img.paste(Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS), (x, y))
        d.rectangle([x, y, x + 8 * len(label) + 8, y + 20], fill=(20, 20, 20))
        d.text((x + 4, y + 1), label, fill=(240, 220, 160), font=FONT)
    img.save(path, quality=88)
    print(path, img.size, f"grid {cols}x{rows}")


long1 = [x for c in ["c00_hook", "c01_intro", "c02_ibrahim", "c03_quraisy", "c04_hijr", "c05_zubair"] for x in frames(c, FPS_LONG)]
long2 = [x for c in ["c06_hajjaj", "c07_qaramithah", "c08_banjir", "c09_kini", "c10_payoff"] for x in frames(c, FPS_LONG)]
sheet(long1, 240, 135, 5, "draft/DRAFT_LONG_1.jpg")  # 45 frames = exact 5x9 (no blank cells for the audit)
sheet(long2, 300, 169, 4, "draft/DRAFT_LONG_2.jpg")
sheet(frames("short01", FPS_SHORT) + frames("short02", FPS_SHORT), 150, 267, 8, "draft/DRAFT_SHORTS.jpg")
