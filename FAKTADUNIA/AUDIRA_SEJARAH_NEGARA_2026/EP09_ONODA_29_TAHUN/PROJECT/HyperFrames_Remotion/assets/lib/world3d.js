// EP09 ONODA: a paper diorama of Lubang drawn in graphite with a watercolor wash on cold-press paper.
// Four stations stand along x (jungle camp, village, Suzuki's tent, the surrender table); a pinned field map hangs far to the west.
// Cuts between stations happen under the pencil-hatching sweep. Figures are hand-sketched silhouettes with no faces: illustration, never likeness.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, std, box, cyl, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const PAPER = "#EFE8DA", GR = "#2E2E2E", JD = "#5E7F4F", JL = "#9DB07C", SEP = "#8A6A45", RED = "#B23A2E";
const FT = '"Special Elite", "Courier New", monospace', FH = '"Libre Caslon Text", Georgia, serif';
// canvas text needs the web fonts before the textures are painted; the import waits for them (bounded)
try {
  await Promise.race([
    Promise.all(['400 40px "Special Elite"', '700 40px "Libre Caslon Text"', 'italic 400 40px "Libre Caslon Text"'].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 6000)),
  ]);
} catch (e) { /* fall back to system faces */ }

const rgba = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const TAN = Math.tan((19 * Math.PI) / 180);

// Hermite track with harmonic tangents: never overshoots a key, never parks on one.
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
// Framing: subject point (x,y,z) lands on screen row ys with a level camera at distance d.
const F = (x, y, z, d, ys, dx = 0) => { const cy = y + ((ys - 960) / 960) * TAN * d; return [x + dx, cy, z + d, x, cy, z]; };

// ---------- drawing helpers: paper, wash, pencil ----------
function blot(g, x, y, r, col, a) { const s = g.createRadialGradient(x, y, 0, x, y, r); s.addColorStop(0, rgba(col, a)); s.addColorStop(0.65, rgba(col, a * 0.55)); s.addColorStop(1, rgba(col, 0)); g.fillStyle = s; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function paper(g, w, h, q, tone = PAPER) {
  g.fillStyle = tone; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) blot(g, q() * w, q() * h, 60 + q() * Math.max(w, h) * 0.25, "#B9A27A", 0.025 + q() * 0.04);
  const n = Math.min(26000, (w * h) / 500);
  for (let i = 0; i < n; i++) { g.fillStyle = q() < 0.5 ? `rgba(110,90,60,${0.03 + q() * 0.05})` : `rgba(255,252,244,${0.05 + q() * 0.08})`; g.fillRect(q() * w, q() * h, 1 + q() * 2.5, 1); }
}
// broken pencil hatching across the whole canvas (clip first)
function hatch(g, w, h, ang, sp, a, q, lw = 1.3, col = GR) {
  const c = Math.cos(ang), s = Math.sin(ang), L = Math.hypot(w, h) / 2 + 20;
  g.strokeStyle = col; g.lineCap = "round";
  for (let d = -L; d < L; d += sp * (0.75 + q() * 0.5)) {
    const cx = w / 2 - s * d, cy = h / 2 + c * d;
    for (let u = -L; u < L;) {
      const seg = 30 + q() * 140;
      if (q() < 0.82) {
        g.globalAlpha = a * (0.45 + q() * 0.75); g.lineWidth = lw * (0.7 + q() * 0.6);
        g.beginPath(); g.moveTo(cx + c * u, cy + s * u); g.lineTo(cx + c * (u + seg) + (q() - 0.5) * 2, cy + s * (u + seg) + (q() - 0.5) * 2); g.stroke();
      }
      u += seg + 4 + q() * 26;
    }
  }
  g.globalAlpha = 1;
}
function ink(g, path, q, lw = 2.2, a = 0.85, col = GR) {
  g.strokeStyle = col; g.lineJoin = g.lineCap = "round";
  for (let k = 0; k < 2; k++) { g.save(); g.translate((q() - 0.5) * 2.4, (q() - 0.5) * 2.4); g.globalAlpha = a * (k ? 0.5 : 1); g.lineWidth = k ? lw * 0.55 : lw; g.stroke(path); g.restore(); }
  g.globalAlpha = 1;
}
// polyline with width as a closed polygon (limbs, rifles, fronds)
function thick(pts_, w0, w1 = w0) {
  const L = [], R = [];
  for (let i = 0; i < pts_.length; i++) {
    const a = pts_[Math.max(0, i - 1)], b = pts_[Math.min(pts_.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * (i / (pts_.length - 1))) / 2;
    L.push([pts_[i][0] - (dy / l) * w, pts_[i][1] + (dx / l) * w]); R.push([pts_[i][0] + (dy / l) * w, pts_[i][1] - (dx / l) * w]);
  }
  const p = new Path2D(); [...L, ...R.reverse()].forEach((v, i) => (i ? p.lineTo(v[0], v[1]) : p.moveTo(v[0], v[1]))); p.closePath(); return p;
}
const poly = (a) => { const p = new Path2D(); a.forEach((v, i) => (i ? p.lineTo(v[0], v[1]) : p.moveTo(v[0], v[1]))); p.closePath(); return p; };
const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; };
const quad = (a, c, b, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); } return o; };

// a coconut palm, drawn in place
function palm(g, x, y, hgt, q, col = JD) {
  const lean = (q() - 0.5) * hgt * 0.35, top = [x + lean, y - hgt];
  const trunk = quad([x, y], [x + lean * 0.2, y - hgt * 0.5], top, 18);
  const tp = thick(trunk, hgt * 0.045, hgt * 0.028);
  g.fillStyle = rgba(SEP, 0.75); g.fill(tp); ink(g, tp, q, 1.6, 0.7);
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i - 3.5) * 0.42 + (q() - 0.5) * 0.2, L = hgt * (0.32 + q() * 0.12);
    const end = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.5 + L * 0.35];
    const fr = quad(top, [top[0] + Math.cos(a) * L * 0.6, top[1] - L * 0.25], end, 12);
    g.strokeStyle = rgba(col, 0.9); g.lineWidth = hgt * 0.02; g.beginPath(); fr.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
    for (let k = 2; k < fr.length; k++) {
      const p = fr[k], s = hgt * 0.07 * (1 - k / fr.length) + hgt * 0.015;
      g.strokeStyle = rgba(k % 2 ? col : GR, k % 2 ? 0.85 : 0.5); g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - s * 0.4, p[1] + s); g.moveTo(p[0], p[1]); g.lineTo(p[0] + s * 0.4, p[1] + s); g.stroke();
    }
  }
}

// a ridge layer: wash darkest at the ridge, fading toward paper at the foot, pencil hatching and a sketched skyline of canopy
function hillTex(seed, W, H, o) {
  return canvasTex(W, H, (g) => {
    const q = mulberry(seed);
    const ph = [q() * 6, q() * 6, q() * 6, q() * 6], R = new Float32Array(W), B = new Float32Array(W);
    for (let x = 0; x < W; x++) { const u = (x / W) * Math.PI * 2; B[x] = H * o.ridge + o.amp * H * (0.5 * Math.sin(u * 1.3 + ph[0]) + 0.3 * Math.sin(u * 3.1 + ph[1]) + 0.15 * Math.sin(u * 7.3 + ph[2]) + 0.05 * Math.sin(u * 17 + ph[3])); R[x] = B[x]; }
    if (o.canopy) for (let x = 0; x < W;) { const r = o.canopy * (0.5 + q()), b = B[Math.min(W - 1, x | 0)]; for (let i = Math.max(0, (x - r) | 0); i < Math.min(W, x + r); i++) { const d = Math.sqrt(Math.max(0, r * r - (i - x) ** 2)); R[i] = Math.min(R[i], b - d * 0.85); } x += r * (0.7 + q() * 0.8); }
    const path = new Path2D(); path.moveTo(0, H); for (let x = 0; x < W; x += 3) path.lineTo(x, R[x]); path.lineTo(W, R[W - 1]); path.lineTo(W, H); path.closePath();
    g.save(); g.clip(path);
    const top = Math.min(...R);
    const gr = g.createLinearGradient(0, top, 0, H); gr.addColorStop(0, o.top); gr.addColorStop(0.35, o.base); gr.addColorStop(1, o.foot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < W / 10; i++) blot(g, q() * W, top + q() * (H - top) * 0.7, 20 + q() * 120, q() < 0.5 ? o.top : "#FFFFFF", 0.06 + q() * 0.12);
    // darker wash under the skyline (watercolor pools at the ridge)
    g.lineJoin = "round";
    const sky = new Path2D(); sky.moveTo(0, R[0]); for (let x = 3; x < W; x += 3) sky.lineTo(x, R[x]);
    for (const [lw, a] of [[o.pool, 0.18], [o.pool * 0.5, 0.18]]) { g.strokeStyle = rgba(o.top, a); g.lineWidth = lw; g.stroke(sky); }
    for (let i = 0; i < 9000 * (W / 4096); i++) { g.fillStyle = `rgba(40,50,30,${0.04 + q() * 0.08})`; g.fillRect(q() * W, top + q() * (H - top), 1.5, 1.5); }
    hatch(g, W, H, -1.0, o.sp, o.hatchA, q, o.lw);
    hatch(g, W, H, 0.55, o.sp * 1.7, o.hatchA * 0.45, q, o.lw);
    g.restore();
    // fade the foot toward paper so every layer reads as a paper cut-out
    g.globalCompositeOperation = "source-atop";
    const fd = g.createLinearGradient(0, H * 0.55, 0, H); fd.addColorStop(0, rgba(PAPER, 0)); fd.addColorStop(1, rgba(PAPER, o.fade)); g.fillStyle = fd; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "source-over";
    ink(g, sky, q, o.lw * 1.9, 0.85);
    for (let x = 0; x < W; x += 5 + q() * 12) { if (q() < 0.45) continue; const y = R[x | 0] + 4 + q() * o.canopy * 1.2; g.strokeStyle = rgba(GR, 0.28); g.lineWidth = o.lw; g.beginPath(); g.arc(x, y, 3 + q() * o.canopy * 0.3, q() * 6, q() * 6 + 3.5); g.stroke(); }
    for (let i = 0; i < (o.palms || 0); i++) { const x = q() * W; palm(g, x, R[x | 0] + o.canopy * 0.6, H * (0.12 + q() * 0.1), q, o.top); }
  });
}

