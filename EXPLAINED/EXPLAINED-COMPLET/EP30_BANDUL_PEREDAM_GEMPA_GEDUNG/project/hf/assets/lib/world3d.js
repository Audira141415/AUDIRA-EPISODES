// EP30 BANDUL PEREDAM GEMPA GEDUNG (DISASTERSIM): a calm hazard-lab explainer. A sliced tower model stands on a slate
// plinth in a dark lab with a floor grid and fine dust. The front of the tower is the cut face (floor slabs, lit
// ceilings, columns); a gold ball built from 41 stacked steel plates hangs from cables near the crown, ringed by 8
// hydraulic dampers. Wind streaks cross the lab; a sway bar on the plinth uses the warning ramp (teal, yellow,
// orange, red-orange). A rhythm board beside the tower draws the building and pendulum waves.
//   s1 ball close-up        s2 wide sway + dizzy office worker   s3 floor 92 with visitors
//   s4 rhythm board         s5 tower leans, ball swings opposite  s6 dampers heat up, sway drops
//   s7 plates fan out, typhoon swirl, ball swings ~1 m           s8 calm wide, teal beacon, AUDIRA plinth
// Generic building, no logos. Sway is exaggerated for the model. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, envStrips, label } from "./lib3d.js";

const C = {
  bg: "#1a2028", slate: "#2b333d", slateL: "#3a4552", grid: "#4a5866", conc: "#d6d0c4", concD: "#a9a397", glass: "#7fb3c8",
  gold: "#d8a33a", steel: "#8f989f", teal: "#2fb8a6", yellow: "#f2c94c", orange: "#f2994a", red: "#eb5a3c",
  skin: "#e2b18c", skin2: "#b98262", cream: "#f4efe6", ink: "#11161b", warm: "#ffd9a0",
};
const SANS = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// DOCUMENTARY_WARM: neutral-warm highlights, cool lifted slate shadows, gentle S-curve, vignette done in DOM.
const Grade = { uniforms: { tDiffuse: { value: null }, storm: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float storm;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(1.05,1.0,0.93),0.5*l);c+=vec3(0.0,0.012,0.022)*(1.0-l);
  c=(c-0.5)*1.07+0.5;c=mix(c,c*vec3(0.86,0.92,1.04),storm);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// piecewise smooth envelope over [t, v] pairs (times must ascend)
function envf(P) {
  return (t) => {
    if (t <= P[0][0]) return P[0][1];
    for (let i = 1; i < P.length; i++) if (t < P[i][0]) { const [a, va] = P[i - 1], [b, vb] = P[i]; return va + (vb - va) * ramp(t, a, b); }
    return P[P.length - 1][1];
  };
}
const std = (c, r = 0.6, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...x });
const UP = new THREE.Vector3(0, 1, 0), _v = new THREE.Vector3();
function between(m, a, b) { _v.subVectors(b, a); const L = _v.length(); m.position.copy(a).addScaledVector(_v, 0.5); m.quaternion.setFromUnitVectors(UP, _v.normalize()); m.scale.set(1, Math.max(L, 1e-3), 1); }

