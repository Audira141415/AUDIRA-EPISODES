// EP18 KERETA CEPAT AMAN. ISOCRAFT: a calm isometric ink-comic diorama of a double-track high-speed line on a paper table.
// True isometric view (orthographic camera), one ink shader for every surface (three flat light bands, faint hatching in the
// dark band), a screen-space back-face hull for the heavy silhouette, thin edge lines inside, flat blue projected shadows.
// Two generic white trains (no operator livery). Beats: braking-distance ruler vs sight cone (s1), a quiet paper map of Spain
// with one pin (s2), block sections that colour themselves from train positions (s3), cab cutaway with a DMI callout,
// balise packets and radio data (s4), a braking-curve wall with a speed puck (s5), data loss -> stop -> slow fallback (s6),
// Whoosh-style hazard sensors (s7), wide diorama (s8). No crash imagery. Calm palette; the only red is the stop marker.
// Every value is a pure function of t (seek-safe). 1 unit is a diorama unit, not metres (the ruler carries a scale break).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, eout, back, canvasTex, track } from "./lib3d.js";

const W = 1080, H = 1920, DEG = Math.PI / 180;
const INK = 0x1c1e21;
const P = { paper: 0xefe9dc, table: 0xe6dfcf, sage: 0xb3c4a4, sageD: 0x93a888, ballast: 0xa4abb3, sleeper: 0xd9d5cc, steel: 0xc3cad2,
  white: 0xf6f5f1, glass: 0x3a4452, teal: 0x5d8f8a, skirt: 0xc9cdd2, soil: 0xb99c7c, sea: 0xa9bfcd, land: 0xf3eee3, port: 0xdcd6c8,
  mint: 0x7fb59a, yellow: 0xf4c430, slate: 0x6b7a90, red: 0xd9473a, cab: 0x4a5560, wood: 0xa8865f, leaf: 0x8fae8a, leafD: 0x6f9478, roof: 0xc98d6e };
const lerp = (a, b, u) => a + (b - a) * u;
const sp = (c, n) => Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
const LX = new THREE.Vector3(0.32, 1, 0.62).normalize(); // light direction (toward the light)

