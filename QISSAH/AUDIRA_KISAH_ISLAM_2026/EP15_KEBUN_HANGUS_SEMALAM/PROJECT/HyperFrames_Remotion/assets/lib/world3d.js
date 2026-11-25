// EP15 KEBUN YANG HANGUS SEMALAM. CLAYWORLD: a stop-motion plasticine diorama of a hillside orchard (date palms, fruit trees,
// grape trellises) behind a low clay wall with a wooden gate, a clay house and a low majlis table in the yard.
// Every surface carries a thumbprint bump; characters, growth and the charring move "on twos" (time quantised to 12 fps)
// with a slight clay boil, while the camera glides smoothly like a motion-control rig.
// People: the father, three sons and the poor are faceless clay figures (round heads, no features), never comic.
// The calamity (QS 68:19-20) is never a figure or fire: the clay itself turns charcoal from the orchard edges inward.
// Layout: gate at z=5.5 (x=0) facing +z, orchard behind it on the rising slope (|x|<12.4, -23<z<5.4),
// house at (-13,0,12) with its door facing +z, low table at (-12,0,17.6), AUDIRA clay sign at (-3,0,6.6).
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const OX = 12.4, OZ0 = -23, OZ1 = 5.4, OCZ = (OZ0 + OZ1) / 2, OHZ = (OZ1 - OZ0) / 2;
const inOrchard = (x, z) => Math.abs(x) < OX && z > OZ0 && z < OZ1;

export function H(x, z) {
  const ax = Math.abs(x);
  let h = 5.6 * sm((4.8 - z) / 30) + 5 * sm((-z - 24) / 16);
  h += 2.4 * sm((ax - 16) / 14) * sm((8 - z) / 14);
  const amp = 0.55 * sm((5 - z) / 3) * (inOrchard(x, z) ? 0.35 : 1) + 0.35 * sm((ax - 20) / 8);
  h += (vnoise(x * 0.17 + 3, z * 0.17) - 0.5) * amp;
  return h;
}
// how far an orchard point sits from the centre (1 = at the wall): the char starts at the edges
const edge = (x, z) => Math.max(Math.abs(x) / OX, Math.abs(z - OCZ) / OHZ);
const thOf = (x, z) => clamp01(1 - edge(x, z) + (vnoise(x * 0.33 + 7, z * 0.33) - 0.5) * 0.22);

