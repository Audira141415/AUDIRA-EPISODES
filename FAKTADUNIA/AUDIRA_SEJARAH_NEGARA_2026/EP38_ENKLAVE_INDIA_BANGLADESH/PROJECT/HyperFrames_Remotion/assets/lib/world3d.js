// EP38 ENKLAVE INDIA–BANGLADESH: SULAMFORGE. One big kantha cloth (24 x 44 units) stretched in a beech frame, leaning
// back, in front of a plum songket backdrop. Cloth-local coordinates: u right, v up, h out of the cloth.
// Every border is a row of raised running stitches (instanced ellipsoids) that catch a low grazing key light.
// Regions on the cloth:
//   NEST   (-3.2, 12.5)  4 nested appliqué patches: BANGLADESH > INDIA > BANGLADESH > INDIA (Dahala Khagrabari)
//                        with a football pitch stitched inside the innermost one, CHITMAHAL tag, gold count tags 102 / 21 / 1
//   KONON  ( 7.2, 13)    two playing cards, a chess king, a red-bordered KONON tag, brass plaque PERJANJIAN 1713, a loose thread
//   1947   ( 0, -3.5)    India (saffron) above / Pakistan Timur (green) below a red stitched line, 111 + 51 trapped patches
//   DESA   (-5.5, -15.8) village patch, three enclaves with appliqué houses, gold tag 51.549 orang (2010)
//   JAM    ( 6, -16)     embroidered clock that spins to midnight, tag 31 JULI 2015 · 00.00
//   AUDIRA woven maker's label on the right edge of the cloth, plus a small gold AUDIRA signature in the nest
// Everything is a function of t.

