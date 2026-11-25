// DALAM MESIN 1978: an exploded arcade cabinet with a black-and-white CRT, a workbench with the logic board, and an original engineer figure.
// The alien game on the CRT is drawn from the simulation in K.sim (built in build-video.mjs). Illustration only: own alien shapes, no game assets. Every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box, cyl, stage, avatar, runPose, restPose, label, pts } from "./lib3d.js";

const WHT = "#F2F2F2", SIG = "#39FF14", AMB = "#FFB020", CU = "#C77B30", PCBC = "#0F5132";
// Own alien designs, 12x8, two frames each (row 0 / rows 1-2 / rows 3-4).
const SPR = [
  [["....XXXX....", "..XXXXXXXX..", ".XX.XXXX.XX.", ".XXXXXXXXXX.", "...XX..XX...", "..XX.XX.XX..", ".XX......XX.", "XX........XX"],
   ["....XXXX....", "..XXXXXXXX..", ".XX.XXXX.XX.", ".XXXXXXXXXX.", "...XX..XX...", "...XXXXXX...", "..X.X..X.X..", "..X......X.."]],
  [["X..........X", ".X..XXXX..X.", "..XXXXXXXX..", ".XX..XX..XX.", "XXXXXXXXXXXX", "X.XXXXXXXX.X", "X.X......X.X", "...XX..XX..."],
   ["..X......X..", "...XXXXXX...", "..XXXXXXXX..", ".XX..XX..XX.", "XXXXXXXXXXXX", "..XXXXXXXX..", ".X..X..X..X.", "X..........X"]],
  [["...XXXXXX...", ".XXXXXXXXXX.", "XXX.XXXX.XXX", "XXXXXXXXXXXX", "XX.XXXXXX.XX", "..X.X..X.X..", ".X..X..X..X.", "X...X..X...X"],
   ["...XXXXXX...", ".XXXXXXXXXX.", "XXX.XXXX.XXX", "XXXXXXXXXXXX", "XX.XXXXXX.XX", "..X..XX..X..", "..X.X..X.X..", ".X........X."]],
];
const BOOM = ["X...X..X...X", ".X..X..X..X.", "..X......X..", "XX..XXXX..XX", "....XXXX....", "..X......X..", ".X..X..X..X.", "X...X..X...X"];
const GUN = [".....XX.....", "....XXXX....", ".XXXXXXXXXX.", "XXXXXXXXXXXX", "XXXXXXXXXXXX"];
const SC = 3, SW = 224, SH = 256;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x050505, fog: 0.004, exp: 1.18, bloom: [0.6, 0.45, 0.82] });
  scene.add(new THREE.HemisphereLight(0xb8d0c4, 0x1a2a20, 1.35));
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.55); fill.position.set(-6, 14, 60); scene.add(fill);
  const backL = new THREE.DirectionalLight(0x9affc0, 1.6); backL.position.set(6, 34, -45); scene.add(backL);
  const key = new THREE.DirectionalLight(0xfff4e6, 1.6); key.position.set(30, 40, 40); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 }); key.shadow.bias = -0.0006; scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fffb0, 1.3); rim.position.set(-30, 20, -30); scene.add(rim);
  const rnd = mulberry(8080);
  const S = K.sim;

  // ---------- floor: dark board with faint copper traces ----------
  const fl = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#0c110e"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(57,255,20,.06)"; g.lineWidth = 2; for (let k = 0; k <= w; k += 128) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); }
    for (let i = 0; i < 70; i++) { let x = Math.round(rnd() * 32) * 32, y = Math.round(rnd() * 32) * 32; g.strokeStyle = `rgba(199,123,48,${0.28 + rnd() * 0.2})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) y += (rnd() - 0.5) * 300; else x += (rnd() - 0.5) * 300; g.lineTo(x, y); } g.stroke(); g.fillStyle = "rgba(199,123,48,.5)"; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  }, [12, 12]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(480, 480), new THREE.MeshStandardMaterial({ map: fl, roughness: 0.8, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // ---------- exploded cabinet ----------
  const black = std(0x1a1c1b, 0.5, 0.15), trim = std(0x2a2a2a, 0.4, 0.5), copper = std(0xc77b30, 0.35, 0.8);
  const cab = new THREE.Group(); cab.position.set(0, 0, -4); scene.add(cab);
  box(11, 25, 0.5, black, 0, 12.5, -6.5, cab); // back panel
  box(10, 7.6, 0.5, black, 0, 3.8, 6.4, cab); // lower front
  const door = box(3.2, 3.4, 0.2, trim, 0, 4, 6.8, cab);
  for (const sx of [-0.7, 0.7]) box(0.25, 0.9, 0.1, new THREE.MeshBasicMaterial({ color: 0xffb020 }), sx, 4.6, 6.95, cab);
  const deck = box(10, 0.6, 3.4, black, 0, 8.4, 5.6, cab); deck.rotation.x = 0.22;
  cyl(0.15, 0.15, 1.3, 10, trim, -2.2, 9.3, 5.8, cab); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), std(0xffb020, 0.3)); knob.position.set(-2.2, 10, 5.8); cab.add(knob);
  for (const bx of [1.2, 2.6]) cyl(0.42, 0.42, 0.3, 18, new THREE.MeshBasicMaterial({ color: 0xf2f2f2 }), bx, 8.85, 5.4, cab);
  // side panels pulled outward (exploded view) with leader lines
  const prof = new THREE.Shape([[ -6.5, 0], [6.6, 0], [6.6, 7.6], [7.4, 8.6], [6.0, 10.2], [3.6, 10.4], [3.4, 21.5], [5.0, 22], [5.0, 25], [-6.5, 25]].map(([u, v]) => new THREE.Vector2(u, v)));
  const sideG = new THREE.ExtrudeGeometry(prof, { depth: 0.45, bevelEnabled: false });
  const sides = [-1, 1].map((s) => { const m = new THREE.Mesh(sideG, black); m.rotation.y = -Math.PI / 2; m.castShadow = true; cab.add(m); const e = new THREE.LineSegments(new THREE.EdgesGeometry(sideG), new THREE.LineBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.55 })); m.add(e); return { m, s }; });
  const leadM = new THREE.LineDashedMaterial({ color: 0x39ff14, dashSize: 0.4, gapSize: 0.3, transparent: true, opacity: 0.6 });
  const leads = [];
  for (const s of [-1, 1]) for (const [y, z] of [[3, 2], [14, 0], [23, -3]]) { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(s * 5.2, y, z), new THREE.Vector3(s * 8, y, z)]); const l = new THREE.Line(g, leadM); l.computeLineDistances(); cab.add(l); leads.push(l); }
  // marquee with an original alien row
  const mq = canvasTex(1024, 220, (g, w, h) => { g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, w, h); g.strokeStyle = CU; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = WHT; for (let k = 0; k < 5; k++) { const sp = SPR[k % 3][0]; sp.forEach((row, y) => [...row].forEach((c, x) => { if (c === "X") g.fillRect(150 + k * 160 + x * 8, 76 + y * 8, 8, 8); })); } });
  const marq = new THREE.Mesh(new THREE.BoxGeometry(10.6, 2.3, 1.2), [0, 0, 0, 0, 1, 0].map((v) => (v ? new THREE.MeshBasicMaterial({ map: mq, toneMapped: false, color: 0xbbbbbb }) : black))); marq.position.set(0, 23.4, 1.6); cab.add(marq);

  // CRT: bezel, tube and the live screen
  const SCR = new THREE.Vector3(0, 15.5, -1);
  box(10.6, 13.6, 0.7, trim, 0, 15.5, 2.4, cab);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 6.4, 6, 4, 1, true), std(0x1a1a1a, 0.4, 0.4, { side: THREE.DoubleSide })); tube.rotation.set(-Math.PI / 2, Math.PI / 4, 0); tube.position.set(0, 15.5, -0.9); cab.add(tube);
  const sc = document.createElement("canvas"); sc.width = SW * SC; sc.height = SH * SC; const sg = sc.getContext("2d");
  const scT = new THREE.CanvasTexture(sc); scT.colorSpace = THREE.SRGBColorSpace; scT.anisotropy = 8;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9, 12), new THREE.MeshBasicMaterial({ map: scT, toneMapped: false })); screen.position.set(0, 15.5, 2.8); cab.add(screen);
  const crtLight = new THREE.PointLight(0xe4f0ff, 60, 34, 1.6); crtLight.position.set(0, 15.5, 7); cab.add(crtLight);
  // pre-rendered sprites
  const spr = (rows, col = WHT) => { const c = document.createElement("canvas"); c.width = rows[0].length * SC; c.height = rows.length * SC; const g = c.getContext("2d"); g.fillStyle = col; rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "X") g.fillRect(x * SC, y * SC, SC, SC); })); return c; };
  const SPC = SPR.map((t) => t.map((f) => spr(f))), BOOMC = spr(BOOM), GUNC = spr(GUN);
  const scan = document.createElement("canvas"); scan.width = SW * SC; scan.height = SH * SC; { const g = scan.getContext("2d"); g.fillStyle = "rgba(0,0,0,.34)"; for (let y = 0; y < SH * SC; y += 3) g.fillRect(0, y, SW * SC, 1); const gr = g.createRadialGradient(SW * SC / 2, SH * SC / 2, SH, SW * SC / 2, SH * SC / 2, SH * SC * 0.72); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.7)"); g.fillStyle = gr; g.fillRect(0, 0, SW * SC, SH * SC); }

  // game lookups
  const last = (arr, t) => { let lo = 0, hi = arr.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m][0] <= t) { k = m; lo = m + 1; } else hi = m - 1; } return k; };
  const segAt = (t) => { let s = S.segs[0]; for (const x of S.segs) if (t >= x.t0) s = x; return s; };
  const form = (sg, t) => { const i = last(sg.steps, t); return i < 0 ? [24, 44, 0] : sg.steps[i].slice(1); };
  const inPause = (t) => S.pauses.some(([a, b]) => t >= a && t < b);
  // shots: kills fire 0.2 s before, misses fire straight up; cannon glides to each firing x
  const shots = [];
  S.segs.forEach((sg) => {
    sg.kills.forEach((k) => shots.push({ f: k[0] - 0.2, x: k[2] + 6, ty: k[3] + 8, hit: 1 }));
    sg.misses.forEach((m) => { const sg2 = segAt(m); const al = new Set(sg2.alive0); sg2.kills.forEach((k) => { if (k[0] <= m) al.delete(k[1]); }); const [X] = form(sg2, m); const i = [...al][0] ?? 0; shots.push({ f: m, x: X + (i % 11) * 16 + 6, ty: 6, hit: 0 }); });
  });
  shots.sort((a, b) => a.f - b.f);
  const gunX = (t) => { let i = 0; while (i < shots.length && shots[i].f <= t) i++; const a = shots[i - 1], b = shots[i]; if (!a) return b ? b.x + (112 - b.x) * clamp01((b.f - t) / 1) : 112; if (!b) return a.x; const u = clamp01((t - Math.max(a.f, b.f - 0.6)) / Math.max(0.05, b.f - Math.max(a.f, b.f - 0.6))); return a.x + (b.x - a.x) * (u * u * (3 - 2 * u)); };
  const drawScreen = (t) => {
    const g = sg; g.fillStyle = "#040404"; g.fillRect(0, 0, SW * SC, SH * SC);
    const sg2 = segAt(t); const [X, Y, f] = form(sg2, t);
    const al = new Set(sg2.alive0); for (const k of sg2.kills) if (k[0] <= t) al.delete(k[1]);
    for (const i of al) { const c = i % 11, rw = Math.floor(i / 11), ty = rw === 0 ? 0 : rw < 3 ? 1 : 2; g.drawImage(SPC[ty][f], (X + c * 16) * SC, (Y + rw * 16) * SC); }
    for (const k of sg2.kills) if (t >= k[0] && t < k[0] + 0.22) g.drawImage(BOOMC, k[2] * SC, k[3] * SC);
    g.fillStyle = WHT;
    for (const s of shots) { const fl = s.hit ? 0.2 : 0.34; if (t >= s.f && t < s.f + fl) { const u = (t - s.f) / fl; const y = 214 - (214 - s.ty) * u; g.fillRect((s.x - 0.5) * SC, y * SC, SC, 5 * SC); } }
    g.drawImage(GUNC, (gunX(t) - 6) * SC, 216 * SC);
    g.fillRect(0, 234 * SC, SW * SC, SC);
    if (inPause(t)) { g.fillStyle = "rgba(4,4,4,.55)"; g.fillRect(0, 0, SW * SC, SH * SC); g.fillStyle = WHT; g.fillRect(96 * SC, 100 * SC, 10 * SC, 34 * SC); g.fillRect(118 * SC, 100 * SC, 10 * SC, 34 * SC); }
    // wave reset flash
    for (const s of S.segs) if (s.t0 > 0 && t >= s.t0 && t < s.t0 + 0.18) { g.fillStyle = `rgba(242,242,242,${0.8 * (1 - (t - s.t0) / 0.18)})`; g.fillRect(0, 0, SW * SC, SH * SC); }
    g.drawImage(scan, 0, 0);
    scT.needsUpdate = true;
    return { n: al.size, f };
  };

  // big voxel alien floating beside the cabinet, legs step in sync with the screen formation
  const vox = new THREE.Group(); vox.position.set(-7.0, 19, 6.5); scene.add(vox);
  const vMat = new THREE.MeshBasicMaterial({ color: 0xd8dcd6 });
  const vFr = SPR[1].map((fr) => { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), vMat, 96); let n = 0; const d = new THREE.Object3D(); fr.forEach((row, y) => [...row].forEach((c, x) => { if (c === "X") { d.position.set((x - 5.5) * 0.45, (3.5 - y) * 0.45, 0); d.updateMatrix(); im.setMatrixAt(n++, d.matrix); } })); im.count = n; im.frustumCulled = false; vox.add(im); return im; });

  // ---------- workbench, logic board, chips ----------
  const B = new THREE.Vector3(14, 3.0, 3.6);
  const bench = new THREE.Group(); scene.add(bench);
  box(12, 0.4, 6.2, std(0x1b1b1b, 0.6, 0.2), B.x, B.y - 0.2, B.z, bench);
  for (const [lx, lz] of [[-5.6, -2.8], [5.6, -2.8], [-5.6, 2.8], [5.6, 2.8]]) box(0.4, B.y - 0.4, 0.4, trim, B.x + lx, (B.y - 0.4) / 2, B.z + lz, bench);
  const pcbT = canvasTex(1024, 576, (g, w, h) => {
    g.fillStyle = PCBC; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { let x = 20 + Math.round(rnd() * 31) * 32, y = 20 + Math.round(rnd() * 16) * 32; g.strokeStyle = `rgba(199,123,48,${0.55 + rnd() * 0.4})`; g.lineWidth = 3 + (i % 3); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { if (k % 2) y = Math.max(16, Math.min(h - 16, y + (rnd() - 0.5) * 200)); else x = Math.max(16, Math.min(w - 16, x + (rnd() - 0.5) * 300)); g.lineTo(x, y); } g.stroke(); g.fillStyle = CU; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
    g.strokeStyle = "rgba(242,242,242,.6)"; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28);
  });
  const board = new THREE.Mesh(new THREE.BoxGeometry(9, 0.2, 5.1), [0, 0, 1, 0, 0, 0].map((v) => (v ? new THREE.MeshStandardMaterial({ map: pcbT, roughness: 0.5, metalness: 0.2 }) : std(0x0f5132, 0.6)))); board.position.set(B.x, B.y + 0.1, B.z - 0.2); board.castShadow = board.receiveShadow = true; scene.add(board);
  const chipTex = (txt, big) => canvasTex(512, big ? 160 : 224, (g, w, h) => { g.fillStyle = "#0d0d0d"; g.fillRect(0, 0, w, h); g.fillStyle = "#3a3a3a"; g.beginPath(); g.arc(24, h / 2, 12, 0, 7); g.fill(); g.fillStyle = WHT; g.font = `700 ${big ? 66 : 70}px "Share Tech Mono",monospace`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 3); });
  const chips = [];
  const mkChip = (txt, w, d, x, z, tDrop, big) => {
    const G = new THREE.Group(); G.position.set(x, B.y + 0.38, z); scene.add(G);
    const top = new THREE.MeshStandardMaterial({ map: chipTex(txt, big), roughness: 0.5 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), [black, black, top, black, black, black]); m.castShadow = true; G.add(m);
    for (const s of [-1, 1]) box(w * 0.94, 0.08, 0.16, std(0xb8b8b8, 0.3, 0.9), 0, -0.12, s * (d / 2 + 0.06), G);
    chips.push({ G, x, z, tDrop, lift: 2.6 + chips.length * 0.35, spin: (rnd() - 0.5) * 0.8 });
    return G;
  };
  const tMer = AT["s2:merancang"] ?? K.s2 + 9.5, tInt = AT["s2:Intel"];
  [["ROM", 11.0, 2.3], ["ROM", 11.0, 4.3], ["RAM", 17.0, 2.3], ["RAM", 17.0, 4.3], ["I/O", 12.4, 5.0], ["SHIFT", 15.6, 5.0]].forEach(([tx, x, z], i) => mkChip(tx, 1.9, 0.75, x, z, tMer + i * 0.32, false));
  const cpu = mkChip("INTEL 8080", 3.9, 1.2, 14, 3.0, tInt - 0.45, true);
  // heat glow under the CPU
  const glowT = canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,176,32,1)"); gr.addColorStop(0.4, "rgba(255,120,20,.55)"); gr.addColorStop(1, "rgba(255,80,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.4), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.rotation.x = -Math.PI / 2; glow.position.set(14, B.y + 0.23, 3.0); scene.add(glow);
  const heatL = new THREE.PointLight(0xffb020, 0, 14, 1.5); heatL.position.set(14, B.y + 1.6, 3.4); scene.add(heatL);
  const heatP = pts(scene, 50, { color: 0xffb020, size: 0.14 }); const hp = Array.from({ length: 50 }, () => [rnd() * 3.6 - 1.8, rnd() * 1 - 0.5, rnd()]);
  // ribbon cable from board to the cabinet, pulses run along it
  const cab3 = new THREE.CatmullRomCurve3([new THREE.Vector3(9.4, B.y + 0.15, 2.6), new THREE.Vector3(8, 0.3, 3), new THREE.Vector3(5, 0.3, 3.5), new THREE.Vector3(3, 2, 3.2)]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cab3, 40, 0.16, 8), std(0x9a9a9a, 0.5, 0.3)); scene.add(cable);
  const pulse = pts(scene, 16, { color: 0x39ff14, size: 0.55 });

  // plates on the bench
  const plate = (txt, w, h, bg, fg, font) => new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), [0, 0, 0, 0, 1, 0].map((v) => (v ? new THREE.MeshStandardMaterial({ map: canvasTex(1024, Math.round(1024 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(10, 10, W - 20, H - 20); g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, W / 2, H / 2 + 4); }), roughness: 0.4, metalness: 0.3 }) : copper)));
  const namePl = plate("TOMOHIRO NISHIKADO", 7.6, 0.95, "#c77b30", "#140c05", '700 92px "Chakra Petch",sans-serif'); namePl.position.set(B.x, B.y - 0.75, B.z + 3.2); scene.add(namePl);
  const signPl = plate("1978 · TAITO", 3.8, 1.5, "#0b0b0b", WHT, '700 150px "Chakra Petch",sans-serif'); signPl.position.set(8.9, B.y + 2.6, 0.2); signPl.rotation.y = 0.35; scene.add(signPl);
  // flip calendar (no digits: one year = twelve month names)
  const MON = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  const monT = MON.map((m) => canvasTex(256, 300, (g, w, h) => { g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, w, h); g.fillStyle = "#c22"; g.fillRect(0, 0, w, 70); g.fillStyle = "#fff"; g.font = '700 46px "Share Tech Mono",monospace'; g.textAlign = "center"; g.fillText("1978", w / 2, 52); g.fillStyle = "#111"; g.font = '700 110px "Chakra Petch",sans-serif'; g.fillText(m, w / 2, 210); }));
  const calG = new THREE.Group(); calG.position.set(18.4, B.y, 1.6); calG.rotation.y = -0.4; scene.add(calG);
  box(2.4, 0.3, 1.2, trim, 0, 0.15, 0, calG);
  const pageM = new THREE.MeshStandardMaterial({ map: monT[0], roughness: 0.7 });
  const page = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), pageM); page.position.set(0, 1.65, 0); calG.add(page);
  const flipP = new THREE.Group(); flipP.position.set(0, 2.95, 0.01); calG.add(flipP);
  const flipM = new THREE.MeshStandardMaterial({ map: monT[0], roughness: 0.7, side: THREE.DoubleSide });
  const flip = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), flipM); flip.position.y = -1.3; flipP.add(flip);
  // PATCH? toggle (stays OFF)
  const tog = new THREE.Group(); tog.position.set(10.2, B.y, 5.4); scene.add(tog);
  const togT = canvasTex(512, 320, (g, w, h) => { g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, w, h); g.strokeStyle = AMB; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = AMB; g.font = '700 88px "Chakra Petch",sans-serif'; g.textAlign = "center"; g.fillText("PATCH?", w / 2, 110); g.font = '700 64px "Share Tech Mono",monospace'; g.fillStyle = WHT; g.fillText("OFF", 130, 260); g.fillStyle = "#555"; g.fillText("ON", 390, 260); });
  const togB = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 1.75), [black, black, new THREE.MeshStandardMaterial({ map: togT, roughness: 0.5 }), black, black, black]); togB.position.y = 0.18; togB.castShadow = true; tog.add(togB);
  const lev = new THREE.Group(); lev.position.set(0, 0.36, 0.45); tog.add(lev); box(0.22, 1.1, 0.22, std(0x5a5a5a, 0.6, 0.2), 0, 0.55, 0, lev); const levK = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 10), std(0xffb020, 0.3)); levK.position.y = 1.15; lev.add(levK);
  const togLamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x8a5a10 })); togLamp.position.set(-1.1, 0.4, -0.5); tog.add(togLamp);
  tog.rotation.y = 0.25;

  // inspiration cards and wish bubbles (own drawings)
  const card = (title, sub, art) => new THREE.Mesh(new THREE.PlaneGeometry(3.3, 4.3), new THREE.MeshBasicMaterial({ map: canvasTex(512, 668, (g, w, h) => { g.fillStyle = "#0b0b0b"; g.fillRect(0, 0, w, h); g.strokeStyle = WHT; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); art(g, w); g.fillStyle = WHT; g.textAlign = "center"; g.font = '700 50px "Chakra Petch",sans-serif'; title.forEach((l, i) => g.fillText(l, w / 2, 500 + i * 54)); g.fillStyle = SIG; g.font = '400 34px "Share Tech Mono",monospace'; g.fillText(sub, w / 2, 500 + title.length * 54 + 14); }), transparent: true, toneMapped: false, color: 0xdddddd, side: THREE.DoubleSide }));
  const cardA = card(["BREAKOUT"], "GAME · ATARI", (g) => { const cs = ["#f2f2f2", "#c7c7c7", "#9a9a9a"]; for (let y = 0; y < 3; y++) for (let x = 0; x < 6; x++) { g.fillStyle = cs[y]; g.fillRect(48 + x * 72, 60 + y * 34, 64, 26); } g.fillStyle = WHT; g.fillRect(200, 380, 110, 16); g.beginPath(); g.arc(300, 270, 12, 0, 7); g.fill(); g.setLineDash([8, 10]); g.strokeStyle = SIG; g.lineWidth = 4; g.beginPath(); g.moveTo(255, 378); g.lineTo(300, 270); g.lineTo(360, 170); g.stroke(); g.setLineDash([]); });
  const cardB = card(["THE WAR OF", "THE WORLDS"], "NOVEL", (g) => { g.strokeStyle = WHT; g.fillStyle = WHT; g.lineWidth = 9; g.beginPath(); g.ellipse(256, 150, 95, 52, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(200, 190); g.lineTo(120, 420); g.moveTo(256, 200); g.lineTo(262, 430); g.moveTo(312, 190); g.lineTo(400, 420); g.stroke(); g.fillStyle = "#0b0b0b"; g.fillRect(200, 140, 112, 14); g.fillStyle = SIG; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(256, 160); g.lineTo(180, 440); g.lineTo(340, 440); g.fill(); g.globalAlpha = 1; });
  cardA.position.set(10.4, 8.4, 1.2); cardB.position.set(17.6, 8.4, 1.2); scene.add(cardA, cardB);
  const bubble = (txt, art) => new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.2), new THREE.MeshBasicMaterial({ map: canvasTex(640, 446, (g, w, h) => { g.fillStyle = WHT; g.beginPath(); g.roundRect(10, 10, w - 20, h - 110, 60); g.fill(); g.beginPath(); g.arc(w / 2 - 40, h - 70, 26, 0, 7); g.fill(); g.beginPath(); g.arc(w / 2 - 70, h - 26, 14, 0, 7); g.fill(); art(g, w); g.fillStyle = "#050505"; g.font = '700 74px "Chakra Petch",sans-serif'; g.textAlign = "center"; g.fillText(txt, w / 2, 240); }), transparent: true, toneMapped: false, color: 0xb8b8b8, side: THREE.DoubleSide }));
  const bubA = bubble("WARNA", (g) => { ["#e5392f", "#ffb020", "#39ff14", "#1f7ae0", "#b04ae0"].forEach((c, i) => { g.fillStyle = c; g.fillRect(150 + i * 70, 70, 54, 54); }); });
  const bubB = bubble("LEBIH CEPAT", (g) => { g.fillStyle = "#050505"; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(210 + k * 80, 66); g.lineTo(260 + k * 80, 100); g.lineTo(210 + k * 80, 134); g.fill(); } });
  bubA.position.set(10.6, 9.4, 0.4); bubB.position.set(17.4, 9.4, 0.4); scene.add(bubA, bubB);
  const strikeM = new THREE.MeshBasicMaterial({ color: 0xffb020, toneMapped: false });
  const strikes = [bubA, bubB].map((b) => { const G = new THREE.Group(); G.position.copy(b.position).add(new THREE.Vector3(0, 0.45, 0.06)); scene.add(G); const s1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 0.05), strikeM); s1.rotation.z = 0.32; const s2 = s1.clone(); s2.rotation.z = -0.32; G.add(s1, s2); return G; });

  // ---------- engineer (original figure, generic face) ----------
  const H = avatar({ skin: 0xd9a37a, shirt: 0xf2f2f2, pants: 0x1d2026 });
  scene.add(H.G);
  const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.4, 20), std(0x161616, 0.7)); hair.position.y = 1.08; H.head.add(hair);
  box(0.12, 0.6, 0.06, copper, 0.55, 3.6, 0.53, H.G); // pen in the shirt pocket
  const iron = new THREE.Group(); iron.position.set(0, -2, 0.1); H.armR.add(iron);
  cyl(0.18, 0.18, 1.2, 10, std(0xffb020, 0.4), 0, 0, 0.3, iron).rotation.x = Math.PI / 2;
  const tipM = cyl(0.04, 0.08, 0.9, 8, std(0xbbbbbb, 0.3, 0.9), 0, 0, 1.3, iron); tipM.rotation.x = Math.PI / 2;
  const tip = new THREE.Object3D(); tip.position.set(0, 0, 1.8); iron.add(tip);
  const spark = pts(scene, 40, { color: 0xffe2a0, size: 0.16 }); const sp = Array.from({ length: 40 }, () => [rnd() * 6.28, rnd() * 0.6 + 0.3, rnd()]);
  const smoke = pts(scene, 30, { color: 0xbfc7c2, size: 0.5, add: false, opacity: 0.35 });
  const tipW = new THREE.Vector3();

  // ---------- world map of cabinets (s7) ----------
  const blobs = [[-100, 48, 30, 17], [-86, 30, 12, 9], [-92, 16, 7, 6], [-62, -14, 14, 22], [14, 50, 16, 9], [-2, 54, 3, 4], [20, 5, 18, 26], [32, 22, 10, 8], [90, 50, 44, 17], [78, 20, 8, 10], [104, 12, 8, 8], [138, 37, 3, 6], [115, -3, 14, 4], [134, -25, 16, 10], [46, 25, 9, 7]];
  const dots = [];
  for (let lat = 72; lat >= -45; lat -= 5) for (let lon = -170; lon <= 178; lon += 5) if (blobs.some(([cx, cy, rx, ry]) => ((lon - cx) / rx) ** 2 + ((lat - cy) / ry) ** 2 <= 1)) dots.push([lon, lat]);
  const MAPZ = 40, japan = [138, 37];
  const IM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.9, 0.5), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), dots.length); IM.frustumCulled = false; scene.add(IM);
  const dInfo = dots.map(([lon, lat]) => { const dd = Math.hypot(lon - japan[0], (lat - japan[1]) * 1.4); return { x: lon * 0.15, z: MAPZ - lat * 0.2, d: dd, jp: dd < 6 }; });
  const dMax = Math.max(...dInfo.map((d) => d.d));
  dInfo.forEach((d, i) => IM.setColorAt(i, new THREE.Color(d.jp ? 0xffb020 : 0x39ff14)));
  const dummy = new THREE.Object3D();

  // ---------- camera: px py pz lx ly lz ----------
  const C = (x, y, z, a, b, c) => [x, y, z, a, b, c];
  const cam0 = track([
    [0, ...C(0, 15.8, 39.5, 0, 15.6, -1)], [4.6, ...C(1.2, 15.6, 37, 0, 15.6, -1)], [5.7, ...C(2.2, 15.2, 37, 0.6, 15.2, -1)],
    [7.4, ...C(16.2, 9.8, 21, 14, 4.0, 2.4)], [K.s2 + 1.2, ...C(15.6, 10, 25.5, 14, 4.3, 1.8)], [AT["s2:Tomohiro"], ...C(13.2, 9.8, 26, 14, 4.2, 1.8)],
    [AT["s2:selama"], ...C(15.5, 9.8, 25.5, 15, 4.2, 1.8)], [AT["s2:merancang"], ...C(16.6, 9.8, 25, 15.2, 4.2, 2)], [tInt - 0.1, ...C(15, 8.6, 17.5, 14, 3.4, 2.8)], [AT["s2:Inspirasinya"] - 0.2, ...C(14.4, 8.2, 16, 14, 3.3, 3)],
    [AT["s2:Breakout"], ...C(14, 10, 29, 14, 5.6, 1.4)], [K.s3 - 0.3, ...C(13, 10, 29.5, 14, 5.7, 1.4)], [AT["s3:lebih"], ...C(14, 10, 29.5, 14, 6.4, 1)], [AT["s3:Layarnya"] - 0.2, ...C(15, 9.6, 28, 14, 6.3, 1)],
    [AT["s3:penuh"], ...C(1.2, 15.8, 39, 0, 15.6, -1)], [K.s3e, ...C(-0.8, 15.6, 38, 0, 15.6, -1)],
    [K.s4 + 0.9, ...C(0, 15.6, 40.5, 0, 15.5, -1)], [AT["s4:frame#2"], ...C(1.6, 15.4, 39.5, 0, 15.5, -1)], [K.s4e - 0.1, ...C(-1.2, 15.6, 39, 0, 15.5, -1)],
    [K.s5 + 1.1, ...C(9.5, 9.2, 22, 11.8, 3.9, 3.6)], [AT["s5:memilih"], ...C(10.6, 8.8, 20.5, 11.8, 3.8, 3.8)], [K.s5e - 0.1, ...C(11.8, 8.8, 20, 11.8, 3.8, 3.8)],
    [K.s6 + 1.0, ...C(0.8, 15.8, 38.5, 0, 15.6, -1)], [AT["s6:ditembak"] + 0.3, ...C(-0.6, 15.6, 37, 0, 15.5, -1)], [AT["s6:Belakangan"] + 0.6, ...C(12.5, 9.8, 26, 13.6, 4.6, 1.5)], [K.s6e - 0.1, ...C(15.5, 9.6, 25, 14, 4.5, 1.5)],
    [K.s7 + 1.6, ...C(0, 124, 66, 0, 0, 38.5)], [K.s7e - 0.2, ...C(1.5, 128, 68, 0, 0, 38.5)],
    [K.s8 + 1.3, ...C(6.5, 6.6, 38, 4.5, 4.0, 3)], [K.dur, ...C(5.2, 6.8, 36, 4.5, 4.0, 3)],
  ]);

  const tSeat = (c) => c.tDrop;
  return (t) => {
    const p = cam0(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);

    const st = drawScreen(t);
    const nAl = st.n;
    // load on the CPU follows the aliens it has to draw
    const heat = (nAl / 55) * (inPause(t) ? 0.35 : 1);
    glow.material.opacity = 0.08 + 0.42 * heat; heatL.intensity = 1 + 7 * heat;
    hp.forEach((q, i) => { const u = (t * 0.6 + q[2]) % 1; heatP.pos.set([14 + q[0], B.y + 0.6 + u * 3.2 * (0.4 + heat), 3.0 + q[1]], i * 3); });
    heatP.m.opacity = 0.6 * heat; heatP.commit();
    // pulses step along the cable every formation step
    const sgx = segAt(t); const si = last(sgx.steps, t);
    for (let i = 0; i < 16; i++) { const u = ((((Math.max(0, si) + i / 16) * 0.37 + i / 16) % 1) + 1) % 1; const v = cab3.getPointAt(u); pulse.pos.set([v.x, v.y + 0.18, v.z], i * 3); }
    pulse.commit();
    vFr[0].visible = st.f === 0; vFr[1].visible = st.f === 1;
    vox.position.y = 19 + Math.sin(t * 1.1) * 0.5; vox.rotation.y = 0.5 + Math.sin(t * 0.4) * 0.25;
    sides.forEach(({ m, s }) => { m.position.set(s < 0 ? -5.7 - 2.2 + Math.sin(t * 0.5) * 0.15 : 5.7 + 2.2 + 0.45 - Math.sin(t * 0.5) * 0.15, 0, 0); });

    // chips: exploded above the board while he designs, then seated one by one
    const liftU = ramp(t, K.s2 + 0.3, K.s2 + 1.4);
    chips.forEach((c) => { const seat = eout(clamp01((t - tSeat(c)) / 0.32)); const l = liftU * (1 - seat); c.G.position.set(c.x, B.y + 0.38 + l * c.lift, c.z); c.G.rotation.y = l * c.spin; });
    cpu.scale.setScalar(1 + 0.08 * Math.max(0, 1 - Math.abs(t - tInt - 0.3) * 2));

    // plates
    const pop = (a) => back(clamp01((t - a) / 0.35), 2.2);
    namePl.scale.setScalar(Math.max(0.001, pop(AT["s2:Tomohiro"])));
    signPl.scale.setScalar(Math.max(0.001, pop(AT["s2:1978"])));
    // calendar: twelve months over "selama setahun"
    const cu = clamp01((t - AT["s2:selama"]) / (AT["s2:setahun"] + 0.7 - AT["s2:selama"])) * 11.999;
    const mi = Math.floor(cu), mf = cu - mi;
    pageM.map = monT[Math.min(11, mi + (mf > 0 && mi < 11 ? 1 : 0))]; flipM.map = monT[mi];
    flipP.rotation.x = mi < 11 && t > AT["s2:selama"] ? -mf * Math.PI * 0.95 : 0; flip.visible = flipP.rotation.x > -2.9;

    // cards and bubbles
    const cA = pop(AT["s2:Breakout"]) * (1 - ramp(t, K.s3 + 0.2, K.s3 + 0.9)), cB = pop(AT["s2:War"]) * (1 - ramp(t, K.s3 + 0.3, K.s3 + 1.0));
    cardA.visible = cA > 0.01; cardA.scale.setScalar(Math.max(0.001, cA)); cardA.rotation.set(0, 0.25 + Math.sin(t * 0.9) * 0.06, 0.05); cardA.position.y = 8.4 + Math.sin(t * 1.3) * 0.15 + ramp(t, K.s3 + 0.2, K.s3 + 0.9) * 3;
    cardB.visible = cB > 0.01; cardB.scale.setScalar(Math.max(0.001, cB)); cardB.rotation.set(0, -0.25 + Math.sin(t * 0.8) * 0.06, -0.05); cardB.position.y = 8.4 + Math.sin(t * 1.2 + 1) * 0.15 + ramp(t, K.s3 + 0.3, K.s3 + 1.0) * 3;
    const bOut = 1 - ramp(t, AT["s3:Layarnya"] + 0.2, AT["s3:Layarnya"] + 0.8);
    const bA = pop(AT["s3:berwarna"]) * bOut, bB = pop(AT["s3:lebih"]) * bOut;
    bubA.visible = bA > 0.01; bubA.scale.setScalar(Math.max(0.001, bA)); bubA.rotation.y = 0.2;
    bubB.visible = bB > 0.01; bubB.scale.setScalar(Math.max(0.001, bB)); bubB.rotation.y = -0.2;
    [[AT["s3:tidak"], bA, 0.2], [AT["s3:kuat"], bB, -0.2]].forEach(([a, vis], i) => { const u = eout(clamp01((t - a) / 0.22)); strikes[i].visible = u > 0 && vis > 0.01; strikes[i].scale.set(Math.max(0.001, u), Math.max(0.001, vis), 1); strikes[i].rotation.y = i ? -0.2 : 0.2; });
    const dim = ramp(t, AT["s3:Tapi"], AT["s3:kuat"]) * (1 - ramp(t, K.s4 - 1, K.s4));

    // toggle stays OFF; lamp blinks while he considers it
    lev.rotation.x = -0.55 + 0.25 * Math.max(0, Math.sin((t - AT["s5:menambalnya"]) * 5)) * (t > AT["s5:menambalnya"] && t < AT["s5:memilih"] ? 1 : 0);
    togLamp.visible = !(t > AT["s5:menambalnya"] && t < AT["s5:memilih"] && Math.floor(t * 4) % 2);

    // engineer
    const inS8 = t >= K.s8 - 0.2;
    H.G.position.set(inS8 ? 5.2 : 14, 0, inS8 ? 6.6 : -0.7);
    H.G.rotation.y = inS8 ? 0.15 : 0;
    restPose(H); H.head.rotation.set(0, 0, 0); iron.visible = t > K.s2 + 0.4 && t < AT["s2:Inspirasinya"];
    const solder = iron.visible && !(t > tInt - 0.6 && t < tInt + 0.8);
    let sparkOn = 0;
    if (t < K.s2) { H.head.rotation.x = 0.35; H.armL.rotation.x = -0.9; H.armR.rotation.x = -0.9; H.head.rotation.z = Math.sin(t * 2) * 0.05; }
    else if (t < AT["s2:Inspirasinya"]) {
      if (solder) { H.armR.rotation.x = -1.25 + Math.sin(t * 3.1) * 0.12; H.armR.rotation.z = 0.25; H.armL.rotation.x = -1.0; H.head.rotation.x = 0.45; sparkOn = Math.max(0, Math.sin(t * 3.1 + 1)); }
      else { H.armR.rotation.x = -0.5; H.head.rotation.x = 0.5; H.head.rotation.y = 0.0; }
    } else if (t < K.s3) { const look = t < AT["s2:War"] ? 0.45 : -0.45; H.head.rotation.set(-0.35, look, 0); (look > 0 ? H.armL : H.armR).rotation.x = -2.4; }
    else if (t < K.s4) {
      H.head.rotation.x = -0.4; H.head.rotation.y = Math.sin(t * 0.8) * 0.3;
      if (t > AT["s3:Tapi"]) { const sh = ramp(t, AT["s3:Tapi"], AT["s3:Tapi"] + 0.4); H.armL.rotation.z = -0.7 * sh; H.armR.rotation.z = 0.7 * sh; H.armL.rotation.x = H.armR.rotation.x = -0.6 * sh; H.head.rotation.x = -0.4 + 0.7 * sh; }
    } else if (t < K.s5) { H.head.rotation.x = 0.2; H.armL.rotation.x = -1; }
    else if (t < K.s6) {
      const reach = ramp(t, AT["s5:menambalnya"], AT["s5:menambalnya"] + 0.5) * (1 - ramp(t, AT["s5:memilih"], AT["s5:memilih"] + 0.4));
      H.armL.rotation.x = -1.2 * reach; H.armL.rotation.z = -0.35 * reach; H.head.rotation.set(0.35 * reach, 0.25 * reach, 0);
      if (t > AT["s5:memilih"] && t < AT["s5:memilih"] + 1.2) H.head.rotation.y = Math.sin((t - AT["s5:memilih"]) * 16) * 0.5 * (1 - (t - AT["s5:memilih"]) / 1.2);
      if (t > AT["s5:mekanik"]) { const u = ramp(t, AT["s5:mekanik"], AT["s5:mekanik"] + 0.3); H.armR.rotation.x = -2.6 * u; H.head.rotation.x = -0.2 * u; }
    } else if (t < K.s7) {
      const hit = K.hitT;
      if (t > hit && t < hit + 2.2) { const u = ramp(t, hit, hit + 0.25); H.armL.rotation.x = H.armR.rotation.x = -2.9 * u; H.armL.rotation.z = -0.3 * u; H.armR.rotation.z = 0.3 * u; H.G.position.y = Math.abs(Math.sin((t - hit) * 7)) * 0.5 * (1 - (t - hit) / 2.2); }
      else { H.head.rotation.x = -0.15 + Math.sin(t * 2.4) * 0.12 * (t > AT["s6:Belakangan"] ? 1 : 0); H.head.rotation.y = 0.5; H.armL.rotation.x = -0.8; }
    } else if (inS8) { H.armR.rotation.z = 2.7 + Math.sin(t * 7) * 0.35; H.head.rotation.z = Math.sin(t * 3.5) * 0.08; if (t > AT["s8:Kamu"]) H.armL.rotation.x = -1.2; }
    H.head.rotation.x += dim * 0;
    // solder sparks and smoke at the iron tip
    tip.getWorldPosition(tipW);
    sp.forEach((q, i) => { const u = (t * 2.2 + q[2]) % 1; const on = sparkOn > 0.2 && iron.visible ? 1 : 0; spark.pos.set([tipW.x + Math.cos(q[0]) * u * q[1], tipW.y + u * 0.8 - u * u * 1.2, tipW.z + Math.sin(q[0]) * u * q[1]], i * 3); spark.col.set(on ? [1, 0.85, 0.5] : [0, 0, 0], i * 3); });
    spark.commit();
    for (let i = 0; i < 30; i++) { const u = (t * 0.35 + i / 30) % 1; const on = iron.visible ? 1 : 0; smoke.pos.set([tipW.x + Math.sin(i * 1.7 + t) * 0.4 * u, tipW.y + u * 4 * on - (on ? 0 : 50), tipW.z + Math.cos(i) * 0.3 * u], i * 3); }
    smoke.commit();

    // world map: copies of the cabinet fly out from the machine and land as glowing dots
    const m0 = AT["s7:hit"] - 0.6, m1 = AT["s7:seluruh"] + 1.6;
    dInfo.forEach((d, i) => {
      const t0 = m0 + (d.d / dMax) * (m1 - m0), u = clamp01((t - t0) / 0.7);
      if (t < m0 - 0.1 || u <= 0) { dummy.position.set(0, -60, 0); dummy.scale.setScalar(0.001); }
      else { const e = eout(u); dummy.position.set(d.x * e, 26 * (1 - e) + Math.sin(e * Math.PI) * 10 + 0.45, -4 + (d.z + 4) * e); dummy.scale.setScalar(0.6 + 0.4 * e + (u >= 1 ? 0.25 * Math.max(0, Math.sin((t - t0) * 3)) : 0)); }
      dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); IM.setMatrixAt(i, dummy.matrix);
    });
    IM.instanceMatrix.needsUpdate = true; IM.visible = t > m0 - 0.2;

    comp.render();
  };
}
