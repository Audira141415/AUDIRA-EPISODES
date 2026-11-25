// EP22 BOLA PENANDA SUTET (TACTICBOARD): a flight-briefing board instead of a pitch. One bevelled terrain board (mowed
// stripes, chalk grid, a river, a runway) sits in a dark room ringed by twinkling bokeh lights. Two lattice towers carry
// four phase wires and the top ground wire across the river; the marker balls are glossy acrylic tokens clipped on the
// ground wire. A cobalt toy helicopter is the pilot's token and flies yellow telestrator paths; coral dashes mark danger.
//   s1 macro on an orange ball -> s2 wide board, pilot POV with balls hidden -> s3 near miss, balls pop on -> s4 tower top,
//   live wires crossed out, lightning on the ground wire -> s5 colour rules + a 3-ball mini span -> s6 size / spacing
//   brackets, Canada layout -> s7 night, red line-powered lamps, switched off -> s8 wide, helicopter passes safely.
// Generic objects only. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";
import { NanGuard, gradePass, stripEnv, textPlane, flashAt } from "./kit3d.js";

const C = { orange: "#FF7A1A", white: "#F4F2EC", yellow: "#FFD23A", tele: "#FFE27A", coral: "#FF5A3C", cobalt: "#2F7BFF", gold: "#FFC94A",
  grassA: "#2f6b3e", grassB: "#2a6038", river: "#2f6f9a", steel: "#a9b0b6", red: "#ff2a1f", ink: "#0b1118" };
const SANS = "'Arial Black', Arial, sans-serif", MONO = "'Courier New', monospace";
const TL = -7, TR = 7, PEAK = 6.2, GSAG = 0.7, PH = [[4.6, -1.4], [4.6, 1.4], [3.6, -1.4], [3.6, 1.4]], PSAG = 1.0;
const gy = (x) => PEAK - GSAG * (1 - (x / TR) ** 2); // ground wire height along the span

