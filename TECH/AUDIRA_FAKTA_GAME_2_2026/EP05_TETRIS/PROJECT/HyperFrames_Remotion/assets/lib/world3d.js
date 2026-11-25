// PENCIPTA TETRIS, RISOFORGE: a riso-printed 1980s Moscow computing lab whose back wall is a giant stacking playfield.
// Three spot inks only (fluo pink, blue, yellow). Opaque objects are paper printed by a halftone shader with a misregistered
// key line; flat prints (sky, map, arrows of light) are true multiply ink layers. Illustration only; every value is a function of t.
import * as THREE from "./three.module.js";
import { mulberry, ramp, back, eout, clamp01, track, stage, avatar, runPose, restPose } from "./lib3d.js";

const HEX = { pink: "#FF48B0", blue: "#0078BF", yel: "#FFE800", paper: "#F6F0E2", ink: "#1D1A2A" };
const C = (h) => new THREE.Color(h);
const mul = (...hs) => hs.reduce((a, h) => a.multiply(C(h)), C("#ffffff"));
const PINK = C(HEX.pink), BLUE = C(HEX.blue), YEL = C(HEX.yel), PAPER = C(HEX.paper);
const GREEN = mul(HEX.blue, HEX.yel), ORANGE = mul(HEX.pink, HEX.yel), VIOLET = mul(HEX.pink, HEX.blue), NAVY = mul(HEX.blue, HEX.blue);
const LBLUE = C(HEX.blue).lerp(C("#ffffff"), 0.5);
const TYPE = [BLUE, YEL, PINK, GREEN, ORANGE, VIOLET, LBLUE];

// ---------- shaders ----------
const VS = `varying vec2 vUv; varying vec3 vN; varying vec3 vIC; uniform vec2 uRep;
void main(){ vUv = uv * uRep; mat4 m = modelMatrix;
#ifdef USE_INSTANCING
 m = m * instanceMatrix;
#endif
 vN = normalize(mat3(m) * normal); vIC = vec3(1.0);
#ifdef USE_INSTANCING_COLOR
 vIC = instanceColor;
#endif
 gl_Position = projectionMatrix * viewMatrix * m * vec4(position, 1.0); }`;
const LIB = `uniform float uSeed;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float ht(float d, float a, float cell){ if (d >= 0.97) return 1.0; if (d <= 0.015) return 0.0; float c = cos(a), s = sin(a);
 vec2 q = mat2(c, -s, s, c) * gl_FragCoord.xy / cell; float r = sqrt(d) * 0.66; float dd = length(fract(q) - 0.5); return 1.0 - smoothstep(r - 0.09, r + 0.09, dd); }
float tooth(){ vec2 px = gl_FragCoord.xy; float g1 = hash(floor(px / 3.0)); float g2 = hash(floor(px / 1.5) + 7.0); return (0.8 + 0.2 * g1) * (g2 < 0.06 ? 0.3 : 1.0); }`;
// Printed paper object: fill ink (halftone below density 0.97) inset and shifted by the drum offset, key line on the other drum, side shading as a blue dot screen.
const FS = `uniform vec3 uFill, uKey, uPaper; uniform float uDen, uKeyW, uInset, uShade, uUseMap, uAngle; uniform vec2 uMis; uniform sampler2D uMap;
varying vec2 vUv; varying vec3 vN; varying vec3 vIC;
${LIB}
void main(){ float tt = tooth(); vec3 fill = uFill * vIC; float cov = ht(uDen, uAngle, 9.0);
 vec2 fu = fract(vUv);
 if (uInset > 0.0) { vec2 u = fu - uMis; cov *= step(uInset, u.x) * step(u.x, 1.0 - uInset) * step(uInset, u.y) * step(u.y, 1.0 - uInset); }
 vec3 col = uPaper * mix(vec3(1.0), fill, cov * tt);
 if (uKeyW > 0.0) { vec2 u = fu + uMis * 0.8; float e = min(min(u.x, 1.0 - u.x), min(u.y, 1.0 - u.y)); col *= mix(vec3(1.0), uKey, (1.0 - step(uKeyW, e)) * tt); }
 if (uUseMap > 0.5) { vec4 tx = texture2D(uMap, vUv); col *= mix(vec3(1.0), tx.rgb, tx.a * tt); }
 float ndl = max(dot(normalize(vN), normalize(vec3(0.42, 0.82, 0.5))), 0.0);
 col *= mix(vec3(1.0), vec3(0.0, 0.47, 0.75), ht(uShade * (1.0 - ndl), 1.31, 7.0) * tt * 0.85);
 gl_FragColor = vec4(col, 1.0);
 #include <colorspace_fragment>
}`;
// Ink layer: multiplied onto whatever is already printed (src x dst), so overlaps overprint.
const FI = `uniform vec3 uInk; uniform float uDen, uUseMap, uOp, uAngle, uGrad; uniform sampler2D uMap; varying vec2 vUv; varying vec3 vN; varying vec3 vIC;
${LIB}
void main(){ float d = uDen * mix(1.0 - uGrad, 1.0, clamp(vUv.y, 0.0, 1.0)); vec3 ink = uInk * vIC; float cov = ht(d, uAngle, 9.0);
 if (uUseMap > 0.5) { vec4 tx = texture2D(uMap, vUv); ink = tx.rgb; cov *= tx.a; }
 gl_FragColor = vec4(mix(vec3(1.0), ink, cov * tooth() * uOp), 1.0);
 #include <colorspace_fragment>
}`;

const MIS = { value: new THREE.Vector2() };
let seedN = 1;
function riso({ fill = "#ffffff", den = 1, key = HEX.blue, keyW = 0, inset = 0, shade = 0.5, map = null, angle = 0.26, rep = [1, 1] } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side: THREE.DoubleSide,
    uniforms: { uFill: { value: C(fill) }, uKey: { value: C(key) }, uPaper: { value: PAPER }, uDen: { value: den }, uKeyW: { value: keyW }, uInset: { value: inset }, uShade: { value: shade }, uUseMap: { value: map ? 1 : 0 }, uMap: { value: map }, uAngle: { value: angle }, uMis: MIS, uSeed: { value: (seedN++ * 0.137) % 1 }, uRep: { value: new THREE.Vector2(rep[0], rep[1]) } },
  });
}
function ink({ color = HEX.blue, den = 1, map = null, angle = 0.26, grad = 0, op = 1 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FI, side: THREE.DoubleSide, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor,
    uniforms: { uInk: { value: C(color) }, uDen: { value: den }, uUseMap: { value: map ? 1 : 0 }, uMap: { value: map }, uOp: { value: op }, uAngle: { value: angle }, uGrad: { value: grad }, uSeed: { value: (seedN++ * 0.137) % 1 }, uRep: { value: new THREE.Vector2(1, 1) } },
  });
}