const FONTS = ['600 80px "Fraunces"', '700 80px "Fraunces"', 'italic 600 80px "Fraunces"', '500 80px "IBM Plex Mono"', '600 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "INDIA BANGLADESH 1713 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage } from "./lib3d.js";

const FR = '"Fraunces", Georgia, serif', MONO = '"IBM Plex Mono", Consolas, monospace';
const ENV = 0.25;
const SAF = "#FF9933", IGR = "#138808", BGR = "#006A4E", BRED = "#F42A41", GOLD = "#D4A63A", NAVY = "#14206B", PLUM = "#3A1626";
// fabric colours (appliqué cloth), thread colours (stitches)
const F_IN = "#F29A3A", F_BD = "#1E7656", F_IN_LT = "#F3B46E", F_BD_LT = "#2F8462", F_RAW = "#E6D8BA";

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
const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const shade = (h, k) => { const [r, g, b] = hexRgb(h); const f = (x) => Math.max(0, Math.min(255, Math.round(k > 0 ? x + (255 - x) * k : x * (1 + k)))); return `rgb(${f(r)},${f(g)},${f(b)})`; };

// ---------- canvas painters ----------
// plain woven cloth: warp + weft threads with a little slub
function weave(g, w, h, seed, base, cell = 4) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed);
  for (let x = 0; x < w; x += cell) { g.fillStyle = `rgba(${q() < 0.5 ? "255,250,240" : "90,60,30"},${0.05 + q() * 0.07})`; g.fillRect(x, 0, cell * 0.55, h); }
  for (let y = 0; y < h; y += cell) { g.fillStyle = `rgba(${q() < 0.5 ? "255,250,240" : "90,60,30"},${0.05 + q() * 0.07})`; g.fillRect(0, y, w, cell * 0.55); }
  for (let y = 0; y < h; y += cell) for (let x = (y / cell) % 2 ? 0 : cell; x < w; x += cell * 2) { g.fillStyle = "rgba(60,40,20,.07)"; g.fillRect(x, y, cell, cell); }
}
// satin-stitched lettering: text filled with diagonal thread lines, split-stitch outline, soft drop shadow
function stitchText(g, txt, x, y, font, col, o = {}) {
  const W = g.canvas.width, H = g.canvas.height;
  const c = document.createElement("canvas"); c.width = W; c.height = H; const m = c.getContext("2d");
  const sz = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]);
  m.font = font; m.textAlign = o.align || "center"; m.textBaseline = "alphabetic";
  if (o.ls) m.letterSpacing = o.ls + "px";
  m.fillStyle = col; m.fillText(txt, x, y);
  m.globalCompositeOperation = "source-atop";
  const sp = Math.max(2.2, sz * 0.055);
  m.lineWidth = sp * 0.5;
  for (let i = -H, k = 0; i < W + H; i += sp, k++) {
    m.strokeStyle = k % 2 ? shade(col, 0.28) : shade(col, -0.22);
    m.beginPath(); m.moveTo(i, 0); m.lineTo(i + H * 0.35, H); m.stroke();
  }
  m.globalCompositeOperation = "source-over";
  m.strokeStyle = shade(col, -0.45); m.lineWidth = Math.max(1, sz * 0.022); m.setLineDash([sz * 0.07, sz * 0.03]); m.strokeText(txt, x, y);
  g.save(); g.shadowColor = "rgba(40,22,8,.5)"; g.shadowBlur = sz * 0.05; g.shadowOffsetY = sz * 0.035; g.drawImage(c, 0, 0); g.restore();
}
// fabric tag base: twill, dashed running-stitch border
function tagBase(g, w, h, bg, border, seed = 3) {
  weave(g, w, h, seed, bg, Math.max(3, Math.round(h / 60)));
  const m = Math.min(w, h) * 0.09;
  g.strokeStyle = border; g.lineWidth = Math.max(3, h * 0.035); g.setLineDash([h * 0.09, h * 0.055]); g.lineCap = "round";
  g.strokeRect(m, m, w - 2 * m, h - 2 * m); g.setLineDash([]);
}
function flagIN(g, x, y, w, h) {
  const b = h / 3;
  g.fillStyle = SAF; g.fillRect(x, y, w, b); g.fillStyle = "#FBF7EE"; g.fillRect(x, y + b, w, b); g.fillStyle = IGR; g.fillRect(x, y + 2 * b, w, b);
  const cx = x + w / 2, cy = y + 1.5 * b, r = b * 0.42;
  g.strokeStyle = "#000080"; g.lineWidth = Math.max(1, r * 0.12); g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.stroke();
  g.lineWidth = Math.max(0.6, r * 0.05);
  for (let k = 0; k < 24; k++) { const a = k / 24 * 6.2832; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
  g.fillStyle = "#000080"; g.beginPath(); g.arc(cx, cy, r * 0.18, 0, 6.2832); g.fill();
  threadOver(g, x, y, w, h);
}
function flagBD(g, x, y, w, h) {
  g.fillStyle = BGR; g.fillRect(x, y, w, h);
  g.fillStyle = BRED; g.beginPath(); g.arc(x + w * 0.45, y + h / 2, w * 0.2, 0, 6.2832); g.fill();
  threadOver(g, x, y, w, h);
}
function threadOver(g, x, y, w, h) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let yy = y; yy < y + h; yy += 3) { g.fillStyle = `rgba(${(yy / 3) % 2 ? "255,255,255,.10" : "0,0,0,.10"})`; g.fillRect(x, yy, w, 1.5); }
  g.restore();
  g.strokeStyle = "rgba(40,25,10,.55)"; g.lineWidth = 2; g.strokeRect(x, y, w, h);
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x1a0d13, exp: 0.9, bloom: [0.07, 0.4, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.9;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  bp.threshold = 0.96; bp.strength = 0.06; bp.radius = 0.4;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#3A1A27"); gr.addColorStop(1, "#140910"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  const pm = new THREE.PMREMGenerator(r);
  const envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = ENV; // r186: scene.environment ignores material.envMapIntensity; metals get envTex directly below

  // the cloth group: leaning back so the grazing light rakes across it
  const C = new THREE.Group(); C.rotation.x = -0.26; scene.add(C); C.updateMatrixWorld(true);
  const W2L = (u, v, h, out = new THREE.Vector3()) => out.set(u, v, h).applyMatrix4(C.matrixWorld);

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xfff0dc, 0x3a2016, 0.35); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe2b8, 2.3);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 140 });
  key.shadow.bias = -0.0002; key.shadow.normalBias = 0.012; key.shadow.radius = 3;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xbcc8ff, 0.2); fill.position.set(40, 10, 60); scene.add(fill);
  const KEYDIR = new THREE.Vector3(-0.83, 0.36, 0.42).normalize();

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const sh = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; return m; };
  const weaveT = canvasTex(512, 512, (g, w, h) => weave(g, w, h, 11, "#F5F0E6", 6), [1, 1]); weaveT.repeat.set(1 / 0.55, 1 / 0.55);
  const bumpT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
    const c = 8;
    for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) {
      const over = ((x + y) / c) % 2;
      const gr = over ? g.createLinearGradient(x, 0, x + c, 0) : g.createLinearGradient(0, y, 0, y + c);
      gr.addColorStop(0, "#5a5a5a"); gr.addColorStop(0.5, "#d0d0d0"); gr.addColorStop(1, "#5a5a5a");
      g.fillStyle = gr; g.fillRect(x, y, c, c);
    }
  }, [1, 1]); bumpT.colorSpace = THREE.NoColorSpace; bumpT.repeat.set(1 / 0.55, 1 / 0.55);
  const fab = (col, o = {}) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(col), map: o.map === undefined ? weaveT : o.map, bumpMap: bumpT, bumpScale: o.bump ?? 1.2, roughness: 0.9, sheen: 0.22, sheenRoughness: 0.55, sheenColor: new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.45), envMapIntensity: ENV, emissive: new THREE.Color(col), emissiveIntensity: 0 });
  const goldM = new THREE.MeshStandardMaterial({ color: 0xd8ad45, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.3 });
  const brassM = new THREE.MeshStandardMaterial({ color: 0x9a6a2a, metalness: 0.85, roughness: 0.4, envMapIntensity: 0.3 });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(30,15,5,.6)"); gr.addColorStop(0.6, "rgba(30,15,5,.25)"); gr.addColorStop(1, "rgba(30,15,5,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const aoBlob = (u, v, w, h, o = 0.5, hz = 0.004, p = C) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.position.set(u, v, hz); m.renderOrder = 1; p.add(m); return m; };
  const roundRect = (w, h, rr) => { const s = new THREE.Shape(), a = w / 2, b = h / 2; s.moveTo(-a + rr, -b); s.lineTo(a - rr, -b); s.quadraticCurveTo(a, -b, a, -b + rr); s.lineTo(a, b - rr); s.quadraticCurveTo(a, b, a - rr, b); s.lineTo(-a + rr, b); s.quadraticCurveTo(-a, b, -a, b - rr); s.lineTo(-a, -b + rr); s.quadraticCurveTo(-a, -b, -a + rr, -b); return s; };
  const slab = (w, h, d, rr = 0.03, bev = 0.01) => new THREE.ExtrudeGeometry(roundRect(w, h, rr), { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 4 });
  // a fabric tag lying on the cloth: thin bevelled body + canvas face (map + bump). Returns its group.
  const tag = (w, h, paint, u, v, hz = 0.0, o = {}) => {
    const G = new THREE.Group(); G.position.set(u, v, hz); G.rotation.z = o.rot || 0; (o.p || C).add(G);
    const pxu = Math.min(o.pxu || 300, 2048 / w);
    const tx = label(Math.round(w * pxu), Math.round(h * pxu), paint);
    G.add(sh(new THREE.Mesh(slab(w, h, 0.03, Math.min(w, h) * 0.08), o.bodyM || fab(o.body || "#EDE0C4", { bump: 0.6 }))));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.985, h * 0.97), new THREE.MeshPhysicalMaterial({ map: tx, bumpMap: tx, bumpScale: 1.4, roughness: 0.85, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff), envMapIntensity: ENV, transparent: !!o.fade }));
    face.position.z = 0.042; face.receiveShadow = true; G.add(face);
    if (o.ao !== false) aoBlob(0, -0.04, w * 1.25, h * 1.5, 0.35, -hz + 0.004, G);
    G.userData.face = face;
    return G;
  };
  // gold satin lettering as its own metallic cut-out plane
  const goldText = (txt, font, w, h, p, x = 0, y = 0, z = 0.05) => {
    const tx = label(Math.round(w * 300), Math.round(h * 300), (g, cw, ch) => { g.clearRect(0, 0, cw, ch); stitchText(g, txt, cw / 2, ch * 0.78, font.replace("$", Math.round(ch * 0.72)), GOLD); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, alphaTest: 0.35, metalness: 0.75, roughness: 0.32, bumpMap: tx, bumpScale: 1.6, envMapIntensity: 1.4 }));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
  };
  const scaleIn = (G, u, base = 1) => { const s = Math.max(0.001, base * u); G.scale.set(s, s, s); G.visible = u > 0.002; };

  // ---------- stitches: one instanced mesh per thread kind ----------
  const sph = new THREE.SphereGeometry(1, 12, 7);
  const silkM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.45, sheen: 0.6, sheenRoughness: 0.35, sheenColor: new THREE.Color(0xffffff), clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: ENV * 1.5 });
  const goldThM = new THREE.MeshStandardMaterial({ color: 0xd9ae48, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.4 });
  const mkSet = (mat, max) => { const m = new THREE.InstancedMesh(sph, mat, max); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; C.add(m); return { m, it: [] }; };
  const SILK = mkSet(silkM, 16000), GOLDS = mkSet(goldThM, 3000);
  const PULSE = new Float32Array(16);
  // sew a running stitch along a polyline (absolute cloth coords)
  const sew = (S, pts, o = {}) => {
    const P = o.closed === false ? pts.slice() : [...pts, pts[0]];
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const tot = cum[cum.length - 1];
    const at = (s) => { let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f]; };
    const sl = o.sl ?? 0.16, gap = o.gap ?? 0.08, rr = o.r ?? 0.026, q = mulberry(o.seed || 7);
    const c0 = new THREE.Color(o.col || "#ffffff"), c1 = o.c1 ? new THREE.Color(o.c1) : null;
    const first = S.it.length;
    for (let s = (o.off ?? 0) * (sl + gap); s + sl * 0.6 < tot; s += sl + gap) {
      if (o.skip && o.skip(s / tot, q)) continue;
      let a = at(s), b = at(Math.min(tot, s + sl));
      if (o.jit) { a = [a[0] + (q() - 0.5) * o.jit, a[1] + (q() - 0.5) * o.jit]; b = [b[0] + (q() - 0.5) * o.jit, b[1] + (q() - 0.5) * o.jit]; }
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1e-4) continue;
      const f = s / tot;
      S.it.push({ x: a[0], y: a[1], dx: (b[0] - a[0]) / L, dy: (b[1] - a[1]) / L, L, r: rr, h: (o.h ?? 0) + rr * 0.55,
        t0: (o.t0 ?? -10) + (o.dur ?? 0) * f, gt: o.gt ?? 0.1, t1: o.t1 === undefined ? null : o.t1 + (o.t1dur ?? 0) * (o.t1order ? o.t1order(f, q) : f),
        c0, c1, tc: o.tc === undefined ? null : o.tc + (o.tcdur ?? 0) * f, g: o.g ?? 0 });
    }
    return [first, S.it.length];
  };
  const mtx = new THREE.Matrix4(), qz = new THREE.Quaternion(), vz = new THREE.Vector3(0, 0, 1), vp = new THREE.Vector3(), vs = new THREE.Vector3(), cTmp = new THREE.Color();
  const updSet = (S, t) => {
    const its = S.it;
    for (let i = 0; i < its.length; i++) {
      const o = its[i];
      let s = clamp01((t - o.t0) / o.gt);
      if (o.t1 !== null) s *= 1 - clamp01((t - o.t1) / 0.18);
      const pu = 1 + 0.45 * PULSE[o.g];
      if (s <= 0.001) { vs.set(0.0001, 0.0001, 0.0001); vp.set(o.x, o.y, -1); }
      else { const L = o.L * s; vp.set(o.x + o.dx * L / 2, o.y + o.dy * L / 2, o.h * pu); vs.set(L / 2, o.r * 0.78 * pu, o.r * 0.6 * pu); }
      qz.setFromAxisAngle(vz, Math.atan2(o.dy, o.dx));
      mtx.compose(vp, qz, vs); S.m.setMatrixAt(i, mtx);
      if (o.c1 && o.tc !== null) { cTmp.copy(o.c0).lerp(o.c1, smooth(clamp01((t - o.tc) / 0.3))); S.m.setColorAt(i, cTmp); }
      else if (PULSE[o.g] > 0.001) { cTmp.copy(o.c0).lerp(new THREE.Color(1, 1, 0.9), 0.25 * PULSE[o.g]); S.m.setColorAt(i, cTmp); }
      else if (o.pulsed) { S.m.setColorAt(i, o.c0); }
      o.pulsed = PULSE[o.g] > 0.001;
    }
    S.m.instanceMatrix.needsUpdate = true; if (S.m.instanceColor) S.m.instanceColor.needsUpdate = true;
  };
  // organic enclave outline, relative to its own centre
  const blobPts = (R, seed, n = 120, wob = 0.06, asp = 1) => {
    const q = mulberry(seed), ph = [q() * 6.28, q() * 6.28, q() * 6.28, q() * 6.28];
    return Array.from({ length: n }, (_, i) => { const a = i / n * 6.2832; const k = 1 + wob * (0.55 * Math.sin(2 * a + ph[0]) + 0.3 * Math.sin(3 * a + ph[1]) + 0.18 * Math.sin(5 * a + ph[2]) + 0.1 * Math.sin(7 * a + ph[3])); return [Math.cos(a) * R * k * asp, Math.sin(a) * R * k]; });
  };
  const absP = (pts, cx, cy, f = 1) => pts.map(([x, y]) => [cx + x * f, cy + y * f]);
  const patch = (pts, cx, cy, h0, col, depth = 0.03) => {
    const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const m = sh(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.022, bevelSegments: 2, curveSegments: 1 }), fab(col)));
    m.position.set(cx, cy, h0); C.add(m); return m;
  };

  // ---------- the cloth ----------
  const CW = 24, CH = 44;
  const clothT = canvasTex(1536, 2816, (g, w, h) => {
    const ppu = w / CW;
    weave(g, w, h, 5, "#E3D0AA", 3);
    const q = mulberry(21);
    for (let i = 0; i < 260; i++) { const x = q() * w, y = q() * h, rr = 40 + q() * 260; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(150,105,55,${0.025 + q() * 0.045})`); gr.addColorStop(1, "rgba(150,105,55,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    // kantha: rows of small running stitches over the whole ground, gently waving
    g.lineCap = "round";
    for (let row = 0, y0 = ppu * 1.4; y0 < h - ppu * 1.4; y0 += ppu * 0.3, row++) {
      g.strokeStyle = row % 7 === 3 ? "rgba(178,64,48,.38)" : row % 7 === 6 ? "rgba(40,60,110,.30)" : "rgba(150,110,70,.30)"; g.lineWidth = 2.6; g.setLineDash([ppu * 0.11, ppu * 0.07]); g.lineDashOffset = row * 3.3;
      g.beginPath(); for (let x = ppu * 1.4; x <= w - ppu * 1.4; x += 6) { const y = y0 + Math.sin(x / ppu * 0.9 + row * 0.5) * ppu * 0.05; x === ppu * 1.4 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    }
    g.setLineDash([]);
    // border band: red + indigo rows and a gold zigzag
    const band = (inset, col, lw, dash) => { g.strokeStyle = col; g.lineWidth = lw; g.setLineDash(dash); g.strokeRect(inset, inset, w - 2 * inset, h - 2 * inset); };
    band(ppu * 0.35, "rgba(170,40,40,.85)", 6, [ppu * 0.16, ppu * 0.08]);
    band(ppu * 0.55, "rgba(30,45,100,.8)", 6, [ppu * 0.16, ppu * 0.08]);
    band(ppu * 1.15, "rgba(170,40,40,.85)", 6, [ppu * 0.16, ppu * 0.08]);
    g.setLineDash([]);
    g.strokeStyle = "rgba(190,140,40,.9)"; g.lineWidth = 5;
    const zig = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(L / (ppu * 0.3)); g.beginPath(); for (let i = 0; i <= n; i++) { const f = i / n, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f, o = (i % 2 ? 1 : -1) * ppu * 0.14; const nx = -(y1 - y0) / L, ny = (x1 - x0) / L; i ? g.lineTo(x + nx * o, y + ny * o) : g.moveTo(x + nx * o, y + ny * o); } g.stroke(); };
    const zi = ppu * 0.85; zig(zi, zi, w - zi, zi); zig(w - zi, zi, w - zi, h - zi); zig(w - zi, h - zi, zi, h - zi); zig(zi, h - zi, zi, zi);
    // lotus medallions in the corners
    for (const [cx, cy] of [[2.6, 2.6], [CW - 2.6, 2.6], [2.6, CH - 2.6], [CW - 2.6, CH - 2.6]]) {
      for (let k = 0; k < 4; k++) { g.strokeStyle = k % 2 ? "rgba(170,40,40,.7)" : "rgba(30,45,100,.65)"; g.lineWidth = 4; g.setLineDash([ppu * 0.1, ppu * 0.06]); g.beginPath(); g.arc(cx * ppu, cy * ppu, ppu * (0.35 + k * 0.28), 0, 6.2832); g.stroke(); }
      g.setLineDash([]);
      for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832; g.fillStyle = "rgba(190,140,40,.75)"; g.beginPath(); g.ellipse(cx * ppu + Math.cos(a) * ppu * 1.55, cy * ppu + Math.sin(a) * ppu * 1.55, ppu * 0.32, ppu * 0.12, a, 0, 6.2832); g.fill(); }
    }
  });
  const clothBump = bumpT.clone(); clothBump.repeat.set(CW / 0.6, CH / 0.6); clothBump.needsUpdate = true;
  const clothM = new THREE.MeshPhysicalMaterial({ map: clothT, bumpMap: clothBump, bumpScale: 1.1, roughness: 0.92, sheen: 0.15, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xfff4e0), envMapIntensity: ENV });
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), clothM); cloth.receiveShadow = true; C.add(cloth);
  const quilt = sh(new THREE.Mesh(new THREE.BoxGeometry(CW + 0.12, CH + 0.12, 0.16), fab("#D8C7A4", { bump: 0.5 })), false); quilt.position.z = -0.085; C.add(quilt);
  // beech frame
  const woodT = canvasTex(256, 1024, (g, w, h) => { g.fillStyle = "#C79B66"; g.fillRect(0, 0, w, h); const q = mulberry(4); for (let i = 0; i < 90; i++) { const x = q() * w; g.strokeStyle = `rgba(${q() < 0.5 ? "120,80,40" : "230,200,160"},${0.08 + q() * 0.12})`; g.lineWidth = 1 + q() * 3; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (q() - 0.5) * 30, h * 0.3, x + (q() - 0.5) * 30, h * 0.7, x + (q() - 0.5) * 20, h); g.stroke(); } }, [1, 1]);
  const woodM = new THREE.MeshPhysicalMaterial({ map: woodT, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.35, envMapIntensity: ENV * 2 });
  for (const [w, h, x, y] of [[0.9, CH + 2.6, -CW / 2 - 0.6, 0], [0.9, CH + 2.6, CW / 2 + 0.6, 0], [CW + 2.1, 0.9, 0, CH / 2 + 0.6], [CW + 2.1, 0.9, 0, -CH / 2 - 0.6]]) {
    const b = sh(new THREE.Mesh(slab(w, h, 0.5, 0.12, 0.08), woodM)); b.position.set(x, y, -0.3); C.add(b);
  }
  // songket backdrop: plum ground with gold supplementary-weft diamonds (only the floats are metallic)
  {
    const paintS = (gold) => (g, w, h) => {
      g.fillStyle = gold ? "#000" : "#4A1A2C"; g.fillRect(0, 0, w, h);
      if (!gold) for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(${(y / 4) % 2 ? "0,0,0,.18" : "120,50,80,.12"})`; g.fillRect(0, y, w, 2); }
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const cx = (i + (j % 2) * 0.5) * w / 4 + w / 8, cy = j * h / 4 + h / 8;
        for (let k = -5; k <= 5; k++) { const ww = (5 - Math.abs(k)) * w * 0.022 + w * 0.01; g.fillStyle = gold ? "#fff" : "#C99A3A"; g.fillRect(cx - ww, cy + k * h * 0.011, ww * 2, h * 0.007); }
      }
    };
    const sT = canvasTex(512, 512, paintS(false), [1, 1]), sM = canvasTex(512, 512, paintS(true), [1, 1]); sM.colorSpace = THREE.NoColorSpace;
    sT.repeat.set(12, 16); sM.repeat.set(12, 16);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(150, 200), new THREE.MeshStandardMaterial({ map: sT, metalnessMap: sM, metalness: 0.9, roughness: 0.5, envMapIntensity: 0.9 }));
    bd.position.set(0, 0, -2.5); bd.receiveShadow = true; C.add(bd);
  }

  // ---------- NEST: Bangladesh > India > Bangladesh > India ----------
  const RS = [4.7, 3.0, 1.95, 1.3], OFF = [0.07, -0.13];
  const NC = [[-3.2, 12.5]];
  for (let i = 1; i < 4; i++) NC.push([NC[i - 1][0] + OFF[0] * RS[i - 1], NC[i - 1][1] + OFF[1] * RS[i - 1]]);
  const NIN = [false, true, false, true];
  const nestPts = RS.map((R, i) => blobPts(R, 101 + i * 7));
  const nest = nestPts.map((p, i) => patch(p, NC[i][0], NC[i][1], 0.03 * i, NIN[i] ? F_IN : F_BD));
  const topH = (i) => 0.03 * i + 0.03 + 0.012;
  // tAll(i): when the India layers turn Bangladesh in the payoff (filled after timing is known)
  const tSimp = A("s8:disederhanakan");
  nestPts.forEach((p, i) => {
    const [cx, cy] = NC[i], h = topH(i), R = RS[i];
    const flip = NIN[i] ? { c1: undefined } : {};
    // border: two rows of running stitch in the country's thread colours
    const outer = NIN[i] ? IGR : BRED, inner = NIN[i] ? "#FBF4E4" : "#F6E9CC";
    sew(SILK, absP(p, cx, cy, 1 - 0.05 / R), { h, sl: 0.17, gap: 0.08, r: 0.034, col: outer, g: 1 + i, c1: NIN[i] ? BRED : null, tc: NIN[i] ? tSimp + 0.1 * i : undefined, tcdur: 0.8, seed: 3 + i });
    sew(SILK, absP(p, cx, cy, 1 - 0.13 / R), { h, sl: 0.14, gap: 0.09, r: 0.026, col: inner, g: 1 + i, off: 0.5, seed: 9 + i });
    // kantha echo rows inside the patch (hidden under the child where they pass beneath it)
    const rows = Math.min(9, Math.floor((R * (i === 3 ? 0.22 : 0.5)) / 0.24));
    for (let k = 1; k <= rows; k++) {
      const f = 1 - (0.13 + k * 0.24) / R;
      sew(SILK, absP(p, cx, cy, f), { h, sl: 0.11, gap: 0.075, r: 0.018, col: NIN[i] ? "#FFE3B8" : "#7FC4A4", c1: NIN[i] ? "#7FC4A4" : null, tc: NIN[i] ? tSimp + 0.1 * i : undefined, tcdur: 0.8, off: k * 0.37, seed: 20 + i * 10 + k, g: 1 + i });
    }
  });
  // football pitch in Dahala Khagrabari (105 x 68 m ≈ 7.000 m²)
  const L3 = NC[3], pitchC = [L3[0] + 0.02, L3[1] - 0.36], PW = 1.08, PH = PW * 68 / 105;
  const tLap = A("s2:lapangan");
  {
    const h = topH(3), o = { h, sl: 0.07, gap: 0.04, r: 0.014, col: "#FFFFFF", g: 4 };
    const [x, y] = pitchC;
    sew(SILK, [[x - PW / 2, y - PH / 2], [x + PW / 2, y - PH / 2], [x + PW / 2, y + PH / 2], [x - PW / 2, y + PH / 2]], { ...o, t0: tLap - 0.3, dur: 0.9 });
    sew(SILK, [[x, y - PH / 2], [x, y + PH / 2]], { ...o, closed: false, t0: tLap + 0.6, dur: 0.25 });
    sew(SILK, Array.from({ length: 24 }, (_, k) => [x + Math.cos(k / 24 * 6.2832) * 0.08, y + Math.sin(k / 24 * 6.2832) * 0.08]), { ...o, sl: 0.035, gap: 0.02, t0: tLap + 0.85, dur: 0.2 });
    for (const s of [-1, 1]) sew(SILK, [[x + s * PW / 2, y - 0.13], [x + s * (PW / 2 - 0.12), y - 0.13], [x + s * (PW / 2 - 0.12), y + 0.13], [x + s * PW / 2, y + 0.13]], { ...o, closed: false, t0: tLap + 0.9, dur: 0.2 });
  }
  // nest labels: cream tags with stitched country names and small embroidered flags
  const nameTag = (txt, isIN, w, hgt, u, v, hz, rot = 0) => tag(w, hgt, (g, cw, ch) => {
    tagBase(g, cw, ch, "#F3E9D2", isIN ? IGR : BRED, txt.length);
    const fh = ch * 0.46, fw = fh * 1.55, fx = ch * 0.3, fy = (ch - fh) / 2;
    (isIN ? flagIN : flagBD)(g, fx, fy, fw, fh);
    const avail = cw - fx - fw - ch * 0.42; g.font = `700 ${Math.round(ch * 0.5)}px ${FR}`; g.letterSpacing = ch * 0.03 + 'px';
    const fs = Math.min(ch * 0.5, ch * 0.5 * avail / Math.max(1, g.measureText(txt).width)); g.letterSpacing = '0px';
    stitchText(g, txt, fx + fw + ch * 0.12 + avail / 2 + ch * 0.06, ch * 0.5 + fs * 0.36, `700 ${Math.round(fs)}px ${FR}`, isIN ? NAVY : BGR, { ls: fs * 0.06 });
  }, u, v, hz, { rot, pxu: 340 });
  const bandY = (i) => NC[i][1] + 0.745 * RS[i];
  const NT = [
    nameTag("BANGLADESH", false, 4.2, 0.95, NC[0][0] - 0.25, bandY(0), topH(0)),
    nameTag("INDIA", true, 2.5, 0.78, NC[1][0] - 0.05, bandY(1), topH(1)),
    nameTag("BANGLADESH", false, 2.5, 0.6, NC[2][0] - 0.02, bandY(2), topH(2)),
    nameTag("INDIA", true, 1.95, 0.62, L3[0] - 0.02, L3[1] + 0.56, topH(3)),
  ];
  // gold count tags (s5) on plum fabric
  const countTag = (txt, w, hgt, u, v, hz) => { const G = tag(w, hgt, (g, cw, ch) => tagBase(g, cw, ch, PLUM, GOLD, 5), u, v, hz, { body: PLUM }); goldText(txt, `700 $px ${FR}`, w * 0.92, hgt * 0.92, G, 0, 0, 0.05); return G; };
  const CT = [
    countTag("102", 0.9, 0.52, NC[1][0] - 2.3, NC[1][1] - 0.3, topH(1)),
    countTag("21", 0.52, 0.4, NC[2][0] - 1.52, NC[2][1] - 0.25, topH(2)),
    countTag("1", 0.34, 0.32, L3[0], L3[1] - 0.98, topH(3)),
  ];
  // CHITMAHAL tag hangs off Dahala Khagrabari on a short thread
  const chit = tag(1.5, 0.42, (g, cw, ch) => { tagBase(g, cw, ch, "#F3E9D2", BRED, 8); stitchText(g, "CHITMAHAL", cw / 2, ch * 0.68, `700 ${Math.round(ch * 0.48)}px ${FR}`, "#B5222F", { ls: ch * 0.05 }); }, L3[0] + 1.8, L3[1] - 0.85, 0.2, { rot: -0.06 });
  const chitThread = []; // filled below as stitches
  const tChit = A("s2:chitmahal");
  sew(SILK, [[L3[0] + 1.1, L3[1] - 0.55], [L3[0] + 1.22, L3[1] - 0.68], [L3[0] + 1.34, L3[1] - 0.74]], { closed: false, h: 0.18, sl: 0.05, gap: 0.015, r: 0.012, col: BRED, t0: tChit - 0.35, dur: 0.3 });
  // gold ring around the third-order enclave: "satu-satunya di dunia"
  const tSatu = A("s1:Satu-satunya");
  const ringPts = absP(blobPts(RS[3] * 1.12, 777, 90, 0.04), L3[0], L3[1]);
  sew(GOLDS, ringPts, { h: topH(2), sl: 0.09, gap: 0.04, r: 0.026, t0: tSatu - 0.15, dur: 0.85 });
  // small gold AUDIRA signature stitched into the outer band
  const sigTag = tag(1.25, 0.36, (g, cw, ch) => { tagBase(g, cw, ch, PLUM, GOLD, 2); }, NC[0][0] - 3.2, NC[0][1] - 1.05, topH(0), { body: PLUM, rot: 0.5 });
  goldText("AUDIRA", `700 $px ${FR}`, 1.15, 0.34, sigTag, 0, 0, 0.05);

  // ---------- KONON: cards, chess king, KONON tag, 1713 plaque ----------
  const KX = 7.2;
  const cardTex = (rank, suit, red) => label(360, 504, (g, w, h) => {
    g.fillStyle = "#FBF6EA"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(60,40,20,.25)"; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
    const ink = red ? "#B0202C" : "#1E1A2E";
    for (const [x, y, rot] of [[44, 74, 0], [w - 44, h - 74, Math.PI]]) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = ink; g.font = `700 60px ${FR}`; g.textAlign = "center"; g.fillText(rank, 0, 0); g.font = `600 48px ${FR}`; g.fillText(suit, 0, 52); g.restore(); }
    g.fillStyle = ink; g.font = `600 200px ${FR}`; g.textAlign = "center"; g.fillText(suit, w / 2, h / 2 + 70);
    // crown above the pip (no face)
    g.strokeStyle = GOLD; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2 - 70, 150); g.lineTo(w / 2 - 70, 100); g.lineTo(w / 2 - 35, 130); g.lineTo(w / 2, 88); g.lineTo(w / 2 + 35, 130); g.lineTo(w / 2 + 70, 100); g.lineTo(w / 2 + 70, 150); g.closePath(); g.stroke();
  });
  const backTex = label(360, 504, (g, w, h) => { g.fillStyle = "#5A1E32"; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 5; g.strokeRect(20, 20, w - 40, h - 40); for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) { const x = 60 + i * 80, y = 70 + j * 75; g.beginPath(); g.moveTo(x, y - 26); g.lineTo(x + 22, y); g.lineTo(x, y + 26); g.lineTo(x - 22, y); g.closePath(); g.stroke(); } });
  const mkCard = (tex, u, v, rot, hz) => {
    const G = new THREE.Group(); G.position.set(u, v, hz); G.rotation.z = rot; C.add(G);
    const body = sh(new THREE.Mesh(slab(1.2, 1.68, 0.012, 0.08, 0.004), new THREE.MeshPhysicalMaterial({ color: 0xf6efe0, roughness: 0.5, clearcoat: 0.3, envMapIntensity: ENV * 2 }))); G.add(body);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.17, 1.65), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: ENV * 2 })); f.position.z = 0.018; f.receiveShadow = true; G.add(f);
    aoBlob(0.05, -0.06, 1.7, 2.2, 0.4, -hz + 0.004, G);
    return G;
  };
  const cards = [mkCard(backTex, KX - 2.4, 14.15, 0.32, 0.02), mkCard(cardTex("K", "♠", false), KX - 1.55, 14.3, 0.12, 0.05), mkCard(cardTex("Q", "♥", true), KX - 0.6, 14.15, -0.16, 0.08)];
  // chess king (lathe), standing on the cloth
  const kingG = new THREE.Group(); kingG.position.set(KX + 1.45, 13.75, 0); C.add(kingG);
  {
    const prof = [[0, 0], [0.42, 0], [0.44, 0.08], [0.38, 0.14], [0.3, 0.2], [0.24, 0.34], [0.18, 0.7], [0.16, 0.98], [0.26, 1.04], [0.26, 1.1], [0.15, 1.16], [0.2, 1.34], [0.24, 1.46], [0.12, 1.54], [0.06, 1.56], [0, 1.56]].map(([x, y]) => new THREE.Vector2(x, y));
    const kingM = new THREE.MeshPhysicalMaterial({ color: 0x3a2214, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: ENV * 3 });
    const body = sh(new THREE.Mesh(new THREE.LatheGeometry(prof, 48), kingM)); body.rotation.x = Math.PI / 2; kingG.add(body);
    const cr1 = sh(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.34), kingM)); cr1.position.z = 1.72; kingG.add(cr1);
    const cr2 = sh(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), kingM)); cr2.position.z = 1.78; kingG.add(cr2);
    aoBlob(0.12, -0.1, 1.4, 1.4, 0.55, 0.004, kingG);
  }
  const kononTag = tag(2.3, 0.85, (g, cw, ch) => {
    tagBase(g, cw, ch, "#F6EBD3", BRED, 12);
    stitchText(g, "KONON", cw * 0.42, ch * 0.62, `700 ${Math.round(ch * 0.5)}px ${FR}`, "#B5222F", { ls: ch * 0.06 });
    stitchText(g, "legenda", cw * 0.8, ch * 0.62, `italic 600 ${Math.round(ch * 0.26)}px ${FR}`, "#5A3A2A");
  }, KX + 1.5, 15.35, 0.0, { rot: 0.05 });
  // brass treaty plaque
  const plaque = new THREE.Group(); plaque.position.set(KX - 0.3, 12.0, 0); C.add(plaque);
  {
    plaque.add(sh(new THREE.Mesh(slab(4.3, 1.75, 0.07, 0.12, 0.025), brassM)));
    const tx = label(1290, 525, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#B88E48"); gr.addColorStop(0.5, "#9A6E30"); gr.addColorStop(1, "#7A5422"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const q = mulberry(17); for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "255,240,200" : "80,50,10"},.06)`; g.lineWidth = 1; const y = q() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (q() - 0.5) * 4); g.stroke(); }
      g.strokeStyle = "rgba(60,35,8,.6)"; g.lineWidth = 4; g.strokeRect(26, 26, w - 52, h - 52);
      const eng = (t, x, y, f, ls = 0) => { g.font = f; g.textAlign = "center"; if (ls) g.letterSpacing = ls + "px"; g.fillStyle = "rgba(255,240,200,.55)"; g.fillText(t, x, y + 3); g.fillStyle = "#3A2208"; g.fillText(t, x, y); g.letterSpacing = "0px"; };
      eng("PERJANJIAN", w / 2, 128, `600 54px ${MONO}`, 14);
      eng("1713", w / 2, 285, `700 170px ${FR}`);
      eng("Kerajaan Koch Bihar · Kekaisaran Mughal", w / 2, 400, `italic 600 52px ${FR}`);
      eng("batas tidak ditetapkan jelas", w / 2, 470, `500 34px ${MONO}`, 4);
    });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.71), new THREE.MeshStandardMaterial({ map: tx, metalness: 0.6, roughness: 0.42, bumpMap: tx, bumpScale: 1.5, envMapIntensity: 0.22 }));
    f.position.z = 0.1; f.receiveShadow = true; plaque.add(f); plaque.userData.face = f;
    aoBlob(0, -0.1, 5.2, 2.6, 0.45, 0.004, plaque);
    for (const s of [-1, 1]) { const rv = sh(new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 10), brassM)); rv.position.set(s * 1.95, 0.7, 0.1); rv.scale.z = 0.5; plaque.add(rv); }
  }
  // the loose, wandering "border" thread under the plaque: no clear line
  const tMen = A("s3:menetapkan"), tJel = A("s3:jelas");
  {
    const q = mulberry(55), P = [];
    for (let k = 0; k <= 60; k++) { const f = k / 60; P.push([KX - 2.5 + 4.4 * f, 10.75 + 0.35 * Math.sin(f * 11) + 0.22 * Math.sin(f * 27 + 1) + (q() - 0.5) * 0.12]); }
    sew(SILK, P, { closed: false, h: 0, sl: 0.13, gap: 0.12, r: 0.028, col: "#8A4B2A", jit: 0.06, skip: (f, qq) => qq() < 0.22, t0: tMen - 0.1, dur: Math.max(0.8, tJel - tMen + 0.2), seed: 61 });
  }

  // ---------- 1947: India above, Pakistan Timur below, red line, trapped patches ----------
  const RX0 = -6.5, RX1 = 6.5, RY0 = -8.6, RY1 = 1.2;
  const lineY = (u) => -3.6 + 0.55 * Math.sin(u * 0.62 + 0.4) + 0.25 * Math.sin(u * 1.7 + 2.1) + 0.12 * Math.sin(u * 3.9);
  const LP = []; for (let k = 0; k <= 80; k++) { const u = RX0 + (RX1 - RX0) * k / 80; LP.push([u, lineY(u)]); }
  const topPiece = patch([[RX0, RY1], ...LP, [RX1, RY1]], 0, 0, 0, F_RAW, 0.02);
  const botPiece = patch([[RX0, RY0], [RX1, RY0], ...LP.slice().reverse()], 0, 0, 0, F_RAW, 0.02);
  const regH = 0.02 + 0.012;
  // region borders (outer frame of the map patch)
  sew(SILK, [[RX0, RY0], [RX1, RY0], [RX1, RY1], [RX0, RY1]], { h: regH, sl: 0.2, gap: 0.1, r: 0.03, col: "#6B4A2E" });
  const t47 = A("s4:1947"), tDib = A("s4:dibagi"), tKoch = A("s4:Koch"), tPak = A("s4:Pakistan"), tRat = A("s4:Ratusan"), tTerj = A("s4:terjebak");
  const tSer7 = A("s7:seratus"), tDit = A("s7:ditukar"), tMil = A("s7:memilih");
  // red partition line, sewn left to right
  const t47a = t47 + 0.2, t47b = tDib + 0.45;
  sew(SILK, LP, { closed: false, h: regH, sl: 0.3, gap: 0.1, r: 0.085, col: "#C8102E", t0: t47a, dur: t47b - t47a, seed: 71 });
  sew(SILK, LP.map(([u, v]) => [u, v + 0.16]), { closed: false, h: regH, sl: 0.22, gap: 0.12, r: 0.035, col: "#F4E6C8", off: 0.5, t0: t47a + 0.2, dur: t47b - t47a, seed: 72 });
  sew(SILK, LP.map(([u, v]) => [u, v - 0.16]), { closed: false, h: regH, sl: 0.22, gap: 0.12, r: 0.035, col: "#F4E6C8", off: 0.5, t0: t47a + 0.2, dur: t47b - t47a, seed: 73 });
  // trapped enclaves: 111 India patches south of the line, 51 Bangladesh patches north of it
  const EN = [];
  const RES = [[-5.2, -1.4, -1.4, -0.3], [0.4, -7.0, 4.4, -5.9], [2.6, -0.85, 4.6, 0.05]];
  {
    const q = mulberry(1947);
    const place = (n, side) => {
      let tries = 0;
      while (n > 0 && tries < 40000) {
        tries++;
        const u = RX0 + 0.55 + q() * (RX1 - RX0 - 1.1), dist = 0.38 + Math.pow(q(), 1.25) * 4.2, v = lineY(u) + side * dist;
        const rr = 0.13 + q() * 0.13;
        if (side > 0 && v > RY1 - 0.35) continue; if (side < 0 && v < RY0 + 0.35) continue;
        if (RES.some(([a0, b0, a1, b1]) => u > a0 - rr && u < a1 + rr && v > b0 - rr && v < b1 + rr)) continue;
        if (EN.some((e) => Math.hypot(e.u - u, e.v - v) < e.r + rr + 0.07)) continue;
        EN.push({ u, v, r: rr, side, rot: q() * 6.28, sq: 0.8 + q() * 0.35 }); n--;
      }
    };
    place(111, -1); place(51, 1);
    if (EN.length !== 162) throw new Error('enclaves placed ' + EN.length);
  }
  const enGeo = new THREE.ExtrudeGeometry(new THREE.Shape(blobPts(1, 303, 28, 0.12).map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.03, bevelSegments: 1, curveSegments: 1 });
  const enM = fab("#ffffff"); enM.color.set(0xffffff);
  const enMesh = new THREE.InstancedMesh(enGeo, enM, EN.length); enMesh.castShadow = true; enMesh.receiveShadow = true; C.add(enMesh);
  const cINp = new THREE.Color(F_IN), cBDp = new THREE.Color(F_BD), cINr = new THREE.Color(F_IN_LT), cBDr = new THREE.Color(F_BD_LT);
  const enOrder = EN.map((e, i) => i).sort((a, b) => EN[a].u - EN[b].u);
  const enRank = new Float32Array(EN.length); enOrder.forEach((i, k) => { enRank[i] = k / EN.length; });
  const tSwapA = tSer7 - 0.35, tSwapB = tDit + 0.1;
  EN.forEach((e, i) => {
    e.tIn = tRat - 0.2 + ((i * 0.618) % 1) * Math.max(0.8, tTerj - tRat + 0.6);
    e.tSw = tSwapA + enRank[i] * (tSwapB - tSwapA);
    const own = e.side < 0 ? IGR : BRED;          // India enclave: green thread; Bangladesh enclave: red thread
    const nw = e.side < 0 ? "#E8F2EA" : "#FFF0D8";  // after the swap the outline matches the new ground, then is unpicked
    const P = blobPts(e.r * 0.9, 303, 28, 0.12).map(([x, y]) => [x * Math.cos(e.rot) - y * Math.sin(e.rot), x * Math.sin(e.rot) + y * Math.cos(e.rot)]);
    sew(SILK, absP(P, e.u, e.v), { h: regH + 0.05, sl: 0.09, gap: 0.05, r: 0.018, col: own, c1: nw, tc: e.tSw, t0: e.tIn, dur: 0.28, t1: e.tSw + 1.1, t1dur: 0.3, g: 9, seed: 400 + i });
  });
  // region tags
  const tagKoch = tag(3.6, 0.95, (g, cw, ch) => {
    tagBase(g, cw, ch, "#F3E9D2", IGR, 31); const fh = ch * 0.44, fw = fh * 1.5; flagIN(g, ch * 0.28, (ch - fh) / 2, fw, fh);
    stitchText(g, "KOCH BIHAR", ch * 0.42 + fw + (cw - ch * 0.42 - fw) / 2, ch * 0.52, `700 ${Math.round(ch * 0.34)}px ${FR}`, NAVY, { ls: ch * 0.03 });
    stitchText(g, "ikut India, 1949", ch * 0.42 + fw + (cw - ch * 0.42 - fw) / 2, ch * 0.82, `italic 600 ${Math.round(ch * 0.2)}px ${FR}`, "#4A3A2A");
  }, -3.3, -0.85, regH + 0.06);
  const tagPak = tag(4.0, 0.95, (g, cw, ch) => {
    tagBase(g, cw, ch, "#F3E9D2", BGR, 32); const fh = ch * 0.44, fw = fh * 1.67; flagBD(g, cw - ch * 0.28 - fw, (ch - fh) / 2, fw, fh);
    stitchText(g, "PAKISTAN TIMUR", (cw - fw - ch * 0.4) / 2 + ch * 0.06, ch * 0.52, `700 ${Math.round(ch * 0.32)}px ${FR}`, BGR, { ls: ch * 0.02 });
    stitchText(g, "kini Bangladesh", (cw - fw - ch * 0.4) / 2 + ch * 0.06, ch * 0.82, `italic 600 ${Math.round(ch * 0.2)}px ${FR}`, "#4A3A2A");
  }, 2.4, -6.45, regH + 0.06);
  const tag47 = tag(1.9, 0.78, (g, cw, ch) => tagBase(g, cw, ch, PLUM, GOLD, 33), 3.6, -0.4, regH + 0.06, { body: PLUM, rot: -0.04 });
  goldText("1947", `700 $px ${FR}`, 1.75, 0.72, tag47, 0, 0, 0.05);

  // ---------- DESA: village patch with three enclaves and appliqué houses ----------
  const VC = [-5.5, -15.7], VR = 3.25;
  const vilPts = blobPts(VR, 501);
  patch(vilPts, VC[0], VC[1], 0, F_BD);
  sew(SILK, absP(vilPts, VC[0], VC[1], 1 - 0.05 / VR), { h: 0.042, sl: 0.17, gap: 0.08, r: 0.032, col: BRED });
  for (let k = 1; k <= 4; k++) sew(SILK, absP(vilPts, VC[0], VC[1], 1 - (0.12 + k * 0.24) / VR), { h: 0.042, sl: 0.11, gap: 0.075, r: 0.018, col: "#7FC4A4", off: k * 0.4, seed: 510 + k });
  const tTanpa = A("s6:tanpa"), tSen = A("s6:Sensus"), tTing = A("s6:tinggal"), tLima = A("s6:lima");
  const VE = [[VC[0] - 1.25, VC[1] + 0.85, 1.15], [VC[0] + 1.3, VC[1] + 0.55, 1.0], [VC[0] - 0.1, VC[1] - 1.45, 0.95]];
  VE.forEach(([x, y, R], i) => {
    const p = blobPts(R, 520 + i);
    patch(p, x, y, 0.03, F_IN);
    // border with gaps that open on "tanpa pemerintahan"
    sew(SILK, absP(p, x, y, 1 - 0.05 / R), { h: 0.072, sl: 0.13, gap: 0.07, r: 0.028, col: IGR, t1: tTanpa - 0.2 + i * 0.2, t1dur: 0.0, t1order: (f, qq) => (qq() < 0.45 ? 0 : 1e6), seed: 530 + i });
    sew(SILK, absP(p, x, y, 1 - 0.14 / R), { h: 0.072, sl: 0.1, gap: 0.08, r: 0.02, col: "#FFF4DE", off: 0.5, seed: 540 + i });
  });
  // houses: wall + roof appliqué, door and window stitches
  const HS = [];
  {
    const q = mulberry(808);
    const wallS = new THREE.Shape([[-0.2, 0], [0.2, 0], [0.2, 0.27], [-0.2, 0.27]].map(([x, y]) => new THREE.Vector2(x, y)));
    const roofS = new THREE.Shape([[-0.27, 0.25], [0.27, 0.25], [0, 0.52]].map(([x, y]) => new THREE.Vector2(x, y)));
    const ex = { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.014, bevelSegments: 2, curveSegments: 1 };
    const wallG = new THREE.ExtrudeGeometry(wallS, ex), roofG = new THREE.ExtrudeGeometry(roofS, ex);
    const WALL = ["#F4E3C1", "#D98F6B", "#C9D6E8", "#EBC77E", "#E9B7A6"], ROOF = ["#8E2F2A", "#5B3A1E", "#2E4A7A", "#A0522D", "#6B2B47"];
    const spots = [];
    VE.forEach(([x, y, R], i) => { for (let k = 0; k < 8; k++) spots.push([x, y, R * 0.68, i]); });
    for (let k = 0; k < 6; k++) spots.push([VC[0], VC[1], VR * 0.82, 9]);
    spots.forEach(([x, y, R, grp], k) => {
      for (let tr = 0; tr < 200; tr++) {
        const a = q() * 6.2832, d = Math.sqrt(q()) * R, u = x + Math.cos(a) * d, v = y + Math.sin(a) * d - 0.2;
        if (grp === 9 && VE.some(([ex2, ey2, er]) => Math.hypot(u - ex2, v + 0.2 - ey2) < er + 0.35)) continue;
        if (HS.some((h2) => Math.hypot(h2.u - u, h2.v - v) < 0.6)) continue;
        const s = 0.85 + q() * 0.4, G = new THREE.Group(); G.position.set(u, v, grp === 9 ? 0.04 : 0.07); C.add(G);
        const wm = fab(WALL[k % 5]), rm = fab(ROOF[(k * 3) % 5]);
        G.add(sh(new THREE.Mesh(wallG, wm))); const rf = sh(new THREE.Mesh(roofG, rm)); rf.position.z = 0.02; G.add(rf);
        HS.push({ u, v, G, s, t: 0 }); break;
      }
    });
    HS.sort((a, b) => a.u - b.u + (a.v - b.v) * 0.3);
    HS.forEach((h2, i) => {
      h2.t = Math.max(tSen + 1.0, tSen + 1.0) + (i / HS.length) * Math.max(1.2, tTing - tSen - 1.2);
      const z = h2.G.position.z + 0.06;
      sew(SILK, [[h2.u - 0.02, h2.v + 0.02], [h2.u - 0.02, h2.v + 0.15]], { closed: false, h: z, sl: 0.12, gap: 0.02, r: 0.03, col: "#3A2216", t0: h2.t + 0.15, dur: 0.05 });
      sew(SILK, [[h2.u + 0.09, h2.v + 0.17], [h2.u + 0.15, h2.v + 0.17]], { closed: false, h: z, sl: 0.06, gap: 0.01, r: 0.03, col: "#F2C14E", t0: h2.t + 0.2, dur: 0.05 });
      h2.G.scale.setScalar(0.001);
    });
  }
  const census = tag(3.3, 0.95, (g, cw, ch) => tagBase(g, cw, ch, PLUM, GOLD, 41), VC[0] - 0.7, VC[1] - 3.55, 0.05, { body: PLUM });
  goldText("51.549 orang", `700 $px ${FR}`, 3.1, 0.62, census, 0, 0.1, 0.05);
  const census2 = tag(1.6, 0.42, (g, cw, ch) => { tagBase(g, cw, ch, "#F3E9D2", GOLD, 42); stitchText(g, "sensus 2010", cw / 2, ch * 0.68, `600 ${Math.round(ch * 0.44)}px ${MONO}`, "#5A3A1E"); }, VC[0] + 2.05, VC[1] - 3.75, 0.11, { rot: -0.06 });

  // ---------- JAM: midnight clock ----------
  const KC = [6, -16], KR = 2.7;
  const clockRing = patch(blobPts(KR, 601, 120, 0.0), KC[0], KC[1], 0, "#22305E");
  const clockFace = patch(blobPts(KR * 0.86, 602, 120, 0.0), KC[0], KC[1], 0.03, "#F2E6CC");
  sew(GOLDS, absP(blobPts(KR * 0.93, 603, 120, 0.0), KC[0], KC[1]), { h: 0.042, sl: 0.12, gap: 0.05, r: 0.03 });
  sew(SILK, absP(blobPts(KR * 0.8, 604, 120, 0.0), KC[0], KC[1]), { h: 0.072, sl: 0.1, gap: 0.06, r: 0.02, col: "#B5222F" });
  for (let k = 0; k < 60; k++) {
    const a = k / 60 * 6.2832, big = k % 5 === 0, r0 = KR * (big ? 0.62 : 0.7), r1 = KR * 0.76;
    const S = big ? GOLDS : SILK;
    sew(S, [[KC[0] + Math.sin(a) * r0, KC[1] + Math.cos(a) * r0], [KC[0] + Math.sin(a) * r1, KC[1] + Math.cos(a) * r1]], { closed: false, h: 0.072, sl: big ? r1 - r0 : 0.1, gap: 0.01, r: big ? 0.045 : 0.018, col: "#3A2A4A" });
  }
  const numT = label(1024, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (const [txt, a] of [["12", 0], ["3", 90], ["6", 180], ["9", 270]]) { const rr = w * 0.3, x = w / 2 + Math.sin(a * Math.PI / 180) * rr, y = h / 2 - Math.cos(a * Math.PI / 180) * rr; stitchText(g, txt, x, y + w * 0.04, `700 ${Math.round(w * 0.11)}px ${FR}`, "#2A2050"); }
  });
  const nums = new THREE.Mesh(new THREE.PlaneGeometry(KR * 2, KR * 2), new THREE.MeshPhysicalMaterial({ map: numT, alphaTest: 0.3, bumpMap: numT, bumpScale: 1.5, roughness: 0.6, sheen: 0.6, sheenColor: new THREE.Color(0xffffff), envMapIntensity: ENV }));
  nums.position.set(KC[0], KC[1], 0.075); nums.receiveShadow = true; C.add(nums);
  const hand = (len, wid) => { const P = new THREE.Group(); P.position.set(KC[0], KC[1], 0.1); C.add(P); const m = sh(new THREE.Mesh(sph, goldThM)); m.scale.set(wid, len / 2, wid * 0.7); m.position.y = len / 2 - 0.1; P.add(m); return P; };
  const hMin = hand(KR * 0.66, 0.07), hHr = hand(KR * 0.44, 0.095);
  const knot = sh(new THREE.Mesh(sph, goldThM)); knot.scale.set(0.13, 0.13, 0.09); knot.position.set(KC[0], KC[1], 0.16); C.add(knot);
  const clockGlow = new THREE.PointLight(0xffd59a, 0, 9, 1.6); clockGlow.position.copy(new THREE.Vector3(KC[0], KC[1], 2.2)); C.add(clockGlow);
  const dateTag = tag(4.0, 1.0, (g, cw, ch) => {
    tagBase(g, cw, ch, "#F3E9D2", BRED, 51);
    stitchText(g, "31 JULI 2015", cw / 2, ch * 0.52, `700 ${Math.round(ch * 0.38)}px ${FR}`, "#B5222F", { ls: ch * 0.03 });
    stitchText(g, "00.00 · tengah malam", cw / 2, ch * 0.83, `600 ${Math.round(ch * 0.2)}px ${MONO}`, "#3A2A4A");
  }, KC[0], KC[1] + KR + 1.1, 0.0);
  const tTeng = A("s7:Tengah"), tBaru = A("s7:baru"), tKem = A("s7:kemudian");

  // ---------- AUDIRA maker's label on the right edge ----------
  const audTag = tag(2.3, 0.88, (g, cw, ch) => {
    tagBase(g, cw, ch, PLUM, GOLD, 61);
    stitchText(g, "sulam tangan · EP 38", cw / 2, ch * 0.86, `500 ${Math.round(ch * 0.13)}px ${MONO}`, "#E8D2A0", { ls: ch * 0.02 });
  }, -6.7, 14.5, topH(0), { body: PLUM, rot: 0.3 });
  goldText("AUDIRA", `700 $px ${FR}`, 2.1, 0.58, audTag, 0, 0.12, 0.05);

  // instance counts + initial colours
  for (const S of [SILK, GOLDS]) { S.m.count = S.it.length; S.it.forEach((o, i) => S.m.setColorAt(i, o.c0)); if (S.m.instanceColor) S.m.instanceColor.needsUpdate = true; }

  // metals reflect the room at their own strength
  const metalEnv = () => scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) if (m.metalness > 0.5 && !m.envMap) { m.envMap = envTex; m.needsUpdate = true; } });

  // ---------- needle + live thread ----------
  const needle = new THREE.Group(); C.add(needle);
  {
    const steel = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 1, roughness: 0.18, envMapIntensity: 1.6 });
    const sh1 = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 12), steel)); sh1.position.y = 0.75; needle.add(sh1);
    const tip = sh(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.18, 12), steel)); tip.rotation.x = Math.PI; tip.position.y = -0.09; needle.add(tip);
    const eye = sh(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16), steel)); eye.position.y = 1.5; needle.add(eye);
  }
  const threadM = new THREE.MeshPhysicalMaterial({ color: 0xd0142c, roughness: 0.5, sheen: 1, sheenColor: new THREE.Color(0xffffff), envMapIntensity: ENV });
  let threadMesh = null;
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  // needle jobs: [t0, t1, path(f) -> [u,v], h, colour]
  const pathAt = (P) => { const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); const tot = cum[cum.length - 1]; return (f) => { const s = clamp01(f) * tot; let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const k = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k]; }; };
  const JOBS = [
    [tSatu - 0.15, tSatu + 0.7, pathAt([...ringPts, ringPts[0]]), topH(2), 0xd9ae48],
    [t47a, t47b, pathAt(LP), regH, 0xd0142c],
    [tLap - 0.3, tLap + 0.6, pathAt([[pitchC[0] - PW / 2, pitchC[1] - PH / 2], [pitchC[0] + PW / 2, pitchC[1] - PH / 2], [pitchC[0] + PW / 2, pitchC[1] + PH / 2], [pitchC[0] - PW / 2, pitchC[1] + PH / 2]]), topH(3), 0xffffff],
    [tSwapA, tSwapB, pathAt(enOrder.map((i) => [EN[i].u, EN[i].v])), regH + 0.05, 0xfff0d8],
  ];

  metalEnv();
  // ---------- timing ----------
  const tIN1 = A("s1:India"), tBD1 = A("s1:Bangladesh"), tIN2 = A("s1:India#2"), tBD2 = A("s1:Bangladesh#2");
  const tDah = A("s2:Dahala"), tKeb = A("s2:kebun"), tPer = A("s2:perbatasan"), tPet = A("s2:Petak");
  const tKon = A("s3:Konon"), tKar = A("s3:kartu"), tCat = A("s3:catur"), tCatat = A("s3:Catatan"), t1713 = A("s3:1713");
  const tTet = A("s4:tetangga");
  const tSer5 = A("s5:seratus"), tDua2 = A("s5:dua#2"), tDah5 = A("s5:Dahala"), tTing5 = A("s5:tingkat");
  const tPeta = A("s8:Peta"), tMen8 = A("s8:Menurut");

  // ---------- camera: [t, u, v, ln d, pitch, yaw] ----------
  const L = Math.log;
  const mid = (a, b, f = 0.5) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const N0 = NC[0], N1 = NC[1], N2 = NC[2], N3 = NC[3];
  const c = (t, p, d, pit = 0.14, yaw = 0) => [t, p[0], p[1], L(d), pit, yaw];
  const camKeys = [
    c(0, N3, 6.6, 0.12, -0.05),
    c(tIN1 + 0.2, N3, 7.2, 0.12, -0.04),
    c(tBD1 + 0.3, mid(N3, N2, 0.6), 11.5, 0.13, -0.02),
    c(tIN2 + 0.3, mid(N2, N1, 0.7), 18.5, 0.14, 0.0),
    c(tBD2 + 0.6, [N0[0] + 0.1, N0[1] + 0.9], 25.5, 0.15, 0.0),
    c(K.s1e - 0.1, [N0[0] + 0.05, N0[1] + 1.15], 26.5, 0.16, 0.0),
    c(tDah + 0.5, mid(N2, N3, 0.4), 13, 0.14, 0.02),
    c(tKeb + 0.3, [N3[0], N3[1] - 0.15], 7.2, 0.12, -0.02),
    c(tLap + 1.3, [N3[0], N3[1] - 0.2], 7.0, 0.12, 0.0),
    c(tPer + 0.6, mid(N3, N2, 0.5), 10.5, 0.13, 0.02),
    c(tPet + 0.4, [N3[0] + 0.4, N3[1] - 0.5], 11, 0.13, 0.03),
    c(K.s2e - 0.4, [N3[0] + 0.7, N3[1] - 0.55], 10, 0.13, 0.02),
    c(K.s2e + 0.35, [2.2, 12.6], 18, 0.14, 0.0),
    c(tKon + 1.0, [KX - 0.3, 12.9], 16.5, 0.14, -0.02),
    c(tCatat + 0.5, [KX - 0.3, 12.5], 15.6, 0.14, 0.0),
    c(K.s3e - 0.3, [KX - 0.3, 11.1], 12.4, 0.13, 0.03),
    c(t47 + 1.3, [0.1, -3.2], 31, 0.15, 0.0),
    c(tTet + 0.1, [0.1, -3.4], 29, 0.15, 0.02),
    c(K.s5 + 0.5, N0, 29, 0.15, 0.0),
    c(tSer5 + 0.35, mid(N1, N0, 0.15), 19, 0.14, -0.02),
    c(tDua2 - 0.4, mid(N1, N0, 0.1), 18, 0.14, -0.01),
    c(tDua2 + 0.4, [N2[0] + 0.2, N2[1] + 0.1], 13.5, 0.13, 0.0),
    c(tDah5 - 0.4, [N2[0] + 0.2, N2[1] + 0.1], 13.2, 0.13, 0.0),
    c(tDah5 + 0.4, [N3[0] + 0.6, N3[1] - 0.14], 11.5, 0.12, 0.0),
    c(K.s5e - 0.3, [N3[0] + 0.6, N3[1] - 0.14], 11.8, 0.12, 0.0),
    c(K.s6 + 0.6, [-3.5, -2], 40, 0.15, 0.0),
    c(tSen + 1.2, [VC[0] + 0.3, VC[1] - 1.4], 29, 0.15, -0.02),
    c(tTanpa - 0.3, [VC[0] + 0.3, VC[1] - 1.3], 27.5, 0.14, 0.0),
    c(K.s6e - 0.3, [VC[0] + 0.4, VC[1] - 1.2], 26.5, 0.14, 0.02),
    c(K.s7 + 0.9, [KC[0], KC[1] + 1.2], 19, 0.15, 0.02),
    c(tBaru - 0.1, [KC[0], KC[1] + 1.0], 18, 0.14, 0.0),
    c(tTeng + 0.1, [KC[0], KC[1] + 1.1], 17, 0.13, -0.02),
    c(tSer7 - 0.6, [1.4, -7.6], 38, 0.15, 0.0),
    c(K.s7e - 0.2, [1.2, -7.4], 36, 0.15, 0.02),
    c(tPeta + 1.6, [-3.2, 12.4], 32, 0.15, 0.0),
    c(tMen8, [-3.2, 12.4], 31, 0.15, 0.0),
    c(K.dur, [-3.2, 12.4], 30.5, 0.15, 0.0),
  ];
  const camT = track(camKeys);
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const camL = new THREE.Vector3(), tgtL = new THREE.Vector3(), tgtW = new THREE.Vector3();
  const pop = (t, a, d = 0.4) => back(clamp01((t - a) / d), 1.5);

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Fraunces"`) && document.fonts.check(`500 40px "IBM Plex Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const cv = tx.image, g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height); paint(g, cv.width, cv.height); tx.needsUpdate = true; }
    }
    // camera in cloth space
    const k = camT(t), d = Math.exp(k[2]), pit = k[3], yaw = k[4];
    tgtL.set(k[0], k[1] + 0.022 * d, 0);
    camL.set(k[0] + d * Math.sin(yaw) + Math.sin(t * 0.31) * 0.012 * d, k[1] - d * Math.sin(pit) + Math.sin(t * 0.23) * 0.008 * d, d * Math.cos(pit) * Math.cos(yaw));
    cam.position.copy(camL.applyMatrix4(C.matrixWorld)); tgtW.copy(tgtL).applyMatrix4(C.matrixWorld); cam.lookAt(tgtW);
    // grazing key follows the view; in the payoff it sweeps across the cloth
    const sweep = smooth(clamp01((t - tPeta) / 3.2));
    const kd = KEYDIR.clone(); kd.applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.55 * Math.sin(Math.PI * sweep));
    kd.applyQuaternion(C.quaternion);
    key.target.position.copy(tgtW); key.position.copy(tgtW).addScaledVector(kd, 60);
    const ext = Math.max(4, d * 0.5); Object.assign(key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext }); key.shadow.camera.updateProjectionMatrix();

    // hook: each layer lights up on its word
    PULSE.fill(0);
    const lay = [tBD2, tIN2, tBD1, tIN1];
    for (let i = 0; i < 4; i++) {
      const p = pump(t, lay[i] - 0.05, 0.15, 1.1) + 0.7 * pump(t, [0, tSer5, tDua2, tDah5][i] || -99, 0.15, 1.0);
      PULSE[1 + i] = p; nest[i].material.emissiveIntensity = 0.32 * p;
      const win = (a, b) => smooth(clamp01((t - a) / 0.35)) * (1 - smooth(clamp01((t - b) / 0.35)));
      const hid = i === 3 ? 1 : (1 - win(tDah + 0.2, K.s2e + 0.5)) * (1 - win(i === 2 ? tDah5 - 0.35 : tDua2 - 0.35, K.s5e + 0.6));
      scaleIn(NT[i], (i === 3 ? 1 : pop(t, lay[i] - 0.2, 0.45)) * hid);
    }
    PULSE[4] = Math.max(PULSE[4], pump(t, tLap + 0.9, 0.15, 1.0));
    // payoff: India layers of the nest become Bangladesh
    for (const i of [1, 3]) { const u = smooth(clamp01((t - tSimp - 0.1 * i) / 0.9)); nest[i].material.color.set(F_IN).lerp(cBDp, u); nest[i].material.sheenColor.copy(nest[i].material.color).lerp(new THREE.Color(1, 1, 1), 0.45); }
    const nf = 1 - smooth(clamp01((t - tSimp + 0.2) / 0.6));
    NT[1].scale.setScalar(Math.max(0.001, NT[1].scale.x * nf)); NT[3].scale.setScalar(Math.max(0.001, nf)); NT[1].visible = NT[3].visible = nf > 0.01;
    // counts
    [tSer5, tDua2, tDah5].forEach((a, i) => scaleIn(CT[i], pop(t, a - 0.25, 0.45) * nf * (i === 0 ? 1 - smooth(clamp01((t - tDua2 + 0.35) / 0.35)) * (1 - smooth(clamp01((t - K.s5e - 0.6) / 0.35))) : 1)));
    scaleIn(chit, pop(t, tChit - 0.1, 0.45));
    // KONON props drop in
    cards.forEach((G, i) => { const u = eout(clamp01((t - (tKar - 0.5 + i * 0.12)) / 0.45)); G.visible = u > 0; G.position.z = [0.02, 0.05, 0.08][i] + 2.2 * (1 - u) * (1 - u); });
    { const u = clamp01((t - (tCat - 0.35)) / 0.4); kingG.visible = u > 0; kingG.position.z = 2.6 * (1 - u) * (1 - u); kingG.rotation.z = 0.3 * (1 - u); }
    scaleIn(kononTag, pop(t, tKon - 0.05, 0.45));
    plaque.userData.face.material.emissive = plaque.userData.face.material.emissive || new THREE.Color();
    plaque.userData.face.material.emissive.setRGB(0.5, 0.36, 0.12); plaque.userData.face.material.emissiveIntensity = 0.5 * pump(t, t1713 - 0.1, 0.2, 1.6) + 0.12 * pump(t, tCatat, 0.3, 2);
    // 1947 map
    const uK = smooth(clamp01((t - tKoch + 0.2) / 0.9)), uP = smooth(clamp01((t - tPak + 0.2) / 0.9));
    topPiece.material.color.set(F_RAW).lerp(cINr, uK); botPiece.material.color.set(F_RAW).lerp(cBDr, uP);
    scaleIn(tag47, pop(t, t47, 0.4)); scaleIn(tagKoch, pop(t, tKoch - 0.1, 0.45)); scaleIn(tagPak, pop(t, tPak - 0.1, 0.45));
    for (let i = 0; i < EN.length; i++) {
      const e = EN[i], u = back(clamp01((t - e.tIn) / 0.3), 1.6);
      const sw = smooth(clamp01((t - e.tSw) / 0.35)), flat = smooth(clamp01((t - e.tSw - 1.2) / 0.6));
      const s = Math.max(0.001, e.r * u);
      vp.set(e.u, e.v, regH - 0.02 - 0.03 * flat); qz.setFromAxisAngle(vz, e.rot); vs.set(s * e.sq, s, Math.max(0.05, 1 - 0.85 * flat) * (u > 0 ? 1 : 0.001));
      mtx.compose(vp, qz, vs); enMesh.setMatrixAt(i, mtx);
      if (e.side < 0) cTmp.copy(cINp).lerp(cBDr, sw); else cTmp.copy(cBDp).lerp(cINr, sw);
      const gl = pump(t, e.tSw, 0.1, 0.6); cTmp.lerp(new THREE.Color(1, 0.92, 0.7), 0.35 * gl);
      enMesh.setColorAt(i, cTmp);
    }
    enMesh.instanceMatrix.needsUpdate = true; if (enMesh.instanceColor) enMesh.instanceColor.needsUpdate = true;
    // village
    HS.forEach((h2) => { const u = back(clamp01((t - h2.t) / 0.35), 1.7); h2.G.scale.setScalar(Math.max(0.001, u * h2.s)); h2.G.visible = u > 0.001; });
    scaleIn(census, pop(t, tLima - 0.35, 0.5)); scaleIn(census2, pop(t, tSen + 1.2, 0.45));
    // clock: ten past ten, spins forward 41 years, settles on midnight
    const sp = smooth(clamp01((t - tBaru) / Math.max(1, tTeng - tBaru)));
    const bB = 608 + 0.4 * Math.max(0, tBaru - K.s7);
    const mm = t < tBaru ? 608 + 0.4 * Math.max(0, t - K.s7) : t >= tTeng ? 1440 : bB + sp * (1440 - bB);
    hMin.rotation.z = -(mm % 60) / 60 * 6.2832; hHr.rotation.z = -((mm / 60) % 12) / 12 * 6.2832;
    clockGlow.intensity = 6 * pump(t, tTeng, 0.15, 2.2) + 1.2 * smooth(clamp01((t - tTeng) / 0.5)) * (1 - smooth(clamp01((t - tSer7 - 2) / 2)));
    scaleIn(dateTag, pop(t, tTeng - 0.05, 0.45));
    { const w = (a, b) => smooth(clamp01((t - a) / 0.3)) * (1 - smooth(clamp01((t - b) / 0.3))); scaleIn(audTag, Math.max(w(tBD2 + 0.2, K.s1e + 0.8), smooth(clamp01((t - tPeta) / 0.4)))); }
    // AUDIRA label glints in the payoff light sweep
    audTag.userData.face.material.emissive = audTag.userData.face.material.emissive || new THREE.Color();
    audTag.userData.face.material.emissive.setRGB(0.5, 0.35, 0.12); audTag.userData.face.material.emissiveIntensity = 0.5 * pump(t, A("s8:AUDIRA") - 0.1, 0.25, 1.5);

    updSet(SILK, t); updSet(GOLDS, t);

    // needle
    let job = null; for (const j of JOBS) if (t >= j[0] - 0.25 && t <= j[1] + 0.35) job = j;
    needle.visible = !!job;
    if (job) {
      const f = clamp01((t - job[0]) / (job[1] - job[0])), p = job[2](f);
      const dip = 0.5 + 0.5 * Math.cos(t * 26), lift = 0.04 + 0.22 * dip + 0.6 * (1 - smooth(clamp01((t - job[0] + 0.25) / 0.25))) + 0.6 * smooth(clamp01((t - job[1]) / 0.35));
      needle.position.set(p[0], p[1], job[3] + lift); needle.rotation.set(0.6, 0, -0.5);
      // live thread from the eye back to the last stitch
      const eyeL = new THREE.Vector3(0, 1.5, 0).applyEuler(needle.rotation).add(needle.position);
      const back2 = job[2](Math.max(0, f - 0.03));
      const curve = new THREE.CatmullRomCurve3([eyeL, new THREE.Vector3((eyeL.x + p[0]) / 2 - 0.3, (eyeL.y + p[1]) / 2 + 0.4, eyeL.z + 0.4), new THREE.Vector3(eyeL.x - 1.2, eyeL.y + 1.6, eyeL.z + 0.2)]);
      if (threadMesh) { threadMesh.geometry.dispose(); C.remove(threadMesh); }
      threadM.color.setHex(job[4]);
      threadMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.014, 6), threadM); threadMesh.castShadow = true; C.add(threadMesh);
      void back2; void tmpA; void tmpB;
    } else if (threadMesh) { threadMesh.visible = false; }
    if (threadMesh && job) threadMesh.visible = true;

    comp.render();
  };
}
