// EP31 SKETCHFORGE: the Hanoi rat bounty (1902) as a pencil-on-cream diorama on a sketchbook page.
// A cut-away slab of Hanoi: the street block on top (old quarter tube houses left, European villas right) and
// Doumer's new sewer beneath it, open at the front like an architect's section. In front of the slab, on the paper:
// the bounty office (table, tray of tails, coin stack, sign), a ledger clipboard on an easel, a card map of
// French Indochina, and at the far left the rat farm on the city's edge. Graphite greys, paper cream, ONE accent
// (vermilion) that marks only what gets paid: the coin, the tails, the bounty stamp and the chain.
//   s1 hook: coin drops by the tray of tails; then rats pour out of the sewer mouth around the table
//   s2 card map (Saigon -> Hanoi 1902), then the city lines lift into 3D blocks, Doumer name tag, sewer > 19 km
//   s3 the sewer as a rat highway; no predator (crossed cat); rats climb a manhole into the villas; flea magnifier
//   s4 paid hunters with lanterns in the tunnel; ledger 7.985 -> 15.041 -> 20.112; the tunnel is still full
//   s5 plan B: townsfolk queue with tails, 1 sen coin flips, "only tails" (crate of carcasses crossed out)
//   s6 a tailless live rat; scissors snip a tail, the rat is released; mother + babies with new tails; smuggling
//      cart from outside town; the rat farm on the outskirts
//   s7 stamp DIBATALKAN; rats everywhere in the city; 1903 plague numbers stated calmly (no bodies)
//   s8 wide pull-back of the whole page; the chain of tags folds into a loop: "efek tikus"
// A chain of paper tags (camera-attached HUD) grows link by link as each step is named.
// Everything is a pure function of t.

