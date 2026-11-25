// EP37 TUVALU & DOMAIN .TV: Y2KCHROME. Units are loose metres; sea level y = 0; Funafuti atoll centred at the origin.
// Sky: aqua gradient dome (CanvasTexture) + glossy clouds on the horizon. Env map: RoomEnvironment lights inside the same
// gradient sky plus softbox panels and pink / lime / cyan streaks, so every chrome surface reflects something.
// S1  chrome browser in the sky (0, 22, 3): address "http://www.twitch" + 3D ".tv"; the letters hop out, fall and land
//     as giant liquid-chrome letters on the north motu of Funafuti (bounce, splash, sparkles).
// S2  atoll: lagoon, reef ring, deep ocean, motus with palms; overview of the 9-island chain (name pills); tags
//     26 km² and 10.643 jiwa; chrome ruler 4,6 m beside the letters; AUDIRA buoy in the lagoon.
// S3–S6 floating chrome stations on a ring (R 32) south-west of the atoll, each tied to the letters by a light cable:
//     C country-code plaques .id/.jp/.tv + chrome TV · D 1998 coin US$50 JUTA + Information.CA → Verisign tags
//     E Twitch price tag US$1 MILIAR + payment bar ≈5 · F glass revenue column 8,4% (2019) + bars 5 vs 10 (GoDaddy 2021)
// S7  back at the atoll: the sea rises, a bubble holds a wireframe digital replica, a dashed arc runs to Australia
//     (Falepili 2023); the letters glitch on "dihapus". S8 wide pull-back with an AUDIRA plaque in the foreground.
// Everything is a function of t.

const FONTS = ['800 80px "Syne"', '700 80px "Syne"', '800 80px "JetBrains Mono"', '700 80px "JetBrains Mono"', '500 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "Tuvalu .tv 1998 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";

const SY = 'Syne, "Trebuchet MS", sans-serif', JB = '"JetBrains Mono", Consolas, monospace';
const NAVY = "#06306E";
const ENV = 1.0;
const D2R = Math.PI / 180;

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

// ---------- canvas painting ----------
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// glossy aero face: white top, aqua bottom, hard gloss split, soft top highlight
function gloss(g, w, h, r, o = {}) {
  const c = o.cols || ["#FFFFFF", "#F1FBFF", "#C9ECFF", "#E8F8FF"];
  rr(g, 0, 0, w, h, r); const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, c[0]); gr.addColorStop(0.48, c[1]); gr.addColorStop(0.52, c[2]); gr.addColorStop(1, c[3]);
  g.fillStyle = gr; g.fill();
  g.save(); rr(g, 0, 0, w, h, r); g.clip();
  const hl = g.createLinearGradient(0, 0, 0, h * 0.45); hl.addColorStop(0, "rgba(255,255,255,.9)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = hl; rr(g, w * 0.04, h * 0.03, w * 0.92, h * 0.4, r * 0.8); g.fill();
  g.restore();
}
function gtext(g, txt, x, y, size, o = {}) {
  let font = o.font || `800 ${size}px ${JB}`;
  g.font = font; g.textAlign = o.align || "center"; g.textBaseline = "alphabetic";
  const maxW = o.maxW ?? ((o.align || "center") === "center" ? g.canvas.width * 0.9 : 1e9), mw = g.measureText(txt).width;
  if (mw > maxW) { size = size * maxW / mw; font = font.replace(/[\d.]+px/, size.toFixed(1) + "px"); g.font = font; }
  if (o.ls) g.letterSpacing = o.ls + "px";
  if (o.kind === "navy" || o.kind === "white" || o.col) {
    if (o.kind === "white") { g.lineWidth = size * 0.1; g.strokeStyle = "rgba(6,48,110,.75)"; g.strokeText(txt, x, y); }
    g.fillStyle = o.col || (o.kind === "white" ? "#FFFFFF" : NAVY); g.fillText(txt, x, y);
  } else {
    g.lineWidth = size * 0.12; g.strokeStyle = "rgba(255,255,255,.95)"; g.lineJoin = "round"; g.strokeText(txt, x, y);
    const gr = g.createLinearGradient(0, y - size * 0.78, 0, y + size * 0.04);
    gr.addColorStop(0, "#0B3C9C"); gr.addColorStop(0.46, "#1667D9"); gr.addColorStop(0.54, "#00A3FF"); gr.addColorStop(1, "#0B4FB8");
    g.fillStyle = gr; g.fillText(txt, x, y);
  }
  if (o.ls) g.letterSpacing = "0px";
}
function star5(g, cx, cy, R, col) {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.4 : R; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  g.closePath(); g.fill();
}
function unionJack(g, x, y, w, h) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = "#012169"; g.fillRect(x, y, w, h);
  const line = (lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke(); };
  line(h * 0.2, "#FFFFFF"); line(h * 0.07, "#C8102E");
  g.fillStyle = "#FFFFFF"; g.fillRect(x + w / 2 - h * 0.17, y, h * 0.34, h); g.fillRect(x, y + h / 2 - h * 0.17, w, h * 0.34);
  g.fillStyle = "#C8102E"; g.fillRect(x + w / 2 - h * 0.1, y, h * 0.2, h); g.fillRect(x, y + h / 2 - h * 0.1, w, h * 0.2);
  g.restore();
}
function flag(g, code, x, y, w, h) {
  g.save(); rr(g, x, y, w, h, h * 0.08); g.clip();
  if (code === "id") { g.fillStyle = "#CE1126"; g.fillRect(x, y, w, h / 2); g.fillStyle = "#FFFFFF"; g.fillRect(x, y + h / 2, w, h / 2); }
  else if (code === "jp") { g.fillStyle = "#FFFFFF"; g.fillRect(x, y, w, h); g.fillStyle = "#BC002D"; g.beginPath(); g.arc(x + w / 2, y + h / 2, h * 0.3, 0, 6.283); g.fill(); }
  else {
    g.fillStyle = "#3A9BDC"; g.fillRect(x, y, w, h); unionJack(g, x, y, w / 2, h / 2);
    for (const [u, v] of [[0.57, 0.86], [0.62, 0.62], [0.68, 0.8], [0.72, 0.5], [0.79, 0.66], [0.82, 0.32], [0.88, 0.5], [0.9, 0.14], [0.95, 0.3]]) star5(g, x + u * w, y + v * h, h * 0.065, "#FFCE00");
  }
  g.restore();
  g.strokeStyle = "rgba(6,48,110,.35)"; g.lineWidth = 3; rr(g, x, y, w, h, h * 0.08); g.stroke();
}

