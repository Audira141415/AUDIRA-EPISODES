// EP39 PERANG KUE: FOODFORGE. One long oiled-walnut patisserie table (y = 0 is the table top, 1 unit ~ 10 cm),
// a dark warm studio with bokeh behind, a warm low side key and a hot rim from behind. The macro camera glides along x.
// A (x 0)    hero croissant on a porcelain plate, macarons, eclair, berry tart, espresso with steam, tent card "Perang Kue",
//            pastry box tied with an AUDIRA ribbon, a small chocolate cannon in the back
// B (x 16)   dough map of Mexico (Natural Earth coast, no borders) on a tilted walnut board, blue glaze sea, pick tags
//            "MEKSIKO 1832", "Kota Meksiko", "Teluk Meksiko"; sugar-cube shops near the capital topple on "dijarah"
// C (x 32)   gingerbread shop "Patisserie Remontel, Tacubaya"; window cracks; 60 chocolate coins stack (60.000 peso)
//            beside one coin "< 1.000 peso"; a receipt on a spike
// D (x 46)   giant invoice on a tilted board: line items, 600.000 PESO, a brass stamp lands "PRANCIS 1838"
// E (x 62)   Gulf tray: chocolate warships glide in and blockade, piped icing line, layer-cake fortress San Juan de Ulua
//            takes cocoa puffs, French picks on the Veracruz petits fours, a Mexican flag pick on "menyatakan perang"
// F (x 78)   solemn: name card "Jenderal Santa Anna", one polished boot on a velvet cushion on a cake stand, candle,
//            a flag pick lowered to half-mast on "dimakamkan". No injury is shown.
// G (x 92)   silver tray: treaty "9 Maret 1839", cheque 600.000 peso stamped "TAK PERNAH DICAIRKAN", piped chocolate
//            arrow to a "1861" card
// H (x 108)  open pastry box AUDIRA with croissants, wide pull-back
// Everything is a function of t.

