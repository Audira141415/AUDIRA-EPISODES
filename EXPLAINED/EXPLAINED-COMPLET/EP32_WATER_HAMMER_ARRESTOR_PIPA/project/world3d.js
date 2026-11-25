// EP32 WATER HAMMER ARRESTOR PIPA (INFLATABLE): a candy studio sweep (pink floor, deeper lilac wall) with glossy
// vinyl toys. A fat translucent turquoise pipe comes down the wall as a riser, turns, and runs to a red valve block at
// a puffy washing machine. Water is a stream of blue vinyl beads. When the valve slams, the beads jam, the pipe
// jolts, and a bulge (the pressure wave) runs up the pipe and bounces between valve and riser top. A puffy gauge
// reads the pressure. The arrestor is a clear tube above the pipe: orange piston with black rubber rings under a
// sealed white air pillow that squashes and springs. Things inflate (underdamped spring), then bounce and squash.
//   s1 DUG cloud + ghost toy, slam        s2 wide flow + a toy train for momentum     s3 valve slams, beads jam
//   s4 gauge spikes, bulge runs up         s5 bulge bounces, joints flash               s6 arrestor inflates, piston + air spring
//   s7 plain air pocket dissolves, gauge to 14     s8 ruler 10 cm, AUDIRA balloon letters
// Generic products, no logos. Every value is a pure function of t (flow displacement is a fixed lookup table of t).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, envStrips, label } from "./lib3d.js";

