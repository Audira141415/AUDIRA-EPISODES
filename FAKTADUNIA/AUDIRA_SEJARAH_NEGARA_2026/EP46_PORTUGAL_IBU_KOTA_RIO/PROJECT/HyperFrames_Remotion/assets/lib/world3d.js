// EP46 MOSAICFORGE: Portugal moves its capital to Rio (1807-1822), told on an azulejo rotunda.
// A round room lined with 3.840 real glazed tiles (cobalt on white, ochre accents, grey grout, per-tile tilt and tone).
// The wall holds 8 painted panels, one per scene; each panel has two painted states and its tiles flip on narrated words.
// Glazed porcelain props stand off the wall and cast shadows on it:
//   P0 s1  Lisbon | Rio, tiles rain in, gold arrow across the ocean, porcelain ship, AUDIRA banderole
//   P1 s2  azulejo map of Iberia, three gold arrows France/Spain > Portugal, figurine + name plaque JOAO
//   P2 s3  Lisbon harbour, figurines walk to a docked ship; tiles flip: empty quay, Napoleon's soldiers march in
//   P3 s4  Atlantic, escorted porcelain fleet (camera orbits the lead ship); tiles flip to the Brazil coast, gates open
//   P4 s5  Rio de Janeiro, a gold crown descends, a reversed arrow + PEMBALIKAN plaque, tiles flip: crowded city
//   P5 s6  1815 shields + gold balance that levels; tiles rattle (crisis), flip to the sea, ship + crown sails back left
//   P6 s7  Rio balcony, figurine + plaque PEDRO; tiles flip into Brazil's flag (simple shape) on 7 September 1822
//   P7 s8  closing panel with the AUDIRA banderole; camera cranes up over the rotunda
// Everything is a pure function of t.

const FONTS = ['700 80px "Playfair Display"', '900 80px "Playfair Display"', 'italic 700 80px "Playfair Display"', '500 80px "IBM Plex Mono"', '700 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "LISBON RIO 1807 AUDIRA JOÃO"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, back, eout, stage } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const TAU = Math.PI * 2;
const NP = 8, PW = 20, NR = 24, NC = NP * PW, R = NC / TAU, TP = 64;
const MX0 = 3, MY0 = 5, MWT = 14, MHT = 12, MW = MWT * TP, MH = MHT * TP; // mural: 14 x 12 tiles
const CW = PW * TP, CH = NR * TP;
const COB = "#1F3F8F", COBD = "#152C66", LB = "#6E8FCB", LB2 = "#A9BEE3", WH = "#F4F1E8", OCH = "#D8A23A", OCHD = "#A9781E";
const SERIF = '"Playfair Display", Georgia, serif', MONO = '"IBM Plex Mono", Consolas, monospace';

function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < keys.length; i++) if (keys[i][0] <= keys[i - 1][0] + 0.02) keys[i][0] = keys[i - 1][0] + 0.02;
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}
const win = (t, a, b, fi = 0.35, fo = 0.35) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));

// =====================================================================================
// PAINTING (canvas 2D, cobalt on white, in mural pixel space 896 x 768)
// =====================================================================================
const strokeP = (g, lw, col = COB, a = 1) => { g.save(); g.globalAlpha = Math.min(1, a * 1.1); g.strokeStyle = col; g.lineWidth = lw * 1.35; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); g.restore(); };
const fillP = (g, col, a = 1) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.fill(); g.restore(); };
function hatchP(g, sp, ang, lw, a, col = COB) {
  g.save(); g.clip(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
  const c = Math.cos(ang), s = Math.sin(ang), L = 1700;
  for (let k = -L; k < L; k += sp) { g.moveTo(-s * k - c * L, c * k - s * L); g.lineTo(-s * k + c * L, c * k + s * L); }
  g.stroke(); g.restore();
}
function shape(g, fn, o = {}) {
  if (o.fill) { g.beginPath(); fn(); fillP(g, o.fill, o.fa ?? 1); }
  if (o.wash) { g.beginPath(); fn(); fillP(g, LB, Math.min(1, o.wash * 1.5)); }
  if (o.hatch) { g.beginPath(); fn(); hatchP(g, o.hatch[0], o.hatch[1], (o.hatch[2] ?? 1.5) * 1.3, Math.min(1, (o.hatch[3] ?? 0.6) * 1.3)); }
  if (o.lw) { g.beginPath(); fn(); strokeP(g, o.lw, o.col || COB, o.sa ?? 1); }
}
const text = (g, s, x, y, size, o = {}) => { g.save(); g.fillStyle = o.col || COB; g.font = `${o.w || 700} ${o.it ? "italic " : ""}${size}px ${o.font || SERIF}`.replace("700 italic", "italic 700"); g.textAlign = o.al || "center"; g.textBaseline = "middle"; if (o.ls) g.letterSpacing = o.ls + "px"; g.fillText(s, x, y); g.restore(); };

function sky(g, q, h) {
  for (let i = 0; i < 18; i++) { const y = 10 + q() * (h - 20), x = q() * MW - 120, w = 120 + q() * 320; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y + (q() - 0.5) * 8, x + w, y + (q() - 0.5) * 6); strokeP(g, 3 + q() * 8, LB, 0.18 + q() * 0.2); }
}
function cloud(g, x, y, w) {
  const n = 5;
  shape(g, () => { g.moveTo(x - w / 2, y); for (let k = 0; k < n; k++) { const cx = x - w / 2 + (k + 0.5) * w / n; g.arc(cx, y, (w / n) * (0.55 + 0.2 * Math.sin(k * 2.3)), Math.PI, 0); } g.closePath(); }, { fill: WH, lw: 2.6 });
  shape(g, () => g.rect(x - w / 2 + 6, y - 9, w - 12, 8), { wash: 0.45 });
}
function sun(g, x, y, r) {
  for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU, L = k % 2 ? r * 1.6 : r * 2.1; g.beginPath(); g.moveTo(x + Math.cos(a - 0.09) * r * 1.05, y + Math.sin(a - 0.09) * r * 1.05); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.lineTo(x + Math.cos(a + 0.09) * r * 1.05, y + Math.sin(a + 0.09) * r * 1.05); g.closePath(); fillP(g, k % 2 ? LB : OCH, 0.85); strokeP(g, 1.6); }
  shape(g, () => g.arc(x, y, r, 0, TAU), { fill: OCH, fa: 0.9, lw: 3 });
  shape(g, () => g.arc(x, y, r * 0.7, 0, TAU), { lw: 1.5, col: OCHD });
}
function waves(g, x0, y0, x1, y1, sc = 1) {
  shape(g, () => g.rect(x0, y0, x1 - x0, y1 - y0), { fill: LB2, fa: 0.32 });
  let y = y0 + 12, row = 0;
  while (y < y1 + 14) {
    const k = (0.75 + 0.6 * (y - y0) / Math.max(1, y1 - y0)) * sc, sp = 46 * k, rr = 13 * k;
    for (let x = x0 - sp + (row % 2) * sp / 2; x < x1 + sp; x += sp) {
      g.beginPath(); g.arc(x, y, rr, Math.PI * 1.02, Math.PI * 1.98); strokeP(g, 2.8 * k, COB, 0.92);
      g.beginPath(); g.arc(x + rr * 0.42, y - rr * 0.12, rr * 0.42, Math.PI * 1.1, Math.PI * 2.15); strokeP(g, 1.9 * k, COB, 0.85);
      g.beginPath(); g.moveTo(x - rr * 1.5, y + rr * 0.3); g.lineTo(x + rr * 1.2, y + rr * 0.3); strokeP(g, 1.3 * k, LB, 0.8);
    }
    y += 21 * k; row++;
  }
}
function house(g, q, x, base, w, h) {
  shape(g, () => g.rect(x, base - h, w, h), { fill: WH });
  shape(g, () => g.rect(x + w * 0.62, base - h, w * 0.38, h), { wash: 0.38 });
  const rh = Math.min(h * 0.5, w * 0.45);
  shape(g, () => { g.moveTo(x - 3, base - h); g.lineTo(x + w * 0.5, base - h - rh); g.lineTo(x + w + 3, base - h); g.closePath(); }, { fill: WH, hatch: [4.5, 0.25, 1.3, 0.8], lw: 2.1 });
  shape(g, () => g.rect(x, base - h, w, h), { lw: 2.1 });
  g.fillStyle = COB; const nw = Math.max(1, Math.floor(w / 13)), nh = Math.max(1, Math.floor(h / 15));
  for (let a = 0; a < nw; a++) for (let b = 0; b < nh; b++) if (q() < 0.8) g.fillRect(x + (a + 0.5) * w / nw - 2.3, base - h + (b + 0.35) * h / nh, 4.6, 6);
}
function church(g, q, x, base, w, h) {
  house(g, q, x, base, w, h * 0.55);
  for (const tx of [x - 2, x + w - w * 0.3 + 2]) {
    const tw = w * 0.3, th = h;
    shape(g, () => g.rect(tx, base - th, tw, th), { fill: WH, lw: 2.1 });
    shape(g, () => g.rect(tx + tw * 0.6, base - th, tw * 0.4, th), { wash: 0.4 });
    shape(g, () => { g.moveTo(tx - 2, base - th); g.quadraticCurveTo(tx + tw / 2, base - th - tw * 1.3, tx + tw + 2, base - th); g.closePath(); }, { fill: LB, fa: 0.7, lw: 2 });
    g.beginPath(); g.moveTo(tx + tw / 2, base - th - tw * 0.65); g.lineTo(tx + tw / 2, base - th - tw * 1.2); strokeP(g, 1.8);
    g.fillStyle = COB; g.fillRect(tx + tw / 2 - 3, base - th + 8, 6, 10);
  }
}
function castle(g, x, base, w, h) {
  shape(g, () => g.rect(x, base - h, w, h), { fill: WH, hatch: [6, 0.9, 1.2, 0.35], lw: 2.4 });
  for (let k = 0; k < Math.floor(w / 10); k++) if (k % 2 === 0) shape(g, () => g.rect(x + k * 10, base - h - 7, 9, 7), { fill: WH, lw: 2 });
  for (const tx of [x - 6, x + w - 10]) { shape(g, () => g.rect(tx, base - h - 18, 16, h + 18), { fill: WH, wash: 0.25, lw: 2.2 }); for (let k = 0; k < 2; k++) shape(g, () => g.rect(tx + k * 9, base - h - 25, 6, 7), { fill: WH, lw: 1.8 }); }
}
function town(g, q, x0, x1, baseFn, n, hmin, hmax, wmin, wmax, pc = 0.1) {
  const L = [];
  for (let k = 0; k < n; k++) { const x = x0 + q() * (x1 - x0), w = wmin + q() * (wmax - wmin); L.push({ x, w, b: baseFn(x + w / 2) + q() * 6, h: hmin + q() * (hmax - hmin), ch: q() < pc }); }
  L.sort((a, b) => a.b - b.b);
  for (const o of L) (o.ch ? church : house)(g, q, o.x, o.b, o.w * (o.ch ? 1.3 : 1), o.ch ? o.h * 1.5 : o.h);
}
function hill(g, pts, base, o = {}) {
  shape(g, () => { g.moveTo(pts[0][0], base); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(pts[pts.length - 1][0], base); g.closePath(); }, { fill: WH, wash: o.wash ?? 0.22, hatch: o.hatch ?? [7, 0.95, 1.3, 0.35] });
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); strokeP(g, 2.6);
}
function ship2(g, x, y, s, dir = 1) {
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  for (const [mx, mh] of [[-28, 70], [2, 88], [32, 70]]) {
    g.beginPath(); g.moveTo(mx, -12); g.lineTo(mx, -12 - mh); strokeP(g, 2.4);
    for (const [sy, sw, sh] of [[-20, 32, 26], [-50, 26, 22]]) {
      const yy = sy * (mh / 88);
      shape(g, () => { g.moveTo(mx - sw / 2, yy - sh); g.lineTo(mx + sw / 2, yy - sh); g.quadraticCurveTo(mx + sw / 2 + 5, yy - sh / 2, mx + sw / 2, yy); g.lineTo(mx - sw / 2, yy); g.quadraticCurveTo(mx - sw / 2 + 5, yy - sh / 2, mx - sw / 2, yy - sh); g.closePath(); }, { fill: WH, wash: 0.2, lw: 2 });
    }
    shape(g, () => { g.moveTo(mx, -12 - mh); g.lineTo(mx + 16, -9 - mh); g.lineTo(mx, -6 - mh); g.closePath(); }, { fill: OCH, lw: 1.2 });
  }
  g.beginPath(); g.moveTo(52, -16); g.lineTo(82, -34); strokeP(g, 2.2);
  shape(g, () => { g.moveTo(-56, -22); g.lineTo(-50, 3); g.quadraticCurveTo(-20, 14, 30, 8); g.quadraticCurveTo(50, 2, 58, -14); g.lineTo(-56, -22); g.closePath(); }, { fill: COB, fa: 0.92, lw: 2.2 });
  shape(g, () => g.rect(-48, -14, 98, 4), { fill: WH });
  g.fillStyle = WH; for (let k = 0; k < 7; k++) g.fillRect(-42 + k * 13, -6, 5, 4);
  g.restore();
}
function person2(g, x, y, s, col = COB) {
  shape(g, () => g.arc(x, y - s * 0.86, s * 0.12, 0, TAU), { fill: col });
  shape(g, () => { g.moveTo(x - s * 0.17, y - s * 0.72); g.lineTo(x + s * 0.17, y - s * 0.72); g.lineTo(x + s * 0.22, y); g.lineTo(x - s * 0.22, y); g.closePath(); }, { fill: col });
}
function soldier2(g, x, y, s, ph = 0) {
  g.save(); g.fillStyle = COB;
  g.beginPath(); g.ellipse(x, y - s * 0.93, s * 0.19, s * 0.07, 0, Math.PI, TAU); g.fill();
  g.beginPath(); g.arc(x, y - s * 0.83, s * 0.07, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(x - s * 0.12, y - s * 0.75); g.lineTo(x + s * 0.12, y - s * 0.75); g.lineTo(x + s * 0.13, y - s * 0.42); g.lineTo(x - s * 0.13, y - s * 0.42); g.closePath(); g.fill();
  g.restore();
  g.beginPath(); g.moveTo(x - s * 0.04, y - s * 0.44); g.lineTo(x - s * 0.15 - ph * s * 0.05, y); g.moveTo(x + s * 0.04, y - s * 0.44); g.lineTo(x + s * 0.14, y); strokeP(g, s * 0.07);
  g.beginPath(); g.moveTo(x + s * 0.12, y - s * 0.45); g.lineTo(x + s * 0.2, y - s * 1.18); strokeP(g, Math.max(1.4, s * 0.035));
  g.beginPath(); g.moveTo(x - s * 0.1, y - s * 0.72); g.lineTo(x + s * 0.1, y - s * 0.46); g.moveTo(x + s * 0.1, y - s * 0.72); g.lineTo(x - s * 0.1, y - s * 0.46); strokeP(g, Math.max(1, s * 0.025), WH);
}
function palm(g, x, base, h) {
  g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + h * 0.15, base - h * 0.5, x + h * 0.05, base - h); strokeP(g, 4);
  const tx = x + h * 0.05, ty = base - h;
  for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI, L = h * 0.55; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - 10, tx + Math.cos(a) * L, ty + Math.sin(a) * L * 0.5 + 18); strokeP(g, 4.5, COB, 0.9); }
}
function compass(g, x, y, r) {
  g.save(); g.translate(x, y);
  shape(g, () => g.arc(0, 0, r, 0, TAU), { fill: WH, lw: 3 }); shape(g, () => g.arc(0, 0, r * 0.84, 0, TAU), { lw: 1.4 });
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4 - Math.PI / 2, L = k % 2 ? r * 0.58 : r * 0.97, w = r * 0.16;
    for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.lineTo(Math.cos(a + sg * 0.78) * w, Math.sin(a + sg * 0.78) * w); g.closePath(); fillP(g, sg > 0 ? COB : (k % 2 ? LB : OCH)); strokeP(g, 1.3); }
  }
  g.restore();
}
function banner(g, x, y, h, txt, o = {}) {
  const size = o.size || h * 0.56;
  g.save(); g.font = `${o.w || 700} ${size}px ${o.font || SERIF}`; const tw = g.measureText(txt).width; g.restore();
  const w = Math.max(o.minW || 0, tw + h * 1.4);
  for (const s of [-1, 1]) {
    const ex = x + s * w / 2;
    shape(g, () => { g.moveTo(ex - s * 12, y - h * 0.25); g.lineTo(ex + s * h * 0.95, y - h * 0.25 + 8); g.lineTo(ex + s * h * 0.55, y + h * 0.33); g.lineTo(ex + s * h * 0.95, y + h * 0.8); g.lineTo(ex - s * 12, y + h * 0.8); g.closePath(); }, { fill: LB, fa: 0.8, lw: 2.6 });
  }
  shape(g, () => { g.moveTo(x - w / 2, y - h / 2); g.quadraticCurveTo(x, y - h / 2 - 12, x + w / 2, y - h / 2); g.lineTo(x + w / 2, y + h / 2); g.quadraticCurveTo(x, y + h / 2 - 12, x - w / 2, y + h / 2); g.closePath(); }, { fill: WH, lw: 3.2 });
  shape(g, () => { g.moveTo(x - w / 2 + 9, y - h / 2 + 5); g.quadraticCurveTo(x, y - h / 2 - 6, x + w / 2 - 9, y - h / 2 + 5); g.lineTo(x + w / 2 - 9, y + h / 2 - 7); g.quadraticCurveTo(x, y + h / 2 - 18, x - w / 2 + 9, y + h / 2 - 7); g.closePath(); }, { lw: 2.4, col: OCH });
  text(g, txt, x, y - 3, size, { font: o.font, w: o.w, col: o.col });
}
function shield(g, x, y, w, h, fillCol, inner) {
  const p = () => { g.moveTo(x - w / 2, y - h / 2); g.lineTo(x + w / 2, y - h / 2); g.lineTo(x + w / 2, y + h * 0.15); g.quadraticCurveTo(x + w / 2, y + h / 2, x, y + h / 2); g.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h * 0.15); g.closePath(); };
  shape(g, p, { fill: fillCol, lw: 4 });
  g.save(); g.beginPath(); p(); g.clip(); inner(); g.restore();
  shape(g, p, { lw: 4 });
}

