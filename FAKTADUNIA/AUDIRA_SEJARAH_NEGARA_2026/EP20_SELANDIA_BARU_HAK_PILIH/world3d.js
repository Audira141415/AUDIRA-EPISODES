// EP20 WATERCOLOR: a European storybook painted on cold-press paper and cut into layered planes.
// Seven stations, far apart on one long table; the camera cuts between them under the HTML page turn:
// G globe (hook), S Wellington street 1890s, P petition room, C Upper House chamber, A Governor's desk,
// B polling place, T paper timeline ribbon. Outro returns to P. Everything is painted once into canvases
// (wash layers, pigment blooms, pooled edges, graphite contours) and every motion is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, ramp, eout, clamp01, stage, pts, back } from "./lib3d.js";
import { GEO } from "./geo.js";
import { NZ } from "./geo_nz.js";

const PAPER = "#FAF6EF", EDGE = "#ECE4D6", GR = "#3C3733", COB = "#4E7B9C", SAGE = "#6F9779", PINE = "#3F6449", ROSE = "#D7837C", ROSED = "#B8605A", OCH = "#E8AB48", UMB = "#7B5943", SKIN = "#F1DCCB", CREAM = "#F6EBD6", SKY = "#A9C3D6", MAUVE = "#9C7A8E", SLATE = "#55606B";
const R = mulberry(1893);
const J = (a) => (R() - 0.5) * a;

// Hermite track with harmonic-mean tangents: never overshoots a key.
function track(keys) {
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

// ---------- watercolor painting on canvas ----------
let U = 1; // canvas px per drawing unit, so pencil and edges keep a constant pixel width
const hexA = (c, a) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const shade = (c, k) => { const n = parseInt(c.slice(1), 16); return `rgb(${((n >> 16) * k) | 0},${(((n >> 8) & 255) * k) | 0},${((n & 255) * k) | 0})`; };
const P = (pts, j = 0.6) => { const q = pts.map(([x, y]) => [x + J(j), y + J(j)]); const f = (g) => { g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }; f.bb = bbox(q); return f; };
const E = (x, y, rx, ry, rot = 0) => { const f = (g) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }; f.bb = [x - rx, y - ry, x + rx, y + ry]; return f; };
const RR = (x, y, w, h, r = 0) => { const f = (g) => { g.beginPath(); g.roundRect(x, y, w, h, r); }; f.bb = [x, y, x + w, y + h]; return f; };
const CU = (bb, fn) => { const f = (g) => { g.beginPath(); fn(g); g.closePath(); }; f.bb = bb; return f; };
function bbox(q) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of q) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }

function wash(g, path, col, a = 0.85) {
  const [x0, y0, x1, y1] = path.bb || [0, 0, 100, 100];
  g.save(); g.fillStyle = col; g.filter = "blur(0.8px)";
  for (let k = 0; k < 2; k++) { g.save(); g.translate(J(1.6 / U), J(1.6 / U)); g.globalAlpha = a * 0.62; path(g); g.fill(); g.restore(); }
  g.restore();
  g.save(); path(g); g.clip();
  const sz = Math.max(x1 - x0, y1 - y0), n = Math.min(70, 6 + ((x1 - x0) * (y1 - y0) * U * U) / 9000);
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = sz * (0.08 + R() * 0.3), dark = R() < 0.55;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, dark ? hexA(col, 0.2) : "rgba(255,253,247,.17)"); gr.addColorStop(1, dark ? hexA(col, 0) : "rgba(255,253,247,0)");
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.globalAlpha = a * 0.55; g.strokeStyle = shade(col, 0.72); g.lineWidth = 2.6 / U; g.filter = "blur(0.7px)"; path(g); g.stroke();
  g.restore();
}
function pencil(g, path, w = 1.7, a = 0.72) {
  g.save(); g.strokeStyle = GR; g.lineJoin = g.lineCap = "round"; g.globalAlpha = a; g.lineWidth = w / U; path(g); g.stroke();
  g.globalAlpha = a * 0.3; g.translate(0.9 / U, -0.7 / U); path(g); g.stroke(); g.restore();
}
function margin(g, path, w = 9) { g.save(); g.fillStyle = g.strokeStyle = PAPER; g.lineJoin = "round"; g.lineWidth = w / U; path(g); g.fill(); g.stroke(); g.restore(); }
// parts: [path, color, alpha, pencil?]
function paint(g, parts, edge = true) {
  if (edge) for (const p of parts) margin(g, p[0]);
  for (const p of parts) if (p[1]) wash(g, p[0], p[1], p[2] ?? 0.86);
  for (const p of parts) if (p[3] !== false) pencil(g, p[0], p[3] || 1.7);
}
function line(g, pts, w = 1.4, a = 0.6, col = GR) {
  g.save(); g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = w / U; g.lineCap = g.lineJoin = "round"; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x + J(0.4 / U), y + J(0.4 / U)) : g.moveTo(x, y))); g.stroke(); g.restore();
}
function txt(g, s, x, y, size, col = GR, { font = "Georgia,serif", style = "italic", weight = 700, align = "center", a = 0.92 } = {}) {
  g.save(); g.font = `${style} ${weight} ${size}px ${font}`; g.fillStyle = col; g.globalAlpha = a; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); g.restore();
}
function paperBg(g, w, h, col = PAPER) {
  g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h * U * U) / 90; i++) { g.fillStyle = `rgba(110,90,70,${R() * 0.045})`; g.fillRect(R() * w, R() * h, (1 + R() * 3) / U, 1 / U); }
}
function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// A painted cutout plane, bottom-centered. lw/lh: drawing units across the canvas.
function cut(w, h, res, lw, lh, draw, o = {}) {
  const c = cv(Math.max(8, Math.round(w * res)), Math.max(8, Math.round(h * res)));
  const g = c.getContext("2d");
  U = c.width / lw; g.scale(c.width / lw, c.height / lh);
  draw(g, lw, lh);
  U = 1;
  const map = tex(c);
  const geo = new THREE.PlaneGeometry(w, h); if (!o.center) geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map, transparent: true, alphaTest: 0.04, roughness: 0.95, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.25 }));
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  return m;
}
function sprite(w, h, res, lw, lh, draw) {
  const c = cv(Math.round(w * res), Math.round(h * res)); const g = c.getContext("2d");
  U = c.width / lw; g.scale(c.width / lw, c.height / lh); draw(g, lw, lh); U = 1;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, depthWrite: false }));
  s.scale.set(w, h, 1); s.center.set(0.5, 0); return s;
}

// ---------- storybook people (no faces: a blank oval with a little blush) ----------
function woman(g, o) {
  const d = o.dress || ROSE, hold = o.hold, parts = [];
  const skirt = CU([10, 110, 90, 248], (g) => { g.moveTo(38, 110); g.bezierCurveTo(30, 160, 16, 214, 10, 238); g.quadraticCurveTo(50, 250, 90, 238); g.bezierCurveTo(84, 214, 70, 160, 62, 110); });
  parts.push([E(41, 245, 6, 3), GR, 0.9, false], [E(59, 245, 6, 3), GR, 0.9, false]);
  parts.push([skirt, d, 0.86]);
  if (o.apron) parts.push([P([[42, 116], [58, 116], [64, 200], [36, 200]]), CREAM, 0.9, 1.2]);
  parts.push([P([[37, 70], [63, 70], [62, 114], [38, 114]]), shade(d, 0.86), 0.9]);
  const up = hold === "banner", fw = hold === "pen" || hold === "roll" || hold === "sheet" || hold === "ballot";
  const arm = (s) => {
    const sx = 50 + s * 18;
    if (up) return P([[sx - 4 * s, 76], [sx + 4 * s, 72], [sx + 9 * s, 34], [sx + 3 * s, 34]]);
    if (fw) return P([[sx - 3 * s, 78], [sx + 5 * s, 84], [50 + s * 7, 116], [50 + s * 2, 112]]);
    return P([[sx - 3 * s, 78], [sx + 5 * s, 80], [sx + 7 * s, 122], [sx + 1 * s, 124]]);
  };
  parts.push([arm(-1), shade(d, 0.9), 0.9], [arm(1), shade(d, 0.9), 0.9]);
  parts.push([E(32, 80, 9, 11), d, 0.88], [E(68, 80, 9, 11), d, 0.88]);
  if (o.cloak) parts.push([P([[29, 70], [71, 70], [80, 156], [20, 156]]), o.cloak, 0.88]);
  const hand = (x, y) => parts.push([E(x, y, 3.4, 3.4), SKIN, 0.95, 1.1]);
  if (up) { hand(41, 32); hand(59, 32); } else if (fw) { hand(46, 114); hand(54, 114); } else { hand(29, 124); hand(71, 124); }
  if (o.loose) parts.push([P([[36, 44], [50, 34], [64, 44], [67, 84], [56, 76], [44, 76], [33, 84]]), o.hair || UMB, 0.88, 1.2]);
  parts.push([RR(46, 60, 8, 12, 2), SKIN, 0.95, 1.1]);
  parts.push([E(50, 49, 11, 13), SKIN, 0.95]);
  if (o.loose) parts.push([E(50, 39, 11.5, 5), o.hair || UMB, 0.9, 1.2]);
  else if (true) parts.push([E(50, 42, 12, 8), o.hair || UMB, 0.9, 1.2], [E(50, 33, 6, 5), o.hair || UMB, 0.9, 1.2]);
  if (o.hat) parts.push([E(50, 37, 20, 4), o.hat, 0.9, 1.3], [RR(42, 27, 16, 10, 2), o.hat, 0.9, 1.3], [RR(42, 33, 16, 3), o.band || COB, 0.95, false]);
  paint(g, parts);
  // skirt folds and blush
  for (const x of [32, 44, 56, 68]) line(g, [[x + (x - 50) * 0.1, 128], [x + (x - 50) * 0.5, 236]], 1.1, 0.35);
  wash(g, E(44.5, 52, 2.6, 1.7), ROSE, 0.5); wash(g, E(55.5, 52, 2.6, 1.7), ROSE, 0.5);
  if (o.cloak) { for (let x = 23; x < 78; x += 3.2) line(g, [[x, 150], [x + J(1), 159]], 1, 0.6); for (let y = 82; y < 150; y += 7) line(g, [[28, y], [72, y + 2]], 0.8, 0.22); }
  if (o.cam !== false) camellia(g, 57, 80, 5.2);
  if (hold === "roll") { paint(g, [[RR(36, 104, 28, 12, 5), CREAM, 0.95]]); for (let x = 40; x < 62; x += 4) line(g, [[x, 107], [x + 2, 113]], 0.8, 0.4); }
  if (hold === "sheet" || hold === "ballot") { paint(g, [[P([[40, 98], [60, 96], [62, 116], [42, 118]]), "#FFFDF7", 0.95, 1.2]]); for (let y = 102; y < 114; y += 4) line(g, [[44, y], [57, y - 1]], 0.8, 0.45); }
  if (hold === "flower") camellia(g, 30, 122, 6);
}
function man(g, o) {
  const c = o.coat || SLATE, parts = [];
  parts.push([E(41, 245, 7, 3), GR, 0.9, false], [E(59, 245, 7, 3), GR, 0.9, false]);
  parts.push([RR(37, 160, 11, 84, 3), shade(c, 0.8), 0.9], [RR(52, 160, 11, 84, 3), shade(c, 0.8), 0.9]);
  parts.push([P([[33, 72], [67, 72], [72, 178], [28, 178]]), c, 0.88]);
  parts.push([P([[44, 72], [56, 72], [50, 104]]), "#FFFDF7", 0.95, 1.1]);
  parts.push([P([[30, 76], [36, 74], [38, 150], [30, 152]]), shade(c, 0.9), 0.9], [P([[70, 76], [64, 74], [62, 150], [70, 152]]), shade(c, 0.9), 0.9]);
  parts.push([E(34, 154, 3.4, 3.6), SKIN, 0.95, 1.1], [E(66, 154, 3.4, 3.6), SKIN, 0.95, 1.1]);
  if (o.sash) parts.push([P([[36, 76], [42, 72], [68, 150], [62, 156]]), o.sash, 0.92, 1.2]);
  parts.push([RR(46, 60, 8, 13, 2), SKIN, 0.95, 1.1], [E(50, 49, 11.5, 13), SKIN, 0.95]);
  parts.push([E(50, 41, 12, 6), o.hair || "#6B5A4C", 0.9, 1.2]);
  if (o.beard) parts.push([P([[40, 54], [60, 54], [57, 68], [50, 72], [43, 68]]), o.hair || "#6B5A4C", 0.85, 1.1]);
  if (o.hat) parts.push([E(50, 37, 17, 3.5), GR, 0.92, 1.2], [RR(41, 14, 18, 23, 2), GR, 0.92, 1.2]);
  paint(g, parts);
  line(g, [[50, 104], [50, 176]], 1.1, 0.5);
}
function camellia(g, x, y, r) {
  const parts = [[E(x - r * 0.9, y + r * 0.9, r * 0.8, r * 0.4, 0.6), SAGE, 0.9, 1]];
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; parts.push([E(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.6, r * 0.45, a), "#FFFFFF", 0.95, 0.9]); }
  parts.push([E(x, y, r * 0.3, r * 0.3), OCH, 0.95, false]);
  paint(g, parts, false);
}
const W_RES = 300;
const womanCut = (o, h = 2.6) => cut(h * 0.4, h, 220, 100, 250, (g) => woman(g, o));
const manCut = (o, h = 2.8) => cut(h * 0.4, h, 220, 100, 250, (g) => man(g, o));

