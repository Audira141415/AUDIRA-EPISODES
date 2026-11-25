// EP18 SAYAP PESAWAT (INNERWORKS): a night wind-tunnel lab in teal and amber. One cutaway wing section sits on a sting
// in the test section: a ghost cyan glass skin over polished brass ribs and steel spars. All airflow is a real
// potential-flow solution (Joukowski airfoil with the Kutta condition), integrated once at load, so smoke timelines,
// streamlines, the pressure field and the downwash are physically right.
//   s1  easel with the school-book diagram (two paths "arrive together") + KELIRU stamp, wing behind
//   s2  myth: two dots run the upper/lower surface and meet at the trailing edge
//   s3  truth: smoke timelines released upstream; the upper half reaches the trailing edge far ahead
//   s4  angle of attack (chord line, freestream line, arc) and the cambered upper surface
//   s5  streamlines bend and leave the trailing edge downward (downwash arrows)
//   s6  pressure field: low (blue) above, high (red) below, lift arrow, Newton pair, then stall at 17 deg
//   s7  speed gauge 1x -> 2x, fan and flow double, lift arrow grows to 4x
//   s8  generic airliner model (AUDIRA on the fuselage) pitched up, downwash streaming behind its wing
// Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, stage, pts, label } from "./lib3d.js";

const P = { navy: 0x0e1726, steel: "#94a3b8", steelD: "#334155", brass: "#d4af37", cyan: "#22d3ee", cyanL: "#a5f3fc", amber: "#f59e0b", amberL: "#fcd34d", red: "#f43f5e", blue: "#3b82f6" };
const MONO = "'Courier New', monospace", SANS = "'Arial Black', Arial, sans-serif";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// teal shadows, warm highlights (CINEMA_TEAL_ORANGE)
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c+=vec3(-0.01,0.05,0.075)*(1.0-l)*(1.0-l)*0.7+vec3(0.07,0.03,-0.025)*l*l*0.6;
  c=mix(vec3(l),c,1.06);c=(c-0.5)*1.06+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- complex numbers + Joukowski potential flow ----------
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]], csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1] || 1e-12; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const cexp = (th) => [Math.cos(th), Math.sin(th)], csc = (a, s) => [a[0] * s, a[1] * s];
const csqrt = (a) => { const r = Math.hypot(a[0], a[1]); const re = Math.sqrt(Math.max(0, (r + a[0]) / 2)); let im = Math.sqrt(Math.max(0, (r - a[0]) / 2)); if (a[1] < 0) im = -im; return [re, im]; };
const MU = [-0.09, 0.1], RAD = Math.hypot(1 - MU[0], MU[1]), BETA = Math.asin(MU[1] / RAD);
const jk = (zt) => cadd(zt, cdiv([1, 0], zt));
function inv(z) {
  const s = csqrt(csub(cmul(z, z), [4, 0])), a = csc(cadd(z, s), 0.5), b = csc(csub(z, s), 0.5);
  const da = Math.hypot(a[0] - MU[0], a[1] - MU[1]), db = Math.hypot(b[0] - MU[0], b[1] - MU[1]);
  return da >= db ? a : b;
}
function flowAt(alpha) {
  const G = 4 * Math.PI * RAD * Math.sin(alpha + BETA), ea = cexp(-alpha), eb = csc(cexp(alpha), RAD * RAD);
  return (zt) => {
    const s = csub(zt, MU);
    const d = cadd(csub(ea, cdiv(eb, cmul(s, s))), cdiv([0, G / (2 * Math.PI)], s));
    const zp = csub([1, 0], cdiv([1, 0], cmul(zt, zt)));
    return { W: cdiv(d, zp), zp }; // W = u - i v in the airfoil frame
  };
}
// Display frame = airfoil frame rotated by -alpha, so the freestream is horizontal and the wing pitches nose-up.
function path(alpha, x0, y0, tauMax, dTau = 0.05) {
  const F = flowAt(alpha), ra = cexp(alpha), rb = cexp(-alpha);
  let zt = inv(cmul([x0, y0], ra));
  const vel = (q) => { const { W, zp } = F(q); return cdiv([W[0], -W[1]], zp); };
  const N = Math.ceil(tauMax / dTau), out = new Float32Array((N + 1) * 2);
  for (let k = 0; k <= N; k++) {
    const p = cmul(jk(zt), rb); out[k * 2] = p[0]; out[k * 2 + 1] = p[1];
    let rem = dTau, guard = 0;
    while (rem > 1e-9 && guard++ < 300) {
      const k1 = vel(zt), sp = Math.hypot(k1[0], k1[1]), h = Math.min(rem, 0.012 / Math.max(sp, 1e-6));
      const k2 = vel(cadd(zt, csc(k1, h / 2))), k3 = vel(cadd(zt, csc(k2, h / 2))), k4 = vel(cadd(zt, csc(k3, h)));
      zt = cadd(zt, csc([k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0], k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]], h / 6));
      const s = csub(zt, MU), r = Math.hypot(s[0], s[1]);
      if (r < RAD * 1.003) zt = cadd(MU, csc(s, (RAD * 1.003) / r));
      rem -= h;
    }
  }
  return out;
}
const sampleAt = (arr, tau, dTau = 0.05) => { const n = arr.length / 2 - 1; let f = tau / dTau; if (f <= 0) return [arr[0], arr[1]]; if (f >= n) return [arr[n * 2], arr[n * 2 + 1]]; const i = Math.floor(f), u = f - i; return [arr[i * 2] + (arr[i * 2 + 2] - arr[i * 2]) * u, arr[i * 2 + 1] + (arr[i * 2 + 3] - arr[i * 2 + 1]) * u]; };
const A6 = (6 * Math.PI) / 180, A17 = (17 * Math.PI) / 180;

