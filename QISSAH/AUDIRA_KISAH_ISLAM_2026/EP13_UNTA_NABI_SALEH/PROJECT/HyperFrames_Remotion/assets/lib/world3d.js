// EP13 UNTA NABI SALEH. URBANFORGE: a white architectural maquette of a sandstone valley city (Tsamud) on a base plate,
// contour-cut cliffs with rock-cut facades, palm groves, gardens and one spring/well with a two-day turn dial.
// A moving sun rakes crisp architectural shadows across the model. s7 moves to a plaster survey map plinth (HISTORYMAP inset).
// Depiction: Nabi Saleh never appears; his presence is a staff planted by the well and a lit lamp at one doorway.
// People are faceless maquette scale figures (lathe pieces). The camel is never shown being harmed: the camera turns to the
// sunset while it happens off-screen; afterwards its place by the well is empty and the dial stops. No bodies in the quake.
// World: plate top y=0, x -50..50, z -45..35. Valley floor between the cliffs |x| < xc(z); back cliff at z < zb(x).
// Well at (0,0,4), dial at (3,0,3). Map plinth centred (70,0,-5). Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s; }
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

const xc = (z) => 15 + 1.4 * Math.sin(z * 0.13 + 0.6) + 0.6 * Math.sin(z * 0.31 + 2);
const xcD = (z) => 1.4 * 0.13 * Math.cos(z * 0.13 + 0.6) + 0.6 * 0.31 * Math.cos(z * 0.31 + 2);
const zb = (x) => -28 + 1.5 * Math.sin(x * 0.17 + 1) + 0.8 * Math.sin(x * 0.41);

