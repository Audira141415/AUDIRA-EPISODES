// EP27 KAPAL AMONIA. VOXELVERSE look: a dusk port built from chamfered voxels (every edge catches light), warm copper,
// amber and muted teal palette, low sun, soft shadows, sky-gradient reflections (env 0.4), low fog and a tilt-shift band.
// One connected sea world along +x:
//   green-ammonia island (Chifeng plant inset, x≈-92) -> Ulsan-like quay with shore tanks, loading pipe and the gas carrier
//   (x -22..22) -> tank comparison plinths on the east quay (x≈27..32) -> engine cutaway diorama on its own plinth (x≈48).
// Glowing voxel NH3 molecules (1 blue N + 3 white H) travel the chain: reactor -> shore tank -> pipe -> ship -> cylinder.
// Every value is a pure function of t (seeded PRNG only, no accumulated state).
import * as THREE from "./three.module.js";
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";
import { OutputPass } from "./OutputPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { mulberry, ramp, clamp01, canvasTex, track, back, skyEnv } from "./lib3d.js";

const W = 1080, H = 1920;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const win = (t, a, b, fi = 0.4, fo = 0.4) => ramp(t, a - fi, a + fi) * (1 - ramp(t, b - fo, b + fo));
const C = {
  copper: 0xb36a40, copperDk: 0x7a4429, patina: 0x6f9a8a, amber: 0xf2a33a, amberHot: 0xffcf86, lamp: 0xffb469,
  teal: 0x4f7f7b, tealDk: 0x2f4d4c, tealSoft: 0x86aca6, tealPale: 0xb4ccc4,
  stone: 0x8b8880, stoneDk: 0x5c5a56, stoneLt: 0xb2ada2, asphalt: 0x3d4140, cream: 0xe6d9bf, creamDk: 0xc9b998,
  brick: 0x9e5137, wood: 0x80583a, woodDk: 0x553a26, leaf: 0x5f7e4e, orange: 0xe8742a, ink: 0x1d2224,
  hull: 0x24343a, hullRed: 0x9e3b2c, white: 0xeee6d6, steppe: 0xb59a6a, steppeDk: 0x8f7650, glass: 0x1b2426,
};

// ---------- chamfered voxel template (ported from the VOXELVERSE kit's lib/voxel.ts) ----------
const TPL = new Map();
function template(hx, hy, hz, r) {
  const key = `${hx.toFixed(3)}|${hy.toFixed(3)}|${hz.toFixed(3)}|${r.toFixed(3)}`;
  if (TPL.has(key)) return TPL.get(key);
  const p = [], n = [];
  const poly = (pts, nx, ny, nz) => {
    const len = Math.hypot(nx, ny, nz), N = [nx / len, ny / len, nz / len];
    const [a, b, c] = pts;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const o = cx * N[0] + cy * N[1] + cz * N[2] < 0 ? [...pts].reverse() : pts;
    for (let i = 1; i < o.length - 1; i++) for (const q of [o[0], o[i], o[i + 1]]) { p.push(q[0], q[1], q[2]); n.push(N[0], N[1], N[2]); }
  };
  const ix = hx - r, iy = hy - r, iz = hz - r;
  for (const s of [1, -1]) {
    poly([[s * hx, -iy, -iz], [s * hx, iy, -iz], [s * hx, iy, iz], [s * hx, -iy, iz]], s, 0, 0);
    poly([[-ix, s * hy, -iz], [ix, s * hy, -iz], [ix, s * hy, iz], [-ix, s * hy, iz]], 0, s, 0);
    poly([[-ix, -iy, s * hz], [ix, -iy, s * hz], [ix, iy, s * hz], [-ix, iy, s * hz]], 0, 0, s);
  }
  if (r > 0) {
    for (const a of [1, -1]) for (const b of [1, -1]) {
      poly([[a * hx, b * iy, -iz], [a * ix, b * hy, -iz], [a * ix, b * hy, iz], [a * hx, b * iy, iz]], a, b, 0);
      poly([[a * hx, -iy, b * iz], [a * ix, -iy, b * hz], [a * ix, iy, b * hz], [a * hx, iy, b * iz]], a, 0, b);
      poly([[-ix, a * hy, b * iz], [-ix, a * iy, b * hz], [ix, a * iy, b * hz], [ix, a * hy, b * iz]], 0, a, b);
    }
    for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1])
      poly([[a * hx, b * iy, c * iz], [a * ix, b * hy, c * iz], [a * ix, b * iy, c * hz]], a, b, c);
  }
  const t = { p, n };
  TPL.set(key, t);
  return t;
}
function cubeGeo(s, r = 0.08) {
  const tp = template(s / 2, s / 2, s / 2, r * s);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(tp.p, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(tp.n, 3));
  return g;
}

// Vox: boxes inside a transform stack, merged into one geometry per material class, colour per box (seeded jitter).
const MATS = {};
function mats() {
  if (MATS.matte) return MATS;
  const std = (rough, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal, ...extra });
  MATS.matte = std(0.86); MATS.satin = std(0.48); MATS.metal = std(0.34, 0.8); MATS.gloss = std(0.12, 0, { envMapIntensity: 1.5 });
  MATS.glass = std(0.08, 0.1, { transparent: true, opacity: 0.32, depthWrite: false, envMapIntensity: 1.6 });
  MATS.glow = new THREE.MeshBasicMaterial({ vertexColors: true, color: new THREE.Color(2.4, 2.4, 2.4) });
  return MATS;
}
class Vox {
  constructor(seed = 1) { this.b = {}; this.m = new THREE.Matrix4(); this.st = []; this.rnd = mulberry(seed); }
  at(x, y, z, ry, fn) {
    this.st.push(this.m.clone());
    this.m.multiply(new THREE.Matrix4().makeTranslation(x, y, z)).multiply(new THREE.Matrix4().makeRotationY(ry || 0));
    fn(); this.m = this.st.pop();
  }
  box(w, h, d, x, y, z, col, mk = "matte", r, jit = 0.07) {
    r = r ?? Math.min(0.09, Math.min(w, h, d) * 0.2);
    const tp = template(w / 2, h / 2, d / 2, r);
    const B = (this.b[mk] ??= { p: [], n: [], c: [] });
    const M = this.m.clone().multiply(new THREE.Matrix4().makeTranslation(x, y, z));
    const NM = new THREE.Matrix3().getNormalMatrix(M);
    const c = new THREE.Color(col), k = 1 + (this.rnd() - 0.5) * jit * 2;
    c.r *= k; c.g *= k; c.b *= k;
    const q = new THREE.Vector3();
    for (let i = 0; i < tp.p.length; i += 3) {
      q.set(tp.p[i], tp.p[i + 1], tp.p[i + 2]).applyMatrix4(M); B.p.push(q.x, q.y, q.z);
      q.set(tp.n[i], tp.n[i + 1], tp.n[i + 2]).applyMatrix3(NM).normalize(); B.n.push(q.x, q.y, q.z);
      B.c.push(c.r, c.g, c.b);
    }
  }
  // octagon-ish vertical drum (two crossed boxes) and stepped sphere
  drum(R, h, x, y, z, col, mk = "matte") { this.box(2 * R, h, 1.42 * R, x, y + h / 2, z, col, mk); this.box(1.42 * R, h, 2 * R, x, y + h / 2, z, col, mk); }
  sphere(R, x, y, z, col, mk = "satin", st = 0.5, half = false) {
    for (let yy = half ? 0 : -R + st / 2; yy < R; yy += st) {
      const rr = Math.sqrt(Math.max(0, R * R - (yy + st / 2) * (yy + st / 2)));
      if (rr < 0.15) continue;
      this.box(2 * rr, st, 1.42 * rr, x, y + yy + st / 2, z, col, mk, 0.06); this.box(1.42 * rr, st, 2 * rr, x, y + yy + st / 2, z, col, mk, 0.06);
    }
  }
  rod(a, b, s, col, mk = "metal") { // axis-aligned segment
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    this.box(Math.abs(dx) + s, Math.abs(dy) + s, Math.abs(dz) + s, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, col, mk);
  }
  build(shadow = true) {
    const g = new THREE.Group(), M = mats();
    for (const [k, B] of Object.entries(this.b)) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(B.p, 3));
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(B.n, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(B.c, 3));
      geo.computeBoundingSphere();
      const m = new THREE.Mesh(geo, M[k]);
      m.castShadow = shadow && k !== "glow" && k !== "glass"; m.receiveShadow = k !== "glow";
      g.add(m);
    }
    return g;
  }
}

function plate(txt, w, h, bg, fg, font = "800 120px Rubik, Arial Black, sans-serif", sub) {
  const tx = canvasTex(1024, Math.round(1024 * h / w), (c, cw, ch) => {
    if (bg) { c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.strokeStyle = fg; c.lineWidth = 14; c.strokeRect(10, 10, cw - 20, ch - 20); }
    c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle"; c.font = font;
    c.fillText(txt, cw / 2, sub ? ch * 0.4 : ch / 2);
    if (sub) { c.font = "600 64px Rubik, Arial, sans-serif"; c.fillText(sub, cw / 2, ch * 0.76); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, transparent: !bg, roughness: 0.7, depthWrite: !!bg }));
  return m;
}

