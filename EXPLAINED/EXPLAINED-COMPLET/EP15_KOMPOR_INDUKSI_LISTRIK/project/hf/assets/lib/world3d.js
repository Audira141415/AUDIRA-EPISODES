// EP15 KOMPOR INDUKSI (THERMALFORGE): the whole film is seen through a thermal camera (ironbow: dark violet = cold,
// magenta = warm, orange-yellow = hot; white only on tiny hotspot points). Three stations in one dark lab:
//   COOK  x=0   generic induction hob on a warm counter: dark glass top, copper spiral coil in the gap underneath,
//               cyan current beads that slosh back and forth (alternating current), cyan field loops that rise
//               through the glass and reverse, a pan whose base fills with spinning eddy rings and then glows
//   CMP   x=30  three pans side by side (iron / aluminium / copper): only the iron pan glows, a magnet snaps to its
//               base, the glass under it turns faintly warm
//   FRQ   x=60  oscilloscope wall: a slow 50x/s wave vs a dense tens-of-thousands wave, then 1906 and 1970s plates
//               with a generic transistor
// Generic products only. Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const IRON = ["#0A0A10", "#310E68", "#9B1D8C", "#EA5E28", "#F7D038", "#FFFFFF"];
const _c = new THREE.Color();
function ironbow(t, out = new THREE.Color()) {
  const x = clamp01(Number.isFinite(t) ? t : 0) * (IRON.length - 1);
  const i = Math.min(IRON.length - 2, Math.floor(x));
  return out.set(IRON[i]).lerp(_c.set(IRON[i + 1]), x - i);
}
// Thermal material: colour and emissive follow the temperature; emissive is capped at orange-yellow (bloom discipline).
function setT(m, temp) {
  const g = m.userData.glow ?? 0.5;
  ironbow(temp * 0.95, m.color);
  ironbow(Math.min(temp, 0.74), m.emissive);
  m.emissiveIntensity = g * (0.2 + temp);
}
function tm(temp, { rough = 0.55, metal = 0, glow = 0.5, side = THREE.FrontSide, transparent = false, opacity = 1 } = {}) {
  const m = new THREE.MeshStandardMaterial({ roughness: rough, metalness: metal, side, transparent, opacity });
  m.userData.glow = glow;
  setT(m, temp);
  return m;
}
const NanGuard = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}`,
};
// Sensor grade: slight violet lift in the shadows, faint scanlines, keeps the ironbow readable.
const Grade = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c+=vec3(0.03,0.008,0.06)*(1.0-l);c*=0.97+0.03*sin(vUv.y*1920.0*1.5708);
  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}`,
};

const o3 = new THREE.Object3D();
function dots(n, r, color, parent) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshBasicMaterial({ color, toneMapped: false }), n);
  m.frustumCulled = false;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  parent.add(m);
  return m;
}
function setDot(m, i, x, y, z, s) { o3.position.set(x, y, z); o3.rotation.set(0, 0, 0); o3.scale.setScalar(Math.max(1e-4, s)); o3.updateMatrix(); m.setMatrixAt(i, o3.matrix); }
function plate(text, w = 2.4, { color = "#F7D038", border = "#00E5FF", px = 64 } = {}) {
  const W = 640, H = 150;
  const tx = canvasTex(W, H, (g) => {
    g.fillStyle = "rgba(10,10,16,0.94)"; g.fillRect(0, 0, W, H);
    g.strokeStyle = border; g.lineWidth = 6; g.strokeRect(4, 4, W - 8, H - 8);
    g.fillStyle = color; g.font = `700 ${px}px 'Courier New', monospace`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, W / 2, H / 2 + 4);
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, (w * H) / W), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false }));
}
function add(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }

