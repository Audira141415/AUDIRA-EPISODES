// EP50 KINTSUGI: Sirimavo Bandaranaike, the world's first woman prime minister (Ceylon / Sri Lanka, 1960).
// One still life on a dark warm wooden table in front of a black-lacquer folding screen:
//   VESSEL : a lathe-turned porcelain vase (glossy glaze, biscuit foot, darker interior). Cracks grow on its body as
//            thin dark lines; each crack later fills with a raised, tapered gold seam that flows from one end.
//   SCREEN : three black-lacquer panels with gold edges; words are gold-leaf inlays (STATESWOMAN, STATESMAN struck).
//   PROPS  : a tent name card (Sirimavo Bandaranaike), a porcelain dish painted with the island of Ceylon (label swaps
//            to Republik Sri Lanka 1972), two cups (mother and daughter) linked by a gold thread, a ballot slip,
//            a small black plaque with a gold AUDIRA plate.
//   s1 flash-forward: the finished kintsugi vase + STATESWOMAN       s5 screen: STATESMAN struck in gold, STATESWOMAN written
//   s2 name card close-up, then the Ceylon dish, then the clean vase  s6 orbit: three seams = three terms; dish becomes Sri Lanka 1972
//   s3 the vase cracks (date in the panel, no violence), light dims   s7 cups: daughter 1994, gold thread to mother, ballot slip
//   s4 gold flows into the first crack: 21 Juli 1960                  s8 wide pull-back: everything, AUDIRA plaque
// Everything is a pure function of t. Hard camera cuts happen only at scene starts (under the panel transition).

