// EP29 FIRE EXTINGUISHER BALL (NANOFORGE): a dark microscopy void, glossy ball-and-stick chemistry, cyan/magenta/gold
// rim lights that follow the camera and a teal-orange grade. One dive along -z from the kitchen to the molecule:
//   KITCHEN  z=0       counter with a stove flame, the ball hanging above it, a wall extinguisher, an electric panel
//                       and a toy car (where balls hang), crossed plug and pipe, a ball rolling (s1, s2, s8)
//   HISTORY  x=-16     1880 glass grenade with salt water: a silhouette figure throws it, it shatters on a fire (s3)
//   CUTAWAY  z=-40     the ball cut open: foam shell cells, dry powder, the fuse on the surface, a small charge; the fuse
//                       burns, the shell bursts and powder sprays out (s4, s5)
//   MOLECULE z=-80     NH4H2PO4 ball-stick, the powder melts into a glassy coat over charred fuel, the flame chain snaps (s6)
//   ROOM     x=+18, z=-80   3x3 m room wireframe vs the 2.5 m3 cube one ball protects; 4-minute dial (s7)
// Generic products only. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, stage, envStrips, label, pts } from "./lib3d.js";

const C = { void: "#02050f", navy: "#0a192f", cyan: "#00f5d4", mag: "#a855f7", gold: "#fbbf24", amber: "#f59e0b", ruby: "#f43f5e", sky: "#38bdf8", white: "#e2e8f0", red: "#d8342a", steel: "#8b97a8" };
const MONO = "'Courier New', monospace", SANS = "'Arial Black', Arial, sans-serif";
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// CINEMA_TEAL_ORANGE: teal shadows, warm highlights, a touch more contrast and saturation, white flash on the dive cuts.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c*vec3(0.88,1.02,1.08),c*vec3(1.08,1.0,0.88),smoothstep(0.2,0.8,l));c=mix(vec3(l),c,1.12);c=(c-0.5)*1.08+0.5;
  vec2 d=vUv-0.5;c*=1.0-0.25*dot(d,d);c=mix(c,vec3(1.0,0.97,0.92),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const std = (c, r = 0.5, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: r, metalness: m, ...x });