const C = {
  bg: "#e9b6cf", floor: "#f6bfd3", wall: "#c3a6ee", pipe: "#3fd3c6", water: "#2f7cf0", waterL: "#7fb6ff", valve: "#ff4a5e",
  machine: "#fff4f8", orange: "#ff9a2e", ring: "#1c1c22", air: "#ffffff", yellow: "#ffd23f", mint: "#5fe0a8", violet: "#8b5cf6", ink: "#3a1d4a",
};
const SANS = "'Arial Black', Arial, Helvetica, sans-serif";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// INFLATABLE grade: S-curve + saturation so the pastel set keeps a tonal range (vignette lives in the DOM).
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(vec3(l),c,1.12);c=c*c*(3.0-2.0*c)*0.35+c*0.65;c=(c-0.5)*1.05+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function envf(P) {
  return (t) => {
    if (t <= P[0][0]) return P[0][1];
    for (let i = 1; i < P.length; i++) if (t < P[i][0]) { const [a, va] = P[i - 1], [b, vb] = P[i]; return va + (vb - va) * ramp(t, a, b); }
    return P[P.length - 1][1];
  };
}
const vinyl = (c, x = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.3, sheenColor: new THREE.Color("#ffffff"), ...x });
// air, then gravity: underdamped spring 0 -> 1 (rushes in, overshoots, settles)
const inflate = (t, t0, k = 6, w = 13) => (t <= t0 ? 0 : 1 - Math.exp(-k * (t - t0)) * Math.cos(w * (t - t0)));
const UP = new THREE.Vector3(0, 1, 0), _v = new THREE.Vector3();
function between(m, a, b) { _v.subVectors(b, a); const L = _v.length(); m.position.copy(a).addScaledVector(_v, 0.5); m.quaternion.setFromUnitVectors(UP, _v.normalize()); return L; }
function puffyBox(w, h, d, r, mat) {
  const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r, q = Math.min(W, H) * 0.25;
  s.moveTo(x + q, y); s.lineTo(x + W - q, y); s.quadraticCurveTo(x + W, y, x + W, y + q); s.lineTo(x + W, y + H - q); s.quadraticCurveTo(x + W, y + H, x + W - q, y + H);
  s.lineTo(x + q, y + H); s.quadraticCurveTo(x, y + H, x, y + H - q); s.lineTo(x, y + q); s.quadraticCurveTo(x, y, x + q, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.01, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 8, curveSegments: 16 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
// balloon letters from fat capsule strokes (1.4-tall box, baseline 0)
const GLYPHS = {
  A: [[[0, 0], [0.45, 1.4]], [[0.45, 1.4], [0.9, 0]], [[0.22, 0.55], [0.68, 0.55]]],
  U: [[[0, 1.4], [0, 0.42], [0.18, 0.08], [0.45, 0], [0.72, 0.08], [0.9, 0.42], [0.9, 1.4]]],
  D: [[[0, 0], [0, 1.4]], [[0, 1.4], [0.45, 1.35], [0.8, 1.06], [0.9, 0.7], [0.8, 0.34], [0.45, 0.05], [0, 0]]],
  I: [[[0.2, 0], [0.2, 1.4]]],
  R: [[[0, 0], [0, 1.4]], [[0, 1.4], [0.55, 1.38], [0.82, 1.2], [0.82, 0.9], [0.55, 0.72], [0, 0.72]], [[0.38, 0.72], [0.88, 0]]],
};
function balloonLetter(ch, mat, rad = 0.15) {
  const G = new THREE.Group(), a = new THREE.Vector3(), b = new THREE.Vector3();
  for (const stroke of GLYPHS[ch]) for (let i = 1; i < stroke.length; i++) {
    a.set(stroke[i - 1][0], stroke[i - 1][1], 0); b.set(stroke[i][0], stroke[i][1], 0);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(rad, Math.max(0.01, a.distanceTo(b)), 6, 14), mat); between(m, a, b); m.castShadow = true; G.add(m);
  }
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.bg, fog: 0.004, exp: 1.05, bloom: [0.18, 0.4, 0.92], fov: 38 });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  envStrips(r, scene, [[24, 10, "#ffffff", 2.4, -10, 26, 24], [12, 30, "#ffe6f2", 1.4, 28, 10, 10], [40, 6, "#e6dcff", 1.0, 0, 30, -20]], 0x8a6f9a);
  scene.environmentIntensity = 0.9;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const R = mulberry(3201);

  // ---------- light: strong key up front, rim from behind, soft fill ----------
  scene.add(new THREE.HemisphereLight("#fff0f6", "#b07aa0", 0.6));
  const key = new THREE.DirectionalLight("#fff6ee", 2.6); key.position.set(-14, 30, 26); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -6, near: 1, far: 90 }); key.shadow.bias = -0.0006; key.shadow.radius = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#c9b6ff", 1.6); rim.position.set(12, 18, -20); scene.add(rim);

  // ---------- sweep ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(220, 120), new THREE.MeshStandardMaterial({ color: C.floor, roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.position.z = 50; floor.receiveShadow = true; scene.add(floor);
  const cove = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 220, 24, 1, true, Math.PI, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#dcaee0", roughness: 0.6, side: THREE.BackSide }));
  cove.rotation.z = Math.PI / 2; cove.position.set(0, 6, -4); cove.receiveShadow = true; scene.add(cove);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(220, 80), new THREE.MeshStandardMaterial({ color: C.wall, roughness: 0.6 })); wall.position.set(0, 46, -10); wall.receiveShadow = true; scene.add(wall);

  // ---------- pipe path: valve end s=0 at (-6,4) -> elbow (4,4) -> riser top (4,22) ----------
  const LP = 28, PZ = -2.2;
  const pathAt = (s, out) => { s = Math.max(0, Math.min(LP, s)); if (s <= 10) out.set(-6 + s, 4, PZ); else out.set(4, 4 + (s - 10), PZ); return out; };
  const pipeM = vinyl(C.pipe, { transparent: true, opacity: 0.42, depthWrite: false, roughness: 0.18 });
  const NRG = 58, rings = [];
  for (let i = 0; i < NRG; i++) {
    const s = (i + 0.5) * (LP / NRG), m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, LP / NRG + 0.02, 28, 1, true), pipeM);
    const p = pathAt(s, new THREE.Vector3()); m.position.copy(p); if (s <= 10) m.rotation.z = Math.PI / 2; scene.add(m); rings.push({ m, s });
  }
  const jointM = vinyl(C.violet, { emissive: new THREE.Color("#ff2244"), emissiveIntensity: 0 });
  const joints = [0.6, 10, 20].map((s) => { const j = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.32, 14, 28), jointM); const p = pathAt(s, new THREE.Vector3()); j.position.copy(p); if (s <= 10) j.rotation.y = Math.PI / 2; else j.rotation.x = Math.PI / 2; j.castShadow = true; scene.add(j); return { j, s, p: p.clone() }; });
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 16), vinyl(C.violet)); elbow.position.set(4, 4, PZ); scene.add(elbow);
  const topPlate = puffyBox(5, 2.4, 1.6, 0.5, vinyl(C.yellow)); topPlate.position.set(4, 23, PZ); scene.add(topPlate);
  for (const y of [9, 16]) { const c = puffyBox(2.8, 0.8, 1.2, 0.3, vinyl(C.mint)); c.position.set(4, y, PZ - 0.6); scene.add(c); }

  // ---------- washing machine + valve ----------
  const mach = new THREE.Group(); mach.position.set(-12, 0, -1.2); scene.add(mach);
  const mBody = puffyBox(8, 9, 7, 1.2, vinyl(C.machine)); mBody.position.y = 4.6; mach.add(mBody);
  const door = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.45, 16, 40), vinyl("#d9d2e8")); door.position.set(0, 4.0, 3.55); mach.add(door);
  const port = new THREE.Mesh(new THREE.CircleGeometry(2.1, 36), vinyl("#6aa8ff", { transparent: true, opacity: 0.8 })); port.position.set(0, 4.0, 3.6); mach.add(port);
  const panel = puffyBox(7, 1.6, 0.8, 0.3, vinyl("#ffd6e6")); panel.position.set(0, 8.2, 3.2); mach.add(panel);
  const brand = label("AUDIRA", { w: 512, h: 128, font: `900 96px ${SANS}`, color: C.ink, size: 3.4 }); brand.position.set(-1.0, 8.2, 3.62); mach.add(brand);
  for (let k = 0; k < 2; k++) { const kb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), vinyl(k ? C.yellow : C.mint)); kb.position.set(2.2 + k * 1.2, 8.2, 3.7); mach.add(kb); }
  const valve = puffyBox(2.2, 3.0, 2.6, 0.6, vinyl(C.valve)); valve.position.set(-6.7, 4, PZ); scene.add(valve);
  const gate = puffyBox(0.7, 2.4, 2.0, 0.3, vinyl("#ffd0d6")); scene.add(gate);

  // ---------- water beads ----------
  const NB = 150, beadGeo = new THREE.SphereGeometry(0.42, 16, 12), beadM = vinyl(C.water, { emissive: new THREE.Color("#1a3f9a"), emissiveIntensity: 0.25 });
  const beads = new THREE.InstancedMesh(beadGeo, beadM, NB); beads.frustumCulled = false; beads.castShadow = true; scene.add(beads);
  const bseed = []; for (let i = 0; i < NB; i++) bseed.push([(i / NB) * LP, (R() - 0.5) * 0.9, (R() - 0.5) * 0.9, 0.8 + R() * 0.35]);
  const dum = new THREE.Object3D();

  // ---------- gauge ----------
  const gauge = new THREE.Group(); gauge.position.set(1.2, 7.6, PZ + 0.4); scene.add(gauge);
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.6, 16), vinyl(C.violet)); stub.position.y = -1.9; gauge.add(stub);
  const gBody = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.45, 16, 40), vinyl(C.yellow)); gauge.add(gBody);
  const faceTex = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#fffaf2"; g.beginPath(); g.arc(w / 2, w / 2, w / 2, 0, 7); g.fill();
    g.strokeStyle = "#ff4a5e"; g.lineWidth = 34; g.beginPath(); g.arc(w / 2, w / 2, 196, (-225 + 270 * (10 / 16)) * Math.PI / 180, 45 * Math.PI / 180); g.stroke();
    g.fillStyle = C.ink; g.font = `900 46px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle";
    for (let v = 0; v <= 16; v += 2) { const a = (-225 + 270 * (v / 16)) * Math.PI / 180; g.fillText(String(v), w / 2 + Math.cos(a) * 150, w / 2 + Math.sin(a) * 150); }
    g.font = `900 40px ${SANS}`; g.fillText("BAR", w / 2, w / 2 + 120);
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.72, 40), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.4 })); face.position.z = 0.05; gauge.add(face);
  const needle = new THREE.Group(); needle.position.z = 0.15; gauge.add(needle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.35, 0.08), new THREE.MeshStandardMaterial({ color: C.ink })); nd.position.y = 0.6; needle.add(nd);
  const hubN = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), vinyl(C.valve)); hubN.position.z = 0.15; gauge.add(hubN);

  // ---------- arrestor (and a plain air chamber for s7) ----------
  const AX = -3.6, AY0 = 5.0, AY1 = 11.6;
  const arr = new THREE.Group(); arr.position.set(AX, 0, PZ); scene.add(arr);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, AY1 - AY0, 32, 1, true), vinyl("#e9f6ff", { transparent: true, opacity: 0.32, depthWrite: false, roughness: 0.1 })); tube.position.y = (AY0 + AY1) / 2; arr.add(tube);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.08, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), vinyl(C.orange)); cap.position.y = AY1; arr.add(cap);
  const capRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.18, 10, 32), vinyl(C.orange)); capRing.rotation.x = Math.PI / 2; capRing.position.y = AY1; arr.add(capRing);
  const piston = new THREE.Group(); arr.add(piston);
  const pd = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.7, 28), vinyl(C.orange)); piston.add(pd);
  for (const y of [-0.17, 0.17]) { const o = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.09, 8, 28), vinyl(C.ring, { roughness: 0.5 })); o.rotation.x = Math.PI / 2; o.position.y = y; piston.add(o); }
  const pillow = new THREE.Mesh(new THREE.SphereGeometry(0.85, 28, 18), vinyl(C.air, { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.08 })); arr.add(pillow);
  const awater = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 1, 24), vinyl(C.waterL, { transparent: true, opacity: 0.7 })); arr.add(awater);
  const sealTag = label("TERSEGEL", { w: 512, h: 120, font: `900 70px ${SANS}`, color: "#ffffff", bg: C.ink, size: 2.6 }); sealTag.position.set(2.6, AY1 - 0.2, 0.6); arr.add(sealTag);
  const plain = new THREE.Group(); plain.position.set(AX, 0, PZ); scene.add(plain);
  const pTube = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, AY1 - AY0, 32, 1, true), vinyl("#e9f6ff", { transparent: true, opacity: 0.32, depthWrite: false })); pTube.position.y = (AY0 + AY1) / 2; plain.add(pTube);
  const pCap = new THREE.Mesh(new THREE.SphereGeometry(1.0, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), vinyl("#bfb3d6")); pCap.position.y = AY1; plain.add(pCap);
  const pAir = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16), vinyl("#ffffff", { transparent: true, opacity: 0.85 })); plain.add(pAir);
  const pWater = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 1, 24), vinyl(C.waterL, { transparent: true, opacity: 0.7 })); plain.add(pWater);
  const NBu = 26, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 10, 8), vinyl("#ffffff"), NBu); bub.frustumCulled = false; plain.add(bub);
  const buSeed = []; for (let i = 0; i < NBu; i++) buSeed.push([(R() - 0.5) * 1.2, (R() - 0.5) * 1.2, R()]);
  const ruler = puffyBox(0.9, AY1 - AY0 + 1.1, 0.5, 0.2, vinyl(C.yellow)); scene.add(ruler);
  const rulerLab = label("± 10 cm", { w: 512, h: 128, font: `900 84px ${SANS}`, color: C.ink, size: 3.0 }); scene.add(rulerLab);

  // ---------- hook toys: DUG cloud, ghost; s2 train; s8 balloon letters ----------
  const cloudS = new THREE.Shape(); cloudS.absarc(0, 0, 1.4, 0, Math.PI * 2);
  const cloud = new THREE.Group(); scene.add(cloud);
  for (const [x, y, rr] of [[-1.6, 0, 1.3], [0, 0.5, 1.7], [1.7, 0, 1.3], [0.4, -0.7, 1.3], [-0.9, -0.6, 1.1]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 20, 14), vinyl(C.yellow)); b.position.set(x, y, 0); b.scale.z = 0.55; cloud.add(b); }
  const dug = label("DUG!", { w: 512, h: 200, font: `900 170px ${SANS}`, color: C.ink, size: 3.8 }); dug.position.z = 1.0; cloud.add(dug);
  const ghost = new THREE.Group(); scene.add(ghost);
  const gM = vinyl("#ffffff");
  const gh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 18), gM); gh.position.y = 1.4; ghost.add(gh);
  const gb = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 1.6, 24), gM); gb.position.y = 0.5; ghost.add(gb);
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2, l = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), gM); l.position.set(Math.cos(a) * 1.15, -0.3, Math.sin(a) * 1.15); ghost.add(l); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshStandardMaterial({ color: C.ink })); e.position.set(s * 0.45, 1.6, 1.18); e.scale.set(1, 1.4, 0.5); ghost.add(e); }
  const no = label("BUKAN", { w: 512, h: 128, font: `900 90px ${SANS}`, color: "#ffffff", bg: C.valve, size: 2.6 }); no.position.set(0, 3.3, 0.6); ghost.add(no);
  const train = new THREE.Group(); scene.add(train);
  for (let k = 0; k < 3; k++) {
    const car = puffyBox(3.2, 2.2, 2.2, 0.6, vinyl(k === 0 ? C.water : C.waterL)); car.position.set(k * 3.6, 1.8, 0); train.add(car);
    for (const x of [-1, 1]) for (const z of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.22, 10, 20), vinyl(C.ink, { roughness: 0.5 })); w.position.set(k * 3.6 + x, 0.62, z * 1.15); train.add(w); }
  }
  const chim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.2, 16), vinyl(C.valve)); chim.position.set(-0.6, 3.4, 0); train.add(chim);
  const letters = [];
  const lCols = [C.valve, C.orange, C.yellow, C.mint, C.water, C.violet];
  "AUDIRA".split("").forEach((ch, i) => {
    const L = balloonLetter(ch, vinyl(lCols[i]), 0.17); const holder = new THREE.Group(); holder.add(L); L.position.x = -0.45;
    holder.position.set(9 + i * 2.6, 0.02, 4 - i * 1.6); holder.rotation.y = -0.55; scene.add(holder); letters.push(holder);
  });

  // ---------- timing ----------
  const T_slam = [A("s1:dug"), A("s3:menutup") + 0.2, A("s6:mendadak"), A("s7:seketika")];
  const T_open = [K.s2 - 0.4, K.s6 + 0.6, K.s7 + 0.2, K.dur + 10];
  const closed = (t) => { for (let i = 0; i < 4; i++) if (t >= T_slam[i] && t < T_open[i]) return 1; return 0; };
  // flow speed (units/s): ramps up gently, stops in 0.08 s at each slam; D(t) is its integral in a fixed table
  const speed = (t) => {
    let v = 6;
    for (let i = 0; i < 4; i++) { const a = T_slam[i], b = T_open[i]; if (t >= a && t < b) v = 0; else if (t >= a - 0.08 && t < a) v = 6 * (a - t) / 0.08; else if (t >= b && t < b + 0.8) v = 6 * ramp(t, b, b + 0.8); }
    if (t > A("s7:melaju") - 1 && t < A("s7:seketika")) v = Math.min(v, 3);
    if (t >= K.s4 && t < K.s6) v = 0;
    return v;
  };
  const DT = 1 / 240, NT = Math.ceil((K.dur + 1) / DT), Dtab = new Float32Array(NT + 1);
  for (let k = 1; k <= NT; k++) Dtab[k] = Dtab[k - 1] + speed((k - 0.5) * DT) * DT;
  const Dflow = (t) => { const x = Math.max(0, Math.min(NT - 1, t / DT)), k = Math.floor(x); return Dtab[k] + (Dtab[k + 1] - Dtab[k]) * (x - k); };
  // pressure wave events: [t0, amp, decay, speed]; arrivals at the valve every 2*LP/c
  const fadeS6 = (t) => 1 - ramp(t, K.s6 - 0.5, K.s6 + 0.3);
  const EV = [[T_slam[0], 0.55, 1.4, 30, () => 1], [T_slam[1], 0.45, 2.5, 30, () => 1], [A("s4:Lonjakan") - 0.5, 0.8, 0.07, 9, fadeS6], [T_slam[2], 0.12, 3, 24, () => 1], [T_slam[3], 0.5, 1.4, 30, () => 1]];
  const bulgeAt = (s, t) => {
    let b = 0;
    for (const [t0, amp, dec, c, f] of EV) {
      const dt = t - t0; if (dt <= 0) continue;
      const u = (c * dt) % (2 * LP), pos = u < LP ? u : 2 * LP - u, a = amp * Math.exp(-dec * dt) * f(t) * Math.min(1, dt * 8);
      b += a * Math.exp(-((s - pos) * (s - pos)) / 3.2);
    }
    return b;
  };
  const jolt = (t) => { let j = 0; for (const [t0, amp, dec, c, f] of EV) { const dt = t - t0; if (dt <= 0) continue; const ph = (c * dt) % (2 * LP); const hit = Math.min(ph, 2 * LP - ph) < 1.5 ? 1 : 0; j += hit * amp * Math.exp(-dec * dt) * f(t); } return j; };
  const pressure = (t) => {
    let p = 3 + 11 * bulgeAt(7.2, t) / 0.8;
    const p14 = ramp(t, A("s7:empat") - 0.4, A("s7:empat") + 0.3) * (1 - ramp(t, K.s7e - 0.2, K.s7e + 0.4));
    return Math.min(16, p + (14 - p) * p14);
  };
  const arrOn = (t) => clamp01(inflate(t, A("s6:tabung") - 0.2, 5, 11)) * (1 - ramp(t, K.s7 + 0.3, A("s7:Kantong") - 0.3)) + clamp01(inflate(t, A("s8:tabung") - 0.4, 5, 11)) * (t > A("s8:tabung") - 0.4 ? 1 : 0);
  const plainOn = (t) => ramp(t, A("s7:Kantong") - 0.6, A("s7:Kantong")) * (1 - ramp(t, A("s7:Padahal"), A("s7:Padahal") + 0.6));
  const dissolve = (t) => ramp(t, A("s7:lama-lama"), A("s7:air") + 0.2);
  // piston: at rest low; on the s6 slam it shoots up and springs back to a softer rest
  const pistonY = (t) => { const t0 = T_slam[2], dt = t - t0; const base = 6.2; if (dt <= 0) return base; return base + 2.2 * (1 - Math.exp(-3.2 * dt) * Math.cos(9 * dt)) * Math.exp(-0.35 * dt) + 0.4 * (1 - Math.exp(-dt)); };
  const cloudOn = (t) => clamp01(inflate(t, A("s1:dug") - 0.1, 7, 15)) * (1 - ramp(t, A("s1:mesin"), A("s1:cuci") + 0.2)) + clamp01(inflate(t, A("s5:dentuman") - 0.1, 7, 15)) * (1 - ramp(t, A("s5:dengar") + 0.3, A("s5:Tekanannya")));
  const ghostOn = (t) => clamp01(inflate(t, A("s1:bukan") - 0.3, 6, 12)) * (1 - ramp(t, A("s1:tabrakan") - 0.1, A("s1:air#2")));
  const trainX = (t) => 12 - 7.5 * (t - A("s2:momentum"));
  const trainOn = (t) => ramp(t, A("s2:momentum") - 0.4, A("s2:momentum")) * (1 - ramp(t, K.s3 - 0.4, K.s3 + 0.2));
  const damage = (t) => ramp(t, A("s5:merusak") - 0.2, A("s5:merusak") + 0.2) * (1 - ramp(t, K.s6 - 0.3, K.s6 + 0.3));

  const camT = track([
    [0, -3.5, 7.4, 23, -7.2, 5.8, 0],
    [A("s1:tabrakan"), -2.4, 7.0, 21, -5.6, 5.6, 0],
    [A("s2:palu") + 0.3, 5, 14, 56, -1.5, 11, 0],
    [A("s2:kereta"), 2, 10, 50, -1, 8, 0],
    [A("s3:katup"), -3, 6.4, 17, -6.2, 4.6, 0],
    [A("s3:mengerem"), -2.4, 5.6, 14, -5.5, 4.4, 0],
    [A("s4:geraknya"), 2, 8.6, 17, -1.6, 6.4, 0],
    [A("s4:merambat"), 6, 14, 52, 0.5, 12, 0],
    [K.s4e, 7, 15, 54, 0.5, 12.5, 0],
    [A("s5:dentuman"), 4, 12, 46, -0.5, 10, 0],
    [A("s5:merusak"), -2, 6.6, 16, -5.6, 4.8, 0],
    [K.s5e, -1, 7, 18, -4.6, 5.4, 0],
    [A("s6:tabung") + 0.3, 1.5, 9.4, 20, -3.4, 8.2, 0],
    [A("s6:piston"), -1.2, 8.4, 11.5, -3.6, 7.0, 0],
    [A("s6:bantalan"), -1.4, 10.4, 12, -3.6, 9.0, 0],
    [A("s6:mendorong"), 0.5, 9.2, 15.5, -3.6, 8.0, 0],
    [K.s6e, 1, 9.4, 17, -3.4, 8.2, 0],
    [A("s7:larut"), -1, 9.4, 13.5, -3.6, 8.4, 0],
    [A("s7:hitungan"), 3.2, 8.6, 11, 1.0, 7.4, 0],
    [K.s7e, 3.6, 8.4, 10, 1.1, 7.5, 0],
    [A("s8:sepuluh"), -0.5, 9.2, 15, -3.2, 8.2, 0],
    [A("s8:AUDIRA") + 0.4, 18, 15, 44, 5, 6.6, 0],
    [K.dur, 20, 17, 48, 5, 7, 0],
  ]);
  const look = new THREE.Vector3(), P = new THREE.Vector3();

  return (t) => {
    const c = camT(t), jl = jolt(t);
    const hx = 0.12 * Math.sin(t * 0.43) + 0.07 * Math.sin(t * 0.97) + 0.12 * jl * Math.sin(t * 60), hy = 0.08 * Math.sin(t * 0.31 + 1) + 0.08 * jl * Math.sin(t * 47);
    cam.position.set(c[0] + hx, c[1] + hy, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // pipe bulge + jolt
    const shake = 0.12 * jl * Math.sin(t * 70);
    for (const rg of rings) { const b = 1 + bulgeAt(rg.s, t); rg.m.scale.set(b, 1, b); pathAt(rg.s, P); rg.m.position.set(P.x, P.y + (rg.s <= 10 ? shake : 0), P.z + (rg.s > 10 ? shake : 0)); }
    const dm = damage(t);
    jointM.emissiveIntensity = dm * (0.6 + 0.6 * Math.max(0, Math.sin(t * 14)));
    for (const jo of joints) { const w = dm * 0.12 * Math.sin(t * 22 + jo.s); jo.j.position.set(jo.p.x + w, jo.p.y + w, jo.p.z); const b = 1 + bulgeAt(jo.s, t) * 0.8; jo.j.scale.setScalar(b); }
    valve.position.x = -6.7 + shake * 0.6;
    // gate drops when the valve closes
    const cl = closed(t); gate.position.set(-5.4, 4 + 2.6 * (1 - cl) + 0.12 * Math.sin(t * 50) * jl, PZ);

    // beads stream toward the valve; they jam (squash) against a closed gate
    const D = Dflow(t), sinceSlam = Math.min(...T_slam.map((a) => (t >= a ? t - a : 99)));
    const squash = cl ? Math.exp(-6 * sinceSlam) : 0;
    for (let i = 0; i < NB; i++) {
      const [s0, oy, oz, sc] = bseed[i];
      let s = (((s0 - D) % LP) + LP) % LP;
      const near = Math.exp(-s * 0.6);
      pathAt(s, P);
      const horiz = s <= 10;
      dum.position.set(P.x + (horiz ? 0 : oy), P.y + (horiz ? oy : 0), P.z + oz);
      const sx = 1 - 0.35 * squash * near, sy = 1 + 0.25 * squash * near;
      dum.scale.set(sc * (horiz ? sx : sy), sc * (horiz ? sy : sx), sc * sy);
      if (s < 0.5 && !cl) dum.scale.multiplyScalar(s / 0.5);
      dum.updateMatrix(); beads.setMatrixAt(i, dum.matrix);
    }
    beads.instanceMatrix.needsUpdate = true;

    // gauge
    const p = pressure(t); needle.rotation.z = -((-135 + 270 * (p / 16)) * Math.PI) / 180;
    gauge.scale.setScalar(1 + 0.05 * jl);

    // arrestor
    const ao = arrOn(t); arr.visible = ao > 0.01; arr.scale.set(Math.max(0.01, ao), Math.max(0.01, 0.2 + 0.8 * ao), Math.max(0.01, ao)); arr.position.y = AY0 * (1 - (0.2 + 0.8 * ao));
    const py = pistonY(t); piston.position.y = py;
    const top = AY1 - 0.15, pil = Math.max(0.4, top - (py + 0.4));
    pillow.position.y = py + 0.4 + pil / 2; pillow.scale.set(1.04, pil / 1.7, 1.04);
    awater.position.y = (AY0 + py - 0.35) / 2; awater.scale.y = Math.max(0.01, py - 0.35 - AY0);
    sealTag.material.opacity = ramp(t, A("s6:tersegel") - 0.2, A("s6:tersegel") + 0.3) * (1 - ramp(t, A("s6:Saat") - 0.2, A("s6:Saat") + 0.3)) + ramp(t, A("s7:tersegel") - 0.2, A("s7:tersegel") + 0.3) * (1 - ramp(t, A("s7:Kantong") - 0.4, A("s7:Kantong")));
    sealTag.visible = sealTag.material.opacity > 0.01;
    // plain chamber: the air pocket shrinks as it dissolves into the water
    const po = plainOn(t); plain.visible = po > 0.01; plain.scale.set(Math.max(0.01, po), 1, Math.max(0.01, po));
    const dv = dissolve(t), airH = 2.6 * (1 - 0.85 * dv);
    pAir.position.y = AY1 - 0.2 - airH / 2; pAir.scale.set(1.04, Math.max(0.05, airH / 1.7), 1.04);
    pWater.position.y = (AY0 + (AY1 - 0.2 - airH)) / 2; pWater.scale.y = Math.max(0.01, AY1 - 0.2 - airH - AY0);
    for (let i = 0; i < NBu; i++) { const [bx, bz, q] = buSeed[i], u = ((q + t * 0.35) % 1); dum.position.set(bx * 0.6, AY1 - 0.4 - airH - u * 4.5, bz * 0.6); dum.scale.setScalar(dv > 0.02 && dv < 0.99 ? (1 - u) : 0.001); dum.updateMatrix(); bub.setMatrixAt(i, dum.matrix); }
    bub.instanceMatrix.needsUpdate = true;
    const ru = ramp(t, A("s8:sepuluh") - 0.3, A("s8:sepuluh") + 0.3) * (1 - ramp(t, A("s8:AUDIRA") - 0.4, A("s8:AUDIRA") + 0.2));
    ruler.visible = rulerLab.visible = ru > 0.01; ruler.position.set(AX - 1.9, (AY0 + AY1) / 2, PZ + 0.6); ruler.scale.setScalar(Math.max(0.01, ru));
    rulerLab.position.set(AX - 4.6, (AY0 + AY1) / 2, PZ + 0.9); rulerLab.material.opacity = ru;

    // hook toys
    const co = cloudOn(t); cloud.visible = co > 0.01; cloud.position.set(-3.6, 10.2, 0.8); cloud.scale.setScalar(Math.max(0.01, co) * 1.05);
    const go = ghostOn(t); ghost.visible = go > 0.01; ghost.position.set(-1.2, 5.6 + 0.25 * Math.sin(t * 3), 1.6); ghost.scale.set(Math.max(0.01, go), Math.max(0.01, go * (1 - 0.1 * Math.sin(t * 6))), Math.max(0.01, go)); ghost.rotation.y = 0.35 * Math.sin(t * 5) * go;
    const tn = trainOn(t); train.visible = tn > 0.01; train.position.set(trainX(t), 0, 4.5); train.scale.setScalar(Math.max(0.01, back(tn, 1.4)));
    // AUDIRA balloon letters inflate one by one on the brand word and stand
    letters.forEach((h, i) => {
      const k = clamp01(inflate(t, A("s8:AUDIRA") - 0.3 + i * 0.16, 6, 13));
      h.visible = k > 0.01; h.scale.set(3 * Math.max(0.05, k), 3 * Math.max(0.05, 0.15 + 0.85 * k), 3 * Math.max(0.05, k));
      const hop = Math.max(0, Math.sin((t - A("s8:Cara") - i * 0.12) * 6)) * ramp(t, A("s8:Cara"), A("s8:Cara") + 0.2) * 0.6;
      h.position.y = 0.02 + hop;
    });

    bp.strength = 0.18 + 0.12 * jl;
    comp.render();
  };
}
