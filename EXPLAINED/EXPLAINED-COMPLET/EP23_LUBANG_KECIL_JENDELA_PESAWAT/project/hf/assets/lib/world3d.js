// EP23 LUBANG KECIL JENDELA PESAWAT (STAINEDGLASS): the cabin wall is a warm carved-stone chamber and the cabin window
// is a leadlight: three rounded-rectangle panes of jewel-tone diamond quarries in dark lead cames, lit from behind by the
// sky at altitude. Light lands as a coloured pool on the flagstones; dust drifts in four tinted shafts.
//   s1-s2 window in the wall, push to the breather hole (a white jewel in the middle pane) -> s3 the panes lift out into
//   the cabin as an exploded stack (outer sapphire, middle amber with the hole, inner rose scratch pane) -> s4 gold
//   cabin air vs thin blue outside air, force arrows push outward -> s5 air flows through the hole into the gap, only the
//   outer pane carries the load -> s6 the outer pane cracks, the middle pane takes over, a small leak -> s7 mist leaves
//   through the hole, frost flowers ring the hole -> s8 panes seat back, a passenger sits by the window, brass AUDIRA plaque.
// Generic objects only. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";
import { NanGuard, gradePass, stripEnv, textPlane, person, pose, flashAt } from "./kit3d.js";

const C = { lead: "#1A1B1E", stone: "#8a7a68", stoneD: "#5a4d40", gold: "#E8A33A", ruby: "#B3122E", sapph: "#1F4FA8", emer: "#1E7A4C", parch: "#F1E6CF", ice: "#dff4ff", brass: "#b8893a" };
const SERIF = "Georgia, 'Times New Roman', serif";
const W = 2.4, H = 3.4, RR = 1.0, HOLE = [0, -1.3];
const FLOOR = -2.4;

