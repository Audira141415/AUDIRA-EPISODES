// EP33 JALUR PENYELAMAT REM BLONG (INNERWORKS): a technical cutaway world on a dark studio floor with a cyan grid.
// Four stations, joined by short moves inside a station and hard cuts (with a flash) between stations:
//   ROAD  x=0    machined diorama of a downhill toll road: gantry sign (AUDIRA), a gravel escape ramp branching right and
//                climbing, a sharp curve at the bottom, a generic truck that drives in and sinks into the gravel, a route
//                board with three pins (Cipularang), a "do not stop" sign in s8
//   BRAKE x=40   drum brake cutaway (open drum, shoes, linings, wheel cylinder, fluid line); drum heats from steel to
//                orange, fluid boils (bubbles), HEAT bar up, FRICTION bar down, "REM BLONG" stamp
//   TANK  x=80   glass section tank of round gravel: a big tyre rolls in, sinks, pushes/compacts/shifts pebbles while
//                an energy meter drains; tank tilts uphill, gravity arrow, water drains through; a sand tank beside it
//                where a small wheel stops too abruptly
//   CHART x=120  25 gravel slabs vs one asphalt slab, then a stopping track (80 km/jam to about 100 m)
// Motion memory INNERWORKS: teal-orange grade, exposure 1.0, environmentIntensity 0.55, studio env for metal,
// machined cut faces, cutaways stand on a floor (never a black void). Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const P = {
  dark: 0x090d16, floor: 0x0e1522, cyan: 0x00e5ff, brass: 0xd4af37, steel: 0x334155, shaft: 0x94a3b8, amber: 0xf59e0b,
  red: 0xef4444, asphalt: 0x23272e, gravel: 0xc9a77a, sand: 0xe0bf7a, truck: 0xdfe7ef, truckAcc: 0x0e7f96, rubber: 0x15171c,
};
const FONT = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Teal-orange cinema grade: cool shadows, warm highlights, gentle contrast, white flash on station cuts.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(0.9,1.02,1.1),(1.0-l)*0.55);c=mix(c,c*vec3(1.08,1.0,0.88),l*0.5);
  c=(c-0.5)*1.07+0.5;c=mix(vec3(l),c,1.06);c=mix(c,vec3(0.85,0.97,1.0),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- helpers ----------
const std = (color, rough = 0.5, metal = 0, x = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...x });
const steelM = (c = P.shaft, r = 0.32) => std(c, r, 0.85);
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const bx = (w, h, d, mat, parent, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
// text plate: lines = [[text, font, color], ...]
function tag(lines, { w = 512, h = 160, size = 2, bg = "rgba(9,13,22,.86)", border = "#00e5ff", glow = false } = {}) {
  const tex = canvasTex(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    if (border) { g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }
    const n = lines.length;
    lines.forEach(([s, f, c], i) => { g.font = f; g.fillStyle = c; g.textAlign = "center"; g.textBaseline = "middle"; if (glow) { g.shadowColor = c; g.shadowBlur = 18; } g.fillText(s, w / 2, (h * (i + 0.5)) / n + 4); });
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, (size * h) / w), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = 3;
  return m;
}
function arrow(color, len = 1, r = 0.07) {
  const g = new THREE.Group(), mat = std(color, 0.4, 0.1, { emissive: new THREE.Color(color), emissiveIntensity: 0.7 });
  mesh(new THREE.CylinderGeometry(r, r, len * 0.7, 12), mat, g, 0, len * 0.35, 0);
  mesh(new THREE.ConeGeometry(r * 2.4, len * 0.3, 16), mat, g, 0, len * 0.85, 0);
  return g;
}
const pop = (t, a, d = 0.4) => Math.max(0.0001, back(clamp01((t - a) / d), 1.6));
function pebbleTex(seed, base, dark) {
  const R = mulberry(seed);
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = R() < 0.5 ? dark : "rgba(255,240,210,.35)"; g.beginPath(); g.ellipse(R() * w, R() * h, 3 + R() * 9, 3 + R() * 7, R() * 3, 0, 7); g.fill(); } }, [2, 2]);
}