export function H(x, z) {
  const ax = Math.abs(x);
  const side = sm((ax - xc(z)) / 0.9) * (1 - sm((z - 17) / 15));
  const backC = sm((zb(x) - z) / 0.9);
  const c = Math.max(side, backC);
  const top = 13.5 + 6 * fbm(x * 0.05 + 7, z * 0.05) + Math.max(0, ax - 24) * 0.08;
  let h = c * top;
  const e = sm((49 - ax) / 4) * sm((z + 44) / 4) * sm((34 - z) / 4);
  return h * e;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xf0e9dc, fog: 0.0035, exp: 1.12, bloom: [0.12, 0.4, 0.96], shadow: true });
  r.shadowMap.type = THREE.PCFShadowMap;
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const rnd = mulberry(1307);
  const C = (h) => new THREE.Color(h);
  const tv = new THREE.Vector3(), tv2 = new THREE.Vector3(), fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fs = new THREE.Vector3(), fe = new THREE.Euler();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion();
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);

  // ---------- timing
  const tQ = A("s6:gempa"), tFall0 = A("s6:Rumah-rumah") - 0.1, tFall1 = A("s6:reruntuhan") + 0.6;
  const tCamE = A("s4:Datanglah") + 0.1, tWalk0 = A("s4:Allah") - 0.3, tWalk1 = A("s4:Jangan") - 0.1;
  const tGone = A("s5:unta") + 0.25, tStop = A("s5:disembelih");
  const WELL = new THREE.Vector3(0, 0, 4), DIAL = new THREE.Vector3(3.0, 0, 3.0);

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xdfe6ee, 0x8a7a66, 0.9); scene.add(hemi);
  const sunL = new THREE.DirectionalLight(0xffffff, 2.6); sunL.castShadow = true;
  sunL.shadow.mapSize.set(4096, 4096); sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03;
  const SC = sunL.shadow.camera; SC.near = 1; SC.far = 320;
  scene.add(sunL); scene.add(sunL.target);
  const lampL = new THREE.PointLight(0xffa850, 0, 16, 1.6); scene.add(lampL);
  const glowL = new THREE.PointLight(0xffe2b0, 0, 14, 1.4); scene.add(glowL);

  // ---------- moods: [t, az, el, sunI, sunHex, hemiI, topHex, botHex, exp]
  const sA = A("s1:sehari"), sB = A("s1:sehari#2");
  const MK = [
    [0, 32, 16, 2.4, 0xffe0b4, 0.85, 0xbfd2df, 0xf2e8d6, 1.0],
    [sA, 20, 5, 2.0, 0xffc088, 0.8, 0x9fb4cc, 0xf0c8a0, 1.0],
    [sA + 0.8, 90, 62, 2.9, 0xfff3e2, 0.95, 0xb2cde0, 0xf4eee2, 1.0],
    [sB - 0.14, 160, 5, 1.8, 0xff9858, 0.75, 0x6e7fa0, 0xefb488, 1.0],
    [sB - 0.02, 162, 3, 0.4, 0x9fb4e0, 0.55, 0x2e3a58, 0x8c8fa6, 1.0],
    [sB + 0.12, 20, 4, 1.8, 0xffb070, 0.8, 0x7488a8, 0xf2bc8e, 1.0],
    [sB + 0.95, 88, 60, 2.9, 0xfff3e2, 0.95, 0xb2cde0, 0xf4eee2, 1.0],
    [K.s2, 112, 50, 2.8, 0xfff0dc, 0.95, 0xb6cfe0, 0xf4ece0, 1.0],
    [K.s3, 128, 40, 2.7, 0xffe6c8, 0.9, 0xb0c6d8, 0xf3e6d2, 1.0],
    [K.s3e - 0.8, 150, 20, 2.4, 0xffcc98, 0.85, 0x98aec8, 0xf2d4b0, 1.0],
    [K.s3e - 0.25, 165, 3, 1.2, 0xff9050, 0.7, 0x5e6e92, 0xeaa47c, 1.0],
    [K.s3e + 0.0, 166, 3, 0.3, 0x9fb4e0, 0.5, 0x27324e, 0x7c8098, 1.0],
    [K.s4 + 0.1, 22, 4, 1.6, 0xffb478, 0.8, 0x7a8eae, 0xf2c294, 1.0],
    [K.s4 + 3.5, 55, 34, 2.7, 0xffeccc, 0.92, 0xb8cfe0, 0xf4eadb, 1.0],
    [K.s4e, 85, 52, 2.8, 0xfff2e0, 0.95, 0xb6cfe0, 0xf4ece0, 1.0],
    [K.s5, 118, 36, 2.6, 0xffe2b8, 0.9, 0xa9c0d6, 0xf3e2c8, 1.0],
    [A("s5:memanggil"), 140, 22, 2.4, 0xffc890, 0.85, 0x8ea2c0, 0xf1cfa4, 1.0],
    [A("s5:lalu"), 158, 9, 2.1, 0xffa060, 0.8, 0x6c789c, 0xf0a676, 1.0],
    [tStop + 0.6, 166, 3.5, 1.5, 0xff7a3e, 0.7, 0x4a5478, 0xe48a5e, 1.0],
    [K.s5e, 170, 3, 0.9, 0xc0a0c0, 0.6, 0x2e3756, 0x8a7c90, 1.0],
    [K.s6, 60, 40, 0.9, 0x9fb6e0, 0.55, 0x1c2538, 0x56607e, 1.05],
    [A("s6:Surah"), 50, 18, 1.1, 0xc8b4c8, 0.6, 0x323d5c, 0x9c8a94, 1.05],
    [K.s6e, 22, 6, 1.9, 0xffb680, 0.75, 0x6a7ea0, 0xf0ba8c, 1.0],
    [K.s7 + 0.8, 62, 55, 2.8, 0xfff6ea, 1.0, 0xd8dee2, 0xefebe3, 1.0],
    [K.s7e, 70, 50, 2.8, 0xfff6ea, 1.0, 0xd8dee2, 0xefebe3, 1.0],
    [K.s8 + 0.8, 36, 22, 2.5, 0xffdcb0, 0.9, 0xc4d4e0, 0xf5e6cf, 1.0],
    [K.dur, 46, 30, 2.6, 0xffe4c0, 0.9, 0xc8d8e2, 0xf5e8d4, 1.0],
  ];
  const MC = MK.map((k) => k.map((v, j) => (j === 4 || j === 6 || j === 7 ? C(v) : v)));
  const M = { sc: new THREE.Color(), top: new THREE.Color(), bot: new THREE.Color() };
  const sunDir = new THREE.Vector3();
  function mood(t) {
    let i = 0; while (i < MC.length - 2 && MC[i + 1][0] <= t) i++;
    const a = MC[i], b = MC[i + 1];
    const u = sm((t - a[0]) / Math.max(0.001, b[0] - a[0]));
    M.az = a[1] + (b[1] - a[1]) * u; M.el = a[2] + (b[2] - a[2]) * u; M.si = a[3] + (b[3] - a[3]) * u;
    M.sc.copy(a[4]).lerp(b[4], u); M.hi = a[5] + (b[5] - a[5]) * u; M.top.copy(a[6]).lerp(b[6], u); M.bot.copy(a[7]).lerp(b[7], u); M.exp = a[8] + (b[8] - a[8]) * u;
    const az = M.az * Math.PI / 180, el = Math.max(3, M.el) * Math.PI / 180;
    sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    return M;
  }

  // ---------- studio backdrop
  const SU = { uTop: { value: new THREE.Color() }, uBot: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3() }, uSunC: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    uniforms: SU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vD;void main(){vD=normalize((modelMatrix*vec4(position,1.)).xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uTop,uBot,uSun,uSunC;varying vec3 vD;void main(){vec3 d=normalize(vD);
 vec3 c=mix(uBot,uTop,smoothstep(-.05,.55,d.y));float g=max(dot(d,uSun),0.);c+=uSunC*(pow(g,8.)*.18+pow(g,90.)*.5)*smoothstep(-.1,.05,uSun.y);gl_FragColor=vec4(c,1.);}`,
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);

  // ---------- table + base plate
  const table = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x6a625a, roughness: 0.95 }));
  table.rotation.x = -Math.PI / 2; table.position.y = -2; table.receiveShadow = true; scene.add(table);
  const plateM = new THREE.MeshStandardMaterial({ color: 0xe9e3d8, roughness: 0.8 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(100, 1.98, 80), plateM); plate.position.set(0, -1.01, -5); plate.receiveShadow = true; plate.castShadow = true; scene.add(plate);
  // plate edge band (dark laminate line like a model base)
  const edgeM = new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.6 });
  const edge = new THREE.Mesh(new THREE.BoxGeometry(100.2, 0.5, 80.2), edgeM); edge.position.set(0, -1.75, -5); scene.add(edge);

  // ---------- terrain: contour-cut white model with strata lines
  const NX = 330, NZ = 264;
  const tp = new Float32Array((NX + 1) * (NZ + 1) * 3), tc = new Float32Array((NX + 1) * (NZ + 1) * 3), tidx = [];
  const cliffC = C(0xeee3cf), floorC = C(0xe6ddcc), tmpC = new THREE.Color();
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const k = (j * (NX + 1) + i) * 3, x = -50 + 100 * i / NX, z = -45 + 80 * j / NZ, h = H(x, z);
    tp[k] = x; tp[k + 1] = h; tp[k + 2] = z;
    tmpC.copy(floorC).lerp(cliffC, sm(h / 2)).multiplyScalar(0.96 + 0.06 * vnoise(x * 0.4, z * 0.4));
    tc[k] = tmpC.r; tc[k + 1] = tmpC.g; tc[k + 2] = tmpC.b;
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; tidx.push(a, c, b, b, c, d); }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.BufferAttribute(tp, 3)); tg.setAttribute("color", new THREE.BufferAttribute(tc, 3)); tg.setIndex(tidx); tg.computeVertexNormals();
  const terrM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 });
  terrM.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vTw;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvTw=(modelMatrix*vec4(transformed,1.)).xyz;");
    s.fragmentShader = s.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vTw;")
      .replace("#include <color_fragment>", `#include <color_fragment>
 float lv=vTw.y/0.85;float fw=max(fwidth(lv),1e-4); float cl=smoothstep(0.35,0.6,vTw.y);
 float dd=abs(fract(lv)-0.5);float line=1.-smoothstep(0.,fw*1.4,0.5-dd);
 diffuseColor.rgb*=1.-0.16*line*cl;`);
  };
  const terrain = new THREE.Mesh(tg, terrM); terrain.receiveShadow = true; terrain.castShadow = true; terrain.frustumCulled = false; scene.add(terrain);

  // ---------- AUDIRA plaque on the base plate (front edge, top surface)
  const plaqueTex = canvasTex(1024, 300, (g, w, h) => {
    g.fillStyle = "#23282f"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(240,232,218,.55)"; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#f2ebdf"; g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.font = "bold 112px Arial, sans-serif"; g.fillText("AUDIRA", 52, 152);
    g.font = "500 34px Arial, sans-serif"; g.fillStyle = "rgba(242,235,223,.85)";
    g.fillText("MAKET ILUSTRASI · LEMBAH KAUM TSAMUD", 54, 222);
    // north arrow + scale bar
    g.strokeStyle = "#f2ebdf"; g.lineWidth = 4; g.beginPath(); g.arc(900, 118, 54, 0, 6.283); g.stroke();
    g.fillStyle = "#f2ebdf"; g.beginPath(); g.moveTo(900, 70); g.lineTo(922, 140); g.lineTo(900, 126); g.lineTo(878, 140); g.closePath(); g.fill();
    g.font = "bold 30px Arial, sans-serif"; g.textAlign = "center"; g.fillText("U", 900, 208);
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#f2ebdf" : "#23282f"; g.fillRect(54 + i * 70, 246, 70, 14); }
    g.strokeStyle = "#f2ebdf"; g.lineWidth = 2; g.strokeRect(54, 246, 280, 14);
  });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 1.52), [edgeM, edgeM, new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.45, metalness: 0.2 }), edgeM, edgeM, edgeM]);
  plaque.position.set(-4, 0.06, 32.6); plaque.castShadow = true; plaque.receiveShadow = true; scene.add(plaque);

  // ---------- materials
  const whiteM = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.82 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x3a3631, roughness: 0.9 });
  const stoneM = new THREE.MeshStandardMaterial({ color: 0xece2d0, roughness: 0.85 });
  const waterM = new THREE.MeshStandardMaterial({ color: 0x7bbccb, roughness: 0.15, metalness: 0.1, emissive: 0x1d4652, emissiveIntensity: 0.25 });
  const sageM = new THREE.MeshStandardMaterial({ color: 0xa9b78f, roughness: 0.85, side: THREE.DoubleSide });
  const trunkM = new THREE.MeshStandardMaterial({ color: 0xe4d8c2, roughness: 0.9 });
  const figM = new THREE.MeshStandardMaterial({ color: 0x8e8881, roughness: 0.8 });

  // ---------- breakable pieces: rock-cut facades + houses on the plain (QS 7:74, 26:149)
  const PCS = [];  // {sx,sy,sz,x,y,z,yaw,dark,site,delay,vh,nx,nz,spin,roll}
  const SITES = [];
  function addFacade(bx, bz, yaw, W, Hf, site) {
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    const P = (lx, ly, lz, sx, sy, sz, dark, order) => {
      PCS.push({ sx, sy, sz, x: bx + lx * cs + lz * sn, y: ly, z: bz - lx * sn + lz * cs, yaw, dark, site, order, nx: sn, nz: cs, k: rnd() });
    };
    P(-W / 4, Hf * 0.39, 0.05, W / 2 - 0.02, Hf * 0.78, 0.7, 0, 3);
    P(W / 4, Hf * 0.39, 0.05, W / 2 - 0.02, Hf * 0.78, 0.7, 0, 3);
    P(-(W / 2 - 0.32), Hf * 0.36, 0.45, 0.32, Hf * 0.72, 0.22, 0, 2);
    P(W / 2 - 0.32, Hf * 0.36, 0.45, 0.32, Hf * 0.72, 0.22, 0, 2);
    P(0, Hf * 0.19, 0.42, W * 0.27, Hf * 0.38, 0.06, 1, 2);
    P(0, Hf * 0.4, 0.5, W * 0.42, 0.24, 0.3, 0, 2);
    P(0, Hf * 0.44, 0.5, W * 0.2, 0.2, 0.22, 0, 1);
    P(0, Hf * 0.8, 0.22, W * 1.04, 0.36, 0.62, 0, 1);
    for (const fx of [-0.36, -0.12, 0.12, 0.36]) {
      P(fx * W, Hf * 0.8 + 0.4, 0.15, W * 0.19, 0.45, 0.42, 0, 0);
      P(fx * W, Hf * 0.8 + 0.82, 0.15, W * 0.1, 0.4, 0.36, 0, 0);
    }
    SITES.push({ x: bx + 0.6 * sn, z: bz + 0.6 * cs, h: Hf, w: W, nx: sn, nz: cs, door: [bx + 0.5 * sn, Hf * 0.19, bz + 0.5 * cs] });
  }
  const LEFTZ = [-22, -15, -8, 7, 13], RIGHTZ = [-21, -14, -6, 2, 9, 15], BACKX = [-9, -1, 7];
  let lampSite = -1;
  for (const z of LEFTZ) { const xx = -(xc(z) - 0.25); const yaw = Math.atan2(1, xcD(z)); addFacade(xx, z, yaw, 3.4 + rnd() * 1.0, 5.6 + rnd() * 2.2, SITES.length); }
  for (const z of RIGHTZ) { const xx = xc(z) - 0.25; const yaw = Math.atan2(-1, xcD(z)); if (z === -6) lampSite = SITES.length; addFacade(xx, z, yaw, 3.4 + rnd() * 1.0, z === -6 ? 6.6 : 5.6 + rnd() * 2.2, SITES.length); }
  for (const x of BACKX) { addFacade(x, zb(x) + 0.25, 0, 3.8 + rnd() * 0.8, 6.5 + rnd() * 2, SITES.length); }
  const NFAC = SITES.length;
  // houses on the plain: body halves, roof, parapet
  const HOUSES = [[-7.5, -13, 2.8, 2.4], [-3.8, -17, 3.2, 2.8], [-8.2, -19.8, 3.0, 2.2], [4.2, -15, 3.0, 2.6], [8.6, -18, 3.4, 2.4], [3.4, -21.5, 2.8, 2.9], [-1.2, -23, 3.0, 2.3], [10.2, -14.6, 2.6, 2.2]];
  for (const [hx, hz, w, hh] of HOUSES) {
    const site = SITES.length, yaw = (rnd() - 0.5) * 0.3, cs = Math.cos(yaw), sn = Math.sin(yaw), d = w * 0.85, fa = rnd() * 6.283, fnx = Math.sin(fa), fnz = Math.cos(fa);
    const P = (lx, ly, lz, sx, sy, sz, dark, order) => PCS.push({ sx, sy, sz, x: hx + lx * cs + lz * sn, y: ly, z: hz - lx * sn + lz * cs, yaw, dark, site, order, nx: fnx, nz: fnz, k: rnd() });
    P(-w / 4, hh / 2, 0, w / 2 - 0.02, hh, d, 0, 3); P(w / 4, hh / 2, 0, w / 2 - 0.02, hh, d, 0, 3);
    P(0, hh + 0.08, 0, w + 0.1, 0.16, d + 0.1, 0, 1); P(0, hh + 0.3, d / 2, w + 0.1, 0.3, 0.12, 0, 0); P(0, hh + 0.3, -d / 2, w + 0.1, 0.3, 0.12, 0, 0);
    P(0, hh * 0.32, d / 2 + 0.02, w * 0.26, hh * 0.62, 0.05, 1, 2);
    SITES.push({ x: hx, z: hz, h: hh, w, nx: 0, nz: 1, door: [hx, hh * 0.3, hz + d / 2] });
  }
  // fall schedule: sites fall between tFall0 and tFall1, top pieces first
  const siteT = SITES.map((s, i) => tFall0 + (((i * 7) % SITES.length) / SITES.length) * (tFall1 - tFall0 - 0.6));
  PCS.forEach((p) => {
    p.tf = siteT[p.site] + (3 - p.order) * 0.0 + p.order * 0.12 + p.k * 0.15;
    p.vh = 1.6 + p.k * 2.4; p.spin = (p.k - 0.5) * 2.4; p.roll = (rnd() - 0.5) * 1.6; p.lat = (rnd() - 0.5) * 1.6;
    const g = 34;
    const yr = 0.5 * Math.min(p.sx, p.sy, p.sz) + 0.02;
    // landing time from y = y0 - g/2 u^2 (plus small hop)
    p.ul = Math.sqrt(Math.max(0.01, 2 * (p.y - yr + 0.3) / g)) + 0.04;
    p.yr = yr; p.g = g;
  });
  const NW = PCS.filter((p) => !p.dark).length, ND = PCS.length - NW;
  const pW = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), whiteM, NW); pW.castShadow = pW.receiveShadow = true; pW.frustumCulled = false; scene.add(pW);
  const pD = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), darkM, ND); pD.frustumCulled = false; scene.add(pD);
  // lamp door: emissive inner panel
  const lampS = SITES[lampSite];
  const doorGlowM = new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0 });
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.3), doorGlowM);
  const lampYaw = Math.atan2(lampS.nx, lampS.nz);
  doorGlow.position.set(lampS.door[0] + lampS.nx * 0.02, lampS.door[1] + 0.02, lampS.door[2] + lampS.nz * 0.02); doorGlow.rotation.y = lampYaw; scene.add(doorGlow);
  // the lamp itself (an oil lamp on a small plinth by the doorway)
  const lampG = new THREE.Group(); scene.add(lampG);
  const lp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), stoneM); lp.position.y = 0.35; lp.castShadow = true; lampG.add(lp);
  const lb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), new THREE.MeshStandardMaterial({ color: 0xb0784a, roughness: 0.6 })); lb.scale.set(1.3, 0.6, 1); lb.position.y = 0.82; lampG.add(lb);
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0 });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), flameM); flame.scale.set(0.8, 1.8, 0.8); flame.position.set(0.24, 1.0, 0); lampG.add(flame);
  lampG.position.set(lampS.door[0] + lampS.nx * 1.0 + lampS.nz * 1.0, 0, lampS.door[2] + lampS.nz * 1.0 - lampS.nx * 1.0);

  // falling boulders from the cliff rims
  const NBL = 46, BL = [];
  for (let i = 0; i < NBL; i++) {
    const side = i % 3 === 0 ? 0 : i % 3 === 1 ? -1 : 1;
    let x, z;
    if (side === 0) { x = (rnd() - 0.5) * 26; z = zb(x) - 1.2; } else { z = -24 + rnd() * 36; x = side * (xc(z) + 1.2); }
    const y0 = H(x - (side ? side * 0 : 0), z) * 0.95 + 0.5;
    const nx = side === 0 ? 0 : -side, nz = side === 0 ? 1 : 0;
    const s = 0.35 + rnd() * 0.7;
    BL.push({ x, z, y0, nx, nz, s, tf: tQ + 0.3 + rnd() * 4.2, v: 2 + rnd() * 3, sp: (rnd() - 0.5) * 6, k: rnd() });
  }
  const boulders = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), stoneM, NBL); boulders.castShadow = true; boulders.frustumCulled = false; scene.add(boulders);

  // ---------- floor cracks decal (R = crack alpha, G = reveal order)
  const crackTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "rgb(0,255,0)"; g.fillRect(0, 0, w, h);
    const cr = mulberry(77);
    const seg = (x0, y0, a, len, d0, width) => {
      let x = x0, y = y0, d = d0;
      for (let i = 0; i < len; i++) {
        a += (cr() - 0.5) * 0.7; const st = 9 + cr() * 8;
        const nx = x + Math.cos(a) * st, ny = y + Math.sin(a) * st; d += st;
        const gg = Math.min(255, Math.floor(d / 820 * 255));
        g.strokeStyle = `rgb(255,${gg},0)`; g.lineWidth = Math.max(1.2, width * (1 - i / len)); g.lineCap = "round";
        g.beginPath(); g.moveTo(x, y); g.lineTo(nx, ny); g.stroke(); x = nx; y = ny;
        if (cr() < 0.08 && width > 2) seg(x, y, a + (cr() < 0.5 ? 0.9 : -0.9), Math.floor(len * 0.45), d, width * 0.55);
      }
    };
    for (let k = 0; k < 9; k++) seg(512, 560, k / 9 * 6.283 + cr() * 0.4, 46, 0, 7);
  });
  const CU = { uMap: { value: crackTex }, uP: { value: 0 } };
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(30, 48), new THREE.ShaderMaterial({
    uniforms: CU, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
    vertexShader: `varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D uMap;uniform float uP;varying vec2 vU;void main(){vec4 c=texture2D(uMap,vU);float a=c.r*(1.-step(uP,c.g));gl_FragColor=vec4(vec3(.17,.15,.13),a*.85);}`,
  }));
  crack.rotation.x = -Math.PI / 2; crack.position.set(0, 0.03, -4); scene.add(crack);

  // ---------- well, spout, water drip, channels
  const wellProfile = [[1.0, 0], [1.18, 0], [1.2, 0.8], [1.12, 0.88], [1.0, 0.86], [0.98, 0.3]].map(([x, y]) => new THREE.Vector2(x, y));
  const well = new THREE.Mesh(new THREE.LatheGeometry(wellProfile, 40), stoneM); well.position.copy(WELL); well.castShadow = well.receiveShadow = true; scene.add(well);
  const wellBand = new THREE.Mesh(new THREE.TorusGeometry(1.19, 0.035, 6, 48), darkM); wellBand.rotation.x = Math.PI / 2; wellBand.position.set(WELL.x, 0.45, WELL.z); scene.add(wellBand);
  const WU = { uT: { value: 0 }, uAge: { value: 9 }, uC: { value: new THREE.Color(0x6fb2c4) } };
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.99, 48), new THREE.ShaderMaterial({
    uniforms: WU,
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float uT,uAge;uniform vec3 uC;varying vec2 vP;void main(){float r=length(vP);
 float ring=exp(-pow((r-uAge*.9)*14.,2.))*exp(-uAge*1.6);
 float ring2=exp(-pow((r-uAge*.6)*16.,2.))*exp(-uAge*2.2);
 float sh=.5+.5*sin(vP.x*9.+uT*1.3)*sin(vP.y*7.-uT);
 vec3 c=uC*(.82+.12*sh)+vec3(.9,.97,1.)*(ring*.55+ring2*.35)+vec3(.12)*smoothstep(.8,.99,r);
 gl_FragColor=vec4(c,1.);}`,
  }));
  water.rotation.x = -Math.PI / 2; water.position.set(WELL.x, 0.55, WELL.z); scene.add(water);
  const spoutPost = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.3, 0.34), stoneM); spoutPost.position.set(WELL.x, 1.15, WELL.z - 1.45); spoutPost.castShadow = true; scene.add(spoutPost);
  const spoutArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 1.5), stoneM); spoutArm.position.set(WELL.x, 2.18, WELL.z - 0.75); spoutArm.castShadow = true; scene.add(spoutArm);
  const dropM = new THREE.MeshStandardMaterial({ color: 0x9fd6e4, roughness: 0.05, emissive: 0x3a7c8c, emissiveIntensity: 0.6 });
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), dropM); drop.scale.set(1, 1.4, 1); scene.add(drop);
  const DRIP = 1.7;
  // channels from the well to the gardens
  const chM = new THREE.MeshStandardMaterial({ color: 0x86c2cf, roughness: 0.2, emissive: 0x1d4652, emissiveIntensity: 0.2 });
  const chans = [[0, 13, 0.45, 15.6], [0, 12.2, 19, 0.4], [0, 18.2, 19, 0.4]];
  for (const [cx, cz, w, d] of chans) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), chM); m.position.set(cx, 0.03, cz); m.receiveShadow = true; scene.add(m); }
  // gardens: low sage plots with furrow lines
  const furrow = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#b9c69f"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(90,110,70,.5)"; g.lineWidth = 5; for (let y = 14; y < h; y += 26) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke(); } g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });
  const gardenM = new THREE.MeshStandardMaterial({ map: furrow, roughness: 0.9 });
  const plots = new THREE.InstancedMesh(new THREE.BoxGeometry(3.4, 0.18, 2.5), gardenM, 16);
  plots.receiveShadow = true; let pi = 0;
  for (const sx of [-1, 1]) for (const px of [3.6, 7.6]) for (const pz of [10.5, 13.8, 16.6, 20.0]) {
    fm.compose(tv.set(sx * px, 0.09, pz), fq.identity(), fs.set(1, 1, 1)); plots.setMatrixAt(pi++, fm);
  }
  scene.add(plots);

  // ---------- palms (maquette: pale trunk, sage crown)
  function crownGeo() {
    const P = [], I = [];
    const NL = 10, SEG = 7, L = 2.3;
    for (let l = 0; l < NL; l++) {
      const a = l / NL * Math.PI * 2 + (l % 2) * 0.2, up = 0.55 - (l % 3) * 0.18;
      const base = P.length / 3;
      for (let s = 0; s <= SEG; s++) {
        const u = s / SEG, w = 0.32 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + 0.02;
        const rr = u * L, y = rr * up - u * u * 1.5;
        const cx = Math.cos(a) * rr, cz = Math.sin(a) * rr, px = -Math.sin(a) * w, pz = Math.cos(a) * w;
        P.push(cx + px, y + 0.05 * u, cz + pz, cx - px, y + 0.05 * u, cz - pz);
      }
      for (let s = 0; s < SEG; s++) { const a0 = base + s * 2; I.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
  }
  const PALMS = [];
  const addPalm = (x, z) => PALMS.push({ x, z, h: 4.6 + rnd() * 2.6, lx: (rnd() - 0.5) * 0.16, lz: (rnd() - 0.5) * 0.16, ry: rnd() * 6.28, k: rnd() });
  for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1; addPalm(s * (10.2 + rnd() * 2.6), 8 + rnd() * 15); }
  for (const [x, z] of [[-5.5, -3.5], [5.8, -2.6], [-12.2, -24], [12.5, -25], [-4, -26], [5.5, -26.2], [10.8, -9.5], [12, 4.5]]) addPalm(x, z);
  const NPALM = PALMS.length;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.17, 1, 8), trunkM, NPALM); trunks.castShadow = true; trunks.frustumCulled = false; scene.add(trunks);
  const crowns = new THREE.InstancedMesh(crownGeo(), sageM, NPALM); crowns.castShadow = true; crowns.frustumCulled = false; scene.add(crowns);

  // ---------- turn dial (two days: camel / people)
  const dialTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2;
    g.fillStyle = "#f4efe6"; g.beginPath(); g.arc(c, c, 250, 0, 6.283); g.fill();
    g.fillStyle = "#e3cba3"; g.beginPath(); g.moveTo(c, c); g.arc(c, c, 236, Math.PI / 2, Math.PI * 1.5); g.closePath(); g.fill();
    g.fillStyle = "#bcd8df"; g.beginPath(); g.moveTo(c, c); g.arc(c, c, 236, -Math.PI / 2, Math.PI / 2); g.closePath(); g.fill();
    g.strokeStyle = "#2a2f36"; g.lineWidth = 6; g.beginPath(); g.arc(c, c, 246, 0, 6.283); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(c, 20); g.lineTo(c, w - 20); g.stroke();
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; g.lineWidth = i % 6 ? 2 : 5; g.beginPath(); g.moveTo(c + Math.cos(a) * 222, c + Math.sin(a) * 222); g.lineTo(c + Math.cos(a) * 246, c + Math.sin(a) * 246); g.stroke(); }
    // camel icon (left half)
    g.save(); g.translate(130, 250); g.fillStyle = "#7a5634";
    g.beginPath(); g.ellipse(0, 0, 62, 30, 0, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(-6, -26, 30, 24, 0, 0, 6.283); g.fill();
    g.lineWidth = 16; g.strokeStyle = "#7a5634"; g.lineCap = "round";
    g.beginPath(); g.moveTo(50, -8); g.quadraticCurveTo(78, -6, 80, -44); g.stroke();
    g.beginPath(); g.ellipse(92, -50, 20, 10, 0.2, 0, 6.283); g.fill();
    g.lineWidth = 11; for (const lx of [-44, -28, 30, 46]) { g.beginPath(); g.moveTo(lx, 14); g.lineTo(lx + (lx > 0 ? 4 : -4), 78); g.stroke(); }
    g.restore();
    // people icons (right half): faceless pins
    g.fillStyle = "#2f5560";
    for (const [px, py, s] of [[334, 238, 1], [388, 222, 1.1], [440, 240, 1]]) { g.beginPath(); g.arc(px, py - 40 * s, 17 * s, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(px - 24 * s, py + 58 * s); g.quadraticCurveTo(px - 26 * s, py - 18 * s, px, py - 18 * s); g.quadraticCurveTo(px + 26 * s, py - 18 * s, px + 24 * s, py + 58 * s); g.closePath(); g.fill(); }
    g.font = "bold 40px Arial, sans-serif"; g.textAlign = "center"; g.fillStyle = "#2a2f36";
    g.fillText("UNTA", 140, 380); g.fillText("KAUM", 388, 380);
    g.font = "bold 30px Arial, sans-serif"; g.fillText("HARI 1", 140, 130); g.fillText("HARI 2", 388, 130);
  });
  const dialG = new THREE.Group(); dialG.position.copy(DIAL); scene.add(dialG);
  const dpost = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.22), stoneM); dpost.position.y = 0.7; dpost.castShadow = true; dialG.add(dpost);
  const dface = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.14, 48), stoneM);
  const dfront = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.7 })); dfront.position.set(0, 2.25, 0.072); dialG.add(dfront);
  dface.rotation.x = Math.PI / 2; dface.rotation.y = 0; dface.position.y = 2.25; dface.castShadow = true; dialG.add(dface);
  // the cylinder's top cap faces +y; rotated by x=+90deg it faces +z. Its texture needs a spin so "up" reads up.
  dface.rotation.order = "XYZ";
  const needleG = new THREE.Group(); needleG.position.set(0, 2.25, 0.1); dialG.add(needleG);
  const needleM = new THREE.MeshStandardMaterial({ color: 0xc4532f, roughness: 0.5 });
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 0.05), needleM); needle.position.y = 0.45; needle.castShadow = true; needleG.add(needle);
  const ntip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 4), needleM); ntip.position.y = 1.0; needleG.add(ntip);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), darkM); hub.rotation.x = Math.PI / 2; hub.position.set(0, 2.25, 0.12); dialG.add(hub);
  const hlM = new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const hl = new THREE.Mesh(new THREE.CircleGeometry(1.04, 40, 0, Math.PI), hlM); hl.position.set(0, 2.25, 0.085); dialG.add(hl);
  // dial schedule: +PI/2 = camel half (left), -PI/2 = people half (right), 0 = neutral
  const DK = [[0, 0], [A("s1:seekor") - 0.2, 1], [A("s1:seluruh") - 0.2, -1], [A("s1:ujian"), 1], [A("s1:Tsamud"), -1], [K.s2 + 0.5, 0],
    [A("s4:giliran") - 0.15, 1], [A("s4:kalian") - 0.1, -1], [A("s4:giliran#2") + 0.4, 1]];
  for (let tt = A("s4:Jangan") + 0.4, s = -1; tt < tStop - 0.3; tt += 1.35, s = -s) DK.push([tt, s]);
  DK.sort((a, b) => a[0] - b[0]);
  function dialAng(t) {
    if (t >= tStop) { const a0 = dialAng(tStop - 0.001); return a0 + (0.42 - a0) * eout((t - tStop) / 0.5); }
    let i = 0; while (i < DK.length - 1 && DK[i + 1][0] <= t) i++;
    const prev = i > 0 ? DK[i - 1][1] : 0, cur = DK[i][1];
    const u = back(clamp01((t - DK[i][0]) / 0.5), 1.6);
    return (prev + (cur - prev) * u) * Math.PI / 2;
  }

  // ---------- staff planted by the well (presence of Nabi Saleh; no figure)
  const staffM = new THREE.MeshStandardMaterial({ color: 0x7a5636, roughness: 0.8 });
  const staff = new THREE.Group(); staff.position.set(0.95, 0, 6.45); staff.rotation.z = 0.05; staff.rotation.x = -0.04; scene.add(staff);
  const st1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 2.6, 8), staffM); st1.position.y = 1.3; st1.castShadow = true; staff.add(st1);
  const st2 = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 6, 14, Math.PI), staffM); st2.position.set(0.13, 2.6, 0); staff.add(st2);

  // ---------- faceless scale figures (lathe pieces)
  const figProfile = [[0, 0], [0.17, 0], [0.2, 0.12], [0.19, 0.8], [0.17, 1.0], [0.23, 1.33], [0.2, 1.42], [0.07, 1.5], [0.11, 1.56], [0.125, 1.65], [0.1, 1.74], [0, 1.78]].map(([x, y]) => new THREE.Vector2(x, y));
  const NF = 44;
  const folk = new THREE.InstancedMesh(new THREE.LatheGeometry(figProfile, 12), figM, NF); folk.castShadow = true; folk.frustumCulled = false; scene.add(folk);
  const FK = [];
  const doorOf = (i) => SITES[(i * 5) % NFAC].door;
  const lampDoor = lampS.door;
  const toward = (p, d, L) => { const dx = d[0] - p.x, dz = d[2] - p.z, n = Math.hypot(dx, dz) || 1; return [p.x + dx / n * L, p.z + dz / n * L]; };
  for (let i = 0; i < NF; i++) {
    const ks = [{ t: -1, x: 0, z: 0, v: 0, d: 0.1 }];
    if (i < 11) { const a = i / 11 * 6.283 + 0.3; const rr = 1.85 + (i % 2) * 0.12; ks.push({ t: A("s1:seluruh") - 0.15 + i * 0.05, x: WELL.x + Math.cos(a) * rr, z: WELL.z + Math.sin(a) * rr, v: 1, d: 0.1, lx: WELL.x, lz: WELL.z }); }
    if (i < 30) {
      ks.push({ t: K.s2 - 0.05, x: ks[ks.length - 1].x, z: ks[ks.length - 1].z, v: 0, d: 0.3 });
      let x, z; do { x = (rnd() - 0.5) * 22; z = -12 + rnd() * 32; } while (Math.hypot(x - WELL.x, z - WELL.z) < 3.5 || (Math.abs(x) < 1 && z > 5));
      const a = rnd() * 6.283;
      ks.push({ t: K.s2 + 0.3 + rnd() * 0.6, x, z, v: 1, d: 0.1 });
      ks.push({ t: K.s2 + 1.0, x: x + Math.cos(a) * 3.2, z: z + Math.sin(a) * 3.2, v: 1, d: K.s3 - K.s2 - 1.6 });
      ks.push({ t: K.s3 - 0.75, x: x + Math.cos(a) * 3.2, z: z + Math.sin(a) * 3.2, v: 0, d: 0.3 });
    }
    // s3: crowd before the lamp doorway, walking in
    const ca = (i / NF - 0.5) * 1.5 + (rnd() - 0.5) * 0.08, cr = 3.4 + (i % 4) * 1.05 + rnd() * 0.4;
    const cx = lampDoor[0] - Math.cos(ca) * cr, cz = lampDoor[2] + Math.sin(ca) * cr;
    ks.push({ t: K.s3 - 0.2, x: cx - 4.5 - rnd() * 2, z: cz + (rnd() - 0.3) * 3, v: 1, d: 0.1 });
    ks.push({ t: K.s3 + 0.0 + rnd() * 0.4, x: cx, z: cz, v: 1, d: 2.6, lx: lampDoor[0], lz: lampDoor[2] });
    // s4: step back as spectators east of the well
    let sx, sz; do { sx = 4.6 + rnd() * 6.5; sz = -6 + rnd() * 15; } while (Math.hypot(sx - DIAL.x, sz - DIAL.z) < 1.8);
    ks.push({ t: A("s4:Datanglah") + rnd() * 0.6, x: sx, z: sz, v: 1, d: 3.2, lx: -6, lz: 1 });
    if (i < 10) {
      // s5: the arrogant chiefs close in around the camel at dusk
      const a = (0.9 + i / 9 * 4.5), rr = 2.5 + (i % 2) * 0.35;
      const ccx = -2.6, ccz = 4.0;
      ks.push({ t: A("s5:memanggil") - 0.4 + i * 0.12, x: ccx + Math.cos(a) * rr, z: ccz + Math.sin(a) * rr, v: 1, d: 2.6, lx: ccx, lz: ccz });
      ks.push({ t: A("s5:Wahai"), x: ccx + Math.cos(a) * rr, z: ccz + Math.sin(a) * rr, v: 1, d: 0.6, lx: lampDoor[0], lz: lampDoor[2] });
      const p = ks[ks.length - 1], dd = toward(p, doorOf(i), 3.5);
      ks.push({ t: A("s5:kata") + 0.2 + i * 0.05, x: dd[0], z: dd[1], v: 0, d: 2.4 });
    } else {
      const p = ks[ks.length - 1], dd = toward(p, doorOf(i), 4);
      ks.push({ t: K.s5 - 0.1 + (i % 7) * 0.1, x: dd[0], z: dd[1], v: 0, d: 2.6 });
    }
    // precompute facing angle per key
    for (let k = 0; k < ks.length; k++) {
      const p = ks[k], q = ks[k - 1] || p;
      p.f = p.lx !== undefined ? Math.atan2(p.lx - p.x, p.lz - p.z) : (Math.hypot(p.x - q.x, p.z - q.z) > 0.2 ? Math.atan2(p.x - q.x, p.z - q.z) : (q.f || 0));
    }
    FK.push(ks);
  }
  const angLerp = (a, b, u) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * u; };
  function figPose(i, t, out) {
    const ks = FK[i]; let k = 0; while (k < ks.length - 1 && ks[k + 1].t <= t) k++;
    const b = ks[k], a = ks[k - 1] || b;
    const u = sm((t - b.t) / b.d);
    let x = b.x, z = b.z;
    if (a.v > 0.5) { x = a.x + (b.x - a.x) * u; z = a.z + (b.z - a.z) * u; }
    let s;
    if (b.v >= a.v) s = a.v < 0.5 && b.v > 0.5 ? back(clamp01((t - b.t) / 0.35), 1.4) : b.v;
    else s = 1 - ramp(t, b.t + b.d - 0.3, b.t + b.d);
    const moving = a.v > 0.5 && u > 0 && u < 1 && Math.hypot(b.x - a.x, b.z - a.z) > 0.3;
    out.x = x; out.z = z; out.s = s; out.f = angLerp(a.f || 0, b.f || 0, sm((t - b.t) / Math.min(b.d, 0.8)));
    out.bob = moving ? Math.abs(Math.sin(t * 9 + i)) * 0.07 : 0;
    return out;
  }

  // ---------- the she-camel (detailed, natural tan, painted maquette finish)
  const tanM = new THREE.MeshStandardMaterial({ color: 0xc89d66, roughness: 0.82, transparent: true, opacity: 1 });
  const tanD = new THREE.MeshStandardMaterial({ color: 0xa8784a, roughness: 0.85, transparent: true, opacity: 1 });
  const tanL = new THREE.MeshStandardMaterial({ color: 0xdcbc8e, roughness: 0.85, transparent: true, opacity: 1 });
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x1e1a16, roughness: 0.4, transparent: true, opacity: 1 });
  const camelMats = [tanM, tanD, tanL, eyeM];
  const camel = new THREE.Group(); scene.add(camel);
  const sph = (rx, ry, rz, mat, x, y, z, p) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), mat); m.scale.set(rx, ry, rz); m.position.set(x, y, z); m.castShadow = true; (p || camel).add(m); return m; };
  sph(0.98, 0.46, 0.42, tanM, 0, 1.47, 0);
  sph(0.5, 0.44, 0.36, tanD, -0.08, 1.8, 0);
  sph(0.46, 0.52, 0.41, tanM, 0.68, 1.4, 0);
  sph(0.44, 0.5, 0.4, tanM, -0.72, 1.46, 0);
  sph(0.34, 0.12, 0.3, tanD, -0.05, 1.03, 0);
  const neck = new THREE.Group(); neck.position.set(0.86, 1.56, 0); camel.add(neck);
  const NC = [[0, 0], [0.24, -0.12], [0.5, -0.12], [0.7, 0.05], [0.83, 0.32], [0.88, 0.58]];
  const ncurve = new THREE.CatmullRomCurve3(NC.map(([x, y]) => new THREE.Vector3(x, y, 0)));
  for (let i = 0; i <= 12; i++) { const p = ncurve.getPoint(i / 12); const rr = 0.2 - 0.085 * (i / 12); sph(rr * 1.05, rr, rr * 0.9, tanM, p.x, p.y, 0, neck); }
  const head = new THREE.Group(); head.position.set(0.9, 0.64, 0); neck.add(head);
  sph(0.25, 0.13, 0.115, tanM, 0.12, 0.0, 0, head);
  sph(0.13, 0.1, 0.095, tanD, 0.33, -0.04, 0, head);
  sph(0.05, 0.035, 0.03, tanD, 0.4, -0.1, 0, head);
  for (const s of [-1, 1]) {
    sph(0.028, 0.028, 0.02, eyeM, 0.1, 0.06, s * 0.1, head);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), tanD); ear.position.set(-0.04, 0.13, s * 0.07); ear.rotation.z = 0.3; ear.castShadow = true; head.add(ear);
  }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.55, 6), tanD); tail.position.set(-1.12, 1.32, 0); tail.rotation.z = -0.15; camel.add(tail);
  sph(0.05, 0.09, 0.05, tanD, -1.16, 1.04, 0);
  const LEGS = [];
  for (const [lx, lz, front] of [[0.62, 0.21, 1], [0.62, -0.21, 1], [-0.66, 0.2, 0], [-0.66, -0.2, 0]]) {
    const hip = new THREE.Group(); hip.position.set(lx, 1.3, lz); camel.add(hip);
    if (!front) sph(0.2, 0.38, 0.13, tanM, 0.02, -0.12, 0, hip);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.66, 10), tanM); up.position.y = -0.33; up.castShadow = true; hip.add(up);
    const knee = new THREE.Group(); knee.position.y = -0.66; hip.add(knee);
    sph(0.08, 0.08, 0.08, tanL, 0, 0, 0, knee);
    const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.6, 10), tanL); lo.position.y = -0.3; lo.castShadow = true; knee.add(lo);
    sph(0.12, 0.045, 0.11, tanD, 0.03, -0.6, 0, knee);
    LEGS.push({ hip, knee, side: lz > 0 ? 1 : -1, front });
  }
  camel.scale.setScalar(1.0);
  // path: emerges at the left cliff base, curves to its drinking place west of the well, facing it
  const E = new THREE.Vector3(-(xc(-1) - 1.0), 0, -1), Dk = new THREE.Vector3(WELL.x - 2.45, 0, WELL.z), Cc = new THREE.Vector3(-7.5, 0, 4.4);
  const bez = (u, o) => { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return o.set(a * E.x + b * Cc.x + c * Dk.x, 0, a * E.z + b * Cc.z + c * Dk.z); };
  let pathLen = 0; { const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(); for (let i = 0; i < 60; i++) { bez(i / 60, p0); bez((i + 1) / 60, p1); pathLen += p0.distanceTo(p1); } }
  const walkU = (t) => { const x = clamp01((t - tWalk0) / (tWalk1 - tWalk0)); return x < 0.15 ? 0.5 * x * x / 0.15 / 0.85 : x > 0.85 ? 1 - 0.5 * (1 - x) * (1 - x) / 0.15 / 0.85 : (x - 0.075) / 0.85; };
  const dust = pts(scene, 900, { color: 0xd8cab2, size: 1.1, add: false, opacity: 0.2 });
  const dseed = Array.from({ length: 900 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- s7: survey map plinth (HISTORYMAP inset): plaster land, pale seas, Al-Hijr pin, a Nabataean tomb model
  const MAPX = 70, MAPZ = -5, MS = 30, LON0 = 44, LAT0 = 23, KX = 1.15, KZ = 1.25;
  const mx = (lon) => MAPX + (lon - LON0) * KX, mz = (lat) => MAPZ - (lat - LAT0) * KZ;
  const mapTex = canvasTex(2048, 2048, (g, w, h) => {
    const px = (lon) => ((lon - LON0) * KX / MS + 0.5) * w, py = (lat) => (-(lat - LAT0) * KZ / MS + 0.5) * h;
    g.fillStyle = "#f1ece2"; g.fillRect(0, 0, w, h);
    // land hatching
    g.strokeStyle = "rgba(160,140,110,.12)"; g.lineWidth = 2;
    for (let i = -h; i < w; i += 22) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
    const sea = (pts2) => { g.beginPath(); pts2.forEach(([lo, la], i) => (i ? g.lineTo(px(lo), py(la)) : g.moveTo(px(lo), py(la)))); g.closePath(); g.fill(); g.stroke(); };
    g.fillStyle = "#c2dbe2"; g.strokeStyle = "#3a4a52"; g.lineWidth = 4; g.lineJoin = "round";
    // Red Sea + Gulf of Aden + Arabian Sea (one water body, approximate coast)
    sea([[32.5, 30.0], [32.6, 29.2], [33.6, 27.9], [34.25, 27.7], [34.6, 28.6], [34.9, 29.5], [35.0, 28.2], [34.7, 27.9], [35.6, 27.0], [36.5, 26.2], [37.4, 24.9], [38.1, 24.1], [39.0, 22.4], [39.2, 21.5], [40.3, 20.1], [41.4, 18.6], [42.6, 16.9], [42.8, 15.5], [42.9, 14.8], [43.25, 13.3], [43.5, 12.7], [45.0, 12.8], [47.5, 13.6], [49.1, 14.5], [51.2, 15.2], [52.2, 15.6], [54.1, 17.0], [55.4, 17.8], [56.6, 18.4], [57.8, 19.0], [58.6, 20.4], [59.8, 22.5], [60.5, 22.5], [60.5, 9], [30, 9], [30, 10.5], [43.1, 11.6], [42.7, 13.0], [41.2, 14.5], [39.5, 15.6], [38.5, 18.0], [37.2, 19.6], [36.9, 21.5], [36.0, 22.8], [35.6, 23.9], [34.6, 25.6], [33.8, 27.2], [32.6, 29.6]]);
    // Gulf of Oman + Persian Gulf
    sea([[59.8, 22.5], [58.6, 23.6], [57.6, 23.8], [56.7, 24.4], [56.3, 25.6], [56.3, 26.4], [55.9, 25.8], [55.3, 25.3], [54.4, 24.5], [53.0, 24.2], [51.6, 24.4], [51.6, 25.4], [51.3, 26.1], [50.8, 25.6], [50.6, 25.0], [50.1, 26.4], [49.7, 27.0], [48.8, 27.8], [48.0, 29.4], [48.5, 29.9], [49.5, 30.0], [50.8, 28.9], [51.6, 27.8], [53.5, 26.8], [55.0, 26.6], [56.3, 27.2], [57.2, 26.0], [57.8, 25.6], [60.5, 25.3], [60.5, 22.5]]);
    // Mediterranean corner
    sea([[29, 31.0], [32.3, 31.3], [33.5, 31.1], [34.4, 31.5], [34.8, 32.1], [35.0, 32.8], [35.5, 33.9], [35.9, 35.0], [29, 35.5]]);
    // graticule
    g.strokeStyle = "rgba(58,74,82,.28)"; g.lineWidth = 2; g.setLineDash([14, 12]);
    for (let lo = 32; lo <= 56; lo += 4) { g.beginPath(); g.moveTo(px(lo), 0); g.lineTo(px(lo), h); g.stroke(); }
    for (let la = 12; la <= 34; la += 4) { g.beginPath(); g.moveTo(0, py(la)); g.lineTo(w, py(la)); g.stroke(); }
    g.setLineDash([]);
    g.fillStyle = "rgba(58,74,82,.7)"; g.font = "500 30px Arial, sans-serif"; g.textAlign = "left";
    for (let lo = 36; lo <= 52; lo += 8) g.fillText(lo + "°BT", px(lo) + 8, h - 24);
    for (let la = 16; la <= 32; la += 8) g.fillText(la + "°LU", 16, py(la) - 10);
    g.textAlign = "center";
    g.fillStyle = "#3a4a52"; g.font = "italic 600 46px Georgia, serif";
    g.save(); g.translate(px(38.6), py(20.4)); g.rotate(1.0); g.fillText("LAUT MERAH", 0, 0); g.restore();
    g.fillText("TELUK PERSIA", px(51.8), py(28.6));
    g.fillText("LAUT ARAB", px(57.5), py(14.5));
    g.fillStyle = "#2a2f36"; g.font = "bold 70px Arial, sans-serif"; g.fillText("ARAB SAUDI", px(45.5), py(23.6));
    // Al-Hijr ring marker (the 3D pin sits on it)
    g.strokeStyle = "#c4532f"; g.lineWidth = 7; g.beginPath(); g.arc(px(37.95), py(26.8), 30, 0, 6.283); g.stroke();
    g.fillStyle = "#c4532f"; g.font = "bold 50px Arial, sans-serif"; g.textAlign = "left"; g.fillText("Al-Hijr", px(37.95) + 44, py(26.8) - 18);
    g.font = "500 34px Arial, sans-serif"; g.fillText("(Mada'in Saleh)", px(37.95) + 44, py(26.8) + 26);
    g.strokeStyle = "#2a2f36"; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(MS + 1, 2, MS + 1), [plateM, plateM, new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.85 }), plateM, plateM, plateM]);
  plinth.position.set(MAPX, -1, MAPZ); plinth.castShadow = plinth.receiveShadow = true; scene.add(plinth);
  const mapEdge = new THREE.Mesh(new THREE.BoxGeometry(MS + 1.2, 0.5, MS + 1.2), edgeM); mapEdge.position.set(MAPX, -1.75, MAPZ); scene.add(mapEdge);
  const HX = mx(37.95), HZ = mz(26.8);
  const pinG = new THREE.Group(); pinG.position.set(HX, 0, HZ); scene.add(pinG);
  const pinM = new THREE.MeshStandardMaterial({ color: 0xc4532f, roughness: 0.45 });
  const pinS = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.02, 2.4, 8), darkM); pinS.position.y = 1.2; pinS.castShadow = true; pinG.add(pinS);
  const pinB = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), pinM); pinB.position.y = 2.5; pinB.castShadow = true; pinG.add(pinB);
  // Nabataean rock tomb (Qasr al-Farid-like): an isolated rock with a carved facade and stepped crown
  const tombG = new THREE.Group(); tombG.position.set(HX - 0.2, 0, HZ + 3.6); tombG.rotation.y = 0.15; scene.add(tombG);
  const rock = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.3, 2.0), stoneM); rock.position.set(0, 1.65, -0.2); rock.castShadow = rock.receiveShadow = true; tombG.add(rock);
  const rockTop = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 0), stoneM); rockTop.scale.set(1.05, 0.5, 0.85); rockTop.position.set(0.1, 3.35, -0.3); rockTop.castShadow = true; tombG.add(rockTop);
  const tf = (w, h, d, x, y, z, m = whiteM) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; tombG.add(b); return b; };
  tf(1.9, 2.6, 0.2, 0, 1.3, 0.85);
  tf(0.16, 2.0, 0.12, -0.78, 1.0, 1.0); tf(0.16, 2.0, 0.12, 0.78, 1.0, 1.0);
  tf(0.5, 0.95, 0.06, 0, 0.48, 1.0, darkM);
  tf(0.7, 0.1, 0.14, 0, 1.02, 1.02); tf(1.98, 0.14, 0.26, 0, 2.05, 0.9);
  for (const fx of [-0.6, -0.2, 0.2, 0.6]) { tf(0.3, 0.2, 0.2, fx, 2.6 + 0.1, 0.85); tf(0.16, 0.18, 0.18, fx, 2.89, 0.85); }

  // ---------- camera
  const camA = track([
    [0, 4.6, 5.0, 18.5, 1.4, 1.6, 3.8],
    [A("s1:unta"), 2.8, 5.0, 18.6, 0.6, 1.5, 3.8],
    [A("s1:kaum"), 0.4, 5.4, 18.8, 0.6, 1.5, 3.6],
    [A("s1:ujian"), -2.6, 6.5, 19, -0.5, 2.0, 1.5],
    [K.s1e, -2, 12, 30, -0.5, 3, -2],
    [A("s2:makmur"), 0, 26, 62, 0, 2, -8],
    [A("s2:memahat"), -3, 20, 46, -6, 3, -10],
    [A("s2:rumah"), -2.5, 7.5, 6, -14, 4, -13],
    [A("s2:kebun"), 4, 9, 30, -2, 1, 15],
    [A("s2:kurma"), -2, 5.5, 31, -9, 3.5, 17],
    [A("s2:Surah"), -4, 10, 38, -3, 2, 12],
    [K.s2e, 2, 8, 14, 9, 3, -4],
    [K.s3 + 1.2, 0.5, 4.6, 2.5, 13, 2.4, -6.2],
    [A("s3:Datangkan"), 2.2, 4.1, 0.5, 13.4, 2.4, -6.4],
    [K.s3e, -1, 6, 10, -8, 2, -1],
    [tCamE + 0.4, -2.5, 5.2, 10.5, -12.5, 2.0, -0.8],
    [tWalk0 + 1.2, -3.5, 5.5, 13, -9, 1.6, 1],
    [A("s4:giliran"), -1.5, 5.2, 14.5, -3, 1.5, 3],
    [A("s4:Jangan"), 1.5, 4.6, 13.5, -1.2, 1.4, 3.6],
    [K.s4e, 3.5, 5.6, 14.5, -0.8, 1.4, 3.6],
    [A("s5:memanggil"), 5.0, 9.5, 17, -2.6, 1.2, 4.0],
    [A("s5:lalu") - 0.4, 5.5, 8.6, 16, -1.8, 1.4, 3.8],
    [tGone - 0.3, 5, 8.2, 17, -30, 13, 26],
    [A("s5:Wahai") - 0.6, 5, 8.6, 17.4, -32, 12, 30],
    [A("s5:Wahai") + 0.7, 3.5, 6.8, 15.5, -1.5, 1.1, 4],
    [K.s5e, 2, 11, 26, 0, 3, -1],
    [tQ, 0, 17, 42, 0, 5, -8],
    [A("s6:reruntuhan"), 3, 15, 36, 3, 4, -8],
    [A("s6:Surah"), 6, 12.5, 29, 6, 3, -9],
    [K.s6e, 4, 20, 40, 2, 2, -6],
    [K.s7 + 1.0, 52, 56, 30, 66, 0, -6],
    [A("s7:Al-Hijr"), 69, 60, 25, 69, 0, -9],
    [A("s7:Al-Qur'an"), 65, 32, 10, 64.5, 0, -10],
    [A("s7:makam"), 59.5, 7.5, 7, 62.8, 1.8, -7.5],
    [A("s7:Situs"), 66.5, 9.5, 7.5, 63.2, 1.6, -8],
    [K.s7e - 1.0, 65.5, 11, 9.5, 63, 1.6, -7.5],
    [K.s7e, 64, 14, 12, 62, 1.6, -7],
    [K.s8 + 0.3, 50, 46, 34, 26, 0, 4],
    [K.s8 + 1.2, 14, 36, 46, 1, 0, 4],
    [K.s8 + 2.1, 12, 13, 30, 0.5, 2, 3],
    [A("s8:Menurut"), 5, 6.2, 16, -0.5, 1.2, 3.8],
    [A("s8:Kisah") - 1.4, 3, 5.6, 18.5, -1.5, 1.2, 4.2],
    [A("s8:Kisah") + 0.1, -3, 4.2, 44, -4, 0.4, 28],
    [K.dur, -3.4, 3.9, 43.2, -4, 0.3, 28],
  ]);
  const look = new THREE.Vector3();
  const quakeA = (t) => ramp(t, tQ - 0.6, tQ + 0.2) * (1 - ramp(t, A("s6:Surah"), K.s6e - 0.8));

  return (t) => {
    const c = camA(t);
    const fw = ramp(t, tWalk0 + 0.2, tWalk0 + 1.2) * (1 - ramp(t, tWalk1 - 0.8, tWalk1 + 0.6));
    if (fw > 0) {
      bez(walkU(t), tv2);
      const f = [tv2.x + 4.2, 5.2, tv2.z + 11.5, tv2.x + 1.2, 1.3, tv2.z];
      for (let j = 0; j < 6; j++) c[j] += (f[j] - c[j]) * fw;
    }
    const qk = quakeA(t);
    const shx = qk * (Math.sin(t * 37) * 0.35 + Math.sin(t * 23.3 + 1) * 0.25), shy = qk * (Math.sin(t * 41 + 2) * 0.22 + Math.sin(t * 17.1) * 0.15);
    cam.position.set(c[0] + Math.sin(t * .29) * .12 + shx, c[1] + Math.sin(t * .23) * .08 + shy, c[2] + Math.cos(t * .31) * .12);
    look.set(c[3] + shx * 0.5, c[4] + shy * 0.5, c[5]); cam.lookAt(look);

    // mood + sun
    const m = mood(t);
    SU.uTop.value.copy(m.top); SU.uBot.value.copy(m.bot); SU.uSun.value.copy(sunDir); SU.uSunC.value.copy(m.sc);
    sky.position.copy(cam.position);
    scene.background.copy(m.bot); scene.fog.color.copy(m.bot); r.toneMappingExposure = m.exp * 1.12;
    hemi.intensity = m.hi; hemi.color.copy(m.top).lerp(new THREE.Color(1, 1, 1), 0.5);
    const inMap = t >= K.s7 + 0.6 && t < K.s7e + 0.4;
    const cx0 = inMap ? MAPX : 0, cz0 = inMap ? MAPZ : -5, ext = inMap ? 24 : 56;
    sunL.color.copy(m.sc); sunL.intensity = m.si;
    sunL.target.position.set(cx0, 0, cz0); sunL.position.set(cx0, 0, cz0).addScaledVector(sunDir, 150);
    if (SC.right !== ext) { SC.left = -ext; SC.right = ext; SC.top = ext; SC.bottom = -ext; SC.updateProjectionMatrix(); }

    // facades, houses: crack, then fall and settle as rubble (no figures inside)
    let iw = 0, id = 0;
    for (let k = 0; k < PCS.length; k++) {
      const p = PCS[k];
      const u = t - p.tf;
      let x = p.x, y = p.y, z = p.z, tilt = 0, roll = 0;
      if (t >= tQ - 0.5) {
        const jit = qk * 0.04;
        x += Math.sin(t * 31 + k) * jit; z += Math.cos(t * 29 + k * 1.7) * jit;
        // pre-fall: cracks open (pieces drift apart a little)
        const pre = ramp(t, p.tf - 1.0, p.tf);
        x += (p.x - SITES[p.site].x) * 0.03 * pre; y += (p.y - SITES[p.site].h * 0.5) * 0.02 * pre;
        tilt = pre * 0.04 * (p.k - 0.5);
      }
      if (u > 0) {
        const ue = Math.min(u, p.ul);
        const hd = p.vh * ue;
        x = p.x + p.nx * hd + p.nz * p.lat * ue; z = p.z + p.nz * hd - p.nx * p.lat * ue;
        y = u < p.ul ? p.y + 0.3 * Math.min(u, 0.1) - 0.5 * p.g * u * u : p.yr;
        y = Math.max(p.yr, y);
        tilt = (1.3 + p.k * 0.4) * clamp01(ue / p.ul); roll = p.roll * clamp01(ue / p.ul);
      }
      qa.setFromAxisAngle(AY, p.yaw); qb.setFromAxisAngle(AX, tilt); qc.setFromAxisAngle(AZ, roll);
      fq.copy(qa).multiply(qb).multiply(qc);
      fm.compose(tv.set(x, y, z), fq, fs.set(p.sx, p.sy, p.sz));
      if (p.dark) pD.setMatrixAt(id++, fm); else pW.setMatrixAt(iw++, fm);
    }
    pW.instanceMatrix.needsUpdate = true; pD.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < NBL; i++) {
      const b = BL[i], u = t - b.tf;
      let x = b.x, y = b.y0, z = b.z, s = t < tQ ? 0.0001 : b.s;
      if (u > 0) {
        const ul = Math.sqrt(2 * (b.y0 - b.s * 0.6) / 30);
        const ue = Math.min(u, ul);
        x = b.x + b.nx * b.v * ue * 1.6; z = b.z + b.nz * b.v * ue * 1.6;
        y = Math.max(b.s * 0.6, b.y0 - 15 * u * u);
        fe.set(b.sp * ue, b.k * 3, b.sp * ue * 0.7);
      } else fe.set(0, b.k * 3, 0);
      if (u <= 0) s = 0.0001;
      fm.compose(tv.set(x, y, z), fq.setFromEuler(fe), fs.setScalar(s)); boulders.setMatrixAt(i, fm);
    }
    boulders.instanceMatrix.needsUpdate = true;
    CU.uP.value = ramp(t, tQ, A("s6:reruntuhan") + 0.5) * 1.02;

    // lamp at the doorway: lit while Nabi Saleh calls them (s3) until the end of s5
    const lampOn = ramp(t, A("s3:Nabi") - 0.2, A("s3:Nabi") + 0.6) * (1 - ramp(t, K.s5e - 0.4, K.s5e + 0.2));
    const flick = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
    lampL.intensity = 9 * lampOn * flick; lampL.position.set(lampG.position.x, 1.4, lampG.position.z);
    flameM.opacity = lampOn; flame.scale.set(0.8, 1.8 * flick, 0.8); doorGlowM.opacity = 0.4 * lampOn * flick;
    lampG.visible = t < K.s6 + 0.2 && t >= A("s3:Nabi") - 0.4;
    staff.visible = t < K.s6;

    // water drip and ripples
    const dt0 = 0.4, ph = ((t - dt0) % DRIP + DRIP) % DRIP, fall = Math.sqrt(2 * (2.08 - 0.6) / 9.8) * 1.0;
    if (ph < fall) { drop.visible = true; drop.position.set(WELL.x, 2.06 - 0.5 * 9.8 * ph * ph, WELL.z - 0.02); } else drop.visible = false;
    WU.uT.value = t; WU.uAge.value = ph >= fall ? ph - fall : ph + DRIP - fall;

    // palms (sway a touch; lean during the quake)
    for (let i = 0; i < NPALM; i++) {
      const p = PALMS[i];
      const sw = Math.sin(t * 0.9 + p.k * 6) * 0.015 + qk * Math.sin(t * 19 + p.k * 9) * 0.06;
      fe.set(p.lx + sw, 0, p.lz + sw * 0.6);
      fq.setFromEuler(fe);
      fm.compose(tv.set(p.x, p.h / 2, p.z), fq, fs.set(1, p.h, 1)); trunks.setMatrixAt(i, fm);
      tv2.set(0, p.h, 0).applyQuaternion(fq);
      fe.set(p.lx + sw, p.ry, p.lz + sw * 0.6); fq.setFromEuler(fe);
      fm.compose(tv.set(p.x + tv2.x, tv2.y, p.z + tv2.z), fq, fs.setScalar(1)); crowns.setMatrixAt(i, fm);
    }
    trunks.instanceMatrix.needsUpdate = true; crowns.instanceMatrix.needsUpdate = true;

    // dial
    const da = dialAng(t);
    needleG.rotation.z = da;
    const qd = t >= K.s6 ? ramp(t, tQ + 1.5, tQ + 2.2) : 0;
    dialG.rotation.x = -0.14 * qd; dialG.rotation.z = 0.08 * qd;
    hl.rotation.z = da >= 0 ? Math.PI / 2 : -Math.PI / 2;
    hlM.opacity = 0.35 * Math.abs(Math.sin(da)) * (t < tStop ? 1 : 0);

    // figures
    const pose = {};
    for (let i = 0; i < NF; i++) {
      figPose(i, t, pose);
      const lean = t >= A("s3:Datangkan") - 0.2 && t < K.s3e ? 0.12 * ramp(t, A("s3:Datangkan") - 0.2, A("s3:Datangkan") + 0.4) : 0.03;
      qa.setFromAxisAngle(AY, pose.f); qb.setFromAxisAngle(AX, lean); fq.copy(qa).multiply(qb);
      const s = Math.max(0.0001, pose.s);
      fm.compose(tv.set(pose.x, pose.bob, pose.z), fq, fs.set(s, s, s)); folk.setMatrixAt(i, fm);
    }
    folk.instanceMatrix.needsUpdate = true;

    // camel
    let cop = 0, px = Dk.x, pz = Dk.z, hd = 0, dist = 0, drink = 0;
    if (t < K.s2) {
      cop = ramp(t, A("s1:seekor") - 0.45, A("s1:seekor") + 0.2) * (1 - ramp(t, A("s1:seluruh") - 0.6, A("s1:seluruh") - 0.1));
      drink = 1;
    } else if (t >= tCamE - 0.2 && t < tGone) {
      cop = ramp(t, tCamE, tCamE + 1.3);
      const u = walkU(t);
      bez(u, tv); px = tv.x; pz = tv.z;
      bez(Math.min(1, u + 0.01), tv2); const dx = tv2.x - px, dz = tv2.z - pz;
      hd = u < 0.995 ? Math.atan2(-dz, dx) : 0;
      if (u <= 0) { bez(0.01, tv2); hd = Math.atan2(-(tv2.z - E.z), tv2.x - E.x); }
      dist = u * pathLen;
      drink = ramp(t, tWalk1 + 0.1, tWalk1 + 1.1) * (1 - ramp(t, A("s5:memanggil") - 0.2, A("s5:memanggil") + 0.8));
    }
    camel.visible = cop > 0.01;
    for (const mm of camelMats) mm.opacity = cop;
    camel.position.set(px, 0, pz); camel.rotation.y = hd;
    const ph2 = dist / 1.7 * Math.PI * 2;
    const walking = t >= tWalk0 && t < tWalk1 + 0.2;
    for (const L of LEGS) {
      const p = ph2 + (L.side > 0 ? 0 : Math.PI) + (L.front ? 0 : 0.35);
      L.hip.rotation.z = walking ? Math.sin(p) * 0.36 : 0;
      L.knee.rotation.z = walking ? (L.front ? -1 : 1) * Math.max(0, Math.sin(p + 1.3)) * 0.55 : 0;
    }
    camel.position.y = walking ? Math.abs(Math.sin(ph2)) * 0.03 : 0;
    neck.rotation.z = -1.05 * drink + (walking ? Math.sin(ph2 * 2) * 0.05 : Math.sin(t * 0.8) * 0.02);
    head.rotation.z = 0.55 * drink;
    // emergence glow at the cliff
    glowL.position.set(E.x + 0.8, 2.4, E.z); glowL.intensity = 9 * Math.sin(Math.PI * clamp01((t - tCamE + 0.3) / 1.9));

    // dust: camel emergence puff, then the quake plumes from every falling site
    for (let i = 0; i < 900; i++) {
      const s = dseed[i];
      let x = 0, y = -99, z = 0, col = 0.0;
      if (i < 140) {
        const age = t - tCamE + 0.2;
        if (age > 0 && age < 3.2) { const rr = 0.4 + age * (0.8 + s[0] * 1.4); const a = s[1] * 6.283; x = E.x + 0.6 + Math.cos(a) * rr * 0.6; z = E.z + Math.sin(a) * rr; y = 0.2 + s[2] * 2.2 + age * 0.4; col = 1 - age / 3.2; }
      } else {
        const site = SITES[i % SITES.length], st = siteT[i % SITES.length];
        const age = t - st - 0.25;
        if (age > 0 && t < K.s7 && i % 2 === 0) {
          const rr = 0.3 + Math.sqrt(age) * (1.2 + s[0] * 2.2), a = s[1] * 6.283;
          x = site.x + site.nx * (1 + age * 0.6) + Math.cos(a) * rr; z = site.z + site.nz * (1 + age * 0.6) + Math.sin(a) * rr;
          y = 0.2 + s[2] * site.h * 0.9 + age * (0.5 + s[3] * 0.9);
          col = Math.min(1, age * 3) * (1 - clamp01((age - 2) / 5)) * (1 - ramp(t, K.s7 - 0.3, K.s7 + 0.5));
        }
      }
      dust.pos[i * 3] = x; dust.pos[i * 3 + 1] = col > 0.01 ? y : -99; dust.pos[i * 3 + 2] = z;
      const c0 = 0.55 + 0.12 * s[3]; dust.col[i * 3] = c0; dust.col[i * 3 + 1] = c0 * 0.95; dust.col[i * 3 + 2] = c0 * 0.86;
    }
    dust.m.opacity = 0.2;
    dust.commit();

    // map inset: pin and tomb rise
    const pinA = back(clamp01((t - A("s7:Al-Hijr") + 0.2) / 0.6), 1.6);
    pinG.scale.set(1, Math.max(0.0001, pinA), 1); pinG.visible = t >= K.s7;
    const tomA = eout(clamp01((t - A("s7:makam") + 0.1) / 1.0));
    tombG.scale.set(1, Math.max(0.0001, tomA), 1); tombG.visible = tomA > 0.001;

    bp.strength = 0.12; bp.threshold = 0.96;
    comp.render();
  };
}