// canvas textures repaint once the web fonts are ready
const REPAINT = [];
function ctex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  const paint = (...a) => { g.globalCompositeOperation = "source-over"; g.setLineDash([]); g.clearRect(0, 0, w, h); draw(g, w, h, ...a); tx.needsUpdate = true; };
  paint(); REPAINT.push(paint);
  return { tx, paint };
}
const FH = "'Archivo Black', sans-serif", FM = "'Space Mono', monospace";
function misText(g, s, x, y, font, a = HEX.pink, b = HEX.blue, off = [5, 4]) {
  g.font = font; g.globalCompositeOperation = "source-over"; g.fillStyle = a; g.fillText(s, x + off[0], y + off[1]);
  g.globalCompositeOperation = "multiply"; g.fillStyle = b; g.fillText(s, x, y); g.globalCompositeOperation = "source-over";
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xf6f0e2, exp: 1, bloom: [0, 0.1, 1], shadow: false });
  r.toneMapping = THREE.NoToneMapping; bp.enabled = false;
  if (document.fonts) { Promise.all([document.fonts.load(`40px 'Archivo Black'`), document.fonts.load(`700 40px 'Space Mono'`)]).catch(() => 0).then(() => document.fonts.ready).then(() => REPAINT.forEach((p) => p())); }
  const rnd = mulberry(505);
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const bx = (w, h, d, mat, x, y, z, p) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const pl = (w, h, mat, x, y, z, p) => add(new THREE.PlaneGeometry(w, h), mat, x, y, z, p);

  // ---------- paper floor and printed sky ----------
  const fib = ctex(512, 512, (g, w, h) => { const q = mulberry(9); for (let i = 0; i < 2600; i++) { g.fillStyle = q() > 0.5 ? "rgba(150,128,96,.10)" : "rgba(120,100,70,.07)"; g.fillRect(q() * w, q() * h, 1 + q() * 2, 1 + q() * 2); } g.strokeStyle = "rgba(0,120,191,.30)"; g.lineWidth = 3; g.setLineDash([10, 12]); g.strokeRect(1.5, 1.5, w - 3, h - 3); });
  fib.tx.wrapS = fib.tx.wrapT = THREE.RepeatWrapping;
  const floor = pl(400, 400, riso({ map: fib.tx, shade: 0, rep: [60, 60] }), 0, 0, 0); floor.rotation.x = -Math.PI / 2;
  const sky = pl(300, 150, ink({ color: HEX.blue, den: 0.5, grad: 1, angle: 0.26 }), 0, 60, -70);
  const sun = add(new THREE.CircleGeometry(17, 64), ink({ color: HEX.yel, den: 0.92, angle: 1.3 }), 7, 33, -68);
  const band = pl(300, 10, ink({ color: HEX.pink, den: 0.45, angle: 0.8 }), 0, 9, -69);

  // ---------- THE WELL: the lab's back wall is the playfield ----------
  const wx = (cx) => -4.5 + cx, wy = (cy) => 1.1 + cy, WZ = -8;
  const gridT = ctex(440, 840, (g, w, h) => { g.strokeStyle = "rgba(0,120,191,.55)"; g.lineWidth = 2; for (let i = 0; i <= 10; i++) { g.beginPath(); g.moveTo(20 + i * 40, 20); g.lineTo(20 + i * 40, 820); g.stroke(); } for (let j = 0; j <= 20; j++) { g.beginPath(); g.moveTo(20, 20 + j * 40); g.lineTo(420, 20 + j * 40); g.stroke(); } });
  pl(11, 21, riso({ fill: HEX.pink, den: 0.16, map: gridT.tx, shade: 0, angle: 0.8 }), 0, 10.6, WZ - 0.55);
  const wallM = riso({ fill: HEX.pink, keyW: 0.05, inset: 0.03, shade: 0.6 });
  bx(0.7, 21.2, 1.5, wallM, -5.35, 10.6, WZ); bx(0.7, 21.2, 1.5, wallM, 5.35, 10.6, WZ); bx(11.4, 0.6, 1.5, wallM, 0, 0.3, WZ);
  const lip = riso({ fill: HEX.yel, keyW: 0.08, inset: 0.03, shade: 0.5 }); bx(1.2, 0.4, 1.7, lip, -5.35, 21.3, WZ); bx(1.2, 0.4, 1.7, lip, 5.35, 21.3, WZ);

  // one instanced cube pool for every block in the film
  const P = K.P, NW = P.length * 4;
  const IDX = { well: 0, last: NW, pent: NW + 4, tet: NW + 64, fly: NW + 92 }, NC = NW + 92 + 32;
  const cubeM = riso({ keyW: 0.08, inset: 0.05, shade: 0.55 });
  const CU = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cubeM, NC); CU.frustumCulled = false; scene.add(CU);
  for (let i = 0; i < NC; i++) CU.setColorAt(i, PAPER);
  const dm = new THREE.Object3D(), tc = new THREE.Color();
  const hide = (i) => { dm.position.set(0, -60, 0); dm.scale.setScalar(0.001); dm.rotation.set(0, 0, 0); dm.updateMatrix(); CU.setMatrixAt(i, dm.matrix); };
  const put = (i, x, y, z, s, col, sx = s, rz = 0) => { dm.position.set(x, y, z); dm.scale.set(sx * 0.94, s * 0.94, s * 0.94); dm.rotation.set(0, 0, rz); dm.updateMatrix(); CU.setMatrixAt(i, dm.matrix); CU.setColorAt(i, col); };

  // ---------- LAB (left of the well) ----------
  const labWall = pl(14, 7.6, riso({ fill: HEX.blue, den: 0.13, shade: 0, angle: 0.26 }), -12.6, 3.8, -3.3);
  bx(14, 0.5, 0.25, riso({ fill: HEX.blue, den: 0.6, shade: 0 }), -12.6, 0.25, -3.2);
  const plateT = ctex(1320, 260, (g, w, h) => { g.fillStyle = HEX.yel; g.fillRect(0, 0, w, h); g.strokeStyle = HEX.ink; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24); g.textAlign = "center"; misText(g, "AKADEMI ILMU PENGETAHUAN", w / 2, 116, `64px ${FH}`); misText(g, "UNI SOVIET", w / 2, 210, `64px ${FH}`); });
  const plateM = pl(6.6, 1.3, riso({ map: plateT.tx, shade: 0 }), -11, 4.95, -3.15);
  const subT = ctex(800, 110, (g, w, h) => { g.fillStyle = HEX.ink; g.font = `700 64px ${FM}`; g.textAlign = "center"; g.fillText("PUSAT KOMPUTER", w / 2, 78); });
  const subM = pl(3.6, 0.5, riso({ map: subT.tx, shade: 0 }), -11, 3.95, -3.15);
  const posterT = ctex(480, 660, (g, w, h) => {
    g.fillStyle = HEX.paper; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "multiply"; g.fillStyle = HEX.pink; g.beginPath(); g.arc(250, 250, 170, 0, 7); g.fill();
    g.fillStyle = HEX.yel; g.fillRect(0, 330, w, 130); g.fillStyle = HEX.blue;
    for (let i = 0; i < 4; i++) g.fillRect(70 + i * 90, 360 - i * 40, 70, 300);
    g.globalCompositeOperation = "source-over"; g.textAlign = "center";
    misText(g, "AUDIRA", w / 2 + 6, 610, `96px ${FH}`, HEX.pink, HEX.ink, [6, 5]);
    g.fillStyle = HEX.ink; g.font = `700 30px ${FM}`; g.fillText("RISO PRESS", w / 2, 92);
    g.strokeStyle = HEX.ink; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  });
  pl(2.5, 3.44, riso({ map: posterT.tx, shade: 0 }), -16.4, 3.7, -3.14);
  const deskM = riso({ fill: HEX.yel, den: 0.55, keyW: 0.05, inset: 0.02, shade: 0.6, angle: 1.3 });
  bx(5.4, 0.18, 2.5, deskM, -11, 1.3, -0.65);
  [[-13.5, -1.75], [-8.5, -1.75], [-13.5, 0.45], [-8.5, 0.45]].forEach(([x, z]) => bx(0.18, 1.25, 0.18, riso({ fill: HEX.blue, shade: 0.4 }), x, 0.62, z));
  const crtM = riso({ fill: HEX.yel, den: 0.3, keyW: 0.05, inset: 0.03, shade: 0.7, angle: 1.3 });
  bx(2.4, 1.95, 1.9, crtM, -11, 2.37, -0.95);
  bx(1.4, 0.3, 1.2, crtM, -11, 1.5, -1.2);
  const term = ctex(1024, 768, () => {});
  pl(2.0, 1.5, riso({ map: term.tx, shade: 0 }), -11, 2.42, 0.02);
  bx(2.0, 0.14, 0.62, riso({ fill: HEX.pink, den: 0.5, keyW: 0.06, inset: 0.03, shade: 0.6, angle: 0.8 }), -11, 1.46, 0.3);
  const cabM = riso({ fill: HEX.blue, den: 0.35, keyW: 0.04, inset: 0.02, shade: 0.7 });
  bx(1.8, 3.7, 1.3, cabM, -15.4, 1.85, -1.75);
  const e60 = ctex(640, 170, (g, w, h) => { g.fillStyle = HEX.paper; g.fillRect(0, 0, w, h); g.strokeStyle = HEX.ink; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10); g.textAlign = "center"; misText(g, "ELEKTRONIKA 60", w / 2, 108, `64px ${FH}`, HEX.pink, HEX.blue, [4, 3]); });
  pl(1.6, 0.42, riso({ map: e60.tx, shade: 0 }), -15.4, 3.15, -1.09);
  for (let i = 0; i < 12; i++) bx(0.14, 0.14, 0.08, riso({ fill: i % 3 ? HEX.pink : HEX.yel, shade: 0 }), -16 + (i % 6) * 0.24, 2.6 - Math.floor(i / 6) * 0.3, -1.08);
  for (let i = 0; i < 2; i++) { const reel = add(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 28), riso({ fill: HEX.ink, den: 0.75, shade: 0.2 }), -15.85 + i * 0.9, 1.5, -1.05); reel.rotation.x = Math.PI / 2; }

  // ---------- PENTOMINO board (s4) ----------
  const BX = 16, BYc = 6.7, BZ = -5;
  const pegT = ctex(480, 620, (g, w, h) => { g.fillStyle = HEX.blue; for (let x = 20; x < w; x += 40) for (let y = 20; y < h; y += 40) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } });
  pl(9.8, 12.6, riso({ fill: HEX.yel, den: 0.22, map: pegT.tx, keyW: 0.012, shade: 0, angle: 1.3 }), BX, BYc, BZ);
  bx(9.8, 0.4, 1.2, riso({ fill: HEX.blue, keyW: 0.05, shade: 0.5 }), BX, 0.2, BZ + 0.3);
  const PENT = [[[1, 0], [1, 1], [0, 1], [1, 2], [2, 2]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], [[0, 0], [1, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], [[0, 0], [0, 1], [1, 1], [0, 2], [1, 2]], [[1, 0], [1, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 0], [1, 2], [1, 3]], [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]]];
  const TET = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [2, 1]]];
  const centred = (cs, cell) => { const xs = cs.map((c) => c[0]), ys = cs.map((c) => c[1]); const mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2; return cs.map(([x, y]) => [(x - mx) * cell, (y - my) * cell]); };
  const pent = PENT.map((cs, i) => ({ cs: centred(cs, 0.52), x: BX + ((i % 3) - 1) * 2.95, y: BYc + (1.5 - Math.floor(i / 3)) * 2.9, d: i * 0.07 }));
  const tet = TET.map((cs, i) => ({ cs: centred(cs, 0.66), x: i === 6 ? BX : BX + ((i % 2) - 0.5) * 4.1, y: BYc + (1.5 - Math.floor(i / 2)) * 2.9, d: i * 0.12, col: TYPE[i] }));
  const ball = add(new THREE.SphereGeometry(0.55, 40, 24), riso({ map: ctex(512, 256, (g, w, h) => { g.fillStyle = HEX.yel; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "destination-out"; g.lineWidth = 16; g.beginPath(); for (let x = 0; x <= w; x += 4) { const y = h / 2 + Math.sin((x / w) * Math.PI * 4) * h * 0.28; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }).tx, shade: 0.7 }), 0, -9, 0);

  // ---------- COLOUR PC (s5) ----------
  const PX = 30;
  bx(4.8, 0.18, 2.3, deskM, PX, 1.3, 1.1);
  [[-2.2, 0.1], [2.2, 0.1], [-2.2, 2.1], [2.2, 2.1]].forEach(([x, z]) => bx(0.18, 1.25, 0.18, riso({ fill: HEX.blue, shade: 0.4 }), PX + x, 0.62, z));
  const pcM = riso({ fill: HEX.yel, den: 0.28, keyW: 0.05, inset: 0.03, shade: 0.7, angle: 1.3 });
  bx(2.5, 0.55, 1.9, pcM, PX, 1.67, 0.8); bx(2.0, 1.65, 1.6, pcM, PX, 2.77, 0.75);
  bx(0.5, 0.08, 0.06, riso({ fill: HEX.ink, shade: 0 }), PX + 0.7, 1.67, 1.76);
  const pcs = ctex(512, 400, () => {});
  pl(1.62, 1.27, riso({ map: pcs.tx, shade: 0 }), PX, 2.8, 1.56);
  bx(2.1, 0.12, 0.6, riso({ fill: HEX.pink, den: 0.5, keyW: 0.06, inset: 0.03, shade: 0.6, angle: 0.8 }), PX, 1.45, 1.9);

  // ---------- WORLD MAP on the floor (s6) ----------
  const MZ = 25, MW = 14, MD = 12;
  const lon = (l) => ((l + 170) / 340) * 1400, lat = (a) => ((80 - a) / 140) * 1200;
  const LAND = [
    [[-165, 65], [-140, 70], [-95, 72], [-75, 65], [-55, 52], [-65, 45], [-80, 30], [-80, 25], [-97, 18], [-105, 22], [-118, 33], [-125, 45], [-135, 57], [-160, 58]],
    [[-45, 60], [-20, 70], [-22, 79], [-60, 79], [-62, 74]],
    [[-80, 10], [-60, 10], [-35, -7], [-40, -22], [-58, -38], [-68, -55], [-75, -45], [-72, -18], [-81, -5]],
    [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [5, 62], [15, 70], [30, 71], [40, 66], [40, 45], [28, 41], [20, 40], [12, 44], [3, 43]],
    [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [32, -29], [20, -35], [13, -20], [9, 4], [-8, 5], [-17, 14]],
    [[40, 45], [40, 66], [70, 73], [110, 77], [140, 72], [170, 68], [160, 60], [140, 52], [130, 42], [122, 30], [110, 20], [105, 10], [98, 15], [90, 22], [80, 10], [72, 20], [60, 25], [50, 30], [45, 40]],
    [[114, -22], [130, -12], [142, -11], [153, -27], [146, -39], [135, -35], [115, -34]],
    [[-6, 50], [2, 51], [0, 58], [-6, 58]], [[130, 31], [142, 36], [142, 44], [136, 40]],
  ];
  const landT = ctex(1400, 1200, (g) => { g.fillStyle = HEX.blue; LAND.forEach((pg) => { g.beginPath(); pg.forEach(([a, b], i) => (i ? g.lineTo(lon(a), lat(b)) : g.moveTo(lon(a), lat(b)))); g.closePath(); g.fill(); }); });
  const land = pl(MW, MD, ink({ map: landT.tx, den: 0.5, angle: 0.26 }), 0, 0.02, MZ); land.rotation.x = -Math.PI / 2;
  const SITES = { MOS: [37.6, 55.8], LON: [-0.1, 51.5], NY: [-74, 40.7], SF: [-122.4, 37.8], TYO: [139.7, 35.7] };
  const sw = (k) => [-MW / 2 + (lon(SITES[k][0]) / 1400) * MW, MZ - MD / 2 + (lat(SITES[k][1]) / 1200) * MD];
  const topT = ctex(1400, 1200, (g, w, h) => {
    g.strokeStyle = "rgba(255,72,176,.8)"; g.lineWidth = 3; g.setLineDash([14, 12]);
    for (let a = -150; a <= 150; a += 30) { g.beginPath(); g.moveTo(lon(a), 0); g.lineTo(lon(a), h); g.stroke(); }
    for (let b = -40; b <= 70; b += 20) { g.beginPath(); g.moveTo(0, lat(b)); g.lineTo(w, lat(b)); g.stroke(); }
    g.setLineDash([]); g.lineWidth = 10; g.strokeStyle = HEX.ink; g.strokeRect(6, 6, w - 12, h - 12);
    ["LON", "NY", "SF", "TYO"].forEach((k) => { g.fillStyle = HEX.ink; g.beginPath(); g.arc(lon(SITES[k][0]), lat(SITES[k][1]), 13, 0, 7); g.fill(); });
    g.fillStyle = HEX.pink; g.beginPath(); g.arc(lon(37.6), lat(55.8), 26, 0, 7); g.fill();
    g.fillStyle = HEX.ink; g.font = `64px ${FH}`; g.fillText("MOSKWA", lon(37.6) + 34, lat(55.8) + 22);
  });
  const top = pl(MW, MD, ink({ map: topT.tx }), 0, 0.03, MZ); top.rotation.x = -Math.PI / 2;
  // ELORG door at the far edge of the map
  const DX = 6.3, DZ = 18.2;
  bx(3.3, 5.1, 0.35, riso({ fill: HEX.paper, keyW: 0.03, shade: 0.5 }), DX, 2.55, DZ - 0.1);
  bx(2.6, 4.5, 0.3, riso({ fill: VIOLET.getStyle(), keyW: 0.03, inset: 0.02, shade: 0.6 }), DX, 2.25, DZ);
  add(new THREE.SphereGeometry(0.12, 12, 8), riso({ fill: HEX.yel, shade: 0.4 }), DX + 0.95, 2.2, DZ + 0.22);
  const stampT = ctex(600, 260, (g, w, h) => { g.save(); g.translate(w / 2, h / 2); g.rotate(-0.07); g.strokeStyle = "#E8344E"; g.lineWidth = 16; g.strokeRect(-270, -100, 540, 200); g.fillStyle = "#E8344E"; g.font = `130px ${FH}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("ELORG", 0, 8); g.restore(); });
  const stamp = pl(2.5, 1.08, ink({ map: stampT.tx }), DX, 3.1, DZ + 0.2);
  const arrowGeo = new THREE.ConeGeometry(0.26, 0.8, 4); arrowGeo.rotateX(Math.PI / 2);
  const AR = new THREE.InstancedMesh(arrowGeo, riso({ fill: HEX.yel, keyW: 0, shade: 0.6 }), 14); AR.frustumCulled = false; scene.add(AR);

  // ---------- HANDHELD (s7a) + 1996 (s7b) ----------
  const HX = -24, HZ = 7;
  const hhM = riso({ fill: HEX.blue, den: 0.2, keyW: 0.03, inset: 0.012, shade: 0.7 });
  bx(6.4, 10.6, 1.3, hhM, HX, 5.5, HZ);
  pl(5.4, 4.8, riso({ fill: HEX.blue, den: 0.62, shade: 0, keyW: 0.02 }), HX, 7.7, HZ + 0.67);
  const hhs = ctex(512, 448, () => {});
  pl(4.3, 3.76, riso({ map: hhs.tx, shade: 0 }), HX, 7.7, HZ + 0.68);
  const padM = riso({ fill: HEX.ink, den: 0.8, shade: 0.6 });
  bx(1.7, 0.5, 0.3, padM, HX - 1.7, 3.4, HZ + 0.8); bx(0.5, 1.7, 0.3, padM, HX - 1.7, 3.4, HZ + 0.8);
  [[1.1, 3.1], [2.2, 3.7]].forEach(([x, y]) => { const b = add(new THREE.CylinderGeometry(0.46, 0.46, 0.3, 28), riso({ fill: HEX.pink, keyW: 0, shade: 0.5 }), HX + x, y, HZ + 0.75); b.rotation.x = Math.PI / 2; });
  [[-0.5, 1.75], [0.6, 1.75]].forEach(([x, y]) => { const b = bx(0.8, 0.22, 0.2, padM, HX + x, y, HZ + 0.72); b.rotation.z = 0.45; });
  for (let i = 0; i < 5; i++) { const b = bx(0.16, 1.3, 0.1, padM, HX + 1.4 + i * 0.36, 1.0, HZ + 0.68); b.rotation.z = 0.5; }
  // the copies: a pile of boxed games beside it
  const copyM = riso({ fill: HEX.pink, den: 0.55, keyW: 0.06, inset: 0.04, shade: 0.6, angle: 0.8 });
  const copies = []; for (let i = 0; i < 18; i++) { const c = bx(1.0, 1.25, 0.32, copyM, 0, -9, 0); copies.push({ c, x: -19.4 + ((i % 3) - 1) * 1.08, y: 0.63 + Math.floor(i / 3) * 0.0, z: HZ + 1.4 + Math.floor(i / 3) * -0.4 + (i % 2) * 0.05, ry: (rnd() - 0.5) * 0.3 }); }
  const juta = ctex(700, 300, (g, w, h) => { g.fillStyle = HEX.yel; g.fillRect(0, 0, w, h); g.strokeStyle = HEX.ink; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); g.textAlign = "center"; misText(g, "35 JUTA+", w / 2, 170, `120px ${FH}`); g.fillStyle = HEX.ink; g.font = `700 44px ${FM}`; g.fillText("KOPI", w / 2, 250); });
  const jutaS = pl(3.0, 1.29, riso({ map: juta.tx, shade: 0 }), -19.4, 3.4, HZ + 2.0);
  const SX = -14, SZ = 8;
  const s96 = ctex(900, 600, (g, w, h) => { g.fillStyle = HEX.paper; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "multiply"; g.fillStyle = HEX.yel; g.fillRect(0, 0, w, 360); g.globalCompositeOperation = "source-over"; g.strokeStyle = HEX.ink; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); g.textAlign = "center"; misText(g, "1996", w / 2, 300, `250px ${FH}`, HEX.pink, HEX.blue, [9, 7]); misText(g, "THE TETRIS", w / 2, 450, `84px ${FH}`, HEX.yel, HEX.ink, [4, 3]); misText(g, "COMPANY", w / 2, 548, `84px ${FH}`, HEX.yel, HEX.ink, [4, 3]); });
  const sign = new THREE.Group(); sign.position.set(SX, 0, SZ); scene.add(sign);
  pl(5.4, 3.6, riso({ map: s96.tx, shade: 0 }), 0, 5.0, 0.08, sign);
  bx(5.6, 3.8, 0.12, riso({ fill: HEX.blue, keyW: 0.03, shade: 0.5 }), 0, 5.0, 0, sign);
  bx(0.2, 2.2, 0.2, riso({ fill: HEX.blue, shade: 0.5 }), -1.8, 1.6, -0.1, sign); bx(0.2, 3.2, 0.2, riso({ fill: HEX.blue, shade: 0.5 }), 1.8, 1.6, -0.1, sign);

  // ---------- characters: faceless printed figures with name plates ----------
  const fig = (shirt, pants, sc) => {
    const M = { 1: riso({ fill: shirt, keyW: 0.07, inset: 0.04, shade: 0.55 }), 2: riso({ fill: pants, keyW: 0.07, inset: 0.04, shade: 0.55 }), 3: riso({ fill: HEX.pink, den: 0.3, keyW: 0.07, inset: 0.04, shade: 0.5, angle: 0.8 }) };
    const A = avatar({ face: false, shirt: 1, pants: 2, skin: 3, make: (c) => M[c] }); A.G.scale.setScalar(sc); scene.add(A.G); return A;
  };
  const PJ = fig(HEX.blue, VIOLET.getStyle(), 0.5);
  const GV = fig(HEX.pink, NAVY.getStyle(), 0.42);
  const HR = fig(HEX.yel, HEX.blue, 0.5);
  // tray held by Pajitnov (avatar units)
  const tray = new THREE.Group(); tray.position.set(0, 3.2, 2.05); PJ.G.add(tray);
  const trM = riso({ fill: HEX.yel, den: 0.75, keyW: 0.08, inset: 0.03, shade: 0.6, angle: 1.3 });
  bx(3.2, 0.2, 2.1, trM, 0, 0, 0, tray); bx(3.2, 0.5, 0.15, trM, 0, 0.25, 1.0, tray); bx(3.2, 0.5, 0.15, trM, 0, 0.25, -1.0, tray); bx(0.15, 0.5, 2.1, trM, -1.6, 0.25, 0, tray); bx(0.15, 0.5, 2.1, trM, 1.6, 0.25, 0, tray);
  const royT = ctex(600, 170, (g, w, h) => { g.fillStyle = HEX.paper; g.fillRect(0, 0, w, h); g.strokeStyle = HEX.ink; g.lineWidth = 8; g.strokeRect(5, 5, w - 10, h - 10); g.textAlign = "center"; misText(g, "ROYALTI: 0", w / 2, 116, `84px ${FH}`); });
  const royP = pl(3.4, 0.96, riso({ map: royT.tx, shade: 0 }), 0, -0.1, 1.12, tray);
  const coinG = new THREE.CylinderGeometry(0.34, 0.34, 0.14, 24);
  const CO = new THREE.InstancedMesh(coinG, riso({ fill: HEX.yel, keyW: 0, shade: 0.75, key: HEX.pink }), 20); CO.frustumCulled = false; tray.add(CO);
  const coinPos = Array.from({ length: 20 }, (_, i) => [((i % 4) - 1.5) * 0.72, 0.18 + Math.floor(i / 12) * 0.15, ((Math.floor(i / 4) % 3) - 1) * 0.6]);
  const plateTex = (L, H) => ctex(900, H, (g, w, h) => { g.font = `68px ${FH}`; const tw = Math.min(w - 20, Math.max(...L.map((s) => g.measureText(s).width)) + 70); g.fillStyle = HEX.paper; g.fillRect((w - tw) / 2, 10, tw, h - 20); g.strokeStyle = HEX.ink; g.lineWidth = 6; g.strokeRect((w - tw) / 2 + 3, 13, tw - 6, h - 26); g.textAlign = "center"; L.forEach((s, i) => misText(g, s, w / 2, 106 + i * 84, i ? `700 60px ${FM}` : `68px ${FH}`, HEX.pink, HEX.blue, [4, 3])); }).tx;
  const plate = (L, w) => { const H = 160 + (L.length - 1) * 84; return pl(w, (w * H) / 900, riso({ map: plateTex(L, H), shade: 0 }), 0, -9, 0); };
  const plP = plate(["ALEXEY PAJITNOV"], 2.2), plG = plate(["VADIM GERASIMOV", "16 TAHUN"], 2.3), plH = plate(["HENK ROGERS"], 2.2);

  // ---------- screens ----------
  const BASE = ["##########", "####.#####", "##.###.###", "#..#...###", "....#....."];
  const termCells = (t) => {
    const g = Array.from({ length: 9 }, (_, r) => (r >= 4 ? BASE[r - 4].split("").map((c) => c === "#") : Array(10).fill(false)).slice());
    const ph = Math.floor(Math.max(0, t - K.s2) / 0.34), cyc = Math.floor(ph / 8), st = ph % 8;
    const shapes = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]]];
    const sh = shapes[cyc % 3], col = [3, 5, 1][cyc % 3], land = [3, 2, 3][cyc % 3];
    const row = Math.min(st, land);
    sh.forEach(([x, y]) => { const rr = row - y; if (rr >= 0 && rr < 9) g[rr][col + x] = true; });
    return g;
  };
  let termKey = "";
  const paintTerm = (t) => {
    const cells = termCells(t), key = cells.map((r) => r.map((c) => (c ? 1 : 0)).join("")).join("");
    if (key === termKey) return; termKey = key;
    term.paint();
    const g = term.tx.image.getContext("2d");
    g.fillStyle = "#1c2a78"; g.fillRect(0, 0, 1024, 768);
    g.fillStyle = "#FFF6D0"; g.font = `700 62px ${FM}`; g.textBaseline = "alphabetic";
    const cw = g.measureText("M").width, x0 = (1024 - cw * 24) / 2;
    cells.forEach((row, r) => g.fillText("<!" + row.map((c) => (c ? "[]" : " .")).join("") + "!>", x0, 74 + r * 66));
    g.fillText("<!" + "=".repeat(20) + "!>", x0, 74 + 9 * 66); g.fillText("  " + "\\/".repeat(10), x0, 74 + 10 * 66);
    term.tx.needsUpdate = true;
  };
  const blockScreen = (S, t, o) => {
    const ph = Math.floor(Math.max(0, t - o.t0) / o.step), cyc = Math.floor(ph / o.n), st = ph % o.n;
    const key = cyc * 100 + st; if (S.key === key) return; S.key = key;
    const g = S.tex.tx.image.getContext("2d"), W = S.tex.tx.image.width, Hh = S.tex.tx.image.height;
    g.fillStyle = o.bg; g.fillRect(0, 0, W, Hh);
    const cs = o.cell, cols = 10, rows = Math.floor((Hh - 20) / cs), x0 = (W - cols * cs) / 2, y0 = Hh - 10 - rows * cs;
    g.fillStyle = o.wall; g.fillRect(x0 - 8, y0, 8, rows * cs); g.fillRect(x0 + cols * cs, y0, 8, rows * cs);
    const cell = (cx, cy, c) => { const x = x0 + cx * cs, y = y0 + (rows - 1 - cy) * cs; g.fillStyle = c; g.fillRect(x + 1, y + 1, cs - 2, cs - 2); if (o.inner) { g.fillStyle = o.inner; g.fillRect(x + cs * 0.3, y + cs * 0.3, cs * 0.4, cs * 0.4); } };
    o.stack.forEach((row, cy) => row.split("").forEach((ch, cx) => { if (ch !== ".") cell(cx, cy, o.pal[+ch % o.pal.length]); }));
    const pcs2 = [[[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [1, 1], [2, 1]]];
    const sh = pcs2[cyc % 3], cx0 = [4, 3, 2][cyc % 3], topRow = rows - 2, landRow = o.stack.length;
    const yy = Math.max(landRow, topRow - st);
    sh.forEach(([x, y]) => cell(cx0 + x, yy + y, o.pal[(cyc + 2) % o.pal.length]));
    S.tex.tx.needsUpdate = true;
  };
  const PCS = { tex: pcs, key: -1 }, HHS = { tex: hhs, key: -1 };
  REPAINT.push(() => { termKey = ""; PCS.key = -1; HHS.key = -1; });
  const pcOpt = { t0: K.s4e, step: 0.28, n: 12, bg: "#1D1A2A", wall: "#F6F0E2", cell: 30, pal: [HEX.pink, HEX.yel, "#3fa9f5", "#7bc96f", "#ff8a3d"], stack: ["1203410234", "40.1230.12", "2..0.3...4"] };
  const hhOpt = { t0: K.s6e, step: 0.3, n: 12, bg: "#c9d870", wall: "#33502e", cell: 34, inner: "#c9d870", pal: ["#33502e"], stack: ["0000.00000", "00.000.000", "0..0...00."] };

  // ---------- camera: px py pz lx ly lz ----------
  const cA = track([
    [0, 2.4, 2.3, 25, 0.4, 3.9, -8], [K.s1e - 0.3, -1.2, 2.6, 23, 0.2, 4.3, -8],
    [K.s2 + 0.4, -4.5, 5.2, 21, -9.5, 3.6, -2], [AT["s2:Pertengahan"], -7.2, 4.3, 17.6, -11.2, 3.1, -2], [K.s2e - 0.5, -8.6, 3.6, 13.4, -11.6, 2.6, -1.5],
    [K.s3 + 0.5, -10.8, 2.75, 6.6, -11, 2.5, 0], [K.s3e - 0.3, -11.1, 2.62, 5.6, -11, 2.45, 0],
    [K.s4 + 0.6, 13.5, 6.6, 25, 15.4, 6.0, -5], [AT["s4:menyederhanakannya"], 15.2, 6.4, 23.2, 15.8, 6.1, -5], [K.s4e - 0.3, 17, 6.0, 22, 16.2, 5.9, -5],
    [K.s5 + 0.5, 27.4, 4.6, 17.5, 29.8, 2.5, 1.5], [K.s5e - 0.3, 31.4, 4.3, 15.8, 30.2, 2.4, 1.5],
    [K.s6 + 0.6, -0.4, 19, 44, 1.6, 1.5, 23.5], [K.s6e - 0.3, 2.6, 15.5, 41, 2.3, 1.6, 22.5],
    [K.s7 + 0.5, -19.8, 6.4, 33, -21.8, 6.0, 7], [AT["s7:Baru"] - 0.2, -21.6, 5.8, 30, -21.4, 5.4, 7],
    [AT["s7:1996"], -12.4, 4.4, 28.5, -13.8, 4.0, 10], [K.s7e - 0.3, -13.6, 4.4, 27, -13.7, 3.1, 10],
    [K.s8 + 0.6, 2.6, 2.6, 25, 0.5, 4.2, -8], [AT["s8:Kamu"], -0.6, 3.2, 27, 0.2, 4.6, -8], [K.dur, -1.5, 4, 30, 0, 5, -8],
  ]);

  // ---------- figure staging ----------
  const pjStation = (t) => {
    if (t < K.s2 - 0.1) return { x: 3.1, z: 2.5, ry: -0.2, mode: "tray" };
    if (t < K.s4 - 0.1) return { x: -9.4, z: 1.35, ry: -2.2, mode: "type" };
    if (t < K.s5 - 0.1) return { x: 12.0, z: -1.6, ry: 0.45, mode: "point" };
    if (t < K.s6 - 0.1) return { x: 27.8, z: 3.0, ry: 2.2, mode: "stand" };
    if (t < K.s7 - 0.1) return { x: -4.0, z: 29.8, ry: 0.25, mode: "tray" };
    if (t < K.s8 - 0.1) return { x: -12.6, z: 12.6, ry: -0.35, mode: "tray" };
    return { x: 2.6, z: 4.0, ry: -0.15, mode: "tray" };
  };
  const clears = [AT["s8:Jadi"] + 0.25, AT["s8:jutaan"], AT["s8:ketagihan"], AT["s8:lama"]];
  const tFinal = AT["s8:Kamu"] + 0.2;
  const coinT0 = AT["s7:akhirnya"];

  return (t) => {
    // misregistration: each drum creeps and re-jitters at 10 fps
    const step = Math.floor(t * 10), mr = mulberry(1000 + step * 31), settle = t > K.s8 ? 0.45 : 1;
    MIS.value.set((mr() - 0.5) * 0.05 * settle, (mr() - 0.5) * 0.05 * settle);
    const off = [(mr() - 0.5) * 0.5, (mr() - 0.5) * 0.4];
    sky.position.set(off[0], 60 + off[1], -70); sun.position.set(7 - off[1], 33 + off[0], -68); band.position.x = off[0] * 1.5;

    const p = cA(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);

    // well stack
    const flashOn = Math.floor(t * 16) % 2 === 0;
    P.forEach((pc, q) => {
      const col = TYPE[pc.k], xsMin = 0;
      pc.c.forEach(([cx, cy], j) => {
        const i = IDX.well + q * 4 + j;
        const tStart = pc.t - pc.f;
        if (pc.t >= 0 && t < tStart) return hide(i);
        let x = wx(cx), y;
        if (pc.t >= 0 && t < pc.t) {
          const u = clamp01((t - tStart) / pc.f), D = 21 - Math.min(...pc.c.map((c) => c[1]));
          y = wy(cy) + Math.ceil((1 - u) * D * 1.0);
          x = wx(cx + Math.round(pc.dx * (1 - clamp01(u / 0.45))));
        } else y = wy(cy);
        // line clears in the last scene
        const g = Math.floor(cy / 4), c0 = clears[g];
        if (t >= c0 + 0.34) return hide(i);
        let drop = 0; for (let k = 0; k < g; k++) drop += 4 * clamp01(Math.ceil(clamp01((t - clears[k] - 0.36) / 0.2) * 4) / 4);
        let sx = 1, cc = col;
        if (t >= c0) { const u = clamp01((t - c0) / 0.34); cc = flashOn ? YEL : PAPER; sx = 1 - Math.floor(u * 5) / 5; }
        put(i, x, y - drop, WZ, 1, cc, sx);
      });
    });
    // one last piece falls into the empty well
    for (let j = 0; j < 4; j++) { const i = IDX.last + j; if (t < tFinal - 0.6) { hide(i); continue; } const u = clamp01((t - tFinal + 0.6) / 0.6); put(i, wx(3 + j), wy(0) + Math.ceil((1 - u) * 20), WZ, 1, BLUE); }

    // pentominoes then tetrominoes
    const tP = AT["s4:pentomino"] - 0.2, tM = AT["s4:menyederhanakannya"], tT = AT["s4:tujuh"];
    pent.forEach((s, k) => s.cs.forEach(([cx, cy], j) => {
      const i = IDX.pent + k * 5 + j;
      const a = back(clamp01((t - tP - s.d) / 0.4), 1.8), gone = clamp01((t - tT - k * 0.04) / 0.3);
      if (a <= 0 || gone >= 1 || t > K.s5 + 0.5) return hide(i);
      let x = s.x + cx, y = s.y + cy, z = BZ + 0.45, sc = 0.52 * a * (1 - gone);
      if (j === 4) { const f = clamp01((t - tM - k * 0.05) / 0.7); if (f >= 1) return hide(i); y -= f * f * 8; x += f * 1.5 * ((k % 2) * 2 - 1); z += f * 1.5; }
      put(i, x, y, z, sc, PINK);
    }));
    tet.forEach((s, k) => s.cs.forEach(([cx, cy], j) => {
      const i = IDX.tet + k * 4 + j;
      const a = back(clamp01((t - tT - 0.15 - s.d) / 0.4), 2);
      if (a <= 0 || t > K.s5 + 0.5) return hide(i);
      put(i, s.x + cx, s.y + cy, BZ + 0.5, 0.66 * a, s.col);
    }));
    // tennis ball on "tenis"
    const tb = AT["s4:tenis"] - 0.15;
    if (t > tb && t < K.s5 + 0.3) { const ph = (t - tb) / 0.5; ball.position.set(BX + 3.7 - Math.min(ph, 4) * 0.25, 0.95 + Math.abs(Math.sin(Math.PI * ph)) * 2.6 * Math.max(0.35, 1 - ph * 0.12), BZ + 2.8); ball.rotation.z = -t * 4; } else ball.position.y = -9;

    // pieces fly abroad, money arrows return to ELORG
    const MOS = sw("MOS"), dest = ["LON", "NY", "TYO", "SF", "LON", "NY", "TYO", "SF"].map(sw);
    for (let f = 0; f < 8; f++) {
      const t0 = AT["s6:menyebar"] - 0.4 + f * 0.42, u = clamp01((t - t0) / 1.3);
      const sh = TET[f % 7], cs = centred(sh, 0.4);
      for (let j = 0; j < 4; j++) {
        const i = IDX.fly + f * 4 + j;
        if (t < t0 || t > K.s6e + 0.2 || (cs[j] === undefined)) { hide(i); continue; }
        const e = eout(u), x = MOS[0] + (dest[f][0] - MOS[0]) * e, z = MOS[1] + (dest[f][1] - MOS[1]) * e, y = 0.4 + Math.sin(Math.PI * u) * 3.2 + (u >= 1 ? 0 : 0);
        put(i, x + cs[j][0], y + cs[j][1], z, 0.4, TYPE[f % 7]);
      }
    }
    const ta = AT["s6:Tapi"];
    for (let a = 0; a < 14; a++) {
      const src = dest[a % 4], ph = (t - ta - a * 0.33) / 1.5;
      if (ph < 0 || t > K.s6e + 0.2) { dm.position.set(0, -60, 0); dm.scale.setScalar(0.001); dm.updateMatrix(); AR.setMatrixAt(a, dm.matrix); continue; }
      const u = ph % 1, e = u, x = src[0] + (DX - src[0]) * e, z = src[1] + (DZ + 0.4 - src[1]) * e, y = 0.5 + Math.sin(Math.PI * e) * 2.4 + e * 2.2;
      const e2 = Math.min(1, e + 0.02), x2 = src[0] + (DX - src[0]) * e2, z2 = src[1] + (DZ + 0.4 - src[1]) * e2, y2 = 0.5 + Math.sin(Math.PI * e2) * 2.4 + e2 * 2.2;
      dm.position.set(x, y, z); dm.scale.setScalar(u > 0.92 ? (1 - u) / 0.08 : Math.min(1, u / 0.08)); dm.lookAt(x2, y2, z2); dm.updateMatrix(); AR.setMatrixAt(a, dm.matrix);
    }
    AR.instanceMatrix.needsUpdate = true;
    const te = AT["s6:ELORG"]; const sa = clamp01((t - te + 0.05) / 0.16);
    stamp.visible = sa > 0; stamp.scale.setScalar(1 + (1 - sa) * 1.2); stamp.position.z = DZ + 0.2 + (1 - sa) * 1.5;

    CU.instanceMatrix.needsUpdate = true; CU.instanceColor.needsUpdate = true;

    // pile of copies on "juta"
    const tj = AT["s7:Game"];
    copies.forEach((c, k) => { const u = back(clamp01((t - tj - k * 0.06) / 0.3), 2); c.c.visible = u > 0; const row = Math.floor(k / 3); c.c.position.set(c.x, 0.63 + (k % 3 === 1 ? 0 : 0) + row * 0 + (1 - u) * 4, c.z); c.c.rotation.set(-0.08, c.ry, 0); c.c.scale.setScalar(Math.max(0.001, u)); });
    const ju = back(clamp01((t - AT["s7:juta"]) / 0.3), 2); jutaS.visible = ju > 0; jutaS.scale.setScalar(Math.max(0.001, ju));

    // characters
    const s = pjStation(t);
    PJ.G.position.set(s.x, 0, s.z); PJ.G.rotation.y = s.ry; restPose(PJ); PJ.head.rotation.set(0, 0, 0);
    tray.visible = s.mode === "tray";
    if (s.mode === "tray") { PJ.armL.rotation.x = PJ.armR.rotation.x = -1.25; PJ.armL.rotation.z = 0.12; PJ.armR.rotation.z = -0.12; if (t < K.s2) PJ.head.rotation.x = -0.35; }
    if (s.mode === "type") { const k = Math.floor(t * 9); PJ.armL.rotation.x = -1.15 - (k % 2) * 0.12; PJ.armR.rotation.x = -1.15 - ((k + 1) % 2) * 0.12; PJ.head.rotation.x = 0.15; }
    if (s.mode === "point") { PJ.armR.rotation.x = -2.5 + Math.sin(t * 2) * 0.1; PJ.armR.rotation.z = -0.2; PJ.head.rotation.x = -0.25; }
    if (s.mode === "stand") { PJ.armL.rotation.z = 0.1; PJ.armR.rotation.x = -0.4; }
    if (t > K.s8 + 0.3) { PJ.G.position.y = Math.abs(Math.sin(t * 5)) * 0.12; }
    royP.visible = t < coinT0;
    for (let i = 0; i < 20; i++) {
      const u = clamp01((t - coinT0 - i * 0.09) / 0.45);
      if (u <= 0) { dm.position.set(0, -60, 0); dm.scale.setScalar(0.001); dm.rotation.set(0, 0, 0); }
      else { const cp = coinPos[i]; dm.position.set(cp[0], cp[1] + (1 - u * u) * 10, cp[2]); dm.scale.setScalar(1); dm.rotation.set(u < 1 ? (1 - u) * 6 : 0, 0, 0); }
      dm.updateMatrix(); CO.setMatrixAt(i, dm.matrix);
    }
    CO.instanceMatrix.needsUpdate = true;
    // Gerasimov at the PC
    const gOn = t > K.s5 - 0.2 && t < K.s6;
    GV.G.visible = gOn; GV.G.position.set(PX + 1.9, 0, 2.75); GV.G.rotation.y = -2.1; restPose(GV);
    { const k = Math.floor(t * 8); GV.armL.rotation.x = -1.2 - (k % 2) * 0.1; GV.armR.rotation.x = -1.2 - ((k + 1) % 2) * 0.1; }
    // Henk Rogers at the 1996 sign
    const hOn = t > K.s7 && t < K.s8;
    HR.G.visible = hOn; HR.G.position.set(SX - 1.7, 0, SZ + 4.4); HR.G.rotation.y = 0.45; restPose(HR);
    if (t > AT["s7:Henk"]) { HR.armR.rotation.x = -1.3; HR.armR.rotation.z = -0.5 - Math.sin(t * 3) * 0.08; }
    // name plates face the camera
    const bill = (m, A, on, h) => { m.visible = on; if (!on) return; A.G.updateMatrixWorld(); m.position.set(A.G.position.x, A.G.position.y + h, A.G.position.z); m.quaternion.copy(cam.quaternion); };
    bill(plP, PJ, t > K.s2 - 0.1 && !(t > K.s3 && t < K.s4), 3.35);
    bill(plG, GV, gOn && t > AT["s5:Vadim"] - 0.3, 3.05);
    bill(plH, HR, hOn && t > AT["s7:Henk"] - 0.3, 3.35);

    plateM.visible = subM.visible = !(t > K.s3 - 0.2 && t < K.s4);
    // screens
    paintTerm(t);
    if (t > K.s4 && t < K.s6 + 0.5) blockScreen(PCS, t, pcOpt);
    if (t > K.s6 && t < K.s8 + 0.5) blockScreen(HHS, t, hhOpt);

    comp.render();
  };
}
