// EP24 DRAFTFORGE: Nepal, the only national flag that is not a rectangle.
// One endless blueprint sheet (y = 0, units ~ cm). A row of flag poles stands on it at z = 0, the Himalaya is a
// wire elevation far behind (z < -150), and the construction drawing lies flat in front (z ~ 85..155).
//   s1 row of generic rectangular "ghost" flags, the full-colour Nepal pennon in the middle
//   s2 the other flags sink into the sheet; two-pennon outlines, concave pentagon, height/width dimensions
//   s3 callout tags: red, blue border, moon (8 rays counted), sun (12 rays counted)
//   s4 an old single war pennon rises beside it; the sun and moon get their pre-1962 faces
//   s5 rubber stamp "16 DES 1962", name cards (Raja Mahendra, Shankar Nath Rimal), the faces are erased
//   s6 crane to top view: the flag is constructed line by line from the 2015 Constitution, Schedule 1
//   s7 dimension lines, punch-zoom on height : width = 1,219 (irrational)
//   s8 a 2008 redesign proposal gets a DITOLAK stamp, then a wide pull-back over the whole sheet.
// Flag geometry follows Schedule 1 exactly (AB = 1): border width TN, outer ratio 1.21901..., see nepalGeo().
// Everything is a pure function of t.

const FONTS = ['700 80px "Rajdhani"', '600 80px "Rajdhani"', '500 80px "JetBrains Mono"', '700 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "NEPAL 1962 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";

const HEAD = '"Rajdhani", "Arial Narrow", sans-serif', MONO = '"JetBrains Mono", "Consolas", monospace';
const RED = "#DC143C", BLU = "#003893", WHT = "#E8F1FF", CYAN = "#62C6F2", GOLD = "#F2B33D", NAVY = "#0E3A6E", INK = "#061A33";

// ---------- Constitution of Nepal 2015, Schedule 1 (A at origin, AB = 1, y up) ----------
function nepalGeo() {
  const s2 = Math.SQRT1_2;
  const A = [0, 0], B = [1, 0], C = [0, 4 / 3], D = [0, 1], E = [1 - s2, s2], F = [0, s2], G = [1, s2];
  const H = [0.25, 0];
  const I = [0.25, C[1] + (G[1] - C[1]) * 0.25];
  const J = [0, (C[1] + F[1]) / 2];
  const K = [(J[1] - C[1]) / (G[1] - C[1]), J[1]];
  const L = [0.25, J[1]];
  const M = [0.25, J[1] + (G[1] - J[1]) * 0.25];
  const N = [0.25, M[1] - Math.abs(M[0] + M[1] - 1) / Math.SQRT2];
  const O = [0, M[1]];
  const rL = L[1] - N[1], rN = M[1] - N[1];
  const dx = Math.sqrt(rL * rL - (M[1] - L[1]) ** 2);
  const P = [0.25 - dx, M[1]], Q = [0.25 + dx, M[1]], rM = dx;
  const a = (2 * rL * rL - rN * rN) / (2 * rL), hh = Math.sqrt(rL * rL - a * a);
  const T = [0.25, L[1] - a], R = [0.25 - hh, L[1] - a], S = [0.25 + hh, L[1] - a];
  const rTS = hh, rTM = M[1] - T[1];
  const U = [0, F[1] / 2], V = [1 - U[1], U[1]], W = [0.25, U[1]];
  const bw = T[1] - N[1];
  const inner = [A, B, E, G, C];
  const outer = offset(inner, bw);
  const xs = outer.map((p) => p[0]), ys = outer.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const arc = (c, r, a0, a1, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]; });
  const aQ = Math.atan2(M[1] - L[1], dx), aP = Math.atan2(M[1] - L[1], -dx);
  const crescent = [...arc(M, rM, Math.PI, 2 * Math.PI, 64), ...arc(L, rL, aQ, aP, 64)];
  const moonRays = Array.from({ length: 8 }, (_, k) => { const b0 = k * Math.PI / 8, b1 = (k + 1) * Math.PI / 8, m = (b0 + b1) / 2; return [[T[0] + rTM * Math.cos(b0), T[1] + rTM * Math.sin(b0)], [T[0] + rTS * Math.cos(m), T[1] + rTS * Math.sin(m)], [T[0] + rTM * Math.cos(b1), T[1] + rTM * Math.sin(b1)]]; });
  const sunRays = Array.from({ length: 12 }, (_, k) => { const b0 = (15 + 30 * k) * Math.PI / 180, b1 = b0 + Math.PI / 6, m = (b0 + b1) / 2; return [[W[0] + rN * Math.cos(b0), W[1] + rN * Math.sin(b0)], [W[0] + rL * Math.cos(m), W[1] + rL * Math.sin(m)], [W[0] + rN * Math.cos(b1), W[1] + rN * Math.sin(b1)]]; });
  return { A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, rL, rN, rM, rTS, rTM, bw, inner, outer, x0, x1, y0, y1, Wd: x1 - x0, Ht: y1 - y0, crescent, moonRays, sunRays, arc };
}
// outward offset of a counter-clockwise polygon, mitred corners ("external angles equal to the internal angles")
function offset(poly, d) {
  const n = poly.length, Ls = [];
  for (let i = 0; i < n; i++) {
    const p = poly[i], q = poly[(i + 1) % n], ex = q[0] - p[0], ey = q[1] - p[1], l = Math.hypot(ex, ey);
    Ls.push([p[0] + (ey / l) * d, p[1] - (ex / l) * d, ex, ey]);
  }
  return poly.map((_, i) => {
    const a = Ls[(i - 1 + n) % n], b = Ls[i];
    const det = a[2] * -b[3] - a[3] * -b[2];
    const t = ((b[0] - a[0]) * -b[3] - (b[1] - a[1]) * -b[2]) / det;
    return [a[0] + a[2] * t, a[1] + a[3] * t];
  });
}
const NG = nepalGeo();

function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
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

