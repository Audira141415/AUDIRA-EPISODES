// EP30 NABI DAUD, BESI LUNAK. ISOCRAFT: an isometric ink-comic diorama. A mountainside forge workshop sits on a ledge of a
// floating terrain chunk; the near walls are cut away (section caps hatched in rust) so the interior reads like a technical
// comic plate. Every surface uses one ink shader: flat colour in three light bands (top / mid / dark), screen-space hatching
// in the mid band and cross-hatching in the dark band, a back-face hull for the heavy silhouette and thin edge lines inside.
// The camera is a long lens (FOV 14) so the view stays nearly orthographic: it reads as an isometric drawing in every shot.
// Nabi Daud never appears. His presence: a hammer and tongs that work on their own, an iron bar that slumps like clay on the
// anvil, a crown resting on a rack beside the anvil, a bowl of bread earned by the work. Mountains carry glowing tasbih
// contour bands, birds circle and gather. Sky is a camera-space backdrop (sun, clouds) with a morning-evening cycle in s3.
// Every value is a pure function of t (seek-safe). Run via build-video.mjs.
import * as THREE from "./three.module.js";
import { mulberry, ramp, clamp01, back, canvasTex, track, stage } from "./lib3d.js";

const INK = 0x1c1712, DEG = Math.PI / 180;
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
const fbm = (x, z) => 0.5 * vnoise(x, z) + 0.25 * vnoise(x * 2.1 + 3, z * 2.1) + 0.125 * vnoise(x * 4.3, z * 4.3 + 7);

// ---------- terrain: peaks [x, z, height, radius]
const PEAKS = [[-6, -19, 23, 10], [-15, -9, 19, 9], [-22, -22, 16, 9], [4, -23, 13, 8], [-22, 3, 12, 8], [-13, -31, 15, 10], [-31, -11, 13, 9], [10, -14, 7, 6]];
const EDGE = 30, BASEY = -13;
function H(x, z) {
  let h = 0.4 * fbm(x * 0.15, z * 0.15);
  for (const [px, pz, ph, pr] of PEAKS) {
    const d = Math.hypot(x - px, z - pz) / (pr * 1.7);
    if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.55) + 1.6 * (fbm(x * 0.22 + px, z * 0.22) - 0.5) * (1 - d));
  }
  const fr = (x + z) / Math.SQRT2;
  h -= 6.5 * sm((fr - 6) / 18) + 1.2 * sm((fr - 6) / 18) * (fbm(x * 0.2, z * 0.2) - 0.3);
  const f = 1 - sm((Math.max(Math.abs(x + 0.3), Math.abs(z + 0.3)) - 6.2) / 2.4);
  return lerp(h, -0.04, f);
}