// ---------- tile-level ornament (outside the murals) ----------
function padrao(g, x, y) {
  g.save(); g.beginPath(); g.rect(x, y, TP, TP); g.clip(); g.translate(x, y);
  for (const [cx, cy] of [[0, 0], [64, 0], [0, 64], [64, 64]]) { shape(g, () => g.arc(cx, cy, 21, 0, TAU), { fill: LB2, fa: 0.6, lw: 3.6 }); shape(g, () => g.arc(cx, cy, 9, 0, TAU), { fill: COB }); }
  for (let k = 0; k < 4; k++) { g.save(); g.translate(32, 32); g.rotate(k * Math.PI / 2 + Math.PI / 4); shape(g, () => g.ellipse(0, -12, 6, 12, 0, 0, TAU), { fill: COB }); g.restore(); }
  for (let k = 0; k < 4; k++) { g.save(); g.translate(32, 32); g.rotate(k * Math.PI / 2); shape(g, () => g.ellipse(0, -13, 3.6, 8, 0, 0, TAU), { fill: LB }); g.restore(); }
  shape(g, () => g.arc(32, 32, 5, 0, TAU), { fill: OCH });
  g.restore();
}
function barra(g, x, y) {
  g.save(); g.beginPath(); g.rect(x, y, TP, TP); g.clip(); g.translate(x, y);
  g.fillStyle = COB; g.globalAlpha = 0.93; g.fillRect(0, 0, TP, TP); g.globalAlpha = 1;
  shape(g, () => { g.moveTo(32, 4); g.lineTo(60, 32); g.lineTo(32, 60); g.lineTo(4, 32); g.closePath(); }, { lw: 3, col: WH });
  shape(g, () => g.arc(32, 32, 10, 0, TAU), { fill: WH, fa: 0.9 });
  shape(g, () => g.arc(32, 32, 4, 0, TAU), { fill: OCH });
  for (const [cx, cy] of [[0, 0], [64, 0], [0, 64], [64, 64]]) shape(g, () => g.arc(cx, cy, 12, 0, TAU), { lw: 2.6, col: LB2 });
  g.restore();
}
function rope(g, x, y) {
  g.save(); g.beginPath(); g.rect(x, y, TP, TP); g.clip(); g.translate(x, y);
  shape(g, () => g.rect(0, 14, 64, 36), { fill: OCH, fa: 0.9 });
  for (let k = -1; k < 4; k++) shape(g, () => g.ellipse(k * 22 + 11, 32, 15, 7, 0.75, 0, TAU), { lw: 3.2 });
  g.beginPath(); g.moveTo(0, 12); g.lineTo(64, 12); g.moveTo(0, 52); g.lineTo(64, 52); strokeP(g, 4);
  g.restore();
}
function rosette(g, cx, cy, r) {
  shape(g, () => g.arc(cx, cy, r, 0, TAU), { fill: WH, lw: 3.5 });
  for (let k = 0; k < 8; k++) { g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 4); shape(g, () => g.ellipse(0, -r * 0.5, r * 0.18, r * 0.38, 0, 0, TAU), { fill: k % 2 ? LB : COB }); g.restore(); }
  shape(g, () => g.arc(cx, cy, r * 0.22, 0, TAU), { fill: OCH, lw: 1.5 });
}
function frame(g) {
  const x0 = (MX0 - 1) * TP, y0 = (NR - MY0 - MHT - 1) * TP, w = (MWT + 2) * TP, h = (MHT + 2) * TP, b = TP, m = b / 2;
  g.save();
  g.fillStyle = WH; g.beginPath(); g.rect(x0, y0, w, h); g.rect(x0 + b, y0 + b, w - 2 * b, h - 2 * b); g.fill("evenodd");
  g.fillStyle = OCH; g.globalAlpha = 0.92; g.beginPath(); g.rect(x0 + 13, y0 + 13, w - 26, h - 26); g.rect(x0 + b - 13, y0 + b - 13, w - 2 * b + 26, h - 2 * b + 26); g.fill("evenodd"); g.globalAlpha = 1;
  const side = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay), n = Math.round(L / 24), ux = (bx - ax) / L, uy = (by - ay) / L; for (let k = 0; k < n; k++) { const cx = ax + ux * (k + 0.5) * L / n, cy = ay + uy * (k + 0.5) * L / n; g.save(); g.translate(cx, cy); g.rotate(Math.atan2(uy, ux) + 0.75); g.beginPath(); g.ellipse(0, 0, 14, 6.5, 0, 0, TAU); strokeP(g, 3.4); g.restore(); } };
  side(x0 + m, y0 + m, x0 + w - m, y0 + m); side(x0 + w - m, y0 + m, x0 + w - m, y0 + h - m); side(x0 + w - m, y0 + h - m, x0 + m, y0 + h - m); side(x0 + m, y0 + h - m, x0 + m, y0 + m);
  g.beginPath(); g.rect(x0 + 7, y0 + 7, w - 14, h - 14); strokeP(g, 6);
  g.beginPath(); g.rect(x0 + b - 7, y0 + b - 7, w - 2 * b + 14, h - 2 * b + 14); strokeP(g, 6);
  for (const [cx, cy] of [[x0 + m, y0 + m], [x0 + w - m, y0 + m], [x0 + m, y0 + h - m], [x0 + w - m, y0 + h - m]]) rosette(g, cx, cy, 27);
  g.restore();
}