// ---------- figures: front-facing sketch silhouettes, no faces ----------
function person(o) {
  return canvasTex(320, 640, (g) => {
    const q = mulberry(o.seed || 1);
    const coat = o.coat || "#8A7A55", parts = [];
    const add = (p, col) => parts.push([p, col]);
    // things behind the body
    if (o.rifle && o.pose !== "paper" && o.pose !== "sword") add(thick([[226, 56], [112, 410]], 11, 13), "#4A3B2A");
    if (o.pack) add(poly([[196, 150], [246, 160], [250, 300], [200, 296]]), "#7A6A48");
    if (o.cap === "field") add(poly([[128, 70], [192, 70], [198, 132], [122, 132]]), "#B9A983");
    // legs
    const wk = o.pose === "walk";
    add(poly(wk ? [[128, 322], [160, 322], [134, 612], [104, 606]] : [[126, 322], [158, 322], [154, 612], [128, 612]]), coat);
    add(poly(wk ? [[160, 322], [194, 322], [222, 604], [192, 612]] : [[162, 322], [194, 322], [192, 612], [166, 612]]), coat);
    add(ell(wk ? 114 : 138, 614, 26, 12), "#3B3328"); add(ell(wk ? 210 : 182, 614, 26, 12), "#3B3328");
    // torso with rounded shoulders
    const tor = new Path2D(); tor.moveTo(124, 132); tor.quadraticCurveTo(160, 118, 196, 132); tor.quadraticCurveTo(214, 140, 210, 170); tor.lineTo(198, 334); tor.lineTo(122, 334); tor.lineTo(110, 170); tor.quadraticCurveTo(106, 140, 124, 132); tor.closePath();
    add(tor, coat);
    add(poly([[121, 300], [199, 300], [199, 316], [121, 316]]), o.suit ? coat : "#5A4A33");
    if (o.suit) add(poly([[154, 136], [166, 136], [168, 240], [160, 252], [152, 240]]), "#7A2E28");
    // arms by pose
    const arm = (pp) => add(thick(pp, 30, 24), coat);
    const hand = (x, y) => add(ell(x, y, 12, 13), "#C8A27C");
    if (o.pose === "salute") { arm([[116, 146], [104, 230], [112, 318]]); hand(114, 326); arm([[204, 146], [236, 120], [196, 82]]); hand(190, 80); }
    else if (o.pose === "paper" || o.pose === "sword") { arm([[116, 146], [118, 220], [146, 236]]); arm([[204, 146], [202, 220], [176, 236]]); hand(148, 236); hand(174, 236); }
    else if (o.pose === "camera") { arm([[116, 146], [118, 190], [142, 112]]); arm([[204, 146], [204, 190], [180, 112]]); hand(144, 110); hand(178, 110); }
    else if (wk) { arm([[116, 146], [96, 220], [92, 300]]); hand(92, 306); arm([[204, 146], [222, 220], [232, 296]]); hand(232, 302); }
    else { arm([[116, 146], [106, 230], [110, 318]]); hand(110, 326); arm([[204, 146], [214, 230], [210, 318]]); hand(210, 326); }
    // head and headgear
    add(poly([[148, 104], [172, 104], [174, 134], [146, 134]]), "#C8A27C");
    add(ell(160, 84, 30, 36), "#C8A27C");
    if (o.cap === "field") { const c = new Path2D(); c.moveTo(128, 76); c.quadraticCurveTo(160, 30, 192, 76); c.closePath(); add(c, "#7E7050"); add(ell(160, 78, 40, 8), "#6E6044"); }
    else if (o.cap === "hat") { add(poly([[134, 22], [186, 22], [190, 58], [130, 58]]), "#4A4A4A"); add(ell(160, 58, 50, 9), "#3E3E3E"); }
    else if (o.cap === "bush") { const c = new Path2D(); c.moveTo(130, 70); c.quadraticCurveTo(160, 26, 190, 70); c.closePath(); add(c, "#9A8A62"); add(ell(160, 70, 56, 11), "#8E7E58"); }
    if (o.ghost) {
      // a record, not a body: faint wash and a pencil outline only
      for (const [p] of parts) { g.fillStyle = rgba("#C9C2B2", 0.35); g.fill(p); }
      for (const [p] of parts) { g.setLineDash([7, 5]); ink(g, p, q, 2.4, 0.8, "#5A5650"); }
      g.setLineDash([]);
      return;
    }
    for (const [p, col] of parts) { g.fillStyle = col; g.fill(p); }
    g.globalCompositeOperation = "source-atop";
    for (let i = 0; i < 60; i++) blot(g, q() * 320, q() * 640, 20 + q() * 60, q() < 0.5 ? "#FFFFFF" : "#3A3020", 0.1 + q() * 0.12);
    hatch(g, 320, 640, -1.05, 6.5, 0.32, q, 1.2);
    g.save(); g.beginPath(); g.rect(168, 0, 160, 640); g.clip(); hatch(g, 320, 640, 0.7, 7, 0.28, q, 1.1); g.restore();
    g.globalCompositeOperation = "source-over";
    for (const [p] of parts) ink(g, p, q, 2.4, 0.85);
    if (o.pose === "paper") { const p = poly([[118, 188], [204, 184], [206, 252], [120, 256]]); g.fillStyle = "#F7F2E6"; g.fill(p); ink(g, p, q, 2, 0.8); g.fillStyle = rgba(GR, 0.55); for (let y = 202; y < 246; y += 9) g.fillRect(128, y, 60 + q() * 12, 2.5); }
    if (o.pose === "camera") { const p = poly([[136, 92], [186, 92], [186, 126], [136, 126]]); g.fillStyle = "#2E2E2E"; g.fill(p); g.fillStyle = "#8A8A8A"; g.beginPath(); g.arc(161, 109, 9, 0, 7); g.fill(); }
  });
}

