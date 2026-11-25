// LAB UJI LOMPAT: a pastel low-poly jump test field. World units are studs; the avatar is 5 studs tall.
// Every jump is real ballistics, y = v*t - g*t^2/2, with v = sqrt(2*196.2*7.2). Jump list and walk path come from build-video.mjs via K.J / K.X.
// Illustration only, no Roblox assets. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, box, cyl, stage, avatar, runPose, restPose } from "./lib3d.js";

const C = { sky: 0xbfe3ff, mint: 0x8fd6a8, sand: 0xf4e1b5, org: 0xff8a3d, navy: 0x1e2a4a, blue: 0x3b82f6, mag: 0xe0457b, white: 0xfffdf7, moon: 0xc3c6cf, moon2: 0xa4a8b4 };
const flat = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, flatShading: true });
const GY = 0.04; // top of the sand lane
const AG = 0.1; // arrow length per m/s^2
const BS = 0.2; // bar height (studs) per m/s^2
const NAVY = "#1E2A4A";

// ground height, deterministic so props can sit on it
const hgt = (x, z) => {
  const az = Math.abs(z);
  let y = 0;
  if (az > 10) y += 0.17 * (Math.sin(x * 1.7 + z * 2.3) + Math.sin(x * 0.63 - z * 1.1) + 2) * Math.min(1, (az - 10) / 6);
  if (z < -60) y += (-z - 60) * 0.16 * (0.55 + 0.45 * Math.sin(x * 0.021 + 1.3) * Math.sin(x * 0.007 + 0.4));
  return y;
};

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: C.sky, fog: 0.003, exp: 1.0, bloom: [0.03, 0.3, 0.98] });
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fd8b4, 1.55));
  const sun = new THREE.DirectionalLight(0xfff3dc, 2.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 170 });
  sun.shadow.bias = -0.0005; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const rnd = mulberry(4404);
  const A = (k) => AT[k];
  const X = K.X, J = K.J;
  try { document.fonts.load('800 60px Syne'); document.fonts.load('800 60px "JetBrains Mono"'); } catch (e) {}

  // ---------- canvas labels that repaint once the web fonts are ready
  const painters = [];
  let fontsOk = false;
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
  function canvasMesh(w, h, size, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d");
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const paint = () => { g.clearRect(0, 0, w, h); draw(g, w, h); tx.needsUpdate = true; };
    paint(); painters.push(paint);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, (size * h) / w), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
    scene.add(m);
    return m;
  }
  // lines: [text, font, lineHeight]
  function pill(lines, bg, fg, size, W = 640) {
    const Hh = 46 + lines.reduce((s, l) => s + l[2], 0);
    return canvasMesh(W, Hh, size, (g, w) => {
      let mw = 0;
      lines.forEach(([tx, f]) => { g.font = f; mw = Math.max(mw, g.measureText(tx).width); });
      const bw = Math.min(w - 8, mw + 64), x = (w - bw) / 2;
      g.fillStyle = NAVY; rr(g, x, 12, bw, Hh - 12, 30); g.fill();
      g.fillStyle = bg; rr(g, x, 0, bw, Hh - 12, 30); g.fill();
      g.strokeStyle = NAVY; g.lineWidth = 7; rr(g, x + 3.5, 3.5, bw - 7, Hh - 19, 27); g.stroke();
      g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
      let y = 17;
      lines.forEach(([tx, f, lh]) => { g.font = f; g.fillText(tx, w / 2, y + lh / 2 + 2); y += lh; });
    });
  }
  const MONO = (px) => `800 ${px}px "JetBrains Mono", monospace`;
  const SYNE = (px) => `800 ${px}px Syne, sans-serif`;

  // ---------- lights of the field: ground, sand lane, moon patch
  const gg = new THREE.PlaneGeometry(1100, 440, 220, 88); gg.rotateX(-Math.PI / 2); gg.translate(180, 0, -70);
  const gp = gg.attributes.position, gc = new Float32Array(gp.count * 3);
  const cA = new THREE.Color(C.mint), cB = new THREE.Color(0x79c795), cH = new THREE.Color(0x67b98a), tmp = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i);
    gp.setY(i, hgt(x, z));
    tmp.copy(cA).lerp(cB, rnd() * 0.55).lerp(cH, clamp01((-z - 50) / 90) * 0.7);
    gc[i * 3] = tmp.r; gc[i * 3 + 1] = tmp.g; gc[i * 3 + 2] = tmp.b;
  }
  gg.setAttribute("color", new THREE.BufferAttribute(gc, 3)); gg.computeVertexNormals();
  const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
  ground.receiveShadow = true; scene.add(ground);
  const lane = box(420, 0.08, 7, flat(C.sand, 0.95), 160, 0, 0); lane.castShadow = false; scene.add(lane);
  const lineM = flat(0xffffff, 0.8);
  for (const z of [-3.15, 3.15]) { const l = box(192, 0.03, 0.22, lineM, 256, 0.05, z); l.castShadow = false; scene.add(l); }
  const startL = box(0.5, 0.03, 6.3, flat(C.mag, 0.7), 160, 0.05, 0); startL.castShadow = false; scene.add(startL);
  // moon patch: grey low-poly disk with craters
  const MX = 356;
  const moonDisk = cyl(13, 13.2, 0.14, 14, flat(C.moon, 0.95), MX, 0.05, 0); moonDisk.castShadow = false; scene.add(moonDisk);
  for (let i = 0; i < 9; i++) {
    const a = rnd() * 6.28, d = 3 + rnd() * 8.5, s = 0.8 + rnd() * 1.1;
    const cx = MX + Math.cos(a) * d, cz = Math.sin(a) * d * 0.8;
    if (Math.abs(cx - 352) < 2.5 && Math.abs(cz) < 2) continue;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(s, s * 0.28, 4, 9), flat(C.moon2, 0.95));
    ring.rotation.x = -Math.PI / 2; ring.scale.z = 0.6; ring.position.set(cx, 0.13, cz); ring.receiveShadow = true; scene.add(ring);
    const pit = new THREE.Mesh(new THREE.CircleGeometry(s * 0.85, 9), flat(0x9a9eaa, 1)); pit.rotation.x = -Math.PI / 2; pit.position.set(cx, 0.125, cz); scene.add(pit);
  }
  const skyMoon = new THREE.Mesh(new THREE.IcosahedronGeometry(9, 1), new THREE.MeshStandardMaterial({ color: 0xf1f2f7, emissive: 0xdfe3ee, emissiveIntensity: 0.45, flatShading: true, roughness: 1, fog: false }));
  skyMoon.position.set(MX + 16, 40, -150); scene.add(skyMoon);

  // trees, bushes, clouds
  const treeCols = [0x5fb886, 0x4fa374, 0x86cfa0, 0x6cc08f];
  for (let i = 0; i < 110; i++) {
    const x = -70 + rnd() * 500, z = -15 - rnd() * 85, h = 4 + rnd() * 7, r = 1.4 + rnd() * 1.7;
    const tg = new THREE.Group(); tg.position.set(x, hgt(x, z) - 0.2, z);
    cyl(0.35, 0.45, h * 0.36, 5, flat(0xb98a5e), 0, h * 0.18, 0, tg);
    const cn = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), flat(treeCols[i % 4])); cn.position.y = h * 0.36 + h / 2 - 0.4; cn.castShadow = true; tg.add(cn);
    tg.rotation.y = rnd() * 6; scene.add(tg);
  }
  for (let i = 0; i < 80; i++) {
    const front = i % 2 === 0, x = -40 + rnd() * 440, z = front ? 9 + rnd() * 9 : -9.5 - rnd() * 4, s = 0.6 + rnd() * 0.8;
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), flat(treeCols[(i + 1) % 4])); b.scale.set(s * 1.3, s, s * 1.1); b.position.set(x, hgt(x, z) + s * 0.5, z); b.rotation.y = rnd() * 3; b.castShadow = true; scene.add(b);
  }
  const clouds = [];
  for (let i = 0; i < 18; i++) {
    const cg = new THREE.Group(), n = 3 + (i % 3);
    for (let k = 0; k < n; k++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + rnd() * 3, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25 })); p.position.set(k * 4.2 - n * 2, rnd() * 2, rnd() * 3); cg.add(p); }
    cg.position.set(-80 + i * 30 + rnd() * 12, 34 + rnd() * 34, -170 - rnd() * 40); scene.add(cg); clouds.push([cg, cg.position.x]);
  }

  // ---------- s1: gravity arrows with planet badges
  function arrow(color) {
    const G = new THREE.Group(), m = flat(color, 0.55);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1, 6), m); sh.castShadow = true; G.add(sh);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 6), m); hd.rotation.x = Math.PI; hd.castShadow = true; G.add(hd);
    scene.add(G);
    return { G, m, set(L) { G.visible = L > 0.04; const k = Math.min(1, L / 1.25); hd.scale.setScalar(Math.max(0.01, k)); const s = Math.max(0.02, L - 1.2 * k); sh.scale.y = s; sh.position.y = -s / 2; hd.position.y = -s - 0.6 * k; } };
  }
  const arB = arrow(C.blue), arM = arrow(C.mag);
  arB.G.position.set(-3.8, 6.0, 0); arM.G.position.set(3.8, 6.0, 0);
  const earthG = new THREE.IcosahedronGeometry(0.8, 1); const ec = [];
  for (let i = 0; i < earthG.attributes.position.count; i++) { const c = new THREE.Color(rnd() < 0.35 ? C.mint : C.blue); ec.push(c.r, c.g, c.b); }
  earthG.setAttribute("color", new THREE.Float32BufferAttribute(ec, 3));
  const earth = new THREE.Mesh(earthG, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.7 })); earth.castShadow = true; scene.add(earth);
  const rplanet = new THREE.Group(); box(1.3, 1.3, 1.3, flat(C.mag, 0.5), 0, 0, 0, rplanet); cyl(0.32, 0.32, 0.25, 10, flat(C.mag, 0.5), 0, 0.77, 0, rplanet); scene.add(rplanet);

  // ---------- s2: the stud cube, the tape and the ruler pole
  const cubeG = new THREE.Group(); box(1, 1, 1, flat(C.mag, 0.5), 0, 0, 0, cubeG); cyl(0.3, 0.3, 0.2, 10, flat(C.mag, 0.5), 0, 0.6, 0, cubeG); scene.add(cubeG);
  const TX = 42.2, PX = 45.5;
  const tape = box(0.5, 1, 0.08, flat(C.org, 0.6), TX, 0, 0.3); scene.add(tape);
  const ticks = [];
  for (let k = 1; k <= 8; k++) { const tk = box(0.75, 0.07, 0.12, flat(C.navy, 0.6), TX, GY + k, 0.33); scene.add(tk); ticks.push(tk); }
  const housing = box(0.95, 0.55, 0.95, flat(C.navy, 0.5), TX, GY + 0.275, -0.35); scene.add(housing);
  for (let k = 0; k < 8; k++) { box(1.4, 0.98, 1.4, flat(k % 2 ? C.org : C.white, 0.6), PX, GY + k + 0.5, 0, scene); }
  cyl(0.38, 0.38, 0.22, 10, flat(C.org, 0.6), PX, GY + 8.11, 0, scene);
  const eqDash = [];
  for (let k = 0; k < 3; k++) { const d = box(0.24, 0.06, 0.06, flat(C.navy, 0.6), 41.2 + k * 0.36, GY + 1, 0.3); scene.add(d); eqDash.push(d); }
  const lStud = pill([["1 STUD", SYNE(96), 110]], "#E0457B", "#FFFFFF", 1.45); lStud.position.set(40.5, 2.05, 0.7);
  const lCm = pill([["28 CM", SYNE(96), 110]], "#FF8A3D", NAVY, 1.35); lCm.position.set(43.75, 1.45, 0.8);

  // ---------- s3/s4: comparison bars, ghost stack, document page
  const BX = [80, 85, 90], PL = 0.3;
  BX.forEach((x) => box(3, PL, 3, flat(C.navy, 0.6), x, PL / 2, 0, scene));
  const barM = box(2.4, 1, 2.4, flat(C.mag, 0.45), BX[0], 0, 0); scene.add(barM);
  const barE = box(2.4, 1, 2.4, flat(C.blue, 0.45), BX[1], 0, 0); scene.add(barE);
  const barO = box(2.4, 1, 2.4, flat(C.org, 0.45), BX[2], 0, 0); scene.add(barO);
  const HM = 54.936 * BS, HE = 9.8 * BS, HO = 35 * 0.28 * BS;
  const ghost = [];
  const ratio = 54.936 / 9.8;
  for (let k = 1; k < Math.ceil(ratio); k++) {
    const hk = Math.min(1, ratio - k) * HE;
    const m = box(2.4, hk - 0.06, 2.4, flat(k % 2 ? 0x6fa3f8 : C.blue, 0.45), BX[1], 0, 0); scene.add(m);
    ghost.push({ m, base: PL + HE * k + 0.03, h: hk - 0.06, k });
  }
  const lMa = pill([["196,2", MONO(124), 136], ["stud/s²", SYNE(64), 76]], "#E0457B", "#FFFFFF", 4.2);
  const lMb = pill([["54,9", MONO(124), 136], ["m/s² ROBLOX", SYNE(60), 76]], "#E0457B", "#FFFFFF", 4.2);
  const lE = pill([["9,8", MONO(124), 136], ["m/s² BUMI", SYNE(60), 76]], "#3B82F6", "#FFFFFF", 4.2);
  const lO = pill([["35", MONO(124), 136], ["REALISTIS", SYNE(60), 76]], "#FF8A3D", NAVY, 4.2);
  // document page
  const docG = new THREE.Group(); scene.add(docG);
  const pageFace = canvasMesh(440, 580, 4.4, (g, w, h) => {
    g.fillStyle = "#FFFDF7"; g.fillRect(0, 0, w, h);
    g.fillStyle = NAVY; g.fillRect(0, 0, w, 86);
    g.fillStyle = "#fff"; g.font = SYNE(40); g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("DOKUMENTASI", 26, 46);
    g.fillStyle = NAVY; g.font = SYNE(30); g.fillText("Satuan & fisika", 26, 128);
    g.fillStyle = "#C9CCD6"; [176, 204, 232].forEach((y, i) => g.fillRect(26, y, [360, 300, 330][i], 12));
    g.fillStyle = NAVY; g.font = MONO(30); g.fillText("1 stud = 28 cm", 26, 282);
    g.fillStyle = "#C9CCD6"; g.fillRect(26, 316, 280, 12);
    g.fillStyle = "#FF8A3D"; rr(g, 18, 352, w - 36, 150, 18); g.fill();
    g.fillStyle = NAVY; g.font = SYNE(28); g.fillText("Gravitasi realistis", 36, 386);
    g.font = MONO(64); g.fillText("35 stud/s²", 36, 452);
    g.fillStyle = "#C9CCD6"; g.fillRect(26, 530, 240, 12);
    g.strokeStyle = NAVY; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  });
  scene.remove(pageFace); docG.add(pageFace); pageFace.position.set(0, 2.9 + 0.35, 0.08);
  box(4.6, 6.0, 0.12, flat(C.navy, 0.7), 0, 3.25, 0, docG);
  const leg = box(0.25, 3.6, 0.25, flat(C.navy, 0.7), 0, 1.6, -1.1, docG); leg.rotation.x = 0.55;
  docG.position.set(74.6, GY, -2.5);

  // ---------- s5: door frame and the 7.2 stud line
  const DX = 125, frameM = flat(C.white, 0.6);
  box(0.5, 7.2, 0.7, frameM, DX - 1.7, GY + 3.6, -0.4, scene); box(0.5, 7.2, 0.7, frameM, DX + 1.7, GY + 3.6, -0.4, scene); box(3.9, 0.5, 0.7, frameM, DX, GY + 7.45, -0.4, scene);
  const doorP = new THREE.Group(); doorP.position.set(DX - 1.45, GY, -0.4); scene.add(doorP);
  box(2.9, 7.1, 0.2, flat(C.navy, 0.55), 1.45, 3.55, 0, doorP); cyl(0.14, 0.14, 0.3, 8, flat(C.org, 0.4), 2.5, 3.5, 0.2, doorP).rotation.x = Math.PI / 2;
  doorP.rotation.y = -0.75;
  function dashLine(x0, x1, y, z, col, w = 0.12) { const arr = []; for (let x = x0; x < x1; x += 1.0) { const d = box(0.6, w, w, flat(col, 0.5), x + 0.3, y, z); d.castShadow = false; scene.add(d); arr.push(d); } return arr; }
  const line72 = dashLine(114.5, 128.2, GY + 7.2, 0.9, C.org, 0.14);
  const l72 = pill([["7,2 STUD", MONO(78), 92], ["≈ 2 M", SYNE(66), 78]], "#FF8A3D", NAVY, 2.5); l72.position.set(129.4, GY + 7.2, 0.9);

  // ---------- s6: four-storey building, morphing gravity arrow, 40 stud line
  const BLD = new THREE.Group(); BLD.position.set(171, 0, -4); scene.add(BLD);
  box(10, 39.4, 8, flat(C.sand, 0.9), 0, 19.7, 0, BLD);
  for (let s = 1; s < 4; s++) box(10.3, 0.5, 8.3, flat(C.org, 0.7), 0, s * 10, 0, BLD);
  box(10.6, 0.8, 8.6, flat(C.navy, 0.7), 0, 39.8, 0, BLD);
  const glass = flat(0x9fd3ff, 0.25), wf = flat(C.white, 0.6);
  for (let s = 0; s < 4; s++) for (let w = 0; w < 3; w++) {
    if (s === 0 && w === 1) { box(2.4, 6, 0.3, flat(C.mag, 0.5), 0, 3, 4.05, BLD); continue; }
    box(2.4, 4, 0.2, wf, -3.2 + w * 3.2, s * 10 + 5, 4.02, BLD); box(1.9, 3.4, 0.2, glass, -3.2 + w * 3.2, s * 10 + 5, 4.1, BLD);
    box(0.2, 4, 2.2, wf, -5.02, s * 10 + 5, -2.6 + w * 2.6, BLD).scale.z = 0.9; box(0.2, 3.4, 1.7, glass, -5.1, s * 10 + 5, -2.6 + w * 2.6, BLD);
  }
  const arS = arrow(C.mag); arS.G.position.set(156.4, 7.0, 0);
  const H40 = (53.15 * 53.15) / 70;
  const line40 = dashLine(156.5, 176.5, H40, 0.9, C.org, 0.22);
  const l40 = pill([["≈ 40 STUD", MONO(80), 94], ["≈ 11 M", SYNE(66), 78]], "#FF8A3D", NAVY, 3.6); l40.position.set(168.2, H40 + 2.2, 0.9);

  // ---------- s7: flags every 16 studs (one second of walking)
  for (let i = 0; i < 12; i++) {
    const x = 176 + i * 16; cyl(0.12, 0.12, 4, 6, flat(C.white, 0.6), x, 2, -4.4, scene);
    const f = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1.2, 0), new THREE.Vector3(1.8, -0.6, 0)]), new THREE.MeshStandardMaterial({ color: i % 2 ? C.org : C.mag, side: THREE.DoubleSide, flatShading: true }));
    f.geometry.computeVertexNormals(); f.position.set(x + 0.1, 3.95, -4.4); scene.add(f);
  }

  // ---------- avatar
  const H = avatar({ skin: 0xf5cd30, shirt: C.org, pants: C.navy, make: (c) => flat(c, 0.6) });
  scene.add(H.G);

  // ---------- jump trails (feet), one dot strip per jump
  const ND = 40, NJ = J.length;
  const dotM = new THREE.MeshBasicMaterial({ toneMapped: false });
  const DOTS = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), dotM, ND * NJ);
  DOTS.frustumCulled = false; scene.add(DOTS);
  const kindCol = [new THREE.Color(C.mag), new THREE.Color(C.org), new THREE.Color(0xffffff)];
  const kindR = [0.24, 0.5, 0.3];
  for (let j = 0; j < NJ; j++) for (let i = 0; i < ND; i++) DOTS.setColorAt(j * ND + i, kindCol[J[j][3]]);
  DOTS.instanceColor.needsUpdate = true;

  // ---------- motion helpers
  const xAt = (t) => {
    if (t <= X[0][0]) return X[0][1];
    for (let i = 0; i < X.length - 1; i++) { const a = X[i][0], b = X[i + 1][0]; if (t <= b) return b > a ? X[i][1] + ((X[i + 1][1] - X[i][1]) * (t - a)) / (b - a) : X[i + 1][1]; }
    return X[X.length - 1][1];
  };
  const jumpAt = (t) => J.find((j) => t >= j[0] && t <= j[5]);
  const yAt = (t) => { const j = jumpAt(t); if (!j) return 0; const u = t - j[0]; return Math.max(0, j[1] * u - (j[2] * u * u) / 2); };
  const baseY = (x) => (x > MX - 13 ? 0.12 : GY);
  const dummy = new THREE.Object3D();
  const tThrow = A("s2:satu") - 0.35, cube0 = 20, cubeHeld = 7.0;
  const cy0 = 6.6, cyL = GY + 0.5, vy0 = 8, tauT = (vy0 + Math.sqrt(vy0 * vy0 + 2 * 196.2 * (cy0 - cyL))) / 196.2;
  const vxT = (40.5 - 37) / tauT;

  // ---------- camera: base keys plus follow shots for the realistic jumps and the run
  const camBase = track([
    [0, 2.5, 6.5, 36, 0, 3.9, 0], [5.5, -1.5, 5.6, 31, 0, 3.6, 0],
    [8.2, 36, 6, 30, 39.5, 4, 0], [10.1, 41.4, 3.0, 13.5, 41.9, 1.95, 0], [13.1, 41.8, 2.6, 12, 42.0, 1.7, 0], [16.6, 41.5, 7, 33, 42.5, 4.6, 0],
    [20.2, 84, 9.5, 53, 84.6, 7.2, 0], [31.6, 85, 8.8, 50, 85, 7.2, 0], [34.0, 82.6, 9, 57, 82.6, 7.4, 0], [41.2, 82.9, 9, 55, 82.8, 7.4, 0],
    [44.6, 122, 8, 44, 122.5, 6.6, 0], [54.2, 123, 8, 42, 122.6, 6.6, 0],
    [57.4, 160, 8, 42, 161.5, 7, 0], [58.4, 158.8, 6, 30, 158.4, 4.6, 0], [60.7, 160, 5.6, 33, 160, 4.6, 0],
    [80.8, 355, 7.6, 37, 354.5, 6.2, 0], [88.6, 355, 7.9, 32, 354, 6.1, 0], [91.4, 355, 8, 30, 354, 6, 0],
  ]);
  const lerp6 = (o, p, w) => { for (let i = 0; i < 6; i++) o[i] += p[i] * w; };

  return (t) => {
    if (!fontsOk && document.fonts && document.fonts.check('800 40px Syne') && document.fonts.check('800 40px "JetBrains Mono"')) { fontsOk = true; painters.forEach((p) => p()); }
    const ax = xAt(t), ay = yAt(t), aj = jumpAt(t);

    // camera blend weights (sum to 1)
    const a = ramp(t, 60.7, 61.2), b = ramp(t, 64.35, 64.85), c = ramp(t, 67.0, 67.9), d = ramp(t, 79.9, 80.8);
    const pb = camBase(t), P = [0, 0, 0, 0, 0, 0];
    lerp6(P, pb, 1 - a + d);
    if (a - b > 0) lerp6(P, [163.5, 1.6 + 0.72 * ay, 38, 161, 4.6 + 0.86 * ay, 0], a - b);
    if (b - c > 0) lerp6(P, [166, 36, 42, 166, 41.5, 0], b - c);
    if (c - d > 0) lerp6(P, [ax + 10, 6.4, 30, ax + 1.4, 3.6, 0], c - d);
    cam.position.set(P[0], P[1], P[2]); cam.lookAt(P[3], P[4], P[5]);
    sun.position.set(P[3] + 26, P[4] + 46, 30); sun.target.position.set(P[3], P[4] - 4, 0);
    clouds.forEach(([g, x0]) => { g.position.x = x0 + t * 0.7; });

    // s1 arrows and badges
    const tg = A("s1:gravitasinya"), te = A("s1:enam");
    arB.set(9.8 * AG * eout((t - tg) / 0.5)); arM.set(54.936 * AG * eout((t - tg - 0.15) / 0.7));
    const pulse = 1 + 0.25 * Math.sin(Math.PI * clamp01((t - te) / 0.5));
    arM.G.scale.set(pulse, 1, pulse);
    earth.position.set(-3.8, 6.95 + Math.sin(t * 2) * 0.12, 0); earth.rotation.y = t * 0.8;
    rplanet.position.set(3.8, 6.85 + Math.sin(t * 2 + 1) * 0.12, 0); rplanet.rotation.y = -t * 0.8;

    // s2 cube: rests, is carried, is thrown (same gravity), squashes on landing
    let cx = cube0, cyy = cyL, cs = 1;
    if (t >= cubeHeld && t < tThrow) { cx = ax; cyy = cy0; }
    else if (t >= tThrow) {
      const u = Math.min(t - tThrow, tauT);
      cx = 37 + vxT * u; cyy = cy0 + vy0 * u - 98.1 * u * u;
      const s = clamp01((t - tThrow - tauT) / 0.22); cs = 1 - 0.25 * Math.sin(Math.PI * s);
    }
    cubeG.position.set(cx, Math.max(cyL, cyy) - (1 - cs) * 0.5, 0); cubeG.scale.set(1 + (1 - cs) * 0.6, cs, 1 + (1 - cs) * 0.6);
    cubeG.rotation.z = t >= tThrow && t < tThrow + tauT ? -(t - tThrow) * 9 : 0;
    const len = 1 * eout((t - A("s2:dua")) / 0.5) + 7 * eout((t - A("s2:Dari")) / 1.6);
    tape.scale.y = Math.max(0.01, len); tape.position.y = GY + len / 2;
    ticks.forEach((k, i) => { k.visible = len >= i + 1 - 0.02; });
    lStud.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s2:satu")) / 0.35), 2)));
    lCm.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s2:dua") - 0.2) / 0.35), 2)));
    eqDash.forEach((e, i) => { e.visible = t > A("s2:dua") + 0.4 + i * 0.08; });

    // s3/s4 bars
    const tsr = A("s3:seratus"), tli = A("s3:lima"), tbu = A("s3:Bumi"), tha = A("s3:Hampir"), tti = A("s4:tiga");
    const setBar = (m, h, x) => { m.visible = h > 0.02; m.scale.y = Math.max(0.01, h); m.position.set(x, PL + h / 2, 0); };
    const hM = HM * eout((t - tsr) / 1.1), hE = HE * eout((t - tbu) / 0.6), hO = HO * eout((t - tti) / 0.6);
    setBar(barM, hM, BX[0]); setBar(barE, hE, BX[1]); setBar(barO, hO, BX[2]);
    ghost.forEach((g) => {
      const t0 = tha - 0.2 + 0.17 * (g.k - 1), u = t - t0;
      const out = clamp01((t - K.s4 - 0.2 - 0.06 * g.k) / 0.3);
      g.m.visible = u > 0 && out < 1;
      const drop = Math.max(0, 12 - 98.1 * u * u);
      g.m.position.set(BX[1], g.base + g.h / 2 + drop, 0); g.m.scale.setScalar(Math.max(0.001, 1 - back(out, 2) * 0.999));
    });
    const sw1 = ramp(t, tli - 0.1, tli + 0.2), sw2 = ramp(t, tti, tti + 0.3);
    const lin = back(clamp01((t - tsr - 0.6) / 0.35), 2);
    lMa.scale.setScalar(Math.max(0.001, lin * (1 - sw1) + sw2)); lMb.scale.setScalar(Math.max(0.001, sw1 * (1 - sw2)));
    lMa.position.set(BX[0], PL + hM + 1.9, 1.4); lMb.position.set(BX[0], PL + hM + 1.9, 1.4);
    lE.scale.setScalar(Math.max(0.001, back(clamp01((t - tbu - 0.2) / 0.35), 2))); lE.position.set(BX[1], PL + hE + 1.9 + (t > tha && t < K.s4 + 0.6 ? 0 : 0), 1.4);
    lE.visible = !(t > tha - 0.25 && t < K.s4 + 0.4);
    lO.scale.setScalar(Math.max(0.001, back(clamp01((t - tti - 0.2) / 0.35), 2))); lO.position.set(BX[2], PL + hO + 1.9, 1.4);
    // document falls with Roblox gravity, squashes on its stand
    const tdk = A("s4:Dokumen") - 0.59, ud = t - tdk;
    docG.visible = ud > 0;
    const fall = Math.max(0, 34 - 98.1 * ud * ud), sq = Math.sin(Math.PI * clamp01((ud - 0.59) / 0.25));
    docG.position.y = GY + fall; docG.scale.set(1 + sq * 0.08, 1 - sq * 0.12, 1);

    // s5 line
    const t72 = A("s5:tujuh");
    line72.forEach((e, i) => { e.visible = t > t72 + i * 0.03; });
    l72.scale.setScalar(Math.max(0.001, back(clamp01((t - t72 - 0.3) / 0.35), 2)));

    // s6 arrow morphs from Roblox to realistic gravity, then the 40 stud line
    const tre = A("s6:realistis"), m6 = ramp(t, tre, tre + 0.7);
    arS.set((54.936 + (9.8 - 54.936) * m6) * AG * eout((t - K.s6 - 1.6) / 0.6));
    arS.m.color.set(C.mag).lerp(new THREE.Color(C.org), m6);
    arS.G.visible = arS.G.visible && t < A("s6:melambung") + 0.4;
    const t40 = A("s6:empat");
    line40.forEach((e, i) => { e.visible = t > t40 - 0.4 + i * 0.03; });
    l40.scale.setScalar(Math.max(0.001, back(clamp01((t - 64.75) / 0.35), 2)));

    // avatar
    const vx = (xAt(t + 0.04) - xAt(t - 0.04)) / 0.08;
    restPose(H);
    let ry = 0.35;
    if (t > K.s3 + 2 && t < K.s5 - 0.2) ry = 0.75;
    if (aj) {
      const u = (t - aj[0]) / (aj[5] - aj[0]);
      H.armL.rotation.x = H.armR.rotation.x = -2.7 + 0.5 * u; H.armL.rotation.z = -0.3; H.armR.rotation.z = 0.3;
      H.legL.rotation.x = -0.6 * Math.sin(Math.PI * u); H.legR.rotation.x = 0.35 * Math.sin(Math.PI * u);
    } else if (Math.abs(vx) > 2) { runPose(H, ax * 1.2566, t > 67.9 && t < 79.9 ? 1.15 : 1); ry = vx > 0 ? Math.PI / 2 : -Math.PI / 2; }
    if (t >= cubeHeld && t < tThrow + 0.15) { H.armL.rotation.x = H.armR.rotation.x = t < tThrow ? -3.0 : -3.0 + 1.6 * clamp01((t - tThrow) / 0.15); H.armL.rotation.z = H.armR.rotation.z = 0; }
    if (t > tThrow + 0.3 && t < K.s2e) { ry = 0.5; H.armR.rotation.z = 1.35 * eout((t - tThrow - 0.3) / 0.3); }
    if (t > tbu && t < tbu + 2.4) { H.armR.rotation.z = 1.2 * Math.sin(Math.PI * clamp01((t - tbu) / 2.4)); }
    const moonLand = J[J.length - 1][5];
    if (t > moonLand + 0.2) { ry = 0; H.armR.rotation.z = (2.4 + 0.45 * Math.sin(t * 7)) * eout((t - moonLand - 0.2) / 0.3); }
    if (t > 79.9 && t < J[J.length - 1][0]) ry = 0.2;
    H.G.rotation.y = ry;
    let sqA = 1;
    for (const j of J) {
      const pre = (t - (j[0] - 0.1)) / 0.1, post = (t - j[5]) / (j[3] === 1 ? 0.28 : 0.2);
      if (pre >= 0 && pre <= 1) sqA = Math.min(sqA, 1 - 0.12 * Math.sin(Math.PI * pre));
      if (post >= 0 && post <= 1) sqA = Math.min(sqA, 1 - (j[3] === 1 ? 0.24 : 0.16) * Math.sin(Math.PI * post));
    }
    H.G.scale.set(1 + (1 - sqA) * 0.5, sqA, 1 + (1 - sqA) * 0.5);
    H.G.position.set(ax, baseY(ax) + ay, 0);

    // trails
    for (let jj = 0; jj < NJ; jj++) {
      const j = J[jj], air = j[5] - j[0], r = kindR[j[3]];
      const fade = 1 - ramp(t, j[4] - 0.4, j[4]);
      for (let i = 0; i < ND; i++) {
        const tt = j[0] + (air * (i + 0.5)) / ND, u = t - tt;
        if (u < 0 || fade <= 0) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.001); }
        else { const xx = xAt(tt); dummy.position.set(xx, baseY(xx) + Math.max(0, j[1] * (tt - j[0]) - (j[2] * (tt - j[0]) ** 2) / 2) + 0.15, 0.05); dummy.scale.setScalar(Math.max(0.001, r * back(clamp01(u / 0.12), 2) * fade)); }
        dummy.updateMatrix(); DOTS.setMatrixAt(jj * ND + i, dummy.matrix);
      }
    }
    DOTS.instanceMatrix.needsUpdate = true;
    comp.render();
  };
}