// a hand-squeezed sphere: smooth low-frequency wobble along the normal
function blobGeo(r, seed, seg = 18, amp = 0.07) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg * 0.7)));
  const p = g.attributes.position, R = mulberry(seed), a = [R() * 9, R() * 9, R() * 9], v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const d = 1 + amp * (Math.sin(n.x * 3.1 + a[0]) * Math.sin(n.y * 2.7 + a[1]) + 0.6 * Math.sin(n.z * 4.3 + a[2] + n.x * 2));
    p.setXYZ(i, v.x * d, v.y * d, v.z * d);
  }
  g.computeVertexNormals();
  return g;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x1a2238, fog: 0.0055, exp: 1.0, bloom: [0.2, 0.5, 0.9], shadow: true });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const Q = (t) => Math.floor(t * 12 + 1e-6) / 12;            // stop-motion: animate on twos
  const C = (h) => new THREE.Color(h);

  // ---------- timing
  const tMorning = A("s1:Paginya");
  const tRewind = K.s2;
  const tSp0 = K.s4 + 0.5, tSp1 = A("s4:hitam");
  const tGrow = A("s7:Semoga");
  const HB = [A("s2:ayah"), A("s2:menyisihkan"), A("s2:panen")];

  // char progress 0 = lush, 1 = all charcoal
  function P(tq) {
    if (tq < K.s2 - 0.2) return ramp(tq, tMorning - 0.05, tMorning + 0.6);
    if (tq < K.s4) return 1 - ramp(tq, tRewind - 0.2, tRewind + 0.65);   // flashback: the char runs backwards
    if (tq < K.s5) return ramp(tq, tSp0, tSp1) * 0.98 + 0.02 * ramp(tq, tSp1, tSp1 + 0.5);
    return 1;
  }
  const charAt = (p, th) => sm((p * 1.42 - th) / 0.42);

  // ---------- thumbprint bump (shared by every clay surface)
  const thumb = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, w, w);
    const R = mulberry(77);
    for (let i = 0; i < 1400; i++) { const v = R() < 0.5 ? 60 : 200; g.fillStyle = `rgba(${v},${v},${v},.10)`; g.beginPath(); g.arc(R() * w, R() * w, 1 + R() * 5, 0, 6.3); g.fill(); }
    for (let i = 0; i < 40; i++) {
      const cx = R() * w, cy = R() * w, rr = 10 + R() * 26;
      g.save(); g.translate(cx, cy); g.rotate(R() * 6.28);
      for (let k = 0; k < 7; k++) { g.strokeStyle = `rgba(${k % 2 ? 70 : 190},${k % 2 ? 70 : 190},${k % 2 ? 70 : 190},.22)`; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, rr * (1 - k * 0.12) * 1.35, rr * (1 - k * 0.12), 0, 0.25, 5.6); g.stroke(); }
      g.restore();
    }
  }, [2, 2]);
  const clay = (c, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0, bumpMap: thumb, bumpScale: 1.2, ...ex });

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 160 });
  scene.add(key); scene.add(key.target);
  const lanL = new THREE.PointLight(0xffb060, 0, 9, 1.6); lanL.position.set(-12, 1.05, 17.6); scene.add(lanL);
  const winL = new THREE.PointLight(0xffa850, 0, 11, 1.6); winL.position.set(-13, 1.8, 15); scene.add(winL);
  const sproutL = new THREE.PointLight(0x9cff7a, 0, 3.5, 1.8); sproutL.position.set(0.15, 0.6, 4.4); scene.add(sproutL);

  // ---------- moods
  const ST = {
    NIGHT1: { top: C(0x10173a), hor: C(0x3a4676), kc: C(0x9fb6ff), ki: 1.5, az: -40, el: 40, hs: C(0x6274b4), hg: C(0x2a2236), hi: 0.95, fog: 0.006, exp: 1.08, star: 1, moon: 1, lan: 0, win: 0, sun: 0 },
    MORN: { top: C(0x8fb4cc), hor: C(0xe6d8c4), kc: C(0xfff0de), ki: 2.1, az: 40, el: 30, hs: C(0xc8d8e6), hg: C(0x7a6250), hi: 1.0, fog: 0.0055, exp: 1.0, star: 0, moon: 0, lan: 0, win: 0, sun: 0.5 },
    GOLD: { top: C(0x6fa8d6), hor: C(0xffd59c), kc: C(0xffd096), ki: 2.7, az: -55, el: 26, hs: C(0xbcd6ee), hg: C(0x9a6a3a), hi: 1.05, fog: 0.0045, exp: 1.0, star: 0, moon: 0, lan: 0, win: 0, sun: 1 },
    EVE: { top: C(0x35386a), hor: C(0xf09464), kc: C(0xff9a5e), ki: 1.5, az: -75, el: 9, hs: C(0x7a6c9e), hg: C(0x4a2a2a), hi: 0.8, fog: 0.005, exp: 1.05, star: 0.3, moon: 0, lan: 1, win: 1, sun: 0.6 },
    NIGHT: { top: C(0x0c1230), hor: C(0x2c3660), kc: C(0xa6b8f4), ki: 2.7, az: 30, el: 42, hs: C(0x5a68a4), hg: C(0x231c2c), hi: 1.25, fog: 0.006, exp: 1.25, star: 1, moon: 1, lan: 0, win: 0, sun: 0 },
    DAWN: { top: C(0x56679c), hor: C(0xf0b4a4), kc: C(0xffc2a6), ki: 1.5, az: 65, el: 9, hs: C(0x8a9ac4), hg: C(0x5a4040), hi: 0.85, fog: 0.007, exp: 1.04, star: 0.2, moon: 0.3, lan: 0, win: 0.25, sun: 0.4 },
    GREY: { top: C(0x95a4b6), hor: C(0xd8d0c6), kc: C(0xf4ece0), ki: 1.8, az: 50, el: 28, hs: C(0xc0c8d2), hg: C(0x6a5a50), hi: 1.0, fog: 0.006, exp: 1.0, star: 0, moon: 0, lan: 0, win: 0, sun: 0.3 },
    SOFT: { top: C(0x88b6da), hor: C(0xf6e0c0), kc: C(0xffe6c4), ki: 2.2, az: 45, el: 30, hs: C(0xcde0ee), hg: C(0x8a6a4a), hi: 1.05, fog: 0.005, exp: 1.0, star: 0, moon: 0, lan: 0, win: 0, sun: 0.8 },
    WARM: { top: C(0x7cb2de), hor: C(0xffd8a6), kc: C(0xffdcaa), ki: 2.5, az: 35, el: 28, hs: C(0xc6dcf0), hg: C(0x9a6e42), hi: 1.05, fog: 0.0045, exp: 1.0, star: 0, moon: 0, lan: 0, win: 0, sun: 1 },
  };
  const MOOD = [[0, "NIGHT1"], [tMorning - 0.15, "NIGHT1"], [tMorning + 0.75, "MORN"], [K.s2 - 0.25, "MORN"], [K.s2 + 0.6, "GOLD"], [K.s3 - 0.4, "GOLD"], [K.s3 + 1.6, "EVE"],
    [K.s4 - 0.3, "EVE"], [K.s4 + 0.7, "NIGHT"], [K.s5 - 0.2, "NIGHT"], [K.s5 + 1.2, "DAWN"], [K.s6, "DAWN"], [K.s6 + 2, "GREY"], [tGrow - 0.5, "GREY"], [tGrow + 2.5, "SOFT"], [K.s8 + 2, "WARM"], [K.dur, "WARM"]];
  const M = { top: new THREE.Color(), hor: new THREE.Color(), kc: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color() };
  const kDir = new THREE.Vector3();
  function mood(t) {
    let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++;
    const a = ST[MOOD[i][1]], b = ST[MOOD[i + 1][1]];
    const u = sm((t - MOOD[i][0]) / Math.max(0.001, MOOD[i + 1][0] - MOOD[i][0]));
    for (const k of ["top", "hor", "kc", "hs", "hg"]) M[k].copy(a[k]).lerp(b[k], u);
    for (const k of ["ki", "az", "el", "hi", "fog", "exp", "star", "moon", "lan", "win", "sun"]) M[k] = a[k] + (b[k] - a[k]) * u;
    const az = M.az * Math.PI / 180, el = M.el * Math.PI / 180;
    kDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    return M;
  }

  // ---------- painted backdrop: banded like strips of rolled clay, faint clay stars at night
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uStar: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor;uniform float uStar;varying vec3 vD;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 d=normalize(vD);float a=atan(d.z,d.x);
 float e=clamp(d.y,-.2,1.)+.018*sin(a*7.)+.01*sin(a*17.+1.);
 float k=smoothstep(-.03,.5,e);float b=floor(k*7.)/7.;float f=fract(k*7.);b+=smoothstep(.85,1.,f)/7.;
 vec3 c=mix(uHor,uTop,b);
 vec2 g=floor(vec2(a*60.,d.y*90.));float s=step(.993,hsh(g))*smoothstep(.12,.35,d.y)*uStar;
 c=mix(c,vec3(1.,.95,.8),s*.8);
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // moon and sun: clay discs pressed on the backdrop
  const moon = new THREE.Mesh(blobGeo(5, 5, 24, 0.03), new THREE.MeshBasicMaterial({ color: 0xf4ecd0, fog: false, transparent: true }));
  moon.position.set(-22, 30, -150); moon.scale.z = 0.3; scene.add(moon);
  const sunB = new THREE.Mesh(blobGeo(6, 6, 24, 0.03), new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false, transparent: true }));
  sunB.position.set(30, 26, -150); sunB.scale.z = 0.3; scene.add(sunB);

  // far clay hills all around and clay clouds
  const R0 = mulberry(1501);
  const hillCols = [0x7da04a, 0x92ae58, 0x6d8f46, 0xa7a35a, 0x88a35a];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + R0() * 0.2, rr = 78 + R0() * 22;
    const m = new THREE.Mesh(blobGeo(1, 100 + i, 20, 0.06), clay(hillCols[i % 5]));
    const sx = 16 + R0() * 14;
    m.scale.set(sx, 7 + R0() * 9, sx * 0.6);
    m.position.set(Math.sin(a) * rr, -2, -Math.cos(a) * rr);
    m.rotation.y = -a;
    m.receiveShadow = false; scene.add(m);
  }
  const clouds = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(blobGeo(1, 200 + i * 4 + k, 14, 0.08), clay(0xfaf4ea)); b.position.set((k - 1.5) * 2.2, (k % 2) * 0.9, 0); b.scale.set(2.4 - Math.abs(k - 1.5) * 0.4, 1.6, 1.2); g.add(b); }
    const a = -0.9 + i * 0.3 + (i > 3 ? 2.6 : 0);
    g.userData = { a, rr: 95 + R0() * 15, y: 26 + R0() * 14, sp: 0.004 + R0() * 0.004 };
    scene.add(g); clouds.push(g);
  }

  // ---------- ground: one clay slab, vertex coloured (yard, grass, path, orchard)
  const PATH = new THREE.CatmullRomCurve3([[-13, 0, 14.6], [-10.5, 0, 12.6], [-7.5, 0, 11.2], [-4.4, 0, 9.6], [-1.6, 0, 8.4], [0, 0, 6.6]].map((a) => new THREE.Vector3(...a)));
  const PP = PATH.getSpacedPoints(80);
  const pathD = (x, z) => { let m = 99; for (const p of PP) m = Math.min(m, Math.hypot(p.x - x, p.z - z)); return m; };
  const GW = 150, GN = 190;
  const gg = new THREE.PlaneGeometry(GW, GW, GN, GN); gg.rotateX(-Math.PI / 2);
  const gp = gg.attributes.position, gcol = new Float32Array(gp.count * 3), gbase = new Float32Array(gp.count * 3);
  const oIdx = [], oTh = [];
  const tc = new THREE.Color();
  const grass = C(0x8fb556), grass2 = C(0x76a046), yard = C(0xd9b07a), path = C(0xe6c896), soil = C(0x6e9a42), soil2 = C(0x5d8a38);
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i);
    gp.setY(i, H(x, z));
    tc.copy(grass).lerp(grass2, vnoise(x * 0.2, z * 0.2));
    const yd = Math.hypot((x + 12.5) / 8, (z - 15) / 5.5);
    tc.lerp(yard, 1 - sm((yd - 0.85) / 0.3));
    tc.lerp(path, 1 - sm((pathD(x, z) - 0.7) / 0.35));
    if (inOrchard(x, z)) {
      tc.copy(soil).lerp(soil2, vnoise(x * 0.4 + 2, z * 0.4));
      if (Math.abs(x) < 1.2) tc.lerp(path, 0.55);
      oIdx.push(i); oTh.push(thOf(x, z));
    }
    gbase[i * 3] = gcol[i * 3] = tc.r; gbase[i * 3 + 1] = gcol[i * 3 + 1] = tc.g; gbase[i * 3 + 2] = gcol[i * 3 + 2] = tc.b;
  }
  gg.setAttribute("color", new THREE.BufferAttribute(gcol, 3));
  gg.computeVertexNormals();
  const ground = new THREE.Mesh(gg, clay(0xffffff, { vertexColors: true, bumpScale: 1.6 }));
  ground.receiveShadow = true; scene.add(ground);

  // ---------- instanced orchard parts (every part chars by its own threshold)
  const EL = [];
  const IM = {};
  function inst(name, geo, n, mat) {
    const m = new THREE.InstancedMesh(geo, mat || clay(0xffffff), n);
    m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    m.userData.n = 0; IM[name] = m; scene.add(m); return m;
  }
  function el(name, kind, p, e, s, col, th, ex = {}) {
    const m = IM[name], i = m.userData.n++;
    EL.push({ m, i, kind, p: p.clone(), e: e.clone(), s: s.clone(), col: C(col), th, ...ex });
  }
  inst("ptrunk", new THREE.CylinderGeometry(0.15, 0.26, 1, 10).translate(0, 0.5, 0), 20);
  inst("pring", new THREE.TorusGeometry(0.2, 0.065, 6, 12).rotateX(Math.PI / 2), 160);
  inst("frond", blobGeo(1, 31, 14, 0.05).scale(0.3, 0.07, 1.25).translate(0, 0, 1.15), 200);
  inst("date", blobGeo(0.11, 32, 8, 0.05), 500);
  inst("trunk", new THREE.CylinderGeometry(0.12, 0.22, 1, 9).translate(0, 0.5, 0), 30);
  inst("canopy", blobGeo(1, 33, 18, 0.1), 130);
  inst("fruit", blobGeo(0.16, 34, 10, 0.06), 600);
  inst("post", new THREE.CylinderGeometry(0.07, 0.09, 1.7, 7).translate(0, 0.85, 0), 40);
  inst("bar", new THREE.CylinderGeometry(0.05, 0.05, 1, 6).rotateZ(Math.PI / 2), 40);
  inst("leaf", blobGeo(0.3, 35, 10, 0.12).scale(1, 0.7, 0.8), 400);
  inst("grape", new THREE.SphereGeometry(0.075, 8, 6), 1400);
  inst("tuft", new THREE.ConeGeometry(0.09, 0.36, 5).translate(0, 0.17, 0), 320);
  const V = (x, y, z) => new THREE.Vector3(x, y, z), E = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);

  const RO = mulberry(1515);
  const palmSpots = [];
  for (let i = 0; i < 8; i++) palmSpots.push([-10.2 + i * 2.9 + (RO() - 0.5) * 0.6, -20.6 + (RO() - 0.5) * 1.2]);
  for (const s of [-1, 1]) for (const z of [-15.5, -10.5, -5.5]) palmSpots.push([s * (11 + (RO() - 0.5) * 0.5), z + (RO() - 0.5)]);
  for (const [x, z] of palmSpots) {
    const y = H(x, z), h = 4.6 + RO() * 1.6, th = thOf(x, z), tilt = (RO() - 0.5) * 0.12;
    el("ptrunk", "trunk", V(x, y, z), E(tilt, 0, tilt * 0.5), V(1, h, 1), 0x9a6a42, th);
    for (let k = 0; k < 7; k++) el("pring", "trunk", V(x + tilt * 0.5 * (k / 7) * h, y + (k + 0.6) * h / 7.5, z + tilt * (k / 7) * h), E(), V(1 - k * 0.06, 1, 1 - k * 0.06), k % 2 ? 0x8a5c38 : 0xa87850, th);
    const cy = y + h, cx = x + tilt * 0.5 * h, cz = z + tilt * h;
    for (let k = 0; k < 9; k++) el("frond", "frond", V(cx, cy, cz), E(0.35 + RO() * 0.25, k * 0.698 + RO() * 0.2, 0), V(1, 1, 0.9 + RO() * 0.3), k % 2 ? 0x4f9a3a : 0x63ad45, th, { pitch: 0.35 + RO() * 0.25, yaw: k * 0.698 + RO() * 0.2 });
    for (let c = 0; c < 4; c++) {
      const a = c * 1.57 + 0.4;
      for (let k = 0; k < 7; k++) el("date", "fruit", V(cx + Math.sin(a) * (0.35 + (k % 3) * 0.07), cy - 0.3 - (k * 0.09), cz + Math.cos(a) * (0.35 + (k % 2) * 0.08)), E(), V(1, 1, 1), c % 2 ? 0xd9822b : 0xc0581e, th);
    }
  }
  const fruitCols = [0xf28c28, 0xd7263d, 0xf2d03c, 0xe2552a, 0xc21f4a];
  const treeSpots = [];
  for (const z of [-15.8, -11.6, -7.4]) for (const x of [-8.4, -5.0, -1.8, 1.8, 5.0, 8.4]) treeSpots.push([x + (RO() - 0.5) * 0.8, z + (RO() - 0.5) * 0.9]);
  treeSpots.forEach(([x, z], ti) => {
    const y = H(x, z), th = thOf(x, z), h = 1.4 + RO() * 0.5, fc = fruitCols[ti % 5];
    el("trunk", "trunk", V(x, y, z), E(), V(1, h + 0.6, 1), 0x8a5a36, th);
    const cs = [[0, h + 0.9, 0, 1.15], [0.7, h + 0.55, 0.2, 0.85], [-0.65, h + 0.6, -0.15, 0.85], [0.05, h + 0.55, 0.65, 0.8], [0.0, h + 1.6, -0.1, 0.75]];
    const g0 = [0x5aa83e, 0x6cb84a, 0x4c9636][ti % 3];
    for (const [ox, oy, oz, rr] of cs) {
      el("canopy", "canopy", V(x + ox, y + oy, z + oz), E(RO(), RO() * 6, 0), V(rr, rr * 0.92, rr), g0, th);
      for (let k = 0; k < 4; k++) {
        const u = RO() * 6.28, v = RO() * 1.4 - 0.4;
        const dx = Math.cos(u) * Math.cos(v), dy = Math.sin(v), dz = Math.sin(u) * Math.cos(v);
        el("fruit", "fruit", V(x + ox + dx * rr * 0.93, y + oy + dy * rr * 0.9, z + oz + dz * rr * 0.93), E(), V(1, 1, 1).multiplyScalar(0.9 + RO() * 0.35), fc, th);
      }
    }
  });
  // grape trellises: three rows in front, a clear aisle down the middle
  for (const z of [-3.6, -1.1, 1.5]) for (const side of [-1, 1]) {
    const xs = [1.6, 4.4, 7.2, 10.0].map((v) => v * side);
    xs.forEach((x, k) => {
      const y = H(x, z);
      el("post", "wood", V(x, y, z), E(0, 0, (RO() - 0.5) * 0.06), V(1, 1, 1), 0x8f6440, thOf(x, z));
      if (k < 3) {
        const x2 = xs[k + 1], mx = (x + x2) / 2, y2 = H(x2, z), my = (y + y2) / 2 + 1.55;
        el("bar", "wood", V(mx, my, z), E(0, 0, Math.atan2(y2 - y, x2 - x)), V(Math.abs(x2 - x), 1, 1), 0x8f6440, thOf(mx, z));
        for (let j = 0; j < 6; j++) {
          const lx = x + (x2 - x) * (j + 0.5) / 6, ly = y + (y2 - y) * (j + 0.5) / 6 + 1.55;
          el("leaf", "canopy", V(lx, ly + 0.08, z + (RO() - 0.5) * 0.25), E(RO(), RO() * 6, RO()), V(1, 1, 1).multiplyScalar(0.9 + RO() * 0.4), j % 2 ? 0x5fae42 : 0x74bf4c, thOf(lx, z));
          if (j % 2 === 0) {
            const gc = (k + j / 2) % 3 === 0 ? 0x9cc23e : (j % 4 ? 0x6a2c7e : 0x57246c);
            for (let q = 0; q < 10; q++) {
              const row = q < 4 ? 0 : q < 7 ? 1 : q < 9 ? 2 : 3, inRow = [4, 3, 2, 1][row], qi = q - [0, 4, 7, 9][row];
              el("grape", "fruit", V(lx + (qi - (inRow - 1) / 2) * 0.13, ly - 0.2 - row * 0.12, z + 0.12 + (qi % 2) * 0.04), E(), V(1, 1, 1), gc, thOf(lx, z));
            }
          }
        }
      }
    });
  }
  for (let i = 0; i < 320; i++) {
    const x = (RO() - 0.5) * 2 * (OX - 0.5), z = OZ0 + 0.5 + RO() * (OZ1 - OZ0 - 1);
    if (Math.abs(x) < 1.1) continue;
    el("tuft", "tuft", V(x, H(x, z), z), E((RO() - 0.5) * 0.4, 0, (RO() - 0.5) * 0.4), V(1, 0.8 + RO() * 0.7, 1), RO() < 0.5 ? 0x7cb84a : 0x5fa13c, thOf(x, z));
  }
  for (const k in IM) IM[k].count = IM[k].userData.n;

  const charcoal = C(0x2a2624), ashBrown = C(0x4a3a30), fm = new THREE.Matrix4(), tq3 = new THREE.Quaternion(), tv = new THREE.Vector3(), ts = new THREE.Vector3(), te = new THREE.Euler();
  let lastP = -1;
  function applyChar(p) {
    if (Math.abs(p - lastP) < 1e-5) return;
    lastP = p;
    for (const o of EL) {
      const c = charAt(p, o.th);
      tc.copy(o.col).lerp(ashBrown, sm(c * 2)).lerp(charcoal, sm(c * 2 - 1));
      tv.copy(o.p); ts.copy(o.s); te.copy(o.e);
      if (o.kind === "fruit") { const k = 1 - sm((c - 0.45) / 0.4); ts.multiplyScalar(Math.max(0.0001, k)); tv.y -= 0.25 * sm((c - 0.4) / 0.5); }
      else if (o.kind === "canopy") { ts.multiplyScalar(1 - 0.22 * c); tv.y -= 0.18 * c; }
      else if (o.kind === "frond") te.set(o.pitch + 0.75 * c, o.yaw, 0);
      else if (o.kind === "tuft") ts.y *= 1 - 0.6 * c;
      o.m.setMatrixAt(o.i, fm.compose(tv, tq3.setFromEuler(te), ts));
      o.m.setColorAt(o.i, tc);
    }
    for (const k in IM) { IM[k].instanceMatrix.needsUpdate = true; IM[k].instanceColor.needsUpdate = true; }
    for (let j = 0; j < oIdx.length; j++) {
      const i = oIdx[j], c = charAt(p, oTh[j]);
      tc.setRGB(gbase[i * 3], gbase[i * 3 + 1], gbase[i * 3 + 2]).lerp(ashBrown, sm(c * 2)).lerp(charcoal, sm(c * 2 - 1) * 0.92);
      gcol[i * 3] = tc.r; gcol[i * 3 + 1] = tc.g; gcol[i * 3 + 2] = tc.b;
    }
    gg.attributes.color.needsUpdate = true;
  }

  // ---------- orchard wall: rolled clay sausages; gate pillars and plank doors
  const wallM = clay(0xc99a68);
  const wallG = new THREE.CapsuleGeometry(0.36, 1.3, 4, 10).rotateZ(Math.PI / 2);
  const wallSegs = [];
  const run = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 1.55); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; wallSegs.push([x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, Math.atan2(-(z1 - z0), x1 - x0)]); } };
  run(-OX - 0.3, OZ1 + 0.1, -1.95, OZ1 + 0.1); run(1.95, OZ1 + 0.1, OX + 0.3, OZ1 + 0.1);
  run(-OX - 0.3, OZ0, OX + 0.3, OZ0); run(-OX - 0.3, OZ0, -OX - 0.3, OZ1 + 0.1); run(OX + 0.3, OZ0, OX + 0.3, OZ1 + 0.1);
  const wall = new THREE.InstancedMesh(wallG, wallM, wallSegs.length * 2);
  wall.castShadow = wall.receiveShadow = true;
  wallSegs.forEach(([x, z, a], i) => {
    for (let k = 0; k < 2; k++) {
      const s = 1 - k * 0.12;
      wall.setMatrixAt(i * 2 + k, fm.compose(tv.set(x + (k ? 0.4 * Math.cos(a) : 0), H(x, z) + 0.3 + k * 0.6, z), tq3.setFromEuler(te.set(0, a, (hash(x, z) - 0.5) * 0.08)), ts.set(s, s, s)));
    }
  });
  scene.add(wall);
  const pillarM = clay(0xd9ae7a);
  for (const s of [-1, 1]) {
    const pg = new THREE.Group(); pg.position.set(s * 1.7, 0, OZ1 + 0.1);
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 2.1, 12), pillarM); c1.position.y = 1.05; c1.castShadow = true; pg.add(c1);
    const c2 = new THREE.Mesh(blobGeo(0.4, 40 + s, 14, 0.05), pillarM); c2.position.y = 2.25; c2.castShadow = true; pg.add(c2);
    scene.add(pg);
  }
  const plankTex = canvasTex(256, 256, (g, w) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, w); for (let i = 1; i < 5; i++) { g.fillStyle = "#3a3a3a"; g.fillRect(i * w / 5 - 3, 0, 6, w); } g.fillStyle = "#606060"; g.fillRect(0, w * 0.2, w, 10); g.fillRect(0, w * 0.75, w, 10); });
  const doorM = new THREE.MeshStandardMaterial({ color: 0xa8703f, roughness: 0.82, bumpMap: plankTex, bumpScale: 3 });
  const doors = [-1, 1].map((s) => {
    const piv = new THREE.Group(); piv.position.set(s * 1.4, 0.15, OZ1 + 0.1);
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.55, 0.14), doorM); d.position.set(-s * 0.68, 0.8, 0); d.castShadow = d.receiveShadow = true; piv.add(d);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 14), clay(0x4a4040)); ring.position.set(-s * 1.2, 0.85, 0.09); piv.add(ring);
    scene.add(piv); return { piv, s };
  });
  function gateOpen(tq) {
    if (tq < K.s2 - 0.1) return 0;
    if (tq < K.s3 - 0.1) return 1;
    if (tq < K.s6) return 0;
    return ramp(tq, K.s6 + 0.15, K.s6 + 1.2);
  }

  // ---------- AUDIRA sign: letters pressed into a clay board by the gate
  const signTex = canvasTex(512, 200, (g, w, h) => {
    g.fillStyle = "#cf9560"; g.fillRect(0, 0, w, h);
    const R = mulberry(9); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${R() < 0.5 ? 90 : 250},${R() < 0.5 ? 60 : 200},40,.06)`; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 6, 0, 6.3); g.fill(); }
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 122px Arial, sans-serif";
    g.fillStyle = "#f0c08e"; g.fillText("AUDIRA", w / 2 + 4, h / 2 + 8);
    g.fillStyle = "#6e3f22"; g.fillText("AUDIRA", w / 2, h / 2 + 4);
    g.fillStyle = "#93593a"; g.fillText("AUDIRA", w / 2 + 2, h / 2 + 6);
  });
  const signBump = canvasTex(512, 200, (g, w, h) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle"; g.font = "900 122px Arial, sans-serif"; g.fillStyle = "#000"; g.fillText("AUDIRA", w / 2 + 2, h / 2 + 6); });
  const signEdge = clay(0xc08654);
  const signFace = new THREE.MeshStandardMaterial({ map: signTex, bumpMap: signBump, bumpScale: 4, roughness: 0.85 });
  const sign = new THREE.Group(); sign.position.set(-3.1, 0, 6.7); sign.rotation.y = 0.32; sign.scale.setScalar(0.78);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.74, 0.16), [signEdge, signEdge, signEdge, signEdge, signFace, signEdge]); board.position.y = 1.32; board.rotation.z = -0.03; board.castShadow = true; sign.add(board);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.4, 7), clay(0x8f6440)); p.position.set(s * 0.7, 0.62, -0.05); p.castShadow = true; sign.add(p); }
  scene.add(sign);

  // ---------- house, yard table, bushes
  const houseM = clay(0xe8cfa6), roofM = clay(0xd4b285);
  const house = new THREE.Group(); house.position.set(-13, 0, 12); scene.add(house);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), houseM); hb.position.y = 1.5; hb.castShadow = hb.receiveShadow = true; house.add(hb);
  const hr = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.32, 4.4), roofM); hr.position.y = 3.12; hr.castShadow = true; house.add(hr);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 12, 0, 6.3, 0, 1.6), roofM); dome.position.set(0.9, 3.25, -0.6); dome.castShadow = true; house.add(dome);
  const archTex = canvasTex(128, 192, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(0, h); g.lineTo(0, w / 2); g.arc(w / 2, w / 2, w / 2, Math.PI, 0); g.lineTo(w, h); g.fill(); });
  const winM = new THREE.MeshStandardMaterial({ color: 0x2a2026, emissive: 0xffa04a, emissiveIntensity: 0, alphaMap: archTex, transparent: true, roughness: 0.9 });
  for (const [x, y, w, h] of [[-1.55, 1.7, 0.75, 1.1], [1.55, 1.7, 0.75, 1.1], [0, 0.85, 1.0, 1.7]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), winM); m.position.set(x, y, 2.01); house.add(m); }
  const tableC = V(-12, 0, 17.6);
  const tbl = new THREE.Group(); tbl.position.copy(tableC); scene.add(tbl);
  const ttop = new THREE.Mesh(blobGeo(1, 41, 22, 0.02), clay(0xa8703f)); ttop.scale.set(0.95, 0.07, 0.95); ttop.position.y = 0.42; ttop.castShadow = ttop.receiveShadow = true; tbl.add(ttop);
  const tleg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 10), clay(0x8a5a36)); tleg.position.y = 0.2; tbl.add(tleg);
  const lampM = clay(0xb06a3a);
  const lamp = new THREE.Mesh(blobGeo(0.13, 42, 12, 0.05), lampM); lamp.scale.set(1.3, 0.6, 1); lamp.position.set(0.1, 0.55, 0.05); tbl.add(lamp);
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true });
  const flame = new THREE.Mesh(blobGeo(0.05, 43, 8, 0.05), flameM); flame.scale.set(1, 1.7, 1); flame.position.set(0.24, 0.68, 0.05); tbl.add(flame);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 8, 0, 6.3, 1.57, 1.57), clay(0x7a8a9a)); bowl.position.set(-0.3, 0.68, -0.15); bowl.rotation.x = Math.PI; tbl.add(bowl);
  for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(blobGeo(0.08, 44 + k, 8, 0.05), clay(fruitCols[k])); f.position.set(-0.3 + Math.cos(k * 1.3) * 0.1, 0.5 + 0.06 * (k % 2), -0.15 + Math.sin(k * 1.3) * 0.1); tbl.add(f); }
  // the father's empty place: a cushion, his folded white headcloth and his staff laid across it
  const cushion = new THREE.Mesh(blobGeo(0.42, 45, 14, 0.04), clay(0x8c4a5a)); cushion.scale.set(1, 0.28, 1); const cuA = -0.55;
  cushion.position.set(tableC.x + Math.cos(cuA) * 1.35, 0.1, tableC.z - Math.sin(cuA) * 1.35); cushion.castShadow = true; scene.add(cushion);
  const cloth = new THREE.Mesh(blobGeo(0.2, 46, 12, 0.05), clay(0xf4efe4)); cloth.scale.set(1.3, 0.35, 1); cloth.position.copy(cushion.position).add(V(0, 0.16, 0)); scene.add(cloth);
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.5, 6), clay(0x6e4628)); staff.rotation.set(0, 0.6, Math.PI / 2 - 0.08); staff.position.copy(cushion.position).add(V(0, 0.18, 0.15)); scene.add(staff);
  for (let i = 0; i < 26; i++) {
    let x, z;
    do { const a = R0() * 6.28, rr = 17 + R0() * 26; x = Math.sin(a) * rr; z = -6 + Math.cos(a) * rr; } while (inOrchard(x, z) || Math.hypot(x + 12.5, z - 14) < 6 || pathD(x, z) < 1.6 || (Math.abs(x) < 4 && z > 5 && z < 12));
    const b = new THREE.Mesh(blobGeo(1, 300 + i, 14, 0.1), clay([0x6aa444, 0x7fb34e, 0x5c943c][i % 3]));
    const s = 0.6 + R0() * 0.8; b.scale.set(s * 1.2, s * 0.85, s); b.position.set(x, H(x, z) + s * 0.4, z); b.castShadow = true; scene.add(b);
  }
  for (const [x, z] of [[-18.5, 8.5], [-19, 19.5], [10.5, 13.5]]) {
    const y = H(x, z);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 2.1, 9), clay(0x8a5a36)); tr.position.set(x, y + 1.05, z); tr.castShadow = true; scene.add(tr);
    for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(blobGeo(1, 320 + k, 16, 0.1), clay(0x7a9c52)); c.scale.setScalar(0.9 - k * 0.15); c.position.set(x + (k - 1) * 0.55, y + 2.4 + (k % 2) * 0.4, z + (k - 1) * 0.2); c.castShadow = true; scene.add(c); }
  }

  // ---------- faceless clay figures
  function figure(robe, headC, capC, sc = 1, opts = {}) {
    const G = new THREE.Group(), B = new THREE.Group(); G.add(B);
    const mr = clay(robe), mh = clay(headC), mc = clay(capC);
    const prof = [[0, 0], [0.4, 0.02], [0.37, 0.3], [0.29, 0.62], [0.27, 0.9], [0.31, 1.1], [0.2, 1.22], [0.09, 1.27], [0, 1.28]].map(([a, b]) => new THREE.Vector2(a, b));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), mr); body.castShadow = true; B.add(body);
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 6, 18).rotateX(Math.PI / 2), mc); sash.position.y = 0.66; B.add(sash);
    const Hd = new THREE.Group(); Hd.position.y = 1.25; B.add(Hd);
    const head = new THREE.Mesh(blobGeo(0.21, 50, 16, 0.03), mh); head.position.y = 0.2; head.castShadow = true; Hd.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.225, 16, 10, 0, 6.3, 0, opts.wrap ? 1.9 : 1.2), mc); cap.position.y = 0.21; Hd.add(cap);
    if (opts.wrap) { const tail = new THREE.Mesh(blobGeo(0.12, 51, 8, 0.05), mc); tail.scale.set(1.4, 1.6, 0.6); tail.position.set(0, 0.08, -0.18); Hd.add(tail); }
    const arm = (s) => {
      const piv = new THREE.Group(); piv.position.set(s * 0.3, 1.08, 0); B.add(piv);
      const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8), mr); a.position.y = -0.27; a.castShadow = true; piv.add(a);
      const h = new THREE.Mesh(blobGeo(0.08, 52, 8, 0.05), mh); h.position.y = -0.55; piv.add(h);
      return piv;
    };
    const aL = arm(-1), aR = arm(1);
    G.scale.setScalar(sc); scene.add(G);
    return { G, B, Hd, aL, aR, sc };
  }
  const BRO = [figure(0xc4623a, 0xe2b48a, 0x7a3a22), figure(0x7e8b3a, 0xd9a878, 0x4a5222), figure(0x4e6e8e, 0xe0b080, 0xd8ccb4, 1, { wrap: true })];
  const FATHER = figure(0xe8d9b8, 0xd6a87c, 0xfaf6ee, 0.98, { wrap: true });
  const fStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.5, 6), clay(0x6e4628)); fStaff.position.set(0, -0.2, 0.05); FATHER.aR.add(fStaff);
  const POOR = [figure(0x8c7b6b, 0xc89a70, 0x6a5c50), figure(0x6f6a60, 0xb88860, 0x9a8a74, 1, { wrap: true }), figure(0xa08a6e, 0xd0a478, 0x7a6a58, 0.74)];
  const BAS = [0, 1, 2].map((k) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.24, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xc89048, roughness: 0.85, bumpMap: plankTex, bumpScale: 2, side: THREE.DoubleSide }));
    b.castShadow = true; g.add(b);
    for (let q = 0; q < 6; q++) { const f = new THREE.Mesh(blobGeo(0.09, 60 + q + k * 6, 8, 0.05), clay(fruitCols[(q + k) % 5])); f.position.set(Math.cos(q * 1.05) * 0.13 * (q % 3 ? 1 : 0.2), 0.13 + (q % 2) * 0.05, Math.sin(q * 1.05) * 0.13 * (q % 3 ? 1 : 0.2)); g.add(f); }
    scene.add(g); return g;
  });

  function pose(f, o) {
    f.G.visible = o.vis !== false;
    if (!f.G.visible) return;
    const x = o.x, z = o.z;
    f.G.position.set(x, H(x, z) + (o.dy || 0), z);
    f.G.rotation.y = o.yaw || 0;
    f.B.rotation.x = o.lean || 0;
    f.B.rotation.z = o.roll || 0;
    f.B.scale.y = o.sy || 1;
    f.Hd.rotation.x = o.bow || 0;
    f.Hd.rotation.y = o.turn || 0;
    f.aL.rotation.set(o.aLx || 0, 0, o.aLz ?? 0.12);
    f.aR.rotation.set(o.aRx || 0, 0, -(o.aRz ?? 0.12));
  }
  const yawTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const boil = (tq, k) => { const s = Math.floor(tq * 12); return (hash(s * 0.37 + k, k * 1.7) - 0.5) * 0.025; };

  // ---------- birds (day only), on twos
  const birdM = clay(0x3e3a44);
  const birds = [0, 1, 2, 3].map((k) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(blobGeo(0.18, 70 + k, 8, 0.05), birdM); b.scale.set(0.8, 0.7, 1.6); g.add(b);
    const wL = new THREE.Mesh(blobGeo(0.2, 74, 8, 0.05).scale(2, 0.25, 0.9).translate(0.38, 0, 0), birdM), wR = wL.clone(); wR.scale.x = -1;
    g.add(wL); g.add(wR); scene.add(g); return { g, wL, wR, k };
  });

  // ---------- sprout of hope
  const sprout = new THREE.Group(); const SPx = 0.15, SPz = 4.3; sprout.position.set(SPx, H(SPx, SPz), SPz); scene.add(sprout);
  const mound = new THREE.Mesh(blobGeo(0.2, 80, 10, 0.06), clay(0x2a2422)); mound.scale.set(1.3, 0.35, 1.3); sprout.add(mound);
  const greenM = clay(0x6cc04a, { emissive: 0x2a7a1a, emissiveIntensity: 0.12 });
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.28, 4, 6), greenM); stem.position.y = 0.2; sprout.add(stem);
  const lf = [-1, 1].map((s) => { const m = new THREE.Mesh(blobGeo(0.11, 81, 10, 0.05).scale(1.5, 0.3, 0.8).translate(s * 0.14, 0, 0), greenM); m.position.y = 0.36; m.rotation.z = s * 0.35; sprout.add(m); return m; });
  const glowTex = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const sGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9cff7a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  sGlow.scale.setScalar(1.4); sGlow.position.y = 0.3; sprout.add(sGlow);

  // ---------- ash flakes drifting up from the charred clay
  const NA = 420, ash = pts(scene, NA, { color: 0x2b2826, size: 0.16, add: false, opacity: 0.85 });
  const aseed = []; for (let i = 0; i < NA; i++) { const x = (RO() - 0.5) * 2 * OX, z = OZ0 + RO() * (OZ1 - OZ0); aseed.push([x, z, RO(), RO(), thOf(x, z)]); }

  // ---------- camera: smooth glide (motion-control rig)
  const S8 = K.s8;
  const CAM = track([
    [0, 0, 9.4, 31.5, 0, 3.0, -7],
    [tMorning, 0.3, 9.0, 29.6, 0, 3.0, -7],
    [K.s2 - 0.2, 1.4, 8.4, 27.2, 0, 2.8, -7],
    [K.s2 + 2.2, -3.5, 12.5, 27.5, 0, 3.0, -8],
    [A("s2:Menurut") - 0.3, -1.5, 7.5, 21.5, 0.2, 1.8, -1],
    [A("s2:Ibnu"), 5.6, 3.1, 14.6, 0.6, 1.1, 6.9],
    [K.s3 - 0.3, 6.4, 2.7, 13.4, 0.7, 1.0, 6.9],
    [K.s3 + 0.6, -6.5, 3.2, 21.5, -11, 0.6, 16.4],
    [A("s3:Mereka"), -6.8, 3.4, 21.8, -11.8, 0.9, 17.2],
    [K.s4 - 0.3, -8.0, 2.9, 21.0, -12, 0.9, 17.3],
    [K.s4 + 0.8, -7.2, 3.6, 21.5, -13, 2.0, 13],
    [A("s4:bencana") + 0.2, -3.5, 8.8, 23.5, -0.5, 2.6, -6],
    [A("s4:hitam"), 0, 9.6, 22.5, 0, 2.6, -8],
    [K.s5 - 0.3, 1.6, 9.2, 20.5, 0, 2.6, -8.5],
    [K.s5 + 1.0, -6.0, 2.6, 22.5, -11.6, 1.0, 14.5],
    [A("s5:hari"), -2.6, 2.4, 17.8, -6.2, 1.0, 11.0],
    [K.s6 - 0.2, 3.4, 2.6, 15.4, -0.4, 1.1, 6.8],
    [K.s6 + 1.4, 0.5, 3.4, 13.0, 0, 0.2, 0],
    [A("s6:Bukan"), 0.3, 3.8, 14.0, 0, 0.4, -1],
    [A("s6:Yang") + 0.6, 7.2, 2.8, 13.8, 1.0, 1.0, 7.0],
    [K.s7 - 0.2, 7.4, 3.0, 14.6, 0.8, 0.8, 7.0],
    [A("s7:mengaku"), 6.2, 3.2, 14.6, 0.3, 0.6, 6.8],
    [tGrow - 0.6, 2.5, 3.0, 11.5, 0.2, 0.5, 5.0],
    [tGrow + 1.0, 0.1, 2.4, 8.8, 0.15, 0.4, 4.3],
    [tGrow + 3.5, 0.05, 2.05, 7.9, 0.15, 0.45, 4.2],
    [K.s8 - 0.2, 0.05, 2.0, 7.6, 0.15, 0.45, 4.2],
    [S8 + 3.2, 0.4, 2.5, 8.8, 0.15, 0.6, 4.5],
    [S8 + 6.2, 4.4, 5.8, 11.5, 0.2, 0.7, 5.0],
    [K.end, 3.0, 6.8, 17.5, 0, 1.6, 3.0],
    [K.dur, 3.2, 7.0, 18.5, 0, 1.6, 3.0],
  ]);

  return (t) => {
    const tq = Q(t), m = mood(t);
    // lights and sky
    hemi.color.copy(m.hs); hemi.groundColor.copy(m.hg); hemi.intensity = m.hi;
    key.color.copy(m.kc); key.intensity = m.ki;
    key.position.copy(kDir).multiplyScalar(70).add(V(0, 0, -2)); key.target.position.set(0, 0, -2);
    SU.uTop.value.copy(m.top); SU.uHor.value.copy(m.hor); SU.uStar.value = m.star;
    scene.fog.color.copy(m.hor); scene.fog.density = m.fog; r.toneMappingExposure = m.exp;
    moon.material.opacity = m.moon; moon.visible = m.moon > 0.02;
    sunB.material.opacity = m.sun; sunB.visible = m.sun > 0.02;
    const flick = 0.85 + 0.15 * Math.sin(tq * 23) * Math.sin(tq * 7.3);
    lanL.intensity = 7 * m.lan * flick; flame.visible = m.lan > 0.05; flameM.opacity = m.lan;
    winM.emissiveIntensity = 1.4 * m.win; winL.intensity = 5 * m.win;
    clouds.forEach((g) => { const u = g.userData, a = u.a + tq * u.sp; g.position.set(Math.sin(a) * u.rr, u.y, -Math.cos(a) * u.rr); g.rotation.y = -a; });

    // orchard charring (on twos)
    const p = P(tq);
    applyChar(p);

    // gate
    const go = gateOpen(tq);
    for (const d of doors) d.piv.rotation.y = -d.s * go * 1.45;   // both leaves swing inward (toward -z)

    // ---------- cast
    const fl = (q, a, b) => ramp(q, a, b);
    // father and the poor: only in the flashback (s2)
    const inS2 = t >= K.s2 && t < K.s3;
    const handing = (k) => fl(tq, HB[k] - 0.55, HB[k] - 0.1) * (1 - fl(tq, HB[k] + 0.25, HB[k] + 0.6));
    const anyHand = Math.max(handing(0), handing(1), handing(2));
    pose(FATHER, { vis: inS2, x: -0.3, z: 5.95, yaw: 0.15, lean: 0.24 + 0.12 * anyHand, bow: 0.28, sy: 0.97 + boil(tq, 1), aLx: -0.15 - 1.25 * anyHand, aLz: 0.1, aRx: -0.35, aRz: 0.08 });
    const PP3 = [[-0.55, 7.9, Math.PI + 0.1], [0.75, 8.25, Math.PI - 0.15], [1.85, 7.75, Math.PI - 0.45]];
    POOR.forEach((f, k) => {
      const got = fl(tq, HB[k] - 0.15, HB[k] + 0.35);
      const [x, z, yaw] = PP3[k];
      pose(f, { vis: inS2, x, z, yaw, lean: 0.12 + 0.06 * got, bow: 0.15, sy: 1 + boil(tq, 5 + k), aLx: -0.3 - 0.9 * got, aRx: -0.3 - 0.9 * got, aLz: 0.25, aRz: 0.25 });
    });
    BAS.forEach((b, k) => {
      b.visible = inS2;
      if (!inS2) return;
      const u1 = fl(tq, HB[k] - 0.55, HB[k] - 0.1), u2 = fl(tq, HB[k] + 0.05, HB[k] + 0.45);
      const stack = V(0.65 + k * 0.05, H(0.65, 5.2) + 0.12 + (2 - k) * 0.0, 5.0 - k * 0.55);
      const held = V(-0.2, 0.92, 6.55);
      const [px, pz] = PP3[k], pk = POOR[k].sc;
      const recv = V(px + 0.05, 0.62 * pk + 0.25, pz - 0.42 * pk);
      const pos = stack.clone().lerp(held, u1).lerp(recv, u2);
      pos.y += Math.sin(Math.PI * u2) * 0.25 + Math.sin(Math.PI * u1) * 0.15;
      b.position.copy(pos);
      const sq = 1 + 0.12 * Math.sin(Math.PI * u2);
      b.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    });

    // the three sons
    const cTab = tableC;
    BRO.forEach((f, k) => {
      const bo = boil(tq, 10 + k);
      if (t >= K.s2 && t < K.s3) {
        // picking among the vines, arms reaching up in turn
        const spots = [[-4.2, 0.2], [4.6, -2.4], [6.4, 0.25]];
        const [x, z] = spots[k], ph = Math.floor(tq * 3 + k) % 2;
        pose(f, { x, z, yaw: k === 1 ? 0.3 : Math.PI + 0.2, sy: 1 + bo, aRx: ph ? -2.5 : -1.9, aLx: ph ? -1.6 : -2.4, bow: -0.25 });
      } else if (t >= K.s3 && t < K.s4) {
        // seated on the ground round the low table
        const ang = [Math.PI, 4.4, 2.05][k];
        const x = cTab.x + Math.cos(ang) * 1.3, z = cTab.z - Math.sin(ang) * 1.3;
        const whisper = fl(tq, A("s3:anak-anaknya"), A("s3:sepakat") + 0.3);
        const oath = fl(tq, A("s3:bersumpah") - 0.1, A("s3:bersumpah") + 0.25) * (1 - fl(tq, A("s3:memetik") - 0.1, A("s3:memetik") + 0.25));
        const stack = fl(tq, A("s3:memetik"), A("s3:memetik") + 0.35) * (1 - fl(tq, A("s3:tanpa") + 0.6, A("s3:Allah") + 0.4));
        const sway = (Math.floor(tq * 6 + k * 2) % 2 ? 0.05 : -0.04) * whisper * (1 - oath);
        pose(f, { x, z, yaw: yawTo(x, z, cTab.x, cTab.z), dy: -0.02, sy: 0.6 + bo, lean: 0.12 + 0.3 * whisper + sway, bow: 0.2 * whisper, aLx: -0.9, aLz: 0.2, aRx: -0.9 - 1.75 * oath - 0.35 * stack, aRz: 0.2 - 0.12 * oath });
      } else if (t >= K.s5 && t < K.s6) {
        // creeping along the path, heads low, whispering
        const u = clamp01((tq - (K.s5 + 0.5)) / (A("s5:kebunmu") - K.s5)) * 0.93 - [0, 0.05, 0.12][k];
        const pp = PATH.getPointAt(clamp01(u)), pn = PATH.getPointAt(clamp01(u + 0.01));
        const step = Math.floor(tq * 6 + k) % 2;
        const side = [0, 0.45, -0.3][k];
        const yaw = Math.atan2(pn.x - pp.x, pn.z - pp.z);
        const x = pp.x + Math.cos(yaw) * side, z = pp.z - Math.sin(yaw) * side;
        const walking = u > 0 && u < 0.92;
        pose(f, { vis: u > -0.02, x, z, yaw, lean: 0.3, bow: 0.15, roll: walking ? (step ? 0.05 : -0.05) : 0, sy: (walking && step ? 0.97 : 1) + bo, dy: walking && step ? 0.04 : 0, aLx: walking ? (step ? -0.4 : 0.3) : -0.1, aRx: walking ? (step ? 0.3 : -0.4) : -0.1, turn: k === 0 ? 0.4 : k === 1 ? -0.4 : 0 });
      } else if (t >= K.s6) {
        // at the gate: open it, see, recoil; the wisest stands apart
        const recoil = fl(tq, A("s6:tersesat") - 0.1, A("s6:tersesat") + 0.3);
        const slump = fl(tq, A("s6:apa-apa"), A("s6:apa-apa") + 0.6);
        const kneel = fl(tq, A("s7:mengaku") - 0.1, A("s7:Mahasuci") + 0.1);
        const blame = t >= K.s7 ? fl(tq, A("s7:saling") - 0.1, A("s7:saling") + 0.2) * (1 - fl(tq, A("s7:mengaku") - 0.4, A("s7:mengaku"))) : 0;
        const push = fl(tq, K.s6, K.s6 + 0.4) * (1 - fl(tq, K.s6 + 1.0, K.s6 + 1.4));
        if (k < 2) {
          const s = k ? 1 : -1;
          const x = s * 0.72, z = 6.5 + 0.75 * recoil * (1 - kneel) + (1 - fl(tq, K.s6, K.s6 + 1.2)) * 1.4;
          const pointing = blame * (Math.floor(tq * 4 + k) % 2 ? 1 : 0.6);
          const yaw = Math.PI + (s * -0.55) * blame;
          pose(f, { x, z, yaw, lean: 0.2 * push - 0.18 * recoil * (1 - slump) + 0.25 * slump * (1 - kneel) + 0.5 * kneel, bow: 0.45 * slump + 0.25 * kneel, sy: 1 - 0.34 * kneel + bo,
            aLx: -1.3 * push - 2.3 * recoil * (1 - slump) * (1 - kneel), aLz: 0.12 + 0.3 * recoil * (1 - slump), aRx: -1.3 * push - 2.3 * recoil * (1 - slump) * (1 - kneel) - 1.4 * pointing, aRz: 0.12 + 0.3 * recoil * (1 - slump) });
        } else {
          const wise = fl(tq, A("s6:Yang"), A("s6:Yang") + 0.5);
          const speak = fl(tq, A("s6:bukankah") - 0.1, A("s6:bukankah") + 0.3) * (1 - fl(tq, K.s7 - 0.3, K.s7));
          const join = fl(tq, A("s7:mengaku") - 0.5, A("s7:Mahasuci") - 0.1);
          const x = 2.95 - 0.9 * join, z = 8.3 - 1.4 * join;
          const yaw = (1 - join) * (Math.PI + 0.9 - 0.55 * wise) + join * (Math.PI - 0.1);
          pose(f, { x, z, yaw, lean: 0.06 + 0.5 * kneel, bow: 0.1 + 0.25 * kneel, sy: 1 - 0.34 * kneel + bo, aRx: -1.2 * speak, aRz: 0.12, aLx: -0.15 });
        }
      } else pose(f, { vis: false });
    });

    // birds over the lush orchard (flashback and the final calm)
    const dayBirds = (t >= K.s2 && t < K.s3) || t >= S8;
    birds.forEach((b) => {
      b.g.visible = dayBirds;
      if (!dayBirds) return;
      const a = tq * 0.35 + b.k * 1.6, rr = 9 + b.k * 2.5;
      b.g.position.set(Math.sin(a) * rr, 11 + b.k * 1.2 + Math.sin(tq * 1.3 + b.k) * 0.6, -6 + Math.cos(a) * rr * 0.7);
      b.g.rotation.y = a + Math.PI / 2;
      const flap = Math.floor(tq * 12 + b.k) % 2 ? 0.55 : -0.35;
      b.wL.rotation.z = flap; b.wR.rotation.z = -flap;
    });

    // sprout
    const gr = t >= tGrow ? back(clamp01((tq - tGrow) / 1.6), 1.4) : 0;
    sprout.visible = gr > 0.001;
    stem.scale.set(1, Math.max(0.01, gr), 1); stem.position.y = 0.06 + 0.15 * gr;
    lf.forEach((m) => { m.scale.setScalar(Math.max(0.01, clamp01((gr - 0.3) / 0.7))); m.position.y = 0.12 + 0.24 * gr; });
    sGlow.material.opacity = 0.14 * clamp01(gr) * (0.85 + 0.15 * Math.sin(tq * 3));
    sproutL.intensity = 0.7 * clamp01(gr);

    // ash
    const ashOn = p > 0.02 && !(t >= K.s2 && t < K.s4) ? (t >= K.s7 ? 0.35 : 1) : 0;
    for (let i = 0; i < NA; i++) {
      const s = aseed[i], c = charAt(p, s[4]);
      if (ashOn === 0 || c < 0.3 || s[3] > ashOn) { ash.pos[i * 3 + 1] = -99; continue; }
      const life = (tq * (0.09 + s[2] * 0.08) + s[3]) % 1;
      ash.pos[i * 3] = s[0] + Math.sin(tq * 0.7 + s[2] * 20) * 0.6 * life;
      ash.pos[i * 3 + 1] = H(s[0], s[1]) + 0.3 + life * 5.5;
      ash.pos[i * 3 + 2] = s[1] + life * 0.8;
      const v = 0.16 + 0.1 * s[3]; ash.col[i * 3] = v; ash.col[i * 3 + 1] = v * 0.95; ash.col[i * 3 + 2] = v * 0.92;
    }
    ash.commit();

    // camera
    const cv = CAM(t);
    cam.position.set(cv[0], cv[1], cv[2]);
    cam.lookAt(cv[3], cv[4], cv[5]);
    comp.render();
  };
}
