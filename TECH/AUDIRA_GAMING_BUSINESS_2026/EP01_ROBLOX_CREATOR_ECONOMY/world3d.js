// STUD ECONOMY: one long studded baseplate the camera travels along, left to right. Every prop is a pure function of film time.
// The avatar is a generic blocky R6-style figure built here; no game assets are used. Tower heights follow the Roblox visit counts read on 2026-11-04.
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, box, cyl, std } from "./lib3d.js";

const faceTex = () => canvasTex(128, 128, (g) => {
  g.fillStyle = "#F5CD30"; g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#111"; g.beginPath(); g.ellipse(42, 48, 9, 13, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(86, 48, 9, 13, 0, 0, 7); g.fill();
  g.strokeStyle = "#111"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.arc(64, 62, 32, 0.3, Math.PI - 0.3); g.stroke();
});

function avatar(shirt = 0x0d69ac, pants = 0xa4bd47, skin = 0xf5cd30, ft) {
  const g = new THREE.Group();
  const Y = std(skin, 0.5), B = std(shirt, 0.5), G = std(pants, 0.5);
  const limb = (mat, px, py) => { const p = new THREE.Group(); p.position.set(px, py, 0); box(1, 2, 1, mat, 0, -1, 0, p); g.add(p); return p; };
  box(2, 2, 1, B, 0, 3, 0, g);
  cyl(0.62, 0.62, 1.2, 24, Y, 0, 4.65, 0, g);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), std(0xffffff, 0.5, 0, { map: ft }));
  f.position.set(0, 4.65, 0.63);
  g.add(f);
  return { g, armL: limb(Y, -1.5, 4), armR: limb(Y, 1.5, 4), legL: limb(G, -0.5, 2), legR: limb(G, 0.5, 2) };
}
function walk(a, t, amt = 1, sp = 9) {
  const s = Math.sin(t * sp) * 0.75 * amt;
  a.armL.rotation.x = s; a.armR.rotation.x = -s; a.legL.rotation.x = -s; a.legR.rotation.x = s;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.NoToneMapping;
  const scene = new THREE.Scene();
  const SKY0 = new THREE.Color("#3FB4FF"), SKY1 = new THREE.Color("#3A4178"), SKY2 = new THREE.Color("#FFC68C");
  scene.background = SKY0.clone();
  scene.fog = new THREE.Fog(0x9fdcff, 170, 520);
  const cam = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.5, 900);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8fcf7a, 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d8, 2.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 260 });
  scene.add(sun, sun.target);

  const rnd = mulberry(1440);
  const ft = faceTex();
  // baseplate with moulded studs
  const studTex = canvasTex(128, 128, (g) => {
    g.fillStyle = "#4CAF3F"; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(0,0,0,.14)"; g.beginPath(); g.arc(68, 70, 40, 0, 7); g.fill();
    g.fillStyle = "#62C653"; g.beginPath(); g.arc(64, 64, 38, 0, 7); g.fill();
    g.strokeStyle = "rgba(0,0,0,.1)"; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128);
  }, [260, 80]);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1040, 320), std(0xffffff, 0.75, 0, { map: studTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(300, 0, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  const RED = std(0xe5322d, 0.45), YEL = std(0xf7c531, 0.4), BLU = std(0x1f7fe0, 0.45), WHT = std(0xf3f5f7, 0.5), GRN = std(0x2fae4f, 0.5), GRY = std(0x8b95a1, 0.6), DRK = std(0x2a2f3a, 0.6), ORG = std(0xff8a1f, 0.45), PUR = std(0x8e4bea, 0.45);
  const GOLD = std(0xffc72e, 0.28, 0.55);

  // scenery clouds
  const cloud = std(0xffffff, 0.95);
  for (let i = 0; i < 36; i++) {
    const g = new THREE.Group();
    const x = -60 + i * 22 + rnd() * 16, y = 46 + rnd() * 44, z = -70 - rnd() * 60;
    for (let j = 0; j < 4; j++) box(10 + rnd() * 12, 4 + rnd() * 4, 8, cloud, (j - 1.5) * 8, rnd() * 3, rnd() * 3, g);
    g.position.set(x, y, z);
    g.traverse((o) => { o.castShadow = false; });
    scene.add(g);
  }

  // ---- A: garden, x 0 ----
  const X = { a: 0, b: 62, c: 124, d: 186, e: 248, f: 318, g: 392, h: 450 };
  const garden = new THREE.Group();
  scene.add(garden);
  const soil = std(0x7a4c2a, 0.9), leaf = std(0x2f9e44, 0.6);
  const fruitM = [RED, ORG, YEL, PUR];
  const crops = [];
  for (let row = 0; row < 4; row++) {
    box(30, 0.8, 3.4, soil, 0, 0.4, 5 - row * 6.4, garden);
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Group();
      c.position.set(-13 + i * 3.25, 0.8, 5 - row * 6.4);
      cyl(0.2, 0.25, 2, 6, leaf, 0, 1, 0, c);
      box(1.8, 1, 1.8, leaf, 0, 2.2, 0, c);
      box(1, 0.8, 1, leaf, 0, 3, 0, c);
      box(0.8, 0.8, 0.8, fruitM[(i + row) % 4], 0.5, 2.5, 0.8, c);
      garden.add(c);
      crops.push({ c, d: (i + row * 2) * 0.09 });
    }
  }
  const hero = avatar(0x0d69ac, 0xa4bd47, 0xf5cd30, ft);
  hero.g.scale.setScalar(1);
  scene.add(hero.g);

  // crowd drops in as the CCU counter climbs: illustrative, one figure is not one player
  const CROWD = 520;
  const crowdTorso = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 1.5, 0.7), std(0xffffff, 0.55), CROWD);
  const crowdHead = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.42, 0.8, 12), std(0xf5cd30, 0.5), CROWD);
  const crowdLeg = new THREE.InstancedMesh(new THREE.BoxGeometry(1.15, 1.25, 0.65), std(0xffffff, 0.55), CROWD);
  crowdTorso.castShadow = crowdHead.castShadow = crowdLeg.castShadow = true;
  const cc = new THREE.Color();
  const shirts = [0x1f7fe0, 0xe5322d, 0x2fae4f, 0xff8a1f, 0x8e4bea, 0xff4f9a, 0x24c6c6];
  const cd = [];
  for (let i = 0; i < CROWD; i++) {
    const ang = rnd() * Math.PI * 2, rad = 19 + rnd() * rnd() * 70;
    const x = Math.cos(ang) * rad, z = Math.sin(ang) * rad * 0.8 - 6;
    cd.push({ x, z, d: rnd(), ph: rnd() * 6, ry: rnd() * 6 });
    crowdTorso.setColorAt(i, cc.set(shirts[i % shirts.length]));
    crowdLeg.setColorAt(i, cc.set(shirts[(i * 3 + 2) % shirts.length]).multiplyScalar(0.7));
  }
  scene.add(crowdTorso, crowdHead, crowdLeg);

  // ---- coin: gold hex, generic currency token ----
  const coinGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 6);
  coinGeo.rotateX(Math.PI / 2);

  // ---- B: stall with conveyor: of each 10 coins, 7 reach the creator, 3 the platform ----
  const stall = new THREE.Group();
  stall.position.set(X.b, 0, 0);
  scene.add(stall);
  box(12, 5, 5, WHT, -10, 2.5, -2, stall);
  box(13, 1, 6.4, RED, -10, 6.6, -2, stall);
  for (let i = 0; i < 6; i++) box(2.1, 0.7, 6.4, i % 2 ? WHT : RED, -15.3 + i * 2.15, 5.8, -2, stall);
  const gp = box(3.4, 4.2, 0.4, BLU, -12.6, 8.7, -2, stall), dp = box(3.4, 4.2, 0.4, ORG, -7.6, 8.7, -2, stall);
  box(1.6, 2.2, 0.5, WHT, -12.6, 8.7, -2, stall); box(1.4, 1.4, 0.5, YEL, -7.6, 8.7, -2, stall);
  box(26, 0.8, 4, DRK, 6, 1.4, 3, stall);
  for (let i = 0; i < 13; i++) cyl(0.4, 0.4, 4, 10, GRY, -6 + i * 2, 1.4, 3, stall).rotation.x = Math.PI / 2;
  const chest = new THREE.Group();
  chest.position.set(20, 0, 3); stall.add(chest);
  box(6, 3.6, 5, std(0x8a5a2b, 0.7), 0, 1.8, 0, chest);
  box(6.3, 0.8, 5.3, YEL, 0, 3.8, 0, chest);
  const platBox = box(5, 8, 5, GRY, 6, 4, -6, stall);
  const creator = avatar(0xe5322d, 0x2a2f3a, 0xf5cd30, ft);
  creator.g.position.set(25, 0, 3); creator.g.rotation.y = -1.4;
  stall.add(creator.g);
  const NC = 20;
  const coins = new THREE.InstancedMesh(coinGeo, GOLD, NC);
  coins.castShadow = true;
  scene.add(coins);
  const pile = new THREE.InstancedMesh(coinGeo, GOLD, 60);
  pile.castShadow = true;
  scene.add(pile);

  // ---- C: DevEx gate: a mountain of coins goes in, one small bill comes out ----
  const gate = new THREE.Group();
  gate.position.set(X.c, 0, 0);
  scene.add(gate);
  box(4, 24, 6, BLU, -8.5, 12, -2, gate); box(4, 24, 6, BLU, 8.5, 12, -2, gate); box(22, 5, 7, YEL, 0, 25, -2, gate);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(13, 22), new THREE.MeshBasicMaterial({ color: 0x7ef0ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  beam.position.set(0, 11, -2);
  gate.add(beam);
  const mount = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 1.2, 2.2), GOLD, 620);
  mount.castShadow = true;
  scene.add(mount);
  const mpos = [];
  { let i = 0; for (let lv = 0; lv < 12 && i < 620; lv++) { const n = 12 - lv; for (let a = 0; a < n && i < 620; a++) for (let b = 0; b < n && i < 620; b++) { mpos.push([X.c - 34 + (a - n / 2) * 2.25, 0.6 + lv * 1.2, (b - n / 2) * 2.25]); i++; } } }
  const pusher = avatar(0x2fae4f, 0x1f7fe0, 0xf5cd30, ft);
  pusher.g.rotation.y = Math.PI / 2;
  scene.add(pusher.g);
  const bill = box(5, 0.25, 2.6, std(0x46c46b, 0.6), 0, 0, 0, scene);
  const billMark = box(1.2, 0.3, 1.2, WHT, 0, 0.02, 0, bill);

  // ---- D: three towers scaled to visits ----
  const towers = [[74.3, RED, -15], [36.0, BLU, 0], [5.1, GRN, 13]].map(([v, m, dx]) => {
    const g = new THREE.Group();
    g.position.set(X.d + dx, 0, -3);
    const mesh = box(10, 1, 10, m, 0, 0.5, 0, g);
    const top = box(11, 1.4, 11, YEL, 0, 1, 0, g);
    scene.add(g);
    return { mesh, top, h: v * 0.95 };
  });
  const dropper = avatar(0x0d69ac, 0xa4bd47, 0xf5cd30, ft);
  scene.add(dropper.g);

  // ---- E: split deed: 50 / 50 slab, the question block hides revenue ----
  const split = new THREE.Group();
  split.position.set(X.e, 0, 0);
  scene.add(split);
  const slabL = box(13, 1.6, 15, GRN, -7, 0.8, 0, split), slabR = box(13, 1.6, 15, std(0x2a2f3a, 0.5), 7, 0.8, 0, split);
  const dev = avatar(0x0d69ac, 0xa4bd47, 0xf5cd30, ft);
  dev.g.position.set(-7, 1.6, 1.5); dev.g.rotation.y = 0.4; dev.g.scale.setScalar(1.25);
  split.add(dev.g);
  const suit = avatar(0x1b1f2a, 0x1b1f2a, 0xd9dde3, ft);
  suit.g.position.set(7, 1.6, 1.5); suit.g.rotation.y = -0.4; suit.g.scale.setScalar(1.25);
  split.add(suit.g);
  const qTex = canvasTex(256, 256, (g) => { g.fillStyle = "#F7C531"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#B8860B"; g.lineWidth = 16; g.strokeRect(8, 8, 240, 240); g.fillStyle = "#fff"; g.font = "900 190px Archivo Black, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", 128, 136); });
  const qb = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 9), std(0xffffff, 0.35, 0, { map: qTex }));
  qb.position.set(0, 17, -2); qb.castShadow = true;
  split.add(qb);

  // ---- F: pyramid: broad base, one gold figure on top ----
  const pyr = new THREE.Group();
  pyr.position.set(X.f, 0, -8);
  scene.add(pyr);
  const stepM = [std(0x5f6b7a, 0.7), std(0x7a8798, 0.7), std(0x94a3b8, 0.6), std(0xb9c6d6, 0.6), GOLD];
  const PY = [[60, 9], [44, 9], [30, 9], [16, 9], [6, 5]];
  let py = 0;
  const steps = PY.map(([w, h], i) => { const m = box(w, h, w * 0.7, stepM[i], 0, py + h / 2, 0, pyr); py += h; return { m, y: py }; });
  const topA = avatar(0xffc72e, 0xffc72e, 0xffc72e, ft);
  topA.g.position.set(0, py, 0); topA.g.rotation.y = 0.2; pyr.add(topA.g);
  const pcrowd = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 2.8, 0.7), std(0xffffff, 0.6), 240);
  pcrowd.castShadow = true;
  { const m = new THREE.Matrix4(); for (let i = 0; i < 240; i++) { m.makeTranslation((i % 40 - 20) * 1.95 + rnd() * 0.5, 1.4, 22 + Math.floor(i / 40) * 2.8 + rnd() * 0.4); pcrowd.setMatrixAt(i, m); pcrowd.setColorAt(i, cc.set(shirts[i % shirts.length]).multiplyScalar(0.85)); } }
  pyr.add(pcrowd);
  const pheads = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.42, 0.8, 10), std(0xf5cd30, 0.5), 240);
  { const m = new THREE.Matrix4(), v = new THREE.Vector3(); for (let i = 0; i < 240; i++) { pcrowd.getMatrixAt(i, m); v.setFromMatrixPosition(m); m.makeTranslation(v.x, 3.2, v.z); pheads.setMatrixAt(i, m); } }
  pyr.add(pheads);

  // ---- G: brick chart that tumbles, the figures walk off ----
  const BN = 90;
  const bricks = new THREE.InstancedMesh(new THREE.BoxGeometry(3.6, 1.7, 3), std(0xffffff, 0.5), BN);
  bricks.castShadow = true;
  scene.add(bricks);
  const bd = [];
  for (let i = 0; i < BN; i++) {
    const col = i % 9, lvl = Math.floor(i / 9);
    bd.push({ x: X.g - 16 + col * 4, y: 0.85 + lvl * 1.75, vx: (rnd() - 0.5) * 16, vz: 6 + rnd() * 8, sp: rnd() * 4, d: 0.05 * (9 - lvl) + rnd() * 0.3, fall: col > 3 && lvl > col * -1 + 8 });
    bricks.setColorAt(i, cc.set(i % 7 === 0 ? 0xf7c531 : col < 4 ? 0x2fae4f : 0xe5322d));
  }
  const leaver = [0, 1, 2].map((i) => { const a = avatar(shirts[i + 1], 0x2a2f3a, 0xf5cd30, ft); scene.add(a.g); return a; });

  // ---- H: crossroads signpost ----
  const sign = new THREE.Group();
  sign.position.set(X.h, 0, -3);
  scene.add(sign);
  cyl(0.5, 0.6, 15, 10, std(0x8a5a2b, 0.8), 0, 7.5, 0, sign);
  const armA = box(14, 3, 0.8, BLU, -7, 12, 0, sign), armB = box(14, 3, 0.8, ORG, 7, 8.5, 0, sign);
  const pathL = box(10, 0.1, 80, std(0xd6c49a, 0.9), -11, 0.06, -32, sign); pathL.rotation.y = 0.5;
  const pathR = box(10, 0.1, 80, std(0xd6c49a, 0.9), 11, 0.06, -32, sign); pathR.rotation.y = -0.5;
  box(10, 0.1, 30, std(0xd6c49a, 0.9), 0, 0.06, 15, sign);

  // ---- camera: single left-to-right travel; the only vertical move is the pyramid drop ----
  const path = track([
    [0, X.a - 1, 12, 44, X.a - 1, 11, 0],
    [K.s1 + 3.0, X.a + 1, 20, 70, X.a + 1, 15, 0],
    [K.s1e, X.a + 8, 30, 104, X.a + 8, 20, 0],
    [K.s2 + 0.9, X.b - 9, 12, 62, X.b - 9, 7, 0],
    [K.s2e - 2, X.b + 14, 12, 58, X.b + 14, 7, 0],
    [K.s3 + 1.2, X.c - 34, 15, 76, X.c - 34, 9, 0],
    [K.s3e - 1.2, X.c - 8, 17, 96, X.c - 2, 12, -2],
    [K.s4 + 1.4, X.d - 6, 26, 136, X.d - 2, 30, 0],
    [K.s4e - 0.8, X.d + 3, 34, 158, X.d + 2, 36, 0],
    [K.s5 + 1.2, X.e - 1, 12, 78, X.e, 10, 0],
    [K.s5e - 0.7, X.e + 1, 11, 68, X.e + 1, 9, 0],
    [K.s6 + 1.1, X.f + 1, 48, 62, X.f, 41, -8],
    [AT["s6:Tapi"] - 0.2, X.f - 2, 44, 76, X.f, 38, -8],
    [AT["s6:Tapi"] + 2.3, X.f + 1, 14, 66, X.f, 9, 8],
    [K.s6e, X.f + 8, 16, 78, X.f + 8, 10, 6],
    [K.s7 + 2.0, X.g - 1, 15, 96, X.g, 12, 0],
    [K.s7e, X.g + 1, 14, 92, X.g + 1, 11, 0],
    [K.s8 + 2.2, X.h - 1, 10, 80, X.h - 1, 9, 0],
    [K.end, X.h, 9, 72, X.h, 9, -3],
    [K.dur, X.h, 9, 70, X.h, 9, -3],
  ]);

  const composer = new EffectComposer(r);
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.16, 0.6, 0.92));
  composer.addPass(new OutputPass());
  const m = new THREE.Matrix4(), qt = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
  const set = (im, i, x, y, z, s = 1, ry = 0, rx = 0, rz = 0) => { e.set(rx, ry, rz); qt.setFromEuler(e); sv.setScalar(s); pv.set(x, y, z); m.compose(pv, qt, sv); im.setMatrixAt(i, m); };
  const skyC = new THREE.Color();

  scene.traverse((o) => { if (o.isInstancedMesh) o.frustumCulled = false; });

  return function draw(t) {
    const [cx, cy, cz, lx, ly, lz] = path(t);
    cam.position.set(cx, cy, cz);
    cam.lookAt(lx, ly, lz);
    sun.position.set(cx - 40, 110, cz + 50);
    sun.target.position.set(cx, 0, 0);

    // sky falls toward dusk in the slump, then warms up for the decision
    const dusk = ramp(t, K.s7, K.s7 + 2.5) * (1 - ramp(t, K.s8, K.s8 + 3));
    const warm = ramp(t, K.s8, K.s8 + 3);
    skyC.copy(SKY0).lerp(SKY1, dusk).lerp(SKY2, warm * 0.6);
    scene.background.copy(skyC);
    scene.fog.color.copy(skyC);
    sun.intensity = 2.1 * (1 - 0.72 * dusk);
    hemi.intensity = 1.25 * (1 - 0.55 * dusk);

    // A
    const near = t < K.s2 + 3;
    garden.visible = near;
    for (const c of crops) { const s = 0.05 + 0.95 * back((t - c.d) / 0.5); c.c.scale.setScalar(Math.max(0.05, s)); }
    if (t < K.s2 + 1) {
      const u = clamp01((t - 0.1) / 3);
      hero.g.position.set(-2 + Math.sin(t * 0.7) * 2.5, 0.8, 8.5 - u * 1.5);
      hero.g.rotation.y = Math.sin(t * 0.7 + 1.2) * 0.6;
      walk(hero, t, 0.8);
    }
    hero.g.visible = t < K.s2 + 1;
    const fill = clamp01((t - AT["s1:Puncaknya"]) / 3.4);
    for (let i = 0; i < CROWD; i++) {
      const c = cd[i], on = clamp01((fill - c.d * 0.92) / 0.08);
      if (on <= 0 || !near) { set(crowdTorso, i, 0, -30, 0, 0.001); set(crowdHead, i, 0, -30, 0, 0.001); set(crowdLeg, i, 0, -30, 0, 0.001); continue; }
      const y = (1 - eout(on)) * 44 + Math.abs(Math.sin(t * 6 + c.ph)) * 0.35;
      set(crowdLeg, i, c.x, y + 0.62, c.z, 1, c.ry);
      set(crowdTorso, i, c.x, y + 2, c.z, 1, c.ry);
      set(crowdHead, i, c.x, y + 3.15, c.z, 1, c.ry);
    }
    crowdTorso.instanceMatrix.needsUpdate = crowdHead.instanceMatrix.needsUpdate = crowdLeg.instanceMatrix.needsUpdate = true;

    // B: coins roll on the belt; every 3rd of 10 hops up to the platform box
    const onB = t > K.s2 - 1 && t < K.s3 + 1.5;
    coins.visible = pile.visible = onB;
    if (onB) {
      for (let i = 0; i < NC; i++) {
        const u = ((t - K.s2) * 0.32 + i / NC) % 1;
        const live = t > AT["s2:Pemain"] + (i / NC) * 0.1;
        const toPlat = i % 10 === 2 || i % 10 === 5 || i % 10 === 8;
        let x = X.b - 8 + u * 28, y = 2.6, z = 3;
        if (toPlat && u > 0.48) { const v = (u - 0.48) / 0.52; x = X.b + 5.4 + v * 0.8; y = 2.6 + Math.sin(Math.min(v * 2.2, 1) * Math.PI * 0.5) * 6; z = 3 - Math.min(v * 2.2, 1) * 9; }
        set(coins, i, live ? x : 0, live ? y : -40, z, 1, 0, 0, t * 4 + i);
      }
      const got = clamp01((t - AT["s2:70"]) / 2.6);
      for (let i = 0; i < 60; i++) {
        const v = clamp01(got * 60 - i), lv = Math.floor(i / 12);
        set(pile, i, X.b + 17.5 + (i % 4) * 1.6, v > 0 ? 4.6 + lv * 0.4 : -40, 1.4 + (Math.floor(i / 4) % 3) * 1.6, 0.8, 0, Math.PI / 2);
      }
      coins.instanceMatrix.needsUpdate = pile.instanceMatrix.needsUpdate = true;
      walk(creator, t, 0.15, 4);
      creator.armR.rotation.x = -2.6 * ramp(t, AT["s2:70"], AT["s2:70"] + 0.3) + Math.sin(t * 8) * 0.25 * ramp(t, AT["s2:70"], AT["s2:70"] + 0.3);
      gp.rotation.y = Math.sin(t * 1.4) * 0.3;
      dp.rotation.y = Math.sin(t * 1.4 + 1) * 0.3;
    }

    // C: the mountain slides into the gate as the requirement lands, one bill emerges on "114"
    const pushA = AT["s3:30.000"], pushB = AT["s3:114"];
    const slide = ramp(t, pushA, pushB);
    const showC = t > K.s3 - 2 && t < K.s4 + 1.5;
    mount.visible = showC; pusher.g.visible = showC; bill.visible = showC;
    if (showC) {
      const sx = slide * 29;
      for (let i = 0; i < mpos.length; i++) {
        const p = mpos[i], x = p[0] + sx;
        const gone = x > X.c - 6;
        set(mount, i, gone ? 0 : x, gone ? -40 : p[1], p[2]);
      }
      mount.instanceMatrix.needsUpdate = true;
      pusher.g.position.set(X.c - 50 + sx, 0, 0);
      walk(pusher, t, ramp(t, pushA, pushA + 0.3) * (1 - ramp(t, pushB, pushB + 0.3)), 7);
      pusher.armL.rotation.x = -1.5; pusher.armR.rotation.x = -1.5;
      const bu = eout((t - pushB) / 0.9);
      bill.position.set(X.c + 6 + bu * 8, 5 - bu * 1 + Math.sin(t * 3) * 0.3, 0);
      bill.scale.setScalar(bu > 0 ? 1 : 0.001);
      bill.rotation.set(0.9, 0.2, Math.sin(t * 2.3) * 0.15);
      beam.material.opacity = 0.25 + 0.3 * (slide > 0 && slide < 1 ? 1 : 0);
    }

    // D: towers rise on their own names
    const tkeys = [AT["s4:Steal"], AT["s4:Grow"], AT["s4:Fisch"]];
    towers.forEach((o, i) => {
      const h = Math.max(1, o.h * eout((t - tkeys[i]) / 1.3));
      o.mesh.scale.y = h; o.mesh.position.y = h / 2; o.top.position.y = h + 0.7;
    });
    const dd = t > K.s4 - 1 && t < K.s5 + 1;
    dropper.g.visible = dd;
    if (dd) { dropper.g.position.set(X.d + 26, 0, 8); dropper.g.rotation.y = -0.8; dropper.armR.rotation.x = -2.8; dropper.armL.rotation.x = 0; dropper.legL.rotation.x = dropper.legR.rotation.x = 0; }

    // E: question block drops on "menolak", slab parts on "separuh"
    const qd = eout((t - AT["s5:menolak"]) / 0.45);
    qb.position.y = 62 - 48 * qd;
    qb.rotation.y = t * 0.8;
    const part = ramp(t, AT["s5:separuh"], AT["s5:separuh"] + 0.6) * 2.4;
    slabL.position.x = -7 - part; slabR.position.x = 7 + part;
    dev.g.position.x = -7 - part; suit.g.position.x = 7 + part;
    walk(dev, t, 0.08, 3); walk(suit, t, 0.08, 3);

    // F: gold figure cheers while the camera is high; the crowd below is the median
    topA.armL.rotation.x = topA.armR.rotation.x = -2.8 + Math.sin(t * 9) * 0.3;
    for (let i = 0; i < 5; i++) { steps[i].m.material.emissive = steps[i].m.material.emissive || new THREE.Color(); }

    // G: right-hand stack tumbles on "turun"; bricks integrate from one parametric time, so seeks are stable
    const fallT = AT["s7:turun"];
    const showG = t > K.s7 - 2 && t < K.s8 + 1.5;
    bricks.visible = showG;
    if (showG) {
      for (let i = 0; i < BN; i++) {
        const b = bd[i], ft0 = fallT + b.d, u = Math.max(0, t - ft0);
        if (b.fall && u > 0) {
          const y = Math.max(0.85, b.y - 0.5 * 34 * u * u + b.vx * 0.15 * u);
          set(bricks, i, b.x + b.vx * u * 0.55, y, b.vz * u * 0.55, 1, b.sp * u, b.sp * u * 0.5 * (y > 0.9 ? 1 : 0.2));
        } else set(bricks, i, b.x, b.y, 0);
      }
      bricks.instanceMatrix.needsUpdate = true;
    }
    leaver.forEach((l, i) => {
      l.g.visible = showG;
      const u = Math.max(0, t - AT["s7:pengguna"] - i * 0.25);
      l.g.position.set(X.g + 14 + i * 4 + u * 6, 0, 10 - i * 3);
      l.g.rotation.y = Math.PI / 2;
      walk(l, t + i, u > 0 ? 1 : 0);
    });

    // H: hero stands at the crossroads, looks at each arm when it is named, waves at the end
    const showH = t > K.s8 - 1.5;
    if (showH) {
      hero.g.visible = true;
      const u = eout((t - K.s8) / 2.4);
      hero.g.position.set(X.h - 3 + 3 * u, 0, 16 - 4 * u);
      const look = AT["s8:garap"] <= t ? (t >= AT["s8:jual"] ? 0.9 : -0.9) : 0;
      hero.g.rotation.y = look * ramp(t, K.s8 + 2, K.s8 + 2.6);
      walk(hero, t, 1 - ramp(t, K.s8 + 1.6, K.s8 + 2.4));
      if (t > AT["s8:jual"] + 1.2) hero.armR.rotation.x = -2.8 + Math.sin(t * 9) * 0.35;
    }
    armA.scale.x = 1 + 0.08 * ramp(t, AT["s8:garap"], AT["s8:garap"] + 0.3);
    armB.scale.x = 1 + 0.08 * ramp(t, AT["s8:jual"], AT["s8:jual"] + 0.3);

    composer.render();
  };
}
