# Baked noir props for EP13 (analytic lathe + matcap, numpy). python make_props.py
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as gf, map_coordinates

D = os.path.dirname(os.path.abspath(__file__))
SS = 2
R = np.random.default_rng(7)
KEY = np.array([1.0, 0.95, 0.85])
COOL = np.array([0.72, 0.84, 1.0])


def tex(name, h, w, sc=1.0):
    a = np.asarray(Image.open(os.path.join(D, name)).convert("L"), float) - 128
    yy, xx = np.mgrid[0:h, 0:w] / sc
    return a[(yy % a.shape[0]).astype(int), (xx % a.shape[1]).astype(int)] / 128


def softbox(v, c, wd):
    return 1 / (1 + np.exp(-(v - c) / wd))


def shade(nx, ny, nz, kind, bump=None, ao=None):
    """n: x right, y up, z to viewer."""
    if bump is not None:
        gy, gx = np.gradient(bump)
        nx, ny = nx - gx, ny + gy
        l = np.sqrt(nx**2 + ny**2 + nz**2)
        nx, ny, nz = nx / l, ny / l, nz / l
    L = np.array([-0.42, 0.78, 0.46])
    L = L / np.linalg.norm(L)
    ndl = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    rx, ry, rz = 2 * nz * nx, 2 * nz * ny, 2 * nz * nz - 1
    rim = np.clip(1 - nz, 0, 1) ** 3
    rimc = rim * softbox(nx * 0.6 - ny * 0.8, 0.1, 0.12)
    if kind == "steel":
        key = softbox(ry, 0.34, 0.05) * (1 - softbox(ry, 0.93, 0.04)) * softbox(-rx, -0.75, 0.1)
        hor = np.exp(-((ry - 0.02) / 0.1) ** 2)
        gnd = softbox(-ry, 0.3, 0.14)
        v = 0.10 + 0.82 * key + 0.10 * gnd + 0.16 * np.clip(ry + 0.4, 0, 1) - 0.07 * hor
        sp = np.clip(rx * L[0] + ry * L[1] + rz * L[2], 0, 1) ** 60
        c = v[..., None] * KEY + 0.5 * sp[..., None] * KEY + 0.55 * rimc[..., None] * COOL
    elif kind == "leather":
        sp = np.clip(rx * L[0] + ry * L[1] + rz * L[2], 0, 1) ** 9
        v = 0.045 + 0.46 * ndl + 0.16 * sp
        c = v[..., None] * KEY + 0.28 * rimc[..., None] * COOL
    elif kind == "glove":
        sp = np.clip(rx * L[0] + ry * L[1] + rz * L[2], 0, 1) ** 14
        v = 0.03 + 0.30 * ndl + 0.16 * sp
        c = v[..., None] * KEY + 0.32 * rimc[..., None] * COOL
    elif kind == "wood":
        sp = np.clip(rx * L[0] + ry * L[1] + rz * L[2], 0, 1) ** 24
        v = 0.06 + 0.52 * ndl + 0.3 * sp
        c = v[..., None] * KEY + 0.3 * rimc[..., None] * COOL
    else:
        v = 0.05 + 0.8 * ndl
        c = v[..., None] * KEY
    if ao is not None:
        c = c * ao[..., None]
    return c