// airfoil outline in the airfoil frame: TE -> over the top -> LE -> underneath -> TE
const PROF = [];
for (let i = 0; i < 240; i++) { const th = -BETA + (i / 240) * Math.PI * 2; PROF.push(jk([MU[0] + RAD * Math.cos(th), MU[1] + RAD * Math.sin(th)])); }
let iLE = 0; PROF.forEach((p, i) => { if (p[0] < PROF[iLE][0]) iLE = i; });
const UPPER = PROF.slice(0, iLE + 1).reverse(), LOWER = PROF.slice(iLE).concat([PROF[0]]); // both LE -> TE
const yOn = (L, x) => { for (let i = 0; i < L.length - 1; i++) { const a = L[i], b = L[i + 1]; if ((x - a[0]) * (x - b[0]) <= 0) { const u = (x - a[0]) / (b[0] - a[0] || 1e-9); return a[1] + (b[1] - a[1]) * u; } } return 0; };
const alongLen = (L) => { const d = [0]; for (let i = 1; i < L.length; i++) d.push(d[i - 1] + Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1])); return d; };
const atFrac = (L, D, f) => { const s = clamp01(f) * D[D.length - 1]; let i = 0; while (i < D.length - 2 && D[i + 1] < s) i++; const u = (s - D[i]) / (D[i + 1] - D[i] || 1e-9); return [L[i][0] + (L[i + 1][0] - L[i][0]) * u, L[i][1] + (L[i + 1][1] - L[i][1]) * u]; };

