// EP01 ASHABUL KAHFI. PAPERWORLD: a cut-paper mountain in cross-section with deckled cream and ochre layers,
// an indigo paper night sky, a paper sun on an arc that rises right of the cave and sets to the left (QS 18:17),
// faceless cloaked sleepers that turn slowly, a paper dog at the threshold (QS 18:18), and a small paper city that changes.
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, smooth, canvasTex, track, stage, pts } from "./lib3d.js";

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp } = stage(canvas, { bg: 0x1b1d4a, fog: 0.006, exp: 1.05, bloom: [0.32, 0.5, 0.86] });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(309);
  const D2R = Math.PI / 180;

  // ---------- paper fibre texture (white, tinted by material colour)
  const paperTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 7000; i++) {
      const x = rnd() * w, y = rnd() * h, l = 2 + rnd() * 12, a = rnd() * Math.PI;
      g.strokeStyle = `rgba(${(110 + rnd() * 60) | 0},${(90 + rnd() * 50) | 0},70,${0.03 + rnd() * 0.06})`;
      g.lineWidth = 0.6 + rnd(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(90,70,50,${rnd() * 0.07})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
  }, [0.22, 0.22]);
  const MATS = {};
  const P = (hex, flat = false) => {
    const k = hex + (flat ? "f" : "");
    if (!MATS[k]) MATS[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.96, metalness: 0, map: paperTex, flatShading: flat });
    return MATS[k];
  };

  // deckled outline: subdivide edges and jitter along the normal, seeded
  function deckle(pt, step = 0.3, amp = 0.06, seed = 1) {
    const q = mulberry(seed), out = [];
    for (let i = 0; i < pt.length; i++) {
      const a = pt[i], b = pt[(i + 1) % pt.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      const n = Math.max(1, Math.round(L / step)), nx = -dy / L, ny = dx / L;
      for (let k = 0; k < n; k++) { const u = k / n, o = k === 0 ? 0 : (q() - 0.5) * 2 * amp; out.push(new THREE.Vector2(a[0] + dx * u + nx * o, a[1] + dy * u + ny * o)); }
    }
    return out;
  }
  function shapeGeo(pt, depth, o = {}) {
    const sh = new THREE.Shape(deckle(pt, o.step ?? 0.3, o.amp ?? 0.06, o.seed ?? 1));
    (o.holes || []).forEach((hp, i) => sh.holes.push(new THREE.Path(deckle(hp, 0.2, 0.02, (o.seed ?? 1) + 11 + i))));
    return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 6 });
  }
  function layer(pt, mat, z, depth = 0.2, o = {}, parent = scene) {
    const m = new THREE.Mesh(shapeGeo(pt, depth, o), mat);
    m.position.z = z; m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  const ridge = (x0, x1, base, amp, seed, env = (x) => 1) => {
    const p = [[x0, -1], [x1, -1]];
    for (let x = x1; x >= x0; x -= 0.6) p.push([x, base + amp * env(x) * (0.55 * Math.sin(x * 0.33 + seed) + 0.3 * Math.sin(x * 0.85 + 2 * seed) + 0.15 * Math.sin(x * 2.1 + seed))]);
    return p;
  };

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xf2e6cc, 0x3a2a3a, 0.7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffd8a0, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 160 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const caveGlow = new THREE.PointLight(0xffb06a, 9, 13, 1.6);
  caveGlow.position.set(-1, 3.4, 2.2);
  scene.add(caveGlow);

  // ---------- ground, sky, ridges
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 170), P(0xc79f66));
  ground.rotation.x = -Math.PI / 2; ground.position.set(5, 0, 0); ground.receiveShadow = true; scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.6), P(0xe0c18c));
  path.rotation.x = -Math.PI / 2; path.position.set(15, 0.02, -0.9); path.receiveShadow = true; scene.add(path);

  const SKYM = new THREE.MeshBasicMaterial({ color: 0x1b1d4a, map: paperTex, fog: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(200, 130), SKYM);
  sky.position.set(0, 30, -30); scene.add(sky);
  const glowT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const HZM = new THREE.MeshBasicMaterial({ color: 0xe08a46, map: glowT, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const hz = new THREE.Mesh(new THREE.PlaneGeometry(200, 22), HZM); hz.position.set(0, 9, -29.5); scene.add(hz);

  // stars: small four-point paper cut-outs
  const starPts = []; for (let i = 0; i < 8; i++) { const r = i % 2 ? 0.28 : 1; const a = i * Math.PI / 4 + Math.PI / 2; starPts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const starG = new THREE.ShapeGeometry(new THREE.Shape(starPts.map((p) => new THREE.Vector2(...p))));
  const STARM = new THREE.MeshBasicMaterial({ color: 0xf6e7c0, transparent: true, opacity: 1, fog: false });
  const stars = new THREE.InstancedMesh(starG, STARM, 90);
  { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); for (let i = 0; i < 90; i++) { const s = 0.12 + rnd() * 0.28; m4.compose(new THREE.Vector3(-45 + rnd() * 90, 8 + rnd() * 48, -29), q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rnd()), new THREE.Vector3(s, s, s)); stars.setMatrixAt(i, m4); } }
  stars.frustumCulled = false; scene.add(stars);

  // far ridges, cooler as they recede
  layer(ridge(-50, 50, 7, 4.5, 1.3, (x) => 0.6 + 0.4 * Math.cos(x * 0.05)), P(0x3d3d6b), -22, 0.2, { seed: 4, amp: 0.1 });
  layer(ridge(-46, 46, 5, 3.5, 2.7), P(0x7a5f74), -15, 0.2, { seed: 5, amp: 0.09 });
  layer(ridge(-44, 44, 3, 2.4, 4.1), P(0xb07c4c), -8, 0.2, { seed: 6, amp: 0.08 });

  // ---------- the mountain: back layer (cave wall) and front cross-section with the cave cut out
  const slope = (pk, x0, x1, n, s) => { const out = []; for (let i = 0; i <= n; i++) { const u = i / n; const x = x0 + (x1 - x0) * u; out.push([x, pk(x) + (1.0 * Math.sin(x * 0.8 + s) + 0.45 * Math.sin(x * 2.2 + 2 * s) + 0.15 * Math.sin(x * 5.1 + s)) * Math.sin(u * Math.PI)]); } return out; };
  const bumps = (x) => -2.6 * Math.exp(-(((x + 0.5) / 2.4) ** 2)) + 1.7 * Math.exp(-(((x + 5.6) / 1.7) ** 2)) + 1.1 * Math.exp(-(((x - 3.6) / 1.4) ** 2));
  const hR = (x) => 15 * (11 - x) / 11.5 + bumps(x), hL = (x) => 15 * (x + 11) / 10.5 + bumps(x);
  const back0 = [[-12.4, 0], [12.8, 0], ...slope((x) => 16.2 * (12.8 - x) / 12.9 + bumps(x - 0.4), 12.8, -0.1, 18, 2).slice(1), ...slope((x) => 16.2 * (x + 12.4) / 12.3 + bumps(x - 0.4), -0.1, -12.4, 18, 5).slice(1, -1)];
  layer(back0, P(0x6d4a30), -3.4, 0.3, { seed: 21, amp: 0.1 });
  const chamber = [[-6.6, 0], [-6.9, 1.2], [-6.6, 2.6], [-5.8, 3.6], [-4.4, 4.3], [-2.5, 4.7], [-0.5, 4.75], [1.6, 4.5], [3.3, 4.0], [4.6, 3.5], [6.5, 3.3]];
  const front0 = [[-11, 0], ...chamber, ...slope(hR, 8.47, -0.5, 16, 1), ...slope(hL, -0.5, -11, 16, 3).slice(1, -1)];
  layer(front0, P(0xe8cf9c), 0, 0.3, { seed: 22, amp: 0.08 });
  // a second deckled skin a little behind the front for paper thickness around the cave rim
  const rim = [[-7.4, 0], [-7.7, 1.3], [-7.3, 2.9], [-6.3, 4.1], [-4.6, 4.95], [-2.5, 5.35], [-0.5, 5.4], [1.8, 5.15], [3.6, 4.6], [5.0, 4.05], [7.2, 3.9], [9.0, 3.85], [9.0, 3.3]];
  const rimIn = chamber.slice().reverse();
  layer([...rim, ...rimIn], P(0xc99a5c), -0.5, 0.25, { seed: 23, amp: 0.05 });
  // sand floor in the cave
  const floorM = new THREE.Mesh(new THREE.BoxGeometry(14, 0.12, 3.3), P(0xd6b47c)); floorM.position.set(-0.5, 0.06, -1.7); floorM.receiveShadow = true; scene.add(floorM);
  // threshold stone where the dog lies
  layer([[5.2, 0], [9.8, 0], [9.6, 0.32], [5.4, 0.36]], P(0xa07446), -2.2, 2.2, { seed: 24, amp: 0.03 });

  // ---------- sun and moon (paper discs) on the sky arc
  const circ = (r, n = 40) => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 2 * Math.PI) * r, Math.sin(i / n * 2 * Math.PI) * r]);
  const SUN = new THREE.Group(); scene.add(SUN);
  const rays = []; for (let i = 0; i < 32; i++) { const r = i % 2 ? 1.85 : 2.45; const a = i / 32 * 2 * Math.PI; rays.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const raysM = layer(rays, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf0a33a).multiplyScalar(1.15), fog: false }), 0, 0.05, { seed: 31, amp: 0.04, step: 0.25 }, SUN);
  layer(circ(1.65), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf7c65a).multiplyScalar(1.3), fog: false }), 0.08, 0.05, { seed: 32, amp: 0.05 }, SUN);
  layer(circ(1.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfde3a0).multiplyScalar(1.35), fog: false }), 0.16, 0.05, { seed: 33, amp: 0.04 }, SUN);
  SUN.traverse((o) => { o.castShadow = false; o.receiveShadow = false; });
  const crescent = [];
  for (let i = 0; i <= 24; i++) { const a = (-117.8 + 235.6 * i / 24) * D2R; crescent.push([Math.cos(a) * 1.3, Math.sin(a) * 1.3]); }
  for (let i = 1; i < 24; i++) { const a = (90.3 - 180.6 * i / 24) * D2R; crescent.push([-0.6 + Math.cos(a) * 1.15, Math.sin(a) * 1.15]); }
  const MOON = new THREE.Group(); scene.add(MOON);
  layer(crescent, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe4e8ef).multiplyScalar(1.1), fog: false }), 0, 0.05, { seed: 34, amp: 0.04 }, MOON);
  MOON.traverse((o) => { o.castShadow = false; });

  // ---------- figures: cloaked, faceless paper shapes
  const prof = [[-0.45, 0], [0.4, 0], [0.33, 0.8], [0.3, 1.38], [0.25, 1.55], [0.32, 1.82], [0.2, 2.05], [-0.04, 2.16], [-0.25, 2.02], [-0.33, 1.7], [-0.36, 1.3], [-0.46, 0.6]];
  const sym = [[-0.5, 0], [0.5, 0], [0.4, 0.9], [0.34, 1.42], [0.27, 1.62], [0.27, 1.9], [0.14, 2.06], [0, 2.1], [-0.14, 2.06], [-0.27, 1.9], [-0.27, 1.62], [-0.34, 1.42], [-0.4, 0.9]];
  const profG = shapeGeo(prof, 0.08, { step: 0.15, amp: 0.02, seed: 41 }), symG = shapeGeo(sym, 0.08, { step: 0.15, amp: 0.02, seed: 42 });
  const cutout = (geo, color, s = 1) => { const G = new THREE.Group(); const m = new THREE.Mesh(geo, P(color)); m.castShadow = true; m.receiveShadow = true; G.add(m); G.scale.setScalar(s); scene.add(G); return G; };
  // the youths: dark cloaks, profile silhouettes
  const YC = [0x2f2a4a, 0x4a2f3a, 0x3a3a5c, 0x5a3b2e];
  const WALK = YC.map((c, i) => ({ G: cutout(profG, c), i }));
  const MSG = cutout(profG, 0x2f2a4a);
  // city crowd: small, faceless, still
  const CROWD = [];
  for (let i = 0; i < 11; i++) { const G = cutout(symG, [0x5b4a5e, 0x6b5848, 0x4d4560][i % 3], 0.62 + rnd() * 0.12); G.position.set(17.6 + i * 0.52 + (rnd() - 0.5) * 0.2, 0, -1.6 - (i % 3) * 0.45); CROWD.push({ G, ph: rnd() * 6 }); }

  // sleepers: soft capsules with a hood at one end, faceted like folded paper
  const SL = [[-4.3, -0.9, 1, 0xe9d6ae], [-0.9, -0.9, -1, 0xc98e52], [2.5, -0.9, 1, 0xa7593a], [-2.6, -2.3, -1, 0xd8b780], [0.9, -2.3, 1, 0x6a6488]];
  const capG = new THREE.CapsuleGeometry(0.4, 1.8, 3, 9); capG.rotateZ(Math.PI / 2);
  const hoodG = new THREE.SphereGeometry(0.46, 10, 7);
  const foldG = new THREE.BoxGeometry(1.7, 0.05, 0.62);
  const SLEEP = SL.map(([x, z, d, c], i) => {
    const G = new THREE.Group(); G.position.set(x, 0.12, z); scene.add(G);
    const hip = new THREE.Group(); hip.position.set(-d * 1.15, 0.4, 0); G.add(hip);
    const roll = new THREE.Group(); roll.position.set(d * 1.15, 0, 0); hip.add(roll);
    const mat = P(c, true);
    const b = new THREE.Mesh(capG, mat); b.scale.set(1, 0.92, 0.85); roll.add(b);
    const h = new THREE.Mesh(hoodG, mat); h.position.set(d * 1.3, 0.06, 0); h.scale.set(1.05, 0.95, 0.9); roll.add(h);
    const f = new THREE.Mesh(foldG, P(new THREE.Color(c).multiplyScalar(0.82).getHex(), true)); f.position.set(-d * 0.1, 0.37, 0.05); f.rotation.x = 0.35; roll.add(f);
    [b, h, f].forEach((m) => { m.castShadow = m.receiveShadow = true; });
    return { G, hip, roll, d, i };
  });

  // the dog: lying at the threshold, forelegs stretched toward the mouth
  const dogP = [[-1.05, 0], [0.55, 0], [1.55, 0], [1.6, 0.1], [1.5, 0.17], [0.75, 0.2], [0.72, 0.3], [0.9, 0.55], [1.05, 0.62], [1.4, 0.66], [1.5, 0.74], [1.45, 0.84], [1.18, 0.92], [1.08, 1.12], [0.98, 1.15], [0.95, 1.02], [0.82, 0.98], [0.68, 0.82], [0.3, 0.66], [-0.5, 0.66], [-0.95, 0.55], [-1.3, 0.62], [-1.55, 0.55], [-1.5, 0.45], [-1.15, 0.38]];
  const DOG = new THREE.Group(); DOG.position.set(6.6, 0.34, -1.0); DOG.scale.setScalar(1.25); scene.add(DOG);
  const dogInner = new THREE.Group(); DOG.add(dogInner);
  layer(dogP, P(0x9b6a3c), 0, 0.12, { step: 0.12, amp: 0.018, seed: 51 }, dogInner);
  layer([[0.45, 0.02], [1.45, 0.05], [1.52, 0.13], [0.5, 0.17]], P(0xb8844f), 0.14, 0.05, { step: 0.12, amp: 0.012, seed: 52 }, dogInner);
  layer([[-0.6, 0.25], [0.2, 0.25], [0.15, 0.55], [-0.5, 0.58]], P(0x9a6a40), 0.13, 0.04, { step: 0.12, amp: 0.02, seed: 53 }, dogInner);
  dogInner.traverse((o) => { o.castShadow = true; });

  // ---------- the paper city to the right; old skyline folds down, a changed one folds up
  const winH = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const archH = (x, y, w, h) => { const p = [[x, y], [x + w, y], [x + w, y + h - w / 2]]; for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; p.push([x + w / 2 + Math.cos(a) * w / 2, y + h - w / 2 + Math.sin(a) * w / 2]); } p.push([x, y + h - w / 2]); return p; };
  const facade = (kind, w, h) => {
    const W = w / 2, holes = [];
    let o;
    if (kind === "gable") { o = [[-W, 0], [W, 0], [W, h], [0, h + 0.7], [-W, h]]; holes.push(winH(-0.2, 0.0, 0.4, 0.75)); }
    else if (kind === "flat") { o = [[-W, 0], [W, 0], [W, h], [W - 0.3, h], [W - 0.3, h + 0.25], [-W + 0.3, h + 0.25], [-W + 0.3, h], [-W, h]]; holes.push(winH(-W + 0.3, h * 0.55, 0.32, 0.4), winH(W - 0.62, h * 0.55, 0.32, 0.4)); }
    else if (kind === "temple") { o = [[-W, 0], [W, 0], [W, h], [0, h + 1.0], [-W, h]]; for (let i = 0; i < 4; i++) holes.push(winH(-W + 0.45 + i * (w - 0.9) / 4 + 0.15, 0.3, (w - 0.9) / 4 - 0.3, h - 0.75)); }
    else if (kind === "arch") { o = [[-W, 0], [W, 0], [W, h], [-W, h]]; holes.push(archH(-0.3, 0, 0.6, 1.3), archH(-W + 0.25, h * 0.6, 0.3, 0.55), archH(W - 0.55, h * 0.6, 0.3, 0.55)); }
    else if (kind === "flat2") { o = [[-W, 0], [W, 0], [W, h]]; const n = 5; for (let i = n; i >= 0; i--) { const x = -W + (w * i) / n; o.push([x, h + (i % 2 ? 0.28 : 0)]); } o.push([-W, h]); holes.push(archH(-0.25, h * 0.35, 0.5, 0.8)); }
    else if (kind === "dome") { o = [[-W, 0], [W, 0], [W, h]]; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; o.push([Math.cos(a) * W * 0.7, h + Math.sin(a) * W * 0.7]); } o.push([-W, h]); holes.push(archH(-0.45, 0, 0.9, 1.6), archH(-W + 0.4, h * 0.5, 0.45, 0.8), archH(W - 0.85, h * 0.5, 0.45, 0.8)); }
    else { o = [[-W, 0], [W, 0], [W, h], [0, h + 1.2], [-W, h]]; holes.push(archH(-0.18, h * 0.62, 0.36, 0.7), archH(-0.18, h * 0.3, 0.36, 0.6)); }
    return { o, holes };
  };
  const mkCity = (list, seed) => list.map(([x, z, w, h, kind, col], i) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const { o, holes } = facade(kind, w, h);
    layer(o, P(col), 0, 0.9, { holes, seed: seed + i, amp: 0.04, step: 0.25 }, G);
    G.children[0].position.z = -0.9;
    return { G, k: i * 0.09 };
  });
  const OLD = mkCity([[14.6, -2.6, 1.6, 1.8, "gable", 0xe7d2a6], [16.7, -3.5, 2.0, 2.4, "flat", 0xd9b886], [19.7, -4.6, 4.2, 3.0, "temple", 0xefe0bf], [22.7, -3.3, 1.8, 2.2, "gable", 0xc98e52], [24.6, -4.3, 1.6, 3.0, "flat", 0xdcc39a], [18.1, -2.0, 1.4, 1.4, "flat", 0xb9744a], [21.6, -2.2, 1.5, 1.6, "gable", 0xe2c995]], 60);
  const NEW = mkCity([[14.6, -2.6, 1.8, 2.6, "arch", 0xf0e2c2], [16.8, -3.6, 2.2, 3.4, "flat2", 0xdcb883], [19.7, -4.7, 4.6, 3.4, "dome", 0xf3e6c8], [22.5, -3.4, 1.4, 5.0, "tower", 0xd09a5e], [24.6, -4.4, 2.0, 3.0, "arch", 0xe0c79a], [18.1, -2.0, 1.5, 1.9, "flat2", 0xb9744a], [21.5, -2.2, 1.6, 2.1, "arch", 0xe8d2a2]], 80);

  // ---------- silver coin (QS 18:19)
  const coinT = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#d9dee6"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "#8f97a3"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.stroke();
    for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * Math.PI; g.beginPath(); g.moveTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); g.lineTo(128 + Math.cos(a) * 108, 128 + Math.sin(a) * 108); g.stroke(); }
    g.fillStyle = "#a9b0bb"; g.save(); g.translate(128, 128);
    for (let k = 0; k < 2; k++) { g.rotate(Math.PI / 4); g.fillRect(-46, -46, 92, 92); }
    g.restore(); g.fillStyle = "#e9edf2"; g.beginPath(); g.arc(128, 128, 30, 0, 7); g.fill();
  });
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: coinT, roughness: 0.32, metalness: 0.35, emissive: 0x2a2c30 });
  const COIN = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.07, 40), [new THREE.MeshStandardMaterial({ color: 0xaab2bd, roughness: 0.3, metalness: 0.5 }), coinMat, coinMat]);
  COIN.rotation.x = Math.PI / 2; const COING = new THREE.Group(); COING.add(COIN); scene.add(COING); COIN.castShadow = true;

  // ---------- number tags for s7 (3, 5, 7) and rulers for s6
  const tagTex = (txt, bg, fg) => canvasTex(256, 256, (g, w) => {
    const q = mulberry(txt.charCodeAt(0)); g.clearRect(0, 0, w, w); g.beginPath();
    const pt = []; for (let i = 0; i < 48; i++) { const a = i / 48 * 2 * Math.PI; const r = 112 + (q() - 0.5) * 8; pt.push([128 + Math.cos(a) * r, 128 + Math.sin(a) * r]); }
    pt.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = bg; g.fill();
    g.fillStyle = fg; g.font = "700 150px Fraunces, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 128, 136);
  });
  const TAGS = ["3", "5", "7"].map((n, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshStandardMaterial({ map: tagTex(n + "?", "#f3e7ce", "#2a1e17"), transparent: true, alphaTest: 0.5, roughness: 0.9 }));
    const G = new THREE.Group(); G.position.set(-3.8 + i * 3.2, 5.0 + (i === 1 ? 0.25 : 0), 0.7); m.position.y = 0.9; G.add(m); scene.add(G);
    return { G };
  });
  const rulerTex = (n, bg, ink, label, end) => canvasTex(4096, 220, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, h - 16, w, 16);
    g.strokeStyle = ink; g.lineWidth = 3;
    for (let i = 0; i <= n; i++) { const x = 30 + (w - 60) * i / n; const L = i % 10 === 0 ? 70 : 34; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, L); g.stroke(); }
    g.fillStyle = ink; g.font = "700 92px Fraunces, Georgia, serif"; g.textBaseline = "alphabetic"; g.fillText(label, 60, 182);
    g.textAlign = "right"; g.fillText(end, w - 50, 182);
  });
  const RL = 15;
  const mkRuler = (tex, y) => {
    const geo = new THREE.PlaneGeometry(RL, RL * 220 / 4096 * 2.2); geo.translate(RL / 2, 0, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
    m.position.set(-RL / 2, y, 2.0); m.castShadow = true; scene.add(m); return m;
  };
  const RSUN = mkRuler(rulerTex(300, "#e9bf5f", "#3a2412", "MATAHARI", "300"), 17.4);
  const RMOON = mkRuler(rulerTex(309, "#cfd5de", "#22263a", "BULAN", "309"), 15.5);
  const rDisc = (geoPts, col, x, y) => { const G = new THREE.Group(); G.position.set(x, y, 2.05); scene.add(G); layer(geoPts, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(1.2) }), 0, 0.05, { seed: 71, amp: 0.03 }, G); G.scale.setScalar(0.42); return G; };
  const RSD = rDisc(circ(1.5), 0xf7c65a, -RL / 2 - 0.85, 17.4), RMD = rDisc(crescent, 0xe4e8ef, -RL / 2 - 0.85, 15.5);

  // ---------- floating paper flecks near the lens
  const FL = 220;
  const fleck = pts(scene, FL, { color: 0xf3dcae, size: 0.11, opacity: 0.5 });
  const fseed = Array.from({ length: FL }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- time of day: p counts days; fraction <0.62 is daylight
  const pw = (keys) => (t) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (t <= b) return va + (vb - va) * smooth((t - a) / Math.max(1e-3, b - a)) ; } return keys[keys.length - 1][1]; };
  const lin = (keys) => (t) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (t <= b) return va + (vb - va) * (t - a) / Math.max(1e-3, b - a); } return keys[keys.length - 1][1]; };
  const DAYP = lin([
    [0, 0.8], [A("s1:Padahal"), 0.92], [K.s1e + 0.1, 5.3], [K.s3, 5.4], [A("s3:berdoa"), 5.5], [A("s3:menidurkan"), 5.64], [K.s4 - 0.1, 5.88],
    [A("s4:Matahari") - 0.15, 6.0], [A("s4:kiri") + 0.6, 6.62], [A("s4:Anjing") - 0.6, 7.1], [K.s4e, 7.45], [A("s5:dibangunkan"), 8.03], [K.s6, 8.25], [K.s7, 8.4],
    [A("s7:Tuhanku"), 8.62], [A("s7:besok") - 0.3, 8.99], [K.s8, 9.08], [K.dur, 9.24],
  ]);
  // turning clock for the sleepers: slow, quicker in the time-lapse and while the narration says it
  const TURN = lin([[0, 0], [A("s1:Padahal"), 0.2], [K.s1e, 2.2], [A("s3:menidurkan"), 2.2], [A("s4:Tubuh"), 2.8], [A("s4:kiri#2") + 0.6, 3.8], [A("s5:dibangunkan"), 4.6], [K.dur, 4.6]]);

  const NIGHT = new THREE.Color(0x1b1d4a), DAWN = new THREE.Color(0xc9774a), DAY = new THREE.Color(0x9fb3c2), tmpC = new THREE.Color();
  const sunAt = (th) => [10.5 * Math.cos(th), 2.5 + 15 * Math.sin(th)];

  // ---------- camera: [t, px, py, pz, tx, ty, tz]
  const camT = track([
    [0, -0.6, 3.0, 21, -0.8, 2.1, -1.4],
    [A("s1:Padahal"), -0.4, 3.4, 24, -0.6, 2.4, -1.4],
    [K.s1e, 1.5, 6.5, 50, 2.5, 5.2, -4],
    [K.s2 + 2.2, 17, 4.2, 30, 19, 2.6, -3],
    [A("s2:Para"), 19.5, 3.6, 21, 19.6, 2.0, -3],
    [A("s2:memilih"), 16, 3.4, 20, 15, 1.8, -2],
    [K.s2e, 11.5, 3.6, 22, 9.5, 1.9, -1.5],
    [A("s3:gua"), 5, 3.4, 20, 3.5, 1.9, -1.5],
    [A("s3:Ya"), 0, 3.0, 18, -0.6, 1.7, -1.5],
    [A("s3:menidurkan"), -0.6, 3.2, 20, -0.6, 1.7, -1.5],
    [K.s4 - 0.1, 0.5, 6.0, 46, 0.6, 5.6, -5],
    [A("s4:kiri") + 0.4, 0.2, 6.2, 52, 0.4, 5.8, -5],
    [A("s4:Tubuh") + 0.4, -1.0, 3.0, 19, -1.0, 1.5, -1.5],
    [A("s4:Anjing") - 0.7, -0.6, 3.0, 18, -0.6, 1.5, -1.5],
    [A("s4:Anjing") + 0.5, 6.4, 2.2, 10.5, 6.3, 1.0, -1.0],
    [K.s4e, 7.2, 2.0, 9.0, 6.6, 0.95, -1.0],
    [A("s5:dibangunkan") + 0.6, 0.0, 3.2, 19.5, -0.8, 1.9, -1.5],
    [A("s5:Sehari"), -1.6, 3.2, 17, -1.4, 2.0, -1.5],
    [A("s5:Satu"), 5.5, 3.0, 18, 5.5, 1.8, -1.2],
    [A("s5:uang") + 0.3, 7.9, 2.5, 6.4, 7.5, 2.0, 0.4],
    [A("s5:makanan"), 10.0, 2.7, 7.4, 9.6, 2.0, 0.3],
    [A("s5:jangan"), 14.5, 4.2, 25, 17.5, 2.4, -3],
    [K.s5e, 15, 4.6, 27, 18, 2.6, -3],
    [A("s6:tiga"), 2, 7.5, 50, 1.5, 6.5, -4],
    [A("s6:sembilan"), 1, 9.5, 50, 0.5, 8.5, -4],
    [A("s6:Ibnu") + 0.6, -0.4, 12.8, 49, -0.4, 15.0, 0],
    [K.s6e, -0.4, 13.2, 47, -0.4, 15.1, 0],
    [K.s7 + 0.8, -0.4, 4.6, 38, -0.5, 3.4, -1],
    [A("s7:Tuhanku"), -0.2, 4.2, 34, -0.5, 3.1, -1],
    [A("s7:pesan"), 8, 5.5, 34, 11, 4.5, -4],
    [K.s7e, 9, 6.5, 40, 11, 5.0, -5],
    [K.s8 + 2, 3, 7.5, 56, 4, 5.4, -6],
    [K.end, 2, 8.5, 64, 3.5, 5.6, -6],
    [K.dur, 2, 8.8, 66, 3.5, 5.7, -6],
  ]);
  const look = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.31) * 0.18, c[1] + Math.sin(t * 0.23) * 0.12, c[2] + Math.cos(t * 0.27) * 0.2);
    look.set(c[3], c[4], c[5]);
    cam.lookAt(look);

    // ----- day and night
    const p = DAYP(t), f = p - Math.floor(p);
    const isDay = f < 0.62;
    const th = isDay ? (8 + 164 * f / 0.62) * D2R : (8 + 164 * (f - 0.62) / 0.38) * D2R;
    const el = Math.sin(th);
    const s6w = ramp(t, A("s6:Ibnu") - 0.6, A("s6:Ibnu")) * (1 - ramp(t, K.s7 - 0.3, K.s7 + 0.2));
    const [sx, sy] = sunAt(th);
    SUN.position.set(sx, sy, -26); SUN.rotation.z = t * 0.12;
    MOON.position.set(sx, sy, -26.2);
    SUN.visible = isDay && s6w < 0.5; MOON.visible = !isDay && s6w < 0.5;
    SUN.scale.setScalar(isDay ? 1.15 : 0.001); MOON.scale.setScalar(isDay ? 0.001 : 1.05);
    const day = isDay ? clamp01(el * 1.6) : 0;
    const low = isDay ? clamp01(1 - el * 2.2) : 0;
    if (day < 0.45) tmpC.copy(NIGHT).lerp(DAWN, day / 0.45); else tmpC.copy(DAWN).lerp(DAY, (day - 0.45) / 0.55);
    SKYM.color.copy(tmpC);
    scene.fog.color.copy(tmpC).multiplyScalar(0.85);
    HZM.opacity = 0.75 * low * clamp01(el * 6);
    STARM.opacity = clamp01(1 - day * 2.2);
    // key light follows the sun by day, the moon by night; it comes from the front so shadows sweep through the cave
    const kx = sx * 2.4, ky = Math.max(1.5, sy * 1.3);
    key.target.position.set(1, 2, -2);
    key.position.set(1 + kx, 2 + ky, 32);
    if (isDay) { key.color.setRGB(1, 0.72 + 0.22 * el, 0.48 + 0.4 * el); key.intensity = 0.4 + 2.6 * clamp01(el * 1.8); }
    else { key.color.setRGB(0.62, 0.7, 1); key.intensity = 0.55 * clamp01(el * 2); }
    hemi.intensity = 0.42 + 0.55 * day;
    hemi.color.setRGB(0.75 + 0.2 * day, 0.75 + 0.15 * day, 0.85);
    caveGlow.intensity = 7 + 4 * (1 - day);

    // ----- who is where
    const sleepVis = (t < K.s2 - 0.35) || (t > A("s3:menidurkan") + 0.15);
    const sleepIn = t < K.s2 ? 1 - ramp(t, K.s2 - 0.9, K.s2 - 0.35) : eout((t - A("s3:menidurkan") - 0.15) / 0.8);
    const turn = TURN(t);
    const sit = ramp(t, A("s5:dibangunkan") - 0.1, A("s5:dibangunkan") + 1.3);
    const msgOut = ramp(t, A("s5:Satu") - 0.2, A("s5:Satu") + 0.4);
    for (const s of SLEEP) {
      s.G.visible = sleepVis;
      let v = sleepIn;
      if (s.i === 2) v *= 1 - msgOut;
      s.G.scale.set(1, Math.max(0.001, v), 1);
      s.roll.rotation.x = 0.55 * Math.sin(2 * Math.PI * turn + s.i * 1.3) * (1 - sit);
      s.hip.rotation.z = s.d * sit * (1.0 + 0.08 * s.i);
    }
    // the dog, folded flat until they sleep
    DOG.visible = (t < K.s2 - 0.35) || (t > A("s3:menidurkan") + 0.3);
    const dogIn = t < K.s2 ? 1 - ramp(t, K.s2 - 0.9, K.s2 - 0.35) : back((t - A("s3:menidurkan") - 0.3) / 0.6);
    DOG.scale.set(1.25, 1.25 * Math.max(0.001, dogIn), 1.25);
    dogInner.rotation.z = 0.025 * Math.sin(t * 1.1);

    // youths: in the city, then walking to the cave, praying, then folding down as sleep comes
    const tA = A("s2:Mereka"), tB = K.s3, tC = A("s3:berdoa") + 0.4, tZ = A("s3:menidurkan");
    const INSIDE = [-3.4, -1.2, 1.0, 3.1];
    for (const w of WALK) {
      const i = w.i, G = w.G;
      G.visible = t > K.s2 - 0.4 && t < tZ + 0.8;
      const x0 = 16.4 + i * 0.75, x1 = 10.2 + i * 1.0, x2 = INSIDE[i];
      const u1 = clamp01((t - tA - i * 0.12) / (tB - tA)), u2 = clamp01((t - tB - i * 0.1) / (tC - tB));
      const x = t < tB ? x0 + (x1 - x0) * u1 : x1 + (x2 - x1) * u2;
      const z = t < tB ? -0.6 - (i % 2) * 0.35 : -0.75 + (-1.5 + 0.75) * u2 - (i % 2) * 0.35 * (1 - u2);
      const moving = (u1 > 0 && u1 < 1 && t < tB) || (u2 > 0 && u2 < 1 && t >= tB);
      const st = (t - i * 0.2) * 9;
      G.position.set(x, moving ? 0.07 * Math.abs(Math.sin(st)) : 0, z);
      const facingLeft = t > A("s2:memilih") - 0.3;
      const bow = ramp(t, A("s3:Ya") - 0.2, A("s3:Ya") + 0.4) * (1 - ramp(t, tZ - 0.4, tZ));
      G.scale.set(facingLeft ? -1 : 1, 1, 1);
      G.rotation.z = (moving ? 0.05 * Math.sin(st) : 0) + bow * 0.22;
      G.rotation.x = -Math.PI / 2 * eout((t - tZ - i * 0.08) / 0.5);
      if (t < A("s2:memilih")) G.rotation.y = 0;
    }
    // the messenger: one of them leaves for the city with the silver coin
    const tM = A("s5:Satu"), tE = A("s5:jangan") + 0.6;
    MSG.visible = t > tM - 0.2 && t < K.s6 + 0.5;
    const um = clamp01((t - tM - 0.3) / (tE - tM - 0.3));
    MSG.position.set(2.6 + (15.4 - 2.6) * um, um > 0 && um < 1 ? 0.07 * Math.abs(Math.sin(t * 9)) : 0, -1.4 + 0.9 * um);
    MSG.rotation.x = -Math.PI / 2 * (1 - eout((t - tM + 0.2) / 0.5));
    MSG.rotation.z = um > 0 && um < 1 ? 0.05 * Math.sin(t * 9) : 0;
    MSG.scale.set(1, 1, 1);
    // coin: pops up beside the messenger at "uang perak", spins, then tucks away
    const cin = back((t - A("s5:uang") + 0.25) / 0.45), cout = ramp(t, A("s5:membeli") + 0.4, A("s5:makanan") + 0.3);
    COING.visible = t > A("s5:uang") - 0.3 && t < A("s5:makanan") + 0.4;
    const mx = MSG.position.x;
    COING.position.set(mx + 0.55 - 0.3 * cout, 1.9 + 0.08 * Math.sin(t * 3) - 0.6 * cout, 0.2 - 1.2 * cout);
    COING.scale.setScalar(Math.max(0.001, cin * (1 - cout)));
    COING.rotation.y = t * 2.4;

    // crowd: still, a slow lean toward the temple
    const crowdV = t < K.s3 + 1 || t > A("s5:kota") - 0.5;
    for (const cr of CROWD) { cr.G.visible = crowdV; cr.G.rotation.x = -0.12 * (0.5 + 0.5 * Math.sin(t * 0.8 + cr.ph)); }

    // city: changed in the hook (time passing) and when the messenger reaches it
    const nw = clamp01(ramp(t, A("s1:309") - 0.2, A("s1:309") + 0.9) * (1 - ramp(t, K.s2 - 0.7, K.s2 - 0.2)) + ramp(t, A("s5:kota") - 0.4, A("s5:kota") + 0.9));
    for (const b of OLD) { const v = clamp01((1 - nw) * 1.4 - b.k); b.G.rotation.x = -Math.PI / 2 * (1 - eout(v)); b.G.visible = v > 0.01; }
    for (const b of NEW) { const v = clamp01(nw * 1.4 - b.k); b.G.rotation.x = -Math.PI / 2 * (1 - eout(v)); b.G.visible = v > 0.01; }

    // s6: two rulers of equal length, 300 sun years and 309 moon years
    const rs = eout((t - A("s6:matahari") + 0.3) / 0.9) * (1 - ramp(t, K.s7 - 0.4, K.s7));
    const rm = eout((t - A("s6:setara") + 0.1) / 0.9) * (1 - ramp(t, K.s7 - 0.4, K.s7));
    RSUN.scale.x = Math.max(0.001, rs); RMOON.scale.x = Math.max(0.001, rm);
    RSUN.visible = RSD.visible = rs > 0.002; RMOON.visible = RMD.visible = rm > 0.002;
    RSD.scale.setScalar(0.42 * Math.max(0.001, back(rs * 2))); RMD.scale.setScalar(0.42 * Math.max(0.001, back(rm * 2)));
    RSD.rotation.z = t * 0.3;

    // s7: guesses pop up and fold away when "Tuhanku lebih mengetahui"
    ["s7:tiga", "s7:lima", "s7:tujuh"].forEach((k, i) => {
      const v = back((t - A(k) + 0.05) / 0.4) * (1 - ramp(t, A("s7:Tuhanku") - 0.1 + i * 0.08, A("s7:Tuhanku") + 0.4 + i * 0.08));
      TAGS[i].G.visible = v > 0.002;
      TAGS[i].G.scale.set(1, Math.max(0.001, v), 1);
      TAGS[i].G.rotation.z = (i - 1) * -0.08 + 0.03 * Math.sin(t * 1.3 + i);
    });

    // paper flecks drifting in front of the subject
    const fp = fleck.pos;
    for (let i = 0; i < FL; i++) {
      const d = fseed[i];
      const k = 0.25 + 0.55 * d[0];
      fp[i * 3] = c[0] + (c[3] - c[0]) * k + (d[1] - 0.5) * 12 + Math.sin(t * 0.25 + d[3] * 9) * 0.8;
      fp[i * 3 + 1] = c[4] + (d[2] - 0.5) * 12 + ((t * 0.12 + d[3] * 7) % 3) - 1.5;
      fp[i * 3 + 2] = c[2] + (c[5] - c[2]) * k + (d[3] - 0.5) * 6;
    }
    fleck.commit();
    fleck.m.opacity = 0.35 + 0.2 * (1 - day);

    bp.strength = 0.28 + 0.12 * day;
    comp.render();
  };
}
