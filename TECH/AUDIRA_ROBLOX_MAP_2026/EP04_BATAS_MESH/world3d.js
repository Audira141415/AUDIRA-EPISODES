// EP04 BATAS MESH (DRAFTFORGE look): one endless navy blueprint sheet with a millimetre grid. Every model is a
// CAD wireframe (cyan / white ink over a navy fill that hides back lines), dimensions are gold, rejections are crimson.
// Stations along +X: A rock (triangle limit), B texture board + stud cubes, C camera rings (LOD), D tree + rock (collision).
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, stage, avatar, runPose, restPose } from "./lib3d.js";

const C = { bg: 0x061327, navy: 0x091b36, fill: 0x0b2244, cy: 0x4fc3f7, wh: 0xf0f6ff, gold: 0xffca28, red: 0xef5350, dim: 0x547299 };
const MONO = "'JetBrains Mono'", COND = "'Barlow Condensed'";
const XA = 0, XB = 80, XC = 170, XD = 260;

// Canvas textures repaint when a web font finishes loading, so labels never keep a fallback face.
const texs = [];
function tex(w, h, draw, opt = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  if (opt.near) { tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false; } else tx.anisotropy = 8;
  if (opt.rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(opt.rep[0], opt.rep[1]); }
  const o = { paint() { const g = c.getContext("2d"); g.clearRect(0, 0, w, h); draw(g, w, h); tx.needsUpdate = true; } };
  o.paint(); texs.push(o); return tx;
}
let fkey = -1;
function fontsTick() {
  let n = 0;
  try { document.fonts.forEach((f) => { if (f.status === "loaded") n++; }); } catch (e) {}
  if (n !== fkey) { fkey = n; texs.forEach((o) => o.paint()); }
}

const lineM = (c, o = 1) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, toneMapped: false, depthWrite: false });
const dashM = (c, o = 1, ds = 0.45, gs = 0.3) => new THREE.LineDashedMaterial({ color: c, transparent: true, opacity: o, dashSize: ds, gapSize: gs, toneMapped: false, depthWrite: false });
const fillM = (c = C.fill, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, toneMapped: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });

// Fade a whole group: remembers each material's base opacity once.
function fade(G, o) {
  G.visible = o > 0.002;
  G.traverse((m) => { const mm = m.material; if (!mm) return; if (mm.userData.b === undefined) mm.userData.b = mm.opacity; mm.opacity = mm.userData.b * o; });
}
function setCol(obj, c) { obj.traverse((m) => { if (m.isLineSegments || m.isLine) m.material.color.set(c); }); }

function plane(w, h, size, draw, opt) {
  const t = tex(w, h, draw, opt);
  return new THREE.Mesh(new THREE.PlaneGeometry(size, (size * h) / w), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
}
function tlabel(text, { col = "#ffca28", px = 64, wt = 700, font = MONO, w = 512, h = 104, size = 4, bg = null, border = null } = {}) {
  return plane(w, h, size, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    if (border) { g.strokeStyle = border; g.lineWidth = 5; g.strokeRect(3, 3, w - 6, h - 6); }
    g.font = `${wt} ${px}px ${font}`; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2 + 3);
  });
}

// Rock: a displaced icosphere. Detail d gives 20*(d+1)^2 triangles, the number the HTML counter follows.
function rockGeo(d, seed = 0) {
  const g = new THREE.IcosahedronGeometry(1, d), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n = 1 + 0.16 * Math.sin(3.1 * v.x + 1.3 + seed) * Math.cos(2.3 * v.y - 0.7 + seed) + 0.1 * Math.sin(5.2 * v.z + 4.1 * v.x + seed * 2) + 0.05 * Math.sin(9 * v.y + 7 * v.z);
    v.multiplyScalar(n); if (v.y < -0.62) v.y = -0.62 - (v.y + 0.62) * 0.15;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
function wire(geo, { line = C.cy, o = 0.95, fill = C.fill, fo = 1, edges = false } = {}) {
  const G = new THREE.Group();
  const f = new THREE.Mesh(geo, fillM(fill, fo)); G.add(f);
  const l = new THREE.LineSegments(edges ? new THREE.EdgesGeometry(geo, 18) : new THREE.WireframeGeometry(geo), lineM(line, o)); G.add(l);
  return { G, f, l };
}
function dashed(geo, c = C.gold, o = 0.95, edges = false, fo = 0.07) {
  const G = new THREE.Group();
  const l = new THREE.LineSegments(edges ? new THREE.EdgesGeometry(geo, 18) : new THREE.WireframeGeometry(geo), dashM(c, o)); l.computeLineDistances(); G.add(l);
  if (fo > 0) G.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: fo, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })));
  return G;
}

