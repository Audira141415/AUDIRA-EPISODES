// BLOCK ASCENT: a generic voxel world rendered from original procedural pixel textures; no Minecraft assets.
// The film's axis is up. The camera climbs one rising terraced mountain, each terrace a business stage. The partner wall counts 295 blocks, 43 of them gold (June 2022 figures).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track } from "./lib3d.js";

function pixTex(base, jitter, seed, top) {
  const rnd = mulberry(seed);
  return canvasTex(16, 16, (g) => {
    const c = new THREE.Color(base);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const j = (rnd() - 0.5) * jitter;
      g.fillStyle = `rgb(${Math.max(0, Math.min(255, c.r * 255 + j * 255)) | 0},${Math.max(0, Math.min(255, c.g * 255 + j * 255)) | 0},${Math.max(0, Math.min(255, c.b * 255 + j * 255)) | 0})`;
      g.fillRect(x, y, 1, 1);
    }
    if (top) { const t = new THREE.Color(top); for (let x = 0; x < 16; x++) { const h = 3 + Math.floor(rnd() * 3); for (let y = 0; y < h; y++) { const j = (rnd() - 0.5) * jitter; g.fillStyle = `rgb(${(t.r + j) * 255 | 0},${(t.g + j) * 255 | 0},${(t.b + j) * 255 | 0})`; g.fillRect(x, y, 1, 1); } } }
  });
}
const nearest = (t) => { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.anisotropy = 1; t.generateMipmaps = false; return t; };
const vox = (base, jit, seed, rough = 0.9, top) => new THREE.MeshStandardMaterial({ map: nearest(pixTex(base, jit, seed, top)), roughness: rough });

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.NoToneMapping;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const rnd = mulberry(295);
  const SKYA = new THREE.Color("#F7A968"), SKYB = new THREE.Color("#7CC3F5"), SKYC = new THREE.Color("#2D4F8E");
  scene.background = SKYA.clone();
  scene.fog = new THREE.Fog(SKYA.clone(), 240, 620);
  const cam = new THREE.PerspectiveCamera(42, 1080 / 1920, 0.5, 1200);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xa89878, 1.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0cf, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 420 });
  sun.shadow.bias = -0.0006;
  scene.add(sun, sun.target);

  const GRASS_TOP = vox("#5FA83B", 0.14, 1), GRASS_SIDE = vox("#7A5230", 0.1, 2, 0.9, "#5FA83B"), DIRT = vox("#7A5230", 0.12, 3), STONE = vox("#A7A9A6", 0.1, 4), PLANK = vox("#B08A4E", 0.1, 5), LOG = vox("#5A3E22", 0.1, 6), LEAF = vox("#3D8A2F", 0.2, 7), GOLD = vox("#F2C230", 0.12, 8, 0.35), SAND = vox("#DCCB8A", 0.08, 9), RED = vox("#C8362F", 0.1, 10), BLUE = vox("#3B74C9", 0.1, 11), PINK = vox("#E86FA8", 0.1, 12), WHITE = vox("#E8E8E2", 0.06, 13), TEAL = vox("#2FB5A5", 0.1, 14), GREY = vox("#55595F", 0.1, 15);
  const G = new THREE.BoxGeometry(1, 1, 1);

  // terrain: terraced mountain from layered sines; each column stacks as instanced grass + dirt
  // terraces step up away from the shore, so each business stage stays visible from the one below it
  const TERR = (z) => (z >= 52 ? 4 : z >= 36 ? 14 : z >= 22 ? 24 : z >= 8 ? 34 : z >= -22 ? 44 : Math.max(4, 44 - (-22 - z) * 0.5));
  const hgt = (x, z) => {
    const roll = Math.round((1.1 * Math.sin(x * 0.17 + 1) + 1.1 * Math.sin(z * 0.21 + 0.4)) * (Math.abs(x) > 26 ? 1 : 0));
    const fall = Math.max(0, Math.abs(x) - 44) * 0.55;
    return Math.max(2, Math.round((TERR(z) - fall + roll) / 2) * 2);
  };
  const cols = [];
  for (let x = -110; x < 110; x += 2) for (let z = -70; z < 118; z += 2) cols.push([x, z, hgt(x, z)]);
  const topMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(2, 2, 2), [GRASS_SIDE, GRASS_SIDE, GRASS_TOP, DIRT, GRASS_SIDE, GRASS_SIDE], cols.length);
  const bodyMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(2, 1, 2), STONE, cols.length);
  topMesh.castShadow = topMesh.receiveShadow = bodyMesh.receiveShadow = true;
  const mm = new THREE.Matrix4();
  cols.forEach(([x, z, h], i) => {
    mm.makeTranslation(x, h - 1, z); topMesh.setMatrixAt(i, mm);
    mm.makeScale(1, h - 2, 1).setPosition(x, (h - 2) / 2 - 0.0, z); bodyMesh.setMatrixAt(i, mm);
  });
  scene.add(topMesh, bodyMesh);
  // far water plane
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: 0x2f79bd, roughness: 0.35 }));
  water.rotation.x = -Math.PI / 2; water.position.y = 1.2;
  scene.add(water);

  // trees
  const treeL = new THREE.InstancedMesh(G, LOG, 600), treeF = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), LEAF, 900);
  treeL.castShadow = treeF.castShadow = true;
  { let il = 0, ifl = 0; for (let i = 0; i < 90 && il < 590; i++) { const x = (rnd() < 0.5 ? -1 : 1) * (34 + rnd() * 62), z = -40 + rnd() * 150, h = hgt(Math.round(x / 2) * 2, Math.round(z / 2) * 2); const th = 4 + Math.floor(rnd() * 3); for (let y = 0; y < th; y++) { mm.makeScale(1.4, 1, 1.4).setPosition(x, h + y + 0.5, z); treeL.setMatrixAt(il++, mm); } for (let a = 0; a < 9 && ifl < 890; a++) { mm.makeScale(1.9, 1.9, 1.9).setPosition(x + ((a % 3) - 1) * 1.8, h + th + 0.5 + Math.floor(a / 3) * 1.6, z + (Math.floor(a / 3) - 1) * 1.1); treeF.setMatrixAt(ifl++, mm); } } treeL.count = il; treeF.count = ifl; }
  scene.add(treeL, treeF);

  const group = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); return g; };
  const bx = (g, w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };

  // ---- a blocky trader figure, original proportions, no game character ----
  const person = (shirt) => {
    const g = new THREE.Group();
    bx(g, 2, 2, 2, vox("#E0B48A", 0.06, 20), 0, 7, 0);
    bx(g, 0.4, 0.4, 0.1, GREY, -0.5, 7.2, 1.02); bx(g, 0.4, 0.4, 0.1, GREY, 0.5, 7.2, 1.02);
    bx(g, 2, 3, 1.2, shirt, 0, 4.5, 0);
    const L = bx(g, 0.95, 3, 1, GREY, -0.5, 1.5, 0), R = bx(g, 0.95, 3, 1, GREY, 0.5, 1.5, 0), A = bx(g, 0.8, 3, 0.9, shirt, -1.4, 4.6, 0), B = bx(g, 0.8, 3, 0.9, shirt, 1.4, 4.6, 0);
    scene.add(g);
    return { g, L, R, A, B };
  };

  // ---- market: four stalls on the base terrace, one for each product type ----
  const baseY = 4, gy = 14, sy = 24, wy = 34, hy = 44, pkY = 44 + 32;
  const STALL = [[-24, RED, "skin"], [-8, BLUE, "map"], [8, PINK, "tex"], [24, TEAL, "addon"]].map(([x, roof, kind]) => {
    const g = group(x, baseY, 72);
    bx(g, 13, 2.6, 7, PLANK, 0, 1.3, 0);
    bx(g, 1, 8, 1, LOG, -6, 4, 3); bx(g, 1, 8, 1, LOG, 6, 4, 3); bx(g, 1, 8, 1, LOG, -6, 4, -3); bx(g, 1, 8, 1, LOG, 6, 4, -3);
    for (let i = 0; i < 7; i++) bx(g, 2, 1, 8, i % 2 ? roof : WHITE, -6 + i * 2, 8.5, 0);
    // the wares
    const ware = new THREE.Group(); ware.position.y = 3; g.add(ware);
    if (kind === "skin") { for (let i = 0; i < 3; i++) { const c = [RED, TEAL, GOLD][i]; bx(ware, 1.4, 1.4, 1.4, vox("#E0B48A", 0.06, 20), -3.4 + i * 3.4, 2.6, 0); bx(ware, 1.4, 2, 0.8, c, -3.4 + i * 3.4, 0.9, 0); } }
    if (kind === "map") { for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) bx(ware, 1.6, 0.5 + ((i * 7 + j * 3) % 4) * 0.6, 1.6, (i + j) % 3 ? GRASS_TOP : SAND, -3.4 + i * 1.7, 0.4, -1.6 + j * 1.6); }
    if (kind === "tex") { [STONE, PLANK, GOLD, LEAF].forEach((m, i) => bx(ware, 2.4, 2.4, 2.4, m, -4 + i * 2.7, 1.2, 0)); }
    if (kind === "addon") { bx(ware, 3, 3, 3, TEAL, -2.6, 1.5, 0); bx(ware, 1.2, 1.2, 1.2, GOLD, 1, 0.6, 0); bx(ware, 1.2, 1.2, 1.2, RED, 3, 0.6, 1); bx(ware, 1.2, 2.2, 1.2, WHITE, 3.2, 1.1, -1); }
    g.userData = { ware };
    return g;
  });
  const buyer = person(BLUE);

  // minecoin-style token is a generic gold cube; coins hop stall-to-buyer
  const COIN = 26;
  const coins = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 1.2, 0.5), GOLD, COIN);
  coins.frustumCulled = false;
  scene.add(coins);

  // ---- review gate on second terrace: a gate with a stamp ----
  const gateG = group(0, gy, 44);
  bx(gateG, 4, 18, 4, STONE, -11, 9, 0); bx(gateG, 4, 18, 4, STONE, 11, 9, 0); bx(gateG, 26, 4, 5, STONE, 0, 20, 0);
  const barrier = bx(gateG, 18, 1.6, 1.6, RED, 0, 7, 0);
  const applicants = [0, 1, 2].map((i) => { const p = person([RED, TEAL, PINK][i]); return p; });
  const crate = bx(gateG, 5, 5, 5, PLANK, -3, 2.5, 8);
  const lamp = bx(gateG, 2.4, 2.4, 2.4, GREY, 0, 23.2, 0);
  const lampOn = new THREE.MeshStandardMaterial({ color: 0x31d05a, emissive: 0x31d05a, emissiveIntensity: 2 });

  // ---- split scale: 100 blocks, store share leaves, more than half of the rest lit for creators ----
  const SPLIT = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 1.7, 1.7), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), 100);
  SPLIT.frustumCulled = false; SPLIT.castShadow = true;
  scene.add(SPLIT);

  // ---- partner wall: exactly 295 blocks, 43 gold ----
  const PW = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 }), 295);
  PW.frustumCulled = false; PW.castShadow = true;
  scene.add(PW);
  const pwc = []; { const C = 20; const order = Array.from({ length: 295 }, (_, i) => i); for (let i = 294; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } const gold = new Set(order.slice(0, 43)); for (let i = 0; i < 295; i++) pwc.push({ x: (i % C - (C - 1) / 2) * 1.7, y: 1 + Math.floor(i / C) * 1.7, gold: gold.has(i), d: rnd() }); }
  const cG = new THREE.Color("#F2C230"), cS = new THREE.Color("#5C6B73"), cT = new THREE.Color();

  // ---- the company: a blocky HQ with a workforce of 26 ----
  const hq = group(0, hy, -2);
  const FLOORS = [];
  for (let f = 0; f < 6; f++) { const g = new THREE.Group(); g.position.y = 2 + f * 5; hq.add(g); bx(g, 26 - f * 1.5, 5, 16 - f * 1.2, f % 2 ? WHITE : PLANK, 0, 2.5, 0); for (let i = 0; i < 5; i++) bx(g, 2.2, 2.6, 0.4, new THREE.MeshStandardMaterial({ color: 0x113355, emissive: 0xffd77a, emissiveIntensity: 0.9 }), -8 + i * 4, 2.6, (16 - f * 1.2) / 2 + 0.1); FLOORS.push(g); }
  const staff = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 3, 1), TEAL, 26);
  staff.frustumCulled = false; staff.castShadow = true;
  scene.add(staff);

  // ---- summit: a small clock block with a 2022 banner fading, and the outbound affiliate beams ----
  const summit = group(0, pkY, -2);
  bx(summit, 7, 1.2, 7, GOLD, 0, 0.6, 0);
  const beams = [];
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.283;
    const b = bx(summit, 0.8, 0.8, 60, new THREE.MeshBasicMaterial({ color: 0x9fe7ff, transparent: true, opacity: 0.6, fog: false }), Math.sin(a) * 30, 3, Math.cos(a) * 30);
    b.rotation.y = a; b.castShadow = false;
    beams.push(b);
  }
  const tall = person(GOLD);

  // ---- the ascent: y only rises until the closing shot ----
  const path = track([
    [0, 0, baseY + 18, 165, 0, baseY + 15, 72],
    [K.s1e, 0, baseY + 19, 160, 0, baseY + 16, 72],
    [K.s2 + 2, -16, baseY + 15, 158, -16, baseY + 14, 72],
    [K.s2e, 16, baseY + 15, 158, 16, baseY + 14, 72],
    [K.s3 + 1.4, 0, gy + 15, 142, 0, gy + 16, 44],
    [K.s3e, 0, gy + 15, 134, 0, gy + 16, 44],
    [K.s4 + 1, -3, sy + 13, 108, 0, sy + 14, 29],
    [K.s4e, 3, sy + 14, 102, 0, sy + 14, 29],
    [K.s5 + 1, 0, wy + 18, 116, 0, wy + 20, 14],
    [K.s5e, 0, wy + 20, 108, 0, wy + 20, 14],
    [K.s6 + 1, -8, hy + 18, 88, 0, hy + 20, -2],
    [K.s6e, 8, hy + 22, 84, 0, hy + 22, -2],
    [K.s7 + 2, 0, pkY + 20, 96, 0, pkY + 8, -2],
    [K.s7e, -10, pkY + 26, 128, 0, pkY + 6, -2],
    [K.s8 + 2, -6, pkY + 12, 66, 0, pkY + 13, -2],
    [K.dur, 0, pkY + 11, 56, 0, pkY + 12, -2],
  ]);

  const composer = new EffectComposer(r);
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(540, 960), 0.14, 0.5, 0.92));
  composer.addPass(new OutputPass());
  const m = new THREE.Matrix4(), v3 = new THREE.Vector3(), sky = new THREE.Color();

  const walk = (p, t, amt) => { const s = Math.sin(t * 8) * 0.6 * amt; p.L.rotation.x = s; p.R.rotation.x = -s; p.A.rotation.x = -s; p.B.rotation.x = s; };

  return function draw(t) {
    const [cx, cy, cz, lx, ly, lz] = path(t);
    cam.position.set(cx, cy, cz);
    cam.lookAt(lx, ly, lz);
    sun.position.set(cx - 70, cy + 120, cz + 60);
    sun.target.position.set(0, cy - 20, cz - 40);
    // sunrise to day to dusk across the climb
    const u1 = ramp(t, 0, K.s3), u2 = ramp(t, K.s7, K.s8 + 2);
    sky.copy(SKYA).lerp(SKYB, u1).lerp(SKYC, u2 * 0.7);
    scene.background.copy(sky); scene.fog.color.copy(sky);
    sun.intensity = 2.2 * (1 - 0.35 * u2);

    // base: buyer walks along the stalls, each ware pops when named
    const names = [AT["s2:skin"], AT["s2:adventure"], AT["s2:texture"], AT["s2:add-on"]];
    STALL.forEach((g, i) => { const w = g.userData.ware; const s = 0.01 + 0.99 * back((t - names[i]) / 0.4); w.scale.setScalar(s); w.rotation.y = i === 3 ? 0 : Math.sin(t * 1.2 + i) * 0.1; });
    const bx0 = -28 + clamp01((t - K.s2) / (K.s2e - K.s2)) * 54;
    buyer.g.position.set(bx0, baseY, 82);
    buyer.g.rotation.y = Math.PI;
    walk(buyer, t, t > K.s2 && t < K.s2e ? 1 : 0.1);
    buyer.g.visible = t < K.s3 + 1;
    const onC = t > AT["s2:Minecoins"] - 0.2 && t < K.s3;
    coins.visible = onC;
    if (onC) {
      for (let i = 0; i < COIN; i++) {
        const u = clamp01((t - AT["s2:Minecoins"] - i * 0.06) / 0.65);
        const x = bx0 + Math.sin(i * 2.3) * 2, y = baseY + 7 + Math.sin(u * 3.14) * 6, z = 82 - u * 8;
        m.makeRotationY(t * 5 + i).setPosition(x, u > 0 && u < 1 ? y : -40, z);
        coins.setMatrixAt(i, m);
      }
      coins.instanceMatrix.needsUpdate = true;
    }

    gateG.visible = t < K.s4 + 0.15;
    hq.visible = t > K.s6 - 0.6;
    summit.visible = t > K.s7 - 1.2;
    // gate: applicants queue with portfolios; barrier lifts on "direview", lamp turns green
    const lift = ramp(t, AT["s3:direview"], AT["s3:direview"] + 0.5);
    barrier.position.y = 7 + lift * 9; barrier.rotation.z = lift * 0.12;
    lamp.material = lift > 0.5 ? lampOn : GREY;
    applicants.forEach((p, i) => {
      const qz = 44 + 14 + i * 6, inn = eout((t - AT["s3:direview"] - 0.2 - i * 0.4) / 1.4);
      p.g.position.set(-1 + i * 1.2, gy, qz - inn * 22);
      p.g.rotation.y = Math.PI;
      walk(p, t + i, inn > 0 && inn < 1 ? 1 : 0);
      p.g.visible = t > K.s3 - 1.5 && t < K.s4 + 1.2;
    });
    crate.scale.setScalar(ramp(t, AT["s3:key"], AT["s3:key"] + 0.3) + 0.01);

    // split: 100 blocks stand; the top 30 lift away to the store on "App", then 39 of the 70 glow gold for "lebih dari separuh"
    const onS = t > K.s4 - 0.4 && t < K.s5 + 0.15;
    SPLIT.visible = onS;
    if (onS) {
      const up = ramp(t, AT["s4:App"], AT["s4:App"] + 0.8), gl = ramp(t, AT["s4:separuh"], AT["s4:separuh"] + 0.5);
      for (let i = 0; i < 100; i++) {
        const col = i % 10, row = Math.floor(i / 10);
        const x = (col - 4.5) * 2, y = sy + 1 + row * 2;
        const top = row >= 7;
        const yy = top ? y + up * (24 + col * 1.4) : y;
        const xx = top ? x + up * 26 : x;
        m.makeTranslation(xx, yy, 29);
        SPLIT.setMatrixAt(i, m);
        const creator = row < 7 && i < 39;
        cT.copy(top ? cS : cT.set("#8AA0A8"));
        if (top) cT.set("#5C6B73");
        if (creator) cT.set("#8AA0A8").lerp(cG, gl);
        SPLIT.setColorAt(i, cT);
      }
      SPLIT.instanceMatrix.needsUpdate = true; SPLIT.instanceColor.needsUpdate = true;
    }

    // partner wall: grows row by row on "295", then gold lights on "43"
    const onP = t > K.s5 - 0.4 && t < K.s6 + 0.15;
    PW.visible = onP;
    if (onP) {
      const grow = clamp01((t - AT["s5:295"]) / 1.5), gl = ramp(t, AT["s5:43"], AT["s5:43"] + 0.6);
      for (let i = 0; i < 295; i++) {
        const c = pwc[i], on = clamp01(grow * 1.1 - (c.y / 26));
        const s = Math.max(0.001, eout(on * 4));
        m.makeScale(s, s, s).setPosition(c.x, wy + c.y, 14);
        PW.setMatrixAt(i, m);
        cT.copy(cS);
        if (c.gold) cT.lerp(cG, gl);
        PW.setColorAt(i, cT);
      }
      PW.instanceMatrix.needsUpdate = true; PW.instanceColor.needsUpdate = true;
    }

    // HQ stacks floor by floor on "perusahaan", 26 staff walk in on "26"
    FLOORS.forEach((f, i) => { const s = eout((t - AT["s6:perusahaan"] + 0.8 - i * 0.14) / 0.5); f.scale.y = Math.max(0.001, s); f.position.y = 2 + i * 5 * s; });
    const onSt = t > K.s6 - 0.5 && t < K.s7 + 1;
    staff.visible = onSt;
    if (onSt) {
      for (let i = 0; i < 26; i++) {
        const u = eout((t - AT["s6:26"] - i * 0.05) / 1.4);
        const x = -13 + i * 1.05 - (1 - u) * 34;
        m.makeTranslation(x, hy + 1.5, 7.2);
        staff.setMatrixAt(i, m);
      }
      staff.instanceMatrix.needsUpdate = true;
    }

    // summit: affiliate beams shoot out on "afiliasi"; lone figure stands up there at the end, thinking
    const af = ramp(t, AT["s7:afiliasi"], AT["s7:afiliasi"] + 0.5);
    beams.forEach((b, i) => { const k = Math.max(0.001, af * (1 - ramp(t, K.s8, K.s8 + 1))); b.scale.set(1, 1, k); b.material.opacity = 0.55 * k; const a = i / 8 * 6.283; b.position.set(Math.sin(a) * 30 * k, 3, Math.cos(a) * 30 * k); });
    tall.g.position.set(0, pkY + 1.2, -2);
    tall.g.rotation.y = Math.sin(t * 0.4) * 0.4;
    tall.g.visible = t > K.s7 - 2;
    walk(tall, t, 0);
    tall.B.rotation.x = t > AT["s8:Kalau"] ? -2.6 : 0;

    composer.render();
  };
}
