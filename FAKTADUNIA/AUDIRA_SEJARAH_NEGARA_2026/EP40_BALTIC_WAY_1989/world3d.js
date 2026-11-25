// EP40 VOXELVERSE: the Baltic Way, 23 August 1989. Two voxel dioramas share one scene and swap under panel cuts.
//  MAP  : a plinth of 1-unit voxel columns cut from Natural Earth 50m (1 unit = 5 km). Estonia, Latvia and Lithuania
//         are patchwork fields and forest with cream border ridges; neighbours are grey-green; the Baltic Sea is low
//         blue voxels. The route Vilnius - Panevezys - Bauska - Riga - Cesis - Valmiera - Karksi-Nuia - Viljandi -
//         Tallinn is a voxel road; later thousands of tiny figures and a warm light line stand on it.
//  ROAD : a human-scale stretch of country road at dusk. Two rows of voxel people (InstancedMesh: legs, body, head,
//         hair, arms) hold hands along the verges, a second rank carries candles and the three flags, voxel buses
//         park in a field, a village clock tower shows 19.00, a small plane and a helicopter film from above.
//   s1 ROAD low fly-over of the linked chain, 675 KM tag            s5 ROAD clock 19.00, hands link in a wave, plane films
//   s2 MAP  three countries rise with flags, plaque 1940-1989       s6 MAP  the chain on the map, 200.000 per country
//   s3 MAP  the 1939 secret protocol tears in two over the map      s7 MAP  newspaper "HISTERIA", protocol admitted, Lithuania 11.03.1990
//   s4 MAP  route drawn Vilnius > Riga > Tallinn, town segments, buses   s8 MAP high aerial: the unbroken light line, AUDIRA board
// Everything is a pure function of t.

const FONTS = ['700 80px "Space Grotesk"', '500 80px "Space Grotesk"', '700 80px "JetBrains Mono"', '500 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "BALTIC 675 KM AUDIRA"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { ShaderPass } from "./ShaderPass.js";
import { GEO } from "./geo.js";

const HEAD = '"Space Grotesk", Arial, sans-serif', MONO = '"JetBrains Mono", Consolas, monospace';
const INK = "#1B1712", CREAM = "#F6EBD3", DUSK = "#F2A65A";
const EE = ["#0072CE", "#111111", "#FFFFFF"], LV = ["#9E3039", "#FFFFFF", "#9E3039"], LT = ["#FDB913", "#006A44", "#C1272D"];

// ---------- projection: equirectangular around Latvia, x east, z south, 1 unit = 5 km ----------
const LON0 = 24.6, LAT0 = 56.8, KX = 12.13, KZ = 22.24;
const PJ = (lo, la) => [(lo - LON0) * KX, -(la - LAT0) * KZ];
const GX0 = -46, GZ0 = -66, NX = 92, NZ = 132;

const CITIES = [
  ["VILNIUS", 25.28, 54.69, 1], ["PANEVĖŽYS", 24.36, 55.73, 0], ["BAUSKA", 24.19, 56.41, 0], ["RIGA", 24.11, 56.95, 1],
  ["CĒSIS", 25.27, 57.31, 0], ["VALMIERA", 25.43, 57.54, 0], ["KARKSI-NUIA", 25.56, 58.1, 0], ["VILJANDI", 25.59, 58.36, 0], ["TALLINN", 24.75, 59.44, 1],
].map(([n, lo, la, big]) => { const [x, z] = PJ(lo, la); return { n, x, z, big }; });

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

// voxel AO: darken each box toward its own bottom (object-space y of the unit geometry)
function voxAO(mat, lo = 0.55, y0 = -0.5, y1 = 0.5) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vAoY;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvAoY = position.y;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vAoY;").replace("#include <color_fragment>", `#include <color_fragment>\ndiffuseColor.rgb *= mix(${lo.toFixed(3)}, 1.0, smoothstep(${y0.toFixed(3)}, ${y1.toFixed(3)}, vAoY));`);
  };
  return mat;
}

