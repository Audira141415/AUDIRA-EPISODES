// EP19 HUD DAN ANGIN KAUM 'AD. DISASTERSIM: a scientific wind-disaster simulation over a realistic sand-dune world.
// Iram (tall stone towers, "dzatil 'imad") stands on a flattened plateau at the origin; fortresses crown seven rocky mesas
// ("setiap tanah tinggi"); an oasis with springs, palms and a herd lies east; Nabi Hud is never shown: his presence is one
// small adobe house at the west edge of the dunes with a single lit window and a door lamp.
// Simulation layer: a wind-vector field of arrows on the ground, isobar rings around the moving low, a cloud bank that the
// sim plays forward in the hook and rewinds at s2, sand streams whose drift is the integral of wind speed (precomputed table).
// The storm erodes towers to stumps and houses to wall outlines in sand. No bodies are ever shown; people are faceless
// dark silhouettes, hidden once the sand thickens. The 'palm trunk' simile is never shown (palms sink into sand instead).
// Layout: +z toward the default camera, wind blows from -z (cloud side) toward +z. Hud house (-50,48), oasis (36,26),
// sensor beacon with the "SIM · AUDIRA" plate at (12,?,58). Every value is a pure function of t (seek-safe).
import * as THREE from "./three.module.js";
import { mulberry, ramp, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
const sm = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, u) => a + (b - a) * u;

