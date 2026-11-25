// EP42 TAMBORA 1815: WORLDFORGE. Four sets, each its own THREE.Scene, swapped under a short ash dip (HTML #ash):
//  ISLAND  Sanggar peninsula of Sumbawa. Units: 1 u = 200 m across, 100 m up (2x vertical). Tambora at the origin,
//          one analytic height(x, z, u) for terrain, villages and camera (u = collapse 0..1: ±4.300 m -> 2.851 m,
//          caldera ~6,5 km wide, ~650 m deep). Sea y = 0, mainland to +x/+z (camera side), sea west and north.
//          Eruption column + umbrella and pyroclastic flows are camera-facing instanced puffs; ash rain is points.
//          s1 hook (night eruption), s2 calm April morning -> eruption, s3 collapse + ruler + ghost cone + flows over
//          the foot villages, s4 ash on the sawah, s5 rise into the plume, s8 today: green caldera lake, AUDIRA sign,
//          ripple rings spreading over the sea.
//  GLOBE   R = 10. Equirect canvas texture from Natural Earth; s2 boom ring Tambora -> Batavia (1.260 km),
//          s5 sulfur veil (shader) spreads zonally and reflects sun rays, s6 India: monsoon swirl + cholera dots.
//  FIELD   June 1816: snowy field with buried crops, fence, farmhouse, "JUNI 1816" sign (NE America), then the
//          empty grain market with price board (Eropa).
//  VILLA   Swiss lake villa window in the rain, candle, quill, manuscript; "Frankenstein" is written on the page.
// Everything is a pure function of t.

const FONTS = ['400 80px "Anton"', '800 80px "Archivo"', '600 80px "Archivo"', '600 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "Tambora 1815 AUDIRA Frankenstein"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, clamp01, smooth, back, canvasTex, stage } from "./lib3d.js";
import { GEO_W, GEO_I } from "./geo.js";

const AN = '"Anton", Impact, sans-serif', AR = '"Archivo", Arial, sans-serif', MO = '"IBM Plex Mono", Consolas, monospace';
const D2R = Math.PI / 180;
const lerp = (a, b, u) => a + (b - a) * u;
const ramp = (t, a, b) => smooth((t - a) / (b - a));

// Hermite track, harmonic-mean tangents: never overshoots a key.
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

// ---------- noise ----------
const fract = (x) => x - Math.floor(x);
const hash2 = (i, j) => fract(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
function vnoise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uz);
}
function fbm(x, z, o = 4) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < o; k++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s / (1 - Math.pow(0.5, o)); }
function ridged(x, z, o = 3) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < o; k++) { s += a * (1 - Math.abs(vnoise(x * f, z * f) * 2 - 1)); f *= 2.1; a *= 0.5; } return s / (1 - Math.pow(0.5, o)); }

// ---------- island terrain ----------
const R_M = 118, H0 = 43, H1 = 28.51;
function mountain(x, z, u) {
  const r = Math.hypot(x, z); if (r >= R_M) return 0;
  const ang = Math.atan2(z, x);
  const k = 1 - r / R_M;
  let hb = H0 * Math.pow(k, 1.55);
  const gul = ridged(ang * 9.0 + 3, r * 0.045, 3);           // radial gullies
  hb -= (gul - 0.55) * 3.2 * smooth(r / 14) * Math.min(1, k * 2.2);
  hb += (fbm(x * 0.05, z * 0.05, 3) - 0.5) * 2.2 * k;
  if (r < 4.5) hb -= 2.2 * Math.pow(1 - r / 4.5, 2);          // small summit crater
  if (u <= 0) return hb;
  let ha = Math.min(hb, H1 + (fbm(ang * 2 + 7, r * 0.1, 2) - 0.5) * 1.2);
  const rc = 20.5 + 2.2 * (vnoise(ang * 1.7 + 4, 1.3) - 0.5);
  if (r < rc) ha -= 6.5 * smooth((rc - r) / 5.5);               // caldera, floor ~22 (2.200 m)
  return lerp(hb, ha, u);
}
function coastDist(x, z) {
  const r = Math.hypot(x, z);
  const n1 = fbm(z * 0.012 + 11, 3.1, 3) - 0.5, n2 = fbm(x * 0.012 + 5, 8.7, 3) - 0.5, n3 = fbm(Math.atan2(z, x) * 3 + 2, 1.7, 3) - 0.5;
  const dM = r - (126 + n3 * 18);
  const dL = Math.max((-64 + n1 * 34) - x, (-26 + n2 * 30) - z);
  return Math.min(dM, dL);
}
const SAW = { x0: -26, x1: 132, z0: 126, z1: 300 };
function height(x, z, u = 0) {
  const cd = coastDist(x, z);
  let h;
  if (cd < 0) h = 0.7 + smooth(-cd / 26) * (1.6 + fbm(x * 0.011 + 3, z * 0.011, 4) * 8.5) + mountain(x, z, u);
  else h = 0.7 - smooth(cd / 26) * 9;
  // sawah plain: flattened into gentle terraces
  const wx = Math.min(smooth((x - SAW.x0) / 14), smooth((SAW.x1 - x) / 14)), wz = Math.min(smooth((z - SAW.z0) / 12), smooth((SAW.z1 - z) / 12));
  const w = Math.min(wx, wz);
  if (w > 0 && cd < 0) { const flat = 1.3 + (z - SAW.z0) * -0.004 + (x - SAW.x0) * 0.006; h = lerp(h, flat, w); }
  return h;
}