export function create(canvas, K, AT) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(W, H, false);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 900);
  const s = K;
  const A_ = (k, d) => (AT[k] !== undefined ? AT[k] : d);
  const E = {
    karbon: A_("s1:karbon", s.s1 + 2.2), tapi: A_("s1:Tapi", s.s1 + 3), solar1: A_("s1:solar", s.s1 + 5),
    ulsan: A_("s2:Ulsan", s.s2 + 4), diisi: A_("s2:diisi", s.s2 + 8), ton: A_("s2:ton", s.s2 + 9.5), bukan: A_("s2:Bukan", s.s2 + 12), raksasa: A_("s2:raksasa", s.s2 + 14),
    chifeng: A_("s3:Chifeng", s.s3 + 1), listrik: A_("s3:listrik", s.s3 + 3), memecah: A_("s3:memecah", s.s3 + 5), udara: A_("s3:udara", s.s3 + 7), satu: A_("s3:Satu", s.s3 + 9),
    mendidih: A_("s4:mendidih", s.s4 + 1), cair: A_("s4:cair", s.s4 + 5), pipa: A_("s4:pipa", s.s4 + 7.5), langsung: A_("s4:langsung", s.s4 + 9),
    sulit: A_("s5:sulit", s.s5 + 1.5), n651: A_("s5:651", s.s5 + 4), disemprot: A_("s5:disemprot", s.s5 + 8), pilot: A_("s5:pilot", s.s5 + 10.5), korek: A_("s5:korek", s.s5 + 11.5),
    nitro: A_("s6:nitrogen", s.s6 + 2.5), nol: A_("s6:nol", s.s6 + 4.5), masih: A_("s6:Masih", s.s6 + 5.5), katalis: A_("s6:Katalis", s.s6 + 9),
    energi: A_("s7:energi", s.s7 + 2), sepertiga: A_("s7:sepertiga", s.s7 + 4), tangki: A_("s7:tangkinya", s.s7 + 6.5), tiga: A_("s7:tiga", s.s7 + 8), besar: A_("s7:besar", s.s7 + 9),
    molekul: A_("s8:Molekul", s.s8), dinyalakan: A_("s8:dinyalakan", s.s8 + 2.5),
  };

  // ---------- scene, dusk sky, light ----------
  const S = new THREE.Scene();
  const sunDir = v3(-0.75, 0.16, -0.35).normalize();
  S.environment = skyEnv(r, 0x2f4a55, 0xd99a6a, 0x3a3a3c, sunDir, 0xffc890, 2.0);
  S.environmentIntensity = 0.4;
  S.fog = new THREE.FogExp2(0x8a7f78, 0.003);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { d: { value: sunDir } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec3 v;uniform vec3 d;void main(){vec3 n=normalize(v);float y=n.y;
      vec3 top=vec3(.035,.075,.1),mid=vec3(.42,.22,.13),hor=vec3(.7,.42,.24),low=vec3(.05,.08,.09);
      vec3 k=y>0.?mix(hor,mix(mid,top,smoothstep(.05,.55,y)),smoothstep(0.,.12,y)):mix(hor,low,smoothstep(0.,.08,-y));
      float sd=max(dot(n,d),0.);k+=vec3(1.,.72,.42)*(pow(sd,600.)*4.+pow(sd,18.)*.25);
      gl_FragColor=vec4(k,1.);
      #include <colorspace_fragment>
      }`,
  }));
  sky.renderOrder = -10; S.add(sky);
  S.add(new THREE.HemisphereLight(0xffd9b0, 0x2c4448, 0.42));
  const key = new THREE.DirectionalLight(0xffc48a, 1.9);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04;
  const sc_ = key.shadow.camera; sc_.left = -30; sc_.right = 30; sc_.top = 30; sc_.bottom = -30; sc_.near = 1; sc_.far = 160;
  S.add(key, key.target);
  const fill = new THREE.DirectionalLight(0x8fb4c0, 0.45); fill.position.set(30, 20, 40); S.add(fill);
  const lamps = [v3(-1, 8, -6.5), v3(6, 7, -9), v3(48, 9, 13)].map((p, i) => { const l = new THREE.PointLight(i === 2 ? 0xffa060 : 0xffb469, 0, 26, 1.6); l.position.copy(p); S.add(l); return l; });

  // ---------- water ----------
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({ color: 0x1d3a3c, roughness: 0.2, metalness: 0.25, envMapIntensity: 1.6 }));
  water.rotation.x = -Math.PI / 2; water.receiveShadow = true; S.add(water);
  // voxel wave caps: small flat chamfered tiles that bob (a pure function of t)
  const capGeo = cubeGeo(1, 0.15);
  const NCAP = 520, caps = new THREE.InstancedMesh(capGeo, new THREE.MeshStandardMaterial({ color: 0x4f7f7b, roughness: 0.3, metalness: 0.1, envMapIntensity: 1.4 }), NCAP);
  caps.frustumCulled = false; caps.receiveShadow = true;
  const CAPS = [], rc = mulberry(77);
  for (let i = 0; i < NCAP; i++) {
    let x, z, ok = false;
    for (let k = 0; k < 20 && !ok; k++) {
      x = -130 + rc() * 220; z = -5 + rc() * 70;
      ok = !(Math.abs(x) < 24 && Math.abs(z) < 5) && !(Math.abs(x - 48) < 10 && Math.abs(z - 8) < 9) && !(Math.abs(x + 92) < 20 && Math.abs(z + 6) < 15);
    }
    CAPS.push({ x, z, ph: rc() * 6.28, s: 0.5 + rc() * 0.9, c: rc() });
    caps.setColorAt(i, new THREE.Color(CAPS[i].c > 0.8 ? 0xd99a6a : CAPS[i].c > 0.4 ? 0x4f7f7b : 0x2f4d4c));
  }
  S.add(caps);

  // ---------- quay (Ulsan-like, generic) ----------
  const Q = new Vox(11);
  const QY = 2.2;
  for (let x = -64; x < 42; x += 4) {
    Q.box(4, QY + 1, 1.2, x + 2, (QY - 1) / 2, -6.6, C.stone, "matte", 0.12, 0.1); // quay wall blocks
    Q.box(4, 0.35, 34, x + 2, QY - 0.17, -24, (x / 4) % 2 ? C.asphalt : 0x45494a, "matte", 0.05, 0.05);
    Q.box(4, 0.25, 1.4, x + 2, QY + 0.12, -6.5, C.stoneLt, "matte"); // coping
  }
  for (let x = -60; x < 40; x += 7) { Q.box(0.6, 0.7, 0.6, x, QY + 0.5, -6.3, C.ink, "satin"); Q.box(0.9, 1.6, 0.5, x + 3.5, 0.9, -5.7, C.ink, "matte"); } // bollards + fenders
  // lamp posts along the edge
  const lampGlow = [];
  for (let x = -54; x < 40; x += 9) {
    if (x === 27) continue; // keeps the SOLAR plinth label clear in s7
    Q.box(0.3, 6, 0.3, x, QY + 3, -7.6, C.stoneDk, "metal"); Q.box(1.2, 0.3, 0.5, x, QY + 6, -7.4, C.stoneDk, "metal");
    Q.box(0.8, 0.25, 0.4, x + 0.3, QY + 5.8, -7.3, C.lamp, "glow");
  }
  // shore tank 1 (whole) with AUDIRA stencil, shore tank 2 (cutaway in s4)
  Q.drum(4, 9, -8, QY, -16, C.cream, "satin"); Q.drum(4.2, 0.6, -8, QY + 9, -16, C.creamDk, "satin"); Q.sphere(3.4, -8, QY + 9.6, -16, C.cream, "satin", 0.45, true);
  for (let k = 0; k < 6; k++) Q.box(0.25, 9.6, 0.25, -8 + Math.cos(k) * 4.1, QY + 4.8, -16 + Math.sin(k) * 2.9 + 0.1, C.stoneDk, "metal"); // stair posts
  // tank 2 back half
  const T2 = v3(6, QY, -16), TR = 4, TH = 9;
  Q.box(2 * TR, TH, 0.72 * TR, T2.x, QY + TH / 2, T2.z - 0.36 * TR, C.cream, "satin");
  Q.box(1.42 * TR, TH, TR, T2.x, QY + TH / 2, T2.z - TR / 2, C.cream, "satin");
  Q.box(2 * TR - 1, TH - 1, 0.1, T2.x, QY + TH / 2, T2.z + 0.03, 0x2b3a3c, "matte"); // dark interior back wall
  Q.box(0.5, TH, 0.6, T2.x - TR + 0.25, QY + TH / 2, T2.z + 0.3, C.copper, "satin"); Q.box(0.5, TH, 0.6, T2.x + TR - 0.25, QY + TH / 2, T2.z + 0.3, C.copper, "satin"); // cut edges
  Q.box(2 * TR, 0.5, 0.6, T2.x, QY + 0.25, T2.z + 0.3, C.copper, "satin");
  // loading tower + pipe rack
  Q.box(1.2, 6, 1.2, 0, QY + 3, -8.5, C.copper, "satin"); Q.box(1.6, 0.4, 1.6, 0, QY + 6.1, -8.5, C.copperDk, "metal");
  Q.box(0.9, 0.9, 6, 5, QY + 1.2, -11, C.stoneDk, "metal");
  // gantry cranes (bow side)
  for (const cx of [-34, -48]) {
    for (const dz of [-8.2, -14]) for (const dx of [-3, 3]) Q.box(0.8, 18, 0.8, cx + dx, QY + 9, dz, C.copper, "satin");
    Q.box(7.6, 1.2, 7.4, cx, QY + 18, -11.1, C.copper, "satin");
    Q.box(1.4, 1.0, 26, cx, QY + 17.2, -4, C.copperDk, "satin"); Q.box(2.2, 1.8, 2.4, cx, QY + 16.2, 2, C.cream, "satin");
    Q.box(1.6, 1.2, 1.4, cx, QY + 19.2, -12, C.amber, "satin");
  }
  // container stacks
  const rq = mulberry(5), CC = [C.copper, C.teal, C.cream, C.brick, C.patina, C.tealDk, C.amber];
  for (let i = 0; i < 26; i++) {
    const x = -62 + (i % 7) * 3.1, z = -20 - Math.floor(i / 7) * 6.8, hN = 1 + Math.floor(rq() * 3);
    for (let k = 0; k < hN; k++) {
      const col = CC[Math.floor(rq() * CC.length)];
      Q.box(2.8, 2.5, 6.2, x, QY + 1.25 + k * 2.55, z, col, "satin", 0.08);
      for (let rib = -2.6; rib <= 2.6; rib += 0.65) Q.box(2.86, 2.2, 0.08, x, QY + 1.25 + k * 2.55, z + rib, col, "satin", 0.02, 0.15);
    }
  }
  // warehouses behind
  for (let i = 0; i < 4; i++) { Q.box(14, 7, 9, -30 + i * 18, QY + 3.5, -36, i % 2 ? C.brick : C.stone, "matte"); Q.box(14.4, 0.8, 9.4, -30 + i * 18, QY + 7.4, -36, C.tealDk, "satin");
    for (let w = -5; w <= 5; w += 2.5) Q.box(1.4, 1.6, 0.2, -30 + i * 18 + w, QY + 4.6, -31.4, C.lamp, "glow"); }
  // crates / props near the edge (foreground layer)
  for (let i = 0; i < 9; i++) { const x = -20 + i * 5.3 + rq() * 1.5; Q.box(1.2, 1.2, 1.2, x, QY + 0.6, -9.5 - rq() * 1.5, rq() > 0.5 ? C.wood : C.woodDk, "matte"); }
  // tank-comparison plinths (s7) on the east quay
  Q.box(3.2, 1.2, 3.2, 26, QY + 0.6, -13, C.stoneLt, "matte"); Q.box(3.2, 1.2, 3.2, 32, QY + 0.6, -13, C.stoneLt, "matte");
  Q.box(3.5, 0.2, 3.5, 26, QY + 1.3, -13, C.copper, "satin"); Q.box(3.5, 0.2, 3.5, 32, QY + 1.3, -13, C.copper, "satin");
  const quay = Q.build(); S.add(quay);
  // tank 2 front half (lifts away in s4)
  const F2v = new Vox(12);
  F2v.box(2 * TR, TH, 0.72 * TR, 0, TH / 2, 0.36 * TR, C.cream, "satin"); F2v.box(1.42 * TR, TH, TR, 0, TH / 2, TR / 2, C.cream, "satin");
  F2v.drum(4.2, 0.6, 0, TH, 0, C.creamDk, "satin"); F2v.sphere(3.4, 0, TH + 0.6, 0, C.cream, "satin", 0.45, true);
  const front2 = F2v.build(); front2.position.copy(T2); S.add(front2);
  // liquid ammonia inside the cutaway (glowing teal, frost on the rim)
  const liq = new THREE.Mesh(new THREE.BoxGeometry(2 * TR - 1.2, 1, 1.6), new THREE.MeshStandardMaterial({ color: 0x9fe8ff, emissive: 0x2a8fb8, emissiveIntensity: 1.1, roughness: 0.15, transparent: true, opacity: 0.85 }));
  S.add(liq);
  const frostV = new Vox(13), rf = mulberry(31);
  for (let i = 0; i < 70; i++) { const a = rf(); const side = rf() > 0.5 ? 1 : -1; frostV.box(0.22 + rf() * 0.2, 0.22 + rf() * 0.2, 0.22, T2.x + side * (TR - 0.55 - rf() * 0.3), QY + 0.6 + a * (TH - 1.2), T2.z + 0.65, 0xe8f6ff, "satin", 0.04); }
  for (let i = 0; i < 30; i++) frostV.box(0.25, 0.25, 0.25, T2.x - TR + 0.6 + rf() * (2 * TR - 1.2), QY + 0.62, T2.z + 0.65, 0xe8f6ff, "satin", 0.04);
  const frost = frostV.build(false); S.add(frost);
  // AUDIRA stencil on tank 1 + small terminal sign
  const sten = plate("AUDIRA", 5.4, 1.4, null, "#f4ecdc", "900 230px Rubik, Arial Black, sans-serif");
  sten.position.set(-8, QY + 5.6, -11.96); S.add(sten);
  const sten2 = plate("NH₃ · −33 °C", 5.0, 0.85, null, "#2f4d4c", "800 150px Rubik, Arial Black, sans-serif");
  sten2.position.set(-8, QY + 4.1, -11.96); S.add(sten2);

  // ---------- loading pipe (glass segments so the molecule flow reads) ----------
  const PIPE = [v3(5, QY + 2.6, -12.2), v3(5, QY + 6.1, -10.5), v3(5, QY + 6.1, -8.5), v3(-1, QY + 6.1, -8.5), v3(-1, QY + 6.1, -4.2), v3(-1, 5.0, -3.6)];
  const PV = new Vox(14);
  for (let i = 0; i < PIPE.length - 1; i++) {
    const a = PIPE[i], b = PIPE[i + 1];
    PV.rod([a.x, a.y, a.z], [b.x, b.y, b.z], 0.9, 0xbfe6ee, "glass");
    const L = a.distanceTo(b), n = Math.max(1, Math.floor(L / 1.6));
    for (let k = 0; k <= n; k++) { const p = a.clone().lerp(b, k / n); PV.box(1.05, 1.05, 1.05, p.x, p.y, p.z, C.copper, "metal", 0.08); }
  }
  const pipeG = PV.build(false); S.add(pipeG);
  const pipeLen = []; let pl = 0; for (let i = 0; i < PIPE.length - 1; i++) { pipeLen.push(pl); pl += PIPE[i].distanceTo(PIPE[i + 1]); } pipeLen.push(pl);
  const along = (path, lens, u) => { const d = u * lens[lens.length - 1]; let i = 0; while (i < path.length - 2 && lens[i + 1] < d) i++; const f = (d - lens[i]) / Math.max(1e-4, lens[i + 1] - lens[i]); return path[i].clone().lerp(path[i + 1], clamp01(f)); };

  // ---------- the gas carrier (generic VLAC, no livery) ----------
  const SV = new Vox(21);
  // hull: stepped bow at -x, flat stern at +x
  for (let x = -22; x < 22; x += 1) {
    const bow = clamp01((x + 22) / 7), wq = 0.25 + 0.75 * Math.sqrt(bow), stern = x > 19 ? 0.9 : 1;
    const bw = 7.6 * wq * stern;
    SV.box(1.02, 1.8, bw - 0.4, x + 0.5, -0.1, 0, C.hullRed, "satin", 0.05, 0.03);
    SV.box(1.02, 3.6, bw, x + 0.5, 2.6, 0, C.hull, "satin", 0.05, 0.03);
    SV.box(1.02, 0.18, bw, x + 0.5, 0.88, 0, C.cream, "satin", 0.03, 0.02); // boot top line
    SV.box(1.02, 0.3, bw - 0.6, x + 0.5, 4.5, 0, x % 2 ? 0x7a6f62 : 0x857868, "matte", 0.05);
  }
  SV.box(3, 1.4, 3, -20.5, 5.0, 0, C.hull, "satin"); // forecastle
  // four domed cargo tanks on deck + pipe rack
  for (const tx of [-14.5, -7.5, -0.5, 6.5]) {
    SV.box(5.6, 1.2, 6, tx, 5.2, 0, C.tealPale, "satin"); SV.sphere(3.0, tx, 5.6, 0, C.cream, "satin", 0.42, true);
    SV.box(1.2, 0.8, 1.2, tx, 8.9, 0, C.copper, "metal"); SV.box(0.4, 1.2, 0.4, tx + 0.4, 9.6, 0.4, C.copper, "metal");
  }
  SV.box(30, 0.5, 0.5, -4, 6.4, -2.8, C.copper, "metal"); SV.box(30, 0.5, 0.5, -4, 6.4, 2.8, C.copper, "metal");
  for (let x = -18; x < 11; x += 3) { SV.box(0.25, 1.8, 0.25, x, 5.5, -2.8, C.stoneDk, "metal"); SV.box(0.25, 1.8, 0.25, x, 5.5, 2.8, C.stoneDk, "metal"); }
  SV.box(1.6, 1.2, 1.4, -1, 5.2, -3.2, C.amber, "satin"); // manifold on the shore side
  // deckhouse aft
  SV.box(6, 8, 7, 17, 8.5, 0, C.white, "satin");
  SV.box(7.4, 0.5, 9.4, 17, 12.7, 0, C.white, "satin");
  SV.box(5.4, 1.6, 7.2, 17, 13.7, 0, C.white, "satin");
  for (let f = 0; f < 4; f++) for (let k = -2; k <= 2; k++) SV.box(0.12, 0.8, 0.9, 13.95, 6.2 + f * 1.7, k * 1.3, f === 3 ? C.amberHot : C.lamp, "glow");
  for (let k = -3; k <= 3; k++) SV.box(0.12, 0.8, 0.8, 14.25, 13.8, k * 1.0, 0x9fd6e0, "glow");
  // funnel (plain teal band, no company mark) and mast
  SV.box(2.6, 4, 3.2, 20, 16.2, 0, C.cream, "satin"); SV.box(2.7, 1.0, 3.3, 20, 17.3, 0, C.teal, "satin"); SV.box(2.0, 0.4, 2.6, 20, 18.4, 0, C.ink, "matte");
  SV.box(0.35, 6, 0.35, 16, 17.3, 0, C.stoneDk, "metal"); SV.box(2.2, 0.25, 0.25, 16, 19.2, 0, C.stoneDk, "metal");
  SV.box(0.35, 5, 0.35, -19.5, 7.5, 0, C.stoneDk, "metal");
  SV.box(0.3, 0.3, 0.3, -19.5, 10.1, 0, 0xffffff, "glow"); SV.box(0.3, 0.3, 0.3, 17, 14.6, -4.6, 0xff4030, "glow"); SV.box(0.3, 0.3, 0.3, 17, 14.6, 4.6, 0x40ff80, "glow");
  // stern conduit that feeds the engine diorama (molecule path C)
  SV.box(1.4, 1.4, 1.4, 21.5, 5.2, 2.6, C.copper, "metal");
  const ship = SV.build(); S.add(ship);

  // tug near the bow (foreground layer in the hook)
  const TG = new Vox(23);
  for (let x = -3; x <= 3; x += 1) TG.box(1.02, 1.6, 3.2 * (1 - Math.max(0, x - 1) * 0.25), x, 0.4, 0, x % 2 ? C.hullRed : 0xa8432f, "satin", 0.05);
  TG.box(2.6, 1.6, 2.4, -0.6, 2.0, 0, C.white, "satin"); TG.box(2.62, 0.5, 2.42, -0.6, 2.4, 0, 0x9fd6e0, "glow"); TG.box(0.6, 1.4, 0.6, -0.4, 3.4, 0, C.amber, "satin");
  for (let k = -1; k <= 1; k++) TG.box(0.5, 0.5, 0.5, 2.6, 1.2, k * 0.8, C.ink, "matte");
  const tug = TG.build(); tug.position.set(-31, 0, 9); tug.rotation.y = 0.5; S.add(tug);
  // service boat standing by alongside the carrier (generic, no markings)
  const SB = new Vox(24);
  for (let x = -5; x <= 5; x += 1) { const bw = 3.6 * (x < -3 ? 0.55 + 0.2 * (x + 5) : 1); SB.box(1.02, 1.4, bw, x, 0.35, 0, x % 2 ? C.teal : 0x46726e, "satin", 0.05); SB.box(1.02, 0.2, bw + 0.1, x, 1.1, 0, C.cream, "satin", 0.03); }
  SB.box(3.4, 1.8, 2.6, 1.5, 2.1, 0, C.white, "satin"); SB.box(3.42, 0.6, 2.62, 1.5, 2.5, 0, C.lamp, "glow"); SB.box(3.6, 0.3, 2.8, 1.5, 3.1, 0, C.tealDk, "satin");
  SB.box(0.3, 2.2, 0.3, 2.6, 4.2, 0, C.stoneDk, "metal"); SB.box(0.35, 0.35, 0.35, 2.6, 5.4, 0, 0xffe0a0, "glow");
  for (let x = -4; x <= -1; x += 1.5) SB.box(1.0, 0.8, 1.0, x, 1.6, x % 3 ? 0.6 : -0.6, x % 3 ? C.amber : C.copper, "satin");
  for (const sx of [-1, 1]) SB.box(8.5, 0.35, 0.35, 0, 0.9, sx * 1.9, C.ink, "matte");
  const sboat = SB.build(); sboat.position.set(-2, 0, 8.6); sboat.rotation.y = 0.08; S.add(sboat);
  // orange buoy boom line and warm lamp streaks on the water
  const BV = new Vox(25);
  for (let x = -36; x <= 30; x += 2.2) { BV.box(0.9, 0.7, 0.9, x, 0.25, 13.5 + 0.6 * Math.sin(x * 0.4), x % 4.4 < 1 ? C.orange : C.cream, "satin", 0.1); }
  const rs = mulberry(88);
  for (let i = 0; i < 70; i++) { const x = -30 + rs() * 56, z = 4.5 + rs() * 10; BV.box(0.3 + rs() * 1.6, 0.04, 0.18, x, 0.06, z, rs() > 0.4 ? C.amber : C.amberHot, "glow", 0.01, 0.2); }
  const boom = BV.build(false); S.add(boom);

  // ---------- green-ammonia island (Chifeng plant inset) ----------
  const YC = v3(-92, 3, -6);
  const YV = new Vox(31);
  YV.box(40, 1.2, 30, YC.x, YC.y - 0.6, YC.z, C.steppe, "matte", 0.15, 0.04);
  YV.box(40.4, 1.6, 30.4, YC.x, YC.y - 2.0, YC.z, C.steppeDk, "matte", 0.15); YV.box(40.6, 2.0, 30.6, YC.x, YC.y - 3.8, YC.z, 0x6a5a48, "matte", 0.15);
  YV.box(41, 0.6, 31, YC.x, YC.y - 5, YC.z, C.woodDk, "satin", 0.1); // timber frame at the waterline
  const ry = mulberry(9);
  for (let i = 0; i < 60; i++) YV.box(0.8 + ry() * 1.4, 0.2, 0.8 + ry() * 1.4, YC.x - 19 + ry() * 38, YC.y + 0.1, YC.z - 14 + ry() * 28, ry() > 0.5 ? C.steppeDk : 0xa38a5c, "matte", 0.05);
  // solar array (front-left) and a front row as a foreground layer
  const solar = (x, z) => { YV.box(0.2, 1.0, 0.2, x, YC.y + 0.5, z, C.stoneDk, "metal"); YV.at(x, YC.y + 1.1, z, 0, () => { YV.box(2.6, 0.12, 1.6, 0, 0, 0, 0x1f3550, "gloss", 0.03, 0.04); }); };
  for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 5; c++) solar(YC.x - 17 + c * 3, YC.z + 1 + rr * 2.4);
  for (let c = 0; c < 6; c++) solar(YC.x + 2 + c * 3, YC.z + 12.5);
  // electrolyser block (water in, hydrogen out)
  const EL = v3(YC.x + 3, YC.y, YC.z + 4);
  YV.box(6, 2.8, 3.2, EL.x, YC.y + 1.4, EL.z, C.white, "satin"); YV.box(6.1, 0.4, 3.3, EL.x, YC.y + 2.9, EL.z, C.teal, "satin");
  for (let k = -2; k <= 2; k++) YV.box(0.8, 1.4, 0.15, EL.x + k * 1.15, YC.y + 1.4, EL.z + 1.65, 0x6fd0ff, "glow");
  YV.drum(0.8, 3.6, EL.x - 4.2, YC.y, EL.z, 0x7ab6c8, "satin"); // water tank
  // air separation column (nitrogen)
  const AC = v3(YC.x + 10, YC.y, YC.z - 6);
  YV.drum(1.3, 12, AC.x, YC.y, AC.z, C.cream, "satin"); YV.drum(1.5, 0.5, AC.x, YC.y + 12, AC.z, C.teal, "satin");
  for (let y = 2; y < 12; y += 2.5) YV.box(3, 0.2, 3, AC.x, YC.y + y, AC.z, C.stoneDk, "metal");
  // Haber-Bosch reactor (copper, glowing window) and product sphere
  const RX = v3(YC.x + 11, YC.y, YC.z + 4);
  YV.drum(1.9, 6.5, RX.x, YC.y, RX.z, C.copper, "metal"); YV.sphere(1.9, RX.x, YC.y + 6.5, RX.z, C.copper, "metal", 0.4, true);
  YV.box(0.9, 3.2, 0.2, RX.x, YC.y + 3.2, RX.z + 1.95, 0xff8a3a, "glow");
  const PS = v3(YC.x + 16, YC.y + 3.4, YC.z - 4);
  YV.sphere(3.0, PS.x, PS.y, PS.z, C.tealPale, "satin", 0.4);
  for (const dx of [-2, 2]) for (const dz of [-2, 2]) YV.box(0.35, 3.4, 0.35, PS.x + dx, YC.y + 1.7, PS.z + dz, C.stoneDk, "metal");
  // connecting pipes
  YV.rod([EL.x + 3, YC.y + 2, EL.z], [RX.x - 1.9, YC.y + 2, EL.z], 0.5, C.copper);
  YV.rod([AC.x, YC.y + 3, AC.z + 1.3], [AC.x, YC.y + 3, RX.z - 1.9], 0.5, C.copper);
  YV.rod([RX.x + 1.9, YC.y + 4, RX.z], [PS.x, YC.y + 4, RX.z], 0.5, C.copper); YV.rod([PS.x, YC.y + 4, RX.z], [PS.x, YC.y + 4, PS.z + 3], 0.5, C.copper);
  // turbines (towers here, rotors below)
  const TURB = [v3(YC.x - 13, YC.y, YC.z - 9), v3(YC.x - 4, YC.y, YC.z - 11), v3(YC.x + 3, YC.y, YC.z - 8)];
  for (const tb of TURB) { for (let k = 0; k < 7; k++) YV.box(1.0 - k * 0.08, 2.2, 1.0 - k * 0.08, tb.x, tb.y + 1.1 + k * 2.2, tb.z, C.white, "satin", 0.06); YV.box(1.0, 1.0, 2.0, tb.x, tb.y + 15.8, tb.z, C.white, "satin"); }
  const yard = YV.build(); S.add(yard);
  const rotors = TURB.map((tb, i) => {
    const RV = new Vox(40 + i);
    RV.box(0.8, 0.8, 0.8, 0, 0, 0, C.stoneLt, "satin");
    for (let b = 0; b < 3; b++) { const a = (b / 3) * Math.PI * 2; for (let k = 1; k <= 7; k++) RV.box(0.7 - k * 0.05, 0.7 - k * 0.05, 0.25, Math.cos(a) * k * 0.95, Math.sin(a) * k * 0.95, 0, C.white, "satin", 0.05); }
    const g = RV.build(); g.position.set(tb.x, tb.y + 15.8, tb.z + 1.2); S.add(g); return g;
  });

  // ---------- engine cutaway diorama (generic two-stroke cylinder) ----------
  const EO = v3(48, 2.6, 8);
  const EV = new Vox(51);
  EV.box(16, 1.4, 14, EO.x, EO.y - 0.7, EO.z, C.stone, "matte", 0.15); EV.box(16.4, 1.6, 14.4, EO.x, EO.y - 2.2, EO.z, C.stoneDk, "matte", 0.15);
  EV.box(16.8, 0.6, 14.8, EO.x, EO.y - 3.2, EO.z, C.woodDk, "satin", 0.1);
  // crankcase frame (open front)
  EV.box(8, 5.5, 0.6, EO.x, EO.y + 2.75, EO.z - 3, C.tealDk, "satin"); EV.box(0.8, 5.5, 6, EO.x - 3.6, EO.y + 2.75, EO.z, C.teal, "satin"); EV.box(0.8, 5.5, 6, EO.x + 3.6, EO.y + 2.75, EO.z, C.teal, "satin");
  EV.box(0.82, 5.5, 0.3, EO.x - 3.6, EO.y + 2.75, EO.z + 3, C.orange, "satin"); EV.box(0.82, 5.5, 0.3, EO.x + 3.6, EO.y + 2.75, EO.z + 3, C.orange, "satin");
  EV.box(8, 0.7, 6.2, EO.x, EO.y + 5.85, EO.z, C.teal, "satin");
  // cylinder liner: back wall + side walls, cut edges painted orange
  const LB = 6.5, LT = 13.2;
  EV.box(5.6, LT - LB, 0.5, EO.x, EO.y + (LB + LT) / 2, EO.z - 2.45, 0x56605e, "metal");
  EV.box(0.6, LT - LB, 5.0, EO.x - 2.6, EO.y + (LB + LT) / 2, EO.z, 0x6d7774, "metal"); EV.box(0.6, LT - LB, 5.0, EO.x + 2.6, EO.y + (LB + LT) / 2, EO.z, 0x6d7774, "metal");
  EV.box(0.62, LT - LB, 0.25, EO.x - 2.6, EO.y + (LB + LT) / 2, EO.z + 2.5, C.orange, "satin"); EV.box(0.62, LT - LB, 0.25, EO.x + 2.6, EO.y + (LB + LT) / 2, EO.z + 2.5, C.orange, "satin");
  for (let y = LB + 0.6; y < LB + 2.2; y += 0.7) for (const sx of [-1, 1]) EV.box(0.64, 0.35, 0.8, EO.x + sx * 2.6, EO.y + y, EO.z - 0.8, 0x1c2324, "matte"); // scavenge ports
  // cylinder head + injectors (NH3 big, pilot small) + exhaust valve housing
  EV.box(6.4, 1.6, 5.6, EO.x, EO.y + LT + 0.8, EO.z - 0.2, C.teal, "satin"); EV.box(6.42, 1.62, 0.25, EO.x, EO.y + LT + 0.8, EO.z + 2.6, C.orange, "satin");
  EV.box(0.9, 2.4, 0.9, EO.x - 1.6, EO.y + LT + 2.0, EO.z + 1.0, 0x3a8fc8, "satin"); EV.box(0.6, 0.5, 0.6, EO.x - 1.6, EO.y + LT + 3.3, EO.z + 1.0, 0x9fe8ff, "glow");
  EV.box(0.55, 1.8, 0.55, EO.x + 1.6, EO.y + LT + 1.7, EO.z + 1.0, C.amber, "satin"); EV.box(0.4, 0.4, 0.4, EO.x + 1.6, EO.y + LT + 2.7, EO.z + 1.0, 0xffb060, "glow");
  EV.box(1.6, 3.4, 1.6, EO.x, EO.y + LT + 2.6, EO.z - 1.2, C.stoneDk, "metal");
  // exhaust duct -> catalyst (SCR) box -> stack
  EV.rod([EO.x, EO.y + LT + 4.2, EO.z - 1.2], [EO.x + 4.2, EO.y + LT + 4.2, EO.z - 1.2], 1.2, 0xbfe6ee, "glass");
  for (const xx of [1.2, 2.6, 4.0]) EV.box(0.3, 1.4, 1.4, EO.x + xx, EO.y + LT + 4.2, EO.z - 1.2, C.stoneDk, "metal");
  EV.box(3.2, 3.2, 3.2, EO.x + 6.0, EO.y + LT + 4.2, EO.z - 1.2, C.copperDk, "metal", 0.1);
  EV.rod([EO.x + 7.6, EO.y + LT + 4.2, EO.z - 1.2], [EO.x + 9.0, EO.y + LT + 4.2, EO.z - 1.2], 1.2, 0xbfe6ee, "glass");
  EV.rod([EO.x + 9.0, EO.y + LT + 4.2, EO.z - 1.2], [EO.x + 9.0, EO.y + LT + 11, EO.z - 1.2], 1.3, 0xbfe6ee, "glass");
  for (let y = LT + 5.5; y < LT + 11.5; y += 1.6) EV.box(1.5, 0.3, 1.5, EO.x + 9.0, EO.y + y, EO.z - 1.2, C.cream, "satin");
  EV.box(0.8, LT + 3.4, 0.8, EO.x + 9.0, EO.y + (LT + 3.4) / 2, EO.z - 2.4, C.stoneDk, "metal"); // stack support
  EV.box(0.8, LT + 2.6, 0.8, EO.x + 6.0, EO.y + (LT + 2.6) / 2, EO.z - 2.6, C.stoneDk, "metal");
  // fuel feed from the ship arrives here
  EV.rod([EO.x - 7.6, EO.y + LT + 3.3, EO.z + 1.0], [EO.x - 1.6, EO.y + LT + 3.3, EO.z + 1.0], 0.5, 0xbfe6ee, "glass");
  EV.rod([EO.x - 7.6, EO.y + 0.5, EO.z + 1.0], [EO.x - 7.6, EO.y + LT + 3.3, EO.z + 1.0], 0.5, 0xbfe6ee, "glass");
  const engine = EV.build(); S.add(engine);
  // catalyst honeycomb face (glows when it works)
  const honey = canvasTex(256, 256, (c) => { c.fillStyle = "#2a1a10"; c.fillRect(0, 0, 256, 256); c.fillStyle = "#ffb060"; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) c.fillRect(x * 32 + 5, y * 32 + 5, 22, 22); });
  const catMat = new THREE.MeshStandardMaterial({ map: honey, emissiveMap: honey, emissive: 0xff9a40, emissiveIntensity: 0.2, roughness: 0.6 });
  const catFace = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), catMat); catFace.position.set(EO.x + 6.0, EO.y + LT + 4.2, EO.z + 0.42); S.add(catFace);
  const ePlate = plate("AUDIRA", 4.6, 1.1, "#e6d9bf", "#2f4d4c", "900 190px Rubik, Arial Black, sans-serif");
  ePlate.position.set(EO.x - 4.4, EO.y - 0.7, EO.z + 7.02); S.add(ePlate);
  const ePlate2 = plate("MODEL SILINDER", 4.6, 0.8, "#2f4d4c", "#e6d9bf", "800 120px Rubik, Arial Black, sans-serif");
  ePlate2.position.set(EO.x + 3.2, EO.y - 0.7, EO.z + 7.02); S.add(ePlate2);
  // moving engine parts
  const mk = (fn, seed) => { const v = new Vox(seed); fn(v); const g = v.build(); S.add(g); return g; };
  const piston = mk((v) => { v.box(4.5, 1.4, 4.4, 0, -0.7, 0, 0x9aa3a0, "metal"); v.box(4.52, 0.18, 4.42, 0, -0.35, 0, C.ink, "matte"); v.box(4.52, 0.18, 4.42, 0, -0.75, 0, C.ink, "matte"); v.box(0.9, 0.9, 0.9, 0, -1.6, 0, C.stoneDk, "metal"); }, 52);
  const rodM = mk((v) => { v.box(0.7, 1, 0.7, 0, 0.5, 0, C.copper, "metal"); }, 53);
  const crank = mk((v) => { v.box(5.6, 1.4, 0.8, 0, 0, 0.3, C.stoneDk, "metal"); v.box(1.4, 5.6, 0.8, 0, 0, 0.3, C.stoneDk, "metal"); v.box(1.0, 1.0, 1.4, 0, 2.5, 0.6, C.amber, "metal"); }, 54);
  crank.position.set(EO.x, EO.y + 2.2, EO.z - 0.4);
  // combustion flame (inside the chamber)
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const flame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1, 3.6), flameMat); S.add(flame);
  const pilotFl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.6, 0.5), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  S.add(pilotFl);

  // ---------- tank comparison blocks (s7) ----------
  const blkGeo = cubeGeo(1.0, 0.1);
  const blk = new THREE.InstancedMesh(blkGeo, new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.0 }), 32);
  blk.castShadow = true; blk.frustumCulled = false;
  for (let i = 0; i < 32; i++) blk.setColorAt(i, new THREE.Color(i < 8 ? C.amber : 0x6fc6d8));
  S.add(blk);
  const lbl1 = plate("SOLAR", 3.2, 0.9, "#f2a33a", "#1d2224", "900 180px Rubik, Arial Black, sans-serif"); lbl1.position.set(26, QY + 0.6, -13 + 1.62); S.add(lbl1);
  const lbl2 = plate("AMONIA", 3.2, 0.9, "#6fc6d8", "#1d2224", "900 180px Rubik, Arial Black, sans-serif"); lbl2.position.set(32, QY + 0.6, -13 + 1.62); S.add(lbl2);

  // ---------- atoms: instanced glowing voxels ----------
  const glowAtom = (base, k) => {
    const m = new THREE.MeshStandardMaterial({ color: base, roughness: 0.3, metalness: 0.05, envMapIntensity: 1.2 });
    m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n totalEmissiveRadiance = vColor.rgb * ${k.toFixed(2)};`); };
    return m;
  };
  const aGeo = cubeGeo(1, 0.16);
  const NN = 260, NH = 700, NX = 260;
  const atN = new THREE.InstancedMesh(aGeo, glowAtom(0xffffff, 0.8), NN), atH = new THREE.InstancedMesh(aGeo, glowAtom(0xffffff, 0.5), NH), atX = new THREE.InstancedMesh(aGeo, glowAtom(0xffffff, 1.0), NX);
  const cN = new THREE.Color(0x3d8bff), cH = new THREE.Color(0xf4f8ff);
  for (let i = 0; i < NN; i++) atN.setColorAt(i, cN);
  for (let i = 0; i < NH; i++) atH.setColorAt(i, cH);
  for (let i = 0; i < NX; i++) atX.setColorAt(i, cH);
  for (const m of [atN, atH, atX]) { m.frustumCulled = false; m.castShadow = false; S.add(m); }
  const dm = new THREE.Object3D();
  let iN = 0, iH = 0, iX = 0;
  const put = (mesh, i, p, sc, rx = 0, ryy = 0) => { dm.position.copy(p); dm.rotation.set(rx, ryy, 0); dm.scale.setScalar(Math.max(0.0001, sc)); dm.updateMatrix(); mesh.setMatrixAt(i, dm.matrix); };
  const HOFF = [v3(0.62, -0.38, 0), v3(-0.31, -0.38, 0.54), v3(-0.31, -0.38, -0.54)];
  const tmp = v3(0, 0, 0), eul = new THREE.Euler(), qq = new THREE.Quaternion();
  function mol(p, sc, ang) { // NH3: one N with three H in a tripod
    if (iN >= NN || iH + 3 > NH) return;
    put(atN, iN++, p, sc * 0.62, 0.3, ang);
    eul.set(0.3, ang, 0); qq.setFromEuler(eul);
    for (const o of HOFF) { tmp.copy(o).multiplyScalar(sc).applyQuaternion(qq).add(p); put(atH, iH++, tmp, sc * 0.4, 0.3, ang); }
  }
  function pair(mesh, p, sc, ang, isN) { // H2 or N2
    for (const sg of [-1, 1]) {
      tmp.set(Math.cos(ang) * 0.36 * sc * sg, 0, Math.sin(ang) * 0.36 * sc * sg).add(p);
      if (isN) { if (iN < NN) put(atN, iN++, tmp, sc * 0.5, 0, ang); } else if (iH < NH) put(atH, iH++, tmp, sc * 0.42, 0, ang);
    }
  }
  const XC = { n2: new THREE.Color(0x3d8bff), h2o: new THREE.Color(0xdff4ff), nox: new THREE.Color(0xff7a2a), n2o: new THREE.Color(0xb05cff), nh3: new THREE.Color(0x4fe3c6), oil: new THREE.Color(0xffa040) };
  function xat(p, sc, col) { if (iX >= NX) return; put(atX, iX, p, sc, 0.4, 0.6); atX.setColorAt(iX, col); iX++; }

  // hero molecule (bigger, built as its own group so it can carry a glow shell)
  const hero = new THREE.Group();
  const hN = new THREE.Mesh(cubeGeo(1.9, 0.14), glowAtom(0xffffff, 0.55)); hN.geometry.setAttribute("color", new THREE.Float32BufferAttribute(new Array(hN.geometry.attributes.position.count * 3).fill(0).map((_, i) => [0.24, 0.55, 1.0][i % 3]), 3)); hN.material.vertexColors = true;
  hero.add(hN);
  const hHs = HOFF.map((o) => { const m = new THREE.Mesh(cubeGeo(1.15, 0.14), glowAtom(0xffffff, 0.3)); m.geometry.setAttribute("color", new THREE.Float32BufferAttribute(new Array(m.geometry.attributes.position.count * 3).fill(0.96), 3)); m.material.vertexColors = true; m.position.copy(o).multiplyScalar(2.2); hero.add(m); return m; });
  HOFF.forEach((o) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 1.4), new THREE.MeshStandardMaterial({ color: 0xcfd8e0, roughness: 0.4, metalness: 0.4 })); b.position.copy(o).multiplyScalar(1.1); b.lookAt(o.clone().multiplyScalar(3)); hero.add(b); });
  S.add(hero);
  // the carbon atom that is NOT there (dark voxel with a red X) and the pilot-diesel drop that lights the hook
  const carb = new THREE.Group();
  carb.add(new THREE.Mesh(cubeGeo(1.5, 0.14), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 })));
  const xm = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.35, 0.25) });
  for (const a of [0.785, -0.785]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.32, 0.32), xm); bar.rotation.z = a; bar.position.z = 0.9; carb.add(bar); }
  S.add(carb);
  const drop = new THREE.Mesh(cubeGeo(0.6, 0.2), new THREE.MeshStandardMaterial({ color: 0xffa040, emissive: 0xff7a20, emissiveIntensity: 1.6, roughness: 0.3 })); S.add(drop);
  const fl = new THREE.Group(); const flM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.5, 0.35), transparent: true, opacity: 0.9, depthWrite: false });
  [[0.9, 0, 0], [0.62, 0.7, 0], [0.38, 1.25, 0.05], [0.2, 1.65, -0.05]].forEach(([sz, y, x]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), flM); m.position.set(x, y, 0); fl.add(m); });
  S.add(fl);

  // ---------- molecule paths ----------
  const SHIPFEED = [v3(21.5, 6.0, 2.6), v3(26, 7.5, 5), v3(32, 7.5, 7), v3(EO.x - 7.6, EO.y + 0.5, EO.z + 1.0), v3(EO.x - 7.6, EO.y + LT + 3.3, EO.z + 1.0), v3(EO.x - 1.6, EO.y + LT + 3.3, EO.z + 1.0)];
  const sfLen = []; { let a = 0; for (let i = 0; i < SHIPFEED.length; i++) { sfLen.push(a); if (i < SHIPFEED.length - 1) a += SHIPFEED[i].distanceTo(SHIPFEED[i + 1]); } }
  const EXH = [v3(EO.x, EO.y + LT + 1.0, EO.z - 1.2), v3(EO.x, EO.y + LT + 4.2, EO.z - 1.2), v3(EO.x + 4.4, EO.y + LT + 4.2, EO.z - 1.2), v3(EO.x + 7.6, EO.y + LT + 4.2, EO.z - 1.2), v3(EO.x + 9.0, EO.y + LT + 4.2, EO.z - 1.2), v3(EO.x + 9.0, EO.y + LT + 11.5, EO.z - 1.2), v3(EO.x + 9.4, EO.y + LT + 13.2, EO.z - 1.2)];
  const exLen = []; { let a = 0; for (let i = 0; i < EXH.length; i++) { exLen.push(a); if (i < EXH.length - 1) a += EXH[i].distanceTo(EXH[i + 1]); } }
  const exCat = exLen[3] / exLen[exLen.length - 1];
  const RJ = []; { const rj = mulberry(101); for (let i = 0; i < 400; i++) RJ.push([rj() - 0.5, rj() - 0.5, rj(), rj()]); }

  // ---------- camera shots (keys on scene/word anchors) ----------
  // each key: [t, camX, camY, camZ, lookX, lookY, lookZ]
  const sh1 = track([[0, -39, 10, 28, -9, 9.5, 2], [E.tapi, -36, 10.5, 26.5, -8.5, 9.5, 2], [s.s1e + 0.6, -31, 12, 28, -6, 9, 0]]);
  const sh2 = track([[s.s2, -28, 30, 30], [E.ulsan, -18, 33, 31], [E.diisi, -7, 35, 31], [E.bukan, 5, 35, 30], [s.s2e + 0.6, 12, 34, 28]].map((k) => [...k, ...[-1, 1.5, -9]]));
  const sh3 = track([[s.s3, YC.x + 2, YC.y + 13, YC.z + 46, YC.x + 5, YC.y + 6.5, YC.z - 2], [E.memecah, YC.x + 5, YC.y + 12, YC.z + 43, YC.x + 7, YC.y + 6, YC.z], [E.satu, YC.x + 9, YC.y + 11, YC.z + 39, YC.x + 10, YC.y + 6.5, YC.z], [s.s3e + 0.6, YC.x + 12, YC.y + 11, YC.z + 37, YC.x + 11, YC.y + 6.5, YC.z - 1]]);
  const sh4 = track([[s.s4, 12, 22, 20, 5, 6.5, -15], [E.cair, 9.5, 21, 17.5, 5, 6.5, -14.5], [E.pipa, 6, 20, 19, 1, 6, -7], [s.s4e + 0.6, 2, 19, 21, -1, 5.5, -5]]);
  const sh5 = track([[s.s5, EO.x - 15, EO.y + 13, EO.z + 40, EO.x - 3, EO.y + 11.5, EO.z], [E.sulit, EO.x - 6, EO.y + 12.5, EO.z + 38, EO.x, EO.y + 11.8, EO.z], [E.disemprot, EO.x - 1, EO.y + 12.5, EO.z + 35, EO.x, EO.y + 12, EO.z], [s.s5e + 0.6, EO.x + 1, EO.y + 13, EO.z + 35, EO.x + 0.5, EO.y + 12.3, EO.z]]);
  const sh6 = track([[s.s6, EO.x + 3, EO.y + 17, EO.z + 34, EO.x + 4, EO.y + 17, EO.z], [E.masih, EO.x + 5, EO.y + 18.5, EO.z + 33, EO.x + 6, EO.y + 18.5, EO.z - 1], [E.katalis, EO.x + 6.5, EO.y + 19, EO.z + 31, EO.x + 7, EO.y + 19.5, EO.z - 1], [s.s6e + 0.6, EO.x + 7.5, EO.y + 19.5, EO.z + 31, EO.x + 7.5, EO.y + 20, EO.z - 1]]);
  const sh7 = track([[s.s7, 40, 10, 14, 29.5, 5.6, -13], [E.tangki, 34, 9.5, 12.5, 29, 6, -13], [s.s7e + 0.6, 30, 11, 12, 29, 6.4, -13]]);
  const sh8 = track([[s.s8, -18, 17, 50, -4, 8, -4], [E.dinyalakan, -30, 21, 58, -4, 8, -4], [s.dur, -38, 25, 64, -5, 8, -5]]);
  const SHOTS = [{ a: 0, f: sh1 }, { a: s.s2, f: sh2 }, { a: s.s3, f: sh3 }, { a: s.s4, f: sh4 }, { a: s.s5, f: sh5 }, { a: s.s6, f: sh6 }, { a: s.s7, f: sh7 }, { a: s.s8, f: sh8 }];
  const BW = 0.7;
  function camAt(t) {
    let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].a) i++;
    let c = SHOTS[i].f(t);
    const blend = (p, n, u) => { const d = Math.hypot(n[0] - p[0], n[2] - p[2]); const o = p.map((v, j) => lerp(v, n[j], u)); o[1] += Math.sin(Math.PI * u) * Math.min(22, d * 0.14); return o; };
    if (i + 1 < SHOTS.length && t > SHOTS[i + 1].a - BW) c = blend(c, SHOTS[i + 1].f(t), ramp(t, SHOTS[i + 1].a - BW, SHOTS[i + 1].a + BW));
    else if (i > 0 && t < SHOTS[i].a + BW) c = blend(SHOTS[i - 1].f(t), c, ramp(t, SHOTS[i].a - BW, SHOTS[i].a + BW));
    return c;
  }

  // ---------- post: NaN guard -> bloom -> output -> tilt-shift + warm grade ----------
  const comp = new EffectComposer(r, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  comp.addPass(new RenderPass(S, cam));
  const QV = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: QV,
    fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);bvec4 n=isnan(c);bvec4 f=isinf(c);if(any(n)||any(f))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,30.);}" })));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.38, 0.45, 1.0));
  comp.addPass(new OutputPass());
  const tsU = { tDiffuse: { value: null }, uFocus: { value: 0.46 }, uBand: { value: 0.17 }, uPx: { value: new THREE.Vector2(1 / W, 1 / H) } };
  comp.addPass(new ShaderPass(new THREE.ShaderMaterial({ uniforms: tsU, vertexShader: QV,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float uFocus,uBand;uniform vec2 uPx;varying vec2 vUv;
      void main(){float d=max(0.,abs(vUv.y-uFocus)-uBand);float rad=clamp(d*22.,0.,5.);vec3 acc=vec3(0.);float w=0.;
        for(int i=0;i<16;i++){float a=float(i)*2.399;float rr=sqrt((float(i)+.5)/16.)*rad;vec2 o=vec2(cos(a),sin(a))*rr*uPx*1.6;acc+=texture2D(tDiffuse,vUv+o).rgb;w+=1.;}
        vec3 c=acc/w;float l=dot(c,vec3(.2126,.7152,.0722));
        c*=mix(vec3(.93,.98,1.04),vec3(1.06,1.0,.9),smoothstep(.08,.75,l));c=mix(vec3(l),c,1.1);gl_FragColor=vec4(clamp(c,0.,1.),1.);}` })));

  const shipBase = v3(0, 0, 0);
  return (t) => {
    // ----- camera -----
    const c = camAt(t);
    cam.position.set(c[0] + 0.06 * Math.sin(t * 0.7), c[1] + 0.05 * Math.sin(t * 0.53 + 1), c[2]);
    cam.lookAt(c[3], c[4], c[5]);
    cam.updateMatrixWorld(true);
    sky.position.copy(cam.position);
    // shadow box follows what the camera looks at
    const foc = v3(c[3], 0, c[5]);
    key.target.position.copy(foc); key.position.copy(foc).add(v3(-40, 34, 26)); key.target.updateMatrixWorld();
    tsU.uFocus.value = 0.47;

    // ----- water caps bob -----
    CAPS.forEach((w, i) => { const y = 0.02 + 0.06 * Math.sin(t * 1.3 + w.ph); dm.position.set(w.x + 0.3 * Math.sin(t * 0.4 + w.ph), y, w.z); dm.rotation.set(0, w.ph, 0); dm.scale.set(w.s, 0.12, w.s * 0.6); dm.updateMatrix(); caps.setMatrixAt(i, dm.matrix); });
    caps.instanceMatrix.needsUpdate = true;

    // ----- ship: gentle heave; departs slowly in the outro -----
    const dep = ramp(t, E.dinyalakan, s.dur) * 6;
    ship.position.set(shipBase.x + dep, 0.08 * Math.sin(t * 0.9), 0); ship.rotation.x = 0.006 * Math.sin(t * 0.7);
    tug.position.y = 0.1 * Math.sin(t * 1.4 + 1); tug.rotation.z = 0.02 * Math.sin(t * 1.1);
    sboat.position.y = 0.09 * Math.sin(t * 1.2 + 2); sboat.rotation.z = 0.018 * Math.sin(t * 0.95 + 1); boom.position.y = 0.05 * Math.sin(t * 0.8);
    rotors.forEach((g, i) => (g.rotation.z = t * 1.3 + i * 0.7));

    // ----- lights by zone -----
    lamps[0].intensity = 18 * win(t, s.s2 - 0.5, s.s4e + 0.5, 0.6, 0.6) + 10 * ramp(t, s.s8 - 0.5, s.s8 + 0.5);
    lamps[1].intensity = 22 * win(t, s.s4 - 0.6, s.s4e + 0.5, 0.6, 0.6);
    lamps[2].intensity = 30 * win(t, s.s5 - 0.6, s.s6e + 0.5, 0.6, 0.6);

    // ----- hero molecule + missing carbon + pilot drop (hook and payoff) -----
    const heroOn = Math.max(1 - ramp(t, s.s2 + 1.0, s.s2 + 2.2), ramp(t, s.s8 - 0.6, s.s8 + 0.6));
    hero.visible = heroOn > 0.01;
    const hp = v3(-11, 10.6 + 0.25 * Math.sin(t * 1.1), 5).add(v3(ship.position.x, 0, 0));
    hero.position.copy(hp); hero.rotation.set(0.25, t * 0.45, 0.08 * Math.sin(t * 0.8)); hero.scale.setScalar(0.001 + heroOn * 1.5 * (1 + 0.04 * Math.sin(t * 2.3)));
    const cOn = 1 - ramp(t, E.tapi - 0.2, E.tapi + 0.5);
    carb.visible = cOn > 0.01 && t < s.s2;
    carb.position.set(hp.x + 6.0, hp.y + 2.2 + (1 - cOn) * 2, hp.z - 1); carb.scale.setScalar(0.001 + cOn); carb.rotation.set(0.2, -0.4 + t * 0.2, 0);
    carb.lookAt(cam.position); carb.rotateY(0.25);
    const dOn = win(t, E.tapi + 0.2, s.s2 + 1.2, 0.3, 0.6) + win(t, E.dinyalakan - 0.3, s.dur + 2, 0.3, 0.3);
    drop.visible = fl.visible = dOn > 0.01 && (t < s.s2 + 2 || t > s.s8);
    const dy = 1 - ramp(t, E.tapi + 0.2, E.solar1 + 0.2);
    drop.position.set(hp.x + 0.3, hp.y - 3.6 + dy * 2.6, hp.z + 0.6); drop.scale.setScalar(0.001 + dOn); drop.rotation.set(t, t * 0.7, 0);
    const ign = Math.max(ramp(t, E.solar1 - 0.05, E.solar1 + 0.35) * (t < s.s2 + 2 ? 1 : 0), t > s.s8 ? ramp(t, E.dinyalakan + 0.3, E.dinyalakan + 0.7) : 0);
    fl.position.set(hp.x + 0.3, hp.y - 3.6, hp.z + 0.6); fl.scale.set(0.001 + ign * 1.5 * (1 + 0.15 * Math.sin(t * 17)), 0.001 + ign * 1.5 * (1.1 + 0.25 * Math.sin(t * 13)), 0.001 + ign * 1.5); fl.lookAt(cam.position.x, fl.position.y, cam.position.z);

    // ----- tank 2 cutaway + liquid -----
    const lift = ramp(t, s.s4 - 0.3, E.mendidih + 0.3);
    front2.position.set(T2.x, T2.y + lift * 18, T2.z + lift * 6); front2.visible = lift < 0.98;
    const lvl = 5.4 + 0.08 * Math.sin(t * 1.7);
    liq.visible = frost.visible = lift > 0.02;
    liq.scale.set(1, lvl, 1); liq.position.set(T2.x, QY + 0.3 + lvl / 2, T2.z + 0.85);
    liq.material.emissiveIntensity = 0.7 + 0.5 * win(t, E.mendidih, E.pipa, 0.3, 0.5);

    // ----- engine cycle (2-stroke, illustrative period) -----
    const P = 2.6, th = (t / P) * Math.PI * 2, R = 2.5, Lr = 6, yc = 2.2;
    const cpx = R * Math.sin(th), cpy = yc + R * Math.cos(th);
    const pinY = cpy + Math.sqrt(Lr * Lr - cpx * cpx);
    const crown = pinY + 2.2;
    piston.position.set(EO.x, EO.y + crown, EO.z - 0.1);
    crank.rotation.z = -th;
    const rdx = 0 - cpx, rdy = pinY - cpy, rl = Math.hypot(rdx, rdy);
    rodM.position.set(EO.x + cpx, EO.y + cpy, EO.z + 0.6); rodM.scale.set(1, rl, 1); rodM.rotation.set(0, 0, -Math.atan2(rdx, rdy));
    const ph = ((th / (Math.PI * 2)) % 1 + 1) % 1; // 0 = TDC
    const phs = ph > 0.5 ? ph - 1 : ph; // -0.5..0.5
    const pilotI = win(phs, -0.07, 0.02, 0.015, 0.02), burn = phs > -0.02 ? Math.exp(-Math.max(0, phs + 0.02) * 6) * (phs < 0.3 ? 1 : 0) : 0;
    const engVis = t > s.s4e - 1 && t < s.s7 + 1;
    const chamberH = Math.max(0.2, EO.y + LT - (EO.y + crown));
    flame.position.set(EO.x, EO.y + crown + chamberH / 2, EO.z); flame.scale.set(1, chamberH, 1);
    flameMat.opacity = 0.75 * burn * (engVis ? 1 : 0);
    flameMat.color.setRGB(1.0, 0.55 + 0.35 * burn, 0.2);
    pilotFl.position.set(EO.x + 1.4, EO.y + LT - 0.6, EO.z + 1.0); pilotFl.material.opacity = Math.max(pilotI, burn > 0.85 ? 0.6 : 0) * (engVis ? 1 : 0);
    lamps[2].color.setRGB(1, 0.6 + 0.2 * burn, 0.35); lamps[2].intensity *= 0.6 + 0.8 * burn;
    const catOn = ramp(t, E.katalis - 0.2, E.katalis + 0.6);
    catMat.emissiveIntensity = 0.15 + 1.6 * catOn;

    // ----- tank comparison blocks -----
    for (let i = 0; i < 32; i++) {
      const dz = i < 8, j = dz ? i : i - 8;
      const bx = (dz ? 26 : 32) + ((j % 2) - 0.5) * 1.08, bz = -13 + (((j >> 1) % 2) - 0.5) * 1.08, by = QY + 1.95 + Math.floor(j / 4) * 1.08;
      const tIn = dz ? E.energi - 0.4 + j * 0.06 : E.tangki - 0.2 + j * ((E.tiga - E.tangki + 0.5) / 24);
      const u = ramp(t, tIn, tIn + 0.35), on = t > s.s6e - 0.5 && t < s.s8 + 1.5 ? u : 0;
      dm.position.set(bx, by + (1 - u) * 3, bz); dm.rotation.set(0, 0, 0); dm.scale.setScalar(Math.max(0.0001, back(on, 1.4) * 0.98)); dm.updateMatrix(); blk.setMatrixAt(i, dm.matrix);
    }
    blk.instanceMatrix.needsUpdate = true;
    blk.material.emissiveIntensity = 0.12 * win(t, E.tiga, s.s7e + 0.5, 0.3, 0.5);

    // ----- molecules -----
    iN = 0; iH = 0; iX = 0;
    // A: green-ammonia island
    const yOn = win(t, s.s3 - 1.0, s.s4 + 0.6, 0.5, 0.5);
    if (yOn > 0.01) {
      const hOn = ramp(t, E.memecah - 0.3, E.memecah + 0.4) * yOn, nOn = ramp(t, E.udara - 0.3, E.udara + 0.4) * yOn, aOn = ramp(t, E.satu - 0.3, E.satu + 0.5) * yOn;
      for (let k = 0; k < 14; k++) { // H2 from the electrolyser to the reactor (arc)
        const u = ((t * 0.32 + k / 14) % 1), J = RJ[k];
        const p = v3(lerp(EL.x + 1, RX.x - 1.4, u), YC.y + 3.2 + Math.sin(u * Math.PI) * 4.5 + J[0], lerp(EL.z, RX.z, u) + J[1] * 1.4);
        pair(atH, p, 0.85 * hOn * Math.min(1, u * 8, (1 - u) * 8), t * 2 + k, false);
      }
      for (let k = 0; k < 10; k++) { // N2 from the air column down to the reactor
        const u = ((t * 0.28 + k / 10) % 1), J = RJ[k + 20];
        const p = v3(lerp(AC.x, RX.x, u) + J[0], YC.y + lerp(12.8, 6.5, u) + Math.sin(u * Math.PI) * 1.5, lerp(AC.z, RX.z - 1.2, u) + J[1]);
        pair(atN, p, 0.9 * nOn * Math.min(1, u * 8, (1 - u) * 8), t * 1.6 + k, true);
      }
      for (let k = 0; k < 10; k++) { // NH3 out of the reactor, over to the product sphere and up
        const u = ((t * 0.25 + k / 10) % 1), J = RJ[k + 40];
        const p = u < 0.5 ? v3(lerp(RX.x + 1.5, PS.x, u * 2), YC.y + 6.6 + J[0], RX.z + J[1]) : v3(PS.x + J[0], YC.y + 6.6 + (u - 0.5) * 12, lerp(RX.z, PS.z, (u - 0.5) * 2));
        mol(p, 1.1 * aOn * Math.min(1, u * 8, (1 - u) * 6), t * 1.2 + k);
      }
      // hero-sized "1 N + 3 H" assembling above the reactor on "Satu"
      const asm = ramp(t, E.satu - 0.2, E.satu + 1.4) * yOn;
      if (asm > 0.01) {
        const cp = v3(RX.x - 1, YC.y + 11.5, RX.z + 1);
        put(atN, iN++, cp, 1.1 * Math.min(1, asm * 3), 0.3, t * 0.6);
        eul.set(0.3, t * 0.6, 0); qq.setFromEuler(eul);
        HOFF.forEach((o, k) => { const far = 1 + 3.2 * (1 - ramp(t, E.satu + 0.2 + k * 0.25, E.satu + 0.9 + k * 0.25)); tmp.copy(o).multiplyScalar(1.7 * far).applyQuaternion(qq).add(cp); if (iH < NH) put(atH, iH++, tmp, 0.7 * Math.min(1, asm * 3), 0.3, t * 0.6); });
      }
    }
    // B: shore tank -> pipe -> ship manifold
    const pOn = Math.max(win(t, E.diisi - 0.2, s.s2e + 0.5, 0.4, 0.5), win(t, E.pipa - 0.4, s.s4e + 0.6, 0.4, 0.5));
    if (pOn > 0.01) for (let k = 0; k < 18; k++) { const u = ((t * 0.16 + k / 18) % 1); const p = along(PIPE, pipeLen, u); mol(p, 0.42 * pOn, t * 2 + k); }
    // bubbles of boil-off in the cut tank (s4)
    const bOn = win(t, E.mendidih - 0.2, s.s4e, 0.3, 0.5) * lift;
    if (bOn > 0.01) for (let k = 0; k < 10; k++) { const J = RJ[k + 60], u = ((t * 0.35 + J[2]) % 1); mol(v3(T2.x + J[0] * 5.6, QY + 0.8 + u * 4.8, T2.z + 1.4), 0.32 * bOn * Math.min(1, (1 - u) * 5), t + k); }
    // C: ship -> engine feed (s5)
    const fOn = win(t, s.s5 - 0.8, s.s6 + 1.0, 0.5, 0.6);
    if (fOn > 0.01) for (let k = 0; k < 16; k++) { const u = ((t * 0.11 + k / 16) % 1); const p = along(SHIPFEED, sfLen, u); mol(p, 0.4 * fOn, t * 2 + k); }
    // D: injection sprays inside the chamber
    if (engVis) {
      const nhSpray = win(phs, -0.05, 0.12, 0.02, 0.04), plSpray = pilotI;
      for (let k = 0; k < 26; k++) {
        const J = RJ[k + 80], u = (J[2] + t * 3.1) % 1;
        if (nhSpray > 0.01) { const p = v3(EO.x - 1.4 + u * 2.4 + J[0] * 0.8, EO.y + LT - 0.3 - u * Math.min(2.2, chamberH - 0.3), EO.z + 1.0 + J[1] * 1.6); if (iN < NN) put(atN, iN++, p, 0.26 * nhSpray, t, k); }
        if (plSpray > 0.01 && k < 10) { const p = v3(EO.x + 1.5 - u * 1.2 + J[0] * 0.4, EO.y + LT - 0.3 - u * 1.4, EO.z + 1.0 + J[1] * 0.6); xat(p, 0.22 * plSpray, XC.oil); }
      }
    }
    // E: exhaust through the catalyst (s6)
    const xOn = win(t, s.s6 - 0.6, s.s7 + 0.6, 0.5, 0.6);
    if (xOn > 0.01) {
      const ni = ramp(t, E.nitro - 0.2, E.nitro + 0.5), ms = ramp(t, E.masih - 0.2, E.masih + 0.5);
      for (let k = 0; k < 90; k++) {
        const J = RJ[k + 120], u = ((t * 0.09 + k / 90) % 1);
        const p = along(EXH, exLen, u).add(v3(J[0] * 0.7, J[1] * 0.7, J[1] * 0.6));
        const r4 = J[3];
        let typ = r4 < 0.42 ? "n2" : r4 < 0.72 ? "h2o" : r4 < 0.88 ? "nox" : r4 < 0.95 ? "n2o" : "nh3";
        let sc = 0.46;
        if (typ === "nox" || typ === "n2o" || typ === "nh3") { sc *= ms; if (typ === "nox" && u > exCat && catOn > 0.5) typ = J[0] > 0 ? "n2" : "h2o"; }
        else sc *= ni;
        xat(p, sc * xOn * Math.min(1, u * 10, (1 - u) * 4), XC[typ]);
      }
    }
    for (let i = iN; i < NN; i++) put(atN, i, tmp.set(0, -99, 0), 0.0001);
    for (let i = iH; i < NH; i++) put(atH, i, tmp.set(0, -99, 0), 0.0001);
    for (let i = iX; i < NX; i++) put(atX, i, tmp.set(0, -99, 0), 0.0001);
    atN.instanceMatrix.needsUpdate = atH.instanceMatrix.needsUpdate = atX.instanceMatrix.needsUpdate = true;
    if (atX.instanceColor) atX.instanceColor.needsUpdate = true;

    comp.render();
  };
}
