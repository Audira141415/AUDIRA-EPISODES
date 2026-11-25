// EP49 NAYPYIDAW: URBANFORGE. A white plaster architectural maquette of Naypyidaw on a dark plinth in a dark exhibition
// room. Model is matter (matte white), data is light (cyan / amber projections). The golden Uppatasanti-like pagoda is the
// only strong colour on the model; one tiny red car drives the empty 20-lane boulevard. A moving sun (east to west over
// the film) rakes long sharp shadows across the lanes.
// World layout (units, y up, north = -z):
//   plate x[-24,24] z[-50,50], boulevard x[-3.5,3.5] (20 lanes + flower median), cross streets z=-26,-2,22,
//   roundabouts at (0,-26) and (0,22), sign gantry at z=6 (NAYPYIDAW / AUDIRA), pagoda terrace at (0,-41),
//   14 government blocks (12 ministries with colonnades + parliament + hall), staff housing in the outer zone,
//   construction district east x[14,22] z[24,44] (rises with 2 cranes in s3),
//   site-plan board (Myanmar map) rising behind the north edge at z=-62 (s2),
//   closed military compound on its own plinth x[-46,-34] z[-18,-2] with a tunnel section on its south face (s7),
//   brass plaque on the plinth front (AUDIRA).
// Everything is a function of t.