// ---------- 2D painters ----------
function fillPoly(g, pts, c) { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
function face(g, cx, cy, r, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.strokeStyle = "#7A0A1E"; g.fillStyle = "#7A0A1E"; g.lineCap = "round"; g.lineWidth = r * 0.075;
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(cx + s * r * 0.36, cy - r * 0.12, r * 0.1, r * 0.13, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(cx + s * r * 0.36, cy - r * 0.16, r * 0.24, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  }
  g.beginPath(); g.moveTo(cx, cy - r * 0.02); g.lineTo(cx - r * 0.08, cy + r * 0.24); g.lineTo(cx + r * 0.06, cy + r * 0.26); g.stroke();
  g.beginPath(); g.arc(cx, cy + r * 0.22, r * 0.36, Math.PI * 0.22, Math.PI * 0.78); g.stroke();
  g.restore();
}
// Nepal flag face; canvas covers the outer bounding box
function paintNepal(g, w, h, faceA = 0) {
  const sx = w / NG.Wd, sy = h / NG.Ht;
  const P = ([x, y]) => [(x - NG.x0) * sx, (NG.y1 - y) * sy];
  g.clearRect(0, 0, w, h);
  fillPoly(g, NG.outer.map(P), BLU);
  fillPoly(g, NG.inner.map(P), RED);
  fillPoly(g, NG.crescent.map(P), "#fff");
  const circ = (c, r) => { const [x, y] = P(c); g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r * sx, 0, Math.PI * 2); g.fill(); };
  circ(NG.T, NG.rTM); NG.moonRays.forEach((t) => fillPoly(g, t.map(P), "#fff"));
  circ(NG.W, NG.rN); NG.sunRays.forEach((t) => fillPoly(g, t.map(P), "#fff"));
  // subtle cloth weave so the cloth does not read as flat plastic
  const q = mulberry(24);
  g.save(); g.globalCompositeOperation = "source-atop";
  for (let i = 0; i < w * h / 900; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,255,255" : "0,0,0"},${0.025 + q() * 0.03})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
  g.restore();
  const [tx, ty] = P(NG.T), [wx, wy] = P(NG.W);
  face(g, tx, ty, NG.rTM * sx, faceA);
  face(g, wx, wy, NG.rN * sx, faceA);
}
// old single war pennon (illustration): right triangle, crimson with a blue edge
const PEN_IN = [[0, 0], [1.1, 0], [0, 1]], PEN_OUT = offset(PEN_IN, 0.05);
const PB = { x0: Math.min(...PEN_OUT.map((p) => p[0])), x1: Math.max(...PEN_OUT.map((p) => p[0])), y0: Math.min(...PEN_OUT.map((p) => p[1])), y1: Math.max(...PEN_OUT.map((p) => p[1])) };
function paintPennon(g, w, h) {
  const sx = w / (PB.x1 - PB.x0), sy = h / (PB.y1 - PB.y0);
  const P = ([x, y]) => [(x - PB.x0) * sx, (PB.y1 - y) * sy];
  g.clearRect(0, 0, w, h);
  fillPoly(g, PEN_OUT.map(P), BLU); fillPoly(g, PEN_IN.map(P), "#B5122F");
  const q = mulberry(9); g.save(); g.globalCompositeOperation = "source-atop";
  for (let i = 0; i < w * h / 700; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,240,220" : "0,0,0"},${0.03 + q() * 0.04})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1); }
  g.restore();
}
// generic rectangular "ghost" flags: colour blocks in blueprint tones, deliberately not any real country
const GHOST = ["#9DB7D3", "#5F86B3", "#C9D7E6", "#3F6796", "#7FA0C4", "#B3C6DA", "#2E5582"];
function paintGhost(i) {
  return (g, w, h) => {
    const c = (k) => GHOST[(i * 3 + k) % GHOST.length];
    g.fillStyle = c(0); g.fillRect(0, 0, w, h);
    if (i % 5 === 0) { g.fillStyle = c(1); g.fillRect(0, h / 3, w, h / 3); g.fillStyle = c(2); g.fillRect(0, (2 * h) / 3, w, h / 3); }
    else if (i % 5 === 1) { g.fillStyle = c(3); g.fillRect(w * 0.42, 0, w * 0.58, h); }
    else if (i % 5 === 2) { g.fillStyle = c(4); g.beginPath(); g.moveTo(0, h); g.lineTo(w, 0); g.lineTo(w, h); g.fill(); }
    else if (i % 5 === 3) { g.fillStyle = c(2); g.fillRect(0, 0, w * 0.4, h * 0.5); g.fillStyle = c(5); g.fillRect(0, h * 0.5, w, h * 0.5); }
    else { g.fillStyle = c(1); g.fillRect(0, 0, w, h * 0.5); g.fillStyle = c(6); g.fillRect(w * 0.12, h * 0.25, w * 0.18, h * 0.5); }
    g.strokeStyle = "rgba(232,241,255,.9)"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  };
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x04142b, exp: 1.0, bloom: [0.1, 0.35, 0.92], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0; // DRAFTFORGE: envIntensity 0, neutral line style
  cam.near = 1; cam.far = 1800; cam.updateProjectionMatrix();
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#020A18"); gr.addColorStop(0.5, "#06183A"); gr.addColorStop(1, "#0A2550"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.FogExp2(0x061a3a, 0.0021);

  scene.add(new THREE.HemisphereLight(0xd6e4ff, 0x0a1a33, 0.9));
  const key = new THREE.DirectionalLight(0xfff6ea, 2.0);
  key.position.set(-90, 170, 150); key.target.position.set(0, 0, 40);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -200, right: 200, top: 200, bottom: -200, near: 20, far: 600 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.05; key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x8fb8ff, 0.7); rim.position.set(120, 80, -160); scene.add(rim);

  const labels = [];
  const tex = (w, h, paint) => { const t = canvasTex(w, h, paint); labels.push([t, paint]); return t; };
  const std = (c, ro = 0.6, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x, y, z, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const lineMat = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, fog: true });

  // ---------- blueprint sheet ----------
  const gridT = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#0D3466"; g.fillRect(0, 0, w, w);
    const q = mulberry(4);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "190,215,255" : "0,10,30"},${0.02 + q() * 0.04})`; g.fillRect(q() * w, q() * w, 1 + q() * 2, 1); }
    for (let i = 0; i <= 10; i++) { const p = i * w / 10; g.strokeStyle = i % 10 === 0 ? "rgba(140,185,240,.42)" : i === 5 ? "rgba(120,170,230,.26)" : "rgba(110,160,225,.14)"; g.lineWidth = i % 10 === 0 ? 3 : i === 5 ? 2 : 1.2; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
  }, [70, 70]);
  const sheet = add(new THREE.PlaneGeometry(1400, 1400), std(0xffffff, 0.92, 0, { map: gridT }), 0, 0, 0);
  sheet.rotation.x = -Math.PI / 2; sheet.castShadow = false;

  // ribbon: polyline as a flat strip in the plane with normal nrm; draw-on via drawRange
  function ribbon(pts, w, mat, nrm = new THREE.Vector3(0, 1, 0), p = scene, dash = 0) {
    const pos = [], idx = []; let v = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      if (dash && i % 2 === 1) { idx.push(v, v, v, v, v, v); continue; }
      const a = new THREE.Vector3(...pts[i]), b = new THREE.Vector3(...pts[i + 1]);
      const d = b.clone().sub(a).normalize(), s = d.clone().cross(nrm).normalize().multiplyScalar(w / 2);
      const e = d.clone().multiplyScalar(w * 0.35); a.sub(e); b.add(e);
      pos.push(a.x - s.x, a.y - s.y, a.z - s.z, a.x + s.x, a.y + s.y, a.z + s.z, b.x - s.x, b.y - s.y, b.z - s.z, b.x + s.x, b.y + s.y, b.z + s.z);
      idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); v += 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 3; m.frustumCulled = false; p.add(m);
    m.nseg = pts.length - 1;
    m.draw = (u) => { u = clamp01(u); m.visible = u > 0.001; geo.setDrawRange(0, Math.ceil(u * m.nseg) * 6); };
    m.draw(0);
    return m;
  }
  const sub = (a, b, n = 24) => Array.from({ length: n + 1 }, (_, i) => a.map((v, j) => v + (b[j] - v) * i / n));
  const polyl = (pts, n = 12) => pts.slice(0, -1).flatMap((p, i) => sub(p, pts[i + 1], n).slice(i ? 1 : 0));

  // text plate: lying on the sheet (flat) or standing; world width w
  function plate(w, h, paint, x, y, z, flat = true, p = scene, cw = 1024) {
    const ch = Math.round(cw * h / w);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(cw, ch, paint), transparent: true, depthWrite: false, toneMapped: false }));
    if (flat) m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z); m.renderOrder = 4; p.add(m); return m;
  }
  const txt = (s, font, color, align = "left") => (g, w, h) => { g.clearRect(0, 0, w, h); g.font = font(h); g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, align === "center" ? w / 2 : 4, h * 0.54); };

  // sheet frame: border, zone marks
  const frameMat = lineMat(WHT, 0.75);
  const FX0 = -170, FX1 = 170, FZ0 = -40, FZ1 = 215;
  ribbon(polyl([[FX0, 0.06, FZ0], [FX1, 0.06, FZ0], [FX1, 0.06, FZ1], [FX0, 0.06, FZ1], [FX0, 0.06, FZ0]], 2), 0.7, frameMat).draw(1);
  ribbon(polyl([[FX0 + 5, 0.06, FZ0 + 5], [FX1 - 5, 0.06, FZ0 + 5], [FX1 - 5, 0.06, FZ1 - 5], [FX0 + 5, 0.06, FZ1 - 5], [FX0 + 5, 0.06, FZ0 + 5]], 2), 0.25, lineMat(WHT, 0.45)).draw(1);
  for (let i = 0; i < 8; i++) {
    const x = FX0 + 5 + (i + 0.5) * (FX1 - FX0 - 10) / 8;
    plate(4, 4, txt(String(i + 1), (h) => `700 ${h * 0.8}px ${MONO}`, "rgba(232,241,255,.7)", "center"), x, 0.07, FZ1 - 2.5, true, scene, 128);
  }
  "ABCDEF".split("").forEach((c, i) => plate(4, 4, txt(c, (h) => `700 ${h * 0.8}px ${MONO}`, "rgba(232,241,255,.7)", "center"), FX0 + 2.5, 0.07, FZ0 + 5 + (i + 0.5) * (FZ1 - FZ0 - 10) / 6, true, scene, 128));

  // ---------- Himalaya: wire elevation far behind ----------
  {
    const nx = 90, nz = 16, X0 = -420, X1 = 420, Z0 = -330, Z1 = -150;
    const hgt = (x, z) => { const pr = Math.exp(-(((z + 250) / 62) ** 2)); const ridge = 46 + 30 * Math.sin(x * 0.019 + 1.2) + 20 * Math.sin(x * 0.051 + 2.1) + 11 * Math.abs(Math.sin(x * 0.12 + 0.4)); return Math.max(0, ridge * pr * (0.85 + 0.15 * Math.sin(z * 0.1 + x * 0.03))); };
    const pos = [], idx = [], seg = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = X0 + (X1 - X0) * i / nx, z = Z0 + (Z1 - Z0) * j / nz; pos.push(x, hgt(x, z), z); }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i; idx.push(a, a + nx + 1, a + 1, a + 1, a + nx + 1, a + nx + 2); }
    for (let j = 0; j <= nz; j++) for (let i = 0; i < nx; i++) { const a = (j * (nx + 1) + i) * 3, b = a + 3; seg.push(...pos.slice(a, a + 3), ...pos.slice(b, b + 3)); }
    for (let i = 0; i <= nx; i += 2) for (let j = 0; j < nz; j++) { const a = (j * (nx + 1) + i) * 3, b = ((j + 1) * (nx + 1) + i) * 3; seg.push(...pos.slice(a, a + 3), ...pos.slice(b, b + 3)); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x082149, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })));
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x5fb4ee, transparent: true, opacity: 0.5, toneMapped: false })));
  }
  const himT = plate(70, 9, txt("PEGUNUNGAN HIMALAYA", (h) => `700 ${h * 0.8}px ${HEAD}`, "rgba(140,205,250,.9)", "center"), -60, 92, -205, false, scene, 1024);

  // ---------- flags ----------
  // cloth on a grid plane with an alpha texture, so the exact outline survives waving
  function cloth(paint, W, H, cw, sx = 40, sy = 40) {
    const t = tex(cw, Math.round(cw * H / W), paint);
    const geo = new THREE.PlaneGeometry(W, H, sx, sy); geo.translate(W / 2, H / 2, 0);
    const base = geo.attributes.position.array.slice();
    const m = new THREE.Mesh(geo, std(0xffffff, 0.82, 0, { map: t, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.32 }));
    m.castShadow = m.receiveShadow = true;
    m.wave = (time, amp, ph = 0) => {
      const a = geo.attributes.position.array;
      for (let i = 0; i < a.length; i += 3) { const x = base[i], y = base[i + 1], f = x / W; a[i + 2] = amp * f * (Math.sin(x * 0.16 - time * 3.1 + y * 0.05 + ph) + 0.35 * Math.sin(x * 0.33 - time * 4.6 + ph)); }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    };
    m.tex = t;
    return m;
  }
  const poleMat = std(0xd5dde6, 0.35, 0.15), knobMat = std(GOLD, 0.35, 0.3);
  const POLE_H = 82;
  function pole(x, z, p = scene, h = POLE_H) {
    const G = new THREE.Group(); G.position.set(x, 0, z); p.add(G);
    add(new THREE.CylinderGeometry(0.55, 0.7, h, 14), poleMat, 0, h / 2, 0, G);
    add(new THREE.SphereGeometry(1.25, 16, 12), knobMat, 0, h + 0.8, 0, G);
    add(new THREE.CylinderGeometry(2.6, 3.0, 0.8, 24), std(0x9fb2c8, 0.5), 0, 0.4, 0, G);
    return G;
  }
  // hero: Nepal, inner AB = 30
  const SH = 30, FW = NG.Wd * SH, FH = NG.Ht * SH, FY0 = POLE_H - 2 - FH;
  const heroPole = pole(0, 0);
  const flagG = new THREE.Group(); flagG.position.set(0.7, FY0, 0); scene.add(flagG);
  const hero = cloth((g, w, h) => paintNepal(g, w, h, 0), FW, FH, 1400, 44, 54); flagG.add(hero);
  const hL = (fx, fy, z = 1.3) => [(fx - NG.x0) * SH, (fy - NG.y0) * SH, z]; // flag coords -> flagG local
  const hW = (fx, fy, z = 1.3) => { const [x, y] = hL(fx, fy); return [x + 0.7, y + FY0, z]; };
  // row of ghost rectangles
  const RX = [-138, -92, -46, 48, 94, 140];
  const ghosts = RX.map((x, i) => {
    const G = new THREE.Group(); scene.add(G);
    pole(x, 0, G);
    const c = cloth(paintGhost(i), 36, 24, 720, 24, 14); c.position.set(x + 0.7, POLE_H - 26, 0); G.add(c);
    c.material.transparent = true; c.material.opacity = 0.5; c.material.emissiveIntensity = 0.04; c.material.depthWrite = false; c.castShadow = false;
    return { G, c, x };
  });
  // old single war pennon (s4), rises in the freed slot at x = -46
  const penG = new THREE.Group(); scene.add(penG);
  pole(-46, 0, penG);
  const SP = 28, penW = (PB.x1 - PB.x0) * SP, penH = (PB.y1 - PB.y0) * SP;
  const pen = cloth(paintPennon, penW, penH, 900, 30, 30); pen.position.set(-46 + 0.7, POLE_H - 2 - penH, 0); penG.add(pen);

  // ---------- flag overlays (flagG space) ----------
  const gold = lineMat(GOLD, 1), white = lineMat(WHT, 1), cyan = lineMat(CYAN, 0.9);
  const Z = new THREE.Vector3(0, 0, 1);
  const triA = ribbon(polyl([NG.A, NG.B, NG.D, NG.A].map(([x, y]) => hL(x, y, 1.6)), 16), 0.45, gold, Z, flagG);
  const triB = ribbon(polyl([NG.F, NG.G, NG.C, NG.F].map(([x, y]) => hL(x, y, 1.7)), 16), 0.45, lineMat(CYAN, 1), Z, flagG);
  const pent = ribbon(polyl([...NG.outer, NG.outer[0]].map(([x, y]) => hL(x, y, 1.8)), 16), 0.55, white, Z, flagG);
  const pentDots = NG.outer.map(([x, y], i) => { const m = add(new THREE.SphereGeometry(i === 2 ? 1.1 : 0.8, 14, 10), new THREE.MeshBasicMaterial({ color: i === 2 ? RED : WHT, toneMapped: false }), ...hL(x, y, 1.9), flagG); m.castShadow = false; return m; });
  const cekung = plate(20, 3.4, txt("SUDUT CEKUNG", (h) => `700 ${h * 0.78}px ${MONO}`, GOLD), ...hL(NG.outer[2][0] + 0.1, NG.outer[2][1] - 0.08, 2), false, flagG, 640);
  cekung.geometry.translate(10, 0, 0);
  // dimensions: width below, height at the fly side
  const dimMat = lineMat(GOLD, 1);
  const dyB = NG.y0 - 0.12, dxR = NG.x1 + 0.1;
  const dimW = ribbon(polyl([[NG.x0, dyB], [NG.x1, dyB]].map(([x, y]) => hL(x, y, 0)), 30), 0.4, dimMat, Z, flagG);
  const dimH = ribbon(polyl([[dxR, NG.y0], [dxR, NG.y1]].map(([x, y]) => hL(x, y, 0)), 30), 0.4, dimMat, Z, flagG);
  const ticks = [[NG.x0, dyB], [NG.x1, dyB]].map(([x, y]) => ribbon([hL(x, y - 0.05, 0), hL(x, y + 0.05, 0)], 0.4, dimMat, Z, flagG))
    .concat([[dxR, NG.y0], [dxR, NG.y1]].map(([x, y]) => ribbon([hL(x - 0.05, y, 0), hL(x + 0.05, y, 0)], 0.4, dimMat, Z, flagG)));
  const lbW = plate(13, 3.6, txt("LEBAR", (h) => `700 ${h * 0.82}px ${HEAD}`, GOLD, "center"), ...hL((NG.x0 + NG.x1) / 2, dyB - 0.08, 0), false, flagG, 512);
  const lbH = plate(14, 3.6, txt("TINGGI", (h) => `700 ${h * 0.82}px ${HEAD}`, GOLD, "center"), ...hL(dxR + 0.04, (NG.y0 + NG.y1) / 2, 0), false, flagG, 512);
  lbH.geometry.translate(7, 0, 0); lbH.rotation.z = 0;

  // billboard tags (navy card, cyan edge)
  function tag(title, subt, w, col = CYAN) {
    const h = subt ? w * 0.34 : w * 0.2;
    const m = plate(w, h, (g, cw, ch) => {
      g.clearRect(0, 0, cw, ch);
      g.fillStyle = "rgba(4,18,40,.92)"; g.fillRect(0, 0, cw, ch);
      g.strokeStyle = col; g.lineWidth = 8; g.strokeRect(4, 4, cw - 8, ch - 8);
      g.fillStyle = col; g.fillRect(0, 0, 18, ch);
      const fit = (s, wt, sz, fam) => { g.font = `${wt} ${sz}px ${fam}`; const k = Math.min(1, (cw - 70) / g.measureText(s).width); g.font = `${wt} ${sz * k}px ${fam}`; };
      g.textBaseline = "middle"; g.fillStyle = "#fff"; fit(title, 700, subt ? ch * 0.42 : ch * 0.62, HEAD);
      g.fillText(title, 40, subt ? ch * 0.33 : ch * 0.55);
      if (subt) { g.fillStyle = "#BFD8F5"; fit(subt, 500, ch * 0.3, MONO); g.fillText(subt, 42, ch * 0.73); }
    }, 0, 0, 0, false, scene, 900);
    m.material.depthTest = true; m.renderOrder = 6;
    return m;
  }
  const callouts = [
    { m: tag("MERAH", "keberanian · rododendron", 18, RED), at: [0.86, 0.47], from: [0.32, 0.22], k: "s3:Merah" },
    { m: tag("BIRU · TEPI", "perdamaian", 17, "#4E8BFF"), at: [1.25, -0.2], from: [0.95, -0.02], k: "s3:Tepi" },
    { m: tag("BULAN SABIT", "8 sinar terlihat", 17), at: [0.88, 1.16], from: [0.42, 1.0], k: "s3:bulan" },
    { m: tag("MATAHARI", "12 sinar", 15, GOLD), at: [1.22, 0.3], from: [0.46, 0.36], k: "s3:matahari" },
  ].map((c) => {
    const p = hW(...c.at, 3); c.m.position.set(...p); c.m.geometry.translate(c.m.geometry.parameters.width / 2 - 1, 0, 0);
    c.lead = ribbon(sub(hW(...c.from, 1.9), [p[0] - 0.6, p[1], 3], 20), 0.32, lineMat(GOLD, 1), Z);
    c.dot = add(new THREE.SphereGeometry(0.7, 12, 10), new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false }), ...hW(...c.from, 1.9));
    return c;
  });
  // ray counters
  const dotMat = new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false });
  const moonDots = NG.moonRays.map((t) => add(new THREE.SphereGeometry(0.62, 12, 10), dotMat, ...hW(t[1][0], t[1][1], 1.8)));
  const sunDots = NG.sunRays.map((t) => add(new THREE.SphereGeometry(0.62, 12, 10), dotMat, ...hW(t[1][0], t[1][1], 1.8)));
  const faceTag = tag("SEBELUM 1962", "matahari & bulan berwajah", 17, GOLD);
  faceTag.position.set(...hW(0.62, 0.5, 3)); faceTag.geometry.translate(8.5, 0, 0);
  const penTag = tag("PANJI PERANG GORKHA", "Dinasti Shah · ilustrasi", 24, "#B5122F");
  penTag.position.set(-43, 40, 3); penTag.geometry.translate(12, 0, 0);

  // ---------- s5: stamp, name cards ----------
  // drafting desk beside the pole (rises in s5): the 1962 stamp lands on its tilted board, the 2008 card is laid there in s8
  const desk = new THREE.Group(); desk.position.set(-25, 0, 6); scene.add(desk);
  const deskMat = std(0x9fb2c8, 0.45, 0.25);
  for (const [x, z] of [[-15, -8], [15, -8], [-15, 8], [15, 8]]) add(new THREE.CylinderGeometry(0.7, 0.7, 25, 12), deskMat, x, 12.5, z, desk);
  add(new THREE.BoxGeometry(31, 1.2, 1.2), deskMat, 0, 7, 8, desk); add(new THREE.BoxGeometry(31, 1.2, 1.2), deskMat, 0, 7, -8, desk);
  const top = new THREE.Group(); top.position.set(0, 26, 0); top.rotation.x = 0.42; desk.add(top);
  const boardT = canvasTex(1024, 700, (g, w, h) => { g.fillStyle = "#EEF2F7"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(14,58,110,.18)"; g.lineWidth = 2; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = "#0E3A6E"; g.fillRect(0, h - 26, w, 26); });
  const boardM = std(0xffffff, 0.85, 0, { map: boardT });
  add(new THREE.BoxGeometry(37, 1, 25), [deskMat, deskMat, boardM, deskMat, deskMat, deskMat], 0, 0, 0, top);
  add(new THREE.BoxGeometry(37, 1.6, 1.4), deskMat, 0, 0.9, 12.6, top);
  const imp = plate(30, 12, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = RED; g.fillStyle = RED; g.lineWidth = 16; g.strokeRect(14, 14, w - 28, h - 28);
    g.lineWidth = 5; g.strokeRect(34, 34, w - 68, h - 68);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${h * 0.5}px ${HEAD}`; g.fillText("16 DES 1962", w / 2, h * 0.54);
    const q = mulberry(62); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + q() * 0.6})`; g.fillRect(q() * w, q() * h, 2 + q() * 5, 1 + q() * 3); } g.globalCompositeOperation = "source-over";
  }, 0, 0.56, -1, true, top, 1024);
  imp.rotation.z = 0.06;
  const stamp = new THREE.Group(); top.add(stamp);
  add(new THREE.BoxGeometry(31, 2.4, 13), std(0x3a2a24, 0.7), 0, 1.2, 0, stamp);
  add(new THREE.BoxGeometry(32, 0.8, 14), std(0x8a1428, 0.6), 0, 0.4, 0, stamp);
  add(new THREE.CylinderGeometry(2.4, 3.2, 9, 20), std(0x6b4a2f, 0.55), 0, 7, 0, stamp);
  add(new THREE.SphereGeometry(4, 20, 14), std(0x6b4a2f, 0.55), 0, 13, 0, stamp);
  function tent(w, h, name, role, x, z, ry = 0) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    const Hn = new THREE.Group(); G.add(Hn);
    const a = 0.22, b = h * Math.sin(a);
    const pap = std(0xeef3fa, 0.85);
    const face = std(0xffffff, 0.8, 0, { map: tex(1024, Math.round(1024 * h / w), (g, cw, ch) => {
      g.fillStyle = "#F4F7FB"; g.fillRect(0, 0, cw, ch);
      g.fillStyle = NAVY; g.fillRect(0, 0, cw, ch * 0.2);
      g.fillStyle = "#fff"; g.font = `700 ${ch * 0.13}px ${MONO}`; g.textBaseline = "middle"; g.fillText("NAMA", 26, ch * 0.105);
      g.fillStyle = INK; g.font = `700 ${ch * 0.3}px ${HEAD}`; g.fillText(name, 26, ch * 0.47);
      g.fillStyle = "#3a5578"; g.font = `500 ${ch * 0.15}px ${MONO}`; g.fillText(role, 28, ch * 0.78);
      g.fillStyle = RED; g.fillRect(0, ch - 14, cw, 14);
    }) });
    const f = add(new THREE.BoxGeometry(w, h, 0.15), [pap, pap, pap, pap, face, pap], 0, (h / 2) * Math.cos(a), b - (h / 2) * Math.sin(a), Hn); f.rotation.x = -a;
    const k = add(new THREE.BoxGeometry(w, h, 0.15), pap, 0, (h / 2) * Math.cos(a), -b + (h / 2) * Math.sin(a), Hn); k.rotation.x = a;
    return { G, H: Hn };
  }
  const mahendra = tent(27, 10, "RAJA MAHENDRA", "meminta standar bendera", -27, 26, 0.1);
  const rimal = tent(31, 10.5, "SHANKAR NATH RIMAL", "insinyur sipil · penyusun standar", 19, 16, -0.06);

  // ---------- s6/s7: construction drawing on the sheet ----------
  const SD = 46, DX0 = -34, DZ0 = 152;
  const dP = (fx, fy, y = 0.1) => [DX0 + fx * SD, y, DZ0 - fy * SD];
  const dPts = (arr, y) => arr.map(([x, y2]) => dP(x, y2, y));
  const fillTex = tex(1400, Math.round(1400 * NG.Ht / NG.Wd), (g, w, h) => paintNepal(g, w, h, 0));
  const drawFill = new THREE.Mesh(new THREE.PlaneGeometry(NG.Wd * SD, NG.Ht * SD), new THREE.MeshStandardMaterial({ map: fillTex, alphaTest: 0.5, transparent: true, roughness: 0.85, depthWrite: false, emissive: 0xffffff, emissiveMap: fillTex, emissiveIntensity: 0.3 }));
  drawFill.rotation.x = -Math.PI / 2; drawFill.position.set(DX0 + (NG.x0 + NG.x1) / 2 * SD, 0.05, DZ0 - (NG.y0 + NG.y1) / 2 * SD); drawFill.receiveShadow = true; drawFill.renderOrder = 2; scene.add(drawFill);
  const auxM = lineMat(CYAN, 0.85), mainM = lineMat(WHT, 1), arcM = lineMat("#9ED8FF", 0.85);
  const s6 = A("s6:Karena"), s6e = A("s6:ukurannya") + 0.6;
  const stepT = (i, n = 11) => s6 + 0.9 + (s6e - s6 - 0.9) * i / n;
  const C = [];
  const L = (pts, i, mat = auxM, w = 0.32, dash = 0, d = 0.55) => C.push({ m: ribbon(polyl(dPts(pts, 0.12 + C.length * 0.002), dash ? 6 : 10), w, mat, undefined, scene, dash), t: stepT(i), d });
  const Ar = (c, r, a0, a1, i, mat = arcM, dash = 1, n = 96) => C.push({ m: ribbon(dPts(NG.arc(c, r, a0, a1, n), 0.12 + C.length * 0.002), 0.26, mat, undefined, scene, dash), t: stepT(i), d: 0.75 });
  L([NG.A, NG.B], 0, mainM, 0.42);
  L([NG.A, NG.C], 1, mainM, 0.42);
  L([NG.B, NG.D], 2, auxM, 0.3);
  Ar(NG.B, 1, Math.PI * 0.7, Math.PI * 0.8, 2, auxM, 0, 16);
  L([NG.F, NG.G], 3, mainM, 0.42);
  L([NG.C, NG.G], 4, mainM, 0.42);
  L([NG.H, NG.I], 5, auxM, 0.3, 1);
  L([NG.J, NG.K], 6, auxM, 0.3, 1); L([NG.J, NG.G], 6, auxM, 0.3, 1);
  L([NG.O, NG.Q], 7, auxM, 0.3, 1);
  Ar(NG.L, NG.rL, 0, Math.PI * 2, 7); Ar(NG.M, NG.rM, Math.PI, Math.PI * 2, 7, arcM, 0, 64);
  Ar(NG.N, NG.rN, 0, Math.PI * 2, 8); L([NG.R, NG.S], 8, auxM, 0.3);
  Ar(NG.T, NG.rTS, 0, Math.PI, 8, arcM, 0, 48); Ar(NG.T, NG.rTM, 0, Math.PI, 8, arcM, 0, 48);
  L([NG.U, NG.V], 9, auxM, 0.3, 1);
  Ar(NG.W, NG.rN, 0, Math.PI * 2, 9, arcM, 0, 72); Ar(NG.W, NG.rL, 0, Math.PI * 2, 9);
  C.push({ m: ribbon(polyl(dPts([...NG.outer, NG.outer[0]], 0.2), 14), 0.5, mainM), t: stepT(10), d: 0.9 });
  const ptLab = [["A", NG.A, -1, -1], ["B", NG.B, 1, -1], ["C", NG.C, -1, 1], ["D", NG.D, -1, 0], ["E", NG.E, -1, 0.4], ["F", NG.F, -1, -0.3], ["G", NG.G, 1, 0], ["H", NG.H, 0.5, -1],
    ["I", NG.I, 0.8, 0.6], ["J", NG.J, -1, 0.3], ["K", NG.K, 1, 0.3], ["L", NG.L, 0.9, 0.7], ["M", NG.M, 0.9, 0.6], ["N", NG.N, 0.8, -0.8], ["O", NG.O, -1, 0], ["P", NG.P, -0.9, 0.5], ["Q", NG.Q, 0.9, 0.5],
    ["T", NG.T, 0.9, 0.4], ["U", NG.U, -1, 0], ["V", NG.V, 1, 0.3], ["W", NG.W, 0.9, 0.7]];
  const stepOf = { A: 0, B: 0, C: 1, D: 1, E: 2, F: 3, G: 3, H: 5, I: 5, J: 6, K: 6, L: 6, M: 6, N: 7, O: 7, P: 7, Q: 7, T: 8, U: 9, V: 9, W: 9 };
  const pts = ptLab.map(([n, p, ox, oy]) => {
    const G = new THREE.Group(); G.position.set(...dP(p[0], p[1], 0.3)); scene.add(G);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.62, 16), new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false })); d.rotation.x = -Math.PI / 2; G.add(d);
    const lb = plate(3.6, 3.6, txt(n, (h) => `700 ${h * 0.86}px ${MONO}`, GOLD, "center"), ox * 2.4, 0.02, -oy * 2.4, true, G, 128);
    return { G, t: stepT(stepOf[n]) };
  });
  // closed constitution book (slides in at "Konstitusi")
  const book = new THREE.Group(); scene.add(book);
  {
    const cover = std(0xffffff, 0.6, 0, { map: tex(700, 960, (g, w, h) => {
      g.fillStyle = "#7B1022"; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 10; g.strokeRect(40, 40, w - 80, h - 80);
      g.fillStyle = GOLD; g.textAlign = "center"; g.font = `700 ${w * 0.13}px ${HEAD}`; g.fillText("KONSTITUSI", w / 2, h * 0.36); g.fillText("NEPAL", w / 2, h * 0.5);
      g.font = `700 ${w * 0.17}px ${HEAD}`; g.fillText("2015", w / 2, h * 0.7);
    }) });
    const pages = std(0xf0ebdc, 0.9), bk = std(0x5e0c19, 0.7);
    add(new THREE.BoxGeometry(22, 3, 30), [pages, bk, cover, bk, pages, pages], 0, 1.5, 0, book);
    const rib = plate(10, 4, (g, w, h) => { g.fillStyle = GOLD; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.font = `700 ${h * 0.5}px ${MONO}`; g.textBaseline = "middle"; g.fillText("LAMPIRAN 1", 18, h * 0.55); }, 13, 3.05, -6, true, book, 512);
    rib.material.depthWrite = true;
  }
  const BOOK = [40, 0, 100];
  // dimensions (s7)
  const dmM = lineMat(GOLD, 1);
  const vdx = NG.x0 - 0.14, hdy = NG.y0 - 0.1;
  const dV = ribbon(polyl(dPts([[vdx, NG.y0], [vdx, NG.y1]], 0.3), 40), 0.5, dmM);
  const dH = ribbon(polyl(dPts([[NG.x0, hdy], [NG.x1, hdy]], 0.3), 40), 0.5, dmM);
  const dTicks = [ribbon(dPts([[vdx - 0.05, NG.y0], [vdx + 0.05, NG.y0]], 0.3), 0.5, dmM), ribbon(dPts([[vdx - 0.05, NG.y1], [vdx + 0.05, NG.y1]], 0.3), 0.5, dmM),
    ribbon(dPts([[NG.x0, hdy - 0.05], [NG.x0, hdy + 0.05]], 0.3), 0.5, dmM), ribbon(dPts([[NG.x1, hdy - 0.05], [NG.x1, hdy + 0.05]], 0.3), 0.5, dmM)];
  const vLab = plate(30, 7.2, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(4,18,40,.94)"; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = GOLD; g.font = `700 ${h * 0.66}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("≈ 1,219…", w / 2, h * 0.56); }, ...dP(vdx, (NG.y0 + NG.y1) / 2, 0.4), true, scene, 900);
  vLab.rotation.z = Math.PI / 2;
  const hLab = plate(13, 6.4, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(4,18,40,.94)"; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = GOLD; g.font = `700 ${h * 0.7}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1", w / 2, h * 0.56); }, ...dP((NG.x0 + NG.x1) / 2, hdy, 0.4), true, scene, 512);

  // ---------- title block with the AUDIRA mark, right of the drawing ----------
  plate(31, 19, (g, w, h) => {
    g.fillStyle = "rgba(4,16,36,.9)"; g.fillRect(0, 0, w, h);
    g.strokeStyle = WHT; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    const row = (y) => { g.lineWidth = 3; g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y); g.stroke(); };
    row(h * 0.36); row(h * 0.56); row(h * 0.76);
    g.beginPath(); g.moveTo(w * 0.5, h * 0.56); g.lineTo(w * 0.5, h - 3); g.stroke();
    g.fillStyle = "#fff"; g.textBaseline = "middle"; g.font = `700 ${h * 0.22}px ${HEAD}`; g.fillText("AUDIRA", 30, h * 0.17);
    g.fillStyle = "#9ED8FF"; g.font = `500 ${h * 0.065}px ${MONO}`; g.fillText("FAKTA SEJARAH NEGARA · EP 24", 30, h * 0.3);
    g.fillStyle = "#fff"; g.font = `700 ${h * 0.1}px ${HEAD}`; g.fillText("GAMBAR: BENDERA NEPAL", 30, h * 0.465);
    g.font = `500 ${h * 0.06}px ${MONO}`; g.fillStyle = "#BFD8F5"; g.fillText("SKALA  1 : 20", 30, h * 0.66); g.fillText("LEMBAR  01 / 01", w * 0.5 + 24, h * 0.66);
    g.fillText("DIGAMBAR: AUDIRA", 30, h * 0.87); g.fillStyle = "#F2B33D"; g.fillText("STATUS: SESUAI KONSTITUSI", w * 0.5 + 24, h * 0.87);
  }, 40, 0.1, 138, true, scene, 1400);

  // ---------- s8: 2008 proposal card + DITOLAK stamp ----------
  const cardG = new THREE.Group(); cardG.position.set(0, 0.62, 0); cardG.rotation.y = 0.05; top.add(cardG);
  const cardP = new THREE.Group(); cardP.rotation.x = -Math.PI / 2; cardP.position.z = 10.5; cardG.add(cardP);
  add(new THREE.BoxGeometry(29, 21, 0.4), std(0xd9e1ea, 0.8), 0, 10.5, -0.25, cardP);
  const card = plate(28, 20, (g, w, h) => {
    g.fillStyle = "#EEF2F7"; g.fillRect(0, 0, w, h);
    g.fillStyle = INK; g.font = `700 ${h * 0.1}px ${HEAD}`; g.textBaseline = "middle"; g.fillText("USUL DESAIN BARU", 34, h * 0.12);
    g.font = `500 ${h * 0.06}px ${MONO}`; g.fillStyle = "#3a5578"; g.fillText("TAHUN 2008 · BENDERA NEPAL", 34, h * 0.22);
    g.strokeStyle = "#7c8fa8"; g.lineWidth = 4; g.setLineDash([14, 10]); g.strokeRect(w * 0.18, h * 0.33, w * 0.64, h * 0.5); g.setLineDash([]);
    g.fillStyle = "#9aabbf"; g.font = `700 ${h * 0.3}px ${HEAD}`; g.textAlign = "center"; g.fillText("?", w / 2, h * 0.6);
  }, 0, 10.5, 0, false, cardP, 1024);
  card.material.depthWrite = true;
  const tolak = plate(22, 7, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = RED; g.fillStyle = RED; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${h * 0.62}px ${HEAD}`; g.fillText("DITOLAK", w / 2, h * 0.55);
    const q = mulberry(81); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1300; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + q() * 0.6})`; g.fillRect(q() * w, q() * h, 2 + q() * 5, 1 + q() * 3); } g.globalCompositeOperation = "source-over";
  }, 0, 8.5, 0.15, false, cardP, 1024);
  tolak.rotation.z = 0.16; tolak.renderOrder = 7; tolak.material.depthTest = false;

  // contact shadows: soft dark decals where objects meet the sheet
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.8)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, z, o = 0.5, p = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); p.add(m); return m; };
  const bookBlob = blob(30, 38, 0, 0, 0.55, book);

  // ---------- timing ----------
  const s2 = K.s2, s3 = K.s3, s4 = K.s4, s5 = K.s5, s7 = K.s7, s8 = K.s8;
  const D2R = Math.PI / 180;
  const cv = (tx, ty, tz, d, pd, yaw = 0) => { const p = pd * D2R; return [tx + d * Math.cos(p) * Math.sin(yaw), ty + d * Math.sin(p), tz + d * Math.cos(p) * Math.cos(yaw), tx, ty, tz]; };
  const fc = hW(0.55, 0.62, 0); // flag centre (world)
  const emb = hW(0.3, 0.62, 0);
  const keys = [
    [0, ...cv(6, 60, 0, 235, 3, 0.3)],
    [A("s1:satu"), ...cv(10, 57, 0, 200, 4, 0.22)],
    [s2 - 0.1, ...cv(14, 57, 0, 185, 4, 0.14)],
    [A("s2:segi"), ...cv(fc[0], 55, 0, 178, 6, -0.1)],
    [A("s2:lebih"), ...cv(fc[0] + 5, 54, 0, 182, 6, -0.22)],
    [s3 - 0.1, ...cv(fc[0] + 9, 53, 0, 170, 5, -0.16)],
    [A("s3:bulan"), ...cv(fc[0] + 10, 53, 0, 165, 6, -0.07)],
    [A("s3:matahari"), ...cv(fc[0] + 10, 52, 0, 164, 6, 0.03)],
    [s4 - 0.1, ...cv(fc[0] + 6, 52, 0, 168, 6, 0.1)],
    [A("s4:panji") + 1.3, ...cv(-22, 56, 0, 165, 7, 0.22)],
    [A("s4:Shah"), ...cv(-18, 56, 0, 172, 7, 0.14)],
    [A("s4:Dulu") + 1.0, ...cv(emb[0] + 5, 55, 0, 122, 5, 0.06)],
    [s5 - 0.15, ...cv(emb[0] + 5, 55, 0, 118, 5, -0.03)],
    [A("s5:1962") - 0.3, ...cv(-2, 18, 0, 272, 19, 0.03)],
    [A("s5:Shankar"), ...cv(-2, 18, 0, 268, 19, -0.01)],
    [A("s5:Wajah"), ...cv(-2, 18, 0, 266, 19, -0.03)],
    [K.s5e, ...cv(-2, 18, 0, 264, 19, -0.05)],
    [K.s6 + 1.3, ...cv(0, 0, 114, 250, 80, 0)],
    [A("s6:Konstitusi"), ...cv(2, 0, 114, 244, 80, 0)],
    [K.s6e, ...cv(2, 0, 114, 240, 80, 0)],
    [A("s7:1,219") - 0.45, ...cv(-4, 0, 116, 236, 81, 0)],
    [A("s7:1,219") + 0.05, ...cv(-20, 0, 116, 200, 83, 0)],
    [K.s7e, ...cv(-20, 0, 116, 192, 83, 0)],
    [s8 + 1.0, ...cv(-3, 27, 8, 246, 16, 0.07)],
    [A("s8:ditolak") + 0.4, ...cv(-3, 27, 8, 238, 16, 0.03)],
    [A("s8:Menurut") + 1.6, ...cv(-3, 27, 8, 236, 16, 0.0)],
    [A("s8:Menurut") + 4.6, ...cv(-10, 34, 72, 330, 21, 0.12)],
    [K.dur, ...cv(-10, 34, 72, 350, 20, 0.18)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const amp = (t) => 1.6 - 1.15 * smooth(clamp01((t - s2) / 2)) + 1.8 * smooth(clamp01((t - s8 - 4) / 3));
  let faceQ = -1;
  const fadeIn = (t, a, d = 0.5) => smooth(clamp01((t - a) / d));

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Rajdhani"`) && document.fonts.check(`700 40px "JetBrains Mono"`)) {
      labels.done = true; faceQ = -1;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.setLineDash([]); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.3, c[1] + Math.sin(t * 0.29) * 0.22, c[2] + Math.cos(t * 0.31) * 0.25);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);

    // flags wave; the ghost rectangles sink into the sheet on "Nepal"
    const a = amp(t);
    hero.wave(t, a);
    ghosts.forEach((g, i) => {
      const d = Math.abs(g.x), k = smooth(clamp01((t - A("s2:Nepal") + 0.2 - (150 - d) * 0.006) / 1.4));
      g.G.position.y = -POLE_H * 1.05 * k; g.G.visible = k < 0.999; if (g.G.visible) g.c.wave(t, 1.6, i * 1.3);
    });
    const pk = smooth(clamp01((t - A("s4:panji") + 0.3) / 1.4)) * (1 - smooth(clamp01((t - s5 - 0.2) / 1.2)));
    penG.position.y = -POLE_H * 1.05 * (1 - pk); penG.visible = pk > 0.001; if (penG.visible) pen.wave(t, 1.0, 0.7);
    himT.material.opacity = fadeIn(t, A("s2:Himalaya") - 0.3, 0.6) * (1 - fadeIn(t, s3, 0.6)) * 0.95;

    // s2: two pennons, concave pentagon, dimensions
    const o2 = 1 - fadeIn(t, A("s2:satu-satunya") - 0.2, 0.5);
    triA.draw((t - A("s2:dua") + 0.1) / 0.7); triA.material.opacity = o2;
    triB.draw((t - A("s2:panji") - 0.1) / 0.7); triB.material.opacity = o2;
    const o3 = 1 - fadeIn(t, s3 - 0.1, 0.4);
    pent.draw((t - A("s2:segi") + 0.1) / 0.9); pent.material.opacity = o3;
    pentDots.forEach((m, i) => { const k = back(clamp01((t - A("s2:segi") - 0.15 * i) / 0.35)) * o3; m.scale.setScalar(Math.max(0.001, k)); });
    cekung.material.opacity = fadeIn(t, A("s2:cekung"), 0.35) * o3;
    const u2 = (t - A("s2:lebih") + 0.1) / 0.8, u2b = (t - A("s2:lebarnya") + 0.1) / 0.8;
    dimH.draw(u2); dimW.draw(u2b); ticks.forEach((m, i) => m.draw(i < 2 ? u2b * 3 - 1 : u2 * 3 - 1));
    [dimH, dimW, ...ticks].forEach((m) => (m.material.opacity = o3));
    lbH.material.opacity = fadeIn(t, A("s2:tinggi"), 0.35) * o3; lbW.material.opacity = fadeIn(t, A("s2:lebarnya"), 0.35) * o3;

    // s3: callouts and ray counters
    const o4 = 1 - fadeIn(t, s4 - 0.2, 0.4);
    callouts.forEach((cl) => {
      const k = back(clamp01((t - A(cl.k) + 0.05) / 0.4), 1.3);
      cl.m.quaternion.copy(cam.quaternion); cl.m.scale.setScalar(Math.max(0.001, k)); cl.m.material.opacity = o4; cl.m.visible = k > 0.001 && o4 > 0.001;
      cl.lead.draw((t - A(cl.k) + 0.15) / 0.4); cl.lead.material.opacity = o4;
      cl.dot.scale.setScalar(Math.max(0.001, clamp01((t - A(cl.k) + 0.15) / 0.2) * o4));
    });
    moonDots.forEach((m, i) => m.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s3:delapan") - i * 0.1) / 0.25)) * o4)));
    sunDots.forEach((m, i) => m.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s3:dua") - i * 0.075) / 0.25)) * o4)));

    // s4: pennon tag, faces appear; s5 erases them
    penTag.quaternion.copy(cam.quaternion);
    const kp = back(clamp01((t - A("s4:Gorkha") + 0.05) / 0.4), 1.3) * (1 - fadeIn(t, A("s4:Dulu"), 0.4));
    penTag.scale.setScalar(Math.max(0.001, kp)); penTag.visible = kp > 0.002 && penG.visible;
    const fa = fadeIn(t, A("s4:wajah") - 0.7, 0.8) * (1 - fadeIn(t, A("s5:dihapus") - 0.6, 1.1));
    const fq = Math.round(fa * 16);
    if (fq !== faceQ) { faceQ = fq; const cc = hero.tex.image, g = cc.getContext("2d"); paintNepal(g, cc.width, cc.height, fq / 16); hero.tex.needsUpdate = true; }
    faceTag.quaternion.copy(cam.quaternion);
    const kf = back(clamp01((t - A("s4:wajah") + 0.1) / 0.4), 1.3) * (1 - fadeIn(t, s5 - 0.1, 0.35));
    faceTag.scale.setScalar(Math.max(0.001, kf)); faceTag.visible = kf > 0.002;

    // s5: stamp lands on "1962", name cards stand up
    const th = A("s5:1962");
    const go = smooth(clamp01((t - th + 0.8) / 0.55)), ret = smooth(clamp01((t - th - 0.35) / 0.7));
    const drop = t < th ? 1 - clamp01((t - th + 0.22) / 0.22) : clamp01((t - th - 0.12) / 0.3);
    stamp.position.set(-1 - 50 * (1 - go) - 30 * ret, 0.55 + 9 * drop * (go > 0 ? 1 : 0) + 30 * ret, -1 + 10 * (1 - go));
    const dk = smooth(clamp01((t - K.s5 + 0.4) / 1.1)); desk.position.y = -34 * (1 - dk); desk.visible = dk > 0.001;
    stamp.rotation.y = 0.06; stamp.visible = go > 0.001 && ret < 0.999;
    imp.material.opacity = t >= th && t < K.s8 + 0.6 ? 0.95 : 0;
    mahendra.H.rotation.x = -Math.PI / 2 * (1 - back(clamp01((t - A("s5:Raja") + 0.15) / 0.55), 1.4));
    rimal.H.rotation.x = -Math.PI / 2 * (1 - back(clamp01((t - A("s5:Shankar") + 0.15) / 0.55), 1.4));
    mahendra.G.visible = t > A("s5:Raja") - 0.2 && t < K.s6 + 0.6; rimal.G.visible = t > A("s5:Shankar") - 0.2 && t < K.s6 + 0.6;

    // s6: construction, step by step
    for (const it of C) it.m.draw((t - it.t) / it.d);
    for (const p of pts) { const k = back(clamp01((t - p.t) / 0.3), 1.6); p.G.scale.setScalar(Math.max(0.001, k)); p.G.visible = k > 0.001; }
    const fillU = fadeIn(t, A("s6:lampiran") - 0.3, 0.9);
    drawFill.material.opacity = fillU; drawFill.visible = fillU > 0.001;
    const auxFade = 1 - 0.65 * fillU;
    auxM.opacity = 0.85 * auxFade; arcM.opacity = 0.85 * auxFade;
    const bk = eout(clamp01((t - A("s6:Konstitusi") + 0.2) / 0.8));
    book.position.set(BOOK[0] + 70 * (1 - bk), BOOK[1] + 10 * Math.sin(Math.PI * bk) * (1 - bk), BOOK[2] - 10 * (1 - bk)); book.rotation.y = 0.18 - 0.6 * (1 - bk); book.visible = bk > 0.001;

    // s7: dimensions, punch on 1,219
    const ud = (t - A("s7:perbandingan") + 0.1) / 0.9;
    dV.draw(ud); dH.draw(ud - 0.3); dTicks.forEach((m) => m.draw(ud * 2 - 0.6));
    const kv = back(clamp01((t - A("s7:1,219") + 0.25) / 0.4), 1.5), kh = back(clamp01((t - A("s7:lebarnya")) / 0.4), 1.5);
    vLab.scale.setScalar(Math.max(0.001, kv)); vLab.visible = kv > 0.001;
    hLab.scale.setScalar(Math.max(0.001, kh)); hLab.visible = kh > 0.001;

    // s8: DITOLAK
    const ku = back(clamp01((t - K.s8 + 0.2) / 0.7), 1.2);
    const kc = eout(clamp01((t - K.s8 + 0.2) / 0.8)); cardG.position.set(-60 * (1 - kc), 0.62 + 6 * Math.sin(Math.PI * kc) * (1 - kc), 0); cardG.visible = kc > 0.001;
    const kt = clamp01((t - A("s8:ditolak") + 0.12) / 0.18);
    tolak.scale.setScalar(Math.max(0.001, 1.8 - 0.8 * kt)); tolak.material.opacity = kt; tolak.visible = kt > 0.001;

    comp.render();
  };
}
