// ARKADE TIKET: one late-2000s arcade room at night. Camera walks from machine to machine along the aisle.
// Tickets are gold strips, coins are generic green hexagons (no platform marks). Illustration only. Every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose } from "./lib3d.js";

// Canvas labels need the display fonts before the first texture is drawn.
await Promise.race([
  Promise.all(["400 60px Bungee", '400 24px "Press Start 2P"'].map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 4000)),
]).catch(() => {});

const PUR = 0x1b1036, PUR2 = 0x2a1a55, PUR3 = 0x3b2577, GOLD = 0xf6c445, GRN = 0x00b06f, PINK = 0xff4fa3, CRM = 0xfff4d6;
const FB = "Bungee", FP = '"Press Start 2P"';
const X1 = 0, X2 = 24, X3 = 48, X4 = 74, X5 = 100, X6 = 124, X7 = 150, X8 = 176;
const SC = 0.62; // avatar scale

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: PUR, fog: 0.011, exp: 1.05, bloom: [0.5, 0.45, 0.8] });
  const R = mulberry(505);

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0x9b80ff, 0x2a1240, 1.25));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 90 }); key.shadow.bias = -0.0006; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(PINK, 1.3); rim.position.set(-10, 12, -12); scene.add(rim);
  [X1, X2, X3, X4, X5, X6, X7, X8].forEach((x, i) => { const p = new THREE.PointLight(i % 2 ? PINK : GOLD, 55, 30, 1.6); p.position.set(x, 7.5, 5); scene.add(p); });

  // ---------- helpers ----------
  const neon = (c, i = 2.4) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: c, emissiveIntensity: i * 0.55, roughness: 0.6 });
  const hex = (g, x, y, rad, rot = Math.PI / 6) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = rot + (k * Math.PI) / 3; g[k ? "lineTo" : "moveTo"](x + rad * Math.cos(a), y + rad * Math.sin(a)); } g.closePath(); };
  const fit = (g, txt, maxW, size, font) => { let s = size; g.font = `${s}px ${font}`; while (g.measureText(txt).width > maxW && s > 8) { s -= 2; g.font = `${s}px ${font}`; } return s; };
  // glowing text sign (unlit, blooms)
  const sign = (txt, col, { W = 1024, H = 256, w = 6, font = FB, size = 170, glow = 26 } = {}) => {
    const tx = canvasTex(W, H, (g) => { g.clearRect(0, 0, W, H); g.textAlign = "center"; g.textBaseline = "middle"; fit(g, txt, W - 60, size, font); g.shadowColor = col; g.shadowBlur = glow; g.fillStyle = col; g.fillText(txt, W / 2, H / 2 + 6); g.shadowBlur = 0; g.fillStyle = "#fff8ea"; g.globalAlpha = 0.55; g.fillText(txt, W / 2, H / 2 + 6); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, (w * H) / W), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
    scene.add(m); return m;
  };
  // lit printed face
  const face = (w, h, W, H, draw, emi = 0.35) => { const tx = canvasTex(W, H, draw); return new THREE.MeshStandardMaterial({ map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: emi, roughness: 0.55 }); };
  const faced = (w, h, d, frontMat, bodyCol, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [0, 0, 0, 0, 1, 0].map((k) => (k ? frontMat : std(bodyCol, 0.5)))); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (parent || scene).add(m); return m; };
  const grp = (x = 0, y = 0, z = 0) => { const G = new THREE.Group(); G.position.set(x, y, z); scene.add(G); return G; };

  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), SV = new THREE.Vector3(), P3 = new THREE.Vector3(), CC = new THREE.Color();
  function pool(geo, mat, n, colored) {
    const im = new THREE.InstancedMesh(geo, mat, n); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; im.count = 0; scene.add(im);
    if (colored) for (let i = 0; i < n; i++) im.setColorAt(i, CC.set(0xffffff));
    let k = 0;
    return {
      im, begin() { k = 0; },
      put(x, y, z, rx = 0, ry = 0, rz = 0, s = 1, col) { if (k >= n || s <= 0.002) return; E.set(rx, ry, rz); Q.setFromEuler(E); SV.set(s, s, s); P3.set(x, y, z); M4.compose(P3, Q, SV); im.setMatrixAt(k, M4); if (colored && col !== undefined) im.setColorAt(k, CC.set(col)); k++; },
      putM(m) { if (k < n) im.setMatrixAt(k++, m); },
      end() { im.count = k; im.instanceMatrix.needsUpdate = true; if (colored) im.instanceColor.needsUpdate = true; },
    };
  }
  const arc = (a, b, u, h) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 4 * h * u * (1 - u), a[2] + (b[2] - a[2]) * u];
  const shake = (t, t0, amp) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) * 5) * Math.sin((t - t0) * 55));

  // ---------- room ----------
  const carpet = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#1d1140"; g.fillRect(0, 0, w, w); const r = mulberry(7); const cols = ["#FF4FA3", "#F6C445", "#00B06F", "#5fd3ff", "#8a5cff"];
    for (let i = 0; i < 80; i++) { const x = 20 + r() * (w - 40), y = 20 + r() * (w - 40), c = cols[i % 5]; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 5; const k = i % 4;
      if (k === 0) { g.beginPath(); g.arc(x, y, 6 + r() * 8, 0, 7); g.stroke(); } else if (k === 1) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y + 4); g.lineTo(x + 6, y + 20); g.closePath(); g.fill(); } else if (k === 2) { g.beginPath(); g.moveTo(x, y); for (let j = 1; j < 5; j++) g.lineTo(x + j * 8, y + (j % 2 ? 9 : 0)); g.stroke(); } else g.fillRect(x, y, 9, 9); }
  }, [36, 6]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(320, 54), new THREE.MeshStandardMaterial({ map: carpet, color: 0xa79bc4, roughness: 0.92 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(88, 0, 12); floor.receiveShadow = true; scene.add(floor);
  const wallT = canvasTex(256, 512, (g, w, h) => { g.fillStyle = "#24154c"; g.fillRect(0, 0, w, h); g.fillStyle = "#2d1b5c"; g.fillRect(8, 0, w / 2 - 12, h); g.fillRect(w / 2 + 4, 0, w / 2 - 12, h); g.fillStyle = "rgba(255,79,163,.18)"; for (let i = 0; i < 14; i++) g.fillRect((i * 37) % w, (i * 91) % h, 4, 4); }, [80, 1]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(320, 26), new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.85 })); wall.position.set(88, 13, -7); wall.receiveShadow = true; scene.add(wall);
  box(320, 0.16, 0.16, neon(PINK, 3), 88, 9.4, -6.85); box(320, 0.16, 0.16, neon(GOLD, 2.6), 88, 10.0, -6.85); box(320, 0.12, 0.12, neon(PINK, 2), 88, 0.12, -6.85);
  box(320, 1.6, 0.3, std(PUR2, 0.6), 88, 0.8, -6.95);

  // background cabinets with pixel screens (PIXELSTORY)
  const SPR = [
    ["....GGGG....", "..GGGGGGGG..", ".GGPGGGGPGG.", ".GGGGGGGGGG.", "..GG.GG.GG..", ".G........G.", "............", "..CCCCCCCC..", ".CGGGGGGGGC.", ".CGGCCCCGGC.", ".CGGGGGGGGC.", "..CCCCCCCC.."],
    ["..PP....PP..", ".PPPP..PPPP.", "PPPPPPPPPPPP", "PPPPPPPPPPPP", ".PPPPPPPPPP.", "..PPPPPPPP..", "...PPPPPP...", "....PPPP....", ".....PP.....", "............", "Y.Y.Y.Y.Y.Y.", "............"],
    [".....YY.....", "....YYYY....", "YYYYYYYYYYYY", ".YYYYYYYYYY.", "..YYYYYYYY..", "..YYY..YYY..", ".YY......YY.", "............", "CC..CC..CC..", "CC..CC..CC..", "............", "GGGGGGGGGGGG"],
  ];
  const PC = { G: "#00B06F", P: "#FF4FA3", Y: "#F6C445", C: "#FFF4D6" };
  const scr = SPR.map((sp) => { const tx = canvasTex(240, 300, (g) => { g.fillStyle = "#0d0722"; g.fillRect(0, 0, 240, 300); sp.forEach((row, y) => [...row].forEach((ch, x) => { if (PC[ch]) { g.fillStyle = PC[ch]; g.fillRect(12 + x * 18, 30 + y * 18, 18, 18); } })); g.fillStyle = "#F6C445"; g.font = `16px ${FP}`; g.textAlign = "center"; g.fillText("1UP 00", 120, 268); }); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter; return new THREE.MeshBasicMaterial({ map: tx, toneMapped: false, color: 0xbbbbbb }); });
  [-13, 12, 36, 61, 87, 112, 137, 163, 190].forEach((x, i) => {
    const G = grp(x, 0, -5.3); const c = [PINK, GOLD, GRN][i % 3];
    box(2.8, 5.6, 2.2, std(PUR3, 0.5), 0, 2.8, 0, G); box(2.9, 0.9, 2.3, neon(c, 2.2), 0, 6.05, 0, G);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), scr[i % 3]); s.position.set(0, 3.9, 1.12); G.add(s);
    box(2.8, 0.25, 1.1, std(PUR2, 0.5), 0, 2.4, 1.5, G); cyl(0.1, 0.1, 0.5, 8, std(0x111111), -0.6, 2.75, 1.5, G); cyl(0.17, 0.17, 0.1, 12, neon(PINK, 2), 0.3, 2.58, 1.5, G); cyl(0.17, 0.17, 0.1, 12, neon(GOLD, 2), 0.8, 2.58, 1.5, G);
  });

  // ---------- pools ----------
  const tixTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#F6C445"; g.fillRect(0, 0, w, h); g.fillStyle = "#C98A18"; for (let y = 10; y < h; y += 18) { g.beginPath(); g.arc(7, y, 4, 0, 7); g.arc(w - 7, y, 4, 0, 7); g.fill(); } g.strokeStyle = "#1B1036"; g.lineWidth = 4; g.setLineDash([10, 7]); g.strokeRect(20, 12, w - 40, h - 24); g.setLineDash([]); g.fillStyle = "#1B1036"; g.font = `62px ${FB}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TIX", w / 2, h / 2 + 4); });
  const tixMat = new THREE.MeshStandardMaterial({ map: tixTex, emissive: 0xffffff, emissiveMap: tixTex, emissiveIntensity: 0.32, roughness: 0.5 });
  const TK = pool(new THREE.BoxGeometry(0.9, 0.03, 0.45), tixMat, 320);
  const coinTopT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#00B06F"; g.fillRect(0, 0, w, w); g.strokeStyle = "#7af0bf"; g.lineWidth = 12; hex(g, 128, 128, 92, 0); g.stroke(); g.fillStyle = "#00804f"; hex(g, 128, 128, 48, 0); g.fill(); g.fillStyle = "#b8ffe0"; hex(g, 118, 118, 16, 0); g.fill(); });
  const coinSide = new THREE.MeshStandardMaterial({ color: 0x00a868, metalness: 0.55, roughness: 0.3, emissive: GRN, emissiveIntensity: 0.25 });
  const coinTop = new THREE.MeshStandardMaterial({ map: coinTopT, metalness: 0.45, roughness: 0.35, emissive: 0xffffff, emissiveMap: coinTopT, emissiveIntensity: 0.3 });
  const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.13, 6);
  const CN = pool(coinGeo, [coinSide, coinTop, coinTop], 260);
  const brickMat = new THREE.MeshStandardMaterial({ roughness: 0.32 });
  const BR = pool(new THREE.BoxGeometry(0.98, 0.58, 0.98), brickMat, 120, true);
  const ST = pool(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 12), brickMat, 480, true);
  const brick = (x, y, z, s, col, ry = 0) => { BR.put(x, y, z, 0, ry, 0, s, col); for (const [a, b] of [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]]) { const c = Math.cos(ry), sn = Math.sin(ry); ST.put(x + (a * c + b * sn) * s, y + 0.34 * s, z + (-a * sn + b * c) * s, 0, 0, 0, s, col); } };
  const bigCoin = () => { const m = new THREE.Mesh(coinGeo, [coinSide, coinTop, coinTop]); m.castShadow = true; scene.add(m); return m; };

  // ---------- avatars ----------
  const mkAv = (shirt, pants, skin = 0xf5cd30, face = true) => { const a = avatar({ skin, shirt, pants, face }); a.G.scale.setScalar(SC); scene.add(a.G); return a; };
  const H = mkAv(PINK, 0x5b3ba8); // hero
  const cap = box(1.35, 0.22, 1.35, std(GOLD, 0.4), 0, 1.25, 0, H.head); box(1.2, 0.08, 0.7, std(GOLD, 0.4), 0, 1.15, 0.85, H.head); cap.castShadow = true;
  const BLD = mkAv(GRN, PUR2); box(1.3, 0.5, 1.3, std(GOLD, 0.4), 0, 1.4, 0, BLD.head); // builder with hard hat
  const CNF = mkAv(CRM, PINK, 0xf5cd30);
  const BOTS = [0, 1, 2, 3, 4].map(() => { const a = mkAv(0x8a84a8, 0x5d567a, 0xa9a3c4, false); a.G.scale.setScalar(0.5); box(1.05, 0.22, 0.12, neon(PINK, 3), 0, 0.7, 0.62, a.head); return a; });
  const SP1 = mkAv(GOLD, PUR3), SP2 = mkAv(GRN, 0x5b3ba8);
  const VIS = [0, 1, 2, 3, 4].map((i) => { const a = mkAv([PINK, GOLD, CRM, GRN, 0x5fd3ff][i], PUR3); a.G.scale.setScalar(0.36); return a; });

  // ---------- S1 ticket dispenser + coin stacks ----------
  const S1 = grp(X1, 0, 0);
  const dispFace = face(3.2, 5.2, 320, 520, (g, w, h) => { g.fillStyle = "#3B2577"; g.fillRect(0, 0, w, h); g.fillStyle = "#1B1036"; g.fillRect(30, 40, w - 60, 150); g.fillStyle = "#F6C445"; g.font = `40px ${FB}`; g.textAlign = "center"; g.fillText("TIKET", w / 2, 132); g.fillStyle = "#FF4FA3"; g.font = `16px ${FP}`; g.fillText("AMBIL DI SINI", w / 2, 250); g.fillStyle = "#0b0618"; g.fillRect(50, 270, w - 100, 34); g.strokeStyle = "#F6C445"; g.lineWidth = 6; g.strokeRect(50, 270, w - 100, 34); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#FF4FA3" : "#F6C445"; g.beginPath(); g.arc(60 + i * 40, 420, 12, 0, 7); g.fill(); } });
  faced(3.2, 5.6, 2.4, dispFace, PUR3, 0, 2.8, 0, S1);
  box(3.4, 1.1, 2.6, neon(GOLD, 2.2), 0, 6.15, 0, S1); box(3.4, 0.2, 2.6, std(PINK, 0.4), 0, 0.1, 0, S1);
  const s1Sign = sign("TIKET!", "#FF4FA3", { w: 3.6 }); s1Sign.position.set(X1, 6.2, 1.32);
  // ---------- S2 pedestals + designer plates ----------
  const pedL = grp(X2 - 3, 0, 0), pedR = grp(X2 + 3, 0, 0);
  for (const [P, c] of [[pedL, GOLD], [pedR, GRN]]) { cyl(1.5, 1.7, 2.6, 32, std(PUR3, 0.45), 0, 1.3, 0, P); const tr = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.09, 8, 48), neon(c, 3)); tr.rotation.x = Math.PI / 2; tr.position.y = 2.62; P.add(tr); }
  const sTix = sign("TIX", "#F6C445", { w: 4 }), sRbx = sign("ROBUX", "#00B06F", { w: 4.2 });
  const NAMES = [["DAVID", "BASZUCKI", "David"], ["ERIK", "CASSEL", "Erik"], ["JOHN", "SHEDLETSKY", "John"], ["MATT", "DUSEK", "Matt"]];
  const plates = NAMES.map(([a, b, w], i) => {
    const G = grp(X2 - 3.45 + i * 2.3, 0, 3.2);
    const fm = face(2.1, 1.3, 512, 320, (g, W, Hh) => { g.fillStyle = "#FFF4D6"; g.fillRect(0, 0, W, Hh); g.strokeStyle = "#1B1036"; g.lineWidth = 14; g.strokeRect(10, 10, W - 20, Hh - 20); g.fillStyle = "#FF4FA3"; g.font = `30px ${FP}`; g.textAlign = "center"; g.fillText(a, W / 2, 92); g.fillStyle = "#1B1036"; fit(g, b, W - 70, 96, FB); g.fillText(b, W / 2, 215); g.fillStyle = "#F6C445"; g.fillRect(150, 250, W - 300, 14); }, 0.2);
    const pl = faced(2.1, 1.3, 0.14, fm, GOLD, 0, 1.55, 0, G); pl.rotation.x = -0.22;
    cyl(0.07, 0.07, 1.0, 8, std(GOLD, 0.3, 0.6), 0, 0.5, -0.05, G);
    return { G, t: AT["s2:" + w] };
  });
  // ---------- S3 vault, building lot, value meter ----------
  const S3 = grp(X3 + 1.5, 0, -1.2);
  box(5.6, 5.6, 3, std(PUR3, 0.45, 0.2), 0, 2.8, 0, S3); box(5.9, 0.4, 3.2, neon(GRN, 2), 0, 5.75, 0, S3);
  const door = new THREE.Group(); door.position.set(0, 2.8, 1.55); S3.add(door);
  const dr = cyl(2, 2, 0.35, 48, std(0x0f7a52, 0.35, 0.6), 0, 0, 0, door); dr.rotation.x = Math.PI / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.12, 8, 48), neon(GRN, 2.4)); ring.position.z = 0.2; door.add(ring);
  const wheel = new THREE.Group(); wheel.position.z = 0.3; door.add(wheel);
  const wt = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.09, 8, 32), std(GOLD, 0.3, 0.7)); wheel.add(wt);
  for (let k = 0; k < 3; k++) { const sp = box(1.9, 0.12, 0.12, std(GOLD, 0.3, 0.7), 0, 0, 0, wheel); sp.rotation.z = (k * Math.PI) / 3; }
  const vSign = sign("ROBUX", "#00B06F", { w: 4.6 }); vSign.position.set(X3 + 1.5, 6.9, 0.4);
  const slot = box(1.4, 0.18, 0.2, std(0x05030d), 2.0, 0.9, 1.52, S3);
  const note = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.75, 0.03), face(1.5, 0.75, 300, 150, (g, w, h) => { g.fillStyle = "#cfe9c8"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2f6b3a"; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = "#2f6b3a"; g.font = `40px ${FB}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("UANG", w / 2, h / 2 + 3); }, 0.25)); note.castShadow = true; scene.add(note);
  const meter = grp(X3 + 6.6, 0, -0.6);
  box(1.6, 6, 0.8, std(PUR2, 0.5), 0, 3, 0, meter); box(1.1, 5.0, 0.1, std(0x0b0618, 0.6), 0, 3.05, 0.42, meter);
  const fillM = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: GRN, emissiveIntensity: 2.2 });
  const fill = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.08), fillM); fill.position.set(0, 0.55, 0.48); meter.add(fill);
  const mSign = sign("NILAI", "#FFF4D6", { w: 2.4, font: FP, size: 120 }); mSign.position.set(X3 + 6.6, 6.55, -0.1);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 3), neon(PINK, 2.6)); arrow.rotation.z = Math.PI; scene.add(arrow);
  const TOWER = []; { const cols = [PINK, GOLD, GRN, CRM]; let i = 0; for (let y = 0; y < 4; y++) for (const [dx, dz] of [[0, 0], [1, 0], [0, 1]]) { TOWER.push({ x: X3 - 5.6 + dx, y: 0.29 + y * 0.6, z: 0.2 + dz, c: cols[i % 4], ry: 0 }); i++; } }

  // ---------- S4 calendar, place, exchange booth ----------
  const S4c = grp(X4 - 5.5, 0, -1.2);
  const calFace = face(4.2, 5.2, 420, 520, (g, w) => { g.fillStyle = "#3B2577"; g.fillRect(0, 0, w, 520); g.fillStyle = "#F6C445"; g.font = `24px ${FP}`; g.textAlign = "center"; g.fillText("LOGIN", w / 2, 70); g.fillText("HARIAN", w / 2, 108); g.fillStyle = "#0b0618"; g.fillRect(40, 380, w - 80, 40); g.strokeStyle = "#FF4FA3"; g.lineWidth = 5; g.strokeRect(40, 380, w - 80, 40); });
  faced(4.2, 5.4, 2, calFace, PUR3, 0, 2.7, 0, S4c); box(4.4, 0.8, 2.2, neon(PINK, 2), 0, 5.8, 0, S4c);
  const DAYS = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
  const dayTiles = DAYS.map((d, i) => {
    const mk = (on) => canvasTex(128, 160, (g) => { g.fillStyle = on ? "#F6C445" : "#1B1036"; g.fillRect(0, 0, 128, 160); g.strokeStyle = on ? "#1B1036" : "#6a55b0"; g.lineWidth = 8; g.strokeRect(4, 4, 120, 152); g.fillStyle = on ? "#1B1036" : "#FFF4D6"; g.font = `22px ${FP}`; g.textAlign = "center"; g.fillText(d, 64, 48); if (on) { g.strokeStyle = "#1B1036"; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.moveTo(32, 100); g.lineTo(56, 126); g.lineTo(98, 74); g.stroke(); } });
    const off = mk(false), on = mk(true);
    const m = new THREE.MeshStandardMaterial({ map: off, emissive: 0xffffff, emissiveMap: off, emissiveIntensity: 0.4 });
    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.06), m); tile.position.set(-1.62 + i * 0.54, 3.4, 1.02); S4c.add(tile);
    return { m, off, on, t: AT["s4:Tix"] - 0.15 + i * 0.27 };
  });
  const HOUSE = []; { for (let y = 0; y < 6; y++) for (let x = -2; x <= 2; x++) { if (Math.abs(x) <= 0 && y < 3) continue; HOUSE.push({ x: X4 + 1.5 + x, y: 0.29 + y * 0.6, z: -1.4, c: y % 2 ? CRM : PINK }); } for (let x = -2; x <= 2; x++) { if (Math.abs(x) === 2) continue; HOUSE.push({ x: X4 + 1.5 + x, y: 0.29 + 6 * 0.6, z: -1.4, c: GOLD }); } HOUSE.push({ x: X4 + 1.5, y: 0.29 + 7 * 0.6, z: -1.4, c: GOLD }); }
  const hSign = sign("TEMPAT", "#F6C445", { w: 3.4 }); hSign.position.set(X4 + 1.5, 5.65, -0.7);
  const lamps = [0, 1, 2, 3, 4].map((i) => { const m = new THREE.MeshStandardMaterial({ color: 0x220f33, emissive: GOLD, emissiveIntensity: 0 }); const s = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), m); s.position.set(X4 + 0.5 + i * 0.5, 2.25, -0.85); scene.add(s); return m; });
  const kSign = sign("KUNJUNGAN", "#FFF4D6", { w: 2.6, font: FP, size: 90 }); kSign.position.set(X4 + 1.5, 2.65, -0.8);
  const VISIT = VIS.map((_, k) => AT["s4:Developer"] + 0.55 + k * 0.62);

  const booth = grp(X4 + 7.5, 0, -1.5);
  box(4.6, 2.4, 2.4, std(PUR3, 0.45), 0, 1.2, 0, booth); box(4.6, 1.5, 2.4, std(PUR3, 0.45), 0, 5.65, 0, booth);
  box(0.5, 2.5, 2.4, std(PUR2, 0.5), -2.05, 3.65, 0, booth); box(0.5, 2.5, 2.4, std(PUR2, 0.5), 2.05, 3.65, 0, booth);
  box(3.6, 2.5, 0.2, std(0x120a2a, 0.7), 0, 3.65, -1.0, booth); box(4.8, 0.2, 2.8, std(CRM, 0.5), 0, 2.5, 0.15, booth);
  box(4.8, 0.14, 0.14, neon(PINK, 3), 0, 4.95, 1.25, booth);
  const exT = face(4.4, 1.2, 440, 120, (g, w, h) => { g.fillStyle = "#1B1036"; g.fillRect(0, 0, w, h); g.font = `26px ${FP}`; g.textBaseline = "middle"; g.fillStyle = "#F6C445"; g.textAlign = "right"; g.fillText("TIX", 170, h / 2); g.fillStyle = "#00B06F"; g.textAlign = "left"; g.fillText("ROBUX", 268, h / 2); g.strokeStyle = "#FFF4D6"; g.lineWidth = 5; g.beginPath(); g.moveTo(190, 48); g.lineTo(250, 48); g.lineTo(238, 38); g.moveTo(250, 72); g.lineTo(190, 72); g.lineTo(202, 82); g.stroke(); }, 0.6);
  faced(4.4, 1.0, 0.1, exT, PUR2, 0, 1.3, 1.23, booth);
  const bSign = sign("BURSA", "#FF4FA3", { w: 4.2 }); booth.add(bSign); bSign.position.set(0, 6.95, 0.6);
  const shutT = canvasTex(360, 260, (g, w, h) => { for (let y = 0; y < h; y += 20) { g.fillStyle = (y / 20) % 2 ? "#c9a24a" : "#e2bb5c"; g.fillRect(0, y, w, 20); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, y + 17, w, 3); } g.fillStyle = "#FF4FA3"; g.fillRect(40, 92, w - 80, 80); g.fillStyle = "#FFF4D6"; g.font = `58px ${FB}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TUTUP", w / 2, 134); });
  const shGeo = new THREE.PlaneGeometry(3.6, 2.45); shGeo.translate(0, -1.225, 0);
  const shutter = new THREE.Mesh(shGeo, new THREE.MeshStandardMaterial({ map: shutT, emissive: 0xffffff, emissiveMap: shutT, emissiveIntensity: 0.35, roughness: 0.5, metalness: 0.2 })); shutter.position.set(0, 4.9, 1.22); booth.add(shutter);
  box(3.8, 0.35, 0.4, std(PUR2, 0.5), 0, 4.98, 1.2, booth);
  // balance scale in front of the booth
  const scl = new THREE.Group(); scl.position.set(0, 0, 3.1); booth.add(scl);
  cyl(0.6, 0.8, 0.3, 24, std(GOLD, 0.3, 0.7), 0, 0.15, 0, scl); cyl(0.12, 0.12, 2.5, 12, std(GOLD, 0.3, 0.7), 0, 1.4, 0, scl);
  const beam = box(2.9, 0.14, 0.14, std(GOLD, 0.3, 0.7), 0, 2.65, 0, scl);
  const pans = [-1, 1].map(() => { const P = new THREE.Group(); scl.add(P); cyl(0.6, 0.45, 0.1, 24, std(GOLD, 0.3, 0.7), 0, 0, 0, P); cyl(0.02, 0.02, 0.8, 4, std(0xdddddd, 0.3, 0.8), 0, 0.4, 0, P); return P; });

  // ---------- S5 blog plate + 30-day board ----------
  const blogM = face(9, 5, 900, 500, (g, w, h) => {
    g.fillStyle = "#FFF4D6"; g.fillRect(0, 0, w, h); g.fillStyle = "#FF4FA3"; g.fillRect(0, 0, w, 86); g.fillStyle = "#FFF4D6"; g.font = `40px ${FB}`; g.textBaseline = "middle"; g.fillText("BLOG ROBLOX", 36, 46);
    g.fillStyle = "#1B1036"; g.beginPath(); g.arc(w - 60, 44, 16, 0, 7); g.fill();
    g.fillStyle = "#8a7bb8"; g.font = `24px ${FP}`; g.fillText("DIPOSTING", 40, 140); g.fillStyle = "#1B1036"; fit(g, "15 MARET 2016", w - 80, 104, FB); g.fillText("15 MARET 2016", 36, 222);
    g.fillStyle = "#F6C445"; g.fillRect(40, 280, 300, 14); g.fillStyle = "#cfc4e6"; for (let i = 0; i < 4; i++) g.fillRect(40, 330 + i * 38, w - 120 - (i % 2) * 180, 18);
  }, 0.04);
  const blog = faced(9, 5, 0.3, blogM, PUR2, X5, 6.4, -6.6); blogM.color.set(0xb8b0cc); box(9.5, 5.5, 0.2, neon(PINK, 1.6), X5, 6.4, -6.8);
  const stamp = sign("DIHENTIKAN", "#FF4FA3", { w: 6.2, size: 150 }); stamp.material.depthTest = true;
  const board = grp(X5 + 3.3, 0, 0.6);
  cyl(0.1, 0.1, 2.4, 8, std(GOLD, 0.3, 0.6), -1.1, 1.2, 0, board); cyl(0.1, 0.1, 2.4, 8, std(GOLD, 0.3, 0.6), 1.1, 1.2, 0, board);
  box(3.0, 2.3, 0.3, std(PUR3, 0.5), 0, 3.3, 0, board); box(3.1, 0.12, 0.35, neon(GOLD, 2.4), 0, 4.5, 0, board);
  const digit = (d) => face(1.0, 1.4, 200, 280, (g, w, h) => { g.fillStyle = "#0b0618"; g.fillRect(0, 0, w, h); g.fillStyle = "#F6C445"; g.font = `200px ${FB}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(d, w / 2, h / 2 + 10); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, h / 2 - 2, w, 4); }, 0.9);
  const flips = ["3", "0"].map((d, i) => { const P = new THREE.Group(); P.position.set(-0.55 + i * 1.1, 4.05, 0.17); board.add(P); const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.06), digit(d)); m.position.y = -0.7; P.add(m); return P; });
  const hari = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.42), face(2.4, 0.42, 480, 84, (g, w, h) => { g.fillStyle = "#3B2577"; g.fillRect(0, 0, w, h); g.fillStyle = "#FFF4D6"; g.font = `40px ${FP}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("HARI", w / 2, h / 2 + 2); }, 0.5)); hari.position.set(0, 2.5, 0.17); board.add(hari);

  // ---------- S6 three reasons ----------
  const VG = [X6 - 6, X6, X6 + 6];
  VG.forEach((x, i) => { const G = grp(x, 0, 0); box(4.8, 0.4, 3.2, std(PUR3, 0.5), 0, 0.2, 0, G); box(4.9, 0.1, 3.3, neon([PINK, GOLD, GRN][i], 2.2), 0, 0.42, 0, G); const n = sign(String(i + 1), "#F6C445", { W: 256, H: 256, w: 1.3, size: 200 }); n.position.set(x - 1.9, 4.6, -0.6); });
  const qMarks = [0, 1, 2].map(() => sign("?", "#FF4FA3", { W: 256, H: 256, w: 1.0, size: 220 }));
  const cfTix = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.45), tixMat); scene.add(cfTix);
  const cfCoin = bigCoin();
  const copier = grp(VG[1] - 1.95, 0, -0.6); box(1.1, 2.4, 1.3, std(PUR2, 0.5), 0, 1.6, 0, copier); box(0.12, 1.8, 1.0, neon(PINK, 2.6), 0.6, 1.6, 0, copier);
  const botSign = sign("BOT", "#FF4FA3", { w: 2.4 }); botSign.position.set(VG[1] + 0.7, 4.6, -0.6);
  const calM = face(3, 3, 420, 420, (g, w) => { g.fillStyle = "#FFF4D6"; g.fillRect(0, 0, w, w); g.fillStyle = "#3B2577"; g.fillRect(0, 0, w, 70); g.fillStyle = "#F6C445"; g.font = `22px ${FP}`; g.textAlign = "center"; g.fillText("ABSEN", w / 2, 46); for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const x = 18 + c * 56, y = 88 + r * 80; g.strokeStyle = "#b7a8de"; g.lineWidth = 3; g.strokeRect(x, y, 50, 72); g.strokeStyle = "#00B06F"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(x + 10, y + 38); g.lineTo(x + 22, y + 52); g.lineTo(x + 40, y + 22); g.stroke(); } }, 0.35);
  const calB = faced(3, 3, 0.2, calM, PUR2, VG[2], 2.9, -0.2);
  cyl(0.09, 0.09, 1.4, 8, std(GOLD, 0.3, 0.6), VG[2], 0.9, -0.3);
  const xBars = [1, -1].map((s) => { const b = box(4.0, 0.34, 0.12, neon(PINK, 3.2), VG[2], 2.9, 0.0); b.rotation.z = s * 0.79; b.castShadow = false; return b; });

  // ---------- S7 prize counter (+ booth moves here) ----------
  const S7 = grp(X7 - 4, 0, -1.6);
  box(6.6, 2.0, 1.6, std(PUR3, 0.5), 0, 1.0, 0, S7); box(6.8, 0.18, 1.8, std(CRM, 0.4), 0, 2.08, 0, S7); box(6.7, 0.12, 0.12, neon(GOLD, 2.6), 0, 1.95, 0.85, S7);
  const glass = box(6.2, 1.5, 0.05, new THREE.MeshStandardMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.18, roughness: 0.1 }), 0, 1.15, 0.84, S7); glass.castShadow = false;
  box(7.2, 5.6, 0.4, std(PUR2, 0.5), 0, 2.8, -1.8, S7); box(7.0, 0.16, 0.9, std(CRM, 0.5), 0, 3.4, -1.4, S7); box(7.0, 0.16, 0.9, std(CRM, 0.5), 0, 5.1, -1.4, S7);
  const pSign = sign("HADIAH", "#F6C445", { w: 4.4 }); pSign.position.set(X7 - 4, 6.4, -1.3);
  const mkPrize = (kind) => { const G = new THREE.Group(); scene.add(G);
    if (kind === 0) { box(0.8, 0.8, 0.8, std(PINK, 0.8), 0, 0.4, 0, G); box(0.5, 0.1, 0.02, std(0x1b1036), 0, 0.5, 0.41, G); }
    if (kind === 1) { box(0.7, 0.7, 0.5, std(0x5fd3ff, 0.4), 0, 0.35, 0, G); box(0.5, 0.45, 0.45, std(0x5fd3ff, 0.4), 0, 0.95, 0, G); box(0.35, 0.08, 0.05, neon(GOLD, 2.5), 0, 1.0, 0.24, G); }
    if (kind === 2) { cyl(0.32, 0.18, 0.5, 16, std(GOLD, 0.25, 0.8), 0, 0.45, 0, G); cyl(0.25, 0.3, 0.18, 16, std(GOLD, 0.25, 0.8), 0, 0.09, 0, G); }
    if (kind === 3) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 14), std(GRN, 0.4)); s.position.y = 0.4; s.castShadow = true; G.add(s); }
    return G; };
  const PRIZE = [0, 1, 2, 3, 0, 2].map((k, i) => ({ G: mkPrize(k), home: [X7 - 6.6 + (i % 3) * 2.6, i < 3 ? 3.48 : 5.18, -2.9] }));

  // ---------- S8 coin pedestal + leftover tickets ----------
  const p8R = grp(X8 + 3.0, 0, -0.6), p8L = grp(X8 - 3.2, 0, -0.6);
  for (const [P, c] of [[p8L, GOLD], [p8R, GRN]]) { cyl(1.3, 1.5, 2.2, 32, std(PUR3, 0.45), 0, 1.1, 0, P); const tr = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.08, 8, 48), neon(c, 3)); tr.rotation.x = Math.PI / 2; tr.position.y = 2.22; P.add(tr); }
  const s8Coin = bigCoin(), heroCoin = bigCoin(), s2Coin = bigCoin(), s8q = sign("?", "#F6C445", { W: 256, H: 256, w: 1.6, size: 220 });
  const LEFT8 = Array.from({ length: 46 }, (_, i) => ({ x: X8 - 5.5 + R() * 11, z: -0.2 + R() * 4.2, ry: R() * 6.28, d: R() * 0.9, sp: 0.6 + R() * 0.8, onPed: i < 8 }));
  const POUR = Array.from({ length: 90 }, () => ({ d: R() * 2.4, x: X3 + 3.2 + R() * 2.8, z: 0.6 + R() * 2.4, ry: R() * 6.28, lift: 1.5 + R() * 2 }));
  const STRIP = 34;

  // ---------- particles ----------
  const DN = 260, dust = Array.from({ length: DN }, () => [R() * 34, 0.5 + R() * 11, -5 + R() * 14, 0.2 + R() * 0.5, R() * 6.28]);
  const PT = (() => { const g = new THREE.BufferGeometry(), pos = new Float32Array(DN * 3), col = new Float32Array(DN * 3); dust.forEach((_, i) => { CC.set([GOLD, PINK, CRM][i % 3]); col.set([CC.r, CC.g, CC.b], i * 3); }); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); const map = canvasTex(32, 32, (x) => { x.fillStyle = "#fff"; x.fillRect(8, 8, 16, 16); }); const P = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.12, map, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })); P.frustumCulled = false; scene.add(P); return { g, pos }; })();

  // ---------- hero route ----------
  const stops = [
    { a: -9, l: K.s2 - 0.3, x: X1 + 3.2, z: 1.7, ry: -0.55 },
    { a: K.s2 + 1.0, l: K.s3 - 0.3, x: X2, z: 1.0, ry: 0 },
    { a: K.s3 + 1.0, l: K.s4 - 0.3, x: X3 - 3.4, z: 1.2, ry: -1.15 },
    { a: K.s4 + 0.8, l: AT["s4:Pemain"] - 0.5, x: X4 - 3.0, z: 1.4, ry: -1.2 },
    { a: AT["s4:Pemain"] + 0.4, l: K.s5 - 0.3, x: X4 + 4.9, z: 1.7, ry: 1.25 },
    { a: K.s5 + 1.2, l: K.s6 - 0.2, x: X5 - 1.6, z: 2.6, ry: -2.95 },
    { a: K.s6 + 1.1, l: K.s7 - 0.4, x: X6 - 10.2, z: 2.3, ry: 1.3 },
    { a: K.s7 + 1.3, l: K.s8 - 0.3, x: X7 - 5.0, z: 1.2, ry: -2.6 },
    { a: K.s8 + 1.3, l: 999, x: X8, z: 1.9, ry: 0.12 },
  ];
  const heroAt = (t) => {
    for (let i = 0; i < stops.length; i++) { const s = stops[i]; if (t <= s.l) { if (t >= s.a) return { x: s.x, z: s.z, ry: s.ry, run: 0, i }; const p = stops[i - 1], u = clamp01((t - p.l) / (s.a - p.l)), e = u * u * (3 - 2 * u); const dx = s.x - p.x, dz = s.z - p.z; return { x: p.x + dx * e, z: p.z + dz * e, ry: Math.atan2(dx, dz), run: 1, i: i - 0.5 }; } }
    const s = stops[stops.length - 1]; return { x: s.x, z: s.z, ry: s.ry, run: 0, i: stops.length - 1 };
  };

  // ---------- camera ----------
  const c0 = track([
    [0, X1 + 0.7, 4.8, 21, X1 + 0.7, 3.2, 0], [AT["s1:gratis"], X1 + 1.2, 5.4, 23, X1 + 1.2, 3.6, 0], [K.s1e, X1 + 1.6, 5.8, 25.5, X1 + 1.6, 3.9, 0],
    [K.s2 + 0.7, X2, 6, 30, X2, 4.2, 0], [AT["s2:David"] - 0.5, X2 - 2.9, 3.6, 15, X2 - 2.9, 2.2, 2.2], [AT["s2:Matt"] + 0.4, X2 + 3.3, 3.6, 15, X2 + 3.3, 2.2, 2.2],
    [K.s3 + 0.7, X3 + 1.5, 6, 29, X3 + 1.5, 4.2, 0], [AT["s3:Tix"] - 0.3, X3, 5.4, 26, X3, 3.9, 0], [AT["s3:Tix"] + 0.6, X3 - 4.4, 4.4, 18.5, X3 - 4.4, 2.9, 0], [AT["s3:tanpa"], X3 - 4.0, 4.4, 19.5, X3 - 4.0, 2.9, 0],
    [AT["s3:Kalau"], X3 + 3.6, 5.6, 26, X3 + 3.6, 3.9, 0], [K.s3e - 0.2, X3 + 4.2, 5.2, 23.5, X3 + 4.2, 3.7, 0],
    [K.s4 + 0.6, X4 - 4.4, 4.8, 20, X4 - 4.4, 3.5, 0], [AT["s4:Developer"] - 0.2, X4 - 4.0, 4.8, 20.5, X4 - 4.0, 3.5, 0], [AT["s4:Developer"] + 0.6, X4 + 1.4, 4.8, 21, X4 + 1.4, 3.3, 0], [AT["s4:dikunjungi"], X4 + 1.8, 4.8, 21.5, X4 + 1.8, 3.3, 0],
    [AT["s4:Pemain"] + 0.3, X4 + 6.6, 4.6, 19, X4 + 6.6, 3.1, 0], [K.s4e - 0.2, X4 + 7.0, 4.6, 20.5, X4 + 7.0, 3.2, 0],
    [K.s5 + 0.7, X5 + 0.2, 4.2, 26, X5 + 0.2, 5.3, -3], [AT["s5:tiga"], X5 + 1.6, 4.4, 24, X5 + 1.6, 4.6, -1.5], [AT["s5:dihentikan"] + 0.3, X5 + 0.6, 4.2, 24, X5 + 0.6, 5.3, -3], [K.s5e - 0.2, X5 + 0.8, 4.6, 27, X5 + 0.8, 5.1, -3],
    [K.s6 + 0.7, X6, 6, 34, X6, 4, 0], [AT["s6:membingungkan"] - 0.2, VG[0] + 0.3, 4.3, 18, VG[0] + 0.3, 2.8, 0], [AT["s6:Bonus"] + 0.2, VG[0] + 0.6, 4.3, 18.5, VG[0] + 0.6, 2.8, 0],
    [AT["s6:akun"] - 0.4, VG[1] + 0.4, 4.3, 19, VG[1] + 0.4, 2.8, 0], [AT["s6:Roblox"], VG[1] + 0.8, 4.3, 19.5, VG[1] + 0.8, 2.8, 0], [AT["s6:absen"] - 0.8, VG[2], 4.3, 18.5, VG[2], 2.9, 0], [K.s6e - 0.1, VG[2] + 0.3, 4.5, 19.5, VG[2] + 0.3, 3, 0],
    [K.s7 + 0.8, X7 - 4, 5, 22, X7 - 4, 3.5, 0], [AT["s7:Pemain"], X7 - 4.4, 4.8, 21, X7 - 4.4, 3.6, 0], [AT["s7:mereka"], X7 - 3.6, 4.8, 21.5, X7 - 3.6, 3.6, 0],
    [AT["s7:bursa"] - 0.2, X7 + 5, 4.8, 20, X7 + 5, 3.5, 0], [K.s7e, X7 + 5.2, 4.8, 21, X7 + 5.2, 3.5, 0],
    [K.s8 + 0.8, X8, 5, 22.5, X8, 3.5, 0], [AT["s8:Kalau"], X8 + 0.2, 4.5, 19, X8 + 0.2, 3.2, 0], [K.end, X8 + 0.4, 4.3, 16.5, X8 + 0.2, 3.1, 0], [K.dur, X8 + 0.5, 4.3, 16, X8 + 0.2, 3.1, 0],
  ]);
  const V = new THREE.Vector3();

  return (t) => {
    // camera with impact shakes
    const p = c0(t);
    const sh = shake(t, AT["s5:terbesar"], 0.16) + shake(t, AT["s7:ditutup"] + 0.45, 0.12) + shake(t, AT["s3:inflasi"], 0.1);
    cam.position.set(p[0] + sh, p[1] + sh * 0.6, p[2]); cam.lookAt(p[3], p[4], p[5]);
    key.position.set(p[3] + 9, 22, p[5] + 16); key.target.position.set(p[3], 0, p[5]);
    const lx = p[3];

    // dust motes drifting through the light
    dust.forEach((d, i) => { const x = lx - 17 + ((d[0] + t * d[3]) % 34), y = d[1] + Math.sin(t * 0.7 + d[4]) * 0.3; PT.pos[i * 3] = x; PT.pos[i * 3 + 1] = y; PT.pos[i * 3 + 2] = d[2]; });
    PT.g.attributes.position.needsUpdate = true;

    TK.begin(); CN.begin(); BR.begin(); ST.begin();
    const near = (x, r = 22) => Math.abs(lx - x) < r;

    // ===== S1: continuous ticket strip + loose tickets caught by the hero
    if (near(X1)) {
      const L = Math.min(STRIP * 0.9, Math.max(0, (t - 0.15) * 5.2));
      const P = (s) => { if (s < 0.5) return [X1, 2.95, 1.25 + s]; if (s < 3.3) { const u = s - 0.5; return [X1 + Math.sin(u * 1.3) * 0.08, 2.95 - u * 1.03, 1.75 + Math.sin(u * 1.1) * 0.25]; } const k = s - 3.3, lane = Math.floor(k / 1.8), u = k - lane * 1.8; return [X1 + (lane % 3 - 1) * 0.06, 0.06 + lane * 0.04, 2.0 + (lane % 2 ? 1.8 - u : u)]; };
      const ax = new THREE.Vector3(1, 0, 0), tn = new THREE.Vector3(), nm = new THREE.Vector3();
      for (let i = 0; i < STRIP; i++) {
        const s = L - i * 0.9 - 0.45; if (s < 0) break;
        const a = P(s), b = P(s + 0.05); tn.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); nm.crossVectors(ax, tn);
        M4.makeBasis(tn, nm, ax); M4.setPosition(a[0], a[1], a[2]); TK.putM(M4);
      }
      for (let k = 0; k < 14; k++) {
        const t0 = 0.5 + k * 0.42, u = (t - t0) / 0.62; if (u < 0 || u > 1) continue;
        const q = arc([X1 + 1.0, 3.0, 1.3], [X1 + 3.25, 3.75, 1.9], u, 1.4); TK.put(q[0], q[1], q[2], u * 7, u * 3, 0.3, 1);
      }
      for (let k = 0; k < 13; k++) CN.put(X1 - 2.5, 0.07 + k * 0.135, 0.9, 0, k * 0.4, 0, 1.15);
      for (let k = 0; k < 9; k++) CN.put(X1 - 3.4, 0.07 + k * 0.135, 1.7, 0, k * 0.3 + 0.3, 0, 1.15);
      for (let k = 0; k < 3; k++) CN.put(X1 - 2.0 + k * 0.6, 0.07, 2.5 + k * 0.3, 0, k, 0, 1.15);
    }
    s1Sign.material.opacity = 0.75 + 0.25 * (Math.floor(t * 4) % 2);

    // ===== S2: pedestals, then plates per name
    const tL = AT["s2:Tickets"] - 0.3, tR = AT["s2:Robux"] - 0.3;
    pedL.position.y = -3 + 3 * back(clamp01((t - tL) / 0.5), 1.6); pedR.position.y = -3 + 3 * back(clamp01((t - tR) / 0.5), 1.6);
    sTix.position.set(X2 - 3, 6.0 + pedL.position.y, 0); sTix.visible = t > tL + 0.2 && t < AT["s2:David"] - 0.7 && near(X2);
    sRbx.position.set(X2 + 3, 6.0 + pedR.position.y, 0); sRbx.visible = t > tR + 0.2 && t < AT["s2:David"] - 0.7 && near(X2);
    if (near(X2)) {
      for (let k = 0; k < 9; k++) { const a = -0.9 + k * 0.225 + Math.sin(t * 0.8) * 0.05; TK.put(X2 - 3 + Math.sin(a) * 0.7, 2.75 + pedL.position.y + Math.cos(a) * 0.7 + 0.4, 0, Math.PI / 2, 0, -a + Math.PI / 2, 1.6); }
      for (let k = 0; k < 6; k++) CN.put(X2 + 3 + (k % 2) * 0.05, 2.7 + pedR.position.y + k * 0.15, 0, 0, k * 0.5, 0, 1.6);
    }
    s2Coin.visible = near(X2); s2Coin.position.set(X2 + 3, 4.6 + pedR.position.y + Math.sin(t * 2) * 0.12, 0); s2Coin.rotation.set(Math.PI / 2, 0, 0); s2Coin.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), t * 1.6); s2Coin.scale.setScalar(2.4);
    plates.forEach((pl) => { const u = clamp01((t - pl.t + 0.15) / 0.4); pl.G.position.y = -2.6 * (1 - back(u, 2)); pl.G.visible = u > 0; });

    // ===== S3: vault, building rewards, inflation pour
    wheel.rotation.z = -ramp(t, AT["s3:dibeli"] - 0.2, AT["s3:dibeli"] + 0.8) * 2.4 + ramp(t, AT["s3:Kalau"], AT["s3:dibagi"] + 0.3) * 4.0;
    door.rotation.y = -ramp(t, AT["s3:dibagi"] - 0.3, AT["s3:dibagi"] + 0.4) * 1.1;
    { const u = clamp01((t - AT["s3:dibeli"] + 0.5) / 0.9); note.visible = u > 0 && u < 1 && near(X3); const q = arc([X3 + 6, 1.6, 2.5], [X3 + 3.5, 0.9, 0.35], u, 0.6); note.position.set(q[0], q[1], q[2]); note.rotation.set(0, 0.3, 0); }
    const tB = AT["s3:Tix"] + 0.1, tE = AT["s3:tanpa"];
    if (near(X3)) {
      for (let k = 0; k < 3; k++) { const t0 = AT["s3:dibeli"] + 0.5 + k * 0.25, u = clamp01((t - t0) / 0.5); if (u <= 0) continue; const q = arc([X3 + 3.5, 0.9, 0.5], [X3 + 3.2 + k * 0.7, 0.07, 1.2 + k * 0.3], u, 0.9); CN.put(q[0], q[1], q[2], u < 1 ? u * 9 : 0, k, 0, 1.1); }
      TOWER.forEach((b, i) => { const t0 = tB + (i * (tE - tB)) / TOWER.length, u = clamp01((t - t0) / 0.28); if (u <= 0) return; brick(b.x, b.y + (1 - eout(u)) * 2.2, b.z, 0.6 + 0.4 * back(u, 2), b.c);
        const v = (t - t0 - 0.15) / 0.55; if (v > 0 && v < 1) { const q = arc([b.x, b.y + 0.6, b.z], [X3 - 3.4, 3.4, 1.5], v, 1.0); TK.put(q[0], q[1], q[2], v * 6, v * 4, 0, 1); } });
      const tp = AT["s3:dibagi"] - 0.1;
      POUR.forEach((c) => { const u = (t - tp - c.d) / 0.7; if (u < 0) return; const v = clamp01(u); const q = arc([X3 + 1.5, 2.8, 0.6], [c.x, 0.07 + (c.d > 1.2 ? 0.13 : 0), c.z], v, c.lift); CN.put(q[0], q[1], q[2], v < 1 ? v * 11 : 0, c.ry, v < 1 ? v * 5 : 0, 1.1); });
    }
    { const lv = 0.9 - 0.72 * ramp(t, AT["s3:nilainya"] - 0.2, AT["s3:inflasi"] + 0.5); fill.scale.y = lv * 4.8; fill.position.y = 0.6 + (lv * 4.8) / 2; fillM.emissive.set(GRN).lerp(CC.set(PINK), ramp(t, AT["s3:turun"] - 0.3, AT["s3:inflasi"] + 0.3)); }
    { const u = clamp01((t - AT["s3:turun"]) / 0.35); arrow.visible = u > 0 && near(X3); arrow.position.set(X3 + 8.1, 3.2 - u * 0.8 + Math.sin(t * 6) * 0.15, 0.2); arrow.scale.setScalar(back(u, 2)); }

    // ===== S4: login days, place visits, exchange scale
    dayTiles.forEach((d) => { const on = t >= d.t; if (d.m.map !== (on ? d.on : d.off)) { d.m.map = on ? d.on : d.off; d.m.emissiveMap = d.m.map; } d.m.emissiveIntensity = on ? 0.7 + 0.5 * Math.exp(-(t - d.t) * 5) : 0.35; });
    if (near(X4)) {
      dayTiles.forEach((d) => { const u = (t - d.t - 0.05) / 0.6; if (u < 0 || u > 1) return; const q = arc([X4 - 5.5, 1.85, 0.0], [X4 - 3.0, 3.75, 1.6], u, 1.0); TK.put(q[0], q[1], q[2], u * 6, u * 2, 0.3, 1); });
      HOUSE.forEach((b) => brick(b.x, b.y, b.z, 1, b.c));
      VISIT.forEach((tv) => { const u = (t - tv - 0.1) / 0.6; if (u < 0 || u > 1) return; const q = arc([X4 + 1.5, 4.5, -1.2], [X4 - 1.15, 3.5, 0.7], u, 1.2); TK.put(q[0], q[1], q[2], u * 5, u * 3, 0, 1); });
      // tickets on the left pan, coin on the right
      const tm = AT["s4:menukar"] - 0.1, tc = AT["s4:Robux"];
      const tilt = 0.28 * ramp(t, tm + 0.3, tm + 0.7) - 0.28 * ramp(t, tc, tc + 0.5);
      beam.rotation.z = tilt;
      const bx = booth.position.x, bz = booth.position.z + 3.1;
      pans.forEach((P, j) => { const sd = j ? 1 : -1; P.position.set(sd * 1.35 * Math.cos(tilt), 2.65 + sd * 1.35 * Math.sin(tilt) - 0.85, 0); });
      if (t < K.s6) {
        for (let k = 0; k < 5; k++) { const t0 = tm + k * 0.12, u = clamp01((t - t0) / 0.45); if (u <= 0) continue; const pl = pans[0].position, dst = [bx + pl.x, pl.y + 0.08 + k * 0.035, bz]; const q = arc([X4 + 5.3, 2.4, 1.7], dst, u, 0.8); TK.put(q[0], u < 1 ? q[1] : dst[1], q[2], 0, u < 1 ? u * 4 : k * 0.5, 0, 0.9); }
        const u = clamp01((t - tc) / 0.35); if (u > 0) { const pr = pans[1].position; CN.put(bx + pr.x, pr.y + 0.12 + (1 - eout(u)) * 1.5, bz, 0, t, 0, 1.3 * back(u, 2)); }
      }
    }
    VIS.forEach((a, k) => { const tv = VISIT[k], u = clamp01((t - (tv - 0.95)) / 0.95); a.G.visible = u > 0 && u < 1 && near(X4); a.G.position.set(X4 + 6 - (X4 + 6 - (X4 + 1.5)) * u, 0, 2.6 - 3.2 * u); a.G.rotation.y = Math.atan2(-4.5, -3.2); runPose(a, t * 13, 0.9); });
    lamps.forEach((m, k) => { m.emissiveIntensity = t > VISIT[k] ? 3 : 0; });
    BLD.G.visible = near(X4); BLD.G.position.set(X4 - 1.15, 0, 0.7); BLD.G.rotation.y = 0.5; restPose(BLD);
    { const c = VISIT.reduce((m, tv) => Math.max(m, Math.exp(-Math.max(0, t - tv - 0.6) * 6) * (t > tv + 0.45 ? 1 : 0)), 0); BLD.armR.rotation.z = 0.3 + 2.3 * c; BLD.armL.rotation.x = -0.4; }
    booth.position.x = t < K.s6 ? X4 + 7.5 : X7 + 5.2;
    { const u = clamp01((t - AT["s7:ditutup"]) / 0.5); const b = u < 1 ? eout(u) : 1; shutter.scale.y = 0.03 + 0.97 * b + (u > 0.8 && u < 1 ? Math.sin((u - 0.8) * 30) * 0.02 : 0); }

    // ===== S5: blog plate + 30 board
    { const u = clamp01((t - AT["s5:dihentikan"]) / 0.22); stamp.visible = u > 0 && near(X5); stamp.position.set(X5 + 1.6, 5.2, -6.35); stamp.rotation.z = 0.12; stamp.scale.setScalar(1 + (1 - u) * 1.2); stamp.material.opacity = u; }
    blog.material[4].emissiveIntensity = 0.04 + 0.5 * Math.exp(-Math.max(0, t - AT["s5:terbesar"]) * 3) * (t > AT["s5:terbesar"] ? 1 : 0);
    flips.forEach((P, i) => { P.rotation.x = -Math.PI / 2 * (1 - eout(clamp01((t - AT["s5:tiga"] - i * 0.12) / 0.35))); });

    // ===== S6: three reasons
    const r1 = AT["s6:membingungkan"];
    CNF.G.visible = near(X6); CNF.G.position.set(VG[0] + 0.3, 0.45, 0.3); CNF.G.rotation.y = 0.2; restPose(CNF);
    CNF.head.rotation.y = t > r1 - 0.4 ? Math.sin(t * 4) * 0.55 : 0; CNF.head.rotation.z = t > r1 ? 0.2 : 0; CNF.armR.rotation.z = t > r1 ? 2.7 : 0; CNF.armR.rotation.x = 0;
    cfTix.visible = cfCoin.visible = near(X6);
    { const b = Math.sin(t * 2.2); cfTix.position.set(VG[0] - 1.1, 3.9 + b * 0.15, 0.4); cfTix.rotation.set(Math.PI / 2 - 0.2, 0, t * 1.5 % 6.28 * 0 + 0.2); cfTix.scale.setScalar(1.6); cfCoin.position.set(VG[0] + 1.7, 3.9 - b * 0.15, 0.4); cfCoin.rotation.set(Math.PI / 2, 0, 0); cfCoin.scale.setScalar(1.4); }
    qMarks.forEach((q, i) => { const u = clamp01((t - r1 - i * 0.3) / 0.3); q.visible = u > 0 && near(X6); q.position.set(VG[0] + 0.3 + (i - 1) * 0.9, 4.3 + i % 2 * 0.4 + Math.sin(t * 3 + i) * 0.12, 0.6); q.scale.setScalar(back(u, 2.4) * (0.8 + 0.2 * (i % 2))); q.rotation.z = (i - 1) * 0.25; });
    const r2 = AT["s6:akun"] - 0.5;
    BOTS.forEach((a, k) => { const t0 = r2 + k * 0.28, u = clamp01((t - t0) / 0.45); a.G.visible = u > 0 && near(X6); a.G.position.set(VG[1] - 1.9 + u * (0.6 + k * 0.95), 0.45, -0.5 + (k % 2) * 1.2); a.G.rotation.y = u < 1 ? Math.PI / 2 : 0.05; if (u < 1) runPose(a, t * 14, 0.8); else { restPose(a); a.armL.rotation.x = a.armR.rotation.x = -0.1 * Math.sin(t * 8 + k); a.G.position.y = 0.45 + Math.abs(Math.sin(t * 8 + k)) * 0.06; } });
    botSign.visible = t > r2 + 1.0 && near(X6); botSign.material.opacity = Math.floor(t * 6) % 3 ? 1 : 0.55;
    { const u = clamp01((t - AT["s6:absen"] + 0.1) / 0.25); xBars.forEach((b, i) => { const v = clamp01(u * 2 - i); b.visible = v > 0; b.scale.set(v, 1, 1); }); }

    // ===== S7: spend the last tickets, prizes hop out
    const sp0 = AT["s7:Pemain"] + 0.1, sp1 = AT["s7:mereka"];
    const spenders = [[H, X7 - 5.0, 1.2], [SP1, X7 - 2.2, 1.3], [SP2, X7 - 7.6, 1.5]];
    SP1.G.visible = SP2.G.visible = near(X7);
    [[SP1, X7 - 2.2, 1.3, 2.75], [SP2, X7 - 7.6, 1.5, -2.6]].forEach(([a, x, z, ry], j) => { const u = clamp01((t - (K.s7 + 0.4 + j * 0.5)) / 1.3); a.G.position.set(x + (j ? -6 : 6) * (1 - u), 0, z + 1.5 * (1 - u)); a.G.rotation.y = u < 1 ? (j ? Math.PI / 2 : -Math.PI / 2) : ry; if (u < 1) runPose(a, t * 12); else restPose(a); });
    if (near(X7)) {
      spenders.forEach(([a, x, z], j) => { for (let k = 0; k < 6; k++) { const t0 = sp0 + j * 0.35 + k * 0.4, u = (t - t0) / 0.5; if (u < 0 || u > 1) continue; const q = arc([x, 2.9, z], [X7 - 4 + (x - (X7 - 4)) * 0.5, 2.25, -1.3], u, 0.7); TK.put(q[0], q[1], q[2], u * 4, u * 6, 0, 1); } });
    }
    PRIZE.forEach((pz, i) => { pz.G.visible = near(X7); let [x, y, z] = pz.home; if (i < 3) { const tgt = spenders[[1, 0, 2][i]]; const t0 = sp0 + 1.4 + i * 0.75, u = clamp01((t - t0) / 0.6); if (u > 0) { const q = arc(pz.home, [tgt[1], 2.18, -1.1], u, 1.2); [x, y, z] = q; } } pz.G.position.set(x, y, z); pz.G.rotation.y = Math.sin(t + i) * 0.2; });

    // ===== S8: tickets blow away, coins stay
    if (near(X8)) {
      const tb = AT["s8:Robux"] - 0.2;
      LEFT8.forEach((d, i) => { const u = (t - tb - d.d) / (1.5 * d.sp); let x = d.onPed ? X8 - 3.2 + (i % 3 - 1) * 0.3 : d.x, y = d.onPed ? 2.25 + Math.floor(i / 3) * 0.06 + (i % 2) * 0.03 : 0.04, z = d.onPed ? -0.6 + (i % 2) * 0.2 : d.z, s = 1, rx = 0, rz = 0;
        if (u > 0) { x += u * 9 + u * u * 6; y += u * 4.5 + Math.sin(u * 9 + i) * 0.5; z -= u * 1.5; rx = u * 9; rz = u * 7; s = 1 - clamp01((u - 0.4) / 0.6); }
        if (u < 1.05) TK.put(x, y, z, rx, d.ry + u * 3, rz, s); });
      for (let k = 0; k < 12; k++) CN.put(X8 + 3.0, 2.3 + k * 0.135, -0.6, 0, k * 0.37, 0, 1.4);
    }
    s8Coin.visible = near(X8); s8Coin.position.set(X8 + 3.0, 5.3 + Math.sin(t * 2) * 0.15, -0.6); s8Coin.rotation.set(Math.PI / 2, 0, 0); s8Coin.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), t * 1.4); s8Coin.scale.setScalar(2.6);
    { const u = clamp01((t - AT["s8:Kalau"]) / 0.4); s8q.visible = u > 0; s8q.position.set(X8 - 0.6, 5.1 + Math.sin(t * 3) * 0.12, 1.9); s8q.scale.setScalar(back(u, 2.2)); s8q.rotation.z = 0.15; }

    // ===== hero
    const h = heroAt(t);
    H.G.position.set(h.x, 0, h.z); H.G.rotation.y = h.ry; restPose(H); H.head.rotation.set(0, 0, 0);
    if (h.run) { runPose(H, t * 14, 1.1); H.G.position.y = Math.abs(Math.sin(t * 14)) * 0.18; }
    else if (h.i === 0) { const c = Math.sin(t * 8) * 0.12; H.armL.rotation.x = H.armR.rotation.x = -2.75 + c; H.armL.rotation.z = -0.2; H.armR.rotation.z = 0.2; H.G.position.y = Math.max(0, Math.sin(((t - 0.5) / 0.42) * Math.PI)) * 0.25 * (t > 1.0 ? 1 : 0); }
    else if (h.i === 1) { if (t < AT["s2:Tickets"] + 1.2) { H.armR.rotation.z = 2.6 + Math.sin(t * 9) * 0.35; } H.head.rotation.y = t > AT["s2:David"] - 0.6 ? 0.4 * Math.sin(t * 1.2) : 0; }
    else if (h.i === 2) { if (t > tB - 0.2 && t < tE + 0.2) { const s = Math.sin(t * 11); H.armL.rotation.x = -1.3 + s * 0.4; H.armR.rotation.x = -1.3 - s * 0.4; } }
    else if (h.i === 3) { if (t > AT["s4:Tix"] - 0.3 && t < AT["s4:harian"] + 0.8) { H.armL.rotation.x = H.armR.rotation.x = -2.6 + Math.sin(t * 9) * 0.15; H.G.position.y = Math.abs(Math.sin(t * 11.6)) * 0.18; } }
    else if (h.i === 4) { const tm = AT["s4:menukar"] - 0.1; if (t > tm - 0.3 && t < tm + 0.9) H.armR.rotation.x = -1.6 + Math.sin(t * 12) * 0.3; if (t > AT["s4:Robux"] + 0.3) { H.armL.rotation.z = -2.6 + Math.sin(t * 8) * 0.3; } }
    else if (h.i === 5) { H.head.rotation.x = -0.35; H.G.rotation.y = h.ry + Math.sin(t * 0.8) * 0.15; }
    else if (h.i === 6) { H.head.rotation.y = Math.sin(t * 1.3) * 0.4; }
    else if (h.i === 7) { if (t > sp0 - 0.2 && t < sp0 + 2.6) H.armR.rotation.x = -1.8 + Math.sin(t * 7.8) * 0.6; }
    else if (h.i === 8) { H.armR.rotation.x = t < AT["s8:Kalau"] ? -2.6 : -1.45; H.armR.rotation.z = 0.15; if (t > AT["s8:Kalau"] - 0.2) H.armL.rotation.z = -2.6 + Math.sin(t * 8) * 0.35; }
    [SP1, SP2].forEach((a, j) => { if (t > sp0 - 0.2 + j * 0.35 && t < sp0 + 2.6 + j * 0.35) a.armR.rotation.x = -1.8 + Math.sin(t * 7.8 + j) * 0.6; });
    heroCoin.visible = h.i === 8;
    if (heroCoin.visible) { H.G.updateMatrixWorld(true); H.armR.localToWorld(V.set(0, -2.15, 0.35)); heroCoin.position.copy(V); heroCoin.rotation.set(Math.PI / 2, 0, Math.sin(t * 2) * 0.2); heroCoin.scale.setScalar(1.3); }

    TK.end(); CN.end(); BR.end(); ST.end();
    comp.render();
  };
}