// ---------- maps ----------
const PJM = (lo, la) => [(lo + 13) * 54.3, (45.6 - la) * 72.8];
function iberia(g, q, st) {
  waves(g, 0, 0, MW, MH, 0.85);
  const land = GEO.filter((c) => c.rings.some((r) => r.some(([lo, la]) => lo > -14 && lo < 5 && la > 34 && la < 47)));
  const draw = (c) => { for (const ring of c.rings) { g.moveTo(...PJM(...ring[0])); for (const p of ring) g.lineTo(...PJM(...p)); g.closePath(); } };
  for (const c of land) shape(g, () => draw(c), { lw: 12, col: LB, sa: 0.45 });
  for (const c of land) shape(g, () => draw(c), { fill: WH });
  for (const c of land) {
    const o = c.name === "Portugal" ? (st ? { fill: OCH, fa: 0.55, hatch: [6, 0.8, 1.6, 0.55] } : { wash: 0.55, hatch: [6, 0.8, 1.6, 0.55] }) : c.name === "Spain" ? { hatch: [9, -0.8, 1.2, 0.35] } : c.name === "France" ? { wash: 0.18, hatch: [9, 0.2, 1.2, 0.3] } : { hatch: [11, 0.5, 1, 0.22] };
    shape(g, () => draw(c), o);
  }
  for (const c of land) shape(g, () => draw(c), { lw: 3, col: COB });
  // soldier columns (painted) along the invasion routes
  const routes = [[[-1.5, 43.4], [-3.7, 42.3], [-5.7, 40.9], [-6.9, 39.7], [-8.4, 39.2]], [[-8.0, 43.0], [-8.3, 42.2]], [[-5.0, 38.4], [-6.9, 38.9]]];
  for (const rt of routes) for (let k = 0; k < rt.length - 1; k++) { const [a, b] = [PJM(...rt[k]), PJM(...rt[k + 1])]; for (let u = 0.15; u < 1; u += 0.33) soldier2(g, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 14, 26, k % 2); }
  if (st) for (const [lo, la] of [[-8.6, 40.0], [-8.0, 39.0], [-8.9, 38.9], [-7.6, 41.3], [-8.4, 37.6]]) { const [x, y] = PJM(lo, la); soldier2(g, x - 12, y + 12, 26); soldier2(g, x + 12, y + 14, 26, 1); }
  const [lx, ly] = PJM(-9.14, 38.72);
  shape(g, () => g.arc(lx, ly, 11, 0, TAU), { fill: OCH, lw: 3 });
  text(g, "Lisbon", lx + 8, ly + 34, 30, { it: 1 });
  text(g, "PORTUGAL", ...PJM(-8.1, 40.2), 34, { w: 900 });
  text(g, "SPANYOL", ...PJM(-2.0, 39.6), 44, { w: 900, ls: 6 });
  text(g, "PRANCIS", ...PJM(1.0, 45.0), 40, { w: 900, ls: 6 });
  text(g, "Samudra Atlantik", ...PJM(-11.6, 42.0), 28, { it: 1 });
  compass(g, ...PJM(-11.3, 36.4), 42);
}