function boardTex() {
  const R = mulberry(2222);
  return canvasTex(2048, 1366, (g, w, h) => {
    for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? C.grassA : C.grassB; g.fillRect((i * w) / 16, 0, w / 16 + 1, h); }
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "0,0,0" : "255,255,255"},${0.03 + R() * 0.04})`; g.fillRect(R() * w, R() * h, 3, 3); }
    // river crossing under the span (board x ~ -1.6..1.6 -> canvas)
    g.fillStyle = C.river; g.beginPath(); g.moveTo(w * 0.47, 0);
    for (let y = 0; y <= h; y += 20) g.lineTo(w * 0.47 + Math.sin(y / 160) * 40, y);
    for (let y = h; y >= 0; y -= 20) g.lineTo(w * 0.53 + Math.sin(y / 160) * 40, y);
    g.fill(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 4; g.setLineDash([18, 22]);
    for (let y = 40; y < h; y += 140) { g.beginPath(); g.moveTo(w * 0.485 + Math.sin(y / 160) * 40, y); g.lineTo(w * 0.515 + Math.sin(y / 160) * 40, y + 40); g.stroke(); }
    g.setLineDash([]);
    // chalk grid + runway
    g.strokeStyle = "rgba(255,255,255,.22)"; g.lineWidth = 3;
    for (let x = 0; x <= w; x += w / 15) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += h / 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = "#3a3d42"; g.fillRect(w * 0.7, h * 0.12, w * 0.27, h * 0.08);
    g.strokeStyle = "#fff"; g.lineWidth = 6; g.setLineDash([40, 30]); g.beginPath(); g.moveTo(w * 0.71, h * 0.16); g.lineTo(w * 0.96, h * 0.16); g.stroke(); g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,.85)"; g.font = `700 44px ${MONO}`; g.fillText("BANDARA", w * 0.72, h * 0.11); g.fillText("SUNGAI", w * 0.54, h * 0.94);
    g.fillText("LEMBAH", w * 0.08, h * 0.94);
  });
}
function rbox(w, h, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelSize: r * 0.6, bevelThickness: r * 0.6, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -(d - 2 * r * 0.6) / 2);
  return geo;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function bar(a, b, r, mat, parent) {
  const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), mat);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.castShadow = true; parent.add(m); return m;
}
function sagCurve(x0, x1, y, z, sag, n = 40) {
  const p = [];
  for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, m = (x - (x0 + x1) / 2) / ((x1 - x0) / 2); p.push(V(x, y - sag * (1 - m * m), z)); }
  return new THREE.CatmullRomCurve3(p);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0b1118, fog: 0.012, exp: 1.0, bloom: [0.45, 0.45, 0.85] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const grade = gradePass({ shadow: [0.2, 0.35, 0.6], high: [1.02, 1.0, 0.97], sat: 1.06, con: 1.05, flashColor: [1, 1, 1] });
  comp.addPass(grade);
  stripEnv(r, scene, [[10, 2, 0xffffff, 2.0, 0, 9, 3], [3, 7, 0xffe7c2, 1.2, -8, 3, 4], [3, 7, 0xc2dcff, 1.0, 8, 3, -4]], 0x0d1520, 0.55);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

  const hemi = new THREE.HemisphereLight(0xdfeeff, 0x1a2a20, 0.6); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1dc, 2.6); key.position.set(-8, 16, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 12, bottom: -12, near: 1, far: 60 }); key.shadow.bias = -0.0004;
  const rim = new THREE.DirectionalLight(0x8fc4ff, 1.6); rim.position.set(8, 9, -12);
  scene.add(key, rim);

  // board + nameplate
  const board = new THREE.Mesh(rbox(30, 0.6, 20, 0.25), new THREE.MeshStandardMaterial({ color: "#2b2f35", roughness: 0.5, metalness: 0.2 }));
  board.position.y = -0.3; board.receiveShadow = true; scene.add(board);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(29.4, 19.4), new THREE.MeshStandardMaterial({ map: boardTex(), roughness: 0.85 }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.005; top.receiveShadow = true; scene.add(top);
  const plate = textPlane(1024, 128, [["AUDIRA · PAPAN BRIEFING TERBANG", `900 62px ${SANS}`, C.gold, 0.52]], 9); plate.position.set(0, -0.3, 10.02); scene.add(plate);
  for (const [x, z, sx, sy, sz] of [[-11, -5, 4, 1.4, 3], [-12.5, 5.5, 3, 1.0, 2.5], [11.5, 4, 3.5, 1.2, 3]]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#3d7a47", roughness: 0.9 }));
    hill.scale.set(sx, sy, sz); hill.position.set(x, 0, z); hill.castShadow = hill.receiveShadow = true; scene.add(hill);
  }
  // bokeh room lights
  const BK = pts(scene, 220, { color: 0xffffff, size: 1.6, opacity: 0.7 });
  const RB = mulberry(31), bk = [];
  for (let i = 0; i < 220; i++) { const a = RB() * 6.28, rr = 30 + RB() * 12; BK.pos[i * 3] = Math.cos(a) * rr; BK.pos[i * 3 + 1] = 2 + RB() * 24; BK.pos[i * 3 + 2] = Math.sin(a) * rr; bk.push([RB(), RB() < 0.6 ? [1, 0.8, 0.55] : [0.55, 0.75, 1]]); }

  // towers
  const steel = new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.38, metalness: 0.85 });
  const tower = (x) => {
    const G = new THREE.Group(); G.position.x = x; scene.add(G);
    const lv = [[0, 1.0], [2.4, 0.62], [3.6, 0.45], [4.6, 0.38], [5.6, 0.25], [PEAK, 0.12]];
    for (let i = 0; i < lv.length - 1; i++) {
      const [y0, w0] = lv[i], [y1, w1] = lv[i + 1];
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) bar(V(sx * w0, y0, sz * w0), V(sx * w1, y1, sz * w1), 0.045, steel, G);
      for (const [a, b] of [[[1, 1], [1, -1]], [[1, -1], [-1, -1]], [[-1, -1], [-1, 1]], [[-1, 1], [1, 1]]]) {
        bar(V(a[0] * w0, y0, a[1] * w0), V(b[0] * w1, y1, b[1] * w1), 0.022, steel, G); bar(V(b[0] * w0, y0, b[1] * w0), V(a[0] * w1, y1, a[1] * w1), 0.022, steel, G);
      }
    }
    for (const y of [3.6, 4.6]) { bar(V(0, y, -1.7), V(0, y, 1.7), 0.05, steel, G); bar(V(0, y + 0.45, -0.4), V(0, y, -1.7), 0.03, steel, G); bar(V(0, y + 0.45, 0.4), V(0, y, 1.7), 0.03, steel, G);
      for (const z of [-1.4, 1.4]) { const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10), new THREE.MeshStandardMaterial({ color: "#c9dbe6", roughness: 0.2, metalness: 0.1 })); ins.position.set(0, y - 0.25, z); G.add(ins); } }
    return G;
  };
  tower(TL); tower(TR);
  const wireM = new THREE.MeshStandardMaterial({ color: "#1d2024", roughness: 0.45, metalness: 0.6, emissive: new THREE.Color(C.coral), emissiveIntensity: 0, transparent: true });
  const phases = PH.map(([y, z]) => { const m = new THREE.Mesh(new THREE.TubeGeometry(sagCurve(TL, TR, y - 0.5, z, PSAG), 80, 0.035, 6), wireM); m.castShadow = true; scene.add(m); return m; });
  const gCurve = sagCurve(TL, TR, PEAK, 0, GSAG);
  const gwM = new THREE.MeshStandardMaterial({ color: "#2a2d31", roughness: 0.4, metalness: 0.7, emissive: new THREE.Color(C.gold), emissiveIntensity: 0, transparent: true });
  const gWire = new THREE.Mesh(new THREE.TubeGeometry(gCurve, 100, 0.03, 6), gwM); scene.add(gWire);
  // phase wire crosses (X marks) for "tidak dipasang di kabel bertegangan"
  const xs = [-3, 3].map((x) => { const t = textPlane(128, 128, [["✕", `900 120px ${SANS}`, C.coral, 0.55]], 0.9); t.position.set(x, 4.6 - 0.5 - PSAG * (1 - (x / TR) ** 2) + 0.35, 1.4); scene.add(t); return t; });

  // marker balls: 13 slots on the ground wire; layout morphs US (7 big) -> Canada (11 smaller)
  const ballGeo = new THREE.SphereGeometry(1, 40, 24);
  const mkBall = () => { const g = new THREE.Group(); const m = new THREE.Mesh(ballGeo, new THREE.MeshPhysicalMaterial({ color: C.orange, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, emissive: new THREE.Color(C.red), emissiveIntensity: 0 }));
    m.castShadow = true; g.add(m); const seam = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.04, 8, 40), new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.5 })); seam.rotation.y = Math.PI / 2; g.add(seam);
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 10), steel); clamp.rotation.z = Math.PI / 2; clamp.position.y = 1.0; g.add(clamp); scene.add(g); return { g, m }; };
  const balls = Array.from({ length: 13 }, mkBall);
  const US = [-6, -4, -2, 0, 2, 4, 6], CA = [-6, -4.8, -3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6, 4.8, 6];
  const COL = { O: new THREE.Color(C.orange), W: new THREE.Color(C.white), Y: new THREE.Color(C.yellow), D: new THREE.Color("#7a6a60") };
  // mini span (fewer than four balls -> all orange)
  const MS = new THREE.Group(); MS.position.set(5, 0, 6.2); scene.add(MS);
  for (const x of [-3, 3]) { bar(V(x, 0, 0), V(x, 3.2, 0), 0.09, steel, MS); bar(V(x, 3.2, -0.6), V(x, 3.2, 0.6), 0.05, steel, MS); }
  const msC = sagCurve(-3, 3, 3.2, 0, 0.35); MS.add(new THREE.Mesh(new THREE.TubeGeometry(msC, 40, 0.025, 6), gwM));
  const mini = [-1.5, 0, 1.5].map((x) => { const b = mkBall(); MS.add(b.g); b.g.position.set(x, 3.2 - 0.35 * (1 - (x / 3) ** 2) - 0.18, 0); return b; });
  // night lamps on the upper front phase wire + energy particles
  const lampX = [-4, 0, 4];
  const lamps = lampX.map((x) => { const y = 4.6 - 0.5 - PSAG * (1 - (x / TR) ** 2); const L = new THREE.Group(); L.position.set(x, y, 1.4); scene.add(L);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 14), new THREE.MeshStandardMaterial({ color: "#3b3f46", roughness: 0.4, metalness: 0.6 })); body.rotation.z = Math.PI / 2; L.add(body);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: C.red, toneMapped: false })); dome.position.y = 0.1; L.add(dome);
    const glow = new THREE.PointLight(0xff3020, 0, 4, 2); glow.position.y = 0.3; L.add(glow); return { L, dome, glow }; });
  const EN = pts(scene, 60, { color: 0xffb070, size: 0.18 });
  const enCurve = sagCurve(TL, TR, 4.6 - 0.5, 1.4, PSAG);

  // helicopter token
  const HE = new THREE.Group(); scene.add(HE);
  const hb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 18), new THREE.MeshPhysicalMaterial({ color: C.cobalt, roughness: 0.25, clearcoat: 1 })); hb.scale.set(1.25, 0.8, 0.8); hb.castShadow = true; HE.add(hb);
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 12), new THREE.MeshPhysicalMaterial({ color: "#bfe6ff", roughness: 0.05, transmission: 0.3, transparent: true, opacity: 0.8 })); canopy.position.set(0.32, 0.08, 0); HE.add(canopy);
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.3, 10), hb.material); boom.rotation.z = Math.PI / 2; boom.position.set(-1.05, 0.1, 0); HE.add(boom);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.04), new THREE.MeshStandardMaterial({ color: C.white, roughness: 0.4 })); fin.position.set(-1.65, 0.28, 0); HE.add(fin);
  const tailLab = textPlane(256, 64, [["AUDIRA", `900 44px ${SANS}`, "#ffffff", 0.5]], 0.6); tailLab.position.set(-1.0, 0.18, 0.11); HE.add(tailLab);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25), steel); mast.position.y = 0.48; HE.add(mast);
  const rotor = new THREE.Group(); rotor.position.y = 0.6; HE.add(rotor);
  for (let i = 0; i < 2; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.02, 0.1), new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.5 })); bl.rotation.y = i * Math.PI / 2; rotor.add(bl); }
  for (const z of [-0.32, 0.32]) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), steel); sk.rotation.z = Math.PI / 2; sk.position.set(0, -0.5, z); HE.add(sk); }
  // telestrator paths: yellow flight path (s3 near miss, s8 safe pass) + coral danger dashes
  const dashT = canvasTex(256, 16, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#fff"; for (let i = 0; i < 6; i++) g.fillRect(i * 44, 3, 28, 10); });
  const tube = (pp, c, rad = 0.06) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), 80, rad, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); scene.add(m); return m; };
  const hp3 = new THREE.CatmullRomCurve3([V(-12, 2.4, 8), V(-6, 3.4, 5), V(-1.5, 4.3, 1.6), V(0.3, 4.9, 0.4)]);
  const path3 = tube(hp3.getPoints(30), C.tele);
  const danger = tube([V(0.3, 4.9, 0.4), V(1.5, 5.3, -0.6), V(3, 5.6, -2)], C.coral, 0.07); danger.material.map = dashT;
  const hp8 = new THREE.CatmullRomCurve3([V(-12, 4, 8), V(-5, 7.6, 3), V(1, 8.4, -1), V(8, 7.4, -6), V(14, 6, -9)]);
  const path8 = tube(hp8.getPoints(40), C.tele);
  // brackets for size / spacing
  const brM = new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0, toneMapped: false });
  const bY = gy(0) - 0.32;
  const size = new THREE.Group(); scene.add(size);
  for (const dy of [-0.32, 0.32]) bar(V(0.45, bY + dy, 0.4), V(0.75, bY + dy, 0.4), 0.018, brM, size);
  bar(V(0.75, bY - 0.32, 0.4), V(0.75, bY + 0.32, 0.4), 0.018, brM, size);
  const sizeLab = textPlane(320, 96, [["min. 91 cm", `900 56px ${SANS}`, C.gold, 0.5]], 1.1, { bg: "rgba(11,17,24,.85)" }); sizeLab.position.set(1.45, bY, 0.45); size.add(sizeLab);
  const span = new THREE.Group(); scene.add(span);
  const sY = gy(1) - 1.25;
  bar(V(0, sY, 0.3), V(2, sY, 0.3), 0.018, brM, span); for (const x of [0, 2]) bar(V(x, sY - 0.15, 0.3), V(x, sY + 0.15, 0.3), 0.018, brM, span);
  const spanLab = textPlane(320, 96, [["± 60 m", `900 56px ${SANS}`, C.gold, 0.5]], 1.1, { bg: "rgba(11,17,24,.85)" }); spanLab.position.set(1, sY - 0.42, 0.32); span.add(spanLab);
  // lightning bolt to the left tower peak
  const RL = mulberry(99), bolt = [V(TL - 2, 15, -1)];
  for (let i = 1; i < 9; i++) bolt.push(V(TL - 2 + 2 * (i / 9) + (RL() - 0.5) * 1.2, 15 - (15 - PEAK) * (i / 9), -1 + i / 9 + (RL() - 0.5) * 0.6));
  bolt.push(V(TL, PEAK + 0.05, 0));
  const lightning = new THREE.Line(new THREE.BufferGeometry().setFromPoints(bolt), new THREE.LineBasicMaterial({ color: "#e8f4ff", transparent: true, opacity: 0, toneMapped: false })); scene.add(lightning);
  const boltGlow = tube(bolt, "#9fd2ff", 0.08);

  // ---------------- camera ----------------
  const k = (t, p, l) => [t, ...p, ...l];
  const by = gy(0);
  const CAM = track([
    k(0, [1.25, by + 0.35, 2.7], [0, by - 0.55, 0]),
    k(K.s1e - 1.5, [1.6, by + 0.45, 3.4], [0, by - 0.5, 0]),
    k(A("s1:pilot"), [3.2, 6.6, 8.0], [-1.0, 4.6, 0]),
    k(A("s2:sungai"), [4.0, 11.5, 19.5], [0, 1.6, 0]),
    k(A("s2:bandara"), [9.0, 10.5, 15.5], [6.0, 1.2, -3.0]),
    k(A("s2:kokpit"), [-9.0, 3.8, 9.0], [0, 4.6, 0]),
    k(K.s2e, [-7.0, 4.0, 7.8], [0, 4.8, 0]),
    k(A("s3:menabraknya"), [-3.2, 5.6, 6.8], [0.2, 4.9, 0]),
    k(A("s3:Karena"), [0.5, 6.4, 9.8], [0, 4.9, 0]),
    k(K.s3e, [1.0, 6.6, 10.6], [0, 5.0, 0]),
    k(A("s4:bertegangan"), [-2.0, 5.2, 7.2], [-3.0, 4.0, 0]),
    k(A("s4:dijepit"), [-3.5, 6.9, 5.2], [-5.0, 5.7, 0]),
    k(A("s4:petir"), [-2.2, 8.4, 8.6], [-6.0, 6.6, 0]),
    k(K.s4e, [-1.0, 7.4, 9.4], [-1.5, 5.4, 0]),
    k(A("s5:Amerika"), [1.5, 6.9, 12.0], [0, 5.1, 0]),
    k(A("s5:Kedua"), [-3.2, 6.6, 9.0], [-4.5, 5.3, 0]),
    k(A("s5:kurang"), [7.5, 4.9, 13.5], [5.0, 2.9, 6.2]),
    k(K.s5e, [6.5, 4.6, 12.4], [5.0, 2.9, 6.2]),
    k(A("s6:Ukurannya"), [1.6, by + 0.5, 3.6], [0.4, by - 0.55, 0]),
    k(A("s6:sembilan"), [1.9, by + 0.3, 3.3], [0.6, by - 0.6, 0]),
    k(A("s6:enam"), [1.6, by - 0.2, 5.0], [1.0, by - 1.0, 0]),
    k(A("s6:Kanada"), [0.6, 6.8, 11.4], [0, 5.0, 0]),
    k(K.s6e, [0.2, 7.0, 12.2], [0, 5.0, 0]),
    k(A("s7:menyala"), [2.4, 5.4, 8.8], [0, 4.2, 0.8]),
    k(A("s7:kabel"), [1.3, 4.6, 5.0], [0, 3.6, 1.4]),
    k(K.s7e, [2.0, 5.2, 7.4], [0, 3.8, 1.2]),
    k(K.s8 + 0.6, [3.5, 8.0, 14.0], [0, 4.2, 0]),
    k(A("s8:AUDIRA"), [5.0, 10.5, 19.5], [0, 3.6, 0]),
    k(K.dur, [5.6, 11.5, 21.5], [0, 3.4, 0]),
  ]);
  const look = new THREE.Vector3();
  const hTmp = V(0, 0, 0), hTan = V(0, 0, 0);

  return (t) => {
    const c = CAM(t);
    cam.position.set(c[0] + 0.04 * Math.sin(t * 0.37), c[1] + 0.03 * Math.sin(t * 0.53 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    const tLight = A("s4:petir");
    const night = ramp(t, K.s7 - 0.3, A("s7:Malam") + 0.6) * (1 - ramp(t, K.s8 - 0.2, K.s8 + 0.6));
    grade.uniforms.flash.value = 0.6 * flashAt(t, [tLight], 0.22);
    r.toneMappingExposure = 1.0 - 0.45 * night; key.intensity = 2.6 * (1 - 0.8 * night); hemi.intensity = 0.6 * (1 - 0.7 * night); scene.environmentIntensity = 0.55 * (1 - 0.6 * night);
    // bokeh twinkle
    for (let i = 0; i < 220; i++) { const [s, col] = bk[i], v = (0.45 + 0.55 * Math.max(0, Math.sin(t * (0.6 + s) + s * 40))) * (1 - 0.5 * night); BK.col[i * 3] = col[0] * v; BK.col[i * 3 + 1] = col[1] * v; BK.col[i * 3 + 2] = col[2] * v; }
    BK.commit();

    // wires: dim in the pilot POV ("nyaris tidak terlihat"), live wires glow coral in s4, ground wire gold
    const hide = win(t, A("s2:kokpit") - 0.3, A("s3:Karena"), 0.4);
    wireM.opacity = gwM.opacity = 1 - 0.75 * hide;
    const live = win(t, A("s4:bertegangan") - 0.3, A("s4:dijepit") + 0.4, 0.3);
    wireM.emissiveIntensity = 0.9 * live;
    xs.forEach((x) => { x.material.opacity = live; x.lookAt(cam.position); });
    const gHi = win(t, A("s4:dijepit") - 0.2, K.s4e, 0.4);
    gwM.emissiveIntensity = 0.7 * gHi + 1.5 * flashAt(t, [tLight], 0.35);
    lightning.material.opacity = flashAt(t, [tLight, tLight + 0.12], 0.1); boltGlow.material.opacity = 0.6 * lightning.material.opacity;

    // balls: hidden in s2 / start of s3, pop on one by one after "Karena itu"
    const tPop = A("s3:Karena");
    const pre = t >= tPop - 0.1 || t < A("s2:Kabel") - 0.1;
    const ca = ramp(t, A("s6:Kanada") - 0.2, A("s6:rapat") + 0.3);
    const yel = ramp(t, A("s5:kuning") - 0.2, A("s5:kuning") + 0.3);
    balls.forEach((b, i) => {
      const nUS = US.length, nCA = CA.length, j = i;
      const xU = j < nUS ? US[j] : US[nUS - 1], xC = j < nCA ? CA[j] : CA[nCA - 1];
      const x = xU + (xC - xU) * ca;
      const showUS = j < nUS ? 1 : 0, showCA = j < nCA ? 1 : 0;
      const vis = showUS + (showCA - showUS) * ca;
      const popT = t < A("s2:Kabel") ? 1 : back(clamp01((t - tPop - 0.25 - j * 0.12) / 0.4), 1.6);
      const rad = 0.3 - 0.09 * ca, s = Math.max(0.001, rad * vis * (pre ? popT : 0));
      b.g.position.set(x, gy(x) - rad - 0.02, 0); b.g.scale.setScalar(s); b.g.visible = s > 0.002;
      // colours: US pattern O W O W ..., with yellow added; ends orange
      const n = nUS + (nCA - nUS) * (ca > 0.5 ? 1 : 0), idx = j, end = idx === 0 || idx === Math.round(n) - 1;
      const seq = yel > 0.5 ? ["O", "W", "Y"] : ["O", "W"];
      const key0 = end ? "O" : seq[idx % seq.length];
      b.m.material.color.copy(COL[key0]).lerp(COL.D, 0.7 * night);
      const sw = 1 + 0.08 * Math.sin(t * 1.3 + j);
      b.g.rotation.z = 0.04 * Math.sin(t * 0.9 + j) * sw;
    });
    mini.forEach((b, i) => { const s = Math.max(0.001, 0.25 * back(clamp01((t - A("s5:kurang") + 0.2 - i * 0.15) / 0.5), 1.4)); b.g.scale.setScalar(s); b.m.material.color.copy(COL.O).lerp(COL.D, 0.7 * night); });
    MS.visible = true;

    // brackets
    const sz = win(t, A("s6:sembilan") - 0.3, A("s6:Jarak"), 0.3), sp = win(t, A("s6:enam") - 0.3, A("s6:Aturan"), 0.3);
    size.visible = sz > 0.01; span.visible = sp > 0.01;
    brM.opacity = Math.max(sz, sp); sizeLab.material.opacity = sz; spanLab.material.opacity = sp;
    sizeLab.lookAt(cam.position); spanLab.lookAt(cam.position);

    // night lamps: on at "menyala", energy flows from the wire, off at "dimatikan"
    const on = ramp(t, A("s7:menyala") - 0.2, A("s7:menyala") + 0.3) * (1 - ramp(t, A("s7:dimatikan") - 0.1, A("s7:dimatikan") + 0.3)) * night;
    lamps.forEach((l, i) => { const p = on * (0.85 + 0.15 * Math.sin(t * 3 + i)); l.dome.material.color.setRGB(0.25 + 0.75 * p, 0.04 + 0.12 * p, 0.03 + 0.08 * p); l.glow.intensity = 6 * p; l.L.visible = t > K.s6e - 0.5 && t < K.s8 + 0.5; });
    const enOn = on * ramp(t, A("s7:energinya") - 0.3, A("s7:energinya") + 0.4);
    for (let i = 0; i < 60; i++) { const L = lampX[i % 3], u0 = (L - TL) / (TR - TL), du = 0.12 * (1 - ((t * 0.9 + i / 20) % 1)) * (i % 2 ? 1 : -1);
      enCurve.getPoint(clamp01(u0 + du), hTmp); EN.pos[i * 3] = hTmp.x; EN.pos[i * 3 + 1] = hTmp.y + 0.05; EN.pos[i * 3 + 2] = hTmp.z;
      EN.col[i * 3] = enOn; EN.col[i * 3 + 1] = 0.69 * enOn; EN.col[i * 3 + 2] = 0.44 * enOn; }
    EN.commit();
    wireM.emissive.set(night > 0.5 ? "#ffb070" : C.coral); if (night > 0.5) wireM.emissiveIntensity = 0.35 * enOn;

    // helicopter: background hover in s1, POV glide in s2, near miss in s3, out of frame s4-s7, safe pass in s8
    rotor.rotation.y = t * 22;
    let hv = true;
    if (t < K.s2) { HE.position.set(-4.5, 4.4 + 0.1 * Math.sin(t * 1.5), -4); HE.rotation.set(0, -0.5, 0.05); }
    else if (t < A("s3:Helikopter") - 0.3) { hv = false; }
    else if (t < K.s4) {
      const u = clamp01((t - A("s3:Helikopter") + 0.3) / (A("s3:menabraknya") + 0.6 - A("s3:Helikopter") + 0.3)), back3 = ramp(t, A("s3:sadar"), A("s3:Karena") + 0.4);
      hp3.getPointAt(eout(u) * (1 - 0.35 * back3), hTmp); hp3.getTangentAt(Math.min(0.99, eout(u)), hTan);
      HE.position.copy(hTmp); HE.rotation.set(0, Math.atan2(-hTan.z, hTan.x), -0.18 * (1 - back3) + 0.25 * back3);
    } else if (t < K.s8) hv = false;
    else { const u = clamp01((t - K.s8 - 0.3) / (K.dur - K.s8 - 0.6)); hp8.getPointAt(u, hTmp); hp8.getTangentAt(u, hTan); HE.position.copy(hTmp); HE.rotation.set(0, Math.atan2(-hTan.z, hTan.x), -0.12); }
    HE.visible = hv; HE.scale.setScalar(t < K.s2 ? 0.8 : 1);
    path3.material.opacity = 0.9 * win(t, A("s3:Helikopter") - 0.3, K.s3e, 0.4);
    danger.material.opacity = 0.95 * win(t, A("s3:menabraknya") - 0.2, A("s3:Karena"), 0.3);
    path8.material.opacity = 0.85 * ramp(t, K.s8, K.s8 + 0.8);
    bp.strength = 0.45 + 0.5 * night;
    comp.render();
  };
}
