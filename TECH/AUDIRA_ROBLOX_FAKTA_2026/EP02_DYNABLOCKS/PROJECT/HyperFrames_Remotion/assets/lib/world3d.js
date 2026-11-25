// DYNABLOCKS: a retro computing lab on a walnut desk. The camera dollies along a desk-top timeline rail, 1989 to 2013, and a 1-bit physics sim on a beige computer grows into 3D blocks. Illustration, no Roblox assets, no real likeness. Every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, std, box, cyl, stage, avatar, runPose, restPose } from "./lib3d.js";

const X3 = 26, X4 = 48, X5 = 70, X6 = 94, X7 = 118, X8 = 140;
const C = { beige: 0xd8d2c4, beige2: 0xcac3b3, beige3: 0xa79f8c, ink: 0x222222, teal: 0x1d3b3a, teal2: 0x2f6b67, green: 0x3fbf7f, red: 0xd94a38, walnut: 0x5b3a24, brass: 0xc9a45c, amber: 0xe2a93b };
const TEAL = "#1D3B3A", WHITE = "#F4F1E8", INK = "#222222", GRN = "#3FBF7F", RED = "#D94A38", BEIGE = "#D8D2C4";
const VT = "VT323, monospace", SG = "'Space Grotesk', sans-serif";

// Canvas textures that repaint whenever another web font finishes loading, so labels never keep a fallback face.
const texs = [];
function tex(w, h, draw, rep) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  if (rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); }
  const o = { paint() { const g = c.getContext("2d"); g.clearRect(0, 0, w, h); draw(g, w, h); tx.needsUpdate = true; } };
  o.paint(); texs.push(o); return tx;
}
let fkey = -1;
function fontsTick() {
  let n = 0;
  try { document.fonts.forEach((f) => { if (f.status === "loaded") n++; }); } catch (e) {}
  if (n !== fkey) { fkey = n; texs.forEach((o) => o.paint()); }
}
const faceMats = (tx, base, rough = 0.6, face = 4) => [0, 1, 2, 3, 4, 5].map((k) => (k === face ? new THREE.MeshStandardMaterial({ map: tx, roughness: rough }) : std(base, rough)));

