// EP33 PIPIT CHINA 1958: RISOFORGE. A risograph zine opened on a desk: a long cream backdrop page (z = -8) meets the
// floor page (y = 0) at a stapled spine. Every subject is a paper cut-out standing on the floor page (pop-up hinge at its
// bottom edge), printed with up to three spot inks. Inks are unlit shaders MULTIPLIED onto the lit paper underneath, so
// overlaps overprint (pink x blue = violet, blue x yellow = green, pink x yellow = orange), each drum with its own halftone
// angle and a seeded misregistration that re-rolls at 10 fps.
// Stations along x (camera whips across the printed backdrop between them):
//   0 HOOK   flock of pink sparrows, blue target ring, birds drop, green locust swarm floods in.
//  30 PESTS  map of China + four pest cards (rat, fly, mosquito, sparrow); three fold away, a grain sack rises (2 KG).
//  60 1956   a printed report "PIPIT BUKAN HAMA", three tiny anonymous scientists, speech bubble shrinks, stamp DIABAIKAN.
//  90 GONGS  village rooftops, six tiny anonymous silhouettes beating gongs/pans, sound rings, birds circling; nest + eggs.
// 120 COUNT  a tally sheet of sparrow marks printed top-down by a pink riso drum (200 juta in the panel).
// 150 FIELD  rice paddies; sparrow with insect folds away; locust swarm sweeps in; paddies turn rust.
// 180 1960   list card DAFTAR HAMA: PIPIT struck, KUTU BUSUK printed; bird book (Tso-hsin Cheng = name tag in panel).
// 205 CAUSES cracked dry field; four cause cards (drought, flood, policy, campaign); an empty bowl. Famine = panel text.
// 235 RING   food-web disc (sparrow, locust, rice, sun) with AUDIRA PRESS imprint; sparrow back on a rice stalk.
// The chain device rides with the camera in the band above the captions. No faces, no suffering, no real posters.

const FONTS = ['400 80px "Archivo Black"', '700 80px "Space Mono"', '800 80px "Archivo"'];
if (document.fonts && document.fonts.load) {
  try {
    await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "PIPIT 1958 KG"))), new Promise((r) => setTimeout(r, 15000))]);
  } catch (e) { /* system fonts */ }
}

import * as THREE from "./three.module.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { mulberry, clamp01, smooth, eout, back, stage } from "./lib3d.js";
import { GEO } from "./geo.js";

const AB = '"Archivo Black", Arial, sans-serif', SM = '"Space Mono", monospace';
const ENV = 0.3;
const INK = { P: "#FF48B0", B: "#0078BF", Y: "#FFE800" };
const ANG = { P: 0.26, B: 1.31, Y: 0.79 };
const DRN = { P: 0, B: 1, Y: 2 };
const PAPER = "#F6F0E2";
const TAU = Math.PI * 2;

// Hermite track with harmonic-mean tangents: never overshoots a key.
function track(keys) {
  keys.sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}

