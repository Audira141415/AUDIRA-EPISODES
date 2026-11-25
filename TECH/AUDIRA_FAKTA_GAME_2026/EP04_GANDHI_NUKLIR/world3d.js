// PAPAN STRATEGI KERTAS: one papercraft hex strategy board on a desk; the camera glides over it like a board-game documentary.
// Leaders are plain paper pawns with name plates only. Illustration, no game assets. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, std, box as box0, cyl as cyl0, stage, avatar, runPose, restPose } from "./lib3d.js";

const DF = "Fraunces", MF = "'IBM Plex Mono'";
const CRM = "#F4EEDC", TER = "#C65D3B", TEA = "#2A7F7A", SAF = "#F2A541", INK = "#2B2B2B", RED = "#D33A2C";
const R = 1.6, SQ = Math.sqrt(3), BT = 0.73; // BT = hex top surface

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: 0xcdb48c, exp: 1.02, bloom: [0.06, 0.35, 0.95] });
  scene.add(new THREE.HemisphereLight(0xfff7e6, 0x9c7e5a, 1.45));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 150 }); sun.shadow.bias = -0.0005; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const rnd = mulberry(4404);
  // lib3d box/cyl only attach when given a parent: default the parent to the scene
  const box = (w, h, d, m, x = 0, y = 0, z = 0, par = scene) => box0(w, h, d, m, x, y, z, par);
  const cyl = (a, b, h, sg, m, x = 0, y = 0, z = 0, par = scene) => cyl0(a, b, h, sg, m, x, y, z, par);
  const paper = (c, rough = 0.92) => std(c, rough, 0, { flatShading: true });

  // ---- canvas textures that repaint once the web fonts land ----
  const TX = [];
  const tex = (w, h, draw) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; TX.push([t, draw, w, h]); return t;
  };
  const dyn = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext("2d"), t, key: "" }; };
  const fibre = (g, w, h, base, n = 900, a = 0.05) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r2 = mulberry(w * 7 + h); for (let i = 0; i < n; i++) { g.fillStyle = `rgba(80,60,30,${a * r2()})`; g.fillRect(r2() * w, r2() * h, 1 + r2() * 3, 1); } };
  const center = (g, s, x, y, font, col) => { g.font = font; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y); };
  // a flat paper card: textured front (+z), plain paper elsewhere
  const card = (w, h, t, d = 0.07, side = 0xe8dfc8) => { const mats = [0, 1, 2, 3, 4, 5].map((i) => (i === 4 ? new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }) : paper(side))); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.castShadow = m.receiveShadow = true; return m; };
  const plateTex = (txt, bg, fg, w = 640, h = 150, font = `700 66px ${DF}`) => tex(w, h, (g) => { fibre(g, w, h, bg, 300, 0.08); g.strokeStyle = fg; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20); center(g, txt, w / 2, h / 2 + 4, font, fg); });

  // ---- desk ----
  const deskT = tex(1024, 1024, (g, w, h) => { fibre(g, w, h, "#cdb48c", 5000, 0.07); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(120,90,50,${0.04 + rnd() * 0.05})`; g.lineWidth = 1 + rnd() * 3; const y = rnd() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 20 * rnd(), w * 0.6, y - 20 * rnd(), w, y + 10 * rnd()); g.stroke(); } });
  deskT.wrapS = deskT.wrapT = THREE.RepeatWrapping; deskT.repeat.set(6, 6);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: deskT, roughness: 0.85 })); desk.rotation.x = -Math.PI / 2; desk.position.z = -20; desk.receiveShadow = true; scene.add(desk);
  // board base: dark card stock showing in the hex gaps
  box(37, 0.3, 74, paper(0x3a3129), 0, 0.15, -20);
  box(37.6, 0.12, 74.6, paper(0xe9dfc6), 0, 0.06, -20);

  // ---- hex board ----
  const hexes = [];
  for (let j = -22; j <= 6; j++) for (let i = -6; i <= 6; i++) {
    const x = (i + (j & 1) * 0.5) * SQ * R - SQ * R * 0.25, z = j * 1.5 * R + 2;
    if (Math.abs(x) > 17.2) continue;
    hexes.push({ x, z, h: 0.32 + rnd() * 0.1, r: rnd() });
  }
  const tint = (x, z, r) => {
    if (Math.hypot(x + 8, z - 9) < 4.2) return 0xf3d9a6; // Gandhi's city
    if (Math.hypot(x + 6, z + 12) < 7) return r < 0.5 ? 0xe9b9a3 : 0xf0cdb9;
    if (Math.hypot(x - 5, z + 24) < 7.5) return r < 0.5 ? 0xa9d0c9 : 0xc5ddd6;
    if (r < 0.12) return 0xb9d6cf; if (r < 0.22) return 0xf3d9a6; if (r < 0.3) return 0xeec2ac;
    return r < 0.65 ? 0xf4eedc : 0xece2c9;
  };
  const hexT = tex(256, 256, (g, w, h) => fibre(g, w, h, "#ffffff", 1400, 0.09));
  const hexG = new THREE.CylinderGeometry(R * 0.93, R * 0.93, 1, 6);
  const IH = new THREE.InstancedMesh(hexG, new THREE.MeshStandardMaterial({ map: hexT, roughness: 0.95, flatShading: true }), hexes.length);
  IH.castShadow = IH.receiveShadow = true; IH.frustumCulled = false; scene.add(IH);
  const dm = new THREE.Object3D(), cc = new THREE.Color();
  hexes.forEach((hx, k) => { dm.position.set(hx.x, 0.3 + hx.h / 2, hx.z); dm.scale.set(1, hx.h, 1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); IH.setMatrixAt(k, dm.matrix); IH.setColorAt(k, cc.set(tint(hx.x, hx.z, hx.r))); });
  // a few paper trees and hills for board texture
  const treeG = new THREE.ConeGeometry(0.55, 1.5, 6), hillG = new THREE.ConeGeometry(1.1, 0.9, 5);
  const clear = [[-8, 9, 4.5], [0, 6, 7], [-6, -12, 3], [5, -24, 6.5], [-3, -33, 7.5], [6, -48, 7]];
  const deco = hexes.filter((hx) => hx.r > 0.82 && Math.abs(hx.x) < 16 && clear.every(([x, z, r]) => Math.hypot(hx.x - x, hx.z - z) > r));
  deco.forEach((hx, k) => { const m = new THREE.Mesh(k % 3 ? treeG : hillG, paper(k % 3 ? 0x2a7f7a : 0xd8c39a)); m.position.set(hx.x + 0.3, BT + (k % 3 ? 0.75 : 0.45), hx.z - 0.2); m.rotation.y = k; m.castShadow = true; scene.add(m); });

  // ---- pawns ----
  const pawnG = new THREE.LatheGeometry([[0, 0], [1, 0], [1, 0.3], [0.78, 0.42], [0.58, 0.85], [0.42, 2.15], [0.72, 2.45], [0.38, 2.72], [0, 2.75]].map(([a, b]) => new THREE.Vector2(a, b)), 12);
  const headG = new THREE.IcosahedronGeometry(0.72, 1);
  const pawn = (col, name, plateBg = CRM) => {
    const G = new THREE.Group(); const m = paper(col, 0.85);
    const b = new THREE.Mesh(pawnG, m); b.castShadow = b.receiveShadow = true; G.add(b);
    const hd = new THREE.Mesh(headG, m); hd.position.y = 3.35; hd.castShadow = true; G.add(hd);
    let pl = null;
    if (name) { pl = card(2.9, 0.68, plateTex(name, plateBg, INK, 640, 150, `700 ${name.length > 9 ? 60 : 70}px ${DF}`), 0.08); pl.position.set(0, 0.42, 1.45); pl.rotation.x = -0.32; G.add(pl); }
    scene.add(G); return { G, m, pl };
  };
  const bar = (col) => { const m = box(0.62, 1, 0.62, paper(col, 0.7)); return m; };
  const setBar = (m, x, z, h) => { m.scale.y = Math.max(0.02, h); m.position.set(x, BT + Math.max(0.02, h) / 2, z); };

  // ---- rocket ----
  const rocket = (s = 1, joke = false) => {
    const G = new THREE.Group();
    cyl(0.45, 0.45, 2.2, 8, paper(0xf4eedc), 0, 1.1, 0, G);
    cyl(0.47, 0.47, 0.35, 8, paper(0xd33a2c), 0, 1.6, 0, G);
    const n = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 8), paper(0xc65d3b)); n.position.y = 2.75; n.castShadow = true; G.add(n);
    for (let k = 0; k < 3; k++) { const f = box(0.08, 0.8, 0.7, paper(0xc65d3b), Math.sin(k * 2.09) * 0.55, 0.35, Math.cos(k * 2.09) * 0.55, G); f.rotation.y = k * 2.09; }
    const w = cyl(0.2, 0.2, 0.06, 10, paper(0x2a7f7a), 0, 1.15, 0.45, G); w.rotation.x = Math.PI / 2;
    G.scale.setScalar(s); scene.add(G); return G;
  };
  const puffG = new THREE.IcosahedronGeometry(0.5, 0), puffM = paper(0xfbf7ec);

  // ===== STATION A: Gandhi's city, pawn row, the 8-bit register =====
  const CITY = [-8, 9];
  [[-9.6, 8.4, 1.4], [-7.0, 10.6, 1.1], [-9.2, 11.0, 1.2], [-6.4, 7.6, 1.0], [-10.4, 10.0, 0.9]].forEach(([x, z, s], k) => {
    const hb = box(1.3 * s, 1.0 * s, 1.1 * s, paper(k % 2 ? 0xfbf7ec : 0xf1e4c8), x, BT + 0.5 * s, z);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.75 * s, 0.75 * s, 1.25 * s, 3), paper(k % 2 ? 0xc65d3b : 0x2a7f7a)); roof.rotation.z = Math.PI / 2; roof.rotation.y = 0; roof.position.set(x, BT + 1.0 * s + 0.36 * s, z); roof.castShadow = true; scene.add(roof); hb.rotation.y = 0;
  });
  cyl(1.1, 1.25, 0.25, 8, paper(0x8b8172), CITY[0], BT + 0.12, CITY[1]);
  const R1 = rocket(1); R1.position.set(CITY[0], BT + 0.25, CITY[1]);
  const puffs = Array.from({ length: 10 }, (_, k) => { const m = new THREE.Mesh(puffG, puffM); m.castShadow = true; scene.add(m); return { m, k, ox: (rnd() - 0.5) * 0.9, oz: (rnd() - 0.5) * 0.9, s: 0.6 + rnd() * 0.6 }; });

  const ROWZ = 4, PX = [-5.1, -1.7, 1.7, 5.1];
  const leaders = [
    pawn(0xc65d3b, "AI MERAH"), pawn(0xfbfaf5, "GANDHI (AI)", "#ffffff"), pawn(0x2a7f7a, "AI HIJAU"), pawn(0xf2a541, "AI KUNING"),
  ];
  leaders.forEach((p, i) => p.G.position.set(PX[i], BT, ROWZ));
  const bars = [0xc65d3b, 0xd9d2c2, 0x2a7f7a, 0xf2a541].map(bar);
  const baseH = [2.6, 0.5, 3.1, 2.2];
  const gBarM = bars[1].material;
  // number tag above Gandhi's bar
  const gTag = dyn(256, 160);
  const gTagM = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.06), new THREE.MeshBasicMaterial({ map: gTag.t, transparent: true, toneMapped: false, depthWrite: false })); scene.add(gTagM);
  const paintTag = (s, col) => { const k = s + col; if (gTag.key === k) return; gTag.key = k; const g = gTag.g; g.clearRect(0, 0, 256, 160); g.fillStyle = col; g.beginPath(); g.roundRect(8, 8, 240, 144, 26); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); center(g, s, 128, 86, `700 ${s.length > 2 ? 84 : 100}px ${MF}`, INK); gTag.t.needsUpdate = true; };

  // DEMOKRASI -2 card slides in front of Gandhi
  const demT = tex(512, 300, (g, w, h) => { fibre(g, w, h, "#2A7F7A", 300, 0.12); g.strokeStyle = CRM; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); center(g, "DEMOKRASI", w / 2, 108, `700 76px ${DF}`, CRM); center(g, "AGRESI −2", w / 2, 208, `700 70px ${MF}`, SAF); });
  const dem = card(2.9, 1.7, demT, 0.06, 0x24706b); scene.add(dem);

  // 8-lamp register (blueprint card), leans back, folds flat later
  const regPiv = new THREE.Group(); regPiv.position.set(0, BT + 0.02, 10.2); scene.add(regPiv);
  const regTx = dyn(1024, 460);
  const regCard = card(9.2, 4.13, regTx.t, 0.08, 0x1f5f5b); regCard.position.y = 2.07; regPiv.add(regCard);
  const paintReg = (val, note) => {
    const k = val + note; if (regTx.key === k) return; regTx.key = k; const g = regTx.g, w = 1024, h = 460;
    g.fillStyle = "#1f5f5b"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(244,238,220,.16)"; g.lineWidth = 2; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = CRM; g.lineWidth = 4; g.strokeRect(16, 16, w - 32, h - 32);
    g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = `600 36px ${MF}`; g.fillStyle = CRM; g.fillText("REGISTER 8 BIT · TANPA TANDA", 44, 72);
    g.font = `700 92px ${MF}`; g.fillStyle = SAF; g.textAlign = "right"; g.fillText(val, w - 44, 402); g.textAlign = "left"; g.font = `500 32px ${MF}`; g.fillStyle = CRM; g.fillText(note, 44, 392);
    regTx.t.needsUpdate = true;
  };
  const bitT = [0, 1].map((b) => tex(128, 128, (g, w, h) => { g.fillStyle = b ? SAF : "#e9e2cf"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); center(g, String(b), 64, 70, `700 88px ${MF}`, INK); }));
  const bitM = bitT.map((t, b) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, emissive: b ? 0x6b3a00 : 0x000000, emissiveIntensity: b ? 0.7 : 0 }));
  const lampSide = paper(0x2b2b2b);
  const lamps = Array.from({ length: 8 }, (_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.3), [lampSide, lampSide, lampSide, lampSide, bitM[0], lampSide]); m.position.set(-3.85 + i * 1.1, 2.55, 0.18); m.castShadow = true; regPiv.add(m); return m; });

  // story rockets (the legend's version)
  const R3 = [[-3.6, -0.8], [0.2, -1.6], [-6.8, -1.2], [3.4, -0.6], [-1.7, -2.6]].map(([x, z], k) => ({ G: rocket(0.62), x, z, d: k * 0.22 }));

  // ===== STATION B: the rumour page copies itself =====
  const BP = [-6, -12];
  const pageT = tex(512, 680, (g, w, h) => { fibre(g, w, h, "#fbf8ee", 600, 0.06); g.fillStyle = INK; g.fillRect(0, 0, w, 74); center(g, "TV TROPES · 2012", w / 2, 40, `700 40px ${MF}`, CRM); g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = INK; g.font = `700 52px ${DF}`; g.fillText("Gandhi", 36, 150); g.fillText("Nuklir", 36, 206); g.fillStyle = RED; g.fillRect(36, 226, 150, 7); const r2 = mulberry(77); for (let i = 0; i < 12; i++) { g.fillStyle = "rgba(43,43,43,.55)"; g.fillRect(36, 270 + i * 30, 300 + r2() * 140, 12); } g.fillStyle = "rgba(198,93,59,.85)"; g.fillRect(36, 640, 200, 12); });
  const pageMat = new THREE.MeshStandardMaterial({ map: pageT, roughness: 0.9, side: THREE.DoubleSide });
  const master = card(3.2, 4.25, pageT, 0.05); master.position.set(BP[0], BT + 2.3, BP[1]); master.rotation.x = -0.12; scene.add(master);
  const easel = box(0.18, 2.8, 0.18, paper(0x8b6b4a), BP[0], BT + 1.4, BP[1] - 0.9); easel.rotation.x = 0.45;
  const NL = 56;
  const IL = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.5, 2.0), pageMat, NL); IL.castShadow = true; IL.frustumCulled = false; scene.add(IL);
  const leaf = Array.from({ length: NL }, (_, k) => { const wv = Math.floor(Math.log2(k + 2)) - 1; const a = k * 2.399, rr = 2.6 + Math.sqrt(k) * 1.75; return { wv, x: BP[0] + Math.cos(a) * rr, z: BP[1] + Math.sin(a) * rr * 1.1, ry: rnd() * 6.28, d: rnd() * 0.3 }; });

  // ===== STATION C: designer plate, 3x3 pawns, three levels =====
  const CP = [5, -24];
  const repT = plateTex("BRIAN REYNOLDS · CIV II", INK, CRM, 1024, 170, `700 72px ${DF}`);
  const rep = card(6.4, 1.06, repT, 0.08, 0x2b2b2b); rep.position.set(CP[0], BT + 0.7, CP[1] + 5.4); rep.rotation.x = -0.3; scene.add(rep);
  const gridCols = [0xfbfaf5, 0xc65d3b, 0x2a7f7a, 0xf2a541, 0x6a5d52, 0xc65d3b, 0x2a7f7a, 0xf2a541, 0x6a5d52];
  const lvlA = [0.6, 2.4, 1.6, 3.1, 0.9, 2.0, 3.5, 1.3, 2.8]; // many levels before
  const lvlB = [1, 2, 3, 2, 1, 3, 2, 3, 1].map((v) => v * 1.05); // three levels after
  const grid = gridCols.map((c, i) => { const p = pawn(c, i === 0 ? "GANDHI (AI)" : null, "#ffffff"); const x = CP[0] - 3.3 + (i % 3) * 3.3, z = CP[1] + 2.6 - Math.floor(i / 3) * 3.1; p.G.position.set(x, BT, z); p.G.scale.setScalar(0.72); const b = bar(c === 0xfbfaf5 ? 0xd9d2c2 : c); return { p, x, z, b, same: lvlB[i] < 1.5 }; });

  // ===== STATION D: the memoir, signed int, government cards =====
  const DP = [-5, -36];
  const bookG = new THREE.Group(); bookG.position.set(DP[0], BT, DP[1]); scene.add(bookG);
  const BW = 4.4, BD = 6.0;
  box(BW, 0.55, BD, paper(0xf7f1e0), BW / 2, 0.3, 0, bookG); // page block (right half)
  box(BW + 0.1, 0.08, BD + 0.2, paper(0x8a2f22), BW / 2, 0.04, 0, bookG); // back cover
  const pagesT = tex(512, 700, (g, w, h) => { fibre(g, w, h, "#f7f1e0", 500, 0.06); g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = INK; g.font = `600 42px ${MF}`; g.fillText("int x = 1 - 2;", 34, 120); g.fillStyle = TEA; g.fillText("// signed", 34, 180); g.fillStyle = INK; g.font = `700 86px ${MF}`; g.fillText("x = −1", 34, 330); g.font = `500 34px ${MF}`; g.fillStyle = TER; g.fillText("tetap −1", 34, 400); const r2 = mulberry(9); for (let i = 0; i < 7; i++) { g.fillStyle = "rgba(43,43,43,.35)"; g.fillRect(34, 470 + i * 30, 280 + r2() * 130, 10); } });
  const pagesM = new THREE.Mesh(new THREE.PlaneGeometry(BW * 0.92, BD * 0.94), new THREE.MeshStandardMaterial({ map: pagesT, roughness: 0.9 })); pagesM.rotation.x = -Math.PI / 2; pagesM.position.set(BW / 2, 0.585, 0); pagesM.receiveShadow = true; bookG.add(pagesM);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.6, 0); bookG.add(hinge);
  const coverT = tex(512, 700, (g, w, h) => { fibre(g, w, h, "#8a2f22", 700, 0.12); g.strokeStyle = SAF; g.lineWidth = 6; g.strokeRect(26, 26, w - 52, h - 52); center(g, "SID MEIER", w / 2, 230, `700 78px ${DF}`, CRM); g.fillStyle = SAF; g.fillRect(w / 2 - 90, 290, 180, 6); center(g, "MEMOIR", w / 2, 380, `600 54px ${DF}`, CRM); center(g, "2020", w / 2, 470, `700 64px ${MF}`, SAF); });
  const cover = new THREE.Mesh(new THREE.BoxGeometry(BW + 0.1, 0.08, BD + 0.2), [0, 1, 2, 3, 4, 5].map((i) => (i === 2 ? new THREE.MeshStandardMaterial({ map: coverT, roughness: 0.8 }) : paper(0x8a2f22)))); cover.position.set(BW / 2, 0.04, 0); cover.castShadow = true; hinge.add(cover);
  const innerT = tex(512, 700, (g, w, h) => { fibre(g, w, h, "#f7f1e0", 500, 0.06); g.save(); g.translate(w, h); g.rotate(Math.PI); g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = INK; g.font = `700 50px ${DF}`; g.fillText("Bahasa C:", 34, 120); g.font = `600 40px ${MF}`; g.fillStyle = TEA; g.fillText("int = signed", 34, 200); g.fillStyle = INK; g.font = `500 32px ${MF}`; g.fillText("bawaan: punya tanda", 34, 260); const r2 = mulberry(19); for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(43,43,43,.35)"; g.fillRect(34, 330 + i * 30, 280 + r2() * 130, 10); } g.restore(); });
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(BW * 0.92, BD * 0.94), new THREE.MeshStandardMaterial({ map: innerT, roughness: 0.9 })); inner.rotation.x = Math.PI / 2; inner.position.set(BW / 2, -0.005, 0); hinge.add(inner);
  // government cards, arrow to the aggression bar, crossed out
  const govs = ["DEMOKRASI", "MONARKI", "REPUBLIK"].map((s, i) => { const t = tex(300, 400, (g, w, h) => { fibre(g, w, h, i === 0 ? "#2A7F7A" : i === 1 ? "#C65D3B" : "#F2A541", 260, 0.12); g.strokeStyle = CRM; g.lineWidth = 6; g.strokeRect(12, 12, w - 24, h - 24); g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); center(g, s, 0, 0, `700 ${s.length > 8 ? 50 : 58}px ${DF}`, i === 2 ? INK : CRM); g.restore(); }); const m = card(1.35, 1.8, t, 0.05); m.position.set(DP[0] - 3.9 + i * 1.5, BT + 0.95, DP[1] + 5.6); m.rotation.x = -0.25; scene.add(m); return m; });
  const arrowShape = new THREE.Shape(); arrowShape.moveTo(0, -0.22); arrowShape.lineTo(2.2, -0.22); arrowShape.lineTo(2.2, -0.55); arrowShape.lineTo(3.0, 0); arrowShape.lineTo(2.2, 0.55); arrowShape.lineTo(2.2, 0.22); arrowShape.lineTo(0, 0.22);
  const arrow = new THREE.Mesh(new THREE.ExtrudeGeometry(arrowShape, { depth: 0.08, bevelEnabled: false }), paper(0x2b2b2b)); arrow.position.set(DP[0] + 0.2, BT + 1.1, DP[1] + 5.6); arrow.castShadow = true; scene.add(arrow);
  const aggBar = bar(0xfbfaf5); setBar(aggBar, DP[0] + 4.1, DP[1] + 5.6, 1.2);
  const aggT = plateTex("AGRESI", CRM, INK, 400, 120, `700 64px ${DF}`); const aggP = card(1.7, 0.5, aggT, 0.05); aggP.position.set(DP[0] + 4.1, BT + 0.3, DP[1] + 6.4); aggP.rotation.x = -0.35; scene.add(aggP);
  const xG = new THREE.Group(); xG.position.set(DP[0] + 1.7, BT + 1.1, DP[1] + 5.75); scene.add(xG);
  [0.8, -0.8].forEach((r) => { const b = box(2.4, 0.32, 0.12, paper(0xd33a2c, 0.6), 0, 0, 0, xG); b.rotation.z = r; });

  // ===== STATION E: the newer board, CIV V 2010 =====
  const EP = [6, -48];
  const slab = new THREE.Group(); slab.position.set(EP[0], 0, EP[1]); scene.add(slab);
  box(9.6, 1.1, 8.6, paper(0x24706b), 0, 0.55 + 0.3, 0, slab);
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const x = (i + (j & 1) * 0.5) * SQ * 0.95, z = j * 1.5 * 0.95; if (Math.abs(x) > 4.2 || Math.abs(z) > 3.8) continue; const m = cyl(0.88, 0.88, 0.22, 6, paper((i + j) & 1 ? 0x9fcfc6 : 0xc9e4dc), x, 1.52, z, slab); }
  const ST = 1.63;
  const civT = plateTex("CIV V · 2010", SAF, INK, 640, 150, `700 74px ${DF}`);
  const civP = card(3.6, 0.85, civT, 0.08); civP.position.set(EP[0] - 2.4, 1.0, EP[1] + 4.55); civP.rotation.x = -0.12; scene.add(civP);
  const g5 = pawn(0xfbfaf5, "GANDHI (AI)", "#ffffff"); g5.G.position.set(EP[0] - 0.6, ST, EP[1] + 0.4); g5.G.scale.setScalar(0.8);
  const nukeT = tex(640, 420, (g, w, h) => { fibre(g, w, h, "#fbf8ee", 400, 0.06); g.fillStyle = INK; g.fillRect(0, 0, w, 78); center(g, "PARAMETER AI · GANDHI", w / 2, 42, `600 34px ${MF}`, CRM); g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = `700 96px ${MF}`; g.fillStyle = INK; g.fillText("NUKE =", 40, 230); g.fillStyle = RED; g.fillText("12", 430, 230); g.font = `500 32px ${MF}`; g.fillStyle = TEA; g.fillText("// nilai tertinggi", 40, 320); });
  const nuke = card(3.6, 2.36, nukeT, 0.06); nuke.rotation.x = -0.1; scene.add(nuke);
  const jonT = plateTex("JON SHAFER: lelucon", CRM, INK, 900, 150, `700 66px ${DF}`);
  const jon = card(4.6, 0.77, jonT, 0.08); jon.position.set(EP[0] + 1.7, 1.0, EP[1] + 4.6); jon.userData.s = 0.8; jon.rotation.x = -0.12; scene.add(jon);
  // joke prop rocket: flat cut-out on a stick
  const propT = tex(300, 600, (g, w, h) => { g.clearRect(0, 0, w, h); g.lineJoin = "round"; g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = "#F4EEDC"; g.beginPath(); g.moveTo(150, 30); g.quadraticCurveTo(250, 160, 220, 430); g.lineTo(80, 430); g.quadraticCurveTo(50, 160, 150, 30); g.fill(); g.stroke(); g.fillStyle = TER; g.beginPath(); g.moveTo(80, 380); g.lineTo(20, 500); g.lineTo(95, 450); g.fill(); g.stroke(); g.beginPath(); g.moveTo(220, 380); g.lineTo(280, 500); g.lineTo(205, 450); g.fill(); g.stroke(); g.fillStyle = TEA; g.beginPath(); g.arc(150, 210, 38, 0, 7); g.fill(); g.stroke(); g.fillStyle = SAF; g.beginPath(); g.moveTo(100, 440); g.lineTo(150, 590); g.lineTo(200, 440); g.fill(); g.stroke(); g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(150, 310, 34, 0.3, 2.8); g.stroke(); });
  const propG = new THREE.Group(); slab.add(propG); propG.position.set(-3.2, ST, -0.2);
  const prop = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 3.4), new THREE.MeshStandardMaterial({ map: propT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 })); prop.position.y = 2.8; prop.castShadow = true; propG.add(prop);
  box(0.12, 1.4, 0.12, paper(0x8b6b4a), 0, 0.7, -0.05, propG);
  const bangT = tex(300, 160, (g, w, h) => { g.fillStyle = SAF; g.beginPath(); for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283, r = k % 2 ? 60 : 78; g.lineTo(w / 2 + Math.cos(a) * r * 1.8, h / 2 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); center(g, "DOR!", w / 2, h / 2 + 4, `700 64px ${DF}`, INK); });
  const bang = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.17), new THREE.MeshBasicMaterial({ map: bangT, transparent: true, depthWrite: false, toneMapped: false })); bang.position.set(-1.2, 4.4, 0.2); propG.add(bang);

  // ---- desk props for depth ----
  const pencil = new THREE.Group(); pencil.position.set(21, 0.5, 6); pencil.rotation.y = 0.5; scene.add(pencil);
  const pb = cyl(0.5, 0.5, 16, 6, paper(0xf2a541, 0.6), 0, 0, 0, pencil); pb.rotation.z = Math.PI / 2;
  const pt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6), paper(0xe9cfa0)); pt.rotation.z = -Math.PI / 2; pt.position.x = 8.8; pencil.add(pt);
  [[-21, 1.0, -6, 0x2a7f7a], [20.5, 0.9, -30, 0xc65d3b], [-21.5, 0.9, -40, 0xf4eedc]].forEach(([x, y, z, c], k) => { const d = box(1.9, 1.9, 1.9, paper(c, 0.6), x, y, z); d.rotation.y = k * 0.7; });
  box(4.5, 0.25, 6, paper(0xf7f2e4), -22, 0.13, 10).rotation.y = 0.2;

  // ---- scout ----
  const S = avatar({ skin: 0xf2d7b0, shirt: 0xf2a541, pants: 0x2a7f7a, make: (c) => paper(c, 0.85) }); S.G.scale.setScalar(0.46); scene.add(S.G);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.75, 6), paper(0xc65d3b)); hat.position.y = 1.55; hat.castShadow = true; S.head.add(hat);

  // ---- timing ----
  const tMit = AT["s1:mitos"], tDem = AT["s2:demokrasi"], tMin = AT["s2:minus"], tSat = AT["s2:Satu"];
  const tM2 = AT["s3:minus#2"], tMel = AT["s3:meluap"], tG3 = AT["s3:Gandhi"], tTem = AT["s3:menembakkan"];
  const tSpr = AT["s4:menyebar"], tTiga = AT["s5:tiga"], tSep = AT["s5:sepertiga"], tMem = AT["s6:memoarnya"], tTid = AT["s6:tidak"], tPem = AT["s6:pemerintahan"];
  const t2010 = AT["s7:2010"], tNuk = AT["s7:dua"], tLel = AT["s7:lelucon"], tWave = AT["s8:Kamu"];

  // scout stations: [arriveBy, x, z]
  const SK = [[0, -5.4, 11.2], [K.s2 + 0.3, -5.4, 11.2], [K.s2 + 2.0, -3.4, 7.4], [K.s3 + 0.2, -3.4, 7.4], [K.s3 + 1.6, -5.6, 11.6], [K.s4 + 0.1, -5.6, 11.6], [K.s4 + 2.4, -3.0, -9.6], [K.s5 + 0.1, -3.0, -9.6], [K.s5 + 2.4, 0.4, -19.8], [K.s6 + 0.1, 0.4, -19.8], [K.s6 + 2.4, -0.6, -31.6], [K.s7 + 0.1, -0.6, -31.6], [K.s7 + 2.4, 1.4, -42.2], [K.dur, 1.4, -42.2]];
  const scoutAt = (t) => { let i = 0; while (i < SK.length - 2 && SK[i + 1][0] <= t) i++; const a = SK[i], b = SK[i + 1]; const u = clamp01((t - a[0]) / (b[0] - a[0])); const e = u * u * (3 - 2 * u); return { x: a[1] + (b[1] - a[1]) * e, z: a[2] + (b[2] - a[2]) * e, mv: u > 0 && u < 1 && (b[1] !== a[1] || b[2] !== a[2]), dx: b[1] - a[1], dz: b[2] - a[2] }; };

  // camera: px py pz lx ly lz
  const cam0 = track([
    [0, -3.6, 7.2, 30, -7.8, 3.9, 9], [K.s1e - 0.3, -2.6, 8.6, 32, -7.2, 4.4, 8.5],
    [K.s2 + 1.4, 0.6, 9.5, 39, 0, 3.0, 4], [tDem, -0.4, 8.5, 35, -0.6, 2.8, 4.5], [K.s2e - 0.2, -1.4, 6.8, 27, -1.3, 2.6, 5],
    [K.s3 + 1.2, 0, 6.6, 34, 0, 2.6, 9.5], [tG3 - 0.4, 0.6, 6.2, 31, 0, 2.6, 9.5], [tG3 + 1.4, 0.5, 9.5, 44, 0, 6.2, 4], [K.s3e - 0.3, -1.5, 10.5, 46, -0.5, 6.6, 3],
    [K.s4 + 1.4, -4.8, 4.6, 0.8, -6, 2.9, BP[1]], [tSpr + 0.2, -5.2, 5.4, 2, -6, 2.6, BP[1]], [tSpr + 3.4, -6, 26, 6, -6, 0.5, BP[1] - 1.5], [K.s4e - 0.3, -4.5, 24, 3.5, -6, 0.5, BP[1] - 1],
    [K.s5 + 1.6, 5, 15, 0, CP[0], 2.0, CP[1] + 0.5], [K.s5e - 0.3, 6.6, 12.6, -3.2, CP[0], 2.0, CP[1]],
    [K.s6 + 1.6, -4.4, 22, -12, DP[0] + 0.4, 0.8, DP[1] + 0.3], [tPem - 0.5, -3.8, 20, -12.5, DP[0] + 0.6, 0.8, DP[1] + 2.6], [K.s6e - 0.3, -3.4, 19, -13, DP[0] + 0.8, 1.0, DP[1] + 3.6],
    [K.s7 + 1.6, 6, 10, -21.5, EP[0], 2.8, EP[1] + 1.2], [tLel, 5, 8.6, -25, EP[0] - 0.5, 3.0, EP[1] + 1.4], [K.s7e - 0.3, 4.4, 9, -24, EP[0] - 0.6, 3.0, EP[1] + 1.4],
    [K.s8 + 1.6, 3.5, 11, -19, EP[0] - 1.8, 2.6, EP[1] + 3], [K.dur, 2.5, 15, -14, EP[0] - 1.8, 2.4, EP[1] + 2.5],
  ]);

  let fontsOk = false;
  try { document.fonts.load(`700 40px ${DF}`); document.fonts.load(`700 40px ${MF}`); document.fonts.load(`600 40px ${MF}`); } catch (e) { fontsOk = true; }
  const refresh = () => {
    if (fontsOk) return;
    try { if (!(document.fonts.check(`700 40px ${DF}`) && document.fonts.check(`700 40px ${MF}`))) return; } catch (e) { }
    fontsOk = true;
    for (const [t, draw, w, h] of TX) { const g = t.image.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }
    gTag.key = ""; regTx.key = "";
  };

  return (t) => {
    refresh();
    const p = cam0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    sun.position.set(p[3] - 22, 44, p[5] + 20); sun.target.position.set(p[3], 0, p[5]);

    // s1 rocket rises, freezes at "mitos"
    const tr = Math.min(t, tMit), up = 2.4 * eout(clamp01((tr - 0.3) / (tMit - 0.3)) * 0.9) + 0.6 * clamp01((tr - 0.3) / (tMit - 0.3));
    const jit = t > tMit ? Math.sin((t - tMit) * 60) * 0.06 * Math.max(0, 1 - (t - tMit) / 0.35) : Math.sin(t * 41) * 0.025 * (t > 0.3 ? 1 : 0);
    R1.position.set(CITY[0] + jit, BT + 0.25 + up, CITY[1]); R1.rotation.z = jit * 0.5;
    puffs.forEach((q) => { const born = 0.3 + q.k * (tMit - 0.3) / 10; const tt = Math.min(t, tMit); const age = tt - born; const on = age > 0; q.m.visible = on; if (!on) return; const hy = 2.4 * eout(clamp01((born - 0.3) / (tMit - 0.3)) * 0.9) + 0.6 * clamp01((born - 0.3) / (tMit - 0.3)); const g = clamp01(age / 1.2); q.m.position.set(CITY[0] + q.ox * (1 + g), BT + 0.3 + hy * 0.95, CITY[1] + q.oz * (1 + g)); q.m.scale.setScalar(q.s * (0.3 + 0.45 * g)); });

    // pawn row bars
    const showBars = ramp(t, K.s2 + 1.2, K.s2 + 2.2) * (1 - ramp(t, K.s4 + 0.6, K.s4 + 1.2));
    const shoot = ramp(t, tG3, tG3 + 1.3);
    bars.forEach((b, i) => {
      let h = baseH[i] * showBars;
      if (i === 1) { h = 0.5 * showBars; if (t > tMin) h = 0.12 * showBars; if (t > tMel) h = (0.12 + 12.5 * eout(shoot)) * showBars; }
      b.visible = showBars > 0.01; setBar(b, PX[i] + 1.3, ROWZ + 0.5, h);
    });
    gBarM.color.set(t > tMel && t > tG3 ? 0xd33a2c : t > tMin ? 0xc65d3b : 0xd9d2c2);
    const gH = bars[1].scale.y;
    gTagM.visible = showBars > 0.5 && t > AT["s2:Gandhi"];
    gTagM.position.set(PX[1] + 1.3, BT + gH + 0.85, ROWZ + 0.55); gTagM.quaternion.copy(cam.quaternion);
    paintTag(t > tMel ? "255" : t > tMin ? "−1" : "1", t > tMel ? SAF : t > tMin ? "#F0B7A6" : CRM);
    // leader pawns startle when Gandhi's bar shoots
    leaders.forEach((l, i) => { const jmp = i !== 1 ? Math.max(0, Math.sin(clamp01((t - tG3 - 0.6 - i * 0.07) / 0.45) * Math.PI)) * 0.8 : 0; l.G.position.y = BT + jmp; l.G.rotation.z = i !== 1 ? -jmp * 0.15 : 0; });

    // DEMOKRASI card
    const dIn = eout(clamp01((t - tDem + 0.2) / 0.55)), dOut = ramp(t, K.s3 + 0.2, K.s3 + 0.8);
    dem.visible = dIn > 0 && dOut < 1;
    dem.position.set(PX[1] + 0.9 + (1 - dIn) * 12 - dOut * 6, BT + 0.6 + dOut * 2, ROWZ + 4.6); dem.scale.setScalar(0.8); dem.rotation.set(-1.0, (1 - dIn) * -0.6, (1 - dIn) * 0.25 + (t > tSat ? Math.sin(clamp01((t - tSat) / 0.4) * Math.PI) * 0.06 : 0));

    // register: rises at s3, ripples to 11111111, folds flat at "Gandhi"
    const rIn = back(clamp01((t - K.s3 + 0.1) / 0.5), 1.4), rFold = ramp(t, tG3 - 0.5, tG3 + 0.2);
    regPiv.visible = t > K.s3 - 0.1 && t < K.s4 + 0.5;
    regPiv.rotation.x = -0.32 - (1 - rIn) * 1.25 - rFold * 1.25; regPiv.scale.setScalar(Math.max(0.001, rIn));
    lamps.forEach((m, i) => { const b = t < tM2 ? (i === 7 ? 1 : 0) : t > tM2 + 0.12 + (7 - i) * 0.085 ? 1 : 0; m.material[4] = bitM[b]; m.position.z = 0.18 + (b ? 0.08 : 0); });
    const rip = t > tM2 + 0.12 + 7 * 0.085;
    paintReg(t < tM2 ? "= 1" : !rip ? "1 − 2 → ?" : t < AT["s3:dua"] ? "−1 → ?" : "−1 → 255", t < tM2 ? "nilai Gandhi" : rip ? "meluap!" : "dikurangi dua...");

    // story rockets
    R3.forEach((r) => { const u = clamp01((t - tTem - r.d) / 2.6), o = ramp(t, K.s4 + 0.4, K.s4 + 1.0); r.G.visible = u > 0 && o < 1; r.G.position.set(r.x + Math.sin(t * 9 + r.d * 10) * 0.05, BT + 0.2 + 9 * u * u + 1.2 * u, r.z); r.G.scale.setScalar(Math.max(0.001, 0.62 * (1 - o))); });

    // rumour leaflets
    leaf.forEach((L, k) => {
      const ts = tSpr + L.wv * 0.48 + L.d; const u = clamp01((t - ts) / 0.7);
      if (u <= 0 || t > K.s5 + 1.5) { dm.position.set(0, -40, 0); dm.scale.setScalar(0.001); dm.rotation.set(0, 0, 0); }
      else { const e = eout(u); dm.position.set(BP[0] + (L.x - BP[0]) * e, BT + 0.06 + Math.sin(u * Math.PI) * 3.2 + (1 - e) * 2.2, BP[1] + (L.z - BP[1]) * e); dm.rotation.set(-Math.PI / 2 + (1 - e) * 1.2, 0, L.ry * e); dm.scale.setScalar(0.5 + 0.5 * e); }
      dm.updateMatrix(); IL.setMatrixAt(k, dm.matrix);
    });
    IL.instanceMatrix.needsUpdate = true;
    master.visible = easel.visible = t > K.s3e - 0.5;
    master.position.y = BT + 2.3 + (t > tSpr && t < tSpr + 3 ? Math.sin((t - tSpr) * 20) * 0.03 : 0);

    // grid pawns + three levels
    const gOn = ramp(t, K.s5 - 0.6, K.s5 + 0.6), snap = back(clamp01((t - tTiga) / 0.5), 2.2);
    grid.forEach((q, i) => {
      const h = (lvlA[i] + (lvlB[i] - lvlA[i]) * snap) * 0.72 * gOn;
      setBar(q.b, q.x + 1.0, q.z + 0.35, h); q.b.visible = gOn > 0.01;
      const lit = q.same && t > tSep + (i % 3) * 0.1;
      q.b.material.color.set(lit ? 0xf2a541 : gridCols[i] === 0xfbfaf5 ? 0xd9d2c2 : gridCols[i]);
      q.b.material.emissive.set(lit ? 0x5a3200 : 0x000000);
      const hop = lit ? Math.max(0, Math.sin(clamp01((t - tSep - (i % 3) * 0.1) / 0.4) * Math.PI)) * 0.6 : 0;
      q.p.G.position.y = BT + hop;
    });
    rep.position.y = BT + 0.7 + (1 - eout(clamp01((t - AT["s5:Brian"] + 0.2) / 0.45))) * 5; rep.visible = t > AT["s5:Brian"] - 0.25;

    // memoir opens
    const op = ramp(t, tMem - 0.3, tMem + 1.0);
    hinge.rotation.z = op * Math.PI * 0.97;
    const xIn = back(clamp01((t - tTid) / 0.35), 2);
    xG.scale.setScalar(Math.max(0.001, xIn)); xG.visible = xIn > 0;
    const pulse = t > tPem && t < tTid ? Math.sin((t - tPem) * 6) * 0.08 : 0;
    arrow.position.x = DP[0] + 0.2 + pulse * 3;
    govs.forEach((m, i) => { const u = back(clamp01((t - tPem + 0.3 - i * 0.12) / 0.4), 1.8); m.scale.setScalar(Math.max(0.001, u)); m.visible = u > 0; });
    arrow.visible = t > tPem - 0.1; aggBar.visible = aggP.visible = t > tPem - 0.3;

    // newer board: nuke card, Jon plate, prop rocket
    const nIn = eout(clamp01((t - tNuk + 0.15) / 0.5));
    nuke.visible = nIn > 0; nuke.position.set(EP[0] + 2.6, ST + 1.4 + (1 - nIn) * 4, EP[1] - 0.6);
    const jIn = back(clamp01((t - tLel + 0.1) / 0.4), 1.8); jon.visible = jIn > 0; jon.scale.setScalar(Math.max(0.001, jIn * 0.8));
    const cIn = back(clamp01((t - t2010 + 0.2) / 0.45), 1.6); civP.scale.setScalar(Math.max(0.001, cIn)); civP.visible = cIn > 0;
    const pIn = back(clamp01((t - AT["s7:membangun"]) / 0.5), 1.6);
    propG.visible = pIn > 0; propG.scale.setScalar(Math.max(0.001, pIn)); propG.rotation.z = Math.sin(t * 2.2) * 0.08;
    bang.visible = t > AT["s7:memakai"]; bang.scale.setScalar(t > AT["s7:memakai"] ? back(clamp01((t - AT["s7:memakai"]) / 0.3), 2.5) : 0.001);

    // scout
    const sp = scoutAt(t);
    let hop = 0;
    if (t > tG3 + 0.4 && t < tG3 + 1.0) hop = Math.sin(((t - tG3 - 0.4) / 0.6) * Math.PI) * 0.9;
    if (t > tLel && t < tLel + 1.2) hop = Math.abs(Math.sin((t - tLel) * 8)) * 0.35;
    S.G.position.set(sp.x, BT + hop, sp.z);
    let face = 0.35;
    if (sp.mv) face = Math.atan2(sp.dx, sp.dz);
    else if (t < K.s2 + 0.3) face = Math.atan2(CITY[0] - sp.x, CITY[1] - sp.z) * 0.6;
    else if (t < K.s3) face = 0.9;
    else if (t < K.s4) face = 0.5;
    else if (t < K.s8) face = 0.45;
    else face = 0.2;
    S.G.rotation.y = face;
    restPose(S); S.head.rotation.set(0, 0, 0);
    if (sp.mv) runPose(S, t * 13);
    else if (t < K.s2) { S.head.rotation.x = -0.35 * ramp(t, 0.4, 2); }
    else if (t < K.s3) { if (t > AT["s2:Gandhi"]) S.armR.rotation.x = -1.6; }
    else if (t < K.s4) { if (t > tG3) { S.head.rotation.x = -0.5; S.armL.rotation.z = -2.6; S.armR.rotation.z = 2.6; } }
    else if (t < K.s5) { S.head.rotation.y = Math.sin(t * 1.6) * 0.6; }
    else if (t < K.s6) { if (t > tSep) S.armR.rotation.z = 2.7; }
    else if (t < K.s7) { if (t > tMem) S.armR.rotation.x = -1.3; S.head.rotation.x = 0.25; }
    else if (t < K.s8) { if (t > tLel) { S.armL.rotation.z = -0.9; S.armR.rotation.z = 0.9; } }
    else if (t > K.s8 + 0.4) { S.armR.rotation.z = 2.5 + Math.sin(t * 8) * 0.45; }

    comp.render();
  };
}