// ---------- ink shaders ----------
const VS = `
attribute vec3 color;
varying vec3 vN; varying vec2 vUv; varying vec3 vC;
uniform float uVC;
void main(){
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
  m = m * instanceMatrix;
  #endif
  vN = normalize(mat3(m) * normal + vec3(1e-6));
  vUv = uv;
  vC = uVC > .5 ? color : vec3(1.);
  #ifdef USE_INSTANCING_COLOR
  vC *= instanceColor;
  #endif
  gl_Position = projectionMatrix * viewMatrix * m * vec4(position, 1.);
}`;
const FS = `
uniform vec3 uC, uL, uTint, uInk, uEm; uniform float uHat, uFlat, uUseMap, uA; uniform sampler2D uMap;
varying vec3 vN; varying vec2 vUv; varying vec3 vC;
void main(){
  vec3 n = normalize(vN + vec3(1e-6)); if(!gl_FrontFacing) n = -n;
  float d = dot(n, uL);
  float b = mix(d > .62 ? 1. : d > .18 ? .86 : .7, 1., uFlat);
  vec3 c = uC * vC;
  if(uUseMap > .5) c *= texture2D(uMap, vUv).rgb;
  c *= b * uTint;
  vec2 f = gl_FragCoord.xy;
  float h1 = 1. - smoothstep(.6, 1.5, mod(f.x + f.y, 7.));
  float hat = d < .18 ? h1 * .22 : 0.;
  c = mix(c, uInk, hat * uHat);
  vec3 o = c + uEm;
  gl_FragColor = vec4(max(o, vec3(0.)), uA);
}`;
// hull: offset along smoothed normals in view space by uPx screen pixels (orthographic: uK = world units per pixel)
const HVS = `attribute vec3 snrm; uniform float uPx, uK;
void main(){
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
  m = m * instanceMatrix;
  #endif
  vec4 mv = viewMatrix * m * vec4(position, 1.);
  vec3 dv = mat3(viewMatrix * m) * snrm;
  float l = length(dv); dv = l > 1e-6 ? dv / l : vec3(0.);
  mv.xyz += dv * uPx * uK;
  gl_Position = projectionMatrix * mv;
}`;
const HFS = `uniform vec3 uInk; uniform float uA; void main(){ gl_FragColor = vec4(uInk, uA); }`;
// flat projected shadow onto plane y=uG along the light direction
const SVS = `uniform vec3 uL; uniform float uG;
void main(){
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
  m = m * instanceMatrix;
  #endif
  vec4 w = m * vec4(position, 1.);
  float k = max(w.y - uG, 0.) / max(uL.y, .05);
  w.xyz -= uL * k; w.y = uG + .004;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const SFS = `uniform vec3 uS; uniform float uA; void main(){ gl_FragColor = vec4(uS, uA); }`;

function smoothNormals(geo) {
  if (geo.attributes.snrm) return geo;
  const p = geo.attributes.position, n = geo.attributes.normal, map = new Map(), out = new Float32Array(p.count * 3);
  const key = (i) => `${Math.round(p.getX(i) * 1e3)},${Math.round(p.getY(i) * 1e3)},${Math.round(p.getZ(i) * 1e3)}`;
  for (let i = 0; i < p.count; i++) { const k = key(i); const a = map.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); map.set(k, a); }
  for (let i = 0; i < p.count; i++) { const a = map.get(key(i)); const l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
  geo.setAttribute("snrm", new THREE.BufferAttribute(out, 3));
  return geo;
}

// monotone cubic position track: keys [t, x, v|null]; null velocities come from the neighbouring secants
function motion(keys) {
  const n = keys.length, v = [];
  for (let i = 0; i < n; i++) {
    if (keys[i][2] !== null && keys[i][2] !== undefined) { v.push(keys[i][2]); continue; }
    const a = i > 0 ? (keys[i][1] - keys[i - 1][1]) / Math.max(1e-3, keys[i][0] - keys[i - 1][0]) : 0;
    const b = i < n - 1 ? (keys[i + 1][1] - keys[i][1]) / Math.max(1e-3, keys[i + 1][0] - keys[i][0]) : 0;
    v.push(a * b <= 0 ? 0 : (2 * a * b) / (a + b));
  }
  const seg = (t) => { let i = 0; while (i < n - 2 && keys[i + 1][0] < t) i++; return i; };
  const x = (t) => {
    if (t <= keys[0][0]) return keys[0][1] + v[0] * (t - keys[0][0]);
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    const i = seg(t), k0 = keys[i], k1 = keys[i + 1], h = Math.max(1e-3, k1[0] - k0[0]), u = (t - k0[0]) / h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * k0[1] + (u3 - 2 * u2 + u) * h * v[i] + (-2 * u3 + 3 * u2) * k1[1] + (u3 - u2) * h * v[i + 1];
  };
  return { x, v: (t) => (x(t + 0.02) - x(t - 0.02)) / 0.04 };
}

// camera keys with monotone (Fritsch-Carlson) tangents per channel: never overshoots a hold, never rests at a key unless held
function mtrack(keys) {
  const n = keys.length, m = keys[0].length;
  const tan = keys.map(() => new Array(m).fill(0));
  for (let j = 1; j < m; j++) for (let i = 0; i < n; i++) {
    const a = i > 0 ? (keys[i][j] - keys[i - 1][j]) / Math.max(1e-3, keys[i][0] - keys[i - 1][0]) : null;
    const b = i < n - 1 ? (keys[i + 1][j] - keys[i][j]) / Math.max(1e-3, keys[i + 1][0] - keys[i][0]) : null;
    tan[i][j] = a === null ? b * 0.5 : b === null ? a * 0.5 : a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  }
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    const out = [];
    for (let j = 1; j < m; j++) out.push((2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]);
    return out;
  };
}

export function create(canvas, K, AT) {
  const s = K;
  const A = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, stencil: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 0.94;
  r.setClearColor(P.table, 1);
  const S = new THREE.Scene();
  S.background = new THREE.Color(P.table);
  const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 900);

  // ---------- anchors ----------
  const E = {
    berhenti1: A("s1:berhenti", s.s1 + 3), bagaimana: A("s1:Bagaimana", s.s1 + 4), terlihat: A("s1:terlihat", s.s1e - 0.5),
    rabu: A("s2:Rabu", s.s2 + 1.5), toledo: A("s2:Toledo", s.s2 + 5), meninggal: A("s2:meninggal", s.s2 + 7), penyebab: A("s2:Penyebabnya", s.s2 + 8), uni: A("s2:Uni", s.s2 + 12),
    sinyal: A("s3:sinyal", s.s3 + 1), jarak: A("s3:jarak", s.s3 + 3.5), blok: A("s3:blok", s.s3 + 7.5), satu: A("s3:satu", s.s3 + 8.5),
    kabin: A("s4:kabin", s.s4 + 1), pemancar: A("s4:Pemancar", s.s4 + 2), balise: A("s4:balise", s.s4 + 3.5), sirkuit: A("s4:sirkuit", s.s4 + 4.5), radio: A("s4:radio", s.s4 + 6), izin: A("s4:izin", s.s4 + 7.5), sejauh: A("s4:sejauh", s.s4 + 8.5), kecepatan: A("s4:kecepatan", s.s4 + 10.5),
    komputer: A("s5:Komputer", s.s5), kurva: A("s5:kurva", s.s5 + 1.2), peringatan: A("s5:peringatan", s.s5 + 5), masih: A("s5:Masih", s.s5 + 6), direm: A("s5:direm", s.s5 + 8), otomatis5: A("s5:otomatis", s.s5 + 8.6),
    mati: A("s6:mati", s.s6 + 1.5), desain: A("s6:Desainnya", s.s6 + 2.2), data: A("s6:data", s.s6 + 4), berhenti6: A("s6:berhenti", s.s6 + 5), lalu: A("s6:Lalu", s.s6 + 6), cadangan: A("s6:cadangan", s.s6 + 7.5), lambat: A("s6:lambat", s.s6 + 9), ketat: A("s6:ketat", s.s6e - 0.5),
    whoosh: A("s7:Whoosh", s.s7), memakai: A("s7:memakai", s.s7 + 1.5), radio7: A("s7:radio", s.s7 + 3.5), sensor: A("s7:Sensor", s.s7 + 5), angin: A("s7:angin", s.s7 + 5.5), hujan: A("s7:hujan", s.s7 + 6), gempa: A("s7:gempa", s.s7 + 6.6), benda: A("s7:benda", s.s7 + 7.4), rem: A("s7:rem", s.s7 + 9),
    berlapis: A("s8:berlapis", s.s8 + 2), turut: A("s8:Turut", s.s8 + 4), korban: A("s8:korban", s.s8 + 5.5),
  };

  // ---------- materials ----------
  const U = { uL: { value: LX.clone() }, uTint: { value: new THREE.Color(1, 1, 1) }, uInk: { value: new THREE.Color(INK) }, uK: { value: 0.02 } };
  const white1 = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white1.needsUpdate = true;
  const ink = (col, o = {}) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Color(col) }, uEm: { value: new THREE.Color(o.em || 0) }, uHat: { value: o.hat ?? 1 }, uFlat: { value: o.flat ?? 0 }, uMap: { value: o.map || white1 }, uUseMap: { value: o.map ? 1 : 0 }, uA: { value: 1 }, uVC: { value: o.vc ? 1 : 0 }, uL: U.uL, uTint: U.uTint, uInk: U.uInk },
      vertexShader: VS, fragmentShader: FS, side: o.side ?? THREE.FrontSide, transparent: !!o.tr,
    });
    return m;
  };
  const HC = {};
  const hullMat = (px) => HC[px] || (HC[px] = new THREE.ShaderMaterial({ uniforms: { uPx: { value: px }, uK: U.uK, uInk: U.uInk, uA: { value: 1 } }, vertexShader: HVS, fragmentShader: HFS, side: THREE.BackSide }));
  const LINE = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.75 });
  // flat shadows: stencil so overlapping shadow triangles never double-darken
  const shadowMat = (g, col = 0x7a9bb8, a = 0.34) => new THREE.ShaderMaterial({
    uniforms: { uL: U.uL, uG: { value: g }, uS: { value: new THREE.Color(col) }, uA: { value: a } }, vertexShader: SVS, fragmentShader: SFS,
    transparent: true, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  });
  const SH = { board: shadowMat(0.002), ballast: shadowMat(0.385), table: shadowMat(-1.598) };
  function part(geo, mat, parent, x = 0, y = 0, z = 0, o = {}) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (o.ol !== 0) { smoothNormals(geo); const h = new THREE.Mesh(geo, hullMat(o.ol ?? 3)); h.name = "hull"; m.add(h); }
    if (o.edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, o.ea || 30), LINE));
    if (o.sh) { const sm = new THREE.Mesh(geo, SH[o.sh]); sm.name = "shadow"; m.add(sm); }
    if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz;
    (parent || S).add(m); return m;
  }
  // rounded box (extruded rounded rectangle with bevel): no raw boxes on hard-surface objects
  const RB = (w, h, d, rad = 0.04) => {
    const sh = new THREE.Shape(), x = -w / 2 + rad, y = -h / 2 + rad, ww = w - 2 * rad, hh = h - 2 * rad, rr = rad * 0.6;
    sh.moveTo(x + rr, y); sh.lineTo(x + ww - rr, y); sh.quadraticCurveTo(x + ww, y, x + ww, y + rr); sh.lineTo(x + ww, y + hh - rr); sh.quadraticCurveTo(x + ww, y + hh, x + ww - rr, y + hh);
    sh.lineTo(x + rr, y + hh); sh.quadraticCurveTo(x, y + hh, x, y + hh - rr); sh.lineTo(x, y + rr); sh.quadraticCurveTo(x, y, x + rr, y);
    const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, d - 2 * rad), bevelEnabled: true, bevelThickness: rad, bevelSize: rad * 0.98, bevelSegments: 2, curveSegments: 4 });
    g.translate(0, 0, -(d - 2 * rad) / 2); g.computeVertexNormals(); return g;
  };
  const CY = (a, b, h, seg = 12) => new THREE.CylinderGeometry(a, b, h, seg);

  // ---------- table + board ----------
  const paperTex = canvasTex(512, 512, (c, w) => {
    c.fillStyle = "#fff"; c.fillRect(0, 0, w, w); const R = mulberry(18);
    for (let i = 0; i < 2600; i++) { c.fillStyle = R() > 0.5 ? "rgba(120,100,70,.05)" : "rgba(255,255,255,.4)"; c.fillRect(R() * w, R() * w, 1 + R() * 2, 1 + R() * 2); }
    c.fillStyle = "rgba(28,30,33,.10)"; for (let x = 16; x < w; x += 32) for (let y = 16; y < w; y += 32) c.fillRect(x, y, 2, 2);
  }, [60, 60]);
  part(new THREE.PlaneGeometry(700, 700).rotateX(-Math.PI / 2), ink(P.table, { map: paperTex, flat: 1, hat: 0 }), S, 0, -1.6, 0, { ol: 0 });
  const BX0 = -106, BX1 = 118, BZ = 4.3, BL = BX1 - BX0, BC = (BX0 + BX1) / 2;
  const strataTex = canvasTex(64, 256, (c, w, h) => {
    const cols = ["#d2b894", "#c4a582", "#dcc6a5", "#b8987a", "#cfb491"]; const R = mulberry(4); let y = 30, k = 0;
    c.fillStyle = "#93a888"; c.fillRect(0, 0, w, 30); c.fillStyle = "#1c1e21"; c.fillRect(0, 28, w, 3);
    while (y < h) { const bh = 24 + R() * 46; c.fillStyle = cols[k++ % cols.length]; c.fillRect(0, y, w, bh); c.fillStyle = "rgba(28,30,33,.45)"; c.fillRect(0, y, w, 2); y += bh; }
  });
  { // board slab (cutaway strata on the sides) + grass top
    const g = new THREE.BoxGeometry(BL, 1.6, BZ * 2);
    const side = ink(0xffffff, { map: strataTex, hat: 0.5 }), top = ink(P.sage, { hat: 0.4 });
    const m = part(g, [side, side, top, side, side, side], S, BC, -0.8, 0, { ol: 3.2 });
    // shoulders texture lines (grass tufts drawn as small darker dashes)
    const tuftTex = canvasTex(512, 64, (c, w, h) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); const R = mulberry(9); for (let i = 0; i < 140; i++) { c.fillStyle = "rgba(60,90,60,.22)"; const x = R() * w, y = R() * h; c.fillRect(x, y, 6 + R() * 10, 2); } }, [40, 1]);
    part(new THREE.PlaneGeometry(BL, BZ * 2 - 0.2).rotateX(-Math.PI / 2), ink(P.sage, { map: tuftTex, hat: 0.3 }), S, BC, 0.003, 0, { ol: 0 });
  }
  // ballast bed (trapezoid prism) for both tracks
  {
    const sh = new THREE.Shape(); sh.moveTo(-2.9, 0); sh.lineTo(2.9, 0); sh.lineTo(2.45, 0.3); sh.lineTo(-2.45, 0.3); sh.lineTo(-2.9, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: BL - 0.6, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(BX0 + 0.3, 0, 0); g.computeVertexNormals();
    const balTex = canvasTex(256, 256, (c, w) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, w); const R = mulberry(12); for (let i = 0; i < 1500; i++) { c.fillStyle = R() > 0.5 ? "rgba(40,45,52,.16)" : "rgba(255,255,255,.5)"; c.beginPath(); c.arc(R() * w, R() * w, 1 + R() * 2.2, 0, 7); c.fill(); } }, [1, 1]);
    balTex.wrapS = balTex.wrapT = THREE.RepeatWrapping; balTex.repeat.set(0.3, 0.3);
    part(g, ink(P.ballast, { map: balTex, hat: 0.6 }), S, 0, 0, 0, { ol: 2.4 });
  }
  const TZ1 = 1.2, TZ2 = -1.2, RAILY = 0.42;
  // sleepers (instanced) + rails
  {
    const NPer = Math.floor((BL - 1.2) / 0.62), N = NPer * 2, g = RB(0.22, 0.08, 1.9, 0.02);
    const m = new THREE.InstancedMesh(g, ink(P.sleeper, { hat: 0.3 }), N), d = new THREE.Object3D();
    let i = 0; for (const tz of [TZ1, TZ2]) for (let k = 0; k < NPer; k++) { d.position.set(BX0 + 0.9 + k * 0.62, 0.34, tz); d.updateMatrix(); m.setMatrixAt(i++, d.matrix); }
    S.add(m);
    const railG = new THREE.BoxGeometry(BL - 1.0, 0.1, 0.07), railM = ink(P.steel, { hat: 0 });
    for (const tz of [TZ1, TZ2]) for (const o of [-0.72, 0.72]) part(railG, railM, S, BC, RAILY - 0.05, tz + o, { ol: 1.6 });
  }

  // ---------- trees and toy houses on the table (seeded), clear of the map tile ----------
  {
    const R = mulberry(1818), coneG = new THREE.ConeGeometry(0.7, 1.7, 7), trunkG = CY(0.12, 0.14, 0.5, 6), houseG = RB(1.4, 1.0, 1.1, 0.05);
    const roofG = new THREE.CylinderGeometry(0.0, 0.92, 0.7, 4, 1); roofG.rotateY(Math.PI / 4);
    const leafM = ink(P.leaf), leafM2 = ink(P.leafD), trunkM = ink(P.wood), houseM = ink(0xf1ebe0), roofM = ink(P.roof);
    for (let i = 0; i < 140; i++) {
      const x = BX0 + R() * BL, side = R() > 0.5 ? 1 : -1, z = side * (6.5 + R() * 20);
      if (Math.abs(x + 40) < 12 && z < -6 && z > -26) continue;
      const big = 0.45 + R() * 0.4;
      if (R() > 0.86) {
        const h = part(houseG, houseM, S, x, -1.1, z, { ol: 2.4, sh: "table", ry: R() * 0.6 }); h.scale.setScalar(0.7); h.position.y = -1.25;
        part(roofG, roofM, h, 0, 0.85, 0, { ol: 2.4, sh: "table" });
      } else {
        const t = new THREE.Group(); t.position.set(x, -1.6, z); t.scale.setScalar(big); S.add(t);
        part(trunkG, trunkM, t, 0, 0.25, 0, { ol: 2, sh: "table" });
        part(coneG, R() > 0.5 ? leafM : leafM2, t, 0, 1.25, 0, { ol: 2.6, sh: "table" });
      }
    }
    // a few trees on the board shoulders
    for (let i = 0; i < 26; i++) { const x = BX0 + 4 + R() * (BL - 8), z = R() > 0.5 ? 4.0 : -4.0; if (((x + 102) % 12 + 12) % 12 < 1.5 || ((x + 102) % 12 + 12) % 12 > 10.5 || (x > 5 && x < 16) || (x > 70 && x < 100)) continue; const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(0.38 + R() * 0.12); S.add(t); part(trunkG, trunkM, t, 0, 0.25, 0, { ol: 1.5, sh: "board" }); part(coneG, leafM, t, 0, 1.25, 0, { ol: 2, sh: "board" }); }
  }

  // ---------- catenary masts (back side) ----------
  {
    const mastG = CY(0.07, 0.09, 3.0, 8), armG = new THREE.BoxGeometry(0.06, 0.06, 3.4), mastM = ink(0x9aa2ab, { hat: 0.3 });
    for (let x = BX0 + 4; x < BX1 - 2; x += 9) { const m = part(mastG, mastM, S, x, 1.5, -3.25, { ol: 1.6, sh: "board" }); part(armG, mastM, m, 0, 1.25, 1.7, { ol: 1.4 }); }
    const wireG = CY(0.012, 0.012, BL - 6, 4); wireG.rotateZ(Math.PI / 2);
    for (const tz of [TZ1, TZ2]) part(wireG, new THREE.MeshBasicMaterial({ color: 0x3a3d42 }), S, BC, 2.72, tz, { ol: 0 });
  }

  // ---------- trains ----------
  const TL_ = 7.6;
  function carGeo(len, noseBack, noseFront) {
    const NU = 56, NV = 40, NL = 1.45;
    const pos = [], col = [], idx = [], uv = [];
    const cW = new THREE.Color(P.white), cG = new THREE.Color(P.glass), cT = new THREE.Color(P.teal), cS = new THREE.Color(P.skirt), tmp = new THREE.Color();
    for (let i = 0; i <= NU; i++) {
      const u = i / NU, x = -len / 2 + u * len;
      let sN = 0;
      if (noseFront && x > len / 2 - NL) sN = (x - (len / 2 - NL)) / NL;
      if (noseBack && x < -len / 2 + NL) sN = (-len / 2 + NL - x) / NL;
      const wf = Math.max(0.05, Math.pow(1 - Math.pow(sN, 2.3), 0.5) * (1 - 0.15 * sN));
      const top = 0.56 + 0.88 * Math.max(0.03, Math.pow(1 - Math.pow(sN, 1.6), 0.62));
      const bot = 0.5 + 0.08 * sN;
      for (let j = 0; j <= NV; j++) {
        const a = (j / NV) * Math.PI * 2, mid = (top + bot) / 2, hh = Math.max(0.02, (top - bot) / 2);
        const y = mid + hh * sp(Math.sin(a), 3.0), z = 0.44 * wf * sp(Math.cos(a), 3.4);
        pos.push(x, y, z); uv.push(u, j / NV);
        const rel = (y - bot) / Math.max(0.05, top - bot);
        let c = cW;
        if (y < 0.63) c = cS;
        else if (y > 0.8 && y < 0.86 && sN < 0.55) c = cT;
        if (sN < 0.08 && y > 1.06 && y < 1.25) c = cG;
        if (sN > 0.12 && sN < 0.62 && rel > 0.62 && Math.abs(z) > 0.0) c = cG;
        tmp.copy(c); col.push(tmp.r, tmp.g, tmp.b);
      }
    }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const endG = carGeo(2.62, false, true), midG = carGeo(2.3, false, false);
  const bodyM = ink(0xffffff, { vc: true, hat: 0.5 });
  const darkM = ink(0x4a5058, { hat: 0.2 });
  function makeTrain(cut) {
    const g = new THREE.Group(); S.add(g);
    const shellM = cut ? ink(0xffffff, { vc: true, hat: 0.5, tr: true }) : bodyM;
    const c2 = part(endG, shellM, g, -1.31, 0, 0, { ol: 3, sh: "ballast", edges: false });
    const c1 = part(midG, bodyM, g, -3.8, 0, 0, { ol: 3, sh: "ballast" });
    const c0 = part(endG, bodyM, g, -6.29, 0, 0, { ol: 3, sh: "ballast", ry: Math.PI });
    for (const x of [-2.62, -4.97]) part(RB(0.12, 0.8, 0.7, 0.03), darkM, g, x, 0.95, 0, { ol: 1.6 });
    for (const x of [-0.9, -2.0, -3.1, -4.5, -5.6, -6.8]) part(RB(0.7, 0.16, 0.66, 0.03), darkM, g, x, 0.46, 0, { ol: 0 });
    // pantograph on the middle car
    const pg = new THREE.Group(); pg.position.set(-3.6, 1.44, 0); g.add(pg);
    const rodG = CY(0.015, 0.015, 0.9, 5);
    const r1 = part(rodG, darkM, pg, -0.18, 0.4, 0, { ol: 0, rz: 0.75 }); const r2 = part(rodG, darkM, pg, 0.18, 0.4, 0, { ol: 0, rz: -0.75 });
    part(new THREE.BoxGeometry(0.06, 0.03, 0.8), darkM, pg, 0, 0.74, 0, { ol: 0 });
    g.userData = { shellM, c2 };
    return g;
  }
  const trA = makeTrain(true), trB = makeTrain(false);
  trA.position.z = TZ1; trB.position.z = TZ1;
  // cab interior of train A (seen through the see-through shell)
  const cabG = new THREE.Group(); trA.add(cabG);
  {
    part(RB(0.5, 0.32, 0.7, 0.04), ink(P.cab), cabG, -0.95, 0.78, 0, { ol: 2 });
    part(RB(0.3, 0.42, 0.34, 0.05), ink(0x5d8f8a), cabG, -1.5, 0.82, 0, { ol: 2 });
    part(RB(0.12, 0.5, 0.34, 0.04), ink(0x5d8f8a), cabG, -1.68, 1.05, 0, { ol: 2 });
  }
  const screenM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.0, 1.2), toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.22), screenM); screen.position.set(-1.02, 1.0, 0); screen.rotation.set(0, -Math.PI / 2, 0); screen.rotation.order = "YXZ"; screen.rotation.x = -0.6; cabG.add(screen);

  // ---------- precomputed motion ----------
  const XA0 = -48 - 5 * s.s2;
  const mA = motion([
    [0, XA0, 5], [s.s2, -48, 5], [s.s3 - 0.4, 6, 0], [s.s4 + 0.7, 6, 0], [s.s5, 13, null], [E.peringatan, 21.5, null], [E.direm, 24.6, null], [E.direm + 2.4, 28, 0],
    [s.s6 + 1.2, 28, 0], [E.data, 33, null], [E.berhenti6 + 0.7, 37, 0], [E.lalu, 37, 0], [s.s7, 37 + 0.45 * Math.max(0.5, s.s7 - E.lalu), null], [s.s7 + 3, 37 + 0.45 * Math.max(0.5, s.s7 - E.lalu) + 0.8, 0],
  ]);
  const xb7 = 56 + 0.45 * Math.max(0.5, s.s7 - E.lalu);
  const mB = motion([
    [0, 41, 0], [s.s6 + 0.3, 41, 0], [E.data, 50, null], [E.berhenti6 + 0.7, 56, 0], [E.lalu, 56, 0], [s.s7, xb7, null], [E.sensor, xb7 + 9, null], [E.rem, 91, null], [Math.max(E.rem + 2.6, s.s7e), 97, 0],
  ]);
  // balises (yellow, between the rails of track 1) and when train A's antenna passes each one
  const BAL = []; for (let x = -100; x < 112; x += 6) BAL.push(x + 3);
  const ANT = -1.0;
  const passA = BAL.map((bx) => { for (let t = 0; t < s.dur; t += 0.01) if (mA.x(t) + ANT >= bx) return t; return 1e9; });
  const passB = BAL.map((bx) => { for (let t = 0; t < s.dur; t += 0.01) if (mB.x(t) + ANT >= bx) return t; return 1e9; });
  const balM = ink(P.yellow, { hat: 0, em: 0x000000 });
  const balG = RB(0.4, 0.07, 0.5, 0.02);
  const balMesh = new THREE.InstancedMesh(balG, balM, BAL.length); smoothNormals(balG);
  { const d = new THREE.Object3D(); BAL.forEach((bx, i) => { d.position.set(bx, 0.39, TZ1); d.updateMatrix(); balMesh.setMatrixAt(i, d.matrix); }); S.add(balMesh); const h = new THREE.InstancedMesh(balG, hullMat(1.8), BAL.length); h.instanceMatrix = balMesh.instanceMatrix; S.add(h); }
  // data packets (little envelopes) that jump from a balise into the train
  const NPK = 6, pkG = RB(0.34, 0.22, 0.06, 0.02);
  const pkTex = canvasTex(128, 96, (c, w, h) => { c.fillStyle = "#fffaf0"; c.fillRect(0, 0, w, h); c.strokeStyle = "#1c1e21"; c.lineWidth = 7; c.strokeRect(4, 4, w - 8, h - 8); c.beginPath(); c.moveTo(6, 8); c.lineTo(w / 2, h * 0.6); c.lineTo(w - 6, 8); c.stroke(); c.fillStyle = "#f4c430"; c.fillRect(8, h - 26, w - 16, 14); });
  const pkM = new THREE.MeshBasicMaterial({ map: pkTex, transparent: true });
  const packets = []; for (let i = 0; i < NPK; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), pkM); m.renderOrder = 5; S.add(m); packets.push(m); }

  // ---------- block sections (beside track 1) + signals ----------
  const BB = []; for (let b = -102; b < 114; b += 12) BB.push(b);
  const blockG = new THREE.BoxGeometry(11.6, 0.14, 0.75);
  const blockM = ink(0xffffff, { hat: 0, flat: 0.4 });
  const blocks = new THREE.InstancedMesh(blockG, blockM, BB.length); blocks.frustumCulled = false;
  { const d = new THREE.Object3D(), c = new THREE.Color(P.mint); BB.forEach((b, i) => { d.position.set(b + 6, 0.33, 3.2); d.updateMatrix(); blocks.setMatrixAt(i, d.matrix); blocks.setColorAt(i, c); }); S.add(blocks); }
  const cMint = new THREE.Color(P.mint), cYel = new THREE.Color(P.yellow), cSla = new THREE.Color(P.slate), cOff = new THREE.Color(0xd9d5cc);
  const sigs = [];
  {
    const postG = CY(0.05, 0.06, 1.5, 8), headG = RB(0.34, 0.5, 0.26, 0.06), lampG = new THREE.SphereGeometry(0.1, 14, 10), postM = ink(0x8d949c);
    for (const b of BB) {
      const g = new THREE.Group(); g.position.set(b, 0, 3.75); S.add(g);
      part(postG, postM, g, 0, 0.75, 0, { ol: 1.6, sh: "board" });
      part(headG, ink(0x2c3036), g, 0, 1.6, 0, { ol: 2, sh: "board" });
      const lm = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }); const lamp = new THREE.Mesh(lampG, lm); lamp.position.set(0.05, 1.66, 0.12); g.add(lamp);
      sigs.push({ g, lm, b });
    }
  }
  // the one red element: the stop marker at the end of the movement authority
  const stopG = new THREE.Group(); S.add(stopG);
  {
    part(CY(0.05, 0.05, 1.9, 8), ink(0x8d949c), stopG, 0, 0.95, 0, { ol: 1.6, sh: "board" });
    const flagTex = canvasTex(256, 160, (c, w, h) => { c.fillStyle = "#d9473a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.fillRect(0, h * 0.4, w, h * 0.2); });
    part(RB(0.9, 0.56, 0.06, 0.02), ink(0xffffff, { map: flagTex, hat: 0, flat: 0.5 }), stopG, 0.45, 1.6, 0, { ol: 2.4 });
    const lm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 0.5, 0.35), toneMapped: false });
    const lp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), lm); lp.position.set(0, 2.0, 0); stopG.add(lp);
  }
  // braking-distance ruler + sight cone (anchored to train A's nose)
  const rulerG = new THREE.Group(); S.add(rulerG);
  const RLEN = 60;
  {
    const rTex = canvasTex(2048, 64, (c, w, h) => {
      c.fillStyle = "#fffaf0"; c.fillRect(0, 0, w, h);
      for (let k = 0; k < 10; k++) { if (k % 2) { c.fillStyle = "#f4c430"; c.fillRect((k * w) / 10, 0, w / 10, h); } }
      c.fillStyle = "#1c1e21"; for (let k = 0; k <= 100; k++) { const x = (k * w) / 100; c.fillRect(Math.min(w - 4, x), 0, 3, k % 10 ? 18 : 40); }
      c.fillStyle = "#efe9dc"; c.fillRect(w * 0.47, 0, w * 0.06, h);
      c.strokeStyle = "#1c1e21"; c.lineWidth = 6; for (const x0 of [w * 0.47, w * 0.53]) { c.beginPath(); c.moveTo(x0 - 10, h); c.lineTo(x0 + 10, 0); c.stroke(); }
    });
    part(RB(RLEN, 0.1, 0.55, 0.03), ink(0xfffaf0, { hat: 0, flat: 0.3 }), rulerG, RLEN / 2, 0.36, 0, { ol: 2.4 });
    // the ruler's UVs on the top face: map the long box top via a separate plane for crisp texture
    const top = new THREE.Mesh(new THREE.PlaneGeometry(RLEN, 0.5).rotateX(-Math.PI / 2), ink(0xffffff, { map: rTex, hat: 0, flat: 1 })); top.position.set(RLEN / 2, 0.415, 0); rulerG.add(top);
  }
  const coneM = new THREE.MeshBasicMaterial({ color: 0xf4c430, transparent: true, opacity: 0.38, depthWrite: false });
  const coneG = new THREE.BufferGeometry(); coneG.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.5, 7, 0, -1.6, 7, 0, 1.6, 0, 0, -0.5, 7, 0, 1.6, 0, 0, 0.5], 3)); coneG.computeVertexNormals();
  const sight = new THREE.Mesh(coneG, coneM); sight.renderOrder = 3; S.add(sight);
  const sightEdge = new THREE.LineSegments(new THREE.EdgesGeometry(coneG), new THREE.LineDashedMaterial({ color: INK, dashSize: 0.3, gapSize: 0.2 })); sightEdge.computeLineDistances(); sight.add(sightEdge);

  // ---------- radio masts ----------
  const masts = [];
  function makeMast(x) {
    const g = new THREE.Group(); g.position.set(x, 0, -3.35); S.add(g);
    const lm = ink(0xb8bec6, { hat: 0.3 });
    for (const [dx, dz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) { const leg = part(CY(0.03, 0.04, 5.4, 6), lm, g, dx * 0.6, 2.7, dz * 0.6, { ol: 1.4, sh: "board" }); leg.rotation.set(dz * 0.06, 0, -dx * 0.06); }
    for (let k = 0; k < 6; k++) part(new THREE.TorusGeometry(0.2 - k * 0.015, 0.018, 4, 4), lm, g, 0, 0.6 + k * 0.85, 0, { ol: 0, rx: Math.PI / 2, rz: Math.PI / 4 });
    part(RB(0.5, 0.7, 0.18, 0.04), ink(0xf1ebe0), g, 0, 5.0, 0.18, { ol: 2 });
    const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.1, 0.8), toneMapped: false });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), lampM); lamp.position.set(0, 5.55, 0); g.add(lamp);
    const rings = []; const rm = new THREE.MeshBasicMaterial({ color: 0xf4c430, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide });
    for (let k = 0; k < 3; k++) { const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 48), rm.clone()); ring.rotation.x = -Math.PI / 2; ring.position.y = 5.1; g.add(ring); rings.push(ring); }
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.2, 0.6), toneMapped: false }), 10); dots.frustumCulled = false; S.add(dots);
    const o = { g, lampM, rings, dots, x }; masts.push(o); return o;
  }
  const mast1 = makeMast(15), mast2 = makeMast(72);

  // relay cabinet with the AUDIRA plate (front shoulder)
  {
    const t = canvasTex(512, 320, (c, w, h) => {
      c.fillStyle = "#e9e4d6"; c.fillRect(0, 0, w, h); c.strokeStyle = "#1c1e21"; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
      c.fillStyle = "#1c1e21"; c.fillRect(0, 0, w, 96); c.fillStyle = "#f4c430"; c.font = "900 76px Arial"; c.textBaseline = "middle"; c.fillText("AUDIRA", 28, 52);
      c.fillStyle = "#1c1e21"; c.font = "700 46px Arial"; c.fillText("RUMAH SINYAL", 30, 150); c.font = "600 40px Arial"; c.fillText("BLOK 08  ·  ATP", 30, 214);
      c.fillStyle = "#7fb59a"; c.beginPath(); c.arc(w - 70, 250, 22, 0, 7); c.fill(); c.fillStyle = "#f4c430"; c.beginPath(); c.arc(w - 130, 250, 22, 0, 7); c.fill();
    });
    const m = part(RB(1.8, 1.25, 0.8, 0.06), ink(0x8fa39a, { hat: 0.4 }), S, 10.5, 0.63, 3.85, { ol: 2.8, sh: "board", edges: true });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.94), ink(0xffffff, { map: t, hat: 0, flat: 1 })); plate.position.set(0, 0.02, 0.41); m.add(plate);
    part(RB(2.0, 0.12, 1.0, 0.03), ink(0x5f6f6a), m, 0, 0.66, 0, { ol: 1.8 });
  }

  // ---------- braking-curve wall (s5) ----------
  const XS = 30, DC = 15, HC_ = 2.5, BASEY = 1.75;
  const curveH = (x) => HC_ * Math.sqrt(clamp01((XS - x) / DC));
  const curveG = new THREE.Group(); curveG.position.z = TZ1; S.add(curveG);
  {
    const pos = [], top = [];
    for (let i = 0; i <= 120; i++) { const x = XS - DC - 9 + (i / 120) * (DC + 9); const h = curveH(x); pos.push(x, BASEY, 0, x, BASEY + h, 0); top.push(new THREE.Vector3(x, BASEY + h, 0)); }
    const idx = []; for (let i = 0; i < 120; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); fg.setIndex(idx);
    const fill = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x7fb59a, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false })); fill.renderOrder = 4; curveG.add(fill);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(top), 160, 0.09, 6), new THREE.MeshBasicMaterial({ color: 0x24533f })); curveG.add(tube);
    const base = new THREE.Mesh(CY(0.03, 0.03, DC + 10, 5).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: INK })); base.position.set(XS - (DC + 9) / 2 + 0.5, BASEY, 0); curveG.add(base);
  }
  const puck = new THREE.Group(); S.add(puck);
  const puckM = ink(P.mint, { hat: 0, flat: 0.5 });
  const puckBall = part(new THREE.SphereGeometry(0.2, 18, 12), puckM, puck, 0, 0, 0, { ol: 2.4 });
  const stick = new THREE.Mesh(CY(0.02, 0.02, 1, 5).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: INK })); puck.add(stick);

  // ---------- hazard sensors (s7) ----------
  const SX = { wind: 79, rain: 84, quake: 89, obj: 94.5 };
  const sens = {};
  {
    const g = new THREE.Group(); g.position.set(SX.wind, 0, -3.0); S.add(g);
    part(CY(0.05, 0.06, 3.4, 8), ink(0x9aa2ab), g, 0, 1.7, 0, { ol: 1.6, sh: "board" });
    const head = new THREE.Group(); head.position.y = 3.45; g.add(head);
    for (let k = 0; k < 3; k++) { const arm = new THREE.Group(); arm.rotation.y = (k * 2 * Math.PI) / 3; head.add(arm); part(CY(0.015, 0.015, 0.5, 4).rotateZ(Math.PI / 2), ink(0x6a7078), arm, 0.25, 0, 0, { ol: 0 }); part(new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI), ink(P.yellow), arm, 0.5, 0, 0, { ol: 1.6, ry: Math.PI / 2 }); }
    const vane = part(new THREE.ConeGeometry(0.12, 0.6, 6).rotateZ(-Math.PI / 2), ink(0xf1ebe0), g, 0, 3.05, 0, { ol: 1.6 });
    sens.wind = { g, head };
  }
  {
    const g = new THREE.Group(); g.position.set(SX.rain, 0, 3.85); S.add(g);
    part(CY(0.04, 0.05, 1.0, 8), ink(0x9aa2ab), g, 0, 0.5, 0, { ol: 1.4, sh: "board" });
    part(CY(0.26, 0.2, 0.55, 18), ink(0xd7dde2), g, 0, 1.25, 0, { ol: 2.2, sh: "board", edges: true });
    part(CY(0.3, 0.26, 0.08, 18), ink(0x6a7078), g, 0, 1.55, 0, { ol: 1.6 });
    const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6).scale(1, 1.8, 1), new THREE.MeshBasicMaterial({ color: 0x5f8fb3 }), 12); drops.frustumCulled = false; g.add(drops);
    sens.rain = { g, drops };
  }
  const quakeCanvas = document.createElement("canvas"); quakeCanvas.width = 256; quakeCanvas.height = 128;
  const quakeTex = new THREE.CanvasTexture(quakeCanvas); quakeTex.colorSpace = THREE.SRGBColorSpace;
  {
    const g = new THREE.Group(); g.position.set(SX.quake, 0, 3.85); S.add(g);
    part(RB(0.9, 0.7, 0.6, 0.06), ink(0xc9b79a), g, 0, 0.35, 0, { ol: 2.4, sh: "board", edges: true });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.33), new THREE.MeshBasicMaterial({ map: quakeTex, toneMapped: false })); scr.position.set(0, 0.42, 0.31); g.add(scr);
    const rings = []; for (let k = 0; k < 3; k++) { const rm = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.0, 64), new THREE.MeshBasicMaterial({ color: 0x1c1e21, transparent: true, opacity: 0.5, depthWrite: false })); rm.rotation.x = -Math.PI / 2; rm.position.y = 0.02; g.add(rm); rings.push(rm); }
    sens.quake = { g, rings };
  }
  {
    const g = new THREE.Group(); g.position.set(SX.obj, 0, 0); S.add(g);
    for (const z of [2.75, -2.75]) { part(CY(0.06, 0.07, 1.2, 8), ink(0x9aa2ab), g, 0, 0.6, z, { ol: 1.6, sh: "board" }); part(RB(0.22, 0.3, 0.22, 0.04), ink(P.yellow), g, 0, 1.15, z, { ol: 1.8 }); }
    const beamM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.9, 0.5), toneMapped: false, transparent: true, opacity: 0.9 });
    const beam = new THREE.Mesh(CY(0.025, 0.025, 5.5, 6).rotateX(Math.PI / 2), beamM); beam.position.y = 1.15; g.add(beam);
    sens.obj = { g, beamM };
  }

  // ---------- paper map of Spain (s2) ----------
  const mapG = new THREE.Group(); mapG.position.set(-40, -1.6, -16.5); S.add(mapG);
  const ES = [[-9.3, 43.0], [-8.0, 43.7], [-7.0, 43.55], [-5.8, 43.6], [-4.5, 43.4], [-3.0, 43.4], [-1.8, 43.35], [-1.4, 43.0], [0.0, 42.7], [0.7, 42.8], [1.7, 42.5], [3.2, 42.4], [3.2, 41.9], [2.2, 41.4], [0.9, 41.0], [0.5, 40.6], [-0.3, 39.5], [0.2, 38.8], [-0.5, 38.3], [-0.8, 37.6], [-1.6, 37.0], [-2.1, 36.7], [-3.0, 36.75], [-4.4, 36.7], [-5.3, 36.1], [-5.6, 36.0], [-6.2, 36.4], [-6.4, 36.8], [-7.4, 37.2], [-7.5, 37.6], [-7.0, 38.2], [-7.3, 38.5], [-7.0, 39.0], [-7.5, 39.6], [-6.9, 40.2], [-6.8, 41.0], [-6.2, 41.6], [-6.6, 41.95], [-8.2, 41.9], [-8.9, 41.9], [-8.8, 42.5]];
  const PT = [[-7.4, 37.2], [-8.9, 37.0], [-8.8, 38.7], [-9.5, 38.8], [-9.0, 40.0], [-8.7, 41.0], [-8.9, 41.9], [-8.2, 41.9], [-6.6, 41.95], [-6.2, 41.6], [-6.8, 41.0], [-6.9, 40.2], [-7.5, 39.6], [-7.0, 39.0], [-7.3, 38.5], [-7.0, 38.2], [-7.5, 37.6]];
  const MX = (lon) => (lon + 3.4) * 1.1, MZ = (lat) => -(lat - 40.0) * 1.43;
  const shp = (pts) => { const sh = new THREE.Shape(); pts.forEach(([lo, la], i) => (i ? sh.lineTo(MX(lo), -MZ(la)) : sh.moveTo(MX(lo), -MZ(la)))); return sh; };
  {
    part(RB(17, 0.3, 14, 0.06), ink(P.sea, { hat: 0.3 }), mapG, 0, 0.15, 0, { ol: 3, sh: "table" });
    const eg = new THREE.ExtrudeGeometry(shp(ES), { depth: 0.32, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1 }); eg.rotateX(-Math.PI / 2); eg.computeVertexNormals();
    part(eg, ink(P.land, { hat: 0.3 }), mapG, 0, 0.3, 0, { ol: 2.6 });
    const pg = new THREE.ExtrudeGeometry(shp(PT), { depth: 0.12, bevelEnabled: false }); pg.rotateX(-Math.PI / 2); pg.computeVertexNormals();
    part(pg, ink(P.port, { hat: 0.3 }), mapG, 0, 0.3, 0, { ol: 1.8 });
  }
  const pin = new THREE.Group(); mapG.add(pin); pin.position.set(MX(-3.75), 0.62, MZ(39.45));
  part(CY(0.05, 0.012, 2.0, 8), ink(0x3a3d42), pin, 0, 1.0, 0, { ol: 1.6 });
  part(new THREE.SphereGeometry(0.42, 18, 12), ink(0x2a2d31, { hat: 0 }), pin, 0, 2.1, 0, { ol: 2.4 });
  const pinRing = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.58, 48), new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.6, depthWrite: false })); pinRing.rotation.x = -Math.PI / 2; pinRing.position.set(MX(-3.75), 0.64, MZ(39.45)); mapG.add(pinRing);

  // ---------- comic tags (billboards, constant screen size) ----------
  function tagTex(lines, o = {}) {
    const fs = o.fs || 54, pad = 22;
    const cnv = document.createElement("canvas"), c = cnv.getContext("2d");
    c.font = `800 ${fs}px Arial`;
    const tw = Math.max(...lines.map((l) => c.measureText(l).width));
    cnv.width = Math.ceil(tw + pad * 2 + 12); cnv.height = Math.ceil(lines.length * fs * 1.12 + pad * 1.6 + 12);
    const ctx = cnv.getContext("2d"); const w = cnv.width - 12, h = cnv.height - 12;
    ctx.fillStyle = "#1c1e21"; ctx.fillRect(10, 10, w, h);
    ctx.fillStyle = o.bg || "#fffaf0"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "#1c1e21"; ctx.lineWidth = 6; ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = o.fg || "#1c1e21"; ctx.font = `800 ${fs}px Arial`; ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, pad, pad * 0.8 + i * fs * 1.12));
    const t = new THREE.CanvasTexture(cnv); t.colorSpace = THREE.SRGBColorSpace; return { t, w: cnv.width, h: cnv.height };
  }
  const tags = [];
  function tag(lines, o = {}) {
    const { t, w, h } = tagTex(lines, o);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, toneMapped: false }));
    m.renderOrder = 20; m.userData = { w, h, px: o.px || 1 }; S.add(m); tags.push(m); return m;
  }
  const T = {
    ruler: tag(["± 5 km UNTUK BERHENTI"], { bg: "#f4c430" }),
    sight: tag(["PANDANGAN MASINIS"]),
    q: tag(["?"], { fs: 120 }),
    toledo: tag(["TOLEDO"], { fs: 46 }),
    spain: tag(["SPANYOL"], { fs: 40, bg: "#efe9dc" }),
    occ: tag(["1 BLOK = 1 KERETA"], { bg: "#f4c430" }),
    stop: tag(["BATAS IZIN"], { fs: 44 }),
    balise: tag(["BALISE"], { fs: 44, bg: "#f4c430" }),
    radio: tag(["RADIO"], { fs: 44 }),
    curve: tag(["KURVA PENGEREMAN"], { fs: 46, bg: "#7fb59a" }),
    warn: tag(["PERINGATAN!"], { bg: "#f4c430", fs: 50 }),
    brake: tag(["REM OTOMATIS"], { bg: "#1c1e21", fg: "#fffaf0", fs: 50 }),
    nodata: tag(["DATA HILANG → BERHENTI"], { bg: "#1c1e21", fg: "#fffaf0", fs: 46 }),
    slow: tag(["MODE CADANGAN: PELAN"], { bg: "#efe9dc", fs: 46 }),
    wind: tag(["ANGIN"], { fs: 44 }), rain: tag(["HUJAN"], { fs: 44 }), quake: tag(["GEMPA"], { fs: 44 }), obj: tag(["BENDA DI REL"], { fs: 44 }),
    brake7: tag(["REM OTOMATIS"], { bg: "#1c1e21", fg: "#fffaf0", fs: 50 }),
    gsm: tag(["CTCS-3 + GSM-R"], { fs: 44, bg: "#f4c430" }),
  };

  // ---------- DMI callout (redrawn each frame from t) ----------
  const dmiC = document.createElement("canvas"); dmiC.width = 900; dmiC.height = 640;
  const dmiTex = new THREE.CanvasTexture(dmiC); dmiTex.colorSpace = THREE.SRGBColorSpace;
  const dmi = new THREE.Mesh(new THREE.PlaneGeometry(1, 640 / 900), new THREE.MeshBasicMaterial({ map: dmiTex, transparent: true, depthTest: false, toneMapped: false })); dmi.renderOrder = 22; S.add(dmi);
  const leader = new THREE.Mesh(CY(1, 1, 1, 5).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: INK, depthTest: false })); leader.renderOrder = 21; S.add(leader);
  function drawDMI(st) {
    const c = dmiC.getContext("2d"), w = 900, h = 640;
    c.clearRect(0, 0, w, h);
    c.fillStyle = "#1c1e21"; c.fillRect(14, 14, w - 14, h - 14);
    c.fillStyle = "#26303a"; c.fillRect(0, 0, w - 14, h - 14); c.strokeStyle = st.warn > 0.5 ? "#f4c430" : "#1c1e21"; c.lineWidth = st.warn > 0.5 ? 14 : 8; c.strokeRect(4, 4, w - 22, h - 22);
    c.fillStyle = "#1c1e21"; c.fillRect(8, 8, w - 30, 80); c.fillStyle = "#f4c430"; c.font = "900 50px Arial"; c.textBaseline = "middle"; c.fillText("AUDIRA", 30, 50);
    c.fillStyle = "#e9e4d6"; c.font = "700 34px Arial"; c.fillText("LAYAR KABIN", 250, 50);
    // speed dial
    const cx = 250, cy = 340, R = 170, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = (v) => a0 + (a1 - a0) * v;
    c.lineWidth = 26; c.strokeStyle = "#3a4654"; c.beginPath(); c.arc(cx, cy, R, a0, a1); c.stroke();
    c.strokeStyle = "#7fb59a"; c.beginPath(); c.arc(cx, cy, R, a0, ang(st.perm)); c.stroke();
    // target marker (yellow notch)
    c.fillStyle = "#f4c430"; { const a = ang(st.target); c.save(); c.translate(cx + Math.cos(a) * (R + 26), cy + Math.sin(a) * (R + 26)); c.rotate(a); c.beginPath(); c.moveTo(-18, 0); c.lineTo(10, -16); c.lineTo(10, 16); c.fill(); c.restore(); }
    c.strokeStyle = "#e9e4d6"; c.lineWidth = 4; for (let k = 0; k <= 10; k++) { const a = ang(k / 10); c.beginPath(); c.moveTo(cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40)); c.lineTo(cx + Math.cos(a) * (R - 18), cy + Math.sin(a) * (R - 18)); c.stroke(); }
    { const a = ang(st.speed); c.strokeStyle = st.warn > 0.5 ? "#f4c430" : "#fffaf0"; c.lineWidth = 12; c.lineCap = "round"; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30)); c.stroke(); c.fillStyle = "#fffaf0"; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill(); }
    c.fillStyle = "#e9e4d6"; c.font = "700 30px Arial"; c.textAlign = "center"; c.fillText("KECEPATAN", cx, cy + 120); c.textAlign = "left";
    // distance-to-target bar
    const bx = 560, by = 130, bw = 90, bh = 400;
    c.fillStyle = "#3a4654"; c.fillRect(bx, by, bw, bh);
    const fl = clamp01(st.dist); c.fillStyle = st.mode === "fallback" ? "#9aa2ab" : "#7fb59a"; c.fillRect(bx, by + bh * (1 - fl), bw, bh * fl);
    c.strokeStyle = "#e9e4d6"; c.lineWidth = 4; c.strokeRect(bx, by, bw, bh);
    c.fillStyle = "#e9e4d6"; c.font = "700 28px Arial"; c.fillText("JARAK", bx + 120, by + 30); c.fillText("TARGET", bx + 120, by + 66);
    c.fillStyle = "#f4c430"; c.fillRect(bx + 120, by + 100, 120, 10);
    // status line
    let msg = st.mode === "nodata" ? "DATA HILANG" : st.mode === "fallback" ? "MODE CADANGAN" : st.brake > 0.5 ? "REM OTOMATIS" : st.warn > 0.5 ? "PERINGATAN" : "IZIN JALAN OK";
    const mc = st.brake > 0.5 || st.mode === "nodata" ? "#fffaf0" : st.warn > 0.5 ? "#1c1e21" : "#1c1e21";
    const mb = st.brake > 0.5 || st.mode === "nodata" ? "#1c1e21" : st.warn > 0.5 ? "#f4c430" : "#7fb59a";
    c.fillStyle = mb; c.fillRect(bx + 110, by + 300, 200, 100); c.strokeStyle = "#e9e4d6"; c.lineWidth = 3; c.strokeRect(bx + 110, by + 300, 200, 100);
    c.fillStyle = mc; c.font = "800 28px Arial"; const words = msg.split(" "); words.forEach((wd, i) => c.fillText(wd, bx + 124, by + 334 + i * 34));
    dmiTex.needsUpdate = true;
  }
  function drawQuake(t, act) {
    const c = quakeCanvas.getContext("2d"), w = 256, h = 128;
    c.fillStyle = "#1f2a2e"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7fb59a"; c.lineWidth = 4; c.beginPath();
    for (let x = 0; x <= w; x += 3) { const tt = t - (w - x) / 120; const amp = 6 + 44 * act * Math.exp(-Math.pow((x - w * 0.7) / 50, 2)); const y = h / 2 + amp * Math.sin(tt * 31 + x * 0.21) * Math.sin(tt * 7.3 + x * 0.05); x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); quakeTex.needsUpdate = true;
  }

  // ---------- post: NaN guard -> bloom -> output -> paper grade ----------
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4, stencilBuffer: true, depthBuffer: true });
  const comp = new EffectComposer(r, rt);
  comp.addPass(new RenderPass(S, cam));
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 bad=bvec4(isnan(c.r)||isinf(c.r),isnan(c.g)||isinf(c.g),isnan(c.b)||isinf(c.b),isnan(c.a)||isinf(c.a));if(any(bad))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,16.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.28, 0.35, 1.05);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const gradeU = { tDiffuse: { value: null }, uMourn: { value: 0 } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: gradeU,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform sampler2D tDiffuse;uniform float uMourn;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(c,vec3(l)*vec3(.97,.99,1.03),.22*uMourn);c=mix(c,c*vec3(1.02,1.0,.97),.6);c=(c-.5)*1.04+.5;gl_FragColor=vec4(clamp(c,0.,1.),1.);}" })));

  // ---------- camera ----------
  // keys: [t, tx, ty, tz, width, az(deg), el(deg), oy(px: target below screen centre)]
  const ck = [];
  for (let k = 0; k <= 4; k++) { const t = lerp(0, s.s1e, k / 4); ck.push([t, mA.x(t) - 0.5 + 2 * (k / 4), 0.6, 1.4, 15.5 + 3 * (k / 4), 28 + 5 * (k / 4), 31 + 3 * (k / 4), 150, 0]); }
  ck.push([s.s2 + 2.6, -40, -1.3, -16.0, 21, 88, 56, 110, 0], [s.s2e - 0.6, -39.6, -1.3, -16.2, 19.5, 90, 58, 110, 0]);
  ck.push([s.s3 + 1.8, 22, 0.2, 1.2, 30, 28, 34, 90, 0], [s.s3e - 0.3, 24, 0.2, 1.2, 29.5, 31, 33, 90, 0]);
  ck.push([E.pemancar, 4.5, 1.0, 1.2, 11.5, 58, 27, 130, 210], [s.s4e - 0.3, 10.5, 1.0, 1.2, 11, 64, 25, 130, 210]);
  ck.push([E.kurva + 0.6, 21, 2.0, 1.2, 16.5, 80, 16, 90, 0], [s.s5e - 0.3, 24, 2.0, 1.2, 15.5, 82, 16, 90, 0]);
  ck.push([E.desain, 42, 0.6, 0.2, 30, 48, 33, 120, -120], [s.s6e - 0.3, 48, 0.6, 0.2, 29, 44, 33, 120, -120]);
  ck.push([E.memakai + 0.5, 74, 0.6, 0.0, 25, 38, 33, 110, 0], [E.gempa, 86, 0.6, 0.0, 22.5, 34, 33, 110, 0], [s.s7e - 0.2, 90, 0.6, 0.0, 22, 32, 33, 110, 0]);
  ck.push([s.s8 + 3.2, 22, 0, -3, 50, 40, 36, 130, 0], [s.dur, 18, 0, -4, 58, 46, 38, 130, 0]);
  ck.sort((a, b) => a[0] - b[0]);
  const CAM = mtrack(ck);
  const vT = new THREE.Vector3(), vD = new THREE.Vector3(), d0 = new THREE.Object3D();

  function place(m, x, y, z, px, t) { // billboard tag at world pos, constant pixel width px
    const k = U.uK.value; m.scale.set(m.userData.w * k * px, m.userData.h * k * px, 1);
    const q = new THREE.Vector3(x, y, z).project(cam), hw = (m.userData.w * px) / W + 0.06;
    q.x = Math.min(1 - hw, Math.max(-1 + hw, q.x)); q.unproject(cam);
    m.position.copy(q); m.quaternion.copy(cam.quaternion);
  }
  const vis = (m, a) => { m.visible = a > 0.01; m.material.opacity = clamp01(a); };

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    // ---- camera ----
    const c = CAM(t);
    const w = c[3], az = c[4] * DEG, el = c[5] * DEG, hgt = (w * H) / W;
    vT.set(c[0], c[1], c[2]);
    vD.set(-Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    cam.position.copy(vT).addScaledVector(vD, 300); cam.up.set(0, 1, 0); cam.lookAt(vT); cam.updateMatrixWorld(true);
    const sh = (c[6] / H) * hgt, shx = (c[7] / W) * w;
    cam.left = -w / 2 + shx; cam.right = w / 2 + shx; cam.top = hgt / 2 + sh; cam.bottom = -hgt / 2 + sh; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
    U.uK.value = w / W;
    // key light follows the camera azimuth a little so the three bands stay readable
    U.uL.value.copy(LX);

    // ---- trains ----
    const xa = mA.x(t), xb = mB.x(t), va = mA.v(t);
    trA.position.x = xa; trB.position.x = xb;
    // see-through shell on train A in s4-s5
    const cut = t >= s.s4 - 0.5 && t < s.s6 + 1 ? ramp(t, E.kabin - 0.4, E.kabin + 0.5) * (1 - ramp(t, s.s5e - 0.6, s.s6 + 0.4)) : 0;
    const shm = trA.userData.shellM; shm.uniforms.uA.value = 1 - 0.72 * cut; shm.depthWrite = cut < 0.05;
    cabG.visible = cut > 0.02;
    screenM.color.setRGB(2.2 * cut + 0.2, 2.0 * cut + 0.2, 1.2 * cut + 0.2);

    // ---- blocks (colour from occupancy) ----
    const blocksOn = t >= s.s3 - 0.3 ? ramp(t, E.blok - 0.6, E.blok + 0.6) : 0;
    const occ = BB.map((b) => [xa, xb].some((x) => x > b && x - TL_ < b + 12));
    for (let i = 0; i < BB.length; i++) {
      let col = occ[i] ? cSla : i + 1 < BB.length && occ[i + 1] ? cYel : cMint;
      d0.position.set(BB[i] + 6, 0.08 + 0.04 * blocksOn, 3.2); d0.scale.set(1, blocksOn > 0.01 ? 1 : 0.001, blocksOn > 0.01 ? 1 : 0.001);
      d0.updateMatrix(); blocks.setMatrixAt(i, d0.matrix);
      const cc = cOff.clone().lerp(col, blocksOn); blocks.setColorAt(i, cc);
    }
    blocks.instanceMatrix.needsUpdate = true; blocks.instanceColor.needsUpdate = true;
    // signal lamps: state of the block they protect; brighter in fallback mode (s6)
    const dataOn = t < E.data - 0.2 || t >= s.s7 - 0.2 ? 1 : 1 - ramp(t, E.data - 0.2, E.data + 0.3);
    const fallback = t >= s.s6 && t < s.s7 ? ramp(t, E.cadangan - 0.5, E.cadangan + 0.5) : 0;
    for (let i = 0; i < sigs.length; i++) {
      const sgi = sigs[i], col = occ[i] ? cOff : i + 1 < BB.length && occ[i + 1] ? cYel : cMint, k = 1.1 + 1.5 * fallback;
      sgi.lm.color.setRGB(col.r * k, col.g * k, col.b * k);
      sgi.g.scale.setScalar(1 + 0.25 * fallback);
    }
    // stop marker (the one red element)
    let stopX = XS, stopOn = t >= s.s3 && t < s.s6 + 0.8 ? ramp(t, E.satu - 0.3, E.satu + 0.4) * (1 - ramp(t, s.s6, s.s6 + 0.7)) : 0;
    if (t >= s.s7) { stopX = 99.5; stopOn = ramp(t, E.rem - 0.4, E.rem + 0.3); }
    stopG.position.set(stopX, 0, 3.75); stopG.scale.setScalar(Math.max(0.001, back(stopOn, 1.6)));
    stopG.visible = stopOn > 0.01;

    // ---- ruler + sight cone ----
    const rulerOn = t < s.s2 + 0.8 ? 1 - ramp(t, s.s2 - 0.2, s.s2 + 0.6) : t >= s.s3 && t < s.s4 ? ramp(t, E.jarak - 0.4, E.jarak + 0.5) * (1 - ramp(t, E.blok - 0.3, E.blok + 0.6)) : 0;
    rulerG.visible = rulerOn > 0.01; rulerG.position.x = xa + 0.1; rulerG.scale.set(Math.max(0.001, rulerOn), 1, 1);
    const sightOn = t < s.s2 + 0.8 ? 1 - ramp(t, s.s2 - 0.2, s.s2 + 0.6) : t >= s.s3 && t < s.s4 ? ramp(t, E.sinyal - 0.3, E.sinyal + 0.5) * (1 - ramp(t, E.blok, E.blok + 0.8)) : 0;
    sight.visible = sightOn > 0.01; sight.position.set(xa + 0.2, 0.47, TZ1); coneM.opacity = 0.38 * sightOn; sight.scale.set(1, 1, Math.max(0.001, sightOn));

    // ---- balise packets (s4-s5, s7 for B) ----
    const pkOn = (t >= s.s4 && t < s.s6) || (t >= s.s7 && t < s.s8) ? 1 : 0;
    let pi = 0;
    for (let i = 0; i < BAL.length && pi < NPK; i++) {
      for (const [pass, mm] of [[passA[i], mA], [passB[i], mB]]) {
        const u = (t - pass) / 0.7;
        if (pkOn && u >= 0 && u <= 1 && pi < NPK && t >= s.s4) {
          const tx = mm.x(t) + ANT, sx = BAL[i];
          const p = packets[pi++]; p.visible = true;
          p.position.set(lerp(sx, tx, eout(u)), lerp(0.45, 1.25, u) + 1.4 * Math.sin(Math.PI * u), TZ1 + 0.1);
          p.quaternion.copy(cam.quaternion); const k = U.uK.value * 120; p.scale.set(k * (1 - 0.6 * u * u), k * (1 - 0.6 * u * u), 1);
        }
      }
    }
    for (; pi < NPK; pi++) packets[pi].visible = false;
    balM.uniforms.uEm.value.setRGB(0.25 * pkOn * dataOn, 0.18 * pkOn * dataOn, 0);
    balM.uniforms.uC.value.set(dataOn > 0.5 ? P.yellow : 0xb8b2a0);

    // ---- radio masts: rings + data dots toward the nearest train ----
    for (const m of masts) {
      const on = m === mast1 ? (t >= s.s4 - 0.5 && t < s.s7 ? ramp(t, E.radio - 0.6, E.radio + 0.2) * dataOn : 0) : (t >= s.s7 - 0.5 ? ramp(t, E.memakai, E.radio7) : 0);
      m.lampM.color.setRGB(0.3 + 2.1 * on, 0.3 + 1.8 * on, 0.3 + 0.5 * on);
      m.rings.forEach((rg, k) => { const ph = ((t * 0.6 + k / 3) % 1); rg.visible = on > 0.02; rg.scale.setScalar(0.5 + 5 * ph); rg.material.opacity = 0.7 * on * (1 - ph); });
      const tr = m === mast1 ? xa : xb;
      for (let k = 0; k < 10; k++) {
        const u = (t * 0.9 + k / 10) % 1;
        const x = lerp(m.x, tr - 1.2, u), y = lerp(5.1, 1.5, u) + 1.6 * Math.sin(Math.PI * u), z = lerp(-3.35, TZ1, u);
        d0.position.set(x, y, z); d0.rotation.set(0, 0, 0); d0.scale.setScalar(on > 0.02 ? on * (0.6 + 0.4 * Math.sin(Math.PI * u)) : 0.0001); d0.updateMatrix(); m.dots.setMatrixAt(k, d0.matrix);
      }
      m.dots.instanceMatrix.needsUpdate = true;
    }

    // ---- braking curve + puck (s5) ----
    const curveOn = t >= s.s5 - 0.5 && t < s.s6 + 0.6 ? ramp(t, E.kurva - 0.5, E.kurva + 0.6) * (1 - ramp(t, s.s6 - 0.1, s.s6 + 0.5)) : 0;
    curveG.visible = curveOn > 0.01; curveG.scale.set(1, Math.max(0.001, curveOn), 1); curveG.position.y = BASEY * (1 - curveOn) * 0;
    const warn = t >= E.peringatan - 0.25 && t < s.s6 ? 1 : 0, brake = t >= E.direm - 0.1 && t < s.s6 ? 1 : 0;
    const delta = -0.75 + 1.05 * ramp(t, E.peringatan - 0.9, E.peringatan - 0.1) - 1.9 * ramp(t, E.direm, E.direm + 1.4);
    const hp = Math.max(0, (curveH(xa) + delta) * clamp01(va / 0.8));
    puck.visible = curveOn > 0.01; puck.position.set(xa - 0.2, BASEY, TZ1); puckBall.position.y = Math.max(0.05, hp * curveOn); stick.scale.set(1, Math.max(0.01, hp * curveOn), 1);
    puckM.uniforms.uC.value.set(brake ? 0xfffaf0 : warn ? P.yellow : P.mint);

    // ---- DMI callout (s4-s6) ----
    const dmiOn = t >= s.s4 && t < s.s7 ? ramp(t, E.sejauh - 0.5, E.sejauh + 0.3) * (1 - ramp(t, E.kurva, E.kurva + 0.6)) + (t >= s.s6 ? ramp(t, E.data - 0.6, E.data) * (1 - ramp(t, s.s6e - 0.6, s.s6e)) : 0) : 0;
    const dmiShow = clamp01(dmiOn);
    dmi.visible = dmiShow > 0.01; leader.visible = dmi.visible;
    if (dmi.visible) {
      const mode = t >= s.s6 ? (t < E.cadangan - 0.3 ? "nodata" : "fallback") : "ok";
      const spd = mode === "nodata" ? clamp01(va / 5) : clamp01(va / 5);
      drawDMI({ speed: spd, perm: mode === "ok" ? clamp01(curveH(xa) / HC_) * 0.95 : mode === "fallback" ? 0.18 : 0, target: mode === "ok" ? 0.0 : 0, dist: mode === "ok" ? clamp01((XS - xa) / 26) : mode === "fallback" ? 0.15 : 0, warn, brake, mode });
      const k = U.uK.value, pw = 470 * k * eout(dmiShow), ph = pw * 640 / 900;
      const sc = new THREE.Vector3(t >= s.s6 ? 0.5 : 0.52, t >= s.s6 ? 0.02 : 0.1, -0.5).unproject(cam);
      dmi.position.copy(sc); dmi.quaternion.copy(cam.quaternion); dmi.scale.set(pw, pw, 1);
      const rx = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), uy = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      const p0 = new THREE.Vector3(xa - 1.0, 1.15, TZ1), p1 = sc.clone().addScaledVector(rx, -pw * 0.42).addScaledVector(uy, -ph * 0.42);
      const dir = p1.clone().sub(p0), L = Math.max(0.001, dir.length());
      leader.position.copy(p0); leader.scale.set(2.2 * k, L, 2.2 * k); leader.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    }

    // ---- sensors (s7) ----
    const sOn = (a) => (t >= s.s7 - 0.5 ? ramp(t, a - 0.3, a + 0.3) : 0);
    sens.wind.head.rotation.y = t * (2 + 6 * sOn(E.angin));
    { const on = sOn(E.hujan); for (let k = 0; k < 12; k++) { const u = (t * 1.3 + k / 12) % 1; d0.position.set(Math.sin(k * 2.4) * 0.22, 2.6 - 1.0 * u, Math.cos(k * 2.4) * 0.22); d0.scale.setScalar(on > 0.02 ? on : 0.0001); d0.updateMatrix(); sens.rain.drops.setMatrixAt(k, d0.matrix); } sens.rain.drops.instanceMatrix.needsUpdate = true; }
    { const on = sOn(E.gempa); if (t >= s.s7 - 1 && t < s.s8 + 1) drawQuake(t, on); sens.quake.rings.forEach((rg, k) => { const ph = (t * 0.7 + k / 3) % 1; rg.visible = on > 0.02; rg.scale.setScalar(0.6 + 7 * ph); rg.material.opacity = 0.5 * on * (1 - ph); }); }
    sens.obj.beamM.opacity = 0.25 + 0.7 * sOn(E.benda) * (0.6 + 0.4 * Math.sin(t * 9));

    // ---- mood: s2 mourning (soft desaturation, a little dimmer) ----
    const mourn = t >= s.s2 - 0.6 && t < s.s3 + 0.5 ? ramp(t, s.s2 - 0.6, s.s2 + 0.6) * (1 - ramp(t, s.s2e - 0.4, s.s3 + 0.4)) : t >= s.s8 + 1.5 ? 0.5 * ramp(t, E.turut - 0.4, E.turut + 0.8) : 0;
    gradeU.uMourn.value = mourn;
    U.uTint.value.setRGB(1 - 0.06 * mourn, 1 - 0.05 * mourn, 1 - 0.02 * mourn);
    pin.position.y = 0.62 + 2.5 * (1 - eout(ramp(t, E.toledo - 0.5, E.toledo + 0.2)));
    pin.visible = t >= E.toledo - 0.5; pinRing.visible = t >= E.toledo; pinRing.scale.setScalar(1 + 0.6 * ((t * 0.35) % 1)); pinRing.material.opacity = 0.6 * (1 - ((t * 0.35) % 1));

    // ---- tags ----
    const ruleA = rulerOn;
    place(T.ruler, xa + 9, 0.9, 0, 1.0, t); vis(T.ruler, ruleA * (t < s.s2 ? 1 : ramp(t, E.jarak, E.jarak + 0.4)));
    place(T.sight, xa + 4.5, 1.0, TZ1 + 1.4, 0.95, t); vis(T.sight, sightOn);
    place(T.q, xa + 13, 1.8, TZ1, 1.0, t); vis(T.q, t < s.s2 ? ramp(t, E.bagaimana, E.bagaimana + 0.4) * (1 - ramp(t, s.s2 - 0.3, s.s2 + 0.3)) : 0);
    place(T.toledo, mapG.position.x + MX(-3.75) + 3.4, -1.6 + 4.6, mapG.position.z + MZ(39.45), 1, t); vis(T.toledo, t < s.s3 + 0.5 ? ramp(t, E.toledo + 0.1, E.toledo + 0.5) * (1 - ramp(t, s.s2e - 0.3, s.s3)) : 0);
    place(T.spain, mapG.position.x + MX(-5.5), -1.6 + 1.0, mapG.position.z + MZ(42.3), 1, t); vis(T.spain, t < s.s3 + 0.5 ? ramp(t, s.s2 + 0.8, s.s2 + 1.4) * (1 - ramp(t, s.s2e - 0.3, s.s3)) : 0);
    place(T.occ, 24, 2.6, 2.6, 1, t); vis(T.occ, 0 * t >= s.s3 && t < s.s4 + 0.4 ? ramp(t, E.satu, E.satu + 0.4) * (1 - ramp(t, s.s3e - 0.2, s.s4 + 0.3)) : 0);
    place(T.stop, stopX + 0.6, 3.1, 3.75, 0.9, t); vis(T.stop, (t < s.s7 ? 1 : 0) * stopOn * (t < s.s4 ? 1 : t >= s.s7 ? 1 : 1 - ramp(t, s.s4 - 0.2, s.s4 + 0.4)) * (t >= s.s5 && t < s.s6 ? 1 : t < s.s4 || t >= s.s7 ? 1 : 0));
    place(T.balise, 15 + 3, 0.9, TZ1 + 0.9, 0.9, t); vis(T.balise, t >= s.s4 && t < s.s5 ? ramp(t, E.balise - 0.2, E.balise + 0.3) * (1 - ramp(t, E.sejauh - 0.3, E.sejauh + 0.2)) : 0);
    place(T.radio, mast1.x + 0.9, 6.2, -3.35, 0.9, t); vis(T.radio, t >= s.s4 && t < s.s5 ? ramp(t, E.radio, E.radio + 0.3) * (1 - ramp(t, E.sejauh - 0.3, E.sejauh + 0.2)) : 0);
    place(T.curve, XS - DC + 2, BASEY + HC_ + 0.9, TZ1, 1, t); vis(T.curve, curveOn * (1 - (t > E.peringatan - 0.4 ? 1 : 0)));
    place(T.warn, xa + 0.4, BASEY + hp + 1.1, TZ1, 1, t); vis(T.warn, warn && !brake ? curveOn : 0);
    place(T.brake, xa + 0.4, BASEY + Math.max(hp, 0.6) + 1.1, TZ1, 1, t); vis(T.brake, brake ? curveOn * (1 - ramp(t, s.s5e - 0.4, s.s5e)) : 0);
    place(T.nodata, xa + 4, 5.2, TZ1, 1, t); vis(T.nodata, 0 * t >= s.s6 ? ramp(t, E.data - 0.2, E.data + 0.3) * (1 - ramp(t, E.lalu - 0.4, E.lalu)) : 0);
    place(T.slow, xb - 1.5, 3.6, TZ1, 1, t); vis(T.slow, 0 * t >= s.s6 ? ramp(t, E.cadangan - 0.3, E.cadangan + 0.3) * (1 - ramp(t, s.s6e - 0.2, s.s7 + 0.3)) : 0);
    const sTag = (m, x, y, z, a) => { place(m, x, y, z, 0.9, t); vis(m, t >= s.s7 && t < s.s8 + 0.5 ? ramp(t, a - 0.2, a + 0.25) * (1 - ramp(t, s.s7e - 0.3, s.s8 + 0.3)) : 0); };
    sTag(T.wind, SX.wind, 4.3, -3.0, E.angin); sTag(T.rain, SX.rain, 2.4, 3.85, E.hujan); sTag(T.quake, SX.quake, 1.6, 3.85, E.gempa); sTag(T.obj, SX.obj, 2.2, 2.8, E.benda);
    place(T.brake7, xb + 0.5, 4.6, TZ1, 1, t); vis(T.brake7, t >= s.s7 && t < s.s8 + 0.5 ? ramp(t, E.rem, E.rem + 0.3) * (1 - ramp(t, s.s7e - 0.2, s.s8 + 0.3)) : 0);
    place(T.gsm, mast2.x + 1.2, 6.4, -3.35, 0.95, t); vis(T.gsm, t >= s.s7 && t < s.s8 ? ramp(t, E.memakai, E.memakai + 0.4) * (1 - ramp(t, E.sensor - 0.4, E.sensor)) : 0);

    comp.render();
  };
}