// ---------- the eight murals ----------
const MUR = [];
MUR[0] = (g, q, st) => { // hook: Lisbon | Rio across the ocean
  sky(g, q, 440); sun(g, 448, 74, 30); cloud(g, 150, 110, 180); cloud(g, 760, 92, 150);
  waves(g, 0, 440, MW, MH);
  hill(g, [[0, 330], [70, 270], [160, 236], [240, 268], [320, 350], [380, 448]], 470);
  castle(g, 120, 252, 90, 26);
  town(g, q, 10, 360, (x) => Math.min(460, 268 + Math.abs(x - 165) * 0.75 + 30), 24, 24, 44, 22, 38, 0.12);
  shape(g, () => g.rect(330, 392, 26, 70), { fill: WH, hatch: [5, 0.9, 1.1, 0.4], lw: 2.3 }); shape(g, () => { g.moveTo(326, 392); g.lineTo(343, 368); g.lineTo(360, 392); g.closePath(); }, { fill: LB, lw: 2 });
  hill(g, [[500, 448], [560, 330], [640, 300], [700, 340], [720, 448]], 470, { wash: 0.16 });
  hill(g, [[690, 448], [730, 300], [770, 196], [810, 186], [846, 230], [880, 360], [896, 448]], 470, { wash: 0.42 });
  town(g, q, 520, 700, () => 460, 12, 18, 32, 20, 32, 0.15);
  text(g, "LISBON", 180, 196, 46, { w: 900, ls: 4 });
  text(g, "RIO DE JANEIRO", 700, 150, 36, { w: 900, ls: 2 });
  ship2(g, 220, 560, 0.55); ship2(g, 760, 620, 0.5, -1);
  g.save(); g.setLineDash([10, 12]); g.beginPath(); g.moveTo(360, 500); g.quadraticCurveTo(448, 640, 600, 500); strokeP(g, 3, OCHD, 0.9); g.restore();
  compass(g, 90, 680, 48);
  banner(g, 448, 690, 64, "AUDIRA", { w: 900, minW: 280 });
  if (st) { shape(g, () => g.rect(330, 250, 236, 92), { fill: WH, lw: 4 }); shape(g, () => g.rect(340, 260, 216, 72), { lw: 2.5, col: OCH }); text(g, "1807", 448, 298, 64, { w: 900 }); }
};
MUR[1] = (g, q, st) => iberia(g, q, st);
MUR[2] = (g, q, st) => { // Lisbon harbour
  sky(g, q, 240); cloud(g, 640, 80, 200); cloud(g, 200, 60, 140);
  hill(g, [[0, 240], [110, 160], [230, 190], [380, 260], [520, 230], [700, 200], [896, 250]], 440, { wash: 0.12, hatch: [9, 0.9, 1.1, 0.25] });
  castle(g, 70, 178, 100, 26);
  town(g, q, 0, 880, (x) => 250 + Math.abs(Math.sin(x / 140)) * 60 + (x < 200 ? -40 : 0), 34, 26, 46, 24, 40, 0.12);
  town(g, q, 0, 880, () => 420, 18, 30, 50, 30, 46, 0.1);
  shape(g, () => g.rect(0, 430, MW, 34), { fill: WH, hatch: [6, 0, 1.3, 0.55], lw: 3 });
  for (let x = 0; x < MW; x += 32) { g.beginPath(); g.moveTo(x, 430); g.lineTo(x, 464); strokeP(g, 1.5); }
  waves(g, 0, 464, MW, MH);
  if (!st) {
    ship2(g, 120, 560, 0.6); ship2(g, 430, 610, 0.5);
    for (let k = 0; k < 70; k++) { const x = 180 + q() * 480, y = 428 - q() * 4; person2(g, x, y, 22 + q() * 6, q() < 0.5 ? COB : LB); }
    banner(g, 448, 690, 60, "LISBON · 27–29 NOV 1807", { size: 30 });
  } else {
    for (let k = 0; k < 16; k++) soldier2(g, 30 + k * 36, 428, 40, k % 2);
    for (let k = 0; k < 9; k++) soldier2(g, 300 + k * 30, 380 - k * 4, 30, k % 2);
    banner(g, 448, 690, 60, "PASUKAN NAPOLEON MASUK", { size: 30 });
  }
};
MUR[3] = (g, q, st) => {
  if (!st) {
    sky(g, q, 300); cloud(g, 200, 120, 220); cloud(g, 640, 70, 160);
    for (let k = 0; k < 6; k++) { const x = 300 + k * 50, y = 150 + (k % 2) * 18; g.beginPath(); g.moveTo(x - 10, y); g.quadraticCurveTo(x - 5, y - 8, x, y); g.quadraticCurveTo(x + 5, y - 8, x + 10, y); strokeP(g, 2.4); }
    compass(g, 780, 190, 70);
    waves(g, 0, 300, MW, MH, 1.15);
    ship2(g, 110, 330, 0.32); ship2(g, 520, 336, 0.3);
    banner(g, 448, 690, 60, "SAMUDRA ATLANTIK", { size: 32 });
  } else {
    sky(g, q, 260); cloud(g, 700, 80, 180); sun(g, 160, 90, 26);
    hill(g, [[0, 290], [150, 200], [420, 170], [700, 210], [896, 260]], 440, { wash: 0.3 });
    town(g, q, 60, 860, (x) => 230 + Math.abs(x - 450) * 0.05, 26, 22, 40, 22, 36, 0.18);
    town(g, q, 0, 896, () => 432, 16, 24, 40, 26, 40, 0.06);
    for (const [x, h] of [[30, 140], [90, 110], [810, 130], [860, 160]]) palm(g, x, 440, h);
    waves(g, 0, 440, MW, MH);
    ship2(g, 150, 560, 0.45); ship2(g, 740, 570, 0.45, -1);
    banner(g, 448, 690, 60, "BRASIL · JAN 1808", { size: 32 });
  }
};
MUR[4] = (g, q, st) => { // Rio
  sky(g, q, 260); cloud(g, 300, 70, 190);
  hill(g, [[0, 260], [120, 200], [260, 150], [380, 210], [520, 250], [640, 230], [700, 300]], 440, { wash: 0.2 });
  hill(g, [[640, 430], [690, 250], [740, 140], [800, 128], [846, 170], [880, 300], [896, 430]], 440, { wash: 0.45 });
  town(g, q, 0, 620, (x) => 330 + x * 0.12, st ? 46 : 22, 20, 36, 20, 32, 0.12);
  town(g, q, 0, 640, () => 430, 12, 26, 44, 26, 40, 0.12);
  shape(g, () => g.rect(200, 372, 210, 58), { fill: WH, lw: 2.6 }); for (let k = 0; k < 9; k++) shape(g, () => { g.moveTo(208 + k * 22, 430); g.lineTo(208 + k * 22, 405); g.arc(218 + k * 22, 405, 10, Math.PI, 0); g.lineTo(228 + k * 22, 430); }, { fill: LB, fa: 0.6, lw: 1.8 });
  shape(g, () => g.rect(196, 360, 218, 14), { fill: WH, hatch: [4, 0.3, 1.2, 0.8], lw: 2 });
  waves(g, 0, 440, MW, MH);
  ship2(g, 520, 540, 0.5); ship2(g, 760, 590, 0.42, -1); ship2(g, 300, 620, 0.38);
  if (st) for (let k = 0; k < 110; k++) person2(g, 10 + q() * 600, 438 - q() * 6, 18 + q() * 6, q() < 0.5 ? COB : LB);
  banner(g, 448, 690, 60, st ? "± 15.000 PENDATANG" : "RIO DE JANEIRO", { size: 32 });
};
MUR[5] = (g, q, st) => {
  if (!st) {
    sky(g, q, 560);
    shield(g, 220, 230, 230, 270, WH, () => {
      shape(g, () => g.rect(100, 90, 240, 300), { fill: OCH, fa: 0.85 });
      shape(g, () => { g.moveTo(132, 112); g.lineTo(308, 112); g.lineTo(308, 270); g.quadraticCurveTo(308, 340, 220, 340); g.quadraticCurveTo(132, 340, 132, 270); g.closePath(); }, { fill: WH, lw: 3 });
      for (const [x, y] of [[220, 170], [180, 220], [220, 220], [260, 220], [220, 270]]) shape(g, () => { g.moveTo(x - 15, y - 18); g.lineTo(x + 15, y - 18); g.lineTo(x + 15, y + 6); g.quadraticCurveTo(x, y + 20, x - 15, y + 6); g.closePath(); }, { fill: COB });
    });
    shield(g, 676, 230, 230, 270, COB, () => {
      g.save(); g.translate(676, 225);
      shape(g, () => g.arc(0, 0, 80, 0, TAU), { lw: 9, col: OCH });
      for (const [rx, ry, rot] of [[80, 26, 0], [80, 26, 0.45], [26, 80, 0], [56, 80, 0]]) shape(g, () => g.ellipse(0, 0, rx, ry, rot, 0, TAU), { lw: 5, col: OCH });
      shape(g, () => g.arc(0, 0, 10, 0, TAU), { fill: OCH });
      g.restore();
    });
    text(g, "PORTUGAL", 220, 400, 36, { w: 900 }); text(g, "BRASIL", 676, 400, 36, { w: 900 });
    text(g, "1815", 448, 120, 64, { w: 900 });
    text(g, "+ ALGARVE", 448, 190, 26, { it: 1 });
    banner(g, 448, 690, 60, "KERAJAAN BERSATU", { size: 32 });
  } else {
    sky(g, q, 330); cloud(g, 680, 90, 190); cloud(g, 260, 130, 150);
    hill(g, [[0, 330], [60, 290], [140, 300], [210, 340], [240, 360]], 370, { wash: 0.25 });
    town(g, q, 0, 220, (x) => 352 - Math.max(0, 120 - Math.abs(x - 100)) * 0.3, 10, 14, 24, 14, 22, 0.15);
    text(g, "Lisbon", 120, 250, 30, { it: 1 });
    waves(g, 0, 360, MW, MH, 1.05);
    g.save(); g.setLineDash([10, 12]); g.beginPath(); g.moveTo(860, 450); g.quadraticCurveTo(500, 380, 230, 400); strokeP(g, 3, OCHD); g.restore();
    banner(g, 448, 690, 60, "APRIL 1821 · PULANG", { size: 32 });
  }
};
MUR[6] = (g, q, st) => {
  if (!st) {
    sky(g, q, 300); cloud(g, 620, 90, 180);
    hill(g, [[500, 430], [560, 250], [610, 160], [660, 150], [700, 200], [740, 330], [780, 430]], 440, { wash: 0.4 });
    town(g, q, 360, 896, () => 432, 16, 24, 40, 24, 36, 0.12);
    shape(g, () => g.rect(40, 200, 360, 232), { fill: WH, lw: 3 });
    shape(g, () => g.rect(40, 200, 360, 22), { fill: WH, hatch: [4, 0.3, 1.2, 0.8], lw: 2 });
    for (let k = 0; k < 6; k++) { const x = 64 + k * 56; shape(g, () => { g.moveTo(x, 330); g.lineTo(x, 262); g.arc(x + 18, 262, 18, Math.PI, 0); g.lineTo(x + 36, 330); g.closePath(); }, { fill: LB, fa: 0.55, lw: 2 }); }
    shape(g, () => g.rect(40, 330, 360, 14), { fill: WH, lw: 2.4 });
    for (let k = 0; k < 24; k++) { g.beginPath(); g.moveTo(48 + k * 15, 344); g.lineTo(48 + k * 15, 370); strokeP(g, 2); }
    waves(g, 0, 440, MW, MH);
    for (let k = 0; k < 40; k++) person2(g, 420 + q() * 450, 438 - q() * 6, 20, q() < 0.5 ? COB : LB);
    banner(g, 448, 690, 60, "PEDRO TETAP DI RIO", { size: 32 });
  } else {
    const fx = 68, fy = 40, fw = 760, fh = 532;
    shape(g, () => g.rect(fx, fy, fw, fh), { fill: "#009C3B", lw: 4 });
    shape(g, () => { g.moveTo(fx + fw / 2, fy + 46); g.lineTo(fx + fw - 64, fy + fh / 2); g.lineTo(fx + fw / 2, fy + fh - 46); g.lineTo(fx + 64, fy + fh / 2); g.closePath(); }, { fill: "#FFDF00", lw: 3 });
    shape(g, () => g.arc(fx + fw / 2, fy + fh / 2, 132, 0, TAU), { fill: "#1C3F94", lw: 3 });
    g.save(); g.beginPath(); g.arc(fx + fw / 2, fy + fh / 2, 132, 0, TAU); g.clip(); g.beginPath(); g.arc(fx + fw / 2 + 60, fy + fh / 2 + 330, 360, Math.PI * 1.25, Math.PI * 1.72); strokeP(g, 22, WH); g.restore();
    banner(g, 448, 690, 60, "7 SEPTEMBER 1822", { size: 34, font: SERIF });
  }
};
MUR[7] = (g, q) => {
  sky(g, q, 430); sun(g, 448, 110, 34); cloud(g, 170, 90, 170); cloud(g, 740, 120, 170);
  hill(g, [[0, 360], [80, 300], [170, 330], [230, 420]], 440, { wash: 0.2 });
  town(g, q, 0, 210, (x) => 380 - Math.max(0, 90 - Math.abs(x - 90)) * 0.5, 10, 16, 28, 16, 26, 0.15);
  hill(g, [[700, 430], [760, 290], [820, 250], [870, 300], [896, 430]], 440, { wash: 0.42 });
  waves(g, 0, 440, MW, MH);
  ship2(g, 448, 470, 1.15);
  banner(g, 448, 300, 92, "AUDIRA", { w: 900, size: 64, minW: 380 });
  text(g, "FAKTA SEJARAH NEGARA · EP 46", 448, 372, 26, { font: MONO, w: 700, ls: 3 });
  banner(g, 448, 690, 54, "LISBON → RIO → BRASIL MERDEKA", { size: 26 });
};

function paintPanel(i, st) {
  const c = document.createElement("canvas"); c.width = CW; c.height = CH;
  const g = c.getContext("2d");
  const q = mulberry(900 + i * 31);
  g.fillStyle = WH; g.fillRect(0, 0, CW, CH);
  for (let r = 0; r < NR; r++) for (let cc = 0; cc < PW; cc++) {
    const x = cc * TP, y = (NR - 1 - r) * TP;
    if (cc >= MX0 - 1 && cc < MX0 + MWT + 1 && r >= MY0 - 1 && r < MY0 + MHT + 1) continue;
    if (r <= 2 || r === 23) barra(g, x, y);
    else if (r === 3 || r === 20) rope(g, x, y);
    else padrao(g, x, y);
  }
  frame(g);
  g.save(); g.translate(MX0 * TP, (NR - MY0 - MHT) * TP); g.beginPath(); g.rect(0, 0, MW, MH); g.clip();
  MUR[i](g, mulberry(77 + i * 13), st);
  g.restore();
  // glaze finish per tile: tone cast, pooled edges, specks
  for (let r = 0; r < NR; r++) for (let cc = 0; cc < PW; cc++) {
    const x = cc * TP, y = (NR - 1 - r) * TP, v = q();
    g.fillStyle = v < 0.5 ? `rgba(255,236,200,${0.03 + v * 0.06})` : `rgba(170,190,230,${(v - 0.5) * 0.08})`; g.fillRect(x, y, TP, TP);
    g.strokeStyle = "rgba(31,63,143,0.07)"; g.lineWidth = 2; g.strokeRect(x + 1.5, y + 1.5, TP - 3, TP - 3);
    for (let k = 0; k < 2; k++) { g.fillStyle = "rgba(31,63,143,0.3)"; g.beginPath(); g.arc(x + 6 + q() * 52, y + 6 + q() * 52, 0.6 + q() * 0.8, 0, TAU); g.fill(); }
  }
  return c;
}
function panelTexture(i) {
  const a = paintPanel(i, 0), b = paintPanel(i, 1);
  const c = document.createElement("canvas"); c.width = CW; c.height = CH * 2;
  const g = c.getContext("2d"); g.drawImage(b, 0, 0); g.drawImage(a, 0, CH);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  return tx;
}

