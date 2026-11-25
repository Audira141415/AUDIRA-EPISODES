// NINTENDO 1889: a woodblock-print Kyoto laid out as one long emaki hand-scroll. Every subject is a cut washi sheet
// (flat ink, carved key-lines, paper drop shadows) standing in a paper diorama; golden suyari-gasumi clouds divide the
// scenes and the camera glides along the scroll. Original drawings only: no logos, no characters from any company.
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, stage } from "./lib3d.js";

const P = { pd: "#0F2747", pr: "#1F4A7A", pl: "#5D86B0", iw: "#9DB5CC", ve: "#D9472B", vd: "#A8301C", oc: "#D9A441", op: "#EED9A8", kl: "#1B1A1F", fo: "#F6F0E1", wa: "#EFE3C8", ws: "#C9B892", sk: "#EAD5AE", gr: "#4E7A52", grd: "#2C4F37", wd: "#7A4E2C", wl: "#B07A47", pk: "#E8A3A6", gy: "#7B7F86" };
const SERIF = "Georgia,'Times New Roman',serif";
const X = { A: 0, B: 26, C: 52, D: 78, E: 104, F: 130, G: 156, H: 182 };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe7dcc4, exp: 1, bloom: [0, 0.1, 1] });
  r.toneMapping = THREE.NoToneMapping; bp.enabled = false;
  scene.add(new THREE.AmbientLight(0xfff6e6, 1.9));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.25); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 18, bottom: -10, near: 1, far: 80 }); key.shadow.bias = -0.0008; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rnd = mulberry(4889);

  // ---------- canvas helpers ----------
  const tex = (w, h, draw, seed = 1, grain = 1) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
    g.lineJoin = g.lineCap = "round"; draw(g, w, h);
    if (grain) washi(g, w, h, seed, grain);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.c = c; return t;
  };
  function washi(g, w, h, seed, s) {
    const rr = mulberry(seed); g.save(); g.globalCompositeOperation = "source-atop";
    for (let i = 0; i < (w * h) / 1100; i++) { g.strokeStyle = `rgba(255,250,235,${0.07 * s})`; g.lineWidth = 0.6 + rr(); const x = rr() * w, y = rr() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rr() - 0.5) * 30, y + (rr() - 0.5) * 30, x + (rr() - 0.5) * 50, y + (rr() - 0.5) * 50); g.stroke(); }
    for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(20,20,40,${0.03 * s * rr()})`; g.fillRect(0, y, w, 1); }
    g.restore();
  }
  const ink = (g, fill, lw = 5, col = P.kl) => { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.stroke(); } };
  const rect = (g, x, y, w, h, fill, lw = 5) => { g.beginPath(); g.rect(x, y, w, h); ink(g, fill, lw); };
  const circ = (g, x, y, rad, fill, lw = 5) => { g.beginPath(); g.arc(x, y, rad, 0, 7); ink(g, fill, lw); };
  const txt = (g, s, x, y, size, col, weight = 700, align = "center", font = SERIF) => { g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
  const fitTxt = (g, s, x, y, size, col, maxW) => { let z = size; g.font = `700 ${z}px ${SERIF}`; while (g.measureText(s).width > maxW && z > 10) { z -= 2; g.font = `700 ${z}px ${SERIF}`; } txt(g, s, x, y, z, col); };

  // ---------- sheet: a cut washi card standing in the diorama ----------
  const sheet = (t, w, h, o = {}) => {
    const geo = new THREE.PlaneGeometry(w, h); geo.translate(w * (0.5 - (o.ax ?? 0.5)), h * (0.5 - (o.ay ?? 0)), 0);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.96, metalness: 0, alphaTest: 0.5, side: THREE.DoubleSide }));
    m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
    m.castShadow = o.cast ?? true; m.receiveShadow = true;
    m.position.set(o.x || 0, o.y || 0, o.z || 0); (o.p || scene).add(m); return m;
  };
  const solid = (w, h, d, map, o = {}) => {
    const mats = Array.isArray(map) ? map.map((x) => (x instanceof THREE.Texture ? new THREE.MeshStandardMaterial({ map: x, roughness: 0.95 }) : new THREE.MeshStandardMaterial({ color: x, roughness: 0.95 }))) : new THREE.MeshStandardMaterial(map instanceof THREE.Texture ? { map, roughness: 0.95 } : { color: map, roughness: 0.95 });
    const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, mats); m.castShadow = m.receiveShadow = true; m.position.set(o.x || 0, o.y || 0, o.z || 0); (o.p || scene).add(m); return m;
  };
  const woodT = tex(256, 256, (g, w, h) => { g.fillStyle = P.wl; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.strokeStyle = "rgba(60,30,10,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * 10 + 3); g.bezierCurveTo(80, i * 10 + rnd() * 8, 170, i * 10 - rnd() * 8, 256, i * 10 + 4); g.stroke(); } g.lineWidth = 10; g.strokeStyle = P.kl; g.strokeRect(0, 0, w, h); }, 5);

  // ---------- emaki ground, sky, hills, golden clouds ----------
  const floorT = tex(1024, 256, (g, w, h) => { g.fillStyle = P.op; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(160,120,60,${0.12 + rnd() * 0.12})`; g.lineWidth = 2; g.beginPath(); const y = rnd() * h; g.moveTo(0, y); g.bezierCurveTo(300, y + 10, 700, y - 10, w, y + 4); g.stroke(); } }, 7);
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(14, 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 90), new THREE.MeshStandardMaterial({ map: floorT, roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(90, 0, 25); floor.receiveShadow = true; scene.add(floor);

  const skies = [
    [X.A, [P.pd, P.pr, P.iw, P.op, "#F2C98A"], 1],
    [X.B, [P.pr, P.pl, P.iw, P.op, "#F2C98A"], 0],
    [X.C, [P.pr, P.iw, P.op, "#F4D9A2", "#F2C98A"], 0],
    [X.D, [P.pl, P.iw, P.op, "#F6E2B8", "#F2C98A"], 0],
    [X.E, ["#3B1E2E", P.vd, "#C9714A", P.oc, P.op], 2],
    [X.F, [P.pr, P.pl, P.iw, P.op, "#F2C98A"], 0],
    [X.G, ["#0A1A33", P.pd, P.pr, P.pl, P.iw], 3],
    [X.H, [P.pr, P.iw, P.op, "#F2C98A", P.oc], 1],
  ];
  skies.forEach(([x, st, extra], i) => {
    const t = tex(512, 1024, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); st.forEach((c, k) => gr.addColorStop([0, 0.22, 0.52, 0.78, 1][k], c)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      if (extra === 3) { for (let k = 0; k < 60; k++) circ(g, rnd() * w, rnd() * h * 0.55, 1 + rnd() * 2, "rgba(246,240,225,.8)", 0); }
    }, 11 + i, 1.3);
    sheet(t, 27, 46, { x, y: -6, z: -16, cast: false });
  });
  const sunT = tex(256, 256, (g) => { circ(g, 128, 128, 116, P.ve, 7); }, 9);
  const moonT = tex(256, 256, (g) => { circ(g, 128, 128, 116, P.fo, 6); g.beginPath(); g.arc(150, 110, 90, 0, 7); g.fillStyle = "rgba(201,184,146,.35)"; g.fill(); }, 19);
  const sunA = sheet(sunT, 5.2, 5.2, { x: X.A + 3.2, y: 6.6, z: -14, cast: false, ay: 0.5 });
  const sunB = sheet(sunT, 4.4, 4.4, { x: X.B + 2.6, y: 13.5, z: -14, cast: false, ay: 0.5 });
  sheet(sunT, 3.6, 3.6, { x: X.E - 3.2, y: 7.4, z: -14, cast: false, ay: 0.5 });
  sheet(moonT, 3.4, 3.4, { x: X.G + 3, y: 8.2, z: -14, cast: false, ay: 0.5 });
  sheet(sunT, 3.2, 3.2, { x: X.H - 3.4, y: 7.6, z: -14, cast: false, ay: 0.5 });
  const cloudT = (seed, col) => tex(1024, 170, (g) => { const rr = mulberry(seed); g.beginPath(); g.moveTo(60, 118); for (let x = 60; x <= 964; x += 70) g.quadraticCurveTo(x + 35, 44 - rr() * 22, x + 70, 86 + rr() * 10); g.quadraticCurveTo(1010, 106, 964, 136); g.lineTo(60, 136); g.quadraticCurveTo(14, 126, 60, 118); ink(g, col, 4); }, seed + 4);
  const clouds = [];
  const cT = [cloudT(3, P.op), cloudT(7, P.op), cloudT(13, "#C9B892")];
  for (let i = 0; i < 26; i++) { const st = Math.floor(i / 3.25), m = sheet(cT[i % 3], 8 + rnd() * 5, 1.4, { x: st * 26 - 9 + rnd() * 18, y: 5 + rnd() * 10, z: -13 + rnd() * 3, cast: false, ay: 0.5 }); clouds.push({ m, x: m.position.x, sp: 0.08 + rnd() * 0.12 }); }
  const hillT = (seed, c1, c2) => tex(1024, 380, (g, w, h) => { const rr = mulberry(seed); g.beginPath(); g.moveTo(0, h); g.lineTo(0, 220); let x = 0; while (x < w) { const s = 140 + rr() * 220, top = 40 + rr() * 140; g.quadraticCurveTo(x + s / 2, top - 60, x + s, 160 + rr() * 80); x += s; } g.lineTo(w, h); g.closePath(); const gr = g.createLinearGradient(0, 40, 0, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); ink(g, gr, 5); g.save(); g.clip(); g.strokeStyle = "rgba(15,39,71,.35)"; g.lineWidth = 3; for (let i = 0; i < 26; i++) { const xx = rr() * w; g.beginPath(); g.moveTo(xx, 120 + rr() * 60); g.quadraticCurveTo(xx - 30, 260, xx - 60, h); g.stroke(); } g.restore(); }, seed);
  const hT = [hillT(31, "#5E7F6A", P.pd), hillT(37, P.pl, P.pr), hillT(41, "#6E5470", P.pd)];
  for (let i = 0; i < 8; i++) { sheet(hT[i % 2], 28, 10.4, { x: i * 26 + 3, y: -1.2, z: -11.5, cast: false }); if (i !== 1 && i !== 5) sheet(hT[2 - (i % 2) * 2 === 0 ? 2 : 0], 24, 7, { x: i * 26 - 4, y: -1, z: -9, cast: false }); }
  // golden suyari-gasumi: tall dividers between scenes and low bands in the foreground
  const gasT = (seed) => tex(1024, 220, (g, w, h) => { const rr = mulberry(seed); g.beginPath(); g.moveTo(40, 120); for (let x = 40; x < w - 60; x += 90) g.quadraticCurveTo(x + 45, 40 - rr() * 30, x + 90, 100 + rr() * 16); g.quadraticCurveTo(w, 140, w - 60, 180); for (let x = w - 60; x > 40; x -= 110) g.quadraticCurveTo(x - 55, 210 + rr() * 8, x - 110, 182); g.quadraticCurveTo(0, 160, 40, 120); const gr = g.createLinearGradient(0, 30, 0, 210); gr.addColorStop(0, "#F3D98F"); gr.addColorStop(1, P.oc); ink(g, gr, 5); g.save(); g.clip(); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,236,170,${0.4 + rr() * 0.5})`; g.fillRect(rr() * w, rr() * h, 3 + rr() * 6, 3 + rr() * 6); } g.restore(); }, seed);
  const gT = [gasT(51), gasT(57), gasT(63)];
  const fog = [];
  for (let i = 0; i < 8; i++) {
    const sx = i * 26 + 13;
    sheet(gT[i % 3], 9, 2.2, { x: sx, y: 9 + (i % 2) * 2, z: -6, cast: false, ay: 0.5 });
    sheet(gT[(i + 1) % 3], 8, 1.9, { x: sx + 1.4, y: 3.2 + (i % 3), z: -5, cast: false, ay: 0.5 });
    for (let k = 0; k < 3; k++) { const m = sheet(gT[(i + k) % 3], 13, 2.2, { x: i * 26 - 6 + k * 10, y: 0.15 - k * 0.35, z: 10 + k * 1.3, cast: false, ay: 0.5 }); fog.push({ m, x: m.position.x, k }); }
  }

  // ---------- people: faceless woodblock figures ----------
  const FIG = {
    edo: { robe: P.pr, trim: P.pd, obi: P.oc, hair: "edo" }, buyer: { robe: P.ve, trim: P.vd, obi: P.op, hair: "bun" }, buyer2: { robe: "#4E7A52", trim: P.grd, obi: P.oc, hair: "edo" },
    suit: { suit: "#2B2F3A", hair: "side" }, work: { robe: P.pl, trim: P.pr, hair: "cap", work: 1 }, scholar: { suit: "#5B4A3A", hair: "side", book: 1 }, salary: { suit: "#33405A", hair: "side" },
  };
  const figT = {};
  const figTex = (k) => figT[k] || (figT[k] = tex(256, 512, (g) => {
    const f = FIG[k];
    if (f.suit) {
      rect(g, 94, 330, 32, 165, "#1E2026", 5); rect(g, 132, 330, 32, 165, "#1E2026", 5);
      g.beginPath(); g.moveTo(78, 176); g.lineTo(180, 176); g.lineTo(172, 350); g.lineTo(86, 350); g.closePath(); ink(g, f.suit, 6);
      g.beginPath(); g.moveTo(110, 176); g.lineTo(129, 250); g.lineTo(148, 176); g.closePath(); ink(g, P.fo, 4);
      g.beginPath(); g.moveTo(125, 186); g.lineTo(133, 186); g.lineTo(136, 240); g.lineTo(129, 252); g.lineTo(122, 240); g.closePath(); ink(g, P.ve, 3);
      rect(g, 90, 492, 38, 14, P.kl, 3); rect(g, 130, 492, 38, 14, P.kl, 3);
      if (f.book) { rect(g, 148, 250, 52, 66, P.ve, 4); rect(g, 154, 258, 40, 6, P.op, 0); }
    } else {
      g.beginPath(); g.moveTo(70, 178); g.lineTo(186, 178); g.lineTo(f.work ? 176 : 168, 492); g.lineTo(f.work ? 80 : 88, 492); g.closePath(); ink(g, f.robe, 6);
      g.save(); g.clip(); g.strokeStyle = f.trim; g.lineWidth = 4; for (let y = 320; y < 500; y += 22) { g.beginPath(); g.moveTo(60, y); g.lineTo(200, y + 10); g.stroke(); } g.restore();
      if (f.work) { rect(g, 124, 300, 8, 192, f.trim, 0); rect(g, 96, 210, 28, 26, f.trim, 3); }
      else { g.beginPath(); g.moveTo(106, 178); g.lineTo(128, 262); g.lineTo(150, 178); g.closePath(); ink(g, P.fo, 4); rect(g, 82, 262, 92, 36, f.obi, 5); }
      rect(g, 96, 490, 26, 16, P.kl, 3); rect(g, 134, 490, 26, 16, P.kl, 3);
    }
    circ(g, 128, 104, 46, P.sk, 6); rect(g, 116, 146, 24, 26, P.sk, 0);
    g.fillStyle = P.kl;
    if (f.hair === "edo") { g.beginPath(); g.arc(128, 100, 48, Math.PI * 1.05, Math.PI * 1.95); g.fill(); rect(g, 118, 38, 20, 26, P.kl, 0); }
    if (f.hair === "bun") { g.beginPath(); g.arc(128, 98, 49, Math.PI * 0.95, Math.PI * 2.05); g.fill(); circ(g, 128, 46, 22, P.kl, 0); rect(g, 92, 40, 72, 6, P.oc, 0); }
    if (f.hair === "side") { g.beginPath(); g.arc(128, 100, 49, Math.PI * 1.0, Math.PI * 2.0); g.fill(); g.beginPath(); g.ellipse(112, 70, 30, 14, -0.3, 0, 7); g.fill(); }
    if (f.hair === "cap") { g.beginPath(); g.arc(128, 94, 50, Math.PI, Math.PI * 2); ink(g, P.pr, 5); rect(g, 128, 88, 70, 12, P.pd, 4); }
  }, 70 + k.length));
  const armTex = (k) => tex(64, 240, (g) => {
    const f = FIG[k], c = f.suit || f.robe;
    g.beginPath(); if (f.suit || f.work) g.rect(18, 4, 28, 168); else { g.moveTo(10, 4); g.lineTo(54, 4); g.lineTo(54, 150); g.quadraticCurveTo(32, 176, 10, 150); g.closePath(); } ink(g, c, 5);
    circ(g, 32, 192, 17, P.sk, 4);
  }, 3, 0.6);
  const plateTex = (s, sub) => tex(640, sub ? 170 : 120, (g, w, h) => { rect(g, 6, 6, w - 12, h - 12, P.wa, 6); g.strokeStyle = P.ve; g.lineWidth = 4; g.strokeRect(18, 18, w - 36, h - 36); fitTxt(g, s, w / 2, sub ? 62 : h / 2 + 2, 52, P.pd, w - 70); if (sub) txt(g, sub, w / 2, 122, 32, P.vd, 700); }, 91);
  const person = (k, x, z, name, sub) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    const body = sheet(figTex(k), 1.5, 3, { p: G });
    const aT = armTex(k), mk = (sx, dz) => { const pv = new THREE.Group(); pv.position.set(sx, 1.96, dz); G.add(pv); sheet(aT, 0.375, 1.41, { p: pv, ay: 1 }); return pv; };
    const armR = mk(0.36, 0.03), armL = mk(-0.36, -0.03);
    let plate = null; if (name) { plate = sheet(plateTex(name, sub), 2.0, sub ? 0.61 : 0.43, { p: G, y: 3.25, z: 0.05, cast: false }); }
    return { G, body, armR, armL, plate };
  };

  // ---------- hanafuda: my own flower cards ----------
  const cardFace = (kind) => tex(200, 320, (g, w, h) => {
    g.fillStyle = P.kl; g.beginPath(); g.roundRect(0, 0, w, h, 14); g.fill();
    g.save(); g.beginPath(); g.roundRect(9, 9, w - 18, h - 18, 8); g.clip();
    if (kind === 0) { g.fillStyle = P.fo; g.fillRect(0, 0, w, h); circ(g, 140, 80, 42, P.ve, 0); rect(g, 92, 170, 16, 140, P.wd, 3); [[100, 120, 70], [70, 170, 56], [130, 175, 56], [100, 220, 44]].forEach(([x, y, rr]) => { g.beginPath(); g.ellipse(x, y, rr, rr * 0.42, 0, 0, 7); ink(g, P.grd, 4); }); }
    if (kind === 1) { g.fillStyle = P.ve; g.fillRect(0, 0, w, h); g.strokeStyle = P.kl; g.lineWidth = 10; g.beginPath(); g.moveTo(10, 300); g.bezierCurveTo(70, 220, 60, 140, 170, 60); g.stroke(); [[60, 220], [95, 150], [140, 100], [40, 270], [120, 190]].forEach(([x, y]) => { for (let p = 0; p < 5; p++) circ(g, x + Math.cos(p * 1.26) * 13, y + Math.sin(p * 1.26) * 13, 10, P.fo, 2); circ(g, x, y, 6, P.oc, 0); }); }
    if (kind === 2) { g.fillStyle = P.op; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { const x = 20 + ((i * 53) % 160), y = 20 + ((i * 37) % 170); for (let p = 0; p < 5; p++) circ(g, x + Math.cos(p * 1.26) * 9, y + Math.sin(p * 1.26) * 9, 7, P.pk, 1.5); } rect(g, 0, 230, w, 90, P.ve, 4); for (let x = 20; x < w; x += 40) circ(g, x, 275, 12, P.fo, 3); }
    if (kind === 3) { g.fillStyle = P.ve; g.fillRect(0, 0, w, h); circ(g, 100, 120, 70, P.fo, 5); g.beginPath(); g.moveTo(0, 230); g.quadraticCurveTo(100, 170, 200, 220); g.lineTo(200, 320); g.lineTo(0, 320); ink(g, P.kl, 0); g.strokeStyle = P.op; g.lineWidth = 3; for (let x = 10; x < w; x += 18) { g.beginPath(); g.moveTo(x, 320); g.quadraticCurveTo(x + 6, 260, x + 16, 220 + (x % 30)); g.stroke(); } }
    if (kind === 4) { g.fillStyle = P.fo; g.fillRect(0, 0, w, h); [[60, 80], [140, 110], [90, 170], [150, 220], [50, 240]].forEach(([x, y]) => { g.beginPath(); for (let p = 0; p < 10; p++) { const a = p * 0.628 - 1.57, rr = p % 2 ? 14 : 34; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); ink(g, "#D8642A", 3); }); rect(g, 0, 270, w, 50, P.pr, 3); }
    g.restore();
  }, 101, 0.5);
  const cardBack = tex(200, 320, (g, w, h) => { g.fillStyle = P.kl; g.beginPath(); g.roundRect(0, 0, w, h, 14); g.fill(); g.strokeStyle = P.vd; g.lineWidth = 6; g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 8); g.stroke(); }, 107, 0.4);
  const faces = [0, 1, 2, 3, 4].map(cardFace);
  const card = (kind, s = 1) => { const m = solid(0.9 * s, 1.44 * s, 0.03, [P.kl, P.kl, P.kl, P.kl, faces[kind % 5], cardBack]); m.geometry.translate(0, -0.72 * s, 0); return m; };

  const sealTex = (s, col = P.ve, size = 120) => tex(400, 400, (g, w, h) => {
    const rr = mulberry(s.length * 7); g.beginPath(); g.moveTo(24 + rr() * 8, 24); g.lineTo(w - 24, 20 + rr() * 8); g.lineTo(w - 20 - rr() * 8, h - 24); g.lineTo(22, h - 22 - rr() * 8); g.closePath(); g.fillStyle = col; g.fill();
    g.strokeStyle = P.fo; g.lineWidth = 12; g.strokeRect(52, 52, w - 104, h - 104); fitTxt(g, s, w / 2, h / 2 + 4, size, P.fo, w - 130);
    g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + rr() * 0.6})`; g.fillRect(rr() * w, rr() * h, 2 + rr() * 7, 2 + rr() * 5); }
  }, 0);

  // ================= STATION A: the card workshop, 1889 =================
  const shopT = tex(1024, 820, (g, w, h) => {
    rect(g, 70, 300, 884, 520, "#E6CFA0", 6);
    for (let x = 70; x <= 954; x += 147) rect(g, x, 300, 18, 520, P.wd, 4);
    rect(g, 130, 470, 300, 250, P.wl, 5); for (let x = 140; x < 430; x += 22) rect(g, x, 470, 8, 250, P.wd, 0);
    rect(g, 600, 440, 300, 380, "#3A2A20", 5);
    g.beginPath(); g.moveTo(0, 310); g.lineTo(80, 150); g.lineTo(944, 150); g.lineTo(1024, 310); g.closePath(); ink(g, "#4A5566", 6);
    g.save(); g.clip(); g.strokeStyle = "rgba(20,24,34,.8)"; g.lineWidth = 4; for (let x = -40; x < w + 40; x += 34) { g.beginPath(); g.moveTo(x, 150); g.lineTo(x + (x - 512) * 0.18, 310); g.stroke(); } for (let y = 190; y < 310; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.restore();
    rect(g, 60, 136, 904, 24, "#2F3742", 5); rect(g, 40, 300, 944, 22, "#2F3742", 5);
    g.beginPath(); g.moveTo(110, 150); g.lineTo(180, 40); g.lineTo(844, 40); g.lineTo(914, 150); g.closePath(); ink(g, "#4A5566", 6);
  }, 121);
  const shop = sheet(shopT, 7.6, 6.1, { x: X.A + 0.3, z: -2.6 });
  const norenT = (word, col, mark) => tex(512, 300, (g, w, h) => { const n = 4; for (let i = 0; i < n; i++) { rect(g, 8 + i * 124, 30, 116, 262, col, 5); } rect(g, 0, 10, w, 26, P.wd, 5); if (word) { const L = word.split(""); L.forEach((c, i) => txt(g, c, 40 + i * (440 / (L.length - 1)), 170, 74, P.fo)); } if (mark) { circ(g, 256, 160, 74, P.fo, 0); for (let p = 0; p < 5; p++) circ(g, 256 + Math.cos(p * 1.26) * 34, 160 + Math.sin(p * 1.26) * 34, 26, P.ve, 0); circ(g, 256, 160, 16, P.oc, 0); } }, 131);
  sheet(norenT(null, P.pd, 1), 2.2, 1.3, { x: X.A + 1.4, y: 2.0, z: -2.45 });
  const boardT = tex(512, 220, (g, w, h) => { rect(g, 10, 10, w - 20, h - 20, P.wd, 8); rect(g, 30, 30, w - 60, h - 60, "#C99A5E", 4); txt(g, "1889", w / 2, h / 2 + 6, 128, P.kl); }, 133);
  const board = new THREE.Group(); board.position.set(X.A + 0.3, 4.2, -2.0); scene.add(board); sheet(boardT, 2.6, 1.12, { p: board, ay: 1 });
  // the neighbour: a shop with the AUDIRA noren
  const nbT = tex(512, 640, (g, w, h) => { rect(g, 30, 220, 452, 420, "#DCC59A", 6); for (let x = 30; x <= 482; x += 113) rect(g, x, 220, 14, 420, P.wd, 4); g.beginPath(); g.moveTo(0, 230); g.lineTo(60, 110); g.lineTo(452, 110); g.lineTo(512, 230); g.closePath(); ink(g, "#55606F", 6); g.save(); g.clip(); g.strokeStyle = "rgba(20,24,34,.8)"; g.lineWidth = 4; for (let x = 0; x < w; x += 30) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x, 230); g.stroke(); } g.restore(); rect(g, 20, 220, 472, 18, "#2F3742", 5); }, 135);
  sheet(nbT, 4.2, 5.2, { x: X.A - 5.6, z: -4.2 });
  sheet(norenT("AUDIRA", P.ve), 2.4, 1.4, { x: X.A - 5.6, y: 2.1, z: -4.05 });
  sheet(nbT, 4.2, 5.2, { x: X.A + 6.4, z: -4.6 });
  // lanterns
  const lanT = tex(128, 200, (g) => { g.beginPath(); g.ellipse(64, 100, 50, 80, 0, 0, 7); ink(g, P.ve, 5); for (let y = 50; y < 160; y += 18) { g.beginPath(); g.moveTo(20, y); g.quadraticCurveTo(64, y + 6, 108, y); g.strokeStyle = P.vd; g.lineWidth = 3; g.stroke(); } rect(g, 40, 10, 48, 14, P.kl, 0); rect(g, 40, 176, 48, 14, P.kl, 0); }, 137);
  const lanterns = [[X.A - 3.0, 3.1, -2.2], [X.A + 3.7, 3.1, -2.2], [X.F + 3.4, 3.4, -2.4], [X.G - 2.8, 3.6, -1.6]].map(([x, y, z]) => { const L = new THREE.Group(); L.position.set(x, y + 0.6, z); scene.add(L); sheet(lanT, 0.6, 0.94, { p: L, ay: 1 }); return L; });
  // hero card fan
  const fan = new THREE.Group(); fan.position.set(X.A - 0.4, 0.15, 2.6); scene.add(fan);
  const fanCards = [0, 1, 2, 3, 4].map((k) => { const pv = new THREE.Group(); fan.add(pv); const c = card(k, 1.15); c.position.set(0, 1.62, 0); pv.add(c); return pv; });
  const crafterA = person("edo", X.A + 2.6, 0.4);
  const bundleT = tex(200, 140, (g) => { rect(g, 20, 30, 160, 90, P.kl, 4); rect(g, 30, 20, 140, 90, P.ve, 4); rect(g, 86, 16, 18, 104, P.oc, 3); }, 139);
  const bundle = sheet(bundleT, 0.7, 0.5, { p: crafterA.G, x: 0.62, y: 1.0, z: 0.08 });

  // ================= STATION B: printing hanafuda by hand =================
  const roomT = tex(1024, 700, (g, w, h) => {
    rect(g, 10, 10, w - 20, h - 20, "#D9C49A", 6);
    for (let k = 0; k < 3; k++) { const x0 = 60 + k * 310; rect(g, x0, 70, 260, 420, P.fo, 6); g.strokeStyle = P.wd; g.lineWidth = 5; for (let x = x0 + 52; x < x0 + 260; x += 52) { g.beginPath(); g.moveTo(x, 70); g.lineTo(x, 490); g.stroke(); } for (let y = 140; y < 490; y += 70) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 260, y); g.stroke(); } }
    rect(g, 0, 500, w, 30, P.wd, 5); rect(g, 0, 0, w, 40, P.wd, 5);
    for (let k = 0; k < 7; k++) rect(g, 70 + k * 130, 560, 100, 110, ["#C4504A", P.pr, P.oc, P.gr][k % 4], 4);
  }, 141);
  sheet(roomT, 11, 7.5, { x: X.B, z: -3.4 });
  const bench = solid(4.6, 1.2, 1.6, woodT, { x: X.B + 0.6, z: 0 });
  const crafterB = person("edo", X.B - 2.1, 0.2, "FUSAJIRO YAMAUCHI");
  // press block on the bench
  const press = solid(0.9, 0.42, 0.9, woodT, { x: X.B - 0.8, y: 1.2, z: 0.1 });
  const pressPad = solid(1.1, 0.04, 1.0, P.ve, { x: X.B - 0.8, y: 1.2, z: 0.1 });
  const stack = []; for (let i = 0; i < 18; i++) { const c = solid(0.62, 0.035, 0.98, i % 2 ? P.kl : "#23201E", { x: X.B + 1.3 + (rnd() - 0.5) * 0.06, y: 1.2 + i * 0.04, z: 0.1 }); c.rotation.y = (rnd() - 0.5) * 0.2; stack.push(c); }
  // drying line of fresh cards
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 9, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a20 })); line.rotation.z = Math.PI / 2; line.position.set(X.B, 4.7, -1.2); scene.add(line);
  const hung = []; for (let i = 0; i < 8; i++) { const pv = new THREE.Group(); pv.position.set(X.B - 3.6 + i * 1.03, 4.7, -1.2); scene.add(pv); const c = card(i, 0.7); c.position.y = -0.6; pv.add(c); hung.push(pv); }
  // the sky above the workshop: "leave luck to heaven?"
  const petals = []; for (let i = 0; i < 9; i++) { const pv = new THREE.Group(); scene.add(pv); const c = card(i + 2, 0.8); pv.add(c); petals.push({ pv, x: X.B - 3.4 + i * 0.85 + rnd() * 0.4, ph: rnd() * 6.28, sp: 0.6 + rnd() * 0.5, z: -1 + rnd() * 2 }); }

  // ================= STATION C: the 1959 character cards sell =================
  const stallT = tex(1024, 820, (g, w, h) => {
    rect(g, 60, 120, 40, 700, P.wd, 5); rect(g, 924, 120, 40, 700, P.wd, 5);
    g.beginPath(); g.moveTo(10, 220); g.lineTo(80, 80); g.lineTo(944, 80); g.lineTo(1014, 220); g.closePath(); ink(g, P.op, 6);
    g.save(); g.clip(); for (let x = 0; x < w; x += 120) rect(g, x, 80, 60, 140, P.ve, 0); g.restore();
    g.beginPath(); g.moveTo(10, 220); for (let x = 10; x < 1014; x += 63) g.quadraticCurveTo(x + 31, 262, x + 63, 220); ink(g, P.ve, 5);
  }, 151);
  sheet(stallT, 9, 7.2, { x: X.C, z: -3.2 });
  const counter = solid(6.2, 1.3, 1.4, woodT, { x: X.C, z: -1.1 });
  const boxFront = tex(512, 360, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.ve, 8); rect(g, 30, 30, w - 60, h - 60, P.fo, 5); fitTxt(g, "KARTU KARAKTER", w / 2, 110, 60, P.pd, w - 90); txt(g, "1959", w / 2, 220, 110, P.ve); for (let k = 0; k < 5; k++) circ(g, 120 + k * 68, 300, 18, [P.pr, P.oc, P.ve, P.gr, P.pr][k], 4); }, 153);
  const boxTop = tex(256, 256, (g, w, h) => { rect(g, 6, 6, w - 12, h - 12, P.ve, 8); rect(g, 40, 40, w - 80, h - 80, P.oc, 4); }, 154);
  const cbox = solid(2.4, 1.7, 1.2, [P.vd, P.vd, boxTop, P.vd, boxFront, P.vd], { x: X.C - 1.3, y: 1.3, z: -0.9 });
  const pile = []; for (let i = 0; i < 6; i++) { const c = card(i, 0.7); c.position.set(X.C + 0.8 + i * 0.36, 2.35, -0.4); c.rotation.z = -0.3 + i * 0.12; scene.add(c); pile.push(c); }
  // carved sales bars behind the stall
  const barT = tex(128, 512, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.ve, 7); g.strokeStyle = P.vd; g.lineWidth = 6; for (let y = 40; y < h; y += 46) { g.beginPath(); g.moveTo(14, y); g.lineTo(w - 14, y - 20); g.stroke(); } }, 155);
  const barGray = tex(128, 512, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.gy, 7); }, 156);
  const barsH = [1.0, 1.5, 2.3, 3.4, 4.6, 4.7, 4.65], bars = barsH.map((hh, i) => sheet(i < 5 ? barT : barGray, 0.62, 1, { x: X.C - 2.6 + i * 0.86, y: 1.35, z: -2.5 }));
  const arrowT = tex(512, 256, (g) => { g.beginPath(); g.moveTo(20, 200); g.quadraticCurveTo(220, 190, 360, 90); g.lineTo(330, 60); g.lineTo(470, 30); g.lineTo(420, 160); g.lineTo(395, 125); g.quadraticCurveTo(250, 230, 20, 236); g.closePath(); ink(g, P.oc, 6); }, 157);
  const arrow = sheet(arrowT, 4.2, 2.1, { x: X.C - 0.4, y: 4.4, z: -2.3, ay: 0.5 });
  const buyers = [person("buyer", X.C + 3.5, 0.9), person("buyer2", X.C - 4.0, 1.2), person("edo", X.C + 1.3, 1.9)];

  // ================= STATION D: three side businesses =================
  const taxiT = tex(1024, 420, (g, w, h) => {
    g.beginPath(); g.moveTo(40, 330); g.lineTo(40, 230); g.quadraticCurveTo(60, 200, 160, 190); g.lineTo(300, 180); g.lineTo(380, 80); g.lineTo(700, 80); g.lineTo(800, 180); g.lineTo(940, 200); g.quadraticCurveTo(990, 210, 990, 260); g.lineTo(990, 330); g.closePath(); ink(g, P.oc, 7);
    g.save(); g.clip(); rect(g, 0, 250, w, 90, P.ve, 0); rect(g, 0, 246, w, 8, P.kl, 0); g.restore();
    g.beginPath(); g.moveTo(320, 182); g.lineTo(395, 100); g.lineTo(530, 100); g.lineTo(530, 182); g.closePath(); ink(g, P.iw, 5);
    g.beginPath(); g.moveTo(555, 182); g.lineTo(555, 100); g.lineTo(690, 100); g.lineTo(770, 182); g.closePath(); ink(g, P.iw, 5);
    circ(g, 470, 150, 26, P.kl, 0); rect(g, 445, 160, 50, 30, P.kl, 0);
    rect(g, 40, 300, 950, 34, P.gy, 5); rect(g, 960, 220, 34, 28, P.op, 4); rect(g, 34, 225, 26, 26, P.ve, 4);
    g.strokeStyle = P.kl; g.lineWidth = 4; g.beginPath(); g.moveTo(543, 100); g.lineTo(543, 300); g.stroke();
  }, 161);
  const signT = tex(512, 150, (g, w, h) => { rect(g, 10, 10, w - 20, h - 20, P.fo, 6); fitTxt(g, "DAIYA TAXI", w / 2, h / 2 + 4, 84, P.vd, w - 60); }, 163);
  const wheelT = tex(256, 256, (g) => { circ(g, 128, 128, 118, P.kl, 0); circ(g, 128, 128, 66, P.op, 6); for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(k * 1.05) * 62, 128 + Math.sin(k * 1.05) * 62); g.strokeStyle = P.kl; g.lineWidth = 8; g.stroke(); } circ(g, 128, 128, 16, P.ve, 4); }, 165);
  const taxi = new THREE.Group(); scene.add(taxi);
  sheet(taxiT, 4.7, 1.92, { p: taxi, x: 0, y: 0.25 }); const tsign = sheet(signT, 1.6, 0.47, { p: taxi, x: 0.0, y: 1.84, z: 0.02 });
  const wheels = [-1.39, 1.52].map((wx) => sheet(wheelT, 0.87, 0.87, { p: taxi, x: wx, y: 0.5, z: 0.04, ay: 0.5 }));
  const riceT = tex(512, 420, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.fo, 7); rect(g, 8, 8, w - 16, 90, P.ve, 7); fitTxt(g, "NASI INSTAN", w / 2, 56, 62, P.fo, w - 70); g.beginPath(); g.moveTo(130, 220); g.quadraticCurveTo(256, 380, 382, 220); g.closePath(); ink(g, P.pr, 6); g.beginPath(); g.ellipse(256, 220, 126, 28, 0, 0, 7); ink(g, P.fo, 5); for (let k = 0; k < 14; k++) circ(g, 160 + (k * 47) % 190, 212 + (k % 3) * 6, 9, "#FFFDF4", 2); }, 167);
  const riceSide = tex(256, 420, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, "#E8DDC4", 7); rect(g, 8, 8, w - 16, 90, P.vd, 7); }, 168);
  const rice = solid(2.4, 1.97, 1.4, [riceSide, riceSide, P.fo, P.fo, riceT, riceSide], { x: X.D, y: 0, z: 0.2 });
  const steamT = tex(128, 256, (g) => { g.beginPath(); g.moveTo(64, 250); g.bezierCurveTo(10, 190, 118, 130, 64, 70); g.bezierCurveTo(30, 30, 80, 10, 70, 4); g.lineWidth = 16; g.strokeStyle = P.fo; g.stroke(); g.lineWidth = 4; g.strokeStyle = P.kl; g.stroke(); }, 169, 0.3);
  const steams = [-0.4, 0.1, 0.55].map((sx) => sheet(steamT, 0.5, 1.0, { x: X.D + sx, y: 2.0, z: 0.4, cast: false }));
  const vacT = tex(1024, 640, (g) => {
    g.beginPath(); g.ellipse(300, 470, 230, 130, 0, 0, 7); ink(g, P.pl, 7); g.beginPath(); g.ellipse(300, 430, 200, 80, 0, Math.PI, 0); ink(g, P.iw, 5); rect(g, 120, 460, 360, 22, P.pd, 0);
    circ(g, 170, 580, 38, P.kl, 0); circ(g, 430, 580, 38, P.kl, 0);
    g.beginPath(); g.moveTo(500, 450); g.bezierCurveTo(640, 430, 650, 180, 760, 160); g.lineWidth = 46; g.strokeStyle = P.kl; g.stroke(); g.lineWidth = 32; g.strokeStyle = P.gy; g.stroke();
    g.beginPath(); g.moveTo(760, 160); g.lineTo(880, 470); g.lineWidth = 26; g.strokeStyle = P.kl; g.stroke(); g.lineWidth = 14; g.strokeStyle = "#B8BCC2"; g.stroke();
    g.beginPath(); g.moveTo(820, 470); g.lineTo(980, 470); g.lineTo(990, 520); g.lineTo(810, 520); g.closePath(); ink(g, P.pd, 6);
  }, 171);
  const vac = sheet(vacT, 3.9, 2.44, { x: X.D + 5.6, z: 0.1 });
  const vplateT = tex(512, 130, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.oc, 6); fitTxt(g, "CHIRITORY", w / 2, h / 2 + 3, 72, P.pd, w - 60); }, 173);
  const vplate = sheet(vplateT, 1.9, 0.48, { x: X.D + 5.0, y: 0.7, z: 0.25, cast: false });
  const dustT = tex(128, 128, (g) => { for (let k = 0; k < 5; k++) circ(g, 40 + (k * 23) % 60, 44 + (k * 31) % 50, 20 + k * 3, "rgba(170,150,120,.9)", 3); }, 175, 0.3);
  const dust = []; for (let i = 0; i < 7; i++) dust.push({ m: sheet(dustT, 0.55, 0.55, { x: 0, y: 0, z: 0.5, cast: false, ay: 0.5 }), a: rnd() * 6.28, d: 1.2 + rnd() * 1.2 });
  const gagalT = sealTex("GAGAL");
  const gagal = [X.D - 5.8, X.D, X.D + 5.6].map((x, i) => { const m = sheet(gagalT, 1.9, 1.9, { x: x + [0.4, 0.5, -0.3][i], y: [1.7, 1.6, 1.6][i], z: 1.5, cast: true, ay: 0.5 }); return m; });
  const driver = person("salary", X.D - 7.0, 1.7, null);

  // ================= STATION E: 1964, the share price falls =================
  const chartC = document.createElement("canvas"); chartC.width = 1024; chartC.height = 900; const cg = chartC.getContext("2d");
  const chartT = new THREE.CanvasTexture(chartC); chartT.colorSpace = THREE.SRGBColorSpace; chartT.anisotropy = 8;
  const chartPts = [[90, 610], [190, 540], [270, 300], [330, 170], [390, 230], [470, 420], [560, 380], [650, 600], [760, 690], [880, 760], [960, 780]];
  let chartKey = -1;
  const paintChart = (f) => {
    const q = Math.round(f * 120); if (q === chartKey) return; chartKey = q;
    const g = cg, w = 1024, h = 900; g.clearRect(0, 0, w, h); g.lineJoin = g.lineCap = "round";
    rect(g, 10, 10, w - 20, h - 20, P.wa, 8); g.strokeStyle = P.ve; g.lineWidth = 5; g.strokeRect(30, 30, w - 60, h - 60);
    g.strokeStyle = "rgba(31,74,122,.25)"; g.lineWidth = 2; for (let y = 160; y < 820; y += 110) { g.beginPath(); g.moveTo(70, y); g.lineTo(w - 70, y); g.stroke(); }
    txt(g, "SAHAM", 90, 80, 46, P.pd, 700, "left");
    const tot = chartPts.length - 1, upto = f * tot, n = Math.floor(upto), fr = upto - n;
    const pts = chartPts.slice(0, n + 1); if (n < tot) { const a = chartPts[n], b = chartPts[n + 1]; pts.push([a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr]); }
    if (pts.length > 1) {
      g.beginPath(); g.moveTo(pts[0][0], 840); pts.forEach((p) => g.lineTo(p[0], p[1])); g.lineTo(pts[pts.length - 1][0], 840); g.closePath();
      const gr = g.createLinearGradient(0, 160, 0, 840); gr.addColorStop(0, "#6E5470"); gr.addColorStop(1, P.pd); g.fillStyle = gr; g.fill();
      g.save(); g.clip(); g.strokeStyle = "rgba(246,240,225,.25)"; g.lineWidth = 4; for (let x = 100; x < 980; x += 46) { g.beginPath(); g.moveTo(x, 200); g.lineTo(x - 40, 840); g.stroke(); } g.restore();
      g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.lineWidth = 16; g.strokeStyle = P.kl; g.stroke(); g.lineWidth = 8; g.strokeStyle = P.ve; g.stroke();
    }
    chartT.needsUpdate = true;
  };
  paintChart(0);
  const chart = sheet(chartT, 4.6, 4.04, { x: X.E + 0.8, y: 0.25, z: -1.2 });
  const yenT = (s, col) => tex(420, 150, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, col, 6); fitTxt(g, s, w / 2, h / 2 + 4, 86, P.fo, w - 50); }, 181);
  const y900 = sheet(yenT("900 YEN", P.pr), 1.7, 0.6, { x: X.E + 0.8 + (330 / 1024 - 0.5) * 4.6 + 1.15, y: 0.25 + (1 - 170 / 900) * 4.04 - 0.1, z: -1.0, ay: 0.5 });
  const y60 = sheet(yenT("60 YEN", P.ve), 1.6, 0.6, { x: X.E + 0.8 + (880 / 1024 - 0.5) * 4.6, y: 0.25 + (1 - 760 / 900) * 4.04 + 0.7, z: -0.9, ay: 0.5 });
  const banT = tex(300, 520, (g, w, h) => { g.beginPath(); g.moveTo(20, 20); g.lineTo(280, 20); g.lineTo(280, 480); g.lineTo(150, 420); g.lineTo(20, 480); g.closePath(); ink(g, P.fo, 7); rect(g, 20, 20, 260, 40, P.ve, 0); txt(g, "1964", 150, 190, 92, P.vd); txt(g, "TOKYO", 150, 300, 58, P.pd); circ(g, 150, 375, 26, P.ve, 0); }, 183);
  const banner = new THREE.Group(); banner.position.set(X.E - 3.0, 0, -0.4); scene.add(banner);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 8), new THREE.MeshStandardMaterial({ color: 0x3a2a20 })); pole.position.y = 2.2; pole.castShadow = true; banner.add(pole);
  const flag = sheet(banT, 1.1, 1.9, { p: banner, x: 0.58, y: 4.3, ay: 1 });
  const investor = person("salary", X.E - 2.0, 1.4);

  // ================= STATION F: the maintenance room, 1966 =================
  const shopF = tex(1024, 700, (g, w, h) => { rect(g, 10, 10, w - 20, h - 20, "#CDB894", 6); for (let x = 10; x < w; x += 170) rect(g, x, 10, 16, h - 20, P.wd, 4); rect(g, 600, 120, 320, 220, P.iw, 6); g.strokeStyle = P.wd; g.lineWidth = 6; g.beginPath(); g.moveTo(760, 120); g.lineTo(760, 340); g.moveTo(600, 230); g.lineTo(920, 230); g.stroke(); for (let k = 0; k < 6; k++) rect(g, 70 + k * 60, 140 + (k % 2) * 10, 40, 120, [P.gy, P.oc, P.pr][k % 3], 4); rect(g, 50, 270, 400, 16, P.wd, 4); }, 191);
  sheet(shopF, 11, 7.5, { x: X.F, z: -3.4 });
  const machT = tex(512, 640, (g, w, h) => { rect(g, 30, 120, 452, 500, P.gy, 7); rect(g, 70, 170, 372, 160, P.iw, 5); rect(g, 70, 360, 372, 60, P.pd, 5); for (let k = 0; k < 4; k++) circ(g, 120 + k * 90, 470, 22, [P.ve, P.oc, P.fo, P.gr][k], 4); rect(g, 140, 40, 230, 90, P.wd, 6); rect(g, 30, 600, 452, 30, P.kl, 0); }, 193);
  sheet(machT, 3.2, 4.0, { x: X.F - 3.4, z: -1.6 });
  const gearT = tex(256, 256, (g) => { g.beginPath(); for (let k = 0; k < 24; k++) { const a = (k * Math.PI) / 12, rr = k % 2 ? 98 : 120; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.closePath(); ink(g, P.oc, 7); circ(g, 128, 128, 36, P.wd, 6); }, 195);
  const gears = [[X.F - 4.2, 3.4, 1.0], [X.F - 3.25, 3.9, 0.7], [X.F - 2.5, 3.25, 0.55]].map(([x, y, s]) => sheet(gearT, s, s, { x, y, z: -1.45, ay: 0.5 }));
  const yokoi = person("work", X.F - 1.2, 0.75, "GUNPEI YOKOI");
  const hiroshi = person("suit", X.F + 4.4, -0.8, "HIROSHI YAMAUCHI", "PRESIDEN");
  // the extending lattice arm (pantograph): pure geometry, angle opens on the anchor
  const latt = new THREE.Group(); scene.add(latt);
  const slatM = new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.8 }), slatE = new THREE.MeshStandardMaterial({ color: 0x1b1a1f, roughness: 0.9 });
  const NS = 6, SL = 0.62, slats = [];
  for (let i = 0; i < NS * 2; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(SL, 0.07, 0.04), slatM); m.castShadow = true; latt.add(m); const e = new THREE.Mesh(new THREE.BoxGeometry(SL + 0.04, 0.11, 0.03), slatE); e.position.z = -0.012; m.add(e); slats.push(m); }
  const pins = []; for (let i = 0; i < NS; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 10), new THREE.MeshStandardMaterial({ color: 0xd9472b })); m.rotation.x = Math.PI / 2; latt.add(m); pins.push(m); }
  const clawT = tex(128, 128, (g) => { g.beginPath(); g.moveTo(20, 30); g.quadraticCurveTo(110, 20, 110, 64); g.quadraticCurveTo(110, 108, 20, 98); g.lineTo(40, 86); g.quadraticCurveTo(84, 86, 84, 64); g.quadraticCurveTo(84, 42, 40, 42); g.closePath(); ink(g, P.ve, 6); }, 197, 0.2);
  const claw = sheet(clawT, 0.5, 0.5, { p: latt, ay: 0.5, ax: 0 });
  const ballM = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), new THREE.MeshStandardMaterial({ color: 0xd9472b, roughness: 0.6 })); ballM.castShadow = true; scene.add(ballM);
  const ballStand = solid(0.55, 1.66, 0.55, woodT, { x: X.F + 4.3, z: 0.75 });
  const uhFront = tex(512, 360, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.pr, 8); rect(g, 26, 26, w - 52, h - 52, P.fo, 4); fitTxt(g, "ULTRA HAND", w / 2, 92, 74, P.ve, w - 80); txt(g, "1966", w / 2, 178, 66, P.pd); g.strokeStyle = P.oc; g.lineWidth = 9; g.beginPath(); for (let k = 0; k < 6; k++) { g.moveTo(80 + k * 60, 300); g.lineTo(110 + k * 60, 240); g.moveTo(80 + k * 60, 240); g.lineTo(110 + k * 60, 300); } g.stroke(); }, 199);
  const uhbox = solid(2.2, 1.55, 0.9, [P.pd, P.pd, P.pr, P.pr, uhFront, P.pd], { x: X.F + 1.6, z: 2.1 });
  const scrollT = tex(160, 520, (g, w, h) => { rect(g, 14, 20, w - 28, h - 40, P.wa, 5); rect(g, 0, 0, w, 26, P.wd, 4); rect(g, 0, h - 26, w, 26, P.wd, 4); g.strokeStyle = P.kl; g.lineWidth = 7; for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) { const x = 34 + k * 20, y = 60 + r * 110; g.beginPath(); if (k < 4) { g.moveTo(x, y); g.lineTo(x, y + 70); } else { g.moveTo(26, y + 54); g.lineTo(122, y + 14); } g.stroke(); } }, 201);
  const salesScrolls = [0, 1, 2, 3].map((i) => { const pv = new THREE.Group(); pv.position.set(X.F + 1.4 + i * 0.95, 4.7 - (i % 2) * 0.2, -2.5); scene.add(pv); sheet(scrollT, 0.62, 2.0, { p: pv, ay: 1 }); return pv; });
  const doorT = tex(640, 190, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.pd, 6); fitTxt(g, "PENGEMBANGAN", w / 2, 70, 66, P.fo, w - 60); fitTxt(g, "PRODUK", w / 2, 140, 52, P.oc, w - 60); }, 203);
  const doorSign = sheet(doorT, 2.4, 0.71, { x: X.F + 9.0, y: 3.9, z: -1.0, cast: false });
  const doorT2 = tex(400, 700, (g, w, h) => { rect(g, 10, 10, w - 20, h - 20, P.wd, 7); rect(g, 40, 40, w - 80, h - 80, P.fo, 5); for (let y = 100; y < h - 40; y += 90) rect(g, 40, y, w - 80, 6, P.wd, 0); rect(g, 194, 40, 12, h - 80, P.wd, 0); }, 205);
  sheet(doorT2, 2.0, 3.5, { x: X.F + 9.0, z: -1.6 });

  // ================= STATION G: the love-hotel rumour, a myth =================
  const rumorT = tex(420, 1000, (g, w, h) => { rect(g, 30, 50, w - 60, h - 100, P.wa, 6); g.strokeStyle = P.ve; g.lineWidth = 5; g.strokeRect(56, 90, w - 112, h - 180); rect(g, 0, 20, w, 44, P.wd, 5); rect(g, 10, h - 64, w - 20, 44, P.wd, 5); txt(g, "LOVE", w / 2, 330, 104, P.pd); txt(g, "HOTEL", w / 2, 460, 92, P.pd); txt(g, "?", w / 2, 640, 210, P.ve); txt(g, "KATANYA...", w / 2, 820, 40, P.gy); }, 211);
  const rumor = new THREE.Group(); rumor.position.set(X.G - 0.9, 5.2, -1.4); scene.add(rumor); sheet(rumorT, 2.4, 5.7, { p: rumor, ay: 1 });
  const strokeT = tex(1024, 140, (g, w, h) => { const rr = mulberry(213); g.beginPath(); g.moveTo(20, 80); g.quadraticCurveTo(500, 30, 1000, 60); g.lineTo(990, 96); g.quadraticCurveTo(500, 90, 30, 112); g.closePath(); g.fillStyle = P.kl; g.fill(); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 70; i++) { g.fillRect(rr() * w, 60 + rr() * 50, 30 + rr() * 60, 2 + rr() * 3); } }, 0);
  const strokes = [0.78, -0.78].map((a) => { const pv = new THREE.Group(); pv.position.set(X.G - 0.9, 2.4, -1.1); pv.rotation.z = a; scene.add(pv); const m = sheet(strokeT, 5.6, 0.75, { p: pv, ay: 0.5, ax: 0, x: -2.8 }); return { pv, m }; });
  const mitos = sheet(sealTex("MITOS", P.ve, 130), 2.2, 2.2, { x: X.G - 0.7, y: 1.95, z: 0.6, ay: 0.5 });
  const yamazaki = person("scholar", X.G + 2.4, 0.4, "ISAO YAMAZAKI", "SEJARAWAN");
  const docT = (title, kind) => tex(360, 470, (g, w, h) => { rect(g, 10, 10, w - 20, h - 20, P.fo, 6); fitTxt(g, title, w / 2, 56, 44, P.pd, w - 50); rect(g, 30, 86, w - 60, 6, P.ve, 0); g.fillStyle = "rgba(27,26,31,.55)"; for (let y = 120; y < h - 40; y += 26) g.fillRect(30, y, (kind ? 140 : w - 60) - ((y * 7) % 50), 9); if (kind) { rect(g, 190, 120, 140, 120, P.iw, 3); for (let y = 120; y < h - 40; y += 26) g.fillRect(190, y + 140 > h - 40 ? h : y + 140, 140, 9); } }, 215);
  const report = sheet(docT("LAPORAN", 0), 1.25, 1.63, { x: X.G + 3.8, y: 0.0, z: 0.9 });
  const paper = sheet(docT("KORAN", 1), 1.25, 1.63, { x: X.G + 4.5, y: 0.0, z: 1.3 });
  const noT = tex(560, 130, (g, w, h) => { rect(g, 8, 8, w - 16, h - 16, P.fo, 6); fitTxt(g, "TIDAK ADA BUKTI", w / 2, h / 2 + 3, 60, P.vd, w - 50); }, 217);
  const noProof = sheet(noT, 2.2, 0.51, { x: X.G + 4.1, y: 1.95, z: 1.5, cast: false });

  // ================= STATION H: every venture on one scroll =================
  const emakiT = tex(2048, 640, (g, w, h) => {
    rect(g, 40, 40, w - 80, h - 80, P.wa, 6); g.strokeStyle = P.oc; g.lineWidth = 6; g.strokeRect(70, 70, w - 140, h - 140);
    const icon = (x, lab, draw) => { draw(x); fitTxt(g, lab, x, 520, 44, P.pd, 300); };
    icon(240, "KARTU", (x) => { [-0.3, 0, 0.3].forEach((a, k) => { g.save(); g.translate(x, 400); g.rotate(a); g.beginPath(); g.roundRect(-55, -210, 110, 176, 10); ink(g, [P.ve, P.fo, P.pr][k], 6); g.restore(); }); circ(g, x, 260, 30, P.ve, 4); });
    icon(600, "TAKSI", (x) => { g.beginPath(); g.moveTo(x - 150, 420); g.lineTo(x - 150, 340); g.lineTo(x - 70, 330); g.lineTo(x - 40, 260); g.lineTo(x + 70, 260); g.lineTo(x + 100, 330); g.lineTo(x + 150, 340); g.lineTo(x + 150, 420); g.closePath(); ink(g, P.oc, 6); circ(g, x - 80, 425, 30, P.kl, 0); circ(g, x + 85, 425, 30, P.kl, 0); });
    icon(960, "NASI INSTAN", (x) => { rect(g, x - 100, 240, 200, 200, P.fo, 6); rect(g, x - 100, 240, 200, 50, P.ve, 6); g.beginPath(); g.moveTo(x - 60, 350); g.quadraticCurveTo(x, 430, x + 60, 350); g.closePath(); ink(g, P.pr, 5); });
    icon(1320, "CHIRITORY", (x) => { g.beginPath(); g.ellipse(x - 30, 390, 110, 60, 0, 0, 7); ink(g, P.pl, 6); g.beginPath(); g.moveTo(x + 70, 380); g.bezierCurveTo(x + 130, 360, x + 120, 260, x + 160, 250); g.lineWidth = 14; g.strokeStyle = P.kl; g.stroke(); });
    icon(1700, "ULTRA HAND", (x) => { g.strokeStyle = P.oc; g.lineWidth = 16; g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(x - 160 + k * 70, 420); g.lineTo(x - 90 + k * 70, 300); g.moveTo(x - 160 + k * 70, 300); g.lineTo(x - 90 + k * 70, 420); } g.stroke(); circ(g, x + 140, 360, 34, P.ve, 5); });
  }, 221);
  const emaki = new THREE.Group(); emaki.position.set(X.H, 3.3, -1.6); scene.add(emaki);
  const emakiM = sheet(emakiT, 7.6, 2.38, { p: emaki, ay: 0.5, ax: 0, x: -3.8 });
  const rollT = tex(64, 400, (g, w, h) => { rect(g, 6, 0, w - 12, h, P.wd, 6); rect(g, 0, 0, w, 30, P.kl, 0); rect(g, 0, h - 30, w, 30, P.kl, 0); }, 223, 0.3);
  const rollL = sheet(rollT, 0.3, 2.7, { p: emaki, ay: 0.5, x: -3.8 }), rollR = sheet(rollT, 0.3, 2.7, { p: emaki, ay: 0.5, x: -3.8 });
  const qT = tex(300, 300, (g) => { circ(g, 150, 150, 136, P.ve, 7); txt(g, "?", 150, 160, 220, P.fo); }, 225);
  const qMark = sheet(qT, 1.6, 1.6, { x: X.H + 2.9, y: 5.5, z: -1.2, ay: 0.5 });
  const audiraSeal = sheet(sealTex("AUDIRA", P.ve, 84), 1.45, 1.45, { x: X.H - 0.2, y: 1.15, z: 1.2, ay: 0.5 });
  const friends = [person("edo", X.H - 3.0, 1.6), person("work", X.H + 3.2, 1.9), person("buyer", X.H + 2.1, 1.0)];

  // ---------- camera along the scroll: px py pz lx ly lz ----------
  const A = (k, d = 0) => (AT[k] ?? 0) + d;
  const cTrack = track([
    [0, X.A + 0.2, 2.3, 18.2, X.A + 0.2, 2.9, 0], [K.s1e - 0.2, X.A - 0.4, 2.6, 19.5, X.A - 0.4, 2.7, 0],
    [K.s2 + 1.4, X.B - 0.4, 2.7, 17.5, X.B - 0.2, 2.5, 0], [A("s2:hanafuda", -0.6), X.B - 0.6, 2.5, 15.5, X.B - 0.6, 2.3, 0], [A("s2:Arti", -0.2), X.B, 2.6, 16, X.B, 2.6, 0],
    [A("s2:serahkan", 0.4), X.B, 9.6, 18.5, X.B, 12.4, 0], [K.s2e - 0.1, X.B + 0.3, 10.4, 19.5, X.B + 0.3, 12.8, 0],
    [K.s3 + 1.6, X.C - 0.2, 2.8, 19, X.C - 0.2, 2.8, 0], [A("s3:melonjak", 0), X.C + 0.2, 3.2, 17.5, X.C, 3.0, 0], [K.s3e - 0.2, X.C + 0.5, 2.8, 18.5, X.C + 0.4, 2.6, 0],
    [A("s4:1960", -0.6), X.D - 5.8, 2.2, 14.5, X.D - 5.8, 1.9, 0], [A("s4:Daiya", 0.2), X.D - 5.5, 2.3, 13.8, X.D - 5.5, 1.9, 0],
    [A("s4:nasi", 0.2), X.D, 2.2, 13.5, X.D, 1.8, 0], [A("s4:Chiritory", 0.1), X.D + 5.4, 2.3, 14.5, X.D + 5.4, 1.9, 0],
    [A("s4:Semuanya", 0.2), X.D, 3.6, 40, X.D, 2.6, 0], [K.s4e - 0.1, X.D, 3.7, 41, X.D, 2.6, 0],
    [K.s5 + 1.5, X.E - 0.6, 3.2, 20, X.E - 0.6, 3.2, 0], [A("s5:saham", 0), X.E + 0.2, 3.3, 19.5, X.E + 0.2, 3.2, 0], [K.s5e - 0.2, X.E + 1.0, 2.4, 17.5, X.E + 1.0, 2.4, 0],
    [K.s6 + 1.5, X.F - 0.6, 2.8, 19.5, X.F - 0.6, 2.6, 0], [A("s6:Hiroshi", 0), X.F + 1.8, 2.8, 21, X.F + 1.8, 2.5, 0], [A("s6:mainan", 0.2), X.F + 1.6, 2.5, 20, X.F + 1.6, 2.2, 0],
    [A("s6:Ultra", 0), X.F + 1.8, 2.6, 18, X.F + 1.8, 2.4, 0], [A("s6:laku", 0.6), X.F + 2.4, 3.2, 18.5, X.F + 2.4, 3.0, 0], [A("s6:Yokoi#2", 0.6), X.F + 6.2, 2.8, 18.5, X.F + 6.2, 2.6, 0], [K.s6e - 0.1, X.F + 7.2, 2.8, 18.5, X.F + 7.2, 2.6, 0],
    [K.s7 + 1.5, X.G - 0.6, 3.0, 19, X.G - 0.6, 3.1, 0], [A("s7:Ternyata", 0), X.G - 0.4, 3.0, 18, X.G - 0.4, 3.0, 0], [A("s7:Isao", 0.2), X.G + 1.3, 2.7, 20.5, X.G + 1.3, 2.5, 0], [K.s7e - 0.1, X.G + 1.5, 2.7, 21, X.G + 1.5, 2.5, 0],
    [K.s8 + 1.5, X.H - 0.4, 3.0, 19.5, X.H - 0.4, 2.9, 0], [A("s8:Menurutmu", 0), X.H, 3.2, 20.5, X.H, 3.0, 0], [K.dur, X.H + 0.4, 3.6, 23, X.H + 0.4, 3.1, 0],
  ]);

  return (t) => {
    const p = cTrack(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    key.position.set(p[3] - 7, 16, 14); key.target.position.set(p[3], 1, 0);
    clouds.forEach((c) => { c.m.position.x = c.x + t * c.sp; });
    fog.forEach((f) => { f.m.position.x = f.x + Math.sin(t * 0.25 + f.x) * 0.5 + (f.k ? -t * 0.03 : t * 0.03); });
    lanterns.forEach((L, i) => { L.rotation.z = Math.sin(t * 1.3 + i) * 0.06; });
    sunA.position.y = 6.6 + Math.sin(t * 0.4) * 0.1;

    // A: the fan opens wider on "kartu", the sign swings, the craftsman lifts a bundle
    const open = 0.55 + 0.45 * eout(clamp01((t - A("s1:kartu", -0.2)) / 0.6));
    fanCards.forEach((pv, i) => { pv.rotation.z = (2 - i) * 0.25 * open + Math.sin(t * 1.5 + i) * 0.01; pv.position.z = i * 0.04; });
    fan.rotation.y = Math.sin(t * 0.5) * 0.08;
    board.rotation.z = Math.sin(t * 1.1) * 0.04;
    crafterA.armR.rotation.z = 0.5 + Math.sin(t * 2) * 0.05; crafterA.armL.rotation.z = -0.15;
    crafterA.G.position.x = X.A + 2.6 + Math.sin(t * 0.8) * 0.15;

    // B: press goes down and up, a card joins the stack each time
    const pT = t - K.s2, cyc = 1.1, ph = ((pT % cyc) + cyc) % cyc / cyc, down = pT > 0 ? Math.max(0, Math.sin(ph * Math.PI * 2)) : 0;
    press.position.y = 1.2 + 0.05 + (1 - down) * 0.55; pressPad.visible = true;
    crafterB.armR.rotation.z = 1.35 - down * 0.35; crafterB.armL.rotation.z = -0.15 - down * 0.1; crafterB.armR.position.x = 0.36;
    const nStack = Math.min(stack.length, 4 + Math.max(0, Math.floor(pT / cyc)));
    stack.forEach((c, i) => { c.visible = i < nStack; });
    hung.forEach((pv, i) => { pv.rotation.z = Math.sin(t * 1.4 + i * 0.7) * 0.07; });
    const sky = ramp(t, A("s2:serahkan", -1.0), A("s2:serahkan", 0.6));
    petals.forEach((q, i) => { const u = clamp01((t - A("s2:serahkan", -0.8) - i * 0.12) / 3.4); q.pv.visible = u > 0 && t < K.s3 + 0.5; q.pv.position.set(q.x + Math.sin(t * q.sp + q.ph) * 0.4, 5 + u * 9 + Math.sin(t * 2 + q.ph) * 0.15, q.z); q.pv.rotation.set(Math.sin(t + q.ph) * 0.4, t * q.sp, Math.sin(t * 0.8 + q.ph) * 0.6); });
    sunB.scale.setScalar(0.9 + 0.1 * sky);

    // C: sales bars rise, the pile grows, buyers raise hands; then the market saturates
    const sale = A("s3:Penjualannya", -0.3), sat = A("s3:jenuh", -0.6);
    bars.forEach((b, i) => { const u = i < 5 ? eout(clamp01((t - sale - i * 0.18) / 0.5)) : eout(clamp01((t - sat - (i - 5) * 0.2) / 0.4)); const hh = Math.max(0.02, barsH[i] * (i < 5 ? 0.25 + 0.75 * u : u)); b.scale.y = hh; b.visible = i < 5 || u > 0.01; });
    const au = eout(clamp01((t - A("s3:melonjak", -0.2)) / 0.6)); arrow.scale.setScalar(Math.max(0.001, au)); arrow.visible = au > 0.01;
    const lift = ramp(t, A("s3:Disney", 0), A("s3:Disney", 0.5)) * (1 - ramp(t, sat, sat + 0.6));
    buyers.forEach((b, i) => { b.armR.rotation.z = 0.2 + lift * (1.9 + Math.sin(t * 6 + i) * 0.2); b.armL.rotation.z = -0.1 - lift * (i === 1 ? 1.6 : 0.2); b.G.position.y = lift * Math.abs(Math.sin(t * 5 + i)) * 0.12; });
    pile.forEach((c, i) => { const u = eout(clamp01((t - sale - 0.2 - i * 0.15) / 0.3)); c.position.y = 2.35 + (1 - u) * 1.2; c.visible = u > 0; });
    cbox.rotation.y = Math.sin(t * 0.7) * 0.06 - 0.12;

    // D: taxi drives in and parks; rice box steams; vacuum sucks; then every venture is stamped GAGAL
    const tIn = eout(clamp01((t - (A("s4:1960", -1.6))) / 1.8));
    taxi.position.set(X.D - 5.8 - 9 * (1 - tIn), 0, 0.2); wheels.forEach((w) => { w.rotation.z = -(taxi.position.x - X.D) / 0.5; });
    taxi.position.y = tIn < 1 ? Math.abs(Math.sin(t * 18)) * 0.03 : 0;
    driver.G.visible = false;
    const rIn = back(clamp01((t - A("s4:nasi", -0.5)) / 0.5), 1.8); rice.scale.setScalar(Math.max(0.001, rIn)); rice.visible = rIn > 0.001;
    steams.forEach((s, i) => { const u = ((t * 0.5 + i * 0.33) % 1); s.position.y = 2.0 + u * 0.9; s.scale.set(1, 0.6 + u * 0.4, 1); s.visible = rIn > 0.9; });
    const vIn = back(clamp01((t - A("s4:penyedot", -0.4)) / 0.5), 1.8); vac.scale.setScalar(Math.max(0.001, vIn)); vac.visible = vIn > 0.001; vplate.visible = vIn > 0.9;
    dust.forEach((d) => { const u = ((t * 0.7 + d.a) % 1); d.m.visible = vIn > 0.9 && t < A("s4:Semuanya"); d.m.position.set(X.D + 7.1 + Math.cos(d.a) * d.d * (1 - u), 0.5 + Math.abs(Math.sin(d.a)) * d.d * (1 - u), 0.6); d.m.scale.setScalar(0.4 + 0.6 * (1 - u)); });
    gagal.forEach((m, i) => { const a = A("s4:Semuanya", 0.05 + i * 0.25), u = clamp01((t - a) / 0.2); m.visible = u > 0; m.scale.setScalar(1 + (1 - eout(u)) * 1.2); m.rotation.z = -0.12 + i * 0.1; m.position.z = 1.5 + (1 - u) * 2; });

    // E: the banner flaps, the chart falls from the 900 peak to 60, the investor holds his head
    flag.rotation.y = Math.sin(t * 2.2) * 0.12;
    const cf = ramp(t, A("s5:saham", -1.6), A("s5:enam", 0.2)); paintChart(cf);
    const p9 = eout(clamp01((t - A("s5:sembilan", 0)) / 0.3)), p6 = eout(clamp01((t - A("s5:enam", 0)) / 0.3));
    y900.scale.setScalar(Math.max(0.001, back(p9))); y900.visible = p9 > 0; y60.scale.setScalar(Math.max(0.001, back(p6))); y60.visible = p6 > 0;
    const sad = ramp(t, A("s5:jatuh", 0), A("s5:jatuh", 0.6));
    investor.armR.rotation.z = 0.1 - sad * 0.1; investor.armL.rotation.z = -0.1 + sad * 0.1; investor.G.rotation.z = -sad * 0.16; investor.G.position.y = -sad * 0.12;

    // F: the lattice arm springs out, grabs the ball, the box pops, scrolls unroll, Yokoi walks to product development
    gears.forEach((gm, i) => { gm.rotation.z = t * (i % 2 ? -0.9 : 1.2); });
    const walk = ramp(t, A("s6:Yokoi#2", 0), A("s6:pengembangan", 0.4)); yokoi.G.position.x = X.F - 1.2 + walk * 10.0; yokoi.G.position.y = walk > 0 && walk < 1 ? Math.abs(Math.sin(t * 9)) * 0.07 : 0;
    const spring = A("s6:mainan", -0.2), ext = t < spring ? 0.08 : 0.08 + 0.92 * (1 - Math.exp(-(t - spring) * 5) * Math.cos((t - spring) * 13));
    const th = Math.max(0.12, 1.3 - ext * 1.0), dx = SL * Math.cos(th), dy = SL * Math.sin(th);
    const ox = yokoi.G.position.x + 1.65, oy = 1.85, gz = 0.75;
    latt.position.set(ox, oy, gz);
    for (let i = 0; i < NS; i++) {
      const a = slats[i * 2], b = slats[i * 2 + 1], cx = dx * (i + 0.5);
      a.position.set(cx, 0, 0.03); a.rotation.z = th; b.position.set(cx, 0, -0.03); b.rotation.z = -th;
    }
    pins.forEach((pn, i) => { pn.position.set(dx * (i + 0.5), 0, 0.06); });
    const tipX = dx * NS; claw.position.set(tipX, 0, 0.04); claw.scale.y = 1 - 0.3 * clamp01((t - A("s6:Gunpei", 0)) / 0.3);
    yokoi.armR.rotation.z = 1.45 * (1 - clamp01(walk * 8)); yokoi.armL.rotation.z = -0.2;
    const grab = clamp01((t - A("s6:Gunpei", 0.1)) / 0.4), lifted = ramp(t, A("s6:Gunpei", 0.5), A("s6:iseng", 0));
    const ballHome = [X.F + 4.3, 1.85, 0.75];
    const tipW = [ox + tipX + 0.28, oy, gz];
    if (grab < 1) ballM.position.set(...ballHome);
    else ballM.position.set(tipW[0], tipW[1], tipW[2]);
    latt.rotation.z = lifted * 0.25 - (t > spring ? 0.08 : 0);
    if (grab >= 1) { const v = new THREE.Vector3(tipX + 0.28, 0, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), latt.rotation.z); ballM.position.set(ox + v.x, oy + v.y, gz); }
    const hIn = eout(clamp01((t - A("s6:Hiroshi", -1.2)) / 1.2)); hiroshi.G.position.x = X.F + 4.4 + (1 - hIn) * 5; hiroshi.armR.rotation.z = 0.15 + ramp(t, A("s6:melihat", 0), A("s6:melihat", 0.4)) * 0.9; hiroshi.armL.rotation.z = -0.1;
    const bIn = back(clamp01((t - A("s6:Ultra", -0.3)) / 0.45), 2); uhbox.scale.setScalar(Math.max(0.001, bIn)); uhbox.visible = bIn > 0.001; uhbox.rotation.y = Math.sin(t * 0.8) * 0.1;
    salesScrolls.forEach((pv, i) => { const u = eout(clamp01((t - A("s6:laku", 0) - i * 0.2) / 0.5)); pv.scale.y = Math.max(0.02, u); pv.visible = u > 0.01; });
    latt.visible = walk < 0.02; if (walk >= 0.02) ballM.position.set(...ballHome);
    const dS = eout(clamp01((t - A("s6:pengembangan", -0.4)) / 0.4)); doorSign.scale.setScalar(Math.max(0.001, 0.6 + 0.4 * dS));

    // G: the rumour scroll sways, brush strokes cross it out, MITOS stamps, the historian shows his sources
    rumor.rotation.z = Math.sin(t * 0.9) * 0.025;
    strokes.forEach((s, i) => { const u = eout(clamp01((t - A("s7:Ternyata", 0.1) - i * 0.3) / 0.35)); s.m.scale.x = Math.max(0.001, u); s.m.visible = u > 0.001; });
    const mu = clamp01((t - A("s7:buktinya", 0)) / 0.2); mitos.visible = mu > 0; mitos.scale.setScalar(1 + (1 - eout(mu)) * 1.3); mitos.rotation.z = -0.14; mitos.position.z = 0.6 + (1 - mu) * 2.5;
    const r1 = back(clamp01((t - A("s7:laporan", -0.1)) / 0.35)), r2 = back(clamp01((t - A("s7:koran", -0.1)) / 0.35));
    report.scale.setScalar(Math.max(0.001, r1)); report.visible = r1 > 0.001; report.rotation.z = 0.08; paper.scale.setScalar(Math.max(0.001, r2)); paper.visible = r2 > 0.001; paper.rotation.z = -0.1;
    const np = back(clamp01((t - A("s7:tidak", 0)) / 0.35)); noProof.scale.setScalar(Math.max(0.001, np)); noProof.visible = np > 0.001;
    yamazaki.armR.rotation.z = 0.3 + ramp(t, A("s7:Isao", 0), A("s7:Isao", 0.4)) * 0.9 + Math.sin(t * 2) * 0.04; yamazaki.armL.rotation.z = -0.2;

    // H: the emaki unrolls, every venture on one scroll, the question mark and the AUDIRA seal
    const un = eout(clamp01((t - (K.s8 + 0.4)) / 1.8));
    emakiM.scale.x = Math.max(0.01, un); rollR.position.x = -3.8 + 7.6 * un;
    const qm = back(clamp01((t - A("s8:Menurutmu", 0)) / 0.4)); qMark.scale.setScalar(Math.max(0.001, qm)); qMark.visible = qm > 0.001; qMark.rotation.z = Math.sin(t * 2) * 0.08;
    const au2 = clamp01((t - A("s8:AUDIRA", -0.1)) / 0.2); audiraSeal.visible = true; audiraSeal.scale.setScalar(1 + (1 - eout(au2)) * 0.8); audiraSeal.rotation.z = -0.1;
    const pt = [A("s8:kartu", 0), A("s8:taksi", 0), A("s8:nasi", 0)];
    friends.forEach((f, i) => { const u = ramp(t, pt[i], pt[i] + 0.3) * (1 - ramp(t, pt[i] + 1.2, pt[i] + 1.6)); f.armR.rotation.z = 0.2 + u * 2.0; f.armL.rotation.z = -0.15; f.G.position.y = 0; });

    comp.render();
  };
}