// Technical dimension: extension lines, measured span, arrowheads and a gold value.
function dimLine(a, b, off, text, { size = 3.4, rot = null, col = C.gold, labCol = "#ffca28" } = {}) {
  const G = new THREE.Group();
  const A2 = a.clone().add(off), B2 = b.clone().add(off), n = off.clone().normalize(), ext = n.clone().multiplyScalar(0.35);
  const dir = B2.clone().sub(A2).normalize(), L = A2.distanceTo(B2), ah = Math.min(0.7, L * 0.08);
  const v = (p, k1, k2) => p.clone().add(dir.clone().multiplyScalar(k1)).add(n.clone().multiplyScalar(k2));
  const P = [a, A2.clone().add(ext), b, B2.clone().add(ext), A2, B2, A2, v(A2, ah, ah * 0.4), A2, v(A2, ah, -ah * 0.4), B2, v(B2, -ah, ah * 0.4), B2, v(B2, -ah, -ah * 0.4)];
  const ls = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(P), lineM(col, 0.95)); G.add(ls);
  const l = tlabel(text, { col: labCol, size }); l.position.copy(A2).lerp(B2, 0.5).add(n.clone().multiplyScalar(size * 0.16 + 0.25));
  if (rot) l.rotation.copy(rot);
  G.add(l);
  return G;
}
const FLAT = new THREE.Euler(-Math.PI / 2, 0, 0);

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: C.bg, fog: 0.0052, exp: 1.0, bloom: [0.22, 0.4, 0.86], shadow: false });
  const rnd = mulberry(404);

  // ---------- the blueprint sheet ----------
  const gridT = tex(512, 512, (g, w) => {
    g.fillStyle = "#091b36"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "#163a6e"; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { const p = (i * w) / 8; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
    g.strokeStyle = "#2a5596"; g.lineWidth = 5; g.strokeRect(0, 0, w, w);
  }, { rep: [80, 30] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 300), new THREE.MeshBasicMaterial({ map: gridT, toneMapped: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(160, 0, -40); scene.add(floor);
  // long construction lines across the sheet (ghost cyan) and a gold leader, like a real drafting pass
  {
    const P = [];
    for (let i = 0; i < 14; i++) { const z = -60 + i * 9 + rnd() * 4; P.push(new THREE.Vector3(-80, 0.03, z), new THREE.Vector3(420, 0.03, z + (rnd() - 0.5) * 20)); }
    for (let i = 0; i < 10; i++) { const x = -40 + i * 46 + rnd() * 10; P.push(new THREE.Vector3(x, 0.03, 40), new THREE.Vector3(x + (rnd() - 0.5) * 30, 0.03, -160)); }
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(P), lineM(C.cy, 0.16)));
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30, 0.04, 30), new THREE.Vector3(330, 0.04, -70)]), lineM(C.gold, 0.35)));
  }

  // ---------- the avatar, restyled as an inked drawing ----------
  const A = avatar({ face: false, make: () => fillM(0x0f2d57, 1) });
  A.G.traverse((m) => { if (m.isMesh) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 25), lineM(m === A.torso ? C.cy : C.wh, 1))); });
  {
    const fT = tex(128, 128, (g) => { g.strokeStyle = "#4fc3f7"; g.fillStyle = "#4fc3f7"; g.beginPath(); g.ellipse(42, 48, 8, 12, 0, 0, 7); g.ellipse(86, 48, 8, 12, 0, 0, 7); g.fill(); g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.arc(64, 62, 30, 0.35, 2.8); g.stroke(); });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshBasicMaterial({ map: fT, transparent: true, toneMapped: false, depthWrite: false })); f.position.set(0, 0.6, 0.64); A.head.add(f);
  }
  scene.add(A.G);
  // impact ring + question mark used by the bumps
  const ringGeo = new THREE.RingGeometry(0.9, 1.0, 40);
  const impact = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })); scene.add(impact);
  const qm = tlabel("?", { col: "#ffca28", px: 96, w: 128, h: 128, size: 1.8 }); scene.add(qm);

  // ---------- station A: the rock that is too detailed ----------
  const DET = [0, 1, 3, 7, 11, 15, 24, 31];
  const RG = {}; DET.forEach((d) => { const g = rockGeo(d, 0); RG[d] = { g, w: new THREE.WireframeGeometry(g) }; });
  const rockA = new THREE.Group(); rockA.position.set(XA, 2.6, 0); rockA.scale.set(3.6, 2.9, 3.2); scene.add(rockA);
  const rAf = new THREE.Mesh(RG[7].g, fillM(C.fill, 1)); rockA.add(rAf);
  const rAl = new THREE.LineSegments(RG[7].w, lineM(C.cy, 0.9)); rockA.add(rAl);
  const rAout = dashed(rockGeo(1, 0), C.red, 0, false, 0); rockA.add(rAout); rAout.scale.setScalar(1.12);
  const sheetA = tlabel("AUDIRA · SHEET A-01 · MESH", { col: "#4fc3f7", px: 44, w: 1024, h: 90, size: 9 });
  sheetA.rotation.copy(FLAT); sheetA.position.set(XA + 1, 0.05, 9.5); scene.add(sheetA);
  const dimA = dimLine(new THREE.Vector3(XA + 3.9, 0, 0), new THREE.Vector3(XA + 3.9, 5.6, 0), new THREE.Vector3(1.4, 0, 0), "MESH", { size: 3 }); scene.add(dimA);
  const sA = [["s1:Model", 7], ["s1:Model+0.45", 11], ["s1:Model+0.85", 15], ["s1:Model+1.25", 24], ["s1:Model+1.6", 31]];
  const sB = [["s2:Setiap", 0], ["s2:dari", 1], ["s2:kecil", 3], ["s2:Makin", 7], ["s2:halus", 15], ["s2:banyak", 24], ["s2:segitiganya", 31]];
  const tA0 = AT["s1:Model"];
  function rockDetail(t) {
    if (t < K.s2 - 0.1) { let d = 7; const offs = [0, 0.45, 0.85, 1.25, 1.6]; offs.forEach((o, i) => { if (t >= tA0 + o) d = sA[i][1]; }); return d; }
    let d = 0; sB.forEach(([a, v]) => { if (t >= AT[a]) d = v; }); return d;
  }

  // ---------- station B: texture board + stud cubes ----------
  const boardT = tex(1024, 1024, (g, w) => {
    g.fillStyle = "#0a1f3e"; g.fillRect(0, 0, w, w);
    for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) if ((i + j) % 2) { g.fillStyle = "#10305c"; g.fillRect(i * 32, j * 32, 32, 32); }
    g.strokeStyle = "rgba(79,195,247,.35)"; g.lineWidth = 1; for (let i = 0; i <= 64; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, w); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); }
    g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, w - 8);
    g.fillStyle = "rgba(6,19,39,.85)"; g.fillRect(170, 400, 684, 224); g.strokeStyle = "#4fc3f7"; g.lineWidth = 4; g.strokeRect(170, 400, 684, 224);
    g.font = `800 120px ${COND}`; g.fillStyle = "#f0f6ff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("4096 × 4096", 512, 488);
    g.font = `700 46px ${MONO}`; g.fillStyle = "#4fc3f7"; g.fillText("TEKSTUR MAKS · PX", 512, 576);
  });
  const board = new THREE.Group(); board.position.set(XB - 8, 1, -14); scene.add(board);
  const boardM = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ map: boardT, toneMapped: false, transparent: true, color: 0x9aa8c0 })); boardM.position.y = 10; board.add(boardM);
  const boardDims = new THREE.Group(); scene.add(boardDims);
  boardDims.add(dimLine(new THREE.Vector3(XB - 18, 1, -14), new THREE.Vector3(XB + 2, 1, -14), new THREE.Vector3(0, -0.01, 2.2), "4096 px", { size: 4.6, rot: FLAT }));
  boardDims.add(dimLine(new THREE.Vector3(XB - 18, 1, -14), new THREE.Vector3(XB - 18, 21, -14), new THREE.Vector3(-1.8, 0, 0), "4096 px", { size: 4.2 }));
  const sw = (cells, px) => tex(px, px, (g, w) => { const s = w / cells; for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) { g.fillStyle = (i + j) % 2 ? "#4fc3f7" : "#0b2244"; g.fillRect(i * s, j * s, s, s); } g.strokeStyle = "#fff"; g.lineWidth = Math.max(2, w / 64); g.strokeRect(0, 0, w, w); }, { near: true });
  function cube(size, cells, px, x, z) {
    const geo = new THREE.BoxGeometry(size, size, size);
    const G = new THREE.Group(); G.position.set(x, 0, z);
    const inner = new THREE.Group(); inner.position.y = size / 2; G.add(inner);
    inner.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: sw(cells, px), toneMapped: false, transparent: true, opacity: 0.9, color: 0x9fb8d8 })));
    inner.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineM(C.wh, 1)));
    scene.add(G); return G;
  }
  const cube5 = cube(5, 8, 256, XB - 4, 8), cube20 = cube(20, 32, 512, XB + 15, -3);
  const lab5 = tlabel("256 px", { col: "#f0f6ff", px: 70, size: 4.6, bg: "rgba(6,19,39,.85)", border: "#4fc3f7" }); lab5.position.set(XB - 4, 7.6, 8); scene.add(lab5);
  const lab20 = tlabel("1024 px", { col: "#f0f6ff", px: 70, size: 11, bg: "rgba(6,19,39,.85)", border: "#4fc3f7" }); lab20.position.set(XB + 15, 24.2, -3); scene.add(lab20);
  const dim5 = dimLine(new THREE.Vector3(XB - 6.5, 0.05, 10.5), new THREE.Vector3(XB - 1.5, 0.05, 10.5), new THREE.Vector3(0, 0, 1.6), "5 STUD", { size: 6.5, rot: FLAT }); scene.add(dim5);
  const dim20 = dimLine(new THREE.Vector3(XB + 5, 0.05, 7), new THREE.Vector3(XB + 25, 0.05, 7), new THREE.Vector3(0, 0, 2), "20 STUD", { size: 12, rot: FLAT }); scene.add(dim20);

  // ---------- station C: camera icon + distance rings ----------
  const CC = new THREE.Vector3(XC, 0, 18), R1 = 8, R2 = 16;
  const camIcon = new THREE.Group(); camIcon.position.copy(CC); scene.add(camIcon);
  { const b = wire(new THREE.BoxGeometry(2.6, 1.7, 1.8), { line: C.wh, edges: true }); b.G.position.y = 1.6; camIcon.add(b.G);
    const lg = new THREE.CylinderGeometry(0.6, 0.75, 1.1, 14); lg.rotateX(Math.PI / 2); const ln = wire(lg, { line: C.cy, edges: true }); ln.G.position.set(0, 1.6, -1.4); camIcon.add(ln.G);
    const vf = wire(new THREE.BoxGeometry(1.2, 0.6, 0.6), { line: C.wh, edges: true }); vf.G.position.set(-0.5, 2.75, 0.2); camIcon.add(vf.G);
    const fr = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.6, -2), new THREE.Vector3(-9, 0.4, -24), new THREE.Vector3(0, 1.6, -2), new THREE.Vector3(9, 0.4, -24)]), dashM(C.cy, 0.5));
    fr.computeLineDistances(); camIcon.add(fr); }
  function ringLoop(r, c, o) { const P = []; for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2; P.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(P), dashM(c, o, 0.9, 0.5)); l.computeLineDistances(); return l; }
  const rings = new THREE.Group(); rings.position.set(CC.x, 0.06, CC.z); scene.add(rings);
  const ring1 = ringLoop(R1, C.gold, 1), ring2 = ringLoop(R2, C.gold, 1); rings.add(ring1, ring2);
  const band = (r0, r1, c, o) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 96), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, toneMapped: false, depthWrite: false })); m.rotation.x = -Math.PI / 2; return m; };
  const band1 = band(0.01, R1, C.cy, 0.1), band2 = band(R1, R2, C.cy, 0.05), band3 = band(R2, 30, C.dim, 0.05); rings.add(band1, band2, band3);
  const rl1 = tlabel("250 STUD", { col: "#ffca28", px: 66, size: 5 }); rl1.rotation.copy(FLAT); rl1.position.set(CC.x - 5.2, 0.08, CC.z - R1 + 1.4); scene.add(rl1);
  const rl2 = tlabel("500 STUD", { col: "#ffca28", px: 66, size: 5.6 }); rl2.rotation.copy(FLAT); rl2.position.set(CC.x - 7.5, 0.08, CC.z - R2 + 1.6); scene.add(rl2);
  const LOD = [[15, 4.5, -2.6, "TERTINGGI", "#f0f6ff"], [3, 12, -2.2, "SEDANG", "#4fc3f7"], [0, 22, -1.6, "TERENDAH", "#6b8bb2"]].map(([d, dist, x, txt, col]) => {
    const G = new THREE.Group(); G.position.set(CC.x + x, 2.1, CC.z - dist); G.scale.set(2.5, 2.1, 2.3); scene.add(G);
    G.add(new THREE.Mesh(RG[d].g, fillM(C.fill, 1))); G.add(new THREE.LineSegments(RG[d].w, lineM(d === 15 ? C.wh : C.cy, d === 15 ? 0.7 : 0.95)));
    const lb = tlabel(txt, { col, px: 60, size: 5.4 }); lb.position.set(CC.x + x, 5.6, CC.z - dist); scene.add(lb);
    return { G, lb };
  });

  // ---------- station D: tree + rock, visual shape vs collision shape ----------
  const tree = new THREE.Group(); tree.position.set(XD, 0, 0); scene.add(tree);
  const trunkG = new THREE.CylinderGeometry(0.55, 0.85, 5.6, 7); trunkG.translate(0, 2.8, 0);
  const trunk = wire(trunkG, { line: C.wh, o: 0.9 }); tree.add(trunk.G);
  const BL = [[2.7, 2.3, 2.5, 0, 7.3, 0, 1], [1.9, 1.6, 1.8, -2.3, 5.9, 0.6, 2], [2.0, 1.7, 1.9, 2.2, 6.3, -0.5, 3]];
  const blobs = BL.map(([sx, sy, sz, x, y, z, s]) => { const w = wire(rockGeo(3, s), { line: C.cy, o: 0.85 }); w.G.position.set(x, y, z); w.G.scale.set(sx, sy, sz); tree.add(w.G); return w; });
  // collision hulls
  const H = {};
  H.box = dashed(new THREE.BoxGeometry(9.6, 10.2, 7), C.gold, 0.95, true); H.box.position.set(0, 5.1, 0);
  const prof = [[0.9, 0], [2.8, 4.2], [4.5, 6.6], [3.7, 8.9], [0.02, 10.1]].map(([r, y]) => new THREE.Vector2(r, y));
  H.hull = dashed(new THREE.LatheGeometry(prof, 10), C.gold, 0.95, true);
  H.def = new THREE.Group(); { const tb = dashed(new THREE.BoxGeometry(1.9, 5.2, 1.9), C.gold, 0.95, true); tb.position.y = 2.6; H.def.add(tb); const cp = dashed(rockGeo(0, 1), C.gold, 0.95); cp.position.set(0, 6.9, 0); cp.scale.set(5.0, 2.9, 3.5); H.def.add(cp); }
  const pcd = (k) => { const G = new THREE.Group(); const tc = dashed(new THREE.CylinderGeometry(0.72, 0.98, 5.6, 6), C.gold, 0.95); tc.position.y = 2.8; G.add(tc);
    BL.forEach(([sx, sy, sz, x, y, z, s], i) => { const b = dashed(rockGeo(1, s), i % 2 ? 0xffa726 : C.gold, 0.95); b.position.set(x, y, z); b.scale.set(sx * k, sy * k, sz * k); b.userData.s = [sx, sy, sz]; G.add(b); }); return G; };
  H.pcd = pcd(1.1); H.tun = pcd(1.1);
  Object.values(H).forEach((g) => tree.add(g));
  const HN = { box: "BOX", hull: "HULL", def: "DEFAULT", pcd: "PRECISECONVEXDECOMPOSITION", tun: "TUNABLE" };
  const HL = {}; Object.entries(HN).forEach(([k, s]) => { const l = tlabel(s, { col: "#ffca28", px: s.length > 12 ? 58 : 84, wt: 700, w: 1024, h: 120, size: s.length > 12 ? 13 : 9, font: s.length > 12 ? MONO : COND }); HL[k] = l; });
  const lookLab = tlabel("TERLIHAT", { col: "#4fc3f7", px: 64, size: 4.6 }); lookLab.position.set(XD + 3.6, 1.2, 3); scene.add(lookLab);
  const physLab = tlabel("DIHITUNG FISIKA", { col: "#ffca28", px: 52, w: 640, size: 6.2 }); physLab.position.set(XD - 6.8, 1.0, 4); scene.add(physLab);
  const notLab = tlabel("TIDAK SAMA PERSIS", { col: "#ef5350", px: 54, w: 720, size: 7, bg: "rgba(6,19,39,.85)", border: "#ef5350" }); notLab.position.set(XD + 0.5, 0.9, 6.5); scene.add(notLab);
  // the second object: a rock whose collision shape bulges toward the path
  const rock2 = new THREE.Group(); rock2.position.set(XD + 8, 1.55, 7); rock2.scale.set(2.4, 1.8, 2.2); scene.add(rock2);
  rock2.add(new THREE.Mesh(RG[3].g, fillM(C.fill, 1))); const r2l = new THREE.LineSegments(RG[3].w, lineM(C.cy, 0.9)); rock2.add(r2l);
  const col2 = dashed(rockGeo(0, 2), C.red, 0.95, false, 0.08); col2.position.set(XD + 7.5, 1.6, 7); col2.scale.set(3.5, 2.5, 2.9); scene.add(col2);
  const airLab = tlabel("MENABRAK UDARA", { col: "#ef5350", px: 56, w: 640, size: 6.4 }); airLab.position.set(XD + 8.5, 6.4, 7); scene.add(airLab);
  // title block printed on the sheet, the in-world AUDIRA signature
  const tbT = tex(1024, 512, (g, w, h) => {
    g.fillStyle = "rgba(9,27,54,.96)"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.lineWidth = 3; g.beginPath(); g.moveTo(6, 190); g.lineTo(w - 6, 190); g.moveTo(6, 300); g.lineTo(w - 6, 300); g.moveTo(512, 300); g.lineTo(512, h - 6); g.moveTo(6, 400); g.lineTo(w - 6, 400); g.stroke();
    g.textBaseline = "middle"; g.textAlign = "left";
    g.font = `800 140px ${COND}`; g.fillStyle = "#f0f6ff"; g.fillText("AUDIRA", 40, 104);
    g.font = `700 44px ${MONO}`; g.fillStyle = "#4fc3f7"; g.fillText("DRAWING NO. 04", 560, 80); g.fillStyle = "#6b8bb2"; g.font = `500 32px ${MONO}`; g.fillText("RAHASIA MAP ROBLOX", 560, 136);
    g.font = `700 46px ${MONO}`; g.fillStyle = "#f0f6ff"; g.fillText("BATAS MESH & COLLISION", 40, 246);
    g.font = `500 32px ${MONO}`; g.fillStyle = "#6b8bb2"; g.fillText("SKALA: STUD", 40, 352); g.fillText("DIGAMBAR: AUDIRA", 548, 352);
    g.fillText("STATUS:", 40, 456); g.fillText("SHEET: D", 548, 456);
  });
  const tblock = new THREE.Mesh(new THREE.PlaneGeometry(11, 5.5), new THREE.MeshBasicMaterial({ map: tbT, toneMapped: false, transparent: true, depthWrite: false })); tblock.position.set(XD + 7.4, 6.5, 2); tblock.material.color.set(0xc8d0de); scene.add(tblock);
  const stamp = tlabel("APPROVED", { col: "#ef5350", px: 70, w: 512, h: 120, size: 3.0, border: "#ef5350" }); stamp.rotation.set(0, 0, 0.12); stamp.position.set(XD + 4.8, 4.35, 2.3); stamp.renderOrder = 5; scene.add(stamp);

  // ---------- camera: station to station along the sheet ----------
  // Key times were authored on the first estimate; remap them piecewise onto the current scene starts.
  const OLDK = [0, 0.1, 5.938, 17.042, 34.626, 47.814, 58.99, 72.131, 83.288, 93.705, 300];
  const NEWK = [0, K.s1, K.s2, K.s3, K.s4, K.s5, K.s6, K.s7, K.s8, K.end, 300 + K.end - 93.705];
  const rm = (o) => { let i = 0; while (o > OLDK[i + 1]) i++; return NEWK[i] + (o - OLDK[i]) * (NEWK[i + 1] - NEWK[i]) / (OLDK[i + 1] - OLDK[i]); };
  const c0 = track([
    [rm(0), XA + 2.5, 6.5, 29, XA - 1.8, 3.2, 0],
    [rm(5.5), XA - 2, 7.5, 26, XA - 1.8, 3.0, 0],
    [rm(6.4), XA - 4, 8, 26, XA - 1.8, 2.9, 1],
    [rm(11.5), XA + 2, 9, 26, XA - 1.8, 2.9, 1],
    [rm(16.4), XA + 4, 7.5, 27, XA - 1.8, 2.9, 1],
    [rm(17.6), XB - 6, 16, 64, XB - 8, 12, -14],
    [rm(24.8), XB - 10, 15, 60, XB - 8, 12, -14],
    [rm(26.2), XB - 5, 9, 46, XB - 6, 4, 8],
    [rm(30.9), XB - 7, 9, 43, XB - 6, 4, 8],
    [rm(32.4), XB + 6, 26, 112, XB + 7, 11, 0],
    [rm(33.9), XB + 8, 25, 108, XB + 7, 11, 0],
    [rm(35.2), XC + 4, 30, 50, XC, -1, 4],
    [rm(41), XC - 2, 28, 47, XC, -1.5, 4],
    [rm(47.3), XC + 2, 27, 45, XC, -1.5, 3],
    [rm(48.4), XD - 4, 9, 48, XD - 3, 5, 0],
    [rm(58.4), XD - 2, 8.5, 46, XD - 2.5, 5, 0],
    [rm(59.4), XD + 5, 10, 58, XD + 3, 5, 1],
    [rm(71.5), XD + 2, 10.5, 57, XD + 3, 5, 1],
    [rm(72.6), XD + 2, 8.5, 50, XD + 2, 5, 3],
    [rm(78.0), XD + 4, 8, 50, XD + 3, 4.8, 4],
    [rm(82.8), XD + 5, 7.5, 46, XD + 4, 4.6, 5],
    [rm(84.2), XD + 3.5, 9, 54, XD + 3.6, 5.4, 2],
    [rm(93.7), XD + 2.8, 10, 57, XD + 3.6, 5.4, 2],
  ]);
  const look = new THREE.Vector3();

  const show = (o, v) => fade(o, clamp01(v));
  const between = (t, a, b, f = 0.3) => Math.min(ramp(t, a - f, a), 1 - ramp(t, b - f, b));

  return (t) => {
    fontsTick();
    const [px, py, pz, lx, ly, lz] = c0(t);
    cam.position.set(px + Math.sin(t * 0.37) * 0.25, py + Math.sin(t * 0.29) * 0.18, pz);
    look.set(lx, ly, lz); cam.lookAt(look);

    // ---- A: rock subdivision + rejection ----
    const d = rockDetail(t);
    rAf.geometry = RG[d].g; rAl.geometry = RG[d].w;
    const over = d >= 31, rej = t >= AT["s1:ditolak"] || t >= K.s2;
    rAl.material.color.set(over && rej ? C.red : C.cy);
    rAl.material.opacity = d >= 24 ? 0.55 : d >= 15 ? 0.7 : 0.95;
    const flash = t < K.s2 ? ramp(t, AT["s1:ditolak"], AT["s1:ditolak"] + 0.15) * (0.6 + 0.4 * Math.sin(t * 18)) : 0;
    show(rAout, flash);
    rockA.rotation.y = 0.25 + t * 0.06;
    show(dimA, t < K.s2 ? 0 : ramp(t, AT["s2:maksimal"] - 0.2, AT["s2:maksimal"] + 0.3));

    // ---- B ----
    const bIn = ramp(t, K.s3 - 0.2, K.s3 + 1.0);
    board.scale.y = Math.max(0.001, bIn); show(board, t < K.s3 - 0.3 ? 0 : 1);
    show(boardDims, ramp(t, AT["s3:empat"] - 0.2, AT["s3:empat"] + 0.4));
    const c5 = back(clamp01((t - AT["s3:objek#2"] + 0.2) / 0.5)), c20 = back(clamp01((t - AT["s3:objek#3"] + 0.2) / 0.55));
    cube5.scale.set(1, Math.max(0.001, c5), 1); cube5.visible = c5 > 0.002;
    cube20.scale.set(1, Math.max(0.001, c20), 1); cube20.visible = c20 > 0.002;
    show(lab5, ramp(t, AT["s3:dua"] - 0.1, AT["s3:dua"] + 0.3)); show(dim5, ramp(t, AT["s3:lima"] - 0.1, AT["s3:lima"] + 0.3));
    show(lab20, ramp(t, AT["s3:seribu"] - 0.1, AT["s3:seribu"] + 0.3)); show(dim20, ramp(t, AT["s3:stud#2"] - 0.2, AT["s3:stud#2"] + 0.2));

    // ---- C ----
    const cIn = ramp(t, K.s4 - 0.3, K.s4 + 1.2);
    rings.scale.set(Math.max(0.001, cIn), 1, Math.max(0.001, cIn));
    show(rl1, ramp(t, AT["s4:dua"], AT["s4:dua"] + 0.4)); show(rl2, ramp(t, AT["s4:Dua"], AT["s4:Dua"] + 0.4));
    band1.material.opacity = 0.05 + 0.12 * between(t, AT["s4:Di"], AT["s4:Dua"]);
    band2.material.opacity = 0.03 + 0.1 * between(t, AT["s4:Dua"], AT["s4:Lebih"]);
    band3.material.opacity = 0.03 + 0.1 * between(t, AT["s4:Lebih"], K.s4e + 0.6);
    [["s4:tertinggi", "s4:detailnya"], ["s4:sedang", "s4:sampai"], ["s4:terendah", "s4:Lebih"]].forEach(([w, w0], i) => { show(LOD[i].lb, ramp(t, AT[w0], AT[w0] + 0.4)); LOD[i].G.rotation.y = 0.3 + t * 0.12; });

    // ---- D: hulls ----
    const s5t = t >= K.s5 - 0.5 && t < K.s6 - 0.2;
    const hullOn = s5t ? ramp(t, AT["s5:bentuk#2"] - 0.15, AT["s5:bentuk#2"] + 0.35) : 0;
    const keys6 = [["box", "s6:Box"], ["hull", "s6:Hull"], ["def", "s6:Default"], ["pcd", "s6:PreciseConvexDecomposition"], ["tun", "s6:Tunable"]];
    let cur6 = null; if (t >= K.s6 - 0.2 && t < K.s7 - 0.2) keys6.forEach(([k, a]) => { if (t >= AT[a] - 0.1) cur6 = k; });
    const s7a = t >= K.s7 - 0.2 && t < K.s8 - 0.2;
    const s8t = t >= K.s8 - 0.2;
    show(H.box, cur6 === "box" ? 1 : 0);
    show(H.hull, Math.max(hullOn, cur6 === "hull" ? 1 : 0));
    show(H.def, cur6 === "def" ? 1 : s8t ? 0.55 * ramp(t, AT["s8:pas"] - 0.3, AT["s8:pas"] + 0.3) : 0);
    show(H.pcd, cur6 === "pcd" ? 1 : s7a ? ramp(t, K.s7, K.s7 + 0.6) * (1 - ramp(t, AT["s7:Makanya"], AT["s7:Makanya"] + 0.5)) : 0);
    show(H.tun, cur6 === "tun" ? 1 : 0);
    if (cur6 === "tun") { const sv = 0.5 + 0.5 * Math.sin((t - AT["s6:Tunable"]) * 2.4 - 1.57); H.tun.children.forEach((b, i) => { if (!i) return; const k = 1.08 + 0.32 * (1 - sv); const s = b.userData.s; b.scale.set(s[0] * k, s[1] * k, s[2] * k); }); }
    show(tblock, ramp(t, K.s8 - 0.2, K.s8 + 0.6));
    // visible shape glows when the script points at it
    const lookHi = s5t ? between(t, AT["s5:Bentuk"], AT["s5:bentuk#2"], 0.2) : 0;
    blobs.forEach((b) => { b.l.material.opacity = 0.85 + 0.15 * lookHi; b.l.material.color.set(lookHi > 0.5 ? C.wh : C.cy); });
    show(lookLab, s5t ? ramp(t, AT["s5:lihat"] - 0.2, AT["s5:lihat"] + 0.2) : 0);
    show(physLab, s5t ? hullOn : 0);
    show(notLab, s7a ? between(t, AT["s7:tidak"], AT["s7:Makanya"] + 0.4) : 0);
    // rock2 collision reveal at the bump
    const tb = AT["s7:menabrak"];
    const bumpV = t >= tb - 0.05 && t < K.s8 + 0.5 ? ramp(t, tb - 0.05, tb + 0.15) : 0;
    show(col2, bumpV * (t < K.s8 ? 1 : 1 - ramp(t, K.s8, K.s8 + 0.5)));
    col2.traverse((m) => { if (m.isLineSegments) m.material.opacity = 0.95 * bumpV * (0.75 + 0.25 * Math.sin(t * 16)); });
    show(airLab, t >= K.s7 && t < K.s8 ? ramp(t, AT["s7:udara"] - 0.1, AT["s7:udara"] + 0.25) : 0);
    show(stamp, ramp(t, AT["s8:pas"] - 0.05, AT["s8:pas"] + 0.12));
    stamp.scale.setScalar(1 + 0.8 * (1 - ramp(t, AT["s8:pas"] - 0.05, AT["s8:pas"] + 0.15)));

    // ---- avatar staging ----
    restPose(A); A.head.rotation.set(0, 0, 0); A.G.rotation.set(0, 0, 0); A.G.scale.setScalar(1);
    impact.material.opacity = 0; qm.visible = false;
    const pop = (tt, x, y, z, ry) => { const u = t - tt; if (u < 0 || u > 0.7) return; impact.position.set(x, y, z); impact.rotation.set(0, ry, 0); impact.scale.setScalar(0.4 + u * 3); impact.material.opacity = 0.9 * (1 - u / 0.7); };
    if (t < K.s2 - 0.3) {
      A.G.position.set(XA - 3.5, 0, 7); A.G.rotation.y = 0.6; A.head.rotation.set(-0.2, 0.2, 0);
      const td = AT["s1:ditolak"];
      if (t > td) { const k = ramp(t, td, td + 0.2); A.armL.rotation.set(0, 0, -2.5 * k); A.armR.rotation.set(0, 0, 2.5 * k); A.head.rotation.set(-0.35, 0.3, 0); }
    } else if (t < K.s3 - 0.4) {
      A.G.position.set(XA - 3.5, 0, 7); A.G.rotation.y = 0.8; A.head.rotation.set(-0.25, 0, 0);
      let last = -9; sB.forEach(([a]) => { if (t >= AT[a]) last = AT[a]; });
      const u = t - last; A.armR.rotation.x = -2.3 + 1.2 * eout(clamp01(u / 0.16)) - 0.0; if (u > 0.6) A.armR.rotation.x = -1.1;
      A.armL.rotation.x = -0.5;
      if (t > AT["s2:maksimal"]) { A.armR.rotation.set(-0.4, 0, 0); A.armL.rotation.set(-1.5, 0, 0); A.head.rotation.set(-0.1, 0.4, 0); }
    } else if (t < K.s4 - 0.4) {
      const w0 = AT["s3:Tapi"] - 0.1, w1 = w0 + 2.4;
      if (t < w0) { A.G.position.set(XB + 0.5, 0, -8); A.G.rotation.y = -0.5; A.head.rotation.set(-0.4, 0, 0); A.armR.rotation.set(-2.4, 0, 0.2); if (t > AT["s3:empat"]) A.armR.rotation.set(-2.6 + Math.sin(t * 5) * 0.08, 0, 0.2); }
      else {
        const u = clamp01((t - w0) / (w1 - w0));
        const x = XB + 0.5 + (XB - 10 - XB - 0.5) * u, z = -8 + 17 * u;
        A.G.position.set(x, 0, z);
        if (u < 1) { A.G.rotation.y = Math.atan2(-10.5, 17); runPose(A, t * 9, 0.9); }
        else { A.G.rotation.y = 1.25; if (t > AT["s3:objek#2"]) A.armR.rotation.set(-1.55, 0, 0); if (t > AT["s3:objek#3"]) { A.G.rotation.y = 1.45; A.armR.rotation.set(-2.0, 0, 0); A.head.rotation.set(-0.3, 0, 0); } }
      }
    } else if (t < K.s5 - 0.4) {
      const w0 = AT["s4:Di"] - 0.2, w1 = K.s4e - 0.3;
      const u = clamp01((t - w0) / (w1 - w0));
      A.G.position.set(CC.x + 3.4, 0, CC.z - 1 - 19 * u); A.G.rotation.y = Math.PI;
      if (u > 0 && u < 1) runPose(A, t * 7, 0.6); else if (u >= 1) { A.G.rotation.y = 0; A.armR.rotation.set(0, 0, 2.6 + Math.sin(t * 8) * 0.3); }
    } else if (t < K.s6 - 0.3) {
      const w0 = K.s5 + 0.1, tb5 = AT["s5:tabrakan"], x0 = XD - 15, xs = XD - 4.2;
      const u = clamp01((t - w0) / (tb5 - w0));
      A.G.rotation.y = Math.PI / 2;
      if (t < tb5) { A.G.position.set(x0 + (xs - x0) * u, 0, 0.8); runPose(A, t * 9, 0.85); }
      else { const k = ramp(t, tb5, tb5 + 0.25); A.G.position.set(xs - 0.5 * k, 0, 0.8); A.armL.rotation.set(-0.5, 0, -0.7 * k); A.armR.rotation.set(-0.5, 0, 0.7 * k); A.head.rotation.set(0, 0, 0.18 * k); A.G.rotation.z = 0; pop(tb5, xs + 0.6, 4.3, 0.8, Math.PI / 2); qm.visible = t < AT["s5:bentuk#2"]; qm.position.set(xs - 0.5, 6.9 + Math.sin(t * 4) * 0.1, 0.8); }
    } else if (t < K.s7 + 5.9) {
      A.G.position.set(XD - 5.6, 0, 5); A.G.rotation.y = 1.0; A.head.rotation.set(-0.25, 0, 0);
      let last = -9; keys6.forEach(([, a]) => { if (t >= AT[a]) last = AT[a]; });
      if (t < K.s7 - 0.2) { const u = t - last; A.armR.rotation.set(-2.0 - 0.4 * Math.exp(-u * 6) * Math.cos(u * 18), 0, 0); }
      else { A.armL.rotation.set(-0.3, 0, -0.3); A.armR.rotation.set(-0.3, 0, 0.3); A.head.rotation.set(-0.15, 0, Math.sin(t * 1.4) * 0.08); }
    } else if (t < K.s8 - 0.3) {
      const w0 = AT["s7:Makanya"] + 0.1, x0 = XD - 3.2, xs = XD + 3.45;
      const u = clamp01((t - w0) / (tb - w0));
      A.G.rotation.y = Math.PI / 2;
      if (t < w0) { A.G.position.set(x0, 0, 7); A.G.rotation.y = 0.9; }
      else if (t < tb) { A.G.position.set(x0 + (xs - x0) * u, 0, 7); runPose(A, t * 10, 0.9); }
      else { const k = ramp(t, tb, tb + 0.25); A.G.position.set(xs - 0.8 * k, 0, 7); A.G.rotation.z = 0.08 * Math.sin((t - tb) * 20) * Math.exp(-(t - tb) * 4); A.armL.rotation.set(-1.2, 0, 0); A.armR.rotation.set(-1.2, 0, 0); A.head.rotation.set(0.1, 0.4 * k, 0); pop(tb, xs + 0.6, 3.6, 7, Math.PI / 2); qm.visible = true; qm.position.set(xs - 0.8, 6.8 + Math.sin(t * 4) * 0.1, 7); }
    } else {
      A.G.position.set(XD - 3.4, 0, 8.5); A.G.rotation.y = 0.2; A.head.rotation.set(-0.1, 0, 0);
      A.armR.rotation.set(0, 0, 2.6 + Math.sin(t * 8) * 0.32);
    }
    comp.render();
  };
}
