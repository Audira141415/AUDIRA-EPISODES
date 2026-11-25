// BERKAS KASUS: one long investigator's desk in the dark, a cork board behind it, a lamp pool that follows the camera.
// Noir case file blended with a cold database layer (cyan scan beam, clock hands). Illustration only, no Roblox assets.
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, smooth, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, pts } from "./lib3d.js";

// Canvas textures need the web fonts before they are painted.
try {
  await Promise.race([
    Promise.all(['48px "Special Elite"', '700 48px Oswald', '500 48px Oswald'].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
} catch (e) { /* fall back to system fonts */ }

const NOIR = 0x0b0b0d, MAN = "#D9C49A", RED = "#C1272D", INK = "#1A1A1A", CY = "#6FE3FF", LAMP = 0xffd38a;
const TW = '"Special Elite", monospace', OS = "Oswald, sans-serif";
const UP = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = (a, b, u) => a + (b - a) * u;
const lerpV = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
// jump arc between two feet positions
const arc = (a, b, u, h) => { const p = lerpV(a, b, u); p[1] += 4 * h * u * (1 - u); return p; };

// blocky portrait used on the case cards (generic, no real person)
function portrait(g, cx, cy, s, kind) {
  const P = { roblox: ["#F5CD30", "#3B4A5C"], john: ["#CFC6AD", "#5D6672"], jane: ["#E2CDB2", "#7E5868"], builder: ["#F5CD30", "#2F5FA8"] }[kind];
  g.fillStyle = P[1]; g.beginPath(); g.roundRect(cx - s * 1.0, cy + s * 0.55, s * 2.0, s * 1.2, s * 0.12); g.fill();
  if (kind === "jane") { g.fillStyle = "#3B2A20"; g.beginPath(); g.roundRect(cx - s * 0.72, cy - s * 0.62, s * 1.44, s * 1.35, s * 0.3); g.fill(); }
  g.fillStyle = P[0]; g.beginPath(); g.roundRect(cx - s * 0.55, cy - s * 0.5, s * 1.1, s * 1.0, s * 0.18); g.fill();
  if (kind === "jane") { g.fillStyle = "#3B2A20"; g.beginPath(); g.roundRect(cx - s * 0.6, cy - s * 0.6, s * 1.2, s * 0.3, s * 0.12); g.fill(); }
  if (kind === "builder") { g.fillStyle = "#E8A33D"; g.beginPath(); g.ellipse(cx, cy - s * 0.48, s * 0.62, s * 0.36, 0, Math.PI, 0); g.fill(); g.fillRect(cx - s * 0.8, cy - s * 0.5, s * 1.6, s * 0.1); }
  g.fillStyle = "#111"; g.beginPath(); g.ellipse(cx - s * 0.2, cy - s * 0.06, s * 0.06, s * 0.1, 0, 0, 7); g.ellipse(cx + s * 0.2, cy - s * 0.06, s * 0.06, s * 0.1, 0, 0, 7); g.fill();
  g.strokeStyle = "#111"; g.lineWidth = s * 0.06; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy + s * 0.04, s * 0.24, 0.4, 2.75); g.stroke();
}

function paper(g, w, h, rnd, base = MAN) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(90,62,20,${0.03 + rnd() * 0.05})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 3); }
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(70,45,10,.32)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: NOIR, fog: 0.0065, exp: 1.05, bloom: [0.5, 0.55, 0.8] });
  const rnd = mulberry(303);
  const hemi = new THREE.HemisphereLight(0x3a4660, 0x0b0b0d, 0.6); scene.add(hemi);
  // the lamp pool that follows the investigation
  const key = new THREE.SpotLight(LAMP, 6, 0, 0.44, 0.85, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 4; key.shadow.camera.far = 140; key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x6f8fb0, 0.35); fill.position.set(-20, 30, 40); scene.add(fill);

  // desk, wall, cork board
  const wood = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#2a1a10"; g.fillRect(0, 0, w, h); for (let i = 0; i < 380; i++) { const y = rnd() * h; g.strokeStyle = `rgba(${rnd() < 0.5 ? "12,6,2" : "70,42,22"},${0.12 + rnd() * 0.2})`; g.lineWidth = 1 + rnd() * 3; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + rnd() * 10 - 5, w * 0.6, y - rnd() * 10 + 5, w, y + rnd() * 6 - 3); g.stroke(); } }, [10, 2]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(320, 46), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.42, metalness: 0.05 })); desk.rotation.x = -Math.PI / 2; desk.position.set(110, 0, 17); desk.receiveShadow = true; scene.add(desk);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(340, 80), std(0x15131a, 0.95)); wall.position.set(110, 30, -6.4); wall.receiveShadow = true; scene.add(wall);
  const cork = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#8a6440"; g.fillRect(0, 0, w, h); for (let i = 0; i < 5200; i++) { const c = rnd(); g.fillStyle = c < 0.45 ? "rgba(60,38,18,.55)" : c < 0.85 ? "rgba(170,128,82,.5)" : "rgba(30,18,8,.6)"; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 2.5); } }, [16, 3]);
  const BX0 = 10, BX1 = 138;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(BX1 - BX0, 24), new THREE.MeshStandardMaterial({ map: cork, roughness: 0.95 })); board.position.set((BX0 + BX1) / 2, 14, -5.95); board.receiveShadow = true; scene.add(board);
  const frm = std(0x1d130c, 0.6);
  box(BX1 - BX0 + 1.2, 0.6, 0.5, frm, (BX0 + BX1) / 2, 26.3, -5.8, scene); box(BX1 - BX0 + 1.2, 0.6, 0.5, frm, (BX0 + BX1) / 2, 1.7, -5.8, scene);
  box(0.6, 25.2, 0.5, frm, BX0 - 0.3, 14, -5.8, scene); box(0.6, 25.2, 0.5, frm, BX1 + 0.3, 14, -5.8, scene);

  // desk clutter for foreground depth
  const papers = [];
  for (let i = 0; i < 30; i++) {
    const x = -14 + i * 8.4 + rnd() * 4, z = 7 + rnd() * 9;
    if (Math.abs(x - 150) < 16 || Math.abs(x - 190) < 14) continue;
    const pt = canvasTex(256, 330, (g, w, h) => { paper(g, w, h, rnd, i % 3 ? "#d8cfbd" : MAN); g.fillStyle = "rgba(26,26,26,.55)"; for (let l = 0; l < 9; l++) g.fillRect(24, 40 + l * 28, 120 + rnd() * 90, 5); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.4), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.9 }));
    m.rotation.set(-Math.PI / 2, 0, rnd() * 1.4 - 0.7); m.position.set(x, 0.02 + i * 0.001, z); m.receiveShadow = true; scene.add(m); papers.push(m);
  }
  const mug = new THREE.Group(); mug.position.set(-8, 0, 9); scene.add(mug);
  cyl(1.5, 1.35, 3.4, 28, std(0x2a2c30, 0.35), 0, 1.7, 0, mug); cyl(1.32, 1.32, 0.05, 28, std(0x1a0d06, 0.2), 0, 3.25, 0, mug);
  const mgl = new THREE.Group(); mgl.position.set(13, 0.25, 10); mgl.rotation.y = 0.6; scene.add(mgl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.2, 10, 32), std(0x8a7a50, 0.3, 0.8)); ring.rotation.x = Math.PI / 2; ring.castShadow = true; mgl.add(ring);
  const lensM = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshStandardMaterial({ color: 0xbfe8ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25 })); lensM.rotation.x = -Math.PI / 2; mgl.add(lensM);
  box(0.5, 0.35, 3.4, std(0x2a1a10, 0.5), 0, 0, 3.4, mgl);
  for (let i = 0; i < 6; i++) { const pc = cyl(0.17, 0.17, 7, 6, std(i % 2 ? 0x2a2a2a : 0xb88a3a, 0.5), 40 + i * 33 + rnd() * 6, 0.18, 10 + rnd() * 5); pc.rotation.set(Math.PI / 2, 0, rnd() * 3); }

  // ---------- s1: phone warning + the shadow silhouette ----------
  const phone = new THREE.Group(); phone.position.set(0, 0, 3.2); phone.rotation.x = -0.16; scene.add(phone);
  box(4.8, 8.8, 0.36, std(0x111215, 0.3, 0.6), 0, 4.6, 0, phone);
  const warnT = canvasTex(432, 792, (g, w, h) => {
    g.fillStyle = "#120607"; g.fillRect(0, 0, w, h);
    g.fillStyle = RED; g.fillRect(0, 0, w, 120); g.fillStyle = "#fff"; g.font = `700 54px ${OS}`; g.textAlign = "center"; g.fillText("PERINGATAN!", w / 2, 82);
    g.fillStyle = "#ff3b3b"; g.font = `700 150px ${OS}`; g.fillText("18", w / 2, 330); g.font = `700 104px ${OS}`; g.fillText("MARET", w / 2, 440);
    g.fillStyle = "#f2e6d0"; g.font = `34px ${TW}`; ["JOHN DOE AKAN", "MERETAS AKUN", "KAMU"].forEach((s, i) => g.fillText(s, w / 2, 540 + i * 46));
    g.fillStyle = "#26090a"; g.fillRect(40, 680, w - 80, 70); g.fillStyle = "#ff6b6b"; g.font = `30px ${TW}`; g.fillText("teruskan ke 10 teman", w / 2, 726);
    for (let i = 0; i < 70; i++) { g.fillStyle = "rgba(255,255,255,.04)"; g.fillRect(0, i * 12, w, 2); }
  });
  const warnM = new THREE.MeshBasicMaterial({ map: warnT, toneMapped: false });
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 8.08), warnM); warn.position.set(0, 4.6, 0.19); phone.add(warn);
  const redL = new THREE.PointLight(0xc1272d, 3.2, 16, 0); redL.position.set(0, 5, 6); scene.add(redL);
  const rimL = new THREE.PointLight(0x6fe3ff, 2.2, 14, 0); rimL.position.set(1.5, 11, -5.4); scene.add(rimL);

  const shade = (c) => std(c, 0.85);
  const S = avatar({ skin: 0x34373e, shirt: 0x2a2d33, pants: 0x1c1e22, face: false, make: shade }); scene.add(S.G);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false });
  for (const sx of [-0.22, 0.22]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.09), eyeM); e.position.set(sx, 0.66, 0.64); S.head.add(e); }

  // ---------- s2: file box and the three case cards ----------
  const BOXX = 24;
  const crate = new THREE.Group(); crate.position.set(BOXX, 0, 3); scene.add(crate);
  const cm = std(0x3a2616, 0.7);
  box(15, 0.3, 7, cm, 0, 0.15, 0, crate); box(15, 4.5, 0.3, cm, 0, 2.25, 3.5, crate); box(15, 4.5, 0.3, cm, 0, 2.25, -3.5, crate); box(0.3, 4.5, 7, cm, -7.35, 2.25, 0, crate); box(0.3, 4.5, 7, cm, 7.35, 2.25, 0, crate);
  const labT = canvasTex(512, 128, (g, w, h) => { paper(g, w, h, rnd); g.fillStyle = INK; g.font = `52px ${TW}`; g.textAlign = "center"; g.fillText("ARSIP AKUN", w / 2, 82); });
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshStandardMaterial({ map: labT, roughness: 0.9 })); lab.position.set(0, 2.4, 3.67); crate.add(lab);
  for (let i = 0; i < 9; i++) { const f = box(14, 3.6 + rnd() * 0.6, 0.08, std(i % 2 ? 0xc9b48a : 0xb59c6e, 0.9), rnd() * 0.4 - 0.2, 2, -2.8 + i * 0.5, crate); f.rotation.x = -0.12; }

  const CARD = [
    { n: "1", name: "ROBLOX", kind: "roblox", id: "ID 1", date: ["DIBUAT", "27.02.2006 · 21:06:40 UTC"] },
    { n: "2", name: "JOHN DOE", kind: "john", id: "ID 2", date: ["DIBUAT", "27.02.2006 · 21:06:40 UTC"] },
    { n: "3", name: "JANE DOE", kind: "jane", id: "ID 3", date: ["DIBUAT", "27.02.2006 · 21:06:40 UTC"] },
    { n: "156", name: "BUILDERMAN", kind: "builder", id: "ID 156", date: ["DIBUAT", "08.03.2006"] },
  ];
  const cardTex = (c) => canvasTex(512, 692, (g, w, h) => {
    paper(g, w, h, rnd);
    g.strokeStyle = "rgba(26,26,26,.5)"; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = RED; g.fillRect(14, 14, w - 28, 92); g.fillStyle = "#fff"; g.font = `700 64px ${OS}`; g.textAlign = "left"; g.fillText("AKUN #" + c.n, 36, 84);
    g.fillStyle = "#2a2622"; g.fillRect(36, 128, 200, 230); portrait(g, 136, 220, 84, c.kind);
    g.fillStyle = INK; g.font = `30px ${TW}`; g.fillText(c.id, 256, 168); g.fillText("BERKAS", 256, 212); g.fillText("ARSIP", 256, 256);
    g.font = `700 ${c.name.length > 8 ? 70 : 82}px ${OS}`; g.fillText(c.name, 36, 444);
    g.fillStyle = "rgba(26,26,26,.6)"; g.fillRect(36, 470, w - 72, 4);
    g.font = `28px ${TW}`; g.fillStyle = "rgba(26,26,26,.55)"; g.fillText("DIBUAT: ____________", 36, 560); g.fillText("STATUS: ____________", 36, 620);
  });
  const stripTex = (c) => canvasTex(512, 132, (g, w, h) => { paper(g, w, h, rnd, "#efe7d6"); g.fillStyle = INK; g.textAlign = "center"; g.font = `26px ${TW}`; g.fillText(c.date[0], w / 2, 44); g.font = `${c.date[1].length > 12 ? 31 : 44}px ${TW}`; g.fillText(c.date[1], w / 2, 98); });
  const edge = std(0xc9b48a, 0.9);
  const pinM = std(0xc1272d, 0.35, 0.1, { emissive: 0x3a0505 });
  const mkPin = (parent, x, y, z) => { const p = new THREE.Group(); p.position.set(x, y, z); parent.add(p); const h = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), pinM); h.position.z = 0.32; h.castShadow = true; p.add(h); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), std(0xbbbbbb, 0.3, 0.9)); n.rotation.x = Math.PI / 2; n.position.z = 0.12; p.add(n); return p; };
  const cards = CARD.map((c) => {
    const G = new THREE.Group(); scene.add(G);
    const m = new THREE.Mesh(new THREE.BoxGeometry(4, 5.4, 0.06), [edge, edge, edge, edge, new THREE.MeshStandardMaterial({ map: cardTex(c), roughness: 0.85 }), edge]); m.castShadow = true; m.receiveShadow = true; G.add(m);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 0.95), new THREE.MeshStandardMaterial({ map: stripTex(c), roughness: 0.9 })); st.position.set(0, -1.62, 0.05); st.castShadow = true; G.add(st);
    const pin = mkPin(G, 0, 2.3, 0.03);
    return { G, st, pin };
  });
  const HOV = [0, 1, 2].map((i) => [BOXX - 4.6 + 4.6 * i, 9.5, 3]);
  const BRD = [[50, 13, -5.82], [54.6, 13, -5.82], [59.2, 13, -5.82]];
  const TILT = [-0.035, 0.025, -0.02];
  const tRise = [AT["s2:satu"], AT["s2:dua"], AT["s2:tiga"]], tFly = AT["s4:Ketiga"];
  const B156 = [112, 13, -5.82];

  // ---------- s3: dictionary card + red string ----------
  const DX = 38.5, DY = 13.6;
  const dictT = canvasTex(700, 500, (g, w, h) => {
    paper(g, w, h, rnd, "#ece3cf");
    g.strokeStyle = "rgba(111,160,200,.45)"; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, 150 + i * 40); g.lineTo(w, 150 + i * 40); g.stroke(); }
    g.strokeStyle = "rgba(193,39,45,.6)"; g.beginPath(); g.moveTo(0, 116); g.lineTo(w, 116); g.stroke();
    g.fillStyle = INK; g.font = `700 64px ${OS}`; g.fillText("JOHN DOE / JANE DOE", 34, 92);
    g.font = `34px ${TW}`; ["(n.) nama samaran untuk", "orang yang tidak", "diketahui namanya"].forEach((s, i) => g.fillText(s, 34, 182 + i * 40));
    g.fillStyle = RED; g.font = `46px ${TW}`; g.fillText("= si Fulan", 34, 352);
    g.fillStyle = "rgba(26,26,26,.6)"; g.font = `26px ${TW}`; g.fillText("KAMUS / AMERIKA", 34, 450);
  });
  const dict = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 0.06), [edge, edge, edge, edge, new THREE.MeshStandardMaterial({ map: dictT, roughness: 0.85 }), edge]); dict.position.set(DX, DY, -5.84); dict.rotation.z = 0.02; dict.castShadow = true; scene.add(dict);
  mkPin(dict, -3.2, 2.3, 0.03); mkPin(dict, 3.2, 2.3, 0.03);
  const DPIN = V(DX - 3.2, DY + 2.3, -5.5);
  const strMat = new THREE.MeshStandardMaterial({ color: 0xc1272d, roughness: 0.6, emissive: 0x4a0606 });
  const strand = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 6), strMat); m.castShadow = true; scene.add(m); return (a, b) => { const d = b.clone().sub(a); const L = d.length(); m.visible = L > 0.02; if (!m.visible) return; m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); m.scale.set(1, L, 1); }; };
  const str2 = strand(), str3 = strand(), str156 = strand();

  // ---------- s4: clocks, scan beam, empty slots ----------
  const faceT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#efe6d2"; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.fillStyle = INK; for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 108 : 96; g.save(); g.translate(128, 128); g.rotate(a); g.fillRect(-(i % 5 ? 1.5 : 3.5), -118, i % 5 ? 3 : 7, 118 - r0); g.restore(); } g.font = `700 34px ${OS}`; g.textAlign = "center"; g.textBaseline = "middle"; [["12", 0], ["3", 1], ["6", 2], ["9", 3]].forEach(([s, k]) => { const a = (k * Math.PI) / 2; g.fillText(s, 128 + Math.sin(a) * 74, 128 - Math.cos(a) * 74); }); });
  const handM = std(0x1a1a1a, 0.4), secM = new THREE.MeshBasicMaterial({ color: 0x6fe3ff, toneMapped: false });
  const clocks = [0, 1, 2].map((i) => {
    const G = new THREE.Group(); G.position.set(BRD[i][0], 7.3, -5.7); scene.add(G);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.3, 40), std(0x2a2a2e, 0.35, 0.7)); rim.rotation.x = Math.PI / 2; rim.castShadow = true; G.add(rim);
    const f = new THREE.Mesh(new THREE.CircleGeometry(1.3, 40), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.6 })); f.position.z = 0.16; G.add(f);
    const hand = (len, w, mat, z) => { const p = new THREE.Group(); p.position.z = z; G.add(p); const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.03), mat); m.position.y = len / 2 - 0.12; p.add(m); return p; };
    return { G, h: hand(0.7, 0.13, handM, 0.19), m: hand(1.05, 0.09, handM, 0.21), s: hand(1.15, 0.04, secM, 0.23), r: [rnd() * 12, rnd() * 60, rnd() * 60] };
  });
  const TH = 21 + 6 / 60 + 40 / 3600; // 21:06:40
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 15), new THREE.MeshBasicMaterial({ color: 0x6fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); beam.position.set(48, 11.5, -5.3); scene.add(beam);
  const glowT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(111,227,255,0)"); gr.addColorStop(0.5, "rgba(111,227,255,.5)"); gr.addColorStop(1, "rgba(111,227,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const beamGlow = new THREE.Mesh(new THREE.PlaneGeometry(3, 15), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); beamGlow.position.z = -0.01; beam.add(beamGlow);
  const slotT = (n) => canvasTex(512, 692, (g, w, h) => { g.clearRect(0, 0, w, h); g.setLineDash([26, 18]); g.strokeStyle = "rgba(240,228,200,.8)"; g.lineWidth = 9; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "rgba(240,228,200,.75)"; g.font = `700 140px ${OS}`; g.textAlign = "center"; g.fillText("#" + n, w / 2, 330); g.font = `40px ${TW}`; g.fillText("ID " + n, w / 2, 420); });
  const noneT = canvasTex(512, 150, (g, w, h) => { g.fillStyle = "rgba(193,39,45,.94)"; g.fillRect(8, 8, w - 16, h - 16); g.strokeStyle = "#fff"; g.lineWidth = 5; g.strokeRect(22, 22, w - 44, h - 44); g.fillStyle = "#fff"; g.font = `700 78px ${OS}`; g.textAlign = "center"; g.fillText("TIDAK ADA", w / 2, 106); });
  const slots = [4, 5].map((n, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 5.4), new THREE.MeshBasicMaterial({ map: slotT(n), transparent: true, opacity: 0, depthWrite: false })); m.position.set(63.8 + 4.6 * i, 13, -5.88); scene.add(m);
    const no = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.23), new THREE.MeshStandardMaterial({ map: noneT, transparent: true, roughness: 0.8 })); no.position.set(63.8 + 4.6 * i, 12.6, -5.6); no.rotation.z = i ? 0.1 : -0.12; scene.add(no);
    return { m, no, t: [AT["s4:empat"], AT["s4:lima"]][i] };
  });

  // ---------- s5: the long tape from #3 to #156 ----------
  const X3 = 59.2, X156 = 112, STEP = (X156 - X3) / 153;
  const tape = box(X156 - X3, 0.5, 0.5, std(0xd9c49a, 0.8), 0, 9.3, -5.55, scene); tape.geometry.translate((X156 - X3) / 2, 0, 0); tape.position.x = X3;
  const NT = 154, tk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1, 0.04), new THREE.MeshBasicMaterial({ toneMapped: false }), NT); tk.frustumCulled = false; scene.add(tk);
  const dm = new THREE.Object3D(), cDim = new THREE.Color(0x3a3024), cLit = new THREE.Color(0x6fe3ff), cEnd = new THREE.Color(0xc1272d), cc = new THREE.Color();
  for (let i = 0; i < NT; i++) { const n = i + 3, L = n % 10 === 0 ? 0.42 : 0.24; dm.position.set(X3 + i * STEP, 9.3 + 0.25 - L / 2, -5.29); dm.scale.set(n === 3 || n === 156 ? 2 : 1, n === 3 || n === 156 ? 0.5 / 1 : L, 1); dm.updateMatrix(); tk.setMatrixAt(i, dm.matrix); tk.setColorAt(i, cDim); }
  const s156strip = cards[3].st;

  // ---------- s6: the rumor swarm ----------
  const SWX = 150;
  const thumbT = (title) => canvasTex(300, 540, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1a0608"); gr.addColorStop(1, "#050506"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#15171b"; g.fillRect(110, 170, 80, 80); g.fillRect(90, 255, 120, 120); g.fillRect(60, 255, 28, 110); g.fillRect(212, 255, 28, 110);
    g.fillStyle = "#ff2a2a"; g.fillRect(126, 200, 16, 7); g.fillRect(158, 200, 16, 7);
    g.fillStyle = "#fff"; g.font = `700 50px ${OS}`; g.textAlign = "center"; title.forEach((s, i) => g.fillText(s, w / 2, 62 + i * 52));
    g.fillStyle = "#ffd38a"; g.fillRect(20, 420, 110, 52); g.fillStyle = INK; g.font = `700 40px ${OS}`; g.fillText("2017", 75, 460);
    g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.moveTo(200, 420); g.lineTo(200, 476); g.lineTo(248, 448); g.fill();
    for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(111,227,255,${0.08 + rnd() * 0.15})`; g.fillRect(0, rnd() * h, w, 3 + rnd() * 8); }
  });
  const thumbs = [["JOHN DOE", "HACK", "18 MARET"], ["AWAS!", "JOHN DOE", "18 MARET"], ["JOHN DOE", "MERETAS?", "18 MARET"]].map((t) => new THREE.MeshBasicMaterial({ map: thumbT(t), toneMapped: false }));
  const swarm = [];
  const bodyM = std(0x0f1013, 0.3, 0.6);
  const cells = [];
  for (let c = 0; c < 7; c++) for (let rr = 0; rr < 4; rr++) { const dx = (c - 3) * 4.4; if (Math.abs(dx) < 3 && rr < 3) continue; cells.push([dx, 3.6 + rr * 6, 1.5 + rnd() * 2]); }
  for (let c = 0; c < 6; c++) for (let rr = 0; rr < 4; rr++) cells.push([(c - 2.5) * 4.4, 6.6 + rr * 6 - 3, -3 + rnd() * 1.2]);
  cells.sort((a, b) => Math.hypot(a[0], a[1] - 8) - Math.hypot(b[0], b[1] - 8));
  const SW0 = K.s6 + 0.6, SW1 = AT["s6:TikTok"] + 0.3;
  cells.forEach((p, i) => {
    const G = new THREE.Group(); scene.add(G);
    const b = new THREE.Mesh(new THREE.BoxGeometry(3, 5.4, 0.3), bodyM); b.castShadow = true; G.add(b);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.76, 4.97), thumbs[i % 3]); s.position.z = 0.16; G.add(s);
    const u = i / cells.length;
    swarm.push({ G, p, t0: SW0 + (SW1 - SW0) * (1 - Math.pow(1 - u, 2.2)) * 0.92, ry: (rnd() - 0.5) * 0.5, rz: (rnd() - 0.5) * 0.25, ph: rnd() * 6.28 });
  });
  const swL = new THREE.PointLight(0xc1272d, 0, 40, 0); swL.position.set(SWX, 10, 8); scene.add(swL);

  // ---------- s7: rumor report, HOAKS stamp, status plate, fake login ----------
  const FX = 180;
  const repT = canvasTex(640, 480, (g, w, h) => {
    paper(g, w, h, rnd, "#eee6d4"); g.fillStyle = INK; g.font = `700 54px ${OS}`; g.fillText("LAPORAN RUMOR", 36, 74); g.fillStyle = RED; g.fillRect(36, 90, 250, 6);
    g.fillStyle = INK; g.font = `30px ${TW}`; ["Subjek : JOHN DOE (#2)", "Klaim  : meretas akun", "         18 Maret", "Sumber : video, 2017", "Bukti  : -"].forEach((s, i) => g.fillText(s, 36, 160 + i * 52));
  });
  const folder = new THREE.Group(); folder.position.set(FX, 0, 0.5); folder.rotation.y = 0.06; scene.add(folder);
  box(13, 0.12, 9.6, std(0xc9a86a, 0.85), 0, 0.06, 0, folder);
  box(4, 0.12, 1, std(0xc9a86a, 0.85), -4, 0.06, -5.2, folder);
  const rep = new THREE.Mesh(new THREE.PlaneGeometry(11, 8.25), new THREE.MeshStandardMaterial({ map: repT, roughness: 0.9 })); rep.rotation.x = -Math.PI / 2; rep.position.set(0.2, 0.14, 0.1); rep.receiveShadow = true; folder.add(rep);
  const inkT = canvasTex(512, 220, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = RED; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = RED; g.font = `700 150px ${OS}`; g.textAlign = "center"; g.fillText("HOAKS", w / 2, 170); g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${0.3 + rnd() * 0.7})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 4, 1 + rnd() * 3); } });
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.44), new THREE.MeshBasicMaterial({ map: inkT, transparent: true, opacity: 0, depthWrite: false })); ink.rotation.set(-Math.PI / 2, 0, 0.12); ink.position.set(0.6, 0.16, 0.6); folder.add(ink);
  const stamp = new THREE.Group(); scene.add(stamp);
  box(8.2, 0.5, 3.6, std(0x5a1012, 0.8), 0, 0.25, 0, stamp); box(8.4, 0.9, 3.8, std(0x2a1a10, 0.5), 0, 0.95, 0, stamp);
  cyl(0.6, 0.85, 3.4, 20, std(0x2a1a10, 0.45), 0, 3.1, 0, stamp); const knob = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 14), std(0x1a1a1a, 0.3, 0.3)); knob.position.y = 5.2; knob.castShadow = true; stamp.add(knob);
  const tSt = AT["s7:bukti"];
  const plateT = canvasTex(640, 150, (g, w, h) => { g.fillStyle = "#16191d"; g.fillRect(0, 0, w, h); g.strokeStyle = CY; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = "rgba(111,227,255,.55)"; g.font = `30px ${TW}`; g.fillText("STATUS", 36, 62); g.fillStyle = CY; g.font = `700 64px ${OS}`; g.fillText("TIDAK DIBLOKIR", 36, 128); });
  const plate = new THREE.Group(); scene.add(plate);
  box(8, 0.5, 1.9, std(0x2a2d33, 0.3, 0.8), 0, 0.25, 0, plate);
  const plF = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.78), new THREE.MeshBasicMaterial({ map: plateT, toneMapped: false })); plF.rotation.x = -Math.PI / 2; plF.position.y = 0.52; plate.add(plF);
  const tPl = AT["s7:diblokir"];
  const LX = 200;
  const login = new THREE.Group(); login.position.set(LX, 0, 2.2); login.rotation.y = -0.1; scene.add(login);
  box(5.4, 0.36, 10.2, std(0x111215, 0.3, 0.6), 0, 0.18, 0, login);
  const lgC = document.createElement("canvas"); lgC.width = 432; lgC.height = 800; const lg = lgC.getContext("2d");
  const lgT = new THREE.CanvasTexture(lgC); lgT.colorSpace = THREE.SRGBColorSpace; lgT.anisotropy = 8;
  const lgS = new THREE.Mesh(new THREE.PlaneGeometry(5, 9.26), new THREE.MeshBasicMaterial({ map: lgT, color: 0xa8a8a8, toneMapped: false })); lgS.rotation.x = -Math.PI / 2; lgS.position.y = 0.37; login.add(lgS);
  let lgKey = -1;
  const paintLogin = (st) => {
    if (st === lgKey) return; lgKey = st; const g = lg, w = 432, h = 800;
    g.fillStyle = "#eef1f5"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1f2733"; g.fillRect(0, 0, w, 96); g.fillStyle = "#fff"; g.font = `700 40px ${OS}`; g.textAlign = "center"; g.fillText("VERIFIKASI AKUN", w / 2, 64);
    g.fillStyle = "#b01e24"; g.font = `26px ${TW}`; ["Akunmu akan diretas", "John Doe 18 Maret!"].forEach((s, i) => g.fillText(s, w / 2, 160 + i * 36));
    g.textAlign = "left"; g.fillStyle = "#4a5566"; g.font = `500 28px ${OS}`; g.fillText("Nama pengguna", 40, 290); g.fillText("Password", 40, 430);
    g.fillStyle = "#fff"; g.strokeStyle = "#9aa6b8"; g.lineWidth = 3; g.beginPath(); g.roundRect(40, 304, w - 80, 70, 12); g.fill(); g.stroke();
    g.fillStyle = "#1f2733"; g.font = `30px ${TW}`; g.fillText("pemain_123", 60, 350);
    g.fillStyle = st >= 1 ? "#ffe3e3" : "#fff"; g.strokeStyle = st >= 1 ? "#c1272d" : "#9aa6b8"; g.lineWidth = st >= 1 ? 7 : 3; g.beginPath(); g.roundRect(40, 444, w - 80, 70, 12); g.fill(); g.stroke();
    g.fillStyle = st >= 1 ? "#c1272d" : "#1f2733"; g.font = `700 40px ${OS}`; g.fillText("• • • • • • •", 60, 492);
    g.fillStyle = "#2f6fd6"; g.beginPath(); g.roundRect(40, 560, w - 80, 76, 14); g.fill(); g.fillStyle = "#fff"; g.textAlign = "center"; g.font = `700 36px ${OS}`; g.fillText("KIRIM", w / 2, 610);
    g.fillStyle = "#8a93a6"; g.font = `22px ${TW}`; g.fillText("ilustrasi, bukan situs asli", w / 2, 740);
    if (st >= 2) { g.fillStyle = "rgba(160,20,26,.88)"; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-0.2); g.strokeStyle = "#fff"; g.lineWidth = 10; g.strokeRect(-190, -80, 380, 160); g.fillStyle = "#fff"; g.font = `700 92px ${OS}`; g.fillText("PENIPUAN", 0, 34); g.restore(); }
    lgT.needsUpdate = true;
  };
  const lgL = new THREE.PointLight(0xc1272d, 0, 18, 0); lgL.position.set(LX, 5, 4); scene.add(lgL);

  // ---------- s8: the real lamp ----------
  const LMX = 226;
  const lampG = new THREE.Group(); lampG.position.set(LMX + 3.2, 0, -1.6); scene.add(lampG);
  const lampM = std(0x1c1d20, 0.35, 0.7);
  cyl(1.7, 1.9, 0.45, 32, lampM, 0, 0.22, 0, lampG);
  const arm1 = box(0.32, 5.4, 0.32, lampM, 0, 2.9, 0, lampG); arm1.rotation.z = 0.12;
  const shadeG = new THREE.Group(); shadeG.position.set(-1.6, 6.0, 1.4); shadeG.rotation.set(0.35, 0, 0.55); lampG.add(shadeG);
  const sh = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.2, 32, 1, true), std(0x1c1d20, 0.35, 0.7, { side: THREE.DoubleSide })); sh.castShadow = true; shadeG.add(sh);
  const bulbM = new THREE.MeshBasicMaterial({ color: 0x332a1c, toneMapped: false });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), bulbM); bulb.position.y = -0.7; shadeG.add(bulb);
  const lampL = new THREE.SpotLight(LAMP, 0, 0, 0.7, 0.75, 0); lampL.castShadow = true; lampL.shadow.mapSize.set(1024, 1024); lampL.position.set(LMX + 1.4, 5.2, 0.4); lampL.target.position.set(LMX, 0, 3); scene.add(lampL, lampL.target);
  const card2b = new THREE.Mesh(new THREE.BoxGeometry(4, 5.4, 0.06), [edge, edge, edge, edge, new THREE.MeshStandardMaterial({ map: cardTex(CARD[1]), roughness: 0.85 }), edge]); card2b.rotation.set(-Math.PI / 2, 0, -0.35); card2b.position.set(LMX - 4.2, 0.04, 4.2); card2b.receiveShadow = true; scene.add(card2b);

  // ---------- the figurine: John Doe, plain and harmless ----------
  const J = avatar({ skin: 0xcfc6ad, shirt: 0x5d6672, pants: 0x2a2d33 }); J.G.scale.setScalar(0.55); scene.add(J.G);
  const JS = 0.55;

  // dust in the light
  const NDU = 1400, du = pts(scene, NDU, { color: 0xffd38a, size: 0.12, opacity: 0.55 });
  const dB = []; for (let i = 0; i < NDU; i++) dB.push([-14 + rnd() * 256, 0.5 + rnd() * 22, -5 + rnd() * 22, rnd() * 6.28, 0.2 + rnd() * 0.5]);

  // camera: t px py pz lx ly lz
  const c0 = track([
    [0, 0, 6.6, 36, 0, 6.0, 0], [6.6, 0.6, 6.2, 28, 0, 6.0, -1],
    [8.6, 23.6, 8.6, 43, 24, 8.0, 0], [14.8, 24.6, 8.8, 41, 24.6, 8.2, 0],
    [17.0, 28.5, 11, 39, 29, 11, -1], [22.4, 33.5, 13.2, 36, 33.5, 13.4, -3], [25.8, 38.2, 14.6, 29, 38.4, 14.6, -5],
    [29.0, 47, 11.8, 41, 47, 11.2, -5], [31.6, 54.6, 11.4, 41, 54.6, 10.9, -5], [38.6, 56.2, 11.2, 39, 56.2, 10.9, -5], [40.6, 63, 11, 42, 63, 10.7, -5],
    [42.8, 62.5, 11.8, 34, 62.5, 11.3, -5], [46.0, 84, 11.8, 33, 84, 11.4, -5], [48.9, 108, 12.2, 33, 108.5, 11.8, -5], [50.4, 112, 12, 36, 112, 11.6, -5],
    [52.4, 150, 9.6, 56, 150, 8.6, 0], [64.4, 150, 9.2, 46, 150, 8.8, 0],
    [66.4, 181.5, 27, 26, 181.5, 1, 1.5], [70.6, 183.5, 26.5, 27, 183.5, 1, 3.2], [73.4, 198.5, 23.5, 22, 198.5, 1, 2.5], [76.9, 199.5, 18.5, 16.5, 199.5, 1, 2.5], [78.0, 200, 18, 16, 200, 1, 2.5],
    [79.8, 226.4, 4.2, 18.5, 226, 2.4, 2], [K.dur, 225.6, 4.0, 16.8, 226, 2.4, 2],
  ]);

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  const cardPose = (i, t) => {
    if (i === 3) { const u = clamp01((t - AT["s5:builderman"]) / 0.45); return { p: [B156[0], B156[1] + (1 - eout(u)) * 2, B156[2] + (1 - u) * 1.5], rz: 0.03, s: 0.6 + 0.4 * back(u, 2), vis: u > 0, pinned: u >= 1 }; }
    const ur = clamp01((t - tRise[i]) / 0.6), uf = clamp01((t - tFly - i * 0.3) / 0.9);
    const hov = [HOV[i][0], 1.6 + (HOV[i][1] - 1.6) * back(ur, 1.3), HOV[i][2]];
    if (uf <= 0) return { p: hov, rz: Math.sin(t * 1.3 + i * 2) * 0.04 * ur, ry: Math.sin(t * 0.9 + i) * 0.1 * ur, s: 1, vis: t > tRise[i] - 0.3, pinned: false };
    const e = smooth(uf), p = lerpV(hov, BRD[i], e); p[1] += Math.sin(Math.PI * uf) * 2.5;
    return { p, rz: lerp(0, TILT[i], e), ry: Math.sin(Math.PI * uf) * 0.5, s: 1, vis: true, pinned: uf >= 1 };
  };
  const cardTop = (i, t) => { const c = cardPose(i, t); return [c.p[0], c.p[1] + 2.7, c.p[2] + 0.25]; };

  // figurine state: feet position, facing, pose
  const DTOP = [DX - 1.5, DY + 2.5, -5.55];
  const RIM = [BOXX + 7.35, 4.5, 3];
  const jState = (t) => {
    const W = (k) => AT[k];
    if (t < W("s2:Doe") - 0.15) return null;
    if (t < K.s3 + 0.5) { const u = clamp01((t - W("s2:Doe")) / 0.55); return { p: arc([BOXX + 5.5, 0.4, 3], RIM, u, 3.4), ry: -0.4, pose: u < 1 ? "jump" : t > W("s2:Jane") ? "wave" : "rest" }; }
    const c2 = cardTop(1, t);
    if (t < 17.7) { const u = clamp01((t - (K.s3 + 0.5)) / 0.7); return { p: arc(RIM, c2, u, 3.5), ry: -0.3, pose: u < 1 ? "jump" : "rest" }; }
    if (t < 22.6) { const u = clamp01((t - 17.7) / 4.9), p = lerpV(c2, [DPIN.x, DPIN.y, DPIN.z - 0.05], u); return { p, ry: Math.atan2(DPIN.x - c2[0], DPIN.z - c2[2]), pose: "rope", ph: t * 5 }; }
    if (t < W("s4:dibuat")) { const u = clamp01((t - 22.6) / 0.5); return { p: arc([DPIN.x, DPIN.y, DPIN.z - 0.05], DTOP, u, 0.8), ry: 0, pose: u < 1 ? "jump" : "rest" }; }
    const tops = [0, 1, 2].map((i) => [BRD[i][0], 8.75, -5.0]);
    const j1 = W("s4:dibuat"), j2 = W("s4:sama") + 0.5, j3 = W("s4:Februari"), j4 = W("s4:empat");
    if (t < j2) { const u = clamp01((t - j1) / 0.9); return { p: arc(DTOP, tops[0], u, 4), ry: 0, pose: u < 1 ? "jump" : "rest" }; }
    if (t < j3) { const u = clamp01((t - j2) / 0.5); return { p: arc(tops[0], tops[1], u, 1.8), ry: 0, pose: u < 1 ? "jump" : "rest" }; }
    if (t < j4) { const u = clamp01((t - j3) / 0.5); return { p: arc(tops[1], tops[2], u, 1.8), ry: 0, pose: u < 1 ? "jump" : "look" }; }
    if (t < K.s5) { const u = clamp01((t - j4) / 0.5); if (u < 1) return { p: arc(tops[2], [63.8, 8.75, -5.0], u, 1.8), ry: 0, pose: "jump" }; const f = t - j4 - 0.5; return f > 1.2 ? null : { p: [63.8, 8.75 - 14 * f * f, -5.0], ry: 0, pose: "fall" }; }
    if (t < K.s6) {
      const a0 = K.s5 + 0.5; if (t < a0) return null;
      if (t < a0 + 0.6) { const u = (t - a0) / 0.6; return { p: arc([60.6, 3, -5.55], [60.6, 9.55, -5.55], u, 1.5), ry: 0, pose: "jump" }; }
      const r0 = a0 + 1.0, r1 = W("s5:delapan") + 0.2;
      if (t < r0) return { p: [60.6, 9.55, -5.55], ry: 0, pose: "rest" };
      const u = clamp01((t - r0) / (r1 - r0)), x = lerp(60.6, 109.6, smooth(u * 0.9 + 0.1 * u * u) * 1);
      return u < 1 ? { p: [x, 9.55, -5.55], ry: Math.PI / 2, pose: "run", ph: t * 13 } : { p: [109.6, 9.55, -5.55], ry: Math.PI * 0.85, pose: "look" };
    }
    if (t < K.s7 - 0.3) return null;
    const pA = [FX + 7, 0, 4.2], pB = [LX - 3.7, 0, 4.6];
    if (t < K.s8 - 0.4) {
      const tw = W("s7:Kalau");
      if (t < tw) { const hu = clamp01((t - tSt - 0.22) / 0.45); return { p: [pA[0], Math.sin(Math.PI * hu) * 1.6, pA[2]], ry: -0.5, pose: hu > 0 && hu < 1 ? "jump" : "rest" }; }
      const u = clamp01((t - tw) / 2.3);
      if (u < 1) return { p: lerpV(pA, pB, smooth(u)), ry: Math.PI / 2, pose: "run", ph: t * 9, amt: 0.6 };
      return { p: pB, ry: t > W("s7:penipuan") ? 0.2 : Math.PI / 2, pose: t > W("s7:penipuan") ? "cross" : "rest" };
    }
    return { p: [LMX, 0, 3], ry: 0.15, pose: t > K.s8 + 0.6 ? "wave" : "rest" };
  };

  return (t) => {
    const p = c0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    // lamp pool rides above the camera target
    const fear = t < K.s2 - 0.3 ? 1 : 0, sw = t > K.s6 + 0.5 && t < K.s7 ? 1 : 0;
    key.position.set(p[3] + 4, p[4] + 30, p[5] + 16); key.target.position.set(p[3], p[4] - 3, p[5]);
    key.intensity = fear ? 1.2 : sw ? 2.2 : t > K.s8 ? 2.4 : 5.6;
    hemi.intensity = t > K.s8 ? 0.45 : 0.6;

    // s1 warning flicker
    const fl = Math.floor(t * 14), fh = ((fl * 2654435761) >>> 0) % 100;
    const glitch = t < K.s2 && fh < 12;
    warnM.color.setScalar(t < K.s2 ? (glitch ? 0.35 : 0.85 + 0.15 * Math.sin(t * 9)) : 0.25);
    warn.position.x = glitch ? (fh % 2 ? 0.08 : -0.08) : 0;
    redL.intensity = t < K.s2 + 1 ? (glitch ? 1 : 3.2) : 0.4;
    rimL.intensity = t < K.s2 + 1 ? 2.2 : 0;

    // silhouette: behind the phone in s1, the swollen rumor in s6
    let sv = false;
    if (t < K.s2 + 1) { sv = true; const lean = ramp(t, AT["s1:John"] ?? 3, (AT["s1:John"] ?? 3) + 1.5); S.G.position.set(0.3, 0, -2.6 + lean * 0.9); S.G.scale.setScalar(2.05); S.G.rotation.y = Math.sin(t * 0.7) * 0.12; S.head.rotation.y = Math.sin(t * 1.1) * 0.2; restPose(S); S.armL.rotation.z = -0.15; S.armR.rotation.z = 0.15; }
    else if (t > K.s6 - 0.6 && t < K.s7 + 1.2) {
      sv = true; const grow = ramp(t, AT["s6:rumor"], AT["s6:TikTok"] + 0.5), shrink = ramp(t, K.s7 + 0.1, K.s7 + 0.9);
      S.G.position.set(SWX, 0, -0.5); S.G.scale.setScalar(Math.max(0.001, (1.7 + 0.9 * grow) * (1 - shrink))); S.G.rotation.y = Math.sin(t * 0.8) * 0.15; S.head.rotation.y = Math.sin(t * 1.7) * 0.3;
      const up = ramp(t, AT["s6:rumor"], AT["s6:rumor"] + 0.6);
      S.armL.rotation.set(0, 0, -up * 2.3 - Math.sin(t * 6) * 0.1 * up); S.armR.rotation.set(0, 0, up * 2.3 + Math.sin(t * 6 + 1) * 0.1 * up); S.legL.rotation.set(0, 0, 0); S.legR.rotation.set(0, 0, 0);
    }
    S.G.visible = sv;
    eyeM.color.setRGB(1, 0.12 + 0.1 * Math.sin(t * 5), 0.12);

    // cards
    cards.forEach((c, i) => {
      const s = cardPose(i, t);
      c.G.visible = s.vis; c.G.position.set(s.p[0], s.p[1], s.p[2]); c.G.rotation.set(0, s.ry || 0, s.rz); c.G.scale.setScalar(s.s);
      c.pin.visible = s.pinned;
      const ts = i === 3 ? AT["s5:delapan"] : AT["s4:Februari"] + i * 0.18, us = clamp01((t - ts) / 0.25);
      c.st.visible = us > 0; c.st.scale.setScalar(Math.max(0.001, 1.4 - 0.4 * eout(us))); c.st.rotation.z = (i % 2 ? 0.05 : -0.04) * eout(us);
    });
    // red strings to the dictionary card
    const g2 = ramp(t, AT["s3:John"], AT["s3:John"] + 0.8), g3 = ramp(t, AT["s3:Jane"], AT["s3:Jane"] + 0.8);
    const a2 = cardTop(1, t), a3 = cardTop(2, t);
    tmpA.set(a2[0], a2[1] + 0.05, a2[2]); tmpB.copy(tmpA).lerp(DPIN, g2); str2(tmpA, tmpB);
    tmpA.set(a3[0], a3[1] + 0.05, a3[2]); tmpB.copy(tmpA).lerp(V(DX + 3.2, DY + 2.3, -5.5), g3); str3(tmpA, tmpB);
    // string from #3 to #156 in s5
    const g156 = ramp(t, AT["s5:builderman"] + 0.3, AT["s5:delapan"]);
    tmpA.set(X3, 15.75, -5.45); tmpB.set(lerp(X3, B156[0], g156), 15.75, -5.45); str156(tmpA, tmpB);

    // clocks: three different times that snap to the same second
    const cu = ramp(t, AT["s4:detik"], AT["s4:sama"] + 0.4), cv = clamp01((t - AT["s4:dibuat"]) / 0.4);
    clocks.forEach((c, i) => {
      c.G.visible = cv > 0; c.G.scale.setScalar(Math.max(0.001, back(cv, 2)));
      const tick = Math.floor(t);
      const rs = (c.r[2] + tick * 1) % 60, rm = c.r[1], rh = c.r[0];
      const sec = lerp(rs, 40, cu), mn = lerp(rm, 6 + 40 / 60, cu), hr = lerp(rh, TH - 12, cu);
      c.s.rotation.z = -(sec / 60) * Math.PI * 2; c.m.rotation.z = -(mn / 60) * Math.PI * 2; c.h.rotation.z = -(hr / 12) * Math.PI * 2;
    });
    // cyan scan beam over the database rows
    const sc1 = clamp01((t - AT["s4:API"]) / 1.3), sc2 = clamp01((t - AT["s4:sama"]) / 0.9);
    const scn = sc2 > 0 && sc2 < 1 ? sc2 : sc1;
    beam.visible = (sc1 > 0 && sc1 < 1) || (sc2 > 0 && sc2 < 1);
    beam.position.x = lerp(46.5, 62.5, scn); beam.material.opacity = Math.sin(Math.PI * scn) * 0.9; beamGlow.material.opacity = beam.material.opacity * 0.6;
    slots.forEach((s) => { const u = clamp01((t - s.t) / 0.35), un = clamp01((t - AT["s4:Tidak"]) / 0.22); s.m.material.opacity = 0.85 * u; s.no.visible = un > 0; s.no.scale.setScalar(Math.max(0.001, 1.6 - 0.6 * eout(un))); });

    // tape and ticks
    const tu = ramp(t, K.s5 - 0.2, K.s5 + 1.2);
    tape.visible = tu > 0; tape.scale.x = Math.max(0.001, tu);
    const js = jState(t), jx = js && t > K.s5 && t < K.s6 ? js.p[0] : t >= K.s6 ? 999 : -999;
    for (let i = 0; i < NT; i++) { const x = X3 + i * STEP, n = i + 3; const lit = n === 3 || n === 156 ? (tu >= 1 ? 1 : 0) : x <= jx ? 1 : 0; cc.copy(n === 3 || n === 156 ? cEnd : cDim).lerp(n === 3 || n === 156 ? cEnd : cLit, lit); tk.setColorAt(i, cc); }
    tk.visible = tu > 0.98 && t < K.s6 + 2; tk.instanceColor.needsUpdate = true;

    // rumor swarm
    const gl = Math.floor(t * 10);
    swarm.forEach((s, i) => {
      const u = clamp01((t - s.t0) / 0.32), out = ramp(t, K.s7 + 0.2, K.s7 + 1.0);
      s.G.visible = u > 0 && out < 1 && t < K.s7 + 1.1;
      if (!s.G.visible) return;
      const h = ((gl * 73856093) ^ (i * 19349663)) >>> 0, gj = t > AT["s6:rumor"] && h % 100 < 9;
      s.G.position.set(SWX + s.p[0] + (gj ? (h % 2 ? 0.5 : -0.5) : 0), s.p[1] + Math.sin(t * 1.2 + s.ph) * 0.25 - out * 14, s.p[2]);
      s.G.rotation.set(0, s.ry + Math.sin(t * 0.7 + s.ph) * 0.06, s.rz + out * 1.5);
      s.G.scale.setScalar(Math.max(0.001, back(u, 2.2)) * (gj ? 1.08 : 1));
    });
    swL.intensity = t > K.s6 && t < K.s7 + 0.8 ? 1.2 + 1.2 * ramp(t, SW0, SW1) + (((gl * 31) % 7) < 1 ? 1.2 : 0) : 0;

    // stamp: drops on "bukti", leaves HOAKS ink
    const sd = clamp01((t - (tSt - 0.25)) / 0.25), su = ramp(t, tSt + 0.45, tSt + 1.1);
    stamp.visible = t > tSt - 1.2 && t < tSt + 1.4;
    stamp.position.set(FX + 0.6, 0.16 + (1 - Math.pow(sd, 2.2)) * 13 + su * 15, 1.1 - su * 4); stamp.rotation.set(su * 0.4, 0.12, 0);
    ink.material.opacity = t >= tSt ? 0.95 : 0;
    const pu = clamp01((t - tPl) / 0.45); plate.visible = pu > 0; plate.position.set(FX + 4.5 + (1 - eout(pu)) * -12, 0, 6.0); plate.rotation.y = 0.04 + (1 - eout(pu)) * 0.4;
    const lst = t > AT["s7:penipuan"] ? 2 : t > AT["s7:password"] ? 1 : 0; paintLogin(lst);
    const shake = lst === 1 ? Math.sin(t * 60) * 0.06 : 0; login.position.x = LX + shake;
    lgL.intensity = lst === 2 ? 2.4 + Math.sin(t * 12) * 0.5 : lst === 1 ? 1.2 : 0;

    // lamp clicks on for the last scene
    const on = t > K.s8 + 0.15 ? (t < K.s8 + 0.6 ? ([1, 0, 1, 0.3, 1][Math.floor((t - K.s8 - 0.15) * 11) % 5]) : 1) : 0;
    lampL.intensity = on * 7; bulbM.color.setHex(on > 0.5 ? 0xffe4a8 : 0x332a1c);

    // figurine
    const st = jState(t);
    J.G.visible = !!st;
    if (st) {
      J.G.position.set(st.p[0], st.p[1], st.p[2]); J.G.rotation.set(0, st.ry, 0); restPose(J); J.head.rotation.set(0, 0, 0);
      if (st.pose === "run") runPose(J, st.ph, st.amt ?? 1);
      else if (st.pose === "jump") { J.armL.rotation.x = -2.6; J.armR.rotation.x = -2.6; J.legL.rotation.x = 0.5; J.legR.rotation.x = -0.3; }
      else if (st.pose === "fall") { J.armL.rotation.set(-2.8 + Math.sin(t * 22) * 0.4, 0, -0.3); J.armR.rotation.set(-2.8 - Math.sin(t * 22) * 0.4, 0, 0.3); J.legL.rotation.x = Math.sin(t * 18) * 0.5; J.legR.rotation.x = -Math.sin(t * 18) * 0.5; }
      else if (st.pose === "rope") { J.armL.rotation.z = -1.35 + Math.sin(t * 3) * 0.25; J.armR.rotation.z = 1.35 + Math.sin(t * 3) * 0.25; runPose(J, st.ph, 0.35); J.armL.rotation.x = 0; J.armR.rotation.x = 0; J.G.rotation.z = Math.sin(t * 3) * 0.08; }
      else if (st.pose === "wave") { J.armR.rotation.z = 2.6 + Math.sin(t * 8) * 0.35; J.head.rotation.z = Math.sin(t * 2) * 0.08; }
      else if (st.pose === "look") { J.head.rotation.x = -0.35; J.head.rotation.y = Math.sin(t * 1.5) * 0.4; }
      else if (st.pose === "cross") { J.armL.rotation.set(-1.45, 0, 0.75); J.armR.rotation.set(-1.45, 0, -0.75); J.head.rotation.y = Math.sin(t * 5) * 0.25; }
      else { J.head.rotation.y = Math.sin(t * 0.9) * 0.2; }
      J.G.scale.setScalar(JS);
    }

    // dust drifting through the light
    for (let i = 0; i < NDU; i++) { const d = dB[i]; du.pos[i * 3] = d[0] + Math.sin(t * d[4] + d[3]) * 0.8; du.pos[i * 3 + 1] = d[1] + Math.sin(t * d[4] * 0.7 + d[3] * 2) * 0.6; du.pos[i * 3 + 2] = d[2] + Math.cos(t * d[4] * 0.5 + d[3]) * 0.6; }
    du.commit();
    comp.render();
  };
}
