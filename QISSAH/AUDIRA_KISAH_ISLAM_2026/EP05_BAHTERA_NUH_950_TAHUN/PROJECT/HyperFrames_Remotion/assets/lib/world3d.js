// EP05 BAHTERA NUH. BUILDFORGE + WORLDFORGE: one olive valley under a slate storm sky.
// A tally board of 1000 brass pegs loses its top 50, a village turns its back through fast days and nights, the ark assembles
// plank by plank in an exploded view (a hammer and the planks move on their own), the sky opens, pairs of animals climb the ramp,
// the ark rides mountain-high waves, and comes to rest on the Judi hilltop under a golden break in the clouds.
// No prophet is shown: his presence is the lantern, the hammer and the planks. People are faceless robed figures. Pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, smooth, canvasTex, track, std, box as box0, cyl as cyl0, stage, pts } from "./lib3d.js";

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp } = stage(canvas, { bg: 0x39424a, fog: 0.0062, exp: 1.0, bloom: [0.3, 0.5, 0.86] });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(950);
  const box = (...a) => { const m = box0(...a); if (!a[7]) scene.add(m); return m; };
  const cyl = (...a) => { const m = cyl0(...a); if (!a[8]) scene.add(m); return m; };
  const C = (h) => new THREE.Color(h);
  const gauss = (x, z, cx, cz, r) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));
  const curve = (keys) => { const f = track(keys); return (t) => f(t)[0]; };

  // ---------- places (world units ~ metres)
  const BOARD = [6, -13];          // tally board, behind the build site
  const LAMP = [-15, 5];           // lantern post
  const VIL = [-40, 2];            // village centre
  const GATH = [-23, 10];          // where the elders gather
  const SON = [58, -16];           // the son's hill
  const JUDI = [70, -70];          // Judi hilltop
  const JUDI_TOP = 13, SON_TOP = 10;

  // ---------- terrain
  const H = (x, z) => {
    let u = 1.3 * Math.sin(x * 0.043 + 1.3) * Math.cos(z * 0.051 - 0.4) + 0.8 * Math.sin(x * 0.093 + z * 0.071 + 2.1) + 0.4 * Math.sin(x * 0.21 - z * 0.17) + 1.3;
    const flat = smooth(clamp01((Math.hypot((x + 16) / 1.7, z - 8) - 22) / 18));
    let h = u * flat;
    const d = Math.hypot(x - 20, z + 20);
    h += Math.max(0, d - 125) ** 1.3 * 0.05 * (0.6 + 0.4 * Math.sin(Math.atan2(z, x) * 5 + 1));
    h = Math.max(h, Math.min(11.5 * gauss(x, z, SON[0], SON[1], 7.5), SON_TOP));
    h = Math.max(h, Math.min(18 * gauss(x, z, JUDI[0], JUDI[1], 14), JUDI_TOP));
    return h - 0.2;
  };
  const TG = new THREE.PlaneGeometry(760, 760, 190, 190); TG.rotateX(-Math.PI / 2);
  const tpos = TG.attributes.position, tcol = new Float32Array(tpos.count * 3);
  const cG1 = C(0x5b6830), cG2 = C(0x76803e), cDirt = C(0x6b5639), cRock = C(0x7b7466), cT = new THREE.Color();
  const nr = mulberry(11);
  for (let i = 0; i < tpos.count; i++) {
    const x = tpos.getX(i), z = tpos.getZ(i), h = H(x, z);
    tpos.setY(i, h);
    cT.copy(cG1).lerp(cG2, nr() * 0.7);
    const dirt = clamp01(1 - Math.hypot(x, z - 3) / 17) + 0.8 * clamp01(1 - Math.hypot(x - VIL[0], z - VIL[1]) / 13);
    cT.lerp(cDirt, Math.min(1, dirt * 1.4));
    cT.lerp(cRock, clamp01((h - 5) / 6) * 0.75);
    tcol.set([cT.r, cT.g, cT.b], i * 3);
  }
  TG.setAttribute("color", new THREE.BufferAttribute(tcol, 3));
  const terrain = new THREE.Mesh(TG, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.96 }));
  terrain.receiveShadow = true; scene.add(terrain);

  // ---------- sky dome with storm clouds, golden break and lightning flash
  const skyU = {
    top: { value: C(0) }, hor: { value: C(0) }, cloud: { value: C(0) }, sunCol: { value: C(0) },
    gold: { value: 0 }, cov: { value: 0.5 }, time: { value: 0 }, flash: { value: 0 }, sunDir: { value: new THREE.Vector3(0, 0.3, -1) },
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(620, 48, 24), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 top, hor, cloud, sunCol, sunDir; uniform float gold, cov, time, flash; varying vec3 vD;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h2(i), h2(i+vec2(1.0,0.0)), f.x), mix(h2(i+vec2(0.0,1.0)), h2(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n2(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
void main(){
  vec3 d = normalize(vD); float y = max(d.y, 0.0);
  vec3 c = mix(hor, top, pow(y, 0.55));
  vec2 uv = d.xz / (d.y + 0.22) * 1.6 + vec2(time * 0.05, time * 0.021);
  float f = fbm(uv);
  vec3 sd3 = normalize(sunDir); float sd = max(dot(d, sd3), 0.0);
  float cv = cov - gold * 0.55 * pow(sd, 2.5);
  float cl = smoothstep(cv - 0.16, cv + 0.18, f) * smoothstep(-0.04, 0.16, d.y);
  vec3 cc = cloud * (0.65 + 0.6 * f) + sunCol * pow(sd, 5.0) * gold * 0.35 + vec3(0.75, 0.82, 1.0) * flash * f;
  c += sunCol * (pow(sd, 60.0) * 0.9 + pow(sd, 6.0) * 0.18) * gold;
  c = mix(c, cc, cl * 0.94);
  gl_FragColor = vec4(c, 1.0);
}`,
  }));
  sky.renderOrder = -10; scene.add(sky);
  const stars = pts(scene, 420, { color: 0xdfe6ff, size: 3.2, opacity: 0 });
  stars.m.fog = false;
  const sseed = Array.from({ length: 420 }, () => [rnd() * Math.PI * 2, 0.08 + rnd() * 0.9]);

  // ---------- light
  const hemi = new THREE.HemisphereLight(0xb8c2c8, 0x3d3a28, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc28a, 1.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 320 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  // look states: [top, hor, cloud, sunCol, hemiSky, hemiGnd, hemiI, sunI, cov, gold, fog]
  const ST = {
    dusk:  [0x2c3540, 0x7a7766, 0x4a525a, 0xffb27a, 0xa8b2b8, 0x3d3a28, 1.0, 1.5, 0.45, 0.15, 0.0062],
    day:   [0x56789a, 0xbcb79c, 0x9aa2a6, 0xfff0d0, 0xd0dce6, 0x55522f, 1.5, 2.6, 0.55, 0.35, 0.0055],
    night: [0x060a14, 0x182030, 0x141922, 0x9aaeff, 0x405070, 0x10120c, 0.28, 0.12, 0.5, 0.0, 0.0062],
    storm: [0x222a33, 0x4a565c, 0x343c43, 0x8fa5b8, 0x9fb0ba, 0x2c3633, 1.15, 0.45, 0.12, 0.0, 0.0082],
    gold:  [0x34495d, 0xd29e58, 0x6a6862, 0xffc56e, 0xc8c0a8, 0x4a4630, 1.0, 2.6, 0.5, 1.0, 0.0058],
    dawn:  [0x3c5a84, 0xf0b878, 0x9a8a80, 0xffb070, 0xd8c8b0, 0x50492f, 1.15, 2.2, 0.55, 0.85, 0.005],
  };
  const SD = { dusk: [0.55, 0.32, 0.65], day: [0.3, 0.8, 0.4], night: [-0.3, 0.6, 0.5], storm: [0.2, 1, 0.3], gold: [-0.45, 0.24, -0.8], dawn: [-0.5, 0.13, -0.85] };
  const toVec = (s) => s.map((v, i) => (i < 6 ? C(v) : v));
  const STV = Object.fromEntries(Object.entries(ST).map(([k, v]) => [k, toVec(v)]));
  const cur = toVec(ST.dusk);
  const blend = (name, w) => {
    if (w <= 0) return;
    const s = STV[name];
    for (let i = 0; i < s.length; i++) if (i < 6) cur[i].lerp(s[i], w); else cur[i] += (s[i] - cur[i]) * w;
  };
  const sdir = new THREE.Vector3(), sdTmp = new THREE.Vector3();

  // ---------- materials
  const woodTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#8d6c49"; g.fillRect(0, 0, w, h);
    const q = mulberry(7);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = `rgba(${(40 + q() * 30) | 0},${(28 + q() * 20) | 0},${(16 + q() * 10) | 0},${0.15 + q() * 0.3})`;
      g.lineWidth = 0.5 + q() * 2; g.beginPath(); const y = q() * h; g.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 3 + (q() - 0.5) * 2);
      g.stroke();
    }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(210,200,180,${q() * 0.09})`; g.fillRect(q() * w, q() * h, q() * 60, q() * 6); }
  });
  const WOOD = std(0xffffff, 0.86, 0, { map: woodTex });
  const WOOD2 = std(0xc9b49a, 0.88, 0, { map: woodTex });
  const TAR = std(0x1b1815, 0.5, 0.05);
  const BRASS = std(0xb88f4e, 0.42, 0.55);
  const DARKW = std(0x3a2a1c, 0.8);
  const MUD = std(0x9c8460, 0.95, 0, { flatShading: true }), ROOF = std(0x6a5840, 0.95, 0, { flatShading: true });
  const LAMPCORE = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb050, emissiveIntensity: 3 });

  // ---------- tally board: 25 x 40 = 1000 brass pegs; the top two rows (50) come out
  const board = new THREE.Group(); board.position.set(BOARD[0], H(BOARD[0], BOARD[1]), BOARD[1]); scene.add(board);
  box(8.6, 13.2, 0.45, DARKW, 0, 7.4, 0, board);
  box(9.2, 0.5, 0.7, WOOD, 0, 14.1, 0, board); box(9.2, 0.5, 0.7, WOOD, 0, 0.75, 0, board);
  for (const sx of [-4.6, 4.6]) box(0.5, 14.6, 0.6, WOOD, sx, 7.3, 0.05, board);
  const PEG = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 8).rotateX(Math.PI / 2), BRASS, 1000);
  PEG.frustumCulled = false; PEG.castShadow = true; board.add(PEG);
  const pegAt = A("s1:lima");
  const PM = new THREE.Matrix4(), PQ = new THREE.Quaternion(), PE = new THREE.Euler(), PV = new THREE.Vector3(), PS = new THREE.Vector3();
  const pegSeed = Array.from({ length: 50 }, () => [rnd() - 0.5, rnd(), rnd()]);

  // ---------- village, trees
  const houses = [];
  for (let k = 0; k < 18; k++) {
    const a = k * 2.399 + 0.4, rr = 5 + (k % 6) * 2.1 + rnd() * 1.5;
    const x = VIL[0] + Math.cos(a) * rr, z = VIL[1] + Math.sin(a) * rr * 0.8;
    const w = 3 + rnd() * 1.6, d = 2.8 + rnd() * 1.4, h = 2.2 + rnd() * 1.1;
    const G = new THREE.Group(); G.position.set(x, H(x, z), z); G.rotation.y = rnd() * 0.6 - 0.3; scene.add(G);
    box(w, h, d, MUD, 0, h / 2, 0, G); box(w + 0.3, 0.22, d + 0.3, ROOF, 0, h + 0.1, 0, G); box(0.8, 1.5, 0.1, DARKW, w * 0.2, 0.75, d / 2 + 0.03, G);
    houses.push([x, z]);
  }
  const TRUNK = std(0x4b3a29, 0.9), LEAF = std(0x4f5a2a, 0.9, 0, { flatShading: true }), LEAF2 = std(0x3c4a26, 0.9, 0, { flatShading: true });
  for (let k = 0; k < 46; k++) {
    const a = rnd() * Math.PI * 2, rr = 20 + rnd() * 50;
    const x = -12 + Math.cos(a) * rr * 1.4, z = 6 + Math.sin(a) * rr;
    if (Math.abs(x) < 16 && z > -14 && z < 46) continue;
    const y = H(x, z);
    cyl(0.12, 0.18, 1.4, 6, TRUNK, x, y + 0.7, z);
    if (k % 3) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + rnd() * 0.5, 0), LEAF); c.position.set(x, y + 2.0, z); c.scale.y = 0.75; c.castShadow = true; scene.add(c); }
    else { const c = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4, 7), LEAF2); c.position.set(x, y + 3, z); c.castShadow = true; scene.add(c); }
  }

  // ---------- faceless robed figures (no features: the head is cloth)
  const PGEO = { body: new THREE.CylinderGeometry(0.2, 0.46, 1.45, 8), head: new THREE.SphereGeometry(0.2, 10, 8), hood: new THREE.SphereGeometry(0.29, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.64), arm: new THREE.CylinderGeometry(0.07, 0.09, 0.72, 6).translate(0, -0.36, 0) };
  const ROBES = [0x5a4a3a, 0x6d5c48, 0x4a4038, 0x7a6a55, 0x3e3a35, 0x655544];
  const person = (robe, s = 1) => {
    const G = new THREE.Group();
    const m = std(robe, 0.92, 0, { flatShading: true }), hm = std(C(robe).multiplyScalar(0.55), 0.92, 0, { flatShading: true });
    const b = new THREE.Mesh(PGEO.body, m); b.position.y = 0.725; b.castShadow = true; G.add(b);
    const hd = new THREE.Mesh(PGEO.head, hm); hd.position.y = 1.62; hd.castShadow = true; G.add(hd);
    const hood = new THREE.Mesh(PGEO.hood, m); hood.position.set(0, 1.6, -0.03); hood.scale.setScalar(0.001); G.add(hood);
    const arms = [-1, 1].map((sx) => { const p = new THREE.Group(); p.position.set(sx * 0.25, 1.32, 0.02); p.add(new THREE.Mesh(PGEO.arm, m)); p.rotation.z = sx * 0.12; G.add(p); return p; });
    G.scale.setScalar(s); scene.add(G);
    return { G, hood, arms };
  };
  const face = (G, tx, tz) => Math.atan2(tx - G.position.x, tz - G.position.z);
  const VILLAGERS = [];
  for (let k = 0; k < 26; k++) {
    const a = k * 2.13 + 1.1, rr = 3 + (k % 7) * 1.7 + rnd();
    const x = VIL[0] + Math.cos(a) * rr + 3, z = VIL[1] + Math.sin(a) * rr * 0.9 + 1;
    const p = person(ROBES[k % ROBES.length], 0.95 + rnd() * 0.15);
    p.G.position.set(x, H(x, z), z);
    p.base = face(p.G, LAMP[0], LAMP[1]); p.k = rnd();
    VILLAGERS.push(p);
  }
  const ELDERS = [];
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * (0.15 + 0.7 * (k / 8));
    const gx = GATH[0] - Math.sin(a) * 4.2, gz = GATH[1] + Math.cos(a) * 4.2 - 1;
    const p = person(ROBES[(k + 2) % ROBES.length], 1.08);
    p.home = [VIL[0] + 6 + (k % 3), VIL[1] + 2 + k * 0.6]; p.gath = [gx, gz];
    ELDERS.push(p);
  }
  const SONF = person(0x5e5040, 1.25);
  SONF.G.position.set(SON[0], SON_TOP - 0.2, SON[1]);

  // ---------- lantern post (the presence of Nuh)
  const lamp = new THREE.Group(); lamp.position.set(LAMP[0], H(LAMP[0], LAMP[1]), LAMP[1]); scene.add(lamp);
  cyl(0.1, 0.13, 3.4, 8, WOOD, 0, 1.7, 0, lamp); box(1.1, 0.12, 0.12, WOOD, 0.45, 3.3, 0, lamp);
  const lanternG = () => { const g = new THREE.Group(); box(0.42, 0.06, 0.42, TAR, 0, 0.32, 0, g); box(0.42, 0.06, 0.42, TAR, 0, -0.3, 0, g); for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) box(0.04, 0.6, 0.04, TAR, x, 0, z, g); const core = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), LAMPCORE); g.add(core); return g; };
  const L1 = lanternG(); L1.position.set(0.9, 2.8, 0); lamp.add(L1);
  const lampLight = new THREE.PointLight(0xffb45c, 30, 26, 1.5); lampLight.position.set(0.9, 2.7, 0); lamp.add(lampLight);
  const believers = pts(scene, 7, { color: 0xffc070, size: 0.9, opacity: 1 });
  const bseed = Array.from({ length: 7 }, (_, i) => [LAMP[0] + 2.5 + Math.cos(i * 0.9) * (2 + (i % 3)), LAMP[1] + 2 + Math.sin(i * 0.9) * 2.2]);

  // ---------- the ark: built part by part from timber piles (local frame: bow +x, beam z, keel bottom y 0)
  const ARK = new THREE.Group(); ARK.rotation.order = "YZX"; scene.add(ARK);
  const CRADLE = 0.3;
  for (const x of [-9, -3, 3, 9]) box(0.9, 0.5, 2.2, DARKW, x, 0.05, 0);
  const BUILD = [];
  const part = (obj, p1, r1, p0, r0, t0, d, ex, hold) => { ARK.add(obj); BUILD.push({ m: obj, p1: new THREE.Vector3(...p1), r1, p0: new THREE.Vector3(...p0), r0, t0, d, ex: new THREE.Vector3(...ex), hold }); return obj; };
  const mesh = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m; };
  let pile = 0;
  const pileAt = () => { const k = pile++; const side = k % 2 ? 1 : -1, j = k >> 1; return [side * 7.5, -CRADLE + 0.2 + Math.floor(j / 5) * 0.3, 8.5 + (j % 5) * 0.85]; };
  // keel and bottom
  const tK = A("s4:buatlah") - 0.3;
  part(mesh(new THREE.BoxGeometry(24, 0.45, 0.7), TAR), [0, 0.225, 0], [0, 0, 0], [0, -CRADLE + 0.25, 6.2], [0, 0, 0], tK, 0.7, [0, 2.2, 0], 0.35);
  part(mesh(new THREE.BoxGeometry(22.8, 0.2, 7.2), TAR), [0, 0.55, 0], [0, 0, 0], [0, -CRADLE + 0.15, -7.5], [0, 0, 0], tK + 0.45, 0.7, [0, 1.6, 0], 0.3);
  // ribs
  const tR = A("s4:pengawasan") - 0.4;
  for (let i = 0; i < 13; i++) {
    const x = -10.5 + i * 1.75, g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.3, 7.0), WOOD2).translateY(0.8));
    for (const sz of [-3.3, 3.3]) g.add(mesh(new THREE.BoxGeometry(0.3, 4.4, 0.3), WOOD2).translateY(2.85).translateZ(sz));
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.25, 7.0), WOOD2).translateY(4.95));
    part(g, [x, 0, 0], [0, 0, 0], [-4 + (i % 4) * 2.4, -CRADLE + 0.2 + Math.floor(i / 4) * 0.4, -9.5], [Math.PI / 2, 0, 0], tR + i * 0.16, 0.6, [0, 3, 0], 0.35);
  }
  // side and end planks, row by row; lower three rows tarred
  const tP0 = A("s4:Setiap") - 0.3, tP1 = A("s4:papan") - 0.9;
  const planks = [];
  for (let row = 0; row < 8; row++) {
    const y = 0.65 + 0.275 + row * 0.55;
    for (const sz of [-1, 1]) for (const [cx, len] of [[-6.4, 9.8], [0, 3.0], [6.4, 9.8]]) {
      if (sz > 0 && cx === 0 && row >= 3) continue;   // door opening
      planks.push({ geo: new THREE.BoxGeometry(len, 0.53, 0.22), p1: [cx, y, sz * 3.5], r1: [0, 0, 0], ex: [0, 0.5, sz * 2.4], row });
    }
    for (const sx of [-1, 1]) planks.push({ geo: new THREE.BoxGeometry(0.22, 0.53, 7.22), p1: [sx * 11.41, y, 0], r1: [0, 0, 0], ex: [sx * 2.4, 0.5, 0], row });
  }
  planks.forEach((pl, k) => {
    const p0 = pileAt();
    const r0 = Math.abs(pl.p1[0]) > 11 ? [0, Math.PI / 2, 0] : [0, 0, 0];
    part(mesh(pl.geo, pl.row < 3 ? TAR : WOOD), pl.p1, pl.r1, p0, r0, tP0 + (k / planks.length) * (tP1 - tP0), 0.55, pl.ex, 0.5);
  });
  // door (hinged at the sill), deck, cabin, roof
  const DOOR = new THREE.Group();
  DOOR.add(mesh(new THREE.BoxGeometry(3.0, 2.75, 0.24), WOOD).translateY(1.375));
  for (const yy of [0.5, 1.4, 2.3]) DOOR.add(mesh(new THREE.BoxGeometry(3.0, 0.16, 0.08), TAR).translateY(yy).translateZ(0.15));
  part(DOOR, [0, 2.3, 3.55], [0, 0, 0], pileAt(), [-Math.PI / 2, 0, 0], tP0 + 0.62 * (tP1 - tP0), 0.55, [0, 0.5, 2.4], 0.5);
  const doorB = BUILD[BUILD.length - 1];
  const tD = A("s4:papan") - 1.0;
  for (let i = 0; i < 9; i++) part(mesh(new THREE.BoxGeometry(22.9, 0.2, 0.8), WOOD2), [0, 5.15, -3.2 + i * 0.8], [0, 0, 0], pileAt(), [0, 0, 0], tD + i * 0.08, 0.5, [0, 2.4, 0], 0.2);
  const tC = A("s4:pasak") - 0.75;
  part(mesh(new THREE.BoxGeometry(12, 2.4, 4.8), WOOD), [-1, 6.45, 0], [0, 0, 0], [-1, 6.45 + 9, -2], [0, 0, 0], tC, 0.55, [0, 2.8, 0], 0.15);
  const roof = new THREE.Group();
  roof.add(mesh(new THREE.BoxGeometry(13, 0.3, 5.6), TAR));
  for (const sx of [-4, 0, 4]) roof.add(mesh(new THREE.BoxGeometry(1.1, 0.7, 0.12), TAR).translateX(sx).translateY(-0.9).translateZ(2.42));
  part(roof, [-1, 7.8, 0], [0, 0, 0], [-1, 7.8 + 10, 2], [0, 0, 0], tC + 0.3, 0.55, [0, 3, 0], 0.15);
  // deck lantern at the bow post
  const bow = new THREE.Group(); ARK.add(bow); bow.position.set(10.6, 5.25, 0);
  box(0.25, 2.2, 0.25, WOOD, 0, 1.1, 0, bow); box(0.9, 0.12, 0.12, WOOD, 0.35, 2.1, 0, bow);
  const L2 = lanternG(); L2.position.set(0.7, 1.65, 0); bow.add(L2);
  const deckLight = new THREE.PointLight(0xffb45c, 0, 30, 1.4); deckLight.position.set(0.7, 1.6, 0); bow.add(deckLight);
  const tBow = A("s4:pasak") + 0.2;
  // ramp: from the door sill down to the field
  const RAMP = new THREE.Group(); scene.add(RAMP);
  const rampLen = Math.hypot(9.8, 2.6 + CRADLE);
  const rampMesh = mesh(new THREE.BoxGeometry(3.2, 0.2, rampLen), WOOD2); rampMesh.position.z = rampLen / 2; RAMP.add(rampMesh);
  for (let i = 0; i < 9; i++) RAMP.add(mesh(new THREE.BoxGeometry(3.2, 0.1, 0.12), TAR).translateZ(0.8 + i * 1.1).translateY(0.14));
  RAMP.position.set(0, 2.3 + CRADLE, 3.7); RAMP.rotation.x = Math.atan2(2.6 + CRADLE, 9.8);

  // ---------- pegs on the +z side and the hammer that drives them by itself
  const HS = K.HS;
  const PEGPOS = [];
  for (const row of [1, 4]) for (let i = 0; i < 13; i++) { const x = -10.5 + i * 1.75; if (row === 4 && Math.abs(x) < 1.6) continue; PEGPOS.push([x, 0.65 + 0.275 + row * 0.55]); }
  const DOW = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8).rotateX(Math.PI / 2), std(0xb39066, 0.7), PEGPOS.length);
  DOW.frustumCulled = false; ARK.add(DOW);
  const HAM = new THREE.Group(); ARK.add(HAM);
  const hamArm = new THREE.Group(); HAM.add(hamArm);
  hamArm.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.35, 8).rotateX(Math.PI / 2), WOOD).translateZ(-0.67));
  hamArm.add(mesh(new THREE.BoxGeometry(0.3, 0.75, 0.32), std(0x55585c, 0.45, 0.7)).translateZ(-1.42));
  // labels for the exploded view
  const label = (txt) => {
    const tx = canvasTex(512, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(21,17,13,.88)"; g.fillRect(0, 14, w, 100); g.fillStyle = "#E9B44C"; g.fillRect(0, 14, 12, 100); g.fillStyle = "#EFE6D2"; g.font = "700 58px Oswald, 'Arial Narrow', Arial, sans-serif"; g.textBaseline = "middle"; g.fillText(txt, 34, 66); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true, fog: false, toneMapped: false }));
    s.renderOrder = 50; ARK.add(s); return s;
  };
  const LABELS = [
    { s: label("LUNAS"), p: [-6, 1.3, 6], a: tK + 0.4, b: A("s4:Setiap") },
    { s: label("GADING-GADING"), p: [4.5, 6.8, 5.5], a: tR + 0.6, b: A("s4:Setiap") + 0.8 },
    { s: label("PAPAN"), p: [-6.5, 3.6, 7.5], a: A("s4:papan") - 0.1, b: K.s5 + 0.4 },
    { s: label("PASAK"), p: [4.5, 1.0, 7.2], a: A("s4:pasak") - 0.05, b: K.s5 + 0.4 },
  ];

  // ---------- animals, two by two
  const ANIM = [];
  const animal = (kind, col) => {
    const P = { elephant: [2.3, 1.45, 1.25, 1.0, 0.38, 0.35, 0.25, 0.9], giraffe: [1.5, 0.8, 0.6, 1.7, 0.15, 2.0, 1.25, 0.4], camel: [1.8, 0.85, 0.7, 1.4, 0.16, 1.0, 0.65, 0.38], horse: [1.7, 0.8, 0.6, 1.1, 0.15, 0.9, 0.85, 0.42], lion: [1.6, 0.75, 0.62, 0.62, 0.17, 0.25, 0.3, 0.48], sheep: [1.0, 0.7, 0.62, 0.45, 0.12, 0.15, 0.4, 0.32] }[kind];
    const [L, Hb, W, leg, lw, nl, na, hs] = P;
    const G = new THREE.Group(); G.rotation.order = "YZX"; scene.add(G);
    const m = std(col, 0.85, 0, { flatShading: true }), dk = std(C(col).multiplyScalar(0.55), 0.85, 0, { flatShading: true });
    const body = kind === "sheep" ? mesh(new THREE.IcosahedronGeometry(0.62, 0), m) : mesh(new THREE.BoxGeometry(L, Hb, W), m);
    if (kind === "sheep") body.scale.set(1.0, 0.7, 0.7);
    body.position.y = leg + Hb / 2; G.add(body);
    const legs = [];
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const p = new THREE.Group(); p.position.set(sx * (L / 2 - lw), leg, sz * (W / 2 - lw / 2)); p.add(mesh(new THREE.BoxGeometry(lw, leg, lw), kind === "sheep" ? dk : m).translateY(-leg / 2)); G.add(p); legs.push(p); }
    const neck = new THREE.Group(); neck.position.set(L / 2 - 0.1, leg + Hb * 0.75, 0); neck.rotation.z = na; G.add(neck);
    if (nl > 0.05) neck.add(mesh(new THREE.BoxGeometry(nl, Math.min(0.42, Hb * 0.5), Math.min(0.36, W * 0.55)), m).translateX(nl / 2));
    const head = mesh(new THREE.BoxGeometry(hs * 1.3, hs, hs * 0.85), kind === "sheep" ? dk : m); head.position.x = nl + hs * 0.4; neck.add(head); head.rotation.z = -na * 0.9;
    if (kind === "elephant") { const tr = mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.0, 6), m); tr.position.set(nl + hs * 0.9, -0.55, 0); neck.add(tr); for (const s of [-1, 1]) neck.add(mesh(new THREE.BoxGeometry(0.1, 0.7, 0.6), m).translateX(nl + 0.1).translateZ(s * 0.5)); }
    if (kind === "camel") G.add(mesh(new THREE.SphereGeometry(0.42, 8, 6), m).translateY(leg + Hb + 0.05));
    if (kind === "lion") { const mn = mesh(new THREE.BoxGeometry(0.5, 0.85, 0.85), dk); mn.position.set(nl + 0.05, 0, 0); neck.add(mn); }
    return { G, legs, stride: 1.1 * leg + 0.6 };
  };
  const SPEC = [["elephant", 0x7c7c76], ["giraffe", 0xcfa257], ["camel", 0xb98c55], ["horse", 0x5d3d24], ["lion", 0xc58b3a], ["sheep", 0xe6dfcf]];
  SPEC.forEach(([kind, col], j) => { for (const side of [-1, 1]) { const a = animal(kind, col); a.j = j; a.side = side; ANIM.push(a); } });
  const P0 = [0, 44], P1 = [0, 13.4];
  const sill = new THREE.Vector3(0, 2.3 + CRADLE, 3.75);
  const seg1 = P0[1] - P1[1], seg2 = Math.hypot(P1[1] - sill.z, sill.y), pathEnd = seg1 + seg2 + 2.5;
  const animStart = A("s5:sepasang");
  const pathAt = (s, xoff) => {
    if (s < seg1) { const z = P0[1] - s, x = xoff; return [x, H(x, z), z, 0]; }
    if (s < seg1 + seg2) { const u = (s - seg1) / seg2; return [xoff, -0.1 + u * (sill.y + 0.1), P1[1] - u * (P1[1] - sill.z), Math.atan2(sill.y, P1[1] - sill.z)]; }
    return [xoff, sill.y, sill.z - (s - seg1 - seg2), 0];
  };

  // ---------- water, foam, rain, springs, lightning
  const WG = new THREE.PlaneGeometry(760, 760, 150, 150); WG.rotateX(-Math.PI / 2);
  const wpos = WG.attributes.position, WN = wpos.count;
  const WX = new Float32Array(WN), WZ = new Float32Array(WN), WH = new Float32Array(WN);
  for (let i = 0; i < WN; i++) { WX[i] = wpos.getX(i); WZ[i] = wpos.getZ(i); WH[i] = H(WX[i], WZ[i]); }
  const waterM = new THREE.MeshStandardMaterial({ color: 0x1f6a66, roughness: 0.28, metalness: 0.15, flatShading: true, transparent: true, opacity: 0.94 });
  const water = new THREE.Mesh(WG, waterM); water.frustumCulled = false; water.receiveShadow = true; scene.add(water);
  const wave = (x, z, t) => (Math.sin(0.15 * x + 0.05 * z - 1.25 * t) + 0.7 * Math.sin(0.06 * x - 0.12 * z - 0.85 * t + 1.7) + 0.3 * Math.sin(0.29 * x + 0.26 * z - 2.0 * t)) / 2.0;
  const Wk = [
    [0, -2], [K.s5 + 0.5, -2], [A("s5:mata") + 0.5, 0.2], [A("s5:berlabuh") + 0.6, 1.3], [K.s6 + 1.5, 4.2], [A("s6:anaknya"), 6.4],
    [A("s6:Gelombang"), 8.6], [A("s6:Gelombang") + 1.3, 10.6], [K.s7, 12.4], [A("s7:berhentilah") + 0.5, 16.2], [A("s7:berlabuh"), 13.9],
    [A("s7:Kapal"), 12.2], [K.s8, 10.3], [K.dur, 8.6],
  ];
  const W = curve(Wk.map(([a, b]) => [a, b]));
  const AMP = curve([[0, 0.1], [K.s5, 0.15], [K.s5e, 0.5], [A("s6:gelombang"), 2.6], [A("s6:Gelombang") + 0.5, 2.5], [K.s7 + 1, 1.5], [A("s7:berlabuh"), 0.35], [K.s8, 0.16], [K.dur, 0.12]]);
  const FOAMN = 1400, foam = pts(scene, FOAMN, { color: 0xd8efe9, size: 0.55, opacity: 0.8, add: false });
  const fseed = Array.from({ length: FOAMN }, () => [rnd(), rnd()]);
  const RAINN = 2600;
  const rainG = new THREE.BufferGeometry(); const rainP = new Float32Array(RAINN * 6);
  rainG.setAttribute("position", new THREE.BufferAttribute(rainP, 3));
  const rainM = new THREE.LineBasicMaterial({ color: 0xaebdc8, transparent: true, opacity: 0 });
  const rain = new THREE.LineSegments(rainG, rainM); rain.frustumCulled = false; scene.add(rain);
  const rseed = Array.from({ length: RAINN }, () => [rnd(), rnd(), rnd()]);
  const SPR = [[-9, 18], [10, 20], [-20, -4], [16, -6], [-4, 30], [24, 10], [-30, 16], [4, -20]].map(([x, z]) => [x, H(x, z), z]);
  const SPRN = 1100, spring = pts(scene, SPRN, { color: 0xbfe8e2, size: 0.38, opacity: 0.85, add: false });
  const spseed = Array.from({ length: SPRN }, (_, i) => [i % SPR.length, rnd(), rnd() * Math.PI * 2, 0.6 + rnd() * 0.6]);
  const LT = K.LT;
  const flashAt = (t) => { let f = 0; for (const x of LT) { const d = t - x; if (d >= 0 && d < 1.2) f += Math.exp(-d * 9) + 0.55 * (d > 0.13 ? Math.exp(-(d - 0.13) * 11) : 0); } return Math.min(1.4, f); };
  const boltG = new THREE.BufferGeometry(); const bq = mulberry(3), bp3 = [];
  let bx = 0, by = 0;
  for (let i = 0; i < 18; i++) { const nx = bx + (bq() - 0.5) * 7, ny = by - 5; bp3.push(bx, by, 0, nx, ny, 0); if (i % 5 === 2) bp3.push(nx, ny, 0, nx + (bq() - 0.3) * 10, ny - 8, 0); bx = nx; by = ny; }
  boltG.setAttribute("position", new THREE.Float32BufferAttribute(bp3, 3));
  const bolt = new THREE.LineSegments(boltG, new THREE.LineBasicMaterial({ color: 0xe6eeff, transparent: true, opacity: 0, fog: false, toneMapped: false }));
  bolt.frustumCulled = false; scene.add(bolt);

  // ---------- ark travel: from the build site to the Judi hilltop
  const tGo = K.s6 - 0.3, tArrive = A("s7:berhentilah");
  const arkXZ = (t) => { const u = smooth((t - tGo) / (tArrive - tGo)); return [JUDI[0] * u, JUDI[1] * u]; };
  const footY = (x, z, yaw) => { let m = -1e9; for (const s of [-10, -5, 0, 5, 10]) m = Math.max(m, H(x + Math.cos(yaw) * s, z - Math.sin(yaw) * s)); return m; };
  const arkState = (t) => {
    const [x, z] = arkXZ(t);
    const yaw = (Math.PI / 4) * smooth((t - tGo) / 3.5) + 0.05 * Math.sin(t * 0.4) * clamp01(t - tGo);
    const w = W(t), amp = AMP(t);
    const dmp = clamp01((w - H(x, z)) / 5);
    const fl = w + amp * wave(x, z, t) * dmp - 1.2;
    const rest = t < tGo ? CRADLE : Math.max(CRADLE, footY(x, z, yaw) + 0.05);
    const y = Math.max(fl, rest);
    const afloat = clamp01((fl - rest) / 0.6);
    const cx = Math.cos(yaw), sx = Math.sin(yaw);
    const pitch = Math.atan((wave(x + cx * 6, z - sx * 6, t) - wave(x - cx * 6, z + sx * 6, t)) / 12 * amp * dmp) * 0.9 * afloat;
    const roll = Math.atan((wave(x + sx * 3, z + cx * 3, t) - wave(x - sx * 3, z - cx * 3, t)) / 6 * amp * dmp) * 0.6 * afloat;
    return { x, z, y, yaw, pitch, roll, afloat };
  };
  // separating wave between the ark and the son's hill
  const tSep = A("s6:Gelombang");
  const Pa = arkXZ(tSep), nSep = [SON[0] - Pa[0], SON[1] - Pa[1]], DSep = Math.hypot(...nSep); nSep[0] /= DSep; nSep[1] /= DSep;
  const crestC = (t) => DSep * (0.3 + 0.78 * smooth((t - tSep + 0.2) / 2.2));
  const crestH = (t) => 6.5 * Math.sin(Math.PI * clamp01((t - tSep + 0.3) / 3.0));
  const crest = (x, z, t, ch, cc) => { if (ch <= 0) return 0; const dx = x - Pa[0], dz = z - Pa[1]; const al = dx * nSep[0] + dz * nSep[1], la = -dx * nSep[1] + dz * nSep[0]; return ch * Math.exp(-((al - cc) ** 2) / 40) * Math.exp(-(la * la) / 900); };

  // ---------- camera: world track until the ark sails, then a track relative to the ark
  const CUT = K.s6 - 0.05;
  const camA = track([
    [0, BOARD[0], 12.0, BOARD[1] + 22, BOARD[0], 12.4, BOARD[1]],
    [A("s1:Selama"), BOARD[0] - 1, 8.5, BOARD[1] + 38, BOARD[0], 7.6, BOARD[1]],
    [A("s1:kaumnya") + 0.6, -6, 26, 46, -26, 1, 0],
    [A("s1:sedikit"), -27, 6.5, 20, -14, 2.2, 3],
    [K.s1e, -28, 6, 18, -15, 2.2, 3],
    [K.s2 + 1.5, -10, 15, 34, -36, 2.5, 3],
    [A("s2:Tapi"), -18, 9.5, 24, -39, 2.8, 2],
    [K.s2e, -22, 6.5, 18, -40, 2.3, 2.5],
    [K.s3 + 1.6, -36, 9, 31, -23, 0.8, 8],
    [A("s3:Nuh"), -32, 8, 29, -19, 1.2, 6.5],
    [K.s3e, -26, 6, 23, -15.5, 2.0, 5],
    [K.s4 + 1.3, 26, 17, 44, 0, 4, 0],
    [A("s4:membangun"), 30, 13, 36, 0, 4, 0],
    [A("s4:Setiap") + 0.5, 22, 9, 40, -3, 4, 6],
    [A("s4:Surah"), 16, 9, 34, 0, 3.5, 3],
    [A("s4:papan"), 12, 7, 27, 1, 3, 3],
    [K.s4e, 10, 6.5, 25, 2, 3, 3],
    [K.s5 + 1.2, 20, 24, 64, 0, 7, 0],
    [A("s5:bumi"), 28, 13, 52, 0, 4, 6],
    [A("s5:sepasang"), 15, 7, 36, 0, 3.5, 11],
    [A("s5:Naiklah"), 11, 7.5, 32, 0, 3.8, 8],
    [CUT, 9, 9, 40, 0, 4.5, 4],
  ]);
  // offsets from the ark (x, z) and from the water/rest height
  const camB = track([
    [CUT, 9, 9, 40, 0, 4.5, 4],
    [A("s6:gelombang"), 16, 9, 38, 0, 4, 0],
    [A("s6:Nuh"), 6, 10, 40, 0, 4, 0],
    [K.s7 + 0.5, 4, 13, 42, 0, 4, 0],
    [A("s7:berhentilah"), 26, 13, 50, 0, 5, 0],
    [A("s7:berlabuh"), 42, 12, 46, 0, 6.5, 0],
    [A("s7:Kapal"), 46, 11, 44, 0, 7.5, -1],
    [K.s8, 50, 8.5, 50, 0, 8, 0],
    [K.end, 58, 7.5, 58, 0, 9, 0],
    [K.dur, 60, 7.5, 60, 0, 9, 0],
  ]);
  const tRef = A("s7:Air");
  const yRef = (t) => (t < tRef ? W(t) : Math.max(W(t), JUDI_TOP + 1.2));
  const look = new THREE.Vector3(), fwd = new THREE.Vector3();
  const tmpC = new THREE.Color();

  return (t) => {
    // ---- ark first: the camera follows it after the cut
    const S = arkState(t);
    let c;
    if (t < CUT) c = camA(t);
    else {
      const o = camB(t), yr = yRef(t); c = [S.x + o[0], yr + o[1], S.z + o[2], S.x + o[3], yr + o[4], S.z + o[5]];
      // over the ark's shoulder toward the son's hill
      const ws = ramp(t, A("s6:Nuh") - 0.8, A("s6:Nuh") + 0.9) * (1 - ramp(t, K.s7 - 0.3, K.s7 + 1.8));
      if (ws > 0) {
        let dx = SON[0] - S.x, dz = SON[1] - S.z; const dl = Math.hypot(dx, dz); dx /= dl; dz /= dl;
        const sc = [S.x - dx * 36 - dz * 12, yr + 19, S.z - dz * 36 + dx * 12, S.x + dx * 22, yr + 1.5, S.z + dz * 22];
        c = c.map((v, i) => v + (sc[i] - v) * ws);
      }
    }
    const shake = 0.12 * flashAt(t) + 0.25 * clamp01(AMP(t) - 1.2) * (t > K.s6 && t < K.s7 + 2 ? 1 : 0);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.3, c[1] + Math.sin(t * 0.29) * 0.2 + Math.sin(t * 7.3) * shake * 0.1, c[2] + Math.cos(t * 0.31) * 0.3);
    look.set(c[3], c[4], c[5]);
    cam.lookAt(look);
    sky.position.copy(cam.position);

    // ---- light state
    for (let i = 0; i < cur.length; i++) { if (i < 6) cur[i].copy(STV.dusk[i]); else cur[i] = STV.dusk[i]; }
    sdir.set(...SD.dusk);
    const t2 = K.s2 + 0.2, P = 1.7;
    const e2 = ramp(t, K.s2 - 0.3, K.s2 + 0.5) * (1 - ramp(t, A("s2:Tapi") - 0.5, A("s2:Tapi") + 0.4));
    const cyc = 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - t2)) / P);
    const wStorm = ramp(t, K.s5 - 1.2, K.s5 + 1.8) * (1 - ramp(t, A("s7:berhentilah") - 0.6, A("s7:Air") + 1.2));
    const wGold = ramp(t, A("s7:berhentilah") - 0.6, A("s7:Air") + 1.2) * (1 - ramp(t, K.s8 - 1, K.s8 + 3));
    const wDawn = ramp(t, K.s8 - 1, K.s8 + 3);
    const wNight3 = 0.45 * ramp(t, K.s3 - 0.5, K.s3 + 1) * (1 - ramp(t, K.s4, K.s4 + 1.5));
    blend("night", wNight3);
    blend("day", e2 * (1 - cyc)); blend("night", e2 * cyc);
    blend("storm", wStorm); blend("gold", wGold); blend("dawn", wDawn);
    const sunAng = (2 * Math.PI * (t - t2)) / P;
    if (e2 > 0) sdir.lerp(sdTmp.set(Math.sin(sunAng) * 0.8, Math.cos(sunAng) * 0.9, 0.35), e2);
    sdir.lerp(sdTmp.set(...SD.storm), wStorm).lerp(sdTmp.set(...SD.gold), wGold).lerp(sdTmp.set(...SD.dawn), wDawn).normalize();
    const fl = flashAt(t);
    skyU.top.value.copy(cur[0]); skyU.hor.value.copy(cur[1]); skyU.cloud.value.copy(cur[2]); skyU.sunCol.value.copy(cur[3]);
    skyU.cov.value = cur[8]; skyU.gold.value = cur[9] * (sdir.y > -0.05 ? 1 : 0); skyU.flash.value = fl; skyU.time.value = t; skyU.sunDir.value.copy(sdir);
    scene.fog.color.copy(cur[1]).multiplyScalar(0.92); scene.fog.density = cur[10];
    hemi.color.copy(cur[4]); hemi.groundColor.copy(cur[5]); hemi.intensity = cur[6] + fl * 2.2;
    sun.color.copy(cur[3]); sun.intensity = cur[7] * clamp01(sdir.y * 4 + 0.3);
    sun.target.position.set(c[3], 0, c[5]); sun.position.copy(sun.target.position).addScaledVector(sdir, 150);
    const nightAmt = e2 * cyc + wNight3;
    for (let i = 0; i < 420; i++) { const [a, el] = sseed[i]; stars.pos.set([cam.position.x + Math.cos(a) * Math.cos(el) * 480, cam.position.y + Math.sin(el) * 480, cam.position.z + Math.sin(a) * Math.cos(el) * 480], i * 3); }
    stars.m.opacity = clamp01(nightAmt * 1.4 - 0.2); stars.commit();
    const dark = clamp01(1.15 - cur[6]);

    // ---- tally board pegs
    for (let i = 0; i < 1000; i++) {
      const col = i % 25, row = Math.floor(i / 25);
      PV.set(-3.6 + col * 0.3, 1.45 + row * 0.3, 0.3); PE.set(0, 0, 0); PS.set(1, 1, 1);
      if (row >= 38) {
        const j = i - 950, d = t - (pegAt + j * 0.012);
        if (d > 0) {
          const [sx, sy, sp] = pegSeed[j];
          PV.x += sx * 2.2 * d; PV.y += (1.6 + sy) * d - 4.9 * d * d; PV.z += (2.2 + sp * 1.5) * d;
          PE.set(d * (6 + sp * 8), d * 3 * sx, d * 5);
          if (PV.y < -2) PS.set(0.001, 0.001, 0.001);
        }
      }
      PQ.setFromEuler(PE); PM.compose(PV, PQ, PS); PEG.setMatrixAt(i, PM);
    }
    PEG.instanceMatrix.needsUpdate = true;
    BRASS.emissive.setHex(0x3a2508); BRASS.emissiveIntensity = 0.6 * (1 - ramp(t, K.s2, K.s2 + 1));

    // ---- villagers: turn their backs, then pull their cloth over their heads
    const vis = t < K.s5 - 0.2;
    for (const v of VILLAGERS) {
      v.G.visible = vis;
      const turn = eout((t - A("s2:menyumbat") - v.k * 0.6) / 0.7);
      v.G.rotation.y = v.base + Math.PI * turn;
      const ear = ramp(t, A("s2:menyumbat") + v.k * 0.6, A("s2:menyumbat") + v.k * 0.6 + 0.5) * (1 - ramp(t, A("s2:menutupi") - 0.2, A("s2:menutupi") + 0.3));
      v.arms[0].rotation.z = -0.12 - 2.45 * ear; v.arms[1].rotation.z = 0.12 + 2.45 * ear;
      v.hood.scale.setScalar(Math.max(0.001, back((t - A("s2:menutupi") - v.k * 0.5) / 0.5)));
    }
    // elders gather facing the lantern (s3), then five of them pass the build site (s4)
    const gIn = eout((t - K.s3 + 1.4) / 2.2);
    const passA = A("s4:Setiap") - 1.6;
    ELDERS.forEach((e, k) => {
      if (t < K.s4) {
        e.G.visible = t > K.s3 - 1.5;
        const x = e.home[0] + (e.gath[0] - e.home[0]) * gIn, z = e.home[1] + (e.gath[1] - e.home[1]) * gIn;
        e.G.position.set(x, H(x, z), z);
        e.G.rotation.y = gIn < 0.95 ? Math.atan2(e.gath[0] - e.home[0], e.gath[1] - e.home[1]) * (1 - gIn) + face(e.G, LAMP[0], LAMP[1]) * gIn : face(e.G, LAMP[0], LAMP[1]);
        const pt = (k === 2 || k === 6) ? ramp(t, A("s3:mengejek") - 0.2, A("s3:mengejek") + 0.3) * (1 - ramp(t, A("s3:Nuh") - 0.3, A("s3:Nuh"))) : 0;
        e.arms[1].rotation.set(-1.25 * pt, 0, 0.12);
        e.G.position.y += Math.sin(t * 5 + k) * 0.03 * (1 - gIn);
      } else {
        e.G.visible = k < 5 && t > passA && t < K.s5 - 0.2;
        const x = -24 + 2.4 * (t - passA) + k * 1.7, z = 15.5 + (k % 2) * 0.6;
        e.G.position.set(x, H(x, z) + Math.abs(Math.sin((t - passA) * 6 + k)) * 0.06, z);
        e.G.rotation.y = Math.PI / 2 - 0.9 * ramp(t, A("s4:mengejeknya") - 1.2, A("s4:mengejeknya") - 0.6);
        e.arms[1].rotation.set(k === 1 || k === 3 ? -1.2 * ramp(t, A("s4:mengejeknya") - 0.8, A("s4:mengejeknya") - 0.3) : 0, 0, 0.12);
      }
    });
    // the son on his hill, until the wave closes between them
    const ch = t > K.s6 - 1 && t < K.s7 + 2 ? crestH(t) : 0, cc = crestC(t);
    SONF.G.visible = t > K.s6 - 0.2 && t < K.s7 && cc < DSep - 3.5;
    SONF.G.rotation.y = face(SONF.G, S.x, S.z) + Math.PI * 0.85;

    // ---- lantern + believers' small lights
    const lampOn = 1 - ramp(t, K.s5 - 0.5, K.s5 + 0.6);
    lampLight.intensity = (12 + 34 * dark) * lampOn * (1 + 0.6 * ramp(t, A("s3:Upahku"), A("s3:Upahku") + 0.8) * (1 - ramp(t, K.s4, K.s4 + 1)));
    LAMPCORE.emissiveIntensity = 2.2 + 2.5 * dark + 0.3 * Math.sin(t * 9);
    L1.visible = lampOn > 0.02;
    const bOn = ramp(t, A("s1:sedikit") - 0.2, A("s1:sedikit") + 0.4), board_ = A("s5:orang-orang");
    for (let i = 0; i < 7; i++) {
      const [bx0, bz0] = bseed[i];
      let x = bx0, z = bz0, y = H(bx0, bz0) + 1.15 + Math.sin(t * 2 + i) * 0.05;
      const u = clamp01((t - board_ - i * 0.25) / 1.6);
      if (u > 0) { const sx = 1.9 * (i % 2 ? 1 : -1); if (u < 0.5) { const v = u / 0.5; x = bx0 + (sx - bx0) * v; z = bz0 + (13.4 - bz0) * v; y = H(x, z) + 1.15; } else { const v = (u - 0.5) / 0.5; x = sx; z = 13.4 - v * (13.4 - 3.8); y = 1.2 + v * (sill.y + 0.1); } }
      const hide = t < A("s1:sedikit") - 0.2 || u >= 1;
      believers.pos.set([x, hide ? -50 : y, z], i * 3);
    }
    believers.m.opacity = bOn; believers.commit();

    // ---- ark
    ARK.position.set(S.x, S.y, S.z); ARK.rotation.set(S.roll, S.yaw, S.pitch);
    for (const b of BUILD) {
      const u1 = smooth((t - b.t0) / b.d), u2 = clamp01((t - b.t0 - b.d - b.hold) / 0.2);
      const snap = u2 * u2 * u2;
      const ex = PV.copy(b.p1).add(b.ex);
      b.m.position.copy(b.p0).lerp(ex, u1); b.m.position.y += Math.sin(Math.PI * u1) * 2.5 * (1 - u2);
      if (u2 > 0) b.m.position.copy(ex).lerp(b.p1, snap);
      b.m.rotation.set(b.r0[0] + (b.r1[0] - b.r0[0]) * u1, b.r0[1] + (b.r1[1] - b.r0[1]) * u1, b.r0[2] + (b.r1[2] - b.r0[2]) * u1);
    }
    const doorOpen = ramp(t, K.s5 + 0.3, K.s5 + 1.6) * (1 - ramp(t, A("s5:berlabuh") + 0.1, A("s5:berlabuh") + 0.9));
    if (t > doorB.t0 + doorB.d + doorB.hold + 0.2) DOOR.rotation.x = 1.35 * doorOpen;
    RAMP.visible = doorOpen > 0.01 && t < K.s6;
    RAMP.scale.set(1, 1, Math.max(0.001, doorOpen));
    bow.visible = t > tBow; bow.scale.setScalar(Math.max(0.001, back((t - tBow) / 0.5)));
    deckLight.intensity = (14 + 30 * dark) * ramp(t, tBow, tBow + 0.6);
    // pegs and hammer
    for (let i = 0; i < PEGPOS.length; i++) {
      const [x, y] = PEGPOS[i], ts = HS[i];
      const out = 1 - eout((t - ts) / 0.08);
      const sh = Math.max(0.001, back((t - ts + 0.5) / 0.25));
      PM.compose(PV.set(x, y, 3.61 + 0.04 + 0.32 * out), PQ.identity(), PS.set(sh, sh, sh));
      DOW.setMatrixAt(i, PM);
    }
    DOW.instanceMatrix.needsUpdate = true;
    const hOn = t > HS[0] - 1.2 && t < K.s5 + 0.2;
    HAM.visible = hOn;
    if (hOn) {
      let i = 0; while (i < HS.length - 1 && t > HS[i]) i++;
      const tPrev = i > 0 ? HS[i - 1] : HS[0] - 1.0, seg = Math.max(0.05, HS[i] - tPrev), u = clamp01((t - tPrev) / seg);
      const pa = PEGPOS[Math.max(0, i - 1)], pb = PEGPOS[i];
      const mv = smooth(u / 0.6);
      let ang = u < 0.72 ? 0.95 * smooth(u / 0.45) : 0.95 * (1 - ((u - 0.72) / 0.28) ** 2);
      if (t > HS[HS.length - 1]) { const d = t - HS[HS.length - 1]; ang = 0.95 * smooth(d / 0.4); HAM.position.set(pb[0], pb[1] + d * 2.5, 3.61 + 1.55 + d * 0.5); }
      else HAM.position.set(pa[0] + (pb[0] - pa[0]) * mv, pa[1] + (pb[1] - pa[1]) * mv + 0.02, 3.61 + 1.55);
      hamArm.rotation.x = ang;
      HAM.scale.setScalar(Math.max(0.001, (1 - ramp(t, K.s5 - 0.6, K.s5)) * back((t - HS[0] + 1.2) / 0.4)));
    }
    for (const L of LABELS) { const v = back((t - L.a) / 0.35) * (1 - ramp(t, L.b - 0.3, L.b)); L.s.visible = v > 0.01; L.s.position.set(...L.p); L.s.scale.set(5.2 * v, 1.3 * v, 1); }

    // ---- animals
    for (const a of ANIM) {
      const s = 5 * (t - (animStart + a.j * 0.7)) + 27;
      const big = a.j === 0 ? 0.82 : 0.78;
      const [x, y, z, pitch] = pathAt(s, a.side * big);
      a.G.visible = t > K.s5 - 0.3 && s < pathEnd;
      a.G.position.set(x, y, z); a.G.rotation.set(0, Math.PI / 2, pitch);
      const ph = (s / a.stride) * Math.PI * 2 + (a.side > 0 ? 0.6 : 0);
      a.legs.forEach((l, k) => { l.rotation.z = Math.sin(ph + (k === 0 || k === 3 ? 0 : Math.PI)) * 0.45; });
    }

    // ---- water
    const w = W(t), amp = AMP(t);
    water.visible = w > -1.5;
    if (water.visible) {
      for (let i = 0; i < WN; i++) {
        const dm = clamp01((w - WH[i]) / 5);
        wpos.setY(i, w + amp * wave(WX[i], WZ[i], t) * dm + crest(WX[i], WZ[i], t, ch, cc));
      }
      wpos.needsUpdate = true;
      tmpC.setHex(0x1f6a66).lerp(C(0x2b3c40), wStorm * 0.55).lerp(C(0x3a8a80), wGold * 0.4 + wDawn * 0.5);
      waterM.color.copy(tmpC);
    }
    // foam on crests around the look point
    const fOn = clamp01((amp - 0.3) / 0.8) * (w > 1 ? 1 : 0);
    for (let i = 0; i < FOAMN; i++) {
      const [a, b] = fseed[i];
      const x = c[3] + ((((a * 140 - c[3]) % 140) + 140) % 140) - 70, z = c[5] + ((((b * 140 - c[5]) % 140) + 140) % 140) - 70;
      const wv = wave(x, z, t), dm = clamp01((w - H(x, z)) / 5);
      const y = w + amp * wv * dm + crest(x, z, t, ch, cc);
      foam.pos.set([x, wv > 0.45 && fOn > 0 && dm > 0.5 ? y + 0.12 : -80, z], i * 3);
    }
    foam.m.opacity = 0.75 * fOn; foam.commit();
    // rain sheets
    const Rn = ramp(t, A("s5:langit") - 0.3, A("s5:terbuka") + 0.6) * (1 - ramp(t, A("s7:berhentilah") - 0.2, A("s7:berhentilah") + 0.8));
    rain.visible = Rn > 0.01;
    if (rain.visible) {
      const span = 90, Hh = 50, sheet = 0.6 + 0.4 * Math.sin(t * 1.3);
      for (let i = 0; i < RAINN; i++) {
        const [a, b, d] = rseed[i];
        const x = cam.position.x + ((((a * span - cam.position.x) % span) + span) % span) - span / 2;
        const z = cam.position.z + ((((b * span - cam.position.z) % span) + span) % span) - span / 2;
        const y = cam.position.y + 22 - (((t * 38 + d * Hh) % Hh));
        rainP.set([x, y, z, x - 0.5, y - 2.4, z + 0.2], i * 6);
      }
      rainG.attributes.position.needsUpdate = true;
      rainM.opacity = 0.42 * Rn * sheet + 0.12 * Rn;
    }
    // springs bursting out of the ground
    const spOn = ramp(t, A("s5:menyemburkan") - 0.2, A("s5:menyemburkan") + 0.4) * (1 - ramp(t, K.s6 - 1, K.s6 + 0.5));
    for (let i = 0; i < SPRN; i++) {
      const [k, ph, az, sp] = spseed[i];
      const [x0, y0, z0] = SPR[k];
      const u = ((t * 0.9 * sp + ph) % 1), tt = u * 1.6;
      const r = 1.2 * sp * tt;
      const y = y0 + 9 * sp * tt - 4.9 * tt * tt;
      spring.pos.set([x0 + Math.cos(az) * r, spOn > 0 && y > y0 - 0.2 ? y0 + (y - y0) * spOn : -60, z0 + Math.sin(az) * r], i * 3);
    }
    spring.m.opacity = 0.85 * spOn; spring.commit();
    // lightning bolt
    bolt.material.opacity = clamp01(fl - 0.25);
    if (fl > 0.25) {
      cam.getWorldDirection(fwd);
      let li = 0; for (let k = 0; k < LT.length; k++) if (t >= LT[k]) li = k;
      const side = li % 2 ? 1 : -1;
      bolt.position.set(cam.position.x + fwd.x * 180 + fwd.z * side * 60, cam.position.y + 70, cam.position.z + fwd.z * 180 - fwd.x * side * 60);
      bolt.lookAt(cam.position.x, bolt.position.y, cam.position.z); bolt.scale.setScalar(1.3);
    }

    bp.strength = 0.25 + 0.35 * dark + 0.3 * fl;
    comp.render();
  };
}