// name tag hanging on a pencil string
function nameTag(name, w = 2.6) {
  return sprite(w, w * 0.34, 240, 260, 88, (g) => {
    line(g, [[130, 86], [130, 62]], 1.6, 0.7);
    paint(g, [[P([[14, 8], [246, 4], [250, 60], [10, 64]], 1.2), "#FFFCF4", 0.97]]);
    wash(g, RR(14, 54, 232, 6), ROSE, 0.6);
    txt(g, name, 130, 32, 34, GR, { font: "Georgia,serif" });
  });
}

// soft contact shadow under things that touch the ground
let BLOB;
function blob(w, d = w * 0.4, a = 0.32) {
  if (!BLOB) { const c = cv(128, 128), g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(60,40,25,1)"); gr.addColorStop(1, "rgba(60,40,25,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); BLOB = tex(c); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, opacity: a, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.012; return m;
}

// ---------- environment pieces ----------
function backdrop(w, h, res, fn) { return cut(w, h, res, w * 20, h * 20, (g, lw, lh) => { paperBg(g, lw, lh); fn(g, lw, lh); }, { center: true, cast: false }); }
function ground(w, d, res, fn) {
  const m = cut(w, d, res, w * 20, d * 20, (g, lw, lh) => { paperBg(g, lw, lh, EDGE); fn(g, lw, lh); }, { center: true, cast: false });
  m.rotation.x = -Math.PI / 2; m.material.alphaTest = 0; m.material.transparent = false; return m;
}
function skyWash(g, lw, lh, top = COB, k = 0.55) {
  for (let i = 0; i < 5; i++) { const y = lh * k * (i / 5); wash(g, P([[-10, y - 30], [lw + 10, y - 40 + J(30)], [lw + 10, y + lh * 0.16], [-10, y + lh * 0.14 + J(30)]], 6), top, 0.2 * (1 - i / 6)); }
}
function cloud(g, cx, cy, s) {
  const parts = [];
  for (let k = 0; k < 5; k++) parts.push([E(cx + (k - 2) * s * 0.7, cy - Math.sin((k / 4) * Math.PI) * s * 0.5, s * (0.55 + R() * 0.25), s * (0.42 + R() * 0.15)), "#FFFFFF", 0.9, 1.2]);
  paint(g, parts, false);
}
function hills(g, lw, base, amp, col, a = 0.85, n = 5) {
  const pts = [[-10, base + 400]];
  for (let i = 0; i <= 40; i++) { const x = (i / 40) * (lw + 20) - 10; pts.push([x, base - amp * (0.5 + 0.5 * Math.sin(i * 0.5 * (n / 5) + R() * 0.4)) ]); }
  pts.push([lw + 10, base + 400]);
  const p = P(pts, 2); wash(g, p, col, a); pencil(g, p, 1.4, 0.4);
}
function windowArch(g, x, y, w, h, glass = SKY) {
  const fr = CU([x, y, x + w, y + h], (g) => { g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); });
  wash(g, fr, glass, 0.8); pencil(g, fr, 1.3, 0.7);
  line(g, [[x + w / 2, y + 2], [x + w / 2, y + h]], 1.1, 0.6); line(g, [[x, y + h * 0.55], [x + w, y + h * 0.55]], 1.1, 0.6);
}
// a generic Victorian parliament: two wings, arcade, pitched slate roofs, a small clock tower and a flag
function parliament(g, lw, lh, label = true) {
  const b = lh - 4, parts = [];
  parts.push([P([[8, b], [8, b - 120], [lw - 8, b - 120], [lw - 8, b]]), "#EAD8B4", 0.85]);
  parts.push([P([[2, b - 118], [lw / 2 - 30, b - 118], [lw / 2 - 30, b - 150], [20, b - 150]]), COB, 0.8]);
  parts.push([P([[lw / 2 + 30, b - 118], [lw - 2, b - 118], [lw - 20, b - 150], [lw / 2 + 30, b - 150]]), COB, 0.8]);
  parts.push([P([[lw / 2 - 40, b], [lw / 2 - 40, b - 170], [lw / 2 + 40, b - 170], [lw / 2 + 40, b]]), "#E3CDA2", 0.88]);
  parts.push([P([[lw / 2 - 46, b - 168], [lw / 2, b - 205], [lw / 2 + 46, b - 168]]), COB, 0.85]);
  parts.push([RR(lw / 2 - 14, b - 245, 28, 44), "#E3CDA2", 0.9], [P([[lw / 2 - 18, b - 243], [lw / 2, b - 268], [lw / 2 + 18, b - 243]]), COB, 0.85]);
  parts.push([P([[lw / 2 - 50, b], [lw / 2 + 50, b], [lw / 2 + 44, b - 12], [lw / 2 - 44, b - 12]]), EDGE, 0.9]);
  paint(g, parts, false);
  wash(g, E(lw / 2, b - 225, 8, 8), "#FFFDF7", 0.95); pencil(g, E(lw / 2, b - 225, 8, 8), 1.2);
  line(g, [[lw / 2, b - 225], [lw / 2, b - 231]], 1.4, 0.8); line(g, [[lw / 2, b - 225], [lw / 2 + 4, b - 223]], 1.4, 0.8);
  line(g, [[lw / 2, b - 268], [lw / 2, b - 300]], 1.6, 0.8);
  wash(g, P([[lw / 2, b - 300], [lw / 2 + 24, b - 295], [lw / 2, b - 288]]), ROSE, 0.9);
  for (let i = 0; i < 6; i++) { windowArch(g, 22 + i * 26, b - 104, 14, 34); windowArch(g, 22 + i * 26, b - 58, 14, 34); windowArch(g, lw - 36 - i * 26, b - 104, 14, 34); windowArch(g, lw - 36 - i * 26, b - 58, 14, 34); }
  for (let i = 0; i < 4; i++) windowArch(g, lw / 2 - 34 + i * 18, b - 150, 12, 40);
  for (let i = 0; i < 3; i++) windowArch(g, lw / 2 - 26 + i * 20, b - 92, 12, 64, "#C9B48E");
  line(g, [[8, b - 70], [lw - 8, b - 70]], 1.2, 0.4);
  if (label) { paint(g, [[RR(lw / 2 - 34, b - 104, 68, 14), PAPER, 0.95, 1.1]], false); txt(g, "PARLEMEN", lw / 2, b - 97, 9.5, GR, { style: "normal" }); }
}
function shop(g, lw, lh, o) {
  const b = lh - 2, parts = [];
  parts.push([P([[4, b], [4, 22], [lw - 4, 22], [lw - 4, b]]), o.col, 0.82]);
  parts.push([RR(0, 14, lw, 12), shade(o.col, 0.8), 0.9]);
  paint(g, parts, true);
  for (let i = 0; i < 3; i++) windowArch(g, 14 + i * ((lw - 28) / 3), 36, (lw - 28) / 3 - 10, 34, SKY);
  // sign board
  paint(g, [[RR(10, 82, lw - 20, 22, 2), o.sign || PAPER, 0.95, 1.4]], false);
  txt(g, o.name, lw / 2, 93, o.fs || 13, o.ink || GR, { style: "normal", weight: 700 });
  // awning stripes
  const aw = P([[6, 106], [lw - 6, 106], [lw + 2, 124], [-2, 124]]);
  margin(g, aw, 4); wash(g, aw, "#FFFDF7", 0.9);
  for (let x = 0; x < lw; x += 12) wash(g, P([[x + 2, 106], [x + 8, 106], [x + 9, 124], [x + 1, 124]], 0.3), o.stripe || ROSE, 0.85);
  pencil(g, aw, 1.4);
  // shop window with goods, door
  wash(g, RR(10, 130, lw * 0.56, b - 140), SKY, 0.75); pencil(g, RR(10, 130, lw * 0.56, b - 140), 1.3);
  for (let k = 0; k < 6; k++) { const x = 16 + k * (lw * 0.56 - 12) / 6; wash(g, RR(x, b - 28 - R() * 14, 6, 18 + R() * 10), [OCH, ROSE, CREAM, SAGE][k % 4], 0.9); }
  if (o.goods) txt(g, o.goods, 10 + lw * 0.28, 140, 6.2, GR, { style: "italic", weight: 600 });
  const dr = RR(lw * 0.7, 130, lw * 0.22, b - 130); wash(g, dr, shade(o.col, 0.7), 0.85); pencil(g, dr, 1.3);
  wash(g, E(lw * 0.76, b - 30, 1.4, 1.4), OCH, 1);
}
function lamp(g, lw, lh) {
  const b = lh - 2;
  paint(g, [[RR(lw / 2 - 2.2, 30, 4.4, b - 30), GR, 0.85, 1.1], [RR(lw / 2 - 6, b - 8, 12, 8), GR, 0.88, 1.1], [P([[lw / 2 - 9, 30], [lw / 2 + 9, 30], [lw / 2 + 6, 8], [lw / 2 - 6, 8]]), "#F6D58E", 0.9, 1.2], [P([[lw / 2 - 11, 9], [lw / 2 + 11, 9], [lw / 2, 0]]), GR, 0.9, 1.1]]);
}
function bush(g, lw, lh, flowers = 14) {
  const parts = [];
  for (let k = 0; k < 9; k++) parts.push([E(lw * (0.15 + R() * 0.7), lh * (0.3 + R() * 0.45), lw * (0.16 + R() * 0.1), lh * (0.2 + R() * 0.1)), k % 2 ? PINE : SAGE, 0.85, false]);
  paint(g, parts);
  for (let k = 0; k < flowers; k++) camellia(g, lw * (0.12 + R() * 0.76), lh * (0.22 + R() * 0.5), lw * 0.045);
}

