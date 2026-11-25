// EP45 FLUIDFORGE: the Boston molasses flood (15 January 1919) as a liquid-physics film.
// One continuous 1919 waterfront block at 1:1 metre scale: the 15 m riveted tank beside the harbour, the elevated
// railway on Commercial Street, brick rows with a side street, a wooden frame house, a streetcar, warehouses
// (one carries a painted AUDIRA sign) and a steamer at the quay. The molasses is a live heightfield: a glossy
// dark-amber physical surface whose colour follows its depth (thin = amber light passing through, deep = near black),
// with clearcoat highlights from a warm studio-like environment. Shear-thinning motion: the front races out
// (≈15,5 m/s at the start = 56 km/jam) and then decelerates exponentially; ripples slow to a gelatinous stop.
// Stations (pure function of t):
//   s1  hook: street-level in the side street, an 8 m amber wall rolls toward camera under the railway girders (slow-mo)
//   s2  aerial establishing: tank (grey steel), 15 m ruler, sight glass fills (12.000 ton), harbour, AUDIRA sign
//   s3  leak streaks run down the seams, then brown paint climbs the tank and hides them
//   s4  frost melts, a steamer pumps warm molasses through a hose; noon: rivets pop one by one, the seam cracks, burst
//   s5  the surge: girders of the elevated railway lean and sag, the frame house slides off its foundation
//   s6  the flood cools and stills into a glossy lake; tipped streetcar silhouette, floating debris, empty streets
//   s7  orbit of the wreck; 119 windows light up one by one along the street (the class action)
//   s8  golden light, sweet vapour wisps; the tank "rewinds" upright, its paint fades and the leak streaks show again
const FONTS = ['900 80px Inter', '800 80px Inter', '700 80px "JetBrains Mono"', '400 80px "DM Serif Display"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "AUDIRA 15 M 8 M"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, back, canvasTex, stage, pts, envStrips } from "./lib3d.js";

const V3 = THREE.Vector3;
const INTER = 'Inter, "Segoe UI", sans-serif', MONO = '"JetBrains Mono", Consolas, monospace', SERIF = '"DM Serif Display", Georgia, serif';

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
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------- flood physics (shared by mesh, debris, railway, house) ----------------
const TR = 13.5, TH = 15;
const FRONT = (tau) => 70 * (1 - Math.exp(-tau / 4.5));           // front radius beyond the tank wall (m); v0 = 15,5 m/s
const CREST = (tau) => 7.2 * Math.exp(-tau / 4) + 0.8;             // ≈8 m at the start
const BASE = (tau) => 0.75 + 1.5 * Math.exp(-tau / 2.5);           // settles to ≈0,75 m (60–90 cm)
const PHASE = (tau) => 30 * (1 - Math.exp(-tau / 6));              // ripple phase slows to a stop (congealing)
function H(x, z, tau) {
  if (tau <= 0) return 0;
  const d = Math.hypot(x, z), F = FRONT(tau), s = TR + F - d + (0.7 * Math.sin(0.55 * x + 1.3 * tau) + 0.45 * Math.sin(1.3 * x - 0.9 * tau + z * 0.2)) * (1 - Math.exp(-tau * 2));
  if (s < -2.6) return 0;
  const w = 1.8 + tau * 1.6, sw = 1.5 + tau * 0.6;
  const tp = smooth((s + 0.25) / sw);
  let h = tp * (BASE(tau) + CREST(tau) * Math.exp(-(((s - w * 0.9) / w) ** 2)));
  const hin = TH * Math.exp(-tau / 0.55);
  if (hin > 0.05) h = Math.max(h, hin * (1 - smooth((d - TR * 0.35) / (TR * 0.65 + F * 0.6))));
  const amp = (0.45 * Math.exp(-tau / 3.5) + 0.09) * tp, ph = PHASE(tau);
  h += amp * (0.5 * Math.sin(0.75 * d - ph) + 0.3 * Math.sin(0.31 * x + 0.53 * z + ph * 0.4) * Math.sin(0.47 * x - 0.29 * z - ph * 0.3));
  h = Math.max(h, 0.09 * smooth((s + 2.6) / 2.3));
  return Math.max(0, h);
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x8a9aab, exp: 1.0, bloom: [0.06, 0.3, 0.98], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  // warm studio environment (softboxes) so molasses, steel and glass reflect something real
  envStrips(r, scene, [
    [14, 6, 0xfff0dc, 3.2, 0, 10, 2], [10, 3, 0xffb066, 2.2, -10, 3, 6], [8, 4, 0xa8c4ff, 1.4, 10, 4, -8],
    [20, 2, 0xffe6c8, 1.6, 0, 1, -12], [20, 20, 0x3a2614, 0.7, 0, -10, 0]], 0x15110d);
  scene.environmentIntensity = 0.55;
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x9aa7b4, 0.0052);
  cam.near = 0.3; cam.far = 1600; cam.updateProjectionMatrix();

  // ---------- sky dome (gradient shader; colours lerp per station) ----------
  const skyU = { uTop: { value: new THREE.Color(0x4d6680) }, uHor: { value: new THREE.Color(0xb7c2cc) }, uSun: { value: new THREE.Color(0xffe0b0) }, uSunDir: { value: new V3(-0.5, 0.35, 0.8).normalize() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 uTop,uHor,uSun,uSunDir; varying vec3 vD; void main(){ float h = clamp(vD.y,0.0,1.0); vec3 c = mix(uHor,uTop,pow(h,0.55)); float s = max(dot(normalize(vD),uSunDir),0.0); c += uSun*pow(s,12.0)*0.35 + uSun*pow(s,200.0)*0.6; gl_FragColor = vec4(c,1.0); }",
  }));
  sky.renderOrder = -10; scene.add(sky);

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xc8d8ea, 0x4a3626, 0.95); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe2c0, 2.6);
  sun.position.set(50, 75, 95); sun.target.position.set(0, 0, 15);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 10, far: 360 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0xaecbff, 0.9); rim.position.set(50, 35, -90); scene.add(rim);
  const kick = new THREE.DirectionalLight(0xfff4e4, 0.18); scene.add(kick, kick.target);

  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const std = (color, rough = 0.6, metal = 0, ex = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...ex });
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...o });

  // ---------- text plates (billboards) ----------
  const labels = [];
  function plate(text, { font = INTER, weight = 900, h = 1, color = "#fff", bg = "rgba(14,11,8,.82)", bd = "#FFB547", pad = 0.4, sub = null } = {}) {
    const CH = 160, fpx = Math.round(CH * 0.58);
    const mc = document.createElement("canvas").getContext("2d"); mc.font = `${weight} ${fpx}px ${font}`;
    const tw = mc.measureText(text).width, CW = Math.ceil(tw + CH * pad * 2);
    const tex = canvasTex(CW, CH, (g, w, hh) => {
      g.clearRect(0, 0, w, hh);
      if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, hh - 8, 22); g.fill(); if (bd) { g.strokeStyle = bd; g.lineWidth = 6; g.stroke(); } }
      g.font = `${weight} ${fpx}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = color; g.fillText(text, w / 2, hh / 2 + 4);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(h * CW / CH, h), basic({ map: tex, fog: false, toneMapped: false, depthTest: false }));
    m.renderOrder = 9; m.visible = false; scene.add(m); labels.push(m);
    return m;
  }
  const showLab = (m, k, pos, s = 1) => { m.visible = k > 0.003; if (!m.visible) return; m.material.opacity = Math.min(1, k * 1.5); m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.scale.setScalar(Math.max(0.001, s * (0.6 + 0.4 * back(clamp01(k))))); };

  // ================= TEXTURES =================
  const facadeT = (seed, brick, trim) => canvasTex(512, 436, (g, w, h) => {
    const q = mulberry(seed);
    g.fillStyle = brick; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 12) for (let x = ((y / 12) % 2) * 14 - 14; x < w; x += 28) {
      const v = 0.82 + q() * 0.3; g.fillStyle = `rgba(${Math.round(120 * v)},${Math.round(52 * v)},${Math.round(38 * v)},.55)`; g.fillRect(x + 1, y + 1, 26, 10);
    }
    g.fillStyle = "rgba(60,38,30,.25)"; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 1.5);
    // one window bay: 1,3 m × 1,7 m centred at (0.5, 0.45 from top), with stone lintel + sill
    const ww = w * 0.33, wh = h * 0.5, wx = (w - ww) / 2, wy = h * 0.45 - wh / 2 + h * 0.0;
    g.fillStyle = trim; g.fillRect(wx - 10, wy - 22, ww + 20, 18); g.fillRect(wx - 8, wy + wh, ww + 16, 12);
    g.fillStyle = "#EDE3D2"; g.fillRect(wx - 5, wy - 4, ww + 10, wh + 6);
    const gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, "#5D6F82"); gr.addColorStop(0.5, "#1E2833"); gr.addColorStop(1, "#141A21");
    g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
    g.fillStyle = "#EDE3D2"; g.fillRect(wx + ww / 2 - 3, wy, 6, wh); g.fillRect(wx, wy + wh * 0.5 - 3, ww, 6);
    g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + ww * 0.4, wy); g.lineTo(wx, wy + wh * 0.6); g.fill();
  });
  const FAC = [facadeT(3, "#8E3B2A", "#D8CBB4"), facadeT(7, "#7A3326", "#C9BBA2"), facadeT(11, "#9C4A31", "#E2D6C0"), facadeT(17, "#6E3A2E", "#BFB39C")];
  const roofT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#2F2B29"; g.fillRect(0, 0, w, w); const q = mulberry(5); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "20,18,17" : "70,64,60"},.5)`; g.fillRect(q() * w, q() * w, 6, 3); } });
  const snowT = canvasTex(512, 512, (g, w) => { g.clearRect(0, 0, w, w); const q = mulberry(9); for (let i = 0; i < 70; i++) { const x = q() * w, y = q() * w, rr = 20 + q() * 70; const gr = g.createRadialGradient(x, y, 1, x, y, rr); gr.addColorStop(0, "rgba(246,249,252,.95)"); gr.addColorStop(0.7, "rgba(236,242,248,.7)"); gr.addColorStop(1, "rgba(236,242,248,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill(); } }, [6, 6]);
  const groundT = canvasTex(1024, 1024, (g, w) => { g.fillStyle = "#6C6560"; g.fillRect(0, 0, w, w); const q = mulberry(13); for (let i = 0; i < 14000; i++) { const v = q(); g.fillStyle = v < 0.5 ? "rgba(70,62,56,.5)" : "rgba(150,142,132,.35)"; g.fillRect(q() * w, q() * w, 2 + q() * 4, 2 + q() * 3); } }, [40, 40]);
  const cobT = canvasTex(512, 512, (g, w) => { g.fillStyle = "#4A4644"; g.fillRect(0, 0, w, w); const q = mulberry(21); for (let y = 0; y < w; y += 16) for (let x = (y / 16 % 2) * 12; x < w; x += 24) { const v = 0.7 + q() * 0.5; g.fillStyle = `rgb(${Math.round(110 * v)},${Math.round(104 * v)},${Math.round(98 * v)})`; g.beginPath(); g.roundRect(x + 1.5, y + 1.5, 21, 13, 4); g.fill(); } }, [70, 6]);

  // tank textures: UV u spans one panel (22,5°), v bottom→top. 6 courses of plate, rivet rows on every seam.
  const plateDraw = (g, w, h, base, seam, rivet, hi, seed) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const q = mulberry(seed);
    for (let i = 0; i < 900; i++) { g.fillStyle = q() < 0.5 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.04)"; g.fillRect(q() * w, q() * h, 2 + q() * 30, 1 + q() * 3); }
    for (let c = 1; c < 6; c++) { const y = h - (c / 6) * h; g.fillStyle = seam; g.fillRect(0, y - 2, w, 4); for (let x = 6; x < w; x += 14) { g.fillStyle = rivet; g.beginPath(); g.arc(x, y - 9, 3.4, 0, 6.3); g.arc(x + 7, y + 9, 3.4, 0, 6.3); g.fill(); g.fillStyle = hi; g.beginPath(); g.arc(x - 1, y - 10, 1.3, 0, 6.3); g.arc(x + 6, y + 8, 1.3, 0, 6.3); g.fill(); } }
    for (const x of [3, w - 3]) { g.fillStyle = seam; g.fillRect(x - 2, 0, 4, h); for (let y = 6; y < h; y += 14) { g.fillStyle = rivet; g.beginPath(); g.arc(x === 3 ? 12 : w - 12, y, 3.4, 0, 6.3); g.fill(); } }
  };
  const steelT = canvasTex(512, 1024, (g, w, h) => plateDraw(g, w, h, "#7F8A92", "rgba(40,46,52,.65)", "#4E575E", "rgba(255,255,255,.55)", 31));
  const paintT = canvasTex(512, 1024, (g, w, h) => { plateDraw(g, w, h, "#6A3E24", "rgba(40,22,12,.6)", "#4E2C18", "rgba(255,220,180,.35)", 37); const q = mulberry(41); for (let i = 0; i < 160; i++) { g.fillStyle = q() < 0.5 ? "rgba(120,72,40,.18)" : "rgba(40,20,10,.14)"; g.fillRect(q() * w, 0, 3 + q() * 8, h); } });
  paintT.wrapT = THREE.ClampToEdgeWrapping;
  const streakT = canvasTex(512, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h); const q = mulberry(43);
    for (let c = 1; c < 6; c++) { const y0 = h - (c / 6) * h; for (let i = 0; i < 7; i++) { const x = 10 + q() * (w - 20), L = 60 + q() * 260, ww = 4 + q() * 9; const gr = g.createLinearGradient(0, y0, 0, y0 + L); gr.addColorStop(0, "rgba(38,16,4,.95)"); gr.addColorStop(0.75, "rgba(60,26,6,.75)"); gr.addColorStop(1, "rgba(60,26,6,0)"); g.fillStyle = gr; g.beginPath(); g.roundRect(x - ww / 2, y0, ww, L, ww / 2); g.fill(); g.fillStyle = "rgba(40,16,4,.9)"; g.beginPath(); g.arc(x, y0 + L * 0.8, ww * 0.7, 0, 6.3); g.fill(); } }
    for (const x of [8, w - 8]) for (let i = 0; i < 5; i++) { const y0 = q() * h, L = 80 + q() * 200; const gr = g.createLinearGradient(0, y0, 0, y0 + L); gr.addColorStop(0, "rgba(38,16,4,.9)"); gr.addColorStop(1, "rgba(60,26,6,0)"); g.fillStyle = gr; g.fillRect(x - 5, y0, 10, L); }
  });
  const crackT = canvasTex(128, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h); const q = mulberry(47);
    let x = w / 2; g.lineJoin = "round";
    const P = []; for (let y = h; y >= 0; y -= 18) { x = w / 2 + (q() - 0.5) * 40; P.push([x, y]); }
    for (const [lw, col] of [[22, "rgba(255,150,40,.35)"], [12, "rgba(200,96,20,.9)"], [5, "rgba(20,8,2,1)"]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); P.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke(); }
  });
  crackT.wrapT = THREE.ClampToEdgeWrapping;

  // ================= GROUND, STREET, HARBOUR =================
  const ground = add(new THREE.PlaneGeometry(700, 340), std(0xffffff, 0.92, 0, { map: groundT }), 0, 0, 150); ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const street = add(new THREE.PlaneGeometry(700, 15), std(0xffffff, 0.8, 0, { map: cobT }), 0, 0.02, 21.5); street.rotation.x = -Math.PI / 2; street.castShadow = false;
  const side = add(new THREE.PlaneGeometry(12, 120), std(0xffffff, 0.8, 0, { map: cobT.clone() }), 0, 0.025, 88); side.rotation.x = -Math.PI / 2; side.castShadow = false;
  side.material.map.repeat.set(2, 18);
  const railM = std(0x8f8a86, 0.35, 0.8);
  for (const z of [25.7, 27.1]) add(new THREE.BoxGeometry(700, 0.05, 0.1), railM, 0, 0.05, z).castShadow = false;
  const snowM = new THREE.MeshStandardMaterial({ map: snowT, transparent: true, depthWrite: false, roughness: 0.7, color: 0xffffff, polygonOffset: true, polygonOffsetFactor: -2 });
  const gsnowM = snowM.clone(); const gsnow = new THREE.Mesh(new THREE.PlaneGeometry(700, 340), gsnowM); gsnow.rotation.x = -Math.PI / 2; gsnow.position.set(0, 0.04, 150); gsnow.receiveShadow = true; scene.add(gsnow);
  // quay and harbour water
  add(new THREE.BoxGeometry(700, 3.4, 1.2), std(0x6f6a64, 0.9), 0, -1.7, -20.6);
  const waterNT = canvasTex(512, 512, (g, w) => { g.fillStyle = "rgb(128,128,255)"; g.fillRect(0, 0, w, w); const q = mulberry(51); for (let i = 0; i < 2600; i++) { const x = q() * w, y = q() * w; g.fillStyle = `rgba(${q() < 0.5 ? "100,100,255" : "156,156,255"},.5)`; g.beginPath(); g.ellipse(x, y, 14 + q() * 20, 3 + q() * 4, 0, 0, 6.3); g.fill(); } }, [30, 20]);
  waterNT.colorSpace = THREE.NoColorSpace;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1400, 600), new THREE.MeshPhysicalMaterial({ color: 0x2a3a48, roughness: 0.16, metalness: 0.1, normalMap: waterNT, normalScale: new THREE.Vector2(0.35, 0.35), clearcoat: 0.6 }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, -1.6, -321); water.receiveShadow = true; scene.add(water);
  const pileM = std(0x3d3128, 0.9);
  for (let x = -70; x <= 70; x += 5) add(new THREE.CylinderGeometry(0.25, 0.25, 4, 8), pileM, x, -1.2, -21.4);
  // far shore silhouettes + far city
  const farM = std(0x6d7783, 0.95);
  const farG = new THREE.BoxGeometry(1, 1, 1);
  const FARN = 150, FAR = new THREE.InstancedMesh(farG, farM, FARN); scene.add(FAR);
  { const d = new THREE.Object3D(); const q = mulberry(61); for (let i = 0; i < FARN; i++) { const shore = i < 60; const x = -320 + q() * 640, z = shore ? -230 - q() * 60 : 85 + q() * 160, w = 8 + q() * 16, hh = shore ? 4 + q() * 10 : 8 + q() * 22; d.position.set(x, hh / 2 - (shore ? 1.6 : 0), z); d.scale.set(w, hh, 8 + q() * 12); d.updateMatrix(); FAR.setMatrixAt(i, d.matrix); } }

  // ================= BUILDINGS =================
  const contactM = basic({ map: canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, w * 0.25, w / 2, w / 2, w * 0.5); gr.addColorStop(0, "rgba(0,0,0,.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); }), opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -4 });
  function contact(x, z, w, d) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w + 4, d + 4), contactM); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); m.renderOrder = 1; scene.add(m); return m; }
  const roofM = std(0xffffff, 0.85, 0, { map: roofT });
  const roofSnow = [];
  const WINS = []; // street-facing window centres for the 119 lights
  function building(x0, x1, z0, depth, hh, k, faceZ) {
    const w = x1 - x0, cx = (x0 + x1) / 2, cz = z0 + depth / 2;
    const ft = FAC[k % FAC.length].clone(); ft.needsUpdate = true; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(w / 4, hh / 3.4);
    const fs = FAC[k % FAC.length].clone(); fs.needsUpdate = true; fs.wrapS = fs.wrapT = THREE.RepeatWrapping; fs.repeat.set(depth / 4, hh / 3.4);
    const mF = std(0xffffff, 0.82, 0, { map: ft }), mS = std(0xffffff, 0.82, 0, { map: fs });
    const b = add(new THREE.BoxGeometry(w, hh, depth), [mS, mS, roofM, roofM, mF, mF], cx, hh / 2, cz);
    add(new THREE.BoxGeometry(w + 0.5, 0.6, depth + 0.5), std(0x45403c, 0.85), cx, hh + 0.3, cz);
    const sn = new THREE.Mesh(new THREE.PlaneGeometry(w, depth), snowM); sn.rotation.x = -Math.PI / 2; sn.position.set(cx, hh + 0.62, cz); scene.add(sn); roofSnow.push(sn);
    contact(cx, cz, w, depth);
    if (faceZ !== undefined) for (let i = 0; i < Math.round(w / 4); i++) for (let f = 0; f < Math.round(hh / 3.4); f++) WINS.push([x0 + (i + 0.5) * 4, (f + 0.55) * 3.4, faceZ]);
    return b;
  }
  // row 1 (street front at z=31) and row 2 (z=48), side street gap |x|<6, house slot -25..-15 in row 1
  const q0 = mulberry(71);
  const row = (z0, depth, slot) => { let x = -86, k = 0; while (x < 86) { let w = 8 + Math.floor(q0() * 3) * 4; if (x < -6 && x + w > -6) w = -6 - x; if (slot && x < -25 && x + w > -25) w = -25 - x; if (w < 4) { x = x + w; continue; } const hh = 3.4 * (3 + Math.floor(q0() * 3)); building(x, x + w, z0, depth, hh, k++, z0 - 0.03); x += w; if (Math.abs(x + 6) < 0.01) x = 6; if (slot && Math.abs(x + 25) < 0.01) x = -15; } };
  row(31, 13, true); row(48, 14, false);
  // harbour-side warehouses
  building(-60, -40, -17, 22, 10.2, 1); building(-38, -24, -17, 20, 13.6, 2);
  building(24, 52, -17, 25, 10.2, 3); building(54, 76, -17, 24, 13.6, 0);
  // AUDIRA painted wall sign on the east warehouse (faces the street)
  {
    const sT = canvasTex(1024, 300, (g, w, h) => {
      g.fillStyle = "#1F3A2C"; g.fillRect(0, 0, w, h); g.strokeStyle = "#E9DCC0"; g.lineWidth = 10; g.strokeRect(16, 16, w - 32, h - 32);
      g.fillStyle = "#F1E6CC"; g.font = `400 170px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h * 0.47);
      g.font = `700 34px ${MONO}`; g.fillStyle = "#E7B35A"; g.fillText("WHARF  ·  GUDANG PELABUHAN", w / 2, h * 0.85);
      const q = mulberry(77); for (let i = 0; i < 900; i++) { g.fillStyle = "rgba(30,20,15,.12)"; g.fillRect(q() * w, q() * h, 3, 2); }
    });
    const s = add(new THREE.PlaneGeometry(16, 4.7), std(0xffffff, 0.7, 0, { map: sT }), 38, 6.4, 8.04); s.castShadow = false;
  }
  // wooden frame house on its stone foundation (it will slide off)
  const HOUSE = new THREE.Group(); scene.add(HOUSE);
  const sidingT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#B9AE98"; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 16) { g.fillStyle = "rgba(70,60,50,.4)"; g.fillRect(0, y, w, 2); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, y + 2, w, 3); } }, [3, 4]);
  add(new THREE.BoxGeometry(10.4, 0.9, 11.4), std(0x847a70, 0.95), -20, 0.45, 37.5);
  contact(-20, 37.5, 10, 11);
  {
    const hb = add(new THREE.BoxGeometry(9.6, 9.6, 10.6), std(0xffffff, 0.85, 0, { map: sidingT }), 0, 4.8, 0, HOUSE);
    const sh = new THREE.Shape(); sh.moveTo(-5.2, 0); sh.lineTo(5.2, 0); sh.lineTo(0, 3.6); sh.closePath();
    const rg = new THREE.ExtrudeGeometry(sh, { depth: 11.2, bevelEnabled: false }); rg.translate(0, 0, -5.6);
    add(rg, std(0x3b3634, 0.8), 0, 9.6, 0, HOUSE);
    const wm = std(0x1d242c, 0.25, 0.3), tm = std(0xf1ece2, 0.7);
    for (let f = 0; f < 3; f++) for (const x of [-2.8, 0, 2.8]) { add(new THREE.BoxGeometry(1.4, 1.9, 0.12), tm, x, 1.9 + f * 3.1, -5.32, HOUSE); add(new THREE.BoxGeometry(1.1, 1.6, 0.14), wm, x, 1.9 + f * 3.1, -5.34, HOUSE); }
    HOUSE.position.set(-20, 0.9, 37.5);
  }
  // street lamps
  const lampM = std(0x22272a, 0.5, 0.6), glassM = std(0xfff2d0, 0.3, 0);
  for (const [x, z] of [[-5, 29.6], [5, 29.6], [-40, 29.6], [30, 29.6], [-5, 46], [5, 46]]) { add(new THREE.CylinderGeometry(0.09, 0.14, 4.4, 8), lampM, x, 2.2, z); add(new THREE.BoxGeometry(0.5, 0.7, 0.5), glassM, x, 4.6, z); add(new THREE.ConeGeometry(0.42, 0.35, 4), lampM, x, 5.12, z).rotation.y = Math.PI / 4; }

  // ================= ELEVATED RAILWAY =================
  const girM = std(0x2b3330, 0.55, 0.65);
  const COLS = [];
  for (let x = -72; x <= 72; x += 8) for (const z of [17, 22]) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    add(new THREE.BoxGeometry(0.55, 7, 0.55), girM, 0, 3.5, 0, g);
    add(new THREE.BoxGeometry(1.1, 0.25, 1.1), girM, 0, 0.12, 0, g);
    COLS.push({ g, x, z, d: Math.hypot(x, z), amax: 0.55 * Math.exp(-((x / 13) ** 2)) + 0.04 });
  }
  const BAYS = [];
  for (let x = -72; x < 72; x += 8) {
    const g = new THREE.Group(); g.position.set(x + 4, 7.3, 19.5); scene.add(g);
    for (const z of [-2.5, 2.5]) {
      add(new THREE.BoxGeometry(8.1, 0.9, 0.35), girM, 0, 0, z, g);
      for (let k = 0; k < 4; k++) { const br = add(new THREE.BoxGeometry(2.3, 0.1, 0.12), girM, -3 + k * 2, 0, z, g); br.rotation.z = (k % 2 ? 1 : -1) * 0.38; }
    }
    for (let k = -3; k <= 3; k += 2) add(new THREE.BoxGeometry(0.3, 0.45, 5.2), girM, k, -0.1, 0, g);
    add(new THREE.BoxGeometry(8.1, 0.22, 5.4), std(0x3a2f26, 0.9), 0, 0.55, 0, g);
    for (const z of [-1.6, -0.4, 0.4, 1.6]) add(new THREE.BoxGeometry(8.1, 0.14, 0.1), railM, 0, 0.72, z, g);
    BAYS.push({ g, x0: x, x1: x + 8 });
  }

  // ================= STREETCAR =================
  const rbox = (w, h, d) => { const g = new THREE.BoxGeometry(w, h, d, 2, 2, 2); return g; };
  const CAR = new THREE.Group(); scene.add(CAR);
  {
    const carT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#2E4A3C"; g.fillRect(0, 0, w, h); g.fillStyle = "#E7DCC2"; g.fillRect(0, h * 0.18, w, h * 0.42); for (let i = 0; i < 9; i++) { g.fillStyle = "#1A2128"; g.fillRect(14 + i * 55, h * 0.22, 40, h * 0.34); } g.fillStyle = "#B88A3A"; g.fillRect(0, h * 0.68, w, 5); });
    add(rbox(10, 2.6, 2.5), std(0xffffff, 0.6, 0.1, { map: carT }), 0, 1.75, 0, CAR);
    add(new THREE.BoxGeometry(10.4, 0.25, 2.8), std(0x2a2522, 0.7), 0, 3.15, 0, CAR);
    add(new THREE.BoxGeometry(8, 0.45, 2.1), std(0x1b1d1f, 0.6, 0.4), 0, 0.42, 0, CAR);
    CAR.position.set(17, 0, 26.4);
  }

  // ================= TANK =================
  const NP = 16, DTH = (Math.PI * 2) / NP;
  const TANK = new THREE.Group(); scene.add(TANK);
  add(new THREE.CylinderGeometry(TR + 0.8, TR + 1.0, 0.35, 64), std(0x8a8279, 0.9), 0, 0.17, 0, TANK);
  contact(0, 0, 2 * TR + 2, 2 * TR + 2);
  const steelM = std(0xffffff, 0.42, 0.55, { map: steelT, side: THREE.DoubleSide });
  const paintTx = paintT; paintTx.repeat.set(1, 1);
  const paintM = std(0xffffff, 0.5, 0.12, { map: paintTx, side: THREE.DoubleSide });
  const streakM = new THREE.MeshPhysicalMaterial({ map: streakT, transparent: true, opacity: 0, depthWrite: false, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  const PANELS = [];
  for (let i = 0; i < NP; i++) {
    const th0 = i * DTH, thm = th0 + DTH / 2;
    const px = TR * Math.sin(thm), pz = TR * Math.cos(thm);
    const g = new THREE.Group(); g.position.set(px, 0.3, pz); TANK.add(g);
    const mk = (rr, mat) => { const geo = new THREE.CylinderGeometry(rr, rr, TH, 8, 1, true, th0, DTH); geo.translate(-px * rr / TR, TH / 2, -pz * rr / TR); const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    mk(TR, steelM);
    const st = mk(TR + 0.03, streakM); st.castShadow = false;
    const pa = mk(TR + 0.06, paintM);
    const tan = new V3(Math.cos(thm), 0, -Math.sin(thm)), nrm = new V3(Math.sin(thm), 0, Math.cos(thm));
    PANELS.push({ g, pa, thm, tan, nrm, p0: new V3(px, 0.3, pz), rnd: hsh(i, 1) });
  }
  // paint front ring (wet edge rising)
  const ringM = std(0x7a4626, 0.25, 0.1, { transparent: true, opacity: 0 });
  const RING = add(new THREE.TorusGeometry(TR + 0.08, 0.12, 8, 96), ringM, 0, 0, 0, TANK); RING.rotation.x = Math.PI / 2; RING.castShadow = false;
  // roof cone
  const ROOF = new THREE.Group(); TANK.add(ROOF); ROOF.position.y = TH + 0.3;
  add(new THREE.ConeGeometry(TR + 0.35, 2.6, 64, 1, true), std(0x5b5f63, 0.55, 0.45, { side: THREE.DoubleSide }), 0, 1.3, 0, ROOF);
  add(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 16), std(0x4a4e52, 0.5, 0.5), 0, 2.8, 0, ROOF);
  // sight glass (fill gauge) facing the s2 camera
  const SG = new THREE.Group(); TANK.add(SG);
  { const th = 0.55; SG.position.set((TR + 0.35) * Math.sin(th), 0.6, (TR + 0.35) * Math.cos(th)); SG.rotation.y = th; }
  add(new THREE.BoxGeometry(0.55, 13.6, 0.25), std(0x30363a, 0.4, 0.7), 0, 6.8, 0, SG);
  const sgGlass = add(new THREE.BoxGeometry(0.34, 13.2, 0.3), new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.35, clearcoat: 1 }), 0, 6.8, 0.02, SG);
  const sgFill = add(new THREE.BoxGeometry(0.3, 1, 0.3), new THREE.MeshPhysicalMaterial({ color: 0x5a2506, roughness: 0.12, clearcoat: 1, emissive: 0x7a3008, emissiveIntensity: 0.45 }), 0, 0.2, 0.03, SG);
  // seam with popping rivets + crack (panel boundary k=1 → θ = 22,5°)
  const THS = DTH, SN = new V3(Math.sin(THS), 0, Math.cos(THS)), ST = new V3(Math.cos(THS), 0, -Math.sin(THS));
  const rivM = std(0x9aa3aa, 0.3, 0.9);
  const RIV = [];
  for (let i = 0; i < 16; i++) {
    const y = 0.9 + i * 0.38, side = i % 2 ? 0.16 : -0.16;
    const m = add(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 10), rivM);
    const p = SN.clone().multiplyScalar(TR + 0.12).add(ST.clone().multiplyScalar(side)); p.y = y + 0.3;
    m.position.copy(p); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), SN);
    RIV.push({ m, p, i });
  }
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.75, TH), basic({ map: crackT, opacity: 1 }));
  crack.geometry.translate(0, TH / 2, 0);
  crack.position.copy(SN.clone().multiplyScalar(TR + 0.1)); crack.position.y = 0.3; crack.lookAt(crack.position.clone().add(SN)); crack.renderOrder = 4; scene.add(crack);
  // 15 m ruler beside the tank
  const RUL = new THREE.Group(); RUL.position.set(-10.6, 0, 12.4); scene.add(RUL);
  const rulM = std(0xffb547, 0.35, 0.2, { emissive: 0xffa030, emissiveIntensity: 0.4 });
  add(new THREE.BoxGeometry(0.16, TH, 0.16), rulM, 0, TH / 2, 0, RUL);
  for (let k = 0; k <= 15; k++) add(new THREE.BoxGeometry(k % 5 ? 0.6 : 1.3, 0.08, 0.12), rulM, (k % 5 ? 0.3 : 0.65), k + 0.3, 0, RUL);
  const lab15 = plate("15 M", { h: 1.9 });
  const lab8 = plate("8 M", { h: 2.2, bg: "rgba(14,11,8,.86)" });
  const lab56 = plate("56 KM/JAM", { h: 2.0, font: MONO, weight: 700 });

  // ================= SHIP + HOSE =================
  const SHIP = new THREE.Group(); scene.add(SHIP); SHIP.position.set(-12, -1.6, -31);
  {
    const sh = new THREE.Shape(); sh.moveTo(-20, -3.5); sh.lineTo(15, -3.5); sh.quadraticCurveTo(22, -1.8, 24, 0); sh.quadraticCurveTo(22, 1.8, 15, 3.5); sh.lineTo(-20, 3.5); sh.quadraticCurveTo(-22, 0, -20, -3.5);
    const hg = new THREE.ExtrudeGeometry(sh, { depth: 5.2, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 2, curveSegments: 16 }); hg.rotateX(-Math.PI / 2); hg.translate(0, -1.6, 0);
    add(hg, std(0x1f2124, 0.55, 0.2), 0, 0, 0, SHIP);
    add(new THREE.BoxGeometry(41, 0.5, 7.4), std(0x8a2f22, 0.7), 2, -1.4, 0, SHIP);
    add(new THREE.BoxGeometry(8, 3, 5.4), std(0xe8e2d4, 0.6), -11, 5, 0, SHIP);
    add(new THREE.BoxGeometry(5, 2, 4.4), std(0xe8e2d4, 0.6), -11, 7.4, 0, SHIP);
    add(new THREE.CylinderGeometry(0.95, 0.95, 6, 16), std(0xc8a46a, 0.5), -6, 8.6, 0, SHIP);
    add(new THREE.CylinderGeometry(0.98, 0.98, 1.2, 16), std(0x151515, 0.5), -6, 11.6, 0, SHIP);
    for (const x of [-16, 10]) add(new THREE.CylinderGeometry(0.18, 0.22, 13, 8), std(0x5a4a3a, 0.7), x, 9.6, 0, SHIP);
  }
  const hoseCurve = new THREE.CatmullRomCurve3([new V3(-6, 4.4, -28.5), new V3(-5, 9, -24), new V3(-3, 15.6, -17), new V3(-1.2, 16.6, -12.6), new V3(-0.6, 15.9, -11.4)]);
  const hoseM = std(0x1d1a18, 0.55, 0.1);
  const HOSE = add(new THREE.TubeGeometry(hoseCurve, 80, 0.38, 12, false), hoseM);
  const pulseT = canvasTex(256, 16, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const gr = g.createLinearGradient(i * 64, 0, i * 64 + 64, 0); gr.addColorStop(0, "rgba(255,140,40,0)"); gr.addColorStop(0.5, "rgba(255,150,50,.95)"); gr.addColorStop(1, "rgba(255,140,40,0)"); g.fillStyle = gr; g.fillRect(i * 64, 0, 64, h); } }, [3, 1]);
  const HOSEG = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 80, 0.4, 12, false), basic({ map: pulseT, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(HOSEG);

  // ================= MOLASSES HEIGHTFIELD =================
  const FX0 = -72, FX1 = 72, FZ0 = -20, FZ1 = 82, NX = 300, NZ = 212;
  const fg = new THREE.PlaneGeometry(FX1 - FX0, FZ1 - FZ0, NX, NZ); fg.rotateX(-Math.PI / 2); fg.translate((FX0 + FX1) / 2, 0, (FZ0 + FZ1) / 2);
  const fpos = fg.attributes.position, fnrm = fg.attributes.normal, NV = fpos.count;
  const fcol = new Float32Array(NV * 3); fg.setAttribute("color", new THREE.BufferAttribute(fcol, 3));
  const FXZ = new Float32Array(NV * 2); for (let i = 0; i < NV; i++) { FXZ[i * 2] = fpos.getX(i); FXZ[i * 2 + 1] = fpos.getZ(i); }
  const molM = new THREE.MeshPhysicalMaterial({ vertexColors: true, color: 0xffffff, roughness: 0.07, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02, ior: 1.49, specularIntensity: 1, envMapIntensity: 1 });
  const sssU = { value: 0.2 }, skyRefl = { value: new THREE.Color(0xb7c2cc) };
  molM.onBeforeCompile = (sh) => {
    sh.uniforms.uSSS = sssU;
    sh.uniforms.uSky = skyRefl; sh.fragmentShader = "uniform float uSSS; uniform vec3 uSky;\n" + sh.fragmentShader.replace("#include <lights_fragment_maps>", "#include <lights_fragment_maps>\n radiance *= 0.75;\n #ifdef USE_CLEARCOAT\n clearcoatRadiance *= 0.55;\n #endif").replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n float fres = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));\n totalEmissiveRadiance += vColor.rgb * uSSS * (0.35 + 0.9 * fres * fres) + uSky * pow(fres, 5.0) * 0.14 + vec3(0.85,0.36,0.06) * pow(fres, 2.5) * 0.32 + vec3(0.62,0.2,0.03) * 0.075 * (1.0 - abs(dot(normalize(normal), normalize((viewMatrix * vec4(0.0,1.0,0.0,0.0)).xyz))));");
  };
  const FLOOD = new THREE.Mesh(fg, molM); FLOOD.frustumCulled = false; FLOOD.receiveShadow = true; FLOOD.castShadow = false; scene.add(FLOOD);
  // curling lip along the front (hook + surge): a rounded glossy roll leaning forward over the wave face
  const LIPR = 20, lipCurve = new THREE.CurvePath();
  { const pts3 = []; for (let i = 0; i <= 40; i++) { const a = -0.75 + 1.5 * i / 40; pts3.push(new V3(Math.sin(a) * LIPR, 0, Math.cos(a) * LIPR)); } lipCurve.add(new THREE.CatmullRomCurve3(pts3)); }
  const lipM = new THREE.MeshPhysicalMaterial({ color: 0x3e1604, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color(0xe08a2a), emissive: 0x2a0c02 });
  const lipG = new THREE.TubeGeometry(lipCurve.curves[0], 120, 1, 20, false);
  { const lp = lipG.attributes.position, c = new V3(), v = new V3();
    for (let i = 0; i <= 120; i++) { lipCurve.curves[0].getPointAt(i / 120, c); const f = 0.78 + 0.22 * Math.sin(i * 0.37) + 0.14 * Math.sin(i * 1.31 + 1);
      for (let j = 0; j <= 20; j++) { const k = i * 21 + j; v.fromBufferAttribute(lp, k).sub(c); v.multiplyScalar(f); if (v.y < 0) v.y *= 1.9; const rad = new V3(c.x, 0, c.z).normalize(); v.addScaledVector(rad, Math.max(0, v.y) * 0.45); lp.setXYZ(k, c.x + v.x, c.y + v.y, c.z + v.z); } }
    lipG.computeVertexNormals(); }
  const LIP = new THREE.Mesh(lipG, lipM); LIP.castShadow = true; scene.add(LIP);
  const cThin = new THREE.Color(0xd2781e), cMid = new THREE.Color(0x6a2808), cDeep = new THREE.Color(0x1c0802), ctmp = new THREE.Color();
  let lastTau = -99;
  function updateFlood(tau) {
    FLOOD.visible = tau > 0;
    if (!FLOOD.visible || Math.abs(tau - lastTau) < 1e-5) return;
    lastTau = tau;
    for (let i = 0; i < NV; i++) {
      const x = FXZ[i * 2], z = FXZ[i * 2 + 1];
      const h = H(x, z, tau);
      fpos.setY(i, h > 0.015 ? h + 0.04 : -0.12);
      const e = 0.55, hx = H(x + e, z, tau) - H(x - e, z, tau), hz = H(x, z + e, tau) - H(x, z - e, tau);
      { const nx = -hx, ny = 2 * e, nz = -hz, l = Math.hypot(nx, ny, nz); fnrm.setXYZ(i, nx / l, ny / l, nz / l); }
      const dd = Math.hypot(x, z), hi = dd > 1.5 ? H(x * (1 - 1.4 / dd), z * (1 - 1.4 / dd), tau) : h, hcol = Math.max(h, hi);
      const k = clamp01(hcol / 0.3), k2 = clamp01((hcol - 0.3) / 0.7);
      if (k2 > 0) ctmp.copy(cMid).lerp(cDeep, k2); else ctmp.copy(cThin).lerp(cMid, k);
      fcol[i * 3] = ctmp.r; fcol[i * 3 + 1] = ctmp.g; fcol[i * 3 + 2] = ctmp.b;
    }
    fpos.needsUpdate = true; fg.attributes.color.needsUpdate = true; fnrm.needsUpdate = true;
  }
  // spray droplets at the crest + rivet jets + vapour
  const SPR = pts(scene, 1400, { color: 0x6a2c08, size: 0.32, add: false, opacity: 0.95 });
  SPR.m.toneMapped = true;
  const JET = pts(scene, 700, { color: 0x4a1c04, size: 0.22, add: false, opacity: 1 });
  const VAP = pts(scene, 260, { color: 0xffd9a0, size: 3.2, add: true, opacity: 0.18 });
  const STEAM = pts(scene, 160, { color: 0xffffff, size: 2.2, add: false, opacity: 0.35 });

  // floating debris: barrels, planks, crates
  const DEB = [];
  {
    const q = mulberry(91);
    const bM = std(0x6b4a2c, 0.75), pM = std(0x8c6a46, 0.8), cM = std(0x7d5e3b, 0.8);
    for (let i = 0; i < 46; i++) {
      const a = (q() - 0.5) * 2.6, d0 = 15.5 + q() * 14;
      const kind = i % 3;
      const geo = kind === 0 ? new THREE.CylinderGeometry(0.38, 0.38, 1.0, 12) : kind === 1 ? new THREE.BoxGeometry(2.6, 0.14, 0.32) : new THREE.BoxGeometry(1, 0.9, 1);
      const m = add(geo, kind === 0 ? bM : kind === 1 ? pM : cM);
      const p0 = new V3(Math.sin(a) * d0, 0, Math.cos(a) * d0);
      if (p0.z > 28.5 && Math.abs(p0.x) > 6) p0.z = 28;
      DEB.push({ m, p0, d0, dir: p0.clone().normalize(), kind, ry: q() * 6.28, sp: q() });
    }
  }
  // 119 window lights along row 1 (the class action)
  const WL = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.25, 1.65), new THREE.MeshBasicMaterial({ color: 0xffc77a, toneMapped: false }), 119); scene.add(WL);
  const WSEL = [];
  { const q = mulberry(97); const cand = WINS.filter((w) => w[2] < 35 && Math.abs(w[0]) < 70); for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(q() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; } for (let i = 0; i < 119; i++) WSEL.push(cand[i % cand.length]); }

  // ================= TIME MAPS =================
  const burstT = A("s4:terbelah");
  const tauMain = track([[burstT - 0.05, 0], [burstT + 0.7, 0.14], [A("s5:Gelombangnya"), 0.22], [A("s5:menabrak") + 0.2, 0.75], [A("s5:menggeser") + 0.4, 1.55], [K.s6, 3.0], [A("s6:lem"), 7.5], [K.s7, 12], [K.s8, 15], [K.dur, 17]]);
  const tauOf = (t) => (t < K.s2 - 0.12 ? 0.3 + t * 0.27 : t < burstT - 0.05 ? -1 : tauMain(t)[0]);

  // camera stations
  const S = {
    s2: track([[K.s2 - 0.12, 84, 56, 40, 0, 2, -4], [A("s2:Boston"), 72, 46, 34, 0, 3, -2], [A("s2:berdiri"), 44, 22, 30, 0, 6.5, 0], [A("s2:dua"), 33, 14, 28, 0, 7.5, 0], [K.s3, 26, 11, 26, -2, 7.5, 0]]),
    s3: track([[K.s3 - 0.12, 50, 12, 15.5, 0, 7, 6], [A("s3:alkohol"), 45, 10, 15.5, 0, 7, 6], [A("s3:Tapi"), 38, 9, 15, 2, 7, 5], [A("s3:bocor"), 28, 6.5, 13, 6, 6.2, 4], [A("s3:dicat"), 38, 8.5, 15, 0, 7.5, 5], [K.s4, 44, 10, 15.5, 0, 7.5, 5]]),
    s4: track([[K.s4 - 0.12, 46, 22, 12, -6, 6, -16], [A("s4:Sehari"), 40, 17, 2, -6, 6, -20], [A("s4:tangki"), 34, 15, -4, -3, 9, -16], [A("s4:Siang") - 0.1, 14, 4.5, 24, 5, 3.6, 12], [A("s4:lepas"), 9.5, 3.2, 21, 5, 3.2, 12.5], [burstT - 0.2, 9.5, 3.4, 21.5, 5, 3.4, 12.5], [burstT + 0.6, 44, 12, 16, 0, 6, 2], [K.s5, 36, 9, 15.5, 2, 4.5, 7]]),
    s5: track([[K.s5 - 0.12, 36, 9, 15.5, 2, 4.5, 7], [A("s5:Gelombangnya"), 40, 8, 27.5, 4, 4, 16], [A("s5:menabrak") - 0.2, 34, 7.5, 27, 0, 4.5, 18], [A("s5:layang"), 24, 8.5, 27.5, -4, 4.5, 20], [A("s5:menggeser") - 0.3, -4, 8, 23, -20, 4.5, 34], [K.s6, -2, 10, 21, -20, 4, 34]]),
    s6: track([[K.s6 - 0.12, -2, 10, 21, -20, 4, 34], [A("s6:mengental"), 6, 36, 78, 0, 0, 22], [A("s6:Dua"), 40, 16, 6, 14, 1, 26], [A("s6:terluka"), 38, 15, 7, 14, 1, 27], [K.s7, 36, 14, 8, 12, 1.5, 24]]),
    s7: track([[K.s7 - 0.12, 36, 14, 8, 12, 1.5, 24], [A("s7:anarkis"), 32, 17, 28, 0, 2, 3], [A("s7:sidang"), 14, 20, 34, -2, 2, 2], [A("s7:lalai"), -14, 19, 30, -2, 2, 2], [A("s7:benar"), -28, 17, 20, -3, 3, 6], [A("s7:Gugatan"), 16, 21, 0, -22, 8, 31], [K.s8, 18, 21, 1, -20, 8, 31]]),
    s8: track([[K.s8 - 0.12, -36, 16, -6, 6, 6.5, 31], [A("s8:tercium"), -6, 52, 96, 0, 0, 18], [A("s8:Satu"), -50, 24, 30, 0, 6, 0], [A("s8:menutupi"), -46, 15, 24, 0, 7, 2], [K.dur, -44, 15, 23, 0, 7, 2]]),
  };
  const look = new V3();
  const setCam = (c, roll = 0) => { cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.up.set(0, 1, 0); cam.lookAt(look); if (roll) cam.rotateZ(roll); };
  const cWarm = new THREE.Color(0xffe2c0), cGold = new THREE.Color(0xffa860), cCold = new THREE.Color(0xcfdcf0);
  const skyTopA = new THREE.Color(0x4d6680), skyHorA = new THREE.Color(0xb7c2cc), skyTopG = new THREE.Color(0x5a5e7a), skyHorG = new THREE.Color(0xf0b47a), skyTopC = new THREE.Color(0x3c4c60), skyHorC = new THREE.Color(0x8996a4);
  const fogA = new THREE.Color(0x9aa7b4), fogG = new THREE.Color(0xc89a78), fogC = new THREE.Color(0x77838f);

  // ================= DRAW =================
  return function draw(t) {
    for (const l of labels) l.visible = false;
    const tau = tauOf(t);
    const hook = t < K.s2 - 0.12;

    // ---------- light / sky moods ----------
    const gold = smooth((t - K.s8 - 0.5) / 4), cold = t < K.s8 ? win(t, K.s6 - 0.5, K.s7 + 4, 2.5, 3) * 0.8 : 0;
    sun.color.copy(cWarm).lerp(cGold, gold).lerp(cCold, cold);
    sun.intensity = 2.6 - 0.9 * cold + 0.5 * gold;
    sun.position.set(50 - 110 * gold, 75 - 35 * gold, 95);
    hemi.intensity = 0.95 - 0.3 * cold - 0.15 * gold;
    skyU.uTop.value.copy(skyTopA).lerp(skyTopC, cold).lerp(skyTopG, gold);
    skyU.uHor.value.copy(skyHorA).lerp(skyHorC, cold).lerp(skyHorG, gold);
    skyU.uSunDir.value.set(-0.5, 0.35 - 0.2 * gold, 0.8).normalize();
    scene.fog.color.copy(fogA).lerp(fogC, cold).lerp(fogG, gold);

    // ---------- snow & thaw ----------
    const thaw = hook ? 1 : t < K.s4 ? 0 : clamp01((t - A("s4:menghangat")) / 3.5);
    snowM.opacity = 1 - thaw; gsnowM.opacity = 0.45 * (1 - thaw);

    // ---------- flood ----------
    updateFlood(tau);
    { const F0 = tau > 0 ? FRONT(tau) : 0, on = tau > 0 && tau < 3.2; LIP.visible = on; if (on) { const k = (TR + F0 - 1.3) / LIPR, cr = CREST(tau) + BASE(tau), rr = Math.max(0.3, cr * 0.13); LIP.scale.set(k, rr, k); LIP.position.y = cr * 0.93 - rr * 0.2; LIP.material.opacity = 1; LIP.scale.y = rr; } }
    sssU.value = 0.2 + 0.12 * gold;
    const F = tau > 0 ? FRONT(tau) : 0;

    // ---------- tank: steel → leaks → paint → burst (→ rewind in s8) ----------
    const leak = t < K.s3 ? 0 : clamp01((t - A("s3:bocor") + 0.3) / 1.4);
    const paintK = hook || t >= K.s4 ? 1 : t < K.s3 ? 0 : smooth((t - A("s3:dicat") + 0.4) / 1.6);
    const unpaint = t > A("s8:menutupi") - 0.3 ? smooth((t - A("s8:menutupi") + 0.3) / 1.4) : 0;
    const pk = paintK * (1 - unpaint);
    streakM.opacity = Math.max(leak * (1 - smooth((t - A("s3:dicat") - 1.4) / 0.6)) , unpaint) * (t < K.s3 ? 0 : 1);
    if (hook) streakM.opacity = 0;
    paintTx.repeat.y = Math.max(0.001, pk); paintTx.offset.y = 0;
    for (const P of PANELS) { P.pa.visible = pk > 0.002; P.pa.scale.y = Math.max(0.001, pk); }
    RING.position.y = 0.3 + TH * pk; ringM.opacity = pk > 0.01 && pk < 0.99 ? 0.95 : 0;
    const rew = t > A("s8:Satu") - 0.9 ? smooth((t - A("s8:Satu") + 0.9) / 1.6) : 0;
    const pb = smooth(tau / (hook ? 1.1 : 0.14)) * (1 - rew);
    PANELS.forEach((P, i) => {
      const face = 0.5 + 0.5 * Math.cos(P.thm - THS);
      const a = Math.min(1.5, pb * (0.25 + 1.25 * face * face) * (0.85 + 0.3 * P.rnd));
      const slide = pb * (2 + 9 * face * face) * (0.8 + 0.4 * P.rnd);
      P.g.position.copy(P.p0).addScaledVector(P.nrm, slide);
      P.g.quaternion.setFromAxisAngle(P.tan, a);
      P.g.rotateY(pb * (P.rnd - 0.5) * 0.6);
    });
    ROOF.visible = pb < 0.6; ROOF.position.y = TH + 0.3 - pb * 17.3; ROOF.rotation.set(pb * 0.42, 0, pb * 0.3);
    SG.visible = pb < 0.02;
    crack.visible = !hook && t > A("s4:paku") - 0.2 && pb < 0.02 && t < K.s5;
    if (crack.visible) { const ck = clamp01((t - A("s4:paku") + 0.2) / (burstT - A("s4:paku") + 0.1)); crack.scale.y = Math.max(0.001, ck); crackT.repeat.y = Math.max(0.001, ck); }
    // sight glass fills to 12.000 ton
    const fill = t < K.s2 ? 1 : clamp01((t - A("s2:berisi") + 0.2) / (A("s2:ton") - A("s2:berisi") + 0.4));
    sgFill.scale.y = Math.max(0.01, 12.4 * smooth(fill)); sgFill.position.y = 0.2 + sgFill.scale.y / 2;
    // rivets
    const popA = A("s4:paku") - 0.25, popGap = (A("s4:lepas") + 0.3 - popA) / 16;
    RIV.forEach((R) => {
      const tp = popA + ((R.i * 7) % 16) * popGap;
      const gone = pb > 0.02 || (rew > 0.5);
      R.m.visible = !gone && !hook;
      if (!R.m.visible) return;
      const dt = t - tp;
      if (t < K.s4 + 1 || dt <= 0) { R.m.position.copy(R.p); R.m.quaternion.setFromUnitVectors(new V3(0, 1, 0), SN); return; }
      R.m.position.copy(R.p).addScaledVector(SN, dt * 7).addScaledVector(ST, (hsh(R.i, 3) - 0.5) * dt * 3); R.m.position.y += dt * 3.2 - 4.9 * dt * dt;
      if (R.m.position.y < 0.12) R.m.position.y = 0.12;
      R.m.rotation.set(dt * 14, dt * 9, 0);
    });
    // jets from rivet holes
    {
      let n = 0;
      if (!hook && pb < 0.02 && t > popA && t < burstT + 0.2) RIV.forEach((R) => {
        const tp = popA + ((R.i * 7) % 16) * popGap; if (t < tp) return;
        const strength = clamp01((t - tp) / 0.3);
        for (let k = 0; k < 40 && n < 700; k++, n++) {
          const ph = ((t * 1.3 + k / 40) % 1), v = 3.2 * strength;
          const p = R.p.clone().addScaledVector(SN, ph * v + 0.15); p.y += -2.4 * ph * ph + (hsh(k, R.i) - 0.5) * 0.1;
          if (p.y < 0.05) p.y = 0.05;
          JET.pos[n * 3] = p.x + (hsh(k, 7) - 0.5) * 0.12; JET.pos[n * 3 + 1] = p.y; JET.pos[n * 3 + 2] = p.z;
        }
      });
      for (; n < 700; n++) JET.pos[n * 3 + 1] = -50;
      JET.commit();
    }
    // spray at the crest
    {
      const on = tau > 0 && tau < 4.5, k = on ? (1 - tau / 4.5) : 0;
      for (let i = 0; i < 1400; i++) {
        if (!on) { SPR.pos[i * 3 + 1] = -50; continue; }
        const ang = -1.6 + 3.2 * hsh(i, 1), rr = TR + F - 0.6 - hsh(i, 2) * 1.6;
        const x = Math.sin(ang) * rr, z = Math.cos(ang) * rr;
        const ph = (tau * 2.2 + hsh(i, 3)) % 1, hc = H(x, z, tau);
        SPR.pos[i * 3] = x + Math.sin(ang) * ph * 1.8; SPR.pos[i * 3 + 1] = hc * (0.75 + 0.4 * hsh(i, 4)) + ph * 2.2 - ph * ph * 3.2 * k + 0.2; SPR.pos[i * 3 + 2] = z + Math.cos(ang) * ph * 1.8;
        if (hc < 0.3 || hsh(i, 5) > k) SPR.pos[i * 3 + 1] = -50;
      }
      SPR.commit();
    }
    // vapour (s8, "sweet smell") and steam from the roof vent (s4 filling)
    {
      const vk = win(t, A("s8:hari") - 0.5, A("s8:Satu"), 1, 1.2);
      for (let i = 0; i < 260; i++) {
        if (vk < 0.01) { VAP.pos[i * 3 + 1] = -50; continue; }
        const ph = (t * 0.12 + hsh(i, 1)) % 1, x = -50 + hsh(i, 2) * 100, z = 16 + hsh(i, 3) * 40;
        VAP.pos[i * 3] = x + Math.sin(t * 0.4 + i) * 2; VAP.pos[i * 3 + 1] = 1 + ph * 7; VAP.pos[i * 3 + 2] = z;
        const c = vk * Math.sin(Math.PI * ph); VAP.col[i * 3] = c; VAP.col[i * 3 + 1] = c * 0.85; VAP.col[i * 3 + 2] = c * 0.6;
      }
      VAP.commit();
      const sk = t > K.s4 && t < burstT ? win(t, A("s4:kapal") - 0.3, burstT - 0.3, 0.8, 0.6) : 0;
      for (let i = 0; i < 160; i++) {
        if (sk < 0.01) { STEAM.pos[i * 3 + 1] = -50; continue; }
        const ph = (t * 0.35 + hsh(i, 1)) % 1;
        STEAM.pos[i * 3] = (hsh(i, 2) - 0.5) * 2 + ph * 3; STEAM.pos[i * 3 + 1] = TH + 3.2 + ph * 9; STEAM.pos[i * 3 + 2] = (hsh(i, 3) - 0.5) * 2 - ph * 1.5;
        const c = sk * Math.sin(Math.PI * ph) * 0.9; STEAM.col[i * 3] = STEAM.col[i * 3 + 1] = STEAM.col[i * 3 + 2] = c;
      }
      STEAM.commit();
    }
    // ship + hose (s4 only)
    const shipOn = !hook && t > K.s4 - 0.2 && t < K.s7;
    SHIP.visible = shipOn; HOSE.visible = HOSEG.visible = shipOn && pb < 0.02;
    SHIP.position.y = -1.6 + 0.08 * Math.sin(t * 0.9);
    HOSEG.material.opacity = win(t, A("s4:mengisi") - 0.2, burstT - 0.3, 0.5, 0.4) * 0.85; pulseT.offset.x = -t * 0.9;

    // ---------- railway: columns lean, bays sag ----------
    const lean = (c) => (tau > 0 ? Math.min(c.amax, Math.max(0, (TR + F - c.d + 1) * 0.07)) * smooth((TR + F - c.d + 1) / 3) : 0);
    COLS.forEach((c) => { c.lean = lean(c); c.g.rotation.set(c.lean, 0, (c.x > 0 ? -1 : 1) * c.lean * 0.15); });
    BAYS.forEach((b) => {
      const cs = COLS.filter((c) => c.x === b.x0 || c.x === b.x1), a = cs.reduce((s, c) => s + c.lean, 0) / cs.length;
      b.g.position.set((b.x0 + b.x1) / 2, 7.3 - 7 * (1 - Math.cos(a)) - a * 1.2, 19.5 + 7 * Math.sin(a));
      b.g.rotation.set(a * 0.6, 0, (cs[0].lean - (cs[1] ? cs[1].lean : 0)) * 0.6);
    });
    // ---------- house slides off its foundation ----------
    { const u = tau > 0 ? smooth((TR + F - 31.5) / 5) : 0; HOUSE.position.set(-20 + u * 0.8, 0.9 + u * 0.35, 37.5 + u * 3.4); HOUSE.rotation.set(u * 0.07, u * 0.05, -u * 0.04); }
    // ---------- streetcar tips over ----------
    { const d = Math.hypot(17, 26.4), u = tau > 0 ? smooth((TR + F - d + 1) / 3.5) : 0; CAR.position.set(17 + u * 1.5, u * 0.2, 26.4 + u * 2.6); CAR.rotation.set(u * 1.45, u * 0.12, 0); }
    // ---------- debris ----------
    DEB.forEach((D) => {
      const tr = tau > 0 ? Math.max(0, TR + F - D.d0) * 0.55 * (0.7 + 0.5 * D.sp) : 0;
      const p = D.p0.clone().addScaledVector(D.dir, tr);
      const hh = tau > 0 ? H(p.x, p.z, tau) : 0;
      const fl = hh > 0.2;
      D.m.position.set(p.x, fl ? hh + (D.kind === 1 ? 0.04 : 0.05) : (D.kind === 0 ? 0.5 : D.kind === 1 ? 0.07 : 0.45), p.z);
      D.m.rotation.set(fl ? (D.kind === 0 ? 1.5 : 0.1 * Math.sin(t + D.ry)) : 0, D.ry + tr * 0.15, fl ? 0.1 * Math.cos(t * 0.8 + D.ry) : 0);
      D.m.visible = !(p.x > -6 && p.x < 6 && p.z > 46 && p.z < 60);
    });
    // ---------- 119 lights ----------
    {
      const a0 = A("s7:seratus") - 0.2, a1 = A("s7:warga") + 0.2, d = new THREE.Object3D();
      for (let i = 0; i < 119; i++) {
        const on = t > K.s7 && t > a0 + (i / 119) * (a1 - a0);
        const w = WSEL[i]; d.position.set(w[0], w[1], w[2]); d.rotation.set(0, Math.PI, 0); d.scale.setScalar(on ? 1 : 0.0001); d.updateMatrix(); WL.setMatrixAt(i, d.matrix);
      }
      WL.instanceMatrix.needsUpdate = true;
    }

    // ---------- camera ----------
    let roll = 0;
    if (hook) {
      const u = t / (K.s2 - 0.12);
      setCam([1.4 - u * 0.5, 1.5 + u * 0.5, 61 + u * 4, -0.4, 6.0, 24 + u * 4], 0.015 * Math.sin(t * 0.7));
    } else if (t < K.s3 - 0.12) setCam(S.s2(t));
    else if (t < K.s4 - 0.12) setCam(S.s3(t));
    else if (t < K.s5 - 0.12) {
      setCam(S.s4(t));
      const d = t - burstT; if (d > 0 && d < 1.2) { const s = 0.18 * (1 - d / 1.2); cam.position.x += Math.sin(d * 47) * s; cam.position.y += Math.sin(d * 61) * s; }
    }
    else if (t < K.s6 - 0.12) {
      setCam(S.s5(t));
      const d = t - A("s5:menabrak"); if (d > 0 && d < 1) { const s = 0.12 * (1 - d); cam.position.y += Math.sin(d * 53) * s; }
    }
    else if (t < K.s7 - 0.12) setCam(S.s6(t));
    else if (t < K.s8 - 0.12) setCam(S.s7(t));
    else setCam(S.s8(t));
    if (roll) cam.rotateZ(roll);
    { const fw = look.clone().sub(cam.position); fw.y = 0; fw.normalize(); kick.position.copy(look).addScaledVector(fw, 40).add(new V3(0, 22, 0)); kick.target.position.copy(look); }
    skyRefl.value.copy(skyU.uHor.value);

    // ---------- 3D labels ----------
    if (hook) {
      const zf = TR + F - 1.2, hc = H(0, zf - 1.5, tau);
      showLab(lab8, win(t, A("s1:delapan") - 0.2, K.s2 - 0.3, 0.3, 0.2), new V3(-3.8, hc * 0.45, Math.sqrt(Math.max(1, (TR + F) ** 2 - 14.4)) + 1.0), 0.7);
    }
    showLab(lab15, t >= K.s2 ? win(t, A("s2:setinggi") - 0.1, K.s3 - 0.4, 0.3, 0.3) : 0, new V3(-10.6, TH + 1.6, 12.4), 1.2);
    RUL.visible = t > A("s2:setinggi") - 0.3 && t < K.s3 && !hook;
    if (t > K.s5 - 0.1 && t < A("s5:menabrak")) {
      const ang = 0.25, rr = TR + F; showLab(lab56, win(t, A("s5:lima") - 0.1, A("s5:menabrak") - 0.1, 0.25, 0.25), new V3(Math.sin(ang) * rr + 1, CREST(tau) + 2.2, Math.cos(ang) * rr), 1);
    }
    comp.render();
  };
}
