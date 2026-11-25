// EP23 NASIHAT LUQMAN. SKETCHFORGE: a living pencil-sketch notebook in 3D. An open cream sketchbook lies on a warm
// wooden desk; a real graphite pencil draws every sketch line by line (the pencil tip follows the stroke being drawn),
// sketches are drawn flat on the paper and then stand up as cut-paper pop-ups, touches of watercolour bloom on key
// objects, and pages turn between scenes (a bending page sheet). In s7 a pink eraser rubs out the arrogant head and the
// strutting footprints, leaving eraser ghosts. In s8 the notebook closes on the tree; AUDIRA is debossed on the cover and
// written as a small pencil signature in the top-right corner of the right page.
// Depiction: Luqman and his son are only faceless pencil silhouettes seen from behind, sitting together (father taller,
// son smaller). Parents in s4 are two faceless silhouettes from behind. No faces, no features, no prophets, no light figure.
// World: desk y=0, right page x 0.12..6.12, z -4.2..4.2, page top y=PY. Canvas px -> world: PPU px per unit.
// Every value is a pure function of t (seek-safe); canvases are redrawn from t (cached only by a state key).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, back, canvasTex, track, stage } from "./lib3d.js";

const PW = 6, PD = 8.4, PX0 = 0.12, PY = 0.42, CW = 1024, CH = 1434, PPU = CW / PW;
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
const PAPER = "#F2E8D4", CARD = "#F5ECDA";
const C_GREEN = "#8FAF7A", C_OCHRE = "#D9A25C", C_ROSE = "#D98C7A", C_BLUE = "#8DB3C9", C_TEAL = "#7FA89A", C_TERRA = "#C98A5E", C_GOLD = "#E2B04A", C_DARK = "#3A3633";

