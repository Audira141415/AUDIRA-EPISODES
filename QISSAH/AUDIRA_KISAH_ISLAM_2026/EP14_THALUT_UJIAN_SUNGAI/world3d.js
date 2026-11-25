// EP14 THALUT, UJIAN SUNGAI. HD2D: pixel-art sprite figures (flat billboards, nearest-filtered) standing in a 3D diorama
// with a tilt-shift depth of field, warm low sun and bloom.
// Depiction: no prophet appears (the unnamed prophet of 2:246 is a planted staff and a lantern; Dawud is never shown,
// only a sling-stone streak rising from among the group). No angels (the Tabut arrives on an ox cart, no bearers).
// Thalut is a plain faceless sprite who becomes the banner-bearer; Jalut is a towering dark armoured silhouette on the far ridge.
// World: the river runs along x near z=0. Camp on the near bank (+z), the plain and the ridge of Jalut's army at z ~ -42.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

// ---------- deterministic terrain
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;

export const WL = -0.55;                                             // water level
export const riverZ = (x) => 1.2 * Math.sin(x * 0.07 + 0.6) - 1.2 * Math.sin(0.6);
const ridgeZ = (x) => -42 + 2.5 * Math.sin(x * 0.09);
const roadX = (z) => 0.6 * Math.sin(z * 0.1);
export function H(x, z) {
  const dz = Math.abs(z - riverZ(x));
  const camp = sm((x + 16) / 3) * sm((18 - x) / 3) * sm((z - 7) / 3) * sm((36 - z) / 3);
  let h = (fbm(x * 0.06 + 3, z * 0.06) - 0.5) * 0.9 * sm((dz - 2) / 3) * (1 - 0.75 * camp);
  h -= 1.35 * (1 - sm((dz - 2.3) / 1.7));
  const rc = ridgeZ(x);
  h += 9.5 * Math.exp(-Math.pow((z - rc) / (z > rc ? 8 : 10), 2)) * (0.8 + 0.4 * fbm(x * 0.07 + 2, z * 0.07));
  h += 16 * sm((-z - 66) / 22) * (0.5 + 0.7 * fbm(x * 0.025, 4.1));
  h += 7 * sm((Math.abs(x) - 42) / 25) * (0.5 + fbm(x * 0.04, z * 0.04));
  h += 6 * sm((z - 46) / 20) * (0.5 + fbm(x * 0.04, 7));
  return h;
}

