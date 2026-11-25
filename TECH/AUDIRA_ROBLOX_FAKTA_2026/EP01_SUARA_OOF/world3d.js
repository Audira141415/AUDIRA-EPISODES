// RUANG REKAM: one long studio desk at night, a tape lab. The camera dollies station to station while an LED waveform wall runs behind everything.
// Illustration only, no Roblox assets, no faces of real people. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose } from "./lib3d.js";

const CH = "#121014", OR = "#FF6B1A", AM = "#FFB000", CR = "#F3E9D2", RD = "#E8384F";
const DF = "'Archivo Black','Arial Black',sans-serif", MF = "'IBM Plex Mono','Courier New',monospace";
const X1 = 0, X3 = 34, X4 = 66, X5 = 98, X7 = 130;
const BEAT = 60 / 84;

export function create(canvas, K, AT) {
  const { scene, cam, comp } = stage(canvas, { bg: 0x121014, fog: 0.007, exp: 1.08, bloom: [0.6, 0.5, 0.8] });
  const rnd = mulberry(4101);
  // Textures that use web fonts are redrawn once the fonts are ready.
  const TX = [];
  const tex = (w, h, draw, rep) => { const t = canvasTex(w, h, draw, rep); TX.push([t, draw, w, h]); return t; };
  const basic = (map, extra = {}) => new THREE.MeshBasicMaterial({ map, toneMapped: false, transparent: true, ...extra });
  const plane = (w, h, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); parent.add(m); return m; };
  const faced = (w, h, d, sideMat, frontMat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat]); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (parent || scene).add(m); return m; };

  // light: warm key that follows the camera target, tape-orange rim from behind
  scene.add(new THREE.HemisphereLight(0x9a8a9c, 0x1a1418, 0.85));
  const key = new THREE.DirectionalLight(0xffe2c2, 2.7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 }); key.shadow.camera.updateProjectionMatrix(); key.shadow.bias = -0.0005; key.shadow.radius = 4;
  const rim = new THREE.DirectionalLight(0xff6b1a, 1.8);
  scene.add(key, key.target, rim, rim.target);

  // desk, foam wall, LED backplate
  const wood = canvasTex(1024, 512, (g, w, h) => { const r2 = mulberry(7); g.fillStyle = "#2c2126"; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { const y = r2() * h; g.strokeStyle = `rgba(${r2() < 0.5 ? "84,60,52" : "16,11,13"},${0.2 + r2() * 0.4})`; g.lineWidth = 1 + r2() * 2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r2() * 8 - 4, w * 0.6, y + r2() * 8 - 4, w, y + r2() * 6 - 3); g.stroke(); } }, [14, 2]);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(300, 34), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.38, metalness: 0.05 }));
  desk.rotation.x = -Math.PI / 2; desk.position.set(65, 0, 7); desk.receiveShadow = true; scene.add(desk);
  const foam = canvasTex(256, 256, (g, w) => { g.fillStyle = "#171317"; g.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 64, y = j * 64; const gr = (i + j) % 2 ? g.createLinearGradient(x, y, x + 64, y) : g.createLinearGradient(x, y, x, y + 64); gr.addColorStop(0, "#2c232a"); gr.addColorStop(0.5, "#120e12"); gr.addColorStop(1, "#2c232a"); g.fillStyle = gr; g.fillRect(x + 2, y + 2, 60, 60); } }, [70, 9]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(300, 40), new THREE.MeshStandardMaterial({ map: foam, roughness: 1 })); wall.position.set(65, 14, -9); wall.receiveShadow = true; scene.add(wall);

  const COLS = 310, ROWS = 18, SP = 0.55, LX0 = -18, LZ = -6.2;
  box(COLS * SP + 1, ROWS * SP + 0.9, 0.3, std(0x0b090c, 0.7), LX0 + (COLS * SP) / 2 - SP / 2, 1.3 + (ROWS * SP) / 2 - SP / 2, LZ - 0.3);
  box(COLS * SP + 1, 0.12, 0.34, std(0xff6b1a, 0.4, 0.3, { emissive: 0xff6b1a, emissiveIntensity: 0.6 }), LX0 + (COLS * SP) / 2 - SP / 2, 0.75, LZ - 0.1);
  const LED = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.44, 0.16), new THREE.MeshBasicMaterial({ toneMapped: false }), COLS * ROWS);
  LED.frustumCulled = false; scene.add(LED);
  const dummy = new THREE.Object3D();
  const LOFF = new THREE.Color(0x1f171b), LAM = new THREE.Color(0xffb000).multiplyScalar(1.2), LOR = new THREE.Color(0xff6b1a).multiplyScalar(1.4), LRD = new THREE.Color(0xe8384f).multiplyScalar(1.3), LCR = new THREE.Color(0xf3e9d2).multiplyScalar(0.8), LGR = new THREE.Color(0x77707a).multiplyScalar(0.9);
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) { dummy.position.set(LX0 + c * SP, 1.3 + r * SP, LZ); dummy.updateMatrix(); LED.setMatrixAt(c * ROWS + r, dummy.matrix); LED.setColorAt(c * ROWS + r, LOFF); }
  // "OOF" as a dot-matrix mask, stretched tall so the letters read as a waveform
  const MC = 26, MC0 = Math.round((X1 - LX0) / SP) - 13, MASK = new Uint8Array(MC * ROWS);
  const buildMask = () => {
    const cv = document.createElement("canvas"); cv.width = MC * 10; cv.height = ROWS * 10; const g = cv.getContext("2d");
    g.font = `100px ${DF}`; const w = g.measureText("OOF").width, fs = (100 * (MC * 10 - 14)) / w, cap = 0.72 * fs, sy = (ROWS * 10 - 22) / cap;
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.font = `${fs}px ${DF}`;
    g.translate(cv.width / 2, cv.height / 2); g.scale(1, sy); g.fillText("OOF", 0, cap / 2);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    for (let c = 0; c < MC; c++) for (let r = 0; r < ROWS; r++) MASK[c * ROWS + r] = d[(((ROWS - 1 - r) * 10 + 5) * cv.width + c * 10 + 5) * 4 + 3] > 110 ? 1 : 0;
  };
  buildMask();

  // ---- S1: tall studio monitor speaker the avatar falls off, mic on a stand ----
  const spk = new THREE.Group(); spk.position.set(-7.5, 0, 0); scene.add(spk);
  box(4.2, 6, 3.6, std(0x221c22, 0.55), 0, 3, 0, spk);
  const cone = (r, y) => { const m = cyl(r, r * 0.82, 0.3, 36, std(0x0d0b0d, 0.35, 0.3), 0, y, 1.85, spk); m.rotation.x = Math.PI / 2; const dc = cyl(r * 0.34, r * 0.34, 0.34, 24, std(0xff6b1a, 0.4, 0.2), 0, 0, 0, m); dc.position.y = 0.02; const tr = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.07, 8, 40), std(0xff6b1a, 0.4, 0.4)); tr.position.set(0, y, 1.82); spk.add(tr); return m; };
  const woof = cone(1.45, 2.2); cone(0.6, 4.85);
  const mic = new THREE.Group(); mic.position.set(X1 + 6.2, 0, -1.6); scene.add(mic);
  cyl(1.1, 1.2, 0.2, 24, std(0x1a161a, 0.4, 0.6), 0, 0.1, 0, mic); cyl(0.09, 0.09, 6.4, 10, std(0x2a252a, 0.35, 0.7), 0, 3.3, 0, mic);
  cyl(0.55, 0.55, 1.9, 24, std(0xc9c2b4, 0.25, 0.85), 0, 7.2, 0, mic); const grill = cyl(0.57, 0.57, 0.9, 24, std(0x3a343a, 0.5, 0.6, { wireframe: false }), 0, 7.6, 0, mic); grill.castShadow = false;

  // avatar, restyled in studio colours; materials kept so it can go grey in the flat years
  const mats = [];
  const A = avatar({ skin: 0xffb000, shirt: 0xff6b1a, pants: 0xe9dcc0, make: (c) => { const m = std(c, 0.5); m.userData.base = new THREE.Color(c); const l = m.userData.base.r * 0.3 + m.userData.base.g * 0.59 + m.userData.base.b * 0.11; m.userData.grey = new THREE.Color(l, l, l * 1.05); mats.push(m); return m; } });
  A.G.scale.setScalar(0.8); scene.add(A.G);
  const parts = [
    { o: A.torso, rest: [0, 3, 0], fin: [0.3, 0.5, 0.3], rot: [-Math.PI / 2, 0.4], k: 1, h: 5 },
    { o: A.head, rest: [0, 4, 0], fin: [-2.7, 0.62, 1.5], rot: [Math.PI / 2, -0.8], k: 2, h: 7 },
    { o: A.armL, rest: [-1.5, 4, 0], fin: [-2.3, 0.49, -1.0], rot: [Math.PI / 2, 0.9], k: 1, h: 6 },
    { o: A.armR, rest: [1.5, 4, 0], fin: [2.6, 0.49, -0.4], rot: [Math.PI / 2, -1.9], k: 2, h: 6.5 },
    { o: A.legL, rest: [-0.5, 2, 0], fin: [-0.9, 0.49, 2.3], rot: [Math.PI / 2, -0.5], k: 1, h: 4 },
    { o: A.legR, rest: [0.5, 2, 0], fin: [1.9, 0.49, 1.6], rot: [Math.PI / 2, 1.1], k: 1, h: 4.5 },
  ];
  parts.forEach((p) => (p.o.rotation.order = "YXZ"));
  const setParts = (u, hs, kk) => {
    const w = clamp01(u / 0.72), e = eout(w);
    const bo = u > 0.72 ? 0.32 * hs * Math.abs(Math.sin(((u - 0.72) / 0.28) * Math.PI * 2)) * (1 - (u - 0.72) / 0.28) : 0;
    for (const p of parts) {
      const [rx, ry, rz] = p.rest, [fx, fy, fz] = p.fin;
      p.o.position.set(rx + (fx - rx) * e, ry + (fy - ry) * w + p.h * hs * 1.6 * w * (1 - w) + bo, rz + (fz - rz) * e);
      p.o.rotation.set((p.rot[0] + Math.PI * 2 * p.k * kk) * e, p.rot[1] * e, 0);
    }
  };

  // phones that carry the meme (s2), one more that keeps it alive through the quiet years (s6)
  const phoneTex = (txt, seed) => tex(256, 512, (g, w, h) => { const r2 = mulberry(seed); g.fillStyle = "#17131a"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a2229"; g.fillRect(0, 0, w, 54); g.fillStyle = OR; for (let i = 0; i < 21; i++) { const bh = 24 + r2() * 190 * (0.4 + 0.6 * Math.sin((i / 20) * Math.PI)); g.fillRect(17 + i * 10.6, 230 - bh / 2, 7, bh); } g.fillStyle = RD; g.beginPath(); g.arc(w / 2, 372, 26, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(w / 2 - 9, 358); g.lineTo(w / 2 + 14, 372); g.lineTo(w / 2 - 9, 386); g.fill(); g.fillStyle = CR; g.font = `700 32px ${MF}`; g.textAlign = "center"; g.fillText(txt, w / 2, 452); });
  const phone = (txt, seed) => { const G = new THREE.Group(); box(2.5, 4.9, 0.24, std(0x0f0d10, 0.3, 0.6), 0, 0, 0, G); plane(2.25, 4.5, basic(phoneTex(txt, seed), { transparent: false }), 0, 0, 0.125, G); scene.add(G); return G; };
  const phones = [["MEME", 11, [3.8, 8.2, -1.2], "s2:meme"], ["VIDEO LUCU", 12, [-4.4, 9.2, -2.2], "s2:video"], ["REMIX LAGU", 13, [5.6, 4.9, 1.6], "s2:remix"]].map(([txt, s, p, a]) => ({ G: phone(txt, s), p, t0: AT[a] }));
  const phone6 = { G: phone("MEME", 14), p: [X5 + 3.6, 8.6, -1.2] };

  // ---- S3: 2000-era PC, MESSIAH cassette, name plates (text only) ----
  const beige = std(0xd8ccb0, 0.55), beige2 = std(0xc4b796, 0.6);
  const crt = new THREE.Group(); crt.position.set(X3 + 0.8, 0, -0.6); scene.add(crt);
  box(7, 1.5, 5.4, beige2, 0, 0.75, 0, crt); box(2.4, 0.2, 0.06, std(0x2a2420, 0.5), 1.7, 1.0, 2.71, crt); box(0.25, 0.12, 0.06, std(0x55ff88, 0.3, 0, { emissive: 0x33ff77, emissiveIntensity: 1.5 }), -2.8, 0.5, 2.71, crt);
  box(6, 5, 4.6, beige, 0, 4.0, -0.2, crt); box(4.4, 3.8, 1.6, beige2, 0, 3.9, -2.9, crt);
  box(5.7, 0.3, 1.9, beige2, 0.2, 0.15, 4.0, crt);
  plane(4.7, 3.7, new THREE.MeshStandardMaterial({ color: 0x0b0d0c, roughness: 0.15, metalness: 0.3 }), 0, 4.05, 2.11, crt);
  const scrT = tex(512, 400, (g, w, h) => { g.fillStyle = "#0d0f0c"; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6); gr.addColorStop(0, "rgba(255,176,0,.22)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = AM; g.font = `86px ${DF}`; g.textAlign = "center"; g.fillText("MESSIAH", w / 2, 170); g.font = `600 34px ${MF}`; g.fillStyle = CR; g.fillText("GAME PC  ·  2000", w / 2, 232); g.fillStyle = OR; for (let i = 0; i < 30; i++) { const bh = 8 + Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.4)) * 70; g.fillRect(76 + i * 12, 318 - bh / 2, 7, bh); } g.fillStyle = "rgba(0,0,0,.28)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2); });
  const scr = plane(4.5, 3.5, basic(scrT, { transparent: false }), 0, 4.05, 2.13, crt);

  const cassette = (title, sub, col) => {
    const G = new THREE.Group();
    const face = tex(512, 328, (g, w, h) => {
      g.fillStyle = "#2b2530"; g.fillRect(0, 0, w, h);
      g.fillStyle = CR; g.beginPath(); g.roundRect(24, 18, w - 48, 176, 10); g.fill();
      g.fillStyle = col; g.fillRect(24, 18, w - 48, 36);
      g.fillStyle = CH; g.font = `700 22px ${MF}`; g.textAlign = "left"; g.fillText("SIDE A", 42, 44);
      g.textAlign = "center"; g.font = `74px ${DF}`; g.fillText(title, w / 2, 128); g.font = `600 24px ${MF}`; g.fillText(sub, w / 2, 172);
      g.fillStyle = "#0e0b0f"; g.beginPath(); g.roundRect(104, 204, 304, 88, 40); g.fill();
      g.fillStyle = "#5a3a22"; g.beginPath(); g.arc(170, 248, 38, 0, 7); g.fill(); g.beginPath(); g.arc(342, 248, 26, 0, 7); g.fill();
      g.fillStyle = "#3a333d"; g.beginPath(); g.moveTo(60, h); g.lineTo(110, 300); g.lineTo(402, 300); g.lineTo(452, h); g.fill();
      g.fillStyle = "#8a8090"; for (const [x, y] of [[18, 14], [w - 18, 14], [18, h - 14], [w - 18, h - 14], [w / 2, 314]]) { g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
    });
    faced(5, 3.2, 0.7, std(0x2b2530, 0.45, 0.1), basic(face, { transparent: false }), 0, 0, 0, G);
    const hubT = tex(128, 128, (g, w) => { g.fillStyle = "#e9e2d2"; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = "#1a161a"; g.beginPath(); g.arc(64, 64, 30, 0, 7); g.fill(); g.fillStyle = "#e9e2d2"; for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283; g.fillRect(64 + Math.cos(a) * 22 - 5, 64 + Math.sin(a) * 22 - 5, 10, 10); } });
    const hubs = [-0.84, 0.84].map((x) => { const p = new THREE.Group(); p.position.set(x, -0.81, 0.37); G.add(p); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 28), [std(0xe9e2d2, 0.5), basic(hubT, { transparent: false }), std(0xe9e2d2, 0.5)]); c.rotation.x = Math.PI / 2; p.add(c); return p; });
    scene.add(G);
    return { G, hubs };
  };
  const tapeM = cassette("MESSIAH", "GAME PC · 2000", OR); tapeM.G.userData.k = 0.8; tapeM.G.position.set(X3 + 5.4, 1.28, 1.6); tapeM.G.rotation.set(-0.1, -0.35, 0);
  const plate = (name, role, x) => {
    const G = new THREE.Group(); G.position.set(x, 0, 3.6); scene.add(G);
    const tx = tex(640, 200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#efcb7c"); gr.addColorStop(1, "#a98232"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "#5b4317"; g.lineWidth = 6; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = "#2a1d08"; g.textAlign = "center"; g.font = `46px ${DF}`; g.fillText(name, w / 2, 98); g.font = `600 30px ${MF}`; g.fillText(role, w / 2, 152); });
    const P = faced(4.8, 1.5, 0.22, std(0xa98232, 0.35, 0.7), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.35, metalness: 0.35 }), 0, 2.15, 0, G); P.rotation.x = -0.22;
    box(0.25, 1.5, 0.25, std(0x2a252a, 0.4, 0.6), 0, 0.75, -0.1, G); box(1.8, 0.12, 1.0, std(0x2a252a, 0.4, 0.6), 0, 0.06, -0.1, G);
    return G;
  };
  const plTT = plate("TOMMY TALLARICO", "KOMPOSER", X3 - 2.6), plJK = plate("JOEY KURAS", "SOUND DESIGNER", X3 + 3.6);

  // ---- S4: contract, stamp, year flip block, coin and price tag ----
  const cg = new THREE.Group(); cg.position.set(X4 + 0.6, 3.3, 0.4); cg.rotation.x = -0.45; scene.add(cg);
  box(5.6, 7.2, 0.3, std(0x3a2a22, 0.5), 0, 0, 0, cg); box(1.6, 0.5, 0.3, std(0xb8b2a8, 0.25, 0.9), 0, 3.5, 0.2, cg);
  const ctT = tex(512, 676, (g, w, h) => { g.fillStyle = "#f6efdf"; g.fillRect(0, 0, w, h); g.fillStyle = CH; g.textAlign = "left"; g.font = `44px ${DF}`; g.fillText("PERJANJIAN", 40, 92); g.fillText("LISENSI SUARA", 40, 142); g.fillStyle = OR; g.fillRect(40, 160, 170, 9); g.fillStyle = CH; g.font = `600 27px ${MF}`; g.fillText('suara : "oof"', 40, 218); g.fillText("biaya : $1 / 100 Robux", 40, 258); g.fillStyle = "#c9bfac"; for (let i = 0; i < 6; i++) g.fillRect(40, 306 + i * 34, i % 3 === 2 ? 300 : 430, 12); g.fillStyle = CH; g.fillRect(40, 600, 180, 3); g.fillRect(290, 600, 180, 3); g.font = `500 20px ${MF}`; g.fillText("pihak 1", 40, 628); g.fillText("pihak 2", 290, 628); });
  plane(5.1, 6.7, new THREE.MeshStandardMaterial({ map: ctT, roughness: 0.8 }), 0, -0.1, 0.16, cg).receiveShadow = true;
  const markT = tex(400, 200, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = RD; g.lineWidth = 12; g.beginPath(); g.roundRect(12, 12, w - 24, h - 24, 18); g.stroke(); g.fillStyle = RD; g.font = `78px ${DF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SEPAKAT", w / 2, h / 2 + 4); });
  const markM = basic(markT, { opacity: 0, depthWrite: false }); const mark = plane(3.0, 1.5, markM, 0.6, -1.7, 0.18, cg); mark.rotation.z = 0.12;
  const stamp = new THREE.Group(); cg.add(stamp);
  box(3.1, 1.6, 0.5, std(0xe8384f, 0.4), 0, 0, 0.25, stamp); box(2.6, 1.2, 0.5, std(0x2a252a, 0.4, 0.5), 0, 0, 0.75, stamp);
  const stH = cyl(0.3, 0.38, 1.6, 16, std(0x5a3a22, 0.5), 0, 0, 1.8, stamp); stH.rotation.x = Math.PI / 2; const knob = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 12), std(0x5a3a22, 0.5)); knob.position.set(0, 0, 2.7); stamp.add(knob);
  const yrTex = (yr, c) => tex(512, 292, (g, w, h) => { g.fillStyle = "#1c171d"; g.fillRect(0, 0, w, h); g.fillStyle = c; g.font = `176px ${DF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(yr, w / 2, h / 2 + 8); g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(0, h / 2 - 2, w, 4); });
  const yrSide = std(0x2a232b, 0.45, 0.2), yr19 = basic(yrTex("2019", RD), { transparent: false }), yr20 = basic(yrTex("2020", AM), { transparent: false });
  const yrB = faced(3.2, 1.83, 1.3, yrSide, yr19, X4 + 4.7, 0.92, 3.2);
  const warnT = tex(256, 230, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = RD; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w - 10, h - 10); g.lineTo(10, h - 10); g.closePath(); g.fill(); g.fillStyle = CR; g.font = `150px ${DF}`; g.textAlign = "center"; g.fillText("!", w / 2, h - 30); });
  const warn = plane(2.4, 2.15, basic(warnT, { depthWrite: false }), X4 + 4.7, 4.4, 3.2);
  const coinT = tex(256, 256, (g, w) => { const gr = g.createRadialGradient(100, 90, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, "#ffe9a0"); gr.addColorStop(0.6, "#f2b52c"); gr.addColorStop(1, "#b07a12"); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill(); g.strokeStyle = "#8a5c08"; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 22, 0, 7); g.stroke(); g.fillStyle = "#7a4f06"; g.font = `110px ${DF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$1", w / 2, w / 2 + 6); });
  const coin = new THREE.Group(); scene.add(coin);
  const coinM = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.24, 48), [std(0xd9a020, 0.3, 0.9), new THREE.MeshStandardMaterial({ map: coinT, roughness: 0.3, metalness: 0.6 }), new THREE.MeshStandardMaterial({ map: coinT, roughness: 0.3, metalness: 0.6 })]);
  coinM.rotation.set(Math.PI / 2, Math.PI / 2, 0); coinM.castShadow = true; coin.add(coinM);
  const tagT = tex(512, 256, (g, w, h) => { g.fillStyle = CR; g.beginPath(); g.moveTo(60, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(60, h); g.lineTo(0, h / 2); g.closePath(); g.fill(); g.fillStyle = OR; g.fillRect(w - 26, 0, 26, h); g.fillStyle = CH; g.beginPath(); g.arc(52, h / 2, 14, 0, 7); g.fill(); g.textAlign = "center"; g.font = `84px ${DF}`; g.fillText("$1 = 100", 280, 116); g.font = `58px ${DF}`; g.fillStyle = OR; g.fillText("ROBUX", 280, 196); });
  const tag = new THREE.Group(); scene.add(tag);
  plane(3.8, 1.9, basic(tagT, { side: THREE.DoubleSide }), 0, -1.6, 0, tag); cyl(0.025, 0.025, 6, 6, std(0xf3e9d2, 0.6), 0, 2.4, 0, tag);

  // ---- S5/S6: tape deck, OOF cassette, date block, file card ----
  const deck = new THREE.Group(); deck.position.set(X5 + 0.6, 0, 0); scene.add(deck);
  const deckT = tex(768, 290, (g, w, h) => { g.fillStyle = "#1e191f"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3a333c"; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20); for (let k = 0; k < 2; k++) { const x = 40 + k * 170; g.fillStyle = CR; g.fillRect(x, 50, 150, 96); g.strokeStyle = RD; g.lineWidth = 6; g.beginPath(); g.arc(x + 75, 150, 80, -2.1, -1.25); g.stroke(); g.strokeStyle = CH; g.lineWidth = 3; g.beginPath(); g.arc(x + 75, 150, 80, -2.6, -2.1); g.stroke(); g.fillStyle = CH; g.font = `700 20px ${MF}`; g.textAlign = "center"; g.fillText("VU", x + 75, 136); } g.fillStyle = AM; g.font = `600 26px ${MF}`; g.textAlign = "left"; g.fillText("TAPE DECK  ·  A", 40, 200); g.fillStyle = RD; g.beginPath(); g.arc(46, 240, 11, 0, 7); g.fill(); g.fillStyle = CR; g.font = `500 20px ${MF}`; g.fillText("REC", 66, 247); ["▶", "■", "◀◀", "▶▶", "⏏"].forEach((s, i) => { const x = 420 + i * 64; g.fillStyle = "#3a333c"; g.fillRect(x, 160, 54, 70); g.fillStyle = i === 4 ? OR : CR; g.font = `700 26px ${MF}`; g.textAlign = "center"; g.fillText(s, x + 27, 205); }); g.fillStyle = "#0c0a0c"; g.fillRect(420, 50, 310, 80); g.fillStyle = AM; g.font = `600 40px ${MF}`; g.fillText("0 0 4 2", 575, 106); });
  faced(9, 3.4, 4.6, std(0x1e191f, 0.4, 0.5), basic(deckT, { transparent: false }), 0, 1.7, 0, deck);
  box(5.8, 0.12, 1.2, std(0x050405, 0.6), 0, 3.42, 0.3, deck);
  const tapeO = cassette("OOF", "SUARA KARAKTER MATI", AM);
  const xMat = std(0xe8384f, 0.4, 0, { emissive: 0xe8384f, emissiveIntensity: 1.2 });
  const xa = box(6, 0.5, 0.12, xMat, 0, 0, 0.5, tapeO.G), xb = box(6, 0.5, 0.12, xMat, 0, 0, 0.52, tapeO.G); xa.rotation.z = 0.5; xb.rotation.z = -0.5;
  const dTex = (s, c) => tex(640, 246, (g, w, h) => { g.fillStyle = "#1c171d"; g.fillRect(0, 0, w, h); g.fillStyle = c; g.font = `96px ${DF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, w / 2, h / 2 + 6); g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(0, h / 2 - 2, w, 4); });
  const d22 = basic(dTex("26.07.2022", RD), { transparent: false }), d25 = basic(dTex("18.07.2025", AM), { transparent: false });
  const dB = faced(3.8, 1.47, 1.0, yrSide, d22, X5 + 3.6, 0.74, 4.6);
  const fileT = tex(512, 192, (g, w, h) => { g.fillStyle = "#1c171d"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 18); g.fill(); g.strokeStyle = OR; g.lineWidth = 6; g.stroke(); g.fillStyle = OR; for (let i = 0; i < 9; i++) { const bh = 20 + Math.abs(Math.sin(i * 1.1)) * 70; g.fillRect(36 + i * 13, h / 2 - bh / 2, 8, bh); } g.fillStyle = CR; g.font = `44px ${DF}`; g.textAlign = "left"; g.fillText("FILE AUDIO", 180, 92); g.fillStyle = AM; g.font = `600 30px ${MF}`; g.fillText("suara oof", 182, 140); });
  const fileC = plane(3.9, 1.46, basic(fileT, { side: THREE.DoubleSide }), 0, 0, 0);

  // ---- S7: license checklist easel, two VU meters ----
  const eg = new THREE.Group(); eg.position.set(X7 + 1.2, 3.75, 0); eg.rotation.x = -0.16; scene.add(eg);
  const ckT = tex(512, 614, (g, w, h) => { g.fillStyle = CR; g.fillRect(0, 0, w, h); g.fillStyle = OR; g.fillRect(0, 0, w, 26); g.fillStyle = CH; g.font = `58px ${DF}`; g.textAlign = "left"; g.fillText("CEK LISENSI", 36, 112); g.font = `600 27px ${MF}`; ["Siapa pemilik", "suaranya?", "Boleh dipakai", "di game?", "Ada biayanya?", ""].forEach((s, i) => g.fillText(s, 120, 210 + Math.floor(i / 2) * 140 + (i % 2) * 34)); for (let i = 0; i < 3; i++) { g.strokeStyle = CH; g.lineWidth = 6; g.strokeRect(40, 192 + i * 140, 56, 56); } });
  faced(6, 7.2, 0.3, std(0x3a2a22, 0.5), new THREE.MeshStandardMaterial({ map: ckT, roughness: 0.8 }), 0, 0, 0, eg);
  for (const s of [-1, 1]) { const l = box(0.25, 7.6, 0.25, std(0x3a2a22, 0.5), s * 2.4, -0.3, -0.4, eg); l.rotation.x = 0.1; }
  const tickT = tex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.strokeStyle = OR; g.lineWidth = 20; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(18, 66); g.lineTo(52, 100); g.lineTo(112, 24); g.stroke(); });
  const ticks = [0, 1, 2].map((i) => plane(1.15, 1.15, basic(tickT, { depthWrite: false }), -2.26, 7.2 * (0.5 - (220 + i * 140) / 614), 0.2, eg));
  const vuT = tex(256, 184, (g, w, h) => { g.fillStyle = "#f6e7c4"; g.fillRect(0, 0, w, h); g.strokeStyle = CH; g.lineWidth = 3; for (let i = 0; i <= 10; i++) { const a = -2.4 + (i / 10) * 1.65; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 104, 172 + Math.sin(a) * 104); g.lineTo(w / 2 + Math.cos(a) * (i % 5 ? 92 : 84), 172 + Math.sin(a) * (i % 5 ? 92 : 84)); g.stroke(); } g.strokeStyle = RD; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, 172, 98, -1.15, -0.75); g.stroke(); g.fillStyle = CH; g.font = `700 26px ${MF}`; g.textAlign = "center"; g.fillText("VU", w / 2, 140); });
  const vus = [[X7 + 5.4, 1.05, 3.0], [X7 + 5.4, 3.25, 2.6]].map(([x, y, z], i) => { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = -0.35; scene.add(G); faced(2.9, 2.1, 1.3, std(0x1e191f, 0.4, 0.5), std(0x1e191f, 0.4, 0.5), 0, 0, 0, G); plane(2.5, 1.8, basic(vuT, { transparent: false }), 0, 0, 0.66, G); const pv = new THREE.Group(); pv.position.set(0, -0.82, 0.68); G.add(pv); box(0.05, 1.35, 0.02, std(0x121014, 0.5, 0, { emissive: 0x220000 }), 0, 0.67, 0, pv); return { G, pv, i }; });

  // fonts: redraw text textures once the web fonts land
  let fontsOk = false;
  try { document.fonts.load(`40px 'Archivo Black'`); document.fonts.load(`600 40px 'IBM Plex Mono'`); } catch (e) { fontsOk = true; }
  const refresh = () => {
    if (fontsOk) return;
    try { if (!(document.fonts.check(`40px 'Archivo Black'`) && document.fonts.check(`600 40px 'IBM Plex Mono'`))) return; } catch (e) { }
    fontsOk = true;
    for (const [t, draw, w, h] of TX) { const g = t.image.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }
    buildMask();
  };

  // ---- timing ----
  const oofT = AT["s1:oof"], oof2 = AT["s2:oof"], kb = AT["s6:kembali"], flatA = AT["s5:Penggantinya"], b2 = AT["s5:datar"];
  const tTip = 1.15, tLand = oofT, re1 = K.s2e - 1.55;
  const legs = [[K.s2e - 0.2, K.s3 + 2.3, -1.5, X3 - 5], [K.s4 + 0.1, K.s4 + 2.2, X3 - 5, X4 - 5], [K.s5 + 0.1, K.s5 + 2.0, X4 - 5, X5 - 5.2], [K.s7 + 0.1, K.s7 + 2.0, X5 - 5.2, X7 - 4.4]];
  const brk = (t) => {
    if (t < tLand) return [0, 1];
    if (t < re1) return [clamp01((t - tLand) / 0.9), 1];
    if (t < b2) return [1 - clamp01((t - re1) / 1.0), 1];
    if (t < kb) return [clamp01((t - b2) / 1.0), 0.22];
    return [1 - clamp01((t - kb) / 0.85), 1];
  };
  const root = (t) => {
    if (t < tTip) return { x: -7.5, y: 6, rz: 0.12 * Math.sin(t * 9) * ramp(t, 0.15, 0.8), ry: 0.2, mv: 0, ph: 0 };
    if (t < tLand) { const u = (t - tTip) / (tLand - tTip); return { x: -7.5 + 6 * u, y: 6 + 2.2 * u - 8.2 * u * u, rz: -1.2 * Math.sin(Math.PI * u), ry: 0.2 * (1 - u), mv: 0, ph: 1 }; }
    let x = -1.5, mv = 0, turn = 0;
    for (const [a, b, x0, x1] of legs) {
      if (t >= a) x = t >= b ? x1 : x0 + (x1 - x0) * ramp(t, a, b);
      if (t > a - 0.3 && t < b + 0.4) turn = Math.max(turn, ramp(t, a - 0.3, a) * (1 - ramp(t, b - 0.05, b + 0.4)));
      if (t > a && t < b) mv = 1;
    }
    return { x, y: 0, rz: 0, ry: (t < re1 + 1 ? 0 : 0.3) + (Math.PI / 2 - 0.3) * turn, mv, ph: 2 };
  };
  const bell = (t, a, b, e = 0.25) => ramp(t, a - e, a) * (1 - ramp(t, b, b + e));
  const shakeEv = [[oofT, 0.4], [AT["s4:sepakat"], 0.22], [kb, 0.3], [b2, 0.12]];

  const X = (t, k) => [t, ...k];
  const c0 = track([
    X(0, [-6, 8.6, 30, -5.5, 6.4, 0]), X(1.2, [-5.2, 8.2, 29, -5, 6, 0]), X(oofT, [-2.5, 6.8, 30, -2, 4.2, 0]), X(K.s1e, [-0.5, 7.4, 35, -0.5, 5.2, 0]),
    X(AT["s2:Karakter"], [2.5, 4.8, 21, -1.2, 1.9, 0]), X(AT["s2:terdengar"], [-3.2, 4.6, 21, -1.6, 1.9, 0]), X(AT["s2:meme"], [1.5, 7.6, 33, 0, 5.6, 0]), X(K.s2e - 0.3, [0.5, 7.2, 35, 0, 4.8, 0]),
    X(K.s3 + 2.5, [X3 - 1.5, 7, 37, X3 - 0.5, 4.6, 0]), X(AT["s3:Tommy"], [X3 - 2.5, 6.4, 32, X3 - 1.2, 4.2, 0]), X(AT["s3:Joey"], [X3 + 2, 6.4, 32, X3 + 1.5, 4.2, 0]), X(K.s3e - 0.2, [X3 + 2, 7, 36, X3 + 1, 4.6, 0]),
    X(K.s4 + 2.4, [X4 - 1, 7.2, 37, X4, 4.6, 0]), X(AT["s4:sepakat"], [X4 + 0.8, 9.5, 29, X4 + 0.6, 3.6, 0]), X(AT["s4:satu"] - 0.3, [X4 - 0.5, 7.2, 35, X4, 5, 0]), X(K.s4e - 0.2, [X4 + 1, 7.4, 37, X4 + 0.3, 5, 0]),
    X(K.s5 + 2.2, [X5 - 1.5, 7.2, 37, X5 - 1, 4.6, 0]), X(AT["s5:dihapus"] + 0.3, [X5 - 0.2, 7, 33, X5 - 0.5, 5, 0]), X(b2, [X5 - 2.5, 6.2, 31, X5 - 2.5, 3.8, 0]), X(K.s5e, [X5 - 2, 7, 36, X5 - 1.8, 4.6, 0]),
    X(AT["s6:2025"], [X5 - 0.5, 7.8, 35, X5 - 1.4, 4.6, 0]), X(kb, [X5 - 2, 6.4, 32, X5 - 1.8, 4.2, 0]), X(K.s6e - 0.2, [X5, 7.2, 36, X5 - 0.5, 4.8, 0]),
    X(K.s7 + 2.2, [X7 + 1, 7.2, 38, X7 + 0.6, 4.6, 0]), X(AT["s7:cek"], [X7 + 2, 6.8, 36, X7 + 0.8, 4.4, 0]), X(AT["s7:Kamu"], [X7 - 0.5, 6.8, 36, X7 + 0.2, 4.4, 0]), X(K.dur, [X7 + 1, 8, 41, X7 + 0.6, 5, 0]),
  ]);
  const pop = (t, a, d = 0.36) => back(clamp01((t - a) / d), 2.2);
  const lc = new THREE.Color();

  return (t) => {
    refresh();
    const pulse = Math.exp(-((((t + 10) / BEAT) % 1)) * 5);
    // camera with impact shake
    const p = c0(t);
    let sx = 0, sy = 0;
    for (const [e, a] of shakeEv) if (t >= e) { const k = a * Math.exp(-(t - e) * 7); sx += k * Math.sin(t * 53); sy += k * Math.sin(t * 41 + 1); }
    cam.position.set(p[0] + sx + Math.sin(t * 0.37) * 0.25, p[1] + sy + Math.sin(t * 0.29) * 0.15, p[2]); cam.lookAt(p[3] + sx * 0.5, p[4] + sy * 0.5, p[5]);
    key.position.set(p[3] - 14, 22, p[5] + 22); key.target.position.set(p[3], 0, p[5]);
    rim.position.set(p[3] + 8, 12, -24); rim.target.position.set(p[3], 2, 0);

    // LED waveform wall
    const fl = ramp(t, flatA, flatA + 0.9) * (1 - ramp(t, kb - 0.05, kb + 0.35));
    const mk = Math.max(ramp(t, oofT - 0.04, oofT + 0.16) * (1 - ramp(t, K.s2 + 1.0, K.s2 + 1.7)), ramp(t, oof2 - 0.04, oof2 + 0.16) * (1 - ramp(t, oof2 + 1.2, oof2 + 1.8)));
    let sp = 0; for (const e of [oofT, oof2, kb]) if (t >= e) sp = Math.max(sp, Math.exp(-(t - e) * 2.4));
    const cMin = Math.max(0, Math.floor((p[3] - 26 - LX0) / SP)), cMax = Math.min(COLS, Math.ceil((p[3] + 26 - LX0) / SP));
    for (let c = cMin; c < cMax; c++) {
      const x = LX0 + c * SP;
      let a = 1.0 + 3.4 * Math.abs(Math.sin(x * 0.9 + t * 6.3) * Math.cos(x * 0.31 - t * 2.7)) + 1.1 * Math.abs(Math.sin(x * 2.3 - t * 9.7)) + 1.6 * pulse * (0.5 + 0.5 * Math.sin(x * 0.7));
      a = Math.max(a, 9.2 * sp * (0.78 + 0.22 * Math.sin(x * 3.1 + t * 20)));
      a += (0.5 - a) * fl;
      const mc = c - MC0, inM = mk > 0 && mc >= 0 && mc < MC && mk > 0.15 + 0.7 * (mc / MC);
      for (let r = 0; r < ROWS; r++) {
        const d = Math.abs(r - 8.5);
        let col;
        if (inM) col = MASK[mc * ROWS + r] ? LCR : LOFF;
        else col = d > a ? LOFF : fl > 0.5 ? LGR : d < 3 ? LAM : d < 6 ? LOR : LRD;
        LED.setColorAt(c * ROWS + r, col);
      }
    }
    LED.instanceColor.needsUpdate = true;
    woof.position.z = 1.85 + 0.09 * pulse * (1 - fl);

    // avatar
    const R = root(t), [u, hs] = brk(t);
    setParts(u, hs, hs > 0.5 ? 1 : 0);
    const bob = R.mv ? Math.abs(Math.sin(t * 14)) * 0.3 : 0;
    A.G.position.set(R.x, R.y + bob, 0.6); A.G.rotation.set(0, R.ry, R.rz);
    if (u === 0) {
      if (R.mv) runPose(A, t * 14, 1);
      else if (R.ph === 0) { A.armL.rotation.z = -(0.9 + 0.5 * Math.sin(t * 15)); A.armR.rotation.z = 0.9 + 0.5 * Math.sin(t * 15 + 1.3); A.legL.rotation.x = 0.25 * Math.sin(t * 9); }
      else if (R.ph === 1) { A.armL.rotation.z = -2.7; A.armR.rotation.z = 2.7; A.legL.rotation.x = -0.5; A.legR.rotation.x = 0.4; }
      else {
        A.head.rotation.x = 0.09 * pulse;
        const pt = bell(t, AT["s3:Messiah"], AT["s3:Tommy"] - 0.4);
        const ct = bell(t, AT["s4:satu"] - 0.1, AT["s4:satu"] + 0.6, 0.2);
        const wv = ramp(t, AT["s7:Kamu"] - 0.2, AT["s7:Kamu"] + 0.1);
        A.armR.rotation.z = 1.45 * pt + 2.7 * ct + wv * (2.6 + 0.45 * Math.sin(t * 8));
        A.armL.rotation.z = -0.25 * bell(t, AT["s5:dihapus"], b2 - 0.4);
      }
    }
    const dg = ramp(t, b2, b2 + 0.8) * (1 - ramp(t, kb, kb + 0.4)) * 0.85;
    for (const m of mats) m.color.copy(m.userData.base).lerp(m.userData.grey, dg);

    // s2 phones
    phones.forEach((ph, i) => { const s = pop(t, ph.t0) * (1 - ramp(t, K.s3 + 1.5, K.s3 + 2)); ph.G.visible = s > 0.001; ph.G.scale.setScalar(Math.max(0.001, s)); ph.G.position.set(ph.p[0], ph.p[1] + Math.sin(t * 1.7 + i * 2) * 0.3 + (1 - s) * -2, ph.p[2]); ph.G.rotation.set(0.05 * Math.sin(t + i), 0.35 * Math.sin(t * 0.8 + i * 1.7) - 0.2 * (i - 1), 0.08 * Math.sin(t * 1.3 + i)); });
    { const s = pop(t, K.s6 + 0.3) * (1 - ramp(t, AT["s6:2025"], AT["s6:2025"] + 0.5)); phone6.G.visible = s > 0.001; phone6.G.scale.setScalar(Math.max(0.001, s)); phone6.G.position.set(phone6.p[0], phone6.p[1] + Math.sin(t * 1.5) * 0.3, phone6.p[2]); phone6.G.rotation.set(0, -0.3 + 0.2 * Math.sin(t * 0.7), 0.06 * Math.sin(t)); }

    // s3: CRT powers on, cassette pops, name plates rise
    const on = clamp01((t - AT["s3:Messiah"] + 0.15) / 0.3);
    scr.visible = on > 0; scr.scale.set(Math.min(1, 0.02 + on * 3), Math.max(0.01, (on - 0.33) * 1.5), 1);
    const sm = pop(t, AT["s3:2000"]); tapeM.G.visible = sm > 0.001; tapeM.G.scale.setScalar(Math.max(0.001, sm * 0.8));
    tapeM.hubs.forEach((h, i) => (h.rotation.z = -t * (i ? 2.6 : 1.9)));
    for (const [pl, a] of [[plTT, AT["s3:Tommy"]], [plJK, AT["s3:Joey"]]]) { const s = pop(t, a - 0.1, 0.4); pl.visible = s > 0.001; pl.scale.set(1, Math.max(0.001, s), 1); }

    // s4: year block, warning, stamp, coin, tag
    const ys = pop(t, AT["s4:2019"]); yrB.visible = ys > 0.001; yrB.scale.setScalar(Math.max(0.001, ys));
    const fu = clamp01((t - AT["s4:2020"]) / 0.45); yrB.rotation.x = -Math.PI * 2 * eout(fu); yrB.material[4] = fu > 0.5 ? yr20 : yr19;
    const ws = pop(t, AT["s4:mempersoalkan"]) * (1 - ramp(t, AT["s4:2020"] - 0.1, AT["s4:2020"] + 0.25)); warn.visible = ws > 0.001; warn.scale.setScalar(Math.max(0.001, ws)); warn.position.y = 4.5 + Math.sin(t * 6) * 0.12;
    const sT = AT["s4:sepakat"];
    const lift = t < sT + 0.35 ? 0 : 9 * ramp(t, sT + 0.35, sT + 1.3);
    const down = t < sT ? clamp01((t - (sT - 0.45)) / 0.45) : 1;
    stamp.visible = t > sT - 0.45 && t < sT + 1.3; stamp.position.set(0.6, -1.7, 0.18 + (t < sT ? 9 * (1 - down * down) : lift)); stamp.rotation.z = 0.12;
    markM.opacity = ramp(t, sT - 0.02, sT + 0.04);
    const cT = AT["s4:satu"], cu = clamp01((t - cT + 0.05) / 0.6);
    coin.visible = t > cT - 0.05; const hx = X4 - 5 + 1.6, ex = X4 - 2.2;
    coin.position.set(hx + (ex - hx) * eout(cu), 3.6 + 4.6 * eout(cu) + 1.6 * Math.sin(Math.PI * cu) + (cu >= 1 ? Math.sin(t * 2.2) * 0.2 : 0), 1.2); coin.rotation.set(0, (1 - eout(cu)) * 12.566 + 0.35 * Math.sin(t * 2.6), 0);
    const tg = AT["s4:seratus"], tu = clamp01((t - tg + 0.1) / 0.5);
    tag.visible = t > tg - 0.1; tag.position.set(X4 + 4.3, 8.6 + (1 - eout(tu)) * 7, 1.4); tag.rotation.set(0, -0.15, 0.35 * Math.sin((t - tg) * 4.5) * Math.exp(-Math.max(0, t - tg) * 0.9));

    // s5/s6: cassette eject, cross, flat years, return
    const ej = AT["s5:dihapus"], ins = AT["s6:Suara"];
    const ue = back(clamp01((t - ej) / 0.55), 1.6), ui = clamp01((t - ins) / Math.max(0.2, kb - ins));
    const up = t < ins ? ue : 1 - ui * ui;
    tapeO.G.position.set(X5 + 0.6, 2.95 + 4.3 * up + (up > 0.9 && t < ins ? Math.sin(t * 1.6) * 0.15 : 0), 0.3); tapeO.G.rotation.set(0, 0.25 * up * Math.sin(t * 0.6), 0.06 * up);
    const playing = t < ej || t > kb;
    tapeO.hubs.forEach((h, i) => (h.rotation.z = playing ? -t * (i ? 3 : 2.2) : -ej * (i ? 3 : 2.2)));
    const xs = clamp01((t - AT["s5:lisensi"]) / 0.22) * (1 - ramp(t, AT["s6:2025"] + 0.2, AT["s6:2025"] + 0.6));
    xa.scale.set(Math.max(0.001, xs), 1, 1); xb.scale.set(Math.max(0.001, clamp01((t - AT["s5:lisensi"] - 0.12) / 0.22) * (xs > 0 ? 1 : 0)), 1, 1); xa.visible = xb.visible = xs > 0.001;
    const ds = pop(t, AT["s5:Juli"]); dB.visible = ds > 0.001; dB.scale.setScalar(Math.max(0.001, ds));
    const du = clamp01((t - AT["s6:Juli"]) / 0.45); dB.rotation.x = -Math.PI * 2 * eout(du); dB.material[4] = du > 0.5 ? d25 : d22;
    const fT = AT["s6:file"], fu2 = clamp01((t - fT) / 0.7);
    fileC.visible = t > fT && t < K.s7 + 1.8; fileC.position.set(X5 + 0.6 + 1.4 * eout(fu2), 3.6 + 4.4 * eout(fu2) + Math.sin(t * 1.8) * 0.15, 1.2); fileC.rotation.set(0, -0.25 + (1 - eout(fu2)) * 3, 0); fileC.scale.setScalar(0.3 + 0.7 * eout(fu2));

    // s7: ticks, VU needles
    [AT["s7:cek"], AT["s7:lisensi"], AT["s7:suara#2"]].forEach((a, i) => { const s = pop(t, a, 0.3); ticks[i].visible = s > 0.001; ticks[i].scale.setScalar(Math.max(0.001, s)); });
    for (const v of vus) { const lv = clamp01(0.3 + 0.35 * Math.abs(Math.sin(t * 4.7 + v.i * 1.9)) + 0.3 * pulse + 0.1 * Math.sin(t * 13 + v.i)); v.pv.rotation.z = 0.78 - 1.56 * lv; }

    comp.render();
  };
}