// paper with signature lines (petitions and rolls)
function sigSheet(g, lw, lh, rows = 40, head = null) {
  paperBg(g, lw, lh, "#FFFCF4");
  if (head) { txt(g, head, lw / 2, 22, 16, GR, { style: "italic" }); line(g, [[20, 36], [lw - 20, 36]], 1, 0.5); }
  const y0 = head ? 46 : 8, dy = (lh - y0) / rows;
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * dy + dy * 0.6;
    line(g, [[6, y + dy * 0.3], [lw - 6, y + dy * 0.3]], 0.6, 0.22, COB);
    let x = 10 + R() * 8; const pts2 = [];
    while (x < lw * (0.55 + R() * 0.35)) { pts2.push([x, y + Math.sin(x * 0.5 + r) * dy * 0.22 + J(dy * 0.2)]); x += 2.4 + R() * 3; }
    line(g, pts2, 1.0, 0.55 + R() * 0.25, R() < 0.2 ? "#2F4A63" : GR);
  }
}

// ---------- post: paper fibre, pigment edge pooling, a little bleed ----------
const PAPERPASS = {
  uniforms: { tDiffuse: { value: null }, amt: { value: 1 } },
  vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader: `uniform sampler2D tDiffuse;uniform float amt;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float L(vec3 c){return dot(c,vec3(.3,.59,.11));}
void main(){vec2 px=vUv*vec2(1080.,1920.);
vec2 w=vec2(n(px*.018),n(px*.018+9.))-.5;vec2 uv=vUv+w*.0018*amt;
vec4 c=texture2D(tDiffuse,uv);vec2 e=vec2(1.6/1080.,1.6/1920.);
float gx=L(texture2D(tDiffuse,uv+vec2(e.x,0.)).rgb)-L(texture2D(tDiffuse,uv-vec2(e.x,0.)).rgb);
float gy=L(texture2D(tDiffuse,uv+vec2(0.,e.y)).rgb)-L(texture2D(tDiffuse,uv-vec2(0.,e.y)).rgb);
float ed=clamp(length(vec2(gx,gy))*2.2,0.,1.);
c.rgb*=1.-.22*ed*amt;
float fib=n(px*.45)*.45+n(px*1.3)*.3+n(px*.08)*.25;
c.rgb*=mix(1.,.95+.08*fib,amt);
gl_FragColor=c;}`,
};