// ---------- pixel sprites: parts [x, y, w, h, color, noOutline]; a 1 px dark outline is drawn around the union
const OUT = "#21161c";
function pix(w, h, parts, outline = OUT) {
  const tx = canvasTex(w, h, (g) => {
    g.clearRect(0, 0, w, h);
    if (outline) { g.fillStyle = outline; for (const p of parts) if (!p[5]) g.fillRect(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2); }
    for (const p of parts) { g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); }
  });
  tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false; tx.anisotropy = 1;
  return tx;
}
const soldierParts = (P, dy = 0, spear = true, helm = true) => {
  const a = [
    [6, 18, 2, 6, P.pants], [9, 18, 2, 6, P.pants], [5, 23, 3, 2, P.boot], [9, 23, 3, 2, P.boot],
    [5, 10, 7, 9, P.tunic], [10, 10, 2, 9, P.tunicD], [5, 15, 7, 1, P.belt],
    [4, 11, 1, 6, P.tunicD], [12, 11, 1, 5, P.tunicD], [4, 17, 1, 1, P.skin], [12, 16, 1, 1, P.skin],
    [6, 4, 5, 6, P.skin], [9, 5, 2, 5, P.skinD],
  ];
  if (helm) a.push([5, 2, 7, 3, P.helm], [6, 2, 3, 1, P.helmL], [5, 5, 1, 3, P.helm], [11, 5, 1, 3, P.helm]);
  else a.push([5, 2, 7, 3, P.wrap], [6, 2, 3, 1, P.wrapL], [5, 5, 1, 2, P.wrap]);
  if (spear) a.push([13, 0, 1, 24, P.wood], [12, 0, 3, 2, P.metal]);
  if (P.shield) a.push([1, 11, 4, 7, P.shield], [2, 12, 2, 5, P.shieldL]);
  if (P.plume) a.push([7, 0, 3, 2, P.plume]);
  return a.map((p) => [p[0], p[1] + dy, p[2], p[3], p[4], p[5]]);
};
const kneelParts = (P) => [
  [4, 21, 9, 3, P.pants], [3, 23, 11, 2, P.boot], [1, 24, 14, 1, P.wood],
  [5, 14, 7, 8, P.tunic], [10, 14, 2, 8, P.tunicD], [5, 18, 7, 1, P.belt],
  [4, 16, 1, 6, P.tunicD], [12, 16, 1, 6, P.tunicD], [4, 22, 2, 2, P.skin], [11, 22, 2, 2, P.skin],
  [6, 10, 5, 5, P.skin], [9, 11, 2, 4, P.skinD], [5, 9, 7, 3, P.helm], [6, 9, 3, 1, P.helmL],
];
const PAL_A = { pants: "#5b4a3a", boot: "#3a2a22", tunic: "#b4583a", tunicD: "#8a3f2c", belt: "#e0b45a", skin: "#d9a477", skinD: "#b98260", helm: "#9aa3a8", helmL: "#cdd5d9", wood: "#8a6238", metal: "#c4ccd2" };
const PAL_B = { ...PAL_A, tunic: "#4f7a8c", tunicD: "#3a5a6a", belt: "#d9c38a", shield: "#a9793e", shieldL: "#d8a65a" };
const PAL_E = { pants: "#1d1a22", boot: "#120f15", tunic: "#2c2731", tunicD: "#1f1b24", belt: "#4a2a2a", skin: "#2a2430", skinD: "#201b25", helm: "#3b3442", helmL: "#5d5266", wood: "#3a2e2a", metal: "#8c8494", shield: "#2a2028", shieldL: "#5a2a2c", plume: "#6a2224" };
const PAL_T = { ...PAL_A, tunic: "#d9c9a3", tunicD: "#b3a27e", belt: "#9a8058", wrap: "#efe4c8", wrapL: "#ffffff" };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xf0c890, fog: 0.0085, exp: 1.05, bloom: [0.5, 0.5, 0.92], shadow: true });
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1414);
  const C = (h) => new THREE.Color(h);

  // ---------- timing
  const t1Min = A("s1:minum"), t1No = A("s1:tidak"), t1Few = A("s1:sedikit");
  const tGod = A("s2:Allah"), tThalut = A("s2:Thalut"), tProtes = A("s2:protes"), tJawab = A("s2:Jawab"), tIlmu = A("s2:ilmu"), tFisik = A("s2:fisik");
  const tTabut = A("s3:Tabut"), tCalm = A("s3:ketenangan"), tRelic = A("s3:peninggalan");
  const tRiver4 = A("s4:sungai"), tCup0 = A("s4:menciduk"), tCup1 = A("s4:tangan");
  const tDrink = A("s5:Hampir"), tHold = A("s5:menahan"), tCross = A("s5:menyeberang"), tSee = A("s5:Melihat"), tWeak = A("s5:kami");
  const tSabar = A("s6:sabar");
  const tDoa = A("s7:berdoa"), tStep = A("s7:kokohkan"), tLaunch = A("s7:Dawud"), tHit = A("s7:mengalahkan") + 0.25, tKing = A("s7:kerajaan"), tHik = A("s7:hikmah");
  const tSip = A("s8:seteguk"), tKisah = A("s8:Kisah");

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x5a4630, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd9a0, 2.4);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 260 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  sun.target.position.set(0, 0, -6); scene.add(sun); scene.add(sun.target);
  const fireL = new THREE.PointLight(0xff9a40, 0, 16, 1.6); scene.add(fireL);
  const lampL = new THREE.PointLight(0xffd27a, 0, 12, 1.6); scene.add(lampL);
  const tabL = new THREE.PointLight(0xffd36a, 0, 18, 1.5); scene.add(tabL);

  // ---------- moods
  const ST = {
    HOOK: { top: C(0x5d7fb8), hor: C(0xf6cf96), sc: C(0xffd49a), si: 2.5, az: 35, el: 22, hs: C(0xa9c6f0), hi: 0.9, tint: C(0xfff0dc), fog: 0.0085, exp: 1.05 },
    CAMP: { top: C(0x4b5f9a), hor: C(0xf0b27a), sc: C(0xffb978), si: 2.1, az: 20, el: 16, hs: C(0x9cb2e0), hi: 0.75, tint: C(0xffe2c4), fog: 0.009, exp: 1.08 },
    GOLD: { top: C(0x5a6fa6), hor: C(0xf8c88a), sc: C(0xffcb88), si: 2.3, az: 40, el: 20, hs: C(0xa8c0ea), hi: 0.85, tint: C(0xffeccf), fog: 0.0085, exp: 1.05 },
    NOON: { top: C(0x4f86c8), hor: C(0xd8e6ee), sc: C(0xfff1dc), si: 2.8, az: 55, el: 48, hs: C(0xbcd6ff), hi: 1.0, tint: C(0xffffff), fog: 0.0075, exp: 1.0 },
    OMEN: { top: C(0x3f4766), hor: C(0xb8968a), sc: C(0xe0b494), si: 1.6, az: 200, el: 24, hs: C(0x8a96b8), hi: 0.8, tint: C(0xe6ddd8), fog: 0.0072, exp: 1.04 },
    STAND: { top: C(0x495487), hor: C(0xf0a874), sc: C(0xffb880), si: 2.0, az: 200, el: 14, hs: C(0x98a6d0), hi: 0.8, tint: C(0xffe0c4), fog: 0.0068, exp: 1.06 },
    DAWN: { top: C(0x5b6ea8), hor: C(0xffc98a), sc: C(0xffd29a), si: 2.6, az: 190, el: 22, hs: C(0xb0c4ee), hi: 0.95, tint: C(0xfff0dc), fog: 0.0065, exp: 1.06 },
    SUNSET: { top: C(0x3b3f7c), hor: C(0xff9e62), sc: C(0xff9a5a), si: 2.1, az: 25, el: 9, hs: C(0x8f8fc8), hi: 0.75, tint: C(0xffd8b8), fog: 0.009, exp: 1.08 },
  };
  const MOOD = [[0, "HOOK"], [K.s2 - 0.03, "HOOK"], [K.s2, "CAMP"], [K.s3 - 0.4, "CAMP"], [K.s3 + 1, "GOLD"], [K.s4, "GOLD"], [K.s4 + 2, "NOON"],
    [tSee - 0.2, "NOON"], [tSee + 1.4, "OMEN"], [K.s6, "OMEN"], [K.s6 + 3, "STAND"], [tDoa, "STAND"], [tHit, "DAWN"], [K.s8 - 0.03, "DAWN"], [K.s8, "SUNSET"], [K.dur, "SUNSET"]];
  const M = { top: new THREE.Color(), hor: new THREE.Color(), sc: new THREE.Color(), hs: new THREE.Color(), tint: new THREE.Color() };
  const sunDir = new THREE.Vector3();
  function mood(t) {
    let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++;
    const a = ST[MOOD[i][1]], b = ST[MOOD[i + 1][1]];
    const u = sm((t - MOOD[i][0]) / Math.max(0.001, MOOD[i + 1][0] - MOOD[i][0]));
    for (const k of ["top", "hor", "sc", "hs", "tint"]) M[k].copy(a[k]).lerp(b[k], u);
    for (const k of ["si", "az", "el", "hi", "fog", "exp"]) M[k] = a[k] + (b[k] - a[k]) * u;
    const az = M.az * Math.PI / 180, el = M.el * Math.PI / 180;
    sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    return M;
  }

  // ---------- sky dome (gradient + soft sun glow + pixel cloud bands)
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uT: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uSun,uSunC;uniform float uT;varying vec3 vD;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 d=normalize(vD);float e=floor(d.y*90.)/90.;
 vec3 c=mix(uHor,uTop,smoothstep(-.02,.42,e));
 float g=max(dot(d,uSun),0.);c+=uSunC*(pow(g,8.)*.35+pow(g,60.)*.4);
 vec2 q=floor(vec2(atan(d.z,d.x)*60.+uT*.4,e*70.));
 float cl=step(.78,hs(vec2(floor(q.x/7.),q.y)))*smoothstep(.04,.12,e)*smoothstep(.32,.16,e);
 c=mix(c,mix(uHor,vec3(1.),.55),cl*.55);
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // ---------- terrain
  const X0 = -95, X1 = 95, Z0 = -115, Z1 = 75, NX = 230, NZ = 230;
  const tg = new THREE.BufferGeometry();
  const tp = new Float32Array((NX + 1) * (NZ + 1) * 3), tc = new Float32Array((NX + 1) * (NZ + 1) * 3), tu = new Float32Array((NX + 1) * (NZ + 1) * 2), ti = [];
  const grass = C(0x76a03e), grass2 = C(0x5d8a34), dry = C(0xb3a253), dirt = C(0xb08754), sand = C(0xd6bb80), rock = C(0x8a7a66), mudC = C(0x6e5a3e), tmp = new THREE.Color();
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const k = j * (NX + 1) + i, x = X0 + (X1 - X0) * i / NX, z = Z0 + (Z1 - Z0) * j / NZ, h = H(x, z);
    tp[k * 3] = x; tp[k * 3 + 1] = h; tp[k * 3 + 2] = z; tu[k * 2] = x / 4; tu[k * 2 + 1] = z / 4;
    const dz = Math.abs(z - riverZ(x));
    const sl = Math.min(1, (Math.abs(H(x + 0.5, z) - H(x - 0.5, z)) + Math.abs(H(x, z + 0.5) - H(x, z - 0.5))) * 0.7);
    tmp.copy(grass).lerp(grass2, sm((fbm(x * 0.15, z * 0.15) - 0.45) * 4));
    tmp.lerp(dry, sm((-z - 22) / 14) * 0.85);
    tmp.lerp(rock, sl * 0.8);
    const road = (z > -36 && z < 36 ? sm(1 - Math.abs(x - roadX(z)) / 2.2) : 0) + (x > 0 && x < 80 ? sm(1 - Math.abs(z - 19) / 1.8) : 0);
    tmp.lerp(dirt, Math.min(1, road) * 0.9);
    tmp.lerp(dirt, sm(1 - Math.hypot(x + 4, (z - 16.5) * 1.1) / 4.2) * 0.7);
    tmp.lerp(sand, (1 - sm((dz - 3.2) / 1.4)) * 0.9);
    tmp.lerp(mudC, 1 - sm((dz - 2.4) / 0.8));
    tc[k * 3] = tmp.r; tc[k * 3 + 1] = tmp.g; tc[k * 3 + 2] = tmp.b;
    if (i < NX && j < NZ) { const a = k, b = k + 1, c = k + NX + 1, d = k + NX + 2; ti.push(a, c, b, b, c, d); }
  }
  tg.setAttribute("position", new THREE.BufferAttribute(tp, 3));
  tg.setAttribute("color", new THREE.BufferAttribute(tc, 3));
  tg.setAttribute("uv", new THREE.BufferAttribute(tu, 2));
  tg.setIndex(ti); tg.computeVertexNormals();
  const grassTex = canvasTex(32, 32, (g) => { const R = mulberry(7); for (let y = 0; y < 32; y += 2) for (let x = 0; x < 32; x += 2) { const v = 205 + Math.floor(R() * 50); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 2, 2); } }, [1, 1]);
  grassTex.magFilter = THREE.NearestFilter; grassTex.minFilter = THREE.NearestMipmapLinearFilter;
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, map: grassTex, roughness: 1 }));
  terrain.receiveShadow = true; scene.add(terrain);

  // ---------- river water: pixel-quantised flow stripes
  const WU = { uT: { value: 0 }, uSun: { value: new THREE.Color() }, uHor: { value: new THREE.Color() } };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(190, 22, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: WU, transparent: true, depthWrite: false,
    vertexShader: `varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader: `uniform float uT;uniform vec3 uSun,uHor;varying vec3 vW;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 q=floor(vW.xz*5.)/5.;
 float rz=1.2*sin(q.x*.07+.6)-1.2*sin(.6);float dz=abs(q.y-rz);
 vec3 deep=vec3(.12,.42,.55),shal=vec3(.36,.72,.74);
 vec3 c=mix(deep,shal,smoothstep(1.2,3.,dz));
 float s=fract(q.x*.18-uT*.55+sin(q.y*1.7+q.x*.05)*.35);
 c+=vec3(.75,.9,1.)*step(.9,s)*step(.5,hs(floor(q*vec2(.5,2.))))*.35;
 c=mix(c,c*uSun*1.25,.45)+uHor*.08;
 float foam=step(2.85,dz)*step(.35,hs(q+floor(uT*3.)));
 c=mix(c,vec3(1.),foam*.55);
 gl_FragColor=vec4(c,.86);}`,
  }));
  water.position.set(0, WL, 0); water.renderOrder = 2; scene.add(water);

  // ---------- sprite groups (instanced billboards + blob shadows)
  const BLOB = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 2, 16, 16, 16); gr.addColorStop(0, "rgba(0,0,0,.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  const fm = new THREE.Matrix4(), tv = new THREE.Vector3(), tq = new THREE.Quaternion(), tq2 = new THREE.Quaternion(), ts = new THREE.Vector3(), XA = new THREE.Vector3(1, 0, 0), YA = new THREE.Vector3(0, 1, 0);
  const groups = [];
  function group(tex, wpx, hpx, n, sc = 0.07, blobK = 0.75) {
    const W = wpx * sc, Hh = hpx * sc;
    const geo = new THREE.PlaneGeometry(W, Hh); geo.translate(0, Hh / 2, 0);
    const mat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
    const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false;
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
    scene.add(m);
    const bgeo = new THREE.PlaneGeometry(1, 1); bgeo.rotateX(-Math.PI / 2);
    const b = blobK ? new THREE.InstancedMesh(bgeo, new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), n) : null;
    if (b) { b.frustumCulled = false; scene.add(b); }
    const G = {
      m, b, n, W,
      set(i, x, y, z, s = 1, tilt = 0, ground = null) {
        const yaw = Math.atan2(cam.position.x - x, cam.position.z - z);
        tq.setFromAxisAngle(YA, yaw); if (tilt) { tq2.setFromAxisAngle(XA, tilt); tq.multiply(tq2); }
        fm.compose(tv.set(x, y, z), tq, ts.setScalar(Math.max(1e-4, s))); m.setMatrixAt(i, fm);
        if (b) { const gy = ground ?? Math.max(H(x, z), WL) + 0.03; fm.compose(tv.set(x, gy, z), tq.identity(), ts.set(W * blobK * s, 1, W * blobK * 0.55 * s)); b.setMatrixAt(i, fm); }
      },
      hide(i) { fm.compose(tv.set(0, -999, 0), tq.identity(), ts.setScalar(1e-4)); m.setMatrixAt(i, fm); if (b) b.setMatrixAt(i, fm); },
      col(i, c) { m.instanceColor.setXYZ(i, c[0], c[1], c[2]); },
    };
    groups.push(G);
    return G;
  }
  const SC = 0.07;
  const texA = pix(16, 26, soldierParts(PAL_A)), texB = pix(16, 26, soldierParts(PAL_B));
  const texKA = pix(16, 26, kneelParts(PAL_A)), texKB = pix(16, 26, kneelParts(PAL_B));
  const texE = pix(16, 26, soldierParts(PAL_E), "#0c0a0f");
  const ELD = { robe: "#e8dcc2", robeD: "#b9aa8c", hood: "#d6c7a6", shadow: "#5a4636", sash: "#c9a24e" };
  const texEl = pix(16, 26, [[5, 8, 7, 17, ELD.robe], [10, 8, 2, 17, ELD.robeD], [4, 10, 1, 10, ELD.robeD], [12, 10, 1, 10, ELD.robeD], [4, 24, 9, 1, ELD.robeD],
    [5, 2, 7, 8, ELD.hood], [6, 4, 5, 5, ELD.shadow], [9, 4, 2, 5, "#4a382c"], [5, 14, 7, 1, ELD.sash]]);
  const tPlain = soldierParts(PAL_T, 14, false, false);
  const texT0 = pix(20, 40, tPlain);
  const texT1 = pix(20, 40, [...tPlain, [14, 2, 1, 37, "#7a5430"], [13, 0, 3, 3, "#f2c14e"], [15, 3, 5, 9, "#2f6f7a"], [15, 3, 5, 1, "#f2c14e"], [15, 11, 5, 1, "#f2c14e"], [17, 6, 2, 3, "#f2c14e"], [12, 30, 2, 1, PAL_T.skin]]);
  const JL = { a: "#241d28", b: "#2f2734", c: "#1a151d", rim: "#a0684a", crest: "#6a2224" };
  const texJ = pix(24, 48, [
    [7, 32, 4, 13, JL.a], [13, 32, 4, 13, JL.a], [6, 44, 5, 3, JL.c], [13, 44, 5, 3, JL.c],
    [5, 16, 14, 17, JL.b], [6, 30, 12, 4, JL.c], [3, 15, 5, 4, JL.a], [16, 15, 5, 4, JL.a], [3, 19, 3, 12, JL.a], [18, 19, 3, 12, JL.a],
    [8, 4, 8, 12, JL.a], [9, 9, 6, 1, "#0a080c"], [11, 0, 2, 5, JL.crest], [10, 1, 4, 2, JL.crest],
    [18, 16, 1, 16, JL.rim, 1], [17, 33, 1, 11, JL.rim, 1], [15, 5, 1, 10, JL.rim, 1], [20, 15, 1, 3, JL.rim, 1],
    [21, 0, 1, 46, "#3a2e2a"], [20, 0, 3, 3, "#8c8494"], [0, 19, 6, 13, "#2a2028"], [1, 20, 4, 11, "#3a2a30"]], "#08060a");
  const OX = { a: "#8a5a36", b: "#6a4428", h: "#efe2c2" };
  const texOx = pix(26, 16, [[6, 4, 16, 7, OX.a], [6, 9, 16, 2, OX.b], [7, 11, 2, 4, OX.b], [11, 11, 2, 4, OX.b], [16, 11, 2, 4, OX.b], [19, 11, 2, 4, OX.b],
    [1, 3, 6, 5, OX.a], [1, 6, 2, 2, OX.b], [2, 1, 1, 2, OX.h], [5, 1, 1, 2, OX.h], [22, 5, 1, 5, OX.b], [8, 3, 5, 1, "#a8744a"]]);
  const TR = { g: "#4f8a3a", l: "#7cb24a", d: "#3a6a2e", t: "#6a4a2c" };
  const texTree = pix(20, 28, [[9, 19, 3, 8, TR.t], [4, 6, 12, 13, TR.g], [2, 9, 16, 8, TR.g], [6, 3, 8, 4, TR.g], [6, 5, 5, 3, TR.l], [4, 9, 3, 3, TR.l], [10, 13, 7, 4, TR.d], [8, 17, 6, 2, TR.d]], "#26402a");
  const texCrown = pix(12, 10, [[1, 3, 10, 6, "#f2c14e"], [1, 1, 2, 3, "#f2c14e"], [5, 0, 2, 4, "#f2c14e"], [9, 1, 2, 3, "#f2c14e"], [1, 7, 10, 2, "#c98a2a"], [5, 4, 2, 2, "#d8463a"], [2, 4, 1, 1, "#fff2b0"]]);
  const texScroll = pix(14, 10, [[2, 1, 10, 8, "#f3e2b4"], [0, 0, 3, 10, "#d6b878"], [11, 0, 3, 10, "#d6b878"], [4, 3, 6, 1, "#7a5a3a"], [4, 5, 6, 1, "#7a5a3a"], [4, 7, 4, 1, "#7a5a3a"]]);
  const texArm = pix(12, 12, [[0, 7, 7, 4, "#d9a477"], [2, 5, 4, 3, "#e8b88a"], [6, 2, 4, 8, "#d9a477"], [5, 0, 5, 3, "#c99467"], [1, 10, 6, 1, "#b98260"]]);
  const bub = (glyph) => pix(12, 12, [[1, 1, 10, 8, "#fff8e8"], [4, 9, 2, 2, "#fff8e8"], ...glyph]);
  const texQ = bub([[4, 2, 4, 1, "#21161c", 1], [7, 3, 1, 2, "#21161c", 1], [5, 5, 2, 1, "#21161c", 1], [5, 7, 2, 1, "#21161c", 1]]);
  const texDots = bub([[3, 5, 1, 1, "#21161c", 1], [5, 5, 1, 1, "#21161c", 1], [7, 5, 1, 1, "#21161c", 1]]);
  const texMark = pix(8, 7, [[1, 0, 6, 2, "#f2c14e"], [2, 2, 4, 2, "#f2c14e"], [3, 4, 2, 2, "#f2c14e"], [2, 0, 2, 1, "#fff2b0"]]);

  const NA = 64, CH = [0, 9, 13, 22, 30, 37, 45, 51, 60], isCh = new Array(NA).fill(-1);
  CH.forEach((v, c) => { isCh[v] = c; });
  const gA = group(texA, 16, 26, NA), gB = group(texB, 16, 26, NA), gKA = group(texKA, 16, 26, NA, SC, 0), gKB = group(texKB, 16, 26, NA, SC, 0);
  const gE = group(texE, 16, 26, 150, SC * 1.12), gEl = group(texEl, 16, 26, 7);
  const gT0 = group(texT0, 20, 40, 1), gT1 = group(texT1, 20, 40, 1);
  const gJ = group(texJ, 24, 48, 1, SC * 2.0, 0.6);
  const gOx = group(texOx, 26, 16, 2, SC * 1.1);
  const NTREE = 150, gTree = group(texTree, 20, 28, NTREE, SC * 1.7, 0.6);
  const gCrown = group(texCrown, 12, 10, 2, 0.07, 0), gScroll = group(texScroll, 14, 10, 2, 0.07, 0), gArm = group(texArm, 12, 12, 1, 0.07, 0);
  const gQ = group(texQ, 12, 12, 4, 0.06, 0), gDots = group(texDots, 12, 12, 4, 0.06, 0), gMark = group(texMark, 8, 7, 10, 0.06, 0);
  for (const g of [gCrown, gScroll, gArm, gMark]) { g.m.material.color.setRGB(1.6, 1.5, 1.3); }

  // trees: fixed, away from river, roads, camp and the ridge army
  const TREES = [];
  while (TREES.length < NTREE) {
    const x = (rnd() - 0.5) * 120, z = -75 + rnd() * 140;
    if (Math.abs(z - riverZ(x)) < 5.5) continue;
    if (z > -40 && z < 40 && Math.abs(x - roadX(z)) < 4) continue;
    if (x > -2 && Math.abs(z - 19) < 3.5) continue;
    if (x > -17 && x < 19 && z > 6.5 && z < 37) continue;
    if (z < -30 && z > -50 && Math.abs(x) < 25) continue;
    if (z < -3 && z > -12 && Math.abs(x) < 8) continue;
    TREES.push([x, z, 0.8 + rnd() * 0.5]);
  }

  // ---------- camp: tents, AUDIRA banner, council fire, the staff and lantern
  const pixTex = (w, h, f, rep) => { const t = canvasTex(w, h, f, rep); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
  const stripes = (a, b) => pixTex(16, 16, (g) => { g.fillStyle = a; g.fillRect(0, 0, 16, 16); g.fillStyle = b; for (let x = 0; x < 16; x += 8) g.fillRect(x, 0, 4, 16); g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(0, 14, 16, 2); }, [1, 1]);
  const tentMat1 = new THREE.MeshStandardMaterial({ map: stripes("#efe2c4", "#b4583a"), roughness: 0.95 });
  const tentMat2 = new THREE.MeshStandardMaterial({ map: stripes("#e6d6b0", "#4f7a8c"), roughness: 0.95 });
  const prism = (w, h, d, mat, x, z, ry = 0) => {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
    const m = new THREE.Mesh(g, mat); m.position.set(x, H(x, z) - 0.05, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; scene.add(m); return m;
  };
  const cone = (rr, h, mat, x, z) => { const m = new THREE.Mesh(new THREE.ConeGeometry(rr, h, 4), mat); m.rotation.y = Math.PI / 4; m.position.set(x, H(x, z) + h / 2 - 0.05, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  const MAINT = { x: -5.5, z: 10.0 };
  prism(6, 4.2, 5, tentMat1, MAINT.x, MAINT.z);
  cone(2.2, 3.2, tentMat2, -12, 20.5); cone(2.0, 3.0, tentMat1, -11.5, 27); cone(2.1, 3.1, tentMat2, -13, 33);
  cone(2.2, 3.2, tentMat1, 17.5, 25); cone(2.0, 3.0, tentMat2, 16, 31.5); cone(2.0, 3.0, tentMat1, 8, 37);
  prism(5, 3.6, 4, tentMat2, 21, 17, Math.PI / 2);
  const woodM = new THREE.MeshStandardMaterial({ color: 0x7a5430, roughness: 0.9 });
  // AUDIRA banner in pixel letters hung on two poles in front of the main tent
  const FONT = { A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"], U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."], I: ["###", ".#.", ".#.", ".#.", ".#.", ".#.", "###"], R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"] };
  const banTex = pixTex(40, 16, (g) => {
    g.fillStyle = "#2f6f7a"; g.fillRect(0, 0, 40, 13); g.fillStyle = "#f2c14e"; g.fillRect(0, 0, 40, 1); g.fillRect(0, 12, 40, 1);
    for (let x = 1; x < 40; x += 3) g.fillRect(x, 13, 1, 3);
    let cx = 4;
    for (const ch of "AUDIRA") { const gl = FONT[ch]; for (let y = 0; y < 7; y++) for (let x = 0; x < gl[y].length; x++) if (gl[y][x] === "#") { g.fillStyle = "#16343a"; g.fillRect(cx + x + 1, 3 + y + 1, 1, 1); g.fillStyle = "#ffd76a"; g.fillRect(cx + x, 3 + y, 1, 1); } cx += gl[0].length + 1; }
  });
  const bannerY = H(MAINT.x, MAINT.z + 3.2);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.44), new THREE.MeshStandardMaterial({ map: banTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, emissive: 0x332410, emissiveIntensity: 0.4 }));
  banner.position.set(MAINT.x, bannerY + 2.5, MAINT.z + 3.2); banner.castShadow = true; scene.add(banner);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 3.6, 6), woodM); p.position.set(MAINT.x + s * 1.9, bannerY + 1.8, MAINT.z + 3.2); p.castShadow = true; scene.add(p); }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.08, 0.08), woodM); bar.position.set(MAINT.x, bannerY + 3.25, MAINT.z + 3.2); scene.add(bar);
  // council: fire in the middle, elders around, the prophet's place marked only by a planted staff and a lantern
  const CC = { x: -4, z: 16.5 };
  for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.16), woodM); l.position.set(CC.x, H(CC.x, CC.z) + 0.1, CC.z); l.rotation.y = k * Math.PI / 4; scene.add(l); }
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.0, 8).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: stripes("#8a3f2c", "#c9a24e"), roughness: 1 }));
  rug.position.set(CC.x, H(CC.x, CC.z) + 0.04, CC.z); rug.receiveShadow = true; scene.add(rug);
  const STAFF = { x: CC.x - 2.6, z: CC.z + 0.4 };
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.5, 6), woodM); staff.position.set(STAFF.x, H(STAFF.x, STAFF.z) + 1.25, STAFF.z); staff.rotation.z = 0.06; staff.castShadow = true; scene.add(staff);
  const lampM = new THREE.MeshStandardMaterial({ color: 0x5a4020, emissive: 0xffc860, emissiveIntensity: 2.2 });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.28), lampM); lamp.position.set(STAFF.x + 0.3, H(STAFF.x, STAFF.z) + 0.2, STAFF.z + 0.15); scene.add(lamp);
  lampL.position.set(lamp.position.x, lamp.position.y + 0.6, lamp.position.z);
  const glowTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(0.3, "rgba(255,210,120,.5)"); gr.addColorStop(1, "rgba(255,180,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const glow = (s, op) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op })); sp.scale.setScalar(s); scene.add(sp); return sp; };
  const lampG = glow(2.2, 0.8); lampG.position.copy(lamp.position);
  const ELDERS = [];
  const ELDC = [[0.95, 0.9, 0.82], [0.85, 0.92, 0.88], [0.98, 0.86, 0.74], [0.82, 0.86, 0.98], [0.94, 0.94, 0.94], [0.9, 0.8, 0.86], [0.96, 0.92, 0.8]];
  for (let k = 0; k < 7; k++) { const a = -2.5 + k * 0.62; ELDERS.push([CC.x + Math.cos(a) * 2.4 * 1.05, CC.z + Math.sin(a) * 2.0 - 0.2]); gEl.col(k, ELDC[k]); }
  const THALUT0 = { x: CC.x + 3.2, z: CC.z + 1.3 };

  // ---------- Tabut on an ox cart (no bearers)
  const cart = new THREE.Group(); scene.add(cart);
  const plank = new THREE.MeshStandardMaterial({ map: stripes("#8a6238", "#7a5430"), roughness: 0.95 });
  const bed = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 1.8), plank); bed.position.y = 0.85; bed.castShadow = true; cart.add(bed);
  const wheels = [];
  for (const [wx, wz] of [[-0.9, 1.0], [0.9, 1.0], [-0.9, -1.0], [0.9, -1.0]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 8), woodM); w.rotation.x = Math.PI / 2; const piv = new THREE.Group(); piv.position.set(wx, 0.55, wz); piv.add(w); cart.add(piv); wheels.push(piv);
  }
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.1), woodM); shaft.position.set(-2.6, 0.75, 0); cart.add(shaft);
  const ornTex = pixTex(32, 16, (g) => {
    g.fillStyle = "#e0a93a"; g.fillRect(0, 0, 32, 16); g.fillStyle = "#ffe08a"; g.fillRect(0, 0, 32, 2); g.fillRect(0, 14, 32, 2); g.fillRect(0, 0, 2, 16); g.fillRect(30, 0, 2, 16);
    g.fillStyle = "#a8701e"; for (let x = 4; x < 30; x += 6) { g.fillRect(x, 5, 3, 1); g.fillRect(x + 1, 4, 1, 3); g.fillRect(x, 10, 3, 1); g.fillRect(x + 1, 9, 1, 3); }
    g.fillStyle = "#fff4c0"; g.fillRect(15, 7, 2, 2);
  });
  const goldM = new THREE.MeshStandardMaterial({ map: ornTex, metalness: 0.6, roughness: 0.35, emissive: 0xffb840, emissiveMap: ornTex, emissiveIntensity: 0.5 });
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 1.05), goldM); chest.position.y = 1.5; chest.castShadow = true; cart.add(chest);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.2, 1.17), goldM); lid.position.y = 2.06; lid.castShadow = true; cart.add(lid);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 6), goldM); p.rotation.z = Math.PI / 2; p.position.set(0, 1.25, s * 0.62); cart.add(p); }
  const tabG = glow(4.5, 0); cart.add(tabG); tabG.position.set(0, 1.7, 0);
  const CART_X0 = 34, CART_X1 = 6.5, CART_Z = 19;
  const cartX = (t) => t < K.s3 - 0.5 ? (t < K.s3 ? CART_X0 : CART_X0) : lerp(CART_X0, CART_X1, eout(clamp01((t - K.s3 + 0.5) / (tTabut + 0.4 - K.s3 + 0.5))));
  const rings = [];
  for (let k = 0; k < 3; k++) { const rm = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(rm); rings.push(rm); }

  // ---------- particles (square pixel sparkles)
  const starTex = pixTex(9, 9, (g) => { g.fillStyle = "#fff"; g.fillRect(3, 3, 3, 3); g.fillRect(4, 0, 1, 9); g.fillRect(0, 4, 9, 1); });
  const sq = (n, o) => { const p = pts(scene, n, o); p.m.map = starTex; p.m.needsUpdate = true; return p; };
  const wSp = sq(220, { color: 0xffffff, size: 0.42 }), wSeed = Array.from({ length: 220 }, () => [rnd(), rnd(), rnd()]);
  const dSp = sq(NA, { color: 0xdff6ff, size: 0.5 });
  const tSp = sq(90, { color: 0xffe08a, size: 0.32 }), tSeed = Array.from({ length: 90 }, () => [rnd(), rnd(), rnd()]);
  const fSp = sq(70, { color: 0xffa040, size: 0.28 }), fSeed = Array.from({ length: 70 }, () => [rnd(), rnd(), rnd()]);
  const mSp = sq(110, { color: 0xffe2a0, size: 0.3 }), mSeed = Array.from({ length: 110 }, () => [rnd(), rnd(), rnd()]);
  const sSp = sq(28, { color: 0xfff4d8, size: 0.6 });
  const dust = sq(160, { color: 0x6a5a4a, size: 1.1, add: false, opacity: 0.6 }), dSeed = Array.from({ length: 160 }, () => [rnd(), rnd(), rnd()]);
  const hitG = glow(6, 0);
  const drop = sq(1, { color: 0xe8fbff, size: 0.9 });
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, depthWrite: false })); ripple.renderOrder = 3; scene.add(ripple);

  // ---------- tilt-shift depth of field (two separable passes, blur grows away from a horizontal focus band)
  const TS = {
    uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1 / 1080, 0) }, uFocus: { value: 0.45 }, uBand: { value: 0.12 }, uAmt: { value: 8 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 uDir;uniform float uFocus,uBand,uAmt;varying vec2 vUv;
void main(){float d=max(0.,abs(vUv.y-uFocus)-uBand);float r=clamp(d/.3,0.,1.);r=r*r*uAmt/5.;
 vec4 s=vec4(0.);float tw=0.;for(int i=-5;i<=5;i++){float w=exp(-float(i*i)/14.);s+=texture2D(tDiffuse,vUv+uDir*float(i)*r)*w;tw+=w;}
 gl_FragColor=s/tw;}`,
  };
  const tsH = new ShaderPass(TS), tsV = new ShaderPass(TS);
  tsV.uniforms.uDir.value.set(0, 1 / 1920);
  comp.insertPass(tsH, 1); comp.insertPass(tsV, 2);

  // ---------- army logic
  const bankZ = (x) => riverZ(x) + 3.6;
  const bankPos = (i) => { const row = i < 32 ? 0 : 1, j = i % 32, s = j % 2 ? -1 : 1; const x = s * (Math.floor(j / 2) + 1.0) * 0.82 + (row ? 0.41 : 0); return [x, bankZ(x) + row * 1.35]; };
  const farPos = (c) => { const row = c < 5 ? 0 : 1; const x = ((c % 5) - 2) * 1.05 + (row ? 0.5 : 0) + (c >= 5 ? -0.3 : 0); return [x, riverZ(x) - 5.0 - row * 1.25]; };
  const THF = { x: 0.2, z: riverZ(0) - 6.6 };
  const campPos = (i) => [3.2 + (i % 8) * 1.45 + (Math.floor(i / 8) % 2) * 0.5, 24.5 + Math.floor(i / 8) * 1.35];
  const homePos = (c) => [-2.4 + (c % 5) * 1.0, 20.2 + Math.floor(c / 5) * 1.1];
  const ZB = bankZ(0) + 1.0;
  function march(i, t, T0, T1, zs) {
    const lane = i % 4, rank = Math.floor(i / 4), v = (zs - ZB) / (T1 - T0);
    const z0 = zs + 1.4 + rank * 1.3, ta = T0 + (z0 - ZB) / v;
    const lx = (lane - 1.5) * 0.95;
    if (t < ta) { const z = z0 - v * Math.max(0, t - T0); return { x: roadX(z) + lx, z, walk: t > T0, ta }; }
    const [bx, bz] = bankPos(i), u = sm((t - ta) / 2.2);
    return { x: lerp(roadX(ZB) + lx, bx, u), z: lerp(ZB, bz, u), walk: u < 1, ta };
  }
  const JAL = { x: 3, z: -36.5 };
  const ENEMY = [];
  for (let k = 0; k < 150; k++) { const row = Math.floor(k / 25), c = k % 25; const x = (c - 12) * 1.55 + (row % 2) * 0.7 + (rnd() - 0.5) * 0.5; ENEMY.push([x, ridgeZ(x) + 4 - row * 1.5 + (rnd() - 0.5) * 0.4, rnd(), rnd()]); }

  const GREY = [0.52, 0.56, 0.66], WHITE = [1, 1, 1];
  const CAMK = [
    [0, 9, 15, 36, 0, 0, 8, 0.42, 9],
    [K.s1e - 0.4, 4.5, 9.5, 21, 0, -0.2, 4, 0.40, 9],
    [K.s2 + 0.5, 2.6, 6.2, 29.5, -3.4, 1.4, 17.8, 0.42, 9, 1.8],
    [tThalut, 1.2, 5.6, 28, -3.0, 1.3, 17.4, 0.42, 9, 1.8],
    [tJawab, -1.2, 5.4, 27.6, -3.3, 1.3, 17.4, 0.42, 9, 1.8],
    [K.s2e, -4.0, 6.0, 28.2, -3.5, 1.3, 17.6, 0.42, 9, 1.8],
    [K.s3 + 0.8, 11, 5.6, 31, 9.5, 1.3, 19, 0.42, 9, 1.6],
    [tTabut, 7, 5.2, 29.5, 4.5, 1.3, 18.6, 0.42, 9, 1.7],
    [K.s3e, 2.5, 6.6, 31, 1.5, 1.2, 18.2, 0.42, 9, 1.7],
    [K.s4 + 0.6, 4.5, 8.5, 35, 0.3, 0.4, 21.5, 0.40, 9, 1.3],
    [tRiver4, 4.5, 7.5, 18.5, 0, 0, 5, 0.40, 9, 1.3],
    [K.s4e, 3, 6.4, 15, 0, -0.3, 2.6, 0.40, 9, 1.6],
    [tDrink + 1, 2.2, 6, 14, 0, -0.3, 2.4, 0.40, 9, 1.6],
    [tCross, 1.2, 7.4, 12, 0, -0.4, -1.2, 0.40, 9, 1.5],
    [tSee + 0.2, 0.6, 4.6, 11.5, 1, 1.4, -14, 0.42, 7],
    [A("s5:Jalut") + 0.3, 0.4, 2.6, 12, 2, 3.4, -36, 0.46, 5],
    [K.s5e, 0.8, 2.5, 11.5, 2, 3.4, -36, 0.46, 5],
    [K.s6 + 1.2, -2.2, 2.3, 11, 2, 3.6, -36, 0.46, 5],
    [K.s6e, 2.2, 2.4, 10.4, 2, 3.6, -36, 0.46, 5],
    [K.s7 + 1, 0.2, 2.8, 10, 1.6, 3.4, -32, 0.44, 5],
    [tLaunch, 0.8, 3.2, 8.5, 2.6, 4.6, -36, 0.44, 5],
    [tHit + 1.6, 1.2, 4.0, 5.5, 2.8, 3.6, -36, 0.44, 5],
    [tKing - 0.2, 0.4, 5.6, 9.5, 0.2, 2.6, -8, 0.42, 8],
    [K.s7e, 0, 6.0, 10.5, 0, 2.6, -8, 0.42, 8],
    [K.s8 + 0.6, 3.6, 2.2, 10, 0, -0.5, 2.6, 0.44, 9, 1.4],
    [A("s8:Kalau"), 2.6, 2.6, 9.4, 0, -0.4, 2.2, 0.44, 9, 1.4],
    [A("s8:Kalau") + 2.2, 6, 15, 30, -2.5, 0.6, 12, 0.42, 9],
    [tKisah + 0.6, -2, 11, 35, -3.4, 1.2, 18.5, 0.42, 9],
    [K.dur, -4, 13, 41, -3.6, 1.2, 18.5, 0.42, 9],
  ];
  const camT = track(CAMK.map((k) => { const f = k[9] ?? 1; return [k[0], k[4] + (k[1] - k[4]) * f, k[5] + (k[2] - k[5]) * f, k[6] + (k[3] - k[6]) * f, k[4], k[5], k[6], k[7], k[8]]; }));

  const cv = new THREE.Vector3();

  return (t) => {
    const m = mood(t);
    SU.uTop.value.copy(m.top); SU.uHor.value.copy(m.hor); SU.uSunC.value.copy(m.sc); SU.uSun.value.copy(sunDir); SU.uT.value = t;
    scene.fog.color.copy(m.hor); scene.fog.density = m.fog; r.toneMappingExposure = m.exp;
    sun.color.copy(m.sc); sun.intensity = m.si; sun.position.copy(sun.target.position).addScaledVector(sunDir, 120);
    hemi.color.copy(m.hs); hemi.intensity = m.hi;
    WU.uT.value = t; WU.uSun.value.copy(m.sc); WU.uHor.value.copy(m.hor);
    for (const g of groups) if (![gCrown, gScroll, gArm, gMark].includes(g)) g.m.material.color.copy(m.tint);

    const c = camT(t);
    cam.position.set(c[0], c[1], c[2]); cam.lookAt(cv.set(c[3], c[4], c[5])); cam.updateMatrixWorld();
    tsH.uniforms.uFocus.value = tsV.uniforms.uFocus.value = c[6];
    tsH.uniforms.uAmt.value = tsV.uniforms.uAmt.value = c[7];

    // trees
    TREES.forEach(([x, z, s], i) => gTree.set(i, x, H(x, z) - 0.1, z, s));

    // elders (always in council); "?" bubbles while they protest
    ELDERS.forEach(([x, z], k) => { const bob = Math.sin(t * 1.3 + k) * 0.02; gEl.set(k, x, H(x, z) + bob, z, 1); });
    for (let k = 0; k < 4; k++) {
      const [x, z] = ELDERS[[1, 2, 4, 5][k]], a = back(clamp01((t - tProtes - k * 0.12) / 0.3)) * (1 - ramp(t, tJawab, tJawab + 0.3));
      if (a > 0.01 && t > K.s2 && t < K.s3) gQ.set(k, x, H(x, z) + 2.0 + Math.sin(t * 5 + k) * 0.05, z, a); else gQ.hide(k);
    }

    // soldiers
    const inS1 = t < K.s2, preMarch = t >= K.s2 && t < K.s4, s4 = t >= K.s4 && t < K.s5, s5 = t >= K.s5 && t < K.s6, post = t >= K.s6;
    for (let i = 0; i < NA; i++) {
      const ch = isCh[i], useB = i % 3 === 1;
      const gs = useB ? gB : gA, gk = useB ? gKB : gKA, go = useB ? gA : gB, gko = useB ? gKA : gKB;
      go.hide(i); gko.hide(i);
      let x, z, y, kneel = false, grey = false, s = 1, walk = false, hide = false;
      if (inS1) {
        const p = march(i, t, -1.2, 3.4, 15); x = p.x; z = p.z; walk = p.walk;
        if (ch < 0 && t > p.ta + 2.0 && t > t1Min - 0.2) kneel = true;
        if (kneel && t > t1No) grey = true;
      } else if (preMarch) {
        [x, z] = campPos(i);
      } else if (s4 || (s5 && t < tDrink - 0.2)) {
        const T0 = K.s4 + 1.2, p = march(i, t, T0, tRiver4, 23);
        const [cx, cz] = campPos(i), u = sm((t - K.s4) / 2.4);
        x = lerp(cx, p.x, u); z = lerp(cz, p.z, u); walk = p.walk || u < 1;
        if (i === 0 && t > tCup0 && t < tCup1 + 0.3) kneel = true;
      } else if (s5) {
        const [bx, bz] = bankPos(i); x = bx; z = bz;
        if (ch < 0) {
          const tk = tDrink + (Math.abs(bx) / 13) * 0.9 + (i % 5) * 0.05, tu = tCross + 0.2 + (i % 7) * 0.12;
          if (t > tk && t < tu) kneel = true;
          if (t > tk + 0.5) grey = true;
          if (t >= tu) { const u = clamp01((t - tu) / 3.6); z = bz + 15 * u; x = bx * (1 - 0.4 * u); walk = true; if (u >= 1) hide = true; }
        } else {
          const [fx, fz] = farPos(ch), t0 = tHold + 0.3 + ch * 0.13, u = sm((t - t0) / 3.4);
          x = lerp(bx, fx, u); z = lerp(bz, fz, u); walk = u > 0 && u < 1;
          if (ch >= 1 && ch <= 4) z += 0.6 * ramp(t, tWeak, tWeak + 0.6);
        }
      } else if (post) {
        if (ch < 0) hide = true;
        else if (t < K.s8) {
          const [fx, fz] = farPos(ch); x = fx; z = fz - 0.9 * ramp(t, tStep, tStep + 0.8) - 1.2 * ramp(t, tHit + 1.2, tHit + 3.4);
          if (ch >= 1 && ch <= 4) z += 0.6 * (1 - ramp(t, K.s6 + 1, K.s6 + 3));
          walk = (t > tStep && t < tStep + 0.8) || (t > tHit + 1.2 && t < tHit + 3.4);
        } else if (i === 0 && t < tKisah) { x = 0.9; z = bankZ(0.9) - 0.1; kneel = true; } else { [x, z] = homePos(ch); }
      }
      if (hide || x === undefined) { gs.hide(i); gk.hide(i); dSp.pos[i * 3 + 1] = -99; continue; }
      y = H(x, z);
      const bob = walk ? Math.abs(Math.sin(t * 9 + i * 1.7)) * 0.1 : Math.sin(t * 1.5 + i) * 0.01;
      const fadeOut = s5 && ch < 0 && t > tCross ? 1 - ramp(t, tCross + 2.4, tCross + 3.8) : 1;
      s = fadeOut;
      if (kneel) { gs.hide(i); gk.set(i, x, y, z, s); gk.col(i, grey ? GREY : WHITE); }
      else { gk.hide(i); gs.set(i, x, y + bob, z, s); gs.col(i, grey ? GREY : WHITE); }
      // drink sparkle at the water in front of a kneeling soldier
      const sparkOn = kneel && (inS1 || s5 || (i === 0 && (s4 || t > K.s8)));
      const tw = Math.pow(Math.abs(Math.sin(t * 6 + i * 2.3)), 6);
      dSp.pos[i * 3] = x; dSp.pos[i * 3 + 1] = sparkOn ? WL + 0.25 + 0.25 * tw : -99; dSp.pos[i * 3 + 2] = z - 0.9;
      dSp.col[i * 3] = dSp.col[i * 3 + 1] = dSp.col[i * 3 + 2] = 0.4 + 0.6 * tw;
    }
    dSp.commit();
    for (const g of [gA, gB, gKA, gKB]) g.m.instanceColor.needsUpdate = true;

    // chosen markers (hook) on "sedikit"
    for (let c = 0; c < 10; c++) {
      const on = inS1 && t > t1Few - 0.1;
      if (!on) { gMark.hide(c); continue; }
      let x, z;
      if (c < 9) { const p = march(CH[c], t, -1.2, 3.4, 15); x = p.x; z = p.z; } else { x = 0; z = ZB - 1.4 + Math.max(0, 15 - 4.6 * (t + 1.2)) ; }
      gMark.set(c, x, H(x, z) + 2.1 + Math.sin(t * 6 + c) * 0.08, z, back(clamp01((t - t1Few + 0.1 - c * 0.04) / 0.3)));
    }

    // Thalut
    let tx, tz, banner1 = true, thVis = true;
    if (inS1) { const hz = Math.max(ZB - 1.0, 15 - (15 - ZB) / 4.6 * (t + 1.2)); tx = roadX(hz); tz = hz - 0.4; }
    else if (t < K.s4) { tx = THALUT0.x; tz = THALUT0.z; banner1 = t > tFisik + 0.5; }
    else if (t < tHold) {
      const T0 = K.s4 + 1.2, v = (23 - ZB) / (tRiver4 - T0), hz = Math.max(ZB - 1.2, 23 - v * Math.max(0, t - T0) - 0.4);
      const u = sm((t - K.s4) / 2.0); tx = lerp(THALUT0.x, roadX(hz), u); tz = lerp(THALUT0.z, hz, u);
    } else if (t < K.s8) { const u = sm((t - tHold) / 3.0); tx = lerp(roadX(ZB), THF.x, u); tz = lerp(ZB - 1.2, THF.z, u); if (t > K.s7) tz -= 0.9 * ramp(t, tStep, tStep + 0.8) + 1.2 * ramp(t, tHit + 1.2, tHit + 3.4); }
    else { tx = -0.4; tz = 19.2; }
    const thWalk = (t > K.s4 && t < tRiver4 + 0.5) || (t > tHold && t < tHold + 3) || (inS1 && t < 3.4);
    const thy = H(tx, tz) + (thWalk ? Math.abs(Math.sin(t * 8.5)) * 0.1 : 0);
    if (thVis && banner1) { gT0.hide(0); gT1.set(0, tx, thy, tz, 1); } else { gT1.hide(0); gT0.set(0, tx, thy, tz, 1); }

    // crown token: lantern -> over Thalut -> into the banner's finial
    {
      const a = ramp(t, tGod - 0.2, tGod + 0.4), fly = sm((t - tGod - 0.3) / (tThalut + 0.4 - tGod - 0.3)), gone = ramp(t, tFisik + 0.3, tFisik + 0.7);
      if (t > K.s2 && t < K.s3 && a > 0.01 && gone < 0.99) {
        const sx = lamp.position.x, sy = lamp.position.y + 1.2, sz = lamp.position.z;
        const ex = THALUT0.x, ey = H(THALUT0.x, THALUT0.z) + 2.4, ez = THALUT0.z;
        const x = lerp(sx, ex, fly), z = lerp(sz, ez, fly), y = lerp(sy, ey, fly) + Math.sin(fly * Math.PI) * 1.4 + Math.sin(t * 3) * 0.06 + 1.2 * gone;
        gCrown.set(0, x + 0.6 * gone, y, z, a * (1 - gone) * 1.25);
      } else gCrown.hide(0);
      // ilmu and fisik icons over Thalut
      const iy = H(THALUT0.x, THALUT0.z) + 3.4;
      const ia = back(clamp01((t - tIlmu) / 0.35)) * (1 - ramp(t, K.s3 - 0.4, K.s3)), fa = back(clamp01((t - tFisik) / 0.35)) * (1 - ramp(t, K.s3 - 0.4, K.s3));
      if (t > K.s2 && ia > 0.01) gScroll.set(0, THALUT0.x - 0.65, iy + Math.sin(t * 3) * 0.05, THALUT0.z, ia); else gScroll.hide(0);
      if (t > K.s2 && fa > 0.01) gArm.set(0, THALUT0.x + 0.65, iy + Math.sin(t * 3 + 1) * 0.05, THALUT0.z, fa); else gArm.hide(0);
      // s7: kingdom and wisdom over the victorious group
      const ka = back(clamp01((t - tKing) / 0.35)) * (1 - ramp(t, K.s8 - 0.3, K.s8)), ha = back(clamp01((t - tHik) / 0.35)) * (1 - ramp(t, K.s8 - 0.3, K.s8));
      if (t > K.s7 && ka > 0.01) gCrown.set(1, -0.8, H(0, THF.z) + 3.4 + Math.sin(t * 2.4) * 0.08, THF.z + 1.0, ka * 1.6); else gCrown.hide(1);
      if (t > K.s7 && ha > 0.01) gScroll.set(1, 0.9, H(0, THF.z) + 3.4 + Math.sin(t * 2.4 + 1) * 0.08, THF.z + 1.0, ha * 1.6); else gScroll.hide(1);
    }
    // "..." bubbles over those who said "kami tidak kuat"
    for (let k = 0; k < 4; k++) {
      const a = back(clamp01((t - tWeak - k * 0.1) / 0.3)) * (1 - ramp(t, K.s6 + 0.6, K.s6 + 1.0));
      if (a > 0.01 && t > K.s5) { const [fx, fz] = farPos(k + 1); const z = fz + 0.6; gDots.set(k, fx, H(fx, z) + 2.0, z, a * 1.2); } else gDots.hide(k);
    }

    // Jalut and his army on the ridge; after the stone, Jalut falls back and the army scatters over the crest
    const fall = clamp01((t - tHit) / 1.1), fallE = fall * fall;
    gJ.set(0, JAL.x, H(JAL.x, JAL.z) - 0.2, JAL.z, 1, -fallE * 1.45, H(JAL.x, JAL.z) + 0.03);
    ENEMY.forEach(([x, z, a, b], k) => {
      const tr = tHit + 0.5 + a * 1.4, u = clamp01((t - tr) / (2.2 + b));
      const ex = x + (b - 0.5) * 6 * u, ez = z - 18 * u * u;
      if (u >= 1) { gE.hide(k); return; }
      const bob = u > 0 ? Math.abs(Math.sin(t * 10 + k)) * 0.12 : Math.sin(t * 1.2 + k * 0.7) * 0.02;
      gE.set(k, ex, H(ex, ez) + bob, ez, 1);
    });

    // oxen + cart
    const cx = cartX(t);
    cart.position.set(cx, H(cx, CART_Z) - 0.05, CART_Z);
    wheels.forEach((w) => { w.rotation.z = (CART_X0 - cx) / 0.55; });
    const moving = t > K.s3 - 0.5 && t < tTabut + 0.4;
    for (let k = 0; k < 2; k++) { const ox = cx - 4.3, oz = CART_Z + (k ? 0.55 : -0.55); gOx.set(k, ox + k * 0.2, H(ox, oz) + (moving ? Math.abs(Math.sin(t * 6 + k)) * 0.06 : 0), oz, 1); }
    const tabOn = t > K.s3 - 0.5 ? 1 : 0;
    tabG.material.opacity = tabOn * (0.55 + 0.25 * ramp(t, tCalm - 0.3, tCalm + 0.5) + 0.06 * Math.sin(t * 3));
    goldM.emissiveIntensity = 0.35 + 0.5 * ramp(t, tCalm - 0.3, tCalm + 0.5) * (t < K.s4 + 2 ? 1 : 0.4);
    tabL.position.set(cx, H(cx, CART_Z) + 2.4, CART_Z); tabL.intensity = tabOn * (t < K.s4 + 2 ? 14 : 4);
    rings.forEach((rm, k) => {
      const t0 = tCalm + k * 0.55, u = clamp01((t - t0) / 2.4), t1 = tRelic + k * 0.5, u2 = clamp01((t - t1) / 2.2);
      const uu = u > 0 && u < 1 ? u : u2;
      rm.visible = (u > 0 && u < 1) || (u2 > 0 && u2 < 1);
      rm.position.set(CART_X1, H(CART_X1, CART_Z) + 0.12, CART_Z); rm.scale.setScalar(1 + uu * 6); rm.material.opacity = 0.7 * (1 - uu);
    });
    for (let k = 0; k < 90; k++) {
      const s = tSeed[k], life = (t * (0.25 + s[1] * 0.3) + s[0]) % 1;
      const on = tabOn && t < K.s4 + 3;
      tSp.pos[k * 3] = cx + (s[2] - 0.5) * 2.2 + Math.sin(t + k) * 0.1; tSp.pos[k * 3 + 1] = on ? H(cx, CART_Z) + 1.4 + life * 2.6 : -99; tSp.pos[k * 3 + 2] = CART_Z + (s[0] - 0.5) * 1.6;
      const v = Math.sin(life * Math.PI); tSp.col[k * 3] = v; tSp.col[k * 3 + 1] = v * 0.88; tSp.col[k * 3 + 2] = v * 0.55;
    }
    tSp.commit();

    // council fire and lantern
    const fy = H(CC.x, CC.z);
    for (let k = 0; k < 70; k++) {
      const s = fSeed[k], life = (t * (1.3 + s[1]) + s[0]) % 1;
      fSp.pos[k * 3] = CC.x + (s[2] - 0.5) * 0.6 * (1 - life); fSp.pos[k * 3 + 1] = fy + 0.15 + life * 1.3; fSp.pos[k * 3 + 2] = CC.z + (s[0] - 0.5) * 0.5 * (1 - life);
      const v = 1 - life; fSp.col[k * 3] = v; fSp.col[k * 3 + 1] = v * (0.35 + 0.5 * v); fSp.col[k * 3 + 2] = v * 0.12;
    }
    fSp.commit();
    fireL.position.set(CC.x, fy + 1, CC.z); fireL.intensity = 9 + Math.sin(t * 13) * 1.2 + Math.sin(t * 7.3) * 1.0;
    lampL.intensity = 5 + 4 * ramp(t, tGod - 0.3, tGod + 0.3) * (1 - ramp(t, tThalut + 0.6, tThalut + 1.6)) + Math.sin(t * 5) * 0.3;
    lampG.material.opacity = 0.7 + 0.3 * ramp(t, tGod - 0.3, tGod + 0.3) * (1 - ramp(t, tThalut + 0.6, tThalut + 1.6));

    // river shimmer
    for (let k = 0; k < 220; k++) {
      const s = wSeed[k], x = (s[0] - 0.5) * 90 + ((t * 0.5 + s[1] * 10) % 10) - 5, z = riverZ(x) + (s[2] - 0.5) * 4.6;
      const tw = Math.pow(Math.max(0, Math.sin(t * (2 + s[1] * 3) + k * 1.9)), 10);
      wSp.pos[k * 3] = x; wSp.pos[k * 3 + 1] = WL + 0.05; wSp.pos[k * 3 + 2] = z;
      wSp.col[k * 3] = wSp.col[k * 3 + 1] = wSp.col[k * 3 + 2] = tw * 0.9;
    }
    wSp.commit();

    // doa motes (s7): gentle gold specks rising around the small group
    const ma = t > tDoa - 0.5 && t < K.s8 ? ramp(t, tDoa - 0.5, tDoa + 0.8) * (1 - ramp(t, K.s8 - 0.6, K.s8)) : t > K.s6 && t < K.s7 ? 0.5 * ramp(t, tSabar - 0.6, tSabar + 0.4) : 0;
    for (let k = 0; k < 110; k++) {
      const s = mSeed[k], life = (t * (0.12 + s[1] * 0.15) + s[0]) % 1;
      mSp.pos[k * 3] = (s[2] - 0.5) * 7; mSp.pos[k * 3 + 1] = ma > 0.01 ? H(0, THF.z) + 0.3 + life * 5.5 : -99; mSp.pos[k * 3 + 2] = THF.z + 1.2 + (s[0] - 0.5) * 3.6;
      const v = Math.sin(life * Math.PI) * ma * (0.5 + 0.5 * Math.sin(t * 4 + k)); mSp.col[k * 3] = v; mSp.col[k * 3 + 1] = v * 0.9; mSp.col[k * 3 + 2] = v * 0.6;
    }
    mSp.commit();

    // sling-stone streak (no thrower shown) and the impact
    const S0 = [0.3, H(0.3, THF.z) + 2.0, THF.z + 0.4], S1 = [JAL.x, H(JAL.x, JAL.z) + 6.2, JAL.z + 0.3];
    for (let k = 0; k < 28; k++) {
      const u = (t - tLaunch) / (tHit - tLaunch) - k * 0.016;
      if (u < 0 || u > 1 || t > tHit + 0.05) { sSp.pos[k * 3 + 1] = -99; continue; }
      sSp.pos[k * 3] = lerp(S0[0], S1[0], u); sSp.pos[k * 3 + 1] = lerp(S0[1], S1[1], u) + Math.sin(u * Math.PI) * 3.5; sSp.pos[k * 3 + 2] = lerp(S0[2], S1[2], u);
      const v = 1 - k / 28; sSp.col[k * 3] = v; sSp.col[k * 3 + 1] = v * 0.95; sSp.col[k * 3 + 2] = v * 0.8;
    }
    sSp.commit();
    hitG.position.set(S1[0], S1[1], S1[2] + 0.5);
    hitG.material.opacity = t > tHit - 0.02 ? Math.max(0, 1 - (t - tHit) / 0.5) : 0;
    hitG.scale.setScalar(4 + 6 * clamp01((t - tHit) / 0.5));
    const du = clamp01((t - tHit - 0.8) / 2.6);
    for (let k = 0; k < 160; k++) {
      const s = dSeed[k];
      if (du <= 0 || du >= 1) { dust.pos[k * 3 + 1] = -99; continue; }
      const a = s[0] * Math.PI * 2, rr = (1.5 + s[1] * 5) * eout(du);
      dust.pos[k * 3] = JAL.x + Math.cos(a) * rr - 2 * eout(du); dust.pos[k * 3 + 1] = H(JAL.x, JAL.z) + 0.3 + s[2] * 2.2 * eout(du); dust.pos[k * 3 + 2] = JAL.z - 4 * eout(du) + Math.sin(a) * rr * 0.5;
      const v = 0.6 * (1 - du); dust.col[k * 3] = 0.55 * v + 0.3; dust.col[k * 3 + 1] = 0.48 * v + 0.27; dust.col[k * 3 + 2] = 0.4 * v + 0.24;
    }
    dust.m.opacity = 0.65 * (1 - du); dust.commit();

    // s8: one sip of water, a single drop and a ripple
    const dt = t - tSip;
    drop.pos[0] = 0.2; drop.pos[2] = 2.6; drop.pos[1] = dt > -0.6 && dt < 0.45 ? WL + 1.7 - 2.6 * Math.pow(clamp01((dt + 0.6) / 1.05), 2) : -99;
    drop.col[0] = drop.col[1] = drop.col[2] = 1; drop.commit();
    const ru = clamp01((dt - 0.45) / 2.4);
    ripple.visible = ru > 0 && ru < 1; ripple.position.set(0.2, WL + 0.02, 2.6); ripple.scale.setScalar(0.2 + ru * 2.4); ripple.material.opacity = 0.8 * (1 - ru);

    for (const g of groups) { g.m.instanceMatrix.needsUpdate = true; if (g.b) g.b.instanceMatrix.needsUpdate = true; }
    comp.render();
  };
}