// ---------- canvas helpers ----------
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function fitText(g, txt, x, y, size, font, maxW, align = "center") {
  g.font = font.replace("SZ", size + "px"); const w = g.measureText(txt).width;
  if (w > maxW) { size *= maxW / w; g.font = font.replace("SZ", size.toFixed(1) + "px"); }
  g.textAlign = align; g.textBaseline = "alphabetic"; g.fillText(txt, x, y);
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene: sI, cam, comp, bp } = stage(canvas, { bg: 0x2a1d16, exp: 1.1, bloom: [0.2, 0.4, 0.86], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.1;
  bp.strength = 0.22; bp.radius = 0.4; bp.threshold = 0.86;
  cam.far = 5000; cam.updateProjectionMatrix();
  const RP = comp.passes[0];
  const q = mulberry(42);

  // ---------- anchors ----------
  const tCut1 = A("s2:Dentumannya-0.3"), tCut3 = A("s5:Gas-0.35"), tCutI = A("s6:Di-0.2");
  const tLet = A("s2:Letusannya"), tBat = A("s2:Batavia"), tSer = A("s2:seribu");
  const tSep = A("s3:Sepertiga"), tLen = A("s3:lenyap"), tMenj = A("s3:menjadi"), tM2 = A("s3:meter#2"), tDesa = A("s3:Desa-desa"), tTers = A("s3:tersapu");
  const tAbu = A("s4:Abu"), tSaw = A("s4:sawah"), tKor = A("s4:Korban");
  const tGas = A("s5:Gas"), tNaik = A("s5:naik"), tMeny = A("s5:menyebar"), tMem = A("s5:memantulkan");
  const t1816 = A("s6:1816"), tSalju = A("s6:Salju"), tJuni = A("s6:Juni"), tPanen = A("s6:Panen"), tHarga = A("s6:harga"), tKer = A("s6:kerusuhan");
  const tIndia = A("s6:India"), tKacau = A("s6:kacau"), tKol = A("s6:kolera");
  const tSwiss = A("s7:Swiss"), tBerl = A("s7:berlomba"), tMary = A("s7:Mary"), tFrank = A("s7:Frankenstein");
  const tSatu8 = A("s8:Satu"), tMen8 = A("s8:Menurut");
  const setAt = (t) => (t < tCut1 ? "I" : t < K.s3 ? "G" : t < tCut3 ? "I" : t < K.s6 ? "G" : t < tCutI ? "F" : t < K.s7 ? "G" : t < K.s8 ? "V" : "I");

  // ---------- shared ----------
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  const add = (m, p, cast = true) => { m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...o });
  const phys = (o) => new THREE.MeshPhysicalMaterial({ roughness: 0.5, metalness: 0, ...o });
  const pm = new THREE.PMREMGenerator(r);
  const envFrom = (top, mid, low, bright = 1) => {
    const env = new RoomEnvironment();
    env.traverse((o) => { if (o.isMesh && o.material && o.material.side === THREE.BackSide) o.visible = false; });
    const tx = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.48, mid); gr.addColorStop(0.55, low); gr.addColorStop(1, "#1a1410"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const sk = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide, color: new THREE.Color(bright, bright, bright) }));
    sk.position.y = 3.5; env.add(sk);
    return pm.fromScene(env, 0.03).texture;
  };
  const puffT = canvasTex(256, 256, (g) => {
    const qq = mulberry(7);
    for (let i = 0; i < 26; i++) {
      const a = qq() * 6.283, d = Math.pow(qq(), 0.7) * 62, x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, s = 30 + qq() * 46;
      const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.6, "rgba(255,255,255,.28)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    }
    const id = g.getImageData(0, 0, 256, 256), dd = id.data;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const i = (y * 256 + x) * 4, rad = Math.hypot(x - 128, y - 128) / 128; const n = 0.75 + 0.25 * fbm(x * 0.05, y * 0.05, 3); dd[i] = dd[i + 1] = dd[i + 2] = 255 * (0.82 + 0.18 * n); dd[i + 3] = Math.min(255, dd[i + 3] * 1.35 * n) * smooth((1 - rad) / 0.25); }
    g.putImageData(id, 0, 0);
  });
  const glowT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.6)"); gr.addColorStop(0.6, "rgba(0,0,0,.22)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (p, w, d, x, y, z, o = 0.6) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 2; p.add(m); return m; };
  const mtx = new THREE.Matrix4(), vS = new THREE.Vector3(), vP = new THREE.Vector3(), col = new THREE.Color();
  function puffs(scene, n, o = {}) {
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: puffT, transparent: true, depthWrite: false, fog: o.fog ?? true, opacity: o.opacity ?? 1 }), n);
    m.frustumCulled = false; m.renderOrder = o.order ?? 5;
    for (let i = 0; i < n; i++) { m.setColorAt(i, col.setRGB(1, 1, 1)); mtx.makeScale(0, 0, 0); m.setMatrixAt(i, mtx); }
    scene.add(m);
    return { m, set(i, x, y, z, s, cr, cg, cb) { vP.set(x, y, z); vS.setScalar(Math.max(0, s)); mtx.compose(vP, cam.quaternion, vS); m.setMatrixAt(i, mtx); m.setColorAt(i, col.setRGB(cr, cg, cb)); }, hide(i) { mtx.makeScale(0, 0, 0); m.setMatrixAt(i, mtx); }, commit() { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; } };
  }
  function points(scene, n, o) {
    const pos = new Float32Array(n * 3), g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ size: o.size, map: glowT, color: o.color, transparent: true, opacity: o.opacity ?? 1, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true, fog: o.fog ?? true });
    const P = new THREE.Points(g, m); P.frustumCulled = false; scene.add(P);
    return { P, pos, m, commit() { g.attributes.position.needsUpdate = true; } };
  }
  const sprite = (scene, tex, sx, sy, o = {}) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: o.depthTest ?? true, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false, opacity: o.opacity ?? 1, toneMapped: o.tm ?? true })); s.scale.set(sx, sy, 1); s.renderOrder = o.order ?? 8; scene.add(s); return s; };
  // label plate painter: dark ash card, ember stripe
  const plate = (lines, o = {}) => (g, w, h) => {
    g.clearRect(0, 0, w, h);
    rr(g, 4, 4, w - 8, h - 8, o.rad ?? 18); g.fillStyle = o.bg || "rgba(22,17,14,.86)"; g.fill();
    g.lineWidth = 3; g.strokeStyle = o.stroke || "rgba(255,196,150,.5)"; g.stroke();
    if (o.stripe !== false) { g.fillStyle = o.stripe || "#FF7A2F"; rr(g, 4, 4, 16, h - 8, 8); g.fill(); }
    for (const [txt, y, size, font, colr] of lines) { g.fillStyle = colr || "#FFF3E2"; fitText(g, txt, w / 2 + 8, h * y, size, font, w - 60); }
  };

  // =====================================================================================================
  // ISLAND
  // =====================================================================================================
  sI.background = new THREE.Color(0x2a1d16);
  const skyGrad = (stops) => canvasTex(16, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); for (const [p, c] of stops) gr.addColorStop(p, c); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const skyAshT = skyGrad([[0, "#0E0D14"], [0.3, "#241B1D"], [0.44, "#5A3424"], [0.495, "#B5592A"], [0.51, "#6E3A24"], [1, "#1A120E"]]);
  const skyCalmT = skyGrad([[0, "#2F5F96"], [0.28, "#6E9CC8"], [0.43, "#C7D7DE"], [0.495, "#F4D7A6"], [0.51, "#B8A486"], [1, "#3A3026"]]);
  const domeA = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), new THREE.MeshBasicMaterial({ map: skyCalmT, side: THREE.BackSide, fog: false, depthWrite: false }));
  const domeB = new THREE.Mesh(new THREE.SphereGeometry(2900, 48, 24), new THREE.MeshBasicMaterial({ map: skyAshT, side: THREE.BackSide, fog: false, depthWrite: false, transparent: true }));
  domeA.renderOrder = -10; domeB.renderOrder = -9; sI.add(domeA, domeB);
  const envCalm = envFrom("#6E9CC8", "#F4D7A6", "#7A6A50"), envAsh = envFrom("#2a2226", "#C0602C", "#3a2418", 0.8);
  sI.environment = envCalm; sI.environmentIntensity = 0.45;
  sI.fog = new THREE.FogExp2(0x6b4a38, 0.0016);
  const hemiI = new THREE.HemisphereLight(0xcfe0f0, 0x5a4232, 0.55); sI.add(hemiI);
  const sunI = new THREE.DirectionalLight(0xffe2b8, 2.4); sunI.castShadow = true; sunI.shadow.mapSize.set(2048, 2048);
  Object.assign(sunI.shadow.camera, { left: -170, right: 170, top: 170, bottom: -170, near: 1, far: 900 });
  sunI.shadow.bias = -0.0006; sunI.shadow.normalBias = 0.4; sI.add(sunI, sunI.target);
  const lava = new THREE.PointLight(0xff6a22, 0, 0, 1.4); sI.add(lava);

  // terrain grid: dense near the volcano and the sawah, coarse far out
  const axis = (lo, hi, fine0, fine1) => { const a = []; let v = lo; while (v < hi) { a.push(v); const d = v < fine0 ? fine0 - v : v > fine1 ? v - fine1 : 0; v += 1.6 + Math.min(10, d * 0.035); } a.push(hi); return a; };
  const XS = axis(-900, 1100, -150, 160), ZS = axis(-900, 1100, -150, 250);
  const NX = XS.length, NZ = ZS.length, NV = NX * NZ;
  const tPos = new Float32Array(NV * 3), tCol = new Float32Array(NV * 3), colClean = new Float32Array(NV * 3), colAsh = new Float32Array(NV * 3);
  const tGeo = new THREE.BufferGeometry();
  { const idx = []; for (let j = 0; j < NZ - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; idx.push(a, c, b, b, c, d); } tGeo.setIndex(idx); }
  const uvA = new Float32Array(NV * 2);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const k = j * NX + i; tPos[k * 3] = XS[i]; tPos[k * 3 + 2] = ZS[j]; uvA[k * 2] = XS[i] / 14; uvA[k * 2 + 1] = ZS[j] / 14; }
  tGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3)); tGeo.setAttribute("color", new THREE.BufferAttribute(tCol, 3)); tGeo.setAttribute("uv", new THREE.BufferAttribute(uvA, 2));
  const heightsAt = (u) => { for (let k = 0; k < NV; k++) tPos[k * 3 + 1] = height(tPos[k * 3], tPos[k * 3 + 2], u); tGeo.attributes.position.needsUpdate = true; tGeo.computeVertexNormals(); };
  heightsAt(0);
  { // colours from height, slope, cavity
    const nrm = tGeo.attributes.normal.array, C = (h) => new THREE.Color(h);
    const sand = C("#C9B48A"), shallow = C("#3FA7A0"), deep = C("#0C3B52"), green = C("#4E7A34"), forest = C("#2F5A28"), olive = C("#6E7440"), brown = C("#6B5640"), rock = C("#4A4038"), ash = C("#8A8178"), ashD = C("#5E5650"), cc = new THREE.Color(), ca = new THREE.Color();
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const k = j * NX + i, x = tPos[k * 3], z = tPos[k * 3 + 2], h = tPos[k * 3 + 1], ny = nrm[k * 3 + 1];
      const n = fbm(x * 0.04, z * 0.04, 3);
      if (h < -0.3) cc.copy(shallow).lerp(deep, smooth(-h / 7));
      else if (h < 1.1) cc.copy(sand).lerp(green, smooth((h - 0.6) / 0.5));
      else if (h < 14) cc.copy(forest).lerp(green, n * 0.8).lerp(olive, smooth((h - 6) / 8) * 0.6);
      else if (h < 30) cc.copy(olive).lerp(brown, smooth((h - 14) / 16));
      else cc.copy(brown).lerp(rock, smooth((h - 30) / 8));
      if (ny < 0.8 && h > 2) cc.lerp(rock, smooth((0.8 - ny) / 0.3) * 0.6);
      const r0 = Math.hypot(x, z);
      if (r0 < R_M) { const g = ridged(Math.atan2(z, x) * 9.0 + 3, r0 * 0.045, 3); cc.multiplyScalar(0.82 + 0.3 * (1 - g)); }
      cc.multiplyScalar(0.9 + 0.2 * n);
      ca.copy(h < 0.6 ? cc : ash).lerp(ashD, (1 - n) * 0.6);
      if (h > 0.6) ca.lerp(cc, 0.12);
      colClean.set([cc.r, cc.g, cc.b], k * 3); colAsh.set([ca.r, ca.g, ca.b], k * 3);
    }
  }
  const detailT = canvasTex(512, 512, (g, w, h) => {
    const id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 0.78 + 0.22 * fbm(x * 0.06, y * 0.06, 4) + (hash2(x, y) - 0.5) * 0.08; const i = (y * w + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = Math.min(255, v * 255); id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);
  }, [1, 1]);
  const terrain = new THREE.Mesh(tGeo, std({ vertexColors: true, map: detailT, roughness: 0.94 }));
  terrain.receiveShadow = true; terrain.castShadow = true; sI.add(terrain);
  let lastU = -1, lastAsh = -1;

  // sea
  const waterN = (() => {
    const N = 512, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d");
    const hg = new Float32Array(N * N), qq = mulberry(11);
    for (let k = 0; k < 240; k++) { const cx = qq() * N, cy = qq() * N, s = 5 + qq() * 22, a = (qq() - 0.5) * 2; for (let y = Math.floor(cy - 3 * s); y < cy + 3 * s; y++) for (let x = Math.floor(cx - 3 * s); x < cx + 3 * s; x++) { const dx = x - cx, dy = y - cy; hg[((y + N) % N) * N + ((x + N) % N)] += a * Math.exp(-(dx * dx * 2.5 + dy * dy) / (2 * s * s)); } }
    const im = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const hx = hg[y * N + (x + 1) % N] - hg[y * N + (x + N - 1) % N], hy = hg[((y + 1) % N) * N + x] - hg[((y + N - 1) % N) * N + x]; const nx = -hx * 2, ny = -hy * 2, l = Math.hypot(nx, ny, 1), i = (y * N + x) * 4; im.data[i] = (nx / l * 0.5 + 0.5) * 255; im.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; im.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  })();
  waterN.repeat.set(160, 160);
  const seaM = phys({ color: 0x0e4a5c, roughness: 0.1, normalMap: waterN, normalScale: new THREE.Vector2(0.35, 0.35), transparent: true, opacity: 0.84, clearcoat: 0.4 });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), seaM); sea.rotation.x = -Math.PI / 2; sea.receiveShadow = true; sI.add(sea);

  // sawah overlay: paddies (green rice / flooded plots / bunds), plus an ash layer that fades in
  const sawW = SAW.x1 - SAW.x0 - 18, sawD = SAW.z1 - SAW.z0 - 16, sawX = (SAW.x0 + SAW.x1) / 2, sawZ = (SAW.z0 + SAW.z1) / 2;
  const sawGeo = new THREE.PlaneGeometry(sawW, sawD, 100, 110); sawGeo.rotateX(-Math.PI / 2);
  { const p = sawGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + sawX, z = p.getZ(i) + sawZ; p.setY(i, height(x, z) + 0.08); } sawGeo.translate(sawX, 0, sawZ); sawGeo.computeVertexNormals(); }
  const paddyT = canvasTex(1024, 1024, (g, w, h) => {
    const qq = mulberry(3); g.fillStyle = "#6B5236"; g.fillRect(0, 0, w, h);
    let y = 0; while (y < h) { const rh = 40 + qq() * 50; let x = 0; while (x < w) { const rw = 50 + qq() * 90, k = qq(); const c = k < 0.5 ? `hsl(${88 + qq() * 16},${34 + qq() * 12}%,${30 + qq() * 8}%)` : k < 0.78 ? `hsl(${66 + qq() * 14},${32 + qq() * 10}%,${36 + qq() * 7}%)` : `hsl(${200 + qq() * 10},${14 + qq() * 8}%,${48 + qq() * 8}%)`; g.fillStyle = c; g.fillRect(x + 3, y + 3, rw - 6, rh - 6); if (k < 0.78) { g.strokeStyle = "rgba(20,40,10,.25)"; g.lineWidth = 1; for (let s = x + 6; s < x + rw - 6; s += 5) { g.beginPath(); g.moveTo(s, y + 4); g.lineTo(s, y + rh - 4); g.stroke(); } } else { g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x + 6, y + 6, rw * 0.5, 4); } x += rw; } y += rh; }
  }, [3, 4]);
  const sawM = std({ map: paddyT, roughness: 0.62, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  const sawah = add(new THREE.Mesh(sawGeo, sawM), sI, false);
  const ashLayerT = canvasTex(512, 512, (g, w, h) => { const id = g.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 0.62 + 0.22 * fbm(x * 0.05, y * 0.05, 4) + (hash2(x, y) - 0.5) * 0.12; const i = (y * w + x) * 4; id.data[i] = v * 165; id.data[i + 1] = v * 156; id.data[i + 2] = v * 148; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }, [6, 4]);
  const ashM = std({ map: ashLayerT, roughness: 1, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
  const ashLay = new THREE.Mesh(sawGeo, ashM); ashLay.position.y = 0.05; ashLay.renderOrder = 1; sI.add(ashLay);

  // forest: instanced cones; palms near the coast and villages
  const treeM = std({ color: 0x2f5a28, roughness: 0.9 }), trunkM = std({ color: 0x5a4430, roughness: 0.9 }), palmM = std({ color: 0x4a7a2c, roughness: 0.8, side: THREE.DoubleSide });
  const treeBase = treeM.color.clone(), palmBase = palmM.color.clone(), ashCol = new THREE.Color(0x8a8178);
  const NT = 2600, trees = new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 2.6, 7), treeM, NT); trees.castShadow = true; trees.receiveShadow = true; sI.add(trees);
  { const qq = mulberry(21); let n = 0, tries = 0; while (n < NT && tries < 60000) { tries++; const x = -150 + qq() * 360, z = -60 + qq() * 320; const h = height(x, z); const rr0 = Math.hypot(x, z); if (h < 1.3 || h > 15 || (x > SAW.x0 - 4 && x < SAW.x1 + 4 && z > SAW.z0 - 4 && z < SAW.z1 + 4)) continue; if (rr0 < 40 || z > 196) continue; const s = 0.7 + qq() * 0.8; mtx.compose(vP.set(x, h + 1.1 * s, z), new THREE.Quaternion(), vS.set(s, s * (0.9 + qq() * 0.5), s)); trees.setMatrixAt(n++, mtx); } trees.count = n; }
  // villages at the foot (kaki gunung) on the camera side: stilt houses + palms
  const houseM = std({ color: 0xb08a5c, roughness: 0.85 }), roofM = std({ color: 0x4a3226, roughness: 0.9 }), stiltM = std({ color: 0x5a4430 });
  const houses = [];
  const VIL = [[96, 1.48], [104, 1.12], [100, 1.85], [110, 0.82]]; // [radius, angle] angle measured from +x toward +z
  const palms = [];
  { const qq = mulberry(5);
    for (const [vr, va] of VIL) for (let k = 0; k < 13; k++) {
      const rr0 = vr + (qq() - 0.5) * 12, aa = va + (qq() - 0.5) * 0.16, x = Math.cos(aa) * rr0, z = Math.sin(aa) * rr0, h = height(x, z);
      const G = new THREE.Group(); G.position.set(x, h, z); G.rotation.y = qq() * 3; sI.add(G);
      for (const [sx, sz] of [[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 5), stiltM), G).position.set(sx, 0.25, sz);
      add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.95), houseM), G).position.y = 0.8;
      const rf = add(new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.75, 4), roofM), G); rf.position.y = 1.47; rf.rotation.y = Math.PI / 4; rf.scale.set(1.15, 1, 0.92);
      houses.push({ G, r: Math.hypot(x, z), a: Math.atan2(z, x) });
      if (k % 2 === 0) palms.push([x + (qq() - 0.5) * 3, z + (qq() - 0.5) * 3, 0.8 + qq() * 0.5]);
    }
    for (let k = 0; k < 90; k++) { const x = -70 + qq() * 40, z = 40 + qq() * 200; const h = height(x, z); if (h > 0.9 && h < 3) palms.push([x, z, 0.8 + qq() * 0.5]); }
  }
  const palmGroup = new THREE.Group(); sI.add(palmGroup);
  for (const [x, z, s] of palms) { const h = height(x, z); const tr = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.1 * s, 2.6 * s, 5), trunkM), palmGroup); tr.position.set(x, h + 1.3 * s, z); tr.rotation.z = 0.12; const cr = add(new THREE.Mesh(new THREE.ConeGeometry(1.0 * s, 0.6 * s, 7, 1, true), palmM), palmGroup); cr.position.set(x + 0.15 * s, h + 2.65 * s, z); cr.rotation.x = Math.PI; }

  // eruption: vent glow, column + umbrella puffs, flows, bolts, ash rain
  const vent = sprite(sI, glowT, 26, 26, { add: true, order: 7, tm: false }); vent.material.color.setRGB(1, 0.45, 0.15);
  const NC = 1000, COL = puffs(sI, NC, { order: 6 });
  const cSeed = []; { const qq = mulberry(77); for (let i = 0; i < NC; i++) cSeed.push([qq(), qq(), qq(), qq(), qq()]); }
  const NF = 520, FLW = puffs(sI, NF, { order: 5 });
  const fSeed = []; { const qq = mulberry(78); for (let i = 0; i < NF; i++) fSeed.push([qq(), qq(), qq(), qq()]); }
  const FLOBE = []; for (let k = 0; k < 14; k++) FLOBE.push(k * Math.PI * 2 / 14 + 0.1); for (const [, va] of VIL) FLOBE.push(va);
  const boltM = new THREE.MeshBasicMaterial({ color: 0xe8e0ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  const bolts = [0, 1, 2].map((b) => { const qq = mulberry(90 + b); const pts = []; let x = (qq() - 0.5) * 16, y = 95 + qq() * 20, z = (qq() - 0.5) * 10; for (let k = 0; k < 14; k++) { pts.push(new THREE.Vector3(x, y, z)); x += (qq() - 0.5) * 7; y -= 3 + qq() * 3.5; z += (qq() - 0.5) * 5; } const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.28, 5), boltM); sI.add(m); return m; });
  const BOLT_T = [0.75, 2.2, 3.9, 5.1, 12.4, 13.6, 15.0, 22.2, 24.4, 27.0, 34.0, 38.6, 41.5];
  const NA = 2600, ASHP = points(sI, NA, { size: 0.55, color: 0x9a8f86, opacity: 0.85 });
  const aSeed = []; { const qq = mulberry(31); for (let i = 0; i < NA; i++) aSeed.push([qq(), qq(), qq(), qq()]); }

  // label: Sumbawa, NTB, Indonesia (s2) ; ruler + ghost cone + cut line (s3)
  const locT = label(900, 210, plate([["SUMBAWA · NTB · INDONESIA", 0.42, 64, `800 SZ ${AR}`], ["GUNUNG TAMBORA · SEMENANJUNG SANGGAR", 0.78, 40, `600 SZ ${MO}`, "#FFC9A0"]]));
  const loc = sprite(sI, locT, 30, 7, { order: 9 });
  const RUL = new THREE.Group(); RUL.position.set(18, 0, 12); sI.add(RUL);
  const brass = phys({ color: 0xd8b26a, metalness: 1, roughness: 0.28 });
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 27, 12), phys({ color: 0x1d1714, roughness: 0.4, clearcoat: 0.6 })), RUL).position.y = 33;
  for (let m = 2000; m <= 4500; m += 250) { const big = m % 500 === 0; const tk = add(new THREE.Mesh(new THREE.BoxGeometry(big ? 2.2 : 1.2, 0.16, 0.16), brass), RUL); tk.position.set(big ? -0.9 : -0.5, m / 100, 0); }
  const tickLab = []; for (let m = 2000; m <= 4500; m += 500) { const s = sprite(sI, label(220, 80, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#FFF3E2"; g.shadowColor = "rgba(0,0,0,.9)"; g.shadowBlur = 8; fitText(g, m.toLocaleString("de-DE") + " m", 8, 56, 50, `600 SZ ${MO}`, 210, "left"); }), 4.4, 1.6, { order: 9 }); s.userData.m = m; tickLab.push(s); }
  const capT = label(420, 90, plate([["AUDIRA · SURVEI", 0.66, 46, `600 SZ ${MO}`]], { stripe: "#A9DBFF" }));
  const rulCap = sprite(sI, capT, 7.6, 1.65, { order: 9 });
  const p43 = sprite(sI, label(520, 130, plate([["±4.300 m", 0.68, 76, `400 SZ ${AN}`, "#FFC9A0"]], { stripe: "#8A7A6E" })), 8.6, 2.15, { order: 9 });
  const p28 = sprite(sI, label(520, 130, plate([["2.851 m", 0.68, 76, `400 SZ ${AN}`]])), 8.6, 2.15, { order: 9 });
  const laser = new THREE.Mesh(new THREE.BoxGeometry(1, 0.16, 0.16), new THREE.MeshBasicMaterial({ color: 0xff8a40, toneMapped: false, fog: false })); sI.add(laser);
  const ghostGeo = (() => { const pts = [new THREE.Vector2(0, H1), new THREE.Vector2(26.4, H1)]; for (let r0 = 26; r0 >= 0; r0 -= 1) pts.push(new THREE.Vector2(r0, Math.max(H1, H0 * Math.pow(1 - r0 / R_M, 1.55)))); return new THREE.LatheGeometry(pts, 40); })();
  const ghost = new THREE.Group(); sI.add(ghost);
  const ghostFill = new THREE.Mesh(ghostGeo, new THREE.MeshBasicMaterial({ color: 0xff8a40, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  const ghostWire = new THREE.LineSegments(new THREE.WireframeGeometry(ghostGeo), new THREE.LineBasicMaterial({ color: 0xffb27a, transparent: true, opacity: 0.55, fog: false }));
  ghost.add(ghostFill, ghostWire);
  const cutRing = new THREE.Mesh(new THREE.TorusGeometry(26.4, 0.32, 8, 96), new THREE.MeshBasicMaterial({ color: 0xff8a40, toneMapped: false, transparent: true, fog: false })); cutRing.rotation.x = Math.PI / 2; cutRing.position.y = H1; sI.add(cutRing);
  const thirdT = label(560, 130, plate([["1/3 LENYAP", 0.7, 82, `400 SZ ${AN}`, "#FFC9A0"]]));
  const third = sprite(sI, thirdT, 10, 2.3, { order: 9 });
  // today (s8): caldera lake, trail sign with AUDIRA, ripple rings over the sea
  const lake = new THREE.Mesh(new THREE.CircleGeometry(9.5, 48), phys({ color: 0x2f6f6a, roughness: 0.08, normalMap: waterN, normalScale: new THREE.Vector2(0.2, 0.2) })); lake.rotation.x = -Math.PI / 2; lake.position.set(0, 22.6, 0); sI.add(lake);
  const SIGN = new THREE.Group(); { const sx = 3, sz = 21.8; SIGN.position.set(sx, height(sx, sz, 1), sz); SIGN.scale.setScalar(2.2); sI.add(SIGN); }
  const woodM = std({ color: 0x6b4a30, roughness: 0.85 });
  add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.2, 0.35), woodM), SIGN).position.set(-2.2, 2.1, 0); add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.2, 0.35), woodM), SIGN).position.set(2.2, 2.1, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.6, 0.25), woodM), SIGN).position.set(0, 3.4, 0);
  const signT = label(1024, 480, (g, w, h) => { g.fillStyle = "#3E2A1C"; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(0,0,0,${0.08 + 0.1 * hash2(i, 3)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * 12 + 4); g.bezierCurveTo(w * 0.3, i * 12 + 8, w * 0.6, i * 12, w, i * 12 + 6); g.stroke(); } g.fillStyle = "#F4E2C2"; fitText(g, "KALDERA TAMBORA", w / 2, 150, 110, `400 SZ ${AN}`, w - 80); g.fillStyle = "#FFB27A"; fitText(g, "PUNCAK 2.851 m", w / 2, 270, 86, `600 SZ ${MO}`, w - 80); g.fillStyle = "#A9DBFF"; fitText(g, "AUDIRA · FAKTA SEJARAH NEGARA", w / 2, 400, 56, `600 SZ ${MO}`, w - 80); });
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 2.4), std({ map: signT, roughness: 0.7 })); signFace.position.set(0, 3.4, 0.14); SIGN.add(signFace);
  const ringsW = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 128), new THREE.MeshBasicMaterial({ color: 0xffa060, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.4; sI.add(m); return m; });

  // =====================================================================================================
  // GLOBE
  // =====================================================================================================
  const sG = new THREE.Scene();
  const RG = 10;
  sG.background = canvasTex(16, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#04050B"); gr.addColorStop(0.6, "#0A0C18"); gr.addColorStop(1, "#140F12"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  sG.environment = envFrom("#202638", "#5A5048", "#151214", 0.6); sG.environmentIntensity = 0.45;
  const ll = (lat, lon, rad = RG) => { const ph = (lon + 180) * D2R, th = (90 - lat) * D2R; return new THREE.Vector3(-Math.cos(ph) * Math.sin(th) * rad, Math.cos(th) * rad, Math.sin(ph) * Math.sin(th) * rad); };
  const GW = 8192, GH = 4096;
  const earthT = canvasTex(GW, GH, (g, w, h) => {
    const X = (lon) => (lon + 180) / 360 * w, Y = (lat) => (90 - lat) / 180 * h;
    const oc = g.createLinearGradient(0, 0, 0, h); oc.addColorStop(0, "#1C3550"); oc.addColorStop(0.5, "#0F3150"); oc.addColorStop(1, "#1C3550"); g.fillStyle = oc; g.fillRect(0, 0, w, h);
    const land = document.createElement("canvas"); land.width = w; land.height = h; const L = land.getContext("2d");
    const ringPath = (ctx, ring) => { let prev = null, off = 0; ctx.beginPath(); ring.forEach(([lon, lat], i) => { if (prev !== null) { if (lon - prev > 180) off -= 360; else if (prev - lon > 180) off += 360; } prev = lon; const x = X(lon + off), y = Y(lat); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.closePath(); };
    const drawSet = (set, fill, stroke) => { for (const c of set) { if (c.name === "Antarctica") continue; for (const ring of c.rings) for (const dx of [-w, 0, w]) { L.save(); L.translate(dx, 0); ringPath(L, ring); if (fill) { L.fillStyle = fill; L.fill(); } if (stroke) { L.strokeStyle = stroke; L.lineWidth = 2; L.stroke(); } L.restore(); } } };
    drawSet(GEO_W, "#fff"); drawSet(GEO_I, "#fff");
    L.fillStyle = "#fff"; L.fillRect(0, Y(-70), w, h - Y(-70));
    L.globalCompositeOperation = "source-in";
    const lg = L.createLinearGradient(0, 0, 0, h);
    [[90, "#C9CCC6"], [66, "#9A9A84"], [55, "#6F7F4C"], [40, "#7E8550"], [30, "#B59A68"], [18, "#A88A5C"], [8, "#4F7436"], [0, "#46702F"], [-10, "#55783A"], [-22, "#B08C5E"], [-35, "#7C8452"], [-60, "#8A8A78"], [-90, "#DDE2E6"]].forEach(([lat, c]) => lg.addColorStop((90 - lat) / 180, c));
    L.fillStyle = lg; L.fillRect(0, 0, w, h);
    L.globalCompositeOperation = "source-over";
    g.drawImage(land, 0, 0);
    // relief speckle and coast lines
    const qq = mulberry(9); g.globalAlpha = 0.18; for (let i = 0; i < 60000; i++) { const x = qq() * w, y = qq() * h, s = 2 + qq() * 6; g.fillStyle = qq() < 0.5 ? "#000" : "#fff"; g.fillRect(x, y, s, s); } g.globalAlpha = 1;
    g.save(); g.globalCompositeOperation = "destination-over"; g.restore();
    g.lineJoin = "round";
    for (const c of GEO_W) { if (c.name === "Antarctica") continue; for (const ring of c.rings) for (const dx of [-w, 0, w]) { g.save(); g.translate(dx, 0); ringPath(g, ring); g.strokeStyle = "rgba(255,240,215,.35)"; g.lineWidth = 2.2; g.stroke(); g.restore(); } }
    for (const c of GEO_I) for (const ring of c.rings) { ringPath(g, ring); g.strokeStyle = c.name === "Indonesia" ? "rgba(255,226,180,.85)" : "rgba(255,240,215,.4)"; g.lineWidth = c.name === "Indonesia" ? 3 : 2; g.stroke(); }
    // speckle only over ocean is fine; clouds: none (keeps the veil readable)
  });
  earthT.anisotropy = 16;
  const globeM = phys({ map: earthT, roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.5 });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(RG, 160, 120), globeM); sG.add(globe);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(RG * 1.025, 96, 64), new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uC: { value: new THREE.Color(0x5aa8ff) }, uK: { value: 1 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
    fragmentShader: "uniform vec3 uC; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(1.0 + dot(vN, vV)*1.0, 0., 1.), 3.0); gl_FragColor = vec4(uC*f*1.4*uK, f*uK); }" }));
  sG.add(atmo);
  const SRC = { lat: -8.25, lon: 118.0 }, BAT = { lat: -6.2, lon: 106.8 }, BEN = { lat: 23.5, lon: 89.0 };
  const srcV = ll(SRC.lat, SRC.lon, 1);
  const veilM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uS: { value: 0 }, uA: { value: 0 }, uT: { value: 0 }, uSun: { value: new THREE.Vector3(-0.7, 0.25, 0.65).normalize() }, uSrc: { value: srcV } },
    vertexShader: "varying vec3 vP; varying vec3 vW; void main(){ vP = normalize(position); vW = normalize((modelMatrix*vec4(position,0.)).xyz); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: `uniform float uS; uniform float uA; uniform float uT; uniform vec3 uSun; uniform vec3 uSrc; varying vec3 vP; varying vec3 vW;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
      float n3(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
      void main(){
        float lat = asin(clamp(vP.y,-1.,1.)), lon = atan(vP.z, -vP.x);
        float latS = asin(uSrc.y), lonS = atan(uSrc.z, -uSrc.x);
        float dl = mod(lon - lonS + 3.14159, 6.28318) - 3.14159;
        float d = sqrt(pow(dl*cos(lat)*0.3, 2.) + pow(lat-latS, 2.));
        float m = smoothstep(uS, uS-0.35, d) * smoothstep(1.45, 1.05, abs(lat));
        float nn = n3(vP*7. + vec3(uT*0.05,0.,0.))*0.6 + n3(vP*19. - vec3(0.,uT*0.04,0.))*0.4;
        float band = 0.85 + 0.15*sin(lat*22. + nn*4.);
        float lit = 0.55 + 0.45*clamp(dot(vW, uSun)*1.2+0.2, 0., 1.);
        vec3 c = mix(vec3(0.98,0.88,0.55), vec3(1.0,0.97,0.82), nn) * lit;
        float a = uA * m * (0.45 + 0.55*nn) * band;
        gl_FragColor = vec4(c, a*0.6);
      }` });
  const veil = new THREE.Mesh(new THREE.SphereGeometry(RG * 1.022, 128, 96), veilM); veil.renderOrder = 4; sG.add(veil);
  const strat = new THREE.Mesh(new THREE.SphereGeometry(RG * 1.03, 96, 64), new THREE.MeshBasicMaterial({ color: 0xe9d27a, wireframe: true, transparent: true, opacity: 0, depthWrite: false })); sG.add(strat);
  const sunDirG = new THREE.Vector3(-0.7, 0.25, 0.65).normalize();
  const sunG = new THREE.DirectionalLight(0xfff1dc, 2.8); sunG.position.copy(sunDirG).multiplyScalar(60); sG.add(sunG);
  sG.add(new THREE.AmbientLight(0x6a7a9a, 0.7));
  const sunSpr = sprite(sG, glowT, 34, 34, { add: true, order: 1, tm: false }); sunSpr.material.color.setRGB(1, 0.92, 0.75); sunSpr.position.copy(sunDirG).multiplyScalar(70);
  { const st = points(sG, 2200, { size: 0.5, color: 0xffffff, add: true, fog: false }); const qq = mulberry(55); for (let i = 0; i < 2200; i++) { const v = new THREE.Vector3(qq() - 0.5, qq() - 0.5, qq() - 0.5).normalize().multiplyScalar(300 + qq() * 200); st.pos.set([v.x, v.y, v.z], i * 3); } st.commit(); st.m.sizeAttenuation = false; st.m.size = 2.2; st.m.opacity = 0.75; }
  // pins + labels
  const pinM = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const pin = (lat, lon, c, s = 0.12) => { const g = new THREE.Group(); const p = ll(lat, lon, RG); g.position.copy(p); g.lookAt(p.clone().multiplyScalar(2)); const m = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 12), pinM(c)); g.add(m); const halo = new THREE.Mesh(new THREE.RingGeometry(s * 1.6, s * 2.2, 32), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.6, side: THREE.DoubleSide, toneMapped: false })); g.add(halo); sG.add(g); g.userData.halo = halo; return g; };
  const pTam = pin(SRC.lat, SRC.lon, 0xff7a2f, 0.09), pBat = pin(BAT.lat, BAT.lon, 0xfff3e2, 0.08), pBen = pin(BEN.lat, BEN.lon, 0x7fe0c8, 0.12);
  const gLab = (txt, sub, c = "#FF7A2F") => label(640, 170, plate([[txt, 0.47, 70, `800 SZ ${AR}`], [sub, 0.82, 40, `600 SZ ${MO}`, "#FFC9A0"]], { stripe: c }));
  const lTam = sprite(sG, gLab("TAMBORA", "SUMBAWA, NTB"), 2.2, 0.58, { order: 9, depthTest: false });
  const lBat = sprite(sG, gLab("BATAVIA", "kini Jakarta", "#FFF3E2"), 2.0, 0.53, { order: 9, depthTest: false });
  const lKm = sprite(sG, label(560, 150, plate([[">1.200 km", 0.66, 92, `400 SZ ${AN}`]], { stripe: "#FFF3E2" })), 1.7, 0.46, { order: 9, depthTest: false });
  const lBen = sprite(sG, gLab("BENGGALA", "kolera menyebar", "#7FE0C8"), 3.2, 0.85, { order: 9, depthTest: false });
  const lInd = sprite(sG, gLab("INDIA", "monsun kacau", "#A9DBFF"), 3.0, 0.8, { order: 9, depthTest: false });
  // boom ring on the surface (great circle at angular radius th around Tambora)
  const NRG = 160, ringPos = new Float32Array((NRG + 1) * 2 * 3), ringGeo = new THREE.BufferGeometry();
  { const idx = []; for (let i = 0; i < NRG; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); } ringGeo.setIndex(idx); ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3)); }
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const boom = new THREE.Mesh(ringGeo, ringM); boom.renderOrder = 6; sG.add(boom);
  const bAx = srcV.clone(), bU = new THREE.Vector3(0, 1, 0).cross(bAx).normalize(), bW = bAx.clone().cross(bU).normalize();
  const setRing = (th, wdt) => { for (let i = 0; i <= NRG; i++) { const ph = i / NRG * Math.PI * 2; for (let s = 0; s < 2; s++) { const a = th + (s ? wdt : 0); const v = bAx.clone().multiplyScalar(Math.cos(a)).add(bU.clone().multiplyScalar(Math.sin(a) * Math.cos(ph))).add(bW.clone().multiplyScalar(Math.sin(a) * Math.sin(ph))).multiplyScalar(RG * 1.004); ringPos.set([v.x, v.y, v.z], (i * 2 + s) * 3); } } ringGeo.attributes.position.needsUpdate = true; };
  const thBat = ll(BAT.lat, BAT.lon, 1).angleTo(srcV);
  // dashed arc Tambora -> Batavia
  const arcPts = []; for (let i = 0; i <= 60; i++) { const v = new THREE.Vector3().copy(srcV).lerp(ll(BAT.lat, BAT.lon, 1), i / 60).normalize().multiplyScalar(RG * (1.01 + 0.06 * Math.sin(Math.PI * i / 60))); arcPts.push(v); }
  const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts), 80, 0.018, 6), new THREE.MeshBasicMaterial({ color: 0xfff3e2, toneMapped: false, transparent: true })); sG.add(arc);
  // plume from Tambora to the stratosphere (s5), sun rays bouncing off the veil
  const NGP = 140, GPL = puffs(sG, NGP, { order: 5, fog: false });
  const raysM = new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const rays = [];
  for (let i = 0; i < 7; i++) {
    const lat = -40 + i * 14, lon = 118 - 55 + (i % 3) * 18; const p = ll(lat, lon, RG * 1.025), n = p.clone().normalize();
    const inc = sunDirG.clone().negate(), ref = inc.clone().reflect(n);
    const mk = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 6), raysM); m.geometry.translate(0, 0.5, 0); sG.add(m); return m; };
    rays.push({ p, inc, ref, a: mk(), b: mk() });
  }
  // India: monsoon swirl + cholera dots
  const swirlT = canvasTex(512, 512, (g, w) => { g.translate(w / 2, w / 2); for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); for (let i = 0; i < 90; i++) { const a = i * 0.07, rad = 8 + i * 2.6; g.fillStyle = `rgba(235,240,250,${0.5 * (1 - i / 90)})`; g.beginPath(); g.arc(Math.cos(a) * rad, Math.sin(a) * rad, 10 + i * 0.35, 0, 6.283); g.fill(); } } });
  const swirls = [[18, 80], [14, 88], [22, 76]].map(([la, lo], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: swirlT, transparent: true, depthWrite: false, opacity: 0 })); const p = ll(la, lo, RG * 1.03); m.position.copy(p); m.lookAt(p.clone().multiplyScalar(2)); m.userData.ph = i; sG.add(m); return m; });
  const NCH = 260, CHO = points(sG, NCH, { size: 0.11, color: 0x7fe0c8, add: true, fog: false });
  const chSeed = []; { const qq = mulberry(66); for (let i = 0; i < NCH; i++) chSeed.push([qq(), qq(), qq()]); }

  // =====================================================================================================
  // FIELD (June 1816)
  // =====================================================================================================
  const sF = new THREE.Scene();
  sF.background = canvasTex(16, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5E6670"); gr.addColorStop(0.45, "#9AA2AA"); gr.addColorStop(0.55, "#C2C6C8"); gr.addColorStop(1, "#8E949A"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  sF.fog = new THREE.FogExp2(0xb4bac0, 0.012);
  sF.environment = envFrom("#8A939C", "#D6DADC", "#9AA0A6", 0.9); sF.environmentIntensity = 0.45;
  sF.add(new THREE.HemisphereLight(0xdfe7f0, 0x6a6460, 0.9));
  const sunF = new THREE.DirectionalLight(0xe8eef8, 1.5); sunF.position.set(-30, 40, 25); sunF.castShadow = true; sunF.shadow.mapSize.set(2048, 2048); Object.assign(sunF.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 160 }); sunF.shadow.normalBias = 0.05; sF.add(sunF);
  const fH = (x, z) => 0.6 * Math.sin(x * 0.06) * Math.cos(z * 0.05) + (fbm(x * 0.05 + 40, z * 0.05, 3) - 0.5) * 1.6;
  const snowT = canvasTex(512, 512, (g, w, h) => { const id = g.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 0.9 + 0.1 * fbm(x * 0.04, y * 0.04, 4) + (hash2(x, y) - 0.5) * 0.05; const i = (y * w + x) * 4; id.data[i] = v * 236; id.data[i + 1] = v * 242; id.data[i + 2] = v * 250; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }, [10, 10]);
  { const g = new THREE.PlaneGeometry(260, 260, 200, 200); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, fH(p.getX(i), p.getZ(i))); g.computeVertexNormals(); add(new THREE.Mesh(g, std({ map: snowT, roughness: 0.75, color: 0xf2f6fb })), sF, false); }
  // stunted crop rows poking through snow
  { const NCR = 2400, cr = new THREE.InstancedMesh(new THREE.ConeGeometry(0.09, 0.7, 5), std({ color: 0x8f9a4a, roughness: 0.9 }), NCR); cr.castShadow = true; const qq = mulberry(12); let n = 0;
    for (let row = 0; row < 30 && n < NCR; row++) for (let k = 0; k < 80 && n < NCR; k++) { const x = -26 + k * 0.62 + (qq() - 0.5) * 0.2, z = -4 - row * 1.1; const s = 0.5 + qq() * 0.9; mtx.compose(vP.set(x, fH(x, z) + 0.12 * s, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((qq() - 0.5) * 0.5, 0, (qq() - 0.5) * 0.6)), vS.set(s, s * (0.6 + qq() * 0.5), s)); cr.setMatrixAt(n, mtx); cr.setColorAt(n, col.setHSL(0.16 + qq() * 0.06, 0.35, 0.35 + qq() * 0.12)); n++; }
    cr.count = n; sF.add(cr); }
  // fence, farmhouse, bare trees, calendar sign
  const fwood = std({ color: 0x5b4632, roughness: 0.9 }), snowCap = std({ color: 0xf4f7fb, roughness: 0.7 });
  for (let k = 0; k < 16; k++) { const x = -24 + k * 3.2, z = -2.6; add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.18), fwood), sF).position.set(x, fH(x, z) + 0.6, z); add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), snowCap), sF).position.set(x, fH(x, z) + 1.32, z); }
  for (const y of [0.55, 1.05]) { const m = add(new THREE.Mesh(new THREE.BoxGeometry(48, 0.1, 0.08), fwood), sF); m.position.set(0, y + fH(0, -2.6) + 0.1, -2.6); }
  const FARM = new THREE.Group(); FARM.position.set(-14, fH(-14, -40), -40); FARM.rotation.y = 0.35; sF.add(FARM);
  add(new THREE.Mesh(new THREE.BoxGeometry(10, 5, 7), std({ color: 0x8a3a2c, roughness: 0.85 })), FARM).position.y = 2.5;
  { const sh = new THREE.Shape(); sh.moveTo(-5.4, 0); sh.lineTo(0, 3.4); sh.lineTo(5.4, 0); sh.closePath(); const rg = new THREE.ExtrudeGeometry(sh, { depth: 7.6, bevelEnabled: false }); rg.translate(0, 0, -3.8); add(new THREE.Mesh(rg, snowCap), FARM).position.y = 5; }
  add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 0.2), std({ color: 0x3a2a20 })), FARM).position.set(0, 1.7, 3.52);
  const treeF = (x, z, s) => { const G = new THREE.Group(); G.position.set(x, fH(x, z), z); G.scale.setScalar(s); sF.add(G); const qq = mulberry(Math.floor(x * 13 + z)); add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 5, 6), fwood), G).position.y = 2.5; for (let i = 0; i < 7; i++) { const b = add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 2.4, 5), fwood), G); const a = qq() * 6.28; b.position.set(Math.cos(a) * 0.5, 3.2 + qq() * 1.6, Math.sin(a) * 0.5); b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); } };
  treeF(12, -30, 1.4); treeF(20, -46, 1.6); treeF(-30, -26, 1.2); treeF(4, -58, 1.8);
  const calT = label(600, 420, (g, w, h) => { g.fillStyle = "#EFE6D2"; g.fillRect(0, 0, w, h); g.fillStyle = "#7A2E22"; g.fillRect(0, 0, w, 110); g.fillStyle = "#FFF3E2"; fitText(g, "JUNI", w / 2, 88, 84, `400 SZ ${AN}`, w - 40); g.fillStyle = "#2A1D16"; fitText(g, "1816", w / 2, 290, 190, `400 SZ ${AN}`, w - 60); g.fillStyle = "#5A6A7A"; fitText(g, "TIMUR LAUT AMERIKA", w / 2, 380, 46, `600 SZ ${MO}`, w - 40); });
  const CAL = new THREE.Group(); CAL.position.set(6, fH(6, 4.5), 4.5); CAL.rotation.y = -0.25; sF.add(CAL);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.22), fwood), CAL).position.y = 1.6;
  add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.3, 0.12), fwood), CAL).position.y = 3.1;
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.1), std({ map: calT, roughness: 0.8 })); f.position.set(0, 3.1, 0.07); CAL.add(f); add(new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 0.3), snowCap), CAL).position.y = 4.3; }
  // market (Eropa) further right: stall, empty sacks and baskets, price board
  const MK = new THREE.Group(); MK.position.set(34, fH(34, -6), -6); MK.rotation.y = -0.5; sF.add(MK);
  add(new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 2.6), fwood), MK).position.y = 1.2;
  for (const [x, z] of [[-3.3, -1.1], [3.3, -1.1], [-3.3, 1.1], [3.3, 1.1]]) add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 0.2), fwood), MK).position.set(x, 1.8, z);
  { const aw = add(new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.12, 3.4), std({ color: 0x6f5a3a })), MK); aw.position.set(0, 3.6, 0.2); aw.rotation.x = 0.18; add(new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.14, 3.4), snowCap), MK).position.set(0, 3.74, 0.2); }
  const sackM = std({ color: 0xb59c76, roughness: 0.95 });
  for (let i = 0; i < 4; i++) { const s = add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), sackM), MK); s.position.set(-2.4 + i * 1.6, 1.42, 0.2); s.scale.set(1.1, 0.28, 0.9); }
  for (let i = 0; i < 3; i++) { const b = add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.5, 14, 1, true), std({ color: 0x8a6a40, side: THREE.DoubleSide })), MK); b.position.set(-1.6 + i * 1.8, 1.58, 0.75); }
  const priceT = label(800, 560, (g, w, h) => { g.fillStyle = "#1F2622"; g.fillRect(0, 0, w, h); g.strokeStyle = "#6B5236"; g.lineWidth = 22; g.strokeRect(0, 0, w, h); g.fillStyle = "#F2F0E6"; fitText(g, "GANDUM", 70, 150, 92, `400 SZ ${AN}`, 420, "left"); fitText(g, "ROTI", 70, 290, 92, `400 SZ ${AN}`, 420, "left"); g.fillStyle = "#FF6A4A"; fitText(g, "↑↑", 560, 150, 110, `800 SZ ${AR}`, 200, "left"); fitText(g, "↑↑", 560, 290, 110, `800 SZ ${AR}`, 200, "left"); g.fillStyle = "#FFD27A"; fitText(g, "PERSEDIAAN HABIS", w / 2, 440, 66, `600 SZ ${MO}`, w - 80); g.fillStyle = "#A9DBFF"; fitText(g, "EROPA · 1816", w / 2, 520, 44, `600 SZ ${MO}`, w - 80); });
  { const pb = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.8), std({ map: priceT, roughness: 0.85 })); pb.position.set(0, 2.4, -1.2); pb.scale.setScalar(0.82); MK.add(pb); }
  const NSN = 3500, SNOW = points(sF, NSN, { size: 0.16, color: 0xffffff, opacity: 0.95 });
  const snSeed = []; { const qq = mulberry(44); for (let i = 0; i < NSN; i++) snSeed.push([qq(), qq(), qq(), qq()]); }

  // =====================================================================================================
  // VILLA (Swiss lake, June 1816)
  // =====================================================================================================
  const sV = new THREE.Scene();
  sV.background = new THREE.Color(0x0d0f14);
  sV.environment = envFrom("#2a2c34", "#8a6a48", "#20160f", 0.7); sV.environmentIntensity = 0.45;
  sV.fog = new THREE.Fog(0x2a3038, 30, 140);
  const hemiV = new THREE.HemisphereLight(0x8090a8, 0x2a1d14, 0.5); sV.add(hemiV);
  const candle = new THREE.PointLight(0xffa255, 18, 14, 1.6); candle.position.set(-0.9, 1.75, 0.6); candle.castShadow = true; candle.shadow.mapSize.set(1024, 1024); candle.shadow.bias = -0.002; sV.add(candle);
  const winL = new THREE.DirectionalLight(0x9fb4cc, 0.9); winL.position.set(0, 6, -12); sV.add(winL);
  const plasterT = canvasTex(512, 512, (g, w, h) => { const id = g.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 0.8 + 0.2 * fbm(x * 0.03, y * 0.03, 4); const i = (y * w + x) * 4; id.data[i] = v * 196; id.data[i + 1] = v * 178; id.data[i + 2] = v * 150; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }, [3, 2]);
  const woodT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#4A2E1C"; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${20 + 40 * hash2(i, 1)},${10 + 20 * hash2(i, 2)},0,.35)`; g.lineWidth = 1 + 2 * hash2(i, 3); g.beginPath(); const y = hash2(i, 4) * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 10 * Math.sin(i), w * 0.7, y - 8, w, y + 4); g.stroke(); } }, [2, 1]);
  const wallM = std({ map: plasterT, roughness: 0.9 }), deskM = std({ map: woodT, roughness: 0.45 }), frameM = std({ color: 0x3a2618, roughness: 0.6 });
  // back wall with a window hole (4 pieces), frame and mullions
  const WX = 4.2, WY0 = 1.4, WY1 = 6.6, WZ = -2.2;
  add(new THREE.Mesh(new THREE.BoxGeometry(20, WY0 + 0.0, 0.3), wallM), sV).position.set(0, WY0 / 2, WZ);
  add(new THREE.Mesh(new THREE.BoxGeometry(20, 3, 0.3), wallM), sV).position.set(0, WY1 + 1.5, WZ);
  add(new THREE.Mesh(new THREE.BoxGeometry(10 - WX / 2, WY1 - WY0, 0.3), wallM), sV).position.set(-(WX / 2 + (10 - WX / 2) / 2), (WY0 + WY1) / 2, WZ);
  add(new THREE.Mesh(new THREE.BoxGeometry(10 - WX / 2, WY1 - WY0, 0.3), wallM), sV).position.set(WX / 2 + (10 - WX / 2) / 2, (WY0 + WY1) / 2, WZ);
  for (const x of [-WX / 2, 0, WX / 2]) add(new THREE.Mesh(new THREE.BoxGeometry(0.16, WY1 - WY0, 0.22), frameM), sV).position.set(x, (WY0 + WY1) / 2, WZ + 0.05);
  for (const y of [WY0, WY0 + (WY1 - WY0) / 3, WY0 + 2 * (WY1 - WY0) / 3, WY1]) add(new THREE.Mesh(new THREE.BoxGeometry(WX + 0.16, 0.14, 0.22), frameM), sV).position.set(0, y, WZ + 0.05);
  add(new THREE.Mesh(new THREE.BoxGeometry(WX + 1.2, 0.18, 0.7), frameM), sV).position.set(0, WY0 - 0.05, WZ + 0.3);
  add(new THREE.Mesh(new THREE.BoxGeometry(20, 0.1, 10), std({ map: woodT, roughness: 0.7, color: 0x8a6a50 })), sV, false).position.set(0, 0, 2);
  // rain on glass: streaks texture scrolled down
  const rainT = canvasTex(512, 1024, (g, w, h) => { g.clearRect(0, 0, w, h); const qq = mulberry(17); for (let i = 0; i < 260; i++) { const x = qq() * w, y = qq() * h, l = 20 + qq() * 90; const gr = g.createLinearGradient(x, y, x, y + l); gr.addColorStop(0, "rgba(220,235,255,0)"); gr.addColorStop(1, "rgba(220,235,255,.55)"); g.strokeStyle = gr; g.lineWidth = 1.5 + qq() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (qq() - 0.5) * 6, y + l); g.stroke(); g.fillStyle = "rgba(230,240,255,.6)"; g.beginPath(); g.arc(x, y + l, 2.5 + qq() * 2, 0, 6.283); g.fill(); } for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(230,240,255,${0.25 + qq() * 0.3})`; g.beginPath(); g.arc(qq() * w, qq() * h, 1 + qq() * 2.5, 0, 6.283); g.fill(); } }, [2, 1]);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WX, WY1 - WY0), new THREE.MeshBasicMaterial({ map: rainT, transparent: true, depthWrite: false, opacity: 0.45 })); glass.position.set(0, (WY0 + WY1) / 2, WZ + 0.02); sV.add(glass);
  // outside: storm sky, Alps silhouettes, dark lake
  const stormT = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1A1E26"); gr.addColorStop(0.6, "#3E4652"); gr.addColorStop(1, "#59616A"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const stormM = new THREE.MeshBasicMaterial({ map: stormT, fog: false }); const storm = new THREE.Mesh(new THREE.PlaneGeometry(260, 90), stormM); storm.position.set(0, 30, -120); sV.add(storm);
  const alpsT = canvasTex(1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const qq = mulberry(23); for (const [col0, base, amp] of [["#3a414c", 120, 110], ["#262b33", 170, 70]]) { g.fillStyle = col0; g.beginPath(); g.moveTo(0, h); let y = base; for (let x = 0; x <= w; x += 8) { y = base - amp * (0.5 + 0.5 * Math.sin(x * 0.012 + qq() * 0.2)) * (0.6 + 0.4 * fbm(x * 0.02, base, 3)); g.lineTo(x, y); } g.lineTo(w, h); g.closePath(); g.fill(); } });
  const alps = new THREE.Mesh(new THREE.PlaneGeometry(220, 55), new THREE.MeshBasicMaterial({ map: alpsT, transparent: true, fog: false })); alps.position.set(0, 14, -100); sV.add(alps);
  const lakeV = new THREE.Mesh(new THREE.PlaneGeometry(300, 120), phys({ color: 0x1c242c, roughness: 0.15, normalMap: waterN, normalScale: new THREE.Vector2(0.5, 0.5) })); lakeV.rotation.x = -Math.PI / 2; lakeV.position.set(0, -2, -70); sV.add(lakeV);
  const rainOut = points(sV, 1600, { size: 0.08, color: 0xa8b8cc, opacity: 0.55 });
  const roSeed = []; { const qq = mulberry(29); for (let i = 0; i < 1600; i++) roSeed.push([qq(), qq(), qq()]); }
  // desk and props
  const DESK = new THREE.Group(); DESK.position.set(0, 0, 0.4); sV.add(DESK);
  add(new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.16, 2.4), deskM), DESK).position.y = 1.2;
  for (const [x, z] of [[-2.6, -1], [2.6, -1], [-2.6, 1], [2.6, 1]]) add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.2, 0.16), deskM), DESK).position.set(x, 0.6, z);
  const paperM = std({ color: 0xefe3c8, roughness: 0.9 });
  for (let i = 0; i < 5; i++) { const p = add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 1.6), paperM), DESK); p.position.set(1.6 + (i % 2) * 0.05, 1.29 + i * 0.013, -0.2 + i * 0.02); p.rotation.y = 0.2 - i * 0.08; }
  const MS = new THREE.Group(); MS.position.set(0.15, 1.292, 0.35); MS.rotation.set(-Math.PI / 2, 0, 0.06); DESK.add(MS);
  const msT = label(800, 1100, (g, w, h) => { g.fillStyle = "#F1E6CC"; g.fillRect(0, 0, w, h); const qq = mulberry(8); for (let i = 0; i < 14000; i++) { g.fillStyle = `rgba(120,90,50,${qq() * 0.06})`; g.fillRect(qq() * w, qq() * h, 2, 2); } g.strokeStyle = "rgba(60,40,25,.55)"; g.lineWidth = 3; for (let l = 0; l < 13; l++) { const y = 420 + l * 50; g.beginPath(); let x = 70; g.moveTo(x, y); while (x < w - 80) { const s = 10 + qq() * 30; g.quadraticCurveTo(x + s / 2, y - 10 - qq() * 10, x + s, y + (qq() - 0.5) * 6); x += s + (qq() < 0.18 ? 18 : 2); g.moveTo(x, y); } g.stroke(); } g.fillStyle = "rgba(60,40,25,.75)"; fitText(g, "Juni 1816 · Jenewa", w / 2, 360, 44, `600 SZ ${MO}`, w - 120); });
  add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.06), std({ map: msT, roughness: 0.9 })), MS, false);
  // the title is revealed left->right with an alpha ramp texture
  const titleT = label(1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#2A170E"; g.font = `italic 600 150px Georgia, "Times New Roman", serif`; g.textAlign = "center"; g.textBaseline = "alphabetic"; const tw = g.measureText("Frankenstein").width; const s = Math.min(1, (w - 60) / tw); g.save(); g.translate(w / 2, 175); g.scale(s, s); g.fillText("Frankenstein", 0, 0); g.restore(); g.strokeStyle = "#2A170E"; g.lineWidth = 4; g.beginPath(); g.moveTo(140, 214); g.quadraticCurveTo(w / 2, 232, w - 140, 210); g.stroke(); });
  const revT = canvasTex(256, 4, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#fff"); gr.addColorStop(0.49, "#fff"); gr.addColorStop(0.51, "#000"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  revT.colorSpace = THREE.NoColorSpace;
  const title = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshStandardMaterial({ map: titleT, alphaMap: revT, transparent: true, roughness: 0.9, depthWrite: false })); title.position.set(0, 0.58, 0.003); MS.add(title);
  revT.wrapS = THREE.ClampToEdgeWrapping; revT.repeat.set(0.5, 1);
  const tagT = label(640, 200, plate([["MARY SHELLEY", 0.5, 76, `800 SZ ${AR}`], ["penulis · 18 tahun", 0.84, 40, `600 SZ ${MO}`, "#FFC9A0"]]));
  const tagM = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.36), new THREE.MeshStandardMaterial({ map: tagT, transparent: true, roughness: 0.6 })); tagM.position.set(-0.5, 1.33, 1.05); tagM.rotation.x = -1.1; DESK.add(tagM);
  // candle, inkwell, quill
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 20), brass), DESK).position.set(-0.9, 1.32, 0.2);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 16), std({ color: 0xf2e8d4, roughness: 0.5 })), DESK).position.set(-0.9, 1.62, 0.2);
  const flame = sprite(sV, glowT, 0.32, 0.55, { add: true, order: 9, tm: false }); flame.material.color.setRGB(1, 0.7, 0.35);
  const flameCore = sprite(sV, glowT, 0.12, 0.22, { add: true, order: 10, tm: false });
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 16), phys({ color: 0x101418, roughness: 0.1, clearcoat: 1 })), DESK).position.set(0.95, 1.39, 0.15);
  const quillT = canvasTex(128, 512, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#EDE6DA"; g.beginPath(); g.moveTo(w / 2, 6); g.bezierCurveTo(w, 120, w * 0.85, 380, w / 2, 470); g.bezierCurveTo(w * 0.15, 380, 0, 120, w / 2, 6); g.fill(); g.strokeStyle = "rgba(120,110,100,.6)"; g.lineWidth = 1; for (let y = 30; y < 450; y += 6) { g.beginPath(); g.moveTo(w / 2, y + 10); g.lineTo(8 + (y / 470) * 30, y); g.moveTo(w / 2, y + 10); g.lineTo(w - 8 - (y / 470) * 30, y); g.stroke(); } g.strokeStyle = "#8a7a66"; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, 506); g.stroke(); });
  const QUILL = new THREE.Group(); DESK.add(QUILL);
  { const qm = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 1.15), new THREE.MeshStandardMaterial({ map: quillT, transparent: true, side: THREE.DoubleSide, roughness: 0.7 })); qm.position.y = 0.55; QUILL.add(qm); }
  const plaqT = label(820, 170, plate([["VILLA DIODATI · JENEWA, SWISS", 0.46, 56, `800 SZ ${AR}`], ["JUNI 1816 · HUJAN TANPA HENTI", 0.82, 38, `600 SZ ${MO}`, "#A9DBFF"]], { stripe: "#A9DBFF" }));
  const plaq = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.54), new THREE.MeshStandardMaterial({ map: plaqT, transparent: true, roughness: 0.5 })); plaq.position.set(0, WY0 + 0.32, WZ + 0.66); plaq.rotation.x = -0.5; plaq.visible = false; sV.add(plaq);
  for (let i = 0; i < 4; i++) { const bk = add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9 + i * 0.05, 0.7), std({ color: [0x5a2a22, 0x2a3a2a, 0x6a5a3a, 0x2a2a44][i], roughness: 0.6 })), DESK); bk.position.set(-2.3 + i * 0.3, 1.73, -0.6); }
  const lightningT = [72.9, 76.3, 79.4];

  // =====================================================================================================
  // CAMERAS
  // =====================================================================================================
  const camI = track([
    [0, 84, 24, 204, 0, 64, 0],
    [K.s1e, 70, 27, 182, 0, 67, 0],
    [K.s2 + 0.2, 140, 70, 300, 0, 34, 20],
    [tLet - 0.6, 120, 64, 262, 0, 38, 10],
    [tLet + 1.2, 112, 46, 248, 0, 52, 0],
    [tCut1, 100, 44, 230, 0, 56, 0],
    // s3: summit + ruler
    [K.s3, 30, 46, 128, 6, 34, 0],
    [tMenj, 26, 44, 118, 6, 33, 0],
    [tM2 + 0.2, 22, 42, 112, 6, 32, 0],
    [tDesa - 0.4, 34, 30, 170, 4, 20, 40],
    [tTers + 0.6, 40, 16, 172, 6, 8, 80],
    [K.s3e, 44, 14, 176, 8, 9, 78],
    // s4: sawah
    [K.s4 + 0.6, 66, 36, 262, 30, 2, 150],
    [tKor, 54, 37, 258, 26, 3, 140],
    [K.s4e, 42, 38, 254, 20, 5, 130],
    // s5 rise into the plume
    [K.s5 + 0.5, 40, 26, 210, 6, 40, 40],
    [tCut3, 22, 90, 120, 0, 140, 0],
  ]);
  const camI8 = track([
    [K.s8 - 0.2, 6, 56, 44, 0, 26, 0],
    [tSatu8 + 1.0, 30, 70, 110, 0, 24, 0],
    [tMen8, 70, 104, 230, 0, 20, 10],
    [K.dur, 100, 130, 300, 0, 16, 20],
  ]);
  const camG = track([
    [tCut1 - 0.2, ...gcam(-14, 113.5, 13, 0.0)],
    [tSer, ...gcam(-12, 114, 12.4, 0.0)],
    [K.s3, ...gcam(-11, 114.5, 12.2, 0.0)],
  ]);
  const camG5 = track([
    [tCut3 - 0.2, ...gcam(-6, 118, 17, 0.0)],
    [tNaik + 0.6, ...gcam(-2, 112, 26, 0.0)],
    [tMeny + 0.8, ...gcam(8, 95, 50, 0.0)],
    [K.s6, ...gcam(12, 80, 54, 0.0)],
  ]);
  const camG6 = track([
    [tCutI - 0.2, ...gcam(12, 84, 34, -8.5)],
    [tKol, ...gcam(15, 84, 30, -8)],
    [K.s7, ...gcam(16, 84, 29, -8)],
  ]);
  function gcam(lat, lon, d, up) { const p = ll(lat, lon, RG + d), tg = ll(lat, lon, RG * 0.0); const upv = new THREE.Vector3(0, 1, 0); const t2 = tg.clone().add(upv.multiplyScalar(d * 0.16 + up)); return [p.x, p.y, p.z, t2.x, t2.y, t2.z]; }
  const camF = track([
    [K.s6 - 0.2, -4, 3.4, 16, 0, 2.4, -10],
    [tSalju, 0, 3.3, 13.5, 2, 2.6, -10],
    [tJuni + 0.6, 3, 3.4, 12, 5, 2.8, -6],
    [tPanen - 0.4, 10, 3.0, 13, 14, 2.4, -6],
    [tPanen + 0.6, 20, 3.4, 11, 33, 2.2, -6],
    [tKer, 23, 3.3, 9, 34, 2.2, -6.5],
    [tCutI, 24, 3.3, 8.4, 34, 2.2, -7],
  ]);
  const camV = track([
    [K.s7 - 0.2, 0.8, 3.9, 9.2, 0, 2.6, -1.5],
    [tSwiss + 1.2, 0.4, 3.7, 8.2, 0, 2.4, -1.2],
    [tBerl, -0.2, 3.6, 6.4, 0, 1.9, -0.6],
    [tMary, -0.1, 3.5, 4.4, 0.05, 1.3, 0.6],
    [tFrank + 0.3, -0.15, 3.35, 3.6, 0.0, 1.3, 0.7],
    [K.s8, -0.15, 3.3, 3.5, 0.0, 1.3, 0.7],
  ]);
  const tgt = new THREE.Vector3();
  const popIn = (t, a, d = 0.45) => back(clamp01((t - a) / d), 1.7);
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));

  // eruption intensity, ash coverage, collapse
  const ERU = (t) => {
    if (t < K.s2 - 0.1) return 1;
    if (t < tLet - 0.3) return 0.12;
    if (t < K.s3) return lerp(0.12, 1, ramp(t, tLet - 0.3, tLet + 1.2));
    if (t < tTers + 3) return 0.7;
    if (t < K.s8) return lerp(0.7, 0.45, ramp(t, tTers + 3, K.s4e));
    return 0;
  };
  const ASHC = (t) => (t < K.s2 - 0.1 ? 0.35 : t < tLet ? 0 : t < K.s8 ? lerp(0, 0.55, ramp(t, tLet, K.s3)) + 0.45 * ramp(t, tAbu - 0.3, tSaw + 1.5) : 0);
  const COLL = (t) => (t < tMenj - 0.1 ? 0 : t < K.s8 ? ramp(t, tMenj - 0.1, tMenj + 2.5) : 1);
  const DUSK = (t) => (t < K.s2 - 0.1 ? 1 : t < K.s8 ? ramp(t, tLet - 0.4, tLet + 1.6) : 0);

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`400 40px "Anton"`) && document.fonts.check(`800 40px "Archivo"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const SET = setAt(t);
    const scn = SET === "I" ? sI : SET === "G" ? sG : SET === "F" ? sF : sV;
    RP.scene = scn;
    const sh = (a, b) => [Math.sin(t * a) * b, Math.sin(t * a * 0.77 + 1) * b * 0.7];

    if (SET === "I") {
      const c = t >= K.s8 ? camI8(t) : camI(t);
      const [jx, jy] = sh(0.4, 0.25);
      cam.position.set(c[0] + jx, c[1] + jy, c[2]); tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
      // shake on the big moments
      const shk = 0.5 * pump(t, tLet + 0.1, 0.05, 1.4) + 0.35 * pump(t, tMenj, 0.05, 1.2) + 0.3 * pump(t, 0.05, 0.02, 1.0);
      if (shk > 0) { cam.position.x += Math.sin(t * 61) * shk; cam.position.y += Math.sin(t * 47 + 1) * shk * 0.6; }
      cam.updateMatrixWorld();
      domeA.position.copy(cam.position); domeB.position.copy(cam.position);
      const du = DUSK(t), E = ERU(t), u = COLL(t), ac = ASHC(t);
      domeB.material.opacity = du;
      sI.environment = du > 0.5 ? envAsh : envCalm;
      sI.fog.color.setRGB(lerp(0.78, 0.36, du), lerp(0.8, 0.25, du), lerp(0.8, 0.19, du)); sI.fog.density = lerp(0.0011, 0.0019, du);
      sunI.color.setRGB(1, lerp(0.88, 0.62, du), lerp(0.72, 0.42, du)); sunI.intensity = lerp(2.6, 1.15, du);
      sunI.target.position.set(tgt.x * 0.5, 0, tgt.z * 0.5 + 40); sunI.position.set(sunI.target.position.x + lerp(150, -120, du), lerp(160, 70, du), sunI.target.position.z + lerp(60, -90, du));
      hemiI.intensity = lerp(0.6, 0.38, du); hemiI.color.setRGB(lerp(0.82, 0.5, du), lerp(0.88, 0.42, du), lerp(0.94, 0.42, du));
      // terrain morph + ash coverage
      if (Math.abs(u - lastU) > 0.002) { heightsAt(u); lastU = u; }
      if (Math.abs(ac - lastAsh) > 0.004) { for (let i = 0; i < NV * 3; i++) tCol[i] = colClean[i] + (colAsh[i] - colClean[i]) * ac; tGeo.attributes.color.needsUpdate = true; lastAsh = ac; treeM.color.copy(treeBase).lerp(ashCol, ac * 0.8); palmM.color.copy(palmBase).lerp(ashCol, ac * 0.7); }
      const sawA = t >= K.s8 ? 0 : ramp(t, tAbu - 0.2, tSaw + 1.6) * 0.92 + (t > tLet && t < tAbu ? 0.15 : 0);
      ashM.opacity = sawA * 0.8;
      const Hs = lerp(H0, H1, u) - 1.5;
      // vent, lava light, column
      const vy = u > 0.5 ? 23 : Hs;
      vent.position.set(0, vy + 2, 0); vent.material.opacity = Math.min(1, E * 1.3) * (0.85 + 0.15 * Math.sin(t * 23)); vent.scale.setScalar(18 + 16 * E);
      lava.position.set(0, vy + 6, 8); lava.intensity = E * (900 + 300 * Math.sin(t * 17)) * (0.4 + 0.6 * du);
      for (let i = 0; i < NC; i++) {
        const s = cSeed[i];
        if (E < 0.01 || s[3] > E * 1.05 + 0.02) { COL.hide(i); continue; }
        const a = fract(t / 9 + s[0]);
        const rise = Math.pow(a, 0.8);
        const top = 70 + 70 * E;
        let y = vy + 2 + rise * top, rad = (3 + 20 * a) * (0.5 + 0.5 * E), ang = s[1] * 6.283 + a * 0.8;
        if (a > 0.72) { const k = (a - 0.72) / 0.28; rad += k * 80 * E; y = vy + 2 + top * Math.pow(0.72, 0.8) + 14 * Math.sin(k * 1.6) * E; }
        const x = Math.cos(ang) * rad * (0.6 + 0.4 * s[2]), z = Math.sin(ang) * rad * (0.6 + 0.4 * s[2]);
        const sc = (9 + 46 * a + 12 * s[4]) * (0.35 + 0.65 * E) * Math.min(1, a * 8) * (a > 0.93 ? (1 - a) / 0.07 : 1);
        const lit = 0.32 + 0.28 * Math.max(0, (x * -0.6 + z * 0.4) / Math.max(1, rad)) + 0.12 * s[2];
        const hot = Math.max(0, 1 - a * 6) * E;
        const nightK = lerp(1.15, 0.62, du);
        COL.set(i, x, y, z, sc, (lit * nightK + hot * 1.4 + 0.12 * du * (1 - a)), (lit * nightK * 0.93 + hot * 0.55 + 0.04 * du * (1 - a)), (lit * nightK * 0.88 + hot * 0.18));
      }
      COL.commit();
      // pyroclastic flows: small on the upper slopes in s1, full runs to the villages in s3
      const fr0 = t < K.s2 - 0.1 ? -1 : t < tDesa - 0.4 ? -1 : 22 + 120 * ramp(t, tDesa - 0.3, tTers + 0.8);
      const fFade = t < K.s2 ? 1 : 1 - ramp(t, K.s4 + 2, K.s4 + 5);
      for (let j = 0; j < NF; j++) {
        const s = fSeed[j];
        if (fr0 < 0 || fFade <= 0 || t >= K.s8) { FLW.hide(j); continue; }
        const lb = FLOBE[j % FLOBE.length], p = Math.pow(s[0], 0.7);
        const rr0 = 20 + p * (fr0 - 20), ang = lb + (s[1] - 0.5) * 0.12 + Math.sin(rr0 * 0.08 + j) * 0.03;
        const x = Math.cos(ang) * rr0, z = Math.sin(ang) * rr0, hh = height(x, z, u);
        const sc = (3 + 5 * p + 3 * s[2]) * fFade * (1 + 0.15 * Math.sin(t * 2 + j));
        const front = 1 - Math.min(1, (fr0 - rr0) / 12);
        FLW.set(j, x, hh + sc * 0.35, z, sc, 0.62 + 0.3 * front * du, 0.55 + 0.1 * front, 0.48 - 0.1 * front);
      }
      FLW.commit();
      // villages get covered as the flow front passes
      for (const h of houses) { const gone = t >= K.s8 ? false : t > tDesa && fr0 > h.r + 2; h.G.visible = !gone; }
      // bolts
      boltM.opacity = 0; bolts.forEach((b) => (b.visible = false));
      for (let k = 0; k < BOLT_T.length; k++) { const d = t - BOLT_T[k]; if (d > 0 && d < 0.14 && E > 0.3) { const b = bolts[k % 3]; b.visible = true; b.position.set(0, vy - 43 + 10, 0); boltM.opacity = 1 - d / 0.14; hemiI.intensity += 1.2 * (1 - d / 0.14); } }
      // ash rain
      const aOn = t < K.s2 - 0.1 ? 0.5 : t > tLet + 2 && t < K.s8 ? 1 : 0;
      ASHP.m.opacity = 0.85 * aOn;
      for (let i = 0; i < NA; i++) { const s = aSeed[i]; ASHP.pos[i * 3] = tgt.x + (s[0] - 0.5) * 140; ASHP.pos[i * 3 + 2] = tgt.z + 30 + (s[1] - 0.5) * 160; ASHP.pos[i * 3 + 1] = 60 - fract(t * (0.08 + 0.05 * s[3]) + s[2]) * 70 + Math.sin(t + i) * 0.5; }
      ASHP.commit();
      // labels and ruler
      const uLoc = popIn(t, A("s2:Sumbawa") - 0.3) * (1 - ramp(t, tCut1 - 0.5, tCut1 - 0.2)) * (t < K.s3 ? 1 : 0);
      loc.visible = uLoc > 0.01; loc.position.set(42, 40, 60); loc.scale.set(30 * uLoc, 7 * uLoc, 1);
      const inS3 = t > K.s3 - 0.1 && t < tDesa;
      const uR = inS3 ? popIn(t, A("s3:Tingginya") - 0.3, 0.6) : 0;
      RUL.visible = uR > 0.01; RUL.scale.set(1, Math.max(0.001, uR), 1);
      rulCap.visible = uR > 0.5; rulCap.position.set(18, 49.2 * Math.max(0.001, uR) , 12);
      tickLab.forEach((s) => { s.visible = uR > 0.6; s.position.set(18 + 2.9, s.userData.m / 100, 12); });
      p43.visible = uR > 0.5; p43.position.set(13.5, H0 + 2.6, 6);
      const u28 = popIn(t, tMenj + 2.0); p28.visible = inS3 && u28 > 0.01; p28.scale.set(8.6 * u28, 2.15 * u28, 1); p28.position.set(13.5, H1 + 2.9, 6);
      laser.visible = uR > 0.5; { const y = lerp(H0, H1, u) + 0.3; laser.position.set(9, y, 6); laser.scale.set(18, 1, 1); }
      const gO = inS3 ? ramp(t, tLen - 0.3, tLen + 0.4) : 0; ghost.visible = gO > 0.01 && u > 0.05; ghostFill.material.opacity = 0.24 * gO; ghostWire.material.opacity = 0.18 * gO;
      const cR = inS3 ? ramp(t, tSep - 0.2, tSep + 0.4) * (1 - ramp(t, tMenj + 2.3, tMenj + 2.8)) : 0; cutRing.visible = cR > 0.01; cutRing.material.color.setRGB(1, 0.54, 0.25).multiplyScalar(1 + pump(t, tSep, 0.1, 0.8) * 2); cutRing.material.opacity = cR;
      const u3 = inS3 ? popIn(t, tSep) * (1 - ramp(t, tMenj - 0.4, tMenj)) : 0; third.visible = u3 > 0.01; third.scale.set(10 * u3, 2.3 * u3, 1); third.position.set(-14, H0 - 4, 8);
      // today
      const today = t >= K.s8;
      lake.visible = today; SIGN.visible = today;
      ringsW.forEach((m, i) => { const a = (t - tSatu8 - i * 0.9); m.visible = today && a > 0 && a < 5; if (m.visible) { const rad = 12 + a * 60; m.scale.set(rad, rad, 1); m.material.opacity = 0.75 * (1 - a / 5); } });
      waterN.offset.set(t * 0.004, t * 0.003);
    } else if (SET === "G") {
      const c = t < K.s3 ? camG(t) : t < K.s6 ? camG5(t) : camG6(t);
      cam.position.set(c[0], c[1], c[2]); tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt); cam.updateMatrixWorld();
      // s2 boom ring
      const inS2 = t < K.s3;
      const th = inS2 ? thBat * ramp(t, tCut1 + 0.2, tBat + 0.1) : 0;
      boom.visible = inS2 && th > 0.001; setRing(Math.max(0.002, th), 0.006 + 0.004 * Math.sin(t * 9)); ringM.opacity = 0.85;
      pTam.visible = true; pTam.userData.halo.scale.setScalar(1 + 0.4 * Math.sin(t * 5));
      pBat.visible = inS2; pBat.scale.setScalar(1 + 1.2 * pump(t, tBat + 0.1, 0.1, 0.8));
      arc.visible = inS2 && t > tSer - 0.4; arc.material.opacity = ramp(t, tSer - 0.4, tSer + 0.2);
      const showL = (s, u, p, sc) => { s.visible = u > 0.01; s.position.copy(p); s.scale.set(sc[0] * u, sc[1] * u, 1); };
      showL(lTam, inS2 ? popIn(t, tCut1 + 0.3) : (t < K.s6 ? popIn(t, tCut3 + 0.2) * (1 - ramp(t, tMeny, tMeny + 0.5)) : 0), ll(SRC.lat - 1.2, SRC.lon + 2.5, RG * 1.06), [1.7, 0.45]);
      showL(lBat, inS2 ? popIn(t, tBat - 0.1) : 0, ll(BAT.lat + 2.4, BAT.lon - 1.0, RG * 1.06), [1.6, 0.42]);
      showL(lKm, inS2 ? popIn(t, tSer - 0.2) : 0, ll(-10.3, 111.8, RG * 1.06), [1.45, 0.39]);
      // s5: plume, stratosphere shell, veil, rays
      const in5 = t > K.s3 && t < K.s6;
      const vS5 = in5 ? ramp(t, tMeny - 0.4, K.s6 + 0.5) : t >= K.s6 ? 1 : 0;
      veilM.uniforms.uS.value = 0.05 + 3.0 * vS5 * vS5 + (t >= K.s6 ? 0.5 : 0); veilM.uniforms.uA.value = in5 ? 0.75 * ramp(t, tNaik, tNaik + 1.2) : t >= K.s6 ? 0.32 : 0; veilM.uniforms.uT.value = t;
      strat.visible = false; strat.material.opacity = in5 ? 0.06 * ramp(t, tNaik - 0.2, tNaik + 0.6) * (1 - ramp(t, tMeny + 1, tMeny + 2)) : 0;
      for (let i = 0; i < NGP; i++) {
        if (!in5) { GPL.hide(i); continue; }
        const a = fract(t / 4 + i / NGP), up = srcV.clone(), side = new THREE.Vector3(0, 1, 0).cross(up).normalize(), s2 = up.clone().cross(side);
        const hh = RG * (1.0 + 0.05 * Math.pow(a, 0.8)), sp = 0.1 + a * 0.5 + (a > 0.75 ? (a - 0.75) * 4 : 0);
        const ang = i * 2.39;
        const p = up.clone().multiplyScalar(hh).add(side.multiplyScalar(Math.cos(ang) * sp * 0.4)).add(s2.multiplyScalar(Math.sin(ang) * sp * 0.4));
        const sc = (0.25 + a * 0.6) * ramp(t, tGas - 0.3, tGas + 0.4) * (1 - ramp(t, tMem, tMem + 1.0));
        GPL.set(i, p.x, p.y, p.z, sc, 0.9 - a * 0.1, 0.82 - a * 0.1, 0.6 - a * 0.2);
      }
      GPL.commit();
      const rOn = in5 ? ramp(t, tMem - 0.1, tMem + 0.9) : 0;
      raysM.opacity = 1.0 * rOn;
      rays.forEach((ry, i) => { const ph = fract((t - tMem) * 0.6 + i * 0.13); const L1 = 20 * clamp01(ph * 2), L2 = 16 * clamp01(ph * 2 - 1); const st = ry.p.clone().sub(ry.inc.clone().multiplyScalar(20)); ry.a.position.copy(st); ry.a.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ry.inc); ry.a.scale.set(1, Math.max(0.001, L1), 1); ry.b.position.copy(ry.p); ry.b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ry.ref); ry.b.scale.set(1, Math.max(0.001, L2), 1); ry.a.visible = ry.b.visible = rOn > 0.01; });
      const dim = t > tMem ? ramp(t, tMem, tMem + 2) : 0;
      sunG.intensity = 2.8 - 1.1 * (t >= K.s6 ? 1 : dim); sunSpr.material.opacity = 1 - 0.35 * (t >= K.s6 ? 1 : dim);
      // s6 India
      const in6 = t >= K.s6;
      pBen.visible = in6 && t > tKol - 0.3; lBen.visible = false; lInd.visible = false;
      showL(lInd, in6 ? popIn(t, tIndia - 0.2) * (1 - ramp(t, tKol - 0.5, tKol - 0.2)) : 0, ll(15, 72, RG * 1.06), [2.4, 0.64]);
      showL(lBen, in6 ? popIn(t, tKol - 0.2) : 0, ll(27.5, 92.5, RG * 1.06), [2.4, 0.64]);
      swirls.forEach((m) => { m.material.opacity = in6 ? 0.5 * ramp(t, tIndia - 0.4, tIndia + 0.4) : 0; m.rotation.z = -t * (0.6 + m.userData.ph * 0.3) + (t > tKacau ? Math.sin(t * 7 + m.userData.ph) * 0.4 : 0); });
      for (let i = 0; i < NCH; i++) { const s = chSeed[i]; const age = in6 ? clamp01((t - tKol - s[0] * 1.6) / 2.0) : 0; if (age <= 0) { CHO.pos[i * 3 + 1] = -999; continue; } const ang = s[1] * 6.283, dd = age * (2 + s[2] * 9); const v = ll(BEN.lat + Math.sin(ang) * dd, BEN.lon + Math.cos(ang) * dd * 1.4, RG * 1.012); CHO.pos.set([v.x, v.y, v.z], i * 3); }
      CHO.commit();
    } else if (SET === "F") {
      const c = camF(t); const [jx, jy] = sh(0.5, 0.05);
      cam.position.set(c[0] + jx, c[1] + jy, c[2]); tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt); cam.updateMatrixWorld();
      for (let i = 0; i < NSN; i++) { const s = snSeed[i]; const x = cam.position.x + (s[0] - 0.5) * 40 + Math.sin(t * 0.8 + i) * 0.4, z = cam.position.z - 2 - s[1] * 34, y = 12 - fract(t * (0.07 + 0.04 * s[3]) + s[2]) * 13; SNOW.pos.set([x, y, z], i * 3); }
      SNOW.commit();
      CAL.rotation.z = Math.sin(t * 1.3) * 0.01;
    } else {
      const c = camV(t); const [jx, jy] = sh(0.35, 0.02);
      cam.position.set(c[0] + jx, c[1] + jy, c[2]); tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt); cam.updateMatrixWorld();
      rainT.offset.set(0, fract(t * 0.18));
      const fl = 1 + 0.12 * Math.sin(t * 13) + 0.08 * Math.sin(t * 29 + 1);
      candle.intensity = 6 * fl; flame.position.set(-0.9, 2.0 + 0.02 * Math.sin(t * 11), 0.6); flame.scale.set(0.3 * fl, 0.52 * fl, 1); flameCore.position.set(-0.9, 1.98, 0.6);
      let lg = 0; for (const lt of lightningT) { const d = t - lt; if (d > 0 && d < 0.35) lg = Math.max(lg, (d < 0.06 ? 1 : 0.5) * (1 - d / 0.35)); }
      winL.intensity = 0.9 + 6 * lg; stormM.color.setScalar(1 + 2.5 * lg); hemiV.intensity = 0.5 + 0.8 * lg;
      for (let i = 0; i < 1600; i++) { const s = roSeed[i]; rainOut.pos.set([(s[0] - 0.5) * 30, 14 - fract(t * 1.6 + s[1]) * 18, -4 - s[2] * 26], i * 3); } rainOut.commit();
      // quill writes; title reveals
      const wr = ramp(t, tMary - 0.6, tFrank + 1.2);
      QUILL.position.set(0.15 - 0.45 + 0.9 * clamp01((t - tFrank) / 1.0) + 0.04 * Math.sin(t * 9) * (t > tMary - 0.6 && t < tFrank + 1 ? 1 : 0), 1.3 + 0.02 * Math.abs(Math.sin(t * 9)), 0.35 - 0.62 + (t < tFrank ? 0.3 * Math.sin(t * 2) * 0.1 : 0));
      QUILL.rotation.set(-0.5, 0.4, -0.5); QUILL.scale.setScalar(0.6);
      revT.offset.x = 0.5 - 0.5 * clamp01((t - tFrank + 0.05) / 1.0);
      tagM.visible = t > tMary - 0.2; tagM.scale.setScalar(Math.max(0.001, popIn(t, tMary - 0.2)));
      void wr;
    }
    comp.render();
  };
}
