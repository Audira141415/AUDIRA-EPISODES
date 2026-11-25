// EP47 LESOTHO, NEGARA DI ATAS AWAN: POLYVERSE. Flat-shaded pastel low-poly, dawn light, a sea of faceted clouds.
// Three stations in one world; only the active one is visible, cuts hide under the HTML cloud wipe.
//   PEAKS   (0,0,0)    Lesotho massif built from the real outline (Natural Earth 50m, geo.js) as a heightfield.
//                      1 unit of height = 250 m, so 1.000 m = y 4, 1.400 m = y 5.6, 1.800 m = y 7.2. The border never dips
//                      below 5.6 and touches it only at the lowest point (gold crystal). Survey pole with tags + AUDIRA banner,
//                      level sheets with an above-level tint (shader), villages of round huts, mesa fortress with Basotho
//                      figures and the RAJA MOSHOESHOE I tag, a dam that fills, the Lesotho flag, a Basotho blanket banner.
//   MAP     (400,0,0)  floating island of southern Africa; Lesotho raised and ringed by South Africa; s6 history props.
//   ENCLAVE (-400,0,0) three floating islands: Vatikan, San Marino (Italia) and Lesotho (Afrika Selatan).
// Everything is a function of t.

const FONTS = ['700 80px "Space Grotesk"', '600 80px "Space Grotesk"', '500 80px "JetBrains Mono"', '700 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "LESOTHO AUDIRA 1.400 m"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage } from "./lib3d.js";
import { GEO } from "./geo.js";

const SG = '"Space Grotesk", Arial, sans-serif', MONO = '"JetBrains Mono", Consolas, monospace';
const ENV = 0.25;
const INK = "#2B2540", CREAM = "#FFF8F0", LBLUE = "#00209F", LGREEN = "#009543", PEACH = "#F6C7A1", LAV = "#9C8FB8", BRAND = "#0B3D2E", LIME = "#A3E635";
const UM = 250; // metres per height unit
const Y = (m) => m / UM;

// Hermite track with harmonic-mean tangents: never overshoots a key.
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

// ---------- deterministic noise ----------
const hs = (i, j, s) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const vn = (x, y, s = 1) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); const a = hs(i, j, s), b = hs(i + 1, j, s), c = hs(i, j + 1, s), d = hs(i + 1, j + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const fbm = (x, y, s = 1) => vn(x, y, s) * 0.55 + vn(x * 2.1, y * 2.1, s + 1) * 0.3 + vn(x * 4.3, y * 4.3, s + 2) * 0.15;

// ---------- 2D geometry ----------
function segDist(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az; const t = clamp01(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)); return Math.hypot(ax + dx * t - px, az + dz * t - pz); }
function inPoly(P, x, z) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
const sdist = (P, x, z) => { let m = 1e9; for (let i = 0, j = P.length - 1; i < P.length; j = i++) m = Math.min(m, segDist(x, z, P[j][0], P[j][1], P[i][0], P[i][1])); return inPoly(P, x, z) ? m : -m; };
const polyDist = (L, x, z) => { let m = 1e9; for (let i = 1; i < L.length; i++) m = Math.min(m, segDist(x, z, L[i - 1][0], L[i - 1][1], L[i][0], L[i][1])); return m; };
// Sutherland-Hodgman clip of a lon/lat ring to a box
function clipRing(R, x0, y0, x1, y1) {
  let out = R;
  const edges = [[(p) => p[0] >= x0, (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1]]];
  for (const [ins, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) { const a = inp[(i + inp.length - 1) % inp.length], b = inp[i]; if (ins(b)) { if (!ins(a)) out.push(cut(a, b)); out.push(b); } else if (ins(a)) out.push(cut(a, b)); }
    if (!out.length) break;
  }
  return out;
}

