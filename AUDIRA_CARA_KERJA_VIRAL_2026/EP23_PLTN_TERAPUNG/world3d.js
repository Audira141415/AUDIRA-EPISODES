// EP23 PLTN TERAPUNG. DRAFTFORGE look: a living engineering blueprint. Every object is cyan/white CAD line art
// (screen-space fat lines, additive, soft bloom) on deep blueprint navy, gold dimension lines, crimson stamps.
// One connected drawing sheet: the barge (UNIT 1) moored off a shore block at the origin, UNIT 2 behind it,
// a shipyard and a separate "Arktik Rusia" sheet (Akademik Lomonosov) further up the sheet for the s7 route map.
// The camera never cuts: wide isometric -> site plan -> section A-A -> dive into DETAIL A (core) -> loops -> turbine
// -> cable to shore -> seawater loop at the waterline -> high route map -> back to the isometric for the rule change.
// Every value is a pure function of t (seeded PRNG only, precomputed event tables).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
import { mulberry, ramp, clamp01, canvasTex, track, eout, back } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const C = { navy: 0x061327, white: 0xf0f6ff, cyan: 0x4fc3f7, dim: 0x547299, gold: 0xffca28, red: 0xef5350, warm: 0xffa040, sea: 0x29b6f6, grid: 0x15336a, gridM: 0x1f4a8f };

// ---------------- screen-space fat line sets ----------------
const LINE_VS = `
attribute vec3 aA; attribute vec3 aB; attribute float aOrd;
uniform float uW; uniform vec2 uRes; uniform float uDraw;
varying float vEdge;
void main(){
  vec4 va = modelViewMatrix*vec4(aA,1.0); vec4 vb = modelViewMatrix*vec4(aB,1.0);
  float nr = 0.08;
  if ((va.z > -nr && vb.z > -nr) || aOrd > uDraw) { gl_Position = vec4(3.0,3.0,3.0,1.0); vEdge = 0.0; return; }
  if (va.z > -nr) { float k = (-nr - vb.z)/(va.z - vb.z); va = mix(vb, va, k); }
  else if (vb.z > -nr) { float k = (-nr - va.z)/(vb.z - va.z); vb = mix(va, vb, k); }
  vec4 ca = projectionMatrix*va; vec4 cb = projectionMatrix*vb;
  vec2 na = ca.xy/ca.w; vec2 nb = cb.xy/cb.w;
  vec2 d = (nb - na)*uRes; float l = length(d);
  vec2 dir = l > 0.0001 ? d/l : vec2(1.0,0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  vec4 c = mix(ca, cb, position.x);
  vec2 off = (nrm*position.y + dir*(position.x*2.0-1.0)*0.5)*uW/uRes;
  c.xy += off*c.w;
  vEdge = position.y;
  gl_Position = c;
}`;
const LINE_FS = `uniform vec3 uColor; uniform float uOp; varying float vEdge;
void main(){ float e = 1.0 - 0.45*vEdge*vEdge; gl_FragColor = vec4(uColor*uOp*e, 1.0); }`;
const QUAD = new Float32Array([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0]);

class LS {
  constructor() { this.a = []; }
  seg(p, q) { this.a.push(p.x, p.y, p.z, q.x, q.y, q.z); return this; }
  poly(pts, closed = false) { for (let i = 0; i < pts.length - 1; i++) this.seg(pts[i], pts[i + 1]); if (closed) this.seg(pts[pts.length - 1], pts[0]); return this; }
  dash(pts, dl = 0.5, gl = 0.35) {
    let on = true, acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1], L = p.distanceTo(q); let s = 0;
      while (s < L) { const lim = on ? dl : gl; const e = Math.min(L, s + (lim - acc)); if (on) this.seg(p.clone().lerp(q, s / L), p.clone().lerp(q, e / L)); acc += e - s; s = e; if (acc >= lim - 1e-6) { acc = 0; on = !on; } }
    }
    return this;
  }
  edges(geo, thr = 20, m) { const e = new THREE.EdgesGeometry(geo, thr); const p = e.attributes.position; const a = v3(), b = v3(); for (let i = 0; i < p.count; i += 2) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); if (m) { a.applyMatrix4(m); b.applyMatrix4(m); } this.seg(a, b); } return this; }
  circle(c, r, plane = "xz", n = 40) { const pts = []; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, u = Math.cos(a) * r, w = Math.sin(a) * r; pts.push(plane === "xz" ? v3(c.x + u, c.y, c.z + w) : plane === "xy" ? v3(c.x + u, c.y + w, c.z) : v3(c.x, c.y + u, c.z + w)); } return this.poly(pts); }
  box(x0, y0, z0, x1, y1, z1) { return this.edges(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), 10, new THREE.Matrix4().makeTranslation((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); }
  // vertical vessel: rings + verticals + dome arcs
  vessel(cx, cz, y0, y1, r, nv = 12, nr = 5) {
    const dome = r * 0.55;
    for (let i = 0; i < nr; i++) this.circle(v3(cx, lerp(y0, y1, i / (nr - 1)), cz), r, "xz", 36);
    for (let k = 0; k < nv; k++) {
      const a = (k / nv) * Math.PI * 2, x = Math.cos(a), z = Math.sin(a), pts = [];
      for (let j = 0; j <= 6; j++) { const b = (j / 6) * Math.PI / 2; pts.push(v3(cx + x * r * Math.cos(b), y1 + dome * Math.sin(b), cz + z * r * Math.cos(b))); }
      this.poly(pts); this.seg(v3(cx + x * r, y0, cz + z * r), v3(cx + x * r, y1, cz + z * r));
      const q = []; for (let j = 0; j <= 6; j++) { const b = (j / 6) * Math.PI / 2; q.push(v3(cx + x * r * Math.cos(b), y0 - dome * Math.sin(b), cz + z * r * Math.cos(b))); } this.poly(q);
    }
    return this;
  }
  build(color, w = 2, op = 1) {
    const n = this.a.length / 6, g = new THREE.InstancedBufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(QUAD, 3)); g.setIndex([0, 1, 2, 2, 1, 3]);
    const A = new Float32Array(n * 3), B = new Float32Array(n * 3), O = new Float32Array(n);
    for (let i = 0; i < n; i++) { for (let j = 0; j < 3; j++) { A[i * 3 + j] = this.a[i * 6 + j]; B[i * 3 + j] = this.a[i * 6 + 3 + j]; } O[i] = n > 1 ? i / (n - 1) : 0; }
    g.setAttribute("aA", new THREE.InstancedBufferAttribute(A, 3)); g.setAttribute("aB", new THREE.InstancedBufferAttribute(B, 3)); g.setAttribute("aOrd", new THREE.InstancedBufferAttribute(O, 1));
    g.instanceCount = n;
    const m = new THREE.Mesh(g, lineMat(color, w, op)); m.frustumCulled = false; m.userData.n = n;
    return m;
  }
}
function lineMat(color, w, op) {
  return new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(color) }, uOp: { value: op }, uW: { value: w }, uRes: { value: new THREE.Vector2(W, H) }, uDraw: { value: 1.001 } },
    vertexShader: LINE_VS, fragmentShader: LINE_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false });
}
const setL = (m, op, draw = 1.001) => { m.material.uniforms.uOp.value = op; m.material.uniforms.uDraw.value = draw; m.visible = op > 0.004 && draw > 0; };

