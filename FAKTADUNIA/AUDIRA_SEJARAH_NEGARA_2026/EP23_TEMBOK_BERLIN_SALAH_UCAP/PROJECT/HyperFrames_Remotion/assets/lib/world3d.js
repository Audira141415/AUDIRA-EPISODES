// EP23 FILMNOIR: the Berlin Wall opened because of one wrong answer (9 Nov 1989). Units are metres.
// Three sets, far apart, each lit only while the camera is inside it:
//  EXT (origin)  the Bornholmer Strasse crossing at night: hinterland wall (z=-30) with the steel gate and boom,
//                death strip with watchtowers and sweeping searchlights, the 4 m front wall (z=0), wet asphalt, fog.
//  ROOM (x=1000) the press room: long table on a dais, three seated silhouettes, microphones (one flag reads AUDIRA),
//                the SCHABOWSKI name card, the slip of paper, a wall clock 18.00 -> 18.53, venetian-blind light,
//                rows of press silhouettes and a TV camera. A Politburo desk with the new travel rule stands in the corner.
//  FLAT (x=2000) an East Berlin living room: a CRT TV glowing at 20.00, two silhouettes on a sofa.
// Story: s1-s2 EXT, s3-s5 ROOM, s6a FLAT, s6b-s8 EXT (crowd gathers, gate opens ~22.45, payoff crane).
// Everything is a pure function of t.

const FONTS = ['700 80px "Playfair Display"', 'italic 700 80px "Playfair Display"', '700 80px "Courier Prime"', '400 80px "Courier Prime"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "SEGERA 18.53 ß ä"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fonts */ }
}

import * as THREE from "./three.module.js";
import { mulberry, clamp01, smooth, eout, back, canvasTex, stage, pts } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";

const PF = '"Playfair Display", Georgia, serif', CM = '"Courier Prime", "Courier New", monospace';
const RED = "#B3122E", CREAM = "#F3E2B3", INK = "#141414";

// monotone cubic over time keys: never overshoots a key
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