const gloss = (c, e = 0.15) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c), roughness: 0.18, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06, emissive: new THREE.Color(c), emissiveIntensity: e });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const txt = (x, s, px, py, font, color, align = "center") => { x.font = font; x.fillStyle = color; x.textAlign = align; x.textBaseline = "middle"; x.fillText(s, px, py); };
function plate(tex, w, h, parent, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
function bond(p, a, b, mat, r = 0.06) { const d = new THREE.Vector3().subVectors(b, a), m = mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat, p); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return m; }
// flame: three nested emissive cones that flicker as a pure function of t
function flame(parent, x, y, z, s = 1) {
  const G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); parent.add(G);
  const cs = [[0.35, 1.1, "#ff5a1f", 2.2], [0.24, 0.85, "#ffb020", 2.8], [0.12, 0.5, "#fff2b0", 3.5]].map(([r, h, c, e]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 18, 1, true), new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: e, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide })); m.position.y = h / 2; G.add(m); return m; });
  const L = new THREE.PointLight(0xff8a3a, 3, 6, 1.6); L.position.y = 0.6; G.add(L);
  return (t, amt) => { G.visible = amt > 0.01; cs.forEach((m, i) => { m.scale.set(amt * (1 + 0.08 * Math.sin(t * 17 + i * 2)), amt * (1 + 0.18 * Math.sin(t * 11 + i)), amt); m.rotation.y = t * (1 + i); }); L.intensity = 3 * amt; };
}
function extinguisher(parent, x, y, z) {
  const G = new THREE.Group(); G.position.set(x, y, z); parent.add(G);
  mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.9, 32), gloss(C.red, 0.05), G, 0, 0.95, 0);
  mesh(new THREE.SphereGeometry(0.42, 32, 16, 0, 6.3, 0, Math.PI / 2), gloss(C.red, 0.05), G, 0, 1.9, 0);
  mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 16), std("#222", 0.4, 0.8), G, 0, 2.4, 0);
  mesh(new THREE.BoxGeometry(0.6, 0.08, 0.16), std("#222", 0.4, 0.8), G, 0.12, 2.56, 0);
  const hose = mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 24, Math.PI * 1.2), std("#111", 0.6), G, 0.42, 1.9, 0); hose.rotation.z = -1.4;
  plate(canvasTex(256, 320, (x, w, h) => { x.fillStyle = "#f2f2f2"; x.fillRect(0, 0, w, h); txt(x, "APAR", w / 2, 60, `900 64px ${SANS}`, "#111"); x.fillStyle = "#111"; for (let i = 0; i < 6; i++) x.fillRect(30, 120 + i * 30, 196 - (i % 2) * 50, 10); }), 0.55, 0.7, G, 0, 1.0, 0.43);
  return G;
}
function fireBall(parent, r = 0.45) {
  const G = new THREE.Group(); parent.add(G);
  mesh(new THREE.SphereGeometry(r, 40, 28), gloss(C.red, 0.06), G);
  const band = mesh(new THREE.TorusGeometry(r * 1.005, r * 0.06, 10, 48), std("#f4f4f4", 0.4), G); band.rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, f = mesh(new THREE.TorusGeometry(r * 1.01, r * 0.025, 6, 40, Math.PI * 0.5), std("#111", 0.6), G); f.rotation.set(0, a, Math.PI / 2); }
  return G;
}
function silhouette(color) {
  return canvasTex(256, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.fillStyle = color;
    x.beginPath(); x.arc(118, 64, 38, 0, 6.3); x.fill(); x.fillRect(106, 96, 26, 22);
    x.beginPath(); x.moveTo(56, 128); x.quadraticCurveTo(120, 110, 184, 128); x.lineTo(230, 40); x.lineTo(246, 52); x.lineTo(200, 160); x.lineTo(176, 300); x.lineTo(70, 300); x.lineTo(60, 200); x.lineTo(30, 280); x.lineTo(14, 272); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(74, 300); x.lineTo(118, 300); x.lineTo(96, 480); x.lineTo(66, 480); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(128, 300); x.lineTo(172, 300); x.lineTo(204, 470); x.lineTo(176, 480); x.closePath(); x.fill();
  });
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x02050f, fog: 0.012, exp: 1.0, bloom: [0.55, 0.55, 0.78] });
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  envStrips(r, scene, [[8, 2, 0xffffff, 2.0, -4, 6, 4], [3, 6, 0x00f5d4, 1.4, 6, 1, 3], [3, 6, 0xa855f7, 1.4, -6, 1, -2], [10, 1, 0xfbbf24, 0.9, 0, -4, 2]]);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  scene.add(new THREE.HemisphereLight(0x9fb7d8, 0x05070d, 0.7));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 50 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key); scene.add(key.target);
  // rim lights ride with the camera (memory: cyan/magenta/gold rims that follow the camera)
  const rimC = new THREE.PointLight(0x00f5d4, 30, 30, 1.8), rimM = new THREE.PointLight(0xa855f7, 30, 30, 1.8), rimG = new THREE.PointLight(0xfbbf24, 18, 30, 1.8); scene.add(rimC, rimM, rimG);

  // ============ KITCHEN ============
  const KI = new THREE.Group(); scene.add(KI);
  mesh(new THREE.BoxGeometry(12, 0.25, 4), std("#1a2233", 0.35, 0.3), KI, 0, -0.12, 0);
  mesh(new THREE.BoxGeometry(12, 2.2, 3.8), std("#0e1524", 0.6, 0.1), KI, 0, -1.35, 0.05);
  const wall = mesh(new THREE.PlaneGeometry(16, 9), std("#0b1220", 0.8), KI, 0, 3.5, -2);
  plate(canvasTex(512, 512, (x, w, h) => { x.strokeStyle = "rgba(0,245,212,.12)"; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); } }), 16, 9, KI, 0, 3.5, -1.98);
  // stove + flame
  mesh(new THREE.BoxGeometry(2.6, 0.18, 1.6), std("#2a3140", 0.3, 0.7), KI, 0, 0.09, 0.2);
  const burner = mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 32), std("#555", 0.4, 0.8), KI, 0, 0.2, 0.2); burner.rotation.x = Math.PI / 2;
  const stoveF = flame(KI, 0, 0.18, 0.2, 0.8);
  const pan = mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.25, 32), std("#3a3f4a", 0.3, 0.9), KI, 0, 0.75, 0.2);
  // hanging ball above the stove
  const hang = new THREE.Group(); hang.position.set(0, 3.0, 0.2); KI.add(hang);
  mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 6), std("#999", 0.3, 0.9), hang, 0, 1.2, 0);
  const ball0 = fireBall(hang, 0.48);
  const ext = extinguisher(KI, -3.6, 0, -0.6);
  // electric panel (left wall) and toy car (right) with balls
  const panel = new THREE.Group(); panel.position.set(-4.6, 3.6, -1.85); KI.add(panel);
  mesh(new THREE.BoxGeometry(1.5, 1.9, 0.2), std("#4a5568", 0.4, 0.5), panel);
  for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(0.18, 0.4, 0.06), std(i % 2 ? "#111" : "#e2e8f0", 0.4), panel, -0.5 + i * 0.2, 0.3, 0.12);
  const ballP = fireBall(panel, 0.32); ballP.position.set(0, 1.35, 0.3);
  const car = new THREE.Group(); car.position.set(3.7, 0.0, 0.3); KI.add(car);
  mesh(new THREE.BoxGeometry(2.0, 0.5, 0.95), gloss(C.sky, 0.05), car, 0, 0.45, 0); mesh(new THREE.BoxGeometry(1.1, 0.45, 0.85), std("#cfe8ff", 0.1, 0, { transparent: true, opacity: 0.6 }), car, -0.1, 0.9, 0);
  for (const [x, z] of [[-0.65, 0.5], [0.65, 0.5], [-0.65, -0.5], [0.65, -0.5]]) mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 20), std("#111", 0.6), car, x, 0.2, z).rotation.x = Math.PI / 2;
  const ballC = fireBall(car, 0.16); ballC.position.set(-0.1, 0.85, 0);
  // crossed plug and pipe
  const nope = new THREE.Group(); nope.position.set(1.9, 3.3, 0.6); KI.add(nope);
  const plug = new THREE.Group(); plug.position.x = -0.7; nope.add(plug); mesh(new THREE.BoxGeometry(0.4, 0.5, 0.3), std("#e2e8f0", 0.4), plug); for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.05, 0.25, 0.05), std("#c9a227", 0.3, 0.9), plug, s * 0.1, 0.36, 0);
  const pipe = mesh(new THREE.TorusGeometry(0.28, 0.08, 10, 24, Math.PI), std("#9aa5b5", 0.3, 0.9), nope, 0.7, 0, 0);
  const xm = std(C.ruby, 0.4, 0, { emissive: new THREE.Color(C.ruby), emissiveIntensity: 1.2 });
  const crosses = [-0.7, 0.7].map((x) => { const g = new THREE.Group(); g.position.set(x, 0, 0.3); nope.add(g); for (const s of [-1, 1]) { const b = mesh(new THREE.BoxGeometry(0.85, 0.09, 0.05), xm, g); b.rotation.z = s * 0.78; } return g; });
  const roller = fireBall(KI, 0.3);
  const sign = plate(canvasTex(640, 120, (x, w, h) => { x.fillStyle = "rgba(2,5,15,.85)"; x.fillRect(0, 0, w, h); x.strokeStyle = C.cyan; x.lineWidth = 4; x.strokeRect(4, 4, w - 8, h - 8); txt(x, "AUDIRA SAFETY LAB", w / 2, h / 2 + 2, `700 50px ${MONO}`, C.cyan); }), 3.6, 0.68, KI, 2.6, 5.4, -1.9);
  const okTag = label("LOLOS UJI STANDAR ✓", { font: `900 54px ${SANS}`, color: "#04130f", bg: "rgba(0,245,212,.95)", w: 760, h: 110, size: 2.6 }); okTag.position.set(-3.6, 3.15, 0.2); KI.add(okTag);

  // ============ HISTORY 1880 ============
  const HI = new THREE.Group(); HI.position.set(-16, 0, 0); scene.add(HI);
  mesh(new THREE.BoxGeometry(12, 0.25, 5), std("#1d1712", 0.8), HI, 0, -0.12, 0);
  const fig = plate(silhouette("#0d1320"), 1.9, 3.8, HI, -3.2, 1.9, 0.2); fig.material.toneMapped = true;
  const gren = new THREE.Group(); HI.add(gren);
  mesh(new THREE.SphereGeometry(0.42, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xbfe6ff, roughness: 0.04, transmission: 0, transparent: true, opacity: 0.45, clearcoat: 1 }), gren);
  mesh(new THREE.SphereGeometry(0.36, 24, 16, 0, 6.3, Math.PI * 0.35, Math.PI * 0.65), std(C.sky, 0.1, 0, { emissive: new THREE.Color(C.sky), emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }), gren);
  mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.32, 16), new THREE.MeshPhysicalMaterial({ color: 0xbfe6ff, roughness: 0.05, transparent: true, opacity: 0.5 }), gren, 0, 0.5, 0);
  const histF = flame(HI, 3.4, 0, 0.2, 1.4);
  const logs = [0, 1, 2].map((i) => { const l = mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.4, 12), std("#3b2414", 0.9), HI, 3.4, 0.15 + (i === 2 ? 0.22 : 0), 0.2 + (i - 1) * 0.25); l.rotation.z = Math.PI / 2; l.rotation.y = i * 0.6; return l; });
  const shards = [], R1 = mulberry(19);
  for (let i = 0; i < 26; i++) { const s = mesh(new THREE.TetrahedronGeometry(0.06 + R1() * 0.06), new THREE.MeshPhysicalMaterial({ color: 0xcfefff, roughness: 0.05, transparent: true, opacity: 0.7 }), HI); s.castShadow = false; shards.push([s, R1() * 6.28, 0.6 + R1() * 1.5, R1()]); }
  const splash = pts(HI, 120, { color: C.sky, size: 0.12, add: true });
  const yr = label("± 1880", { font: `900 80px ${MONO}`, color: C.gold, bg: "rgba(2,5,15,.8)", w: 440, h: 120, size: 1.8 }); yr.position.set(0, 3.7, 0); HI.add(yr);

  // ============ CUTAWAY ============
  const CU = new THREE.Group(); CU.position.set(0, 2.2, -40); scene.add(CU);
  const foamTex = canvasTex(512, 512, (x, w, h) => { const R = mulberry(4); x.fillStyle = "#d8342a"; x.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { const px = R() * w, py = R() * h, rr = 4 + R() * 12; x.fillStyle = `rgba(80,10,6,${0.3 + R() * 0.4})`; x.beginPath(); x.arc(px, py, rr, 0, 6.3); x.fill(); x.strokeStyle = "rgba(255,170,150,.35)"; x.lineWidth = 1.5; x.stroke(); } });
  const shellG = new THREE.Group(); CU.add(shellG);
  const halves = [];
  for (let i = 0; i < 6; i++) { const s = new THREE.Group(); shellG.add(s); const seg = mesh(new THREE.SphereGeometry(3, 40, 30, 0.35 * Math.PI + i * 0.25 * Math.PI, 0.25 * Math.PI), std("#ffffff", 0.55, 0, { map: foamTex, side: THREE.DoubleSide }), s); halves.push([s, 0.35 * Math.PI + (i + 0.5) * 0.25 * Math.PI]); }
  const inner = mesh(new THREE.SphereGeometry(2.75, 40, 30, 0.35 * Math.PI, 1.5 * Math.PI), std("#3a0c08", 0.9, 0, { side: THREE.BackSide }), CU);
  const fuseM = std(C.cyan, 0.3, 0, { emissive: new THREE.Color(C.cyan), emissiveIntensity: 1.0 });
  const fuseCurve = new THREE.CatmullRomCurve3([0, 1, 2, 3, 4, 5, 6].map((i) => { const a = 0.6 + i * 0.32, b = 0.9 + 0.12 * Math.sin(i * 1.7); return new THREE.Vector3(3.03 * Math.sin(b) * Math.cos(a), 3.03 * Math.cos(b), 3.03 * Math.sin(b) * Math.sin(a)); }));
  const fuse = mesh(new THREE.TubeGeometry(fuseCurve, 80, 0.06, 8), fuseM, shellG);
  const ember = mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd27a }), CU); const emL = new THREE.PointLight(0xffa040, 4, 5, 1.6); ember.add(emL);
  const charge = mesh(new THREE.SphereGeometry(0.35, 24, 16), gloss(C.ruby, 0.8), CU);
  const powder = pts(CU, 900, { color: C.gold, size: 0.13, add: false, opacity: 0.95 });
  const R2 = mulberry(29), pw = [];
  for (let i = 0; i < 900; i++) { const u = R2(), v = R2(), rr = 2.6 * Math.cbrt(R2()), th = u * 6.283, ph = Math.acos(2 * v - 1); pw.push([rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph), rr * Math.sin(ph) * Math.sin(th), 0.8 + R2() * 1.4]); if (i % 3 === 0) powder.col.set([1, 0.97, 0.88], i * 3); }
  powder.commit();
  const fuseLab = label("SUMBU", { font: `900 66px ${SANS}`, color: "#02140f", bg: "rgba(0,245,212,.95)", w: 360, h: 110, size: 1.5 }); CU.add(fuseLab);

  // ============ MOLECULE ============
  const MO = new THREE.Group(); MO.position.set(0, 2.2, -80); scene.add(MO);
  const mol = new THREE.Group(); MO.add(mol);
  const aP = gloss(C.amber, 0.25), aO = gloss(C.ruby, 0.2), aH = gloss(C.white, 0.08), aN = gloss(C.sky, 0.25), bm = std("#c8d0dc", 0.25, 0.3);
  const P0 = new THREE.Vector3(0, 0, 0); mesh(new THREE.SphereGeometry(0.62, 32, 24), aP, mol);
  const Os = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map((v) => new THREE.Vector3(...v).normalize().multiplyScalar(1.55));
  Os.forEach((o, i) => { mesh(new THREE.SphereGeometry(0.46, 28, 20), aO, mol).position.copy(o); bond(mol, P0, o, bm, 0.1); if (i < 2) { const h = o.clone().add(o.clone().normalize().multiplyScalar(0.95)).add(new THREE.Vector3(0, 0.3, 0)); mesh(new THREE.SphereGeometry(0.27, 20, 14), aH, mol).position.copy(h); bond(mol, o, h, bm, 0.07); } });
  const NH = new THREE.Group(); NH.position.set(3.0, -0.6, 0.6); mol.add(NH); mesh(new THREE.SphereGeometry(0.5, 28, 20), aN, NH);
  [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].forEach((v) => { const h = new THREE.Vector3(...v).normalize().multiplyScalar(0.95); mesh(new THREE.SphereGeometry(0.25, 20, 14), aH, NH).position.copy(h); bond(NH, new THREE.Vector3(), h, bm, 0.06); });
  const molLab = label("NH₄H₂PO₄", { font: `900 76px ${MONO}`, color: C.gold, bg: "rgba(2,5,15,.85)", w: 520, h: 120, size: 2.4 }); molLab.position.set(1.2, 2.6, 0.5); MO.add(molLab);
  // charred fuel surface, melt coat, flame chain
  const fuel = mesh(new THREE.BoxGeometry(9, 0.6, 4), std("#2a1a10", 0.95), MO, 0, -3.2, 0);
  const emberTex = canvasTex(512, 256, (x, w, h) => { const R = mulberry(8); x.fillStyle = "#1b0f08"; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,${80 + R() * 80},20,${R() * 0.8})`; x.fillRect(R() * w, R() * h, 2 + R() * 10, 2 + R() * 4); } });
  const fuelTop = mesh(new THREE.PlaneGeometry(9, 4), std("#ffffff", 0.9, 0, { map: emberTex, emissive: new THREE.Color("#ff6a1a"), emissiveMap: emberTex, emissiveIntensity: 1.6 }), MO, 0, -2.89, 0); fuelTop.rotation.x = -Math.PI / 2;
  const coat = mesh(new THREE.BoxGeometry(9.05, 0.12, 4.05), new THREE.MeshPhysicalMaterial({ color: 0xf6e7b0, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.85, emissive: new THREE.Color("#5a4300"), emissiveIntensity: 0.2 }), MO, 0, -2.85, 0);
  const chain = [], links = [];
  for (let i = 0; i < 7; i++) { const o = mesh(new THREE.SphereGeometry(0.22, 18, 12), new THREE.MeshBasicMaterial({ color: 0xff8a3a }), MO, -3.6 + i * 1.2, -1.9 + 0.3 * Math.sin(i * 1.3), 0.8); chain.push(o); }
  for (let i = 0; i < 6; i++) { const l = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true }), MO); links.push(l); }
  const molFlames = [-3, -1, 1, 3].map((x) => flame(MO, x, -2.9, -0.8, 1.1));

  // ============ ROOM ============
  const RO = new THREE.Group(); RO.position.set(18, 0, -80); scene.add(RO);
  const room = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 2.5, 3)), new THREE.LineBasicMaterial({ color: C.mag, transparent: true, toneMapped: false })); room.position.y = 1.25; RO.add(room);
  const floor = mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ color: C.mag, transparent: true, opacity: 0.12, toneMapped: false, side: THREE.DoubleSide }), RO, 0, 0.005, 0); floor.rotation.x = -Math.PI / 2;
  const roomFill = mesh(new THREE.BoxGeometry(3, 2.5, 3), new THREE.MeshBasicMaterial({ color: C.mag, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), RO, 0, 1.25, 0);
  const side = Math.cbrt(2.5);
  const cube = mesh(new THREE.BoxGeometry(side, side, side), new THREE.MeshPhysicalMaterial({ color: C.cyan, transparent: true, opacity: 0.4, roughness: 0.2, emissive: new THREE.Color(C.cyan), emissiveIntensity: 0.5, depthWrite: false }), RO, -0.6, side / 2, 0.6);
  cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({ color: C.cyan, toneMapped: false })));
  const ballR = fireBall(RO, 0.18); ballR.position.set(-0.6, side + 0.2, 0.6);
  const labCube = label("2,5 m³", { font: `900 80px ${MONO}`, color: C.cyan, bg: "rgba(2,5,15,.85)", w: 400, h: 120, size: 1.2 }); labCube.position.set(-0.6, side + 0.75, 1.3); RO.add(labCube);
  const labRoom = label("3 × 3 m  >  20 m³", { font: `900 72px ${MONO}`, color: "#e9d5ff", bg: "rgba(2,5,15,.85)", w: 820, h: 120, size: 2.6 }); labRoom.position.set(0, 3.05, 1.5); RO.add(labRoom);
  const dial = new THREE.Group(); dial.position.set(2.7, 1.6, 0.8); RO.add(dial);
  mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 48), std("#0f1a2e", 0.3, 0.5), dial).rotation.x = Math.PI / 2;
  const sweep = mesh(new THREE.RingGeometry(0.3, 0.68, 48, 1, Math.PI / 2, 0.001), new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.9, side: THREE.DoubleSide, toneMapped: false }), dial, 0, 0, 0.06);
  plate(canvasTex(256, 96, (x, w, h) => { txt(x, "4 MENIT", w / 2, h / 2, `900 52px ${MONO}`, C.gold); }), 1.2, 0.45, dial, 0, -1.05, 0.05);

  // ---------- camera: dive along -z ----------
  const Ks = (k, d = 0) => K[k] + d;
  const cpath = track([
    [0, 1.2, 2.8, 12.5, -0.4, 2.2, 0],
    [Ks("s1e") - 0.3, 0.6, 2.6, 11.4, -0.6, 2.0, 0],
    [A("s2:digantung") - 0.2, 0.0, 2.9, 13.5, -0.2, 2.6, 0],
    [A("s2:listrik") + 0.3, -1.4, 3.2, 13.0, -0.6, 2.7, 0],
    [A("s2:mobil") + 0.3, 1.2, 2.4, 12.8, 1.0, 2.0, 0],
    [A("s2:digelindingkan") - 0.3, 0.6, 2.0, 11.8, 0.4, 1.4, 0],
    [Ks("s2e"), 0.4, 1.8, 11.2, 0.4, 1.3, 0],
    [Ks("s3", 0.8), -16.0, 2.4, 12.5, -16.2, 1.7, 0],
    [Ks("s3e"), -15.0, 2.2, 11.2, -15.2, 1.5, 0],
    [Ks("s4", 0.7), 0.0, 2.6, -40 + 13.0, 0, 2.6, -40],
    [A("s4:sumbu") - 0.2, 1.0, 3.4, -40 + 11.5, 0.4, 2.9, -40],
    [Ks("s4e"), 1.4, 3.6, -40 + 11.0, 0.5, 2.9, -40],
    [A("s5:memecahkan") - 0.2, 0.8, 3.0, -40 + 12.0, 0.2, 2.6, -40],
    [Ks("s5e"), 0.0, 2.8, -40 + 16.5, 0, 2.4, -40],
    [Ks("s6", 0.7), 0.6, 2.4, -80 + 12.5, 0.6, 1.6, -80],
    [A("s6:meleleh") - 0.2, 0.2, 1.8, -80 + 12.8, 0.0, 0.0, -80],
    [Ks("s6e"), -0.4, 1.2, -80 + 12.0, 0.0, -0.8, -80],
    [Ks("s7", 0.8), 18.0, 3.4, -80 + 9.6, 18.4, 1.2, -80],
    [A("s7:Kamar") - 0.2, 18.4, 3.6, -80 + 9.2, 18.4, 1.3, -80],
    [Ks("s7e"), 19.0, 3.2, -80 + 8.4, 19.0, 1.3, -80],
    [Ks("s8", 0.8), -1.4, 2.6, 13.0, -1.6, 2.0, 0],
    [K.dur, -1.0, 2.5, 11.6, -1.4, 1.9, 0],
  ]);
  const _t = new THREE.Vector3(), _v = new THREE.Vector3();
  const win = (t, a, b, f = 0.4) => ramp(t, a - f, a) * (1 - ramp(t, b - f, b));

  return function draw(t) {
    const [px, py, pz, tx, ty, tz] = cpath(t);
    cam.position.set(px + 0.1 * Math.sin(t * 0.43), py + 0.07 * Math.sin(t * 0.61), pz); cam.lookAt(_t.set(tx, ty, tz));
    rimC.position.set(px + 5, py + 2, tz + 2); rimM.position.set(px - 5, py + 1, tz - 3); rimG.position.set(tx, ty + 5, tz - 4);
    key.position.set(tx - 5, ty + 10, tz + 8); key.target.position.set(tx, ty, tz);
    gradeP.uniforms.flash.value = Math.max(...["s3", "s4", "s6", "s7", "s8"].map((s) => 0.45 * Math.max(0, 1 - Math.abs(t - K[s]) / 0.18)), ...["s2", "s5"].map((s) => 0.12 * Math.max(0, 1 - Math.abs(t - K[s]) / 0.12)), 0.6 * Math.max(0, 1 - Math.abs(t - A("s5:memecahkan")) / 0.15));
    KI.visible = t < K.s3 + 0.4 || t > K.s8 - 0.4; HI.visible = t > K.s3 - 0.4 && t < K.s4 + 0.4; CU.visible = t > K.s4 - 0.4 && t < K.s6 + 0.4; MO.visible = t > K.s6 - 0.4 && t < K.s7 + 0.4; RO.visible = t > K.s7 - 0.4 && t < K.s8 + 0.4;
    // ---- KITCHEN ----
    if (KI.visible) {
      const s8 = t > K.s8 - 0.4;
      stoveF(t, s8 ? 0 : 0.9); hang.rotation.z = 0.05 * Math.sin(t * 1.3); ball0.rotation.y = t * 0.3;
      const pin = (k) => Math.max(0.001, back(clamp01((t - A(k) + 0.2) / 0.45), 1.6));
      ballP.scale.setScalar(s8 ? 1 : pin("s2:panel")); ballC.scale.setScalar(s8 ? 1 : pin("s2:mobil"));
      const no = win(t, A("s2:tanpa") - 0.2, A("s2:digelindingkan"), 0.3); nope.visible = no > 0.01 && !s8; nope.scale.setScalar(Math.max(0.001, back(no, 1.3)));
      crosses[0].scale.setScalar(Math.max(0.001, back(ramp(t, A("s2:tanpa") - 0.1, A("s2:tanpa") + 0.25), 1.8))); crosses[1].scale.setScalar(Math.max(0.001, back(ramp(t, A("s2:pipa") - 0.1, A("s2:pipa") + 0.25), 1.8)));
      // roll across the counter, then a short throw arc on "dilempar"
      const ru = ramp(t, A("s2:digelindingkan") - 0.2, A("s2:dilempar")), th = ramp(t, A("s2:dilempar") - 0.1, K.s2e);
      roller.visible = t > A("s2:digelindingkan") - 0.3 && t < K.s3 + 0.4; roller.position.set(5.2 - 4.4 * ru - 0.9 * th, 0.3 + 1.6 * Math.sin(Math.PI * th) * (1 - th * 0.4), 1.1); roller.rotation.z = (4.4 * ru) / 0.3;
      okTag.visible = s8; okTag.material.opacity = ramp(t, A("s8:standar") - 0.4, A("s8:standar")); okTag.scale.setScalar(0.9 + 0.1 * back(okTag.material.opacity));
      ext.rotation.y = 0.3 + 0.05 * Math.sin(t * 0.7);
      sign.material.opacity = 1;
    }
    // ---- HISTORY ----
    if (HI.visible) {
      const tt = A("s3:melempar") - 0.2, ta = A("s3:garam"), u = clamp01((t - tt) / Math.max(0.5, ta - tt));
      const hit = t >= ta;
      gren.visible = !hit; const sx = -2.6, sy = 2.9, ex = 3.4, ey = 0.6;
      gren.position.set(sx + (ex - sx) * u, sy + (ey - sy) * u + 1.8 * Math.sin(Math.PI * u), 0.2); gren.rotation.set(t * 3 * u, 0, t * 2 * u);
      const k = Math.max(0, t - ta);
      shards.forEach(([s, a, sp, z]) => { s.visible = hit; s.position.set(ex + Math.cos(a) * sp * k * 2.2, ey + sp * k * 2.6 - 4.9 * k * k, 0.2 + (z - 0.5) * k * 3); s.rotation.set(k * 9 * sp, k * 7, 0); });
      for (let i = 0; i < 120; i++) { const a = (i / 120) * 6.283, sp = 0.6 + ((i * 37) % 10) / 8; splash.pos.set([ex + Math.cos(a) * sp * k * 1.6, ey + sp * k * 2.2 - 4.9 * k * k, 0.2 + Math.sin(a) * sp * k], i * 3); }
      splash.m.opacity = hit ? Math.max(0, 1 - k * 1.2) : 0; splash.commit();
      histF(t, 1 - 0.7 * ramp(t, ta, ta + 1.2));
      yr.material.opacity = ramp(t, A("s3:seribu") - 0.2, A("s3:seribu") + 0.3);
      fig.position.y = 1.9 + 0.03 * Math.sin(t * 2);
    }
    // ---- CUTAWAY ----
    if (CU.visible) {
      CU.rotation.y = -0.5 + 0.1 * Math.sin(t * 0.25);
      const lit = ramp(t, A("s4:menyala") - 0.2, A("s4:menyala") + 0.3), burn = ramp(t, A("s5:sumbu") - 0.2, A("s5:memecahkan") - 0.1), boom = t >= A("s5:memecahkan");
      fuseM.emissiveIntensity = 0.8 + 1.2 * lit;
      ember.visible = lit > 0.01 && !boom; fuseCurve.getPoint(clamp01(burn), _v); ember.position.copy(_v); ember.scale.setScalar(0.8 + 0.3 * Math.sin(t * 20));
      fuseLab.material.opacity = win(t, A("s4:sumbu"), K.s5 + 0.4); fuseLab.position.set(fuseCurve.getPoint(0.5).x * 1.15, fuseCurve.getPoint(0.5).y * 1.15 + 0.4, fuseCurve.getPoint(0.5).z * 1.15);
      const k = Math.max(0, t - A("s5:memecahkan")), ex = boom ? 1 - Math.exp(-k * 2.2) : 0;
      halves.forEach(([s, a]) => { s.position.set(Math.cos(a) * 5 * ex, 1.2 * ex - 0.6 * k * k * 0.3, -Math.sin(a) * 5 * ex); s.rotation.set(0.6 * ex, 0, 0.4 * ex); });
      inner.visible = !boom; fuse.visible = !boom || ex < 0.2;
      charge.material.emissiveIntensity = boom ? Math.max(0, 6 * (1 - k * 3)) : 0.8 + 1.5 * burn * (0.5 + 0.5 * Math.sin(t * 25));
      charge.scale.setScalar(boom ? Math.max(0.001, 1 + k * 6) * Math.max(0, 1 - k * 2.5) : 1);
      const sh = ramp(t, A("s4:bubuk") - 0.3, A("s4:bubuk") + 0.4);
      for (let i = 0; i < pw.length; i++) { const [x, y, z, sp] = pw[i]; const f = 1 + ex * 3.2 * sp; powder.pos.set([x * f, y * f - 0.8 * k * k * (boom ? 1 : 0), z * f], i * 3); }
      powder.m.opacity = (0.35 + 0.6 * sh) * (boom ? Math.max(0.15, 1 - k * 0.25) : 1); powder.commit();
    }
    // ---- MOLECULE ----
    if (MO.visible) {
      mol.rotation.set(0.3 * Math.sin(t * 0.4), t * 0.35, 0); mol.position.y = 0.6 + 0.1 * Math.sin(t * 0.8);
      molLab.material.opacity = ramp(t, A("s6:monoamonium") - 0.3, A("s6:monoamonium") + 0.2);
      const melt = ramp(t, A("s6:meleleh") - 0.2, A("s6:menyelimutinya") + 0.3), cut = ramp(t, A("s6:memutus") - 0.1, A("s6:memutus") + 0.4);
      coat.scale.set(Math.max(0.001, melt), 1, 1); coat.position.x = -4.5 * (1 - melt);
      fuelTop.material.emissiveIntensity = 1.6 * (1 - 0.85 * melt);
      molFlames.forEach((f, i) => f(t, Math.max(0, 1 - ramp(t, A("s6:meleleh") + i * 0.25, A("s6:menyelimutinya") + i * 0.25))));
      chain.forEach((o, i) => { const drop = cut * (i % 2 ? 1 : 0.4); o.position.y = -1.9 + 0.3 * Math.sin(i * 1.3 + t * 2) - drop * (0.6 + 0.2 * i); o.material.color.set(cut > 0.5 ? "#4b2a1a" : "#ff8a3a"); o.visible = melt > 0.05 || t > A("s6:bahan") - 0.5; });
      links.forEach((l, i) => { const a = chain[i].position, b = chain[i + 1].position; _v.subVectors(b, a); l.position.copy(a).addScaledVector(_v, 0.5); l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _v.clone().normalize()); l.scale.set(1, Math.max(0.001, _v.length() / 1.2 * (1 - cut)), 1); l.visible = chain[i].visible && cut < 0.98; l.material.opacity = 1 - cut; });
    }
    // ---- ROOM ----
    if (RO.visible) {
      RO.rotation.y = -0.5 + 0.12 * Math.sin(t * 0.3);
      const cb = ramp(t, A("s7:dua") - 0.3, A("s7:kubik") + 0.2), rm = ramp(t, A("s7:Kamar") - 0.3, A("s7:volumenya") + 0.2);
      cube.scale.setScalar(Math.max(0.001, back(cb, 1.3))); labCube.material.opacity = cb; ballR.scale.setScalar(Math.max(0.001, back(ramp(t, A("s7:bola") - 0.3, A("s7:bola") + 0.2), 1.6)));
      room.material.opacity = 0.25 + 0.75 * rm; roomFill.material.opacity = 0.1 * ramp(t, A("s7:dua#2") - 0.3, A("s7:dua#2") + 0.3); labRoom.material.opacity = ramp(t, A("s7:dua#2") - 0.3, A("s7:dua#2") + 0.2);
      const dOn = ramp(t, A("s7:awal") - 0.3, A("s7:awal")); dial.visible = dOn > 0.01; dial.scale.setScalar(Math.max(0.001, back(dOn, 1.4)));
      const sw = ramp(t, A("s7:empat#2") - 0.2, A("s7:pertama") + 0.4);
      sweep.geometry.dispose(); sweep.geometry = new THREE.RingGeometry(0.3, 0.68, 48, 1, Math.PI / 2 - Math.PI * 2 * sw, Math.max(0.001, Math.PI * 2 * sw));
    }
    comp.render();
  };
}