// stylised person: head, neck, shoulders wider than waist, two-part arms and legs with bent elbows/knees
function person(shirt, pants, skin) {
  const G = new THREE.Group(), S = std(skin, 0.6), T = std(shirt, 0.7), P = std(pants, 0.75);
  const add = (geo, mat, x, y, z, p = G) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  add(new THREE.CylinderGeometry(0.2, 0.14, 0.42, 12), T, 0, 0.93, 0);
  add(new THREE.SphereGeometry(0.2, 12, 8), T, 0, 1.12, 0).scale.set(1.25, 0.45, 0.8);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8), S, 0, 1.2, 0);
  const head = add(new THREE.SphereGeometry(0.11, 16, 12), S, 0, 1.33, 0); head.scale.set(0.95, 1.1, 1);
  add(new THREE.SphereGeometry(0.115, 12, 8, 0, 6.3, 0, 1.4), std("#2a2420", 0.8), 0, 1.35, -0.01);
  const limb = (x, y, l1, l2, w, mat, bend) => {
    const a = new THREE.Group(); a.position.set(x, y, 0); G.add(a);
    add(new THREE.CylinderGeometry(w, w * 0.85, l1, 8), mat, 0, -l1 / 2, 0, a);
    const b = new THREE.Group(); b.position.y = -l1; a.add(b); b.rotation.x = bend;
    add(new THREE.CylinderGeometry(w * 0.85, w * 0.7, l2, 8), mat === T ? S : mat, 0, -l2 / 2, 0, b);
    return { a, b };
  };
  const armL = limb(-0.25, 1.13, 0.27, 0.25, 0.045, T, -0.5), armR = limb(0.25, 1.13, 0.27, 0.25, 0.045, T, -0.5);
  const legL = limb(-0.08, 0.72, 0.36, 0.36, 0.06, P, 0.12), legR = limb(0.08, 0.72, 0.36, 0.36, 0.06, P, 0.12);
  legL.a.rotation.x = -0.1; legR.a.rotation.x = -0.1;
  return { G, head, armL, armR, legL, legR };
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.bg, fog: 0.0042, exp: 1.0, bloom: [0.35, 0.5, 0.86], fov: 38 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  envStrips(r, scene, [[40, 8, "#fff1dc", 2.2, 0, 30, 30], [10, 40, "#cfe3ff", 1.0, -30, 10, 0], [10, 40, "#ffe2c0", 0.8, 30, 10, -10]], 0x0e1217);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const R = mulberry(3001);

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight("#dfe8f2", "#2a2420", 0.55));
  const key = new THREE.DirectionalLight("#ffe4c2", 2.4); key.position.set(-30, 70, 60); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -40, right: 40, top: 70, bottom: -10, near: 1, far: 200 }); key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#9fc6ff", 1.4); rim.position.set(25, 40, -50); scene.add(rim);
  const ballLight = new THREE.PointLight("#ffcf8a", 30, 14, 2); scene.add(ballLight);

  // ---------- lab floor, plinth ----------
  const gridTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = C.bg; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(120,140,160,.35)"; g.lineWidth = 2;
    for (let i = 0; i <= 16; i++) { const p = (i / 16) * w; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
    const gr = g.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,230,190,.10)"); gr.addColorStop(1, "rgba(0,0,0,.5)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), std("#ffffff", 0.85, 0, { map: gridTex })); floor.rotation.x = -Math.PI / 2; floor.position.y = -3; floor.receiveShadow = true; scene.add(floor);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 20), std(C.slate, 0.55, 0.1)); plinth.position.y = -1.5; plinth.receiveShadow = plinth.castShadow = true; scene.add(plinth);
  const plTop = new THREE.Mesh(new THREE.BoxGeometry(22.4, 0.2, 20.4), std(C.slateL, 0.4, 0.3)); plTop.position.y = 0.0; scene.add(plTop);
  const brand = label("AUDIRA LAB · MODEL PEREDAM GEDUNG", { w: 1400, h: 120, font: `700 62px ${MONO}`, color: "#e8eef3", size: 15 });
  brand.position.set(-1.5, -0.95, 10.02); scene.add(brand);
  // sway meter on the plinth front: warning ramp
  const meterBg = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 0.7), new THREE.MeshBasicMaterial({ color: "#0c1015" })); meterBg.position.set(7.6, -2.1, 10.03); scene.add(meterBg);
  const meter = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ color: C.teal, toneMapped: false })); meter.position.set(5.1, -2.1, 10.05); scene.add(meter);
  const mLab = label("GOYANG PUNCAK", { w: 512, h: 80, font: `700 46px ${MONO}`, color: "#aab6c2", size: 3.2 }); mLab.position.set(1.4, -2.1, 10.03); scene.add(mLab);
  const RAMP = [new THREE.Color(C.teal), new THREE.Color(C.yellow), new THREE.Color(C.orange), new THREE.Color(C.red)];

  // ---------- tower: podium + 8 flared segments + crown, front face cut open ----------
  const H = 62, conc = std(C.conc, 0.7), concD = std(C.concD, 0.75), glass = std(C.glass, 0.15, 0.3, { transparent: true, opacity: 0.32, depthWrite: false });
  const ceil = new THREE.MeshBasicMaterial({ color: C.warm, toneMapped: false });
  const segs = [];
  const mkSeg = (yb, h, wb, wt, nFloors) => {
    const G = new THREE.Group(); G.position.y = yb; scene.add(G);
    const back = new THREE.Mesh(new THREE.BoxGeometry((wb + wt) / 2, h, 0.3), concD); back.position.set(0, h / 2, -wt / 2); back.castShadow = back.receiveShadow = true; G.add(back);
    for (let i = 0; i <= nFloors; i++) {
      const y = (i / nFloors) * h, w = wb + (wt - wb) * (i / nFloors);
      const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, w), conc); s.position.y = y; s.castShadow = s.receiveShadow = true; G.add(s);
      if (i > 0 && i < nFloors + 1) { const l = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.04, 0.25), ceil); l.position.set(0, y - 0.1, w * 0.18); G.add(l); }
    }
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, (wb + wt) / 2), glass); side.position.set(sx * (wb + wt) / 4, h / 2, 0); side.rotation.z = -sx * Math.atan((wt - wb) / 2 / h); G.add(side);
      for (const sz of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), conc); c.position.set(sx * (wb + wt) / 4, h / 2, sz * (wb + wt) / 4); c.rotation.z = -sx * Math.atan((wt - wb) / 2 / h); c.castShadow = true; G.add(c); }
    }
    segs.push({ G, yc: yb + h / 2, yb });
    return G;
  };
  mkSeg(0, 6, 12, 10.5, 4);
  for (let i = 0; i < 8; i++) mkSeg(6 + i * 6, 6, 7.2, 8.4, 4);
  const crown = mkSeg(54, 8, 6.4, 4.4, 3);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 6, 8), std(C.steel, 0.3, 0.9)); spire.position.y = 11; crown.add(spire);
  const segLab = label("LANTAI 92", { w: 512, h: 110, font: `700 60px ${SANS}`, color: C.cream, bg: "rgba(17,22,27,.85)", size: 3.6 });
  scene.add(segLab);

  // ---------- the ball: 41 welded plates, cables, 8 hydraulic dampers ----------
  const RB = 1.65, L = 4.6, PIV = 57.6, NPL = 41;
  const ball = new THREE.Group(); scene.add(ball);
  const goldM = std(C.gold, 0.32, 0.92), seamM = std("#8c6420", 0.5, 0.9);
  const plates = [];
  for (let j = 0; j < NPL; j++) {
    const y = -RB + ((j + 0.5) * 2 * RB) / NPL, rr = Math.sqrt(Math.max(0.02, RB * RB - y * y)), th = (2 * RB) / NPL;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, th * 0.9, 48), goldM); p.position.y = y; p.castShadow = true; ball.add(p);
    const seam = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.012, 4, 48), seamM); seam.rotation.x = Math.PI / 2; seam.position.y = th * 0.47; p.add(seam);
    plates.push({ p, y });
  }
  const dimLine = new THREE.Mesh(new THREE.BoxGeometry(2 * RB, 0.04, 0.04), new THREE.MeshBasicMaterial({ color: C.cream, toneMapped: false })); scene.add(dimLine);
  const dimLab = label("Ø 5,5 m", { w: 512, h: 128, font: `700 80px ${SANS}`, color: C.cream, size: 2.0 }); scene.add(dimLab);
  const plLab = label("41 LEMPENG BAJA", { w: 700, h: 110, font: `700 60px ${SANS}`, color: "#11161b", bg: C.yellow, size: 3.2 }); scene.add(plLab);
  const cableM = std("#3b4148", 0.4, 0.8), cables = [];
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), cableM); scene.add(c); cables.push(c); }
  const damperM = std("#5b646d", 0.35, 0.85, { emissive: new THREE.Color(C.orange), emissiveIntensity: 0 }), rodM = std("#c9d0d6", 0.2, 1);
  const dampers = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1, 10), damperM), rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 8), rodM);
    bar.castShadow = true; scene.add(bar); scene.add(rod); dampers.push({ a, bar, rod });
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.14, 8, 40), std(C.steel, 0.35, 0.85)); ring.rotation.x = Math.PI / 2; scene.add(ring);

  // ---------- people ----------
  const worker = person("#4f7fa8", "#2f3640", C.skin); worker.G.scale.setScalar(1.0); scene.add(worker.G);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.6), std("#8a6a4e", 0.6)); scene.add(desk);
  const visitors = [person("#c0573f", "#3b3f46", C.skin), person("#3e8f75", "#2a2f36", C.skin2), person("#e0b54a", "#4a4f57", C.skin)];
  visitors.forEach((v) => { v.G.scale.setScalar(1.0); scene.add(v.G); });
  const rail = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.04, 6, 48), std(C.steel, 0.3, 0.9)); rail.rotation.x = Math.PI / 2; scene.add(rail);

  // ---------- rhythm board (s4) ----------
  const board = new THREE.Group(); board.position.set(18.5, 31, 0); scene.add(board);
  const bd = new THREE.Mesh(new THREE.BoxGeometry(15, 11, 0.3), std("#141a20", 0.6, 0.2)); board.add(bd);
  const bdFrame = new THREE.Mesh(new THREE.BoxGeometry(15.4, 11.4, 0.2), std(C.slateL, 0.5, 0.4)); bdFrame.position.z = -0.1; board.add(bdFrame);
  const NW = 160, mkWave = (col) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NW * 3), 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, toneMapped: false, transparent: true })); l.frustumCulled = false; board.add(l); return l; };
  const wB = mkWave(C.teal), wP = mkWave(C.yellow);
  const lb1 = label("IRAMA GEDUNG", { w: 600, h: 100, font: `700 56px ${SANS}`, color: C.teal, size: 4.6 }); lb1.position.set(-3.6, 4.4, 0.2); board.add(lb1);
  const lb2 = label("IRAMA BANDUL", { w: 600, h: 100, font: `700 56px ${SANS}`, color: C.yellow, size: 4.6 }); lb2.position.set(-3.6, -4.4, 0.2); board.add(lb2);

  // ---------- wind streaks + typhoon swirl, lab dust ----------
  const NWS = 420, wpos = new Float32Array(NWS * 6), wseed = [];
  for (let i = 0; i < NWS; i++) wseed.push([R(), 2 + R() * 62, (R() - 0.5) * 24, 0.6 + R() * 0.8, R()]);
  const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.BufferAttribute(wpos, 3));
  const wind = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: "#cfe6f5", transparent: true, opacity: 0.5, depthWrite: false })); wind.frustumCulled = false; scene.add(wind);
  const ND = 160, dpos = new Float32Array(ND * 3), dseed = [];
  for (let i = 0; i < ND; i++) dseed.push([(R() - 0.5) * 60, R() * 66, 6 + R() * 26, R()]);
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: "#ffe9c9", size: 0.12, transparent: true, opacity: 0.5, depthWrite: false })); dust.frustumCulled = false; scene.add(dust);

  // ---------- timing ----------
  const S = envf([[0, 0.35], [K.s2, 0.4], [A("s2:kencang"), 1.1], [A("s2:meter"), 1.6], [A("s2:mual"), 1.4], [K.s3, 0.8], [K.s4, 0.55], [A("s4:mendorong"), 0.6], [A("s4:besar"), 1.8],
    [A("s4:diatur"), 1.2], [K.s5, 1.35], [K.s6, 1.3], [A("s6:berkurang"), 1.3], [A("s6:persen"), 0.8], [K.s7, 0.5], [A("s7:topan"), 0.7], [A("s7:berayun"), 1.5], [K.s7e, 1.1], [K.s8, 0.6], [A("s8:tenang"), 0.22], [K.dur, 0.22]]);
  const windAmt = envf([[0, 0.55], [K.s2, 0.6], [A("s2:kencang"), 1], [K.s3, 0.5], [K.s4, 0.4], [A("s4:mendorong"), 1], [K.s5, 0.6], [K.s6, 0.35], [K.s7, 0.3], [A("s7:topan"), 1], [K.s8, 0.4], [A("s8:tenang"), 0.12], [K.dur, 0.12]]);
  const storm = (t) => ramp(t, A("s7:topan") - 0.4, A("s7:topan") + 0.6) * (1 - ramp(t, K.s7e - 0.5, K.s8 + 0.6));
  const W = (2 * Math.PI) / 3.0;
  const swayX = (t, y) => S(t) * Math.sin(W * t) * (y / H) * (y / H);
  const tiltZ = (t, y) => -2 * S(t) * Math.sin(W * t) * y / (H * H);
  const heat = (t) => ramp(t, A("s6:hidrolik") - 0.3, A("s6:hidrolik") + 0.5) * (1 - ramp(t, K.s7, K.s7 + 1.2));
  const explode = (t) => ramp(t, A("s7:lempeng") - 0.2, A("s7:lempeng") + 0.8) * (1 - ramp(t, A("s7:Tanggal") - 0.2, A("s7:Tanggal") + 0.9));
  const boardOn = (t) => ramp(t, K.s4 - 0.6, K.s4 + 0.4) * (1 - ramp(t, K.s5 - 0.2, K.s5 + 0.6));
  const tuned = (t) => ramp(t, A("s4:diatur") - 0.2, A("s4:diatur") + 1.4);
  const dimOn = (t) => ramp(t, A("s7:diameter") - 0.2, A("s7:diameter") + 0.4) * (1 - ramp(t, A("s7:Tanggal") - 0.2, A("s7:Tanggal") + 0.4));
  const lab92 = (t) => ramp(t, A("s3:sembilan") - 0.3, A("s3:sembilan") + 0.3) * (1 - ramp(t, K.s4 - 0.6, K.s4));

  const camT = track([
    [0, 3.4, 52.8, 13.2, 0, 52.4, 0],
    [A("s1:angin"), 5.2, 53.6, 16.5, 0, 52.6, 0],
    [K.s2 + 1.8, 2, 36, 104, 0, 31, 0],
    [A("s2:kencang") + 0.6, -2, 33, 98, 0, 31, 0],
    [A("s2:mual") - 0.1, 2.8, 29.9, 9.5, 0.2, 29.4, 0],
    [K.s2e, 2.2, 29.7, 7.6, 0.2, 29.3, 0],
    [A("s3:tertala") + 0.4, 9, 51, 25, 0, 50.6, 0],
    [A("s3:pengunjung"), 6.5, 50.2, 15.5, 0, 50.0, 0],
    [K.s4 + 1.2, 10, 33, 98, 9, 32, 0],
    [K.s4e - 0.3, 8, 32, 90, 9, 32, 0],
    [K.s5 + 0.5, 0, 48.5, 44, 0, 47.5, 0],
    [K.s5e - 0.2, -3, 49, 39, 0, 48, 0],
    [A("s6:hidrolik"), -7, 49.6, 14.5, 0, 49.8, 0],
    [A("s6:Hasilnya"), -4.5, 50.5, 21, 0, 50, 0],
    [K.s7 + 0.4, 4, 52, 12.5, 0, 51.8, 0],
    [A("s7:Tanggal") + 0.2, 6, 51.6, 15.5, 0, 51.6, 0],
    [A("s7:topan") + 0.7, 0, 42, 90, 0, 38, 0],
    [K.s7e, 1, 44, 74, 0, 42, 0],
    [A("s8:bandul"), -16, 14, 106, 0, 30, 0],
    [K.dur, -10, 10, 98, 0, 30, 0],
  ]);
  const look = new THREE.Vector3(), a3 = new THREE.Vector3(), b3 = new THREE.Vector3(), piv = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    const hx = 0.25 * Math.sin(t * 0.37) + 0.15 * Math.sin(t * 0.83), hy = 0.18 * Math.sin(t * 0.29 + 1);
    cam.position.set(c[0] + hx, c[1] + hy, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // tower sway
    for (const s of segs) { s.G.position.x = swayX(t, s.yb); s.G.rotation.z = tiltZ(t, s.yc); }
    const sw = S(t) * Math.sin(W * t);
    // ball: pendulum hangs from the crown and lags the tower (anti-phase)
    piv.set(swayX(t, PIV), PIV, 0);
    const drel = -1.3 * sw * (PIV / H) * (PIV / H) - 0.35 * storm(t) * Math.sin(W * t * 0.8);
    const phi = Math.asin(Math.max(-0.9, Math.min(0.9, drel / L)));
    const bx = piv.x + L * Math.sin(phi), by = PIV - L * Math.cos(phi);
    ball.position.set(bx, by, 0); ball.rotation.z = phi;
    ballLight.position.set(bx + 2.2, by + 1.5, 3.5);
    const ex = explode(t);
    for (const pl of plates) pl.p.position.y = pl.y * (1 + ex * 1.15);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      a3.set(piv.x + Math.cos(a) * 1.2, PIV + 0.2, Math.sin(a) * 1.2);
      b3.set(bx + Math.cos(a) * 0.9, by + RB * 0.75, Math.sin(a) * 0.9);
      between(cables[i], a3, b3);
    }
    const frameX = swayX(t, 48.3), floorY = 48.3;
    ring.position.set(frameX, floorY + 0.9, 0);
    const vel = Math.abs(Math.cos(W * t));
    damperM.emissiveIntensity = heat(t) * (0.4 + 1.6 * vel);
    for (const d of dampers) {
      a3.set(frameX + Math.cos(d.a) * 3.3, floorY + 0.9, Math.sin(d.a) * 3.3);
      b3.set(bx + Math.cos(d.a) * RB * 0.8, by - RB * 0.35, Math.sin(d.a) * RB * 0.8);
      const mid = a3.clone().lerp(b3, 0.55);
      between(d.bar, a3, mid); between(d.rod, mid, b3);
    }
    const dOn = dimOn(t);
    dimLine.visible = dimLab.visible = plLab.visible = dOn > 0.01 || ex > 0.01;
    dimLine.position.set(bx, by, RB + 0.6); dimLine.scale.x = Math.max(0.01, dOn);
    dimLab.position.set(bx, by - 0.55, RB + 0.6); dimLab.material.opacity = dOn;
    plLab.position.set(bx, by + RB * 2.4, 1.5); plLab.material.opacity = ex;

    // floor-92 label and people
    const l92 = lab92(t); segLab.visible = l92 > 0.01; segLab.material.opacity = l92; segLab.position.set(swayX(t, 52) - 6.4, 52.4, 3.2);
    const wy = 28.5 + 0.08;
    worker.G.position.set(swayX(t, wy) + 0.3, wy, 1.2); worker.G.rotation.set(0, -0.35, tiltZ(t, wy) + 0.06 * Math.sin(t * 2.1) * ramp(t, A("s2:orang") - 0.5, A("s2:mual")));
    worker.armR.a.rotation.set(-2.5 * ramp(t, A("s2:mual") - 0.6, A("s2:mual")), 0, 0.3); worker.armR.b.rotation.x = -1.6;
    worker.head.rotation.z = 0.2 * Math.sin(t * 2.1) * ramp(t, A("s2:orang"), A("s2:mual"));
    desk.position.set(swayX(t, wy) - 0.6, wy + 0.75, 0.4);
    const vy = 48.3 + 0.08;
    visitors.forEach((v, i) => {
      const a = [-0.6, 0.15, 0.85][i] + Math.PI / 2;
      v.G.position.set(swayX(t, vy) + Math.cos(a) * 4.4, vy, Math.sin(a) * 4.4);
      v.G.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
      v.armR.a.rotation.x = i === 1 ? -1.3 * ramp(t, A("s3:pengunjung"), A("s3:pengunjung") + 0.6) : 0;
      v.armR.b.rotation.x = i === 1 ? -0.3 : -0.5;
    });
    rail.position.set(swayX(t, vy + 1), vy + 1.0, 0);

    // rhythm board
    const bo = boardOn(t); board.visible = bo > 0.01; board.scale.setScalar(0.6 + 0.4 * eout(bo));
    const fb = 1.0, fp = 1.65 + (1.0 - 1.65) * tuned(t);
    const pb = wB.geometry.attributes.position.array, pp = wP.geometry.attributes.position.array;
    for (let i = 0; i < NW; i++) {
      const x = -6.6 + (13.2 * i) / (NW - 1), u = x * 0.9 - t * 2.2;
      pb[i * 3] = x; pb[i * 3 + 1] = 1.6 + 1.3 * Math.sin(u * fb); pb[i * 3 + 2] = 0.2;
      pp[i * 3] = x; pp[i * 3 + 1] = -1.8 - 1.3 * Math.sin(u * fp); pp[i * 3 + 2] = 0.2;
    }
    wB.geometry.attributes.position.needsUpdate = wP.geometry.attributes.position.needsUpdate = true;
    wB.material.opacity = wP.material.opacity = bo;

    // sway meter (warning ramp)
    const lvl = clamp01(Math.abs(S(t)) / 1.8), mw = 0.15 + 4.9 * lvl;
    meter.scale.x = mw; meter.position.x = 4.95 + mw / 2;
    const k = lvl * 3, i0 = Math.min(2, Math.floor(k)); meter.material.color.copy(RAMP[i0]).lerp(RAMP[i0 + 1], k - i0);

    // wind streaks, typhoon swirl
    const wa = windAmt(t), st = storm(t);
    for (let i = 0; i < NWS; i++) {
      const [ph, y, z, sp, q] = wseed[i];
      const x = -45 + (((ph * 90 + t * 26 * sp) % 90) + 90) % 90;
      let x0 = x, y0 = y, z0 = z, x1 = x + 2.2 * sp, y1 = y, z1 = z;
      if (st > 0) {
        const ang = q * 6.283 + t * (0.5 + sp * 0.4), rad = 14 + q * 34, cy = 46 + (y - 34) * 0.5;
        const sx = Math.cos(ang) * rad, sz = -20 + Math.sin(ang) * rad * 0.5, sx2 = Math.cos(ang + 0.08) * rad, sz2 = -20 + Math.sin(ang + 0.08) * rad * 0.5;
        x0 += (sx - x0) * st; y0 += (cy - y0) * st; z0 += (sz - z0) * st; x1 += (sx2 - x1) * st; y1 += (cy - y1) * st; z1 += (sz2 - z1) * st;
      }
      const vis = q < wa ? 1 : 0;
      wpos[i * 6] = x0; wpos[i * 6 + 1] = vis ? y0 : -50; wpos[i * 6 + 2] = z0; wpos[i * 6 + 3] = x1; wpos[i * 6 + 4] = vis ? y1 : -50; wpos[i * 6 + 5] = z1;
    }
    wg.attributes.position.needsUpdate = true; wind.material.opacity = 0.22 + 0.3 * wa;
    for (let i = 0; i < ND; i++) {
      const [x, y, z, q] = dseed[i];
      dpos[i * 3] = x + Math.sin(t * 0.2 + q * 9) * 1.5; dpos[i * 3 + 1] = y + Math.sin(t * 0.15 + q * 5) * 1.2; dpos[i * 3 + 2] = z;
    }
    dg.attributes.position.needsUpdate = true;

    gradeP.uniforms.storm.value = 0.6 * st;
    key.intensity = 2.4 - 0.9 * st;
    bp.strength = 0.35 + 0.25 * heat(t);
    comp.render();
  };
}
