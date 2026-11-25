"""Builds STYLE_OPTIONS.jpg: one row per episode, main style first. Run from the series folder."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
QB = Path("F:/AUDIRA-SKILL-MOTION/references/quality-bar"); SC = Path("F:/AUDIRA-ALL-SKILL/assets/style-covers")
def cov(n):
    for d in (QB, SC):
        for e in ("png", "jpg"):
            p = d / f"{n.lower()}.{e}"
            if p.exists(): return p
    raise SystemExit("no cover " + n)
ROWS = [("EP01 Tennis for Two", ["FILMNOIR", "VINTAGEFORGE", "CIRCUITFORGE"]),
        ("EP02 Pong koin penuh", ["SATISFYFORGE", "ARCADECRT", "TOYDIORAMA"]),
        ("EP03 Combo Street Fighter II", ["TOONFORGE", "PIXELSTORY", "COMICFORGE"]),
        ("EP04 Game Boy kena bom", ["PRECISION", "THERMALFORGE", "SATELLITEBRIEFING"]),
        ("EP05 Doom vs Windows 95", ["Y2KCHROME", "DATAPHYSICAL", "RETROWAVE"])]
W, H, HEAD = 300, 533, 44
f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22); fs = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
board = Image.new("RGB", (3 * W + 40, len(ROWS) * (H + HEAD + 30) + 10), "#111")
d = ImageDraw.Draw(board); y = 10
for title, styles in ROWS:
    d.text((10, y), title, fill="#ffd34d", font=f); y += HEAD
    for i, s in enumerate(styles):
        im = Image.open(cov(s)).convert("RGB"); r = max(W / im.width, H / im.height)
        im = im.resize((int(im.width * r) + 1, int(im.height * r) + 1)); l = (im.width - W) // 2; t = (im.height - H) // 2
        x = 10 + i * (W + 10); board.paste(im.crop((l, t, l + W, t + H)), (x, y))
        lab = ("1 UTAMA: " if i == 0 else f"{i + 1}: ") + s
        d.rectangle((x, y + H - 30, x + W, y + H), fill="#000"); d.text((x + 8, y + H - 26), lab, fill="#fff", font=fs)
    y += H + 30
board.save("STYLE_OPTIONS.jpg", quality=85); print(board.size)
