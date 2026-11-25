// EP34 TOONFORGE: Operation Cat Drop (Sarawak, Borneo, 1960) as a cel-shaded toon world.
// Toon (MeshToon + 3-step gradient) materials with inverted-hull ink outlines pushed along normals.
// Stations (everything is a pure function of t):
//   s1  hook: crates with cats hang under striped parachutes over a jungle village, an RAF transport passes behind
//   s2  map board of Borneo: Sarawak pops up (orange), label MALAYSIA, dashed border with Kalimantan Barat (Indonesia)
//   s3  longhouse village: a mosquito swarm, a sprayer with a back tank mists DDT on the walls, mosquitoes drop
//   s4  four cats on the open platform fade to ghosts ("ikut mati"); close-up on the sprayed wall: bug -> gecko? -> cat
//       (dashed, question mark), then the other path: a cat rubs the sprayed wall and licks its paw
//   s5  paddy field: rats multiply, rice stalks fall and brown
//   s6  map: dashed route Singapura -> Sarawak with a tiny plane; then the transport drops crates, chutes pop open
//   s7  clearing: a ghost tower of "14.000?" crates collapses; 23 crates pop in one by one; cats chase rats away
//   s8  crane up over the whole village; the plane passes once more
const FONTS = ['400 80px "Bangers"', '400 80px "Lilita One"', '700 80px "Barlow Condensed"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "SARAWAK AUDIRA 14.000?"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const V3 = THREE.Vector3;
const BANG = '"Bangers", Impact, sans-serif', LIL = '"Lilita One", "Arial Black", sans-serif', BAR = '"Barlow Condensed", "Arial Narrow", sans-serif';
const INK = 0x1a1626, INKS = "#1a1626";

// monotone Hermite through time keys [t, ...values], never overshoots
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

// rounded box with exact normals (so the normal-pushed ink hull stays closed)
const rbC = {};
function rb(w, h, d, r = 0.1, seg = 2) {
  const key = [w, h, d, r, seg].join();
  if (rbC[key]) return rbC[key];
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const S = seg * 2 + 1, hs = 0.5 / S;
  const g = new THREE.BoxGeometry(1, 1, 1, S, S, S);
  const pa = g.attributes.position, na = g.attributes.normal;
  const bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r, p = new V3(), n = new V3();
  for (let i = 0; i < pa.count; i++) {
    p.fromBufferAttribute(pa, i);
    n.set(p.x - Math.sign(p.x) * hs, p.y - Math.sign(p.y) * hs, p.z - Math.sign(p.z) * hs).normalize();
    pa.setXYZ(i, Math.sign(p.x) * bx + n.x * r, Math.sign(p.y) * by + n.y * r, Math.sign(p.z) * bz + n.z * r);
    na.setXYZ(i, n.x, n.y, n.z);
  }
  return (rbC[key] = g);
}

// half-plane clip (keep lon < L)
function clipLon(ring, L) {
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[(i + ring.length - 1) % ring.length], b = ring[i];
    const ina = a[0] < L, inb = b[0] < L;
    if (inb) { if (!ina) out.push([L, a[1] + (b[1] - a[1]) * (L - a[0]) / (b[0] - a[0])]); out.push(b); }
    else if (ina) out.push([L, a[1] + (b[1] - a[1]) * (L - a[0]) / (b[0] - a[0])]);
  }
  return out;
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x8fdcff, exp: 1.0, bloom: [0.08, 0.3, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  cam.near = 0.3; cam.far = 3000; cam.updateProjectionMatrix();
  const skyT = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2FA8EE"); gr.addColorStop(0.5, "#7FD3FF"); gr.addColorStop(1, "#D8F4FF"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const seaBgT = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#123B6E"); gr.addColorStop(1, "#1E5E9A"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.background = skyT;

  // ---------- lights: hard tropical sun + sky fill ----------
  const hemi = new THREE.HemisphereLight(0xcfeeff, 0x5c7a3a, 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d8, 2.6);
  sun.position.set(-40, 80, 50); sun.target.position.set(4, 0, 2);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 10, far: 260 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0xffe0b0, 0.7); rim.position.set(40, 30, -60); scene.add(rim);
  const porch = new THREE.PointLight(0xfff0d6, 0, 22, 1.2); porch.position.set(4, 6.2, 1.5); scene.add(porch);

  // ---------- toon materials + ink ----------
  const GRAD = (() => { const d = new Uint8Array([105, 105, 105, 255, 180, 180, 180, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const toon = (c, ex = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: GRAD, ...ex });
  const inkC = {};
  const inkMat = (w, op = 1, own = false) => {
    const key = w.toFixed(3);
    if (!own && inkC[key]) return inkC[key];
    const m = new THREE.ShaderMaterial({
      uniforms: { uW: { value: w }, uC: { value: new THREE.Color(INK) }, uO: { value: op } },
      vertexShader: "uniform float uW; void main(){ vec3 p = position + normalize(normal) * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
      fragmentShader: "uniform vec3 uC; uniform float uO; void main(){ gl_FragColor = vec4(uC, uO); }",
      side: THREE.BackSide, transparent: own, depthWrite: !own || true,
    });
    if (!own) inkC[key] = m;
    return m;
  };
  function ink(mesh, w = 0.05, mat) {
    const s = (mesh.scale.x + mesh.scale.y + mesh.scale.z) / 3;
    const h = new THREE.Mesh(mesh.geometry, mat || inkMat(w / s));
    if (mat) mat.uniforms.uW.value = w / s;
    h.castShadow = false; h.receiveShadow = false; mesh.add(h); return h;
  }
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene, inkW = 0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m);
    if (inkW) ink(m, inkW);
    return m;
  };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const noiseTex = (seed, base, cols, n, rep, sz = 3) => canvasTex(512, 512, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); const q = mulberry(seed); for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(q() * cols.length)]; g.fillRect(q() * w, q() * w, 1 + q() * sz, 1 + q() * sz * 2.5); } }, rep);

  // text plate (billboard when bb=true)
  const labels = [];
  function plate(text, { font = BANG, h = 1, color = "#fff", stroke = INKS, bg = null, bd = null, pad = 0.35, rot = 0 } = {}) {
    const CH = 160, fpx = Math.round(CH * 0.62);
    const mc = document.createElement("canvas").getContext("2d"); mc.font = `${fpx}px ${font}`;
    const tw = mc.measureText(text).width, CW = Math.ceil(tw + CH * pad * 2 + 30);
    const tex = canvasTex(CW, CH + 30, (g, w, hh) => {
      g.clearRect(0, 0, w, hh);
      if (bg) {
        g.save(); g.translate(w / 2, hh / 2); g.rotate(rot); g.translate(-w / 2, -hh / 2);
        g.fillStyle = INKS; g.beginPath(); g.roundRect(18, 20, w - 30, hh - 30, 18); g.fill();
        g.fillStyle = bg; g.beginPath(); g.roundRect(10, 10, w - 30, hh - 30, 18); g.fill();
        if (bd) { g.strokeStyle = bd; g.lineWidth = 8; g.stroke(); }
        g.restore();
      }
      g.font = `${fpx}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
      const x = (w - 20) / 2 + 6, y = (hh - 20) / 2 + 8;
      if (stroke) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = fpx * 0.2; g.strokeText(text, x, y); }
      g.fillStyle = color; g.fillText(text, x, y);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(h * CW / (CH + 30), h), basic({ map: tex }));
    m.renderOrder = 8; m.visible = false; scene.add(m); labels.push(m);
    return m;
  }
  const showLab = (m, k, pos, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.scale.setScalar(Math.max(0.001, s * (0.6 + 0.4 * back(clamp01(k))))); };

  // ================= VILLAGE =================
  const VIL = new THREE.Group(); scene.add(VIL);
  const grassT = canvasTex(1024, 1024, (g, w) => { g.fillStyle = "#79C95A"; g.fillRect(0, 0, w, w); const q = mulberry(4); for (let i = 0; i < 9000; i++) { g.fillStyle = q() < 0.5 ? "rgba(52,140,62,.55)" : "rgba(170,225,110,.5)"; const x = q() * w, y = q() * w; g.fillRect(x, y, 2, 5 + q() * 7); } }, [60, 60]);
  const ground = add(new THREE.PlaneGeometry(900, 900), toon(0xffffff, { map: grassT }), 0, 0, 0, VIL); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const dirtT = canvasTex(512, 512, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * 0.2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(222,184,120,1)"); gr.addColorStop(0.8, "rgba(214,176,110,1)"); gr.addColorStop(1, "rgba(214,176,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); const q = mulberry(8); for (let i = 0; i < 1500; i++) { const a = q() * 6.28, rr = q() * w * 0.4; g.fillStyle = "rgba(160,120,70,.4)"; g.fillRect(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, 3, 3); } });
  const clear = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshToonMaterial({ map: dirtT, gradientMap: GRAD, transparent: true, depthWrite: false }));
  clear.rotation.x = -Math.PI / 2; clear.position.set(0, 0.03, 13); clear.receiveShadow = true; VIL.add(clear);

  // river behind the longhouse
  const river = new THREE.Mesh(new THREE.PlaneGeometry(400, 9), toon(0x3fb3e8)); river.rotation.x = -Math.PI / 2; river.rotation.z = 0.12; river.position.set(0, 0.04, -24); river.receiveShadow = true; VIL.add(river);

  // longhouse
  const plankT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#B97A44"; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#A86B3A" : "#C1834C"; g.fillRect(i * 32, 0, 30, h); g.fillStyle = "rgba(70,40,20,.65)"; g.fillRect(i * 32 + 30, 0, 2, h); } }, [3, 1]);
  const thatchT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#D9A94E"; g.fillRect(0, 0, w, h); const q = mulberry(9); for (let i = 0; i < 2600; i++) { g.strokeStyle = q() < 0.5 ? "rgba(150,100,40,.55)" : "rgba(250,215,120,.6)"; g.lineWidth = 2; const x = q() * w, y = q() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 6, y + 14 + q() * 10); g.stroke(); } for (let j = 0; j < 5; j++) { g.fillStyle = "rgba(120,80,30,.45)"; g.fillRect(0, j * 52 + 46, w, 5); } }, [6, 1]);
  const M = { wood: toon(0xffffff, { map: plankT }), post: toon(0x7a4a26), thatch: toon(0xffffff, { map: thatchT }), floor: toon(0xC99158), dark: toon(0x3a2416) };
  const LH = new THREE.Group(); VIL.add(LH);
  const FY = 2.4;
  for (let x = -13; x <= 13.01; x += 2.6) for (const z of [-10, -5.5, -3, 0]) add(new THREE.CylinderGeometry(0.16, 0.2, FY, 8), M.post, x, FY / 2, z, LH, 0.04);
  add(rb(28, 0.35, 10.6, 0.08), M.floor, 0, FY, -4.8, LH, 0.05);
  const wallB = add(rb(27.4, 3.2, 0.3, 0.06), M.wood, 0, FY + 1.6, -10, LH, 0.05);
  const wallF = add(rb(27.4, 3.2, 0.3, 0.06), M.wood, 0, FY + 1.6, -5.5, LH, 0.05);
  for (const x of [-12.9, 12.9]) add(rb(0.3, 3.2, 4.5, 0.06), M.wood, x, FY + 1.6, -7.75, LH, 0.05);
  for (let x = -11; x <= 11.01; x += 4.4) { const d = add(new THREE.PlaneGeometry(1.1, 2.2), M.dark, x, FY + 1.15, -5.33, LH); d.castShadow = false; }
  // windows on gallery wall
  // roof: two slopes over z -11.2 .. -1.8, ridge at y 8.4
  {
    const rl = 29.5, z0 = -11.4, z1 = -2.0, zm = (z0 + z1) / 2, half = (z1 - z0) / 2, rise = 3.6;
    const len = Math.hypot(half, rise), ang = Math.atan2(rise, half);
    const s1 = add(rb(rl, 0.32, len + 0.4, 0.1), M.thatch, 0, FY + 3.2 + rise / 2, zm + half / 2, LH, 0.06); s1.rotation.x = ang;
    const s2 = add(rb(rl, 0.32, len + 0.4, 0.1), M.thatch, 0, FY + 3.2 + rise / 2, zm - half / 2, LH, 0.06); s2.rotation.x = -ang;
  }
  // open platform rail posts and notched-log ladder
  for (let x = -13; x <= 13.01; x += 1.3) add(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), M.post, x, FY + 0.5, 0.05, LH);
  add(rb(26.2, 0.1, 0.1, 0.03), M.post, 0, FY + 0.85, 0.05, LH, 0.025);
  { const lad = add(new THREE.CylinderGeometry(0.17, 0.2, 3.1, 8), M.post, 0.9, 1.2, 1.1, LH, 0.04); lad.rotation.x = 0.68; }
  // spray marks on the front wall (shown after spraying)
  const sprayT = canvasTex(1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const q = mulberry(21); for (let i = 0; i < 1800; i++) { const a = q(); g.fillStyle = `rgba(${a < 0.5 ? "235,250,255" : "180,230,255"},${0.2 + q() * 0.35})`; const x = q() * w, y = h * (0.15 + q() * 0.75); g.beginPath(); g.arc(x, y, 0.6 + q() * 1.4, 0, 6.28); g.fill(); } });
  const sprayM = basic({ map: sprayT, opacity: 0 });
  const sprayF = new THREE.Mesh(new THREE.PlaneGeometry(27, 3.0), sprayM); sprayF.position.set(0, FY + 1.6, -5.33); sprayF.renderOrder = 3; LH.add(sprayF);

  // huts
  function hut(x, z, ry, s = 1) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; G.scale.setScalar(s); VIL.add(G);
    for (const [px, pz] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) add(new THREE.CylinderGeometry(0.13, 0.15, 1.6, 7), M.post, px, 0.8, pz, G, 0.04);
    add(rb(4.6, 0.25, 3.8, 0.06), M.floor, 0, 1.6, 0, G, 0.05);
    add(rb(4.2, 2.0, 3.4, 0.06), M.wood, 0, 2.7, 0, G, 0.05);
    const rf = add(new THREE.ConeGeometry(3.6, 2.2, 4), M.thatch, 0, 4.7, 0, G, 0.06); rf.rotation.y = Math.PI / 4; rf.scale.set(1.15, 1, 0.95);
    return G;
  }
  hut(-21, 4, 0.5); hut(-19, 20, -0.3, 0.9); hut(19, -6, -0.4, 0.95);

  // trees
  const leafM = [toon(0x2E9E52), toon(0x3DB665), toon(0x1F8045), toon(0x5ACB6C)];
  const trunkM = toon(0x6B4426);
  const TREES = [];
  function tree(x, z, s, q) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); VIL.add(G);
    add(new THREE.CylinderGeometry(0.28, 0.42, 4.4, 8), trunkM, 0, 2.2, 0, G, 0.06);
    const nb = 3 + Math.floor(q() * 3);
    for (let i = 0; i < nb; i++) {
      const rr = 1.6 + q() * 1.2, a = q() * 6.28, d = i ? 1.2 + q() * 0.6 : 0;
      add(new THREE.IcosahedronGeometry(rr, 2), leafM[Math.floor(q() * 4)], Math.cos(a) * d, 5.2 + q() * 1.6 + (i ? 0 : 1), Math.sin(a) * d, G, 0.07);
    }
    TREES.push(G); return G;
  }
  function palm(x, z, s, q) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); G.rotation.y = q() * 6.28; VIL.add(G);
    const lean = 0.15 + q() * 0.2;
    for (let i = 0; i < 6; i++) { const seg = add(new THREE.CylinderGeometry(0.22 - i * 0.015, 0.26 - i * 0.015, 1.25, 7), trunkM, lean * i * i * 0.18, 0.62 + i * 1.18, 0, G, 0.05); seg.rotation.z = -lean * i * 0.12; }
    const top = new V3(lean * 36 * 0.18, 7.4, 0);
    for (let k = 0; k < 7; k++) {
      const f = add(new THREE.ConeGeometry(0.55, 4.2, 4), leafM[k % 2 ? 0 : 3], top.x, top.y, top.z, G, 0.04);
      f.scale.set(1, 1, 0.18); f.rotation.set(0, (k / 7) * 6.28, 0); f.rotateZ(1.9); f.translateY(-1.9);
    }
    return G;
  }
  {
    const q = mulberry(31);
    const okSpot = (x, z) => !(Math.abs(x) < 16 && z > 0 && z < 90) && !(Math.abs(x) < 17 && z > -14 && z < 2) && !(Math.hypot(x, z - 13) < 14) && !(x > 17 && x < 46 && z > -9 && z < 17) && !(z < -19 && z > -29);
    let n = 0, guard = 0;
    while (n < 120 && guard++ < 3000) {
      const a = q() * 6.28, rr = 16 + q() * 75, x = Math.cos(a) * rr, z = Math.sin(a) * rr * 0.9 - 6;
      if (!okSpot(x, z)) continue;
      if (q() < 0.25 && rr < 45) palm(x, z, 0.9 + q() * 0.3, q); else tree(x, z, 1 + q() * 0.7, q);
      n++;
    }
    // trees right behind the clearing to frame the hook
  }
  // distant hills (lighter = farther)
  const hillM = [toon(0x4FA86A), toon(0x7DBF8E), toon(0x9FD0B0)];
  { const q = mulberry(41); for (let i = 0; i < 26; i++) { const a = q() * 6.28, rr = 150 + q() * 140; const h = add(new THREE.SphereGeometry(30 + q() * 30, 20, 12), hillM[rr > 230 ? 2 : rr > 190 ? 1 : 0], Math.cos(a) * rr, -6, Math.sin(a) * rr, VIL); h.scale.y = 0.55 + q() * 0.4; h.castShadow = false; } }
  // clouds
  const cloudM = toon(0xffffff);
  const CLOUDS = [];
  { const q = mulberry(51); for (let i = 0; i < 16; i++) { const G = new THREE.Group(); const a = q() * 6.28, rr = 70 + q() * 120; G.position.set(Math.cos(a) * rr, 38 + q() * 30, Math.sin(a) * rr); for (let k = 0; k < 4; k++) { const b = add(new THREE.SphereGeometry(4 + q() * 3, 14, 10), cloudM, k * 5 - 7, q() * 2, q() * 3, G, 0.25); b.castShadow = false; b.scale.y = 0.7; } VIL.add(G); CLOUDS.push([G, G.position.x]); } }

  // AUDIRA signpost at the edge of the clearing
  {
    const G = new THREE.Group(); G.position.set(7.2, 0, 17.5); G.rotation.y = -0.55; VIL.add(G);
    add(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 7), M.post, -1.1, 1.3, 0, G, 0.04); add(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 7), M.post, 1.1, 1.3, 0, G, 0.04);
    add(rb(3.2, 1.0, 0.14, 0.05), toon(0xD99A55), 0, 2.1, 0.05, G, 0.05);
    const t = canvasTex(640, 200, (g, w, h) => { g.clearRect(0, 0, w, h); g.font = `120px ${BANG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.strokeStyle = "#5a3415"; g.lineWidth = 6; g.fillStyle = "#3b220d"; g.fillText("AUDIRA", w / 2, h / 2 + 8); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.94), basic({ map: t })); p.position.set(0, 2.1, 0.14); G.add(p);
  }

  // ================= CHARACTERS =================
  const tabby = (base, str) => canvasTex(256, 256, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); g.fillStyle = str; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(w / 2, i * 38 + 14, w * 0.6, 7, 0, 0, 6.28); g.fill(); } });
  const calico = canvasTex(256, 256, (g, w) => { g.fillStyle = "#FFF7EC"; g.fillRect(0, 0, w, w); g.fillStyle = "#F0933A"; g.beginPath(); g.ellipse(70, 90, 60, 45, 0.4, 0, 6.28); g.fill(); g.fillStyle = "#3a3440"; g.beginPath(); g.ellipse(180, 170, 55, 40, -0.3, 0, 6.28); g.fill(); });
  const CATSKIN = [
    { map: tabby("#F59A3C", "#D9701E"), c: 0xffffff, ear: 0xF59A3C },
    { map: tabby("#A7B0BC", "#78808C"), c: 0xffffff, ear: 0xA7B0BC },
    { map: calico, c: 0xffffff, ear: 0xFFF7EC },
    { map: null, c: 0x3B3646, ear: 0x3B3646, eye: 0xF2D23C },
    { map: null, c: 0xFFF4E2, ear: 0xFFF4E2 },
  ];
  const ALLCATS = [];
  function cat(skin = 0, sc = 1) {
    const S = CATSKIN[skin % CATSKIN.length];
    const fur = toon(S.c, { map: S.map, transparent: true });
    const earM = toon(S.ear, { transparent: true });
    const pinkM = toon(0xFF9AAE, { transparent: true }), whiteM = toon(0xFFFFFF, { transparent: true });
    const eyeM = new THREE.MeshBasicMaterial({ color: S.eye || 0x16121e, transparent: true });
    const hiM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
    const ik = inkMat(0.04, 1, true);
    const G = new THREE.Group(); G.scale.setScalar(sc);
    const body = add(new THREE.SphereGeometry(0.5, 20, 14), fur, 0, 0.52, -0.05, G); body.scale.set(0.82, 1.0, 0.95); ink(body, 0.045, ik);
    for (const s of [-1, 1]) {
      const hh = add(new THREE.SphereGeometry(0.3, 14, 10), fur, s * 0.27, 0.27, -0.12, G); ink(hh, 0.04, ik);
      const leg = add(new THREE.CylinderGeometry(0.085, 0.1, 0.5, 8), fur, s * 0.15, 0.26, 0.28, G); ink(leg, 0.03, ik);
      const paw = add(new THREE.SphereGeometry(0.11, 10, 8), whiteM, s * 0.15, 0.05, 0.34, G); paw.scale.set(1, 0.7, 1.2); ink(paw, 0.025, ik);
    }
    const pawR = G.children[G.children.length - 1];
    const head = new THREE.Group(); head.position.set(0, 1.08, 0.08); G.add(head);
    const hd = add(new THREE.SphereGeometry(0.42, 22, 16), fur, 0, 0, 0, head); hd.scale.set(1.12, 0.95, 1); ink(hd, 0.045, ik);
    const muz = add(new THREE.SphereGeometry(0.17, 14, 10), whiteM, 0, -0.1, 0.32, head); muz.scale.set(1.3, 0.8, 0.7);
    for (const s of [-1, 1]) {
      const ear = add(new THREE.ConeGeometry(0.15, 0.32, 4), earM, s * 0.25, 0.36, -0.02, head); ear.rotation.z = -s * 0.35; ear.rotation.y = Math.PI / 4; ink(ear, 0.03, ik);
      const ie = add(new THREE.ConeGeometry(0.08, 0.2, 4), pinkM, s * 0.245, 0.33, 0.05, head); ie.rotation.z = -s * 0.35; ie.rotation.y = Math.PI / 4;
      const eye = add(new THREE.SphereGeometry(0.095, 12, 10), eyeM, s * 0.16, 0.05, 0.36, head); eye.scale.set(0.85, 1.25, 0.5); eye.castShadow = false;
      const hi = add(new THREE.SphereGeometry(0.032, 8, 6), hiM, s * 0.16 + 0.03, 0.1, 0.41, head); hi.castShadow = false;
      for (let k = -1; k <= 1; k++) { const wk = add(new THREE.BoxGeometry(0.34, 0.012, 0.012), eyeM, s * 0.3, -0.1 + k * 0.045, 0.36, head); wk.rotation.z = s * k * 0.18; wk.castShadow = false; }
    }
    const nose = add(new THREE.SphereGeometry(0.045, 8, 6), pinkM, 0, -0.04, 0.43, head); nose.castShadow = false;
    const tailP = new THREE.Group(); tailP.position.set(0, 0.22, -0.45); G.add(tailP);
    const curve = new THREE.CatmullRomCurve3([new V3(0, 0, 0), new V3(0.15, 0.05, -0.25), new V3(0.35, 0.35, -0.3), new V3(0.4, 0.75, -0.15)]);
    const tail = add(new THREE.TubeGeometry(curve, 20, 0.07, 8), fur, 0, 0, 0, tailP); ink(tail, 0.035, ik);
    const mats = [fur, earM, pinkM, whiteM, eyeM, hiM];
    const o = { G, head, tailP, pawR, mats, ik, op: 1, setOp(v) { if (Math.abs(v - o.op) < 1e-3) return; o.op = v; for (const m of mats) { m.opacity = v; m.depthWrite = v > 0.99; } ik.uniforms.uO.value = v; ik.depthWrite = v > 0.99; } };
    ALLCATS.push(o);
    return o;
  }
  // cat idle life: blink-free breathing, tail sway, head tilt
  function catLife(c, t, ph) { c.tailP.rotation.y = 0.5 * Math.sin(t * 2.2 + ph); c.tailP.rotation.x = 0.15 * Math.sin(t * 1.3 + ph); c.head.rotation.z = 0.12 * Math.sin(t * 0.9 + ph * 2); c.head.rotation.y = 0.2 * Math.sin(t * 0.6 + ph); c.G.children[0].scale.y = 1.0 + 0.025 * Math.sin(t * 3 + ph); }

  // crate (open top) with a cat inside; supply crates are closed and olive
  const crateT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#D59A5A"; g.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#C88B4B" : "#DDA566"; g.fillRect(0, i * 64, w, 60); g.fillStyle = "rgba(90,50,20,.7)"; g.fillRect(0, i * 64 + 60, w, 4); } g.fillStyle = "rgba(90,50,20,.8)"; g.fillRect(0, 0, 14, w); g.fillRect(w - 14, 0, 14, w); for (const [x, y] of [[60, 40], [196, 40], [128, 190]]) { g.fillStyle = "#3a2210"; g.beginPath(); g.arc(x, y, 10, 0, 6.28); g.fill(); } });
  const crateM = toon(0xffffff, { map: crateT });
  const supT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#7E8C4E"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(40,50,20,.8)"; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = "#F4EBC8"; g.fillRect(w / 2 - 60, h / 2 - 18, 120, 36); g.fillRect(w / 2 - 18, h / 2 - 60, 36, 120); });
  const supM = toon(0xffffff, { map: supT });
  const gores = canvasTex(512, 64, (g, w, h) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#FFFFFF" : (i % 4 === 0 ? "#FF6B3D" : "#FFC531"); g.fillRect((i * w) / 12, 0, w / 12 + 1, h); } });
  const canopyM = toon(0xffffff, { map: gores, side: THREE.DoubleSide });
  const lineM = new THREE.LineBasicMaterial({ color: 0x3a3040 });
  function chute(R = 2.0) {
    const G = new THREE.Group();
    const cn = add(new THREE.SphereGeometry(R, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), canopyM, 0, 0, 0, G); cn.scale.y = 0.62; ink(cn, 0.06);
    const pts3 = []; const rim = R * Math.sin(Math.PI * 0.45), ry = R * Math.cos(Math.PI * 0.45) * 0.62;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; pts3.push(new V3(Math.cos(a) * rim, ry, Math.sin(a) * rim), new V3(Math.cos(a) * 0.4, -3.4, Math.sin(a) * 0.4)); }
    const L = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts3), lineM); G.add(L);
    return G;
  }
  function crate(kind = "cat", skin = 0) {
    const G = new THREE.Group();
    const body = new THREE.Group(); G.add(body);
    let kc = null;
    if (kind === "cat") {
      add(rb(1.5, 0.12, 1.2, 0.04), crateM, 0, 0.06, 0, body, 0.04);
      add(rb(1.5, 1.0, 0.12, 0.04), crateM, 0, 0.55, 0.54, body, 0.04); add(rb(1.5, 1.0, 0.12, 0.04), crateM, 0, 0.55, -0.54, body, 0.04);
      add(rb(0.12, 1.0, 1.2, 0.04), crateM, -0.69, 0.55, 0, body, 0.04); add(rb(0.12, 1.0, 1.2, 0.04), crateM, 0.69, 0.55, 0, body, 0.04);
      kc = cat(skin, 0.95); kc.G.position.set(0, 0.0, 0.05); body.add(kc.G);
    } else {
      add(rb(1.9, 1.3, 1.5, 0.08), supM, 0, 0.65, 0, body, 0.05);
    }
    const ch = chute(kind === "cat" ? 2.0 : 2.4); ch.position.y = 1.15 + 3.4; G.add(ch);
    return { G, body, ch, cat: kc };
  }

  // toon person (sprayer): face, shoulders wider than hips, bent limbs, skin != clothes, back tank + lance
  function person() {
    const G = new THREE.Group();
    const skin = toon(0xC98B5E), shirt = toon(0xE7DCA6), pants = toon(0x4E6A8A), hatM = toon(0xE3C27A), tankM = toon(0xB9C3CC), dark = new THREE.MeshBasicMaterial({ color: 0x1a1626 });
    const limb = (x, y, len, w, mat, p) => { const piv = new THREE.Group(); piv.position.set(x, y, 0); p.add(piv); const a = add(new THREE.CylinderGeometry(w, w * 0.9, len / 2, 8), mat, 0, -len / 4, 0, piv, 0.03); const k = new THREE.Group(); k.position.y = -len / 2; piv.add(k); add(new THREE.CylinderGeometry(w * 0.9, w * 0.8, len / 2, 8), mat, 0, -len / 4, 0, k, 0.03); return [piv, k]; };
    const torso = add(rb(0.9, 1.0, 0.5, 0.15), shirt, 0, 1.75, 0, G, 0.04);
    add(rb(0.72, 0.3, 0.46, 0.1), pants, 0, 1.15, 0, G, 0.04);
    const head = add(new THREE.SphereGeometry(0.3, 16, 12), skin, 0, 2.55, 0.02, G, 0.035);
    for (const s of [-1, 1]) { const e = add(new THREE.SphereGeometry(0.045, 8, 6), dark, s * 0.1, 2.6, 0.28, G); e.castShadow = false; }
    { const m = add(new THREE.BoxGeometry(0.14, 0.025, 0.02), dark, 0, 2.45, 0.29, G); m.castShadow = false; }
    add(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 20), hatM, 0, 2.78, 0, G, 0.03); add(new THREE.SphereGeometry(0.3, 14, 8, 0, 6.3, 0, 1.4), hatM, 0, 2.78, 0, G, 0.03);
    add(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 14), tankM, 0, 1.85, -0.42, G, 0.035);
    const [legL, kneeL] = limb(-0.2, 1.1, 1.1, 0.12, pants, G), [legR, kneeR] = limb(0.2, 1.1, 1.1, 0.12, pants, G);
    const [armL, elL] = limb(-0.55, 2.15, 0.9, 0.09, shirt, G), [armR, elR] = limb(0.55, 2.15, 0.9, 0.09, shirt, G);
    const lance = add(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), tankM, 0, -0.3, 0.6, elR, 0.02); lance.rotation.x = Math.PI / 2;
    const nozzle = new THREE.Object3D(); nozzle.position.set(0, -0.3, 1.4); elR.add(nozzle);
    return { G, legL, legR, kneeL, kneeR, armL, armR, elL, elR, nozzle };
  }

  // mosquito, bug, gecko, rat
  const mozM = toon(0x2a2433), wingM = basic({ color: 0xe8f6ff, opacity: 0.75, side: THREE.DoubleSide });
  function mosquito() {
    const G = new THREE.Group();
    const b = add(new THREE.SphereGeometry(0.1, 8, 6), mozM, 0, 0, 0, G); b.scale.set(2.4, 0.8, 0.8);
    add(new THREE.SphereGeometry(0.07, 8, 6), mozM, 0.25, 0.03, 0, G);
    const wl = add(new THREE.PlaneGeometry(0.3, 0.12), wingM, 0, 0.1, 0.12, G), wr = add(new THREE.PlaneGeometry(0.3, 0.12), wingM, 0, 0.1, -0.12, G);
    wl.rotation.x = -1.2; wr.rotation.x = 1.2;
    const pr = add(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 4), mozM, 0.38, -0.02, 0, G); pr.rotation.z = Math.PI / 2;
    return { G, wl, wr };
  }
  const MOZ = []; for (let i = 0; i < 30; i++) { const m = mosquito(); m.G.scale.setScalar(1.0); VIL.add(m.G); MOZ.push(m); }

  const bugM = toon(0x7A4A2A), glowBugM = basic({ color: 0x9CFF5A, opacity: 0.0 });
  const BUG = new THREE.Group(); VIL.add(BUG);
  { const b = add(new THREE.SphereGeometry(0.16, 12, 8), bugM, 0, 0, 0, BUG, 0.02); b.scale.set(1.5, 1, 0.5); add(new THREE.SphereGeometry(0.09, 8, 6), bugM, 0.25, 0, 0, BUG, 0.015); for (let k = -1; k <= 1; k++) for (const s of [-1, 1]) { const l = add(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 4), mozM, k * 0.1, s * 0.15, 0, BUG); l.rotation.z = s * 0.5; } const gl = add(new THREE.SphereGeometry(0.4, 12, 8), glowBugM, 0, 0, 0, BUG); gl.castShadow = false; }
  const geckoM = toon(0xC8D68A), geckoSpot = toon(0x8EA454);
  const GECKO = new THREE.Group(); VIL.add(GECKO);
  { const b = add(new THREE.SphereGeometry(0.22, 14, 10), geckoM, 0, 0, 0, GECKO, 0.025); b.scale.set(2.0, 0.85, 0.45);
    add(new THREE.SphereGeometry(0.15, 12, 8), geckoM, 0.48, 0, 0, GECKO, 0.02).scale.set(1.3, 0.9, 0.55);
    const tc = new THREE.CatmullRomCurve3([new V3(-0.35, 0, 0), new V3(-0.75, 0.12, 0), new V3(-1.1, -0.05, 0), new V3(-1.35, -0.25, 0)]);
    add(new THREE.TubeGeometry(tc, 16, 0.07, 6), geckoM, 0, 0, 0, GECKO, 0.02);
    for (const [x, s] of [[0.25, 1], [0.25, -1], [-0.25, 1], [-0.25, -1]]) { const l = add(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 5), geckoM, x, s * 0.2, 0.0, GECKO, 0.015); l.rotation.z = s * 0.9; }
    for (const s of [-1, 1]) { const e = add(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0x1a1626 }), 0.56, s * 0.08, 0.06, GECKO); e.castShadow = false; }
    for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(0.04, 6, 4), geckoSpot, -0.2 + i * 0.13, (i % 2 ? 0.06 : -0.05), 0.09, GECKO);
  }
  const ratM = toon(0x857F8E), ratTail = toon(0xF2A0B0);
  function rat() {
    const G = new THREE.Group();
    const b = add(new THREE.SphereGeometry(0.3, 12, 8), ratM, 0, 0.26, 0, G, 0.03); b.scale.set(1.5, 0.85, 0.9);
    const h = add(new THREE.ConeGeometry(0.2, 0.42, 10), ratM, 0.5, 0.26, 0, G, 0.025); h.rotation.z = -Math.PI / 2;
    for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.1, 8, 6), ratTail, 0.38, 0.47, s * 0.13, G, 0.015).scale.set(0.4, 1, 1); const e = add(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: 0x111111 }), 0.55, 0.33, s * 0.09, G); e.castShadow = false; }
    const tc = new THREE.CatmullRomCurve3([new V3(-0.4, 0.2, 0), new V3(-0.8, 0.1, 0.15), new V3(-1.2, 0.12, -0.1), new V3(-1.5, 0.25, 0)]);
    add(new THREE.TubeGeometry(tc, 12, 0.035, 5), ratTail, 0, 0, 0, G);
    return G;
  }

  // ---------- sprayer + mosquito swarm (s3) ----------
  const SPR = person(); SPR.G.scale.setScalar(1.05); VIL.add(SPR.G);
  const MIST = pts(scene, 260, { color: 0xeaf8ff, size: 0.55, add: false, opacity: 0.8 });

  // ---------- veranda cats (s4) ----------
  const VC = [0, 1, 2, 4].map((s, i) => { const c = cat(s, 1.0); c.G.position.set(-3.6 + i * 2.4, FY + 0.17, -1.3 + (i % 2) * 0.3); c.G.rotation.y = (i - 1.5) * 0.15; VIL.add(c.G); return c; });
  // wall diagram cat (s4 second half)
  const WC = cat(0, 1.0); VIL.add(WC.G);
  const qMark = plate("?", { font: BANG, h: 1.1, color: "#FFD43B" });
  const tagBT = plate("BELUM TERBUKTI", { font: BANG, h: 0.55, color: "#fff", stroke: null, bg: "#E8394A", rot: -0.04 });
  const tagLang = plate("LANGSUNG DARI DINDING", { font: BANG, h: 0.45, color: INKS, stroke: null, bg: "#FFD43B", rot: 0.03 });
  // dashed path dots (bug -> gecko -> cat)
  const dotM = basic({ color: 0xFFD43B, opacity: 1 }), dotM2 = basic({ color: 0xffffff, opacity: 1 });
  const DOTS = [];
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), i < 20 ? dotM : dotM2); d.renderOrder = 6; VIL.add(d); DOTS.push(d); }

  // ---------- paddy (s5) ----------
  const PX0 = 20, PX1 = 44, PZ0 = -6, PZ1 = 15;
  const pad = add(new THREE.PlaneGeometry(PX1 - PX0, PZ1 - PZ0), toon(0x8FD3C8), (PX0 + PX1) / 2, 0.05, (PZ0 + PZ1) / 2, VIL); pad.rotation.x = -Math.PI / 2; pad.castShadow = false;
  for (let z = PZ0; z <= PZ1 + 0.01; z += 7) add(rb(PX1 - PX0, 0.3, 0.5, 0.1), toon(0x9C7A4A), (PX0 + PX1) / 2, 0.15, z, VIL, 0.03);
  const NS = 22 * 19, stalkG = new THREE.ConeGeometry(0.16, 1.3, 5); stalkG.translate(0, 0.65, 0);
  const STK = new THREE.InstancedMesh(stalkG, toon(0xffffff), NS); STK.castShadow = true; VIL.add(STK);
  const stalks = []; { const q = mulberry(61); let i = 0; for (let a = 0; a < 22; a++) for (let b = 0; b < 19; b++) { stalks.push([PX0 + 0.6 + a * 1.06 + (q() - 0.5) * 0.2, PZ0 + 0.5 + b * 1.08 + (q() - 0.5) * 0.2, q(), q() * 6.28]); i++; } }
  const cGreen = new THREE.Color(0x7CCB3A), cGold = new THREE.Color(0xC9B25A), cDead = new THREE.Color(0x9A6B3A), cTmp = new THREE.Color();
  const dummy = new THREE.Object3D();
  const NR = 54, RATS = []; { const q = mulberry(71); for (let i = 0; i < NR; i++) { const g = rat(); g.scale.setScalar(1.0 + q() * 0.3); VIL.add(g); RATS.push({ G: g, cx: PX0 + 2 + q() * (PX1 - PX0 - 4), cz: PZ0 + 1.5 + q() * (PZ1 - PZ0 - 3), r: 0.6 + q() * 1.6, w: (q() < 0.5 ? -1 : 1) * (0.8 + q() * 1.2), ph: q() * 6.28, born: q() }); } }

  // ---------- plane ----------
  const metalM = new THREE.MeshToonMaterial({ color: 0xC9D2DC, gradientMap: GRAD }), darkMetal = toon(0x7D8894), glassM = toon(0x2B4A66);
  const roundelT = canvasTex(256, 256, (g, w) => { g.clearRect(0, 0, w, w); const c = w / 2; [["#1E3F8F", 120], ["#FFFFFF", 82], ["#D2232A", 44]].forEach(([col, rr]) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, rr, 0, 6.28); g.fill(); }); });
  function plane() {
    const G = new THREE.Group();
    const fus = add(new THREE.CylinderGeometry(1.6, 1.4, 16, 20), metalM, 0, 0, 0, G, 0.08); fus.rotation.z = Math.PI / 2;
    add(new THREE.SphereGeometry(1.6, 20, 14), metalM, 8, 0, 0, G, 0.08).scale.set(1.5, 0.95, 1);
    const tl = add(new THREE.ConeGeometry(1.4, 7, 20), metalM, -11.5, 0.5, 0, G, 0.08); tl.rotation.z = Math.PI / 2; tl.scale.set(1, 1, 0.9);
    add(new THREE.SphereGeometry(0.9, 14, 10), glassM, 9.6, 0.7, 0, G).scale.set(1, 0.55, 1.2);
    add(rb(3.6, 0.4, 30, 0.15), metalM, 1.2, 1.55, 0, G, 0.08);
    add(rb(2.4, 0.25, 10, 0.1), metalM, -13.5, 1.0, 0, G, 0.06);
    for (const s of [-1, 1]) add(rb(2.6, 3.4, 0.25, 0.1), metalM, -14, 2.4, s * 4.8, G, 0.06);
    const props = [];
    for (const s of [-1, 1]) {
      const n = add(new THREE.CylinderGeometry(0.75, 0.65, 4.2, 14), darkMetal, 3.0, 1.0, s * 5.6, G, 0.06); n.rotation.z = Math.PI / 2;
      const d = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), basic({ color: 0xdfe6ee, opacity: 0.35, side: THREE.DoubleSide })); d.position.set(5.2, 1.0, s * 5.6); d.rotation.y = Math.PI / 2; G.add(d);
      const bl = add(rb(0.12, 4.6, 0.35, 0.05), darkMetal, 5.15, 1.0, s * 5.6, G); props.push(bl);
    }
    for (const s of [-1, 1]) { const rd = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), basic({ map: roundelT })); rd.position.set(-2.5, 0.1, s * 1.58); rd.rotation.y = s > 0 ? 0 : Math.PI; G.add(rd); const rw = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), basic({ map: roundelT })); rw.rotation.x = -Math.PI / 2; rw.position.set(1.2, 1.77, s * 10); G.add(rw); }
    // rear cargo opening
    add(new THREE.BoxGeometry(3.4, 0.2, 2.0), toon(0x22262c), -8.0, -1.25, 0, G);
    return { G, props };
  }
  const PL = plane(); scene.add(PL.G);

  // ---------- hook crates (s1) ----------
  const HK = [crate("cat", 0), crate("cat", 1), crate("sup"), crate("cat", 2)];
  HK.forEach((c) => VIL.add(c.G)); HK[0].ch.scale.setScalar(0.85);
  const HKP = [[0, 12, 0, 18.5], [-5.5, 6, 0.9, 23], [6.5, 8, 0.5, 25], [-1.5, -2, 1.6, 29]]; // x, z, delay, start height
  const LAND = A("s1:lelucon") - 0.15, VH = HKP[0][3] / (LAND + 0.3);
  const hookY = (t, i) => { const p = HKP[i]; return Math.max(0, p[3] - VH * (t + 0.3) - p[2] * 0.6); };

  // ---------- drop crates (s6) ----------
  const DR = [crate("cat", 3), crate("cat", 0), crate("sup"), crate("cat", 4), crate("sup"), crate("cat", 1)];
  DR.forEach((c) => scene.add(c.G));

  // ---------- 23 crates on the clearing (s7, s8) + myth tower ----------
  const C23 = [];
  { const q = mulberry(81); let i = 0; for (let row = 0; row < 5 && i < 23; row++) { const n = [4, 5, 5, 5, 4][row]; for (let k = 0; k < n && i < 23; k++, i++) { const c = crate("cat", i); c.ch.visible = false; c.G.position.set((k - (n - 1) / 2) * 2.25 + (q() - 0.5) * 0.4, 0, 8.2 + row * 2.05 + (q() - 0.5) * 0.3); c.G.rotation.y = (q() - 0.5) * 0.5; VIL.add(c.G); const flat = new THREE.Mesh(new THREE.CircleGeometry(1.3, 16), toon(0xffffff, { map: gores })); flat.rotation.x = -Math.PI / 2; flat.position.set(c.G.position.x + 1.0, 0.06, c.G.position.z - 0.8); flat.scale.set(1, 0.6, 1); flat.receiveShadow = true; VIL.add(flat); C23.push({ ...c, flat, ph: q() * 6 }); } } }
  const NT = 420, TOW = new THREE.InstancedMesh(rb(1.5, 1.1, 1.2, 0.05), toon(0xffffff, { map: crateT, transparent: true, opacity: 0.0 }), NT); TOW.renderOrder = 4; VIL.add(TOW); { const ca = new THREE.Color(0xE6F4FF), cb = new THREE.Color(0xB9DDF7); for (let i = 0; i < NT; i++) TOW.setColorAt(i, (i + Math.floor(i / 6) + Math.floor(i / 30)) % 2 ? ca : cb); }
  const towEdge = new THREE.InstancedMesh(new THREE.BoxGeometry(1.56, 1.16, 1.26), basic({ color: 0x1F5F95, opacity: 0.0, wireframe: true }), NT); VIL.add(towEdge);
  const lab14 = plate("14.000?", { font: BANG, h: 3.0, color: "#fff", stroke: "#2B6FAF" });
  const lab23 = plate("23 EKOR", { font: BANG, h: 1.5, color: "#FFD43B", stroke: INKS });
  const chase = [0, 1, 2, 3, 4, 5].map((i) => { const g = rat(); VIL.add(g); return g; });

  // ================= MAP (Borneo) =================
  const MAP = new THREE.Group(); MAP.position.set(1000, 0, 0); scene.add(MAP);
  const LON0 = 111, LAT0 = 1.5, SC = 4;
  const mx = (lon) => (lon - LON0) * SC, mz = (lat) => -(lat - LAT0) * SC;
  const W0 = 102.5, W1 = 119.5, H0 = -4.5, H1 = 7.5;
  const BW = (W1 - W0) * SC, BH = (H1 - H0) * SC;
  const G2 = {}; for (const c of GEO) G2[c.name] = c.rings;
  const mBor = G2.Malaysia.find((r) => Math.min(...r.map((p) => p[0])) > 108);
  const iBor = G2.Indonesia.find((r) => Math.min(...r.map((p) => p[0])) > 108 && Math.max(...r.map((p) => p[0])) < 119.5 && r.length > 200);
  const sarawak = clipLon(mBor, 115.6);
  const near = (p) => iBor.some((q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) < 0.03);
  const border = []; { let cur = []; for (const p of mBor) { if (near(p)) cur.push(p); else { if (cur.length > 1) border.push(cur); cur = []; } } if (cur.length > 1) border.push(cur); }
  const CW = 2048, CHh = Math.round(CW * BH / BW);
  const P2 = (lon, lat) => [((lon - W0) / (W1 - W0)) * CW, ((H1 - lat) / (H1 - H0)) * CHh];
  const ringPath = (g, ring) => { g.beginPath(); ring.forEach((p, i) => { const [x, y] = P2(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  const mapT = canvasTex(CW, CHh, (g, w, h) => {
    g.fillStyle = "#3C9BE0"; g.fillRect(0, 0, w, h);
    const q = mulberry(91); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 4; g.lineCap = "round";
    for (let i = 0; i < 260; i++) { const x = q() * w, y = q() * h; g.beginPath(); g.arc(x, y, 14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    const fill = (rings, col) => { for (const r2 of rings) { ringPath(g, r2); g.fillStyle = col; g.fill(); g.lineWidth = 7; g.strokeStyle = INKS; g.lineJoin = "round"; g.stroke(); } };
    fill(G2.Indonesia, "#7DD36B"); fill(G2.Malaysia, "#FFE08A"); fill(G2.Brunei, "#E6E1D6"); fill(G2.Singapore, "#FFE08A");
    // Sabah hatch to keep it distinct from Sarawak (Sarawak is extruded)
    g.save(); ringPath(g, mBor); g.clip(); g.strokeStyle = "rgba(200,150,40,.35)"; g.lineWidth = 6; for (let i = -h; i < w; i += 26) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } g.restore();
    // equator
    g.setLineDash([22, 16]); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 4; const [, ey] = P2(0, 0); g.beginPath(); g.moveTo(0, ey); g.lineTo(w, ey); g.stroke(); g.setLineDash([]);
    g.font = `700 34px ${BAR}`; g.fillStyle = "rgba(255,255,255,.75)"; g.fillText("KHATULISTIWA", 30, ey - 14);
    // Kalimantan Barat soft tint
    g.save(); ringPath(g, iBor); g.clip(); const [kx, ky] = P2(111.2, 0.2); const rg = g.createRadialGradient(kx, ky, 10, kx, ky, 330); rg.addColorStop(0, "rgba(40,150,80,.45)"); rg.addColorStop(1, "rgba(40,150,80,0)"); g.fillStyle = rg; g.fillRect(0, 0, w, h); g.restore();
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), toon(0xffffff, { map: mapT })); board.rotation.x = -Math.PI / 2; board.position.set(mx((W0 + W1) / 2), 0, mz((H0 + H1) / 2)); MAP.add(board);
  const seaOut = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon(0x3C9BE0)); seaOut.rotation.x = -Math.PI / 2; seaOut.position.y = -0.05; MAP.add(seaOut);
  // Sarawak extrusion
  const shp = new THREE.Shape(sarawak.map((p) => new THREE.Vector2(mx(p[0]), -mz(p[1]))));
  const sarG = new THREE.ExtrudeGeometry(shp, { depth: 1.2, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.2, bevelSegments: 2 });
  sarG.rotateX(-Math.PI / 2);
  const SAR = new THREE.Mesh(sarG, toon(0xFF8A3D)); SAR.castShadow = true; MAP.add(SAR);
  const sarRim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sarawak.map((p) => new V3(mx(p[0]), 1.45, mz(p[1]))), true, "centripetal"), 400, 0.14, 5, true), new THREE.MeshBasicMaterial({ color: INK })); SAR.add(sarRim);
  // border dashes (Malaysia/Indonesia on Borneo)
  const dashes = [];
  for (const seg of border) {
    for (let i = 0; i < seg.length - 1; i++) {
      const a = new V3(mx(seg[i][0]), 0, mz(seg[i][1])), b = new V3(mx(seg[i + 1][0]), 0, mz(seg[i + 1][1]));
      const L = a.distanceTo(b), n = Math.max(1, Math.round(L / 0.9));
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n; dashes.push([a.x + (b.x - a.x) * u, a.z + (b.z - a.z) * u, Math.atan2(b.x - a.x, b.z - a.z), (dashes.length % 2)]); }
    }
  }
  const DSH = new THREE.InstancedMesh(rb(0.32, 0.3, 0.62, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }), dashes.length); MAP.add(DSH);
  const cRed = new THREE.Color(0xE8394A), cWhite = new THREE.Color(0xffffff);
  dashes.forEach((d, i) => DSH.setColorAt(i, d[3] ? cWhite : cRed));
  // map labels
  const mLab = {
    sar: plate("SARAWAK", { font: BANG, h: 4.2, color: "#fff", stroke: INKS }),
    mal: plate("MALAYSIA", { font: BANG, h: 3.4, color: "#FFE08A", stroke: INKS }),
    kb: plate("KALIMANTAN BARAT", { font: BANG, h: 3.6, color: "#fff", stroke: "#1E6B3A" }),
    ind: plate("(INDONESIA)", { font: BANG, h: 3.0, color: "#E8FFE0", stroke: "#1E6B3A" }),
    bor: plate("PULAU KALIMANTAN / BORNEO", { font: BANG, h: 2.8, color: "#fff", stroke: "#1F5F95" }),
    sg: plate("SINGAPURA", { font: BANG, h: 3.2, color: "#fff", stroke: INKS, bg: "#E8394A" }),
    br: plate("BRUNEI", { font: BAR, h: 1.0, color: "#fff", stroke: INKS }),
  };
  const pinM = toon(0xE8394A);
  const sgPin = add(new THREE.SphereGeometry(0.7, 14, 10), pinM, mx(103.82), 0.8, mz(1.35), MAP, 0.12);
  const dzPin = add(new THREE.ConeGeometry(0.8, 2.2, 14), pinM, mx(113.6), 3.0, mz(2.6), MAP, 0.12); dzPin.rotation.x = Math.PI;
  // route arc + tiny plane
  const RA = new V3(mx(103.82), 0.8, mz(1.35)), RB = new V3(mx(113.6), 2.2, mz(2.6));
  const rCurve = new THREE.QuadraticBezierCurve3(RA, new V3((RA.x + RB.x) / 2, 9, (RA.z + RB.z) / 2 - 4), RB);
  const RD = []; for (let i = 0; i < 46; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); MAP.add(d); d.position.copy(rCurve.getPoint((i + 0.5) / 46)); RD.push(d); }
  const mini = plane(); mini.G.scale.setScalar(0.16); MAP.add(mini.G);

  // ---------- burst particles ----------
  const POOF = pts(scene, 200, { color: 0xffffff, size: 0.7, add: false, opacity: 0.95 });
  const poofs = [];
  const addPoof = (tt, x, y, z, n, sz = 1) => { const q = mulberry(Math.round(tt * 100)); poofs.push({ tt, x, y, z, P: Array.from({ length: n }, () => [q() * 6.28, (q() - 0.3) * 1.5, 1 + q() * 3 * sz]) }); };

  // ================= CAMERA SHOTS =================
  const S = {
    s2: track([[K.s2 - 0.2, mx(114.0), 84, mz(-1.5) + 50, mx(114.0), 0, mz(4.0)], [A("s2:Sarawak") + 0.6, mx(113.6), 74, mz(-1.0) + 44, mx(113.6), 0, mz(4.2)], [A("s2:Malaysia"), mx(114.2), 80, mz(-1.5) + 48, mx(114.2), 0, mz(4.0)], [K.s3, mx(113.4), 76, mz(-2) + 46, mx(113.4), 0, mz(3.4)]]),
    s3: track([[K.s3 - 0.2, 8, 9, 34, 0, 4.0, -4], [A("s3:DDT"), 4, 6.5, 25, -1, 4.0, -4], [A("s3:membasmi"), -1, 5.5, 19, -1, 4.0, -3.5], [K.s4, -1, 5.5, 15, -1, 3.8, -2]]),
    s4: track([[K.s4 - 0.1, 0, 5.0, 10.5, 0, 2.9, -1.5], [A("s4:mati") + 0.5, 0, 4.6, 8.8, 0, 3.0, -1.6], [A("s4:Versi") + 0.2, 5.0, 4.6, 6.5, 7.0, 3.6, -4.6], [A("s4:racunnya") + 0.6, 8.6, 4.4, 5.6, 8.6, 3.7, -5.0], [A("s4:Kemungkinan"), 8.8, 4.2, 5.2, 8.8, 3.5, -5.0], [K.s5, 9.0, 4.0, 4.8, 9.0, 3.3, -5.0]]),
    s5: track([[K.s5 - 0.1, 27, 9.0, 28, 31, -2.5, 6], [A("s5:tikus"), 29, 8.0, 25, 32, -2.8, 4], [K.s6, 31, 7.2, 22, 33, -3.0, 3]]),
    s6a: track([[K.s6 - 0.1, mx(108.8), 92, mz(-4.5) + 54, mx(108.8), 0, mz(-0.4)], [A("s6:Singapura"), mx(108.2), 88, mz(-4.5) + 50, mx(108.2), 0, mz(-0.4)], [A("s6:dimasukkan"), mx(108.9), 84, mz(-4) + 48, mx(108.9), 0, mz(-0.2)]]),
    s7: track([[K.s7 - 0.1, 0, 12, 44, 0, 10, 4], [A("s7:mitos"), 0, 11, 40, 0, 8, 4], [A("s7:dua") - 0.3, 0, 16, 36, 0, -3.0, 10], [A("s7:Operasinya"), 2, 15, 34, 1, -3.0, 11], [K.s8, 3, 15, 34, 1.5, -3.0, 11]]),
    s8: track([[K.s8 - 0.1, 3, 15, 34, 1.5, -3.0, 11], [A("s8:langit"), 2, 18, 38, 0, -4, 6], [A("s8:Satu") + 1, 0, 22, 44, 0, -7, 6], [K.dur, -2, 25, 48, 0, -8, 5]]),
  };
  const look = new V3();
  const setCam = (c, roll = 0) => { cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(look); if (roll) cam.rotateZ(roll); };

  // ================= DRAW =================
  return function draw(t) {
    const inMap = (t >= K.s2 - 0.12 && t < K.s3 - 0.12) || (t >= K.s6 - 0.12 && t < A("s6:dimasukkan") - 0.12);
    MAP.visible = inMap; VIL.visible = !inMap;
    scene.background = inMap ? seaBgT : skyT;
    for (const l of labels) l.visible = false;

    // clouds drift
    for (const [G, x0] of CLOUDS) G.position.x = x0 + t * 0.6;

    // ---------- plane ----------
    PL.G.visible = false;
    PL.props.forEach((p, i) => (p.rotation.x = t * 40 + i));
    if (t < K.s2) { PL.G.visible = true; PL.G.position.set(-46 + t * 11, 34, -40); PL.G.rotation.set(0, 0, 0.04); }
    const s6b0 = A("s6:dimasukkan") - 0.12;
    const plX = (tt) => 10 + (tt - A("s6:dijatuhkan")) * 9.5;
    if (t >= s6b0 && t < K.s7 - 0.1) { PL.G.visible = true; PL.G.position.set(plX(t), 30, 4); PL.G.rotation.set(0, 0, 0.03 * Math.sin(t)); }
    if (t >= A("s8:kucing#2") - 1.5) { PL.G.visible = true; PL.G.position.set(-70 + (t - A("s8:kucing#2") + 1.5) * 13, 36, -30); PL.G.rotation.set(0, 0, 0.05); }

    // ---------- s1 hook crates ----------
    const s1on = t < K.s2 + 0.1;
    HK.forEach((c, i) => {
      c.G.visible = s1on; if (!s1on) return;
      const p = HKP[i], y = hookY(t, i);
      const land = y <= 0 ? t - (p[3] - p[2] * 0.6) / VH + 0.3 : -1;
      c.G.position.set(p[0] + Math.sin(t * 0.8 + i) * 0.3 * (y > 0 ? 1 : 0), y, p[1]);
      c.G.rotation.set(Math.sin(t * 1.3 + i) * 0.06 * (y > 0 ? 1 : 0), i * 0.5 - 0.6, Math.sin(t * 1.1 + i * 2) * 0.08 * (y > 0 ? 1 : 0));
      const col = land < 0 ? 0 : clamp01(land / 0.9);
      { const b0 = i === 0 ? 0.85 : 1; c.ch.scale.set(b0 * (1 + col * 0.3), b0 * Math.max(0.05, 1 - col * 0.95), b0 * (1 + col * 0.3)); } c.ch.position.y = 4.55 - col * 4.2; c.ch.position.x = col * 3.2; c.ch.position.z = -col * 3.0; c.ch.rotation.z = -col * 1.2;
      c.body.scale.y = land >= 0 && land < 0.25 ? 1 - 0.18 * Math.sin((land / 0.25) * Math.PI) : 1;
      if (c.cat) { catLife(c.cat, t, i); c.cat.G.position.y = land >= 0 ? 0.15 * Math.min(1, land * 2) : 0; c.cat.head.rotation.x = y > 0 ? -0.25 : 0; }
    });

    // ---------- s3 sprayer + mosquitoes ----------
    const s3on = t >= K.s3 - 0.2 && t < K.s4 + 0.5;
    SPR.G.visible = s3on;
    const sprA = A("s3:DDT") - 0.4, sprB = K.s4;
    if (s3on) {
      const u = clamp01((t - sprA) / (sprB - sprA));
      SPR.G.position.set(-7 + u * 9, 0, 1.9); SPR.G.rotation.y = Math.PI * 0.9;
      const wk = t > sprA && t < sprB ? Math.sin(t * 7) : 0;
      SPR.legL.rotation.x = wk * 0.4; SPR.legR.rotation.x = -wk * 0.4; SPR.kneeL.rotation.x = 0.25 + Math.max(0, -wk) * 0.5; SPR.kneeR.rotation.x = 0.25 + Math.max(0, wk) * 0.5;
      SPR.armL.rotation.x = -0.2 - wk * 0.2; SPR.elL.rotation.x = -0.5; SPR.armR.rotation.x = -0.9 + 0.12 * Math.sin(t * 3); SPR.elR.rotation.x = -0.6;
    }
    SPR.G.updateMatrixWorld(true);
    const noz = new V3(); SPR.nozzle.getWorldPosition(noz);
    const sprOn = s3on && t > A("s3:DDT") - 0.2 && t < K.s4 + 0.3;
    for (let i = 0; i < 260; i++) {
      const ph = ((t * 1.6 + i / 260) % 1), q = Math.sin(i * 12.9898) * 43758.5453, rr = q - Math.floor(q), q2 = Math.sin(i * 78.233) * 12345.678, r2 = q2 - Math.floor(q2);
      if (sprOn) { MIST.pos[i * 3] = noz.x + (rr - 0.5) * 2.6 * ph; MIST.pos[i * 3 + 1] = noz.y + ph * 1.8 + (r2 - 0.5) * 1.4 * ph; MIST.pos[i * 3 + 2] = noz.z - ph * 6.5; const k = (1 - ph) * 0.95; MIST.col[i * 3] = 0.9 * k + 0.1; MIST.col[i * 3 + 1] = 0.97 * k + 0.03; MIST.col[i * 3 + 2] = 1 * k; }
      else MIST.pos[i * 3 + 1] = -60;
    }
    MIST.commit();
    sprayM.opacity = clamp01((t - A("s3:DDT")) / 3) * (t < K.s5 + 0.5 ? 0.75 : 0.0);
    const mozOn = t > K.s3 - 0.2 && t < K.s4;
    const kill = A("s3:membasmi") + 0.2;
    MOZ.forEach((m, i) => {
      m.G.visible = mozOn; if (!mozOn) return;
      const q = (k) => { const v = Math.sin((i + 1) * k) * 43758.5; return v - Math.floor(v); };
      const cx = -3 + q(1.1) * 8, cy = 4 + q(2.3) * 3.4, cz = -1 + q(3.7) * 4;
      let x = cx + Math.sin(t * (1.5 + q(4)) + i) * 1.2, y = cy + Math.sin(t * (2.2 + q(5)) + i * 2) * 0.5, z = cz + Math.cos(t * (1.3 + q(6)) + i) * 1.0;
      const d = t - kill - q(7) * 1.8;
      let s = 1.0;
      if (d > 0) { y -= d * d * 6; s = 1.0 * (1 - clamp01(d / 0.7)); }
      m.G.position.set(x, Math.max(0.2, y), z); m.G.scale.setScalar(Math.max(0.001, s)); m.G.rotation.y = t * 2 + i;
      const f = Math.sin(t * 90 + i) * 0.5; m.wl.rotation.x = -1.2 + f; m.wr.rotation.x = 1.2 - f;
    });

    // ---------- s4 veranda cats + wall diagram ----------
    const s4on = t > K.s4 - 0.3 && t < K.s5 + 0.2;
    porch.intensity = (t > K.s4 - 0.15 && t < K.s5) ? 9 : 0; porch.position.x = t < A("s4:Versi") ? 0 : 8.6;
    const dieT = A("s4:mati");
    VC.forEach((c, i) => {
      c.G.visible = s4on || (t > K.s3 + 1 && t < K.s4); if (!c.G.visible) return;
      catLife(c, t, i * 1.7);
      const d = clamp01((t - dieT - i * 0.15) / 0.9);
      c.setOp(1 - d * 0.82);
      c.G.position.y = FY + 0.17 + d * 0.5;
    });
    WC.G.visible = s4on && t > A("s4:Versi") - 0.5;
    BUG.visible = GECKO.visible = s4on && t > A("s4:Versi") - 0.5;
    const WX = 8.4, WZ = -5.3;
    if (BUG.visible) {
      BUG.position.set(WX + 0.9, FY + 2.2, WZ + 0.08); BUG.rotation.set(0, 0, 0.4 + 0.1 * Math.sin(t * 4));
      glowBugM.opacity = 0.35 * win(t, A("s4:serangga") - 0.2, A("s4:cicak") + 0.6, 0.2, 0.3) * (0.7 + 0.3 * Math.sin(t * 9));
      const gu = clamp01((t - A("s4:serangga")) / 1.0);
      { const ga = clamp01((t - A("s4:Kemungkinan")) / 0.8); GECKO.position.set(WX - 1.8 + gu * 1.4 - ga * 1.2, FY + 1.6 + gu * 0.55 + ga * 0.5, WZ + 0.1); } GECKO.rotation.set(0, 0, 0.3 + Math.sin(t * 6) * 0.05 * (gu < 1 ? 1 : 0));
      if (t > A("s4:cicak") + 0.4) BUG.visible = t < A("s4:cicak") + 0.5;
      // cat: first watches the gecko, then rubs the wall and licks its paw
      const rubA = A("s4:terkena") - 0.2, lickA = A("s4:menjilati") - 0.2;
      const cu = clamp01((t - rubA) / 0.9);
      WC.G.position.set(WX + 1.3 - cu * 0.2, FY + 0.17, WZ + 1.9 - cu * 1.05);
      WC.G.rotation.y = -0.35 + cu * 1.2 + (t > rubA && t < lickA ? 0.15 * Math.sin(t * 5) : 0);
      catLife(WC, t, 3);
      if (t < rubA) { WC.head.rotation.x = -0.35; WC.head.rotation.y = -0.4; }
      const lk = clamp01((t - lickA) / 0.4);
      WC.pawR.position.set(0.15, 0.05 + lk * 0.75, 0.34 + lk * 0.22);
      if (lk > 0) { WC.head.rotation.x = 0.3 * lk + 0.1 * Math.sin(t * 10) * lk; WC.head.rotation.y = 0.15 * lk; }
      // dashed path: bug -> gecko (yellow) -> cat (white), dots appear in order
      const pA = new V3(WX + 0.9, FY + 2.2, WZ + 0.3), pB = new V3(WX - 0.2, FY + 1.95, WZ + 0.35), pC = new V3(WX + 1.3, FY + 1.6, WZ + 1.9);
      const dk = win(t, A("s4:racunnya") - 0.1, A("s4:Kemungkinan") - 0.2, 0.2, 0.4);
      DOTS.forEach((d, i) => {
        const seg = i < 20 ? 0 : 1, u = (i % 20 + 0.5) / 20;
        const a = seg ? pB : pA, b = seg ? pC : pB;
        d.position.lerpVectors(a, b, u); d.position.y += Math.sin(u * Math.PI) * 0.35;
        const at = seg ? A("s4:kucing") - 0.4 : A("s4:serangga") - 0.1;
        const on = (t - at) / 0.8 > u && i % 2 === 0;
        d.visible = dk > 0.01 && on; d.scale.setScalar(dk);
      });
      dotM.opacity = dotM2.opacity = 1;
      const qk = win(t, A("s4:cicak"), A("s4:Kemungkinan"), 0.25, 0.3);
      showLab(qMark, qk, new V3(WX - 0.2, FY + 2.75 + 0.06 * Math.sin(t * 5), WZ + 0.6), 1 + 0.08 * Math.sin(t * 7));
      showLab(tagBT, win(t, A("s4:belum") - 0.1, A("s4:Kemungkinan"), 0.2, 0.3), new V3(WX + 0.2, FY + 3.25, WZ + 0.7), 1.0);
      if (0) showLab(tagLang, win(t, A("s4:langsung") - 0.1, K.s5 + 0.1, 0.25, 0.25), new V3(WX - 0.5, FY + 2.75, WZ + 1.2), 1.0);
    } else DOTS.forEach((d) => (d.visible = false));

    // ---------- s5 paddy + rats ----------
    const ratStart = A("s5:tikus") - 0.6, ratFull = A("s5:merusak");
    const nRat = t < ratStart ? 2 : Math.round(2 + (NR - 2) * smooth((t - ratStart) / (ratFull - ratStart)));
    const pOn = t > K.s5 - 0.3 && t < K.s6;
    const dmg = clamp01((t - A("s5:merusak") + 0.3) / 1.6);
    for (let i = 0; i < NS; i++) {
      const s = stalks[i];
      const hit = dmg > 0 && s[2] < dmg * 0.65;
      const tilt = hit ? 1.25 * clamp01((dmg - s[2] / 0.65 * dmg) * 3 + 0.3) : 0.06 * Math.sin(t * 1.5 + s[3]);
      dummy.position.set(s[0], 0.05, s[1]); dummy.rotation.set(tilt * Math.cos(s[3]), s[3], tilt * Math.sin(s[3])); dummy.scale.set(1, hit ? 0.75 : 1, 1); dummy.updateMatrix(); STK.setMatrixAt(i, dummy.matrix);
      cTmp.copy(hit ? cDead : (s[2] < 0.5 ? cGreen : cGold)); STK.setColorAt(i, cTmp);
    }
    STK.instanceMatrix.needsUpdate = true; STK.instanceColor.needsUpdate = true;
    RATS.forEach((R, i) => {
      const on = pOn && i < nRat; R.G.visible = on; if (!on) return;
      const a = R.ph + t * R.w, born = ratStart + (i / NR) * (ratFull - ratStart);
      const g = back(clamp01((t - born) / 0.35), 2);
      R.G.position.set(R.cx + Math.cos(a) * R.r, 0.05 + Math.abs(Math.sin(t * 9 + i)) * 0.1, R.cz + Math.sin(a) * R.r);
      R.G.rotation.y = -a - (R.w > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.PI;
      R.G.scale.setScalar(Math.max(0.001, g * 1.15));
    });

    // ---------- s6 map route + drop ----------
    const rk = clamp01((t - A("s6:diterbangkan") + 0.2) / 2.2);
    RD.forEach((d, i) => { d.visible = (i + 0.5) / 46 < rk && i % 2 === 0; });
    const mp = rCurve.getPoint(Math.min(0.999, rk)), mp2 = rCurve.getPoint(Math.min(1, rk + 0.01));
    mini.G.visible = t > K.s6 && rk > 0; mini.G.position.copy(mp).add(new V3(0, 0.8, 0)); mini.G.lookAt(mp2.clone().add(new V3(0, 0.8, 0))); mini.G.rotateY(-Math.PI / 2);
    sgPin.visible = t > K.s6; dzPin.visible = t > K.s6 && rk > 0.9; dzPin.position.y = 3.0 + 0.4 * Math.sin(t * 4);
    const sarK = t < K.s6 ? back(clamp01((t - A("s2:Sarawak") + 0.15) / 0.5), 1.6) : 1;
    SAR.scale.y = Math.max(0.02, sarK);
    const bk = t < K.s6 ? clamp01((t - A("s2:berbatasan") + 0.2) / 1.2) : 1;
    dashes.forEach((d, i) => { const on = i / dashes.length < bk; dummy.position.set(d[0], 0.3 + (on ? 0.12 * Math.sin(t * 6 + i * 0.3) * (t < K.s3 ? 1 : 0) : -5), d[1]); dummy.rotation.set(0, d[2], 0); dummy.scale.setScalar(on ? 1.4 : 0.001); dummy.updateMatrix(); DSH.setMatrixAt(i, dummy.matrix); });
    DSH.instanceMatrix.needsUpdate = true;
    if (inMap) {
      const s2 = t < K.s3;
      showLab(mLab.bor, s2 ? win(t, A("s2:Pulau") - 0.2, A("s2:Kalimantan#2") - 0.4, 0.3, 0.3) : 0, new V3(MAP.position.x + mx(113.8), 3, mz(0.2)), 1);
      showLab(mLab.sar, s2 ? win(t, A("s2:Sarawak") + 0.1, K.s3, 0.3, 0.3) : win(t, K.s6, K.s7, 0.3, 0.3), new V3(MAP.position.x + mx(112.6), 6.0, mz(2.4)), 1);
      showLab(mLab.mal, s2 ? win(t, A("s2:Malaysia") - 0.2, K.s3, 0.3, 0.3) : 0, new V3(MAP.position.x + mx(116.6), 6.5, mz(4.2)), 1);
      showLab(mLab.kb, s2 ? win(t, A("s2:Kalimantan#2") - 0.3, K.s3, 0.3, 0.3) : 0, new V3(MAP.position.x + mx(111.6), 4.2, mz(0.6)), 1);
      showLab(mLab.ind, s2 ? win(t, A("s2:Kalimantan#2"), K.s3, 0.3, 0.3) : 0, new V3(MAP.position.x + mx(111.6), 4.2, mz(-0.7)), 1);
      showLab(mLab.br, s2 ? win(t, A("s2:Malaysia"), K.s3, 0.3, 0.3) : 0, new V3(MAP.position.x + mx(114.7), 4.0, mz(4.5)), 1);
      showLab(mLab.sg, !s2 ? win(t, A("s6:Singapura") - 0.3, K.s7, 0.3, 0.3) : 0, new V3(MAP.position.x + mx(105.4), 4.5, mz(3.0)), 1);
    }
    const relA = A("s6:dijatuhkan") - 0.1, openA = A("s6:parasut") - 0.1;
    DR.forEach((c, i) => {
      const on = t >= s6b0 && t < K.s7 - 0.1; c.G.visible = on; if (!on) return;
      const tr = relA + i * 0.35, to = openA + i * 0.3;
      const x0 = plX(tr) - 8, y0 = 28.6;
      if (t < tr) { c.G.visible = false; return; }
      const dt = t - tr, ft = Math.min(dt, Math.max(0, to - tr));
      let x = x0 + 9.5 * ft * 0.6 - (dt > ft ? 0 : 0), y = y0 - 4.9 * ft * ft;
      if (dt > ft) { const d2 = dt - ft; x += 2.5 * (1 - Math.exp(-d2)); y -= 9.8 * ft * Math.min(d2, 0.4) * 0.5 + 2.3 * d2; }
      c.G.position.set(x, y, 4 + (i % 3 - 1) * 2.2 + i * 0.3);
      c.G.rotation.set(0.1 * Math.sin(t * 1.5 + i), i, 0.1 * Math.sin(t * 1.2 + i));
      const ok = t > to ? back(clamp01((t - to) / 0.45), 1.8) : 0;
      c.ch.visible = ok > 0.01; c.ch.scale.set(ok, Math.max(0.01, ok), ok);
      if (c.cat) { catLife(c.cat, t, i); c.cat.head.rotation.x = -0.3; }
    });

    // ---------- s7 tower + 23 crates ----------
    const s7on = t > K.s7 - 0.2;
    const towK = win(t, A("s7:empat") - 0.3, A("s7:mitos") + 0.2, 0.6, 0.6);
    const towFall = clamp01((t - A("s7:mitos")) / 0.8);
    TOW.visible = s7on && towK > 0.01; towEdge.visible = false;
    if (TOW.visible) {
      for (let i = 0; i < NT; i++) {
        const lx = i % 6, lz = Math.floor(i / 6) % 5, ly = Math.floor(i / 30);
        const g = smooth(clamp01((towK * 1.3 - ly / 14)));
        dummy.position.set(-4.3 + lx * 1.7 + towFall * (lx - 2.5) * ly * 0.5, (0.6 + ly * 1.15) * g - towFall * towFall * ly * 0.9, 6 + lz * 1.3 - towFall * ly * 0.3);
        dummy.rotation.set(towFall * (lx - 2.5) * 0.3, 0, towFall * (lz - 2) * 0.4); dummy.scale.setScalar(g > 0.02 ? 1 : 0.001); dummy.updateMatrix(); TOW.setMatrixAt(i, dummy.matrix); towEdge.setMatrixAt(i, dummy.matrix);
      }
      TOW.instanceMatrix.needsUpdate = towEdge.instanceMatrix.needsUpdate = true;
      TOW.material.opacity = 0.85 * towK * (1 - towFall); TOW.material.depthWrite = TOW.material.opacity > 0.8; towEdge.material.opacity = 0.9 * towK * (1 - towFall);
      showLab(lab14, towK * (1 - towFall), new V3(0, 10.5, 14), 1);
    }
    const popA = A("s7:dua") - 0.2;
    C23.forEach((c, i) => {
      const t0 = popA + i * 0.016;
      const on = s7on && t > t0; c.G.visible = on; c.flat.visible = on; if (!on) return;
      const g = back(clamp01((t - t0) / 0.3), 2.2);
      c.G.scale.setScalar(Math.max(0.001, g)); c.flat.scale.set(g, 0.6 * g, g);
      catLife(c.cat, t, c.ph);
      const hop = t > A("s7:Operasinya") && i % 4 === 0 ? Math.abs(Math.sin((t - A("s7:Operasinya")) * 5 + i)) * 0.5 : 0;
      c.cat.G.position.y = 0.15 + hop;
    });
    if (0) showLab(lab23, win(t, A("s7:dua"), A("s7:Operasinya") + 0.3, 0.3, 0.3), new V3(0, 6.2, 9), 1);
    chase.forEach((g, i) => {
      const a0 = A("s7:Operasinya") - 0.3; const on = s7on && t > a0 - 1.5 && t < A("s8:Satu");
      g.visible = on; if (!on) return;
      const run = Math.max(0, t - a0), ang = -0.4 + i * 0.16;
      g.position.set(5 + i * 0.6 + Math.cos(ang) * run * 7, 0.05 + Math.abs(Math.sin(t * 12 + i)) * 0.1, 15 + (i % 3) * 1.2 + Math.sin(ang) * run * 7);
      g.rotation.y = -ang; g.scale.setScalar(1.2);
    });

    // ---------- poofs ----------
    if (!poofs.length) { addPoof(A("s7:mitos"), 0, 6, 8, 120, 2.5); addPoof(LAND, 0, 0.3, 12, 40, 0.7); }
    let pi = 0;
    for (const b of poofs) for (const p of b.P) {
      const d = t - b.tt; if (pi >= 200) break;
      if (d > 0 && d < 1.0 && !inMap) { POOF.pos[pi * 3] = b.x + Math.cos(p[0]) * p[2] * d * 2; POOF.pos[pi * 3 + 1] = b.y + p[1] * d * 3 + 1.5 * d; POOF.pos[pi * 3 + 2] = b.z + Math.sin(p[0]) * p[2] * d * 2; const k = 1 - d; POOF.col[pi * 3] = POOF.col[pi * 3 + 1] = POOF.col[pi * 3 + 2] = k; }
      else POOF.pos[pi * 3 + 1] = -80;
      pi++;
    }
    POOF.commit();

    // ---------- camera ----------
    let roll = 0;
    if (t < K.s2 - 0.12) {
      const y = hookY(t, 0);
      const px = 2.6 - t * 0.3, pz = 35 - t * 0.7;
      setCam([px, y + 2.0, pz, -1.4, y + 1.2, 12], 0);
      roll = 0.14 * (1 - smooth(t / 7));
      if (roll) cam.rotateZ(roll);
      // landing bump
      const d = t - (LAND); if (d > 0 && d < 0.35) cam.position.y += Math.sin(d * 60) * 0.08 * (1 - d / 0.35);
    } else if (t < K.s3 - 0.12) { const c = S.s2(t); c[0] += 1000; c[3] += 1000; setCam(c); }
    else if (t < K.s4 - 0.12) setCam(S.s3(t));
    else if (t < K.s5 - 0.12) setCam(S.s4(t));
    else if (t < K.s6 - 0.12) setCam(S.s5(t));
    else if (t < s6b0) { const c = S.s6a(t); c[0] += 1000; c[3] += 1000; setCam(c); }
    else if (t < K.s7 - 0.12) {
      const px = plX(t), u = smooth((t - relA - 0.1) / 2.2);
      const cx = [px - 4, 33, 40], lk = [px - 4, 27, 4];
      const cx2 = [plX(relA) + 2, 31, 42], lk2 = [plX(relA) - 4, 17, 4];
      setCam([cx[0] + (cx2[0] - cx[0]) * u, cx[1] + (cx2[1] - cx[1]) * u, cx[2] + (cx2[2] - cx[2]) * u, lk[0] + (lk2[0] - lk[0]) * u, lk[1] + (lk2[1] - lk[1]) * u, lk[2] + (lk2[2] - lk[2]) * u], -0.08 * (1 - u));
    }
    else if (t < K.s8 - 0.12) setCam(S.s7(t));
    else setCam(S.s8(t));
    comp.render();
  };
}