// ---------- canvas painters ----------
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// a card label: lines [{t, s (fraction of h), f: 'sg'|'mono', c, w}]
function cardPaint(lines, o = {}) {
  return (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const pad = h * 0.06;
    g.save(); g.shadowColor = "rgba(43,37,64,.35)"; g.shadowBlur = h * 0.06; g.shadowOffsetY = h * 0.03;
    g.fillStyle = o.bg || CREAM; rr(g, pad, pad, w - 2 * pad, h - 2.6 * pad, h * 0.14); g.fill(); g.restore();
    if (o.acc) { g.save(); rr(g, pad, pad, w - 2 * pad, h - 2.6 * pad, h * 0.14); g.clip(); g.fillStyle = o.acc; g.fillRect(pad, pad, h * 0.1, h); g.restore(); }
    const x0 = pad + (o.acc ? h * 0.2 : h * 0.12);
    let y = pad + h * 0.06;
    for (const L of lines) {
      const sz = L.s * h; y += sz * 1.02;
      g.font = `${L.w || 700} ${sz}px ${L.f === "mono" ? MONO : SG}`; g.fillStyle = L.c || INK; g.textAlign = o.center ? "center" : "left"; g.textBaseline = "alphabetic";
      if ("letterSpacing" in g) g.letterSpacing = L.ls ? `${L.ls * sz}px` : "0px";
      g.fillText(L.t, o.center ? w / 2 : x0, y - sz * 0.16);
      y += sz * (L.gap ?? 0.12);
    }
  };
}
function flagLesotho(g, w, h) {
  g.fillStyle = LBLUE; g.fillRect(0, 0, w, h * 0.3); g.fillStyle = "#FFFFFF"; g.fillRect(0, h * 0.3, w, h * 0.4); g.fillStyle = LGREEN; g.fillRect(0, h * 0.7, w, h * 0.3);
  // black mokorotlo hat in the white band
  const cx = w / 2, by = h * 0.62, hw = h * 0.2, top = h * 0.36;
  g.fillStyle = "#111111"; g.beginPath(); g.moveTo(cx - hw, by); g.quadraticCurveTo(cx, by + h * 0.05, cx + hw, by); g.lineTo(cx + hw * 0.18, top + h * 0.06); g.lineTo(cx - hw * 0.18, top + h * 0.06); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(cx, top + h * 0.035, hw * 0.16, h * 0.035, 0, 0, 6.2832); g.fill();
  g.fillRect(cx - hw * 0.05, top - h * 0.01, hw * 0.1, h * 0.05);
  for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(${(y / 3) % 2 ? "255,255,255,.05" : "0,0,0,.05"})`; g.fillRect(0, y, w, 1.5); }
}
// Basotho blanket: deep ground, pinstripe bands, rows of mokorotlo hats and maize diamonds, woollen fuzz
function blanketPaint(g, w, h) {
  g.fillStyle = "#283A86"; g.fillRect(0, 0, w, h);
  const q = mulberry(47);
  const band = (y0) => { const cols = ["#F2C14E", "#FFFFFF", "#C8463A", "#FFFFFF", "#F2C14E"]; cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, y0 + i * h * 0.018, w, h * 0.008); }); };
  band(h * 0.05); band(h * 0.86);
  g.fillStyle = "#C8463A"; g.fillRect(0, h * 0.16, w, h * 0.05); g.fillRect(0, h * 0.79, w, h * 0.05);
  const hat = (cx, cy, s, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx - s, cy + s * 0.55); g.quadraticCurveTo(cx, cy + s * 0.8, cx + s, cy + s * 0.55); g.lineTo(cx, cy - s * 0.75); g.closePath(); g.fill(); g.beginPath(); g.arc(cx, cy - s * 0.85, s * 0.16, 0, 6.2832); g.fill(); };
  const dia = (cx, cy, s, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - s); g.lineTo(cx + s * 0.6, cy); g.lineTo(cx, cy + s); g.lineTo(cx - s * 0.6, cy); g.closePath(); g.fill(); g.fillStyle = "#283A86"; g.beginPath(); g.moveTo(cx, cy - s * 0.45); g.lineTo(cx + s * 0.27, cy); g.lineTo(cx, cy + s * 0.45); g.lineTo(cx - s * 0.27, cy); g.closePath(); g.fill(); };
  const s = h * 0.075;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const cx = w * (0.1 + c * 0.2) + (r % 2 ? w * 0.1 : 0), cy = h * (0.33 + r * 0.17);
    if (cx > w * 0.96) continue;
    (r + c) % 2 ? dia(cx, cy, s * 1.1, "#F2C14E") : hat(cx, cy, s, "#F2C14E");
  }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,255,255" : "0,0,0"},${0.04 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 3); }
}
function bannerAudira(g, w, h) {
  g.fillStyle = BRAND; g.fillRect(0, 0, w, h);
  g.fillStyle = LIME; g.fillRect(0, h * 0.84, w, h * 0.06);
  g.font = `700 ${h * 0.5}px ${SG}`; g.fillStyle = "#FFFFFF"; g.textAlign = "center"; g.textBaseline = "alphabetic";
  if ("letterSpacing" in g) g.letterSpacing = `${h * 0.06}px`;
  g.fillText("AUDIRA", w / 2 + h * 0.03, h * 0.6);
  g.font = `700 ${h * 0.11}px ${MONO}`; g.fillStyle = LIME; if ("letterSpacing" in g) g.letterSpacing = `${h * 0.02}px`;
  g.fillText("KERAJAAN DI ATAS AWAN", w / 2, h * 0.77);
  const q = mulberry(9); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,255,255" : "0,0,0"},${0.03 + q() * 0.04})`; g.fillRect(q() * w, q() * h, 1.5, 1.5); }
}
function sheetPaint(col) {
  return (g, w) => {
    g.clearRect(0, 0, w, w);
    const c = w / 2;
    const gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, col.replace("A", "0.30")); gr.addColorStop(0.75, col.replace("A", "0.22")); gr.addColorStop(1, col.replace("A", "0"));
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.save(); g.beginPath(); g.arc(c, c, c * 0.92, 0, 6.2832); g.clip();
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2;
    for (let x = 0; x < w; x += w / 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, w); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
    g.restore();
  };
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe9c9c4, exp: 0.82, bloom: [0.05, 0.4, 0.97], fov: 32 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.82;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  bp.threshold = 0.97; bp.strength = 0.05; bp.radius = 0.4;
  cam.far = 1200; cam.updateProjectionMatrix();
  { const c = document.createElement("canvas"); c.width = 8; c.height = 1024; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 1024);
    gr.addColorStop(0, "#3F4F98"); gr.addColorStop(0.3, "#7C86C6"); gr.addColorStop(0.55, "#C9A9CF"); gr.addColorStop(0.76, "#F2B99A"); gr.addColorStop(1, "#F7D8BE");
    g.fillStyle = gr; g.fillRect(0, 0, 8, 1024); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.Fog(0xe9c2bc, 150, 560);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = ENV; // r186: scene.environment ignores material.envMapIntensity

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xb9b4e6, 0x6f8a5c, 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffbf8a, 3.4);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 260 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2.5;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xb9c4ff, 0.35); scene.add(fill, fill.target);
  const SUNDIR = new THREE.Vector3(0.88, 0.32, 0.36).normalize();

  // ---------- helpers ----------
  const labels = [];
  const ltex = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  const flat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), flatShading: true, roughness: o.r ?? 0.88, metalness: o.m ?? 0, ...o.x });
  const sh = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; return m; };
  const mesh = (geo, mat, p, x = 0, y = 0, z = 0, cast = true) => { const m = sh(new THREE.Mesh(geo, mat), cast); m.position.set(x, y, z); p.add(m); return m; };
  const jitter = (geo, a, seed) => { const q = mulberry(seed), p = geo.attributes.position; const key = new Map(); for (let i = 0; i < p.count; i++) { const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`; if (!key.has(k)) key.set(k, [(q() - 0.5) * a, (q() - 0.5) * a, (q() - 0.5) * a]); const d = key.get(k); p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]); } geo.computeVertexNormals(); return geo; };
  const billboards = [];
  // 3D card on a thin pole; the card always faces the camera
  const tag = (parent, x, y, z, wu, lines, o = {}) => {
    const G = new THREE.Group(); G.position.set(x, y, z); parent.add(G);
    const px = Math.round(Math.min(1400, wu * 220)), hpx = Math.round(px * (o.aspect || 0.3));
    const hu = wu * hpx / px;
    const tx = ltex(px, hpx, cardPaint(lines, o));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, depthWrite: false, fog: false }));
    const pole = o.pole ?? 1.0;
    pl.position.y = pole + hu * 0.45; pl.renderOrder = 5; G.add(pl); billboards.push(pl);
    if (pole > 0.05) { const st = mesh(new THREE.CylinderGeometry(wu * 0.008 + 0.012, wu * 0.008 + 0.012, pole, 5), flat(INK), G, 0, pole / 2, 0); st.castShadow = false; }
    if (o.dot !== false) mesh(new THREE.SphereGeometry(wu * 0.02 + 0.04, 8, 6), flat(o.dotc || INK), G, 0, 0, 0, false);
    G.userData.pl = pl;
    return G;
  };
  const scaleIn = (G, u) => { const s = Math.max(0.001, u); G.scale.setScalar(s); G.visible = u > 0.002; };
  const pop = (t, a, d = 0.45) => back(clamp01((t - a) / d), 1.5);
  const win = (t, a, b, f = 0.35) => smooth(clamp01((t - a) / f)) * (1 - smooth(clamp01((t - b) / f)));
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));

  // ---------- low-poly person (generic, never a likeness) ----------
  const skinM = [flat("#8A5A3C"), flat("#6E452C"), flat("#A06B48")];
  const eyeM = flat("#1A1420", { r: 0.4 }), strawM = flat("#D9B26A"), pantsM = flat("#3C3550");
  const blanketCols = ["#283A86", "#C8463A", "#2F6E4E", "#7A3E8E", "#B8792C", "#3E5FA8"];
  const blanketMs = blanketCols.map((c) => flat(c, { r: 0.95 }));
  const person = (seed, o = {}) => {
    const q = mulberry(seed);
    const G = new THREE.Group();
    const skin = skinM[seed % 3], bl = o.blM || blanketMs[seed % blanketMs.length], cloth = flat(["#E8DCC4", "#C9B79A", "#D7C6E0"][seed % 3]);
    const limb = (pivot, len, rad, mat, rotX, rotZ) => { const P = new THREE.Group(); P.position.copy(pivot); P.rotation.set(rotX, 0, rotZ); G.add(P); mesh(new THREE.CylinderGeometry(rad, rad * 0.85, len, 5), mat, P, 0, -len / 2, 0); return P; };
    // legs with bent knees
    for (const s of [-1, 1]) {
      const hip = limb(new THREE.Vector3(s * 0.055, 0.34, 0), 0.17, 0.035, pantsM, -0.28, s * 0.04);
      const kn = new THREE.Group(); kn.position.set(0, -0.17, 0); kn.rotation.x = 0.5; hip.add(kn);
      mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.17, 5), pantsM, kn, 0, -0.085, 0);
      mesh(new THREE.BoxGeometry(0.06, 0.035, 0.1), flat("#3A2A22"), kn, 0, -0.18, 0.02);
    }
    // torso: shoulders wider than hips
    mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.27, 6), cloth, G, 0, 0.48, 0);
    // blanket over the shoulders
    const bm = mesh(new THREE.CylinderGeometry(0.15, 0.175, 0.3, 7, 1, true), bl, G, 0, 0.47, 0); bm.material.side = THREE.DoubleSide;
    mesh(new THREE.CylinderGeometry(0.06, 0.15, 0.06, 7), bl, G, 0, 0.64, 0);
    // arms with bent elbows
    for (const s of [-1, 1]) {
      const sh0 = limb(new THREE.Vector3(s * 0.15, 0.6, 0), 0.15, 0.03, bl, -0.15 - (o.wave && s > 0 ? 2.4 : 0), s * 0.22);
      const el = new THREE.Group(); el.position.set(0, -0.15, 0); el.rotation.x = o.wave && s > 0 ? -0.6 : -1.0; sh0.add(el);
      mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.14, 5), skin, el, 0, -0.07, 0);
      if (o.staff && s > 0) mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5), flat("#6B4A2E"), el, 0, -0.1, 0.02).rotation.x = 1.0;
    }
    // head with a simple face
    mesh(new THREE.IcosahedronGeometry(0.085, 1), skin, G, 0, 0.74, 0);
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.012, 6, 4), eyeM, G, s * 0.03, 0.755, 0.075, false);
    mesh(new THREE.BoxGeometry(0.04, 0.008, 0.01), eyeM, G, 0, 0.71, 0.078, false);
    if (o.hat !== false && q() < 0.75) { mesh(new THREE.ConeGeometry(0.11, 0.12, 7), strawM, G, 0, 0.84, 0); mesh(new THREE.ConeGeometry(0.03, 0.05, 5), strawM, G, 0, 0.92, 0); }
    G.scale.setScalar(o.s || 1);
    return G;
  };

  // ======================================================================================
  // PEAKS
  // ======================================================================================
  const PEAK = new THREE.Group(); scene.add(PEAK);
  const L0 = 28.25, B0 = -29.6, CS = Math.cos(B0 * Math.PI / 180), S = 14;
  const prj = (lon, lat) => [(lon - L0) * CS * S, -(lat - B0) * S];
  const LSring = GEO.find((g) => g.name === "Lesotho").rings[0];
  const LS = LSring.map(([a, b]) => prj(a, b));
  const LOW = (() => { const p = prj(27.5, -30.4); let best = LS[0], bd = 1e9; for (const v of LS) { const d = Math.hypot(v[0] - p[0], v[1] - p[1]); if (d < bd) { bd = d; best = v; } } return best; })();
  const RIV = [[29.25, -28.9], [28.85, -29.3], [28.5, -29.7], [28.05, -30.05], [27.62, -30.3]].map(([a, b]) => prj(a, b)).concat([LOW]);
  function H(x, z) {
    const d = sdist(LS, x, z);
    const dl = Math.hypot(x - LOW[0], z - LOW[1]);
    const hb = 5.6 + 1.5 * smooth(clamp01(dl / 8)) * (0.55 + 0.45 * vn(x * 0.15, z * 0.15, 3));
    if (d < 0) return Math.max(0.6, hb + d * 1.35 + 0.3 * (vn(x * 0.4, z * 0.4, 9) - 0.5));
    const west = clamp01((-x - 3) / 9);
    const rise = smooth(clamp01(d / (1.3 + 2.2 * west)));
    const rg = 1 - Math.abs(2 * vn(x * 0.12 + 7, z * 0.12 - 3, 5) - 1);
    const east = clamp01((x + 8) / 24);
    const pk = 1.8 + 6.2 * rg * rg * (0.45 + 0.55 * east) + 2.0 * fbm(x * 0.25, z * 0.25, 7);
    let h = hb + rise * (pk * (1 - 0.6 * west) + 0.8);
    const dr = polyDist(RIV, x, z), v = Math.exp(-dr * dr / 2.4);
    h += (hb + 0.5 + rise * 1.1 - h) * v * 0.8;
    return h;
  }
  // heightfield, non-indexed, one colour per face
  const tintU = { uLv: { value: 4.0 }, uTa: { value: 0 }, uTc: { value: new THREE.Color("#B8F0D0") } };
  const terrM = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0 });
  terrM.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, tintU);
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying float vWY;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vWY;\nuniform float uLv;\nuniform float uTa;\nuniform vec3 uTc;")
      .replace("#include <color_fragment>", "#include <color_fragment>\nfloat abv = smoothstep(uLv - 0.05, uLv + 0.05, vWY);\ndiffuseColor.rgb = mix(diffuseColor.rgb, uTc, uTa * abv * 0.42);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uTc * uTa * 1.1 * (1.0 - smoothstep(0.0, 0.1, abs(vWY - uLv)));");
  };
  const NG = 124, EXT = 29;
  {
    const q = mulberry(4711), cell = 2 * EXT / NG;
    const V = []; for (let j = 0; j <= NG; j++) { const rowv = []; for (let i = 0; i <= NG; i++) { let x = -EXT + i * cell, z = -EXT + j * cell; if (i > 0 && i < NG && j > 0 && j < NG) { x += (q() - 0.5) * cell * 0.7; z += (q() - 0.5) * cell * 0.7; } rowv.push([x, H(x, z), z, sdist(LS, x, z)]); } V.push(rowv); }
    const pos = [], col = [], c = new THREE.Color(), tmp = new THREE.Color();
    const pal = { low: new THREE.Color("#A9D088"), mid: new THREE.Color("#86BA6C"), hi: new THREE.Color("#6CA05C"), rock: new THREE.Color("#9C8FB8"), rock2: new THREE.Color("#B3A8CC"), snow: new THREE.Color("#F1EEF7"), out: new THREE.Color("#CDBE92"), out2: new THREE.Color("#B6B77E"), river: new THREE.Color("#7FB8C9") };
    const face = (a, b, d) => {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const nl = Math.hypot(nx, ny, nz) || 1; ny = Math.abs(ny / nl);
      const hC = (a[1] + b[1] + d[1]) / 3, sC = (a[3] + b[3] + d[3]) / 3, xC = (a[0] + b[0] + d[0]) / 3, zC = (a[2] + b[2] + d[2]) / 3;
      if (sC < 0) c.copy(pal.out).lerp(pal.out2, vn(xC * 0.3, zC * 0.3, 2));
      else {
        c.copy(hC < 7.4 ? pal.low : hC < 9.6 ? pal.mid : pal.hi);
        if (ny < 0.8) c.lerp(ny < 0.62 ? pal.rock : pal.rock2, ny < 0.62 ? 0.85 : 0.55);
        if (hC > 12.4) c.lerp(pal.snow, smooth(clamp01((hC - 12.4) / 0.9)) * 0.9);
        const dr = polyDist(RIV, xC, zC); if (dr < 0.45) c.lerp(pal.river, 0.7);
        // AO-like darkening in valleys
        const lo = clamp01((H(xC + 1.2, zC) + H(xC - 1.2, zC) + H(xC, zC + 1.2) + H(xC, zC - 1.2)) / 4 - hC);
        c.multiplyScalar(1 - 0.22 * lo);
      }
      const jj = 1 + (q() - 0.5) * 0.09; c.multiplyScalar(jj);
      for (const p of [a, b, d]) { pos.push(p[0], p[1], p[2]); col.push(c.r, c.g, c.b); }
      void tmp;
    };
    for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
      const a = V[j][i], b = V[j][i + 1], cc = V[j + 1][i], d = V[j + 1][i + 1];
      if ((i + j) % 2) { face(a, cc, b); face(b, cc, d); } else { face(a, cc, d); face(a, d, b); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    mesh(g, terrM, PEAK);
  }
  // gold border draped on the massif (area beat)
  const border = (() => {
    const pts = []; for (let i = 0; i < LS.length; i++) { const a = LS[i], b = LS[(i + 1) % LS.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5)); for (let k = 0; k < n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n; pts.push(new THREE.Vector3(x, Math.max(H(x, z), H(x + 0.2, z), H(x - 0.2, z), H(x, z + 0.2), H(x, z - 0.2)) + 0.12, z)); } }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 900, 0.13, 5, true);
    const m = mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffd36e, emissive: 0xffb347, emissiveIntensity: 0.9, roughness: 0.4 }), PEAK, 0, 0, 0, false);
    m.userData.n = geo.index.count; return m;
  })();

  // villages: round huts with thatched roofs, a few poplars
  const HUT = []; const TREE = [];
  {
    const q = mulberry(1966);
    const ok = (x, z, minD = 0.9) => { const d = sdist(LS, x, z); if (d < minD) return false; const h = H(x, z); if (h > 11.2) return false; if (Math.abs(H(x + 0.4, z) - H(x - 0.4, z)) + Math.abs(H(x, z + 0.4) - H(x, z - 0.4)) > 0.9) return false; return polyDist(RIV, x, z) > 0.7; };
    let tries = 0, vill = 0;
    while (vill < 22 && tries++ < 3000) {
      const x = (q() - 0.5) * 30, z = (q() - 0.5) * 28; if (!ok(x, z)) continue; vill++;
      const n = 3 + Math.floor(q() * 4);
      for (let k = 0; k < n; k++) { const a = q() * 6.28, rr0 = 0.5 + q() * 0.9, hx = x + Math.cos(a) * rr0, hz = z + Math.sin(a) * rr0; if (ok(hx, hz, 0.5)) HUT.push([hx, H(hx, hz) - 0.06, hz, 0.85 + q() * 0.35, q()]); }
      for (let k = 0; k < 3; k++) { const a = q() * 6.28, rr0 = 1.3 + q() * 0.8, tx = x + Math.cos(a) * rr0, tz = z + Math.sin(a) * rr0; if (ok(tx, tz, 0.4)) TREE.push([tx, H(tx, tz) - 0.05, tz, 0.8 + q() * 0.5]); }
    }
  }
  const hutWallG = new THREE.CylinderGeometry(0.3, 0.32, 0.34, 7); hutWallG.translate(0, 0.17, 0);
  const hutRoofG = new THREE.ConeGeometry(0.42, 0.4, 7); hutRoofG.translate(0, 0.54, 0);
  const instanced = (geo, mat, list, colf, p = PEAK) => { const m = new THREE.InstancedMesh(geo, mat, list.length); m.castShadow = true; m.receiveShadow = true; const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), c = new THREE.Color(); list.forEach((h, i) => { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), h[4] * 6.28 || i); M4.compose(new THREE.Vector3(h[0], h[1], h[2]), Q, new THREE.Vector3(h[3], h[3], h[3])); m.setMatrixAt(i, M4); if (colf) m.setColorAt(i, colf(h, i, c)); }); p.add(m); return m; };
  instanced(hutWallG, flat("#ffffff"), HUT, (h, i, c) => c.set(["#EADBC0", "#E2C9A4", "#D9BFA8", "#EFE3CF"][i % 4]));
  instanced(hutRoofG, flat("#ffffff"), HUT, (h, i, c) => c.set(["#B98A4C", "#A97C43", "#C89A5A"][i % 3]));
  const treeG = new THREE.ConeGeometry(0.22, 0.95, 5); treeG.translate(0, 0.6, 0);
  instanced(treeG, flat("#ffffff"), TREE, (h, i, c) => c.set(["#4F8A55", "#5E9B5C", "#3F7A4F"][i % 3]));

  // clouds hugging the massif (outside the border) + a sea of clouds to the horizon
  const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1, emissive: 0xe8dcf2, emissiveIntensity: 0.1 });
  cloudM.color.set(0xfbf6ff);
  const icoG = new THREE.IcosahedronGeometry(1, 1);
  const CL = [];
  {
    const q = mulberry(321);
    let tries = 0;
    while (CL.length < 900 && tries++ < 20000) {
      const a = q() * 6.2832, rad = 6 + Math.sqrt(q()) * 70, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      if (sdist(LS, x, z) > -0.8) continue;
      const far = clamp01((rad - 20) / 50);
      CL.push({ x, z, y: 3.6 + q() * 1.5 + (Math.hypot(x, z) < 28 ? 0 : -0.3), s: 1.2 + q() * 2.2 + far * 2.5, sy: 0.42 + q() * 0.18, sp: 0.08 + q() * 0.12, ph: q() * 6.28 });
    }
  }
  
  // far ranges rising out of the cloud sea (mid + far layers)
  { const q = mulberry(999); const cols = ["#8F86B8", "#A49CC8", "#7D8FB8", "#9AA6C9"];
    for (let i = 0; i < 46; i++) { const a = -2.6 + q() * 4.2, rad = 48 + q() * 120, x = Math.cos(a) * rad, z = -Math.abs(Math.sin(a) * rad) - 10; if (Math.abs(x) < 30 && z > -34) continue;
      const h = 9 + q() * 8 + rad * 0.14, r0 = h * (0.55 + q() * 0.3);
      const geo = jitter(new THREE.ConeGeometry(r0, h, 6 + Math.floor(q() * 3), 2), r0 * 0.12, 500 + i).toNonIndexed(); geo.computeVertexNormals();
      const m = mesh(geo, flat(cols[i % 4], { r: 0.95 }), PEAK, x, 2.0 + h / 2, z); m.rotation.y = q() * 6; m.receiveShadow = true;
      if (h > 12) { const sg = new THREE.ConeGeometry(r0 * 0.28, h * 0.26, 6, 1); mesh(sg, flat("#F3EEF8"), PEAK, x, 2.0 + h - h * 0.13 + 0.02, z).rotation.y = m.rotation.y; } } }
  const cloudI = new THREE.InstancedMesh(icoG, cloudM, CL.length); cloudI.receiveShadow = true; cloudI.frustumCulled = false; PEAK.add(cloudI);
  const SEA = new THREE.Group(); scene.add(SEA);
  {
    const g = new THREE.PlaneGeometry(900, 900, 90, 90); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, (vn(x * 0.05, z * 0.05, 31) - 0.5) * 2.2 + (hs(i, 7, 3) - 0.5) * 0.5); }
    const ng = g.toNonIndexed(); ng.computeVertexNormals();
    const m = new THREE.Mesh(ng, cloudM); m.receiveShadow = true; SEA.add(m);
  }
  const SEAPUFF = [];
  { const q = mulberry(77); for (let i = 0; i < 380; i++) { const a = q() * 6.28, rad = 24 + q() * 160; SEAPUFF.push({ x: Math.cos(a) * rad, z: Math.sin(a) * rad, s: 2.5 + q() * 5, sy: 0.4 + q() * 0.2, sp: 0.05 + q() * 0.1, ph: q() * 6.28 }); } }
  const seaI = new THREE.InstancedMesh(icoG, cloudM, SEAPUFF.length); seaI.frustumCulled = false; SEA.add(seaI);

  // level sheets: 1.000 m (mint), 1.400 m (peach), 1.800 m (gold)
  const sheet = (rgbaA) => { const m = new THREE.Mesh(new THREE.CircleGeometry(36, 64), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 1024, sheetPaint(rgbaA)), transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0, fog: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; PEAK.add(m); return m; };
  const sh1000 = sheet("rgba(120,220,180,A)"), sh1400 = sheet("rgba(255,170,120,A)"), sh1800 = sheet("rgba(255,200,90,A)");
  sh1000.position.y = Y(1000); sh1400.position.y = Y(1400); sh1800.position.y = Y(1800);

  // survey pole beside the peaks
  const RUL = [LOW[0] - 4.6, 0, LOW[1] + 3.4];
  const RULG = new THREE.Group(); RULG.position.set(RUL[0], 0, RUL[2]); PEAK.add(RULG);
  for (let i = 0; i < 14; i++) mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 6), flat(i % 2 ? "#FFF6EC" : "#E2574C", { r: 0.6 }), RULG, 0, 0.4 + i * 0.8, 0);
  mesh(new THREE.ConeGeometry(0.3, 0.5, 6), flat("#2B2540"), RULG, 0, 11.45, 0);
  const ARMDIR = new THREE.Vector3(LOW[0] - RUL[0], 0, LOW[1] - RUL[2]).normalize();
  const arm = (yv, len, col) => { const g = new THREE.Group(); g.position.y = yv; g.rotation.y = Math.atan2(-ARMDIR.z, ARMDIR.x); RULG.add(g); mesh(new THREE.BoxGeometry(len, 0.09, 0.09), flat(col), g, len / 2, 0, 0); return g; };
  arm(Y(1000), 0.9, INK); arm(Y(1800), 0.9, INK);
  for (let i = 0; i < 14; i++) if (i % 2 === 0) arm(i * 0.8, 0.4, INK);
  const lowLen = Math.hypot(LOW[0] - RUL[0], LOW[1] - RUL[2]);
  // dashed 1.400 m line from the pole to the lowest point
  const dashG = new THREE.Group(); dashG.position.y = Y(1400); dashG.rotation.y = Math.atan2(-ARMDIR.z, ARMDIR.x); RULG.add(dashG);
  const DASH = []; for (let s = 0.3; s < lowLen - 0.2; s += 0.42) { const d = mesh(new THREE.BoxGeometry(0.26, 0.07, 0.07), new THREE.MeshStandardMaterial({ color: 0xffb06a, emissive: 0xff8a3c, emissiveIntensity: 0.9 }), dashG, s, 0, 0, false); DASH.push(d); }
  const tag1000 = tag(RULG, 0, Y(1000), 0, 2.2, [{ t: "1.000 m", s: 0.5, f: "mono" }], { pole: 0, dot: false, acc: "#55C29A", aspect: 0.32 });
  const tag1400 = tag(RULG, 0, Y(1400), 0, 1.9, [{ t: "1.400 m", s: 0.5, f: "mono", c: LBLUE }], { pole: 0, dot: false, acc: "#FF8A3C", aspect: 0.3 });
  const tag1800 = tag(RULG, 0, Y(1800), 0, 2.2, [{ t: "1.800 m", s: 0.5, f: "mono" }], { pole: 0, dot: false, acc: "#E2A93B", aspect: 0.32 });
  // tags sit to the left of the pole (away from the peaks)
  for (const T of [tag1000, tag1400, tag1800]) T.position.set(ARMDIR.x * 2.3, T.position.y + 0.55, ARMDIR.z * 2.3);
  // gold crystal over the lowest point
  const crystal = mesh(new THREE.OctahedronGeometry(0.55, 0), new THREE.MeshStandardMaterial({ color: 0xffd36e, emissive: 0xffa040, emissiveIntensity: 0.55, flatShading: true, roughness: 0.25, metalness: 0.3 }), PEAK, LOW[0], Y(1400) + 1.4, LOW[1]);
  crystal.scale.set(0.8, 1.3, 0.8);
  const beam = mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 5), new THREE.MeshBasicMaterial({ color: 0xffb06a, transparent: true, opacity: 0.8 }), PEAK, LOW[0], Y(1400) + 0.6, LOW[1], false);
  // AUDIRA banner on the pole top
  const BAN0 = new THREE.Group(); BAN0.position.set(0, 10.9, 0); BAN0.rotation.y = Math.atan2(-16, 34); BAN0.scale.setScalar(0.5); RULG.add(BAN0);
  mesh(new THREE.BoxGeometry(3.0, 0.1, 0.1), flat(INK), BAN0, 1.5, 0.05, 0);
  const audG = new THREE.PlaneGeometry(2.8, 1.12, 16, 6); audG.translate(1.5, -0.56, 0);
  const audBase = audG.attributes.position.array.slice();
  const audM = new THREE.MeshStandardMaterial({ map: ltex(1024, 410, bannerAudira), side: THREE.DoubleSide, roughness: 0.85, flatShading: true });
  const audMesh = mesh(audG, audM, BAN0, 0, 0, 0);

  // mesa fortress (Thaba Bosiu-like), huts, figures, king name tag
  const MESA = prj(27.86, -29.36);
  const mGround = H(MESA[0], MESA[1]);
  const MTOP = mGround + 2.2;
  const MESAG = new THREE.Group(); MESAG.position.set(MESA[0], 0, MESA[1]); PEAK.add(MESAG);
  { const g = jitter(new THREE.CylinderGeometry(2.5, 3.6, MTOP - mGround + 1.6, 9, 3), 0.25, 5); g.translate(0, (MTOP + mGround - 1.6) / 2, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > MTOP - 0.3) p.setY(i, MTOP); g.computeVertexNormals(); const ng = g.toNonIndexed(); ng.computeVertexNormals();
    // cliff colour bands + grass top
    const col = []; const cA = new THREE.Color("#B7A6C9"), cB = new THREE.Color("#C9A88E"), cT = new THREE.Color("#93C077"), pp = ng.attributes.position;
    for (let i = 0; i < pp.count; i += 3) { const yc = (pp.getY(i) + pp.getY(i + 1) + pp.getY(i + 2)) / 3; const c = yc >= MTOP - 0.01 ? cT : (Math.floor(yc * 2.2) % 2 ? cA : cB); for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b); }
    ng.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    mesh(ng, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9 }), MESAG);
  }
  const stoneM = flat("#B9B0C8");
  for (let i = 0; i < 26; i++) { const a = i / 26 * 6.2832; if (i % 9 === 4) continue; const st = mesh(new THREE.DodecahedronGeometry(0.2, 0), stoneM, MESAG, Math.cos(a) * 2.15, MTOP + 0.14, Math.sin(a) * 2.15); st.scale.set(1.3, 0.8, 1); st.rotation.y = a; }
  const mh = [[-0.9, -0.7], [0.4, -1.1], [1.1, -0.1], [-1.3, 0.5], [0.0, 0.2]];
  for (const [x, z] of mh) { mesh(hutWallG, flat("#E6D3B5"), MESAG, x, MTOP, z); mesh(hutRoofG, flat("#B98A4C"), MESAG, x, MTOP, z); }
  const FIG = [];
  { const spots = [[0.2, 1.2, 0.1], [-0.5, 1.0, -0.3], [0.9, 0.9, 0.4], [-1.2, 1.3, 0.2], [1.5, 1.2, -0.2], [-0.2, 1.75, 0.0], [0.65, 1.6, 0.25]];
    spots.forEach(([x, z, ry], i) => { const p = person(10 + i, { s: 0.95 }); p.position.set(x, MTOP, z); p.rotation.y = ry; MESAG.add(p); FIG.push(p); }); }
  const king = person(3, { s: 1.15, staff: true, blM: flat("#C8463A", { r: 0.95 }), hat: false }); king.position.set(-0.2, MTOP, 1.65); MESAG.add(king);
  mesh(new THREE.ConeGeometry(0.13, 0.15, 7), flat("#D9A13B"), king, 0, 0.86, 0);
  const kingTag = tag(MESAG, -0.2, MTOP + 1.15, 1.65, 2.6, [{ t: "RAJA", s: 0.2, f: "mono", c: "#8A7FA6", ls: 0.2 }, { t: "MOSHOESHOE I", s: 0.34 }], { pole: 0.5, acc: LAV, aspect: 0.36 });
  // attack arrows from the lowlands (stopped by the cliffs)
  const arrowShape = (L, W) => { const s = new THREE.Shape(); s.moveTo(0, -W * 0.3); s.lineTo(L * 0.62, -W * 0.3); s.lineTo(L * 0.62, -W * 0.62); s.lineTo(L, 0); s.lineTo(L * 0.62, W * 0.62); s.lineTo(L * 0.62, W * 0.3); s.lineTo(0, W * 0.3); s.closePath(); return s; };
  const arrowGeo = (L, W) => { const g = new THREE.ExtrudeGeometry(arrowShape(L, W), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 }); g.rotateX(-Math.PI / 2); return g; };
  const atkM = new THREE.MeshStandardMaterial({ color: 0xd8584a, flatShading: true, roughness: 0.6, transparent: true });
  const ATK = [-0.7, 0.0, 0.7].map((a, i) => { const G = new THREE.Group(); MESAG.add(G); mesh(arrowGeo(2.4, 0.7), atkM, G); G.userData.a = Math.PI + 0.55 + a * 0.6; G.userData.i = i; return G; });

  // dam, reservoir, flag, blanket banner
  const RD = [RIV[2][0] - RIV[1][0], RIV[2][1] - RIV[1][1]]; const RL = Math.hypot(RD[0], RD[1]); RD[0] /= RL; RD[1] /= RL;
  const DAM = [RIV[1][0] + RD[0] * RL * 0.55, RIV[1][1] + RD[1] * RL * 0.55];
  const dFloor = H(DAM[0], DAM[1]);
  const DAMG = new THREE.Group(); DAMG.position.set(DAM[0], dFloor, DAM[1]); DAMG.rotation.y = Math.atan2(-RD[1], RD[0]); PEAK.add(DAMG);
  { const g = new THREE.CylinderGeometry(3.2, 3.2, 2.4, 14, 1, true, -0.5, 1.0); const m = mesh(g, new THREE.MeshStandardMaterial({ color: 0xded7cc, flatShading: true, roughness: 0.7, side: THREE.DoubleSide }), DAMG, -3.2, 0.7, 0); m.rotation.y = -Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.4, 0.12, 3.4), flat("#C9C1B5"), DAMG, 0.02, 1.92, 0); }
  const watG = new THREE.CircleGeometry(4.4, 22).toNonIndexed(); watG.rotateX(-Math.PI / 2);
  const watBase = watG.attributes.position.array.slice();
  const water = mesh(watG, new THREE.MeshStandardMaterial({ color: 0x5fb0d8, flatShading: true, roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.94 }), PEAK, DAM[0] - RD[0] * 4.2, dFloor, DAM[1] - RD[1] * 4.2, false);
  water.receiveShadow = true;
  const PERP = [-RD[1], RD[0]];
  const FLAG = [DAM[0] + PERP[0] * 3.4 + RD[0] * 0.8, DAM[1] + PERP[1] * 3.4 + RD[1] * 0.8];
  const fGround = H(FLAG[0], FLAG[1]);
  const FLAGG = new THREE.Group(); FLAGG.position.set(FLAG[0], fGround, FLAG[1]); PEAK.add(FLAGG);
  mesh(new THREE.CylinderGeometry(0.05, 0.06, 4.0, 6), flat("#E9E3D8", { r: 0.4, m: 0.4 }), FLAGG, 0, 2.0, 0);
  mesh(new THREE.SphereGeometry(0.1, 8, 6), flat("#D9A13B", { r: 0.3, m: 0.6 }), FLAGG, 0, 4.05, 0);
  const flG = new THREE.PlaneGeometry(1.95, 1.3, 20, 12); flG.translate(0.975, -0.65, 0);
  const flBase = flG.attributes.position.array.slice();
  const flagM = new THREE.MeshStandardMaterial({ map: canvasTex(600, 400, flagLesotho), side: THREE.DoubleSide, roughness: 0.8, flatShading: true });
  const flagMesh = mesh(flG, flagM, FLAGG, 0, 1.4, 0);
  const BAN = [DAM[0] + PERP[0] * -2.6 + RD[0] * 3.4, DAM[1] + PERP[1] * -2.6 + RD[1] * 3.4];
  const bGround = Math.min(H(BAN[0] - 1.6, BAN[1]), H(BAN[0] + 1.6, BAN[1]), H(BAN[0], BAN[1]));
  const BANG = new THREE.Group(); BANG.position.set(BAN[0], bGround, BAN[1]); PEAK.add(BANG);
  for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.07, 0.08, 3.4, 6), flat("#7A5534"), BANG, s * 1.65, 1.5, 0);
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 6), flat("#6B4A2E"), BANG, 0, 3.05, 0).rotation.z = Math.PI / 2;
  const blG = new THREE.PlaneGeometry(3.1, 2.2, 14, 10); blG.translate(0, -1.1, 0);
  const blBase = blG.attributes.position.array.slice();
  const blanket = mesh(blG, new THREE.MeshStandardMaterial({ map: canvasTex(900, 640, blanketPaint), side: THREE.DoubleSide, roughness: 0.95, flatShading: true }), BANG, 0, 3.0, 0.02);
  const rollM = flat("#283A86", { r: 0.95 });
  const roll = mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.1, 8), rollM, BANG, 0, 3.0, 0.06); roll.rotation.z = Math.PI / 2;
  const BFIG = [];
  [[-1.3, 1.1, 0.3], [-0.5, 1.4, -0.1], [0.6, 1.25, 0.2], [1.4, 1.0, -0.3]].forEach(([x, z, ry], i) => { const p = person(30 + i, { s: 1.15, wave: i === 2 }); p.position.set(x, H(BAN[0] + x, BAN[1] + z) - bGround, z); p.rotation.y = ry; BANG.add(p); BFIG.push(p); });
  const flagTag = tag(FLAGG, 0, 4.25, 0, 3.2, [{ t: "4 OKTOBER 1966", s: 0.36, f: "mono", c: LBLUE }, { t: "LESOTHO MERDEKA", s: 0.22, f: "mono", c: "#7A6F96", ls: 0.06 }], { pole: 0.45, acc: LGREEN, aspect: 0.36, dot: false });

  // ======================================================================================
  // MAP: floating island of southern Africa
  // ======================================================================================
  const MO = [400, 0, 0];
  const MAP = new THREE.Group(); MAP.position.set(...MO); scene.add(MAP);
  const mp = (lon, lat) => [(lon - 25) * 0.88 * 1.6, -(lat + 28.5) * 1.6];
  const BOX = [15.4, -35.2, 33.6, -21.8];
  const ISW = (BOX[2] - BOX[0]) * 0.88 * 1.6 + 1.6, ISD = (BOX[3] - BOX[1]) * 1.6 + 1.6, ICX = ((BOX[0] + BOX[2]) / 2 - 25) * 0.88 * 1.6, ICZ = -((BOX[1] + BOX[3]) / 2 + 28.5) * 1.6;
  const shapeOf = (pts) => new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const slabGeo = (pts, depth, bev = 0.06) => { const g = new THREE.ExtrudeGeometry(shapeOf(pts), { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 1, curveSegments: 2 }); g.rotateX(-Math.PI / 2); return g; };
  {
    // ocean top + rock underside
    const rrPts = []; const rw = ISW / 2, rd = ISD / 2, rc = 2.2;
    for (const [cx, cz, a0] of [[rw - rc, rd - rc, 0], [-(rw - rc), rd - rc, Math.PI / 2], [-(rw - rc), -(rd - rc), Math.PI], [rw - rc, -(rd - rc), Math.PI * 1.5]]) for (let k = 0; k <= 4; k++) { const a = a0 + k / 4 * Math.PI / 2; rrPts.push([ICX + cx + Math.cos(a) * rc, ICZ + cz + Math.sin(a) * rc]); }
    const og = slabGeo(rrPts, 0.8, 0.12); og.translate(0, -0.8, 0);
    mesh(og, flat("#86C3D6", { r: 0.35 }), MAP);
    const cone = jitter(new THREE.ConeGeometry(Math.max(ISW, ISD) * 0.5, 12, 8, 4), 0.9, 12); cone.rotateX(Math.PI); cone.scale(1, 1, ISD / ISW); cone.translate(ICX, -0.8 - 6, ICZ);
    mesh(cone.toNonIndexed(), flat("#9A8FB4"), MAP);
    // faceted waves on the sea
    const wq = mulberry(88); for (let i = 0; i < 60; i++) { const x = ICX + (wq() - 0.5) * ISW * 0.95, z = ICZ + (wq() - 0.5) * ISD * 0.95; const w = mesh(new THREE.TetrahedronGeometry(0.22, 0), flat("#A9D6E3", { r: 0.3 }), MAP, x, 0.02, z, false); w.scale.set(1.6, 0.25, 0.8); w.rotation.y = wq() * 3; }
  }
  const CC = { "South Africa": ["#F2C9A0", 0.55], Namibia: ["#DCCDB8", 0.38], Botswana: ["#D2C8DE", 0.38], Zimbabwe: ["#CCD8BC", 0.38], Mozambique: ["#C3D8CE", 0.38], eSwatini: ["#DBC6CD", 0.38], Lesotho: ["#86BA6C", 1.25] };
  const COUNTRY = {};
  for (const c of GEO) {
    const ring = clipRing(c.rings[0], BOX[0], BOX[1], BOX[2], BOX[3]); if (ring.length < 3) continue;
    const pts = ring.map(([a, b]) => mp(a, b));
    const [col, dep] = CC[c.name];
    const m = mesh(slabGeo(pts, dep), new THREE.MeshStandardMaterial({ color: new THREE.Color(col), flatShading: true, roughness: 0.85, emissive: new THREE.Color(col), emissiveIntensity: 0 }), MAP, 0, 0.0, 0);
    COUNTRY[c.name] = { m, pts, dep };
  }
  const LM = COUNTRY.Lesotho, LP = LM.pts;
  const LC = LP.reduce((s, p) => [s[0] + p[0] / LP.length, s[1] + p[1] / LP.length], [0, 0]);
  // little mountains on map-Lesotho
  const MPK = new THREE.Group(); MAP.add(MPK);
  { const q = mulberry(5); let n = 0, tries = 0; while (n < 11 && tries++ < 400) { const x = LC[0] + (q() - 0.5) * 3.6, z = LC[1] + (q() - 0.5) * 3.4; if (sdist(LP, x, z) < 0.35) continue; n++; const h = 0.6 + q() * 0.9; const cg = jitter(new THREE.ConeGeometry(0.35 + q() * 0.3, h, 5, 1), 0.06, n); const cc = new THREE.Color(q() < 0.5 ? "#6CA05C" : "#9C8FB8"); const cm = mesh(cg, flat(cc), MPK, x, LM.dep + 0.06 + h / 2, z); cm.rotation.y = q() * 3; if (h > 1.2) mesh(new THREE.ConeGeometry(0.16, 0.3, 5), flat("#F1EEF7"), MPK, x, LM.dep + 0.06 + h - 0.12, z).rotation.y = cm.rotation.y; } }
  // map trees on South Africa
  { const q = mulberry(14); const sa = COUNTRY["South Africa"].pts; let n = 0, tries = 0; while (n < 50 && tries++ < 2000) { const x = ICX + (q() - 0.5) * ISW, z = ICZ + (q() - 0.5) * ISD; if (sdist(sa, x, z) < 0.4 || sdist(LP, x, z) > -0.6) continue; n++; mesh(treeG, flat(["#7FAE6A", "#6C9C5E", "#8DBA74"][n % 3]), MAP, x, 0.55, z).scale.setScalar(0.55 + q() * 0.4); } }
  // Lesotho border glow on the map
  const mapBorder = (() => { const pts = LP.map(([x, z]) => new THREE.Vector3(x, LM.dep + 0.1, z)); const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 400, 0.07, 5, true); const m = mesh(g, new THREE.MeshStandardMaterial({ color: 0xffd36e, emissive: 0xffb347, emissiveIntensity: 1.0 }), MAP, 0, 0, 0, false); m.userData.n = g.index.count; return m; })();
  // surround rings converging on Lesotho
  const RINGS = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 4, 64), new THREE.MeshBasicMaterial({ color: 0xe0863c, transparent: true, opacity: 0, fog: false })); m.rotation.x = -Math.PI / 2; m.position.set(LC[0], 0.7, LC[1]); MAP.add(m); return m; });
  const tagSA = tag(MAP, ...(() => { const p = mp(23.0, -30.6); return [p[0], 0.6, p[1]]; })(), 5.2, [{ t: "AFRIKA SELATAN", s: 0.42 }], { pole: 1.0, acc: "#E0863C", aspect: 0.26 });
  const tagLS = tag(MAP, LC[0], LM.dep + 0.2, LC[1], 4.0, [{ t: "LESOTHO", s: 0.46 }], { pole: 1.9, acc: LGREEN, aspect: 0.27 });
  const MAS = mp(27.48, -29.31);
  const tagMas = tag(MAP, MAS[0], LM.dep + 0.1, MAS[1], 2.6, [{ t: "MASERU", s: 0.34, f: "mono", c: "#5D5675" }], { pole: 0.7, acc: LAV, aspect: 0.25 });
  const dimTags = [["NAMIBIA", 18.2, -24.0], ["BOTSWANA", 24.2, -23.0], ["MOZAMBIK", 32.9, -23.0]].map(([n, lo, la]) => { const p = mp(lo, la); return tag(MAP, p[0], 0.4, p[1], 2.6, [{ t: n, s: 0.34, f: "mono", c: "#7A6F96" }], { pole: 0.6, aspect: 0.25, bg: "#F4EEF6" }); });
  // s6: old western lands, Boer arrows, 1868 dome, 1869 cut
  const ghostPts = (() => { const q = mulberry(66); const cx = LC[0] - 2.5, cz = LC[1] - 0.3; return Array.from({ length: 40 }, (_, i) => { const a = i / 40 * 6.2832; const k = 1 + 0.08 * Math.sin(3 * a + 1) + 0.05 * Math.sin(5 * a + q() * 0.3); return [cx + Math.cos(a) * 2.35 * k, cz + Math.sin(a) * 1.9 * k]; }); })();
  const ghostM = new THREE.MeshStandardMaterial({ color: new THREE.Color("#A8D08C"), flatShading: true, roughness: 0.85, transparent: true, opacity: 0.92 });
  const ghost = mesh(slabGeo(ghostPts, 0.95), ghostM, MAP);
  const ghostEdge = (() => { const pts = ghostPts.map(([x, z]) => new THREE.Vector3(x, 1.02, z)); const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 160, 0.045, 4, true); return mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }), MAP, 0, 0, 0, false); })();
  const tagGhost = tag(MAP, LC[0] - 3.2, 1.0, LC[1] - 0.2, 3.6, [{ t: "WILAYAH BARAT", s: 0.3 }, { t: "kerajaan Moshoeshoe", s: 0.2, f: "mono", w: 500, c: "#5D5675" }], { pole: 0.6, acc: LGREEN, aspect: 0.34 });
  const BOER = [-1, 0, 1].map((k) => { const G = new THREE.Group(); MAP.add(G); mesh(arrowGeo(2.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xe08a3c, flatShading: true, roughness: 0.6 }), G); G.userData.z = LC[1] - 0.2 + k * 1.5; return G; });
  const tagBoer = tag(MAP, LC[0] - 9.2, 0.6, LC[1] - 0.3, 3.4, [{ t: "PEMUKIM BOER", s: 0.4 }], { pole: 1.0, acc: "#E08A3C", aspect: 0.25 });
  const domeG = new THREE.SphereGeometry(4.6, 12, 6, 0, 6.2832, 0, Math.PI / 2);
  const dome = mesh(domeG, new THREE.MeshStandardMaterial({ color: 0x5a6cc0, transparent: true, opacity: 0.18, flatShading: true, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide }), MAP, LC[0] - 1.2, 0.5, LC[1] - 0.1, false);
  dome.scale.set(1, 0.7, 0.85);
  const domeEdge = new THREE.LineSegments(new THREE.EdgesGeometry(domeG, 1), new THREE.LineBasicMaterial({ color: 0xdfe4ff, transparent: true, opacity: 0.6 })); dome.add(domeEdge);
  const tagUK = tag(MAP, LC[0] - 1.2, 3.7, LC[1] - 0.1, 3.4, [{ t: "INGGRIS 1868", s: 0.3, f: "mono", c: LBLUE }, { t: "PERLINDUNGAN", s: 0.2, f: "mono", c: "#7A6F96", ls: 0.08 }], { pole: 0.3, acc: "#5A6CC0", aspect: 0.34 });
  // cut line: Lesotho's west border
  const cutPts = (() => { let iE = 0; LP.forEach((p, i) => { if (p[0] > LP[iE][0]) iE = i; }); const R = LP.slice(iE).concat(LP.slice(0, iE)); const run = R.filter((p) => p[0] < LC[0] - 0.25); return run.map(([x, z]) => new THREE.Vector3(x, 1.35, z)); })();
  const cutLine = (() => { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cutPts, false), 200, 0.11, 5, false); const m = mesh(g, new THREE.MeshStandardMaterial({ color: 0xd8463a, emissive: 0xc8362a, emissiveIntensity: 0.7 }), MAP, 0, 0, 0, false); m.userData.n = g.index.count; return m; })();
  const tagCut = tag(MAP, cutPts[Math.floor(cutPts.length / 2)].x - 0.3, 1.35, cutPts[Math.floor(cutPts.length / 2)].z, 3.0, [{ t: "BATAS 1869", s: 0.42, f: "mono", c: "#C8463A" }], { pole: 1.3, acc: "#C8463A", aspect: 0.26 });

  // ======================================================================================
  // ENCLAVES: three floating islands
  // ======================================================================================
  const EO = [-400, 0, 0];
  const ENC = new THREE.Group(); ENC.position.set(...EO); scene.add(ENC);
  const island = (R, host, seed) => {
    const G = new THREE.Group(); ENC.add(G);
    const top = jitter(new THREE.CylinderGeometry(R, R * 0.94, 0.6, 10, 1), R * 0.05, seed); mesh(top.toNonIndexed(), flat(host), G, 0, -0.3, 0);
    const cn = jitter(new THREE.ConeGeometry(R * 0.92, R * 1.5, 9, 3), R * 0.12, seed + 1); cn.rotateX(Math.PI); mesh(cn.toNonIndexed(), flat("#9A8FB4"), G, 0, -0.6 - R * 0.75, 0);
    const q = mulberry(seed); for (let i = 0; i < Math.round(R * 4); i++) { const a = q() * 6.28, rad = R * (0.62 + q() * 0.3); mesh(treeG, flat(["#5E9B5C", "#4F8A55", "#7FAE6A"][i % 3]), G, Math.cos(a) * rad, 0, Math.sin(a) * rad).scale.setScalar(0.5 + q() * 0.5); }
    return G;
  };
  const ITA = "#CFE0B4";
  const isV = island(2.6, ITA, 101); isV.position.set(-3.6, 1.8, 6.2);
  mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.22, 10), flat("#F3E3A0"), isV, 0, 0.11, 0);
  mesh(new THREE.SphereGeometry(0.17, 8, 4, 0, 6.28, 0, Math.PI / 2), flat("#E9E3D8"), isV, 0, 0.22, 0);
  const isS = island(3.0, ITA, 202); isS.position.set(0.8, 0.9, 1.0);
  { const g = jitter(new THREE.ConeGeometry(1.0, 1.5, 6, 2), 0.08, 3); mesh(g.toNonIndexed(), flat("#B3A8CC"), isS, 0, 0.75, 0); for (const [x, y] of [[-0.35, 1.1], [0, 1.5], [0.35, 1.1]]) { mesh(new THREE.BoxGeometry(0.12, 0.3, 0.12), flat("#EDE6DA"), isS, x, y + 0.1, 0.05); mesh(new THREE.ConeGeometry(0.1, 0.16, 4), flat("#C8463A"), isS, x, y + 0.33, 0.05); } }
  const isL = island(5.4, "#F2C9A0", 303); isL.position.set(2.8, 0, -8.5);
  {
    const sc = 0.62; const pts = LP.map(([x, z]) => [(x - LC[0]) * sc * 1.0, (z - LC[1]) * sc * 1.0]);
    // map-Lesotho is ~3.6 units wide: scale to ~5.4 on the island
    const k = 5.4 / (Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])));
    const P2 = pts.map(([x, z]) => [x * k, z * k]);
    mesh(slabGeo(P2, 0.7), flat("#86BA6C"), isL, 0, 0, 0);
    const q = mulberry(9); let n = 0, tries = 0; while (n < 9 && tries++ < 300) { const x = (q() - 0.5) * 4.4, z = (q() - 0.5) * 4.2; if (sdist(P2, x, z) < 0.5) continue; n++; const h = 0.8 + q() * 1.2; mesh(jitter(new THREE.ConeGeometry(0.5 + q() * 0.3, h, 5), 0.06, n).toNonIndexed(), flat(q() < 0.5 ? "#6CA05C" : "#9C8FB8"), isL, x, 0.72 + h / 2, z); }
  }
  const tagV = tag(isV, 0, 0.4, 0, 3.4, [{ t: "VATIKAN", s: 0.36 }, { t: "di Italia", s: 0.22, f: "mono", w: 500, c: "#5D5675" }], { pole: 1.3, acc: "#E2C35A", aspect: 0.36 });
  const tagS = tag(isS, 0, 1.9, 0, 3.6, [{ t: "SAN MARINO", s: 0.34 }, { t: "di Italia", s: 0.22, f: "mono", w: 500, c: "#5D5675" }], { pole: 0.9, acc: "#8FB4E0", aspect: 0.36 });
  const tagL = tag(isL, 0, 2.2, 0, 4.6, [{ t: "LESOTHO", s: 0.34 }, { t: "di Afrika Selatan", s: 0.2, f: "mono", w: 500, c: "#5D5675" }], { pole: 1.4, acc: LGREEN, aspect: 0.32 });

  // ======================================================================================
  // timing
  // ======================================================================================
  const tTit = A("s1:titik"), tSer1 = A("s1:seribu"), tPer1 = A("s1:permukaan");
  const tLes2 = A("s2:Lesotho"), tAf2 = A("s2:Afrika"), tSel2 = A("s2:Seluruh"), tBat2 = A("s2:perbatasannya"), tAf22 = A("s2:Afrika#2"), tKel2 = A("s2:dikelilingi"), tLes22 = A("s2:Lesotho#2");
  const tTiga3 = A("s3:tiga"), tVat = A("s3:Vatikan"), tSan = A("s3:San"), tIta = A("s3:Italia"), tLes3 = A("s3:Lesotho"), tBes = A("s3:terbesar");
  const tLuas = A("s4:Luasnya"), tKm = A("s4:kilometer"), tSel4 = A("s4:seluruh"), tSeribu4 = A("s4:seribu"), tLebih = A("s4:Lebih"), tDel = A("s4:delapan"), tSeribu42 = A("s4:seribu#2");
  const tKer5 = A("s5:Kerajaan"), tSek5 = A("s5:Sekitar"), tRaja = A("s5:Raja"), tBas5 = A("s5:Basotho"), tBaw = A("s5:membawa"), tPun = A("s5:puncak"), tSer5 = A("s5:serangan");
  const tPem = A("s6:Pemukim"), tDes = A("s6:mendesak"), t1868 = A("s6:1868"), tPerl = A("s6:perlindungan"), tSet = A("s6:Setahun"), tPerj = A("s6:perjanjian"), tMot = A("s6:memotong"), tSep = A("s6:separuh");
  const tEmp = A("s7:Empat"), tMer = A("s7:merdeka"), tKini = A("s7:Kini"), tAir = A("s7:air"), tSel7 = A("s7:selimut");
  const tKer8 = A("s8:Kerajaan"), tAwan = A("s8:awan"), tTen = A("s8:tengah"), tMen = A("s8:Menurut"), tAud = A("s8:AUDIRA");
  const CUT = (s) => K[s] - 0.1;

  // ---------- camera: segments of [t, cx, cy, cz, tx, ty, tz] (world) ----------
  const W = (o, p) => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
  const ck = (t, c, g) => [t, ...c, ...g];
  const P0 = [0, 0, 0];
  const lowW = [LOW[0], Y(1400), LOW[1]];
  const rW = [RUL[0], 0, RUL[2]];
  const MZ = [MESA[0], MTOP, MESA[1]];
  const fW = [FLAG[0], fGround, FLAG[1]], dW = [DAM[0], dFloor, DAM[1]], bW = [BAN[0], bGround, BAN[1]];
  const LCm = W(MO, [LC[0], 1.0, LC[1]]);
  const off = (b, x, y, z) => [b[0] + x, b[1] + y, b[2] + z];
  const C7 = [(fW[0] + dW[0] + bW[0]) / 3, Math.max(fW[1], dW[1], bW[1]), (fW[2] + dW[2] + bW[2]) / 3];
  const SEG = [
    [0, "P", [
      ck(0, off(rW, -15.0, 7.6, 36), off(rW, 9.5, 10.2, -14)),
      ck(tSer1, off(rW, -14.2, 7.8, 34.5), off(rW, 9.7, 10.2, -14)),
      ck(K.s2 - 0.1, off(rW, -13.2, 8.2, 33), off(rW, 9.9, 10.3, -14)),
    ]],
    [CUT("s2"), "M", [
      ck(CUT("s2"), off(LCm, 0, 16, 13), LCm),
      ck(tLes2 + 0.4, off(LCm, 0, 19, 15), LCm),
      ck(tAf2 + 0.8, W(MO, [ICX + 1.2, 50, ICZ + 36]), W(MO, [ICX + 1.4, 0, ICZ + 1.2])),
      ck(tBat2, W(MO, [ICX + 1.6, 46, ICZ + 33]), W(MO, [ICX + 2.2, 0, ICZ + 1.0])),
      ck(tKel2 - 0.2, off(LCm, -0.5, 30, 24), off(LCm, -0.6, -0.6, 0.6)),
      ck(K.s3, off(LCm, -0.5, 28, 22.5), off(LCm, -0.6, -0.6, 0.6)),
    ]],
    [CUT("s3"), "E", [
      ck(CUT("s3"), W(EO, [-0.5, 15, 27]), W(EO, [0.2, 0.6, -0.8])),
      ck(tVat - 0.2, W(EO, [-3.0, 15, 29]), W(EO, [-1.6, 3.6, 0.5])),
      ck(tIta + 0.3, W(EO, [-1.0, 15, 28.5]), W(EO, [0.0, 3.6, 0.0])),
      ck(tLes3 + 0.9, W(EO, [1.8, 20, 31]), W(EO, [1.8, 5.6, -4.5])),
      ck(K.s4, W(EO, [2.2, 21, 33]), W(EO, [1.8, 5.6, -4.8])),
    ]],
    [CUT("s4"), "P", [
      ck(CUT("s4"), [1, 66, 40], [0, 6, -1.5]),
      ck(tKm, [-2, 60, 42], [-0.5, 6.5, -1.5]),
      ck(tSel4 + 0.2, [-10, 36, 44], [-2, 7, -1]),
      ck(tSeribu4 + 0.2, off(rW, -12, 12, 31), [-4, 8.6, -1]),
      ck(tDel, off(rW, -11, 13, 30), [-3.5, 9.0, -1.5]),
      ck(K.s5, off(rW, -6, 13, 27), [-3, 8, -2]),
      ck(tSek5, off(MZ, 6, 9, 22), off(MZ, 0, 0.6, 0)),
      ck(tRaja, off(MZ, 4.0, 4.6, 13.0), off(MZ, -0.2, 1.3, 0.6)),
      ck(tBaw, off(MZ, 2.2, 4.6, 12.8), off(MZ, -0.2, 1.2, 0.4)),
      ck(tSer5 - 0.4, off(MZ, -6.5, 5.0, 13.5), off(MZ, -2.0, 0.4, 0.2)),
      ck(K.s6, off(MZ, -8.0, 5.6, 13.5), off(MZ, -2.4, 0.3, 0.2)),
    ]],
    [CUT("s6"), "M", [
      ck(CUT("s6"), off(LCm, -4.5, 25, 22), off(LCm, -3.4, 2.4, -1.0)),
      ck(t1868, off(LCm, -3.5, 24, 21), off(LCm, -2.6, 2.6, -1.0)),
      ck(tPerj, off(LCm, -3.0, 22, 19.5), off(LCm, -2.0, 2.6, -1.0)),
      ck(K.s7, off(LCm, -3.0, 21, 19), off(LCm, -2.0, 2.6, -1.0)),
    ]],
    [CUT("s7"), "P", [
      ck(CUT("s7"), off(fW, 4.0, 5.0, 15.5), off(fW, 0.6, 3.2, 0)),
      ck(tMer + 0.6, off(fW, 3.0, 5.4, 14.5), off(fW, 0.7, 3.3, 0)),
      ck(tKini, off(fW, 3.4, 6.0, 16.0), off(fW, 0.7, 3.0, 0)),
      ck(tAir - 0.1, off(C7, 1.0, 31, 29), off(C7, 0, 2.6, 0.6)),
      ck(tSel7 + 0.3, off(C7, 0.5, 30, 28), off(C7, 0, 2.6, 0.6)),
      ck(K.s8 + 0.2, off(C7, 0.0, 29.5, 27.5), off(C7, 0, 2.7, 0.6)),
      ck(tTen, off(rW, -15.0, 8.2, 36), off(rW, 9.5, 10.2, -14)),
      ck(K.dur, off(rW, -17.0, 8.8, 40), off(rW, 9.5, 10.4, -14)),
    ]],
  ];
  const SEGT = SEG.map(([t0, st, keys]) => [t0, st, track(keys)]);
  const tgt = new THREE.Vector3();

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Space Grotesk"`) && document.fonts.check(`500 40px "JetBrains Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const cv = tx.image, g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height); paint(g, cv.width, cv.height); tx.needsUpdate = true; }
    }
    let si = 0; while (si + 1 < SEGT.length && t >= SEGT[si + 1][0]) si++;
    const st = SEGT[si][1], k = SEGT[si][2](t);
    cam.position.set(k[0], k[1], k[2]); tgt.set(k[3], k[4], k[5]); cam.lookAt(tgt);
    PEAK.visible = st === "P"; MAP.visible = st === "M"; ENC.visible = st === "E";
    SEA.position.set(st === "M" ? MO[0] : st === "E" ? EO[0] : 0, st === "P" ? 3.5 : st === "M" ? -8.5 : -7.5, 0);
    // sun follows the view target
    const dist = cam.position.distanceTo(tgt), ext = Math.min(60, Math.max(8, dist * 0.75));
    sun.target.position.copy(tgt); sun.position.copy(tgt).addScaledVector(SUNDIR, 120);
    Object.assign(sun.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext }); sun.shadow.camera.updateProjectionMatrix();
    fill.target.position.copy(tgt); fill.position.copy(tgt).add(new THREE.Vector3(-60, 20, 40));
    for (const b of billboards) b.quaternion.copy(cam.quaternion);
    { const cr = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion); cr.y = 0; cr.normalize(); for (const T of [tag1000, tag1400, tag1800]) { T.position.x = cr.x * 1.5; T.position.z = cr.z * 1.5; T.userData.pl.position.y = T === tag1400 ? 0.6 : T === tag1000 ? 1.0 : 0.3; T.userData.pl.material.depthTest = false; } }

    // ---- clouds drift ----
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V3 = new THREE.Vector3(), S3 = new THREE.Vector3();
    if (st === "P") {
      CL.forEach((c, i) => { V3.set(c.x + Math.sin(t * c.sp + c.ph) * 0.8, c.y + Math.sin(t * 0.3 + c.ph) * 0.08, c.z + Math.cos(t * c.sp * 0.7 + c.ph) * 0.5); Q.setFromAxisAngle(V3.clone().set(0, 1, 0), c.ph); S3.set(c.s, c.s * c.sy, c.s * 0.9); M4.compose(V3, Q, S3); cloudI.setMatrixAt(i, M4); });
      cloudI.instanceMatrix.needsUpdate = true;
    }
    SEAPUFF.forEach((c, i) => { V3.set(c.x + Math.sin(t * c.sp + c.ph) * 1.2, 0.6, c.z); Q.setFromAxisAngle(V3.clone().set(0, 1, 0), c.ph); S3.set(c.s, c.s * c.sy, c.s * 0.9); M4.compose(V3, Q, S3); seaI.setMatrixAt(i, M4); });
    seaI.instanceMatrix.needsUpdate = true;

    // ---- PEAKS ----
    if (st === "P") {
      // hook: crystal drops onto the lowest point, dashed 1.400 m line draws to it
      const uC = eout(clamp01((t - tTit + 0.6) / 0.7));
      crystal.position.y = Y(1400) + 1.4 + 4 * (1 - uC); crystal.rotation.y = t * 0.8; crystal.visible = uC > 0.01 || t > 1;
      crystal.material.emissiveIntensity = 0.45 + 0.6 * pump(t, tSer1 - 0.1, 0.15, 1.2) + 0.35 * win(t, tSel4, tSeribu4 + 0.4);
      beam.visible = uC > 0.95; beam.material.opacity = 0.75;
      const uD = clamp01((t - 0.3) / 1.6); DASH.forEach((d, i) => { d.visible = i / DASH.length <= uD || t > K.s2; });
      scaleIn(tag1400, (t < K.s2 || (t >= K.s4 && t < tSeribu4 - 0.3) || t >= K.s8) ? 1 : 0);
      // sheets + tint
      sh1400.material.opacity = Math.max(win(t, -1, K.s2 - 0.5) * 0.85, 0) * (t < K.s2 ? 1 : 0);
      const u1000 = t >= K.s4 ? win(t, tSeribu4 - 0.3, tDel - 0.1, 0.5) : 0;
      const u1800 = t >= K.s4 ? win(t, tDel - 0.2, K.s5 + 1.0, 0.6) : 0;
      sh1000.material.opacity = u1000; sh1800.material.opacity = u1800;
      sh1800.position.y = Y(1000) + (Y(1800) - Y(1000)) * smooth(clamp01((t - tDel + 0.2) / 1.6));
      if (u1800 > u1000) { tintU.uLv.value = sh1800.position.y; tintU.uTc.value.set("#FFD36E"); tintU.uTa.value = u1800; }
      else { tintU.uLv.value = Y(1000); tintU.uTc.value.set("#9AF0C8"); tintU.uTa.value = u1000; }
      scaleIn(tag1000, pop(t, tSeribu4 - 0.2) * (t < K.s5 + 0.8 ? 1 : 0));
      scaleIn(tag1800, pop(t, tDel + 0.4) * (t < K.s5 + 0.8 ? 1 : 0));
      // border draws during the area count
      const ub = t >= K.s4 ? clamp01((t - tLuas + 0.2) / 2.0) : 0;
      const ubOut = 1 - smooth(clamp01((t - tSeribu4 - 0.6) / 0.6));
      border.visible = ub > 0 && ubOut > 0.01; border.geometry.setDrawRange(0, Math.floor(border.userData.n * ub / 3) * 3); border.material.emissiveIntensity = 0.9 * ubOut;
      // mesa: figures, king tag, attack arrows
      scaleIn(kingTag, 0); // name card lives in the HTML panel
      FIG.forEach((p, i) => { const u = back(clamp01((t - (tBas5 - 0.3 + i * 0.08)) / 0.35), 1.6); const base = t < K.s5 ? 1 : u; p.scale.setScalar(Math.max(0.001, 0.95 * base)); p.position.y = MTOP + 0.04 * Math.abs(Math.sin(t * 3 + i)) * (t > tBaw ? 1 : 0); });
      ATK.forEach((G) => { const a = G.userData.a, u = eout(clamp01((t - tSer5 + 0.3 - G.userData.i * 0.12) / 0.8)), f = 1 - smooth(clamp01((t - tSer5 - 1.2) / 0.5)); const rad = 7.2 - 2.6 * u; G.position.set(Math.cos(a) * rad, mGround - MTOP + MTOP - 1.4 + 0.3, Math.sin(a) * rad); G.position.y = mGround - 0.2; G.rotation.y = -(a + Math.PI); G.visible = u > 0 && f > 0.01 && t < K.s6; atkM.opacity = f; });
      // flag rises, dam fills, blanket unrolls
      const uF = smooth(clamp01((t - tEmp) / Math.max(0.8, tMer - tEmp + 0.3)));
      const show7 = t >= CUT("s7") ? 1 : 0;
      flagMesh.position.y = 0.9 + 2.95 * uF; flagMesh.visible = !!show7;
      { const p = flG.attributes.position; for (let i = 0; i < p.count; i++) { const x = flBase[i * 3], y = flBase[i * 3 + 1]; p.setZ(i, Math.sin(x * 3.2 - t * 5.0 + y * 0.6) * 0.09 * (x / 1.95)); p.setY(i, y - 0.04 * (x / 1.95) * (x / 1.95)); } p.needsUpdate = true; }
      scaleIn(flagTag, 0); // date lives in the HTML panel
      const uW = t >= CUT("s7") ? 0.6 + 0.4 * smooth(clamp01((t - tAir + 0.3) / 1.8)) : 0;
      const level = dFloor - 0.6 + 1.9 * uW;
      { const p = watG.attributes.position; for (let i = 0; i < p.count; i++) { const x = watBase[i * 3], z = watBase[i * 3 + 2]; p.setY(i, Math.sin(x * 1.3 + t * 1.4) * 0.05 + Math.cos(z * 1.6 - t * 1.1) * 0.05); } p.needsUpdate = true; }
      water.position.y = level;
      const uB = t >= CUT("s7") ? smooth(clamp01((t - tSel7 + 0.4) / 1.1)) : 0;
      blanket.scale.y = Math.max(0.001, uB); blanket.visible = uB > 0.01; roll.position.y = 3.0 - 2.2 * uB; roll.visible = uB < 0.98;
      { const p = blG.attributes.position; for (let i = 0; i < p.count; i++) { const x = blBase[i * 3], y = blBase[i * 3 + 1]; p.setZ(i, Math.sin(x * 1.8 + t * 1.6) * 0.06 * (-y / 2.2)); } p.needsUpdate = true; }
      BFIG.forEach((p, i) => { p.rotation.z = Math.sin(t * 2 + i) * 0.03; });
      // AUDIRA banner waves; glints when the narrator says the name
      { const p = audG.attributes.position; for (let i = 0; i < p.count; i++) { const x = audBase[i * 3]; p.setZ(i, Math.sin(x * 2.4 - t * 3.2) * 0.07 * (x / 3)); } p.needsUpdate = true; }
      audM.emissive = audM.emissive || new THREE.Color(); audM.emissive.setRGB(0.25, 0.32, 0.1); audM.emissiveIntensity = 0.6 * pump(t, tAud - 0.1, 0.2, 1.4);
      void tPer1; void tLebih; void tSeribu42; void tPun; void tKer5; void tKer8; void tAwan; void tMen; void tKini;
    }
    // ---- MAP ----
    if (st === "M") {
      const s6 = t >= CUT("s6");
      const uL = s6 ? 1 : smooth(clamp01((t - tLes2 + 0.2) / 0.8));
      LM.m.scale.y = 0.45 + 0.55 * uL; MPK.scale.y = Math.max(0.01, uL); MPK.position.y = (0.45 + 0.55 * uL - 1) * LM.dep;
      scaleIn(tagLS, s6 ? 0 : pop(t, tLes2 - 0.05));
      scaleIn(tagMas, s6 ? 0 : pop(t, tAf2 + 0.6));
      scaleIn(tagSA, s6 ? 0 : pop(t, tAf2 - 0.05));
      dimTags.forEach((d, i) => scaleIn(d, s6 ? 0 : pop(t, tAf2 + 0.3 + i * 0.12) * 0.85));
      const ub = s6 ? 1 : clamp01((t - tBat2 + 0.1) / 1.4);
      mapBorder.visible = ub > 0; mapBorder.geometry.setDrawRange(0, Math.floor(mapBorder.userData.n * ub / 3) * 3);
      mapBorder.material.emissiveIntensity = 0.8 + 0.8 * pump(t, tKel2, 0.2, 1.4);
      const sa = COUNTRY["South Africa"].m.material; sa.emissiveIntensity = s6 ? 0 : 0.35 * pump(t, tAf22 - 0.05, 0.2, 1.6) + 0.25 * pump(t, tKel2 - 0.1, 0.2, 1.4);
      RINGS.forEach((R, i) => { const a = tKel2 - 0.5 + i * 0.35; const u = clamp01((t - a) / 1.4); const rad = 11 - 8.6 * eout(u); R.scale.setScalar(rad); R.material.opacity = s6 ? 0 : (u > 0 && u < 1 ? Math.sin(Math.PI * u) * 0.9 : 0); });
      // s6
      const uG = s6 ? smooth(clamp01((t - CUT("s6") - 0.1) / 0.6)) : 0;
      const uCut = s6 ? clamp01((t - tPerj + 0.1) / Math.max(0.6, tMot - tPerj + 0.2)) : 0;
      const uLose = s6 ? smooth(clamp01((t - tMot - 0.2) / 1.0)) : 0;
      ghost.visible = ghostEdge.visible = uG > 0.01;
      ghost.scale.y = Math.max(0.01, uG * (1 - 0.45 * uLose));
      ghostM.color.set("#A8D08C").lerp(new THREE.Color("#F2C9A0"), uLose);
      ghostEdge.material.opacity = 0.9 * (1 - uLose); ghostEdge.position.y = -0.4 * uLose;
      scaleIn(tagGhost, s6 ? pop(t, CUT("s6") + 0.25) * (1 - smooth(clamp01((t - tPerj) / 0.4))) : 0);
      BOER.forEach((G, i) => { const u = eout(clamp01((t - tPem + 0.1 - i * 0.12) / Math.max(1.2, tDes - tPem + 0.6))); const f = 1 - smooth(clamp01((t - tPerl - 0.2) / 0.5)); G.position.set(LC[0] - 10 + 4.6 * u + 0.25 * Math.sin(t * 3 + i) * (u > 0.98 ? 1 : 0), 0.62, G.userData.z); G.visible = s6 && u > 0 && f > 0.01; G.scale.setScalar(Math.max(0.001, f)); });
      scaleIn(tagBoer, s6 ? pop(t, tPem) * (1 - smooth(clamp01((t - tPerl - 0.2) / 0.4))) : 0);
      const uDome = s6 ? pop(t, tPerl - 0.25, 0.6) * (1 - smooth(clamp01((t - tSet - 0.6) / 0.6))) : 0;
      dome.visible = uDome > 0.01; dome.scale.set(uDome, 0.7 * uDome, 0.85 * uDome);
      scaleIn(tagUK, 0); // 1868 lives in the HTML panel
      cutLine.visible = uCut > 0; cutLine.geometry.setDrawRange(0, Math.floor(cutLine.userData.n * uCut / 3) * 3);
      cutLine.material.emissiveIntensity = 0.7 + 0.9 * pump(t, tMot, 0.15, 1.0);
      scaleIn(tagCut, s6 ? pop(t, tPerj + 0.3) : 0);
      void tSep;
    }
    // ---- ENCLAVES ----
    if (st === "E") {
      const isls = [[isV, tTiga3 - 0.2, tVat - 0.1, tagV], [isS, tTiga3 + 0.05, tSan - 0.1, tagS], [isL, tTiga3 + 0.3, tLes3 - 0.1, tagL]];
      isls.forEach(([G, a, b, T], i) => { const u = pop(t, a, 0.6); G.scale.setScalar(Math.max(0.001, u)); G.visible = u > 0.002; G.position.y = [1.8, 0.9, 0][i] + Math.sin(t * 0.7 + i * 2) * 0.12; scaleIn(T, pop(t, a + 0.35)); void b; });
      tagL.userData.pl.scale.setScalar(1 + 0.12 * pump(t, tBes - 0.1, 0.2, 1.2));
    }
    void tSel2; void tLes22;
    comp.render();
  };
}