const FONTS = ['italic 700 80px "Fraunces"', 'italic 600 80px "Fraunces"', '700 80px "Fraunces"', '700 80px "IBM Plex Mono"', '600 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "Perang Kue 1838 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* fall back to system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const FR = '"Fraunces", Georgia, serif', MONO = '"IBM Plex Mono", monospace';
const CREAM = "#F6E9D0", CHOC = "#3A2216", CAR = "#B5652B", FBLUE = "#1F3D8A", MGRN = "#006847", MRED = "#CE1126";
const ENV = 0.45;

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

function txt(g, s, x, y, font, col, align = "center", ls = 0) {
  g.font = font; g.textAlign = align; g.textBaseline = "alphabetic"; g.fillStyle = col;
  if (ls) g.letterSpacing = ls + "px";
  g.fillText(s, x, y);
  if (ls) g.letterSpacing = "0px";
}
function paper(g, w, h, seed, base = "#F4E8D2") {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed);
  for (let i = 0; i < w * h / 9000; i++) { const x = q() * w, y = q() * h, rr = 30 + q() * 160; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(150,110,60,${0.03 + q() * 0.05})`); gr.addColorStop(1, "rgba(150,110,60,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  for (let i = 0; i < w * h / 260; i++) { g.strokeStyle = `rgba(110,80,45,${0.03 + q() * 0.05})`; g.lineWidth = 0.7; const x = q() * w, y = q() * h, a = q() * 6.28, l = 3 + q() * 12; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}
// baked crumb: warm base with pores and flecks (sponge, gingerbread, dough)
function crumb(g, w, h, seed, base, pore, lite, n = 1) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  const q = mulberry(seed);
  for (let i = 0; i < w * h / 2600 * n; i++) { const x = q() * w, y = q() * h, rr = 8 + q() * 40; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${q() < 0.5 ? pore : lite},${0.05 + q() * 0.08})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  for (let i = 0; i < w * h / 90 * n; i++) { const x = q() * w, y = q() * h, rr = 0.6 + q() * q() * 4.5; g.fillStyle = `rgba(${pore},${0.25 + q() * 0.45})`; g.beginPath(); g.ellipse(x, y, rr, rr * (0.6 + q() * 0.5), q() * 3, 0, 6.283); g.fill(); g.fillStyle = `rgba(${lite},${0.15 + q() * 0.25})`; g.beginPath(); g.ellipse(x - rr * 0.4, y - rr * 0.5, rr * 0.6, rr * 0.35, 0, 0, 6.283); g.fill(); }
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x140c08, exp: 0.9, bloom: [0.12, 0.5, 0.95], fov: 30 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.84;
  bp.threshold = 1.15; bp.strength = 0.04; bp.radius = 0.35;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#2A1A10"); gr.addColorStop(0.55, "#1B110B"); gr.addColorStop(1, "#0E0805"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  scene.fog = new THREE.FogExp2(0x160d08, 0.018);
  const pm = new THREE.PMREMGenerator(r);
  const envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex; scene.environmentIntensity = ENV; // r186: scene env ignores material.envMapIntensity

  // ---------- light: warm low side key that follows the target, hot rim from behind, low ambient ----------
  const hemi = new THREE.HemisphereLight(0xffe6c8, 0x24140a, 0.4); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd2a0, 2.6);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 60 });
  key.shadow.bias = -0.0008; key.shadow.normalBias = 0.04; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffc488, 2.2); scene.add(rim, rim.target);
  const fill = new THREE.DirectionalLight(0x9fb0c8, 0.22); fill.position.set(-30, 20, 40); scene.add(fill);

  // ---------- helpers ----------
  const labels = [];
  const label = (w, h, paint, rep) => { const tx = canvasTex(w, h, paint, rep); labels.push([tx, paint]); return tx; };
  const add = (m, p = scene, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const G = (x = 0, y = 0, z = 0, p = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
  const phys = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.5, metalness: 0, envMapIntensity: ENV, ...o, ...(o.envMapIntensity !== undefined && o.envMapIntensity !== ENV ? { envMap: envTex } : {}) }); // own intensity needs its own envMap
  const mesh = (geo, mat, x = 0, y = 0, z = 0, p = scene, cast = true) => { const m = add(new THREE.Mesh(geo, mat), p, cast); m.position.set(x, y, z); return m; };
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(0.5, "rgba(0,0,0,.4)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, z, o = 0.55, p = scene, y = 0.004) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; p.add(m); return m; };
  const softT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const bevelGeo = (w, h, d, rr = 0.03) => {
    const s = new THREE.Shape(), a = w / 2 - rr, b = h / 2 - rr;
    s.moveTo(-a, -b - rr); s.lineTo(a, -b - rr); s.quadraticCurveTo(a + rr, -b - rr, a + rr, -b); s.lineTo(a + rr, b); s.quadraticCurveTo(a + rr, b + rr, a, b + rr); s.lineTo(-a, b + rr); s.quadraticCurveTo(-a - rr, b + rr, -a - rr, b); s.lineTo(-a - rr, -b); s.quadraticCurveTo(-a - rr, -b - rr, -a, -b - rr);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * rr), bevelEnabled: true, bevelThickness: rr, bevelSize: rr * 0.6, bevelSegments: 3, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * rr) / 2); g.computeVertexNormals(); return g;
  };
  const block = (w, h, d, mat, x, y, z, p = scene, rr = 0.03) => mesh(bevelGeo(w, h, d, rr), mat, x, y, z, p);
  const face = (w, h, tex, x, y, z, p = scene, o = {}) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide })
      : phys({ map: tex, color: o.color ?? 0xffffff, roughness: o.rough ?? 0.7, clearcoat: o.cc ?? 0, metalness: o.metal ?? 0, envMapIntensity: ENV * (o.env ?? 1), bumpMap: o.bump ? tex : null, bumpScale: o.bumpScale ?? 0.4, transparent: !!o.transparent, opacity: o.opacity ?? 1, depthWrite: !o.transparent, side: o.side ?? THREE.FrontSide }));
    m.position.set(x, y, z); m.receiveShadow = true; if (o.transparent || o.basic) m.renderOrder = 3; p.add(m); return m;
  };
  const lathe = (pts2, seg = 64) => new THREE.LatheGeometry(pts2.map(([x, y]) => new THREE.Vector2(x, y)), seg);

  // ---------- materials ----------
  const walnutT = canvasTex(2048, 1024, (g, w, h) => {
    const q = mulberry(3), PL = 6;
    for (let p = 0; p < PL; p++) {
      const y0 = p * h / PL, base = [[74, 42, 24], [88, 52, 30], [66, 38, 22], [82, 47, 27], [70, 40, 23], [92, 55, 32]][p];
      g.fillStyle = `rgb(${base})`; g.fillRect(0, y0, w, h / PL);
      for (let i = 0; i < 260; i++) {
        const yy = y0 + q() * h / PL, amp = 2 + q() * 8, fq = 0.002 + q() * 0.006, ph = q() * 6.28, dark = q() < 0.6;
        g.strokeStyle = dark ? `rgba(30,14,6,${0.08 + q() * 0.16})` : `rgba(150,95,55,${0.05 + q() * 0.1})`; g.lineWidth = 0.8 + q() * 2.2; g.beginPath();
        for (let x = 0; x <= w; x += 16) { const y = yy + Math.sin(x * fq + ph) * amp + Math.sin(x * fq * 3.1 + ph * 2) * amp * 0.3; x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      for (let k = 0; k < 3; k++) { const x = q() * w, y = y0 + q() * h / PL, rr = 10 + q() * 20; const gr = g.createRadialGradient(x, y, 0, x, y, rr * 3); gr.addColorStop(0, "rgba(25,10,4,.5)"); gr.addColorStop(1, "rgba(25,10,4,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr * 3, rr, 0, 0, 6.283); g.fill(); }
      g.fillStyle = "rgba(10,4,2,.85)"; g.fillRect(0, y0, w, 3);
    }
  }, [1, 1]);
  const ccoin = (c) => c;
  const walnutM = phys({ map: walnutT, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3, bumpMap: walnutT, bumpScale: 0.6, envMapIntensity: ENV * 0.8 });
  const porcelain = phys({ color: 0xf6f1e8, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const porcelainDS = phys({ color: 0xf6f1e8, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const goldRim = phys({ color: 0xd1a659, metalness: 1, roughness: 0.25, envMapIntensity: ENV * 2.6 });
  const silver = phys({ color: 0x9c8f7c, metalness: 1, roughness: 0.38, envMapIntensity: ENV * 1.2 });
  const darkSilver = phys({ color: 0x4a4038, metalness: 1, roughness: 0.32, envMapIntensity: ENV * 1.4 });
  const brass = phys({ color: 0xb8904a, metalness: 0.95, roughness: 0.3, envMapIntensity: ENV * 2.4 });
  const chocT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); const q = mulberry(17); for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "0,0,0" : "255,255,255"},${0.03 + q() * 0.05})`; const s = 2 + q() * 10; g.beginPath(); g.arc(q() * w, q() * h, s, 0, 6.283); g.fill(); } }, [2, 2]);
  const choc = phys({ color: 0x3b2014, roughness: 0.3, clearcoat: 0.75, clearcoatRoughness: 0.18, bumpMap: chocT, bumpScale: 0.08, sheen: 0.3, sheenColor: new THREE.Color(0x8a5a3a) });
  const milkChoc = phys({ color: 0x6b3c22, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2, bumpMap: chocT, bumpScale: 0.08 });
  const whiteChoc = phys({ color: 0xf1e2c4, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2, bumpMap: chocT, bumpScale: 0.06 });
  const spongeT = canvasTex(1024, 512, (g, w, h) => crumb(g, w, h, 21, "#E2B66E", "120,72,24", "255,232,170", 1.2), [1, 1]);
  const sponge = phys({ map: spongeT, roughness: 0.9, bumpMap: spongeT, bumpScale: 1.2, sheen: 0.2, sheenColor: new THREE.Color(0xffe0a0) });
  const creamM = phys({ color: 0xfaf0dc, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color(0xffffff) });
  const jam = phys({ color: 0x8e1020, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
  const fondant = phys({ color: 0xf7f0e4, roughness: 0.62, sheen: 0.5, sheenColor: new THREE.Color(0xffffff) });
  const gingerT = canvasTex(1024, 1024, (g, w, h) => crumb(g, w, h, 33, "#9A5426", "60,26,8", "210,140,80", 1.0), [1, 1]);
  const ginger = phys({ map: gingerT, roughness: 0.75, bumpMap: gingerT, bumpScale: 0.9, clearcoat: 0.15 });
  const icing = phys({ color: 0xfbf6ee, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  const pretzel = phys({ color: 0xa7612b, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.25 });
  const flakeT = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = "#e9e9e9"; g.fillRect(0, 0, w, h); const q = mulberry(9);
    for (let i = 0; i < 2600; i++) { const y = q() * h, x = q() * w, l = 10 + q() * 70; g.strokeStyle = `rgba(${q() < 0.6 ? "90,60,30" : "255,250,240"},${0.08 + q() * 0.22})`; g.lineWidth = 0.6 + q() * 1.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + (q() - 0.5) * 6, x + l, y + (q() - 0.5) * 4); g.stroke(); }
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "70,40,15" : "255,245,225"},${0.15 + q() * 0.35})`; g.beginPath(); g.ellipse(q() * w, q() * h, 1 + q() * 3, 0.6 + q() * 1.2, q() * 3, 0, 6.283); g.fill(); }
  }, [1, 1]);
  const pastryM = phys({ vertexColors: true, map: flakeT, roughness: 0.48, clearcoat: 0.9, clearcoatRoughness: 0.2, envMapIntensity: 0.85, bumpMap: flakeT, bumpScale: 1.4, sheen: 0.35, sheenColor: new THREE.Color(0xffc070) });
  const velvet = phys({ color: 0x5c1220, roughness: 0.95, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xd04060) });
  const leather = phys({ color: 0x24140c, roughness: 0.32, clearcoat: 0.85, clearcoatRoughness: 0.18, bumpMap: chocT, bumpScale: 0.05 });
  const woodPick = phys({ color: 0xd9b98a, roughness: 0.7 });

  // ---------- studio: walnut table, bokeh behind ----------
  const X0 = -24, X1 = 136;
  walnutT.repeat.set((X1 - X0) / 7, 30 / 3.5);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 30), walnutM); table.rotation.x = -Math.PI / 2; table.position.set((X0 + X1) / 2, 0, -3); table.receiveShadow = true; scene.add(table);
  const edge = mesh(new THREE.BoxGeometry(X1 - X0, 0.5, 0.3), walnutM, (X0 + X1) / 2, -0.25, 12.1, scene, false);
  const bokT = canvasTex(128, 128, (g, w) => { const c = w / 2; const gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.78, "rgba(255,255,255,.7)"); gr.addColorStop(0.9, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  { const q = mulberry(77); for (let i = 0; i < 150; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bokT, color: new THREE.Color().setHSL(0.07 + q() * 0.05, 0.75, 0.5 + q() * 0.2), transparent: true, opacity: 0.05 + q() * 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); const sz = 0.8 + q() * 2.6; s.scale.set(sz, sz, 1); s.position.set(X0 + q() * (X1 - X0), 1.5 + q() * 10, -22 - q() * 14); scene.add(s); } }

  // ---------- generic food builders ----------
  // croissant: laminated crescent with spiral grooves, browned crests, pale grooves, flaky texture, egg-wash clearcoat
  function croissantGeo(len = 1.7, R = 0.34, N = 7) {
    const NU = 170, NV = 40, bend = 2.4, Rs = len / bend;
    const pos = [], col = [], uv = [], idx = [];
    const pale = [0.92, 0.7, 0.4], gold = [0.8, 0.43, 0.12], brown = [0.38, 0.15, 0.04];
    for (let i = 0; i <= NU; i++) {
      const u = i / NU, th = (u - 0.5) * bend;
      const cx = Rs * Math.sin(th), cz = Rs * (1 - Math.cos(th));
      const nx = -Math.sin(th), nz = Math.cos(th);
      const prof = Math.pow(Math.sin(Math.PI * u), 0.7);
      const close = Math.sqrt(Math.min(1, u / 0.025, (1 - u) / 0.025));
      const rr = R * (0.17 + 0.83 * prof) * close;
      for (let j = 0; j <= NV; j++) {
        const v = j / NV * Math.PI * 2;
        const gph = Math.abs(Math.sin(Math.PI * (u * N + 0.32 * Math.cos(v))));
        const ridge = 0.83 + 0.17 * Math.pow(gph, 0.5);
        const rad = rr * ridge;
        const dx = Math.cos(v) * rad;
        let dy = Math.sin(v) * rad * 0.8; if (dy < 0) dy *= 0.38;
        const cy = rr * 0.33;
        pos.push(cx + nx * dx, cy + dy, cz + nz * dx);
        const crest = smooth((ridge - 0.83) / 0.17), top = Math.max(0, Math.sin(v)), tip = 1 - smooth(prof / 0.55);
        const mixc = (a, b, k) => a.map((x, n) => x + (b[n] - x) * k);
        let c = mixc(pale, gold, 0.25 + 0.75 * crest);
        c = mixc(c, brown, Math.min(1, top * crest * 0.55 + tip * 0.55));
        if (Math.sin(v) < -0.2) c = mixc(c, pale, 0.35);
        col.push(...c);
        uv.push(u * 3, j / NV);
      }
    }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); g.translate(0, 0, -Rs * (1 - Math.cos(bend / 2)) * 0.5); return g;
  }
  const croGeo = croissantGeo();
  const croissant = (x, y, z, ry = 0, s = 1, p = scene) => { const m = mesh(croGeo, pastryM, x, y, z, p); m.castShadow = false; m.rotation.y = ry; m.scale.setScalar(s); const b = blob(1.9 * s, 1.2 * s, x, z, 0.5, p, y + 0.004); b.rotation.z = -ry; return m; };
  // macaron: two domed shells, ruffled feet, ganache filling
  const shellGeo = (() => { const g = new THREE.SphereGeometry(0.24, 40, 16, 0, 6.283, 0, Math.PI / 2); g.scale(1, 0.42, 1); return g; })();
  const footGeo = (() => { const g = new THREE.CylinderGeometry(0.235, 0.22, 0.035, 48, 2, true); const p = g.attributes.position, q = mulberry(5); for (let i = 0; i < p.count; i++) { const k = 1 + (q() - 0.5) * 0.06; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } g.computeVertexNormals(); return g; })();
  const fillGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.07, 40);
  function macaron(hex, fillHex, x, y, z, p = scene, s = 1) {
    const M = G(x, y, z, p); M.scale.setScalar(s);
    const sm = phys({ color: hex, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color(0xffffff), bumpMap: chocT, bumpScale: 0.04 });
    const fm = phys({ color: hex, roughness: 0.8 });
    mesh(fillGeo, phys({ color: fillHex, roughness: 0.35, clearcoat: 0.4 }), 0, 0.09, 0, M);
    const top = mesh(shellGeo, sm, 0, 0.145, 0, M); mesh(footGeo, fm, 0, 0.128, 0, M);
    const bot = mesh(shellGeo, sm, 0, 0.035, 0, M); bot.scale.y = -1; mesh(footGeo, fm, 0, 0.052, 0, M);
    return M;
  }
  // raspberry: drupelet cluster; blueberry: dusty glossy sphere
  const drupe = new THREE.SphereGeometry(0.028, 10, 8);
  function raspberry(x, y, z, p = scene) {
    const R0 = G(x, y, z, p), m = phys({ color: 0xb0142c, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.1, sheen: 0.4, sheenColor: new THREE.Color(0xff8090) });
    for (let i = 0; i < 46; i++) { const a = i * 2.4, yy = 1 - (i / 45) * 1.6; const rr = Math.sqrt(Math.max(0, 1 - yy * yy)); mesh(drupe, m, Math.cos(a) * rr * 0.075, 0.075 + yy * 0.085, Math.sin(a) * rr * 0.075, R0, false); }
    return R0;
  }
  const blueGeo = new THREE.SphereGeometry(0.06, 20, 14);
  const blueM = phys({ color: 0x27324f, roughness: 0.45, sheen: 1, sheenColor: new THREE.Color(0x8a9ac0), sheenRoughness: 0.6 });
  const sugarCubeGeo = bevelGeo(0.14, 0.14, 0.14, 0.015);
  const sugarT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#f5f2ec"; g.fillRect(0, 0, w, h); const q = mulberry(2); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "180,170,160" : "255,255,255"},${0.2 + q() * 0.5})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 2); } });
  const sugarM = phys({ map: sugarT, roughness: 0.75, bumpMap: sugarT, bumpScale: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) });
  // coin: gold-foil chocolate coin
  const coinT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c0c0c0"; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 110, 0, 6.283); g.stroke(); g.strokeStyle = "#505050"; g.lineWidth = 4; g.beginPath(); g.arc(128, 128, 96, 0, 6.283); g.stroke(); txt(g, "$", 128, 168, `700 120px ${FR}`, "#c8c8c8"); const q = mulberry(4); for (let i = 0; i < 500; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "0,0,0" : "255,255,255"},.12)`; g.lineWidth = 1; const x = q() * w, y = q() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 30, y + (q() - 0.5) * 30); g.stroke(); } });
  const coinGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.042, 40);
  const coinM = phys({ color: 0xd9a948, metalness: 1, roughness: 0.3, envMapIntensity: ENV * 2.6, bumpMap: coinT, bumpScale: 1.0 });
  // cocktail pick with a paper tag; the pick stands upright in the world, the tag tilts back toward the camera
  function pick(paint, { w = 1.2, h = 0.42, L = 0.9, tilt = 0.12, flagSide = 1, res = 600 } = {}, p = scene) {
    const P = new THREE.Group(); p.add(P);
    mesh(new THREE.CylinderGeometry(0.012, 0.006, L, 8), woodPick, 0, L / 2 - 0.08, 0, P);
    mesh(new THREE.SphereGeometry(0.03, 12, 10), phys({ color: 0xc81e2e, roughness: 0.3, clearcoat: 0.6 }), 0, L - 0.06, 0, P);
    const T = G(flagSide * (w / 2 + 0.015), L - 0.1 - h / 2, 0.008, P); T.rotation.x = -tilt;
    const tx = label(res, Math.round(res * h / w), paint);
    const card = mesh(new THREE.BoxGeometry(w, h, 0.008), phys({ color: 0xf3e6cc, roughness: 0.85 }), 0, 0, 0, T);
    face(w - 0.01, h - 0.01, tx, 0, 0, 0.0045, T, { rough: 0.8 });
    const bk = face(w - 0.01, h - 0.01, tx, 0, 0, -0.0045, T, { rough: 0.8 }); bk.rotation.y = Math.PI;
    return { P, T, card };
  }
  const tagPaint = (l1, l2, o = {}) => (g, w, h) => {
    paper(g, w, h, 5 + l1.length, o.base || "#F4E6CB");
    g.fillStyle = o.band || CAR; g.fillRect(0, 0, 14, h);
    g.strokeStyle = "rgba(58,34,22,.35)"; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
    const big = o.big || Math.round(h * (l2 ? 0.36 : 0.5));
    txt(g, l1, w / 2 + 7, l2 ? h * 0.5 : h * 0.66, `${o.italic === false ? "" : "italic "}700 ${big}px ${FR}`, o.ink || CHOC, "center");
    if (l2) txt(g, l2, w / 2 + 7, h * 0.84, `600 ${Math.round(h * 0.2)}px ${MONO}`, o.sub || "#7A4A26", "center", 3);
  };
  const flagPaint = (kind) => (g, w, h) => {
    if (kind === "fr") { [FBLUE, "#F4EFE6", "#C8202F"].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); }); }
    else {
      [MGRN, "#F4EFE6", MRED].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3 + 1, h); });
      g.fillStyle = "#7a5530"; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.07, h * 0.14, 0, 0, 6.283); g.fill();
      g.strokeStyle = "#3f6e2e"; g.lineWidth = h * 0.03; g.beginPath(); g.arc(w / 2, h / 2 + h * 0.02, w * 0.1, 0.3, 2.85); g.stroke();
    }
    const q = mulberry(kind.length); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.06})`; g.fillRect(q() * w, q() * h, 2, 2); }
  };
  function flagPick(kind, L = 0.8, w = 0.42, p = scene) {
    const P = new THREE.Group(); p.add(P);
    mesh(new THREE.CylinderGeometry(0.011, 0.007, L, 8), woodPick, 0, L / 2 - 0.05, 0, P);
    const geo = new THREE.PlaneGeometry(w, w * 0.62, 16, 4); const pp = geo.attributes.position; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i) + w / 2; pp.setZ(i, Math.sin(x / w * 3.2) * 0.03 * (x / w)); } geo.computeVertexNormals();
    const F = new THREE.Group(); F.position.set(0, L - 0.05 - w * 0.31, 0); P.add(F);
    const fm = add(new THREE.Mesh(geo, phys({ map: label(300, 186, flagPaint(kind)), roughness: 0.75, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color(0xffffff) })), F); fm.position.x = w / 2;
    return { P, F };
  }
  // tent card on the table
  function tent(paint, w, h, x, z, ry = 0, p = scene) {
    const T = G(x, 0, z, p); T.rotation.y = ry;
    const a = 0.32, tx = label(1000, Math.round(1000 * h / w), paint);
    const mat = phys({ color: 0xf6ead2, roughness: 0.8 });
    for (const s of [1, -1]) {
      const S = G(0, h * Math.cos(a), 0, T); S.rotation.x = -s * a;
      mesh(new THREE.BoxGeometry(w, h, 0.012), mat, 0, -h / 2, s * 0.007, S);
      if (s === 1) face(w - 0.02, h - 0.02, tx, 0, -h / 2, 0.0145, S, { rough: 0.75 });
    }
    blob(w * 1.2, h * 0.9, 0, 0, 0.45, T);
    return T;
  }
  // ribbon with printed AUDIRA
  const ribbonT = label(1024, 64, (g, w, h) => { g.fillStyle = "#1F2F6A"; g.fillRect(0, 0, w, h); g.fillStyle = "#C9A35A"; g.fillRect(0, 4, w, 3); g.fillRect(0, h - 7, w, 3); for (let x = 30; x < w; x += 250) txt(g, "AUDIRA", x + 90, h * 0.7, `700 34px ${MONO}`, "#F4E6CB", "center", 8); });
  ribbonT.wrapS = THREE.RepeatWrapping;
  const satin = phys({ map: ribbonT, roughness: 0.3, sheen: 1, sheenColor: new THREE.Color(0x8aa0ff), sheenRoughness: 0.3, clearcoat: 0.3 });
  function pastryBox(x, z, ry, p = scene, open = false) {
    const B = G(x, 0, z, p); B.rotation.y = ry;
    const W = 1.7, H = 0.85, D = 1.25;
    const boxT = label(1200, 900, (g, w, h) => {
      g.fillStyle = "#F1D9D0"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(160,70,70,.18)"; g.lineWidth = 18; for (let xx = -h; xx < w; xx += 70) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx + h, h); g.stroke(); }
      g.strokeStyle = "#8C3B3B"; g.lineWidth = 6; g.strokeRect(30, 30, w - 60, h - 60);
      txt(g, "AUDIRA", w / 2, h * 0.5, `italic 700 200px ${FR}`, "#5B1F24", "center", 6);
      txt(g, "PÂTISSERIE SEJARAH · audira.my.id", w / 2, h * 0.7, `600 44px ${MONO}`, "#8C3B3B", "center", 4);
    });
    const plainM = phys({ color: 0xd9bdb2, roughness: 0.75 });
    if (!open) {
      block(W, H, D, plainM, 0, H / 2, 0, B, 0.02);
      face(W - 0.04, D - 0.04, boxT, 0, H + 0.002, 0, B, { color: 0xd8ccc4 }).rotation.x = -Math.PI / 2;
      face(W - 0.06, H * 0.8, boxT, 0, H / 2, D / 2 + 0.002, B, { color: 0xd8ccc4 });
      mesh(new THREE.BoxGeometry(0.16, 0.012, D + 0.02), satin, 0, H + 0.008, 0, B).material = satin;
      const r1 = mesh(new THREE.BoxGeometry(W + 0.02, 0.012, 0.16), satin, 0, H + 0.01, 0, B);
      for (const s of [1, -1]) { const loop = mesh(new THREE.TorusGeometry(0.17, 0.045, 12, 32), satin, s * 0.16, H + 0.09, 0, B); loop.scale.set(1, 0.55, 0.45); loop.rotation.z = s * 0.35; }
      mesh(new THREE.SphereGeometry(0.07, 16, 12), satin, 0, H + 0.05, 0, B);
      for (const s of [1, -1]) { const tl = mesh(new THREE.BoxGeometry(0.12, 0.01, 0.42), satin, s * 0.12, H + 0.012, 0.28, B); tl.rotation.y = s * 0.4; }
      blob(W * 1.4, D * 1.4, 0, 0, 0.6, B);
    } else {
      // open tray: walls only, lid hinged up at the back with the print inside
      for (const [w, d, xx, zz] of [[W, 0.02, 0, D / 2], [W, 0.02, 0, -D / 2], [0.02, D, W / 2, 0], [0.02, D, -W / 2, 0]]) mesh(new THREE.BoxGeometry(w, H * 0.55, d), plainM, xx, H * 0.275, zz, B);
      face(W - 0.04, H * 0.45, boxT, 0, H * 0.275, D / 2 + 0.011, B, { color: 0xd8ccc4 });
      mesh(new THREE.BoxGeometry(W, 0.02, D), phys({ color: 0xf3ead8, roughness: 0.9 }), 0, 0.02, 0, B);
      const L = G(0, H * 0.55, -D / 2, B); L.rotation.x = -1.95;
      mesh(new THREE.BoxGeometry(W, 0.02, D), plainM, 0, 0, D / 2, L);
      const lf = face(W - 0.06, D - 0.06, boxT, 0, -0.012, D / 2, L, { color: 0xd0c2ba }); lf.rotation.x = Math.PI / 2;
      const rb = mesh(new THREE.BoxGeometry(0.16, 0.012, D + 0.4), satin, 0.5, 0.02, 0.3, B); rb.rotation.y = 0.5;
      blob(W * 1.5, D * 1.6, 0, 0, 0.6, B);
    }
    return B;
  }
  const plate = (x, z, rad = 1, p = scene) => {
    const P = G(x, 0, z, p);
    mesh(lathe([[0, 0.012], [rad * 0.62, 0.012], [rad * 0.66, 0.03], [rad * 0.92, 0.07], [rad, 0.085], [rad * 1.005, 0.075], [rad * 0.94, 0.05], [rad * 0.6, 0.004], [0, 0.004]]), porcelainDS, 0, 0, 0, P, false);
    mesh(new THREE.TorusGeometry(rad * 0.99, 0.006, 6, 96), goldRim, 0, 0.084, 0, P, false).rotation.x = Math.PI / 2;
    return P; // no blob: it z-fights with the thin plate
  };
  const espresso = (x, z, p = scene) => {
    const E = G(x, 0, z, p);
    mesh(lathe([[0, 0], [0.5, 0], [0.55, 0.03], [0.56, 0.04], [0.5, 0.03], [0, 0.02]]), porcelain, 0, 0, 0, E);
    mesh(lathe([[0, 0.03], [0.17, 0.03], [0.24, 0.12], [0.27, 0.38], [0.255, 0.38], [0.225, 0.13], [0, 0.07]], 48), porcelain, 0, 0, 0, E);
    const cof = mesh(new THREE.CircleGeometry(0.245, 40), phys({ color: 0x2a140a, roughness: 0.15, clearcoat: 1 }), 0, 0.33, 0, E); cof.rotation.x = -Math.PI / 2;
    const cr = mesh(new THREE.RingGeometry(0.17, 0.245, 40), phys({ color: 0xb07a45, roughness: 0.6 }), 0, 0.332, 0, E); cr.rotation.x = -Math.PI / 2;
    const h = mesh(new THREE.TorusGeometry(0.08, 0.022, 10, 24, Math.PI * 1.2), porcelain, 0.28, 0.22, 0, E); h.rotation.z = -Math.PI * 0.6;
    blob(1.3, 1.3, 0, 0, 0.5, E);
    return E;
  };

  // ---------- particles: steam, sugar sparkle, falling icing sugar, cocoa puffs ----------
  const steamT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.5, "rgba(255,255,255,.2)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const steams = [];
  function steamSrc(x, y, z, n = 14, sc = 1) { for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, color: 0xfff1de, transparent: true, opacity: 0, depthWrite: false })); s.renderOrder = 5; scene.add(s); steams.push({ s, x, y, z, ph: i / n, sc, sd: i * 1.7 }); } }
  const sparkle = pts(scene, 260, { color: 0xffffff, size: 0.035, add: true, opacity: 0.9 });
  const spSeed = (() => { const q = mulberry(61); return Array.from({ length: 260 }, () => [q() * 2 - 1, q(), q() * 2 - 1, q() * 6.283, 0.6 + q() * 2.4]); })();
  const sugarFall = pts(scene, 420, { color: 0xffffff, size: 0.022, add: false, opacity: 0.85 });
  const sfSeed = (() => { const q = mulberry(62); return Array.from({ length: 420 }, () => [q() * 2 - 1, q() * 2 - 1, q(), q() * 6.283]); })();
  const cloudT = canvasTex(128, 128, (g, w) => { const q = mulberry(4); for (let i = 0; i < 9; i++) { const x = w * (0.3 + q() * 0.4), y = w * (0.3 + q() * 0.4), rr = w * (0.14 + q() * 0.14); const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.7, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); } });
  const puffs = [];
  function puffAt(x, y, z, t0, sz = 0.9, col = 0x9a7a62) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, color: col, transparent: true, opacity: 0, depthWrite: false, depthTest: false, rotation: t0 * 7 })); s.renderOrder = 6; scene.add(s); puffs.push({ s, x, y, z, t0, sz }); }
  const flashes = [];
  function flashAt(x, y, z, t0) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: 0xffb060, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.renderOrder = 7; scene.add(s); s.position.set(x, y, z); flashes.push({ s, t0 }); }

  // ================= A: hero croissant =================
  const XA = 0;
  plate(XA, 0.6, 1.25);
  const heroCro = croissant(XA, 0.03, 0.65, 0.5, 1.0);
  croissant(XA - 0.35, 0.03, 0.15, 2.4, 0.62).position.y = 0.04;
  macaron(0xa9c98a, 0xf0e6c8, XA + 1.55, 0, 1.05);
  macaron(0xe58c9c, 0xb0142c, XA + 1.95, 0, 0.55);
  { const m = macaron(0xf1dfb8, 0x6b3c22, XA + 1.25, 0.275, 0.45); m.rotation.z = 0.25; m.position.set(XA + 1.62, 0.3, 0.6); }
  macaron(0x9a6a8c, 0xf0e6c8, XA - 1.8, 0, 1.3, scene, 0.9);
  // eclair with chocolate glaze
  { const E = G(XA - 1.55, 0, 0.1); E.rotation.y = 0.5;
    const bodyM = phys({ vertexColors: false, color: 0xc98b45, map: flakeT, roughness: 0.6, clearcoat: 0.3, bumpMap: flakeT, bumpScale: 1 });
    const b = mesh(new THREE.CapsuleGeometry(0.13, 0.75, 8, 24), bodyM, 0, 0.12, 0, E); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.9);
    const gl = mesh(new THREE.CapsuleGeometry(0.135, 0.72, 8, 24), choc, 0, 0.16, 0, E); gl.rotation.z = Math.PI / 2; gl.scale.set(0.55, 1, 0.92);
    for (let i = 0; i < 9; i++) mesh(new THREE.BoxGeometry(0.012, 0.004, 0.17), whiteChoc, -0.3 + i * 0.075, 0.236, 0, E, false).rotation.y = 0.5;
    blob(1.3, 0.6, 0, 0, 0.5, E); }
  // berry tart on a stand behind
  { const T = G(XA + 2.3, 0, -1.9);
    mesh(lathe([[0, 0], [0.9, 0], [0.9, 0.03], [0.12, 0.05], [0.1, 0.5], [0.14, 0.55], [0, 0.55]]), porcelain, 0, 0, 0, T);
    const S = G(0, 0.55, 0, T);
    const crust = new THREE.CylinderGeometry(0.62, 0.58, 0.16, 72, 1); { const p = crust.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), rr = Math.hypot(x, z); if (rr > 0.3) { const k = 1 + 0.03 * Math.abs(Math.sin(a * 18)); p.setX(i, x * k); p.setZ(i, z * k); } } crust.computeVertexNormals(); }
    mesh(crust, phys({ map: spongeT, color: 0xd8984f, roughness: 0.7, bumpMap: spongeT, bumpScale: 1.5 }), 0, 0.08, 0, S);
    mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.03, 64), creamM, 0, 0.165, 0, S);
    const q = mulberry(8);
    for (let i = 0; i < 16; i++) { const a = q() * 6.283, rr = Math.sqrt(q()) * 0.45; raspberry(Math.cos(a) * rr, 0.17, Math.sin(a) * rr, S).rotation.set(q(), q(), q()); }
    for (let i = 0; i < 14; i++) { const a = q() * 6.283, rr = Math.sqrt(q()) * 0.47; mesh(blueGeo, blueM, Math.cos(a) * rr, 0.22, Math.sin(a) * rr, S); }
    blob(2, 2, 0, 0, 0.5, T); }
  { const q = mulberry(66); const fg = new THREE.DodecahedronGeometry(0.03, 0); const fm = phys({ color: 0xc98a3e, roughness: 0.5, clearcoat: 0.6 });
    for (let i = 0; i < 40; i++) { const a = q() * 6.283, rr = 0.5 + q() * 0.6; const f = mesh(fg, fm, XA + Math.cos(a) * rr, 0.02, 0.65 + Math.sin(a) * rr * 0.8, scene, false); f.scale.set(1 + q() * 1.5, 0.25, 0.6 + q()); f.rotation.y = q() * 3; } }
  // foreground props to fill the lower frame
  macaron(0xe58c9c, 0xb0142c, XA - 0.55, 0, 2.15, scene, 1.15); macaron(0xa9c98a, 0xf0e6c8, XA + 0.2, 0, 2.45, scene, 1.15);
  raspberry(XA + 0.75, 0, 2.05); raspberry(XA + 0.95, 0, 2.3); mesh(blueGeo, blueM, XA + 0.55, 0.06, 2.45); mesh(blueGeo, blueM, XA - 1.0, 0.06, 2.4);
  { const c = mesh(sugarCubeGeo, sugarM, XA - 1.25, 0.07, 1.95); c.rotation.y = 0.5; }
  const heroRim = new THREE.SpotLight(0xffb870, 0, 0, 0.22, 0.7, 1.2); heroRim.position.set(XA + 0.5, 2.2, -2.4); heroRim.target.position.set(XA, 0.2, 0.65); scene.add(heroRim, heroRim.target);
  espresso(XA - 1.5, -1.25);
  steamSrc(XA - 1.5, 0.42, -1.25, 16, 1);
  pastryBox(XA - 2.7, -2.2, 0.35);
  // war cue behind the plate: a chocolate warship on a pool of blue glaze, sails set, aimed at the croissant
  { const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 64), phys({ color: 0x1d3a7e, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.9 })); pool.rotation.x = -Math.PI / 2; pool.scale.set(1.15, 0.6, 1); pool.position.set(XA - 0.5, 0.006, -1.75); pool.receiveShadow = true; scene.add(pool);
    const rimP = mesh(new THREE.TorusGeometry(1, 0.03, 8, 64), whiteChoc, XA - 0.5, 0.012, -1.75, scene, false); rimP.rotation.x = Math.PI / 2; rimP.scale.set(1.15, 0.6, 1);
    const S = ship(); S.position.set(XA - 0.5, 0.01, -1.75); S.rotation.y = -0.42; S.scale.setScalar(1.2); scene.add(S); }
  // chocolate cannon, small, in the back
  { const C = G(XA + 1.35, 0, -0.35); C.rotation.y = 0.63; C.scale.setScalar(1.15);
    const bar = mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.0, 32), choc, 0, 0.36, 0, C); bar.rotation.z = Math.PI / 2 - 0.25;
    mesh(new THREE.TorusGeometry(0.1, 0.025, 10, 24), choc, -0.47, 0.49, 0, C).rotation.y = Math.PI / 2;
    for (const s of [1, -1]) { const wh = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 28), phys({ map: spongeT, color: 0xc07a3a, roughness: 0.6, bumpMap: spongeT, bumpScale: 1 }), 0, 0.22, s * 0.16, C); wh.rotation.x = Math.PI / 2; }
    for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.08, 20, 14), choc, 0.45 + i * 0.17, 0.08, 0.3 - (i % 2) * 0.1, C);
    blob(1.6, 1.0, 0, 0, 0.55, C); }

  // ---------- dough maps ----------
  const BOXB = [-118, 13.5, -85, 33.5], BOXE = [-98.6, 17.3, -87.6, 24.3];
  function mapTextures(box, seed, W = 2048) {
    const [L0, A0, L1, A1] = box, H = Math.round(W * ((A1 - A0) / ((L1 - L0) * Math.cos((A0 + A1) / 2 * Math.PI / 180))));
    const mx = (lo) => (lo - L0) / (L1 - L0) * W, my = (la) => (A1 - la) / (A1 - A0) * H;
    const ring = (g, rings, s = 1) => { g.beginPath(); for (const rg of rings) { rg.forEach(([lo, la], i) => (i ? g.lineTo(mx(lo) * s, my(la) * s) : g.moveTo(mx(lo) * s, my(la) * s))); g.closePath(); } };
    const land = (g, s = 1) => { for (const c of GEO) { ring(g, c.rings, s); g.fill(); } };
    // height: land mask, blurred, with lumps
    const hw = 768, hh = Math.round(hw * H / W), hc = document.createElement("canvas"); hc.width = hw; hc.height = hh;
    const hg = hc.getContext("2d"); hg.fillStyle = "#000"; hg.fillRect(0, 0, hw, hh); hg.filter = "blur(5px)"; hg.fillStyle = "#fff"; land(hg, hw / W); hg.filter = "none";
    const hd = hg.getImageData(0, 0, hw, hh).data;
    const nc = document.createElement("canvas"); nc.width = 40; nc.height = 28; const ng = nc.getContext("2d"); const q = mulberry(seed);
    for (let i = 0; i < 40 * 28; i++) { const v = Math.floor(q() * 255); ng.fillStyle = `rgb(${v},${v},${v})`; ng.fillRect(i % 40, Math.floor(i / 40), 1, 1); }
    const nb = document.createElement("canvas"); nb.width = hw; nb.height = hh; const nbg = nb.getContext("2d"); nbg.imageSmoothingEnabled = true; nbg.drawImage(nc, 0, 0, hw, hh);
    const nd = nbg.getImageData(0, 0, hw, hh).data;
    const height = (u, v) => { const x = Math.min(hw - 1, Math.max(0, Math.round(u * (hw - 1)))), y = Math.min(hh - 1, Math.max(0, Math.round((1 - v) * (hh - 1)))); const i = (y * hw + x) * 4; const m = hd[i] / 255; return { m, n: nd[i] / 255 }; };
    // colour: blue glaze sea with highlights, dough land with flour, baked coastline
    const colT = canvasTex(W, H, (g, w, h) => {
      const sg = g.createLinearGradient(0, 0, w, h); sg.addColorStop(0, "#22448E"); sg.addColorStop(0.5, "#1A3577"); sg.addColorStop(1, "#13285E"); g.fillStyle = sg; g.fillRect(0, 0, w, h);
      const qq = mulberry(seed + 1);
      for (let i = 0; i < 60; i++) { const x = qq() * w, y = qq() * h, rr = 60 + qq() * 260; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(120,160,230,${0.04 + qq() * 0.06})`); gr.addColorStop(1, "rgba(120,160,230,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
      g.filter = "blur(14px)"; g.fillStyle = "rgba(120,170,230,.45)"; land(g); g.filter = "none";
      g.lineWidth = 16; g.strokeStyle = "rgba(150,84,32,.75)"; g.filter = "blur(3px)"; for (const c of GEO) { ring(g, c.rings); g.stroke(); } g.filter = "none";
      g.lineWidth = 5; g.strokeStyle = "rgba(100,52,18,.9)"; for (const c of GEO) { ring(g, c.rings); g.stroke(); }
      g.fillStyle = "#E7C994"; land(g);
      { const eg = g.createLinearGradient(0, 0, 0, h); eg.addColorStop(0, "rgba(0,0,0,0)"); eg.addColorStop(1, "rgba(0,0,0,0)"); }
      g.save(); for (const c of GEO) ring(g, c.rings); g.clip();
      crumb(g, w, h, seed + 2, "rgba(0,0,0,0)", "150,100,50", "255,246,225", 0.8);
      for (let i = 0; i < w * h / 60; i++) { g.fillStyle = `rgba(255,255,255,${0.12 + qq() * 0.4})`; g.fillRect(qq() * w, qq() * h, 1 + qq() * 2.5, 1 + qq() * 2.5); }
      g.restore();
    });
    // roughness (G channel): glossy glaze, matte dough
    const rT = canvasTex(1024, Math.round(1024 * H / W), (g, w, h) => { g.fillStyle = "rgb(0,40,0)"; g.fillRect(0, 0, w, h); g.fillStyle = "rgb(0,215,0)"; land(g, w / W); });
    rT.colorSpace = THREE.NoColorSpace;
    return { W, H, mx, my, height, colT, rT, aspect: H / W };
  }
  function doughMap(box, seed, size, segX, p) {
    const T = mapTextures(box, seed), w = size, h = size * T.aspect, sy = Math.round(segX * T.aspect);
    const geo = new THREE.PlaneGeometry(w, h, segX, sy), ps = geo.attributes.position, uvA = geo.attributes.uv;
    for (let i = 0; i < ps.count; i++) { const { m, n } = T.height(uvA.getX(i), uvA.getY(i)); const s = smooth(m); ps.setZ(i, s * (0.09 + 0.05 * n) + (1 - s) * 0.0); }
    geo.computeVertexNormals();
    const mat = phys({ map: T.colT, roughnessMap: T.rT, roughness: 1, clearcoat: 0.6, clearcoatRoughness: 0.12, bumpMap: T.colT, bumpScale: 0.35, envMapIntensity: ENV * 1.2 });
    const m = mesh(geo, mat, 0, 0, 0.01, p); m.castShadow = false;
    // local position of lon/lat on the plane (+ height)
    const at = (lo, la, dz = 0) => { const u = T.mx(lo) / T.W, v = 1 - T.my(la) / T.H; const { m: mm, n } = T.height(u, v); const s = smooth(mm); return new THREE.Vector3((u - 0.5) * w, (v - 0.5) * h, 0.01 + s * (0.09 + 0.05 * n) + dz); };
    return { m, at, w, h };
  }
  // a board tilted toward the camera: local x right, local y up the slope, local z out of the board
  function tiltBoard(x, z, w, h, ang, mat, frameMat) {
    const B = new THREE.Group(); B.position.set(x, 0.12 + Math.sin(ang) * h / 2, z); B.rotation.x = -(Math.PI / 2 - ang); scene.add(B);
    block(w + 0.5, h + 0.5, 0.16, mat, 0, 0, -0.08, B, 0.05);
    if (frameMat) for (const [fw, fh, fx, fy] of [[w + 0.5, 0.12, 0, h / 2 + 0.19], [w + 0.5, 0.12, 0, -h / 2 - 0.19], [0.12, h + 0.5, w / 2 + 0.19, 0], [0.12, h + 0.5, -w / 2 - 0.19, 0]]) block(fw, fh, 0.1, frameMat, fx, fy, 0.03, B, 0.03);
    // back leg
    const leg = mesh(new THREE.BoxGeometry(w * 0.6, 0.08, Math.cos(ang) * h * 0.9), walnutM, x, Math.sin(ang) * h * 0.45, z - Math.cos(ang) * h * 0.45, scene); leg.rotation.x = 0;
    blob(w * 1.3, Math.cos(ang) * h * 1.3, x, z, 0.55);
    const up = (o) => { o.rotation.x = Math.PI / 2 - ang; return o; }; // child that stands upright in the world
    const flat = (o) => { o.rotation.x = Math.PI / 2; return o; }; // child whose up axis is the board normal
    return { B, up, flat };
  }

  // ================= B: dough map of Mexico, 1832 =================
  const XB = 16, ZB = -0.6, ANGB = 0.62;
  const bB = tiltBoard(XB, ZB, 7.6, 7.6 * 0.73, ANGB, walnutM, null);
  const mapB = doughMap(BOXB, 41, 7.6, 300, bB.B);
  const placeUp = (board, map, lo, la, o, dz = 0, flat = false) => { const v = map.at(lo, la, dz); o.position.copy(v); (flat ? board.flat : board.up)(o); return o; };
  const tagMex = pick(tagPaint("MEKSIKO", "1832", { big: 108 }), { w: 1.5, h: 0.62, L: 1.25 }, bB.B); placeUp(bB, mapB, -103.2, 23.8, tagMex.P);
  const tagCap = pick(tagPaint("Kota Meksiko", "TACUBAYA", { big: 76 }), { w: 1.25, h: 0.42, L: 0.85, flagSide: -1 }, bB.B); placeUp(bB, mapB, -99.13, 19.43, tagCap.P);
  const tagGulfB = pick(tagPaint("Teluk Meksiko", null, { big: 92, base: "#E8EEF6", band: FBLUE, ink: "#1A2E5E" }), { w: 1.3, h: 0.36, L: 0.7 }, bB.B); placeUp(bB, mapB, -91.5, 25.2, tagGulfB.P);
  const flagB = flagPick("mx", 0.75, 0.38, bB.B); placeUp(bB, mapB, -101.5, 21.5, flagB.P);
  // sugar-cube shops near the capital; they topple on "dijarah"
  const shopsB = [];
  { const q = mulberry(14); for (let i = 0; i < 7; i++) { const lo = -99.9 + q() * 1.9, la = 18.6 + q() * 1.5; const S = new THREE.Group(); bB.B.add(S); placeUp(bB, mapB, lo, la, S, 0, true); const c = mesh(sugarCubeGeo, sugarM, 0, 0.07, 0, S); c.scale.set(1, 1 + q() * 0.4, 1); const roof = mesh(new THREE.ConeGeometry(0.11, 0.09, 4), phys({ color: [0xe58c9c, 0xa9c98a, 0xf1dfb8][i % 3], roughness: 0.5, clearcoat: 0.5 }), 0, 0.19, 0, S); roof.rotation.y = Math.PI / 4; shopsB.push({ S, c, roof, dir: q() < 0.5 ? 1 : -1, k: q() }); } }
  const riotB = [[-100.3, 20.6], [-98.2, 19.0], [-101.2, 19.7], [-97.2, 20.1]];
  const crumbsB = [];
  { const q = mulberry(15); for (let i = 0; i < 26; i++) { const g = new THREE.Group(); bB.B.add(g); placeUp(bB, mapB, -99.9 + q() * 2.0, 18.6 + q() * 1.6, g, 0, true); const c = mesh(new THREE.DodecahedronGeometry(0.02 + q() * 0.03, 0), sponge, 0, 0.02, 0, g, false); c.rotation.set(q() * 3, q() * 3, 0); crumbsB.push({ g, k: q() }); } }

  // ================= C: Tacubaya shop =================
  const XC = 32, ZC = -0.4;
  const shop = G(XC - 0.9, 0, ZC);
  { const S = shop, W = 2.2, H = 1.6, D = 1.3;
    block(W, H, D, ginger, 0, H / 2, 0, S, 0.04);
    // roof with icing drips
    for (const s of [1, -1]) { const rf = block(W + 0.3, 0.12, D * 0.62, ginger, 0, H + 0.27, s * D * 0.25, S, 0.03); rf.rotation.x = s * 0.62; }
    const ridge = mesh(new THREE.CylinderGeometry(0.06, 0.06, W + 0.32, 16), icing, 0, H + 0.48, 0, S); ridge.rotation.z = Math.PI / 2;
    { const q = mulberry(22); for (let i = 0; i < 26; i++) { const x = -W / 2 - 0.1 + i * (W + 0.2) / 25, l = 0.06 + q() * 0.12; const d = mesh(new THREE.CapsuleGeometry(0.03, l, 4, 8), icing, x, H + 0.06 - l / 2, D / 2 + 0.06, S, false); } }
    mesh(new THREE.BoxGeometry(W + 0.34, 0.05, 0.08), icing, 0, H + 0.08, D / 2 + 0.06, S, false);
    // striped awning
    const awT = canvasTex(512, 128, (g, w, h) => { for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? "#F4EFE6" : FBLUE; g.fillRect(i * w / 10, 0, w / 10 + 1, h); } for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? "#F4EFE6" : FBLUE; g.beginPath(); g.arc(i * w / 10 + w / 20, h - 2, w / 20, 0, Math.PI); g.fill(); } });
    const aw = mesh(new THREE.PlaneGeometry(W + 0.1, 0.42, 1, 1), phys({ map: awT, roughness: 0.7, side: THREE.DoubleSide, sheen: 0.3 }), 0, H - 0.18, D / 2 + 0.2, S); aw.rotation.x = -0.85;
    // sign
    const signT = label(1200, 260, (g, w, h) => { paper(g, w, h, 31, "#F6E9D0"); g.strokeStyle = CHOC; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); txt(g, "Pâtisserie Remontel", w / 2, h * 0.58, `italic 700 112px ${FR}`, CHOC); txt(g, "TACUBAYA · 1832", w / 2, h * 0.88, `600 44px ${MONO}`, CAR, "center", 8); });
    block(1.86, 0.42, 0.05, phys({ color: 0x3a2216, roughness: 0.5 }), 0, H + 0.82, D / 2 - 0.25, S, 0.015);
    face(1.8, 0.39, signT, 0, H + 0.82, D / 2 - 0.22, S);
    for (const s of [1, -1]) mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), brass, s * 0.8, H + 0.55, D / 2 - 0.25, S);
    // door and window (sugar glass) with pastries behind
    block(0.5, 0.95, 0.06, choc, -0.65, 0.5, D / 2 + 0.01, S, 0.02);
    mesh(new THREE.SphereGeometry(0.03, 12, 10), brass, -0.48, 0.5, D / 2 + 0.05, S);
    const winFrame = block(1.15, 0.85, 0.06, icing, 0.35, 0.72, D / 2 + 0.01, S, 0.02);
    const inner = mesh(new THREE.PlaneGeometry(1.0, 0.72), phys({ color: 0x5a2c14, roughness: 0.9 }), 0.35, 0.72, D / 2 + 0.035, S);
    for (let i = 0; i < 4; i++) macaron([0xe58c9c, 0xa9c98a, 0xf1dfb8, 0x9a6a8c][i], 0xf0e6c8, 0.05 + i * 0.2, 0.42, D / 2 - 0.02, S, 0.45);
    croissant(0.35, 0.63, D / 2 - 0.05, 0, 0.3, S);
    const glass = mesh(new THREE.PlaneGeometry(1.0, 0.72), phys({ color: 0xffe7c0, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.1, clearcoat: 1, envMapIntensity: ENV * 1.5 }), 0.35, 0.72, D / 2 + 0.07, S, false);
    S.userData.glass = glass;
    const crackT = canvasTex(512, 384, (g, w, h) => { g.clearRect(0, 0, w, h); const q = mulberry(5); g.strokeStyle = "rgba(255,255,255,.95)"; g.lineCap = "round"; const cx = w * 0.42, cy = h * 0.45; for (let k = 0; k < 11; k++) { let x = cx, y = cy, a = k / 11 * 6.283 + q() * 0.3; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++) { a += (q() - 0.5) * 0.5; x += Math.cos(a) * 30; y += Math.sin(a) * 30; g.lineTo(x, y); } g.stroke(); } for (let rr = 40; rr < 200; rr += 55) { g.lineWidth = 2; g.beginPath(); for (let k = 0; k <= 22; k++) { const a = k / 22 * 6.283, j = rr * (0.85 + q() * 0.3); k ? g.lineTo(cx + Math.cos(a) * j, cy + Math.sin(a) * j) : g.moveTo(cx + Math.cos(a) * j, cy + Math.sin(a) * j); } g.stroke(); } });
    S.userData.crack = face(1.0, 0.72, crackT, 0.35, 0.72, D / 2 + 0.075, S, { basic: true, opacity: 0 });
    S.userData.winGlow = new THREE.PointLight(0xffc070, 0, 3, 2); S.userData.winGlow.position.set(0.35, 0.75, D / 2 + 0.3); S.add(S.userData.winGlow);
    blob(W * 1.5, D * 1.6, 0, 0, 0.65, S);
  }
  const tagTac = pick(tagPaint("Tacubaya", "KOTA MEKSIKO", { big: 96 }), { w: 1.15, h: 0.4, L: 1.75, flagSide: 1 }); tagTac.P.position.set(XC - 2.45, 0, ZC + 0.7);
  // coin stack (60 x 1.000 peso) and one coin (< 1.000)
  const stackX = XC + 1.0, stackZ = ZC + 0.55;
  plate(stackX + 0.3, stackZ, 0.75);
  const coins = [];
  for (let i = 0; i < 60; i++) { const c = mesh(coinGeo, coinM, stackX, 0.1 + i * 0.043, stackZ, scene); c.rotation.y = i * 0.9; c.userData.y = 0.1 + i * 0.043 + 0.021; c.userData.dx = Math.sin(i * 2.1) * 0.012; coins.push(c); }
  const oneCoin = mesh(coinGeo, coinM, stackX + 0.75, 0.11, stackZ + 0.15);
  const tag60 = pick(tagPaint("60.000 peso", "TUNTUTAN", { big: 80 }), { w: 1.1, h: 0.4, L: 3.35, flagSide: 1 }); tag60.P.position.set(stackX + 0.2, 0.08, stackZ - 0.25);
  const tag1 = pick(tagPaint("< 1.000 peso", "NILAI TOKO", { big: 74, band: MRED }), { w: 1.05, h: 0.38, L: 0.95, flagSide: 1 }); tag1.P.position.set(stackX + 0.78, 0.08, stackZ + 0.35);
  // receipt on a spike
  const receipt = G(XC - 1.7, 0, ZC + 1.55);
  { const R = receipt; mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 32), brass, 0, 0.025, 0, R); mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.7, 8), brass, 0, 0.37, 0, R);
    const rT = label(400, 640, (g, w, h) => { paper(g, w, h, 44, "#FAF3E4"); txt(g, "NOTA", w / 2, 70, `700 54px ${MONO}`, CHOC, "center", 8); g.strokeStyle = "rgba(58,34,22,.5)"; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(24, 100); g.lineTo(w - 24, 100); g.stroke(); g.setLineDash([]); [["Toko kue", "Tacubaya"], ["Pemilik", "Remontel"], ["Tahun", "1832"]].forEach(([a, b], i) => { txt(g, a, 30, 170 + i * 70, `500 30px ${MONO}`, "#6A4A30", "left"); txt(g, b, w - 30, 170 + i * 70, `600 30px ${MONO}`, CHOC, "right"); }); g.beginPath(); g.moveTo(24, 400); g.lineTo(w - 24, 400); g.stroke(); txt(g, "TOTAL", 30, 470, `700 36px ${MONO}`, CHOC, "left"); txt(g, "60.000", w - 30, 540, `700 74px ${MONO}`, MRED, "right"); txt(g, "peso", w - 30, 590, `600 30px ${MONO}`, "#6A4A30", "right"); });
    const pg = new THREE.PlaneGeometry(0.5, 0.8, 4, 12); const pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) { const y = pp.getY(i); pp.setZ(i, 0.06 * Math.sin((y + 0.4) * 3.2)); } pg.computeVertexNormals();
    const pm2 = mesh(pg, phys({ map: rT, roughness: 0.85, side: THREE.DoubleSide }), 0, 0.5, 0.02, R); pm2.rotation.z = 0.08; R.userData.paper = pm2;
    blob(0.8, 0.8, 0, 0, 0.5, R); }

  // ================= D: giant invoice =================
  const XD = 46, ZD = -0.5, ANGD = 0.95;
  const bD = tiltBoard(XD, ZD, 3.3, 4.4, ANGD, walnutM, brass);
  const invT = label(1320, 1760, (g, w, h) => {
    paper(g, w, h, 58, "#F7EEDC");
    g.fillStyle = FBLUE; g.fillRect(0, 0, w, 26); g.fillStyle = "#F4EFE6"; g.fillRect(0, 26, w, 8); g.fillStyle = "#C8202F"; g.fillRect(0, 34, w, 10);
    txt(g, "TAGIHAN", 90, 200, `italic 700 150px ${FR}`, CHOC, "left");
    txt(g, "dari Prancis untuk Meksiko", 94, 270, `italic 600 54px ${FR}`, "#7A4A26", "left");
    txt(g, "No. 1838", w - 90, 200, `600 46px ${MONO}`, "#7A4A26", "right", 4);
    g.strokeStyle = "rgba(58,34,22,.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(90, 330); g.lineTo(w - 90, 330); g.stroke();
  });
  const inv = face(3.3, 4.4, invT, 0, 0, 0.012, bD.B, { rough: 0.85 });
  const lineItems = [["Toko kue Remontel, Tacubaya", "1832"], ["Pasar Parián dijarah", "1828"], ["Keluhan warga Prancis lain", "1828–1837"]].map(([a, b], i) => {
    const tx = label(1240, 120, (g, w, h) => { g.clearRect(0, 0, w, h); txt(g, a, 10, 78, `500 50px ${MONO}`, CHOC, "left"); txt(g, b, w - 10, 78, `600 50px ${MONO}`, "#7A4A26", "right"); g.strokeStyle = "rgba(58,34,22,.3)"; g.setLineDash([5, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(10, 108); g.lineTo(w - 10, 108); g.stroke(); });
    return face(3.1, 0.3, tx, 0, 1.25 - i * 0.36, 0.016, bD.B, { basic: true, opacity: 0 });
  });
  const totT = label(1240, 420, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = CHOC; g.lineWidth = 5; g.beginPath(); g.moveTo(10, 20); g.lineTo(w - 10, 20); g.stroke(); g.beginPath(); g.moveTo(10, 32); g.lineTo(w - 10, 32); g.stroke(); txt(g, "TOTAL", 10, 120, `700 54px ${MONO}`, "#7A4A26", "left", 8); txt(g, "600.000", w / 2, 300, `700 230px ${MONO}`, CHOC, "center"); txt(g, "PESO  ·  3 juta franc", w / 2, 395, `600 54px ${MONO}`, "#7A4A26", "center", 6); });
  const total = face(3.1, 1.05, totT, 0, -0.85, 0.018, bD.B, { basic: true, opacity: 0 });
  const stampT = label(600, 600, (g, w, h) => { g.clearRect(0, 0, w, h); const q = mulberry(9); g.strokeStyle = "rgba(31,61,138,.9)"; g.lineWidth = 18; g.beginPath(); g.arc(300, 300, 260, 0, 6.283); g.stroke(); g.lineWidth = 6; g.beginPath(); g.arc(300, 300, 220, 0, 6.283); g.stroke(); txt(g, "PRANCIS", 300, 285, `700 100px ${MONO}`, "rgba(31,61,138,.92)", "center", 6); txt(g, "1838", 300, 400, `700 110px ${MONO}`, "rgba(31,61,138,.92)", "center", 10); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.7})`; g.fillRect(q() * w, q() * h, 2 + q() * 4, 2 + q() * 4); } g.globalCompositeOperation = "source-over"; });
  const stampInk = face(1.5, 1.5, stampT, 0.75, -1.25, 0.02, bD.B, { basic: true, opacity: 0 }); stampInk.rotation.z = -0.18;
  const rubber = G(0.75, -1.25, 0.03, bD.B); rubber.scale.set(0.62, 0.62, 0.62);
  { mesh(new THREE.BoxGeometry(1.2, 1.2, 0.08), phys({ color: 0x1f3d8a, roughness: 0.5 }), 0, 0, 0.04, rubber); block(1.25, 1.25, 0.25, phys({ color: 0x6b3d22, roughness: 0.45, clearcoat: 0.6 }), 0, 0, 0.22, rubber, 0.05); const hnd = mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.7, 24), phys({ color: 0x7a4a2a, roughness: 0.4, clearcoat: 0.6 }), 0, 0, 0.7, rubber); hnd.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.3, 24, 16), phys({ color: 0x7a4a2a, roughness: 0.4, clearcoat: 0.6 }), 0, 0, 1.12, rubber); }
  macaron(0xa9c98a, 0xf0e6c8, XD + 2.4, 0, ZD + 1.6, scene, 1.1);
  raspberry(XD - 2.3, 0, ZD + 1.7); raspberry(XD - 2.1, 0, ZD + 1.95);
  { const pen = G(XD - 1.9, 0.04, ZD + 1.3); pen.rotation.y = 0.6; const b2 = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 16), phys({ color: 0x1a1a1a, roughness: 0.2, clearcoat: 1 }), 0, 0, 0, pen); b2.rotation.z = Math.PI / 2; const nb = mesh(new THREE.ConeGeometry(0.035, 0.16, 16), goldRim, 0.53, 0, 0, pen); nb.rotation.z = -Math.PI / 2; }

  // ================= E: the Gulf tray =================
  const XE = 62, ZE = -0.3, ANGE = 0.36;
  const bE = tiltBoard(XE, ZE, 8.2, 8.2 * 0.66, ANGE, silver, darkSilver);
  const mapE = doughMap(BOXE, 52, 8.2, 320, bE.B);
  const VERA = [-96.13, 19.19], FORT = [-95.72, 19.42];
  // layer-cake fortress San Juan de Ulua on a dough island
  const fort = new THREE.Group(); bE.B.add(fort); placeUp(bE, mapE, FORT[0], FORT[1], fort, -0.02, true);
  { const F = fort;
    const isl = mesh(new THREE.SphereGeometry(0.75, 40, 20, 0, 6.283, 0, Math.PI / 2), phys({ color: 0xe0bd85, map: spongeT, roughness: 0.85, bumpMap: spongeT, bumpScale: 1 }), 0, -0.02, 0, F); isl.scale.set(1, 0.16, 0.8);
    let y = 0.04; const tier = (rad, layers) => { for (const [mat, hh] of layers) { mesh(new THREE.CylinderGeometry(rad * (mat === creamM ? 1.012 : 1), rad * (mat === creamM ? 1.012 : 1), hh, 64), mat, 0, y + hh / 2, 0, F); y += hh; } };
    tier(0.5, [[sponge, 0.1], [creamM, 0.03], [sponge, 0.1], [jam, 0.025], [sponge, 0.1], [fondant, 0.03]]);
    const y1 = y; mesh(new THREE.TorusGeometry(0.5, 0.025, 10, 64), icing, 0, y1, 0, F).rotation.x = Math.PI / 2;
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; if (i % 2) continue; mesh(bevelGeo(0.09, 0.09, 0.09, 0.015), fondant, Math.cos(a) * 0.46, y1 + 0.045, Math.sin(a) * 0.46, F); }
    tier(0.3, [[sponge, 0.09], [creamM, 0.025], [sponge, 0.09], [fondant, 0.02]]);
    const y2 = y; mesh(new THREE.TorusGeometry(0.3, 0.02, 10, 48), icing, 0, y2, 0, F).rotation.x = Math.PI / 2;
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; if (i % 2) continue; mesh(bevelGeo(0.07, 0.07, 0.07, 0.012), fondant, Math.cos(a) * 0.27, y2 + 0.035, Math.sin(a) * 0.27, F); }
    // drips of ganache
    { const q = mulberry(3); for (let i = 0; i < 22; i++) { const a = q() * 6.283, l = 0.04 + q() * 0.1; mesh(new THREE.CapsuleGeometry(0.018, l, 4, 8), choc, Math.cos(a) * 0.505, y1 - l / 2, Math.sin(a) * 0.505, F, false); } }
    F.userData.top = y2;
    const fl = flagPick("mx", 0.55, 0.3, F); fl.P.position.y = y2; F.userData.flag = fl;
  }
  const tagFort = pick(tagPaint("San Juan de Ulúa", "BENTENG", { big: 66 }), { w: 1.3, h: 0.4, L: 1.0, flagSide: -1 }, bE.B); placeUp(bE, mapE, FORT[0] - 0.15, FORT[1] + 1.0, tagFort.P);
  // Veracruz: petits fours and meringue domes on the coast
  const vera = [];
  { const q = mulberry(31); const cols = [0xf2b8c0, 0xcfe3b8, 0xf6e3a8, 0xf6efe2, 0xe8c7a8];
    for (let i = 0; i < 13; i++) { const lo = VERA[0] - 0.2 - q() * 0.8, la = VERA[1] - 0.35 + q() * 0.75; const S = new THREE.Group(); bE.B.add(S); placeUp(bE, mapE, lo, la, S, 0, true); S.rotation.y = q();
      const s = 0.12 + q() * 0.06; mesh(bevelGeo(s, s * 0.8, s, 0.02), sponge, 0, s * 0.4, 0, S); mesh(bevelGeo(s * 1.04, s * 0.22, s * 1.04, 0.02), phys({ color: cols[i % 5], roughness: 0.4, clearcoat: 0.6 }), 0, s * 0.85, 0, S); vera.push(S); }
    for (let i = 0; i < 3; i++) { const S = new THREE.Group(); bE.B.add(S); placeUp(bE, mapE, VERA[0] - 0.4 - i * 0.3, VERA[1] + 0.05 + (i % 2) * 0.25, S, 0, true); const d = mesh(new THREE.SphereGeometry(0.11, 24, 16), phys({ color: 0xfbf3e6, roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) }), 0, 0.05, 0, S); d.scale.y = 1.2; mesh(new THREE.ConeGeometry(0.04, 0.12, 12), phys({ color: 0xfbf3e6, roughness: 0.55 }), 0, 0.22, 0, S); }
    // church: tower of sugar cubes
    const C = new THREE.Group(); bE.B.add(C); placeUp(bE, mapE, VERA[0] - 0.55, VERA[1] - 0.1, C, 0, true);
    for (let k = 0; k < 3; k++) mesh(sugarCubeGeo, sugarM, 0, 0.07 + k * 0.14, 0, C); mesh(new THREE.SphereGeometry(0.08, 20, 12, 0, 6.283, 0, Math.PI / 2), phys({ color: 0xe8b04a, metalness: 0.6, roughness: 0.3 }), 0, 0.42, 0, C);
  }
  const tagVera = pick(tagPaint("Veracruz", "KOTA PELABUHAN", { big: 92 }), { w: 1.1, h: 0.4, L: 0.85, flagSide: -1 }, bE.B); placeUp(bE, mapE, VERA[0] - 1.1, VERA[1] - 0.75, tagVera.P);
  const tagGulfE = pick(tagPaint("Teluk Meksiko", null, { big: 92, base: "#E8EEF6", band: FBLUE, ink: "#1A2E5E" }), { w: 1.3, h: 0.36, L: 0.75 }, bE.B); placeUp(bE, mapE, -92.4, 23.3, tagGulfE.P);
  const frPicks = [[-96.35, 19.0], [-96.6, 19.35], [-96.25, 19.55]].map(([lo, la]) => { const f = flagPick("fr", 0.6, 0.3, bE.B); placeUp(bE, mapE, lo, la, f.P); return f; });
  const mxPick = flagPick("mx", 0.95, 0.5, bE.B); placeUp(bE, mapE, -97.6, 19.6, mxPick.P);
  // chocolate warships
  function ship() {
    const S = new THREE.Group();
    const sh = new THREE.Shape(); sh.moveTo(-0.5, -0.12); sh.lineTo(0.2, -0.14); sh.quadraticCurveTo(0.46, -0.11, 0.58, 0); sh.quadraticCurveTo(0.46, 0.11, 0.2, 0.14); sh.lineTo(-0.5, 0.12); sh.quadraticCurveTo(-0.57, 0, -0.5, -0.12);
    const hg = new THREE.ExtrudeGeometry(sh, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 4, curveSegments: 16 }); hg.rotateX(-Math.PI / 2); hg.translate(0, 0.035, 0);
    mesh(hg, choc, 0, 0, 0, S);
    const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false, curveSegments: 16 }); bg.rotateX(-Math.PI / 2); bg.scale(1.06, 1, 1.18);
    mesh(bg, whiteChoc, 0, 0.12, 0, S);
    for (let i = 0; i < 6; i++) for (const s of [1, -1]) mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 10), choc, -0.32 + i * 0.12, 0.135, s * 0.165, S, false).rotation.x = Math.PI / 2;
    const sailT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#F3E3C2"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(160,110,60,.35)"; g.lineWidth = 2; for (let k = 8; k < w; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); } });
    const sailM = phys({ map: sailT, roughness: 0.7, side: THREE.DoubleSide, sheen: 0.3, bumpMap: sailT, bumpScale: 0.6 });
    [[-0.27, 0.55], [0.03, 0.7], [0.3, 0.5]].forEach(([x, hgt]) => {
      mesh(new THREE.CylinderGeometry(0.014, 0.016, hgt, 8), pretzel, x, 0.17 + hgt / 2, 0, S);
      for (const [yy, sw, shh] of [[0.26, 0.4, 0.24], [0.5, 0.32, 0.18]]) { if (yy > hgt) continue; const geo = new THREE.PlaneGeometry(sw, shh, 8, 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / sw + 0.5; p.setZ(i, 0.05 * Math.sin(Math.PI * u)); } geo.computeVertexNormals(); const sl = mesh(geo, sailM, x, 0.17 + yy * hgt / 0.7 * 0.85, 0, S, true); sl.rotation.y = Math.PI / 2; }
    });
    const fg = mesh(new THREE.PlaneGeometry(0.14, 0.09), phys({ map: label(300, 186, flagPaint("fr")), roughness: 0.7, side: THREE.DoubleSide }), 0.1, 0.17 + 0.7 - 0.02, 0, S, false);
    return S;
  }
  const shipPlan = [[-94.2, 21.9, 0.4], [-93.9, 21.0, 0.3], [-93.7, 20.1, 0.2], [-93.6, 19.2, 0.1], [-94.85, 19.85, -0.3], [-94.8, 19.0, -0.1], [-92.5, 20.7, 0.4]];
  const ships = shipPlan.map(([lo, la, ry], i) => { const S = ship(); bE.B.add(S); const home = mapE.at(lo, la, 0.0); S.userData = { home, ry: Math.PI / 2 + 1.2 + ry, from: mapE.at(lo + 2.2, la + 0.4, 0) }; bE.flat(S); S.scale.setScalar(0.95); return S; });
  // piped icing blockade line (dashes) along the ship line
  const blockDash = [];
  { const P = [[-94.5, 22.6], [-94.1, 21.45], [-93.85, 20.55], [-93.7, 19.65], [-93.6, 18.85]].map(([lo, la]) => mapE.at(lo, la, 0.02));
    const cv = new THREE.CatmullRomCurve3(P); const n = 34;
    for (let i = 0; i < n; i++) { const a = cv.getPoint(i / n), b = cv.getPoint((i + 0.55) / n); const d = b.clone().sub(a); const m = mesh(new THREE.CapsuleGeometry(0.03, d.length(), 4, 10), icing, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2 + 0.02, bE.B, false); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); blockDash.push(m); } }
  // bombardment schedule: puffs around the fort, flashes at the ships
  const fortW = new THREE.Vector3(); fort.updateWorldMatrix(true, false); fort.getWorldPosition(fortW);
  ships.forEach((S) => S.updateWorldMatrix(true, false));

  // ================= F: the boot on a cushion =================
  const XF = 78, ZF = -0.4;
  const standF = G(XF, 0, ZF);
  mesh(lathe([[0, 0], [0.75, 0], [0.75, 0.03], [0.14, 0.06], [0.11, 0.55], [0.16, 0.6], [1.15, 0.62], [1.18, 0.66], [1.12, 0.67], [0, 0.65]]), porcelain, 0, 0, 0, standF);
  mesh(new THREE.TorusGeometry(1.17, 0.008, 6, 96), goldRim, 0, 0.665, 0, standF, false).rotation.x = Math.PI / 2;
  blob(3, 3, 0, 0, 0.6, standF);
  const cushion = G(0, 0.66, 0, standF);
  { const cg = bevelGeo(1.6, 1.15, 0.36, 0.16); cg.rotateX(-Math.PI / 2); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 - 0.35 * (Math.pow(x / 0.8, 2) + Math.pow(z / 0.58, 2)); if (y > 0) p.setY(i, y + 0.1 * Math.max(0, k)); } cg.computeVertexNormals();
    mesh(cg, velvet, 0, 0.18, 0, cushion);
    for (const [x, z] of [[-0.8, -0.57], [0.8, -0.57], [-0.8, 0.57], [0.8, 0.57]]) { mesh(new THREE.SphereGeometry(0.05, 12, 10), brass, x, 0.18, z, cushion); mesh(new THREE.CylinderGeometry(0.035, 0.07, 0.18, 12), brass, x * 1.03, 0.08, z * 1.03, cushion); }
    for (const [x, z] of [[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]]) mesh(new THREE.SphereGeometry(0.03, 10, 8), brass, x, 0.43, z, cushion); }
  const boot = G(-0.15, 1.0, 0.0, standF); boot.rotation.y = -0.75;
  { const Bt = boot;
    const shaft = mesh(lathe([[0, 0], [0.16, 0], [0.165, 0.2], [0.155, 0.5], [0.165, 0.72], [0.18, 0.86], [0.185, 0.9], [0.17, 0.9], [0.15, 0.8], [0.0, 0.8]], 48), leather, 0, 0.12, 0, Bt);
    const foot = mesh(new THREE.SphereGeometry(0.2, 40, 24), leather, 0.17, 0.1, 0, Bt); foot.scale.set(1.75, 0.62, 0.78);
    mesh(bevelGeo(0.6, 0.035, 0.3, 0.012).rotateX(-Math.PI / 2), phys({ color: 0x1a0e08, roughness: 0.6 }), 0.17, 0.02, 0, Bt);
    block(0.16, 0.1, 0.25, phys({ color: 0x1a0e08, roughness: 0.55 }), -0.07, 0.06, 0, Bt, 0.02).rotation.x = -Math.PI / 2;
    const cuff = mesh(new THREE.TorusGeometry(0.2, 0.018, 10, 48), brass, 0, 0.98, 0, Bt); cuff.rotation.x = Math.PI / 2;
    const spur = mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 20), brass, -0.17, 0.13, 0, Bt); spur.rotation.y = Math.PI / 2; }
  // rose petals
  { const q = mulberry(44); for (let i = 0; i < 9; i++) { const a = q() * 6.283, rr = 0.45 + q() * 0.25; const pe = mesh(new THREE.SphereGeometry(0.06, 14, 8), phys({ color: 0x9a1a2a, roughness: 0.5, sheen: 0.7, sheenColor: new THREE.Color(0xff6070) }), Math.cos(a) * rr, 0.47, Math.sin(a) * rr * 0.7, cushion, false); pe.scale.set(1, 0.18, 0.75); pe.rotation.y = q() * 3; } }
  const nameF = pick(tagPaint("Santa Anna", "JENDERAL · 1838", { big: 112, band: MGRN }), { w: 1.35, h: 0.5, L: 1.55, flagSide: 1, tilt: 0.05 }, standF); nameF.P.position.set(0.5, 0.95, 0.35);
  // half-mast flag on a chocolate cake base
  const poleF = G(XF + 1.75, 0, ZF - 0.5);
  { mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.3, 40), choc, 0, 0.15, 0, poleF); mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 40), whiteChoc, 0, 0.3, 0, poleF).rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.018, 0.022, 2.3, 12), woodPick, 0, 1.4, 0, poleF); mesh(new THREE.SphereGeometry(0.04, 12, 10), brass, 0, 2.56, 0, poleF); blob(0.9, 0.9, 0, 0, 0.5, poleF); }
  const flagF = flagPick("mx", 0.01, 0.62, poleF); flagF.P.position.set(0, 0, 0); flagF.P.children[0].visible = false;
  // candle
  const candle = G(XF - 1.6, 0, ZF + 0.35);
  { mesh(lathe([[0, 0], [0.32, 0], [0.34, 0.03], [0.3, 0.05], [0, 0.04]]), porcelain, 0, 0, 0, candle); mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 28), phys({ color: 0xf2e6c8, roughness: 0.55, sheen: 0.4, transmission: 0 }), 0, 0.44, 0, candle); mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), phys({ color: 0x111111 }), 0, 0.87, 0, candle); blob(0.8, 0.8, 0, 0, 0.5, candle); }
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: 0xffb050, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); flame.position.set(XF - 1.6, 0.95, ZF + 0.35); flame.scale.set(0.12, 0.22, 1); scene.add(flame);
  const candleL = new THREE.PointLight(0xffa850, 0, 6, 1.6); candleL.position.set(XF - 1.6, 1.05, ZF + 0.35); scene.add(candleL);
  const bootSpot = new THREE.SpotLight(0xffe0b8, 0, 0, 0.32, 0.6, 1.2); bootSpot.position.set(XF + 0.5, 6.5, ZF + 1.5); bootSpot.target.position.set(XF, 1.2, ZF); scene.add(bootSpot, bootSpot.target);

  // ================= G: treaty, cheque, arrow to 1861 =================
  const XG = 92, ZG = -0.6, ANGG = 0.7;
  const bG = tiltBoard(XG - 0.6, ZG, 4.4, 3.0, ANGG, silver, darkSilver);
  const treatyT = label(1100, 1400, (g, w, h) => { paper(g, w, h, 81, "#EFE0BE"); g.strokeStyle = "rgba(122,74,38,.55)"; g.lineWidth = 4; g.strokeRect(40, 40, w - 80, h - 80); txt(g, "PERJANJIAN DAMAI", w / 2, 190, `700 70px ${MONO}`, CHOC, "center", 6); txt(g, "Prancis · Meksiko", w / 2, 300, `italic 700 92px ${FR}`, CHOC); txt(g, "Veracruz", w / 2, 460, `italic 600 70px ${FR}`, "#7A4A26"); txt(g, "9 Maret 1839", w / 2, 580, `700 96px ${MONO}`, CHOC); g.strokeStyle = "rgba(58,34,22,.25)"; g.lineWidth = 3; for (let y = 700; y < 1150; y += 56) { g.beginPath(); g.moveTo(110, y); g.lineTo(w - 110 - (y % 3) * 60, y); g.stroke(); } txt(g, "dimediasi Inggris", w / 2, 1270, `italic 600 62px ${FR}`, "#7A4A26"); });
  const treaty = face(1.95, 2.5, treatyT, -1.05, 0.05, 0.012, bG.B, { rough: 0.85 });
  const sealG = G(-0.5, -0.95, 0.03, bG.B);
  { const sg = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 40); const p = sg.attributes.position, q = mulberry(6); for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr > 0.15) { const k = 1 + (q() - 0.5) * 0.12; p.setX(i, x * k); p.setZ(i, z * k); } } sg.computeVertexNormals(); const s1 = mesh(sg, phys({ color: 0x8e1420, roughness: 0.3, clearcoat: 0.8 }), 0, 0, 0.02, sealG); s1.rotation.x = Math.PI / 2; mesh(new THREE.TorusGeometry(0.12, 0.015, 8, 30), phys({ color: 0x6e0e18, roughness: 0.35, clearcoat: 0.8 }), 0, 0, 0.05, sealG); for (const s of [1, -1]) { const rb = mesh(new THREE.BoxGeometry(0.1, 0.5, 0.01), jam, s * 0.08, -0.28, 0.0, sealG); rb.rotation.z = s * 0.25; } }
  const chequeT = label(1200, 560, (g, w, h) => { paper(g, w, h, 90, "#E9F0E6"); g.strokeStyle = "rgba(0,104,71,.45)"; g.lineWidth = 3; for (let y = 0; y < h; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 4); g.stroke(); } g.fillStyle = "rgba(233,240,230,.82)"; g.fillRect(24, 24, w - 48, h - 48); g.strokeStyle = MGRN; g.lineWidth = 5; g.strokeRect(24, 24, w - 48, h - 48); txt(g, "CEK", 70, 120, `700 70px ${MONO}`, MGRN, "left", 10); txt(g, "1839", w - 70, 120, `600 50px ${MONO}`, MGRN, "right"); txt(g, "Bayarlah kepada: Prancis", 70, 230, `italic 600 54px ${FR}`, CHOC, "left"); g.strokeStyle = CHOC; g.lineWidth = 3; g.strokeRect(w - 560, 280, 500, 120); txt(g, "600.000 peso", w - 310, 365, `700 64px ${MONO}`, CHOC); txt(g, "Meksiko", 70, 470, `italic 700 64px ${FR}`, "#4a2a18", "left"); });
  const cheque = face(2.0, 0.93, chequeT, 1.12, 0.45, 0.014, bG.B, { rough: 0.8 });
  const voidT = label(900, 260, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(206,17,38,.9)"; g.lineWidth = 12; g.strokeRect(14, 14, w - 28, h - 28); txt(g, "TAK PERNAH", w / 2, 120, `700 88px ${MONO}`, "rgba(206,17,38,.92)", "center", 6); txt(g, "DICAIRKAN", w / 2, 220, `700 88px ${MONO}`, "rgba(206,17,38,.92)", "center", 6); const q = mulberry(12); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.7})`; g.fillRect(q() * w, q() * h, 2 + q() * 3, 2 + q() * 3); } g.globalCompositeOperation = "source-over"; });
  const voidS = face(1.5, 0.43, voidT, 1.15, 0.42, 0.018, bG.B, { basic: true, opacity: 0 }); voidS.rotation.z = 0.16;
  const tagMed = pick(tagPaint("mediasi Inggris", null, { big: 70 }), { w: 1.15, h: 0.32, L: 0.85, flagSide: -1 }); tagMed.P.position.set(XG - 3.4, 0, ZG + 1.6);
  // arrow piped in chocolate from the cheque to 1861
  const arrowPts = [new THREE.Vector3(XG + 1.4, 0.04, ZG + 1.75), new THREE.Vector3(XG + 2.2, 0.04, ZG + 2.1), new THREE.Vector3(XG + 3.0, 0.04, ZG + 1.85), new THREE.Vector3(XG + 3.6, 0.04, ZG + 1.35), new THREE.Vector3(XG + 3.9, 0.04, ZG + 0.95)];
  const arrowCv = new THREE.CatmullRomCurve3(arrowPts);
  const arrowGeo = new THREE.TubeGeometry(arrowCv, 220, 0.055, 14, false);
  { const p = arrowGeo.attributes.position; /* piped ridges */ const n = arrowGeo.attributes.normal; for (let i = 0; i < p.count; i++) { const ring = Math.floor(i / 15), j = i % 15; const k = 0.012 * Math.cos(j / 14 * 6.283 * 4); p.setXYZ(i, p.getX(i) + n.getX(i) * k, p.getY(i) + n.getY(i) * k, p.getZ(i) + n.getZ(i) * k); } arrowGeo.computeVertexNormals(); }
  const arrow = mesh(arrowGeo, choc, 0, 0, 0, scene, true);
  const arrowHead = mesh(new THREE.ConeGeometry(0.16, 0.34, 24), choc, 0, 0, 0);
  { const e = arrowCv.getPoint(1), d = arrowCv.getTangent(1); arrowHead.position.copy(e).add(d.clone().multiplyScalar(0.15)); arrowHead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); arrowHead.scale.set(1, 1, 0.55); }
  const card61 = tent((g, w, h) => { paper(g, w, h, 61, "#F6EAD2"); g.fillStyle = FBLUE; g.fillRect(0, 0, w / 3, 18); g.fillStyle = "#F4EFE6"; g.fillRect(w / 3, 0, w / 3, 18); g.fillStyle = "#C8202F"; g.fillRect(2 * w / 3, 0, w / 3, 18); txt(g, "1861", w / 2, h * 0.62, `700 300px ${MONO}`, CHOC, "center"); txt(g, "Prancis menyerbu lagi", w / 2, h * 0.88, `italic 600 76px ${FR}`, "#7A4A26"); }, 1.5, 0.85, XG + 4.45, ZG + 0.35, -0.35);
  const tag22 = pick(tagPaint("22 tahun", null, { big: 110 }), { w: 0.95, h: 0.34, L: 0.75, flagSide: 1 }); tag22.P.position.set(XG + 2.3, 0, ZG + 2.5);

  // ================= H: open pastry box AUDIRA =================
  const XH = 108, ZH = -0.4;
  const boxH = pastryBox(XH, ZH, -0.15, scene, true);
  croissant(-0.35, 0.05, 0.05, 0.3, 0.6, boxH); croissant(0.35, 0.05, -0.05, -0.4, 0.6, boxH);
  macaron(0xe58c9c, 0xb0142c, 0.0, 0.03, 0.4, boxH, 0.7); macaron(0xa9c98a, 0xf0e6c8, 0.55, 0.03, 0.4, boxH, 0.7);
  croissant(XH + 1.7, 0.0, ZH + 1.2, -0.9, 0.8);
  plate(XH - 1.9, ZH + 1.0, 0.8); macaron(0x9a6a8c, 0xf0e6c8, XH - 1.95, 0.08, ZH + 0.95, scene, 1.0); macaron(0xf1dfb8, 0x6b3c22, XH - 1.6, 0.08, ZH + 1.25, scene, 0.9);
  espresso(XH + 1.6, ZH - 1.2);
  steamSrc(XH + 1.6, 0.42, ZH - 1.2, 16, 1);

  // ---------- filler props between stations: never an empty table ----------
  { const q = mulberry(101); const busy = [[XA, 3.4], [XB, 4.6], [XC, 3.0], [XD, 2.8], [XE, 4.8], [XF, 2.6], [XG, 7], [XH, 3]];
    for (let i = 0; i < 70; i++) { const x = X0 + 14 + q() * (XH + 8 - X0 - 14), z = -2.6 + q() * 4.6; if (busy.some(([bx, br]) => Math.abs(x - bx) < br)) continue;
      const k = q();
      if (k < 0.3) { const c = mesh(sugarCubeGeo, sugarM, x, 0.07, z); c.rotation.y = q() * 3; }
      else if (k < 0.55) raspberry(x, 0, z).rotation.set(q() * 0.4, q() * 3, 0);
      else if (k < 0.7) mesh(blueGeo, blueM, x, 0.06, z);
      else if (k < 0.85) macaron([0xe58c9c, 0xa9c98a, 0xf1dfb8, 0x9a6a8c][Math.floor(q() * 4)], 0xf0e6c8, x, 0, z, scene, 0.9);
      else { const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12), phys({ color: 0x8a4a22, roughness: 0.8, bumpMap: spongeT, bumpScale: 1 }), x, 0.035, z); c.rotation.z = Math.PI / 2; c.rotation.y = q() * 3; }
    }
    // crumbs everywhere (instanced)
    const cg = new THREE.DodecahedronGeometry(0.025, 0), cm = new THREE.InstancedMesh(cg, phys({ map: spongeT, color: 0xd9a060, roughness: 0.85 }), 900); const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 900; i++) { const s = 0.4 + q() * 1.4; e.set(q() * 3, q() * 3, q() * 3); qq.setFromEuler(e); m4.compose(new THREE.Vector3(X0 + 18 + q() * (XH + 10 - X0 - 18), 0.012 * s, -2.8 + q() * 5), qq, new THREE.Vector3(s, s * 0.7, s)); cm.setMatrixAt(i, m4); }
    cm.castShadow = true; cm.receiveShadow = true; scene.add(cm);
    // icing sugar drifts on the wood
    const dT = canvasTex(256, 256, (g, w) => { const qd = mulberry(8); for (let i = 0; i < 1600; i++) { const a = qd() * 6.283, rr = Math.pow(qd(), 0.7) * w * 0.45; g.fillStyle = `rgba(255,255,255,${0.2 + qd() * 0.5})`; g.fillRect(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, 1.5, 1.5); } });
    for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: dT, transparent: true, depthWrite: false, roughness: 0.9 })); d.rotation.x = -Math.PI / 2; d.rotation.z = q() * 3; d.position.set(X0 + 18 + q() * (XH + 8 - X0 - 18), 0.003, -2 + q() * 3.5); d.renderOrder = 1; scene.add(d); }
  }

  // ---------- timing ----------
  const tKue = A("s1:kue"), tJend = A("s1:jenderal");
  const tMex2 = A("s2:Meksiko"), t1832 = A("s2:1832"), tRusuh = A("s2:kerusuhan"), tJarah = A("s2:dijarah");
  const tMons = A("s3:Monsieur"), tRusak = A("s3:merusak"), tTac = A("s3:Tacubaya"), tRem2 = A("s3:Remontel#2"), tTuntut = A("s3:menuntut"), tEnam3 = A("s3:enam"), tKurang = A("s3:kurang");
  const tKeluh = A("s4:keluhan"), t1838 = A("s4:1838"), tTagih = A("s4:menagih"), tRibu4 = A("s4:ribu"), tTidak = A("s4:tidak");
  const tArmada = A("s5:Armada"), tBlok = A("s5:diblokade"), tBent = A("s5:benteng"), tBomb = A("s5:dibombardir"), tVera = A("s5:Veracruz"), tRebut = A("s5:direbut"), tNyat = A("s5:menyatakan");
  const tSanta = A("s6:Santa"), tTerk = A("s6:terkena"), tMakam = A("s6:dimakamkan"), tUpac = A("s6:upacara");
  const tMaret = A("s7:Maret"), tMed = A("s7:mediasi"), tJanji = A("s7:berjanji"), tTak = A("s7:tak"), tDua = A("s7:Dua"), tSerbu = A("s7:menyerbu");
  const tSemua = A("s8:Semua"), tMen8 = A("s8:Menurut");
  // bombardment events
  { const q = mulberry(808); for (let i = 0; i < 16; i++) { const t0 = tBomb - 0.5 + i * 0.16 + q() * 0.1; const a = q() * 6.283, rr = 0.2 + q() * 0.5; puffAt(fortW.x + Math.cos(a) * rr * 0.8, fortW.y + 0.45 + q() * 0.4, fortW.z + Math.sin(a) * rr * 0.5 + 0.15, t0, 0.3 + q() * 0.3); }
    bE.B.updateWorldMatrix(true, false); ships.forEach((S, i) => { const w = S.userData.home.clone().applyMatrix4(bE.B.matrixWorld); if (i < 6) { flashAt(w.x - 0.2, w.y + 0.25, w.z + 0.1, tBomb - 0.75 + i * 0.25); puffAt(w.x - 0.25, w.y + 0.3, w.z + 0.1, tBomb - 0.7 + i * 0.25, 0.45, 0xd8cfc4); } }); }

  // ---------- world points for the camera ----------
  const W = (board, map, lo, la, dz = 0) => { board.B.updateWorldMatrix(true, true); return map.at(lo, la, dz).applyMatrix4(board.B.matrixWorld); };
  const pB = W(bB, mapB, -100.5, 22.5), pBcap = W(bB, mapB, -99.2, 19.6);
  const pE = W(bE, mapE, -94.9, 20.3), pEfort = W(bE, mapE, FORT[0] - 0.1, FORT[1]), pEwide = W(bE, mapE, -94.0, 20.6);
  const cv = (tx, ty, tz, d, el, yaw = 0) => { const e = el * Math.PI / 180; return [tx + d * Math.cos(e) * Math.sin(yaw), ty + d * Math.sin(e), tz + d * Math.cos(e) * Math.cos(yaw), tx, ty, tz]; };
  const keys = [
    [0, ...cv(XA + 0.05, 0.95, 0.5, 8.6, 15, 0.28)],
    [K.s1e - 0.9, ...cv(XA + 0.0, 1.0, 0.4, 9.6, 16, -0.1)],
    [K.s2 + 1.4, ...cv(pB.x, pB.y + 0.9, pB.z, 17.5, 30, 0.04)],
    [tRusuh, ...cv(pBcap.x + 0.2, pBcap.y + 0.8, pBcap.z, 14.5, 32, -0.04)],
    [K.s2e - 0.6, ...cv(pBcap.x, pBcap.y + 0.75, pBcap.z, 13.2, 33, -0.1)],
    [K.s3 + 1.5, ...cv(XC - 0.8, 2.35, ZC + 0.4, 14.2, 13, -0.1)],
    [tTac + 0.4, ...cv(XC - 0.75, 2.3, ZC + 0.4, 13.8, 12, 0.04)],
    [tTuntut, ...cv(XC + 0.1, 2.2, ZC + 0.3, 13.8, 12, 0.12)],
    [K.s3e - 0.5, ...cv(XC + 0.3, 2.15, ZC + 0.3, 13.2, 14, 0.2)],
    [K.s4 + 1.4, ...cv(XD, 2.35, ZD + 0.2, 15.8, 22, -0.16)],
    [tTagih, ...cv(XD, 2.2, ZD + 0.2, 14.6, 20, 0.0)],
    [K.s4e - 0.4, ...cv(XD + 0.1, 2.15, ZD + 0.3, 14.0, 19, 0.14)],
    [K.s5 + 1.6, ...cv(pEwide.x, pEwide.y + 1.1, pEwide.z, 19.5, 34, 0.12)],
    [tBent, ...cv(pEfort.x + 0.6, pEfort.y + 1.2, pEfort.z, 13.0, 27, 0.08)],
    [tRebut + 0.2, ...cv(pEfort.x - 0.45, pEfort.y + 1.15, pEfort.z, 12.4, 25, -0.08)],
    [K.s5e - 0.4, ...cv(pE.x - 0.3, pE.y + 1.1, pE.z, 18.5, 33, -0.04)],
    [K.s6 + 1.5, ...cv(XF + 0.1, 1.95, ZF + 0.4, 13.2, 14, 0.06)],
    [tMakam, ...cv(XF + 0.15, 1.85, ZF + 0.3, 11.6, 13, -0.04)],
    [K.s6e - 0.4, ...cv(XF + 0.3, 1.85, ZF + 0.2, 11.2, 13, -0.08)],
    [K.s7 + 1.4, ...cv(XG - 0.6, 2.05, ZG + 0.4, 16.0, 21, -0.06)],
    [tTak + 0.3, ...cv(XG - 0.45, 1.95, ZG + 0.4, 15.2, 21, 0.03)],
    [tDua + 1.2, ...cv(XG + 2.6, 1.0, ZG + 1.3, 10.6, 28, 0.06)],
    [tSerbu + 0.2, ...cv(XG + 3.7, 1.0, ZG + 1.1, 10.4, 29, 0.08)],
    [K.s7e - 0.3, ...cv(XG + 3.85, 1.0, ZG + 1.0, 10.2, 29, 0.1)],
    [K.s8 + 1.5, ...cv(XH, 1.3, ZH + 0.2, 10.4, 22, 0.1)],
    [tMen8, ...cv(XH, 1.35, ZH + 0.1, 11.0, 23, -0.02)],
    [K.dur, ...cv(XH - 0.2, 1.7, ZH, 16.0, 25, -0.18)],
  ];
  const camT = track(keys);
  const tgt = new THREE.Vector3();
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const popIn = (o, t, a, d = 0.35) => { const u = back(clamp01((t - a) / d), 1.6); o.scale.setScalar(Math.max(0.001, u)); o.visible = t > a; };
  const shopG = shop.userData;

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`italic 700 40px "Fraunces"`) && document.fonts.check(`700 40px "IBM Plex Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.05, c[1] + Math.sin(t * 0.23) * 0.03, c[2] + Math.cos(t * 0.27) * 0.04);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    // solemn mood for the boot
    const sol = smooth(clamp01((t - K.s6 + 0.6) / 1.2)) * (1 - smooth(clamp01((t - K.s7 + 0.2) / 1.2)));
    key.intensity = 1.7 * (1 - 0.55 * sol); hemi.intensity = 0.4 * (1 - 0.5 * sol);
    key.target.position.copy(tgt); key.position.set(tgt.x - 8, tgt.y + 6.5, tgt.z + 5);
    rim.target.position.copy(tgt); rim.position.set(tgt.x + 4, tgt.y + 5, tgt.z - 9);
    rim.intensity = 1.8 * (1 - 0.3 * sol);
    candleL.intensity = sol * (3.2 + 0.5 * Math.sin(t * 13) * Math.sin(t * 7.3)); flame.material.opacity = 0.9 * sol; flame.scale.set(0.12, 0.22 + 0.02 * Math.sin(t * 11), 1);
    bootSpot.intensity = 60 * sol * (1 - 0.35 * pump(t, tTerk + 0.4, 0.2, 1.4));

    heroRim.intensity = 22 * (1 - smooth(clamp01((t - K.s2) / 1.2)));
    // A: icing sugar falls on "kue"
    { const d = sugarFall.pos; const u0 = tKue - 0.4;
      for (let i = 0; i < 420; i++) { const q = sfSeed[i]; const tt = t - u0 - q[2] * 1.6; let y = 2.6 - tt * 0.9; const on = tt > 0 && y > 0.15; d[i * 3] = on ? XA + q[0] * 0.75 + Math.sin(t + q[3]) * 0.03 : 9999; d[i * 3 + 1] = Math.max(0.18, y); d[i * 3 + 2] = 0.6 + q[1] * 0.45; }
      sugarFall.commit(); sugarFall.m.opacity = 0.85 * (1 - smooth(clamp01((t - K.s2) / 1))); }
    // steam
    for (const o of steams) { const span = 3.2, u = ((t * 0.32 + o.ph) % 1); o.s.position.set(o.x + Math.sin(t * 0.9 + o.sd) * 0.08 * u + u * 0.1, o.y + u * 1.4, o.z); const s = (0.15 + u * 0.7) * o.sc; o.s.scale.set(s, s * 1.3, 1); o.s.material.opacity = 0.28 * Math.sin(Math.PI * u); }

    // B: tags pop, riot puffs, shops topple
    popIn(tagMex.P, t, t1832 - 0.2); popIn(flagB.P, t, t1832 + 0.1); popIn(tagCap.P, t, tMex2 + 0.6); popIn(tagGulfB.P, t, K.s2 + 0.9);
    flagB.F.rotation.y = 0.12 * Math.sin(t * 1.8);
    shopsB.forEach((o) => { const u = smooth(clamp01((t - tJarah - o.k * 0.5) / 0.35)); o.S.rotation.z = o.dir * 1.4 * u; o.S.position.z !== undefined; });
    crumbsB.forEach((o) => { o.g.visible = t > tJarah + o.k * 0.6; });

    // C: window glow, crack, tag, coins stack up, single coin
    shopG.winGlow.intensity = 0.7 * smooth(clamp01((t - tMons + 0.3) / 0.8));
    shopG.crack.material.opacity = smooth(clamp01((t - tRusak) / 0.15)) * 0.85;
    tagTac.P.visible = false; // the shop sign already reads TACUBAYA
    const nC = 60, cA = tTuntut - 0.1, cB = tEnam3 + 0.05;
    coins.forEach((cn, i) => { const td = cA + (i / nC) * (cB - cA), u = clamp01((t - td) / 0.22); cn.visible = u > 0; cn.position.y = cn.userData.y + 0.9 * (1 - u * u); cn.position.x = stackX + cn.userData.dx; });
    popIn(tag60.P, t, tEnam3 - 0.1);
    oneCoin.visible = t > tRem2 - 1;
    popIn(tag1.P, t, tKurang - 0.1);
    oneCoin.position.y = 0.11 + 0.15 * pump(t, tKurang - 0.1, 0.15, 0.5);
    receipt.userData.paper.rotation.y = 0.15 * Math.sin(t * 0.7);

    // D: line items, total, stamp lands
    lineItems.forEach((m, i) => { m.material.opacity = smooth(clamp01((t - (tKeluh - 0.2) - i * 0.45) / 0.4)); });
    total.material.opacity = smooth(clamp01((t - tTagih + 0.2) / 0.45));
    { const tl = tRibu4 - 0.05, u = clamp01((t - (tl - 0.45)) / 0.45); const up = t < tl ? 1.6 * (1 - u * u) : Math.min(1.4, Math.max(0, (t - tl - 0.35) * 2.2)); rubber.position.z = 0.03 + up; rubber.visible = t > tl - 0.6 && t < tl + 1.4; stampInk.material.opacity = t > tl ? 0.92 : 0; }

    // E: ships sail in, blockade line pipes, puffs, flags
    ships.forEach((S, i) => { const u = eout(clamp01((t - tArmada + 0.3 - i * 0.22) / 1.6)); const h = S.userData.home, f = S.userData.from; S.position.set(f.x + (h.x - f.x) * u, f.y + (h.y - f.y) * u, h.z + 0.01 + 0.006 * Math.sin(t * 1.6 + i)); S.rotation.y = S.userData.ry + 0.03 * Math.sin(t * 1.1 + i); S.visible = u > 0.002; S.scale.setScalar(1.15 * Math.max(0.001, smooth(Math.min(1, u * 4)))); });
    blockDash.forEach((m, i) => { const u = clamp01((t - tBlok + 0.2 - i * 0.03) / 0.15); m.visible = u > 0; m.scale.setScalar(Math.max(0.001, u)); });
    for (const p of puffs) { const u = (t - p.t0) / 2.2; if (u < 0 || u > 1) { p.s.material.opacity = 0; continue; } const s = p.sz * (0.5 + 1.6 * eout(u)); p.s.scale.set(s, s, 1); p.s.position.set(p.x, p.y + u * 0.7, p.z); p.s.material.opacity = Math.min(1, 1.6 * (1 - u) * smooth(u / 0.06)); }
    for (const f of flashes) { const v = pump(t, f.t0, 0.04, 0.35); f.s.material.opacity = v; f.s.scale.setScalar(0.5 * v + 0.001); }
    fort.userData.flag.F.rotation.y = 0.15 * Math.sin(t * 2);
    popIn(tagFort.P, t, tBent - 0.2); popIn(tagVera.P, t, tVera - 0.25); popIn(tagGulfE.P, t, K.s5 + 0.7);
    frPicks.forEach((f, i) => popIn(f.P, t, tRebut - 0.1 + i * 0.18));
    popIn(mxPick.P, t, tNyat - 0.1); mxPick.F.rotation.y = 0.15 * Math.sin(t * 2.2);

    // F: flag lowers to half-mast
    { const u = smooth(clamp01((t - tMakam + 0.1) / 1.6)); flagF.F.position.y = 2.33 - 0.95 * u; flagF.F.rotation.y = 0.08 * Math.sin(t * 1.2); }

    // G: cheque, void stamp, arrow pipes, 1861 card
    cheque.material.opacity = 1; cheque.visible = t > tJanji - 0.5 || t < K.s7;
    voidS.material.opacity = t > tTak ? 0.95 : 0; voidS.scale.setScalar(1 + 0.35 * (1 - clamp01((t - tTak) / 0.18)));
    popIn(tagMed.P, t, tMed - 0.2);
    { const u = smooth(clamp01((t - tDua + 0.1) / Math.max(1, tSerbu - tDua - 0.2))); const n = arrowGeo.index.count; arrow.geometry.setDrawRange(0, Math.floor(n * u / 6) * 6); arrow.visible = u > 0.003; arrowHead.visible = u > 0.98; }
    popIn(tag22.P, t, tDua + 0.4); popIn(card61, t, tSerbu - 0.2, 0.4);

    // sugar sparkle around the target
    { const d = sparkle.pos, cc = sparkle.col;
      for (let i = 0; i < 260; i++) { const q = spSeed[i]; d[i * 3] = tgt.x + q[0] * 3.2; d[i * 3 + 1] = 0.05 + q[1] * 2.2 + Math.sin(t * 0.3 + q[3]) * 0.05; d[i * 3 + 2] = tgt.z + q[2] * 2.2; const tw = Math.pow(Math.max(0, Math.sin(t * q[4] + q[3])), 12); cc[i * 3] = cc[i * 3 + 1] = tw; cc[i * 3 + 2] = tw * 0.85; }
      sparkle.commit(); }
    comp.render();
  };
}