// ---------------- text helpers ----------------
function label(lines, opt = {}) {
  const w = opt.w || 640, h = opt.h || 170, col = opt.color || "#f0f6ff";
  const tex = canvasTex(w, h, (c) => {
    if (opt.box) { c.strokeStyle = opt.box; c.lineWidth = 4; c.fillStyle = "rgba(6,19,39,.82)"; c.fillRect(4, 4, w - 8, h - 8); c.strokeRect(4, 4, w - 8, h - 8); }
    c.textAlign = opt.align || "center"; c.textBaseline = "middle";
    const x = opt.align === "left" ? 28 : w / 2;
    lines.forEach((L, i) => { c.font = `${L.wt || 700} ${L.px || 56}px "JetBrains Mono", monospace`; c.fillStyle = L.c || col; c.shadowColor = L.c || col; c.shadowBlur = 10; c.fillText(L.t, x, L.y ?? h / 2); });
  });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false });
  const sp = new THREE.Sprite(mat); sp.scale.set(opt.s || 3, (opt.s || 3) * h / w, 1); sp.renderOrder = 30;
  return sp;
}
function flatLabel(lines, s, opt = {}) {
  const w = opt.w || 1024, h = opt.h || 256;
  const tex = canvasTex(w, h, (c) => {
    c.textAlign = "center"; c.textBaseline = "middle";
    lines.forEach((L) => { c.font = `${L.wt || 700} ${L.px || 90}px "JetBrains Mono", monospace`; c.fillStyle = L.c; c.shadowColor = L.c; c.shadowBlur = 14; c.fillText(L.t, w / 2, L.y ?? h / 2); });
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * h / w), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 25;
  return m;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NoToneMapping;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 900);
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const s = K;
  const E = {
    halma: A_("s1:Halmahera", 2.2), padahal: A_("s1:Padahal", 3), lokasi: A_("s1:lokasi", 5), darat1: A_("s1:daratan", 6.4),
    okt: A_("s2:Oktober", s.s2 + 0.6), rosatom: A_("s2:Rosatom", s.s2 + 1.5), swasta: A_("s2:swasta", s.s2 + 5), dua: A_("s2:dua", s.s2 + 7), mw: A_("s2:megawatt", s.s2 + 9), pem: A_("s2:Pemerintah", s.s2 + 10), izin: A_("s2:izin", s.s2 + 12),
    jantung: A_("s3:Jantungnya", s.s3), neutron: A_("s3:Neutron", s.s3 + 1.6), tabrak: A_("s3:menabrak", s.s3 + 2.1), belah: A_("s3:terbelah", s.s3 + 3.6), batang: A_("s3:Batang", s.s3 + 6.6), serap: A_("s3:menyerap", s.s3 + 7.6), stabil: A_("s3:stabil", s.s3 + 10),
    air4: A_("s4:Air", s.s4), pompa: A_("s4:dipompa", s.s4 + 2.2), didih: A_("s4:mendidih", s.s4 + 4.4), panas4: A_("s4:Panasnya", s.s4 + 6.5), sirkuit: A_("s4:sirkuit", s.s4 + 7.5), uap4: A_("s4:uap", s.s4 + 10.5),
    uap5: A_("s5:Uap", s.s5), turbin: A_("s5:turbin", s.s5 + 0.6), gen: A_("s5:generator", s.s5 + 2.2), batu: A_("s5:batu", s.s5 + 4.4), listrik: A_("s5:Listriknya", s.s5 + 6.4), kabel: A_("s5:kabel", s.s5 + 7.8), darat5: A_("s5:daratan", s.s5 + 8.6),
    laut: A_("s6:lautnya", s.s6 + 0.4), kond: A_("s6:kondensor", s.s6 + 2.8), sentuh: A_("s6:menyentuh", s.s6 + 3.8), kembali: A_("s6:kembali", s.s6 + 5.8), hangat: A_("s6:hangat", s.s6 + 6.8), rutin: A_("s6:rutinnya", s.s6 + 8.6),
    rakit: A_("s7:dirakit", s.s7 + 0.8), galangan: A_("s7:galangan", s.s7 + 1.6), ditarik: A_("s7:ditarik", s.s7 + 2.4), tunda: A_("s7:tunda", s.s7 + 3.3), pertama: A_("s7:pertama", s.s7 + 4.8), akad: A_("s7:Akademik", s.s7 + 5.3), lomo: A_("s7:Lomonosov", s.s7 + 6), arktik: A_("s7:Arktik", s.s7 + 10), th: A_("s7:2020", s.s7 + 12), renc: A_("s7:Rencananya", s.s7 + 13), pulang: A_("s7:pulang", s.s7 + 15.5),
    kini: A_("s8:Kini", s.s8), revisi: A_("s8:merevisi", s.s8 + 1.2), perairan: A_("s8:perairan", s.s8 + 3.6),
  };

  const S = new THREE.Scene();
  S.background = new THREE.Color(C.navy);
  const all = [];
  const add = (m, parent = S) => { parent.add(m); all.push(m); return m; };

  // ---------------- blueprint sheet (seabed grid far below) ----------------
  const sheetY = -6;
  { const f = new LS(), M = new LS();
    for (let i = -120; i <= 120; i += 3) { const L = i % 15 === 0 ? M : f; L.seg(v3(i, sheetY, -130), v3(i, sheetY, 70)); }
    for (let k = -130; k <= 70; k += 3) { const L = k % 15 === 0 ? M : f; L.seg(v3(-120, sheetY, k), v3(120, sheetY, k)); }
    add(f.build(C.grid, 1.3, 0.55)); add(M.build(C.gridM, 1.6, 0.75)); }
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: 0x081a35, toneMapped: false })); bg.rotation.x = -Math.PI / 2; bg.position.y = sheetY - 0.05; S.add(bg);

  // ---------------- water: dynamic wave lines ----------------
  const WZ = [], WX0 = -36, WX1 = 44, WSEG = 56;
  for (let z = -26; z <= 22; z += 2.4) WZ.push(z);
  const waveLS = new LS(); for (const z of WZ) for (let i = 0; i < WSEG; i++) waveLS.seg(v3(0, 0, z), v3(0, 0, z));
  const waves = add(waveLS.build(C.cyan, 1.5, 0.22));
  const wA = waves.geometry.attributes.aA, wB = waves.geometry.attributes.aB;
  const wy = (x, z, t) => 0.07 * Math.sin(0.42 * x + 0.9 * t + z * 0.5) + 0.04 * Math.sin(0.9 * x - 0.6 * t + z * 1.3);
  function updWaves(t) {
    let k = 0;
    for (const z of WZ) for (let i = 0; i < WSEG; i++) {
      let x0 = lerp(WX0, WX1, i / WSEG), x1 = lerp(WX0, WX1, (i + 1) / WSEG);
      // waves stop at the shore block and around the hull
      const cut = (x) => x > 16 || (Math.abs(z) < 3.9 && Math.abs(x) < 12.6) || (Math.abs(z + 16) < 3.9 && Math.abs(x) < 12.6);
      if (cut(x0) || cut(x1)) { x1 = x0; }
      wA.setXYZ(k, x0, wy(x0, z, t), z); wB.setXYZ(k, x1, wy(x1, z, t), z); k++;
    }
    wA.needsUpdate = wB.needsUpdate = true;
  }

  // ---------------- barge (UNIT 1) ----------------
  const barge = new THREE.Group(); S.add(barge);
  const hullShape = new THREE.Shape([new THREE.Vector2(-11, -1.6), new THREE.Vector2(11, -1.6), new THREE.Vector2(12.2, 1.6), new THREE.Vector2(-12.2, 1.6)]);
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 7, bevelEnabled: false }); hullGeo.translate(0, 0, -3.5);
  function hullLines() {
    const L = new LS().edges(hullGeo, 20);
    for (let x = -10; x <= 10; x += 2) L.poly([v3(x, 1.6, -3.5), v3(x, -1.6, -3.5), v3(x, -1.6, 3.5), v3(x, 1.6, 3.5)]); // ribs
    return L;
  }
  function houseLines() {
    const L = new LS();
    L.poly([v3(-9, 1.6, -2.8), v3(9, 1.6, -2.8), v3(9, 1.6, 2.8), v3(-9, 1.6, 2.8)], true);
    for (const x of [-9, 9]) for (const z of [-2.8, 2.8]) L.seg(v3(x, 1.6, z), v3(x, 4.4, z));
    for (const z of [-2.8]) for (let x = -8; x < 8.5; x += 1.4) L.box(x, 3.3, z - 0.01, x + 0.8, 3.9, z + 0.01);
    return L;
  }
  function roofLines() {
    const L = new LS();
    L.poly([v3(-9, 4.4, -2.8), v3(9, 4.4, -2.8), v3(9, 4.4, 2.8), v3(-9, 4.4, 2.8)], true);
    for (let x = -7; x <= 7; x += 3.5) L.seg(v3(x, 4.4, -2.8), v3(x, 4.4, 2.8));
    L.box(-8.6, 4.4, -1.6, -6.4, 6.6, 1.6); L.box(-8.4, 6.6, -1.2, -6.6, 6.9, 1.2); // bridge tower
    L.seg(v3(-7.5, 6.9, 0), v3(-7.5, 8.6, 0)); L.seg(v3(-8.2, 8.0, 0), v3(-6.8, 8.0, 0)); // mast
    L.vessel(1.2, 0, 4.4, 6.2, 0.45, 8, 3); // vent stack
    return L;
  }
  function nearLines() { // near side (z=+): windows and portholes, ghosted on section open
    const L = new LS();
    for (let x = -8; x < 8.5; x += 1.4) L.box(x, 3.3, 2.79, x + 0.8, 3.9, 2.81);
    for (let x = -9.5; x <= 9.5; x += 1.9) L.circle(v3(x, 0.8, 3.5), 0.22, "xy", 16);
    return L;
  }
  const hull = add(hullLines().build(C.white, 2.4, 0.95), barge);
  const house = add(houseLines().build(C.white, 2.0, 0.85), barge);
  const roofG = new THREE.Group(); barge.add(roofG);
  const roof = add(roofLines().build(C.white, 2.0, 0.85), roofG);
  const nearW = add(nearLines().build(C.cyan, 1.6, 0.7), barge);
  // waterline (gold dashed) + section cut markers
  const wl = add(new LS().dash([v3(-11.6, 0, 3.55), v3(11.6, 0, 3.55)], 0.6, 0.35).dash([v3(-11.6, 0, -3.55), v3(11.6, 0, -3.55)], 0.6, 0.35).build(C.gold, 1.8, 0.7), barge);
  const secCut = add(new LS().dash([v3(-14, 3, 0), v3(14, 3, 0)], 1.0, 0.3).poly([v3(-14, 3, 0), v3(-14, 3, 1.6), v3(-14.4, 3, 1.1)]).seg(v3(-14, 3, 1.6), v3(-13.6, 3, 1.1)).poly([v3(14, 3, 0), v3(14, 3, 1.6), v3(14.4, 3, 1.1)]).seg(v3(14, 3, 1.6), v3(13.6, 3, 1.1)).build(C.gold, 2.0, 0.9), barge);
  const lblA = add(label([{ t: "SEKSI A–A", px: 64, c: "#ffca28" }], { s: 3.4 }), barge); lblA.position.set(-14, 4.6, 1.2);
  const lblU1 = add(label([{ t: "UNIT 1", px: 70 }], { s: 2.6, box: "#4fc3f7" }), barge); lblU1.position.set(-11.5, 6.2, 2.5);

  // ---------------- interior (drawn in at s3) ----------------
  const RX = -1.6; // reactor axis x
  const contain = add(new LS().box(-3.6, -1.3, -2.3, 0.6, 3.9, 2.3).build(C.gold, 1.8, 0.75), barge);
  const vessel = add(new LS().vessel(RX, 0, -0.6, 2.4, 1.0, 14, 5).build(C.cyan, 2.0, 0.9), barge);
  const sg = add(new LS().vessel(-0.05, 0.5, -0.4, 2.6, 0.4, 8, 4).build(C.cyan, 1.8, 0.8), barge);
  // turbine casing (cone along x) + generator
  const turbCase = (() => { const L = new LS(); for (let i = 0; i <= 5; i++) { const x = lerp(3.8, 6.6, i / 5), rr = lerp(0.55, 1.0, i / 5); L.circle(v3(x, 2.6, 0), rr, "yz", 30); } for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; L.seg(v3(3.8, 2.6 + 0.55 * Math.cos(a), 0.55 * Math.sin(a)), v3(6.6, 2.6 + Math.cos(a), Math.sin(a))); } return L; })();
  const turbC = add(turbCase.build(C.white, 1.8, 0.75), barge);
  const rotor = new THREE.Group(); rotor.position.set(0, 2.6, 0); barge.add(rotor);
  const rotL = (() => { const L = new LS(); for (let i = 0; i < 5; i++) { const x = lerp(4.0, 6.4, i / 4), rr = lerp(0.45, 0.88, i / 4); for (let b = 0; b < 12; b++) { const a = b / 12 * Math.PI * 2 + i * 0.13; L.seg(v3(x, 0.1 * Math.cos(a), 0.1 * Math.sin(a)), v3(x + 0.12, rr * Math.cos(a + 0.25), rr * Math.sin(a + 0.25))); } } L.seg(v3(3.4, 0, 0), v3(9.2, 0, 0)); return L; })();
  const rot = add(rotL.build(C.cyan, 1.8, 0.95), rotor);
  const genC = add(new LS().box(6.95, 1.75, -0.9, 8.85, 3.45, 0.9).build(C.white, 1.8, 0.75), barge);
  const genR = new THREE.Group(); genR.position.set(0, 2.6, 0); barge.add(genR);
  const genRot = add((() => { const L = new LS(); for (let b = 0; b < 8; b++) { const a = b / 8 * Math.PI * 2; L.poly([v3(7.15, 0.62 * Math.cos(a), 0.62 * Math.sin(a)), v3(8.65, 0.62 * Math.cos(a), 0.62 * Math.sin(a))]); } L.circle(v3(7.15, 0, 0), 0.62, "yz", 24).circle(v3(8.65, 0, 0), 0.62, "yz", 24); return L; })().build(C.gold, 1.8, 0.9), genR);
  // condenser with tube bundle
  const cond = add((() => { const L = new LS().box(4.4, -0.6, -1.0, 6.0, 1.3, 1.0); for (let y = -0.2; y < 1.1; y += 0.32) for (const z of [-0.5, 0, 0.5]) L.seg(v3(4.4, y, z), v3(6.0, y, z)); return L; })().build(C.white, 1.5, 0.65), barge);
  // switchyard on the stern deck
  const swy = add((() => { const L = new LS().box(9.6, 1.6, -1.6, 11.6, 3.4, 1.6); for (const z of [-1, 0, 1]) { L.seg(v3(10.6, 3.4, z), v3(10.6, 4.1, z)); L.circle(v3(10.6, 3.75, z), 0.12, "xz", 10); } return L; })().build(C.white, 1.6, 0.75), barge);

  // flow paths
  const P = (a) => a.map((q) => v3(q[0], q[1], q[2]));
  const priPts = P([[RX, -0.9, 0], [RX, 2.6, 0], [RX, 3.3, 0], [-0.05, 3.3, 0], [-0.05, 2.4, 0.5], [-0.05, -0.3, 0.5], [-0.05, -1.05, 0], [-0.8, -1.05, 0], [RX, -1.05, 0]]);
  const secPts = P([[0.25, 0.0, 0.5], [0.25, 2.3, 0.5], [0.25, 4.05, 0.5], [3.6, 4.05, 0.5], [3.6, 2.6, 0.5], [6.6, 2.6, 0.5], [5.2, 1.3, 0.5], [5.2, -0.5, 0.5], [5.2, -1.0, 0.5], [1.2, -1.0, 0.5], [0.25, -1.0, 0.5]]);
  const seaPts = P([[4.6, -2.8, 0], [4.6, -1.6, 0], [4.6, 0.4, 0], [5.8, 0.4, 0], [6.4, 0.4, 0], [6.4, -0.8, 0], [6.4, -0.8, 3.5], [6.4, -0.8, 5.2]]);
  const pathLen = (pts) => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); return cum; };
  const along = (pts, cum, u, out) => { const L = cum[cum.length - 1], d = u * L; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return out.copy(pts[i - 1]).lerp(pts[i], clamp01(k)); };
  const priC = pathLen(priPts), secC = pathLen(secPts), seaC = pathLen(seaPts);
  const priLine = add(new LS().poly(priPts).build(C.gold, 3.0, 0.85), barge);
  const secLine = add(new LS().poly(secPts).build(C.white, 2.6, 0.75), barge);
  const seaLine = add(new LS().poly(seaPts).build(C.sea, 3.0, 0.85), barge);
  const pump = add(new LS().circle(v3(-0.8, -1.05, 0), 0.22, "xy", 18).seg(v3(-0.95, -1.2, 0), v3(-0.6, -1.05, 0)).seg(v3(-0.95, -0.9, 0), v3(-0.6, -1.05, 0)).build(C.gold, 1.8, 0.9), barge);
  const intake = add(new LS().box(3.9, -3.0, -0.8, 5.3, -2.7, 0.8).dash([v3(4.6, -4.6, 0), v3(4.6, -3.1, 0)], 0.3, 0.2).poly([v3(4.3, -3.5, 0), v3(4.6, -3.15, 0), v3(4.9, -3.5, 0)]).build(C.sea, 1.8, 0.8), barge);
  const tag = (t, c) => label([{ t, px: 92, c }], { w: 200, h: 200, s: 0.9, box: c });
  const tag1 = add(tag("1", "#ffca28"), barge); tag1.position.set(RX - 1.4, 3.3, 0.4);
  const tag2 = add(tag("2", "#f0f6ff"), barge); tag2.position.set(2.0, 4.6, 0.5);
  const tag3 = add(tag("3", "#29b6f6"), barge); tag3.position.set(7.2, -0.8, 3.6);
  const lblSep = add(label([{ t: "TIDAK BERSENTUHAN", px: 50, c: "#29b6f6" }], { s: 4.2, box: "#29b6f6" }), barge); lblSep.position.set(5.0, -2.4, 2.0);

  // particle pools
  const dot = canvasTex(64, 64, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(255,255,255,.6)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  function pool(n, size) {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: dot, vertexColors: true, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    p.frustumCulled = false; p.renderOrder = 28; return p;
  }
  const flowP = pool(260, 0.22); barge.add(flowP);
  const plumeP = pool(140, 0.5); S.add(plumeP);
  const cableP = pool(30, 0.45); S.add(cableP);

  // ---------------- DETAIL A: fission core (inside vessel, z = 0 plane) ----------------
  const core = new THREE.Group(); barge.add(core);
  const NUC = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) NUC.push(v3(RX - 0.6 + col * 0.4, 0.05 + row * 0.42, 0));
  const icoL = new LS().edges(new THREE.IcosahedronGeometry(0.1, 1), 1);
  const fragL = new LS().edges(new THREE.IcosahedronGeometry(0.065, 0), 1);
  const nucM = NUC.map((p) => { const m = icoL.build(C.gold, 1.6, 0.9); m.position.copy(p); core.add(m); return m; });
  const fragM = NUC.map(() => [0, 1].map(() => { const m = fragL.build(C.red, 1.5, 0.9); core.add(m); return m; }));
  const flashP = pool(12, 0.5); core.add(flashP);
  const neutP = pool(200, 0.09); core.add(neutP);
  const rodX = [RX - 0.4, RX, RX + 0.4];
  const rodG = new THREE.Group(); core.add(rodG);
  const rodL = new LS(); for (const x of rodX) rodL.box(x - 0.035, 0, -0.035, x + 0.035, 1.7, 0.035);
  const rods = rodG.add(rodL.build(C.cyan, 1.8, 0.95)) && rodG.children[0];
  const detailRing = add(new LS().circle(v3(RX, 0.47, 0.02), 0.95, "xy", 60).build(C.gold, 1.6, 0.8), core);
  const lblDet = add(label([{ t: "DETAIL A", px: 60, c: "#ffca28" }], { s: 0.8 }), core); lblDet.position.set(RX + 0.55, 1.45, 0.05);
  const lblU = add(label([{ t: "U-235", px: 60, c: "#ffca28" }], { s: 0.5 }), core); lblU.position.set(RX - 0.95, 0.05, 0.05);
  const lblRod = add(label([{ t: "BATANG KENDALI", px: 50, c: "#4fc3f7" }], { s: 0.8 }), core); lblRod.position.set(RX + 0.2, 1.62, 0.05);
  // precomputed chain reaction (seeded)
  const FIS = { splits: [], neut: [] };
  {
    const rnd = mulberry(23), DT = 0.62, REC = 1.5, last = NUC.map(() => -99), busy = NUC.map(() => -99);
    const t0 = E.tabrak + 0.05, rodsIn = E.serap;
    FIS.neut.push({ a: v3(RX - 1.3, 0.47, 0), b: NUC[5].clone(), ta: t0 - 0.7, tb: t0, ab: false });
    const q = [[5, t0]];
    while (q.length && FIS.splits.length < 140) {
      q.sort((x, y) => x[1] - y[1]);
      const [n, T] = q.shift();
      if (T > s.s5) break;
      if (T - last[n] < REC) continue;
      last[n] = T; FIS.splits.push({ n, T, d: v3(rnd() - 0.5, rnd() - 0.5, 0).normalize() });
      const free = NUC.map((p, i) => i).filter((i) => i !== n && T + DT - last[i] >= REC && busy[i] < T + DT - 0.05).sort((x, y) => NUC[x].distanceTo(NUC[n]) - NUC[y].distanceTo(NUC[n]) + (rnd() - 0.5) * 0.3);
      const after = T > rodsIn;
      const hits = after ? 1 : 2;
      let made = 0;
      for (const i of free) { if (made >= hits) break; busy[i] = T + DT; FIS.neut.push({ a: NUC[n].clone(), b: NUC[i].clone(), ta: T, tb: T + DT, ab: false }); q.push([i, T + DT]); made++; }
      for (let k = made; k < 3; k++) {
        if (after) { const rx = rodX.reduce((b, x) => Math.abs(x - NUC[n].x) < Math.abs(b - NUC[n].x) ? x : b, rodX[0]); const yy = NUC[n].y + (rnd() - 0.5) * 0.3; FIS.neut.push({ a: NUC[n].clone(), b: v3(rx + (rx > NUC[n].x ? -0.04 : 0.04), yy, 0), ta: T, tb: T + DT * 0.6, ab: true }); }
        else { const a = rnd() * Math.PI * 2; FIS.neut.push({ a: NUC[n].clone(), b: NUC[n].clone().add(v3(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0)), ta: T, tb: T + DT * 1.2, ab: false, esc: true }); }
      }
    }
  }

  // ---------------- UNIT 2 (ghost copy) ----------------
  const unit2 = new THREE.Group(); unit2.position.set(0, 0, -16); S.add(unit2);
  const u2 = [hullLines().build(C.cyan, 1.8, 0.6), houseLines().build(C.cyan, 1.6, 0.5), roofLines().build(C.cyan, 1.6, 0.5)]; u2.forEach((m) => add(m, unit2));
  const lblU2 = add(label([{ t: "UNIT 2", px: 70 }], { s: 2.6, box: "#4fc3f7" }), unit2); lblU2.position.set(-11.5, 6.2, 0);
  const dim200 = add(new LS().poly([v3(-15, 1.6, 3.5), v3(-16.5, 1.6, 3.5)]).poly([v3(-15, 1.6, -19.5), v3(-16.5, 1.6, -19.5)]).seg(v3(-16, 1.6, 3.5), v3(-16, 1.6, -19.5)).poly([v3(-16.3, 1.6, 2.7), v3(-16, 1.6, 3.5), v3(-15.7, 1.6, 2.7)]).poly([v3(-16.3, 1.6, -18.7), v3(-16, 1.6, -19.5), v3(-15.7, 1.6, -18.7)]).build(C.gold, 2.0, 0.9));
  const lbl200 = add(label([{ t: "TOTAL 200 MW", px: 64, c: "#ffca28" }], { s: 4.4, box: "#ffca28" })); lbl200.position.set(-19, 4.2, -8);

  // ---------------- shore, pier, tower, town, cable ----------------
  const shore = add((() => { const L = new LS().box(16, -6, -26, 46, 1.2, 24); for (let z = -25; z < 24; z += 1.2) L.seg(v3(16, 1.2, z), v3(17.2, 1.2, z + 0.9)); for (let y = -5; y < 1; y += 1.2) L.seg(v3(16, y, 24), v3(17.4, y + 1.1, 24)); return L; })().build(C.white, 1.8, 0.7));
  const pier = add(new LS().box(12.8, 0.6, 4.4, 16, 1.0, 5.6).seg(v3(11.5, 1.4, 3.5), v3(13.2, 0.9, 4.6)).seg(v3(-11.5, 1.4, 3.5), v3(-9.8, 0.8, 7.5)).box(-10.4, 0.5, 7.2, -9.2, 0.9, 8.0).build(C.dim, 1.6, 0.9));
  const TWX = 20, TWZ = -1, TWH = 6.2;
  const tower = add((() => { const L = new LS(); const lv = (y, w) => [v3(TWX - w, y, TWZ - w), v3(TWX + w, y, TWZ - w), v3(TWX + w, y, TWZ + w), v3(TWX - w, y, TWZ + w)]; const ys = [1.2, 2.8, 4.2, 5.4, 1.2 + TWH]; const ws = [1.0, 0.7, 0.5, 0.35, 0.18]; for (let i = 0; i < ys.length; i++) { L.poly(lv(ys[i], ws[i]), true); if (i) { const a = lv(ys[i - 1], ws[i - 1]), b = lv(ys[i], ws[i]); for (let k = 0; k < 4; k++) { L.seg(a[k], b[k]); L.seg(a[k], b[(k + 1) % 4]); } } } L.seg(v3(TWX - 1.4, 5.4, TWZ), v3(TWX + 1.4, 5.4, TWZ)); return L; })().build(C.white, 1.6, 0.75));
  const cablePts = []; { const a = v3(10.6, 4.1, 0), b = v3(TWX - 1.4, 5.4, TWZ); for (let i = 0; i <= 24; i++) { const u = i / 24; const p = a.clone().lerp(b, u); p.y -= Math.sin(Math.PI * u) * 1.6; cablePts.push(p); } }
  const cableC = pathLen(cablePts);
  const cable = add(new LS().poly(cablePts).build(C.gold, 2.4, 0.95));
  const HOUSES = [[25, -9], [28, -11], [31, -8], [26, -4], [30, -3], [34, -6], [33, 1], [27, 2]];
  const town = add((() => { const L = new LS(); for (const [x, z] of HOUSES) { L.box(x - 0.9, 1.2, z - 0.7, x + 0.9, 2.4, z + 0.7); L.poly([v3(x - 0.9, 2.4, z - 0.7), v3(x, 3.1, z - 0.7), v3(x + 0.9, 2.4, z - 0.7)]); L.poly([v3(x - 0.9, 2.4, z + 0.7), v3(x, 3.1, z + 0.7), v3(x + 0.9, 2.4, z + 0.7)]); L.seg(v3(x, 3.1, z - 0.7), v3(x, 3.1, z + 0.7)); } return L; })().build(C.white, 1.4, 0.6));
  const winP = pool(HOUSES.length * 2, 0.55); S.add(winP);
  { const wp = winP.geometry.attributes.position; HOUSES.forEach(([x, z], i) => { wp.setXYZ(i * 2, x - 0.35, 1.8, z + 0.72); wp.setXYZ(i * 2 + 1, x + 0.35, 1.8, z + 0.72); }); }
  // land site marking (s1 hook) and the new water site marking (s8)
  const tapakL = add(new LS().dash([v3(23, 1.25, -14), v3(37, 1.25, -14), v3(37, 1.25, 4), v3(23, 1.25, 4), v3(23, 1.25, -14)], 0.8, 0.45).build(C.red, 2.6, 0.95));
  const tapakT = add(flatLabel([{ t: "TAPAK = DARAT", c: "#ef5350", px: 96 }], 11)); tapakT.position.set(30, 1.3, 7.2);
  const airL = add(new LS().dash([v3(-14, 0.06, -6), v3(14, 0.06, -6), v3(14, 0.06, 7), v3(-14, 0.06, 7), v3(-14, 0.06, -6)], 0.8, 0.45).build(C.cyan, 2.8, 1.0));
  const airT = add(label([{ t: "+ PERAIRAN", px: 70, c: "#4fc3f7" }], { s: 6, box: "#4fc3f7" })); airT.position.set(9, 3.2, 7);

  // ---------------- title block (AUDIRA in-world) ----------------
  const tbTex = canvasTex(1024, 420, (c, w, h) => {
    c.fillStyle = "rgba(6,19,39,.92)"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f0f6ff"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.lineWidth = 2; c.strokeStyle = "rgba(79,195,247,.7)"; c.beginPath(); c.moveTo(8, 132); c.lineTo(w - 8, 132); c.moveTo(8, 222); c.lineTo(w - 8, 222); c.moveTo(8, 312); c.lineTo(w - 8, 312); c.moveTo(w / 2, 132); c.lineTo(w / 2, h - 8); c.stroke();
    c.textBaseline = "middle"; c.font = '700 54px "JetBrains Mono", monospace'; c.fillStyle = "#f0f6ff"; c.fillText("PLTN TERAPUNG — STUDI GAMBAR", 34, 72);
    const kv = (k, v, x, y, vc) => { c.font = '500 34px "JetBrains Mono", monospace'; c.fillStyle = "#6b8bb2"; c.fillText(k, x, y); c.font = '700 40px "JetBrains Mono", monospace'; c.fillStyle = vc; c.fillText(v, x + 190, y); };
    kv("OLEH:", "AUDIRA", 34, 177, "#ffca28"); kv("LEMBAR:", "23", w / 2 + 26, 177, "#f0f6ff");
    kv("SKALA:", "NTS", 34, 267, "#f0f6ff"); kv("TIPE:", "SKEMA", w / 2 + 26, 267, "#4fc3f7");
    kv("STATUS:", "ILUSTRASI", 34, 360, "#ef5350"); kv("SERI:", "CARA KERJA", w / 2 + 26, 360, "#4fc3f7");
  });
  const tb = new THREE.Mesh(new THREE.PlaneGeometry(9, 9 * 420 / 1024), new THREE.MeshBasicMaterial({ map: tbTex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  tb.position.set(-7.5, 0.6, 13.2); tb.rotation.set(-0.95, -0.42, -0.25); tb.renderOrder = 26; S.add(tb);
  // north arrow on the sheet
  const north = add(new LS().circle(v3(-20, 0.05, 12), 1.4, "xz", 40).poly([v3(-20, 0.05, 13.2), v3(-20, 0.05, 10.2), v3(-20.5, 0.05, 11.1)]).seg(v3(-20, 0.05, 10.2), v3(-19.5, 0.05, 11.1)).build(C.dim, 1.5, 0.9));

  // ---------------- s7 route map: shipyard, tug, ghosts, Lomonosov sheet ----------------
  const YD = v3(-18, 0, -34);
  const yard = add((() => { const L = new LS().box(YD.x - 13, -1.5, YD.z - 5, YD.x + 13, 0.4, YD.z + 5); for (const x of [YD.x - 8, YD.x + 8]) for (const z of [YD.z - 5.5, YD.z + 5.5]) L.seg(v3(x, 0.4, z), v3(x, 12, z)); L.box(YD.x - 9, 12, YD.z - 6, YD.x + 9, 12.8, YD.z + 6); L.seg(v3(YD.x + 2, 12, YD.z), v3(YD.x + 2, 8, YD.z)); return L; })().build(C.white, 1.8, 0.8));
  const lblYard = add(label([{ t: "GALANGAN", px: 72 }], { s: 6, box: "#f0f6ff" })); lblYard.position.set(YD.x, 15.5, YD.z);
  const towPts = P([[YD.x, 0, YD.z], [YD.x - 4, 0, YD.z + 14], [-12, 0, -4], [0, 0, 0]]);
  const towCurve = new THREE.CatmullRomCurve3(towPts);
  const towL = add(new LS().dash(towCurve.getPoints(80), 1.2, 0.8).build(C.gold, 2.4, 0.95));
  const ghost = new THREE.Group(); S.add(ghost);
  [hullLines().build(C.cyan, 1.8, 0.7), houseLines().build(C.cyan, 1.6, 0.6), roofLines().build(C.cyan, 1.6, 0.6)].forEach((m) => add(m, ghost));
  const tugL = (() => { const L = new LS(); const sh = new THREE.Shape([new THREE.Vector2(-2.2, -0.6), new THREE.Vector2(2.0, -0.6), new THREE.Vector2(3.0, 0.8), new THREE.Vector2(-2.6, 0.8)]); const g = new THREE.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: false }); g.translate(0, 0, -1.2); L.edges(g, 20); L.box(-1.6, 0.8, -0.8, 0.6, 2.2, 0.8); L.box(-1.2, 2.2, -0.3, -0.6, 3.2, 0.3); return L; })();
  const tug = new THREE.Group(); S.add(tug); add(tugL.build(C.gold, 2.0, 0.95), tug);
  const towRope = add(new LS().seg(v3(0, 0, 0), v3(1, 0, 0)).build(C.gold, 1.6, 0.8));
  const lblTug = add(label([{ t: "KAPAL TUNDA", px: 60, c: "#ffca28" }], { s: 4.5 }));
  // Lomonosov sheet (separate drawing frame)
  const LM = v3(10, 0, -64);
  const lmFrame = add(new LS().poly([v3(LM.x - 22, 0.05, LM.z - 13), v3(LM.x + 22, 0.05, LM.z - 13), v3(LM.x + 22, 0.05, LM.z + 13), v3(LM.x - 22, 0.05, LM.z + 13)], true).poly([v3(LM.x - 21.3, 0.05, LM.z - 12.3), v3(LM.x + 21.3, 0.05, LM.z - 12.3), v3(LM.x + 21.3, 0.05, LM.z + 12.3), v3(LM.x - 21.3, 0.05, LM.z + 12.3)], true).build(C.white, 1.8, 0.8));
  const lmG = new THREE.Group(); lmG.position.copy(LM); lmG.scale.set(1.2, 1, 1.15); S.add(lmG);
  [hullLines().build(C.white, 2.0, 0.85), houseLines().build(C.white, 1.8, 0.75), roofLines().build(C.white, 1.8, 0.75)].forEach((m) => add(m, lmG));
  const ice = add((() => { const L = new LS(), rnd = mulberry(7); for (let i = 0; i < 26; i++) { const cx = LM.x + (rnd() - 0.5) * 40, cz = LM.z + (rnd() - 0.5) * 22; if (Math.abs(cx - LM.x) < 16 && Math.abs(cz - LM.z) < 6) continue; const n = 6 + Math.floor(rnd() * 3), rr = 0.8 + rnd() * 1.6, pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; const q = rr * (0.7 + rnd() * 0.5); pts.push(v3(cx + Math.cos(a) * q, 0.08, cz + Math.sin(a) * q)); } L.poly(pts, true); } return L; })().build(C.white, 1.4, 0.55));
  const lmDim = add(new LS().seg(v3(LM.x - 14.6, 0.1, LM.z + 7), v3(LM.x + 14.6, 0.1, LM.z + 7)).seg(v3(LM.x - 14.6, 0.1, LM.z + 4.4), v3(LM.x - 14.6, 0.1, LM.z + 7.6)).seg(v3(LM.x + 14.6, 0.1, LM.z + 4.4), v3(LM.x + 14.6, 0.1, LM.z + 7.6)).poly([v3(LM.x - 13.6, 0.1, LM.z + 6.6), v3(LM.x - 14.6, 0.1, LM.z + 7), v3(LM.x - 13.6, 0.1, LM.z + 7.4)]).poly([v3(LM.x + 13.6, 0.1, LM.z + 6.6), v3(LM.x + 14.6, 0.1, LM.z + 7), v3(LM.x + 13.6, 0.1, LM.z + 7.4)]).build(C.gold, 2.2, 0.95));
  const lmT1 = add(flatLabel([{ t: "AKADEMIK LOMONOSOV", c: "#f0f6ff", px: 84 }], 22)); lmT1.position.set(LM.x, 0.1, LM.z - 9.6);
  const lmT2 = add(flatLabel([{ t: "2 × 35 MW", c: "#ffca28", px: 120 }], 13)); lmT2.position.set(LM.x, 0.1, LM.z + 9.6);
  const lmT3 = add(flatLabel([{ t: "ARKTIK RUSIA · SEJAK 2020", c: "#4fc3f7", px: 72 }], 20, { w: 1400 })); lmT3.position.set(LM.x, 0.1, LM.z - 15.4);
  const retPts = P([[LM.x - 15, 0, LM.z + 2], [LM.x - 30, 0, LM.z + 8], [YD.x - 8, 0, YD.z - 10], [YD.x, 0, YD.z - 2]]);
  const retCurve = new THREE.CatmullRomCurve3(retPts);
  const retL = add(new LS().dash(retCurve.getPoints(80), 1.2, 0.8).build(C.cyan, 2.4, 0.95));
  const lbl12 = add(label([{ t: "TIAP 12 TAHUN", px: 64, c: "#4fc3f7" }], { s: 7.5, box: "#4fc3f7" }));
  const ghost2 = new THREE.Group(); ghost2.scale.set(1.2, 1, 1.15); S.add(ghost2);
  [hullLines().build(C.cyan, 1.6, 0.6), houseLines().build(C.cyan, 1.4, 0.5)].forEach((m) => add(m, ghost2));

  // foreground drafting crosses for parallax depth
  const fg = add((() => { const L = new LS(), rnd = mulberry(91); for (let i = 0; i < 40; i++) { const p = v3((rnd() - 0.5) * 70, rnd() * 10 + 1, (rnd() - 0.5) * 60 - 5); L.seg(p.clone().add(v3(-0.25, 0, 0)), p.clone().add(v3(0.25, 0, 0))); L.seg(p.clone().add(v3(0, -0.25, 0)), p.clone().add(v3(0, 0.25, 0))); } return L; })().build(C.cyan, 1.4, 0.35));

  // ---------------- post: NaN guard -> bloom -> output -> paper grade ----------------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,20.);}" })));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.7, 0.45, 0.18);
  comp.addPass(bloom);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(c,c*vec3(.92,1.0,1.08),.5);c+=vec3(.0,.008,.02)*(1.-l);float v=smoothstep(1.15,.35,length((vUv-vec2(.5,.47))*vec2(1.,1.25)));c*=mix(.72,1.,v);gl_FragColor=vec4(clamp(c,0.,1.),1.);}" })));

  // ---------------- camera: one continuous spline through anchors ----------------
  const keysRaw = [
    [0, -19, 12.5, 25, 3, 0.8, 0],
    [E.halma, -16.5, 11.5, 22, 3.5, 0.8, 0],
    [E.lokasi, -8, 19, 33, 10, 0.2, -1],
    [s.s1e, -6, 21, 35, 11, 0, -2],
    [E.rosatom, -22, 30, 26, 1, 0, -12],
    [E.dua + 0.6, -26, 34, 22, 0, 0, -14],
    [E.mw + 0.4, -24, 33, 24, -1, 0, -13],
    [E.izin, -16, 18, 24, -2, 1.5, -2],
    [s.s2e, -9, 9, 15, -1.5, 1.6, 0],
    [E.jantung + 0.6, -6.5, 5.5, 10.5, -1.4, 1.2, 0],
    [E.neutron, -2.6, 1.5, 4.6, RX, 0.55, 0],
    [E.tabrak + 0.3, RX + 0.15, 0.75, 3.15, RX, 0.38, 0],
    [E.belah + 0.6, RX - 0.2, 0.8, 3.0, RX, 0.4, 0],
    [E.batang, RX + 0.1, 0.95, 3.35, RX, 0.5, 0],
    [E.stabil, RX - 0.1, 1.0, 3.6, RX, 0.5, 0],
    [s.s3e + 0.2, -2.4, 2.2, 6.0, -1.2, 0.9, 0],
    [E.pompa, -3.2, 3.2, 8.4, -1.0, 0.9, 0],
    [E.didih, -2.4, 3.6, 9.0, -0.6, 1.0, 0],
    [E.sirkuit, 0.5, 4.6, 11, 1.0, 1.4, 0],
    [E.uap4 + 0.3, 2.6, 5.0, 11.5, 3.2, 1.8, 0],
    [E.turbin + 0.3, 3.6, 4.4, 8.2, 5.2, 2.0, 0],
    [E.gen + 0.3, 6.0, 4.6, 8.4, 7.4, 2.0, 0],
    [E.batu + 0.5, 6.0, 6.0, 11.5, 7.0, 2.0, 0],
    [E.kabel, 7.0, 9.0, 19, 14, 1.8, -1],
    [s.s5e, 10, 9, 20, 21, 1.6, -3],
    [E.laut + 0.4, 9.0, 2.2, 13.5, 5.6, -0.7, 0],
    [E.kond + 0.3, 7.0, 1.6, 10.0, 5.2, -0.3, 0],
    [E.sentuh + 0.4, 3.0, 2.2, 12.0, 2.6, 0.2, 0],
    [E.hangat, 10.5, 5.5, 17.5, 6.5, -0.4, 6],
    [s.s6e, 11, 8, 20, 5, -0.4, 5],
    [E.galangan, -14, 56, 18, -12, 0, -24],
    [E.tunda + 0.6, -12, 58, 22, -10, 0, -18],
    [E.akad, 4, 50, -24, 8, 0, -58],
    [E.th, 10, 46, -28, 10, 0, -62],
    [E.renc + 0.4, 0, 70, -18, -4, 0, -54],
    [s.s7e, -4, 74, -8, -6, 0, -50],
    [E.revisi, -12, 25, 33, 0, 0, -3],
    [E.perairan + 0.6, -11, 23, 31, 0.5, 0, -2.5],
    [s.dur, -10.5, 22.5, 30, 1, 0, -2.5],
  ];
  // distance multipliers per key (first pass was too close for 9:16): dive keys stay 1
  const ZM = { };
  const zf = (t) => (t >= E.neutron - 0.05 && t <= E.stabil + 0.05 ? 1 : t >= s.s7 - 0.1 && t < s.s8 ? 1.55 : t >= s.s8 ? 1.3 : t >= s.s4 && t < s.s7 ? 1.4 : 1.35);
  for (const k of keysRaw) { const f = zf(k[0]); for (let j = 1; j <= 3; j++) k[j] = k[j + 3] + (k[j] - k[j + 3]) * f; }
  const keys = []; for (const k of keysRaw) if (!keys.length || k[0] > keys[keys.length - 1][0] + 0.25) keys.push(k);
  const camT = track(keys);

  const tmp = v3(0, 0, 0), q2 = v3(0, 0, 0);
  const spinAng = (t, a, w, d = 1.2) => (t < a ? 0 : t < a + d ? (w * (t - a) * (t - a)) / (2 * d) : w * (d / 2 + t - a - d));

  return function draw(t) {
    if (!(t >= 0)) t = 0;
    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]);
    cam.position.x += 0.06 * Math.sin(t * 0.37); cam.position.y += 0.05 * Math.sin(t * 0.29 + 1.1);
    cam.lookAt(c[3], c[4], c[5]);
    updWaves(t);
    const dive = win(t, E.neutron - 0.4, s.s3e - 0.2, 0.6, 0.6); // inside DETAIL A
    const map = win(t, s.s7 - 0.2, s.s7e, 0.8, 0.9);

    // hull & superstructure: ghost during section and dive
    const sec = ramp(t, E.jantung - 0.2, E.jantung + 0.8) * (1 - ramp(t, s.s7 - 0.6, s.s7 + 0.4));
    setL(hull, (0.95 - 0.55 * sec) * (1 - 0.8 * dive));
    setL(house, (0.85 - 0.55 * sec) * (1 - 0.85 * dive));
    setL(nearW, 0.7 * (1 - sec) * (1 - dive));
    roofG.position.y = 3.2 * eout(sec); setL(roof, (0.85 - 0.3 * sec) * (1 - 0.9 * dive));
    setL(wl, 0.7 * (1 - dive));
    setL(secCut, 0.9 * win(t, E.jantung - 0.3, E.neutron + 0.2, 0.3, 0.4) + 0.0, ramp(t, E.jantung - 0.3, E.jantung + 0.6));
    lblA.material.opacity = win(t, E.jantung, E.neutron, 0.3, 0.3); lblA.visible = lblA.material.opacity > 0.01;
    lblU1.material.opacity = win(t, E.dua - 0.2, s.s2e - 0.4, 0.3, 0.4) + win(t, s.s8, s.dur + 9, 0.6, 0.1) * 0.0; lblU1.visible = lblU1.material.opacity > 0.01;

    // interior draw-in
    const din = ramp(t, E.jantung - 0.1, E.jantung + 1.6);
    const iop = (1 - ramp(t, s.s7 - 0.5, s.s7 + 0.3)) * (1 - 0.6 * map);
    setL(contain, 0.75 * iop * (1 - 0.5 * dive), din); setL(vessel, 0.9 * iop * (1 - 0.65 * dive), din); setL(sg, 0.8 * iop * (1 - 0.8 * dive), din);
    const machOp = iop * (1 - 0.9 * dive);
    setL(turbC, 0.75 * machOp, din); setL(rot, 0.95 * machOp, din); setL(genC, 0.75 * machOp, din); setL(genRot, 0.9 * machOp, din);
    setL(cond, (0.65 + 0.3 * win(t, E.kond - 0.3, E.sentuh, 0.3, 0.5)) * machOp, din); setL(swy, 0.75 * machOp, din);
    rotor.rotation.x = spinAng(t, E.uap5 - 0.4, 7); genR.rotation.x = spinAng(t, E.gen - 1.4, 7);

    // loops
    const pOn = ramp(t, E.air4 - 0.6, E.air4 + 0.6) * iop, sOn = ramp(t, E.panas4 - 0.2, E.sirkuit + 0.6) * iop, wOn = ramp(t, E.laut - 0.4, E.laut + 0.8) * iop;
    const loopDim = 1 - 0.55 * win(t, E.turbin, E.listrik, 0.5, 0.5) * 0 ;
    setL(priLine, 0.85 * pOn * loopDim * (1 - dive), ramp(t, E.air4 - 0.6, E.air4 + 1.0));
    setL(secLine, 0.75 * sOn * (1 - dive), ramp(t, E.panas4 - 0.2, E.uap4 + 0.4));
    setL(seaLine, 0.9 * wOn, ramp(t, E.laut - 0.4, E.kond + 0.3));
    setL(pump, 0.9 * pOn * (1 - dive), 1);
    setL(intake, 0.8 * wOn, ramp(t, E.laut - 0.2, E.laut + 1.0));
    const tg = (sp, on) => { sp.material.opacity = on; sp.visible = on > 0.01; };
    tg(tag1, win(t, E.pompa - 0.3, s.s5 + 0.5, 0.3, 0.4) + win(t, E.sentuh - 0.2, s.s6e, 0.3, 0.4));
    tg(tag2, win(t, E.sirkuit - 0.3, s.s5 + 0.5, 0.3, 0.4) + win(t, E.sentuh - 0.2, s.s6e, 0.3, 0.4));
    tg(tag3, win(t, E.kond - 0.3, s.s6e, 0.3, 0.4));
    tg(lblSep, win(t, E.sentuh - 0.1, E.kembali + 0.6, 0.3, 0.4));
    {
      const fp = flowP.geometry.attributes.position, fc = flowP.geometry.attributes.color; let k = 0;
      const emit = (pts, cum, n, speed, op, colFn) => { for (let i = 0; i < n; i++) { const u = (i / n + t * speed) % 1; along(pts, cum, u, tmp); fp.setXYZ(k, tmp.x, tmp.y, tmp.z); const col = colFn(u); fc.setXYZ(k, col[0] * op, col[1] * op, col[2] * op); k++; } };
      const steamEnd = secC[6] / secC[secC.length - 1];
      emit(priPts, priC, 70, 0.11, pOn * (1 - dive) * 1.1, () => [1.0, 0.72, 0.15]);
      emit(secPts, secC, 100, 0.06, sOn * (1 - dive), (u) => (u < steamEnd ? [0.95, 0.97, 1.0] : [0.3, 0.75, 0.97]));
      emit(seaPts, seaC, 70, 0.1, wOn, (u) => { const w = clamp01((u - 0.5) * 2.5); return [lerp(0.16, 1.0, w), lerp(0.7, 0.6, w), lerp(0.97, 0.25, w)]; });
      for (; k < 260; k++) { fp.setXYZ(k, 0, -50, 0); fc.setXYZ(k, 0, 0, 0); }
      fp.needsUpdate = fc.needsUpdate = true;
    }
    // warm discharge plume (routine impact): drifts out from the outfall, warm gold fading to sea blue
    {
      const on = ramp(t, E.kembali - 0.6, E.hangat) * (1 - ramp(t, s.s7 - 0.4, s.s7 + 0.4));
      const pp = plumeP.geometry.attributes.position, pc = plumeP.geometry.attributes.color, rnd = mulberry(5);
      for (let i = 0; i < 140; i++) {
        const a = (rnd() - 0.5) * 1.4, sp = 0.6 + rnd() * 0.6, ph = rnd();
        const u = (ph + t * 0.09 * sp) % 1, d = 0.4 + u * 9;
        pp.setXYZ(i, 6.4 + Math.sin(a) * d * 0.8, -0.7 + 0.75 * clamp01(u * 3) + 0.05 * Math.sin(t + i), 4.2 + Math.cos(a) * d);
        const f = on * (1 - u) * 0.7;
        pc.setXYZ(i, lerp(1.0, 0.16, u) * f, lerp(0.62, 0.7, u) * f, lerp(0.25, 0.97, u) * f);
      }
      pp.needsUpdate = pc.needsUpdate = true; plumeP.visible = on > 0.01;
    }

    // DETAIL A core
    const cv = win(t, E.jantung + 0.4, s.s4 + 1.2, 0.5, 0.8);
    core.visible = cv > 0.01;
    if (core.visible) {
      setL(detailRing, 0.8 * cv, ramp(t, E.neutron - 0.4, E.neutron + 0.6));
      const lo = (sp, v) => { sp.material.opacity = v; sp.visible = v > 0.01; };
      lo(lblDet, cv * ramp(t, E.neutron - 0.2, E.neutron + 0.4)); lo(lblU, cv * win(t, E.tabrak - 0.2, E.batang, 0.3, 0.4)); lo(lblRod, cv * win(t, E.batang - 0.1, s.s3e, 0.3, 0.4));
      // rods: hover above the core, insert between rows on "menyerap"
      const ins = ramp(t, E.batang - 0.1, E.serap + 0.4);
      rodG.position.y = lerp(1.3, 0.28, ins); setL(rods, 0.95 * cv * ramp(t, E.jantung + 0.4, E.neutron), 1);
      NUC.forEach((p, i) => {
        let last = null; for (const sp of FIS.splits) { if (sp.n === i && sp.T <= t) last = sp; }
        const m = nucM[i], f0 = fragM[i][0], f1 = fragM[i][1];
        if (!last || t - last.T > 1.5) { const back_ = last ? ramp(t, last.T + 1.1, last.T + 1.5) : 1; setL(m, 0.9 * cv * back_); m.scale.setScalar(1); setL(f0, 0); setL(f1, 0); m.rotation.set(t * 0.4 + i, t * 0.3, 0); }
        else {
          const u = (t - last.T) / 0.9; setL(m, 0); const op = 0.95 * cv * (1 - ramp(t, last.T + 0.6, last.T + 1.1));
          const dd = 0.22 * eout(u);
          f0.position.copy(p).addScaledVector(last.d, dd); f1.position.copy(p).addScaledVector(last.d, -dd); f0.rotation.z = t * 2; f1.rotation.z = -t * 2;
          setL(f0, op); setL(f1, op);
        }
      });
      const npos = neutP.geometry.attributes.position, ncol = neutP.geometry.attributes.color; let k = 0;
      for (const n of FIS.neut) {
        if (k >= 198) break;
        if (t < n.ta || t > n.tb + 0.25) continue;
        const u = clamp01((t - n.ta) / (n.tb - n.ta));
        const fade = t > n.tb ? 1 - (t - n.tb) / 0.25 : 1;
        const op = cv * fade * (n.esc ? 1 - u * 0.7 : 1);
        tmp.copy(n.a).lerp(n.b, u); npos.setXYZ(k, tmp.x, tmp.y, 0.03);
        const cc = n.ab ? [0.5, 0.85, 1.0] : [1.0, 0.95, 0.75]; ncol.setXYZ(k, cc[0] * op, cc[1] * op, cc[2] * op); k++;
        q2.copy(n.a).lerp(n.b, clamp01(u - 0.08)); npos.setXYZ(k, q2.x, q2.y, 0.03); ncol.setXYZ(k, cc[0] * op * 0.4, cc[1] * op * 0.4, cc[2] * op * 0.4); k++;
      }
      for (; k < 200; k++) { npos.setXYZ(k, 0, -50, 0); ncol.setXYZ(k, 0, 0, 0); }
      npos.needsUpdate = ncol.needsUpdate = true;
      const fpos = flashP.geometry.attributes.position, fcol = flashP.geometry.attributes.color;
      NUC.forEach((p, i) => { let fl = 0; for (const sp of FIS.splits) if (sp.n === i) fl = Math.max(fl, win(t, sp.T, sp.T + 0.12, 0.04, 0.25)); fpos.setXYZ(i, p.x, p.y, 0.02); const o = fl * cv; fcol.setXYZ(i, o, o * 0.75, o * 0.35); });
      fpos.needsUpdate = fcol.needsUpdate = true;
    }

    // UNIT 2 and the 200 MW bracket
    const u2d = ramp(t, E.dua - 0.4, E.dua + 1.2);
    const u2op = (1 - 0.6 * ramp(t, s.s3 - 0.5, s.s3 + 0.5)) * (1 - dive);
    u2.forEach((m) => setL(m, 0.6 * u2op * (t > E.dua - 0.4 ? 1 : 0), u2d));
    lblU2.material.opacity = win(t, E.dua, s.s2e - 0.4, 0.3, 0.4); lblU2.visible = lblU2.material.opacity > 0.01;
    setL(dim200, 0.9 * win(t, E.mw - 0.6, s.s2e - 0.3, 0.3, 0.5), ramp(t, E.mw - 0.6, E.mw + 0.3));
    lbl200.material.opacity = win(t, E.mw - 0.2, s.s2e - 0.3, 0.3, 0.5); lbl200.visible = lbl200.material.opacity > 0.01;

    // shore & cable
    const shoreOp = 1 - 0.9 * dive;
    setL(shore, 0.7 * shoreOp); setL(pier, 0.9 * shoreOp); setL(tower, 0.75 * shoreOp); setL(town, 0.6 * shoreOp);
    setL(cable, 0.95 * shoreOp, ramp(t, E.listrik - 0.6, E.kabel + 0.6) + (t < s.s5 ? 0.0 : 0));
    {
      const on = ramp(t, E.kabel - 0.2, E.kabel + 0.4) * (1 - dive);
      const cp = cableP.geometry.attributes.position, cc = cableP.geometry.attributes.color;
      for (let i = 0; i < 30; i++) { const u = (i / 30 + t * 0.35) % 1; along(cablePts, cableC, u, tmp); cp.setXYZ(i, tmp.x, tmp.y, tmp.z); cc.setXYZ(i, on, on * 0.8, on * 0.2); }
      cp.needsUpdate = cc.needsUpdate = true; cableP.visible = on > 0.01;
      const lit = ramp(t, E.darat5 - 0.6, E.darat5 + 0.6) * shoreOp, wc = winP.geometry.attributes.color;
      for (let i = 0; i < HOUSES.length * 2; i++) { const o = lit * (0.7 + 0.3 * Math.sin(i * 2.1)) ; wc.setXYZ(i, o, o * 0.78, o * 0.3); }
      wc.needsUpdate = true;
    }
    const tap = ramp(t, E.lokasi - 0.4, E.darat1 + 0.2);
    setL(tapakL, 0.95 * (1 - dive) * (1 - 0.6 * ramp(t, s.s2 + 1, s.s2 + 2)), tap);
    tapakT.material.opacity = tap * (1 - 0.6 * ramp(t, s.s2 + 1, s.s2 + 2)) * (1 - dive); tapakT.visible = tapakT.material.opacity > 0.01;
    const air = ramp(t, E.perairan - 0.9, E.perairan + 0.3);
    setL(airL, 1.0 * air, air); airT.material.opacity = air; airT.visible = air > 0.01;
    tb.material.opacity = 1 - dive; tb.visible = tb.material.opacity > 0.01;
    setL(north, 0.9 * (1 - dive));

    // s7 route map
    setL(yard, 0.8 * map, ramp(t, s.s7 - 0.3, E.galangan + 0.2)); lblYard.material.opacity = map * ramp(t, E.rakit - 0.2, E.galangan); lblYard.visible = lblYard.material.opacity > 0.01;
    setL(towL, 0.95 * map * (1 - ramp(t, E.akad - 0.4, E.akad + 0.6) * 0.6), ramp(t, E.ditarik - 0.5, E.tunda + 0.5));
    {
      const u = ramp(t, E.ditarik - 0.3, E.pertama + 0.2);
      const gOn = map * (t > E.galangan - 0.6 ? 1 : 0) * (1 - ramp(t, E.pertama, E.pertama + 0.6));
      towCurve.getPointAt(Math.min(0.999, u), tmp); towCurve.getTangentAt(Math.min(0.999, u), q2);
      ghost.position.copy(tmp); ghost.rotation.y = Math.atan2(-q2.z, q2.x);
      ghost.children.forEach((m) => setL(m, 0.7 * gOn, ramp(t, E.galangan - 0.6, E.galangan + 0.4)));
      const tp = tmp.clone().addScaledVector(q2, 19); tug.position.copy(tp); tug.rotation.y = ghost.rotation.y;
      const tOn = gOn * ramp(t, E.ditarik - 0.4, E.ditarik + 0.2); tug.children.forEach((m) => setL(m, 0.95 * tOn));
      const ra = tmp.clone().addScaledVector(q2, 12.2), rb = tp.clone().addScaledVector(q2, -2.4);
      const RA = towRope.geometry.attributes.aA, RB = towRope.geometry.attributes.aB; RA.setXYZ(0, ra.x, 0.8, ra.z); RB.setXYZ(0, rb.x, 0.8, rb.z); RA.needsUpdate = RB.needsUpdate = true;
      setL(towRope, 0.8 * tOn);
      lblTug.position.copy(tp).add(v3(0, 5, 0)); lblTug.material.opacity = tOn * win(t, E.tunda - 0.4, E.akad, 0.3, 0.4); lblTug.visible = lblTug.material.opacity > 0.01;
    }
    const lmOn = map * ramp(t, E.pertama - 0.6, E.akad + 0.2);
    setL(lmFrame, 0.8 * lmOn, lmOn); lmG.children.forEach((m) => setL(m, 0.85 * lmOn, ramp(t, E.akad - 0.6, E.lomo + 0.6))); setL(ice, 0.55 * lmOn, ramp(t, E.akad, E.arktik + 0.4));
    setL(lmDim, 0.95 * lmOn, ramp(t, E.lomo, E.lomo + 1.0));
    const fl = (m, v) => { m.material.opacity = v; m.visible = v > 0.01; };
    fl(lmT1, lmOn * ramp(t, E.akad - 0.2, E.akad + 0.4)); fl(lmT2, lmOn * ramp(t, E.lomo + 0.4, E.lomo + 1.0)); fl(lmT3, lmOn * ramp(t, E.arktik - 0.3, E.arktik + 0.3));
    setL(retL, 0.95 * map, ramp(t, E.renc - 0.3, E.pulang + 0.3));
    lbl12.position.copy(retCurve.getPointAt(0.45)).add(v3(-3, 4, 0)); lbl12.material.opacity = map * ramp(t, E.renc, E.renc + 0.6); lbl12.visible = lbl12.material.opacity > 0.01;
    {
      const u = ramp(t, E.pulang - 0.6, s.s7e + 0.3), on = map * win(t, E.pulang - 0.6, s.s7e + 0.4, 0.3, 0.4);
      retCurve.getPointAt(Math.min(0.999, u), tmp); retCurve.getTangentAt(Math.min(0.999, u), q2);
      ghost2.position.copy(tmp); ghost2.rotation.y = Math.atan2(-q2.z, q2.x);
      ghost2.children.forEach((m) => setL(m, 0.6 * on));
    }
    // waves calmer on the route map
    setL(waves, 0.22 * (1 - 0.5 * map) * (1 - 0.85 * dive));
    setL(fg, 0.35 * (1 - dive) * (1 - map));
    bloom.strength = 0.7 - 0.25 * dive;
    comp.render();
  };
}
