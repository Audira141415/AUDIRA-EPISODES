# Seeded RGBA paper textures: alpha-only so cards keep their own colour (no blend modes needed).
import numpy as np
from PIL import Image, ImageFilter
def noise(rng, n, s):
    a = rng.random((max(2, n // s), max(2, n // s)))
    return np.asarray(Image.fromarray((a * 255).astype("uint8")).resize((n, n), Image.BICUBIC)) / 255.0
def tex(path, n, seed, fibres, flen, dark, light, coarse):
    rng = np.random.default_rng(seed)
    h = 0.45 * noise(rng, n, 2) + 0.35 * noise(rng, n, 6) + 0.2 * noise(rng, n, 40) * coarse + 0.1 * rng.random((n, n))
    im = Image.new("L", (n, n), 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(im)
    for _ in range(fibres):
        x, y, a, l = rng.random() * n, rng.random() * n, rng.random() * 6.28, flen * (0.4 + rng.random())
        b = a + (rng.random() - 0.5) * 1.2
        xm, ym = x + np.cos(a) * l * .5, y + np.sin(a) * l * .5
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                d.line([(x + ox, y + oy), (xm + ox, ym + oy), (xm + np.cos(b) * l * .5 + ox, ym + np.sin(b) * l * .5 + oy)], fill=int(90 + rng.random() * 165))
    f = np.asarray(im.filter(ImageFilter.GaussianBlur(0.6))) / 255.0
    h = h + 0.5 * f
    # emboss: light from upper-left
    e = h - np.roll(np.roll(h, 2, 0), 2, 1)
    e = e / (np.abs(e).std() * 2.2)
    e = np.clip(e, -1, 1)
    a = np.where(e < 0, -e * dark, e * light)
    mott = noise(rng, n, 160) - 0.5
    rgb = np.where((e < 0)[..., None], np.array([46, 28, 18]), np.array([255, 250, 236]))
    out = np.dstack([rgb, np.clip(a * 255 + np.maximum(0, mott) * 18, 0, 255)]).astype("uint8")
    Image.fromarray(out, "RGBA").save(path)
tex("public/tex/fibre.png", 1024, 18, 2600, 34, 0.20, 0.26, 0.6)
tex("public/tex/kraft.png", 1024, 81, 5200, 60, 0.38, 0.24, 1.0)
