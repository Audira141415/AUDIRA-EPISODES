// EP51 TRADINGTERMINAL: Dutch tulip mania (1634 → February 1637) as a 17th-century trading terminal.
// One continuous world: a dark walnut-and-brass trading desk with three amber CRT-like screens (ticker TULPEN,
// price chart, order book). On the desk a 3D candlestick chart made of glossy "tulip-stem" candles (green bodies on
// green stems with leaves; red when the price falls) climbs 1634 → Feb 1637 and crashes. Hero prop: a striped
// "broken" tulip (red flame on white) on a brass pedestal. Desk props: a bulb in soil tied to a contract scroll, a
// model fluyt ship, a closed book "MACKAY · 1841" that opens in s7, a brass AUDIRA plaque.
// Two side boards (miniature dioramas): left = a tavern ("college") where seated traders pass paper contracts
// hand to hand; right = the Haarlem auction of 3 February 1637 with a gavel, empty chairs and a price board that
// steps down. Everything is a pure function of t.
const FONTS = ['700 80px "Space Grotesk"', '600 80px "IBM Plex Mono"', '700 80px "IBM Plex Mono"', '700 80px "Playfair Display"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA TULPEN 1637 ƒ10.000"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, back, canvasTex, stage, envStrips } from "./lib3d.js";

const V3 = THREE.Vector3;
const GROT = '"Space Grotesk", Inter, sans-serif', MONO = '"IBM Plex Mono", Consolas, monospace', SERIF = '"Playfair Display", Georgia, serif';
const AMB = "#FFB000", GRN = "#2BE38A", RED = "#FF3B4E", CRE = "#F2E8D5";

function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
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
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------- price series: 20 rising candles (1634 → Feb 1637) + 4 crash candles ----------
const NC = 24, PEAK = 19;
const CLOSE = [];
{ const k = Math.log(100 / 3) / PEAK; for (let i = 0; i <= PEAK; i++) CLOSE.push(3 * Math.exp(k * i)); }
for (const [i, f] of [[5, 0.86], [11, 0.9], [16, 0.93]]) CLOSE[i] = CLOSE[i - 1] * f;
CLOSE.push(58, 27, 11, 5);
const OPEN = CLOSE.map((c, i) => (i === 0 ? 2 : CLOSE[i - 1]));
const PY = (p) => 0.22 + 3.25 * Math.pow(p / 100, 0.8);
const CX = (i) => -4.75 + i * 0.36;

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x07090b, exp: 0.9, bloom: [0.14, 0.4, 0.9], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.9;
  envStrips(r, scene, [
    [12, 4, 0xfff1dc, 3.0, 0, 10, 4], [6, 3, 0xffb24a, 2.4, -10, 4, 6], [8, 3, 0x7dffc0, 0.9, 10, 3, -6],
    [20, 2, 0xffd9a0, 1.2, 0, 1, -12], [20, 20, 0x1a120a, 0.6, 0, -10, 0]], 0x0a0806);
  scene.environmentIntensity = 0.35;
  scene.background = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#050608"); gr.addColorStop(0.55, "#0d0c0b"); gr.addColorStop(1, "#1b130b"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0x0b0a09, 22, 46);
  cam.near = 0.1; cam.far = 200; cam.updateProjectionMatrix();

  // ---------- lights: warm key spot over the desk, amber screen fill, green rim ----------
  scene.add(new THREE.HemisphereLight(0x9fb2c8, 0x2a1a0e, 0.35));
  const key = new THREE.SpotLight(0xffe1b8, 190, 40, 0.62, 0.55, 1.6);
  key.position.set(4, 11, 7); key.target.position.set(0, 0.5, 0.5);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const fill = new THREE.PointLight(0xffa830, 26, 14, 1.6); fill.position.set(0, 2.6, -2.4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8cffc8, 0.7); rim.position.set(-6, 5, -8); scene.add(rim);
  const sideL = new THREE.SpotLight(0xffd7a0, 120, 30, 0.7, 0.6, 1.6); sideL.position.set(-11, 9, 6); sideL.target.position.set(-11, 0, 0); sideL.castShadow = true; sideL.shadow.mapSize.set(1024, 1024); scene.add(sideL, sideL.target);
  const sideR = new THREE.SpotLight(0xffd7a0, 170, 30, 0.7, 0.6, 1.6); sideR.position.set(11, 9, 6); sideR.target.position.set(11, 0, 0); sideR.castShadow = true; sideR.shadow.mapSize.set(1024, 1024); scene.add(sideR, sideR.target);
  const tulipKey = new THREE.SpotLight(0xfff0e0, 12, 9, 0.35, 0.6, 1.5); tulipKey.position.set(5.5, 5.2, 4.6); tulipKey.target.position.set(3.6, 1.6, 1.6); scene.add(tulipKey, tulipKey.target);

  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const std = (color, rough = 0.6, metal = 0, ex = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...ex });
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...o });

  // ---------- billboard labels ----------
  const labels = [];
  function plate(text, { font = GROT, weight = 700, h = 1, color = "#fff", bg = "rgba(8,9,11,.86)", bd = AMB } = {}) {
    const CH = 160, fpx = Math.round(CH * 0.56);
    const mc = document.createElement("canvas").getContext("2d"); mc.font = `${weight} ${fpx}px ${font}`;
    const CW = Math.ceil(mc.measureText(text).width + CH * 0.8);
    const tex = canvasTex(CW, CH, (g, w, hh) => {
      g.clearRect(0, 0, w, hh);
      if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, hh - 8, 18); g.fill(); if (bd) { g.strokeStyle = bd; g.lineWidth = 6; g.stroke(); } }
      g.font = `${weight} ${fpx}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(text, w / 2, hh / 2 + 4);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(h * CW / CH, h), basic({ map: tex, fog: false, toneMapped: false, depthTest: false }));
    m.renderOrder = 9; m.visible = false; scene.add(m); labels.push(m); return m;
  }
  const showLab = (m, k, pos, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.scale.setScalar(Math.max(0.001, s * (0.6 + 0.4 * back(clamp01(k))))); };

  // ---------- textures ----------
  const woodT = (seed, base, dark) => canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const q = mulberry(seed);
    for (let i = 0; i < 240; i++) { const y = q() * h, a = 0.05 + q() * 0.14; g.strokeStyle = `rgba(${dark},${a})`; g.lineWidth = 1 + q() * 3; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + Math.sin(x * 0.03 + i * 3) * 1.5); g.stroke(); }
    for (let i = 0; i < 6; i++) { const x = q() * w, y = q() * h; const gr = g.createRadialGradient(x, y, 2, x, y, 30 + q() * 30); gr.addColorStop(0, `rgba(${dark},.35)`); gr.addColorStop(1, `rgba(${dark},0)`); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 60, 16, 0, 0, 6.3); g.fill(); }
  });
  const deskT = woodT(3, "#3a2416", "18,9,4"); deskT.wrapS = deskT.wrapT = THREE.RepeatWrapping; deskT.repeat.set(1.4, 1);
  const lightWoodT = woodT(7, "#6a4428", "30,16,6");
  const soilT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#2b1d14"; g.fillRect(0, 0, w, w); const q = mulberry(9); for (let i = 0; i < 3000; i++) { g.fillStyle = q() < 0.5 ? "rgba(70,48,32,.6)" : "rgba(12,8,5,.6)"; g.fillRect(q() * w, q() * w, 1 + q() * 3, 1 + q() * 3); } });
  const paperT = (text, sub) => canvasTex(512, 360, (g, w, h) => {
    g.fillStyle = "#efe3c4"; g.fillRect(0, 0, w, h); const q = mulberry(11);
    for (let i = 0; i < 1500; i++) { g.fillStyle = q() < 0.5 ? "rgba(140,110,60,.08)" : "rgba(255,255,255,.12)"; g.fillRect(q() * w, q() * h, 1 + q() * 4, 1); }
    g.fillStyle = "#3b2512"; g.font = `700 64px ${SERIF}`; g.textAlign = "center"; g.fillText(text, w / 2, 96);
    g.strokeStyle = "rgba(59,37,18,.55)"; g.lineWidth = 3; for (let y = 140; y < h - 50; y += 32) { g.beginPath(); g.moveTo(50, y); g.lineTo(w - 50 - (y % 3) * 20, y); g.stroke(); }
    if (sub) { g.font = `600 30px ${MONO}`; g.fillText(sub, w / 2, h - 30); }
    g.fillStyle = "#9a1d1d"; g.beginPath(); g.arc(w - 70, h - 80, 30, 0, 6.3); g.fill();
  });
  const AO = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * 0.18, w / 2, w / 2, w * 0.5); gr.addColorStop(0, "rgba(0,0,0,.72)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const contact = (x, y, z, sx, sz, o = 0.8) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), basic({ map: AO, opacity: o, polygonOffset: true, polygonOffsetFactor: -4 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.004, z); m.renderOrder = 1; scene.add(m); return m; };

  // ---------- materials ----------
  const brass = phys({ color: 0xc9a45c, roughness: 0.28, metalness: 1, clearcoat: 0.3 });
  const brassDark = std(0x7a5a2a, 0.45, 1);
  const walnut = phys({ color: 0xffffff, map: deskT, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4 });
  const darkWood = std(0x2a1a10, 0.6, 0, { map: lightWoodT });
  const boardWood = phys({ color: 0xb08060, map: lightWoodT, roughness: 0.55, clearcoat: 0.3 });
  const paperM = std(0xefe3c4, 0.85);

  // ================= DESK =================
  add(new THREE.BoxGeometry(12.6, 0.28, 6.4), walnut, 0, -0.14, 0);
  for (const z of [-3.2, 3.2]) add(new THREE.BoxGeometry(12.7, 0.08, 0.08), brass, 0, 0.0, z);
  for (const x of [-6.3, 6.3]) add(new THREE.BoxGeometry(0.08, 0.08, 6.5), brass, x, 0.0, 0);
  add(new THREE.BoxGeometry(12.2, 1.4, 0.2), darkWood, 0, -0.98, 3.0);
  // brass AUDIRA plaque on the desk apron
  const plaqueT = canvasTex(1024, 220, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#e9c97f"); gr.addColorStop(0.5, "#b88c3f"); gr.addColorStop(1, "#7f5c22"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5a3e14"; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#3a2608"; g.font = `700 92px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, 92);
    g.font = `600 40px ${MONO}`; g.fillText("TULPEN-TERMINAL · 1637", w / 2, 170);
  });
  const plaque = add(new THREE.BoxGeometry(2.6, 0.56, 0.05), [brassDark, brassDark, brassDark, brassDark, phys({ map: plaqueT, roughness: 0.32, metalness: 0.85 }), brassDark], 0, -0.62, 3.12);

  // ================= SCREEN BANK =================
  const SW = 1024, SH = 640;
  const screens = [];
  function screen(x, ry, w) {
    const g = new THREE.Group(); g.position.set(x, 2.35, -3.0); g.rotation.y = ry; scene.add(g);
    const h = w * SH / SW;
    add(new THREE.BoxGeometry(w + 0.36, h + 0.36, 0.3), darkWood, 0, 0, -0.18, g);
    for (const [bx, by, bw, bh] of [[0, h / 2 + 0.14, w + 0.36, 0.06], [0, -h / 2 - 0.14, w + 0.36, 0.06], [w / 2 + 0.14, 0, 0.06, h + 0.36], [-w / 2 - 0.14, 0, 0.06, h + 0.36]]) add(new THREE.BoxGeometry(bw, bh, 0.06), brass, bx, by, 0, g);
    const cv = document.createElement("canvas"); cv.width = SW; cv.height = SH;
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }));
    m.position.z = 0.02; g.add(m);
    // glass front for reflections
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), phys({ color: 0x000000, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.18, clearcoat: 1 })); gl.position.z = 0.05; g.add(gl);
    add(new THREE.CylinderGeometry(0.12, 0.2, 1.1, 12), brass, 0, -h / 2 - 0.65, -0.18, g);
    const s = { g, cv, ctx: cv.getContext("2d"), tx }; screens.push(s); return s;
  }
  const scrL = screen(-4.35, 0.32, 4.1), scrM = screen(0, 0, 4.3), scrR = screen(4.35, -0.32, 4.1);
  // brass AUDIRA nameplate on top of the middle screen
  const topT = canvasTex(768, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f0d08a"); gr.addColorStop(1, "#8a6526"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#2c1c06"; g.font = `700 70px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA · BEURS", w / 2, h / 2 + 4); });
  add(new THREE.BoxGeometry(2.6, 0.42, 0.06), [brassDark, brassDark, brassDark, brassDark, phys({ map: topT, roughness: 0.3, metalness: 0.85 }), brassDark], 0, 2.35 + 4.3 * SH / SW / 2 + 0.42, -2.9);

  // ================= CANDLESTICK CHART (tulip-stem candles) =================
  const ZC = -1.15;
  const gGreen = phys({ color: 0x1fd27d, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x0a5a30, emissiveIntensity: 0.55 });
  const gRed = phys({ color: 0xff3b4e, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x6a0a14, emissiveIntensity: 0.6 });
  const gGold = phys({ color: 0xffc14a, roughness: 0.15, clearcoat: 1, emissive: 0x6a4000, emissiveIntensity: 0.7 });
  const stemM = std(0x2f8a3a, 0.5);
  const leafM = phys({ color: 0x3fa548, roughness: 0.45, clearcoat: 0.4, side: THREE.DoubleSide });
  const leafG = new THREE.SphereGeometry(0.1, 10, 8); leafG.scale(0.45, 1.6, 0.18); leafG.translate(0, 0.14, 0);
  const CAND = [];
  for (let i = 0; i < NC; i++) {
    const g = new THREE.Group(); g.position.set(CX(i), 0, ZC); scene.add(g);
    const up = CLOSE[i] >= OPEN[i];
    const lo = Math.min(OPEN[i], CLOSE[i]), hi = Math.max(OPEN[i], CLOSE[i]);
    const y0 = PY(lo), y1 = PY(hi), wl = PY(lo * 0.9), wh = PY(hi * 1.06);
    const stem = add(new THREE.CylinderGeometry(0.022, 0.022, 1, 6), stemM, 0, 0, 0, g);
    const body = add(new THREE.CapsuleGeometry(0.115, 1, 6, 14), i === PEAK ? gGold : up ? gGreen : gRed, 0, 0, 0, g);
    const leaves = [];
    for (const s of [-1, 1]) { const l = add(leafG, leafM, 0, 0, 0, g); l.rotation.z = s * 0.55; l.rotation.y = s * 0.4; leaves.push(l); }
    CAND.push({ g, stem, body, leaves, y0, y1: Math.max(y1, y0 + 0.06), wl, wh, up });
  }
  contact(0, 0, ZC, 10.4, 1.4, 0.55);
  // axis: brass rail with year tags
  add(new THREE.BoxGeometry(9.2, 0.04, 0.04), brass, -0.5, 0.02, ZC + 0.32);
  const yearTag = (txt, x) => { const t = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#0b0c0e"; g.fillRect(0, 0, w, h); g.strokeStyle = AMB; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = AMB; g.font = `700 50px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 2); }); const m = add(new THREE.BoxGeometry(0.62, 0.23, 0.04), [brassDark, brassDark, brassDark, brassDark, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), brassDark], x, 0.13, ZC + 0.42); m.rotation.x = -0.35; return m; };
  yearTag("1634", CX(0)); yearTag("1635", CX(7)); yearTag("1636", CX(13)); const febTag = yearTag("1637", CX(PEAK));

  // peak crown: small striped tulip on the gold candle
  // ================= TULIP (shared builder) =================
  const flameT = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#fff6e8"); gr.addColorStop(1, "#ffffff"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const q = mulberry(17);
    for (let i = 0; i < 9; i++) {
      const cx = w * (0.06 + 0.88 * (i / 8)) + (q() - 0.5) * 18, ww = 10 + q() * 22;
      g.fillStyle = `rgba(${200 + Math.round(q() * 30)},${16 + Math.round(q() * 20)},${30 + Math.round(q() * 20)},.95)`;
      g.beginPath(); g.moveTo(cx - ww, h);
      for (let y = h; y > h * (0.05 + q() * 0.2); y -= 16) g.lineTo(cx - ww * (y / h) + Math.sin(y * 0.05 + i) * 7, y);
      g.lineTo(cx + Math.sin(i) * 6, h * 0.04);
      for (let y = h * 0.1; y <= h; y += 16) g.lineTo(cx + ww * (y / h) + Math.sin(y * 0.06 + i * 2) * 7, y);
      g.closePath(); g.fill();
      g.strokeStyle = "rgba(150,6,24,.5)"; g.lineWidth = 2; g.stroke();
    }
    const gb = g.createLinearGradient(0, h, 0, h * 0.75); gb.addColorStop(0, "rgba(120,20,30,.65)"); gb.addColorStop(1, "rgba(120,20,30,0)"); g.fillStyle = gb; g.fillRect(0, h * 0.75, w, h * 0.25);
  });
  const petalM = phys({ color: 0xcfc6bc, map: flameT, roughness: 0.48, sheen: 0.3, sheenColor: 0xffe0e0, sheenRoughness: 0.5, side: THREE.DoubleSide, clearcoat: 0.15 });
  function petalGeo(R, inner) {
    const ph = (Math.PI * 2) / 3 * 0.92;
    const g = new THREE.SphereGeometry(R, 18, 20, 0, ph, Math.PI * 0.32, Math.PI * 0.68);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const u = uv.getX(i), v = uv.getY(i); // v: 1 at top edge
      let y = p.getY(i);
      const tip = Math.sin(Math.PI * u);
      if (y > -R * 0.2) y += (y + R * 0.2) * 0.9 * tip * tip;
      const pinch = 1 - 0.25 * (1 - tip) * clamp01((y + R * 0.2) / R);
      p.setXYZ(i, p.getX(i) * pinch * (inner ? 0.86 : 1), y * 1.35, p.getZ(i) * pinch * (inner ? 0.86 : 1));
    }
    g.computeVertexNormals(); return g;
  }
  function tulip(scale) {
    const T = new THREE.Group();
    const stem = add(new THREE.CylinderGeometry(0.035, 0.045, 1.3, 10), stemM, 0, 0.65, 0, T);
    const leafBig = new THREE.SphereGeometry(0.2, 14, 12); leafBig.scale(0.7, 3.2, 0.18);
    for (const s of [-1, 1]) { const l = add(leafBig, leafM, s * 0.12, 0.5, 0, T); l.rotation.z = -s * 0.28; l.rotation.y = s * 0.3; }
    const head = new THREE.Group(); head.position.y = 1.55; T.add(head);
    const R = 0.26;
    for (let k = 0; k < 3; k++) { const m = add(petalGeo(R, false), petalM, 0, 0, 0, head); m.rotation.y = k * Math.PI * 2 / 3; }
    for (let k = 0; k < 3; k++) { const m = add(petalGeo(R, true), petalM, 0, 0.02, 0, head); m.rotation.y = k * Math.PI * 2 / 3 + Math.PI / 3; }
    add(new THREE.SphereGeometry(0.06, 10, 8), std(0x2a1a10, 0.6), 0, -0.1, 0, head);
    T.scale.setScalar(scale); return { T, head };
  }
  // hero: striped tulip on a brass pedestal
  const HERO = new THREE.Group(); HERO.position.set(3.65, 0, 1.55); scene.add(HERO);
  add(new THREE.CylinderGeometry(0.55, 0.62, 0.14, 40), darkWood, 0, 0.07, 0, HERO);
  add(new THREE.CylinderGeometry(0.34, 0.44, 0.62, 40), brass, 0, 0.45, 0, HERO);
  add(new THREE.CylinderGeometry(0.46, 0.4, 0.08, 40), brass, 0, 0.8, 0, HERO);
  add(new THREE.CylinderGeometry(0.3, 0.22, 0.3, 24), std(0x6b3a22, 0.75), 0, 0.98, 0, HERO); // clay pot
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 24), std(0x2b1d14, 1, 0, { map: soilT }), 0, 1.12, 0, HERO);
  const hero = tulip(1.0); hero.T.position.y = 1.1; HERO.add(hero.T);
  contact(3.65, 0, 1.55, 1.8, 1.8, 0.85);
  // peak crown tulip
  const crown = tulip(0.42); scene.add(crown.T);

  // ================= VIRUS particles (s3) =================
  const virG = new THREE.IcosahedronGeometry(0.05, 1);
  const virM = phys({ color: 0xb06cff, emissive: 0x5a1aa0, emissiveIntensity: 1.2, roughness: 0.3 });
  const spikeG = new THREE.ConeGeometry(0.012, 0.05, 5);
  const VIR = [];
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group(); add(virG, virM, 0, 0, 0, g);
    for (let k = 0; k < 10; k++) { const s = new THREE.Mesh(spikeG, virM); const d = new V3(hsh(i, k) - 0.5, hsh(k, i) - 0.5, hsh(i + k, 3) - 0.5).normalize(); s.position.copy(d).multiplyScalar(0.06); s.quaternion.setFromUnitVectors(new V3(0, 1, 0), d); g.add(s); }
    scene.add(g); VIR.push(g);
  }

  // ================= BULB + CONTRACT SCROLL =================
  const BULB = new THREE.Group(); BULB.position.set(-3.3, 0, 1.65); scene.add(BULB);
  add(new THREE.BoxGeometry(1.5, 0.22, 1.0), boardWood, 0, 0.11, 0, BULB);
  const soil = add(new THREE.BoxGeometry(1.36, 0.06, 0.86), std(0xffffff, 1, 0, { map: soilT }), 0, 0.23, 0, BULB);
  const bulbPts = []; for (let i = 0; i <= 20; i++) { const a = i / 20; bulbPts.push(new THREE.Vector2(Math.max(0.005, 0.32 * Math.sin(Math.PI * Math.pow(a, 0.8)) * (1 - 0.25 * a)), a * 0.62)); }
  const bulbT = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#5c3a1e"); gr.addColorStop(0.6, "#a8743e"); gr.addColorStop(1, "#d9b07a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const q = mulberry(23); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(60,34,14,${0.2 + q() * 0.3})`; g.lineWidth = 1 + q() * 2; const x = q() * w; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + (q() - 0.5) * 30, h / 2, w / 2 + (x - w / 2) * 0.2, 0); g.stroke(); } });
  const bulb = add(new THREE.LatheGeometry(bulbPts, 32), phys({ map: bulbT, roughness: 0.6, sheen: 0.4, sheenColor: 0xffe2b0 }), -0.15, 0.12, 0, BULB);
  add(new THREE.ConeGeometry(0.05, 0.25, 8), std(0x7aa54a, 0.6), -0.15, 0.85, 0, BULB);
  for (let k = 0; k < 7; k++) { const rr = add(new THREE.CylinderGeometry(0.008, 0.004, 0.22, 4), std(0xd8c6a0, 0.9), -0.15 + (hsh(k, 1) - 0.5) * 0.2, 0.08, (hsh(k, 2) - 0.5) * 0.2, BULB); rr.rotation.set((hsh(k, 3) - 0.5) * 1.4, 0, (hsh(k, 4) - 0.5) * 1.4); }
  // scroll: rolled part + unrolled sheet "KONTRAK", ribbon to the bulb
  const scrollG = new THREE.Group(); scrollG.position.set(0.38, 0.26, 0.15); scrollG.rotation.y = -0.5; BULB.add(scrollG);
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 18), paperM, 0, 0.07, -0.26, scrollG).rotation.z = Math.PI / 2;
  const sheet = add(new THREE.PlaneGeometry(0.62, 0.48), std(0xffffff, 0.85, 0, { map: paperT("KONTRAK", "1 UMBI · DIKIRIM NANTI"), side: THREE.DoubleSide }), 0, 0.01, 0, scrollG); sheet.rotation.x = -Math.PI / 2;
  const ribbon = add(new THREE.BoxGeometry(0.5, 0.012, 0.03), std(0xa31a1a, 0.5), -0.25, 0.04, -0.1, scrollG); ribbon.rotation.y = 0.3;
  contact(-3.3, 0, 1.65, 2.2, 1.6, 0.7);

  // ================= SHIP MODEL (fluyt) =================
  const SHIP = new THREE.Group(); SHIP.position.set(1.25, 0, 2.05); SHIP.rotation.y = -0.6; scene.add(SHIP);
  add(new THREE.BoxGeometry(0.9, 0.06, 0.34), brass, 0, 0.03, 0, SHIP);
  const hullShape = new THREE.Shape(); hullShape.moveTo(-0.62, 0.42); hullShape.quadraticCurveTo(-0.6, 0.06, -0.2, 0.06); hullShape.lineTo(0.42, 0.06); hullShape.quadraticCurveTo(0.7, 0.12, 0.74, 0.36); hullShape.lineTo(-0.62, 0.42);
  const hullG = new THREE.ExtrudeGeometry(hullShape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 2 }); hullG.translate(0, 0, -0.15);
  add(hullG, std(0x5a3418, 0.55, 0, { map: lightWoodT }), 0, 0.06, 0, SHIP);
  const sailM = std(0xeee2c4, 0.8, 0, { side: THREE.DoubleSide });
  for (const [x, hgt] of [[-0.3, 0.95], [0.1, 1.15], [0.45, 0.85]]) {
    add(new THREE.CylinderGeometry(0.012, 0.016, hgt, 6), std(0x3a2414, 0.7), x, 0.45 + hgt / 2, 0, SHIP);
    for (const [yy, ww] of [[0.62, 0.42], [0.95, 0.32]]) if (yy < hgt + 0.3) { const s = add(new THREE.PlaneGeometry(ww, 0.28, 6, 2), sailM, x, 0.3 + yy * hgt / 1.1, 0.03, SHIP); s.rotation.y = Math.PI / 2 - 0.2; }
  }
  const flagS = add(new THREE.PlaneGeometry(0.18, 0.12), new THREE.MeshStandardMaterial({ map: canvasTex(48, 48, (g) => { g.fillStyle = "#e0662a"; g.fillRect(0, 0, 48, 16); g.fillStyle = "#fff"; g.fillRect(0, 16, 48, 16); g.fillStyle = "#1f3f8a"; g.fillRect(0, 32, 48, 16); }), side: THREE.DoubleSide, roughness: 0.8 }), 0.19, 1.62, 0, SHIP); flagS.rotation.y = Math.PI / 2 - 0.2;
  contact(1.25, 0, 2.05, 1.6, 0.9, 0.6);

  // ================= BOOK "MACKAY · 1841" =================
  const BOOK = new THREE.Group(); BOOK.position.set(-1.05, 0, 2.0); BOOK.rotation.y = 0.25; scene.add(BOOK);
  const coverT = canvasTex(512, 640, (g, w, h) => { g.fillStyle = "#5b1a14"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d8b465"; g.lineWidth = 8; g.strokeRect(26, 26, w - 52, h - 52); g.fillStyle = "#e8c97a"; g.textAlign = "center"; g.font = `700 64px ${SERIF}`; g.fillText("MACKAY", w / 2, 250); g.font = `700 96px ${SERIF}`; g.fillText("1841", w / 2, 380); g.font = `600 30px ${MONO}`; g.fillText("POPULAR DELUSIONS", w / 2, 480); });
  const pagesM = std(0xe9dcbc, 0.9);
  add(new THREE.BoxGeometry(0.8, 0.12, 1.0), pagesM, 0, 0.08, 0, BOOK);
  add(new THREE.BoxGeometry(0.84, 0.02, 1.04), std(0x5b1a14, 0.6), 0, 0.01, 0, BOOK);
  const lid = new THREE.Group(); lid.position.set(-0.42, 0.15, 0); BOOK.add(lid);
  add(new THREE.BoxGeometry(0.84, 0.02, 1.04), [std(0x5b1a14, 0.6), std(0x5b1a14, 0.6), phys({ map: coverT, roughness: 0.5, clearcoat: 0.3 }), std(0x5b1a14, 0.6), std(0x5b1a14, 0.6), std(0x5b1a14, 0.6)], 0.42, 0, 0, lid);
  const pageText = add(new THREE.PlaneGeometry(0.72, 0.9), std(0xbdb09a, 0.95, 0, { map: paperT("BANGKRUT?", "MACKAY 1841") }), 0, 0.145, 0, BOOK); pageText.rotation.x = -Math.PI / 2;
  contact(-1.05, 0, 2.0, 1.4, 1.5, 0.6);

  // ================= PEOPLE (generic 17th-c. traders) =================
  const skinA = std(0xe2b08a, 0.55), skinB = std(0xb98262, 0.55), eyeM = std(0x111111, 0.3), hatM = std(0x18140f, 0.7), collarM = std(0xf4efe4, 0.7);
  function person(coat, skin, seated) {
    const G = new THREE.Group();
    const cM = std(coat, 0.75);
    const pM = std(0x2a2420, 0.8);
    // torso: shoulders wider than hips
    add(new THREE.CylinderGeometry(0.2, 0.14, 0.5, 12), cM, 0, seated ? 0.62 : 0.98, 0, G);
    add(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 12), pM, 0, seated ? 0.38 : 0.74, 0, G);
    const col = add(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 16), collarM, 0, seated ? 0.88 : 1.24, 0, G);
    const hd = new THREE.Group(); hd.position.y = seated ? 1.03 : 1.39; G.add(hd);
    add(new THREE.SphereGeometry(0.13, 16, 12), skin, 0, 0, 0, hd);
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.018, 8, 6), eyeM, s * 0.045, 0.02, 0.118, hd);
    add(new THREE.BoxGeometry(0.06, 0.012, 0.01), std(0x6a2a20, 0.6), 0, -0.05, 0.122, hd);
    add(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 14), hatM, 0, 0.15, 0, hd);
    add(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20), hatM, 0, 0.09, 0, hd);
    const arm = (s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.22, seated ? 0.82 : 1.18, 0); G.add(sh);
      add(new THREE.CylinderGeometry(0.05, 0.045, 0.26, 8), cM, 0, -0.13, 0, sh);
      const el = new THREE.Group(); el.position.y = -0.26; sh.add(el);
      add(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), cM, 0, -0.12, 0, el);
      add(new THREE.SphereGeometry(0.045, 8, 6), skin, 0, -0.26, 0, el);
      return { sh, el };
    };
    const aL = arm(-1), aR = arm(1);
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * 0.08, seated ? 0.36 : 0.7, 0); G.add(hip);
      add(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 8), pM, 0, -0.16, 0, hip);
      const kn = new THREE.Group(); kn.position.y = -0.32; hip.add(kn);
      add(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 8), std(0xd9d2c2, 0.8), 0, -0.16, 0, kn);
      add(new THREE.BoxGeometry(0.09, 0.05, 0.16), std(0x1a1410, 0.6), 0, -0.33, 0.04, kn);
      if (seated) { hip.rotation.x = -1.45; kn.rotation.x = 1.45; } else { hip.rotation.x = -0.08; kn.rotation.x = 0.12; }
    }
    return { G, aL, aR, hd };
  }

  // ================= LEFT BOARD: TAVERN (s4) =================
  const TAV = new THREE.Group(); TAV.position.set(-11, 0, 0); scene.add(TAV);
  add(new THREE.BoxGeometry(6.6, 0.3, 5.2), boardWood, 0, -0.15, 0, TAV);
  for (const z of [-2.6, 2.6]) add(new THREE.BoxGeometry(6.7, 0.06, 0.06), brass, 0, 0.0, z, TAV);
  // back wall with window + "KEDAI" sign
  const wallT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#4a2e1c"; g.fillRect(0, 0, w, h); const q = mulberry(29); for (let y = 0; y < h; y += 22) for (let x = (y / 22 % 2) * 20; x < w; x += 40) { const v = 0.75 + q() * 0.35; g.fillStyle = `rgb(${Math.round(120 * v)},${Math.round(56 * v)},${Math.round(36 * v)})`; g.fillRect(x + 1, y + 1, 38, 20); } });
  add(new THREE.BoxGeometry(6.4, 2.6, 0.2), std(0xffffff, 0.85, 0, { map: wallT }), 0, 1.3, -2.4, TAV);
  const signT = canvasTex(512, 160, (g, w, h) => { g.fillStyle = "#1c120a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d8b465"; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = "#f0d08a"; g.font = `700 64px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("KEDAI · 1636", w / 2, h / 2 + 4); });
  add(new THREE.BoxGeometry(1.9, 0.6, 0.06), [darkWood, darkWood, darkWood, darkWood, std(0xffffff, 0.6, 0, { map: signT }), darkWood], 0, 2.2, -2.26, TAV);
  const winM = basic({ color: 0xffc070, opacity: 0.9, toneMapped: false, depthWrite: true }); winM.transparent = false;
  for (const x of [-2.2, 2.2]) { add(new THREE.PlaneGeometry(0.9, 0.9), winM, x, 1.4, -2.29, TAV); for (const [bw, bh] of [[0.9, 0.04], [0.04, 0.9]]) add(new THREE.BoxGeometry(bw, bh, 0.03), darkWood, x, 1.4, -2.27, TAV); }
  const lampL = new THREE.PointLight(0xffa040, 9, 6, 1.6); lampL.position.set(0, 1.5, -0.4); TAV.add(lampL);
  add(new THREE.SphereGeometry(0.1, 12, 10), basic({ color: 0xffd28a, toneMapped: false, opacity: 1 }), 0, 1.5, -0.4, TAV);
  const TRADERS = [];
  const coats = [0x3a4a6a, 0x6a2a2a, 0x2f4a32, 0x5a4630];
  for (const [tx, tz] of [[-1.5, 0.2], [1.5, 0.2]]) {
    add(new THREE.CylinderGeometry(0.7, 0.7, 0.07, 28), boardWood, tx, 0.72, tz, TAV);
    add(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 10), darkWood, tx, 0.36, tz, TAV);
    for (const k of [0, 1]) add(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 10), std(0x8a8a86, 0.3, 0.8), tx + (k ? 0.25 : -0.3), 0.82, tz + 0.1, TAV);
    contact(tx - 11, 0, tz, 1.8, 1.8, 0.6);
    for (const s of [-1, 1]) {
      const P = person(coats[TRADERS.length], TRADERS.length % 2 ? skinB : skinA, true);
      P.G.position.set(tx + s * 0.95, 0, tz); P.G.rotation.y = -s * Math.PI / 2; TAV.add(P.G);
      add(new THREE.BoxGeometry(0.36, 0.05, 0.36), darkWood, tx + s * 0.95, 0.36, tz, TAV);
      P.aR.sh.rotation.x = -1.1; P.aR.el.rotation.x = -0.5; P.aL.sh.rotation.x = -0.4; P.aL.el.rotation.x = -0.9;
      TRADERS.push({ P, x: tx + s * 0.95, z: tz, s });
    }
  }
  const contractT = paperT("KONTRAK", "TULP");
  const CONTRACTS = [];
  for (let i = 0; i < 6; i++) { const m = add(new THREE.PlaneGeometry(0.34, 0.24), std(0xffffff, 0.85, 0, { map: contractT, side: THREE.DoubleSide }), 0, -5, 0, TAV); m.castShadow = true; CONTRACTS.push(m); }

  // ================= RIGHT BOARD: HAARLEM AUCTION (s6) =================
  const AUC = new THREE.Group(); AUC.position.set(11, 0, 0); scene.add(AUC);
  add(new THREE.BoxGeometry(6.6, 0.3, 5.2), boardWood, 0, -0.15, 0, AUC);
  for (const z of [-2.6, 2.6]) add(new THREE.BoxGeometry(6.7, 0.06, 0.06), brass, 0, 0.0, z, AUC);
  add(new THREE.BoxGeometry(6.4, 3.0, 0.2), std(0xffffff, 0.85, 0, { map: wallT }), 0, 1.5, -2.4, AUC);
  // price board (canvas, steps down)
  const pbC = document.createElement("canvas"); pbC.width = 768; pbC.height = 512; const pbX = pbC.getContext("2d");
  const pbT = new THREE.CanvasTexture(pbC); pbT.colorSpace = THREE.SRGBColorSpace;
  add(new THREE.BoxGeometry(3.3, 2.2, 0.1), darkWood, 0.6, 1.75, -2.24, AUC);
  const pb = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshBasicMaterial({ map: pbT, toneMapped: false })); pb.position.set(0.6, 1.75, -2.18); AUC.add(pb);
  const ausign = canvasTex(512, 140, (g, w, h) => { g.fillStyle = "#1c120a"; g.fillRect(0, 0, w, h); g.fillStyle = "#f0d08a"; g.font = `700 58px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("HAARLEM · 1637", w / 2, h / 2 + 4); });
  add(new THREE.BoxGeometry(2.0, 0.52, 0.06), [darkWood, darkWood, darkWood, darkWood, std(0xffffff, 0.6, 0, { map: ausign }), darkWood], 0.6, 3.15, -2.24, AUC);
  // lectern + auctioneer
  add(new THREE.BoxGeometry(0.8, 0.95, 0.55), darkWood, -1.7, 0.48, -0.7, AUC);
  add(new THREE.BoxGeometry(0.9, 0.06, 0.65), boardWood, -1.7, 0.98, -0.7, AUC).rotation.x = 0.15;
  const auct = person(0x24242a, skinA, false); auct.G.position.set(-1.7, 0, -1.3); auct.G.rotation.y = 0.35; AUC.add(auct.G);
  const gavel = new THREE.Group(); auct.aR.el.add(gavel); gavel.position.y = -0.28;
  add(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), darkWood, 0, -0.08, 0.08, gavel).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), darkWood, 0, -0.08, 0.22, gavel).rotation.z = Math.PI / 2;
  // display stand with a potted tulip
  add(new THREE.CylinderGeometry(0.3, 0.36, 0.7, 24), brass, -0.4, 0.35, -0.9, AUC);
  const auTulip = tulip(0.55); auTulip.T.position.set(-0.4, 0.7, -0.9); AUC.add(auTulip.T);
  // rows of empty chairs
  const chairM = std(0x5a3418, 0.6, 0, { map: lightWoodT });
  for (let rr = 0; rr < 2; rr++) for (let c = 0; c < 4; c++) {
    const cg = new THREE.Group(); cg.position.set(-0.2 + c * 0.75, 0, 0.7 + rr * 0.9); cg.rotation.y = Math.PI + 0.15; AUC.add(cg);
    add(new THREE.BoxGeometry(0.42, 0.05, 0.42), chairM, 0, 0.42, 0, cg);
    for (const [lx, lz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) add(new THREE.BoxGeometry(0.04, 0.42, 0.04), chairM, lx, 0.21, lz, cg);
    add(new THREE.BoxGeometry(0.42, 0.5, 0.04), chairM, 0, 0.7, 0.19, cg);
    contact(11 - 0.2 + c * 0.75, 0, 0.7 + rr * 0.9, 0.8, 0.8, 0.5);
  }
  contact(9.3, 0, -1.0, 1.4, 1.4, 0.6);

  // ================= 3D labels =================
  const labPrice = plate("ƒ10.000", { font: MONO, weight: 700, color: AMB, h: 0.42 });
  const labVirus = plate("VIRUS", { font: MONO, weight: 700, color: "#d8b0ff", bd: "#b06cff", h: 0.26 });
  const labBubble = plate("GELEMBUNG HARGA", { font: MONO, weight: 700, color: GRN, bd: GRN, h: 0.34 });
  const labNo = plate("TIDAK ADA PEMBELI", { font: MONO, weight: 700, color: "#fff", bg: "rgba(160,20,30,.92)", bd: "#ffb0b8", h: 0.36 });

  // ================= screen drawing =================
  const scan = (g) => { g.fillStyle = "rgba(0,0,0,.18)"; for (let y = 0; y < SH; y += 4) g.fillRect(0, y, SW, 2); const gr = g.createRadialGradient(SW / 2, SH / 2, SH * 0.3, SW / 2, SH / 2, SW * 0.65); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.55)"); g.fillStyle = gr; g.fillRect(0, 0, SW, SH); };
  const head = (g, txt, col = AMB) => { g.fillStyle = "#06080a"; g.fillRect(0, 0, SW, SH); g.fillStyle = col; g.fillRect(0, 0, SW, 64); g.fillStyle = "#06080a"; g.font = `700 40px ${MONO}`; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(txt, 22, 34); };
  function drawL(t, px) {
    const g = scrL.ctx; head(g, "TULPEN ▲ KURS");
    const rows = ["SEMPER AUGUSTUS", "VICEROY", "ROOD-WIT", "GEEL-ROOD", "PAARS-WIT", "ROOS"];
    const crash = px.crash;
    rows.forEach((n, i) => {
      const y = 112 + i * 84; g.fillStyle = i % 2 ? "rgba(255,176,0,.06)" : "rgba(255,176,0,.02)"; g.fillRect(16, y - 34, SW - 32, 76);
      g.font = `600 38px ${MONO}`; g.textAlign = "left"; g.fillStyle = CRE; g.fillText(n, 34, y + 4);
      const up = !crash; g.fillStyle = up ? GRN : RED; g.textAlign = "right"; g.fillText(up ? "▲" : "▼", SW - 34, y + 4);
      // sparkline
      g.strokeStyle = up ? GRN : RED; g.lineWidth = 4; g.beginPath();
      for (let k = 0; k < 18; k++) { const x = 560 + k * 20, v = up ? k / 17 * px.level : (1 - k / 17) * 0.9 + 0.05; const yy = y + 22 - v * 40 + Math.sin(k * 1.7 + i) * 3; k ? g.lineTo(x, yy) : g.moveTo(x, yy); }
      g.stroke();
    });
    scan(g); scrL.tx.needsUpdate = true;
  }
  function drawM(t, px, mapK) {
    const g = scrM.ctx;
    if (mapK > 0.01) {
      head(g, "RUTE TULIP · ABAD KE-16–17");
      // schematic route (not to scale): Konstantinopel → Wina → Belanda
      const P = [[820, 520, "KONSTANTINOPEL", "Kesultanan Utsmani"], [520, 330, "WINA", "1554"], [250, 170, "BELANDA", "abad ke-17"]];
      g.strokeStyle = "rgba(255,176,0,.18)"; g.lineWidth = 2; for (let x = 0; x < SW; x += 64) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x, SH); g.stroke(); } for (let y = 64; y < SH; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(SW, y); g.stroke(); }
      const k = clamp01(mapK);
      g.setLineDash([18, 14]); g.lineDashOffset = -t * 40; g.strokeStyle = AMB; g.lineWidth = 7; g.beginPath(); g.moveTo(P[0][0], P[0][1]);
      const seg = k * 2; for (let i = 1; i < 3; i++) { const f = clamp01(seg - (i - 1)); if (f <= 0) break; g.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); }
      g.stroke(); g.setLineDash([]);
      P.forEach(([x, y, n, s], i) => { if (i > seg + 0.05) return; g.fillStyle = i === 2 ? GRN : AMB; g.beginPath(); g.arc(x, y, 16, 0, 6.3); g.fill(); g.font = `700 36px ${MONO}`; g.textAlign = i === 0 ? "right" : "left"; g.fillStyle = CRE; g.fillText(n, x + (i === 0 ? -28 : 28), y - 8); g.font = `500 28px ${MONO}`; g.fillStyle = "rgba(242,232,213,.7)"; g.fillText(s, x + (i === 0 ? -28 : 28), y + 28); });
      scan(g); scrM.tx.needsUpdate = true; return;
    }
    head(g, "TULPEN / ƒ · 1634–1637", px.crash ? RED : AMB);
    g.strokeStyle = "rgba(255,176,0,.14)"; g.lineWidth = 2; for (let y = 120; y < SH; y += 90) { g.beginPath(); g.moveTo(30, y); g.lineTo(SW - 30, y); g.stroke(); }
    // mini candles following the 3D chart
    for (let i = 0; i < NC; i++) {
      const k = px.rev[i]; if (k <= 0.01) continue;
      const x = 60 + i * 38, o = OPEN[i], c = o + (CLOSE[i] - o) * k, y0 = SH - 40 - PY(o) / 3.5 * 480, y1 = SH - 40 - PY(c) / 3.5 * 480;
      g.fillStyle = i === PEAK ? AMB : CLOSE[i] >= o ? GRN : RED; g.fillRect(x - 11, Math.min(y0, y1), 22, Math.max(4, Math.abs(y1 - y0)));
      g.fillRect(x - 2, Math.min(y0, y1) - 14, 4, Math.abs(y1 - y0) + 28);
    }
    g.font = `700 56px ${MONO}`; g.textAlign = "right"; g.fillStyle = px.crash ? RED : GRN; g.fillText(px.crash ? "▼ RUNTUH" : "▲ NAIK", SW - 30, 130);
    scan(g); scrM.tx.needsUpdate = true;
  }
  function drawR(t, px) {
    const g = scrR.ctx; head(g, "ORDER BOOK · KONTRAK");
    const bid = px.bids, mid = SW / 2;
    g.font = `700 34px ${MONO}`; g.textAlign = "left"; g.fillStyle = GRN; g.fillText("BELI", 40, 110); g.textAlign = "right"; g.fillStyle = RED; g.fillText("JUAL", SW - 40, 110);
    for (let i = 0; i < 9; i++) {
      const y = 150 + i * 50, wb = (60 + 380 * (1 - i / 10) * (0.7 + 0.3 * Math.sin(i * 2.1 + t * 1.3))) * bid, wa = (80 + 300 * (i / 9) * (0.8 + 0.2 * Math.sin(i * 1.3 + t))) * (1 + 0.5 * (1 - bid));
      g.fillStyle = "rgba(43,227,138,.75)"; g.fillRect(mid - 6 - wb, y, wb, 38);
      g.fillStyle = "rgba(255,59,78,.75)"; g.fillRect(mid + 6, y, Math.min(wa, mid - 30), 38);
    }
    if (bid < 0.2) { g.fillStyle = "rgba(160,20,30,.92)"; g.fillRect(40, 280, mid - 60, 120); g.fillStyle = "#fff"; g.font = `700 44px ${MONO}`; g.textAlign = "center"; g.fillText("PEMBELI: 0", 40 + (mid - 60) / 2, 344); }
    scan(g); scrR.tx.needsUpdate = true;
  }
  function drawBoard(t) {
    const g = pbX, W = 768, Hh = 512;
    g.fillStyle = "#0a0b0d"; g.fillRect(0, 0, W, Hh); g.fillStyle = AMB; g.fillRect(0, 0, W, 70); g.fillStyle = "#0a0b0d"; g.font = `700 44px ${MONO}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("LELANG · 3 FEB", 24, 38);
    const steps = [A("s6:lelang"), A("s6:diturunkan"), A("s6:lagi"), A("s6:lagi#2")];
    const n = steps.filter((s) => t > s).length;
    // stair-step price line (no numbers: the source gives none)
    g.strokeStyle = RED; g.lineWidth = 10; g.lineJoin = "miter"; g.beginPath();
    let y = 130; g.moveTo(40, y);
    for (let i = 0; i < Math.max(1, n); i++) { const x0 = 40 + i * 170; g.lineTo(x0 + 150, y); if (i < n - 1) { y += 80; g.lineTo(x0 + 150, y); } }
    g.stroke();
    g.fillStyle = RED; g.font = `700 54px ${MONO}`; g.textAlign = "right"; g.fillText("HARGA ▼", W - 30, Hh - 120);
    
    g.fillStyle = "rgba(0,0,0,.2)"; for (let yy = 0; yy < Hh; yy += 4) g.fillRect(0, yy, W, 2);
    pbT.needsUpdate = true;
  }

  // ================= timing helpers =================
  const T1 = (k) => A(k);
  function reveal(t) {
    const rev = new Array(NC).fill(0);
    if (t < K.s2) {
      // hook: whole story in one breath: climb to the peak by "tukang", crash on "runtuh"
      const a = 0.25, b = A("s1:tukang"), c0 = A("s1:minggu") - 0.1, c1 = A("s1:runtuh") + 0.25;
      for (let i = 0; i <= PEAK; i++) rev[i] = smooth((t - (a + (b - a) * i / (PEAK + 1))) / 0.32);
      for (let i = PEAK + 1; i < NC; i++) rev[i] = smooth((t - (c0 + (c1 - c0) * (i - PEAK - 1) / 4)) / 0.3);
      const fade = 1 - smooth((t - (K.s1e + 0.05)) / 0.45);
      return rev.map((v) => v * fade);
    }
    const seg = [[0, 7, T1("s4:1634") - 0.4, T1("s4:berdagang")], [8, 15, T1("s4:Umbinya"), T1("s5:Puncaknya")], [16, PEAK, T1("s5:Puncaknya"), T1("s5:gulden")]];
    for (const [i0, i1, a, b] of seg) for (let i = i0; i <= i1; i++) rev[i] = smooth((t - (a + (b - a) * (i - i0) / (i1 - i0 + 1))) / 0.35);
    const crashK = [T1("s6:pembeli"), T1("s6:diturunkan"), T1("s6:lagi#2"), T1("s6:total")];
    for (let k = 0; k < 4; k++) rev[PEAK + 1 + k] = smooth((t - crashK[k]) / 0.35);
    return rev;
  }

  // ================= camera =================
  const S = {
    s2: track([[K.s2 - 0.15, 0.5, 5.6, 14.5, 0, 2.2, -1.2], [A("s2:pusat"), 1.2, 4.6, 12.0, 0.2, 2.0, -1.4], [A("s2:Dan"), 2.6, 3.0, 8.5, 1.4, 1.3, 0.2], [A("s2:tulip") - 0.4, 5.0, 2.6, 6.2, 3.3, 1.6, 0.9], [K.s3, 5.5, 2.5, 5.0, 3.4, 1.9, 1.2]]),
    s3: track([[K.s3 - 0.15, 5.5, 2.5, 5.0, 3.4, 1.9, 1.2], [A("s3:bergaris"), 5.2, 3.1, 4.1, 3.6, 2.35, 1.4], [A("s3:virus"), 4.6, 3.2, 3.9, 3.6, 2.45, 1.45], [A("s3:Tapi"), 4.5, 3.4, 4.8, 3.4, 2.2, 0.8], [K.s4, 3.0, 3.8, 9.5, 1.0, 1.7, -0.6]]),
    s4: track([[K.s4 - 0.15, 3.0, 3.8, 9.5, 1.0, 1.7, -0.6], [A("s4:1634"), -1.6, 3.0, 8.6, -2.6, 1.2, -0.6], [A("s4:berdagang"), -6.5, 3.4, 7.6, -10.0, 1.0, -0.4], [A("s4:minum"), -8.2, 2.9, 6.6, -11.0, 1.0, -0.4], [A("s4:bukan") - 0.2, -3.2, 2.4, 5.6, -3.4, 0.5, 1.2], [A("s4:kontrak"), -2.5, 2.3, 4.9, -3.1, 0.45, 1.5], [A("s4:tanah"), -2.4, 2.0, 4.6, -3.3, 0.4, 1.4], [A("s4:sementara"), -6.2, 3.1, 7.2, -10.4, 1.0, -0.2], [K.s5, -9.0, 2.7, 5.6, -11.0, 1.0, 0.0]]),
    s5: track([[K.s5 - 0.15, -9.0, 2.7, 5.6, -11.0, 1.0, 0.0], [A("s5:Februari"), -3.4, 3.4, 8.4, -2.2, 1.6, -1.0], [A("s5:Semper"), 0.6, 3.9, 8.6, 0.8, 2.3, -1.0], [A("s5:gulden"), 3.6, 4.0, 6.6, 2.7, 2.6, -0.4], [A("s5:Beberapa"), 3.0, 4.0, 8.2, 1.6, 2.4, -0.8], [K.s6, 0.0, 4.3, 11.2, 0.0, 2.1, -1.0]]),
    s6: track([[K.s6 - 0.15, 0.0, 4.3, 11.2, 0.0, 2.1, -1.0], [A("s6:Haarlem"), 8.4, 4.5, 9.6, 10.6, 1.4, -0.6], [A("s6:pembeli"), 9.4, 4.1, 8.4, 10.6, 1.3, -0.8], [A("s6:Tetap"), 10.0, 4.2, 8.8, 10.5, 1.3, -0.8], [A("s6:Dalam"), 10.3, 4.3, 9.2, 10.4, 1.35, -0.8], [A("s6:total") - 0.2, 1.0, 3.6, 9.6, 0.4, 1.6, -1.0], [K.s7, 0.2, 3.5, 9.2, 0.0, 1.5, -0.8]]),
    s7: track([[K.s7 - 0.15, 0.2, 3.5, 9.2, 0.0, 1.5, -0.8], [A("s7:buku"), -0.2, 3.5, 5.8, -1.0, -0.15, 1.9], [A("s7:bangkrut"), -0.5, 3.2, 5.2, -1.05, -0.2, 2.0], [A("s7:Tapi"), -0.2, 3.5, 5.8, -1.0, -0.1, 1.8], [A("s7:Kerugiannya"), 1.2, 3.6, 9.0, 0.4, 1.6, -0.6], [K.s8, 0.6, 4.2, 11.5, 0.0, 1.9, -1.0]]),
    s8: track([[K.s8 - 0.15, 0.6, 4.2, 11.5, 0.0, 1.9, -1.0], [A("s8:mania"), 0.2, 4.6, 13.0, 0.0, 2.1, -1.2], [A("s8:Menurut"), 0.0, 5.4, 15.5, 0.0, 2.2, -1.2], [K.end, 0.0, 6.0, 17.5, 0.0, 2.3, -1.2]]),
  };
  const look = new V3();
  const setCam = (c) => { cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(look); };

  return function draw(t) {
    const hook = t < K.s2;
    const rev = reveal(t);
    const crashOn = hook ? t > A("s1:runtuh") - 0.3 && t < K.s1e + 0.2 : t > A("s6:pembeli") - 0.1;
    // candles
    let topIdx = -1;
    CAND.forEach((C, i) => {
      const k = rev[i]; C.g.visible = k > 0.003; if (!C.g.visible) return; topIdx = i;
      const o = PY(OPEN[i]); const cTarget = C.up ? C.y1 : C.y0; const cNow = o + (cTarget - o) * k;
      const lo = Math.min(o, cNow), hi = Math.max(o + 0.06, cNow, lo + 0.06);
      const L = hi - lo, r = 0.115;
      C.body.scale.set(1, Math.max(0.01, (L - 2 * r * 0.4) / 1), 1); C.body.position.y = (lo + hi) / 2;
      C.body.scale.y = Math.max(0.02, L / 1.23);
      const wl = C.wl * k, wh = lo + (C.wh - lo) * k + 0.06;
      C.stem.scale.y = Math.max(0.01, wh); C.stem.position.y = wh / 2;
      C.leaves.forEach((l) => { l.scale.setScalar(Math.max(0.01, k)); l.position.y = 0.0; });
      C.g.scale.setScalar(0.7 + 0.3 * back(k));
    });
    // crown tulip on the peak candle
    const pk = rev[PEAK];
    crown.T.visible = pk > 0.6; if (crown.T.visible) { const C = CAND[PEAK]; crown.T.position.set(CX(PEAK), C.body.position.y + C.body.scale.y * 0.62 - 0.08, ZC); crown.T.scale.setScalar(0.42 * smooth((pk - 0.6) / 0.4)); crown.head.rotation.y = t * 0.4; }
    gGold.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3);

    // hero tulip idle (deterministic sway)
    hero.T.rotation.z = 0.03 * Math.sin(t * 0.8); hero.head.rotation.y = 0.15 * Math.sin(t * 0.3);
    auTulip.T.rotation.z = 0.03 * Math.sin(t * 0.7 + 1);

    // virus particles orbit the tulip head in s3
    const vk = !hook && t < K.s4 ? win(t, A("s3:virus") - 0.6, A("s3:Tapi") + 0.6, 0.6, 0.8) : 0;
    const hp = new V3(); hero.head.getWorldPosition(hp);
    VIR.forEach((v, i) => { v.visible = vk > 0.01; if (!v.visible) return; const a = t * (0.5 + 0.3 * hsh(i, 1)) + i * 2.1, rr = 0.42 + 0.16 * hsh(i, 2); v.position.set(hp.x + Math.cos(a) * rr, hp.y + 0.05 + (hsh(i, 3) - 0.5) * 0.6 + 0.05 * Math.sin(t * 2 + i), hp.z + Math.sin(a) * rr); v.scale.setScalar(vk * (0.8 + 0.5 * hsh(i, 4))); v.rotation.set(t + i, t * 0.7, 0); });
    showLab(labVirus, vk, new V3(hp.x - 0.75, hp.y + 0.45, hp.z), 1);

    // tavern: traders gesture, contracts fly hand to hand (busy from s4 on; idle otherwise)
    const tk = t > K.s4 - 1 && t < K.s5 + 1 ? 1 : 0;
    TRADERS.forEach((T, i) => { const ph = t * 2.2 + i * 1.7; T.P.aR.sh.rotation.x = -1.1 - 0.35 * tk * (0.5 + 0.5 * Math.sin(ph)); T.P.aR.el.rotation.x = -0.5 - 0.3 * tk * Math.sin(ph * 1.3); T.P.hd.rotation.y = 0.25 * Math.sin(ph * 0.5); T.P.hd.rotation.x = 0.08 * Math.sin(ph * 0.9); });
    CONTRACTS.forEach((m, i) => {
      if (!tk) { m.position.y = -5; return; }
      const pairA = TRADERS[i % 4], pairB = TRADERS[(i + 1 + (i % 2) * 2) % 4];
      const u = (t * 0.55 + i / 6) % 1, ph = smooth(u);
      const ax = pairA.x - pairA.s * 0.35, bx = pairB.x - pairB.s * 0.35;
      m.position.set(ax + (bx - ax) * ph, 0.95 + Math.sin(Math.PI * ph) * (0.6 + 0.3 * hsh(i, 1)), pairA.z + (pairB.z - pairA.z) * ph + 0.15 * Math.sin(Math.PI * ph));
      m.rotation.set(-1.2 + Math.sin(u * 6.3 + i) * 0.4, u * 6.3 * (i % 2 ? 1 : -1), 0.3 * Math.sin(u * 9));
    });

    // auction: gavel strikes on each narrated step
    {
      const hits = [A("s6:pembeli"), A("s6:diturunkan"), A("s6:lagi"), A("s6:lagi#2"), A("s6:mau")];
      let lift = 0; for (const h of hits) { const d = t - h; if (d > -0.35 && d < 0) lift = Math.max(lift, smooth((d + 0.35) / 0.25)); else if (d >= 0 && d < 0.25) lift = Math.max(lift, 1 - d / 0.12); }
      auct.aR.sh.rotation.x = -0.6 - 1.4 * lift; auct.aR.el.rotation.x = -0.9 + 0.6 * lift; auct.aL.sh.rotation.x = -0.3; auct.aL.el.rotation.x = -0.6;
      auct.hd.rotation.y = -0.2 + 0.3 * Math.sin(t * 0.8);
      drawBoard(t);
    }

    // book opens in s7
    { const ok = t > K.s7 - 1 ? smooth((t - A("s7:buku")) / 0.8) : 0; lid.rotation.z = ok * 2.9; pageText.visible = ok > 0.5; }

    // screens
    const level = clamp01(topIdx / PEAK);
    const bids = hook ? (crashOn ? 0.05 : 1) : t < A("s6:pembeli") ? 1 : Math.max(0.0, 1 - smooth((t - A("s6:pembeli")) / 0.6));
    const mapK = !hook && t < A("s2:tulip") + 1.5 ? clamp01((t - A("s2:Dan") + 1.5) / 4) + (t > A("s2:abad") ? 0.02 : 0) : 0;
    drawL(t, { level, crash: crashOn && (hook || t < K.s8) });
    drawM(t, { rev, crash: crashOn && (hook || t < K.s8) }, mapK);
    drawR(t, { bids: t > K.s8 ? 1 : bids });
    fill.color.set(crashOn && t < K.s7 ? 0xff5a4a : 0xffa830);

    // ---------- camera ----------
    if (hook) {
      const u = smooth(t / (K.s2 - 0.15));
      setCam([7.6 - u * 1.0, 3.5 - u * 0.2, 9.0 - u * 1.4, 1.6 + u * 0.5, 2.0, -0.6 + u * 0.4]);
    } else if (t < K.s3 - 0.15) setCam(S.s2(t));
    else if (t < K.s4 - 0.15) setCam(S.s3(t));
    else if (t < K.s5 - 0.15) setCam(S.s4(t));
    else if (t < K.s6 - 0.15) setCam(S.s5(t));
    else if (t < K.s7 - 0.15) {
      setCam(S.s6(t));
      const d = t - A("s6:total"); if (d > 0 && d < 0.8) { const s = 0.06 * (1 - d / 0.8); cam.position.x += Math.sin(d * 47) * s; cam.position.y += Math.sin(d * 61) * s; }
    } else if (t < K.s8 - 0.15) setCam(S.s7(t));
    else setCam(S.s8(t));

    // ---------- labels ----------
    const pkPos = new V3(CX(PEAK), CAND[PEAK].wh + 1.0, ZC);
    showLab(labPrice, (hook ? win(t, A("s1:mahal") - 0.1, A("s1:Lalu") - 0.1, 0.3, 0.3) : 0), hook ? new V3(3.65, 3.25, 1.55) : pkPos, 1);
    showLab(labBubble, !hook && t < K.s6 ? win(t, A("s5:Beberapa"), K.s6 - 0.4, 0.3, 0.3) : 0, new V3(0.6, 3.7, ZC), 1);
    
    comp.render();
  };
}