// ---------------- riso ink shader ----------------
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
uniform vec3 uInk; uniform float uDensity, uDot, uAngle, uGrain, uSeed, uOpacity, uRevY, uRevX; uniform sampler2D uMask;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  float m = texture2D(uMask, vUv).r;
  if (1.0 - vUv.y > uRevY || vUv.x > uRevX) m = 0.0;
  float dens = uDensity * m;
  if (dens < 0.004) discard;
  vec2 px = gl_FragCoord.xy;
  float cov = 1.0;
  if (dens < 0.97) {
    float c = cos(uAngle), s = sin(uAngle);
    vec2 q = mat2(c, -s, s, c) * px / uDot;
    float d = length(fract(q) - 0.5);
    float r = sqrt(dens) * 0.7;
    cov = 1.0 - smoothstep(r - 0.08, r + 0.08, d);
  }
  float g1 = hash(floor(px / uGrain));
  float g2 = hash(floor(px / (uGrain * 0.5)) + 7.0);
  cov *= 0.82 + 0.18 * g1;
  cov *= g2 < 0.06 ? 0.3 : 1.0;
  cov *= uOpacity;
  if (cov < 0.004) discard;
  gl_FragColor = vec4(mix(vec3(1.0), uInk, cov), 1.0);
}`;
let SEED = 1;
function inkMat(drum, tex, density = 1) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uInk: { value: new THREE.Color(INK[drum]) }, uDensity: { value: density }, uDot: { value: 9 }, uAngle: { value: ANG[drum] },
      uGrain: { value: 3.2 }, uSeed: { value: (SEED++ * 0.137) % 1 }, uOpacity: { value: 1 }, uRevY: { value: 1 }, uRevX: { value: 1 }, uMask: { value: tex },
    },
    side: THREE.DoubleSide, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor,
  });
}

// ---------------- 2D painting helpers (y up) ----------------
const E = (g, x, y, rx, ry, r = 0) => { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), r, 0, TAU); g.fill(); };
const PL = (g, P) => { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); g.fill(); };
const LN = (g, P, w) => { g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.stroke(); };
const QC = (g, a, c, b, w) => { g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.stroke(); };
const RING = (g, x, y, r, w) => { g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); };
const KO = (g, fn) => { const o = g.globalCompositeOperation, f = g.fillStyle, s = g.strokeStyle; g.globalCompositeOperation = "source-over"; g.fillStyle = g.strokeStyle = g._off; fn(); g.fillStyle = f; g.strokeStyle = s; g.globalCompositeOperation = o; };
// text in device pixels so tiny world-unit font sizes stay crisp; size in current units
function TX(g, str, x, y, size, font = AB, align = "center") {
  const m = g.getTransform(), p = m.transformPoint(new DOMPoint(x, y)), sc = Math.hypot(m.c, m.d);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `${font.startsWith("700") || font.startsWith("800") ? "" : "400 "}${(size * sc).toFixed(1)}px ${font}`;
  if (font === SM) g.font = `700 ${(size * sc).toFixed(1)}px ${SM}`;
  g.textAlign = align; g.textBaseline = "middle"; g.fillText(str, p.x, p.y); g.restore();
}
const ga = (g, a, fn) => { const o = g.globalAlpha; g.globalAlpha = a; fn(); g.globalAlpha = o; };

// Icons in a unit box (about -1..1), one painter per drum.
const ICON = {
  bird: {
    P: (g) => { E(g, 0, 0, 0.62, 0.4, 0.15); E(g, 0.52, 0.3, 0.3, 0.28); PL(g, [[-0.42, 0.08], [-1, 0.34], [-0.97, 0.12], [-0.48, -0.14]]); KO(g, () => E(g, 0.6, 0.36, 0.055, 0.055)); },
    B: (g) => { E(g, -0.1, 0.1, 0.46, 0.2, 0.35); E(g, 0.48, 0.47, 0.22, 0.11, -0.2); PL(g, [[0.76, 0.37], [1.02, 0.28], [0.76, 0.2]]); LN(g, [[0, -0.36], [0.02, -0.64]], 0.06); LN(g, [[0.16, -0.33], [0.22, -0.6]], 0.06); },
    Y: (g) => { E(g, 0.14, -0.13, 0.42, 0.22, 0.12); E(g, 0.62, 0.2, 0.13, 0.09); },
  },
  locust: {
    Y: (g) => { E(g, 0, 0, 0.85, 0.2); E(g, 0.82, 0.06, 0.2, 0.2); },
    B: (g) => { E(g, -0.18, 0.15, 0.72, 0.15, -0.06); ga(g, 0.45, () => E(g, 0.1, 0, 0.8, 0.2)); LN(g, [[-0.05, -0.02], [-0.5, 0.48], [-0.95, -0.34]], 0.12); LN(g, [[0.5, -0.1], [0.56, -0.42]], 0.05); LN(g, [[0.3, -0.12], [0.22, -0.42]], 0.05); LN(g, [[0.92, 0.2], [1.12, 0.6]], 0.04); KO(g, () => E(g, 0.88, 0.1, 0.05, 0.05)); },
  },
  rice: {
    B: (g) => { for (let k = -2; k <= 2; k++) QC(g, [k * 0.06, -1], [k * 0.05, 0], [k * 0.36, 0.45 - Math.abs(k) * 0.12], 0.07); QC(g, [0, -1], [0.05, 0.3], [0.3, 0.95], 0.05); QC(g, [0, -1], [-0.05, 0.3], [-0.32, 0.9], 0.05); },
    Y: (g) => { for (let i = 0; i < 7; i++) { E(g, 0.3 + i * 0.06, 0.95 - i * i * 0.022, 0.06, 0.035, 0.8); E(g, -0.32 - i * 0.06, 0.9 - i * i * 0.022, 0.06, 0.035, -0.8); } },
  },
  person: { // tiny anonymous silhouette beating a gong (facing right)
    B: (g) => { E(g, 0, 0.78, 0.16, 0.17); PL(g, [[-0.24, 0.56], [0.24, 0.56], [0.17, -0.05], [-0.17, -0.05]]); LN(g, [[-0.08, -0.05], [-0.16, -0.5], [-0.12, -1]], 0.13); LN(g, [[0.08, -0.05], [0.2, -0.5], [0.26, -1]], 0.13); LN(g, [[-0.17, 0.5], [-0.28, 0.78], [-0.06, 0.98]], 0.1); LN(g, [[-0.06, 0.98], [0.52, 0.62]], 0.05); LN(g, [[0.18, 0.47], [0.4, 0.33], [0.52, 0.3]], 0.1); },
    Y: (g) => { E(g, 0.72, 0.3, 0.27, 0.27); },
    P: (g) => { RING(g, 0.72, 0.3, 0.17, 0.04); },
  },
  pan: {
    B: (g) => { ICON.person.B(g); },
    P: (g) => { E(g, 0.68, 0.32, 0.22, 0.2); LN(g, [[0.68, 0.12], [0.62, -0.25]], 0.07); },
  },
  scholar: { // tiny anonymous silhouette holding an open notebook
    B: (g) => { E(g, 0, 0.78, 0.16, 0.17); PL(g, [[-0.24, 0.56], [0.24, 0.56], [0.17, -0.05], [-0.17, -0.05]]); LN(g, [[-0.08, -0.05], [-0.1, -1]], 0.13); LN(g, [[0.08, -0.05], [0.12, -1]], 0.13); LN(g, [[0.18, 0.48], [0.36, 0.3]], 0.1); LN(g, [[-0.18, 0.48], [-0.05, 0.28], [0.3, 0.3]], 0.1); },
    Y: (g) => { PL(g, [[0.22, 0.24], [0.62, 0.36], [0.62, 0.06], [0.22, -0.06]]); },
  },
  rat: {
    B: (g) => { E(g, -0.05, -0.2, 0.6, 0.36); PL(g, [[0.4, 0.02], [0.95, -0.25], [0.4, -0.42]]); E(g, 0.42, 0.18, 0.15, 0.15); QC(g, [-0.62, -0.3], [-1.0, -0.8], [-0.4, -0.85], 0.07); KO(g, () => E(g, 0.66, -0.12, 0.05, 0.05)); },
    P: (g) => { E(g, 0.42, 0.18, 0.08, 0.08); E(g, 0.94, -0.25, 0.06, 0.06); },
  },
  fly: {
    B: (g) => { E(g, -0.1, -0.1, 0.4, 0.25); E(g, 0.38, -0.08, 0.17, 0.17); for (const x of [-0.3, 0, 0.25]) LN(g, [[x, -0.25], [x - 0.12, -0.55]], 0.05); },
    P: (g) => { ga(g, 0.75, () => { E(g, -0.2, 0.32, 0.42, 0.22, 0.5); E(g, 0.12, 0.34, 0.36, 0.2, -0.4); }); },
  },
  mosquito: {
    B: (g) => { E(g, -0.15, 0, 0.55, 0.08, 0.2); E(g, 0.45, 0.14, 0.11, 0.11); LN(g, [[0.52, 0.12], [0.95, -0.05]], 0.03); for (const [a, b] of [[0, -0.75], [0.15, -0.6], [-0.2, -0.85]]) { LN(g, [[a, -0.02], [a + 0.15, -0.3], [b * 0.4 + a, b]], 0.03); } },
    Y: (g) => { E(g, -0.1, 0.3, 0.45, 0.13, 0.6); E(g, 0.08, 0.3, 0.4, 0.12, 0.2); },
  },
  bug: { // kutu busuk
    P: (g) => { E(g, -0.05, 0, 0.55, 0.42); },
    B: (g) => { E(g, 0.55, 0, 0.18, 0.16); for (const x of [-0.3, 0, 0.3]) { LN(g, [[x, 0.3], [x - 0.15, 0.62]], 0.06); LN(g, [[x, -0.3], [x - 0.15, -0.62]], 0.06); } LN(g, [[-0.4, 0], [0.4, 0]], 0.04); LN(g, [[0.65, 0.1], [0.92, 0.35]], 0.03); LN(g, [[0.65, -0.1], [0.92, -0.35]], 0.03); },
  },
  sack: {
    Y: (g) => { PL(g, [[-0.62, -0.92], [0.62, -0.92], [0.72, -0.3], [0.52, 0.5], [0.24, 0.66], [-0.24, 0.66], [-0.52, 0.5], [-0.72, -0.3]]); E(g, 0, 0.8, 0.36, 0.14); },
    B: (g) => { LN(g, [[-0.28, 0.62], [0.28, 0.62]], 0.08); ga(g, 0.35, () => PL(g, [[-0.62, -0.92], [0.62, -0.92], [0.72, -0.3], [0.1, -0.5]])); },
  },
  sun: {
    Y: (g) => { E(g, 0, 0.35, 0.42, 0.42); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; LN(g, [[Math.cos(a) * 0.55, 0.35 + Math.sin(a) * 0.55], [Math.cos(a) * 0.78, 0.35 + Math.sin(a) * 0.78]], 0.07); } PL(g, [[-1, -0.35], [1, -0.35], [1, -1], [-1, -1]]); },
    P: (g) => { ga(g, 0.55, () => PL(g, [[-1, -0.35], [1, -0.35], [1, -1], [-1, -1]])); },
    B: (g) => { LN(g, [[-0.8, -0.4], [-0.5, -0.65], [-0.6, -0.95]], 0.05); LN(g, [[-0.5, -0.65], [-0.1, -0.7], [0.15, -0.5]], 0.05); LN(g, [[-0.1, -0.7], [0.2, -0.98]], 0.05); LN(g, [[0.15, -0.5], [0.6, -0.62], [0.85, -0.42]], 0.05); },
  },
  flood: {
    P: (g) => { PL(g, [[-0.55, 0.0], [-0.55, 0.45], [-0.2, 0.75], [0.15, 0.45], [0.15, 0.0]]); },
    B: (g) => { for (let k = 0; k < 4; k++) { const y = 0.05 - k * 0.3; g.lineWidth = 0.09; g.lineCap = "round"; g.beginPath(); for (let i = 0; i <= 24; i++) { const x = -0.95 + i * 0.08; const yy = y + 0.07 * Math.sin(i * 1.2 + k); i ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); } ga(g, 0.5, () => PL(g, [[-1, 0.05], [1, 0.05], [1, -1], [-1, -1]])); },
  },
  doc: {
    P: (g) => { ga(g, 0.5, () => PL(g, [[-0.6, -0.9], [0.6, -0.9], [0.6, 0.6], [0.3, 0.9], [-0.6, 0.9]])); },
    B: (g) => { for (let k = 0; k < 6; k++) LN(g, [[-0.42, 0.6 - k * 0.24], [0.42 - (k % 3) * 0.12, 0.6 - k * 0.24]], 0.06); LN(g, [[-0.62, -0.92], [0.62, -0.92], [0.62, 0.6], [0.3, 0.92], [-0.62, 0.92], [-0.62, -0.92]], 0.05); },
    Y: (g) => { LN(g, [[-0.7, 0.7], [0.7, -0.7]], 0.14); LN(g, [[-0.7, -0.7], [0.7, 0.7]], 0.14); },
  },
  bowl: {
    Y: (g) => { E(g, 0, 0.08, 0.62, 0.38); },
    B: (g) => { PL(g, [[-0.85, 0.05], [0.85, 0.05], [0.6, -0.55], [0.3, -0.7], [-0.3, -0.7], [-0.6, -0.55]]); PL(g, [[-0.3, -0.7], [0.3, -0.7], [0.36, -0.88], [-0.36, -0.88]]); },
  },
  bowl0: {
    B: (g) => { LN(g, [[-0.85, 0.05], [0.85, 0.05], [0.6, -0.55], [0.3, -0.7], [-0.3, -0.7], [-0.6, -0.55], [-0.85, 0.05]], 0.09); PL(g, [[-0.3, -0.7], [0.3, -0.7], [0.36, -0.88], [-0.36, -0.88]]); },
    P: (g) => { ga(g, 0.3, () => PL(g, [[-0.82, 0.05], [0.82, 0.05], [0.6, -0.52], [-0.6, -0.52]])); },
  },
  bolt: { // insect/seed pairing for the food web arrows: small grains
    Y: (g) => { for (let i = 0; i < 5; i++) E(g, -0.5 + i * 0.25, 0, 0.1, 0.06, 0.6); },
  },
};
const ic = (g, name, d, x, y, s, flip = 1, rot = 0) => { const f = ICON[name][d]; if (!f) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * flip, s); f(g); g.restore(); };

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v === undefined) throw new Error("missing anchor " + k); return v; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xefe6d2, exp: 0.9, bloom: [0.05, 0.3, 0.98], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.9;
  bp.strength = 0.04; bp.threshold = 0.98;
  { const c = document.createElement("canvas"); c.width = 8; c.height = 512; const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#F3EBD8"); gr.addColorStop(1, "#E3D7BE"); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25; // r186: material.envMapIntensity is ignored for scene.environment
  scene.add(cam);

  // paper stock
  const paperCanvas = (n, seed) => { const c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"); const q = mulberry(seed);
    g.fillStyle = PAPER; g.fillRect(0, 0, n, n);
    for (let i = 0; i < n * 9; i++) { g.fillStyle = q() > 0.5 ? "rgba(255,255,255,.35)" : "rgba(150,128,98,.10)"; g.fillRect(q() * n, q() * n, 1 + q() * 2, 1 + q() * 2); }
    g.strokeStyle = "rgba(140,118,88,.13)"; g.lineWidth = 1;
    for (let i = 0; i < n / 4; i++) { const x = q() * n, y = q() * n, a = q() * Math.PI; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10 + 4, x + Math.cos(a) * 22, y + Math.sin(a) * 22); g.stroke(); }
    return c; };
  const pTex = new THREE.CanvasTexture(paperCanvas(512, 7)); pTex.colorSpace = THREE.SRGBColorSpace; pTex.wrapS = pTex.wrapT = THREE.RepeatWrapping;
  const mkPaperMat = (alphaMap, rep = [1, 1]) => { const t = pTex.clone(); t.needsUpdate = true; t.repeat.set(rep[0], rep[1]); return new THREE.MeshStandardMaterial({ map: t, color: 0xffffff, roughness: 0.93, metalness: 0, envMapIntensity: ENV, alphaMap, alphaTest: alphaMap ? 0.5 : 0, side: THREE.DoubleSide }); };

  // ---------------- layer factory ----------------
  const inks = []; // every ink mesh, for misregistration
  const cache = new Map();
  function maskCanvas(W, H, S, fn) {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    g.setTransform(S, 0, 0, -S, W / 2, H / 2); g.fillStyle = g.strokeStyle = "#fff"; g._on = "#fff"; g._off = "#000";
    fn(g); return c;
  }
  const dataTex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t; };
  // o: { w, h, inks: [{ d:'P'|'B'|'Y', den, p:(g)=>{} }], cut?:(g)=>{}, pad, paper, key, ppu }
  function layer(o) {
    const ppu = o.ppu || 120, s = Math.max(o.w, o.h), res = Math.min(2048, Math.ceil(s * ppu));
    const W = Math.max(8, Math.round(res * o.w / s)), H = Math.max(8, Math.round(res * o.h / s)), S = W / o.w;
    const key = o.key ? o.key + "|" + W + "x" + H : null;
    let made = key && cache.get(key);
    if (!made) {
      const cs = o.inks.map((k) => maskCanvas(W, H, S, k.p));
      let cut = null;
      if (o.paper !== false) {
        let cc;
        if (o.cut) cc = maskCanvas(W, H, S, o.cut);
        else {
          cc = document.createElement("canvas"); cc.width = W; cc.height = H; const g = cc.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
          g.globalCompositeOperation = "lighter"; const pad = o.pad ?? Math.max(4, Math.round(0.07 * S));
          for (const c of cs) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.drawImage(c, Math.cos(a) * pad, Math.sin(a) * pad); }
        }
        cut = dataTex(cc);
      }
      made = { tex: cs.map(dataTex), cut };
      if (key) cache.set(key, made);
    }
    const G = new THREE.Group(), inner = new THREE.Group(); G.add(inner); inner.position.y = o.h / 2;
    const geo = new THREE.PlaneGeometry(o.w, o.h);
    let paper = null;
    if (o.paper !== false) { paper = new THREE.Mesh(geo, mkPaperMat(made.cut)); paper.castShadow = true; paper.receiveShadow = true; inner.add(paper); }
    const ms = o.inks.map((k, i) => {
      const m = new THREE.Mesh(geo, inkMat(k.d, made.tex[i], k.den ?? 1));
      m.position.z = 0.004 * (i + 1); m.renderOrder = 2 + i; inner.add(m);
      inks.push({ m, d: DRN[k.d], z: m.position.z, amp: o.amp ?? 1 });
      return m;
    });
    // back face prints nothing; inks are double-sided but sit in front
    return { G, inner, paper, ms, w: o.w, h: o.h };
  }
  const place = (L, x, y, z, ry = 0, parent = scene) => { L.G.position.set(x, y, z); L.G.rotation.y = ry; parent.add(L.G); return L; };
  const setOp = (L, v, idx) => L.ms.forEach((m, i) => { if (idx === undefined || idx.includes(i)) m.material.uniforms.uOpacity.value = v; });
  const pop = (L, t, t0, dur = 0.55) => { const u = clamp01((t - t0) / dur); L.G.visible = u > 0.001; L.G.rotation.x = -(1 - back(u, 1.4)) * Math.PI / 2; return u; };
  const fold = (L, t, t0, dur = 0.5) => { const u = smooth((t - t0) / dur); if (u > 0) L.G.rotation.x = -u * Math.PI / 2; if (u >= 1) L.G.visible = false; return u; };

  // ---------------- desk: backdrop page, floor page, spine staples ----------------
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(340, 40), mkPaperMat(null, [42, 5]));
  wall.position.set(118, 19.5, -8); wall.receiveShadow = true; scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(340, 20), mkPaperMat(null, [42, 2.5]));
  floor.rotation.x = -Math.PI / 2; floor.position.set(118, 0, 2); floor.receiveShadow = true; scene.add(floor);
  const fold0 = new THREE.Mesh(new THREE.PlaneGeometry(340, 0.7), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.08, depthWrite: false }));
  fold0.position.set(118, 0.35, -7.98); scene.add(fold0);
  const stapleM = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.9, roughness: 0.3, envMapIntensity: 1.0 });
  for (let x = -40; x < 280; x += 9) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), stapleM); s.position.set(x, 0.55, -7.94); scene.add(s); }
  // page edge + cutting mat in front of the floor page
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(340, 30), new THREE.MeshStandardMaterial({ color: 0x7fa59a, roughness: 0.85 }));
  mat.rotation.x = -Math.PI / 2; mat.position.set(118, -0.05, 22); mat.receiveShadow = true; scene.add(mat);

  // long backdrop print: horizon band, cloud strokes, hills (keeps every whip pan printed, never empty)
  const WALLW = 300;
  const bandL = layer({ w: WALLW, h: 16, ppu: 13, paper: false, amp: 0.4, inks: [
    { d: "P", p: (g) => { for (let i = 0; i < 40; i++) { const x = -150 + i * 7.6; ga(g, 0.32, () => E(g, x, -4.6 + (i % 3) * 0.4, 5.2, 1.6)); } ga(g, 0.22, () => g.fillRect(-150, -8, 300, 2.2)); } },
    { d: "B", p: (g) => { const q = mulberry(5); for (let i = 0; i < 60; i++) { const x = -150 + q() * 300, y = 1 + q() * 6; ga(g, 0.35 + q() * 0.3, () => E(g, x, y, 1.2 + q() * 2.6, 0.18 + q() * 0.15)); } ga(g, 0.62, () => { g.beginPath(); g.moveTo(-150, -8); for (let i = 0; i <= 300; i++) g.lineTo(-150 + i, -5.6 + 0.9 * Math.sin(i * 0.21) + 0.5 * Math.sin(i * 0.53)); g.lineTo(150, -8); g.closePath(); g.fill(); }); } },
    { d: "Y", p: (g) => { ga(g, 0.5, () => g.fillRect(-150, -8, 300, 3.0)); } },
  ] });
  place(bandL, 118, 0, -7.97); bandL.inner.position.y = 8;

  // printed floor sheet in front of each station: fills the caption band with quiet print texture
  const floorPrint = (x) => { const L = layer({ w: 15, h: 10.5, key: "floorp", ppu: 60, paper: false, amp: 0.6, inks: [
    { d: "Y", den: 0.11, p: (g) => { for (let k = 0; k < 14; k++) g.fillRect(-7.5, -5.25 + k * 0.75, 15, 0.22); } },
    { d: "P", den: 0.12, p: (g) => { const q = mulberry(17); for (let i = 0; i < 26; i++) ic(g, "rice", "B", -7 + q() * 14, -4.6 + q() * 9, 0.35 + q() * 0.25, q() < 0.5 ? 1 : -1); } },
    { d: "B", p: (g) => { const reg = (cx, cy) => { RING(g, cx, cy, 0.16, 0.03); LN(g, [[cx - 0.3, cy], [cx + 0.3, cy]], 0.025); LN(g, [[cx, cy - 0.3], [cx, cy + 0.3]], 0.025); };
      reg(-6.6, 3.9); reg(6.6, 3.9); reg(-6.6, -3.2); reg(6.6, -3.2); ga(g, 0.55, () => { LN(g, [[-5.8, 4.4], [5.8, 4.4]], 0.03); TX(g, "AUDIRA PRESS · EDISI 33 · CETAK RISO 3 DRUM", 0, 4.05, 0.22, SM); }); } },
  ] }); L.G.rotation.x = -Math.PI / 2; place(L, x, 0.012, 13.2); L.G.rotation.x = -Math.PI / 2; return L; };
  const floorPrints = [0, 30, 60, 90, 120, 150, 180, 205, 235].map(floorPrint);

  // ---------------- HOOK (x 0) ----------------
  const HX = 0;
  const sunL = place(layer({ w: 7, h: 7, paper: false, ppu: 60, inks: [
    { d: "Y", p: (g) => { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 3.4); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.75, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; E(g, 0, 0, 3.4, 3.4); } },
    { d: "P", p: (g) => { ga(g, 0.45, () => E(g, 0, 0, 2.6, 2.6)); } },
  ] }), HX + 2.2, 3.2, -7.9);
  const fieldL = place(layer({ w: 16, h: 2.2, ppu: 90, inks: [
    { d: "Y", p: (g) => { g.fillRect(-8, -1.1, 16, 1.6); for (let i = 0; i < 80; i++) ic(g, "rice", "Y", -7.8 + i * 0.2, 0.3, 0.45); } },
    { d: "B", den: 0.6, p: (g) => { for (let i = 0; i < 80; i++) ic(g, "rice", "B", -7.8 + i * 0.2, 0.3, 0.45); g.fillRect(-8, -1.1, 16, 0.6); } },
  ] }), HX, 0, -5);
  const birdKey = (name) => [
    { d: "P", p: (g) => ic(g, name, "P", 0, 0, 0.95) }, { d: "B", p: (g) => ic(g, name, "B", 0, 0, 0.95) }, { d: "Y", p: (g) => ic(g, name, "Y", 0, 0, 0.95) }];
  const mkBird = (s) => layer({ w: 2.1 * s, h: 1.5 * s, key: "bird" + s, inks: birdKey("bird").map((k) => ({ ...k, p: (g) => { g.scale(s, s); k.p(g); } })) });
  const hookBirds = [];
  { const q = mulberry(33);
    const P = [[-2.6, 4.6, -3.2], [-0.4, 5.6, -3.6], [2.4, 4.9, -3.0], [-2.9, 2.9, -1.6], [2.9, 2.6, -1.2], [0.9, 3.7, -2.2], [-1.6, 6.3, -4.4], [3.3, 6.0, -4.6]];
    P.forEach((p, i) => { const L = mkBird(i < 6 ? 1 : 0.8); L.inner.position.y = 0; place(L, HX + p[0], p[1], p[2]); hookBirds.push({ L, p, ph: q() * 6, f: i % 2 ? 1 : -1 }); }); }
  const heroBird = mkBird(1.55); heroBird.inner.position.y = 0; place(heroBird, HX - 0.2, 2.15, 0.6);
  const target = place(layer({ w: 4.4, h: 4.4, paper: false, ppu: 110, inks: [
    { d: "B", p: (g) => { RING(g, 0, 0, 2.0, 0.09); RING(g, 0, 0, 1.4, 0.05); for (const [a, b] of [[[0, 2.2], [0, 1.15]], [[0, -2.2], [0, -1.15]], [[2.2, 0], [1.15, 0]], [[-2.2, 0], [-1.15, 0]]]) LN(g, [a, b], 0.08); } },
    { d: "P", p: (g) => { RING(g, 0, 0, 2.06, 0.05); } },
  ] }), HX - 0.2, 2.15, 1.0); target.inner.position.y = 0;
  const swarmPaint = (seed, n, w, h, s0) => (d) => (g) => { const q = mulberry(seed); for (let i = 0; i < n; i++) { const x = (q() - 0.5) * w, y = (q() - 0.5) * h, s = s0 * (0.6 + q() * 0.6), rot = (q() - 0.5) * 0.8; ic(g, "locust", d, x, y, s, q() < 0.25 ? -1 : 1, rot); } };
  const mkSwarm = (seed, n, w, h, s0, key) => { const pp = swarmPaint(seed, n, w, h, s0); return layer({ w, h, key, ppu: 80, inks: [{ d: "Y", p: pp("Y") }, { d: "B", p: pp("B") }] }); };
  const hookSwarm = [mkSwarm(11, 34, 9, 3.2, 0.32, "sw1"), mkSwarm(12, 26, 9, 3.2, 0.42, "sw2"), mkSwarm(13, 14, 9, 3.0, 0.62, "sw3")];
  hookSwarm.forEach((L, i) => { L.inner.position.y = 0; place(L, HX, [5.0, 3.9, 2.6][i], [-3.4, -1.6, 0.2][i]); });
  const heroLoc = layer({ w: 4.6, h: 2.4, inks: [{ d: "Y", p: (g) => ic(g, "locust", "Y", 0, 0, 2.0) }, { d: "B", p: (g) => ic(g, "locust", "B", 0, 0, 2.0) }] });
  heroLoc.inner.position.y = 0; place(heroLoc, HX + 0.5, 1.7, -0.5);
  const grassL = place(layer({ w: 12, h: 1.6, ppu: 90, inks: [
    { d: "B", p: (g) => { for (let i = 0; i < 46; i++) ic(g, "rice", "B", -5.8 + i * 0.26, 0, 0.75, i % 2 ? 1 : -1); } },
    { d: "Y", den: 0.85, p: (g) => { for (let i = 0; i < 46; i++) ic(g, "rice", "Y", -5.8 + i * 0.26, 0, 0.75, i % 2 ? 1 : -1); TX(g, "AUDIRA PRESS · EDISI 33", 4.2, -0.62, 0.17, SM); } },
  ] }), HX, 0, 2.6);

  // ---------------- PESTS (x 30) ----------------
  const PX = 30;
  const lonlat = (lo, la) => [(lo - 104) * 0.1, (la - 36) * 0.1];
  const chinaPath = (g) => { g.beginPath(); for (const c of GEO) for (const ring of c.rings) { ring.forEach((p, i) => { const [x, y] = lonlat(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); } };
  const mapL = place(layer({ w: 7.2, h: 5.4, ppu: 150, cut: (g) => { g.fillRect(-3.6, -2.7, 7.2, 5.4); }, inks: [
    { d: "P", den: 0.55, p: (g) => { g.translate(0, 0.5); chinaPath(g); g.fill(); } },
    { d: "B", p: (g) => { g.translate(0, 0.5); chinaPath(g); g.lineWidth = 0.05; g.lineJoin = "round"; g.stroke(); g.setTransform(g.getTransform()); TX(g, "CHINA", 0.2, 0.15, 0.55); TX(g, "1958", 1.6, -2.35, 0.48, SM); g.lineWidth = 0.04; g.strokeRect(-3.45, -3.12, 6.9, 5.2); } },
    { d: "Y", den: 0.35, p: (g) => { g.fillRect(-3.6, -2.7, 7.2, 5.4); } },
  ] }), PX, 0, -4.8);
  const pestNames = [["rat", "TIKUS", "s2:tikus"], ["fly", "LALAT", "s2:lalat"], ["mosquito", "NYAMUK", "s2:nyamuk"], ["bird", "PIPIT", "s2:pipit"]];
  const pestCards = pestNames.map(([n, lab, a], i) => {
    const L = layer({ w: 1.5, h: 2.25, ppu: 200, cut: (g) => { g.fillRect(-0.75, -1.125, 1.5, 2.25); }, inks: [
      { d: "Y", den: 0.4, p: (g) => { g.fillRect(-0.75, -1.125, 1.5, 2.25); } },
      { d: "P", p: (g) => { ic(g, n, "P", 0, 0.25, 0.62); if (n === "bird") RING(g, 0, 0.25, 0.74, 0.06); } },
      { d: "B", p: (g) => { ic(g, n, "B", 0, 0.25, 0.62); TX(g, lab, 0, -0.78, 0.26); g.lineWidth = 0.03; g.strokeRect(-0.69, -1.06, 1.38, 2.12); } },
    ] });
    if (ICON[n].Y) L.ms[0].material.uniforms.uDensity.value = 0.4;
    place(L, PX - 2.3 + i * 1.53, 0, -0.4 + (i % 2) * 0.25);
    return { L, a };
  });
  // yellow icon parts (rice/body) printed on the yellow drum: paint them into an extra layer on each card
  const sackL = place(layer({ w: 2.1, h: 2.3, ppu: 170, inks: [
    { d: "Y", p: (g) => { ic(g, "sack", "Y", 0, 0, 1.0); } },
    { d: "B", p: (g) => { ic(g, "sack", "B", 0, 0, 1.0); TX(g, "2 KG", 0, -0.2, 0.46); } },
    { d: "P", den: 0.5, p: (g) => { for (let i = 0; i < 14; i++) E(g, -0.4 + (i % 7) * 0.13, 0.86 + Math.floor(i / 7) * 0.08, 0.06, 0.035, 0.5); } },
  ] }), PX + 1.2, 0, 1.0);

  // ---------------- 1956 (x 60) ----------------
  const BX = 60;
  const report = place(layer({ w: 3.9, h: 4.5, ppu: 170, cut: (g) => g.fillRect(-1.95, -2.25, 3.9, 4.5), inks: [
    { d: "P", den: 0.7, p: (g) => { g.fillRect(-1.95, 1.55, 3.9, 0.7); ic(g, "bird", "P", 0, 0.35, 0.95); } },
    { d: "B", p: (g) => { TX(g, "LAPORAN · 1956", 0, 1.9, 0.34); ic(g, "bird", "B", 0, 0.35, 0.95); for (let k = 0; k < 4; k++) LN(g, [[-1.5, -1.2 - k * 0.22], [1.5 - (k % 2) * 0.5, -1.2 - k * 0.22]], 0.05); g.lineWidth = 0.03; g.strokeRect(-1.82, -2.12, 3.64, 4.24); } },
    { d: "Y", p: (g) => { ic(g, "bird", "Y", 0, 0.35, 0.95); } },
  ] }), BX + 1.1, 0, -2.4, -0.12);
  const verdict = layer({ w: 3.6, h: 0.7, paper: false, ppu: 220, inks: [{ d: "B", p: (g) => { TX(g, "PIPIT BUKAN HAMA", 0, 0, 0.36); LN(g, [[-1.55, -0.28], [1.55, -0.28]], 0.05); } }] });
  verdict.inner.position.y = 0; verdict.G.position.set(0, -0.62, 0.02); report.inner.add(verdict.G);
  const stamp = layer({ w: 3.4, h: 1.2, paper: false, ppu: 220, inks: [{ d: "P", p: (g) => { g.lineWidth = 0.09; g.strokeRect(-1.55, -0.45, 3.1, 0.9); TX(g, "DIABAIKAN", 0, 0, 0.56); } }] });
  stamp.inner.position.y = 0; stamp.G.position.set(0.1, -0.3, 0.05); stamp.G.rotation.z = 0.2; report.inner.add(stamp.G);
  const scholars = [0, 1, 2].map((i) => place(layer({ w: 1.5, h: 2.0, key: "sch", ppu: 160, inks: [{ d: "B", p: (g) => ic(g, "scholar", "B", 0, 0, 0.95) }, { d: "Y", p: (g) => ic(g, "scholar", "Y", 0, 0, 0.95) }] }), BX - 3.0 + i * 0.85, 0, 0.9 + (i % 2) * 0.3, 0.1));
  const bubble = layer({ w: 2.4, h: 1.3, ppu: 170, inks: [
    { d: "Y", den: 0.45, p: (g) => { E(g, 0, 0.1, 1.1, 0.5); PL(g, [[-0.3, -0.25], [-0.6, -0.62], [0.05, -0.32]]); } },
    { d: "B", p: (g) => { TX(g, "BUKAN HAMA!", 0, 0.1, 0.27); } },
  ] });
  bubble.inner.position.y = 0; place(bubble, BX - 2.1, 2.55, 1.1, 0.1);

  // ---------------- GONGS (x 90) ----------------
  const GX = 90;
  const houses = place(layer({ w: 12, h: 2.8, ppu: 80, inks: [
    { d: "B", p: (g) => { for (let i = 0; i < 7; i++) { const x = -5.4 + i * 1.8, w = 0.75 + (i % 3) * 0.12, y0 = -0.4 + (i % 2) * 0.2; PL(g, [[x - w - 0.25, y0], [x, y0 + 0.9], [x + w + 0.25, y0]]); } } },
    { d: "P", den: 0.5, p: (g) => { for (let i = 0; i < 7; i++) { const x = -5.4 + i * 1.8, w = 0.75 + (i % 3) * 0.12, y0 = -0.4 + (i % 2) * 0.2; g.fillRect(x - w, -1.4, 2 * w, y0 + 1.4); } } },
    { d: "Y", p: (g) => { for (let i = 0; i < 7; i++) { const x = -5.4 + i * 1.8; g.fillRect(x - 0.2, -0.95, 0.4, 0.4); } } },
  ] }), GX, 0, -5.4);
  const treeP = (g, x, s) => { ga(g, 0.6, () => { E(g, x, 1.1 * s, 0.8 * s, 0.75 * s); E(g, x - 0.5 * s, 0.6 * s, 0.6 * s, 0.55 * s); E(g, x + 0.5 * s, 0.65 * s, 0.6 * s, 0.55 * s); }); };
  const trees = place(layer({ w: 12, h: 3.6, ppu: 80, inks: [
    { d: "B", p: (g) => { for (let i = 0; i < 5; i++) treeP(g, -5 + i * 2.5, 1.1); } },
    { d: "Y", p: (g) => { for (let i = 0; i < 5; i++) treeP(g, -5 + i * 2.5, 1.0); } },
    { d: "P", p: (g) => { for (let i = 0; i < 5; i++) g.fillRect(-5 + i * 2.5 - 0.08, -1.8, 0.16, 1.5); } },
  ] }), GX, 0, -3.8);
  trees.inner.position.y = 1.8;
  const hq = place(layer({ w: 2.2, h: 3.1, ppu: 150, inks: [
    { d: "B", p: (g) => { LN(g, [[-0.9, -1.55], [-0.9, 1.5]], 0.07); TX(g, "MARKAS", 0.1, 1.05, 0.3); } },
    { d: "P", p: (g) => { PL(g, [[-0.86, 1.45], [1.0, 1.45], [0.8, 1.05], [1.0, 0.65], [-0.86, 0.65]]); } },
    { d: "Y", den: 0.6, p: (g) => { g.fillRect(-0.8, -1.55, 1.7, 1.3); PL(g, [[-1.0, -0.25], [0.15, 0.35], [1.1, -0.25]]); } },
  ] }), GX - 2.4, 0, -2.9, 0.15);
  const people = [0, 1, 2, 3, 4, 5].map((i) => { const kind = i % 2 ? "pan" : "person"; const L = layer({ w: 1.25, h: 1.65, key: "pp" + kind, ppu: 170, inks: [
    { d: "B", p: (g) => ic(g, kind, "B", -0.15, 0, 0.78) }, { d: "Y", p: (g) => ic(g, kind, "Y", -0.15, 0, 0.78) }, { d: "P", p: (g) => ic(g, kind, "P", -0.15, 0, 0.78) }] });
    return { L, x: GX - 3.0 + i * 1.18, z: 0.5 + (i % 3) * 0.4, ph: i * 1.3 }; });
  people.forEach((p) => place(p.L, p.x, 0, p.z, 0.05));
  const rings = people.map((p, i) => { const L = layer({ w: 1.6, h: 1.6, key: "ring", paper: false, ppu: 140, inks: [{ d: "P", p: (g) => { RING(g, 0, 0, 0.5, 0.05); RING(g, 0, 0, 0.66, 0.035); } }] }); L.inner.position.y = 0; place(L, p.x + 0.41, 1.06, p.z + 0.06); return L; });
  const gongBirds = [0, 1, 2, 3, 4, 5].map((i) => { const L = mkBird(0.75); L.inner.position.y = 0; place(L, GX, 4, -1); return { L, ph: i / 6 * TAU, rad: 2.6 + (i % 3) * 0.5, h: 3.9 + (i % 2) * 0.7, z: -1.2 + (i % 3) * 0.6 }; });
  const nestTree = place(layer({ w: 2.6, h: 4.2, ppu: 130, inks: [
    { d: "P", p: (g) => { g.fillRect(-0.12, -2.1, 0.24, 3.2); LN(g, [[0, 0.6], [0.8, 1.15]], 0.1); } },
    { d: "B", p: (g) => { treeP(g, 0, 1.25); g.translate(0, 0.1); } },
    { d: "Y", p: (g) => { for (let k = 0; k < 9; k++) QC(g, [0.3, 1.25 + k * 0.03], [0.62, 1.05 + (k % 3) * 0.05], [0.98, 1.27 + k * 0.025], 0.04); } },
  ] }), GX + 3.2, 0, -0.6, -0.1);
  nestTree.inner.position.y = 2.1;
  const eggs = [0, 1, 2].map((i) => { const L = layer({ w: 0.6, h: 0.72, key: "egg", ppu: 300, inks: [{ d: "B", den: 0.35, p: (g) => E(g, 0, 0, 0.23, 0.3) }, { d: "P", p: (g) => { g.lineWidth = 0.035; g.beginPath(); g.ellipse(0, 0, 0.23, 0.3, 0, 0, TAU); g.stroke(); } }, { d: "Y", den: 0.5, p: (g) => E(g, -0.06, 0.08, 0.1, 0.13) }] }); L.inner.position.y = 0; place(L, GX + 3.2 + 0.5 + i * 0.16, 3.6, -0.5 + i * 0.05); return L; });
  const crack = eggs.map((e, i) => { const L = layer({ w: 0.8, h: 0.5, key: "crk", ppu: 300, inks: [{ d: "B", den: 0.4, p: (g) => { PL(g, [[-0.33, -0.17], [0.33, -0.17], [0.25, 0.03], [0.13, -0.05], [0.03, 0.1], [-0.08, -0.03], [-0.2, 0.08]]); } }, { d: "Y", p: (g) => E(g, 0.08, -0.2, 0.24, 0.05) }, { d: "P", p: (g) => { LN(g, [[-0.33, -0.17], [-0.2, 0.08], [-0.08, -0.03], [0.03, 0.1], [0.13, -0.05], [0.25, 0.03]], 0.03); } }] }); L.inner.position.y = 0.0; place(L, GX + 2.6 + i * 0.7, 0.02, 1.3 + i * 0.25); L.G.rotation.x = -0.9; return L; });

  // ---------------- COUNT (x 120) ----------------
  const CX = 120;
  const COLS = 13, ROWS = 11;
  const tally = place(layer({ w: 6.0, h: 4.9, ppu: 190, cut: (g) => g.fillRect(-3, -2.45, 6, 4.9), inks: [
    { d: "P", p: (g) => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) ic(g, "bird", "P", -2.65 + c * 0.44, 2.05 - r * 0.42, 0.17); } },
    { d: "B", p: (g) => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) ic(g, "bird", "B", -2.65 + c * 0.44, 2.05 - r * 0.42, 0.17); g.lineWidth = 0.03; g.strokeRect(-2.9, -2.35, 5.8, 4.7); } },
    { d: "Y", den: 0.3, p: (g) => g.fillRect(-3, -2.45, 6, 4.9) },
  ] }), CX, 0, -2.6);
  const drum = new THREE.Group();
  { const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 6.6, 40), new THREE.MeshStandardMaterial({ color: 0xff5ab8, roughness: 0.35, metalness: 0.1, envMapIntensity: 0.6 }));
    body.rotation.z = Math.PI / 2; body.castShadow = true; drum.add(body);
    const capM = new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 0.9, roughness: 0.25, envMapIntensity: 1 });
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.14, 32), capM); c.rotation.z = Math.PI / 2; c.position.x = s * 3.35; drum.add(c); } }
  drum.position.set(CX, 4.9, -2.15); scene.add(drum);
  const emptySky = place(layer({ w: 6, h: 1.0, paper: false, ppu: 150, inks: [{ d: "B", p: (g) => { TX(g, "LANGIT SEPI", 0, 0, 0.42, SM); } }] }), CX, 5.2, -2.5);
  emptySky.inner.position.y = 0;

  // ---------------- FIELD (x 150) ----------------
  const LX = 150;
  const paddies = [[-5.2, 2.6, 0.38], [-3.6, 2.3, 0.5], [-2.0, 2.0, 0.62], [-0.3, 1.7, 0.78]].map(([z, h, s], i) => {
    const n = Math.round(12 / (s * 0.42));
    const L = layer({ w: 13, h, ppu: 90, inks: [
      { d: "Y", p: (g) => { for (let k = 0; k < n; k++) ic(g, "rice", "Y", -6.4 + k * s * 0.42, -h / 2 + s, s, k % 2 ? 1 : -1); g.fillRect(-6.5, -h / 2, 13, 0.25); } },
      { d: "B", den: 0.75, p: (g) => { for (let k = 0; k < n; k++) ic(g, "rice", "B", -6.4 + k * s * 0.42, -h / 2 + s, s, k % 2 ? 1 : -1); } },
      { d: "P", den: 0.6, p: (g) => { for (let k = 0; k < n; k++) { ic(g, "rice", "B", -6.4 + k * s * 0.42, -h / 2 + s * 0.8, s * 0.8, k % 2 ? 1 : -1); } } },
    ] });
    place(L, LX, 0, z); return L;
  });
  const sparrowEat = mkBird(1.2); sparrowEat.inner.position.y = 0; place(sparrowEat, LX - 2.2, 2.7, 1.0);
  const bugL = layer({ w: 1.0, h: 0.6, ppu: 220, inks: [{ d: "Y", p: (g) => ic(g, "locust", "Y", 0, 0, 0.3) }, { d: "B", p: (g) => ic(g, "locust", "B", 0, 0, 0.3) }] });
  bugL.inner.position.y = 0; place(bugL, LX - 1.0, 2.95, 1.1);
  const fieldSwarm = [mkSwarm(21, 40, 11, 3.0, 0.3, "fs1"), mkSwarm(22, 30, 11, 3.0, 0.4, "fs2"), mkSwarm(23, 16, 11, 2.6, 0.55, "fs3")];
  fieldSwarm.forEach((L, i) => { L.inner.position.y = 0; place(L, LX, 3, [-3.0, -1.2, 0.6][i]); });
  const bigLoc = layer({ w: 4.0, h: 2.1, inks: [{ d: "Y", p: (g) => ic(g, "locust", "Y", 0, 0, 1.75) }, { d: "B", p: (g) => ic(g, "locust", "B", 0, 0, 1.75) }] });
  bigLoc.inner.position.y = 0; place(bigLoc, LX + 1.2, 1.9, 1.7, -0.1);

  // ---------------- 1960 (x 180) ----------------
  const MX = 180;
  const listRows = [["rat", "TIKUS"], ["fly", "LALAT"], ["mosquito", "NYAMUK"], ["bird", "PIPIT"]];
  const listL = place(layer({ w: 3.8, h: 4.6, ppu: 170, cut: (g) => g.fillRect(-1.9, -2.3, 3.8, 4.6), inks: [
    { d: "P", den: 0.7, p: (g) => { g.fillRect(-1.9, 1.55, 3.8, 0.75); listRows.forEach(([n], k) => ic(g, n, "P", -1.25, 0.95 - k * 0.72, 0.25)); } },
    { d: "B", p: (g) => { TX(g, "DAFTAR HAMA", 0, 1.92, 0.34); listRows.forEach(([n, lab], k) => { ic(g, n, "B", -1.25, 0.95 - k * 0.72, 0.25); TX(g, lab, -0.8, 0.95 - k * 0.72, 0.32, AB, "left"); }); g.lineWidth = 0.03; g.strokeRect(-1.78, -2.18, 3.56, 4.36); } },
    { d: "Y", den: 0.3, p: (g) => g.fillRect(-1.9, -2.3, 3.8, 4.6) },
  ] }), MX + 0.7, 0.45, -2.0, -0.08);
  const strike = layer({ w: 3.6, h: 0.5, paper: false, ppu: 220, inks: [{ d: "P", p: (g) => { LN(g, [[-1.6, 0.02], [1.45, -0.04]], 0.13); } }] });
  strike.inner.position.y = 0; strike.G.position.set(0.1, 0.95 - 3 * 0.72, 0.03); listL.inner.add(strike.G);
  const newRow = layer({ w: 3.6, h: 0.6, paper: false, ppu: 220, inks: [{ d: "P", p: (g) => ic(g, "bug", "P", -1.35, 0, 0.22) }, { d: "B", p: (g) => { ic(g, "bug", "B", -1.35, 0, 0.22); TX(g, "KUTU BUSUK", -0.98, 0, 0.32, AB, "left"); } }] });
  newRow.inner.position.y = 0; newRow.G.position.set(0, 0.95 - 4 * 0.72, 0.03); listL.inner.add(newRow.G);
  const book = place(layer({ w: 2.6, h: 1.8, ppu: 170, cut: (g) => { PL(g, [[-1.3, -0.8], [0, -0.9], [1.3, -0.8], [1.3, 0.9], [0, 0.8], [-1.3, 0.9]]); }, inks: [
    { d: "B", p: (g) => { LN(g, [[0, -0.88], [0, 0.78]], 0.03); ic(g, "bird", "B", -0.62, 0.05, 0.42); ic(g, "locust", "B", 0.65, 0.25, 0.3); ic(g, "fly", "B", 0.6, -0.35, 0.18); LN(g, [[-0.15, 0.1], [0.2, 0.1]], 0.04); PL(g, [[0.2, 0.17], [0.32, 0.1], [0.2, 0.03]]); TX(g, "BURUNG & SERANGGA", 0, -0.7, 0.11, SM); } },
    { d: "P", p: (g) => { ic(g, "bird", "P", -0.62, 0.05, 0.42); ic(g, "fly", "P", 0.6, -0.35, 0.18); } },
    { d: "Y", p: (g) => { ic(g, "bird", "Y", -0.62, 0.05, 0.42); ic(g, "locust", "Y", 0.65, 0.25, 0.3); } },
  ] }), MX - 2.15, 0.0, 1.0, 0.3);
  book.G.position.y = 0.0;

  // ---------------- CAUSES (x 205) ----------------
  const DX = 205;
  const dry = place(layer({ w: 13, h: 2.0, ppu: 80, inks: [
    { d: "Y", p: (g) => g.fillRect(-6.5, -1, 13, 2) },
    { d: "P", den: 0.55, p: (g) => g.fillRect(-6.5, -1, 13, 2) },
    { d: "B", p: (g) => { const q = mulberry(9); for (let i = 0; i < 40; i++) { let x = -6.4 + q() * 12.8, y = -0.9 + q() * 1.6; const P = [[x, y]]; for (let k = 0; k < 4; k++) { x += (q() - 0.5) * 0.7; y += (q() - 0.5) * 0.5; P.push([x, y]); } LN(g, P, 0.035); } } },
  ] }), DX, 0, -5.2);
  const causeDef = [["sun", "KEKERINGAN", "s7:kekeringan"], ["flood", "BANJIR", "s7:banjir"], ["doc", "KEBIJAKAN", "s7:kebijakan"], ["bird", "KAMPANYE", "s7:kampanye"]];
  const causes = causeDef.map(([n, lab, a], i) => {
    const L = layer({ w: 1.62, h: 2.1, ppu: 200, cut: (g) => g.fillRect(-0.81, -1.05, 1.62, 2.1), inks: [
      { d: "Y", p: (g) => { ic(g, n, "Y", 0, 0.22, 0.6); } },
      { d: "P", p: (g) => { ic(g, n, "P", 0, 0.22, 0.6); } },
      { d: "B", p: (g) => { ic(g, n, "B", 0, 0.22, 0.6); TX(g, lab, 0, -0.75, 0.2); g.lineWidth = 0.03; g.strokeRect(-0.74, -0.98, 1.48, 1.96); if (n === "bird") { LN(g, [[-0.5, -0.3], [0.5, 0.75]], 0.06); } } },
    ] });
    place(L, DX - 2.4 + i * 1.6, 0.42, -0.9 + (i % 2) * 0.3, (1.5 - i) * 0.06);
    return { L, a };
  });
  const bowl0 = layer({ w: 4.4, h: 3.4, ppu: 120, inks: [{ d: "P", p: (g) => { ic(g, "bowl0", "P", 0, 0.1, 2.0); } }, { d: "B", p: (g) => { ic(g, "bowl0", "B", 0, 0.1, 2.0); TX(g, "1959–1961", 0, -1.45, 0.3, SM); } }, { d: "Y", den: 0.35, p: (g) => E(g, 0, 0.1, 2.05, 1.65) }] });
  place(bowl0, DX, 0.25, 0.2);

  // ---------------- RING (x 235) ----------------
  const FX = 235;
  const web = place(layer({ w: 5.6, h: 5.6, ppu: 160, cut: (g) => E(g, 0, 0, 2.8, 2.8), inks: [ // scaled below
    { d: "Y", p: (g) => { ga(g, 0.3, () => E(g, 0, 0, 2.8, 2.8)); ic(g, "bird", "Y", 0, 1.65, 0.55); ic(g, "locust", "Y", 1.65, 0, 0.5); ic(g, "rice", "Y", 0, -1.6, 0.55); ic(g, "sun", "Y", -1.65, 0.05, 0.45); } },
    { d: "B", p: (g) => { RING(g, 0, 0, 1.12, 0.05); ic(g, "bird", "B", 0, 1.65, 0.55); ic(g, "locust", "B", 1.65, 0, 0.5); ic(g, "rice", "B", 0, -1.6, 0.55);
      for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; g.save(); g.translate(Math.cos(a) * 1.12, Math.sin(a) * 1.12); g.rotate(a - Math.PI / 2 - Math.PI); PL(g, [[-0.15, 0.1], [0.15, 0], [-0.15, -0.1]]); g.restore(); }
      TX(g, "SETIAP MAKHLUK", 0, 0.18, 0.2); TX(g, "MATA RANTAI", 0, -0.12, 0.2); TX(g, "AUDIRA PRESS", 0, -0.5, 0.15, SM); TX(g, "EDISI 33", 0, -0.7, 0.11, SM); } },
    { d: "P", p: (g) => { ic(g, "bird", "P", 0, 1.65, 0.55); ic(g, "sun", "P", -1.65, 0.05, 0.45); RING(g, 0, 0, 2.65, 0.04); } },
  ] }), FX, 0, -3.0);
  web.G.scale.setScalar(0.82);
  const frontRice = place(layer({ w: 10, h: 1.6, ppu: 100, inks: [
    { d: "B", p: (g) => { for (let i = 0; i < 30; i++) ic(g, "rice", "B", -4.8 + i * 0.33, 0.02, 0.74, i % 2 ? 1 : -1); } },
    { d: "Y", p: (g) => { for (let i = 0; i < 30; i++) ic(g, "rice", "Y", -4.8 + i * 0.33, 0.02, 0.74, i % 2 ? 1 : -1); } },
  ] }), FX, 0, 1.2);
  const perch = mkBird(1.1); perch.inner.position.y = 0; place(perch, FX - 1.6, 2.55, 1.35);
  const smallLoc = layer({ w: 1.2, h: 0.7, ppu: 200, inks: [{ d: "Y", p: (g) => ic(g, "locust", "Y", 0, 0, 0.42) }, { d: "B", p: (g) => ic(g, "locust", "B", 0, 0, 0.42) }] });
  smallLoc.inner.position.y = 0; place(smallLoc, FX + 2.0, 1.25, 1.45);
  const flock = [0, 1, 2, 3, 4, 5].map((i) => { const L = mkBird(0.7); L.inner.position.y = 0; place(L, FX, 5, -1); return { L, i }; });

  // ---------------- chain (rides with the camera, band above captions) ----------------
  const CD = 8, PXU = 1920 / (2 * CD * Math.tan(19 * Math.PI / 180));
  const chainG = new THREE.Group(); chainG.position.set(0, -(1262 - 960) / PXU, -CD); cam.add(chainG);
  const TW = 146 / PXU, THh = 176 / PXU, GAP = 18 / PXU;
  function tokenTex(icon, label) {
    const c = document.createElement("canvas"); c.width = 280; c.height = 336; const g = c.getContext("2d");
    g.fillStyle = PAPER; g.beginPath(); g.roundRect(4, 4, 272, 328, 26); g.fill();
    const q = mulberry(label.length * 7); for (let i = 0; i < 900; i++) { g.fillStyle = q() > 0.5 ? "rgba(255,255,255,.4)" : "rgba(150,128,98,.12)"; g.fillRect(q() * 280, q() * 336, 1.5, 1.5); }
    g.globalCompositeOperation = "multiply";
    const off = { P: [3, -2], B: [-2, 2], Y: [1, 3] };
    for (const d of ["Y", "P", "B"]) { if (!ICON[icon][d]) continue; g.save(); g.setTransform(78, 0, 0, -78, 140 + off[d][0], 132 + off[d][1]); g.fillStyle = g.strokeStyle = INK[d]; g._on = INK[d]; g._off = PAPER; ICON[icon][d](g); g.restore(); }
    g.fillStyle = INK.B; g.font = `400 ${label.length > 7 ? 33 : 40}px ${AB}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, 140, 284);
    g.globalCompositeOperation = "source-over"; g.strokeStyle = "rgba(29,26,42,.55)"; g.lineWidth = 4; g.setLineDash([10, 7]); g.beginPath(); g.roundRect(6, 6, 268, 324, 24); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const xTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); g.strokeStyle = INK.P; g.lineWidth = 30; g.lineCap = "round"; g.globalAlpha = 0.92; g.beginPath(); g.moveTo(50, 50); g.lineTo(206, 206); g.moveTo(206, 50); g.lineTo(50, 206); g.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const linkM = new THREE.MeshBasicMaterial({ color: new THREE.Color(INK.B).multiplyScalar(1.0) });
  function mkToken(icon, label) {
    const G = new THREE.Group(); chainG.add(G);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(TW, THh), new THREE.MeshBasicMaterial({ map: tokenTex(icon, label), transparent: true, alphaTest: 0.1 }));
    G.add(m);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(TW, THh), new THREE.MeshBasicMaterial({ color: new THREE.Color(INK.B), transparent: true, opacity: 0.75 }));
    sh.position.set(0.012, -0.012, -0.002); G.add(sh);
    const x = new THREE.Mesh(new THREE.PlaneGeometry(TW * 0.8, TW * 0.8), new THREE.MeshBasicMaterial({ map: xTex, transparent: true, depthWrite: false }));
    x.position.set(0, 0.03, 0.003); G.add(x);
    const link = new THREE.Mesh(new THREE.TorusGeometry(GAP * 0.62, GAP * 0.16, 8, 24), linkM); link.scale.set(1.5, 0.75, 1); link.position.set(-(TW + GAP) / 2, 0, 0.004); G.add(link);
    G.visible = false;
    return { G, x, link };
  }
  const chainSets = [
    { from: 0, to: K.s2 - 0.25, items: [["bird", "PIPIT", A("s1:pipit"), A("s1:menang"), 1e9], ["locust", "BELALANG", A("s1:belalang"), 1e9, 1e9]] },
    { from: K.s6 - 0.4, to: K.outro, items: [["bird", "PIPIT", A("s6:pipit"), A("s6:Tanpa"), A("s8:makhluk")], ["fly", "SERANGGA", A("s6:serangga"), 1e9, 1e9], ["locust", "BELALANG", A("s6:belalang"), 1e9, 1e9],
      ["rice", "SAWAH", A("s6:sawah"), 1e9, 1e9], ["bowl", "PANEN", A("s7:kerusakan"), 1e9, 1e9], ["bowl0", "KELAPARAN", A("s7:Kelaparan"), 1e9, 1e9]] },
  ];
  chainSets.forEach((s) => { s.tok = s.items.map(([ic2, lab, a, xa, xb]) => ({ ...mkToken(ic2, lab), a, xa, xb })); });
  const tRantai = A("s8:rantai");

  // ---------------- lights ----------------
  const hemi = new THREE.HemisphereLight(0xfff8ec, 0xe2d4b6, 1.8); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2dc, 0.9); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -11; key.shadow.camera.right = 11; key.shadow.camera.top = 11; key.shadow.camera.bottom = -6;
  key.shadow.camera.near = 1; key.shadow.camera.far = 60; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key); scene.add(key.target);

  // ---------------- camera ----------------
  const seg = (t0, t1, X, zA, zB, extra = []) => [[t0 + 0.5, X - 0.45, 2.75, zA, X - 0.25, 1.85, -2], ...extra, [t1 - 0.5, X + 0.45, 2.6, zB, X + 0.25, 1.85, -2]];
  const KEYS = [
    [0, HX - 0.2, 2.7, 15.6, HX - 0.1, 2.3, -2], [A("s1:belalang") + 0.4, HX + 0.25, 2.6, 14.2, HX + 0.1, 2.25, -2], [K.s2 - 0.5, HX + 0.35, 2.6, 14.0, HX + 0.15, 2.2, -2],
    ...seg(K.s2, K.s3, PX, 17.4, 16.6, [[A("s2:Pipit") - 0.2, PX + 0.4, 2.6, 16.4, PX + 0.4, 1.8, -2], [A("s2:Pipit") + 0.8, PX + 1.5, 2.4, 14.6, PX + 1.5, 1.7, -2]]).map((k, i, a) => i === a.length - 1 ? [k[0], PX + 1.7, 2.4, 14.4, PX + 1.6, 1.7, -2] : k),
    ...seg(K.s3, K.s4, BX - 0.5, 17.4, 16.2),
    ...seg(K.s4, K.s5, GX, 17.6, 16.6, [[A("s4:Sarang") - 0.3, GX + 0.6, 2.7, 16.6, GX + 0.6, 1.9, -2], [A("s4:Sarang") + 0.7, GX + 3.0, 3.0, 12.6, GX + 3.0, 2.2, -1.5]]).map((k, i, a) => i === a.length - 1 ? [k[0], GX + 3.1, 2.7, 12.2, GX + 3.0, 1.9, -1.5] : k),
    ...seg(K.s5, K.s6, CX, 16.8, 15.4),
    ...seg(K.s6, K.s7, LX, 17.4, 16.0),
    ...seg(K.s7, A("s7:Tapi"), MX - 0.75, 17.6, 16.8),
    ...seg(A("s7:Tapi"), K.s8, DX, 18.6, 17.6),
    [K.s8 + 0.5, FX - 0.3, 2.8, 15.0, FX - 0.2, 2.0, -2], [K.outro, FX + 0.2, 3.0, 17.6, FX + 0.1, 2.1, -2],
  ];
  const camT = track(KEYS);
  const tgt = new THREE.Vector3();

  const on = (t, a, d = 0.3) => smooth((t - a) / d);
  const pump = (t, a, up = 0.08, down = 0.8) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.max(0, 1 - (t - a - up) / down));
  const flap = (L, t, ph, s = 1) => { L.inner.scale.y = s * (0.86 + 0.14 * Math.cos(t * 9 + ph)); L.inner.scale.x = s; };
  const jit = (d, k) => { const q = mulberry(k * 7 + d * 131 + 3); return [(q() - 0.5) * 2, (q() - 0.5) * 2]; };
  const BASE = [[0.028, -0.018], [-0.022, 0.014], [0.01, 0.026]];

  return function draw(t) {
    // camera
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); tgt.set(c[3], c[4], c[5]); cam.lookAt(tgt); cam.updateMatrixWorld();
    key.position.set(c[3] - 7, 15, 12); key.target.position.set(c[3], 1.5, -2); key.target.updateMatrixWorld();

    // misregistration: per-drum seeded offset re-rolled at 10 fps, tightens on the payoff
    const reg = 1 - 0.75 * on(t, tRantai, 1.2);
    const fk = Math.floor(t * 10);
    const J = [0, 1, 2].map((d) => jit(d, fk));
    for (const o of inks) { const b = BASE[o.d], j = J[o.d]; o.m.position.x = (b[0] + j[0] * 0.012) * reg * o.amp; o.m.position.y = (b[1] + j[1] * 0.012) * reg * o.amp; }

    // ---- HOOK ----
    const tPer = A("s1:perang"), tMen = A("s1:menang"), tBel = A("s1:belalang"), tKal = A("s1:kalah");
    hookBirds.forEach((b, i) => {
      const drop = smooth((t - tMen - i * 0.06) / 0.9);
      const x = HX + b.p[0] + 0.25 * Math.sin(t * 0.8 + b.ph) + drop * b.f * 0.8;
      const y = b.p[1] + 0.18 * Math.sin(t * 1.7 + b.ph) - drop * 3.5;
      b.L.G.position.set(x, y, b.p[2]); b.L.G.visible = drop < 0.98 && t < K.s2;
      b.L.G.rotation.z = -0.6 * drop * b.f; b.L.G.rotation.y = b.f > 0 ? 0 : Math.PI;
      flap(b.L, t, b.ph, 1 - 0.5 * drop);
    });
    { const drop = smooth((t - tMen - 0.15) / 1.0);
      heroBird.G.position.set(HX - 0.2 + 0.08 * Math.sin(t * 1.1), 2.15 + 0.1 * Math.sin(t * 1.6) - drop * 2.6, 0.6); heroBird.G.rotation.z = -0.5 * drop;
      flap(heroBird, t, 0, 1 - 0.3 * drop); heroBird.G.visible = drop < 0.99 && t < K.s2;
      const u = clamp01((t - tPer) / 0.22); target.G.visible = u > 0 && drop < 0.95 && t < K.s2;
      const s = 1.6 - 0.6 * eout(u); target.inner.scale.set(s, s, 1); target.G.position.y = heroBird.G.position.y; target.G.rotation.z = 0.25 * (1 - eout(u)) + t * 0.05;
      setOp(target, (1 - drop) * eout(u)); }
    const tSw = Math.min(tBel - 0.25, 1.5);
    hookSwarm.forEach((L, i) => {
      const u = eout(clamp01((t - tSw - i * 0.18) / 1.0));
      L.G.visible = u > 0 && t < K.s2 + 0.2;
      L.G.position.x = HX + 11 * (1 - u) + 0.15 * Math.sin(t * 3 + i);
      L.G.position.y = [5.0, 3.9, 2.6][i] + 0.08 * Math.sin(t * 5 + i * 2);
    });
    { const u = back(clamp01((t - Math.min(tBel, 1.9)) / 0.5), 1.3); heroLoc.G.visible = u > 0 && t < K.s2 + 0.2; heroLoc.G.scale.setScalar(Math.max(0.001, u) * (1 + 0.12 * pump(t, tBel, 0.1, 0.6))); heroLoc.G.position.y = 1.7 + 0.06 * Math.sin(t * 6); heroLoc.G.rotation.z = 0.1 * Math.sin(t * 2.2); }
    sunL.G.visible = fieldL.G.visible = grassL.G.visible = t < K.s2 + 1;
    // field darkens toward rust as locusts arrive
    setOp(fieldL, 1 - 0.4 * on(t, tBel, 0.8), [1]);

    // ---- PESTS ----
    pop(mapL, t, K.s2 - 0.55, 0.7);
    pestCards.forEach((p, i) => { pop(p.L, t, A(p.a) - 0.2); if (i < 3) fold(p.L, t, A("s2:Pipit") + i * 0.08, 0.5); });
    { const u = pop(sackL, t, A("s2:dua") - 0.25, 0.6); sackL.G.scale.setScalar(0.85 + 0.15 * pump(t, A("s2:gabah"), 0.08, 0.5)); }
    if (t > K.s3 + 1) { mapL.G.visible = false; pestCards.forEach((p) => (p.L.G.visible = false)); sackL.G.visible = false; }

    // ---- 1956 ----
    pop(report, t, K.s3 - 0.5, 0.7);
    verdict.ms[0].material.uniforms.uRevX.value = clamp01((t - A("s3:bukan") + 0.2) / 0.6);
    { const u = clamp01((t - A("s3:tidak")) / 0.2); stamp.G.visible = u > 0; const s = 1.7 - 0.7 * eout(u); stamp.inner.scale.set(s, s, 1); setOp(stamp, u); }
    scholars.forEach((L, i) => pop(L, t, A("s3:ahli") - 0.2 + i * 0.12));
    { const u = back(clamp01((t - A("s3:Pipit") + 0.1) / 0.4), 1.5), d = smooth((t - A("s3:suara")) / 1.2);
      bubble.G.visible = u > 0 && d < 0.99; const s = Math.max(0.001, u * (1 - 0.85 * d)); bubble.G.scale.setScalar(s); setOp(bubble, 1 - 0.7 * d); }
    if (t > K.s4 + 1 || t < K.s3 - 1.5) { report.G.visible = false; scholars.forEach((L) => (L.G.visible = false)); bubble.G.visible = false; }

    // ---- GONGS ----
    const gOn = t > K.s4 - 1.5 && t < K.s5 + 1;
    houses.G.visible = trees.G.visible = gOn; nestTree.G.visible = gOn;
    pop(hq, t, A("s4:markas") - 0.2); if (!gOn) hq.G.visible = false;
    const tBeat = A("s4:memukul");
    people.forEach((p, i) => {
      pop(p.L, t, A("s4:Warga") - 0.15 + i * 0.07, 0.5); if (!gOn) p.L.G.visible = false;
      const beat = t > tBeat ? Math.abs(Math.sin((t - tBeat) * 5.2 + p.ph)) : 0;
      p.L.G.position.y = 0.06 * beat; p.L.G.rotation.z = 0.04 * Math.sin((t - tBeat) * 5.2 + p.ph) * (t > tBeat ? 1 : 0);
      const L = rings[i]; const cyc = ((t - tBeat + p.ph * 0.3) % 1.1) / 1.1;
      L.G.visible = gOn && t > tBeat; L.inner.scale.setScalar(0.4 + 1.6 * cyc); setOp(L, (1 - cyc) * 0.9);
    });
    const tJat = A("s4:jatuh");
    gongBirds.forEach((b, i) => {
      const a = t * 1.35 + b.ph, fall = i % 2 === 0 ? smooth((t - tJat - i * 0.1) / 1.4) : 0;
      const x = GX + Math.cos(a) * b.rad * (1 - 0.3 * fall), y = b.h + 0.25 * Math.sin(a * 2) - fall * 2.6, z = b.z - fall * 3.2;
      b.L.G.position.set(x, y, z); b.L.G.rotation.y = Math.sin(a) > 0 ? Math.PI : 0; b.L.G.rotation.z = (Math.sin(a) > 0 ? 1 : -1) * 0.5 * fall;
      b.L.G.visible = gOn && t > A("s4:Warga") - 0.5 && fall < 0.97; flap(b.L, t, b.ph * 3, 0.95 - 0.3 * fall);
    });
    { const tS = A("s4:Sarang"), tD = A("s4:dipecahkan");
      nestTree.inner.rotation.z = -0.06 * pump(t, tS, 0.1, 0.6);
      eggs.forEach((L, i) => { const f = clamp01((t - A("s4:telurnya") - i * 0.12) / 0.55); const y = 3.35 - (3.35 - 0.2) * f * f;
        L.G.position.set(GX + 3.75 + i * 0.26 - f * (1.1 - i * 0.7), y, -0.4 + i * 0.05 + f * (1.7 + i * 0.25)); L.G.rotation.z = f * 2.5; L.G.visible = gOn && f < 0.98; });
      crack.forEach((L, i) => { L.G.visible = gOn && t > A("s4:telurnya") + 0.55 + i * 0.12; setOp(L, on(t, tD - 0.3 + i * 0.1, 0.25)); }); }

    // ---- COUNT ----
    const cOn = t > K.s5 - 1.5 && t < K.s6 + 1;
    pop(tally, t, K.s5 - 0.5, 0.7); if (!cOn) tally.G.visible = false;
    const rv = clamp01((t - A("s5:sedikitnya") + 0.2) / (A("s5:juta") - A("s5:sedikitnya") + 0.35));
    tally.ms.slice(0, 2).forEach((m) => (m.material.uniforms.uRevY.value = 0.07 + rv * 0.93));
    drum.visible = cOn; drum.position.y = 4.95 - rv * 4.6; drum.children[0].rotation.y = t * 4;
    drum.position.z = -2.15 + 0.03 * Math.sin(t * 20) * (rv > 0 && rv < 1 ? 1 : 0);
    emptySky.G.visible = cOn && t > A("s5:saja") - 0.3; setOp(emptySky, on(t, A("s5:saja") - 0.3, 0.5));

    // ---- FIELD ----
    const lOn = t > K.s6 - 1.5 && t < K.s7 + 1;
    const tMy = A("s6:menyerbu"), tBl = A("s6:belalang");
    paddies.forEach((L, i) => { L.G.visible = lOn; const dmg = on(t, tMy + i * 0.15, 1.2); setOp(L, 1 - 0.55 * dmg, [1]); setOp(L, dmg, [2]); });
    { const gone = smooth((t - A("s6:Tanpa") - 0.1) / 0.6);
      sparrowEat.G.visible = lOn && gone < 0.98; sparrowEat.G.position.set(LX - 2.2, 2.7 + 0.08 * Math.sin(t * 1.6) + 2.5 * gone, 1.0 - gone); flap(sparrowEat, t, 1, 1 - 0.4 * gone); sparrowEat.G.rotation.y = 0;
      bugL.G.visible = lOn && t > A("s6:serangga") - 0.3 && gone < 0.5; bugL.G.scale.setScalar(1 + 0.4 * pump(t, A("s6:serangga"), 0.08, 0.6)); bugL.G.position.y = 2.95 + 0.04 * Math.sin(t * 7); }
    fieldSwarm.forEach((L, i) => { const u = eout(clamp01((t - tBl + 0.1 - i * 0.25) / 1.4)); const low = on(t, tMy, 1.2);
      L.G.visible = lOn && u > 0; L.G.position.x = LX + 12 * (1 - u) + 0.2 * Math.sin(t * 2.6 + i); L.G.position.y = [3.9, 3.3, 2.7][i] - low * [1.0, 1.2, 1.0][i] + 0.07 * Math.sin(t * 6 + i); });
    { const u = back(clamp01((t - A("s6:berkembang")) / 0.5), 1.3); bigLoc.G.visible = lOn && u > 0; bigLoc.G.scale.setScalar(Math.max(0.001, u)); bigLoc.G.position.y = 1.9 + 0.06 * Math.sin(t * 5); }

    // ---- 1960 ----
    const mOn = t > K.s7 - 1.5 && t < A("s7:Tapi") + 1;
    pop(listL, t, K.s7 - 0.5, 0.7); if (!mOn) listL.G.visible = false;
    strike.ms[0].material.uniforms.uRevX.value = clamp01((t - A("s7:dicoret") + 0.1) / 0.45);
    newRow.ms.forEach((m) => (m.material.uniforms.uRevX.value = clamp01((t - A("s7:kutu") + 0.15) / 0.6)));
    pop(book, t, A("s7:Tso-hsin") - 0.3, 0.6); if (!mOn) book.G.visible = false;

    // ---- CAUSES ----
    const dOn = t > A("s7:Tapi") - 1.5 && t < K.s8 + 1;
    dry.G.visible = dOn;
    causes.forEach((p, i) => { pop(p.L, t, A(p.a) - 0.2, 0.5); fold(p.L, t, A("s7:Kelaparan") - 0.35 + i * 0.06, 0.45); if (!dOn) p.L.G.visible = false; });
    pop(bowl0, t, A("s7:Kelaparan") - 0.25, 0.7); if (!dOn) bowl0.G.visible = false;
    setOp(dry, 0.6 + 0.4 * on(t, A("s7:kekeringan"), 0.6), [1]);

    // ---- RING ----
    const fOn = t > K.s8 - 1.5;
    pop(web, t, K.s8 - 0.4, 0.8); if (!fOn) web.G.visible = false;
    web.G.rotation.y = 0.08 * Math.sin(t * 0.4);
    frontRice.G.visible = fOn;
    perch.G.visible = fOn && t > A("s8:alam") - 0.2; flap(perch, t, 0.5, back(clamp01((t - A("s8:alam") + 0.2) / 0.5), 1.4) || 0.001);
    perch.G.position.y = 1.85 + 0.05 * Math.sin(t * 1.2);
    smallLoc.G.visible = fOn && t > A("s8:musuh") - 0.2; smallLoc.G.position.y = 0.95 + 0.03 * Math.sin(t * 4);
    flock.forEach((b) => { const u = eout(clamp01((t - A("s8:Setiap") - b.i * 0.12) / 1.6)); b.L.G.visible = fOn && u > 0;
      b.L.G.position.set(FX - 9.5 + u * (6.4 + b.i * 1.3), 3.9 + [0, 0.9, 0.35, 1.1, 0.2, 0.75][b.i] + 0.15 * Math.sin(t * 1.5 + b.i), -1.6 - (b.i % 2) * 0.9); flap(b.L, t, b.i, 1); });

    // ---- chain ----
    for (const s of chainSets) {
      const live = t >= s.from && t < s.to;
      const vis = s.tok.map((k) => live && t >= k.a - 0.1);
      const n = vis.filter(Boolean).length;
      // layout eases from n-1 to n slots
      const lastA = n ? s.tok[n - 1].a : 0, ease = smooth((t - lastA + 0.1) / 0.45);
      const slot = (i, m) => (i - (m - 1) / 2) * (TW + GAP);
      const fade = smooth((s.to - t) / 0.3);
      s.tok.forEach((k, i) => {
        k.G.visible = vis[i];
        if (!vis[i]) return;
        const x = i < n - 1 ? slot(i, n - 1) + (slot(i, n) - slot(i, n - 1)) * ease : slot(i, n);
        const u = back(clamp01((t - k.a + 0.1) / 0.4), 1.6);
        const pulse = s.from > 0 ? pump(t, tRantai + i * 0.12, 0.1, 0.6) : 0;
        k.G.position.set(x, 0.02 * pulse * 4 + (1 - Math.min(1, u)) * -0.25, 0);
        k.G.scale.setScalar(Math.max(0.001, u * fade) * (1 + 0.12 * pulse));
        k.G.rotation.y = (1 - Math.min(1, u)) * 1.2; k.G.rotation.z = 0.03 * Math.sin(t * 1.3 + i * 1.7);
        const xs = t >= k.xa && t < k.xb ? back(clamp01((t - k.xa) / 0.25), 1.8) : 0;
        k.x.visible = xs > 0.01; k.x.scale.setScalar(Math.max(0.001, xs));
        k.link.visible = i > 0;
      });
    }
    comp.render();
  };
}
