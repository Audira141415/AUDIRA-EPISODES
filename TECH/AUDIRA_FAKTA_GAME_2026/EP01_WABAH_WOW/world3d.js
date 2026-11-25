// PETA WABAH: one parchment tabletop map of an invented fantasy world at night, read like an epidemiology chart.
// Crimson = infection, cyan = the lab layer. Original hero, pet, townsfolk and temple; nothing from the real game.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, std, box as box0, cyl as cyl0, stage, figure, pts, runPose, restPose } from "./lib3d.js";

const PAR = "#E8D9B5", INK = "#3B2A1A", RED = "#D7263D", CY = "#36C5F0";
const PL = '"IBM Plex Sans Condensed", sans-serif', CZ = "Cinzel, serif";
const MX = 240, MZ = 330, OX = -120, OZ = -170, CW = 2048, CH = 2816, S = CW / MX;
const w2c = (x, z) => [(x - OX) * S, (z - OZ) * S];
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lerp = (a, b, u) => a + (b - a) * u;

export function create(canvas, K, AT) {
  const { scene, cam, comp, bp } = stage(canvas, { bg: 0x101826, fog: 0.0036, exp: 1.0, bloom: [0.32, 0.5, 0.9] });
  scene.add(cam);
  const box = (w, h, d, m, x, y, z, par) => box0(w, h, d, m, x, y, z, par || scene);
  const cyl = (a, b, h, n, m, x, y, z, par) => cyl0(a, b, h, n, m, x, y, z, par || scene);
  const hemi = new THREE.HemisphereLight(0x9fb2d6, 0x3b2a1a, 0.95); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffdfae, 2.1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0005; key.shadow.radius = 4; scene.add(key, key.target);
  const A = (k) => { if (AT[k] === undefined) { console.error("missing anchor " + k); return 0; } return AT[k]; };

  // textures repaint once the display fonts are ready
  const dyn = []; let fontsOk = false;
  const ctex = (w, h, draw, rep) => { const t = canvasTex(w, h, draw, rep); dyn.push([t, draw]); return t; };
  try { document.fonts.load(`700 40px ${PL}`); document.fonts.load(`600 40px ${PL}`); document.fonts.load(`700 40px ${CZ}`); } catch (e) {}
  const refonts = () => {
    if (fontsOk || !document.fonts) return;
    if (document.fonts.check(`700 40px ${PL}`) && document.fonts.check(`700 40px ${CZ}`)) {
      fontsOk = true;
      for (const [t, d] of dyn) { const c = t.image, g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); d(g, c.width, c.height); t.needsUpdate = true; }
    }
  };

  // ---------- layout ----------
  const cities = [
    { x: 0, z: 0, r: 16, cap: 1 }, { x: -30, z: -30, r: 8 }, { x: 33, z: -24, r: 8 }, { x: -28, z: 32, r: 9 },
    { x: 32, z: 34, r: 8 }, { x: 3, z: 58, r: 7 }, { x: -56, z: 2, r: 7 }, { x: 57, z: 6, r: 7 },
  ];
  cities.forEach((c, i) => { c.d = Math.hypot(c.x, c.z); c.i = i; });
  const TX = -14, TZ = -100; // temple
  const routePts = [[-11, -84], [-17, -70], [-9, -52], [-3, -35], [0, -21], [0, -12], [-2, 0]].map(([x, z]) => new THREE.Vector3(x, 0, z));
  const route = new THREE.CatmullRomCurve3(routePts, false, "centripetal");
  const routeS = route.getSpacedPoints(120);
  const nearRoute = (x, z, d) => routeS.some((p) => Math.hypot(p.x - x, p.z - z) < d);

  // ---------- map ----------
  const drawMap = (g, w, h) => {
    const R = mulberry(77);
    g.fillStyle = "#c7b28a"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(59,42,26,.16)"; g.lineWidth = 2;
    for (let y = 14; y < h; y += 24) { g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * 0.03 + y) * 3; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
    const P = []; for (let i = 0; i < 200; i++) { const a = (i / 200) * Math.PI * 2; const rr = 1 + 0.1 * Math.sin(3 * a + 1) + 0.07 * Math.sin(7 * a + 0.4) + 0.04 * Math.sin(15 * a + 2) + 0.02 * Math.sin(31 * a); P.push(w2c(Math.cos(a) * 92 * rr, 4 + Math.sin(a) * 124 * rr)); }
    const path = () => { g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    for (let k = 5; k >= 1; k--) { path(); g.strokeStyle = `rgba(59,42,26,${0.05 + 0.03 * (5 - k)})`; g.lineWidth = k * 16; g.stroke(); }
    path(); g.fillStyle = PAR; g.fill();
    g.save(); path(); g.clip();
    for (let i = 0; i < 320; i++) { const x = R() * w, y = R() * h, rr = 20 + R() * 140; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${(140 + R() * 40) | 0},${(105 + R() * 30) | 0},60,${0.05 + R() * 0.08})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    // jungle hatching around the temple
    const [jx, jy] = w2c(TX, TZ);
    for (let i = 0; i < 900; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * 40 * S; const x = jx + Math.cos(a) * d, y = jy + Math.sin(a) * d * 1.1; g.strokeStyle = `rgba(59,42,26,${0.25 + R() * 0.3})`; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 6 + R() * 8, Math.PI, 0); g.stroke(); }
    // mountains
    const mtn = (x0, z0, x1, z1, n) => { for (let i = 0; i < n; i++) { const u = i / (n - 1); const [x, y] = w2c(lerp(x0, x1, u) + (R() - 0.5) * 6, lerp(z0, z1, u) + (R() - 0.5) * 6); const s = 26 + R() * 22; g.fillStyle = "rgba(59,42,26,.10)"; g.beginPath(); g.moveTo(x - s, y + s * 0.4); g.lineTo(x, y - s); g.lineTo(x + s, y + s * 0.4); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x - s, y + s * 0.4); g.lineTo(x, y - s); g.lineTo(x + s, y + s * 0.4); g.stroke(); g.lineWidth = 1.5; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 5, y - s + k * 12); g.lineTo(x + k * 9, y + s * 0.3); g.stroke(); } } };
    mtn(-80, -70, -50, -20, 12); mtn(48, -80, 78, -40, 10); mtn(-70, 60, -40, 90, 8); mtn(60, 70, 80, 100, 7);
    // rivers
    g.strokeStyle = "rgba(59,42,26,.55)"; g.lineWidth = 4;
    const river = (pp) => { g.beginPath(); pp.forEach(([x, z], i) => { const [a, b] = w2c(x, z); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); };
    river([[-90, -10], [-70, -4], [-48, 10], [-36, 22], [-20, 18], [-6, 10]]); river([[88, 50], [66, 40], [46, 22], [26, 14], [10, 6]]);
    // roads between towns
    g.setLineDash([14, 12]); g.strokeStyle = "rgba(59,42,26,.6)"; g.lineWidth = 3;
    cities.slice(1).forEach((c) => { const [a, b] = w2c(0, 0), [x, y] = w2c(c.x, c.z); g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + x) / 2 + 40, (b + y) / 2 - 30, x, y); g.stroke(); });
    g.setLineDash([]);
    // town seals
    cities.forEach((c) => { const [x, y] = w2c(c.x, c.z); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(x, y, (c.r + 3) * S, 0, 7); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, (c.r + 4) * S, 0, 7); g.stroke(); });
    g.restore();
    path(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
    // compass rose and cartouche
    const [cx, cy] = w2c(-78, 118);
    g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 110, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, 96, 0, 7); g.stroke();
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, L = k % 2 ? 80 : 150; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a + 0.12) * 22, cy + Math.sin(a + 0.12) * 22); g.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.closePath(); k % 2 ? g.stroke() : g.fill(); }
    g.font = `700 54px ${CZ}`; g.textAlign = "center"; g.fillText("U", cx, cy - 165);
    const [tx, ty] = w2c(52, 122);
    g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(tx - 330, ty - 90, 660, 180); g.lineWidth = 1.5; g.strokeRect(tx - 316, ty - 76, 632, 152);
    g.fillStyle = INK; g.font = `700 92px ${CZ}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PETA WABAH", tx, ty + 6);
    const [kx, ky] = w2c(0, 22); g.font = `700 44px ${CZ}`; g.fillText("IBU KOTA", kx, ky);
  };
  const mapTex = ctex(CW, CH, drawMap);
  const map = new THREE.Mesh(new THREE.PlaneGeometry(MX, MZ), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.92 }));
  map.rotation.x = -Math.PI / 2; map.position.set(OX + MX / 2, 0, OZ + MZ / 2); map.receiveShadow = true; scene.add(map);
  box(MX + 2, 0.6, MZ + 2, std(0x8f7a55, 0.9), OX + MX / 2, -0.31, OZ + MZ / 2);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), std(0x151d2d, 0.85)); table.rotation.x = -Math.PI / 2; table.position.y = -0.62; table.receiveShadow = true; scene.add(table);

  // cyan lab grid overlay
  const gridTex = canvasTex(1024, 1408, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(54,197,240,.55)"; g.lineWidth = 1.5; for (let x = 0; x <= w; x += 42) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = "rgba(54,197,240,.9)"; g.lineWidth = 3; for (let x = 0; x <= w; x += 210) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 210) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  const gridM = new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(MX, MZ), gridM); grid.rotation.x = -Math.PI / 2; grid.position.set(OX + MX / 2, 0.12, OZ + MZ / 2); scene.add(grid);
  // reticles around towns
  const retM = new THREE.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const rets = cities.map((c) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 64), retM); m.rotation.x = -Math.PI / 2; m.position.set(c.x, 0.2, c.z); scene.add(m); return m; });

  // ---------- towns ----------
  const rnd = mulberry(2005);
  const houses = [];
  const wallG = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const roofG = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0);
  cities.forEach((c) => {
    const n = c.cap ? 70 : 16;
    let tries = 0;
    while (houses.filter((h) => h.c === c.i).length < n && tries++ < 3000) {
      const a = rnd() * 6.283, d = c.cap ? 7.8 + rnd() * 6.6 : 1.5 + rnd() * (c.r - 2);
      const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d;
      if (c.cap && ((Math.abs(x) < 6.5 && z > 0) || (Math.abs(x) < 3.6 && z < 0) || Math.hypot(x + 8, z + 9) < 3.4)) continue;
      const w = 1.6 + rnd() * 1.6, dd = 1.6 + rnd() * 1.4, hh = 1.6 + rnd() * 2.2;
      if (houses.some((h) => Math.abs(h.x - x) < (h.w + w) / 2 + 0.25 && Math.abs(h.z - z) < (h.d + dd) / 2 + 0.25)) continue;
      houses.push({ c: c.i, x, z, w, d: dd, h: hh, ry: Math.round(rnd() * 3) * 0.06 - 0.06, rh: 0.9 + rnd() * 0.9, col: rnd() });
    }
  });
  const wallM = new THREE.MeshStandardMaterial({ roughness: 0.85 }), roofM = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const IW = new THREE.InstancedMesh(wallG, wallM, houses.length), IR = new THREE.InstancedMesh(roofG, roofM, houses.length);
  IW.castShadow = IW.receiveShadow = IR.castShadow = true; scene.add(IW, IR);
  const dmy = new THREE.Object3D(), col = new THREE.Color();
  houses.forEach((h, i) => {
    dmy.position.set(h.x, 0, h.z); dmy.rotation.set(0, h.ry, 0); dmy.scale.set(h.w, h.h, h.d); dmy.updateMatrix(); IW.setMatrixAt(i, dmy.matrix);
    dmy.position.y = h.h; dmy.scale.set(h.w * 1.12, h.rh, h.d * 1.12); dmy.updateMatrix(); IR.setMatrixAt(i, dmy.matrix);
    IW.setColorAt(i, col.set(h.col < 0.5 ? 0xe7dbbf : h.col < 0.8 ? 0xd5c19a : 0xc4b08a));
    IR.setColorAt(i, col.set(h.col < 0.4 ? 0x7a3b22 : h.col < 0.75 ? 0x5a3f2a : 0x3e4a5c));
  });
  const stone = std(0xb3a68a, 0.9), stoneD = std(0x8a7f68, 0.9), roofT = std(0x3e4a5c, 0.7);
  // capital wall with a north gate
  const segN = 46;
  for (let k = 0; k < segN; k++) {
    const a = (k / segN) * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.17) continue;
    const m = box(2.3, 2.4, 1.0, stone, Math.cos(a) * 16, 1.2, Math.sin(a) * 16); m.rotation.y = -a + Math.PI / 2;
    if (k % 6 === 0) { cyl(1.0, 1.1, 3.8, 10, stoneD, Math.cos(a) * 16, 1.9, Math.sin(a) * 16); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.6, 10), roofT); rf.position.set(Math.cos(a) * 16, 4.6, Math.sin(a) * 16); rf.castShadow = true; scene.add(rf); }
  }
  for (const s of [-1, 1]) { cyl(1.3, 1.4, 5, 10, stoneD, s * 3.1, 2.5, -15.8); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2, 10), roofT); rf.position.set(s * 3.1, 6, -15.8); rf.castShadow = true; scene.add(rf); }
  box(7.6, 1.0, 1.4, stoneD, 0, 4.4, -15.8);
  cyl(2.2, 2.5, 10, 12, stoneD, -8, 5, -9); { const rf = new THREE.Mesh(new THREE.ConeGeometry(2.9, 3.4, 12), roofT); rf.position.set(-8, 11.7, -9); rf.castShadow = true; scene.add(rf); }
  cyl(1.2, 1.3, 0.8, 16, stone, 5, 0.4, -3); cyl(0.9, 0.9, 0.82, 16, std(0x2a3a4a, 0.2), 5, 0.42, -3);
  cities.slice(1).forEach((c) => { cyl(1.3, 1.5, 6, 10, stoneD, c.x, 3, c.z); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 10), roofT); rf.position.set(c.x, 7.1, c.z); rf.castShadow = true; scene.add(rf); });

  // server monoliths east of the capital
  const pillars = [[25, -7], [29, 0], [25, 7]].map(([x, z], i) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = -Math.PI / 2 + (i - 1) * 0.35; scene.add(G);
    const b = box(2.4, 9, 2.0, std(0x5e5a54, 0.85), 0, 4.5, 0, G); b.scale.set(1, 1, 1);
    box(2.9, 0.6, 2.5, std(0x4a4640, 0.9), 0, 0.3, 0, G); box(2.6, 0.5, 2.2, std(0x4a4640, 0.9), 0, 9.2, 0, G);
    const m = new THREE.MeshStandardMaterial({ color: 0x08141a, emissive: new THREE.Color(CY), emissiveIntensity: 1.6 });
    for (let k = 0; k < 5; k++) box(1.2, 0.5, 0.06, m, 0, 2 + k * 1.4, 1.02, G);
    return { G, m };
  });

  // temple in the jungle
  const tst = std(0x8a876a, 0.92), tst2 = std(0x6f6c55, 0.92);
  for (let k = 0; k < 4; k++) box(18 - 4 * k, 1.6, 18 - 4 * k, k % 2 ? tst2 : tst, TX, 0.8 + 1.6 * k, TZ);
  for (let k = 0; k < 4; k++) box(3.4, 1.6, 2, tst2, TX, 0.8 + 1.6 * k, TZ + 9 - 2 * k + 0.9);
  const brazM = new THREE.MeshStandardMaterial({ color: 0x220808, emissive: new THREE.Color(RED), emissiveIntensity: 2.4 });
  for (const s of [-1, 1]) { cyl(0.5, 0.35, 1.4, 8, tst2, TX + s * 3.5, 7.1, TZ + 3.5); cyl(0.42, 0.42, 0.25, 8, brazM, TX + s * 3.5, 7.9, TZ + 3.5); }
  // trees: jungle around the temple and copses elsewhere
  const trees = [];
  for (let i = 0; i < 1400 && trees.length < 230; i++) {
    let x, z;
    if (trees.length < 150) { const a = rnd() * 6.283, d = 12 + rnd() * 26; x = TX + Math.cos(a) * d; z = TZ + Math.sin(a) * d * 1.1; }
    else { x = rnd() * 170 - 85; z = rnd() * 220 - 110; }
    if (Math.hypot(x - TX, z - TZ) < 11.5 || nearRoute(x, z, 4.2) || cities.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + 4) || pillars.some((p) => Math.hypot(x - p.G.position.x, z - p.G.position.z) < 4)) continue;
    if (Math.hypot(x / 92, (z - 4) / 124) > 0.92) continue;
    if (x > -20 && x < 4 && z > -92 && z < -78) continue;
    if (x > -14 && x < 22 && z > -48 && z < -14) continue;
    trees.push([x, z, 0.8 + rnd() * 0.8, rnd()]);
  }
  const trunkG = new THREE.CylinderGeometry(0.18, 0.26, 1.4, 6).translate(0, 0.7, 0), canG = new THREE.SphereGeometry(1, 9, 7).translate(0, 2.1, 0);
  const ITr = new THREE.InstancedMesh(trunkG, std(0x4a3524, 0.9), trees.length), ICa = new THREE.InstancedMesh(canG, new THREE.MeshStandardMaterial({ roughness: 0.85 }), trees.length);
  ITr.castShadow = ICa.castShadow = true; ICa.receiveShadow = true; scene.add(ITr, ICa);
  trees.forEach(([x, z, s, c], i) => { dmy.position.set(x, 0, z); dmy.rotation.set(0, 0, 0); dmy.scale.set(s, s, s); dmy.updateMatrix(); ITr.setMatrixAt(i, dmy.matrix); dmy.scale.set(s * 1.2, s * 1.05, s * 1.2); dmy.updateMatrix(); ICa.setMatrixAt(i, dmy.matrix); ICa.setColorAt(i, col.set(c < 0.5 ? 0x5d6638 : c < 0.8 ? 0x4b5530 : 0x6f7444)); });
  // 3D mountains
  const mts = []; [[-80, -70, -50, -20, 9], [48, -80, 78, -40, 8], [-70, 60, -40, 90, 6], [60, 70, 80, 100, 5]].forEach(([x0, z0, x1, z1, n]) => { for (let i = 0; i < n; i++) { const u = i / (n - 1); mts.push([lerp(x0, x1, u) + (rnd() - 0.5) * 8, lerp(z0, z1, u) + (rnd() - 0.5) * 8, 4 + rnd() * 5]); } });
  const IM = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 5).translate(0, 0.5, 0), std(0x9a8a6a, 0.95, 0, { flatShading: true }), mts.length); IM.castShadow = true; scene.add(IM);
  mts.forEach(([x, z, h], i) => { dmy.position.set(x, 0, z); dmy.scale.set(h * 0.9, h, h * 0.9); dmy.rotation.set(0, i, 0); dmy.updateMatrix(); IM.setMatrixAt(i, dmy.matrix); });

  // ---------- characters ----------
  const skin = std(0xd9a77a, 0.6);
  const mkFig = (body, armor, h) => { const f = figure(body, armor, skin, h); const W = new THREE.Group(); f.G.position.y = -0.252 * h; W.add(f.G); scene.add(W); f.W = W; return f; };
  const hero = mkFig(std(0x2c4f86, 0.7), std(0xc9c2b0, 0.35, 0.6), 0.6);
  { const cape = box(1.5, 2.3, 0.08, std(0x5a2e1c, 0.8), 0, 2.6, -0.62, hero.G); cape.rotation.x = 0.12; const sw = box(0.12, 2.0, 0.12, std(0xd8d8d0, 0.2, 0.9), 0, -1.6, 0.35, hero.armR); sw.rotation.x = 0.1; }
  const allies = [mkFig(std(0x55603a, 0.7), std(0x8d7a56, 0.5, 0.3), 0.56), mkFig(std(0x5c3f66, 0.7), std(0xa49a86, 0.4, 0.4), 0.56)];
  const boss = mkFig(std(0x1a1014, 0.8), std(0x2a1a20, 0.45, 0.5), 1.35);
  const hornM = std(0x2a1a20, 0.5, 0.3);
  for (const s of [-1, 1]) { const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.3, 6), hornM); h1.position.set(s * 0.45, 5.35, 0); h1.rotation.z = -s * 0.6; boss.G.add(h1); }
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(3), toneMapped: false });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), eyeM); e.position.set(s * 0.2, 4.62, 0.55); boss.G.add(e); }
  const bossCore = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), eyeM); bossCore.position.set(0, 3.3, 0.85); boss.G.add(bossCore);
  boss.helm.visible = false;
  const warner = mkFig(std(0x8a6a2a, 0.7), std(0xa89a7a, 0.45, 0.4), 0.58);
  const trav = mkFig(std(0x4a5a6a, 0.75), std(0x8c8478, 0.6, 0.2), 0.52);
  const grief = mkFig(std(0x3a1418, 0.7), std(0x4a2a2a, 0.5, 0.3), 0.6);
  // stop sign planted beside the warner
  const sign = new THREE.Group(); scene.add(sign);
  cyl(0.08, 0.08, 3.6, 6, std(0x4a3524, 0.8), 0, 1.8, 0, sign);
  const signTex = ctex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = RED; g.beginPath(); for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; g.lineTo(w / 2 + Math.cos(a) * 124, h / 2 + Math.sin(a) * 124); } g.closePath(); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 8; g.stroke(); g.fillStyle = "#fff"; g.font = `700 74px ${PL}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("STOP", w / 2, h / 2 + 4); });
  const signF = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshStandardMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.35 })); signF.position.y = 3.8; sign.add(signF);

  // pet: small blocky fox-like companion, faces +z
  const pet = new THREE.Group(); scene.add(pet);
  const petBody = new THREE.Group(); pet.add(petBody);
  { const fur = std(0xc8742c, 0.7), cream = std(0xeed9b0, 0.8), dk = std(0x2a1d12, 0.6);
    box(0.56, 0.5, 1.0, fur, 0, 0.6, 0, petBody); box(0.5, 0.46, 0.46, fur, 0, 1.0, 0.58, petBody); box(0.28, 0.2, 0.22, cream, 0, 0.92, 0.88, petBody);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 4), fur); e.position.set(s * 0.15, 1.36, 0.55); petBody.add(e); box(0.07, 0.07, 0.03, dk, s * 0.12, 1.06, 0.82, petBody); for (const f of [-1, 1]) box(0.15, 0.36, 0.15, fur, s * 0.18, 0.18, f * 0.33, petBody); }
    const tail = box(0.15, 0.15, 0.6, cream, 0, 0.82, -0.66, petBody); tail.rotation.x = 0.7; petBody.userData.tail = tail; }
  pet.scale.setScalar(0.95);
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), new THREE.MeshStandardMaterial({ color: 0xbfe9ff, emissive: new THREE.Color(CY), emissiveIntensity: 0.5, transparent: true, opacity: 0.3, roughness: 0.1, depthWrite: false }));
  scene.add(bubble);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.6, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xbfe9ff, emissive: new THREE.Color(CY), emissiveIntensity: 0.45, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }));
  scene.add(shield);
  const bb = (txt, color, w = 512, h = 192, fs = 120, bg = null) => { const t = ctex(w, h, (g) => { g.clearRect(0, 0, w, h); if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 18); g.fill(); g.strokeStyle = color; g.lineWidth = 5; g.stroke(); } g.font = `700 ${fs}px ${PL}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 14; g.strokeStyle = "#101826"; if (!bg) g.strokeText(txt, w / 2, h / 2 + 4); g.fillStyle = color; g.fillText(txt, w / 2, h / 2 + 4); }); return new THREE.Mesh(new THREE.PlaneGeometry(w / 192, h / 192), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); };
  const oktL = bb("8 OKT", CY, 384, 150, 92, "rgba(16,24,38,.86)"); oktL.renderOrder = 5; scene.add(oktL);
  const dmgL = [0, 1, 2, 3, 4].map((k) => { const m = bb(k % 2 ? "-337" : "-263", RED, 512, 192, 130); m.renderOrder = 6; scene.add(m); return m; });
  // health bar
  const hb = new THREE.Group(); scene.add(hb);
  { const bgM = new THREE.MeshBasicMaterial({ color: 0x101826, depthTest: false, transparent: true }); const b = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.42), bgM); b.renderOrder = 5; hb.add(b);
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(2.98, 0.5), new THREE.MeshBasicMaterial({ color: PAR, depthTest: false, transparent: true })); fr.renderOrder = 4; hb.add(fr); }
  const hbFill = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.26).translate(1.35, 0, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(1.4), depthTest: false, transparent: true, toneMapped: false }));
  hbFill.position.x = -1.35; hbFill.renderOrder = 6; hb.add(hbFill);
  const pillarCol = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 10, 24, 1, true).translate(0, 5, 0), new THREE.MeshBasicMaterial({ color: 0xfff2cf, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  scene.add(pillarCol);
  const gateL = new THREE.PointLight(0xffd29a, 0, 40, 1.6); gateL.position.set(-6, 7, -32); scene.add(gateL);

  // townsfolk
  const npcs = [];
  for (let i = 0; i < 4000 && npcs.length < 40; i++) {
    const a = rnd() * 6.283, d = 2 + Math.sqrt(rnd()) * 6.2; let x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (npcs.length >= 30) { x = (rnd() - 0.5) * 9; z = 7 + rnd() * 7; }
    if (Math.hypot(x + 2, z) < 2.0 || Math.hypot(x - 1, z - 2.2) < 1.4 || Math.hypot(x - 5, z + 3) < 1.9 || Math.abs(x) < 1.2 && z < -3) continue;
    if (npcs.some((n) => Math.hypot(n.x - x, n.z - z) < 1.35)) continue;
    npcs.push({ x, z, ry: rnd() * 6.28, ph: rnd() * 6.28, c: rnd() });
  }
  const petC = new THREE.Vector3(1, 0, 2.2), heroC = new THREE.Vector3(-2, 0, 0);
  npcs.forEach((n) => (n.dist = Math.hypot(n.x - petC.x, n.z - petC.z)));
  const rank = npcs.map((_, i) => i).sort((a, b) => npcs[a].dist - npcs[b].dist);
  rank.forEach((idx, r) => { npcs[idx].rank = r; let best = -1, bd = 1e9; for (let q = 0; q < r; q++) { const o = npcs[rank[q]]; const d = Math.hypot(o.x - npcs[idx].x, o.z - npcs[idx].z); if (d < bd) { bd = d; best = rank[q]; } } npcs[idx].par = best; });
  const healIdx = (() => { let b = 0, bd = 1e9; npcs.forEach((n, i) => { const d = Math.hypot(n.x - (-1.2), n.z - 3.6); if (d < bd) { bd = d; b = i; } }); return b; })();
  const nBodyG = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 8).translate(0, 0.75, 0), nHeadG = new THREE.SphereGeometry(0.33, 10, 8).translate(0, 1.84, 0), nHoodG = new THREE.ConeGeometry(0.4, 0.5, 8).translate(0, 2.15, 0);
  const nMat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
  const INB = new THREE.InstancedMesh(nBodyG, nMat, npcs.length), INH = new THREE.InstancedMesh(nHeadG, nMat, npcs.length), INC = new THREE.InstancedMesh(nHoodG, nMat, npcs.length);
  const outM = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(1.5), side: THREE.BackSide, toneMapped: false });
  const IOB = new THREE.InstancedMesh(nBodyG, outM, npcs.length), IOH = new THREE.InstancedMesh(nHeadG, outM, npcs.length);
  [INB, INH, INC, IOB, IOH].forEach((m) => { m.frustumCulled = false; scene.add(m); }); INB.castShadow = INH.castShadow = INC.castShadow = true;
  const shirts = [0x6b7f99, 0x8a6a3c, 0x7d4a3a, 0x5d6b48, 0x9a8b6a, 0x4f5a72];
  npcs.forEach((n, i) => { INB.setColorAt(i, col.set(shirts[i % shirts.length])); INH.setColorAt(i, col.set(0xd9a77a)); INC.setColorAt(i, col.set(shirts[(i + 2) % shirts.length]).multiplyScalar(0.8)); });

  // stains and particles
  const stainTex = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(215,38,61,.85)"); gr.addColorStop(0.55, "rgba(180,20,40,.55)"); gr.addColorStop(1, "rgba(120,10,25,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const stains = cities.map((c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: stainTex, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(c.x, 0.09, c.z); m.renderOrder = 1; scene.add(m); return m; });
  const near = pts(scene, 900, { size: 0.42 }), far = pts(scene, 520, { size: 1.5 });
  const ringM = new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 128), ringM); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.4; scene.add(ring);
  const ringFill = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: 0xffe9b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); ringFill.rotation.x = -Math.PI / 2; ringFill.position.y = 0.3; scene.add(ringFill);

  // quarantine barriers
  const qTex = canvasTex(512, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(232,217,181,.55)"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(215,38,61,.9)"; for (let x = -h; x < w + h; x += 64) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 32, h); g.lineTo(x + 32 + h, 0); g.lineTo(x + h, 0); g.closePath(); g.fill(); } g.fillStyle = "#3B2A1A"; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); }, [10, 1]);
  const walls = cities.map((c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64, 1, true).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ map: qTex, transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false, emissive: 0x401010, emissiveIntensity: 0.4 })); m.position.set(c.x, 0, c.z); m.scale.set(c.r + 3, 0.001, c.r + 3); m.visible = false; scene.add(m); return m; });

  // lab layer in camera space
  const dosTex = ctex(1024, 688, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = "rgba(10,20,34,.88)"; g.fillRect(0, 0, w, h);
    g.strokeStyle = CY; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 2; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = CY; g.font = `600 34px ${PL}`; g.textBaseline = "alphabetic"; g.fillText("BERKAS / PERMINTAAN", 60, 92);
    g.font = `700 96px ${PL}`; g.fillText("CDC  →  BLIZZARD", 60, 210);
    g.fillStyle = "#E8F7FD"; g.font = `700 76px ${PL}`; g.fillText("MINTA DATA WABAH", 60, 320);
    g.fillStyle = "rgba(54,197,240,.35)"; for (let k = 0; k < 4; k++) g.fillRect(60, 372 + k * 44, 560 - k * 90, 18);
    g.strokeStyle = CY; g.lineWidth = 3; g.beginPath(); g.arc(820, 470, 120, 0, 7); g.stroke(); g.beginPath(); g.arc(820, 470, 70, 0, 7); g.stroke(); g.beginPath(); g.moveTo(680, 470); g.lineTo(960, 470); g.moveTo(820, 330); g.lineTo(820, 610); g.stroke();
    g.fillStyle = RED; g.beginPath(); g.arc(850, 440, 22, 0, 7); g.fill();
  });
  const dossier = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.43), new THREE.MeshBasicMaterial({ map: dosTex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })); dossier.renderOrder = 10; cam.add(dossier);
  const stampTex = ctex(1024, 220, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(232,217,181,.95)"; g.fillRect(8, 8, w - 16, h - 16); g.strokeStyle = RED; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24); g.lineWidth = 3; g.strokeRect(30, 30, w - 60, h - 60); g.fillStyle = RED; g.font = `700 104px ${PL}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BUG, TIDAK ADA DATA", w / 2, h / 2 + 6); });
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 1.29), new THREE.MeshBasicMaterial({ map: stampTex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })); stamp.renderOrder = 11; cam.add(stamp);
  const pageTex = ctex(512, 680, (g, w, h) => { const R = mulberry(9); g.fillStyle = "#efe3c4"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = INK; g.font = `700 46px ${CZ}`; g.textAlign = "center"; g.fillText("JURNAL", w / 2, 86); g.font = `600 30px ${PL}`; g.fillText("ILMIAH", w / 2, 128); g.fillStyle = "rgba(59,42,26,.45)"; for (let k = 0; k < 9; k++) g.fillRect(44, 170 + k * 30, 380 - R() * 120, 10); g.strokeStyle = RED; g.lineWidth = 5; g.beginPath(); g.moveTo(60, 620); for (let k = 0; k <= 10; k++) g.lineTo(60 + k * 39, 620 - Math.exp(-(((k - 5) / 2.2) ** 2)) * 150); g.stroke(); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(56, 470); g.lineTo(56, 624); g.lineTo(460, 624); g.stroke(); });
  const pageM = new THREE.MeshBasicMaterial({ map: pageTex, side: THREE.DoubleSide, depthTest: false, depthWrite: false, transparent: true });
  const pages = [0, 1, 2, 3, 4, 5, 6].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.19), pageM); m.renderOrder = 9; cam.add(m); return m; });

  // ---------- times ----------
  const T = {
    bos: A("s2:Bosnya"), corr: A("s2:Corrupted"), menular: A("s2:menular"), kalah: A("s2:dikalahkan"),
    pel: A("s3:peliharaan"), simpan: A("s3:menyimpan"), dev: A("s3:Developer"), inf: A("s3:terinfeksi"), keluar: A("s3:dikeluarkan"),
    dua: A("s4:dua"), npc: A("s4:NPC"),
    heal: A("s5:healer"), jaga: A("s5:berjaga"), warn: A("s5:memperingatkan"), seng: A("s5:sengaja"), ramai: A("s5:keramaian"),
    kar: A("s6:karantina"), rst: A("s6:restart"), muncul: A("s6:muncul"), sw: A("s6:server#2") + 0.3, okt: A("s6:Oktober"),
    cdc: A("s7:CDC"), bug: A("s7:bug"), tapi: A("s7:Tapi"), jur: A("s7:jurnal"),
  };
  const ticks = [0, 1, 2, 3, 4].map((k) => T.dua + k * 1.95);
  const death = ticks[4] + 0.35, respawn = K.s5 + 0.5;
  const trav0 = T.dev, trav1 = T.keluar - 0.45;
  const H2 = new THREE.Vector3(-11, 0, -84), P2 = new THREE.Vector3(-8.6, 0, -82.8);
  const allyPos = [new THREE.Vector3(-16.5, 0, -85), new THREE.Vector3(-6.5, 0, -87)];
  const griefPath = new THREE.CatmullRomCurve3([[17, -42], [6, -27], [0.6, -19], [0.4, -12], [1.5, -5.5]].map(([x, z]) => new THREE.Vector3(x, 0, z)));
  const g0 = T.seng - 0.5, g1 = T.ramai;
  const sweepR = (t) => eout((t - T.sw) / 2.4) * 110;
  const cleanAt = (d, t) => (t < T.sw ? 1 : clamp01((d - sweepR(t)) / 5));

  // town infection level
  const level = (i, t) => {
    const c = cities[i];
    let a = (i === 0 ? 1 : ramp(t, -0.6 + 0.75 * i, 0.4 + 0.75 * i)) * (1 - ramp(t, K.s1e - 0.3, K.s2 + 0.9));
    let b = 0;
    if (i === 0) b = ramp(t, T.keluar + 0.8, K.s3e);
    else b = ramp(t, g1 + 0.2 + c.d * 0.02, g1 + 1.4 + c.d * 0.02);
    b *= 1 - 0.65 * ramp(t, T.kar + 0.2, T.kar + 1.0) + 0.75 * ramp(t, T.muncul - 0.2, T.muncul + 0.6);
    b *= cleanAt(c.d, t);
    return Math.max(a, Math.min(1.1, b));
  };

  // ---------- camera ----------
  const rp = (u) => route.getPointAt(clamp01(u));
  const travKeys = [0.0, 0.3, 0.6, 0.85, 1].map((u) => { const tt = trav0 + (trav1 - trav0) * u, p = rp(smooth(u)); return [tt + 0.2, p.x + 9, 24, p.z + 24, p.x, 1, p.z - 2]; });
  const gp = (u) => griefPath.getPointAt(clamp01(u));
  const camT = track([
    [0, 8, 96, 98, 0, 0, 5], [K.s1e - 0.5, -6, 74, 72, -1, 0, 2],
    [K.s2 + 2.6, -2, 34, -52, -13, 7, -95], [T.bos, 1, 25, -58, -13, 7, -96], [T.corr, 2, 13, -65, -11, 4.2, -87], [T.menular + 0.5, -5, 11, -67, -11, 3.4, -86], [T.kalah, 3, 20, -59, -13, 5.5, -92],
    [T.pel + 0.4, -5.5, 7, -70.5, -10, 2.2, -83.2], [T.simpan + 1.4, -4.5, 6.5, -71, -10, 2.6, -83],
    ...travKeys,
    [T.keluar + 0.3, 6, 15, 21, -0.5, 1.5, 0.5], [K.s3e, 10, 28, 38, 0, 0, -1],
    [K.s4 + 1.2, 4, 6.5, 15, -2, 3.2, 0], [death - 0.6, 2, 5.6, 12.5, -2, 2.6, 0], [T.npc + 0.4, 9, 19, 29, 0, 0.5, -1], [K.s4e, -9, 17, 27, 0, 0.5, -1],
    [T.heal - 0.5, 4, 7, 13.5, -1.2, 2.6, 1.2], [T.heal + 1.5, 2, 6.5, 13.5, -0.6, 2.4, 1.6],
    [T.jaga - 0.3, -3, 20, -8, -1, 2, -14], [T.jaga + 0.6, -11, 8.5, -38, -1, 2.6, -22], [T.seng - 0.6, -13, 8.5, -40, -2, 2.4, -24],
    [T.seng + 0.2, 22, 13, -56, 11, 2, -36], [T.seng + 1.6, 13, 15, -42, 3, 2, -22], [g1 + 0.3, 7, 19, -21, 0.5, 1, -6],
    [T.kar + 0.7, 12, 80, 82, 3, 0, 0], [T.sw + 1.0, 8, 94, 96, 2, 0, 2],
    [T.okt + 0.6, 4.6, 5.5, 11.5, 0.8, 1.1, 2.2], [K.s6e, 6.2, 6.2, 12.2, 0.8, 1.1, 2.2],
    [T.cdc + 0.9, 0, 72, 48, 0, 0, -4], [K.s7e, -6, 84, 40, 0, 0, -8],
    [K.s8 + 2.0, 6, 7.5, 15, -0.5, 2.3, 1], [K.dur, -5, 8, 15.5, -0.5, 2.3, 1],
  ]);

  const cRed = new THREE.Color(1.0, 0.16, 0.24), cGrn = new THREE.Color(0.35, 1.0, 0.45), cCy = new THREE.Color(0.25, 0.8, 1.0), cWh = new THREE.Color(1.0, 0.92, 0.75);
  const night = new THREE.Color(0x101826), dawn = new THREE.Color(0x3a2f3c), labC = new THREE.Color(0x0e2232), bgc = new THREE.Color();
  const skyN = new THREE.Color(0x9fb2d6), skyL = new THREE.Color(0x7fd6ff), skyD = new THREE.Color(0xffd2a0), kyN = new THREE.Color(0xffdfae), kyD = new THREE.Color(0xffb878);

  const poseFig = (f, x, z, ry, mode, t, ph = 0) => {
    f.W.position.set(x, 0, z); f.W.rotation.set(0, ry, 0);
    if (mode === "run") { runPose(f, t * 10 + ph); f.G.position.y = -0.252 * f.G.scale.x + Math.abs(Math.sin(t * 10 + ph)) * 0.08; }
    else { restPose(f); f.armL.rotation.z = -0.08; f.armR.rotation.z = 0.08; const b = Math.sin(t * 1.7 + ph) * 0.03; f.armL.rotation.x = b; f.armR.rotation.x = -b; f.G.position.y = -0.252 * f.G.scale.x; }
  };

  return (t) => {
    refonts();
    const p = camT(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    const cd = Math.hypot(p[0] - p[3], p[1] - p[4], p[2] - p[5]);
    const sh = Math.min(95, Math.max(18, cd * 0.55));
    Object.assign(key.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 1, far: 260 }); key.shadow.camera.updateProjectionMatrix();
    key.position.set(p[3] + 40, 80, p[5] + 34); key.target.position.set(p[3], 0, p[5]);

    // mood: night, lab cyan in s7, dawn in s8
    const lab = ramp(t, K.s7 - 0.2, K.s7 + 1.2) * (1 - ramp(t, K.s8 - 0.3, K.s8 + 1.2));
    const dw = ramp(t, K.s8 - 0.2, K.s8 + 2.5);
    bgc.copy(night).lerp(labC, lab).lerp(dawn, dw); scene.background.copy(bgc); scene.fog.color.copy(bgc);
    hemi.color.copy(skyN).lerp(skyL, lab * 0.8).lerp(skyD, dw); hemi.intensity = 0.95 + 0.25 * dw;
    key.color.copy(kyN).lerp(kyD, dw); key.intensity = 2.1 - 0.5 * lab + 0.3 * dw;
    const hud1 = 1 - ramp(t, K.s1e - 0.4, K.s2 + 0.6);
    gridM.opacity = 0.42 * hud1 + 0.5 * lab;
    retM.opacity = 0.9 * hud1 + 0.6 * lab;
    rets.forEach((m, i) => { const c = cities[i]; const s = (c.r + 5) * (1 + 0.06 * Math.sin(t * 3 + i)); m.scale.setScalar(s); });

    // towns: stains and embers
    let fi = 0; const fp = far.pos, fc = far.col;
    const putF = (x, y, z, c, a) => { if (fi >= 520) return; fp[fi * 3] = x; fp[fi * 3 + 1] = y; fp[fi * 3 + 2] = z; fc[fi * 3] = c.r * a; fc[fi * 3 + 1] = c.g * a; fc[fi * 3 + 2] = c.b * a; fi++; };
    cities.forEach((c, i) => {
      const L = level(i, t);
      stains[i].material.opacity = Math.min(0.9, L * 0.85);
      const rr = (c.r + 4) * (0.35 + 0.65 * Math.min(1, L)) * (1 + 0.05 * Math.sin(t * 4 + i));
      stains[i].scale.setScalar(rr);
      const n = i === 0 ? 120 : 50;
      for (let k = 0; k < n; k++) {
        const s = i * 1000 + k, a = hash(s) * 6.283, d = Math.sqrt(hash(s + 0.5)) * rr * 0.9, sp = 0.25 + hash(s + 0.7) * 0.35;
        const u = (t * sp + hash(s + 0.3)) % 1;
        if (L > 0.02) putF(c.x + Math.cos(a) * d, 0.5 + u * 9, c.z + Math.sin(a) * d, cRed, Math.min(1, L) * (1 - u) * 0.9);
      }
    });
    // reset sweep
    far.m.size = Math.min(1.5, Math.max(0.3, cd * 0.012));
    const sr = sweepR(t), swOn = t > T.sw && t < T.sw + 2.6;
    ring.visible = ringFill.visible = swOn;
    if (swOn) { ring.scale.setScalar(Math.max(0.01, sr)); ringM.opacity = 1 - ramp(t, T.sw + 1.6, T.sw + 2.6); ringFill.scale.setScalar(Math.max(0.01, sr)); ringFill.material.opacity = 0.22 * (1 - ramp(t, T.sw + 0.2, T.sw + 1.6)); for (let k = 0; k < 140; k++) { const a = (k / 140) * 6.283 + hash(k) * 0.05; putF(Math.cos(a) * sr, 0.6 + hash(k + 3) * 2, Math.sin(a) * sr, cWh, ringM.opacity); } }
    for (let k = fi; k < 520; k++) { fp[k * 3 + 1] = -999; }
    far.commit();

    // quarantine walls
    walls.forEach((m, i) => { const c = cities[i]; const u = eout((t - T.kar - 0.06 * i) / 0.7) * (1 - ramp(t, T.sw + c.d * 0.009, T.sw + 0.6 + c.d * 0.009)); m.visible = u > 0.001; m.scale.y = Math.max(0.001, 5 * u); });
    // server monoliths: steady, flicker on restart, corrupt red on the comeback, clean after reset
    pillars.forEach((pl, i) => {
      let e = 1.6;
      if (t > T.rst - 0.1 && t < T.rst + 1.5) e = hash(Math.floor(t * 14) + i * 7) > 0.5 ? 2.4 : 0.05;
      else if (t >= T.rst + 1.5 && t < T.rst + 1.9) e = 0.05;
      pl.m.emissive.set(CY).lerp(new THREE.Color(RED), ramp(t, T.muncul - 0.2, T.muncul + 0.5) * (1 - ramp(t, T.sw, T.sw + 0.6)));
      pl.m.emissiveIntensity = e;
    });

    // ---------- characters ----------
    let ni = 0; const np = near.pos, nc = near.col;
    const putN = (x, y, z, c, a) => { if (ni >= 900) return; np[ni * 3] = x; np[ni * 3 + 1] = y; np[ni * 3 + 2] = z; nc[ni * 3] = c.r * a; nc[ni * 3 + 1] = c.g * a; nc[ni * 3 + 2] = c.b * a; ni++; };
    const aura = (x, z, h, a, seed, n = 14, c = cRed) => { if (a <= 0.01) return; for (let k = 0; k < n; k++) { const s = seed + k * 13.1, u = (t * (0.5 + hash(s) * 0.4) + hash(s + 1)) % 1, an = hash(s + 2) * 6.283 + t * 0.8; const rr = 0.5 + hash(s + 3) * 0.5; putN(x + Math.cos(an) * rr, 0.3 + u * h, z + Math.sin(an) * rr, c, a * Math.sin(u * Math.PI)); } };

    // hero
    let hx = heroC.x, hz = heroC.z, hry = 0.35, hmode = "idle";
    if (t >= K.s2 - 0.5 && t < trav0) { hx = H2.x; hz = H2.z; hry = Math.PI - 0.15 + ramp(t, K.s3 - 0.3, T.pel) * (-Math.PI + 0.75); }
    else if (t >= trav0 && t < trav1) { const u = smooth((t - trav0) / (trav1 - trav0)); const q = rp(u), q2 = rp(u + 0.01); hx = q.x; hz = q.z; hry = Math.atan2(q2.x - q.x, q2.z - q.z); hmode = "run"; }
    else if (t >= trav1 && t < K.s5) { hry = lerp(0.2, 0.55, ramp(t, trav1, trav1 + 0.6)); }
    else if (t >= K.s5 && t < K.s6) { hry = ramp(t, T.heal - 0.6, T.heal) * Math.atan2(npcs[healIdx].x - hx, npcs[healIdx].z - hz) + (1 - ramp(t, T.heal - 0.6, T.heal)) * 0.5; }
    else if (t >= K.s6) { hry = t > K.s8 ? 0.45 : 0.6; }
    poseFig(hero, hx, hz, hry, hmode, t);
    hero.W.visible = true;
    if (t >= T.simpan - 0.4 && t < T.simpan + 1.2) { const u = ramp(t, T.simpan - 0.4, T.simpan + 0.1) * (1 - ramp(t, T.simpan + 0.7, T.simpan + 1.2)); hero.armR.rotation.x = -1.3 * u; hero.armL.rotation.x = -1.1 * u; }
    if (t >= T.keluar - 0.3 && t < T.keluar + 0.9) { const u = ramp(t, T.keluar - 0.3, T.keluar) * (1 - ramp(t, T.keluar + 0.4, T.keluar + 0.9)); hero.armR.rotation.x = -1.6 * u; }
    const fall = ramp(t, death, death + 0.5) * (1 - ramp(t, respawn, respawn + 0.7));
    hero.W.rotation.x = -1.5 * fall; hero.W.position.y = 0.15 * fall;
    if (t > T.heal - 0.4 && t < T.heal + 2.4) { const u = ramp(t, T.heal - 0.4, T.heal) * (1 - ramp(t, T.heal + 1.9, T.heal + 2.4)); hero.armR.rotation.x = -1.5 * u; hero.armL.rotation.x = -1.5 * u; hero.armL.rotation.z = -0.3 * u; hero.armR.rotation.z = 0.3 * u; }
    if (t > K.s8 + 1.2) { hero.armR.rotation.z = 2.5 + Math.sin(t * 6) * 0.35; }
    const heroInf = (t > T.corr + 0.9 && t < T.kalah + 0.5 ? ramp(t, T.corr + 0.9, T.corr + 1.4) * (1 - ramp(t, T.kalah, T.kalah + 0.5)) : 0) + (t > T.keluar + 0.8 && t < death + 0.6 ? ramp(t, T.keluar + 0.8, T.keluar + 1.4) : 0);
    aura(hx, hz, 4, heroInf, 11, 18);
    // respawn column
    const rc = ramp(t, respawn - 0.2, respawn + 0.2) * (1 - ramp(t, respawn + 0.6, respawn + 1.4));
    pillarCol.visible = rc > 0.01; pillarCol.position.set(hx, 0, hz); pillarCol.material.opacity = 0.5 * rc; pillarCol.scale.set(1 + rc * 0.2, 1, 1 + rc * 0.2);

    // health bar and damage numbers
    const hbOn = ramp(t, K.s4 - 0.2, K.s4 + 0.3) * (1 - ramp(t, death + 0.3, death + 0.8));
    hb.visible = hbOn > 0.01; hb.position.set(hx, 4.25 - 0.4 * fall, hz); hb.quaternion.copy(cam.quaternion); hb.scale.setScalar(hbOn);
    let hp = 1; ticks.forEach((tk) => { hp -= 0.2 * ramp(t, tk, tk + 0.18); }); hbFill.scale.x = Math.max(0.001, hp);
    dmgL.forEach((m, k) => { const u = (t - ticks[k]) / 1.3; m.visible = u > 0 && u < 1; if (!m.visible) return; m.position.set(hx + (k % 2 ? 0.8 : -0.8) * eout(u), 4.7 + 1.1 * eout(u), hz); m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.3 + 0.25 * back(clamp01(u * 4), 2.5)); m.material.opacity = 1 - ramp(u, 0.7, 1); });

    // pet
    let px = petC.x, pz = petC.z, py = 0, ps = 0.95, pry = -0.3;
    const atTemple = t >= K.s2 - 0.5 && t < T.keluar;
    if (atTemple) { px = P2.x; pz = P2.z; pry = Math.PI - 0.4 + ramp(t, K.s3 - 0.3, T.pel) * (-Math.PI + 0.2); }
    const inB = ramp(t, T.simpan, T.simpan + 0.55) * (1 - ramp(t, T.keluar, T.keluar + 0.25));
    const bx = hx + Math.cos(-hry) * 1.3, bz = hz + Math.sin(-hry) * 1.3 + 0.2, by = 2.7 + Math.sin(t * 2.4) * 0.12;
    if (t >= T.simpan && t < T.keluar) { const u = ramp(t, T.simpan, T.simpan + 0.55); px = lerp(P2.x, bx, u); pz = lerp(P2.z, bz, u); py = lerp(0, by - 0.45, u); ps = lerp(0.95, 0.5, u); if (t > trav0) { px = bx; pz = bz; py = by - 0.45; } }
    if (t >= T.keluar && t < T.keluar + 0.7) { const u = eout((t - T.keluar) / 0.7); px = lerp(bx, petC.x, u); pz = lerp(bz, petC.z, u); py = (by - 0.45) * (1 - u) + Math.sin(u * Math.PI) * 0.6; ps = lerp(0.5, 0.95, u); }
    pet.position.set(px, py, pz); pet.rotation.y = pry + (inB > 0 ? t * 0.8 : 0); pet.scale.setScalar(ps);
    petBody.userData.tail.rotation.y = Math.sin(t * 7) * 0.5; petBody.position.y = inB > 0 ? 0 : Math.abs(Math.sin(t * 2.2)) * 0.04;
    bubble.visible = inB > 0.01 || (t > T.keluar && t < T.keluar + 0.35);
    { const pop = ramp(t, T.keluar, T.keluar + 0.3); bubble.position.set(bx, by, bz); bubble.scale.setScalar(Math.max(0.01, 0.95 * back(ramp(t, T.simpan, T.simpan + 0.55), 2) * (1 + pop * 0.8))); bubble.material.opacity = 0.32 * (1 - pop); const rp2 = ramp(t, T.inf - 0.3, T.inf + 0.4) * (0.6 + 0.4 * Math.sin(t * 6)); bubble.material.emissive.set(CY).lerp(new THREE.Color(RED), rp2); bubble.material.emissiveIntensity = 0.5 + rp2 * 0.6; }
    const petInf = ramp(t, T.corr + 1.2, T.corr + 1.8) * cleanAt(0, t) * (t < T.sw + 1 ? 1 : 0);
    aura(px, pz, 1.8 * Math.max(ps, 0.6), petInf * (inB > 0 ? 0.6 : 1), 31, 10);
    if (inB > 0.01) for (let k = 0; k < 12; k++) { const a = hash(k + 70) * 6.283 + t * 1.5, e = hash(k + 71) * 3.14; putN(bx + Math.cos(a) * Math.sin(e) * 1.0 * inB, by + Math.cos(e) * 1.0 * inB, bz + Math.sin(a) * Math.sin(e) * 1.0 * inB, cCy, 0.7 * inB); }
    // patch shield
    const sh8 = ramp(t, T.okt, T.okt + 0.5) * (1 - ramp(t, K.s7 + 0.3, K.s7 + 1.2));
    shield.visible = sh8 > 0.01; shield.position.set(petC.x, 0, petC.z); shield.scale.setScalar(Math.max(0.01, back(ramp(t, T.okt, T.okt + 0.5), 2))); shield.material.opacity = 0.22 * sh8;
    oktL.visible = sh8 > 0.01; oktL.position.set(petC.x, 2.4 + 0.3 * eout(ramp(t, T.okt, T.okt + 0.5)), petC.z); oktL.quaternion.copy(cam.quaternion); oktL.scale.setScalar(0.62 * sh8);
    if (sh8 > 0.01) for (let k = 0; k < 24; k++) { const a = (k / 24) * 6.283 + t, u = (t * 0.7 + hash(k + 90)) % 1; putN(petC.x + Math.cos(a) * 1.6 * Math.cos(u * 1.4), 1.6 * Math.sin(u * 1.4), petC.z + Math.sin(a) * 1.6 * Math.cos(u * 1.4), cCy, sh8 * 0.8); }

    // temple: allies and boss
    const tVis = t > K.s1e - 0.4 && t < K.s4;
    allies.forEach((a, k) => { a.W.visible = tVis; poseFig(a, allyPos[k].x, allyPos[k].z, Math.PI + (k ? 0.25 : -0.25), "idle", t, k * 2); if (t > T.corr && t < T.kalah + 0.6) { const u = ramp(t, T.corr, T.corr + 0.4) * (1 - ramp(t, T.kalah, T.kalah + 0.5)); a.armR.rotation.x = -2.2 * u; } aura(allyPos[k].x, allyPos[k].z, 3.6, ramp(t, T.menular + 0.2 + k * 0.5, T.menular + 0.7 + k * 0.5) * (1 - ramp(t, T.kalah, T.kalah + 0.5)), 50 + k * 10, 14); });
    const bRise = back(ramp(t, T.bos - 0.6, T.bos + 0.5), 1.6), bSink = ramp(t, T.kalah - 0.1, T.kalah + 0.9);
    boss.W.visible = tVis && bRise > 0.01 && bSink < 0.99;
    boss.W.position.set(TX, 6.4 - 4 * (1 - bRise) - 9 * bSink, TZ + 1); boss.W.rotation.set(0, 0, 0); boss.W.scale.set(1, Math.max(0.01, 1 - bSink * 0.6), 1);
    restPose(boss); { const cast = ramp(t, T.corr - 0.5, T.corr) * (1 - ramp(t, T.kalah - 0.6, T.kalah)); boss.armR.rotation.x = -2.4 * cast + Math.sin(t * 2) * 0.05; boss.armL.rotation.x = -2.0 * cast; boss.armL.rotation.z = -0.5 * cast; boss.armR.rotation.z = 0.5 * cast; boss.G.position.y = -0.252 * 1.35 + Math.sin(t * 1.3) * 0.1; }
    bossCore.scale.setScalar(1 + 0.3 * Math.sin(t * 5));
    // the curse stream from boss to hero, then hero to allies
    if (t > T.corr - 0.3 && t < T.kalah) {
      const src = new THREE.Vector3(TX, 6.4 + 4.5, TZ + 2.2), dst = new THREE.Vector3(H2.x, 2.6, H2.z);
      const on = ramp(t, T.corr - 0.3, T.corr + 0.2) * (1 - ramp(t, T.menular, T.menular + 0.6));
      for (let k = 0; k < 160 && on > 0.01; k++) { const u = (t * 0.9 + k / 160) % 1, j = hash(k + 5) - 0.5, jj = hash(k + 6) - 0.5; putN(lerp(src.x, dst.x, u) + j * 1.2 * Math.sin(u * 3.14), lerp(src.y, dst.y, u) + Math.sin(u * Math.PI) * 2.2 + jj, lerp(src.z, dst.z, u) + jj * 1.2, cRed, on * (0.4 + 0.6 * Math.sin(u * Math.PI))); }
      allies.forEach((a, q) => { const tt0 = T.menular + q * 0.5; for (let k = 0; k < 24; k++) { const u = clamp01((t - tt0 - k * 0.02) / 0.6); if (u <= 0 || u >= 1) continue; putN(lerp(H2.x, allyPos[q].x, u), 2.4 + Math.sin(u * Math.PI) * 1.6, lerp(H2.z, allyPos[q].z, u), cRed, 0.9); } });
    }

    // townsfolk
    const outOn = (n) => ramp(t, T.npc + n.rank * 0.03, T.npc + n.rank * 0.03 + 0.2);
    npcs.forEach((n, i) => {
      const bob = Math.abs(Math.sin(t * 2.2 + n.ph)) * 0.05;
      dmy.position.set(n.x, bob, n.z); dmy.rotation.set(0, n.ry + Math.sin(t * 0.6 + n.ph) * 0.3, 0); dmy.scale.setScalar(1); dmy.updateMatrix();
      INB.setMatrixAt(i, dmy.matrix); INH.setMatrixAt(i, dmy.matrix); INC.setMatrixAt(i, dmy.matrix);
      const inf = ramp(t, T.keluar + 1.0 + n.rank * 0.07, T.keluar + 1.2 + n.rank * 0.07) * cleanAt(Math.hypot(n.x, n.z), t);
      const healed = i === healIdx ? ramp(t, T.heal + 0.9, T.heal + 1.5) : 0;
      const o = outOn(n) * inf * (1 - healed);
      dmy.scale.set(o > 0.01 ? 1.16 : 0.001, o > 0.01 ? 1.07 : 0.001, o > 0.01 ? 1.16 : 0.001); dmy.position.y = bob - 0.04; dmy.updateMatrix(); IOB.setMatrixAt(i, dmy.matrix); IOH.setMatrixAt(i, dmy.matrix);
      aura(n.x, n.z, 2.8, inf * (1 - healed) * 0.7, 200 + i * 7, 4);
      // jump from the infected neighbour
      const t0 = T.keluar + 0.8 + n.rank * 0.07; const src = n.par >= 0 ? npcs[n.par] : { x: petC.x, z: petC.z };
      for (let k = 0; k < 5; k++) { const u = clamp01((t - t0 - k * 0.03) / 0.35); if (u <= 0 || u >= 1) continue; putN(lerp(src.x, n.x, u), 1.8 + Math.sin(u * Math.PI) * 1.6, lerp(src.z, n.z, u), cRed, 1); }
    });
    [INB, INH, INC, IOB, IOH].forEach((m) => (m.instanceMatrix.needsUpdate = true));
    // heal beam
    if (t > T.heal - 0.2 && t < T.heal + 2.4) { const tg = npcs[healIdx]; for (let k = 0; k < 60; k++) { const u = (t * 0.8 + k / 60) % 1, a = u * 12 + k; const on = ramp(t, T.heal - 0.2, T.heal + 0.3) * (1 - ramp(t, T.heal + 1.9, T.heal + 2.4)); putN(lerp(hx, tg.x, u) + Math.cos(a) * 0.35, lerp(3.0, 1.6, u) + Math.sin(a) * 0.35, lerp(hz, tg.z, u), cGrn, on); } aura(npcs[healIdx].x, npcs[healIdx].z, 3, ramp(t, T.heal + 0.5, T.heal + 1.0) * (1 - ramp(t, T.heal + 1.9, T.heal + 2.4)), 400, 18, cGrn); }

    // warner, traveller, griefer
    const s5v = t > K.s5 - 0.5 && t < K.s6 + 0.8;
    gateL.intensity = 90 * ramp(t, T.jaga - 1.2, T.jaga - 0.4) * (1 - ramp(t, K.s6, K.s6 + 0.8));
    warner.W.visible = sign.visible = s5v;
    poseFig(warner, -0.6, -20, Math.PI + 0.15, "idle", t, 1);
    const sgn = back(ramp(t, T.jaga, T.jaga + 0.5), 2);
    sign.position.set(-1.9, 0, -20.6); sign.scale.set(1, Math.max(0.01, sgn), 1); sign.rotation.y = Math.PI + 0.15;
    warner.armR.rotation.x = -1.2 * sgn; warner.armL.rotation.z = -(0.3 + 1.9 * ramp(t, T.warn - 0.2, T.warn + 0.2) * (0.75 + 0.25 * Math.sin(t * 9))) * (1 - ramp(t, T.seng + 1.4, T.seng + 1.8));
    trav.W.visible = s5v && t < T.seng + 0.5;
    { const goIn = clamp01((t - (T.jaga - 0.2)) / 2.2), back2 = clamp01((t - T.warn - 1.1) / 2.4); let tz = lerp(-37, -25.5, goIn), tx = lerp(-4, -1.2, goIn); let ry = 0.15, mode = goIn > 0 && goIn < 1 ? "run" : "idle"; if (back2 > 0) { tz = lerp(-25.5, -39, back2); tx = lerp(-1.2, -6, back2); ry = Math.PI + 0.3; mode = back2 < 1 ? "run" : "idle"; } if (t > T.warn + 0.4 && t < T.warn + 1.1) ry = lerp(0.15, Math.PI + 0.3, ramp(t, T.warn + 0.5, T.warn + 1.1)); poseFig(trav, tx, tz, ry, mode, t * 0.75, 3); }
    grief.W.visible = t > g0 - 0.2 && t < K.s6 + 0.8;
    { const u = clamp01((t - g0) / (g1 - g0)); const q = gp(u), q2 = gp(Math.min(1, u + 0.01)); poseFig(grief, q.x, q.z, Math.atan2(q2.x - q.x, q2.z - q.z), u > 0 && u < 1 ? "run" : "idle", t * 1.2, 5); aura(q.x, q.z, 4, grief.W.visible ? 1 : 0, 600, 22);
      if (t > g1 && t < g1 + 1.4) { const v = (t - g1) / 1.4; for (let k = 0; k < 80; k++) { const a = hash(k + 900) * 6.283, sp = 3 + hash(k + 901) * 6; putN(q.x + Math.cos(a) * sp * eout(v), 1 + hash(k + 902) * 3 + 2 * Math.sin(v * 3), q.z + Math.sin(a) * sp * eout(v), cRed, 1 - v); } } }

    for (let k = ni; k < 900; k++) np[k * 3 + 1] = -999;
    near.commit();

    // ---------- lab layer ----------
    const dIn = eout(ramp(t, T.cdc + 0.2, T.cdc + 0.9)), dOut = ramp(t, T.tapi, T.tapi + 0.7);
    dossier.visible = dIn > 0.01 && dOut < 0.99;
    dossier.position.set(0, -0.15 - (1 - dIn) * 3 + dOut * 5, -22); dossier.rotation.set(-0.08 * (1 - dIn), 0, 0); dossier.material.opacity = dIn * (1 - dOut);
    const sIn = ramp(t, T.bug - 0.1, T.bug + 0.12);
    stamp.visible = sIn > 0.01 && dOut < 0.99;
    stamp.position.set(0.25, -1.05 + dOut * 5, -21.5); stamp.rotation.set(0, 0, -0.1); stamp.scale.setScalar(1 + 1.2 * (1 - sIn)); stamp.material.opacity = sIn * (1 - dOut);
    pages.forEach((m, j) => {
      const t0 = T.jur - 0.4 + j * 0.42, u = (t - t0) / 3.6;
      m.visible = u > 0 && u < 1 && t < K.s8 + 0.2;
      if (!m.visible) return;
      const x = -3.4 + ((j * 0.37) % 1) * 6.8 + Math.sin(t * 1.8 + j) * 0.6;
      m.position.set(x, lerp(9.5, -9.5, u), -20 - j * 0.25);
      m.rotation.set(Math.sin(t * 2.2 + j) * 0.5, Math.sin(t * 1.5 + j * 2) * 0.7, Math.sin(t * 1.9 + j) * 0.35);
    });
    comp.render();
  };
}