// =====================================================================================
export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x141a2e, exp: 0.9, bloom: [0.1, 0.35, 0.93], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.84;
  const pm = new THREE.PMREMGenerator(r);
  const ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = ENV; scene.environmentIntensity = 0.4;
  cam.near = 0.2; cam.far = 500; cam.updateProjectionMatrix();
  {
    const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0B1226"); gr.addColorStop(0.6, "#1A2340"); gr.addColorStop(1, "#3A3346"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; scene.background = tx;
  }

  // ---------- lights: raking warm key that follows the panel, cool fill ----------
  const hemi = new THREE.HemisphereLight(0xdde6ff, 0x7a5d44, 0.45); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0da, 2.0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 3;
  scene.add(key, key.target);
  const fillL = new THREE.DirectionalLight(0xb9ccff, 0.45); scene.add(fillL, fillL.target);
  const glint = new THREE.PointLight(0xfff4e0, 30, 60, 1.6); scene.add(glint);

  const phys = (c, ro, ex = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: ro, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.07, envMap: ENV, envMapIntensity: 0.9, ...ex });
  const std = (c, ro = 0.7, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const PORC = phys(0xf4f1e8, 0.3), COBM = phys(0x1f3f8f, 0.28), LBM = phys(0x6e8fcb, 0.3), OCHM = phys(0xd8a23a, 0.32);
  const GOLD = std(0xd8a23a, 0.28, 1, { envMap: ENV, envMapIntensity: 1.4 });
  const SKIN = phys(0xe0b089, 0.5, { clearcoat: 0.4 }), HAIR = phys(0x3b2a20, 0.5), DARK = phys(0x1a1d2a, 0.35), RED = phys(0x8f2430, 0.6, { clearcoat: 0.2 });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };

  // ---------- wall coordinates ----------
  const angOf = (i, col) => (i * PW + col) / R; // col in tile units within panel
  const wallP = (a, y, off = 0) => new THREE.Vector3((R - off) * Math.sin(a), y, -(R - off) * Math.cos(a));
  const mur = (i, u, v, off) => { const a = angOf(i, MX0 + u / TP); return wallP(a, MY0 + MHT - v / TP, off); };
  const place = (o, i, u, v, off) => { o.position.copy(mur(i, u, v, off)); o.rotation.set(0, -angOf(i, MX0 + u / TP), 0); };

  // ---------- tiles ----------
  const TS = 0.965, BV = 0.03, DEP = 0.05;
  const tileGeo = (() => {
    const h = TS / 2 - BV, rad = 0.05, s = new THREE.Shape();
    s.moveTo(-h + rad, -h); s.lineTo(h - rad, -h); s.quadraticCurveTo(h, -h, h, -h + rad); s.lineTo(h, h - rad); s.quadraticCurveTo(h, h, h - rad, h); s.lineTo(-h + rad, h); s.quadraticCurveTo(-h, h, -h, h - rad); s.lineTo(-h, -h + rad); s.quadraticCurveTo(-h, -h, -h + rad, -h);
    const geo = new THREE.ExtrudeGeometry(s, { depth: DEP, bevelEnabled: true, bevelThickness: BV * 0.8, bevelSize: BV, bevelSegments: 2, curveSegments: 2 });
    geo.translate(0, 0, BV * 0.8);
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let k = 0; k < p.count; k++) uv.setXY(k, p.getX(k) / TS + 0.5, p.getY(k) / TS + 0.5);
    return geo;
  })();
  const TT = DEP + BV * 1.6;
  const glazeN = (() => {
    const n = 128, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"), img = g.createImageData(n, n), q = mulberry(4);
    const B = []; for (let k = 0; k < 7; k++) B.push([q() * n, q() * n, 14 + q() * 30, (q() - 0.5) * 2]);
    const H = (x, y) => B.reduce((s, [bx, by, sg, a]) => s + a * Math.exp(-((x - bx) ** 2 + (y - by) ** 2) / (2 * sg * sg)), 0);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const dx = H(x + 1, y) - H(x - 1, y), dy = H(x, y + 1) - H(x, y - 1), i = (y * n + x) * 4; img.data[i] = 128 - dx * 90; img.data[i + 1] = 128 + dy * 90; img.data[i + 2] = 255; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); const tx = new THREE.CanvasTexture(c); return tx;
  })();
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(1, 1, 1), tmpE = new THREE.Euler(), Y = new THREE.Vector3(0, 1, 0);
  const PAN = [];
  for (let i = 0; i < NP; i++) {
    const geo = tileGeo.clone(), n = PW * NR;
    const aCell = new Float32Array(n * 2), aSt = new Float32Array(n);
    const q = mulberry(500 + i), T = [];
    for (let rr = 0; rr < NR; rr++) for (let c = 0; c < PW; c++) {
      const k = rr * PW + c; aCell[k * 2] = c + (q() - 0.5) * 0.03; aCell[k * 2 + 1] = rr + (q() - 0.5) * 0.03;
      const a = angOf(i, c + 0.5);
      const base = new THREE.Quaternion().setFromAxisAngle(Y, -a).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((q() - 0.5) * 0.07, (q() - 0.5) * 0.07, (q() - 0.5) * 0.035)));
      const ax = new THREE.Vector3(q() - 0.5, q() - 0.5, q() - 0.5).normalize();
      T.push({ c, r: rr, a, p: wallP(a, rr + 0.5, 0), n: new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), base, ax, D: 3 + q() * 4.5, spin: (q() - 0.5) * 7, jr: q(), mural: c >= MX0 && c < MX0 + MWT && rr >= MY0 && rr < MY0 + MHT, framed: c >= MX0 - 1 && c < MX0 + MWT + 1 && rr >= MY0 - 1 && rr < MY0 + MHT + 1 });
    }
    geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(aCell, 2));
    const stAttr = new THREE.InstancedBufferAttribute(aSt, 1); stAttr.setUsage(THREE.DynamicDrawUsage); geo.setAttribute("aSt", stAttr);
    const mat = new THREE.MeshPhysicalMaterial({ map: panelTexture(i), roughness: 0.32, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.05, normalMap: glazeN, normalScale: new THREE.Vector2(0.3, 0.3), envMap: ENV, envMapIntensity: 0.3 });
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec2 aCell;\nattribute float aSt;")
        .replace("#include <uv_vertex>", "#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vec2((aCell.x + clamp(uv.x, 0.01, 0.99)) / 20.0, ((aCell.y + clamp(uv.y, 0.01, 0.99)) / 24.0) * 0.5 + aSt * 0.5);\n#endif");
    };
    const im = new THREE.InstancedMesh(geo, mat, n);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.castShadow = im.receiveShadow = true; im.frustumCulled = false;
    const col = new THREE.Color();
    T.forEach((tl, k) => { const v = 0.95 + q() * 0.06; col.setRGB(v, v * (0.99 + q() * 0.015), v * (0.98 + q() * 0.03)); im.setColorAt(k, col); });
    scene.add(im);
    PAN.push({ im, T, aSt, stAttr, ev: [], rattle: null, last: null });
  }
  // events (flip waves) keyed to words
  const cellRow = (v) => MY0 + MHT - 1 - Math.floor(v / TP), cellCol = (u) => MX0 + Math.floor(u / TP);
  const mu = (tl) => (tl.c - MX0) / (MWT - 1), mv = (tl) => (tl.r - MY0) / (MHT - 1);
  const radial = (cu, cv) => (tl) => Math.min(1, Math.hypot(mu(tl) - cu, (mv(tl) - cv) * 0.86) / 0.75);
  PAN[0].ev.push({ a: A("s1:1807") - 0.15, spread: 0.35, ord: (tl) => mu(tl), reg: (tl) => tl.c >= cellCol(330) && tl.c <= cellCol(565) && tl.r <= cellRow(250) && tl.r >= cellRow(340) });
  PAN[1].ev.push({ a: A("s2:Portugal") - 0.35, spread: 0.9, ord: (tl) => 1 - (mu(tl) + mv(tl)) / 2, reg: (tl) => tl.mural });
  PAN[2].ev.push({ a: A("s3:pasukan") - 0.3, spread: 1.0, ord: (tl) => mu(tl), reg: (tl) => tl.mural });
  PAN[3].ev.push({ a: A("s4:tiba") - 0.45, spread: 1.0, ord: (tl) => mu(tl), reg: (tl) => tl.mural });
  PAN[4].ev.push({ a: A("s5:menampung") - 0.5, spread: 0.8, ord: radial(0.5, 0.5), reg: (tl) => tl.mural });
  PAN[5].ev.push({ a: A("s6:April") - 0.3, spread: 0.9, ord: (tl) => 1 - mu(tl), reg: (tl) => tl.mural });
  PAN[6].ev.push({ a: A("s7:Tujuh") - 0.3, spread: 1.0, ord: radial(0.5, 0.55), reg: (tl) => tl.mural });
  PAN[5].rattle = [A("s6:krisis") - 0.1, A("s6:April") - 0.4];
  const DROP0 = -0.25, DROPS = 1.15, FL = 0.95;
  function updatePanel(i, t) {
    const P = PAN[i];
    let key = P.ev.map((e) => (t < e.a ? 0 : t > e.a + e.spread + 0.6 ? 2 : (t * 30) | 0)).join();
    if (i === 0) key += t < DROP0 + DROPS + FL + 0.1 ? "d" + ((t * 30) | 0) : "D";
    if (P.rattle && t > P.rattle[0] && t < P.rattle[1] + 0.3) key += "r" + ((t * 30) | 0);
    if (key === P.last) return;
    P.last = key;
    for (let k = 0; k < P.T.length; k++) {
      const tl = P.T[k];
      let st = 0, rot = 0, lift = 0;
      for (const e of P.ev) {
        if (!e.reg(tl)) continue;
        const u = (t - (e.a + e.spread * e.ord(tl))) / 0.5;
        if (u >= 1) st = 1; else if (u > 0) { const s = smooth(u); rot = s < 0.5 ? Math.PI * s : Math.PI * (s - 1); st = s < 0.5 ? 0 : 1; lift = 0.35 * Math.sin(Math.PI * u); }
      }
      P.aSt[k] = st;
      tmpQ.copy(tl.base);
      if (rot) tmpQ.multiply(tmpQ2.setFromAxisAngle(Y, rot));
      tmpV.copy(tl.p).addScaledVector(tl.n, lift);
      if (i === 0 && tl.framed) {
        const t0 = DROP0 + DROPS * (0.75 * (tl.c - MX0 + 1) / (MWT + 1) + 0.25 * tl.jr), u = (t - t0) / FL;
        if (u < 1) {
          let off, sp;
          if (u < 0.72) { const s = smooth(Math.max(0, u) / 0.72); off = tl.D * (1 - s); sp = tl.spin * (1 - s); } else { off = tl.D * 0.07 * Math.sin(Math.PI * (u - 0.72) / 0.28); sp = 0; }
          tmpV.addScaledVector(tl.n, off); tmpV.y += off * 0.35;
          if (sp) tmpQ.multiply(tmpQ2.setFromAxisAngle(tl.ax, sp));
        }
      }
      if (P.rattle && t > P.rattle[0] && t < P.rattle[1] + 0.3 && tl.mural) {
        const amp = smooth((t - P.rattle[0]) / 0.6) * (1 - smooth((t - P.rattle[1]) / 0.3));
        tmpQ.multiply(tmpQ2.setFromEuler(tmpE.set(0, 0, amp * 0.07 * Math.sin(t * 37 + tl.c * 1.7 + tl.r * 2.3))));
        tmpV.addScaledVector(tl.n, amp * 0.08 * (0.5 + 0.5 * Math.sin(t * 29 + tl.c * 3.1 + tl.r)));
      }
      tmpM.compose(tmpV, tmpQ, tmpS); P.im.setMatrixAt(k, tmpM);
    }
    P.im.instanceMatrix.needsUpdate = true; P.stAttr.needsUpdate = true;
  }

  // ---------- room: grout bed, floor, cornice, outer wall ----------
  const noise = (seed, base, amp, n, sz, rep) => { const c = document.createElement("canvas"); c.width = c.height = sz; const g = c.getContext("2d"), q = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, sz, sz); for (let i = 0; i < n; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${amp * (0.3 + q() * 0.7)})`; g.fillRect(q() * sz, q() * sz, 1 + q() * 2.5, 1 + q() * 2.5); } const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); return tx; };
  const grout = add(new THREE.CylinderGeometry(R - 0.02, R - 0.02, NR, 320, 1, true), std(0xc4beb0, 0.95, 0, { map: noise(3, "#c2bcae", 0.18, 40000, 512, [40, 6]), side: THREE.BackSide }), 0, NR / 2, 0);
  grout.castShadow = false;
  const floorTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 2048; const g = c.getContext("2d"), q = mulberry(8); g.fillStyle = "#d9cdb6"; g.fillRect(0, 0, 2048, 2048); for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(120,105,90,${0.08 + q() * 0.12})`; g.lineWidth = 1 + q() * 3; g.beginPath(); let x = q() * 2048, y = q() * 2048; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (q() - 0.4) * 160; y += (q() - 0.5) * 120; g.lineTo(x, y); } g.stroke(); } const C = 1024; for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU; g.beginPath(); g.moveTo(C, C); g.lineTo(C + Math.cos(a - 0.08) * 120, C + Math.sin(a - 0.08) * 120); g.lineTo(C + Math.cos(a) * (k % 2 ? 420 : 760), C + Math.sin(a) * (k % 2 ? 420 : 760)); g.lineTo(C + Math.cos(a + 0.08) * 120, C + Math.sin(a + 0.08) * 120); g.closePath(); g.fillStyle = k % 2 ? "#c99a3c" : "#2b4b93"; g.fill(); } for (const rr of [800, 860, 1000]) { g.strokeStyle = "#2b4b93"; g.lineWidth = rr === 860 ? 30 : 10; g.beginPath(); g.arc(C, C, rr, 0, TAU); g.stroke(); } const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx; })();
  const floor = add(new THREE.CircleGeometry(R + 1, 128), std(0xffffff, 0.35, 0, { map: floorTex, envMap: ENV, envMapIntensity: 0.5 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  const stone = std(0xe6dccb, 0.6, 0, { map: noise(11, "#e6dccb", 0.12, 30000, 512, [30, 1]) });
  add(new THREE.CylinderGeometry(R - 0.5, R - 0.12, 0.9, 256, 1, true), new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.6, side: THREE.BackSide }), 0, NR + 0.45, 0);
  add(new THREE.CylinderGeometry(R + 0.9, R + 0.9, NR + 1.2, 256, 1, true), stone, 0, (NR + 1.2) / 2 - 0.3, 0);
  const rim = add(new THREE.RingGeometry(R - 0.5, R + 0.9, 256), std(0xd8ccb8, 0.7), 0, NR + 0.9, 0); rim.rotation.x = -Math.PI / 2;
  add(new THREE.PlaneGeometry(600, 600), std(0x2a2420, 0.9), 0, -0.05, 0).rotation.x = -Math.PI / 2;

  // ---------- props ----------
  function shipModel(hullTop = PORC, hullLow = COBM, sc = 1) {
    const G = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(-1.9, 1.0); s.lineTo(-1.75, 0.1); s.quadraticCurveTo(-1.2, -0.45, 0, -0.45); s.quadraticCurveTo(1.5, -0.45, 2.15, 0.55); s.lineTo(2.0, 0.75); s.quadraticCurveTo(0.2, 0.5, -0.9, 0.72); s.lineTo(-1.9, 1.0);
    const hg = new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 3, curveSegments: 10 });
    hg.translate(0, 0, -0.45);
    const p = hg.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); const f = (1 - 0.65 * Math.pow(clamp01((x - 0.5) / 1.7), 1.4)) * (0.55 + 0.45 * clamp01((y + 0.45) / 0.8)); p.setZ(k, p.getZ(k) * f); }
    hg.computeVertexNormals();
    const cols = new Float32Array(p.count * 3), cA = new THREE.Color(hullLow.color), cB = new THREE.Color(hullTop.color), cO = new THREE.Color(0xd8a23a);
    for (let k = 0; k < p.count; k++) { const y = p.getY(k), c = y < 0.05 ? cA : y > 0.3 && y < 0.42 ? cA : y > 0.66 ? cO : cB; cols.set([c.r, c.g, c.b], k * 3); }
    hg.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    add(hg, phys(0xffffff, 0.3, { vertexColors: true }), 0, 0, 0, G);
    for (let k = 0; k < 7; k++) for (const z of [-0.5, 0.5]) add(new THREE.BoxGeometry(0.13, 0.09, 0.04), DARK, -1.2 + k * 0.38, 0.2, z * 0.96, G);
    const sailTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"); g.fillStyle = WH; g.fillRect(0, 0, 128, 128); g.fillStyle = COB; g.fillRect(52, 18, 24, 92); g.fillRect(22, 50, 84, 24); g.strokeStyle = LB; g.lineWidth = 3; g.strokeRect(4, 4, 120, 120); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
    const sailM = phys(0xffffff, 0.45, { map: sailTex, side: THREE.DoubleSide, clearcoat: 0.5 });
    const sails = [];
    for (const [mx, mh] of [[-1.05, 2.5], [0.15, 3.1], [1.25, 2.6]]) {
      add(new THREE.CylinderGeometry(0.045, 0.06, mh, 8), GOLD, mx, 0.6 + mh / 2, 0, G);
      for (const [sy, sw, sh] of [[0.38, 1.25, 0.95], [0.72, 1.0, 0.7]]) {
        const sg = new THREE.PlaneGeometry(0.4, sh, 1, 6); const sp = sg.attributes.position;
        for (let k = 0; k < sp.count; k++) { const yy = sp.getY(k) / sh + 0.5; sp.setX(k, sp.getX(k) + 0.22 * Math.sin(Math.PI * yy)); }
        sg.rotateY(Math.PI / 2); sg.scale(1, 1, sw / 0.4); sg.computeVertexNormals();
        const m = add(sg, sailM, mx, 0.6 + mh * sy + sh / 2 * 0.2, 0, G); sails.push(m);
        add(new THREE.CylinderGeometry(0.025, 0.025, sw * 1.1, 6), GOLD, mx, 0.6 + mh * sy + sh * 0.6, 0, G).rotation.x = Math.PI / 2;
      }
      const fl = add(new THREE.ConeGeometry(0.08, 0.5, 4), OCHM, mx + 0.22, 0.6 + mh + 0.05, 0, G); fl.rotation.z = -Math.PI / 2;
    }
    const bs = add(new THREE.CylinderGeometry(0.03, 0.05, 1.5, 6), GOLD, 2.5, 1.0, 0, G); bs.rotation.z = -1.1;
    G.scale.setScalar(sc);
    return G;
  }
  function figure(coat, legs, h = 1, dress = false, sash = OCHM) {
    const G = new THREE.Group();
    const M = (geo, mat, x, y, z, p = G) => add(geo, mat, x, y, z, p);
    const L = [];
    if (dress) M(new THREE.ConeGeometry(0.42, 1.0, 18, 1, true), coat, 0, 0.5, 0).material = coat;
    else for (const sx of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(sx * 0.11, 0.86, 0); G.add(hip); M(new THREE.CapsuleGeometry(0.075, 0.3, 4, 10), legs, 0, -0.2, 0, hip); const knee = new THREE.Group(); knee.position.set(0, -0.42, 0); hip.add(knee); M(new THREE.CapsuleGeometry(0.065, 0.3, 4, 10), DARK, 0, -0.2, 0, knee); M(new THREE.BoxGeometry(0.11, 0.06, 0.22), DARK, 0, -0.4, 0.05, knee); L.push({ hip, knee }); }
    M(new THREE.CylinderGeometry(0.26, 0.17, 0.58, 16), coat, 0, 1.16, 0);
    M(new THREE.CylinderGeometry(0.17, 0.25, 0.3, 16, 1, true), coat, 0, 0.78, 0);
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.12, 12, 10), coat, sx * 0.25, 1.38, 0);
    const sh = M(new THREE.BoxGeometry(0.07, 0.62, 0.36), sash, 0, 1.16, 0.02); sh.rotation.z = 0.62;
    M(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), SKIN, 0, 1.5, 0);
    M(new THREE.SphereGeometry(0.15, 18, 14), SKIN, 0, 1.66, 0);
    const hr = M(new THREE.SphereGeometry(0.158, 18, 12, 0, TAU, 0, 1.45), HAIR, 0, 1.68, -0.012); hr.rotation.x = -0.35;
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.02, 8, 6), DARK, sx * 0.055, 1.68, 0.138);
    const arms = [];
    for (const sx of [-1, 1]) { const sp = new THREE.Group(); sp.position.set(sx * 0.3, 1.38, 0); sp.rotation.z = sx * 0.18; G.add(sp); M(new THREE.CapsuleGeometry(0.06, 0.24, 4, 10), coat, 0, -0.16, 0, sp); const el = new THREE.Group(); el.position.set(0, -0.32, 0); el.rotation.x = -0.7; sp.add(el); M(new THREE.CapsuleGeometry(0.052, 0.22, 4, 10), coat, 0, -0.14, 0, el); M(new THREE.SphereGeometry(0.06, 10, 8), SKIN, 0, -0.3, 0, el); arms.push({ sp, el }); }
    G.scale.setScalar(h);
    return { G, L, arms };
  }
  function plaque(lines, w = 4.2, h = 1.5) {
    const G = new THREE.Group();
    const s = new THREE.Shape(), a = w / 2, b = h / 2, rr = 0.14;
    s.moveTo(-a + rr, -b); s.lineTo(a - rr, -b); s.quadraticCurveTo(a, -b, a, -b + rr); s.lineTo(a, b - rr); s.quadraticCurveTo(a, b, a - rr, b); s.lineTo(-a + rr, b); s.quadraticCurveTo(-a, b, -a, b - rr); s.lineTo(-a, -b + rr); s.quadraticCurveTo(-a, -b, -a + rr, -b);
    add(new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }), PORC, 0, 0, -0.06, G);
    const cw = 1024, ch = Math.round(cw * h / w), c = document.createElement("canvas"); c.width = cw; c.height = ch; const g = c.getContext("2d");
    g.fillStyle = WH; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = COB; g.lineWidth = 14; g.strokeRect(22, 22, cw - 44, ch - 44); g.strokeStyle = OCH; g.lineWidth = 6; g.strokeRect(44, 44, cw - 88, ch - 88);
    for (const [x, y] of [[44, 44], [cw - 44, 44], [44, ch - 44], [cw - 44, ch - 44]]) { g.fillStyle = OCH; g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fill(); g.strokeStyle = COB; g.lineWidth = 4; g.stroke(); }
    const n = lines.length; lines.forEach(([t, sz, font, wgt], k) => { g.fillStyle = COB; g.font = `${wgt || 900} ${sz}px ${font || SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, cw / 2, ch * (0.5 + (k - (n - 1) / 2) * 0.32)); });
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const f = add(new THREE.PlaneGeometry(w - 0.06, h - 0.06), phys(0xffffff, 0.25, { map: tx }), 0, 0, 0.115, G); f.castShadow = false;
    return G;
  }
  function arrowTube(pts, rad = 0.13, mat = OCHM) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 120, rad, 12, false);
    const m = add(geo, mat); m.castShadow = true;
    const head = add(new THREE.ConeGeometry(rad * 2.6, rad * 6, 16), mat);
    const total = geo.index.count;
    return { m, head, curve, set(prog) { prog = clamp01(prog); m.visible = head.visible = prog > 0.01; geo.setDrawRange(0, Math.floor(total * prog / 6) * 6); const u = Math.max(0.02, prog), p = curve.getPointAt(u), d = curve.getTangentAt(u); head.position.copy(p); head.quaternion.setFromUnitVectors(Y, d); }, hide() { m.visible = head.visible = false; } };
  }
  function crown(sc = 1) {
    const G = new THREE.Group();
    add(new THREE.CylinderGeometry(0.6, 0.62, 0.28, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xd8a23a, roughness: 0.28, metalness: 1, envMap: ENV, envMapIntensity: 1.4, side: THREE.DoubleSide }), 0, 0, 0, G);
    add(new THREE.SphereGeometry(0.52, 24, 16, 0, TAU, 0, 1.6), RED, 0, 0.05, 0, G);
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; add(new THREE.SphereGeometry(0.06, 10, 8), PORC, Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, G); add(new THREE.ConeGeometry(0.07, 0.22, 8), GOLD, Math.cos(a) * 0.6, 0.24, Math.sin(a) * 0.6, G); }
    for (let k = 0; k < 2; k++) { const t = add(new THREE.TorusGeometry(0.6, 0.04, 8, 32, Math.PI), GOLD, 0, 0.12, 0, G); t.rotation.y = k * Math.PI / 2; }
    add(new THREE.SphereGeometry(0.09, 12, 10), GOLD, 0, 0.8, 0, G);
    add(new THREE.BoxGeometry(0.05, 0.26, 0.05), GOLD, 0, 0.98, 0, G); add(new THREE.BoxGeometry(0.18, 0.05, 0.05), GOLD, 0, 1.0, 0, G);
    G.scale.setScalar(sc); return G;
  }
  const bob = (G, t, ph, amp = 0.06) => { G.position.y += Math.sin(t * 1.6 + ph) * amp; G.rotation.z = Math.sin(t * 1.3 + ph) * 0.035; };
  const show = (o, k, base = 1) => { o.visible = k > 0.002; if (o.visible) o.scale.setScalar(base * Math.max(0.001, back(k, 1.5))); };

  // P0: arrow Lisbon > Rio, ship, (AUDIRA banderole is painted)
  const ARR0 = arrowTube([[250, 330, 0.6], [330, 170, 2.0], [448, 120, 3.0], [570, 170, 2.0], [640, 300, 0.8]].map(([u, v, o]) => mur(0, u, v, o)), 0.15);
  const SHIP0 = shipModel(PORC, COBM, 0.5); scene.add(SHIP0);
  // P1: invasion arrows, figurine + plaque Joao
  const ARR1 = [[[-1.5, 43.4], [-3.7, 42.3], [-5.7, 40.9], [-6.9, 39.7], [-8.6, 39.0]], [[-8.0, 43.4], [-8.3, 42.2], [-8.5, 41.2]], [[-4.6, 38.2], [-6.9, 38.9], [-8.2, 38.9]]].map((rt, i) => arrowTube(rt.map(([lo, la], k) => { const [u, v] = PJM(lo, la); return mur(1, u, v, 0.4 + 0.5 * Math.sin(Math.PI * k / (rt.length - 1))); }), i === 0 ? 0.16 : 0.12, OCHM));
  const JOAO = figure(COBM, PORC, 1.8); scene.add(JOAO.G);
  const PLQ_J = plaque([["PANGERAN BUPATI", 104], ["JOÃO", 150], ["kelak Raja João VI", 64, SERIF, 700]], 4.4, 2.0); scene.add(PLQ_J);
  // P2: docked ship + boarding figurines
  const SHIP2 = shipModel(PORC, COBM, 0.95); scene.add(SHIP2);
  const BOARD = [];
  for (let k = 0; k < 6; k++) { const f = figure([COBM, LBM, PORC][k % 3], PORC, 0.9, k % 3 === 1, k % 2 ? OCHM : COBM); scene.add(f.G); BOARD.push(f); }
  // P3: fleet + gates
  const FLEET = [[PORC, COBM, 0.75, 0, 1.8, 0], [PORC, COBM, 0.62, -150, 3.2, 40], [PORC, LBM, 0.6, -300, 1.2, -20], [COBM, DARK, 0.55, -80, 4.4, -60], [COBM, DARK, 0.5, -420, 3.8, 60]].map(([a, b, s, du, off, dv]) => { const G = shipModel(a, b, s); scene.add(G); return { G, du, off, dv }; });
  const gateTex = (() => { const c = document.createElement("canvas"); c.width = 256; c.height = 384; const g = c.getContext("2d"); g.fillStyle = WH; g.fillRect(0, 0, 256, 384); g.strokeStyle = COB; g.lineWidth = 10; g.strokeRect(10, 10, 236, 364); for (let k = 0; k < 6; k++) { g.fillStyle = COB; g.fillRect(28 + k * 38, 40, 12, 310); } g.fillRect(20, 120, 216, 12); g.fillRect(20, 260, 216, 12); g.fillStyle = OCH; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(34 + k * 38, 36, 12, 0, TAU); g.fill(); } const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
  const GATES = [-1, 1].map((sgn) => { const piv = new THREE.Group(); scene.add(piv); const m = add(new THREE.BoxGeometry(2.0, 3.0, 0.16), [PORC, PORC, PORC, PORC, phys(0xffffff, 0.25, { map: gateTex }), PORC], -sgn * 1.0, 1.5, 0, piv); return { piv, sgn }; });
  const GPLQ = plaque([["PELABUHAN DIBUKA", 120]], 4.6, 1.1); scene.add(GPLQ);
  // P4: crown, reversed arrow, plaque
  const CROWN = crown(1.15); scene.add(CROWN);
  const ARR4 = arrowTube([[700, 260, 0.6], [560, 120, 2.2], [330, 90, 2.8], [140, 140, 2.0], [40, 250, 0.8]].map(([u, v, o]) => mur(4, u, v, o)), 0.15, OCHM);
  const PLQ_P = plaque([["PEMBALIKAN", 120], ["koloni memerintah negeri induknya", 54, SERIF, 700]], 4.8, 1.5); scene.add(PLQ_P);
  // P5: balance + ship back with crown
  const SCALE = new THREE.Group(); scene.add(SCALE);
  add(new THREE.CylinderGeometry(0.7, 0.9, 0.25, 32), GOLD, 0, 0, 0, SCALE);
  add(new THREE.CylinderGeometry(0.08, 0.11, 3.4, 16), GOLD, 0, 1.8, 0, SCALE);
  add(new THREE.SphereGeometry(0.16, 16, 12), GOLD, 0, 3.55, 0, SCALE);
  const BEAM = new THREE.Group(); BEAM.position.set(0, 3.5, 0.15); SCALE.add(BEAM);
  add(new THREE.BoxGeometry(5.6, 0.12, 0.12), GOLD, 0, 0, 0, BEAM);
  const PANS = [-1, 1].map((sgn) => {
    const G = new THREE.Group(); SCALE.add(G);
    add(new THREE.CylinderGeometry(0.75, 0.6, 0.12, 32), GOLD, 0, 0, 0, G);
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; const ch = add(new THREE.CylinderGeometry(0.012, 0.012, 1.25, 4), GOLD, Math.cos(a) * 0.34, 0.62, Math.sin(a) * 0.34, G); ch.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45); }
    const lab = plaque([[sgn < 0 ? "PORTUGAL" : "BRASIL", 190]], 1.5, 0.6); lab.position.set(0, 0.42, 0.1); lab.scale.setScalar(1); G.add(lab);
    return { G, sgn };
  });
  const SHIP5 = shipModel(PORC, COBM, 0.7); scene.add(SHIP5);
  const CROWN5 = crown(0.45); SHIP5.add(CROWN5); CROWN5.position.set(-0.6, 1.25, 0); CROWN5.scale.setScalar(0.45 / 0.7);
  // P6: Pedro
  const PEDRO = figure(LBM, PORC, 1.3, false, OCHM); scene.add(PEDRO.G);
  const PLQ_D = plaque([["PEDRO", 150], ["putra João · di Rio sejak umur 9", 54, SERIF, 700]], 4.4, 1.5); scene.add(PLQ_D);

  // ---------- camera ----------
  const ph = (i) => angOf(i, 10);
  const ST = (i, d, cy, ly, yaw = 0, side = 0) => [ph(i), d, cy, ly, yaw, side];
  const CAM = track([
    [0, ...ST(0, 50, 13.4, 12.4, 0, 0)],
    [A("s1:memindahkan"), ...ST(0, 45, 13.1, 12.3)],
    [A("s1:samudra"), ...ST(0, 41, 12.9, 12.2)],
    [K.s2 - 0.45, ...ST(0, 40, 12.6, 12.0, 0.015, 0.5)],
    [K.s2 + 0.8, ...ST(1, 42, 11.8, 11.0, -0.02, -1.0)],
    [A("s2:Inggris"), ...ST(1, 41, 11.6, 10.9, 0, 0.5)],
    [A("s2:Pangeran"), ...ST(1, 38, 11.2, 10.4, -0.04, -1.8)],
    [K.s3 - 0.45, ...ST(1, 37.5, 11.1, 10.4, -0.04, -2.1)],
    [K.s3 + 0.8, ...ST(2, 41, 11.8, 10.8, -0.02, -2.0)],
    [A("s3:naik"), ...ST(2, 38, 11.2, 10.4, 0.03, 1.4)],
    [A("s3:Beberapa"), ...ST(2, 39.5, 11.4, 10.6, 0.04, 2.4)],
    [A("s3:pasukan"), ...ST(2, 42, 11.8, 10.9, 0, 0)],
    [K.s4 - 0.45, ...ST(2, 41, 11.6, 10.9, 0, 0.6)],
    [K.s4 + 0.8, ...ST(3, 33, 10.6, 10.4, -0.1, -5.0)],
    [A("s4:Atlantik"), ...ST(3, 31, 10.4, 10.2, -0.02, -1.0)],
    [A("s4:Januari"), ...ST(3, 34, 10.8, 10.4, 0.08, 4.5)],
    [A("s4:tiba"), ...ST(3, 41, 11.6, 10.9, 0, 0)],
    [A("s4:membuka"), ...ST(3, 38, 11.3, 10.6, 0, 0)],
    [K.s5 - 0.45, ...ST(3, 37.5, 11.2, 10.6, 0, 0.4)],
    [K.s5 + 0.8, ...ST(4, 46, 12.2, 11.1, 0, 0)],
    [A("s5:tahun"), ...ST(4, 42, 12.0, 11.1)],
    [A("s5:induknya"), ...ST(4, 39.5, 11.6, 10.8)],
    [K.s6 - 0.45, ...ST(4, 41, 11.7, 10.9, 0, 0.5)],
    [K.s6 + 0.8, ...ST(5, 40, 11.7, 10.9, 0, -1.2)],
    [A("s6:bersatu"), ...ST(5, 38.5, 11.4, 10.7, 0, 0.4)],
    [A("s6:April"), ...ST(5, 41, 11.6, 10.9, 0.02, 1.5)],
    [K.s7 - 0.45, ...ST(5, 41, 11.5, 10.9, -0.03, -1.5)],
    [K.s7 + 0.8, ...ST(6, 37, 11.2, 10.5, -0.04, -2.0)],
    [A("s7:menolak"), ...ST(6, 38, 11.3, 10.6, -0.02, -1.0)],
    [A("s7:Tujuh"), ...ST(6, 43, 11.8, 11.0, 0, 0)],
    [K.s8 - 0.45, ...ST(6, 46, 12.0, 11.0, 0.01, 0.4)],
    [K.s8 + 0.8, ...ST(7, 44, 12.0, 11.0)],
    [A("s8:negara"), ...ST(7, 42, 13.5, 10.8)],
    [A("s8:Menurut"), ...ST(7, 45, 17, 10.2)],
    [K.end + 0.4, ...ST(7, 48.5, 24, 9.4)],
  ]);
  const look = new THREE.Vector3();

  return function draw(t) {
    for (let i = 0; i < NP; i++) updatePanel(i, t);
    const [phi, d, cy, ly, yaw, side] = CAM(t);
    const rc = R - d;
    cam.position.set(rc * Math.sin(phi) + side * Math.cos(phi), cy, -rc * Math.cos(phi) + side * Math.sin(phi));
    look.copy(wallP(phi + yaw, ly, 0)); cam.lookAt(look);
    // key rakes in from upper left of the current wall
    const nx = -Math.sin(phi), nz = Math.cos(phi), tx = Math.cos(phi), tz = Math.sin(phi);
    key.target.position.copy(look); key.position.set(look.x + nx * 26 - tx * 22, look.y + 20, look.z + nz * 26 - tz * 22);
    const sh = t > K.s8 + 1 ? 40 : 22;
    Object.assign(key.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 1, far: 140 }); key.shadow.camera.updateProjectionMatrix();
    fillL.target.position.copy(look); fillL.position.set(look.x + nx * 30 + tx * 25, look.y + 5, look.z + nz * 30 + tz * 25);
    glint.position.set(cam.position.x - tx * 8, cam.position.y + 10, cam.position.z - tz * 8);

    // P0
    { const a = A("s1:memindahkan") - 0.3, b = A("s1:samudra") + 0.2; if (t < K.s2 + 1.2) ARR0.set(smooth((t - a) / (b - a))); else ARR0.hide();
      const k = t < K.s2 + 1.2 ? win(t, 0.6, K.s2 + 1.0, 0.5, 0.2) : 0; show(SHIP0, k, 0.78);
      if (SHIP0.visible) { const u = 330 + 300 * smooth((t - A("s1:seberang") + 1.5) / 4.5); place(SHIP0, 0, u, 540, 1.6); bob(SHIP0, t, 0); } }
    // P1
    { const ta = A("s2:bergerak") - 0.3; ARR1.forEach((ar, i) => { if (t > K.s2 - 1 && t < K.s3 + 1.2) ar.set(smooth((t - ta - i * 0.3) / 1.8)); else ar.hide(); });
      const k = t < K.s3 + 1.2 ? win(t, A("s2:Pangeran") - 0.3, K.s3 + 1.0, 0.45, 0.2) : 0;
      show(JOAO.G, k, 1.8); if (JOAO.G.visible) { place(JOAO.G, 1, 96, 660, 1.4); JOAO.G.position.y -= 0; JOAO.arms[1].sp.rotation.x = -0.25 - 0.2 * Math.sin(t * 1.2); }
      show(PLQ_J, k, 1); if (PLQ_J.visible) place(PLQ_J, 1, 330, 640, 1.3); }
    // P2
    { const vis = t > K.s3 - 1 && t < K.s4 + 1.2;
      const kS = vis ? win(t, K.s3 - 0.8, K.s4 + 1.0, 0.4, 0.2) : 0; show(SHIP2, kS, 0.95);
      if (SHIP2.visible) { const go = smooth((t - A("s3:Beberapa") + 0.3) / 2.6); place(SHIP2, 2, 720 + go * 900, 470, 1.6); bob(SHIP2, t, 1, 0.04); }
      const t0 = A("s3:Hampir") - 0.5, t1 = A("s3:Lisbon") + 0.4;
      BOARD.forEach((f, k) => {
        const u = clamp01((t - t0 - k * 0.45) / Math.max(1, t1 - t0 - 1.6)), x = 220 + k * 30 + u * (560 - k * 30);
        const kk = vis && t < A("s3:Beberapa") ? win(t, t0 + k * 0.2 - 0.6, t0 + k * 0.45 + (t1 - t0 - 1.6) * 0.98, 0.35, 0.3) : 0;
        show(f.G, kk, 0.9); if (!f.G.visible) return;
        place(f.G, 2, x, 438, 1.1 + (k % 2) * 0.5); f.G.rotation.y += Math.PI / 2;
        const w = (t * 7 + k) % TAU, walk = u > 0 && u < 1 ? 1 : 0;
        f.L.forEach((l, j) => { l.hip.rotation.x = walk * 0.45 * Math.sin(w + j * Math.PI); l.knee.rotation.x = walk * 0.5 * Math.max(0, Math.sin(w + j * Math.PI + 1.2)); });
        f.arms.forEach((a, j) => { a.sp.rotation.x = walk * 0.4 * Math.sin(w + j * Math.PI + Math.PI); });
        f.G.position.y += walk * 0.03 * Math.abs(Math.sin(w));
      }); }
    // P3
    { const vis = t > K.s4 - 1 && t < K.s5 + 1;
      const ta = K.s4 - 0.6, tb = A("s4:tiba") + 0.4;
      FLEET.forEach((f, k) => { const kk = vis ? win(t, ta, tb, 0.5, 0.6) : 0; show(f.G, kk, f.G.userData.s ?? (f.G.userData.s = f.G.scale.x)); if (!f.G.visible) return; const u = -150 + 1250 * (t - ta) / (tb - ta) + f.du; place(f.G, 3, u, 470 + f.dv, f.off); bob(f.G, t, k * 1.3); });
      const kg = vis ? win(t, A("s4:Brasil") - 0.5, K.s5 + 0.8, 0.45, 0.2) : 0;
      const op = smooth((t - A("s4:membuka") + 0.1) / 0.9);
      GATES.forEach((gt) => { show(gt.piv, kg, 1); if (!gt.piv.visible) return; place(gt.piv, 3, 448 + gt.sgn * 128, 600, 0.9); gt.piv.rotation.y += gt.sgn * 1.75 * op; });
      show(GPLQ, vis ? win(t, A("s4:membuka") - 0.1, K.s5 + 0.8, 0.4, 0.2) : 0, 0.8); if (GPLQ.visible) place(GPLQ, 3, 448, 230, 1.5); }
    // P4
    { const vis = t > K.s5 - 1 && t < K.s6 + 1.2;
      const kc = vis ? win(t, A("s5:ibu") - 0.4, K.s6 + 1.0, 0.6, 0.2) : 0; CROWN.visible = kc > 0.002;
      if (CROWN.visible) { place(CROWN, 4, 300, 170 - 260 * (1 - eout(kc)), 2.2); CROWN.rotation.y += t * 0.5; CROWN.position.y += Math.sin(t * 1.5) * 0.08; CROWN.scale.setScalar(1.15); }
      if (vis) ARR4.set(smooth((t - A("s5:pembalikan") + 0.4) / 1.4)); else ARR4.hide();
      show(PLQ_P, vis ? win(t, A("s5:pembalikan") - 0.1, K.s6 + 1.0, 0.4, 0.2) : 0, 0.85); if (PLQ_P.visible) place(PLQ_P, 4, 448, 560, 1.6); }
    // P5
    { const vis = t > K.s6 - 1 && t < K.s7 + 1.2;
      const ks = vis ? win(t, K.s6 - 0.2, A("s6:April") - 0.2, 0.5, 0.45) : 0; show(SCALE, ks, 0.95);
      if (SCALE.visible) { place(SCALE, 5, 448, 640, 1.5); SCALE.position.y -= 0; const tilt = 0.32 * (1 - smooth((t - A("s6:dinaikkan") + 0.1) / 1.2)) + 0.02 * Math.sin(t * 2) * (1 - smooth((t - A("s6:setara")) / 2)); BEAM.rotation.z = tilt; PANS.forEach((p) => { p.G.position.set(p.sgn * 2.6 * Math.cos(tilt), 3.5 + p.sgn * 2.6 * Math.sin(tilt) - 1.35, 0.15); }); }
      const k2 = vis ? win(t, A("s6:April") + 0.1, K.s7 + 1.0, 0.4, 0.2) : 0; show(SHIP5, k2, 0.7);
      if (SHIP5.visible) { const u = 1000 - 820 * smooth((t - A("s6:April") - 0.1) / (K.s7 - A("s6:April") + 0.2)); place(SHIP5, 5, u, 470, 1.4); SHIP5.rotation.y += Math.PI; bob(SHIP5, t, 2); } }
    // P6
    { const vis = t > K.s7 - 1 && t < K.s8 + 1.2;
      const k = vis ? win(t, A("s7:Pedro") - 0.3, K.s8 + 1.0, 0.45, 0.2) : 0;
      show(PEDRO.G, k, 1.8); if (PEDRO.G.visible) { place(PEDRO.G, 6, 120, 650, 1.5); PEDRO.G.rotation.y += 0.25; PEDRO.arms[0].sp.rotation.x = -0.3 - 0.9 * smooth((t - A("s7:merdeka") + 0.3) / 0.6); PEDRO.arms[0].sp.rotation.z = -0.18 - 0.5 * smooth((t - A("s7:merdeka") + 0.3) / 0.6); }
      show(PLQ_D, vis ? win(t, A("s7:Pedro") - 0.1, A("s7:Tujuh") + 0.2, 0.4, 0.4) : 0, 0.85); if (PLQ_D.visible) place(PLQ_D, 6, 600, 600, 1.4); }
    comp.render();
  };
}
