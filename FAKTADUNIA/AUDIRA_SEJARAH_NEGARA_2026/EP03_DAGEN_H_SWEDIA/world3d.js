// DAGEN H: a matte white architectural maquette of a 1960s Stockholm crossroads on a dark table, lit by a low dawn sun.
// Cars drive on the left, stop at 04.50, glide diagonally to the right, and roll again at 05.00. Everything is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, std, box as box0, cyl as cyl0, stage, pts } from "./lib3d.js";
import { GEO } from "./scandi-geo.js";

const BLUE = 0x006aa7, YEL = 0xfecc02;
const MAPX = -64, RAIL = 40, L = 64;

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp } = stage(canvas, { bg: 0x0d0e10, fog: 0.0042, exp: 1.0, bloom: [0.2, 0.45, 0.93] });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1967);
  // lib3d helpers only attach to a parent; unparented parts go straight into the scene
  const box = (...a) => { const m = box0(...a); if (!a[7]) scene.add(m); return m; };
  const cyl = (...a) => { const m = cyl0(...a); if (!a[8]) scene.add(m); return m; };

  const hemi = new THREE.HemisphereLight(0xe2e9f3, 0x2b2722, 1.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffcd94, 3.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 300 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xa9bcd6, 0.6);
  fill.position.set(-60, 40, 40);
  scene.add(fill);

  // ---------- materials: white board, grey road, two flag accents, black plastic and tape
  const WH = std(0xf1efe9, 0.88), WH2 = std(0xe4e1da, 0.9), ROAD = std(0xc9c7c1, 0.95), LOT = std(0xd6d4ce, 0.95);
  const TABLE = std(0x16171a, 0.8, 0.05), DARK = std(0x2b2e33, 0.55), TIRE = std(0x1e1f22, 0.7);
  const BLU = std(BLUE, 0.55), YLW = std(YEL, 0.5), GLASS = std(0x7f8a94, 0.3, 0.15);
  const OLDY = std(0xe0ad16, 0.7), PAINT = std(0xffffff, 0.55), TAPE = std(0x0e0e10, 0.42);
  const BAG = std(0x0a0a0b, 0.28, 0.0, { flatShading: true });
  const GRAV = std(0xb5b1a9, 0.98), RAILM = std(0x8d9196, 0.35, 0.6);
  const HEAD = new THREE.MeshStandardMaterial({ color: 0xfff3d0, emissive: 0xfff0c8, emissiveIntensity: 0.9 });
  const TAIL = new THREE.MeshStandardMaterial({ color: 0x8a1a12, emissive: 0xff2a10, emissiveIntensity: 0.5 });
  const IND = new THREE.MeshStandardMaterial({ color: 0x8a5a00, emissive: 0xffa000, emissiveIntensity: 0 });
  const LR = new THREE.MeshStandardMaterial({ color: 0x3a0d0b, emissive: 0xff2a14, emissiveIntensity: 0 });
  const LA = new THREE.MeshStandardMaterial({ color: 0x3a2a08, emissive: 0xffa20a, emissiveIntensity: 0 });
  const LG = new THREE.MeshStandardMaterial({ color: 0x0a2a18, emissive: 0x2cff86, emissiveIntensity: 0 });
  const winCache = {};
  const WIN = (rx, ry) => {
    const k = rx + "x" + ry;
    if (!winCache[k]) {
      const tx = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#f1efe9"; g.fillRect(0, 0, w, h); g.fillStyle = "#cdc9c0"; g.fillRect(0, h - 10, w, 10); g.fillRect(0, 0, 7, h); g.fillStyle = "#dcd9d1"; g.fillRect(20, 26, 88, 62); }, [rx, ry]);
      winCache[k] = std(0xffffff, 0.9, 0, { map: tx });
    }
    return winCache[k];
  };

  // ---------- table and boards
  const table = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), TABLE);
  table.rotation.x = -Math.PI / 2; table.position.y = -0.62; table.receiveShadow = true;
  scene.add(table);
  box(88, 0.6, 74, WH2, 7, -0.3, 0);                       // city board x -37..51
  box(32, 0.6, 36, WH2, MAPX, -0.3, -1);                   // map board
  const plat = (x0, x1, z0, z1, h, m) => box(x1 - x0, h, z1 - z0, m, (x0 + x1) / 2, h / 2, (z0 + z1) / 2);
  plat(-37, -5.5, -37, -5.5, 0.22, WH); plat(5.5, 34, -37, -5.5, 0.22, WH);
  plat(-37, -5.5, 5.5, 37, 0.22, WH); plat(5.5, 34, 5.5, 37, 0.22, WH);
  box(71, 0.04, 8, ROAD, -1.5, 0.02, 0);
  box(8, 0.04, 74, ROAD, 0, 0.02, 0);
  box(16, 0.12, 74, GRAV, 42, 0.06, 0);
  box(25, 0.03, 23, LOT, -20, 0.235, 18);

  // old yellow centre dashes (left-traffic era)
  for (let x = -35; x < 33; x += 3) if (Math.abs(x) > 6) box(1.6, 0.03, 0.16, OLDY, x, 0.05, 0);
  for (let z = -35; z < 36; z += 3) if (Math.abs(z) > 6) box(0.16, 0.03, 1.6, OLDY, 0, 0.05, z);

  // markings: new white (right traffic) painted on s4, taped over, peeled on Dagen H. Old yellow ones fade after the switch.
  const arrowGeo = (() => { const s = new THREE.Shape(); s.moveTo(-1.2, -0.17); s.lineTo(0.3, -0.17); s.lineTo(0.3, -0.48); s.lineTo(1.25, 0); s.lineTo(0.3, 0.48); s.lineTo(0.3, 0.17); s.lineTo(-1.2, 0.17); s.closePath(); const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); return g; })();
  const strip = (w, d, mat, y) => { const g = new THREE.BoxGeometry(w, 0.03, d); g.translate(w / 2, 0, 0); const m = new THREE.Mesh(g, mat); m.position.y = y; m.receiveShadow = true; scene.add(m); return m; };
  const NEW = [], TAPES = [];
  // stop lines: [startX, startZ, rotY] so the strip runs across the right-hand lane from the centre line outwards
  const ROT = { "+x": 0, "-x": Math.PI, "+z": -Math.PI / 2, "-z": Math.PI / 2 };
  [[-5.25, 0.1, "+z"], [5.25, -0.1, "-z"], [0.1, 5.25, "+x"], [-0.1, -5.25, "-x"]].forEach(([x, z, ax], i) => {
    const nw = strip(3.8, 0.36, PAINT, 0.055); nw.position.set(x, 0.055, z); nw.rotation.y = ROT[ax]; NEW.push({ m: nw, k: i * 0.08 });
    const tp = strip(3.9, 0.56, TAPE, 0.075); tp.position.set(x, 0.075, z); tp.rotation.y = ROT[ax]; TAPES.push({ m: tp, k: i * 0.08 });
  });
  // old yellow stop lines on the left-hand halves
  [[-5.25, -2, 0.36, 3.8], [5.25, 2, 0.36, 3.8], [-2, 5.25, 3.8, 0.36], [2, -5.25, 3.8, 0.36]].forEach(([x, z, w, d]) => box(w, 0.03, d, OLDY, x, 0.05, z));
  // arrows: [x, z, rotY], right-hand lanes; old yellow ones sit in the mirrored lane
  const arrows = [[-12, 2, 0, -12, -2], [12, -2, Math.PI, 12, 2], [2, 12, Math.PI / 2, -2, 12], [-2, -12, -Math.PI / 2, 2, -12]];
  const dirOf = (ry) => [Math.cos(ry), -Math.sin(ry)];
  arrows.forEach(([x, z, ry, ox, oz], i) => {
    const a = new THREE.Mesh(arrowGeo, PAINT); a.position.set(x, 0.055, z); a.rotation.y = ry; scene.add(a); NEW.push({ m: a, k: 0.35 + i * 0.08, arrow: true });
    const t = strip(2.9, 1.25, TAPE, 0.075); t.rotation.y = ry; const [dx, dz] = dirOf(ry); t.position.set(x - dx * 1.45, 0.075, z - dz * 1.45); TAPES.push({ m: t, k: 0.35 + i * 0.08 });
    const o = new THREE.Mesh(arrowGeo, OLDY); o.position.set(ox, 0.05, oz); o.rotation.y = ry; scene.add(o);
  });

  // ---------- buildings
  // NW: four slab towers in a row, 1960s Hötorget feel (generic)
  [[-12, -12, 15.5], [-18, -16, 14], [-24, -20, 15], [-30, -24, 13.5]].forEach(([x, z, h]) => {
    box(7.2, h, 2.6, WIN(4, Math.round(h / 1.1)), x, 0.22 + h / 2, z);
    box(7.6, 0.4, 3.0, WH, x, 0.22 + h + 0.2, z);
  });
  box(20, 2.6, 4.2, WIN(10, 2), -21, 1.52, -8.4);
  box(9, 5, 7, WIN(5, 4), -30, 2.72, -31);
  // NE: plaza with the H monolith, then the parliament with columns and a flag
  const PX = 21, PZ = -22;
  box(16, 4.6, 8, WIN(8, 3), PX, 0.22 + 2.3, PZ);
  box(17, 0.6, 9, WH, PX, 4.82 + 0.3, PZ);
  box(10, 1.0, 5.5, WH, PX, 5.9, PZ);
  for (let i = 0; i < 9; i++) cyl(0.32, 0.36, 4.4, 14, WH, PX - 7 + i * 1.75, 0.22 + 2.2, PZ + 4.9);
  box(17, 0.5, 2.2, WH, PX, 4.9, PZ + 4.9);
  box(17.5, 0.3, 2.8, WH, PX, 0.37, PZ + 5.2);
  cyl(0.06, 0.06, 6, 8, WH, PX, 6.4 + 3, PZ);
  const flagT = canvasTex(160, 100, (g, w, h) => { g.fillStyle = "#006AA7"; g.fillRect(0, 0, w, h); g.fillStyle = "#FECC02"; g.fillRect(50, 0, 20, h); g.fillRect(0, 40, w, 20); });
  const flagG = new THREE.PlaneGeometry(2.4, 1.5, 12, 4);
  const flagBase = flagG.attributes.position.array.slice();
  const flag = new THREE.Mesh(flagG, new THREE.MeshStandardMaterial({ map: flagT, side: THREE.DoubleSide, roughness: 0.7 }));
  flag.position.set(PX + 1.2, 11.6, PZ); flag.castShadow = true; scene.add(flag);
  // SE: a small park, white trees, two low blocks
  const treeM = std(0xeeece6, 0.92, 0, { flatShading: true });
  for (let i = 0; i < 16; i++) {
    const x = 8 + rnd() * 24, z = 9 + rnd() * 25;
    if (x > 20 && z < 20) continue;
    cyl(0.1, 0.12, 1.1, 6, WH, x, 0.77, z);
    const s = 0.7 + rnd() * 0.6;
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), treeM); c.position.set(x, 1.3 + s, z); c.castShadow = c.receiveShadow = true; scene.add(c);
  }
  box(10, 3.2, 6, WIN(6, 3), 26, 1.82, 12);
  box(6, 6.5, 6, WIN(4, 6), 12, 3.47, 30);
  // SW: parking lot, slot lines
  for (let i = 0; i < 11; i++) for (const zr of [9, 15.5, 22]) box(0.08, 0.02, 3.6, PAINT, -29.6 + i * 2.2, 0.26, zr);
  box(6, 4.2, 4, WIN(4, 4), -30, 2.32, 31);

  // ---------- traffic lights at the corners, new ones wrapped in black plastic
  const LIGHTS = [];
  const bagGeo = (() => { const g = new THREE.IcosahedronGeometry(0.62, 1); const p = g.attributes.position, q = mulberry(9), seen = {}; for (let i = 0; i < p.count; i++) { const k = [p.getX(i), p.getY(i), p.getZ(i)].map((v) => v.toFixed(3)).join(","); if (!seen[k]) seen[k] = 0.86 + q() * 0.3; const s = seen[k]; p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s); } g.computeVertexNormals(); g.scale(1, 1.45, 1); return g; })();
  [[-5.9, 5.9], [5.9, -5.9], [5.9, 5.9], [-5.9, -5.9]].forEach(([x, z], i) => {
    const G = new THREE.Group(); G.position.set(x, 0.22, z); scene.add(G);
    cyl(0.09, 0.11, 3.5, 10, WH, 0, 1.75, 0, G);
    box(0.5, 1.4, 0.5, DARK, 0, 3.9, 0, G);
    box(0.56, 0.24, 0.56, LR, 0, 4.35, 0, G); box(0.56, 0.24, 0.56, LA, 0, 3.9, 0, G); box(0.56, 0.24, 0.56, LG, 0, 3.45, 0, G);
    const bag = new THREE.Mesh(bagGeo, BAG); bag.position.set(0, 3.9, 0); bag.castShadow = true; G.add(bag);
    LIGHTS.push({ G, bag, k: i * 0.14 });
  });

  // ---------- signs: old keep-left face, flip to the new blue keep-right face
  const signTex = (nw) => canvasTex(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256); g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fillStyle = nw ? "#006AA7" : "#f4f2ec"; g.fill();
    g.lineWidth = 14; g.strokeStyle = nw ? "#ffffff" : "#1a1a1a"; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke();
    g.save(); g.translate(128, 128); g.rotate(nw ? Math.PI / 4 : (3 * Math.PI) / 4); g.fillStyle = nw ? "#ffffff" : "#1a1a1a";
    g.fillRect(-62, -14, 80, 28); g.beginPath(); g.moveTo(14, -44); g.lineTo(72, 0); g.lineTo(14, 44); g.fill(); g.restore();
  });
  const oldT = signTex(false), newT = signTex(true);
  const SIGNS = [];
  [[-30, 6.2], [-22, -6.2], [-14, 6.2], [12, -6.2], [20, 6.2], [28, -6.2], [-6.4, 14], [6.4, -14]].forEach(([x, z], i) => {
    cyl(0.06, 0.06, 2.8, 8, WH, x, 0.22 + 1.4, z);
    const G = new THREE.Group(); G.position.set(x, 3.2, z); scene.add(G);
    const rim = cyl(0.64, 0.64, 0.08, 28, WH, 0, 0, 0, G); rim.rotation.z = Math.PI / 2;
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshStandardMaterial({ map: oldT, roughness: 0.7 })); f.rotation.y = -Math.PI / 2; f.position.x = -0.045; G.add(f);
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshStandardMaterial({ map: newT, roughness: 0.6 })); b.rotation.y = Math.PI / 2; b.position.x = 0.045; G.add(b);
    SIGNS.push({ G, k: i * 0.13, base: Math.abs(x) < 7 ? (z > 0 ? -Math.PI / 2 : Math.PI / 2) : 0 });
  });

  // ---------- H monolith: blue slab, yellow H with a lane arrow, rises on Dagen H
  // the monolith stands against the sun, so its paint carries a little self-light to stay readable
  const HB = std(BLUE, 0.5, 0, { emissive: BLUE, emissiveIntensity: 0.3 }), HY = std(YEL, 0.45, 0, { emissive: YEL, emissiveIntensity: 0.42 });
  const HG = new THREE.Group(); HG.position.set(34, 0.12, 0); HG.scale.z = 1.35; scene.add(HG);
  box(1.6, 0.5, 7.6, WH, 0, 0.25, 0, HG);
  box(1.0, 10, 6.6, HB, 0, 5.4, 0, HG);
  for (const fx of [-0.62, 0.62]) {
    // the same H on both faces, so it reads from the street and from the overhead shots
    box(0.3, 6.2, 1.15, HY, fx, 5.6, -1.75, HG); box(0.3, 6.2, 1.15, HY, fx, 5.6, 1.75, HG);
    box(0.3, 1.05, 2.4, HY, fx, 5.6, 0, HG);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 3), HY); tip.rotation.set(Math.PI / 2, 0, Math.PI / 2); tip.position.set(fx, 1.6, fx < 0 ? 0.9 : -0.9); tip.castShadow = true; HG.add(tip);
    box(0.3, 0.42, 2.2, HY, fx, 1.6, fx < 0 ? -0.6 : 0.6, HG);
  }

  // ---------- cars
  const sedan = (() => { const s = new THREE.Shape(); s.moveTo(-1.55, 0.28); s.lineTo(1.55, 0.28); s.quadraticCurveTo(1.68, 0.3, 1.66, 0.55); s.quadraticCurveTo(1.6, 0.74, 1.3, 0.76); s.lineTo(0.72, 0.8); s.quadraticCurveTo(0.5, 1.16, 0.3, 1.18); s.lineTo(-0.55, 1.18); s.quadraticCurveTo(-0.85, 1.12, -1.0, 0.84); s.lineTo(-1.45, 0.8); s.quadraticCurveTo(-1.66, 0.74, -1.65, 0.5); s.closePath(); return s; })();
  const beetle = (() => { const s = new THREE.Shape(); s.moveTo(-1.45, 0.28); s.lineTo(1.45, 0.28); s.quadraticCurveTo(1.62, 0.36, 1.55, 0.6); s.quadraticCurveTo(1.35, 0.8, 0.85, 0.85); s.quadraticCurveTo(0.45, 1.32, -0.2, 1.3); s.quadraticCurveTo(-1.1, 1.26, -1.45, 0.75); s.quadraticCurveTo(-1.62, 0.5, -1.45, 0.28); return s; })();
  const ex = (sh) => { const g = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 3, curveSegments: 10 }); g.translate(0, 0, -0.6); return g; };
  const GEOS = { sedan: ex(sedan), beetle: ex(beetle) };
  const wheelG = new THREE.CylinderGeometry(0.29, 0.29, 0.24, 14); wheelG.rotateX(Math.PI / 2);
  const makeCar = (kind, mat) => {
    const G = new THREE.Group();
    const b = new THREE.Mesh(GEOS[kind], mat); b.castShadow = b.receiveShadow = true; G.add(b);
    const gl = kind === "sedan" ? box(0.95, 0.27, 1.38, GLASS, -0.12, 0.97, 0, G) : box(0.95, 0.24, 1.38, GLASS, -0.08, 1.0, 0, G);
    gl.castShadow = false;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = new THREE.Mesh(wheelG, TIRE); w.position.set(sx * (kind === "sedan" ? 1.0 : 0.95), 0.29, sz * 0.6); G.add(w); }
    for (const sz of [-0.42, 0.42]) { box(0.06, 0.12, 0.2, HEAD, 1.66, 0.58, sz, G).castShadow = false; box(0.06, 0.1, 0.18, TAIL, -1.66, 0.58, sz, G).castShadow = false; }
    box(0.18, 0.08, 0.08, IND, 1.55, 0.5, 0.7, G).castShadow = false; box(0.18, 0.08, 0.08, IND, -1.55, 0.5, 0.7, G).castShadow = false;
    scene.add(G);
    return G;
  };
  // road cars: alternating E/W, 6 units apart at the 04.50 stop
  const P = [[-26, 1], [-20, -1], [-14, 1], [-8, -1], [8, 1], [14, -1], [20, 1], [26, -1]];
  const MATS = [WH, WH, BLU, WH, WH, WH, YLW, WH];
  const ROADCARS = P.map(([x, d], i) => ({ G: makeCar(i % 3 === 1 ? "beetle" : "sedan", MATS[i]), stopX: x, d }));
  const QUEUE = [[8.6, -1], [13.2, -1], [-8.6, 1], [-13.2, 1]].map(([z, d], i) => ({ G: makeCar(i % 2 ? "beetle" : "sedan", WH), z, d }));

  // speed profile: two full stops, closed-form integral so position is exact at any t
  const stopsT = [
    { a: A("s1:Semua") - 0.1, D: 0.7, c: K.s2 + 4.2, E: 1.0 },
    { a: A("s5:04.50") + 0.05, D: Math.max(0.6, A("s5:berhenti") + 0.3 - A("s5:04.50") - 0.05), c: A("s5:tepat") + 0.05, E: 1.5 },
  ];
  const lost = (t, { a, D, c, E }) => {
    if (t <= a) return 0;
    if (t <= a + D) return (t - a) ** 2 / (2 * D);
    if (t <= c) return D / 2 + (t - a - D);
    if (t <= c + E) return D / 2 + (c - a - D) + (t - c) - (t - c) ** 2 / (2 * E);
    return D / 2 + (c - a - D) + E / 2;
  };
  const S = (t) => t - lost(t, stopsT[0]) - lost(t, stopsT[1]);
  const T1 = stopsT[0].a + stopsT[0].D, T2 = stopsT[1].a + stopsT[1].D;
  const dS = S(T2) - S(T1);
  let kk = Math.max(0, Math.round((2.5 * dS - 32) / 64));
  const V = (32 + 64 * kk) / dS;
  const ST2 = S(T2);
  const wrap = (x) => ((((x + L / 2) % L) + L) % L) - L / 2;
  const hookL = (t) => ramp(t, A("s1:kiri") - 0.15, A("s1:kanan") + 0.5) * (1 - ramp(t, K.s2 + 3.2, K.s2 + 3.8));
  const mainL = (t) => ramp(t, A("s5:pindah"), A("s5:kanan") + 0.6);
  const lane = (t) => Math.max(hookL(t), mainL(t));
  const swapPhase = (t) => { const h = hookL(t), m = mainL(t); return t < K.s2 + 3 ? h : m; };

  // parked fleet: 10 always, 20 more pop in while the voice says "satu setengah juta"
  const FLEET = [];
  const order = [...Array(33).keys()].sort(() => rnd() - 0.5);
  const fa = A("s3:jadi"), fb = A("s3:juta#2") + 0.4;
  order.forEach((slot, i) => {
    const col = slot % 11, row = Math.floor(slot / 11);
    if (col > 9) return;
    const G = makeCar(i % 3 ? "sedan" : "beetle", WH);
    G.position.set(-28.5 + col * 2.2, 0.24, [11, 17.5, 24][row]); G.rotation.y = row === 1 ? -Math.PI / 2 : Math.PI / 2;
    FLEET.push({ G, at: FLEET.length < 10 ? -1 : fa + ((FLEET.length - 10) / 20) * (fb - fa) });
  });

  // ---------- referendum column on the map, map itself
  const map = new THREE.Group(); map.position.set(MAPX, 0, -1); scene.add(map);
  const kx = 0.95, ky = 0.95, lon0 = 17, lat0 = 63, cl = Math.cos((62 * Math.PI) / 180);
  const proj = (lon, lat) => [(lon - lon0) * cl * kx, (lat - lat0) * ky];
  const SIDE = std(0xe7e4dd, 0.9);
  GEO.forEach((c) => {
    const shapes = c.rings.map((r) => new THREE.Shape(r.map(([lo, la]) => new THREE.Vector2(...proj(lo, la)))));
    const sw = c.name === "Sweden";
    const g = new THREE.ExtrudeGeometry(shapes, { depth: sw ? 1.1 : 0.45, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, [sw ? BLU : WH, SIDE]); m.castShadow = m.receiveShadow = true; map.add(m);
  });
  const label = (txt, sub, w, col) => {
    const tx = canvasTex(640, 128, (g) => { g.clearRect(0, 0, 640, 128); g.fillStyle = col; g.fillRect(0, 10, 640, 108); g.fillStyle = col === "#FECC02" || col === "#f4f2ec" ? "#111" : "#fff"; g.font = "800 52px Archivo, Inter, sans-serif"; g.textBaseline = "middle"; g.fillText(txt, 22, 66); if (sub) { g.textAlign = "right"; g.font = "800 44px Archivo, Inter, sans-serif"; g.fillText(sub, 618, 66); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 5), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; return m;
  };
  const LBL = [
    { m: label("SWEDIA", "KIRI", 6.5, "#FECC02"), at: K.s2 + 0.6, p: [...proj(15.8, 62.9)], h: 1.7 },
    { m: label("NORWEGIA", "KANAN", 6.6, "#f4f2ec"), at: A("s2:Norwegia"), p: [...proj(8.6, 60.6)], h: 1.5 },
    { m: label("FINLANDIA", "KANAN", 6.6, "#f4f2ec"), at: A("s2:Finlandia"), p: [...proj(25.6, 64.3)], h: 1.5 },
  ];
  LBL.forEach((l) => { l.m.position.set(l.p[0], l.h, -l.p[1]); map.add(l.m); });
  const [sx0, sy0] = proj(6.2, 57.9);
  const colG = new THREE.Group(); colG.position.set(sx0, 1.1, -sy0); map.add(colG);
  const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0, 6, 2.0)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
  ghost.position.y = 3; colG.add(ghost);
  const fillG = new THREE.BoxGeometry(1.8, 4.98, 1.8); fillG.translate(0, 2.49, 0);
  const colFill = new THREE.Mesh(fillG, YLW); colFill.castShadow = true; colG.add(colFill);

  // ---------- rail: two tracks, trains keep left forever
  const slp = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.12, 0.34), std(0xd8d4cc, 0.95), 2 * 82);
  const mtx = new THREE.Matrix4(); let si = 0;
  for (const tx of [RAIL - 2.5, RAIL + 2.5]) { for (let i = 0; i < 82; i++) { mtx.makeTranslation(tx, 0.18, -36.5 + i * 0.9); slp.setMatrixAt(si++, mtx); } box(0.12, 0.14, 74, RAILM, tx - 0.72, 0.31, 0); box(0.12, 0.14, 74, RAILM, tx + 0.72, 0.31, 0); }
  slp.receiveShadow = true; scene.add(slp);
  const makeTrain = () => {
    const G = new THREE.Group(); scene.add(G);
    for (let i = 0; i < 4; i++) {
      const z = i * 7.5;
      box(2.3, 2.3, 7.1, WH, 0, 1.75, z, G); box(2.34, 0.34, 7.0, BLU, 0, 1.25, z, G); box(2.33, 0.55, 6.2, GLASS, 0, 2.1, z, G);
      box(2.0, 0.25, 7.0, WH2, 0, 3.0, z, G); box(1.8, 0.5, 1.6, TIRE, 0, 0.55, z - 2.4, G); box(1.8, 0.5, 1.6, TIRE, 0, 0.55, z + 2.4, G);
    }
    box(2.32, 0.5, 0.2, YLW, 0, 1.0, -3.6, G);
    return G;
  };
  const trainA = makeTrain(), trainB = makeTrain(); trainB.rotation.y = Math.PI;

  // ---------- dust motes in front of the lens for depth
  const dust = pts(scene, 260, { color: 0xffe2b8, size: 0.16, opacity: 0.55 });
  const dseed = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- camera: [t, px, py, pz, tx, ty, tz]
  const CUT = K.s2 - 0.05;
  const camA = track([
    [0, -40, 12.5, 7.5, 4, 0, 0.5],
    [K.s1e - 0.2, -33, 11, 5.5, 6, 0, 0],
    [CUT, -31, 10.5, 5, 7, 0, 0],
  ]);
  const camB = track([
    [CUT, MAPX + 3, 22, 36, MAPX + 1, 0, 0.5],
    [K.s2 + 3.6, MAPX, 27, 33, MAPX, 0, -0.5],
    [K.s3 - 0.4, MAPX + 1, 28, 31, MAPX, 0, -1],
    [A("s3:83") + 0.6, MAPX + 5, 11, 26, MAPX - 4, 3.6, 3],
    [A("s3:Tapi"), MAPX + 6.5, 11.5, 27, MAPX - 3.5, 3.6, 3.5],
    [A("s3:setengah") + 0.4, -36, 23, 45, -19, 0, 15],
    [A("s3:Tahun"), -29, 21, 42, -17, 0, 15],
    [A("s3:parlemen") + 0.7, 2, 8, 4, PX, 3.5, PZ],
    [K.s4 - 0.2, 4, 7.5, 2.5, PX + 1, 3.5, PZ],
    [K.s4 + 1.8, -40, 4.6, 11, -16, 2.6, 4.5],
    [A("s4:diganti") + 1.2, -32, 4.2, 10, -10, 2.6, 4],
    [A("s4:lampu"), -14, 5.4, 13.5, -5.6, 3.4, 5],
    [A("s4:plastik") + 0.8, -12, 4.8, 12, -5.2, 3.4, 4.5],
    [A("s4:Marka"), -22, 9.5, 9, -8, 0, 1],
    [K.s5 - 0.3, -19, 10.5, 8, -4, 0, 0],
    [A("s5:Dagen") + 0.3, -16, 6.5, 2.5, 30, 6.2, 0],
    [A("s5:berhenti"), -35, 13.5, 5, 3, 0, 0],
    [A("s5:kanan") + 0.6, -32, 14, 3, 4, 0, 0],
    [A("s5:jalan"), -29, 15, 1.5, 6, 0, 0],
    [K.s6 + 1.5, -14, 44, 24, 0, 0, 0],
    [K.s6e, 8, 46, 20, 3, 0, -2],
    [A("s7:Dan") - 0.8, 30, 22, 36, 34, 0, 4],
    [A("s7:Dan") + 1.2, 45, 13, 46, 39.5, 1.5, 10],
    [K.s7e, 46, 12, 40, 40, 1.5, 2],
    [K.s8 + 2.5, 16, 42, 62, 4, 0, 0],
    [K.end, -6, 54, 66, 2, 0, -3],
    [K.dur, -10, 56, 67, 1, 0, -3],
  ]);
  const look = new THREE.Vector3();

  return (t) => {
    const c = t < CUT ? camA(t) : camB(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.35, c[1] + Math.sin(t * 0.29) * 0.22, c[2] + Math.cos(t * 0.31) * 0.3);
    look.set(c[3], c[4], c[5]);
    cam.lookAt(look);

    // dawn: sun climbs, light whitens
    const el = 0.13 + 0.35 * clamp01(t / K.dur);
    const dir = new THREE.Vector3(0.86, Math.sin(el) * 1.25, -0.42).normalize();
    sun.target.position.set(c[3], 0, c[5]);
    sun.position.copy(sun.target.position).addScaledVector(dir, 140);
    sun.color.setRGB(1, 0.78 + 0.16 * clamp01(t / K.dur), 0.56 + 0.3 * clamp01(t / K.dur));
    const wide = ramp(t, K.s8, K.end);
    const sh = 50 + 30 * wide;
    Object.assign(sun.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh });
    sun.shadow.camera.updateProjectionMatrix();

    // road cars
    const s = S(t), lp = lane(t), ph = swapPhase(t), yaw = 0.55 * Math.sin(Math.PI * ph) * (lp > 0 && lp < 1 ? 1 : 0);
    for (const rc of ROADCARS) {
      const x = wrap(rc.stopX + rc.d * V * (s - ST2) + rc.d * 1.6 * lp);
      const z = rc.d * (-2 + 4 * lp);
      rc.G.position.set(x, 0.04, z);
      rc.G.rotation.y = (rc.d > 0 ? 0 : Math.PI) - yaw;
      rc.G.scale.setScalar(Math.max(0.001, clamp01((L / 2 - Math.abs(x)) / 2.2)));
    }
    for (const qc of QUEUE) {
      qc.G.position.set(qc.d < 0 ? -2 + 4 * lp : 2 - 4 * lp, 0.04, qc.z + (qc.d < 0 ? -1.2 : 1.2) * lp);
      qc.G.rotation.y = (qc.d < 0 ? Math.PI / 2 : -Math.PI / 2) - yaw;
    }
    const blinkOn = (a, b) => t > a && t < b && Math.floor((t - a) * 3.2) % 2 === 0;
    IND.emissiveIntensity = blinkOn(A("s1:Semua"), A("s1:kanan") + 0.8) || blinkOn(A("s5:04.50"), A("s5:kanan") + 0.9) ? 2.6 : 0;
    TAIL.emissiveIntensity = 0.5 + 1.6 * (ramp(t, stopsT[1].a, stopsT[1].a + 0.3) * (1 - ramp(t, stopsT[1].c, stopsT[1].c + 0.4)) + ramp(t, stopsT[0].a, stopsT[0].a + 0.3) * (1 - ramp(t, K.s2, K.s2 + 0.5)));

    // fleet
    for (const f of FLEET) f.G.scale.setScalar(f.at < 0 ? 1 : Math.max(0.001, back((t - f.at) / 0.32)));

    // map labels and referendum column
    for (const l of LBL) l.m.scale.setScalar(Math.max(0.001, back((t - l.at) / 0.4)));
    const cg = eout((t - A("s3:83") + 0.2) / 1.0) * (1 - ramp(t, K.s4, K.s4 + 0.6));
    colG.visible = t > A("s3:83") - 0.3 && t < K.s4 + 0.7;
    colFill.scale.y = Math.max(0.001, cg);
    ghost.material.opacity = 0.8 * ramp(t, A("s3:83") - 0.3, A("s3:83"));

    // signs flip on "diganti", staggered down the street
    for (const sg of SIGNS) sg.G.rotation.y = sg.base + Math.PI * eout((t - A("s4:diganti") - sg.k) / 0.55);
    // lights: poles appear on "lampu", bagged on "plastik", unwrapped on "disebut", red until 05.00 then green
    for (const lt of LIGHTS) {
      lt.G.scale.set(1, Math.max(0.001, back((t - A("s4:lampu") - lt.k) / 0.5)), 1);
      const on = back((t - A("s4:plastik") - lt.k) / 0.4), off = eout((t - A("s5:disebut") - lt.k) / 0.7);
      lt.bag.scale.set(Math.max(0.001, on * (1 - 0.3 * off)), Math.max(0.001, on * (1 - off)), Math.max(0.001, on * (1 - 0.3 * off)));
      lt.bag.position.y = 3.9 - 2.4 * off;
    }
    const lit = ramp(t, A("s5:disebut") + 0.4, A("s5:disebut") + 0.9);
    const go = ramp(t, A("s5:tepat"), A("s5:tepat") + 0.15);
    LR.emissiveIntensity = 3 * lit * (1 - go); LG.emissiveIntensity = 3.2 * lit * go; LA.emissiveIntensity = 0.0;
    // markings: paint, tape, peel; old yellow dims after the switch
    for (const n of NEW) { const v = Math.max(0.001, eout((t - A("s4:dicat") - n.k) / 0.5)); if (n.arrow) n.m.scale.setScalar(v); else n.m.scale.x = v; }
    for (const tp of TAPES) tp.m.scale.x = Math.max(0.001, eout((t - A("s4:selotip") - tp.k) / 0.45) * (1 - ramp(t, A("s5:Hari") + tp.k, A("s5:Hari") + tp.k + 0.6)));
    const fade = ramp(t, A("s5:kanan") + 0.8, A("s5:jalan") + 1.5);
    OLDY.color.setRGB(0.88 + (0.79 - 0.88) * fade, 0.68 + (0.78 - 0.68) * fade, 0.09 + (0.76 - 0.09) * fade);

    // monolith
    HG.scale.set(1.3, 1.3 * Math.max(0.001, back((t - A("s5:Dagen")) / 0.7, 1.2)), 1.35);
    HG.visible = t > A("s5:Dagen") - 0.05;
    // flag ripple
    const fp = flagG.attributes.position.array;
    for (let i = 0; i < fp.length; i += 3) fp[i + 2] = flagBase[i + 2] + Math.sin(t * 3 + fp[i] * 2.2) * 0.12 * (fp[i] + 1.2) / 2.4;
    flagG.attributes.position.needsUpdate = true;

    // trains: A northbound on the left track, B southbound on its own left track
    trainA.position.set(RAIL - 2.5, 0.12, 30 - 6.5 * (t - A("s7:Dan") + 1.5));
    trainB.position.set(RAIL + 2.5, 0.12, -75 + 8 * (t - A("s7:Dan")));
    trainA.visible = t > K.s7 - 1; trainB.visible = t > K.s7 - 1;

    // dust around the look point
    const dp = dust.pos;
    for (let i = 0; i < 260; i++) {
      const d = dseed[i];
      dp[i * 3] = c[0] + (c[3] - c[0]) * (0.15 + 0.5 * d[0]) + Math.sin(t * 0.3 + d[3] * 9) * 1.5 + (d[1] - 0.5) * 14;
      dp[i * 3 + 1] = c[1] * (0.25 + 0.6 * d[2]) + Math.sin(t * 0.21 + d[0] * 7) * 0.8;
      dp[i * 3 + 2] = c[2] + (c[5] - c[2]) * (0.15 + 0.5 * d[0]) + (d[3] - 0.5) * 14 + Math.cos(t * 0.27 + d[1] * 5) * 1.5;
    }
    dust.commit();

    bp.strength = 0.2 + 0.25 * lit * (1 - ramp(t, K.s6, K.s6 + 2));
    comp.render();
  };
}
