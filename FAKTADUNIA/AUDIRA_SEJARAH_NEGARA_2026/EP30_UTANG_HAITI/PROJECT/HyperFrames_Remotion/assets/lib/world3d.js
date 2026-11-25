// EP30 UTANG KEMERDEKAAN HAITI: MARBLEMUSEUM. One long gallery wall (units = metres, wall face z = 0, floor y = 0).
// The camera walks along the wall; every exhibit has its own warm ceiling spot that comes up as the camera arrives.
// A (x 0)    marble tablet "UTANG KEMERDEKAAN HAITI 1825–1947" + brass donor plaque "PAMERAN AUDIRA"
// B (x 15)   gilded frame: Caribbean map (Natural Earth), Haiti / Saint-Domingue highlight, brass pin on Port-au-Prince
// C (x 30)   slate board: 520 dots (1 dot = 1.000 people), 425 turn bronze. Numbers only, no figures.
// D (x 45)   marble portal engraved 1804; bronze trade doors close, a bar drops across (terkucil)
// E (x 60)   plinth vitrine: 14 bronze warship tokens, plinth line 14 KAPAL PERANG · 528 MERIAM, frieze 150.000.000 FRANC
// F (x 76)   ledger on a slanted lectern: 150.000.000 struck, 60.000.000 (1838), LUNAS 1883 stamp
// G (x 92)   wall rail 1825 → 1947: gold debt bar, bronze interest bar grows to 1947, coin stacks, NYT 2022 source plate
// H (x 104)  2016 stele "dicabut, tanpa ganti rugi" and an empty brass tray
// I (x 120)  bronze balance on a plinth engraved PAMERAN AUDIRA, tipped by a coin stack against a small 1804 tablet
// Everything is a function of t.

