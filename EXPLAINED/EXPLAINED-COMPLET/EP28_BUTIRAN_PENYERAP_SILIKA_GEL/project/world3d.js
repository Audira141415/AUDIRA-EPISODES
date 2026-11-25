// EP28 SILICA GEL (SATELLITEBRIEFING): the bead is surveyed like a planet. A dark analyst void with a lit amber grid,
// desaturated terrain, amber vector callouts, reticles and true-size scale bars. One logarithmic descent:
//   ORBIT  (0,0,0)      a glassy bead with a cut window onto its pore walls, water molecules clinging inside (s1, s8)
//   TABLE  (-16,0,0)    shoe box, bag, pill bottle with sachets; ordered quartz lattice vs random porous network;
//                        a hard bead drops and bounces; patent sheet 1919 with a silhouette figure (s2, s3)
//   PORES  (0,-60,0)    pore terrain seen from orbit: pits 2.4 units apart with a true 2.4 scale bar; water molecules
//                        fall in and stick to the walls (s4, s5), leave again when heated (s6)
//   LAB    (16,0,0)     balance: 3 bead cubes vs 1 water cube; hot plate at 120 degC (s6)
//   MAP    (40,-60,0)   top-down survey map in metres: basketball court 28x15 = 420 m2 inside 600 and 800 m2 squares (s7)
// Generic products, no brands. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, stage, envStrips, label } from "./lib3d.js";

const C = { void: "#070B0E", navy: "#102A45", grey: "#3E464B", greyL: "#4A5358", amber: "#FFBE55", blue: "#2E70CE", ice: "#90CAF9", white: "#F2F5F6", red: "#E25B45" };
const MONO = "'Courier New', monospace", SANS = "'Arial Black', Arial, sans-serif";
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// CYBER_NEON_VOID-ish analyst grade: cool shadows, amber kept, slight scanline, white flash on scale jumps.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(vec3(l),c,0.9);c+=vec3(-0.01,0.0,0.02)*(1.0-l);c*=0.97+0.03*sin(vUv.y*1920.0*1.5);c=(c-0.5)*1.07+0.5;c=mix(c,vec3(0.95,0.97,1.0),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const std = (c, r = 0.6, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: r, metalness: m, ...x });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const txt = (x, s, px, py, font, color, align = "center") => { x.font = font; x.fillStyle = color; x.textAlign = align; x.textBaseline = "middle"; x.fillText(s, px, py); };
function plate(tex, w, h, parent, x, y, z, basic = true) {
  const mat = basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }) : new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
