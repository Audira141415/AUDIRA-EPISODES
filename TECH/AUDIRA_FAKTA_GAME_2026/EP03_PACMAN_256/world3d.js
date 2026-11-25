// LABIRIN 1 BYTE: a raised neon maze floats in a black void, an 8-lamp binary register hangs above it on a circuit board.
// Original chomper, orb ghosts and low-poly fruit; no arcade sprites or logos. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, std, box, stage, pts, label } from "./lib3d.js";

const COL = { void: 0x050510, blue: 0x2b3bff, dot: 0xffe8c2, yel: 0xffd400, mag: 0xff2e88, cyan: 0x2ee6ff };
// Left half of our own maze; column 10 is the centre, the right half mirrors it.
const LH = [
  "###########", "#.........#", "#.###.###.#", "#o###.###.#", "#..........", "#.###.#.###", "#.....#...#", "#####.###.#",
  "    #.#....", "#####.#.###", "     .#.#  ", "#####.#.###", "    #.#....", "#####.#.###", "#.........#", "#.###.###.#",
  "#o..#......", "###.#.#.###", "#.....#...#", "#.#######.#", "#..........", "###########",
];
const MAZE = LH.map((l) => l + l.slice(0, 10).split("").reverse().join(""));
const NR = MAZE.length, NC = 21;
const X = (c) => c - 10, Z = (r) => r - 10.5;
const RY = 12, RZ = -20, LS = 1.55; // register height, depth, lamp spacing
const ODO = { y: 2.4, z: 17.5 };
const LET = { x: -1.2, y: 7.2, z: 4.5 };
const FROW = 12.4; // fruit row z

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: COL.void, fog: 0.0065, exp: 1.0, bloom: [0.62, 0.45, 0.6], shadow: false });
  scene.add(new THREE.HemisphereLight(0x6b7cff, 0x050510, 0.35));
  const key = new THREE.DirectionalLight(0xc8d0ff, 0.55); key.position.set(-8, 30, 20); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff2e88, 0.5); rim.position.set(14, 6, -20); scene.add(rim);
  const glow = new THREE.PointLight(COL.yel, 3, 5, 1.8); scene.add(glow);
  const rnd = mulberry(30256);
  const a = (k) => AT[k];

  // ---------- void dust ----------
  const DUST = 520, dust = pts(scene, DUST, { color: 0x6f7dff, size: 0.22, opacity: 0.75 });
  const dd = []; for (let i = 0; i < DUST; i++) dd.push([rnd() * 120 - 60, rnd() * 70 - 25, rnd() * 120 - 70, rnd() * 6.28]);
  dd.forEach((d, i) => { const c = new THREE.Color([0x2b3bff, 0x2ee6ff, 0xff2e88, 0xffe8c2][i % 4]).multiplyScalar(0.55); dust.col.set([c.r, c.g, c.b], i * 3); });

  // ---------- floor slab ----------
  const FW = 23, FZ0 = -11.6, FZ1 = 14.2, FD = FZ1 - FZ0;
  const floorT = canvasTex(920, Math.round(FD * 40), (g, w, h) => {
    g.fillStyle = "#070718"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(43,59,255,.16)"; g.lineWidth = 2;
    for (let i = 0; i <= FW; i++) { g.beginPath(); g.moveTo(i * 40 + 20, 0); g.lineTo(i * 40 + 20, h); g.stroke(); }
    for (let j = 0; j <= FD; j++) { g.beginPath(); g.moveTo(0, j * 40 + 4); g.lineTo(w, j * 40 + 4); g.stroke(); }
    g.fillStyle = "rgba(46,230,255,.10)"; g.fillRect(0, (11.5 - FZ0) * 40, w, 3);
  });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(FW, 0.7, FD), [0, 0, 1, 0, 0, 0].map((_, i) => (i === 2 ? new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.6, emissive: 0xffffff, emissiveMap: floorT, emissiveIntensity: 0.9 }) : std(0x0a0a26, 0.5, 0.2, { emissive: 0x1a22aa, emissiveIntensity: 0.45 }))));
  slab.position.set(0, -0.35, (FZ0 + FZ1) / 2); scene.add(slab);
  const edgeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.blue).multiplyScalar(2.2), toneMapped: false });
  box(FW + 0.2, 0.08, 0.08, edgeM, 0, 0.02, FZ0); box(FW + 0.2, 0.08, 0.08, edgeM, 0, 0.02, FZ1);
  box(0.08, 0.08, FD, edgeM, -FW / 2, 0.02, (FZ0 + FZ1) / 2); box(0.08, 0.08, FD, edgeM, FW / 2, 0.02, (FZ0 + FZ1) / 2);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(43,59,255,.42)"); gr.addColorStop(1, "rgba(43,59,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  under.rotation.x = -Math.PI / 2; under.position.set(0, -4, 1); scene.add(under);

  // ---------- walls + dots ----------
  const walls = [], dots = [];
  for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) { const ch = MAZE[r][c]; if (ch === "#") walls.push({ c, r }); else if (ch === "." || ch === "o") dots.push({ c, r, big: ch === "o" }); }
  const wallM = new THREE.MeshStandardMaterial({ color: 0x05072a, emissive: COL.blue, emissiveIntensity: 0.22, roughness: 0.4, metalness: 0.3 });
  const capM = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.blue).multiplyScalar(1.9), toneMapped: false });
  const IW = new THREE.InstancedMesh(new THREE.BoxGeometry(0.94, 0.72, 0.94), wallM, walls.length);
  const IC = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.05, 0.3), capM, walls.length);
  IW.frustumCulled = IC.frustumCulled = false; scene.add(IW, IC);
  const dotM = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.dot).multiplyScalar(1.3), toneMapped: false });
  const ID = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), dotM, dots.length); ID.frustumCulled = false; scene.add(ID);

  // ---------- chomper ----------
  const CR = 0.44;
  const CHM = new THREE.MeshStandardMaterial({ color: COL.yel, emissive: COL.yel, emissiveIntensity: 0.22, roughness: 0.35 });
  const inM = new THREE.MeshBasicMaterial({ color: 0x3a0612, side: THREE.DoubleSide });
  const CH = new THREE.Group(); scene.add(CH);
  const jaw = (up) => {
    const j = new THREE.Group(); CH.add(j);
    j.add(new THREE.Mesh(new THREE.SphereGeometry(CR, 36, 18, 0, Math.PI * 2, up ? 0 : Math.PI / 2, Math.PI / 2), CHM));
    const cap = new THREE.Mesh(new THREE.CircleGeometry(CR * 0.995, 32), inM); cap.rotation.x = -Math.PI / 2; j.add(cap);
    return j;
  };
  const jU = jaw(true), jL = jaw(false);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x050510 });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), eyeM); e.position.copy(new THREE.Vector3(0.18, 0.62, 0.62 * s).normalize().multiplyScalar(CR * 0.98)); jU.add(e); }

  // ---------- orb ghosts (own design: orb body, bead skirt, halo ring) ----------
  const gCols = [0xff2e88, 0x3dffb0, 0xa66bff, 0xc6ff3d];
  const ghosts = gCols.map((c) => {
    const G = new THREE.Group(); scene.add(G);
    const m = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3, roughness: 0.3, transparent: true, opacity: 0.95 });
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16), m); b.scale.set(1, 1.12, 1); b.position.y = 0.62; G.add(b);
    const beads = []; for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), m); G.add(s); beads.push(s); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.025, 6, 30), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.6), toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; G.add(ring);
    const wm = new THREE.MeshBasicMaterial({ color: 0xffffff }), pm = new THREE.MeshBasicMaterial({ color: 0x0b0b2a });
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), wm); w.position.set(0.3, 0.74, 0.15 * s); G.add(w); const p = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), pm); p.position.set(0.4, 0.74, 0.15 * s); G.add(p); }
    return { G, beads, ring };
  });
  const loopG = [
    [[11, 1], [19, 1], [19, 4], [11, 4], [11, 1]],
    [[5, 14], [9, 14], [9, 16], [5, 16], [5, 14]],
    [[15, 18], [19, 18], [15, 18]],
    [[9, 10], [11, 10], [9, 10]],
  ];

  // ---------- fruit (low-poly, own shapes) ----------
  const fm = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.35, roughness: 0.45, flatShading: true });
  const geoMesh = (g, m, x, y, z, p) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); p.add(o); return o; };
  const fruit = (k) => {
    const G = new THREE.Group();
    if (k === 0) { geoMesh(new THREE.IcosahedronGeometry(0.17, 0), fm(0xe8213a), -0.13, 0.17, 0, G); geoMesh(new THREE.IcosahedronGeometry(0.17, 0), fm(0xe8213a), 0.13, 0.15, 0.04, G); const s = geoMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 4), fm(0x3dcb5a), 0, 0.42, 0, G); s.rotation.z = 0.3; }
    else if (k === 1) { const c = geoMesh(new THREE.ConeGeometry(0.24, 0.46, 6), fm(0xff3d5e), 0, 0.28, 0, G); c.rotation.x = Math.PI; geoMesh(new THREE.ConeGeometry(0.2, 0.1, 6), fm(0x3dcb5a), 0, 0.53, 0, G); }
    else if (k === 2) { geoMesh(new THREE.IcosahedronGeometry(0.25, 0), fm(0xff8a1a), 0, 0.27, 0, G); geoMesh(new THREE.BoxGeometry(0.14, 0.04, 0.08), fm(0x3dcb5a), 0.06, 0.53, 0, G); }
    else if (k === 3) { geoMesh(new THREE.DodecahedronGeometry(0.25, 0), fm(0xd81b2e), 0, 0.27, 0, G); geoMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 4), fm(0x7a4a26), 0, 0.56, 0, G); }
    else if (k === 4) { const m = geoMesh(new THREE.IcosahedronGeometry(0.28, 1), fm(0x3dcb5a), 0, 0.28, 0, G); m.scale.y = 0.82; }
    else if (k === 5) { geoMesh(new THREE.CylinderGeometry(0.1, 0.28, 0.38, 7), fm(0xffd400), 0, 0.3, 0, G); geoMesh(new THREE.IcosahedronGeometry(0.07, 0), fm(0xffe8c2), 0, 0.08, 0, G); }
    else { const t = geoMesh(new THREE.TorusGeometry(0.13, 0.045, 5, 10), fm(0x2ee6ff), 0, 0.52, 0, G); t.rotation.y = 0.4; geoMesh(new THREE.BoxGeometry(0.07, 0.36, 0.07), fm(0x2ee6ff), 0, 0.22, 0, G); geoMesh(new THREE.BoxGeometry(0.14, 0.05, 0.07), fm(0x2ee6ff), 0.06, 0.1, 0, G); }
    G.scale.setScalar(1.25); scene.add(G); return G;
  };
  const FX = (i) => -9.6 + i * 1.6;
  const row = []; for (let i = 0; i < 13; i++) row.push(fruit(i < 7 ? i : (i * 3) % 7));
  const tintM = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.mag).multiplyScalar(1.4), toneMapped: false, wireframe: true });
  const halos = []; for (let i = 7; i < 13; i++) { const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), tintM); scene.add(h); halos.push(h); }
  const fly = []; for (let i = 0; i < 26; i++) fly.push(fruit(i % 7));

  // ---------- garbage glyph tiles over the right half ----------
  const GLY = "#%&@$?!<>/=+*01ΣΩ¥§¤░▒▓".split("");
  const NT = 12, gm = [];
  for (let k = 0; k < NT; k++) {
    const tx = canvasTex(128, 128, (g, w) => { g.fillStyle = "#06061a"; g.fillRect(0, 0, w, w); for (let i = 0; i < 5; i++) { g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(rnd() * w, rnd() * w, 8 + rnd() * 40, 8); } g.fillStyle = "#fff"; g.font = "700 92px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(GLY[Math.floor(rnd() * GLY.length)], w / 2, w / 2 + 4); g.strokeStyle = "#fff"; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, w - 6); });
    const top = new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }), side = new THREE.MeshBasicMaterial({ color: 0x5a5a8a, toneMapped: false });
    gm.push([side, side, top, side, side, side]);
  }
  const cells = []; for (let r = 0; r < NR; r++) for (let c = 11; c < NC; c++) cells.push({ c, r, k: Math.floor(rnd() * NT), h: 0.25 + rnd() * 1.3, ph: rnd() * 6.28, col: [COL.mag, COL.cyan, COL.mag, COL.cyan, COL.yel, COL.blue][Math.floor(rnd() * 6)], d: (20 - c) * 0.55 + (21 - r) + rnd() * 1.8 });
  const byK = Array.from({ length: NT }, () => []);
  cells.forEach((x, i) => { x.slot = byK[x.k].length; byK[x.k].push(i); });
  const gBox = new THREE.BoxGeometry(0.96, 1, 0.96);
  const IG = byK.map((l, k) => { const m = new THREE.InstancedMesh(gBox, gm[k], Math.max(1, l.length)); m.frustumCulled = false; scene.add(m); return m; });
  const gTA = a("s4:Gambarnya") - 1.4, gTB = a("s4:acak") + 0.2;
  [...cells].sort((p, q) => p.d - q.d).forEach((x, i, arr) => { x.gT = gTA + ((gTB - gTA) * i) / (arr.length - 1); });
  const cellOf = new Map(cells.map((x) => [x.c + "," + x.r, x]));
  const hookEnd = K.s2 - 0.1;
  const broken = (t, x) => (x ? t < hookEnd || t >= x.gT : false);

  // ---------- register board + 8 lamps + carry ----------
  const reg = new THREE.Group(); reg.position.set(0, RY, RZ); scene.add(reg);
  const pcb = canvasTex(1024, 360, (g, w, h) => {
    g.fillStyle = "#040a14"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { let x = rnd() * w, y = rnd() * h; g.strokeStyle = `rgba(46,230,255,${0.12 + rnd() * 0.3})`; g.lineWidth = 2 + rnd() * 3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { if (s % 2) x += (rnd() - 0.5) * 300; else y += (rnd() - 0.5) * 200; g.lineTo(x, y); } g.stroke(); g.fillStyle = "rgba(255,212,0,.45)"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    g.strokeStyle = "rgba(43,59,255,.9)"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = "rgba(46,230,255,.8)"; g.font = "700 30px monospace"; g.fillText("REG · LEVEL", 30, 46);
  });
  const board = new THREE.Mesh(new THREE.BoxGeometry(14, 4.6, 0.4), [0, 0, 0, 0, 1, 0].map((_, i) => (i === 4 ? new THREE.MeshBasicMaterial({ map: pcb, toneMapped: false }) : std(0x0a1022, 0.4, 0.6)))); board.position.z = -0.3; reg.add(board);
  const frameM = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.cyan).multiplyScalar(1.6), toneMapped: false });
  const frame = new THREE.Group(); reg.add(frame);
  [[14.2, 0.09, 0, 2.35], [14.2, 0.09, 0, -2.35]].forEach(([w, h, x, y]) => box(w, h, 0.1, frameM, x, y, -0.05, frame));
  [[-7.1], [7.1]].forEach(([x]) => box(0.09, 4.8, 0.1, frameM, x, 0, -0.05, frame));
  const digT = (d, on) => canvasTex(128, 192, (g, w, h) => { g.fillStyle = on ? "#ffd400" : "#0c1030"; g.fillRect(0, 0, w, h); g.strokeStyle = on ? "#fff6c0" : "#2b3bff"; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = on ? "#1a1200" : "#3d4dff"; g.font = "700 140px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(d, w / 2, h / 2 + 8); });
  const T0 = digT("0", false), T1 = digT("1", true);
  const lamps = [];
  for (let i = 0; i < 8; i++) {
    const L = new THREE.Group(); L.position.set((i - 3.5) * LS, -0.2, 0); reg.add(L);
    box(1.3, 1.9, 0.4, std(0x10142c, 0.35, 0.7), 0, 0, -0.1, L);
    const faceOn = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.68), new THREE.MeshBasicMaterial({ map: T1, toneMapped: false }));
    const faceOff = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.68), new THREE.MeshBasicMaterial({ map: T0, toneMapped: false, color: 0xffffff }));
    faceOn.position.z = faceOff.position.z = 0.12; L.add(faceOn, faceOff);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); bulb.position.set(0, 1.25, 0.05); L.add(bulb);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.035, 6, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.cyan).multiplyScalar(2), toneMapped: false, transparent: true })); ring.scale.set(0.75, 1.1, 1); ring.position.z = 0.16; L.add(ring);
    lamps.push({ L, faceOn, faceOff, bulb, ring });
  }
  const carry = new THREE.Group(); scene.add(carry);
  box(1.1, 1.6, 0.35, new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.mag).multiplyScalar(1.5), toneMapped: false }), 0, 0, 0, carry);
  const cl = label("1", { w: 128, h: 192, font: "700 140px monospace", color: "#fff", size: 0.95 }); cl.position.z = 0.2; carry.add(cl);
  // cables from the board down to the maze, with data pulses
  const cab = [-5, -1.8, 1.8, 5].map((x) => [new THREE.Vector3(x, RY - 2.3, RZ), new THREE.Vector3(x * 1.3, 0.1, FZ0)]);
  const cabM = new THREE.MeshBasicMaterial({ color: new THREE.Color(COL.cyan).multiplyScalar(0.55), toneMapped: false, transparent: true, opacity: 0.6 });
  cab.forEach(([p, q]) => { const len = p.distanceTo(q); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 5), cabM); m.position.copy(p).lerp(q, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize()); scene.add(m); });
  const PUL = 24, pul = pts(scene, PUL, { color: COL.cyan, size: 0.55 });

  // ---------- odometer ----------
  const odo = new THREE.Group(); odo.position.set(0, ODO.y, ODO.z); scene.add(odo);
  box(13.2, 2.9, 1.6, std(0x0c1030, 0.35, 0.6, { emissive: 0x111a66, emissiveIntensity: 0.5 }), 0, 0, -0.5, odo);
  box(13.4, 0.08, 0.1, frameM, 0, 1.5, 0.32, odo); box(13.4, 0.08, 0.1, frameM, 0, -1.5, 0.32, odo);
  const strip = canvasTex(128, 1280, (g, w, h) => { g.fillStyle = "#f4ead2"; g.fillRect(0, 0, w, h); g.fillStyle = "#0b0b22"; g.font = "700 118px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; for (let d = 0; d < 10; d++) { g.fillText(String(d), w / 2, d * 128 + 70); g.fillStyle = "rgba(11,11,34,.18)"; g.fillRect(0, d * 128, w, 3); g.fillStyle = "#0b0b22"; } }, [1, 0.1]);
  const drums = [], DX = [-4.8, -2.8, -1.4, 0, 2.0, 3.4, 4.8];
  DX.forEach((x, i) => {
    const tx = strip.clone(); tx.needsUpdate = true; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(1, 0.1);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.75, 28, 1, true, -0.62, 1.24), new THREE.MeshBasicMaterial({ map: tx, color: 0x7d7668 }));
    d.rotation.z = 0; d.scale.set(1, 1, 1); d.position.set(x, 0, 0.2); odo.add(d); drums.push({ d, tx });
  });
  // flat curved fronts: the cylinder above is upright, so its texture v runs vertically and the strip scrolls like a drum
  [-3.8, 1.0].forEach((x) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: COL.yel, toneMapped: false })); s.position.set(x, -0.95, 1.1); odo.add(s); });

  // ---------- letter ----------
  const letT = canvasTex(600, 800, (g, w, h) => {
    g.fillStyle = "#f6efdc"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1b2550"; g.fillRect(40, 44, w - 80, 6); g.fillRect(40, 132, w - 80, 2);
    g.font = "700 40px serif"; g.textAlign = "center"; g.fillText("SURAT", w / 2, 106);
    g.textAlign = "left"; g.font = "italic 34px serif"; g.fillText("untuk Jeffrey Yee,", 50, 210);
    g.font = "700 30px monospace"; g.fillText("1982", w - 140, 210);
    g.strokeStyle = "rgba(27,37,80,.5)"; g.lineWidth = 4;
    for (let i = 0; i < 7; i++) { const y = 270 + i * 46, e = i === 6 ? 300 : w - 60 - (i % 3) * 40; g.beginPath(); g.moveTo(50, y); for (let x = 50; x < e; x += 16) g.lineTo(x, y + Math.sin(x * 0.21 + i) * 3); g.stroke(); }
    g.fillStyle = "#c81e4a"; g.font = "700 64px monospace"; g.fillText("6 JUTA+", 50, 650);
    g.strokeStyle = "#1b2550"; g.lineWidth = 3; g.beginPath(); g.moveTo(330, 720); g.bezierCurveTo(380, 660, 400, 760, 440, 700); g.bezierCurveTo(470, 670, 500, 740, 550, 705); g.stroke();
  });
  const pg = new THREE.PlaneGeometry(4.8, 6.4, 16, 4); const pp = pg.attributes.position;
  for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.sin((pp.getX(i) / 4.8 + 0.5) * Math.PI) * 0.25 - Math.pow(pp.getY(i) / 6.4, 2) * 0.4);
  pg.computeVertexNormals();
  const letter = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: letT, side: THREE.DoubleSide, color: 0x8e887c })); scene.add(letter);
  // question mark from a torus arc, a stem and a dot
  const qm = new THREE.Group(); scene.add(qm);
  const qM = new THREE.MeshStandardMaterial({ color: 0xff2e5a, emissive: 0xff2e5a, emissiveIntensity: 0.9, roughness: 0.3 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.28, 12, 32, Math.PI * 1.45), qM); arc.rotation.z = -Math.PI * 0.42; arc.position.y = 1.5; qm.add(arc);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.8, 14), qM); stem.position.y = 0.25; qm.add(stem);
  const qd = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), qM); qd.position.y = -0.75; qm.add(qd);
  const qLab = label("level 256?", { w: 640, h: 128, font: "700 84px monospace", color: "#ff2e88", size: 4.6 }); scene.add(qLab);

  // ---------- timing ----------
  const naik = a("s2:naik"), tNol = a("s3:nol"), tLew = a("s3:Lewat"), tItu = a("s3:itu"), tKem = a("s3:kembali"), tMel = a("s4:meluap");
  const regVal = (t) => {
    if (t < K.s2) return 255;
    if (t < naik) return 1;
    if (t < K.s3) return 2;
    if (t < tNol) return 0;
    if (t < tLew) return Math.min(254, Math.floor(254 * Math.pow(clamp01((t - tNol) / (tLew - 0.25 - tNol)), 1.7)));
    if (t < tItu) return 254;
    if (t < tKem) return 255;
    if (t < K.s4) return 0;
    if (t < tMel) return 255;
    return 0;
  };
  const tDraw = a("s4:menggambar"), tTuj = a("s4:tujuh"), tDraw2 = a("s4:menggambar#2");
  const fruitN = (t) => {
    if (t < K.s2) return 7;
    if (t < naik + 0.3) return 1;
    if (t < tDraw) return 2;
    if (t < tTuj + 0.3) return 1 + Math.floor(clamp01((t - tDraw) / (tTuj + 0.3 - tDraw)) * 6.999);
    if (t < tDraw2) return 7;
    return 7 + Math.min(6, Math.floor((t - tDraw2) / 0.14) + 1);
  };

  // ---------- chomper path ----------
  const poly = (P, u) => {
    const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(l); tot += l; }
    let d = clamp01(u) * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const k = L[i] ? Math.min(1, d / L[i]) : 0; return [P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + (P[i + 1][1] - P[i][1]) * k]; } d -= L[i]; }
  };
  const lin = (t, a0, b0) => clamp01((t - a0) / (b0 - a0));
  const cellP = (cr, y = CR + 0.02) => [X(cr[0]), y, Z(cr[1])];
  const S = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
  const tStuck5 = a("s5:dimakan");
  const beh = {
    s1: (t) => { const c = poly([[6, 20], [10, 20]], lin(t, 0, 2.6)); const j = t > 2.6 ? Math.sin(t * 34) * 0.06 : 0; return [X(c[0]) + j, CR + 0.02, Z(c[1])]; },
    s2: (t) => { const c = poly([[1, 4], [19, 4]], lin(t, K.s2 + 1.0, naik - 0.1)); return [X(c[0]), CR + 0.02, Z(c[1])]; },
    s3: (t) => { const k = t > tKem ? Math.max(0, Math.sin(clamp01((t - tKem) / 0.5) * Math.PI)) * 0.8 : 0; return [6.0, RY + 2.3 + CR + k, RZ + 0.1]; },
    s4: (t) => { const n = Math.min(7, fruitN(t)); const x = t < tDraw ? -10.2 : FX(Math.max(0, n - 1)) + 0.9; const back0 = ramp(t, gTA, gTA + 1.5); const j = t > gTA ? Math.sin(t * 30) * 0.05 : 0; return [x * (1 - back0) + (-10.6) * back0 + j, CR + 0.02, FROW + 1.15]; },
    s5: (t) => { const c = poly([[3, 20], [12, 20]], lin(t, K.s5 + 0.9, tStuck5)); const j = t > tStuck5 ? Math.sin((t - tStuck5) * 9) * 0.38 : 0; return [X(c[0]) + j, CR + 0.02, Z(c[1])]; },
    s6: (t) => [Math.sin(t * 1.7) * 0.25, ODO.y + 1.45 + CR + Math.abs(Math.sin(t * 9)) * 0.08, ODO.z + 0.1],
    s7: (t) => [LET.x - 3.6, LET.y - 1.4 + Math.sin(t * 2.2) * 0.2, LET.z + 1.2],
    s8: (t) => { const u = ((Math.max(0, t - K.s8 - 1.1) / 5.2) % 1 + 1) % 1; const c = poly([[1, 4], [1, 1], [9, 1], [9, 4], [1, 4]], u); return [X(c[0]), CR + 0.02, Z(c[1])]; },
  };
  const sceneOf = (t) => { let i = 0; for (let k = 0; k < S.length; k++) if (t >= K[S[k]] - 0.08) i = k; return i; };
  const chomp = (t) => {
    const i = sceneOf(t), sc = S[i], st = K[sc] - 0.08;
    const cur = beh[sc](t);
    if (i === 0) return cur;
    const JD = 1.1, u = clamp01((t - st) / JD);
    if (u >= 1) return cur;
    const prev = beh[S[i - 1]](st), e = smooth(u);
    const dist = Math.hypot(cur[0] - prev[0], cur[1] - prev[1], cur[2] - prev[2]);
    const H = Math.min(9, 1.5 + dist * 0.3);
    return [prev[0] + (cur[0] - prev[0]) * e, prev[1] + (cur[1] - prev[1]) * e + Math.sin(u * Math.PI) * H, prev[2] + (cur[2] - prev[2]) * e];
  };
  const defYaw = { s3: -Math.PI / 2, s4: 0, s6: -Math.PI / 2, s7: 0.15 };

  // dots: first eat time per phase, sampled once (pure, deterministic)
  const phases = [0, K.s2 - 0.08, naik + 0.45, 1e9];
  const phaseOf = (t) => (t < phases[1] ? 0 : t < phases[2] ? 1 : 2);
  dots.forEach((d) => { d.eat = [Infinity, Infinity, Infinity]; });
  for (let t = 0; t < K.dur; t += 1 / 60) {
    const p = chomp(t); if (p[1] > 1.2) continue; const ph = phaseOf(t);
    for (const d of dots) if (d.eat[ph] === Infinity && Math.abs(X(d.c) - p[0]) < 0.5 && Math.abs(Z(d.r) - p[2]) < 0.5) d.eat[ph] = t;
  }

  // ---------- camera: px py pz lx ly lz ----------
  const cr = track([
    [0, -3.4, 11.5, 19.5, -2.1, 0.3, 7.0], [3.2, -1, 13, 21, 0.5, 0, 6], [K.s1e - 0.3, 1, 30, 30, 0.5, 0, 0.5],
    [K.s2 + 1.2, -6, 15, 9, -1, 0, -4.5], [a("s2:hantu"), 3, 17, 14, 1, 0, -2], [a("s2:ikon") - 0.6, 0, 15, 27, -2, 0, 9.5], [K.s2e - 0.2, 1, 17, 30, -1, 1, 8],
    [K.s3 + 1.6, -3, 15, 20, 0, RY - 0.4, RZ], [a("s3:nol"), 1, 14, 21, -0.2, RY - 0.6, RZ], [K.s3e - 0.2, -0.6, 14, 24, -0.6, RY - 0.4, RZ],
    [K.s4 + 1.3, -2, 13, 27, -2.5, 0, 10], [a("s4:Tapi"), -1, 15, 28, -1, 0.5, 9], [a("s4:Gambarnya") - 0.4, 3, 26, 31, 2, 0, 3], [K.s4e - 0.2, 6, 28, 26, 3, 0, 1],
    [K.s5 + 1.2, -3, 10, 20.5, 0, 0, 8], [K.s5e - 0.2, 2, 11, 20, 1.5, 0, 8.5],
    [K.s6 + 1.4, -2, 6, 52, 0, 3.4, ODO.z], [a("s6:Billy"), 2, 7, 53, 0, 3.8, ODO.z], [K.s6e - 0.2, 0, 8, 55, 0, 4.2, ODO.z],
    [K.s7 + 1.4, -3, 9, 24, LET.x - 0.8, LET.y - 0.6, LET.z], [a("s7:melewati") - 0.3, 1, 12, 25, 1.6, 4.8, 2.5], [K.s7e - 0.2, 3, 13, 27, 2.2, 4.4, 2],
    [K.s8 + 1.2, -6, 21, 24, -3, 1, -2], [K.dur, -8, 25, 28, -3, 2, -2.5],
  ]);

  const dm = new THREE.Object3D(), cc = new THREE.Color(), cWall = new THREE.Color(), white = new THREE.Color(0xffffff);
  const glyphCount = byK.map(() => 0);
  const hidden = (m, i) => { dm.position.set(0, -80, 0); dm.scale.setScalar(0.001); dm.rotation.set(0, 0, 0); dm.updateMatrix(); m.setMatrixAt(i, dm.matrix); };

  return (t) => {
    const p = cr(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    const tick = Math.floor(t * 12);

    // dust drift
    dd.forEach((d, i) => dust.pos.set([d[0] + Math.sin(t * 0.1 + d[3]) * 1.5, d[1] + Math.sin(t * 0.17 + d[3] * 2) * 0.8, d[2]], i * 3)); dust.commit();

    // level clear blink on "naik"
    const blink = t > naik && t < naik + 0.9 ? Math.floor((t - naik) * 7) % 2 : 0;
    capM.color.copy(cWall.set(COL.blue).multiplyScalar(1.9)).lerp(white, blink * 0.8);
    wallM.emissiveIntensity = 0.22 + blink * 0.6;

    walls.forEach((w, i) => {
      const g = cellOf.get(w.c + "," + w.r);
      if (broken(t, g)) { hidden(IW, i); hidden(IC, i); return; }
      dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.position.set(X(w.c), 0.36, Z(w.r)); dm.updateMatrix(); IW.setMatrixAt(i, dm.matrix);
      dm.position.y = 0.75; dm.updateMatrix(); IC.setMatrixAt(i, dm.matrix);
    });
    IW.instanceMatrix.needsUpdate = IC.instanceMatrix.needsUpdate = true;

    const ph = phaseOf(t);
    dots.forEach((d, i) => {
      const g = cellOf.get(d.c + "," + d.r);
      if (broken(t, g) || t >= d.eat[ph] || (t > naik + 0.1 && t < phases[2])) { hidden(ID, i); return; }
      const s = d.big ? 0.2 + Math.sin(t * 8) * 0.04 : 0.085;
      dm.rotation.set(0, 0, 0); dm.position.set(X(d.c), 0.32, Z(d.r)); dm.scale.setScalar(s); dm.updateMatrix(); ID.setMatrixAt(i, dm.matrix);
    });
    ID.instanceMatrix.needsUpdate = true;

    // garbage tiles
    glyphCount.fill(0);
    cells.forEach((x) => {
      const m = IG[x.k];
      let s = 0, y = 0, h = x.h;
      if (t < hookEnd) { s = 1 - ramp(t, hookEnd - 0.6, hookEnd); h = x.h * (0.7 + 0.5 * Math.abs(Math.sin(t * 2.3 + x.ph))); y = Math.max(0, Math.sin(t * 1.3 + x.ph * 3)) * 0.6 * (x.ph > 4.6 ? 1 : 0); }
      else if (t >= x.gT) { const u = clamp01((t - x.gT) / 0.22); s = back(u, 2.4); h = x.h * (0.75 + 0.35 * Math.abs(Math.sin(t * 1.9 + x.ph))); }
      if (s <= 0.001) { hidden(m, x.slot); return; }
      dm.rotation.set(0, (Math.floor(t * 3 + x.ph) % 4 === 0 ? 0.08 : 0), 0);
      dm.position.set(X(x.c), y + (h * s) / 2, Z(x.r)); dm.scale.set(s, h * s, s); dm.updateMatrix(); m.setMatrixAt(x.slot, dm.matrix);
      const fl = (tick + Math.floor(x.ph * 10)) % 9 === 0;
      m.setColorAt(x.slot, cc.set(fl ? 0xffffff : x.col));
    });
    IG.forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });

    // fruit row
    const n = fruitN(t);
    row.forEach((f, i) => {
      const t0 = i < 7 ? (t >= tDraw && t < tTuj + 0.3 ? tDraw + (i * (tTuj + 0.3 - tDraw)) / 7 : -9) : tDraw2 + (i - 7) * 0.14;
      const on = i < n;
      f.visible = on;
      const u = t0 > 0 ? clamp01((t - t0) / 0.25) : 1;
      f.position.set(FX(i), 0.02 + (1 - eout(u)) * 1.5, FROW); f.scale.setScalar(1.25 * (0.4 + 0.6 * back(u, 2.5))); f.rotation.y = t * 0.8 + i;
    });
    halos.forEach((h, j) => { const i = j + 7; h.visible = i < n; h.position.set(FX(i), 0.4, FROW); h.rotation.set(t * 1.3, t * 2 + j, 0); h.scale.setScalar(0.9 + Math.sin(t * 9 + j) * 0.12); });

    // overflow fruit flights into the right half
    let fi = 0;
    for (const x of cells) {
      if (fi >= fly.length) break;
      if (t < x.gT - 0.5 || t >= x.gT) continue;
      const u = clamp01((t - (x.gT - 0.5)) / 0.5), e = smooth(u), f = fly[fi++];
      const sx = FX(12), sz = FROW;
      f.visible = true; f.position.set(sx + (X(x.c) - sx) * e, 0.3 + Math.sin(u * Math.PI) * 2.2, sz + (Z(x.r) - sz) * e); f.rotation.set(u * 6, u * 9, 0); f.scale.setScalar(1.1);
    }
    for (; fi < fly.length; fi++) fly[fi].visible = false;

    // chomper
    const cp = chomp(t), i = sceneOf(t);
    const q0 = chomp(t - 0.04), q1 = chomp(t + 0.04), vx = q1[0] - q0[0], vz = q1[2] - q0[2], sp = Math.hypot(vx, vz) / 0.08;
    CH.position.set(cp[0], cp[1], cp[2]);
    const yaw = sp > 0.6 ? Math.atan2(-vz, vx) : (defYaw[S[i]] ?? (S[i] === "s5" || S[i] === "s1" ? 0 : -Math.PI / 2));
    CH.rotation.set(0, yaw, 0);
    const fast = sp > 0.6 || S[i] === "s6";
    const mo = fast ? 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 6) : 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.6);
    const ang = 0.04 + mo * (fast ? 0.62 : 0.32);
    jU.rotation.z = ang; jL.rotation.z = -ang;
    glow.position.set(cp[0], cp[1] + 0.8, cp[2]);

    // ghosts
    ghosts.forEach((g, k) => {
      const L = loopG[k], spd = [0.055, 0.075, 0.09, 0.2][k];
      const u = ((t * spd + k * 0.23) % 1 + 1) % 1, c = poly(L, u), c2 = poly(L, (u + 0.004) % 1);
      const bob = Math.sin(t * 3 + k) * 0.08;
      let pop = 1; const tg = a("s2:empat") + k * 0.12; if (t > tg && t < tg + 0.4) pop = 1 + Math.sin(((t - tg) / 0.4) * Math.PI) * 0.35;
      g.G.position.set(X(c[0]), 0.05 + bob, Z(c[1])); g.G.rotation.y = Math.atan2(-(c2[1] - c[1]), c2[0] - c[0]); g.G.scale.setScalar(pop);
      g.beads.forEach((b, j) => { const an = (j / 7) * Math.PI * 2 + t * 2; b.position.set(Math.cos(an) * 0.3, 0.22 + Math.sin(t * 8 + j * 1.7) * 0.05, Math.sin(an) * 0.3); });
      g.ring.scale.setScalar(1 + Math.sin(t * 4 + k) * 0.06);
    });

    // register
    const v = regVal(t), glitchy = t >= tKem && t < K.s4 + 0.1 ? 1 - ramp(t, tKem, tKem + 1.5) : t >= tMel ? 1 : 0;
    lamps.forEach((l, j) => {
      const bit = (v >> (7 - j)) & 1;
      l.faceOn.visible = !!bit; l.faceOff.visible = !bit;
      const g = glitchy && (tick + j * 3) % 7 === 0;
      l.faceOff.material.color.set(g ? COL.mag : 0xffffff);
      l.bulb.material.color.set(bit ? COL.yel : g ? COL.mag : 0x1a2266);
      const hl = a("s3:Delapan") + j * 0.11; const r = t > hl && t < hl + 0.7 ? 1 - (t - hl) / 0.7 : 0;
      l.ring.material.opacity = r; l.ring.visible = r > 0.01;
    });
    const fb = t > a("s3:byte") && t < a("s3:byte") + 1.2 ? 1 + 1.4 * (1 - (t - a("s3:byte")) / 1.2) : 1;
    frameM.color.set(COL.cyan).multiplyScalar(1.6 * fb);
    reg.position.y = RY + Math.sin(t * 0.6) * 0.12; reg.visible = !(t > K.s6 + 1.0 && t < K.s6e - 0.2);
    // carry bit: pops out left of lamp 0 when 255 rolls to 0, then falls into the void

    const cT = t >= tMel ? tMel : t >= tKem ? tKem : -1;
    carry.visible = cT > 0 && t - cT < 3.2;
    if (carry.visible) { const u = t - cT, pu = back(clamp01(u / 0.25), 2.5); carry.position.set(-4.5 * LS - 0.2 - u * 0.9, RY - 0.2 + (u > 0.45 ? -4.9 * (u - 0.45) * (u - 0.45) : 0), RZ + 0.2 + u * 0.4); carry.rotation.set(0, 0, u > 0.45 ? (u - 0.45) * 2.2 : 0); carry.scale.setScalar(Math.max(0.001, pu)); }

    // data pulses down the cables
    for (let k = 0; k < PUL; k++) { const c = cab[k % 4], u = ((t * 0.35 + k * 0.137) % 1); const P = c[0].clone().lerp(c[1], u); pul.pos.set([P.x, P.y, P.z], k * 3); const col = new THREE.Color(glitchy && k % 2 ? COL.mag : COL.cyan); pul.col.set([col.r, col.g, col.b], k * 3); }
    pul.commit();

    // odometer
    const sc = 3333360 * eout(clamp01((t - a("s6:tiga")) / (a("s6:puluh#2") + 0.3 - a("s6:tiga"))));
    odo.visible = t > K.s5e - 1;
    drums.forEach((d, j) => {
      const pw = Math.pow(10, 6 - j), whole = Math.floor(sc / pw) % 10, frac = (sc % pw) / pw;
      const vv = j === 6 ? (sc % 10) : whole + Math.max(0, (frac - 0.92) / 0.08);
      d.tx.offset.y = (9 - vv) / 10 + 0.0;
    });

    // letter + question mark
    const lIn = ramp(t, K.s7 - 0.4, K.s7 + 1.1);
    letter.visible = t > K.s7 - 0.5 && t < K.s8 + 0.4;
    letter.position.set(LET.x + (1 - lIn) * 9, LET.y + (1 - lIn) * 6 + Math.sin(t * 1.1) * 0.15, LET.z);
    letter.rotation.set(-0.12 + Math.sin(t * 0.8) * 0.04, 0.18 - (1 - lIn) * 1.4 + Math.sin(t * 0.6) * 0.05, -0.05 + (1 - lIn) * 0.6);
    const qIn = back(clamp01((t - a("s7:melewati")) / 0.4), 2);
    qm.visible = qIn > 0.001; qLab.visible = qIn > 0.001 && t < K.s8;
    qm.position.set(4.6, 4.4 + Math.sin(t * 2) * 0.2, 1.5); qm.rotation.y = Math.sin(t * 1.3) * 0.5; qm.scale.setScalar(Math.max(0.001, qIn));
    qLab.position.set(4.6, 2.1, 2.2); qLab.scale.setScalar(Math.max(0.001, qIn)); qLab.quaternion.copy(cam.quaternion);

    comp.render();
  };
}