export function create(canvas, K, AT) {
  const A = (k) => { if (!(k in AT)) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xefe8da, fog: 0.0032, exp: 1.0, bloom: [0.08, 0.3, 0.95] });
  r.toneMapping = THREE.NoToneMapping;
  const rnd = mulberry(1974);
  const hemi = new THREE.HemisphereLight(0xfff3dc, 0xe0cca2, 1.22);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe6c0, 0.42);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 120 });
  key.shadow.bias = -0.0006; key.shadow.radius = 4;
  scene.add(key, key.target);
  const cut = (map, extra = {}) => new THREE.MeshStandardMaterial({ map, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide, ...extra });
  const plane = (w, h, mat, x, y, z, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

  // ---------- backdrop: sky wash, far ranges, ground ----------
  const skyT = canvasTex(2048, 1024, (g, w, h) => {
    const q = mulberry(3); paper(g, w, h, q);
    for (let i = 0; i < 40; i++) blot(g, q() * w, h * 0.2 + q() * h * 0.5, 80 + q() * 240, q() < 0.6 ? "#B8C4C2" : "#D9C7A4", 0.05 + q() * 0.08);
    g.strokeStyle = rgba(GR, 0.12); g.lineWidth = 1.4; for (let i = 0; i < 18; i++) { const x = q() * w, y = h * 0.25 + q() * h * 0.4, l = 80 + q() * 260; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + l * 0.3, y - 14, x + l * 0.6, y - 10, x + l, y + 2); g.stroke(); }
  });
  plane(700, 260, new THREE.MeshBasicMaterial({ map: skyT, fog: false }), 80, 70, -170).castShadow = false;
  const L4 = hillTex(14, 2048, 512, { top: "#AEB98F", base: "#C3C8A6", foot: "#E3E0CC", ridge: 0.32, amp: 0.28, canopy: 5, hatchA: 0.1, sp: 7, lw: 1, pool: 10, fade: 0.6 });
  const L3 = hillTex(13, 2048, 512, { top: "#94AC76", base: "#B8C497", foot: "#E6E3CC", ridge: 0.3, amp: 0.24, canopy: 9, hatchA: 0.14, sp: 7, lw: 1.1, pool: 14, fade: 0.65, palms: 7 });
  const L2 = hillTex(12, 4096, 1024, { top: "#7C9C63", base: "#B9C79A", foot: "#EEE9D4", ridge: 0.34, amp: 0.2, canopy: 20, hatchA: 0.06, sp: 10, lw: 1.3, pool: 26, fade: 0.75, palms: 9 });
  const L1 = hillTex(11, 4096, 1024, { top: "#6E9257", base: "#B4C391", foot: "#F2EDDA", ridge: 0.38, amp: 0.16, canopy: 28, hatchA: 0.07, sp: 10, lw: 1.5, pool: 34, fade: 0.85, palms: 6 });
  const hM = [L1, L2, L3, L4].map((t) => cut(t));
  const ridge = (mat, x, z, w, h, y0, flip) => {
    const geo = new THREE.PlaneGeometry(w, h, 32, 1); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / w) * 9 + x) * 0.9);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y0 + h / 2, z); if (flip) m.scale.x = -1; m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  };
  ridge(hM[3], 80, -95, 380, 46, -3);
  const groundT = canvasTex(1024, 1024, (g, w, h) => {
    const q = mulberry(5); paper(g, w, h, q, "#E4E3CC");
    for (let i = 0; i < 70; i++) blot(g, q() * w, q() * h, 40 + q() * 140, q() < 0.6 ? JL : "#C9B48A", 0.08 + q() * 0.12);
    g.strokeStyle = rgba(GR, 0.3); g.lineWidth = 1.2;
    for (let i = 0; i < 900; i++) { const x = q() * w, y = q() * h, l = 6 + q() * 16; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 6, y - l); g.stroke(); }
  }, [36, 8]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 130), new THREE.MeshStandardMaterial({ map: groundT, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(80, 0, -20); ground.receiveShadow = true; scene.add(ground);

  // ---------- undergrowth ----------
  const fernT = (seed, cols) => canvasTex(1024, 1024, (g) => {
    const q = mulberry(seed);
    for (let f = 0; f < 9; f++) {
      const a = -Math.PI / 2 + (f - 4) * 0.3 + (q() - 0.5) * 0.15, L = 420 + q() * 300, base = [512 + (q() - 0.5) * 40, 1010];
      const tip = [base[0] + Math.cos(a) * L, base[1] + Math.sin(a) * L * 0.92], ctl = [base[0] + Math.cos(a) * L * 0.3 - Math.cos(a) * 60, base[1] + Math.sin(a) * L * 0.75];
      const c = quad(base, ctl, tip, 26), col = cols[f % cols.length];
      for (let k = 2; k < c.length; k++) {
        const p = c[k], pn = c[k - 1], dx = p[0] - pn[0], dy = p[1] - pn[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, s = 70 * (1 - k / c.length) + 14;
        for (const sg of [-1, 1]) { const lf = ell(p[0] + nx * sg * s * 0.55 + (dx / l) * s * 0.18, p[1] + ny * sg * s * 0.55 + (dy / l) * s * 0.18, s * 0.55, s * 0.17, Math.atan2(ny * sg, nx * sg) + sg * 0.35); g.fillStyle = col; g.fill(lf); ink(g, lf, q, 1.3, 0.55); }
      }
      g.strokeStyle = rgba(GR, 0.8); g.lineWidth = 3; g.beginPath(); c.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
    }
  });
  const ferns = [cut(fernT(21, ["#6F8E5A", "#86A06C", "#5E7F4F"])), cut(fernT(22, ["#9DB07C", "#7E9A66", "#B4C095"]))];
  const palmT = canvasTex(512, 1024, (g) => palm(g, 256, 1020, 900, mulberry(31), "#5E7F4F"));
  const palmM = cut(palmT);
  const fern = (x, z, s, k = 0, flip = false) => { const m = plane(s, s, ferns[k], x, s / 2 - 0.05, z); if (flip) m.scale.x = -1; return m; };
  const tree = (x, z, s) => plane(s * 0.5, s, palmM, x, s / 2 - 0.1, z);

  // one diorama set per station: three ridge layers, palms, ferns and foreground fronds
  function dress(X, seed, o = {}) {
    const q = mulberry(seed);
    ridge(hM[0], X + (q() - 0.5) * 8, -12, 46, 11, -1, q() < 0.5);
    ridge(hM[1], X + (q() - 0.5) * 12, -26, 72, 17.5, -1, q() < 0.5);
    ridge(hM[2], X + (q() - 0.5) * 20, -50, 104, 30, -2, q() < 0.5);
    for (let i = 0; i < 5; i++) tree(X + (i - 2) * 4.2 + (q() - 0.5) * 2.4, -7 - q() * 4, 5.5 + q() * 2.5);
    for (let i = 0; i < (o.ferns ?? 9); i++) { const x = X + (q() - 0.5) * 16; if (o.clear && Math.abs(x - X - (o.cx || 0)) < o.clear) continue; fern(x, -2.2 - q() * 4, 1.6 + q() * 1.6, i % 2, q() < 0.5); }
    for (const s of [-1, 1]) fern(X + (o.fx || 0) + s * (3.9 + q() * 0.5), o.fz ?? 5.2, 2.6 + q() * 0.8, 0, s > 0);
  }
  const XJ = 0, XV = 60, XT = 120, XS = 180, MX = -300;
  dress(XJ, 41, { cx: 3, clear: 0, fx: 5.7, fz: 5.6 });
  dress(XV, 42, { ferns: 6, fz: 4.2 });
  dress(XT, 43, { ferns: 6, fx: 1.5, fz: 4.6 });
  dress(XS, 44, { ferns: 5, fz: 5.4 });

  // ---------- figures and staked name tags ----------
  const figs = {};
  const mkFig = (name, opts) => (figs[name] = cut(person(opts), { alphaTest: 0.1, transparent: true }));
  mkFig("ono", { seed: 1, cap: "field", rifle: true });
  mkFig("onoW", { seed: 1, cap: "field", rifle: true, pose: "walk" });
  mkFig("onoSal", { seed: 2, cap: "field", pose: "salute" });
  mkFig("onoSw", { seed: 2, cap: "field", pose: "sword" });
  mkFig("aka", { seed: 3, cap: "field", rifle: true, coat: "#857650" });
  mkFig("akaW", { seed: 3, cap: "field", rifle: true, coat: "#857650", pose: "walk" });
  mkFig("shi", { seed: 4, cap: "field", pack: true, coat: "#7F7552" });
  mkFig("shiW", { seed: 4, cap: "field", pack: true, coat: "#7F7552", pose: "walk" });
  mkFig("shiG", { seed: 4, cap: "field", pack: true, ghost: true });
  mkFig("koz", { seed: 5, cap: "field", rifle: true, coat: "#8E7D58" });
  mkFig("kozW", { seed: 5, cap: "field", rifle: true, coat: "#8E7D58", pose: "walk" });
  mkFig("kozG", { seed: 5, cap: "field", rifle: true, ghost: true });
  mkFig("suz", { seed: 6, cap: "bush", pack: true, coat: "#6F7A6E", pose: "camera" });
  mkFig("tan", { seed: 7, cap: "hat", suit: true, coat: "#5F6670", pose: "paper" });
  const FW = 0.96, FHt = 1.92;
  const actor = (mat, x, z) => { const m = plane(FW, FHt, mat, x, FHt / 2, z); m.customDepthMaterial = undefined; return m; };

  const tagTex = (name, sub, col = SEP) => canvasTex(640, 220, (g, w, h) => {
    const q = mulberry(name.length * 7 + sub.length);
    const p = poly([[8, 14], [w - 10, 6], [w - 4, h - 12], [12, h - 6]]); g.fillStyle = "#F6F1E4"; g.fill(p);
    g.save(); g.clip(p); for (let i = 0; i < 12; i++) blot(g, q() * w, q() * h, 40 + q() * 90, "#C8B48C", 0.06); g.restore();
    ink(g, p, q, 2.4, 0.8);
    g.beginPath(); g.arc(34, 42, 9, 0, 7); g.strokeStyle = rgba(GR, 0.7); g.lineWidth = 2.5; g.stroke();
    g.fillStyle = GR; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `400 88px ${FT}`; g.fillText(name, w / 2 + 10, 84, w - 70);
    g.fillStyle = col; g.font = `400 52px ${FT}`; g.fillText(sub, w / 2 + 10, 164, w - 60);
  });
  const stakeM = std(0x6b5236, 0.9);
  const mkTag = (name, sub, sub2, col2) => {
    const G = new THREE.Group(); scene.add(G);
    const t1 = tagTex(name, sub), t2 = sub2 ? tagTex(name, sub2, col2 || RED) : null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.52), cut(t1)); m.position.y = 0.42; m.castShadow = true; G.add(m);
    cyl(0.025, 0.03, 0.4, 6, stakeM, 0, 0.12, -0.02, G);
    return { G, m, t1, t2 };
  };

  // station J: Onoda and the three men
  const ono = actor(figs.ono, XJ, 0), aka = actor(figs.aka, XJ - 4, -0.4), shi = actor(figs.shi, XJ - 5, 0.2), koz = actor(figs.koz, XJ - 6, -0.2);
  const shiG = actor(figs.shiG, 0, 0.21), kozG = actor(figs.kozG, 0, -0.19);
  shiG.castShadow = kozG.castShadow = false;
  const camp = [4.05, 5.15, 6.25, 7.35];
  const tagO = mkTag("Hiroo Onoda", "letnan dua", "sendirian", SEP), tagA = mkTag("Akatsu", "anak buah", "menyerah 1950", SEP), tagS = mkTag("Shimada", "anak buah", "tewas 1954"), tagK = mkTag("Kozuka", "anak buah", "tewas 1972");
  // station T: tent, fire, Suzuki, Onoda, Taniguchi
  const canvasT = canvasTex(512, 512, (g, w, h) => { const q = mulberry(8); paper(g, w, h, q, "#B9A77C"); for (let i = 0; i < 30; i++) blot(g, q() * w, q() * h, 40 + q() * 90, SEP, 0.12); hatch(g, w, h, -0.9, 8, 0.3, q, 1.3); g.strokeStyle = rgba(GR, 0.6); g.lineWidth = 3; for (let x = 64; x < w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } });
  const tent = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.55, 4, 1), new THREE.MeshStandardMaterial({ map: canvasT, roughness: 1, flatShading: true }));
  tent.rotation.y = Math.PI / 4; tent.scale.set(1, 1, 1.5); tent.position.set(XT - 1.6, 0.77, -2.4); tent.castShadow = tent.receiveShadow = true; scene.add(tent);
  const logs = new THREE.Group(); logs.position.set(XT - 0.2, 0, -0.9); scene.add(logs);
  for (let i = 0; i < 4; i++) { const l = cyl(0.06, 0.07, 0.7, 6, std(0x4a3a28, 1), 0, 0.06, 0, logs); l.rotation.set(Math.PI / 2, 0, (i * Math.PI) / 4); l.rotation.order = "ZXY"; }
  const flameT = canvasTex(128, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.72, 4, w / 2, h * 0.6, w * 0.5); gr.addColorStop(0, "rgba(255,236,170,1)"); gr.addColorStop(0.45, "rgba(232,140,60,.9)"); gr.addColorStop(1, "rgba(178,58,46,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 6); g.quadraticCurveTo(w, h * 0.7, w / 2, h - 4); g.quadraticCurveTo(0, h * 0.7, w / 2, 6); g.fill(); });
  const flame = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.84), new THREE.MeshBasicMaterial({ map: flameT, transparent: true, depthWrite: false, color: new THREE.Color(1.6, 1.4, 1.2) }));
  flame.position.set(XT - 0.2, 0.42, -0.9); scene.add(flame);
  const fireL = new THREE.PointLight(0xffa050, 3, 7, 1.6); fireL.position.set(XT - 0.2, 0.7, -0.6); scene.add(fireL);
  const suz = actor(figs.suz, XT - 1.3, 0.3), onoT = actor(figs.onoW, XT + 4.5, 0.1), tan = actor(figs.tan, XT + 4.6, 0.5);
  const tagSz = mkTag("Norio Suzuki", "petualang"), tagOT = mkTag("Hiroo Onoda", "Feb 1974"), tagTn = mkTag("Y. Taniguchi", "mantan atasan");
  const flashL = new THREE.PointLight(0xffffff, 0, 12, 1.2); flashL.position.set(XT - 1.2, 1.8, 0.9); scene.add(flashL);
  const starT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,250,235,.7)"); gr.addColorStop(1, "rgba(255,250,235,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, w - 10); g.moveTo(10, w / 2); g.lineTo(w - 10, w / 2); g.stroke(); });
  const star = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: starT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  star.position.set(XT - 1.14, 1.72, 0.5); scene.add(star);
  const glowT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,240,200,.9)"); gr.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const pglow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  scene.add(pglow);

  // station V: stilt houses, burnt rice piles, smoke
  const hutT = canvasTex(512, 512, (g, w, h) => {
    const q = mulberry(51);
    const roof = poly([[40, 230], [256, 70], [472, 230]]), wall = poly([[90, 230], [422, 230], [422, 380], [90, 380]]);
    for (const x of [100, 200, 312, 412]) { const s = poly([[x - 8, 380], [x + 8, 380], [x + 6, 506], [x - 6, 506]]); g.fillStyle = "#7A5E3E"; g.fill(s); ink(g, s, q, 1.6, 0.7); }
    g.fillStyle = "#C9B07A"; g.fill(wall); g.save(); g.clip(wall); hatch(g, w, h, 0, 9, 0.35, q, 1.2); hatch(g, w, h, Math.PI / 2, 9, 0.25, q, 1.1); g.restore(); ink(g, wall, q, 2.2, 0.85);
    const door = poly([[220, 270], [290, 270], [290, 380], [220, 380]]); g.fillStyle = "#4A3D2C"; g.fill(door); ink(g, door, q, 1.8, 0.8);
    g.fillStyle = "#B49660"; g.fill(roof); g.save(); g.clip(roof); for (let i = 0; i < 40; i++) blot(g, q() * w, 80 + q() * 150, 30, SEP, 0.15); g.strokeStyle = rgba(GR, 0.45); g.lineWidth = 1.3; for (let x = 40; x < 472; x += 7) { g.beginPath(); g.moveTo(256 + (x - 256) * 0.1, 80); g.lineTo(x, 236); g.stroke(); } g.restore(); ink(g, roof, q, 2.4, 0.85);
  });
  const hutM = cut(hutT);
  for (const [x, z, s] of [[-3.2, -5.6, 3.0], [1.6, -6.8, 3.4], [4.6, -5.0, 2.6]]) plane(s, s, hutM, XV + x, s / 2, z);
  const riceT = canvasTex(512, 256, (g, w, h) => { const q = mulberry(61); g.fillStyle = "#4A3E30"; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) blot(g, q() * w, q() * h, 20 + q() * 50, q() < 0.4 ? "#B9A27A" : "#1E1A16", 0.25); hatch(g, w, h, -0.8, 5, 0.6, q, 1.4, "#1A1714"); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(210,190,140,${0.2 + q() * 0.3})`; g.fillRect(q() * w, q() * h, 3, 1.6); } });
  const riceM = new THREE.MeshStandardMaterial({ map: riceT, roughness: 1 });
  const rice = [];
  for (const [x, z, s] of [[-1.4, -0.4, 1], [0.2, 0.5, 1.15], [1.8, -0.8, 0.9], [-0.2, -2.0, 1.05], [3.0, 0.4, 0.8]]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.62 * s, 0.6 * s, 18, 1), riceM); m.position.set(XV + x, 0.3 * s, z); m.castShadow = m.receiveShadow = true; scene.add(m); rice.push([XV + x, 0.6 * s, z]);
  }
  const smoke = pts(scene, 260, { color: 0x6a6660, size: 0.9, add: false, opacity: 0.32 });
  const sSeed = []; for (let i = 0; i < 260; i++) sSeed.push([rnd(), rnd(), rnd(), rnd() * 6.28]);

  // station S: table, rifle, ammunition, sword, radio
  const tableT = canvasTex(512, 256, (g, w, h) => { const q = mulberry(71); paper(g, w, h, q, "#B08A5E"); hatch(g, w, h, 0.05, 6, 0.35, q, 1.2, "#3B2A1A"); });
  const tbl = new THREE.Group(); tbl.position.set(XS, 0, 0.1); scene.add(tbl);
  box(2.3, 0.08, 1.0, new THREE.MeshStandardMaterial({ map: tableT, roughness: 1 }), 0, 0.76, 0, tbl);
  for (const [x, z] of [[-1.05, -0.42], [1.05, -0.42], [-1.05, 0.42], [1.05, 0.42]]) box(0.07, 0.74, 0.07, std(0x5a4128, 1), x, 0.37, z, tbl);
  const rifle = new THREE.Group(); rifle.position.set(XS - 0.25, 0.83, -0.25); rifle.rotation.y = 0.06; scene.add(rifle);
  box(1.25, 0.05, 0.06, std(0x3a3632, 0.6, 0.3), 0, 0, 0, rifle); box(0.62, 0.09, 0.08, std(0x6a4a2c, 0.9), -0.38, -0.01, 0, rifle);
  const ammo = box(0.34, 0.16, 0.22, std(0x5e5a3e, 0.9), XS + 0.78, 0.88, -0.18, scene);
  const sword = new THREE.Group(); scene.add(sword);
  box(0.82, 0.045, 0.05, std(0x2b2724, 0.5, 0.2), 0.12, 0, 0, sword);
  box(0.28, 0.05, 0.055, std(0x8a6a45, 0.9), -0.43, 0, 0, sword);
  const tsuba = cyl(0.065, 0.065, 0.02, 14, std(0x6a6258, 0.4, 0.6), -0.28, 0, 0, sword); tsuba.rotation.z = Math.PI / 2;
  const onoS = actor(figs.onoSw, XS, -0.85);
  const radioT = canvasTex(256, 160, (g, w, h) => { const q = mulberry(81); g.fillStyle = "#6E5A44"; g.fillRect(0, 0, w, h); ink(g, poly([[4, 4], [w - 4, 4], [w - 4, h - 4], [4, h - 4]]), q, 3, 0.9); g.fillStyle = rgba(GR, 0.8); for (let y = 24; y < h - 20; y += 10) for (let x = 20; x < 132; x += 10) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); } g.fillStyle = "#E9DFC8"; g.fillRect(150, 26, 88, 60); g.strokeStyle = GR; g.lineWidth = 2; g.strokeRect(150, 26, 88, 60); g.fillStyle = GR; g.font = `400 16px ${FT}`; g.fillText("AM 55 · 100 · 160", 152, 104); g.fillStyle = RED; g.fillRect(190, 30, 3, 52); g.beginPath(); g.arc(196, 128, 14, 0, 7); g.fillStyle = "#3A3028"; g.fill(); });
  const radio = new THREE.Group(); radio.position.set(XS + 0.62, 0.8, 0.22); radio.rotation.y = -0.25; scene.add(radio);
  const rbody = box(0.56, 0.35, 0.16, [std(0x5a4836, 0.8), std(0x5a4836, 0.8), std(0x5a4836, 0.8), std(0x5a4836, 0.8), new THREE.MeshStandardMaterial({ map: radioT, roughness: 0.9 }), std(0x5a4836, 0.8)], 0, 0.175, 0, radio);
  const ant = cyl(0.008, 0.008, 0.7, 4, std(0x9a9a98, 0.4, 0.6), 0.2, 0.35 + 0.33, -0.02, radio); ant.rotation.z = -0.35;
  const waves = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 48, 1, 0.3, 2.4), new THREE.MeshBasicMaterial({ color: 0x2e2e2e, transparent: true, side: THREE.DoubleSide, depthWrite: false })); m.position.set(XS + 0.62 + 0.28, 1.5, 0.2); scene.add(m); return m; });

  // ---------- leaflets, letters and the plane ----------
  const leafT = canvasTex(512, 352, (g, w, h) => {
    const q = mulberry(91); paper(g, w, h, q, "#EDE3C9"); g.strokeStyle = rgba(GR, 0.8); g.lineWidth = 3; g.setLineDash([12, 7]); g.strokeRect(14, 14, w - 28, h - 28); g.setLineDash([]);
    g.fillStyle = GR; g.textAlign = "center"; g.font = `400 54px ${FT}`; g.fillText("PERANG TELAH", w / 2, 110); g.fillText("BERAKHIR", w / 2, 172);
    g.fillStyle = RED; g.font = `400 44px ${FT}`; g.fillText("15 AGUSTUS 1945", w / 2, 246); g.fillStyle = rgba(GR, 0.6); g.font = `400 22px ${FT}`; g.fillText("ilustrasi selebaran", w / 2, 310);
  });
  const leafM = cut(leafT, { alphaTest: 0.05 });
  const halfGeo = (side) => { const geo = new THREE.PlaneGeometry(0.7, 0.96); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, side * 0.5 + uv.getX(i) * 0.5); geo.translate(side ? 0.35 : -0.35, 0, 0); return geo; };
  const hero = new THREE.Group(); scene.add(hero);
  const halves = [0, 1].map((s) => { const m = new THREE.Mesh(halfGeo(s), leafM); m.castShadow = true; hero.add(m); return m; });
  const NL = 46, leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.34, 0.24), leafM, NL); leaves.castShadow = true; scene.add(leaves);
  const lSeed = []; for (let i = 0; i < NL; i++) lSeed.push([rnd(), rnd(), rnd(), rnd()]);
  const envT = canvasTex(256, 160, (g, w, h) => { const q = mulberry(95); paper(g, w, h, q, "#F3EEDF"); ink(g, poly([[6, 6], [w - 6, 6], [w - 6, h - 6], [6, h - 6]]), q, 3, 0.8); g.strokeStyle = rgba(GR, 0.6); g.lineWidth = 2; g.beginPath(); g.moveTo(6, 6); g.lineTo(w / 2, h * 0.55); g.lineTo(w - 6, 6); g.stroke(); g.fillStyle = RED; g.fillRect(w - 62, 18, 40, 30); });
  const NE = 14, envs = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.4, 0.25), cut(envT, { alphaTest: 0.05 }), NE); envs.castShadow = true; scene.add(envs);
  const eSeed = []; for (let i = 0; i < NE; i++) eSeed.push([rnd(), rnd(), rnd(), rnd()]);
  const planeT = canvasTex(1024, 384, (g) => {
    const q = mulberry(97);
    const body = new Path2D(); body.moveTo(80, 200); body.quadraticCurveTo(140, 160, 300, 168); body.lineTo(860, 176); body.quadraticCurveTo(960, 186, 990, 200); body.quadraticCurveTo(940, 222, 860, 220); body.lineTo(300, 226); body.quadraticCurveTo(140, 230, 80, 200); body.closePath();
    const wing = poly([[420, 192], [600, 192], [520, 330], [470, 330]]), tail = poly([[60, 196], [120, 196], [90, 80], [52, 84]]), stab = poly([[70, 206], [170, 206], [120, 250], [72, 246]]);
    const eng = ell(500, 236, 58, 22);
    for (const [p, c] of [[wing, "#7C7A70"], [tail, "#8A887C"], [stab, "#7C7A70"], [body, "#A7A496"], [eng, "#5E5C54"]]) { g.fillStyle = c; g.fill(p); }
    g.globalCompositeOperation = "source-atop"; hatch(g, 1024, 384, -0.9, 6, 0.35, q, 1.2); g.globalCompositeOperation = "source-over";
    for (const p of [wing, tail, stab, body, eng]) ink(g, p, q, 2.6, 0.85);
    g.fillStyle = rgba(GR, 0.7); for (let x = 340; x < 820; x += 54) g.fillRect(x, 182, 26, 14);
    g.strokeStyle = rgba(GR, 0.7); g.lineWidth = 3; g.beginPath(); g.moveTo(560, 236); g.lineTo(560, 236); g.ellipse(560, 236, 6, 60, 0, 0, 7); g.stroke();
  });
  const air = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.575), cut(planeT, { fog: false })); scene.add(air);

  // ---------- the field map, pinned to a board far west ----------
  const MW = 16, MH = 27.33, MS = 0.5256, COS = Math.cos((18 * Math.PI) / 180);
  const MP = (lon, lat) => [MX + (lon - 130) * COS * MS, (lat - 14) * MS + MH / 2];
  const CWm = 2048, CHm = 3498;
  const MC = (lon, lat) => { const [x, y] = MP(lon, lat); return [((x - MX + MW / 2) / MW) * CWm, (1 - y / MH) * CHm]; };
  const mapT = canvasTex(CWm, CHm, (g, w, h) => {
    const q = mulberry(101); paper(g, w, h, q, "#F1EBDD");
    const rings = []; for (const c of GEO) for (const rg of c.rings) rings.push({ name: c.name, p: rg.map(([lo, la]) => MC(lo, la)) });
    const rp = (filter) => { const p = new Path2D(); for (const rg of rings) { if (filter && !filter(rg)) continue; rg.p.forEach((v, i) => (i ? p.lineTo(v[0], v[1]) : p.moveTo(v[0], v[1]))); p.closePath(); } return p; };
    const land = rp();
    // sea: coast ripple lines and light hatching
    g.lineJoin = "round";
    for (const [lw, a] of [[60, 0.05], [36, 0.06], [16, 0.08]]) { g.strokeStyle = rgba("#6E8A92", a); g.lineWidth = lw; g.stroke(land); }
    g.save(); g.fillStyle = "#000"; hatch(g, w, h, -0.7, 16, 0.07, q, 1.1, "#4E6870"); g.restore();
    g.save(); g.clip(land); g.fillStyle = "#E6E2C8"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) blot(g, q() * w, q() * h, 30 + q() * 120, q() < 0.6 ? JL : "#C9B48A", 0.12 + q() * 0.16);
    hatch(g, w, h, -1.0, 9, 0.16, q, 1.2); g.restore();
    g.strokeStyle = rgba(JD, 0.35); g.lineWidth = 7; g.stroke(land);
    ink(g, land, q, 2.6, 0.85);
    // graticule and frame
    g.strokeStyle = rgba(GR, 0.22); g.lineWidth = 1.6; g.setLineDash([12, 8]);
    for (let lo = 115; lo <= 145; lo += 5) { const a = MC(lo, -13), b = MC(lo, 41); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    for (let la = -10; la <= 40; la += 5) { const a = MC(113, la), b = MC(147, la); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    g.setLineDash([]); g.fillStyle = rgba(GR, 0.55); g.font = `400 26px ${FT}`;
    for (let la = 5; la <= 35; la += 10) { const p = MC(143.6, la); g.fillText(la + "° LU", p[0], p[1] - 8); }
    g.strokeStyle = GR; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48); g.lineWidth = 2; g.strokeRect(42, 42, w - 84, h - 84);
    const lab = (txt, lon, lat, px, o = {}) => { const [x, y] = MC(lon, lat); g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.font = o.it ? `italic 400 ${px}px ${FH}` : `400 ${px}px ${FT}`; g.letterSpacing = (o.sp ?? 6) + "px"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 10; g.strokeStyle = rgba("#F1EBDD", 0.9); g.strokeText(txt, 0, 0); g.fillStyle = o.col || GR; g.fillText(txt, 0, 0); g.restore(); };
    lab("JEPANG", 136.5, 38.4, 64, { sp: 14 }); lab("TIONGKOK", 117.5, 28, 56, { sp: 12 }); lab("TAIWAN", 121, 24.6, 34);
    lab("FILIPINA", 125.4, 15.6, 60, { sp: 12 }); lab("INDONESIA", 121.8, -0.4, 52, { sp: 12 }); lab("MALAYSIA", 116.5, 4.2, 34);
    lab("Samudra Pasifik", 138, 20, 58, { it: true, sp: 4 }); lab("Laut Filipina", 132, 12, 46, { it: true, sp: 3 }); lab("Laut Cina Selatan", 116, 15.5, 38, { it: true, sp: 2, rot: -1.2 });
    const [tx, ty] = MC(139.7, 35.7); g.beginPath(); g.arc(tx, ty, 10, 0, 7); g.fillStyle = GR; g.fill(); lab("Tokyo", 141.6, 34.9, 34, { sp: 2 });
    g.save(); g.translate(w - 330, h - 240); g.fillStyle = rgba("#F6F1E4", 0.95); g.fillRect(-250, -90, 500, 180); g.strokeStyle = GR; g.lineWidth = 3; g.strokeRect(-250, -90, 500, 180); g.lineWidth = 1.4; g.strokeRect(-238, -78, 476, 156);
    g.fillStyle = GR; g.textAlign = "center"; g.font = `700 46px ${FH}`; g.fillText("Peta Lapangan", 0, -16); g.font = `400 28px ${FT}`; g.fillText("Pasifik Barat · ilustrasi", 0, 40); g.restore();
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), new THREE.MeshStandardMaterial({ map: canvasTex(1024, 1024, (g, w, h) => { const q = mulberry(111); paper(g, w, h, q, "#C9B999"); hatch(g, w, h, 0.9, 10, 0.12, q, 1.2, "#5A4A33"); }, [4, 3]), roughness: 1 }));
  board.position.set(MX, 12, -1.6); board.receiveShadow = true; scene.add(board);
  const mapGeo = new THREE.PlaneGeometry(MW, MH, 30, 36); { const p = mapGeo.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (MW / 2), v = p.getY(i) / (MH / 2); p.setZ(i, 0.25 * (u ** 6 + v ** 8) + 0.05 * Math.sin(u * 4 + v * 3)); } mapGeo.computeVertexNormals(); }
  const mapMesh = new THREE.Mesh(mapGeo, new THREE.MeshStandardMaterial({ map: mapT, roughness: 1 })); mapMesh.position.set(MX, MH / 2, -1); mapMesh.castShadow = mapMesh.receiveShadow = true; scene.add(mapMesh);
  for (const [x, y] of [[-MW / 2 + 0.5, MH - 0.5], [MW / 2 - 0.5, MH - 0.5], [-MW / 2 + 0.5, 0.5], [MW / 2 - 0.5, 0.5]]) { const pin = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), std(0xb23a2e, 0.5)); pin.position.set(MX + x, y, -0.7); pin.castShadow = true; scene.add(pin); }
  // dynamic overlay: routes and markers
  const ov = document.createElement("canvas"); ov.width = CWm; ov.height = CHm; const og = ov.getContext("2d");
  const ovT = new THREE.CanvasTexture(ov); ovT.colorSpace = THREE.SRGBColorSpace; ovT.anisotropy = 8;
  const ovMesh = new THREE.Mesh(mapGeo, new THREE.MeshStandardMaterial({ map: ovT, transparent: true, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, depthWrite: false }));
  ovMesh.position.copy(mapMesh.position); scene.add(ovMesh);
  const route = (a, b, bend) => { const A_ = MC(...a), B_ = MC(...b), m = [(A_[0] + B_[0]) / 2 + bend[0], (A_[1] + B_[1]) / 2 + bend[1]]; return quad(A_, m, B_, 80); };
  const r1 = route([139.7, 35.7], [120.1, 13.8], [260, 120]), r2 = route([120.1, 13.8], [128.4, 2.3], [-120, -60]);
  let ovKey = "";
  const drawOv = (f1, c1, f2, c2, lab2) => {
    const k = [f1, c1, f2, c2, lab2].map((v) => Math.round(v * 60)).join("|"); if (k === ovKey) return; ovKey = k;
    og.clearRect(0, 0, CWm, CHm); og.lineCap = og.lineJoin = "round";
    const line = (pl, f) => { if (f <= 0) return; const n = Math.max(2, Math.round(pl.length * f)); og.setLineDash([26, 18]); og.strokeStyle = RED; og.lineWidth = 9; og.beginPath(); for (let i = 0; i < n; i++) i ? og.lineTo(...pl[i]) : og.moveTo(...pl[i]); og.stroke(); og.setLineDash([]); const a = pl[n - 1]; og.beginPath(); og.arc(a[0], a[1], 12, 0, 7); og.fillStyle = RED; og.fill(); };
    line(r1, f1); line(r2, f2);
    const mark = (lon, lat, c, txt, dx, dy) => { if (c <= 0) return; const [x, y] = MC(lon, lat); og.globalAlpha = c; og.strokeStyle = RED; og.lineWidth = 7; og.beginPath(); og.arc(x, y, 40 + 30 * (1 - c), 0, 7); og.stroke(); og.lineWidth = 3; og.beginPath(); og.arc(x, y, 54 + 30 * (1 - c), 0.2, 5.6); og.stroke();
      og.font = `400 52px ${FT}`; og.textAlign = dx < 0 ? "right" : "left"; og.textBaseline = "middle"; og.lineWidth = 12; og.strokeStyle = rgba("#F1EBDD", 0.95); og.strokeText(txt, x + dx, y + dy); og.fillStyle = RED; og.fillText(txt, x + dx, y + dy); og.globalAlpha = 1; };
    mark(120.1, 13.8, c1, "Pulau Lubang", 80, -60);
    mark(128.4, 2.3, c2, "Morotai", -90, -20);
    if (lab2 > 0) { const [x, y] = MC(128.4, 2.3); og.globalAlpha = lab2; og.font = `400 46px ${FT}`; og.textAlign = "center"; og.lineWidth = 10; og.strokeStyle = rgba("#F1EBDD", 0.95); og.strokeText("Teruo Nakamura, Des 1974", x + 20, y + 120); og.fillStyle = GR; og.fillText("Teruo Nakamura, Des 1974", x + 20, y + 120); og.globalAlpha = 1; }
    ovT.needsUpdate = true;
  };

  // ---------- atmosphere: smoke beyond the hills (1945), pollen ----------
  const war = pts(scene, 220, { color: 0x77726a, size: 3.2, add: false, opacity: 0.3 });
  const wSeed = []; for (let i = 0; i < 220; i++) wSeed.push([rnd(), rnd(), rnd(), rnd() * 6.28]);
  const warL = new THREE.PointLight(0xffb070, 0, 60, 1.2); warL.position.set(8, 9, -36); scene.add(warL);
  const pollen = pts(scene, 160, { color: 0x3a3a30, size: 0.05, add: false, opacity: 0.55 });
  const pSeed = []; for (let i = 0; i < 160; i++) pSeed.push([rnd() - 0.5, rnd(), rnd() - 0.5, rnd() * 6.28, 0.2 + rnd() * 0.5]);

  // ---------- timing ----------
  const tH = A("s2:Hiroo"), tIa = A("s2:ia"), tLub = A("s2:Lubang"), tFil = A("s2:Filipina"), tPer = A("s2:Perintahnya");
  const tReb = A("s3:merebut"), tOno3 = A("s3:Onoda"), tTiga = A("s3:tiga");
  const tSel = A("s4:selebaran"), tAng = A("s4:menganggapnya"), tSur = A("s4:Surat"), tUd = A("s4:udara");
  const t50 = A("s5:menyerah"), t54 = A("s5:1954"), t72 = A("s5:1972"), tSelama = A("s5:Selama");
  const tSuz = A("s6:Norio"), tMen = A("s6:menemukannya"), tMaka = A("s6:Maka"), tMay = A("s6:Mayor"), tTer = A("s6:terbang"), tBaca = A("s6:membacakan");
  const tSer = A("s7:menyerah"), tPres = A("s7:Presiden"), tMeski = A("s7:meski"), tRadio = A("s7:radio");
  const tDan8 = A("s8:Dan"), tPraj = A("s8:Prajurit"), tIndo = A("s8:Indonesia"), tMenurut = A("s8:Menurut");
  const lub = MP(120.1, 13.8), tok = MP(139.7, 35.7), mor = MP(128.4, 2.3);
  const segs = [
    [0, track([
      [0, ...F(XJ, 0, 0, 24, 1150, -3)],
      [A("s1:Tapi"), ...F(XJ, 0, 0, 19, 1185, -1.6)],
      [A("s1:1974"), ...F(XJ, 0, 0, 16, 1210, -0.6)],
      [K.s2, ...F(XJ, 0, 0, 14.6, 1220, 0.4)],
      [tIa, ...F(XJ + 0.2, 0, 0, 13.8, 1225, 1.2)],
    ])],
    [tIa, track([
      [tIa, ...F(tok[0], tok[1], -1, 15, 1060, 0.4)],
      [(tIa + tFil) / 2 + 0.3, ...F((tok[0] + lub[0]) / 2, (tok[1] + lub[1]) / 2, -1, 17, 1060, 0)],
      [tFil + 0.6, ...F(lub[0] + 1.3, lub[1], -1, 14.5, 1080, -0.3)],
      [tPer, ...F(lub[0] + 1.5, lub[1], -1, 12.5, 1090, -0.4)],
    ])],
    [tPer, track([
      [tPer, ...F(XJ, 0, 0, 13.8, 1225, -1.6)],
      [K.s3, ...F(XJ + 0.4, 0, 0, 15.2, 1225, -0.6)],
      [tReb, ...F(XJ + 1.4, 0, 0, 19, 1235, 0.4)],
      [tOno3, ...F(XJ + 0.2, 0, 0, 14, 1230, 0.3)],
      [K.s3e, ...F(5.3, 0, 0, 12.2, 1215, 0.4)],
      [tSel, ...F(5.6, 0, 0, 11.8, 1210, 0.2)],
      [tAng, ...F(5.7, 0, 0, 11.4, 1210, 0.35)],
      [tSur, ...F(5.75, 0, 0, 12.2, 1200, 0.1)],
      [K.s5, ...F(5.7, 0, 0, 11.6, 1200, -0.25)],
      [t50 + 0.3, ...F(4.6, 0, 0, 9.6, 1200, -0.1)],
      [t54 - 0.6, ...F(5.4, 0, 0, 9.8, 1200, 0)],
      [t54 + 0.4, ...F(6.25, 0, 0, 9.5, 1200, 0.1)],
      [t72 + 0.4, ...F(6.9, 0, 0, 9.6, 1200, 0.2)],
      [tSelama, ...F(5.4, 0, 0, 10.4, 1200, 0.1)],
    ])],
    [tSelama, track([
      [tSelama, ...F(XV + 0.2, 0.3, 0, 10.5, 1150, -1.8)],
      [A("s5:menyerang"), ...F(XV + 0.4, 0.3, 0, 10, 1150, -0.8)],
      [A("s5:30"), ...F(XV + 0.6, 0.3, 0, 9.4, 1155, 0.2)],
      [K.s6, ...F(XV + 0.8, 0.3, 0, 9.0, 1160, 1.0)],
    ])],
    [K.s6, track([
      [K.s6, ...F(XT - 0.6, 0, 0, 14.6, 1220, -1.4)],
      [tSuz, ...F(XT - 0.4, 0, 0, 14.2, 1220, -0.8)],
      [tMen, ...F(XT + 0.1, 0, 0, 14, 1220, -0.2)],
      [tMaka, ...F(XT + 0.9, 0, 0, 14.2, 1220, 0.4)],
      [tMay, ...F(XT + 1.9, 0, 0, 14.2, 1220, 0.8)],
      [tBaca, ...F(XT + 2.1, 0, 0, 13.6, 1220, 1.1)],
      [K.s7, ...F(XT + 2.2, 0, 0, 13.3, 1220, 1.3)],
    ])],
    [K.s7, track([
      [K.s7, ...F(XS, 0, 0, 13.8, 1220, -1.2)],
      [tSer, ...F(XS, 0, 0, 13.2, 1220, -0.5)],
      [tPres, ...F(XS + 0.1, 0, 0, 13.3, 1215, 0.2)],
      [tMeski, ...F(XS + 0.3, 0.8, 0, 8.6, 1110, 0.6)],
      [tRadio, ...F(XS + 0.5, 0.8, 0.1, 7.2, 1110, 0.9)],
      [K.s8, ...F(XS + 0.6, 0.8, 0.1, 6.9, 1110, 1.1)],
    ])],
    [K.s8, track([
      [K.s8, ...F(lub[0], lub[1], -1, 13.5, 1090, 0.3)],
      [tDan8, ...F(lub[0] + 0.2, lub[1] - 0.2, -1, 14, 1090, 0)],
      [tIndo, ...F(MX - 3.5, mor[1], -1, 19, 1220, -0.2)],
      [tMenurut, ...F(MX - 3.5, mor[1], -1, 21, 1260, 0)],
      [K.end, ...F(MX - 3.5, mor[1], -1, 22.2, 1270, 0.2)], [K.dur, ...F(MX - 3.5, mor[1], -1, 22.6, 1270, 0.25)],
    ])],
  ];
  const tgt = new THREE.Vector3(), tmp = new THREE.Vector3();
  const sp = (nx, ny, d) => { tmp.set(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize(); return tmp.multiplyScalar(d).add(cam.position); };
  const face = (m, flip = 1) => { m.rotation.set(0, Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z) * 0.35, 0); m.scale.x = flip; };
  const placeTag = (T, x, z, vis, after, sc = 1) => { T.G.position.set(x, 0, z + (sc < 1 ? 1.6 : 1.15)); const s = Math.max(0.001, vis) * sc; T.G.scale.setScalar(s); T.G.visible = vis > 0.002; T.m.material.map = after && T.t2 ? T.t2 : T.t1; };
  const walkTex = (m, stand, walk, moving, t) => { m.material = moving && Math.floor(t * 4.5) % 2 ? walk : stand; };

  return (t) => {
    // camera: one Hermite track per set, hard cut between sets (hidden by the hatching sweep)
    let si = 0; while (si < segs.length - 1 && t >= segs[si + 1][0]) si++;
    const c = segs[si][1](t);
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.12, c[1] + Math.sin(t * 0.23) * 0.06, c[2]);
    tgt.set(c[3] + Math.sin(t * 0.27) * 0.08, c[4], c[5]); cam.lookAt(tgt);
    cam.updateMatrixWorld();
    key.position.set(tgt.x - 14, 24, tgt.z + 18); key.target.position.copy(tgt);

    // --- station J ---
    const walk3 = ramp(t, tOno3 - 0.1, K.s3e + 0.6);
    const ox = XJ + (camp[0] - XJ) * walk3;
    ono.position.set(ox, FHt / 2 + Math.abs(Math.sin(t * 9)) * 0.03 * (walk3 > 0 && walk3 < 1 ? 1 : 0), 0);
    walkTex(ono, figs.ono, figs.onoW, walk3 > 0.02 && walk3 < 0.98, t); face(ono);
    const comeIn = ramp(t, tOno3 - 0.3, tOno3 + 0.4);
    const mates = [[aka, figs.aka, figs.akaW, XJ - 3.2, camp[1], -0.4], [shi, figs.shi, figs.shiW, XJ - 4.4, camp[2], 0.2], [koz, figs.koz, figs.kozW, XJ - 5.6, camp[3], -0.2]];
    const lagW = (i) => ramp(t, tOno3 + 0.2 * i, K.s3e + 0.8 + 0.2 * i);
    mates.forEach(([m, st, wk, x0, x1, z], i) => {
      const w = lagW(i + 1); m.position.set(x0 + (x1 - x0) * w, FHt / 2 + Math.abs(Math.sin(t * 9 + i)) * 0.03 * (w > 0 && w < 1 ? 1 : 0), z);
      walkTex(m, st, wk, w > 0.02 && w < 0.98, t); face(m); m.material.opacity = comeIn;
    });
    // Akatsu walks off to surrender; Shimada and Kozuka become pencil outlines
    const akaGo = ramp(t, t50 + 0.1, t50 + 2.2);
    if (akaGo > 0) { aka.position.x = camp[1] - 3.8 * akaGo; aka.material = akaGo < 0.98 && Math.floor(t * 4.5) % 2 ? figs.akaW : figs.aka; }
    figs.aka.opacity = figs.akaW.opacity = comeIn * (1 - ramp(t, t50 + 1.2, t50 + 2.2));
    const shiOut = ramp(t, t54 + 0.1, t54 + 0.9), kozOut = ramp(t, t72 + 0.1, t72 + 0.9);
    figs.shi.opacity = figs.shiW.opacity = comeIn * (1 - shiOut); figs.koz.opacity = figs.kozW.opacity = comeIn * (1 - kozOut);
    figs.ono.opacity = figs.onoW.opacity = 1;
    shiG.position.set(shi.position.x, FHt / 2, 0.21); shiG.material.opacity = 0.75 * shiOut; shiG.visible = shiOut > 0; face(shiG);
    kozG.position.set(koz.position.x, FHt / 2, -0.19); kozG.material.opacity = 0.75 * kozOut; kozG.visible = kozOut > 0; face(kozG);
    aka.castShadow = akaGo < 0.6; shi.castShadow = shiOut < 0.5; koz.castShadow = kozOut < 0.5;
    const tagIn = (a) => eout(ramp(t, a, a + 0.45));
    placeTag(tagO, ono.position.x, 0, tagIn(tH) * (t < tSelama + 0.3 ? 1 : 0), t > t72 + 0.6, 0.72);
    placeTag(tagA, t > t50 ? camp[1] : aka.position.x, -0.4, tagIn(tTiga + 0.3), t > t50 + 0.2, 0.72);
    placeTag(tagS, shi.position.x, 0.2, tagIn(tTiga + 0.5), t > t54 + 0.2, 0.72);
    placeTag(tagK, koz.position.x, -0.2, tagIn(tTiga + 0.7), t > t72 + 0.2, 0.72);
    // 1945 assault: smoke climbs beyond the ridges, muffled flashes
    const wa = ramp(t, tReb - 0.6, tReb + 1.0) * (1 - ramp(t, K.s4 - 0.5, K.s4 + 1.5));
    for (let i = 0; i < 220; i++) { const q = wSeed[i], life = (t * 0.12 + q[0]) % 1; war.pos[i * 3] = 2 + q[1] * 16 + Math.sin(t * 0.3 + q[3]) * life * 2; war.pos[i * 3 + 1] = 4 + life * 16; war.pos[i * 3 + 2] = -36 - q[2] * 10; }
    war.m.opacity = 0.32 * wa; war.commit();
    warL.intensity = wa * 70 * Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 2.9));

    // leaflets: a flurry, one held up to the lens and torn in two
    const lf0 = tSel - 1.2;
    for (let i = 0; i < NL; i++) {
      const q = lSeed[i], t0 = lf0 + q[0] * 3.2, u = Math.max(0, t - t0);
      const y = 7 - u * (0.9 + q[1] * 0.5), on = t > t0 && y > 0.02 && t < tSur + 2;
      tmp.set(2.2 + q[2] * 7.2 + Math.sin(u * 1.7 + q[3] * 6) * 0.5, Math.max(0.02, y), -2.5 + q[3] * 4.5);
      leaves.setMatrixAt(i, new THREE.Matrix4().compose(tmp, new THREE.Quaternion().setFromEuler(new THREE.Euler(y > 0.03 ? u * 2.2 + q[0] * 6 : -Math.PI / 2, u * 1.3 + q[1] * 6, Math.sin(u * 3 + q[2] * 6) * 0.6)), new THREE.Vector3().setScalar(on || (t > t0 && t < tSur + 2) ? 1 : 0.0001)));
    }
    leaves.instanceMatrix.needsUpdate = true;
    const hd = ramp(t, tSel - 0.6, tSel + 0.7), tear = clamp01((t - tAng) / 1.6);
    hero.visible = t > tSel - 0.7 && t < tAng + 1.8 && si === 2;
    const hy = 6 - 4.5 * eout(hd) + Math.sin(t * 1.4) * 0.05 * (1 - tear);
    hero.position.set(5.7 + Math.sin(t * 0.9) * 0.06, hy - tear * tear * 2.6, 3.4);
    hero.rotation.set(0, 0, Math.sin(t * 1.1) * 0.05 * (1 - tear));
    halves[0].position.set(-tear * 0.5, -tear * 0.2, 0); halves[0].rotation.set(tear * 0.6, 0, tear * 0.9);
    halves[1].position.set(tear * 0.55, -tear * 0.35, 0); halves[1].rotation.set(-tear * 0.4, 0, -tear * 1.1);
    // the plane crosses low and drops family letters
    const pf = (t - (tSur - 0.4)) / 4.2;
    air.visible = pf > 0 && pf < 1 && si === 2;
    if (air.visible) { air.position.copy(sp(-1.6 + 3.2 * pf, 0.02 + Math.sin(pf * 3) * 0.02, 34)); air.quaternion.copy(cam.quaternion); air.rotateZ(-0.03); }
    for (let i = 0; i < NE; i++) {
      const q = eSeed[i], t0 = tSur + 0.3 + i * 0.16, u = Math.max(0, t - t0), y = 6.5 - u * (0.8 + q[1] * 0.4);
      tmp.set(1.4 + i * 0.66 + Math.sin(u * 1.5 + q[0] * 6) * 0.4, Math.max(0.02, y), -3.5 + q[2] * 3);
      envs.setMatrixAt(i, new THREE.Matrix4().compose(tmp, new THREE.Quaternion().setFromEuler(new THREE.Euler(y > 0.03 ? u * 1.6 + q[3] * 6 : -Math.PI / 2, u + q[0] * 6, Math.sin(u * 2.6) * 0.5)), new THREE.Vector3().setScalar(t > t0 && t < K.s5 + 6 ? 1 : 0.0001)));
    }
    envs.instanceMatrix.needsUpdate = true;

    // --- station V: smoke over the burnt rice ---
    for (let i = 0; i < 260; i++) { const q = sSeed[i], rp = rice[i % rice.length], life = (t * 0.22 + q[0]) % 1; smoke.pos[i * 3] = rp[0] + Math.sin(life * 3 + q[3]) * 0.35 * life + life * 0.5; smoke.pos[i * 3 + 1] = rp[1] + life * 3.4; smoke.pos[i * 3 + 2] = rp[2] + (q[2] - 0.5) * 0.3 * life; }
    smoke.m.opacity = 0.28; smoke.commit();

    // --- station T ---
    const onoIn = ramp(t, tMen - 1.8, tMen - 0.15);
    onoT.position.set(XT + 4.4 - 3.4 * onoIn, FHt / 2 + Math.abs(Math.sin(t * 8)) * 0.03 * (onoIn > 0 && onoIn < 1 ? 1 : 0), 0.1);
    walkTex(onoT, figs.ono, figs.onoW, onoIn > 0.02 && onoIn < 0.98, t); face(onoT, t > tMaka + 0.4 ? -1 : 1);
    const tnIn = ramp(t, tMay - 0.9, tMay + 0.8);
    tan.position.set(XT + 4.9 - 2.1 * tnIn, FHt / 2, 0.45); face(tan, -1);
    suz.position.set(XT - 1.15, FHt / 2, 0.35); face(suz);
    placeTag(tagSz, XT - 1.15, 0.35, tagIn(tSuz), false);
    placeTag(tagOT, onoT.position.x, 0.1, tagIn(tMen + 0.2), false);
    placeTag(tagTn, tan.position.x, 0.45, tagIn(tMay + 0.6), false);
    const fl = t - (tMen + 0.25), flash = fl > 0 ? Math.exp(-fl * 9) : 0, fl2 = t - (tMen + 0.95), flash2 = fl2 > 0 ? Math.exp(-fl2 * 9) * 0.7 : 0;
    flashL.intensity = 40 * (flash + flash2); star.material.opacity = Math.min(1, (flash + flash2) * 1.4); star.visible = flash + flash2 > 0.01; star.quaternion.copy(cam.quaternion); star.scale.setScalar(0.6 + (flash + flash2) * 0.8);
    const k = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 29.3) * 0.05; fireL.intensity = 2.6 * k; flame.scale.set(1, k, 1); flame.quaternion.copy(cam.quaternion);
    // the order glows while it is read
    const gl = ramp(t, tBaca - 0.2, tBaca + 0.5);
    pglow.position.set(tan.position.x + 0.0, 1.38, 0.55); pglow.quaternion.copy(cam.quaternion); pglow.material.opacity = 0.55 * gl * (0.85 + 0.15 * Math.sin(t * 5));
    // a plane crosses for "terbang ke Lubang"
    const pf2 = (t - (tTer - 1.0)) / 3.6;
    if (si === 4 && pf2 > 0 && pf2 < 1) { air.visible = true; air.position.copy(sp(1.6 - 3.2 * pf2, 0.05, 36)); air.quaternion.copy(cam.quaternion); air.rotateY(Math.PI); }

    // --- station S: sword laid down, salute, the radio ---
    const lay = ramp(t, tSer - 0.3, tSer + 0.9);
    onoS.material = t > tSer + 1.0 ? figs.onoSal : figs.onoSw; face(onoS);
    sword.position.set(XS + 0.02 + 0.1 * lay, 1.37 - 0.565 * eout(lay), -0.62 + 0.62 * lay);
    sword.rotation.set(0, 0.1 * lay, 0);
    const rIn = eout(ramp(t, tMeski - 0.2, tMeski + 0.5));
    radio.scale.setScalar(Math.max(0.001, rIn)); radio.visible = rIn > 0.002;
    waves.forEach((w, i) => { const u = ((t - tRadio) * 0.7 + i / 3) % 1, on = t > tRadio - 0.1; w.visible = on; w.scale.setScalar(0.08 + u * 0.32); w.material.opacity = on ? 0.6 * (1 - u) : 0; w.quaternion.copy(cam.quaternion); });

    // --- map ---
    drawOv(ramp(t, tIa + 0.1, tFil + 0.5), ramp(t, tLub - 0.2, tLub + 0.5), ramp(t, tDan8, tIndo), ramp(t, tIndo - 0.6, tIndo + 0.2), 0); // Nakamura is named on the panel card; the map keeps only the Morotai mark

    // pollen drifting through the lens
    for (let i = 0; i < 160; i++) { const q = pSeed[i]; pollen.pos[i * 3] = tgt.x + q[0] * 10 + Math.sin(t * q[4] + q[3]) * 0.6; pollen.pos[i * 3 + 1] = ((q[1] * 5 + t * q[4] * 0.15) % 5); pollen.pos[i * 3 + 2] = tgt.z + 2 + q[2] * 12; }
    pollen.m.opacity = si === 1 || si === 6 ? 0 : 0.5; pollen.commit();
    bp.strength = 0.08 + 0.5 * (flash + flash2);
    comp.render();
  };
}