// amber reticle ring with ticks, the briefing signature
function reticle(parent, r, color = C.amber) {
  const G = new THREE.Group(); parent.add(G);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  G.add(new THREE.Mesh(new THREE.RingGeometry(r * 0.97, r, 64), m));
  for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.PlaneGeometry(r * 0.03, r * 0.22), m); const a = (i * Math.PI) / 2; k.position.set(Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08, 0); k.rotation.z = a + Math.PI / 2; G.add(k); }
  return { G, m };
}
function water(parent) {
  const G = new THREE.Group(); parent.add(G);
  const o = mesh(new THREE.SphereGeometry(0.2, 18, 14), std(C.ice, 0.25, 0, { emissive: new THREE.Color(C.blue), emissiveIntensity: 0.35 }), G);
  for (const s of [-1, 1]) { const h = mesh(new THREE.SphereGeometry(0.12, 14, 10), std(C.white, 0.3), G, s * 0.17, 0.12, 0); h.castShadow = false; }
  o.castShadow = false; return G;
}
function silhouette(color) {
  return canvasTex(256, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.fillStyle = color;
    x.beginPath(); x.arc(128, 70, 40, 0, 6.3); x.fill(); x.fillRect(114, 104, 28, 24);
    x.beginPath(); x.moveTo(60, 135); x.quadraticCurveTo(128, 118, 196, 135); x.lineTo(206, 300); x.lineTo(190, 300); x.lineTo(176, 190); x.lineTo(172, 330); x.lineTo(84, 330); x.lineTo(80, 190); x.lineTo(66, 300); x.lineTo(50, 300); x.closePath(); x.fill();
    x.fillRect(90, 330, 30, 160); x.fillRect(136, 330, 30, 160); x.fillRect(80, 480, 44, 16); x.fillRect(132, 480, 44, 16);
  });
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x070b0e, fog: 0.008, exp: 1.0, bloom: [0.45, 0.5, 0.82] });
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  envStrips(r, scene, [[8, 2, 0xffffff, 2.2, -4, 6, 4], [4, 6, 0x90caf9, 1.2, 6, 2, 3], [10, 1, 0xffbe55, 1.0, 0, -4, 2]]);
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  scene.add(new THREE.HemisphereLight(0xcfe3f5, 0x0b1218, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-6, 12, 9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(0xffbe55, 1.6); rim.position.set(6, 3, -8); scene.add(rim);
  const grid = (size, div, y, parent, op = 0.22) => { const gh = new THREE.GridHelper(size, div, 0xffbe55, 0x2e70ce); gh.material.transparent = true; gh.material.opacity = op; gh.material.toneMapped = false; gh.position.y = y; parent.add(gh); return gh; };

  // ============ ORBIT: the bead ============
  const OR = new THREE.Group(); scene.add(OR);
  grid(60, 30, -3.2, OR, 0.25);
  const poreTex = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = "#1d2a33"; x.fillRect(0, 0, w, h); const R = mulberry(3);
    for (let i = 0; i < 900; i++) { const px = R() * w, py = R() * h, rr = 3 + R() * 9; const gr = x.createRadialGradient(px, py, 0, px, py, rr); gr.addColorStop(0, "#04080b"); gr.addColorStop(0.7, "#0e1a22"); gr.addColorStop(1, "rgba(120,150,170,.5)"); x.fillStyle = gr; x.beginPath(); x.arc(px, py, rr, 0, 6.3); x.fill(); }
  });
  const shell = mesh(new THREE.SphereGeometry(2.6, 64, 48, 0.25 * Math.PI, 1.5 * Math.PI), new THREE.MeshPhysicalMaterial({ color: 0xdbe9f2, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.62, side: THREE.FrontSide }), OR);
  mesh(new THREE.SphereGeometry(2.58, 64, 48, 0.25 * Math.PI, 1.5 * Math.PI), std("#9fb4c2", 0.85, 0, { map: poreTex, side: THREE.BackSide }), OR);
  // cut faces (two half discs) carry the pore texture too
  for (const a of [0.25 * Math.PI, 1.75 * Math.PI]) { const d = mesh(new THREE.CircleGeometry(2.58, 48, -Math.PI / 2, Math.PI), std("#a9bccb", 0.8, 0, { map: poreTex, side: THREE.DoubleSide }), OR); d.rotation.y = -a + Math.PI / 2; }
  OR.rotation.y = -0.35;
  const orbMol = [];
  { const R = mulberry(11); for (let i = 0; i < 22; i++) { const w = water(OR); const a = (-0.2 + R() * 0.4) * Math.PI, rr = 0.6 + R() * 1.8, y = (R() - 0.5) * 3.6; w.position.set(Math.cos(a) * rr * 0.2 + 0.05, y * 0.8, Math.sin(a) * rr); w.userData = { r0: R(), y0: w.position.y }; orbMol.push(w); } }
  const ret0 = reticle(OR, 3.4); ret0.G.position.z = 0.1;
  const orbitTag = plate(canvasTex(512, 96, (x, w, h) => { txt(x, "AUDIRA ORBIT · TARGET 01", w / 2, h / 2, `700 40px ${MONO}`, C.amber); }), 3.6, 0.68, OR, 0, -3.7, 1.2);
  // sachet for s8
  const sachet = new THREE.Group(); sachet.position.set(2.4, -2.0, 2.8); OR.add(sachet);
  mesh(new THREE.BoxGeometry(1.7, 2.3, 0.18), std(C.white, 0.7), sachet);
  plate(canvasTex(340, 460, (x, w, h) => { x.fillStyle = "#f2f5f6"; x.fillRect(0, 0, w, h); txt(x, "SILIKA GEL", w / 2, 80, `900 50px ${SANS}`, "#1b2228"); x.fillStyle = C.red; x.beginPath(); x.arc(w / 2, 230, 90, 0, 6.3); x.fill(); x.strokeStyle = "#fff"; x.lineWidth = 22; x.beginPath(); x.moveTo(w / 2 - 55, 175); x.lineTo(w / 2 + 55, 285); x.stroke(); txt(x, "JANGAN", w / 2, 360, `900 44px ${SANS}`, "#1b2228"); txt(x, "DIMAKAN", w / 2, 410, `900 44px ${SANS}`, "#1b2228"); }), 1.6, 2.17, sachet, 0, 0, 0.1, false);

  // ============ TABLE ============
  const TB = new THREE.Group(); TB.position.set(-16, 0, 0); scene.add(TB);
  mesh(new THREE.BoxGeometry(14, 0.3, 7), std("#262d32", 0.55, 0.2), TB, 0, -1.65, 0);
  grid(14, 14, -1.49, TB, 0.18);
  const prod = new THREE.Group(); TB.add(prod);
  const shoe = mesh(new THREE.BoxGeometry(2.4, 1.0, 1.4), std("#7a6a58", 0.8), prod, -4.2, -1.0, 0.5); mesh(new THREE.BoxGeometry(2.5, 0.22, 1.5), std("#8d7c68", 0.8), prod, -4.2, -0.45, 0.5);
  const bag = mesh(new THREE.BoxGeometry(1.7, 1.6, 0.7), std("#5b6c7d", 0.7), prod, -1.6, -0.7, 0.6); const hd = mesh(new THREE.TorusGeometry(0.5, 0.06, 10, 24, Math.PI), std("#3b4752", 0.6), prod, -1.6, 0.1, 0.6);
  const bottle = mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 32), std("#c87d3a", 0.25, 0, { transparent: true, opacity: 0.85 }), prod, 0.6, -0.8, 0.7); mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 32), std("#e8ecef", 0.5), prod, 0.6, 0.05, 0.7);
  const sachets = [[-4.2, -0.2, 1.3], [-1.6, 0.3, 1.0], [0.6, 0.45, 0.7]].map(([x, y, z]) => { const s = mesh(new THREE.BoxGeometry(0.55, 0.75, 0.06), std(C.white, 0.7), prod, x, y, z); s.castShadow = false; return s; });
  // lattices: ordered (quartz) vs random porous
  const latA = new THREE.Group(), latB = new THREE.Group(); latA.position.set(-2.4, 0.4, 0.4); latB.position.set(2.6, 0.4, 0.4); TB.add(latA, latB);
  const siM = std(C.amber, 0.3, 0.1, { emissive: new THREE.Color("#5a3a00"), emissiveIntensity: 0.4 }), oM = std("#d9e2e8", 0.3), bondM = std("#8c99a3", 0.4);
  const bond = (p, a, b) => { const d = new THREE.Vector3().subVectors(b, a), m = mesh(new THREE.CylinderGeometry(0.035, 0.035, d.length(), 6), bondM, p); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = false; };
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 2; k++) {
    const p = new THREE.Vector3((i - 1.5) * 0.7, (j - 1.5) * 0.7, (k - 0.5) * 0.7); mesh(new THREE.SphereGeometry(0.13, 14, 10), siM, latA).position.copy(p);
    if (i < 3) { const q = p.clone().add(new THREE.Vector3(0.7, 0, 0)); mesh(new THREE.SphereGeometry(0.08, 10, 8), oM, latA).position.copy(p.clone().lerp(q, 0.5)); bond(latA, p, q); }
    if (j < 3) { const q = p.clone().add(new THREE.Vector3(0, 0.7, 0)); mesh(new THREE.SphereGeometry(0.08, 10, 8), oM, latA).position.copy(p.clone().lerp(q, 0.5)); bond(latA, p, q); }
  }
  { const R = mulberry(5), pts = [];
    for (let i = 0; i < 60; i++) { const p = new THREE.Vector3((R() - 0.5) * 2.6, (R() - 0.5) * 2.6, (R() - 0.5) * 1.0); const hole = [[0.5, 0.4], [-0.6, -0.5], [0.3, -0.8]].some(([hx, hy]) => Math.hypot(p.x - hx, p.y - hy) < 0.45); if (hole) continue; pts.push(p); mesh(new THREE.SphereGeometry(0.12, 12, 10), siM, latB).position.copy(p); }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (pts[i].distanceTo(pts[j]) < 0.62) bond(latB, pts[i], pts[j]);
  }
  const labQ = label("KUARSA: TERATUR", { font: `700 54px ${MONO}`, color: C.amber, bg: "rgba(7,11,14,.85)", w: 640, h: 100, size: 2.4 }); labQ.position.set(-2.4, 2.25, 0.5); TB.add(labQ);
  const labR = label("SILIKA GEL: ACAK", { font: `700 54px ${MONO}`, color: C.ice, bg: "rgba(7,11,14,.85)", w: 640, h: 100, size: 2.4 }); labR.position.set(2.6, 2.25, 0.5); TB.add(labR);
  const bead2 = mesh(new THREE.SphereGeometry(0.45, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xe4eef4, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.8 }), TB, 0, 0, 1.2);
  const patent = new THREE.Group(); patent.position.set(3.4, 0.2, -0.6); patent.rotation.y = -0.25; TB.add(patent);
  plate(canvasTex(512, 680, (x, w, h) => { x.fillStyle = "#e9e4d6"; x.fillRect(0, 0, w, h); txt(x, "PATEN", w / 2, 80, `900 64px ${SANS}`, "#1b2228"); txt(x, "1919", w / 2, 160, `900 96px ${MONO}`, "#8a5a00"); x.fillStyle = "rgba(27,34,40,.35)"; for (let i = 0; i < 12; i++) x.fillRect(60, 240 + i * 30, 392 - (i % 3) * 60, 10); x.strokeStyle = "#1b2228"; x.lineWidth = 3; x.beginPath(); x.arc(w / 2, 600, 40, 0, 6.3); x.stroke(); }), 2.2, 2.92, patent, 0, 0, 0, false);
  const fig = plate(silhouette("#0f1820"), 1.6, 3.2, TB, 5.6, 0.0, -0.4, false);
  const ret1 = reticle(TB, 1.0); ret1.G.position.set(0, 0, 1.75);

  // ============ PORES terrain ============
  const PO = new THREE.Group(); PO.position.set(0, -60, 0); scene.add(PO);
  const SP = 2.4, pits = [];
  { const R = mulberry(17); for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) pits.push([i * SP + (j % 2) * SP * 0.5 + (R() - 0.5) * 0.4, j * SP * 0.88 + (R() - 0.5) * 0.4, 0.75 + R() * 0.25]); }
  const hgt = (x, z) => { let h = 0; for (const [px, pz, rr] of pits) { const d = Math.hypot(x - px, z - pz); if (d < rr) h = Math.min(h, -1.7 * (1 - (d / rr) ** 2)); } return h; };
  { const geo = new THREE.PlaneGeometry(34, 30, 220, 200); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const h = hgt(p.getX(i), p.getZ(i)); p.setY(i, h); const lip = h < -0.02 && h > -0.45 ? 1 : 0; c.set(C.greyL).lerp(new THREE.Color("#141b20"), clamp01(-h / 1.7)).lerp(new THREE.Color(C.amber), lip * 0.25); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    mesh(geo, std("#ffffff", 0.75, 0.05, { vertexColors: true }), PO); }
  grid(34, 34 / SP * 2, 0.04, PO, 0.16);
  const bar = new THREE.Group(); PO.add(bar);
  mesh(new THREE.BoxGeometry(SP, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: C.amber, toneMapped: false }), bar);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), new THREE.MeshBasicMaterial({ color: C.amber, toneMapped: false }), bar, s * SP / 2, 0, 0);
  const barLab = plate(canvasTex(400, 110, (x, w, h) => { x.fillStyle = "rgba(7,11,14,.85)"; x.fillRect(0, 0, w, h); txt(x, "2,4 nm", w / 2, h / 2 + 2, `900 70px ${MONO}`, C.amber); }), 1.9, 0.52, bar, 0, 0.5, 0);
  const pA = pits.find((p) => Math.abs(p[0]) < 1.4 && Math.abs(p[1]) < 1.4) || pits[84];
  bar.position.set(pA[0], 0.35, pA[1] + 1.5);
  const ret2 = reticle(PO, 1.4); ret2.G.rotation.x = -Math.PI / 2; ret2.G.position.set(pA[0], 0.06, pA[1]);
  const mols = [];
  { const R = mulberry(23), near = pits.filter((p) => Math.hypot(p[0] - pA[0], p[1] - pA[1]) < 6);
    for (let i = 0; i < 40; i++) { const w = water(PO), p = near[i % near.length], a = R() * 6.283, rr = p[2] * (0.55 + R() * 0.25), tx = p[0] + Math.cos(a) * rr, tz = p[1] + Math.sin(a) * rr;
      w.userData = { s: [pA[0] + (R() - 0.5) * 10, 5 + R() * 4, pA[1] + (R() - 0.5) * 8], e: [tx, hgt(tx, tz) + 0.18, tz], d: R() * 1.2, ph: R() * 6.28 }; w.scale.setScalar(0.9); mols.push(w); } }

  // ============ LAB ============
  const LB = new THREE.Group(); LB.position.set(16, 0, 0); scene.add(LB);
  mesh(new THREE.BoxGeometry(12, 0.3, 6), std("#262d32", 0.55, 0.2), LB, 0, -1.65, 0); grid(12, 12, -1.49, LB, 0.18);
  const beam = new THREE.Group(); beam.position.set(-2.2, 1.3, 0); LB.add(beam);
  mesh(new THREE.CylinderGeometry(0.1, 0.16, 2.8, 16), std("#9aa5ad", 0.3, 0.8), LB, -2.2, -0.1, 0);
  mesh(new THREE.BoxGeometry(4.4, 0.12, 0.2), std("#c8d0d6", 0.25, 0.9), beam);
  const panL = new THREE.Group(), panR = new THREE.Group(); panL.position.x = -2; panR.position.x = 2; beam.add(panL, panR);
  for (const p of [panL, panR]) { mesh(new THREE.CylinderGeometry(0.8, 0.7, 0.08, 32), std("#c8d0d6", 0.25, 0.9), p, 0, -1.0, 0); mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.0, 4), std("#9aa5ad"), p, 0, -0.5, 0); }
  const cubesL = [0, 1, 2].map((i) => mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), std("#cfd9e0", 0.2, 0, { transparent: true, opacity: 0.9 }), panL, (i - 1) * 0.45, -0.75, 0));
  const cubeR = mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), std(C.ice, 0.15, 0, { emissive: new THREE.Color(C.blue), emissiveIntensity: 0.5, transparent: true, opacity: 0.92 }), panR, 0, -0.75, 0);
  const hot = mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.35, 40), std("#30363b", 0.5, 0.6), LB, 2.8, -1.3, 0.3);
  const coil = mesh(new THREE.TorusGeometry(0.9, 0.08, 10, 48), std("#3a1a0a", 0.4, 0, { emissive: new THREE.Color("#ff6a1a"), emissiveIntensity: 0 }), LB, 2.8, -1.1, 0.3); coil.rotation.x = Math.PI / 2;
  const beadsHot = [];
  { const R = mulberry(31); for (let i = 0; i < 14; i++) beadsHot.push(mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshPhysicalMaterial({ color: 0xe4eef4, roughness: 0.15, clearcoat: 1 }), LB, 2.8 + (R() - 0.5) * 1.4, -0.95, 0.3 + (R() - 0.5) * 1.2)); }
  const steam = [];
  for (let i = 0; i < 12; i++) { const w = water(LB); w.scale.setScalar(0.7); steam.push(w); }
  const sign = plate(canvasTex(640, 120, (x, w, h) => { x.fillStyle = "rgba(7,11,14,.9)"; x.fillRect(0, 0, w, h); x.strokeStyle = C.amber; x.lineWidth = 4; x.strokeRect(4, 4, w - 8, h - 8); txt(x, "AUDIRA LAB · UJI SERAP", w / 2, h / 2 + 2, `700 46px ${MONO}`, C.amber); }), 4.4, 0.83, LB, 0.3, 3.0, -1.5);
  const thermo = label("120 °C", { font: `900 80px ${MONO}`, color: "#ffb36b", bg: "rgba(7,11,14,.85)", w: 420, h: 120, size: 1.8 }); thermo.position.set(2.8, 1.25, 0.6); LB.add(thermo);

  // ============ MAP ============
  const MP = new THREE.Group(); MP.position.set(40, -60, 0); scene.add(MP);
  const mapTex = canvasTex(1024, 1024, (x, w, h) => {
    const R = mulberry(9); x.fillStyle = "#1c2328"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${70 + R() * 30},${80 + R() * 30},${84 + R() * 30},${0.25 + R() * 0.3})`; x.fillRect(R() * w, R() * h, 10 + R() * 60, 10 + R() * 60); }
    const s = w / 40, cx = w / 2, cy = h / 2; // 40 m across
    const sq = (a, col, lw, dash) => { const L = Math.sqrt(a) * s; x.setLineDash(dash); x.strokeStyle = col; x.lineWidth = lw; x.strokeRect(cx - L / 2, cy - L / 2, L, L); x.setLineDash([]); };
    sq(800, C.ice, 6, [18, 10]); sq(600, C.ice, 6, []);
    x.fillStyle = "rgba(255,190,85,.28)"; x.fillRect(cx - 14 * s, cy - 7.5 * s, 28 * s, 15 * s); x.strokeStyle = C.amber; x.lineWidth = 6; x.strokeRect(cx - 14 * s, cy - 7.5 * s, 28 * s, 15 * s);
    x.beginPath(); x.moveTo(cx, cy - 7.5 * s); x.lineTo(cx, cy + 7.5 * s); x.stroke(); x.beginPath(); x.arc(cx, cy, 1.8 * s, 0, 6.3); x.stroke();
    for (const sd of [-1, 1]) { x.beginPath(); x.arc(cx + sd * 14 * s, cy, 6.75 * s, sd < 0 ? -1.2 : Math.PI - 1.2, sd < 0 ? 1.2 : Math.PI + 1.2); x.stroke(); }
    txt(x, "SKALA 10 m", 150, h - 50, `700 34px ${MONO}`, C.amber); x.fillStyle = C.amber; x.fillRect(60, h - 90, 10 * s, 8);
  });
  const mapP = mesh(new THREE.PlaneGeometry(40, 40), std("#ffffff", 0.85, 0, { map: mapTex }), MP); mapP.rotation.x = -Math.PI / 2;
  const sqIn = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: C.ice, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), MP, 0, 0.05, 0); sqIn.rotation.x = -Math.PI / 2;
  const courtGlow = mesh(new THREE.PlaneGeometry(28, 15), new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), MP, 0, 0.08, 0); courtGlow.rotation.x = -Math.PI / 2;
  const tagM = (s, c) => { const l = label(s, { font: `900 64px ${MONO}`, color: c, bg: "rgba(7,11,14,.88)", w: 760, h: 110, size: 9 }); l.rotation.x = -Math.PI / 2; MP.add(l); return l; };
  const tag600 = tagM("600–800 m²", C.ice), tag420 = tagM("LAPANGAN 420 m²", C.amber);
  tag600.position.set(0, 0.2, -10.5); tag420.position.set(0, 0.25, 0);

  // ---------- camera ----------
  const Ks = (k, d = 0) => K[k] + d;
  const tTb = A("s2:Bahannya") - 0.2;
  const cpath = track([
    [0, 1.4, -0.2, 23.0, 0.2, -0.65, 0],
    [Ks("s1e") - 0.4, 1.0, -0.3, 21.5, 0.2, -0.6, 0],
    [Ks("s2", 0.8), -17.4, 1.5, 18.5, -17.6, -0.9, 0],
    [tTb, -17.8, 1.4, 17.8, -17.8, -0.9, 0],
    [tTb + 1.2, -15.8, 2.2, 19.5, -15.8, -0.35, 0],
    [Ks("s2e"), -15.6, 2.2, 19.0, -15.8, -0.35, 0],
    [A("s3:dipatenkan") - 0.3, -15.8, 1.0, 13.0, -16.3, -0.9, 0.5],
    [A("s3:dipatenkan") + 1.0, -12.8, 1.6, 18.5, -13.0, -0.6, 0],
    [Ks("s3e") - 0.6, -12.6, 1.4, 17.5, -13.0, -0.6, 0],
    [Ks("s4", 0.25), 0, -60 + 24, 16, 0, -60, 0],
    [A("s4:dua") - 0.4, pA[0] + 0.4, -60 + 8.5, pA[1] + 9.0, pA[0], -60 - 0.4, pA[1]],
    [Ks("s4e"), pA[0] + 0.2, -60 + 7.0, pA[1] + 7.6, pA[0], -60 - 0.6, pA[1]],
    [Ks("s5", 1.2), pA[0] - 2.0, -60 + 5.6, pA[1] + 7.8, pA[0], -60 - 0.4, pA[1]],
    [Ks("s5e"), pA[0] - 1.0, -60 + 4.8, pA[1] + 6.8, pA[0], -60 - 0.6, pA[1]],
    [Ks("s6", 0.9), 15.4, 1.6, 20.0, 15.6, -0.5, 0],
    [A("s6:jenuh") - 0.2, 16.2, 1.4, 18.5, 16.4, -0.5, 0],
    [Ks("s6e"), 18.2, 1.0, 13.5, 18.8, -0.6, 0.2],
    [Ks("s7", 0.4), 40, -60 + 88, 26, 40, -60, -4],
    [A("s7:lapangan") - 0.3, 40, -60 + 82, 24, 40, -60, -4.5],
    [Ks("s7e"), 40, -60 + 78, 22, 40, -60, -4.2],
    [Ks("s8", 0.9), 1.8, -0.1, 23.0, 0.6, -0.65, 0],
    [K.dur, 1.2, -0.2, 20.5, 0.5, -0.6, 0],
  ]);
  const _t = new THREE.Vector3();
  const win = (t, a, b, f = 0.4) => ramp(t, a - f, a) * (1 - ramp(t, b - f, b));

  return function draw(t) {
    const [px, py, pz, tx, ty, tz] = cpath(t);
    cam.position.set(px + 0.1 * Math.sin(t * 0.41), py + 0.06 * Math.sin(t * 0.57), pz); cam.lookAt(_t.set(tx, ty, tz));
    gradeP.uniforms.flash.value = Math.max(...["s2", "s4", "s6", "s7", "s8"].map((s) => 0.5 * Math.max(0, 1 - Math.abs(t - K[s]) / 0.18)), ...["s3", "s5"].map((s) => 0.15 * Math.max(0, 1 - Math.abs(t - K[s]) / 0.12)));
    const inOrbit = t < K.s2 + 0.3 || t > K.s8 - 0.3;
    OR.visible = inOrbit; TB.visible = t > K.s2 - 0.4 && t < K.s4 + 0.4; PO.visible = t > K.s4 - 0.4 && t < K.s6 + 0.4; LB.visible = t > K.s6 - 0.4 && t < K.s7 + 0.4; MP.visible = t > K.s7 - 0.4 && t < K.s8 + 0.4;
    // ORBIT
    if (OR.visible) {
      OR.rotation.y = -0.35 + 0.06 * Math.sin(t * 0.3);
      shell.material.opacity = 0.62 - 0.12 * win(t, A("s1:menempel") - 0.3, K.s2);
      orbMol.forEach((w, i) => { const s8 = t > K.s8 - 0.3, j = 0.03 * Math.sin(t * 6 + i); w.visible = true; w.scale.setScalar(s8 ? 0.6 : 0.6 + 0.25 * ramp(t, A("s1:menempel") - 0.3 + w.userData.r0 * 0.4, A("s1:menempel") + 0.4 + w.userData.r0 * 0.4)); w.rotation.y = t * 0.6 + i; w.position.y = w.userData.y0 + j; });
      ret0.m.opacity = 0.75; ret0.G.rotation.z = t * 0.15; ret0.G.lookAt(cam.position);
      orbitTag.material.opacity = 0.9;
      const sv = ramp(t, A("s8:dimakan") - 0.4, A("s8:dimakan") + 0.2);
      sachet.visible = sv > 0.01 && t > K.s8 - 0.3; sachet.scale.setScalar(Math.max(0.001, back(sv, 1.4))); sachet.rotation.z = 0.12 * Math.sin(t * 1.2);
    }
    // TABLE
    if (TB.visible) {
      const pIn = (k) => back(clamp01((t - A(k) + 0.25) / 0.45), 1.5);
      shoe.scale.setScalar(Math.max(0.001, pIn("s2:sepatu"))); bag.scale.setScalar(Math.max(0.001, pIn("s2:tas"))); hd.scale.setScalar(Math.max(0.001, pIn("s2:tas"))); bottle.scale.setScalar(Math.max(0.001, pIn("s2:botol")));
      sachets.forEach((s, i) => { s.scale.setScalar(Math.max(0.001, pIn(["s2:sepatu", "s2:tas", "s2:botol"][i]))); s.rotation.z = 0.15 * Math.sin(t * 1.4 + i); });
      const lat = ramp(t, A("s2:silikon") - 0.4, A("s2:silikon") + 0.3), prodOut = ramp(t, A("s2:silikon") - 0.6, A("s2:silikon"));
      prod.position.y = -3.5 * prodOut; prod.visible = prodOut < 0.99;
      latA.visible = latB.visible = lat > 0.01 && t < K.s3 + 0.6; latA.scale.setScalar(Math.max(0.001, lat * ramp(t, A("s2:kuarsa") - 0.5, A("s2:kuarsa") + 0.2) * (1 - ramp(t, K.s3, K.s3 + 0.5)))); latB.scale.setScalar(Math.max(0.001, lat * (1 - ramp(t, K.s3, K.s3 + 0.5))));
      latA.rotation.y = 0.3 * Math.sin(t * 0.5); latB.rotation.y = -0.3 * Math.sin(t * 0.5 + 1); latB.rotation.x = 0.1 * Math.sin(t * 0.7);
      labQ.material.opacity = latA.visible ? ramp(t, A("s2:kuarsa"), A("s2:kuarsa") + 0.3) : 0; labR.material.opacity = latB.visible ? ramp(t, A("s2:acak"), A("s2:acak") + 0.3) : 0;
      // hard bead drops and bounces on "keras"
      const td = A("s3:keras") - 0.5, u = Math.max(0, t - td), bounce = Math.abs(Math.cos(u * 6)) * Math.exp(-u * 2.6) * 1.6;
      bead2.visible = t > K.s3 - 0.2; bead2.position.set(-0.4, -1.05 + (t < td ? 2.6 : bounce), 1.2); bead2.rotation.x = t * 0.4;
      ret1.m.opacity = 0.8 * win(t, A("s3:gel") - 0.2, A("s3:dipatenkan")); ret1.G.position.set(-0.4, bead2.position.y, 1.75);
      const pt = ramp(t, A("s3:dipatenkan") - 0.4, A("s3:dipatenkan") + 0.3); patent.visible = pt > 0.01; patent.scale.setScalar(Math.max(0.001, back(pt, 1.3))); patent.position.y = 0.2 + 0.05 * Math.sin(t * 1.1);
      const fg = ramp(t, A("s3:Walter") - 0.3, A("s3:Walter") + 0.3); fig.visible = fg > 0.01; fig.material.opacity = fg;
    }
    // PORES
    if (PO.visible) {
      ret2.m.opacity = 0.8 * win(t, A("s4:jaringan"), K.s5 + 0.5); ret2.G.rotation.z = t * 0.2;
      const bs = ramp(t, A("s4:dua") - 0.2, A("s4:dua") + 0.3); bar.visible = bs > 0.01 && t < K.s6; bar.scale.set(Math.max(0.001, bs), 1, 1); barLab.material.opacity = ramp(t, A("s4:nanometer") - 0.4, A("s4:nanometer")); barLab.lookAt(cam.position.x - PO.position.x, cam.position.y - PO.position.y, cam.position.z - PO.position.z);
      const ins = A("s5:masuk") - 0.6, stick = A("s5:menempel");
      mols.forEach((w, i) => { const { s, e, d, ph } = w.userData; const u = ramp(t, ins + d * 0.8, stick + d * 0.6); const leave = ramp(t, K.s6 - 0.2, K.s6 + 0.3);
        w.visible = t > K.s5 - 0.3; const arc = Math.sin(Math.PI * u) * 1.2;
        w.position.set(s[0] + (e[0] - s[0]) * u + 0.3 * Math.sin(t * 2 + ph) * (1 - u), s[1] + (e[1] - s[1]) * u + arc + leave * 6, s[2] + (e[2] - s[2]) * u);
        w.rotation.set(t * (1 - u) * 2 + ph, t * 0.7 + ph, 0); w.scale.setScalar(0.9 * (u >= 1 ? 1 + 0.05 * Math.sin(t * 9 + ph) : 1)); });
    }
    // LAB
    if (LB.visible) {
      const sp = ramp(t, A("s6:menahan") - 0.3, A("s6:sepertiga") + 0.2);
      cubesL.forEach((c, i) => c.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s6:menahan") + 0.2 - i * 0.15) / 0.4), 1.4))));
      cubeR.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s6:sepertiga") + 0.2) / 0.4), 1.6)));
      beam.rotation.z = 0.12 * (1 - sp) - 0.04 * sp + 0.01 * Math.sin(t * 1.3); panL.rotation.z = -beam.rotation.z; panR.rotation.z = -beam.rotation.z;
      const heat = ramp(t, A("s6:dipanaskan") - 0.4, A("s6:seratus"));
      coil.material.emissiveIntensity = 2.2 * heat * (0.9 + 0.1 * Math.sin(t * 7));
      thermo.material.opacity = ramp(t, A("s6:seratus") - 0.2, A("s6:seratus") + 0.3);
      steam.forEach((w, i) => { const u = (t * 0.45 + i / steam.length) % 1; w.visible = heat > 0.2; w.position.set(2.8 + 0.9 * Math.sin(i * 2.1), -0.8 + u * 3.6, 0.3 + 0.7 * Math.cos(i * 1.7)); w.rotation.y = t + i; w.scale.setScalar(0.7 * (1 - u * 0.5)); });
      sign.material.opacity = 1;
    }
    // MAP
    if (MP.visible) {
      const a6 = ramp(t, A("s7:enam") - 0.2, A("s7:delapan") + 0.4), c4 = ramp(t, A("s7:lapangan") - 0.3, A("s7:empat") + 0.3);
      const side = Math.sqrt(600 + 200 * ramp(t, A("s7:delapan") - 0.2, A("s7:delapan") + 0.5));
      sqIn.scale.set(side, side, 1); sqIn.material.opacity = 0.18 * a6;
      courtGlow.material.opacity = 0.35 * c4 * (0.8 + 0.2 * Math.sin(t * 4)); tag600.material.opacity = a6; tag420.material.opacity = c4;
    }
    comp.render();
  };
}