export const MESAS = [[-70, -28, 13], [-44, -64, 15], [-6, -82, 16], [34, -68, 14], [68, -38, 13], [80, 6, 12], [-78, 14, 12]];
const HUD_HOUSE = [-50, 48], OASIS = [36, 26];
function rawDune(x, z) {
  const u = z * 0.05 + 0.8 * Math.sin(x * 0.021) + 1.4 * vnoise(x * 0.012, z * 0.012);
  const s = 0.5 + 0.5 * Math.sin(u + 0.7 * Math.sin(u));
  return 6.5 * s * s + 9 * vnoise(x * 0.007 + 5, z * 0.007) - 2.5;
}
export function mesaW(x, z) {
  let w = 0;
  for (const [mx, mz] of MESAS) { const d = Math.hypot(x - mx, z - mz); w = Math.max(w, sm((15 - d) / 7)); }
  return w;
}
export function H(x, z) {
  let h = rawDune(x, z);
  for (const [mx, mz, mh] of MESAS) {
    const d = Math.hypot(x - mx, z - mz);
    const top = mh + 0.6 * (vnoise(x * 0.3, z * 0.3) - 0.5);
    h = lerp(h, top, sm((15 - d) / 7));
  }
  const r = Math.hypot(x, z);
  h = lerp(h, 2 + 0.25 * (vnoise(x * 0.2, z * 0.2) - 0.5), sm((40 - r) / 12));
  h = lerp(h, 1.0, sm((19 - Math.hypot(x - OASIS[0], z - OASIS[1])) / 8));
  h = lerp(h, 3.0, sm((10 - Math.hypot(x - HUD_HOUSE[0], z - HUD_HOUSE[1])) / 6));
  return h;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x8a7f74, fog: 0.0035, exp: 1.0, bloom: [0.35, 0.55, 0.85], shadow: true });
  cam.far = 1400; cam.updateProjectionMatrix();
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const C = (h) => new THREE.Color(h);

  // ---------- timeline of the simulation
  const tGust = A("s1:Ternyata"), tDestroy = A("s1:menghancurkan"), tRumah = A("s1:rumah");
  const tRew = K.s2;
  const tStorm = A("s6:Ternyata"), tBlow = A("s6:berhembus");
  const C0 = tBlow, C1 = A("s7:tersisa") + 0.4;          // day/night counter span: 15 phases (8 days, 7 nights)
  const tCalm = A("s7:Pendengaran");
  // wind speed 0..1
  function W(t) {
    if (t < tRew) return 0.08 + 0.25 * ramp(t, A("s1:awan"), tGust) + 0.67 * ramp(t, tGust, tDestroy + 0.4);
    if (t < K.s6) return 0.07 + 0.05 * ramp(t, K.s5, K.s6);
    if (t < tStorm) return 0.12 + 0.18 * ramp(t, K.s6, tStorm);
    if (t < C1 - 1) return 0.3 + 0.7 * ramp(t, tStorm, tBlow);
    return 0.06 + 0.94 * (1 - ramp(t, C1 - 1, tCalm + 1.2)) * 0.85 + 0.15 * (1 - ramp(t, tCalm, K.s8 + 3));
  }
  // erosion 0..1 (the hook previews it, s2 rewinds it, the storm makes it final)
  function E(t) {
    if (t < tRew + 0.6) return 0.8 * ramp(t, tDestroy, tRumah + 0.4) * (1 - ramp(t, tRew - 0.05, tRew + 0.55));
    return ramp(t, tBlow + 0.3, C1 - 0.6);
  }
  // fortresses on the mesas: built in the hook, sink on the rewind, rise again at "istana ... tanah tinggi"
  const tB0 = A("s3:istana") - 0.3, tB1 = A("s3:kekal");
  function build(t, k) {
    if (t < tRew + 0.6) return 1 - ramp(t, tRew - 0.05, tRew + 0.55);
    if (t < K.s3) return 0;
    const a = tB0 + (tB1 - tB0) * (k / MESAS.length) * 0.85;
    return ramp(t, a, a + 1.1);
  }
  // cloud bank depth (z of its front)
  function cloudZ(t) {
    if (t < tRew + 0.6) return lerp(lerp(-270, -150, ramp(t, 0, tGust)), -700, ramp(t, tRew - 0.05, tRew + 0.55)) + 60 * ramp(t, tGust, tDestroy);
    if (t < K.s6 - 0.5) return -700;
    return lerp(lerp(-380, -150, ramp(t, K.s6 - 0.5, A("s6:hujan"))), 30, ramp(t, A("s6:hujan"), tBlow + 0.8));
  }
  const cloudOp = (t) => (t < tRew + 0.6 ? 1 - ramp(t, tRew, tRew + 0.5) : t < K.s6 - 0.5 ? 0 : ramp(t, K.s6 - 0.5, K.s6 + 0.6) * (1 - 0.75 * ramp(t, tBlow, C1)));
  // counter phases
  const phase = (t) => clamp01((t - C0) / (C1 - C0)) * 15;
  const nightness = (t) => (t < C0 || t > C1 ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * (phase(t) - 0.5)) * 1) * (1 - ramp(t, C1 - 0.6, C1));

  // ---------- textures
  const ripple = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, w, w);
    for (let y = 0; y < w; y += 1) { const v = 128 + 50 * Math.sin(y * 0.42 + 2.2 * Math.sin(y * 0.05)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, w, 1); }
    const R = mulberry(19); for (let i = 0; i < 2600; i++) { const v = R() < 0.5 ? 70 : 190; g.fillStyle = `rgba(${v},${v},${v},.25)`; g.fillRect(R() * w, R() * w, 1.5, 1.5); }
  }, [90, 90]);
  const stoneTex = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = "#b8916a"; g.fillRect(0, 0, w, h);
    const R = mulberry(5);
    for (let y = 0; y < h; y += 32) {
      const off = (y / 32) % 2 ? 0 : 32;
      for (let x = -64; x < w + 64; x += 64) {
        const v = 150 + R() * 45; g.fillStyle = `rgb(${v + 30},${v + 4},${v - 30})`; g.fillRect(x + off + 2, y + 2, 60, 28);
      }
      g.fillStyle = "rgba(70,45,25,.55)"; g.fillRect(0, y, w, 2);
    }
    // narrow window slits and vertical pilaster grooves
    g.fillStyle = "rgba(40,24,12,.85)";
    for (let k = 0; k < 4; k++) for (let y = 40; y < h; y += 128) g.fillRect(24 + k * 64, y, 9, 46);
    g.fillStyle = "rgba(60,38,20,.35)"; for (let k = 0; k < 8; k++) g.fillRect(k * 32 + 14, 0, 3, h);
  }, [3, 1]);
  const adobeTex = canvasTex(256, 256, (g, w) => {
    g.fillStyle = "#c9a57c"; g.fillRect(0, 0, w, w);
    const R = mulberry(9); for (let i = 0; i < 900; i++) { const v = R() < 0.5 ? 150 : 215; g.fillStyle = `rgba(${v},${v - 25},${v - 60},.25)`; g.fillRect(R() * w, R() * w, 3, 2); }
  }, [1, 1]);
  const puff = canvasTex(128, 128, (g, w) => {
    const R = mulberry(31);
    for (let i = 0; i < 26; i++) {
      const x = w / 2 + (R() - 0.5) * w * 0.5, y = w / 2 + (R() - 0.5) * w * 0.4, rr = w * (0.12 + R() * 0.2);
      const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    }
  });

  // ---------- sky dome
  const skyU = { top: { value: C(0x30394a) }, hor: { value: C(0xd8b48a) }, sun: { value: new THREE.Vector3(0, 0.3, -1) }, sunC: { value: C(0xffc080) }, sunI: { value: 0.6 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,hor,sun,sunC;uniform float sunI;varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(hor,top,pow(h,.38));float s=max(dot(normalize(vP),normalize(sun)),0.);c+=sunC*(pow(s,600.)*2.2+pow(s,12.)*.35)*sunI;if(vP.y<0.)c=hor*.92;gl_FragColor=vec4(c,1.);}",
  }));
  scene.add(sky);

  // ---------- lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x664a30, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.05;
  Object.assign(key.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 1, far: 500 });
  scene.add(key); scene.add(key.target);
  const lamp = new THREE.PointLight(0xffb060, 0, 22, 1.6); lamp.position.set(HUD_HOUSE[0] + 0.4, H(HUD_HOUSE[0], HUD_HOUSE[1]) + 2.2, HUD_HOUSE[1] + 2.6); scene.add(lamp);

  const ST = {
    HOOK: { top: C(0x2a303c), hor: C(0xe0a774), kc: C(0xffc08a), ki: 2.4, az: 70, el: 12, hs: C(0x9aa4b4), hg: C(0x6a4a30), hi: 0.75, fog: 0.0028, exp: 1.0, sunI: 1, sunC: C(0xffa860), lamp: 0.4 },
    DAY: { top: C(0x5b8fc4), hor: C(0xe8d2b0), kc: C(0xfff0d8), ki: 3.0, az: 35, el: 48, hs: C(0xbcd2ea), hg: C(0x8a6440), hi: 0.95, fog: 0.0022, exp: 1.0, sunI: 0.7, sunC: C(0xfff0d0), lamp: 0.25 },
    GOLD: { top: C(0x4a72a8), hor: C(0xf2c08a), kc: C(0xffc890), ki: 2.8, az: -60, el: 20, hs: C(0xa8bcd8), hg: C(0x7a5232), hi: 0.85, fog: 0.0024, exp: 1.0, sunI: 1, sunC: C(0xffb070), lamp: 0.7 },
    DUSK: { top: C(0x2c3358), hor: C(0xe58a5a), kc: C(0xff9a5c), ki: 1.7, az: -80, el: 8, hs: C(0x6c6a96), hg: C(0x4a3024), hi: 0.75, fog: 0.0026, exp: 1.08, sunI: 1, sunC: C(0xff8a50), lamp: 1.4 },
    GLOOM: { top: C(0x1c222c), hor: C(0x6d6458), kc: C(0xc8b8a4), ki: 1.2, az: 20, el: 30, hs: C(0x6a7484), hg: C(0x3a2e24), hi: 0.8, fog: 0.0032, exp: 1.05, sunI: 0.1, sunC: C(0xffd0a0), lamp: 0.9 },
    STORM: { top: C(0x1a2533), hor: C(0x55677a), kc: C(0x9ab4d4), ki: 1.3, az: 15, el: 35, hs: C(0x7d93ae), hg: C(0x2e3440), hi: 0.95, fog: 0.0075, exp: 1.12, sunI: 0, sunC: C(0xffffff), lamp: 0.9 },
    NIGHT: { top: C(0x070b14), hor: C(0x1f2a3a), kc: C(0x7088b0), ki: 0.7, az: -30, el: 40, hs: C(0x3a4a66), hg: C(0x151820), hi: 0.75, fog: 0.007, exp: 1.25, sunI: 0, sunC: C(0xffffff), lamp: 1.1 },
    AFTER: { top: C(0x6f8296), hor: C(0xcabaa6), kc: C(0xe8e0d4), ki: 1.9, az: 50, el: 26, hs: C(0xaab6c4), hg: C(0x6a5644), hi: 0.95, fog: 0.0042, exp: 1.0, sunI: 0.4, sunC: C(0xfff0e0), lamp: 0.5 },
    CALM: { top: C(0x2e3a64), hor: C(0xeaa070), kc: C(0xffb07a), ki: 1.9, az: -70, el: 10, hs: C(0x7e7ca4), hg: C(0x5a3a28), hi: 0.8, fog: 0.0022, exp: 1.05, sunI: 1, sunC: C(0xff9a60), lamp: 1.5 },
  };
  const MOOD = [[0, "HOOK"], [tRew - 0.1, "HOOK"], [tRew + 0.7, "DAY"], [K.s3 - 0.3, "DAY"], [K.s3 + 0.8, "GOLD"], [K.s4 - 0.3, "GOLD"], [K.s4 + 0.7, "DAY"],
    [K.s5 - 0.3, "DAY"], [K.s5 + 1.2, "DUSK"], [K.s6 - 0.3, "DUSK"], [K.s6 + 1.4, "GLOOM"], [tStorm, "GLOOM"], [tBlow, "STORM"], [C1 - 0.6, "STORM"], [C1 + 1.2, "AFTER"],
    [K.s8 - 0.5, "AFTER"], [K.s8 + 2.5, "CALM"], [K.dur, "CALM"]];
  const M = { top: new THREE.Color(), hor: new THREE.Color(), kc: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color(), sunC: new THREE.Color() };
  const kDir = new THREE.Vector3();
  const CK = ["top", "hor", "kc", "hs", "hg", "sunC"], NK = ["ki", "az", "el", "hi", "fog", "exp", "sunI", "lamp"];
  function mood(t) {
    let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++;
    const a = ST[MOOD[i][1]], b = ST[MOOD[i + 1][1]];
    const u = sm((t - MOOD[i][0]) / Math.max(0.001, MOOD[i + 1][0] - MOOD[i][0]));
    for (const k of CK) M[k].copy(a[k]).lerp(b[k], u);
    for (const k of NK) M[k] = a[k] + (b[k] - a[k]) * u;
    const n = nightness(t) * 0.85;
    if (n > 0) { const N = ST.NIGHT; for (const k of CK) M[k].lerp(N[k], n); for (const k of NK) M[k] = M[k] + (N[k] - M[k]) * n; }
    const az = M.az * Math.PI / 180, el = M.el * Math.PI / 180;
    kDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));
    return M;
  }

  // ---------- terrain
  const TS = 760, TN = 300;
  const tg = new THREE.PlaneGeometry(TS, TS, TN, TN); tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position, tcol = new Float32Array(tp.count * 3);
  const cSand = C(0xd9a66c), cShade = C(0xb98450), cRock = C(0x9c7452), cPlat = C(0xc79a6c), tmp = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i), y = H(x, z); tp.setY(i, y);
    const sl = H(x, z + 1.5) - H(x, z - 1.5);
    tmp.copy(cSand).lerp(cShade, clamp01(-sl * 0.35 + 0.15));
    tmp.lerp(cRock, mesaW(x, z) * 0.75);
    tmp.lerp(cPlat, sm((38 - Math.hypot(x, z)) / 10) * 0.5);
    const n = 0.92 + 0.12 * vnoise(x * 0.15, z * 0.15); tcol[i * 3] = tmp.r * n; tcol[i * 3 + 1] = tmp.g * n; tcol[i * 3 + 2] = tmp.b * n;
  }
  tg.setAttribute("color", new THREE.BufferAttribute(tcol, 3)); tg.computeVertexNormals();
  const ground = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, bumpMap: ripple, bumpScale: 0.6 }));
  ground.receiveShadow = true; scene.add(ground);

  // ---------- materials
  const stone = new THREE.MeshStandardMaterial({ color: 0xffffff, map: stoneTex, roughness: 0.88 });
  const stoneDark = new THREE.MeshStandardMaterial({ color: 0x9a7452, roughness: 0.9 });
  const adobe = new THREE.MeshStandardMaterial({ color: 0xffffff, map: adobeTex, roughness: 0.95 });
  const adobeRoof = new THREE.MeshStandardMaterial({ color: 0xa88560, roughness: 0.95 });
  const robe = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 1 });
  const add = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };

  // ---------- Iram towers
  const R = mulberry(1919);
  const towers = [];
  const tpos = [[0, -4, 1.25]];
  for (let k = 0; k < 400 && tpos.length < 15; k++) {
    const a = R() * Math.PI * 2, rr = 7 + R() * 19, x = Math.cos(a) * rr, z = Math.sin(a) * rr * 0.9 - 2;
    if (tpos.every(([px, pz]) => Math.hypot(px - x, pz - z) > 7.5)) tpos.push([x, z, 0.65 + R() * 0.45]);
  }
  const SEGH = 2.7;
  for (const [x, z, s] of tpos) {
    const g = new THREE.Group(); g.position.set(x, H(x, z) - 0.2, z); scene.add(g);
    const nseg = Math.round(5 + s * 4), r0 = 1.5 + s * 1.3;
    const segs = [];
    for (let j = 0; j < nseg; j++) {
      const rb = r0 * (1 - j * 0.045), rt = r0 * (1 - (j + 1) * 0.045);
      const sg = new THREE.Group(); sg.position.y = j * SEGH; g.add(sg);
      const body = add(new THREE.CylinderGeometry(rt, rb, SEGH, 12), stone, 0, SEGH / 2, 0, sg);
      const ring = add(new THREE.CylinderGeometry(rt * 1.1, rt * 1.1, 0.28, 12), stoneDark, 0, SEGH - 0.14, 0, sg);
      segs.push({ sg, body, ring });
    }
    const crown = new THREE.Group(); g.add(crown);
    const rTop = r0 * (1 - nseg * 0.045);
    for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI * 2; add(new THREE.BoxGeometry(0.5, 0.7, 0.5), stoneDark, Math.cos(a) * rTop * 0.95, 0.35, Math.sin(a) * rTop * 0.95, crown); }
    towers.push({ g, segs, crown, nseg, seed: R() });
  }

  // ---------- houses (walls + roof so erosion can leave outlines)
  const houses = [];
  for (let k = 0; k < 600 && houses.length < 46; k++) {
    const a = R() * Math.PI * 2, rr = 9 + R() * 27, x = Math.cos(a) * rr, z = Math.sin(a) * rr - 1;
    if (tpos.some(([px, pz, s]) => Math.hypot(px - x, pz - z) < 3.6 + s * 1.5)) continue;
    if (houses.some((h) => Math.hypot(h.x - x, h.z - z) < 5)) continue;
    const w = 2.6 + R() * 1.6, d = 2.6 + R() * 1.6, hh = 2.1 + R() * 0.7, th = 0.3;
    const g = new THREE.Group(); g.position.set(x, H(x, z) - 0.05, z); g.rotation.y = Math.round(R() * 3) * Math.PI / 2 + (R() - 0.5) * 0.3; scene.add(g);
    const walls = new THREE.Group(); g.add(walls);
    add(new THREE.BoxGeometry(w, 1, th), adobe, 0, 0.5, d / 2, walls); add(new THREE.BoxGeometry(w, 1, th), adobe, 0, 0.5, -d / 2, walls);
    add(new THREE.BoxGeometry(th, 1, d), adobe, w / 2, 0.5, 0, walls); add(new THREE.BoxGeometry(th, 1, d), adobe, -w / 2, 0.5, 0, walls);
    const roof = add(new THREE.BoxGeometry(w + 0.25, 0.22, d + 0.25), adobeRoof, 0, hh + 0.11, 0, g);
    const door = add(new THREE.PlaneGeometry(0.7, 1.3), new THREE.MeshBasicMaterial({ color: 0x241a12 }), 0, 0.65, d / 2 + th / 2 + 0.01, g);
    houses.push({ x, z, g, walls, roof, door, hh, seed: R() });
  }

  // ---------- fortresses on the high grounds + HUD rings
  const forts = [], ringMat = new THREE.MeshBasicMaterial({ color: 0x5ce1e6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  MESAS.forEach(([mx, mz, mh], k) => {
    const g = new THREE.Group(); g.position.set(mx, H(mx, mz) - 0.3, mz); g.rotation.y = R() * 1.5; scene.add(g);
    const S = 8 + R() * 3, wh = 3.2;
    add(new THREE.BoxGeometry(S, wh, 0.8), stone, 0, wh / 2, S / 2, g); add(new THREE.BoxGeometry(S, wh, 0.8), stone, 0, wh / 2, -S / 2, g);
    add(new THREE.BoxGeometry(0.8, wh, S), stone, S / 2, wh / 2, 0, g); add(new THREE.BoxGeometry(0.8, wh, S), stone, -S / 2, wh / 2, 0, g);
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) add(new THREE.CylinderGeometry(1.1, 1.3, 6.5, 10), stone, sx * S / 2, 3.25, sz * S / 2, g);
    add(new THREE.BoxGeometry(3.6, 9 + R() * 3, 3.6), stone, 0, 5, 0, g);
    const ring = new THREE.Mesh(new THREE.RingGeometry(10, 10.6, 64), ringMat.clone()); ring.rotation.x = -Math.PI / 2; ring.position.set(mx, H(mx, mz) + 0.5, mz); scene.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 30, 6), ringMat.clone()); beam.position.set(mx, H(mx, mz) + 15, mz); scene.add(beam);
    forts.push({ g, ring, beam, k });
  });

  // ---------- Hud's house (never a figure: one lit window, one door lamp)
  const hh0 = H(HUD_HOUSE[0], HUD_HOUSE[1]);
  const hudG = new THREE.Group(); hudG.position.set(HUD_HOUSE[0], hh0 - 0.1, HUD_HOUSE[1]); hudG.rotation.y = 0.35; scene.add(hudG);
  add(new THREE.BoxGeometry(4.4, 3, 3.8), adobe, 0, 1.5, 0, hudG);
  add(new THREE.BoxGeometry(4.8, 0.25, 4.2), adobeRoof, 0, 3.1, 0, hudG);
  add(new THREE.BoxGeometry(1.6, 1.2, 0.3), adobe, 1.6, 0.6, 2.2, hudG);
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffb35a });
  add(new THREE.PlaneGeometry(0.9, 0.75), winMat, -1.0, 1.85, 1.91, hudG).castShadow = false;
  add(new THREE.PlaneGeometry(0.85, 1.6), new THREE.MeshBasicMaterial({ color: 0x1e140c }), 0.6, 0.8, 1.91, hudG);
  const lampBulb = add(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd28a }), 1.25, 2.2, 2.15, hudG); lampBulb.castShadow = false;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: 0xffa94a, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(1.6, 1.6, 1); glow.position.set(1.25, 2.2, 2.3); hudG.add(glow);
  const wglow = glow.clone(); wglow.material = glow.material.clone(); wglow.scale.set(1.5, 1.2, 1); wglow.position.set(-1.0, 1.85, 2.0); hudG.add(wglow);

  // ---------- oasis: springs, palms, bushes, herd
  const springs = [[32, 23, 3.4], [41, 30, 2.6], [37, 17, 2.2]].map(([x, z, s]) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(s, 40), new THREE.MeshStandardMaterial({ color: 0x2f8fb0, roughness: 0.08, metalness: 0.3, emissive: 0x0c3a4a, emissiveIntensity: 0.6 }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, H(x, z) + 0.06, z); m.receiveShadow = true; scene.add(m); return { m, s };
  });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x5b7a2e, roughness: 0.8, side: THREE.DoubleSide });
  const trunkM = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95 });
  const palms = [];
  for (let k = 0; k < 16; k++) {
    const a = R() * Math.PI * 2, rr = 5 + R() * 12, x = OASIS[0] + Math.cos(a) * rr, z = OASIS[1] + Math.sin(a) * rr;
    if (springs.some(({ m, s }) => Math.hypot(m.position.x - x, m.position.z - z) < s + 1)) continue;
    const g = new THREE.Group(); g.position.set(x, H(x, z), z); scene.add(g);
    const ht = 5 + R() * 3;
    const tr = add(new THREE.CylinderGeometry(0.18, 0.3, ht, 7), trunkM, 0, ht / 2, 0, g); tr.rotation.z = (R() - 0.5) * 0.12;
    const crown = new THREE.Group(); crown.position.y = ht; g.add(crown);
    for (let q = 0; q < 8; q++) {
      const lf = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 3.4), leafM); lf.castShadow = true;
      const piv = new THREE.Group(); piv.rotation.y = q / 8 * Math.PI * 2 + R() * 0.3; crown.add(piv);
      lf.position.set(0, 0, 1.6); lf.rotation.x = -Math.PI / 2 + 0.55; piv.add(lf);
    }
    palms.push({ g, ht, seed: R() });
  }
  const bushM = new THREE.MeshStandardMaterial({ color: 0x6a8a3a, roughness: 0.9 });
  const bushes = [];
  for (let k = 0; k < 22; k++) {
    const a = R() * Math.PI * 2, rr = 4 + R() * 15, x = OASIS[0] + Math.cos(a) * rr, z = OASIS[1] + Math.sin(a) * rr;
    const m = add(new THREE.SphereGeometry(0.8 + R() * 0.8, 10, 8), bushM, x, H(x, z) + 0.3, z, scene); m.scale.y = 0.7; bushes.push({ m, y0: m.position.y, s: m.scale.x });
  }
  const woolM = new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 1 }), woolD = new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 1 });
  const herd = [];
  for (let k = 0; k < 12; k++) {
    const g = new THREE.Group(); scene.add(g);
    const mat = k % 4 === 3 ? woolD : woolM;
    add(new THREE.SphereGeometry(0.5, 12, 10), mat, 0, 0.75, 0, g).scale.set(1.35, 0.85, 0.85);
    add(new THREE.SphereGeometry(0.22, 10, 8), woolD, 0.72, 0.95, 0, g).scale.set(1.3, 0.9, 0.9);
    const legs = [];
    for (const [lx, lz] of [[0.38, 0.2], [0.38, -0.2], [-0.38, 0.2], [-0.38, -0.2]]) { const piv = new THREE.Group(); piv.position.set(lx, 0.5, lz); g.add(piv); add(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 5), woolD, 0, -0.25, 0, piv); legs.push(piv); }
    herd.push({ g, legs, a0: R() * Math.PI * 2, r0: 9 + R() * 7, sp: 0.02 + R() * 0.02, k });
  }

  // ---------- faceless silhouettes (no features, small, never comic)
  function person(h = 1) {
    const g = new THREE.Group(); scene.add(g);
    add(new THREE.CylinderGeometry(0.2, 0.42, 1.3, 10), robe, 0, 0.65, 0, g);
    const head = add(new THREE.SphereGeometry(0.19, 12, 10), robe, 0, 1.47, 0, g);
    add(new THREE.ConeGeometry(0.26, 0.4, 10), robe, 0, 1.43, -0.04, g);
    const arms = [-1, 1].map((s) => { const piv = new THREE.Group(); piv.position.set(s * 0.25, 1.22, 0); g.add(piv); add(new THREE.CylinderGeometry(0.1, 0.08, 0.8, 6), robe, 0, -0.4, 0, piv); return piv; });
    g.scale.setScalar(h);
    return { g, head, arms };
  }
  const crowdPos = [[7, 44], [9.2, 45.5], [11.5, 43.6], [13.4, 45.2], [5.2, 46.2], [15.6, 44.1], [10.4, 47.4]];
  const crowdHook = [[16, 114], [18.4, 115.6], [20.6, 113.4], [22.8, 115.2], [14.2, 116.4], [25, 114], [19.6, 117.6]];
  const crowd = crowdPos.map(([x, z], k) => ({ ...person(1 + (k % 3) * 0.05), x, z, k }));
  const elders = [[21, 31], [23, 32.4], [25, 31]].map(([x, z], k) => ({ ...person(1.05), x, z, k }));
  const challengers = [[-22, 33], [-24.5, 35.5], [-21, 36.6], [-26.6, 32.4], [-23.6, 38.6]].map(([x, z], k) => ({ ...person(1 + (k % 2) * 0.06), x, z, k }));
  function pose(p, { vis = true, x, z, yaw = 0, aL = [0, 0], aR = [0, 0], bob = 0, nod = 0 }) {
    p.g.visible = vis; if (!vis) return;
    p.g.position.set(x, H(x, z) + bob, z); p.g.rotation.y = yaw;
    p.arms[0].rotation.set(aL[0], 0, aL[1]); p.arms[1].rotation.set(aR[0], 0, aR[1]);
    p.head.position.y = 1.47 - nod;
  }

  // ---------- sensor beacon with the AUDIRA plate (simulation instrument inside the world)
  const BX = 12, BZ = 58, bh = H(BX, BZ);
  const beacon = new THREE.Group(); beacon.position.set(BX, bh, BZ); beacon.rotation.y = 0.25; scene.add(beacon);
  add(new THREE.CylinderGeometry(0.07, 0.09, 3.4, 8), new THREE.MeshStandardMaterial({ color: 0x9aa4ae, metalness: 0.6, roughness: 0.4 }), 0, 1.7, 0, beacon);
  const cup = add(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: 0xcfd6dc, metalness: 0.5, roughness: 0.3 }), 0, 3.5, 0, beacon);
  const vane = new THREE.Group(); vane.position.y = 3.5; beacon.add(vane);
  for (let q = 0; q < 3; q++) { const arm = new THREE.Group(); arm.rotation.y = q * 2.094; vane.add(arm); add(new THREE.BoxGeometry(0.5, 0.03, 0.03), cup.material, 0.25, 0, 0, arm); add(new THREE.SphereGeometry(0.08, 8, 6, 0, Math.PI), cup.material, 0.5, 0, 0, arm); }
  const led = add(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5ce1e6 }), 0, 3.15, 0.1, beacon);
  const plateTex = canvasTex(512, 160, (g, w, h) => {
    g.fillStyle = "#0d1a22"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5ce1e6"; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = "#5ce1e6"; g.font = "bold 70px sans-serif"; g.textBaseline = "middle"; g.fillText("SIM · AUDIRA", 30, h / 2 - 12);
    g.fillStyle = "#c8e8ec"; g.font = "bold 28px sans-serif"; g.fillText("STASIUN ANGIN 01", 32, h / 2 + 46);
  });
  const plate = add(new THREE.PlaneGeometry(1.5, 0.47), new THREE.MeshBasicMaterial({ map: plateTex }), 0, 1.75, 0.1, beacon); plate.castShadow = false;
  add(new THREE.BoxGeometry(1.6, 0.56, 0.08), new THREE.MeshStandardMaterial({ color: 0x3a444c, metalness: 0.5, roughness: 0.5 }), 0, 1.75, 0.03, beacon);

  // ---------- labels (sim callouts)
  function label(text, sub, w) {
    const tex = canvasTex(512, 160, (g, W2, Hh) => {
      g.fillStyle = "rgba(8,18,24,.72)"; g.fillRect(0, 0, W2, Hh);
      g.fillStyle = "#5ce1e6"; g.fillRect(0, 0, 10, Hh);
      g.fillStyle = "#ffffff"; g.font = "bold 76px sans-serif"; g.textBaseline = "middle"; g.fillText(text, 34, sub ? 58 : Hh / 2);
      if (sub) { g.fillStyle = "#9fe8ec"; g.font = "bold 32px sans-serif"; g.fillText(sub, 36, 122); }
    });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false }));
    s.scale.set(w, w * 160 / 512, 1); s.renderOrder = 5; scene.add(s); return s;
  }
  const labIram = label("IRAM", "BANGUNAN TINGGI", 16); labIram.position.set(2, 15, 22);
  const labAhq = label("AL-AHQAF", "BUKIT-BUKIT PASIR", 26); labAhq.position.set(10, 22, -30); labAhq.center.set(1, 0.5);
  const boxGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(58, 30, 56));
  const iramBox = new THREE.LineSegments(boxGeo, new THREE.LineBasicMaterial({ color: 0x5ce1e6, transparent: true, opacity: 0, depthWrite: false }));
  iramBox.position.set(0, 16, -3); scene.add(iramBox);

  // ---------- wind-vector field
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, -0.07); arrowShape.lineTo(0.72, -0.07); arrowShape.lineTo(0.72, -0.22); arrowShape.lineTo(1, 0); arrowShape.lineTo(0.72, 0.22); arrowShape.lineTo(0.72, 0.07); arrowShape.lineTo(0, 0.07);
  const ag = new THREE.ShapeGeometry(arrowShape); ag.rotateX(-Math.PI / 2);
  const GX = 17, GZ = 15, NAR = GX * GZ;
  const arrowM = new THREE.MeshBasicMaterial({ color: 0x5ce1e6, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const arrows = new THREE.InstancedMesh(ag, arrowM, NAR); arrows.frustumCulled = false; scene.add(arrows);
  const aBase = []; for (let i = 0; i < GX; i++) for (let j = 0; j < GZ; j++) { const x = -96 + i * 12, z = -100 + j * 12; aBase.push([x, z, H(x, z)]); }
  const dummy = new THREE.Object3D();
  const WA = Math.atan2(1, 0.35), WD = [Math.cos(WA), Math.sin(WA)];   // base wind direction (mostly +z)

  // ---------- isobars around the moving low
  const NISO = 5, ISEG = 120;
  const isos = [];
  for (let k = 0; k < NISO; k++) {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ISEG * 3), 3));
    const l = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: k % 2 ? 0x8fb8ff : 0x5ce1e6, transparent: true, opacity: 0, depthWrite: false }));
    l.frustumCulled = false; scene.add(l); isos.push(l);
  }

  // ---------- cloud bank
  const clouds = [];
  for (let k = 0; k < 110; k++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: 0x3a3f4a, transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
    const sc = 50 + R() * 70; s.scale.set(sc * 1.6, sc, 1);
    clouds.push({ s, x: -300 + R() * 600, y: 18 + R() * 60 + (k % 3) * 10, dz: R() * 90, sc }); scene.add(s);
  }

  // ---------- sand: precomputed drift distance = integral of wind speed (seek-safe)
  const DT = 1 / 30, NT = Math.ceil((K.dur + 1) / DT);
  const Dtab = new Float32Array(NT + 1);
  for (let i = 1; i <= NT; i++) Dtab[i] = Dtab[i - 1] + (1.2 + 30 * W(i * DT)) * DT;
  const Dist = (t) => { const f = clamp01(t / (NT * DT)) * NT, i = Math.min(NT - 1, Math.floor(f)); return Dtab[i] + (Dtab[i + 1] - Dtab[i]) * (f - i); };
  const NS = 4200, sand = pts(scene, NS, { color: 0xd9b07a, size: 0.55, add: false, opacity: 0.8 });
  const NH = 240, haze = pts(scene, NH, { color: 0xb8a088, size: 26, add: false, opacity: 0.16 });
  const sR = mulberry(77), sseed = [], hseed = [];
  for (let i = 0; i < NS; i++) sseed.push([sR(), sR() * 320 - 160, 0.25 + Math.pow(sR(), 2.6) * 16, 0.6 + sR() * 0.8, sR()]);
  for (let i = 0; i < NH; i++) hseed.push([sR(), sR() * 320 - 160, 2 + sR() * 18, 0.5 + sR() * 0.5, sR()]);
  const PX = -WD[1], PZ = WD[0];

  // ---------- camera
  const CAM = track([
    [0, 34, 15, 158, 0, 16, -80],
    [A("s1:bersorak"), 32, 15, 152, 0, 16, -80],
    [tGust, 28, 16, 140, 0, 14, -60],
    [tDestroy, 20, 20, 110, 0, 8, -20],
    [tRumah, 10, 24, 80, 0, 4, 0],
    [K.s1e, 8, 26, 74, 0, 4, 0],
    [K.s2 + 0.9, 40, 70, 160, 0, 4, -14],
    [A("s2:Al-Ahqaf") + 0.4, 72, 58, 140, 4, 6, -14],
    [A("s2:Iram"), 46, 24, 74, 0, 13, -4],
    [A("s2:dibangun"), 24, 8, 48, 0, 16, -4],
    [K.s2e, 20, 6.5, 44, -2, 17, -4],
    [K.s3 + 0.6, -36, 16, 74, -49, 3, 46],
    [A("s3:apakah"), -40, 18, 84, -30, 8, 12],
    [A("s3:istana"), -14, 46, 128, 0, 6, -24],
    [A("s3:tanah") + 0.5, 28, 60, 132, 0, 6, -30],
    [A("s3:benteng-benteng"), 64, 46, 100, 8, 8, -30],
    [K.s3e, 72, 38, 84, 18, 10, -30],
    [K.s4 + 0.7, 72, 13, 68, 34, 3, 20],
    [A("s4:kebun"), 60, 9.5, 58, 34, 3, 22],
    [A("s4:air"), 54, 8, 50, 34, 2, 24],
    [A("s4:Jawab") + 0.3, 8, 14, 54, 23, 2, 31],
    [A("s4:adat"), 10, 14.5, 57, 22, 2, 30],
    [K.s4e, 14, 15, 60, 20, 3, 28],
    [K.s5 + 0.7, -8, 22, 60, -24, 2, 34],
    [A("s5:benar"), -11, 21, 63, -27, 2, 36],
    [A("s5:Hud") + 0.3, -34, 13, 74, -50, 3, 47],
    [A("s5:menyampaikan"), -37, 12, 71, -50, 3, 47],
    [K.s5e, -38, 12, 70, -40, 5, 40],
    [K.s6 + 0.7, 20, 10, 104, 0, 18, -40],
    [A("s6:hujan"), 14, 9, 94, 0, 18, -30],
    [tStorm, 11, 10, 88, 0, 14, -20],
    [tBlow, 9, 14, 80, 0, 10, -10],
    [K.s6e, 7, 18, 74, 0, 8, -6],
    [K.s7 + 0.5, 30, 42, 94, 0, 2, -6],
    [A("s7:tersisa"), 18, 22, 60, 0, 1, 0],
    [tCalm, 8, 14, 46, 0, 1, 4],
    [K.s7e, 1, 13, 44, 0, 1, 2],
    [K.s8 + 1, -16, 24, 98, -16, 6, 20],
    [A("s8:Menurut"), -38, 16, 78, -48, 3, 46],
    [A("s8:Menurut") + 2.6, -36, 17, 81, -48, 3, 45],
    [A("s8:Kisah"), -30, 22, 122, -30, 6, 20],
    [K.dur, -28, 26, 132, -26, 6, 10],
  ]);

  const v3 = new THREE.Vector3();
  return (t) => {
    const m = mood(t), w = W(t), e = E(t), n = nightness(t);
    // sky + light
    skyU.top.value.copy(m.top); skyU.hor.value.copy(m.hor); skyU.sunC.value.copy(m.sunC); skyU.sunI.value = m.sunI; skyU.sun.value.copy(kDir);
    scene.background.copy(m.hor); scene.fog.color.copy(m.hor); scene.fog.density = m.fog;
    r.toneMappingExposure = m.exp;
    key.color.copy(m.kc); key.intensity = m.ki; key.position.copy(kDir).multiplyScalar(220); key.target.position.set(0, 0, 0);
    hemi.color.copy(m.hs); hemi.groundColor.copy(m.hg); hemi.intensity = m.hi;
    const lampOn = t >= K.s3 - 0.5 ? 1 : 0.6;
    lamp.intensity = 6 * m.lamp * lampOn; glow.material.opacity = 0.4 * Math.min(1, m.lamp) * lampOn; wglow.material.opacity = 0.3 * Math.min(1, m.lamp) * lampOn;
    bp.strength = 0.3 + 0.15 * n;

    // towers erode top-down to stumps
    towers.forEach((T, i) => {
      const ei = clamp01(e * (1.05 + 0.25 * T.seed) - 0.05 * T.seed);
      const keep = T.nseg * (1 - 0.82 * sm(ei));
      T.segs.forEach((S, j) => {
        const f = clamp01(keep - j);
        S.sg.visible = f > 0.02;
        S.sg.scale.y = Math.max(0.02, f);
        S.ring.visible = f > 0.98;
      });
      T.crown.visible = ei < 0.05; T.crown.position.y = T.nseg * SEGH;
    });
    // houses: roof goes, walls wear down to outlines
    houses.forEach((h) => {
      const ei = clamp01(e * (1.1 + 0.2 * h.seed));
      h.roof.visible = ei < 0.35 + 0.1 * h.seed; h.door.visible = ei < 0.3;
      h.walls.scale.y = h.hh * (1 - 0.86 * sm(ei));
    });
    // fortresses rise / sink; HUD rings pulse when they rise
    forts.forEach((F) => {
      const b = build(t, F.k);
      F.g.visible = b > 0.01;
      F.g.scale.y = Math.max(0.01, b * (1 - 0.78 * sm(e)));
      const pulse = t >= K.s3 && t < K.s4 + 0.3 ? sm(b * 3) * (1 - ramp(t, K.s4 - 0.6, K.s4 + 0.2)) : 0;
      F.ring.material.opacity = 0.75 * pulse; F.ring.scale.setScalar(1 + 0.15 * Math.sin(t * 3 + F.k));
      F.beam.material.opacity = 0.35 * pulse * (1 - b * 0.6);
    });
    // oasis: palms bend in the wind and sink into sand during the storm (no fallen trunks), springs get buried
    const bury = t >= tRew + 0.6 ? e : 0;
    palms.forEach((P) => {
      const sway = (0.04 + 0.4 * w) * (0.7 + 0.3 * Math.sin(t * (2 + 3 * w) + P.seed * 9));
      P.g.rotation.set(sway * Math.sin(WA), 0, -sway * Math.cos(WA));
      P.g.position.y = H(P.g.position.x, P.g.position.z) - (P.ht + 2) * sm(bury * 1.15);
      P.g.visible = bury < 0.95;
    });
    bushes.forEach((B) => { B.m.position.y = B.y0 - 2 * sm(bury * 1.2); B.m.visible = bury < 0.9; });
    springs.forEach((S) => { const k2 = Math.max(0.01, 1 - sm(bury * 1.3)); S.m.scale.setScalar(k2); S.m.visible = k2 > 0.02; });
    // herd grazing around the springs (calm scenes only)
    const herdOn = t < K.s6 + 2 && w < 0.45 && !(t < tRew && t > tGust);
    herd.forEach((Hd) => {
      Hd.g.visible = herdOn; if (!herdOn) return;
      const a = Hd.a0 + t * Hd.sp, x = OASIS[0] + Math.cos(a) * Hd.r0, z = OASIS[1] + Math.sin(a) * Hd.r0 * 0.8;
      Hd.g.position.set(x, H(x, z), z); Hd.g.rotation.y = -a - Math.PI;
      const st = Math.sin(t * 5 + Hd.k); Hd.legs.forEach((L, q) => { L.rotation.z = (q % 2 ? 1 : -1) * 0.35 * st; });
      Hd.g.children[1].position.y = 0.95 - 0.35 * (0.5 + 0.5 * Math.sin(t * 0.7 + Hd.k * 2));
    });
    // people: hook and s6 crowd point at the cloud happily; s4 elders shrug; s5 challengers raise their arms toward Hud's house
    const crowdOn = (t < tGust + 0.9) || (t >= K.s6 && t < tStorm + 0.7);
    crowd.forEach((p) => {
      const ph = t * 4.2 + p.k * 1.3, up = -0.25 + 0.12 * Math.sin(ph);
      const bob = 0.05 * Math.max(0, Math.sin(ph * 1.5));
      const [px, pz] = t < tRew ? crowdHook[p.k] : [p.x, p.z];
      pose(p, { vis: crowdOn, x: px, z: pz, yaw: Math.PI + 0.2 * Math.sin(p.k), aR: [-2.95 + up, -0.45], aL: p.k % 2 ? [-2.7 - up, 0.5] : [0.1, 0.12], bob, nod: -0.03 });
    });
    const eldOn = t >= K.s4 && t < K.s5;
    elders.forEach((p) => {
      const sh = ramp(t, A("s4:sama") - 0.2, A("s4:sama") + 0.3) * (1 - 0.6 * ramp(t, A("s4:adat") - 0.3, A("s4:adat") + 0.4)) + 0.6 * ramp(t, A("s4:kami") - 0.3, A("s4:kami") + 0.2) * (1 - ramp(t, K.s5 - 0.5, K.s5));
      const yaw = Math.atan2(30 - p.x, 48 - p.z);
      pose(p, { vis: eldOn, x: p.x, z: p.z, yaw, aL: [-0.9 * sh, 0.25 + 0.75 * sh], aR: [-0.9 * sh, -0.25 - 0.75 * sh], nod: 0.04 * sh });
    });
    const chOn = t >= K.s5 && t < A("s5:Hud") + 0.4;
    challengers.forEach((p) => {
      const ch = ramp(t, A("s5:menantang") - 0.3, A("s5:menantang") + 0.2) * (0.85 + 0.15 * Math.sin(t * 5 + p.k));
      const yaw = Math.atan2(HUD_HOUSE[0] - p.x, HUD_HOUSE[1] - p.z);
      pose(p, { vis: chOn, x: p.x, z: p.z, yaw, aR: [-1.5 - 0.9 * ch, 0], aL: [-0.4 * ch, 0.1], bob: 0 });
    });

    // cloud bank
    const cz = cloudZ(t), co = cloudOp(t);
    clouds.forEach((c, k) => {
      c.s.visible = co > 0.01;
      const roll = Math.sin(t * 0.25 + k) * 4;
      c.s.position.set(c.x + roll, c.y - 6 * ramp(cz, -200, 30), cz - c.dz);
      c.s.material.opacity = 0.92 * co;
      c.s.material.color.copy(m.top).lerp(m.hor, 0.12).multiplyScalar(0.5);
      c.s.material.rotation = k * 0.7 + t * 0.02 * (k % 2 ? 1 : -1);
    });

    // vector field
    let vis = t < tRew ? 0.45 : t < K.s6 ? 0.16 : t < tStorm ? 0.3 : t < C1 ? 0.55 : t < K.s8 ? 0.35 : 0.22;
    vis *= 1 - ramp(t, K.end - 1.5, K.end + 0.2) * 0.7;
    arrowM.opacity = vis;
    const len = 2.0 + 3.5 * w, cvA = CAM(t);
    for (let i = 0; i < NAR; i++) {
      const [x, z, h] = aBase[i];
      const swirl = (1 - w) * 0.9 * Math.sin(x * 0.035 + t * 0.3) * Math.cos(z * 0.03 - t * 0.22) + w * 0.18 * Math.sin(x * 0.05 + t * 2.5 + z * 0.02);
      const a = WA + swirl;
      dummy.position.set(x - Math.cos(a) * len * 0.5, h + 0.45 + 0.25 * Math.sin(t * 2 + i), z - Math.sin(a) * len * 0.5);
      dummy.rotation.set(0, -a, 0);
      const nf = sm((Math.hypot(x - cvA[0], z - cvA[2]) - 18) / 26);
      dummy.scale.set(Math.max(0.001, len * nf), 1, Math.max(0.001, (1.3 + 1.2 * w) * nf));
      dummy.updateMatrix(); arrows.setMatrixAt(i, dummy.matrix);
    }
    arrows.instanceMatrix.needsUpdate = true;

    // isobars (centre follows the cloud's low)
    const icx = 10, icz = Math.max(-120, cz + 40);
    const iso = (t < tRew ? 0.35 : t < K.s6 ? 0.1 : t < C1 ? 0.45 : 0.15) * (1 - ramp(t, K.end - 1.5, K.end));
    isos.forEach((L, k) => {
      const p = L.geometry.attributes.position.array, rad = 26 + k * 20 - 6 * w;
      for (let q = 0; q < ISEG; q++) {
        const a = q / ISEG * Math.PI * 2, rr = rad * (1 + 0.12 * Math.sin(a * 3 + k + t * 0.4) + 0.06 * Math.sin(a * 5 - t * 0.6));
        const x = icx + Math.cos(a) * rr * 1.3, z = icz + Math.sin(a) * rr;
        p[q * 3] = x; p[q * 3 + 1] = H(x, z) + 0.7; p[q * 3 + 2] = z;
      }
      L.geometry.attributes.position.needsUpdate = true;
      L.material.opacity = iso * (1 - k * 0.12);
    });

    // sand streams + haze, density follows wind
    const D = Dist(t);
    const dens = clamp01((w - 0.15) * 1.35);
    const lightK = 0.45 + 0.55 * clamp01(m.ki / 3);
    const sc = new THREE.Color(0xd9b07a).lerp(new THREE.Color(0x8796a8), clamp01((t - tStorm) / 2) * (t < C1 + 2 ? 1 : 1 - ramp(t, C1 + 2, K.s8)) * 0.7).multiplyScalar(lightK);
    for (let i = 0; i < NS; i++) {
      const s = sseed[i];
      if (s[0] > dens) { sand.pos[i * 3 + 1] = -999; continue; }
      const u = ((D * s[3] + s[4] * 320) % 320) - 160, v = s[1];
      const x = WD[0] * u + PX * v, z = WD[1] * u + PZ * v;
      sand.pos[i * 3] = x + Math.sin(t * 3 + i) * 0.3; sand.pos[i * 3 + 1] = H(x, z) + s[2] * (0.4 + 0.6 * w) + Math.sin(D * 0.2 + i) * 0.3; sand.pos[i * 3 + 2] = z;
      sand.col[i * 3] = sc.r; sand.col[i * 3 + 1] = sc.g; sand.col[i * 3 + 2] = sc.b;
    }
    sand.commit();
    const hd = clamp01((w - 0.3) * 1.5);
    haze.m.opacity = 0.14 * hd;
    for (let i = 0; i < NH; i++) {
      const s = hseed[i];
      if (s[0] > hd) { haze.pos[i * 3 + 1] = -999; continue; }
      const u = ((D * 0.7 * s[3] + s[4] * 320) % 320) - 160, v = s[1];
      const x = WD[0] * u + PX * v, z = WD[1] * u + PZ * v;
      haze.pos[i * 3] = x; haze.pos[i * 3 + 1] = H(x, z) + s[2]; haze.pos[i * 3 + 2] = z;
      haze.col[i * 3] = sc.r * 0.8; haze.col[i * 3 + 1] = sc.g * 0.8; haze.col[i * 3 + 2] = sc.b * 0.85;
    }
    haze.commit();

    // labels + Iram bracket
    const li = ramp(t, A("s2:Iram") - 0.2, A("s2:Iram") + 0.3) * (1 - ramp(t, A("s2:Iram") + 1.0, A("s2:Iram") + 1.5));
    labIram.visible = false; iramBox.material.opacity = 0.6 * li;
    labAhq.material.opacity = ramp(t, A("s2:Al-Ahqaf") - 0.2, A("s2:Al-Ahqaf") + 0.3) * (1 - ramp(t, A("s2:Iram") - 0.6, A("s2:Iram")));

    // beacon
    vane.rotation.y = Dist(t) * 0.6; led.visible = Math.floor(t * 2) % 2 === 0;

    // camera (storm adds a soft shake)
    const cv = CAM(t), sk = 0.22 * clamp01((w - 0.5) * 2);
    cam.position.set(cv[0] + sk * Math.sin(t * 13.1), cv[1] + sk * Math.sin(t * 17.3 + 1), cv[2] + sk * 0.5 * Math.sin(t * 11.7 + 2));
    v3.set(cv[3], cv[4], cv[5]); cam.lookAt(v3);
    comp.render();
  };
}