function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function paneGeo() {
  const g = new THREE.ShapeGeometry(rrShape(W, H, RR), 24), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getY(i) + H / 2) / H);
  return g;
}
// Diamond-quarry leadlight; pic(u,v) returns the glass colour of a quarry centre.
function leadTex(seed, pic, { hole = false, crack = false } = {}) {
  const R = mulberry(seed);
  return canvasTex(512, 726, (g, w, h) => {
    g.fillStyle = C.lead; g.fillRect(0, 0, w, h);
    const sx = 64, sy = 86;
    for (let j = -1; j < h / sy * 2 + 2; j++) for (let i = -1; i < w / sx + 2; i++) {
      const cx = i * sx + (j % 2 ? sx / 2 : 0), cy = (j * sy) / 2;
      const col = new THREE.Color(pic(cx / w, 1 - cy / h)).offsetHSL((R() - 0.5) * 0.03, 0, (R() - 0.5) * 0.12);
      g.fillStyle = "#" + col.getHexString();
      g.beginPath(); g.moveTo(cx, cy - sy / 2 + 4); g.lineTo(cx + sx / 2 - 4, cy); g.lineTo(cx, cy + sy / 2 - 4); g.lineTo(cx - sx / 2 + 4, cy); g.closePath(); g.fill();
      // streaky pot-metal texture
      g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 10, cy - 14); g.lineTo(cx + 8, cy + 10); g.stroke();
    }
    g.strokeStyle = C.lead; g.lineWidth = 22; g.strokeRect(0, 0, w, h);
    if (hole) { const hx = w / 2, hy = h * (1 - (HOLE[1] + H / 2) / H); g.fillStyle = C.lead; g.beginPath(); g.arc(hx, hy, 22, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.arc(hx, hy, 11, 0, 7); g.fill(); }
  });
}
function crackTex() {
  const R = mulberry(404);
  return canvasTex(512, 726, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = "#fff4e8"; g.lineCap = "round";
    const cx = w * 0.55, cy = h * 0.42;
    for (let k = 0; k < 11; k++) { let x = cx, y = cy, a = (k / 11) * 6.28 + R() * 0.3; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 7; s++) { a += (R() - 0.5) * 0.7; x += Math.cos(a) * 40; y += Math.sin(a) * 40; g.lineTo(x, y); g.lineWidth = Math.max(1.5, 5 - s * 0.6); } g.stroke(); }
    for (let k = 1; k < 4; k++) { g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, k * 52, 0, 7); g.stroke(); }
  });
}
function frostTex() {
  const R = mulberry(77);
  return canvasTex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(235,248,255,.95)"; g.lineCap = "round";
    const arm = (x, y, a, L, d) => { if (d > 3 || L < 6) return; const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L; g.lineWidth = 4 - d; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      for (let s = 1; s < 4; s++) { const f = s / 4, bx = x + (x2 - x) * f, by = y + (y2 - y) * f; arm(bx, by, a + 0.9, L * 0.35, d + 1); arm(bx, by, a - 0.9, L * 0.35, d + 1); } };
    for (let k = 0; k < 14; k++) { const a = (k / 14) * 6.28 + R() * 0.2, r0 = 40; arm(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0, a, 120 + R() * 70, 0); }
  });
}
const mix3 = (a, b, f) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(f)).getHexString();

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x120d0a, fog: 0.03, exp: 0.9, bloom: [0.7, 0.5, 0.86] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.9;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const grade = gradePass({ shadow: [0.55, 0.3, 0.15], high: [1.06, 1.0, 0.9], sat: 1.1, con: 1.08, flashColor: [1, 0.96, 0.88] });
  comp.addPass(grade);
  stripEnv(r, scene, [[6, 6, 0xbfd8ff, 1.6, 0, 2, -6], [8, 2, 0xffd9a0, 0.8, 4, 6, 6]], 0x150f0b, 0.3);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

  scene.add(new THREE.HemisphereLight(0xffe8cc, 0x1a120c, 0.35));
  const key = new THREE.DirectionalLight(0xffe2b8, 1.6); key.position.set(5, 6, 9); scene.add(key);
  const sunL = new THREE.SpotLight(0xcfe4ff, 60, 30, 0.5, 0.6, 1.5); sunL.position.set(0, 1.5, -5); sunL.target.position.set(0, FLOOR, 4); sunL.castShadow = true; scene.add(sunL, sunL.target);

  // sky outside: altitude gradient + sun + cloud deck below
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshBasicMaterial({ map: canvasTex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0d1d4a"); gr.addColorStop(0.55, "#3f6fc0"); gr.addColorStop(0.8, "#a9cdf2"); gr.addColorStop(1, "#f6efe2"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), toneMapped: false, fog: false }));
  sky.position.set(0, 0, -22); scene.add(sky);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), new THREE.MeshBasicMaterial({ color: "#fff6e0", toneMapped: false, fog: false })); sun.position.set(3, 4, -21.5); scene.add(sun);
  const RC = mulberry(12);
  for (let i = 0; i < 9; i++) { const cl = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85, toneMapped: false, fog: false })); cl.scale.set(3 + RC() * 4, 0.6 + RC() * 0.5, 1); cl.position.set(-14 + i * 3.6, -6.5 - RC() * 1.5, -20 + RC()); scene.add(cl); }

  // stone wall with the window opening + lead frame
  const wallS = new THREE.Shape(); wallS.moveTo(-9, FLOOR); wallS.lineTo(9, FLOOR); wallS.lineTo(9, 6); wallS.lineTo(-9, 6); wallS.closePath();
  const hp = rrShape(W + 0.2, H + 0.2, RR + 0.1); wallS.holes.push(new THREE.Path(hp.getPoints(48)));
  const stoneTex = canvasTex(512, 512, (g, w, h) => { const R = mulberry(8); g.fillStyle = C.stone; g.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) for (let c = 0; c < 5; c++) { const x = c * 110 + (row % 2) * 55 - 30, y = row * 64; g.fillStyle = `rgba(${R() < 0.5 ? "0,0,0" : "255,240,220"},${0.04 + R() * 0.08})`; g.fillRect(x + 3, y + 3, 104, 58); }
    g.strokeStyle = "rgba(40,30,22,.55)"; g.lineWidth = 4; for (let row = 0; row <= 8; row++) { g.beginPath(); g.moveTo(0, row * 64); g.lineTo(w, row * 64); g.stroke(); for (let c = 0; c < 6; c++) { const x = c * 110 + (row % 2) * 55 - 30; g.beginPath(); g.moveTo(x, row * 64); g.lineTo(x, row * 64 + 64); g.stroke(); } } }, [3, 3]);
  const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(wallS, { depth: 0.6, bevelEnabled: false, curveSegments: 32 }), new THREE.MeshStandardMaterial({ map: stoneTex, color: "#c9b59c", roughness: 0.92 }));
  // planar UVs from extrude are in world units; the texture repeats via its own repeat
  wall.position.z = -0.3; wall.receiveShadow = true; scene.add(wall);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const s = rrShape(W + 0.34, H + 0.34, RR + 0.17); s.holes.push(new THREE.Path(rrShape(W - 0.02, H - 0.02, RR - 0.01).getPoints(48))); return s; })(), { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, curveSegments: 32 }),
    new THREE.MeshStandardMaterial({ color: C.lead, roughness: 0.4, metalness: 0.7 }));
  frame.position.z = 0.3; scene.add(frame);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshStandardMaterial({ map: stoneTex, color: "#9c8a74", roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR, 8); floor.receiveShadow = true; scene.add(floor);
  for (const x of [-4.2, 4.2]) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 8.4, 24), new THREE.MeshStandardMaterial({ map: stoneTex, color: "#b9a68c", roughness: 0.9 })); col.position.set(x, FLOOR + 4.2, 0.6); col.castShadow = true; scene.add(col); }
  const plaque = new THREE.Group(); plaque.position.set(0, -2.05, 0.31); scene.add(plaque);
  const plB = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.06), new THREE.MeshStandardMaterial({ color: C.brass, roughness: 0.3, metalness: 0.95 })); plaque.add(plB);
  const plT = textPlane(880, 200, [["AUDIRA", `700 96px ${SERIF}`, "#2a1c0c", 0.42], ["CARA KERJA BENDA", `700 44px ${SERIF}`, "#2a1c0c", 0.8]], 2.0); plT.position.z = 0.035; plaque.add(plT);

  // the three panes
  const pg = paneGeo();
  const mkPane = (tex, op) => { const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op, side: THREE.DoubleSide, toneMapped: false, depthWrite: false })); const G = new THREE.Group(); G.add(m); scene.add(G); return { G, m }; };
  const outer = mkPane(leadTex(31, (u, v) => mix3(C.sapph, "#7fb8e8", v * 0.9 + 0.1 * Math.sin(u * 9))), 0.88);
  const middle = mkPane(leadTex(32, (u, v) => { const d = Math.hypot(u - 0.5, v - 0.62); return d < 0.18 ? "#ffd46a" : d < 0.32 ? C.gold : mix3("#c46a1e", C.emer, v * 0.4); }, { hole: true }), 0.8);
  const inner = mkPane(leadTex(33, (u, v) => mix3("#d9667f", "#7a3d8f", v + 0.2 * Math.sin(u * 7))), 0.62);
  const crack = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); crack.position.z = 0.01; outer.G.add(crack);
  const frost = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: frostTex(), transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); frost.position.set(HOLE[0], HOLE[1], 0.012); middle.G.add(frost);
  const holeRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 24), new THREE.MeshStandardMaterial({ color: C.lead, roughness: 0.4, metalness: 0.8 })); holeRing.position.set(HOLE[0], HOLE[1], 0.01); middle.G.add(holeRing);
  const holeGlow = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false })); holeGlow.position.set(HOLE[0], HOLE[1], 0.014); middle.G.add(holeGlow);
  const tag = textPlane(640, 150, [["breather hole", `italic 700 76px ${SERIF}`, C.parch, 0.5]], 1.25, { bg: "rgba(26,27,30,.82)", border: C.gold }); tag.position.set(0.95, HOLE[1] - 0.15, 0.06); middle.G.add(tag);
  // layer labels (exploded view)
  const lab = (txt) => { const p = textPlane(512, 110, [[txt, `700 52px ${SERIF}`, C.parch, 0.5]], 1.5, { bg: "rgba(26,27,30,.85)", border: C.gold }); scene.add(p); return p; };
  const labO = lab("LUAR"), labM = lab("TENGAH"), labI = lab("DALAM");
  // force arrows
  const arrowM = new THREE.MeshStandardMaterial({ color: C.gold, emissive: new THREE.Color(C.gold), emissiveIntensity: 0.6, roughness: 0.4, metalness: 0.5 });
  const mkArrows = () => { const G = new THREE.Group(); scene.add(G); for (const [x, y] of [[-0.6, 0.8], [0.6, 0.8], [-0.6, -0.4], [0.6, -0.4], [0, 0.2]]) { const a = new THREE.Group(); a.position.set(x, y, 0); G.add(a);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.6, 10), arrowM); sh.rotation.x = Math.PI / 2; sh.position.z = 0.42; a.add(sh);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 14), arrowM); hd.rotation.x = -Math.PI / 2; hd.position.z = 0.06; a.add(hd); } return G; };
  const arrO = mkArrows(), arrM = mkArrows();
  // light pool on the floor + four tinted shafts
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.6), new THREE.MeshBasicMaterial({ map: leadTex(34, (u, v) => mix3(C.gold, C.sapph, v)), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0.3, FLOOR + 0.01, 4.2); scene.add(pool);
  const shafts = [C.gold, C.sapph, "#d9667f", C.emer].map((c, i) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 7.2), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    s.position.set(-0.75 + i * 0.5, -0.7, 2.4); s.rotation.set(-0.95, 0, 0.05 * (i - 1.5)); scene.add(s); return s; });
  const dust = pts(scene, 120, { color: 0xffe6b8, size: 0.05, opacity: 0.8 });
  // air particles
  const cab = pts(scene, 180, { color: 0xffc35a, size: 0.09 }), gap = pts(scene, 70, { color: 0xffc35a, size: 0.09 }), outA = pts(scene, 26, { color: 0x8fc4ff, size: 0.09 });
  const leak = pts(scene, 24, { color: 0xffc35a, size: 0.08 }), mist = pts(scene, 70, { color: 0xdff4ff, size: 0.14, add: false, opacity: 0.8 });
  const R0 = mulberry(5), sd = Array.from({ length: 600 }, () => R0());
  // passenger + seat (s8)
  const SEAT = new THREE.Group(); scene.add(SEAT);
  const seatM = new THREE.MeshStandardMaterial({ color: "#5a1f2a", roughness: 0.7 });
  const cush = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 1.2), seatM); cush.position.y = 0.75; SEAT.add(cush);
  const bk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.0, 1.2), seatM); bk.position.set(0.65, 1.7, 0); SEAT.add(bk);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), new THREE.MeshStandardMaterial({ color: "#2b2b30", roughness: 0.5, metalness: 0.5 })); leg.position.y = 0.3; SEAT.add(leg);
  const P = person({ skin: "#c99a78", top: "#2f5d7c", bottom: "#33302c", hair: "#2a1c14" }); P.G.position.set(0.15, 0.08, 0); P.G.rotation.y = -Math.PI / 2; SEAT.add(P.G);
  SEAT.scale.setScalar(1.15); SEAT.position.set(2.6, FLOOR, 1.6); SEAT.rotation.y = 0.35;

  // pane placements: seated in the wall, or exploded into the cabin
  const seated = { o: [0, 0, -0.2], m: [0, 0, 0], i: [0, 0, 0.22] }, exploded = { o: [0, 0, 2.0], m: [0, 0, 3.0], i: [0, 0, 4.1] };
  const lerp3 = (a, b, f) => a.map((v, j) => v + (b[j] - v) * f);

  const k = (t, p, l) => [t, ...p, ...l];
  const CAM = track([
    k(0, [0.9, -0.15, 6.2], [0, -0.35, 0]),
    k(A("s1:aman"), [0.6, -0.4, 5.2], [0, -0.5, 0]),
    k(A("s2:bawah"), [0.35, -0.9, 3.2], [0, -1.2, 0]),
    k(A("s2:kecil"), [0.25, -1.1, 1.75], [0, -1.3, 0]),
    k(A("s2:napas"), [0.45, -1.05, 1.9], [0.25, -1.3, 0]),
    k(K.s2e, [1.2, -0.6, 4.6], [0, -0.4, 0]),
    k(A("s3:tiga"), [5.6, 1.0, 9.0], [0, 0, 3.0]),
    k(A("s3:dalam"), [4.0, 0.5, 8.0], [0, 0, 3.6]),
    k(K.s3e, [5.0, 1.4, 9.6], [0, 0, 2.8]),
    k(A("s4:tipis"), [6.4, 2.0, 7.5], [0, 0, 1.6]),
    k(A("s4:kabin"), [5.4, 1.6, 10.6], [0, 0, 3.8]),
    k(A("s4:Selisih"), [5.6, 1.2, 8.0], [0, 0, 2.4]),
    k(K.s4e, [5.8, 1.3, 8.4], [0, 0, 2.4]),
    k(A("s5:tengah"), [2.4, -0.6, 5.6], [0, -1.2, 2.9]),
    k(A("s5:sama"), [5.4, 0.6, 7.8], [0, 0, 2.5]),
    k(A("s5:Akibatnya"), [4.6, 0.6, 6.4], [0, 0, 2.2]),
    k(K.s5e, [4.8, 0.8, 6.8], [0, 0, 2.3]),
    k(A("s6:gagal"), [3.8, 0.5, 5.4], [0, 0, 2.1]),
    k(A("s6:alih"), [4.4, 0.6, 6.6], [0, 0, 2.6]),
    k(A("s6:bocor"), [2.6, -0.7, 5.0], [0, -1.1, 2.5]),
    k(K.s6e, [5.0, 1.0, 8.0], [0, 0, 2.6]),
    k(A("s7:uap"), [2.4, -0.4, 5.8], [0, -0.6, 2.6]),
    k(A("s7:bunga"), [1.2, -1.0, 4.7], [0, -1.3, 3.0]),
    k(K.s7e, [1.4, -0.9, 5.0], [0, -1.2, 3.0]),
    k(K.s8 + 0.6, [3.6, -0.3, 7.6], [0.6, -0.8, 0.5]),
    k(A("s8:AUDIRA"), [3.8, 0.1, 10.0], [0.6, -0.9, 0.4]),
    k(K.dur, [4.0, 0.5, 11.4], [0.6, -0.9, 0.4]),
  ]);
  const look = new THREE.Vector3(), v3 = new THREE.Vector3();

  return (t) => {
    const c = CAM(t);
    cam.position.set(c[0] + 0.03 * Math.sin(t * 0.4), c[1] + 0.02 * Math.sin(t * 0.55 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    // explode in s3, seat back in s8
    const ex = ramp(t, K.s3 + 0.2, A("s3:tiga") + 0.3) * (1 - ramp(t, K.s8 - 0.1, K.s8 + 1.1));
    const ee = eout(ex);
    outer.G.position.set(...lerp3(seated.o, exploded.o, ee)); middle.G.position.set(...lerp3(seated.m, exploded.m, ee)); inner.G.position.set(...lerp3(seated.i, exploded.i, ee));
    outer.G.rotation.y = middle.G.rotation.y = inner.G.rotation.y = 0.12 * Math.sin(ee * Math.PI);
    const shine = 0.9 + 0.1 * Math.sin(t * 0.7);
    outer.m.material.color.setScalar(shine); middle.m.material.color.setScalar(shine); inner.m.material.color.setScalar(shine);
    inner.m.material.opacity = 0.62 * (1 - 0.55 * ramp(t, K.s4, K.s4 + 0.6) * (1 - ramp(t, K.s7e, K.s8))) + 0.2 * win(t, A("s3:dalam") - 0.2, A("s3:goresan") + 0.5);
    // labels follow the exploded panes
    const lOn = win(t, A("s3:tiga") - 0.1, K.s3e, 0.3);
    [[labO, outer], [labM, middle], [labI, inner]].forEach(([l, p], i) => { l.position.copy(p.G.position).add(v3.set(0, 2.05, 0)); l.lookAt(cam.position); l.material.opacity = lOn * (i === 2 ? 1 : 0.95) + (i === 2 ? 0.0 : 0); });
    tag.material.opacity = win(t, A("s2:Namanya") - 0.2, K.s2e, 0.3);
    holeGlow.scale.setScalar(1 + 0.25 * Math.sin(t * 4) * win(t, A("s1:lubang") - 0.2, K.s3, 0.4));
    // pressure: outward push on the outer pane, then the middle once the outer fails
    const push = ramp(t, A("s4:Selisih") - 0.2, A("s4:mendorong") + 0.3) * (1 - ramp(t, K.s7, K.s7 + 0.5));
    const fail = ramp(t, A("s6:gagal") - 0.2, A("s6:gagal") + 0.4) * (1 - ramp(t, K.s8 - 0.2, K.s8 + 0.4));
    const eqz = ramp(t, A("s5:sama") - 0.3, A("s5:sama") + 0.4);
    arrO.position.copy(outer.G.position); arrO.position.z += 0.05; arrM.position.copy(middle.G.position); arrM.position.z += 0.05;
    arrO.scale.setScalar(Math.max(0.001, push * (1 - fail))); arrM.scale.setScalar(Math.max(0.001, push * Math.max(1 - eqz, fail)));
    arrO.children.forEach((a, i) => (a.position.z = 0.04 * Math.sin(t * 6 + i))); arrM.children.forEach((a, i) => (a.position.z = 0.04 * Math.sin(t * 6 + i)));
    outer.G.scale.set(1, 1, 1); outer.m.position.z = -0.08 * push * (1 - fail);
    crack.material.opacity = fail; outer.m.material.opacity = 0.88 - 0.35 * fail;
    // frost flowers ring the hole in s7
    const fr = ramp(t, A("s7:bunga") - 0.6, A("s7:bunga") + 1.4) * (1 - ramp(t, K.s8, K.s8 + 0.6));
    frost.material.opacity = fr; frost.scale.setScalar(Math.max(0.001, 0.2 + 0.8 * eout(fr))); frost.rotation.z = 0.05 * t;
    // air: cabin (gold, dense), outside (blue, thin), gap fills through the hole in s5
    const airOn = ramp(t, K.s4 - 0.2, A("s4:udara") + 0.4) * (1 - ramp(t, K.s8 - 0.3, K.s8 + 0.3));
    const zM = middle.G.position.z, zO = outer.G.position.z, zI = inner.G.position.z;
    for (let i = 0; i < 180; i++) { const a = sd[i], b = sd[i + 180], cc = sd[i + 360];
      cab.pos[i * 3] = -1.3 + 2.6 * a + 0.1 * Math.sin(t * 0.9 + i); cab.pos[i * 3 + 1] = -1.7 + 3.4 * b + 0.1 * Math.cos(t * 0.8 + i); cab.pos[i * 3 + 2] = zM + 0.15 + (zI + 2.4 - zM) * cc;
      const v = airOn * (0.6 + 0.4 * Math.sin(t * 2 + i)); cab.col[i * 3] = v; cab.col[i * 3 + 1] = 0.76 * v; cab.col[i * 3 + 2] = 0.35 * v; }
    cab.commit();
    const tIn = A("s5:Udara");
    for (let i = 0; i < 70; i++) { const ti = tIn - 0.2 + (i / 70) * 2.2, p = eout(clamp01((t - ti) / 1.0));
      const tx = -1.0 + 2.0 * sd[i], ty = -1.5 + 3.0 * sd[i + 70], tz = zO + 0.1 + (zM - zO - 0.2) * sd[i + 140];
      gap.pos[i * 3] = HOLE[0] + (tx - HOLE[0]) * p + 0.05 * Math.sin(t + i); gap.pos[i * 3 + 1] = HOLE[1] + (ty - HOLE[1]) * p; gap.pos[i * 3 + 2] = zM + (tz - zM) * p;
      const v = (t > ti ? 1 : 0) * airOn; gap.col[i * 3] = v; gap.col[i * 3 + 1] = 0.76 * v; gap.col[i * 3 + 2] = 0.35 * v; }
    gap.commit();
    for (let i = 0; i < 26; i++) { outA.pos[i * 3] = -1.6 + 3.2 * sd[i + 200] + 0.2 * Math.sin(t * 0.5 + i); outA.pos[i * 3 + 1] = -1.8 + 3.6 * sd[i + 230]; outA.pos[i * 3 + 2] = zO - 0.3 - 1.4 * sd[i + 260];
      const v = airOn * ramp(t, A("s4:luar") - 0.3, A("s4:luar") + 0.3); outA.col[i * 3] = 0.56 * v; outA.col[i * 3 + 1] = 0.77 * v; outA.col[i * 3 + 2] = v; }
    outA.commit();
    const lk = win(t, A("s6:bocor") - 0.4, K.s6e, 0.4);
    for (let i = 0; i < 24; i++) { const u = (t * 0.6 + i / 24) % 1; leak.pos[i * 3] = HOLE[0] + 0.06 * Math.sin(i * 2.1); leak.pos[i * 3 + 1] = HOLE[1] + 0.06 * Math.cos(i * 1.7); leak.pos[i * 3 + 2] = zM - (zM - zO + 0.9) * u;
      const v = lk * (1 - u); leak.col[i * 3] = v; leak.col[i * 3 + 1] = 0.76 * v; leak.col[i * 3 + 2] = 0.35 * v; }
    leak.commit();
    const ms = win(t, A("s7:uap") - 0.4, A("s7:bunga") + 0.6, 0.5);
    for (let i = 0; i < 70; i++) { const u = (t * 0.25 + sd[i + 300]) % 1, toHole = clamp01(u * 1.4);
      const sx0 = -1.0 + 2.0 * sd[i + 400], sy0 = -1.5 + 3.0 * sd[i + 470], sz0 = zO + 0.15 + (zM - zO - 0.3) * sd[i + 540];
      const px = sx0 + (HOLE[0] - sx0) * toHole, py = sy0 + (HOLE[1] - sy0) * toHole, pz = sz0 + (zM - sz0) * toHole + Math.max(0, u - 0.72) * 3.0;
      mist.pos[i * 3] = px; mist.pos[i * 3 + 1] = py; mist.pos[i * 3 + 2] = pz; const v = ms * (u < 0.95 ? 1 : 0); mist.col[i * 3] = 0.87 * v; mist.col[i * 3 + 1] = 0.96 * v; mist.col[i * 3 + 2] = v; }
    mist.commit();
    // light pool + shafts + dust
    const glow = 0.85 + 0.15 * Math.sin(t * 0.6);
    pool.material.opacity = 0.42 * glow * (1 - 0.6 * ex); shafts.forEach((s, i) => (s.material.opacity = (0.07 + 0.02 * Math.sin(t * 0.8 + i)) * (1 - 0.7 * ex)));
    for (let i = 0; i < 120; i++) { dust.pos[i * 3] = -1.5 + 3 * sd[i] + 0.2 * Math.sin(t * 0.3 + i); dust.pos[i * 3 + 1] = FLOOR + 0.2 + 4.5 * ((sd[i + 120] + t * 0.02) % 1); dust.pos[i * 3 + 2] = 0.6 + 4 * sd[i + 240];
      const v = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2); dust.col[i * 3] = v; dust.col[i * 3 + 1] = 0.9 * v; dust.col[i * 3 + 2] = 0.72 * v; }
    dust.commit();
    // passenger slides in for s8, looks toward the hole
    const sIn = eout(ramp(t, K.s8 - 0.2, K.s8 + 1.0));
    SEAT.visible = t > K.s8 - 0.3; SEAT.position.x = 2.6 + 3.5 * (1 - sIn);
    pose(P, { hL: -1.5, hR: -1.45, kL: 1.5, kR: 1.45, aL: -0.4, aR: -0.6 * ramp(t, A("s8:cari") - 0.3, A("s8:cari") + 0.3) - 0.3, eL: 1.0, eR: 1.1, hy: -0.5, hx: 0.12 });
    P.G.position.y = 0.08 + 0.45 - 0.45; P.torso.position.y = 0.95 - 0.33;
    bp.strength = 0.7;
    grade.uniforms.flash.value = 0.35 * flashAt(t, [A("s6:gagal")], 0.18);
    comp.render();
  };
}