function noise(g, w, h, seed, n, light = "255,255,255", dark = "0,0,0", a = 0.05) {
  const q = mulberry(seed);
  for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${q() < 0.5 ? light : dark},${q() * a})`; g.fillRect(q() * w, q() * h, 1 + q() * 3, 1 + q() * 3); }
}
function paper(g, w, h, seed, base = "#E9E3D3") {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  noise(g, w, h, seed, w * h / 200, "255,255,250", "90,80,60", 0.07);
  const q = mulberry(seed + 9);
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(110,95,70,${0.04 + q() * 0.05})`; g.lineWidth = 0.8; const x = q() * w, y = q() * h, a = q() * 6.3, L = 8 + q() * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  gr.addColorStop(0, "rgba(90,70,40,0)"); gr.addColorStop(1, "rgba(90,70,40,.25)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x07080a, exp: 0.72, bloom: [0.22, 0.45, 0.86], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.72;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.1;
  scene.fog = new THREE.FogExp2(0x0a0b0e, 0.016);
  cam.near = 0.05; cam.far = 600; cam.setViewOffset(1080, 1920, 0, -170, 1080, 1920);

  const labels = [];
  const tex = (w, h, paint, rep) => { const t = canvasTex(w, h, paint, rep); labels.push([t, paint]); return t; };
  const add = (geo, mat, x, y, z, p = scene, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const C = (rt, rb, h, seg, mat, x, y, z, p, cast) => add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, p, cast);
  const std = (c, ro = 0.6, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(0.55, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const blob = (w, d, x, y, z, o = 0.6, p = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.01, z); m.renderOrder = 1; p.add(m); return m; };
  const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, toneMapped: false, fog: true });
  const blindT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2); gr.addColorStop(0, "#fff"); gr.addColorStop(0.75, "#ddd"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "#000"; for (let y = 0; y < h; y += 40) g.fillRect(0, y + 22, w, 18); g.fillRect(w / 2 - 6, 0, 12, h); });

  // ---------- silhouettes (no faces, no likeness): coat, shoulders, head, hat ----------
  // fresnel rim so silhouettes keep an edge against the dark (cold moon colour), blacks stay black inside
  const rim = (m, c = 0x8fa6c4, k = 0.55, p = 2.6) => { m.onBeforeCompile = (sh) => { sh.uniforms.rimC = { value: new THREE.Color(c).multiplyScalar(k) }; sh.fragmentShader = "uniform vec3 rimC;\n" + sh.fragmentShader.replace("#include <opaque_fragment>", `float rimF = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), ${p.toFixed(2)});
outgoingLight += rimC * rimF;
#include <opaque_fragment>`); }; m.customProgramCacheKey = () => "rim" + c + k + p; return m; };
  const sil = rim(std(0x0c0d0f, 0.8, 0.05)), silCoat = rim(std(0x101114, 0.9)), silHat = rim(std(0x0d0e10, 0.6), 0x8fa6c4, 0.45);
  function person(seed, { hat = true, seated = false, scarf = false } = {}) {
    const q = mulberry(seed * 97 + 13);
    const G = new THREE.Group(), body = new THREE.Group(); G.add(body);
    const coat = q() < 0.5 ? silCoat : sil;
    const leg = (s) => { const p = new THREE.Group(); p.position.set(s * 0.1, 0.86, 0); body.add(p); C(0.07, 0.06, 0.82, 8, sil, 0, -0.41, 0, p); B(0.12, 0.07, 0.26, silHat, 0, -0.84, 0.05, p); return p; };
    const legL = leg(-1), legR = leg(1);
    if (seated) { legL.rotation.x = legR.rotation.x = -1.45; }
    C(0.2, 0.27, 0.78, 12, coat, 0, 1.12, 0, body);
    const sh = add(new THREE.SphereGeometry(0.25, 14, 10), coat, 0, 1.47, 0, body); sh.scale.set(1.0, 0.42, 0.62);
    C(0.05, 0.06, 0.1, 8, sil, 0, 1.6, 0, body);
    add(new THREE.SphereGeometry(0.105, 14, 12), sil, 0, 1.72, 0.01, body).scale.set(1, 1.12, 1.05);
    if (scarf) C(0.09, 0.1, 0.07, 10, std(0x2a2b2e, 0.9), 0, 1.58, 0, body);
    if (hat) { C(0.2, 0.2, 0.018, 18, silHat, 0, 1.79, 0, body); C(0.095, 0.11, 0.12, 14, silHat, 0, 1.85, 0, body); }
    const arm = (s) => { const p = new THREE.Group(); p.position.set(s * 0.25, 1.45, 0); body.add(p); C(0.055, 0.05, 0.36, 8, coat, 0, -0.18, 0, p); const f = new THREE.Group(); f.position.set(0, -0.36, 0); p.add(f); C(0.05, 0.045, 0.32, 8, coat, 0, -0.16, 0, f); add(new THREE.SphereGeometry(0.045, 8, 6), sil, 0, -0.33, 0, f); p.rotation.z = s * 0.1; f.rotation.x = -0.25; return { p, f }; };
    const aL = arm(-1), aR = arm(1);
    if (seated) { body.position.y = -0.4; aL.p.rotation.x = aR.p.rotation.x = -0.5; aL.f.rotation.x = aR.f.rotation.x = -1.0; }
    const s = 0.94 + q() * 0.12; G.scale.setScalar(s);
    return { G, body, legL, legR, aL, aR, ph: q() * 6.28 };
  }
  const walk = (P, t, v) => { const a = Math.sin(t * 7.5 + P.ph) * 0.5 * v; P.legL.rotation.x = a; P.legR.rotation.x = -a; P.aL.p.rotation.x = -a * 0.6; P.aR.p.rotation.x = a * 0.6; P.body.position.y = Math.abs(Math.cos(t * 7.5 + P.ph)) * 0.03 * v; };

  // ====================================================================================================
  // EXT: Bornholmer Strasse crossing
  // ====================================================================================================
  const EXT = new THREE.Group(); scene.add(EXT);
  const asphT = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#26282c"; g.fillRect(0, 0, w, h); noise(g, w, h, 4, 90000, "200,200,210", "0,0,0", 0.12); }, [30, 30]);
  const asphR = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#c4c4c4"; g.fillRect(0, 0, w, h); const q = mulberry(8); for (let i = 0; i < 12; i++) { const x = q() * w, y = q() * h, rr = 30 + q() * 90; const gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, "rgba(95,95,95,1)"); gr.addColorStop(0.7, "rgba(110,110,110,.7)"); gr.addColorStop(1, "rgba(110,110,110,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr, rr * (0.4 + q() * 0.5), q() * 3, 0, 7); g.fill(); } noise(g, w, h, 5, 40000, "255,255,255", "0,0,0", 0.2); }, [30, 30]);
  asphR.colorSpace = THREE.NoColorSpace;
  const ground = add(new THREE.PlaneGeometry(600, 600), std(0xffffff, 1, 0, { map: asphT, roughnessMap: asphR, envMapIntensity: 0.25 }), 0, 0, 0, EXT, false);
  ground.rotation.x = -Math.PI / 2;
  // road markings and kerbs
  const kerb = std(0x55575c, 0.8);
  for (const s of [-1, 1]) { B(0.3, 0.16, 400, kerb, s * 7.2, 0.08, -60, EXT); }
  const dash = glow(0x8d8a80);
  for (let z = -200; z < 140; z += 6) { const m = add(new THREE.PlaneGeometry(0.16, 2.6), std(0xb8b4a8, 0.5), 0, 0.012, z, EXT, false); m.rotation.x = -Math.PI / 2; }
  // death strip sand (between hinterland wall z=-30 and front wall z=0)
  const sandT = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#6f6c66"; g.fillRect(0, 0, w, h); noise(g, w, h, 21, 120000, "220,215,200", "20,20,20", 0.18); g.strokeStyle = "rgba(40,40,40,.35)"; g.lineWidth = 2; for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 6); g.stroke(); } }, [40, 3]);
  for (const s of [-1, 1]) { const m = add(new THREE.PlaneGeometry(250, 29.6), std(0xffffff, 0.95, 0, { map: sandT }), s * (7.4 + 125), 0.02, -15, EXT, false); m.rotation.x = -Math.PI / 2; }

  // concrete wall element texture: seams every 1.2 m, stains, pipe on top
  const conT = (seed, cols) => canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = "#8d8b86"; g.fillRect(0, 0, w, h); noise(g, w, h, seed, 60000, "235,232,225", "30,30,30", 0.14);
    const q = mulberry(seed + 1);
    for (let i = 0; i < 40; i++) { const x = q() * w; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(40,38,34,.0)"); gr.addColorStop(1, `rgba(40,38,34,${0.1 + q() * 0.2})`); g.fillStyle = gr; g.fillRect(x, h * q() * 0.5, 2 + q() * 8, h); }
    g.fillStyle = "rgba(20,20,20,.75)"; for (let i = 0; i <= cols; i++) g.fillRect(i * w / cols - 2, 0, 4, h);
  }, [1, 1]);
  const wallTex = conT(31, 8);
  const wallMat = std(0xffffff, 0.92, 0, { map: wallTex, bumpMap: wallTex, bumpScale: 0.035 });
  const pipeMat = rim(std(0xa8a6a0, 0.7), 0xc8d6e8, 0.9, 2.0);
  function wallRun(x0, x1, z, h, pipe, p = EXT) {
    for (let x = x0; x < x1 - 0.01; x += 9.6) {
      const w = Math.min(9.6, x1 - x);
      B(w, h, 0.3, wallMat, x + w / 2, h / 2, z, p);
      if (pipe) { const pp = C(0.3, 0.3, w, 12, pipeMat, x + w / 2, h + 0.18, z, p); pp.rotation.z = Math.PI / 2; }
      blob(w + 1.4, 2.2, x + w / 2, 0, z, 0.55, p);
    }
  }
  wallRun(-240, -7.4, 0, 3.62, true); wallRun(7.4, 240, 0, 3.62, true);     // front wall: 3.6 m slab + pipe = ~4 m
  wallRun(-240, -12, -30, 3.0, false); wallRun(12, 240, -30, 3.0, false);   // hinterland wall
  // strip lamp posts (cold), every 24 m
  const postM = std(0x2a2c30, 0.5, 0.6);
  for (let x = -228; x <= 228; x += 24) { if (Math.abs(x) < 10) continue; C(0.08, 0.1, 6.5, 6, postM, x, 3.25, -6, EXT); const arm = B(0.1, 0.1, 1.4, postM, x, 6.45, -5.4, EXT); add(new THREE.SphereGeometry(0.16, 10, 8), glow(0xc8d6e8), x, 6.3, -4.8, EXT, false); }

  // watchtowers: square shaft + octagonal cabin with a lit window band + roof searchlight
  const towerM = std(0x9a9893, 0.9, 0, { map: conT(55, 3) }), winM = glow(0x3a3d40), towers = [];
  function tower(x, z, ry) {
    const T = new THREE.Group(); T.position.set(x, 0, z); T.rotation.y = ry; EXT.add(T);
    B(1.3, 7.2, 1.3, towerM, 0, 3.6, 0, T);
    C(1.75, 1.75, 0.5, 8, towerM, 0, 7.45, 0, T);
    C(1.6, 1.6, 0.4, 8, towerM, 0, 7.9, 0, T);
    const win = C(1.62, 1.62, 1.0, 8, winM, 0, 8.6, 0, T, false); win.material = glow(0x4a4636);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; B(0.16, 1.0, 0.16, towerM, Math.cos(a) * 1.58, 8.6, Math.sin(a) * 1.58, T); }
    C(1.8, 1.7, 0.45, 8, towerM, 0, 9.32, 0, T);
    const sl = new THREE.Group(); sl.position.set(0, 9.9, 0); T.add(sl);
    C(0.22, 0.22, 0.6, 12, std(0x1c1d20, 0.4, 0.8), 0, 0, 0, sl).rotation.x = Math.PI / 2;
    blob(4, 4, 0, 0, 0, 0.7, T);
    towers.push({ T, sl, x, z });
    return T;
  }
  [[-9, -21, 0.2], [11, -23, -0.3], [-42.5, -8.5, 0.1], [56, -16, 0.4], [-90, -15, 0.2], [-138, -14, 0.3], [150, -15, -0.2], [-205, -16, 0], [212, -15, 0.2]].forEach(([x, z, ry]) => tower(x, z, ry));

  // searchlight beams: additive cones fading along their length, plus a real spot for the ground pool
  const beamT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  function beam(len, rad, op) {
    const geo = new THREE.ConeGeometry(rad, len, 32, 1, true); geo.translate(0, -len / 2, 0); geo.rotateX(-Math.PI / 2); // apex at origin, points +z
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe8eef5, map: beamT, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }));
    return m;
  }
  const sweeps = [0, 1, 2, 3].map((i) => {
    const tw = towers[i], b = beam(46, 6.5, 0.13);
    const o = new THREE.Vector3(tw.x, 9.9, tw.z); b.position.copy(o); EXT.add(b);
    const sp = new THREE.SpotLight(0xe6eef8, 0, 80, 0.13, 0.45, 1.2); sp.position.copy(o); EXT.add(sp, sp.target);
    return { b, sp, o, i };
  });

  // checkpoint: steel gate in the hinterland wall gap (z=-30), boom barrier, booth, sign gantry, tungsten lamps
  const steel = std(0x2b2d31, 0.38, 0.85), steelLite = std(0x5a5d62, 0.35, 0.8);
  const leaves = [-1, 1].map((s) => {
    const P = new THREE.Group(); P.position.set(s * 12, 0, -30); EXT.add(P);
    const L = new THREE.Group(); P.add(L);
    const W = 12;
    B(W, 0.16, 0.16, steel, -s * W / 2, 0.25, 0, L); B(W, 0.16, 0.16, steel, -s * W / 2, 2.6, 0, L); B(W, 0.12, 0.12, steel, -s * W / 2, 1.45, 0, L);
    for (let k = 0; k <= 24; k++) C(0.035, 0.035, 2.45, 6, steelLite, -s * k * W / 24, 1.42, 0, L);
    for (let k = 0; k < 5; k++) { const d = B(W / 5 * 1.18, 0.06, 0.06, steel, -s * (k + 0.5) * W / 5, 1.42, 0.05, L); d.rotation.z = s * 0.38; }
    C(0.14, 0.14, 3.2, 10, steel, 0, 1.6, 0, P);
    return L;
  });
  for (const s of [-1, 1]) { B(0.8, 3.2, 0.8, std(0x7d7b76, 0.9, 0, { map: conT(61, 1) }), s * 12.5, 1.6, -30, EXT); }
  const boomP = new THREE.Group(); boomP.position.set(-6.6, 1.0, -37); EXT.add(boomP);
  B(0.5, 1.0, 0.5, std(0x3a3b3e, 0.6), 0, -0.5, 0, boomP);
  const stripeT = canvasTex(512, 32, (g, w, h) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "#d9d4c6" : RED; g.fillRect(i * w / 12, 0, w / 12 + 1, h); } });
  const boom = B(13, 0.16, 0.16, std(0xffffff, 0.45, 0, { map: stripeT }), 6.5, 0.15, 0, boomP);
  const booth = new THREE.Group(); booth.position.set(10.5, 0, -38); EXT.add(booth);
  B(3.2, 2.5, 3.0, std(0x4c4d50, 0.8, 0, { map: conT(71, 2) }), 0, 1.25, 0, booth);
  B(3.5, 0.2, 3.3, steel, 0, 2.6, 0, booth);
  add(new THREE.PlaneGeometry(2.6, 0.8), glow(0xd8b878), 0, 1.6, -1.52, booth, false).rotation.y = Math.PI;
  add(new THREE.PlaneGeometry(2.4, 0.8), glow(0xd8b878), -1.61, 1.6, 0, booth, false).rotation.y = -Math.PI / 2;
  blob(5, 5, 0, 0, 0, 0.7, booth);
  const boothL = new THREE.PointLight(0xffd59a, 6, 9, 2); boothL.position.set(10.5, 1.8, -40.2); EXT.add(boothL);
  // sign gantry
  for (const s of [-1, 1]) C(0.14, 0.16, 5.2, 10, steel, s * 13.5, 2.6, -25, EXT);
  B(27.4, 0.3, 0.3, steel, 0, 5.1, -25, EXT);
  const signT = tex(2048, 256, (g, w, h) => {
    g.fillStyle = "#e8e4d8"; g.fillRect(0, 0, w, h); noise(g, w, h, 77, 30000, "255,255,255", "60,60,60", 0.08);
    g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 54px ${CM}`; g.fillText("GRENZÜBERGANGSSTELLE", w / 2, 70);
    g.font = `700 118px ${PF}`; g.fillText("Bornholmer Straße", w / 2, 168);
  });
  const sign = add(new THREE.PlaneGeometry(16, 2.0), std(0xffffff, 0.6, 0, { map: signT }), 0, 4.0, -25.18, EXT, false); sign.rotation.y = Math.PI;
  B(16.2, 2.1, 0.08, steel, 0, 4.0, -25.1, EXT);
  // tungsten street lamps
  const tung = [];
  for (const [x, z] of [[-8.5, -44], [8.5, -52], [-8.5, -62]]) {
    C(0.1, 0.13, 7.2, 8, postM, x, 3.6, z, EXT);
    const arm = B(Math.abs(x) * 0.28, 0.1, 0.1, postM, x - Math.sign(x) * 1.1, 7.15, z, EXT);
    const hx = x - Math.sign(x) * 2.2;
    const shade = C(0.12, 0.42, 0.32, 14, steel, hx, 7.05, z, EXT);
    add(new THREE.SphereGeometry(0.16, 12, 8), glow(0xffe3a0), hx, 6.86, z, EXT, false);
    const sp = new THREE.SpotLight(0xffd79a, 170, 30, 0.72, 0.55, 1.6); sp.position.set(hx, 6.8, z); sp.target.position.set(hx, 0, z + 1); EXT.add(sp, sp.target);
    tung.push(sp);
  }
  tung[0].castShadow = true; tung[0].shadow.mapSize.set(2048, 2048); tung[0].shadow.bias = -0.0004; tung[0].shadow.camera.near = 0.5; tung[0].shadow.camera.far = 30;
  tung[1].castShadow = true; tung[1].shadow.mapSize.set(1024, 1024); tung[1].shadow.bias = -0.0004;
  const gateLamp = new THREE.SpotLight(0xffe3a0, 0, 60, 0.6, 0.6, 1.4); gateLamp.position.set(0, 9, -24); gateLamp.target.position.set(0, 0, -40); EXT.add(gateLamp, gateLamp.target);
  // moon rim from the west (behind the gate as seen from the east), cold
  const moon = new THREE.DirectionalLight(0xa3bfdb, 0.9); moon.position.set(-40, 60, 90); moon.target.position.set(0, 0, -30);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 10, far: 260 }); moon.shadow.bias = -0.0005; moon.shadow.normalBias = 0.03;
  EXT.add(moon, moon.target);
  const hemiE = new THREE.HemisphereLight(0x3a4458, 0x0c0c0e, 0.55); EXT.add(hemiE);
  // cold floods from the strip posts onto the front wall face
  for (const x of [-12, -36, -60, -84, 24, 48]) { const sp = new THREE.SpotLight(0xc8d6e8, 75, 26, 0.85, 0.6, 1.5); sp.position.set(x, 6.3, -4.8); sp.target.position.set(x, 0.5, 0); EXT.add(sp, sp.target); }
  // 4 m measurement (s2), standing on the strip side of the front wall
  const meas = new THREE.Group(); meas.position.set(-39.3, 0, -0.9); EXT.add(meas);
  // searchlight spill on the wall face beside the measure, and a grazing light along the wall top
  const spill = new THREE.SpotLight(0xe6eef8, 300, 40, 0.42, 0.7, 1.3); spill.position.set(-42.5, 9.9, -8.5); spill.target.position.set(-38.5, 1.8, 0); EXT.add(spill, spill.target);
  const graze = new THREE.SpotLight(0xc8d6e8, 500, 60, 0.25, 0.6, 1.2); graze.position.set(-20, 6.5, 3); graze.target.position.set(-50, 3.7, 0); EXT.add(graze, graze.target);
  const mm = glow(0xf3e2b3);
  B(0.05, 3.98, 0.05, mm, 0, 1.99, 0, meas, false); B(0.7, 0.05, 0.05, mm, 0, 0.03, 0, meas, false); B(0.7, 0.05, 0.05, mm, 0, 3.98, 0, meas, false);
  const measT = tex(256, 128, (g, w, h) => { g.fillStyle = "rgba(10,10,10,.85)"; g.fillRect(0, 0, w, h); g.strokeStyle = CREAM; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = CREAM; g.font = `700 76px ${PF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("4 m", w / 2, h / 2 + 4); });
  const measL = add(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: measT, transparent: true, toneMapped: false }), -1.15, 2.0, 0, meas, false); measL.rotation.y = Math.PI;
  // the SEGERA slip lying on the wet asphalt (payoff)
  const slipPaint = (big) => (g, w, h) => {
    paper(g, w, h, 9, "#E6DFCC");
    g.fillStyle = "#2a2724"; g.font = `400 34px ${CM}`; g.textAlign = "left";
    const L = ["Warga boleh mengajukan", "izin perjalanan ke luar", "negeri, termasuk lewat", "pos perbatasan Berlin."];
    L.forEach((s, i) => g.fillText(s, 40, 70 + i * 46));
    if (big) { g.fillStyle = RED; g.font = `700 104px ${PF}`; g.textAlign = "center"; g.fillText("SEGERA", w / 2, h - 70); g.fillRect(w * 0.2, h - 52, w * 0.6, 8); }
  };
  const groundSlip = add(new THREE.PlaneGeometry(0.93, 0.63), std(0xffffff, 0.85, 0, { map: tex(640, 432, slipPaint(true)) }), 2.2, 0.025, -44.5, EXT, false);
  groundSlip.rotation.set(-Math.PI / 2, 0, 2.95);

  // fog banks: layered soft planes drifting across the strip
  const fogT = canvasTex(512, 256, (g, w, h) => { const q = mulberry(91); for (let i = 0; i < 60; i++) { const x = q() * w, y = h * (0.35 + q() * 0.4), rr = 30 + q() * 70; const gr = g.createRadialGradient(x, y, 2, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } const m = g.createLinearGradient(0, 0, w, 0); });
  const fogs = [];
  for (let i = 0; i < 14; i++) {
    const q = mulberry(300 + i);
    const m = add(new THREE.PlaneGeometry(60, 9), new THREE.MeshBasicMaterial({ map: fogT, color: 0x9aa4b2, transparent: true, opacity: 0.14 + q() * 0.1, depthWrite: false, toneMapped: false, fog: true }), (q() - 0.5) * 80, 2.2 + q() * 2.5, -70 + i * 6.5, EXT, false);
    m.userData = { x0: m.position.x, v: 0.25 + q() * 0.4 }; fogs.push(m);
  }

  // crowd (s6b-s8): walks out of the fog, gathers before the gate, streams through when it opens
  const crowd = [];
  const cq = mulberry(1989);
  for (let i = 0; i < 96; i++) {
    const P = person(i + 1, { hat: cq() < 0.45, scarf: cq() < 0.4 });
    EXT.add(P.G);
    const gx = (cq() - 0.5) * (6 + (i / 96) * 14), gz = -31.6 - Math.sqrt(i / 96) * 24 - cq() * 1.5;
    P.gx = gx; P.gz = gz; P.arrive = cq(); P.lane = (cq() - 0.5) * 9; P.rank = (-31.6 - gz) / 26 + cq() * 0.12;
    P.sx = gx + (cq() - 0.5) * 20; P.sz = -95 - cq() * 30;
    const bl = blob(0.9, 0.9, 0, 0, 0, 0.55, EXT); P.bl = bl;
    crowd.push(P);
  }
  // guards behind the gate (silhouettes, with caps)
  const guards = [-3.2, 4.1].map((x, i) => { const P = person(200 + i, { hat: true }); P.G.position.set(x, 0, -27.5); P.G.rotation.y = Math.PI; EXT.add(P.G); blob(0.9, 0.9, x, 0, -27.5, 0.6, EXT); return P; });

  // ====================================================================================================
  // ROOM: the press conference, x = 1000
  // ====================================================================================================
  const RX = 1000;
  const ROOM = new THREE.Group(); ROOM.position.set(RX, 0, 0); scene.add(ROOM);
  const floorT = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#2a221c"; g.fillRect(0, 0, w, h); const q = mulberry(14); for (let y = 0; y < h; y += 64) { g.fillStyle = `rgba(0,0,0,${0.25 + q() * 0.2})`; g.fillRect(0, y, w, 3); for (let x = q() * 300; x < w; x += 260 + q() * 200) g.fillRect(x, y, 3, 64); } noise(g, w, h, 15, 50000, "180,150,120", "0,0,0", 0.1); }, [6, 6]);
  const fl = add(new THREE.PlaneGeometry(30, 30), std(0xffffff, 0.45, 0, { map: floorT }), 0, 0, 0, ROOM, false); fl.rotation.x = -Math.PI / 2;
  const panelT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#4a4845"; g.fillRect(0, 0, w, h); noise(g, w, h, 23, 30000, "255,255,255", "0,0,0", 0.06); g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 6; for (let x = 0; x <= w; x += w / 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(0, h * 0.62, w, 8); }, [3, 1]);
  const backW = add(new THREE.PlaneGeometry(30, 7.5), std(0xffffff, 0.8, 0, { map: panelT }), 0, 3.75, -6, ROOM, false);
  const sideW = add(new THREE.PlaneGeometry(20, 7.5), std(0xffffff, 0.8, 0, { map: panelT }), -11, 3.75, 2, ROOM, false); sideW.rotation.y = Math.PI / 2;
  // heavy curtain strip behind the panel
  const curT = canvasTex(512, 64, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 30 + 22 * Math.sin(x * 0.19) + 10 * Math.sin(x * 0.051); g.fillStyle = `rgb(${v * 0.9 + 12},${v * 0.55 + 4},${v * 0.55 + 6})`; g.fillRect(x, 0, 1, h); } });
  add(new THREE.PlaneGeometry(11, 5.2), std(0xffffff, 0.95, 0, { map: curT }), 0, 2.9, -5.95, ROOM, false);
  // dais, table, cloth
  B(10, 0.3, 3.4, std(0x1c1814, 0.6), 0, 0.15, -4.1, ROOM);
  const cloth = std(0x16171a, 0.95);
  const tableTop = B(8.4, 0.06, 1.3, std(0x9a7a5c, 0.42, 0.05), 0, 1.08, -3.25, ROOM);
  const front = B(8.4, 0.8, 0.04, cloth, 0, 0.68, -2.62, ROOM);
  B(8.4, 0.06, 0.05, std(0x6a0f1d, 0.7), 0, 0.98, -2.6, ROOM);
  blob(9.5, 2.4, 0, 0.3, -3.2, 0.6, ROOM);
  // officials: three seated silhouettes; the centre one is the spokesman
  const officials = [-2.4, 0, 2.4].map((x, i) => { const P = person(50 + i, { hat: false, seated: true }); P.G.position.set(x, 0.3 + 0.55, -3.95); ROOM.add(P.G); C(0.25, 0.25, 0.06, 12, std(0x111111, 0.5), x, 0.78, -4.0, ROOM); return P; });
  const spk = officials[1];
  // glasses and a water carafe
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, roughness: 0.05, metalness: 0, transmission: 0.0, transparent: true, opacity: 0.35, envMapIntensity: 3 });
  for (const x of [-2.0, 0.65, 2.8]) C(0.04, 0.035, 0.12, 14, glass, x, 1.17, -3.05, ROOM);
  C(0.07, 0.09, 0.28, 16, glass, 1.9, 1.25, -3.3, ROOM);
  // microphones; one flag carries AUDIRA
  const micM = std(0x1a1b1e, 0.35, 0.7), chrome = std(0xbfc3c9, 0.18, 1.0, { envMapIntensity: 4 });
  const flagT = tex(512, 256, (g, w, h) => { g.fillStyle = "#151515"; g.fillRect(0, 0, w, h); g.strokeStyle = CREAM; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = CREAM; g.font = `700 108px ${PF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 - 6); g.fillStyle = RED; g.fillRect(w * 0.2, h - 50, w * 0.6, 10); });
  [[-0.2, 0.0], [0.05, 0.25], [0.4, -0.15], [0.67, 0.2], [0.93, -0.2]].forEach(([x, ry], i) => {
    const M = new THREE.Group(); M.position.set(x, 1.11, -2.9); M.rotation.y = ry; ROOM.add(M);
    C(0.06, 0.07, 0.03, 12, micM, 0, 0.015, 0, M);
    const st = C(0.008, 0.008, 0.36, 6, chrome, 0, 0.19, -0.05, M); st.rotation.x = -0.35;
    const head = C(0.026, 0.02, 0.1, 12, micM, 0, 0.37, -0.12, M); head.rotation.x = -1.0;
    if (i === 0) { const fm = std(0xffffff, 0.5, 0, { map: flagT }); B(0.13, 0.065, 0.13, [fm, fm, std(0x151515), std(0x151515), fm, fm], 0, 0.33, -0.1, M); }
  });
  // name card (tent) for the spokesman
  const nameT = tex(1024, 300, (g, w, h) => { paper(g, w, h, 33, "#ECE6D6"); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 116px ${PF}`; g.fillText("G. SCHABOWSKI", w / 2, h * 0.44); g.font = `700 40px ${CM}`; g.fillStyle = "#4a443a"; g.fillText("JURU BICARA · POLITBIRO", w / 2, h * 0.8); });
  const tentG = new THREE.Group(); tentG.position.set(0.05, 1.11, -2.72); ROOM.add(tentG);
  const tf = B(0.62, 0.18, 0.006, [std(0xece6d6), std(0xece6d6), std(0xece6d6), std(0xece6d6), std(0xffffff, 0.8, 0, { map: nameT }), std(0xece6d6)], 0, 0.087, 0.02, tentG); tf.rotation.x = -0.22;
  const tb = B(0.62, 0.18, 0.006, std(0xece6d6, 0.8), 0, 0.087, -0.02, tentG); tb.rotation.x = 0.22;
  // the slip of paper; slides in on "catatan", the answer word rises from it on "segera"
  const slipG = new THREE.Group(); ROOM.add(slipG);
  const slipGeo = new THREE.PlaneGeometry(0.54, 0.36, 24, 16); { const pa = slipGeo.attributes.position; for (let i = 0; i < pa.count; i++) { const u = pa.getX(i) / 0.27, v = pa.getY(i) / 0.18; pa.setZ(i, 0.012 * Math.max(0, u * u * u) + 0.006 * v * v); } slipGeo.computeVertexNormals(); }
  const slip = add(slipGeo, std(0xffffff, 0.85, 0, { map: tex(640, 432, slipPaint(false)) }), 0, 0, 0, slipG, false); slip.rotation.x = -Math.PI / 2;
  const segT = tex(1024, 300, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = CREAM; g.font = `700 230px ${PF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(243,226,179,.6)"; g.shadowBlur = 30; g.fillText("SEGERA", w / 2, h / 2 + 10); });
  const segW = add(new THREE.PlaneGeometry(1.5, 0.44), new THREE.MeshBasicMaterial({ map: segT, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }), 0, 1.6, -2.6, ROOM, false);
  // wall clock above the panel
  const clockG = new THREE.Group(); clockG.position.set(0, 4.95, -5.9); ROOM.add(clockG);
  const faceT = tex(512, 512, (g, w, h) => {
    g.fillStyle = "#ECE6D6"; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill(); noise(g, w, h, 41, 8000, "255,255,255", "60,50,40", 0.07);
    g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 54px ${PF}`;
    for (let k = 1; k <= 12; k++) { const a = k / 12 * Math.PI * 2; g.fillText(String(k), w / 2 + Math.sin(a) * 190, h / 2 - Math.cos(a) * 190 + 3); }
    for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r0 = k % 5 ? 232 : 222; g.lineWidth = k % 5 ? 3 : 7; g.strokeStyle = INK; g.beginPath(); g.moveTo(w / 2 + Math.sin(a) * r0, h / 2 - Math.cos(a) * r0); g.lineTo(w / 2 + Math.sin(a) * 246, h / 2 - Math.cos(a) * 246); g.stroke(); }
  });
  C(0.66, 0.66, 0.08, 40, steel, 0, 0, 0, clockG).rotation.x = Math.PI / 2;
  add(new THREE.CircleGeometry(0.6, 48), std(0x8a867c, 0.6, 0, { map: faceT }), 0, 0, 0.045, clockG, false);
  const handH = new THREE.Group(), handM = new THREE.Group(); handH.position.z = 0.06; handM.position.z = 0.07; clockG.add(handH, handM);
  B(0.05, 0.32, 0.01, std(0x111111, 0.4), 0, 0.14, 0, handH, false); B(0.03, 0.5, 0.01, std(0x111111, 0.4), 0, 0.22, 0, handM, false);
  add(new THREE.SphereGeometry(0.035, 10, 8), steel, 0, 0, 0.08, clockG, false);
  // press rows (seen from behind), a TV camera with AUDIRA plate, the Italian reporter who stands up
  const press = [];
  [[-3.6, 1.2], [-1.4, 1.5], [1.2, 1.3], [3.4, 1.6], [-2.6, 3.0], [-0.2, 3.2], [2.4, 3.1], [4.4, 3.3], [-4.6, 3.2]].forEach(([x, z], i) => {
    const P = person(120 + i, { hat: i % 3 === 0 || i === 1, seated: true }); P.G.position.set(x, 0.55, z); ROOM.add(P.G);
    B(0.5, 0.06, 0.5, std(0x1d1a17, 0.6), x, 0.48, z, ROOM); B(0.5, 0.6, 0.05, std(0x1d1a17, 0.6), x, 0.8, z + 0.27, ROOM);
    blob(0.9, 0.9, x, 0, z, 0.5, ROOM); press.push(P);
  });
  const reporter = press[1];
  const camG = new THREE.Group(); camG.position.set(2.3, 0, 2.3); camG.rotation.y = 0.18; ROOM.add(camG);
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; const l = C(0.02, 0.02, 1.55, 6, steel, Math.sin(a) * 0.3, 0.72, Math.cos(a) * 0.3, camG); l.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35); }
  const plateT = tex(512, 160, (g, w, h) => { g.fillStyle = "#1a1a1a"; g.fillRect(0, 0, w, h); g.fillStyle = CREAM; g.font = `700 92px ${PF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 4); });
  const camBody = B(0.32, 0.36, 0.7, [std(0x1f2023, 0.45, 0.5), std(0xffffff, 0.5, 0.2, { map: plateT }), std(0x1f2023, 0.45, 0.5), std(0x1f2023, 0.45, 0.5), std(0x1f2023, 0.45, 0.5), std(0x1f2023, 0.45, 0.5)], 0, 1.62, 0, camG);
  C(0.1, 0.12, 0.3, 16, std(0x111214, 0.3, 0.6), 0, 1.62, -0.5, camG).rotation.x = Math.PI / 2;
  const tally = add(new THREE.SphereGeometry(0.025, 8, 6), glow(0xff2a3a), 0, 1.84, -0.2, camG, false);
  // Politburo desk in the left corner (s3): desk, lamp, typed rule, stamp
  const DX = -7.6, DZ = 0.5;
  const desk = new THREE.Group(); desk.position.set(DX, 0, DZ); ROOM.add(desk);
  const woodT = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#3a2a1e"; g.fillRect(0, 0, w, h); const q = mulberry(66); for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "20,12,6" : "110,80,55"},${0.1 + q() * 0.2})`; g.lineWidth = 1 + q() * 2; const y = q() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (q() - 0.5) * 20, w * 0.7, y + (q() - 0.5) * 20, w, y + (q() - 0.5) * 10); g.stroke(); } });
  B(1.9, 0.06, 1.0, std(0xffffff, 0.32, 0.05, { map: woodT }), 0, 0.78, 0, desk);
  tableTop.material.map = woodT; tableTop.material.needsUpdate = true;
  B(1.8, 0.7, 0.9, std(0x241a12, 0.6), 0, 0.4, 0, desk);
  blob(1.2, 0.9, 0, 0.81, 0, 0.35, desk);
  const lampG = new THREE.Group(); lampG.position.set(-0.62, 0.81, -0.28); desk.add(lampG);
  C(0.1, 0.12, 0.03, 16, std(0x1b4a33, 0.3, 0.6), 0, 0.015, 0, lampG); const lst = C(0.012, 0.012, 0.42, 8, chrome, 0.05, 0.22, 0, lampG); lst.rotation.z = -0.25;
  const shadeM = std(0x1b4a33, 0.25, 0.4, { side: THREE.DoubleSide }); const lsh = C(0.05, 0.16, 0.16, 20, shadeM, 0.14, 0.42, 0.04, lampG, false); lsh.rotation.z = 0.6; lsh.geometry = new THREE.CylinderGeometry(0.05, 0.16, 0.16, 20, 1, true);
  add(new THREE.SphereGeometry(0.035, 10, 8), glow(0xffe3a0), 0.17, 0.39, 0.04, lampG, false);
  const ruleT = tex(1024, 1400, (g, w, h) => {
    paper(g, w, h, 17, "#E9E3D3");
    g.fillStyle = INK; g.textAlign = "center"; g.font = `700 60px ${PF}`; g.fillText("ATURAN PERJALANAN BARU", w / 2, 170);
    g.font = `700 34px ${CM}`; g.fillText("RANCANGAN · NOVEMBER 1989", w / 2, 232);
    g.fillRect(120, 262, w - 240, 4);
    g.textAlign = "left"; g.font = `400 38px ${CM}`;
    ["1. Warga dapat mengajukan izin", "   perjalanan ke luar negeri.", "", "2. Izin juga berlaku untuk", "   pos perbatasan Berlin.", "", "3. Aturan berlaku mulai", "   keesokan harinya."].forEach((s, i) => g.fillText(s, 120, 360 + i * 64));
    g.fillStyle = "rgba(20,20,20,.25)"; for (let i = 0; i < 6; i++) g.fillRect(120, 930 + i * 44, 520 + (i * 97) % 240, 14);
    g.fillStyle = "#555"; g.font = `700 26px ${CM}`; g.textAlign = "center"; g.fillText("ILUSTRASI · BUKAN DOKUMEN ASLI", w / 2, h - 60);
  });
  const rule = add(new THREE.PlaneGeometry(0.46, 0.63), std(0xffffff, 0.85, 0, { map: ruleT }), 0.12, 0.815, 0.05, desk, false); rule.rotation.set(-Math.PI / 2, 0, 0.06);
  const impT = tex(512, 220, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = RED; g.lineWidth = 14; g.strokeRect(16, 16, w - 32, h - 32); g.fillStyle = RED; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `700 74px ${CM}`; g.fillText("BERLAKU", w / 2, 82); g.fillText("BESOK", w / 2, 156); const q = mulberry(5); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.8})`; g.fillRect(q() * w, q() * h, 2 + q() * 3, 2 + q() * 3); } });
  const imp = add(new THREE.PlaneGeometry(0.26, 0.112), new THREE.MeshBasicMaterial({ map: impT, transparent: true, depthWrite: false, opacity: 0, toneMapped: true, color: 0xcccccc }), 0.16, 0.818, 0.17, desk, false); imp.rotation.set(-Math.PI / 2, 0, -0.12);
  const stamp = new THREE.Group(); desk.add(stamp);
  C(0.07, 0.075, 0.05, 20, std(0x2a1a14, 0.5), 0, 0.025, 0, stamp); C(0.025, 0.035, 0.14, 12, std(0x3a2416, 0.4), 0, 0.12, 0, stamp); add(new THREE.SphereGeometry(0.045, 12, 10), std(0x3a2416, 0.35), 0, 0.2, 0, stamp);
  const STAMP_REST = new THREE.Vector3(0.62, 0.81, 0.3);
  // light: blinds key through the side window, hard spot over the table, desk lamp, rim, flashes
  const blinds = new THREE.SpotLight(0xdfe7f2, 520, 40, 0.42, 0.25, 1.4); blinds.map = blindT; blinds.castShadow = true; blinds.shadow.mapSize.set(2048, 2048); blinds.shadow.bias = -0.0004;
  blinds.position.set(RX - 10.5, 5.5, 7); blinds.target.position.set(RX + 0.5, 2.2, -5.2); ROOM.parent.add(blinds, blinds.target);
  const keyR = new THREE.SpotLight(0xffe3a0, 105, 18, 0.36, 0.5, 1.5); keyR.position.set(RX + 0.6, 6.5, 0.9); keyR.target.position.set(RX - 0.3, 1.1, -2.95); keyR.castShadow = true; keyR.shadow.mapSize.set(2048, 2048); keyR.shadow.bias = -0.0004; scene.add(keyR, keyR.target);
  const deskL = new THREE.SpotLight(0xffd99a, 1.8, 4, 0.8, 0.5, 1.6); deskL.position.set(RX + DX - 0.45, 1.2, DZ - 0.24); deskL.target.position.set(RX + DX + 0.1, 0.8, DZ + 0.1); deskL.castShadow = true; deskL.shadow.mapSize.set(1024, 1024); deskL.shadow.bias = -0.0005; scene.add(deskL, deskL.target);
  const rimR = new THREE.DirectionalLight(0xa3bfdb, 1.3); rimR.position.set(RX + 3, 5, -9); rimR.target.position.set(RX, 1, 0); scene.add(rimR, rimR.target);
  const hemiR = new THREE.HemisphereLight(0x50586a, 0x0d0b09, 0.35); scene.add(hemiR);
  const flash = new THREE.PointLight(0xf0f4ff, 0, 14, 1.6); flash.position.set(RX - 1.5, 2.2, 1.0); scene.add(flash);
  const roomLights = [blinds, keyR, deskL, rimR, hemiR, flash];
  const FL = []; { const q = mulberry(711); const add2 = (a, b, n) => { for (let i = 0; i < n; i++) FL.push(a + q() * (b - a)); }; add2(A("s4:konferensi") - 0.2, A("s4:langsung") + 0.4, 4); add2(A("s5:membacakan"), A("s5:catatannya") + 0.6, 2); add2(A("s5:segera") - 0.05, A("s5:penundaan") + 0.6, 6); FL.sort((a, b) => a - b); }

  // ====================================================================================================
  // FLAT: living room with the TV, x = 2000
  // ====================================================================================================
  const FX = 2000;
  const FLAT = new THREE.Group(); FLAT.position.set(FX, 0, 0); scene.add(FLAT);
  const wallpT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#3d3b37"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 3; for (let x = 0; x < w; x += 32) { g.beginPath(); for (let y = 0; y <= h; y += 8) g.lineTo(x + Math.sin(y * 0.08) * 6, y); g.stroke(); } noise(g, w, h, 3, 15000, "255,255,255", "0,0,0", 0.05); }, [6, 2]);
  const fwall = add(new THREE.PlaneGeometry(14, 5), std(0xffffff, 0.9, 0, { map: wallpT }), 0, 2.5, -2.5, FLAT, false);
  const ffl = add(new THREE.PlaneGeometry(14, 12), std(0xffffff, 0.6, 0, { map: floorT }), 0, 0, 2, FLAT, false); ffl.rotation.x = -Math.PI / 2;
  const rugT = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#4a1c22"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7a5a3a"; g.lineWidth = 8; g.strokeRect(20, 20, w - 40, h - 40); noise(g, w, h, 8, 20000, "255,220,200", "0,0,0", 0.12); });
  const rug = add(new THREE.PlaneGeometry(3.4, 2.2), std(0xffffff, 0.95, 0, { map: rugT }), 0, 0.01, 0.6, FLAT, false); rug.rotation.x = -Math.PI / 2;
  // cabinet + CRT
  B(1.6, 0.6, 0.55, std(0xffffff, 0.4, 0, { map: woodT }), 0, 0.3, -1.9, FLAT);
  const tvG = new THREE.Group(); tvG.position.set(0, 0.6, -1.85); FLAT.add(tvG);
  const tvBody = std(0x2a2520, 0.35, 0.1);
  B(0.9, 0.68, 0.6, tvBody, 0, 0.34, -0.05, tvG); B(0.6, 0.5, 0.3, tvBody, 0, 0.32, -0.4, tvG);
  const tvScreenT = tex(640, 480, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.65); gr.addColorStop(0, "#c9d6e6"); gr.addColorStop(1, "#4d5f78"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1a2433"; g.beginPath(); g.ellipse(w * 0.5, h * 0.36, 44, 54, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * 0.28, h * 0.78); g.quadraticCurveTo(w * 0.5, h * 0.42, w * 0.72, h * 0.78); g.fill();
    g.fillStyle = "#e9edf2"; g.fillRect(0, h * 0.74, w, h * 0.2); g.fillStyle = "#111"; g.font = `700 38px ${CM}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("JERMAN TIMUR MEMBUKA", w / 2, h * 0.795); g.fillText("PERBATASAN", w / 2, h * 0.885);
    g.fillStyle = "#fff"; g.font = `700 52px ${CM}`; g.textAlign = "left"; g.fillText("20.00", 26, 50);
    g.fillStyle = "rgba(0,0,0,.18)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2);
  });
  const tvScreen = add(new THREE.PlaneGeometry(0.66, 0.5), new THREE.MeshBasicMaterial({ map: tvScreenT, toneMapped: false, color: 0xd8dde6 }), -0.06, 0.36, 0.255, tvG, false);
  B(0.12, 0.5, 0.02, std(0x777066, 0.4, 0.4), 0.37, 0.36, 0.25, tvG);
  for (const k of [0, 1]) C(0.018, 0.018, 0.03, 10, chrome, 0.37, 0.48 - k * 0.1, 0.27, tvG).rotation.x = Math.PI / 2;
  const tvL = new THREE.PointLight(0xa9c4ea, 9, 8, 1.4); tvL.position.set(FX, 1.0, -1.1); scene.add(tvL);
  const tvSpot = new THREE.SpotLight(0xb5cdee, 40, 9, 0.9, 0.6, 1.4); tvSpot.position.set(FX, 1.0, -1.3); tvSpot.target.position.set(FX, 0.8, 3); tvSpot.castShadow = true; tvSpot.shadow.mapSize.set(1024, 1024); tvSpot.shadow.bias = -0.0005; scene.add(tvSpot, tvSpot.target);
  const winF = new THREE.SpotLight(0xa3bfdb, 120, 16, 0.35, 0.3, 1.4); winF.map = blindT; winF.castShadow = true; winF.shadow.mapSize.set(1024, 1024); winF.position.set(FX + 5, 3.5, 3); winF.target.position.set(FX - 1.5, 1.6, -2.5); scene.add(winF, winF.target);
  const hemiF = new THREE.HemisphereLight(0x3a4458, 0x0b0a09, 0.25); scene.add(hemiF);
  const flatLights = [tvL, tvSpot, winF, hemiF];
  // sofa + two watchers seen from behind, a lamp and a clock on the wall reading 20.00
  const sofaM = std(0x2b2622, 0.95);
  B(2.4, 0.45, 0.9, sofaM, 0, 0.3, 1.9, FLAT); B(2.4, 0.6, 0.2, sofaM, 0, 0.75, 2.3, FLAT); for (const s of [-1, 1]) B(0.2, 0.6, 0.9, sofaM, s * 1.2, 0.5, 1.9, FLAT);
  blob(2.8, 1.4, 0, 0, 1.9, 0.6, FLAT);
  const watchers = [-0.5, 0.55].map((x, i) => { const P = person(160 + i, { hat: false, seated: true, scarf: i === 1 }); P.G.position.set(x, 0.52 + 0.4, 1.85); P.G.rotation.y = Math.PI; FLAT.add(P.G); return P; });
  const fclock = new THREE.Group(); fclock.position.set(1.6, 2.4, -2.46); FLAT.add(fclock);
  C(0.28, 0.28, 0.05, 32, steel, 0, 0, 0, fclock).rotation.x = Math.PI / 2;
  add(new THREE.CircleGeometry(0.25, 40), std(0xffffff, 0.5, 0, { map: faceT }), 0, 0, 0.03, fclock, false);
  const fh = B(0.025, 0.13, 0.005, std(0x111111), 0, 0.055, 0.035, fclock, false), fm = B(0.016, 0.2, 0.005, std(0x111111), 0, 0.09, 0.04, fclock, false);
  fh.geometry.translate(0, 0, 0); fh.position.set(0, 0, 0.035); fh.geometry = new THREE.BoxGeometry(0.025, 0.13, 0.005).translate(0, 0.055, 0); fh.rotation.z = -(8 / 12) * Math.PI * 2;
  fm.position.set(0, 0, 0.04); fm.geometry = new THREE.BoxGeometry(0.016, 0.2, 0.005).translate(0, 0.09, 0);

  // dust/smoke motes in the beams
  const motes = pts(scene, 260, { color: 0xe9e2cc, size: 0.05, add: true, opacity: 0.5 });
  const mq = mulberry(4), mSeed = Array.from({ length: 260 }, () => [mq() - 0.5, mq(), mq() - 0.5, mq() * 6, 0.2 + mq() * 0.5]);

  // ---------- timing and camera ----------
  const c3 = A("s3:November"), c6 = A("s6:Berita"), c6b = A("s6:Warga"), open = A("s7:membuka"), s8 = K.s8;
  const D2R = Math.PI / 180;
  // orbit-style key: target, distance, pitch (deg), yaw (rad, 0 = looking toward -z from +z side)
  const cv = (tx, ty, tz, d, pd, yaw) => { const p = pd * D2R; return [tx + d * Math.cos(p) * Math.sin(yaw), ty + d * Math.sin(p), tz + d * Math.cos(p) * Math.cos(yaw), tx, ty, tz]; };
  const PI = Math.PI;
  const segs = [
    [-1, c3, track([ // EXT hook + wall (looking west from the east side, yaw ~ PI)
      [0, ...cv(-5, 5.4, -27, 32, 4, PI + 0.1)],
      [A("s1:konferensi"), ...cv(-3.5, 4.8, -28, 25, 4, PI + 0.06)],
      [A("s2:1961") + 0.6, ...cv(-6, 4.2, -26, 22, 6, PI + 0.02)],
      [A("s2:empat") - 0.6, ...cv(-39.8, 3.4, -1, 22, 6, PI + 0.02)],
      [A("s2:Berlin") + 0.2, ...cv(-40.0, 3.4, -1, 20, 7, PI - 0.06)],
      [A("s2:Panjangnya"), ...cv(-45, 3, -4, 24, 10, PI - 1.05)],
      [A("s2:dijaga"), ...cv(-60, 5, -12, 34, 9, PI - 1.2)],
      [c3, ...cv(-70, 6.5, -14, 40, 7, PI - 1.28)],
    ])],
    [c3, c6, track([ // ROOM (yaw 0 = camera on +z looking at the panel)
      [c3, ...cv(RX + DX + 0.12, 0.82, DZ + 0.05, 1.9, 62, -0.25)],
      [A("s3:Warga"), ...cv(RX + DX + 0.12, 0.82, DZ + 0.02, 1.45, 66, -0.12)],
      [A("s3:Aturan"), ...cv(RX + DX + 0.15, 0.82, DZ + 0.12, 1.2, 70, -0.04)],
      [A("s4:Sembilan") - 0.6, ...cv(RX + DX + 0.16, 0.82, DZ + 0.14, 1.12, 72, 0.02)],
      [A("s4:jam") + 0.9, ...cv(RX, 2.5, -4.2, 10.5, 10, -0.36)],
      [A("s4:Schabowski"), ...cv(RX, 1.55, -3.4, 7.5, 9, -0.12)],
      [A("s4:Ia"), ...cv(RX, 2.0, -3.4, 5.6, 5, 0.1)],
      [A("s4:catatan") - 0.2, ...cv(RX - 0.7, 1.12, -2.85, 1.6, 50, 0.25)],
      [A("s5:Jam") - 0.15, ...cv(RX - 0.7, 1.12, -2.85, 1.45, 52, 0.2)],
      [A("s5:Jam") + 0.25, ...cv(RX, 4.6, -5.9, 3.0, -2, 0.0)],
      [A("s5:kurang") - 0.1, ...cv(RX, 4.55, -5.9, 2.8, -3, 0.03)],
      [A("s5:aturan"), ...cv(RX - 0.5, 1.6, -2.6, 8.0, 10, -0.32)],
      [A("s5:Schabowski"), ...cv(RX - 0.45, 1.5, -2.8, 7.2, 9, -0.28)],
      [A("s5:catatannya") + 0.6, ...cv(RX - 0.55, 1.3, -3.0, 3.8, 27, 0.14)],
      [A("s5:ragu"), ...cv(RX - 0.5, 1.32, -3.05, 3.5, 25, 0.08)],
      [A("s5:segera") - 0.2, ...cv(RX, 1.45, -3.0, 4.0, 6, 0.0)],
      [c6, ...cv(RX, 1.5, -3.0, 5.0, 5, 0.04)],
    ])],
    [c6, c6b, track([ // FLAT
      [c6, ...cv(FX, 1.0, -1.5, 5.4, 10, 0.18)],
      [A("s6:Jam") + 0.4, ...cv(FX, 0.98, -1.6, 4.4, 8, 0.08)],
      [A("s6:ditonton"), ...cv(FX - 0.05, 0.98, -1.6, 2.3, 5, 0.0)],
      [c6b, ...cv(FX - 0.06, 0.98, -1.6, 1.45, 4, -0.03)],
    ])],
    [c6b, 1e9, track([ // EXT again: crowd, gate, payoff
      [c6b, ...cv(0, 1.6, -44, 30, 16, PI + 0.62)],
      [A("s6:perbatasan") + 0.6, ...cv(0, 1.8, -42, 29, 15, PI + 0.5)],
      [A("s7:tembakan"), ...cv(0, 1.6, -38, 28, 15, PI + 0.4)],
      [A("s7:Bornholmer"), ...cv(0, 1.8, -37, 22, 10, PI + 0.26)],
      [open - 0.2, ...cv(0, 2.0, -32, 20, 8, PI + 0.1)],
      [A("s8:Sejarawan") + 0.2, ...cv(0.5, 1.6, -36, 15, 12, PI + 0.18)],
      [A("s8:kecelakaan") + 0.3, ...cv(2.2, 0.15, -44.3, 3.5, 40, PI + 0.22)],
      [A("s8:Tembok") + 0.3, ...cv(2.2, 0.2, -44.2, 3.2, 36, PI + 0.16)],
      [A("s8:delapan") + 0.4, ...cv(0, 2.2, -34, 20, 12, PI + 0.08)],
      [A("s8:segera") + 0.4, ...cv(0, 3, -24, 56, 24, PI - 0.1)],
      [K.end, ...cv(0, 3, -20, 82, 28, PI - 0.22)],
      [K.dur, ...cv(0, 3, -20, 86, 29, PI - 0.24)],
    ])],
  ];
  const tgt = new THREE.Vector3();
  const hour = (h, m) => { handH.rotation.z = -((h % 12) + m / 60) / 12 * PI * 2; handM.rotation.z = -m / 60 * PI * 2; };

  return (t) => {
    if (!labels.done && document.fonts && document.fonts.check(`700 40px "Playfair Display"`) && document.fonts.check(`700 40px "Courier Prime"`)) {
      labels.done = true;
      for (const [tx, paint] of labels) { const c = tx.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); paint(g, c.width, c.height); tx.needsUpdate = true; }
    }
    const seg = segs.find((s) => t >= s[0] && t < s[1]) || segs[segs.length - 1];
    const c = seg[2](t);
    const shake = 0.02;
    cam.position.set(c[0] + Math.sin(t * 0.37) * shake * 3, c[1] + Math.sin(t * 0.29) * shake * 2, c[2] + Math.cos(t * 0.31) * shake * 3);
    tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt);
    // dutch tilt, gentle
    cam.rotateZ(Math.sin(t * 0.13) * 0.025 + 0.03);
    const where = cam.position.x > 1500 ? 2 : cam.position.x > 500 ? 1 : 0;
    EXT.visible = where === 0; ROOM.visible = where === 1; FLAT.visible = where === 2;
    for (const L of [blinds, keyR, deskL, rimR, hemiR, flash]) L.visible = where === 1;
    for (const L of flatLights) L.visible = where === 2;
    scene.fog.density = where === 0 ? 0.016 : where === 1 ? 0.035 : 0.03;
    const late = t >= c6b;

    if (where === 0) {
      // searchlights sweep; after the gate opens they stop and hang still
      const frz = late ? smooth(clamp01((t - open) / 2)) : 0;
      for (const S of sweeps) {
        const tt = t;
        const yaw = Math.PI + (S.i % 2 ? 1 : -1) * (0.15 + 0.55 * Math.sin(tt * (0.32 + S.i * 0.05) + S.i * 1.7)) * (1 - frz * 0.6);
        const pitch = -0.36 - 0.08 * Math.sin(tt * 0.5 + S.i);
        const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
        S.b.lookAt(S.o.clone().add(dir));
        S.sp.target.position.copy(S.o).addScaledVector(dir, 30); S.sp.target.updateMatrixWorld();
        S.sp.intensity = 900;
        towers[S.i].sl.lookAt(S.o.clone().add(dir));
      }
      // towers switch their cabins on one after another on "dijaga ... menara"
      towers.forEach((tw, i) => { const on = smooth(clamp01((t - A("s2:dijaga") - i * 0.18) / 0.3)); const m = tw.T.children[3].material; const o2 = 0.45 + 0.55 * on; m.color.setRGB(0.77 * o2, 0.68 * o2, 0.46 * o2); });
      // 4 m measure grows on "empat"
      const um = smooth(clamp01((t - A("s2:empat") + 0.2) / 0.7)) * (late ? 0 : 1);
      meas.scale.set(1, Math.max(0.001, um), 1); measL.material.opacity = um; meas.visible = um > 0.01;
      // gate and boom
      const ug = smooth(clamp01((t - open + 0.15) / 2.6)) * (late ? 1 : 0);
      leaves[0].rotation.y = ug * 1.45; leaves[1].rotation.y = -ug * 1.45;
      const ub = smooth(clamp01((t - open + 0.9) / 1.4)) * (late ? 1 : 0);
      boom.parent.rotation.z = ub * 1.35;
      gateLamp.intensity = 420 * ug;
      guards.forEach((P, i) => { P.G.position.x = (i ? 4.1 : -3.2) + (i ? 1 : -1) * 3.5 * ug; P.G.rotation.y = Math.PI + (i ? -0.6 : 0.6) * ug; });
      groundSlip.visible = late;
      // crowd
      const g0 = c6b - 3.5, g1 = A("s7:Sekitar");
      for (const P of crowd) {
        P.G.visible = late; P.bl.visible = late;
        if (!late) continue;
        const ta = g0 + P.arrive * (g1 - g0);
        let x, z, v = 0, yaw = 0;
        const walkIn = clamp01((t - (ta - 9)) / 9);
        if (t < ta) { const u = walkIn; x = P.sx + (P.gx - P.sx) * u; z = P.sz + (P.gz - P.sz) * u; v = u < 1 ? 1 : 0; yaw = Math.atan2(P.gx - P.sx, P.gz - P.sz); }
        else { x = P.gx + Math.sin(t * 0.7 + P.ph) * 0.06; z = P.gz + 0.1 * Math.sin(t * 0.5 + P.ph); yaw = Math.atan2(-P.gx * 0.3, 1); }
        const tg = open + 0.5 + P.rank * 5.5;
        if (t > tg) {
          const dist = (t - tg) * 1.7;
          const p1 = [Math.max(-5, Math.min(5, P.lane)), -30], d1 = Math.hypot(p1[0] - P.gx, p1[1] - P.gz);
          if (dist < d1) { const u = dist / d1; x = P.gx + (p1[0] - P.gx) * u; z = P.gz + (p1[1] - P.gz) * u; yaw = Math.atan2(p1[0] - P.gx, p1[1] - P.gz); }
          else { x = p1[0]; z = p1[1] + (dist - d1); yaw = 0; }
          v = 1;
        }
        P.G.position.set(x, 0, z); P.G.rotation.y = yaw; walk(P, t, v); P.bl.position.set(x, 0.01, z);
        P.G.visible = z > -120;
      }
      for (const f of fogs) { f.position.x = f.userData.x0 + Math.sin(t * 0.05 * f.userData.v + f.userData.x0) * 12 + t * f.userData.v; f.lookAt(cam.position.x, f.position.y, cam.position.z); }
    }
    if (where === 1) {
      // stamp comes down on "keesokan"
      const th = A("s3:keesokan");
      const go = smooth(clamp01((t - th + 0.8) / 0.5)), ret = smooth(clamp01((t - th - 0.35) / 0.6));
      const target = new THREE.Vector3(0.16, 0.81, 0.17);
      const ov = new THREE.Vector3().lerpVectors(STAMP_REST, target, go * (1 - ret));
      const drop = t < th ? 1 - clamp01((t - th + 0.2) / 0.2) : clamp01((t - th - 0.1) / 0.25);
      stamp.position.set(ov.x, ov.y + go * (1 - ret) * (0.003 + 0.14 * drop), ov.z);
      imp.material.opacity = t >= th ? 0.95 : 0;
      // clock: 18.00 creeping, spins to 18.53 on "Jam" (s5)
      const tj = A("s5:Jam");
      const m = t < tj ? Math.min(2, (t - A("s4:jam")) / 8) : 2 + 51 * smooth(clamp01((t - tj) / 1.1)) + Math.max(0, (t - tj - 1.1) / 20);
      hour(18, Math.max(0, m));
      // slip of paper slides to the spokesman on "secarik"
      const us = eout(clamp01((t - A("s4:secarik") + 0.3) / 0.8));
      slipG.position.set(-0.7 - (1 - us) * 1.4, 1.112, -2.85 + (1 - us) * 0.15);
      slipG.rotation.y = 0.5 * (1 - us) - 0.08;
      slipG.visible = t > A("s4:secarik") - 0.3;
      // spokesman: leans over the paper while reading, head turns on the question
      const read = smooth(clamp01((t - A("s5:Schabowski") + 0.3) / 0.6)) * (1 - smooth(clamp01((t - A("s5:menjawab")) / 0.6)));
      spk.body.rotation.x = 0.28 * read + Math.sin(t * 1.3) * 0.01;
      spk.aR.p.rotation.x = -0.5 - 0.4 * read;
      // reporter stands up on "wartawan" and sits on "Schabowski"
      const st = smooth(clamp01((t - A("s5:wartawan") + 0.4) / 0.6)) * (1 - smooth(clamp01((t - A("s5:catatannya")) / 0.6)));
      reporter.body.position.y = -0.4 + 0.42 * st; reporter.legL.rotation.x = reporter.legR.rotation.x = -1.45 * (1 - st); reporter.aR.p.rotation.x = -0.5 - 1.6 * st;
      // the answer: SEGERA rises from the paper
      const sg = A("s5:segera"), us2 = back(clamp01((t - sg + 0.05) / 0.5), 1.4);
      segW.material.opacity = clamp01((t - sg + 0.05) / 0.25);
      segW.position.set(0, 1.2 + 0.28 * us2, -2.6); segW.scale.setScalar(0.6 + 0.4 * us2);
      segW.lookAt(cam.position);
      // camera flashes and tally blink
      let f = 0; for (const tf of FL) { const d = t - tf; if (d >= 0 && d < 0.25) f = Math.max(f, Math.exp(-d * 18)); }
      flash.intensity = 120 * f;
      tally.visible = Math.floor(t * 1.5) % 2 === 0;
      for (const P of press) if (P !== reporter) P.body.rotation.x = Math.sin(t * 0.6 + P.ph) * 0.02;
    }
    if (where === 2) {
      const fl = 0.85 + 0.15 * Math.sin(t * 23.0) * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 61);
      tvL.intensity = 9 * fl; tvSpot.intensity = 40 * fl; tvScreen.material.color.setScalar(0.82 + 0.12 * fl);
      watchers[1].body.rotation.z = smooth(clamp01((t - A("s6:ditonton")) / 0.8)) * 0.12;
    }
    // motes near the camera target
    const d = motes.pos;
    for (let i = 0; i < 260; i++) { const q = mSeed[i], R = where === 0 ? 30 : 3.5, H = where === 0 ? 10 : 3; d[i * 3] = tgt.x + q[0] * R + Math.sin(t * q[4] + q[3]) * 0.2 * R / 4; d[i * 3 + 1] = 0.2 + ((q[1] * H + t * q[4] * 0.06 * H) % H); d[i * 3 + 2] = tgt.z + q[2] * R + Math.cos(t * q[4] + q[3]) * 0.2 * R / 4; }
    motes.m.size = where === 0 ? 0.12 : 0.02;
    motes.commit();
    comp.render();
  };
}