// ---------- helpers ----------
const std = (c, r = 0.5, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: r, metalness: m, ...x });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
const boxm = (w, h, d, mat, p, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, p, x, y, z);
const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: o, toneMapped: false, depthWrite: false });
function line(points3, color, opacity = 1, dashed = false) {
  const g = new THREE.BufferGeometry().setFromPoints(points3.map((p) => new THREE.Vector3(p[0], p[1], p[2] || 0)));
  const m = dashed ? new THREE.LineDashedMaterial({ color: new THREE.Color(color), dashSize: 0.16, gapSize: 0.1, transparent: true, opacity, toneMapped: false, depthWrite: false })
    : new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity, toneMapped: false, depthWrite: false });
  const L = new THREE.Line(g, m); if (dashed) L.computeLineDistances(); L.frustumCulled = false; return L;
}
function profShape(scale = 1, holes = []) {
  const s = new THREE.Shape(); PROF.forEach((p, i) => (i ? s.lineTo(p[0] * scale, p[1] * scale) : s.moveTo(p[0] * scale, p[1] * scale))); s.closePath();
  for (const [cx, cy, r] of holes) { const h = new THREE.Path(); h.absarc(cx, cy, r, 0, Math.PI * 2, true); s.holes.push(h); }
  return s;
}
const extrude = (shape, d) => { const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 24 }); g.translate(0, 0, -d / 2); return g; };
// arrow along +y from its base, length set per frame
function arrow(color, r = 0.07) {
  const G = new THREE.Group(), m = std(color, 0.35, 0.2, { emissive: new THREE.Color(color), emissiveIntensity: 1.1 });
  const shaft = mesh(new THREE.CylinderGeometry(r, r, 1, 16), m, G); const head = mesh(new THREE.ConeGeometry(r * 2.6, r * 5, 20), m, G);
  G.userData.set = (len) => { const l = Math.max(0.001, len), hl = Math.min(r * 5, l * 0.6); shaft.scale.y = Math.max(0.001, l - hl); shaft.position.y = (l - hl) / 2; head.scale.setScalar(hl / (r * 5)); head.position.y = l - hl / 2; G.visible = len > 0.01; };
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: P.navy, fog: 0.012, exp: 1.0, bloom: [0.32, 0.5, 0.86] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x101826);
    for (const [w, h, c, i, x, y, z] of [[7, 2, 0xffe2b8, 2.2, -3, 5, 4], [3, 6, 0x9eefff, 1.6, 5, 2, -2], [10, 1, 0xdbeafe, 1.0, 0, 6, -3], [8, 2, 0x223046, 0.8, 0, -4, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.55;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x1a2230, 0.9));
  const key = new THREE.DirectionalLight(0xffd6a8, 2.5); key.position.set(-6, 10, 11); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 10, bottom: -6, near: 1, far: 60 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(0x67e8f9, 2.3); rim.position.set(7, 6, -9); scene.add(rim); scene.add(rim.target);
  const fill = new THREE.DirectionalLight(0xbfd8ff, 0.5); fill.position.set(8, 2, 8); scene.add(fill);
  const insp = new THREE.PointLight(0xffb347, 5, 7, 1.6); insp.position.set(0.3, 3.6, 2.6); scene.add(insp);

  const TY = 2.6; // wing pivot height
  const W2 = (p, z = 0) => new THREE.Vector3(p[0], TY + p[1], z); // display frame -> world

  // ================= LAB =================
  const benchMat = std("#1e293b", 0.62, 0.3), steel = std(P.steel, 0.3, 1), steelD = std(P.steelD, 0.45, 0.8), brass = std(P.brass, 0.26, 1);
  boxm(38, 1.2, 7.4, benchMat, scene, 8.5, -0.6, 0);
  boxm(38, 0.06, 0.12, glow(P.cyan, 0.7), scene, 8.5, 0.02, 3.66);
  { // backdrop wall with blueprint grid and the lab sign
    const tex = canvasTex(2048, 512, (g, w, h) => {
      g.fillStyle = "#0f1b2d"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(94,234,212,.10)"; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.strokeStyle = "rgba(94,234,212,.22)"; g.lineWidth = 2; for (let x = 0; x < w; x += 160) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      g.fillStyle = "rgba(252,211,77,.85)"; g.font = `900 64px ${SANS}`; g.fillText("AUDIRA AERO LAB", 1220, 96);
      g.fillStyle = "rgba(165,243,252,.6)"; g.font = `700 30px ${MONO}`; g.fillText("TEROWONGAN ANGIN · UJI PENAMPANG SAYAP", 1222, 142);
    });
    mesh(new THREE.PlaneGeometry(44, 11), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 0.8 }), scene, 8, 4.2, -6.2);
  }
  // ---- tunnel test section x -7.5..7.5, floor y 0, ceiling y 5.3, walls z +-2.7 ----
  const T = new THREE.Group(); scene.add(T);
  {
    const ft = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#3a4657"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(165,243,252,.25)"; g.lineWidth = 2; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
    boxm(15.4, 0.08, 5.4, new THREE.MeshStandardMaterial({ map: ft, roughness: 0.35, metalness: 0.7 }), T, 0, 0.04, 0);
    boxm(15.4, 0.1, 5.4, steelD, T, 0, 5.32, 0);
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.1, roughness: 0.05, metalness: 0.1, depthWrite: false });
    mesh(new THREE.PlaneGeometry(15.4, 5.3), glass, T, 0, 2.66, -2.7);
    for (const x of [-7.5, -3.75, 0, 3.75, 7.5]) {
      boxm(0.2, 0.2, 5.8, steel, T, x, 5.4, 0); boxm(0.2, 0.2, 5.8, steel, T, x, 0.0, 0); boxm(0.2, 5.4, 0.2, steel, T, x, 2.7, -2.8);
      if (Math.abs(x) > 7) boxm(0.2, 5.4, 0.2, steel, T, x, 2.7, 2.8);
    }
    for (const z of [-1.6, 0, 1.6]) boxm(14.6, 0.05, 0.14, glow("#e0f7ff", 0.95), T, 0, 5.26, z); // ceiling light strips
    // inlet honeycomb
    const hc = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#06222b"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(103,232,249,.85)"; g.lineWidth = 3; const s = 26; for (let j = 0; j < 24; j++) for (let i = 0; i < 14; i++) { const cx = i * s * 1.5, cy = j * s * 0.866 * 2 + (i % 2) * s * 0.866; g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; g.lineTo(cx + s * 0.9 * Math.cos(a), cy + s * 0.9 * Math.sin(a)); } g.closePath(); g.stroke(); } });
    const inlet = mesh(new THREE.PlaneGeometry(5.4, 5.3), new THREE.MeshBasicMaterial({ map: hc, toneMapped: false, transparent: true, opacity: 0.8 }), T, -7.62, 2.66, 0); inlet.rotation.y = Math.PI / 2;
  }
  // fan at the exit
  const fan = new THREE.Group(); fan.position.set(7.9, 2.66, 0); fan.rotation.y = -Math.PI / 2; T.add(fan);
  mesh(new THREE.TorusGeometry(2.4, 0.16, 12, 48), steel, fan);
  mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.5, 24), brass, fan).rotation.x = Math.PI / 2;
  const blades = new THREE.Group(); fan.add(blades);
  for (let i = 0; i < 7; i++) { const b = boxm(0.42, 2.0, 0.06, steelD, blades, 0, 1.2, 0); b.rotation.y = 0.5; const piv = new THREE.Group(); piv.rotation.z = (i / 7) * Math.PI * 2; piv.add(b); blades.add(piv); }

  // ================= WING SECTION =================
  const wing = new THREE.Group(); wing.position.set(0, TY, 0); scene.add(wing);
  const skin = new THREE.MeshStandardMaterial({ color: 0x7fe9ff, transparent: true, opacity: 0.2, roughness: 0.12, metalness: 0.1, emissive: 0x0b4a58, emissiveIntensity: 0.5, side: THREE.DoubleSide, depthWrite: false });
  const skinM = new THREE.Mesh(extrude(profShape(), 4), skin); wing.add(skinM);
  const outline = PROF.concat([PROF[0]]);
  for (const z of [-2, 2]) wing.add(line(outline.map((p) => [p[0], p[1], z]), P.cyanL, z > 0 ? 0.95 : 0.5));
  wing.add(line([[UPPER[0][0], UPPER[0][1], -2], [UPPER[0][0], UPPER[0][1], 2]], P.cyanL, 0.8));
  wing.add(line([[2, 0, -2], [2, 0, 2]], P.cyanL, 0.8));
  const thick = (x) => yOn(UPPER, x) - yOn(LOWER, x), mid = (x) => (yOn(UPPER, x) + yOn(LOWER, x)) / 2;
  const holes = [-1.25, -0.25, 0.65].map((x) => [x, mid(x), 0.3 * thick(x)]);
  for (const z of [-1.75, -0.6, 0.6, 1.75]) mesh(extrude(profShape(0.985, holes), 0.07), brass, wing, 0, 0, z);
  for (const x of [-0.85, 0.95]) boxm(0.12, thick(x) * 0.9, 4, steel, wing, x, mid(x), 0);
  boxm(0.05, 0.05, 4, steelD, wing, -1.7, mid(-1.7), 0);
  // sting mount + turntable
  mesh(new THREE.CylinderGeometry(0.09, 0.12, TY - 0.2, 16), steel, scene, 0.1, (TY - 0.2) / 2, -0.6);
  mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.14, 40), brass, scene, 0.1, 0.12, -0.6);
  // overlays living in the wing frame (front face, z 2.2)
  const ZF = 2.22;
  const DU = alongLen(UPPER), DL = alongLen(LOWER);
  const offs = (L, s) => L.map((p, i) => { const q = L[Math.min(i + 1, L.length - 1)], o = L[Math.max(i - 1, 0)], tx = q[0] - o[0], ty = q[1] - o[1], n = Math.hypot(tx, ty) || 1; return [p[0] + (s * ty) / n, p[1] - (s * tx) / n, ZF]; });
  const mythU = line(offs(UPPER, -0.12), P.amberL, 1, true), mythL = line(offs(LOWER, 0.12), P.cyanL, 1, true); wing.add(mythU, mythL);
  const dotU = mesh(new THREE.SphereGeometry(0.11, 20, 14), glow(P.amberL), wing), dotL = mesh(new THREE.SphereGeometry(0.11, 20, 14), glow(P.cyanL), wing);
  const camber = line(offs(UPPER, -0.03), P.amberL, 1); wing.add(camber);
  const chord = line([[UPPER[0][0], UPPER[0][1], ZF], [2, 0, ZF]], P.amberL, 1, true); wing.add(chord);
  // angle-of-attack overlay in the world frame
  const freeL = line([[-3.4, TY, ZF], [3.4, TY, ZF]], P.cyanL, 1, true); scene.add(freeL);
  const arcG = new THREE.BufferGeometry(); arcG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(33 * 3), 3));
  const arc = new THREE.Line(arcG, new THREE.LineBasicMaterial({ color: new THREE.Color(P.amberL), transparent: true, toneMapped: false, depthWrite: false })); arc.frustumCulled = false; scene.add(arc);
  const alphaL = label("α", { w: 128, h: 128, font: `700 100px Georgia, serif`, color: P.amberL, size: 0.55 }); scene.add(alphaL);

  // ================= SCHOOL-BOOK EASEL (hook) =================
  const easel = new THREE.Group(); easel.position.set(-4.3, 0, 3.0); easel.rotation.y = 0.32; scene.add(easel);
  for (const [x, rz] of [[-0.8, 0.12], [0.8, -0.12]]) { const l = boxm(0.08, 3.4, 0.08, std("#5b4636", 0.7), easel, x, 1.6, 0.1); l.rotation.z = rz; }
  const page = canvasTex(1024, 768, (g, w, h) => {
    g.fillStyle = "#f4ead6"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(120,90,60,.25)"; for (let y = 90; y < h; y += 44) { g.beginPath(); g.moveTo(40, y); g.lineTo(w - 40, y); g.stroke(); }
    const sx = (x) => w / 2 + x * 170, sy = (y) => h * 0.56 - y * 170;
    g.fillStyle = "#cfd8e3"; g.strokeStyle = "#2b3a4f"; g.lineWidth = 6; g.beginPath(); PROF.forEach((p, i) => (i ? g.lineTo(sx(p[0]), sy(p[1])) : g.moveTo(sx(p[0]), sy(p[1])))); g.closePath(); g.fill(); g.stroke();
    g.setLineDash([18, 12]); g.lineWidth = 7; g.strokeStyle = "#d97706"; g.beginPath(); UPPER.forEach((p, i) => (i ? g.lineTo(sx(p[0]), sy(p[1] + 0.32)) : g.moveTo(sx(p[0]), sy(p[1] + 0.32)))); g.stroke();
    g.strokeStyle = "#0e7490"; g.beginPath(); LOWER.forEach((p, i) => (i ? g.lineTo(sx(p[0]), sy(p[1] - 0.3)) : g.moveTo(sx(p[0]), sy(p[1] - 0.3)))); g.stroke(); g.setLineDash([]);
    g.fillStyle = "#d97706"; g.beginPath(); g.arc(sx(-2.05), sy(0.3), 14, 0, 7); g.arc(sx(2.05), sy(0.3), 14, 0, 7); g.fill();
    g.fillStyle = "#2b3a4f"; g.font = `700 46px Georgia, serif`; g.textAlign = "center"; g.fillText("tiba bersamaan?", w / 2, 110);
  });
  const board = mesh(new THREE.BoxGeometry(2.7, 2.0, 0.06), [std("#5b4636", 0.7), std("#5b4636", 0.7), std("#5b4636", 0.7), std("#5b4636", 0.7), new THREE.MeshStandardMaterial({ map: page, roughness: 0.85 }), std("#5b4636", 0.7)], easel, 0, 2.55, 0.16);
  board.rotation.x = -0.1;
  const stamp = label("KELIRU", { w: 512, h: 160, font: `900 120px ${SANS}`, color: "#e11d48", size: 1.9 }); stamp.position.set(0.15, 2.45, 0.25); stamp.rotation.set(-0.1, 0, 0.16); easel.add(stamp);

  // ================= FLOW DATA =================
  const UW = 1.5; // world units per second at 1x
  const tDua = A("s7:dua");
  const flowPhase = (t) => { const e = t - tDua; const extra = e <= 0 ? 0 : e < 1 ? (e * e) / 2 : e - 0.5; return UW * (t + extra); };
  // smoke timelines (s3)
  const NP = 52, pulseSeeds = Array.from({ length: NP }, (_, i) => -1.75 + (3.5 * i) / (NP - 1));
  const pulsePaths = pulseSeeds.map((y) => path(A6, -4.8, y, 13.5));
  const pulseTop = pulsePaths.map((pa) => { for (let k = 0; k < pa.length / 2; k++) if (pa[k * 2] > 0) return pa[k * 2 + 1] > 0; return true; });
  const pulses = [0, 1, 2, 3].map(() => {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(NP * 3), col = new Float32Array(NP * 3);
    pulseTop.forEach((top, i) => { const c = new THREE.Color(top ? P.amberL : P.cyanL); col.set([c.r, c.g, c.b], i * 3); });
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const L = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, toneMapped: false, depthWrite: false, linewidth: 2 })); L.frustumCulled = false; scene.add(L);
    const D = pts(scene, NP, { color: 0xffffff, size: 0.16, add: true }); D.col.set(col);
    return { L, pos, g, D };
  });
  // streamlines at 6 deg (s5-s7) and 17 deg (stall)
  const SEEDS = Array.from({ length: 14 }, (_, i) => -2.2 + (4.4 * i) / 13);
  const S6 = SEEDS.map((y) => path(A6, -5.6, y, 12.8)), S17 = SEEDS.map((y) => path(A17, -5.6, y, 12.8));
  const LAY = [[ZF + 0.05, 0.9], [0.8, 0.35], [-0.9, 0.25]];
  const mkStream = (paths, upperCut) => paths.map((pa, i) => {
    const n = pa.length / 2, top = SEEDS[i] > -0.25; let cut = n;
    if (upperCut && top) for (let k = 0; k < n; k++) if (pa[k * 2] > -1.0) { cut = k; break; }
    return LAY.map(([z, o]) => { const v = []; for (let k = 0; k < cut; k++) v.push([pa[k * 2], TY + pa[k * 2 + 1], z]); const L = line(v.length > 1 ? v : [[0, 0, 0], [0, 0, 0]], top ? "#fde7b0" : P.cyanL, o); L.userData.o = o; L.userData.n = v.length; scene.add(L); return L; });
  });
  const ST6 = mkStream(S6, false), ST17 = mkStream(S17, true);
  const MD = 7, dash6 = pts(scene, SEEDS.length * MD, { color: 0xffffff, size: 0.2, add: true });
  SEEDS.forEach((y, i) => { const c = new THREE.Color(y > -0.25 ? P.amberL : P.cyanL); for (let j = 0; j < MD; j++) dash6.col.set([c.r, c.g, c.b], (i * MD + j) * 3); });
  const dash17 = pts(scene, SEEDS.length * MD, { color: 0x67e8f9, size: 0.18, add: true });
  const NW = 150, wake = pts(scene, NW, { color: 0xfca5a5, size: 0.17, add: true });
  const RW = mulberry(18), wakeR = Array.from({ length: NW }, () => [RW(), RW(), RW() * 4 - 2, RW() * 6.28]);
  // upper surface in the 17-deg display frame for the separated wake
  const rot17 = (p) => cmul(p, cexp(-A17)), up17 = UPPER.map(rot17).sort((a, b) => a[0] - b[0]), te17 = rot17([2, 0]);
  const upY17 = (x) => (x >= te17[0] ? te17[1] : yOn(up17, Math.max(up17[0][0], x)));
  // downwash arrows (s5)
  const dwn = [0, 1, 2].map((i) => { const a = arrow(P.cyan, 0.05); a.position.set(2.6 + i * 0.75, TY + 0.15 - i * 0.12, ZF + 0.1); a.rotation.z = Math.PI - 0.32 - 0.12 * i; scene.add(a); return a; });
  // pressure field (s6)
  const field = (low) => canvasTex(512, 256, (g, w, h) => {
    const F = flowAt(A6), ra = cexp(A6), img = g.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = -4.6 + (9.2 * i) / (w - 1), y = 2.3 - (4.6 * j) / (h - 1), zt = inv(cmul([x, y], ra)), s = csub(zt, MU);
      let a = 0, c = [0, 0, 0];
      if (Math.hypot(s[0], s[1]) > RAD * 1.01) {
        const { W } = F(zt), cp = 1 - Math.min(9, W[0] * W[0] + W[1] * W[1]);
        const edge = Math.min(1, Math.min(i, w - 1 - i) / 60) * Math.min(1, Math.min(j, h - 1 - j) / 40);
        if (low && cp < 0) { a = Math.min(0.85, -cp * 0.6) * edge; c = [59 + 80 * a, 130 + 90 * a, 246]; }
        if (!low && cp > 0) { a = Math.min(0.8, cp * 1.1) * edge; c = [249, 90 + 40 * (1 - a), 60]; }
      }
      const o = (j * w + i) * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = a * 255;
    }
    g.putImageData(img, 0, 0);
  });
  const fieldMat = (low) => new THREE.MeshBasicMaterial({ map: field(low), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const fLow = mesh(new THREE.PlaneGeometry(9.2, 4.6), fieldMat(true), scene, 0, TY, 0.0), fHigh = mesh(new THREE.PlaneGeometry(9.2, 4.6), fieldMat(false), scene, 0, TY, 0.02);
  fLow.castShadow = fHigh.castShadow = false;
  const minus = label("−", { w: 128, h: 128, font: `900 120px ${SANS}`, color: "#93c5fd", size: 0.7 }), plus = label("+", { w: 128, h: 128, font: `900 120px ${SANS}`, color: "#fdba74", size: 0.7 });
  minus.position.set(-0.4, TY + 1.15, ZF + 0.2); plus.position.set(0.2, TY - 0.95, ZF + 0.2); scene.add(minus, plus);
  const lift = arrow(P.amber, 0.08); lift.position.set(-0.75, TY + 0.25, ZF + 0.3); scene.add(lift);
  const push = arrow(P.cyan, 0.07); push.position.set(3.0, TY - 0.1, ZF + 0.3); push.rotation.z = Math.PI; scene.add(push);
  const ticks = [1, 2, 3].map(() => { const m = mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 28), glow(P.amberL), scene); m.rotation.x = Math.PI / 2; return m; });
  const stallL = label("STALL", { w: 512, h: 160, font: `900 120px ${SANS}`, color: "#fb7185", size: 1.6 }); stallL.position.set(2.2, TY + 1.7, ZF + 0.3); scene.add(stallL);
  // speed gauge console (s7)
  const gauge = new THREE.Group(); gauge.position.set(3.7, 0, 3.25); gauge.rotation.y = -0.25; scene.add(gauge);
  boxm(0.9, 1.0, 0.6, steelD, gauge, 0, 0.5, 0);
  const dialT = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#0b1220"; g.beginPath(); g.arc(w / 2, w / 2, 250, 0, 7); g.fill(); g.strokeStyle = P.cyan; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, w / 2, 236, 0, 7); g.stroke();
    for (let i = 0; i <= 10; i++) { const a = -Math.PI * 1.25 + (i / 10) * Math.PI * 1.5, r0 = i % 5 ? 196 : 176; g.strokeStyle = i % 5 ? "#7dd3fc" : "#fcd34d"; g.lineWidth = i % 5 ? 5 : 10; g.beginPath(); g.moveTo(w / 2 + r0 * Math.cos(a), w / 2 + r0 * Math.sin(a)); g.lineTo(w / 2 + 222 * Math.cos(a), w / 2 + 222 * Math.sin(a)); g.stroke(); }
    g.fillStyle = "#fcd34d"; g.font = `900 64px ${SANS}`; g.textAlign = "center"; g.fillText("1×", 170, 200); g.fillText("2×", 342, 200);
    g.fillStyle = "#a5f3fc"; g.font = `700 34px ${MONO}`; g.fillText("ANGIN", w / 2, 420);
  });
  const dial = mesh(new THREE.CircleGeometry(0.62, 48), new THREE.MeshBasicMaterial({ map: dialT, toneMapped: false }), gauge, 0, 1.55, 0.05);
  boxm(1.5, 1.5, 0.12, steel, gauge, 0, 1.55, -0.04); dial.castShadow = false;
  const needle = new THREE.Group(); needle.position.set(0, 1.55, 0.09); gauge.add(needle);
  boxm(0.04, 0.5, 0.02, glow("#fb7185"), needle, 0, 0.25, 0);

  // ================= AIRLINER MODEL (s8) =================
  const PX = 18.2, PY = 2.5, PS = 0.8;
  const plane = new THREE.Group(); plane.position.set(PX, PY, 0); plane.scale.setScalar(PS); plane.rotation.z = -A6; scene.add(plane);
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf3f6fa, roughness: 0.28, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.15 }), teal = std("#0f766e", 0.35, 0.2);
  const fus = new THREE.Group(); fus.position.y = 0.2; plane.add(fus);
  mesh(new THREE.CylinderGeometry(0.46, 0.46, 6, 40), white, fus).rotation.z = Math.PI / 2;
  const nose = mesh(new THREE.SphereGeometry(0.46, 32, 20), white, fus, -3, 0, 0); nose.scale.set(1.6, 1, 1);
  const tail = mesh(new THREE.CylinderGeometry(0.46, 0.1, 1.8, 32), white, fus, 3.9, 0.18, 0); tail.rotation.z = Math.PI / 2 + 0.12;
  const fusTex = canvasTex(1024, 96, (g, w, h) => { g.clearRect(0, 0, w, h); for (let x = 60; x < w - 40; x += 26) { g.fillStyle = "#1e293b"; g.beginPath(); g.ellipse(x, 30, 7, 10, 0, 0, 7); g.fill(); } g.fillStyle = "#0f766e"; g.fillRect(0, 62, w, 14); });
  const winP = mesh(new THREE.PlaneGeometry(5.6, 0.52), new THREE.MeshBasicMaterial({ map: fusTex, transparent: true }), fus, 0.1, 0.02, 0.462); winP.castShadow = false;
  const brand = label("AUDIRA", { w: 768, h: 160, font: `900 128px ${SANS}`, color: "#0f2a44", size: 1.9 }); brand.position.set(-0.9, 0.24, 0.47); fus.add(brand);
  for (const s of [-1, 1]) {
    const wg = mesh(extrude(profShape(0.38), 3.6), white, plane, -0.1, -0.1, s * 2.25); wg.rotation.y = s * 0.0;
    mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.95, 24), std("#cbd5e1", 0.3, 0.8), plane, -0.55, -0.42, s * 1.45).rotation.z = Math.PI / 2;
    mesh(extrude(profShape(0.17), 1.5), white, plane, 4.1, 0.42, s * 0.85);
  }
  { const vs = new THREE.Shape(); vs.moveTo(3.3, 0.5); vs.lineTo(4.5, 0.5); vs.lineTo(4.75, 1.85); vs.lineTo(4.25, 1.85); vs.closePath(); mesh(extrude(vs, 0.08), teal, plane); }
  mesh(new THREE.CylinderGeometry(0.07, 0.09, PY / PS - 0.3, 12), steel, scene, PX, (PY - 0.3) / 2, 0);
  mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.18, 40), brass, scene, PX, 0.09, 0);
  const pLift = arrow(P.amber, 0.09); pLift.position.set(PX - 0.1, PY + 0.7, 1.2); scene.add(pLift);
  const pDown = arrow(P.cyan, 0.08); pDown.position.set(PX + 1.6, PY - 0.2, 1.2); pDown.rotation.z = Math.PI - 0.3; scene.add(pDown);
  const PLZ = [-3.0, -2.2, 1.6, 2.4, 3.1], pm = 6, pDash = pts(scene, SEEDS.length * PLZ.length * pm, { color: 0xffffff, size: 0.11, add: true });
  SEEDS.forEach((y, i) => { const c = new THREE.Color(y > -0.25 ? P.amberL : P.cyanL); for (let k = 0; k < PLZ.length * pm; k++) pDash.col.set([c.r, c.g, c.b], (i * PLZ.length * pm + k) * 3); });

  // ================= CAMERA =================
  const CAM = track([
    [0, -3.4, 3.3, 9.9, -3.9, 2.3, 1.6],
    [A("s1:keliru") + 0.3, -3.0, 3.4, 10.4, -3.5, 2.4, 1.5],
    [K.s2 + 0.9, 0.2, 3.5, 13.8, 0.2, 2.2, 0],
    [A("s2:bawah"), 0.9, 3.0, 13.2, 0.5, 2.3, 0],
    [K.s3 + 0.8, 0.9, 3.4, 19.0, 0.9, 2.3, 0],
    [K.s3e, 0.6, 3.6, 18.2, 0.8, 2.3, 0],
    [K.s4 + 0.6, 2.6, 2.5, 10.8, 0.0, 2.5, 0.3],
    [A("s4:cembung") - 0.4, 1.2, 3.4, 10.6, -0.1, 2.5, 0.3],
    [K.s4e, 0.6, 4.2, 11.2, 0.0, 2.4, 0],
    [K.s5 + 0.7, 1.4, 3.1, 17.0, 1.1, 2.2, 0],
    [K.s5e, 1.8, 2.8, 16.2, 1.4, 2.2, 0],
    [K.s6 + 0.6, 0.6, 2.9, 14.6, 0.3, 2.4, 0],
    [A("s6:terlalu") - 0.6, 0.2, 3.0, 13.6, 0.2, 2.5, 0],
    [A("s6:terlepas") + 0.4, 1.3, 3.8, 13.0, 1.2, 2.9, 0],
    [K.s6e, 1.4, 3.7, 13.4, 1.3, 2.9, 0],
    [K.s7 + 0.6, 2.4, 3.4, 14.5, 2.0, 3.1, 0.6],
    [K.s7e, 2.0, 3.6, 14.0, 1.7, 3.2, 0.6],
    [K.s8 + 1.4, 13.3, 4.4, 10.8, 18.0, 2.5, 0],
    [K.end, 12.8, 4.0, 10.2, 18.0, 2.5, 0],
    [K.dur, 12.8, 4.0, 10.2, 18.0, 2.5, 0],
  ]);
  const look = new THREE.Vector3();
  const tKel = A("s1:keliru"), tUd = A("s2:Udara"), tPanj = A("s2:panjang"), tBers = A("s2:bersamaan"), tTer = A("s3:terowongan");
  const tMen = A("s4:menengadah"), tSud = A("s4:Sudut"), tCem = A("s4:cembung"), tBel = A("s5:membelokkan"), tLem = A("s5:terlempar");
  const tTek = A("s6:Tekanan"), tTur = A("s6:turun"), tNaik = A("s6:naik"), tGaya = A("s6:gaya"), tAng = A("s6:angkat"), tDor1 = A("s6:mendorong"), tDor2 = A("s6:mendorong#2");
  const tTerl = A("s6:terlalu"), tCur = A("s6:curam"), tLep = A("s6:terlepas"), tAnj = A("s6:anjlok"), tStall = A("s6:stall"), tEmp = A("s7:empat");
  const tBel8 = A("s8:membelokkan"), tBaw8 = A("s8:bawah");
  const setO = (o, v) => { o.material.opacity = v; o.visible = v > 0.005; };

  return (t) => {
    const c = CAM(t);
    cam.position.set(c[0] + 0.05 * Math.sin(t * 0.6), c[1] + 0.035 * Math.sin(t * 0.83 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    key.target.position.set(c[3], 1, 0); rim.target.position.set(c[3], 2, 0);
    const ph = flowPhase(t);
    blades.rotation.z = -ph * 2.6;

    // angle of attack (degrees)
    const deg = 6 - 6 * ramp(t, K.s4, K.s4 + 0.7) + 6 * ramp(t, tMen - 0.3, tMen + 0.6) + 11 * ramp(t, tTerl, tCur + 0.6) - 11 * ramp(t, K.s7 - 0.2, K.s7 + 0.6);
    const al = (deg * Math.PI) / 180; wing.rotation.z = -al;

    // easel + stamp
    const sp = clamp01((t - tKel + 0.05) / 0.22);
    stamp.visible = t > tKel - 0.05; stamp.scale.setScalar(1 + 0.7 * (1 - sp)); stamp.material.opacity = sp;

    // myth dots (s2)
    const mv = ramp(t, K.s2 - 0.1, K.s2 + 0.4) * (1 - ramp(t, K.s3 - 0.2, K.s3 + 0.4));
    const fu = ramp(t, tUd, tBers + 0.3);
    setO(mythU, mv * (0.35 + 0.65 * ramp(t, tPanj - 0.3, tPanj + 0.3))); setO(mythL, mv * 0.6);
    dotU.visible = dotL.visible = mv > 0.01;
    const pu = atFrac(UPPER, DU, fu), pl = atFrac(LOWER, DL, fu);
    dotU.position.set(pu[0], pu[1] + 0.12, ZF); dotL.position.set(pl[0], pl[1] - 0.12, ZF);
    const meet = 1 + 0.6 * Math.max(0, Math.sin(Math.PI * clamp01((t - tBers - 0.3) / 0.5)));
    dotU.scale.setScalar(meet); dotL.scale.setScalar(meet);

    // smoke timelines (s3)
    const pv = 1 - ramp(t, K.s4 - 0.5, K.s4 + 0.1);
    pulses.forEach((pl2, k) => {
      const rel = tTer - 0.6 + k * 2.9, age = t - rel, tau = age * UW;
      const o = t > K.s3 - 0.4 ? ramp(age, 0, 0.3) * (1 - ramp(age, 7.4, 8.4)) * pv : 0;
      pl2.L.visible = o > 0.01; pl2.D.P.visible = o > 0.01;
      if (o <= 0.01) return;
      for (let i = 0; i < NP; i++) { const p = sampleAt(pulsePaths[i], tau); const x = Math.min(p[0], 7.3); pl2.pos[i * 3] = x; pl2.pos[i * 3 + 1] = TY + p[1]; pl2.pos[i * 3 + 2] = ZF + 0.08; pl2.D.pos.set([x, TY + p[1], ZF + 0.1], i * 3); }
      pl2.g.attributes.position.needsUpdate = true; pl2.L.material.opacity = o; pl2.D.m.opacity = o; pl2.D.commit();
    });

    // angle overlay (s4)
    const ao = ramp(t, tSud - 0.3, tSud + 0.3) * (1 - ramp(t, K.s5 - 0.3, K.s5 + 0.2));
    setO(freeL, ao * 0.9); setO(chord, Math.max(ao, 0.0)); setO(arc, ao);
    { const a = arc.geometry.attributes.position; for (let i = 0; i < 33; i++) { const th = Math.PI - al * (i / 32); a.setXYZ(i, 2.3 * Math.cos(th), TY + 2.3 * Math.sin(th), ZF); } a.needsUpdate = true; }
    alphaL.position.set(-2.75, TY + 0.22 + 0.4 * Math.sin(al / 2), ZF); setO(alphaL, ao);
    setO(camber, ramp(t, tCem - 0.3, tCem + 0.3) * (1 - ramp(t, K.s5, K.s5 + 0.5)));

    // streamlines
    const s6v = ramp(t, tBel - 0.4, tBel + 0.4) * (1 - ramp(t, tTerl - 0.2, tCur + 0.2)) + ramp(t, K.s7, K.s7 + 0.6) * (1 - ramp(t, K.s8 - 0.2, K.s8 + 0.6));
    const s17v = ramp(t, tCur + 0.1, tCur + 0.8) * (1 - ramp(t, K.s7 - 0.3, K.s7 + 0.3));
    const grow = (i, li) => ramp(t, tBel - 0.4 + i * 0.05 + li * 0.15, tBel + 1.4 + i * 0.05 + li * 0.15);
    ST6.forEach((ls, i) => ls.forEach((L, li) => { const v = s6v * L.userData.o; L.visible = v > 0.01; if (L.visible) { L.material.opacity = v; L.geometry.setDrawRange(0, Math.max(2, Math.floor(L.userData.n * (t > K.s7 ? 1 : grow(i, li))))); } }));
    ST17.forEach((ls) => ls.forEach((L) => { const v = s17v * L.userData.o; L.visible = v > 0.01; if (L.visible) L.material.opacity = v; }));
    dash6.P.visible = s6v > 0.01; dash6.m.opacity = s6v;
    if (dash6.P.visible) { const span = 12.8; SEEDS.forEach((_, i) => { for (let j = 0; j < MD; j++) { const tau = (((ph * 0.9 + (j * span) / MD + i * 0.37) % span) + span) % span; const lim = t > K.s7 ? span : span * grow(i, 0); const p = sampleAt(S6[i], Math.min(tau, lim)); dash6.pos.set([p[0], TY + p[1], ZF + 0.1], (i * MD + j) * 3); } }); dash6.commit(); }
    dash17.P.visible = s17v > 0.01; dash17.m.opacity = s17v;
    if (dash17.P.visible) { const span = 12.8; SEEDS.forEach((y, i) => { for (let j = 0; j < MD; j++) { let tau = (((ph * 0.9 + (j * span) / MD + i * 0.37) % span) + span) % span; const p = sampleAt(S17[i], tau); const hide = y > -0.25 && p[0] > -1.0; dash17.pos.set([p[0], hide ? -50 : TY + p[1], ZF + 0.1], (i * MD + j) * 3); } }); dash17.commit(); }
    const wv = s17v * ramp(t, tLep - 0.6, tLep + 0.3);
    wake.P.visible = wv > 0.01; wake.m.opacity = wv;
    if (wake.P.visible) { for (let i = 0; i < NW; i++) { const [a, b, z, q] = wakeR[i]; const f = (t * 0.32 + a) % 1, x = -1.0 + f * 6.2, sw = 0.18 + 0.5 * f; const y = upY17(x) + 0.12 + b * (0.4 + 1.5 * f) + sw * Math.sin(t * 3.4 + q); wake.pos.set([x + sw * Math.cos(t * 3.4 + q), TY + y, z], i * 3); } wake.commit(); }
    dwn.forEach((a, i) => { const p = back(clamp01((t - tLem + 0.1 - i * 0.12) / 0.4)) * (1 - ramp(t, K.s6 - 0.2, K.s6 + 0.3)); a.userData.set(0.9 * p); });

    // pressure (s6)
    const fo = 1 - ramp(t, tTerl - 0.3, tCur + 0.3);
    setO(fLow, 0.85 * ramp(t, tTur - 0.5, tTur + 0.3) * fo); setO(fHigh, 0.85 * ramp(t, tNaik - 0.5, tNaik + 0.3) * fo);
    setO(minus, ramp(t, tTur - 0.3, tTur + 0.2) * fo); setO(plus, ramp(t, tNaik - 0.3, tNaik + 0.2) * fo);
    const s7k = ramp(t, K.s7 + 0.2, K.s7 + 0.8), s4x = back(clamp01((t - tEmp + 0.1) / 0.6), 1.2);
    let L = 1.9 * back(clamp01((t - tGaya + 0.1) / 0.6), 1.3) * (1 - ramp(t, tLep, tAnj + 0.3) * 0.72);
    L += 0.12 * Math.max(0, Math.sin(Math.PI * clamp01((t - tDor2) / 0.5)));
    if (t > K.s7 - 0.3) L = 0.5 * s7k + 1.5 * s4x;
    L *= 1 - ramp(t, K.s8 - 0.3, K.s8 + 0.3);
    lift.userData.set(L);
    ticks.forEach((m, i) => { m.position.set(-0.75, TY + 0.25 + 0.5 * (i + 1), ZF + 0.3); m.visible = t > tEmp - 0.1 && t < K.s8 && L > 0.5 * (i + 1) + 0.05; });
    push.userData.set(1.1 * back(clamp01((t - tDor1 + 0.1) / 0.5)) * (1 - ramp(t, tTerl - 0.3, tTerl + 0.2)));
    const sl = clamp01((t - tStall + 0.1) / 0.2); setO(stallL, sl * (1 - ramp(t, K.s7 - 0.3, K.s7 + 0.1))); stallL.scale.setScalar(1 + 0.5 * (1 - sl));

    // gauge
    needle.rotation.z = 0.785 * (1 - 2 * ramp(t, tDua - 0.2, tDua + 0.6)) * 1 + 0.03 * Math.sin(t * 7) * ramp(t, tDua, tDua + 0.5);

    // airliner downwash (s8)
    const p8 = ramp(t, K.s8 + 0.4, K.s8 + 1.4);
    pDash.P.visible = p8 > 0.01; pDash.m.opacity = p8;
    if (pDash.P.visible) { const span = 12.8, s = 0.38 * PS; let n = 0; SEEDS.forEach((_, i) => PLZ.forEach((z, zi) => { for (let j = 0; j < pm; j++) { const tau = (((ph * 0.9 + (j * span) / pm + i * 0.37 + zi * 0.9) % span) + span) % span; const p = sampleAt(S6[i], tau); pDash.pos.set([PX + p[0] * s, PY + p[1] * s, z], n * 3); n++; } })); pDash.commit(); }
    pLift.userData.set(1.6 * back(clamp01((t - tBel8 + 0.1) / 0.6), 1.3));
    pDown.userData.set(1.0 * back(clamp01((t - tBaw8 + 0.1) / 0.5)));
    plane.position.y = PY + 0.04 * Math.sin(t * 1.3);
    comp.render();
  };
}
