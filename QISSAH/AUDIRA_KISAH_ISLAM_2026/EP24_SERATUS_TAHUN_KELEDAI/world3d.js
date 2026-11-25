// EP24 SERATUS TAHUN, KELEDAI. TIMEFORGE: a time-evolution diorama. A ruined town on a hill, a lone tree in the
// foreground with the resting spot beneath it, and a big brass year-dial (hand + roll odometer, "AUDIRA" engraved on
// its face) standing beside it. Time-lapse is driven by one value Y (years, 0..100): sun arcs race across the sky
// (long-exposure trails), seasons cycle (autumn leaves, snow cover, spring blossom), grass and vines grow over the
// resting spot, and the donkey's body fades to a clean ivory skeleton that settles on its side.
// Depiction: the man (Uzair, per riwayat) never appears in any form. His presence is a travel staff leaning on the
// tree, an open cloth bundle of food and a water skin. The donkey is an animal (allowed); bones are stylised and clean.
// Story order: s1 hook flashes forward (Y 0 to 100), then rewinds (100 to 0) into s2; s3 runs the 100 years; s6 lifts
// and reassembles the bones in the air, fills in the body, and rebuilds the ruined town in a time-lapse as a parallel.
// Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts, envStrips } from "./lib3d.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const mix = (a, b, u) => a + (b - a) * u;
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }

const TOWN = [0, -9], TOWN_Y = 3.0;
const SPOT = [0.4, 4.6]; // resting area (flat)
function hillD(x, z) { return Math.hypot(x / 1.3, z - TOWN[1]); }
function H(x, z) {
  const d = hillD(x, z);
  const hill = TOWN_Y * sm(1 - (d - 4.6) / 6.5);
  const plateau = sm(1 - (d - 4.0) / 1.6);
  const flat = sm((Math.hypot(x - SPOT[0], z - SPOT[1]) - 4.2) / 4.0) * sm((Math.hypot(x + 2.6, z - 7) - 1.5) / 2);
  const n = (fbm(x * 0.18 + 5, z * 0.18) - 0.5) * 0.9 * (1 - plateau) * flat;
  const R = Math.hypot(x, z + 8);
  const ridge = sm((R - 34) / 26) * (3 + 9 * fbm(x * 0.035 + 2, z * 0.035 - 1));
  return hill + n + ridge;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xd9c3a0, fog: 0.006, exp: 1.0, bloom: [0.3, 0.5, 0.86], shadow: true });
  cam.near = 0.04; cam.far = 900; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2424);
  const C = (h) => new THREE.Color(h);
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fs = new THREE.Vector3();
  const AY = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0), AZ = new THREE.Vector3(0, 0, 1);
  envStrips(r, scene, [[40, 8, 0xfff1d6, 2.2, 0, 30, 10], [30, 6, 0xffc27a, 1.4, -30, 10, 20], [50, 10, 0x8fb0d8, 0.8, 0, -10, -40], [20, 20, 0xffffff, 0.6, 30, 20, 0]], 0x1a1610);

  // ---------- timing
  const tSpin = A("s1:seratus"), dSpin = 1.6;
  const tRw0 = K.s1e - 0.35, tRw1 = K.s2 + 0.45;
  const tTL = A("s3:mematikannya-0.2"), dTL = 3.4;
  const tLift = A("s6:tulang-tulang") - 0.2, tAsm0 = A("s6:disusun") - 0.4, tAsm1 = tAsm0 + 1.2;
  const tFl0 = A("s6:dibalut") - 0.1, tFl1 = tFl0 + 1.3;
  const tReb = A("s6:Agar") - 0.3, dReb = 3.0;
  function yearAt(t) {
    if (t < tRw0) return 100 * eout((t - tSpin) / dSpin);
    if (t < tTL) return 100 * (1 - sm((t - tRw0) / (tRw1 - tRw0)));
    return 100 * eout((t - tTL) / dTL);
  }
  const bump = (p, c, w) => { let d = Math.abs(p - c); d = Math.min(d, 1 - d); return sm(1 - d / w); };

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xf2e2c8, 0x6a5638, 0.8); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffd29a, 3); sunL.castShadow = true;
  sunL.shadow.mapSize.set(4096, 4096); sunL.shadow.bias = -0.0003; sunL.shadow.normalBias = 0.02;
  const SC = sunL.shadow.camera; SC.near = 1; SC.far = 200; SC.left = -17; SC.right = 17; SC.top = 17; SC.bottom = -17;
  scene.add(sunL); scene.add(sunL.target);
  const fillL = new THREE.DirectionalLight(0x9fb4d8, 0.35); fillL.position.set(-10, 6, 12); scene.add(fillL);
  const warmL = new THREE.PointLight(0xffc070, 0, 5, 1.4); warmL.position.set(0.95, 1.6, 4.6); scene.add(warmL);

  // ---------- moods: [t, az, el, sunI, sunHex, hemiI, topHex, horHex, fog]
  const MK = [
    [0, 135, 24, 3.0, 0xffd29a, 0.8, 0x4f80c0, 0xf0dcc0, 0.0055],
    [K.s2, 150, 48, 3.1, 0xfff0d8, 0.85, 0x5f8cc8, 0xe6e2d4, 0.006],
    [K.s3, 120, 30, 3.0, 0xffd8a0, 0.8, 0x5585c2, 0xf0dcbc, 0.0055],
    [K.s4, 125, 28, 2.9, 0xffd29a, 0.8, 0x5383be, 0xeedcbc, 0.0055],
    [K.s5, 140, 22, 3.0, 0xffe0b0, 0.82, 0x5a8ccc, 0xf2e2c4, 0.0055],
    [K.s6, 110, 16, 2.9, 0xffc888, 0.78, 0x6b8cbc, 0xf2cc9c, 0.0055],
    [K.s7, 95, 10, 2.7, 0xffb470, 0.74, 0x5f7eb2, 0xf0bc8a, 0.0055],
    [K.s8, 62, 3.5, 2.3, 0xff9c6a, 0.62, 0x4a5c94, 0xf2a488, 0.005],
    [K.dur, 66, 6, 2.5, 0xffb07a, 0.66, 0x5268a0, 0xf4b490, 0.005],
  ];
  const MC = MK.map((k) => k.map((v, j) => (j === 4 || j === 6 || j === 7 ? C(v) : v)));
  const M = { sc: new THREE.Color(), top: new THREE.Color(), hor: new THREE.Color() };
  function mood(t) {
    let i = 0; while (i < MC.length - 2 && MC[i + 1][0] <= t) i++;
    const a = MC[i], b = MC[i + 1];
    const u = sm((t - a[0]) / Math.max(0.001, b[0] - a[0]));
    const L = (j) => a[j] + (b[j] - a[j]) * u;
    M.az = L(1); M.el = L(2); M.si = L(3); M.sc.copy(a[4]).lerp(b[4], u); M.hi = L(5);
    M.top.copy(a[6]).lerp(b[6], u); M.hor.copy(a[7]).lerp(b[7], u); M.fog = L(8);
    return M;
  }
  const sunDir = new THREE.Vector3();
  const setDir = (v, az, el) => { const A1 = az * Math.PI / 180, E = el * Math.PI / 180; return v.set(Math.cos(E) * Math.sin(A1), Math.sin(E), -Math.cos(E) * Math.cos(A1)); };

  // ---------- sky
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uNight: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=(modelMatrix*vec4(position,1.)).xyz-cameraPosition;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uSun,uSunC;uniform float uNight;varying vec3 vD;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec3 d=normalize(vD);float y=d.y;
 vec3 c=mix(uHor,uTop,smoothstep(-.02,.55,y));
 float g=max(dot(d,normalize(uSun)),0.);
 c+=uSunC*(pow(g,6.)*.25+pow(g,60.)*.5)*(1.-uNight*.7);
 c=mix(c,vec3(1.,.93,.78)*2.3,smoothstep(.99955,.99975,g)*step(0.,uSun.y));
 vec2 p=d.xz/max(.08,y+.12)*1.1;float cl=n(p)*.55+n(p*2.1+3.)*.3+n(p*4.7)*.15;
 cl=smoothstep(.5,.85,cl)*smoothstep(-.01,.14,y)*(1.-smoothstep(.5,.85,y));
 c=mix(c,mix(uHor*1.05,uSunC*1.1,pow(g,3.)),cl*.45);
 c=mix(c,vec3(.07,.09,.18),uNight*.6*smoothstep(-.1,.4,y));
 float st=step(.9965,h(floor(d.xz/(y+.3)*260.)))*smoothstep(.1,.5,y)*uNight;c+=vec3(st);
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // sun-arc trails (long-exposure streaks while time races): three arcs for summer, equinox and winter heights
  const AZ0 = 115;
  const sunAt = (c, amp, v) => setDir(v, AZ0 + 75 * Math.sin(c), amp * Math.cos(c) - 10);
  const trailM = new THREE.MeshBasicMaterial({ color: 0xffd890, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const trails = [];
  for (const amp of [62, 48, 34]) {
    const P = [];
    for (let k = 0; k <= 40; k++) { const c = -1.6 + 3.2 * k / 40; P.push(sunAt(c, amp, new THREE.Vector3()).multiplyScalar(600)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 80, amp === 48 ? 2.2 : 1.4, 6, false), trailM);
    tube.frustumCulled = false; tube.renderOrder = -9; scene.add(tube); trails.push(tube);
  }

  // ---------- ground
  const GS = 230, GN = 220;
  const gGeo = new THREE.PlaneGeometry(GS, GS, GN, GN); gGeo.rotateX(-Math.PI / 2);
  const gp = gGeo.attributes.position, gcol = new Float32Array(gp.count * 3);
  const cDry = C(0xbda06a), cOl = C(0x8e8a52), cRock = C(0xa88e6c), cDust = C(0xc8b088), cFar = C(0xb0946e), tc = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i), y = H(x, z);
    gp.setY(i, y);
    const n = fbm(x * 0.3, z * 0.3), d = hillD(x, z);
    tc.copy(cDry).lerp(cOl, sm((n - 0.45) * 5) * 0.85).lerp(C(0xd8c08a), sm((0.4 - fbm(x * 0.9 + 7, z * 0.9)) * 6) * 0.5);
    if (d < 11) tc.lerp(cRock, sm((y - 0.4) / 1.4) * (1 - sm((4.8 - d) * 2)) * 0.8);
    if (d < 5.2) tc.lerp(cDust, sm((5.2 - d) * 1.5));
    tc.lerp(cFar, sm((Math.hypot(x, z + 8) - 30) / 20));
    tc.multiplyScalar(0.92 + 0.16 * vnoise(x * 2.1, z * 2.1));
    gcol[i * 3] = tc.r; gcol[i * 3 + 1] = tc.g; gcol[i * 3 + 2] = tc.b;
  }
  gGeo.setAttribute("color", new THREE.BufferAttribute(gcol, 3));
  gGeo.computeVertexNormals();
  const ground = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
  ground.receiveShadow = true; scene.add(ground);
  // snow cover overlay (same relief, slightly raised)
  const snowG = new THREE.PlaneGeometry(80, 80, 140, 140); snowG.rotateX(-Math.PI / 2);
  const sp = snowG.attributes.position;
  for (let i = 0; i < sp.count; i++) sp.setY(i, H(sp.getX(i), sp.getZ(i)) + 0.025);
  snowG.computeVertexNormals();
  const snowM = new THREE.MeshStandardMaterial({ color: 0xf4f6fa, roughness: 0.8, transparent: true, opacity: 0, depthWrite: false });
  const snowCover = new THREE.Mesh(snowG, snowM); snowCover.receiveShadow = true; snowCover.position.z = -2; scene.add(snowCover);

  // ---------- town (ruined, rebuilds in s6)
  const stoneTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#cdb48a"; g.fillRect(0, 0, w, h);
    for (let y = 0, row = 0; y < h; y += 32, row++) for (let x = (row % 2) * -24; x < w; x += 48) {
      const v = 0.85 + rnd() * 0.25; g.fillStyle = `rgb(${205 * v | 0},${178 * v | 0},${134 * v | 0})`; g.fillRect(x + 2, y + 2, 44, 28);
    }
    g.fillStyle = "rgba(60,40,22,.85)"; g.fillRect(104, 150, 48, 106); g.fillRect(40, 70, 26, 34); g.fillRect(190, 70, 26, 34);
  });
  const wallM = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 });
  const roofM = new THREE.MeshStandardMaterial({ color: 0xd9c49a, roughness: 0.85 });
  const domeM = new THREE.MeshStandardMaterial({ color: 0xe8dcc2, roughness: 0.6 });
  const HOUSES = [];
  const spots = [];
  for (let k = 0; k < 400 && spots.length < 12; k++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 3.6;
    const x = TOWN[0] + Math.cos(a) * rr * 1.25, z = TOWN[1] + Math.sin(a) * rr;
    if (spots.every((s) => Math.hypot(s[0] - x, s[1] - z) > 1.75)) spots.push([x, z]);
  }
  spots.forEach(([x, z], i) => {
    const w = 1.1 + rnd() * 0.7, d = 1.0 + rnd() * 0.6, h = 0.9 + rnd() * 0.8;
    const G = new THREE.Group(); G.position.set(x, H(x, z) - 0.02, z); G.rotation.y = (rnd() - 0.5) * 0.5; scene.add(G);
    const wg = new THREE.BoxGeometry(w, h, d); wg.translate(0, h / 2, 0);
    const walls = new THREE.Mesh(wg, wallM); walls.castShadow = walls.receiveShadow = true; G.add(walls);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.12, d + 0.12), roofM); roof.castShadow = roof.receiveShadow = true; G.add(roof);
    let dome = null;
    if (i % 4 === 1) { dome = new THREE.Mesh(new THREE.SphereGeometry(Math.min(w, d) * 0.36, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), domeM); dome.castShadow = true; G.add(dome); }
    HOUSES.push({ G, walls, roof, dome, w, d, h, hr: 0.32 + rnd() * 0.3, tx: (rnd() - 0.5) * 1.1, tz: 0.35 + rnd() * 0.45, sx: (rnd() - 0.5) * 0.4, k: i });
  });
  // perimeter wall segments with a gate gap facing the camera
  const SEG = [];
  for (let k = 0; k < 18; k++) {
    const a = k / 18 * Math.PI * 2 + 0.1;
    if (Math.abs(Math.sin(a) - 1) < 0.05) continue;
    const x = TOWN[0] + Math.cos(a) * 5.6, z = TOWN[1] + Math.sin(a) * 4.4;
    const len = 1.75, h = 0.7;
    const G = new THREE.Group(); G.position.set(x, H(x, z) - 0.05, z); G.rotation.y = -Math.atan2(Math.cos(a) * 4.4, -Math.sin(a) * 5.6); scene.add(G);
    const g = new THREE.BoxGeometry(len, h, 0.3); g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, wallM); m.castShadow = m.receiveShadow = true; G.add(m);
    SEG.push({ G, m, hr: 0.25 + rnd() * 0.45, k: HOUSES.length + SEG.length * 0.6 });
  }
  // rubble
  const NR = 190;
  const rubble = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xc4aa80, roughness: 0.95 }), NR);
  rubble.castShadow = rubble.receiveShadow = true; rubble.frustumCulled = false; scene.add(rubble);
  const RS = [];
  for (let i = 0; i < NR; i++) {
    const hs = HOUSES[i % HOUSES.length];
    const a = rnd() * Math.PI * 2, rr = 0.5 + rnd() * 1.1;
    const x = hs.G.position.x + Math.cos(a) * rr, z = hs.G.position.z + Math.sin(a) * rr;
    RS.push({ x, z, y: H(x, z), s: 0.08 + rnd() * 0.16, ry: rnd() * 6, rx: rnd() * 0.6, k: hs.k });
  }
  // olive trees and cypresses on the slopes
  const oliveM = new THREE.MeshStandardMaterial({ color: 0x6f7c45, roughness: 0.9, flatShading: true });
  const barkM = new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 0.95 });
  for (let k = 0; k < 16; k++) {
    const a = rnd() * Math.PI * 2, rr = 7 + rnd() * 9;
    const x = TOWN[0] + Math.cos(a) * rr * 1.2, z = TOWN[1] + Math.sin(a) * rr * 0.9;
    if (z > -1 && Math.abs(x) < 6) continue;
    const y = H(x, z), cyp = k % 3 === 0;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.7, 6), barkM); tr.position.set(x, y + 0.35, z); tr.castShadow = true; scene.add(tr);
    const cr = cyp ? new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.9, 8), oliveM) : new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), oliveM);
    cr.position.set(x, y + (cyp ? 1.4 : 0.95), z); cr.castShadow = true; scene.add(cr);
  }

  // ---------- hero tree
  const TR = new THREE.Vector3(-1.4, 0, 3.0);
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.95 });
  const limb = (a, b, r0, r1) => {
    const d = tv.copy(b).sub(a), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 9), trunkM);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(AY, d.normalize()); m.castShadow = m.receiveShadow = true; scene.add(m);
  };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  limb(V3(-1.4, 0, 3.0), V3(-1.35, 1.5, 3.0), 0.24, 0.17);
  limb(V3(-1.35, 1.45, 3.0), V3(-0.6, 2.6, 3.3), 0.15, 0.07);
  limb(V3(-1.35, 1.45, 3.0), V3(-2.2, 2.7, 2.8), 0.14, 0.06);
  limb(V3(-1.36, 1.4, 3.0), V3(-1.3, 3.0, 2.4), 0.13, 0.06);
  limb(V3(-1.36, 1.4, 3.0), V3(-1.7, 2.5, 3.8), 0.1, 0.05);
  const canM = new THREE.MeshStandardMaterial({ color: 0x5f7a3a, roughness: 0.85, flatShading: true });
  const CAN = [];
  for (const [x, y, z, s] of [[-0.6, 2.85, 3.3, 0.95], [-2.2, 2.95, 2.8, 0.95], [-1.3, 3.35, 2.4, 1.05], [-1.7, 2.75, 3.85, 0.75], [-1.4, 3.1, 3.2, 1.1], [-0.9, 3.3, 2.6, 0.8], [-1.95, 3.3, 2.3, 0.8]]) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), canM); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    CAN.push({ m, s });
  }

  // ---------- resting spot: staff, cloth bundle with food, water skin (presence only)
  const staffA = V3(-0.92, 0, 3.6), staffB = V3(-1.24, 1.95, 3.17);
  {
    const d = tv.copy(staffB).sub(staffA), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, len, 8), new THREE.MeshStandardMaterial({ color: 0x7a5534, roughness: 0.7 }));
    m.position.copy(staffA).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(AY, d.normalize()); m.castShadow = true; scene.add(m);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), m.material); knob.position.copy(staffB); scene.add(knob);
  }
  const F = V3(0.1, 0, 5.6);
  const clothTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#e9dcc0"; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) { g.fillStyle = "#3d4e7a"; g.fillRect(x + 4, 0, 6, h); g.fillStyle = "#a8463a"; g.fillRect(x + 16, 0, 3, h); }
    g.fillStyle = "#3d4e7a"; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10);
    for (let i = 0; i < 1500; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.07)"; g.fillRect(rnd() * w, rnd() * h, 2, 1); }
  });
  const clothG = new THREE.PlaneGeometry(1.05, 0.85, 24, 20); clothG.rotateX(-Math.PI / 2);
  const cp = clothG.attributes.position;
  for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), z = cp.getZ(i); const e = Math.max(Math.abs(x) / 0.525, Math.abs(z) / 0.425); cp.setY(i, 0.012 + 0.02 * Math.sin(x * 14 + z * 9) * e + 0.05 * sm((e - 0.75) * 4) * (0.5 + 0.5 * Math.sin(x * 9 - z * 7))); }
  clothG.computeVertexNormals();
  const cloth = new THREE.Mesh(clothG, new THREE.MeshStandardMaterial({ map: clothTex, roughness: 0.9, side: THREE.DoubleSide }));
  cloth.position.copy(F); cloth.rotation.y = 0.25; cloth.receiveShadow = true; cloth.castShadow = true; scene.add(cloth);
  const FOOD = new THREE.Group(); FOOD.position.copy(F); FOOD.rotation.y = 0.25; scene.add(FOOD);
  const breadM = new THREE.MeshPhysicalMaterial({ color: 0xc98a44, roughness: 0.65, clearcoat: 0.15, clearcoatRoughness: 0.5 });
  const figM = new THREE.MeshPhysicalMaterial({ color: 0x5a2a4a, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
  const grapeM = new THREE.MeshPhysicalMaterial({ color: 0x9fb04a, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, transmission: 0.15 });
  const mk = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; FOOD.add(m); return m; };
  mk(new THREE.SphereGeometry(0.17, 20, 14), breadM, -0.22, 0.045, -0.08, 0.75, 0.38, 0.6);
  mk(new THREE.SphereGeometry(0.13, 20, 14), breadM, -0.06, 0.04, 0.17, 0.75, 0.36, 0.55);
  const GL = [];
  for (let i = 0; i < 6; i++) { const a = i * 1.05, m = mk(new THREE.SphereGeometry(0.055, 14, 10), figM, 0.2 + Math.cos(a) * 0.09, 0.05, -0.12 + Math.sin(a) * 0.08, 1, 1.15, 1); GL.push(m); }
  for (let i = 0; i < 14; i++) { const m = mk(new THREE.SphereGeometry(0.032, 10, 8), grapeM, 0.22 + (rnd() - 0.5) * 0.12, 0.035 + (i % 3) * 0.02, 0.17 + (rnd() - 0.5) * 0.12); GL.push(m); }
  // water skin
  const skinM = new THREE.MeshPhysicalMaterial({ color: 0x7a4e2c, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const WS = new THREE.Group(); WS.position.set(-0.62, 0, 5.2); WS.rotation.y = -0.6; scene.add(WS);
  { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), skinM); b.scale.set(1.3, 0.75, 0.95); b.position.y = 0.15; b.castShadow = true; WS.add(b);
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.16, 10), skinM); n.position.set(0.27, 0.22, 0); n.rotation.z = -1.0; n.castShadow = true; WS.add(n);
    const st = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 30), new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.8 })); st.position.y = 0.2; st.rotation.x = 1.3; WS.add(st); }

  // ---------- donkey (local +x = head), flesh parts fade, bones inside
  const DK = new THREE.Group(); DK.position.set(0.95, 0, 3.9); DK.rotation.y = Math.PI; scene.add(DK);
  const fleshM = new THREE.MeshStandardMaterial({ color: 0x9a8f82, roughness: 0.8, transparent: true, emissive: 0xffb060, emissiveIntensity: 0 });
  const lightM = new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8, transparent: true, emissive: 0xffb060, emissiveIntensity: 0 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x3a332d, roughness: 0.85, transparent: true });
  const FL = [];
  const part = (geo, mat, x, y, z, rz = 0, par = DK, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); m.castShadow = true; m.receiveShadow = true; par.add(m); FL.push(m); return m; };
  part(new THREE.CapsuleGeometry(0.25, 0.62, 6, 14), fleshM, 0, 0.84, 0, Math.PI / 2).scale.set(1, 1, 0.92);
  part(new THREE.SphereGeometry(0.27, 14, 10), fleshM, -0.36, 0.86, 0);
  part(new THREE.SphereGeometry(0.25, 14, 10), fleshM, 0.33, 0.86, 0);
  part(new THREE.SphereGeometry(0.24, 14, 10), lightM, 0, 0.66, 0, 0).scale.set(1.5, 0.45, 0.85);
  const headP = new THREE.Group(); headP.position.set(0.4, 0.98, 0); DK.add(headP);
  part(new THREE.CylinderGeometry(0.12, 0.18, 0.55, 12), fleshM, 0.15, 0.17, 0, -0.75, headP);
  const mane = part(new THREE.BoxGeometry(0.05, 0.5, 0.06), darkM, 0.08, 0.27, 0, -0.75, headP);
  const head = new THREE.Group(); head.position.set(0.42, 0.33, 0); headP.add(head);
  part(new THREE.CapsuleGeometry(0.115, 0.3, 6, 12), fleshM, 0.1, -0.06, 0, -2.2, head);
  part(new THREE.SphereGeometry(0.105, 12, 10), lightM, 0.24, -0.19, 0, 0, head);
  const earL = part(new THREE.ConeGeometry(0.05, 0.34, 8), fleshM, -0.02, 0.18, 0.07, 0.35, head, 0.25);
  const earR = part(new THREE.ConeGeometry(0.05, 0.34, 8), fleshM, -0.02, 0.18, -0.07, 0.35, head, -0.25);
  for (const s of [-1, 1]) part(new THREE.SphereGeometry(0.022, 8, 6), darkM, 0.06, 0.02, s * 0.1, 0, head);
  const LEGS = [];
  for (const [x, z] of [[0.36, 0.14], [0.36, -0.14], [-0.38, 0.14], [-0.38, -0.14]]) {
    const piv = new THREE.Group(); piv.position.set(x, 0.66, z); DK.add(piv);
    part(new THREE.CylinderGeometry(0.06, 0.075, 0.6, 10), fleshM, 0, -0.3, 0, 0, piv);
    part(new THREE.CylinderGeometry(0.06, 0.065, 0.07, 10), darkM, 0, -0.63, 0, 0, piv);
    LEGS.push(piv);
  }
  const tailP = new THREE.Group(); tailP.position.set(-0.62, 0.95, 0); DK.add(tailP);
  part(new THREE.CylinderGeometry(0.02, 0.03, 0.45, 6), fleshM, -0.04, -0.22, 0, 0.18, tailP);
  part(new THREE.SphereGeometry(0.05, 8, 6), darkM, -0.08, -0.45, 0, 0, tailP).scale.set(1, 1.8, 1);

  // skeleton: assembled pose (standing) and lying pose (on its side, slightly scattered)
  const boneM = new THREE.MeshStandardMaterial({ color: 0xeee4cc, roughness: 0.42, emissive: 0xffd9a0, emissiveIntensity: 0 });
  const BG = new THREE.Group(); DK.add(BG);
  const BONES = [];
  const qTmp = new THREE.Quaternion();
  const addBone = (geo, pos, quat) => { const m = new THREE.Mesh(geo, boneM); m.castShadow = true; BG.add(m); BONES.push({ m, aP: pos.clone(), aQ: quat.clone() }); };
  const rod = (a, b, rad) => { const d = tv2.copy(b).sub(a), len = d.length(); addBone(new THREE.CapsuleGeometry(rad, Math.max(0.01, len - rad * 2), 4, 8), a.clone().addScaledVector(d, 0.5), qTmp.setFromUnitVectors(AY, d.clone().normalize())); };
  // skull + jaw
  addBone(new THREE.CapsuleGeometry(0.085, 0.27, 6, 10), V3(0.88, 1.24, 0), new THREE.Quaternion().setFromAxisAngle(AZ, -2.44));
  addBone(new THREE.CapsuleGeometry(0.035, 0.24, 4, 8), V3(0.86, 1.14, 0), new THREE.Quaternion().setFromAxisAngle(AZ, -2.3));
  // spine and neck
  const vg = new THREE.CylinderGeometry(0.048, 0.048, 0.07, 10);
  for (let i = 0; i < 9; i++) { const x = 0.4 - i * 0.12; addBone(vg, V3(x, 1.03 + 0.02 * Math.sin(i * 0.5), 0), new THREE.Quaternion().setFromAxisAngle(AZ, Math.PI / 2)); }
  for (let i = 0; i < 4; i++) { const u = (i + 1) / 5; addBone(vg, V3(0.42 + 0.3 * u, 1.05 + 0.27 * u, 0), new THREE.Quaternion().setFromAxisAngle(AZ, -0.75)); }
  // ribs: rings in the y-z plane with a gap underneath
  for (let i = 0; i < 7; i++) {
    const rr = 0.2 + 0.05 * Math.sin((i + 0.5) / 7 * Math.PI), arc = Math.PI * 1.55;
    const q = new THREE.Quaternion().setFromAxisAngle(AY, Math.PI / 2).multiply(new THREE.Quaternion().setFromAxisAngle(AZ, Math.PI / 2 - arc / 2));
    addBone(new THREE.TorusGeometry(rr, 0.018, 6, 18, arc), V3(0.3 - i * 0.075, 1.03 - rr, 0), q);
  }
  addBone(new THREE.BoxGeometry(0.2, 0.14, 0.3), V3(-0.5, 0.95, 0), new THREE.Quaternion());
  for (const s of [-1, 1]) addBone(new THREE.BoxGeometry(0.14, 0.26, 0.03), V3(0.3, 0.86, s * 0.2), new THREE.Quaternion().setFromAxisAngle(AZ, 0.25));
  for (const [x, z] of [[0.36, 0.14], [0.36, -0.14], [-0.38, 0.14], [-0.38, -0.14]]) {
    rod(V3(x, 0.86, z), V3(x + 0.02, 0.48, z), 0.032);
    rod(V3(x + 0.02, 0.46, z), V3(x, 0.06, z), 0.026);
    addBone(new THREE.SphereGeometry(0.04, 10, 8), V3(x + 0.02, 0.47, z), new THREE.Quaternion());
    addBone(new THREE.CylinderGeometry(0.045, 0.05, 0.05, 10), V3(x, 0.03, z), new THREE.Quaternion());
  }
  for (let i = 0; i < 5; i++) addBone(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8), V3(-0.64 - i * 0.02, 0.92 - i * 0.08, 0), new THREE.Quaternion().setFromAxisAngle(AZ, 0.2));
  const qLie = new THREE.Quaternion().setFromAxisAngle(AX, Math.PI / 2);
  for (const b of BONES) {
    b.lP = b.aP.clone().applyQuaternion(qLie).add(tv.set((rnd() - 0.5) * 0.05, 0.27, (rnd() - 0.5) * 0.05));
    b.lP.y = Math.max(0.035, b.lP.y);
    b.lQ = qLie.clone().multiply(b.aQ).premultiply(new THREE.Quaternion().setFromAxisAngle(AY, (rnd() - 0.5) * 0.15));
    b.spin = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(); b.ph = rnd() * 6.28; b.lag = rnd() * 0.35;
  }

  // ---------- brass year-dial (hand + roll odometer). AUDIRA engraved on its face
  const DL = new THREE.Group(); DL.position.set(-2.6, 0, 7.0); DL.rotation.y = 0.3; scene.add(DL);
  const brassM = new THREE.MeshStandardMaterial({ color: 0xc9a050, roughness: 0.28, metalness: 0.9 });
  const darkBrass = new THREE.MeshStandardMaterial({ color: 0x5a4220, roughness: 0.35, metalness: 0.85 });
  const stoneM = new THREE.MeshStandardMaterial({ color: 0xb8a284, roughness: 0.9 });
  { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.6), stoneM); b.position.y = 0.11; b.castShadow = b.receiveShadow = true; DL.add(b);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 14), brassM); c.position.y = 0.45; c.castShadow = true; DL.add(c); }
  const FACE_Y = 1.55, FR = 1.0;
  const faceTex = canvasTex(1024, 1024, (g, w) => {
    const c = w / 2;
    const gr = g.createRadialGradient(c * 0.8, c * 0.7, 20, c, c, c);
    gr.addColorStop(0, "#f0d48a"); gr.addColorStop(0.6, "#cfa654"); gr.addColorStop(1, "#8e6a2c");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(255,240,200,${0.03 + rnd() * 0.04})`; g.lineWidth = 1; g.beginPath(); g.arc(c, c, rnd() * c, 0, Math.PI * 2); g.stroke(); }
    const ring = (rr, lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(c, c, rr * c, 0, Math.PI * 2); g.stroke(); };
    ring(0.95, 6, "#5a4018"); ring(0.8, 4, "#5a4018"); ring(0.79, 2, "rgba(255,236,190,.6)");
    for (let k = 0; k < 100; k++) {
      const a = k / 100 * Math.PI * 2 - Math.PI / 2, L = k % 10 === 0 ? 0.12 : k % 5 === 0 ? 0.08 : 0.05;
      g.strokeStyle = "#4a3410"; g.lineWidth = k % 10 === 0 ? 7 : 3.5;
      g.beginPath(); g.moveTo(c + Math.cos(a) * c * 0.93, c + Math.sin(a) * c * 0.93); g.lineTo(c + Math.cos(a) * c * (0.93 - L), c + Math.sin(a) * c * (0.93 - L)); g.stroke();
    }
    g.textAlign = "center"; g.textBaseline = "middle";
    const eng = (txt, x, y, font, sp) => {
      g.font = font; if (sp !== undefined) g.letterSpacing = sp + "px";
      g.fillStyle = "rgba(255,240,200,.55)"; g.fillText(txt, x + 2, y + 2);
      g.fillStyle = "#3e2c0c"; g.fillText(txt, x, y);
    };
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 - Math.PI / 2; eng(String(k * 10), c + Math.cos(a) * c * 0.68, c + Math.sin(a) * c * 0.68, "bold 62px Georgia, serif", 0); }
    // odometer window recess
    g.fillStyle = "#2a1d08"; g.fillRect(c - 165, c + 0.3 * c - 72, 330, 144);
    eng("TAHUN", c, c + 0.3 * c + 118, "bold 50px Georgia, serif", 10);
    eng("AUDIRA", c, c - 0.33 * c, "bold 46px Georgia, serif", 12);
    g.strokeStyle = "#4a3410"; g.lineWidth = 2; g.beginPath(); g.moveTo(c - 120, c - 0.33 * c + 34); g.lineTo(c + 120, c - 0.33 * c + 34); g.stroke();
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(FR, 96), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.32, metalness: 0.75 }));
  face.position.set(0, FACE_Y, 0.04); DL.add(face);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(FR, FR, 0.08, 64), brassM); back.rotation.x = Math.PI / 2; back.position.y = FACE_Y; back.castShadow = true; DL.add(back);
  const bez = new THREE.Mesh(new THREE.TorusGeometry(FR, 0.07, 14, 96), brassM); bez.position.set(0, FACE_Y, 0.04); bez.castShadow = true; DL.add(bez);
  const handG = new THREE.BoxGeometry(0.05, 0.86, 0.02); handG.translate(0, 0.3, 0);
  const hand = new THREE.Mesh(handG, darkBrass); hand.position.set(0, FACE_Y, 0.11); hand.castShadow = true; DL.add(hand);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4), darkBrass); tip.position.y = 0.78; hand.add(tip);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20), brassM); cap.rotation.x = Math.PI / 2; cap.position.set(0, FACE_Y, 0.12); DL.add(cap);
  // roll odometer: 3 digit strips scrolled through texture offset
  const DIG = [];
  const WY = FACE_Y - 0.3;
  for (let k = 0; k < 3; k++) {
    const tx = canvasTex(128, 1408, (g, w) => {
      g.fillStyle = "#f2e9d2"; g.fillRect(0, 0, w, 1408);
      g.fillStyle = "#1c1408"; g.font = "bold 104px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
      for (let i = 0; i < 11; i++) { g.fillText(String(i % 10), w / 2, i * 128 + 68); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, i * 128, w, 2); g.fillStyle = "#1c1408"; }
    }, [1, 1 / 11]);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.22), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.5 }));
    m.position.set((k - 1) * 0.2, WY, 0.06); DL.add(m); DIG.push(tx);
  }
  const shadeTex = canvasTex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(20,12,0,.75)"); gr.addColorStop(0.3, "rgba(20,12,0,0)"); gr.addColorStop(0.7, "rgba(20,12,0,0)"); gr.addColorStop(1, "rgba(20,12,0,.75)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.24), new THREE.MeshBasicMaterial({ map: shadeTex, transparent: true, depthWrite: false })); shade.position.set(0, WY, 0.065); DL.add(shade);
  for (const [w, h, x, y] of [[0.68, 0.035, 0, WY + 0.135], [0.68, 0.035, 0, WY - 0.135], [0.035, 0.3, -0.33, WY], [0.035, 0.3, 0.33, WY]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), brassM); b.position.set(x, y, 0.07); DL.add(b); }
  function setOdo(Y) {
    const u = Y % 10, t10 = Math.floor(Y / 10), carry = Math.max(0, u - 9);
    const tens = (t10 % 10) + carry, hund = Math.floor(Y / 100) + (t10 % 10 === 9 ? carry : 0);
    const vals = [hund % 10, tens, u];
    vals.forEach((d, k) => { DIG[k].offset.y = 1 - (d + 1) / 11; });
  }

  // ---------- vegetation over the resting spot (grows with the years)
  const NG = 340;
  const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.045, 1, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), NG);
  grass.frustumCulled = false; grass.castShadow = false; grass.receiveShadow = true; scene.add(grass);
  const GSd = [];
  for (let i = 0; i < 2000 && GSd.length < NG; i++) {
    const x = -2.4 + rnd() * 5.0, z = 2.4 + rnd() * 4.0;
    if (Math.hypot((x - F.x) / 0.62, (z - F.z) / 0.52) < 1 || Math.hypot(x + 0.62, z - 5.2) < 0.35) continue;
    const nearB = Math.hypot(x - 0.95, z - 3.5) < 1.1;
    GSd.push({ x, z, h: nearB ? 0.04 + rnd() * 0.04 : 0.05 + rnd() * 0.1, th: rnd(), ry: rnd() * 6, lean: (rnd() - 0.5) * 0.5 });
  }
  const gcolA = new THREE.Color();
  for (let i = 0; i < NG; i++) { gcolA.setHSL(0.19 + rnd() * 0.07, 0.4, 0.3 + rnd() * 0.1); grass.setColorAt(i, gcolA); }
  const NV = 90;
  const vine = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ color: 0x5f8a3a, roughness: 0.7, flatShading: true }), NV);
  vine.frustumCulled = false; scene.add(vine);
  const VS = [];
  for (let i = 0; i < NV; i++) {
    const onStaff = i < 50, u = onStaff ? (i / 50) * 0.85 : ((i - 50) / 40) * 0.9;
    const P = onStaff ? staffA.clone().lerp(staffB, u) : V3(-1.4, u * 1.5, 3.0);
    const a = i * 2.4; P.x += Math.cos(a) * (onStaff ? 0.045 : 0.22); P.z += Math.sin(a) * (onStaff ? 0.045 : 0.22);
    VS.push({ P, th: u * 0.8 + rnd() * 0.15, ry: rnd() * 6 });
  }
  const NFw = 60;
  const flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: 0x332211 }), NFw);
  flowers.frustumCulled = false; scene.add(flowers);
  const FWS = [];
  for (let i = 0; i < NFw; i++) { const g = GSd[(i * 7) % GSd.length]; FWS.push({ g, c: [0xf2e070, 0xffffff, 0xd88ab0][i % 3] }); flowers.setColorAt(i, C(FWS[i].c)); }

  // ---------- particles
  const snowP = pts(scene, 900, { color: 0xffffff, size: 0.07, add: false, opacity: 0 });
  const SS = Array.from({ length: 900 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const petal = pts(scene, 260, { color: 0xf7b8cc, size: 0.07, add: false, opacity: 0 });
  const PS = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const leafP = pts(scene, 200, { color: 0xd88030, size: 0.08, add: false, opacity: 0 });
  const LS = Array.from({ length: 200 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const glint = pts(scene, 40, { color: 0xffffff, size: 0.05, add: true });
  const halo = pts(scene, 220, { color: 0xffd08a, size: 0.06, add: true });
  const HS = Array.from({ length: 220 }, () => [rnd(), rnd(), rnd(), rnd()]);
  const motes = pts(scene, 260, { color: 0xffe2a8, size: 0.03, add: true, opacity: 0.7 });
  const MS = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- camera: [t, px, py, pz, lx, ly, lz]
  const CK = [
    [0, -0.2, 2.1, 14.8, -2.3, 1.75, 6.9],
    [3.9, -0.4, 2.0, 13.6, -2.4, 1.75, 7.0],
    [5.5, -0.5, 2.0, 13.0, -2.3, 1.7, 6.8],
    [6.7, 0.6, 2.2, 9.8, 0.4, 0.5, 4.6],
    [8.5, 0.9, 2.1, 9.2, 0.7, 0.5, 4.2],
    [10.0, 0.6, 4.2, 13.5, 0.2, 1.8, -1.5],
    [12.0, 0.4, 5.0, 15.5, 0, 2.6, -5],
    [16.5, 1.2, 5.6, 5.5, 0, 3.4, -9],
    [20.0, -1.6, 5.2, 3.2, -0.2, 3.3, -9.5],
    [22.8, 1.1, 2.7, 11.6, 0.1, 1.1, 3.8],
    [26.5, 1.5, 2.5, 11.2, 0.25, 1.0, 3.8],
    [28.8, 1.2, 2.9, 11.8, 0, 1.2, 3.4],
    [31.0, 0.9, 4.0, 14.2, 0, 1.8, 0.8],
    [33.8, 0.6, 4.5, 15.2, 0, 2.0, 0],
    [36.0, -0.4, 2.0, 14.6, -2.4, 1.9, 7.0],
    [40.5, -0.6, 1.95, 14.0, -2.45, 1.9, 7.0],
    [43.6, -0.8, 1.9, 13.4, -2.5, 1.85, 7.0],
    [45.4, 0.45, 1.75, 8.1, 0.1, 0.2, 5.5],
    [47.6, 0.2, 1.6, 7.8, 0.0, 0.2, 5.4],
    [49.4, 1.5, 2.5, 7.6, 0.9, 0.3, 3.8],
    [51.6, 1.7, 2.3, 7.4, 0.9, 0.35, 3.6],
    [53.5, 1.9, 1.6, 8.6, 0.9, 1.2, 3.8],
    [56.0, 0.9, 1.5, 8.8, 0.8, 1.25, 3.8],
    [57.9, -0.2, 1.4, 8.5, 0.7, 1.2, 3.8],
    [60.8, 1.5, 1.3, 10.6, 0.2, 1.3, -3],
    [65.0, 1.9, 1.4, 10.8, 0.1, 1.35, -3],
    [69.0, 1.9, 2.4, 9.6, -0.8, 1.1, 3.4],
    [74.0, 1.5, 2.2, 9.0, -0.7, 1.0, 3.4],
    [77.5, -0.2, 0.85, 10.8, 0.6, 1.7, 0],
    [83.0, 0.0, 0.9, 10.0, 0.6, 1.75, 0],
    [K.dur, 0.1, 0.95, 9.7, 0.6, 1.8, 0],
  ];
  const camT = track(CK);
  const look = new THREE.Vector3();
  const sunC = new THREE.Color(), topC = new THREE.Color(), horC = new THREE.Color(), nightC = C(0x18203a);
  const cSum = C(0x5f7a3a), cAut = C(0xc9792e), cSpr = C(0x86a84a), cWin = C(0x6e6a5a);

  return (t) => {
    const Y = yearAt(t);
    const act = sm(Y / 3) * sm((100 - Y) / 3);
    const phase = ((Y / 100) * 6) % 1;
    const snow = bump(phase, 0.5, 0.2) * act, aut = bump(phase, 0.27, 0.2) * act, spr = bump(phase, 0.76, 0.2) * act;
    const V = ramp(Y, 6, 95);
    const uR = ramp(t, tReb, tReb + dReb);
    const wY = Y > 0.01 && Y < 99.99 ? Math.pow(Math.sin(Math.PI * Y / 100), 0.35) : 0;
    const wR = uR > 0 && uR < 1 ? Math.pow(Math.sin(Math.PI * uR), 0.35) : 0;
    const wT = Math.max(wY, wR * 0.8);
    const cyc = (Y / 100) * Math.PI * 2 * 8 + uR * Math.PI * 2 * 3;

    // ---- mood + racing sun
    mood(t);
    const amp = 48 + 14 * Math.cos(phase * Math.PI * 2);
    const az = mix(M.az, AZ0 + 75 * Math.sin(cyc), wT), el = mix(M.el, amp * Math.cos(cyc) - 10, wT);
    setDir(sunDir, az, el);
    const dayF = clamp01((el + 4) / 16);
    const night = (1 - dayF) * wT;
    sunC.copy(M.sc); topC.copy(M.top).lerp(nightC, night * 0.75); horC.copy(M.hor).lerp(C(0x4a4a60), night * 0.55);
    if (snow > 0) { topC.lerp(C(0x9fb0c8), snow * 0.4); horC.lerp(C(0xdfe4ea), snow * 0.5); }
    SU.uTop.value.copy(topC); SU.uHor.value.copy(horC); SU.uSun.value.copy(sunDir); SU.uSunC.value.copy(sunC); SU.uNight.value = night * 0.8;
    scene.fog.color.copy(horC); scene.fog.density = M.fog + snow * 0.01;
    trailM.opacity = 0.5 * wT;
    sunL.color.copy(sunC); sunL.intensity = M.si * (0.25 + 0.75 * dayF) * (1 - snow * 0.25);
    sunL.target.position.set(0, 0, -1); sunL.position.copy(sunDir).multiplyScalar(60).add(sunL.target.position);
    hemi.intensity = M.hi * (0.55 + 0.45 * dayF); hemi.color.copy(topC).lerp(C(0xffffff), 0.5);
    fillL.intensity = 0.35 + 0.2 * night;

    // ---- camera
    const c = camT(t);
    const hb = 0.03 * Math.sin(t * 0.4);
    cam.position.set(c[0] + hb, c[1] + 0.02 * Math.sin(t * 0.53), c[2]);
    look.set(c[3], c[4], c[5]); cam.lookAt(look);

    // ---- seasons on the tree and the ground
    canM.color.copy(cSum).lerp(cAut, aut).lerp(cSpr, spr).lerp(cWin, snow);
    const leaf = 1 - 0.55 * snow - 0.15 * aut;
    for (const cn of CAN) cn.m.scale.setScalar(0.45 + 0.55 * leaf);
    snowM.opacity = snow * 0.92;

    // ---- town: ruined until s6, then rebuilds stone by stone
    const RB = (k) => ramp(uR * (dReb + 1.6), k * 0.11, k * 0.11 + 0.9);
    for (const hs of HOUSES) {
      const R = RB(hs.k), sy = mix(hs.hr, 1, R);
      hs.walls.scale.y = sy;
      const top = hs.h * sy;
      hs.roof.position.set(mix(hs.tx * hs.w * 0.5, 0, R), mix(top * 0.45 + 0.08, top + 0.06, R), 0);
      hs.roof.rotation.set(mix(hs.tz, 0, R), 0, mix(hs.sx + (hs.tx > 0 ? -0.3 : 0.3), 0, R));
      if (hs.dome) { hs.dome.position.y = top + 0.12; hs.dome.scale.setScalar(Math.max(0.001, R)); hs.dome.visible = R > 0.01; }
    }
    for (const s of SEG) s.m.scale.y = mix(s.hr, 1, RB(s.k));
    for (let i = 0; i < NR; i++) {
      const s = RS[i], R = RB(s.k);
      const sc = Math.max(0.0001, s.s * (1 - R));
      fq.setFromEuler(new THREE.Euler(s.rx, s.ry, 0));
      fm.compose(tv.set(s.x, s.y + sc * 0.35, s.z), fq, fs.set(sc * 1.4, sc, sc)); rubble.setMatrixAt(i, fm);
    }
    rubble.instanceMatrix.needsUpdate = true;

    // ---- donkey: alive, decays with the years, reassembled in s6
    let fo, u, lift = 0, float = 0, glow = 0;
    if (t < K.s6 - 0.3) { fo = 1 - ramp(Y, 4, 16); u = 1 - ramp(Y, 17, 32); }
    else {
      fo = ramp(t, tFl0, tFl1);
      lift = ramp(t, tLift, tLift + 1.0);
      u = 0;
      float = 0.32 * ramp(t, tAsm0, tAsm1) * (1 - ramp(t, tAsm1 + 0.15, tAsm1 + 0.75));
      glow = Math.sin(Math.PI * ramp(t, tFl0 - 0.2, tFl1 + 0.4));
    }
    for (const m of [fleshM, lightM, darkM]) { m.opacity = fo; m.depthWrite = fo > 0.96; }
    fleshM.emissiveIntensity = lightM.emissiveIntensity = 0.5 * glow;
    for (const m of FL) { m.visible = fo > 0.005; m.castShadow = fo > 0.5; }
    DK.scale.setScalar(1);
    const fs2 = 0.94 + 0.06 * fo;
    for (const L of LEGS) L.scale.set(fs2, 1, fs2);
    BG.visible = fo < 0.995;
    boneM.emissiveIntensity = 0.35 * Math.sin(Math.PI * ramp(t, tLift, tAsm1 + 0.6)) * (t > K.s6 ? 1 : 0);
    for (const b of BONES) {
      let uu = u;
      if (t >= K.s6 - 0.3) uu = ramp(t, tAsm0 + b.lag, tAsm1 + b.lag * 0.6);
      const lifted = lift * (1 - uu);
      tv.copy(b.lP).lerp(b.aP, uu); tv.y += lifted * (0.9 + 0.25 * Math.sin(t * 1.7 + b.ph)) + float;
      fq.copy(b.lQ).slerp(b.aQ, uu);
      if (lifted > 0) { qTmp.setFromAxisAngle(b.spin, lifted * 0.8 * Math.sin(t * 1.1 + b.ph)); fq.premultiply(qTmp); }
      b.m.position.copy(tv); b.m.quaternion.copy(fq);
    }
    const alive = fo > 0.99 ? 1 : 0;
    headP.rotation.z = alive * (0.06 * Math.sin(t * 0.9) - 0.04 + (t > K.s8 ? 0.12 * ramp(t, K.s8, K.s8 + 3) : 0));
    earL.rotation.z = 0.35 + alive * 0.12 * Math.max(0, Math.sin(t * 2.3) - 0.6);
    earR.rotation.z = 0.35 + alive * 0.12 * Math.max(0, Math.sin(t * 1.7 + 1) - 0.6);
    tailP.rotation.x = alive * 0.25 * Math.sin(t * 1.6) * Math.max(0, Math.sin(t * 0.37));
    warmL.intensity = 3.5 * glow;
    // halo of warm motes around the body while it fills in, ivory sparks while the bones fly
    for (let i = 0; i < 220; i++) {
      const s = HS[i], a = s[0] * 6.283 + t * (0.6 + s[3]);
      const on = glow > 0.01 || (lift > 0.01 && t < tAsm1 + 0.6);
      const x = mix(-0.7, 0.9, s[1]), rr = 0.38 + 0.12 * s[2];
      halo.pos[i * 3] = DK.position.x - x; halo.pos[i * 3 + 1] = on ? 0.8 + float + Math.sin(a) * rr + 0.3 * lift * (s[3] - 0.5) : -99; halo.pos[i * 3 + 2] = DK.position.z + Math.cos(a) * rr;
      const b = Math.max(glow, 0.6 * Math.sin(Math.PI * ramp(t, tLift, tAsm1 + 0.6))) * (0.5 + 0.5 * Math.sin(t * 7 + s[0] * 40));
      halo.col[i * 3] = b; halo.col[i * 3 + 1] = b * 0.82; halo.col[i * 3 + 2] = b * 0.55;
    }
    halo.commit();

    // ---- dial
    hand.rotation.z = -(Y / 100) * Math.PI * 2;
    setOdo(Y);

    // ---- vegetation
    for (let i = 0; i < NG; i++) {
      const g = GSd[i], gr = sm((V - g.th * 0.7) / 0.3);
      const hh = Math.max(0.0001, g.h * gr * (1 - 0.5 * snow));
      fq.setFromEuler(new THREE.Euler(g.lean, g.ry, 0));
      fm.compose(tv.set(g.x, H(g.x, g.z) + hh * 0.5, g.z), fq, fs.set(gr > 0 ? 1 : 0.0001, hh, gr > 0 ? 1 : 0.0001)); grass.setMatrixAt(i, fm);
    }
    grass.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NV; i++) {
      const v = VS[i], gr = sm((V - v.th) / 0.15) * (1 - 0.4 * snow);
      fq.setFromEuler(new THREE.Euler(0.4, v.ry, 0.3));
      fm.compose(v.P, fq, fs.set(Math.max(0.0001, gr), Math.max(0.0001, gr * 0.5), Math.max(0.0001, gr))); vine.setMatrixAt(i, fm);
    }
    vine.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NFw; i++) {
      const g = FWS[i].g, gr = sm((V - 0.55) / 0.2) * (1 - snow);
      const sc = Math.max(0.0001, gr);
      fm.compose(tv.set(g.x, H(g.x, g.z) + g.h * sm((V - g.th * 0.7) / 0.3) + 0.01, g.z), fq.identity(), fs.set(sc, sc, sc)); flowers.setMatrixAt(i, fm);
    }
    flowers.instanceMatrix.needsUpdate = true;

    // ---- snow, petals, autumn leaves
    for (let i = 0; i < 900; i++) {
      const s = SS[i];
      snowP.pos[i * 3] = -9 + s[0] * 18 + 0.3 * Math.sin(t * 0.7 + s[3] * 9); snowP.pos[i * 3 + 2] = -12 + s[2] * 24;
      snowP.pos[i * 3 + 1] = snow > 0.02 ? 9 - ((t * 1.4 + s[1] * 9) % 9) : -99;
    }
    snowP.commit(); snowP.m.opacity = snow;
    for (let i = 0; i < 260; i++) {
      const s = PS[i], fall = (t * 0.5 + s[1] * 3) % 3;
      const a = s[0] * 6.283, rr = 1.6 * Math.sqrt(s[2]);
      petal.pos[i * 3] = -1.3 + Math.cos(a) * rr + 0.4 * Math.sin(t + s[3] * 9) * fall / 3; petal.pos[i * 3 + 2] = 3.0 + Math.sin(a) * rr * 0.9;
      petal.pos[i * 3 + 1] = spr > 0.02 ? (i % 2 ? 2.4 + s[3] * 1.4 : 3.2 - fall) : -99;
    }
    petal.commit(); petal.m.opacity = spr;
    for (let i = 0; i < 200; i++) {
      const s = LS[i], fall = (t * 0.6 + s[1] * 3.2) % 3.2;
      const a = s[0] * 6.283, rr = 2.2 * Math.sqrt(s[2]);
      leafP.pos[i * 3] = -1.3 + Math.cos(a) * rr + 0.5 * Math.sin(t * 1.3 + s[3] * 9); leafP.pos[i * 3 + 2] = 3.0 + Math.sin(a) * rr;
      leafP.pos[i * 3 + 1] = aut > 0.02 ? Math.max(0.03, 3.2 - fall) : -99;
    }
    leafP.commit(); leafP.m.opacity = aut;

    // ---- food glisten (fresh after 100 years)
    const gl = 0.25 + 0.75 * Math.max(ramp(t, A("s1:makanannya") - 0.3, A("s1:makanannya") + 0.4) * (1 - ramp(t, K.s1e - 0.6, K.s1e)), ramp(t, K.s5 - 0.3, K.s5 + 0.5) * (1 - ramp(t, A("s5:Tapi"), A("s5:Tapi") + 0.8)));
    for (let i = 0; i < 40; i++) {
      const m = GL[i % GL.length]; m.getWorldPosition(tv);
      const ph = (t * (1.3 + (i % 5) * 0.3) + i * 0.37) % 1;
      const b = gl * Math.pow(Math.max(0, Math.sin(ph * Math.PI)), 6);
      glint.pos[i * 3] = tv.x + ((i * 0.37) % 0.06 - 0.03); glint.pos[i * 3 + 1] = tv.y + 0.04 + ((i * 0.53) % 0.03); glint.pos[i * 3 + 2] = tv.z + ((i * 0.71) % 0.06 - 0.03);
      glint.col[i * 3] = b; glint.col[i * 3 + 1] = b; glint.col[i * 3 + 2] = b * 0.9;
    }
    glint.commit(); glint.m.size = 0.05 + 0.03 * gl;
    figM.clearcoat = grapeM.clearcoat = 0.6 + 0.4 * gl;

    // ---- dust motes around the look target
    const B = 2.2;
    for (let i = 0; i < 260; i++) {
      const s = MS[i];
      const wx = ((s[0] * B * 2 + t * 0.02 * (s[3] - 0.3) - look.x) % (B * 2) + B * 4) % (B * 2) - B;
      const wy = ((s[1] * B * 2 + t * 0.01 - look.y) % (B * 2) + B * 4) % (B * 2) - B;
      const wz = ((s[2] * B * 2 + t * 0.015 - look.z) % (B * 2) + B * 4) % (B * 2) - B;
      motes.pos[i * 3] = look.x + wx; motes.pos[i * 3 + 1] = Math.max(0.05, look.y + wy); motes.pos[i * 3 + 2] = look.z + wz;
      const tw = (0.35 + 0.35 * Math.sin(t * (1 + s[3] * 2) + s[0] * 30)) * dayF * (1 - snow);
      motes.col[i * 3] = tw; motes.col[i * 3 + 1] = tw * 0.85; motes.col[i * 3 + 2] = tw * 0.6;
    }
    motes.commit();

    bp.strength = 0.28 + 0.25 * glow + 0.15 * wT; bp.threshold = 0.86;
    comp.render();
  };
}