// ---------- shaders
const VS = `
varying vec3 vN; varying vec2 vUv; varying vec3 vC;
void main(){
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
  m = m * instanceMatrix;
  #endif
  vN = normalize(mat3(m) * normal);
  vUv = uv;
  #ifdef USE_COLOR
  vC = color;
  #else
  vC = vec3(1.);
  #endif
  gl_Position = projectionMatrix * viewMatrix * m * vec4(position, 1.);
}`;
const FS = `
uniform vec3 uC, uL, uTint, uInk, uEm; uniform float uHat, uFlat, uUseMap, uSec; uniform sampler2D uMap;
varying vec3 vN; varying vec2 vUv; varying vec3 vC;
void main(){
  vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n;
  float d = dot(n, uL);
  float b = mix(d > .72 ? 1. : d > .3 ? .8 : .62, 1., uFlat);
  vec3 c = uC * vC;
  if(uUseMap > .5) c *= texture2D(uMap, vUv).rgb;
  c *= b * uTint;
  vec2 f = gl_FragCoord.xy;
  float h1 = 1. - smoothstep(.55, 1.5, mod(f.x + f.y, 8.));
  float h2 = 1. - smoothstep(.55, 1.5, mod(f.x - f.y, 8.));
  float hat = (d < .72 ? h1 * .42 : 0.) + (d < .3 ? h2 * .42 : 0.);
  hat = max(hat, uSec * h2 * .7);
  c = mix(c, uInk, hat * uHat);
  gl_FragColor = vec4(c + uEm, 1.);
}`;
const HVS = `uniform float uPx, uK, uMode;
void main(){
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
  m = m * instanceMatrix;
  #endif
  vec3 dir = uMode > .5 ? normalize(position + vec3(1e-5)) : normal;
  vec4 mv = viewMatrix * m * vec4(position, 1.);
  vec3 dv = normalize(mat3(viewMatrix * m) * dir);
  mv.xyz += dv * uPx * (-mv.z) * uK;
  gl_Position = projectionMatrix * mv;
}`;
const HFS = `uniform vec3 uInk; void main(){ gl_FragColor = vec4(uInk, 1.); }`;

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xefe3c8, fog: 0, exp: 1, bloom: [0.3, 0.45, 0.93], fov: 14, shadow: false });
  r.toneMapping = THREE.NoToneMapping;
  cam.near = 2; cam.far = 3200; cam.setViewOffset(1080, 1920, 0, -110, 1080, 1920); cam.updateProjectionMatrix();
  scene.add(cam);
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(3030);
  const U = { uL: { value: new THREE.Vector3(0.35, 1, 0.75).normalize() }, uTint: { value: new THREE.Color(1, 1, 1) }, uInk: { value: new THREE.Color(INK) }, uK: { value: (2 * Math.tan(7 * DEG)) / 1920 } };
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
  const ink = (col, o = {}) => new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Color(col) }, uEm: { value: new THREE.Color(o.em || 0) }, uHat: { value: o.hat ?? 1 }, uFlat: { value: o.flat ?? 0 }, uSec: { value: o.sec ?? 0 }, uMap: { value: o.map || white }, uUseMap: { value: o.map ? 1 : 0 }, uL: U.uL, uTint: U.uTint, uInk: U.uInk },
    vertexShader: VS, fragmentShader: FS, side: o.side ?? THREE.FrontSide, vertexColors: !!o.vc,
  });
  const HC = {};
  const hullMat = (px, mode) => HC[px + "_" + mode] || (HC[px + "_" + mode] = new THREE.ShaderMaterial({ uniforms: { uPx: { value: px }, uMode: { value: mode }, uK: U.uK, uInk: U.uInk }, vertexShader: HVS, fragmentShader: HFS, side: THREE.BackSide }));
  const LINE = new THREE.LineBasicMaterial({ color: INK });
  function part(geo, mat, parent, x = 0, y = 0, z = 0, o = {}) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (o.ol !== 0) m.add(new THREE.Mesh(geo, hullMat(o.ol ?? 2.4, o.mode ?? 1)));
    if (o.edges !== false) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, o.ea || 25), LINE));
    if (o.ry) m.rotation.y = o.ry;
    if (o.rx) m.rotation.x = o.rx;
    if (o.rz) m.rotation.z = o.rz;
    (parent || scene).add(m); return m;
  }
  const BX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CY = (a, b, h, s = 10) => new THREE.CylinderGeometry(a, b, h, s);

  // ---------- palette
  const C = { stone: 0xcbb89a, stoneD: 0xa8927a, wood: 0xa8743f, woodD: 0x7d5532, iron: 0x7f8a92, steel: 0x9aa6ad, gold: 0xe3b23c, rust: 0xc0573e, bread: 0xd9a35f, cloth: 0x6f8f8a, water: 0x6fa3b4, coal: 0x2d2622, earth: 0x8c6a4e };

  // ---------- textures
  const stoneTex = canvasTex(512, 256, (x, w, h) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); const rr = mulberry(7);
    x.strokeStyle = "rgba(28,23,18,.55)"; x.lineWidth = 3;
    const rows = 6;
    for (let j = 0; j < rows; j++) { const y0 = (j * h) / rows; let xx = j % 2 ? -40 : 0; while (xx < w) { const bw = 70 + rr() * 60; x.fillStyle = `rgb(${232 + rr() * 23},${226 + rr() * 25},${215 + rr() * 30})`; x.fillRect(xx + 2, y0 + 2, bw - 4, h / rows - 4); x.strokeRect(xx + 2, y0 + 2, bw - 4, h / rows - 4); xx += bw; } }
  });
  const floorTex = canvasTex(512, 512, (x, w) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, w); const rr = mulberry(9); x.strokeStyle = "rgba(28,23,18,.45)"; x.lineWidth = 3;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const s = w / 6; x.fillStyle = `rgb(${236 + rr() * 19},${228 + rr() * 22},${214 + rr() * 26})`; x.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); x.strokeRect(i * s + 3, j * s + 3, s - 6, s - 6); }
  });
  const strataTex = canvasTex(64, 512, (x, w, h) => {
    const cols = ["#fff", "#e9dccb", "#f6eee2", "#d9c6b0", "#efe2d0"]; const rr = mulberry(4); let y = 0, k = 0;
    while (y < h) { const bh = 20 + rr() * 50; x.fillStyle = cols[k++ % cols.length]; x.fillRect(0, y, w, bh); x.fillStyle = "rgba(28,23,18,.5)"; x.fillRect(0, y, w, 2); y += bh; }
  });

  // ---------- terrain chunk
  {
    const N = 90, geo = new THREE.PlaneGeometry(EDGE * 2, EDGE * 2, N, N); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)));
    const g = geo.toNonIndexed(); g.computeVertexNormals();
    const q = g.attributes.position, col = new Float32Array(q.count * 3), tc = new THREE.Color(), nrm = g.attributes.normal;
    for (let i = 0; i < q.count; i += 3) {
      const cx = (q.getX(i) + q.getX(i + 1) + q.getX(i + 2)) / 3, cy = (q.getY(i) + q.getY(i + 1) + q.getY(i + 2)) / 3, cz = (q.getZ(i) + q.getZ(i + 1) + q.getZ(i + 2)) / 3;
      const ny = nrm.getY(i), n = fbm(cx * 0.3, cz * 0.3);
      let hex;
      if (Math.max(Math.abs(cx + 0.3), Math.abs(cz + 0.3)) < 6.6 && cy > -0.3) hex = 0xc6ad88;
      else if (cy > 15) hex = n > 0.5 ? 0xeee3cf : 0xe0d1b6;
      else if (cy > 5 || ny < 0.6) hex = n > 0.55 ? 0xb99f80 : n > 0.4 ? 0xc8b08e : 0xa88c6d;
      else hex = n > 0.5 ? 0xa4a868 : n > 0.35 ? 0xb8b278 : 0xc9b98a;
      tc.setHex(hex).convertSRGBToLinear();
      for (let k = 0; k < 3; k++) { col[(i + k) * 3] = tc.r; col[(i + k) * 3 + 1] = tc.g; col[(i + k) * 3 + 2] = tc.b; }
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const terr = new THREE.Mesh(g, ink(0xffffff, { vc: true, hat: 0.85 }));
    scene.add(terr);
    terr.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 34), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 })));
    // skirts (cut earth with strata)
    const S = 120, sides = [[(s) => [-EDGE + s, EDGE]], [(s) => [EDGE, EDGE - s]], [(s) => [EDGE - s, -EDGE]], [(s) => [-EDGE, -EDGE + s]]];
    for (const [fn] of sides) {
      const pos = [], uv = [], idx = [], top = [];
      for (let i = 0; i <= S; i++) {
        const [x, z] = fn((i / S) * EDGE * 2), y = H(x, z);
        pos.push(x, y, z, x, BASEY, z); uv.push(i / S, (y - BASEY) / 40, i / S, 0); top.push(x, y, z);
        if (i < S) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
      const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
      const sk = new THREE.Mesh(sg, ink(C.earth, { map: strataTex, side: THREE.DoubleSide, hat: 0.7 })); scene.add(sk);
      const tl = new THREE.BufferGeometry(); tl.setAttribute("position", new THREE.Float32BufferAttribute(top, 3));
      scene.add(new THREE.Line(tl, LINE));
    }
    const bottom = new THREE.Mesh(BX(EDGE * 2, 0.1, EDGE * 2), ink(C.earth)); bottom.position.y = BASEY - 0.05; scene.add(bottom);
  }

  // ---------- workshop
  const WS = new THREE.Group(); scene.add(WS);
  const mStone = ink(0xffffff, { map: stoneTex }), mFloor = ink(0xd8c4a2, { map: floorTex, hat: 0.6 }), mSec = ink(C.rust, { sec: 1 });
  const mWood = ink(C.wood), mWoodD = ink(C.woodD), mIron = ink(C.iron), mSteel = ink(C.steel), mGold = ink(C.gold), mCoal = ink(C.coal, { hat: 0 });
  part(BX(9.6, 0.3, 9.6), mFloor, WS, 0, -0.15, 0, { ol: 2 });
  const wallA = [[-4.5, -1.5, 3.4], [-1.5, 1.5, 1.5], [1.5, 4.5, 1.0]];
  for (const [a, b, h] of wallA) {
    part(BX(b - a, h, 0.35), mStone, WS, (a + b) / 2, h / 2, -4.6, { ol: 2.2 });
    part(BX(b - a, 0.06, 0.35), mSec, WS, (a + b) / 2, h + 0.03, -4.6, { ol: 0 });
    part(BX(0.35, h, b - a), mStone, WS, -4.6, h / 2, (a + b) / 2, { ol: 2.2 });
    part(BX(0.35, 0.06, b - a), mSec, WS, -4.6, h + 0.03, (a + b) / 2, { ol: 0 });
  }
  for (const [a, b] of [[-4.8, -0.9], [0.9, 4.8]]) {
    part(BX(b - a, 0.5, 0.35), mStone, WS, (a + b) / 2, 0.25, 4.6, { ol: 2 }); part(BX(b - a, 0.06, 0.35), mSec, WS, (a + b) / 2, 0.53, 4.6, { ol: 0 });
    part(BX(0.35, 0.5, b - a), mStone, WS, 4.6, 0.25, (a + b) / 2, { ol: 2 }); part(BX(0.35, 0.06, b - a), mSec, WS, 4.6, 0.53, (a + b) / 2, { ol: 0 });
  }
  part(BX(0.3, 3.9, 0.3), mWoodD, WS, -4.25, 1.95, -4.25);
  part(BX(5.4, 0.2, 0.22), mWood, WS, -1.8, 3.55, -3.7); part(BX(0.22, 0.2, 5.4), mWood, WS, -3.7, 3.55, -1.8);
  part(BX(4.0, 0.2, 0.22), mWood, WS, -2.5, 3.55, -2.0); part(BX(0.22, 0.2, 4.0), mWood, WS, -2.0, 3.55, -2.5);
  // forge, hood, chimney, coals, flames, bellows
  part(BX(2.0, 1.0, 2.0), mStone, WS, -3.2, 0.5, -3.2);
  part(BX(1.4, 0.1, 1.4), mCoal, WS, -3.2, 1.0, -3.2, { ol: 0 });
  const coalM = ink(0xff7a2a, { hat: 0, flat: 1, em: 0xff6a10 });
  const coals = [];
  for (let i = 0; i < 9; i++) { const c = part(new THREE.IcosahedronGeometry(0.16 + rnd() * 0.08, 0), coalM, WS, -3.2 + (rnd() - 0.5) * 1.0, 1.08, -3.2 + (rnd() - 0.5) * 1.0, { ol: 1.4, mode: 0, edges: false }); coals.push(c); }
  const flameM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.0, 0.25), transparent: true, opacity: 0.9 });
  const flames = [];
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 5), flameM); f.position.set(-3.2 + (i % 2 - 0.5) * 0.5, 1.35, -3.2 + ((i >> 1) - 0.5) * 0.5); WS.add(f); flames.push(f); }
  part(CY(0.45, 1.25, 1.1, 4), mStone, WS, -3.2, 2.55, -3.2, { ry: Math.PI / 4 });
  part(BX(0.7, 3.2, 0.7), mStone, WS, -3.2, 4.6, -3.2);
  part(BX(0.8, 0.12, 0.8), mSec, WS, -3.2, 6.25, -3.2, { ol: 1.5 });
  const bel = new THREE.Group(); bel.position.set(-1.5, 0.55, -3.85); WS.add(bel);
  const belBody = part(BX(1.0, 0.36, 0.7), ink(0x8a5a3c), bel, 0, 0, 0); part(BX(0.12, 0.12, 0.6), mWoodD, bel, -0.6, 0, 0);
  part(BX(0.5, 0.55, 0.5), mWoodD, WS, -1.5, 0.18, -3.85);
  // anvil on its stump, the maker's stamp
  const AV = new THREE.Group(); AV.position.set(0.6, 0, 0.9); WS.add(AV);
  part(CY(0.42, 0.46, 0.55, 9), mWood, AV, 0, 0.275, 0, { mode: 1 });
  part(BX(0.5, 0.3, 0.32), mIron, AV, 0, 0.7, 0);
  part(BX(1.25, 0.26, 0.42), mIron, AV, 0, 0.98, 0);
  part(BX(0.75, 0.12, 0.5), mIron, AV, 0, 0.6, 0);
  const horn = part(new THREE.ConeGeometry(0.17, 0.62, 10), mIron, AV, 0.9, 1.0, 0, { rz: -Math.PI / 2, mode: 1 });
  const stampTex = canvasTex(512, 168, (x, w, h) => {
    x.fillStyle = "#c9a35a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#1c1712"; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20); x.lineWidth = 4; x.strokeRect(26, 26, w - 52, h - 52);
    x.fillStyle = "#1c1712"; x.font = "800 86px 'Barlow Condensed', 'Arial Narrow', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.letterSpacing = "10px"; x.fillText("AUDIRA", w / 2 + 5, h / 2 + 4);
  });
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.13), new THREE.MeshBasicMaterial({ map: stampTex })); stamp.position.set(0, 0.7, 0.164); AV.add(stamp);
  // rack beside the anvil with the crown on top
  const RK = new THREE.Group(); RK.position.set(-1.15, 0, 0.3); WS.add(RK);
  for (const [x, z] of [[-0.25, -0.5], [0.25, -0.5], [-0.25, 0.5], [0.25, 0.5]]) part(BX(0.07, 1.55, 0.07), mWoodD, RK, x, 0.775, z);
  part(BX(0.6, 0.06, 1.1), mWood, RK, 0, 0.72, 0); part(BX(0.6, 0.06, 1.1), mWood, RK, 0, 1.3, 0);
  part(CY(0.1, 0.12, 0.26, 8), ink(0x7d9aa0), RK, 0.02, 0.88, -0.3); part(CY(0.08, 0.1, 0.2, 8), ink(0xb5704e), RK, 0.0, 0.85, 0.05);
  part(BX(0.4, 0.1, 0.32), ink(C.cloth), RK, 0, 0.8, 0.33);
  const CR = new THREE.Group(); CR.position.set(0, 1.33, 0); RK.add(CR);
  part(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 16, 1, true), mGold, CR, 0, 0.06, 0, { mode: 1, edges: false, ol: 2 });
  part(CY(0.2, 0.2, 0.025, 16), ink(0xd29a2a), CR, 0, 0.01, 0, { edges: false, ol: 1.5 });
  const gemM = ink(0xc2364a, { em: 0x200000 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    part(new THREE.ConeGeometry(0.05, 0.14, 4), mGold, CR, Math.cos(a) * 0.19, 0.18, Math.sin(a) * 0.19, { mode: 1, edges: false, ol: 1.6 });
    part(new THREE.SphereGeometry(0.025, 8, 6), mGold, CR, Math.cos(a) * 0.19, 0.27, Math.sin(a) * 0.19, { mode: 0, edges: false, ol: 1.2 });
    if (i % 2 === 0) part(new THREE.OctahedronGeometry(0.03), gemM, CR, Math.cos(a) * 0.205, 0.06, Math.sin(a) * 0.205, { mode: 0, edges: false, ol: 1.2 });
  }
  // stool, bowl, bread
  part(BX(0.55, 0.06, 0.55), mWood, WS, -0.25, 0.47, 2.15);
  for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) part(BX(0.06, 0.45, 0.06), mWoodD, WS, -0.25 + x, 0.225, 2.15 + z);
  const bowlPts = [[0.0, 0], [0.16, 0.0], [0.2, 0.03], [0.24, 0.1], [0.25, 0.15], [0.23, 0.15], [0.21, 0.1], [0.15, 0.04], [0.0, 0.035]].map(([a, b]) => new THREE.Vector2(a, b));
  part(new THREE.LatheGeometry(bowlPts, 16), ink(0xb5704e, { side: THREE.DoubleSide }), WS, -0.25, 0.5, 2.15, { mode: 0, edges: false, ol: 1.6 });
  const loaves = [];
  for (let i = 0; i < 3; i++) { const l = part(new THREE.SphereGeometry(0.1, 12, 8), ink(C.bread), WS, -0.25 + [-0.08, 0.08, 0][i], 0.6 + (i === 2 ? 0.05 : 0), 2.15 + [0.03, -0.02, 0.08][i], { mode: 0, edges: false, ol: 1.8 }); loaves.push(l); }
  // coat stand
  const CS = new THREE.Group(); CS.position.set(2.8, 0, -2.2); WS.add(CS);
  part(BX(0.7, 0.08, 0.7), mWoodD, CS, 0, 0.04, 0); part(BX(0.09, 2.1, 0.09), mWood, CS, 0, 1.05, 0);
  part(BX(0.9, 0.08, 0.1), mWood, CS, 0, 1.92, 0);
  // barrel, logs, tool rack on wall B
  part(CY(0.38, 0.34, 0.8, 12), mWood, WS, 3.25, 0.4, 1.5, { mode: 1 });
  part(CY(0.33, 0.33, 0.02, 12), ink(C.water, { em: 0x050a10 }), WS, 3.25, 0.79, 1.5, { ol: 0, edges: false });
  for (let i = 0; i < 5; i++) part(CY(0.13, 0.13, 1.2, 7), mWoodD, WS, -3.6 + (i % 3) * 0.28 + (i > 2 ? 0.14 : 0), 0.13 + (i > 2 ? 0.24 : 0), 1.6, { rx: Math.PI / 2, mode: 1 });
  part(BX(0.08, 0.1, 2.2), mWoodD, WS, -4.36, 2.2, 0.2);
  for (let i = 0; i < 4; i++) { const z = -0.6 + i * 0.55; part(BX(0.05, 0.62, 0.05), mIron, WS, -4.32, 1.85, z); part(BX(0.06, 0.12, 0.2), mIron, WS, -4.32, 1.55, z); }

  // ---------- hammer and tongs (no hand anywhere)
  const HM = new THREE.Group(); WS.add(HM);
  part(CY(0.035, 0.04, 0.8, 8), mWood, HM, -0.4, 0, 0, { rz: Math.PI / 2, mode: 1 });
  part(BX(0.17, 0.34, 0.17), mIron, HM, -0.8, 0, 0);
  const TG = new THREE.Group(); WS.add(TG);
  const tA = new THREE.Group(), tB = new THREE.Group(); TG.add(tA, tB);
  part(BX(0.04, 0.035, 0.95), mIron, tA, 0, 0, -0.5); part(BX(0.04, 0.035, 0.95), mIron, tB, 0, 0, -0.5);
  part(BX(0.05, 0.06, 0.12), mIron, tA, 0, 0.03, -0.02); part(BX(0.05, 0.06, 0.12), mIron, tB, 0, -0.03, -0.02);
  // the iron bar: a chain of segments that bends like clay
  const NS = 16, SL = 1.4 / NS, BAR = new THREE.Group(); WS.add(BAR);
  const barM = ink(0x6f7a82), segs = [];
  for (let i = 0; i < NS; i++) segs.push(part(BX(0.11, 0.1, SL * 1.08), barM, BAR, 0, 0, 0, { ol: 1.8 }));
  const JAW = new THREE.Vector3(0.6, 1.16, 0.35), FORGE = new THREE.Vector3(-2.7, 1.25, -2.7);

  // ---------- impact burst, sparks, steam, crown glint
  const burstTex = canvasTex(256, 256, (x, w) => {
    x.translate(w / 2, w / 2); const rr = mulberry(11);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + rr() * 0.2, r0 = 34 + rr() * 14, r1 = 92 + rr() * 30; x.beginPath(); x.moveTo(Math.cos(a - 0.06) * r0, Math.sin(a - 0.06) * r0); x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); x.lineTo(Math.cos(a + 0.06) * r0, Math.sin(a + 0.06) * r0); x.closePath(); x.fillStyle = "#1c1712"; x.fill(); }
  });
  const burst = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: burstTex, transparent: true, depthWrite: false, depthTest: false })); burst.renderOrder = 5; WS.add(burst);
  const SP = (() => { const n = 160; const p = { n }; Object.assign(p, ptsMake(n)); return p; })();
  function ptsMake(n) {
    const pos = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const map = canvasTex(64, 64, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
    const m = new THREE.PointsMaterial({ size: 0.07, map, color: new THREE.Color(3, 1.4, 0.35), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const P = new THREE.Points(g, m); P.frustumCulled = false; scene.add(P); return { P, pos, g };
  }
  const SPV = Array.from({ length: SP.n }, () => [(rnd() - 0.5) * 3.2, 0.8 + rnd() * 2.2, (rnd() - 0.5) * 3.2, 0.25 + rnd() * 0.35]);
  const steamTex = canvasTex(128, 256, (x, w, h) => { x.strokeStyle = "#1c1712"; x.lineWidth = 7; x.lineCap = "round"; x.beginPath(); for (let y = h - 10; y > 10; y -= 4) { const xx = w / 2 + Math.sin(y * 0.05) * 26; y === h - 10 ? x.moveTo(xx, y) : x.lineTo(xx, y); } x.stroke(); });
  const steam = [0, 1, 2].map((i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.34), new THREE.MeshBasicMaterial({ map: steamTex, transparent: true, depthWrite: false })); WS.add(m); return m; });
  const glintTex = canvasTex(128, 128, (x, w) => { x.translate(w / 2, w / 2); x.fillStyle = "#fff"; for (const a of [0, Math.PI / 2]) { x.save(); x.rotate(a); x.beginPath(); x.moveTo(0, -60); x.quadraticCurveTo(5, -5, 60, 0); x.quadraticCurveTo(5, 5, 0, 60); x.quadraticCurveTo(-5, 5, -60, 0); x.quadraticCurveTo(-5, -5, 0, -60); x.fill(); x.restore(); } });
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: glintTex, color: new THREE.Color(2.2, 1.8, 1.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); WS.add(glint);

  // ---------- chainmail diagram (s4): 5 x 4 rings, an iso blueprint card, leader lines, a caliper
  const DG = new THREE.Group(); DG.position.set(0.6, 2.35, 1.0); DG.rotation.y = Math.PI / 4; WS.add(DG);
  const cardTex = canvasTex(512, 384, (x, w, h) => { x.fillStyle = "#f6efdf"; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(60,90,120,.35)"; x.lineWidth = 2; for (let i = 0; i < w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } x.strokeStyle = "#1c1712"; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); });
  const card = part(BX(1.62, 1.18, 0.03), ink(0xffffff, { map: cardTex, hat: 0, flat: 1 }), DG, 0, 0, -0.12, { ol: 2 });
  const ringGeo = new THREE.TorusGeometry(0.15, 0.028, 8, 28), ringM = ink(0xa9b4bb);
  const RINGS = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
    const k = RINGS.length, fx = (i - 2) * 0.25 + (j % 2 ? 0.125 : 0) - 0.06, fy = (j - 1.5) * 0.2;
    const m = part(ringGeo, ink(0xa9b4bb), DG, fx, fy, 0, { mode: 0, edges: false, ol: 1.6 });
    const ex = [fx * 1.9 + (rnd() - 0.5) * 0.3, fy * 1.7 + (rnd() - 0.5) * 0.3, 0.9 + rnd() * 0.5];
    const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...ex), new THREE.Vector3(fx, fy, 0)]);
    const ln = new THREE.Line(lg, new THREE.LineDashedMaterial({ color: INK, dashSize: 0.05, gapSize: 0.04, transparent: true })); ln.computeLineDistances(); DG.add(ln);
    RINGS.push({ m, fx, fy, ex, ln, tilt: (i + j) % 2 ? 0.55 : -0.55 });
  }
  const CAL = new THREE.Group(); DG.add(CAL);
  const brass = ink(0xc8a24a);
  part(BX(1.05, 0.06, 0.03), mSteel, CAL, 0, 0, 0);
  part(BX(0.05, 0.3, 0.03), mSteel, CAL, -0.45, -0.15, 0);
  const jaw = new THREE.Group(); CAL.add(jaw);
  part(BX(0.05, 0.3, 0.03), brass, jaw, 0, -0.15, 0); part(BX(0.18, 0.1, 0.05), brass, jaw, 0.05, 0.0, 0);
  const tickTex = canvasTex(512, 32, (x, w, h) => { x.fillStyle = "#1c1712"; for (let i = 0; i < 40; i++) x.fillRect(8 + i * 12.4, 0, 2, i % 5 ? 12 : 22); });
  const ticks = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.05), new THREE.MeshBasicMaterial({ map: tickTex, transparent: true })); ticks.position.set(0, 0.0, 0.017); CAL.add(ticks);

  // ---------- the mail coat (instanced rings on the stand)
  const CT = [];
  {
    for (let row = 0, y = 0.98; y <= 1.9; y += 0.058, row++) {
      const fl = 0.11 * sm((1.25 - y) / 0.27), nk = sm((y - 1.78) / 0.12);
      const rx = 0.34 + fl - 0.06 * nk, rz = 0.22 + fl * 0.8 - 0.03 * nk, n = Math.round((Math.PI * (rx + rz) * 1.0) / 0.06);
      for (let k = 0; k < n; k++) { const a = ((k + (row % 2) * 0.5) / n) * Math.PI * 2; CT.push({ p: [Math.cos(a) * rx, y, Math.sin(a) * rz], n: [Math.cos(a) / rx, 0, Math.sin(a) / rz], row, tilt: row % 2 ? 0.4 : -0.4 }); }
    }
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const x = s * (0.36 + i * 0.06); for (let k = 0; k < 14; k++) { const b = (k / 14) * Math.PI * 2; CT.push({ p: [x, 1.76 + 0.12 * Math.cos(b), 0.12 * Math.sin(b)], n: [0, Math.cos(b), Math.sin(b)], row: 13 + i, tilt: i % 2 ? 0.4 : -0.4 }); } }
  }
  const NC = CT.length;
  const coatGeo = new THREE.TorusGeometry(0.031, 0.009, 5, 12), coatM = ink(0x9aa6ae, { hat: 0.6 });
  const coat = new THREE.InstancedMesh(coatGeo, coatM, NC); coat.frustumCulled = false; CS.add(coat);
  const coatH = new THREE.InstancedMesh(coatGeo, hullMat(1.0, 0), NC); coatH.instanceMatrix = coat.instanceMatrix; coatH.frustumCulled = false; CS.add(coatH);
  const qz = new THREE.Vector3(0, 0, 1), tq = new THREE.Quaternion(), tq2 = new THREE.Quaternion(), tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), fm = new THREE.Matrix4(), fs = new THREE.Vector3(), fe = new THREE.Euler();
  CT.forEach((o) => { tv.set(...o.n).normalize(); o.q = new THREE.Quaternion().setFromUnitVectors(qz, tv).multiply(tq2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), o.tilt)); o.o = o.row / 19 + rnd() * 0.08; });
  // shield icon (melindungi)
  const shp = new THREE.Shape(); shp.moveTo(-0.25, 0.3); shp.lineTo(0.25, 0.3); shp.lineTo(0.25, 0.02); shp.quadraticCurveTo(0.22, -0.22, 0, -0.33); shp.quadraticCurveTo(-0.22, -0.22, -0.25, 0.02); shp.closePath();
  const shG = new THREE.ExtrudeGeometry(shp, { depth: 0.07, bevelEnabled: false }); shG.center();
  const SH = new THREE.Group(); SH.position.set(2.8 + 0.85, 1.75, -2.2 + 0.85); SH.rotation.y = Math.PI / 4; WS.add(SH);
  part(shG, ink(C.rust), SH, 0, 0, 0, { ol: 2.6, ea: 40 });
  part(new THREE.TorusGeometry(0.1, 0.025, 8, 24), ink(0xd8c6a0), SH, 0, 0.02, 0.05, { mode: 0, edges: false, ol: 1.4 });

  // ---------- tasbih contour bands on three peaks
  const WAVE = [];
  for (const pi of [0, 1, 2]) {
    const [px, pz, ph, pr] = PEAKS[pi];
    for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 96, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.55, 0.6), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(m); WAVE.push({ m, px, pz, ph, R: pr * 1.7, k, pi }); }
  }

  // ---------- birds (ink silhouettes)
  const NB = 30;
  const wingR = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.14), new THREE.Vector3(0, 0, 0.12), new THREE.Vector3(0.62, 0, -0.06)]);
  const wingL = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.12), new THREE.Vector3(0, 0, -0.14), new THREE.Vector3(-0.62, 0, -0.06)]);
  const birdM = new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide });
  const bR = new THREE.InstancedMesh(wingR, birdM, NB), bL = new THREE.InstancedMesh(wingL, birdM, NB), bB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.1, 0.42), birdM, NB);
  for (const b of [bR, bL, bB]) { b.frustumCulled = false; scene.add(b); }
  const BD = Array.from({ length: NB }, (_, i) => {
    const pk = PEAKS[i % 4], near = i < 7;
    return { cx: near ? 0.2 + (rnd() - 0.5) * 2 : pk[0] * 0.8, cz: near ? -6.5 - rnd() * 2 : pk[1] * 0.8, cy: near ? 2.1 + rnd() * 0.7 : pk[2] * 0.7 + 3 + rnd() * 4, rad: near ? 1.2 + rnd() * 1.4 : 3 + rnd() * 5, sp: (0.35 + rnd() * 0.25) * (i % 2 ? 1 : -1), ph: rnd() * 6.28, fl: rnd() * 6.28, fs: 9 + rnd() * 4, gr: 2.2 + (i % 5) * 0.55, gy: 6.2 + (i % 3) * 0.6 + rnd() * 0.4, ga: i * 0.21, s: 0.85 + rnd() * 0.3 };
  });

  // ---------- sky backdrop in camera space (sun, clouds)
  const SKYZ = -2600, SKYH = 2 * Math.tan(7 * DEG) * 2600;
  const sun = new THREE.Mesh(new THREE.CircleGeometry(46, 40), new THREE.MeshBasicMaterial({ color: 0xf6c35b })); cam.add(sun);
  const sunRing = new THREE.Mesh(new THREE.RingGeometry(46, 52, 40), new THREE.MeshBasicMaterial({ color: INK })); sun.add(sunRing); sunRing.position.z = 0.1;
  const cloudTex = canvasTex(512, 220, (x, w, h) => {
    const bl = [[120, 140, 70], [210, 110, 88], [310, 120, 80], [390, 145, 60], [250, 160, 70]];
    x.fillStyle = "#1c1712"; for (const [a, b, c] of bl) { x.beginPath(); x.arc(a, b, c + 7, 0, 7); x.fill(); }
    x.fillStyle = "#fbf6ea"; for (const [a, b, c] of bl) { x.beginPath(); x.arc(a, b, c, 0, 7); x.fill(); }
    x.fillRect(110, 150, 300, 55); x.fillStyle = "#1c1712"; x.fillRect(60, 205, 400, 8);
  });
  const clouds = [[-120, 200, 0.6], [110, 260, 0.5], [30, 120, 0.42]].map(([x, y, s]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(260 * s, 112 * s), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false })); m.position.set(x, y, SKYZ + 50); cam.add(m); return { m, x, y }; });
  sun.position.z = SKYZ;

  // ---------- timing
  const STR = K.str || [], HOT = K.hot || [], LINK = K.links || [];
  const tLun1 = A("s1:lunak"), tMakan = A("s1:makan");
  const tP = A("s4:Perintahnya"), tBesi = A("s4:Besi"), tLun4 = A("s4:lunakkan"), tMenj = A("s4:menjadi"), tUkur = A("s4:ukurlah");
  const tCoat0 = A("s5:ajarkan"), tCoat1 = A("s5:besi") + 0.5, tLind = A("s5:melindungi");
  const tMakan6 = A("s6:makanan"), tRaja = A("s7:raja"), tHik = A("s7:hikmah");
  const workW = (t) => Math.max(1 - ramp(t, 4.3, 4.9), ramp(t, tBesi + 0.5, tBesi + 1.0) * (1 - ramp(t, K.s5 - 0.6, K.s5)), ramp(t, A("s7:tetap") - 0.6, A("s7:tetap")) * (1 - ramp(t, K.s8e - 1.5, K.s8e - 0.8)));
  const pressA = (t) => {
    let a = -0.35 + 0.05 * Math.sin(t * 2.3);
    for (const s of STR) {
      const p = t - s;
      if (p > -0.55 && p <= -0.18) a = lerp(-0.35, -1.15, sm((p + 0.55) / 0.37));
      else if (p > -0.18 && p <= 0) { const x = (p + 0.18) / 0.18; a = -1.15 * (1 - x * x); }
      else if (p > 0 && p < 0.4) a = lerp(-0.18 * Math.sin(Math.PI * Math.min(1, p / 0.2)), -0.35, sm((p - 0.15) / 0.25));
    }
    return a;
  };
  const sky = [
    [0, 0xefe3c8, [1, 1, 1]], [K.s3, 0xefe3c8, [1, 1, 1]], [K.s3 + 1.2, 0xf3c9a2, [1, 0.9, 0.84]], [A("s3:pagi") + 0.3, 0xdfe7e2, [1, 1, 1]],
    [A("s3:petang"), 0xdfe7e2, [1, 1, 1]], [A("s3:petang") + 1.6, 0xeb9f72, [1, 0.82, 0.7]], [A("s3:taat"), 0x7a6f96, [0.72, 0.72, 0.9]],
    [A("s3:Alam") + 0.6, 0x7a6f96, [0.74, 0.74, 0.92]], [K.s4 - 0.5, 0xf2cfa8, [1, 0.94, 0.88]], [K.s4 + 0.6, 0xefe3c8, [1, 1, 1]],
    [K.s8 + 2, 0xefe3c8, [1, 1, 1]], [K.end, 0xf2d6ae, [1, 0.95, 0.88]], [K.dur, 0xf2d6ae, [1, 0.95, 0.88]],
  ].map(([t, hx, tn]) => [t, new THREE.Color(hx), tn]);
  const bg = new THREE.Color(), c2 = new THREE.Color();

  // camera: [t, azimuth, elevation, distance, tx, ty, tz]
  const camT = track([
    [0, 44, 15, 118, -7, 1.6, -8],
    [1.5, 42, 14, 104, -6, 1.6, -7],
    [2.75, 24, 8, 21, 0.55, 1.35, 1.05],
    [3.6, 22, 8, 20, 0.55, 1.35, 1.05],
    [4.8, 28, 9, 22, 0.35, 1.3, 1.3],
    [8.6, 36, 11, 28, 0.1, 1.2, 1.5],
    [11.5, 46, 16, 110, -6, 4, -8],
    [15.5, 42, 17, 168, -10, 5, -12],
    [18.6, 40, 17, 172, -10, 5, -12],
    [22.5, 44, 15, 176, -9, 5, -11],
    [26.5, 50, 16, 170, -6, 4.5, -8],
    [29.6, 50, 18, 110, -2.5, 3, -3],
    [31.4, 46, 15, 28, 0.6, 1.75, 1.1],
    [33.2, 42, 13, 22, 0.6, 2.55, 1.0],
    [37.2, 47, 13, 21, 0.6, 2.5, 1.0],
    [38.6, 40, 16, 36, -0.7, 1.9, -0.4],
    [42.2, 45, 15, 30, 0.5, 1.8, 0.8],
    [44.6, 38, 13, 30, 2.4, 1.75, -1.5],
    [47.6, 36, 12, 22, 2.85, 1.85, -2.0],
    [53.2, 48, 12, 23, 2.85, 1.85, -2.0],
    [55.2, 52, 15, 17, -0.05, 0.85, 1.55],
    [63.8, 46, 14, 15, 0.1, 0.8, 1.45],
    [65.2, 40, 10, 12, -1.05, 1.5, 0.35],
    [67.0, 44, 11, 12.5, -0.95, 1.5, 0.35],
    [68.8, 46, 13, 22, -0.15, 1.6, 0.75],
    [74.6, 48, 15, 30, 0.0, 1.7, 0.8],
    [77.5, 45, 25, 130, -2, 3, -2],
    [82.5, 45, 30, 330, -6, 4, -6],
    [89.4, 45, 32, 390, -6, 4, -6],
  ]);

  return (t) => {
    // sky and tint
    let i = 0; while (i < sky.length - 2 && sky[i + 1][0] < t) i++;
    const [t0, ca, ta] = sky[i], [t1, cb, tb] = sky[i + 1], u = sm((t - t0) / Math.max(0.001, t1 - t0));
    bg.copy(ca).lerp(cb, u); scene.background = bg;
    U.uTint.value.setRGB(lerp(ta[0], tb[0], u), lerp(ta[1], tb[1], u), lerp(ta[2], tb[2], u));
    // camera
    const [az, el, d, tx, ty, tz] = camT(t), Az = az * DEG, El = el * DEG;
    cam.position.set(tx + d * Math.cos(El) * Math.sin(Az), ty + d * Math.sin(El), tz + d * Math.cos(El) * Math.cos(Az));
    cam.lookAt(tx, ty, tz); cam.updateMatrixWorld();
    // sun arc during s3, clouds drift
    const su = clamp01((t - K.s3 - 0.4) / (A("s3:taat") - K.s3 - 0.2));
    sun.visible = t > K.s3 - 0.2 && t < K.s4;
    sun.position.set(lerp(-200, 210, su), -180 + 560 * Math.sin(Math.PI * su), SKYZ);
    sun.material.color.setHex(su < 0.2 || su > 0.75 ? 0xf08a4b : 0xf6c35b);
    for (const c of clouds) c.m.position.x = ((c.x + 6 * t + 330) % 660) - 330;
    // forge flicker, bellows
    for (let k = 0; k < flames.length; k++) { const f = 1 + 0.25 * Math.sin(t * 11 + k * 2) + 0.15 * Math.sin(t * 23 + k); flames[k].scale.set(1, f, 1); }
    coalM.uniforms.uEm.value.setRGB(1.1 + 0.25 * Math.sin(t * 5), 0.38 + 0.08 * Math.sin(t * 5), 0.06);
    bel.scale.y = 0.75 + 0.25 * Math.sin(t * 2.4);
    const heat = ramp(t, tBesi - 0.4, tBesi + 0.2) * (1 - ramp(t, tMenj - 0.1, tMenj + 1.0));
    flameM.color.setRGB(2.2 + heat * 1.2, 1.0 + heat * 0.4, 0.25);
    // tongs go to the forge and bring a hot bar back
    const go = ramp(t, tP + 0.9, tP + 2.0) * (1 - ramp(t, tBesi - 0.2, tBesi + 0.55));
    tv.copy(JAW).lerp(FORGE, go); tv.y += 0.5 * Math.sin(Math.PI * go);
    TG.position.copy(tv); TG.rotation.set(0.25, 0.15 * go, 0);
    const jo = 0.08 * (ramp(t, tP + 0.2, tP + 0.5) * (1 - ramp(t, tBesi - 0.4, tBesi - 0.2)));
    tA.rotation.x = -jo; tB.rotation.x = jo;
    // bar: bend profile (s1 clay slump, s4 again, hot bar from the forge that cools and slumps)
    const bend = t < K.s3 + 1 ? back(ramp(t, tLun1 - 0.35, tLun1 + 0.8), 1.2) : t < tBesi - 0.4 ? 0.9 * back(ramp(t, tLun4 - 0.1, tLun4 + 1.0), 1.2) : back(ramp(t, tMenj, tMenj + 1.1), 1.1);
    const vis = t < tP ? 1 : t < tBesi - 0.4 ? 1 - ramp(t, tP + 0.1, tP + 0.8) : ramp(t, tBesi - 0.4, tBesi - 0.25);
    BAR.position.copy(tv); BAR.scale.setScalar(Math.max(0.0001, vis));
    barM.uniforms.uEm.value.setRGB(1.5 * heat, 0.42 * heat, 0.05 * heat);
    barM.uniforms.uC.value.setRGB(lerp(0.17, 0.95, heat), lerp(0.2, 0.35, heat), lerp(0.23, 0.1, heat));
    {
      let y = 0, z = 0;
      for (let k = 0; k < NS; k++) {
        const s = (k + 0.5) * SL, th = bend * 1.75 * sm((s - 0.74) / 0.6) + 0.06 * bend * Math.sin(t * 3 + k);
        const dy = -Math.sin(th) * SL, dz = Math.cos(th) * SL;
        segs[k].position.set(0, y + dy / 2, z + dz / 2); segs[k].rotation.x = th;
        segs[k].scale.set(1 + 0.25 * bend * sm((s - 0.6) / 0.6), 1 - 0.12 * bend * sm((s - 0.6) / 0.6), 1);
        y += dy; z += dz;
      }
    }
    // hammer: works over the anvil, rests on the floor otherwise
    const ww = workW(t), a = pressA(t);
    HM.position.set(lerp(1.62, 1.4, ww), lerp(0.09, 1.38, ww), lerp(1.75, 0.95, ww));
    HM.rotation.set(lerp(Math.PI / 2, 0, ww), lerp(0.5, 0, ww), lerp(0, a, ww));
    // impact burst and hot sparks
    let bs = 0; for (const s of STR) { const p = t - s; if (p >= 0 && p < 0.16) bs = Math.max(bs, 1 - p / 0.16); }
    burst.visible = bs > 0.01 && ww > 0.5; burst.position.set(0.6, 1.24, 0.95); burst.quaternion.copy(cam.quaternion); burst.scale.setScalar(0.4 + 0.8 * (1 - bs)); burst.material.opacity = bs;
    for (let k = 0; k < SP.n; k++) {
      const s = HOT[k % Math.max(1, HOT.length)], p = s !== undefined ? t - s : -1, v = SPV[k];
      if (p > 0 && p < v[3]) SP.pos.set([0.6 + v[0] * p, 1.25 + v[1] * p - 4.9 * p * p, 0.95 + v[2] * p], k * 3); else SP.pos.set([0, -50, 0], k * 3);
    }
    SP.g.attributes.position.needsUpdate = true;
    // bread and steam
    for (let k = 0; k < 3; k++) { const s = back(ramp(t, tMakan + k * 0.18, tMakan + k * 0.18 + 0.35), 1.6); loaves[k].scale.set(s, s * 0.62, s * 0.85).multiplyScalar(1).max(tv2.set(0.0001, 0.0001, 0.0001)); }
    const stA = ramp(t, tMakan + 0.6, tMakan + 1.2) * (0.35 + 0.65 * ramp(t, tMakan6 - 0.3, tMakan6 + 0.4));
    steam.forEach((m, k) => { const ph = (t * 0.45 + k / 3) % 1; m.position.set(-0.25 + (k - 1) * 0.09, 0.74 + ph * 0.4, 2.15); m.quaternion.copy(cam.quaternion); m.material.opacity = stA * Math.sin(Math.PI * ph); });
    // crown glint
    const gl = Math.max(Math.exp(-Math.pow((t - tRaja - 0.2) / 0.3, 2)), Math.exp(-Math.pow((t - tHik - 0.2) / 0.3, 2)), 0.25 * Math.exp(-Math.pow((t - K.s8 - 9.5) / 0.4, 2)));
    glint.visible = gl > 0.02; glint.position.set(-1.15 + 0.12, 1.33 + 0.3, 0.3 + 0.12); glint.quaternion.copy(cam.quaternion); glint.rotation.z = t * 0.8; glint.scale.setScalar(0.4 + gl); glint.material.opacity = gl;
    // diagram: card, rings linking one by one, leader lines, caliper
    const dIn = ramp(t, tP - 0.2, tP + 0.25), dOut = ramp(t, tBesi - 0.15, tBesi + 0.2);
    DG.scale.setScalar(Math.max(0.0001, back(dIn, 1.3) * (1 - dOut)));
    DG.visible = dIn > 0.001 && dOut < 0.999;
    RINGS.forEach((o, k) => {
      const lt = LINK[k] ?? tP + 0.4 + k * 0.24, uu = ramp(t, lt - 0.32, lt);
      o.m.position.set(lerp(o.ex[0], o.fx, uu), lerp(o.ex[1], o.fy, uu), lerp(o.ex[2], 0, uu));
      o.m.rotation.set(lerp(1.2, 0, uu), o.tilt * uu + (1 - uu) * 0.9, 0);
      const fl = Math.exp(-Math.pow((t - lt) / 0.12, 2));
      o.m.material.uniforms.uEm.value.setRGB(0.9 * fl, 0.7 * fl, 0.25 * fl);
      o.ln.material.opacity = 0.75 * (1 - uu);
    });
    const cin = ramp(t, tUkur - 0.6, tUkur - 0.1), cl = ramp(t, tUkur, tUkur + 0.7);
    CAL.position.set(lerp(0.9, 0.36, cin), lerp(0.9, 0.56, cin), 0.08); CAL.visible = cin > 0.01;
    jaw.position.x = lerp(0.35, -0.14, cl);
    // coat rings fly from the diagram onto the stand
    tv2.set(0.6 - 2.8, 2.35, 1.0 + 2.2);
    for (let k = 0; k < NC; k++) {
      const o = CT[k], ti = lerp(tCoat0, tCoat1, o.o), uu = ramp(t, ti, ti + 0.55);
      if (uu <= 0) { fm.makeScale(0, 0, 0); coat.setMatrixAt(k, fm); continue; }
      tv.set(lerp(tv2.x + (hash(k, 1) - 0.5) * 0.6, o.p[0], uu), lerp(tv2.y + (hash(k, 2) - 0.5) * 0.4, o.p[1], uu) + 0.7 * Math.sin(Math.PI * uu), lerp(tv2.z, o.p[2], uu));
      tq.copy(o.q); fm.compose(tv, tq, fs.set(1, 1, 1)); coat.setMatrixAt(k, fm);
    }
    coat.instanceMatrix.needsUpdate = true;
    const sweep = ramp(t, tLind - 0.2, tLind + 1.0);
    coatM.uniforms.uEm.value.setScalar(0.35 * Math.sin(Math.PI * sweep));
    const shs = back(ramp(t, tLind - 0.15, tLind + 0.3), 1.8) * (1 - ramp(t, K.s6 - 0.5, K.s6));
    SH.scale.setScalar(Math.max(0.0001, shs)); SH.visible = shs > 0.001; SH.position.y = 1.75 + 0.04 * Math.sin(t * 2);
    // tasbih contour bands
    const wv = Math.max(ramp(t, 0, 0.3) * (1 - ramp(t, 2.4, 3.4)), ramp(t, A("s2:Wahai") - 0.3, A("s2:Wahai") + 0.6) * (1 - ramp(t, K.s4, K.s4 + 1.2)), 0.45 * ramp(t, K.s8 + 1.5, K.s8 + 3) * (1 - ramp(t, K.outro - 0.4, K.outro)));
    for (const w of WAVE) {
      const uu = (((t * 0.42 + w.k * 0.25 + w.pi * 0.13) % 1) + 1) % 1, y = w.ph * (0.97 - 0.5 * uu), rr = w.R * (1 - Math.pow(y / w.ph, 1 / 1.55)) + 0.35;
      w.m.position.set(w.px, y, w.pz); w.m.scale.set(rr, 0.24, rr); w.m.material.opacity = wv * 0.9 * Math.sin(Math.PI * uu); w.m.visible = wv > 0.01;
    }
    // birds: scattered over the peaks, gathering above the workshop from s3 "berkumpul"
    const gat = ramp(t, A("s3:burung-burung") - 0.3, A("s3:berkumpul") + 1.2);
    for (let k = 0; k < NB; k++) {
      const o = BD[k], a1 = o.ph + o.sp * t, a2 = o.ga + 0.42 * t;
      const g2 = ramp(t, K.s4 - 0.6, K.s4 + 1.4) * (1 - ramp(t, K.s8 + 0.5, K.s8 + 3.5));
      const gx = lerp(-0.5, -9, g2) + Math.cos(a2) * o.gr * (1 + 1.6 * g2), gz = lerp(-0.5, -9, g2) + Math.sin(a2) * o.gr * (1 + 1.6 * g2), gy = o.gy + 7 * g2;
      const x = lerp(o.cx + Math.cos(a1) * o.rad, gx, gat), z = lerp(o.cz + Math.sin(a1) * o.rad, gz, gat), y = lerp(o.cy + 0.6 * Math.sin(t * 0.7 + k), gy + 0.25 * Math.sin(t * 1.3 + k), gat);
      const yaw = lerp(Math.atan2(-Math.sin(a1) * Math.sign(o.sp), Math.cos(a1) * Math.sign(o.sp)), Math.atan2(-Math.sin(a2), Math.cos(a2)), gat);
      const fl = 0.55 * Math.sin(t * o.fs + o.fl);
      tv.set(x, y, z); fs.setScalar(o.s);
      fe.set(0, yaw, 0); tq.setFromEuler(fe);
      fm.compose(tv, tq, fs); bB.setMatrixAt(k, fm);
      tq2.setFromEuler(fe.set(0, 0, fl)); fm.compose(tv, tq.clone().multiply(tq2), fs); bR.setMatrixAt(k, fm);
      tq2.setFromEuler(fe.set(0, 0, -fl)); fe.set(0, yaw, 0); fm.compose(tv, new THREE.Quaternion().setFromEuler(fe).multiply(tq2), fs); bL.setMatrixAt(k, fm);
    }
    bR.instanceMatrix.needsUpdate = bL.instanceMatrix.needsUpdate = bB.instanceMatrix.needsUpdate = true;
    bp.strength = 0.3;
    comp.render();
  };
}