// tilt-shift: separable blur that grows with distance from a horizontal focus band
const TiltShader = {
  uniforms: { tDiffuse: { value: null }, dir: { value: new THREE.Vector2(1, 0) }, focus: { value: 0.5 }, band: { value: 0.1 }, amt: { value: 6 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 dir; uniform float focus, band, amt; varying vec2 vUv;
  void main(){ float d = max(0.0, abs(vUv.y - focus) - band); float r = amt * smoothstep(0.0, 0.32, d);
    vec4 s = vec4(0.0); float ws = 0.0;
    for (int i = -6; i <= 6; i++) { float fi = float(i); float w = exp(-fi * fi / 18.0); s += texture2D(tDiffuse, vUv + dir * fi * r / 6.0) * w; ws += w; }
    gl_FragColor = s / ws; }`,
};

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x2b3a67, exp: 1.0, bloom: [0.22, 0.45, 0.86], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;
  cam.near = 0.3; cam.far = 3000; cam.updateProjectionMatrix();
  const sky = (stops) => canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const SKY_ROAD = sky([[0, "#1F2B55"], [0.32, "#55507E"], [0.55, "#B9758A"], [0.72, "#F2A65A"], [0.86, "#F8C887"], [1, "#F3D3A0"]]);
  const SKY_MAP = sky([[0, "#151B33"], [0.4, "#2C2F52"], [0.75, "#5E4A63"], [1, "#8C6262"]]);
  scene.background = SKY_ROAD;
  const FOG_ROAD = new THREE.FogExp2(0xe7a77a, 0.0030), FOG_MAP = new THREE.FogExp2(0x3b3550, 0.0011);

  const tilts = [new ShaderPass(TiltShader), new ShaderPass(TiltShader)];
  tilts[0].uniforms.dir.value.set(1 / 1080, 0); tilts[1].uniforms.dir.value.set(0, 1 / 1920);
  comp.insertPass(tilts[0], 2); comp.insertPass(tilts[1], 3);

  // ---------- lights: warm low dusk sun, cool sky fill, rim ----------
  const hemi = new THREE.HemisphereLight(0xaab8ff, 0x5a3a28, 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb070, 3.0);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0x8fb0ff, 0.7); scene.add(rim);

  const std = (c, ro = 0.75, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const noiseTex = (seed, base, amp, n, rep, sz = 512) => canvasTex(sz, sz, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); const q = mulberry(seed); for (let i = 0; i < n; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${amp * (0.4 + q() * 0.6)})`; g.fillRect(q() * w, q() * w, 1 + q() * 3, 1 + q() * 2); } }, rep);
  const C = (h) => new THREE.Color(h);
  const tmpM = new THREE.Matrix4(), tmpM2 = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);

  // paper tag: cream card, dark ink, soft halo; billboarded each frame
  function tag(w, h, paint, cw = 1024) {
    const ch = Math.round((cw * h) / w);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: canvasTex(cw, ch, (g, W, H) => { g.clearRect(0, 0, W, H); paint(g, W, H); }) }));
    m.renderOrder = 8; m.material.depthTest = false; scene.add(m); return m;
  }
  const rr = (g, x, y, w, h, rad) => { g.beginPath(); g.moveTo(x + rad, y); g.arcTo(x + w, y, x + w, y + h, rad); g.arcTo(x + w, y + h, x, y + h, rad); g.arcTo(x, y + h, x, y, rad); g.arcTo(x, y, x + w, y, rad); g.closePath(); };
  function card(lines, { bg = CREAM, fg = INK, accent = null, halo = "rgba(255,226,170,.55)", pad = 0.16 } = {}) {
    return (g, W, H) => {
      const p = H * pad;
      g.save(); g.shadowColor = halo; g.shadowBlur = H * 0.22; g.fillStyle = bg; rr(g, p, p, W - 2 * p, H - 2 * p, H * 0.1); g.fill(); g.restore();
      g.fillStyle = bg; rr(g, p, p, W - 2 * p, H - 2 * p, H * 0.1); g.fill();
      if (accent) { g.fillStyle = accent; rr(g, p, p, H * 0.09, H - 2 * p, H * 0.04); g.fill(); }
      g.textAlign = "center"; g.textBaseline = "middle";
      const n = lines.length, ih = (H - 2 * p) / n;
      lines.forEach(([txt, font, col, k], i) => { g.fillStyle = col || fg; g.font = font(ih * (k || 0.62)); g.fillText(txt, W / 2 + (accent ? H * 0.04 : 0), p + ih * (i + 0.56)); });
    };
  }
  const fH = (wgt = 700) => (s) => `${wgt} ${s}px ${HEAD}`, fM = (wgt = 700) => (s) => `${wgt} ${s}px ${MONO}`;
  function bill(m, k, scale = 1) { if (k > 0.002) { tmpV.copy(m.position).project(cam); const uy = (tmpV.y + 1) / 2; k *= (1 - smooth((uy - 0.8) / 0.07)) * smooth((uy - 0.17) / 0.06); } m.visible = k > 0.002; if (!m.visible) return; m.material.opacity = k; m.quaternion.copy(cam.quaternion); m.scale.setScalar(scale * Math.max(0.001, 0.6 + 0.4 * back(k, 1.4))); }

  // ======================================================================================
  // MAP STAGE
  // ======================================================================================
  const MAP = new THREE.Group(); scene.add(MAP);
  // rasterise countries
  const grid = new Uint8Array(NX * NZ);
  {
    const cv = document.createElement("canvas"); cv.width = NX; cv.height = NZ;
    const g = cv.getContext("2d", { willReadFrequently: true });
    const order = [["Estonia", 1], ["Latvia", 2], ["Lithuania", 3]];
    const others = GEO.filter((c) => !["Estonia", "Latvia", "Lithuania"].includes(c.name)).map((c) => [c.name, 4]);
    for (const [name, id] of [...others, ...order]) {
      const c = GEO.find((x) => x.name === name); if (!c) continue;
      g.clearRect(0, 0, NX, NZ); g.fillStyle = "#fff";
      for (const ring of c.rings) {
        const P = ring.map(([lo, la]) => PJ(lo, la));
        const xs = P.map((p) => p[0]), zs = P.map((p) => p[1]);
        if (Math.max(...xs) < GX0 - 2 || Math.min(...xs) > GX0 + NX + 2 || Math.max(...zs) < GZ0 - 2 || Math.min(...zs) > GZ0 + NZ + 2) continue;
        g.beginPath(); P.forEach(([x, z], i) => (i ? g.lineTo(x - GX0, z - GZ0) : g.moveTo(x - GX0, z - GZ0))); g.closePath(); g.fill();
      }
      const d = g.getImageData(0, 0, NX, NZ).data;
      for (let i = 0; i < NX * NZ; i++) if (d[i * 4 + 3] > 127) grid[i] = id;
    }
  }
  const gid = (i, j) => (i < 0 || j < 0 || i >= NX || j >= NZ ? 0 : grid[j * NX + i]);
  const cellOf = (x, z) => gid(Math.floor(x - GX0), Math.floor(z - GZ0));
  // relief: seeded gaussian bumps (no periodic terms)
  const bq = mulberry(40), BUMPS = [];
  for (let i = 0; i < 46; i++) BUMPS.push([GX0 + bq() * NX, GZ0 + bq() * NZ, 3 + bq() * 9, (bq() - 0.35) * 0.9]);
  const relief = (x, z) => BUMPS.reduce((s, [bx, bz, sg, a]) => s + a * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (2 * sg * sg)), 0);
  // patch noise: value noise on a coarse lattice
  const vn = (() => { const q = mulberry(9), L = []; for (let i = 0; i < 64 * 64; i++) L.push(q()); const at = (a, b) => L[((b & 63) * 64 + (a & 63))]; return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return (at(xi, yi) * (1 - sx) + at(xi + 1, yi) * sx) * (1 - sy) + (at(xi, yi + 1) * (1 - sx) + at(xi + 1, yi + 1) * sx) * sy; }; })();
  const patch = (x, z) => 0.6 * vn(x / 5 + 40, z / 5 + 40) + 0.4 * vn(x / 2.2 + 7, z / 2.2 + 3);

  const CELLS = [];
  const FIELD = ["#C9B458", "#BBA84E", "#D8C66C", "#A3AE58", "#8C9F4E", "#CDB560"].map(C), FOREST = ["#2F5D3A", "#2A553A", "#36633F"].map(C);
  const OTHER = ["#6F7566", "#666C5E", "#787B6C"].map(C);
  const cq = mulberry(12);
  let nearLand = (i, j, rad) => { for (let a = -rad; a <= rad; a++) for (let b = -rad; b <= rad; b++) { const v = gid(i + a, j + b); if (v) return true; } return false; };
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const c = grid[j * NX + i], x = GX0 + i + 0.5, z = GZ0 + j + 0.5;
    let h, col, forest = false, border = false;
    if (c === 0) { h = 0.3; col = nearLand(i, j, 1) ? C("#2F6F88") : nearLand(i, j, 3) ? C("#24577A") : C("#1B4364"); }
    else if (c === 4) { h = 0.85 + Math.max(-0.3, relief(x, z) * 0.5); const p = patch(x, z); col = OTHER[Math.floor(cq() * 3)].clone().lerp(C("#3f4a3c"), p > 0.6 ? 0.45 : 0); forest = p > 0.62; }
    else {
      h = 1.1 + Math.max(-0.35, relief(x, z) * 0.7);
      const p = patch(x, z); forest = p > 0.56;
      col = (forest ? FOREST[Math.floor(cq() * 3)] : FIELD[Math.floor(cq() * FIELD.length)]).clone();
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = gid(i + a, j + b); if (v && v !== c && v !== 0) border = true; }
      if (border) { col = C("#EFE4C8"); h += 0.3; forest = false; }
    }
    CELLS.push({ i, j, x, z, c, h, col, forest, border });
  }
  const tileGeo = new THREE.BoxGeometry(0.97, 1, 0.97).translate(0, -0.5, 0);
  const tileMat = voxAO(std(0xffffff, 0.82, 0, { map: noiseTex(5, "#ffffff", 0.08, 9000, [1, 1], 64) }), 0.5, -0.5, -0.02);
  const TILES = new THREE.InstancedMesh(tileGeo, tileMat, CELLS.length);
  TILES.castShadow = TILES.receiveShadow = true; MAP.add(TILES);
  CELLS.forEach((cl, k) => { tmpM.makeScale(1, cl.h + 3, 1); tmpM.setPosition(cl.x, cl.h, cl.z); TILES.setMatrixAt(k, tmpM); TILES.setColorAt(k, cl.col); });
  const BALTIC = CELLS.map((c, k) => k).filter((k) => CELLS[k].c >= 1 && CELLS[k].c <= 3);
  // trees
  const TREES = []; const tq = mulberry(21);
  CELLS.forEach((cl, k) => { if (!cl.forest) return; const n = cl.c === 4 ? (tq() < 0.5 ? 1 : 0) : 1 + (tq() < 0.6 ? 1 : 0); for (let a = 0; a < n; a++) TREES.push({ k, x: cl.x + (tq() - 0.5) * 0.6, z: cl.z + (tq() - 0.5) * 0.6, s: 0.6 + tq() * 0.55, col: FOREST[Math.floor(tq() * 3)].clone().multiplyScalar(0.75 + tq() * 0.3) }); });
  const treeGeo = new THREE.BoxGeometry(0.42, 1, 0.42).translate(0, 0.5, 0);
  const TREEM = new THREE.InstancedMesh(treeGeo, voxAO(std(0xffffff, 0.85), 0.55, 0, 1), TREES.length);
  TREEM.castShadow = TREEM.receiveShadow = true; MAP.add(TREEM);
  const setTree = (k, lift) => { const tr = TREES[k], cl = CELLS[tr.k]; tmpM.makeScale(tr.s, tr.s * 1.25, tr.s); tmpM.setPosition(tr.x, cl.h + lift, tr.z); TREEM.setMatrixAt(k, tmpM); };
  TREES.forEach((tr, k) => { setTree(k, 0); TREEM.setColorAt(k, tr.col); });
  const BTREES = TREES.map((tr, k) => k).filter((k) => CELLS[TREES[k].k].c <= 3 && CELLS[TREES[k].k].c >= 1);
  // plinth with strata
  const strata = canvasTex(1024, 128, (g, w, h) => { const bands = ["#6B4A30", "#7D5A3A", "#5A3D27", "#8A6A48", "#4B3322"]; let y = 0; const q = mulberry(3); while (y < h) { const bh = 10 + q() * 30; g.fillStyle = bands[Math.floor(q() * bands.length)]; g.fillRect(0, y, w, bh); y += bh; } for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "255,240,220" : "20,10,5"},${0.15 + q() * 0.2})`; g.fillRect(q() * w, q() * h, 2 + q() * 5, 2 + q() * 3); } });
  add(new THREE.BoxGeometry(NX + 1.6, 5, NZ + 1.6), [std(0xffffff, 0.9, 0, { map: strata }), std(0xffffff, 0.9, 0, { map: strata }), std(0x3a2a1e), std(0x3a2a1e), std(0xffffff, 0.9, 0, { map: strata }), std(0xffffff, 0.9, 0, { map: strata })], 0, -5.4, 0, MAP);
  add(new THREE.BoxGeometry(NX + 4, 0.8, NZ + 4), std(0x2a1d14, 0.6), 0, -8.2, 0, MAP);
  const table = add(new THREE.PlaneGeometry(3000, 3000), std(0x1c1612, 0.9, 0, { map: noiseTex(8, "#2a221c", 0.1, 20000, [60, 60]) }), 0, -8.6, 0, MAP); table.rotation.x = -Math.PI / 2;
  // water sheen over the sea
  const water = add(new THREE.PlaneGeometry(NX, NZ), std(0x2a5f80, 0.18, 0.1, { transparent: true, opacity: 0.35 }), 0, 0.42, 0, MAP); water.rotation.x = -Math.PI / 2; water.castShadow = false;

  // ---------- route ----------
  const RP = CITIES.map((c) => [c.x, c.z]);
  // a gently bent road: insert midpoints nudged sideways so it reads as a road, not a ruler line
  const RPATH = [];
  const rq = mulberry(55);
  for (let i = 0; i < RP.length - 1; i++) {
    const [ax, az] = RP[i], [bx, bz] = RP[i + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L;
    const n = Math.max(2, Math.round(L / 3));
    for (let k = 0; k < n; k++) { const u = k / n, off = Math.sin(u * Math.PI) * (rq() - 0.5) * L * 0.12; RPATH.push([ax + dx * u + nx * off, az + dz * u + nz * off, i]); }
  }
  RPATH.push([...RP[RP.length - 1], RP.length - 2]);
  const RL = [0]; for (let i = 1; i < RPATH.length; i++) RL.push(RL[i - 1] + Math.hypot(RPATH[i][0] - RPATH[i - 1][0], RPATH[i][1] - RPATH[i - 1][1]));
  const RTOT = RL[RL.length - 1];
  const CITY_U = CITIES.map((c) => { let best = 0, bd = 1e9; RPATH.forEach((p, i) => { const d = Math.hypot(p[0] - c.x, p[1] - c.z); if (d < bd) { bd = d; best = i; } }); return RL[best] / RTOT; });
  function routeAt(u) {
    const s = clamp01(u) * RTOT; let i = 0; while (i < RL.length - 2 && RL[i + 1] < s) i++;
    const f = (s - RL[i]) / Math.max(1e-6, RL[i + 1] - RL[i]), a = RPATH[i], b = RPATH[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1;
    return { x: a[0] + dx * f, z: a[1] + dz * f, tx: dx / L, tz: dz / L, seg: a[2] };
  }
  const groundH = (x, z) => { const i = Math.floor(x - GX0), j = Math.floor(z - GZ0); if (i < 0 || j < 0 || i >= NX || j >= NZ) return 0.3; return CELLS[j * NX + i].h; };
  const NRT = Math.round(RTOT / 0.42);
  const ROADT = [];
  for (let k = 0; k < NRT; k++) { const u = (k + 0.5) / NRT, p = routeAt(u); ROADT.push({ u, x: p.x, z: p.z, yaw: Math.atan2(p.tx, p.tz), y: Math.max(groundH(p.x, p.z), 1.0) + 0.06, seg: p.seg }); }
  const roadGeo = new THREE.BoxGeometry(0.95, 0.22, 0.5);
  const ROADM = new THREE.InstancedMesh(roadGeo, std(0xffffff, 0.7), NRT); ROADM.castShadow = false; ROADM.receiveShadow = true; MAP.add(ROADM);
  const SEGCOL = ["#F2A65A", "#E35D4F", "#F4D06F", "#6CC4A1", "#58A6D6", "#B98CE0", "#F28FB0", "#9AD16B"].map(C), ASPH = C("#6E6E6E");
  ROADT.forEach((rt, k) => ROADM.setColorAt(k, ASPH));
  // city blocks
  const cityMat = voxAO(std(0xffffff, 0.7), 0.6, -0.5, 0.5);
  const CITYB = [];
  CITIES.forEach((c, ci) => {
    const q = mulberry(100 + ci), n = c.big ? 14 : 6;
    for (let k = 0; k < n; k++) { const a = q() * Math.PI * 2, d = 0.7 + q() * (c.big ? 2.6 : 1.4); const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; const w = 0.5 + q() * 0.6, hh = 0.5 + q() * (c.big ? 2.2 : 1.0); CITYB.push({ ci, x, z, w, hh, col: C(["#E9DCC2", "#D9C3A0", "#C96F4A", "#B85B3E", "#E4D3B4"][Math.floor(q() * 5)]) }); }
  });
  const CITYM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), cityMat, CITYB.length); CITYM.castShadow = CITYM.receiveShadow = true; MAP.add(CITYM);
  CITYB.forEach((b, k) => { tmpM.makeScale(b.w, b.hh, b.w); tmpM.setPosition(b.x, Math.max(groundH(b.x, b.z), 1.0), b.z); CITYM.setMatrixAt(k, tmpM); CITYM.setColorAt(k, b.col); });
  const cityTags = CITIES.map((c) => tag(c.big ? 13 : 10, c.big ? 3.0 : 2.3, card([[c.n, fH(700), INK, 0.62]], { accent: DUSK })));
  // buses (map scale tokens)
  function busToken(sc = 1) {
    const G = new THREE.Group();
    add(new THREE.BoxGeometry(0.62, 0.55, 1.7), voxAO(std(0xe8d9a8, 0.5)), 0, 0.42, 0, G);
    add(new THREE.BoxGeometry(0.64, 0.16, 1.5), std(0x22313f, 0.25, 0.2), 0, 0.55, 0.02, G);
    add(new THREE.BoxGeometry(0.64, 0.08, 1.72), std(0xc0392b, 0.6), 0, 0.3, 0, G);
    for (const z of [-0.55, 0.55]) add(new THREE.BoxGeometry(0.7, 0.22, 0.22), std(0x1a1a1a, 0.8), 0, 0.14, z, G);
    G.scale.setScalar(sc); MAP.add(G); return G;
  }
  const BUSES = [0.02, 0.17, 0.33, 0.48, 0.63, 0.8, 0.93].map((u0, i) => ({ G: busToken(1.25), u0, dir: i % 2 ? -1 : 1 }));
  // flags (map scale) on poles at country centres
  function flagTex(cols, ratio) { return canvasTex(300, Math.round(300 * ratio), (g, w, h) => { const t = cols.length === 3 && cols[0] === LV[0] ? [0.4, 0.2, 0.4] : [1 / 3, 1 / 3, 1 / 3]; let y = 0; cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, y, w, h * t[i] + 1); y += h * t[i]; }); }); }
  function flagMesh(cols, w, h) {
    const geo = new THREE.PlaneGeometry(w, h, 14, 4).translate(w / 2, 0, 0);
    const m = new THREE.Mesh(geo, std(0xffffff, 0.8, 0, { map: flagTex(cols, h / w), side: THREE.DoubleSide }));
    m.castShadow = true; m.userData.base = Float32Array.from(geo.attributes.position.array); m.userData.w = w; return m;
  }
  function waveFlag(m, t, amp = 0.35, sp = 3.2, ph = 0) { const p = m.geometry.attributes.position, b = m.userData.base, w = m.userData.w; for (let i = 0; i < p.count; i++) { const x = b[i * 3], u = x / w; p.array[i * 3 + 2] = Math.sin(x * 1.3 - t * sp + ph) * amp * u + Math.sin(b[i * 3 + 1] * 1.7 + t * 2) * 0.05 * u; } p.needsUpdate = true; m.geometry.computeVertexNormals(); }
  const FLAGSPOT = [[27.0, 58.75, EE, "ESTONIA"], [26.6, 56.62, LV, "LATVIA"], [23.25, 55.15, LT, "LITUANIA"]].map(([lo, la, cols, n], ci) => {
    const [x, z] = PJ(lo, la), G = new THREE.Group(); MAP.add(G);
    add(new THREE.CylinderGeometry(0.16, 0.2, 11, 8), std(0xd8d2c4, 0.35, 0.6), 0, 5.5, 0, G);
    add(new THREE.SphereGeometry(0.32, 10, 8), std(0xe0b84a, 0.3, 0.8), 0, 11.1, 0, G);
    const fm = flagMesh(cols, 6.6, 4.0); fm.position.set(0.15, 8.9, 0); G.add(fm);
    const base = add(new THREE.BoxGeometry(2.2, 0.6, 2.2), voxAO(std(0xefe4c8, 0.7)), 0, 0.3, 0, G);
    G.position.set(x, groundH(x, z), z);
    const lab = tag(14, 3.2, card([[n, fH(700), INK, 0.66]], { accent: cols[0] === "#FFFFFF" ? INK : cols[0] }));
    return { G, fm, x, z, lab, ci };
  });
  // Soviet plaque (s2)
  const sovPlaque = tag(30, 7.2, card([["DIKUASAI UNI SOVIET", fH(700), "#FFFFFF", 0.5], ["1940–1989", fM(700), "#FFD27A", 0.62]], { bg: "#8E1B1B", fg: "#fff", halo: "rgba(255,90,70,.6)" }), 1400);
  // 675 km route tag (s4) and 200.000 tags (s6)
  const routeTag = tag(18, 4.2, card([["675 KM", fM(700), INK, 0.7]], { accent: DUSK }));
  const perTags = [0, 1, 2].map((ci) => tag(16, 6, card([["± 200.000", fM(700), INK, 0.62], [["ESTONIA", "LATVIA", "LITUANIA"][ci], fH(700), "#5B4A35", 0.5]], { accent: [EE[0], LV[0], LT[1]][ci] }), 1100));
  // 1939 secret protocol (paper), torn in two
  const DOC_W = 20, DOC_H = 26;
  const docPaint = (side) => (g, w, h) => {
    const q = mulberry(7);
    const tear = []; for (let k = 0; k <= 40; k++) tear.push([w * 0.5 + (q() - 0.5) * w * 0.05 + Math.sin(k * 1.7) * w * 0.01, (k / 40) * h]);
    g.save(); g.beginPath();
    if (side === 0) { g.moveTo(0, 0); tear.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(0, h); }
    else if (side === 1) { g.moveTo(w, 0); tear.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(w, h); }
    else { g.rect(0, 0, w, h); }
    g.closePath(); g.clip();
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#F3E6C4"); gr.addColorStop(1, "#E2CFA2"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "120,90,50" : "255,250,235"},${0.05 + q() * 0.07})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 2); }
    g.strokeStyle = "rgba(120,90,50,.35)"; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48);
    g.fillStyle = "#8E1B1B"; g.font = `700 ${w * 0.05}px ${MONO}`; g.textAlign = "center"; g.fillText("RAHASIA", w * 0.5, h * 0.07);
    g.fillStyle = "#2A2118"; g.font = `700 ${w * 0.062}px ${HEAD}`; g.fillText("PROTOKOL TAMBAHAN", w / 2, h * 0.14);
    g.font = `500 ${w * 0.046}px ${MONO}`; g.fillText("23 · 8 · 1939", w / 2, h * 0.19);
    g.font = `700 ${w * 0.05}px ${HEAD}`; g.fillText("MOLOTOV–RIBBENTROP", w / 2, h * 0.245);
    // typed lines (unreadable bars, no invented quotes)
    g.fillStyle = "rgba(42,33,24,.55)";
    for (let k = 0; k < 9; k++) { const y = h * (0.29 + k * 0.026); let x = w * 0.1; while (x < w * 0.88) { const l = w * (0.03 + q() * 0.09); g.fillRect(x, y, Math.min(l, w * 0.9 - x), h * 0.007); x += l + w * 0.018; } }
    // sketch map of Eastern Europe with the dividing line
    const mx = w * 0.1, my = h * 0.55, mw = w * 0.8, mh = h * 0.3;
    g.strokeStyle = "rgba(60,45,30,.6)"; g.lineWidth = 3; g.strokeRect(mx, my, mw, mh);
    g.fillStyle = "rgba(90,90,90,.22)"; g.fillRect(mx, my, mw * 0.5, mh); g.fillStyle = "rgba(160,30,30,.22)"; g.fillRect(mx + mw * 0.5, my, mw * 0.5, mh);
    g.strokeStyle = "#8E1B1B"; g.setLineDash([16, 10]); g.lineWidth = 7; g.beginPath(); g.moveTo(mx + mw * 0.5, my); g.lineTo(mx + mw * 0.47, my + mh * 0.4); g.lineTo(mx + mw * 0.53, my + mh * 0.7); g.lineTo(mx + mw * 0.5, my + mh); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(42,33,24,.75)"; g.font = `700 ${w * 0.034}px ${MONO}`; g.fillText("BARAT", mx + mw * 0.25, my + mh * 0.5); g.fillText("TIMUR", mx + mw * 0.75, my + mh * 0.5);
    // two abstract signature scribbles
    g.strokeStyle = "rgba(30,30,80,.7)"; g.lineWidth = 4;
    for (const sx of [0.22, 0.68]) { g.beginPath(); for (let k = 0; k <= 30; k++) { const u = k / 30; const x = w * (sx + u * 0.16), y = h * 0.92 + Math.sin(u * 14 + sx * 9) * h * 0.012 - u * h * 0.01; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.restore();
  };
  const DOC = new THREE.Group(); scene.add(DOC);
  const docHalf = [0, 1].map((side) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(DOC_W, DOC_H), new THREE.MeshStandardMaterial({ map: canvasTex(900, 1170, docPaint(side)), transparent: true, roughness: 0.9, side: THREE.DoubleSide, alphaTest: 0.5 })); m.castShadow = true; DOC.add(m); return m; });
  const stampTex = (txt, sub, col) => canvasTex(900, 360, (g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.12); g.strokeStyle = col; g.lineWidth = 16; rr(g, -w * 0.44, -h * 0.38, w * 0.88, h * 0.76, 22); g.stroke(); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 ${h * 0.34}px ${HEAD}`; g.fillText(txt, 0, sub ? -h * 0.08 : 0); if (sub) { g.font = `700 ${h * 0.15}px ${MONO}`; g.fillText(sub, 0, h * 0.22); } g.restore(); });
  const stampDeny = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), basic({ map: stampTex("DISANGKAL", "OLEH UNI SOVIET", "#C0182B") })); DOC.add(stampDeny); stampDeny.position.set(5.0, 2.5, 0.2);
  const stampOk = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.8), basic({ map: stampTex("DIAKUI", "DESEMBER 1989", "#1E7A46") })); DOC.add(stampOk); stampOk.position.set(0, -1.0, 0.25);
  const sideTags = [tag(13, 3.2, card([["JERMAN NAZI", fH(700), "#fff", 0.62]], { bg: "#4A4A4A", halo: "rgba(0,0,0,.5)" })), tag(13, 3.2, card([["UNI SOVIET", fH(700), "#fff", 0.62]], { bg: "#9E1B1B", halo: "rgba(255,80,60,.6)" }))];
  // newspaper (s7) on a tilted stand
  const PAPER = new THREE.Group(); scene.add(PAPER);
  const paperTex = canvasTex(900, 1200, (g, w, h) => {
    const q = mulberry(17); g.fillStyle = "#EDE6D6"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${q() < 0.5 ? "90,80,60" : "255,255,250"},${0.05 + q() * 0.06})`; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1); }
    g.fillStyle = "#1A1A1A"; g.textAlign = "center"; g.font = `700 ${w * 0.13}px ${HEAD}`; g.fillText("PRAVDA", w / 2, h * 0.12);
    g.fillRect(w * 0.06, h * 0.15, w * 0.88, 6); g.font = `500 ${w * 0.03}px ${MONO}`; g.fillText("MOSKOW · AGUSTUS 1989", w / 2, h * 0.185); g.fillRect(w * 0.06, h * 0.2, w * 0.88, 3);
    g.fillStyle = "#B3121F"; g.font = `700 ${w * 0.15}px ${HEAD}`; g.fillText("«HISTERIA»", w / 2, h * 0.33);
    g.fillStyle = "#1A1A1A"; g.font = `500 ${w * 0.04}px ${HEAD}`; g.fillText("tentang aksi di negara Baltik", w / 2, h * 0.39);
    g.fillStyle = "rgba(26,26,26,.5)";
    for (let col = 0; col < 3; col++) for (let k = 0; k < 22; k++) { const x = w * (0.07 + col * 0.3), y = h * (0.45 + k * 0.022); g.fillRect(x, y, w * (0.24 - (k % 7 === 6 ? 0.1 : 0)), h * 0.008); }
  });
  const paperM = add(new THREE.BoxGeometry(15, 20, 0.12), [std(0xe0d8c6), std(0xe0d8c6), std(0xe0d8c6), std(0xe0d8c6), std(0xb9b2a2, 0.95, 0, { map: paperTex }), std(0xd8cfbb)], 0, 0, 0, PAPER);
  add(new THREE.BoxGeometry(17, 0.8, 3), voxAO(std(0x6b4a30, 0.7)), 0, -10.6, 0.8, PAPER);
  // Lithuania 11 March 1990 tag
  const ltTag = tag(26, 7, card([["11 MARET 1990", fM(700), INK, 0.58], ["LITUANIA MERDEKA", fH(700), "#006A44", 0.56]], { accent: LT[0] }), 1300);
  // AUDIRA roadside board on the map (s8) - voxel posts + lit face
  const audiraFace = (W = 1200, H = 360) => canvasTex(W, H, (g, w, h) => { g.fillStyle = "#0B3D2E"; g.fillRect(0, 0, w, h); g.strokeStyle = "#A3E635"; g.lineWidth = 12; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#FFFFFF"; g.font = `700 ${h * 0.5}px ${HEAD}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h * 0.46); g.fillStyle = "#A3E635"; g.font = `700 ${h * 0.12}px ${MONO}`; g.fillText("BALTIC WAY · 1989", w / 2, h * 0.8); });
  function board(parent, w, h, postH) {
    const G = new THREE.Group(); parent.add(G);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(w * 0.05, postH, w * 0.05), voxAO(std(0x5a3d27, 0.8)), s * w * 0.36, postH / 2, 0, G);
    add(new THREE.BoxGeometry(w, h, w * 0.04), [std(0x3a2a1e), std(0x3a2a1e), std(0x3a2a1e), std(0x3a2a1e), new THREE.MeshStandardMaterial({ map: audiraFace(), emissive: 0xffffff, emissiveMap: audiraFace(), emissiveIntensity: 0.55, roughness: 0.6 }), std(0x3a2a1e)], 0, postH + h / 2, 0, G);
    return G;
  }
  const mapBoard = board(MAP, 12, 3.6, 2.2); mapBoard.position.set(8.5, groundH(8.5, 13), 13); mapBoard.rotation.y = -0.15;
  // map-scale chain: thousands of tiny voxel figures + warm light line
  const NMF = 3600;
  const mfGeo = new THREE.BoxGeometry(0.16, 0.42, 0.16).translate(0, 0.21, 0);
  const MF = new THREE.InstancedMesh(mfGeo, std(0xffffff, 0.6, 0, { emissive: 0x3a2412, emissiveIntensity: 0.6 }), NMF * 2); MF.castShadow = true; MAP.add(MF);
  const MFHEAD = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.12, 0.12).translate(0, 0.49, 0), std(0xe7c3a2, 0.6), NMF * 2); MAP.add(MFHEAD);
  const SHIRT = ["#C0392B", "#2E5FA1", "#F0E6D2", "#7A4E2D", "#556B2F", "#D98E04", "#6C3F7A", "#EDEDED", "#2B2B2B", "#B65F7A", "#3E7CB1", "#9A9A9A"].map(C);
  const MFS = [];
  const mq = mulberry(31);
  for (let k = 0; k < NMF * 2; k++) {
    const side = k % 2 ? 1 : -1, u = (Math.floor(k / 2) + 0.5) / NMF, p = routeAt(u), off = 0.55 * side;
    const x = p.x - p.tz * off, z = p.z + p.tx * off;
    MFS.push({ u, x, z, y: Math.max(groundH(x, z), 1.0), c: cellOf(p.x, p.z), side });
    tmpM.makeScale(1, 0.85 + mq() * 0.3, 1); tmpM.setPosition(x, MFS[k].y, z); MF.setMatrixAt(k, tmpM); MFHEAD.setMatrixAt(k, tmpM);
    MF.setColorAt(k, SHIRT[Math.floor(mq() * SHIRT.length)]);
  }
  const NGL = 1400, GLW = pts(scene, NGL, { color: 0xffc27a, size: 1.5, add: true, opacity: 0.9 });
  const GLB = []; for (let k = 0; k < NGL; k++) { const u = (k + 0.5) / NGL, p = routeAt(u); GLB.push({ u, x: p.x, z: p.z, y: Math.max(groundH(p.x, p.z), 1.0) + 0.6, c: cellOf(p.x, p.z), ph: mq() * 6.3 }); }
  const segMid = [1, 2, 3].map((c) => { const L = MFS.filter((m) => m.c === c); const m = L[Math.floor(L.length / 2)] || MFS[0]; return [m.x, m.y, m.z]; });

  // ======================================================================================
  // ROAD STAGE (human scale, metres)
  // ======================================================================================
  const ROAD = new THREE.Group(); scene.add(ROAD);
  const RZ0 = 40, RZ1 = -300;
  // ground voxels
  const GT = [];
  for (let z = RZ0; z > RZ1; z -= 2) for (let x = -70; x <= 70; x += 2) {
    const ax = Math.abs(x);
    if (ax < 4) continue;
    const p = patch(x * 0.35, z * 0.35);
    let col, h = 0, forest = false;
    if (ax < 8) { col = C(["#7E8F4A", "#879650", "#73843F"][Math.floor(mq() * 3)]); h = 0.05 * mq(); }
    else if (ax > 16 && p > 0.5) { col = FOREST[Math.floor(mq() * 3)].clone(); forest = true; h = 0.1 + mq() * 0.25; }
    else { col = FIELD[Math.floor(mq() * FIELD.length)].clone(); h = (p > 0.45 ? 0.15 : 0.0) + mq() * 0.12; if (Math.floor((z + 400) / 14) % 2) col.lerp(C("#9BAA52"), 0.3); }
    GT.push({ x, z, h, col, forest });
  }
  const GTM = new THREE.InstancedMesh(new THREE.BoxGeometry(1.98, 1, 1.98).translate(0, -0.5, 0), voxAO(std(0xffffff, 0.85, 0, { map: noiseTex(6, "#ffffff", 0.1, 9000, [1, 1], 64) }), 0.5, -0.5, -0.05), GT.length);
  GTM.castShadow = GTM.receiveShadow = true; ROAD.add(GTM);
  GT.forEach((g, k) => { tmpM.makeScale(1, 2 + g.h, 1); tmpM.setPosition(g.x, g.h, g.z); GTM.setMatrixAt(k, tmpM); GTM.setColorAt(k, g.col); });
  // asphalt, verge kerbs, centre dashes
  const asph = add(new THREE.BoxGeometry(8, 0.5, RZ0 - RZ1), std(0x5d5b58, 0.85, 0, { map: noiseTex(4, "#7a7774", 0.14, 30000, [2, 60]) }), 0, -0.2, (RZ0 + RZ1) / 2, ROAD);
  const NDASH = Math.floor((RZ0 - RZ1) / 6);
  const DASH = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.06, 2.4), std(0xefe6cf, 0.6), NDASH); ROAD.add(DASH);
  for (let k = 0; k < NDASH; k++) { tmpM.makeTranslation(0, 0.06, RZ0 - 3 - k * 6); DASH.setMatrixAt(k, tmpM); }
  // trees on forest tiles
  const RTREE = []; GT.forEach((g) => { if (!g.forest) return; const n = 1 + (mq() < 0.45 ? 1 : 0); for (let a = 0; a < n; a++) RTREE.push({ x: g.x + (mq() - 0.5) * 1.4, z: g.z + (mq() - 0.5) * 1.4, y: g.h, s: 0.8 + mq() * 0.7, col: FOREST[Math.floor(mq() * 3)].clone().multiplyScalar(0.8 + mq() * 0.35) }); });
  const crownA = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 2.6, 2.2).translate(0, 2.9, 0), voxAO(std(0xffffff, 0.85), 0.55, 1.6, 4.2), RTREE.length);
  const crownB = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 1.6, 1.4).translate(0, 4.9, 0), voxAO(std(0xffffff, 0.85), 0.6, 4.1, 5.7), RTREE.length);
  const trunk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 1.8, 0.45).translate(0, 0.9, 0), std(0x5a3d27, 0.9), RTREE.length);
  for (const m of [crownA, crownB, trunk]) { m.castShadow = m.receiveShadow = true; ROAD.add(m); }
  RTREE.forEach((tr, k) => { tmpM.makeScale(tr.s, tr.s * (0.9 + (k % 5) * 0.08), tr.s); tmpM.setPosition(tr.x, tr.y, tr.z); crownA.setMatrixAt(k, tmpM); crownB.setMatrixAt(k, tmpM); trunk.setMatrixAt(k, tmpM); crownA.setColorAt(k, tr.col); crownB.setColorAt(k, tr.col.clone().multiplyScalar(1.12)); });

  // ---------- people ----------
  const SKIN = ["#F1D3BC", "#E8C4A6", "#DDB592", "#F5DCC8", "#D9A984"].map(C);
  const HAIR = ["#3B2A1E", "#6B4A2E", "#C9A46A", "#E2C58C", "#2A2522", "#8A5A3A", "#B9B2A8"].map(C);
  const PANTS = ["#2C3A55", "#3A3A3A", "#4E3B2C", "#1F2A3A", "#5A4B6B", "#6A6A60", "#2E4636"].map(C);
  const PPL = [];
  const SP = 1.1;
  for (const side of [1, -1]) {
    for (let z = RZ0 - 2, k = 0; z > RZ1 + 10; z -= SP, k++) {
      PPL.push({ x: side * 4.7, z: z + (mq() - 0.5) * 0.06, yaw: side > 0 ? -Math.PI / 2 : Math.PI / 2, s: 0.88 + mq() * 0.2, link: true, side, k });
      if (side > 0 ? mq() < 0.36 : mq() < 0.22) PPL.push({ x: side * (6.2 + mq() * 0.6), z: z + (mq() - 0.5) * 0.6, yaw: (side > 0 ? -Math.PI / 2 : Math.PI / 2) + (mq() - 0.5) * 0.4, s: mq() < 0.15 ? 0.62 : 0.85 + mq() * 0.2, link: false, side, prop: mq() < 0.45 ? "candle" : mq() < 0.5 ? "flag" : "none" });
    }
  }
  PPL.forEach((p) => { p.shirt = SHIRT[Math.floor(mq() * SHIRT.length)]; p.pants = PANTS[Math.floor(mq() * PANTS.length)]; p.skin = SKIN[Math.floor(mq() * SKIN.length)]; p.hair = HAIR[Math.floor(mq() * HAIR.length)]; p.ph = mq() * 6.3; p.base = new THREE.Matrix4().compose(new THREE.Vector3(p.x, 0, p.z), new THREE.Quaternion().setFromAxisAngle(Y, p.yaw), new THREE.Vector3(p.s, p.s, p.s)); });
  const NP = PPL.length;
  const pmat = () => voxAO(std(0xffffff, 0.8), 0.72, -0.5, 0.5);
  const PART = {
    legL: new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.84, 0.22).translate(-0.1, 0.42, 0), pmat(), NP),
    legR: new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.84, 0.22).translate(0.1, 0.42, 0), pmat(), NP),
    torso: new THREE.InstancedMesh(new THREE.BoxGeometry(0.56, 0.64, 0.3).translate(0, 1.15, 0), pmat(), NP),
    head: new THREE.InstancedMesh(new THREE.BoxGeometry(0.32, 0.33, 0.32).translate(0, 1.66, 0), pmat(), NP),
    hair: new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.12, 0.35).translate(0, 1.86, -0.01), pmat(), NP),
    armL: new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 0.62, 0.15).translate(0, -0.31, 0), pmat(), NP),
    armR: new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 0.62, 0.15).translate(0, -0.31, 0), pmat(), NP),
    handL: new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.15, 0.17).translate(0, -0.66, 0), pmat(), NP),
    handR: new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.15, 0.17).translate(0, -0.66, 0), pmat(), NP),
  };
  Object.values(PART).forEach((m) => { m.castShadow = m.receiveShadow = true; ROAD.add(m); m.frustumCulled = false; });
  PPL.forEach((p, k) => {
    for (const n of ["legL", "legR", "torso", "head", "hair"]) PART[n].setMatrixAt(k, p.base);
    PART.legL.setColorAt(k, p.pants); PART.legR.setColorAt(k, p.pants); PART.torso.setColorAt(k, p.shirt); PART.head.setColorAt(k, p.skin); PART.hair.setColorAt(k, p.hair);
    PART.armL.setColorAt(k, p.shirt); PART.armR.setColorAt(k, p.shirt); PART.handL.setColorAt(k, p.skin); PART.handR.setColorAt(k, p.skin);
  });
  // eyes: two dark voxel dots on the face (front = local +z)
  const EYE = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.06, 0.02), std(0x1a1410, 0.4), NP * 2); ROAD.add(EYE);
  PPL.forEach((p, k) => { for (const s of [-1, 1]) { tmpM.makeTranslation(s * 0.075, 1.69, 0.165); tmpM2.multiplyMatrices(p.base, tmpM); EYE.setMatrixAt(k * 2 + (s > 0 ? 1 : 0), tmpM2); } });
  // held props: candles (glow points) and flags
  const CAND = PPL.filter((p) => p.prop === "candle");
  const candG = pts(scene, CAND.length, { color: 0xffb36b, size: 0.55, add: true, opacity: 1 });
  CAND.forEach((p, i) => { tmpV.set(0.3, 1.25, 0.45).applyMatrix4(p.base); candG.pos.set([tmpV.x, tmpV.y, tmpV.z], i * 3); });
  const FLG = PPL.filter((p) => p.prop === "flag");
  const flagHeld = FLG.map((p, i) => { const cols = [EE, LV, LT][i % 3]; const G = new THREE.Group(); add(new THREE.BoxGeometry(0.05, 2.2, 0.05), std(0x7a5a3a), 0, 1.1, 0, G); const fm = flagMesh(cols, 1.05, 0.66); fm.position.set(0.03, 1.85, 0); G.add(fm); G.position.set(0.32, 0.55, 0.35); G.applyMatrix4(p.base); ROAD.add(G); return { G, fm, ph: i * 0.7 }; });
  // buses parked in the field
  const busMat = voxAO(std(0xe6d29c, 0.5), 0.6, -1.2, 1.2);
  function bus(x, z, yaw, col) {
    const G = new THREE.Group(); ROAD.add(G);
    add(new THREE.BoxGeometry(2.5, 2.4, 10.5), busMat.clone(), 0, 1.65, 0, G).material.color.set(col);
    add(new THREE.BoxGeometry(2.56, 0.85, 9.2), std(0x1d2a35, 0.2, 0.3), 0, 2.15, 0.3, G);
    add(new THREE.BoxGeometry(2.56, 0.3, 10.56), std(0xa8322a, 0.6), 0, 0.95, 0, G);
    add(new THREE.BoxGeometry(2.3, 0.25, 10.0), std(0xdedad0, 0.6), 0, 2.95, 0, G);
    add(new THREE.BoxGeometry(2.2, 0.9, 0.06), std(0x1d2a35, 0.2, 0.3), 0, 2.0, 5.27, G);
    for (const zz of [-3.4, 3.4]) for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.4, 1.0, 1.0), std(0x161616, 0.9), s * 1.2, 0.5, zz, G);
    const hl = add(new THREE.BoxGeometry(0.4, 0.25, 0.05), basic({ color: 0xfff1c8, opacity: 1 }), 0.8, 1.15, 5.28, G); add(new THREE.BoxGeometry(0.4, 0.25, 0.05), basic({ color: 0xfff1c8, opacity: 1 }), -0.8, 1.15, 5.28, G);
    G.position.set(x, 0.15, z); G.rotation.y = yaw; return G;
  }
  bus(-12, -36, 0.25, 0xe6d29c); bus(-15.5, -40, 0.3, 0xd9b74a); bus(-19, -44, 0.2, 0xe6d29c); bus(13, -150, -0.3, 0xd9b74a);
  // 675 KM tag above the road (s1), AUDIRA board by the road
  const kmTag = tag(1.75, 0.66, card([["675 KM", fM(700), INK, 0.62], ["VILNIUS → RIGA → TALLINN", fH(700), "#5B4A35", 0.4]], { accent: DUSK }), 1100);
  const roadBoard = board(ROAD, 6, 1.8, 2.4); roadBoard.position.set(9.4, 0.3, -24); roadBoard.rotation.y = -0.3;
  // village clock tower (s5)
  const TOWER = new THREE.Group(); ROAD.add(TOWER); TOWER.position.set(14, 0.2, -102);
  add(new THREE.BoxGeometry(4.2, 13, 4.2), voxAO(std(0xe9dfc8, 0.85), 0.55, -0.5, 0.5), 0, 6.5, 0, TOWER);
  add(new THREE.BoxGeometry(4.8, 0.5, 4.8), std(0xcbbd9e, 0.8), 0, 13.2, 0, TOWER);
  add(new THREE.BoxGeometry(3.6, 2.8, 3.6), voxAO(std(0xe9dfc8, 0.85)), 0, 14.8, 0, TOWER);
  const roof = add(new THREE.ConeGeometry(3.0, 6, 4), std(0x2f4f4a, 0.5, 0.3), 0, 19.2, 0, TOWER); roof.rotation.y = Math.PI / 4;
  add(new THREE.BoxGeometry(0.2, 1.6, 0.2), std(0xd4af37, 0.3, 0.8), 0, 23, 0, TOWER);
  add(new THREE.BoxGeometry(5.4, 4.2, 9), voxAO(std(0xe1d6bd, 0.85)), 0, 2.1, 6.5, TOWER);
  const nave = add(new THREE.BoxGeometry(5.6, 0.4, 9.2), std(0x8a3a2a, 0.7), 0, 4.4, 6.5, TOWER);
  const clockFace = canvasTex(512, 512, (g, w) => { g.fillStyle = "#F7F0DC"; g.beginPath(); g.arc(w / 2, w / 2, w * 0.46, 0, 7); g.fill(); g.lineWidth = 18; g.strokeStyle = "#2a2a2a"; g.stroke(); g.fillStyle = "#2a2a2a"; for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g.save(); g.translate(w / 2, w / 2); g.rotate(a); g.fillRect(-6, -w * 0.4, 12, k % 3 ? 26 : 50); g.restore(); } });
  const faces = [];
  for (const [rx, ry, px, pz] of [[0, 0, 0, 2.12], [0, -Math.PI / 2, -2.12, 0]]) {
    const F = new THREE.Group(); TOWER.add(F); F.position.set(px, 10.4, pz); F.rotation.y = ry;
    add(new THREE.CircleGeometry(1.5, 32), new THREE.MeshStandardMaterial({ map: clockFace, emissive: 0xfff2d0, emissiveMap: clockFace, emissiveIntensity: 0.6 }), 0, 0, 0.02, F).castShadow = false;
    const hh = add(new THREE.BoxGeometry(0.16, 0.8, 0.05).translate(0, 0.4, 0), std(0x151515), 0, 0, 0.08, F);
    const mh = add(new THREE.BoxGeometry(0.1, 1.2, 0.05).translate(0, 0.6, 0), std(0x151515), 0, 0, 0.12, F);
    faces.push({ hh, mh });
  }
  const bellGlow = new THREE.PointLight(0xffd29a, 0, 30, 2); bellGlow.position.set(0, 14.8, 2.5); TOWER.add(bellGlow);
  // plane and helicopter (s5)
  const PLANE = new THREE.Group(); ROAD.add(PLANE);
  const pm2 = voxAO(std(0xd9d4c8, 0.45, 0.2), 0.6, -0.6, 0.6);
  add(new THREE.BoxGeometry(1.0, 1.0, 6.5), pm2, 0, 0, 0, PLANE);
  add(new THREE.BoxGeometry(11, 0.18, 1.6), pm2, 0, 0.35, -0.6, PLANE);
  add(new THREE.BoxGeometry(3.6, 0.15, 1.0), pm2, 0, 0.2, 2.9, PLANE);
  add(new THREE.BoxGeometry(0.15, 1.4, 1.0), std(0xa8322a, 0.6), 0, 0.8, 2.9, PLANE);
  add(new THREE.BoxGeometry(1.02, 0.25, 6.52), std(0xa8322a, 0.6), 0, -0.1, 0, PLANE);
  add(new THREE.BoxGeometry(0.7, 0.45, 1.0), std(0x1d2a35, 0.15, 0.3), 0, 0.55, -1.6, PLANE);
  const prop = add(new THREE.BoxGeometry(2.4, 0.18, 0.06), std(0x222222), 0, 0, -3.3, PLANE);
  const camCone = add(new THREE.ConeGeometry(5, 18, 24, 1, true).translate(0, -9, 0), basic({ color: 0xfff0c8, opacity: 0.08, side: THREE.DoubleSide }), 0, -0.5, 0, PLANE); camCone.castShadow = false;
  const HELI = new THREE.Group(); ROAD.add(HELI);
  add(new THREE.BoxGeometry(1.6, 1.5, 3.0), voxAO(std(0x3f5f7a, 0.4, 0.2), 0.6, -0.75, 0.75), 0, 0, 0, HELI);
  add(new THREE.BoxGeometry(1.4, 0.8, 1.0), std(0x1d2a35, 0.15, 0.3), 0, 0.2, -1.6, HELI);
  add(new THREE.BoxGeometry(0.35, 0.35, 4.2), std(0x3f5f7a, 0.5), 0, 0.3, 3.4, HELI);
  add(new THREE.BoxGeometry(0.1, 1.0, 0.5), std(0x3f5f7a, 0.5), 0.2, 0.7, 5.4, HELI);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.12, 0.12, 3.2), std(0x222222), s * 0.8, -0.95, 0, HELI);
  const rotor = add(new THREE.BoxGeometry(8, 0.08, 0.35), std(0x222222), 0, 0.95, 0, HELI);
  const rotor2 = add(new THREE.BoxGeometry(0.35, 0.08, 8), std(0x222222), 0, 0.95, 0, HELI);

  // ======================================================================================
  // CAMERA (per stage). Map cameras use map units, road cameras metres. Cuts happen under panel changes.
  // ======================================================================================
  const CR = CITIES;
  const CAM_S1 = track([[0, 3.1, 1.7, 30, 5.6, 1.75, 6], [A("s1:enam"), 3.15, 1.8, 18, 5.6, 1.75, -6], [K.s2, 3.2, 2.1, 6, 5.5, 1.7, -18]]);
  const CAM_MAP = track([
    [K.s2 - 0.05, 2, 26, 96, 0, 0, 40],
    [A("s2:Estonia"), 5, 100, 122, 3, 0, 4],
    [A("s2:Lituania"), 5, 124, 136, 3, 0, 0],
    [A("s2:dikuasai"), 4, 134, 142, 2, 0, -2],
    [K.s3 - 0.1, 3, 136, 144, 2, 0, -3],
    [A("s3:Pakta"), 2, 104, 118, 1, 10, -1],
    [A("s3:membagi"), 1, 82, 102, 0, 16, 0],
    [A("s3:menyangkal"), 0, 74, 96, 0, 17, 1],
    [K.s4 - 0.1, 0, 72, 94, 0, 17, 1],
    [K.s4 + 0.6, 16, 44, 92, 9, 0, 40],
    [A("s4:Vilnius"), 16, 40, 84, 8, 0, 34],
    [A("s4:Riga"), 6, 44, 38, -2, 0, -4],
    [A("s4:Tallinn"), 12, 46, -6, 6, 0, -42],
    [A("s4:jatah"), 12, 74, 34, 6, 0, -14],
    [A("s4:bus"), 10, 86, 56, 5, 0, -8],
    [K.s5 - 0.1, 10, 90, 60, 5, 0, -8],
  ]);
  const CAM_S5 = track([[K.s5 - 0.05, 3.0, 1.75, -66, 5.6, 2.0, -90], [A("s5:bergandengan"), 3.05, 1.8, -69, 5.6, 2.1, -93], [A("s5:menit"), 3.1, 1.9, -72, 5.5, 2.4, -96], [A("s5:pesawat"), 3.1, 2.0, -74, 5.4, 2.8, -98], [A("s5:menunjukkan"), 2.8, 3.2, -77, 5.0, 2.6, -101], [K.s6 - 0.1, 2.4, 4.6, -80, 4.6, 2.2, -106]]);
  const CAM_MAP2 = track([
    [K.s6 - 0.05, 10, 52, 64, 4, 0, 20],
    [A("s6:satu"), 10, 70, 76, 4, 0, 10],
    [A("s6:delapan"), 8, 110, 112, 4, 0, 0],
    [A("s6:dua#2"), 8, 120, 120, 4, 0, -2],
    [K.s7 - 0.1, 6, 120, 120, 4, 0, -2],
    [K.s7 + 0.4, -16, 50, 72, -18, 12, 10],
    [A("s7:histeria"), -18, 42, 66, -19, 12, 10],
    [A("s7:Desember"), -6, 64, 90, 0, 15, 4],
    [A("s7:protokol"), -2, 70, 94, 0, 16, 2],
    [A("s7:sebelas"), -6, 62, 104, -6, 2, 34],
    [A("s7:Lituania"), -8, 58, 102, -6, 2, 36],
    [K.s8 - 0.1, -6, 66, 108, -4, 2, 30],
    [A("s8:Eropa"), 6, 150, 136, 4, 0, 6],
    [K.end + 0.6, 6, 210, 168, 4, 0, 4],
  ]);
  const look = new THREE.Vector3(), lookPrev = new THREE.Vector3();
  const sunOff = { road: new THREE.Vector3(-70, 26, -110), map: new THREE.Vector3(-120, 85, -20) };
  const DOCP = new THREE.Vector3(0, 18, 4);

  // ======================================================================================
  // DRAW
  // ======================================================================================
  const MAPONLY = [...cityTags, ...FLAGSPOT.map((f) => f.lab), sovPlaque, routeTag, ...perTags, DOC, ...sideTags, PAPER, ltTag, GLW.P];
  const ROADONLY = [kmTag, candG.P];
  let lastTileKey = "", lastRoadKey = "", lastMfKey = "";
  const armM = new THREE.Matrix4(), rotZ = new THREE.Matrix4(), rotX = new THREE.Matrix4(), shoulder = new THREE.Matrix4();
  return function draw(t) {
    const onRoad = t < K.s2 || (t >= K.s5 && t < K.s6);
    ROAD.visible = onRoad; MAP.visible = !onRoad;
    for (const m of MAPONLY) m.visible = false;
    for (const m of ROADONLY) m.visible = false;
    scene.background = onRoad ? SKY_ROAD : SKY_MAP;
    scene.fog = onRoad ? FOG_ROAD : FOG_MAP;
    const night = !onRoad ? smooth((t - A("s8:Tangan") + 0.5) / 2.0) : 0;

    // ---------------- camera ----------------
    let c;
    if (t < K.s2) c = CAM_S1(t); else if (t < K.s5) c = CAM_MAP(t); else if (t < K.s6) c = CAM_S5(t); else c = CAM_MAP2(t);
    cam.position.set(c[0], c[1], c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    // light follows the look target
    const so = onRoad ? sunOff.road : sunOff.map;
    sun.target.position.copy(look); sun.position.copy(look).add(so);
    const sh = onRoad ? 60 : 95;
    Object.assign(sun.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 1, far: 600 }); sun.shadow.camera.updateProjectionMatrix();
    sun.intensity = (onRoad ? 3.0 : 2.6) * (1 - 0.65 * night); hemi.intensity = (onRoad ? 0.95 : 0.85) * (1 - 0.55 * night);
    rim.position.copy(look).add(new THREE.Vector3(80, 40, 120));
    // tilt-shift: focus on the look target's screen row
    tmpV.copy(look).project(cam);
    const fy = clamp01((tmpV.y + 1) / 2);
    for (const p of tilts) { p.uniforms.focus.value = fy; p.uniforms.band.value = onRoad ? 0.08 : 0.13; p.uniforms.amt.value = onRoad ? 7 : 5.5; }

    if (onRoad) {
      // ---------------- road stage ----------------
      const s5 = t >= K.s5;
      const linkT0 = A("s5:bergandengan") - 0.35;
      for (let k = 0; k < NP; k++) {
        const p = PPL[k];
        let aL, aR, xR = 0, xL = 0;
        const sway = Math.sin(t * 1.3 + p.ph) * 0.03;
        if (p.link) {
          let lk = 1;
          if (s5) { const d = Math.abs(p.z - (-82)); lk = smooth((t - linkT0 - d * 0.012) / 0.45); }
          // raised joined hands: right row near the hook camera in s1, the right row in a wave after "tangan" in s5
          let rz = 0;
          if (!s5 && p.side > 0 && p.z > -26) rz = 1;
          if (s5 && p.side > 0) rz = smooth((t - A("s5:tangan") - 0.1 - Math.abs(p.z + 72) * 0.01) / 0.5);
          const lo = 0.1 + lk * 0.37, a = lo + (2.55 - lo) * rz;
          aL = -a + sway * (1 - rz); aR = a + sway * (1 - rz);
        } else {
          aL = -0.08 + sway; aR = 0.12; if (p.prop !== "none") { xR = -1.05; aR = 0.18; } else xR = 0;
        }
        for (const [n, sgn, a, xr] of [["armL", -1, aL, xL], ["armR", 1, aR, xR]]) {
          shoulder.makeTranslation(sgn * 0.355, 1.43, 0); rotZ.makeRotationZ(a); rotX.makeRotationX(xr);
          armM.multiplyMatrices(p.base, shoulder).multiply(rotZ).multiply(rotX);
          PART[n].setMatrixAt(k, armM); PART[n === "armL" ? "handL" : "handR"].setMatrixAt(k, armM);
        }
      }
      PART.armL.instanceMatrix.needsUpdate = PART.armR.instanceMatrix.needsUpdate = PART.handL.instanceMatrix.needsUpdate = PART.handR.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < CAND.length; i++) { const f = 0.75 + 0.25 * Math.sin(t * 9 + i * 1.7) * Math.sin(t * 5.3 + i); candG.col[i * 3] = f; candG.col[i * 3 + 1] = 0.72 * f; candG.col[i * 3 + 2] = 0.42 * f; }
      candG.commit(); candG.P.visible = true;
      flagHeld.forEach((f) => waveFlag(f.fm, t, 0.12, 4, f.ph));
      // 675 km tag
      { const k = t < K.s2 ? win(t, A("s1:enam") - 0.3, K.s2 - 0.2, 0.4, 0.3) : 0; cam.getWorldDirection(tmpS); kmTag.position.copy(cam.position).addScaledVector(tmpS, 9).add(new THREE.Vector3(-0.7, -0.58, 0)); bill(kmTag, k); }
      // clock: 19.00 then 15 minutes compressed over the hold
      const mins = s5 ? 15 * clamp01((t - A("s5:bergandengan")) / (A("s5:menit") + 0.4 - A("s5:bergandengan"))) : 0;
      faces.forEach((f) => { f.mh.rotation.z = -(mins / 60) * Math.PI * 2; f.hh.rotation.z = -((7 + mins / 60) / 12) * Math.PI * 2; });
      { const d = t - A("s5:Pukul"); bellGlow.intensity = s5 && d > 0 && d < 2.5 ? 60 * Math.exp(-d * 1.6) : 0; }
      // plane + helicopter
      { const t0 = A("s5:Pukul") - 0.5; const u = (t - t0) / 9; PLANE.visible = s5 && u > -0.05 && u < 1.2; PLANE.position.set(2.5 + Math.sin(u * 2) * 1.5, 12.5, -100 - u * 110); PLANE.rotation.set(0, 0, Math.sin(u * 3) * 0.08); prop.rotation.z = t * 40; camCone.material.opacity = 0.09 * clamp01(u * 4); }
      { const t0 = A("s5:Pukul") - 0.5; const u = (t - t0) / 9; HELI.visible = s5 && u > -0.05; HELI.position.set(-4 + u * 3, 9.5 + Math.sin(t * 1.4) * 0.3, -122 - u * 10); HELI.rotation.set(0.12, 0.6, 0.04); rotor.rotation.y = t * 22; rotor2.rotation.y = t * 22; }
      MF.visible = false;
    } else {
      candG.P.visible = false;
      // ---------------- map stage ----------------
      // country lifts (s2), Soviet tint (s2-s3), Lithuania flag stripes (s7)
      const liftOf = (name, ci) => { if (t < K.s2 || t > K.s3 + 1) return 0; const a = A("s2:" + name) - 0.15; return 1.4 * back(clamp01((t - a) / 0.45), 2) * (1 - 0.6 * smooth((t - a - 0.6) / 0.8)) * (1 - smooth((t - K.s3 + 0.3) / 0.9)); };
      const L = [0, liftOf("Estonia", 1), liftOf("Latvia", 2), liftOf("Lituania", 3)];
      const red = t < K.s4 ? 0.55 * smooth((t - A("s2:dikuasai") + 0.2) / 0.8) * (1 - smooth((t - K.s4 + 0.4) / 0.8)) : 0;
      const ltF = smooth((t - A("s7:sebelas") - 0.2) / 1.0) * (1 - smooth((t - K.s8 - 0.2) / 1.2));
      const lit = [1, 2, 3].map((ci) => t >= K.s6 && t < K.s7 ? win(t, A("s6:dua#2") - 0.3 + (ci - 1) * 0.25, K.s7 - 0.3, 0.35, 0.4) : 0);
      const key = L.map((v) => v.toFixed(3)).join() + red.toFixed(3) + ltF.toFixed(3) + night.toFixed(2);
      if (key !== lastTileKey) {
        lastTileKey = key;
        const RED = C("#9E1B1B"), tmpC = new THREE.Color();
        const ltz0 = PJ(0, 56.45)[1], ltz1 = PJ(0, 53.9)[1];
        for (const k of BALTIC) {
          const cl = CELLS[k];
          tmpM.makeScale(1, cl.h + 3, 1); tmpM.setPosition(cl.x, cl.h + L[cl.c], cl.z); TILES.setMatrixAt(k, tmpM);
          tmpC.copy(cl.col);
          if (red > 0) tmpC.lerp(RED, red * (cl.border ? 0.3 : 1));
          if (cl.c === 3 && ltF > 0 && !cl.border) { const u = (cl.z - ltz0) / (ltz1 - ltz0); const fc = C(u < 0.36 ? LT[0] : u < 0.68 ? LT[1] : LT[2]); tmpC.lerp(fc, ltF * 0.85); }
          if (night > 0) tmpC.multiplyScalar(1 - 0.35 * night);
          TILES.setColorAt(k, tmpC);
        }
        TILES.instanceMatrix.needsUpdate = true; TILES.instanceColor.needsUpdate = true;
        for (const k of BTREES) setTree(k, L[CELLS[TREES[k].k].c]);
        TREEM.instanceMatrix.needsUpdate = true;
      }
      FLAGSPOT.forEach((f, i) => {
        const k = Math.max(t < K.s3 ? win(t, A("s2:" + ["Estonia", "Latvia", "Lituania"][i]) - 0.1, K.s3 - 0.2, 0.4, 0.4) : 0, t >= K.s6 ? win(t, K.s6 + 0.2, K.dur + 5, 0.5, 0.5) : 0, t >= K.s4 && t < K.s5 ? win(t, K.s4 + 0.4, K.s5, 0.5, 0.3) : 0);
        f.G.visible = k > 0.002; f.G.scale.setScalar(Math.max(0.001, back(k, 1.6)));
        f.G.position.y = groundH(f.x, f.z) + L[i + 1];
        waveFlag(f.fm, t, 0.45, 3.0, i);
        const kl = t < K.s3 ? k : 0;
        f.lab.position.set(f.x, groundH(f.x, f.z) + L[i + 1] + 14.2, f.z); bill(f.lab, kl);
      });
      { const k = t < K.s3 ? win(t, A("s2:dikuasai") - 0.1, K.s3 - 0.2, 0.35, 0.3) : 0; sovPlaque.position.set(4, 14, 14); bill(sovPlaque, k); }
      // document
      {
        const kIn = t < K.s4 ? win(t, A("s3:Pakta") - 0.4, K.s4 - 0.3, 0.6, 0.4) : 0;
        const kBack = t >= K.s7 ? win(t, A("s7:Desember") - 0.5, A("s7:sebelas") - 0.6, 0.6, 0.5) : 0;
        const k = Math.max(kIn, kBack);
        DOC.visible = k > 0.002;
        if (DOC.visible) {
          const split = t < K.s4 ? smooth((t - A("s3:membagi")) / 0.8) : 1 - smooth((t - A("s7:mengakui") + 0.5) / 0.8);
          const pos = t < K.s4 ? DOCP : new THREE.Vector3(0, 12, 8);
          DOC.position.copy(pos); DOC.position.y += (1 - eout(k)) * 10; DOC.quaternion.copy(cam.quaternion);
          DOC.scale.setScalar(Math.max(0.001, k));
          docHalf[0].position.set(-split * 4.2, -split * 0.6, 0); docHalf[0].rotation.z = split * 0.09;
          docHalf[1].position.set(split * 4.2, split * 0.3, 0); docHalf[1].rotation.z = -split * 0.07;
          const kd = t < K.s4 ? clamp01((t - A("s3:menyangkal") + 0.1) / 0.18) : 0;
          stampDeny.visible = kd > 0; stampDeny.position.set(5.2 + split * 4.2, 3.2, 0.2); stampDeny.scale.setScalar(1.8 - 0.8 * kd); stampDeny.material.opacity = kd;
          const ko = t >= K.s7 ? clamp01((t - A("s7:mengakui") - 0.25) / 0.18) : 0;
          stampOk.visible = ko > 0; stampOk.scale.setScalar(1.8 - 0.8 * ko); stampOk.material.opacity = ko;
        }
        const ks = [t < K.s4 ? win(t, A("s3:Jerman") - 0.2, K.s4 - 0.4, 0.3, 0.3) : 0, t < K.s4 ? win(t, A("s3:Uni") - 0.2, K.s4 - 0.4, 0.3, 0.3) : 0];
        sideTags.forEach((m, i) => { tmpV.set((i ? 1 : -1) * 11.5, -15.5, 0.5).applyQuaternion(cam.quaternion).add(DOC.position); m.position.copy(tmpV); bill(m, ks[i]); });
      }
      // route draw-on (s4) and later states
      {
        const tV = A("s4:Vilnius") - 0.4, tR = A("s4:Riga"), tT = A("s4:Tallinn") + 0.2;
        const uRiga = CITY_U[3];
        let prog = 0;
        if (t >= K.s4) prog = t < tR ? uRiga * smooth((t - tV) / (tR - tV)) : uRiga + (1 - uRiga) * smooth((t - tR) / (tT - tR));
        if (t >= K.s5) prog = 1;
        const segK = t >= K.s4 ? smooth((t - A("s4:jatah") + 0.4) / 1.0) * (t < K.s6 ? 1 : 1 - smooth((t - K.s6) / 0.6)) : 0;
        const rk = prog.toFixed(3) + segK.toFixed(2) + night.toFixed(2);
        if (rk !== lastRoadKey) {
          lastRoadKey = rk;
          const tc = new THREE.Color();
          ROADT.forEach((rt, k) => { const v = rt.u <= prog ? 1 : 0; tmpQ.setFromAxisAngle(Y, rt.yaw); tmpS.set(v ? 1 : 0.001, v ? 1 : 0.001, 1); tmpM.compose(tmpV.set(rt.x, rt.y, rt.z), tmpQ, tmpS); ROADM.setMatrixAt(k, tmpM); tc.copy(ASPH).lerp(SEGCOL[rt.seg % SEGCOL.length], segK * 0.9); ROADM.setColorAt(k, tc); });
          ROADM.instanceMatrix.needsUpdate = true; ROADM.instanceColor.needsUpdate = true;
        }
        ROADM.visible = t >= K.s4;
        CITIES.forEach((cty, i) => {
          let k = 0;
          if (t >= K.s4 && t < K.s5) { const reach = i === 0 ? K.s4 + 0.6 : i <= 3 ? tV + (tR - tV) * (CITY_U[i] / uRiga) : tR + (tT - tR) * ((CITY_U[i] - uRiga) / (1 - uRiga)); k = win(t, reach - 0.1, K.s5 - 0.3, 0.35, 0.3); }
          if (t >= K.s6 && t < K.s7 && cty.big) k = win(t, K.s6 + 0.3, A("s6:Untuk") - 0.2, 0.4, 0.3);
          if (t >= K.s8 && cty.big) k = win(t, A("s8:Eropa") - 0.3, K.dur + 5, 0.5, 0.5) * 0.95;
          cityTags[i].position.set(cty.x, cty.big ? 7.2 : 5.6, cty.z); bill(cityTags[i], k, t >= K.s8 ? 1.6 : 1);
        });
        CITYM.visible = true;
        // buses ride the route
        const tb = A("s4:bus") - 0.5;
        BUSES.forEach((b, i) => {
          const k = t >= K.s4 && t < K.s5 ? win(t, tb + i * 0.08, K.s5 - 0.2, 0.3, 0.3) : 0;
          b.G.visible = k > 0.002; if (!b.G.visible) return;
          const u = clamp01(b.u0 + b.dir * (t - tb) * 0.012), p = routeAt(u);
          b.G.position.set(p.x + p.tz * 0.9, Math.max(groundH(p.x, p.z), 1.0) + 0.1, p.z - p.tx * 0.9); b.G.rotation.y = Math.atan2(p.tx, p.tz) + (b.dir < 0 ? Math.PI : 0); b.G.scale.setScalar(1.25 * Math.max(0.001, back(k, 1.6)));
        });
        { const k = t < K.s5 && t >= K.s4 ? win(t, A("s4:Tallinn") + 0.2, A("s4:jatah") - 0.3, 0.35, 0.3) : 0; routeTag.position.set(24, 8, -26); bill(routeTag, k); }
      }
      // tiny figures + light line (s6..s8)
      {
        const kF = t >= K.s6 ? 1 : 0;
        MF.visible = MFHEAD.visible = kF > 0;
        const mk = (kF ? "1" : "0") + lit.map((v) => v.toFixed(2)).join() + night.toFixed(2);
        if (kF && mk !== lastMfKey) {
          lastMfKey = mk;
          const tc = new THREE.Color();
          MFS.forEach((m, k) => { tc.copy(SHIRT[k % SHIRT.length]); const l = m.c >= 1 && m.c <= 3 ? lit[m.c - 1] : 0; if (l > 0) tc.lerp(C("#FFE0A0"), 0.6 * l); MF.setColorAt(k, tc); });
          MF.instanceColor.needsUpdate = true;
          MF.material.emissiveIntensity = 0.6 + 1.6 * night;
        }
        GLW.P.visible = kF > 0;
        if (kF) {
          const gl = 0.45 + 0.55 * night;
          for (let k = 0; k < NGL; k++) { const b = GLB[k]; GLW.pos[k * 3] = b.x; GLW.pos[k * 3 + 1] = b.y; GLW.pos[k * 3 + 2] = b.z; const l = b.c >= 1 && b.c <= 3 ? lit[b.c - 1] : 0; const f = gl * (0.75 + 0.25 * Math.sin(t * 3 + b.ph)) + 0.6 * l; GLW.col[k * 3] = f; GLW.col[k * 3 + 1] = 0.74 * f; GLW.col[k * 3 + 2] = 0.45 * f; }
          GLW.commit(); GLW.m.size = 1.3 + 1.2 * night;
        }
        perTags.forEach((m, i) => { const [x, y, z] = segMid[i]; m.position.set(x + 14, y + 9, z + (i === 2 ? 6 : 0)); bill(m, lit[i]); });
      }
      // newspaper (s7)
      {
        const k = t >= K.s7 ? win(t, K.s7 + 0.1, A("s7:Desember") - 0.4, 0.5, 0.5) : 0;
        PAPER.visible = k > 0.002;
        if (PAPER.visible) { PAPER.position.set(-19, 12 + (1 - eout(k)) * 8, 10); PAPER.quaternion.copy(cam.quaternion); PAPER.rotateZ(0.05 - (1 - k) * 0.3); PAPER.scale.setScalar(Math.max(0.001, k)); }
      }
      // Lithuania 11.03.1990
      { const k = t >= K.s7 ? win(t, A("s7:sebelas") + 0.2, K.s8 + 0.4, 0.4, 0.4) : 0; ltTag.position.set(-6, 7, 52); bill(ltTag, k); if (t >= K.s7 && t < K.s8 + 0.6) { const f = FLAGSPOT[2]; const kk = smooth((t - A("s7:Lituania") + 0.3) / 0.6); f.G.scale.setScalar(Math.max(0.001, 1 + 0.25 * kk)); } }
      // AUDIRA board on the map
      mapBoard.visible = (t >= K.s6 && t < A("s7:sebelas") - 0.3) || t >= K.s8;
      water.material.opacity = 0.35 * (1 - 0.4 * night);
    }
    comp.render();
  };
}