const FONTS = ['700 80px Kalam', '400 80px Kalam', '700 80px "Courier Prime"', '400 80px "Courier Prime"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "HANOI 1902 AUDIRA tikus"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const HAND = 'Kalam, "Comic Sans MS", cursive', TYPE = '"Courier Prime", "Courier New", monospace';
const PAPER = "#EFE6D2", PAPER2 = "#E4D8BE", INK = "#2E2C2B", INK2 = "#5A5652", ACC = "#D9472B", ACCD = "#B5361E";
const SY = 5.5; // street level on the slab

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
const lerp = (a, b, u) => a + (b - a) * u;
const mod = (a, n) => ((a % n) + n) % n;

// ---------- pencil textures ----------
function hatch(g, W, H, q, ang, sp, a, lw = 1.3) {
  g.save(); g.strokeStyle = `rgba(46,44,43,${a})`; g.lineWidth = lw; g.translate(W / 2, H / 2); g.rotate(ang);
  const R = Math.hypot(W, H);
  for (let x = -R; x < R; x += sp * (0.8 + q() * 0.4)) { g.beginPath(); g.moveTo(x + q() * 2, -R); g.lineTo(x + q() * 3 - 1, R); g.stroke(); }
  g.restore();
}
function grain(g, W, H, q, n, a = 0.06) {
  for (let i = 0; i < n; i++) { const v = q() < 0.5 ? "255,255,255" : "40,36,30"; g.fillStyle = `rgba(${v},${a * (0.4 + q() * 0.6)})`; g.fillRect(q() * W, q() * H, 1 + q() * 2, 1 + q() * 1.5); }
}
function sketchRect(g, x, y, w, h, q, lw = 3, a = 0.85, passes = 2) {
  g.strokeStyle = `rgba(40,38,37,${a})`; g.lineWidth = lw; g.lineCap = "round";
  for (let p = 0; p < passes; p++) {
    const j = () => (q() - 0.5) * 3;
    g.beginPath(); g.moveTo(x + j(), y + j()); g.lineTo(x + w + j(), y + j()); g.lineTo(x + w + j(), y + h + j()); g.lineTo(x + j(), y + h + j()); g.closePath(); g.stroke();
  }
}
const texCache = new Map();
function faceTex(w, h, kind, seed = 1, deco, base = PAPER) {
  const key = deco ? null : `${w.toFixed(1)}|${h.toFixed(1)}|${kind}|${base}`;
  if (key && texCache.has(key)) return texCache.get(key);
  const ppu = 96, cap = deco ? 1536 : 512, cw = Math.min(cap, Math.max(32, Math.round(w * ppu))), ch = Math.min(cap, Math.max(32, Math.round(h * ppu)));
  const tx = canvasTex(cw, ch, (g, W, H) => {
    const q = mulberry(seed * 977 + cw * 3 + ch);
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    grain(g, W, H, q, (W * H) / 30, 0.07);
    if (kind === "front") hatch(g, W, H, q, 0.95, 10, 0.2);
    if (kind === "shadow") { hatch(g, W, H, q, 0.95, 7, 0.3); hatch(g, W, H, q, -0.7, 8, 0.24); }
    if (kind === "light") hatch(g, W, H, q, 0.12, 18, 0.09);
    if (kind === "section") { hatch(g, W, H, q, 0.785, 6, 0.42, 1.6); }
    if (kind === "top") { for (let i = 0; i < 4; i++) { const r = W * (0.2 + q() * 0.3), x = q() * W, y = q() * H, gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, "rgba(60,55,50,.07)"); gr.addColorStop(1, "rgba(60,55,50,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); } }
    if (deco) deco(g, W, H, q);
    if (kind !== "none") sketchRect(g, 2, 2, W - 4, H - 4, q, Math.max(2, W / 120), 0.8);
  });
  if (key) texCache.set(key, tx);
  return tx;
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x2a2729, exp: 0.85, bloom: [0.05, 0.3, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.85;
  r.localClippingEnabled = true;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  cam.near = 0.1; cam.far = 600; cam.updateProjectionMatrix();
  scene.add(cam);
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1B1A1D"); gr.addColorStop(0.6, "#2B2829"); gr.addColorStop(1, "#38332F"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  // ---------- lights: warm desk-lamp key from front-left, soft fill, cool rim ----------
  const hemi = new THREE.HemisphereLight(0xfff4e2, 0x4a4036, 1.05); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 2.5);
  key.position.set(-26, 42, 34); key.target.position.set(-2, 0, 2);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -32, right: 32, top: 30, bottom: -30, near: 10, far: 140 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xc4d4ff, 0.7); rim.position.set(24, 20, -30); scene.add(rim);

  const std = (c, ro = 0.9, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const lineM = new THREE.LineBasicMaterial({ color: 0x2a2826, transparent: true, opacity: 0.9 });
  const repTex = (seed, kind, base, rep) => { const t = canvasTex(256, 256, (g, W, H) => { const q = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, W, H); grain(g, W, H, q, 2500, 0.08); if (kind === "x") { hatch(g, W, H, q, 0.9, 8, 0.32); hatch(g, W, H, q, -0.7, 9, 0.24); } else hatch(g, W, H, q, 0.9, 9, 0.28); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t; };

  // sketch box: per-face pencil textures + graphite edge lines. Faces: +x shadow, -x light, +y top, -y none, +z front, -z shadow
  function sbox(w, h, d, o = {}) {
    const s = o.seed || 1, base = o.base || PAPER, clip = o.clip || null;
    const mk = (tx) => std(0xffffff, 0.92, 0, { map: tx, clippingPlanes: clip, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const mats = [mk(faceTex(d, h, "shadow", s, null, base)), mk(faceTex(d, h, "light", s + 1, null, base)), mk(faceTex(w, d, o.topKind || "top", s + 2, o.topDeco, base)),
      mk(faceTex(w, d, "none", s, null, base)), mk(faceTex(w, h, o.frontKind || "front", s + 3, o.deco, base)), mk(faceTex(w, h, "shadow", s + 4, null, base))];
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mats); mesh.castShadow = mesh.receiveShadow = true;
    const lm = clip ? new THREE.LineBasicMaterial({ color: 0x2a2826, transparent: true, opacity: 0.9 }) : lineM;
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), lm);
    return { mesh, lines, mats };
  }
  function place(b, x, y, z, p = scene) { b.mesh.position.set(x, y, z); b.lines.position.set(x, y, z); p.add(b.mesh, b.lines); return b; }
  // soft contact shadow (AO-like) under things that touch the paper
  const aoTex = canvasTex(128, 128, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 2, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(30,24,18,.55)"); gr.addColorStop(0.55, "rgba(30,24,18,.25)"); gr.addColorStop(1, "rgba(30,24,18,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); });
  function ao(w, d, x, y, z, p = scene, o = 1) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), basic({ map: aoTex, opacity: o, toneMapped: true })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.012, z); m.renderOrder = 1; p.add(m); return m; }
  // text plate (canvas), flat or standing
  function plate(w, h, paint, x, y, z, p = scene, cw = 1024, mat = "basic") {
    const map = canvasTex(cw, Math.round((cw * h) / w), paint);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat === "basic" ? basic({ map }) : std(0xffffff, 0.9, 0, { map, transparent: true }));
    m.position.set(x, y, z); m.renderOrder = 5; p.add(m); return m;
  }
  const paperCard = (title, sub, accent = false, opts = {}) => (g, W, H) => {
    const q = mulberry(title.length * 13 + 7);
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H); grain(g, W, H, q, (W * H) / 40, 0.07);
    sketchRect(g, 6, 6, W - 12, H - 12, q, 5, 0.9);
    if (accent) { g.fillStyle = ACC; g.fillRect(6, 6, 22, H - 12); }
    g.fillStyle = accent ? ACCD : INK; g.textAlign = "center"; g.textBaseline = "middle";
    let fs = opts.fs || H * 0.42; g.font = `700 ${fs}px ${HAND}`;
    while (g.measureText(title).width > W * 0.86 && fs > 10) { fs -= 2; g.font = `700 ${fs}px ${HAND}`; }
    g.fillText(title, W / 2 + (accent ? 10 : 0), sub ? H * 0.42 : H * 0.54);
    if (sub) { g.fillStyle = INK2; g.font = `700 ${H * 0.17}px ${TYPE}`; g.fillText(sub, W / 2 + (accent ? 10 : 0), H * 0.76); }
  };

  // ---------- desk + sketchbook page ----------
  add(new THREE.PlaneGeometry(400, 400), std(0x2b282a, 0.85, 0, { map: repTex(3, "h", "#3a3637", 60) }), 0, -0.14, 0).rotation.x = -Math.PI / 2;
  const PW = 48, PD = 36, PZ = 2;
  const pageTex = canvasTex(2048, 1536, (g, W, H) => {
    const q = mulberry(5);
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H); grain(g, W, H, q, 160000, 0.06);
    for (let i = 0; i < 9; i++) { const x = q() * W, y = q() * H, rr = 200 + q() * 300, gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, "rgba(70,60,50,.05)"); gr.addColorStop(1, "rgba(70,60,50,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    g.strokeStyle = "rgba(90,110,140,.10)"; g.lineWidth = 2; for (let y = 60; y < H; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const P = (x, z) => [((x + PW / 2) / PW) * W, ((z - PZ + PD / 2) / PD) * H];
    // construction lines of the slab footprint and the sewer (the sketch stays on the page)
    g.strokeStyle = "rgba(46,44,43,.35)"; g.lineWidth = 2.5; g.setLineDash([16, 10]);
    const [a0, b0] = P(-9.6, -10.6), [a1, b1] = P(9.6, 6.6); g.strokeRect(a0, b0, a1 - a0, b1 - b0); g.setLineDash([]);
    g.strokeStyle = "rgba(46,44,43,.3)"; for (let i = 0; i < 3; i++) { const [x0, y0] = P(-23, -12 + i * 0.4), [x1] = P(23, 0); g.beginPath(); g.moveTo(x0 + 60, y0); g.lineTo(x1 - 60, y0 + (q() - 0.5) * 6); g.stroke(); }
    g.fillStyle = "rgba(46,44,43,.7)"; g.font = `700 54px ${HAND}`; g.textAlign = "left";
    g.fillText("Hanoi, 1902 — studi got & tikus", ...P(-21, -13.4));
    g.font = `400 40px ${HAND}`; g.fillText("hlm. 31", ...P(18.5, -13.4));
    g.fillText("got Doumer > 19 km →", ...P(-21, 9.8));
    g.fillText("pinggiran kota", ...P(-19.5, -7.6));
    g.font = `700 34px ${TYPE}`; g.fillStyle = "rgba(46,44,43,.55)"; g.fillText("AUDIRA · STUDI NO.31 · HB → 3D", ...P(-21, 18.6));
    // doodled rats in the margin
    for (let i = 0; i < 5; i++) {
      const [x, y] = P(15 + (i % 3) * 2.6, 11 + Math.floor(i / 3) * 2.6);
      g.strokeStyle = "rgba(46,44,43,.55)"; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 34, 20, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(x + 32, y - 4); g.lineTo(x + 58, y + 2); g.lineTo(x + 32, y + 9); g.stroke();
      g.strokeStyle = i === 2 ? "rgba(217,71,43,.8)" : "rgba(46,44,43,.55)"; g.beginPath(); g.moveTo(x - 34, y + 4); g.quadraticCurveTo(x - 70, y + 30, x - 96, y + 6); g.stroke();
    }
  });
  const page = add(new THREE.BoxGeometry(PW, 0.12, PD), [std(PAPER2), std(PAPER2), std(0xffffff, 0.95, 0, { map: pageTex }), std(PAPER2), std(PAPER2), std(PAPER2)], 0, -0.06, PZ);
  page.castShadow = false;
  // spiral binding on the left edge
  const ringM = std(0x3a3a3e, 0.35, 0.8);
  for (let i = 0; i < 16; i++) { const t = add(new THREE.TorusGeometry(0.42, 0.07, 8, 20), ringM, -PW / 2 + 0.25, 0.1, PZ - PD / 2 + 1.2 + i * 2.2); t.rotation.y = Math.PI / 2; }
  // pencil + eraser resting on the page
  const pencil = new THREE.Group(); scene.add(pencil);
  const pB = add(new THREE.CylinderGeometry(0.24, 0.24, 6, 6), std(0x3b3937, 0.55, 0.1, { map: repTex(9, "h", "#4a4744", 1) }), 0, 0, 0, pencil);
  add(new THREE.ConeGeometry(0.24, 0.9, 6), std(0xe8d3b0, 0.85), 0, -3.45, 0, pencil).rotation.x = Math.PI;
  add(new THREE.ConeGeometry(0.075, 0.27, 8), std(0x2a2826, 0.4, 0.3), 0, -3.97, 0, pencil).rotation.x = Math.PI;
  add(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 12), std(0xb8b2a6, 0.35, 0.8), 0, 3.25, 0, pencil);
  add(new THREE.CylinderGeometry(0.23, 0.23, 0.4, 12), std(0xd9b6a8, 0.9), 0, 3.7, 0, pencil);
  place(sbox(2.2, 0.6, 1.1, { seed: 71, base: "#E9E3DA" }), 15.5, 0.3, 14.5).mesh.rotation.y = 0.4;

  // ---------- the slab: street crust on top, sewer tunnel open at the front ----------
  const slab = new THREE.Group(); scene.add(slab);
  const streetDeco = (g, W, H, q) => {
    const P = (x, z) => [((x + 9) / 18) * W, ((z + 10) / 16) * H];
    const road = (x0, z0, x1, z1) => { const [a, b] = P(x0, z0), [c, d] = P(x1, z1); g.fillStyle = "rgba(255,252,244,.6)"; g.fillRect(a, b, c - a, d - b); g.strokeStyle = "rgba(46,44,43,.45)"; g.lineWidth = 2; g.strokeRect(a, b, c - a, d - b); };
    road(-9, -0.9, 9, 0.5); road(-0.5, -10, 0.9, 6); road(-9, -6.3, -0.5, -5.6); road(0.9, -6.1, 9, -5.4);
    g.fillStyle = "rgba(46,44,43,.6)"; g.font = `700 64px ${HAND}`; g.textAlign = "center";
    g.fillText("Kota Lama", ...P(-4.8, 5.2)); g.fillText("Kawasan Eropa", ...P(4.8, 5.6));
    g.font = `400 44px ${HAND}`; g.fillText("jalan", ...P(-6, -0.1));
  };
  // floor (thin) + back mass + crust + end caps
  place(sbox(18, 0.12, 16, { seed: 11, frontKind: "section" }), 0, 0.06, -2, slab);
  const bwDeco = (g, W, H, q) => {
    g.strokeStyle = "rgba(46,44,43,.28)"; g.lineWidth = 1.5;
    for (let y = 0; y < H; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = ((y / 18) % 2) * 22; x < W; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 18); g.stroke(); } }
    for (const cx of [0.12, 0.43, 0.78]) { const x = cx * W, rw = W * 0.05; g.fillStyle = "rgba(30,28,27,.75)"; g.beginPath(); g.moveTo(x - rw, H); g.lineTo(x - rw, H * 0.45); g.arc(x, H * 0.45, rw, Math.PI, 0); g.lineTo(x + rw, H); g.fill(); hatch(g, W, H, q, 0.9, 30, 0.04); }
  };
  place(sbox(18, 3.5, 12, { seed: 12, deco: bwDeco, frontKind: "light", base: "#E7DCC5" }), 0, 1.87, -4, slab);
  const crustDeco = (g, W, H, q) => { g.fillStyle = "rgba(46,44,43,.75)"; g.font = `700 ${H * 0.2}px ${TYPE}`; g.textAlign = "left"; g.fillText("POTONGAN · SALURAN PEMBUANGAN HANOI · 1902", W * 0.02, H * 0.6); };
  place(sbox(18, 1.9, 16, { seed: 13, frontKind: "section", topDeco: streetDeco }), 0, 4.55, -2, slab);
  for (const sx of [-1, 1]) place(sbox(0.4, 3.48, 4, { seed: 14 + sx, frontKind: "section" }), sx * 8.8, 1.86, 4, slab);
  // water channel + arch ribs
  const water = add(new THREE.PlaneGeometry(17.2, 1.4), std(0x5b5a5e, 0.12, 0.1, { map: repTex(21, "h", "#6a686c", 6) }), 0, 0.135, 3.9, slab);
  water.rotation.x = -Math.PI / 2; water.receiveShadow = true;
  const ribs = [];
  const ribM = std(0xd8ccb2, 0.9, 0, { map: repTex(23, "x", "#d8ccb2", 1) });
  for (let i = 0; i < 10; i++) { const x = -7.2 + i * 1.6; const t = add(new THREE.TorusGeometry(1.74, 0.09, 8, 28, Math.PI), ribM, x, 1.86, 4, slab); t.rotation.y = Math.PI / 2; ribs.push(t); }
  // manhole: dark hole on the street, cover slid aside, ladder in the tunnel
  const MH = [0.2, 4.4];
  add(new THREE.CircleGeometry(0.42, 24), std(0x1d1b1a, 1), MH[0], SY + 0.012, MH[1], slab).rotation.x = -Math.PI / 2;
  add(new THREE.CylinderGeometry(0.44, 0.44, 0.07, 24), std(0x6d6862, 0.5, 0.5, { map: repTex(25, "x", "#77716a", 1) }), MH[0] + 0.85, SY + 0.04, MH[1] + 0.35, slab);
  add(new THREE.CircleGeometry(0.42, 24), std(0x1d1b1a, 1), MH[0], 3.595, MH[1], slab).rotation.x = Math.PI / 2;
  const ladM = std(0x4a4643, 0.5, 0.6);
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.035, 0.035, 3.5, 6), ladM, MH[0] + s * 0.22, 1.87, MH[1], slab);
  for (let i = 0; i < 9; i++) add(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 6), ladM, MH[0], 0.4 + i * 0.38, MH[1], slab).rotation.z = Math.PI / 2;
  ao(19.5, 17.5, 0, 0, -2, scene, 0.9);

  // ---------- city blocks: lines lift, then clay fills behind a clip plane ----------
  const city = [];
  const roofTex = repTex(31, "x", "#9a938a", 1), roofTex2 = repTex(32, "h", "#8f8a84", 1);
  const shopFront = (g, W, H, q) => {
    g.fillStyle = "rgba(35,32,30,.82)"; g.fillRect(W * 0.3, H * 0.55, W * 0.4, H * 0.45);
    for (const y of [0.18]) { g.fillStyle = "rgba(35,32,30,.6)"; g.fillRect(W * 0.22, H * y, W * 0.56, H * 0.2); }
    g.strokeStyle = "rgba(46,44,43,.6)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, H * 0.48); g.lineTo(W, H * 0.48); g.stroke();
  };
  const villaFront = (g, W, H, q) => {
    for (const x of [0.14, 0.4, 0.66]) { g.fillStyle = "rgba(35,32,30,.6)"; g.fillRect(W * x, H * 0.16, W * 0.18, H * 0.26); g.fillRect(W * x, H * 0.58, W * 0.18, H * 0.3); g.strokeStyle = "rgba(46,44,43,.5)"; g.strokeRect(W * x - 3, H * 0.16 - 3, W * 0.18 + 6, H * 0.26 + 6); }
    g.strokeStyle = "rgba(46,44,43,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, H * 0.5); g.lineTo(W, H * 0.5); g.stroke();
  };
  function building(x, z, w, d, h, kind, seed) {
    const g = new THREE.Group(); g.position.set(x, SY, z); scene.add(g);
    const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e3);
    const wire = new THREE.Group(); g.add(wire);
    const b = sbox(w, h, d, { seed, deco: kind === "shop" ? shopFront : villaFront, clip: [plane], base: kind === "shop" ? "#EDE3CD" : "#F2EBDD" });
    b.mesh.position.y = h / 2; g.add(b.mesh); b.lines.position.y = h / 2; wire.add(b.lines);
    let roof, rh;
    if (kind === "shop") {
      rh = 0.55;
      const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.06, 0); sh.lineTo(w / 2 + 0.06, 0); sh.lineTo(0, rh); sh.closePath();
      const geo = new THREE.ExtrudeGeometry(sh, { depth: d + 0.12, bevelEnabled: false }); geo.translate(0, 0, -(d + 0.12) / 2);
      roof = new THREE.Mesh(geo, std(0xffffff, 0.85, 0, { map: roofTex, clippingPlanes: [plane], polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
      roof.position.y = h; roof.castShadow = roof.receiveShadow = true; g.add(roof);
      const rl = new THREE.LineSegments(new THREE.EdgesGeometry(geo), b.lines.material); rl.position.y = h; wire.add(rl);
    } else {
      rh = kind === "palace" ? 1.0 : 0.8;
      const geo = new THREE.ConeGeometry(Math.SQRT1_2 * 1.08, rh, 4, 1); geo.rotateY(Math.PI / 4); geo.scale(w, 1, d);
      roof = new THREE.Mesh(geo, std(0xffffff, 0.8, 0, { map: roofTex2, clippingPlanes: [plane], polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
      roof.position.y = h + rh / 2; roof.castShadow = roof.receiveShadow = true; g.add(roof);
      const rl = new THREE.LineSegments(new THREE.EdgesGeometry(geo), b.lines.material); rl.position.y = h + rh / 2; wire.add(rl);
    }
    const sh = ao(w + 1.0, d + 1.0, 0, 0, 0, g, 0.8);
    city.push({ g, wire, plane, h: h + rh, b, sh, x, z });
    return city[city.length - 1];
  }
  const cq = mulberry(41);
  // old quarter: rows of narrow tube houses
  for (const zc of [-8.3, -4.1, 2.2]) for (let x = -8.25; x < -0.9; x += 1.08) building(x + 0.02 * cq(), zc, 0.98, 2.3, 1.0 + cq() * 1.1, "shop", 100 + city.length);
  // European quarter: villas + governor's palace
  const VIL = [[2.6, -8.0], [5.2, -8.0], [7.7, -8.0], [2.6, -2.8], [7.7, -2.8], [2.6, 2.4], [5.2, 2.4], [7.7, 2.4]];
  VIL.forEach(([x, z]) => building(x, z, 1.9, 1.9, 1.3 + cq() * 0.4, "villa", 200 + city.length));
  const palace = building(5.15, -3.2, 2.0, 2.6, 2.2, "palace", 300);
  // trees in the European quarter
  const trees = [];
  const leafM = std(0xb7b2a6, 0.95, 0, { map: repTex(51, "x", "#c4beb2", 1) }), trunkM = std(0x6a645d, 0.9);
  for (const [x, z] of [[3.9, 4.6], [6.5, 4.7], [8.4, 4.7], [3.9, -5.0], [6.5, -5.6], [1.6, -0.5]]) {
    const g = new THREE.Group(); g.position.set(x, SY, z); scene.add(g);
    add(new THREE.CylinderGeometry(0.07, 0.1, 0.7, 6), trunkM, 0, 0.35, 0, g);
    const c = add(new THREE.IcosahedronGeometry(0.55, 0), leafM, 0, 1.0, 0, g); c.scale.set(1, 0.9, 1);
    trees.push(g);
  }
  // rise order: low to high
  const order = city.map((c, i) => [c.h + c.x * 0.02, i]).sort((a, b) => a[0] - b[0]);
  order.forEach(([, i], k) => { city[i].d = k * (1.9 / city.length); });

  // ---------- AUDIRA brand + name tags on the city ----------
  const signDeco = (g, W, H) => { g.fillStyle = "#2E2C2B"; g.font = `700 ${H * 0.62}px ${TYPE}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", W / 2, H * 0.55); };
  const brandSign = plate(1.2, 0.34, (g, W, H) => { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); sketchRect(g, 4, 4, W - 8, H - 8, mulberry(3), 5); signDeco(g, W, H); }, city[22].x, 0, city[22].z + 1.17, scene, 512, "std");
  brandSign.material.depthWrite = true;
  const tagTex = (l1, l2) => (g, W, H) => { const q = mulberry(9); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); grain(g, W, H, q, 4000, 0.07); sketchRect(g, 8, 8, W - 16, H - 16, q, 6); g.fillStyle = INK2; g.textAlign = "center"; g.font = `700 ${H * 0.2}px ${TYPE}`; g.fillText(l1, W / 2, H * 0.36); g.fillStyle = INK; g.font = `700 ${H * 0.36}px ${HAND}`; g.fillText(l2, W / 2, H * 0.78); };
  const doumer = new THREE.Group(); scene.add(doumer);
  const dTag = plate(3.6, 1.15, tagTex("GUBERNUR JENDERAL", "Paul Doumer"), 0, 1.6, 0, doumer, 1024, "std");
  add(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), std(0x3b3937, 0.5, 0.4), 0, 0.55, 0, doumer);
  add(new THREE.SphereGeometry(0.1, 10, 8), std(ACC, 0.4, 0.2), 0, 1.1, 0, doumer);
  const quarterTag = plate(3.0, 0.9, tagTex("PEMUKIMAN ELITE", "Kawasan Eropa"), 5.2, SY + 3.4, 2.4, scene, 1024, "std");

  // ---------- sewer labels ----------
  const kmLine = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.06, 0.06), basic({ color: ACC, opacity: 1, depthWrite: true, transparent: false, toneMapped: true }));
  kmLine.position.set(0, 3.45, 6.05); scene.add(kmLine);
  const kmLab = plate(3.2, 1.0, paperCard("> 19 km", "saluran di bawah kota", true), -4.5, 2.6, 6.4);
  const tolLab = plate(3.4, 0.95, paperCard("JALAN TOL TIKUS →", "", false), -1.4, 2.85, 5.95);
  const catLab = plate(2.0, 2.0, (g, W, H) => {
    const q = mulberry(17); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); grain(g, W, H, q, 6000, 0.07); sketchRect(g, 8, 8, W - 16, H - 16, q, 6);
    g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round"; const cx = W / 2, cy = H * 0.52;
    g.beginPath(); g.ellipse(cx + 40, cy + 70, 150, 90, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cx - 110, cy - 40, 80, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx - 175, cy - 85); g.lineTo(cx - 170, cy - 160); g.lineTo(cx - 120, cy - 115); g.moveTo(cx - 95, cy - 118); g.lineTo(cx - 55, cy - 165); g.lineTo(cx - 45, cy - 85); g.stroke();
    g.beginPath(); g.moveTo(cx + 185, cy + 50); g.quadraticCurveTo(cx + 300, cy - 20, cx + 250, cy - 140); g.stroke();
    g.strokeStyle = ACC; g.lineWidth = 26; g.beginPath(); g.moveTo(W * 0.12, H * 0.12); g.lineTo(W * 0.88, H * 0.88); g.moveTo(W * 0.88, H * 0.12); g.lineTo(W * 0.12, H * 0.88); g.stroke();
    g.fillStyle = INK; g.font = `700 ${H * 0.085}px ${TYPE}`; g.textAlign = "center"; g.fillText("TANPA PEMANGSA", W / 2, H * 0.94);
  }, 3.0, 2.0, 2.15, scene, 512);
  const fleaLab = plate(2.6, 0.85, paperCard("kutu tikus → pes", "", true), 6.3, SY + 2.7, 4.6);

  // ---------- rats: instanced parts ----------
  const MAXR = 460;
  const ratBodyM = std(0x7c766f, 0.95, 0, { map: repTex(61, "x", "#8a847c", 1.5) });
  const tailM = std(0xc9573f, 0.6, 0.05);
  const PART = [];
  const partMesh = (geo, mat, local) => { const im = new THREE.InstancedMesh(geo, mat, MAXR); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; im.count = 0; scene.add(im); PART.push({ im, local }); return im; };
  const M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  partMesh(new THREE.SphereGeometry(0.5, 14, 10), ratBodyM, M4(0, 0.27, 0, 0, 0, 0, 0.62, 0.52, 1.0));
  partMesh(new THREE.ConeGeometry(0.21, 0.46, 10), ratBodyM, M4(0, 0.33, 0.6, Math.PI / 2));
  partMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12), std(0xcbb5a4, 0.9), M4(-0.14, 0.5, 0.44, Math.PI / 2 - 0.3, 0, 0.3));
  partMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12), std(0xcbb5a4, 0.9), M4(0.14, 0.5, 0.44, Math.PI / 2 - 0.3, 0, -0.3));
  partMesh(new THREE.SphereGeometry(0.04, 8, 6), std(0x111111, 0.2, 0.3), M4(-0.1, 0.42, 0.66));
  partMesh(new THREE.SphereGeometry(0.04, 8, 6), std(0x111111, 0.2, 0.3), M4(0.1, 0.42, 0.66));
  partMesh(new THREE.SphereGeometry(0.035, 8, 6), std(0xcc8a7a, 0.6), M4(0, 0.3, 0.84));
  const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.22, -0.46), new THREE.Vector3(0.05, 0.12, -0.8), new THREE.Vector3(0.2, 0.05, -1.1), new THREE.Vector3(0.12, 0.03, -1.4)]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 16, 0.035, 6);
  const TAILP = PART.length; partMesh(tailGeo, tailM, M4(0, 0, 0));
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  let nR = 0;
  const _root = new THREE.Matrix4(), _m = new THREE.Matrix4();
  function rat(x, y, z, yaw, s, tail = 1, pitch = 0, bob = 0) {
    if (nR >= MAXR || s <= 0.001) return;
    _root.compose(new THREE.Vector3(x, y + Math.abs(Math.sin(bob)) * 0.06 * s, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ")), new THREE.Vector3(s, s, s));
    PART.forEach((p, i) => { if (i === TAILP && !tail) p.im.setMatrixAt(nR, ZERO); else { _m.multiplyMatrices(_root, p.local); p.im.setMatrixAt(nR, _m); } });
    nR++;
  }
  const RQ = mulberry(777), RR = Array.from({ length: MAXR }, () => [RQ(), RQ(), RQ(), RQ(), RQ(), RQ()]);

  // ---------- people: simple sketched figures (anonymous, conical hats) ----------
  const clothM = std(0x77716a, 0.95, 0, { map: repTex(71, "h", "#837d75", 2) }), skinM = std(0xd8c2a4, 0.85), hatM = std(0xe6dcc6, 0.9, 0, { map: repTex(72, "h", "#e6dcc6", 1) }), inkM = std(0x2e2c2b, 0.8);
  function person(lantern = false, net = false) {
    const G = new THREE.Group(); scene.add(G);
    const leg = (x) => { const p = new THREE.Group(); p.position.set(x, 0.8, 0); G.add(p); add(new THREE.CylinderGeometry(0.075, 0.06, 0.8, 8), clothM, 0, -0.4, 0, p); add(new THREE.BoxGeometry(0.13, 0.07, 0.25), inkM, 0, -0.8, 0.05, p); return p; };
    const arm = (x) => { const p = new THREE.Group(); p.position.set(x, 1.38, 0); G.add(p); add(new THREE.CylinderGeometry(0.06, 0.055, 0.36, 8), clothM, 0, -0.18, 0, p); const f = new THREE.Group(); f.position.y = -0.36; f.rotation.x = -0.6; p.add(f); add(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 8), clothM, 0, -0.16, 0, f); add(new THREE.SphereGeometry(0.055, 8, 6), skinM, 0, -0.34, 0, f); return { p, f }; };
    const lL = leg(-0.11), lR = leg(0.11);
    add(new THREE.CylinderGeometry(0.27, 0.17, 0.68, 10), clothM, 0, 1.12, 0, G);
    add(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), skinM, 0, 1.48, 0, G);
    add(new THREE.SphereGeometry(0.15, 12, 10), skinM, 0, 1.62, 0, G);
    add(new THREE.ConeGeometry(0.38, 0.2, 18), hatM, 0, 1.8, 0, G);
    const aL = arm(-0.31), aR = arm(0.31);
    let extra = null;
    if (lantern) { extra = add(new THREE.BoxGeometry(0.14, 0.2, 0.14), std(0xfff3d6, 0.4, 0, { emissive: 0xffe2a8, emissiveIntensity: 1.4 }), 0, -0.45, 0.05, aR.f); }
    if (net) { add(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), inkM, 0, -0.2, 0.3, aL.f).rotation.x = 1.1; const n = add(new THREE.TorusGeometry(0.22, 0.02, 6, 16), inkM, 0, 0.35, 0.95, aL.f); n.rotation.x = 1.1; }
    return { G, lL, lR, aL, aR };
  }
  function walk(P, x, z, yaw, t, moving, s = 1) {
    P.G.visible = true; P.G.position.set(x, 0, z); P.G.rotation.y = yaw; P.G.scale.setScalar(s);
    const w = moving ? Math.sin(t * 7.5) : 0;
    P.lL.rotation.x = 0.5 * w; P.lR.rotation.x = -0.5 * w; P.aL.p.rotation.x = -0.4 * w; P.aR.p.rotation.x = 0.4 * w;
  }
  const hunters = Array.from({ length: 4 }, (_, i) => person(true, i % 2 === 0));
  const folks = Array.from({ length: 7 }, () => person(false, false));
  const farmer = person(false, false);

  // ---------- bounty office: table, tray of tails, coins, sign ----------
  const TB = [3.5, 10.4];
  const tableTop = place(sbox(3.8, 0.16, 2.2, { seed: 81, base: "#E2D5BB" }), TB[0], 1.42, TB[1]);
  for (const [dx, dz] of [[-1.7, -0.9], [1.7, -0.9], [-1.7, 0.9], [1.7, 0.9]]) place(sbox(0.14, 1.34, 0.14, { seed: 82, base: "#D9CCB2" }), TB[0] + dx, 0.67, TB[1] + dz);
  ao(4.6, 3.0, TB[0], 0, TB[1], scene, 0.85);
  const trayX = TB[0] + 0.45, trayZ = TB[1] + 0.2, trayY = 1.5;
  const trayDeco = (g, W, H) => { g.fillStyle = ACCD; g.font = `700 ${H * 0.62}px ${TYPE}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("EKOR ✓", W / 2, H * 0.56); };
  place(sbox(2.3, 0.08, 1.5, { seed: 83, base: "#CFC4AE" }), trayX, trayY + 0.04, trayZ);
  place(sbox(2.3, 0.26, 0.08, { seed: 84, base: "#E8DDC6", deco: trayDeco }), trayX, trayY + 0.13, trayZ + 0.75);
  place(sbox(2.3, 0.26, 0.08, { seed: 85, base: "#E8DDC6" }), trayX, trayY + 0.13, trayZ - 0.75);
  for (const s of [-1, 1]) place(sbox(0.08, 0.26, 1.5, { seed: 86, base: "#E8DDC6" }), trayX + s * 1.15, trayY + 0.13, trayZ);
  const MAXT = 90, trayTails = new THREE.InstancedMesh(tailGeo, tailM, MAXT); trayTails.castShadow = true; trayTails.frustumCulled = false; scene.add(trayTails);
  const TQ = mulberry(91);
  for (let i = 0; i < MAXT; i++) { const u = TQ(), v = TQ(); trayTails.setMatrixAt(i, M4(trayX - 0.85 + u * 1.5, trayY + 0.06 + TQ() * 0.08 + (i / MAXT) * 0.12, trayZ - 0.45 + v * 0.9 + 0.55, 0, TQ() * 6.28, 0, 0.8, 0.8, 0.8)); }
  const coinTop = canvasTex(256, 256, (g, W) => { const q = mulberry(4); g.fillStyle = "#C9733F"; g.fillRect(0, 0, W, W); grain(g, W, W, q, 4000, 0.1); g.strokeStyle = "rgba(80,30,15,.7)"; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, W / 2, W * 0.42, 0, 7); g.stroke(); g.fillStyle = "rgba(70,25,10,.85)"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${W * 0.36}px ${HAND}`; g.fillText("1", W / 2, W * 0.42); g.font = `700 ${W * 0.14}px ${TYPE}`; g.fillText("SEN", W / 2, W * 0.7); });
  const coinM = [std(0xb5643a, 0.35, 0.75), std(0xffffff, 0.4, 0.6, { map: coinTop }), std(0xffffff, 0.4, 0.6, { map: coinTop })];
  const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 40);
  for (let i = 0; i < 7; i++) add(coinGeo, coinM, TB[0] - 1.15 + (i % 2) * 0.02, 1.53 + i * 0.062, TB[1] + 0.35);
  for (let i = 0; i < 4; i++) add(coinGeo, coinM, TB[0] - 1.25 + 0.03 * i, 1.53 + i * 0.062, TB[1] - 0.45);
  const coinA = add(coinGeo, coinM, 0, 0, 0);
  const coinB = add(coinGeo, coinM, 0, 0, 0);
  // sign board behind the table
  const sign = plate(3.6, 1.7, (g, W, H) => {
    const q = mulberry(29); g.fillStyle = PAPER; g.fillRect(0, 0, W, H); grain(g, W, H, q, 12000, 0.07); sketchRect(g, 10, 10, W - 20, H - 20, q, 7);
    g.fillStyle = INK; g.textAlign = "center"; g.font = `700 ${H * 0.2}px ${HAND}`; g.fillText("KANTOR HADIAH TIKUS", W / 2, H * 0.3);
    g.fillStyle = ACCD; g.font = `700 ${H * 0.26}px ${HAND}`; g.fillText("1 ekor = 1 sen", W / 2, H * 0.63);
    g.save(); g.translate(W * 0.83, H * 0.85); g.rotate(-0.12); g.strokeStyle = "rgba(46,44,43,.8)"; g.lineWidth = 4; g.strokeRect(-110, -26, 220, 52); g.fillStyle = "rgba(46,44,43,.85)"; g.font = `700 30px ${TYPE}`; g.fillText("ARSIP AUDIRA", 0, 11); g.restore();
  }, TB[0], 3.15, TB[1] - 1.25, scene, 1024, "std");
  for (const s of [-1, 1]) place(sbox(0.1, 3.3, 0.1, { seed: 87 }), TB[0] + s * 1.65, 1.65, TB[1] - 1.3);
  const stampX = plate(2.9, 0.75, (g, W, H) => { g.save(); g.translate(W / 2, H / 2); g.fillStyle = "rgba(241,232,212,.94)"; g.fillRect(-W / 2 + 12, -H / 2 + 12, W - 24, H - 24); g.strokeStyle = ACC; g.lineWidth = 12; g.strokeRect(-W / 2 + 12, -H / 2 + 12, W - 24, H - 24); g.fillStyle = ACC; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${H * 0.55}px ${TYPE}`; g.fillText("DIBATALKAN", 0, 4); g.restore(); }, TB[0], 3.05, TB[1] - 1.2, scene, 1024);
  stampX.rotation.z = 0.12;
  // crate of carcasses: rejected
  const crate = place(sbox(1.3, 0.9, 1.0, { seed: 88, base: "#D6C9AE", deco: (g, W, H) => { g.fillStyle = INK; g.font = `700 ${H * 0.24}px ${TYPE}`; g.textAlign = "center"; g.fillText("BANGKAI", W / 2, H * 0.6); } }), 6.6, 0.45, 11.8);
  ao(1.9, 1.6, 6.6, 0, 11.8, scene, 0.8);
  const crossX = plate(1.5, 1.2, (g, W, H) => { g.strokeStyle = ACC; g.lineWidth = 30; g.lineCap = "round"; g.beginPath(); g.moveTo(W * 0.12, H * 0.12); g.lineTo(W * 0.88, H * 0.88); g.moveTo(W * 0.88, H * 0.12); g.lineTo(W * 0.12, H * 0.88); g.stroke(); }, 6.6, 0.5, 12.33, scene, 512);

  // ---------- foreground dressing on the page (fills the lower third in s1 / s6) ----------
  { const FQ = mulberry(404); const loose = new THREE.InstancedMesh(tailGeo, tailM, 16); loose.castShadow = true; scene.add(loose);
    for (let i = 0; i < 16; i++) loose.setMatrixAt(i, M4(-4 + FQ() * 10, 0.02, 14.6 + FQ() * 3.6, 0, FQ() * 6.28, 0, 1.1, 1.1, 1.1));
    for (let i = 0; i < 5; i++) { const c = add(coinGeo, coinM, -2.5 + FQ() * 8, 0.035 + (i === 2 ? 0.06 : 0), 15 + FQ() * 2.6); c.rotation.z = (FQ() - 0.5) * 0.1; }
    const slip = (g, W, H) => { const q = mulberry(7); g.fillStyle = "#F6EFDF"; g.fillRect(0, 0, W, H); grain(g, W, H, q, 3000, 0.06); sketchRect(g, 6, 6, W - 12, H - 12, q, 4); g.fillStyle = INK2; g.font = `700 ${H * 0.14}px ${TYPE}`; g.textAlign = "left"; g.fillText("TANDA TERIMA", 22, H * 0.25); g.fillStyle = INK; g.font = `700 ${H * 0.26}px ${HAND}`; g.fillText("12 ekor", 22, H * 0.58); g.fillStyle = ACCD; g.fillText("= 12 sen", 22, H * 0.86); };
    for (let i = 0; i < 4; i++) { const m = plate(1.3, 0.9, slip, -3.4 + i * 2.6 + FQ(), 0.02 + i * 0.003, 16.6 + FQ() * 1.4, scene, 512, "std"); m.rotation.set(-Math.PI / 2, 0, (FQ() - 0.5) * 0.8); m.material.depthWrite = true; m.receiveShadow = true; } }

  // ---------- ledger clipboard on an easel ----------
  const LG = [-4.2, 10.2];
  place(sbox(2.6, 1.2, 1.6, { seed: 92, base: "#E2D5BB" }), LG[0], 0.6, LG[1]);
  ao(3.2, 2.2, LG[0], 0, LG[1], scene, 0.85);
  const ledgerG = new THREE.Group(); ledgerG.position.set(LG[0], 2.4, LG[1] + 0.2); ledgerG.rotation.x = -0.42; scene.add(ledgerG);
  place(sbox(1.75, 2.45, 0.08, { seed: 93, base: "#8E8173" }), 0, 0, -0.06, ledgerG);
  add(new THREE.BoxGeometry(0.7, 0.16, 0.08), std(0xa6a39e, 0.3, 0.85), 0, 1.13, 0.03, ledgerG);
  const ROWS = [["akhir April 1902", "7.985"], ["30 Mei 1902", "15.041"], ["21 Juni 1902", "20.112"]];
  const ledgerTex = [0, 1, 2, 3].map((n) => canvasTex(640, 900, (g, W, H) => {
    const q = mulberry(95); g.fillStyle = "#F4ECDA"; g.fillRect(0, 0, W, H); grain(g, W, H, q, 20000, 0.06);
    g.strokeStyle = "rgba(90,110,140,.25)"; g.lineWidth = 2; for (let y = 170; y < H; y += 60) { g.beginPath(); g.moveTo(30, y); g.lineTo(W - 30, y); g.stroke(); }
    g.fillStyle = INK; g.textAlign = "left"; g.font = `700 50px ${HAND}`; g.fillText("Tangkapan tikus", 40, 92);
    g.font = `700 26px ${TYPE}`; g.fillStyle = INK2; g.fillText("HANOI · GOT · PER HARI", 42, 136);
    ROWS.slice(0, n).forEach(([d, v], i) => {
      const y = 260 + i * 170; const last = i === 2;
      g.fillStyle = INK2; g.font = `400 38px ${HAND}`; g.fillText(d, 44, y);
      g.fillStyle = last ? ACCD : INK; g.font = `700 ${last ? 92 : 78}px ${HAND}`; g.textAlign = "right"; g.fillText(v, W - 44, y + 86); g.textAlign = "left";
      if (last) { g.strokeStyle = ACC; g.lineWidth = 7; g.beginPath(); g.moveTo(W - 330, y + 108); g.quadraticCurveTo(W - 180, y + 118, W - 40, y + 102); g.stroke(); }
    });
    g.save(); g.translate(150, H - 70); g.rotate(-0.1); g.strokeStyle = "rgba(46,44,43,.7)"; g.lineWidth = 4; g.strokeRect(-110, -28, 220, 56); g.fillStyle = "rgba(46,44,43,.8)"; g.font = `700 28px ${TYPE}`; g.textAlign = "center"; g.fillText("ARSIP AUDIRA", 0, 10); g.restore();
  }));
  const ledgerPage = add(new THREE.PlaneGeometry(1.6, 2.25), std(0xffffff, 0.92, 0, { map: ledgerTex[0] }), 0, -0.04, 0.0);
  ledgerG.add(ledgerPage); ledgerPage.position.z = 0.0;

  // ---------- card map of French Indochina on a tilted board ----------
  const MP = [15.2, -2.6];
  const mapG = new THREE.Group(); mapG.position.set(MP[0], 1.6, MP[1]); mapG.rotation.x = -0.62; scene.add(mapG);
  place(sbox(6.6, 8.6, 0.2, { seed: 97, base: "#8E8173" }), 0, 0, -0.12, mapG);
  ao(7.2, 6.0, MP[0], 0, MP[1] + 0.4, scene, 0.9);
  for (const s of [-1, 1]) place(sbox(0.2, 3.2, 0.2, { seed: 98 }), MP[0] + s * 2.6, 1.6, MP[1] - 1.7);
  const mapTex = canvasTex(1024, 1334, (g, W, H) => {
    const q = mulberry(99); g.fillStyle = "#F4ECDA"; g.fillRect(0, 0, W, H); grain(g, W, H, q, 40000, 0.06);
    sketchRect(g, 14, 14, W - 28, H - 28, q, 6);
    const S = 74, cx = W * 0.52, cy = H * 0.56;
    const pj = (lo, la) => [cx + (lo - 105) * 0.96 * S, cy - (la - 15.9) * S];
    const fr = ["Vietnam", "Laos", "Cambodia"];
    for (const c of GEO) for (const ring of c.rings) {
      g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = pj(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
      if (fr.includes(c.name)) { g.fillStyle = "rgba(200,190,170,.55)"; g.fill(); g.save(); g.clip(); hatch(g, W, H, q, 0.9, 11, 0.3); g.restore(); g.strokeStyle = "rgba(40,38,37,.9)"; g.lineWidth = 4; g.stroke(); }
      else { g.strokeStyle = "rgba(40,38,37,.35)"; g.lineWidth = 2.5; g.stroke(); }
    }
    g.fillStyle = INK; g.textAlign = "center"; g.font = `700 56px ${HAND}`; g.fillText("Indochina Prancis", W / 2, 96);
    g.font = `700 26px ${TYPE}`; g.fillStyle = INK2; g.fillText("VIETNAM · LAOS · KAMBOJA · 1902", W / 2, 140);
    const [hx, hy] = pj(105.85, 21.03), [sx, sy] = pj(106.7, 10.78);
    g.setLineDash([18, 12]); g.strokeStyle = ACC; g.lineWidth = 7; g.beginPath(); g.moveTo(sx + 10, sy - 20); g.bezierCurveTo(sx + 220, sy - 300, hx + 260, hy + 260, hx + 22, hy + 22); g.stroke(); g.setLineDash([]);
    g.fillStyle = ACC; g.beginPath(); g.moveTo(hx + 14, hy + 14); g.lineTo(hx + 52, hy + 30); g.lineTo(hx + 30, hy + 52); g.fill();
    g.fillStyle = INK2; g.beginPath(); g.arc(sx, sy, 13, 0, 7); g.fill();
    g.fillStyle = ACC; g.beginPath(); g.arc(hx, hy, 19, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    g.textAlign = "left"; g.fillStyle = ACCD; g.font = `700 52px ${HAND}`; g.fillText("Hanoi", hx + 34, hy - 18);
    g.fillStyle = INK2; g.font = `700 24px ${TYPE}`; g.fillText("IBU KOTA BARU 1902", hx + 36, hy + 16);
    g.font = `700 40px ${HAND}`; g.fillStyle = INK2; g.fillText("Saigon", sx + 26, sy + 12);
    g.font = `400 30px ${HAND}`; g.fillText("dipindah →", sx + 120, sy - 160);
    g.fillStyle = "rgba(46,44,43,.5)"; g.font = `400 28px ${HAND}`; g.textAlign = "center"; g.fillText("Tiongkok", W * 0.45, 210); g.fillText("Siam", W * 0.2, H * 0.5);
  });
  const mapPage = add(new THREE.PlaneGeometry(6.2, 8.08), std(0xffffff, 0.92, 0, { map: mapTex }), 0, 0, 0.0, mapG);

  // ---------- magnifier + flea ----------
  const mag = new THREE.Group(); scene.add(mag);
  add(new THREE.TorusGeometry(0.72, 0.07, 10, 40), std(0x3b3937, 0.35, 0.7), 0, 0, 0, mag);
  const lens = add(new THREE.CircleGeometry(0.7, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.2, transparent: true, opacity: 0.35, ior: 1.4 }), 0, 0, 0, mag);
  const hdl = add(new THREE.CylinderGeometry(0.07, 0.09, 1.1, 10), std(0x3b3937, 0.5, 0.3), 0.55, -0.95, 0, mag); hdl.rotation.z = 0.55;
  const flea = new THREE.Group(); mag.add(flea); flea.position.z = 0.15;
  add(new THREE.SphereGeometry(0.2, 14, 10), std(0x5a3a2c, 0.4, 0.1), 0, 0, 0, flea).scale.set(1.1, 1.35, 0.8);
  add(new THREE.SphereGeometry(0.1, 10, 8), std(0x4a2f24, 0.4), 0, 0.27, 0.02, flea);
  for (let i = 0; i < 6; i++) { const s = i < 3 ? -1 : 1, k = i % 3; const l = add(new THREE.CylinderGeometry(0.015, 0.012, 0.42, 5), std(0x3a2a22, 0.5), s * 0.22, 0.05 - k * 0.12, 0.02, flea); l.rotation.z = s * (0.9 + k * 0.25); }

  // ---------- scissors ----------
  const sci = new THREE.Group(); scene.add(sci);
  const bladeM = std(0xe2ded6, 0.3, 0.35);
  const bl1 = new THREE.Group(), bl2 = new THREE.Group(); sci.add(bl1, bl2);
  for (const [b, s] of [[bl1, 1], [bl2, -1]]) { add(new THREE.BoxGeometry(0.9, 0.04, 0.12), bladeM, 0.45, 0, 0, b); const h = add(new THREE.TorusGeometry(0.16, 0.04, 8, 20), std(0x3b3937, 0.5, 0.3), -0.3, 0, s * 0.12, b); h.rotation.x = Math.PI / 2; }
  const snipLab = plate(1.1, 0.38, paperCard("potong!", "", true), 0, 0, 0);
  const flyTail = new THREE.Mesh(tailGeo, tailM); flyTail.castShadow = true; scene.add(flyTail);

  // ---------- smuggling cart + rat farm on the city's edge ----------
  const cart = new THREE.Group(); scene.add(cart);
  place(sbox(1.6, 0.6, 1.0, { seed: 101, base: "#D6C9AE" }), 0, 0.75, 0, cart);
  for (const s of [-1, 1]) { const w = add(new THREE.TorusGeometry(0.36, 0.06, 8, 20), inkM, -0.1, 0.38, s * 0.56, cart); w.rotation.y = 0; }
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), inkM, 1.3, 0.75, 0, cart).rotation.z = 1.35;
  const cartLab = plate(3.0, 0.85, paperCard("dari luar kota", "", false), 0, 2.4, 0, cart);
  const FM = [-15.0, -2.2];
  const farm = new THREE.Group(); farm.position.set(FM[0], 0, FM[1]); scene.add(farm);
  const hut = place(sbox(3.0, 1.6, 2.2, { seed: 111, base: "#D9CDB3" }), -1.6, 0.8, -2.0, farm);
  { const sh = new THREE.Shape(); sh.moveTo(-1.7, 0); sh.lineTo(1.7, 0); sh.lineTo(0, 1.0); sh.closePath(); const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.5, bevelEnabled: false }); geo.translate(0, 0, -1.25); const m = add(geo, std(0xffffff, 0.85, 0, { map: roofTex }), -1.6, 1.6, -2.0, farm); farm.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineM).translateX(-1.6).translateY(1.6).translateZ(-2.0)); }
  ao(4, 3, -1.6, 0, -2.0, farm, 0.8);
  const crateDeco = (g, W, H) => { g.fillStyle = "rgba(30,28,27,.85)"; for (let i = 1; i < 5; i++) g.fillRect((W * i) / 5 - 5, 6, 10, H - 12); };
  const CR = [[0.8, -2.2], [2.2, -2.2], [0.8, -0.7], [2.2, -0.7], [-1.2, 0.6], [0.2, 0.9], [1.6, 0.9]];
  CR.forEach(([x, z], i) => { place(sbox(1.15, 0.8, 1.0, { seed: 120 + i, base: "#D9CCB1", deco: crateDeco }), x, 0.4, z, farm); ao(1.6, 1.4, x, 0, z, farm, 0.7); });
  const farmSign = plate(3.6, 1.1, paperCard("PETERNAKAN TIKUS", "pinggiran Hanoi", true), 0.4, 2.9, -1.0, farm);
  for (const s of [-1, 1]) place(sbox(0.08, 2.4, 0.08, { seed: 130 }), 0.4 + s * 1.6, 1.2, -1.05, farm);

  // ---------- chain of paper tags (camera HUD) ----------
  const hud = new THREE.Group(); cam.add(hud); hud.position.set(0, 0, -10);
  const KP = (2 * 10 * Math.tan((19 * Math.PI) / 180)) / 1920; // world units per px at the HUD plane
  const TAGS = [["GOT MODERN", "> 19 km di bawah kota", "s2:saluran"], ["TIKUS BERKEMBANG BIAK", "tanpa pemangsa", "s3:berkembang"], ["TAKUT WABAH PES", "dibawa kutu tikus", "s3:wabah"], ["PEMBURU BAYARAN", "April 1902", "s4:pemburu"],
    ["1 SEN PER EKOR", "bukti cukup ekornya", "s5:sen"], ["EKOR DIPOTONG", "tikus dilepas lagi", "s6:memotong"], ["PETERNAKAN TIKUS", "pinggiran Hanoi", "s6:peternakan"], ["TIKUS MAKIN BANYAK", "hadiah dibatalkan", "s7:lebih"]];
  const TW = 300, TH = 122, GAP = 36, TCH = 260;
  const tagPaint = (i, on) => (g, W, H) => {
    const q = mulberry(300 + i); g.clearRect(0, 0, W, H);
    g.fillStyle = "rgba(20,16,12,.35)"; g.fillRect(10, 12, W - 12, H - 12);
    g.fillStyle = PAPER; g.fillRect(2, 2, W - 12, H - 12); grain(g, W - 12, H - 12, q, 5000, 0.07);
    sketchRect(g, 6, 6, W - 20, H - 20, q, on ? 7 : 4, on ? 1 : 0.8);
    if (on) { g.fillStyle = ACC; g.fillRect(6, 6, 18, H - 20); }
    g.fillStyle = on ? ACC : INK; g.beginPath(); g.arc(W - 38, H * 0.24, 20, 0, 7); g.fill();
    g.fillStyle = "#F4ECDA"; g.font = `700 22px ${TYPE}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), W - 38, H * 0.25);
    const words = TAGS[i][0].split(" "); let fs = 64, lines;
    const fit = () => { g.font = `700 ${fs}px ${HAND}`; lines = [words.join(" ")]; if (g.measureText(lines[0]).width > W - 110) { let best = null; for (let k = 1; k < words.length; k++) { const a = words.slice(0, k).join(" "), b = words.slice(k).join(" "); const m = Math.max(g.measureText(a).width, g.measureText(b).width); if (!best || m < best[0]) best = [m, a, b]; } lines = [best[1], best[2]]; return best[0] <= W - 110; } return true; };
    while (!fit() && fs > 34) fs -= 2;
    g.fillStyle = on ? ACCD : INK; g.textAlign = "left";
    if (lines.length === 1) g.fillText(lines[0], 40, H * 0.5); else { g.fillText(lines[0], 40, H * 0.32); g.fillText(lines[1], 40, H * 0.68); }
  };
  const tags = TAGS.map((tg, i) => {
    const mOn = basic({ map: canvasTex(640, TCH, tagPaint(i, true)), depthTest: false }), mOff = basic({ map: canvasTex(640, TCH, tagPaint(i, false)), depthTest: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(TW * KP, TH * KP * (230 / 230) * (640 / 640) * (230 / 640) * (TW / TH)), mOn);
    m.geometry = new THREE.PlaneGeometry(TW * KP, TW * KP * (TCH / 640));
    m.renderOrder = 20; hud.add(m);
    return { m, mOn, mOff, at: A(tg[2]) };
  });
  const linkM = new THREE.MeshStandardMaterial({ color: 0x55524e, roughness: 0.3, metalness: 0.85, depthTest: false });
  const linkGeo = new THREE.TorusGeometry(9 * KP, 2.6 * KP, 8, 20);
  const links = TAGS.slice(1).map(() => { const a = new THREE.Mesh(linkGeo, linkM), b = new THREE.Mesh(linkGeo, linkM); a.renderOrder = b.renderOrder = 21; hud.add(a, b); return [a, b]; });
  const loopM = basic({ color: ACC, depthTest: false, opacity: 1 });
  let loopMesh = null, loopHead = new THREE.Mesh(new THREE.ConeGeometry(12 * KP, 30 * KP, 12), loopM); loopHead.renderOrder = 22; hud.add(loopHead);
  const px2 = (x, y) => [(x - 540) * KP, (960 - y) * KP];
  const SW = (n) => Math.max(0, 56 + n * TW + (n - 1) * GAP - 1024);

  // ---------- camera ----------
  const s2a = A("s2:Ini"), cityT = A("s2:Prancis") - 0.1, sew = A("s2:pembuangan") - 0.6;
  const CAM = track([
    [0, 5.4, 4.4, 18.6, 3.4, 1.6, 10.6], [A("s1:membayar") + 0.3, 5.0, 5.0, 19.8, 3.2, 1.5, 10.6], [A("s1:tikus") + 0.1, 3.6, 7.4, 25.0, 2.0, 0.6, 10.2], [s2a - 0.05, 3.0, 8.0, 26.2, 1.6, 0.6, 10.0],
    [s2a + 0.02, 15.6, 13.2, 9.0, 15.2, 3.0, -1.4], [cityT, 15.0, 14.0, 10.5, 14.8, 3.2, -1.5],
    [cityT + 2.4, 8.5, 24.0, 21.0, 0.5, 5.0, -2.2], [sew - 0.4, 4.0, 21.0, 24.0, 0.0, 4.6, -1.0],
    [sew + 2.0, 0.8, 7.5, 24.0, 0.0, 3.0, 3.6], [K.s3 - 0.1, -0.6, 7.0, 23.5, -0.4, 2.9, 3.8],
    [A("s3:tol") - 0.3, -3.5, 3.6, 15.5, -1.2, 1.7, 3.6], [A("s3:biak"), -1.2, 3.6, 16.0, 0.4, 1.7, 3.6],
    [A("s3:naik") + 1.0, 3.8, 10.5, 16.5, 3.8, 5.8, 2.6], [A("s3:Padahal") - 0.2, 4.8, 10.0, 15.5, 4.4, 6.0, 3.2],
    [A("s3:kutu") + 0.4, 6.0, 8.6, 12.8, 4.9, 6.2, 4.6], [K.s4 - 0.06, 6.1, 8.5, 12.6, 5.0, 6.2, 4.6],
    [K.s4 + 0.02, 2.8, 3.6, 16.0, 0.0, 1.7, 3.8], [A("s4:got") - 0.2, 1.0, 3.6, 15.5, -0.6, 1.7, 3.8],
    [A("s4:satu") + 0.3, -3.5, 5.2, 15.6, -4.2, 2.3, 10.1], [A("s4:sehari"), -3.6, 4.9, 15.2, -4.2, 2.35, 10.2],
    [A("s4:Tapi") + 0.6, 0.2, 7.5, 26.0, 0.2, 0.9, 5.6], [K.s5 - 0.06, 0.6, 7.6, 26.2, 0.4, 0.9, 5.8],
    [K.s5 + 0.02, 7.0, 5.8, 20.5, 3.0, 1.6, 10.6], [A("s5:Buktinya"), 6.0, 5.4, 19.8, 3.4, 1.5, 10.8], [K.s6 - 0.06, 5.6, 5.2, 19.6, 3.6, 1.4, 11.0],
    [K.s6 + 0.02, 1.2, 5.6, 22.5, 0.6, -0.6, 13.0], [A("s6:Pemburu") - 0.2, 1.2, 3.1, 20.4, 1.15, 0.35, 13.2], [A("s6:melepas") + 0.3, 1.4, 3.0, 19.5, 1.2, 0.3, 12.9], [A("s6:beranak") + 0.3, 0.3, 5.0, 21.0, -0.4, -0.4, 13.2], [A("s6:Ada") - 0.1, -1.6, 5.6, 22.0, -2.4, -0.2, 12.4],
    [A("s6:menyelundupkan") + 1.0, -12.0, 7.4, 21.0, -13.8, 0.4, 9.2], [A("s6:Bahkan") - 0.1, -11.5, 7.8, 18.5, -13.0, 1.0, 5.0],
    [A("s6:peternakan") + 0.4, -10.2, 9.0, 12.5, -14.2, 1.2, -2.0], [K.s7 - 0.06, -10.0, 9.2, 12.2, -14.2, 1.2, -2.2],
    [K.s7 + 0.02, 5.0, 4.6, 18.5, 3.5, 2.4, 9.4], [A("s7:dan"), 4.6, 4.6, 18.0, 3.5, 2.4, 9.4],
    [A("s7:dan") + 2.6, -1.0, 17.0, 25.0, 0.0, 3.4, 1.0], [K.s8 - 0.2, 0.0, 14.5, 22.5, 0.0, 4.0, 0.0],
    [A("s8:Sejarawan") + 2.5, 0.0, 24.0, 33.0, -1.0, 2.0, 0.0], [K.dur, 0.0, 27.0, 36.0, -1.0, 1.5, 0.0],
  ]);

  const look = new THREE.Vector3();

  return function draw(t) {
    nR = 0;
    // ---- city rise ----
    city.forEach((c) => {
      const t0 = cityT - 0.3 + c.d, lift = eout((t - t0) / 0.45), fill = smooth((t - t0 - 0.3) / 0.6);
      c.wire.scale.y = Math.max(0.001, lift); c.wire.visible = lift > 0.001;
      c.plane.constant = fill >= 1 ? 1e3 : SY + c.h * fill + 0.001;
      c.b.mesh.visible = fill > 0.001; c.g.children.forEach((ch) => { if (ch !== c.wire && ch !== c.sh) ch.visible = fill > 0.001; });
      c.sh.visible = lift > 0.05;
    });
    trees.forEach((g, i) => { const k = back(clamp01((t - cityT - 1.6 - i * 0.08) / 0.4)); g.scale.setScalar(Math.max(0.001, k)); g.visible = k > 0.001; });
    brandSign.position.y = SY + 0.95 * smooth((t - cityT - 0.8) / 0.4); brandSign.visible = t > cityT + 0.8;
    // pencil: draws the city, then rests on the page
    { const u = clamp01((t - cityT + 0.6) / 3.2), act = t > cityT - 0.6 && t < cityT + 2.8;
      if (act) { const c = city[Math.min(city.length - 1, Math.floor(u * city.length))]; const w = Math.sin(t * 9) * 0.3; pencil.position.set(c.x + 1.0 + w, SY + 3.6 + c.h, c.z + 1.6); pencil.rotation.set(-0.5, 0, -0.45); }
      else { pencil.position.set(11.8, 0.24, 7.5); pencil.rotation.set(Math.PI / 2, 0, 0.9); pencil.rotation.order = "XYZ"; } }
    // Doumer tag + quarter tag
    { const k = win(t, A("s2:Gubernur") - 0.2, sew + 0.6, 0.3, 0.4); doumer.visible = k > 0.002; doumer.position.set(palace.x, SY + palace.h, palace.z); doumer.scale.setScalar(Math.max(0.001, back(k))); dTag.quaternion.copy(cam.quaternion); }
    { const k = win(t, A("s3:mewah") - 0.3, A("s3:Padahal"), 0.3, 0.3); quarterTag.visible = k > 0.002; quarterTag.material.opacity = k; quarterTag.quaternion.copy(cam.quaternion); }
    // sewer labels
    { const k = win(t, A("s2:lebih") - 0.2, K.s3 + 0.6, 0.3, 0.4); kmLine.visible = k > 0.002; kmLine.scale.x = Math.max(0.001, eout((t - A("s2:lebih") + 0.2) / 0.9)); kmLab.visible = k > 0.002; kmLab.material.opacity = k; }
    ribs.forEach((rb, i) => { const u = back(clamp01((t - A("s2:saluran") + 0.2 - i * 0.05) / 0.35)); rb.scale.setScalar(t < A("s2:saluran") - 0.2 ? 1 : Math.max(0.001, 0.6 + 0.4 * u)); });
    { const k = win(t, A("s3:tol") - 0.2, A("s3:naik"), 0.25, 0.4); tolLab.visible = k > 0.002; tolLab.material.opacity = k; tolLab.position.y = 2.85 - 0.3 * (1 - eout((t - A("s3:tol") + 0.2) / 0.4)); }
    { const k = win(t, A("s3:Tanpa") - 0.15, A("s3:naik"), 0.25, 0.4); catLab.visible = k > 0.002; catLab.material.opacity = k; catLab.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s3:Tanpa") + 0.15) / 0.3)))); }
    { const k = win(t, A("s3:kutu") - 0.3, K.s4 + 0.1, 0.3, 0.2); fleaLab.visible = k > 0.002; fleaLab.material.opacity = k; fleaLab.quaternion.copy(cam.quaternion); }
    // magnifier
    { const k = win(t, A("s3:wabah") - 0.4, K.s4 + 0.1, 0.4, 0.2); mag.visible = k > 0.002; mag.position.set(5.0 + 0.05 * Math.sin(t), 6.3 + 0.04 * Math.sin(t * 1.3), 5.0); mag.quaternion.copy(cam.quaternion); mag.scale.setScalar(Math.max(0.001, k));
      flea.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s3:kutu") + 0.3) / 0.4)))); flea.rotation.z = 0.15 * Math.sin(t * 3); }

    // ---- rats ----
    // s1: hero rat on the table, sniffing the coin
    if (t < K.s2) { const k = clamp01(t / 0.3); rat(TB[0] - 0.35, 1.5, TB[1] + 0.95, -2.2 + 0.2 * Math.sin(t * 2), 0.55 * k, 1, 0, t * 0); }
    // s1: pour out of the sewer mouth
    { const t0 = A("s1:membayar") + 0.1, t1 = A("s1:Hasilnya") - 0.2; if (t > t0 && t < K.s2 + 0.3) { const n = Math.floor(110 * clamp01((t - t0) / 1.5)) + Math.floor(90 * clamp01((t - t1) / 1.6)); for (let i = 0; i < n; i++) { const R = RR[i], ti = (i < 110 ? t0 + i * 0.012 : t1 + (i - 110) * 0.015), p = eout((t - ti) / 1.3); const sx = -2.5 + R[0] * 9, dx = -3.0 + R[1] * 12.5, dz = 6.8 + R[2] * (i < 110 ? 7.5 : 10.5); const x = lerp(sx, dx, p) + 0.12 * Math.sin(t * 1.7 + R[3] * 6) * p, z = lerp(5.4, dz, p); rat(x, z < 6 ? 0.12 : 0, z, Math.atan2(dx - sx, dz - 5.4), 0.38 + R[4] * 0.12, 1, 0, t * 9 + R[5] * 6); } } }
    // tunnel highway (hook, s2 end -> s4, s7 -> end)
    { let n = 0;
      if (t > A("s1:membayar") && t < K.s2 + 0.2) n = 60;
      if (t > sew - 0.5 && t < K.s5 + 0.3) n = Math.round(lerp(26, 150, smooth((t - A("s3:Tanpa")) / (A("s3:naik") - A("s3:Tanpa")))));
      if (t > K.s7 + 1.0) n = 170;
      for (let i = 0; i < n; i++) { const R = RR[200 + i], dir = R[2] < 0.5 ? 1 : -1, sp = 1.4 + R[3] * 1.6; const x = -8.3 + mod(R[4] * 16.6 + dir * sp * t, 16.6); const z = R[0] < 0.5 ? 2.35 + R[1] * 0.75 : 4.75 + R[1] * 0.9; rat(x, 0.12, z, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0.34 + R[5] * 0.1, 1, 0, t * 11 + R[3] * 6); } }
    // s3: climb out of the manhole into the European quarter
    { const ta = A("s3:naik") - 0.4; if (t > ta && t < K.s4 + 0.1) { for (let i = 0; i < 40; i++) { const R = RR[60 + i], ti = ta + i * 0.11, u = t - ti; if (u < 0) continue; const s = 0.3 + R[0] * 0.08;
      if (u < 0.6) { rat(MH[0], lerp(1.2, SY, u / 0.6), MH[1], 0, s, 1, -Math.PI / 2); continue; }
      const p = eout((u - 0.6) / 2.2), dx = 2.0 + R[1] * 6.6, dz = 3.4 + R[2] * 2.2; rat(lerp(MH[0], dx, p) + 0.1 * Math.sin(t * 2 + i) * p, SY, lerp(MH[1], dz, p), Math.atan2(dx - MH[0], dz - MH[1]) + (p >= 1 ? Math.sin(t * 1.5 + i) : 0), s, 1, 0, t * 10 + i); } }
      if (t > A("s3:wabah") - 0.5 && t < K.s4 + 0.1) rat(4.6, SY, 4.9, 0.6 + 0.1 * Math.sin(t * 2), 0.75, 1, 0, 0); }
    // s4: rats still in the tunnel are drawn by the highway above; hunters walk the tunnel
    hunters.forEach((h, i) => { if (t > K.s4 - 0.3 && t < K.s5 - 0.2) { const x = -6.2 + i * 1.3 + 0.9 * (t - K.s4); walk(h, x, i % 2 ? 2.7 : 5.1, Math.PI / 2, t + i, true, 0.95); } else h.G.visible = false; });
    // s5: townsfolk queue toward the table
    folks.forEach((f, i) => { const t0 = A("s5:Siapa") - 0.4 + i * 0.25; if (t > t0 && t < K.s6 - 0.1) { const p = eout((t - t0) / 3.2), x = lerp(-6.5 - i * 1.0, 0.8 - i * 0.62, p), z = 12.4 + (i % 2) * 0.3; walk(f, x, z, p < 1 ? Math.PI / 2 : 1.2, t, p < 1); } else f.G.visible = false; });
    // s6: tailless live rat; snip; mother + babies
    { const tA = A("s6:hidup") - 0.5, tB = A("s6:Pemburu") - 0.1; if (t > K.s6 - 0.3 && t < tB) { const p = clamp01((t - K.s6) / (tB - K.s6)); rat(lerp(-2.6, 2.4, p), 0, 13.6, Math.PI / 2, 1.05, 0, 0, t * 8); } }
    const snipT = A("s6:ekornya") - 0.05, relT = A("s6:melepas");
    { const on = t > A("s6:Pemburu") - 0.4 && t < A("s6:beranak") - 0.3; if (on) {
        const run = clamp01((t - relT) / 1.3), rx = 0.6, rz = lerp(13.2, 6.4, eout(run));
        rat(rx, 0, rz, run > 0 ? Math.PI : -Math.PI / 2 + 0.1 * Math.sin(t * 3), 1.0, t < snipT ? 1 : 0, 0, run > 0 ? t * 10 : 0);
        const open = t < snipT ? 0.45 + 0.08 * Math.sin(t * 6) : 0.45 * (1 - clamp01((t - snipT) / 0.08)) + 0.02;
        sci.visible = t < relT + 0.6; sci.position.set(rx + 1.8, 0.2, 13.35); sci.scale.setScalar(1.4); sci.rotation.set(Math.PI / 2, 0, Math.PI - 0.12); bl1.rotation.y = open; bl2.rotation.y = -open;
      } else sci.visible = false;
      { const k = win(t, snipT - 0.02, relT + 0.3, 0.12, 0.3); snipLab.visible = k > 0.002; snipLab.material.opacity = k; snipLab.position.set(1.75, 1.05, 13.5); snipLab.quaternion.copy(cam.quaternion); snipLab.scale.setScalar(Math.max(0.001, back(clamp01((t - snipT) / 0.25)))); }
      const ft = clamp01((t - snipT) / 0.8); flyTail.visible = t > snipT && t < snipT + 1.2 && t < A("s6:beranak");
      if (flyTail.visible) { flyTail.position.set(lerp(1.0, trayX, ft), 0.3 + Math.sin(ft * Math.PI) * 1.8 + ft * 1.3, lerp(13.2, trayZ, ft)); flyTail.rotation.set(ft * 6, ft * 4, 0); flyTail.scale.setScalar(1.1); } }
    { const tb = A("s6:beranak") - 0.3; if (t > tb && t < A("s6:menyelundupkan") + 0.5) { rat(-0.6, 0, 12.8, 0.4 + 0.1 * Math.sin(t), 1.0, 0, 0, 0); for (let i = 0; i < 7; i++) { const k = back(clamp01((t - tb - 0.3 - i * 0.18) / 0.35)); const a = -1.2 + i * 0.4; rat(-0.6 + Math.sin(a) * 1.8, 0, 12.8 + Math.cos(a) * 1.5, a + Math.PI + 0.2 * Math.sin(t * 3 + i), 0.45 * k, 1, 0, t * 6 + i); } } }
    // s6: smuggling cart from outside town
    { const ta = A("s6:Ada") - 0.4; cart.visible = t > ta && t < A("s6:peternakan") + 1.5; if (cart.visible) { const p = smooth((t - ta) / 3.6); const x = lerp(-21, -10.8, p), z = lerp(11.5, 8.0, p); cart.position.set(x, 0, z); cart.rotation.y = Math.atan2(-(8.0 - 11.5), -10.8 + 21) * 0 - 0.33; cartLab.quaternion.copy(cart.quaternion.clone().invert().multiply(cam.quaternion)); cartLab.material.opacity = win(t, ta + 0.5, A("s6:peternakan") + 1.2, 0.3, 0.3);
      walk(farmer, x + 1.9 * Math.cos(0.33), z - 1.9 * Math.sin(0.33), Math.PI / 2 - 0.33, t, p < 1); const c = Math.cos(-0.33), s = Math.sin(-0.33);
      for (let i = 0; i < 7; i++) { const lx = -0.55 + (i % 4) * 0.36, lz = -0.25 + Math.floor(i / 4) * 0.45; rat(x + lx * c + lz * s, 1.05, z - lx * s + lz * c, 0.3 * i + Math.sin(t * 2 + i) * 0.3, 0.38, 1, -0.3, 0); } } else farmer.G.visible = false; }
    // s6-s8: rat farm
    { const ta = A("s6:Bahkan") - 1.5; if (t > ta) { const k = clamp01((t - ta) / 0.6); CR.forEach(([cx, cz], j) => { for (let i = 0; i < 5; i++) { const R = RR[110 + j * 5 + i]; rat(FM[0] + cx - 0.4 + R[0] * 0.8, 0.8, FM[1] + cz - 0.3 + R[1] * 0.6, R[2] * 6.28 + Math.sin(t + i) * 0.4, 0.3 * k, 1, 0, 0); } });
      for (let i = 0; i < 26; i++) { const R = RR[160 + i], a = R[0] * 6.28 + t * (0.2 + R[1] * 0.3) * (R[2] < 0.5 ? 1 : -1), rr = 2.6 + R[3] * 1.4; rat(FM[0] + 0.6 + Math.cos(a) * rr, 0, FM[1] - 0.6 + Math.sin(a) * rr, -a + (R[2] < 0.5 ? 0 : Math.PI), 0.33 * k, 1, 0, t * 9 + i); } } }
    // s7-s8: rats everywhere in the city and on the page
    { const ta = A("s7:tikusnya") - 0.4; if (t > ta) { const n = Math.floor(190 * clamp01((t - ta) / 2.0)); for (let i = 0; i < n; i++) { const R = RR[(i * 7) % MAXR], ph = R[0] * 6.28 + t * (0.15 + R[1] * 0.25);
      if (i < 110) { const along = R[2] < 0.5; const x = along ? -8.6 + mod(R[3] * 17.2 + t * (R[4] - 0.5) * 3, 17.2) : -0.2 + R[3] * 0.9, z = along ? -0.8 + R[4] * 1.2 : -9.6 + mod(R[5] * 15.4 + t * (R[0] - 0.5) * 3, 15.4); rat(x, SY, z, along ? (R[4] > 0.5 ? Math.PI / 2 : -Math.PI / 2) : (R[0] > 0.5 ? 0 : Math.PI), 0.3, 1, 0, t * 9 + i); }
      else { const rr = 3 + R[3] * 9; rat(Math.cos(ph) * rr * 1.3, 0, 9.8 + Math.sin(ph) * rr * 0.4 + R[5] * 2.5, -ph, 0.36, R[5] < 0.25 ? 0 : 1, 0, t * 9 + i); } } } }
    PART.forEach((p) => { p.im.count = nR; p.im.instanceMatrix.needsUpdate = true; });

    // ---- tray tails ----
    trayTails.count = Math.min(MAXT, 34 + (t > A("s1:dibunuh") ? 2 : 0) + Math.floor(34 * clamp01((t - A("s5:Buktinya")) / 4)) + (t > snipT + 0.8 ? 1 : 0));
    // ---- coins ----
    { const tc = A("s1:membayar") - 0.25, u = clamp01((t - tc) / 0.55); coinA.visible = t > tc - 0.4 && t < K.s2 + 0.3;
      coinA.position.set(TB[0] - 0.55, lerp(4.2, 1.56, u * u), TB[1] + 0.5); coinA.rotation.set(u < 1 ? t * 14 : 0.06, 0, u < 1 ? 0.5 : 0.08);
      const tb = A("s5:satu") - 0.4, v = clamp01((t - tb) / 1.1); coinB.visible = t > tb - 0.2 && t < K.s6 + 0.3; coinB.scale.setScalar(1.7);
      coinB.position.set(TB[0] - 0.9, 1.6 + Math.sin(v * Math.PI) * 1.4 + (1 - v) * 0 + (v >= 1 ? 0 : 0.0) + 0.05, TB[1] + 0.75); coinB.rotation.set(v < 1 ? v * 18.85 + 1.2 : Math.PI / 2 - 0.35, 0.3, 0); }
    // ---- stamp + crate ----
    { const ts = A("s7:dibatalkan") - 0.1, u = clamp01((t - ts) / 0.2); stampX.visible = t > ts && t < A("s7:dan") + 2.6; stampX.scale.setScalar(Math.max(0.001, lerp(1.8, 1, u * u))); stampX.material.opacity = u; }
    { const tx = A("s5:bangkai") - 0.25, u = clamp01((t - tx) / 0.2); crossX.visible = t > tx && t < K.s6 + 0.2; crossX.scale.setScalar(lerp(1.6, 1, u)); crossX.material.opacity = u; }
    // ---- ledger ----
    { const n = (t > A("s4:turun") ? 1 : 0) + (t > A("s4:satu") ? 1 : 0) + (t > A("s4:dua") - 0.1 ? 1 : 0); ledgerPage.material.map = ledgerTex[n]; }
    // light: calm and slightly dimmer for the 1903 plague numbers
    { const d = win(t, A("s7:Tahun") - 0.4, K.s8 + 0.6, 0.8, 0.8); key.intensity = 2.5 - 0.6 * d; hemi.intensity = 1.05 - 0.2 * d; }

    // ---- chain HUD ----
    const OUT = K.outro, snakeT = A("s8:Sejarawan") + 0.2, snk = smooth((t - snakeT) / 1.3);
    let scroll = 0; for (let i = 1; i < tags.length; i++) scroll += (SW(i + 1) - SW(i)) * eout((t - tags[i].at) / 0.6);
    const tp = tags.map((tg, i) => {
      const dt = t - tg.at;
      const rx = 56 + TW / 2 + i * (TW + GAP) - scroll, ry = 1196;
      const row = Math.floor(i / 4), col = row ? 3 - (i % 4) : i % 4, sc = 0.74;
      const sx = 56 + (TW * sc) / 2 + col * ((1024 - 56 - TW * sc) / 3), sy = row ? 1180 : 1012;
      return [lerp(rx, sx, snk), lerp(ry, sy, snk) - 150 * (1 - eout(dt / 0.45)), lerp(1, sc, snk), dt];
    });
    tags.forEach((tg, i) => {
      const [x, y, s, dt] = tp[i]; const vis = dt > 0 && t < OUT;
      tg.m.visible = vis; if (!vis) return;
      const [hx, hy] = px2(x, y); tg.m.position.set(hx, hy, 0); tg.m.scale.setScalar(s);
      tg.m.rotation.z = 0.35 * Math.exp(-3.2 * dt) * Math.cos(9 * dt) + (i % 2 ? -0.02 : 0.02);
      tg.m.rotation.x = 0.25 * Math.exp(-3 * dt) * Math.sin(7 * dt);
      const newest = i === tags.length - 1 || t < tags[i + 1].at;
      tg.m.material = newest || (snk > 0.5 && (i === 1 || i === 7)) ? tg.mOn : tg.mOff;
      tg.m.material.opacity = clamp01(dt / 0.2) * (x < -100 ? 0 : 1);
    });
    links.forEach(([a, b], j) => {
      const i = j + 1, P0 = tp[i - 1], P1 = tp[i]; const vis = P1[3] > 0.25 && t < OUT && P0[0] > -60;
      a.visible = b.visible = vis; if (!vis) return;
      const [x0, y0] = px2(P0[0], P0[1]), [x1, y1] = px2(P1[0], P1[1]);
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, ang = Math.atan2(dy, dx);
      const horiz = Math.abs(ux) > 0.5, half = (horiz ? (TW / 2) * P0[2] : (TW * (TCH / 640) / 2) * P0[2]) * KP;
      const e0 = half, e1 = L - half, mid = (e0 + e1) / 2, k = clamp01((P1[3] - 0.25) / 0.3);
      a.position.set(x0 + ux * (mid - 8 * KP), y0 + uy * (mid - 8 * KP), 0.01); b.position.set(x0 + ux * (mid + 8 * KP), y0 + uy * (mid + 8 * KP), 0.01);
      a.rotation.set(0, 0, ang); b.rotation.set(Math.PI / 2, 0, ang, "ZXY"); a.scale.set(1.5 * k, k, k); b.scale.set(1.5 * k, k, k);
    });
    // loop arrow: from the last tag back to "berkembang biak"
    { const tl0 = A("s8:kalau") - 0.3, u = clamp01((t - tl0) / 1.0); const vis = u > 0 && snk > 0.99 && t < OUT;
      if (vis) {
        const [ax, ay] = [tp[7][0] + 40, tp[7][1] - 30], [bx, by] = [tp[1][0] - 40, tp[1][1] + 30];
        const pts3 = [[ax, ay], [ax + 30, (ay + by) / 2 + 20], [(ax + bx) / 2 + 20, (ay + by) / 2], [bx - 30, by + 18], [bx, by]].map(([x, y]) => { const [hx, hy] = px2(x, y); return new THREE.Vector3(hx, hy, 0.02); });
        if (!loopMesh) { loopMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts3), 40, 5 * KP, 8), loopM); loopMesh.renderOrder = 22; hud.add(loopMesh); }
        loopMesh.visible = true; loopMesh.geometry.setDrawRange(0, Math.floor(u * loopMesh.geometry.index.count / 6) * 6);
        const end = pts3[4], pre = pts3[3]; loopHead.visible = u >= 1; loopHead.position.copy(end); loopHead.rotation.set(0, 0, Math.atan2(end.y - pre.y, end.x - pre.x) - Math.PI / 2);
      } else { if (loopMesh) loopMesh.visible = false; loopHead.visible = false; }
    }

    // ---- camera ----
    const c = CAM(t);
    cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    comp.render();
  };
}