// Generic pan: base, flared wall, rim, handle. One material for the body so its temperature reads as one object.
function makePan(parent, temp) {
  const G = new THREE.Group(); parent.add(G);
  const body = tm(temp, { rough: 0.42, metal: 0.15, glow: 0.6, side: THREE.DoubleSide });
  add(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 56), body, G, 0, 0.04, 0);
  add(new THREE.CylinderGeometry(1.16, 1.05, 0.56, 56, 1, true), body, G, 0, 0.32, 0);
  const rim = add(new THREE.TorusGeometry(1.16, 0.035, 8, 56), body, G, 0, 0.6, 0); rim.rotation.x = Math.PI / 2;
  const hm = tm(0.36, { rough: 0.7, glow: 0.4 });
  const h = add(new THREE.BoxGeometry(1.5, 0.09, 0.2), hm, G, 1.9, 0.52, 0); h.rotation.z = 0.12;
  return { G, body, hm };
}
// Generic hob: dark glass over a body with an open gap where the coil sits.
function makeHob(parent, w) {
  const H = new THREE.Group(); parent.add(H);
  add(new THREE.BoxGeometry(w, 0.4, w), tm(0.2, { rough: 0.8, glow: 0.35 }), H, 0, -0.18, 0);
  const glassM = new THREE.MeshStandardMaterial({ color: "#1a0c33", roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.88, emissive: new THREE.Color("#140828"), emissiveIntensity: 0.6 });
  const glass = add(new THREE.BoxGeometry(w, 0.06, w), glassM, H, 0, 0.21, 0); glass.castShadow = false; glass.renderOrder = 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(w * 0.37, 0.012, 6, 72), new THREE.MeshBasicMaterial({ color: "#3fb6c8", toneMapped: false, transparent: true, opacity: 0.55 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.245; H.add(ring);
  const warm = new THREE.Mesh(new THREE.CircleGeometry(w * 0.34, 48), new THREE.MeshBasicMaterial({ color: "#9B1D8C", transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  warm.rotation.x = -Math.PI / 2; warm.position.y = 0.243; H.add(warm);
  return { H, glassM, warm };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0c0618, fog: 0.018, exp: 1.0, bloom: [0.34, 0.5, 0.86] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.insertPass(new ShaderPass(Grade), comp.passes.length - 1);
  r.shadowMap.enabled = true;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const R = mulberry(1506);

  scene.add(new THREE.AmbientLight(0x5a3a9a, 0.7));
  scene.add(new THREE.HemisphereLight(0x8a5cff, 0x1a0628, 0.7));
  const key = new THREE.DirectionalLight(0xfff2e8, 1.25); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 40 }); key.shadow.camera.updateProjectionMatrix(); scene.add(key, key.target);
  const rim = new THREE.PointLight(0xc04cff, 22, 18, 1.6); scene.add(rim);

  // shared lab floor + back wall (cold), counters (warm so the lower frame is never black)
  const floor = add(new THREE.PlaneGeometry(160, 40), tm(0.14, { rough: 0.95, glow: 0.4 }), scene, 30, -1.6, 0); floor.rotation.x = -Math.PI / 2;
  const wall = add(new THREE.PlaneGeometry(160, 30), tm(0.1, { rough: 0.95, glow: 0.35 }), scene, 30, 6, -6);
  // wall grid: faint cyan sensor lines
  const gridTex = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(0,229,255,0.18)"; g.lineWidth = 2; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(160, 40), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false, toneMapped: false }));
  grid.position.set(30, 6, -5.95); scene.add(grid);
  const counter = (x, w) => { add(new THREE.BoxGeometry(w, 0.5, 6), tm(0.42, { rough: 0.85, glow: 0.45 }), scene, x, -0.63, 0); add(new THREE.BoxGeometry(w, 0.8, 5.6), tm(0.3, { rough: 0.9, glow: 0.35 }), scene, x, -1.25, 0.1); };
  counter(0, 10); counter(30, 10);

  // ---------------- COOK ----------------
  const COOK = new THREE.Group(); scene.add(COOK);
  const hob = makeHob(COOK, 3.4);
  const brand = plate("AUDIRA · INDUKSI", 1.5, { color: "#00E5FF", border: "#3a1e6a", px: 58 });
  brand.rotation.x = -Math.PI / 2; brand.position.set(0, 0.246, 1.42); COOK.add(brand);
  for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), new THREE.MeshBasicMaterial({ color: i === 2 ? "#F7D038" : "#3fb6c8", toneMapped: false })); d.rotation.x = -Math.PI / 2; d.position.set(-1.25 + i * 0.16, 0.246, 1.42); COOK.add(d); }
  // copper spiral coil in the gap under the glass
  const TURNS = 8, R0 = 0.22, R1 = 1.22, cp = [];
  for (let i = 0; i <= 480; i++) { const u = i / 480, a = u * TURNS * 2 * Math.PI, rr = R0 + (R1 - R0) * u; cp.push(new THREE.Vector3(Math.cos(a) * rr, 0, Math.sin(a) * rr)); }
  const coilCurve = new THREE.CatmullRomCurve3(cp);
  const coilM = tm(0.46, { rough: 0.35, metal: 0.3, glow: 0.55 });
  add(new THREE.TubeGeometry(coilCurve, 900, 0.034, 8, false), coilM, COOK, 0, 0.1, 0);
  const NC = 80, cur = dots(NC, 0.035, "#33e8ff", COOK);
  const curPt = new THREE.Vector3();
  // magnetic field loops: ellipses in vertical planes, up through the centre, down outside
  const NL = 8, LD = 7, fieldM = new THREE.MeshBasicMaterial({ color: "#00c8e8", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const loops = [];
  for (let k = 0; k < NL; k++) {
    const ph = (k / NL) * Math.PI * 2, pts = [];
    for (let i = 0; i < 64; i++) { const s = (i / 64) * Math.PI * 2; const x = 0.9 + 0.78 * Math.cos(s), y = 0.62 + 1.12 * Math.sin(s); pts.push(new THREE.Vector3(Math.cos(ph) * x, y, Math.sin(ph) * x)); }
    const c = new THREE.CatmullRomCurve3(pts, true);
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 128, 0.012, 6, true), fieldM); COOK.add(m);
    loops.push(c);
  }
  const fdots = dots(NL * LD, 0.045, "#7ff4ff", COOK);
  // pan + eddy rings + heat shimmer
  const pan = makePan(COOK, 0.72);
  const RINGS = [[0.22, 8], [0.45, 14], [0.68, 20], [0.9, 26]], NE = RINGS.reduce((s, x) => s + x[1], 0);
  const eddy = dots(NE, 0.04, "#33e8ff", pan.G);
  const eddyM = eddy.material;
  const NS = 70, shimmer = [];
  for (let i = 0; i < NS; i++) { const a = R() * 6.283, rr = Math.sqrt(R()) * 0.85; shimmer.push([Math.cos(a) * rr, Math.sin(a) * rr, R(), 0.35 + 0.4 * R()]); }
  const sh = dots(NS, 0.05, "#EA5E28", COOK); sh.material.transparent = true; sh.material.opacity = 0.26;

  // ---------------- CMP ----------------
  const CMP = new THREE.Group(); CMP.position.x = 30; scene.add(CMP);
  const CX = [-2.5, 0, 2.5], cmpHob = [], cmpPan = [];
  CX.forEach((x, i) => {
    const h = makeHob(CMP, 2.15); h.H.position.x = x; cmpHob.push(h);
    const p = makePan(h.H, 0.2); p.G.scale.setScalar(0.62); p.G.position.y = 0.24; cmpPan.push(p);
    const lb = plate(["BESI", "ALUMINIUM", "TEMBAGA"][i], 1.55, { color: i === 0 ? "#F7D038" : "#b9a6ff" }); lb.position.set(x, -0.12, 1.25); lb.rotation.x = -0.35; CMP.add(lb);
  });
  const magnet = new THREE.Group(); CMP.add(magnet);
  add(new THREE.BoxGeometry(0.34, 0.2, 0.22), tm(0.34, { rough: 0.5, glow: 0.45 }), magnet);
  add(new THREE.BoxGeometry(0.08, 0.21, 0.23), tm(0.2, { rough: 0.5, glow: 0.4 }), magnet, -0.13, 0, 0);
  const snapRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.24, 32), new THREE.MeshBasicMaterial({ color: "#00E5FF", transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  CMP.add(snapRing);

  // ---------------- FRQ ----------------
  const FRQ = new THREE.Group(); FRQ.position.x = 60; scene.add(FRQ);
  add(new THREE.BoxGeometry(14.5, 4.6, 0.2), tm(0.08, { rough: 0.9, glow: 0.3 }), FRQ, 3, 1.4, -1.0);
  const scopeTitle = plate("AUDIRA · OSILOSKOP", 2.6, { color: "#00E5FF", border: "#3a1e6a", px: 56 }); scopeTitle.position.set(0, 3.35, -0.85); FRQ.add(scopeTitle);
  const axisM = new THREE.MeshBasicMaterial({ color: "#3a2a6a", toneMapped: false });
  add(new THREE.BoxGeometry(6.4, 0.015, 0.01), axisM, FRQ, 0, 2.2, -0.86); add(new THREE.BoxGeometry(6.4, 0.015, 0.01), axisM, FRQ, 0, 0.6, -0.86);
  const W1 = 150, W2 = 700, w1 = dots(W1, 0.05, "#EA5E28", FRQ), w2 = dots(W2, 0.03, "#F7D038", FRQ);
  const lab50 = plate("50× / DETIK", 1.7, { color: "#EA5E28" }); lab50.position.set(-2.4, 2.95, -0.7); FRQ.add(lab50);
  const labK = plate("PULUHAN RIBU× / DETIK", 2.5, { color: "#F7D038", px: 52 }); labK.position.set(-1.9, 1.32, -0.7); FRQ.add(labK);
  const p1906 = plate("1906 · PATEN", 2.0, { color: "#b9a6ff" }); p1906.position.set(5.0, 2.4, -0.7); FRQ.add(p1906);
  const p1970 = plate("1970-AN", 1.6, { color: "#F7D038" }); p1970.position.set(7.6, 2.4, -0.7); FRQ.add(p1970);
  const tr = new THREE.Group(); tr.position.set(7.6, 0.5, 0.2); FRQ.add(tr);
  const trM = tm(0.3, { rough: 0.6, glow: 0.5 });
  add(new THREE.BoxGeometry(0.9, 0.7, 0.32), trM, tr, 0, 0.55, 0);
  add(new THREE.BoxGeometry(0.9, 0.22, 0.06), tm(0.4, { rough: 0.4, metal: 0.3, glow: 0.45 }), tr, 0, 1.0, -0.12);
  for (let i = -1; i <= 1; i++) add(new THREE.BoxGeometry(0.07, 0.55, 0.07), tm(0.5, { rough: 0.3, metal: 0.4, glow: 0.5 }), tr, i * 0.28, 0.0, 0);
  const tline = add(new THREE.BoxGeometry(3.6, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: "#00E5FF", toneMapped: false }), FRQ, 6.3, 1.85, -0.75);

  // ---------------- camera ----------------
  const mk = (keys) => { keys.sort((a, b) => a[0] - b[0]); for (let i = 1; i < keys.length; i++) if (keys[i][0] <= keys[i - 1][0]) keys[i][0] = keys[i - 1][0] + 0.01; return track(keys); };
  const CAM = mk([
    [0, 1.2, 4.3, 11.6, 0, 0.35, 0],
    [K.s2 - 0.4, 1.9, 3.8, 10.2, 0, 0.3, 0],
    [A("s2:kawat"), 2.2, 6.6, 6.6, 0, 0.0, 0],
    [K.s3 - 0.2, 0.7, 7.0, 5.6, 0, 0.0, 0],
    [A("s3:magnet"), 0.5, 2.4, 10.6, 0, 0.95, 0],
    [K.s4 - 0.2, -0.8, 2.2, 10.0, 0, 0.95, 0],
    [A("s4:diletakkan") + 0.4, 2.0, 2.8, 8.8, 0, 0.45, 0],
    [A("s4:Namanya"), 0.8, 5.6, 4.6, 0, 0.15, 0],
    [K.s5 + 0.6, 0.3, 5.8, 4.2, 0, 0.15, 0],
    [A("s5:panas"), 1.0, 3.8, 8.4, 0, 0.8, 0],
    [K.s6 - 0.02, 1.3, 3.6, 9.2, 0, 0.8, 0],
    [K.s6, 30, 4.2, 13.6, 30, 0.35, 0],
    [A("s6:magnet"), 29.4, 3.4, 11.4, 29.2, 0.35, 0],
    [A("s6:menempel"), 27.3, 1.7, 5.6, 27.5, 0.35, 0],
    [A("s6:hangat"), 28.4, 2.8, 8.0, 28.4, 0.3, 0],
    [K.s7 - 0.02, 29.4, 3.2, 9.6, 29.4, 0.3, 0],
    [K.s7, 59.4, 1.7, 12.2, 59.8, 1.45, 0],
    [A("s7:dipatenkan"), 60.4, 1.6, 11.2, 60.6, 1.45, 0],
    [A("s7:enam") + 0.4, 65.2, 1.7, 9.6, 66.2, 1.45, 0],
    [K.s8 - 0.02, 66.6, 1.7, 9.0, 66.8, 1.35, 0],
    [K.s8, 1.6, 3.6, 9.4, 0, 0.5, 0],
    [K.end, 0, 4.6, 12.6, 0, 0.45, 0],
    [K.dur, 0, 4.8, 13.0, 0, 0.45, 0],
  ]);

  return (t) => {
    const [px, py, pz, tx, ty, tz] = CAM(t);
    cam.position.set(px + 0.05 * Math.sin(t * 0.7), py + 0.04 * Math.sin(t * 0.9 + 1), pz);
    cam.lookAt(tx, ty, tz);
    const inCmp = t >= K.s6 && t < K.s7, inFrq = t >= K.s7 && t < K.s8;
    const sx = inCmp ? 30 : inFrq ? 62 : 0;
    key.position.set(sx - 5, 10, 8); key.target.position.set(sx, 0, 0);
    rim.position.set(sx + 4, 3.5, -3);
    COOK.visible = !inCmp && !inFrq; CMP.visible = inCmp; FRQ.visible = inFrq;

    if (COOK.visible) {
      const s8 = t >= K.s8, off = s8 ? ramp(t, A("s8:Matikan"), A("s8:Matikan") + 0.5) : 0;
      // current: beads slosh back and forth along the coil (alternating current), stop when switched off
      const on = (t < K.s2 ? 1 : ramp(t, A("s2:menyala") - 0.2, A("s2:menyala") + 0.3)) * (1 - off);
      const flow = 0.012 * Math.sin(t * 2 * Math.PI * 1.1) * on;
      for (let i = 0; i < NC; i++) { const u = (((i + 0.5) / NC + flow) % 1 + 1) % 1; coilCurve.getPointAt(u, curPt); setDot(cur, i, curPt.x, 0.1 + curPt.y, curPt.z, on > 0.02 ? 1 : 0); }
      cur.instanceMatrix.needsUpdate = true;
      setT(coilM, 0.46 + 0.08 * on);
      // glass opens up (translucent) while we look at the coil
      const see = t >= K.s2 && t < A("s4:diletakkan") ? ramp(t, K.s2, A("s2:kawat")) * (1 - ramp(t, A("s3:magnet"), A("s3:magnet") + 1.2) * 0.5) : 0;
      hob.glassM.opacity = 0.88 - 0.6 * see;
      // field loops
      const fOn = (t < K.s3 ? 0 : t < K.s6 ? ramp(t, A("s3:magnet") - 0.8, A("s3:magnet")) * (t > K.s5 ? 0.55 : 1) : 0.5) * (1 - off);
      fieldM.opacity = 0.42 * fOn;
      const rev = 0.11 * Math.sin(t * 2 * Math.PI * 0.55);
      loops.forEach((c, k) => { for (let j = 0; j < LD; j++) { const u = (((j / LD + rev + k * 0.013) % 1) + 1) % 1; c.getPointAt(u, curPt); setDot(fdots, k * LD + j, curPt.x, curPt.y, curPt.z, fOn > 0.03 ? 1 : 0); } });
      fdots.instanceMatrix.needsUpdate = true;
      // pan: hot on the hob (hook), lifted away for s2-s3, placed on "diletakkan", heats in s5, cools after "Matikan"
      const tPut = A("s4:diletakkan");
      const lift = ramp(t, K.s2 - 0.2, K.s2 + 0.8) * (1 - eout((t - (tPut - 0.9)) / 0.9));
      pan.G.position.set(-5.2 * lift, 0.24 + 3.6 * lift, -1.2 * lift);
      pan.G.rotation.z = 0.25 * lift;
      let temp;
      if (t < K.s2) temp = 0.72;
      else if (t < K.s5) temp = 0.72 - 0.5 * ramp(t, K.s2, K.s2 + 1.2);
      else if (!s8) temp = 0.22 + 0.54 * ramp(t, A("s5:menghambat"), A("s5:panas") + 0.6);
      else temp = 0.76 - 0.52 * ramp(t, A("s8:Matikan"), A("s8:berhenti") + 0.8);
      setT(pan.body, temp + 0.02 * Math.sin(t * 3.1));
      setT(pan.hm, 0.3 + 0.12 * temp);
      // eddy rings spin inside the base
      const eOn = (t < K.s4 ? 0 : t < K.s6 ? ramp(t, A("s4:memancing") - 0.2, A("s4:memancing") + 0.5) : 1) * (1 - off) * (t < K.s2 ? 0 : 1) + (t < K.s2 ? 0 : 0);
      eddyM.color.copy(ironbow(0.6 + 0.15 * clamp01((temp - 0.3) * 2))).lerp(_c.set("#33e8ff"), 1 - clamp01((temp - 0.25) * 2.5));
      let n = 0;
      RINGS.forEach(([rr, cnt], ri) => { const sp = (ri % 2 ? -1 : 1) * (1.6 - ri * 0.25) * Math.sin(t * 2 * Math.PI * 0.55) * 1.2; for (let i = 0; i < cnt; i++) { const a = (i / cnt) * Math.PI * 2 + sp; setDot(eddy, n++, Math.cos(a) * rr, 0.095, Math.sin(a) * rr, eOn > 0.03 ? 0.6 + 0.4 * eOn : 0); } });
      eddy.instanceMatrix.needsUpdate = true;
      // heat shimmer above a hot pan (cool vapour alpha, never white)
      const hot = clamp01((temp - 0.5) / 0.25) * (lift < 0.05 ? 1 : 0);
      sh.material.opacity = 0.26 * hot;
      shimmer.forEach(([x, z, ph, sp], i) => { const u = (t * sp + ph) % 1; setDot(sh, i, pan.G.position.x + x + 0.08 * Math.sin(t * 2 + i), 0.9 + u * 2.0, pan.G.position.z + z, hot > 0.02 ? 1 - u * 0.6 : 0); });
      sh.instanceMatrix.needsUpdate = true;
      hob.warm.material.opacity = 0;
    }

    if (CMP.visible) {
      const ironT = 0.3 + 0.44 * ramp(t, K.s6, A("s6:besi") + 0.4);
      setT(cmpPan[0].body, ironT + 0.02 * Math.sin(t * 3));
      const coldShow = ramp(t, A("s6:aluminium") - 0.3, A("s6:aluminium") + 0.3);
      setT(cmpPan[1].body, 0.2 + 0.04 * coldShow * Math.sin(t * 2)); setT(cmpPan[2].body, 0.22 + 0.04 * coldShow * Math.sin(t * 2 + 1));
      cmpHob.forEach((h, i) => { h.glassM.opacity = 0.88; h.warm.material.opacity = 0; });
      const warm = ramp(t, A("s6:hangat") - 0.3, A("s6:hangat") + 0.8);
      cmpHob[0].warm.material.opacity = 0.55 * warm; ironbow(0.42, cmpHob[0].warm.material.color);
      // magnet: hovers in, snaps to the iron pan base on "menempel"
      const ap = eout((t - (A("s6:magnet") - 0.5)) / 0.8), sn = back(clamp01((t - A("s6:menempel") + 0.15) / 0.3), 2.2);
      const hx = -2.5 - 1.6, hy = 1.5, hz = 0.9, ex = -2.5 - 0.78, ey = 0.32, ez = 0.35;
      const bx = -2.5 - 1.2 + 0.05 * Math.sin(t * 2), by = 0.75 + 0.06 * Math.sin(t * 2.4), bz = 0.6;
      magnet.position.set(hx + (bx - hx) * ap + (ex - bx) * sn, hy + (by - hy) * ap + (ey - by) * sn, hz + (bz - hz) * ap + (ez - bz) * sn);
      magnet.rotation.set(0, 0.5 * (1 - sn), 0.3 * (1 - sn));
      magnet.visible = t > A("s6:magnet") - 0.6;
      const ring = clamp01((t - A("s6:menempel")) / 0.6);
      snapRing.position.set(ex - 0.18, ey, ez); snapRing.rotation.y = Math.PI / 2; snapRing.scale.setScalar(1 + 2.5 * ring); snapRing.material.opacity = ring > 0 && ring < 1 ? 0.8 * (1 - ring) : 0;
    }

    if (FRQ.visible) {
      const r1 = ramp(t, A("s7:lima") - 0.3, A("s7:lima") + 0.9), r2 = ramp(t, A("s7:ribu") - 0.5, A("s7:ribu") + 0.7);
      for (let i = 0; i < W1; i++) { const u = i / (W1 - 1), x = -3.1 + 6.2 * u; setDot(w1, i, x, 2.2 + 0.42 * Math.sin(u * 2.5 * 2 * Math.PI - t * 2.2), -0.8, u <= r1 ? 1 : 0); }
      for (let i = 0; i < W2; i++) { const u = i / (W2 - 1), x = -3.1 + 6.2 * u; setDot(w2, i, x, 0.6 + 0.4 * Math.sin(u * 42 * 2 * Math.PI - t * 30), -0.8, u <= r2 ? 1 : 0); }
      w1.instanceMatrix.needsUpdate = true; w2.instanceMatrix.needsUpdate = true;
      lab50.material.opacity = 0.25 + 0.75 * r1; labK.material.opacity = 0.25 + 0.75 * r2;
      const p1 = back(clamp01((t - A("s7:dipatenkan") + 0.2) / 0.45), 1.4), p2 = back(clamp01((t - A("s7:tujuh") + 0.2) / 0.45), 1.4);
      p1906.scale.setScalar(Math.max(1e-3, p1)); p1970.scale.setScalar(Math.max(1e-3, p2));
      tline.scale.x = Math.max(1e-3, ramp(t, A("s7:dipatenkan"), A("s7:tujuh")));
      const trp = back(clamp01((t - A("s7:transistor") + 0.3) / 0.5), 1.5);
      tr.scale.setScalar(Math.max(1e-3, trp)); tr.rotation.y = 0.4 + 0.15 * Math.sin(t * 0.8);
      setT(trM, 0.3 + 0.25 * ramp(t, A("s7:transistor"), A("s7:transistor") + 0.8));
    }
    comp.render();
  };
}