def save(name, c, a):
    c = np.clip(c, 0, 1) ** (1 / 1.25)
    im = Image.fromarray((np.dstack([c, np.clip(a, 0, 1)]) * 255).astype(np.uint8), "RGBA")
    im = im.resize((im.width // SS, im.height // SS), Image.LANCZOS)
    im.save(os.path.join(D, name))
    print(name, im.size)


def lathe(L, H, rf, kind, name, bumptex=None, bumpk=0, post=None, alb=None, vertical=False):
    """Lathe around the x axis: L x H px sprite, rf(x px)->radius px (both in output px)."""
    w, h = L * SS, H * SS
    x = np.arange(w) / SS
    r = np.maximum(rf(x), 0)
    dr = np.gradient(gf(r, 2 * SS), 1 / SS)
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    y = (h / 2 - yy) / SS
    rr = r[None, :] + 1e-6
    u = np.clip(y / rr, -1, 1)
    z = np.sqrt(1 - u**2)
    nx = -dr[None, :] * np.ones_like(u)
    ny, nz = u, z
    l = np.sqrt(nx**2 + ny**2 + nz**2)
    nx, ny, nz = nx / l, ny / l, nz / l
    a = np.clip((rr - np.abs(y)) * SS * 0.7 + 0.5, 0, 1) * (rr > 0.6)
    bump = None
    if bumptex:
        bump = gf(tex(bumptex, h, w, 0.8 * SS), 0.8) * bumpk
    c = shade(nx, ny, nz, kind, bump)
    if vertical:
        pass
    if alb is not None:
        c = c * alb(xx / SS, u)[..., None]
    if post:
        c, a = post(c, a, xx / SS, y, u)
    save(name, c, a)


interp = lambda xs, ys: (lambda x: np.interp(x, xs, ys))


def smooth_interp(xs, ys, s):
    def f(x):
        return gf(np.interp(x, xs, ys), s * SS)
    return f


# ---- bell guard (dome opens to the left, blade leaves to the right). 240 x 420
def guard_r(x):
    t = np.clip((x - 14) / 200, 0, 1)
    r = 196 * np.sqrt(np.clip(1 - t**2.0, 0, 1))
    r = np.where(x < 14, 200, r)  # rolled rim
    r = np.where(x < 3, 194, r)
    r = np.where((x > 206), np.maximum(r, 26), r)
    r = np.where(x > 226, 0, r)
    return r


def brushed_ring(x, u):
    return 1 + 0.10 * np.interp(np.hypot(x, 0) % 41, np.arange(41), R.standard_normal(41) * 0.6)


lathe(232, 420, guard_r, "steel", "guard.png", "brushed.jpg", 0.10, alb=brushed_ring)

# ---- grip 640 x 170: contoured handle
GX = [0, 10, 60, 130, 200, 280, 360, 440, 520, 590, 628, 640]
GY = [50, 58, 60, 52, 58, 52, 60, 54, 62, 58, 54, 50]
grip_r = smooth_interp(GX, GY, 9)


def seam(c, a, x, y, u):
    d = np.abs(y + 24 + 3 * np.sin(x / 60))
    c = c * (1 - 0.75 * np.exp(-(d / 1.6) ** 2))[..., None]
    st = (np.abs((x % 15) - 7.5) < 4.2) & (np.abs(d - 8) < 1.5)
    c = np.where(st[..., None], np.maximum(c * 2.6, 0.30), c)
    return c, a


lathe(640, 170, grip_r, "leather", "grip_leather.png", "leather.jpg", 2.4, post=seam, alb=lambda x, u: np.full_like(x, 1.25))


def grain(x, u):
    g = tex("wood.jpg", x.shape[0], x.shape[1], 0.6 * SS)
    return 0.9 + 0.5 * g


def bore(c, a, x, y, u):
    # drilled hole on the visible flank, centre x=395 y=0
    d = np.hypot(x - 395, y - 4)
    ang = np.arctan2(y - 4, x - 395)
    hole = np.clip((46 - d) * 1.2, 0, 1)
    rimr = np.exp(-(((d - 48 - 1.4 * np.sin(ang * 13)) / 3.4) ** 2))
    wall = np.clip((-(y - 4) / 46) * 0.8 + 0.1, 0, 1) * np.exp(-(((d - 40) / 12) ** 2))
    inside = 0.012 + 0.34 * wall + 0.06 * (np.sin(d * 2.2) > 0.4) * wall
    c = c * (1 - hole[..., None]) + hole[..., None] * inside[..., None] * KEY
    c = c + (rimr * (0.16 + 0.5 * np.clip(-(y - 4) / 46, 0, 1)))[..., None] * KEY
    c = c * (1 - 0.35 * np.exp(-(((d - 60) / 8) ** 2)))[..., None]
    return c, a


lathe(640, 170, lambda x: grip_r(x) - 4, "wood", "grip_bare.png", "brushed.jpg", 0.05, post=bore, alb=grain)

# ---- pommel 130 x 130, collar 60 x 150
lathe(130, 140, smooth_interp([0, 6, 40, 80, 112, 130], [0, 34, 60, 62, 46, 40], 3), "steel", "pommel.png", "brushed.jpg", 0.06)
lathe(56, 150, smooth_interp([0, 4, 20, 24, 32, 36, 52, 56], [56, 66, 66, 56, 56, 66, 66, 56], 1), "steel", "collar.png", "brushed.jpg", 0.06)

# ---- blade 1400 x 60, tapering; V groove
def blade_groove(c, a, x, y, u):
    c = c * (1 - 0.5 * np.exp(-((y + 2) / 1.8) ** 2) * (x < 1280))[..., None]
    return c, a


lathe(1400, 60, interp([0, 40, 1400], [22, 20, 9]), "steel", "blade.png", "brushed.jpg", 0.05, post=blade_groove)
# ---- tip barrel 260 x 120 (big macro): barrel, spring gap, push button
lathe(260, 130, smooth_interp([0, 6, 30, 34, 150, 156, 164, 168, 176, 250, 258, 260], [30, 46, 48, 52, 52, 48, 46, 30, 30, 30, 30, 30], 0.8), "steel", "tip_barrel.png", "brushed.jpg", 0.06)
lathe(70, 130, smooth_interp([0, 3, 12, 50, 62, 70], [44, 54, 56, 56, 48, 0], 1.4), "steel", "tip_button.png", "brushed.jpg", 0.05)
# ---- mushroom button seen from the side (axis up after rotate): 150 x 150 drawn along x, stem left
lathe(150, 150, smooth_interp([0, 4, 60, 64, 84, 130, 146, 150], [22, 24, 24, 58, 64, 62, 44, 0], 1.6), "steel", "button.png", "brushed.jpg", 0.05)


# ---- gloved finger: vertical capsule 120 x 330 (tip at the bottom)
def finger():
    w, h = 120 * SS, 330 * SS
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    x = (xx - w / 2) / SS
    y = yy / SS
    r = 50 + 5 * np.exp(-(((y - 118) / 34) ** 2)) + 3 * np.exp(-(((y - 238) / 26) ** 2)) - 0.0
    top, bot = 56, 274
    d = np.where(y < top, y - top, np.where(y > bot, y - bot, 0))
    rad = np.sqrt(x**2 + d**2)
    a = np.clip((r - rad) * SS * 0.7 + 0.5, 0, 1)
    nx = x / r
    ny = -d / r
    nz = np.sqrt(np.clip(1 - nx**2 - ny**2, 0, 1))
    # finger curls away at both ends
    ny = ny + 0.55 * (165 - y) / 165 * 0.8
    l = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-6
    crease = sum(np.exp(-(((y - c + 5 * (x / 50) ** 2) / 3.0) ** 2)) for c in (108, 122, 226, 238))
    b = gf(tex("leather.jpg", h, w, 0.55 * SS), 0.8) * 1.3 - 3.2 * gf(crease, 1.2)
    c = shade(nx / l, ny / l, nz / l, "glove", b)
    seamd = np.abs(x + 30)
    c = c * (1 - 0.5 * np.exp(-((seamd / 1.5) ** 2)))[..., None]
    save("finger.png", c, a)


finger()


# ---- lamp: glass dome 300 x 360, off / on (red)
def lamp(on, name):
    w, h = 300 * SS, 400 * SS
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    x = (xx - w / 2) / SS
    y = yy / SS
    cy, r = 150, 112
    d = np.where(y > cy, 0, y - cy)
    rad = np.sqrt(x**2 + d**2)
    a = np.clip((r - rad) * SS * 0.7, 0, 1) * (y < 285)
    nx, ny = x / r, -d / r
    nz = np.sqrt(np.clip(1 - nx**2 - ny**2, 0, 1))
    rx, ry = 2 * nz * nx, 2 * nz * ny
    hl = np.exp(-(((x + 46) / 16) ** 2 + ((y - 110) / 52) ** 2)) * 0.9 + 0.25 * np.exp(-(((x - 66) / 9) ** 2 + ((y - 170) / 70) ** 2))
    fres = (1 - nz) ** 2.4
    ribs = 0.5 + 0.5 * np.cos(x * 0.36)
    if on:
        core = np.exp(-((x / 52) ** 2 + ((y - 170) / 74) ** 2))
        c = np.dstack([0.62 + 0.5 * core + 0.1 * ribs, 0.03 + 0.95 * core**1.6, 0.05 + 0.86 * core**1.8]) + 0.25 * hl[..., None] + np.dstack([0.3 * fres, 0 * fres, 0 * fres])
    else:
        core = np.exp(-((x / 60) ** 2 + ((y - 190) / 90) ** 2))
        c = np.dstack([0.17 + 0.07 * core, 0.030 + 0.01 * core, 0.034 + 0.01 * core]) * (0.75 + 0.3 * ribs)[..., None] + hl[..., None] * KEY * 0.55 + (0.35 * fres)[..., None] * COOL * 0.7
        fil = (np.abs(y - 190 + 10 * np.sin(x / 4)) < 1.8) & (np.abs(x) < 26)
        c = np.where(fil[..., None], c + 0.25, c)
    # steel base
    bm = (y >= 270) & (y < 388)
    br = np.where(y < 292, 128, np.where(y < 300, 118, np.where(y < 372, 124, 140)))
    u = np.clip(x / br, -1, 1)
    ba = np.clip((br - np.abs(x)) * SS * 0.7, 0, 1) * bm
    bc = shade(u * 0.98, np.full_like(u, 0.15), np.sqrt(np.clip(1 - u**2, 0, 1)), "steel")
    v = 0.12 + 0.6 * np.exp(-(((u + 0.45) / 0.16) ** 2)) + 0.25 * np.exp(-(((u - 0.72) / 0.1) ** 2)) + 0.12 * np.exp(-((u / 0.5) ** 2))
    bc = v[..., None] * KEY * (1 - 0.5 * ((np.abs(y - 296) < 4) | (np.abs(y - 372) < 3)))[..., None]
    if on:
        bc = bc * 0.8 + np.dstack([0.5 * np.exp(-(y - 270) / 40), 0.03 * np.ones_like(y), 0.04 * np.ones_like(y)]) * (y > 268)[..., None]
    c = np.where(bm[..., None], bc, c)
    a = np.maximum(np.where(bm, ba, a), 0)
    save(name, c, a)


lamp(False, "lamp_off.png")
lamp(True, "lamp_on.png")


# ---- fencing mask, side view facing right, 260 x 320
def mask():
    w, h = 260 * SS, 330 * SS
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    x, y = xx / SS, yy / SS
    # shell ellipse (front) + back harness + bib
    ex, ey, ea, eb = 132, 128, 104, 118
    nx, ny = (x - ex) / ea, -(y - ey) / eb
    r2 = nx**2 + ny**2
    nz = np.sqrt(np.clip(1 - r2, 0, 1))
    a = np.clip((1 - np.sqrt(r2)) * ea * SS * 0.7, 0, 1)
    mesh_u = np.arcsin(np.clip(nx, -1, 1)) * 104
    mesh_v = np.arcsin(np.clip(ny, -1, 1)) * 118
    g = np.maximum(np.cos(mesh_u * 2 * np.pi / 7.5) ** 8, np.cos(mesh_v * 2 * np.pi / 7.5) ** 8)
    front = softbox(x, 108, 2.0)
    wire = shade(nx, ny, nz, "steel")
    face = 0.02 + wire * (0.12 + 0.75 * g[..., None])
    cloth = shade(nx, ny, nz, "cloth")
    c = face * front[..., None] + cloth * (1 - front[..., None])
    trim = np.exp(-(((x - 108) / 5) ** 2))
    c = c * (1 - trim[..., None]) + trim[..., None] * (0.12 + 0.5 * np.clip(ny, 0, 1))[..., None] * KEY
    # bib
    by = y > 205
    bx0, bx1 = 92 - (y - 205) * 0.10, 214 - (y - 205) * 0.28
    u = (x - (bx0 + bx1) / 2) / ((bx1 - bx0) / 2)
    ba = np.clip((1 - np.abs(u)) * 50 * SS, 0, 1) * by * np.clip((322 - y + 10 * u) * 2, 0, 1)
    uu = np.clip(u, -1, 1)
    bc = shade(uu * 0.95, np.full_like(uu, 0.2), np.sqrt(1 - uu**2), "cloth") * (0.55 + 0.45 * np.clip((y - 205) / 50, 0, 1))[..., None]
    under = np.where(by & (ba > 0) & (a < 0.5), 1.0, 0.0)
    c = np.where(under[..., None] > 0, bc, c)
    a = np.maximum(a, ba)
    save("mask.png", c, a)


mask()