const FONTS = ['700 80px "Cormorant Garamond"', 'italic 600 80px "Cormorant Garamond"', '600 80px "Cormorant Garamond"', '400 80px "IBM Plex Serif"', '600 80px "IBM Plex Serif"', 'italic 400 80px "IBM Plex Serif"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "Haiti 1825 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const COR = '"Cormorant Garamond", Georgia, serif', PLEX = '"IBM Plex Serif", Georgia, serif';
const GOLD = "#B8954A", INK = "#141414", HBLUE = "#00209F", HRED = "#D21034";
const ENV = 0.35;

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

// veined statuary marble: warm base, cloudy mottling, soft wide veins with a thin dark core
function marble(g, w, h, seed = 1, o = {}) {
  const base = o.base || "#CFC6B4", vein = o.vein || "74,68,60", lite = o.lite || "255,252,246", nV = o.veins ?? 16;
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed), A = w * h;
  for (let i = 0; i < A / 14000; i++) {
    const x = q() * w, y = q() * h, rr = 40 + q() * 220, dark = q() < 0.5;
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, dark ? `rgba(${vein},${0.025 + q() * 0.04})` : `rgba(${lite},${0.05 + q() * 0.08})`); gr.addColorStop(1, `rgba(${vein},0)`);
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const S = Math.max(w, h);
  for (let v = 0; v < nV; v++) {
    let x = q() * w, y = q() * h, a = q() * 6.283;
    const path = [[x, y]], L = 30 + Math.floor(q() * 60);
    for (let i = 0; i < L; i++) { a += (q() - 0.5) * 0.9; const st = S * (0.008 + q() * 0.014); x += Math.cos(a) * st; y += Math.sin(a) * st; path.push([x, y]); }
    const strong = q();
    for (const [lw, al, blur] of [[S * 0.012, 0.08 * strong, 6], [S * 0.004, 0.24 * strong + 0.08, 1.5], [S * 0.0013, 0.45 * strong + 0.12, 0]]) {
      g.filter = blur ? `blur(${blur}px)` : "none";
      g.strokeStyle = `rgba(${vein},${al})`; g.lineWidth = lw; g.lineJoin = "round"; g.beginPath();
      path.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    }
    g.filter = "none";
  }
  for (let i = 0; i < A / 900; i++) { g.fillStyle = `rgba(${vein},${0.04 + q() * 0.06})`; const s = 0.6 + q() * 1.4; g.fillRect(q() * w, q() * h, s, s); }
}
// engraved letters: shadow below, highlight above, fill (gold leaf or cut stone)
function engrave(g, txt, x, y, font, o = {}) {
  const align = o.align || "center", kind = o.kind || "cut", ls = o.ls || 0;
  g.font = font; g.textAlign = align; g.textBaseline = "alphabetic";
  if (ls) g.letterSpacing = ls + "px";
  const m = parseFloat(font.match(/(\d+)px/)[1]);
  g.fillStyle = "rgba(255,250,240,.45)"; g.fillText(txt, x, y + m * 0.035);
  g.fillStyle = "rgba(10,6,2,.85)"; g.fillText(txt, x - m * 0.012, y - m * 0.03);
  if (kind === "gold") {
    const gr = g.createLinearGradient(0, y - m * 0.8, 0, y + m * 0.1);
    gr.addColorStop(0, "#C9A257"); gr.addColorStop(0.5, "#8C6A2A"); gr.addColorStop(1, "#4E3913");
    g.fillStyle = gr;
  } else if (kind === "red") g.fillStyle = "#7A1420";
  else if (kind === "ink") g.fillStyle = INK;
  else g.fillStyle = o.col || "#1f1a15";
  g.fillText(txt, x, y);
  if (ls) g.letterSpacing = "0px";
}
function plain(g, txt, x, y, font, col, align = "center", ls = 0) {
  g.font = font; g.textAlign = align; g.textBaseline = "alphabetic"; g.fillStyle = col;
  if (ls) g.letterSpacing = ls + "px";
  g.fillText(txt, x, y);
  if (ls) g.letterSpacing = "0px";
}
function paper(g, w, h, seed, base = "#F1E9D8") {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed);
  for (let i = 0; i < w * h / 9000; i++) { const x = q() * w, y = q() * h, rr = 30 + q() * 160; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(150,115,60,${0.03 + q() * 0.05})`); gr.addColorStop(1, "rgba(150,115,60,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  for (let i = 0; i < w * h / 200; i++) { g.strokeStyle = `rgba(110,85,45,${0.04 + q() * 0.06})`; g.lineWidth = 0.7; const x = q() * w, y = q() * h, a = q() * 6.28, l = 3 + q() * 14; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0c0b0a, exp: 0.82, bloom: [0.12, 0.5, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.82;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  bp.threshold = 1.0; bp.strength = 0.06; bp.radius = 0.45;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#1A1714"); gr.addColorStop(1, "#0A0908"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.FogExp2(0x0d0c0b, 0.011);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---------- light: low ambient, a soft key that follows the camera, warm spots per exhibit ----------
  const hemi = new THREE.HemisphereLight(0xfff0dc, 0x1a1512, 0.32); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe6c4, 0.55);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 5;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x9fb0c8, 0.12); fill.position.set(-30, 20, 40); scene.add(fill);

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const add = (m, p = scene, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, envMapIntensity: ENV, ...o });
  const marbleT = canvasTex(1024, 1024, (g, w, h) => marble(g, w, h, 7), [1, 1]); marbleT.repeat.set(0.42, 0.42);
  const marbleM = new THREE.MeshPhysicalMaterial({ map: marbleT, color: 0xf0ebe2, roughness: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.25, envMapIntensity: ENV, bumpMap: marbleT, bumpScale: 0.15 });
  const nero = canvasTex(1024, 1024, (g, w, h) => marble(g, w, h, 19, { base: "#1E1C1A", vein: "205,198,186", lite: "60,56,52", veins: 12 }), [1, 1]); nero.repeat.set(0.42, 0.42);
  const neroM = new THREE.MeshPhysicalMaterial({ map: nero, roughness: 0.28, clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: ENV });
  const goldM = std({ color: 0xc9a457, metalness: 0.9, roughness: 0.3, envMapIntensity: ENV * 2.6 });
  const bronzeM = std({ color: 0x86603a, metalness: 0.85, roughness: 0.38, envMapIntensity: ENV * 2.4 });
  const darkBronze = std({ color: 0x4a3626, metalness: 0.8, roughness: 0.42, envMapIntensity: ENV * 2.2 });
  const velvet = std({ color: 0x5a1820, roughness: 0.95 });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.8)"); gr.addColorStop(0.55, "rgba(0,0,0,.38)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, z, o = 0.6, y = 0.006) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; scene.add(m); return m; };
  const glowT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,236,200,1)"); gr.addColorStop(0.35, "rgba(255,210,150,.4)"); gr.addColorStop(1, "rgba(255,190,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  // rounded, bevelled block (plinths, tablets, frames); UVs in metres so the shared marble texture tiles evenly
  const bevelGeo = (w, h, d, rr = 0.03) => {
    const s = new THREE.Shape(), a = w / 2 - rr, b = h / 2 - rr;
    s.moveTo(-a, -b); s.lineTo(a, -b); s.lineTo(a, b); s.lineTo(-a, b); s.lineTo(-a, -b);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * rr), bevelEnabled: true, bevelThickness: rr, bevelSize: rr, bevelSegments: 3, curveSegments: 4 });
    g.translate(0, 0, -(d - 2 * rr) / 2); g.computeVertexNormals(); return g;
  };
  const block = (w, h, d, mat, x, y, z, p = scene, rr = 0.03) => { const m = add(new THREE.Mesh(bevelGeo(w, h, d, rr), mat), p); m.position.set(x, y, z); return m; };
  // a face plane carrying a canvas, set just proud of a block's front
  const face = (w, h, tex, x, y, z, p = scene, o = {}) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: o.opacity ?? 1 })
      : new THREE.MeshPhysicalMaterial({ map: tex, color: o.color ?? 0xd8d1c4, roughness: o.rough ?? 0.4, clearcoat: o.cc ?? 0.1, metalness: o.metal ?? 0, envMapIntensity: ENV * (o.env ?? 1), bumpMap: o.bump === false ? null : tex, bumpScale: o.bumpScale ?? 0.6, transparent: !!o.transparent, opacity: o.opacity ?? 1, depthWrite: !o.transparent }));
    m.position.set(x, y, z); m.receiveShadow = true; if (o.transparent || o.basic) m.renderOrder = 3; p.add(m); return m;
  };
  // ceiling spot aimed at an exhibit; visible cone kept faint
  const coneT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,226,180,.9)"); gr.addColorStop(1, "rgba(255,226,180,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const spots = [];
  const spot = (x, z, tx, ty, tz, I = 60, ang = 0.36, beam = true) => {
    const L = new THREE.SpotLight(0xffd9a8, 0, 0, ang * 0.78, 0.55, 1.15);
    L.position.set(x, 8.3, z); L.target.position.set(tx, ty, tz); scene.add(L, L.target);
    const can = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 20), darkBronze), scene, false); can.position.set(x, 8.42, z);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), new THREE.MeshBasicMaterial({ color: 0xffe2b8 })); lens.rotation.x = Math.PI / 2; lens.position.set(x, 8.26, z); scene.add(lens);
    let cone = null;
    if (beam) {
      const dir = new THREE.Vector3(tx - x, ty - 8.3, tz - z), len = dir.length();
      const geo = new THREE.CylinderGeometry(0.12, Math.tan(ang * 0.78) * len * 0.8, len, 32, 1, true); geo.translate(0, -len / 2, 0);
      cone = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: coneT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      cone.position.set(x, 8.3, z); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize()); cone.renderOrder = 4; scene.add(cone);
    }
    const s = { L, I: I * 0.155, lens, cone }; spots.push(s); return s;
  };
  // small white museum wall card
  const wallCard = (x, y, lines, seed) => {
    const tx = label(600, 400, (g, w, h) => {
      g.fillStyle = "#F4F0E8"; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, h - 10, w, 10);
      plain(g, lines[0], 40, 72, `600 34px ${PLEX}`, "#8A7240", "left", 4);
      plain(g, lines[1], 40, 150, `700 58px ${COR}`, INK, "left");
      if (lines[2]) plain(g, lines[2], 40, 216, `italic 600 44px ${COR}`, "#3b342c", "left");
      if (lines[3]) plain(g, lines[3], 40, 330, `400 28px ${PLEX}`, "#5a5249", "left");
    });
    const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.012), std({ color: 0xf4f0e8, roughness: 0.8 })), scene); b.position.set(x, y, 0.07);
    face(0.6, 0.4, tx, x, y, 0.077, scene, { rough: 0.85, cc: 0, bump: false, color: 0xffffff });
  };

  // ---------- gallery shell ----------
  const X0 = -22, X1 = 150;
  const floorT = canvasTex(2048, 2048, (g, w, h) => {
    const hw = w / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const c = document.createElement("canvas"); c.width = hw; c.height = hw; const cg = c.getContext("2d");
      if ((i + j) % 2) marble(cg, hw, hw, 40 + i * 2 + j, { base: "#211E1B", vein: "190,182,170", lite: "60,56,52", veins: 6 });
      else marble(cg, hw, hw, 50 + i * 2 + j, { veins: 7 });
      g.drawImage(c, i * hw, j * hw);
    }
    g.strokeStyle = "rgba(20,16,12,.7)"; g.lineWidth = 3; for (const p of [0, hw, w]) { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
  }, [1, 1]);
  floorT.repeat.set((X1 - X0) / 2.8, 40 / 2.8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 40), new THREE.MeshPhysicalMaterial({ map: floorT, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: ENV * 1.4 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set((X0 + X1) / 2, 0, 20); floor.receiveShadow = true; scene.add(floor);
  const plasterT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#3A2A26"; g.fillRect(0, 0, w, h);
    const q = mulberry(91);
    for (let i = 0; i < 260; i++) { const x = q() * w, y = q() * h, rr = 20 + q() * 120; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${q() < 0.5 ? "0,0,0" : "120,90,80"},${0.04 + q() * 0.05})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "0,0,0" : "255,235,220"},${0.03 + q() * 0.04})`; g.fillRect(q() * w, q() * h, 1.4, 1.4); }
  }, [1, 1]);
  plasterT.repeat.set((X1 - X0) / 6, 8.6 / 6);
  const wallM = std({ map: plasterT, roughness: 0.92, bumpMap: plasterT, bumpScale: 0.4 });
  const wall = add(new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 8.6), wallM), scene, false); wall.position.set((X0 + X1) / 2, 4.3, 0);
  const wall2 = add(new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 8.6), wallM), scene, false); wall2.position.set((X0 + X1) / 2, 4.3, 22); wall2.rotation.y = Math.PI;
  const endW = add(new THREE.Mesh(new THREE.PlaneGeometry(22, 8.6), wallM), scene, false); endW.position.set(X0, 4.3, 11); endW.rotation.y = Math.PI / 2;
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 22), std({ color: 0x15120f, roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set((X0 + X1) / 2, 8.6, 11); scene.add(ceil);
  // dado, gilt rails, skirting, cornice on both long walls
  for (const [zz, s] of [[0, 1], [22, -1]]) {
    const dado = add(new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 1.0, 0.06), neroM), scene); dado.position.set((X0 + X1) / 2, 0.5, zz + s * 0.03);
    for (const [y, hh, dd] of [[1.02, 0.05, 0.1], [6.6, 0.05, 0.08]]) { const rl = add(new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, hh, dd), goldM), scene, false); rl.position.set((X0 + X1) / 2, y, zz + s * dd / 2); }
    const cor = add(new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.35, 0.3), marbleM), scene, false); cor.position.set((X0 + X1) / 2, 8.45, zz + s * 0.15);
  }
  // fluted columns between the exhibits
  const shaftGeo = new THREE.CylinderGeometry(0.34, 0.37, 6.9, 72, 1, false);
  { const p = shaftGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), rr = Math.hypot(x, z); if (rr > 0.01) { const k = 1 - 0.06 * Math.pow(Math.abs(Math.sin(a * 12)), 0.6); p.setX(i, x * k); p.setZ(i, z * k); } } shaftGeo.computeVertexNormals(); }
  const COLX = [-8.5, 7.5, 22.5, 37.5, 52.5, 68, 84, 98, 112, 128];
  for (const cx of COLX) {
    const c = add(new THREE.Mesh(shaftGeo, marbleM), scene); c.position.set(cx, 0.55 + 3.45, 1.5);
    block(1.0, 0.5, 1.0, marbleM, cx, 0.25, 1.5); block(0.86, 0.12, 0.86, marbleM, cx, 0.56, 1.5, scene, 0.03);
    block(1.0, 0.32, 1.0, marbleM, cx, 7.6, 1.5); block(0.84, 0.14, 0.84, marbleM, cx, 7.38, 1.5);
    blob(1.9, 1.9, cx, 1.5, 0.55);
  }
  // brass stanchions with a velvet rope along the wall exhibits
  const postGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.95, 16);
  const ropes = [];
  for (let px = -6; px <= 110; px += 3.5) {
    if (Math.abs(px - 60) < 2.4 || Math.abs(px - 76) < 1.6 || Math.abs(px - 104.5) < 2.6) continue;
    const pz = 4.6;
    add(new THREE.Mesh(postGeo, goldM), scene).position.set(px, 0.5, pz);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 24), goldM), scene).position.set(px, 0.02, pz);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), goldM), scene).position.set(px, 1.0, pz);
    ropes.push(px);
  }
  for (let i = 0; i < ropes.length - 1; i++) {
    const a = ropes[i], b = ropes[i + 1]; if (b - a > 3.6) continue;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(a, 0.95, 4.6), new THREE.Vector3((a + b) / 2, 0.66, 4.6), new THREE.Vector3(b, 0.95, 4.6)]);
    add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.025, 8), velvet), scene);
  }

  // ---------- A: entrance tablet + donor plaque ----------
  const XA = 0;
  block(3.7, 2.5, 0.2, marbleM, XA, 3.7, 0.1);
  const frameA = (w, h, x, y, z, th = 0.06) => { for (const [fw, fh, fx, fy] of [[w + th * 2, th, 0, h / 2 + th / 2], [w + th * 2, th, 0, -h / 2 - th / 2], [th, h, -w / 2 - th / 2, 0], [th, h, w / 2 + th / 2, 0]]) block(fw, fh, th, goldM, x + fx, y + fy, z, scene, 0.012); };
  frameA(3.7, 2.5, XA, 3.7, 0.1);
  const tabT = label(1480, 1000, (g, w, h) => {
    marble(g, w, h, 101);
    g.strokeStyle = "rgba(120,98,60,.55)"; g.lineWidth = 3; g.strokeRect(46, 46, w - 92, h - 92);
    engrave(g, "PAMERAN SEJARAH NEGARA · No. 30", w / 2, 150, `600 40px ${PLEX}`, { ls: 8, col: "#33291f" });
    engrave(g, "UTANG KEMERDEKAAN", w / 2, 300, `700 118px ${COR}`, { ls: 6, col: "#1f1a15" });
    engrave(g, "HAITI", w / 2, 430, `700 118px ${COR}`, { ls: 30, col: "#1f1a15" });
    g.strokeStyle = "rgba(120,98,60,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 260, 500); g.lineTo(w / 2 + 260, 500); g.stroke();
    engrave(g, "Haiti · Prancis · Laut Karibia", w / 2, 880, `italic 600 54px ${COR}`, { col: "#2b241e" });
  });
  face(3.56, 2.405, tabT, XA, 3.7, 0.205);
  const yearsT = label(1480, 300, (g, w, h) => { g.clearRect(0, 0, w, h); engrave(g, "1825 – 1947", w / 2, 220, `700 230px ${COR}`, { kind: "gold" }); });
  const yearsM = face(3.56, 0.72, yearsT, XA, 3.38, 0.208, scene, { transparent: true, metal: 0.35, rough: 0.35, env: 1.6, bump: false, color: 0xc2b08a });
  yearsM.material.emissive = new THREE.Color(0xffc860); yearsM.material.emissiveMap = yearsT; yearsM.material.emissiveIntensity = 0;
  // donor plaque
  const donorT = label(1100, 300, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#D9B86E"); gr.addColorStop(0.5, "#B08A42"); gr.addColorStop(1, "#D8B66A"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(4); for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "255,240,200" : "80,55,20"},${0.05 + q() * 0.06})`; g.lineWidth = 1; const y = q() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (q() - 0.5) * 3); g.stroke(); }
    g.strokeStyle = "#3A2A10"; g.lineWidth = 4; g.strokeRect(20, 20, w - 40, h - 40);
    engrave(g, "PAMERAN AUDIRA", w / 2, 150, `700 104px ${COR}`, { ls: 10, kind: "ink" });
    engrave(g, "Galeri Fakta Sejarah Negara · audira.my.id", w / 2, 232, `400 36px ${PLEX}`, { col: "#2e220e" });
  });
  block(1.62, 0.46, 0.04, goldM, XA, 1.95, 0.03, scene, 0.01);
  face(1.56, 0.42, donorT, XA, 1.95, 0.052, scene, { metal: 0.75, rough: 0.33, env: 2.4, cc: 0, bumpScale: 0.3, color: 0xffffff });
  wallCard(XA + 2.55, 1.6, ["No. 01", "Utang kemerdekaan", "marmer, emas", "1825–1947"]);
  spot(XA, 2.3, XA, 3.6, 0, 70, 0.38);

  // ---------- B: Caribbean map ----------
  const XB = 15, YB = 3.6, MW = 3.6, MH = 2.4;
  const LON0 = -79.2, LAT1 = 23.2, PXD = 1800 / 12.4, PYD = 1200 / 7.8;
  const mx = (lon) => (lon - LON0) * PXD, my = (lat) => (LAT1 - lat) * PYD;
  const ring = (g, rings) => { g.beginPath(); for (const rg of rings) { rg.forEach(([lo, la], i) => (i ? g.lineTo(mx(lo), my(la)) : g.moveTo(mx(lo), my(la)))); g.closePath(); } };
  const mapT = label(1800, 1200, (g, w, h) => {
    paper(g, w, h, 33, "#DCD6C6");
    g.fillStyle = "rgba(96,122,140,.22)"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(60,80,95,.16)"; g.lineWidth = 1.4; for (let y = 8; y < h; y += 11) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = "rgba(70,60,45,.25)"; g.lineWidth = 1.5; g.setLineDash([6, 8]);
    for (let lo = -78; lo <= -68; lo += 2) { g.beginPath(); g.moveTo(mx(lo), 0); g.lineTo(mx(lo), h); g.stroke(); }
    for (let la = 16; la <= 22; la += 2) { g.beginPath(); g.moveTo(0, my(la)); g.lineTo(w, my(la)); g.stroke(); }
    g.setLineDash([]);
    for (const c of GEO) { ring(g, c.rings); g.fillStyle = "#EFE6D0"; g.fill(); g.strokeStyle = "#5A4A36"; g.lineWidth = 2.6; g.stroke(); }
    const hai = GEO.find((c) => c.name === "Haiti"); ring(g, hai.rings); g.fillStyle = "#E4D6B4"; g.fill(); g.strokeStyle = "#3a2c1c"; g.lineWidth = 3.4; g.stroke();
    plain(g, "LAUT KARIBIA", mx(-74.6), my(16.4), `600 64px ${COR}`, "rgba(40,62,80,.85)", "center", 18);
    plain(g, "Samudra Atlantik", mx(-69.2), my(21.9), `italic 600 50px ${COR}`, "rgba(40,62,80,.8)");
    plain(g, "KUBA", mx(-77.6), my(21.25), `600 40px ${PLEX}`, "#4b3e2e", "center", 6);
    plain(g, "JAMAIKA", mx(-77.3), my(17.55), `600 34px ${PLEX}`, "#4b3e2e", "center", 4);
    plain(g, "REP. DOMINIKA", mx(-70.3), my(19.25), `600 32px ${PLEX}`, "#4b3e2e", "center", 3);
    plain(g, "PUERTO RIKO", mx(-66.9), my(17.7), `600 28px ${PLEX}`, "#4b3e2e", "right", 3);
    g.save(); g.translate(1660, 170); g.fillStyle = "#3a2c1c"; for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -62); g.lineTo(10, 0); g.lineTo(-10, 0); g.closePath(); g.fill(); } g.restore(); plain(g, "U", 1660, 92, `700 34px ${COR}`, "#3a2c1c");
    plain(g, "peta disederhanakan · Natural Earth", w - 40, h - 30, `italic 400 26px ${PLEX}`, "rgba(58,44,28,.75)", "right");
  });
  const frameB = G(XB, YB, 0.1);
  for (const [fw, fh, fx, fy] of [[MW + 0.36, 0.18, 0, MH / 2 + 0.09], [MW + 0.36, 0.18, 0, -MH / 2 - 0.09], [0.18, MH, -MW / 2 - 0.09, 0], [0.18, MH, MW / 2 + 0.09, 0]]) block(fw, fh, 0.14, goldM, fx, fy, 0, frameB, 0.04);
  block(MW + 0.1, MH + 0.1, 0.04, std({ color: 0x2a2420 }), 0, 0, -0.04, frameB, 0.01);
  face(MW, MH, mapT, 0, 0, 0.0, frameB, { rough: 0.8, cc: 0.05, bumpScale: 0.2, color: 0xffffff });
  const hlT = label(1800, 1200, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const hai = GEO.find((c) => c.name === "Haiti");
    ring(g, hai.rings); g.fillStyle = HBLUE; g.fill();
    g.save(); ring(g, hai.rings); g.clip(); g.fillStyle = HRED; g.fillRect(0, my(18.95), w, h); g.restore();
    ring(g, hai.rings); g.strokeStyle = "#E9CF8A"; g.lineWidth = 6; g.stroke();
    plain(g, "HAITI", mx(-73.3), my(20.55), `700 76px ${COR}`, "#1a1a2e", "center", 10);
  });
  const hl = face(MW, MH, hlT, 0, 0, 0.004, frameB, { basic: true, opacity: 0 });
  const sdT = label(1800, 1200, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "#3a2c1c"; g.lineWidth = 3; g.beginPath(); g.moveTo(mx(-73.6), my(18.7)); g.lineTo(mx(-75.1), my(17.95)); g.lineTo(mx(-77.6), my(17.95)); g.stroke();
    g.fillStyle = "rgba(244,240,232,.92)"; g.fillRect(mx(-79.05), my(17.95) + 8, 520, 128); g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(mx(-79.05), my(17.95) + 8, 520, 128);
    plain(g, "Saint-Domingue", mx(-79.05) + 260, my(17.95) + 70, `italic 700 60px ${COR}`, INK);
    plain(g, "koloni Prancis", mx(-79.05) + 260, my(17.95) + 118, `400 32px ${PLEX}`, "#4b3e2e");
  });
  const sd = face(MW, MH, sdT, 0, 0, 0.006, frameB, { basic: true, opacity: 0 });
  const pin = G(0, 0, 0, frameB);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.002, 0.16, 8), goldM), pin).rotation.x = Math.PI / 2;
  add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), std({ color: 0x9e1b2c, roughness: 0.2, metalness: 0.1, envMapIntensity: ENV * 3 })), pin).position.z = 0.09;
  const pinAt = [(mx(-72.34) / 1800 - 0.5) * MW, (0.5 - my(18.54) / 1200) * MH];
  const pinGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); pinGlow.position.set(pinAt[0], pinAt[1], 0.02); frameB.add(pinGlow);
  wallCard(XB + 2.6, 1.6, ["No. 02", "Laut Karibia", "peta, ilustrasi", "Saint-Domingue, koloni Prancis"]);
  spot(XB, 2.3, XB, YB, 0, 60, 0.36);

  // ---------- C: 520 dots ----------
  const XC = 30, YC = 3.55, BW = 3.9, BH = 3.3;
  block(BW + 0.16, BH + 0.16, 0.06, goldM, XC, YC, 0.05, scene, 0.015);
  const slateT = label(1200, 1015, (g, w, h) => {
    marble(g, w, h, 61, { base: "#25292B", vein: "120,128,132", lite: "70,76,80", veins: 5 });
    engrave(g, "SAINT-DOMINGUE, 1790", w / 2, 92, `600 52px ${PLEX}`, { ls: 8, col: "#d9cfbd" });
    g.strokeStyle = "rgba(201,170,100,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 300, 122); g.lineTo(w / 2 + 300, 122); g.stroke();
    // legend
    const ly = h - 52;
    g.beginPath(); g.arc(150, ly - 14, 14, 0, 6.283); g.fillStyle = "#E6DFD2"; g.fill();
    plain(g, "penduduk", 180, ly, `italic 600 40px ${COR}`, "#e6dfd2", "left");
    g.beginPath(); g.arc(470, ly - 14, 14, 0, 6.283); g.fillStyle = "#A3743F"; g.fill();
    plain(g, "diperbudak", 500, ly, `italic 600 40px ${COR}`, "#e6dfd2", "left");
    plain(g, "1 titik = 1.000 orang", w - 70, ly, `400 30px ${PLEX}`, "#c9c0b0", "right");
  });
  block(BW, BH, 0.08, std({ color: 0x25292b, roughness: 0.4 }), XC, YC, 0.08, scene, 0.02);
  face(BW, BH, slateT, XC, YC, 0.121, scene, { rough: 0.42, cc: 0.3, bumpScale: 0.25 });
  const NC = 26, NR = 20, SP = 0.118;
  const dotGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.03, 20); dotGeo.rotateX(Math.PI / 2);
  const dotM = new THREE.MeshPhysicalMaterial({ color: 0xd2cbbf, roughness: 0.32, metalness: 0.0, clearcoat: 0.3, envMapIntensity: ENV * 1.6 });
  const dots = new THREE.InstancedMesh(dotGeo, dotM, NC * NR); dots.castShadow = true; scene.add(dots);
  const dotPos = [], dm = new THREE.Matrix4(), dq = new THREE.Quaternion(), dv = new THREE.Vector3(), ds = new THREE.Vector3();
  for (let i = 0; i < NC * NR; i++) { const c = i % NC, rr = Math.floor(i / NC); dotPos.push([XC - (NC - 1) * SP / 2 + c * SP, YC + 1.12 - rr * SP - 0.05, 0.145]); }
  const cW = new THREE.Color(0xe6dfd2), cB = new THREE.Color(0xa3743f), cTmp = new THREE.Color();
  wallCard(XC + 2.75, 1.6, ["No. 03", "Penduduk, 1790", "diagram angka", "520.000 jiwa · 425.000 diperbudak"]);
  spot(XC, 2.3, XC, YC, 0, 62, 0.4);

  // ---------- D: portal 1804 + trade doors ----------
  const XD = 45, DW = 3.0, DH = 4.3;
  const backT = canvasTex(600, 860, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#F3D9A8"); gr.addColorStop(0.55, "#F7E6C4"); gr.addColorStop(0.58, "#7F98A6"); gr.addColorStop(1, "#40596A"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2; for (let y = 520; y < h; y += 26) { g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 3); g.stroke(); }
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: backT, color: 0xbfae94 })); backdrop.position.set(XD, DH / 2, 0.012); scene.add(backdrop);
  for (const s of [-1, 1]) block(0.55, DH + 0.3, 0.5, marbleM, XD + s * (DW / 2 + 0.275), (DH + 0.3) / 2, 0.25, scene, 0.04);
  block(DW + 1.5, 0.95, 0.6, marbleM, XD, DH + 0.3 + 0.475, 0.3, scene, 0.05);
  block(DW + 1.75, 0.16, 0.7, marbleM, XD, DH + 0.3 + 1.03, 0.32, scene, 0.04);
  const linT = label(1400, 300, (g, w, h) => { marble(g, w, h, 77); g.strokeStyle = "rgba(120,98,60,.5)"; g.lineWidth = 3; g.strokeRect(24, 24, w - 48, h - 48); engrave(g, "MERDEKA", 180, 175, `600 50px ${PLEX}`, { ls: 10, col: "#2b241e" }); engrave(g, "1804", w / 2, 222, `700 210px ${COR}`, { kind: "gold" }); engrave(g, "HAITI", w - 170, 175, `600 50px ${PLEX}`, { ls: 10, col: "#2b241e" }); });
  const lin = face(DW + 1.36, 0.82, linT, XD, DH + 0.3 + 0.475, 0.602, scene, { metal: 0.15, rough: 0.3, bumpScale: 0.4 });
  lin.material.emissive = new THREE.Color(0xffc860); lin.material.emissiveIntensity = 0;
  const lgT = canvasTex(1400, 300, (g, w, h) => { g.clearRect(0, 0, w, h); g.font = `700 210px ${COR}`; g.textAlign = "center"; g.fillStyle = "#fff"; g.fillText("1804", w / 2, 222); });
  lin.material.emissiveMap = lgT; labels.push([lgT, (g, w, h) => { g.clearRect(0, 0, w, h); g.font = `700 210px ${COR}`; g.textAlign = "center"; g.fillStyle = "#fff"; g.fillText("1804", w / 2, 222); }]);
  const doorT = canvasTex(512, 1468, (g, w, h) => {
    g.fillStyle = "#6E5034"; g.fillRect(0, 0, w, h);
    const q = mulberry(13); for (let i = 0; i < 1600; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "30,20,10" : "200,160,110"},${0.04 + q() * 0.05})`; g.lineWidth = 1; const x = q() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (q() - 0.5) * 6, h); g.stroke(); }
    for (const [y0, y1] of [[60, 640], [720, 1400]]) { g.strokeStyle = "#3A2814"; g.lineWidth = 14; g.strokeRect(60, y0, w - 120, y1 - y0); g.strokeStyle = "rgba(240,200,140,.5)"; g.lineWidth = 4; g.strokeRect(80, y0 + 20, w - 160, y1 - y0 - 40); }
    for (let k = 0; k < 6; k++) for (const x of [36, w - 36]) { g.beginPath(); g.arc(x, 120 + k * 240, 10, 0, 6.283); g.fillStyle = "#C9A457"; g.fill(); }
  });
  const doorM = std({ map: doorT, metalness: 0.7, roughness: 0.42, envMapIntensity: ENV * 2.2, bumpMap: doorT, bumpScale: 1.2 });
  const leaves = [-1, 1].map((s) => {
    const H = G(XD + s * DW / 2, 0, 0.32);
    const lf = add(new THREE.Mesh(new THREE.BoxGeometry(DW / 2 - 0.02, DH - 0.02, 0.09), doorM), H); lf.position.set(-s * (DW / 4), DH / 2, 0);
    const ring2 = add(new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 10, 24), goldM), H); ring2.position.set(-s * (DW / 2 - 0.25), 1.95, 0.07);
    return { H, s };
  });
  const bar = add(new THREE.Mesh(new THREE.BoxGeometry(DW + 0.5, 0.14, 0.12), darkBronze), scene); bar.position.set(XD, 2.2, 0.48);
  const bracket = [-1, 1].map((s) => { const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.16), darkBronze), scene); b.position.set(XD + s * (DW / 2 + 0.15), 2.2, 0.5); return b; });
  const spillT = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,226,170,.75)"); gr.addColorStop(1, "rgba(255,226,170,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(1, 4.2), new THREE.MeshBasicMaterial({ map: spillT, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })); spill.rotation.x = -Math.PI / 2; spill.position.set(XD, 0.012, 2.4); spill.renderOrder = 2; scene.add(spill);
  const doorGlow = new THREE.PointLight(0xffd9a0, 0, 7, 1.6); doorGlow.position.set(XD, 2.0, 0.6); scene.add(doorGlow);
  const signT = label(800, 200, (g, w, h) => { marble(g, w, h, 88); engrave(g, "PINTU DAGANG", w / 2, 130, `600 74px ${PLEX}`, { ls: 14, col: "#26201b" }); });
  block(1.72, 0.44, 0.06, marbleM, XD + 3.1, 1.75, 0.05, scene, 0.015); face(1.62, 0.4, signT, XD + 3.1, 1.75, 0.081);
  blob(5.5, 2.4, XD, 0.6, 0.5);
  spot(XD, 2.6, XD, 3.4, 0, 80, 0.42);

  // ---------- E: warship vitrine + 150.000.000 frieze ----------
  const XE = 60, ZE = 2.7, PH = 1.0;
  block(3.1, PH, 1.8, marbleM, XE, PH / 2, ZE, scene, 0.05);
  block(3.3, 0.1, 2.0, marbleM, XE, 0.05, ZE, scene, 0.03);
  blob(4.4, 3.2, XE, ZE + 0.2, 0.7);
  const seaT = canvasTex(1400, 700, (g, w, h) => {
    g.fillStyle = "#1E3242"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(170,200,215,.22)"; g.lineWidth = 2; for (let y = 14; y < h; y += 22) { g.beginPath(); for (let x = 0; x <= w; x += 14) g.lineTo(x, y + Math.sin(x * 0.03 + y * 0.4) * 3); g.stroke(); }
    g.strokeStyle = "rgba(201,164,87,.7)"; g.lineWidth = 5; g.strokeRect(14, 14, w - 28, h - 28);
  });
  const sea = add(new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.56), std({ map: seaT, roughness: 0.35, envMapIntensity: ENV * 1.5 })), scene, false); sea.rotation.x = -Math.PI / 2; sea.position.set(XE, PH + 0.003, ZE);
  // coast of Haiti on the left of the board, marble
  const coastS = new THREE.Shape(); coastS.moveTo(-1.43, -0.78); coastS.lineTo(-0.82, -0.78); coastS.quadraticCurveTo(-0.62, -0.4, -0.8, -0.1); coastS.quadraticCurveTo(-0.6, 0.25, -0.86, 0.52); coastS.lineTo(-0.7, 0.78); coastS.lineTo(-1.43, 0.78); coastS.lineTo(-1.43, -0.78);
  const coastG = new THREE.ExtrudeGeometry(coastS, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }); coastG.rotateX(-Math.PI / 2);
  const coast = add(new THREE.Mesh(coastG, marbleM), scene); coast.position.set(XE, PH, ZE);
  const portT = label(500, 120, (g, w, h) => { g.clearRect(0, 0, w, h); plain(g, "Port-au-Prince", w / 2, 84, `italic 700 72px ${COR}`, "#2a241e"); });
  const portL = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.144), new THREE.MeshBasicMaterial({ map: portT, transparent: true, depthWrite: false })); portL.rotation.x = -Math.PI / 2; portL.rotation.z = Math.PI / 2; portL.position.set(XE - 1.12, PH + 0.1, ZE); scene.add(portL);
  // 14 ship tokens in two lines, bows toward the coast
  const hullS = new THREE.Shape(); hullS.moveTo(-0.17, 0); hullS.quadraticCurveTo(-0.12, 0.05, 0.0, 0.05); hullS.lineTo(0.14, 0.045); hullS.quadraticCurveTo(0.17, 0.02, 0.15, -0.0); hullS.quadraticCurveTo(0.17, -0.02, 0.14, -0.045); hullS.lineTo(0.0, -0.05); hullS.quadraticCurveTo(-0.12, -0.05, -0.17, 0);
  const hullG = new THREE.ExtrudeGeometry(hullS, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2 }); hullG.rotateX(-Math.PI / 2);
  const ships = [];
  for (let i = 0; i < 14; i++) {
    const rowI = i % 2, k = Math.floor(i / 2);
    const S = G(0, 0, 0);
    add(new THREE.Mesh(hullG, bronzeM), S);
    for (const mxx of [-0.08, 0.0, 0.08]) { const m = add(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.2, 6), darkBronze), S); m.position.set(mxx, 0.16, 0); }
    for (const mxx of [-0.08, 0.0, 0.08]) { const yard = add(new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.11), darkBronze), S); yard.position.set(mxx, 0.2, 0); }
    const fx = XE - 0.25 + k * 0.24 + rowI * 0.12, fz = ZE - 0.38 + rowI * 0.62 + Math.sin(k * 0.9) * 0.05;
    ships.push({ S, fx, fz, ry: Math.PI + 0.12 * (rowI ? -1 : 1) });
  }
  // glass case with gilt edges
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.96, 0.62, 1.66), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.1, envMapIntensity: 1.2, clearcoat: 1, depthWrite: false }));
  glass.position.set(XE, PH + 0.31, ZE); glass.renderOrder = 5; scene.add(glass);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const e = add(new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.62, 0.025), goldM), scene, false); e.position.set(XE + sx * 1.48, PH + 0.31, ZE + sz * 0.83); }
  for (const sz of [-1, 1]) { const e = add(new THREE.Mesh(new THREE.BoxGeometry(2.98, 0.025, 0.025), goldM), scene, false); e.position.set(XE, PH + 0.62, ZE + sz * 0.83); }
  for (const sx of [-1, 1]) { const e = add(new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 1.68), goldM), scene, false); e.position.set(XE + sx * 1.48, PH + 0.62, ZE); }
  // plinth front line
  const plFrontT = label(1500, 380, (g, w, h) => { marble(g, w, h, 121); engrave(g, "3 JULI 1825 · PORT-AU-PRINCE", w / 2, 110, `600 46px ${PLEX}`, { ls: 8, col: "#2b241e" }); });
  face(2.9, 0.735, plFrontT, XE, 0.56, ZE + 0.902, scene);
  const plLineT = label(1500, 380, (g, w, h) => { g.clearRect(0, 0, w, h); engrave(g, "14 KAPAL PERANG · 528 MERIAM", w / 2, 270, `700 104px ${COR}`, { kind: "gold" }); });
  const plLine = face(2.9, 0.735, plLineT, XE, 0.56, ZE + 0.905, scene, { transparent: true, metal: 0.6, env: 2.2, bump: false, opacity: 0 });
  // frieze on the wall
  block(5.0, 1.1, 0.14, marbleM, XE, 3.0, 0.08, scene, 0.03);
  const frzT = label(2000, 500, (g, w, h) => { marble(g, w, h, 131); g.strokeStyle = "rgba(120,98,60,.5)"; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44); engrave(g, "TUNTUTAN GANTI RUGI · ORDONANSI CHARLES X", w / 2, 92, `600 40px ${PLEX}`, { ls: 8, col: "#2b241e" }); });
  face(4.9, 1.078, frzT, XE, 3.0, 0.152);
  const frzNumT = label(2000, 500, (g, w, h) => { g.clearRect(0, 0, w, h); engrave(g, "150.000.000 FRANC", w / 2, 330, `700 230px ${COR}`, { kind: "gold" }); });
  const frzNum = face(4.9, 1.078, frzNumT, XE, 3.0, 0.155, scene, { transparent: true, metal: 0.6, env: 2.4, bump: false, opacity: 0 });
  frzNum.material.emissive = new THREE.Color(0xffc860); frzNum.material.emissiveMap = frzNumT; frzNum.material.emissiveIntensity = 0;
  const frzSubT = label(2000, 500, (g, w, h) => { g.clearRect(0, 0, w, h); engrave(g, "dengan imbalan pengakuan", w / 2, 450, `italic 600 62px ${COR}`, { col: "#4a3e30" }); });
  const frzSub = face(4.9, 1.078, frzSubT, XE, 3.0, 0.156, scene, { transparent: true, bump: false, opacity: 0 });
  spot(XE, ZE + 2.2, XE, PH, ZE, 75, 0.36);
  const spE2 = spot(XE, 2.0, XE, 3.0, 0, 32, 0.34, false);

  // ---------- F: ledger on a slanted lectern ----------
  const XF = 76, ZF = 2.6;
  block(0.9, 1.0, 0.62, marbleM, XF, 0.5, ZF, scene, 0.04);
  block(1.2, 0.1, 0.85, marbleM, XF, 0.05, ZF, scene, 0.03);
  blob(2.6, 2.0, XF, ZF + 0.2, 0.7);
  const desk = G(XF, 1.1, ZF); desk.rotation.x = 0.42;
  block(2.0, 0.06, 1.36, neroM, 0, 0, 0, desk, 0.02);
  block(2.0, 0.08, 0.06, goldM, 0, 0.06, 0.68, desk, 0.015);
  block(1.84, 0.035, 1.22, std({ color: 0x5c1a20, roughness: 0.62 }), 0, 0.045, -0.01, desk, 0.012);
  const PGW = 1.74, PGD = 1.14;
  const pageT = label(2048, 1342, (g, w, h) => {
    paper(g, w, h, 141, "#D6CBB2");
    const gg = g.createLinearGradient(w / 2 - 120, 0, w / 2 + 120, 0); gg.addColorStop(0, "rgba(80,60,30,0)"); gg.addColorStop(0.5, "rgba(80,60,30,.35)"); gg.addColorStop(1, "rgba(80,60,30,0)"); g.fillStyle = gg; g.fillRect(w / 2 - 120, 0, 240, h);
    g.strokeStyle = "rgba(60,90,130,.28)"; g.lineWidth = 2; for (let y = 300; y < h - 60; y += 86) { g.beginPath(); g.moveTo(70, y); g.lineTo(w / 2 - 60, y); g.moveTo(w / 2 + 60, y); g.lineTo(w - 70, y); g.stroke(); }
    g.strokeStyle = "rgba(160,30,40,.45)"; for (const x of [200, w / 2 + 190]) { g.beginPath(); g.moveTo(x, 230); g.lineTo(x, h - 60); g.stroke(); }
    plain(g, "BUKU BESAR", w / 4, 140, `700 74px ${COR}`, "#2a241e", "center", 8);
    plain(g, "utang kemerdekaan Haiti", w / 4, 205, `italic 600 50px ${COR}`, "#2b241e");
    plain(g, "dalam franc", w * 0.75, 205, `italic 600 50px ${COR}`, "#2b241e");
    plain(g, "1825", 90, 372, `600 44px ${PLEX}`, "#2a241e", "left");
    plain(g, "Tuntutan ganti rugi", 230, 372, `400 44px ${PLEX}`, "#2a241e", "left");
    plain(g, "150.000.000", w / 2 - 80, 458, `600 54px ${PLEX}`, "#2a241e", "right");
    plain(g, "Cicilan I", 230, 630, `400 44px ${PLEX}`, "#2a241e", "left");
    plain(g, "30.000.000", w / 2 - 80, 630, `600 44px ${PLEX}`, "#2a241e", "right");
  });
  const pageGeo = new THREE.PlaneGeometry(PGW, PGD, 48, 1); pageGeo.rotateX(-Math.PI / 2);
  const pageY = (x) => 0.075 + 0.028 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.abs(x) / (PGW / 2)))), 0.7);
  { const p = pageGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, pageY(p.getX(i))); pageGeo.computeVertexNormals(); }
  add(new THREE.Mesh(pageGeo, std({ map: pageT, color: 0xe2d9c6, roughness: 0.85, bumpMap: pageT, bumpScale: 0.2 })), desk, false);
  // overlays on the pages: written lines appear left to right
  const ink = (w, h, paint, x, z, ww, dd) => {
    const tx = label(w, h, paint); tx.wrapS = THREE.ClampToEdgeWrapping;
    const geo = new THREE.PlaneGeometry(1, dd); geo.translate(0.5, 0, 0); geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false })); m.position.set(x, pageY(x + ww / 2) + 0.004, z); m.renderOrder = 3; desk.add(m);
    return { m, tx, ww };
  };
  const pxX = (px) => (px / 2048 - 0.5) * PGW, pxZ = (py) => (py / 1342 - 0.5) * PGD;
  const inkBorrow = ink(1024, 100, (g, w, h) => { g.clearRect(0, 0, w, h); plain(g, "↳ dibayar dengan pinjaman", 4, 70, `italic 700 62px ${COR}`, "#8E1B26", "left"); }, pxX(230), pxZ(712), 0.64, 0.0625);
  const inkStrike = ink(256, 40, (g, w, h) => { g.fillStyle = "#8E1B26"; g.fillRect(0, 14, w, 12); }, pxX(636), pxZ(440), 0.27, 0.012);
  const ink1838 = ink(1024, 100, (g, w, h) => { g.clearRect(0, 0, w, h); plain(g, "1838", 4, 66, `600 44px ${PLEX}`, "#2a241e", "left"); plain(g, "Sisa diturunkan menjadi", 150, 66, `400 44px ${PLEX}`, "#2a241e", "left"); }, pxX(w2(90)), pxZ(352), 0.85, 0.083);
  function w2(x) { return 1024 + x; }
  const ink60 = ink(600, 100, (g, w, h) => { g.clearRect(0, 0, w, h); plain(g, "60.000.000", w - 6, 72, `700 64px ${PLEX}`, "#8E1B26", "right"); }, pxX(2048 - 80 - 600 * 0.9), pxZ(442), 0.5, 0.083);
  const inkLunas = ink(1024, 100, (g, w, h) => { g.clearRect(0, 0, w, h); plain(g, "1883", 4, 66, `600 44px ${PLEX}`, "#2a241e", "left"); plain(g, "Lunas kepada Prancis", 150, 66, `400 44px ${PLEX}`, "#2a241e", "left"); }, pxX(w2(90)), pxZ(610), 0.85, 0.083);
  // LUNAS stamp
  const stampT = label(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.18);
    g.strokeStyle = "rgba(158,27,44,.9)"; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 220, 0, 6.283); g.stroke(); g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 190, 0, 6.283); g.stroke();
    plain(g, "LUNAS", 0, 10, `700 130px ${COR}`, "rgba(158,27,44,.92)", "center", 6); plain(g, "1883", 0, 120, `700 92px ${COR}`, "rgba(158,27,44,.92)"); g.restore();
  });
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: stampT, transparent: true, depthWrite: false })); stamp.rotation.x = -Math.PI / 2; stamp.renderOrder = 4;
  stamp.position.set(pxX(1600), pageY(pxX(1600)) + 0.008, pxZ(980)); desk.add(stamp);
  // a few bronze coins on the desk ledge
  const coinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.012, 32);
  const coinM = std({ color: 0xd2ad5a, metalness: 0.92, roughness: 0.28, envMapIntensity: ENV * 2.8 });
  for (let i = 0; i < 4; i++) { const c = add(new THREE.Mesh(coinGeo, coinM), desk); c.position.set(0.82, 0.07 + i * 0.013, 0.52); }
  wallCard(XF + 1.8, 1.6, ["No. 06", "Buku besar", "kertas, tinta", "cicilan dan sisa utang"]);
  spot(XF, ZF + 1.6, XF, 1.1, ZF, 55, 0.3);

  // ---------- G: interest rail 1825 -> 1947 ----------
  const XG = 92, YG = 3.4, RW = 4.5, BWG = 5.4;
  const yr = (y) => XG - RW / 2 + (y - 1825) / (1947 - 1825) * RW;
  block(BWG, 2.6, 0.12, marbleM, XG, YG, 0.07, scene, 0.03);
  const railT = label(2400, 1006, (g, w, h) => {
    marble(g, w, h, 151);
    g.strokeStyle = "rgba(120,98,60,.5)"; g.lineWidth = 3; g.strokeRect(24, 24, w - 48, h - 48);
    engrave(g, "UTANG DAN BUNGANYA", w / 2, 120, `600 54px ${PLEX}`, { ls: 12, col: "#26201b" });
    const X = (y) => w / 2 + (y - 1886) / 122 * RW / BWG * w;
    for (const [y, lab] of [[1825, "1825"], [1838, "1838"], [1883, "1883"], [1947, "1947"]]) {
      g.strokeStyle = "#2b241e"; g.lineWidth = 4; g.beginPath(); g.moveTo(X(y), 520); g.lineTo(X(y), 600); g.stroke();
      engrave(g, lab, X(y), 690, `700 76px ${COR}`, { col: y === 1947 ? "#8E1B26" : "#1f1a15" });
    }
    engrave(g, "kepada Prancis", (X(1825) + X(1883)) / 2, 300, `italic 600 54px ${COR}`, { col: "#33291f" });
    engrave(g, "bunga pinjaman", (X(1883) + X(1947)) / 2, 300, `italic 600 54px ${COR}`, { col: "#33291f" });
  });
  face(BWG - 0.1, 2.556, railT, XG, YG, 0.132);
  const railBase = add(new THREE.Mesh(new THREE.BoxGeometry(RW, 0.03, 0.05), darkBronze), scene, false); railBase.position.set(XG, YG + 0.0, 0.16);
  const goldBar = add(new THREE.Mesh(new THREE.BoxGeometry(1, 0.16, 0.1).translate(0.5, 0, 0), goldM), scene); goldBar.position.set(yr(1825), YG + 0.12, 0.2);
  const intM = std({ color: 0x8e1b26, metalness: 0.55, roughness: 0.38, envMapIntensity: ENV * 2, emissive: 0x3a0508, emissiveIntensity: 0.4 });
  const intBar = add(new THREE.Mesh(new THREE.BoxGeometry(1, 0.16, 0.1).translate(0.5, 0, 0), intM), scene); intBar.position.set(yr(1883), YG + 0.12, 0.2);
  const stacks = [];
  for (let k = 0; k < 9; k++) {
    const S = G(yr(1886 + k * 7), YG - 0.95, 0.24); const coins = [];
    for (let j = 0; j < 9; j++) { const c = add(new THREE.Mesh(coinGeo, coinM), S); c.position.y = j * 0.014; c.rotation.y = j; coins.push(c); }
    const shelf = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.18), goldM), S); shelf.position.y = -0.016;
    stacks.push({ S, coins, y: 1886 + k * 7 });
  }
  const g47 = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); g47.position.set(yr(1947), YG + 0.12, 0.3); scene.add(g47);
  const nytT = label(1400, 220, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#D9B86E"); gr.addColorStop(0.5, "#B08A42"); gr.addColorStop(1, "#D8B66A"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#3A2A10"; g.lineWidth = 4; g.strokeRect(16, 16, w - 32, h - 32);
    engrave(g, "Sumber: analisis New York Times, 2022", w / 2, 132, `italic 600 76px ${COR}`, { kind: "ink" });
  });
  const nyt = G(XG, 1.55, 0.06);
  block(2.42, 0.4, 0.04, goldM, 0, 0, 0, nyt, 0.01);
  face(2.36, 0.37, nytT, 0, 0, 0.022, nyt, { metal: 0.75, rough: 0.33, env: 2.4, cc: 0, bumpScale: 0.3, color: 0xffffff });
  spot(XG - 1.2, 2.3, XG - 1.4, YG, 0, 45, 0.36);
  spot(XG + 1.2, 2.3, XG + 1.6, YG, 0, 45, 0.36, false);

  // ---------- H: 2016 stele + empty tray ----------
  const XH = 104, ZH = 1.9;
  block(2.0, 0.3, 0.8, marbleM, XH, 0.15, ZH, scene, 0.03);
  block(1.7, 2.8, 0.3, marbleM, XH, 0.3 + 1.4, ZH, scene, 0.05);
  blob(3.0, 2.0, XH, ZH + 0.2, 0.7);
  const steleT = label(1000, 1648, (g, w, h) => {
    marble(g, w, h, 161);
    g.strokeStyle = "rgba(120,98,60,.5)"; g.lineWidth = 3; g.strokeRect(30, 30, w - 60, h - 60);
    engrave(g, "2016", w / 2, 360, `700 280px ${COR}`, { col: "#1f1a15" });
    engrave(g, "Parlemen Prancis", w / 2, 560, `600 74px ${COR}`, { col: "#1f1a15" });
    engrave(g, "mencabut aturan", w / 2, 650, `600 74px ${COR}`, { col: "#1f1a15" });
    engrave(g, "Charles X tahun 1825", w / 2, 740, `600 74px ${COR}`, { col: "#1f1a15" });
    g.strokeStyle = "rgba(120,98,60,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 200, 830); g.lineTo(w / 2 + 200, 830); g.stroke();
  });
  face(1.6, 2.64, steleT, XH, 1.7, ZH + 0.152);
  const steleGT = label(1000, 1648, (g, w, h) => { g.clearRect(0, 0, w, h); engrave(g, "dicabut,", w / 2, 1000, `italic 700 112px ${COR}`, { kind: "gold" }); engrave(g, "tanpa ganti rugi", w / 2, 1140, `italic 700 112px ${COR}`, { kind: "gold" }); });
  const steleG = face(1.6, 2.64, steleGT, XH, 1.7, ZH + 0.156, scene, { transparent: true, metal: 0.6, env: 2.4, bump: false, opacity: 0 });
  steleG.material.emissive = new THREE.Color(0xffc860); steleG.material.emissiveMap = steleGT; steleG.material.emissiveIntensity = 0;
  const XT = XH + 1.95;
  block(0.6, 1.0, 0.6, marbleM, XT, 0.5, ZH + 0.2, scene, 0.03);
  const tray = add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.03, 40), goldM), scene); tray.position.set(XT, 1.02, ZH + 0.2);
  const trayRim = add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.012, 8, 40), goldM), scene); trayRim.rotation.x = Math.PI / 2; trayRim.position.set(XT, 1.04, ZH + 0.2);
  const trayT = label(600, 200, (g, w, h) => { g.fillStyle = "#F4F0E8"; g.fillRect(0, 0, w, h); plain(g, "GANTI RUGI", w / 2, 90, `600 54px ${PLEX}`, INK, "center", 8); plain(g, "belum ada", w / 2, 160, `italic 600 50px ${COR}`, "#8E1B26"); });
  const trayCard = G(XT, 0.72, ZH + 0.505); face(0.5, 0.167, trayT, 0, 0, 0, trayCard, { rough: 0.85, cc: 0, bump: false, color: 0xffffff });
  spot(XH, ZH + 1.4, XH, 1.7, ZH, 60, 0.32);
  const spT = spot(XT, ZH + 1.6, XT, 1.0, ZH + 0.2, 35, 0.18, false);

  // ---------- I: the balance ----------
  const XI = 120, ZI = 3.2;
  block(1.9, 1.1, 1.9, marbleM, XI, 0.55, ZI, scene, 0.05);
  block(2.2, 0.12, 2.2, marbleM, XI, 0.06, ZI, scene, 0.03);
  blob(3.6, 3.6, XI, ZI, 0.75);
  const baseT = label(1300, 740, (g, w, h) => {
    marble(g, w, h, 171);
    g.strokeStyle = "rgba(120,98,60,.5)"; g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52);
    engrave(g, "PAMERAN AUDIRA", w / 2, 300, `700 136px ${COR}`, { kind: "gold", ls: 6 });
    engrave(g, "Utang Kemerdekaan Haiti", w / 2, 440, `italic 600 70px ${COR}`, { col: "#1f1a15" });
    engrave(g, "1825 – 1947", w / 2, 560, `600 60px ${PLEX}`, { col: "#2b241e", ls: 6 });
  });
  face(1.8, 1.025, baseT, XI, 0.55, ZI + 0.952, scene, { metal: 0.1 });
  const col = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.2, 24), bronzeM), scene); col.position.set(XI, 1.1 + 1.1, ZI);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.1, 40), bronzeM), scene).position.set(XI, 1.15, ZI);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), goldM), scene).position.set(XI, 3.38, ZI);
  const PIV = new THREE.Vector3(XI, 3.25, ZI), ARM = 1.2, HANG = 1.15;
  const beam = G(PIV.x, PIV.y, PIV.z);
  add(new THREE.Mesh(new THREE.BoxGeometry(ARM * 2 + 0.1, 0.07, 0.07), bronzeM), beam);
  const needle = add(new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.42, 12), goldM), beam); needle.position.y = 0.26;
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), goldM), beam).position.x = s * (ARM + 0.04);
  const pans = [-1, 1].map((s) => {
    const P = G(0, 0, 0);
    const pan = add(new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.07, 48), bronzeM), P); pan.position.y = -HANG;
    const rim = add(new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.014, 8, 48), goldM), P, false); rim.rotation.x = Math.PI / 2; rim.position.y = -HANG + 0.035;
    for (let k = 0; k < 3; k++) {
      const a = k / 3 * 6.283 + 0.5, bx = Math.cos(a) * 0.42, bz = Math.sin(a) * 0.42;
      const v = new THREE.Vector3(bx, -HANG + 0.035, bz), len = v.length();
      const ch = add(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, len, 6), goldM), P, false);
      ch.position.copy(v.clone().multiplyScalar(0.5)); ch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
    }
    return { P, s };
  });
  // left pan: coin stacks (the heavy side), right pan: a small marble tablet 1804
  const coinBig = new THREE.CylinderGeometry(0.11, 0.11, 0.024, 36);
  const panCoins = [];
  for (let k = 0; k < 3; k++) for (let j = 0; j < 9; j++) {
    const c = add(new THREE.Mesh(coinBig, coinM), pans[0].P); const a = k * 2.094 + 0.3;
    c.userData.home = new THREE.Vector3(Math.cos(a) * 0.17, -HANG + 0.047 + j * 0.026, Math.sin(a) * 0.17); c.rotation.y = j * 0.7; c.position.copy(c.userData.home); panCoins.push(c);
  }
  const tagT = label(700, 240, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#D9B86E"); gr.addColorStop(1, "#B08A42"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "#3A2A10"; g.lineWidth = 5; g.strokeRect(12, 12, w - 24, h - 24); engrave(g, "150 juta franc", w / 2, 150, `700 104px ${COR}`, { kind: "ink" }); });
  const tagL = G(0, -HANG + 0.32, 0.35, pans[0].P); block(0.62, 0.22, 0.02, goldM, 0, 0, 0, tagL, 0.006); face(0.6, 0.206, tagT, 0, 0, 0.012, tagL, { metal: 0.7, rough: 0.35, env: 2.2, cc: 0, bumpScale: 0.2 });
  const tabR = G(0, -HANG + 0.2, 0, pans[1].P);
  block(0.5, 0.32, 0.07, marbleM, 0, 0, 0, tabR, 0.015);
  const t1804T = label(600, 384, (g, w, h) => { marble(g, w, h, 181); engrave(g, "1804", w / 2, 230, `700 190px ${COR}`, { kind: "gold" }); engrave(g, "kemerdekaan", w / 2, 320, `italic 600 58px ${COR}`, { col: "#1f1a15" }); });
  face(0.47, 0.3, t1804T, 0, 0, 0.037, tabR, { bumpScale: 0.3 });
  spot(XI, ZI + 2.4, XI, 2.2, ZI, 80, 0.42);
  const balGlow = new THREE.PointLight(0xffd9a0, 0, 6, 1.5); balGlow.position.set(XI, 2.6, ZI + 1.4); scene.add(balGlow);

  // ---------- dust motes ----------
  const dust = pts(scene, 220, { color: 0xffe9c8, size: 0.035, add: true, opacity: 0.5 });
  const dsq = mulberry(5); const dSeed = Array.from({ length: 220 }, () => [dsq() * 2 - 1, dsq(), dsq(), dsq() * 6.283, 0.1 + dsq() * 0.3]);

  // ---------- timing ----------
  const tSer = A("s1:seratus"), tHai = A("s2:Haiti"), tKar = A("s2:Karibia"), tSD = A("s2:Saint-Domingue");
  const tDari = A("s3:dari"), tPend = A("s3:penduduknya"), tEmp = A("s3:empat"), tRibu2 = A("s3:ribu#2"), tBudak = A("s3:budak"), t1804 = A("s3:1804");
  const tMeng = A("s4:mengakui"), tHai2 = A("s4:Haiti#2"), tTerk = A("s4:terkucil");
  const tEmp5 = A("s5:empat"), tKap = A("s5:kapal"), tMer = A("s5:meriam"), tTun = A("s5:Tuntutannya"), tSer5 = A("s5:seratus"), tPeng = A("s5:pengakuan");
  const tBer = A("s6:berutang"), t1838 = A("s6:1838"), tTurun = A("s6:diturunkan"), tEnam = A("s6:enam"), t1883 = A("s6:1883");
  const tBunga = A("s7:berbunga"), t1947 = A("s7:1947"), tAnal = A("s7:analisis"), tTahun = A("s7:Tahun"), tCabut = A("s7:mencabut"), tTanpa = A("s7:tanpa");
  const tMahal = A("s8:mahal"), tDibayar = A("s8:dibayar"), tMen8 = A("s8:Menurut");

  // ---------- camera ----------
  const cv = (tx, ty, tz, d, el, yaw = 0) => { const e = el * Math.PI / 180; return [tx + d * Math.cos(e) * Math.sin(yaw), ty + d * Math.sin(e), tz + d * Math.cos(e) * Math.cos(yaw), tx, ty, tz]; };
  const keys = [
    [0, ...cv(XA, 3.2, 0, 15.5, 5, 0.1)],
    [K.s1e - 0.6, ...cv(XA, 3.25, 0, 11.6, 4, 0.0)],
    [K.s2 + 1.6, ...cv(XB, 3.0, 0, 10.4, 4, -0.04)],
    [K.s2e - 0.7, ...cv(XB, 3.05, 0, 9.6, 4, 0.03)],
    [tDari - 0.05, ...cv(XC, 3.05, 0, 10.6, 3, 0.0)],
    [tBudak + 0.2, ...cv(XC, 3.05, 0, 9.9, 3, 0.02)],
    [t1804 + 0.2, ...cv(XD, 3.0, 0, 13.2, 6, -0.07)],
    [tMeng - 0.2, ...cv(XD, 2.8, 0, 12.6, 6, -0.03)],
    [K.s4e - 0.3, ...cv(XD, 2.6, 0.4, 11.6, 7, 0.04)],
    [tEmp5 - 0.15, ...cv(XE, 1.0, ZE, 7.6, 42, -0.12)],
    [tTun - 0.4, ...cv(XE, 1.0, ZE, 7.0, 40, 0.06)],
    [tSer5 + 0.4, ...cv(XE, 2.4, 1.6, 12.4, 6, 0.0)],
    [K.s5e - 0.4, ...cv(XE, 2.4, 1.6, 13.0, 6, 0.04)],
    [tBer + 1.1, ...cv(XF, 1.25, ZF, 4.9, 46, -0.1)],
    [K.s6e - 0.3, ...cv(XF, 1.25, ZF, 4.5, 50, 0.06)],
    [K.s7 + 1.9, ...cv(XG - 0.3, 3.0, 0, 14.6, 3, 0.04)],
    [t1947 + 0.3, ...cv(XG + 0.2, 3.0, 0, 14.4, 3, -0.03)],
    [t1947 + 1.0, ...cv(XG + 0.25, 3.0, 0, 14.6, 3, -0.04)],
    [tTahun + 1.3, ...cv(XH + 0.7, 1.9, ZH, 9.6, 7, -0.08)],
    [K.s7e - 0.4, ...cv(XH + 0.75, 1.9, ZH, 9.2, 7, 0.0)],
    [K.s8 + 1.7, ...cv(XI, 2.35, ZI, 9.2, 9, 0.12)],
    [tMen8 - 0.1, ...cv(XI, 2.35, ZI, 8.6, 9, 0.05)],
    [tMen8 + 4.6, ...cv(XI - 1.2, 2.3, ZI, 15, 9, 0.42)],
    [K.dur, ...cv(XI - 1.4, 2.3, ZI, 15.8, 9, 0.46)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  // spotlight arrival per exhibit: dim before, up as the camera arrives, stays on
  const ARR = [0.2, K.s2 + 0.6, tDari - 0.6, t1804 - 0.6, tEmp5 - 0.8, tBer + 0.2, K.s7 + 0.9, K.s7 + 1.1, tTahun + 0.4, K.s8 + 0.8];
  const spotOrder = [0, 1, 2, 3, 4, 6, 7, 8, 9, 11]; // index into spots: A B C D E F G1 G2 H I (E2 / tray handled below)

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Cormorant Garamond"`) && document.fonts.check(`400 40px "IBM Plex Serif"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.08, c[1] + Math.sin(t * 0.23) * 0.05, c[2] + Math.cos(t * 0.27) * 0.06);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    key.target.position.copy(tgt); key.position.set(tgt.x - 9, 14, tgt.z + 12);

    // spotlights
    spotOrder.forEach((si, k) => {
      const s = spots[si], u = smooth(clamp01((t - ARR[k]) / 1.3));
      const v = 0.12 + 0.88 * u;
      s.L.intensity = s.I * v; s.lens.material.color.setRGB(0.25 + 0.75 * v, 0.22 + 0.66 * v, 0.18 + 0.54 * v);
      if (s.cone) s.cone.material.opacity = 0.022 * u;
    });
    { const u = smooth(clamp01((t - tSer5 + 0.4) / 1.0)); spots[5].L.intensity = spots[5].I * (0.1 + 0.9 * u); }
    { const u = smooth(clamp01((t - tTanpa + 0.2) / 0.9)); spots[10].L.intensity = spots[10].I * (0.08 + 0.92 * u); }

    // A: years glow on "seratus"
    yearsM.material.emissiveIntensity = 0.0 + 0.3 * pump(t, tSer - 0.1, 0.25, 1.6);

    // B: Haiti highlight, pin, Saint-Domingue tag
    const uH = smooth(clamp01((t - tHai) / 0.8));
    hl.material.opacity = 0.88 * uH;
    const dP = clamp01((t - tKar + 0.15) / 0.35);
    pin.position.set(pinAt[0], pinAt[1], 0.02 + 0.6 * (1 - dP * dP)); pin.visible = dP > 0;
    pinGlow.material.opacity = 0.8 * pump(t, tKar + 0.2, 0.1, 1.2) + (dP >= 1 ? 0.15 : 0);
    sd.material.opacity = smooth(clamp01((t - tSD + 0.1) / 0.6));

    // C: dots pop in, then 425 turn bronze
    const fillDur = Math.max(0.6, tPend - tDari - 0.05), turnDur = Math.max(0.6, tRibu2 - tEmp);
    for (let i = 0; i < NC * NR; i++) {
      const u = back(clamp01((t - tDari - (i / (NC * NR)) * fillDur) / 0.22), 1.4);
      const p = dotPos[i]; dv.set(p[0], p[1], p[2] + 0.02 * (1 - clamp01(u)));
      ds.setScalar(Math.max(0.001, u)); dm.compose(dv, dq, ds); dots.setMatrixAt(i, dm);
      const b = i < 425 ? smooth(clamp01((t - tEmp - (i / 425) * turnDur) / 0.25)) : 0;
      cTmp.copy(cW).lerp(cB, b); dots.setColorAt(i, cTmp);
    }
    dots.instanceMatrix.needsUpdate = true; if (dots.instanceColor) dots.instanceColor.needsUpdate = true;

    // D: 1804 lights, doors close on the isolation line, the bar drops
    lin.material.emissiveIntensity = 0.55 * pump(t, t1804 - 0.1, 0.25, 2.5) + (t > t1804 ? 0.12 : 0);
    const uC = smooth(clamp01((t - tMeng) / Math.max(0.8, tTerk - tMeng - 0.05)));
    const open = 1 - uC;
    leaves.forEach(({ H, s }) => { H.rotation.y = s < 0 ? -open * 1.35 : open * 1.35; });
    spill.scale.x = Math.max(0.001, 2.9 * Math.pow(open, 0.8)); spill.material.opacity = 0.3 * open;
    doorGlow.intensity = 3.2 * open;
    backdrop.material.color.setScalar(0.75 * (0.35 + 0.65 * open));
    const dB = clamp01((t - tTerk + 0.05) / 0.3);
    bar.position.y = 2.2 + 1.6 * (1 - dB * dB); bar.visible = dB > 0;

    // E: ships glide in, plinth line, frieze
    ships.forEach((o, i) => {
      const u = eout(clamp01((t - (tEmp5 - 0.1) - i * Math.max(0.05, (tKap - tEmp5 + 0.3) / 14)) / 0.5));
      o.S.position.set(o.fx + 0.5 * (1 - u), PH + 0.005, o.fz); o.S.rotation.y = o.ry; o.S.scale.setScalar(Math.max(0.001, u)); o.S.visible = u > 0.001;
      o.S.position.y += 0.004 * Math.sin(t * 1.7 + i);
    });
    plLine.material.opacity = smooth(clamp01((t - tMer + 0.3) / 0.6));
    frzNum.material.opacity = smooth(clamp01((t - tSer5 + 0.2) / 0.7));
    frzNum.material.emissiveIntensity = 0.25 * pump(t, tSer5 + 0.2, 0.3, 2.0);
    frzSub.material.opacity = smooth(clamp01((t - tPeng + 0.1) / 0.6));

    // F: ledger writes
    const wr = (o, a, d) => { const u = clamp01((t - a) / d); o.m.scale.x = Math.max(0.001, o.ww * u); o.tx.repeat.x = Math.max(0.001, u); o.m.visible = u > 0.002; };
    wr(inkBorrow, tBer - 0.05, 0.8); wr(ink1838, t1838 - 0.1, 0.7); wr(inkStrike, tTurun, 0.35); wr(ink60, tEnam - 0.15, 0.6); wr(inkLunas, t1883 - 0.6, 0.5);
    const dS = clamp01((t - t1883 + 0.05) / 0.22);
    stamp.visible = dS > 0; stamp.scale.setScalar(1 + 0.6 * (1 - dS)); stamp.material.opacity = dS;

    // G: interest bar grows to 1947, coin stacks rise, source plate
    goldBar.scale.x = Math.max(0.001, (yr(1883) - yr(1825)) * smooth(clamp01((t - K.s7 - 0.4) / 1.2)));
    const uI = smooth(clamp01((t - tBunga + 0.1) / Math.max(1, t1947 - tBunga + 0.1)));
    intBar.scale.x = Math.max(0.001, (yr(1947) - yr(1883)) * uI);
    intM.emissiveIntensity = 0.4 + 1.2 * pump(t, t1947, 0.15, 1.6);
    const yNow = 1883 + 64 * uI;
    stacks.forEach((o) => { const v = clamp01((yNow - o.y + 2) / 6); o.coins.forEach((c, j) => { c.visible = j < Math.round(v * (3 + o.coins.length * (o.y - 1880) / 70)); }); o.S.visible = v > 0; });
    g47.material.opacity = 0.9 * pump(t, t1947, 0.15, 2.0);
    nyt.position.z = 0.06; nyt.scale.setScalar(Math.max(0.001, eout(clamp01((t - tAnal + 0.15) / 0.5))));

    // H: gold inlay on "tanpa"; also "dicabut" slight glow on mencabut
    steleG.material.opacity = smooth(clamp01((t - tCabut) / 0.8)) * 0.35 + smooth(clamp01((t - tTanpa + 0.1) / 0.6)) * 0.65;
    steleG.material.emissiveIntensity = 0.4 * pump(t, tTanpa, 0.25, 1.8);

    // I: coins drop into the left pan, the beam tips on "mahal" and settles
    const tilt = 0.24 * smooth(clamp01((t - tMahal + 0.6) / 1.6)) + 0.012 * Math.sin((t - tMahal) * 2.2) * Math.exp(-Math.max(0, t - tMahal - 1) * 0.6) * (t > tMahal ? 1 : 0);
    beam.rotation.z = -tilt;
    pans.forEach(({ P, s }) => { P.position.set(PIV.x + s * ARM * Math.cos(tilt), PIV.y - s * ARM * Math.sin(tilt), PIV.z); });
    panCoins.forEach((c, i) => {
      const j = i % 9; if (j < 6) return;
      const td = tDibayar - 0.9 + (i % 9 - 6) * 0.22 + Math.floor(i / 9) * 0.07, u = clamp01((t - td) / 0.38);
      c.position.set(c.userData.home.x, c.userData.home.y + 1.4 * (1 - u * u), c.userData.home.z); c.visible = u > 0;
    });
    balGlow.intensity = 2.0 * smooth(clamp01((t - K.s8 - 0.3) / 1.2));

    // dust in the light, around the target
    const d = dust.pos;
    for (let i = 0; i < 220; i++) { const q = dSeed[i]; d[i * 3] = tgt.x + q[0] * 4 + Math.sin(t * q[4] + q[3]) * 0.3; d[i * 3 + 1] = 0.4 + ((q[1] * 7 + t * q[4] * 0.12) % 7); d[i * 3 + 2] = 0.6 + q[2] * 6 + Math.cos(t * q[4] + q[3]) * 0.3; }
    dust.commit();
    comp.render();
  };
}