const FONTS = ['700 80px "Space Grotesk"', '500 80px "Space Grotesk"', '700 80px "JetBrains Mono"', '500 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "NAYPYIDAW AUDIRA 320 KM"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { GEO } from "./geo.js";

const SG = '"Space Grotesk", Arial, sans-serif', MONO = '"JetBrains Mono", Consolas, monospace';
const ENV = 0.3; // memory says 0.55; lowered after voiced-draft review (white maquette washed out)
const WHITE = "#E8E5DE", CONC = "#CFCAC0", SHBLUE = "#8796B0", GOLD = "#D4A63A", RED = "#C0392B", GREEN = "#7FA36B";
const CYAN = "#3FD8EA", AMBER = "#FFB627";

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

// merge non-indexed position+normal geometries (no addons needed)
function merge(gs) {
  let n = 0; const P0 = [], N0 = [];
  for (const g0 of gs) { const g = g0.index ? g0.toNonIndexed() : g0; P0.push(g.attributes.position.array); N0.push(g.attributes.normal.array); n += g.attributes.position.count; }
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3); let o = 0;
  P0.forEach((p, i) => { P.set(p, o); N.set(N0[i], o); o += p.length; });
  const G = new THREE.BufferGeometry(); G.setAttribute("position", new THREE.BufferAttribute(P, 3)); G.setAttribute("normal", new THREE.BufferAttribute(N, 3));
  return G;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function seg(a, b, w, d = w) {
  const L = a.distanceTo(b), g = new THREE.BoxGeometry(w, L, d);
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, V(1, 1, 1)));
  return g;
}
// generic standing figure, height 1, facing -z: shoulders wider than hips, bent knees and elbows
function figureGeo() {
  const gs = [];
  for (const s of [-1, 1]) {
    gs.push(seg(V(s * 0.062, 0.49, 0), V(s * 0.068, 0.27, -0.04), 0.078));
    gs.push(seg(V(s * 0.068, 0.27, -0.04), V(s * 0.07, 0.04, 0), 0.07));
    const f = new THREE.BoxGeometry(0.075, 0.045, 0.13); f.translate(s * 0.07, 0.022, -0.03); gs.push(f);
    gs.push(seg(V(s * 0.13, 0.81, 0), V(s * 0.158, 0.63, 0.02), 0.06));
    gs.push(seg(V(s * 0.158, 0.63, 0.02), V(s * 0.15, 0.5, -0.06), 0.055));
  }
  const pel = new THREE.BoxGeometry(0.18, 0.09, 0.11); pel.translate(0, 0.5, 0); gs.push(pel);
  const tor = new THREE.CylinderGeometry(0.17, 0.115, 0.32, 4, 1); tor.rotateY(Math.PI / 4); tor.scale(1, 1, 0.6); tor.translate(0, 0.68, 0); gs.push(tor);
  const nk = new THREE.CylinderGeometry(0.035, 0.04, 0.06, 6); nk.translate(0, 0.86, 0); gs.push(nk);
  return merge(gs);
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0d1118, exp: 1.0, bloom: [0.08, 0.4, 1.4], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.84;
  r.shadowMap.type = THREE.PCFShadowMap;
  bp.threshold = 2.2; bp.strength = 0.05; bp.radius = 0.35;
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#26303F"); gr.addColorStop(0.55, "#121821"); gr.addColorStop(1, "#06080C"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.FogExp2(0x121821, 0.0032);
  const pm = new THREE.PMREMGenerator(r);
  const envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = ENV; // r186: scene.environment ignores material.envMapIntensity; gold/brass get envTex below

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0x9fb0d4, 0x2c313c, 0.26); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd9ac, 3.4);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { near: 1, far: 420 });
  sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.02; sun.shadow.radius = 1.4;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x9fb2d8, 0.25); fill.position.set(-60, 40, -30); scene.add(fill);

  // ---------- textures + materials ----------
  const labels = [];
  const label = (w, h, paint) => { const tx = canvasTex(w, h, paint); labels.push([tx, paint]); return tx; };
  const plasterT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); const q = mulberry(5); for (let i = 0; i < 9000; i++) { const v = 100 + q() * 60; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 2); } }, [8, 8]);
  plasterT.colorSpace = THREE.NoColorSpace;
  const plaster = (col = WHITE, rough = 0.86) => new THREE.MeshStandardMaterial({ color: col, roughness: rough, bumpMap: plasterT, bumpScale: 0.25, emissive: 0x000000 });
  const facadeSrc = (g, w, h) => {
    g.fillStyle = "#EAE7E0"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) {
      g.fillStyle = "#DAD6CD"; g.fillRect(0, y + 58, w, 6);
      for (let x = 6; x < w; x += 32) { g.fillStyle = "#E4E0D8"; g.fillRect(x, y + 14, 20, 36); g.fillStyle = "#D2CEC5"; g.fillRect(x, y + 14, 20, 3); }
    }
  };
  const facadeT = canvasTex(256, 256, facadeSrc);
  const facadeMat = (w, h) => {
    const t = facadeT.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(Math.max(1, Math.round(w / 1.1)), Math.max(1, Math.round(h / 0.62))); t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: 0xffffff, map: t, bumpMap: t, bumpScale: 0.6, roughness: 0.84, emissive: 0x000000 });
  };
  const goldM = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.26, envMap: envTex, envMapIntensity: 1.6, clearcoat: 0.3 });
  const brassM = (map) => new THREE.MeshStandardMaterial({ color: 0xc9a25a, map, metalness: 0.85, roughness: 0.34, envMap: envTex, envMapIntensity: 1.1 });
  const sh = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; return m; };
  const add = (geo, mat, x, y, z, p = scene, cast = true) => { const m = sh(new THREE.Mesh(geo, mat), cast); m.position.set(x, y, z); p.add(m); return m; };
  const aoT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(40,48,66,.75)"); gr.addColorStop(0.55, "rgba(40,48,66,.35)"); gr.addColorStop(1, "rgba(40,48,66,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const aoMat = new THREE.MeshBasicMaterial({ map: aoT, transparent: true, opacity: 0.55, depthWrite: false });
  const ao = (x, z, w, d, y = 0.016, p = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), aoMat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; p.add(m); return m; };
  const glow = (col, op = 0.85) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const roundRect = (w, h, rr) => { const s = new THREE.Shape(), a = w / 2, b = h / 2; s.moveTo(-a + rr, -b); s.lineTo(a - rr, -b); s.quadraticCurveTo(a, -b, a, -b + rr); s.lineTo(a, b - rr); s.quadraticCurveTo(a, b, a - rr, b); s.lineTo(-a + rr, b); s.quadraticCurveTo(-a, b, -a, b - rr); s.lineTo(-a, -b + rr); s.quadraticCurveTo(-a, -b, -a + rr, -b); return s; };
  const slab = (w, h, d, rr = 0.1, bev = 0.04) => { const g = new THREE.ExtrudeGeometry(roundRect(w, h, rr), { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 5 }); g.translate(0, 0, -d / 2); return g; };

  // ---------- room, plinth, plate ----------
  add(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x10141b, roughness: 0.55, metalness: 0.1 }), 0, -7, 0, scene, false);
  const plinthM = new THREE.MeshStandardMaterial({ color: 0x232830, roughness: 0.5, metalness: 0.15 });
  { const g = slab(51.2, 101.2, 6.6, 0.3, 0.12); g.rotateX(Math.PI / 2); add(g, plinthM, 0, -3.8, 0); }
  const plateM = plaster(WHITE, 0.9);
  add(new THREE.BoxGeometry(48.4, 0.5, 100.4), plateM, 0, -0.25, 0);
  // museum floor glow under the plinth
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(90, 150).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: aoT, transparent: true, opacity: 0.9, depthWrite: false })); m.position.set(0, -6.98, 0); scene.add(m); }

  // ---------- roads ----------
  const LANES = 20, BW = 7, MED = 0.7, LW = (BW - MED) / LANES;
  const laneX = (i) => (i < 10 ? -BW / 2 + LW * (i + 0.5) : MED / 2 + LW * (i - 10 + 0.5));
  const roadT = canvasTex(896, 896, (g, w, h) => {
    const px = w / BW;
    g.fillStyle = "#CDC8BF"; g.fillRect(0, 0, w, h);
    const q = mulberry(9); for (let i = 0; i < 14000; i++) { g.fillStyle = q() < 0.5 ? "rgba(255,255,255,.18)" : "rgba(90,90,100,.07)"; g.fillRect(q() * w, q() * h, 1.5, 1.5); }
    g.fillStyle = "#FBFAF6";
    for (let i = 1; i < 10; i++) for (const side of [0, 1]) {
      const x = (side ? (BW / 2 + MED / 2) : 0) * px + i * LW * px;
      for (let y = 0; y < h; y += 0.9 * px) g.fillRect(x - 2, y, 4, 0.45 * px);
    }
    for (const x of [0.06 * px, (BW / 2 - MED / 2 - 0.06) * px, (BW / 2 + MED / 2 + 0.06) * px, (BW - 0.06) * px]) g.fillRect(x - 3, 0, 6, h);
  }, [1, 12]);
  const roadM = new THREE.MeshStandardMaterial({ map: roadT, roughness: 0.92 });
  add(new THREE.PlaneGeometry(BW, 84).rotateX(-Math.PI / 2), roadM, 0, 0.01, 8, scene, false);
  const crossT = canvasTex(512, 64, (g, w, h) => { g.fillStyle = "#CDC8BF"; g.fillRect(0, 0, w, h); g.fillStyle = "#FBFAF6"; for (let x = 0; x < w; x += 40) g.fillRect(x, h / 2 - 2, 22, 4); g.fillRect(0, 3, w, 3); g.fillRect(0, h - 6, w, 3); }, [10, 1]);
  const crossM = new THREE.MeshStandardMaterial({ map: crossT, roughness: 0.92 });
  const CROSS = [-26, -2, 22];
  for (const z of CROSS) add(new THREE.PlaneGeometry(48, 2.6).rotateX(-Math.PI / 2), crossM, 0, 0.012, z, scene, false);
  // lawns beside the boulevard and the median flower bed
  const lawnM = plaster("#E3E8DA", 0.95), bedM = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.95 });
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(1.9, 0.04, 82), lawnM, s * 4.45, 0.02, 9, scene, false);
  const medSegs = [[-23.8, -4.2], [0.2, 19.8], [24.2, 48]];
  for (const [a, b] of medSegs) { const m = add(new THREE.BoxGeometry(MED - 0.08, 0.1, b - a), plaster(WHITE), 0, 0.05, (a + b) / 2); add(new THREE.BoxGeometry(MED - 0.2, 0.03, b - a - 0.1), bedM, 0, 0.115, (a + b) / 2, scene, false); void m; }
  // roundabouts
  for (const z of [-26, 22]) {
    add(new THREE.CylinderGeometry(2.1, 2.15, 0.12, 48), plaster(WHITE), 0, 0.06, z);
    add(new THREE.CylinderGeometry(1.88, 1.88, 0.04, 48), bedM, 0, 0.13, z, scene, false);
    const q = mulberry(z + 99);
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 6, 5), plaster("#F7F4EE"), 60); const m4 = new THREE.Matrix4();
    for (let i = 0; i < 60; i++) { const a = q() * 6.283, rr = 0.6 + q() * 1.15; m4.makeTranslation(Math.cos(a) * rr, 0.17, z + Math.sin(a) * rr); fl.setMatrixAt(i, m4); }
    fl.castShadow = true; scene.add(fl);
    add(new THREE.CylinderGeometry(0.55, 0.7, 0.25, 24), plaster(WHITE), 0, 0.27, z);
    add(new THREE.CylinderGeometry(0.1, 0.2, 0.55, 12), plaster(WHITE), 0, 0.65, z);
    ao(0, z, 6, 6);
  }

  // ---------- trees ----------
  const TREES = [];
  for (const s of [-1, 1]) for (const xo of [3.95, 4.95]) for (let z = -32; z <= 48; z += 1.45) {
    if (CROSS.some((c) => Math.abs(z - c) < 1.9)) continue;
    TREES.push([s * xo, z + (xo > 4.5 ? 0.7 : 0)]);
  }
  for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283; TREES.push([Math.cos(a) * 8.3, -41 + Math.sin(a) * 8.3]); }
  const treeM = plaster("#DCE4D2", 0.95);
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.3, 1), treeM, TREES.length);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.045, 0.4, 5), plaster(WHITE), TREES.length);
  { const m4 = new THREE.Matrix4(); TREES.forEach(([x, z], i) => { m4.makeTranslation(x, 0.62, z); crowns.setMatrixAt(i, m4); m4.makeTranslation(x, 0.2, z); trunks.setMatrixAt(i, m4); }); }
  crowns.castShadow = trunks.castShadow = true; crowns.receiveShadow = true; scene.add(crowns, trunks);

  // ---------- buildings ----------
  const GOV = []; // {G, mats, x, z, h}
  const gov = (x, z, w, d, h, o = {}) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const side = facadeMat(Math.max(w, d), h), top = plaster(WHITE);
    const mats = [side, side, top, top, side, side];
    add(new THREE.BoxGeometry(w, h, d), mats, 0, h / 2, 0, G);
    // tiered roof
    add(new THREE.BoxGeometry(w + 0.25, 0.2, d + 0.25), top, 0, h + 0.1, 0, G);
    add(new THREE.BoxGeometry(w * 0.66, 0.34, d * 0.6), top, 0, h + 0.37, 0, G);
    add(new THREE.BoxGeometry(w * 0.66 + 0.2, 0.08, d * 0.6 + 0.2), top, 0, h + 0.56, 0, G);
    add(new THREE.BoxGeometry(w * 0.34, 0.3, d * 0.26), top, 0, h + 0.75, 0, G);
    // colonnade facing the boulevard (or +z)
    if (o.col !== undefined) {
      const fx = o.col; // -1 or 1: face direction along x
      const n = Math.floor((d - 0.6) / 0.42), gs = [];
      for (let i = 0; i <= n; i++) { const c = new THREE.CylinderGeometry(0.07, 0.08, h * 0.78, 10); c.translate(fx * (w / 2 + 0.32), h * 0.39, -d / 2 + 0.3 + i * 0.42); gs.push(c); }
      add(merge(gs), top, 0, 0, 0, G);
      add(new THREE.BoxGeometry(0.75, 0.14, d - 0.1), top, fx * (w / 2 + 0.3), h * 0.78 + 0.07, 0, G);
      add(new THREE.BoxGeometry(0.9, 0.12, d + 0.1), top, fx * (w / 2 + 0.35), 0.06, 0, G);
    }
    if (o.towers) for (const [tx, tz] of o.towers) { let y = h + 0.2, s = 1.1; for (let k = 0; k < 6; k++) { add(new THREE.BoxGeometry(s, 0.28, s), top, tx, y + 0.14, tz, G); y += 0.3; s *= 0.78; } add(new THREE.ConeGeometry(0.12, 0.7, 8), top, tx, y + 0.35, tz, G); }
    ao(x, z, w + 1.6, d + 1.6);
    GOV.push({ G, mats: [side, top], x, z, h });
    return G;
  };
  for (const s of [-1, 1]) {
    gov(s * 9, -19, 7, 8, 2.8, { col: -s }); gov(s * 9, -9.5, 7, 8, 3.2, { col: -s });
    gov(s * 9, 5, 7, 8, 3.5, { col: -s }); gov(s * 9, 15, 7, 8, 2.6, { col: -s });
    gov(s * 9, 30, 7, 8, 3.0, { col: -s }); gov(s * 9, 41, 7, 9, 2.4, { col: -s });
  }
  gov(-14, -41, 13, 12, 2.6, { towers: [[-4, 0], [0, 0], [4, 0]] }); // parliament
  gov(14, -41, 12, 11, 2.0, { towers: [[0, 0]] });
  // staff housing (outer zone)
  const HOUSE = [];
  { const q = mulberry(21);
    for (const s of [-1, 1]) for (const xo of [15.6, 19.9]) for (let z = -28.5; z < 48; z += 3.1) {
      if (CROSS.some((c) => Math.abs(z - c) < 2.7)) continue;
      if (s > 0 && z > 23.5) continue; // construction district
      if (z < -29) continue;
      HOUSE.push([s * xo, z, 3.2, 2.1, 0.7 + q() * 0.9]);
    } }
  { const hm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), [facadeMat(3, 1), facadeMat(3, 1), plaster(WHITE), plaster(WHITE), facadeMat(3, 1), facadeMat(3, 1)], HOUSE.length);
    const m4 = new THREE.Matrix4();
    HOUSE.forEach(([x, z, w, d, h], i) => { m4.compose(V(x, h / 2, z), new THREE.Quaternion(), V(w, h, d)); hm.setMatrixAt(i, m4); ao(x, z, w + 1, d + 1); });
    hm.castShadow = hm.receiveShadow = true; scene.add(hm); }

  // construction district (rises in s3)
  const CON = [[15.6, 26.6, 3.2, 4, 2.2], [20, 26.6, 3.2, 4, 3.0], [15.6, 32.6, 3.2, 4, 3.4], [20, 32.6, 3.2, 4, 2.6], [15.6, 41, 3.2, 4.4, 2.8], [20, 41, 3.2, 4.4, 2.0]];
  const conG = CON.map(([x, z, w, d, h]) => {
    add(new THREE.BoxGeometry(w + 0.3, 0.04, d + 0.3), plaster("#DCD8CF"), x, 0.02, z, scene, false);
    const side = facadeMat(w, h);
    const m = add(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), [side, side, plaster(WHITE), plaster(WHITE), side, side], x, 0, z);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.08, h + 0.04, d + 0.08).translate(0, h / 2, 0)), new THREE.LineBasicMaterial({ color: 0x8c96a6, transparent: true }));
    e.position.set(x, 0, z); scene.add(e);
    // scaffold floor lines
    const fl = []; for (let y = 0.6; y < h; y += 0.6) fl.push(-w / 2 - 0.05, y, -d / 2 - 0.05, w / 2 + 0.05, y, -d / 2 - 0.05, w / 2 + 0.05, y, -d / 2 - 0.05, w / 2 + 0.05, y, d / 2 + 0.05);
    const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(fl, 3)); e.add(new THREE.LineSegments(fg, e.material));
    ao(x, z, w + 1, d + 1);
    return { m, e, h };
  });
  // tower cranes
  const latT = canvasTex(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 6; g.strokeRect(3, 0, w - 6, h); g.lineWidth = 4; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(3, y); g.lineTo(w - 3, y + 32); g.lineTo(3, y + 64); g.stroke(); } }, [1, 6]);
  const latM = new THREE.MeshStandardMaterial({ color: 0xeceae4, map: latT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 });
  const crane = (x, z, H, L, a0) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    add(new THREE.BoxGeometry(0.6, 0.2, 0.6), plaster(CONC), 0, 0.1, 0, G);
    const mast = add(new THREE.BoxGeometry(0.2, H, 0.2), latM, 0, H / 2, 0, G);
    const J = new THREE.Group(); J.position.y = H; G.add(J);
    add(new THREE.BoxGeometry(0.34, 0.26, 0.3), plaster(WHITE), 0, 0.13, 0, J);
    const jt = latT.clone(); jt.needsUpdate = true; jt.repeat.set(1, 8);
    const jm = latM.clone(); jm.map = jt;
    add(new THREE.BoxGeometry(L, 0.16, 0.16), jm, L / 2 - 0.2, 0.35, 0, J);
    add(new THREE.BoxGeometry(L * 0.35, 0.14, 0.16), jm, -L * 0.17 - 0.2, 0.35, 0, J);
    add(new THREE.BoxGeometry(0.45, 0.35, 0.3), plaster(CONC), -L * 0.33, 0.25, 0, J);
    add(new THREE.ConeGeometry(0.1, 0.8, 4), plaster(WHITE), 0, 0.85, 0, J);
    const hookX = L * 0.62;
    const cable = add(new THREE.CylinderGeometry(0.012, 0.012, 1, 4), new THREE.MeshBasicMaterial({ color: 0x555b66 }), hookX, 0, 0, J, false);
    const hook = add(new THREE.BoxGeometry(0.16, 0.12, 0.16), plaster(CONC), hookX, 0, 0, J);
    const load = add(new THREE.BoxGeometry(0.9, 0.12, 0.5), plaster(WHITE), hookX, 0, 0, J);
    return { G, J, mast, cable, hook, load, H, a0, hookX };
  };
  const CR = [crane(18, 36.6, 6.2, 6, 2.3), crane(17.8, 45.6, 5.0, 5, 0.8)];

  // ---------- pagoda (gold, the only strong colour) ----------
  const PG = new THREE.Group(); PG.position.set(0, 0, -41); scene.add(PG);
  { const w = plaster(WHITE);
    add(new THREE.BoxGeometry(11, 0.35, 11), w, 0, 0.175, 0, PG); add(new THREE.BoxGeometry(8.6, 0.45, 8.6), w, 0, 0.575, 0, PG); add(new THREE.BoxGeometry(6.4, 0.5, 6.4), w, 0, 1.05, 0, PG);
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { add(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 16), w, sx * 3.7, 1.05, sz * 3.7, PG); add(new THREE.ConeGeometry(0.3, 1.1, 16), goldM, sx * 3.7, 1.85, sz * 3.7, PG); }
    for (let k = 0; k < 4; k++) { const st = add(new THREE.BoxGeometry(1.8, 0.6, 1.4), w, 0, 0.3, 0, PG); st.rotation.y = (k * Math.PI) / 2; st.translateZ(5.6); st.translateY(-0.0); }
    const prof = [[0, 0], [2.7, 0], [2.7, 0.35], [2.35, 0.4], [2.35, 0.75], [2.05, 0.8], [2.05, 1.1], [1.85, 1.2], [1.92, 1.9], [1.85, 2.6], [1.65, 3.2], [1.3, 3.8], [0.95, 4.2], [0.82, 4.35], [0.82, 4.6], [0.62, 4.7], [0.62, 4.95], [0.5, 5.05], [0.46, 5.6], [0.34, 6.3], [0.22, 7.0], [0.13, 7.6], [0.07, 8.2], [0.03, 8.6], [0, 8.8]].map(([a, b]) => new THREE.Vector2(a, b));
    add(new THREE.LatheGeometry(prof, 64), goldM, 0, 1.3, 0, PG);
    for (const [y, rr] of [[6.05, 0.42], [6.55, 0.33], [7.05, 0.25]]) add(new THREE.TorusGeometry(rr, 0.035, 8, 32).rotateX(Math.PI / 2), goldM, 0, 1.3 + y, 0, PG);
    add(new THREE.SphereGeometry(0.09, 12, 10), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.05, transmission: 0.5, envMap: envTex, envMapIntensity: 2 }), 0, 10.15, 0, PG);
    ao(0, -41, 15, 15); }

  // ---------- sign gantry (AUDIRA in the world) ----------
  const signT = label(1600, 140, (g, w, h) => {
    g.fillStyle = "#F7F6F2"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#2A2F38"; g.lineWidth = 6; g.strokeRect(10, 10, w / 2 - 30, h - 20); g.strokeRect(w / 2 + 20, 10, w / 2 - 30, h - 20);
    g.fillStyle = "#2A2F38"; g.textBaseline = "middle"; g.textAlign = "center";
    g.font = `700 74px ${SG}`; g.fillText("NAYPYIDAW ↑", w / 4, h / 2 + 4);
    g.letterSpacing = "14px"; g.fillText("AUDIRA", (3 * w) / 4, h / 2 + 4);
  });
  { const G = new THREE.Group(); G.position.set(0, 0, 6); scene.add(G); const w = plaster(WHITE);
    for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.16, 1.25, 0.16), w, s * 3.75, 0.62, 0, G); add(new THREE.BoxGeometry(0.4, 0.06, 0.4), w, s * 3.75, 0.03, 0, G); }
    add(new THREE.BoxGeometry(7.8, 0.12, 0.14), w, 0, 1.25, 0, G);
    add(new THREE.BoxGeometry(7.0, 0.62, 0.06), [w, w, w, w, new THREE.MeshStandardMaterial({ map: signT, roughness: 0.6 }), w], 0, 0.88, 0.06, G); }

  // ---------- the one car ----------
  const car = new THREE.Group(); scene.add(car);
  { const cm = new THREE.MeshPhysicalMaterial({ color: RED, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    add(new THREE.BoxGeometry(0.17, 0.07, 0.4), cm, 0, 0.065, 0, car); add(new THREE.BoxGeometry(0.15, 0.06, 0.2), new THREE.MeshPhysicalMaterial({ color: 0x2a3140, roughness: 0.1, metalness: 0.3 }), 0, 0.125, 0.02, car);
    for (const [x, z] of [[0.08, 0.13], [-0.08, 0.13], [0.08, -0.13], [-0.08, -0.13]]) add(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1b1d22 }), x, 0.03, z, car);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.65).rotateX(-Math.PI / 2), aoMat); b.position.y = 0.012; car.add(b); }
  const carZ = (t) => 17 - 0.28 * t;

  // ---------- convoy trucks (s4) ----------
  const TR = [];
  for (let i = 0; i < 9; i++) { const G = new THREE.Group(); scene.add(G); const w = plaster(WHITE);
    add(new THREE.BoxGeometry(0.2, 0.2, 0.5), w, 0, 0.14, 0.08, G); add(new THREE.BoxGeometry(0.19, 0.16, 0.16), plaster("#B9BFC9"), 0, 0.12, -0.27, G);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.85).rotateX(-Math.PI / 2), aoMat); b.position.y = 0.012; G.add(b);
    TR.push({ G, x: laneX(11 + (i % 3) * 3), t0: i * 0.42 }); }

  // ---------- parade: 12.000 generic figures (s4) ----------
  const NF = 12000, FS = 0.13;
  const bodyI = new THREE.InstancedMesh(figureGeo(), new THREE.MeshStandardMaterial({ color: 0x5c684c, roughness: 0.85 }), NF);
  const headG = new THREE.SphereGeometry(0.075, 8, 6); headG.translate(0, 0.94, 0);
  const headI = new THREE.InstancedMesh(headG, new THREE.MeshStandardMaterial({ color: 0xc69a74, roughness: 0.7 }), NF);
  for (const m of [bodyI, headI]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); }

  // ---------- site-plan board: Myanmar map (s2) ----------
  const BRD = new THREE.Group(); BRD.position.set(0, 0, -95); scene.add(BRD);
  const BW2 = 11.5, BH2 = 18;
  let mapP = -1, mapQ = -1;
  const merc = (la) => Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360));
  const MB = { l0: 91.2, l1: 102.2, a0: 9.4, a1: 28.8 };
  const mapPx = (lon, lat, w, h) => { const top = 150, bot = h - 60, sc = (bot - top) / (merc(MB.a1) - merc(MB.a0)); const lw = (MB.l1 - MB.l0) * (Math.PI / 180) * sc; const x0 = (w - lw) / 2; return [x0 + (lon - MB.l0) * (Math.PI / 180) * sc, top + (merc(MB.a1) - merc(lat)) * sc]; };
  const YGN = [96.16, 16.84], NPT = [96.13, 19.76];
  const paintMap = (g, w, h) => {
    const p = Math.max(0, mapP), qq = Math.max(0, mapQ);
    g.fillStyle = "#F5F3EE"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1E232B"; g.font = `700 54px ${SG}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("MYANMAR", 46, 74);
    g.font = `500 26px ${MONO}`; g.fillStyle = "#6A7280"; g.textAlign = "right"; g.fillText("RENCANA TAPAK", w - 46, 76);
    g.fillStyle = "#1E232B"; g.fillRect(46, 112, w - 92, 3);
    g.save(); g.beginPath(); g.rect(30, 130, w - 60, h - 160); g.clip();
    g.fillStyle = "#DCE3EA"; g.fillRect(30, 130, w - 60, h - 160);
    const poly = (c) => { for (const ring of c.rings) { g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = mapPx(lo, la, w, h); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke(); } };
    g.lineJoin = "round";
    for (const c of GEO) if (c.name !== "Myanmar") { g.fillStyle = "#ECEAE4"; g.strokeStyle = "#B4B1A9"; g.lineWidth = 2; poly(c); }
    for (const c of GEO) if (c.name === "Myanmar") { g.fillStyle = "#D6D0C4"; g.strokeStyle = "#2A2F38"; g.lineWidth = 4; poly(c); }
    g.font = `500 26px ${SG}`; g.fillStyle = "#8C8A84"; g.textAlign = "center";
    for (const [n, lo, la] of [["INDIA", 92.3, 25.6], ["TIONGKOK", 100.4, 26.4], ["BANGLADESH", 91.9, 23.0], ["THAILAND", 100.6, 16.2], ["LAOS", 101.4, 20.6]]) { const [x, y] = mapPx(lo, la, w, h); g.fillText(n, x, y); }
    g.fillStyle = "#7E93A8"; g.font = `500 italic 24px ${SG}`;
    for (const [n, lo, la] of [["TELUK BENGGALA", 92.6, 17.8], ["LAUT ANDAMAN", 95.6, 12.6]]) { const [x, y] = mapPx(lo, la, w, h); g.fillText(n, x, y); }
    const [yx, yy] = mapPx(...YGN, w, h), [nx, ny] = mapPx(...NPT, w, h);
    // route (amber, projected) drawn by progress
    if (p > 0) {
      const ex = yx + (nx - yx) * p, ey = yy + (ny - yy) * p;
      g.strokeStyle = "rgba(255,182,39,.35)"; g.lineWidth = 22; g.lineCap = "round"; g.beginPath(); g.moveTo(yx, yy); g.lineTo(ex, ey); g.stroke();
      g.strokeStyle = "#E89A00"; g.lineWidth = 8; g.setLineDash([22, 14]); g.beginPath(); g.moveTo(yx, yy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
    }
    g.fillStyle = "#2A2F38"; g.beginPath(); g.arc(yx, yy, 13, 0, 7); g.fill();
    // Naypyidaw: gold star with a pulse ring
    if (qq > 0) { g.strokeStyle = `rgba(212,166,58,${0.8 * (1 - qq)})`; g.lineWidth = 6; g.beginPath(); g.arc(nx, ny, 18 + 70 * qq, 0, 7); g.stroke(); }
    g.fillStyle = GOLD; g.strokeStyle = "#5A4410"; g.lineWidth = 3; g.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 11 : 26; g.lineTo(nx + Math.cos(a) * rr, ny + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
    const pill = (txt, x, y, bg, fc, px = 30) => { g.font = `700 ${px}px ${SG}`; const tw = g.measureText(txt).width; g.fillStyle = bg; g.beginPath(); g.roundRect(x, y - px * 0.8, tw + 28, px * 1.6, 8); g.fill(); g.fillStyle = fc; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(txt, x + 14, y + 2); };
    pill("NAYPYIDAW", nx + 34, ny - 6, "#1E232B", "#F2D27A", 34);
    pill("YANGON", yx + 26, yy + 18, "#1E232B", "#FFFFFF", 30);
    if (p > 0.85) pill("320 KM", (yx + nx) / 2 - 190, (yy + ny) / 2, "#E89A00", "#1E232B", 40);
    g.restore();
    // north arrow
    g.fillStyle = "#1E232B"; g.beginPath(); g.moveTo(w - 80, 170); g.lineTo(w - 96, 214); g.lineTo(w - 80, 204); g.lineTo(w - 64, 214); g.closePath(); g.fill(); g.font = `700 24px ${SG}`; g.textAlign = "center"; g.fillText("U", w - 80, 238);
    g.strokeStyle = "#1E232B"; g.lineWidth = 6; g.strokeRect(30, 130, w - 60, h - 160);
  };
  const mapT = label(1024, 1600, paintMap);
  { const frame = add(slab(BW2 + 0.5, BH2 + 0.5, 0.3, 0.2, 0.06), new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.45, metalness: 0.3 }), 0, 0, 0, BRD);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(BW2, BH2), new THREE.MeshStandardMaterial({ map: mapT, roughness: 0.8 })); face.position.z = 0.23; face.receiveShadow = true; BRD.add(face);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.3, 14, 0.3), new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.5 }), s * 4.5, -BH2 / 2 - 7 + 0.5, -0.4, BRD);
    void frame; }

  // ---------- military compound on its own plinth (s7) ----------
  const MC = new THREE.Group(); MC.position.set(-40, 0, -10); scene.add(MC);
  { const g = slab(12.8, 16.8, 6.6, 0.25, 0.1); g.rotateX(Math.PI / 2); add(g, plinthM, 0, -3.8, 0, MC);
    add(new THREE.BoxGeometry(12.2, 0.5, 16.2), plaster(WHITE, 0.9), 0, -0.25, 0, MC);
    const wm = plaster(CONC, 0.85);
    for (const [x, z, w, d] of [[0, -7.6, 11.4, 0.18], [0, 7.6, 11.4, 0.18], [-5.6, 0, 0.18, 15.2], [5.6, -4.4, 0.18, 6.6], [5.6, 4.4, 0.18, 6.6]]) { add(new THREE.BoxGeometry(w, 0.55, d), wm, x, 0.275, z, MC); }
    for (const [x, z] of [[-5.6, -7.6], [5.6, -7.6], [-5.6, 7.6], [5.6, 7.6]]) { add(new THREE.BoxGeometry(0.5, 1.4, 0.5), wm, x, 0.7, z, MC); add(new THREE.BoxGeometry(0.7, 0.12, 0.7), wm, x, 1.46, z, MC); }
    for (const [x, z, w, d, h] of [[-2.4, -3.8, 4, 2.6, 1.0], [2.2, -4.2, 2.6, 3, 0.8], [-2.6, 3.6, 3.2, 3.6, 0.7]]) { add(new THREE.BoxGeometry(w, h, d), [facadeMat(w, h), facadeMat(w, h), plaster(WHITE), plaster(WHITE), facadeMat(w, h), facadeMat(w, h)], x, h / 2, z, MC); }
    for (const [x, z] of [[2, 2], [3.8, 5], [1.2, 5.6], [4, 0.6]]) { const b = add(new THREE.SphereGeometry(0.9, 24, 12, 0, 6.283, 0, Math.PI / 2), plaster("#E6E2DA"), x, 0, z, MC); b.scale.y = 0.45; add(new THREE.BoxGeometry(0.5, 0.3, 0.2), plaster("#9AA0AA"), x, 0.15, z + 0.85, MC); }
    add(new THREE.BoxGeometry(1.2, 0.08, 0.5), plaster("#9AA0AA"), 5.6, 0.04, 0, MC); }
  // tunnel section on the compound plinth's south face
  let tunP = -1;
  const paintTun = (g, w, h) => {
    const p = Math.max(0, tunP);
    g.fillStyle = "#2B3038"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 3; for (let i = -h; i < w; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
    g.fillStyle = "#EDEBE5"; g.fillRect(0, 0, w, 40);
    const T = [[[120, 40], [120, 200], [520, 200], [780, 330], [1180, 330]], [[520, 200], [520, 420], [900, 420]], [[300, 200], [300, 470], [100, 470]]];
    g.lineCap = "round"; g.lineJoin = "round";
    for (const L of T) { g.strokeStyle = "#0B0D11"; g.lineWidth = 50; g.beginPath(); L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
    for (const [x, y] of [[520, 200], [900, 420], [100, 470], [1180, 330]]) { g.fillStyle = "#0B0D11"; g.fillRect(x - 70, y - 50, 140, 100); }
    // glowing route by progress
    g.strokeStyle = AMBER; g.lineWidth = 8; g.setLineDash([24, 14]);
    for (const L of T) { let tot = 0; for (let i = 1; i < L.length; i++) tot += Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]); let rem = tot * p; g.beginPath(); g.moveTo(...L[0]); for (let i = 1; i < L.length && rem > 0; i++) { const d = Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]), f = Math.min(1, rem / d); g.lineTo(L[i - 1][0] + (L[i][0] - L[i - 1][0]) * f, L[i - 1][1] + (L[i][1] - L[i - 1][1]) * f); rem -= d; } g.stroke(); }
    g.setLineDash([]);
    if (p > 0.6) { g.font = `700 46px ${MONO}`; g.fillStyle = AMBER; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("TEROWONGAN", 620, 540); g.fillText("BUNKER", 760, 470 - 210); }
  };
  const tunT = label(1280, 640, paintTun);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(12.6, 6.3), new THREE.MeshStandardMaterial({ map: tunT, emissiveMap: tunT, emissive: 0xffffff, emissiveIntensity: 0.0, roughness: 0.7 })); m.position.set(-40, -3.65, -1.36); scene.add(m); MC.userData.sec = m; }
  // 11 KM dimension line between the city and the compound (projected amber light)
  const dimG = new THREE.Group(); scene.add(dimG);
  { const gm = glow(AMBER, 0.95);
    const y = 1.2, z = -10, x0 = -33.6, x1 = -24.4;
    for (const [a, b] of [[x0, -30.2], [-27.8, x1]]) add(new THREE.BoxGeometry(b - a, 0.06, 0.06), gm, (a + b) / 2, y, z, dimG, false);
    for (const x of [x0, x1]) add(new THREE.BoxGeometry(0.06, 1.0, 0.06), gm, x, y, z, dimG, false);
    const zz = [[-30.2, 0], [-29.7, 0.35], [-28.9, -0.35], [-28.3, 0.35], [-27.8, 0]];
    for (let i = 1; i < zz.length; i++) { const a = V(zz[i - 1][0], y + zz[i - 1][1], z), b = V(zz[i][0], y + zz[i][1], z); add(seg(a, b, 0.06), gm, 0, 0, 0, dimG, false); } }
  const kmT = label(512, 180, (g, w, h) => { g.fillStyle = "rgba(12,15,20,.9)"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 22); g.fill(); g.strokeStyle = AMBER; g.lineWidth = 5; g.stroke(); g.fillStyle = AMBER; g.font = `700 104px ${MONO}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("11 KM", w / 2, h / 2 + 6); });
  const kmTag = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.48), new THREE.MeshBasicMaterial({ map: kmT, transparent: true, toneMapped: false, depthWrite: false })); kmTag.position.set(-32.5, 3.0, -10); kmTag.renderOrder = 5; scene.add(kmTag);

  // ---------- brass plaque on the plinth front ----------
  const plqT = label(1600, 300, (g, w, h) => {
    g.fillStyle = "#D8B46A"; g.fillRect(0, 0, w, h);
    const q = mulberry(4); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,240,200,${q() * 0.12})`; g.fillRect(0, q() * h, w, 1); }
    g.strokeStyle = "#5C4318"; g.lineWidth = 6; g.strokeRect(18, 18, w - 36, h - 36);
    g.fillStyle = "#4A3510"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `500 54px ${SG}`; g.fillText("NAYPYIDAW · MYANMAR", w / 2, 100);
    g.font = `700 104px ${SG}`; g.letterSpacing = "26px"; g.fillText("AUDIRA", w / 2 + 13, 205);
  });
  add(new THREE.BoxGeometry(17, 3.2, 0.14), [brassM(null), brassM(null), brassM(null), brassM(null), brassM(plqT), brassM(null)], 0, -3.3, 51.25);

  // ---------- projections (data is light) ----------
  const laneFadeT = canvasTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.2, "rgba(255,255,255,1)"); gr.addColorStop(0.85, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const LANEP = [];
  for (let i = 0; i < LANES; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.72, 46).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, alphaMap: laneFadeT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); m.position.set(laneX(i), 0.03, 4); m.renderOrder = 2; scene.add(m); LANEP.push(m); }
  // centre crosshair (s5)
  const xhT = canvasTex(1024, 1024, (g, w) => { const c = w / 2; g.strokeStyle = "#fff"; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c * 0.8, 0, 7); g.stroke(); g.lineWidth = 5; g.setLineDash([30, 20]); g.beginPath(); g.arc(c, c, c * 0.55, 0, 7); g.stroke(); g.setLineDash([]); g.lineWidth = 8; for (const [a, b] of [[[c, 20], [c, c * 0.62]], [[c, w - 20], [c, c * 1.38]], [[20, c], [c * 0.62, c]], [[w - 20, c], [c * 1.38, c]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } g.fillStyle = "#fff"; g.beginPath(); g.arc(c, c, 18, 0, 7); g.fill(); });
  const xh = new THREE.Mesh(new THREE.PlaneGeometry(22, 22).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, map: xhT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); xh.position.set(0, 4.9, 0); xh.renderOrder = 3; scene.add(xh);
  // restive-region arrows (s5)
  const arT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(0, h * 0.36); g.lineTo(w * 0.62, h * 0.36); g.lineTo(w * 0.62, h * 0.1); g.lineTo(w, h / 2); g.lineTo(w * 0.62, h * 0.9); g.lineTo(w * 0.62, h * 0.64); g.lineTo(0, h * 0.64); g.closePath(); g.fill(); });
  const ARR = [[10, -10, 0.35], [-10, 8, Math.PI + 0.3], [4, -28, -Math.PI / 2 + 0.4]].map(([x, z, a]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: AMBER, map: arT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); m.rotation.y = -a; m.position.set(x, 4.95, z); m.renderOrder = 3; scene.add(m); return m; });
  // fortress envelope (s5): glowing walls around the city with crenellations
  const wallT = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "rgba(255,255,255,.75)"); gr.addColorStop(0.7, "rgba(255,255,255,.14)"); gr.addColorStop(0.86, "rgba(255,255,255,.1)"); gr.addColorStop(0.87, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(0, h * 0.13, w, 8); for (let x = 0; x < w; x += 64) { g.fillRect(x, 0, 32, h * 0.13 + 8); g.fillRect(x, 0, 32, 6); } g.fillRect(0, h - 6, w, 6); });
  const WALL = new THREE.Group(); scene.add(WALL);
  { const mk = (L, x, z, ry) => { const t = wallT.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(L / 3, 1); t.needsUpdate = true; const m = new THREE.Mesh(new THREE.PlaneGeometry(L, 3).translate(0, 1.5, 0), new THREE.MeshBasicMaterial({ color: CYAN, map: t, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, opacity: 0.9 })); m.position.set(x, 0, z); m.rotation.y = ry; m.renderOrder = 4; WALL.add(m); };
    mk(47, 0, -49.4, 0); mk(47, 0, 49.4, 0); mk(98.8, -23.6, 0, Math.PI / 2); mk(98.8, 23.6, 0, Math.PI / 2); }
  // scan wavefront + boundary (s6)
  const scanG = new THREE.Group(); scene.add(scanG);
  const scanSheet = new THREE.Mesh(new THREE.PlaneGeometry(48, 6).translate(0, 3, 0), new THREE.MeshBasicMaterial({ color: CYAN, alphaMap: canvasTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  scanG.add(scanSheet);
  const scanLine = new THREE.Mesh(new THREE.BoxGeometry(48.4, 0.08, 0.25), glow(CYAN, 1)); scanLine.position.y = 0.05; scanG.add(scanLine);
  const gridT = canvasTex(128, 128, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; g.strokeRect(0, 0, w, w); }, [24, 50]);
  const gridP = new THREE.Mesh(new THREE.PlaneGeometry(48, 100).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: CYAN, map: gridT, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); gridP.position.y = 0.04; gridP.renderOrder = 2; scene.add(gridP);
  const bnd = new THREE.Group(); scene.add(bnd);
  { const gm = glow(AMBER, 1); for (const [w, d, x, z] of [[48.6, 0.18, 0, -50.2], [48.6, 0.18, 0, 50.2], [0.18, 100.6, -24.2, 0], [0.18, 100.6, 24.2, 0]]) add(new THREE.BoxGeometry(w, 0.12, d), gm, x, 0.06, z, bnd, false); }

  // ---------- earthquake: cracks across the model (s7) ----------
  const CRK = [];
  { const q = mulberry(2025); const E = [2.5, -8];
    const walk = (x, z, a, n, gen, d0) => { let d = d0; for (let i = 0; i < n; i++) { a += (q() - 0.5) * 0.9; const st = 0.45 + q() * 0.4, nx = x + Math.cos(a) * st, nz = z + Math.sin(a) * st; d += st; if (Math.abs(nx) > 23.8 || Math.abs(nz) > 49.8) break; CRK.push([x, z, nx, nz, d, gen]); x = nx; z = nz; if (gen < 2 && q() < 0.12) walk(x, z, a + (q() < 0.5 ? 1 : -1) * (0.6 + q() * 0.6), Math.floor(n * 0.45), gen + 1, d); } };
    for (let k = 0; k < 7; k++) walk(E[0], E[1], (k / 7) * 6.283 + q() * 0.4, 46, 0, 0); }
  const CRMAX = Math.max(...CRK.map((c) => c[4]));
  let crP = -1;
  const crT = canvasTex(1024, 2048, (g) => g.clearRect(0, 0, 1024, 2048));
  const paintCracks = () => {
    const cv = crT.image, g = cv.getContext("2d"), W = cv.width, H = cv.height; g.clearRect(0, 0, W, H);
    const P = (x, z) => [((x + 24) / 48) * W, ((z + 50) / 100) * H];
    g.lineCap = "round"; g.lineJoin = "round";
    for (const pass of [0, 1]) for (const [x0, z0, x1, z1, d, gen] of CRK) {
      if (d > crP * CRMAX) continue;
      const [a, b] = P(x0, z0), [c, e] = P(x1, z1);
      g.strokeStyle = pass ? "#4E5560" : "rgba(255,255,255,.85)"; g.lineWidth = (pass ? 1 : 1.7) * [3.6, 2.3, 1.5][gen];
      g.beginPath(); g.moveTo(a + (pass ? 0 : 1.5), b + (pass ? 0 : 1.5)); g.lineTo(c + (pass ? 0 : 1.5), e + (pass ? 0 : 1.5)); g.stroke();
    }
    crT.needsUpdate = true;
  };
  const crackP = new THREE.Mesh(new THREE.PlaneGeometry(48, 100).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: crT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); crackP.position.y = 0.035; crackP.renderOrder = 2; scene.add(crackP);
  const DMG = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12]; // 11 of 14 government blocks
  const TILT = { 1: [0.07, -0.04], 3: [-0.05, 0.06], 7: [0.06, 0.05], 8: [-0.07, -0.03], 12: [0.04, 0.05] };
  const dust = pts(scene, 700, { color: 0xf2efe8, size: 0.55, add: false, opacity: 0.0 });
  const DQ = []; { const q = mulberry(77); for (let i = 0; i < 700; i++) { const b = GOV[DMG[i % DMG.length]]; DQ.push([b.x + (q() - 0.5) * 7, b.z + (q() - 0.5) * 8, q(), 0.6 + q() * 1.4]); } }

  // ---------- timing ----------
  const tDua1 = A("s1:dua"), tLaj = A("s1:lajur"), tKos = A("s1:kosong");
  const tNay = A("s2:Naypyidaw"), tKed = A("s2:kediaman"), tTiga = A("s2:tiga"), tYgn2 = A("s2:Yangon");
  const tMul = A("s3:dimulai"), tNep = A("s3:nepotisme");
  const tPind = A("s4:memindahkan"), tPar = A("s4:parade");
  const tTeng = A("s5:tengah"), tBerg = A("s5:bergolak"), tBent = A("s5:benteng"), tSerbu = A("s5:diserbu"), tRak = A("s5:rakyat");
  const tWil = A("s6:Wilayahnya"), tTuj = A("s6:tujuh"), tSem = A("s6:sembilan"), tGed = A("s6:Gedungnya"), tLeng = A("s6:lengang");
  const tSeb = A("s7:sebelas"), tKomp = A("s7:kompleks"), tTer = A("s7:terowongan"), tBunk = A("s7:bunker"), tLalu = A("s7:Lalu"), tGem = A("s7:gempa"), tDel = A("s7:delapan");
  const tMegah = A("s8:megah"), tMen = A("s8:Menurut"), tAud = A("s8:AUDIRA");

  // ---------- camera: [t, px, py, pz, tx, ty, tz] ----------
  const c = (t, p, g) => [t, ...p, ...g];
  const camKeys = [
    c(0, [1.4, 2.3, 34], [0.3, 1.0, 4]),
    c(tLaj, [1.2, 2.15, 30.5], [0.2, 1.0, -1]),
    c(K.s1e - 0.3, [0.8, 2.5, 26.5], [0, 1.6, -8]),
    c(K.s2 + 1.0, [2, 13, -14], [0, 9, -70]),
    c(tKed, [4.5, 16, -45], [0, 15.2, -95]),
    c(tTiga, [4.2, 15.8, -46.5], [0, 15.0, -95]),
    c(K.s2e - 0.2, [3.8, 15.6, -47.5], [0, 14.9, -95]),
    c(K.s3 + 1.2, [22, 20, 52], [16, 1, 30]),
    c(A("s3:2002"), [27, 12, 58], [17.5, 2.2, 33]),
    c(A("s3:miliar"), [31, 11.5, 56], [17.6, 2.2, 33]),
    c(K.s3e - 0.2, [33, 11, 52], [17.4, 2.2, 33]),
    c(K.s4 + 1.0, [10, 7.5, 47], [1.6, 0.6, 28]),
    c(tPind, [8.2, 6.5, 36], [1.6, 0.4, 18]),
    c(A("s4:baru") , [7.2, 6.2, 22], [1.4, 0.3, 4]),
    c(tPar - 0.2, [4.6, 3.8, 19], [1.2, 0.2, 4]),
    c(A("s4:ribu"), [4.5, 2.7, 3.5], [1.0, 0.1, -8]),
    c(K.s4e, [4.5, 2.6, 1.5], [1.0, 0.1, -10]),
    c(K.s5 + 1.4, [26, 44, 66], [0, 0, 4]),
    c(tTeng, [20, 33, 50], [0, 0, 2]),
    c(tBent, [30, 66, 92], [0, 0, -4]),
    c(K.s5e, [28, 64, 88], [0, 0, -4]),
    c(tTuj, [10, 82, 52], [0, 0, -4]),
    c(tSem, [8, 86, 48], [0, 0, -6]),
    c(tGed, [5.5, 6.5, 30], [0.5, 1.6, 4]),
    c(tLeng, [1.8, 2.3, 9.5], [0.2, 0.9, -12]),
    c(K.s6e, [1.6, 2.4, 8.5], [0.1, 0.9, -13]),
    c(K.s7 + 0.9, [-16, 15, 24], [-32, 0, -8]),
    c(tSeb, [-22, 15, 28], [-35, -0.5, -9]),
    c(tKomp, [-24, 11, 22], [-36, -1, -7]),
    c(tTer, [-29, 6.5, 17], [-39, -2.6, -4]),
    c(tBunk + 0.3, [-29.5, 6.2, 16.5], [-39.5, -2.8, -4]),
    c(A("s7:Maret") + 0.4, [10, 24, 34], [0, 0, -6]),
    c(tGem, [12, 22, 31], [0.5, 0, -8]),
    c(K.s7e, [11, 24, 34], [0, 0, -8]),
    c(tMegah, [9, 32, 76], [0, -15, 10]),
    c(tMen, [6, 36, 98], [0, -15, 14]),
    c(K.dur, [4.5, 38, 106], [0, -15, 15]),
  ];
  const camT = track(camKeys);
  const pump = (t, a, up = 0.12, down = 0.9) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const win = (t, a, b, f = 0.35) => smooth((t - a) / f) * (1 - smooth((t - b) / f));
  const pop = (t, a, d = 0.4) => back(clamp01((t - a) / d), 1.5);
  const tgt = new THREE.Vector3(), sdir = new THREE.Vector3(), cW = new THREE.Color(), cWarm = new THREE.Color(0xffb36b), cDay = new THREE.Color(0xffd9ac);
  const red = new THREE.Color(RED);
  const mE = new Float32Array(16);

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Space Grotesk"`) && document.fonts.check(`700 40px "JetBrains Mono"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const cv = tx.image, g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height); paint(g, cv.width, cv.height); tx.needsUpdate = true; }
    }
    // ----- camera -----
    const k = camT(t);
    const qk = win(t, tGem - 0.1, tGem + 2.6, 0.2) * (1 - 0.6 * smooth((t - tGem - 0.6) / 1.5));
    const shx = qk * 0.35 * (Math.sin(t * 47) + 0.6 * Math.sin(t * 83)), shy = qk * 0.25 * Math.sin(t * 61 + 1);
    cam.position.set(k[0] + shx + Math.sin(t * 0.31) * 0.05, k[1] + shy, k[2] + Math.sin(t * 0.23) * 0.05);
    tgt.set(k[3] + shx * 0.6, k[4] + shy * 0.6, k[5]); cam.lookAt(tgt);
    const d = cam.position.distanceTo(tgt);

    // ----- sun: east (morning) to west (dusk), long shadows -----
    const p = 0.07 + 0.86 * (t / K.dur), el = 0.2 + 0.2 * Math.sin(Math.PI * p);
    sdir.set(Math.cos(Math.PI * p) * Math.cos(el), Math.sin(el), Math.sin(Math.PI * p) * Math.cos(el) * 0.9 + 0.25).normalize();
    const dusk = smooth((t - K.s8) / 4);
    cW.copy(cDay).lerp(cWarm, 0.38 * dusk); sun.color.copy(cW); sun.intensity = 3.4 - 0.4 * dusk;
    hemi.intensity = 0.26 - 0.06 * dusk;
    const ext = Math.min(75, Math.max(9, d * 0.62));
    const sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.updateProjectionMatrix();
    sun.target.position.copy(tgt); sun.position.copy(tgt).addScaledVector(sdir, 160);

    // ----- car -----
    car.position.set(laneX(13), 0, carZ(t)); car.visible = !(t > A("s4:parade") - 0.6 && t < K.s5 + 2.3);

    // ----- s1 lanes light up one by one -----
    for (let i = 0; i < LANES; i++) {
      const ta = tDua1 - 0.1 + (i / LANES) * Math.max(0.6, tLaj + 0.35 - tDua1);
      const o = 0.75 * pump(t, ta, 0.1, 0.7) + 0.2 * smooth((t - ta) / 0.3) * (1 - smooth((t - tKos - 0.4) / 0.8)) + 0.2 * win(t, tLeng - 0.6, K.s6e + 0.3, 0.4);
      LANEP[i].material.opacity = o; LANEP[i].visible = o > 0.003;
    }

    // ----- s2 map board rises behind the north edge -----
    const up = smooth((t - K.s2 + 0.4) / 1.4) * (1 - smooth((t - K.s3 - 0.4) / 1.2));
    BRD.position.y = -32 + up * (32 + 13); BRD.rotation.x = -0.08; BRD.visible = up > 0.002;
    if (BRD.visible) {
      const np = Math.round(clamp01((t - tTiga + 0.6) / 1.4) * 100) / 100, nq = Math.round(((t - tNay + 0.2) % 1.6 > 0 && t > tNay - 0.2 && t < tKed + 3 ? ((t - tNay + 0.2) % 1.6) / 1.6 : 0) * 40) / 40;
      if (np !== mapP || nq !== mapQ) { mapP = np; mapQ = nq; const cv = mapT.image; paintMap(cv.getContext("2d"), cv.width, cv.height); mapT.needsUpdate = true; }
    }
    void tYgn2;

    // ----- s3 construction: scaffold edges then the blocks rise; cranes swing -----
    conG.forEach((o, i) => {
      const ta = tMul + (i / CON.length) * Math.max(2, tNep - tMul - 0.6);
      const e = smooth((t - ta + 0.5) / 0.4), u = eout(clamp01((t - ta) / 1.3));
      o.m.scale.y = Math.max(0.001, u); o.m.visible = u > 0.002;
      o.e.material.opacity = e * (1 - smooth((t - ta - 1.4) / 0.6)) * 0.9; o.e.visible = o.e.material.opacity > 0.01;
    });
    CR.forEach((o, i) => {
      const u = smooth((t - K.s3 + 1.0) / 1.0) * (1 - smooth((t - K.s5 - 0.2) / 1.0));
      o.G.scale.set(1, Math.max(0.001, u), 1); o.G.visible = u > 0.002;
      o.J.rotation.y = o.a0 + 0.9 * smooth((t - K.s3) / (K.s3e - K.s3)) * (i ? -1 : 1) + 0.05 * Math.sin(t * 0.7 + i);
      const drop = 1.2 + 2.6 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2)) * (o.H / 6);
      o.cable.scale.y = drop; o.cable.position.y = 0.3 - drop / 2; o.hook.position.y = 0.3 - drop; o.load.position.y = 0.16 - drop;
    });

    // ----- s4 convoy -----
    for (const tr of TR) { const z = 52 - 8.5 * (t - (tPind - 1.4 + tr.t0)); tr.G.position.set(tr.x, 0, z); tr.G.visible = z < 51 && z > -23.5; }

    // ----- s4 parade (12.000) -----
    const pv = t > tPar - 0.5 && t < K.s5 + 2.2;
    bodyI.visible = headI.visible = pv;
    if (pv) {
      let i = 0; const march = 0.12 * Math.max(0, t - tPar);
      for (let rr = 0; rr < 300; rr++) {
        const b = Math.floor(rr / 50), z = -23 + b * 7 + (rr % 50) * 0.13 - march;
        const ta = tPar - 0.35 + (rr / 300) * 1.7, tb = K.s5 + 0.4 + (rr / 300) * 1.0;
        const u = back(clamp01((t - ta) / 0.35), 1.4) * (1 - smooth((t - tb) / 0.4));
        const s = Math.max(0.0001, FS * u), bob = Math.abs(Math.sin(t * 5.2 + (rr % 2) * 1.57)) * 0.008 * u;
        for (let cc = 0; cc < 40; cc++, i++) {
          const x = cc < 20 ? -(0.5 + cc * 0.146) : 0.5 + (cc - 20) * 0.146;
          mE[0] = s; mE[5] = s; mE[10] = s; mE[12] = x; mE[13] = bob; mE[14] = z; mE[15] = 1;
          bodyI.instanceMatrix.array.set(mE, i * 16); headI.instanceMatrix.array.set(mE, i * 16);
        }
      }
      bodyI.instanceMatrix.needsUpdate = headI.instanceMatrix.needsUpdate = true;
    }

    // ----- s5 reasons: centre, restive regions, fortress -----
    xh.material.opacity = 0.85 * win(t, tTeng - 0.2, K.s5e - 0.2, 0.4) + 0.3 * pump(t, tTeng, 0.1, 0.8); xh.visible = xh.material.opacity > 0.003;
    xh.rotation.y = t * 0.15;
    ARR.forEach((m, i) => { const a = tBerg - 0.25 + i * 0.18; m.material.opacity = 0.9 * win(t, a, K.s5e - 0.2, 0.3) * (0.75 + 0.25 * Math.sin(t * 6 + i)); m.visible = m.material.opacity > 0.003; });
    { const u = eout(clamp01((t - tBent + 0.3) / 1.1)) * (1 - smooth((t - K.s6 - 0.5) / 0.8)); WALL.scale.y = Math.max(0.001, u); WALL.visible = u > 0.003;
      const pul = 0.6 + 0.4 * Math.max(pump(t, tSerbu, 0.1, 0.8), pump(t, tRak, 0.1, 0.8)); WALL.children.forEach((m) => { m.material.opacity = 0.8 * pul; m.material.color.set(CYAN).lerp(new THREE.Color(AMBER), pump(t, tRak, 0.1, 1.0)); }); }

    // ----- s6 scale: boundary + scan wave + grid -----
    { const b = win(t, tWil - 0.2, K.s6e - 0.4, 0.4); bnd.visible = b > 0.003; bnd.children.forEach((m) => (m.material.opacity = b));
      const s = clamp01((t - tTuj + 0.6) / 3.2); scanG.visible = s > 0 && s < 1; scanG.position.z = 50 - 100 * smooth(s);
      scanSheet.material.opacity = 0.5 * Math.sin(Math.PI * s);
      gridP.material.opacity = 0.35 * smooth((t - tTuj) / 1.0) * (1 - smooth((t - tGed - 0.3) / 0.8)); gridP.visible = gridP.material.opacity > 0.003; }

    // ----- s7 compound: tunnels light up, 11 KM -----
    { const dd = win(t, tSeb - 0.3, A("s7:Maret") - 0.2, 0.3); dimG.visible = kmTag.visible = dd > 0.003; dimG.children.forEach((m) => (m.material.opacity = dd)); kmTag.material.opacity = dd; kmTag.quaternion.copy(cam.quaternion);
      const tp = Math.round(clamp01((t - tTer + 0.7) / 1.6) * 60) / 60; if (tp !== tunP) { tunP = tp; const cv = tunT.image; paintTun(cv.getContext("2d"), cv.width, cv.height); tunT.needsUpdate = true; }
      MC.userData.sec.material.emissiveIntensity = 0.06 + 0.5 * smooth((t - tTer + 0.6) / 0.8) * (1 - smooth((t - A("s7:Maret")) / 1.2)); }

    // ----- s7 earthquake: cracks, tilt, red wash on 80% -----
    { const cp = Math.round(eout(clamp01((t - tGem + 0.15) / 1.9)) * 80) / 80;
      if (cp !== crP) { crP = cp; paintCracks(); } crackP.visible = cp > 0;
      const tl = smooth((t - tGem - 0.1) / 0.9);
      for (const [i, [rx, rz]] of Object.entries(TILT)) { const b = GOV[i]; b.G.rotation.set(rx * tl, 0, rz * tl); b.G.position.y = -0.12 * tl; }
      const wash = smooth((t - tDel + 0.3) / 0.6);
      DMG.forEach((i, j) => { const w = wash * clamp01((t - tDel + 0.3 - j * 0.05) / 0.3); for (const m of GOV[i].mats) { m.emissive.copy(red); m.emissiveIntensity = 0.3 * w * (1 - 0.35 * dusk); } });
      const dv = t > tGem - 0.1 && t < tGem + 6;
      dust.P.visible = dv;
      if (dv) { const age = t - tGem; for (let i = 0; i < DQ.length; i++) { const [x, z, ph, sp] = DQ[i], a = clamp01((age - ph * 0.6) / 4); dust.pos[i * 3] = x + (ph - 0.5) * a * 3; dust.pos[i * 3 + 1] = 0.2 + sp * 1.6 * eout(a); dust.pos[i * 3 + 2] = z + (sp - 1.2) * a * 2; } dust.commit(); dust.m.opacity = 0.55 * smooth(age / 0.3) * (1 - smooth((age - 2.5) / 3)); } }
    void tAud; void tMen; void tLalu; void tKomp; void tNay;

    comp.render();
  };
}