// 1-bit physics toy: ball down a ramp, along the floor, into a spring and back.
const P = 3.4;
function simState(t) {
  const u = (((t % P) + P) % P) / P;
  const A = [98, 179], B = [436, 470], SR = 640;
  let x, y = 470, vx = 0, vy = 0, sp = SR, vis = 1;
  if (u < 0.42) { const s = (u / 0.42) ** 2, k = (2 * u) / 0.42; x = A[0] + (B[0] - A[0]) * s; y = A[1] + (B[1] - A[1]) * s; vx = (B[0] - A[0]) * k * 0.22; vy = (B[1] - A[1]) * k * 0.22; }
  else if (u < 0.6) { x = B[0] + (SR - 28 - B[0]) * ((u - 0.42) / 0.18); vx = 130; }
  else if (u < 0.7) { const s = Math.sin(((u - 0.6) / 0.1) * Math.PI / 2); x = SR - 28 + 52 * s; sp = SR + 52 * s; vx = 130 * (1 - s); }
  else if (u < 0.92) { const s = eout((u - 0.7) / 0.22); x = SR + 24 - 230 * s; sp = SR + 52 * (1 - clamp01((u - 0.7) / 0.05)); vx = -150 * (1 - s); }
  else { x = SR + 24 - 230; vis = Math.floor(u * 60) % 2; }
  return { x, y, vx, vy, sp, vis, u };
}
let pat = null;
function dither(g) {
  if (!pat) { const c = document.createElement("canvas"); c.width = c.height = 6; const q = c.getContext("2d"); q.fillStyle = WHITE; q.fillRect(0, 0, 3, 3); q.fillRect(3, 3, 3, 3); pat = c; }
  return g.createPattern(pat, "repeat");
}
function pixelGuy(g, x, y, s, push) {
  g.fillStyle = WHITE;
  g.fillRect(x + s, y, s * 2, s * 2); // head
  g.fillRect(x, y + s * 2, s * 4, s * 3); // torso
  g.fillRect(x, y + s * 5, s * 1.6, s * 3); g.fillRect(x + s * 2.4, y + s * 5, s * 1.6, s * 3); // legs
  if (push) g.fillRect(x + s * 4, y + s * 2.4, s * 2.6, s * 1.1); else g.fillRect(x + s * 4, y + s * 2, s, s * 3);
  g.fillStyle = TEAL; g.fillRect(x + s * 1.4, y + s * 0.6, s * 0.4, s * 0.4); g.fillRect(x + s * 2.3, y + s * 0.6, s * 0.4, s * 0.4);
}
function drawSim(g, w, h, t) {
  g.fillStyle = TEAL; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(244,241,232,.07)"; g.lineWidth = 1;
  for (let x = 40; x < w; x += 40) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, h); g.stroke(); }
  for (let y = 80; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = WHITE; g.fillRect(0, 0, w, 58);
  g.fillStyle = TEAL; for (let i = 0; i < 5; i++) g.fillRect(520, 13 + i * 7, 250, 3);
  g.font = `46px ${VT}`; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText("SIMULASI FISIKA 2D", 22, 31);
  const st = simState(t), D = dither(g);
  // support block and ramp, dithered fill, white outline
  g.fillStyle = D; g.fillRect(20, 200, 60, 298);
  g.beginPath(); g.moveTo(80, 200); g.lineTo(80, 498); g.lineTo(420, 498); g.closePath(); g.fill();
  g.strokeStyle = WHITE; g.lineWidth = 4; g.strokeRect(20, 200, 60, 298);
  g.beginPath(); g.moveTo(80, 200); g.lineTo(420, 498); g.stroke();
  g.beginPath(); g.moveTo(10, 498); g.lineTo(790, 498); g.stroke();
  // spring and wall
  g.fillStyle = D; g.fillRect(760, 380, 30, 118); g.strokeRect(760, 380, 30, 118);
  g.beginPath(); const n = 9, x0 = st.sp, x1 = 760;
  for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, y = i % 2 ? 446 : 492; i ? g.lineTo(x, y) : g.moveTo(x, 470); }
  g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(st.sp, 436); g.lineTo(st.sp, 498); g.stroke();
  // pixel kid on the platform, pushes at the start of each run
  pixelGuy(g, 28, 134, 8, st.u < 0.08);
  // dashed path ghost
  g.setLineDash([8, 10]); g.lineWidth = 2; g.beginPath(); g.moveTo(98, 179); g.lineTo(436, 470); g.lineTo(612, 470); g.stroke(); g.setLineDash([]);
  if (st.vis) {
    g.fillStyle = WHITE; g.beginPath(); g.arc(st.x, st.y, 28, 0, 7); g.fill();
    const a = st.x / 28; g.strokeStyle = TEAL; g.lineWidth = 5; g.beginPath(); g.moveTo(st.x - Math.cos(a) * 22, st.y - Math.sin(a) * 22); g.lineTo(st.x + Math.cos(a) * 22, st.y + Math.sin(a) * 22); g.stroke();
    const sp = Math.hypot(st.vx, st.vy);
    if (sp > 20) { // velocity arrow, a drafting callout
      const ux = st.vx / sp, uy = st.vy / sp, L = 30 + sp * 0.35, sx = st.x + ux * 34, sy = st.y + uy * 34 - 44, ex = sx + ux * L, ey = sy + uy * L;
      g.strokeStyle = WHITE; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - ux * 14 - uy * 8, ey - uy * 14 + ux * 8); g.lineTo(ex - ux * 14 + uy * 8, ey - uy * 14 - ux * 8); g.closePath(); g.fillStyle = WHITE; g.fill();
      g.font = `34px ${VT}`; g.fillText("v", ex + 8, ey - 10);
    }
  }
  g.fillStyle = WHITE; g.font = `34px ${VT}`; g.textAlign = "left"; g.fillText(`t = ${(st.u * P).toFixed(2)} s`, 24, 560);
  g.textAlign = "right"; g.fillText(Math.floor(t * 2) % 2 ? "JALAN _" : "JALAN", 776, 560);
  g.fillStyle = "rgba(0,0,0,.16)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1.5);
}

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: C.beige, exp: 1.02, bloom: [0.14, 0.45, 0.86] });
  try { ["40px VT323", "700 40px 'Space Grotesk'", "500 40px 'Space Grotesk'"].forEach((f) => document.fonts.load(f)); } catch (e) {}
  const hemi = new THREE.HemisphereLight(0xfff4e2, 0x6b4a33, 1.35); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 }); sun.shadow.bias = -0.0006; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const spot = new THREE.SpotLight(0xffc98a, 0, 60, 0.32, 0.65, 0); spot.position.set(X7 + 2.5, 15, 8); spot.target.position.set(X7, 2.3, -1); scene.add(spot, spot.target);
  const rnd = mulberry(2002);
  const bgDay = new THREE.Color(C.beige), bgNight = new THREE.Color(0x2e2b27);

  // desk, wall, timeline rail
  const wood = tex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#5b3a24"; g.fillRect(0, 0, w, h); const r = mulberry(7);
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#603d26" : "#563622"; g.fillRect(0, (i * h) / 4, w, h / 4); g.fillStyle = "rgba(20,10,4,.6)"; g.fillRect(0, (i * h) / 4, w, 3); }
    for (let i = 0; i < 420; i++) { const y = r() * h; g.strokeStyle = `rgba(${r() < 0.5 ? "30,16,6" : "140,96,60"},${0.06 + r() * 0.12})`; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 14 * r(), w * 0.6, y - 14 * r(), w, y + 6 * r()); g.stroke(); }
  }, [14, 4]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(300, 90), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5 })); desk.rotation.x = -Math.PI / 2; desk.position.set(70, 0, 10); desk.receiveShadow = true; scene.add(desk);
  const peg = tex(256, 256, (g, w, h) => { g.fillStyle = BEIGE; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(60,50,40,.22)"; for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }, [80, 18]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(320, 72), new THREE.MeshStandardMaterial({ map: peg, roughness: 0.9 })); wall.position.set(70, 34, -26); wall.receiveShadow = true; scene.add(wall);
  box(300, 0.04, 0.26, std(C.ink, 0.4), 70, 0.02, 9.5);
  const tickN = 150, ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.05, 0.7), std(C.ink, 0.4), tickN); const dm = new THREE.Object3D();
  for (let i = 0; i < tickN; i++) { dm.position.set(-20 + i * 1.2, 0.03, 9.5); dm.scale.set(1, 1, i % 5 ? 0.5 : 1); dm.updateMatrix(); ticks.setMatrixAt(i, dm.matrix); } scene.add(ticks);
  function yearTag(year, x, z, ry = 0) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    box(0.14, 1.9, 0.14, std(C.ink, 0.5), 0, 0.95, 0, G);
    const tx = tex(256, 128, (g, w, h) => { g.fillStyle = TEAL; g.fillRect(0, 0, w, h); g.strokeStyle = WHITE; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = WHITE; g.font = `100px ${VT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(year, w / 2, h / 2 + 4); });
    const m = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 0.12), faceMats(tx, C.teal)); m.position.y = 2.3; m.castShadow = true; G.add(m);
    return G;
  }

  // the beige computer; all screens share the live sim texture
  const scr = document.createElement("canvas"); scr.width = 800; scr.height = 600; const sg = scr.getContext("2d");
  const scrT = new THREE.CanvasTexture(scr); scrT.colorSpace = THREE.SRGBColorSpace; scrT.anisotropy = 8;
  const scrM = new THREE.MeshBasicMaterial({ map: scrT, color: 0xe8e8e8, toneMapped: false });
  const keysT = tex(512, 176, (g, w, h) => { g.fillStyle = "#c2bba9"; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let k = 0; k < 14; k++) { g.fillStyle = r === 3 && k > 3 && k < 10 ? "#e6e0d2" : k % 7 === 0 ? "#9d9583" : "#e6e0d2"; if (r === 3 && k > 4 && k < 10) continue; g.fillRect(8 + k * 35.8, 10 + r * 41, 31, 35); } g.fillStyle = "#e6e0d2"; g.fillRect(8 + 4 * 35.8, 10 + 3 * 41, 35.8 * 6 - 5, 35); });
  function computer(x, z, s, ry = 0) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); G.rotation.y = ry; scene.add(G);
    const bm = std(C.beige, 0.62), bd = std(C.beige2, 0.6), dk = std(0x2a2a28, 0.5);
    box(11, 1.4, 10, bd, 0, 0.7, -0.5, G);
    box(10, 8.6, 8.5, bm, 0, 5.7, -0.6, G);
    box(9.2, 7.0, 0.3, bd, 0, 6.4, 3.75, G);
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 5.55), scrM); sm.position.set(0, 6.55, 3.92); G.add(sm);
    box(3.4, 0.24, 0.2, dk, 2.0, 2.15, 3.72, G);
    const led = box(0.42, 0.2, 0.1, new THREE.MeshBasicMaterial({ color: C.green, toneMapped: false }), -3.6, 2.15, 3.72, G); led.castShadow = false;
    for (let i = 0; i < 6; i++) box(0.18, 0.1, 5, dk, -3 + i * 0.5, 10.02, -1.2, G);
    const kb = new THREE.Mesh(new THREE.BoxGeometry(10, 0.55, 3.4), faceMats(keysT, C.beige2, 0.6, 2)); kb.position.set(0, 0.28, 6.5); kb.castShadow = kb.receiveShadow = true; G.add(kb);
    return G;
  }
  computer(0, 0, 0.8);
  yearTag("1989", -3.6, 7.2, 0.15);
  // floppies and a pencil cup
  [[C.ink, 0], [C.teal2, 0.25], [C.red, -0.2], [C.beige3, 0.1]].forEach(([c, r], i) => { const f = box(2.6, 0.12, 2.6, std(c, 0.5), -6.6, 0.07 + i * 0.13, 3.2, scene); f.rotation.y = r; });
  const cup = cyl(0.9, 0.8, 2, 20, std(C.teal2, 0.4), 6.2, 1, -0.8); [0.2, -0.25, 0.05].forEach((o, i) => { const p = cyl(0.1, 0.1, 3.2, 6, std([C.amber, C.red, C.green][i], 0.5), 6.2 + o, 2.3, -0.8 + o); p.rotation.z = o; });

  // 1998: drafting board for the engineer, the company in a crate, the buyer's sign
  const blue = tex(640, 460, (g, w, h) => {
    g.fillStyle = "#efeadf"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(34,34,34,.12)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
    g.beginPath(); g.moveTo(70, 120); g.lineTo(70, 330); g.lineTo(330, 330); g.closePath(); g.stroke();
    g.beginPath(); g.arc(120, 100, 26, 0, 7); g.stroke();
    g.beginPath(); for (let i = 0; i <= 8; i++) { const x = 400 + i * 22, y = i % 2 ? 290 : 330; i ? g.lineTo(x, y) : g.moveTo(x, 310); } g.stroke(); g.strokeRect(576, 260, 20, 70);
    g.lineWidth = 2; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(70, 360); g.lineTo(330, 360); g.stroke(); g.setLineDash([]);
    g.fillStyle = INK; g.font = `30px ${VT}`; g.textAlign = "center"; g.fillText("BIDANG MIRING", 200, 392); g.fillText("PEGAS", 498, 370);
    g.fillStyle = RED; g.beginPath(); g.arc(120, 100, 6, 0, 7); g.fill();
    g.fillStyle = INK; g.fillRect(380, 380, 236, 58); g.fillStyle = WHITE; g.font = `34px ${VT}`; g.fillText("BAGIAN TEKNIK", 498, 410);
  });
  const dB = new THREE.Group(); dB.position.set(X3 - 4.8, 0, -1.6); scene.add(dB);
  box(0.25, 3.0, 0.25, std(C.ink, 0.5), -2.2, 1.5, -0.6, dB); box(0.25, 3.0, 0.25, std(C.ink, 0.5), 2.2, 1.5, -0.6, dB);
  const board = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.0, 0.16), faceMats(blue, C.beige2)); board.position.set(0, 3.6, -0.3); board.rotation.x = -0.42; board.castShadow = true; dB.add(board);
  const crateT = tex(512, 456, (g, w, h) => {
    g.fillStyle = "#b98b52"; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#b08249" : "#c0935a"; g.fillRect(0, (i * h) / 6, w, h / 6); g.fillStyle = "rgba(60,36,12,.6)"; g.fillRect(0, (i * h) / 6, w, 3); }
    g.strokeStyle = "#6e4a24"; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22); g.beginPath(); g.moveTo(20, 20); g.lineTo(w - 20, h - 20); g.stroke();
    g.fillStyle = "rgba(34,34,34,.85)"; g.font = `700 54px ${SG}`; g.textAlign = "center"; g.fillText("KNOWLEDGE", w / 2, 190); g.fillText("REVOLUTION", w / 2, 256); g.font = `40px ${VT}`; g.fillText("INTERACTIVE PHYSICS", w / 2, 314);
  });
  const crate = new THREE.Group(); scene.add(crate);
  const cm = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 3.2), faceMats(crateT, 0xa47a45, 0.75)); cm.position.y = 1.6; cm.castShadow = cm.receiveShadow = true; crate.add(cm);
  const priceT = tex(320, 150, (g, w, h) => { g.fillStyle = RED; g.beginPath(); g.moveTo(40, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(40, h); g.lineTo(0, h / 2); g.closePath(); g.fill(); g.fillStyle = WHITE; g.beginPath(); g.arc(34, h / 2, 10, 0, 7); g.fill(); g.font = `700 64px ${SG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$20 JUTA", 186, h / 2 + 2); });
  const price = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.22), new THREE.MeshStandardMaterial({ map: priceT, transparent: true, roughness: 0.5, side: THREE.DoubleSide })); price.castShadow = true; scene.add(price);
  const mscT = tex(640, 170, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.strokeStyle = WHITE; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = WHITE; g.font = `700 92px ${SG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("MSC SOFTWARE", w / 2, h / 2 + 4); });
  const msc = new THREE.Group(); msc.position.set(X3 + 4.0, 0, -2.4); scene.add(msc);
  box(0.2, 3.4, 0.2, std(C.ink, 0.5), -2.3, 1.7, 0, msc); box(0.2, 3.4, 0.2, std(C.ink, 0.5), 2.3, 1.7, 0, msc);
  const mscP = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.5, 0.16), faceMats(mscT, C.ink)); mscP.position.y = 3.6; mscP.castShadow = true; msc.add(mscP);
  const dock = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.8), new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.55 })); dock.rotation.x = -Math.PI / 2; dock.position.set(X3 + 3.4, 0.012, 2.3); scene.add(dock);
  const dockIn = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.4), std(0x6e5038, 0.6)); dockIn.rotation.x = -Math.PI / 2; dockIn.position.set(X3 + 3.4, 0.014, 2.3); scene.add(dockIn);
  yearTag("1998", X3 - 8.6, 4.6, 0.1);

  // brick pool for the whole film: school stacks, the first world, and the 2D-to-3D ramp
  const bricks = [];
  const BCOL = [C.green, C.red, C.amber, C.teal2, C.beige];
  // students around a second computer
  computer(X4, -1.4, 0.6);
  const studs = [];
  const skins = [0xf5cd30, 0xe8b88a, 0xc68642, 0x8d5524], shirts = [C.red, C.teal2, C.amber, C.green, 0x6b6bd9, C.beige3];
  for (let i = 0; i < 12; i++) {
    const a = -1.2 + (i * 2.4) / 11, R = 5.3 + (i % 2) * 1.2;
    if (i === 5 || i === 6) continue;
    const x = X4 + Math.sin(a) * R * 1.12, z = -0.9 + Math.cos(a) * R * 0.95;
    const A = avatar({ skin: skins[i % 4], shirt: shirts[i % 6], pants: i % 2 ? C.ink : C.teal }); A.G.scale.setScalar(0.4); scene.add(A.G);
    const dx = X4 - x, dz = -1.4 - z, L = Math.hypot(dx, dz), sx = x + (dx / L) * 1.15, sz = z + (dz / L) * 1.15;
    const t0 = AT["s4:pelajar"] - 0.2 + studs.length * 0.07;
    studs.push({ A, x, z, ry: Math.atan2(dx, dz), t0, ph: rnd() * 6 });
    const nb = 3 + (i % 3), tb = AT["s4:inspirasi"] - 0.3 + studs.length * 0.11;
    for (let k = 0; k < nb; k++) bricks.push({ x: sx, y: 0.25 + k * 0.5, z: sz, sx: 0.8, sy: 0.48, sz: 0.8, c: BCOL[(i + k) % 5], t0: tb + k * 0.5, kind: 0 });
  }
  for (let k = 0; k < 5; k++) bricks.push({ x: X4 + 0.1, y: 0.25 + k * 0.5, z: 6.0, sx: 0.85, sy: 0.48, sz: 0.85, c: BCOL[(k + 2) % 5], t0: AT["s4:Dunianya"] - 0.2 + k * 0.62, kind: 0 });

  // 2003-2004: split-flap name board, a cord to pull, ROBOTS + BLOCKS
  const nameT = ["PROTOTIPE", "eBlocks", "GoBlocks", "DynaBlocks", "ROBLOX"].map((s, i) => tex(1024, 320, (g, w, h) => {
    g.fillStyle = i === 4 ? GRN : i === 0 ? TEAL : BEIGE; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, h / 2 - 2, w, 4);
    g.fillStyle = i === 0 ? WHITE : INK; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = i === 0 ? `150px ${VT}` : `700 ${i === 4 ? 190 : 160}px ${SG}`; g.fillText(s, w / 2, h / 2 + 8);
  }));
  const nb = new THREE.Group(); nb.position.set(X5, 0, -1.2); scene.add(nb);
  box(9.4, 3.5, 0.5, std(C.ink, 0.5), 0, 4.6, 0, nb);
  box(0.3, 3.0, 0.3, std(C.ink, 0.5), -4.2, 1.5, 0, nb); box(0.3, 3.0, 0.3, std(C.ink, 0.5), 4.2, 1.5, 0, nb);
  const tileMat = new THREE.MeshStandardMaterial({ map: nameT[0], roughness: 0.55, emissive: 0x3fbf7f, emissiveIntensity: 0 });
  const tile = new THREE.Mesh(new THREE.BoxGeometry(8.7, 2.72, 0.3), [0, 1, 2, 3, 4, 5].map((k) => (k === 4 ? tileMat : std(C.beige3, 0.6)))); tile.position.set(0, 4.6, 0.42); tile.castShadow = true; nb.add(tile);
  const cord = cyl(0.04, 0.04, 1.0, 6, std(C.red, 0.5), 0.84, 2.6, 0.5, nb); const knob = cyl(0.16, 0.16, 0.3, 10, std(C.red, 0.5), 0.84, 2.0, 0.5, nb);
  const smallT = ["ROBOTS", "BLOCKS"].map((s) => tex(512, 170, (g, w, h) => { g.fillStyle = TEAL; g.fillRect(0, 0, w, h); g.strokeStyle = WHITE; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = WHITE; g.font = `130px ${VT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, w / 2, h / 2 + 6); }));
  const smalls = smallT.map((tx, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.96, 0.24), faceMats(tx, C.teal)); m.castShadow = true; scene.add(m); return { m, t: AT[i ? "s5:blocks" : "s5:robots"], x: X5 + (i ? 2.65 : -2.65) }; });
  yearTag("2003", X5 - 6.3, 3.2, 0.1); yearTag("2004", X5 + 6.3, 3.2, -0.1);

  // 2006: the first small world on a green plate, two founders, a few dozen testers, a calendar
  box(8.4, 0.4, 8.4, std(C.green, 0.55), X6, 0.2, 0);
  const W = [], wadd = (gx, gy, gz, c) => W.push([gx, gy, gz, c]);
  for (let y = 0; y < 2; y++) for (let x = -4; x <= -2; x++) for (let z = -3; z <= -1; z++) if (x === -4 || x === -2 || z === -3 || z === -1) if (!(y === 0 && x === -3 && z === -1)) wadd(x, y, z, C.beige);
  for (let x = -4; x <= -2; x++) for (let z = -3; z <= -1; z++) wadd(x, 2, z, C.red); wadd(-3, 3, -2, C.red);
  for (let y = 0; y < 3; y++) wadd(2, y, -2, C.walnut); for (let x = 1; x <= 3; x++) for (let z = -3; z <= -1; z++) wadd(x, 3, z, 0x2e8b57); wadd(2, 4, -2, 0x2e8b57);
  for (let s = 0; s < 4; s++) for (let y = 0; y <= 3 - s; y++) wadd(-1 + s, y, 2, s % 2 ? C.amber : C.teal2);
  wadd(3, 0, 3, C.red); wadd(-4, 0, 3, C.amber);
  const wT0 = AT["s6:membuat"] - 0.1, wT1 = AT["s6:lalu"] + 0.2;
  W.forEach(([gx, gy, gz, c], i) => bricks.push({ x: X6 + gx * 0.84, y: 0.4 + 0.27 + gy * 0.54, z: gz * 0.84, sx: 0.8, sy: 0.52, sz: 0.8, c, t0: wT0 + (i / W.length) * (wT1 - wT0), kind: 0 }));
  const F1 = avatar({ skin: 0xf5cd30, shirt: C.red, pants: C.ink }), F2 = avatar({ skin: 0xf5cd30, shirt: C.teal2, pants: C.beige3 });
  [F1, F2].forEach((F, i) => { F.G.scale.setScalar(0.55); F.G.position.set(X6 + (i ? 5.0 : -5.0), 0, i ? 0.6 : 1.4); F.G.rotation.y = i ? -Math.PI / 2 : Math.PI / 2; scene.add(F.G); });
  const NT = 36, testers = [];
  const tGeo = [new THREE.BoxGeometry(0.9, 0.9, 0.46), new THREE.BoxGeometry(0.92, 0.9, 0.48), new THREE.BoxGeometry(0.62, 0.62, 0.62)];
  const tI = tGeo.map((g) => { const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: 0.5 }), NT); m.castShadow = true; m.frustumCulled = false; scene.add(m); return m; });
  for (let i = 0; i < NT; i++) {
    const a = 0.62 + (i / (NT - 1)) * (2 * Math.PI - 1.24), ring = i % 2, x = X6 + Math.sin(a) * (6.8 + ring * 1.3), z = Math.cos(a) * (5.9 + ring * 1.1);
    testers.push({ x, z, ry: Math.atan2(X6 - x, -z), t0: AT["s6:lusin"] - 0.35 + ((i * 7) % NT) * 0.028, ph: rnd() * 6 });
    tI[0].setColorAt(i, new THREE.Color([C.ink, C.teal, C.beige3][i % 3])); tI[1].setColorAt(i, new THREE.Color(shirts[i % 6])); tI[2].setColorAt(i, new THREE.Color(skins[i % 4]));
  }
  const calT = tex(360, 420, (g, w, h) => { g.fillStyle = "#f7f3e8"; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.fillRect(0, 0, w, 110); g.fillStyle = WHITE; g.font = `700 82px ${SG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SEP", w / 2, 60); g.fillStyle = INK; g.font = `700 200px ${SG}`; g.fillText("1", w / 2, 236); g.font = `76px ${VT}`; g.fillText("2006", w / 2, 372); for (let i = 0; i < 6; i++) { g.fillStyle = "#555"; g.beginPath(); g.arc(50 + i * 52, 14, 7, 0, 7); g.fill(); } });
  const cal = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.4, 0.5), faceMats(calT, 0xe9e3d3)); cal.castShadow = true; scene.add(cal);
  yearTag("2006", X6 - 7.4, 3.2, 0.15);

  // 2013: a plaque under one warm light
  const plaqT = tex(800, 440, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#d8b56c"); gr.addColorStop(0.5, "#b48a45"); gr.addColorStop(1, "#cfa860"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5b4220"; g.lineWidth = 6; g.strokeRect(22, 22, w - 44, h - 44); g.lineWidth = 2; g.strokeRect(34, 34, w - 68, h - 68);
    g.fillStyle = "#3a2a14"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `600 92px ${SG}`; g.fillText("ERIK CASSEL", w / 2, 180);
    g.fillRect(w / 2 - 120, 246, 240, 4); g.font = `500 76px ${SG}`; g.fillText("2013", w / 2, 316);
  });
  const pq = new THREE.Group(); pq.position.set(X7, 0, -1); scene.add(pq);
  box(7.4, 0.4, 2.0, std(C.walnut, 0.45), 0, 0.2, 0, pq);
  const back_ = box(7.0, 4.2, 0.5, std(0x4a2e1c, 0.4), 0, 2.55, -0.1, pq); back_.rotation.x = -0.1;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 3.3), new THREE.MeshStandardMaterial({ map: plaqT, roughness: 0.35, metalness: 0.55 })); plate.position.set(0, 2.57, 0.17); plate.rotation.x = -0.1; pq.add(plate);
  yearTag("2013", X7 + 4.6, 2.2, -0.2);
  const motes = []; for (let i = 0; i < 14; i++) motes.push([rnd() * 5 - 2.5, rnd() * 5 + 1, rnd() * 3, rnd() * 6]);
  const moteG = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.6, toneMapped: false }), motes.length); moteG.frustumCulled = false; scene.add(moteG);

  // finale: the old screen lies flat, its 2D ramp rises into bricks
  const slabDraw = (ball) => (g, w, h) => {
    g.fillStyle = TEAL; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(244,241,232,.08)"; g.lineWidth = 1;
    for (let x = 0; x < w; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const D = dither(g); g.fillStyle = D; g.strokeStyle = WHITE; g.lineWidth = 6;
    // side profile of the ramp drawn across the band where the bricks stand (canvas x = (dx + 6) * 100)
    g.beginPath(); g.moveTo(100, 250); for (let j = 0; j < 9; j++) { const x0 = 100 + j * 90, top = 250 + j * 26; g.lineTo(x0, top); g.lineTo(x0 + 90, top); } g.lineTo(910, 560); g.lineTo(100, 560); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(60, 560); g.lineTo(1140, 560); g.stroke();
    if (ball) { g.fillStyle = WHITE; g.beginPath(); g.arc(140, 214, 30, 0, 7); g.fill(); }
    g.fillStyle = WHITE; g.font = `48px ${VT}`; g.textAlign = "left"; g.fillText("SIMULASI FISIKA 2D", 60, 70); g.textAlign = "right"; g.fillText("1989", 1140, 740);
  };
  const slabA = tex(1200, 800, slabDraw(true)), slabB = tex(1200, 800, slabDraw(false));
  box(13.2, 0.26, 9.2, std(C.beige, 0.6), X8, 0.13, 0);
  const slabTopM = new THREE.MeshBasicMaterial({ map: slabA, color: 0xdedede, toneMapped: false });
  const slabTop = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), slabTopM); slabTop.rotation.x = -Math.PI / 2; slabTop.position.set(X8, 0.275, 0); scene.add(slabTop);
  const tRise = AT["s8:Jadi"] + 0.3, rb0 = bricks.length;
  for (let j = 0; j < 9; j++) for (let k = 0; k < 9 - j; k++) bricks.push({ x: X8 - 5 + j * 0.9 + 0.45, y: 0.28 + 0.225 + k * 0.45, z: 0.4, sx: 0.86, sy: 0.43, sz: 2.4, c: BCOL[(k + j) % 5], t0: tRise + j * 0.16 + k * 0.07, kind: 1 });
  [0, 1, 2].forEach((k) => bricks.push({ x: X8 + 4.0, y: 0.28 + 0.25 + k * 0.5, z: -1.2, sx: 0.9, sy: 0.48, sz: 0.9, c: [C.red, C.amber, C.green][k], t0: AT["s8:membangun"] - 0.9 + k * 0.7, kind: 0 }));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 16), std(C.red, 0.3)); ball.castShadow = true; scene.add(ball);

  const NB = bricks.length;
  const IB = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.42 }), NB); IB.castShadow = IB.receiveShadow = true; IB.frustumCulled = false; scene.add(IB);
  const white = new THREE.Color(0xf4f1e8), cc = new THREE.Color();
  bricks.forEach((b, i) => { b.col = new THREE.Color(b.c); IB.setColorAt(i, b.col); });

  // hero avatar: retro green shirt, teal pants
  const H = avatar({ skin: 0xf5cd30, shirt: C.green, pants: 0x2f5552 }); H.G.scale.setScalar(0.55); scene.add(H.G);
  const HP = [
    [0, 1.7, 5.3, 0.444], [K.s2 + 0.3, 1.7, 5.3, 0.444], [K.s2 + 1.1, 5.8, 6.4, 0], [K.s2e - 1.6, 5.8, 6.4, 0], [K.s3 + 0.9, X3 - 6.8, 1.4, 0],
    [AT["s3:Desember"] + 0.1, X3 - 6.8, 1.4, 0], [AT["s3:Desember"] + 1.1, X3 - 4.0, 2.3, 0],
    [AT["s3:dibeli"], X3 - 4.0, 2.3, 0], [AT["s3:dolar"] + 0.5, X3 + 1.0, 2.3, 0],
    [K.s4 + 0.1, X3 + 1.0, 2.3, 0], [K.s4 + 2.2, X4 - 1.0, 6.0, 0],
    [K.s5 - 0.5, X4 - 1.0, 6.0, 0], [K.s5 + 1.3, X5, -0.15, 0],
    [K.s6 - 0.5, X5, -0.15, 0], [K.s6 + 1.1, X6 + 2.4, 5.6, 0],
    [K.s7 - 0.5, X6 + 2.4, 5.6, 0], [K.s7 + 1.4, X7 - 4.0, 2.8, 0],
    [K.s8 - 0.3, X7 - 4.0, 2.8, 0], [K.s8 + 1.5, X8 + 5.1, -1.2, 0.28], [K.dur + 5, X8 + 5.1, -1.2, 0.28],
  ];
  const hAt = (t) => {
    let i = 0; while (i < HP.length - 2 && HP[i + 1][0] < t) i++;
    const a = HP[i], b = HP[i + 1], u = clamp01((t - a[0]) / (b[0] - a[0]));
    return { x: a[1] + (b[1] - a[1]) * u, z: a[2] + (b[2] - a[2]) * u, y: a[3] + (b[3] - a[3]) * u, mv: (b[1] !== a[1] || b[2] !== a[2]) && u > 0 && u < 1, dx: b[1] - a[1], dz: b[2] - a[2] };
  };
  const flips = ["s5:eBlocks", "s5:GoBlocks", "s5:DynaBlocks", "s5:Roblox"].map((k) => AT[k]);

  // camera: px py pz lx ly lz
  const cam0 = track([
    [0, 2.2, 8.6, 34, 0.2, 4.2, 0], [K.s1e - 0.2, 0.8, 7.6, 29.5, 0, 4.6, 0.5],
    [K.s2 + 1.4, 0, 6.6, 25.5, 0, 5.6, 3.1], [AT["s2:Interactive"], 0, 6.3, 24.2, 0, 5.6, 3.1], [K.s2e - 2.2, 0.2, 6.4, 23.8, 0, 5.6, 3.1],
    [K.s2e + 0.1, 5, 8.5, 30, 4, 3.4, 0],
    [K.s3 + 1.3, X3 - 4.0, 9.2, 27.5, X3 - 4.0, 2.6, 0], [AT["s3:Desember"], X3 - 2.4, 9.6, 27.5, X3 - 2.0, 2.6, 0], [AT["s3:dibeli"], X3 - 0.6, 9.8, 28, X3, 2.6, 0], [K.s3e - 0.2, X3 + 2.8, 10.4, 30, X3 + 2.6, 2.6, 0],
    [K.s4 + 1.6, X4, 15, 34, X4, 2.0, 0.5], [AT["s4:Dunianya"], X4 + 0.6, 13.6, 32, X4 + 0.2, 2.2, 1], [K.s4e - 0.2, X4 + 1.2, 13, 31, X4 + 0.4, 2.4, 1],
    [K.s5 + 1.3, X5 - 0.6, 8.2, 31, X5 - 0.3, 3.6, 0], [AT["s5:eBlocks"] - 0.4, X5 - 0.3, 7.6, 28.5, X5, 3.7, 0], [AT["s5:Roblox"], X5, 7.4, 27.5, X5, 3.7, 0], [K.s5e - 0.2, X5 + 0.4, 7.8, 28.5, X5 + 0.2, 3.6, 0],
    [K.s6 + 1.3, X6, 16, 33, X6, 1.6, 0], [AT["s6:lusin"], X6 + 0.6, 17, 36, X6 + 0.3, 1.4, 0], [K.s6e - 0.2, X6 + 1.2, 16.5, 35, X6 + 0.6, 1.6, 0],
    [K.s7 + 1.6, X7 - 0.6, 6.4, 21.5, X7 - 0.2, 2.5, -1], [K.s7e - 0.2, X7 - 0.3, 6.0, 19.8, X7, 2.5, -1],
    [K.s8 + 1.0, X8 + 0.2, 25, 14.5, X8 + 0.2, 0, -0.8], [AT["s8:anak-anak"], X8 + 1.4, 13, 25, X8 + 0.6, 2.4, 0], [K.dur, X8 + 3.0, 11, 27.5, X8 + 1.0, 2.8, 0],
  ]);
  const dummy = new THREE.Object3D();

  return (t) => {
    fontsTick();
    drawSim(sg, 800, 600, t); scrT.needsUpdate = true;
    const p = cam0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    sun.position.set(p[3] - 16, 34, p[5] + 22); sun.target.position.set(p[3], 0, p[5]);

    // s7 hush: room dims, one warm light on the plaque
    const dim = ramp(t, K.s7 - 0.4, K.s7 + 1.4) * (1 - ramp(t, K.s8 - 0.3, K.s8 + 0.9));
    hemi.intensity = 1.35 * (1 - 0.72 * dim); sun.intensity = 2.5 * (1 - 0.88 * dim); spot.intensity = 9 * dim;
    scene.background.copy(bgDay).lerp(bgNight, dim);
    motes.forEach((m, i) => { dummy.position.set(X7 + m[0] + Math.sin(t * 0.3 + m[3]) * 0.4, ((m[1] + t * 0.12) % 5.5) + 0.6, -0.4 + m[2]); dummy.scale.setScalar(dim > 0.05 ? 1 : 0.001); dummy.updateMatrix(); moteG.setMatrixAt(i, dummy.matrix); });
    moteG.instanceMatrix.needsUpdate = true; moteG.material.opacity = 0.28 * dim;

    // crate slides to the buyer; tag and sign appear on their words
    const h = hAt(t);
    const cx = Math.max(X3 - 1.6, Math.min(X3 + 3.4, h.x + 2.45 * (t >= AT["s3:dibeli"] ? 1 : 0)));
    crate.position.set(t >= AT["s3:dibeli"] ? cx : X3 - 1.6, 0, 2.3);
    const pu = back(clamp01((t - AT["s3:dua"] + 0.15) / 0.4), 2.2);
    price.visible = pu > 0.01; price.scale.setScalar(Math.max(0.001, pu));
    price.position.set(crate.position.x + 1.05, 2.65, 2.3 + 1.66); price.rotation.set(0, 0, -0.12 + Math.sin(t * 2.6) * 0.07);
    const mu = back(clamp01((t - AT["s3:MSC"] + 0.2) / 0.45), 1.8); msc.scale.set(1, Math.max(0.001, mu), 1);

    // bricks
    bricks.forEach((b, i) => {
      if (b.kind === 1) {
        const u = clamp01((t - b.t0) / 0.38);
        if (u <= 0) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.001); }
        else { const e = eout(u), sy = 0.04 + (b.sy - 0.04) * e, base = b.y - b.sy / 2; dummy.position.set(b.x, base + sy / 2 + (1 - e) * 0, b.z); dummy.scale.set(b.sx, sy, b.sz); }
        dummy.updateMatrix(); IB.setMatrixAt(i, dummy.matrix);
        cc.copy(white).lerp(b.col, clamp01((t - b.t0 - 0.15) / 0.4)); IB.setColorAt(i, cc);
      } else {
        const u = clamp01((t - b.t0) / 0.32);
        if (u <= 0) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.001); }
        else { const e = eout(u), s = 0.7 + 0.3 * back(u, 2.4); dummy.position.set(b.x, b.y + (1 - e) * 3.2, b.z); dummy.scale.set(b.sx * s, b.sy * s, b.sz * s); }
        dummy.updateMatrix(); IB.setMatrixAt(i, dummy.matrix);
      }
    });
    IB.instanceMatrix.needsUpdate = true; IB.instanceColor.needsUpdate = true;

    // students pop in around the second computer and build
    studs.forEach((s, i) => {
      const u = clamp01((t - s.t0) / 0.4); s.A.G.visible = u > 0;
      s.A.G.position.set(s.x, (1 - eout(u)) * 4, s.z); s.A.G.scale.setScalar(0.4 * (0.6 + 0.4 * back(u, 2)));
      s.A.G.rotation.y = s.ry;
      const bld = t > AT["s4:inspirasi"] - 0.4 && t < K.s5;
      restPose(s.A);
      if (bld) { s.A.armR.rotation.x = -1.1 + Math.sin(t * 7 + s.ph) * 0.45; s.A.armL.rotation.x = -0.9 - Math.sin(t * 7 + s.ph) * 0.35; }
      else if (u > 0) s.A.armR.rotation.z = Math.sin(t * 5 + s.ph) > 0.6 ? 2.4 : 0.2;
    });

    // name board flips, cord pulls
    let idx = 0, rot = 0, pull = 0;
    flips.forEach((f) => { const q = (t - (f - 0.28)) / 0.36; if (q >= 0.5) idx++; if (q > 0 && q < 1) { rot = q < 0.5 ? q * Math.PI : (q - 1) * Math.PI; pull = Math.sin(q * Math.PI); } });
    tileMat.map = nameT[idx]; tile.rotation.x = rot;
    const glow = ramp(t, AT["s5:blocks"] + 0.55, AT["s5:blocks"] + 0.75) * (1 - ramp(t, AT["s5:blocks"] + 0.9, K.s5e + 0.3));
    tileMat.emissiveIntensity = 0.5 * glow;
    cord.scale.y = 1 + pull * 0.6; cord.position.y = 2.6 - pull * 0.3; knob.position.y = 2.0 - pull * 0.6;
    smalls.forEach((s, i) => {
      const u = back(clamp01((t - s.t + 0.15) / 0.35), 2), m = ramp(t, AT["s5:blocks"] + 0.4, AT["s5:blocks"] + 0.85);
      s.m.visible = u > 0.01 && m < 0.99;
      s.m.position.set(s.x + (X5 - s.x) * m, 0.5 + (4.6 - 0.5) * m + (1 - eout(clamp01((t - s.t + 0.15) / 0.35))) * 2.5, 1.4 + (-0.6 - 1.4) * m);
      s.m.scale.setScalar(Math.max(0.001, u * (1 - 0.7 * m))); s.m.rotation.y = (i ? -1 : 1) * 0.12 * (1 - m);
    });

    // founders build, testers arrive, calendar drops
    const fIn = back(clamp01((t - AT["s6:Awalnya"] + 0.2) / 0.45), 2);
    [F1, F2].forEach((F, i) => {
      F.G.visible = fIn > 0.01; F.G.scale.setScalar(0.55 * Math.max(0.001, fIn)); restPose(F);
      if (t > wT0 - 0.3 && t < wT1 + 0.6) { F.armR.rotation.x = -1.2 + Math.sin(t * 8 + i * 2) * 0.5; F.armL.rotation.x = -1.0 - Math.sin(t * 8 + i * 2) * 0.4; }
      else if (t > AT["s6:September"]) { F.armR.rotation.z = (i ? -1 : 1) * (2.6 + Math.sin(t * 7) * 0.3) * (i ? -1 : 1); F.armL.rotation.z = -2.6 - Math.sin(t * 7) * 0.3; }
    });
    testers.forEach((s, i) => {
      const u = back(clamp01((t - s.t0) / 0.35), 2.2), hop = Math.abs(Math.sin(t * 4.2 + s.ph)) * 0.22 * (t > AT["s6:September"] ? 1.6 : 1) * (u >= 1 ? 1 : 0);
      const sc = Math.max(0.001, u), y0 = (1 - Math.min(1, u)) * 3 + hop;
      dummy.rotation.set(0, s.ry, 0); dummy.scale.setScalar(sc);
      dummy.position.set(s.x, 0.45 * sc + y0, s.z); dummy.updateMatrix(); tI[0].setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 1.35 * sc + y0, s.z); dummy.updateMatrix(); tI[1].setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 2.11 * sc + y0, s.z); dummy.updateMatrix(); tI[2].setMatrixAt(i, dummy.matrix);
    });
    dummy.rotation.set(0, 0, 0);
    tI.forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    const cu = clamp01((t - AT["s6:September"] + 0.15) / 0.42);
    cal.visible = cu > 0; cal.position.set(X6 + 4.6, 1.7 + (1 - eout(cu)) * 7, -5.2); cal.rotation.set(0, -0.35, (1 - back(cu, 2.5)) * 0.4);

    // finale: slab drawing loses its ball when the ramp rises; the 3D ball rolls down the steps
    slabTopM.map = t < tRise ? slabA : slabB;
    const tb = AT["s8:membangun"] - 0.4, bu = clamp01((t - tb) / 2.6) * 9.6;
    const j = Math.min(9, Math.floor(bu)), fr = bu - Math.floor(bu);
    const topY = (jj) => (jj < 9 ? 0.28 + (9 - jj) * 0.45 : 0.28) + 0.38;
    let by = topY(j); if (fr > 0.7 && j < 9) by = topY(j) - (topY(j) - topY(j + 1)) * ((fr - 0.7) / 0.3) ** 2;
    ball.visible = t > tRise + 1.6;
    ball.position.set(X8 - 5 + 0.45 + Math.min(bu, 9.6) * 0.9, by, 0.4); ball.rotation.z = -bu * 2.4;
    if (t < tb) { ball.position.set(X8 - 5 + 0.45, topY(0), 0.4); ball.scale.setScalar(clamp01((t - tRise - 1.6) / 0.3)); } else ball.scale.setScalar(1);

    // hero
    H.G.position.set(h.x, h.y, h.z); restPose(H); H.head.rotation.set(0, 0, 0);
    if (h.mv) {
      H.G.rotation.y = Math.atan2(h.dx, h.dz); runPose(H, t * 12);
      if (t > AT["s3:dibeli"] && t < AT["s3:dolar"] + 0.5) { H.armL.rotation.x = H.armR.rotation.x = -1.45; }
    } else if (t < K.s2e) {
      // stomps the keys, jumps on the name, then turns to the screen
      const tap = Math.abs(Math.sin(t * 7)) * 0.18, jmp = Math.max(0, Math.sin(clamp01((t - AT["s1:DynaBlocks"] + 0.1) / 0.55) * Math.PI)) * 1.3;
      H.G.position.y += tap + jmp;
      H.G.rotation.y = 0.5 + ramp(t, AT["s1:akarnya"] - 0.2, AT["s1:akarnya"] + 0.4) * (Math.PI - 0.5 - 0.4);
      H.armL.rotation.x = -Math.sin(t * 7) * 0.5; H.armR.rotation.x = Math.sin(t * 7) * 0.5;
      if (jmp > 0.05) { H.armL.rotation.z = -2.5; H.armR.rotation.z = 2.5; }
    } else if (t < AT["s3:Desember"] + 0.2) {
      H.G.rotation.y = 2.75; H.armR.rotation.x = -2.2 + Math.sin(t * 9) * 0.25; H.armR.rotation.z = Math.sin(t * 4) * 0.2; // drafting
    } else if (t < K.s4 + 0.2) {
      H.G.rotation.y = Math.PI / 2; H.armL.rotation.x = H.armR.rotation.x = -1.45;
      if (t > AT["s3:dolar"] + 0.5) { H.G.rotation.y = 0.4; H.armR.rotation.z = 0.3; }
    } else if (t < K.s5) {
      H.G.rotation.y = Math.PI / 2; H.armR.rotation.x = -1.2 + Math.sin(t * 7) * 0.5; H.armL.rotation.x = -1.0 - Math.sin(t * 7) * 0.4;
    } else if (t < K.s6) {
      H.G.rotation.y = 0; H.armR.rotation.z = 3.0 - pull * 0.9; H.armL.rotation.z = -0.2;
    } else if (t < K.s7) {
      H.G.rotation.y = -0.25; const ju = t > AT["s6:lusin"] - 0.2 ? Math.abs(Math.sin(t * 4.2)) * 0.5 : 0, sep = t > AT["s6:September"] ? Math.max(0, Math.sin(clamp01((t - AT["s6:September"]) / 0.6) * Math.PI)) * 1.2 : 0;
      H.G.position.y += ju + sep; if (sep > 0.05 || ju > 0.3) { H.armL.rotation.z = -2.6; H.armR.rotation.z = 2.6; }
    } else if (t < K.s8) {
      H.G.rotation.y = 2.35; H.head.rotation.x = 0.32 * ramp(t, K.s7 + 1.4, K.s7 + 2.6);
    } else {
      const wave = t > AT["s8:Kamu"] - 0.2;
      H.G.rotation.y = wave ? 0.2 + ramp(t, AT["s8:Kamu"] - 0.2, AT["s8:Kamu"] + 0.3) * 0 : -Math.PI / 2;
      if (wave) { H.armR.rotation.z = 2.6 + Math.sin(t * 8) * 0.4; }
      else if (t > AT["s8:membangun"] - 1.2) { H.armR.rotation.x = -1.3 + Math.sin(t * 7) * 0.5; H.armL.rotation.x = -1.0 - Math.sin(t * 7) * 0.4; }
    }
    comp.render();
  };
}