// generic truck: faces +z, ground at y=0
function makeTruck(parent, s = 1) {
  const G = new THREE.Group(); G.rotation.order = "YXZ"; G.scale.setScalar(s); parent.add(G);
  const body = steelM(P.truck, 0.38), acc = std(P.truckAcc, 0.35, 0.5), dk = std(0x1a1f27, 0.6, 0.3);
  bx(0.9, 0.16, 3.2, dk, G, 0, 0.36, -0.1);
  const cab = bx(1.0, 0.95, 0.85, body, G, 0, 0.88, 1.12);
  bx(1.02, 0.12, 0.87, acc, G, 0, 0.5, 1.12);
  const ws = mesh(new THREE.PlaneGeometry(0.86, 0.42), std(0x0b1622, 0.08, 0.9, { emissive: new THREE.Color(0x0a4a5a), emissiveIntensity: 0.4 }), G, 0, 1.08, 1.555);
  ws.castShadow = false; cab.castShadow = true;
  for (const x of [-0.36, 0.36]) mesh(new THREE.BoxGeometry(0.16, 0.08, 0.02), new THREE.MeshBasicMaterial({ color: 0xfff3c4, toneMapped: false }), G, x, 0.6, 1.56);
  bx(1.06, 1.12, 2.15, std(0xc9d3dd, 0.45, 0.4), G, 0, 1.02, -0.5);
  bx(1.07, 0.1, 2.16, acc, G, 0, 0.5, -0.5);
  const wheels = [];
  const wg = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 24); wg.rotateZ(Math.PI / 2);
  const hg = new THREE.CylinderGeometry(0.12, 0.12, 0.21, 6); hg.rotateZ(Math.PI / 2);
  for (const z of [1.15, -0.55, -1.2]) for (const x of [-0.5, 0.5]) {
    const w = mesh(wg, std(P.rubber, 0.85), G, x, 0.25, z); mesh(hg, steelM(P.shaft, 0.25), w, 0, 0, 0); wheels.push(w);
  }
  return { G, wheels };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: P.dark, fog: 0.012, exp: 1.0, bloom: [0.32, 0.5, 0.86] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  try {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x1a2230);
    for (const [w, h, c, i, x, y, z] of [[8, 3, 0xffffff, 2.2, -3, 5, 4], [5, 5, 0xbfefff, 1.0, 5, 2, 2], [10, 2, 0xffc890, 0.7, 0, -3, -2], [3, 6, 0xffffff, 1.4, -6, 1, -3]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  } catch (e) { /* no GL (test harness) */ }
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };

  scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x2a1d12, 0.9));
  const key = new THREE.DirectionalLight(0xfff1de, 3.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 80 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x5fe8ff, 2.4); scene.add(rim, rim.target);
  const warm = new THREE.DirectionalLight(0xffb070, 1.0); scene.add(warm, warm.target);

  // studio floor with cyan grid
  const grid = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#0d1420"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,229,255,.22)"; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.strokeStyle = "rgba(0,229,255,.08)"; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); }, [120, 60]);
  const floor = mesh(new THREE.PlaneGeometry(480, 240), std(0xffffff, 0.55, 0.3, { map: grid }), scene, 60, -0.62, 0); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const plinthM = std(0x1b2433, 0.4, 0.7), trimM = std(P.brass, 0.3, 0.9);

  // ================= ROAD =================
  const RD = new THREE.Group(); scene.add(RD);
  bx(12, 0.6, 26, plinthM, RD, 0, -0.32, -3);
  bx(12.06, 0.06, 26.06, trimM, RD, 0, -0.03, -3);
  {
    const pl = tag([["AUDIRA · CARA KERJA BENDA", `900 54px ${FONT}`, "#d4af37"]], { w: 1024, h: 110, size: 5.4, bg: "rgba(9,13,22,.95)", border: "#d4af37" });
    pl.position.set(0, -0.32, 10.02); RD.add(pl);
  }
  const hR = (z) => 0.1 * (z + 12);
  const asphalt = std(P.asphalt, 0.82, 0.05);
  // embankment wedge under the road
  {
    const sh = new THREE.Shape(); sh.moveTo(-8.5, 0); sh.lineTo(12, 0); sh.lineTo(-8.5, 2.05); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 3.6, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(-1.8, 0, 0);
    mesh(g, std(0x3a3328, 0.95), RD, 0, 0, 0);
  }
  const ang = Math.atan2(2, 20), L = Math.hypot(20, 2);
  const road = new THREE.Group(); road.position.set(0, hR(-2), -2); road.rotation.x = -ang; RD.add(road);
  bx(3, 0.2, L, asphalt, road, 0, -0.1, 0);
  for (let i = 0; i < 9; i++) bx(0.08, 0.01, 0.9, std(0xf2f2f2, 0.5, 0, { emissive: new THREE.Color(0x444444) }), road, 0, 0.005, -L / 2 + 1 + i * 2.2);
  for (const x of [-1.42, 1.42]) bx(0.05, 0.01, L, std(0xf2f2f2, 0.5), road, x, 0.005, 0);
  for (const x of [-1.62]) { bx(0.06, 0.32, L, steelM(0xb8c4d0, 0.3), road, x, 0.3, 0); for (let i = 0; i < 12; i++) bx(0.07, 0.36, 0.07, steelM(), road, x, 0.16, -L / 2 + 0.8 + i * 1.7); }
  // sharp curve at the bottom + chevron sign
  const bend = new THREE.Group(); bend.position.set(-1.4, 0, -13.6); bend.rotation.y = 0.75; RD.add(bend);
  bx(3, 0.2, 4.2, asphalt, bend, 0, -0.1, 0);
  const chev = tag([["<<<", `900 120px ${FONT}`, "#f59e0b"]], { w: 512, h: 200, size: 1.6, bg: "rgba(20,14,6,.95)", border: "#f59e0b" });
  chev.position.set(1.0, 1.0, -12.2); RD.add(chev);
  bx(0.06, 0.8, 0.06, steelM(), RD, 1.0, 0.4, -12.25);
  // hills (low poly)
  { const R = mulberry(33); for (let i = 0; i < 9; i++) { const c = mesh(new THREE.ConeGeometry(1.4 + R() * 1.6, 2 + R() * 3, 6), std(i % 2 ? 0x24332f : 0x2c3d36, 0.95), RD, -4.2 - R() * 1.4, 0.8 + R(), 8 - i * 2.6); c.rotation.y = R() * 3; } }
  // gantry sign with the brand
  {
    const g = new THREE.Group(); g.position.set(0, hR(4.5), 4.5); RD.add(g);
    for (const x of [-1.9, 1.9]) bx(0.12, 2.6, 0.12, steelM(), g, x, 1.3, 0);
    bx(4.0, 0.12, 0.12, steelM(), g, 0, 2.5, 0);
    const s = tag([["AUDIRA", `900 64px ${FONT}`, "#ffffff"], ["JALUR PENYELAMAT  →", `900 52px ${FONT}`, "#ffffff"]], { w: 768, h: 230, size: 2.6, bg: "rgba(8,96,60,.97)", border: "#ffffff" });
    s.position.set(0.4, 2.0, -0.08); s.rotation.y = Math.PI; g.add(s);
    const s2 = s.clone(); s2.rotation.y = 0; s2.position.z = 0.08; g.add(s2);
  }
  // escape ramp: branches right at z=-2 and climbs
  const ER = new THREE.Group(); RD.add(ER);
  ER.position.set(1.5, hR(-2), -2);
  const rampEnd = new THREE.Vector3(5.2, 1.85, -11.0);
  RD.updateMatrixWorld(true);
  ER.lookAt(rampEnd); ER.updateMatrixWorld(true);
  const Lr = ER.position.distanceTo(rampEnd);
  bx(2.7, 0.55, Lr, std(0x5a4a36, 0.9), ER, 0, -0.27, Lr / 2);
  for (const x of [-1.42, 1.42]) bx(0.14, 0.24, Lr, std(P.amber, 0.45, 0.2), ER, x, 0.06, Lr / 2);
  { const st = canvasTex(256, 64, (g, w, h) => { g.fillStyle = "#111"; g.fillRect(0, 0, w, h); g.fillStyle = "#f5b20b"; for (let i = -2; i < 10; i++) { g.beginPath(); g.moveTo(i * 32, h); g.lineTo(i * 32 + 16, h); g.lineTo(i * 32 + 48, 0); g.lineTo(i * 32 + 32, 0); g.fill(); } }, [8, 1]);
    for (const x of [-1.5, 1.5]) { const s = mesh(new THREE.PlaneGeometry(Lr, 0.22), std(0xffffff, 0.5, 0, { map: st }), ER, x, 0.06, Lr / 2); s.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2; } }
  // machined section face on the outer side showing the thick loose layer
  {
    const sec = canvasTex(1024, 128, (g, w, h) => { const R = mulberry(4); g.fillStyle = "#3d3428"; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = ["#c9a77a", "#a98a62", "#e0c79c"][i % 3]; g.beginPath(); g.ellipse(R() * w, 8 + R() * (h - 26), 4 + R() * 5, 3 + R() * 4, 0, 0, 7); g.fill(); } g.fillStyle = "#94a3b8"; g.fillRect(0, h - 14, w, 14); });
    const f = mesh(new THREE.PlaneGeometry(Lr, 0.52), std(0xffffff, 0.6, 0.1, { map: sec }), ER, 1.352, -0.27, Lr / 2); f.rotation.y = Math.PI / 2;
  }
  // impact drums at the end
  for (let i = 0; i < 4; i++) { const d = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 20), std(P.amber, 0.4, 0.1), ER, -0.9 + i * 0.6, 0.3, Lr - 0.3); bx(0.5, 0.06, 0.5, std(0x111111, 0.5), d, 0, 0.12, 0); }
  // ramp outline glow (s4)
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.9, 0.62, Lr + 0.1)), new THREE.LineBasicMaterial({ color: P.cyan, transparent: true, opacity: 0, toneMapped: false }));
  outline.position.set(0, -0.2, Lr / 2); ER.add(outline);
  // gravel pebbles (instanced, ruts follow the truck)
  const RG = [];
  {
    const R = mulberry(77);
    for (let z = 0.35; z < Lr - 0.75; z += 0.17) for (let x = -1.2; x <= 1.2; x += 0.17) RG.push([x + (R() - 0.5) * 0.08, 0.07 + R() * 0.05, z + (R() - 0.5) * 0.08, 0.075 + R() * 0.035, R()]);
  }
  const gGeo = new THREE.IcosahedronGeometry(1, 1);
  const gRamp = new THREE.InstancedMesh(gGeo, std(0xffffff, 0.7, 0.05), RG.length); gRamp.frustumCulled = false; gRamp.castShadow = gRamp.receiveShadow = true; ER.add(gRamp);
  const gc = new THREE.Color(); const GCOL = [0xc9a77a, 0xb39268, 0xe0c79c, 0x9c8160];
  RG.forEach((p, i) => gRamp.setColorAt(i, gc.set(GCOL[Math.floor(p[4] * 4)])));
  // route board (s2)
  const board = new THREE.Group(); board.position.set(0, 4.2, -17.6); RD.add(board);
  {
    const W = 8.4, H = 4.6;
    const tx = canvasTex(1024, 560, (g, w, h) => {
      g.fillStyle = "#0b1220"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(0,229,255,.12)"; g.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.strokeStyle = "#00e5ff"; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      g.font = `900 42px ${FONT}`; g.fillStyle = "#e6faff"; g.textAlign = "left"; g.fillText("TOL CIPULARANG", 40, 70);
      g.font = `700 30px ${MONO}`; g.fillStyle = "#00e5ff"; g.fillText("ARAH JAKARTA  →", 40, 112);
      g.strokeStyle = "#cfd8e3"; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(60, 200); g.bezierCurveTo(380, 230, 520, 420, 980, 480); g.stroke();
      g.strokeStyle = "#23272e"; g.lineWidth = 8; g.setLineDash([18, 16]); g.stroke(); g.setLineDash([]);
    });
    bx(W + 0.3, H + 0.3, 0.2, plinthM, board, 0, 0, -0.12);
    mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }), board, 0, 0, 0.0).castShadow = false;
    for (const x of [-3, 3]) bx(0.16, 4.4, 0.16, steelM(), board, x, -4.2, -0.2);
  }
  const pinM = [], pinPos = [[-1.2, -0.2], [0.8, -1.05], [2.4, -1.5]];
  pinPos.forEach(([x, y]) => { const m = std(P.cyan, 0.3, 0.2, { emissive: new THREE.Color(P.cyan), emissiveIntensity: 0.1 }); pinM.push(m); const g = new THREE.Group(); g.position.set(x, y + 0.35, 0.1); board.add(g); mesh(new THREE.SphereGeometry(0.2, 20, 14), m, g, 0, 0.2, 0); mesh(new THREE.ConeGeometry(0.12, 0.35, 12), m, g, 0, -0.08, 0).rotation.x = Math.PI; });
  // "do not stop" sign at the ramp mouth (s8)
  const noStop = new THREE.Group(); { const p = ER.localToWorld(new THREE.Vector3(-1.85, 0, 1.6)); RD.worldToLocal(p); noStop.position.copy(p); RD.add(noStop);
    bx(0.08, 1.5, 0.08, steelM(), noStop, 0, 0.75, 0);
    const s = tag([["JANGAN", `900 70px ${FONT}`, "#ffffff"], ["BERHENTI", `900 70px ${FONT}`, "#ffffff"]], { w: 512, h: 300, size: 1.5, bg: "rgba(200,30,30,.97)", border: "#ffffff" });
    s.position.set(0, 1.75, 0.05); noStop.add(s); const s2 = s.clone(); s2.rotation.y = Math.PI; s2.position.z = -0.05; noStop.add(s2); }
  // truck + its path (road, branch, into the gravel)
  const T1 = makeTruck(RD, 1);
  const rampPt = (z, y = 0.1) => { const v = ER.localToWorld(new THREE.Vector3(0, y, z)); return RD.worldToLocal(v); };
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0, hR(9), 9), new THREE.Vector3(0, hR(4), 4), new THREE.Vector3(0.25, hR(0.5), 0.5), rampPt(0.8), rampPt(3.2), rampPt(6.0)], false, "catmullrom", 0.5);
  const pathLen = path.getLength();
  const _p = new THREE.Vector3(), _q = new THREE.Vector3(), _l = new THREE.Vector3();
  const truckOnPath = (u, sinkExtra) => {
    path.getPointAt(Math.min(0.999, u), _p); path.getPointAt(Math.min(1, u + 0.001), _q);
    const d = _q.sub(_p).normalize();
    _l.copy(_p); RD.localToWorld(_l); ER.worldToLocal(_l);
    const onR = clamp01((_l.z - 0.2) / 1.6) * (Math.abs(_l.x) < 1.6 ? 1 : 0);
    T1.G.position.set(_p.x, _p.y - (0.13 + sinkExtra) * onR, _p.z);
    T1.G.rotation.y = Math.atan2(d.x, d.z); T1.G.rotation.x = -Math.atan2(d.y, Math.hypot(d.x, d.z)) - 0.035 * onR;
    T1.wheels.forEach((w) => (w.rotation.x = (u * pathLen) / 0.25));
    return { lz: _l.z, lx: _l.x, onR };
  };
  // gravel spray particles (pebble chips)
  const spray = pts(scene, 90, { color: 0xd8bd92, size: 0.12, add: false, opacity: 0.95 });

  // ================= BRAKE =================
  const BR = new THREE.Group(); BR.position.x = 40; scene.add(BR);
  mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.5, 64), plinthM, BR, 0, -0.37, 0);
  mesh(new THREE.TorusGeometry(3.42, 0.03, 8, 96), new THREE.MeshBasicMaterial({ color: P.cyan, toneMapped: false }), BR, 0, -0.11, 0).rotation.x = Math.PI / 2;
  const slope = new THREE.Group(); slope.position.set(0, 0.9, -2.6); slope.rotation.z = -0.2; BR.add(slope);
  bx(11, 0.24, 2.4, asphalt, slope, 0, 0, 0);
  for (let i = 0; i < 6; i++) bx(0.7, 0.01, 0.08, std(0xeeeeee, 0.5), slope, -4.5 + i * 1.8, 0.125, 0);
  const chevs = []; for (let i = 0; i < 4; i++) { const a = arrow(P.cyan, 0.7, 0.05); a.rotation.z = -Math.PI / 2; slope.add(a); chevs.push(a); }
  const turunTag = tag([["TURUNAN PANJANG", `900 54px ${FONT}`, "#e6faff"]], { w: 768, h: 110, size: 2.6 }); turunTag.position.set(-1.6, 1.0, 0.3); slope.add(turunTag);
  const WG = new THREE.Group(); WG.position.set(0, 2.25, 0); BR.add(WG);
  const SPIN = new THREE.Group(); WG.add(SPIN);
  mesh(new THREE.TorusGeometry(0.95, 0.31, 22, 64), std(P.rubber, 0.88), SPIN);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const tr = bx(0.1, 0.06, 0.5, std(0x22252b, 0.9), SPIN, Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0); tr.rotation.z = a; }
  mesh(new THREE.TorusGeometry(0.67, 0.05, 12, 64), steelM(0xc7d2de, 0.22), SPIN);
  const drumM = std(0x6b7787, 0.35, 0.85, { emissive: new THREE.Color(0xff4a12), emissiveIntensity: 0, side: THREE.DoubleSide });
  const dg = new THREE.CylinderGeometry(0.62, 0.62, 0.46, 64, 1, true); dg.rotateX(Math.PI / 2); mesh(dg, drumM, SPIN);
  const lip = mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 64), steelM(0xe2e8f0, 0.15), SPIN, 0, 0, 0.23);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), trimM, lip, Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0).rotation.x = Math.PI / 2; }
  // x-ray ghost of the removed front face
  const ghost = mesh(new THREE.CircleGeometry(0.62, 64), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0.07, depthWrite: false, toneMapped: false }), WG, 0, 0, 0.3); ghost.castShadow = false;
  mesh(new THREE.TorusGeometry(0.62, 0.008, 6, 96), new THREE.MeshBasicMaterial({ color: P.cyan, toneMapped: false }), WG, 0, 0, 0.3);
  mesh(new THREE.CircleGeometry(0.6, 64), std(0x252d3a, 0.5, 0.7), WG, 0, 0, -0.2);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20), steelM(0xd0d8e2, 0.2), WG, 0, 0, 0).rotation.x = Math.PI / 2;
  const SH = new THREE.Group(); WG.add(SH);
  const liningM = std(0x6a4630, 0.92, 0, { emissive: new THREE.Color(0xff6a1a), emissiveIntensity: 0 });
  for (const rz of [Math.PI * 0.14, Math.PI * 1.14]) {
    const sh = mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 32, Math.PI * 0.72), steelM(0xaab6c4, 0.3), SH); sh.rotation.z = rz;
    const ln = mesh(new THREE.TorusGeometry(0.56, 0.032, 8, 32, Math.PI * 0.68), liningM, SH); ln.rotation.z = rz + Math.PI * 0.02;
    mesh(new THREE.BoxGeometry(0.06, 0.06, 0.32), steelM(), sh, 0.5, 0, 0);
  }
  bx(0.24, 0.1, 0.12, std(P.red, 0.4, 0.3), WG, 0, 0.47, 0);
  const fluidCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.5, -0.05), new THREE.Vector3(0.05, 1.05, -0.3), new THREE.Vector3(-0.7, 1.6, -0.35), new THREE.Vector3(-1.55, 1.75, -0.35)]);
  const fluidM = std(P.amber, 0.25, 0, { transparent: true, opacity: 0.75, emissive: new THREE.Color(0xff9a1a), emissiveIntensity: 0.25 });
  mesh(new THREE.TubeGeometry(fluidCurve, 48, 0.05, 10), fluidM, WG);
  const resv = new THREE.Group(); resv.position.set(-1.75, 1.85, -0.35); WG.add(resv);
  bx(0.42, 0.5, 0.3, std(0xdfe7ef, 0.15, 0, { transparent: true, opacity: 0.35 }), resv, 0, 0, 0);
  const resFluid = bx(0.38, 0.32, 0.26, fluidM, resv, 0, -0.08, 0);
  const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 10, 8), std(0xfff4e0, 0.2, 0, { emissive: new THREE.Color(0xffd9a0), emissiveIntensity: 0.6 }), 30); bub.frustumCulled = false; WG.add(bub);
  const heatP = pts(scene, 70, { color: 0xff7a2a, size: 0.16, add: true, opacity: 0.8 });
  // heat / friction bars
  const bars = new THREE.Group(); bars.position.set(1.6, 0.95, 0.4); BR.add(bars);
  const mkBar = (x, color, label) => {
    bx(0.36, 2.4, 0.06, std(0x101826, 0.5, 0.4), bars, x, 1.2, -0.05);
    const fr = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.36, 2.4, 0.08)), new THREE.LineBasicMaterial({ color: 0x5f7a90, toneMapped: false })); fr.position.set(x, 1.2, 0); bars.add(fr);
    const g = new THREE.BoxGeometry(0.28, 2.3, 0.08); g.translate(0, 1.15, 0);
    const m = mesh(g, std(color, 0.3, 0.1, { emissive: new THREE.Color(color), emissiveIntensity: 0.8 }), bars, x, 0.05, 0.02);
    const tg = tag([[label, `900 44px ${FONT}`, "#e6faff"]], { w: 384, h: 90, size: 0.95, border: null }); tg.position.set(x, -0.18, 0.06); bars.add(tg);
    return m;
  };
  const barHeat = mkBar(0, 0xff5a1f, "PANAS"), barFric = mkBar(0.62, P.cyan, "GESEKAN");
  const blong = tag([["REM BLONG", `900 96px ${FONT}`, "#ffffff"]], { w: 640, h: 160, size: 2.5, bg: "rgba(200,25,25,.94)", border: "#ffffff" });
  blong.position.set(-0.2, 2.5, 1.4); blong.rotation.z = 0.08; BR.add(blong);

  // ================= TANK =================
  const TK = new THREE.Group(); TK.position.x = 80; scene.add(TK);
  bx(14.5, 0.5, 4.2, plinthM, TK, 4.2, -0.37, 0);
  bx(14.56, 0.05, 4.26, trimM, TK, 4.2, -0.1, 0);
  const TG = new THREE.Group(); TK.add(TG); // tilts uphill in s6 (pivot near the floor)
  const TW = 5.6, TH = 2.3, TD = 1.8, GT = 1.12;
  const glassM = std(0xbfefff, 0.05, 0.1, { transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide });
  bx(TW, TH, TD, glassM, TG, 0, TH / 2, 0).castShadow = false;
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(TW, TH, TD)), new THREE.LineBasicMaterial({ color: P.brass, toneMapped: false })); frame.position.y = TH / 2; TG.add(frame);
  for (const x of [-TW / 2, TW / 2]) for (const z of [-TD / 2, TD / 2]) bx(0.07, TH, 0.07, trimM, TG, x, TH / 2, z);
  bx(TW, 0.08, TD, steelM(0x5c6878, 0.4), TG, 0, 0.04, 0);
  bx(1.4, 0.1, 1.2, std(P.asphalt, 0.8), TG, -TW / 2 - 0.7, GT - 0.05, 0); // approach apron
  const TP = [];
  { const R = mulberry(91); for (let y = 0.17; y < GT; y += 0.2) for (let x = -TW / 2 + 0.14; x < TW / 2 - 0.1; x += 0.215) for (let z = -TD / 2 + 0.14; z < TD / 2 - 0.1; z += 0.215) TP.push([x + (R() - 0.5) * 0.06, y + (R() - 0.5) * 0.05, z + (R() - 0.5) * 0.06, 0.1 + R() * 0.03, R()]); }
  const gTank = new THREE.InstancedMesh(gGeo, std(0xffffff, 0.62, 0.05), TP.length); gTank.frustumCulled = false; gTank.castShadow = gTank.receiveShadow = true; TG.add(gTank);
  TP.forEach((p, i) => gTank.setColorAt(i, gc.set(GCOL[Math.floor(p[4] * 4)])));
  const BW = new THREE.Group(); TG.add(BW); const RW = 0.78;
  { const tg = new THREE.TorusGeometry(RW - 0.2, 0.2, 20, 48); mesh(tg, std(P.rubber, 0.85), BW);
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; bx(0.08, 0.05, 0.44, std(0x23262c, 0.9), BW, Math.cos(a) * RW, Math.sin(a) * RW, 0).rotation.z = a; }
    const hub = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.42, 40), steelM(0xc7d2de, 0.22), BW); hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.46, 8), trimM, BW, Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0).rotation.x = Math.PI / 2; } }
  const meter = new THREE.Group(); meter.position.set(-0.6, TH + 0.55, 0.6); TK.add(meter);
  bx(3.3, 0.34, 0.06, std(0x101826, 0.5, 0.4), meter, 1.65, 0, -0.05);
  { const fr = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.3, 0.34, 0.08)), new THREE.LineBasicMaterial({ color: 0x5f7a90, toneMapped: false })); fr.position.x = 1.65; meter.add(fr); }
  const mg = new THREE.BoxGeometry(3.2, 0.26, 0.08); mg.translate(1.6, 0, 0);
  const meterFill = mesh(mg, std(P.cyan, 0.3, 0.1, { emissive: new THREE.Color(P.cyan), emissiveIntensity: 0.9 }), meter, 0.05, 0, 0.02);
  { const t1 = tag([["ENERGI GERAK", `900 46px ${FONT}`, "#e6faff"]], { w: 448, h: 90, size: 1.5, border: null }); t1.position.set(-0.85, 0, 0.06); meter.add(t1); }
  const tankTag = tag([["KERIKIL BULAT", `900 56px ${FONT}`, "#0b1220"]], { w: 640, h: 110, size: 2.4, bg: "rgba(212,175,55,.96)", border: null }); tankTag.position.set(1.0, 0.25, TD / 2 + 0.06); TG.add(tankTag);
  const arF = arrow(P.cyan, 0.9), arD1 = arrow(P.amber, 0.7), arD2 = arrow(P.amber, 0.7), arS1 = arrow(0x7cf7a8, 0.7), arS2 = arrow(0x7cf7a8, 0.7);
  arF.rotation.z = -Math.PI / 2; arD1.rotation.z = Math.PI; arD2.rotation.z = Math.PI; arS1.rotation.x = Math.PI / 2; arS2.rotation.x = Math.PI / 2;
  [arF, arD1, arD2, arS1, arS2].forEach((a) => TG.add(a));
  const grav = new THREE.Group(); TG.add(grav); { const a = arrow(P.amber, 1.4, 0.09); a.rotation.z = Math.PI; grav.add(a); const t2 = tag([["GRAVITASI", `900 50px ${FONT}`, "#f59e0b"]], { w: 448, h: 100, size: 1.5, border: "#f59e0b" }); t2.position.set(0, 0.35, 0.3); grav.add(t2); }
  const water = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), std(0x4fc3ff, 0.1, 0, { emissive: new THREE.Color(0x1aa0ff), emissiveIntensity: 0.6, transparent: true, opacity: 0.9 }), 44); water.frustumCulled = false; TG.add(water);
  const pool = bx(TW - 0.1, 0.06, TD - 0.1, std(0x2fa8ff, 0.1, 0, { emissive: new THREE.Color(0x1a88ff), emissiveIntensity: 0.5, transparent: true, opacity: 0.7 }), TG, 0, 0.11, 0);
  // sand tank
  const SG = new THREE.Group(); SG.position.set(8.4, 0, 0); TK.add(SG);
  bx(4.2, 1.7, 1.6, glassM, SG, 0, 0.85, 0).castShadow = false;
  { const f = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 1.7, 1.6)), new THREE.LineBasicMaterial({ color: P.brass, toneMapped: false })); f.position.y = 0.85; SG.add(f); }
  const sandM = std(0xffffff, 0.95, 0, { map: pebbleTex(12, "#e0bf7a", "rgba(150,110,60,.25)") });
  bx(4.1, 0.85, 1.5, sandM, SG, 0, 0.47, 0);
  const SW = new THREE.Group(); SG.add(SW);
  mesh(new THREE.TorusGeometry(0.33, 0.13, 16, 40), std(P.rubber, 0.85), SW);
  mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 30), steelM(0xc7d2de, 0.22), SW).rotation.x = Math.PI / 2;
  const sandTag = tag([["PASIR", `900 60px ${FONT}`, "#0b1220"]], { w: 384, h: 110, size: 1.5, bg: "rgba(224,191,122,.97)", border: null }); sandTag.position.set(1.0, 0.22, 0.82); SG.add(sandTag);
  const wetTag = tag([["BASAH", `900 52px ${FONT}`, "#e6faff"]], { w: 320, h: 100, size: 1.0, bg: "rgba(20,90,160,.95)", border: null }); wetTag.position.set(-1.0, 0.22, 0.82); SG.add(wetTag);
  const sandDry = new THREE.Color(0xffffff), sandWet = new THREE.Color(0x8f7a58);

  // ================= CHART =================
  const CH = new THREE.Group(); CH.position.x = 120; scene.add(CH);
  bx(7.5, 0.5, 8, plinthM, CH, 0, -0.37, 1);
  bx(7.56, 0.05, 8.06, trimM, CH, 0, -0.1, 1);
  const slabA = bx(0.95, 0.1, 0.95, std(0x4a515c, 0.8, 0.1), CH, -1.25, 0.05, -0.5);
  const gravelSlabM = std(0xffffff, 0.7, 0.05, { map: pebbleTex(5, "#c9a77a", "rgba(90,70,40,.35)") });
  const slabs = []; for (let k = 0; k < 25; k++) slabs.push(bx(0.95, 0.092, 0.95, gravelSlabM, CH, 1.25, 0.05 + k * 0.1, -0.5));
  const tA = tag([["ASPAL", `900 56px ${FONT}`, "#e6faff"]], { w: 384, h: 100, size: 1.3, border: null }); tA.position.set(-1.25, 0.45, 0.05); CH.add(tA);
  const t25 = tag([["25×", `900 120px ${FONT}`, "#f59e0b"]], { w: 384, h: 170, size: 1.6, bg: null, border: null, glow: true }); t25.position.set(1.25, 3.05, -0.45); CH.add(t25);
  const tG = tag([["KERIKIL BULAT", `900 44px ${FONT}`, "#0b1220"]], { w: 448, h: 90, size: 1.5, bg: "rgba(212,175,55,.96)", border: null }); tG.position.set(1.25, -0.02, 0.05); CH.add(tG);
  const doc = tag([["PEDOMAN DESAIN JALAN", `900 40px ${FONT}`, "#e6faff"], ["WASHINGTON, AS", `700 34px ${MONO}`, "#00e5ff"]], { w: 640, h: 150, size: 2.0 }); doc.position.set(-1.3, 1.5, -1.3); CH.add(doc);
  const trk = new THREE.Group(); trk.position.set(0, 0, 2.8); CH.add(trk);
  const TL0 = -2.7, TL1 = 2.5;
  bx(TL1 - TL0 + 0.5, 0.06, 0.9, std(P.asphalt, 0.8), trk, TL0 - 0.5, 0.03, 0).scale.x = 0.2;
  bx(TL1 - TL0, 0.08, 0.9, std(0xffffff, 0.7, 0.05, { map: pebbleTex(8, "#c9a77a", "rgba(90,70,40,.35)") }), trk, (TL0 + TL1) / 2, 0.04, 0);
  for (let i = 0; i <= 10; i++) bx(0.03, 0.02, i % 5 ? 0.18 : 0.32, std(0xe6faff, 0.4, 0, { emissive: new THREE.Color(0x667788) }), trk, TL0 + ((TL1 - TL0) * i) / 10, 0.09, 0.55);
  const distLine = bx(1, 0.03, 0.05, new THREE.MeshBasicMaterial({ color: P.cyan, toneMapped: false }), trk, TL0, 0.1, 0.62);
  const t0m = tag([["0", `900 60px ${FONT}`, "#e6faff"]], { w: 128, h: 100, size: 0.45, bg: null, border: null }); t0m.position.set(TL0, 0.4, 0.75); trk.add(t0m);
  const t100 = tag([["± 100 m", `900 64px ${FONT}`, "#00e5ff"]], { w: 448, h: 110, size: 1.4, bg: "rgba(9,13,22,.9)" }); t100.position.set(TL1 - 0.2, 0.75, 0.75); trk.add(t100);
  const T2 = makeTruck(trk, 0.42); T2.G.rotation.y = Math.PI / 2;
  const t80 = tag([["80 km/jam", `900 60px ${FONT}`, "#0b1220"]], { w: 448, h: 100, size: 1.1, bg: "rgba(245,158,11,.97)", border: null }); trk.add(t80);

  // ================= CAMERA =================
  const tz = (z) => z, CUT = 0.02;
  const ramp0 = rampPt(6.0);
  const HOOK = [ramp0.x + 4.6, ramp0.y + 4.3, ramp0.z + 11.6, ramp0.x - 0.3, ramp0.y + 0.6, ramp0.z];
  const keys = [
    [0, ramp0.x + 5.4, ramp0.y + 4.8, ramp0.z + 12.4, ramp0.x - 0.2, ramp0.y + 0.7, ramp0.z],
    [A("s1:tenggelam"), ...HOOK],
    [K.s2, ramp0.x + 2.8, ramp0.y + 4.9, ramp0.z + 11.8, ramp0.x - 0.8, ramp0.y + 0.6, ramp0.z - 0.4],
    [A("s2:tiga") - 0.4, 0.6, 8.8, 13.5, 0.2, 2.8, -11],
    [K.s3 - CUT, -0.4, 8.2, 12.2, 0, 3.0, -12],
    // BRAKE
    [K.s3, 41.2, 3.9, 13.0, 40.4, 2.6, 0],
    [A("s3:kampas"), 40.9, 3.4, 11.4, 40.35, 2.45, 0],
    [K.s4 - CUT, 40.4, 3.0, 10.4, 40.3, 2.4, 0],
    // ROAD, truck comes down
    [K.s4, -5.0, 8.4, 13.5, 0.2, 1.6, -1.5],
    [A("s4:aspal"), 1.0, 7.4, 11.2, 2.2, 1.4, -4.5],
    [K.s5 - CUT, HOOK[0] + 0.6, HOOK[1] + 0.4, HOOK[2] + 0.3, HOOK[3], HOOK[4], HOOK[5]],
    // TANK
    [K.s5, 79.0, 3.0, 15.8, 79.4, 1.5, 0],
    [A("s5:dipadatkan"), 80.0, 2.8, 14.4, 80.2, 1.45, 0],
    [A("s6:gravitasi") + 0.4, 80.6, 3.0, 14.4, 80.5, 1.6, 0],
    [A("s6:airnya") + 0.8, 80.2, 3.1, 13.6, 80.2, 1.4, 0],
    [A("s6:Pasir") + 0.6, 86.0, 2.6, 12.4, 86.2, 1.0, 0],
    [K.s7 - CUT, 87.2, 2.3, 10.6, 87.6, 0.9, 0],
    // CHART
    [K.s7, 119.6, 2.6, 13.0, 120, 1.5, -0.3],
    [A("s7:kali") + 0.3, 120.3, 2.5, 12.0, 120.1, 1.45, -0.3],
    [A("s7:masuk"), 120.2, 5.0, 15.5, 120, 1.4, 1.8],
    [K.s8 - CUT, 120.0, 5.4, 16.2, 120, 1.2, 2.0],
    // ROAD outro
    [K.s8, -3.6, 7.6, 11.5, 2.2, 1.6, -5.5],
    [A("s8:AUDIRA"), 2.2, 6.0, 11.0, 2.8, 1.8, -5.0],
    [K.dur, 7.4, 6.4, 7.5, 3.2, 1.6, -6.0],
  ];
  const cut = (a, b) => (a < b ? a : b);
  keys.sort((a, b) => a[0] - b[0]);
  const camT = track(keys);
  const CUTS = [K.s3, K.s4, K.s5, K.s7, K.s8];
  const o3 = new THREE.Object3D();
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a + f) * (1 - ramp(t, b - f, b + f));
  if (globalThis.__AUDIRA_PROBE) globalThis.__AUDIRA_PROBE({ t25, tA, truck: T1.G, board, drum: WG, bars, tyre: BW, meter, sandWheel: SW, slab25: slabs[24], truck2: T2.G, noStop });

  return (t) => {
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(c[3], c[4], c[5]);
    key.position.set(c[3] - 6, c[4] + 12, c[5] + 9); key.target.position.set(c[3], c[4], c[5]);
    rim.position.set(c[3] + 7, c[4] + 5, c[5] - 10); rim.target.position.set(c[3], c[4], c[5]);
    warm.position.set(c[3] + 8, c[4] + 2, c[5] + 6); warm.target.position.set(c[3], c[4], c[5]);
    let fl = 0; for (const ct of CUTS) { const d = t - ct; if (d >= 0 && d < 0.5) fl = Math.max(fl, 0.28 * Math.exp(-d * 9)); }
    gradeP.uniforms.flash.value = fl;
    const stn = t >= K.s3 && t < K.s4 ? 1 : t >= K.s5 && t < K.s7 ? 2 : t >= K.s7 && t < K.s8 ? 3 : 0;
    RD.visible = stn === 0; BR.visible = stn === 1; TK.visible = stn === 2; CH.visible = stn === 3;
    heatP.P.visible = stn === 1; spray.P.visible = stn === 0;

    // ---------------- ROAD ----------------
    if (RD.visible) {
      const inS4 = t >= K.s4 && t < K.s5;
      const tIn = K.s4 + 0.2, tStop = A("s4:kerikil") + 1.1;
      const u = inS4 ? eout(clamp01((t - tIn) / (tStop - tIn))) * 0.82 + 0.18 * clamp01((t - tIn) / (tStop - tIn)) : 1;
      const deepen = t < K.s2 ? 0.07 * ramp(t, A("s1:tenggelam") - 0.3, A("s1:tenggelam") + 0.5) : 0.07;
      const tr = truckOnPath(u, inS4 ? 0.07 * clamp01((u - 0.7) / 0.3) : deepen);
      // ruts: pebbles under the wheels behind the truck sink and pile up at the sides
      const lz = tr.onR > 0 ? tr.lz : -1;
      RG.forEach((p, i) => {
        let x = p[0], y = p[1], z = p[2], s = p[3];
        if (lz > 0 && z < lz + 1.4) {
          for (const wx of [-0.5, 0.5]) { const d = Math.abs(x - wx); if (d < 0.16) y -= 0.09 * (1 - d / 0.16); else if (d < 0.32) y += 0.05 * (1 - (d - 0.16) / 0.16); }
        }
        o3.position.set(x, y, z); o3.rotation.set(p[4] * 6, p[4] * 3, 0); o3.scale.set(s, s * 0.72, s); o3.updateMatrix(); gRamp.setMatrixAt(i, o3.matrix);
      });
      gRamp.instanceMatrix.needsUpdate = true;
      // spray: when the truck hits the gravel (s4) and when it sinks (s1)
      const tHit = inS4 ? tIn + (tStop - tIn) * 0.42 : A("s1:tenggelam") - 0.2;
      const R = mulberry(5);
      for (let i = 0; i < 90; i++) {
        const a = R() * Math.PI * 2, v = 1.2 + R() * 1.6, vy = 1.5 + R() * 2, dt = t - tHit - R() * 0.25;
        if (dt < 0 || dt > 1.1 || (t >= K.s2 && !inS4)) { spray.pos.set([0, -50, 0], i * 3); continue; }
        _l.set((i % 2 ? 0.55 : -0.55) + Math.cos(a) * v * dt * 0.6, 0.25 + vy * dt - 4.9 * dt * dt, -1.0 + Math.sin(a) * v * dt * 0.4);
        T1.G.localToWorld(_l); spray.pos.set([_l.x, Math.max(_l.y, -0.2), _l.z], i * 3);
      }
      spray.commit();
      board.visible = t < K.s3 + 1 || t >= K.s8;
      const tt = A("s2:tiga");
      pinM.forEach((m, i) => (m.emissiveIntensity = 0.1 + 1.6 * ramp(t, tt - 0.1 + i * 0.32, tt + 0.15 + i * 0.32)));
      outline.material.opacity = inS4 ? 0.9 * win(t, A("s4:bercabang"), A("s4:aspal") + 0.6) + 0.25 * Math.sin(t * 6) * win(t, A("s4:bercabang"), A("s4:aspal")) : 0;
      chev.scale.setScalar(t >= K.s4 ? pop(t, A("s4:tikungan") - 0.1) : 1);
      noStop.scale.setScalar(t >= K.s8 ? pop(t, A("s8:jangan") - 0.1, 0.45) : 0.0001);
    }

    // ---------------- BRAKE ----------------
    if (BR.visible) {
      const tb = A("s3:blong");
      const brake = ramp(t, A("s3:mengerem") - 0.3, A("s3:mengerem") + 0.2) * (1 - ramp(t, tb, tb + 0.4));
      const heat = 0.75 * ramp(t, A("s3:mengerem"), A("s3:panas") + 0.6) + 0.25 * ramp(t, A("s3:panas") + 0.6, A("s3:mendidih"));
      SPIN.rotation.z = -(2.4 * t + 1.6 * Math.max(0, t - tb) ** 2);
      SH.scale.setScalar(1 + 0.025 * brake);
      drumM.emissiveIntensity = 1.5 * heat * heat; drumM.color.setRGB(0.42 + 0.2 * heat, 0.47 - 0.1 * heat, 0.53 - 0.2 * heat);
      liningM.emissiveIntensity = 0.9 * heat * heat;
      fluidM.emissiveIntensity = 0.25 + 0.6 * ramp(t, A("s3:mendidih") - 0.4, A("s3:mendidih") + 0.3);
      const boil = ramp(t, A("s3:mendidih") - 0.3, A("s3:mendidih") + 0.3);
      for (let i = 0; i < 30; i++) {
        const u = ((t * 0.35 + i / 30) % 1); fluidCurve.getPoint(u, o3.position); o3.position.x += 0.03 * Math.sin(i * 7.1 + t * 9); o3.position.z += 0.03;
        if (i > 22) { o3.position.set(-1.75 + 0.14 * Math.sin(i * 3 + t), 1.72 + ((t * 0.6 + i * 0.13) % 1) * 0.22, -0.2); }
        o3.rotation.set(0, 0, 0); o3.scale.setScalar(Math.max(0.0001, boil * (0.6 + 0.6 * Math.abs(Math.sin(i * 5.3 + t * 3))))); o3.updateMatrix(); bub.setMatrixAt(i, o3.matrix);
      }
      bub.instanceMatrix.needsUpdate = true;
      resFluid.position.y = -0.08 + 0.02 * Math.sin(t * 13) * boil;
      const R = mulberry(9);
      for (let i = 0; i < 70; i++) {
        const a = R() * Math.PI * 2, rr = 0.4 + R() * 0.6, ph = R();
        const u = ((t * 0.5 + ph) % 1);
        heatP.pos.set([40 + Math.cos(a) * rr * 1.1, 2.25 + Math.sin(a) * rr * 0.8 + u * 1.6, 0.3 + R() * 0.3], i * 3);
        heatP.col.set([heat * (1 - u), heat * 0.45 * (1 - u), heat * 0.1 * (1 - u)], i * 3);
      }
      heatP.commit();
      barHeat.scale.y = Math.max(0.02, 0.12 + 0.88 * heat);
      barFric.scale.y = Math.max(0.02, 1 - 0.72 * ramp(t, A("s3:melemah") - 0.4, A("s3:melemah") + 0.9) - 0.15 * ramp(t, tb - 0.3, tb));
      const fl2 = t > tb ? 0.75 + 0.25 * Math.sin(t * 16) : 1;
      blong.scale.setScalar(pop(t, tb - 0.08, 0.3) * fl2); blong.visible = t > tb - 0.1;
      const td = A("s3:turunan");
      chevs.forEach((a, i) => { const u = ((t * 0.5 + i / 4) % 1); a.position.set(-4.6 + u * 9.2, 0.2, 0.9); a.scale.setScalar(Math.max(0.0001, ramp(t, td - 0.3, td + 0.3) * Math.sin(Math.PI * u))); });
      turunTag.scale.setScalar(pop(t, td - 0.15));
    }

    // ---------------- TANK ----------------
    if (TK.visible) {
      const t0 = K.s5 + 0.15, tS = A("s5:menyedot") + 0.5;
      const pr = eout(clamp01((t - t0) / (tS - t0)));
      const wx = -TW / 2 - 1.0 + (TW / 2 + 1.0 + 1.25) * pr;
      const inG = clamp01((wx + TW / 2 + 0.2) / 0.9);
      const sink = 0.42 * eout(inG) * ramp(t, A("s5:amblas") - 0.6, A("s5:amblas") + 0.2) + 0.06 * inG;
      const wy = GT + RW - sink;
      BW.position.set(wx, wy, 0); BW.rotation.z = -(wx - (-TW / 2 - 1.0)) / RW;
      const tilt = 0.13 * ramp(t, A("s6:menanjak") - 0.5, A("s6:menanjak") + 0.6);
      TG.rotation.z = tilt; TG.position.y = 0.05 + 2.6 * Math.sin(tilt) * 0.12;
      TP.forEach((p, i) => {
        let x = p[0], y = p[1], z = p[2];
        const dx = x - wx, dy = y - wy, d = Math.hypot(dx, dy) || 1e-4, lane = Math.abs(z) < 0.5;
        if (lane && d < RW + 0.1) { const push = RW + 0.1 - d; x += (dx / d) * push; y += (dy / d) * push; }
        if (lane && dx > 0 && dx < RW * 1.8 && y > GT - 0.45) y += 0.16 * (1 - dx / (RW * 1.8)) * inG;
        if (lane && dx < -0.2 && x > -TW / 2 && y > GT - 0.5) y -= 0.07 * inG;
        if (!lane && Math.abs(dx) < RW && y > GT - 0.5) z += Math.sign(z) * 0.06 * (1 - Math.abs(dx) / RW) * inG;
        o3.position.set(x, y, z); o3.rotation.set(p[4] * 6, p[4] * 4, 0); o3.scale.set(p[3], p[3] * 0.8, p[3]); o3.updateMatrix(); gTank.setMatrixAt(i, o3.matrix);
      });
      gTank.instanceMatrix.needsUpdate = true;
      meterFill.scale.x = Math.max(0.02, 1 - pr);
      meterFill.material.emissiveIntensity = 0.9 + 0.8 * win(t, A("s5:menyedot"), K.s6, 0.25) * (0.5 + 0.5 * Math.sin(t * 12));
      const inS5 = t < K.s6;
      arF.position.set(wx + RW + 0.25, GT + 0.15, 0.95); arF.scale.setScalar(inS5 ? pop(t, A("s5:didorong") - 0.1) * (1 - ramp(t, K.s6 - 0.3, K.s6)) : 0.0001);
      const dsc = inS5 ? pop(t, A("s5:dipadatkan") - 0.1) * (1 - ramp(t, K.s6 - 0.3, K.s6)) : 0.0001;
      arD1.position.set(wx - 1.0, GT + 0.8, 0.95); arD2.position.set(wx - 1.6, GT + 0.8, 0.95); arD1.scale.setScalar(dsc); arD2.scale.setScalar(dsc);
      const ssc = inS5 ? pop(t, A("s5:digeser") - 0.1) * (1 - ramp(t, K.s6 - 0.3, K.s6)) : 0.0001;
      arS1.position.set(wx + 0.2, GT + 0.2, 0.75); arS2.position.set(wx - 0.5, GT + 0.2, 0.75); arS1.scale.setScalar(ssc); arS2.scale.setScalar(ssc * 0.8);
      grav.position.set(wx, wy + 0.2, 1.0); grav.scale.setScalar(t >= K.s6 ? pop(t, A("s6:gravitasi") - 0.15) * (1 - ramp(t, A("s6:airnya") - 0.4, A("s6:airnya"))) : 0.0001);
      grav.rotation.z = -tilt;
      tankTag.material.opacity = 0.45 + 0.55 * Math.max(win(t, A("s6:Kerikil"), A("s6:Pasir"), 0.3), t < K.s6 ? 1 : 0);
      const wOn = ramp(t, A("s6:airnya") - 0.3, A("s6:airnya") + 0.2) * (1 - ramp(t, K.s7 - 0.4, K.s7));
      const R = mulberry(31);
      for (let i = 0; i < 44; i++) {
        const xx = -TW / 2 + 0.3 + R() * (TW - 0.6), ph = R(), u = (t * 0.45 + ph) % 1;
        const y = u < 0.25 ? 3.1 - (u / 0.25) * (3.1 - GT) : GT - ((u - 0.25) / 0.65) * (GT - 0.12);
        o3.position.set(xx + 0.04 * Math.sin(u * 20 + i), Math.max(0.12, y), 0.86); o3.rotation.set(0, 0, 0);
        o3.scale.set(1, u < 0.25 ? 1.8 : 1, 1).multiplyScalar(Math.max(0.0001, wOn * (u > 0.9 ? (1 - u) * 10 : 1))); o3.updateMatrix(); water.setMatrixAt(i, o3.matrix);
      }
      water.instanceMatrix.needsUpdate = true;
      pool.scale.set(1, Math.max(0.01, wOn * (0.6 + 0.4 * Math.sin(t * 2))), 1);
      // sand tank
      const tp = A("s6:Pasir"), tm = A("s6:mendadak");
      SG.visible = t > tp - 0.8;
      SG.position.y = -2.4 * (1 - eout(clamp01((t - tp + 0.8) / 0.7)));
      const wet = ramp(t, A("s6:basah") - 0.3, A("s6:basah") + 0.4);
      sandM.color.copy(sandDry).lerp(sandWet, wet); sandM.roughness = 0.95 - 0.5 * wet;
      wetTag.scale.setScalar(pop(t, A("s6:basah") - 0.1));
      const sx = t < tm ? -2.5 + 2.2 * clamp01((t - tp) / Math.max(0.3, tm - tp)) : -0.3;
      const jolt = t >= tm ? Math.exp(-(t - tm) * 5) : 0;
      SW.position.set(sx, 0.9 + 0.46 - 0.06 + 0.05 * jolt * Math.sin((t - tm) * 40), 0.2);
      SW.rotation.z = -(sx + 2.5) / 0.46 + 0.35 * jolt * Math.sin((t - tm) * 30);
    }

    // ---------------- CHART ----------------
    if (CH.visible) {
      const ts = A("s7:dua") - 0.15;
      slabs.forEach((s, k) => { const p = clamp01((t - ts - k * 0.055) / 0.28); s.visible = p > 0; s.position.y = 0.05 + k * 0.1 + 1.0 * (1 - eout(p)); });
      t25.material.opacity = 0.22 + 0.78 * ramp(t, A("s7:kali") - 0.15, A("s7:kali") + 0.15);
      t25.scale.setScalar(1 + 0.12 * Math.max(0, 1 - Math.abs(t - A("s7:kali") - 0.15) * 4));
      doc.material.opacity = 0.35 + 0.65 * ramp(t, A("s7:Washington") - 0.2, A("s7:Washington") + 0.2);
      const tm = A("s7:masuk"), te = A("s7:meter") + 0.3;
      const p = eout(clamp01((t - tm) / (te - tm)));
      const x = TL0 - 0.9 + (TL1 - 0.1 - (TL0 - 0.9)) * p;
      T2.G.position.set(x, 0.08, 0); T2.wheels.forEach((w) => (w.rotation.x = (x - TL0) / (0.25 * 0.42)));
      t80.position.set(x - 0.2, 1.05, 0.1); t80.material.opacity = 0.3 + 0.7 * ramp(t, A("s7:delapan") - 0.1, A("s7:delapan") + 0.2);
      const dl = Math.max(0.001, x - TL0); distLine.scale.x = dl; distLine.position.x = TL0 + dl / 2;
      t100.material.opacity = 0.25 + 0.75 * ramp(t, A("s7:seratus") - 0.1, A("s7:seratus") + 0.25);
    }
    comp.render();
  };
}
