// EP04 KOREK API (NANOFORGE): a dark cytoplasm-blue void where the match factory floats like a specimen under a
// microscope. Macro stations (log peeler, soak tank, steel belt with paraffin and head-paste dips, drying waves,
// strip coater, the finished box) sit on one line; glossy ball-and-stick molecules float beside each step as
// callouts. At the strike the camera dives straight through the strip into the molecular scale (red phosphorus
// chains meet potassium chlorate), then pulls back out to a burning match and a field of thousands of matches.
// Own illustrations, no brands. Every value is a pure function of t (seek-safe, seeded randomness only).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Teal-orange cinema grade + soft chromatic fringe at the edges (cryo-EM lens feel).
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;
  void main(){vec2 d=vUv-0.5;float r2=dot(d,d);vec2 o=d*r2*0.012;
  vec3 c=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(0.92,1.0,1.08),1.0-smoothstep(0.0,0.45,l));c=mix(c,c*vec3(1.06,1.0,0.94),smoothstep(0.35,0.9,l));
  c=mix(vec3(l),c,1.08);gl_FragColor=vec4(max(c,vec3(0.0)),1.0);}` };

// ---------- palette (kit: microscopyVoid, thymineCyan, adenineGold, cytosineViolet, guanineRuby, membraneGlow) ----------
const VOID = 0x02050f, CYAN = 0x00f5d4, GOLD = 0xf59e0b, VIOLET = 0xa855f7, RUBY = 0xf43f5e, MEMB = 0x38bdf8;
// element: [colour, radius]
const EL = { P: [0xf43f5e, 0.42], Pw: [0xe6cf8a, 0.5], K: [0xa855f7, 0.6], Cl: [0x4ade80, 0.46], O: [0xff7a59, 0.36], S: [0xfacc15, 0.42],
  C: [0x55607a, 0.36], H: [0xf1f5f9, 0.22], N: [0x38bdf8, 0.4], Pp: [0xf59e0b, 0.46], Si: [0x22d3ee, 0.44], Dy: [0xff2d55, 0.38] };
const SPH = new THREE.SphereGeometry(1, 32, 22), BCYL = new THREE.CylinderGeometry(1, 1, 1, 14);
const _mc = {};
const amat = (el) => _mc[el] || (_mc[el] = new THREE.MeshPhysicalMaterial({ color: EL[el][0], emissive: EL[el][0], emissiveIntensity: 0.3, roughness: 0.2, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.1 }));
const bondMat = new THREE.MeshPhysicalMaterial({ color: 0xdbe7ff, emissive: 0x1d3a6b, emissiveIntensity: 0.5, roughness: 0.25, clearcoat: 1 });
const UP = new THREE.Vector3(0, 1, 0), _v = new THREE.Vector3(), _w = new THREE.Vector3();
function setBond(m, a, b, r) {
  _v.subVectors(b, a); const L = _v.length();
  m.position.addVectors(a, b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, _v.divideScalar(L || 1));
  m.scale.set(r, Math.max(0.001, L), r);
}
function molecule(atoms, bonds, r = 0.1, own = false) {
  const G = new THREE.Group();
  const A = atoms.map(([el, x, y, z]) => {
    const m = new THREE.Mesh(SPH, own ? amat(el).clone() : amat(el));
    m.scale.setScalar(EL[el][1]); m.position.set(x, y, z); m.userData.home = m.position.clone(); G.add(m); return m;
  });
  const B = bonds.map(([i, j]) => { const m = new THREE.Mesh(BCYL, bondMat); G.add(m); setBond(m, A[i].position, A[j].position, r); return { m, i, j }; });
  return { G, A, B, sync(hide = () => false) { for (const b of B) { setBond(b.m, A[b.i].position, A[b.j].position, r); if (hide(b)) b.m.scale.set(0.001, 0.001, 0.001); } } };
}
const T4 = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((p) => p.map((x) => x / Math.sqrt(3)));
const centred = (c, l, d) => [[c, 0, 0, 0], ...T4.map((p) => [l, p[0] * d, p[1] * d, p[2] * d])];
const star = (n) => Array.from({ length: n }, (_, i) => [0, i + 1]);
const MOL = {
  P4: () => molecule(T4.map((p) => ["Pw", p[0] * 0.95, p[1] * 0.95, p[2] * 0.95]), [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], 0.12),
  KClO3: () => molecule([["Cl", 0, 0, 0], ["O", 0.94, -0.33, 0], ["O", -0.47, -0.33, 0.82], ["O", -0.47, -0.33, -0.82], ["K", 0.1, 1.45, 0.2]], [[0, 1], [0, 2], [0, 3]]),
  NH4: () => molecule(centred("N", "H", 0.72), star(4)),
  PO4: () => molecule(centred("Pp", "O", 0.95), star(4)),
  SiO4: () => molecule(centred("Si", "O", 0.95), star(4)),
  S8: () => molecule(Array.from({ length: 8 }, (_, i) => ["S", Math.cos(i * Math.PI / 4) * 1.15, i % 2 ? 0.3 : -0.3, Math.sin(i * Math.PI / 4) * 1.15]), Array.from({ length: 8 }, (_, i) => [i, (i + 1) % 8])),
  Pchain: (n = 9, own = false) => molecule(Array.from({ length: n }, (_, i) => ["P", (i % 2) * 0.5, i * 0.62, ((i % 3) - 1) * 0.28]), Array.from({ length: n - 1 }, (_, i) => [i, i + 1]), 0.1, own),
  Paraffin: (n = 8) => {
    const at = [], bd = [];
    for (let i = 0; i < n; i++) { at.push(["C", (i - (n - 1) / 2) * 0.72, i % 2 ? 0.22 : -0.22, 0]); if (i) bd.push([at.length - 1 - 3, at.length - 1]); const c = at.length - 1; const s = i % 2 ? 1 : -1; at.push(["H", (i - (n - 1) / 2) * 0.72, s * 0.62, 0.48], ["H", (i - (n - 1) / 2) * 0.72, s * 0.62, -0.48]); bd.push([c, c + 1], [c, c + 2]); }
    // fix C-C bonds: carbons are every 3rd atom
    const cc = []; for (let i = 1; i < n; i++) cc.push([(i - 1) * 3, i * 3]);
    return molecule(at, [...cc, ...bd.filter(([a, b]) => b - a <= 2 && a % 3 === 0)]);
  },
  Glue: () => {
    const at = [], bd = [];
    for (const cx of [-1.25, 1.25]) { const b = at.length; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.5; at.push([i === 0 ? "O" : "C", cx + Math.cos(a) * 0.82, Math.sin(a) * 0.82, (i % 2 ? 0.12 : -0.12)]); bd.push([b + i, b + (i + 1) % 6]); } at.push(["O", cx, 0, 0.85]); bd.push([b + 2, b + 6]); }
    at.push(["O", 0, 0.1, 0]); bd.push([0, 14], [10, 14]);
    return molecule(at, bd);
  },
  Dye: () => {
    const at = [], bd = [];
    for (const cx of [-1.35, 1.35]) { const b = at.length; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; at.push(["Dy", cx + Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0]); bd.push([b + i, b + (i + 1) % 6]); } }
    at.push(["N", -0.32, 0.05, 0], ["N", 0.32, -0.05, 0]); bd.push([0, 12], [12, 13], [13, 9]);
    return molecule(at, bd);
  },
};

// Fresnel rim so macro objects separate from the void (kit: bioluminescent rim).
function glow(color, { rough = 0.45, metal = 0, rim = CYAN, ri = 0.45, map = null, em = 0x000000, ei = 0, extra = {} } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, map, emissive: em, emissiveIntensity: ei, ...extra });
  const rc = new THREE.Color(rim);
  m.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace("#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>\n float frn = pow(clamp(1.0 - abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 2.6); totalEmissiveRadiance += vec3(${rc.r.toFixed(3)},${rc.g.toFixed(3)},${rc.b.toFixed(3)}) * ${ri.toFixed(3)} * frn;`);
  };
  m.customProgramCacheKey = () => "glow" + rim + ":" + ri;
  return m;
}
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; };
const frac = (x) => x - Math.floor(x);
const gauss = (x, w) => Math.exp(-(x / w) * (x / w));

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: VOID, fog: 0.0105, exp: 1.0, bloom: [0.62, 0.55, 0.78], fov: 38, shadow: false });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.insertPass(new ShaderPass(Grade), 3);
  envStrips(r, scene, [[6, 2, 0xffffff, 1.6, -3, 4, 3], [2, 6, CYAN, 1.2, 5, 1, -2], [3, 3, VIOLET, 1.0, -5, -1, -3], [4, 1, GOLD, 0.9, 0, -4, 4]], 0x02050f);
  scene.environmentIntensity = 0.55;
  scene.add(cam);
  const amb = new THREE.AmbientLight(0x0a192f, 1.6); scene.add(amb);
  const key = new THREE.DirectionalLight(0xc7d2fe, 2.3); scene.add(key); scene.add(key.target);
  const rimC = new THREE.PointLight(CYAN, 60, 30, 1.6), rimM = new THREE.PointLight(RUBY, 48, 30, 1.6), rimG = new THREE.PointLight(GOLD, 26, 26, 1.6);
  scene.add(rimC, rimM, rimG);
  const dummy = new THREE.Object3D();

  // ---------- shared textures ----------
  const grainT = canvasTex(256, 64, (g, w, h) => { g.fillStyle = "#c98f55"; g.fillRect(0, 0, w, h); const R = mulberry(41); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${90 + R() * 40},${50 + R() * 20},20,${0.15 + R() * 0.25})`; g.lineWidth = 1 + R() * 2; const y = R() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + R() * 6 - 3, w * 0.6, y + R() * 6 - 3, w, y + R() * 4 - 2); g.stroke(); } });
  const woodM = glow(0xffffff, { map: grainT, rough: 0.62, ri: 0.32, rim: GOLD });
  const stripT = canvasTex(128, 400, (g, w, h) => { g.fillStyle = "#2a0d10"; g.fillRect(0, 0, w, h); const R = mulberry(7); for (let i = 0; i < 2600; i++) { const c = R(); g.fillStyle = c < 0.5 ? `rgba(196,40,52,${0.5 + R() * 0.5})` : c < 0.8 ? "rgba(20,8,8,.9)" : `rgba(150,220,255,${0.3 + R() * 0.4})`; g.fillRect(8 + R() * (w - 16), 8 + R() * (h - 16), 2 + R() * 2.5, 2 + R() * 2.5); } g.strokeStyle = "rgba(0,245,212,.5)"; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); });
  const stripM = glow(0xffffff, { map: stripT, rough: 0.85, rim: RUBY, ri: 0.35, em: 0x5a0a14, ei: 0.25 });
  const sleeveM = glow(0x0d2a3a, { rough: 0.5, rim: CYAN, ri: 0.4 });
  const labelT = canvasTex(360, 520, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b2440"); gr.addColorStop(1, "#06101f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,245,212,.85)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    const P = [[180, 150], [120, 205], [240, 205], [150, 270], [215, 270]];
    g.strokeStyle = "#dbe7ff"; g.lineWidth = 7; for (const [a, b] of [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]]) { g.beginPath(); g.moveTo(...P[a]); g.lineTo(...P[b]); g.stroke(); }
    P.forEach(([x, y], i) => { g.fillStyle = ["#f43f5e", "#a855f7", "#4ade80", "#ff7a59", "#f59e0b"][i]; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.arc(x - 7, y - 7, 7, 0, 7); g.fill(); });
    g.fillStyle = "#ffffff"; g.font = "800 70px 'Space Grotesk', Arial, sans-serif"; g.textAlign = "center"; g.fillText("AUDIRA", w / 2, 392);
    g.fillStyle = "#00f5d4"; g.font = "700 30px 'JetBrains Mono', monospace"; g.fillText("KOREK API", w / 2, 444);
  });
  const labelM = glow(0xffffff, { map: labelT, rough: 0.4, rim: CYAN, ri: 0.3, em: 0xffffff, ei: 0.0 });
  labelM.emissiveMap = labelT; labelM.emissiveIntensity = 0.35;
  const steelM = glow(0x9fb3c8, { rough: 0.28, metal: 0.9, rim: MEMB, ri: 0.4 });
  const darkM = glow(0x0e1a2e, { rough: 0.4, metal: 0.6, rim: CYAN, ri: 0.5 });
  const dyeM = new THREE.MeshPhysicalMaterial({ color: 0xd7263d, emissive: 0x5a0712, emissiveIntensity: 0.6, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
  const waxM = new THREE.MeshPhysicalMaterial({ color: 0xf6f0d8, emissive: 0x8a7a40, emissiveIntensity: 0.35, roughness: 0.3, transmission: 0.2, thickness: 0.3, clearcoat: 0.6 });
  const oldHeadM = new THREE.MeshPhysicalMaterial({ color: 0xf3e7a1, emissive: 0xcfc070, emissiveIntensity: 0.55, roughness: 0.3, clearcoat: 1 });

  // ---------- floor grid under the factory line (faint, reads as a lab bench in the void) ----------
  const gridT = canvasTex(128, 128, (g, w) => { g.fillStyle = "#02050f"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(56,189,248,.35)"; g.lineWidth = 2; g.strokeRect(0, 0, w, w); g.fillStyle = "rgba(0,245,212,.6)"; g.fillRect(0, 0, 5, 5); }, [70, 14]);
  const floor = mesh(new THREE.PlaneGeometry(140, 28), new THREE.MeshStandardMaterial({ map: gridT, roughness: 0.35, metalness: 0.6, transparent: true, opacity: 0.3 }), -48, -3.4, 0, scene);
  floor.rotation.x = -Math.PI / 2;

  // ---------- cryo-EM depth: blurred cells far behind everything + brownian motes ----------
  const R0 = mulberry(404);
  const cellM = [MEMB, VIOLET, CYAN].map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.1, depthWrite: false, fog: true }));
  const cells = [];
  for (let i = 0; i < 34; i++) { const s = 2 + R0() * 5; const m = mesh(SPH, cellM[i % 3], -105 + R0() * 150, -6 + R0() * 32, -32 - R0() * 40, scene); m.scale.setScalar(s); cells.push({ m, ph: R0() * 6, home: m.position.clone() }); }
  const motes = pts(scene, 900, { color: 0x9fe8ff, size: 0.16, opacity: 0.8 });
  const moteSeed = Array.from({ length: 900 }, () => [-104 + R0() * 150, -6 + R0() * 30, -40 + R0() * 54, R0() * 6.28, R0()]);
  for (let i = 0; i < 900; i++) { const c = new THREE.Color([0x9fe8ff, 0xc4a5ff, 0xffd08a][i % 3]); motes.col.set([c.r, c.g, c.b], i * 3); }

  // ================= BOX STATION (origin): s1 hook, s6 strike, s7/s8 =================
  const RY = -0.55;
  const N = new THREE.Vector3(Math.sin(RY), 0, Math.cos(RY));
  const box = new THREE.Group(); box.rotation.y = RY; scene.add(box);
  mesh(new THREE.BoxGeometry(1.6, 5.2, 3.6), [labelM, sleeveM, sleeveM, sleeveM, stripM, stripM], 0, 0, 0, box);
  // drawer edge peeking out of the sleeve top
  mesh(new THREE.BoxGeometry(1.45, 0.5, 3.45), glow(0xe8dcc0, { rough: 0.7, rim: GOLD, ri: 0.25 }), 0, 2.72, 0, box);
  const toW = (x, y, z) => new THREE.Vector3(x, y, z).applyEuler(box.rotation);
  const S = toW(0, -1.2, 1.8);           // strike end point on the strip
  const MC = S.clone().addScaledVector(N, -40); // molecular world centre, straight behind the strip
  // match: origin at head centre, stick along +x
  function makeMatch(headMat) {
    const G = new THREE.Group();
    mesh(new THREE.BoxGeometry(4.6, 0.2, 0.2), woodM, 2.55, 0, 0, G);
    const tip = mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.55, 14), waxM, 0.42, 0, 0, G); tip.rotation.z = Math.PI / 2;
    const h = mesh(SPH, headMat, 0, 0, 0, G); h.scale.set(0.44, 0.3, 0.3);
    return G;
  }
  const match = makeMatch(dyeM); scene.add(match);
  const hookHead = toW(0, 1.6, 2.15), litHead = toW(-1.2, 1.2, 3.4);
  const qHook = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.62, 0.48, 0.62).normalize());
  const qLit = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-0.5, -0.8, 0.35).normalize());
  // flame
  const flame = new THREE.Group(); scene.add(flame);
  const fl = [[0xff5a14, 0.42, 1.25, 0.32], [0xffb03a, 0.26, 0.85, 0.42], [0x5f9bff, 0.16, 0.32, 0.45]].map(([c, w, h, o], i) => {
    const m = mesh(new THREE.SphereGeometry(1, 24, 18), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), 0, h * 0.55 - (i === 2 ? 0.25 : 0), 0, flame);
    m.scale.set(w, h, w); m.userData.b = [w, h]; return m;
  });
  const fireL = new THREE.PointLight(0xff8a2a, 0, 16, 1.5); flame.add(fireL);
  const sparks = pts(scene, 160, { color: 0xffc36b, size: 0.14 });
  const sparkSeed = Array.from({ length: 160 }, () => [R0() * 2 - 1, R0(), R0() * 2 - 1, 0.3 + R0() * 0.7]);
  // s1 callouts: red phosphorus beside the strip, chlorate beside the head
  const coP = MOL.Pchain(7); coP.G.position.copy(toW(0, -0.2, 1.8)).add(new THREE.Vector3(-2.5, -1.3, 0.6)); coP.G.scale.setScalar(0.62); scene.add(coP.G);
  const coK = MOL.KClO3(); coK.G.position.set(2.7, 1.3, 1.2); coK.G.scale.setScalar(0.72); scene.add(coK.G);
  const leadM = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 });
  const lead = (a, b) => { const g = new THREE.BufferGeometry().setFromPoints([a, b]); const l = new THREE.Line(g, leadM); scene.add(l); return l; };
  const leadP = lead(coP.G.position.clone().add(new THREE.Vector3(0.4, 1.6, 0)), toW(0, 0, 1.82));
  const leadK = lead(coK.G.position.clone().add(new THREE.Vector3(-0.6, 0, 0)), hookHead.clone().add(new THREE.Vector3(0.3, 0, 0)));

  // ================= s2 HISTORY STATION =================
  const H = new THREE.Vector3(-45, 16, -12);
  const hist = new THREE.Group(); hist.position.copy(H); scene.add(hist);
  const oldMatch = makeMatch(oldHeadM); oldMatch.position.set(-1.6, -2.1, 0); oldMatch.rotation.z = 0.32; hist.add(oldMatch);
  const p4 = MOL.P4(); p4.G.position.set(0, 0.6, 0); p4.G.scale.setScalar(1.25); hist.add(p4.G);
  const hazard = mesh(new THREE.TorusGeometry(2.1, 0.06, 10, 80), new THREE.MeshBasicMaterial({ color: RUBY, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), 0, 0.6, 0, hist);
  const hzP = MOL.Pchain(7); hzP.G.position.set(-2.6, -0.9, 0); hzP.G.scale.setScalar(0.72); hist.add(hzP.G);
  const hzK = MOL.KClO3(); hzK.G.position.set(2.6, 0.2, 0); hzK.G.scale.setScalar(0.95); hist.add(hzK.G);
  const divider = mesh(new THREE.BoxGeometry(0.05, 4.2, 0.05), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false }), 0, -0.2, 0, hist);
  const hBox = mesh(new THREE.BoxGeometry(1.6, 3.2, 2.2), [sleeveM, sleeveM, sleeveM, sleeveM, stripM, stripM], -2.6, -2.6, 0, hist); hBox.rotation.y = -0.4;
  const hMatch = makeMatch(dyeM); hMatch.position.set(1.4, -2.7, 0.2); hMatch.rotation.z = 0.25; hMatch.scale.setScalar(0.85); hist.add(hMatch);
  const rowBoxes = [];
  for (let i = 0; i < 12; i++) { const b = mesh(new THREE.BoxGeometry(1.2, 2.4, 1.7), [sleeveM, sleeveM, sleeveM, sleeveM, stripM, stripM], -7 + i * 1.5, -1.6, -5.5, hist); b.rotation.y = -0.35; rowBoxes.push(b); }

  // ================= s3 LOG PEELER =================
  const L = new THREE.Vector3(-90, 0.8, 0);
  const ringT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#d39a5c"; g.fillRect(0, 0, w, w); for (let i = 1; i < 18; i++) { g.strokeStyle = i % 2 ? "rgba(120,62,24,.55)" : "rgba(240,190,130,.35)"; g.lineWidth = 3 + (i % 3); g.beginPath(); g.arc(w / 2 + Math.sin(i) * 2, w / 2, i * 7.2, 0, 7); g.stroke(); } g.fillStyle = "#7a3f15"; g.beginPath(); g.arc(w / 2, w / 2, 7, 0, 7); g.fill(); });
  const barkM = glow(0x3b2414, { rough: 0.9, rim: GOLD, ri: 0.35 });
  const logG = new THREE.Group(); logG.position.copy(L); scene.add(logG);
  const log = mesh(new THREE.CylinderGeometry(2.6, 2.6, 4.8, 48), [glow(0xffffff, { map: grainT, rough: 0.7, rim: GOLD, ri: 0.4 }), glow(0xffffff, { map: ringT, rough: 0.7, rim: GOLD, ri: 0.3 }), barkM], 0, 0, 0, logG);
  const barkShell = mesh(new THREE.CylinderGeometry(2.75, 2.75, 4.6, 48, 1, true, 0, 4.2), barkM, 0, 0, 0, logG);
  const veneer = mesh(new THREE.BoxGeometry(1, 0.07, 4.6), woodM, 0, 0, 0, scene);
  const cutter = mesh(new THREE.BoxGeometry(0.12, 1.3, 5.2), steelM, 0, 0, 0, scene);
  const bin = new THREE.Group(); bin.position.set(L.x + 6.1, -2.2, 0); scene.add(bin);
  for (const [w, h, d, x, y, z] of [[2.8, 0.12, 5.2, 0, -0.7, 0], [0.12, 1.4, 5.2, -1.4, 0, 0], [0.12, 1.4, 5.2, 1.4, 0, 0], [2.8, 1.4, 0.12, 0, 0, -2.6]]) mesh(new THREE.BoxGeometry(w, h, d), darkM, x, y, z, bin);
  const stickGeo = new THREE.BoxGeometry(0.18, 0.18, 4.6);
  const fallI = new THREE.InstancedMesh(stickGeo, woodM, 28); fallI.frustumCulled = false; scene.add(fallI);
  const pileI = new THREE.InstancedMesh(stickGeo, woodM, 90); pileI.frustumCulled = false; scene.add(pileI);
  const pileSeed = Array.from({ length: 90 }, (_, i) => [-1.15 + (i % 12) * 0.2 + R0() * 0.05, -0.55 + Math.floor(i / 12) * 0.17, R0() * 0.2 - 0.1, R0() * 0.1 - 0.05]);

  // ================= s4/s5 LINE: soak tank, steel belt, paraffin + paste dips, drying waves, strip coater =================
  const TK = new THREE.Vector3(-74, -0.9, 0);
  const tank = new THREE.Group(); tank.position.copy(TK); scene.add(tank);
  mesh(new THREE.BoxGeometry(6, 3.6, 3.4), new THREE.MeshPhysicalMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.12, roughness: 0.05, clearcoat: 1, depthWrite: false }), 0, 0, 0, tank);
  const tankEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 3.6, 3.4)), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.8 })); tank.add(tankEdge);
  const liquid = mesh(new THREE.BoxGeometry(5.8, 2.6, 3.2), new THREE.MeshStandardMaterial({ color: 0x0e7490, emissive: 0x0b6e88, emissiveIntensity: 0.8, transparent: true, opacity: 0.42, depthWrite: false }), 0, -0.45, 0, tank);
  const soakI = new THREE.InstancedMesh(new THREE.BoxGeometry(4.6, 0.18, 0.18), woodM, 30); soakI.frustumCulled = false; tank.add(soakI);
  const amNH = MOL.NH4(), amPO = MOL.PO4(), amNH2 = MOL.NH4();
  amNH.G.position.set(TK.x - 1.9, 0.0, 2.6); amPO.G.position.set(TK.x + 0.2, -0.5, 2.8); amNH2.G.position.set(TK.x + 2.2, 0.1, 2.5);
  for (const m of [amNH, amPO, amNH2]) { m.G.scale.setScalar(0.85); scene.add(m.G); }

  const X0 = -66, X1 = -18, PAR = -58, PASTE = -46, SP = 0.5, NC = Math.round((X1 - X0) / SP), ROWS = [-0.8, 0, 0.8];
  const dip = (x, c) => 2.6 * Math.exp(-Math.pow((x - c) / 1.5, 2));
  const beltY = (x) => 5 - dip(x, PAR) - dip(x, PASTE) + 2.0 * Math.sin((x + 41) * 0.78) * ramp(x, -41, -37) * (1 - ramp(x, -22, -18.5));
  const beltV = 0.55;
  // rails
  const railM = glow(0x6b7f99, { rough: 0.3, metal: 0.85, rim: CYAN, ri: 0.7 });
  for (const z of [-1.55, 1.55]) {
    const pp = []; for (let x = X0 - 1; x <= X1 + 1; x += 0.25) pp.push(new THREE.Vector3(x, beltY(x) + 0.12, z));
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), 400, 0.09, 8), railM, 0, 0, 0, scene);
  }
  const plateT = canvasTex(64, 192, (g, w, h) => { g.fillStyle = "#8ea3ba"; g.fillRect(0, 0, w, h); g.fillStyle = "#0a1324"; for (const z of ROWS) { g.beginPath(); g.arc(w / 2, h / 2 + z * 60, 6, 0, 7); g.fill(); } g.strokeStyle = "#3d4f66"; g.lineWidth = 4; g.strokeRect(0, 0, w, h); });
  const plateI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.48, 0.14, 3.1), glow(0xffffff, { map: plateT, rough: 0.3, metal: 0.8, rim: MEMB, ri: 0.4 }), NC); plateI.frustumCulled = false; scene.add(plateI);
  const NS = NC * ROWS.length;
  const splI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 4.6, 0.17), woodM, NS); splI.frustumCulled = false; scene.add(splI);
  const waxI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 10), waxM, NS); waxI.frustumCulled = false; scene.add(waxI);
  const headI = new THREE.InstancedMesh(SPH, dyeM, NS); headI.frustumCulled = false; scene.add(headI);
  const bath = (x, color, emi) => {
    const G = new THREE.Group(); G.position.set(x, -2.1, 0); scene.add(G);
    for (const [w, h, d, px, py, pz] of [[3.6, 0.12, 3.6, 0, -0.6, 0], [0.12, 1.3, 3.6, -1.8, 0, 0], [0.12, 1.3, 3.6, 1.8, 0, 0], [3.6, 1.3, 0.12, 0, 0, -1.8], [3.6, 1.3, 0.12, 0, 0, 1.8]]) mesh(new THREE.BoxGeometry(w, h, d), darkM, px, py, pz, G);
    mesh(new THREE.BoxGeometry(3.5, 0.06, 3.5), new THREE.MeshPhysicalMaterial({ color, emissive: emi, emissiveIntensity: 0.7, roughness: 0.15, clearcoat: 1 }), 0, 0.5, 0, G);
    return G;
  };
  // foreground guard rail + posts in front of the line: near-plane depth cue for the low 3/4 belt shots
  { const gp = []; for (let x = X0 - 8; x <= X1 + 2; x += 1) gp.push(new THREE.Vector3(x, -2.3, 5.4)); mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gp), 120, 0.11, 8), railM, 0, 0, 0, scene); for (let x = X0 - 8; x <= X1 + 2; x += 4) mesh(new THREE.BoxGeometry(0.16, 1.6, 0.16), railM, x, -3.1, 5.4, scene); }
  bath(PAR, 0xf3ecd2, 0x6e6236); bath(PASTE, 0xb3122a, 0x4a0410);
  const paraf = MOL.Paraffin(8); paraf.G.position.set(PAR + 0.4, -0.7, 3.6); paraf.G.scale.setScalar(0.8); scene.add(paraf.G);
  const ingr = [["s5:kalium", MOL.KClO3(), 0.62], ["s5:belerang", MOL.S8(), 0.55], ["s5:bubuk", MOL.SiO4(), 0.62], ["s5:lem", MOL.Glue(), 0.42], ["s5:pewarna", MOL.Dye(), 0.42]].map(([k, m, s], i) => {
    m.G.position.set(PASTE - 2.6 + i * 1.3, 0.5 + (i % 2) * 0.5, 3.8); m.G.scale.setScalar(0); scene.add(m.G); return { k, m, s };
  });
  const dryL = new THREE.PointLight(GOLD, 0, 18, 1.4); dryL.position.set(-30, 2, 4); scene.add(dryL);
  // strip coater: sleeves ride along x, a vertical roller paints the strip on the face that looks at the camera
  const CO = -14.5;
  mesh(new THREE.BoxGeometry(12, 0.35, 2.6), darkM, CO, -2.4, 0, scene);
  const roller = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 24), glow(0x4a0d14, { rough: 0.7, rim: RUBY, ri: 0.7 }), CO, -1.35, 1.25, scene);
  // machine body: legs, gantry over the roller, red paste trough + feed hopper, so it reads as a machine
  for (const x of [CO - 5.6, CO + 5.6]) for (const z of [-1.1, 1.1]) mesh(new THREE.BoxGeometry(0.3, 2.2, 0.3), steelM, x, -3.65, z, scene);
  for (const x of [CO - 0.9, CO + 0.9]) for (const z of [-0.9, 2.0]) mesh(new THREE.BoxGeometry(0.22, 3.6, 0.22), steelM, x, -0.6, z, scene);
  mesh(new THREE.BoxGeometry(2.1, 0.3, 3.2), steelM, CO, 1.25, 0.55, scene);
  mesh(new THREE.BoxGeometry(1.5, 0.35, 0.9), glow(0x6a0f1c, { rough: 0.5, rim: RUBY, ri: 0.6, em: 0x4a0410, ei: 0.5 }), CO, -2.15, 1.35, scene);
  mesh(new THREE.CylinderGeometry(0.75, 0.3, 1.1, 4, 1), darkM, CO, 0.55, 1.25, scene).rotation.y = Math.PI / 4;
  const sleeves = Array.from({ length: 6 }, () => {
    const G = new THREE.Group(); scene.add(G);
    mesh(new THREE.BoxGeometry(2.2, 1.3, 1.6), sleeveM, 0, 0, 0, G);
    const st = mesh(new THREE.PlaneGeometry(2.0, 1.1), stripM, 0, 0, 0.81, G);
    return { G, st };
  });
  const coRP = MOL.Pchain(8); coRP.G.position.set(CO - 2.6, 2.7, 3.0); coRP.G.rotation.z = -Math.PI / 2; coRP.G.scale.setScalar(0); scene.add(coRP.G);
  const coSi = MOL.SiO4(); coSi.G.position.set(CO + 2.8, 2.9, 2.6); coSi.G.scale.setScalar(0); scene.add(coSi.G);

  // ================= MOLECULAR WORLD (s6 dive) =================
  const molW = new THREE.Group(); molW.position.copy(MC); molW.rotation.y = RY; scene.add(molW); molW.visible = false;
  const chainA = MOL.Pchain(9, true); chainA.G.position.set(-3.0, -1.0, 0); molW.add(chainA.G);
  const chainB = MOL.Pchain(9); chainB.G.position.set(-5.0, -0.4, -3.4); chainB.G.scale.setScalar(0.78); molW.add(chainB.G);
  const UNITS = [[2.1, -1.7, 0.4], [3.9, -0.6, -0.6], [2.4, 0.8, 0.3], [4.1, 1.9, -0.6]];
  const kcl = UNITS.map((p, i) => { const m = MOL.KClO3(); m.G.position.set(...p); m.G.rotation.set(0.3 * i, 0.9 * i, 0.2); molW.add(m.G); return m; });
  // flying oxygens are separate atoms so they can leave the chlorate
  const oxy = [];
  for (const ui of [0, 2]) for (let j = 1; j <= 3; j++) { kcl[ui].A[j].visible = true; oxy.push({ ui, j, m: mesh(SPH, amat("O").clone(), 0, 0, 0, molW) }); }
  oxy.forEach((o) => o.m.scale.setScalar(EL.O[1]));
  const heatM = new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  heatM.map = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.3, 'rgba(255,150,60,.55)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const heat = new THREE.Sprite(new THREE.SpriteMaterial({ map: heatM.map, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); heat.position.set(-1.2, -0.2, 0.6); molW.add(heat);
  const fric = pts(scene, 140, { color: 0xffa94d, size: 0.16 });
  const burst = pts(scene, 320, { color: 0xffc36b, size: 0.24 });
  const bSeed = Array.from({ length: 320 }, () => { const u = R0() * 2 - 1, a = R0() * 6.283, s = Math.sqrt(1 - u * u); return [s * Math.cos(a), u, s * Math.sin(a), 0.4 + R0()]; });
  const fSeed = Array.from({ length: 140 }, () => [R0(), R0() * 2 - 1, R0() * 2 - 1, 0.5 + R0()]);
  const molMotes = pts(scene, 420, { color: 0xb9f3ff, size: 0.12, opacity: 0.9 });
  const mmSeed = Array.from({ length: 420 }, () => [R0() * 16 - 8, R0() * 12 - 6, R0() * 14 - 10, R0() * 6.28]);
  const molCells = [];
  for (let i = 0; i < 12; i++) { const m = mesh(SPH, cellM[i % 3], -12 + R0() * 24, -8 + R0() * 16, -10 - R0() * 16, molW); m.scale.setScalar(1.5 + R0() * 3); molCells.push(m); }

  // ================= s7 FIELD OF MATCHES =================
  const FG = [], fieldSeed = mulberry(77);
  for (let i = 0; i < 46; i++) for (let j = 0; j < 40; j++) { const x = -6 + i * 0.95 + fieldSeed() * 0.25, z = -5 - j * 1.0 + fieldSeed() * 0.25; FG.push([x, z, fieldSeed() * 0.12 - 0.06, fieldSeed() * 0.12 - 0.06, Math.hypot(x, z)]); }
  const fStick = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 4.6, 0.16), woodM, FG.length); fStick.frustumCulled = false; scene.add(fStick);
  const fHead = new THREE.InstancedMesh(SPH, dyeM, FG.length); fHead.frustumCulled = false; scene.add(fHead);

  // flash plane that rides with the camera (the dive through the strip)
  const flashM = new THREE.MeshBasicMaterial({ color: 0xfff3e0, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const flashP = mesh(new THREE.PlaneGeometry(3, 3), flashM, 0, 0, -0.5, cam); flashP.renderOrder = 999;

  // ================= CAMERA =================
  const tS = A("s6:digesek"), tP = A("s6:panas"), tM = A("s6:mengubah"), tR = A("s6:reaktif"), tB = A("s6:bereaksi"), tN = A("s6:menyala");
  const P3 = (v) => [v.x, v.y, v.z];
  const sIn = S.clone().addScaledVector(N, 6), sOut = S.clone().addScaledVector(N, -7.5), sDeep = S.clone().addScaledVector(N, -7.0).add(new THREE.Vector3(0.5, 0.35, 0));
  const molT = MC.clone().add(new THREE.Vector3(0, 0.9, 0)), lookIn = S.clone().addScaledVector(N, -5);
  const dyeT = new THREE.Vector3(-0.9, 1.4, 1.5), dyeP = dyeT.clone().addScaledVector(N, 19).add(new THREE.Vector3(1.8, 0.6, 0));
  const keys = [
    [0, 2.0, 1.2, 27, -0.2, 0.3, 0],
    [K.s1e, 1.2, 0.9, 25.5, -0.3, 0.3, 0],
    [K.s2 + 0.4, -20, 12, 25, -26, 11, -8],
    [K.s2 + 1.2, H.x + 1.6, H.y + 1.5, H.z + 25, H.x, H.y + 0.6, H.z],
    [K.s2e - 0.2, H.x - 1.3, H.y + 1.1, H.z + 22.5, H.x, H.y + 0.5, H.z],
    [K.s3 + 0.4, -72, 9, 25, -82, 5, -2],
    [K.s3 + 1.2, L.x + 3.4, 3.4, 37, L.x + 2.5, 0.2, 0],
    [K.s3e - 0.2, L.x + 2.0, 2.6, 34.5, L.x + 2.6, 0.1, 0],
    [K.s4 + 0.9, TK.x + 1.2, 2.8, 23, TK.x + 0.2, 0.6, 0],
    [A("s4:membara"), TK.x + 0.2, 2.4, 21.5, TK.x - 0.2, 0.5, 0],
    [A("s4:ditancapkan") + 0.3, -70, 3.0, 23, -60, 0.6, 0],
    [A("s4:parafin") + 0.2, -66, 2.6, 21.5, -57.5, -0.2, 0],
    [K.s4e, -65, 2.6, 20.5, -56.5, -0.2, 0],
    [K.s5 + 1.0, -54, 2.6, 22, -45.5, -0.2, 0],
    [A("s5:pewarna") + 0.2, -53, 2.6, 21, -45, -0.2, 0],
    [A("s5:Sabuk") + 0.7, -41, 2.2, 22, -28, 2.4, 0],
    [A("s5:kering"), -37, 2.0, 21, -24, 2.4, 0],
    [A("s5:Kotaknya") + 0.5, CO + 7.5, 6.5, 22, CO - 0.6, -0.4, 0],
    [K.s5e, CO + 6.0, 5.6, 20, CO - 0.2, -0.4, 0],
    [K.s6 + 0.8, ...P3(dyeP), ...P3(dyeT)],
    [tS + 0.3, ...P3(dyeP.clone().addScaledVector(N, -1.2).add(new THREE.Vector3(0, -0.4, 0))), dyeT.x, dyeT.y - 0.3, dyeT.z],
    [tP, ...P3(sIn), ...P3(lookIn)],
    [tM, ...P3(sOut), ...P3(molT)],
    [K.s6e, ...P3(sDeep), ...P3(molT)],
    [K.s7 + 0.9, litHead.x + 3.2, litHead.y + 0.9, litHead.z + 13, litHead.x + 1.6, litHead.y - 0.2, litHead.z - 1],
    [K.s7e + 0.1, 11, 13, 31, 9, -1.5, -17],
    [K.s8 + 1.0, 2.4, 1.9, 24, -1.0, 0.4, 0],
    [K.dur, 1.4, 1.5, 22.5, -1.0, 0.4, 0],
  ];
  for (let i = 1; i < keys.length; i++) if (keys[i][0] <= keys[i - 1][0]) keys[i][0] = keys[i - 1][0] + 0.05;
  const camT = track(keys);
  const tgt = new THREE.Vector3(), camDir = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3();

  return (t) => {
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); tgt.set(c[3], c[4], c[5]);
    // brownian camera breath (kit: always suspended in fluid)
    cam.position.x += 0.06 * Math.sin(t * 0.7); cam.position.y += 0.05 * Math.sin(t * 0.53 + 1);
    cam.lookAt(tgt);
    camDir.subVectors(tgt, cam.position).normalize();
    // lights follow the camera: key from upper right, cyan rim back-left, ruby rim back-right, gold fill low front
    key.position.copy(cam.position).add(tmpV.set(8, 12, 4)); key.target.position.copy(tgt);
    rimC.position.copy(tgt).add(tmpV.set(-7, 5, -6)); rimM.position.copy(tgt).add(tmpV.set(7, -1, -5)); rimG.position.copy(tgt).add(tmpV.set(-3, 5, 6));

    // motes + far cells
    for (let i = 0; i < 900; i++) { const s = moteSeed[i]; motes.pos[i * 3] = s[0] + Math.sin(t * 0.21 + s[3]) * 0.6; motes.pos[i * 3 + 1] = s[1] + Math.sin(t * 0.17 + s[3] * 1.7) * 0.5 + ((t * 0.05 * s[4]) % 1); motes.pos[i * 3 + 2] = s[2] + Math.cos(t * 0.19 + s[3]) * 0.6; }
    motes.commit();
    for (const cl of cells) cl.m.position.set(cl.home.x + Math.sin(t * 0.08 + cl.ph) * 1.2, cl.home.y + Math.sin(t * 0.06 + cl.ph * 2) * 0.8, cl.home.z);

    // ---------- box station ----------
    const dn = tmpV.subVectors(cam.position, S).dot(N);
    const inDive = t > tP - 0.2 && t < K.s7 + 1.3;
    const hideMacro = inDive && dn < 0.6;
    box.visible = !hideMacro; match.visible = !hideMacro;
    // match pose: hover (s1..s6) -> strike slide -> lit pose (from the flame on)
    const strike = ramp(t, tS, tS + 0.45);
    const lit = t >= tN ? ramp(t, tN, tN + 0.4) : 0;
    const bob = 0.08 * Math.sin(t * 1.3);
    const headPos = tmpS.copy(hookHead).add(tmpV.set(0, bob - 2.8 * strike, 0)).addScaledVector(N, -0.12 * strike * (1 - strike) * 4);
    headPos.lerp(litHead, lit);
    match.position.copy(headPos);
    match.quaternion.copy(qHook).slerp(qLit, lit);
    // flame
    const fon = t >= tN ? eout((t - tN) / 0.35) : 0;
    flame.visible = fon > 0 && !hideMacro;
    flame.position.copy(match.position).add(tmpV.set(0, 0.15, 0));
    fl.forEach((m, i) => { const [w, h] = m.userData.b; const f = 1 + 0.08 * Math.sin(t * 19 + i * 2) + 0.05 * Math.sin(t * 31 + i); m.scale.set(w * fon * (2 - f), h * fon * f, w * fon * (2 - f)); m.position.x = 0.04 * Math.sin(t * 7 + i); });
    fireL.intensity = 14 * fon * (1 + 0.1 * Math.sin(t * 23));
    // sparks at the strike
    for (let i = 0; i < 160; i++) {
      const s = sparkSeed[i], u = (t - tS - 0.05 * i / 160 * 6) / (0.7 * s[3]);
      if (u < 0 || u > 1 || t > tP + 0.5) { sparks.pos.set([0, -999, 0], i * 3); continue; }
      const o = toW(0, 1.6 - 2.8 * clamp01((t - tS) / 0.45), 1.95);
      sparks.pos[i * 3] = o.x + s[0] * 1.6 * u; sparks.pos[i * 3 + 1] = o.y + s[1] * 1.4 * u - 1.6 * u * u; sparks.pos[i * 3 + 2] = o.z + s[2] * 1.2 * u + 0.8 * u;
    }
    sparks.commit();
    // callouts (s1 + s8), tucked away in the strike scenes
    const coOn = (t < K.s6 - 0.3 ? 1 : 0) + (t > K.s8 + 0.3 ? ramp(t, K.s8 + 0.3, K.s8 + 1.2) : 0);
    const half = t < K.s2 ? back(clamp01((t - A("s1:Setengah")) / 0.5)) : 1;
    coP.G.scale.setScalar(Math.max(0.001, 0.62 * (t < K.s6 - 0.3 ? 1 : 0) * (0.75 + 0.25 * half))); coP.G.rotation.y = t * 0.4; coP.G.position.y = -0.2 + toW(0, -0.2, 1.8).y - 1.3 + 0.12 * Math.sin(t * 0.9);
    coK.G.scale.setScalar(0.72 * coOn); coK.G.rotation.set(0.3 * Math.sin(t * 0.5), t * 0.5, 0); coK.G.position.y = 1.3 + 0.1 * Math.sin(t * 0.8 + 1);
    for (const m of coP.A) m.material.emissiveIntensity = 0.3;
    leadK.visible = coOn > 0.5 && !hideMacro; leadP.visible = t < K.s6 - 0.3;
    leadM.opacity = 0.35 + 0.45 * (t < K.s2 ? ramp(t, A("s1:kotak") - 0.2, A("s1:kotak") + 0.3) : 1);

    // ---------- s2 history ----------
    const sep = ramp(t, A("s2:memisahkan"), A("s2:memisahkan") + 0.9);
    const p4s = 1.25 * (1 - sep);
    p4.G.scale.setScalar(Math.max(0.001, p4s)); p4.G.rotation.set(t * 0.3, t * 0.45, 0); p4.G.visible = p4s > 0.01;
    for (const m of p4.A) m.material.emissiveIntensity = 0.08 + 0.28 * ramp(t, A("s2:menyala"), A("s2:menyala") + 0.3) * (0.7 + 0.3 * Math.sin(t * 9));
    const hz = ramp(t, A("s2:racunnya") - 0.1, A("s2:racunnya") + 0.4) * (1 - sep);
    hazard.material.opacity = 0.85 * hz * (0.7 + 0.3 * Math.sin(t * 6)); hazard.scale.setScalar(1 + 0.06 * Math.sin(t * 6)); hazard.rotation.x = 0.3;
    oldMatch.scale.setScalar(Math.max(0.001, 1 - sep)); oldMatch.visible = sep < 0.99;
    const split = back(clamp01((t - A("s2:memisahkan") - 0.2) / 0.7));
    hzP.G.scale.setScalar(Math.max(0.001, 0.72 * split)); hzK.G.scale.setScalar(Math.max(0.001, 0.95 * split));
    hzP.G.position.x = -2.6 * split; hzK.G.position.x = 2.6 * split; hzP.G.rotation.y = t * 0.5; hzK.G.rotation.y = -t * 0.45;
    divider.scale.y = Math.max(0.001, ramp(t, A("s2:memisahkan") + 0.4, A("s2:memisahkan") + 1.0));
    const kits = back(clamp01((t - A("s2:bahannya")) / 0.6));
    hBox.scale.setScalar(Math.max(0.001, kits)); hMatch.scale.setScalar(Math.max(0.001, 0.85 * kits));
    rowBoxes.forEach((b, i) => { const k = back(clamp01((t - A("s2:bersaudara") - 0.08 * i) / 0.5)); b.scale.setScalar(Math.max(0.001, k)); b.visible = k > 0.01; b.position.x = -7 + i * 1.5 - 0.25 * (t - A("s2:massal")) * (t > A("s2:massal") ? 1 : 0); });
    hist.position.y = H.y + 0.1 * Math.sin(t * 0.6); hist.visible = t < K.s3 + 1.5;

    // ---------- s3 log ----------
    const peel = ramp(t, A("s3:dikupas") - 0.2, K.s4);
    const rr = 2.6 - 0.9 * peel;
    log.scale.set(rr / 2.6, 1, rr / 2.6); barkShell.visible = peel < 0.02; barkShell.scale.set(rr / 2.6, 1, rr / 2.6);
    log.rotation.set(Math.PI / 2, -t * 1.1, 0); barkShell.rotation.copy(log.rotation);
    const vl = 4.5 * ramp(t, A("s3:dikupas") - 0.3, A("s3:dikupas") + 0.6);
    veneer.scale.x = Math.max(0.001, vl); veneer.position.set(L.x + vl / 2, L.y - rr - 0.035, 0); veneer.visible = vl > 0.01;
    const chopOn = t > A("s3:dipotong") - 0.2;
    cutter.position.set(L.x + 4.6, L.y - rr + 0.75 + (chopOn ? 0.55 * Math.abs(Math.sin(t * 5.5)) : 0.6), 0);
    const tc = A("s3:dipotong");
    for (let k = 0; k < 28; k++) {
      const u = frac((t - tc) * 1.15 + k / 28);
      if (t < tc || t > K.s5) { dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.001); }
      else { dummy.position.set(L.x + 4.8 + 1.3 * u, L.y - rr - 0.1 - 2.4 * u * u, 0.15 * Math.sin(k)); dummy.rotation.set(0, 0, -u * 2.2); dummy.scale.setScalar(1); }
      dummy.updateMatrix(); fallI.setMatrixAt(k, dummy.matrix);
    }
    fallI.instanceMatrix.needsUpdate = true;
    const pileN = t < tc ? 0 : Math.min(90, Math.floor((t - tc) * 9));
    for (let k = 0; k < 90; k++) { const p = pileSeed[k]; dummy.position.set(bin.position.x + p[0], bin.position.y + p[1], p[2]); dummy.rotation.set(0, p[3], 0); dummy.scale.setScalar(k < pileN ? 1 : 0.001); dummy.updateMatrix(); pileI.setMatrixAt(k, dummy.matrix); }
    pileI.instanceMatrix.needsUpdate = true;

    // ---------- s4 tank ----------
    for (let k = 0; k < 30; k++) { dummy.position.set(0.1 * Math.sin(k), -1.3 + Math.floor(k / 10) * 0.22 + 0.05 * Math.sin(t * 1.5 + k), -1.2 + (k % 10) * 0.26); dummy.rotation.set(0, 0, 0.03 * Math.sin(t + k)); dummy.scale.setScalar(1); dummy.updateMatrix(); soakI.setMatrixAt(k, dummy.matrix); }
    soakI.instanceMatrix.needsUpdate = true;
    liquid.material.emissiveIntensity = 0.6 + 0.5 * ramp(t, A("s4:amonium") - 0.2, A("s4:amonium") + 0.4);
    const amOn = back(clamp01((t - A("s4:amonium") + 0.1) / 0.5));
    [amNH, amPO, amNH2].forEach((m, i) => { m.G.scale.setScalar(Math.max(0.001, 0.85 * amOn)); m.G.rotation.set(t * 0.4 + i, t * 0.55 + i * 2, 0); m.G.position.y = (i === 1 ? -0.5 : 0) + 0.15 * Math.sin(t * 0.9 + i * 2); });
    // ---------- belt ----------
    const ofs = beltV * t;
    for (let j = 0; j < NC; j++) {
      const x = X0 + frac((j * SP + ofs) / (X1 - X0)) * (X1 - X0);
      const vis = x > X0 + 0.3 && x < X1 - 0.3;
      const y = beltY(x), sl = (beltY(x + 0.05) - beltY(x - 0.05)) / 0.1;
      dummy.position.set(x, y, 0); dummy.rotation.set(0, 0, Math.atan(sl)); dummy.scale.setScalar(vis ? 1 : 0.001); dummy.updateMatrix(); plateI.setMatrixAt(j, dummy.matrix);
      const wx = ramp(x, PAR - 0.4, PAR + 0.2), hd = ramp(x, PASTE - 0.4, PASTE + 0.4);
      ROWS.forEach((z, ri) => {
        const id = j * ROWS.length + ri;
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(x, y - 2.3, z); dummy.scale.setScalar(vis ? 1 : 0.001); dummy.updateMatrix(); splI.setMatrixAt(id, dummy.matrix);
        dummy.position.set(x, y - 4.3, z); dummy.scale.setScalar(vis && wx > 0 ? wx : 0.001); dummy.updateMatrix(); waxI.setMatrixAt(id, dummy.matrix);
        dummy.position.set(x, y - 4.5, z); dummy.scale.set(vis && hd > 0 ? 0.24 * hd : 0.001, vis && hd > 0 ? 0.36 * hd : 0.001, vis && hd > 0 ? 0.24 * hd : 0.001); dummy.updateMatrix(); headI.setMatrixAt(id, dummy.matrix);
      });
    }
    plateI.instanceMatrix.needsUpdate = splI.instanceMatrix.needsUpdate = waxI.instanceMatrix.needsUpdate = headI.instanceMatrix.needsUpdate = true;
    const pfOn = back(clamp01((t - A("s4:parafin") + 0.1) / 0.5));
    paraf.G.scale.setScalar(Math.max(0.001, 0.8 * pfOn)); paraf.G.rotation.set(0.3 * Math.sin(t * 0.6), 0.5 * Math.sin(t * 0.4), 0.1 * Math.sin(t * 0.7)); paraf.G.position.y = -0.7 + 0.12 * Math.sin(t * 0.8);
    for (const m of paraf.A) m.material.emissiveIntensity = 0.3;
    ingr.forEach(({ k, m, s }, i) => { const on = back(clamp01((t - A(k) + 0.05) / 0.45)); m.G.scale.setScalar(Math.max(0.001, s * on)); m.G.rotation.set(0.4 * Math.sin(t * 0.5 + i), t * 0.5 + i, 0); m.G.position.y = 0.5 + (i % 2) * 0.5 + 0.12 * Math.sin(t * 0.9 + i * 1.3); });
    dryL.intensity = 40 * ramp(t, A("s5:Sabuk") - 0.3, A("s5:Sabuk") + 0.6) * (1 - ramp(t, A("s5:Kotaknya"), A("s5:Kotaknya") + 1));
    // coater
    roller.rotation.y = t * 3;
    sleeves.forEach((s, i) => {
      const x = CO - 6 + frac((i * 2.1 + t * 0.7) / 12.6) * 12.6;
      const vis = x > CO - 5.7 && x < CO + 5.7;
      s.G.position.set(x, -1.55, 0); s.G.scale.setScalar(vis ? 1 : 0.001);
      const pc = clamp01((x - (CO - 1.1)) / 2.2);
      s.st.scale.x = Math.max(0.001, pc); s.st.position.x = -1.0 + pc;
    });
    const rpOn = back(clamp01((t - A("s5:fosfor") + 0.1) / 0.5)), siOn = back(clamp01((t - A("s5:kaca#2") + 0.05) / 0.5));
    coRP.G.scale.setScalar(Math.max(0.001, 0.6 * rpOn)); coRP.G.rotation.x = t * 0.4; coSi.G.scale.setScalar(Math.max(0.001, 0.6 * siOn)); coSi.G.rotation.set(t * 0.5, t * 0.3, 0);

    // ---------- molecular world ----------
    molW.visible = inDive;
    if (inDive) {
      const fade = ramp(t, tP - 0.2, tM) * (1 - ramp(t, K.s7 + 0.4, K.s7 + 1.2));
      molW.scale.setScalar(Math.max(0.001, 0.85 + 0.15 * fade));
      chainA.G.rotation.y = 0.15 * Math.sin(t * 0.5); chainB.G.rotation.y = -0.2 * Math.sin(t * 0.4);
      chainA.G.position.y = -1.0 + 0.12 * Math.sin(t * 0.8); chainB.G.position.y = -0.4 + 0.15 * Math.sin(t * 0.6 + 1);
      // three P atoms near the strike turn reactive and drift to the middle
      const d = ramp(t, tM, tR + 0.2), burnOut = ramp(t, tN + 0.1, tN + 0.8);
      chainA.A.forEach((a, i) => {
        a.position.copy(a.userData.home);
        if (i >= 6) {
          const k = i - 6;
          a.position.x += (2.9 + 0.3 * k) * d; a.position.y += (-1.2 - 0.25 * k) * d; a.position.z += 0.9 * d;
          a.position.x += 0.12 * Math.sin(t * 13 + k) * d;
          a.material.emissive.setHex(0xffd27a); a.material.emissiveIntensity = 0.3 + 2.4 * d;
          a.material.color.setHex(d > 0.5 ? 0xffe2a8 : 0xf43f5e);
          a.scale.setScalar(EL.P[1] * (1 + 0.25 * d) * (1 - burnOut));
        } else a.scale.setScalar(EL.P[1]);
      });
      chainA.sync((b) => (b.j >= 6 && d > 0.12));
      // oxygens leave two chlorates and meet the reactive P
      const e = ramp(t, tB, tB + 1.1);
      oxy.forEach((o, n) => {
        const u = kcl[o.ui], src = u.A[o.j];
        u.G.updateMatrix(); const from = tmpV.copy(src.position).applyMatrix4(u.G.matrix);
        const p = chainA.A[6 + (n % 3)]; const to = tmpS.copy(p.position).add(chainA.G.position).add(_w.set(0.45 * Math.cos(n * 2.1), 0.45 * Math.sin(n * 2.1), 0.3));
        o.m.position.copy(from).lerp(to, eout(e));
        o.m.scale.setScalar(EL.O[1] * (1 + 0.3 * e) * (1 - burnOut));
        o.m.material.emissiveIntensity = 0.3 + 2.0 * e;
        src.visible = false; o.m.visible = true;
      });
      kcl.forEach((u, i) => { u.G.position.y = UNITS[i][1] + 0.1 * Math.sin(t * 0.7 + i); u.sync((b) => (i === 0 || i === 2) && e > 0.05); });
      // heat between the two sides
      const hOn = ramp(t, tP, tP + 0.6) * (1 - ramp(t, tN + 0.2, tN + 1.0));
      heat.material.opacity = 0.9 * hOn * (0.8 + 0.2 * Math.sin(t * 11));
      heat.scale.set(4.2 + 0.3 * Math.sin(t * 7), 5.4, 1);
      molW.updateMatrixWorld();
      for (let i = 0; i < 140; i++) {
        const s = fSeed[i], u = frac(t * 0.9 * s[3] + s[0]);
        tmpV.set(-3 + 4.6 * u, s[1] * 2.6, s[2] * 0.8 + 0.4).applyMatrix4(molW.matrixWorld);
        if (hOn < 0.02) tmpV.set(0, -999, 0);
        fric.pos.set([tmpV.x, tmpV.y, tmpV.z], i * 3);
      }
      fric.commit(); fric.m.opacity = hOn;
      const bu = (t - tN) / 1.6;
      for (let i = 0; i < 320; i++) {
        const s = bSeed[i];
        if (bu < 0 || bu > 1) { burst.pos.set([0, -999, 0], i * 3); continue; }
        const rr2 = eout(bu) * 6 * s[3];
        tmpV.set(0.2 + s[0] * rr2, -0.6 + s[1] * rr2 + 1.2 * bu, 0.8 + s[2] * rr2).applyMatrix4(molW.matrixWorld);
        burst.pos.set([tmpV.x, tmpV.y, tmpV.z], i * 3);
      }
      burst.commit(); burst.m.opacity = 1 - clamp01(bu);
      for (let i = 0; i < 420; i++) { const s = mmSeed[i]; tmpV.set(s[0] + 0.4 * Math.sin(t * 0.6 + s[3]), s[1] + 0.4 * Math.sin(t * 0.45 + s[3] * 2), s[2]).applyMatrix4(molW.matrixWorld); molMotes.pos.set([tmpV.x, tmpV.y, tmpV.z], i * 3); }
      molMotes.commit();
    } else {
      for (const P of [fric, burst, molMotes]) { P.pos.fill(0); for (let i = 1; i < P.pos.length; i += 3) P.pos[i] = -999; P.commit(); }
    }

    // ---------- s7 field ----------
    const t7 = K.s7 + 0.5;
    for (let i = 0; i < FG.length; i++) {
      const [x, z, ax, az, dd] = FG[i];
      const k = (t < t7 ? 0 : back(clamp01((t - t7 - dd * 0.045) / 0.45))) * (1 - ramp(t, K.s8 + 0.2 + dd * 0.01, K.s8 + 1.2 + dd * 0.01));
      const kk = Math.max(0.001, k);
      dummy.rotation.set(ax, 0, az); dummy.position.set(x, -3.0 + 2.3 * kk, z); dummy.scale.set(1, kk, 1); dummy.updateMatrix(); fStick.setMatrixAt(i, dummy.matrix);
      tmpV.set(0, 2.3 * kk + 0.12, 0).applyEuler(dummy.rotation).add(dummy.position);
      dummy.position.copy(tmpV); dummy.scale.set(0.24 * kk, 0.36 * kk, 0.24 * kk); dummy.updateMatrix(); fHead.setMatrixAt(i, dummy.matrix);
    }
    fStick.instanceMatrix.needsUpdate = fHead.instanceMatrix.needsUpdate = true;

    // ---------- flash + bloom ----------
    const cross = inDive ? 0.95 * gauss(dn, 1.1) : 0;
    const bang = 0.85 * gauss(t - tN - 0.12, 0.2);
    flashM.opacity = clamp01(Math.max(cross, bang));
    bp.strength = 0.62 + 0.9 * gauss(t - tN - 0.15, 0.35) + (inDive ? 0.15 : 0);

    comp.render();
  };
}
