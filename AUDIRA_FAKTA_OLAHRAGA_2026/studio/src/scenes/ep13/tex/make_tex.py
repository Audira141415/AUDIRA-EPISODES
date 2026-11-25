# Procedural grey textures for EP13 FILMNOIR (numpy, fixed seed). python make_tex.py
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as gf, map_coordinates

OUT = os.path.dirname(os.path.abspath(__file__))
R = np.random.default_rng(1976)


def n(h, w, s, wrap=True):
    a = gf(R.standard_normal((h, w)), s, mode="wrap" if wrap else "reflect")
    return (a - a.mean()) / (a.std() + 1e-9)


def fbm(h, w, scales, wts):
    a = sum(k * n(h, w, s) for s, k in zip(scales, wts))
    return (a - a.mean()) / a.std()


def save(name, a, q=86):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=q)


def emboss(h, k=1.0):
    gy, gx = np.gradient(h)
    return k * (-gx - 1.2 * gy)


# plaster wall
H, W = 1400, 1400
f = fbm(H, W, [90, 30, 8, 2], [1, 0.7, 0.35, 0.2])
stain = np.clip(fbm(H, W, [120, 40], [1, 0.5]) - 0.6, 0, 3)
crack = np.abs(fbm(H, W, [46, 14], [1, 0.45]))
crackm = np.clip(1 - crack / 0.018, 0, 1) * (n(H, W, 130) > 0.5)
save("plaster.jpg", 128 + 13 * f + emboss(gf(f, 1) * 10, 2.4) - 20 * stain - 60 * gf(crackm, 0.8))

# concrete / brick arena wall
bh, bw = 100, 230
yy, xx = np.mgrid[0:H, 0:W]
row = yy // bh
xo = (xx + (row % 2) * bw // 2) % W
edge = np.minimum(np.minimum(yy % bh, bh - yy % bh), np.minimum(xo % bw, bw - xo % bw)).astype(float)
brickid = (row * 37 + (xo // bw) * 91) % 17
hgt = np.clip((edge + 2 * n(H, W, 5)) / 8, 0, 1)
save("brick.jpg", 112 + brickid * 2.4 + 12 * fbm(H, W, [20, 4, 1.2], [1, 0.6, 0.5]) + emboss(gf(hgt, 1.2), 110) - 40 * (1 - hgt))

# wood table (planks run along x)
H2, W2 = 1400, 1800
yy, xx = np.mgrid[0:H2, 0:W2].astype(float)
warp = 30 * gf(R.standard_normal((H2, W2)), (40, 320), mode="wrap") * 100
g = gf(R.standard_normal((H2, W2)), (1.4, 150), mode="wrap")
g = g / g.std()
g2 = gf(R.standard_normal((H2, W2)), (6, 300), mode="wrap")
g2 = g2 / g2.std()
g = map_coordinates(g, [(yy + warp) % H2, xx], order=1, mode="wrap")
plank = (yy // 280).astype(int)
pe = np.minimum(yy % 280, 280 - yy % 280)
w = 118 + 13 * g + 12 * g2 + np.array([0, 10, -8, 6, -12, 4])[plank % 6]
scr = (n(H2, W2, 1) > 3.4) * 1.0
w += 30 * gf(scr, (0.6, 14)) * 6 - 70 * np.exp(-(pe / 3.0) ** 2)
save("wood.jpg", w)

# paper
save("paper.jpg", 205 + 5 * fbm(1200, 1200, [60, 14, 1], [1, 0.8, 1.1]) - 8 * np.clip(fbm(1200, 1200, [150, 50], [1, 0.6]) - 0.7, 0, 3) + emboss(n(1200, 1200, 1.3), 3))

# leather / chamois
c = n(1000, 1000, 5)
c2 = n(1000, 1000, 11)
cell = np.abs(c) * 0.7 + np.abs(c2) * 0.6
save("leather.jpg", 128 + emboss(gf(cell, 1.2), 70) + 9 * fbm(1000, 1000, [60, 2], [1, 0.8]) - 18 * np.exp(-((cell / 0.22) ** 2)))

# cloth weave (fencing jacket)
yy, xx = np.mgrid[0:800, 0:800]
wv = np.sin(xx * 2 * np.pi / 8) * np.cos(yy * 2 * np.pi / 8)
save("cloth.jpg", 128 + 9 * wv + 8 * fbm(800, 800, [40, 10, 1], [1, 0.6, 0.6]))

# brushed metal (streaks along x)
b = gf(R.standard_normal((1000, 1000)), (0.7, 90), mode="wrap")
save("brushed.jpg", 128 + 16 * b / b.std() + 4 * n(1000, 1000, 1))

# wet rubber/metal piste floor
save("floor.jpg", 100 + 12 * fbm(1200, 1200, [70, 18, 3], [1, 0.6, 0.4]) + 10 * gf(R.standard_normal((1200, 1200)), (1, 40), mode="wrap") / 0.05 * 0.05 + emboss(n(1200, 1200, 2), 4))

# smoke: RGBA white with alpha
s = fbm(1200, 1600, [150, 70, 30, 12], [1, 0.8, 0.45, 0.2])
a = np.clip((s + 0.2) * 0.45, 0, 1) ** 1.3 * 255
yy, xx = np.mgrid[0:1200, 0:1600]
fade = np.clip(np.minimum(yy, 1199 - yy) / 260, 0, 1) * np.clip(np.minimum(xx, 1599 - xx) / 320, 0, 1)
rgba = np.zeros((1200, 1600, 4), np.uint8)
rgba[..., :3] = (214, 220, 228)
rgba[..., 3] = (a * fade).astype(np.uint8)
Image.fromarray(rgba).resize((800, 600), Image.LANCZOS).save(os.path.join(OUT, "smoke.png"))

# grain tile
gr = gf(R.standard_normal((512, 512)), 0.7, mode="wrap")
save("grain.jpg", 128 + 34 * gr / gr.std(), 80)

# audience bokeh: dark heads rows with faint rim
H3, W3 = 700, 1800
img = np.full((H3, W3), 10.0)
yy, xx = np.mgrid[0:H3, 0:W3].astype(float)
for r in range(6):
    y0 = 90 + r * 105
    sh = 10 + r * 4
    x = -20 + R.uniform(0, 40)
    while x < W3 + 60:
        rad = 24 + r * 2.4 + R.uniform(-3, 3)
        cy = y0 + R.uniform(-10, 10)
        head = ((xx - x) / rad) ** 2 + ((yy - cy) / (rad * 1.22)) ** 2 < 1
        body = (((xx - x) / (rad * 2.0)) ** 2 + ((yy - cy - rad * 2.9) / (rad * 1.9)) ** 2) < 1
        m = head | body
        rim = np.clip((yy - (cy - rad * 1.2)) / (rad * 0.9), 0, 1)
        val = sh + 62 * (1 - rim) * R.uniform(0.5, 1.2)
        img = np.where(m, np.minimum(val, 120), img)
        x += rad * 3.1 + R.uniform(-6, 14)
save("crowd.jpg", gf(img, 2.2))
print(sorted(os.listdir(OUT)))