// ---------- stroke toolkit (canvas px)
function densify(p, step = 5) {
  const out = [p[0]];
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  return out;
}
function wobble(p, amp, R) {
  if (amp <= 0) return p;
  const p1 = R() * 6.28, p2 = R() * 6.28, f1 = 0.018 + R() * 0.02, f2 = 0.06 + R() * 0.05, n = p.length;
  let s = 0;
  return p.map((q, i) => {
    if (i > 0) s += Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]);
    const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1, o = amp * (0.65 * Math.sin(s * f1 + p1) + 0.35 * Math.sin(s * f2 + p2));
    return [q[0] + nx / l * o, q[1] + ny / l * o];
  });
}
function crSeg(p0, p1, p2, p3, seg, out) {
  for (let k = 0; k < seg; k++) {
    const u = k / seg, u2 = u * u, u3 = u2 * u;
    out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
  }
}
function cr(c, seg = 10) {
  const n = c.length, out = [];
  if (n < 3) return c.map((q) => q.slice());
  for (let i = 0; i < n - 1; i++) crSeg(c[Math.max(0, i - 1)], c[i], c[i + 1], c[Math.min(n - 1, i + 2)], seg, out);
  out.push(c[n - 1].slice());
  return out;
}
function crc(c, seg = 10) {
  const n = c.length, e = [c[n - 1], ...c, c[0], c[1]], out = [];
  for (let i = 1; i <= n; i++) crSeg(e[i - 1], e[i], e[i + 1], e[i + 2], seg, out);
  out.push(out[0].slice());
  return out;
}
const ellPts = (cx, cy, rx, ry, a0 = -Math.PI / 2, sw = Math.PI * 2, n = 48, rot = 0) => {
  const out = [];
  for (let k = 0; k <= n; k++) {
    const a = a0 + sw * k / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return out;
};
function hatchSegs(poly, ang, gap, R) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const pr = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
  let v0 = Infinity, v1 = -Infinity;
  for (const p of pr) { v0 = Math.min(v0, p[1]); v1 = Math.max(v1, p[1]); }
  const segs = [];
  for (let v = v0 + gap * (0.3 + 0.4 * R()); v < v1; v += gap * (0.85 + 0.3 * R())) {
    const xs = [];
    for (let i = 0; i < pr.length; i++) {
      const a = pr[i], b = pr[(i + 1) % pr.length];
      if ((a[1] <= v && b[1] > v) || (b[1] <= v && a[1] > v)) xs.push(a[0] + (v - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      let u0 = xs[i], u1 = xs[i + 1];
      const L = u1 - u0;
      u0 += L * 0.07 * R(); u1 -= L * 0.07 * R();
      if (u1 - u0 < 5) continue;
      segs.push([[u0 * ca - v * sa, u0 * sa + v * ca], [u1 * ca - v * sa, u1 * sa + v * ca]]);
    }
  }
  return segs;
}
const toPath = (p, n) => { const P = new Path2D(); P.moveTo(p[0][0], p[0][1]); for (let i = 1; i < n; i++) P.lineTo(p[i][0], p[i][1]); return P; };

function Pad(seed) {
  const R = mulberry(seed), items = [];
  const api = {
    R, items,
    s(pts, o = {}) {
      let p = densify(pts, 5);
      p = wobble(p, o.jit ?? 1.4, R);
      const cum = [0];
      for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
      const it = { pts: p, cum, L: cum[cum.length - 1], w: o.w ?? 3.4, a: o.a ?? 0.88, col: o.col, brush: o.brush, t0: 0, t1: 0, g: [(R() - 0.5) * 3, (R() - 0.5) * 3] };
      items.push(it);
      return it;
    },
    line: (x0, y0, x1, y1, o) => api.s([[x0, y0], [x1, y1]], o),
    curve: (c, o) => api.s(cr(c), o),
    closed: (c, o) => api.s(crc(c), o),
    ell: (cx, cy, rx, ry, o = {}) => api.s(ellPts(cx, cy, rx, ry, o.a0 ?? (-Math.PI / 2 + (R() - 0.5) * 0.8), o.sw ?? Math.PI * 2.12, 48, o.rot ?? 0), o),
    hatch: (poly, ang, gap, o = {}) => hatchSegs(poly, ang, gap, R).map((sg) => api.s(sg, { w: o.w ?? 1.9, a: o.a ?? 0.55, jit: 0.5, col: o.col })),
    wash(poly, col, o = {}) {
      let cx = 0, cy = 0;
      for (const q of poly) { cx += q[0]; cy += q[1]; }
      cx /= poly.length; cy /= poly.length;
      const vars = [0, 1, 2].map((k) => { const P = new Path2D(); poly.forEach((q, i) => { const j = k === 0 ? 0 : 4 + k * 3; const x = q[0] + (R() - 0.5) * j, y = q[1] + (R() - 0.5) * j; i ? P.lineTo(x, y) : P.moveTo(x, y); }); P.closePath(); return P; });
      const it = { wash: 1, vars, c: [cx, cy], col, a: o.a ?? 0.5, t0: 0, t1: 0 };
      items.push(it);
      return it;
    },
  };
  return api;
}
// sequential timing of strokes over [t0,t1] weighted by length
function T(arr, t0, t1) {
  const L = [arr].flat(Infinity).filter((it) => it && !it.wash);
  const tot = L.reduce((s, it) => s + it.L + 26, 0) || 1, k = (t1 - t0) / tot;
  let c = t0;
  for (const it of L) { it.t0 = c + 13 * k; it.t1 = it.t0 + it.L * k; c += (it.L + 26) * k; }
  return arr;
}
const W = (it, t0, t1) => { it.t0 = t0; it.t1 = t1; return it; };
const E = (arr, e0, e1, ek = 0.85) => { [arr].flat(Infinity).forEach((it) => { if (it) { it.e0 = e0; it.e1 = e1; it.ek = ek; } }); return arr; };

const GPAT = new WeakMap();
function graphite(ctx) {
  let p = GPAT.get(ctx);
  if (!p) {
    const c = document.createElement("canvas"); c.width = c.height = 96;
    const g = c.getContext("2d"), im = g.createImageData(96, 96), R = mulberry(77);
    for (let i = 0; i < 96 * 96; i++) { const v = R(); im.data[i * 4] = 46; im.data[i * 4 + 1] = 44; im.data[i * 4 + 2] = 42; im.data[i * 4 + 3] = 255 * (0.42 + 0.58 * v * v); }
    g.putImageData(im, 0, 0);
    p = ctx.createPattern(c, "repeat"); GPAT.set(ctx, p);
  }
  return p;
}
function drawItems(ctx, items, t, mul = 1, gEnd = -1) {
  const pat = graphite(ctx);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (const it of items) {
    if (t < it.t0) {
      // faint construction lines: the opening strokes of a scene show before the pencil traces them
      if (it.t0 < gEnd && !it.wash && !it.brush) { if (!it.P) it.P = toPath(it.pts, it.pts.length); ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = it.col || pat; ctx.lineWidth = it.w * 0.8; ctx.globalAlpha = it.a * mul * 0.36; ctx.stroke(it.P); }
      continue;
    }
    const f = it.t1 > it.t0 ? clamp01((t - it.t0) / (it.t1 - it.t0)) : 1;
    let a = it.a * mul;
    if (it.e0 !== undefined) a *= 1 - it.ek * ramp(t, it.e0, it.e1);
    if (a <= 0.004) continue;
    if (it.wash) {
      const e = eout(f), g = 0.55 + 0.45 * e;
      ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = it.col;
      ctx.translate(it.c[0], it.c[1]); ctx.scale(g, g); ctx.translate(-it.c[0], -it.c[1]);
      it.vars.forEach((P, k) => { ctx.globalAlpha = a * e * (k === 0 ? 0.5 : 0.3); ctx.fill(P); });
      ctx.globalAlpha = a * e * 0.4; ctx.strokeStyle = it.col; ctx.lineWidth = 2.6; ctx.stroke(it.vars[0]);
      ctx.restore();
      continue;
    }
    ctx.globalCompositeOperation = it.brush ? "multiply" : "source-over";
    ctx.strokeStyle = it.col || pat; ctx.lineWidth = it.w; ctx.globalAlpha = a;
    let P;
    if (f >= 1) { if (!it.P) it.P = toPath(it.pts, it.pts.length); P = it.P; }
    else {
      const d = f * it.L; let i = 1;
      while (i < it.pts.length - 1 && it.cum[i] < d) i++;
      const a0 = it.pts[i - 1], b0 = it.pts[i], u = clamp01((d - it.cum[i - 1]) / Math.max(1e-6, it.cum[i] - it.cum[i - 1]));
      P = toPath(it.pts, i); P.lineTo(a0[0] + (b0[0] - a0[0]) * u, a0[1] + (b0[1] - a0[1]) * u);
    }
    ctx.stroke(P);
    if (!it.brush) { ctx.save(); ctx.translate(it.g[0], it.g[1]); ctx.globalAlpha = a * 0.38; ctx.lineWidth = it.w * 0.55; ctx.stroke(P); ctx.restore(); }
  }
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
}
function ptAt(it, f) {
  const d = clamp01(f) * it.L; let i = 1;
  while (i < it.pts.length - 1 && it.cum[i] < d) i++;
  const a = it.pts[i - 1], b = it.pts[i], u = clamp01((d - it.cum[i - 1]) / Math.max(1e-6, it.cum[i] - it.cum[i - 1]));
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}
function stateKey(items, t) {
  let n = 0, act = false;
  for (const it of items) {
    if (t >= it.t0) { n++; if (t < it.t1) act = true; }
    if (it.e0 !== undefined) { if (t > it.e0 && t < it.e1) act = true; else if (t >= it.e1) n += 1000; }
  }
  return act ? "t" + t.toFixed(4) : "n" + n;
}

// ---------- drawing library (all in canvas px of the surface they are drawn on)
function tree(P, cx, by, s) {
  const out = [];
  out.push(P.curve([[cx - 36 * s, by], [cx - 25 * s, by - 90 * s], [cx - 20 * s, by - 180 * s], [cx - 34 * s, by - 250 * s]], { w: 3.8 }));
  out.push(P.curve([[cx + 40 * s, by], [cx + 24 * s, by - 100 * s], [cx + 21 * s, by - 185 * s], [cx + 38 * s, by - 248 * s]], { w: 3.8 }));
  out.push(P.curve([[cx - 80 * s, by + 2], [cx - 44 * s, by - 8 * s], [cx - 33 * s, by - 34 * s]], { w: 3 }));
  out.push(P.curve([[cx + 84 * s, by + 2], [cx + 46 * s, by - 8 * s], [cx + 34 * s, by - 34 * s]], { w: 3 }));
  for (const [dx, h, ex, ey] of [[-1, 225, -150, -330], [1, 215, 150, -320], [-1, 245, -70, -400], [1, 245, 80, -410], [0, 250, 5, -440]]) {
    out.push(P.curve([[cx + dx * 22 * s, by - h * s], [cx + (dx * 50 + ex * 0.3) * s, by + (ey * 0.85) * s], [cx + ex * s, by + ey * s]], { w: 2.8 }));
  }
  const cy = by - 375 * s, ph = P.R() * 6;
  const canopy = [];
  for (let k = 0; k < 26; k++) {
    const a = (k / 26) * Math.PI * 2, r = 0.9 + 0.1 * Math.abs(Math.sin(a * 6.5 + ph));
    canopy.push([cx + Math.cos(a) * 300 * s * r, cy + Math.sin(a) * 205 * s * r * (Math.sin(a) > 0 ? 0.85 : 1)]);
  }
  out.push(P.closed(canopy, { w: 3.4 }));
  const bark = [[cx - 30 * s, by], [cx - 21 * s, by - 180 * s], [cx + 22 * s, by - 185 * s], [cx + 36 * s, by]];
  out.push(P.hatch(bark, 1.45, 11 * s, { w: 1.7, a: 0.5 }));
  const shade = canopy.filter((q) => q[1] > cy - 30 * s || q[0] > cx + 120 * s);
  if (shade.length > 3) out.push(P.hatch(shade, 0.78, 13 * s, { w: 1.8, a: 0.42 }));
  for (let k = 0; k < 12; k++) {
    const a = P.R() * 6.28, r = Math.sqrt(P.R()) * 0.75, x = cx + Math.cos(a) * 260 * s * r, y = cy + Math.sin(a) * 170 * s * r;
    out.push(P.curve([[x - 14 * s, y], [x, y - 9 * s], [x + 14 * s, y]], { w: 2.2, a: 0.6 }));
  }
  return { out, canopy, bark };
}
function person(P, x, base, H, o = {}) {
  const out = [], Wd = H * 0.66, r = H * 0.2, sh = base - H, lean = o.lean || 0;
  const robe = [[x - Wd * 0.56, base], [x - Wd * 0.52, base - H * 0.42], [x - Wd * 0.45, base - H * 0.8], [x - Wd * 0.24, sh], [x + Wd * 0.24, sh], [x + Wd * 0.45, base - H * 0.8], [x + Wd * 0.52, base - H * 0.42], [x + Wd * 0.56, base]];
  out.push(P.curve(robe, { w: 3.4 }));
  out.push(P.line(robe[0][0], base, robe[7][0], base, { w: 2.6 }));
  const hx = x + lean, hy = sh - r * 0.95;
  out.push(P.line(x - r * 0.42, sh + 2, hx - r * 0.38, hy + r * 0.8, { w: 2.6 }));
  out.push(P.line(x + r * 0.42, sh + 2, hx + r * 0.38, hy + r * 0.8, { w: 2.6 }));
  out.push(P.ell(hx, hy, r * 0.88, r, { w: 3.2 }));
  const top = ellPts(hx, hy, r * 0.84, r * 0.95, Math.PI, Math.PI, 16);
  if (o.cap) { out.push(P.curve([[hx - r * 0.92, hy - r * 0.05], [hx, hy + r * 0.12], [hx + r * 0.92, hy - r * 0.05]], { w: 2.8 })); out.push(P.hatch(top, 0.5, 6.5, { w: 1.6, a: 0.6 })); }
  else out.push(P.hatch(ellPts(hx, hy, r * 0.8, r * 0.9, Math.PI * 0.95, Math.PI * 1.1, 16), 1.2, 6, { w: 1.5, a: 0.55 }));
  out.push(P.hatch(robe, 1.15, H * 0.07, { w: 1.6, a: 0.38 }));
  out.push(P.curve([[x - Wd * 0.1, sh + H * 0.12], [x - Wd * 0.14, base - H * 0.4], [x - Wd * 0.18, base - 4]], { w: 1.8, a: 0.55 }));
  out.push(P.curve([[x + Wd * 0.12, sh + H * 0.15], [x + Wd * 0.15, base - H * 0.45], [x + Wd * 0.2, base - 4]], { w: 1.8, a: 0.55 }));
  return { out, robe, head: [hx, hy, r], sh: [[x - Wd * 0.3, sh + 6], [x + Wd * 0.3, sh + 6]] };
}
function rock(P, cx, by, w, h) {
  const top = [[cx - w / 2, by], [cx - w * 0.44, by - h * 0.55], [cx - w * 0.22, by - h * 0.92], [cx + w * 0.08, by - h], [cx + w * 0.34, by - h * 0.8], [cx + w * 0.48, by - h * 0.35], [cx + w / 2, by]];
  const out = [P.curve(top, { w: 3.2 }), P.line(cx - w / 2 - 8, by, cx + w / 2 + 8, by, { w: 2.4 })];
  const sh = [[cx + w * 0.05, by], [cx + w * 0.3, by - h * 0.78], [cx + w * 0.48, by - h * 0.35], [cx + w / 2, by]];
  out.push(P.hatch(sh, 0.9, 7, { w: 1.7, a: 0.5 }));
  return { out, poly: top };
}
function sitters(P, cx, by, s) {
  const rk = rock(P, cx, by, 330 * s, 64 * s);
  const fa = person(P, cx + 58 * s, by - 52 * s, 168 * s, { cap: true, lean: -4 * s });
  const so = person(P, cx - 92 * s, by - 46 * s, 112 * s, { lean: 7 * s });
  const arm = P.curve([[cx + 58 * s - 50 * s, by - 52 * s - 150 * s], [cx - 20 * s, by - 52 * s - 140 * s], [cx - 70 * s, by - 46 * s - 104 * s]], { w: 3 });
  return { out: [rk.out, fa.out, so.out, arm], fa, so, rock: rk };
}
function footprint(P, x, y, sc, rot) {
  const pts = [[0, -34], [11, -26], [13, -6], [9, 14], [8, 30], [0, 37], [-8, 30], [-9, 12], [-12, -8], [-10, -28]].map(([a, b]) => [x + (a * Math.cos(rot) - b * Math.sin(rot)) * sc, y + (a * Math.sin(rot) + b * Math.cos(rot)) * sc]);
  return [P.closed(pts, { w: 2.6 }), P.hatch(pts, 0.6, 5.5, { w: 1.3, a: 0.45 })];
}
function seed(P, x, y, r, gold = true) {
  const out = [P.ell(x, y, r, r * 0.86, { w: 2.6 })];
  const w = gold ? P.wash(ellPts(x, y, r * 2.4, r * 2.2, 0, Math.PI * 2, 24), C_GOLD, { a: 0.75 }) : null;
  return { out, w };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x4a3324, exp: 1.0, bloom: [0.08, 0.4, 0.97], fov: 38, shadow: true });
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  cam.near = 0.05; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const mkc = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const fontOK = () => { try { return document.fonts && document.fonts.check("700 34px Kalam"); } catch (e) { return false; } };

  // ---------- lights
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x5a3c28, 1.05));
  const key = new THREE.DirectionalLight(0xffe2b8, 2.3);
  key.position.set(-7, 15, 6); key.target.position.set(2, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(0xbfd2ff, 0.35); fill.position.set(9, 6, 10); scene.add(fill);

  // ---------- desk
  const wood = canvasTex(1024, 1024, (x, w, h) => {
    x.fillStyle = "#6c4a30"; x.fillRect(0, 0, w, h);
    const R = mulberry(9);
    for (let i = 0; i < 260; i++) {
      const y0 = R() * h, a = 0.04 + R() * 0.08, d = R() < 0.5;
      x.strokeStyle = d ? `rgba(40,24,14,${a})` : `rgba(160,110,70,${a})`; x.lineWidth = 1 + R() * 3;
      x.beginPath(); for (let k = 0; k <= 64; k++) { const xx = k / 64 * w; x.lineTo(xx, y0 + Math.sin(xx * 0.012 + i) * 6 + Math.sin(xx * 0.05 + i * 2) * 2); } x.stroke();
    }
  }, [5, 5]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.7 }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  // ---------- paper bases
  function paperBase(gutterLeft) {
    const c = mkc(CW, CH), x = c.getContext("2d"), R = mulberry(gutterLeft ? 31 : 32);
    x.fillStyle = PAPER; x.fillRect(0, 0, CW, CH);
    for (let i = 0; i < 5000; i++) { x.fillStyle = R() < 0.5 ? `rgba(120,95,60,${0.03 + R() * 0.05})` : `rgba(255,255,250,${0.05 + R() * 0.08})`; const px = R() * CW, py = R() * CH; x.fillRect(px, py, 1 + R() * 2.5, 1); }
    for (let i = 0; i < 5; i++) { x.save(); x.translate(R() * CW, R() * CH); x.rotate(R() * 3); x.fillStyle = "rgba(110,105,100,0.04)"; x.beginPath(); x.ellipse(0, 0, 40 + R() * 70, 10 + R() * 18, 0, 0, 7); x.fill(); x.restore(); }
    const g = x.createLinearGradient(gutterLeft ? 0 : CW, 0, gutterLeft ? 110 : CW - 110, 0);
    g.addColorStop(0, "rgba(90,60,30,0.28)"); g.addColorStop(1, "rgba(90,60,30,0)"); x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    const v = x.createRadialGradient(CW / 2, CH / 2, CH * 0.35, CW / 2, CH / 2, CH * 0.75);
    v.addColorStop(0, "rgba(120,90,50,0)"); v.addColorStop(1, "rgba(120,90,50,0.12)"); x.fillStyle = v; x.fillRect(0, 0, CW, CH);
    return c;
  }
  const BASE_R = paperBase(true), BASE_L = paperBase(false);
  function signature(x) {
    x.save(); x.translate(986, 82); x.rotate(-0.07);
    x.font = `700 40px ${fontOK() ? "Kalam" : "cursive"}`; x.textAlign = "right"; x.fillStyle = "rgba(48,45,42,0.78)"; x.fillText("AUDIRA", 0, 0);
    x.strokeStyle = "rgba(48,45,42,0.6)"; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-150, 12); x.quadraticCurveTo(-70, 22, 6, 6); x.stroke();
    x.restore();
  }

  // ---------- scenes
  const FLIP = 0.5;
  const SC = [];
  const mkScene = (id, F, seed) => { const s = { id, F, Fe: F + FLIP, P: Pad(seed), pops: [] }; SC.push(s); return s; };
  const mkPop = (s, o) => { const p = { ...o, P: Pad(o.seed), sc: s }; p.cw = Math.round(o.w * PPU); p.ch = Math.round(o.h * PPU); s.pops.push(p); return p; };

  // s1: father and son under a tree
  const S1 = mkScene("s1", -10, 101);
  const tBerharga = A("s1:berharga"), tRaja = A("s1:raja"), tPang = A("s1:panglima"), tBijak = A("s1:bijak");
  const p1T = mkPop(S1, { id: "tree1", seed: 111, w: 4.4, h: 3.9, cx: 3.12, hz: 0.2, r0: tBerharga - 0.2, r1: tBerharga + 0.75 });
  {
    const P = p1T.P, tr = tree(P, p1T.cw / 2, p1T.ch - 14, 1);
    T(tr.out, 0.15, tBerharga - 0.3);
    W(P.wash(tr.canopy, C_GREEN, { a: 0.62 }), tBerharga - 0.1, tBerharga + 1.2);
    W(P.wash(tr.bark, C_TERRA, { a: 0.5 }), tBerharga + 0.3, tBerharga + 1.3);
    p1T.shape = [[0, p1T.ch], ...tr.canopy.map((q) => [q[0], q[1]]).filter((q) => q[1] < p1T.ch - 260), [p1T.cw, p1T.ch]];
    const cs = tr.canopy, cx = p1T.cw / 2, cy = p1T.ch - 14 - 375;
    p1T.shape = crc(Array.from({ length: 26 }, (_, k) => { const a = Math.PI / 2 + 0.3 + k / 25 * (Math.PI * 2 - 0.6); return [cx + Math.cos(a) * 336, cy + Math.sin(a) * 236]; }).concat([[cx + 60, cy + 250], [cx + 120, p1T.ch], [cx - 120, p1T.ch], [cx - 60, cy + 250]]), 3);
    void cs;
  }
  const p1S = mkPop(S1, { id: "sit1", seed: 112, w: 2.7, h: 1.8, cx: 3.12, hz: 2.3, r0: A("s1:diabadikan") + 2.2, r1: A("s1:diabadikan") + 2.9 });
  {
    const P = p1S.P, st = sitters(P, p1S.cw / 2, p1S.ch - 10, 1.0);
    T(st.out, tBerharga + 0.75, p1S.r0 - 0.1);
    W(P.wash(st.fa.robe, C_OCHRE, { a: 0.38 }), tBijak - 0.2, tBijak + 0.9);
    W(P.wash(st.so.robe, C_BLUE, { a: 0.42 }), tBijak, tBijak + 1.0);
  }
  {
    const P = S1.P, out = [];
    out.push(P.curve([[40, 770], [300, 760], [560, 772], [800, 764], [990, 770]], { w: 2.6 }));
    for (let k = 0; k < 16; k++) { const x = 60 + k * 60 + P.R() * 20, y = 1160 + P.R() * 180; if (Math.abs(x - 512) < 140 && y < 1180) continue; out.push(P.curve([[x - 10, y], [x - 4, y - 18], [x, y - 26]], { w: 2, a: 0.6 })); out.push(P.curve([[x + 2, y], [x + 8, y - 16], [x + 16, y - 22]], { w: 2, a: 0.6 })); }
    T(out, tBerharga + 0.2, tBerharga + 0.75);
    // crown (raja) and helmet (panglima), each struck through
    const cr1 = [[290, 1330], [280, 1230], [330, 1275], [370, 1205], [410, 1275], [460, 1230], [450, 1330]];
    const crown = [P.curve(cr1, { w: 3 }), P.line(288, 1330, 452, 1330, { w: 3 }), P.line(292, 1305, 448, 1305, { w: 2 }), P.ell(370, 1200, 9, 9, { w: 2 })];
    T(crown, tRaja - 0.25, tRaja + 0.35);
    T([P.line(265, 1190, 480, 1345, { w: 4.2 }), P.line(475, 1195, 270, 1340, { w: 4.2 })], tRaja + 0.38, tRaja + 0.6);
    const hm = [P.curve([[650, 1330], [645, 1260], [700, 1210], [760, 1205], [815, 1255], [815, 1330]], { w: 3 }), P.line(645, 1330, 820, 1330, { w: 3 }), P.line(732, 1250, 732, 1330, { w: 3 }), P.curve([[760, 1205], [790, 1160], [840, 1150]], { w: 2.6 })];
    T(hm, tPang - 0.25, tPang + 0.35);
    T([P.line(622, 1180, 850, 1350, { w: 4.2 }), P.line(845, 1180, 628, 1352, { w: 4.2 })], tPang + 0.38, tPang + 0.62);
  }

  // s2: hikmah lamp + gratitude
  const S2 = mkScene("s2", K.s2 - 0.3, 201);
  const tHik = A("s2:hikmah"), tHik2 = A("s2:hikmah#2"), tSyk = A("s2:bersyukurlah");
  const p2L = mkPop(S2, { id: "lamp", seed: 211, w: 3.2, h: 2.5, cx: 3.12, hz: 0.6, r0: tHik - 0.35, r1: tHik + 0.4 });
  {
    const P = p2L.P, cx = p2L.cw / 2 - 30, by = p2L.ch - 30;
    const body = [[cx - 170, by - 40], [cx - 140, by - 100], [cx - 30, by - 128], [cx + 100, by - 108], [cx + 200, by - 92], [cx + 228, by - 78], [cx + 200, by - 60], [cx + 110, by - 30], [cx - 30, by - 8], [cx - 140, by - 14]];
    const flame = [[cx + 214, by - 92], [cx + 196, by - 150], [cx + 216, by - 240], [cx + 238, by - 150]];
    const out = [P.closed(body, { w: 3.6 }), P.ell(cx - 30, by - 4, 70, 12, { w: 2.6 }), P.ell(cx - 30, by - 116, 46, 13, { w: 2.8 }),
      P.curve([[cx - 150, by - 90], [cx - 220, by - 120], [cx - 236, by - 64], [cx - 162, by - 34]], { w: 3.2 }),
      P.hatch(body.slice(5).concat([[cx - 140, by - 50]]), 0.7, 9, { w: 1.6, a: 0.45 })];
    T(out, S2.Fe + 0.05, tHik - 0.4);
    T([P.closed(flame, { w: 2.8 }), P.closed([[cx + 216, by - 108], [cx + 208, by - 140], [cx + 217, by - 182], [cx + 226, by - 140]], { w: 2 })], tHik - 0.1, tHik + 0.25);
    W(P.wash(ellPts(cx + 216, by - 150, 150, 140, 0, Math.PI * 2, 28), "#F2CC72", { a: 0.42 }), tHik, tHik + 1.2);
    W(P.wash(flame, "#E58A3C", { a: 0.8 }), tHik + 0.1, tHik + 0.6);
    W(P.wash(body, C_TERRA, { a: 0.5 }), tHik + 0.3, tHik + 1.3);
    const rays = [];
    for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.9 / 8 + 0.05; rays.push(P.line(cx + 216 + Math.cos(a) * 120, by - 160 + Math.sin(a) * 110, cx + 216 + Math.cos(a) * 175, by - 160 + Math.sin(a) * 160, { w: 2.4, a: 0.7 })); }
    T(rays, tHik2 - 0.1, tHik2 + 1.0);
    p2L.shape = crc([[16, p2L.ch], [10, 150], [140, 70], [cx + 216, 30], [p2L.cw - 14, 110], [p2L.cw - 10, p2L.ch]], 6);
  }
  {
    const P = S2.P, out = [], tw = (tSyk + 1.7 - tSyk) / 4;
    // sun
    const sun = [P.ell(190, 1040, 62, 62, { w: 3 })];
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; sun.push(P.line(190 + Math.cos(a) * 82, 1040 + Math.sin(a) * 82, 190 + Math.cos(a) * 118, 1040 + Math.sin(a) * 118, { w: 2.6 })); }
    T(sun, tSyk - 0.25, tSyk - 0.25 + tw); W(P.wash(ellPts(190, 1040, 70, 70, 0, 7, 24), C_OCHRE, { a: 0.6 }), tSyk, tSyk + 0.8);
    // rain cloud
    const cl = [[380, 1220], [390, 1170], [440, 1150], [480, 1110], [550, 1120], [585, 1160], [625, 1170], [630, 1220]];
    const rain = [P.curve(cl, { w: 3 }), P.line(380, 1222, 630, 1222, { w: 2.4 })];
    for (let k = 0; k < 5; k++) rain.push(P.line(410 + k * 48, 1250, 398 + k * 48, 1290, { w: 2.6 }));
    T(rain, tSyk - 0.25 + tw, tSyk - 0.25 + 2 * tw); W(P.wash(cl, C_BLUE, { a: 0.55 }), tSyk + tw, tSyk + tw + 0.8);
    // wheat
    const wh = [P.curve([[820, 1340], [812, 1200], [830, 1060]], { w: 3 })];
    for (let k = 0; k < 6; k++) { const y = 1080 + k * 30, sd = k % 2 ? 1 : -1; wh.push(P.ell(826 + sd * 18, y, 14, 22, { w: 2.3, rot: sd * 0.5 })); }
    wh.push(P.curve([[814, 1250], [770, 1220], [748, 1170]], { w: 2.4 }));
    T(wh, tSyk - 0.25 + 2 * tw, tSyk - 0.25 + 3 * tw); W(P.wash(ellPts(826, 1150, 40, 95, 0, 7, 20), C_OCHRE, { a: 0.5 }), tSyk + 2 * tw, tSyk + 2 * tw + 0.8);
    // water cup
    const cup = [[150, 1240], [175, 1380], [265, 1380], [290, 1240]];
    const cu = [P.curve(cup, { w: 3 }), P.ell(220, 1240, 70, 14, { w: 2.6 }), P.curve([[180, 1290], [205, 1282], [230, 1292], [258, 1284]], { w: 2, a: 0.6 })];
    T(cu, tSyk - 0.25 + 3 * tw, tSyk - 0.25 + 4 * tw); W(P.wash(cup, C_BLUE, { a: 0.45 }), tSyk + 3 * tw, tSyk + 3 * tw + 0.8);
    void out;
  }

  // s3: deep roots = foundation; father and son; the crack of zulm
  const S3 = mkScene("s3", K.s3 - 0.3, 301);
  const tFond = A("s3:fondasi"), tWahai3 = A("s3:Wahai"), tSes = A("s3:Sesungguhnya"), tZal = A("s3:kezaliman");
  const p3T = mkPop(S3, { id: "olive", seed: 311, w: 3.6, h: 3.6, cx: 3.0, hz: -0.6, r0: tFond - 0.15, r1: tFond + 0.6 });
  {
    const P = p3T.P, cx = p3T.cw / 2, by = p3T.ch - 8;
    const out = [P.curve([[cx - 60, by], [cx - 30, by - 90], [cx - 52, by - 170], [cx - 18, by - 260], [cx - 30, by - 330]], { w: 4 }),
      P.curve([[cx + 66, by], [cx + 40, by - 80], [cx + 52, by - 180], [cx + 26, by - 260], [cx + 34, by - 320]], { w: 4 }),
      P.curve([[cx - 10, by - 40], [cx + 18, by - 140], [cx - 6, by - 230]], { w: 2, a: 0.6 }), P.ell(cx + 6, by - 170, 14, 22, { w: 2.2 })];
    const clumps = [[cx - 150, by - 400, 130, 90], [cx + 140, by - 410, 140, 92], [cx, by - 500, 160, 100]];
    const cps = clumps.map(([x, y, rx, ry]) => Array.from({ length: 18 }, (_, k) => { const a = k / 18 * Math.PI * 2, rr = 0.9 + 0.1 * Math.abs(Math.sin(a * 5 + x)); return [x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr]; }));
    cps.forEach((c) => { out.push(P.closed(c, { w: 3.2 })); out.push(P.hatch(c.filter((q) => q[1] > c.reduce((s, z) => s + z[1], 0) / c.length - 10), 0.8, 12, { w: 1.6, a: 0.4 })); });
    T(out, S3.Fe + 0.05, tFond - 0.25);
    cps.forEach((c, i) => W(P.wash(c, i === 2 ? "#9FB88A" : C_GREEN, { a: 0.6 }), tFond + 0.2 + i * 0.15, tFond + 1.2 + i * 0.15));
    W(P.wash([[cx - 60, by], [cx - 50, by - 300], [cx + 40, by - 300], [cx + 66, by]], C_TERRA, { a: 0.45 }), tFond + 0.5, tFond + 1.4);
    p3T.shape = crc([[cx - 120, p3T.ch], [cx - 140, by - 300], [20, by - 400], [cx - 140, by - 560], [cx, by - 610], [cx + 160, by - 560], [p3T.cw - 20, by - 410], [cx + 150, by - 300], [cx + 120, p3T.ch]], 6);
  }
  {
    const P = S3.P, bx = (3.0 - PX0) * PPU, bz = (-0.6 + PD / 2) * PPU, roots = [], brush = [];
    const grow = (x, y, a, len, d) => {
      const pts = [[x, y]]; let px = x, py = y, aa = a;
      for (let k = 0; k < 6; k++) { aa += (P.R() - 0.5) * 0.5; px += Math.cos(aa) * len / 6; py += Math.sin(aa) * len / 6; pts.push([px, py]); }
      roots.push(P.curve(pts, { w: Math.max(1.8, 4.2 - d * 1.1) }));
      if (d === 0) brush.push(P.s(cr(pts), { brush: 1, col: C_OCHRE, w: 24, a: 0.32, jit: 2 }));
      if (d < 2) for (const s of [-1, 1]) { const j = 2 + Math.floor(P.R() * 3); grow(pts[j][0], pts[j][1], aa + s * (0.5 + P.R() * 0.4), len * 0.5, d + 1); }
    };
    for (let k = 0; k < 6; k++) grow(bx + (k - 2.5) * 22, bz + 6, Math.PI * (0.12 + k * 0.152), 300 + P.R() * 120, 0);
    T(roots, tFond + 0.35, tWahai3 - 0.25);
    brush.forEach((b, i) => W(b, tFond + 0.8 + i * 0.12, tFond + 1.6 + i * 0.12));
    // the crack: heavy dark jagged line with hatched shadow
    const ck = [[70, 1180], [140, 1210], [175, 1190], [240, 1250], [300, 1236], [350, 1290], [420, 1300], [470, 1350]];
    const crack = [P.s(ck, { w: 5.2, jit: 0.4 }), P.s([[240, 1250], [250, 1310], [230, 1360]], { w: 3.6, jit: 0.4 }), P.s([[350, 1290], [380, 1250], [430, 1230]], { w: 3.6, jit: 0.4 })];
    T(crack, tSes + 0.4, tZal);
    const band = ck.map((q) => [q[0], q[1] - 26]).concat(ck.slice().reverse().map((q) => [q[0], q[1] + 22]));
    T(P.hatch(band, 0.95, 5, { w: 2, a: 0.75 }), tZal, tZal + 0.9);
    W(P.s(ck, { brush: 1, col: C_DARK, w: 44, a: 0.28, jit: 3 }), tZal + 0.2, tZal + 1.1);
  }
  const p3S = mkPop(S3, { id: "sit3", seed: 312, w: 2.3, h: 1.55, cx: 4.65, hz: 2.6, r0: tWahai3 + 1.2, r1: tWahai3 + 1.85 });
  {
    const P = p3S.P, st = sitters(P, p3S.cw / 2, p3S.ch - 8, 0.85);
    T(st.out, tWahai3 - 0.15, p3S.r0 - 0.1);
    W(P.wash(st.so.robe, C_BLUE, { a: 0.4 }), p3S.r1, p3S.r1 + 0.8);
    W(P.wash(st.fa.robe, C_OCHRE, { a: 0.36 }), p3S.r1 + 0.2, p3S.r1 + 1.0);
  }

  // s4: mother motif: cradle, weakness upon weakness, weaning bowl, two years, both parents
  const S4 = mkScene("s4", K.s4 - 0.3, 401);
  const tIbu = A("s4:ibu"), tLemah = A("s4:lemah"), tSapih = A("s4:menyapih"), tDua = A("s4:dua"), tSyk4 = A("s4:Bersyukurlah"), tKedua = A("s4:kedua");
  const p4C = mkPop(S4, { id: "cradle", seed: 411, w: 2.5, h: 1.85, cx: 1.75, hz: 1.0, r0: tIbu - 0.15, r1: tIbu + 0.5 });
  {
    const P = p4C.P, cx = p4C.cw / 2, by = p4C.ch - 12;
    const bask = [[cx - 170, by - 150], [cx - 150, by - 60], [cx - 60, by - 30], [cx + 60, by - 30], [cx + 150, by - 60], [cx + 170, by - 150]];
    const out = [P.curve([[cx - 200, by - 40], [cx - 90, by + 2], [cx + 90, by + 2], [cx + 200, by - 40]], { w: 3.4 }),
      P.line(cx - 110, by - 4, cx - 90, by - 40, { w: 2.6 }), P.line(cx + 110, by - 4, cx + 90, by - 40, { w: 2.6 }),
      P.curve(bask, { w: 3.4 }), P.line(cx - 172, by - 150, cx + 172, by - 150, { w: 2.6 }),
      P.curve([[cx - 170, by - 150], [cx - 160, by - 230], [cx - 90, by - 262], [cx - 30, by - 245], [cx - 10, by - 152]], { w: 3.2 }),
      P.curve([[cx - 10, by - 150], [cx + 40, by - 176], [cx + 100, by - 160], [cx + 165, by - 172]], { w: 2.8 })];
    out.push(P.hatch(bask, 0.75, 14, { w: 1.6, a: 0.4 }), P.hatch(bask, -0.75, 14, { w: 1.6, a: 0.35 }));
    T(out, A("s4:Allah") + 0.1, tIbu - 0.25);
    W(P.wash([[cx - 10, by - 150], [cx + 40, by - 180], [cx + 160, by - 175], [cx + 160, by - 120], [cx - 10, by - 120]], C_ROSE, { a: 0.7 }), tIbu + 0.2, tIbu + 1.1);
    W(P.wash(bask, C_OCHRE, { a: 0.35 }), tIbu + 0.4, tIbu + 1.3);
    p4C.shape = crc([[10, p4C.ch], [8, by - 150], [cx - 150, by - 280], [cx - 40, by - 285], [p4C.cw - 10, by - 200], [p4C.cw - 6, p4C.ch]], 6);
  }
  const p4B = mkPop(S4, { id: "bowl", seed: 412, w: 2.1, h: 1.5, cx: 4.65, hz: 1.6, r0: tSapih + 0.15, r1: tSapih + 0.75 });
  {
    const P = p4B.P, cx = p4B.cw / 2, by = p4B.ch - 12;
    const bowl = [[cx - 150, by - 140], [cx - 120, by - 50], [cx - 40, by - 18], [cx + 40, by - 18], [cx + 120, by - 50], [cx + 150, by - 140]];
    const out = [P.ell(cx, by - 140, 150, 30, { w: 3.2 }), P.curve(bowl, { w: 3.4 }), P.ell(cx, by - 10, 56, 10, { w: 2.4 }),
      P.ell(cx + 70, by - 196, 34, 20, { w: 2.6, rot: -0.5 }), P.line(cx + 40, by - 176, cx - 70, by - 110, { w: 3 }),
      P.hatch(bowl, 1.0, 10, { w: 1.6, a: 0.4 })];
    T(out, tSapih - 0.55, tSapih + 0.1);
    W(P.wash(bowl, C_OCHRE, { a: 0.6 }), tSapih + 0.5, tSapih + 1.3);
    p4B.shape = crc([[8, p4B.ch], [8, by - 190], [cx + 40, by - 240], [p4B.cw - 8, by - 230], [p4B.cw - 8, p4B.ch]], 6);
  }
  {
    const P = S4.P, out = [];
    for (let k = 0; k < 4; k++) {
      const y = 940 + k * 34, pts = [];
      for (let i = 0; i <= 20; i++) pts.push([80 + i * 23, y + Math.sin(i * 0.9 + k) * (8 + k * 3)]);
      out.push(P.s(pts, { w: 2.2 + k * 0.9, a: 0.55 + k * 0.12, jit: 0.6 }));
    }
    T(out, tLemah - 0.05, tLemah + 1.2);
    // path from cradle to bowl with two loops (two years)
    const path = cr([[330, 1130], [440, 1190], [560, 1180], [680, 1110], [760, 1060]], 16), dash = [];
    for (let i = 0; i + 3 < path.length; i += 5) dash.push(P.s([path[i], path[i + 2]], { w: 2.6, jit: 0.3 }));
    T(dash, tDua - 0.4, tDua + 0.1);
    const lp = [P.ell(455, 1192, 34, 34, { w: 4, col: "#B9772E", a: 0.95 }), P.ell(612, 1166, 34, 34, { w: 4, col: "#B9772E", a: 0.95 })];
    T(lp, tDua + 0.05, tDua + 0.7);
  }
  const p4P = mkPop(S4, { id: "parents", seed: 413, w: 3.0, h: 1.9, cx: 3.12, hz: -1.4, r0: tKedua - 0.15, r1: tKedua + 0.5 });
  {
    const P = p4P.P, cx = p4P.cw / 2, by = p4P.ch - 14;
    W(P.wash(ellPts(cx, by - 150, 230, 140, 0, 7, 28), C_ROSE, { a: 0.4 }), tKedua + 0.3, tKedua + 1.3);
    const m = person(P, cx - 80, by - 18, 175, { cap: true, lean: 3 }), f = person(P, cx + 85, by - 18, 190, { cap: true, lean: -3 });
    const bench = [P.line(cx - 210, by - 18, cx + 210, by - 18, { w: 3 }), P.line(cx - 190, by - 18, cx - 190, by, { w: 2.6 }), P.line(cx + 190, by - 18, cx + 190, by, { w: 2.6 })];
    T([bench, m.out, f.out], tSyk4 - 0.1, tKedua - 0.2);
  }

  // s5: the mustard seed: sky, rock, earth, magnifier
  const S5 = mkScene("s5", K.s5 - 0.3, 501);
  const tLuput = A("s5:luput"), tBiji = A("s5:biji"), tBatu = A("s5:batu"), tLangit = A("s5:langit"), tBumi = A("s5:bumi"), tAll5 = A("s5:Allah"), tDtg = A("s5:mendatangkannya");
  const p5S = mkPop(S5, { id: "sky", seed: 511, w: 5.2, h: 3.4, cx: 3.12, hz: -0.8, r0: tLuput - 0.4, r1: tLuput + 0.4 });
  const SKYSEED = [0, 0], ROCKSEED = [0, 0], EARTHSEED = [270, 1290];
  {
    const P = p5S.P, out = [];
    const cloud = (x, y, s) => { const c = [[x - 120 * s, y], [x - 110 * s, y - 40 * s], [x - 60 * s, y - 60 * s], [x - 20 * s, y - 100 * s], [x + 50 * s, y - 90 * s], [x + 80 * s, y - 50 * s], [x + 125 * s, y - 40 * s], [x + 130 * s, y]]; out.push(P.curve(c, { w: 3 }), P.line(x - 122 * s, y, x + 132 * s, y, { w: 2.2 })); return c; };
    const c1 = cloud(230, 330, 1), c2 = cloud(660, 250, 0.8);
    for (const [x, y] of [[120, 120], [430, 90], [560, 380], [800, 120], [360, 230], [730, 430]]) out.push(P.line(x - 14, y, x + 14, y, { w: 2.2 }), P.line(x, y - 14, x, y + 14, { w: 2.2 }));
    out.push(P.s(ellPts(820, 300, 60, 60, -2.2, 4.0, 30), { w: 3 }), P.s(ellPts(840, 286, 48, 52, -1.9, 3.2, 26), { w: 2.4 }));
    T(out, S5.Fe + 0.05, tLuput - 0.45);
    W(P.wash(c1, C_BLUE, { a: 0.45 }), tLuput, tLuput + 0.9); W(P.wash(c2, C_BLUE, { a: 0.4 }), tLuput + 0.2, tLuput + 1.1);
    W(P.wash(ellPts(820, 300, 66, 66, 0, 7, 24), "#E9CF8A", { a: 0.45 }), tLuput + 0.3, tLuput + 1.2);
    SKYSEED[0] = 470; SKYSEED[1] = 300;
    const sd = seed(P, SKYSEED[0], SKYSEED[1], 9);
    T(sd.out, tLangit - 0.05, tLangit + 0.2); W(sd.w, tLangit, tLangit + 0.6);
    const ring = P.ell(SKYSEED[0], SKYSEED[1], 44, 44, { w: 2.6, col: "#B9772E" }); W(ring, tAll5 + 0.15, tAll5 + 0.6);
    p5S.shape = crc([[10, p5S.ch], [6, 60], [200, 10], [p5S.cw / 2, 30], [p5S.cw - 160, 8], [p5S.cw - 6, 70], [p5S.cw - 10, p5S.ch]], 6);
  }
  const p5R = mkPop(S5, { id: "rock", seed: 512, w: 2.9, h: 1.9, cx: 3.12, hz: 1.2, r0: A("s5:Wahai") + 0.6, r1: A("s5:Wahai") + 1.2 });
  {
    const P = p5R.P, cx = p5R.cw / 2, by = p5R.ch - 10;
    const bo = [[cx - 230, by], [cx - 220, by - 120], [cx - 140, by - 230], [cx - 20, by - 280], [cx + 120, by - 250], [cx + 210, by - 160], [cx + 235, by]];
    const hole = ellPts(cx - 10, by - 120, 66, 52, 0, Math.PI * 2, 28);
    const out = [P.curve(bo, { w: 3.6 }), P.line(cx - 236, by, cx + 240, by, { w: 2.6 }), P.ell(cx - 10, by - 120, 66, 52, { w: 3 }),
      P.curve([[cx - 140, by - 230], [cx - 100, by - 150], [cx - 150, by - 60]], { w: 2, a: 0.5 }), P.curve([[cx + 120, by - 250], [cx + 90, by - 170], [cx + 150, by - 70]], { w: 2, a: 0.5 })];
    out.push(P.hatch([[cx + 70, by], [cx + 120, by - 250], [cx + 210, by - 160], [cx + 235, by]], 0.9, 8, { w: 1.7, a: 0.5 }));
    out.push(P.hatch([[cx - 230, by], [cx - 220, by - 120], [cx - 160, by - 40], [cx - 150, by]], -0.9, 9, { w: 1.6, a: 0.45 }));
    T(out, A("s5:Wahai") - 0.35, p5R.r0 - 0.05);
    W(P.wash(bo, "#B7AFA4", { a: 0.35 }), p5R.r1, p5R.r1 + 0.9);
    W(P.wash(hole, "#7E6E60", { a: 0.35 }), p5R.r1 + 0.2, p5R.r1 + 1.0);
    ROCKSEED[0] = cx - 10; ROCKSEED[1] = by - 120;
    const sd = seed(P, ROCKSEED[0], ROCKSEED[1], 9);
    T(sd.out, tBatu - 0.05, tBatu + 0.2); W(sd.w, tBatu, tBatu + 0.6);
    W(P.ell(ROCKSEED[0], ROCKSEED[1], 44, 44, { w: 2.6, col: "#B9772E" }), tAll5, tAll5 + 0.45);
    p5R.shape = crc([[8, p5R.ch], [10, by - 140], [cx - 140, by - 270], [cx - 10, by - 310], [cx + 150, by - 280], [p5R.cw - 8, by - 160], [p5R.cw - 8, p5R.ch]], 6);
  }
  {
    const P = S5.P, earth = [];
    for (let k = 0; k < 4; k++) { const y = 1110 + k * 72, pts = []; for (let i = 0; i <= 14; i++) pts.push([60 + i * 32, y + Math.sin(i * 0.8 + k * 2) * 9]); earth.push(P.s(pts, { w: 2.6 })); }
    for (let k = 0; k < 9; k++) earth.push(P.ell(90 + P.R() * 380, 1150 + P.R() * 230, 10 + P.R() * 10, 7 + P.R() * 6, { w: 2 }));
    earth.push(P.hatch([[60, 1330], [500, 1330], [500, 1410], [60, 1410]], 0.4, 10, { w: 1.6, a: 0.4 }));
    T(earth, p5R.r1 + 0.05, tBiji - 0.35);
    W(P.wash([[60, 1100], [510, 1100], [510, 1420], [60, 1420]], "#BF9A72", { a: 0.32 }), tBiji - 0.3, tBiji + 0.6);
    // magnifier with the big seed
    const mag = [P.ell(760, 1220, 128, 128, { w: 3.6 }), P.ell(760, 1220, 112, 112, { w: 2 }), P.line(850, 1312, 940, 1402, { w: 6 }), P.line(870, 1300, 958, 1388, { w: 3 })];
    const big = [P.ell(760, 1222, 46, 38, { w: 3.2, rot: 0.3 }), P.hatch(ellPts(760, 1222, 42, 34, 0, Math.PI * 2, 24, 0.3).filter((q) => q[0] > 752), 0.9, 6, { w: 1.5, a: 0.5 })];
    T([mag, big], tBiji - 0.3, tBiji + 0.65);
    W(P.wash(ellPts(760, 1222, 50, 42, 0, 7, 24, 0.3), C_GOLD, { a: 0.85 }), tBiji + 0.3, tBiji + 1.0);
    W(P.wash(ellPts(760, 1220, 115, 115, 0, 7, 30), "#CFE0E6", { a: 0.35 }), tBiji + 0.5, tBiji + 1.3);
    const sd = seed(P, EARTHSEED[0], EARTHSEED[1], 9);
    T(sd.out, tBumi - 0.05, tBumi + 0.2); W(sd.w, tBumi, tBumi + 0.6);
    W(P.ell(EARTHSEED[0], EARTHSEED[1], 44, 44, { w: 2.6, col: "#B9772E" }), tAll5 + 0.3, tAll5 + 0.75);
    // three dotted lines gathering the seeds into the magnifier: nothing is lost
    T([P.s(cr([[EARTHSEED[0] + 40, EARTHSEED[1] - 20], [500, 1200], [640, 1215]]), { w: 2.4, a: 0.7 })], tDtg - 0.1, tDtg + 0.6);
  }

  // s6: four sketched icons, seen top-down
  const S6 = mkScene("s6", K.s6 - 0.3, 601);
  const tDir = A("s6:Dirikan"), tAjak = A("s6:ajak"), tCegah = A("s6:cegah"), tSabar = A("s6:bersabarlah"), tSemua = A("s6:Semua"), tPent = A("s6:penting");
  {
    const P = S6.P;
    // prayer mat
    const mat = [[150, 260], [410, 250], [420, 690], [160, 700]];
    const m = [P.closed(mat, { w: 3.4, jit: 0.8 }), P.closed([[180, 290], [382, 282], [390, 662], [188, 670]], { w: 2.2, jit: 0.6 }),
      P.curve([[200, 420], [205, 350], [240, 312], [285, 300], [330, 312], [362, 350], [366, 420]], { w: 2.6 }), P.line(200, 420, 366, 420, { w: 2.2 })];
    for (let k = 0; k < 12; k++) { m.push(P.line(165 + k * 21, 700, 167 + k * 21, 730, { w: 1.8, a: 0.7 })); m.push(P.line(152 + k * 22, 250, 151 + k * 22, 222, { w: 1.8, a: 0.7 })); }
    m.push(P.hatch([[188, 470], [388, 466], [390, 662], [188, 670]], 0.785, 22, { w: 1.4, a: 0.35 }), P.hatch([[188, 470], [388, 466], [390, 662], [188, 670]], -0.785, 22, { w: 1.4, a: 0.35 }));
    T(m, S6.Fe + 0.03, tAjak + 0.5);
    W(P.wash(mat, C_TEAL, { a: 0.6 }), tAjak + 0.4, tAjak + 1.3);
    // helping hands: one reaching down, one reaching up
    const mitt = (x, y, s, up) => { const d = up ? -1 : 1; const pal = [[x - 60 * s, y], [x - 64 * s, y + d * 60 * s], [x - 40 * s, y + d * 120 * s], [x - 10 * s, y + d * 135 * s], [x + 20 * s, y + d * 130 * s], [x + 50 * s, y + d * 110 * s], [x + 60 * s, y + d * 60 * s], [x + 58 * s, y]]; return { pal, out: [P.curve(pal, { w: 3.2 }), P.line(x - 18 * s, y + d * 90 * s, x - 22 * s, y + d * 128 * s, { w: 2 }), P.line(x + 10 * s, y + d * 92 * s, x + 10 * s, y + d * 132 * s, { w: 2 }), P.line(x + 36 * s, y + d * 86 * s, x + 40 * s, y + d * 118 * s, { w: 2 }), P.curve([[x - 62 * s, y + d * 40 * s], [x - 96 * s, y + d * 70 * s], [x - 90 * s, y + d * 100 * s]], { w: 2.8 })] }; };
    const h1 = mitt(790, 250, 1.1, false), h2 = mitt(700, 700, 1.1, true);
    T([h1.out, h2.out, P.line(790, 250, 790, 205, { w: 2.6 }), P.line(700, 700, 700, 745, { w: 2.6 })], tAjak + 0.55, tCegah - 0.1);
    W(P.wash(h2.pal, C_OCHRE, { a: 0.55 }), tCegah - 0.2, tCegah + 0.6); W(P.wash(h1.pal, "#E3C9A8", { a: 0.5 }), tCegah, tCegah + 0.8);
    // stop palm against a dark scribble
    const palm = mitt(240, 1110, 1.05, true);
    const scrib = [];
    for (let k = 0; k < 9; k++) scrib.push([380 + P.R() * 70 + k * 6, 900 + P.R() * 200]);
    T([palm.out, P.s(cr(scrib), { w: 3.6, a: 0.9 }), P.line(345, 880, 345, 1120, { w: 5 })], tCegah - 0.05, tSabar - 0.2);
    W(P.wash(palm.pal, "#E3C9A8", { a: 0.55 }), tCegah + 0.5, tCegah + 1.3);
    W(P.s(cr(scrib), { brush: 1, col: C_DARK, w: 30, a: 0.18, jit: 2 }), tCegah + 0.7, tCegah + 1.4);
    // shield of patience
    const sh = [[600, 860], [700, 830], [800, 818], [900, 830], [895, 960], [860, 1060], [800, 1130], [740, 1060], [700, 960]];
    const shout = [P.closed([[620, 860], [760, 820], [880, 860], [878, 980], [840, 1070], [760, 1140], [680, 1070], [642, 980]], { w: 3.6 }),
      P.closed([[650, 880], [760, 848], [850, 880], [848, 975], [818, 1050], [760, 1104], [702, 1050], [672, 975]], { w: 2.2 }), P.line(760, 850, 760, 1104, { w: 2.2 }), P.line(660, 940, 856, 940, { w: 2.2 })];
    T(shout, tSabar - 0.05, tSabar + 1.0);
    W(P.wash([[620, 860], [760, 820], [880, 860], [878, 980], [840, 1070], [760, 1140], [680, 1070], [642, 980]], C_BLUE, { a: 0.6 }), tSabar + 0.6, tSabar + 1.5);
    void sh;
    // the loop around all four, then two emphasis ticks
    T([P.s(ellPts(512, 690, 455, 560, -2.4, Math.PI * 2.15, 64), { w: 3.4, a: 0.8 })], tSemua - 0.1, tSemua + 0.9);
    T([P.line(900, 1250, 950, 1330, { w: 4 }), P.line(940, 1236, 990, 1316, { w: 4 })], tPent - 0.3, tPent + 0.2);
  }

  // s7: walking humbly; the arrogant head and strut erased; softened voice; the donkey
  const S7 = mkScene("s7", K.s7 - 0.3, 701);
  const tPal = A("s7:memalingkan"), tSomb = A("s7:sombong"), tJal = A("s7:jangan"), tAngk = A("s7:angkuh"), tSed = A("s7:Sederhanakan"), tLun = A("s7:lunakkan"), tSeb = A("s7:Seburuk-buruk"), tKel = A("s7:keledai");
  const tErase0 = tAngk + 0.1, tErase1 = tSed + 0.5;
  const pathX = (v) => 540 + 70 * Math.sin((1430 - v) / 380);
  const p7H = mkPop(S7, { id: "head", seed: 711, w: 2.3, h: 2.2, cx: 1.55, hz: 0.1, r0: tSomb - 0.25, r1: tSomb + 0.35, f0: tAngk - 0.3, f1: tAngk + 0.05 });
  {
    const P = p7H.P, cx = p7H.cw / 2 + 10, by = p7H.ch - 10;
    // a back-of-head silhouette turned away, chin raised; shoulders squared. No features.
    const sil = [[cx - 160, by], [cx - 150, by - 70], [cx - 70, by - 120], [cx - 40, by - 170], [cx - 70, by - 250], [cx - 40, by - 320], [cx + 30, by - 345], [cx + 100, by - 320], [cx + 128, by - 262], [cx + 108, by - 200], [cx + 70, by - 165], [cx + 80, by - 120], [cx + 160, by - 70], [cx + 170, by]];
    const out = [P.curve(sil, { w: 3.6 }), P.line(cx - 162, by, cx + 172, by, { w: 2.6 }), P.hatch(sil, 0.6, 7.5, { w: 1.8, a: 0.6 }), P.hatch(sil, -0.9, 11, { w: 1.4, a: 0.35 })];
    T(out, S7.Fe + 0.5, p7H.r0 - 0.05);
    T([P.curve([[cx + 150, by - 300], [cx + 200, by - 320], [cx + 245, by - 312]], { w: 2.6 }), P.curve([[cx + 150, by - 260], [cx + 205, by - 268], [cx + 250, by - 250]], { w: 2.6 })], tSomb + 0.1, tSomb + 0.45);
    p7H.items0 = P.items.slice();
    E(P.items.slice(), tErase0, tErase0 + 0.45, 0.86);
  }
  {
    const P = S7.P;
    const L = [], Rr = [];
    for (let v = 1430; v >= 80; v -= 30) { const w = 60 + (v - 80) / 1350 * 230; L.push([pathX(v) - w, v]); Rr.push([pathX(v) + w, v]); }
    T([P.s(L, { w: 3 }), P.s(Rr, { w: 3 })], S7.Fe + 0.02, S7.Fe + 0.45);
    // strutting prints: wide, splayed
    const strut = [];
    for (let k = 0; k < 6; k++) { const v = 1300 - k * 150, sd = k % 2 ? 1 : -1; strut.push(footprint(P, pathX(v) + sd * 120, v, 1.55 - k * 0.12, sd * 0.7)); }
    T(strut, tSomb + 0.5, tAngk - 0.05);
    E(strut, tErase0 + 0.4, tErase1, 0.84);
    // modest prints: small and evenly spaced along the middle
    const modest = [];
    for (let k = 0; k < 11; k++) { const v = 1370 - k * 98, sd = k % 2 ? 1 : -1; modest.push(footprint(P, pathX(v) + sd * 24, v, 0.95 - k * 0.04, sd * 0.06)); }
    T(modest, tErase1, tLun - 0.15);
    W(P.wash(Rr.slice().reverse().concat(L), "#D8C6A2", { a: 0.3 }), S7.Fe + 0.4, S7.Fe + 1.4);
  }
  const p7W = mkPop(S7, { id: "wave", seed: 712, w: 2.2, h: 1.35, cx: 1.75, hz: 1.6, r0: tLun - 0.45, r1: tLun + 0.05 });
  {
    const P = p7W.P, by = p7W.ch / 2 + 6, spk = [], soft = [];
    for (let i = 0; i <= 16; i++) spk.push([30 + i * 19, by + (i % 2 ? -1 : 1) * (40 + (i * 37 % 50))]);
    for (let i = 0; i <= 40; i++) soft.push([30 + i * 7.6, by + Math.sin(i * 0.5) * 16]);
    const sp = P.s(spk, { w: 3.4, jit: 0.3 });
    T([sp], tLun - 0.05, tLun + 0.35); E([sp], tLun + 0.5, tLun + 1.0, 0.88);
    T([P.s(soft, { w: 3.6, jit: 0.3 })], tLun + 0.5, tLun + 1.1);
    W(P.s(soft, { brush: 1, col: C_BLUE, w: 26, a: 0.35, jit: 1 }), tLun + 1.0, tLun + 1.7);
    p7W.shape = crc([[10, p7W.ch - 6], [8, 20], [p7W.cw / 2, 6], [p7W.cw - 8, 20], [p7W.cw - 10, p7W.ch - 6]], 6);
  }
  const p7D = mkPop(S7, { id: "donkey", seed: 713, w: 2.1, h: 1.7, cx: 4.35, hz: -1.9, r0: tKel - 0.75, r1: tKel - 0.15 });
  {
    const P = p7D.P, by = p7D.ch - 10, x = p7D.cw / 2 - 30;
    const body = [[x - 110, by - 110], [x - 100, by - 160], [x - 20, by - 172], [x + 70, by - 168], [x + 110, by - 140], [x + 100, by - 92], [x + 20, by - 82], [x - 80, by - 88]];
    const out = [P.closed(body, { w: 3.2 }),
      P.curve([[x + 80, by - 162], [x + 120, by - 210], [x + 150, by - 232]], { w: 3 }), P.curve([[x + 108, by - 130], [x + 140, by - 180], [x + 168, by - 200]], { w: 3 }),
      P.closed([[x + 146, by - 236], [x + 200, by - 230], [x + 232, by - 200], [x + 220, by - 182], [x + 170, by - 196]], { w: 3 }),
      P.closed([[x + 150, by - 238], [x + 140, by - 300], [x + 160, by - 244]], { w: 2.6 }), P.closed([[x + 166, by - 236], [x + 172, by - 300], [x + 180, by - 240]], { w: 2.6 }),
      P.line(x - 80, by - 92, x - 84, by, { w: 3 }), P.line(x - 50, by - 86, x - 46, by, { w: 3 }), P.line(x + 50, by - 84, x + 46, by, { w: 3 }), P.line(x + 82, by - 92, x + 86, by, { w: 3 }),
      P.curve([[x - 108, by - 140], [x - 135, by - 120], [x - 140, by - 80]], { w: 2.4 }), P.line(x - 150, by, x + 160, by, { w: 2.2 }),
      P.hatch(body.slice(4).concat([[x - 80, by - 88]]), 0.9, 9, { w: 1.5, a: 0.4 })];
    T(out, tLun + 1.2, p7D.r0 - 0.05);
    W(P.wash(body, "#B9AA98", { a: 0.45 }), p7D.r1, p7D.r1 + 0.8);
    T([P.s([[x + 240, by - 210], [x + 258, by - 232], [x + 270, by - 206], [x + 286, by - 232], [x + 298, by - 208]], { w: 2.6, jit: 0.3 }), P.s([[x + 240, by - 182], [x + 262, by - 190], [x + 290, by - 178]], { w: 2.2, jit: 0.3 })], tKel + 0.05, tKel + 0.55);
    p7D.shape = crc([[8, p7D.ch], [8, by - 170], [x + 120, by - 330], [p7D.cw - 6, by - 260], [p7D.cw - 8, p7D.ch]], 6);
  }

  // s8: the tree again, with a fruit for every advice; then the notebook closes
  const S8 = mkScene("s8", K.s8 - 0.3, 801);
  const tTau = A("s8:tauhid"), tNas = A("s8:Nasihat"), tKis = A("s8:Kisah");
  const tC0 = tKis - 0.05, tC1 = tC0 + 1.35;
  const p8T = mkPop(S8, { id: "tree8", seed: 811, w: 4.4, h: 3.9, cx: 3.12, hz: 0.2, r0: tTau + 1.25, r1: tTau + 1.95, f0: tC0 + 0.05, f1: tC0 + 0.6 });
  {
    const P = p8T.P, cx = p8T.cw / 2, by = p8T.ch - 14, tr = tree(P, cx, by, 1);
    T(tr.out, S8.Fe + 0.3, tTau + 1.15);
    W(P.wash(tr.canopy, C_GREEN, { a: 0.6 }), tTau + 1.3, tTau + 2.2);
    W(P.wash(tr.bark, C_TERRA, { a: 0.5 }), tTau + 1.5, tTau + 2.3);
    const cy = by - 375, F = [[-190, -40, C_OCHRE], [-90, -130, "#E58A3C"], [40, -150, C_ROSE], [170, -90, C_GOLD], [200, 40, C_TEAL], [80, 60, C_BLUE], [-60, 40, "#D8C6A2"], [-200, 80, "#9FB88A"]];
    const fr = [], fw = [];
    F.forEach(([dx, dy, col], i) => {
      const x = cx + dx, y = cy + dy, g = [P.line(x, y - 32, x + 4, y - 50, { w: 2 }), P.ell(x, y, 30, 30, { w: 3 })];
      if (i === 0) g.push(P.line(x, y - 14, x, y + 16, { w: 2 }), P.line(x, y + 4, x - 12, y + 16, { w: 2 }), P.line(x, y + 4, x + 12, y + 16, { w: 2 }));
      if (i === 1) g.push(P.closed([[x, y - 18], [x - 8, y], [x, y + 14], [x + 8, y]], { w: 2 }));
      if (i === 2) g.push(P.curve([[x - 16, y - 4], [x, y + 14], [x + 16, y - 4]], { w: 2 }));
      if (i === 3) g.push(P.ell(x, y, 6, 5, { w: 2.4 }));
      if (i === 4) g.push(P.closed([[x - 10, y - 16], [x + 10, y - 16], [x + 11, y + 16], [x - 11, y + 16]], { w: 2 }));
      if (i === 5) g.push(P.closed([[x - 14, y - 12], [x + 14, y - 12], [x + 10, y + 6], [x, y + 16], [x - 10, y + 6]], { w: 2 }));
      if (i === 6) g.push(P.ell(x - 5, y + 2, 6, 11, { w: 2 }), P.ell(x + 7, y - 3, 6, 11, { w: 2 }));
      if (i === 7) g.push(P.s([[x - 18, y], [x - 9, y - 8], [x, y], [x + 9, y + 8], [x + 18, y]], { w: 2, jit: 0.2 }));
      fr.push(g);
      fw.push(P.wash(ellPts(x, y, 30, 30, 0, 7, 20), col, { a: 0.75 }));
    });
    const t0 = p8T.r1 + 0.05, t1 = tNas + 1.2;
    fr.forEach((g, i) => { const a = t0 + (t1 - t0) * i / 8, b = t0 + (t1 - t0) * (i + 1) / 8; T(g, a, b - 0.04); W(fw[i], b - 0.15, b + 0.5); });
    p8T.shape = p1T.shape;
  }
  {
    const P = S8.P, out = [];
    out.push(P.curve([[40, 770], [300, 760], [560, 772], [800, 764], [990, 770]], { w: 2.6 }));
    for (let k = 0; k < 7; k++) { const x = 60 + k * 132 + P.R() * 20, y = 900 + P.R() * 420; out.push(P.curve([[x - 10, y], [x - 4, y - 18], [x, y - 26]], { w: 2, a: 0.6 })); out.push(P.curve([[x + 2, y], [x + 8, y - 16], [x + 16, y - 22]], { w: 2, a: 0.6 })); }
    T(out, S8.Fe + 0.02, S8.Fe + 0.3);
  }

  // left-page notes shown at the very start (before any page has turned)
  const L0 = Pad(91);
  {
    const out = [];
    for (let k = 0; k < 9; k++) { const y = 240 + k * 52, pts = []; for (let i = 0; i <= 26; i++) pts.push([120 + i * 26, y + Math.sin(i * 1.7 + k) * 7 + (i % 5 === 4 ? 12 : 0)]); out.push(L0.s(pts.slice(0, 14 + (k * 5) % 12), { w: 2, a: 0.45, jit: 1.2 })); }
    out.push(L0.curve([[700, 980], [760, 900], [840, 930], [860, 1010], [800, 1070], [720, 1050], [700, 980]], { w: 2.4, a: 0.5 }));
    out.push(L0.line(780, 1060, 790, 1180, { w: 2.4, a: 0.5 }));
    T(out, -5, -4);
  }

  // ---------- canvases + materials
  const cvR = mkc(CW, CH), cvL = mkc(CW, CH), cvF = mkc(CW, CH), cvB = mkc(CW, CH), cvT = mkc(CW, CH);
  const xR = cvR.getContext("2d"), xL = cvL.getContext("2d"), xF = cvF.getContext("2d"), xB = cvB.getContext("2d"), xT = cvT.getContext("2d");
  const tR = tex(cvR), tL = tex(cvL), tF = tex(cvF), tB = tex(cvB);
  const pageMat = (t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.93 });
  const pageR = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), pageMat(tR));
  pageR.rotation.x = -Math.PI / 2; pageR.position.set(PX0 + PW / 2, PY + 0.001, 0); pageR.receiveShadow = true; scene.add(pageR);

  function paintRight(x, s, t) { x.drawImage(BASE_R, 0, 0); if (s) drawItems(x, s.P.items, t, 1, s.Fe + 4); signature(x); }
  function paintLeft(x, k) {
    x.drawImage(BASE_L, 0, 0);
    if (k < 0) { drawItems(x, L0.items, 1e9); return; }
    x.save(); x.translate(CW, 0); x.scale(-1, 1); drawItems(x, SC[k].P.items, 1e9, 0.13); x.restore();
    const R = mulberry(500 + k);
    for (let j = 0; j < 4; j++) { x.fillStyle = "rgba(60,55,50,0.05)"; x.beginPath(); x.ellipse(200 + R() * 600, 200 + R() * 1000, 50 + R() * 60, 12 + R() * 10, R() * 3, 0, 7); x.fill(); }
  }

  // notebook: covers, page blocks, left half (pivots over for the close)
  const leather = (inside) => canvasTex(1024, 1434, (x, w, h) => {
    x.fillStyle = inside ? "#7a5236" : "#5b3a26"; x.fillRect(0, 0, w, h);
    const R = mulberry(inside ? 5 : 6);
    for (let i = 0; i < 9000; i++) { x.fillStyle = R() < 0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,220,180,0.04)"; x.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3); }
    if (!inside) { x.strokeStyle = "rgba(230,200,160,0.35)"; x.setLineDash([14, 10]); x.lineWidth = 3; x.strokeRect(40, 40, w - 80, h - 80); x.setLineDash([]); }
  });
  const coverOutC = mkc(1024, 1434), coverOutX = coverOutC.getContext("2d"), coverOutT = tex(coverOutC);
  let coverKey = "";
  const lOut = leather(false).image;
  function paintCover() {
    const k = fontOK() ? "f" : "n";
    if (k === coverKey) return; coverKey = k;
    const x = coverOutX, w = 1024, h = 1434;
    x.drawImage(lOut, 0, 0);
    x.save(); x.translate(w / 2, h / 2); x.rotate(Math.PI); x.translate(-w / 2, -h / 2);
    x.font = `700 92px ${k === "f" ? "Kalam" : "cursive"}`; x.textAlign = "center";
    x.fillStyle = "rgba(255,225,185,0.22)"; x.fillText("AUDIRA", w / 2 + 2, h * 0.5 + 3);
    x.fillStyle = "rgba(25,14,8,0.62)"; x.fillText("AUDIRA", w / 2, h * 0.5);
    x.strokeStyle = "rgba(25,14,8,0.5)"; x.lineWidth = 4; x.beginPath(); x.moveTo(w / 2 - 170, h * 0.5 + 34); x.quadraticCurveTo(w / 2, h * 0.5 + 58, w / 2 + 170, h * 0.5 + 30); x.stroke();
    x.restore();
    coverOutT.needsUpdate = true;
  }
  paintCover();
  const edge = new THREE.MeshStandardMaterial({ color: 0x4e3020, roughness: 0.8 });
  const inLe = new THREE.MeshStandardMaterial({ map: leather(true), roughness: 0.8 });
  const outLe = new THREE.MeshStandardMaterial({ map: coverOutT, roughness: 0.75 });
  const blockSide = new THREE.MeshStandardMaterial({ map: canvasTex(64, 512, (x, w, h) => { x.fillStyle = "#EDE2CB"; x.fillRect(0, 0, w, h); for (let i = 0; i < h; i += 3) { x.fillStyle = `rgba(120,95,60,${0.08 + (i % 9 === 0 ? 0.08 : 0)})`; x.fillRect(0, i, w, 1); } }), roughness: 0.9 });
  const blockTop = new THREE.MeshStandardMaterial({ color: 0xefe5d0, roughness: 0.92 });
  const CVW = PW + 0.36, CVD = PD + 0.42;
  const rCover = new THREE.Mesh(new THREE.BoxGeometry(CVW, 0.08, CVD), [edge, edge, inLe, outLe, edge, edge]);
  rCover.position.set(PX0 + PW / 2 + 0.06, 0.04, 0); rCover.castShadow = rCover.receiveShadow = true; scene.add(rCover);
  const rBlock = new THREE.Mesh(new THREE.BoxGeometry(PW, PY - 0.08, PD), [blockSide, blockSide, blockTop, blockTop, blockSide, blockSide]);
  rBlock.position.set(PX0 + PW / 2, 0.08 + (PY - 0.08) / 2, 0); rBlock.castShadow = rBlock.receiveShadow = true; scene.add(rBlock);
  const PIVY = PY + 0.004;
  const leftG = new THREE.Group(); leftG.position.set(0, PIVY, 0); scene.add(leftG);
  const lCover = new THREE.Mesh(new THREE.BoxGeometry(CVW, 0.08, CVD), [edge, edge, inLe, outLe, edge, edge]);
  lCover.position.set(-(PX0 + PW / 2 + 0.06), 0.04 - PIVY, 0); lCover.castShadow = lCover.receiveShadow = true; leftG.add(lCover);
  const lBlock = new THREE.Mesh(new THREE.BoxGeometry(PW, PY - 0.08, PD), [blockSide, blockSide, blockTop, blockTop, blockSide, blockSide]);
  lBlock.position.set(-(PX0 + PW / 2), 0.08 + (PY - 0.08) / 2 - PIVY, 0); lBlock.castShadow = lBlock.receiveShadow = true; leftG.add(lBlock);
  const pageL = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), pageMat(tL));
  pageL.rotation.x = -Math.PI / 2; pageL.position.set(-(PX0 + PW / 2), PY + 0.001 - PIVY, 0); pageL.receiveShadow = true; leftG.add(pageL);
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(PIVY + 0.04, PIVY + 0.04, CVD, 24, 1, false, Math.PI, Math.PI), edge);
  spine.rotation.x = Math.PI / 2; spine.position.set(0, PIVY, 0); spine.castShadow = true; scene.add(spine);
  // elastic band on the cover's outer edge (visible after the close)
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, CVD + 0.02), new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.6 }));
  band.position.set(-(PX0 + PW + 0.02), -0.012 - PIVY + 0.0, 0); leftG.add(band);

  // flip sheet (bending page)
  const NX = 28, sg = new THREE.BufferGeometry();
  const spos = new Float32Array((NX + 1) * 2 * 3), suv = new Float32Array((NX + 1) * 2 * 2), sidx = [];
  for (let i = 0; i <= NX; i++) for (let j = 0; j < 2; j++) { const v = i * 2 + j; suv[v * 2] = i / NX; suv[v * 2 + 1] = j ? 0 : 1; }
  for (let i = 0; i < NX; i++) { const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3; sidx.push(a, b, c, c, b, d); }
  sg.setAttribute("position", new THREE.BufferAttribute(spos, 3)); sg.setAttribute("uv", new THREE.BufferAttribute(suv, 2)); sg.setIndex(sidx);
  const sheetF = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: tF, roughness: 0.93, side: THREE.FrontSide }));
  const sheetB = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: tB, roughness: 0.93, side: THREE.BackSide }));
  for (const m of [sheetF, sheetB]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }
  function setSheet(th) {
    const D = PX0 + PW, bend = 0.95 * Math.sin(th);
    let x = 0, y = PY + 0.008, prev = 0;
    for (let i = 0; i <= NX; i++) {
      const d = PX0 + PW * i / NX;
      if (i === 0) { x = Math.cos(th) * PX0; y = PY + 0.008 + Math.sin(th) * PX0; prev = d; }
      else { const s = d / D, ph = th - bend * Math.pow(s, 1.4), dd = d - prev; x += Math.cos(ph) * dd; y += Math.sin(ph) * dd; prev = d; }
      for (let j = 0; j < 2; j++) { const v = (i * 2 + j) * 3; spos[v] = x; spos[v + 1] = y + (1 - Math.abs(Math.cos(th))) * 0.02; spos[v + 2] = j ? PD / 2 : -PD / 2; }
    }
    sg.attributes.position.needsUpdate = true; sg.computeVertexNormals();
  }

  // pop-up cards
  const POPS = SC.flatMap((s) => s.pops);
  for (const p of POPS) {
    p.cv = mkc(p.cw, p.ch); p.x = p.cv.getContext("2d"); p.tex = tex(p.cv); p.key = "";
    if (!p.shape) p.shape = crc([[10, p.ch], [6, 18], [p.cw / 2, 8], [p.cw - 6, 18], [p.cw - 10, p.ch]], 6);
    p.shapeP = toPath(p.shape, p.shape.length);
    p.G = new THREE.Group(); p.G.position.set(p.cx, PY + 0.004, p.hz); scene.add(p.G);
    const geo = new THREE.PlaneGeometry(p.w, p.h); geo.translate(0, p.h / 2, 0);
    p.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: p.tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.93 }));
    p.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: p.tex, alphaTest: 0.5 });
    p.mesh.castShadow = true; p.mesh.receiveShadow = true; p.G.add(p.mesh);
    const idx = SC.indexOf(p.sc), nx = SC[idx + 1];
    p.v0 = idx === 0 ? -1 : p.sc.F;
    if (p.f0 === undefined) { p.f0 = nx.F - 0.6; p.f1 = nx.F - 0.05; }
    p.v1 = nx ? Math.max(p.f1, nx.F) : p.f1 + 0.05;
    if (p.id === "head") p.v1 = nx.F;
  }
  function paintPop(p, t) {
    const k = stateKey(p.P.items, t);
    if (k === p.key) return; p.key = k;
    const x = p.x; x.clearRect(0, 0, p.cw, p.ch);
    x.fillStyle = CARD; x.fill(p.shapeP);
    x.save(); x.clip(p.shapeP); drawItems(x, p.P.items, t, 1, p.sc.Fe + 4); x.restore();
    x.strokeStyle = "rgba(70,62,52,0.55)"; x.lineWidth = 2.2; x.stroke(p.shapeP);
    p.tex.needsUpdate = true;
  }
  const popAngle = (p, t) => {
    if (t < p.v0 || t > p.v1) return null;
    let e = back(clamp01((t - p.r0) / (p.r1 - p.r0)), 1.3);
    e *= 1 - sm((t - p.f0) / (p.f1 - p.f0));
    return -Math.PI / 2 * (1 - e) - 0.05 * e;
  };

  // pencil
  const pen = new THREE.Group(); pen.scale.setScalar(0.72); scene.add(pen);
  {
    const wood = new THREE.MeshStandardMaterial({ color: 0xd9b48a, roughness: 0.8 }), lead = new THREE.MeshStandardMaterial({ color: 0x2b2a29, roughness: 0.45, metalness: 0.2 });
    const paint = new THREE.MeshStandardMaterial({ color: 0x2f4a3e, roughness: 0.5 }), fer = new THREE.MeshStandardMaterial({ color: 0xc9b07a, roughness: 0.3, metalness: 0.8 }), rub = new THREE.MeshStandardMaterial({ color: 0xd98a8a, roughness: 0.9 });
    const add = (g, m, y) => { const o = new THREE.Mesh(g, m); o.position.y = y; o.castShadow = true; pen.add(o); return o; };
    add(new THREE.ConeGeometry(0.022, 0.1, 12).rotateX(Math.PI), lead, 0.05);
    add(new THREE.CylinderGeometry(0.075, 0.022, 0.36, 6), wood, 0.28);
    add(new THREE.CylinderGeometry(0.075, 0.075, 2.7, 6), paint, 0.46 + 1.35);
    add(new THREE.CylinderGeometry(0.078, 0.078, 0.2, 16), fer, 3.26);
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.17, 16), rub, 3.44);
  }
  // eraser block
  const eraser = new THREE.Group(); scene.add(eraser);
  {
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.26, 0.42), new THREE.MeshStandardMaterial({ color: 0xe79a9a, roughness: 0.95 })); b1.position.y = 0.13; b1.castShadow = true; eraser.add(b1);
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.44), new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (x, w, h) => { x.fillStyle = "#e9e1cf"; x.fillRect(0, 0, w, h); x.fillStyle = "#3b5a8a"; x.fillRect(0, 22, w, 20); }), roughness: 0.8 }));
    sl.position.set(0.16, 0.14, 0); sl.castShadow = true; eraser.add(sl);
  }
  // pencil shavings on the desk
  const shav = canvasTex(256, 256, (x) => {
    x.translate(128, 128);
    for (let k = 0; k < 3; k++) { x.rotate(2.1); x.beginPath(); for (let a = 0; a < 7.5; a += 0.1) { const rr = 20 + a * 12; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.7); } x.strokeStyle = "#c79a6a"; x.lineWidth = 9; x.stroke(); x.strokeStyle = "#2f4a3e"; x.lineWidth = 2; x.stroke(); }
  });
  for (const [x, z, s, rr] of [[7.3, 2.6, 0.9, 0.3], [7.9, 1.6, 0.6, 1.8], [-7.6, -2.8, 0.7, 2.4]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: shav, transparent: true, roughness: 0.8, depthWrite: false }));
    m.rotation.set(-Math.PI / 2, 0, rr); m.position.set(x, 0.01, z); scene.add(m);
  }
  // sketched birds (cut-paper, flapping) around the tree in s1 and s8
  const birdT = canvasTex(256, 128, (x) => { x.strokeStyle = "#35322f"; x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.moveTo(20, 70); x.quadraticCurveTo(70, 20, 128, 72); x.quadraticCurveTo(186, 20, 236, 70); x.stroke(); });
  const birds = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: birdT, transparent: true, depthWrite: false })); scene.add(m); return m; });

  // pencil head: all pencil strokes with their surface, sorted by start time
  const STK = [];
  for (const s of SC) {
    for (const it of s.P.items) if (!it.wash && !it.brush && it.t1 > it.t0) STK.push({ it, surf: null });
    for (const p of s.pops) for (const it of p.P.items) if (!it.wash && !it.brush && it.t1 > it.t0) STK.push({ it, surf: p });
  }
  STK.sort((a, b) => a.it.t0 - b.it.t0);
  const wv = new THREE.Vector3(), nv = new THREE.Vector3();
  function surfPt(surf, q, out, nrm) {
    if (!surf) { out.set(PX0 + q[0] / PPU, PY + 0.004, -PD / 2 + q[1] / PPU); nrm.set(0, 1, 0); return; }
    out.set(q[0] / PPU - surf.w / 2, surf.h - q[1] / PPU, 0.01).applyMatrix4(surf.mesh.matrixWorld);
    nrm.set(0, 0, 1).transformDirection(surf.mesh.matrixWorld);
  }
  const DIRB = new THREE.Vector3(0.55, 0.62, 0.12);
  const hA = new THREE.Vector3(), hB = new THREE.Vector3(), nA = new THREE.Vector3(), nB = new THREE.Vector3(), dir = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const qd = new THREE.Quaternion(), qr = new THREE.Quaternion();
  const REST = new THREE.Vector3(7.1, 0.08, 0.5), RESTDIR = new THREE.Vector3(-0.25, 0.0, -1).normalize();
  const COVREST = new THREE.Vector3(1.0, 2 * PIVY + 0.1, 3.0), COVDIR = new THREE.Vector3(0.95, 0, -0.3).normalize();
  function pencil(t) {
    let lo = 0, hi = STK.length - 1, last = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (STK[m].it.t0 <= t) { last = m; lo = m + 1; } else hi = m - 1; }
    let lift = 0;
    if (last < 0) { const n = STK[0]; surfPt(n.surf, n.it.pts[0], hA, nA); lift = 0.5; }
    else {
      const L = STK[last];
      if (t < L.it.t1) { surfPt(L.surf, ptAt(L.it, (t - L.it.t0) / (L.it.t1 - L.it.t0)), hA, nA); }
      else {
        surfPt(L.surf, L.it.pts[L.it.pts.length - 1], hA, nA);
        const N = STK[last + 1];
        if (N) {
          surfPt(N.surf, N.it.pts[0], hB, nB);
          const g = N.it.t0 - L.it.t1, u = clamp01((t - L.it.t1) / Math.max(0.001, g));
          const su = sm(u);
          hA.lerp(hB, su); nA.lerp(nB, su).normalize();
          lift = Math.sin(Math.PI * u) * Math.min(1.5, 0.12 + g * 0.45);
        } else lift = Math.min(1.2, (t - L.it.t1) * 0.8);
      }
    }
    dir.copy(nA).add(DIRB).normalize();
    hA.addScaledVector(nA, lift * 0.5).y += lift * 0.6;
    const wob = Math.sin(t * 23) * 0.025;
    dir.x += wob; dir.normalize();
    // pencil goes to rest on the closed cover at the end
    const ur = ramp(t, tC0 - 0.4, tC0 + 0.3), uc = ramp(t, tC1 - 0.1, tC1 + 0.9);
    if (ur > 0) { hA.lerp(REST, ur); dir.lerp(RESTDIR, ur).normalize(); }
    if (uc > 0) { hA.lerp(COVREST, uc); dir.lerp(COVDIR, uc).normalize(); }
    if (ur > 0 && uc < 1) hA.y += Math.sin(Math.PI * ur) * 1.2 * (1 - uc) + Math.sin(Math.PI * uc) * 1.6;
    pen.position.copy(hA);
    qd.setFromUnitVectors(Y, dir); pen.quaternion.copy(qd);
    if (ur >= 1 || uc > 0) { pen.position.addScaledVector(dir, 0); }
    if (uc > 0.5 || (ur > 0.5 && uc < 0.5)) { /* lying: lift the barrel off the surface by its radius */ pen.position.y += 0.07 * Math.min(1, Math.max(ur, uc)); }
  }

  // ---------- camera
  const K1 = A("s1:diabadikan");
  const cams = track([
    [0, 3.1, 12.6, 4.2, 3.1, 0.4, -1.5],
    [tBerharga - 0.5, 3.1, 10.6, 6.6, 3.1, 0.6, -1.2],
    [tBerharga + 1.0, 3.25, 5.0, 12.6, 3.1, 2.1, 0.0],
    [K1 + 2.6, 3.4, 4.3, 11.6, 3.15, 1.6, 0.8],
    [tRaja - 0.3, 3.2, 7.4, 11.4, 3.1, 0.9, 2.3],
    [tPang + 0.7, 3.0, 7.0, 11.2, 3.1, 0.9, 2.2],
    [K.s1e - 0.2, 3.25, 5.2, 11.6, 3.1, 1.5, 0.9],
    [K.s2 + 0.5, 3.0, 11.2, 6.4, 2.6, 0.4, -0.6],
    [tHik - 0.6, 3.1, 9.4, 8.0, 3.1, 0.5, -0.2],
    [tHik + 0.6, 3.25, 4.4, 10.8, 3.1, 1.5, 0.6],
    [tSyk - 0.4, 3.0, 6.4, 11.4, 3.1, 0.9, 1.4],
    [K.s2e, 3.1, 7.6, 11.0, 3.1, 0.7, 1.0],
    [K.s3 + 0.6, 2.8, 11.6, 5.0, 3.0, 0.4, -1.8],
    [tFond - 0.6, 3.0, 10.2, 6.6, 3.0, 0.5, -1.4],
    [tFond + 1.0, 3.0, 4.9, 11.6, 3.0, 1.7, -0.3],
    [tWahai3 + 2.0, 3.6, 4.4, 11.6, 3.5, 1.2, 0.9],
    [tSes + 1.4, 2.6, 6.2, 11.6, 2.8, 0.8, 1.2],
    [K.s3e, 2.4, 7.2, 11.0, 2.6, 0.6, 1.5],
    [K.s4 + 0.7, 3.1, 11.2, 6.6, 3.1, 0.4, -0.2],
    [tIbu - 0.3, 2.5, 8.6, 8.6, 2.3, 0.5, 0.8],
    [tLemah + 0.5, 2.3, 5.0, 9.6, 2.1, 1.0, 1.4],
    [tSapih + 0.6, 3.4, 5.0, 10.0, 3.4, 0.9, 1.5],
    [tDua + 0.6, 3.6, 5.4, 10.0, 3.5, 0.8, 1.4],
    [tSyk4 + 0.4, 3.2, 8.6, 9.6, 3.1, 0.5, -0.2],
    [tKedua + 0.6, 3.1, 5.0, 11.6, 3.1, 1.3, 0.0],
    [K.s4e, 3.1, 6.0, 11.8, 3.1, 1.1, 0.2],
    [K.s5 + 0.6, 3.1, 12.2, 4.4, 3.1, 0.4, -2.3],
    [tLuput - 0.6, 3.1, 10.6, 6.2, 3.1, 0.6, -2.0],
    [tLuput + 0.8, 3.1, 4.7, 11.4, 3.1, 2.0, -0.7],
    [tBiji - 0.6, 3.1, 7.0, 11.2, 3.1, 0.8, 1.6],
    [tBiji + 0.6, 4.0, 5.0, 8.8, 4.3, 0.6, 2.8],
    [tBatu - 0.4, 3.2, 3.4, 8.4, 3.1, 1.2, 1.3],
    [tLangit - 0.25, 3.1, 3.8, 7.8, 3.0, 1.6, 0.4],
    [tLangit + 0.45, 2.9, 4.8, 7.2, 2.5, 2.5, -0.9],
    [tBumi + 0.35, 2.2, 5.2, 8.4, 1.8, 0.5, 3.0],
    [tAll5 + 0.6, 2.6, 6.0, 10.0, 2.6, 0.6, 2.0],
    [K.s5e, 3.1, 6.8, 13.4, 3.1, 1.3, 0.1],
    [K.s6 + 0.6, 3.1, 16.0, 4.6, 3.1, 0.4, 0.2],
    [tCegah, 3.0, 15.4, 4.4, 3.0, 0.4, 0.4],
    [tSemua, 3.2, 16.2, 4.6, 3.1, 0.4, 0.3],
    [K.s6e, 3.1, 15.8, 5.4, 3.1, 0.4, 0.0],
    [K.s7 + 0.6, 3.1, 10.6, 7.0, 2.8, 0.4, -0.3],
    [tPal + 1.2, 2.3, 4.6, 9.2, 1.8, 1.2, 0.4],
    [tJal + 0.6, 2.8, 6.2, 10.6, 2.8, 0.6, 1.6],
    [tErase0 + 0.3, 2.4, 6.6, 9.2, 2.2, 0.5, 0.5],
    [tSed + 0.8, 3.0, 5.6, 10.6, 3.2, 0.6, 1.6],
    [tLun + 0.6, 2.0, 4.3, 8.8, 1.8, 0.9, 1.0],
    [tKel - 0.6, 4.1, 5.6, 9.0, 4.3, 0.8, -1.4],
    [K.s7e, 3.9, 4.2, 9.4, 4.3, 1.1, -1.8],
    [K.s8 + 0.3, 3.1, 12.6, 4.4, 3.1, 0.4, -1.4],
    [tTau + 1.1, 3.1, 10.6, 6.6, 3.1, 0.6, -1.2],
    [tTau + 2.4, 3.25, 5.0, 12.8, 3.1, 2.0, 0.0],
    [tC0 - 0.3, 3.0, 6.0, 13.6, 3.1, 1.6, 0.0],
    [tC0 + 0.8, 2.4, 9.4, 11.4, 3.0, 0.6, 0.2],
    [tC1 + 0.8, 3.1, 11.4, 7.6, 3.2, 0.7, 0.0],
    [K.dur, 3.1, 12.2, 7.0, 3.2, 0.7, 0.0],
  ]);
  const look = new THREE.Vector3();

  // ---------- frame
  let keyR = "", keyL = "", keyF = "", keyB = "";
  return (t) => {
    paintCover();
    // which scene owns the right page, which recap the left page shows
    let cur = 0;
    for (let i = 0; i < SC.length; i++) if (t >= SC[i].F) cur = i;
    let done = -1;
    for (let i = 1; i < SC.length; i++) if (t >= SC[i].Fe) done = i - 1;
    const s = SC[cur];
    const kR = cur + ":" + stateKey(s.P.items, t) + (fontOK() ? "f" : "n");
    if (kR !== keyR) { keyR = kR; paintRight(xR, s, t); tR.needsUpdate = true; }
    const kL = "L" + done;
    if (kL !== keyL) { keyL = kL; paintLeft(xL, done); tL.needsUpdate = true; }
    // flip
    const fl = cur > 0 && t < s.Fe ? clamp01((t - s.F) / FLIP) : -1;
    sheetF.visible = sheetB.visible = fl >= 0;
    if (fl >= 0) {
      const kF = "F" + cur + (fontOK() ? "f" : "n");
      if (kF !== keyF) {
        keyF = kF;
        paintRight(xF, SC[cur - 1], 1e9); tF.needsUpdate = true;
        paintLeft(xT, cur - 1); xB.save(); xB.translate(CW, 0); xB.scale(-1, 1); xB.drawImage(cvT, 0, 0); xB.restore(); tB.needsUpdate = true;
      }
      void keyB;
      const e = fl < 0.5 ? 2 * fl * fl : 1 - Math.pow(-2 * fl + 2, 2) / 2;
      setSheet(Math.PI * e);
    }
    // close
    const cl = sm((t - tC0) / (tC1 - tC0));
    leftG.rotation.z = -Math.PI * cl;
    spine.visible = cl > 0.8;
    // pop-ups
    for (const p of POPS) {
      const ang = popAngle(p, t);
      p.G.visible = ang !== null;
      if (ang === null) continue;
      p.G.rotation.x = ang;
      paintPop(p, t);
    }
    scene.updateMatrixWorld();
    // camera
    const c = cams(t);
    cam.position.set(c[0], c[1], c[2]);
    look.set(c[3], c[4], c[5]);
    cam.lookAt(look);
    // birds
    const bw = Math.max(ramp(t, tBerharga + 1, tBerharga + 2) * (1 - ramp(t, K.s1e - 1, K.s1e)), ramp(t, tTau + 2.2, tTau + 3.2) * (1 - ramp(t, tC0 - 1.2, tC0 - 0.4)));
    birds.forEach((b, i) => {
      b.visible = bw > 0.01;
      const w = 0.45 + i * 0.12, ph = i * 2.1 + t * w;
      b.position.set(3.1 + Math.cos(ph) * (2.4 - i * 0.3), 4.6 + i * 0.35 + Math.sin(t * 0.9 + i) * 0.2 + (1 - bw) * 2.5, 0.2 + Math.sin(ph) * 1.1);
      b.quaternion.copy(cam.quaternion);
      b.scale.set(1, 0.45 + 0.55 * Math.abs(Math.sin(t * 9 + i * 1.7)), 1);
    });
    // pencil + eraser
    pencil(t);
    {
      const hp = p7H;
      const ER0 = new THREE.Vector3(7.2, 0, 1.8);
      const u0 = ramp(t, tErase0 - 0.45, tErase0), u3 = ramp(t, tErase1 + 0.05, tErase1 + 0.55);
      const pa = new THREE.Vector3(), pb = new THREE.Vector3(), nn = new THREE.Vector3();
      if (hp.G.visible) { hp.mesh.updateMatrixWorld(); surfPt(hp, [hp.cw / 2, hp.ch * 0.5], pa, nn); } else pa.set(1.5, PY, -1.0);
      surfPt(null, [pathX(1000), 1000], pb, nn);
      const um = ramp(t, tErase0 + 0.3, tErase0 + 0.5);
      const p = new THREE.Vector3().copy(pa).lerp(pb, um);
      const rub = (t > tErase0 && t < tErase1) ? Math.sin((t - tErase0) * 26) * 0.42 : 0;
      p.x += rub; p.z += Math.cos((t - tErase0) * 13) * 0.12 * (rub ? 1 : 0);
      const pos = new THREE.Vector3().copy(ER0).lerp(p, u0 * (1 - u3) + 0);
      if (u3 > 0) pos.copy(p).lerp(ER0, u3);
      if (u0 < 1 && u3 === 0) pos.y += Math.sin(Math.PI * u0) * 1.2;
      if (u3 > 0 && u3 < 1) pos.y += Math.sin(Math.PI * u3) * 1.2;
      if (u0 >= 1 && u3 === 0) pos.y = PY + 0.02;
      eraser.position.copy(pos); eraser.rotation.y = 0.3 + rub * 0.3;
    }
    bp.strength = 0.08;
    comp.render();
  };
}