const FONTS = ['700 80px "Cormorant Garamond"', '600 80px "Cormorant Garamond"', '500 80px "IBM Plex Mono"', '600 80px "IBM Plex Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "STATESWOMAN 1960 AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, eout, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { GEO } from "./geo.js";

const SERIF = '"Cormorant Garamond", Georgia, serif', MONO = '"IBM Plex Mono", Consolas, monospace';
const INK = "#2B2622", PORC = "#F2EFE8", GOLD = "#D4A63A", TEA = "#6B4F3A", MAROON = "#8D153A";

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

// polyline as an arc-length curve, so tubes keep sharp crack corners
class Poly extends THREE.Curve {
  constructor(p) {
    super(); this.p = p; this.L = [0];
    for (let i = 1; i < p.length; i++) this.L.push(this.L[i - 1] + p[i].distanceTo(p[i - 1]));
  }
  getPoint(u, out = new THREE.Vector3()) {
    const T = this.L[this.L.length - 1] * clamp01(u);
    let i = 1; while (i < this.L.length - 1 && this.L[i] < T) i++;
    const a = this.L[i - 1], b = this.L[i];
    return out.copy(this.p[i - 1]).lerp(this.p[i], b > a ? (T - a) / (b - a) : 0);
  }
}

// lathe surface helper: profile LUT gives r(y) and r'(y) for points and normals on the outer wall
function surface(prof) {
  const ys = prof.map((p) => p[1]), rs = prof.map((p) => p[0]);
  const tr = track(prof.map(([a, b]) => [b, a])); const r = (y) => tr(y)[0];
  const dr = (y) => (r(y + 0.01) - r(y - 0.01)) / 0.02;
  const at = (th, y, off = 0) => { const n = new THREE.Vector3(Math.sin(th), -dr(y), Math.cos(th)).normalize(); return new THREE.Vector3(r(y) * Math.sin(th), y, r(y) * Math.cos(th)).addScaledVector(n, off); };
  return { r, dr, at };
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x1c1612, exp: 0.82, bloom: [0.16, 0.35, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.82;
  r.localClippingEnabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  cam.near = 0.1; cam.far = 200; cam.updateProjectionMatrix();
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#14100c"); gr.addColorStop(0.45, "#2B2622"); gr.addColorStop(0.7, "#231b15"); gr.addColorStop(1, "#0f0b08"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.FogExp2(0x1a1410, 0.035);

  // own environment for gold and glaze: warm softboxes so metal has something to reflect
  const goldEnv = (() => {
    const s = new THREE.Scene(); s.background = new THREE.Color(0x0b0806);
    for (const [w, h, c, i, x, y, z] of [[6, 3, 0xfff0d8, 7, -5, 6, 5], [2, 6, 0xffd9a8, 4, 6, 2, 3], [8, 1.2, 0xffffff, 3, 0, 4, -7], [10, 4, 0x5a3a22, 1.2, 0, -5, 0], [3, 3, 0xffe2b0, 2.5, 4, 5, -3]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    return pm.fromScene(s, 0.03).texture;
  })();

  // ---------- lights: warm key from front-left, cool-warm rim from behind, low fill ----------
  const hemi = new THREE.HemisphereLight(0xfff0e0, 0x3a2414, 0.35); scene.add(hemi);
  const key = new THREE.SpotLight(0xffdcb0, 150, 40, 0.55, 0.65, 1.6);
  key.position.set(-5.5, 8, 6.5); key.target.position.set(0, 1.0, 0.3);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffe6c8, 1.4); rim.position.set(5, 6, -6); scene.add(rim);
  const fill = new THREE.PointLight(0xffb878, 6, 12, 2); fill.position.set(3.5, 1.5, 4); scene.add(fill);

  const std = (c, ro = 0.75, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const dataTex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const tx = new THREE.CanvasTexture(c); tx.anisotropy = 8; return tx; };
  const rr = (g, x, y, w, h, rad) => { g.beginPath(); g.moveTo(x + rad, y); g.arcTo(x + w, y, x + w, y + h, rad); g.arcTo(x + w, y + h, x, y + h, rad); g.arcTo(x, y + h, x, y, rad); g.arcTo(x, y, x + w, y, rad); g.closePath(); };
  const tmpV = new THREE.Vector3();

  const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xd9a640, metalness: 1, roughness: 0.2, envMap: goldEnv, envMapIntensity: 1.6, emissive: 0x6a4410, emissiveIntensity: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.15 });
  const crackMat = std(0x1a120c, 0.95);

  // ---------- table: dark warm polished wood ----------
  const woodTex = canvasTex(1024, 1024, (g, w, h) => {
    const q = mulberry(50);
    g.fillStyle = "#3a2416"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const y0 = q() * h, a = 2 + q() * 10, f = 0.002 + q() * 0.006, ph = q() * 6.28, lw = 0.6 + q() * 2.6, l = q();
      g.strokeStyle = l < 0.5 ? `rgba(20,10,4,${0.15 + q() * 0.35})` : `rgba(120,74,40,${0.08 + q() * 0.18})`;
      g.lineWidth = lw; g.beginPath();
      for (let x = 0; x <= w; x += 8) { const y = y0 + a * Math.sin(x * f + ph) + 3 * Math.sin(x * f * 5 + ph * 2); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < 9; i++) { const x = q() * w, y = q() * h; const gr = g.createRadialGradient(x, y, 2, x, y, 30 + q() * 40); gr.addColorStop(0, "rgba(15,8,3,.55)"); gr.addColorStop(1, "rgba(15,8,3,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 70, 18, 0, 0, 6.29); g.fill(); }
  }, [2.2, 1.4]);
  const table = add(new THREE.BoxGeometry(18, 0.3, 10), new THREE.MeshPhysicalMaterial({ map: woodTex, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.22, envMap: goldEnv, envMapIntensity: 0.25 }), 0, -0.15, 1.2);
  table.castShadow = false;
  // contact shadows (AO) under objects
  const aoTex = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(0.45, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const contact = (x, z, sx, sz, o = 0.8) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false, opacity: o })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); scene.add(m); return m; };

  // ---------- lacquer folding screen with gold edges and maki-e dust ----------
  const SCREEN = new THREE.Group(); scene.add(SCREEN);
  const makieTex = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = "#120d0a"; g.fillRect(0, 0, w, h);
    const q = mulberry(7);
    for (let i = 0; i < 2600; i++) { const y = h * (0.62 + 0.38 * Math.pow(q(), 0.6)), x = q() * w; g.fillStyle = `rgba(212,166,58,${0.05 + q() * 0.22})`; g.fillRect(x, y, 1 + q() * 2, 1 + q() * 2); }
    for (let i = 0; i < 3; i++) { g.strokeStyle = "rgba(212,166,58,.18)"; g.lineWidth = 3; g.beginPath(); const y0 = h * (0.8 + i * 0.05); for (let x = 0; x <= w; x += 6) { const y = y0 + 18 * Math.sin(x * 0.02 + i); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  });
  const lacq = new THREE.MeshPhysicalMaterial({ map: makieTex, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, envMap: goldEnv, envMapIntensity: 0.35 });
  const SW0 = 2.5, CW0 = 5.0, SCH = 4.9, SZ = -1.9;
  const panelPose = [[-(CW0 / 2 + SW0 * 0.47), SZ + 0.42, 0.34, SW0], [0, SZ, 0, CW0], [CW0 / 2 + SW0 * 0.47, SZ + 0.42, -0.34, SW0]];
  panelPose.forEach(([x, z, ry, SW]) => {
    const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = ry; SCREEN.add(p);
    add(new THREE.BoxGeometry(SW, SCH, 0.07), lacq, 0, SCH / 2, 0, p);
    for (const [w, h, xx, yy] of [[SW, 0.05, 0, SCH - 0.03], [SW, 0.05, 0, 0.03], [0.05, SCH, -SW / 2 + 0.025, SCH / 2], [0.05, SCH, SW / 2 - 0.025, SCH / 2]]) add(new THREE.BoxGeometry(w, h, 0.09), goldMat, xx, yy, 0, p);
  });

  // gold-leaf word inlay: alpha mask + blurred bump so the letters catch light; additive halo behind
  function wordInlay(text, { w = 3.6, font = (s) => `700 ${s}px ${SERIF}`, spacing = 0.06, color = null, y = 3.4, halo = 0.5 } = {}) {
    const CW = 2048, CH = Math.round(CW * 0.17);
    const paint = (g, W, H, blur) => { g.fillStyle = "#000"; g.fillRect(0, 0, W, H); if (blur) g.filter = `blur(${blur}px)`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; let fs = H * 0.78; for (let it = 0; it < 30; it++) { g.font = font(fs); if ("letterSpacing" in g) g.letterSpacing = `${Math.round(fs * spacing)}px`; if (g.measureText(text).width <= W * 0.94) break; fs *= 0.95; } g.fillText(text, W / 2, H * 0.54); g.filter = "none"; };
    const mask = dataTex(CW, CH, (g, W, H) => paint(g, W, H, 0));
    const bump = dataTex(CW, CH, (g, W, H) => paint(g, W, H, 6));
    const h = (w * CH) / CW;
    const mat = color ? new THREE.MeshStandardMaterial({ color, roughness: 0.4, alphaMap: mask, transparent: true, bumpMap: bump, bumpScale: 3, envMap: goldEnv, envMapIntensity: 0.5 })
      : new THREE.MeshPhysicalMaterial({ color: 0xe0ad45, metalness: 1, roughness: 0.24, alphaMap: mask, transparent: true, bumpMap: bump, bumpScale: 4, envMap: goldEnv, envMapIntensity: 1.8, emissive: 0x8a5a14, emissiveIntensity: 0.45 });
    mat.clippingPlanes = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)];
    const G = new THREE.Group(); G.position.set(0, y, SZ + 0.045); scene.add(G);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = 3; G.add(m);
    let hl = null;
    if (halo) {
      const ht = canvasTex(1024, Math.round(1024 * 0.3), (g, W, H) => { g.filter = "blur(18px)"; g.fillStyle = "rgba(255,196,90,1)"; g.textAlign = "center"; g.textBaseline = "middle"; let fs = H * 0.6; for (let it = 0; it < 30; it++) { g.font = font(fs); if ("letterSpacing" in g) g.letterSpacing = `${Math.round(fs * spacing)}px`; if (g.measureText(text).width <= W * 0.86) break; fs *= 0.95; } g.fillText(text, W / 2, H * 0.54); });
      hl = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.12, w * 1.12 * 0.3), basic({ map: ht, blending: THREE.AdditiveBlending, opacity: 0 })); hl.position.z = -0.01; hl.renderOrder = 2; G.add(hl);
    }
    return { G, m, hl, w, halo, set(k, wipe = 1, glow = 1) {
      G.visible = k > 0.002; if (!G.visible) return;
      mat.opacity = k;
      const xw = -w / 2 + (w + 0.1) * clamp01(wipe);
      mat.clippingPlanes[0].constant = xw; // plane keeps x < xw (G is unrotated, world x == local x)
      if (hl) hl.material.opacity = halo * k * glow * clamp01(wipe * 1.2);
    } };
  }
  const W_STATESWOMAN = wordInlay("STATESWOMAN", { w: 3.45, y: 3.62 });
  const W_STATESMAN = wordInlay("STATESMAN", { w: 2.75, y: 4.28, color: 0xd9d2c4, halo: 0 });
  const strike = add(new THREE.BoxGeometry(1, 0.05, 0.03), goldMat, 0, 4.28, SZ + 0.07); strike.castShadow = false;

  // ---------- the vessel ----------
  const OUT = [[0.5, 0.12], [0.63, 0.24], [0.76, 0.42], [0.87, 0.66], [0.94, 0.92], [0.96, 1.12], [0.93, 1.36], [0.84, 1.6], [0.7, 1.82], [0.52, 2.0], [0.4, 2.13], [0.36, 2.25], [0.37, 2.36], [0.42, 2.45], [0.46, 2.5]];
  const VS = surface(OUT);
  const lathePts = [new THREE.Vector2(0.001, 0.015), new THREE.Vector2(0.4, 0.0), new THREE.Vector2(0.455, 0.012), new THREE.Vector2(0.47, 0.07), new THREE.Vector2(0.49, 0.11)];
  for (let y = 0.12; y <= 2.5001; y += 0.02) lathePts.push(new THREE.Vector2(VS.r(y), y));
  lathePts.push(new THREE.Vector2(0.455, 2.52), new THREE.Vector2(0.43, 2.515));
  for (let y = 2.49; y >= 0.3; y -= 0.03) lathePts.push(new THREE.Vector2(Math.max(0.05, VS.r(y) - 0.045), y));
  lathePts.push(new THREE.Vector2(0.001, 0.26));
  const vGeo = new THREE.LatheGeometry(lathePts, 160);
  {
    const p = vGeo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rad = Math.hypot(x, z);
      const inner = y > 0.25 && rad < VS.r(y) - 0.02 && y < 2.49;
      if (y < 0.11 && rad > 0.3) c.set("#d6c3a4"); // unglazed biscuit foot ring
      else if (inner) c.set("#c9c3b6").multiplyScalar(0.55 + 0.45 * smooth((y - 0.6) / 1.9));
      else c.set(PORC).multiplyScalar(0.86 + 0.14 * smooth((y - 0.12) / 0.5));
      col.set([c.r, c.g, c.b], i * 3);
    }
    vGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  const glazeBump = dataTex(512, 512, (g, w) => { const q = mulberry(3); g.fillStyle = "#808080"; g.fillRect(0, 0, w, w); for (let i = 0; i < 1800; i++) { const v = 110 + q() * 40; g.fillStyle = `rgba(${v},${v},${v},.25)`; g.beginPath(); g.ellipse(q() * w, q() * w, 3 + q() * 12, 2 + q() * 6, q() * 3, 0, 6.29); g.fill(); } for (let i = 0; i < 90; i++) { g.fillStyle = "rgba(60,60,60,.6)"; g.beginPath(); g.arc(q() * w, q() * w, 0.8 + q() * 1.2, 0, 6.29); g.fill(); } });
  glazeBump.wrapS = glazeBump.wrapT = THREE.RepeatWrapping; glazeBump.repeat.set(3, 2);
  const porcMat = (ex = {}) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.07, envMap: goldEnv, envMapIntensity: 0.45, bumpMap: glazeBump, bumpScale: 0.35, sheen: 0.25, sheenColor: new THREE.Color("#fff3e2"), side: THREE.DoubleSide, ...ex });
  const VESSEL = new THREE.Group(); scene.add(VESSEL);
  const vessel = add(vGeo, porcMat(), 0, 0, 0, VESSEL);
  contact(0, 0, 2.6, 2.6, 0.85);

  // cracks -> gold seams
  function crackPath(S, seed, th0, y0, n, dir, yMin, yMax) {
    const q = mulberry(seed); const P = [[th0, y0]]; let th = th0, y = y0; const drift = (q() - 0.5) * 0.5;
    for (let i = 0; i < n; i++) { y = Math.min(yMax, Math.max(yMin, y + dir * (0.06 + q() * 0.08))); th += (drift + (q() - 0.5) * 1.6) * 0.09 / Math.max(0.3, S.r(y)); P.push([th, y]); }
    return P;
  }
  function seam(S, nodes, radius, off = 0.004) {
    const pts3 = [];
    for (let i = 0; i < nodes.length - 1; i++) for (let k = 0; k < 4; k++) { const u = k / 4; pts3.push(S.at(nodes[i][0] + (nodes[i + 1][0] - nodes[i][0]) * u, nodes[i][1] + (nodes[i + 1][1] - nodes[i][1]) * u, off)); }
    const L = nodes[nodes.length - 1]; pts3.push(S.at(L[0], L[1], off));
    const curve = new Poly(pts3), tub = pts3.length * 3, rad = 6;
    const mk = (rr0, mat) => {
      const geo = new THREE.TubeGeometry(curve, tub, rr0, rad, false);
      const p = geo.attributes.position;
      for (let i = 0; i <= tub; i++) { const c = curve.getPointAt(i / tub); const u = i / tub; const f = 0.25 + 0.75 * Math.min(1, u / 0.12, (1 - u) / 0.18) * (0.85 + 0.15 * Math.sin(i * 1.7)); for (let j = 0; j <= rad; j++) { const v = i * (rad + 1) + j; tmpV.set(p.getX(v), p.getY(v), p.getZ(v)).sub(c).multiplyScalar(f).add(c); p.setXYZ(v, tmpV.x, tmpV.y, tmpV.z); } }
      const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.receiveShadow = true; return m;
    };
    return { curve, tub, rad, crack: mk(radius * 0.42, crackMat), gold: mk(radius, goldMat) };
  }
  function vein(S, parent, defs) {
    // defs: [{nodes, radius, delay}] -> growth of all branches by one progress value
    const parts = defs.map((d) => { const s = seam(S, d.nodes, d.radius); parent.add(s.crack, s.gold); return { ...s, delay: d.delay || 0 }; });
    const show = (m, s, k) => { const n = Math.floor(clamp01(k) * s.tub); m.visible = n > 0; m.geometry.setDrawRange(0, n * s.rad * 6); };
    return { parts, set(crack, gold) { for (const s of parts) { const sc = clamp01((crack - s.delay) / (1 - s.delay)), sg = clamp01((gold - s.delay) / (1 - s.delay)); show(s.crack, s, sc); show(s.gold, s, sg); } },
      tip(gold) { const s = parts[0]; return s.curve.getPointAt(clamp01(gold)); } };
  }
  const V = [];
  {
    const m1 = crackPath(VS, 11, 0.12, 2.02, 22, -1, 0.3, 2.4);
    const b1 = crackPath(VS, 12, m1[7][0], m1[7][1], 8, -1, 0.3, 2.4).map(([a, b], i) => [a + i * 0.06, b]);
    const b2 = crackPath(VS, 13, m1[14][0], m1[14][1], 6, -1, 0.3, 2.4).map(([a, b], i) => [a - i * 0.07, b]);
    const b3 = crackPath(VS, 14, m1[3][0], m1[3][1], 5, 1, 0.3, 2.42).map(([a, b], i) => [a - i * 0.05, b]);
    V.push(vein(VS, VESSEL, [{ nodes: m1, radius: 0.026 }, { nodes: b1, radius: 0.018, delay: 0.3 }, { nodes: b2, radius: 0.016, delay: 0.6 }, { nodes: b3, radius: 0.014, delay: 0.15 }]));
    const m2 = crackPath(VS, 21, -0.72, 1.86, 18, -1, 0.3, 2.4);
    const c1 = crackPath(VS, 22, m2[9][0], m2[9][1], 6, -1, 0.3, 2.4).map(([a, b], i) => [a - i * 0.07, b]);
    V.push(vein(VS, VESSEL, [{ nodes: m2, radius: 0.024 }, { nodes: c1, radius: 0.016, delay: 0.45 }]));
    const m3 = crackPath(VS, 31, 0.92, 1.55, 16, -1, 0.3, 2.4);
    const d1 = crackPath(VS, 32, m3[0][0], m3[0][1], 7, 1, 0.3, 2.43).map(([a, b], i) => [a - i * 0.04, b]);
    const d2 = crackPath(VS, 33, m3[8][0], m3[8][1], 5, -1, 0.3, 2.4).map(([a, b], i) => [a + i * 0.07, b]);
    V.push(vein(VS, VESSEL, [{ nodes: m3, radius: 0.024 }, { nodes: d1, radius: 0.017, delay: 0.1 }, { nodes: d2, radius: 0.015, delay: 0.5 }]));
  }
  // molten tip glow
  const glowTex = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(0.3, "rgba(255,200,100,.6)"); gr.addColorStop(1, "rgba(255,160,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const tips = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, transparent: true })); s.scale.setScalar(0.35); scene.add(s); return s; });

  // ---------- tags (billboarded porcelain cards) ----------
  function tag(w, h, paint, cw = 1024) {
    const ch = Math.round((cw * h) / w);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: canvasTex(cw, ch, (g, W, H) => { g.clearRect(0, 0, W, H); paint(g, W, H); }) }));
    m.renderOrder = 8; m.material.depthTest = false; scene.add(m); return m;
  }
  function card(lines, { bg = "rgba(242,239,232,.96)", fg = INK, rule = GOLD } = {}) {
    return (g, W, H) => {
      const p = H * 0.14;
      g.save(); g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = H * 0.12; g.fillStyle = bg; rr(g, p, p, W - 2 * p, H - 2 * p, H * 0.06); g.fill(); g.restore();
      g.strokeStyle = rule; g.lineWidth = H * 0.025; rr(g, p + H * 0.05, p + H * 0.05, W - 2 * p - H * 0.1, H - 2 * p - H * 0.1, H * 0.04); g.stroke();
      g.textAlign = "center"; g.textBaseline = "middle";
      const n = lines.length, ih = (H - 2 * p) / n;
      lines.forEach(([txt, font, col, k], i) => { g.fillStyle = col || fg; g.font = font(ih * (k || 0.6)); g.fillText(txt, W / 2, p + ih * (i + 0.55)); });
    };
  }
  const fS = (wgt = 700) => (s) => `${wgt} ${s}px ${SERIF}`, fM = (wgt = 600) => (s) => `${wgt} ${s}px ${MONO}`;
  function bill(m, k, scale = 1) { if (k > 0.002) { tmpV.copy(m.position).project(cam); const uy = (tmpV.y + 1) / 2; k *= (1 - smooth((uy - 0.68) / 0.06)) * smooth((uy - 0.21) / 0.05); } m.visible = k > 0.002; if (!m.visible) return; m.material.opacity = k; m.quaternion.copy(cam.quaternion); m.scale.setScalar(scale * Math.max(0.001, 0.6 + 0.4 * back(k, 1.4))); }
  const veinTags = [["1960–1965", "MASA JABATAN 1"], ["1970–1977", "MASA JABATAN 2"], ["1994–2000", "MASA JABATAN 3"]].map(([a, b]) => tag(1.25, 0.46, card([[a, fM(600), INK, 0.62], [b, fM(500), TEA, 0.46]])));

  // ---------- name card (tent) ----------
  const paperTex = (paint, w = 1024, h = 400) => canvasTex(w, h, (g, W, H) => {
    g.fillStyle = "#F4EFE4"; g.fillRect(0, 0, W, H);
    const q = mulberry(W + H); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "120,100,70" : "255,255,255"},${q() * 0.08})`; g.fillRect(q() * W, q() * H, 1 + q() * 2, 1); }
    paint(g, W, H);
  });
  const NAME = new THREE.Group(); NAME.position.set(-1.2, 0, 1.25); NAME.rotation.y = 0.3; NAME.scale.setScalar(0.82); scene.add(NAME);
  {
    const tex = paperTex((g, W, H) => {
      g.strokeStyle = GOLD; g.lineWidth = 6; g.strokeRect(22, 22, W - 44, H - 44);
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = TEA; g.font = `600 34px ${MONO}`; if ("letterSpacing" in g) g.letterSpacing = "6px"; g.fillText("CEYLON · PERDANA MENTERI", W / 2, 78);
      if ("letterSpacing" in g) g.letterSpacing = "0px";
      g.fillStyle = INK; g.font = `700 92px ${SERIF}`; g.fillText("Sirimavo", W / 2, 166);
      g.font = `700 92px ${SERIF}`; g.fillText("Bandaranaike", W / 2, 252);
      g.fillStyle = "#8a6a2a"; g.font = `500 40px ${MONO}`; g.fillText("1916 – 2000", W / 2, 334);
    });
    const face = new THREE.MeshStandardMaterial({ map: tex, color: 0xb8b0a2, roughness: 0.95 }), plain = std(0xa8a092, 0.9);
    const W2 = 1.35, H2 = 0.53, tilt = 0.32;
    const f = add(new THREE.BoxGeometry(W2, H2, 0.012), [plain, plain, plain, plain, face, plain], 0, Math.cos(tilt) * H2 / 2, Math.sin(tilt) * H2 / 2, NAME); f.rotation.x = -tilt;
    const b = add(new THREE.BoxGeometry(W2, H2, 0.012), plain, 0, Math.cos(tilt) * H2 / 2, -Math.sin(tilt) * H2 / 2, NAME); b.rotation.x = tilt;
  }
  const nameAO = contact(-1.2, 1.25, 1.6, 0.75, 0.55);

  // ---------- Ceylon dish on a small wooden stand ----------
  const PROJ = (lo, la) => [(lo - 80.7) * Math.cos(7.8 * Math.PI / 180), -(la - 7.85)];
  function dishFace(title, sub, accent) {
    return canvasTex(1024, 1024, (g, W, H) => {
      g.fillStyle = "#F2EFE8"; g.fillRect(0, 0, W, H);
      const gr = g.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.5); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(120,100,70,.18)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(212,166,58,.9)"; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H / 2, W * 0.47, 0, 6.29); g.stroke();
      g.strokeStyle = "rgba(141,21,58,.35)"; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, H / 2, W * 0.44, 0, 6.29); g.stroke();
      // sea hatching
      g.strokeStyle = "rgba(60,90,110,.16)"; g.lineWidth = 2;
      for (let y = 140; y < 700; y += 22) { g.beginPath(); for (let x = 160; x < 870; x += 10) { const yy = y + 4 * Math.sin(x * 0.05 + y); x === 160 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
      const sl = GEO.find((c) => c.name === "Sri Lanka"); const s = 128, cx = W / 2, cy = 410;
      g.beginPath();
      for (const ring of sl.rings) ring.forEach(([lo, la], i) => { const [x, y] = PROJ(lo, la); i ? g.lineTo(cx + x * s, cy + y * s) : g.moveTo(cx + x * s, cy + y * s); });
      g.closePath(); g.fillStyle = accent; g.fill(); g.strokeStyle = GOLD; g.lineWidth = 9; g.stroke();
      const [kx, ky] = PROJ(79.86, 6.93); g.fillStyle = "#F2EFE8"; g.beginPath(); g.arc(cx + kx * s, cy + ky * s, 12, 0, 6.29); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK; g.font = `700 ${title.length > 9 ? 84 : 104}px ${SERIF}`; g.fillText(title, W / 2, 776);
      g.fillStyle = "#8a6a2a"; g.font = `600 40px ${MONO}`; g.fillText(sub, W / 2, 858);
    });
  }
  const DISH = new THREE.Group(); DISH.position.set(1.72, 0, 0.62); DISH.rotation.y = -0.3; scene.add(DISH);
  const DTILT = 1.2;
  const dishFrame = new THREE.Group(); DISH.add(dishFrame);
  {
    const R = 0.74;
    const prof = [new THREE.Vector2(0.001, -0.02), new THREE.Vector2(R * 0.62, -0.02), new THREE.Vector2(R * 0.66, 0.0), new THREE.Vector2(R * 0.9, 0.05), new THREE.Vector2(R, 0.085), new THREE.Vector2(R * 0.985, 0.1), new THREE.Vector2(R * 0.88, 0.07), new THREE.Vector2(R * 0.66, 0.025), new THREE.Vector2(0.001, 0.02)];
    const dg = new THREE.LatheGeometry(prof, 96); const cc = new Float32Array(dg.attributes.position.count * 3).fill(0.95); dg.setAttribute("color", new THREE.BufferAttribute(cc, 3));
    const plate = add(dg, porcMat(), 0, 0, 0, dishFrame); plate.rotation.x = Math.PI / 2;
    const rimGold = add(new THREE.TorusGeometry(R * 0.99, 0.012, 8, 96), goldMat, 0, 0, 0.1, dishFrame);
    const fA = new THREE.MeshPhysicalMaterial({ map: dishFace("CEYLON", "NAMA LAMA SRI LANKA", MAROON), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08, envMap: goldEnv, envMapIntensity: 0.4, transparent: true });
    const fB = new THREE.MeshPhysicalMaterial({ map: dishFace("SRI LANKA", "REPUBLIK · MEI 1972", MAROON), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08, envMap: goldEnv, envMapIntensity: 0.4, transparent: true, opacity: 0 });
    var faceA = add(new THREE.CircleGeometry(R * 0.66, 72), fA, 0, 0, 0.03, dishFrame), faceB = add(new THREE.CircleGeometry(R * 0.66, 72), fB, 0, 0, 0.034, dishFrame);
    faceB.renderOrder = 2;
    const woodM = new THREE.MeshPhysicalMaterial({ map: woodTex, color: 0x6a4a34, roughness: 0.4, clearcoat: 0.6 });
    add(new THREE.BoxGeometry(0.9, 0.08, 0.36), woodM, 0, 0.04, -0.05, DISH);
    const back2 = add(new THREE.BoxGeometry(0.08, 0.95, 0.06), woodM, 0, 0.48, -0.36, DISH); back2.rotation.x = -0.32;
    add(new THREE.BoxGeometry(0.86, 0.06, 0.08), woodM, 0, 0.11, 0.1, DISH);
  }
  dishFrame.position.set(0, 0.8, -0.02); dishFrame.rotation.set(-0.3, 0, 0);
  contact(1.72, 0.62, 1.5, 0.9, 0.5);

  // ---------- cups: mother and daughter ----------
  const CUPP = [[0.17, 0.0], [0.18, 0.03], [0.165, 0.05], [0.22, 0.1], [0.29, 0.22], [0.325, 0.36], [0.335, 0.44]];
  const CS = surface(CUPP.map(([a, b]) => [a, b]));
  function cup(x, z, ry, seed, hasSeam) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    const pr = CUPP.map(([a, b]) => new THREE.Vector2(a, b));
    pr.unshift(new THREE.Vector2(0.001, 0.005)); pr.push(new THREE.Vector2(0.322, 0.452), new THREE.Vector2(0.31, 0.44));
    for (let y = 0.42; y >= 0.13; y -= 0.03) pr.push(new THREE.Vector2(Math.max(0.05, CS.r(y) - 0.03), y));
    pr.push(new THREE.Vector2(0.001, 0.12));
    const g = new THREE.LatheGeometry(pr, 96);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), rad = Math.hypot(p.getX(i), p.getZ(i)); const inner = y > 0.12 && rad < CS.r(y) - 0.015; const v = y < 0.045 && rad > 0.12 ? [0.84, 0.77, 0.65] : inner ? [0.78, 0.75, 0.7] : [0.95, 0.937, 0.91]; col.set(v, i * 3); }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const B = new THREE.Group(); B.position.y = 0.022; G.add(B);
    add(g, porcMat(), 0, 0, 0, B);
    add(new THREE.TorusGeometry(0.333, 0.009, 8, 96), goldMat, 0, 0.445, 0, B).rotation.x = Math.PI / 2;
    const h = add(new THREE.TorusGeometry(0.105, 0.026, 10, 28, Math.PI * 1.25), porcMat(), 0.36, 0.27, 0, B); h.rotation.z = -Math.PI * 0.62;
    const sp = [new THREE.Vector2(0.001, 0.0), new THREE.Vector2(0.3, 0.0), new THREE.Vector2(0.48, 0.035), new THREE.Vector2(0.53, 0.06), new THREE.Vector2(0.52, 0.068), new THREE.Vector2(0.45, 0.045), new THREE.Vector2(0.25, 0.022), new THREE.Vector2(0.001, 0.022)];
    const sg = new THREE.LatheGeometry(sp, 96); sg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(sg.attributes.position.count * 3).fill(0.94), 3));
    add(sg, porcMat(), 0, 0, 0, G);
    add(new THREE.TorusGeometry(0.525, 0.006, 6, 96), goldMat, 0, 0.064, 0, G).rotation.x = Math.PI / 2;
    let v = null;
    if (hasSeam) { v = vein(CS, B, [{ nodes: crackPath(CS, seed, 0.25, 0.42, 6, -1, 0.06, 0.43), radius: 0.011 }]); }
    contact(x, z, 1.3, 1.3, 0.6);
    return { G, v, x, z };
  }
  const MOM = cup(-0.95, 1.4, 0.5, 71, true), DAU = cup(-0.08, 1.7, 0.2, 72, false);
  const cupTags = [tag(1.3, 0.5, card([["SIRIMAVO", fS(700), INK, 0.72], ["PERDANA MENTERI", fM(600), TEA, 0.42]])), tag(1.3, 0.5, card([["CHANDRIKA", fS(700), INK, 0.72], ["PRESIDEN · 1994", fM(600), TEA, 0.42]]))];
  // gold thread from daughter to mother (she appointed her mother PM)
  const thread = (() => {
    const a = new THREE.Vector3(-0.08 - 0.3, 0.5, 1.7), b = new THREE.Vector3(-0.95 + 0.3, 0.5, 1.4);
    const c = new THREE.CubicBezierCurve3(a, a.clone().add(new THREE.Vector3(-0.1, 0.55, 0.1)), b.clone().add(new THREE.Vector3(0.1, 0.55, 0.1)), b);
    const g = new THREE.TubeGeometry(c, 80, 0.012, 6, false); const m = new THREE.Mesh(g, goldMat); scene.add(m); return { m, c, n: 80 * 6 * 6 };
  })();
  // ballot slip
  const BALLOT = new THREE.Group(); scene.add(BALLOT);
  {
    const tex = paperTex((g, W, H) => {
      g.fillStyle = INK; g.textAlign = "left"; g.textBaseline = "middle";
      g.font = `600 44px ${MONO}`; g.fillText("SURAT SUARA", 60, 70);
      g.font = `500 32px ${MONO}`; g.fillStyle = TEA; g.fillText("PEMILU · 10.10.2000", 60, 124);
      for (let i = 0; i < 3; i++) { g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(60, 180 + i * 64, 44, 44); g.fillStyle = "rgba(43,38,34,.35)"; g.fillRect(130, 196 + i * 64, 360 - i * 50, 12); }
      g.strokeStyle = MAROON; g.lineWidth = 9; g.beginPath(); g.moveTo(66, 206 + 64); g.lineTo(80, 222 + 64); g.lineTo(112, 172 + 64); g.stroke();
    }, 640, 400);
    const b = add(new THREE.BoxGeometry(0.62, 0.004, 0.39), [std(0xeee7da, 0.9), std(0xeee7da, 0.9), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }), std(0xeee7da, 0.9), std(0xeee7da, 0.9), std(0xeee7da, 0.9)], 0, 0.004, 0, BALLOT);
    b.rotation.y = 0.35;
  }

  // ---------- "janda yang menangis" paper tag hanging from the neck ----------
  const JTAG = new THREE.Group(); scene.add(JTAG);
  {
    const tex = paperTex((g, W, H) => {
      g.beginPath(); g.arc(70, H / 2, 18, 0, 6.29); g.fillStyle = "#c9bca5"; g.fill();
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK; g.font = `italic 700 66px ${SERIF}`;
      g.fillText("“janda yang", W / 2 + 40, 120); g.fillText("menangis”", W / 2 + 40, 196);
      g.fillStyle = TEA; g.font = `500 30px ${MONO}`; g.fillText("JULUKAN DARI LAWAN POLITIK", W / 2 + 30, 300);
    }, 760, 380);
    const shape = new THREE.Shape(); const w = 1.35, h = 0.68, c = 0.16;
    shape.moveTo(-w / 2 + c, -h / 2); shape.lineTo(w / 2, -h / 2); shape.lineTo(w / 2, h / 2); shape.lineTo(-w / 2 + c, h / 2); shape.lineTo(-w / 2, h / 2 - c); shape.lineTo(-w / 2, -h / 2 + c); shape.closePath();
    const sg = new THREE.ShapeGeometry(shape); const uv = sg.attributes.uv, pp = sg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pp.getX(i) + w / 2) / w, (pp.getY(i) + h / 2) / h);
    const m = add(sg, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide, transparent: true }), 0, 0, 0, JTAG);
    m.name = "card";
  }
  const jString = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 1, 0)), 1, 0.006, 5), std(0x8a6a3a, 0.8)); scene.add(jString);

  // ---------- AUDIRA plaque ----------
  const PLAQ = new THREE.Group(); PLAQ.position.set(1.7, 2.05, SZ + 0.04); scene.add(PLAQ);
  {
    add(new THREE.BoxGeometry(1.02, 0.24, 0.04), goldMat, 0, 0, 0, PLAQ);
    const pt = canvasTex(1024, 140, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#b8862c"); gr.addColorStop(0.5, "#f0cf7a"); gr.addColorStop(1, "#a87a24"); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = "#3a2810"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 92px ${SERIF}`; if ("letterSpacing" in g) g.letterSpacing = "28px"; g.fillText("AUDIRA", W / 2 + 14, H * 0.56); });
    const pl = add(new THREE.BoxGeometry(0.8, 0.11, 0.01), [goldMat, goldMat, goldMat, goldMat, new THREE.MeshStandardMaterial({ map: pt, metalness: 0.9, roughness: 0.3, envMap: goldEnv, envMapIntensity: 1.2 }), goldMat], 0, 0, 0.026, PLAQ);
    pl.scale.set(1.15, 1.6, 1);
  }

  // ---------- dust in the key beam ----------
  const NDUST = 160, DQ = mulberry(99);
  const DB = Array.from({ length: NDUST }, () => ({ x: -3 + DQ() * 6, y: 0.3 + DQ() * 4.5, z: -1 + DQ() * 4, ph: DQ() * 6.28, s: 0.5 + DQ() }));
  const DUST = pts(scene, NDUST, { color: 0xffe2b0, size: 0.035, opacity: 0.55 });

  // ---------- camera: one track per scene; cuts at scene starts ----------
  // pose: az, el, dist, tx, ty, tz
  const SH = [
    ["s1", track([[K.s1 - 0.1, 0.26, 0.24, 13.2, 0.15, 1.3, 0.3], [A("s1:Sri") + 0.5, 0.08, 0.25, 12.3, 0.15, 1.25, 0.3], [K.s1e, 0.05, 0.25, 12.2, 0.15, 1.25, 0.3]])],
    ["s2", track([[K.s2, -0.05, 0.2, 5.4, -1.45, 0.62, 1.0], [A("s2:Ceylon") - 0.5, 0.06, 0.22, 5.0, -1.45, 0.62, 1.0], [A("s2:Ceylon") + 1.6, -0.05, 0.22, 5.4, 1.62, 0.8, 0.5], [A("s2:penasihat") - 0.3, 0.02, 0.22, 5.6, 1.6, 0.8, 0.5], [A("s2:penasihat") + 2.2, 0.12, 0.18, 10.5, 0, 1.3, 0.4], [K.s2e, 0.2, 0.18, 10.3, 0, 1.3, 0.4]])],
    ["s3", track([[K.s3, -0.02, 0.1, 8.6, 0.1, 1.35, 0], [A("s3:1959") + 1.0, 0.08, 0.08, 7.0, 0.1, 1.3, 0], [K.s3e, 0.14, 0.08, 6.6, 0.12, 1.3, 0]])],
    ["s4", track([[K.s4, 0.2, 0.05, 5.4, 0.2, 1.25, 0.3], [A("s4:Juli") + 0.6, 0.16, 0.06, 5.0, 0.18, 1.25, 0.3], [A("s4:pertama") - 0.2, 0.08, 0.14, 9.5, 0, 1.55, 0], [K.s4e, -0.02, 0.15, 10.0, 0, 1.6, 0]])],
    ["s5", track([[K.s5, -0.12, 0.1, 10.6, 0.25, 2.7, -0.4], [K.s5e, 0.04, 0.08, 10.3, 0.1, 2.85, -0.6]])],
    ["s6", track([[K.s6, -0.62, 0.14, 8.6, 0, 1.25, 0], [A("s6:2000") + 0.2, 0.72, 0.16, 8.6, 0, 1.25, 0], [A("s6:1972") - 0.4, 0.5, 0.2, 6.4, 1.3, 0.85, 0.4], [K.s6e, 0.42, 0.22, 5.8, 1.55, 0.85, 0.5]])],
    ["s7", track([[K.s7, 0.1, 0.28, 6.6, -0.6, 0.5, 1.8], [A("s7:mengangkat"), 0.02, 0.32, 6.0, -0.65, 0.5, 1.9], [A("s7:Oktober") - 0.3, -0.18, 0.3, 5.4, -1.0, 0.45, 1.9], [K.s7e, -0.24, 0.3, 5.6, -1.0, 0.45, 1.9]])],
    ["s8", track([[K.s8, 0.02, 0.24, 11.0, 0, 1.35, 0.5], [K.end, 0.14, 0.34, 14.0, 0, 0.6, 0.6], [K.dur, 0.16, 0.34, 14.6, 0, 0.6, 0.6]])],
  ];
  const sceneAt = (t) => { let s = SH[0]; for (const x of SH) if (t >= K[x[0]] - 0.001) s = x; return s; };

  const lastFrame = { t: -1 };
  return function draw(t) {
    lastFrame.t = t;
    const [sid, tr] = sceneAt(t);
    let [az, el, dist, tx, ty, tz] = tr(t);
    // crack jolt (camera only, tiny)
    const tc = A("s3:1959");
    if (t > tc && t < tc + 1.2) { const k = Math.exp(-(t - tc) * 5) * 0.04; tx += Math.sin(t * 71) * k; ty += Math.sin(t * 53 + 1) * k; }
    cam.position.set(tx + dist * Math.sin(az) * Math.cos(el), ty + dist * Math.sin(el), tz + dist * Math.cos(az) * Math.cos(el));
    cam.lookAt(tx, ty, tz);

    // light mood: dim and cooler after the crack, warm again with the gold
    const dim = t >= K.s3 && t < K.s4 + 1 ? smooth((t - tc + 0.2) / 0.8) * (1 - smooth((t - A("s4:Juli")) / 1.5)) : 0;
    key.intensity = 150 * (1 - 0.42 * dim); key.color.setRGB(1, 0.86 - 0.08 * dim, 0.69 + 0.12 * dim);
    hemi.intensity = 0.35 * (1 - 0.3 * dim);

    NAME.visible = nameAO.visible = t < K.s3;
    // vein states [crack, gold]
    const st = [[0, 0], [0, 0], [0, 0]];
    const flash = t < K.s2 ? 1 : 0; // s1 shows the finished piece
    if (flash) st.forEach((s, i) => { const g = smooth((t - 0.05 - i * 0.12) / 1.1); s[0] = 1; s[1] = g; });
    else {
      if (t >= K.s3) st[0][0] = smooth((t - tc + 0.05) / 0.75);
      if (t >= K.s4) st[0][1] = clamp01((t - A("s4:Juli") + 0.2) / Math.max(1.2, A("s4:pertama") - A("s4:Juli")));
      const t2 = A("s6:tiga") + 0.25, t3 = A("s6:2000") - 0.5;
      if (t >= K.s6) { st[1][0] = smooth((t - t2 + 0.5) / 0.5); st[1][1] = clamp01((t - t2) / 1.3); st[2][0] = smooth((t - t3 + 0.5) / 0.5); st[2][1] = clamp01((t - t3) / 1.3); }
    }
    V.forEach((v, i) => v.set(st[i][0], st[i][1]));
    // flowing tips
    V.forEach((v, i) => { const g = st[i][1]; const sp = tips[i]; const on = g > 0.01 && g < 0.995; sp.visible = on; if (on) { sp.position.copy(v.tip(g)); sp.material.opacity = 0.9 * Math.sin(Math.PI * g) ** 0.3; sp.scale.setScalar(0.28 + 0.06 * Math.sin(t * 20)); } });
    // gold pulse on milestone words
    const pulse = Math.max(t >= K.s4 ? win(t, A("s4:pertama") - 0.2, A("s4:pertama") + 0.8, 0.3, 0.8) : 0, t >= K.s8 ? win(t, A("s8:sejarah") - 0.3, A("s8:sejarah") + 1.2, 0.4, 1.0) : 0, t < 2 ? win(t, 0.9, 1.4, 0.3, 0.8) : 0);
    goldMat.emissiveIntensity = 0.3 + 0.9 * pulse;

    // words on the screen
    {
      let k = 0, wipe = 0;
      if (t < K.s2) { k = 1 - smooth((t - K.s1e + 0.1) / 0.3); wipe = smooth((t - 0.1) / 1.2); }
      else if (t >= K.s5 && t < K.s6) { const a = A("s5:stateswoman") - 0.15; k = t >= a ? 1 : 0; wipe = smooth((t - a) / 0.9); }
      else if (t >= K.s8) { const a = A("s8:sejarah") - 0.4; k = t >= a ? 1 - smooth((t - A("s8:Menurut") + 0.3) / 0.4) : 0; wipe = smooth((t - a) / 1.0); }
      W_STATESWOMAN.G.position.y = t >= K.s5 && t < K.s6 ? 3.62 : (t < K.s2 ? 2.7 : 2.82);
      W_STATESWOMAN.set(k, wipe, 1 + 0.3 * pulse);
      const kS = t >= K.s5 && t < K.s6 ? clamp01((t - A("s5:Pers") + 0.2) / 0.3) : 0;
      W_STATESMAN.set(kS, kS > 0 ? smooth((t - A("s5:Pers") + 0.2) / 0.9) : 0);
      const ks = t >= K.s5 && t < K.s6 ? smooth((t - A("s5:berarti") - 0.3) / 0.6) : 0;
      strike.visible = ks > 0.002; strike.scale.set(Math.max(0.001, 2.9 * ks), 1, 1); strike.position.x = -1.45 + 1.45 * ks; strike.rotation.z = -0.03;
    }
    // janda tag on the neck (s5)
    {
      const k = t >= K.s5 && t < K.s6 ? win(t, A("s5:janda") - 0.3, K.s6 - 0.1, 0.5, 0.2) : 0;
      JTAG.visible = jString.visible = k > 0.002;
      if (JTAG.visible) {
        const sw = 0.08 * Math.sin(t * 1.7) * (0.4 + 0.6 * (1 - eout(clamp01((t - A("s5:janda") + 0.3) / 1.5))));
        const top = VS.at(0.75, 2.2, 0.01);
        const drop = 0.25 + 0.35 * eout(k);
        JTAG.position.set(top.x + 0.85 + sw, top.y + 0.12 - 0.12 * eout(k), top.z + 0.45);
        JTAG.rotation.set(0, 0.55 - 0.18, sw * 0.8);
        JTAG.children[0].material.opacity = clamp01(k * 1.5);
        const tp = new THREE.Vector3(-0.6, 0.3, 0).applyEuler(JTAG.rotation).add(JTAG.position);
        jString.position.copy(top); const d = tp.clone().sub(top); jString.scale.set(1, d.length(), 1); jString.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      }
    }
    // three-term vein tags (s6)
    {
      const anchors = [[0.12, 1.4], [-0.72, 1.3], [0.92, 1.05]];
      const ta = [A("s6:tiga") - 0.2, A("s6:tiga") + 0.6, A("s6:2000") - 0.2];
      veinTags.forEach((m, i) => { const k = t >= K.s6 && t < K.s7 ? win(t, ta[i], A("s6:1972") - 0.7, 0.35, 0.3) : 0; const p = VS.at(anchors[i][0], anchors[i][1], 0.45); m.position.copy(p); tmpV.copy(p).project(cam); tmpV.x = Math.max(-0.5, Math.min(0.5, tmpV.x)); m.position.copy(tmpV.unproject(cam)); bill(m, k, 0.9); });
    }
    // dish label: Ceylon -> Republik Sri Lanka 1972
    {
      const kB = t >= K.s6 && t < K.s7 ? smooth((t - A("s6:Republik") + 0.4) / 0.6) : t >= K.s7 ? 1 : 0;
      faceB.material.opacity = kB;
    }
    // cups slide in (s7), stay for s8
    {
      const slide = (o, a) => { const k = t >= K.s7 ? eout(clamp01((t - a) / 1.0)) : 0; o.G.visible = k > 0.001; o.G.position.x = o.x - (1 - k) * 3.2; return k; };
      const km = slide(MOM, K.s7 + 0.05), kd = slide(DAU, A("s7:Chandrika") - 0.5);
      if (MOM.v) { const g = t >= K.s7 ? clamp01((t - K.s7 - 0.8) / 1.0) : 0; MOM.v.set(g > 0 ? 1 : 0, g); }
      const tagK = [t >= K.s7 && t < K.s8 ? win(t, K.s7 + 0.9, A("s7:Oktober") - 0.2, 0.35, 0.25) : 0, t >= K.s7 && t < K.s8 ? win(t, A("s7:Chandrika"), A("s7:Oktober") - 0.2, 0.35, 0.25) : 0];
      cupTags[0].position.set(MOM.G.position.x - 0.1, 0.92, MOM.z); bill(cupTags[0], tagK[0] * km, 0.85);
      cupTags[1].position.set(DAU.G.position.x - 0.12, 0.92, DAU.z); bill(cupTags[1], tagK[1] * kd, 0.85);
      const kt = t >= K.s7 ? smooth((t - A("s7:mengangkat") + 0.1) / 1.1) : 0;
      thread.m.visible = kt > 0.01; thread.m.geometry.setDrawRange(0, Math.floor(kt * 80) * 36);
      const kb = t >= K.s7 ? eout(clamp01((t - A("s7:suara") + 0.6) / 0.8)) : 0;
      BALLOT.visible = kb > 0.002 && t < K.s8; BALLOT.position.set(-1.95, 0, 2.4 + (1 - kb) * 1.2);
    }
    // dust
    for (let i = 0; i < NDUST; i++) { const b = DB[i]; DUST.pos[i * 3] = b.x + 0.25 * Math.sin(t * 0.13 * b.s + b.ph); DUST.pos[i * 3 + 1] = b.y + 0.3 * Math.sin(t * 0.09 * b.s + b.ph * 2); DUST.pos[i * 3 + 2] = b.z + 0.2 * Math.cos(t * 0.11 * b.s + b.ph); const f = 0.4 + 0.6 * Math.sin(t * 0.7 + b.ph) ** 2; DUST.col[i * 3] = f; DUST.col[i * 3 + 1] = 0.85 * f; DUST.col[i * 3 + 2] = 0.6 * f; }
    DUST.commit();
    comp.render();
  };
}
