// KUBURAN E.T.: a forensic evidence desk under a warm lamp. The centrepiece is a cut-away diorama of the desert landfill
// (sand, crushed game boxes, concrete cap); other exhibits sit along the same desk. Illustration only: no logos, no film
// character, no real people (name plates only). Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, restPose, envStrips } from "./lib3d.js";

const P = { void: 0x0b0c0e, desk: "#15171a", hair: "#2E3238", red: "#FF4A2E", paper: "#E9DFC8", ink: "#1D1D1B", green: "#10B981" };
const HF = "Archivo, Arial, sans-serif", MF = "'IBM Plex Mono', 'Courier New', monospace";

// Canvas textures are redrawn once the web fonts are ready, so labels never stay in the fallback face.
const TX = [];
function tex(w, h, draw, rep) { const t = canvasTex(w, h, draw, rep); TX.push([t, w, h, draw]); return t; }
function redrawAll() { for (const [t, w, h, d] of TX) { const g = t.image.getContext("2d"); g.clearRect(0, 0, w, h); d(g, w, h); t.needsUpdate = true; } }

function paperBg(g, w, h, seed, col = P.paper) {
  const r = mulberry(seed); g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / 900; i++) { g.fillStyle = `rgba(90,70,40,${0.03 + r() * 0.05})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(80,55,25,.22)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
function txt(g, s, x, y, font, col, align = "center") { g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); }

// Generic game-box art: "E.T. (1982)" title on a night sky. Drawn here, not taken from any product.
function etArt(g, w, h) {
  const r = mulberry(77); g.fillStyle = "#151b2c"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,240,210,${0.3 + r() * 0.6})`; g.fillRect(r() * w, r() * h * 0.62, 2, 2); }
  g.fillStyle = "#E8762B"; g.fillRect(0, 0, w, h * 0.12);
  txt(g, "GAME CARTRIDGE", w / 2, h * 0.06, `700 ${h * 0.045}px ${MF}`, "#151b2c");
  g.fillStyle = "#F3D9A4"; g.beginPath(); g.arc(w * 0.7, h * 0.3, w * 0.14, 0, 7); g.fill(); g.fillStyle = "#151b2c"; g.beginPath(); g.arc(w * 0.76, h * 0.27, w * 0.13, 0, 7); g.fill();
  g.fillStyle = "#2a3550"; g.beginPath(); g.moveTo(0, h * 0.78); for (let x = 0; x <= w; x += w / 12) g.lineTo(x, h * (0.7 + 0.05 * Math.sin(x * 0.03))); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  txt(g, "E.T.", w / 2, h * 0.52, `900 ${h * 0.2}px ${HF}`, "#ffffff");
  txt(g, "(1982)", w / 2, h * 0.66, `800 ${h * 0.075}px ${HF}`, "#E8762B");
  g.fillStyle = "#E8762B"; g.fillRect(0, h * 0.9, w, h * 0.1);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: P.void, fog: 0.0065, exp: 1.0, bloom: [0.22, 0.45, 0.86] });
  envStrips(r, scene, [[40, 8, 0xffe2b8, 2.2, 0, 40, 20], [30, 6, 0xbfd4ff, 0.8, -40, 20, -10], [20, 20, 0xffd7a0, 1.0, 30, 10, 40]], 0x0b0c0e);
  scene.environmentIntensity = 0.55;
  const hemi = new THREE.HemisphereLight(0xfff0d8, 0x1a120c, 0.55); scene.add(hemi);
  const lamp = new THREE.SpotLight(0xffd9a8, 4.6, 0, 0.5, 0.75, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0005; lamp.shadow.camera.far = 220;
  scene.add(lamp, lamp.target);
  const rim = new THREE.DirectionalLight(0x9fb6ff, 0.55); scene.add(rim, rim.target);
  const rnd = mulberry(2201);
  const M = { sand: std(0xc9a36b, 0.95), sand2: std(0xa98656, 0.95), base: std(0x6e5238, 0.95), plinth: std(0x231a14, 0.6), conc: std(0x9c9a94, 0.9), paper: std(0xe9dfc8, 0.92), ink: std(0x1d1d1b, 0.7), red: std(0xff4a2e, 0.5, 0, { emissive: 0xff4a2e, emissiveIntensity: 0.55 }), brass: std(0xb8893a, 0.35, 0.85), wood: std(0x3a2618, 0.55), dark: std(0x1c1e22, 0.5) };

  // desk: forensic cutting mat
  const mat = tex(256, 256, (g, w, h) => { g.fillStyle = P.desk; g.fillRect(0, 0, w, h); g.strokeStyle = "#202328"; g.lineWidth = 1; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } g.strokeStyle = P.hair; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); g.fillStyle = "rgba(255,74,46,.35)"; g.fillRect(0, 0, 10, 2); g.fillRect(0, 0, 2, 10); }, [40, 40]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ map: mat, roughness: 0.82 })); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  // scattered sheets (case paperwork) for depth
  const sheetT = tex(256, 340, (g, w, h) => { paperBg(g, w, h, 5); const rr = mulberry(9); for (let i = 0; i < 11; i++) { g.fillStyle = i % 2 ? "#6f6a5f" : "#2f2d28"; g.fillRect(24, 40 + i * 26, (i % 2 ? 150 : 205) * (0.7 + rr() * 0.3), 10); } g.fillStyle = P.red; g.fillRect(24, 16, 60, 8); });
  const sheetM = new THREE.MeshStandardMaterial({ map: sheetT, roughness: 0.95 });
  [[-26, 16, 0.3], [24, 15, -0.2], [-70, 14, 0.5], [-112, 12, -0.3], [36, -30, 0.4], [-30, -36, -0.6], [76, 14, 0.25], [118, 14, -0.35], [-62, -18, 0.1], [70, -20, -0.15], [-24, -66, 0.2], [26, -78, -0.4]].forEach(([x, z, a]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 10), sheetM); m.rotation.set(-Math.PI / 2, 0, a); m.position.set(x, 0.03, z); m.receiveShadow = true; scene.add(m); });

  // ===== A: the landfill diorama =====
  const DIO = new THREE.Group(); scene.add(DIO);
  box(26, 1, 19, M.plinth, 0, 0.5, 0.5, DIO);
  const plaqueT = tex(1024, 96, (g, w, h) => { g.fillStyle = "#b8893a"; g.fillRect(0, 0, w, h); txt(g, "EXHIBIT A  ·  ALAMOGORDO, NEW MEXICO  ·  1983", w / 2, h / 2, `700 44px ${MF}`, "#2a1c0c"); });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.125), new THREE.MeshStandardMaterial({ map: plaqueT, roughness: 0.4, metalness: 0.5 })); plaque.position.set(0, 0.5, 10.02); DIO.add(plaque);
  const strata = (seed, base) => tex(512, 512, (g, w, h) => { const rr = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(${90 + rr() * 60},${60 + rr() * 40},${30 + rr() * 20},.28)`; const y = rr() * h; g.fillRect(0, y, w, 6 + rr() * 26); } for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(40,25,10,${rr() * 0.25})`; g.fillRect(rr() * w, rr() * h, 2, 2); } for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(70,60,50,.5)"; g.beginPath(); g.arc(rr() * w, rr() * h, 2 + rr() * 6, 0, 7); g.fill(); } });
  const faceSand = new THREE.MeshStandardMaterial({ map: strata(31, "#c49c64"), roughness: 0.95 }), faceBase = new THREE.MeshStandardMaterial({ map: strata(32, "#8a6844"), roughness: 0.95 });
  const blk = (w, h, d, x, y, z, front) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [M.sand2, M.sand2, M.sand, M.sand2, front, M.sand2]); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; DIO.add(m); return m; };
  blk(24, 2, 16, 0, 2, 0, faceBase); // base strata, y 1..3
  blk(5, 7, 16, -9.5, 6.5, 0, faceSand); // left bank
  blk(5, 7, 16, 9.5, 6.5, 0, faceSand); // right bank
  blk(14, 7, 2, 0, 6.5, -7, faceSand); // back bank with the road
  const road = new THREE.Mesh(new THREE.PlaneGeometry(24, 1.9), std(0x7d6a52, 0.95)); road.rotation.x = -Math.PI / 2; road.position.set(0, 10.02, -7); road.receiveShadow = true; DIO.add(road);
  // desert scrub on the banks
  const scrub = std(0x6f7a3e, 0.9);
  for (let i = 0; i < 22; i++) { const s = i % 2 ? 1 : -1; const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28 + rnd() * 0.3, 0), scrub); m.position.set(s * (8 + rnd() * 3.6), 10.15, -5 + rnd() * 12.5); m.castShadow = true; DIO.add(m); }

  // crushed game boxes filling the trench
  const SL = [];
  const xs = [], zs = [];
  for (let x = -6.55; x <= 6.6; x += 0.94) xs.push(x);
  for (let z = -5.5; z <= 7.6; z += 0.94) zs.push(z);
  const TRK = [-5, 0, 5];
  for (let L = 0; L < 9; L++) for (const x of xs) for (const z of zs) {
    const k = x < -2.5 ? 0 : x < 2.5 ? 1 : 2;
    const t0 = 1.25 + (L + rnd() * 0.95) * 0.62;
    const rm = x > -0.9 && x < 4.9 && L >= 4;
    SL.push({ x: x + (rnd() - 0.5) * 0.18, y: 3.32 + L * 0.6, z: z + (rnd() - 0.5) * 0.18, k, t0, sx: TRK[k] + (rnd() - 0.5) * 2.6, ry: (rnd() - 0.5) * 0.9, rx: (rnd() - 0.5) * 0.35, rz: (rnd() - 0.5) * 0.35, sq: 0.62 + rnd() * 0.38, spin: rnd() * 8, ci: Math.floor(rnd() * 5), vi: Math.floor(rnd() * 6), rm, tr: rm ? 66.3 + (8 - L) * 1.55 + rnd() * 1.6 : 1e9 });
  }
  const ET_C = [0x1f2840, 0xd9772b, 0x2b3550, 0xc9b48a, 0x8a6d4a].map((c) => new THREE.Color(c));
  const VAR_C = [0x2f7d4a, 0x2a5fb0, 0xc23a3a, 0xd8b13a, 0x7a4bb0, 0x1f2840].map((c) => new THREE.Color(c));
  const IC = new THREE.InstancedMesh(new THREE.BoxGeometry(0.86, 0.55, 0.64), new THREE.MeshStandardMaterial({ roughness: 0.7 }), SL.length);
  IC.castShadow = IC.receiveShadow = true; IC.frustumCulled = false; DIO.add(IC);
  SL.forEach((c, i) => IC.setColorAt(i, ET_C[c.ci]));

  // trucks (side dump) on the back road
  const truck = (cabC) => {
    const G = new THREE.Group();
    box(1.25, 1.35, 1.6, std(cabC, 0.45), 1.55, 0.95, 0, G); box(0.1, 0.5, 1.3, std(0x1d2a33, 0.2, 0.6), 2.19, 1.2, 0, G);
    box(3.3, 0.25, 1.7, M.dark, -0.7, 0.42, 0, G);
    for (const [x, z] of [[1.5, 0.82], [1.5, -0.82], [-0.4, 0.82], [-0.4, -0.82], [-1.7, 0.82], [-1.7, -0.82]]) { const w = cyl(0.32, 0.32, 0.26, 14, std(0x111111, 0.8), x, 0.32, z, G); w.rotation.x = Math.PI / 2; }
    const piv = new THREE.Group(); piv.position.set(-0.7, 0.58, 0.85); G.add(piv);
    const bed = new THREE.Group(); bed.position.set(0, 0, -0.85); piv.add(bed);
    box(3.3, 0.12, 1.7, std(0xd8d2c4, 0.5), 0, 0.06, 0, bed);
    box(3.3, 1.0, 0.1, std(0xd8d2c4, 0.5), 0, 0.6, -0.8, bed); box(3.3, 1.0, 0.1, std(0xd8d2c4, 0.5), 0, 0.6, 0.8, bed);
    box(0.1, 1.0, 1.7, std(0xd8d2c4, 0.5), -1.6, 0.6, 0, bed); box(0.1, 1.0, 1.7, std(0xd8d2c4, 0.5), 1.6, 0.6, 0, bed);
    for (let i = 0; i < 8; i++) box(0.7, 0.45, 0.55, std([0x1f2840, 0xd9772b, 0xc9b48a][i % 3], 0.7), -1.2 + (i % 4) * 0.8, 0.4, i < 4 ? -0.35 : 0.35, bed);
    G.scale.setScalar(1.12);
    return { G, piv };
  };
  const trucks = [0x9c3b2a, 0xb8873a, 0x5d6b78].map((c) => { const T = truck(c); T.G.position.set(0, 10, -7); DIO.add(T.G); return T; });

  // concrete mixer + chute
  const MX = new THREE.Group(); DIO.add(MX);
  box(1.3, 1.4, 1.6, std(0xd8d2c4, 0.45), 1.7, 0.95, 0, MX); box(3.4, 0.25, 1.7, M.dark, -0.5, 0.42, 0, MX);
  for (const [x, z] of [[1.6, 0.82], [1.6, -0.82], [-0.6, 0.82], [-0.6, -0.82], [-1.7, 0.82], [-1.7, -0.82]]) { const w = cyl(0.32, 0.32, 0.26, 14, std(0x111111, 0.8), x, 0.32, z, MX); w.rotation.x = Math.PI / 2; }
  const drumT = tex(256, 64, (g, w, h) => { g.fillStyle = "#c9c4b8"; g.fillRect(0, 0, w, h); g.strokeStyle = P.red; g.lineWidth = 10; for (let i = -2; i < 8; i++) { g.beginPath(); g.moveTo(i * 40, 0); g.lineTo(i * 40 + 40, h); g.stroke(); } }, [1, 1]);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 2.7, 20), new THREE.MeshStandardMaterial({ map: drumT, roughness: 0.5 })); drum.rotation.z = Math.PI / 2 - 0.2; drum.position.set(-0.4, 1.55, 0); drum.castShadow = true; MX.add(drum);
  const chute = box(0.5, 0.12, 5.6, std(0x8a8a86, 0.4, 0.6), -1.9, 1.0, 2.6, MX); chute.rotation.x = 0.2;
  const stream = cyl(0.22, 0.32, 1.6, 10, std(0x8f8d86, 0.35), -1.9, -0.05, 5.3, MX);
  MX.scale.setScalar(1.12);

  // concrete cap in three pieces so the 2014 dig can open the middle
  const CAPY = 9.2, CAPH = 1.2, CAPZ = 1, CAPD = 14;
  const capPieces = [[-7, -0.9], [-0.9, 4.9], [4.9, 7]].map(([a, b]) => { const m = box(b - a, CAPH, CAPD, M.conc.clone(), (a + b) / 2, CAPY, CAPZ, DIO); return { m, a, b }; });
  const chunks = []; for (let i = 0; i < 7; i++) { const m = box(1.2 + rnd() * 0.8, 0.9, 1 + rnd() * 0.9, M.conc, 0, 0, 0, DIO); chunks.push({ m, x0: -0.4 + rnd() * 4.8, z0: -4 + rnd() * 10, x1: 9.4 + rnd() * 1.8, z1: 5.2 + rnd() * 1.8, y1: 10.4 + (i % 3) * 0.55, ry: rnd() * 3 }); }

  // red evidence outline around the trench + floating tag
  const OL = new THREE.Group(); DIO.add(OL);
  [[14.6, 0.14, 0, -6.3], [14.6, 0.14, 0, 8.3], [0.14, 14.6, -7.3, 1], [0.14, 14.6, 7.3, 1]].forEach(([w, d, x, z]) => box(w, 0.08, d, M.red, x, 10.12, z, OL));
  const tag3 = (lines, w = 512, h = 160, bg = P.red, fg = "#fff") => tex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); lines.forEach(([s, f, y]) => txt(g, s, w / 2, y, f, fg)); });
  const locT = tag3([["LOKASI KUBURAN", `800 56px ${HF}`, 62], ["TPA · GURUN", `600 34px ${MF}`, 122]]);
  const loc = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.625), new THREE.MeshBasicMaterial({ map: locT, toneMapped: false, transparent: true })); loc.position.set(-6.2, 13.4, -5.6); OL.add(loc);

  // characters
  const crew = (skin) => {
    const a = avatar({ skin, shirt: 0xff7a1a, pants: 0x34404f, make: (c) => std(c, 0.7) });
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.72, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0xf2c230, 0.35)); hat.position.y = 1.15; hat.castShadow = true; a.head.add(hat);
    cyl(0.86, 0.86, 0.08, 18, std(0xf2c230, 0.35), 0, 1.16, 0, a.head);
    box(2.04, 0.16, 1.04, std(0xe8e6dc, 0.3, 0.4), 0, 3.1, 0, a.G); box(2.04, 0.16, 1.04, std(0xe8e6dc, 0.3, 0.4), 0, 2.5, 0, a.G);
    a.G.scale.setScalar(0.42); return a;
  };
  const C0 = crew(0xc8916a), C1 = crew(0x8d5a3b), C2 = crew(0xe0b08a);
  DIO.add(C0.G, C1.G, C2.G);
  const camRig = new THREE.Group(); box(0.9, 0.8, 1.3, M.dark, 0, 0, 0, camRig); const lens = cyl(0.3, 0.36, 0.6, 14, M.dark, 0, 0, 0.9, camRig); lens.rotation.x = Math.PI / 2; box(0.25, 0.25, 0.25, M.red, 0.3, 0.5, -0.2, camRig); camRig.position.set(0, 4.6, 1.2); C0.G.add(camRig);

  const inv = avatar({ skin: 0xc8916a, shirt: 0x8a7154, pants: 0x2a2a2e, make: (c) => std(c, 0.78) });
  cyl(1.0, 1.0, 0.08, 26, std(0x2b2520, 0.7), 0, 1.24, 0, inv.head); cyl(0.6, 0.66, 0.62, 22, std(0x2b2520, 0.7), 0, 1.58, 0, inv.head); cyl(0.67, 0.67, 0.14, 22, std(0x7a1f14, 0.6), 0, 1.36, 0, inv.head);
  box(2.2, 1.15, 1.16, std(0x8a7154, 0.78), 0, 1.5, 0, inv.G); box(0.5, 0.9, 1.06, std(0x6e5a42, 0.8), 0, 3.4, 0.03, inv.G);
  const mag = new THREE.Group(); inv.armR.add(mag); mag.position.set(0, -2.1, 0.1);
  cyl(0.11, 0.11, 0.9, 8, M.wood, 0, -0.35, 0, mag); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.08, 10, 28), M.brass); ring.position.y = -1.25; mag.add(ring);
  const lensD = new THREE.Mesh(new THREE.CircleGeometry(0.46, 24), new THREE.MeshStandardMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide })); lensD.position.y = -1.25; mag.add(lensD);
  inv.G.scale.setScalar(1.4); scene.add(inv.G);

  // ===== B: production calendar + name plates =====
  const BX = -49;
  const etT = tex(384, 512, etArt);
  const navy = std(0x151b2c, 0.5), card = std(0xb59a6e, 0.9);
  const gameBox = (w, h, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [navy, navy, navy, navy, new THREE.MeshStandardMaterial({ map: etT, roughness: 0.45 }), card]); m.castShadow = m.receiveShadow = true; return m; };
  const calBoard = box(9.4, 7.4, 0.4, M.dark, BX, 4.7, 0); calBoard.rotation.x = -0.1;
  box(9.6, 1, 4, M.dark, BX, 0.5, 0.4);
  const pageTex = (i) => tex(512, 400, (g, w, h) => {
    paperBg(g, w, h, 40 + i);
    g.fillStyle = P.red; g.fillRect(0, 0, w, 70); txt(g, "JADWAL PRODUKSI", w / 2, 37, `700 34px ${MF}`, "#fff");
    if (i < 5) {
      txt(g, String(i + 1), 150, 215, `900 190px ${HF}`, P.ink); txt(g, "MINGGU", 150, 335, `800 44px ${HF}`, P.ink);
      g.strokeStyle = "#8a8170"; g.lineWidth = 2; for (let k = 0; k < 5; k++) { const y = 110 + k * 54; for (let d = 0; d < 7; d++) { g.strokeRect(290 + d * 30, y, 26, 44); } if (k <= i) { g.strokeStyle = P.red; g.lineWidth = 5; g.beginPath(); g.moveTo(292, y + 22); g.lineTo(496, y + 22); g.stroke(); g.strokeStyle = "#8a8170"; g.lineWidth = 2; } }
    } else {
      txt(g, "TARGET", w / 2, 130, `700 40px ${MF}`, P.ink); txt(g, "LIBURAN", w / 2, 210, `900 92px ${HF}`, P.ink); txt(g, "AKHIR 1982", w / 2, 300, `900 64px ${HF}`, P.red);
      g.strokeStyle = P.red; g.lineWidth = 8; g.beginPath(); g.ellipse(w / 2, 255, 230, 140, -0.05, 0, 7); g.stroke();
    }
  });
  const pages = [0, 1, 2, 3, 4, 5].map(pageTex);
  const calZ = 0.25;
  const under = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 6.72), new THREE.MeshStandardMaterial({ map: pages[0], roughness: 0.9 })); under.position.set(BX, 4.55, calZ); under.rotation.x = -0.1; scene.add(under);
  const flipPiv = new THREE.Group(); flipPiv.position.set(BX, 7.9, calZ + 0.04); flipPiv.rotation.x = -0.1; scene.add(flipPiv);
  const flipM = new THREE.MeshStandardMaterial({ map: pages[0], roughness: 0.9, side: THREE.DoubleSide });
  const flip = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 6.72), flipM); flip.position.y = -3.36; flip.castShadow = true; flipPiv.add(flip);
  for (let i = 0; i < 6; i++) { const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 16), M.brass); ringC.position.set(BX - 3.5 + i * 1.4, 8.05, calZ); scene.add(ringC); }
  const FLIPS = [AT["s2:lima"] + 0.15, AT["s2:lima"] + 0.6, AT["s2:lima"] + 1.05, AT["s2:lima"] + 1.5, AT["s2:liburan"] - 0.1];
  const et1 = gameBox(3.2, 4.3, 0.8); et1.position.set(BX + 6.6, 2.15, -1.2); et1.rotation.y = -0.35; scene.add(et1);
  const plateT = (name, role) => tex(768, 192, (g, w, h) => { g.fillStyle = "#1c1e22"; g.fillRect(0, 0, w, h); g.fillStyle = "#b8893a"; g.fillRect(0, h - 12, w, 12); txt(g, name, w / 2, 78, `800 ${name.length > 16 ? 50 : 62}px ${HF}`, "#F1EBDD"); txt(g, role, w / 2, 146, `600 34px ${MF}`, "#FF6A4E"); });
  const plate = (name, role, x, z, ry) => { const G = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.6, 0.9), [M.dark, M.dark, M.dark, M.dark, new THREE.MeshStandardMaterial({ map: plateT(name, role), roughness: 0.4 }), M.dark]); m.rotation.x = -0.35; m.position.y = 0.8; m.castShadow = true; G.add(m); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G); return G; };
  const pl1 = plate("STEVEN SPIELBERG", "FILM E.T.", BX - 3.6, 7.6, 0.12), pl2 = plate("HOWARD SCOTT WARSHAW", "PROGRAMMER", BX + 3.6, 7.8, -0.12);

  // ===== C: production vs sales stacks =====
  const CX = -93;
  const stripT = tex(512, 92, (g, w, h) => { g.fillStyle = "#151b2c"; g.fillRect(0, 0, w, h); g.fillStyle = "#E8762B"; g.fillRect(0, 0, 150, h); txt(g, "E.T. (1982)", 75, h / 2, `800 30px ${HF}`, "#151b2c"); const rr = mulberry(3); for (let i = 0; i < 30; i++) { g.fillStyle = "rgba(255,240,210,.7)"; g.fillRect(160 + rr() * 340, rr() * h, 2, 2); } txt(g, "GAME CARTRIDGE", 340, h / 2, `600 26px ${MF}`, "#F3D9A4"); });
  const stripM = new THREE.MeshStandardMaterial({ map: stripT, roughness: 0.5 });
  const stackBox = () => { const m = new THREE.Mesh(new THREE.BoxGeometry(5, 0.86, 3.4), [navy, navy, navy, navy, stripM, navy]); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  const stackL = Array.from({ length: 10 }, stackBox), stackR = Array.from({ length: 3 }, stackBox);
  const signT = (a, b, col) => tex(640, 256, (g, w, h) => { g.fillStyle = "#1c1e22"; g.fillRect(0, 0, w, h); g.fillStyle = col; g.fillRect(0, 0, 14, h); txt(g, a, w / 2 + 6, 104, `900 108px ${HF}`, col); txt(g, b, w / 2 + 6, 200, `700 44px ${MF}`, "#F1EBDD"); });
  const sign = (t, x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.24, 0.3), [M.dark, M.dark, M.dark, M.dark, new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }), M.dark]); m.position.set(x, 1.25, 4.6); m.rotation.x = -0.3; m.castShadow = true; scene.add(m); return m; };
  const sgL = sign(signT("5 JUTA", "DIBUAT", "#F1EBDD"), CX - 3), sgR = sign(signT("1,5 JUTA", "TERJUAL", P.red), CX + 3);

  // ===== D: route map + newspaper clipping =====
  const DZ = -55;
  const mapT = tex(1024, 716, (g, w, h) => {
    paperBg(g, w, h, 61);
    g.strokeStyle = "rgba(60,50,35,.18)"; g.lineWidth = 1; for (let i = 0; i < w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); } for (let i = 0; i < h; i += 64) { g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
    const rr = mulberry(62); g.strokeStyle = "rgba(140,100,50,.35)"; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); const cx = rr() * w, cy = rr() * h, rx = 60 + rr() * 160; for (let a = 0; a <= 6.3; a += 0.2) { const rr2 = rx * (1 + 0.15 * Math.sin(a * 3 + k)); const x = cx + Math.cos(a) * rr2, y = cy + Math.sin(a) * rr2 * 0.7; a ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.setLineDash([14, 10]); g.strokeStyle = "rgba(40,30,20,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 560); g.lineTo(w, 520); g.stroke(); g.setLineDash([]);
    txt(g, "NEW MEXICO", 280, 90, `800 46px ${HF}`, "rgba(29,29,27,.55)");
    txt(g, "ALAMOGORDO", 590, 118, `800 40px ${HF}`, P.ink); txt(g, "EL PASO", 280, 650, `800 40px ${HF}`, P.ink);
    g.strokeStyle = P.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(940, 120); g.lineTo(940, 40); g.stroke(); g.beginPath(); g.moveTo(926, 66); g.lineTo(940, 40); g.lineTo(954, 66); g.stroke(); txt(g, "U", 940, 150, `700 32px ${MF}`, P.ink);
    g.fillStyle = P.ink; g.fillRect(40, 40, 330, 6); txt(g, "PETA REKONSTRUKSI", 40, 74, `700 28px ${MF}`, P.ink, "left");
  });
  const map = new THREE.Mesh(new THREE.PlaneGeometry(40, 28), new THREE.MeshStandardMaterial({ map: mapT, color: 0xb8ae98, roughness: 0.92 })); map.rotation.x = -Math.PI / 2; map.position.set(0, 0.05, DZ); map.receiveShadow = true; scene.add(map);
  const m2w = (cx, cy) => [-20 + (cx / 1024) * 40, DZ - 14 + (cy / 716) * 28];
  const route = [[300, 600], [360, 520], [430, 440], [500, 330], [560, 240], [600, 170]].map(([x, y]) => m2w(x, y));
  const segs = []; for (let i = 0; i < route.length - 1; i++) { const [x0, z0] = route[i], [x1, z1] = route[i + 1]; const L = Math.hypot(x1 - x0, z1 - z0); const G = new THREE.Group(); G.position.set(x0, 0.12, z0); G.rotation.y = Math.atan2(x1 - x0, z1 - z0); const m = box(0.26, 0.06, L, M.red, 0, 0, L / 2, G); m.castShadow = false; scene.add(G); segs.push({ G, m, L }); }
  const pin = (x, z) => { const G = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.8, 16), M.red); c.rotation.x = Math.PI; c.position.y = 0.9; G.add(c); const s = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), M.red); s.position.y = 2; G.add(s); G.position.set(x, 0.05, z); G.children.forEach((k) => (k.castShadow = true)); scene.add(G); return G; };
  const pinA = pin(...route[0]), pinB = pin(...route[route.length - 1]);
  const minis = Array.from({ length: 7 }, (_, i) => { const G = new THREE.Group(); box(0.55, 0.5, 0.55, std(0x9c3b2a, 0.5), 0.75, 0.3, 0, G); box(1.2, 0.55, 0.6, std(0xd8d2c4, 0.5), -0.2, 0.32, 0, G); G.scale.setScalar(1.15); scene.add(G); return G; });
  const routeAt = (u) => { u = clamp01(u) * (route.length - 1); const i = Math.min(route.length - 2, Math.floor(u)), f = u - i; const [x0, z0] = route[i], [x1, z1] = route[i + 1]; return [x0 + (x1 - x0) * f, z0 + (z1 - z0) * f, Math.atan2(z0 - z1, x1 - x0)]; };
  const newsT = tex(600, 760, (g, w, h) => {
    paperBg(g, w, h, 71, "#e6dcc4");
    txt(g, "KORAN LOKAL", w / 2, 62, `900 64px ${HF}`, P.ink); g.fillStyle = P.ink; g.fillRect(30, 104, w - 60, 4); txt(g, "ALAMOGORDO, N.M.  ·  SEPTEMBER 1983", w / 2, 130, `600 22px ${MF}`, P.ink); g.fillRect(30, 150, w - 60, 2);
    txt(g, "10–20 TRUK", w / 2, 220, `900 76px ${HF}`, P.ink); txt(g, "barang Atari dari El Paso", w / 2, 290, `700 36px ${HF}`, P.ink); txt(g, "dikubur di TPA kota", w / 2, 336, `700 36px ${HF}`, P.ink);
    const rr = mulberry(72); for (let c = 0; c < 2; c++) for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(29,29,27,.55)"; g.fillRect(36 + c * 275, 390 + i * 25, 240 * (0.75 + rr() * 0.25), 9); }
  });
  const news = new THREE.Mesh(new THREE.PlaneGeometry(12, 15.2), new THREE.MeshStandardMaterial({ map: newsT, color: 0xbdb39c, roughness: 0.95 })); news.rotation.set(-Math.PI / 2, 0, -0.16); news.position.set(15.5, 0.14, DZ - 3); news.receiveShadow = true; scene.add(news);

  // ===== rumour bubbles (s5) =====
  const bubT = (s) => tex(640, 220, (g, w, h) => { g.fillStyle = "#F1EBDD"; g.beginPath(); g.roundRect(8, 8, w - 16, h - 60, 40); g.fill(); g.beginPath(); g.moveTo(120, h - 56); g.lineTo(90, h - 6); g.lineTo(190, h - 56); g.fill(); g.strokeStyle = P.red; g.lineWidth = 6; g.beginPath(); g.roundRect(8, 8, w - 16, h - 60, 40); g.stroke(); txt(g, s, w / 2, (h - 52) / 2 + 6, `900 64px ${HF}`, P.ink); });
  const bubbles = [["LEGENDA URBAN?", "s5:legenda", -5, 12.2, 3], ["RUMOR...", "s5:Rumornya", 5, 13.2, 1], ["JUTAAN E.T.?", "s5:jutaan", 0, 15.0, 3.5]].map(([s, a, x, y, z]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.2), new THREE.MeshBasicMaterial({ map: bubT(s), transparent: true, toneMapped: false, depthWrite: false })); m.renderOrder = 5; DIO.add(m); return { m, t: AT[a], x, y, z }; });

  // ===== s6: excavator, tarp with recovered boxes =====
  const EX = new THREE.Group(); EX.position.set(1.8, 10, -7.1); DIO.add(EX);
  const yel = std(0xe8a92a, 0.45);
  box(3.6, 0.7, 1.9, M.dark, 0, 0.35, 0, EX);
  const tur = new THREE.Group(); tur.position.y = 0.7; EX.add(tur);
  box(2.2, 0.6, 2.0, yel, 0, 0.3, -0.2, tur); box(1.1, 1.3, 1.1, yel, -0.45, 1.25, 0.25, tur); box(0.05, 0.8, 0.9, std(0x1d2a33, 0.2, 0.6), 0.11, 1.35, 0.25, tur);
  const boom = new THREE.Group(); boom.position.set(0.55, 0.9, 0.6); tur.add(boom);
  box(0.45, 0.45, 5.4, yel, 0, 0, 2.7, boom);
  const stick = new THREE.Group(); stick.position.set(0, 0, 5.4); boom.add(stick);
  box(0.36, 0.36, 3.4, yel, 0, 0, 1.7, stick);
  const bucket = new THREE.Group(); bucket.position.set(0, 0, 3.4); stick.add(bucket);
  box(1.3, 0.8, 0.9, M.dark, 0, 0, 0.35, bucket);
  const inBucket = []; for (let i = 0; i < 3; i++) inBucket.push(box(0.6, 0.38, 0.45, std([0x1f2840, 0xd9772b, 0xc9b48a][i], 0.7), -0.35 + i * 0.35, 0.45, 0.35, bucket));
  EX.scale.setScalar(1.05);
  const tarp = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 7.2), std(0x3a5f8a, 0.8)); tarp.rotation.x = -Math.PI / 2; tarp.position.set(9.7, 10.04, -0.6); tarp.receiveShadow = true; DIO.add(tarp);
  const NR = 40; const IR = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.32, 0.5), new THREE.MeshStandardMaterial({ roughness: 0.6 }), NR); IR.castShadow = true; IR.frustumCulled = false; DIO.add(IR);
  for (let i = 0; i < NR; i++) IR.setColorAt(i, ET_C[i % 3 === 0 ? 1 : i % 3 === 1 ? 0 : 3]);

  // ===== G: city auction =====
  const GX = 55;
  box(20, 3, 7, M.wood, GX, 1.5, 0); box(20.4, 0.2, 7.4, std(0x4a301e, 0.45), GX, 3.05, 0);
  const lot = [];
  [-6, 0, 6].forEach((dx, i) => { const st = box(2.8, 0.5, 1.6, M.dark, GX + dx, 3.4, -0.6); const b = gameBox(3, 4, 0.75); b.position.set(GX + dx, 5.65, -0.6); b.rotation.x = -0.08; scene.add(b); lot.push(b); });
  const tagT = (a, b) => tex(560, 320, (g, w, h) => { paperBg(g, w, h, 80 + a.length, "#efe4c9"); g.fillStyle = P.red; g.fillRect(0, 0, w, 64); txt(g, "LOT LELANG", w / 2, 34, `700 30px ${MF}`, "#fff"); g.fillStyle = "#1c1e22"; g.beginPath(); g.arc(46, 110, 14, 0, 7); g.fill(); txt(g, a, w / 2, 168, `900 ${a.length > 8 ? 84 : 104}px ${HF}`, P.ink); txt(g, b, w / 2, 262, `700 38px ${MF}`, "#7a2a1c"); });
  const tags = [["±880", "DILELANG", "s7:delapan", -6], ["$107.000+", "TERKUMPUL", "s7:seratus", 0], ["> $1.500", "1 COPY E.T.", "s7:Satu", 6]].map(([a, b, at, dx]) => { const G = new THREE.Group(); G.position.set(GX + dx, 8.7, 1.4); scene.add(G); const m = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.09), new THREE.MeshStandardMaterial({ map: tagT(a, b), roughness: 0.85, side: THREE.DoubleSide })); m.position.y = -2.0; m.castShadow = true; G.add(m); const s = box(0.04, 0.6, 0.04, M.red, -2.2, -0.2, 0, G); return { G, t: AT[at] }; });
  const boardT = tex(1024, 180, (g, w, h) => { g.fillStyle = "#1c1e22"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b8893a"; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); txt(g, "LELANG KOTA ALAMOGORDO", w / 2, h / 2 + 2, `900 56px ${HF}`, "#F1EBDD"); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 2.2), new THREE.MeshStandardMaterial({ map: boardT, roughness: 0.5 })); board.position.set(GX, 11.6, -8.5); scene.add(board);
  const auc = avatar({ skin: 0xd9a77a, shirt: 0x24262b, pants: 0x24262b, make: (c) => std(c, 0.6) }); box(0.7, 0.3, 0.2, M.red, 0, 3.85, 0.55, auc.G); box(0.5, 1.6, 0.06, std(0xf1ebdd, 0.6), 0, 3.1, 0.52, auc.G); auc.G.scale.setScalar(1.35); auc.G.position.set(GX + 4.5, 0, -5.4); scene.add(auc.G);
  box(1.6, 0.3, 1.6, M.wood, GX + 7.2, 3.3, -2.2);
  const gav = new THREE.Group(); gav.position.set(GX + 9.8, 3.9, -2.2); scene.add(gav);
  const gh = cyl(0.12, 0.12, 2.6, 10, M.wood, -1.3, 0, 0, gav); gh.rotation.z = Math.PI / 2; const ghd = cyl(0.42, 0.42, 1.3, 16, M.wood, -2.6, 0, 0, gav); ghd.rotation.x = Math.PI / 2;

  // ===== H: museum case =====
  const HX = 95;
  box(7, 8, 7, std(0xe3d8c0, 0.85), HX, 4, 0); box(7.4, 0.3, 7.4, M.brass, HX, 8.1, 0);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(6.4, 6.2, 6.4), new THREE.MeshStandardMaterial({ color: 0xdfefff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.07, envMapIntensity: 0.15, depthWrite: false })); glass.position.set(HX, 11.35, 0); glass.renderOrder = 4; scene.add(glass);
  for (const [x, z] of [[-3.2, -3.2], [3.2, -3.2], [-3.2, 3.2], [3.2, 3.2]]) box(0.14, 6.2, 0.14, M.brass, HX + x, 11.35, z);
  box(6.6, 0.14, 6.6, M.brass, HX, 14.5, 0);
  const relic = gameBox(2.6, 3.5, 0.65); relic.position.set(HX, 10.6, 0); scene.add(relic); box(1.8, 0.5, 1.2, M.dark, HX, 8.5, 0);
  const plaqHT = tex(768, 200, (g, w, h) => { g.fillStyle = "#1c1e22"; g.fillRect(0, 0, w, h); txt(g, "E.T. (1982)", w / 2, 70, `900 64px ${HF}`, "#F1EBDD"); txt(g, "DIGALI DARI TPA ALAMOGORDO", w / 2, 146, `600 32px ${MF}`, "#d9b26a"); });
  const plaqH = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.46), new THREE.MeshStandardMaterial({ map: plaqHT, roughness: 0.4 })); plaqH.position.set(HX, 5.6, 3.52); scene.add(plaqH);
  const evT = tex(420, 260, (g, w, h) => { paperBg(g, w, h, 90, "#efe4c9"); g.fillStyle = "#1c1e22"; g.beginPath(); g.arc(44, h / 2, 16, 0, 7); g.fill(); txt(g, "AUDIRA", w / 2 + 24, 78, `900 76px ${HF}`, P.red); txt(g, "CASE FILE", w / 2 + 24, 150, `800 46px ${HF}`, P.ink); txt(g, "EXHIBIT A · 1983–2014", w / 2 + 24, 212, `600 22px ${MF}`, P.ink); });
  const evPiv = new THREE.Group(); evPiv.position.set(HX + 3.25, 13.8, 3.3); scene.add(evPiv);
  box(0.03, 1.4, 0.03, M.red, 0, -0.7, 0, evPiv);
  const ev = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.98), new THREE.MeshStandardMaterial({ map: evT, roughness: 0.85, side: THREE.DoubleSide })); ev.position.set(0.9, -2.35, 0.05); ev.castShadow = true; evPiv.add(ev);
  for (const x of [-6, 6]) { cyl(0.18, 0.18, 3.4, 12, M.brass, HX + x, 1.7, 6.5); cyl(0.6, 0.7, 0.2, 16, M.brass, HX + x, 0.1, 6.5); }
  const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(HX - 6, 3.3, 6.5), new THREE.Vector3(HX, 2.0, 6.5), new THREE.Vector3(HX + 6, 3.3, 6.5)), 24, 0.14, 8), std(0x8a1a12, 0.6)); rope.castShadow = true; scene.add(rope);

  // AUDIRA case folder on the desk in front of the diorama
  const folderT = tex(720, 520, (g, w, h) => { paperBg(g, w, h, 99, "#d9c294"); g.fillStyle = "#c9ae78"; g.fillRect(0, 0, w, 60); txt(g, "AUDIRA CASE FILE", 40, 32, `800 34px ${MF}`, "#3a2a14", "left"); g.strokeStyle = P.red; g.lineWidth = 7; g.strokeRect(70, 190, 580, 170); txt(g, "EXHIBIT:", w / 2, 236, `700 36px ${MF}`, P.red); txt(g, "ALAMOGORDO 1983", w / 2, 304, `900 64px ${HF}`, P.red); });
  const folder = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 6.5), [M.paper, M.paper, new THREE.MeshStandardMaterial({ map: folderT, roughness: 0.9 }), M.paper, M.paper, M.paper]); folder.position.set(-19, 0.16, 12); folder.rotation.y = 0.32; folder.castShadow = folder.receiveShadow = true; scene.add(folder);

  if (document.fonts) Promise.all(["800 40px Archivo", "900 40px Archivo", "600 30px 'IBM Plex Mono'", "700 30px 'IBM Plex Mono'"].map((f) => document.fonts.load(f))).then(redrawAll).catch(() => {});

  // camera: t, px py pz, lx ly lz
  const c0 = track([
    [0, 15, 23, 40, 0, 9.0, -2.5], [K.s1e - 0.6, 9, 21, 34, 0, 9.0, -2],
    [K.s2 + 1.1, -42, 14, 54, -46, 5.6, 2], [K.s2e - 0.5, -50, 13.5, 51, -47, 5.4, 2],
    [K.s3 + 1.1, -89, 12, 44, -92.5, 4.2, 1], [K.s3e - 0.5, -95, 13, 43, -92.5, 4.4, 1],
    [K.s4 + 1.5, 6, 44, -27, 3, 0, DZ - 5], [AT["s4:Mulai"] - 0.2, -2, 40, -30, 1, 0, DZ - 5],
    [AT["s4:Mulai"] + 1.4, 13, 19.5, 28, 0, 8, 0.5], [K.s4e - 0.4, 8, 17.5, 25, 0, 8, 0.5],
    [K.s5 + 1.2, -8, 22, 46, -4, 9.0, 2], [K.s5e - 0.4, -12, 25, 49, -4, 9.8, 2],
    [K.s6 + 1.4, 22, 28, 46, 1.5, 7, 0], [AT["s6:Sekitar"] - 0.3, 19, 26, 40, 4, 7.5, 0], [AT["s6:Menurut"], 16, 25, 37, 5, 8, 0],
    [AT["s6:total"] + 0.6, -2, 26, 54, 0, 5.5, 0], [K.s6e - 0.4, -6, 24, 56, 0, 5.5, 0],
    [K.s7 + 1.2, 59, 13, 47, GX, 6, 0], [K.s7e - 0.4, 51, 12.5, 44, GX, 6, 0],
    [K.s8 + 1.3, 88, 13, 45, HX + 1, 8, 0], [K.dur, 103, 15, 42, HX + 1.5, 8.5, 0],
  ]);
  const dummy = new THREE.Object3D(), cc = new THREE.Color();
  const capP = (t) => (t < 50.7 ? ramp(t, 8.4, 9.75) : ramp(t, 51.3, 54.4));
  const win = (t, a, b, f = 0.4) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

  function crates(t) {
    const varU = ramp(t, AT["s6:berbagai"] - 0.2, AT["s6:berbagai"] + 0.8);
    SL.forEach((c, i) => {
      const u = (t - c.t0) / 0.55;
      if (u < 0) { dummy.position.set(0, -60, 0); dummy.scale.setScalar(0.001); dummy.rotation.set(0, 0, 0); }
      else if (u < 1) {
        const e = eout(u), sx = c.sx, sy = 11.6, sz = -6.4;
        dummy.position.set(sx + (c.x - sx) * e, sy + (c.y - sy) * u * u + Math.sin(u * Math.PI) * 1.2, sz + (c.z - sz) * e);
        dummy.rotation.set(c.spin * (1 - u) + c.rx, c.ry, c.rz); dummy.scale.set(1, 1, 1);
      } else {
        const g = c.rm ? clamp01((t - c.tr) / 0.3) : 0;
        if (g >= 1) { dummy.position.set(0, -60, 0); dummy.scale.setScalar(0.001); }
        else { dummy.position.set(c.x, c.y + g * 1.5, c.z); dummy.rotation.set(c.rx, c.ry, c.rz); dummy.scale.set(1 - g, c.sq * (1 - g), 1 - g); }
      }
      dummy.updateMatrix(); IC.setMatrixAt(i, dummy.matrix);
      if (varU > 0) { cc.copy(ET_C[c.ci]).lerp(VAR_C[c.vi], varU); IC.setColorAt(i, cc); } else IC.setColorAt(i, ET_C[c.ci]);
    });
    IC.instanceMatrix.needsUpdate = true; IC.instanceColor.needsUpdate = true;
  }

  function investigator(t) {
    const S = [[K.s2, K.s2e, BX + 10.3, 4.8, -1.0, "point"], [K.s3, K.s3e, CX + 7.2, 3.6, -1.05, "mag"], [K.s4, AT["s4:Mulai"], -11.5, DZ + 6, 1.15, "map"], [K.s5, K.s5e, -15.5, 12, 0.9, "up"], [K.s8, K.dur + 1, HX + 4.7, 3.6, -1.25, "case"]];
    const s = S.find(([a, b]) => t >= a - 0.2 && t < b + 0.2);
    inv.G.visible = !!s;
    if (!s) return;
    const [a, , x, z, ry, pose] = s, w = clamp01((t - a - 0.2) / 1.3), walking = w < 1;
    inv.G.position.set(x + (1 - eout(w)) * 5 * Math.sin(ry + Math.PI), 0, z + (1 - eout(w)) * 5 * Math.cos(ry + Math.PI));
    inv.G.rotation.y = ry; restPose(inv); inv.head.rotation.set(0, 0, 0); mag.visible = pose === "mag" || pose === "map" || pose === "case";
    if (walking) { const ph = Math.sin(t * 10) * 0.7 * (1 - w); inv.armL.rotation.x = ph; inv.armR.rotation.x = -ph; inv.legL.rotation.x = -ph; inv.legR.rotation.x = ph; }
    const br = Math.sin(t * 1.7) * 0.03;
    if (pose === "point") { inv.armR.rotation.x = -1.45 * eout(clamp01((t - AT["s2:lima"] + 0.6) / 0.4)) + br; inv.head.rotation.y = 0.1; }
    if (pose === "mag") { inv.armR.rotation.x = -1.1 * w + br; inv.head.rotation.x = 0.25; }
    if (pose === "map") { inv.armR.rotation.x = -0.75 * w + br; inv.head.rotation.x = 0.45; }
    if (pose === "up") { inv.head.rotation.x = -0.45 * w; inv.armL.rotation.z = -0.15; }
    if (pose === "case") { inv.armR.rotation.x = -0.5 * w + br; inv.head.rotation.x = 0.08; }
  }

  return (t) => {
    const p = c0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    const dim = 1 - 0.45 * win(t, K.s5 + 0.3, K.s5e - 0.2, 0.6);
    lamp.position.set(p[3] + 14, p[4] + 52, p[5] + 26); lamp.target.position.set(p[3], 0, p[5]); lamp.intensity = 4.6 * dim;
    rim.position.set(p[3] - 40, 30, p[5] - 40); rim.target.position.set(p[3], 0, p[5]); rim.intensity = 0.55 + 0.9 * (1 - dim);
    hemi.intensity = 0.55 * (0.7 + 0.3 * dim);

    // --- diorama ---
    crates(t); investigator(t);
    const s1 = t < K.s2 + 0.3;
    trucks.forEach((T, k) => {
      const tip = ramp(t, 0.35 + k * 0.15, 1.2 + k * 0.15) * (1 - ramp(t, 7.0, 7.5));
      const off = ramp(t, 7.5 + k * 0.08, 9.6);
      const x = TRK[k] + off * 22;
      T.G.visible = s1 && x < 12.5; T.G.position.set(x - 0.4, 10, -7.05); T.piv.rotation.x = 0.95 * tip;
    });
    const cp = capP(t), front = -7 + 14 * cp;
    capPieces.forEach((c, i) => {
      const f = clamp01((front - c.a) / (c.b - c.a)), open = i === 1 && t > 66.0 && t < 81;
      c.m.visible = f > 0.001 && !open; c.m.scale.x = Math.max(0.001, f); c.m.position.x = c.a + (c.b - c.a) * f / 2;
      c.m.material.roughness = 0.9 - 0.55 * win(t, 8.4, 10.2, 0.2) - 0.55 * win(t, 51.3, 55.2, 0.2);
      const glow = win(t, AT["s4:dicor"] - 0.2, K.s4e, 0.3) * (0.5 + 0.5 * Math.sin(t * 6));
      c.m.material.emissive.setHex(0xff4a2e); c.m.material.emissiveIntensity = 0.28 * glow;
    });
    const pouring = (t > 8.2 && t < 10.0) || (t > 51.0 && t < 54.9);
    MX.visible = pouring; MX.position.set(Math.min(front + 1.2, 9.5), 10, -7.05);
    stream.visible = cp > 0.001 && cp < 0.999; drum.rotation.y = t * 4;
    chunks.forEach((c) => { const u = clamp01((t - 66.0) / 0.7); c.m.visible = t > 66.0 && t < 81; const e = eout(u); c.m.position.set(c.x0 + (c.x1 - c.x0) * e, CAPY + 0.2 + (c.y1 - CAPY) * e + Math.sin(u * Math.PI) * 3, c.z0 + (c.z1 - c.z0) * e); c.m.rotation.set(u * 2, c.ry + u * 3, 0); });
    OL.visible = t < K.s2 + 0.3 || (t > AT["s4:Mulai"] && t < K.s4e + 0.3);
    loc.quaternion.copy(cam.quaternion); loc.scale.setScalar(0.85 + 0.15 * back(clamp01((t - 0.1) / 0.4)));

    // crew: worker waves trucks in during s1 and the replay; dig crew in s6
    const dig = t > K.s6 - 0.3 && t < K.s7 + 0.3;
    C1.G.visible = s1 || dig || (t > 50.6 && t < K.s4e + 0.3);
    C1.G.position.set(-9.7, 10, 4.2); C1.G.rotation.y = 0.5; restPose(C1);
    C1.armR.rotation.z = 2.5 + Math.sin(t * 7) * 0.5; C1.armL.rotation.z = -2.5 - Math.sin(t * 7 + 1) * 0.5;
    C0.G.visible = dig; C0.G.position.set(-10.2, 10, -1.2); C0.G.rotation.y = 1.0; restPose(C0); C0.armR.rotation.x = -1.5; C0.armL.rotation.x = -1.5;
    C2.G.visible = dig; C2.G.position.set(10.9, 10, 4.4); C2.G.rotation.y = -2.6; restPose(C2); C2.armR.rotation.x = -0.9 - 0.4 * Math.max(0, Math.sin(t * 3)); C2.armL.rotation.x = -0.9;

    // excavator dig cycle
    EX.visible = dig;
    if (dig) {
      const cyc = Math.max(0, t - 64.6) / 3.0, ph = cyc - Math.floor(cyc);
      const sw = ph < 0.42 ? 0 : ph < 0.62 ? smoothP((ph - 0.42) / 0.2) : ph < 0.8 ? 1 : 1 - smoothP((ph - 0.8) / 0.2);
      const lower = ph < 0.3 ? smoothP(ph / 0.3) : ph < 0.42 ? 1 - smoothP((ph - 0.3) / 0.12) : 0;
      tur.rotation.y = 0.05 + sw * 0.95;
      boom.rotation.x = -0.45 + lower * 0.85; stick.rotation.x = 0.95 + lower * 0.45; bucket.rotation.x = ph > 0.66 && ph < 0.8 ? 1.4 : 0.3 - lower * 0.2;
      const full = t > 66.0 && ph > 0.3 && ph < 0.7; inBucket.forEach((b) => (b.visible = full));
    }
    const nRec = Math.floor(clamp01((t - 66.6) / (79.0 - 66.6)) * NR);
    for (let i = 0; i < NR; i++) {
      const on = dig && i < nRec; const c = i % 5, rw = Math.floor(i / 5);
      dummy.position.set(8.4 + c * 0.66, on ? 10.22 : -60, -3.6 + rw * 0.8); dummy.rotation.set(0, (i % 3) * 0.1 - 0.1, 0); dummy.scale.setScalar(on ? 1 : 0.001); dummy.updateMatrix(); IR.setMatrixAt(i, dummy.matrix);
    }
    IR.instanceMatrix.needsUpdate = true; tarp.visible = dig;

    bubbles.forEach((b) => { const u = clamp01((t - b.t) / 0.45), out = ramp(t, K.s5e - 0.1, K.s5e + 0.4); b.m.visible = u > 0 && out < 1; b.m.position.set(b.x, b.y + (t - b.t) * 0.25, b.z); b.m.quaternion.copy(cam.quaternion); b.m.scale.setScalar(Math.max(0.001, back(u, 2) * (1 - out))); });

    // --- B calendar ---
    let done = 0; FLIPS.forEach((f) => { if (t >= f + 0.38) done++; });
    const cur = FLIPS.findIndex((f) => t >= f && t < f + 0.38);
    if (cur >= 0) { flip.visible = true; flipM.map = pages[cur]; under.material.map = pages[cur + 1]; flipPiv.rotation.x = -0.1 - Math.PI * eout((t - FLIPS[cur]) / 0.38); }
    else { flip.visible = false; under.material.map = pages[Math.min(5, done)]; }
    const pin1 = back(clamp01((t - AT["s2:Steven"]) / 0.4), 2), pin2 = back(clamp01((t - AT["s2:Howard"]) / 0.4), 2);
    pl1.scale.setScalar(Math.max(0.001, pin1)); pl2.scale.setScalar(Math.max(0.001, pin2));

    // --- C stacks ---
    stackL.forEach((m, i) => { const ti = i === 0 ? K.s3 - 1 : AT["s3:lima"] - 0.3 + (i - 1) * 0.13; const u = clamp01((t - ti) / 0.35); m.visible = u > 0; m.position.set(CX - 3 + Math.sin(i * 2.1) * 0.12, 0.43 + i * 0.88 + (1 - eout(u)) * 6, 0); m.rotation.y = Math.sin(i * 1.7) * 0.06; });
    stackR.forEach((m, i) => { const ti = AT["s3:satu#2"] - 0.2 + i * 0.16; const u = clamp01((t - ti) / 0.35); m.visible = u > 0; m.position.set(CX + 3 + Math.sin(i * 2.7) * 0.12, 0.43 + i * 0.88 + (1 - eout(u)) * 6, 0); m.rotation.y = Math.sin(i * 1.3) * 0.06; });
    sgL.scale.setScalar(Math.max(0.001, back(clamp01((t - AT["s3:lima"]) / 0.4), 2))); sgR.scale.setScalar(Math.max(0.001, back(clamp01((t - AT["s3:satu#2"]) / 0.4), 2)));

    // --- D map ---
    const rp = ramp(t, AT["s4:sepuluh"] - 0.3, AT["s4:El"] + 0.6);
    let acc = 0; const totL = segs.reduce((s, g) => s + g.L, 0);
    segs.forEach((g) => { const f = clamp01((rp * totL - acc) / g.L); acc += g.L; g.m.visible = f > 0.001; g.m.scale.z = Math.max(0.001, f); g.m.position.z = (g.L * f) / 2; });
    const pa = back(clamp01((t - AT["s4:El"]) / 0.4), 2), pb = back(clamp01((t - K.s4 - 1.2) / 0.4), 2);
    pinA.scale.setScalar(Math.max(0.001, pa)); pinB.scale.setScalar(Math.max(0.001, pb)); pinB.position.y = 0.05 + Math.abs(Math.sin(t * 3)) * 0.3 * pb;
    minis.forEach((G, i) => { const u = (t - AT["s4:sepuluh"] - 0.4 - i * 0.55) / 4.2; G.visible = u > 0 && u < 1.05 && t < AT["s4:Mulai"] + 1; const [x, z, a] = routeAt(u); G.position.set(x, 0.1, z); G.rotation.y = a; });

    // --- G auction ---
    tags.forEach((g) => { const u = clamp01((t - g.t) / 0.5); g.G.visible = u > 0; g.G.scale.setScalar(Math.max(0.001, eout(u))); g.G.rotation.z = Math.sin((t - g.t) * 4) * 0.25 * Math.exp(-(t - g.t) * 1.2) * (u > 0 ? 1 : 0); g.G.rotation.y = -0.12; });
    const hits = [AT["s7:melelang"], AT["s7:dolar"], AT["s7:dolar#2"]];
    let gs = 0; hits.forEach((h) => { const d = t - h; if (d > -0.45 && d < 0) gs = Math.max(gs, d < -0.08 ? smoothP((d + 0.45) / 0.3) : -d / 0.08); });
    gav.rotation.z = -0.9 * gs;
    restPose(auc); auc.armR.rotation.x = -0.9 - 0.6 * gs; auc.head.rotation.y = Math.sin(t * 0.9) * 0.25;

    // --- H museum ---
    relic.rotation.y = Math.sin(t * 0.5) * 0.5; evPiv.rotation.z = Math.sin(t * 1.3) * 0.04;

    comp.render();
  };
}
function smoothP(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
