// SELEMBAR KERTAS: a pop-up book laid along one long kraft table. Everything is cut paper and faceless. No real document, likeness or logo is reproduced.
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, smooth, canvasTex, stage } from "./lib3d.js";

const INK = 0x1e1b18, RED = 0xc8321f, CREAM = 0xf3ecdc, GREEN = 0x2f7d5b, LIME = 0xa3e635, KRAFT = 0xc9ad85;
const X = { A: 0, B: 90, C: 180, D: 300, E: 390, F: 480, G: 570, H: 660 };

function glide(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1][0] < t) i++;
    const a = keys[i], b = keys[i + 1], u = (t - a[0]) / (b[0] - a[0]);
    const k = b[1] === a[1] || Math.abs(b[1] - a[1]) < 12 ? Math.min(1, Math.max(0, u)) : smooth(u);
    return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
  };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: KRAFT, fog: 0.0026, exp: 1.0, bloom: [0.04, 0.3, 0.95] });
  const rnd = mulberry(1985);
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x8a6f4c, 1.75));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  Object.assign(sun.shadow.camera, { left: -85, right: 85, top: 85, bottom: -85, near: 1, far: 320 });
  scene.add(sun, sun.target);

  const fibre = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
    const q = mulberry(7);
    for (let i = 0; i < 2600; i++) { const v = 205 + q() * 50 | 0; g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = q() * 1.2; const x = q() * w, y = q() * h, a = q() * 6.28, l = 4 + q() * 18; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  }, [4, 4]);
  const paper = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, map: fibre, roughness: 0.96, side: THREE.DoubleSide, ...extra });
  const mesh = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const card = (w, h, mat, x = 0, y = 0, z = 0, p = scene, d = 0.14) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);

  // A printed face for a paper card. System fonts only: canvas draws before web fonts load.
  const printed = (w, h, draw) => new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw), roughness: 0.95 });
  const face = (W, H, draw, x, y, z, p, base = CREAM, res = 64) => {
    const G = new THREE.Group(); G.position.set(x, y, z); (p || scene).add(G);
    card(W, H, paper(base), 0, H / 2, -0.09, G);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(W, H), printed(W * res, H * res, draw));
    f.position.set(0, H / 2, 0); G.add(f);
    return G;
  };
  const label = (txt, color = "#1e1b18", bg = "#f3ecdc", font = "bold 110px Georgia") => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.font = font; g.fillText(txt, w / 2, h / 2 + 4); };

  // Long table and one coloured sheet per station, so each beat has its own atmosphere.
  const ground = mesh(new THREE.PlaneGeometry(1600, 700), new THREE.MeshStandardMaterial({ color: KRAFT, map: canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); const q = mulberry(3); for (let i = 0; i < 9000; i++) { const v = 215 + q() * 40 | 0; g.fillStyle = `rgb(${v},${v},${v - 6})`; g.fillRect(q() * w, q() * h, 1 + q() * 14, 1); } }, [22, 10]), roughness: 1 }), 330, 0, 0);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
  const sheets = { A: [0xefe6d2, 80, 70, 0.02], B: [0x8fa58c, 80, 96, -0.03], C: [0xb9c7cf, 112, 66, 0.015], D: [0xf4eedf, 60, 66, -0.02], E: [0x26343c, 76, 66, 0.02], F: [0xd08a68, 80, 70, -0.015], G: [0xe9e1cd, 116, 112, 0.012], H: [0x0f4a38, 84, 74, 0] };
  for (const k in sheets) { const [c, w, d, rot] = sheets[k]; const cx = k === "C" ? X.C + 34 : X[k]; const s = card(w, 170, paper(c), cx, 0.08, 10, scene, 0.16); s.rotation.x = -Math.PI / 2; s.rotation.z = rot; s.castShadow = false; }

  // Pop-up hinge: an element lies flat on the floor, then swings up with a small overshoot.
  const pops = [];
  const pop = (o, t, d = 0.55) => { pops.push({ o, t, d }); return o; };

  // Faceless cut-paper figure with two pivoting arms.
  const silhouette = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.85, 0); s.lineTo(-0.8, 2.3); s.lineTo(-1.1, 4.3); s.quadraticCurveTo(-1.05, 4.75, -0.55, 4.8); s.lineTo(0.55, 4.8); s.quadraticCurveTo(1.05, 4.75, 1.1, 4.3); s.lineTo(0.8, 2.3); s.lineTo(0.85, 0); s.lineTo(0.12, 0); s.lineTo(0.08, 2); s.lineTo(-0.08, 2); s.lineTo(-0.12, 0); s.closePath();
    const b = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false });
    return b;
  })();
  const headG = new THREE.CylinderGeometry(0.66, 0.66, 0.16, 28).rotateX(Math.PI / 2).translate(0, 5.65, 0.08);
  const armG = new THREE.BoxGeometry(0.46, 2.5, 0.14).translate(0, -1.2, 0);
  const figure = (color, sc = 1, x = 0, z = 0, p = scene) => {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(sc); p.add(G);
    const m = paper(color);
    mesh(silhouette, m, 0, 0, 0, G); mesh(headG, m, 0, 0, 0, G);
    const armL = new THREE.Group(), armR = new THREE.Group();
    armL.position.set(-1.05, 4.5, 0.08); armR.position.set(1.05, 4.5, 0.08); G.add(armL, armR);
    mesh(armG, m, 0, 0, 0, armL); mesh(armG, m, 0, 0, 0, armR);
    return { G, armL, armR };
  };

  // Illustrative sheet: bars instead of text, tagged so it can never pass as the actual document.
  const blankDoc = (title) => (g, w, h) => {
    g.fillStyle = "#f7f1e2"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#a89a7c"; g.lineWidth = w * 0.012; g.strokeRect(w * 0.05, w * 0.05, w * 0.9, h - w * 0.1);
    g.fillStyle = "#1e1b18"; g.textAlign = "center"; g.font = `bold ${w * 0.17}px Georgia`; g.fillText(title, w / 2, h * 0.2);
    g.fillStyle = "#cfc4a8"; for (let i = 0; i < 6; i++) g.fillRect(w * 0.16, h * (0.32 + i * 0.075), w * (i % 2 ? 0.56 : 0.68), h * 0.024);
    g.strokeStyle = "#c8321f"; g.lineWidth = w * 0.014; g.beginPath(); g.arc(w * 0.72, h * 0.8, w * 0.11, 0, 6.3); g.stroke();
    g.fillStyle = "#c8321f"; g.font = `bold ${w * 0.062}px Arial`; g.fillText("ILUSTRASI", w * 0.34, h * 0.83);
    g.strokeStyle = "#1e1b18"; g.lineWidth = w * 0.01; g.beginPath(); g.moveTo(w * 0.63, h * 0.81); g.bezierCurveTo(w * 0.68, h * 0.72, w * 0.72, h * 0.88, w * 0.76, h * 0.78); g.bezierCurveTo(w * 0.78, h * 0.75, w * 0.8, h * 0.82, w * 0.84, h * 0.79); g.stroke();
  };

  // A: courtroom diorama
  const A = new THREE.Group(); A.position.x = X.A; scene.add(A);
  card(62, 26, paper(0xe7dcc4), 0, 13, -19, A, 0.3);
  const wood = paper(0x6a4a32), woodD = paper(0x4e3524);
  const bench = new THREE.Group(); A.add(bench); bench.position.z = -12; card(30, 6.6, wood, 0, 3.3, 0, bench, 2.6); card(31, 0.6, woodD, 0, 6.8, 0, bench, 3.2);
  [-8, 0, 8].forEach((x) => { const j = figure(0x2b2723, 1.16, x, -2.2, bench); j.G.position.y = 2.8; });
  pop(bench, 0, 0.01);
  const deskL = new THREE.Group(), deskR = new THREE.Group(); deskL.position.set(-13, 0, 0); deskR.position.set(9.4, 0, 1.2); A.add(deskL, deskR);
  card(7.5, 2.6, wood, 0, 1.3, 0, deskL, 1.8); card(7.5, 2.6, wood, 0, 1.3, 0, deskR, 1.8);
  figure(0x51483c, 0.86, 0, -1.9, deskL);
  const def = figure(0x7c2a20, 0.9, 0, -1.9, deskR);
  const wit = figure(0x37404a, 1.42, 0, 2.5, A);
  const riseT = AT["s1:terangkat"];
  const held = new THREE.Group(); held.position.set(0, 4.5, 2.8); A.add(held);
  const heldItems = ["SD", "SMP", "SMA", "S1"].map((t, i) => {
    const d = i - 1.5;
    const G = new THREE.Group(); G.position.set(d * 3.3, Math.abs(d) * -0.45, 0); G.rotation.z = -d * 0.07; held.add(G);
    card(3.1, 4.2, paper(CREAM), 0, 0, -0.08, G, 0.05);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 4.2), printed(372, 504, blankDoc(t))); G.add(f);
    return G;
  });
  // Audience in the foreground: dark silhouettes that frame the moment and raise the depth.
  const audience = [];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const f = figure(row % 2 ? 0x3a2f27 : 0x4a3c30, 0.5 + row * 0.04, -19 + i * 4.8 + (row % 2) * 2.2 + rnd() * 0.7, 13 + row * 3, A); audience.push(f); pop(f.G, 0.12 + rnd() * 0.5, 0.45); }

  // B: three security rings. One figure stands for ten personnel: 557 police, 120 military.
  const B = new THREE.Group(); B.position.x = X.B; scene.add(B);
  const wall = (rad, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 1.5, 96, 1, true), paper(c)); m.position.y = 0.75; m.castShadow = m.receiveShadow = true; B.add(m); return m; };
  [[10.5, 0xf3ecdc], [19, 0xf3ecdc], [29, 0xf3ecdc]].forEach(([a, c]) => wall(a, c));
  card(9, 1.7, paper(0xfaf5e8), 0, 0.85, 0, B, 7.5);
  const crew = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.34, 1.25, 7), new THREE.MeshStandardMaterial({ roughness: 0.9 }), 677);
  crew.frustumCulled = false; crew.castShadow = true; B.add(crew);
  const dummy = new THREE.Object3D(), tc = new THREE.Color();
  const crewAt = [];
  for (let i = 0; i < 677; i++) {
    const ring = i % 4 === 0 ? 0 : i % 4 === 1 ? 1 : 2;
    const [a, b] = [[11.4, 18.2], [19.9, 28.2], [30, 36]][ring];
    const th = rnd() * 6.2832, rad = a + (b - a) * rnd();
    crewAt.push([Math.cos(th) * rad, Math.sin(th) * rad, rad]);
    crew.setColorAt(i, tc.set(i % 557 < 460 && i % 6 ? 0x6d5a3e : 0x3f5c3c));
  }
  const chairs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.46, 0.5, 0.46), new THREE.MeshStandardMaterial({ color: RED, roughness: 0.7 }), 80);
  chairs.frustumCulled = false; B.add(chairs);

  // C: the paper trail
  const C = new THREE.Group(); C.position.x = X.C; scene.add(C);
  const trail = card(92, 0.1, paper(0xfaf5e8), 0, 0.22, 7, C, 4); trail.geometry.translate(46, 0, 0); trail.position.x = -6;
  const stop = (x, year, at) => { const y = face(4.4, 2.2, label(year, "#f7f1e2", "#1e1b18", "bold 88px Georgia"), x - 6.6, 0, 3, C); pop(y, at, 0.5); return y; };
  stop(5, "2019", AT["s4:2019"]); stop(35, "2022", AT["s4:2022"]); stop(65, "2025", AT["s4:2025"]);
  const phone = new THREE.Group(); phone.position.set(5, 0, 0); C.add(phone);
  card(5.6, 10, paper(0x24282c), 0, 5, 0, phone, 0.4);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(5, 9), printed(444, 804, (g, w, h) => { g.fillStyle = "#eef0ee"; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const y = 24 + i * 262; g.fillStyle = "#fff"; g.fillRect(18, y, w - 36, 240); g.fillStyle = "#9ca6a4"; g.beginPath(); g.arc(58, y + 42, 26, 0, 6.3); g.fill(); g.fillRect(96, y + 24, 180, 14); g.fillStyle = "#cfd5d3"; g.fillRect(96, y + 46, 110, 10); g.fillRect(36, y + 96, w - 72, 14); g.fillRect(36, y + 124, w - 110, 14); g.fillRect(36, y + 152, w - 150, 14); } g.fillStyle = "#c8321f"; g.font = "bold 44px Arial"; g.textAlign = "center"; g.fillText("IJAZAH SMA?", w / 2, 150); }));
  scr.position.set(0, 5.05, 0.22); phone.add(scr); pop(phone, AT["s4:2019"] - 0.15);
  const folder = new THREE.Group(); folder.position.set(35, 0, 0); C.add(folder);
  card(10.4, 8.6, paper(0xd9a441), 0, 4.3, 0, folder, 0.5);
  card(4, 1.1, paper(0xd9a441), -3.2, 9.1, 0, folder, 0.5);
  const ft = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.6), printed(660, 192, label("GUGATAN", "#3a2a10", "#e8bd63"))); ft.position.set(0, 6.3, 0.27); folder.add(ft); pop(folder, AT["s4:2022"] - 0.15);
  const stampG = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 2.65), new THREE.MeshBasicMaterial({ map: canvasTex(620, 200, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = "#c8321f"; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = "#c8321f"; g.font = "bold 110px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("DICABUT", w / 2, h / 2 + 6); }), transparent: true })); stampG.position.set(35, 3, 0.32); stampG.rotation.z = -0.1; C.add(stampG);
  const docC = new THREE.Group(); docC.position.set(65, 0, 0); C.add(docC);
  const dcf = face(7.6, 10, blankDoc("1985"), 0, 0, 0, docC); dcf.rotation.x = -0.1; pop(docC, AT["s4:2025"] - 0.15);
  const lens = new THREE.Group(); lens.position.set(70, 8, 3); C.add(lens);
  mesh(new THREE.TorusGeometry(3.2, 0.34, 12, 48), paper(0x24282c), 0, 0, 0, lens); mesh(new THREE.BoxGeometry(0.8, 5.4, 0.3), paper(0x24282c), 3.3, -4, 0, lens).rotation.z = 0.7;
  const glass = new THREE.Mesh(new THREE.CircleGeometry(3.1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })); lens.add(glass);

  // D: the typeface's own timeline. Glyphs are real Times New Roman from the system.
  const D = new THREE.Group(); D.position.x = X.D; scene.add(D);
  const glyphT = canvasTex(1024, 720, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.font = "700 700px 'Times New Roman'"; g.fillText("Aa", w / 2, h - 110); });
  const glyph = new THREE.Group(); glyph.position.set(0, 0, -4); D.add(glyph);
  for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(29, 20.4), new THREE.MeshStandardMaterial({ map: glyphT, color: i === 6 ? INK : 0x5c5040, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 })); m.position.set(0, 10.2, i * 0.07); m.castShadow = true; glyph.add(m); }
  pop(glyph, K.s5 - 0.1, 0.7);
  const rulerX = (y) => -10.4 + (y - 1932) * 0.39;
  const ruler = card(36, 0.2, paper(CREAM), 0, 0.3, 11, D, 5);
  const tick = (y, zOff) => { const f = face(6.2, 2.6, label(String(y), "#1e1b18", "#f3ecdc", "bold 120px Georgia"), rulerX(y), 0, 6 + zOff, D); return f; };
  tick(1932, 0); tick(1985, 0);
  const bar = card(1, 0.26, new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.6 }), 0, 0.52, 12.2, D, 1.4); bar.geometry.translate(0.5, 0, 0); bar.position.x = rulerX(1932);
  const mark = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.9, 3), new THREE.MeshStandardMaterial({ color: RED })); mark.rotation.x = Math.PI; mark.position.set(rulerX(1985), 1.5, 13); mark.castShadow = true; D.add(mark);
  const thesis = new THREE.InstancedMesh(new THREE.BoxGeometry(1.45, 2.05, 0.3), new THREE.MeshStandardMaterial({ map: fibre, color: 0xc8b48c, roughness: 0.95 }), 260); thesis.frustumCulled = false; thesis.castShadow = true; D.add(thesis);
  const thesisAt = []; for (let i = 0; i < 260; i++) thesisAt.push([-34 + (i % 26) * 2.7 + rnd() * 0.5, 1.05, -12 - Math.floor(i / 26) * 2.8, rnd()]);

  // E: forensic light table. The sheet is illustrative; the checks follow Bareskrim's published list.
  const E = new THREE.Group(); E.position.x = X.E; scene.add(E);
  card(44, 1.8, paper(0x3a4a52), 0, 0.9, 0, E, 32);
  const lightTop = new THREE.Mesh(new THREE.PlaneGeometry(42, 30), new THREE.MeshBasicMaterial({ map: canvasTex(1024, 732, (g, w, h) => { g.fillStyle = "#e6f2f2"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(40,110,130,.3)"; g.lineWidth = 2; for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }) }));
  lightTop.rotation.x = -Math.PI / 2; lightTop.position.y = 1.83; E.add(lightTop);
  const flat = (W, H, t, x, z) => { const G = new THREE.Group(); G.position.set(x, 1.95, z); E.add(G); const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), printed(W * 44, H * 44, blankDoc(t))); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; G.add(m); const b = card(W, 0.08, paper(CREAM), 0, -0.05, 0, G, H); b.castShadow = true; return G; };
  flat(8, 11, "UJI", 0, 0);
  const cmp = [flat(6, 8.4, "A", -40, -3), flat(6, 8.4, "B", 40, -3), flat(6, 8.4, "C", 40, 8)];
  const cmpTo = [[-8.4, -3], [8.4, -3], [8.4, 6.6]];
  const scan = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: RED })); scan.position.y = 2.2; E.add(scan);
  const okRing = new THREE.Mesh(new THREE.PlaneGeometry(9, 12), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0, depthWrite: false })); okRing.rotation.x = -Math.PI / 2; okRing.position.y = 1.9; E.add(okRing);
  const skripsi = flat(6.6, 8.8, "SKRIPSI", -8.4, 34); skripsi.position.y = 2.15;
  const circle = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.11, 8, 80), new THREE.MeshBasicMaterial({ color: RED })); circle.rotation.x = -Math.PI / 2; circle.position.set(-6.95, 2.4, 9.3); E.add(circle);
  const circleN = circle.geometry.index.count;

  // F: eight name tags, in the order of the two police clusters.
  const F = new THREE.Group(); F.position.x = X.F; scene.add(F);
  const tag = (name, x, z, rule = false, col = "#1e1b18", bg = "#f3ecdc") => { const G = new THREE.Group(); G.position.set(x, 0, z); F.add(G); const f = face(8.4, 4.2, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); if (rule) { g.fillStyle = "#c8321f"; g.fillRect(0, h - 24, w, 24); } g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${name.length > 12 ? 54 : 62}px Georgia`; g.fillText(name, w / 2, h / 2); }, 0, 2.4, 0, G); card(0.34, 2.6, paper(0x4e3524), 0, 1.3, -0.2, G); return { G, f }; };
  const back3 = [tag("Rizal Fadillah", -9.2, -8), tag("Rustam Effendi", 0, -8), tag("Kurnia Tri R.", 9.2, -8)];
  const mid3 = [tag("Rismon S.", -9.2, 2), tag("Eggi Sudjana", 0, 2), tag("Damai H. Lubis", 9.2, 2)];
  const front2 = [tag("Roy Suryo", -4.9, 13, true), tag("Dokter Tifa", 4.9, 13, true)];
  [...back3, ...mid3, ...front2].forEach((t, i) => pop(t.G, AT["s7:8"] + i * 0.08, 0.45));

  // G: a thousand paper people; 18 percent turn.
  const G = new THREE.Group(); G.position.x = X.G; scene.add(G);
  const crowdN = 1200;
  const crowd = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.42, 1.1, 3, 8), new THREE.MeshStandardMaterial({ roughness: 0.92 }), crowdN);
  crowd.frustumCulled = false; crowd.castShadow = true; G.add(crowd);
  const crowdAt = [];
  for (let i = 0; i < crowdN; i++) { const cx = i % 40, cz = Math.floor(i / 40); const x = (cx - 19.5) * 2.5 + (rnd() - 0.5), z = (cz - 14.5) * 2.5 + (rnd() - 0.5); crowdAt.push([x, z, rnd(), rnd() < 0.18]); dummy.position.set(x, 0.95, z); dummy.updateMatrix(); crowd.setMatrixAt(i, dummy.matrix); crowd.setColorAt(i, tc.set(0xbfb49d)); }
  crowd.instanceMatrix.needsUpdate = true;
  const cA = new THREE.Color(0xbfb49d), cB = new THREE.Color(0xe2501f);

  // H: the scale that does not tip.
  const H = new THREE.Group(); H.position.x = X.H; scene.add(H);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a44a, roughness: 0.55, metalness: 0.2 });
  mesh(new THREE.CylinderGeometry(4.6, 5.4, 1.2, 40), paper(0x2a2622), 0, 0.6, 0, H); mesh(new THREE.CylinderGeometry(0.42, 0.62, 18, 16), brass, 0, 9.6, 0, H);
  const beam = new THREE.Group(); beam.position.set(0, 18.6, 0); H.add(beam); mesh(new THREE.BoxGeometry(20, 0.56, 0.56), brass, 0, 0, 0, beam);
  const pan = (s, t) => { const P = new THREE.Group(); P.position.set(s * 9.6, 0, 0); beam.add(P); for (const a of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(0.05, 0.05, 8.6, 5), brass, a * 1.7, -4.2, 0, P); c.rotation.z = a * 0.2; } mesh(new THREE.CylinderGeometry(3.4, 2.8, 0.34, 32), brass, 0, -8.5, 0, P); const f = face(6.2, 2.4, label(t, "#1e1b18", "#f3ecdc", "bold 50px Georgia"), 0, -8.4, 0, P); f.rotation.x = -0.05; return P; };
  const panL = pan(-1, "DAKWAAN"), panR = pan(1, "PEMBELAAN");
  const floatDoc = face(5, 6.8, blankDoc("S1"), 0, 6, 3, H);
  const verdict = new THREE.Group(); verdict.position.set(0, 0, 11); H.add(verdict);
  face(14, 6, (g, w, h) => { g.fillStyle = "#f3ecdc"; g.fillRect(0, 0, w, h); g.setLineDash([26, 18]); g.lineWidth = 8; g.strokeStyle = "#8a7d62"; g.strokeRect(22, 22, w - 44, h - 44); g.setLineDash([]); g.fillStyle = "#8a7d62"; g.font = "bold 86px Georgia"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PUTUSAN: ?", w / 2, h / 2); }, 0, 0, 0, verdict);
  pop(verdict, AT["s9:Putusannya"], 0.5);

  // One camera move from the first frame to the last.
  const camT = glide([
    [0, 0, 19, 54, 0, 8.3, 0],
    [K.s1e - 0.2, 0.6, 19, 58, 0.2, 8.4, 0],
    [K.s2 + 0.8, 8, 13, 27, 8.6, 4, 0],
    [K.s2e - 0.1, 9.2, 13, 24, 9, 4, 0],
    [K.s3 + 1.1, 58, 66, 74, 74, 6, 0],
    [K.s3 + 2.4, 90, 136, 30, 90, 0, -2],
    [AT["s3:80"] - 0.15, 90, 126, 28, 90, 0, -2],
    [K.s3e - 0.05, 90, 34, 9, 90, 0, -1],
    [K.s4 + 0.9, 160, 26, 58, 176, 7, 0],
    [AT["s4:2019"] + 0.05, 182.4, 9, 51, 182.4, 5.8, 0],
    [AT["s4:2022"] - 0.45, 183.8, 9, 49.5, 183.8, 5.8, 0],
    [AT["s4:2022"] + 0.25, 212.4, 9, 51, 212.4, 5.8, 0],
    [AT["s4:2025"] - 0.4, 213.8, 9, 49.5, 213.8, 5.8, 0],
    [AT["s4:2025"] + 0.3, 243, 9, 50, 243, 5.8, 0],
    [K.s4e, 246, 10, 53, 244, 5.8, 0],
    [K.s5 + 0.8, 298, 23, 74, 300, 8.6, 0],
    [K.s5e - 0.2, 301, 23, 80, 300, 8.2, 0],
    [K.s6 + 0.9, 390, 52, 44, 390, -1, 1],
    [AT["s6:Roy"] - 0.2, 390, 48, 40, 390, -1, 1],
    [K.s6e, 386, 38, 42, 385, -1, 3],
    [K.s7 + 0.9, 480, 40, 82, 480, 6.5, 1],
    [K.s7e, 480, 36, 76, 480, 6.5, 3],
    [K.s8 + 0.9, 570, 9, 38, 570, 4.6, 0],
    [AT["s8:18"], 570, 34, 76, 570, 2, 0],
    [K.s8e, 570, 76, 96, 570, 1, 0],
    [K.s9 + 0.9, 660, 14, 96, 660, 11.5, 0],
    [K.dur, 660, 13, 82, 660, 11, 0],
  ]);

  return function draw(t) {
    const c = camT(t);
    cam.position.set(c[0] + Math.sin(t * 0.37) * 0.2, c[1] + Math.sin(t * 0.53) * 0.12, c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    sun.target.position.set(c[3], 0, 0); sun.position.set(c[3] - 44, 92, 62);

    for (const p of pops) { const u = (t - p.t) / p.d; p.o.visible = u >= 0; p.o.rotation.x = -Math.PI / 2 * (1 - back(u, 1.3)); }

    // A: arms and sheets rise on the word, then the room reacts.
    const up = ramp(t, riseT - 0.25, riseT + 0.55);
    wit.armL.rotation.z = -up * 2.75; wit.armR.rotation.z = up * 2.75;
    held.position.y = 3.4 + up * 7.2; held.visible = t > riseT - 0.3;
    heldItems.forEach((s, i) => { s.position.y = (Math.abs(i - 1.5) * -0.45) + Math.sin(t * 2 + i) * 0.06; s.scale.setScalar(0.3 + 0.7 * up); });
    const laugh = ramp(t, AT["s2:tertawa"] - 0.1, AT["s2:tertawa"] + 0.2) * (1 - ramp(t, K.s3 - 0.3, K.s3));
    def.G.position.y = Math.abs(Math.sin(t * 9)) * 0.34 * laugh; def.G.rotation.z = Math.sin(t * 9) * 0.05 * laugh;
    audience.forEach((f, i) => { f.G.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.16 * ramp(t, riseT + 0.2, riseT + 0.5) * (1 - ramp(t, K.s2, K.s2 + 1)); });

    // B: crew spreads outward from the court; chairs appear only on "80".
    if (t > K.s3 - 1 && t < K.s4 + 2) {
      const g0 = K.s3 + 1.2;
      for (let i = 0; i < 677; i++) { const a = crewAt[i], s = eout((t - g0 - (a[2] / 36) * 1.8) / 0.5); dummy.position.set(a[0], 0.65 * s, a[1]); dummy.scale.setScalar(Math.max(0.0001, s)); dummy.updateMatrix(); crew.setMatrixAt(i, dummy.matrix); }
      crew.instanceMatrix.needsUpdate = true;
      const c0 = AT["s3:80"];
      for (let i = 0; i < 80; i++) { const s = back((t - c0 - i * 0.012) / 0.28); dummy.position.set(-3.15 + (i % 10) * 0.7, 1.95, -2.45 + Math.floor(i / 10) * 0.7); dummy.scale.setScalar(Math.max(0.0001, s)); dummy.updateMatrix(); chairs.setMatrixAt(i, dummy.matrix); }
      chairs.instanceMatrix.needsUpdate = true;
    }

    // C: the trail unrolls with the camera; the stamp lands on "dicabut".
    trail.scale.x = Math.max(0.001, ramp(t, K.s4, K.s4e));
    const st = ramp(t, AT["s4:dicabut"] - 0.12, AT["s4:dicabut"]);
    stampG.visible = t > AT["s4:dicabut"] - 0.12; stampG.scale.setScalar(2.2 - 1.2 * st); stampG.material.opacity = st;
    lens.position.set(65 + Math.sin(t * 1.4) * 1.5, 5.8 + Math.cos(t * 1.1) * 1, 2.6); lens.visible = t > AT["s4:2025"]; lens.scale.setScalar(Math.max(0.001, 0.62 * eout((t - AT["s4:2025"]) / 0.4)));

    // D: the marker travels back from 1985 to 1932; a bar shows the typeface already existed.
    const back32 = ramp(t, AT["s5:1932"] - 0.2, AT["s5:1932"] + 0.7);
    mark.position.x = rulerX(1985) + (rulerX(1932) - rulerX(1985)) * back32;
    bar.scale.x = Math.max(0.001, (rulerX(1985) - rulerX(1932)) * ramp(t, AT["s5:1932"] + 0.5, AT["s5:1932"] + 1.5));
    if (t > K.s5 - 0.5 && t < K.s6 + 1.5) {
      const b0 = AT["s5:ribuan"];
      for (let i = 0; i < 260; i++) { const a = thesisAt[i], s = eout((t - b0 - a[3] * 1.2) / 0.3); dummy.position.set(a[0], a[1] * s, a[2]); dummy.scale.setScalar(Math.max(0.0001, s)); dummy.rotation.y = (a[3] - 0.5) * 0.3; dummy.updateMatrix(); thesis.setMatrixAt(i, dummy.matrix); }
      dummy.rotation.y = 0; thesis.instanceMatrix.needsUpdate = true;
    }

    // E: scan, comparison sheets, match, then the disputed signature gets its red circle.
    const sc = ramp(t, AT["s6:menguji"], AT["s6:Hasilnya"]);
    scan.visible = sc > 0 && sc < 1; scan.position.z = -5.5 + 11 * sc;
    const ti = AT["s6:tiga"] - 0.9;
    cmp.forEach((d, i) => { d.visible = t > ti + i * 0.15; const u = eout((t - ti - i * 0.15) / 0.65), [x, z] = cmpTo[i]; const sx = [-40, 40, 40][i], sz = [-3, -3, 8][i]; d.position.x = sx + (x - sx) * u; d.position.z = sz + (z - sz) * u; });
    okRing.material.opacity = 0.75 * ramp(t, AT["s6:identik"], AT["s6:identik"] + 0.25);
    const sk = eout((t - AT["s6:Roy"]) / 0.6);
    skripsi.position.z = 34 - 27.4 * sk; skripsi.visible = t > AT["s6:Roy"] - 0.05;
    circle.visible = t > AT["s6:mempersoalkan"]; circle.geometry.setDrawRange(0, Math.floor(circleN * eout((t - AT["s6:mempersoalkan"]) / 0.8)));

    // F: three fold flat at the settlement; two come forward.
    if (t > AT["s7:berdamai"] - 0.1) mid3.forEach((m, i) => { const u = ramp(t, AT["s7:berdamai"] + i * 0.12, AT["s7:berdamai"] + 0.5 + i * 0.12); m.G.rotation.x = -Math.PI / 2 * u; });
    const rise = eout((t - AT["s7:terdakwa"] + 0.1) / 0.4);
    front2.forEach((m) => { m.G.scale.setScalar(1 + 0.12 * rise); m.G.position.z = 13 + 3 * rise; });

    // G: people turn a few at a time, in random order.
    if (t > K.s8 - 1 && t < K.s9 + 2) {
      const g0 = AT["s8:18"];
      for (let i = 0; i < crowdN; i++) { const a = crowdAt[i]; crowd.setColorAt(i, tc.copy(cA).lerp(cB, a[3] ? ramp(t, g0 + a[2] * 1.5, g0 + a[2] * 1.5 + 0.2) : 0)); }
      crowd.instanceColor.needsUpdate = true;
    }

    // H: the beam breathes but never settles to a side.
    const sw = Math.sin(t * 0.8) * 0.018; beam.rotation.z = sw; panL.rotation.z = -sw; panR.rotation.z = -sw;
    const fu = eout((t - AT["s9:Kertasnya"]) / 0.7); floatDoc.visible = t > AT["s9:Kertasnya"] - 0.05; floatDoc.position.y = 3 + 6.5 * fu + Math.sin(t) * 0.1; floatDoc.scale.setScalar(Math.max(0.001, fu));

    comp.render();
  };
}