export function create(canvas, K, AT) {
  const A = (k) => (AT[k] !== undefined ? AT[k] : K[k]);
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: "#EFE7DA", exp: 0.82, bloom: [0.1, 0.5, 0.92], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.82;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  const pp = new ShaderPass(PAPERPASS); comp.insertPass(pp, 2);
  scene.add(new THREE.HemisphereLight(0xfff6e5, 0xe6d7bf, 1.55));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.1);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 6; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
  scene.add(sun, sun.target);
  const std = (color, rough = 0.85, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, envMapIntensity: 0.25 });
  const add = (o, x, y, z, parent) => { o.position.set(x, y, z); parent.add(o); return o; };
  const boxM = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = m.receiveShadow = true; return add(m, x, y, z, parent); };

  const SX = [0, 200, 400, 600, 800, 1000, 1200];
  const ST = SX.map((x) => { const G = new THREE.Group(); G.position.x = x; scene.add(G); return G; });
  const [gG, gS, gP, gC, gA, gB, gT] = ST;
  const c1 = A("s2:Di"), c2 = A("s4:Mereka"), c3 = A("s5:Di"), c4 = A("s6:19"), c5 = A("s6:Dua"), c6 = A("s7:Tapi"), c7 = A("s8:Semua");

  // ================= G: GLOBE =================
  {
    const bk = backdrop(44, 46, 26, (g, lw, lh) => {
      skyWash(g, lw, lh, COB, 0.6);
      wash(g, E(lw / 2, lh * 0.62, lw * 0.36, lw * 0.36), OCH, 0.22);
      for (let i = 0; i < 70; i++) { const x = R() * lw, y = R() * lh * 0.5; line(g, [[x - 3, y], [x + 3, y]], 1, 0.35); line(g, [[x, y - 3], [x, y + 3]], 1, 0.35); }
    });
    add(bk, 0, 9, -16, gG);
    const desk = ground(44, 30, 22, (g, lw, lh) => { wash(g, RR(0, 0, lw, lh), "#D9B98A", 0.75); for (let y = 10; y < lh; y += 34) line(g, [[0, y], [lw, y + J(4)]], 1.2, 0.35); });
    add(desk, 0, 0, -1, gG);
    const cl = [[-6.5, 11.5, -9, 4.2], [6.2, 13, -11, 5], [-5.6, 2.6, -5, 3.2], [6, 1.6, -3, 3.6], [4.8, 9.6, -6, 2.6]];
    gG.clouds = cl.map(([x, y, z, s]) => add(cut(s, s * 0.55, 90, 100, 55, (g) => cloud(g, 50, 34, 18), { center: true }), x, y, z, gG));
    // globe
    const c = cv(2048, 1024), g = c.getContext("2d"); U = 1;
    paperBg(g, 2048, 1024, "#F3EEE4");
    g.fillStyle = hexA(COB, 0.62); g.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 260; i++) { const x0 = R() * 2048, y = R() * 1024, rr = 20 + R() * 90, cc = R() < 0.5 ? "rgba(255,255,255,.12)" : "rgba(40,80,110,.12)"; for (const x of [x0 - 2048, x0, x0 + 2048]) { const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, cc); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
    const prj = ([lo, la]) => [((lo + 180) / 360) * 2048, ((90 - la) / 180) * 1024];
    const land = (filter) => { const f = (g) => { g.beginPath(); for (const ct of GEO) { if (!filter(ct.name)) continue; for (const ring of ct.rings) { let pv = null; ring.forEach((p, i) => { const q = prj(p); if (!i || Math.abs(q[0] - pv[0]) > 800) g.moveTo(q[0], q[1]); else g.lineTo(q[0], q[1]); pv = q; }); } } }; f.bb = [0, 0, 2048, 1024]; return f; };
    const notNZ = land((n) => n !== "New Zealand"), nzL = land((n) => n === "New Zealand");
    wash(g, notNZ, SAGE, 0.9); wash(g, notNZ, OCH, 0.18); pencil(g, notNZ, 1.3, 0.6);
    wash(g, nzL, ROSED, 0.95); pencil(g, nzL, 1.6, 0.8);
    for (let lo = -180; lo <= 180; lo += 30) line(g, [[((lo + 180) / 360) * 2048, 0], [((lo + 180) / 360) * 2048, 1024]], 0.8, 0.18);
    for (let la = -60; la <= 60; la += 30) line(g, [[0, ((90 - la) / 180) * 1024], [2048, ((90 - la) / 180) * 1024]], 0.8, 0.18);
    const tilt = add(new THREE.Group(), 0, 4.6, 0, gG), spin = add(new THREE.Group(), 0, 0, 0, tilt);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(3.2, 96, 64), new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.7, metalness: 0, envMapIntensity: 0.25 }));
    globe.castShadow = globe.receiveShadow = true; spin.add(globe);
    const brass = std(OCH, 0.38, 0.55);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.08, 10, 96, Math.PI * 1.2), brass); ring.rotation.z = -Math.PI * 0.1 + Math.PI / 2; ring.castShadow = true; add(ring, 0, 4.6, 0, gG);
    const wood = std(UMB, 0.7);
    add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.4, 40), wood), 0, 0.2, 0, gG).castShadow = true;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.2, 16), brass), 0, 0.9, 0, gG).castShadow = true;
    add(blob(5, 3, 0.35), 0, 0, 0.4, gG);
    // pins
    const v3 = (lo, la, rr) => { const phi = ((lo + 180) / 360) * Math.PI * 2, th = ((90 - la) / 180) * Math.PI; return new THREE.Vector3(-Math.cos(phi) * Math.sin(th) * rr, Math.cos(th) * rr, Math.sin(phi) * Math.sin(th) * rr); };
    const pin = (lo, la, draw, w = 1.25) => {
      const G = new THREE.Group(); const p = v3(lo, la, 3.2), n = p.clone().normalize();
      G.position.copy(p); G.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); spin.add(G);
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), std(GR, 0.5)); st.position.y = 0.5; G.add(st);
      const s = sprite(w, w * 0.8, 200, 100, 80, draw); s.position.y = 1.0; G.add(s);
      return G;
    };
    const flagNo = (word) => (g) => { paint(g, [[P([[6, 10], [94, 6], [96, 56], [8, 60]], 1.5), "#FFFCF4", 0.97]]); txt(g, word, 50, 30, 17, GR); line(g, [[14, 14], [86, 54]], 4, 0.85, ROSED); line(g, [[86, 12], [16, 56]], 4, 0.85, ROSED); };
    const pEu = pin(10, 50, flagNo("Eropa")), pAm = pin(-100, 40, flagNo("Amerika"));
    const pNz = pin(174.8, -41.3, (g) => { camellia(g, 50, 44, 30); });
    gG.pins = [[pEu, "s1:Eropa"], [pAm, "s1:Amerika"], [pNz, "s1:Pasifik"]];
    // NZ map lifted off the globe
    const nz = cut(2.5, 3.3, 260, 100, 132, (g) => {
      const pj = ([lo, la]) => [((lo - 165.6) / 13.4) * 100 * 0.98 + 1, ((-33.8 - la) / 13.8) * 128 + 2];
      const f = (g) => { g.beginPath(); for (const ct of NZ) for (const rg of ct.rings) rg.forEach((p, i) => { const q = pj(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); }; f.bb = [0, 0, 100, 132];
      margin(g, f, 14); wash(g, f, SAGE, 0.9); wash(g, f, OCH, 0.15); pencil(g, f, 1.6, 0.8);
      const w = pj([174.78, -41.29]); wash(g, E(w[0], w[1], 2.6, 2.6), ROSED, 1); pencil(g, E(w[0], w[1], 2.6, 2.6), 1.2);
      paint(g, [[RR(w[0] - 44, w[1] + 5, 40, 10, 1), "#FFFCF4", 0.97, 1]], false); txt(g, "Wellington", w[0] - 24, w[1] + 10.4, 6.2, GR);
    }, { center: true });
    add(nz, 0, 4.6, 3.4, gG); nz.visible = false;
    Object.assign(gG, { tilt, spin, nz });
  }
  const lonRot = (lo) => { const phi = ((lo + 180) / 360) * Math.PI * 2; return -Math.atan2(-Math.cos(phi), Math.sin(phi)); };

  // ================= S: WELLINGTON STREET, 1890s =================
  const people = []; // [mesh, phase]
  {
    const bk = backdrop(60, 34, 18, (g, lw, lh) => {
      skyWash(g, lw, lh, COB, 0.5);
      cloud(g, 200, 90, 40); cloud(g, 820, 70, 34); cloud(g, 520, 150, 28);
      hills(g, lw, lh * 0.62, 120, SAGE, 0.8, 4); hills(g, lw, lh * 0.7, 80, PINE, 0.7, 7);
      wash(g, RR(0, lh * 0.7, lw, lh * 0.08), COB, 0.6);
      for (let i = 0; i < 40; i++) { const x = R() * lw, y = lh * (0.58 + R() * 0.1); paint(g, [[RR(x, y, 8, 6), [CREAM, ROSE, OCH][i % 3], 0.9, 0.8]], false); }
    });
    add(bk, 0, 11, -20, gS);
    const gr = ground(70, 34, 14, (g, lw, lh) => {
      wash(g, RR(0, 0, lw, lh), "#D8B98C", 0.7);
      wash(g, RR(0, lh * 0.27, lw, 24), CREAM, 0.85);
      for (let i = 0; i < 400; i++) { const x = R() * lw, y = lh * 0.35 + R() * lh * 0.6; pencil(g, E(x, y, 5 + R() * 3, 3 + R() * 2), 0.8, 0.22); }
      for (const y of [0.55, 0.62]) line(g, Array.from({ length: 30 }, (_, i) => [i * lw / 29, lh * y + J(6)]), 1.3, 0.3, UMB);
    });
    add(gr, 0, 0, -3, gS);
    const parl = cut(15, 11.5, 70, 300, 230, (g, lw, lh) => parliament(g, lw, lh));
    add(parl, 8.5, 0, -11, gS);
    add(blob(15, 2, 0.25), 8.5, 0, -10.8, gS);
    const shops = [[-10, 5.2, 7.8, { col: ROSE, name: "TOKO KAIN", stripe: SAGE }], [-4.9, 4.8, 6.9, { col: COB, name: "AUDIRA & Co.", goods: "kertas · pena · tinta", sign: "#FFFCF4", ink: ROSED, fs: 15, stripe: COB }], [-0.2, 4.4, 7.4, { col: SAGE, name: "KEDAI TEH", stripe: OCH }]];
    for (const [x, w, h, o] of shops) { add(cut(w, h, 60, 100, (100 * h) / w, (g, lw, lh) => shop(g, lw, lh, o)), x, 0, -5.5, gS); }
    add(blob(16, 1.6, 0.3), -5, 0, -5.2, gS);
    for (const [x, z] of [[-2.7, -2.2], [4.6, -2.6]]) add(cut(0.7, 4.8, 90, 40, 280, lamp), x, 0, z, gS);
    // sign: men only
    const sign = cut(1.9, 2.5, 160, 100, 130, (g) => {
      paint(g, [[RR(46, 50, 8, 80), UMB, 0.9, 1.2], [P([[6, 6], [94, 4], [96, 58], [4, 60]], 1.2), "#FFFCF4", 0.97]]);
      txt(g, "PEMILU", 50, 20, 15, GR, { style: "normal" }); txt(g, "hanya laki-laki", 50, 42, 12, ROSED);
    });
    add(sign, 4.4, 0, -0.4, gS); gS.sign = sign;
    // banner held by two women
    const ban = cut(2.6, 0.95, 150, 260, 95, (g) => { paint(g, [[P([[4, 8], [256, 4], [252, 84], [8, 90]], 2), "#FFFCF4", 0.97]]); wash(g, RR(8, 70, 244, 10), ROSE, 0.7); txt(g, "HAK PILIH", 130, 30, 34, ROSED, { style: "normal" }); txt(g, "untuk perempuan", 130, 58, 22, GR); });
    add(ban, 2.25, 2.25, 0.82, gS); gS.ban = ban;
    const W = [[-6.6, 1.2, { dress: MAUVE, hat: OCH, band: ROSE }], [-5.0, 0.3, { dress: SAGE, hat: CREAM, band: COB, apron: true }], [-2.4, 1.5, { dress: OCH, hat: "#C9B48E", band: ROSED, hold: "flower" }],
      [-0.5, 0.7, { dress: "#3E5A74", hat: GR, band: ROSE, hold: "roll" }], [1.3, 0.85, { dress: ROSE, hat: CREAM, band: SAGE, hold: "banner" }], [3.2, 0.85, { dress: UMB, hold: "banner", hair: "#5A4636" }]];
    W.forEach(([x, z, o], i) => { const m = womanCut(o, 2.7); add(m, x, 0, z, gS); add(blob(1.4, 0.6, 0.3), x, 0, z + 0.1, gS); people.push([m, i * 1.7]); if (i === 3) gS.kate = m; });
    const kt = nameTag("Kate Sheppard", 1.7); add(kt, -0.5, 2.95, 0.9, gS); gS.ktag = kt;
    add(cut(5, 3.2, 70, 160, 102, (g, lw, lh) => bush(g, lw, lh, 12)), -8.6, 0, 5.2, gS);
    add(cut(4.4, 2.8, 70, 160, 102, (g, lw, lh) => bush(g, lw, lh, 10)), 7.6, 0, 4.6, gS);
    // three bills that fail
    gS.bills = ["1878", "1879", "1887"].map((y, i) => {
      const m = cut(1.7, 2.2, 180, 100, 130, (g) => {
        paint(g, [[P([[4, 4], [96, 2], [97, 126], [3, 128]], 1.4), "#FFFCF4", 0.97]]);
        txt(g, "RUU HAK PILIH", 50, 16, 9, GR, { style: "normal" }); txt(g, "PEREMPUAN", 50, 28, 9, GR, { style: "normal" });
        for (let k = 0; k < 7; k++) line(g, [[14, 44 + k * 7], [86 - R() * 20, 44 + k * 7]], 0.9, 0.35);
        txt(g, y, 50, 106, 26, ROSED, { style: "normal" });
      }, { center: true });
      add(m, 5.6 + i * 2.1, 5.2, -3.4 + i * 0.2, gS); return m;
    });
  }

  // ================= P: PETITION ROOM =================
  {
    const bk = backdrop(40, 22, 22, (g, lw, lh) => {
      wash(g, RR(0, 0, lw, lh), ROSE, 0.42);
      for (let y = 16; y < lh * 0.7; y += 46) for (let x = (y / 46) % 2 ? 23 : 0; x < lw; x += 46) { pencil(g, E(x, y, 7, 10), 1, 0.22); wash(g, E(x, y, 3, 3), ROSED, 0.25); }
      wash(g, RR(0, lh * 0.72, lw, lh * 0.28), UMB, 0.75);
      for (let x = 20; x < lw; x += 70) pencil(g, RR(x, lh * 0.76, 52, lh * 0.18), 1.2, 0.45);
      for (const x of [lw * 0.22, lw * 0.78]) { windowArch(g, x - 50, 40, 100, 220, "#CFE0EA"); wash(g, E(x, 150, 70, 110), "#FFF6DA", 0.35); }
      wash(g, RR(0, lh * 0.7, lw, 8), OCH, 0.9);
    });
    add(bk, 0, 8, -8, gP);
    const fl = ground(50, 30, 14, (g, lw, lh) => { wash(g, RR(0, 0, lw, lh), "#D2A874", 0.78); for (let x = 0; x < lw; x += 26) line(g, [[x, 0], [x + J(6), lh]], 1.1, 0.35, UMB); });
    add(fl, 0, 0, 2, gP);
    const wood = std(UMB, 0.72), cloth = std("#E7D6BA", 0.95);
    boxM(6.4, 0.22, 2.4, wood, -3.6, 2.0, -3.6, gP);
    for (const [x, z] of [[-6.5, -4.6], [-0.7, -4.6], [-6.5, -2.6], [-0.7, -2.6]]) boxM(0.18, 2.0, 0.18, wood, x, 1.0, z, gP);
    // sheets, ink and pen on the table
    for (let k = 0; k < 5; k++) { const s = cut(0.9, 1.2, 160, 100, 133, (g, lw, lh) => sigSheet(g, lw, lh, 14)); s.rotation.x = -Math.PI / 2; s.rotation.z = J(0.6); add(s, -6 + k * 1.15, 2.125 + k * 0.002, -3.4 + J(0.4), gP); }
    const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 20), new THREE.MeshStandardMaterial({ color: "#2A3440", roughness: 0.15, metalness: 0, envMapIntensity: 0.6 })); ink.castShadow = true; add(ink, -1.4, 2.26, -3.1, gP);
    add(blob(8, 3.4, 0.28), -3.6, 0, -3.6, gP);
    const signers = [[-5.3, -4.6, { dress: SAGE, hat: CREAM, band: ROSE, hold: "pen" }], [-3.0, -4.7, { dress: "#3E5A74", hold: "pen", hat: GR, band: ROSE }], [-1.6, -5.2, { dress: MAUVE, hold: "sheet" }], [-7.4, -5.0, { dress: OCH, hat: "#C9B48E", band: COB }]];
    gP.signers = signers.map(([x, z, o], i) => { const m = womanCut(o, 2.75); add(m, x, 0, z, gP); people.push([m, 3 + i]); return m; });
    // rolls
    const rollTex = () => { const c = cv(512, 512), g = c.getContext("2d"); g.scale(5.12, 5.12); U = 2.2; sigSheet(g, 100, 100, 18); U = 1; const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const capTex = (() => { const c = cv(256, 256), g = c.getContext("2d"); g.fillStyle = "#FFFCF4"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(60,55,51,.6)"; g.lineWidth = 2; g.beginPath(); for (let a = 0; a < 40 * Math.PI; a += 0.1) { const rr = a * 0.95; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.stroke(); return tex(c); })();
    gP.rolls = [[-3.1, 0.62, 1.3, "1891", "s4:sembilan"], [0, 0.7, 2.9, "1892", "s4:hampir"], [3.2, 0.82, 4.6, "1893", "s4:hampir#2"]].map(([x, rad, H, yr, an]) => {
      const t = rollTex(); t.repeat.set(2, 1);
      const geo = new THREE.CylinderGeometry(rad, rad, 1, 48, 1); geo.translate(0, 0.5, 0);
      const m = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, envMapIntensity: 0.25 }), new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.9 }), new THREE.MeshStandardMaterial({ map: capTex, roughness: 0.9 })]);
      m.castShadow = m.receiveShadow = true; add(m, x, 0, 0.6, gP);
      const tg = cut(1.5, 0.95, 200, 150, 95, (g) => { paint(g, [[P([[6, 10], [144, 6], [146, 88], [4, 90]], 1.5), "#FFFCF4", 0.97]]); wash(g, RR(10, 76, 130, 8), yr === "1893" ? ROSE : SAGE, 0.7); txt(g, yr, 75, 44, 46, GR, { style: "normal" }); });
      tg.rotation.x = -0.5; add(tg, x, 0.02, 0.6 + rad + 0.55, gP);
      const bl = add(blob(rad * 3.4, rad * 2.4, 0.35), x, 0, 0.6, gP);
      return { m, t, H, an, tg, bl };
    });
    // the 1893 roll unrolled along the floor
    const st = rollTex(); st.repeat.set(1, 4);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1), new THREE.MeshStandardMaterial({ map: st, roughness: 0.92 }));
    strip.geometry.translate(0, 0.5, 0); strip.rotation.x = -Math.PI / 2; strip.receiveShadow = true; add(strip, 3.2, 0.02, 1.4, gP); gP.strip = strip;
    add(cut(4.6, 3, 70, 160, 104, (g, lw, lh) => bush(g, lw, lh, 9)), -8.4, 0, 3.6, gP);
  }

  // ================= C: UPPER HOUSE CHAMBER =================
  {
    const bk = backdrop(44, 24, 20, (g, lw, lh) => {
      wash(g, RR(0, 0, lw, lh), "#E9C9B4", 0.6);
      for (let i = 0; i < 5; i++) windowArch(g, 70 + i * 180, 40, 70, 210, "#D7E4EC");
      wash(g, RR(0, lh * 0.6, lw, lh * 0.4), UMB, 0.78);
      for (let x = 14; x < lw; x += 58) pencil(g, RR(x, lh * 0.64, 44, lh * 0.3), 1.2, 0.4);
      const th = P([[lw / 2 - 60, lh * 0.66], [lw / 2 - 60, lh * 0.3], [lw / 2, lh * 0.2], [lw / 2 + 60, lh * 0.3], [lw / 2 + 60, lh * 0.66]]);
      wash(g, th, ROSED, 0.85); pencil(g, th, 1.6); wash(g, RR(lw / 2 - 40, lh * 0.4, 80, lh * 0.26), "#C98A58", 0.8);
    });
    add(bk, 0, 7, -12, gC);
    const fl = ground(44, 30, 14, (g, lw, lh) => { wash(g, RR(0, 0, lw, lh), "#9DB3C2", 0.7); for (let i = 0; i < 50; i++) pencil(g, E(R() * lw, R() * lh, 6, 6), 0.8, 0.1); });
    add(fl, 0, 0, 0, gC);
    const wood = std(UMB, 0.7), leather = std("#9E4E48", 0.6);
    const mVar = [{ coat: SLATE, hair: "#6B5A4C" }, { coat: "#3F4A55", hair: "#8C8178", beard: true }, { coat: "#5B5148", hair: "#4A3B30" }, { coat: "#46525E", hair: "#9A8F86", beard: true }];
    const mTex = mVar.map((o) => cut(0.75, 1.9, 150, 100, 250, (g) => man(g, o)));
    gC.seats = [];
    const rows = [[18, 3.8], [20, 5.3]];
    let idx = 0;
    for (const [n, rad] of rows) for (let i = 0; i < n; i++) {
      const a = -1.35 + (2.7 * i) / (n - 1), x = Math.sin(a) * rad, z = -1.2 - Math.cos(a) * rad * 0.75, y = rad > 4 ? 0.35 : 0;
      const S = new THREE.Group(); S.position.set(x, y, z); S.rotation.y = -a * 0.6; gC.add(S);
      if (rad > 4) boxM(1.0, 0.35, 1.0, wood, 0, -0.18, 0, S);
      boxM(0.8, 0.55, 0.7, leather, 0, 0.28, 0, S); boxM(0.8, 1.0, 0.14, leather, 0, 0.75, -0.32, S);
      const fig = mTex[idx % 4].clone(); fig.scale.setScalar(0.92); fig.position.set(0, 0.2, 0.05); S.add(fig);
      const card = boxM(0.62, 0.46, 0.04, std(SAGE, 0.9), 0.32, 1.95, 0.12, S); card.castShadow = true;
      gC.seats.push({ S, card, fig, x, z, side: x < 0 ? 0 : 1, a, i: idx++ });
    }
    // for = left half (19), against = right half (19). Kelly turns against, Reynolds and Stevens turn for.
    gC.seats.sort((p, q) => p.a - q.a || p.z - q.z);
    gC.seats.forEach((s, k) => { s.for0 = k < 19; });
    const forS = gC.seats.filter((s) => s.for0), agS = gC.seats.filter((s) => !s.for0);
    gC.kelly = forS[forS.length - 2]; gC.rey = [agS[3], agS[7]];
    const ring = (col) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, depthWrite: false })); m.rotation.x = -Math.PI / 2; return m; };
    gC.kRing = add(ring(ROSED), gC.kelly.x, 0.4, gC.kelly.z, gC); gC.rRings = gC.rey.map((s) => add(ring(PINE), s.x, 0.4, s.z, gC));
    gC.anger = gC.rey.map((s) => { const sp = sprite(0.7, 0.6, 200, 70, 60, (g) => { for (const x of [22, 46]) { line(g, [[x, 8], [x + 2, 38]], 5, 0.9, ROSED); wash(g, E(x + 2, 50, 3.5, 3.5), ROSED, 1); } }); add(sp, s.x, 2.75 + (s.S.position.y), s.z, gC); return sp; });
    const sed = manCut({ coat: "#2F3A44", hair: "#5A4A3E", beard: true }, 2.9); add(sed, 0, 0, 2.6, gC); add(blob(1.4, 0.6), 0, 0, 2.7, gC); people.push([sed, 9]); gC.sed = sed;
    boxM(1.3, 1.2, 0.7, wood, 0.9, 0.6, 2.4, gC);
    const st = nameTag("Richard Seddon", 2.0); add(st, 0, 3.1, 2.7, gC); gC.stag = st;
  }

  // ================= A: GOVERNOR'S DESK =================
  {
    const bk = backdrop(34, 22, 22, (g, lw, lh) => {
      wash(g, RR(0, 0, lw, lh), CREAM, 0.6);
      windowArch(g, lw / 2 - 120, 40, 240, 300, SKY);
      wash(g, P([[lw / 2 - 118, 260], [lw / 2 - 60, 210], [lw / 2, 240], [lw / 2 + 60, 200], [lw / 2 + 118, 236], [lw / 2 + 118, 338], [lw / 2 - 118, 338]]), SAGE, 0.85);
      wash(g, RR(lw / 2 - 118, 300, 236, 38), COB, 0.8); cloud(g, lw / 2 - 40, 110, 22);
      for (let i = 0; i < 2; i++) { const fx = i ? lw - 190 : 70; paint(g, [[RR(fx, 120, 120, 90, 2), "#C9A060", 0.9]]); wash(g, RR(fx + 10, 130, 100, 70), SAGE, 0.8); wash(g, P([[fx + 10, 200], [fx + 50, 160], [fx + 110, 200]]), PINE, 0.8); }
      for (const x of [lw / 2 - 210, lw / 2 + 130]) { const d = P([[x, 0], [x + 80, 0], [x + 70 + J(10), lh * 0.75], [x + 6, lh * 0.75]]); wash(g, d, COB, 0.8); pencil(g, d, 1.4); for (let k = 1; k < 5; k++) line(g, [[x + k * 16, 10], [x + k * 15, lh * 0.72]], 1, 0.3); }
      wash(g, RR(0, lh * 0.75, lw, lh * 0.25), UMB, 0.7);
    });
    add(bk, 0, 7, -7, gA);
    const fl = ground(36, 24, 14, (g, lw, lh) => { wash(g, RR(0, 0, lw, lh), "#B98F68", 0.75); for (let x = 0; x < lw; x += 22) line(g, [[x, 0], [x, lh]], 1, 0.3); });
    add(fl, 0, 0, 1, gA);
    const wood = std("#6E4C36", 0.55);
    boxM(5.0, 0.2, 2.4, wood, 0, 1.4, 0, gA); boxM(4.8, 1.25, 0.1, wood, 0, 0.68, 1.12, gA);
    for (const x of [-2.35, 2.35]) boxM(0.25, 1.35, 2.2, wood, x, 0.67, 0, gA);
    add(blob(8, 4, 0.3), 0, 0, 0.3, gA);
    const glas = manCut({ coat: "#2E3946", hair: "#A49A90", sash: OCH, beard: true }, 3.4); add(glas, -1.9, 0, -1.6, gA); add(blob(1.4, 0.6), -1.9, 0, -1.5, gA); people.push([glas, 5]); gA.glas = glas;
    const gt = nameTag("Lord Glasgow", 2.3); add(gt, -1.9, 3.3, -1.4, gA); gt.visible = false; gA.gtag = gt;
    // the act on the desk, its signature drawn stroke by stroke
    const dc = cv(640, 860), dg = dc.getContext("2d");
    const docTex = tex(dc);
    const sigPts = []; for (let k = 0; k <= 120; k++) { const u = k / 120; sigPts.push([150 + u * 330, 690 + Math.sin(u * 19) * 26 * (1 - u * 0.4) - u * 30 + Math.sin(u * 5) * 12]); }
    const drawDoc = (p) => {
      U = 6.4; dg.setTransform(6.4, 0, 0, 6.4, 0, 0); paperBg(dg, 100, 134.4, "#FFFCF4"); dg.setTransform(1, 0, 0, 1, 0, 0); U = 1;
      txt(dg, "UNDANG-UNDANG PEMILU", 320, 80, 40, GR, { style: "normal" }); txt(dg, "1893", 320, 132, 44, ROSED, { style: "normal" });
      line(dg, [[80, 170], [560, 170]], 2, 0.5);
      for (let k = 0; k < 14; k++) line(dg, [[80, 210 + k * 26], [560 - R() * 70, 210 + k * 26]], 2, 0.3);
      line(dg, [[140, 730], [520, 730]], 2, 0.5);
      if (p > 0) { const n = Math.floor(p * sigPts.length); line(dg, sigPts.slice(0, Math.max(2, n)), 5, 0.9, "#2A3440"); }
      docTex.needsUpdate = true;
    };
    drawDoc(0);
    const doc = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.55), new THREE.MeshStandardMaterial({ map: docTex, roughness: 0.92 }));
    doc.rotation.x = -Math.PI / 2; doc.rotation.z = 0.06; doc.receiveShadow = true; add(doc, 0.2, 1.515, 0.1, gA);
    gA.drawDoc = drawDoc; gA.sigPts = sigPts; gA.doc = doc; gA.lastSig = -1;
    const quill = cut(0.42, 1.7, 200, 40, 170, (g) => { const f = P([[20, 168], [22, 120], [36, 40], [24, 2], [8, 40], [16, 120]]); margin(g, f, 4); wash(g, f, "#FFFDF7", 0.95); wash(g, f, COB, 0.25); pencil(g, f, 1.4); line(g, [[20, 166], [22, 10]], 1.2, 0.7); });
    quill.rotation.set(-0.5, 0, -0.4); add(quill, 0, 1.53, 0.6, gA); gA.quill = quill;
    const inkw = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.36, 24), new THREE.MeshStandardMaterial({ color: "#2A3440", roughness: 0.12, envMapIntensity: 0.7 })); inkw.castShadow = true; add(inkw, 1.6, 1.68, -0.5, gA);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.06, 32), new THREE.MeshStandardMaterial({ color: ROSED, roughness: 0.35, envMapIntensity: 0.5 })); seal.castShadow = true; add(seal, 0.9, 1.53, 0.95, gA); gA.seal = seal;
    const card = cut(1.7, 1.15, 200, 170, 115, (g) => { paint(g, [[P([[4, 6], [166, 4], [168, 110], [2, 112]], 1.2), "#FFFCF4", 0.97]]); wash(g, RR(10, 92, 150, 10), COB, 0.7); txt(g, "19 SEP", 85, 36, 40, GR, { style: "normal" }); txt(g, "1893", 85, 74, 36, ROSED, { style: "normal" }); });
    card.rotation.set(-0.25, -0.35, 0); add(card, 1.45, 1.5, 0.45, gA); gA.card = card;
    // women of every background, Maori women among them: generic figures, no moko invented
    const row = [[4.0, { dress: COB, hat: CREAM, band: ROSE }], [5.2, { dress: "#5E4A3A", cloak: "#B07A44", loose: true, hair: "#2E241E" }], [6.4, { dress: SAGE, hat: "#C9B48E", band: COB }], [7.6, { dress: "#6A4A3C", cloak: "#C99A5A", loose: true, hair: "#2E241E" }], [8.8, { dress: ROSE, hat: CREAM, band: SAGE }]];
    gA.row = row.map(([x, o], i) => { const m = womanCut(o, 2.75); add(m, x, 0, 1.6, gA); const b = add(blob(1.3, 0.55), x, 0, 1.7, gA); people.push([m, 11 + i]); return [m, b, x]; });
  }

  // ================= B: POLLING PLACE, 28 NOV 1893 =================
  {
    const bk = backdrop(36, 22, 20, (g, lw, lh) => {
      skyWash(g, lw, lh, COB, 0.3);
      const hall = P([[40, lh], [40, 120], [lw / 2, 40], [lw - 40, 120], [lw - 40, lh]]);
      wash(g, hall, "#EADBC0", 0.88); pencil(g, hall, 1.6);
      for (let i = 0; i < 5; i++) windowArch(g, 90 + i * 120, 180, 50, 120, "#CFE0EA");
      const dr = RR(lw / 2 - 40, lh - 170, 80, 170); wash(g, dr, SAGE, 0.85); pencil(g, dr, 1.4);
      wash(g, RR(0, lh - 40, lw, 40), "#CDB08A", 0.8);
    });
    add(bk, 0, 8, -7, gB);
    const fl = ground(40, 26, 14, (g, lw, lh) => { wash(g, RR(0, 0, lw, lh), "#D7BC94", 0.72); for (let i = 0; i < 260; i++) pencil(g, E(R() * lw, R() * lh, 6, 4), 0.8, 0.2); });
    add(fl, 0, 0, 1, gB);
    const poster = cut(2.5, 1.9, 200, 125, 95, (g) => { paint(g, [[P([[4, 6], [121, 3], [122, 90], [3, 92]], 1.2), "#FFFCF4", 0.97]]); txt(g, "PEMILU", 62, 22, 16, GR, { style: "normal" }); txt(g, "28 NOV 1893", 62, 50, 19, ROSED, { style: "normal" }); wash(g, RR(10, 72, 105, 7), SAGE, 0.7); });
    add(poster, -2.8, 3.5, -5.3, gB);
    const wood = std("#7A5238", 0.5), brass = std(OCH, 0.35, 0.6);
    boxM(3.2, 0.16, 1.5, wood, -0.6, 1.75, -0.2, gB);
    const cloth = cut(3.3, 1.45, 90, 110, 48, (g) => { const f = P([[0, 0], [110, 0], [108, 44], [96, 47], [80, 44], [60, 47], [40, 44], [20, 47], [2, 44]]); wash(g, f, ROSE, 0.85); pencil(g, f, 1.3); for (let x = 10; x < 110; x += 12) line(g, [[x, 4], [x + J(2), 42]], 0.9, 0.25); });
    add(cloth, -0.6, 0.3, 0.56, gB);
    const bx = boxM(1.0, 0.85, 0.8, wood, -0.6, 2.26, -0.2, gB);
    boxM(0.5, 0.03, 0.08, brass, -0.6, 2.69, -0.2, gB); boxM(1.06, 0.06, 0.86, brass, -0.6, 2.71, -0.2, gB);
    add(blob(4, 2, 0.3), -0.6, 0, -0.1, gB);
    const Q = [{ dress: SAGE, hat: CREAM, band: ROSE, hold: "ballot" }, { dress: MAUVE, hat: OCH, band: COB }, { dress: "#3E5A74", hat: GR, band: ROSE }, { dress: OCH, hat: CREAM, band: SAGE }, { dress: ROSE, hat: "#C9B48E", band: COB }, { dress: UMB, hat: CREAM, band: ROSE }, { dress: COB, hat: OCH, band: ROSED }, { dress: SAGE, hat: GR, band: OCH }];
    gB.q = Q.map((o, i) => { const m = womanCut(o, 2.7); add(m, 1.3 + i * 1.15, 0, 0.7 - i * 0.12, gB); const b = add(blob(1.3, 0.55), 1.3 + i * 1.15, 0, 0.8 - i * 0.12, gB); people.push([m, 20 + i]); return [m, b]; });
    const ballot = cut(0.42, 0.3, 300, 42, 30, (g) => { paint(g, [[RR(2, 2, 38, 26), "#FFFCF4", 0.97, 1]]); line(g, [[8, 10], [32, 10]], 1, 0.5); line(g, [[8, 18], [26, 18]], 1, 0.5); }, { center: true });
    add(ballot, 0.9, 2.5, 0.9, gB); gB.ballot = ballot;
    add(cut(4.4, 2.8, 70, 160, 102, (g, lw, lh) => bush(g, lw, lh, 10)), -4.8, 0, 3.4, gB);
  }

  // ================= T: TIMELINE RIBBON =================
  {
    const bk = backdrop(64, 30, 14, (g, lw, lh) => {
      skyWash(g, lw, lh, COB, 0.45);
      for (let i = 0; i < 8; i++) wash(g, E(R() * lw, lh * (0.3 + R() * 0.5), 60 + R() * 80, 40 + R() * 50), [OCH, ROSE, SAGE][i % 3], 0.18);
      hills(g, lw, lh * 0.8, 50, SAGE, 0.55, 5);
    });
    add(bk, 12, 9, -14, gT);
    const fl = ground(70, 28, 10, (g, lw, lh) => { wash(g, RR(0, 0, lw, lh), "#E2CFAE", 0.6); });
    add(fl, 12, 0, 0, gT);
    const L = 32, seg = 160;
    const rc = cv(4096, 192), rg = rc.getContext("2d"); U = 1;
    paperBg(rg, 4096, 192, "#FFFCF4"); wash(rg, RR(0, 30, 4096, 132), ROSE, 0.55);
    for (let x = 0; x < 4096; x += 32) line(rg, [[x, 36], [x, (x / 32) % 5 ? 60 : 84]], 2, 0.5);
    for (let yr = 1890; yr <= 1936; yr++) { const x = ((yr - 1890) / 46) * 4096 * 0.94 + 4096 * 0.03; if (yr % 5 === 0) txt(rg, String(yr), x, 130, 40, GR, { style: "normal", a: 0.55 }); }
    const ribGeo = new THREE.PlaneGeometry(L, 1.3, seg, 1); const pa = ribGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i) + L / 2, y = pa.getY(i); pa.setXYZ(i, x - 5, 3.85 + y * 0.9 + Math.sin(x * 0.35) * 0.12, -1.4 + y * 0.25 + Math.sin(x * 0.28) * 0.5); }
    ribGeo.computeVertexNormals();
    const rib = new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ map: tex(rc), roughness: 0.92, side: THREE.DoubleSide })); rib.castShadow = rib.receiveShadow = true; gT.add(rib); gT.rib = rib;
    const xOf = (yr) => -5 + (((yr - 1890) / 46) * 0.94 + 0.03) * L;
    gT.xOf = xOf;
    const yc = (yr, sub, col) => cut(2.4, 1.3, 180, 240, 130, (g) => { paint(g, [[P([[6, 8], [234, 4], [236, 124], [4, 126]], 1.5), "#FFFCF4", 0.97]]); wash(g, RR(12, 108, 216, 10), col, 0.7); txt(g, yr, 120, 46, 58, GR, { style: "normal" }); txt(g, sub, 120, 92, 22, col === ROSE ? ROSED : PINE); });
    gT.cards = [[1893, "perempuan memilih", SAGE], [1919, "boleh dipilih", ROSE], [1933, "anggota parlemen", ROSE]].map(([yr, sub, col]) => { const m = yc(String(yr), sub, col); add(m, xOf(yr), 3.2, 0.4, gT); return m; });
    const bxS = cut(1.2, 1.1, 160, 100, 92, (g) => { paint(g, [[RR(10, 20, 80, 70, 3), "#8A5E40", 0.9], [RR(8, 14, 84, 10, 2), OCH, 0.9], [RR(36, 16, 28, 3), GR, 0.9, false], [P([[40, 2], [58, 0], [60, 16], [42, 18]]), "#FFFCF4", 0.97, 1]]); });
    add(bxS, xOf(1893) + 1.6, 0, 0.2, gT);
    const w19 = womanCut({ dress: COB, hat: CREAM, band: ROSE, hold: "sheet" }, 2.7); add(w19, xOf(1919) + 1.7, 0.55, 0.3, gT); people.push([w19, 30]);
    boxM(1.3, 0.55, 0.9, std("#8A5E40", 0.7), xOf(1919) + 1.7, 0.27, 0.3, gT);
    const pl = cut(8.5, 6.5, 60, 300, 230, (g, lw, lh) => parliament(g, lw, lh)); add(pl, xOf(1933) + 0.6, 0, -6.5, gT);
    const mc = womanCut({ dress: "#3E5A74", hat: GR, band: ROSE }, 2.75); add(mc, xOf(1933) + 1.8, 0, 0.5, gT); people.push([mc, 31]); gT.mc = mc;
    add(blob(1.4, 0.6), xOf(1933) + 1.8, 0, 0.6, gT); add(blob(1.6, 0.8), xOf(1919) + 1.7, 0, 0.4, gT);
    const mt = nameTag("Elizabeth McCombs", 2.0); add(mt, xOf(1933) + 1.8, 2.95, 0.9, gT); gT.mtag = mt;
    gT.rseg = seg;
  }

  // drifting camellia petals (assent and outro)
  const pet = pts(scene, 160, { color: 0xffffff, size: 0.22, add: false, opacity: 0.95 });
  const pSeed = Array.from({ length: 160 }, () => [R(), R(), R(), R(), 0.3 + R() * 0.6]);

  // ---------- cameras (local to each station): [t, px,py,pz, tx,ty,tz] ----------
  const camG = track([[0, 0, 4.6, 25, 0, 5.4, 0], [c1 - 1.6, 0, 4.6, 22, 0, 5.2, 0], [c1 - 0.4, 0, 4.7, 13.6, 0, 4.9, 0], [c1, 0, 4.7, 13, 0, 4.9, 0]]);
  const camS = track([[c1, -4.7, 2.8, 14.5, -4.4, 2.6, 0], [A("s3:Kampanye"), -1.6, 2.8, 14.5, -1.0, 2.5, 0], [A("s3:Kate") - 0.4, -0.7, 2.9, 11, -0.6, 2.3, 0], [A("s3:Rancangan") + 0.1, -0.4, 2.9, 10.2, -0.5, 2.3, 0],
    [A("s3:1878") - 0.4, 6.2, 4.8, 17, 6.6, 4.1, -3], [A("s3:kandas"), 7.0, 4.4, 16.2, 7.2, 3.6, -3], [c2, 7.2, 4.2, 15.6, 7.3, 3.4, -3]]);
  const camP = track([[c2, -3.4, 3.7, 9.5, -3.5, 2.8, -3.5], [A("s4:sembilan") - 0.5, -3.2, 3.6, 10.5, -3.0, 2.4, -2], [A("s4:1891") + 0.4, -2.0, 3.6, 13, -1.6, 2.0, 0], [A("s4:1892") + 0.3, -0.2, 4.2, 15, 0, 2.6, 0],
    [A("s4:1893") + 0.2, 1.4, 4.4, 19, 1.2, 2.5, 0], [c3, 1.8, 4.5, 19.8, 1.4, 2.5, 0]]);
  const camC = track([[c3, 0, 8.6, 19.5, 0, 1.2, -2.5], [A("s5:satu") - 0.4, 0.6, 7.8, 17, 0.4, 1.3, -2.5], [A("s5:berbalik") + 0.4, 1.4, 7.0, 13.5, 1.4, 1.3, -3.2], [A("s5:Manuver") + 0.3, -0.2, 7.6, 15.5, 0, 1.3, -3],
    [A("s5:mendukung") + 0.2, 1.0, 7.0, 14, 1.4, 1.3, -3.4], [A("s5:Lolos") + 0.4, 0, 9.4, 20.5, 0, 1.4, -2.5], [c4, 0, 9.6, 21, 0, 1.4, -2.5]]);
  const camA = track([[c4, -0.6, 4.2, 12.5, -0.6, 2.2, 0], [A("s6:Glasgow") + 0.3, -0.5, 4.3, 11.5, -0.5, 2.1, 0], [A("s6:mengesahkannya") - 0.3, 0.2, 4.6, 7.2, 0.2, 1.5, 0], [A("s6:termasuk") + 0.1, 0.4, 4.4, 7.6, 0.4, 1.6, 0], [A("s6:Māori") + 0.2, 4.6, 4.2, 13.6, 4.8, 2.3, 0.4], [c5, 5.0, 4.2, 13.2, 5.2, 2.3, 0.4]]);
  const camB = track([[c5, 5.2, 3.6, 14.5, 3.6, 2.3, 0], [A("s6:November") + 0.4, 3.6, 3.4, 12.5, 2.4, 2.3, 0], [A("s6:memilih") + 0.3, 1.0, 3.8, 12, 0.6, 2.5, -0.2], [c6, 0.8, 3.8, 11.6, 0.5, 2.5, -0.2]]);
  const xT = (yr) => gT.xOf(yr) + 1.4;
  const camT = track([[c6, xT(1893), 3.3, 13, xT(1893), 2.6, 0], [A("s7:dipilih"), xT(1893) + 1.5, 3.3, 13, xT(1893) + 1.5, 2.6, 0], [A("s7:1919") + 0.2, xT(1919), 3.3, 13, xT(1919), 2.6, 0], [A("s7:Dan"), xT(1919) + 1.2, 3.3, 13, xT(1919) + 1.2, 2.6, 0],
    [A("s7:Elizabeth") + 0.2, xT(1933), 3.2, 13, xT(1933), 2.6, 0], [c7, xT(1933) + 0.4, 3.3, 14, xT(1933) + 0.4, 2.7, 0]]);
  const camO = track([[c7, -3.4, 3.6, 8.8, -3.5, 2.8, -3.5], [A("s8:Menurut"), -1.6, 4.4, 14, -1.4, 2.6, -1.5], [A("s8:AUDIRA"), 0.4, 5.4, 19, 0.4, 3.0, 0], [K.dur, 0.6, 5.6, 20, 0.5, 3.0, 0]]);
  const stations = [[0, camG, 0], [c1, camS, 1], [c2, camP, 2], [c3, camC, 3], [c4, camA, 4], [c5, camB, 5], [c6, camT, 6], [c7, camO, 2]];

  const tgt = new THREE.Vector3();
  const S = (t, a, d = 0.4) => Math.max(0.001, back(clamp01((t - a) / d)));

  return (t) => {
    let st = stations[0]; for (const s of stations) if (t >= s[0]) st = s;
    const si = st[2], ox = SX[si];
    ST.forEach((G, i) => (G.visible = i === si));
    const c = st[1](t);
    cam.position.set(ox + c[0] + Math.sin(t * 0.37) * 0.06, c[1] + Math.sin(t * 0.29) * 0.04, c[2]);
    tgt.set(ox + c[3], c[4], c[5]); cam.lookAt(tgt);
    sun.position.set(ox + c[3] - 7, 15, 12); sun.target.position.set(ox + c[3], 0, -1);
    for (const [m, ph] of people) m.rotation.z = Math.sin(t * 1.1 + ph) * 0.018;

    if (si === 0) {
      const lon = 28 - 16 * ramp(t, 0.2, A("s1:Eropa")) - 110 * ramp(t, A("s1:Amerika") - 0.75, A("s1:Amerika") + 0.15) - 91.2 * ramp(t, A("s1:Pasifik") - 0.8, A("s1:Pasifik") + 0.2);
      const lat = 32 + 2 * ramp(t, 0, 5) - 4 * ramp(t, A("s1:Amerika") - 0.75, A("s1:Amerika") + 0.15) - 69.3 * ramp(t, A("s1:Pasifik") - 0.8, A("s1:Pasifik") + 0.3);
      gG.spin.rotation.y = lonRot(lon); gG.tilt.rotation.x = (lat * Math.PI) / 180;
      for (const [p, an] of gG.pins) p.scale.setScalar(S(t, A(an) - 0.1, 0.4));
      gG.pins[2][0].visible = t < A("s2:Ini") - 0.1;
      const lift = eout(ramp(t, A("s2:Ini") - 0.2, A("s2:Selandia") + 0.4));
      gG.nz.visible = lift > 0.001; gG.nz.position.z = 3.3 + lift * 1.6; gG.nz.scale.setScalar(Math.max(0.001, 0.6 + 0.62 * lift)); gG.nz.rotation.z = (1 - lift) * 0.3;
      gG.clouds.forEach((m, i) => (m.position.x += (Math.sin(t * 0.2 + i) * 0.004)));
    } else if (si === 1) {
      gS.ktag.scale.set(1.7 * S(t, A("s3:Kate"), 0.4), 0.58 * S(t, A("s3:Kate"), 0.4), 1);
      gS.ban.position.y = 2.3 + Math.sin(t * 2.2) * 0.04;
      gS.sign.scale.setScalar(S(t, A("s2:tidak") - 0.3, 0.4));
      gS.bills.forEach((b, i) => {
        const a = A(["s3:1878", "s3:1879", "s3:1887"][i]), f = eout(clamp01((t - a - 1.05) / 1.3));
        b.visible = t > a - 0.1; b.scale.setScalar(S(t, a - 0.1, 0.35));
        b.position.y = 5.2 - f * 5.0 + Math.sin(f * 7) * 0.2 * (1 - f); b.position.x = 5.6 + i * 2.1 + Math.sin(f * 5) * 0.5;
        b.rotation.set(-f * 1.45, 0, Math.sin(f * 9) * 0.5 * (1 - f) + f * (0.4 - i * 0.3));
      });
    } else if (si === 2) {
      const out = t >= c7;
      gP.rolls.forEach((r, i) => {
        const a = A(r.an), h = out ? r.H : r.H * eout(clamp01((t - a + 0.2) / (1.3 + i * 0.4)));
        r.m.visible = h > 0.01; r.m.scale.y = Math.max(0.001, h); r.t.repeat.y = Math.max(0.05, h / 1.4);
        r.tg.visible = h > 0.01; r.tg.scale.setScalar(out ? 1 : S(t, a, 0.4)); r.bl.visible = h > 0.01;
      });
      const L = out ? 7.2 : 7.2 * eout(clamp01((t - A("s4:1893") - 0.2) / 1.6));
      gP.strip.visible = L > 0.02; gP.strip.scale.y = Math.max(0.001, L); gP.strip.material.map.repeat.y = Math.max(0.2, L / 1.3);
      gP.signers.forEach((m, i) => { m.position.y = Math.max(0, Math.sin(t * 3 + i * 2)) * 0.03; });
    } else if (si === 3) {
      const kA = A("s5:berbalik") - 0.2, rA = A("s5:mendukung") - 0.2;
      for (const s of gC.seats) {
        let isFor = s.for0, flip = 0;
        if (s === gC.kelly) { flip = clamp01((t - kA) / 0.5); isFor = flip < 0.5; }
        if (gC.rey.includes(s)) { flip = clamp01((t - rA - gC.rey.indexOf(s) * 0.15) / 0.5); isFor = flip >= 0.5; }
        s.card.material.color.set(isFor ? SAGE : ROSED); s.card.rotation.y = flip * Math.PI;
        s.card.position.y = 1.95 + Math.sin(t * 2 + s.i) * 0.02 + (t > A("s5:Lolos") ? 0.12 * eout(clamp01((t - A("s5:Lolos")) / 0.4)) : 0);
        s.fig.rotation.z = Math.sin(t * 0.9 + s.i) * 0.02;
      }
      const kr = ramp(t, A("s5:satu") - 0.2, A("s5:satu") + 0.3) * (1 - ramp(t, A("s5:Manuver"), A("s5:Manuver") + 0.4));
      gC.kRing.material.opacity = 0.85 * kr; gC.kRing.visible = kr > 0.01;
      const rr = ramp(t, A("s5:marah") - 0.3, A("s5:marah") + 0.2) * (1 - ramp(t, A("s5:Lolos") + 0.6, A("s5:Lolos") + 1.2));
      gC.rRings.forEach((m) => { m.material.opacity = 0.85 * rr; m.visible = rr > 0.01; });
      gC.anger.forEach((m, i) => { const u = S(t, A("s5:marah") + i * 0.12, 0.3) * (1 - ramp(t, A("s5:mendukung") + 0.8, A("s5:mendukung") + 1.2)); m.visible = u > 0.01; m.scale.set(0.7 * u, 0.6 * u, 1); m.position.y = 3.0 + (gC.rey[i].S.position.y) + Math.sin(t * 9 + i) * 0.04; });
      gC.stag.scale.set(2.0 * S(t, A("s5:Richard"), 0.4), 0.68 * S(t, A("s5:Richard"), 0.4), 1);
    } else if (si === 4) {
      const sA = A("s6:mengesahkannya"), p = clamp01((t - sA + 0.1) / 1.1);
      const key = Math.round(p * 60); if (key !== gA.lastSig) { gA.drawDoc(p); gA.lastSig = key; }
      const sp = gA.sigPts[Math.min(gA.sigPts.length - 1, Math.floor(p * (gA.sigPts.length - 1)))];
      const lx = 0.2 + (sp[0] / 640 - 0.5) * 1.9, lz = 0.1 + (sp[1] / 860 - 0.5) * 2.55;
      const rest = 1 - ramp(t, sA - 0.6, sA - 0.1) + ramp(t, sA + 1.1, sA + 1.6);
      gA.quill.position.set(lx + clamp01(rest) * 0.5, 1.53 + clamp01(rest) * 0.25, lz + clamp01(rest) * 0.2);
      gA.seal.scale.set(S(t, sA + 1.2, 0.35), 1, S(t, sA + 1.2, 0.35)); gA.seal.visible = t > sA + 1.15;
      if (0) gA.gtag.scale.set(2.3 * S(t, A("s6:Glasgow"), 0.4), 0.78 * S(t, A("s6:Glasgow"), 0.4), 1);
      gA.card.scale.setScalar(S(t, c4 + 0.3, 0.45));
      gA.row.forEach(([m, b, x], i) => { const u = eout(clamp01((t - A("s6:termasuk") + 0.3 - i * 0.1) / 0.9)); m.position.x = x + (1 - u) * 6; b.position.x = m.position.x; m.position.y = u < 1 ? Math.abs(Math.sin(t * 9 + i)) * 0.06 : 0; });
    } else if (si === 5) {
      const mv = eout(ramp(t, c5, A("s6:memilih")));
      gB.q.forEach(([m, b], i) => { const x = 1.3 + i * 1.15 - mv * 0.35; m.position.x = x; b.position.x = x; m.position.y = mv < 0.98 ? Math.abs(Math.sin(t * 7 + i)) * 0.04 : 0; });
      const d = clamp01((t - A("s6:memilih") + 0.2) / 0.7);
      gB.ballot.position.set(0.9 - 0.35 * mv - d * 1.1, 2.5 + Math.sin(d * Math.PI) * 0.7 + d * 0.3, 0.9 - d * 1.1);
      gB.ballot.rotation.set(-d * 1.2, 0, d * 0.6); gB.ballot.visible = d < 0.98;
    } else if (si === 6) {
      const reveal = clamp01((c[0] + 11) / 32);
      gT.rib.geometry.setDrawRange(0, Math.ceil(gT.rseg * reveal) * 6);
      const yrsA = [c6 + 0.2, A("s7:1919") - 0.1, A("s7:1933") - 0.1];
      gT.cards.forEach((m, i) => { m.scale.setScalar(S(t, yrsA[i], 0.45)); m.position.y = 3.2 + Math.sin(t * 1.4 + i) * 0.05; });
      gT.mtag.scale.set(2.0 * S(t, A("s7:Elizabeth"), 0.4), 0.68 * S(t, A("s7:Elizabeth"), 0.4), 1);
    }
    // camellia petals drift through the assent and the outro
    const pOn = (si === 4 && t > A("s6:mengesahkannya") + 1.0) || t >= c7;
    for (let i = 0; i < 160; i++) {
      const q = pSeed[i], life = (t * q[4] * 0.18 + q[1]) % 1;
      pet.pos[i * 3] = pOn ? tgt.x + (q[0] - 0.5) * 14 + Math.sin(t * q[4] + q[3] * 6) * 0.6 : 0;
      pet.pos[i * 3 + 1] = pOn ? 9 - life * 10 : -50;
      pet.pos[i * 3 + 2] = tgt.z + (q[2] - 0.5) * 8 + 2;
    }
    pet.commit();
    bp.strength = 0.1;
    comp.render();
  };
}
