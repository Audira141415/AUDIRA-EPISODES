// EP20 SYU'AIB, TIMBANGAN MADYAN. ISLAMICDOCUMENTARY: warm documentary cinematography of an ancient caravan market at
// golden hour. A paved street with 8-point-star tiles runs between striped market stalls, mud-brick houses with domes,
// a city gate with a pointed arch, and dusty mauve mountains. Dust motes hang in the low sun.
// Depiction: Nabi Syu'aib never appears. His presence is one honest balance scale on an indigo cloth, perfectly level,
// with an oil lamp, on a stone dais under an arch with an arabesque lattice. People of Madyan are faceless robed
// silhouettes (wrapped heads, no features). The punishment is a shockwave through dust over empty stalls (no bodies);
// the stalls then sink into sand. The saved believers are a procession of lantern lights leaving through the gate.
// World: street along z (x in -4.9..4.9), stalls at |x|=5.6, honest dais at (-8.25, 0.7, -6), cheating scale on the
// hero stall at (5.15, 0.9, 8), gate at z=-46. Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
// final dune shape (0..~1.2)
const duneShape = (x, z) => 0.62 * Math.pow(0.5 + 0.5 * Math.sin(0.21 * x + 0.9 * Math.sin(0.06 * z) + 0.35 * z * 0.05), 1.6) + 0.5 * fbm(x * 0.07 + 3, z * 0.07);
const DAIS = [-8.25, -6];
function sandMask(x, z, h, cap) {
  const r = Math.hypot(x - DAIS[0], z - DAIS[1]);
  const m = 1 - sm((r - 1.9) / 1.4);
  return h + (Math.min(h, cap) - h) * m;
}
const SAND_FINAL = (x, z) => sandMask(x, z, 0.22 + duneShape(x, z), 0.56);

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xe8b07a, fog: 0.006, exp: 1.0, bloom: [0.32, 0.55, 0.86], shadow: true });
  cam.near = 0.03; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(2020);
  const C = (h) => new THREE.Color(h);
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), fm = new THREE.Matrix4(), fm2 = new THREE.Matrix4(), fq = new THREE.Quaternion(), fs = new THREE.Vector3();
  const AY = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3(1, 0, 0);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();

  // ---------- timing
  const tHand0 = A("s1:timbangan") - 0.55, tPress = A("s1:sedikit") - 0.05, tTag = A("s1:sedikit#2");
  const tLamp = A("s2:Syu'aib") - 0.15;
  const tFill = A("s3:Penuhilah") - 0.2, tLevel = A("s3:adil") + 0.1;
  const tTurn = A("s4:Bagi") - 0.2, tLaugh0 = A("s4:apakah"), tLaugh1 = A("s4:Bagi") + 1.6;
  const tStone = A("s5:mengancam") + 0.1, tStoneDown = K.s6 + 0.6;
  const tLight = A("s6:berbuatlah"), tLeave = A("s6:Saat") - 0.6, tGone = A("s6:Yang") + 0.2;
  const tB = A("s6:suara") - 0.05, tSink = A("s6:seolah") - 0.4, tSand1 = K.s6e + 0.6;
  const BC = new THREE.Vector3(0, 0, -14);
  const waveR = (t) => (t < tB ? -1 : 72 * (1 - Math.exp(-(t - tB) * 1.15)));
  const hitT = (d) => (d >= 71.5 ? 1e9 : tB - Math.log(1 - d / 72) / 1.15);

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xf2d2a8, 0x6a4a30, 0.8); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffb766, 3); sunL.castShadow = true;
  sunL.shadow.mapSize.set(4096, 4096); sunL.shadow.bias = -0.0003; sunL.shadow.normalBias = 0.02;
  const SC = sunL.shadow.camera; SC.near = 1; SC.far = 400;
  scene.add(sunL); scene.add(sunL.target);
  const fillL = new THREE.DirectionalLight(0x8fa4c8, 0.35); scene.add(fillL);
  const lampL = new THREE.PointLight(0xffa04a, 0, 7, 1.5); scene.add(lampL);
  const keyL = new THREE.SpotLight(0xffc888, 0, 6, 0.6, 0.6, 1.2); keyL.position.set(3.6, 2.3, 7.2); keyL.target.position.set(5.15, 1.15, 7.95); scene.add(keyL); scene.add(keyL.target);
  const endL = new THREE.PointLight(0xffc890, 0, 3, 1.4); endL.position.set(-6.9, 1.15, -6.1); scene.add(endL);
  const latL = new THREE.PointLight(0xffb060, 0, 5, 1.6); latL.position.set(-9.2, 1.6, -6); scene.add(latL);

  // ---------- moods: [t, az, el, sunI, sunHex, hemiI, topHex, horHex, exp, fog, cloud]
  const MK = [
    [0, -18, 10, 3.0, 0xffb766, 0.78, 0x6f86a8, 0xf2b27a, 1.0, 0.006, 0.3],
    [K.s3, -16, 8.5, 2.9, 0xffad60, 0.78, 0x6a80a4, 0xf0a873, 1.0, 0.006, 0.32],
    [K.s4, -14, 7, 2.8, 0xffa458, 0.74, 0x5f7398, 0xee9f6c, 1.0, 0.0062, 0.35],
    [K.s5 + 0.5, -12, 4.5, 2.4, 0xff8a4a, 0.66, 0x4a5478, 0xe0875a, 1.0, 0.0066, 0.45],
    [K.s6, -12, 4, 2.3, 0xff8448, 0.64, 0x454e70, 0xd98256, 1.0, 0.0066, 0.5],
    [A("s6:Saat"), -12, 3.5, 1.5, 0xd88a5a, 0.55, 0x2f2c3c, 0x9a644a, 1.0, 0.007, 0.85],
    [tB, -12, 3.5, 1.3, 0xc8805a, 0.5, 0x2a2734, 0x8a5a44, 1.0, 0.0075, 0.9],
    [tB + 1.6, -12, 4, 1.4, 0xe0a070, 0.62, 0x5a4a44, 0xb98660, 1.0, 0.012, 0.6],
    [K.s6e, -12, 6, 1.9, 0xffc48a, 0.78, 0x8a7a70, 0xd9ad82, 1.0, 0.011, 0.3],
    [K.s7 + 1.2, -14, 12, 2.8, 0xffd09a, 0.85, 0x7f95b0, 0xf0c9a0, 1.0, 0.006, 0.18],
    [K.s7e, -30, 9, 2.7, 0xffb878, 0.8, 0x6a80a6, 0xf0b07c, 1.0, 0.006, 0.22],
    [K.s8 + 0.6, -70, 3.2, 2.6, 0xff8c48, 0.7, 0x3d4a74, 0xf08a52, 1.0, 0.005, 0.3],
    [K.dur, -72, 1.6, 2.3, 0xff7a3c, 0.62, 0x34406a, 0xe87a48, 1.0, 0.005, 0.32],
  ];
  const MC = MK.map((k) => k.map((v, j) => (j === 4 || j === 6 || j === 7 ? C(v) : v)));
  const M = { sc: new THREE.Color(), top: new THREE.Color(), hor: new THREE.Color() };
  const sunDir = new THREE.Vector3();
  function mood(t) {
    let i = 0; while (i < MC.length - 2 && MC[i + 1][0] <= t) i++;
    const a = MC[i], b = MC[i + 1];
    const u = sm((t - a[0]) / Math.max(0.001, b[0] - a[0]));
    const L = (j) => a[j] + (b[j] - a[j]) * u;
    M.az = L(1); M.el = L(2); M.si = L(3); M.sc.copy(a[4]).lerp(b[4], u); M.hi = L(5);
    M.top.copy(a[6]).lerp(b[6], u); M.hor.copy(a[7]).lerp(b[7], u); M.exp = L(8); M.fog = L(9); M.cl = L(10);
    const az = M.az * Math.PI / 180, el = M.el * Math.PI / 180;
    sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));
    return M;
  }

  // ---------- sky
  const SU = { uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() }, uCloud: { value: 0 }, uFlash: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 48, 24), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=(modelMatrix*vec4(position,1.)).xyz-cameraPosition;gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uHor,uSun,uSunC;uniform float uCloud,uFlash;varying vec3 vD;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec3 d=normalize(vD);float y=d.y;
 vec3 c=mix(uHor,uTop,smoothstep(-.02,.5,y));
 float g=max(dot(d,normalize(uSun)),0.);
 c+=uSunC*(pow(g,5.)*.28+pow(g,48.)*.55);
 c=mix(c,vec3(1.,.9,.72)*2.2,smoothstep(.99955,.99975,g));
 vec2 p=d.xz/max(.06,y+.1)*1.3;float cl=n(p)*.55+n(p*2.1+3.)*.3+n(p*4.7)*.15;
 cl=smoothstep(.42,.8,cl)*uCloud*smoothstep(-.01,.12,y)*(1.-smoothstep(.55,.9,y));
 vec3 cc=mix(uHor*.62,uSunC*1.25+uHor*.2,pow(g,3.));c=mix(c,cc,cl*.8);
 c=mix(c,uHor*.8,smoothstep(.0,-.08,y));
 c+=vec3(1.,.82,.58)*uFlash;
 gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // ---------- textures
  const sandTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#c79a64"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = rnd(); g.fillStyle = v < 0.5 ? "rgba(120,80,40,.10)" : "rgba(255,230,190,.10)"; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 1 + rnd() * 2); }
    g.strokeStyle = "rgba(110,72,38,.10)"; g.lineWidth = 3;
    for (let y = 0; y < h; y += 26) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 7 * Math.sin(x * 0.05 + y)); g.stroke(); }
  }, [40, 40]);
  const star = (g, cx, cy, R, rot = 0) => {
    g.beginPath();
    for (let k = 0; k < 16; k++) { const a = rot + k * Math.PI / 8 - Math.PI / 2, rr = k % 2 ? R * 0.7654 : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    g.closePath();
  };
  const tileTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#cfa676"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(90,60,30,.08)" : "rgba(255,240,210,.08)"; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    g.strokeStyle = "rgba(92,58,30,.55)"; g.lineWidth = 5;
    star(g, 128, 128, 92); g.stroke();
    g.fillStyle = "rgba(160,96,48,.35)"; star(g, 128, 128, 44); g.fill();
    g.beginPath(); for (const [x, y] of [[0, 0], [256, 0], [0, 256], [256, 256]]) { g.moveTo(x, y); g.lineTo(128 + (x - 128) * 0.42, 128 + (y - 128) * 0.42); } g.stroke();
    g.strokeStyle = "rgba(92,58,30,.35)"; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  }, [3, 26]);
  const clothTex = canvasTex(512, 360, (g, w, h) => {
    g.fillStyle = "#1f2d5a"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = y % 6 ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.08)"; g.fillRect(0, y, w, 1); }
    g.strokeStyle = "#c9973e"; g.lineWidth = 10; g.strokeRect(18, 18, w - 36, h - 36);
    g.lineWidth = 3; g.strokeRect(36, 36, w - 72, h - 72);
    for (let x = 60; x < w - 40; x += 44) { star(g, x, 27, 7); g.fillStyle = "#c9973e"; g.fill(); star(g, x, h - 27, 7); g.fill(); }
    g.strokeStyle = "rgba(201,151,62,.55)"; g.lineWidth = 4; star(g, w / 2, h / 2, 90); g.stroke(); star(g, w / 2, h / 2, 60, Math.PI / 8); g.stroke();
  });
  const AWN = [["#b8432e", "#f0dcb4"], ["#2f4f7a", "#e9d5aa"], ["#c98a2a", "#f3e2bc"], ["#5a6b3a", "#ead9b0"], ["#7a2f4a", "#efd9b6"]].map(([a, b]) => canvasTex(256, 256, (g, w, h) => {
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(0, i * h / 8, w, h / 8); }
    for (let i = 0; i < 1200; i++) { g.fillStyle = "rgba(60,30,10,.06)"; g.fillRect(rnd() * w, rnd() * h, 3, 1); }
    g.fillStyle = "rgba(0,0,0,.18)"; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 16, h - 14); g.lineTo(x + 32, h); g.fill(); }
  }));
  const awnM = AWN.map((tx) => new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9, side: THREE.DoubleSide }));

  // ---------- ground + street
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0xffffff, map: sandTex, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(9.8, 72), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.85 }));
  street.rotation.x = -Math.PI / 2; street.position.set(0, 0.006, -12); street.receiveShadow = true; scene.add(street);

  // ---------- materials
  const woodM = new THREE.MeshStandardMaterial({ color: 0x6b4428, roughness: 0.8 });
  const woodD = new THREE.MeshStandardMaterial({ color: 0x3e2716, roughness: 0.8 });
  const brassM = new THREE.MeshStandardMaterial({ color: 0xd9a649, roughness: 0.28, metalness: 0.9 });
  const brassD = new THREE.MeshStandardMaterial({ color: 0xa87a30, roughness: 0.35, metalness: 0.85 });
  const mudM = new THREE.MeshStandardMaterial({ color: 0xc08f5c, roughness: 0.95 });
  const mudL = new THREE.MeshStandardMaterial({ color: 0xd3a774, roughness: 0.95 });
  const stoneM = new THREE.MeshStandardMaterial({ color: 0xcfb08a, roughness: 0.9 });
  const sackM = new THREE.MeshStandardMaterial({ color: 0xb9955f, roughness: 0.95 });
  const clayM = new THREE.MeshStandardMaterial({ color: 0xa0542e, roughness: 0.85 });
  const grainM = new THREE.MeshStandardMaterial({ color: 0xe0b45a, roughness: 0.7 });
  const spiceM = [0xd98a1e, 0xb83a1e, 0x7a8a2e, 0xe8c24a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
  const stripeTex = canvasTex(128, 64, (g, w, h) => { const P = ["#8a2f24", "#e7d0a0", "#27406a", "#e7d0a0", "#b5782a"]; for (let i = 0; i < 10; i++) { g.fillStyle = P[i % 5]; g.fillRect(i * w / 10, 0, w / 10, h); } });
  const frontM = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.9, side: THREE.DoubleSide });
  const add = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; };

  // ---------- arch geometry: a wall with a pointed arch opening (single contour, no hole), in XY, extruded in z
  function archGeo(W, H, D, ow, oh) {
    const s = new THREE.Shape(), ys = oh - ow * 0.62;
    s.moveTo(-W / 2, 0); s.lineTo(-ow / 2, 0); s.lineTo(-ow / 2, ys);
    s.quadraticCurveTo(-ow / 2, ys + (oh - ys) * 0.78, 0, oh);
    s.quadraticCurveTo(ow / 2, ys + (oh - ys) * 0.78, ow / 2, ys);
    s.lineTo(ow / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2, H); s.lineTo(-W / 2, H); s.lineTo(-W / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false, curveSegments: 16 });
    g.translate(0, 0, -D / 2);
    return g;
  }
  const domeGeo = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);

  // ---------- stalls
  const STALLS = [];
  function stall(x, z, side, hero) {
    const G = new THREE.Group(); G.position.set(x, 0, z); if (side < 0) G.rotation.y = Math.PI; scene.add(G);
    add(new THREE.BoxGeometry(1.3, 0.86, 2.6), woodM, 0, 0.43, 0, G);
    add(new THREE.BoxGeometry(1.36, 0.05, 2.66), woodD, 0, 0.885, 0, G);
    const fr = add(new THREE.PlaneGeometry(2.5, 0.55), frontM, -0.665, 0.55, 0, G); fr.rotation.y = -Math.PI / 2;
    for (const [px, h] of [[-0.7, 2.2], [0.72, 2.62]]) for (const pz of [-1.28, 1.28]) add(new THREE.CylinderGeometry(0.035, 0.04, h, 8), woodD, px, h / 2, pz, G);
    const piv = new THREE.Group(); piv.position.set(0.72, 2.6, 0); piv.rotation.z = 0.27; G.add(piv);
    const ag = new THREE.PlaneGeometry(1.66, 2.86, 6, 1); ag.rotateX(-Math.PI / 2); ag.translate(-0.83, 0, 0);
    const pa = ag.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, -0.07 * Math.sin(Math.PI * (-pa.getX(i)) / 1.66));
    ag.computeVertexNormals();
    const aw = add(ag, awnM[Math.floor(rnd() * awnM.length)], 0, 0, 0, piv);
    // goods
    const goods = hero ? [[0.25, -0.85], [0.3, 0.9], [-0.1, 1.0]] : [[-0.3, -0.8], [0.25, -0.2], [-0.25, 0.5], [0.3, 0.95], [-0.2, -0.05]];
    for (const [gx, gz] of goods) {
      const k = rnd();
      if (k < 0.4) { add(new THREE.CylinderGeometry(0.17, 0.2, 0.34, 10), sackM, gx, 1.08, gz, G); add(new THREE.ConeGeometry(0.16, 0.12, 12), spiceM[Math.floor(rnd() * 4)], gx, 1.31, gz, G); }
      else if (k < 0.75) { add(new THREE.CylinderGeometry(0.2, 0.17, 0.12, 14), woodM, gx, 0.97, gz, G); add(new THREE.ConeGeometry(0.19, 0.17, 14), spiceM[Math.floor(rnd() * 4)], gx, 1.11, gz, G); }
      else { const j = add(new THREE.SphereGeometry(0.16, 12, 10), clayM, gx, 1.06, gz, G); j.scale.set(1, 1.3, 1); add(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 10), clayM, gx, 1.3, gz, G); }
    }
    const S = { G, piv, x, z, side, d: Math.hypot(x - BC.x, z - BC.z), k: rnd() };
    STALLS.push(S); return S;
  }
  const SZ = [18, 13.5, 8, 3.5, -1, -5.5, -10, -14.5, -19, -23.5, -28, -32.5, -37, -41.5];
  for (const z of SZ) stall(5.6, z, 1, z === 8);
  for (const z of SZ.map((v) => v - 1.6)) if (z < -10 || z > -2) stall(-5.6, z, -1, false);

  // ---------- buildings, domes, arcades, gate
  const BLD = [];
  function bld(x, z, w, d, h, opt = {}) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    add(new THREE.BoxGeometry(w, h, d), rnd() < 0.5 ? mudM : mudL, 0, h / 2, 0, G);
    add(new THREE.BoxGeometry(w + 0.2, 0.25, d + 0.2), mudL, 0, h + 0.12, 0, G);
    if (opt.dome) { add(new THREE.CylinderGeometry(opt.dome * 0.95, opt.dome * 0.95, 0.6, 24), mudL, opt.dx || 0, h + 0.5, opt.dz || 0, G); const dm = add(domeGeo, mudL, opt.dx || 0, h + 0.8, opt.dz || 0, G); dm.scale.set(opt.dome, opt.dome * 1.12, opt.dome); add(new THREE.ConeGeometry(0.12, 0.7, 8), brassD, opt.dx || 0, h + 0.8 + opt.dome * 1.12 + 0.3, opt.dz || 0, G); }
    if (opt.arcade) for (const az of [-1.6, 0, 1.6]) { const a = add(archGeo(1.6, h * 0.7, 0.5, 1.1, h * 0.55), mudL, opt.arcade * (w / 2 + 0.26), 0, az, G); a.rotation.y = Math.PI / 2; }
    BLD.push({ G, h, d: Math.hypot(x - BC.x, z - BC.z) }); return G;
  }
  for (const side of [-1, 1]) for (let z = 21; z > -44; z -= 5.6) {
    if (side < 0 && z < -1 && z > -12) continue;
    const w = 4 + rnd() * 2.5, h = 3 + rnd() * 3.6, d = 4 + rnd() * 1.4;
    bld(side * (9.0 + w / 2 + rnd() * 0.6), z + (rnd() - 0.5), w, d, h, { dome: rnd() < 0.4 ? 1.2 + rnd() * 0.8 : 0, arcade: rnd() < 0.35 ? -side : 0 });
    if (rnd() < 0.7) bld(side * (16.5 + rnd() * 5), z + rnd() * 2, 4 + rnd() * 3, 4 + rnd() * 2, 4 + rnd() * 5, { dome: rnd() < 0.45 ? 1.4 + rnd() : 0 });
  }
  // the alcove building behind the honest dais: dome over an arch with an arabesque lattice
  bld(-12.6, -6, 5.2, 6.4, 4.6, { dome: 2.3 });
  const alcove = add(archGeo(5.6, 4.7, 0.6, 2.4, 3.4), stoneM, -9.75, 0, -6, scene); alcove.rotation.y = Math.PI / 2;
  const latTex = canvasTex(512, 720, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 9; g.lineJoin = "round";
    for (let y = 0; y < h + 80; y += 96) for (let x = (y / 96) % 2 ? 48 : 0; x < w + 80; x += 96) { star(g, x, y, 44); g.stroke(); star(g, x, y, 20, Math.PI / 8); g.stroke(); }
    g.lineWidth = 4; for (let y = 0; y < h; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.lineWidth = 14; g.strokeRect(0, 0, w, h);
    // keep only the pointed arch shape
    g.globalCompositeOperation = "destination-in"; g.fillStyle = "#fff"; g.beginPath();
    const ys = h * (1 - 0.62 * 2.4 / 3.4); g.moveTo(0, h); g.lineTo(0, h - ys); g.quadraticCurveTo(0, (h - ys) * 0.22, w / 2, 0); g.quadraticCurveTo(w, (h - ys) * 0.22, w, h - ys); g.lineTo(w, h); g.fill();
  });
  const lattice = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.4), new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.7, alphaMap: latTex, alphaTest: 0.5, side: THREE.DoubleSide }));
  lattice.position.set(-9.78, 1.7, -6); lattice.rotation.y = Math.PI / 2; lattice.castShadow = true; scene.add(lattice);
  const glowM = new THREE.MeshBasicMaterial({ color: 0xffa050, transparent: true, opacity: 0.0, fog: false });
  const glowP = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.5), glowM); glowP.position.set(-10.02, 1.75, -6); glowP.rotation.y = Math.PI / 2; scene.add(glowP);
  const ALC = [alcove, lattice, glowP];
  // city gate
  const gate = new THREE.Group(); gate.position.set(0, 0, -47); scene.add(gate);
  add(archGeo(22, 9.5, 2.6, 5.2, 7.4), mudM, 0, 0, 0, gate);
  for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(2.2, 2.5, 12, 16), mudL, s * 12, 6, 0, gate); const dm = add(domeGeo, mudL, s * 12, 12, 0, gate); dm.scale.set(2.2, 2.0, 2.2); }
  for (let i = -5; i <= 5; i++) if (Math.abs(i) > 1) add(new THREE.BoxGeometry(0.9, 0.8, 2.8), mudL, i * 2, 9.9, 0, gate);
  BLD.push({ G: gate, h: 12, d: 33 });
  // mountains
  const mtM = new THREE.MeshStandardMaterial({ color: 0x8a6458, roughness: 1, flatShading: true });
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI * 0.95 + rnd() * Math.PI * 1.9, R = 170 + rnd() * 140, h = 26 + rnd() * 50;
    const m = new THREE.Mesh(new THREE.ConeGeometry(h * (1.1 + rnd() * 0.8), h, 6 + Math.floor(rnd() * 3)), mtM);
    m.position.set(Math.sin(a) * R, h / 2 - 4, -Math.cos(a) * R - 20); m.rotation.y = rnd() * 3; scene.add(m);
  }

  // ---------- balance scale builder (beam along z, needle up, pans hang on three cords)
  const L = 0.24, POST = 0.42, HANG = 0.2, PR = 0.085;
  const panGeo = new THREE.LatheGeometry([[0, 0], [PR * 0.55, 0.004], [PR * 0.88, 0.014], [PR, 0.026], [PR * 1.02, 0.028]].map(([a, b]) => new THREE.Vector2(a, b)), 32);
  function cord(p, a, b, mat) {
    const d = tv.copy(b).sub(a), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, len, 5), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(AY, d.normalize()); p.add(m); return m;
  }
  const cordM = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 });
  function makeScale(plateSide) {
    const G = new THREE.Group(); scene.add(G);
    add(new THREE.BoxGeometry(0.15, 0.03, 0.11), woodD, 0, 0.015, 0, G);
    add(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 16), brassD, 0, 0.045, 0, G);
    add(new THREE.CylinderGeometry(0.008, 0.011, POST, 10), brassM, 0, POST / 2 + 0.03, 0, G);
    add(new THREE.SphereGeometry(0.014, 12, 8), brassM, 0, POST + 0.075, 0, G);
    // index plate with a centre tick behind the needle
    const plate = add(new THREE.BoxGeometry(0.003, 0.03, 0.05), brassD, plateSide * 0.01, POST + 0.075, 0, G);
    add(new THREE.BoxGeometry(0.002, 0.024, 0.003), woodD, plateSide * 0.0115 - plateSide * 0.0015, POST + 0.078, 0, G);
    const beam = new THREE.Group(); beam.position.set(0, POST + 0.03, 0); G.add(beam);
    add(new THREE.BoxGeometry(0.012, 0.012, 2 * L), brassM, 0, 0, 0, beam);
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.011, 10, 8), brassM, 0, 0, s * L, beam);
    add(new THREE.BoxGeometry(0.004, 0.068, 0.006), brassD, -plateSide * 0.002, 0.04, 0, beam);
    const pans = [-1, 1].map((s) => {
      const P = new THREE.Group(); G.add(P);
      for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5; cord(P, new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * PR * 0.95, -HANG + 0.026, Math.sin(a) * PR * 0.95), cordM); }
      const pan = new THREE.Mesh(panGeo, brassM); pan.position.y = -HANG; pan.material.side = THREE.DoubleSide; pan.castShadow = true; P.add(pan);
      return P;
    });
    const S = { G, beam, pans, phi: 0 };
    S.set = (phi) => {
      S.phi = phi; beam.rotation.x = -phi;
      const py = POST + 0.03;
      pans[0].position.set(0, py - L * Math.sin(phi), -L * Math.cos(phi));
      pans[1].position.set(0, py + L * Math.sin(phi), L * Math.cos(phi));
    };
    S.set(0);
    return S;
  }
  function heap(P, n, rr, seed) {
    const rg = mulberry(seed);
    const g = new THREE.Mesh(new THREE.ConeGeometry(rr, rr * 0.42, 18), grainM); g.position.y = -HANG + 0.012 + rr * 0.21; g.castShadow = true; P.add(g);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0055, 6, 4), grainM, n);
    for (let i = 0; i < n; i++) { const a = rg() * 6.28, d = Math.sqrt(rg()) * rr; fm.compose(tv.set(Math.cos(a) * d, -HANG + 0.014 + (1 - d / rr) * rr * 0.42 + 0.003, Math.sin(a) * d), fq.setFromAxisAngle(AY, rg() * 6), fs.set(1, 0.6, 1.6)); im.setMatrixAt(i, fm); }
    im.castShadow = true; P.add(im); return [g, im];
  }
  function weights(P) {
    add(new THREE.CylinderGeometry(0.03, 0.032, 0.03, 18), brassD, 0.0, -HANG + 0.026, -0.01, P);
    add(new THREE.CylinderGeometry(0.02, 0.022, 0.022, 18), brassD, 0.0, -HANG + 0.052, -0.01, P);
    add(new THREE.CylinderGeometry(0.018, 0.02, 0.02, 18), brassD, 0.02, -HANG + 0.022, 0.035, P);
  }

  // hero (cheating) scale on the stall at (5.6, 0, 8)
  const HS = makeScale(1); HS.G.position.set(5.15, 0.91, 8);
  heap(HS.pans[0], 70, 0.06, 7); weights(HS.pans[1]);
  // a faceless merchant's hand (sleeve, fist, thumb) that slips its thumb onto the grain pan
  const skinM = new THREE.MeshStandardMaterial({ color: 0x8a5634, roughness: 0.62 });
  const sleeveM = new THREE.MeshStandardMaterial({ color: 0x2b3456, roughness: 0.9 });
  const hand = new THREE.Group(); hand.scale.setScalar(0.85); scene.add(hand);
  {
    const th = add(new THREE.CapsuleGeometry(0.0095, 0.038, 4, 10), skinM, 0.012, 0.024, 0, hand); th.rotation.z = 0.55;
    const palm = add(new THREE.SphereGeometry(1, 16, 12), skinM, 0.06, 0.058, 0.004, hand); palm.scale.set(0.046, 0.03, 0.04); palm.rotation.z = -0.3;
    for (let i = 0; i < 4; i++) { const f = add(new THREE.CapsuleGeometry(0.0092, 0.026, 4, 8), skinM, 0.036, 0.05, -0.03 + i * 0.019, hand); f.rotation.z = 1.25; }
    const sl = add(new THREE.CylinderGeometry(0.042, 0.048, 0.34, 14), sleeveM, 0.24, 0.13, 0.0, hand); sl.rotation.z = 1.05;
    const cuff = add(new THREE.TorusGeometry(0.043, 0.008, 6, 18), brassD, 0.1, 0.075, 0.0, hand); cuff.rotation.y = Math.PI / 2; cuff.rotation.x = 0.0; cuff.rotation.z = 0; cuff.rotation.set(0, Math.PI / 2, 0); cuff.rotateX(-0.52);
  }
  // "-1 butir" tag (subtle)
  const tagTex = canvasTex(320, 110, (g, w, h) => {
    g.fillStyle = "rgba(24,16,10,.82)"; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 14); g.fill();
    g.strokeStyle = "#d9a64a"; g.lineWidth = 3; g.stroke();
    g.fillStyle = "#f6e7c8"; g.font = "700 58px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("−1 butir", w / 2, h / 2 + 2);
  });
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthTest: false, fog: false }));
  tag.scale.set(0.085, 0.029, 1); tag.renderOrder = 5; scene.add(tag);

  // honest scale on the dais with cloth, lamp, measuring bowl and the stamped AUDIRA weight
  const dais = add(new THREE.BoxGeometry(2.4, 0.7, 3.4), stoneM, -8.25, 0.35, -6, scene);
  add(new THREE.BoxGeometry(0.6, 0.35, 3.0), stoneM, -6.75, 0.175, -6, scene);
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.88), new THREE.MeshStandardMaterial({ map: clothTex, roughness: 0.95 }));
  cloth.rotation.x = -Math.PI / 2; cloth.rotation.z = Math.PI / 2; cloth.position.set(-8.15, 0.704, -6); cloth.receiveShadow = true; scene.add(cloth);
  const ES = makeScale(-1); ES.G.position.set(-8.25, 0.705, -6.0);
  const [eHeap, eGrains] = heap(ES.pans[0], 60, 0.058, 11); weights(ES.pans[1]);
  const bowl = add(new THREE.CylinderGeometry(0.06, 0.045, 0.05, 18), woodM, -8.6, 0.73, -5.25, scene);
  const audTex = canvasTex(512, 200, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#d8a748"); gr.addColorStop(1, "#9c7028"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(60,36,10,.55)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "rgba(60,36,10,.82)"; g.font = "700 96px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 4);
    g.fillStyle = "rgba(255,236,180,.35)"; g.fillText("AUDIRA", w / 2 - 2, h / 2 + 1);
  });
  const audW = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.032, 0.085), [new THREE.MeshStandardMaterial({ map: audTex, roughness: 0.35, metalness: 0.75 }), brassD, brassD, brassD, brassD, brassD]);
  audW.position.set(-7.72, 0.721, -6.42); audW.rotation.y = 0.22; audW.castShadow = true; scene.add(audW);
  add(new THREE.SphereGeometry(0.009, 10, 8), brassD, -7.72, 0.742, -6.42, scene);
  // oil lamp
  const lampG = new THREE.Group(); scene.add(lampG);
  { const b = add(new THREE.SphereGeometry(1, 18, 12), clayM, 0, 0.022, 0, lampG); b.scale.set(0.055, 0.026, 0.04);
    const sp = add(new THREE.ConeGeometry(0.014, 0.06, 10), clayM, 0.05, 0.03, 0, lampG); sp.rotation.z = -1.35;
    add(new THREE.TorusGeometry(0.018, 0.005, 6, 14), clayM, -0.045, 0.03, 0, lampG).rotation.y = Math.PI / 2; }
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, fog: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.03, 10), flameM); flame.position.set(0.075, 0.052, 0); lampG.add(flame);
  const haloTex = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,200,120,1)"); gr.addColorStop(0.3, "rgba(255,150,60,.35)"); gr.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false }));
  halo.scale.set(0.16, 0.16, 1); halo.position.copy(flame.position); lampG.add(halo);
  const LAMP0 = new THREE.Vector3(-7.88, 0.705, -5.42);

  // s7: two abandoned scales half-buried in the sand (receive full / give less)
  const B1 = makeScale(1), B2 = makeScale(1);
  heap(B1.pans[0], 40, 0.06, 3); weights(B1.pans[1]); heap(B2.pans[0], 18, 0.035, 5); weights(B2.pans[1]);
  const BPOS = [[3.1, 6.55, 0.42, 0.16], [3.0, 8.75, -0.42, -0.12]];
  [B1, B2].forEach((S, i) => { const [x, z, phi, lean] = BPOS[i]; S.G.position.set(x, SAND_FINAL(x, z) - 0.14, z); S.G.rotation.set(lean, 0.25 - i * 0.5, lean * 0.6); S.set(phi); S.G.scale.setScalar(1.6); });

  // ---------- people: faceless robed silhouettes (instanced)
  const NF = 64;
  const robeGeo = new THREE.LatheGeometry([[0, 0], [0.27, 0], [0.25, 0.35], [0.2, 0.85], [0.18, 1.18], [0.22, 1.3], [0.15, 1.42], [0.07, 1.47], [0, 1.48]].map(([a, b]) => new THREE.Vector2(a, b)), 14);
  const robes = new THREE.InstancedMesh(robeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 }), NF);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.135, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), NF);
  const drapes = new THREE.InstancedMesh(new THREE.ConeGeometry(0.21, 0.42, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide }), NF);
  const armGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.56, 8); armGeo.translate(0, 0.28, 0);
  const arms = new THREE.InstancedMesh(armGeo, new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.9 }), 13);
  const stones = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.075, 0), new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 1 }), 13);
  for (const im of [robes, heads, drapes, arms, stones]) { im.frustumCulled = false; im.castShadow = true; scene.add(im); }
  const ROBE = [0x3b4a6b, 0x7a3b2e, 0xa8743a, 0x5a5a3c, 0x2e2a28, 0x8a6a4a, 0x4b3a5a, 0xb59a6e], WRAP = [0xd9c7a6, 0xefe6d2, 0xa8452f, 0x2f3a55, 0xc2a66e];
  const FIG = [];
  for (let i = 0; i < NF; i++) {
    robes.setColorAt(i, C(ROBE[Math.floor(rnd() * ROBE.length)])); { const wc = C(WRAP[Math.floor(rnd() * WRAP.length)]); heads.setColorAt(i, wc); drapes.setColorAt(i, wc); }
    const f = { k: rnd(), s: 0.95 + rnd() * 0.12 };
    if (i === 0) Object.assign(f, { type: "keep", x: 6.95, z: 7.3, yaw: -Math.PI / 2 });
    else if (i < 14) { const k = i - 1; Object.assign(f, { type: "crowd", ck: k, ix: -3.2 + rnd() * 6.4, iz: -13 + rnd() * 10, a: -0.95 + 1.9 * k / 12, r4: 5.0 + (k % 3) * 0.75, r5: 3.6 + (k % 3) * 0.55, dx: (rnd() - 0.5) * 18, dz: -16 + rnd() * 20 }); }
    else if (i < 38) Object.assign(f, { type: "walk", lane: (rnd() < 0.5 ? -1 : 1) * (1.0 + rnd() * 2.9), dir: rnd() < 0.5 ? -1 : 1, z0: rnd() * 66, v: 0.9 + rnd() * 0.5 });
    else { const S = STALLS[(i - 38) % STALLS.length]; if (S.x > 0 && Math.abs(S.z - 8) < 1) { f.type = "none"; } else { const lz = (rnd() - 0.5) * 1.4; Object.assign(f, { type: "keep", x: S.x + (S.side > 0 ? 0.95 : -0.95), z: S.z + lz * S.side, yaw: S.side > 0 ? -Math.PI / 2 : Math.PI / 2 }); } }
    FIG.push(f);
  }
  robes.instanceColor.needsUpdate = true; drapes.instanceColor.needsUpdate = true; heads.instanceColor.needsUpdate = true;
  const fadeHit = (x, z, t) => 1 - ramp(t, hitT(Math.hypot(x - BC.x, z - BC.z)) + 0.05, hitT(Math.hypot(x - BC.x, z - BC.z)) + 0.35);
  const P = { x: 0, z: 0, yaw: 0, bob: 0, s: 1, arm: 0, lean: 0 };
  function figState(f, i, t) {
    P.arm = 0; P.lean = 0; P.bob = 0; P.s = f.s;
    if (f.type === "none") { P.s = 0; return P; }
    if (f.type === "keep") { P.x = f.x; P.z = f.z; P.yaw = f.yaw + 0.25 * Math.sin(t * 0.4 + f.k * 9); P.bob = 0.008 * Math.sin(t * 1.3 + f.k * 5); }
    else if (f.type === "walk") {
      const span = 66, u = ((f.z0 + f.dir * f.v * t) % span + span) % span;
      P.z = 22 - u; P.x = f.lane + 0.2 * Math.sin(u * 0.3 + f.k * 6); P.yaw = f.dir > 0 ? Math.PI : 0;
      const ph = u / 0.75 * Math.PI; P.bob = Math.abs(Math.sin(ph)) * 0.035;
      const edge = sm(u / 3) * sm((span - u) / 3); P.s *= edge;
    } else {
      // crowd: idle in the street, gather facing the dais (s4), turn away laughing, return with stones (s5), disperse (s6)
      const ax = DAIS[0], az = DAIS[1];
      const ix = f.ix + 0.5 * Math.sin(t * 0.21 + f.k * 7), iz = f.iz + 0.6 * Math.cos(t * 0.17 + f.k * 5);
      const g4 = ramp(t, K.s4 - 1.6, K.s4 + 0.6), aw = ramp(t, tTurn, tTurn + 1.2), g5 = ramp(t, K.s5 - 1.0, K.s5 + 0.9), ds = ramp(t, K.s6 + 0.4, K.s6 + 3.4);
      const x4 = ax + f.r4 * Math.cos(f.a), z4 = az + f.r4 * Math.sin(f.a);
      const x4b = ax + (f.r4 + 2.6) * Math.cos(f.a * 1.1), z4b = az + (f.r4 + 2.6) * Math.sin(f.a * 1.1);
      const x5 = ax + f.r5 * Math.cos(f.a * 0.9), z5 = az + f.r5 * Math.sin(f.a * 0.9);
      let x = ix + (x4 - ix) * g4, z = iz + (z4 - iz) * g4;
      x += (x4b - x) * aw * (1 - g5); z += (z4b - z) * aw * (1 - g5);
      x += (x5 - x) * g5; z += (z5 - z) * g5;
      x += (f.dx - x) * ds; z += (f.dz - z) * ds;
      P.x = x; P.z = z;
      const face = Math.atan2(ax - x, az - z);
      const away = aw * (1 - g5);
      P.yaw = t < K.s4 - 1.6 ? (f.k * 6.28 + 0.3 * Math.sin(t * 0.3)) * (1 - g4) + face * g4 : face + Math.PI * sm(away * 1.05) * (f.ck % 2 ? 1 : -1);
      if (ds > 0) P.yaw = P.yaw + (Math.atan2(f.dx - x, f.dz - z) - P.yaw) * sm(ds * 3) * (1 - ds * 0);
      const moving = (g4 > 0 && g4 < 1) || (aw > 0 && aw < 1) || (g5 > 0 && g5 < 1) || (ds > 0 && ds < 1);
      P.bob = moving ? Math.abs(Math.sin(t * 7 + f.k * 4)) * 0.03 : 0;
      const lg = (t > tLaugh0 && t < tLaugh1 && f.ck % 3 !== 1) ? Math.abs(Math.sin(t * 15 + f.k * 9)) * 0.022 * sm((t - tLaugh0) / 0.4) * sm((tLaugh1 - t) / 0.5) : 0;
      P.bob += lg; P.lean = lg ? -0.08 : 0;
      P.arm = (f.ck % 4 !== 3) ? ramp(t, tStone + f.k * 0.5, tStone + f.k * 0.5 + 0.6) * (1 - ramp(t, tStoneDown, tStoneDown + 0.8)) : 0;
    }
    P.s *= fadeHit(P.x, P.z, t);
    return P;
  }

  // ---------- camels (caravan through the gate and up the street)
  const camelM = new THREE.MeshStandardMaterial({ color: 0xa4784a, roughness: 0.9 });
  const loadM = [0x8a2f24, 0x2f4f7a, 0xc98a2a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
  const CAM = [];
  for (let j = 0; j < 6; j++) {
    const G = new THREE.Group(); scene.add(G);
    const b = add(new THREE.SphereGeometry(1, 16, 12), camelM, 0, 1.55, 0, G); b.scale.set(0.95, 0.42, 0.38);
    const hp = add(new THREE.SphereGeometry(1, 14, 10), camelM, -0.05, 1.9, 0, G); hp.scale.set(0.42, 0.36, 0.3);
    const nk = add(new THREE.CylinderGeometry(0.11, 0.16, 0.85, 10), camelM, 1.08, 1.85, 0, G); nk.rotation.z = -0.75;
    const hd = add(new THREE.SphereGeometry(1, 12, 8), camelM, 1.42, 2.2, 0, G); hd.scale.set(0.26, 0.12, 0.11);
    for (const s of [-1, 1]) { const ld = add(new THREE.BoxGeometry(0.7, 0.42, 0.22), loadM[(j + (s > 0 ? 1 : 0)) % 3], -0.05, 1.62, s * 0.46, G); ld.rotation.x = s * 0.12; }
    const legs = [];
    for (const [lx, lz] of [[0.6, 0.2], [0.6, -0.2], [-0.6, 0.2], [-0.6, -0.2]]) { const pv = new THREE.Group(); pv.position.set(lx, 1.38, lz); G.add(pv); add(new THREE.CylinderGeometry(0.06, 0.045, 1.36, 8), camelM, 0, -0.68, 0, pv); legs.push(pv); }
    CAM.push({ G, legs, j });
  }

  // ---------- lantern procession (the saved believers: lights only)
  const lantern = pts(scene, 9, { color: 0xffb060, size: 0.55, add: true });
  const LPATH = [[-7.6, 1.15, -5.6], [-5.0, 1.25, -7.5], [-1.6, 1.25, -14], [-1.2, 1.3, -30], [-0.8, 1.4, -47], [-2, 1.6, -62], [-10, 2.5, -80]];
  const lpath = (u) => { u = clamp01(u) * (LPATH.length - 1); const i = Math.min(LPATH.length - 2, Math.floor(u)), f = u - i, a = LPATH[i], b = LPATH[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; };
  const LSLOT = Array.from({ length: 9 }, (_, i) => [Math.cos(i * 0.7 + 1) * (0.7 + i * 0.12), 0.95 + (i % 3) * 0.12, Math.sin(i * 0.7 + 1) * (0.7 + i * 0.12)]);

  // ---------- dust: motes near the look target, far motes, blast dust, grain stream
  const near = pts(scene, 380, { color: 0xffd8a0, size: 0.012, add: true, opacity: 0.9 });
  const far = pts(scene, 520, { color: 0xffd0a0, size: 0.16, add: true, opacity: 0.7 });
  const NB = 3200;
  const blast = pts(scene, NB, { color: 0xd8a878, size: 0.7, add: false, opacity: 0.4 });
  const stream = pts(scene, 70, { color: 0xe8bb5a, size: 0.012, add: false, opacity: 1 });
  const seeds = (n, s) => { const g = mulberry(s); return Array.from({ length: n }, () => [g(), g(), g(), g()]); };
  const nS = seeds(380, 31), fS = seeds(520, 37), bS = seeds(NB, 41), sS = seeds(70, 43);
  // shockwave ring + dust wall
  const ringTex = canvasTex(256, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,230,190,0)"); gr.addColorStop(0.55, "rgba(255,226,180,.7)"); gr.addColorStop(1, "rgba(255,210,160,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const ringM = new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 7, 96, 1, true), ringM); ring.position.set(BC.x, 3.2, BC.z); scene.add(ring);
  const wallTex = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(200,160,120,0)"); gr.addColorStop(0.5, "rgba(190,150,110,.55)"); gr.addColorStop(1, "rgba(170,130,90,.9)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const wallM = new THREE.MeshBasicMaterial({ map: wallTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const dwall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.04, 12, 96, 1, true), wallM); dwall.position.set(BC.x, 6, BC.z); scene.add(dwall);

  // ---------- dunes that bury the market (vertex heights recomputed only when the sand state changes)
  const DG = new THREE.PlaneGeometry(170, 170, 170, 170); DG.rotateX(-Math.PI / 2); DG.translate(0, 0, -10);
  const dpos = DG.attributes.position, DN = dpos.count, DX = new Float32Array(DN), DZ = new Float32Array(DN), DSH = new Float32Array(DN);
  for (let i = 0; i < DN; i++) { DX[i] = dpos.getX(i); DZ[i] = dpos.getZ(i); DSH[i] = duneShape(DX[i], DZ[i]); }
  const duneM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: sandTex, roughness: 0.97 });
  const dunes = new THREE.Mesh(DG, duneM); dunes.receiveShadow = true; dunes.castShadow = false; dunes.frustumCulled = false; scene.add(dunes);
  let duneKey = "";
  function setDunes(t) {
    const u = ramp(t, tSink, tSand1);
    const key = u.toFixed(4);
    dunes.visible = u > 0.0005;
    if (key === duneKey || !dunes.visible) return;
    duneKey = key;
    const R = -1.6 + 1.82 * u, amp = 0.4 + 0.6 * u;
    for (let i = 0; i < DN; i++) dpos.setY(i, sandMask(DX[i], DZ[i], R + DSH[i] * amp, 0.56));
    dpos.needsUpdate = true; DG.computeVertexNormals();
  }

  // ---------- camera
  const ESP = [-8.25, 1.12, -6.0];
  const camA = track([
    [0, 3.5, 1.32, 8.08, 5.15, 1.22, 8.0],
    [A("s1:perang"), 3.65, 1.3, 8.04, 5.15, 1.2, 7.96],
    [A("s1:timbangan"), 3.95, 1.28, 7.95, 5.17, 1.17, 7.86],
    [A("s1:sedikit"), 4.25, 1.25, 7.82, 5.19, 1.14, 7.79],
    [A("s1:setiap"), 4.1, 1.28, 7.9, 5.16, 1.15, 7.84],
    [K.s1e, 3.1, 2.0, 10.6, 4.4, 1.2, 7.4],
    [A("s2:ramai"), 1.6, 6.5, 22, 0.5, 1.6, -2],
    [A("s2:Nabi"), -0.5, 10.5, 33, -1.5, 1.2, -10],
    [A("s2:mereka"), -2.0, 5.2, 9, -7.6, 1.3, -6.5],
    [A("s2:sembahlah"), -4.4, 2.3, -3.2, -8.3, 1.1, -6.1],
    [A("s2:timbangan"), -6.0, 1.45, -5.0, -8.25, 0.98, -6.05],
    [K.s3 + 0.6, -6.45, 1.22, -5.95, -8.25, 1.08, -6.02],
    [tLevel, -6.6, 1.18, -5.85, -8.25, 1.06, -6.0],
    [A("s3:Sisa"), -6.7, 1.1, -6.35, -8.1, 0.98, -6.1],
    [A("s3:bagimu"), -6.45, 1.25, -6.25, -8.2, 1.05, -6.0],
    [A("s3:surah"), -5.6, 1.7, -4.9, -8.6, 1.35, -6.1],
    [K.s3e, -6.3, 1.6, -4.5, -8.25, 1.05, -6.0],
    [K.s4 + 0.6, -8.4, 1.6, -4.4, -5.0, 0.95, -6.6],
    [tTurn, -8.6, 1.55, -4.7, -4.6, 0.95, -6.4],
    [tTurn + 1.6, -6.0, 2.2, 0.5, -4.6, 1.0, -7.6],
    [K.s4e, -3.5, 3.0, 3.5, -6.0, 1.0, -7.2],
    [K.s5 + 0.5, -8.7, 1.0, -7.4, -4.4, 1.35, -5.6],
    [A("s5:merajammu"), -8.75, 0.95, -7.2, -4.6, 1.4, -5.8],
    [A("s5:Syu'aib"), -6.9, 1.3, -5.2, -8.25, 0.98, -6.0],
    [A("s5:Allah"), -6.6, 1.35, -5.2, -8.15, 0.95, -5.9],
    [K.s6 + 1.0, -6.1, 1.5, -4.7, -8.1, 0.95, -5.8],
    [A("s6:tunggulah"), -5.0, 2.6, -2.2, -7.8, 1.0, -6.4],
    [tLeave + 0.9, 2.5, 13, 20, -1.5, 0.5, -16],
    [A("s6:diselamatkan"), 3.0, 15, 23, -1.0, 1.0, -28],
    [tB - 0.2, 4.0, 15.5, 27, 0, 1.5, -18],
    [tB + 1.5, 4.5, 14, 29, 0, 2.0, -14],
    [A("s6:tinggal"), 4.0, 9.5, 24, 0, 0.8, -8],
    [K.s6e, 3.0, 5.5, 18, 1.5, 0.6, 2],
    [K.s7 + 0.9, -0.5, 2.3, 9.4, 3.0, 1.95, 7.6],
    [A("s7:Minta"), -1.0, 2.3, 8.4, 3.0, 1.7, 7.6],
    [K.s7e - 0.4, -1.8, 2.45, 7.6, 3.0, 1.6, 7.8],
    [K.s8 + 0.3, -1.0, 3.6, -1.5, -8.25, 0.8, -6.2],
    [A("s8:pekerjaanmu"), -4.6, 1.7, -4.0, -8.25, 0.95, -6.1],
    [A("s8:Kisah") - 1.4, -6.6, 1.2, -6.0, -8.15, 0.9, -6.1],
    [A("s8:Kisah") + 0.2, -7.22, 0.86, -6.36, -7.8, 0.75, -6.4],
    [K.dur, -7.26, 0.85, -6.44, -7.8, 0.75, -6.42],
  ]);
  const look = new THREE.Vector3();

  return (t) => {
    const c = camA(t);
    const qk = ramp(t, tB - 0.05, tB + 0.1) * (1 - ramp(t, tB + 0.4, tB + 2.8));
    const shx = qk * (Math.sin(t * 43) * 0.35 + Math.sin(t * 27.3 + 1) * 0.25), shy = qk * (Math.sin(t * 39 + 2) * 0.25 + Math.sin(t * 19.1) * 0.15);
    const dist = Math.hypot(c[0] - c[3], c[1] - c[4], c[2] - c[5]);
    const dr = Math.min(1, dist / 6) * 0.08;
    cam.position.set(c[0] + Math.sin(t * .29) * dr + shx, c[1] + Math.sin(t * .23) * dr * 0.6 + shy, c[2] + Math.cos(t * .31) * dr);
    look.set(c[3] + shx * 0.5, c[4] + shy * 0.5, c[5]); cam.lookAt(look);

    // mood
    const m = mood(t);
    const flash = t >= tB ? Math.exp(-(t - tB) * 4.5) * ramp(t, tB, tB + 0.04) : 0;
    SU.uTop.value.copy(m.top); SU.uHor.value.copy(m.hor); SU.uSun.value.copy(sunDir); SU.uSunC.value.copy(m.sc); SU.uCloud.value = m.cl; SU.uFlash.value = flash * 1.6;
    sky.position.copy(cam.position);
    scene.background.copy(m.hor); scene.fog.color.copy(m.hor).multiplyScalar(0.92); scene.fog.density = m.fog * Math.max(0.35, Math.min(1, dist / 4));
    r.toneMappingExposure = m.exp * (1 + flash * 1.4);
    hemi.intensity = m.hi; hemi.color.copy(m.top).lerp(m.sc, 0.5);
    sunL.color.copy(m.sc); sunL.intensity = m.si + flash * 3;
    const ext = Math.max(1.2, Math.min(70, dist * 0.75 + 0.8));
    sunL.target.position.copy(look); sunL.position.copy(look).addScaledVector(sunDir, 160);
    if (SC.right !== ext) { SC.left = -ext; SC.right = ext; SC.top = ext; SC.bottom = -ext; SC.updateProjectionMatrix(); }
    fillL.position.set(-sunDir.x * 50, 30, -sunDir.z * 50); fillL.target.position.copy(look);

    endL.intensity = 1.6 * ramp(t, K.s8, K.s8 + 2);
    keyL.intensity = 9 * (1 - ramp(t, K.s1e, K.s1e + 1.2));
    // cheating scale + hand (s1)
    const press = ramp(t, tPress, tPress + 0.5);
    HS.set(0.075 * press + 0.004 * Math.sin(t * 2.1) * (1 - press));
    tv.copy(HS.pans[0].position).add(HS.G.position); // cord top of grain pan
    const rimY = tv.y - HANG + 0.028;
    const hin = eout(clamp01((t - tHand0) / 0.85));
    hand.visible = t > tHand0 - 0.05 && t < K.s6;
    hand.position.set(tv.x + PR * 0.78 + (1 - hin) * 0.28, rimY + 0.004 + (1 - hin) * 0.2 + (1 - press) * 0.012 * hin, tv.z - 0.005 - (1 - hin) * 0.08);
    hand.rotation.set(0, 0, 0.05);
    tag.visible = false;
    tag.material.opacity = ramp(t, tTag, tTag + 0.35) * (1 - ramp(t, K.s1e - 0.2, K.s1e + 0.3)) * 0.92;
    tag.position.set(tv.x - 0.02, rimY + 0.085, tv.z - 0.09);

    // honest scale: level and still; at s3 grain fills the pan and the beam swings, then settles exactly level
    let ephi = 0;
    if (t < tFill) ephi = -0.11;
    else if (t < tLevel) { const u = t - tFill, span = tLevel - tFill; ephi = -0.11 * Math.exp(-u * 1.1) * Math.cos(u * 4.2) * (1 - sm(u / span)); }
    ES.set(ephi);
    const fillU = ramp(t, tFill, tFill + 1.4);
    eHeap.scale.setScalar(Math.max(0.001, 0.25 + 0.75 * fillU)); eGrains.visible = fillU > 0.7;
    // grain stream into the pan
    tv2.copy(ES.pans[0].position).add(ES.G.position);
    for (let i = 0; i < 70; i++) {
      const s = sS[i], ph = ((t - tFill) * 1.4 + s[0]) % 1;
      const on = t > tFill && t < tFill + 1.3 + s[0] * 0.3;
      stream.pos[i * 3] = tv2.x + (s[1] - 0.5) * 0.02; stream.pos[i * 3 + 1] = on ? tv2.y - HANG + 0.05 + (1 - ph) * 0.42 : -99; stream.pos[i * 3 + 2] = tv2.z + (s[2] - 0.5) * 0.02;
    }
    stream.commit();

    // lamp: lit when Syu'aib is sent (s2); carried away with the believers' lights in s6
    const lit = ramp(t, tLamp, tLamp + 0.6);
    const lu = ramp(t, tLeave, tGone);
    const lp = lpath(lu);
    const lift = ramp(t, tLeave - 0.6, tLeave);
    lampG.position.set(LAMP0.x + (lp[0] - LAMP0.x) * lift, LAMP0.y + (lp[1] - LAMP0.y) * lift, LAMP0.z + (lp[2] - LAMP0.z) * lift);
    lampG.rotation.y = 0.3;
    const flick = 0.86 + 0.14 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
    flameM.opacity = lit; flame.scale.set(1, flick * 1.1, 1); halo.material.opacity = lit * 0.85 * flick; halo.scale.setScalar(0.14 + 0.5 * lift);
    lampL.position.copy(lampG.position).y += 0.12; lampL.intensity = 2.2 * lit * flick * (1 + 2 * lift);
    lampG.visible = t < tGone + 0.5;
    latL.intensity = 3.0 * lit * (1 - ramp(t, tLeave, tLeave + 1.5)) * flick; glowM.opacity = 0.55 * lit * (1 - ramp(t, tLeave, tLeave + 1.5)) * (0.9 + 0.1 * flick);
    // lanterns appear around the dais, then follow the lamp out through the gate
    const lOn = ramp(t, tLight, tLight + 2.2);
    for (let i = 0; i < 9; i++) {
      const ap = ramp(t, tLight + i * 0.22, tLight + i * 0.22 + 0.5);
      const uu = ramp(t, tLeave + 0.15 * i, tGone + 0.15 * i), q = lpath(uu * 0.98);
      const sx = LSLOT[i];
      const x0 = DAIS[0] + 1.6 + sx[0], z0 = DAIS[1] + sx[2];
      const w = ramp(t, tLeave + 0.15 * i - 0.4, tLeave + 0.15 * i + 0.4);
      const x = x0 + (q[0] - 0.6 - i * 0.25 - x0) * w + Math.sin(t * 2 + i) * 0.05, z = z0 + (q[2] + i * 0.7 - z0) * w;
      lantern.pos[i * 3] = x; lantern.pos[i * 3 + 1] = (ap * lOn > 0.01 && t < tGone + 1.5) ? sx[1] + Math.sin(t * 3 + i) * 0.03 : -99; lantern.pos[i * 3 + 2] = z;
      const b = ap * (1 - ramp(t, tGone, tGone + 1.2)) * (0.85 + 0.15 * Math.sin(t * 11 + i * 3));
      lantern.col[i * 3] = b; lantern.col[i * 3 + 1] = b * 0.7; lantern.col[i * 3 + 2] = b * 0.36;
    }
    lantern.commit(); lantern.m.size = 0.2 + 1.5 * ramp(t, tLeave - 0.5, tLeave + 1.5);

    // stalls: awnings snap in the shockwave, then everything sinks into the sand
    for (const S of STALLS) {
      const ht = hitT(S.d), bl = t > ht ? Math.exp(-(t - ht) * 1.6) * ramp(t, ht, ht + 0.08) : 0;
      S.piv.rotation.z = 0.27 - 0.75 * bl * (0.8 + 0.4 * Math.sin((t - ht) * 22 + S.k * 9)) + 0.02 * Math.sin(t * 1.3 + S.k * 7);
      const su = ramp(t, tSink + S.k * 1.2, tSink + S.k * 1.2 + 2.2);
      S.G.position.y = -3.2 * su; S.G.visible = su < 0.999;
    }
    for (const B of BLD) { const su = ramp(t, tSink + 0.3 + B.d * 0.02, tSand1 + 0.4); B.G.position.y = -(B.h + 1.2) * su * 0.92; B.G.visible = su < 0.999; }
    const asu = ramp(t, tSink + 0.4, tSand1); for (const o of ALC) o.position.y = (o === alcove ? 0 : o === lattice ? 1.7 : 1.75) - 5 * asu;
    street.visible = t < tSand1;
    setDunes(t);
    const showB = t > K.s6e - 0.6; B1.G.visible = B2.G.visible = showB;
    bowl.visible = true;

    // figures
    for (let i = 0; i < NF; i++) {
      const p = figState(FIG[i], i, t);
      const s = Math.max(0.0001, p.s);
      qa.setFromAxisAngle(AY, p.yaw); qb.setFromAxisAngle(AX, p.lean); fq.copy(qa).multiply(qb);
      fm.compose(tv.set(p.x, p.bob, p.z), fq, fs.set(s, s, s)); robes.setMatrixAt(i, fm);
      fm2.compose(tv2.set(0, 1.6, 0.0), qb.identity(), fs.set(1, 1.1, 1)); fm2.premultiply(fm); heads.setMatrixAt(i, fm2);
      fm2.compose(tv2.set(0, 1.5, -0.02), qb.identity(), fs.set(1, 1, 1)); fm2.premultiply(fm); drapes.setMatrixAt(i, fm2);
      const f = FIG[i];
      if (f.type === "crowd") {
        const a = p.arm, sc = a > 0.01 ? s : 0.0001;
        fm2.compose(tv2.set(0.19, 1.32, 0.02), qb.setFromAxisAngle(AX, -0.2 + (Math.PI - 0.55) * a), fs.set(sc, sc, sc)); fm2.premultiply(fm); arms.setMatrixAt(f.ck, fm2);
        tv2.set(0, 0.6, 0).applyMatrix4(fm2); fm2.compose(tv2, qb.identity(), fs.setScalar(a > 0.3 ? s : 0.0001)); stones.setMatrixAt(f.ck, fm2);
      }
    }
    robes.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true; drapes.instanceMatrix.needsUpdate = true; arms.instanceMatrix.needsUpdate = true; stones.instanceMatrix.needsUpdate = true;

    // camels
    for (const Cm of CAM) {
      const d = Math.min(t * 0.95, 36), zc = -54 + d - Cm.j * 3.4, xc = 1.7 + 0.25 * Math.sin(zc * 0.2);
      const walking = t * 0.95 < 36;
      Cm.G.position.set(xc, 0, zc); Cm.G.rotation.y = -Math.PI / 2;
      const ph = (t * 0.95) / 1.5 * Math.PI * 2;
      Cm.legs.forEach((lg, k) => { lg.rotation.z = walking ? Math.sin(ph + (k % 2 ? Math.PI : 0) + (k > 1 ? 0.6 : 0)) * 0.32 : 0; });
      const s = fadeHit(xc, zc, t); Cm.G.scale.setScalar(Math.max(0.0001, s)); Cm.G.visible = s > 0.001;
      Cm.G.position.y = walking ? Math.abs(Math.sin(ph)) * 0.04 : 0;
    }

    // shockwave
    const W = waveR(t), age = t - tB;
    ring.visible = dwall.visible = age > 0 && age < 4;
    if (ring.visible) {
      ring.scale.set(W, 1 + age * 0.4, W); ringM.opacity = 0.9 * Math.exp(-age * 1.2);
      dwall.scale.set(W * 0.97, 1 + age * 0.25, W * 0.97); wallM.opacity = 0.75 * (1 - ramp(age, 1.2, 3.8));
    }
    // blast dust: rises where the wave passes, lingers, settles before s7
    const settle = 1 - ramp(t, K.s6e - 1.0, K.s7 + 1.4);
    for (let i = 0; i < NB; i++) {
      const s = bS[i], a = s[0] * 6.283, r0 = 3 + Math.sqrt(s[1]) * 62, ht = hitT(r0);
      const la = t - ht;
      let x = 0, y = -99, z = 0, b = 0;
      if (la > 0 && settle > 0) {
        const rr = r0 + 7 * (1 - Math.exp(-la * 1.4)) + la * 0.5;
        x = BC.x + Math.cos(a) * rr; z = BC.z + Math.sin(a) * rr; y = 0.2 + s[2] * 7 * (1 - Math.exp(-la * 1.8)) + la * 0.25 * s[3];
        b = Math.min(1, la * 4) * settle;
      }
      blast.pos[i * 3] = x; blast.pos[i * 3 + 1] = b > 0.01 ? y : -99; blast.pos[i * 3 + 2] = z;
      const cc = 0.48 + 0.14 * s[3]; blast.col[i * 3] = cc; blast.col[i * 3 + 1] = cc * 0.8; blast.col[i * 3 + 2] = cc * 0.62;
    }
    blast.commit(); blast.m.opacity = 0.4 * settle;

    // motes around the look target (near) and over the whole scene (far)
    const B = Math.max(0.6, Math.min(3, dist * 0.7));
    for (let i = 0; i < 380; i++) {
      const s = nS[i];
      const wx = ((s[0] * B * 2 + t * 0.012 * (s[3] - 0.3) - look.x) % (B * 2) + B * 4) % (B * 2) - B;
      const wy = ((s[1] * B * 2 + t * 0.006 * (s[2] - 0.4) - look.y) % (B * 2) + B * 4) % (B * 2) - B;
      const wz = ((s[2] * B * 2 + t * 0.01 - look.z) % (B * 2) + B * 4) % (B * 2) - B;
      near.pos[i * 3] = look.x + wx; near.pos[i * 3 + 1] = Math.max(0.05, look.y + wy); near.pos[i * 3 + 2] = look.z + wz;
      const tw = 0.5 + 0.5 * Math.sin(t * (1 + s[3] * 2) + s[0] * 30);
      near.col[i * 3] = tw; near.col[i * 3 + 1] = tw * 0.82; near.col[i * 3 + 2] = tw * 0.55;
    }
    near.commit(); near.m.size = 0.004 + B * 0.004;
    for (let i = 0; i < 520; i++) {
      const s = fS[i];
      far.pos[i * 3] = -30 + s[0] * 60 + Math.sin(t * 0.1 + s[3] * 9) * 1.5; far.pos[i * 3 + 1] = 0.3 + s[1] * 9 + Math.sin(t * 0.13 + s[2] * 7) * 0.4; far.pos[i * 3 + 2] = -45 + s[2] * 70 + t * 0.05;
      const tw = 0.4 + 0.3 * Math.sin(t * 0.8 + s[0] * 20); far.col[i * 3] = tw; far.col[i * 3 + 1] = tw * 0.8; far.col[i * 3 + 2] = tw * 0.55;
    }
    far.commit();

    bp.strength = 0.32 + flash * 1.2; bp.threshold = 0.86;
    comp.render();
  };
}