// ---------- geometry ----------
function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function rrGeo(w, h, d, r, bev = 0.05) {
  const g = new THREE.ExtrudeGeometry(rrShape(w - 2 * bev, h - 2 * bev, Math.max(0.01, r - bev)), { depth: Math.max(0.001, d - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10 });
  g.translate(0, 0, -(d - 2 * bev) / 2); g.computeVertexNormals(); return g;
}
function faceGeo(w, h, r) {
  const g = new THREE.ShapeGeometry(rrShape(w, h, r), 10), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  return g;
}
// the three glyphs of ".tv" as extrudable shapes (letter units, baseline y = 0); x offsets give the spacing
function glyphs() {
  const dot = rrShape(0.3, 0.3, 0.1); dot.userData = { cx: 0.15, cy: 0.15 };
  const t = new THREE.Shape();
  t.moveTo(0.0, 1.12); t.lineTo(0.25, 1.12); t.lineTo(0.25, 0.82); t.lineTo(0.52, 0.82); t.lineTo(0.52, 0.62); t.lineTo(0.25, 0.62); t.lineTo(0.25, 0.32);
  t.quadraticCurveTo(0.25, 0.2, 0.38, 0.2); t.lineTo(0.52, 0.2); t.lineTo(0.52, 0.0); t.lineTo(0.34, 0.0); t.quadraticCurveTo(0.0, 0.0, 0.0, 0.32);
  t.lineTo(0.0, 0.62); t.lineTo(-0.17, 0.62); t.lineTo(-0.17, 0.82); t.lineTo(0.0, 0.82); t.closePath();
  const v = new THREE.Shape();
  v.moveTo(0.0, 0.82); v.lineTo(0.26, 0.82); v.lineTo(0.43, 0.24); v.lineTo(0.6, 0.82); v.lineTo(0.86, 0.82); v.lineTo(0.56, 0.0); v.lineTo(0.3, 0.0); v.closePath();
  return [{ s: dot, x: 0.0, cx: 0.15 }, { s: t, x: 0.56, cx: 0.17 }, { s: v, x: 1.2, cx: 0.43 }];
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x3fb8ff, exp: 0.9, bloom: [0.14, 0.35, 0.9], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.86;
  bp.threshold = 1.05; bp.strength = 0.08; bp.radius = 0.28;
  cam.far = 2400; cam.updateProjectionMatrix();
  const q = mulberry(37);

  // ---------- sky ----------
  const skyT = canvasTex(16, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#1259E8"); gr.addColorStop(0.2, "#2C8EF6"); gr.addColorStop(0.36, "#3FB8FF"); gr.addColorStop(0.47, "#B9EEFF");
    gr.addColorStop(0.5, "#E9FBFF"); gr.addColorStop(0.53, "#BFF1EC"); gr.addColorStop(1, "#7EE8D6");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  scene.background = skyT;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1800, 64, 32), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false }));
  dome.renderOrder = -10; scene.add(dome);
  scene.fog = new THREE.FogExp2(0xd2f3ff, 0.0021);

  // env: RoomEnvironment's boxes and light inside the same aqua sky, softboxes and iridescent streaks
  {
    const env = new RoomEnvironment();
    env.traverse((o) => { if (o.isMesh && o.material && o.material.side === THREE.BackSide) o.visible = false; });
    const envT = canvasTex(16, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1259E8"); gr.addColorStop(0.3, "#3FB8FF"); gr.addColorStop(0.47, "#CFF6FF"); gr.addColorStop(0.5, "#FFFFFF"); gr.addColorStop(0.53, "#2A8FC8"); gr.addColorStop(0.7, "#0E4C8A"); gr.addColorStop(1, "#062A5A"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const sk = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), new THREE.MeshBasicMaterial({ map: envT, side: THREE.BackSide }));
    sk.position.y = 3.5; env.add(sk);
    const panel = (w, h, c, i, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y + 3.5, z); m.lookAt(0, 3.5, 0); env.add(m); };
    panel(14, 5, "#FFFFFF", 3.2, 0, 22, 10); panel(5, 14, "#FFFFFF", 2.2, -22, 5, 6); panel(4, 12, "#FFFFFF", 1.8, 20, 3, -10);
    // stripes below the horizon toward the camera side: vertical chrome faces seen from above reflect this band
    panel(30, 0.5, "#FF8AD8", 2.6, 0, -2.6, 22); panel(30, 1.3, "#02102E", 1.0, 0, -3.8, 22); panel(30, 1.1, "#FFFFFF", 2.4, 0, -5.6, 22);
    panel(30, 0.4, "#6AF5FF", 2.6, 0, -6.8, 22); panel(30, 1.6, "#02102E", 1.0, 0, -8.0, 22); panel(30, 1.0, "#FFFFFF", 2.0, 0, -9.8, 22); panel(30, 2.0, "#0A2C66", 1.0, 0, -12, 22);
    panel(26, 1.6, "#FFFFFF", 3.6, 0, 5.5, 22);
    panel(1.6, 16, "#FFFFFF", 3.2, -9, 4, 20); panel(1.2, 16, "#FFFFFF", 2.6, 10, 4, 19); panel(3, 16, "#04163A", 1.0, 3, 4, 21);
    panel(30, 0.8, "#FF8AD8", 1.6, 0, 2, -26); panel(30, 0.6, "#B8FF6A", 1.3, 0, -4, 26); panel(0.8, 22, "#6AF5FF", 1.6, 26, 0, 6);
    const pm = new THREE.PMREMGenerator(r);
    scene.environment = pm.fromScene(env, 0.02).texture;
  }
  const ENVT = scene.environment;
  // the ocean reflects only a smooth sky gradient (no softboxes), so ripples never catch big white patches
  const ENVSKY = (() => { const sc = new THREE.Scene(); sc.add(new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide }))); return new THREE.PMREMGenerator(r).fromScene(sc, 0.04).texture; })();
  scene.environmentIntensity = 0.45; // r186: scene.environment ignores material.envMapIntensity; chrome gets envMap directly below

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight(0xd8f4ff, 0x1a6fa0, 0.45); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.1);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 120 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0xbfe9ff, 0.6); rim.position.set(30, 18, -40); scene.add(rim);

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const add = (m, p = scene, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const phys = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.3, metalness: 0, envMapIntensity: ENV, ...o });
  const chromeM = phys({ color: 0xf2f6fa, metalness: 1, roughness: 0.05, iridescence: 0.35, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] });
  const chromeB = phys({ color: 0xa9d0ff, metalness: 1, roughness: 0.08, iridescence: 0.25, iridescenceIOR: 1.5 });
  const chromeP = phys({ color: 0xffb8e8, metalness: 1, roughness: 0.08, iridescence: 0.5, iridescenceIOR: 1.6, iridescenceThicknessRange: [250, 700] });
  const whiteM = phys({ color: 0xf4faff, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06 });
  const aquaM = phys({ color: 0x3fb8ff, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 });
  const glassM = phys({ color: 0xd2f0ff, roughness: 0.03, transparent: true, opacity: 0.34, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.6 });
  const bubbleM = phys({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.15, iridescence: 1, iridescenceIOR: 1.3, iridescenceThicknessRange: [180, 820], clearcoat: 1, depthWrite: false, envMapIntensity: 2.2 });
  const glowT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(200,245,255,.5)"); gr.addColorStop(1, "rgba(160,230,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const sparkT = canvasTex(256, 256, (g) => {
    const core = g.createRadialGradient(128, 128, 0, 128, 128, 60); core.addColorStop(0, "rgba(255,255,255,1)"); core.addColorStop(0.25, "rgba(220,245,255,.6)"); core.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = core; g.fillRect(0, 0, 256, 256);
    for (const hz of [true, false]) { const gr = hz ? g.createLinearGradient(0, 128, 256, 128) : g.createLinearGradient(128, 0, 128, 256); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; if (hz) g.fillRect(0, 125, 256, 6); else g.fillRect(125, 0, 6, 256); }
  });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,40,80,.55)"); gr.addColorStop(0.6, "rgba(0,40,80,.22)"); gr.addColorStop(1, "rgba(0,40,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, y, z, o = 0.6, p = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  // chrome-framed glossy plaque; face painted on a canvas
  const plaque = (w, h, paint, o = {}) => {
    const P = new THREE.Group(), d = o.d ?? 0.16, rad = o.r ?? Math.min(w, h) * 0.2, ins = o.ins ?? 0.08;
    add(new THREE.Mesh(rrGeo(w, h, d, rad, Math.min(0.05, d * 0.3)), o.frame || chromeM), P);
    const px = o.px ?? 380, tw = Math.round((w - 2 * ins) * px), th = Math.round((h - 2 * ins) * px);
    const tx = label(tw, th, paint);
    const f = new THREE.Mesh(faceGeo(w - 2 * ins, h - 2 * ins, Math.max(0.02, rad - ins)), phys({ map: tx, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.1, envMapIntensity: 0.2, transparent: !!o.transparent }));
    f.position.z = d / 2 + 0.004; P.add(f); P.userData.face = f;
    return P;
  };
  const pillPaint = (lines, o = {}) => (g, w, h) => {
    gloss(g, w, h, Math.min(w, h) * (o.round ?? 0.28), o);
    lines.forEach(([txt, y, size, kind, font]) => gtext(g, txt, w / 2, h * y, size, { kind, font }));
  };
  const sprite = (tex, sx, sy, o = {}) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, sizeAttenuation: o.att ?? true, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false, opacity: o.opacity ?? 1 })); s.scale.set(sx, sy, 1); s.renderOrder = o.order ?? 6; scene.add(s); return s; };

  // ---------- water ----------
  const waterN = (() => {
    const N = 512, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d");
    const hgt = new Float32Array(N * N), qq = mulberry(11);
    for (let k = 0; k < 260; k++) {
      const cx = qq() * N, cy = qq() * N, s = 6 + qq() * 26, a = (qq() - 0.5) * 2;
      for (let y = Math.floor(cy - 3 * s); y < cy + 3 * s; y++) for (let x = Math.floor(cx - 3 * s); x < cx + 3 * s; x++) {
        const dx = x - cx, dy = y - cy, v = a * Math.exp(-(dx * dx + dy * dy * 2.2) / (2 * s * s));
        hgt[((y + N) % N) * N + ((x + N) % N)] += v;
      }
    }
    const im = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const hx = hgt[y * N + (x + 1) % N] - hgt[y * N + (x + N - 1) % N], hy = hgt[((y + 1) % N) * N + x] - hgt[((y + N - 1) % N) * N + x];
      const nx = -hx * 2.2, ny = -hy * 2.2, l = Math.hypot(nx, ny, 1), i = (y * N + x) * 4;
      im.data[i] = (nx / l * 0.5 + 0.5) * 255; im.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; im.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  })();
  const oceanN = waterN.clone(); oceanN.needsUpdate = true; oceanN.repeat.set(900, 900);
  const ocean = add(new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), phys({ color: 0x063a6e, roughness: 0.32, normalMap: oceanN, normalScale: new THREE.Vector2(0.14, 0.14), clearcoat: 0, envMapIntensity: 0.12 })), scene, false);
  ocean.rotation.x = -Math.PI / 2;
  // atoll water: shallow shelf, foam reef ring and a turquoise lagoon with sand patches, fading into the deep ocean
  const RA = 8, WS = 64; // ring radius, size of the painted water square
  const atollWaterT = canvasTex(2048, 2048, (g, w, h) => {
    const cx = w / 2, px = w / WS, qq = mulberry(5);
    const gr = g.createRadialGradient(cx, cx, 0, cx, cx, w / 2);
    const st = (r, c) => gr.addColorStop(Math.min(1, r * px / (w / 2)), c);
    st(0, "rgba(14,128,168,1)"); st(RA - 3.4, "rgba(24,160,186,1)"); st(RA - 2.0, "rgba(60,200,200,1)"); st(RA - 1.2, "rgba(170,232,206,1)"); st(RA - 0.6, "rgba(236,226,186,1)");
    st(RA + 0.5, "rgba(236,252,248,1)"); st(RA + 1.1, "rgba(70,196,222,1)"); st(RA + 2.6, "rgba(18,120,186,1)"); st(RA + 6, "rgba(8,78,140,.9)"); st(RA + 12, "rgba(7,66,122,.5)"); st(WS / 2, "rgba(7,66,122,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { // sand patches inside the lagoon
      const a = qq() * 6.283, rad = qq() * (RA - 1.6) * px, x = cx + Math.cos(a) * rad, y = cx + Math.sin(a) * rad, s = (0.6 + qq() * 2.2) * px;
      const p = g.createRadialGradient(x, y, 0, x, y, s); p.addColorStop(0, `rgba(190,246,232,${0.15 + qq() * 0.25})`); p.addColorStop(1, "rgba(190,246,232,0)"); g.fillStyle = p; g.fillRect(x - s, y - s, 2 * s, 2 * s);
    }
    g.save(); g.beginPath(); g.arc(cx, cx, (RA - 1.4) * px, 0, 6.283); g.clip(); // caustic net on the lagoon floor
    for (let i = 0; i < 1400; i++) { const x = qq() * w, y = qq() * h, rad = 6 + qq() * 22, a0 = qq() * 6.283; g.strokeStyle = `rgba(200,255,250,${0.12 + qq() * 0.2})`; g.lineWidth = 1.5 + qq() * 2; g.beginPath(); g.arc(x, y, rad, a0, a0 + 1.6 + qq() * 2); g.stroke(); }
    g.restore();
    for (let i = 0; i < 2600; i++) { // foam flecks on the reef
      const a = qq() * 6.283, rad = (RA + (qq() - 0.4) * 1.5) * px, x = cx + Math.cos(a) * rad, y = cx + Math.sin(a) * rad;
      g.fillStyle = `rgba(255,255,255,${0.25 + qq() * 0.5})`; g.beginPath(); g.arc(x, y, 1 + qq() * 3, 0, 6.283); g.fill();
    }
  });
  const lagoonN = waterN.clone(); lagoonN.needsUpdate = true; lagoonN.repeat.set(10, 10);
  const lagoonM = phys({ color: 0xffffff, map: atollWaterT, transparent: true, roughness: 0.14, normalMap: lagoonN, normalScale: new THREE.Vector2(0.3, 0.3), clearcoat: 0.25, depthWrite: false, envMapIntensity: 0.32 });
  const waterPlanes = [];
  const lagoon = (x, z, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(WS * s, WS * s), lagoonM); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); m.renderOrder = 1; m.receiveShadow = true; scene.add(m); waterPlanes.push(m); return m; };

  // ---------- islands ----------
  const sandT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#F4E6BE"; g.fillRect(0, 0, w, h); const qq = mulberry(3); for (let i = 0; i < 9000; i++) { const v = qq(); g.fillStyle = v < 0.5 ? `rgba(170,140,90,${0.08 + qq() * 0.12})` : `rgba(255,255,245,${0.2 + qq() * 0.3})`; g.fillRect(qq() * w, qq() * h, 1 + qq() * 2, 1 + qq() * 2); } }, [6, 1]);
  const vegT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#3D9C48"; g.fillRect(0, 0, w, h); const qq = mulberry(4); for (let i = 0; i < 700; i++) { const x = qq() * w, y = qq() * h, s = 4 + qq() * 16; const p = g.createRadialGradient(x, y, 0, x, y, s); const c = qq() < 0.5 ? "28,110,52" : "120,190,80"; p.addColorStop(0, `rgba(${c},.55)`); p.addColorStop(1, `rgba(${c},0)`); g.fillStyle = p; g.fillRect(x - s, y - s, 2 * s, 2 * s); } }, [8, 1]);
  const sandM = new THREE.MeshStandardMaterial({ map: sandT, color: 0xffffff, roughness: 0.92, envMapIntensity: 0.4 });
  const vegM = new THREE.MeshStandardMaterial({ map: vegT, roughness: 0.78, envMapIntensity: 0.5 });
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x9c7650, roughness: 0.85 });
  const frondM = new THREE.MeshStandardMaterial({ color: 0x2f9a48, roughness: 0.6, side: THREE.DoubleSide, envMapIntensity: 0.6 });
  // a flattened torus arc between azimuths th0..th1 (deg; 0 = +z, 90 = +x), with rounded end caps
  const arcMound = (cx, cz, R, th0, th1, w, hgt, mat, y0 = 0) => {
    const g = new THREE.TorusGeometry(R, w, 10, Math.max(8, Math.round((th1 - th0) / 3)), (th1 - th0) * D2R);
    g.rotateZ((90 - th1) * D2R); g.rotateX(-Math.PI / 2); g.scale(1, hgt / w, 1);
    const m = add(new THREE.Mesh(g, mat)); m.position.set(cx, y0, cz);
    for (const th of [th0, th1]) { const c = add(new THREE.Mesh(new THREE.SphereGeometry(w, 14, 8), mat)); c.scale.set(1, hgt / w, 1); c.position.set(cx + R * Math.sin(th * D2R), y0, cz + R * Math.cos(th * D2R)); }
    return m;
  };
  const palms = [];
  const motu = (cx, cz, R, th0, th1, w, skip, dens = 0.9) => {
    arcMound(cx, cz, R, th0, th1, w, 0.32, sandM);
    if (w >= 0.5) {
      const segs = skip ? [[th0 + 4, skip[0]], [skip[1], th1 - 4]] : [[th0 + 4, th1 - 4]];
      for (const [a0, a1] of segs) if (a1 - a0 > 3) {
        arcMound(cx, cz, R, a0, a1, w * 0.6, 0.55, vegM);
        const n = Math.max(1, Math.round((a1 - a0) * D2R * R * dens));
        for (let i = 0; i < n; i++) { const th = (a0 + (a1 - a0) * (i + 0.5) / n + (q() - 0.5) * 3) * D2R, rr2 = R + (q() - 0.5) * w * 0.9; palms.push([cx + rr2 * Math.sin(th), 0.42, cz + rr2 * Math.cos(th), 1.0 + q() * 0.55, q() * 6.28, (q() - 0.5) * 0.35]); }
      }
    }
  };
  // Funafuti (hero): motus on the reef ring, the north motu carries the letters
  for (const [a, b, w, sk] of [[138, 222, 1.3, [158, 202]], [62, 112, 0.8], [20, 46, 0.6], [-40, -8, 0.75], [-102, -58, 0.85], [-128, -112, 0.55], [118, 130, 0.45]]) motu(0, 0, RA, a, b, w, sk);
  lagoon(0, 0, 1);
  // the other eight islands of the chain, NW–SE (stylised spacing, enlarged so they read)
  const DIRN = new THREE.Vector3(-1, 0, -1).normalize();
  const ISL = [["Nanumea", 116, 6, 3.4], ["Niutao", 100, -14, 2.6], ["Nanumanga", 86, 4, 2.6], ["Nui", 70, -6, 3.0], ["Vaitupu", 50, 6, 3.2], ["Nukufetau", 28, -8, 3.4], ["Funafuti", 0, 0, RA], ["Nukulaelae", -24, 7, 3.0], ["Niulakita", -42, -4, 2.2]];
  const islPos = ISL.map(([n, s, l, rad]) => [n, s * DIRN.x + l * 0.707, s * DIRN.z - l * 0.707, rad]);
  islPos.forEach(([n, x, z, rad], i) => {
    if (n === "Funafuti") return;
    const off = q() * 360;
    motu(x, z, rad, off, off + 150, 0.55, null, 0.5); motu(x, z, rad, off + 175, off + 290, 0.5, null, 0.5); motu(x, z, rad, off + 310, off + 345, 0.4);
    lagoon(x, z, rad / RA * 1.15);
  });
  // palms: instanced trunks and fronds
  const frondGeo = (() => { const g = new THREE.PlaneGeometry(0.2, 0.95, 1, 6); g.translate(0, 0.475, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -0.42 * y * y); p.setX(i, p.getX(i) * (1 - 0.55 * y)); } g.rotateX(-Math.PI / 2); g.computeVertexNormals(); return g; })();
  const NF = 7;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.045, 0.07, 1, 7).translate(0, 0.5, 0), trunkM, palms.length);
  const fronds = new THREE.InstancedMesh(frondGeo, frondM, palms.length * NF);
  trunks.castShadow = fronds.castShadow = true; trunks.receiveShadow = fronds.receiveShadow = true;
  { const m = new THREE.Matrix4(), qt = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    palms.forEach(([x, y, z, h, ry, lean], i) => {
      e.set(lean, ry, lean * 0.6); qt.setFromEuler(e); s.set(1, h, 1); p.set(x, y, z); m.compose(p, qt, s); trunks.setMatrixAt(i, m);
      const top = new THREE.Vector3(0, h, 0).applyQuaternion(qt).add(p);
      for (let k = 0; k < NF; k++) { e.set(-0.25 - (k % 2) * 0.25, ry + k * 6.283 / NF, 0, "YXZ"); qt.setFromEuler(e); s.setScalar(0.8 + 0.25 * ((k * 7) % 3) / 2); m.compose(top, qt, s); fronds.setMatrixAt(i * NF + k, m); }
    });
  }
  scene.add(trunks, fronds);

  // ---------- giant .tv letters ----------
  const GL = glyphs(), S1 = 3.0, S0 = 0.42;
  const letterM = phys({ color: 0xffffff, metalness: 1, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0.55, iridescenceIOR: 1.6, iridescenceThicknessRange: [220, 700], envMapIntensity: 1.35, transparent: true });
  const letters = GL.map((L, i) => {
    let geo;
    if (i === 0) { geo = new THREE.SphereGeometry(0.2, 48, 32); geo.translate(0, 0.2, 0); }
    else { geo = new THREE.ExtrudeGeometry(L.s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.065, bevelSegments: 6, curveSegments: 18 }); geo.translate(-L.cx, 0, -0.15); geo.computeVertexNormals(); }
    const m = add(new THREE.Mesh(geo, letterM));
    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x6af5ff, wireframe: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.add(wire);
    return { m, wire, x: L.x + L.cx };
  });
  const LW = 2.06; // full word width in letter units
  const finalPos = (i) => new THREE.Vector3((letters[i].x - LW / 2) * S1, 0.26, -RA);
  const shadowLetters = blob(LW * S1 * 1.15, 2.4, 0, 0.34, -RA + 0.2, 0.0);

  // ---------- chrome browser in the sky ----------
  const BRP = new THREE.Vector3(0, 22, 3);
  const BR = G(BRP.x, BRP.y, BRP.z);
  add(new THREE.Mesh(rrGeo(6.4, 4.9, 0.34, 0.5, 0.08), chromeM), BR);
  const pageT = label(1220, 920, (g, w, h) => {
    rr(g, 0, 0, w, h, 60); g.fillStyle = "#EAF8FF"; g.fill();
    g.save(); rr(g, 0, 0, w, h, 60); g.clip();
    const tb = g.createLinearGradient(0, 0, 0, 120); tb.addColorStop(0, "#7FD4FF"); tb.addColorStop(0.5, "#2C8EF6"); tb.addColorStop(0.52, "#1259E8"); tb.addColorStop(1, "#3FA0FF");
    g.fillStyle = tb; g.fillRect(0, 0, w, 120);
    gtext(g, "AUDIRA NET 98", 300, 82, 50, { kind: "white", align: "left", font: `800 50px ${SY}` });
    [["#FF8AD8", 70], ["#FFE45C", 150], ["#B8FF6A", 230]].forEach(([c, x]) => { const b = g.createRadialGradient(x - 10, 50, 2, x, 60, 30); b.addColorStop(0, "#FFFFFF"); b.addColorStop(0.4, c); b.addColorStop(1, c); g.fillStyle = b; g.beginPath(); g.arc(x, 60, 28, 0, 6.283); g.fill(); });
    const bd = g.createLinearGradient(0, 260, 0, h); bd.addColorStop(0, "#D9F4FF"); bd.addColorStop(1, "#9FE3F0"); g.fillStyle = bd; g.fillRect(0, 260, w, h - 260);
    // a retro TV icon and a loading bar
    g.save(); g.translate(150, 360); gloss(g, 330, 250, 50, { cols: ["#FFFFFF", "#EAF6FF", "#BFE6FF", "#DDF3FF"] });
    rr(g, 30, 30, 270, 190, 34); const sc = g.createLinearGradient(0, 30, 0, 220); sc.addColorStop(0, "#3FB8FF"); sc.addColorStop(1, "#1259E8"); g.fillStyle = sc; g.fill();
    g.fillStyle = "#FFFFFF"; g.beginPath(); g.moveTo(135, 85); g.lineTo(135, 165); g.lineTo(205, 125); g.closePath(); g.fill();
    g.strokeStyle = "#1259E8"; g.lineWidth = 9; g.beginPath(); g.moveTo(130, -10); g.lineTo(165, 0); g.lineTo(200, -10); g.stroke(); g.restore();
    gtext(g, "SIARAN", 560, 470, 84, { font: `800 84px ${SY}`, align: "left" });
    gtext(g, "SEPANJANG MASA", 560, 550, 50, { font: `800 50px ${SY}`, align: "left", kind: "navy" });
    rr(g, 150, 700, 920, 64, 32); g.fillStyle = "rgba(6,48,110,.15)"; g.fill();
    rr(g, 150, 700, 900, 64, 32); const lb = g.createLinearGradient(0, 700, 0, 764); lb.addColorStop(0, "#B8FF6A"); lb.addColorStop(0.5, "#3FD27A"); lb.addColorStop(0.52, "#1FA85A"); lb.addColorStop(1, "#7BE39A"); g.fillStyle = lb; g.fill();
    gtext(g, "MEMUAT ... 98%", 610, 850, 44, { kind: "navy", font: `700 44px ${JB}` });
    g.restore();
  });
  { const f = new THREE.Mesh(faceGeo(6.1, 4.6, 0.4), new THREE.MeshBasicMaterial({ map: pageT, toneMapped: false })); f.position.z = 0.175; BR.add(f); }
  // address pill raised in front of the page
  const ADY = 1.3;
  add(new THREE.Mesh(rrGeo(5.6, 0.7, 0.16, 0.35, 0.05), whiteM), BR).position.set(0, ADY, 0.25);
  const addrT = label(1060, 124, (g, w, h) => {
    rr(g, 0, 0, w, h, 60); g.fillStyle = "#FFFFFF"; g.fill();
    g.strokeStyle = "rgba(18,89,232,.55)"; g.lineWidth = 5; rr(g, 3, 3, w - 6, h - 6, 58); g.stroke();
    gtext(g, "http://www.twitch", 740, 84, 58, { kind: "navy", align: "right", font: `700 58px ${JB}` });
    g.fillStyle = "#3FB8FF"; g.beginPath(); g.arc(56, h / 2, 22, 0, 6.283); g.fill();
  });
  { const f = new THREE.Mesh(faceGeo(5.3, 0.62, 0.3), new THREE.MeshBasicMaterial({ map: addrT, toneMapped: false })); f.position.set(0, ADY, 0.335); BR.add(f); }
  const cursor = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.42), new THREE.MeshBasicMaterial({ color: 0x1259e8 })); cursor.position.set(1.12, ADY, 0.34); BR.add(cursor);
  const brBob = (t) => new THREE.Vector3(BRP.x, BRP.y + Math.sin(t * 0.9) * 0.08, BRP.z);
  const letterStart = (i, t) => brBob(t).add(new THREE.Vector3(1.2 + letters[i].x * S0, ADY - 0.24, 0.42));

  // ---------- tags on the atoll (S2) ----------
  const tagStat = (big, small, w = 2.5) => plaque(w, 1.05, pillPaint([[big, 0.56, 92, null], [small, 0.86, 40, "navy", `700 40px ${JB}`]]), { r: 0.42, d: 0.14, px: 330 });
  const tKm = tagStat("26 km²", "luas daratan"); tKm.position.set(-2.5, 3.0, 0.4); tKm.rotation.y = 0.18; scene.add(tKm);
  const tPop = tagStat("10.643", "jiwa · sensus 2022", 2.7); tPop.position.set(2.5, 3.0, 0.4); tPop.rotation.y = -0.18; scene.add(tPop);
  const poles = [tKm, tPop].map((T) => { const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3, 10).translate(0, 1.5, 0), chromeM)); p.position.set(T.position.x, 0, T.position.z); return p; });
  // 4,6 m ruler beside the letters
  const RUL = G(4.25, 0, -6.55), RH = 1.15;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, RH + 0.3, 12).translate(0, (RH + 0.3) / 2, 0), chromeM), RUL);
  for (let k = 0; k <= 4; k++) add(new THREE.Mesh(new THREE.BoxGeometry(k % 2 ? 0.16 : 0.26, 0.025, 0.06), k === 4 ? chromeP : chromeB), RUL).position.set(0.08, k * RH / 4.6 * (k === 4 ? 1.15 : 1), 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.08), chromeP), RUL).position.set(0.12, RH, 0);
  const rTag = plaque(1.5, 0.62, pillPaint([["4,6 m", 0.7, 104, null]]), { r: 0.28, d: 0.12, px: 300 }); rTag.position.set(0.95, RH + 0.05, 0); RUL.add(rTag);
  const wl = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.2, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false })); wl.rotation.x = -Math.PI / 2; RUL.add(wl);
  // AUDIRA buoy in the lagoon
  const BUOY = G(2.7, 0, -3.6);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), whiteM), BUOY).scale.set(1, 0.8, 1);
  add(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 12, 40), chromeP), BUOY).rotation.x = Math.PI / 2;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8).translate(0, 0.55, 0), chromeM), BUOY).position.y = 0.25;
  const bTag = plaque(2.1, 0.66, pillPaint([["AUDIRA", 0.76, 120, null, `800 120px ${SY}`]]), { r: 0.3, d: 0.1, px: 320 }); bTag.position.set(0, 1.3, 0); BUOY.add(bTag);

  // island name pills (overview)
  const pillT = (txt, hero) => canvasTex(420, 110, (g, w, h) => { gloss(g, w, h, 54, hero ? { cols: ["#7FD4FF", "#2C8EF6", "#1259E8", "#3FA0FF"] } : {}); gtext(g, txt, w / 2, 74, 50, { kind: hero ? "white" : "navy", font: `800 50px ${SY}` }); });
  const islLabels = islPos.map(([n, x, z, rad], i) => { const tx = pillT(n, n === "Funafuti"); labels.push([tx, (g, w, h) => { g.clearRect(0, 0, w, h); gloss(g, w, h, 54, n === "Funafuti" ? { cols: ["#7FD4FF", "#2C8EF6", "#1259E8", "#3FA0FF"] } : {}); gtext(g, n, w / 2, 74, 50, { kind: n === "Funafuti" ? "white" : "navy", font: `800 50px ${SY}` }); }]); const s = sprite(tx, 0.064, 0.0168, { att: false, order: 8 }); s.position.set(x, rad * 0.5 + (n === "Funafuti" ? 6 : 2.2), z); return s; });

  // ---------- stations on the ring ----------
  const RS = 32;
  const SP = (a) => new THREE.Vector3(RS * Math.sin(a * D2R), 0, RS * Math.cos(a * D2R));
  const station = (a) => {
    const S = G(); S.position.copy(SP(a)); S.rotation.y = a * D2R;
    const P = G(0, 1.15, 0, S);
    add(new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.2, 0.3, 64), aquaM), P);
    add(new THREE.Mesh(new THREE.TorusGeometry(2.43, 0.08, 12, 96), chromeB), P).rotation.x = Math.PI / 2;
    const under = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshBasicMaterial({ map: glowT, color: 0x9ff3ff, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); under.rotation.x = Math.PI / 2; under.position.y = -0.18; P.add(under);
    const rimT = label(1600, 70, (g, w, h) => { g.fillStyle = "#EAF8FF"; g.fillRect(0, 0, w, h); for (let k = 0; k < 4; k++) gtext(g, "AUDIRA  ·  .tv  ·  TUVALU", w * (k + 0.5) / 4, 52, 40, { kind: "navy", font: `700 40px ${JB}` }); });
    const rimM = new THREE.Mesh(new THREE.CylinderGeometry(2.46, 2.21, 0.22, 64, 1, true), new THREE.MeshStandardMaterial({ map: rimT, roughness: 0.3 })); P.add(rimM);
    const shadowOn = (w, d, x, z, o = 0.5) => blob(w, d, x, 0.16, z, o, P);
    return { S, P, shadowOn, base: () => S.position };
  };
  const ANG = { C: -78, D: -50, E: -22, F: 10 };
  // C: country-code plaques and a chrome TV
  const stC = station(ANG.C);
  const codePl = [["id", ".id", "Indonesia"], ["jp", ".jp", "Jepang"], ["tv", ".tv", "Tuvalu"]].map(([c, code, name], i) => {
    const hero = c === "tv";
    const P = plaque(1.62, 1.95, (g, w, h) => {
      gloss(g, w, h, 70, hero ? { cols: ["#9FE3FF", "#3FB8FF", "#1E7FE8", "#5FC2FF"] } : {});
      flag(g, c, w * 0.18, h * 0.08, w * 0.64, w * 0.64 * 2 / 3);
      gtext(g, code, w / 2, h * 0.72, 190, hero ? { kind: "white", font: `800 190px ${JB}` } : {});
      gtext(g, name, w / 2, h * 0.9, 64, { kind: hero ? "white" : "navy", font: `800 64px ${SY}` });
    }, { r: 0.3, d: 0.18, frame: hero ? chromeB : chromeM, px: 360 });
    const H = G((i - 1) * 1.72, 0.15, i === 1 ? -0.3 : 0.15, stC.P); H.add(P); P.position.y = 1.2;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.22, 16).translate(0, 0.11, 0), chromeM), H);
    stC.shadowOn(1.8, 0.8, H.position.x, H.position.z, 0.45);
    return H;
  });
  const TVG = G(1.72, 2.75, 0.4, stC.P);
  add(new THREE.Mesh(rrGeo(1.0, 0.78, 0.5, 0.18, 0.06), chromeB), TVG);
  { const tvT = label(400, 300, (g, w, h) => { const sc = g.createLinearGradient(0, 0, 0, h); sc.addColorStop(0, "#6AF5FF"); sc.addColorStop(1, "#1259E8"); rr(g, 0, 0, w, h, 50); g.fillStyle = sc; g.fill(); for (let y = 0; y < h; y += 8) { g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, y, w, 3); } gtext(g, "TV", w / 2, 200, 150, { kind: "white", font: `800 150px ${SY}` }); });
    const f = new THREE.Mesh(faceGeo(0.78, 0.58, 0.12), new THREE.MeshBasicMaterial({ map: tvT, toneMapped: false })); f.position.z = 0.256; TVG.add(f); }
  for (const s of [-1, 1]) { const an = add(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.6, 8).translate(0, 0.3, 0), chromeM), TVG); an.position.set(s * 0.1, 0.38, 0); an.rotation.z = -s * 0.5; const tip = add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), chromeP), an); tip.position.y = 0.6; }

  // D: 1998 contract coin + transfer tags
  const stD = station(ANG.D);
  const COIN = G(-1.05, 3.15, 0, stD.P), CR = 1.62;
  add(new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, 0.3, 96).rotateX(Math.PI / 2), chromeM), COIN);
  for (const z of [-0.13, 0.13]) add(new THREE.Mesh(new THREE.TorusGeometry(CR - 0.03, 0.07, 12, 96), chromeB), COIN).position.z = z;
  const coinT = label(1024, 1024, (g, w, h) => {
    const c = w / 2, gr = g.createRadialGradient(c - 120, c - 160, 40, c, c, c); gr.addColorStop(0, "#FFFFFF"); gr.addColorStop(0.6, "#DCE8F4"); gr.addColorStop(1, "#9FB6CE");
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, 6.283); g.fill();
    for (const [rad, lw] of [[c - 40, 10], [c - 90, 4]]) { g.strokeStyle = "rgba(6,48,110,.35)"; g.lineWidth = lw; g.beginPath(); g.arc(c, c, rad, 0, 6.283); g.stroke(); }
    gtext(g, "1998", c, 300, 130, { font: `800 130px ${JB}` });
    gtext(g, "US$50", c, 580, 250, { font: `800 250px ${JB}` });
    gtext(g, "JUTA", c, 740, 140, { font: `800 140px ${SY}`, kind: "navy" });
    gtext(g, ".tv", c, 880, 90, { font: `800 90px ${JB}`, kind: "navy" });
  });
  for (const s of [1, -1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(CR - 0.12, 96), phys({ map: coinT, metalness: 0.55, roughness: 0.16, clearcoat: 1, envMapIntensity: 0.9 })); f.position.z = s * 0.152; if (s < 0) f.rotation.y = Math.PI; COIN.add(f); }
  stD.shadowOn(3.4, 1.2, -1.05, 0, 0.55);
  const glassTag = (lines, w = 1.95, h = 0.92, hero) => plaque(w, h, pillPaint(lines, hero ? { cols: ["#FFD2F0", "#FF9ADB", "#F25CBC", "#FFB8E8"] } : {}), { r: 0.3, d: 0.12, frame: hero ? chromeP : chromeB, px: 340 });
  const tagIC = glassTag([["Information.CA", 0.5, 64, "navy", `800 64px ${SY}`], ["Kanada · 1998", 0.83, 46, "navy", `700 46px ${JB}`]], 2.1); tagIC.position.set(1.45, 4.15, 0.45); stD.P.add(tagIC);
  const tagVS = glassTag([["Verisign", 0.5, 74, "white", `800 74px ${SY}`], ["2001", 0.84, 48, "white", `700 48px ${JB}`]], 2.1, 0.92, true); tagVS.position.set(1.45, 2.05, 0.45); stD.P.add(tagVS);
  const rail = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 10), chromeM), stD.P); rail.position.set(2.55, 3.1, 0.45);
  const contract = plaque(0.9, 0.62, (g, w, h) => { gloss(g, w, h, 40); gtext(g, "KONTRAK", w / 2, h * 0.44, 66, { kind: "navy", font: `800 66px ${SY}` }); gtext(g, ".tv", w / 2, h * 0.84, 86, {}); }, { r: 0.12, d: 0.06, px: 300 });
  stD.P.add(contract);

  // E: Twitch price tag + payment bar
  const stE = station(ANG.E);
  const site = plaque(2.5, 1.5, (g, w, h) => {
    gloss(g, w, h, 60); const tb = g.createLinearGradient(0, 0, 0, 90); tb.addColorStop(0, "#7FD4FF"); tb.addColorStop(1, "#1259E8"); g.save(); rr(g, 0, 0, w, h, 60); g.clip(); g.fillStyle = tb; g.fillRect(0, 0, w, 90); g.restore();
    rr(g, 50, 130, w - 100, 110, 55); g.fillStyle = "#FFFFFF"; g.fill(); g.strokeStyle = "rgba(18,89,232,.5)"; g.lineWidth = 5; g.stroke();
    gtext(g, "twitch.tv", w / 2, 210, 78, { kind: "navy", font: `700 78px ${JB}` });
    gtext(g, "Amazon · 2014", w / 2, 380, 70, { font: `800 70px ${SY}` });
    gtext(g, "situs .tv", w / 2, 480, 56, { kind: "navy", font: `700 56px ${JB}` });
  }, { r: 0.28, d: 0.16, px: 340 });
  site.position.set(-1.05, 1.95, 0.3); stE.P.add(site);
  const priceShape = (() => { const s = new THREE.Shape(), w = 2.5, h = 1.15; s.moveTo(-w / 2, 0); s.lineTo(-w / 2 + 0.5, h / 2); s.lineTo(w / 2 - 0.12, h / 2); s.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - 0.12); s.lineTo(w / 2, -h / 2 + 0.12); s.quadraticCurveTo(w / 2, -h / 2, w / 2 - 0.12, -h / 2); s.lineTo(-w / 2 + 0.5, -h / 2); s.closePath(); const hole = new THREE.Path(); hole.absarc(-w / 2 + 0.42, 0, 0.12, 0, 6.283, true); s.holes.push(hole); return s; })();
  const PRICE = G(-0.85, 1.9, 0.75, stE.P);
  { const g = new THREE.ExtrudeGeometry(priceShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4 }); g.translate(0, 0, -0.04); add(new THREE.Mesh(g, chromeP), PRICE);
    const pT = label(760, 360, (g2, w, h) => { gloss(g2, w, h, 40); gtext(g2, "US$1", w / 2, 170, 150, { font: `800 150px ${JB}` }); gtext(g2, "MILIAR", w / 2, 300, 104, { font: `800 104px ${SY}`, kind: "navy" }); });
    const f = new THREE.Mesh(faceGeo(1.75, 0.92, 0.1), phys({ map: pT, roughness: 0.2, clearcoat: 1, envMapIntensity: 0.4 })); f.position.set(0.3, 0, 0.1); PRICE.add(f);
    const str = add(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 6, 30), chromeM), PRICE); str.position.set(-1.25 + 0.42, 0.2, 0); }
  const UNIT = 0.36; // 1 juta US$ per year = 0.36 m
  const barE = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1, 48).translate(0, 0.5, 0), chromeB), stE.P); barE.position.set(1.6, 0.15, 0);
  const capE = add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16, 0, 6.283, 0, Math.PI / 2), chromeB), stE.P);
  const tag5 = glassTag([["±US$5 juta", 0.52, 70, null, `800 70px ${JB}`], ["per tahun", 0.85, 48, "navy", `700 48px ${SY}`]], 2.0, 0.9); tag5.position.set(1.6, 0, 0.5); stE.P.add(tag5);
  stE.shadowOn(2.8, 1.2, -1.0, 0.4, 0.4); stE.shadowOn(1.3, 1.3, 1.6, 0, 0.5);

  // F: revenue column 8,4% + bars 5 vs 10
  const stF = station(ANG.F);
  const COL = G(-1.55, 0.15, 0, stF.P), CH = 3.0;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, CH, 48, 1, true).translate(0, CH / 2, 0), glassM), COL).castShadow = false;
  for (const y of [0, CH]) add(new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 10, 64), chromeM), COL).position.y = y, COL.children[COL.children.length - 1].rotation.x = Math.PI / 2;
  for (let k = 1; k < 10; k++) { const tk = new THREE.Mesh(new THREE.TorusGeometry(0.805, 0.008, 4, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); tk.rotation.x = Math.PI / 2; tk.position.y = CH * k / 10; COL.add(tk); }
  const fillM = phys({ color: 0x8fe8ff, metalness: 1, roughness: 0.06, emissive: 0x2fb8ff, emissiveIntensity: 0.7, iridescence: 0.6 });
  const fill = add(new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 1, 48).translate(0, 0.5, 0), fillM), COL);
  const t84 = glassTag([["8,4%", 0.62, 120, null, `800 120px ${JB}`], ["dari .tv", 0.9, 44, "navy", `700 44px ${SY}`]], 1.6, 1.0, true); t84.position.set(-1.55, 0.95, 0.95); stF.P.add(t84);
  const t100 = glassTag([["100% pendapatan", 0.5, 56, "navy", `800 56px ${SY}`], ["pemerintah · 2019", 0.83, 44, "navy", `700 44px ${JB}`]], 2.3, 0.86); t100.position.set(-1.55, 3.75, 0.3); stF.P.add(t100);
  const bar5 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 5 * UNIT, 40).translate(0, 5 * UNIT / 2, 0), glassM), stF.P); bar5.position.set(0.55, 0.15, 0); bar5.castShadow = false;
  const bar10 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1, 48).translate(0, 0.5, 0), chromeP), stF.P); bar10.position.set(1.85, 0.15, 0);
  const cap10 = add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16, 0, 6.283, 0, Math.PI / 2), chromeP), stF.P);
  const l5 = glassTag([["±5", 0.6, 96, null, `800 96px ${JB}`], ["2014", 0.88, 42, "navy", `700 42px ${JB}`]], 1.0, 0.9); l5.position.set(0.55, 5 * UNIT + 0.75, 0.3); stF.P.add(l5);
  const l10 = glassTag([["10", 0.52, 96, "white", `800 96px ${JB}`], ["GoDaddy · 2021", 0.85, 40, "white", `800 40px ${SY}`]], 1.7, 0.95, true); stF.P.add(l10);
  const lUnit = glassTag([["juta US$ / tahun", 0.66, 52, "navy", `800 52px ${SY}`]], 2.3, 0.5); lUnit.position.set(1.25, 0.62, 0.95); stF.P.add(lUnit);
  stF.shadowOn(2.0, 2.0, -1.55, 0, 0.45); stF.shadowOn(3.2, 1.4, 1.2, 0, 0.45);

  // light cables: each station to the letters, with money pulses running toward Tuvalu
  const cableM = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const cables = [[stD, new THREE.Vector3(-0.75, 4.9, 0)], [stE, new THREE.Vector3(1.6, 3.3, 0)], [stF, new THREE.Vector3(1.85, 4.6, 0)]].map(([st, loc], k) => {
    st.S.updateMatrixWorld(true); st.P.updateMatrixWorld(true);
    const a = st.P.localToWorld(loc.clone()), b = new THREE.Vector3((k - 1) * 2.2, 3.4, -RA + 0.2);
    const m = a.clone().lerp(b, 0.5); m.y = 11 + k * 1.5;
    const curve = new THREE.CatmullRomCurve3([a, a.clone().lerp(m, 0.55).setY(m.y * 0.85), m, b.clone().lerp(m, 0.4).setY(m.y * 0.8), b]);
    const geo = new THREE.TubeGeometry(curve, 160, 0.05, 8, false);
    const mesh = new THREE.Mesh(geo, cableM(k === 2 ? 0xffa8e4 : 0x8ff6ff)); mesh.renderOrder = 5; scene.add(mesh);
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.16, 8, false), new THREE.MeshBasicMaterial({ color: 0x6af5ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); halo.renderOrder = 5; scene.add(halo);
    const pulses = Array.from({ length: 7 }, () => sprite(glowT, 0.9, 0.9, { add: true, order: 7 }));
    return { curve, mesh, halo, pulses, n: geo.index.count };
  });

  // ---------- S7: digital replica bubble + Falepili arc ----------
  const REP = G(2.6, 2.75, 0.6);
  const repB = new THREE.Mesh(new THREE.SphereGeometry(1.35, 48, 32), bubbleM.clone()); repB.material.opacity = 0.22; repB.renderOrder = 6; REP.add(repB);
  const wireM = new THREE.MeshBasicMaterial({ color: 0x2fd8ff, wireframe: true, transparent: true, opacity: 1, depthWrite: false, fog: false });
  const REPI = G(0, -0.55, 0.15, REP); REPI.scale.setScalar(0.14);
  { const ring = new THREE.Mesh(new THREE.TorusGeometry(RA, 1.0, 6, 48).rotateX(Math.PI / 2).scale(1, 0.3, 1), wireM); REPI.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(RA - 0.6, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1259e8, transparent: true, opacity: 0.45, fog: false })); disc.add(new THREE.Mesh(disc.geometry, wireM)); REPI.add(disc);
    const solidM = new THREE.MeshBasicMaterial({ color: 0x3fe0ff, transparent: true, opacity: 0.85, fog: false }); letters.forEach((L, i) => { const m = new THREE.Mesh(L.m.geometry, solidM); m.add(new THREE.LineSegments(new THREE.EdgesGeometry(L.m.geometry, 30), new THREE.LineBasicMaterial({ color: 0xffffff }))); m.position.copy(finalPos(i)); m.scale.setScalar(S1); REPI.add(m); }); }
  const repTag = glassTag([["SALINAN DIGITAL", 0.62, 64, null, `800 64px ${SY}`]], 2.6, 0.62); repTag.position.set(0, -1.3, 0.9); REP.add(repTag);
  const dashT = canvasTex(256, 16, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, w * 0.55, h); }, [60, 1]);
  const arcCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-5.6, 0.6, 2.0), new THREE.Vector3(-14, 7, 10), new THREE.Vector3(-34, 12, 30), new THREE.Vector3(-80, 8, 80), new THREE.Vector3(-150, 0, 150)]);
  const arcGeo = new THREE.TubeGeometry(arcCurve, 220, 0.12, 8, false);
  const arc = new THREE.Mesh(arcGeo, new THREE.MeshBasicMaterial({ map: dashT, color: 0xffa8e4, transparent: true, opacity: 0.95, depthWrite: false, fog: false })); arc.renderOrder = 5; scene.add(arc);
  const fTag = glassTag([["→ AUSTRALIA", 0.46, 66, "white", `800 66px ${SY}`], ["Falepili Union · 2023", 0.82, 44, "white", `700 44px ${JB}`]], 2.8, 0.95, true); fTag.position.set(-1.7, 2.75, 1.6); fTag.rotation.y = 0.15; scene.add(fTag);

  // S8 foreground AUDIRA plaque on a chrome stand in the south lagoon
  const AUP = G(-3.4, 0, 0.4);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.0, 12).translate(0, 1.0, 0), chromeM), AUP);
  const auP = plaque(3.0, 1.1, (g, w, h) => { gloss(g, w, h, 90, { cols: ["#9FE3FF", "#3FB8FF", "#1E7FE8", "#5FC2FF"] }); gtext(g, "AUDIRA", w / 2, h * 0.6, 200, { kind: "white", font: `800 200px ${SY}` }); gtext(g, "FAKTA SEJARAH NEGARA", w / 2, h * 0.88, 52, { kind: "white", font: `700 52px ${JB}` }); }, { r: 0.4, d: 0.16, frame: chromeB, px: 330 });
  auP.position.y = 2.5; AUP.add(auP); AUP.rotation.y = 0.12;

  // ---------- atmosphere: clouds, bubbles, sparkles, splash ----------
  const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, emissive: 0xcfe6ff, emissiveIntensity: 0.45, fog: false, envMapIntensity: 0.8 });
  const NCL = 22 * 7, clouds = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 14), cloudM, NCL);
  { const m = new THREE.Matrix4(), qt = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    for (let c = 0; c < 22; c++) { const a = (c / 22) * 6.283 + q() * 0.2, R = 700 + q() * 300, y = -10 + q() * 50, S = 26 + q() * 26;
      for (let k = 0; k < 7; k++) { s.setScalar(S * (0.55 + q() * 0.6)); s.y *= 0.8; p.set(Math.sin(a) * R + (k - 3) * S * 0.7, y + q() * S * 0.4, Math.cos(a) * R + (q() - 0.5) * S); m.compose(p, qt, s); clouds.setMatrixAt(c * 7 + k, m); } } }
  scene.add(clouds);
  const NB = 34, bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 32, 18), bubbleM, NB); bubbles.renderOrder = 6;
  const bSeed = Array.from({ length: NB }, (_, i) => { const a = (-120 + q() * 170) * D2R, R = 9 + q() * 18; return [Math.sin(a) * R, 1.2 + q() * 11, Math.cos(a) * R, 0.12 + q() * 0.5, q() * 6.28, 0.1 + q() * 0.25]; });
  scene.add(bubbles);
  const fgB = [[-1.6, 1.5, -6.2, 0.3], [1.75, -0.9, -7.5, 0.38], [1.3, 2.6, -9, 0.22]].map(([x, y, z, s]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(s, 32, 18), bubbleM); m.renderOrder = 9; m.userData.o = [x, y, z]; scene.add(m); return m; });
  const sparks = [0, 1, 2, 3].map(() => sprite(sparkT, 1.4, 1.4, { add: true, order: 8 }));
  const splash = pts(scene, 240, { color: 0xffffff, size: 0.22, add: false, opacity: 0.9 });
  const spSeed = Array.from({ length: 240 }, () => [q() * 6.283, 1.5 + q() * 3.5, 2 + q() * 4, q()]);
  const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; scene.add(m); return m; });

  // chrome, glass, bubbles and the ocean carry their own envMap so their envMapIntensity applies; the rest uses environmentIntensity
  scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) if (m.isMeshStandardMaterial && (m.metalness >= 0.5 || m.iridescence > 0 || m === ocean.material || m === glassM)) { m.envMap = m === ocean.material ? ENVSKY : ENVT; m.needsUpdate = true; } });

  // ---------- timing ----------
  const tTv = A("s1:.tv"), tNeg = A("s1:negara");
  const tSemb = A("s2:Sembilan"), tDua = A("s2:dua"), tPend = A("s2:penduduk"), tSep = A("s2:sepuluh"), tTitik = A("s2:Titik"), tEmp = A("s2:empat");
  const tKode = A("s3:kode"), tId = A("s3:.id"), tJp = A("s3:.jp"), tTv3 = A("s3:.tv"), tTele = A("s3:televisi");
  const t1998 = A("s4:1998"), tPer = A("s4:perusahaan"), tLima4 = A("s4:lima"), tKon = A("s4:Kontraknya"), tVer = A("s4:Verisign");
  const tAma = A("s5:Amazon"), tSatu = A("s5:satu"), tTuv5 = A("s5:Tuvalu"), tNaik5 = A("s5:naik"), tLima5 = A("s5:lima");
  const t2019 = A("s6:2019"), tDel = A("s6:delapan"), t2021 = A("s6:2021"), tGo = A("s6:GoDaddy"), tSep6 = A("s6:sepuluh");
  const tUang = A("s7:Uang"), tLaut = A("s7:laut"), tSal = A("s7:salinan"), tPerj = A("s7:perjanjian"), tAus = A("s7:Australia"), tKal = A("s7:Kalau"), tHil = A("s7:hilang"), tHap = A("s7:dihapus");
  const tNeg8 = A("s8:Negara"), tMen = A("s8:Menurut");
  const tDet = tTv + 0.15, tHop = tDet + 0.38;
  const tLand = [0, 1, 2].map((i) => tNeg - 0.2 + i * 0.13);

  // ---------- camera ----------
  const cv = (T, d, el, az) => { const e = el * D2R, a = az * D2R; return [T.x + d * Math.cos(e) * Math.sin(a), T.y + d * Math.sin(e), T.z + d * Math.cos(e) * Math.cos(a), T.x, T.y, T.z]; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const ST = (a, y = 3.6) => SP(a).add(V(0, y, 0));
  const SE = V(0.707, 0, 0.707);
  const keys = [
    [0, 0, 23.05, 21.8, 0, 22.85, 3],
    [tDet - 0.1, 0, 22.85, 19.8, 0, 22.7, 3],
    [tHop + 0.05, 0, 22.75, 19.4, 0, 22.6, 3],
    [tHop + 0.55, 0, 17.5, 22.5, 0, 9.5, -2.5],
    [tLand[2] + 0.2, -0.65, 9.6, 20.6, -0.65, 2.6, -6.3],
    [K.s1e, 0.3, 8.8, 19.6, -0.65, 2.45, -6.4],
    [K.s2 + 0.7, 3.0, 10.5, 20.5, 0, 2.2, -6],
    [tSemb + 0.9, 44 * SE.x + 10, 58, 44 * SE.z + 2, -40, 0, -40],
    [tDua - 0.5, 46 * SE.x + 10, 60, 46 * SE.z + 2, -42, 0, -42],
    [tDua + 0.9, ...cv(V(0, 1.7, -4.2), 25.5, 25, 8)],
    [tSep - 0.2, ...cv(V(0, 1.7, -4.2), 23.5, 22, -4)],
    [tTitik - 0.2, ...cv(V(0, 1.7, -4.6), 22.5, 21, -10)],
    [tTitik + 0.9, ...cv(V(4.5, 1.4, -6.8), 8.8, 13, 16)],
    [K.s2e - 0.4, ...cv(V(4.6, 1.4, -6.8), 8.2, 12, 20)],
    [K.s3 + 0.35, -18, 15, 30, -16, 3.5, 10],
    [tKode - 0.1, ...cv(ST(ANG.C, 2.5), 17.5, 8, ANG.C + 3)],
    [K.s3e - 0.5, ...cv(ST(ANG.C, 2.5), 16.4, 8, ANG.C - 3)],
    [K.s4 + 1.0, ...cv(ST(ANG.D, 3.7), 20.5, 13, ANG.D + 3)],
    [K.s4e - 0.5, ...cv(ST(ANG.D, 3.7), 19.4, 13, ANG.D - 2)],
    [K.s5 + 0.9, ...cv(ST(ANG.E, 3.6), 17.5, 13, ANG.E + 3)],
    [K.s5e - 0.5, ...cv(ST(ANG.E, 3.6), 16.4, 13, ANG.E - 3)],
    [K.s6 + 1.0, ...cv(ST(ANG.F, 3.7), 19.5, 12, ANG.F + 3)],
    [K.s6e - 0.5, ...cv(ST(ANG.F, 3.7), 18.4, 13, ANG.F - 3)],
    [K.s7 + 0.9, 8, 14, 30, 2, 3, 0],
    [tLaut, ...cv(V(1.3, 2.5, -4.6), 25.5, 15, 12)],
    [tPerj - 0.2, ...cv(V(1.2, 2.5, -4), 25, 14, 2)],
    [tKal - 0.2, ...cv(V(0.6, 2.4, -4.4), 24, 13, -6)],
    [K.s7e, ...cv(V(0, 2.3, -5.6), 20.5, 11, -2)],
    [tNeg8 + 1.6, ...cv(V(0, 1.9, -4.2), 27, 19, -8)],
    [K.dur, ...cv(V(0, 1.9, -4.2), 36, 24, -14)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const popIn = (t, a, d = 0.45) => back(clamp01((t - a) / d), 1.8);
  const bounce = (t, a) => (t < a ? 0 : Math.sin(13 * (t - a)) * Math.exp(-3.2 * (t - a)));
  const mtx = new THREE.Matrix4(), qI = new THREE.Quaternion(), vS = new THREE.Vector3(), vP = new THREE.Vector3();
  const setPop = (o, u, base = 1) => { const s = Math.max(0.001, u * base); o.scale.setScalar(s); o.visible = u > 0.002; };

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`800 40px "Syne"`) && document.fonts.check(`700 40px "JetBrains Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }

    // water motion and the sea rising in S7
    const rise = 0.17 * smooth((t - tLaut + 0.3) / 3.0);
    oceanN.offset.set(t * 0.012, t * 0.007); lagoonN.offset.set(-t * 0.01, t * 0.006);
    ocean.position.y = rise; waterPlanes.forEach((m) => (m.position.y = 0.05 + rise));
    wl.position.y = rise + 0.01;

    // browser
    const bb = brBob(t); BR.position.copy(bb); BR.rotation.set(Math.sin(t * 0.5) * 0.02, Math.sin(t * 0.37) * 0.04, 0);
    BR.position.y += 16 * smooth((t - tHop + 0.05) / 0.7); BR.visible = t < tHop + 0.75;
    cursor.visible = Math.floor(t * 2.2) % 2 === 0 && t > tDet;

    // letters: sit in the address bar, hop out, fall, grow, land and bounce; glitch on "dihapus"
    const gl = t > tHil + 0.3 && t < tHap + 0.9 ? 1 : 0;
    letters.forEach((L, i) => {
      const st = letterStart(i, Math.min(t, tDet)), fin = finalPos(i), m = L.m;
      let s = S1, sy = 1;
      if (t < tDet) { m.position.copy(letterStart(i, t)); s = S0; m.rotation.set(BR.rotation.x, BR.rotation.y, 0); }
      else if (t < tHop) { const u = eout((t - tDet) / (tHop - tDet)); m.position.copy(st).add(V(0.15 * (i - 1) * u, 0.7 * Math.sin(u * Math.PI * 0.6), 1.3 * u)); s = S0 * (1 + 0.5 * u); m.rotation.set(-0.2 * u, 0, 0.12 * (i - 1) * u); }
      else if (t < tLand[i]) {
        const u = clamp01((t - tHop) / (tLand[i] - tHop)), h = st.clone().add(V(0.15 * (i - 1), 0.7 * Math.sin(Math.PI * 0.6), 1.3));
        const xz = smooth(u); m.position.set(h.x + (fin.x - h.x) * xz, h.y + (fin.y - h.y) * u * u, h.z + (fin.z - h.z) * xz);
        s = S0 * 1.5 + (S1 - S0 * 1.5) * smooth(u * 1.15);
        const sg = i % 2 ? 1 : -1; m.rotation.set(-0.2 * (1 - u) + Math.sin(u * Math.PI) * 0.8 * sg, 0, (1 - u) * 0.5 * sg);
      } else { m.position.copy(fin); m.rotation.set(0, 0, 0); sy = 1 - 0.22 * bounce(t, tLand[i]); }
      if (gl) { const k = Math.floor(t * 18 + i * 3); m.position.x += ((k * 37) % 7 - 3) * 0.05; m.position.y += ((k * 13) % 5 - 2) * 0.03; }
      m.scale.set(s / Math.sqrt(sy), s * sy, s / Math.sqrt(sy));
      L.wire.material.opacity = gl ? (Math.floor(t * 14 + i) % 3 === 0 ? 0.9 : 0.25) : 0;
    });
    letterM.opacity = gl ? (Math.floor(t * 11) % 3 === 0 ? 0.18 : 0.7) : 1;
    // camera: the track, except during the hook fall, where it follows the falling letters so they stay big and in frame
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.06, c[1] + Math.sin(t * 0.23) * 0.05, c[2] + Math.cos(t * 0.27) * 0.05);
    tgt.set(c[3], c[4], c[5]);
    { const w = smooth((t - tHop + 0.15) / 0.4) * (1 - smooth((t - tLand[2] - 0.05) / 0.5));
      if (w > 0) {
        const ctr = new THREE.Vector3(); letters.forEach((L) => ctr.add(L.m.position)); ctr.multiplyScalar(1 / 3);
        const sc = letters[1].m.scale.y; ctr.y += 0.5 * sc;
        const fol = ctr.clone().add(V(0, 1.4 + 1.0 * sc, 12 + 5 * sc));
        cam.position.lerp(fol, w); tgt.lerp(ctr.add(V(0, 0.6 + 0.7 * sc, 0)), w);
      } }
    cam.lookAt(tgt); cam.updateMatrixWorld();
    dome.position.copy(cam.position);
    sun.target.position.copy(tgt); sun.position.set(tgt.x - 16, tgt.y + 26, tgt.z + 14);
    shadowLetters.material.opacity = 0.55 * smooth((t - tLand[0]) / 0.4);
    // splash: rings and droplets at the landing
    rings.forEach((m, i) => { const a = t - tLand[i]; m.visible = a > 0 && a < 1.6; if (m.visible) { const f = finalPos(i); m.position.set(f.x, 0.36, f.z + 1.2); m.scale.setScalar(0.4 + a * 2.2); m.material.opacity = 0.7 * (1 - a / 1.6); } });
    { const d = splash.pos, cl = splash.col; for (let k = 0; k < 240; k++) { const sd = spSeed[k], i = k % 3, a = t - tLand[i], f = finalPos(i); if (a < 0 || a > 1.3) { d[k * 3 + 1] = -5000; continue; } d[k * 3] = f.x + Math.cos(sd[0]) * sd[2] * a * 0.6; d[k * 3 + 1] = 0.4 + sd[1] * a * 1.5 - 4.9 * a * a; d[k * 3 + 2] = f.z + 1.0 + Math.sin(sd[0]) * sd[2] * a * 0.5; const v = 0.85 + 0.15 * sd[3]; cl[k * 3] = v; cl[k * 3 + 1] = v; cl[k * 3 + 2] = 1; } splash.commit(); }
    // sparkles on the chrome: letters in S1–S2 and S7–S8, the current station otherwise
    const onAtoll = t < K.s3 + 0.4 || t > K.s7 + 0.6;
    sparks.forEach((sp, i) => {
      let p;
      if (onAtoll) { const f = finalPos(i % 3); p = V(f.x + (i === 3 ? 0.8 : -0.3) , (i === 1 ? 1.12 : 0.82) * S1 + 0.3, f.z + 0.6); if (t < tLand[2] + 0.3) p = letters[i % 3].m.position.clone().add(V(0.1, 0.4, 0.3)); }
      else { const sts = t < K.s4 ? stC : t < K.s5 ? stD : t < K.s6 ? stE : stF; p = sts.P.localToWorld(V([-1.6, 0.6, 1.6, -0.4][i], [3.4, 4.6, 3.9, 2.4][i], 0.4)); }
      sp.position.copy(p); const pu = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 1.7); sp.scale.setScalar(0.25 + 1.05 * pu * pu); sp.material.opacity = 0.85 * pu;
    });

    // S2 overview labels, tags, ruler
    islLabels.forEach((s, i) => { const u = smooth((t - tSemb - i * 0.09) / 0.3) * (1 - smooth((t - tDua + 0.7) / 0.4)); s.material.opacity = u; s.visible = u > 0.01; });
    const uKm = popIn(t, tDua - 0.35) * (1 - smooth((t - tTitik + 0.1) / 0.4)), uPop = popIn(t, tSep - 0.35) * (1 - smooth((t - tTitik + 0.1) / 0.4));
    setPop(tKm, uKm); setPop(tPop, uPop); poles[0].scale.y = Math.max(0.001, uKm); poles[1].scale.y = Math.max(0.001, uPop); poles[0].visible = uKm > 0.01; poles[1].visible = uPop > 0.01;
    tKm.position.y = 3.0 + Math.sin(t * 1.3) * 0.06; tPop.position.y = 3.0 + Math.sin(t * 1.3 + 1) * 0.06;
    const uR = popIn(t, tTitik - 0.2, 0.5); RUL.scale.set(1, Math.max(0.001, uR), 1); RUL.visible = uR > 0.01;
    rTag.scale.setScalar(Math.max(0.001, popIn(t, tEmp - 0.3)));
    BUOY.position.y = rise + Math.sin(t * 1.6) * 0.05; BUOY.rotation.z = Math.sin(t * 1.1) * 0.06;

    // stations float
    for (const [st, ph] of [[stC, 0], [stD, 1], [stE, 2], [stF, 3]]) st.P.position.y = 1.15 + Math.sin(t * 0.8 + ph) * 0.06;
    // C: plaques pop on their codes, TV on "televisi"
    [tId, tJp, tTv3].forEach((a, i) => { const H = codePl[i]; setPop(H, popIn(t, a - 0.25)); H.rotation.y = Math.sin(t * 0.7 + i) * 0.06; });
    codePl[2].children[0].position.y = 1.2 + 0.12 * pump(t, tTv3, 0.15, 1.0);
    setPop(TVG, popIn(t, tTele - 0.3)); TVG.rotation.y = -0.25 + Math.sin(t * 1.2) * 0.12;
    // D: coin and contract
    setPop(COIN, popIn(t, Math.max(t1998, K.s4 + 0.3) - 0.1, 0.55)); COIN.rotation.y = 0.32 * Math.sin((t - K.s4) * 0.55) + 0.14 * pump(t, tLima4 - 0.1, 0.15, 0.8) * Math.sin((t - tLima4) * 16);
    setPop(tagIC, popIn(t, tPer - 0.2)); setPop(tagVS, popIn(t, tVer - 0.25)); rail.visible = t > tKon;
    { const u = smooth((t - tKon) / Math.max(0.8, tVer - tKon - 0.2)); contract.position.set(2.55, 3.85 - 1.55 * u, 0.62); setPop(contract, popIn(t, tPer + 0.2)); contract.rotation.z = Math.sin(u * Math.PI) * 0.2; }
    // E: site card, price tag, payment bar to ±5
    setPop(site, popIn(t, tAma - 0.25)); PRICE.visible = false; PRICE.rotation.z = 0.08 * Math.sin(t * 1.4);
    { const h = Math.max(0.02, 5 * UNIT * smooth((t - tNaik5 + 0.1) / Math.max(0.6, tLima5 - tNaik5 + 0.2))); barE.scale.y = h; capE.position.set(1.6, 0.15 + h, 0); tag5.position.y = 0.15 + h + 0.95; setPop(tag5, popIn(t, tLima5 - 0.3)); }
    // F: column fills to 8,4%, bar to 10
    { const u = smooth((t - tDel + 0.45) / 0.9); fill.scale.y = Math.max(0.002, CH * 0.084 * u); fillM.emissiveIntensity = 0.35 + 1.0 * pump(t, tDel + 0.4, 0.15, 1.4); setPop(t84, popIn(t, tDel - 0.2)); t100.visible = false; setPop(lUnit, popIn(t, t2021 - 0.2)); }
    { const u = smooth((t - tGo + 0.1) / Math.max(0.8, tSep6 - tGo + 0.1)), h = Math.max(0.02, 10 * UNIT * u); bar10.scale.y = h; cap10.position.set(1.85, 0.15 + h, 0); l10.position.set(1.85, 0.15 + h + 0.85, 0.3); setPop(l10, popIn(t, tSep6 - 0.3)); setPop(l5, popIn(t, t2021 - 0.1)); }
    // cables: grow when each station speaks of money, pulses flow to Tuvalu
    const cOn = [[tLima4 - 0.4, K.s4 + 0.6], [tNaik5 - 0.3, tTuv5], [tSep6 - 0.6, tDel]];
    cables.forEach((cb, k) => {
      const u = smooth((t - cOn[k][1]) / 1.4), fo = 1 - 0.75 * smooth((t - K.s7) / 1.5); cb.mesh.material.opacity = 0.75 * fo; cb.halo.material.opacity = 0.12 * fo; cb.mesh.geometry.setDrawRange(0, Math.floor(cb.n * u)); cb.halo.geometry.setDrawRange(0, Math.floor(cb.n * u));
      const flow = t > cOn[k][0]; const boost = 1 + 1.5 * pump(t, cOn[k][0] + 0.4, 0.2, 1.5);
      cb.pulses.forEach((p, j) => { const ph = ((t - cOn[k][0]) * 0.22 + j / 7) % 1; p.visible = flow && u > 0.98 && ph > 0; if (p.visible) { cb.curve.getPointAt(ph, p.position); p.scale.setScalar(0.5 + 0.45 * boost); p.material.opacity = Math.min(1, 0.6 * boost) * Math.sin(ph * Math.PI); } });
    });
    // S7: replica bubble, Falepili arc
    { const u = popIn(t, tSal - 0.3, 0.6); setPop(REP, u); REP.position.y = 2.75 + Math.sin(t * 0.9) * 0.12; REPI.rotation.y = Math.sin(t * 0.5) * 0.35; repTag.visible = u > 0.5; }
    { const u = smooth((t - tPerj + 0.2) / Math.max(1, tAus - tPerj + 0.8)); arc.geometry.setDrawRange(0, Math.floor(arcGeo.index.count * u)); dashT.offset.x = -t * 0.8; setPop(fTag, popIn(t, tAus - 0.3) * (1 - smooth((t - K.s8) / 0.6))); arc.visible = t > tPerj - 0.3; }
    AUP.visible = t > tNeg8 - 0.4; setPop(auP, popIn(t, tNeg8 - 0.2, 0.55)); auP.rotation.y = Math.sin(t * 0.8) * 0.05;

    // bubbles drift up; foreground bubbles ride with the camera
    for (let i = 0; i < NB; i++) { const b = bSeed[i]; vP.set(b[0] + Math.sin(t * b[5] + b[4]) * 0.5, b[1] + ((t * b[5] * 0.3 + b[4]) % 3) * 0.5, b[2] + Math.cos(t * b[5] + b[4]) * 0.5); vS.setScalar(b[3] * (1 + 0.04 * Math.sin(t * 2 + b[4]))); mtx.compose(vP, qI, vS); bubbles.setMatrixAt(i, mtx); }
    bubbles.instanceMatrix.needsUpdate = true;
    fgB.forEach((m, i) => { const o = m.userData.o; m.position.set(o[0] + Math.sin(t * 0.4 + i) * 0.12, o[1] + Math.sin(t * 0.33 + i * 2) * 0.1, o[2]).applyMatrix4(cam.matrixWorld); m.visible = (t < K.s2 + 0.5 || t > K.s8) ; });

    comp.render();
  };
}
