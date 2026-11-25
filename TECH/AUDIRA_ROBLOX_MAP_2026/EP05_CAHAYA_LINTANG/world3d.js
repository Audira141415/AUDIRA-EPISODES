// CAHAYA & LINTANG / HD2D: one timber-town diorama on a stone plinth in a dark void, lit by a physically placed sun.
// 1 world unit = 1 stud, so the 4x4x4 lighting voxels and the 5-stud blocky avatar share one honest scale.
// The sun direction is computed from GeographicLatitude and ClockTime (equinox sun path), and the lighting mode
// (voxel tiles, crisp shadow map, Future lanterns, Soft/Realistic, low-quality shadows, short view distance) is a pure
// function of t. Tilt-shift blur and the grade run in one post pass. Pixel textures, original art, no platform assets.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, clamp01, smooth, ramp, eout, back, canvasTex, track, stage, avatar, restPose, runPose } from "./lib3d.js";

try {
  await Promise.race([
    Promise.all(["700 64px 'Pixelify Sans'", "400 40px Silkscreen"].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
} catch (e) { /* system font fallback */ }

const PX = "'Pixelify Sans', monospace", SK = "Silkscreen, monospace";
const C = { void: "#0B0E14", amber: "#E5A93C", slate: "#18202F", scarlet: "#FF4A3D", cobble: "#2A3242", timber: "#3D291A", mist: "#D4D9E2", cream: "#F3E6C4", navy: "#101626" };
const D2R = Math.PI / 180;
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- pixel textures ----------
function nearest(tx) { tx.magFilter = THREE.NearestFilter; return tx; }
function pix(color, seed = 1, n = 8, amp = 0.16) {
  const r = mulberry(seed), c = new THREE.Color(color);
  return nearest(canvasTex(n, n, (g) => {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const k = 1 + amp * (r() - 0.5) * 2 - (y === n - 1 ? 0.12 : 0) + (y === 0 ? 0.08 : 0);
      g.fillStyle = `rgb(${Math.min(255, c.r * 255 * k) | 0},${Math.min(255, c.g * 255 * k) | 0},${Math.min(255, c.b * 255 * k) | 0})`;
      g.fillRect(x, y, 1, 1);
    }
  }));
}
const pm = (color, seed, rough = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color: 0xffffff, map: pix(color, seed), roughness: rough, ...extra });

function cobbleTex() {
  const r = mulberry(77);
  const tx = canvasTex(128, 128, (g) => {
    g.fillStyle = "#3b3630"; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const ox = (y % 2) * 8, v = 0.82 + r() * 0.3;
      const cx = x * 16 + ox, cy = y * 16;
      g.fillStyle = `rgb(${(122 * v) | 0},${(116 * v) | 0},${(104 * v) | 0})`;
      for (const dx of [0, -128]) { g.fillRect(cx + 2 + dx, cy + 2, 12, 12); }
      g.fillStyle = `rgba(255,240,210,.18)`;
      for (const dx of [0, -128]) { g.fillRect(cx + 2 + dx, cy + 2, 12, 2); g.fillRect(cx + 2 + dx, cy + 2, 2, 12); }
    }
  }, [9, 9]);
  return nearest(tx);
}
function wallTex(plaster, beam, seed, lit = false) {
  return nearest(canvasTex(32, 32, (g) => {
    const r = mulberry(seed);
    if (lit) { g.fillStyle = "#000"; g.fillRect(0, 0, 32, 32); }
    else {
      for (let y = 0; y < 32; y += 2) for (let x = 0; x < 32; x += 2) { const v = 0.94 + r() * 0.1; const c = new THREE.Color(plaster); g.fillStyle = `rgb(${(c.r * 255 * v) | 0},${(c.g * 255 * v) | 0},${(c.b * 255 * v) | 0})`; g.fillRect(x, y, 2, 2); }
      g.fillStyle = beam;
      g.fillRect(0, 0, 32, 3); g.fillRect(0, 29, 32, 3); g.fillRect(0, 0, 3, 32); g.fillRect(29, 0, 3, 32); g.fillRect(0, 14, 32, 2);
      for (let i = 0; i < 11; i++) { g.fillRect(3 + i, 16 + i, 2, 2); g.fillRect(27 - i, 16 + i, 2, 2); }
    }
    g.fillStyle = lit ? "#FFB347" : "#2a1c12"; g.fillRect(10, 4, 12, 9);
    g.fillStyle = lit ? "#FFD27A" : "#E5A93C"; g.fillRect(11, 5, 10, 7);
    g.fillStyle = lit ? "#7a4a10" : "#3D291A"; g.fillRect(15, 5, 2, 7); g.fillRect(11, 8, 10, 1);
  }, [1, 1]));
}
function roofTex(col, seed) {
  const c = new THREE.Color(col), r = mulberry(seed);
  return nearest(canvasTex(16, 16, (g) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const v = (y % 4 === 3 ? 0.62 : 0.9) + r() * 0.16; g.fillStyle = `rgb(${(c.r * 255 * v) | 0},${(c.g * 255 * v) | 0},${(c.b * 255 * v) | 0})`; g.fillRect(x, y, 1, 1); }
  }, [3, 3]));
}
function stoneTex(col, seed) {
  const c = new THREE.Color(col), r = mulberry(seed);
  return nearest(canvasTex(32, 32, (g) => {
    g.fillStyle = "#2b2f3a"; g.fillRect(0, 0, 32, 32);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) { const v = 0.85 + r() * 0.25; g.fillStyle = `rgb(${(c.r * 255 * v) | 0},${(c.g * 255 * v) | 0},${(c.b * 255 * v) | 0})`; g.fillRect(x * 11 + (y % 2) * 5 - 5 + 1, y * 8 + 1, 10, 7); g.fillRect(x * 11 + (y % 2) * 5 + 28, y * 8 + 1, 10, 7); }
  }, [2, 3]));
}

// canvas sign, pixel font, framed like a JRPG window
function plate(text, { w = 512, h = 128, font = `700 70px ${PX}`, fg = C.cream, bg = "rgba(16,22,38,.94)", border = C.amber, size = 8, sub = null, subFont = `400 30px ${SK}`, frame = true } = {}) {
  const tx = canvasTex(w, h, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    if (frame) { g.strokeStyle = C.cream; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10); g.strokeStyle = border; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28); }
    g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, w / 2, sub ? h * 0.4 : h / 2 + 3);
    if (sub) { g.fillStyle = border; g.font = subFont; g.fillText(sub, w / 2, h * 0.76); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, (size * h) / w), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, depthWrite: false }));
  m.renderOrder = 5;
  return m;
}

export function create(canvas, K, AT) {
  const A = (k) => AT[k];
  // Old estimated-timeline scene bounds; every absolute time below is mapped onto the same fraction of the locked scene.
  const OLDB = [0, 0.1, 6.469, 6.629, 23.441, 23.601, 34.525, 34.685, 47.147, 47.307, 57.2, 57.36, 68.767, 68.927, 83.285, 83.445, 93.952, 96.95];
  const NEWB = [0, K.s1, K.s1e, K.s2, K.s2e, K.s3, K.s3e, K.s4, K.s4e, K.s5, K.s5e, K.s6, K.s6e, K.s7, K.s7e, K.s8, K.s8e, K.dur];
  const N = (x) => { if (x >= OLDB[OLDB.length - 1]) return x - OLDB[OLDB.length - 1] + NEWB[NEWB.length - 1]; let i = 0; while (OLDB[i + 1] < x) i++; return NEWB[i] + (x - OLDB[i]) / (OLDB[i + 1] - OLDB[i]) * (NEWB[i + 1] - NEWB[i]); };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.void, exp: 1.0, bloom: [0.4, 0.55, 0.82], fov: 34 });
  r.shadowMap.type = THREE.PCFShadowMap;
  // the front street apron fills the lower frame; subjects stay above the caption band
  scene.fog = new THREE.Fog(C.void, 4000, 5000);

  // ---------- post: tilt-shift + grade ----------
  const post = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, res: { value: new THREE.Vector2(1080, 1920) }, uFocus: { value: 0.47 }, uBand: { value: 0.13 }, uBlur: { value: 6 }, uSat: { value: 1.12 }, uCon: { value: 1.04 }, uWarm: { value: 0.4 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 res; uniform float uFocus,uBand,uBlur,uSat,uCon,uWarm; varying vec2 vUv;
void main(){ vec4 c = texture2D(tDiffuse, vUv); float d = abs(vUv.y - uFocus); float k = smoothstep(uBand, uBand + 0.24, d) * uBlur;
 if (k > 0.05) { vec3 acc = c.rgb; for (int i = 0; i < 16; i++) { float a = float(i) * 2.39996; float rr = sqrt(float(i) + 0.5) / 4.0 * k; acc += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * rr / res).rgb; } c.rgb = acc / 17.0; }
 float l = dot(c.rgb, vec3(0.299, 0.587, 0.114)); c.rgb = mix(vec3(l), c.rgb, uSat); c.rgb = (c.rgb - 0.5) * uCon + 0.5; c.rgb *= mix(vec3(1.0), vec3(1.07, 1.0, 0.88), uWarm);
 gl_FragColor = vec4(clamp(c.rgb, 0.0, 1.0), 1.0); }`,
  });
  comp.addPass(post);

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0x9fb4d9, 0x3d291a, 0.7); scene.add(hemi);
  const mkSun = (size, radius, cast = true) => {
    const L = new THREE.DirectionalLight(0xfff1d6, 0);
    L.castShadow = cast;
    if (cast) {
      L.shadow.mapSize.set(size, size); L.shadow.radius = radius; L.shadow.bias = -0.0006; L.shadow.normalBias = 0.06;
      const c = L.shadow.camera; c.left = -48; c.right = 48; c.top = 48; c.bottom = -48; c.near = 1; c.far = 260;
    }
    scene.add(L); scene.add(L.target);
    return L;
  };
  const sunV = mkSun(0, 0, false), sunS = mkSun(2048, 1.2), sunSoft = mkSun(1024, 9), sunLow = mkSun(96, 0.6);
  const suns = [sunV, sunS, sunSoft, sunLow];

  // ---------- diorama base ----------
  const root = new THREE.Group(); scene.add(root);
  const ground = new THREE.Mesh(new THREE.BoxGeometry(72, 5, 72), [pm(C.timber, 3), pm(C.timber, 4), new THREE.MeshStandardMaterial({ map: cobbleTex(), roughness: 0.85 }), pm(C.timber, 5), pm(C.timber, 6), pm(C.timber, 7)]);
  ground.position.y = -2.5; ground.receiveShadow = true; root.add(ground);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(74, 1.2, 74), pm("#2a1c12", 8)); trim.position.y = -5; trim.receiveShadow = true; root.add(trim);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(70, 74, 3, 48), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.9 })); table.position.y = -7.2; table.receiveShadow = true; root.add(table);
  const fgLamps = [];
  // front street apron so the lower frame is cobbles and soft-focus props, not dark floor
  const apTex = cobbleTex(); apTex.repeat.set(9, 10);
  const apron = new THREE.Mesh(new THREE.BoxGeometry(72, 5, 80), [pm(C.timber, 3), pm(C.timber, 4), new THREE.MeshStandardMaterial({ map: apTex, roughness: 0.85 }), pm(C.timber, 5), pm(C.timber, 6), pm(C.timber, 7)]);
  apron.position.set(0, -2.501, 76); apron.receiveShadow = true; root.add(apron);
  const fg = new THREE.Group(); root.add(fg);
  { const rr = mulberry(404);
    const spots = [[-30, 42], [-22, 50], [-34, 60], [-16, 66], [-28, 78], [30, 46], [34, 58], [26, 68], [32, 82], [-12, 88], [14, 92], [-33, 92], [33, 96]];
    spots.forEach(([x, z], i) => {
      const k = i % 4;
      if (k === 0) { const b = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.1, 2.6, 10), pm("#7A4E2A", 200 + i)); b.position.set(x, 1.3, z); b.castShadow = b.receiveShadow = true; fg.add(b); const b2 = b.clone(); b2.position.set(x + 2.4, 1.3, z + 0.8); fg.add(b2); }
      else if (k === 1) { const c = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), pm("#9A6A3A", 220 + i)); c.position.set(x, 1.3, z); c.rotation.y = rr(); c.castShadow = c.receiveShadow = true; fg.add(c); const f = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1, 1.2), pm("#5E8C3A", 240 + i)); f.position.set(x + 3, 0.5, z - 1); fg.add(f); for (let j = 0; j < 4; j++) { const fl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), pm(j % 2 ? "#FFB0D0" : "#FFD27A", 260 + j)); fl.position.set(x + 1.8 + j * 0.8, 1.2, z - 1); fg.add(fl); } }
      else if (k === 2) { const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 2, 6), pm("#4A3020", 280 + i)); tr.position.set(x, 1, z); fg.add(tr); const cn = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5.4, 6), pm("#4E7A3A", 300 + i)); cn.position.set(x, 4.6, z); cn.castShadow = true; fg.add(cn); }
      else { const po = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 7, 8), pm("#151821", 320 + i)); po.position.set(x, 3.5, z); fg.add(po); const lm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 1.1), new THREE.MeshStandardMaterial({ color: 0x2a1a08, emissive: 0xffa94d, emissiveIntensity: 1.6 })); lm.position.set(x, 7.2, z); fg.add(lm); fgLamps.push(lm.material); }
    });
    for (let i = 0; i < 9; i++) { const fx = -34 + i * 2.2; const pst = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.4, 0.5), pm(C.timber, 340 + i)); pst.position.set(fx, 1.2, 38.5); fg.add(pst); }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(18.5, 0.4, 0.4), pm(C.timber, 360)); rail.position.set(-25.2, 1.9, 38.5); fg.add(rail);
  }

  const M = (geo, mat, x, y, z, par = root) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; par.add(m); return m; };
  const BX = (w, h, d, mat, x, y, z, par) => M(new THREE.BoxGeometry(w, h, d), mat, x, y, z, par);

  // occupancy boxes for the voxel lighting model: [x0,x1,y0,y1,z0,z1]
  const OCC = [];
  const windows = [];
  function house(x0, x1, z0, z1, h, plaster, roof, seed) {
    const w = x1 - x0, d = z1 - z0;
    const wt = wallTex(plaster, "#3D291A", seed), we = wallTex(plaster, "#3D291A", seed, true);
    wt.repeat.set(1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: wt, emissiveMap: we, emissive: 0xffffff, emissiveIntensity: 0.4, roughness: 0.85 });
    windows.push(mat);
    const b = BX(w, h, d, mat, (x0 + x1) / 2, h / 2, (z0 + z1) / 2);
    const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.8, 0); sh.lineTo(w / 2 + 0.8, 0); sh.lineTo(0, Math.min(7, w * 0.45)); sh.closePath();
    const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 1.6, bevelEnabled: false }); rg.translate(0, 0, -(d + 1.6) / 2);
    M(rg, new THREE.MeshStandardMaterial({ map: roofTex(roof, seed + 3), roughness: 0.8 }), (x0 + x1) / 2, h, (z0 + z1) / 2);
    OCC.push([x0, x1, 0, h + 2, z0, z1]);
    return b;
  }
  house(-32, -20, -30, -18, 12, "#D8C7A0", "#9C3B2E", 11);
  house(16, 32, -30, -18, 14, "#CFC2A8", "#2F5D7C", 12);
  house(-32, -22, -6, 6, 10, "#E0CFA6", "#7A4E2A", 13);
  house(-2, 8, -30, -22, 8, "#D2BE95", "#9C3B2E", 14);
  // AUDIRA shop
  const shop = house(16, 28, -8, 4, 10, "#9DB7C9", "#3D291A", 15);
  const awn = BX(12.6, 0.5, 3, pm(C.scarlet, 16), 22, 5.6, 5.2); awn.rotation.x = 0.35;
  const sign = plate("AUDIRA", { w: 512, h: 160, font: `700 104px ${PX}`, fg: "#FFD27A", bg: "#2a1c12", border: C.amber, size: 9 });
  sign.material.depthWrite = true; sign.position.set(22, 8.3, 4.12); root.add(sign);
  const signBoard = BX(9.6, 3.3, 0.3, pm(C.timber, 17), 22, 8.3, 3.95);

  // clock tower (ClockTime lives here)
  const tower = BX(8, 20, 8, new THREE.MeshStandardMaterial({ map: stoneTex("#8C93A3", 21), roughness: 0.9 }), -8, 10, -4);
  OCC.push([-12, -4, 0, 20, -8, 0]);
  const spire = M(new THREE.ConeGeometry(6.4, 8, 4), new THREE.MeshStandardMaterial({ map: roofTex("#2F5D7C", 22), roughness: 0.8 }), -8, 24, -4); spire.rotation.y = Math.PI / 4;
  const faceTx = nearest(canvasTex(64, 64, (g) => {
    g.fillStyle = "#2a1c12"; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill();
    g.fillStyle = C.cream; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.fill();
    g.fillStyle = "#3D291A"; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillRect(32 + Math.sin(a) * 22 - 1.5, 32 - Math.cos(a) * 22 - 1.5, 3, 3); }
  }));
  const face = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), new THREE.MeshStandardMaterial({ map: faceTx, emissiveMap: faceTx, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.6 }));
  face.position.set(-8, 15.5, 0.06); root.add(face);
  const hands = new THREE.Group(); hands.position.set(-8, 15.5, 0.25); root.add(hands);
  const hourP = new THREE.Group(), minP = new THREE.Group(); hands.add(hourP, minP);
  BX(0.42, 1.8, 0.12, pm("#1c140e", 23), 0, 0.85, 0, hourP);
  BX(0.28, 2.6, 0.12, pm("#1c140e", 24), 0, 1.2, 0.08, minP);
  const clockLab = plate("CLOCKTIME", { size: 7.5, font: `700 64px ${PX}` }); clockLab.position.set(-8, 11, 0.3); root.add(clockLab);

  // tiny crate (smaller than one lighting voxel) and lanterns
  const crate = BX(2, 2, 2, pm("#9A6A3A", 31), -2, 1, 6);
  const lanterns = [];
  function lantern(x, z, cast) {
    const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
    M(new THREE.CylinderGeometry(0.22, 0.3, 7, 8), pm("#151821", 32, 0.5, { metalness: 0.5 }), 0, 3.5, 0, g);
    BX(1.6, 0.25, 1.6, pm("#151821", 33), 0, 7.95, 0, g);
    const lampM = new THREE.MeshStandardMaterial({ color: 0x2a1a08, emissive: 0xffa94d, emissiveIntensity: 1 });
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 1.1), lampM); lamp.position.y = 7.2; g.add(lamp);
    const L = new THREE.PointLight(0xffa040, 0, 34, 1.6); L.position.set(0, 7.1, 0); g.add(L);
    if (cast) { L.castShadow = true; L.shadow.mapSize.set(256, 256); L.shadow.bias = -0.004; L.shadow.camera.near = 0.6; }
    lanterns.push({ L, lampM });
  }
  lantern(7.5, 3, true); lantern(12, 8, true); lantern(-18, 11, false); lantern(27, 20, false); lantern(9, -14, false);
  // trees (small, so no voxel shadow)
  for (const [x, z, s] of [[-27, 22, 1], [30, 30, 1.1], [-14, -16, 0.9], [12, -11, 0.8], [-30, 30, 0.9], [31, 6, 0.85]]) {
    M(new THREE.CylinderGeometry(0.35, 0.45, 1.6, 6), pm("#4A3020", 41), x, 0.8 * s, z).scale.setScalar(s);
    const cn = M(new THREE.ConeGeometry(1.7, 3.8, 6), pm("#4E7A3A", 42 + x), x, (1.6 + 1.9) * s, z); cn.scale.setScalar(s);
  }

  // cart (larger than a voxel; its shadow snaps cell to cell)
  const cart = new THREE.Group(); root.add(cart);
  BX(6, 2.6, 4, pm("#8A5A2E", 51), 0, 2.4, 0, cart);
  BX(6.2, 0.4, 4.2, pm(C.timber, 52), 0, 3.8, 0, cart);
  BX(4.6, 1.2, 3, pm("#D9B26A", 53), 0, 4.4, 0, cart);
  const wheels = [];
  for (const [x, z] of [[-2, 2.1], [2, 2.1], [-2, -2.1], [2, -2.1]]) { const w = M(new THREE.CylinderGeometry(1.05, 1.05, 0.4, 12), pm("#3D291A", 54), x, 1.05, z, cart); w.rotation.x = Math.PI / 2; wheels.push(w); }
  const CA = N(12.4), CB = N(21.6);
  const cartX = (t) => -24 + 26 * smooth((t - CA) / (CB - CA));
  const CZ = 14;

  // pixel villagers (2D sprites in the 3D set, HD2D signature)
  function villager(seed, shirt, hat) {
    const tx = nearest(canvasTex(16, 28, (g) => {
      g.clearRect(0, 0, 16, 28);
      g.fillStyle = hat; g.fillRect(4, 1, 8, 3); g.fillRect(2, 4, 12, 1);
      g.fillStyle = "#EFC38B"; g.fillRect(5, 5, 6, 5); g.fillStyle = "#1c140e"; g.fillRect(6, 7, 1, 1); g.fillRect(9, 7, 1, 1);
      g.fillStyle = shirt; g.fillRect(4, 10, 8, 9); g.fillRect(2, 11, 2, 6); g.fillRect(12, 11, 2, 6);
      g.fillStyle = "#EFC38B"; g.fillRect(2, 17, 2, 1); g.fillRect(12, 17, 2, 1);
      g.fillStyle = "#3D291A"; g.fillRect(4, 18, 8, 1); g.fillStyle = "#2B3A67"; g.fillRect(5, 19, 2, 7); g.fillRect(9, 19, 2, 7);
      g.fillStyle = "#1c140e"; g.fillRect(4, 26, 3, 2); g.fillRect(9, 26, 3, 2);
    }));
    const mat = new THREE.MeshStandardMaterial({ map: tx, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 4), mat);
    m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tx, alphaTest: 0.5 });
    root.add(m); return m;
  }
  const vill = [[villager(1, "#5E8C3A", "#9C3B2E"), -22, 15], [villager(2, "#2F5D7C", "#E5A93C"), 3, -15], [villager(3, "#9C3B2E", "#3D291A"), 31, 13]];
  vill.forEach(([m, x, z]) => m.position.set(x, 2, z));

  // ---------- the blocky avatar, pixel-textured ----------
  const av = avatar({ skin: 0xefc38b, shirt: 0xff4a3d, pants: 0x2b3a67, make: (c) => new THREE.MeshStandardMaterial({ color: 0xffffff, map: pix("#" + new THREE.Color(c).getHexString(), c & 255, 8, 0.12), roughness: 0.7 }), face: false });
  root.add(av.G);
  av.G.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const faceP = nearest(canvasTex(16, 16, (g) => { g.clearRect(0, 0, 16, 16); g.fillStyle = "#1c140e"; g.fillRect(4, 4, 2, 3); g.fillRect(10, 4, 2, 3); g.fillRect(4, 10, 1, 1); g.fillRect(11, 10, 1, 1); g.fillRect(5, 11, 6, 1); }));
  const fpl = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshBasicMaterial({ map: faceP, transparent: true })); fpl.position.set(0, 0.6, 0.635); av.head.add(fpl);
  const scarf = BX(2.1, 0.45, 1.1, pm(C.amber, 61), 0, 3.85, 0, av.G);
  const phone = BX(0.7, 0.12, 1.3, pm("#151821", 62), 0, -2.05, 0.45, av.armR);
  const phoneScr = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.1), new THREE.MeshBasicMaterial({ color: 0x7fd3ff, toneMapped: false })); phoneScr.rotation.x = -Math.PI / 2; phoneScr.position.set(0, -2.12, 0.45); av.armR.add(phoneScr);

  // ---------- voxel lighting model: occupancy + shadow tiles ----------
  const NX = 16, NY = 6, NZ = 16, G0 = -32, CELL = 4;
  const occStatic = new Float32Array(NX * NY * NZ);
  const idx = (i, j, k) => (j * NZ + k) * NX + i;
  function addBox(buf, b) {
    const [x0, x1, y0, y1, z0, z1] = b;
    for (let i = 0; i < NX; i++) { const ox = Math.max(0, Math.min(x1, G0 + (i + 1) * CELL) - Math.max(x0, G0 + i * CELL)) / CELL; if (!ox) continue;
      for (let j = 0; j < NY; j++) { const oy = Math.max(0, Math.min(y1, (j + 1) * CELL) - Math.max(y0, j * CELL)) / CELL; if (!oy) continue;
        for (let k = 0; k < NZ; k++) { const oz = Math.max(0, Math.min(z1, G0 + (k + 1) * CELL) - Math.max(z0, G0 + k * CELL)) / CELL; if (oz) buf[idx(i, j, k)] += ox * oy * oz; } } }
  }
  OCC.forEach((b) => addBox(occStatic, b));
  addBox(occStatic, [-3, -1, 0, 2, 5, 7]); // the crate: 1/8 of a cell, below threshold
  const occ = new Float32Array(occStatic.length);
  const tileTex = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 4, 16, 16, 22); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.55, "rgba(255,255,255,.85)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  const tileMat = new THREE.MeshBasicMaterial({ color: 0x0a0c14, alphaMap: tileTex, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const tileGeo = new THREE.PlaneGeometry(5.2, 5.2); tileGeo.rotateX(-Math.PI / 2);
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, NX * NZ); tiles.frustumCulled = false; tiles.renderOrder = 2; root.add(tiles);
  const cubeMat = new THREE.MeshBasicMaterial({ color: 0xffc35a, transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false });
  const cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(3.85, 3.85, 3.85), cubeMat, NX * NY * NZ); cubes.frustumCulled = false; cubes.renderOrder = 3; root.add(cubes);
  const _m = new THREE.Matrix4(), _z = new THREE.Matrix4().makeScale(0, 0, 0);

  // lattice of 4-stud cells
  const gl = [];
  for (const y of [0, 4, 8]) for (let a = 0; a <= NX; a++) { const v = G0 + a * CELL; gl.push(-32, y + 0.05, v, 32, y + 0.05, v, v, y + 0.05, -32, v, y + 0.05, 32); }
  for (let a = 0; a <= NX; a++) for (let b = 0; b <= NZ; b++) gl.push(G0 + a * CELL, 0, G0 + b * CELL, G0 + a * CELL, 8, G0 + b * CELL);
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(gl, 3));
  const latMat = new THREE.LineBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const lattice = new THREE.LineSegments(lg, latMat); lattice.renderOrder = 4; root.add(lattice);
  // the single highlighted cell around the crate
  const hiCell = new THREE.Group(); hiCell.position.set(-2, 2, 6); root.add(hiCell);
  const hiEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 4, 4)), new THREE.LineBasicMaterial({ color: 0xffe08a, transparent: true, toneMapped: false }));
  const hiFill = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffc35a, transparent: true, opacity: 0.16, depthWrite: false, toneMapped: false }));
  hiCell.add(hiEdge, hiFill);
  const cellLab = plate("4 × 4 × 4 STUD", { size: 9, font: `700 62px ${PX}` }); root.add(cellLab);
  const labYes = plate("ADA BAYANGAN", { size: 9, font: `700 60px ${PX}`, border: "#7CCB5B" }); root.add(labYes);
  const labNo = plate("TANPA BAYANGAN", { size: 9.6, font: `700 58px ${PX}`, border: C.scarlet }); root.add(labNo);

  // ---------- Technology dial + USANG stamp ----------
  const dial = new THREE.Group(); dial.position.set(-3, 0, 27); root.add(dial);
  BX(1, 6, 1, pm(C.timber, 71), 0, 3, -0.6, dial);
  const disc = M(new THREE.CylinderGeometry(4.6, 4.6, 0.9, 40), pm("#5a3a22", 72), 0, 7.6, -0.4, dial); disc.rotation.x = Math.PI / 2;
  const LABA = { VOXEL: 0.95, SHADOWMAP: 0, FUTURE: -0.95 };
  const dialTx = canvasTex(512, 512, (g) => {
    g.fillStyle = "#F3E6C4"; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill();
    g.strokeStyle = C.amber; g.lineWidth = 14; g.beginPath(); g.arc(256, 256, 236, 0, 7); g.stroke();
    g.font = `700 50px ${PX}`; g.textAlign = "center"; g.textBaseline = "middle";
    const cols = { VOXEL: "#2F5D7C", SHADOWMAP: "#3D291A", FUTURE: "#B5402F" };
    for (const [k, a] of Object.entries(LABA)) { g.save(); g.translate(256 - Math.sin(a) * 160, 256 - Math.cos(a) * 160); g.rotate(-a); g.fillStyle = cols[k]; g.fillText(k, 0, 0); g.restore(); }
    g.fillStyle = "#3D291A"; for (let i = -8; i <= 8; i++) { const a = i * 0.14; g.fillRect(256 - Math.sin(a) * 214 - 4, 256 - Math.cos(a) * 214 - 4, 8, 8); }
  });
  const dface = new THREE.Mesh(new THREE.CircleGeometry(4.25, 40), new THREE.MeshStandardMaterial({ map: dialTx, roughness: 0.7 })); dface.position.set(0, 7.6, 0.08); dial.add(dface);
  const needle = new THREE.Group(); needle.position.set(0, 7.6, 0.3); dial.add(needle);
  BX(0.5, 3.4, 0.25, pm(C.scarlet, 73), 0, 1.6, 0, needle);
  M(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 12), pm("#1c140e", 74), 0, 0, 0.1, needle).rotation.x = Math.PI / 2;
  const techLab = plate("TECHNOLOGY", { size: 9, font: `700 64px ${PX}` }); techLab.position.set(0, 13.4, 0); dial.add(techLab);
  const stamp = plate("USANG", { w: 512, h: 200, size: 8.4, font: `700 120px ${PX}`, fg: "#FF4A3D", bg: "rgba(255,240,220,.0)", border: "#FF4A3D" }); stamp.position.set(0, 7.6, 0.7); dial.add(stamp);

  // ---------- LightingStyle lever ----------
  const lever = new THREE.Group(); lever.position.set(10, 0, 27); root.add(lever);
  BX(4.2, 2.2, 2.6, pm("#4A3020", 81), 0, 1.1, 0, lever);
  const arm = new THREE.Group(); arm.position.set(0, 2.2, 0); lever.add(arm);
  M(new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8), pm("#8C93A3", 82, 0.4, { metalness: 0.6 }), 0, 2.1, 0, arm);
  M(new THREE.SphereGeometry(0.6, 10, 8), pm(C.scarlet, 83), 0, 4.3, 0, arm);
  const mkLev = (on) => canvasTex(512, 220, (g) => {
    g.fillStyle = "rgba(16,22,38,.95)"; g.fillRect(0, 0, 512, 220); g.strokeStyle = C.cream; g.lineWidth = 6; g.strokeRect(5, 5, 502, 210);
    g.fillStyle = C.amber; g.font = `400 36px ${SK}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LIGHTINGSTYLE", 256, 48);
    for (const [i, s] of [[0, "SOFT"], [1, "REALISTIC"]]) { const x = 128 + i * 256; if (on === i) { g.fillStyle = i ? "#7fd3ff" : "#FFB0D0"; g.fillRect(x - 118, 96, 236, 100); } g.fillStyle = on === i ? "#101626" : C.cream; g.font = `700 54px ${PX}`; g.fillText(s, x, 148); }
  });
  const levTx = [mkLev(-1), mkLev(0), mkLev(1)];
  const levPlate = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 4.1), new THREE.MeshBasicMaterial({ map: levTx[0], transparent: true, toneMapped: false, depthWrite: false })); levPlate.position.set(0, 9.6, 0); lever.add(levPlate);

  // ---------- phone meter (PrioritizeLightingQuality) ----------
  const meter = new THREE.Group(); meter.position.set(-3, 0, 27); root.add(meter);
  BX(1, 2, 1, pm(C.timber, 91), 0, 1, 0, meter);
  BX(7.4, 12.4, 0.8, pm("#151821", 92), 0, 8.2, 0, meter);
  const mcv = document.createElement("canvas"); mcv.width = 256; mcv.height = 432;
  const mtx = new THREE.CanvasTexture(mcv); mtx.colorSpace = THREE.SRGBColorSpace;
  const mscr = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 11.2), new THREE.MeshBasicMaterial({ map: mtx, toneMapped: false })); mscr.position.set(0, 8.2, 0.42); meter.add(mscr);
  let mKey = "";
  function drawMeter(near, far, pick) {
    const key = near.toFixed(2) + far.toFixed(2) + pick; if (key === mKey) return; mKey = key;
    const g = mcv.getContext("2d");
    g.fillStyle = "#101626"; g.fillRect(0, 0, 256, 432);
    g.fillStyle = C.amber; g.font = `400 19px ${SK}`; g.textAlign = "center"; g.fillText("PERANGKAT LEMAH", 128, 44);
    g.strokeStyle = C.cream; g.lineWidth = 4; g.strokeRect(86, 66, 76, 34); g.fillStyle = C.cream; g.fillRect(162, 76, 8, 14); g.fillStyle = "#FF4A3D"; g.fillRect(92, 72, 18, 22);
    const row = (y, label, v, on) => {
      g.fillStyle = on ? "#FFD27A" : C.cream; g.font = `700 25px ${PX}`; g.fillText(label, 128, y);
      g.fillStyle = "#2A3242"; g.fillRect(24, y + 16, 208, 30);
      g.fillStyle = v > 0.6 ? "#7CCB5B" : "#FF4A3D"; g.fillRect(28, y + 20, Math.max(6, 200 * v), 22);
      if (on) { g.fillStyle = "#FF4A3D"; g.beginPath(); g.moveTo(128, y + 92); g.lineTo(110, y + 64); g.lineTo(146, y + 64); g.fill(); }
    };
    row(170, "BAYANGAN DEKAT", near, pick === 1);
    row(300, "JARAK PANDANG", far, pick === 2);
    mtx.needsUpdate = true;
  }

  // ---------- globe (GeographicLatitude) ----------
  const globe = new THREE.Group(); globe.position.set(-22, 0, 26); root.add(globe);
  M(new THREE.CylinderGeometry(1.6, 2.4, 1.2, 10), pm(C.timber, 101), 0, 0.6, 0, globe);
  M(new THREE.CylinderGeometry(0.3, 0.3, 3, 8), pm("#8C93A3", 102), 0, 2.4, 0, globe);
  const gtx = nearest(canvasTex(128, 64, (g) => {
    const rr = mulberry(9);
    g.fillStyle = "#2E5C8A"; g.fillRect(0, 0, 128, 64);
    g.fillStyle = "#5E8C3A";
    for (let i = 0; i < 26; i++) { const x = rr() * 128, y = 10 + rr() * 44, w = 4 + rr() * 14, h = 3 + rr() * 8; g.fillRect(x | 0, y | 0, w | 0, h | 0); g.fillRect(((x + w / 3) | 0) - 128, y | 0, w | 0, h | 0); }
    g.fillStyle = "rgba(243,230,196,.35)"; for (const y of [11, 21, 43, 53]) g.fillRect(0, y, 128, 1);
    g.fillStyle = "#FFD27A"; g.fillRect(0, 31, 128, 2);
  }));
  const sph = new THREE.Mesh(new THREE.SphereGeometry(4.5, 32, 20), new THREE.MeshStandardMaterial({ map: gtx, roughness: 0.6 })); sph.position.y = 8.4; sph.castShadow = true; globe.add(sph);
  const latRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.2, 8, 48), new THREE.MeshBasicMaterial({ color: 0xff4a3d, toneMapped: false })); latRing.rotation.x = Math.PI / 2; globe.add(latRing);
  const geoLab = plate("GEOGRAPHICLATITUDE", { size: 12, w: 768, font: `700 64px ${PX}` }); geoLab.position.set(0, 15.4, 0); globe.add(geoLab);
  const jak = plate("JAKARTA ≈ 6° LS", { size: 10, w: 640, font: `700 64px ${PX}`, border: C.scarlet }); globe.add(jak);
  const pin = M(new THREE.ConeGeometry(0.45, 1.4, 8), new THREE.MeshBasicMaterial({ color: 0xff4a3d, toneMapped: false }), 0, 0, 0, globe);

  // ---------- sun path ----------
  const R_ARC = 34, ND = 37;
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, toneMapped: false }), ND); dots.frustumCulled = false; root.add(dots);
  const sunBall = new THREE.Mesh(new THREE.SphereGeometry(2.4, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, toneMapped: false })); root.add(sunBall);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(4, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffa94d, transparent: true, opacity: 0.25, toneMapped: false, depthWrite: false })); sunBall.add(halo);
  function sunVec(lat, clock, out = new THREE.Vector3()) {
    const H = (clock - 12) * 15 * D2R, p = lat * D2R;
    const E = -Math.sin(H), N = -Math.sin(p) * Math.cos(H), U = Math.cos(p) * Math.cos(H);
    return out.set(E, U, -N);
  }
  const keysLat = [[0, -30], [60.3, -30], [62.7, 42], [65.2, -48], [66.6, -22], [73.6, -22], [75.2, -6], [200, -6]].map(([a, v]) => [N(a), v]);
  const keysClk = [[0, 9.2], [66.4, 9.2], [68.7, 30.5], [70.0, 30.5], [75.3, 36], [77.4, 36], [82.9, 41.85], [93.5, 42.4], [200, 42.4]].map(([a, v]) => [N(a), v]);
  const pw = (keys, t) => { let i = 0; while (i < keys.length - 2 && keys[i + 1][0] <= t) i++; const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; return lerp(v0, v1, smooth((t - t0) / (t1 - t0))); };

  // ---------- lighting modes ----------
  const MODE0 = { vox: 1, crisp: 0, soft: 0, low: 0, fut: 0, styl: 0, fog: 0 };
  const modeKeys = [
    [A("s3:ShadowMap"), { vox: 0, crisp: 1 }],
    [A("s3:Future"), { fut: 1 }],
    [A("s4:LightingStyle"), { fut: 0 }],
    [A("s4:Soft"), { crisp: 0, soft: 1, styl: 1 }],
    [A("s4:Realistic"), { crisp: 1, soft: 0, styl: 0 }],
    [A("s4:Soft#2"), { crisp: 0, soft: 1, styl: 1 }],
    [A("s4:Realistic#2"), { crisp: 1, soft: 0, styl: 0 }],
    [A("s5:kualitas"), { crisp: 0, low: 1 }],
    [A("s5:atau"), { crisp: 1, low: 0, fog: 1 }],
    [K.s6 - 0.2, { fog: 0 }],
  ];
  function mode(t) {
    let s = { ...MODE0 };
    for (const [tk, st] of modeKeys) {
      const k = ramp(t, tk - 0.12, tk + 0.38); if (k <= 0) break;
      const n = { ...s, ...st }; for (const f in s) s[f] = lerp(s[f], n[f], k);
    }
    return s;
  }

  // ---------- camera ----------
  // [t, tx, ty, tz, dist, az(deg), el(deg)]
  const camT = track([
    [0, -4, 6, 4, 78, 22, 27], [3, -4, 6, 4, 75, 15, 28], [6.3, -4, 5, 5, 84, 8, 32],
    [9.5, -4, 4, 9, 112, 0, 40], [13.5, -12, 3, 12, 98, -6, 34], [17.5, -4, 3, 13, 96, -12, 33], [21.6, 2, 4, 13, 102, -16, 34],
    [24.8, 3, 7, 18, 116, 4, 24], [29.2, 3, 7, 16, 122, -2, 26], [34, 3, 7, 15, 126, -8, 28],
    [36.6, 4, 7, 21, 92, -4, 18], [41, 5, 7, 21, 90, 5, 19], [46.6, 4, 7, 18, 102, 9, 23],
    [48.8, 2, 5, 24, 64, 10, 16], [53.6, 3, 4, 24, 50, 16, 14], [56.8, 0, 6, 8, 150, 4, 26],
    [59.6, -8, 13, 8, 205, 38, 17], [64, -6, 13, 6, 212, 52, 18], [68.2, -4, 13, 6, 208, 58, 20],
    [71.2, -4, 13, 6, 205, 30, 19], [75.6, -12, 10, 16, 150, 18, 17], [79.6, 2, 8, 8, 160, -8, 24], [83, 10, 7, 8, 128, -16, 22],
    [85.2, 19, 5.2, 7, 80, -10, 12], [92.6, 19, 5.2, 7, 72, 4, 11], [97, 19, 5.2, 7, 70, 8, 11],
  ].map((k) => [N(k[0]), ...k.slice(1)]));
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();

  // ---------- avatar path ----------
  const P_CRATE = [3, 7.5], P_DIAL = [4, 25], P_GLOBE = [-15, 25], P_SHOP = [17.5, 10.5];
  function walk(t, t0, t1, pts) {
    // polyline walk, returns [x, z, heading, distance]
    const segs = []; let L = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push(l); L += l; }
    const u = smooth((t - t0) / (t1 - t0)) * L; let d = u, i = 0;
    while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const k = Math.min(1, d / segs[i]), a = pts[i], b = pts[i + 1];
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[0] - a[0], b[1] - a[1]), u];
  }
  function avState(t) {
    if (t < N(9.2)) return { x: P_CRATE[0], z: P_CRATE[1], ry: -0.75, mv: 0 };
    if (t < N(12.3)) { const [x, z, h, u] = walk(t, N(9.2), N(12.3), [P_CRATE, [-8, 13], [cartX(N(12.3)) - 5.3, CZ]]); return { x, z, ry: t < N(12.2) ? h : Math.PI / 2, mv: t < N(12.2) ? 1 : 0, u }; }
    if (t < N(22.0)) { const x = cartX(t) - 5.3; return { x, z: CZ, ry: Math.PI / 2, mv: t > N(12.4) && t < N(21.6) ? 1 : 0, u: x, push: 1 }; }
    if (t < N(24.6)) { const [x, z, h, u] = walk(t, N(22.0), N(24.6), [[cartX(N(22)) - 5.3, CZ], [-1.5, 19], P_DIAL]); return { x, z, ry: t < N(24.5) ? h : 0, mv: t < N(24.5) ? 1 : 0, u }; }
    if (t < K.s6 + 0.1) return { x: P_DIAL[0], z: P_DIAL[1], ry: 0, mv: 0 };
    if (t < N(60.4)) { const [x, z, h, u] = walk(t, K.s6 + 0.1, N(60.4), [P_DIAL, [-6, 29], P_GLOBE]); return { x, z, ry: t < N(60.3) ? h : -1.0, mv: t < N(60.3) ? 1 : 0, u }; }
    if (t < N(77.2)) return { x: P_GLOBE[0], z: P_GLOBE[1], ry: -1.0, mv: 0 };
    if (t < N(83.2)) { const [x, z, h, u] = walk(t, N(77.2), N(83.2), [P_GLOBE, [-2, 20], [10, 19.5], P_SHOP]); return { x, z, ry: t < N(83.1) ? h : 0.1, mv: t < N(83.1) ? 1 : 0, u }; }
    return { x: P_SHOP[0], z: P_SHOP[1], ry: 0.1, mv: 0 };
  }

  const popS = (t, a, d = 0.35) => (t < a ? 0 : back(clamp01((t - a) / d), 1.8));
  const fade = (t, a, b, d = 0.3) => clamp01((t - a) / d) * (1 - clamp01((t - b) / d));
  const bb = (o) => { o.quaternion.copy(cam.quaternion); };
  const sv = new THREE.Vector3();
  const cVoid = new THREE.Color(C.void), cDay = new THREE.Color("#22314a"), cDusk = new THREE.Color("#3a2236"), cTmp = new THREE.Color();
  const sunLo = new THREE.Color("#ff8a3d"), sunHi = new THREE.Color("#fff1d6");

  return (t) => {
    const st = mode(t);
    // sun
    const lat = pw(keysLat, t), clk = pw(keysClk, t);
    sunVec(lat, clk % 24, sv);
    const day = smooth((sv.y + 0.03) / 0.32);
    const dusk = clamp01(1 - Math.abs(sv.y - 0.06) / 0.22) * (sv.y > -0.15 ? 1 : 0);
    const sunI = 7.0 * day * (1 - 0.45 * st.fut);
    const ws = [st.vox, st.crisp, st.soft, st.low];
    suns.forEach((L, i) => { L.position.copy(sv).multiplyScalar(110); L.target.position.set(0, 0, 0); L.intensity = sunI * ws[i]; L.color.copy(sunLo).lerp(sunHi, smooth(sv.y / 0.6)); });
    const night = 1 - day;
    hemi.intensity = 0.35 + 1.0 * day + 0.5 * st.vox + 1.1 * st.styl + 0.12 * night;
    hemi.color.set(0x9fb4d9).lerp(new THREE.Color(0xffc0a0), dusk * 0.5);
    const lantOn = Math.max(st.fut, smooth((0.28 - sv.y) / 0.3));
    lanterns.forEach((l, i) => { l.L.intensity = 6 + 150 * lantOn * (1 + 0.04 * Math.sin(t * 9 + i * 2)); l.lampM.emissiveIntensity = 0.8 + 2.6 * lantOn; });
    windows.forEach((w) => (w.emissiveIntensity = 0.3 + 2.0 * lantOn));
    fgLamps.forEach((m) => (m.emissiveIntensity = 0.8 + 2.6 * lantOn));
    bp.strength = 0.32 + 0.45 * st.fut + 0.35 * night;
    cTmp.copy(cVoid).lerp(cDay, 0.75 * day).lerp(cDusk, 0.6 * dusk);
    scene.background.copy(cTmp); scene.fog.color.copy(cTmp);
    post.uniforms.uSat.value = 1.08 + 0.42 * st.styl - 0.12 * st.crisp * (1 - st.styl);
    post.uniforms.uCon.value = 1.03 + 0.1 * st.crisp - 0.1 * st.styl;
    post.uniforms.uWarm.value = 0.3 + 0.5 * night + 0.3 * dusk + 0.35 * st.styl;
    r.toneMappingExposure = 1.2 + 0.35 * st.styl;

    // camera
    const c = camT(t);
    const az = c[4] * D2R, el = c[5] * D2R;
    camTgt.set(c[0], c[1], c[2]);
    camPos.set(c[0] + c[3] * Math.sin(az) * Math.cos(el), c[1] + c[3] * Math.sin(el), c[2] + c[3] * Math.cos(az) * Math.cos(el));
    cam.position.copy(camPos); cam.lookAt(camTgt);
    // view-distance fog
    scene.fog.near = lerp(4000, c[3] * 0.82, st.fog); scene.fog.far = lerp(5000, c[3] * 1.12, st.fog);

    // cart
    const cx = cartX(t); cart.position.set(cx, 0, CZ);
    wheels.forEach((w) => (w.rotation.y = -(cx + 24) / 1.05));

    // voxel occupancy + tiles + cubes
    occ.set(occStatic); addBox(occ, [cx - 3, cx + 3, 0, 4.4, CZ - 2, CZ + 2]);
    const tileVis = st.vox;
    tileMat.opacity = 0.62 * tileVis;
    if (tileVis > 0.01) {
      for (let i = 0; i < NX; i++) for (let k = 0; k < NZ; k++) {
        const x = G0 + (i + 0.5) * CELL, z = G0 + (k + 0.5) * CELL;
        let sh = occ[idx(i, 0, k)] >= 0.45;
        if (!sh && sv.y > 0.05) for (let s = 2; s < 70; s += 1) {
          const px = x + sv.x * s, py = 1 + sv.y * s, pz = z + sv.z * s;
          const ii = Math.floor((px - G0) / CELL), jj = Math.floor(py / CELL), kk = Math.floor((pz - G0) / CELL);
          if (jj >= NY || ii < 0 || kk < 0 || ii >= NX || kk >= NZ) break;
          if (occ[idx(ii, jj, kk)] >= 0.45) { sh = true; break; }
        }
        tiles.setMatrixAt(k * NX + i, sh ? _m.makeTranslation(x, 0.07, z) : _z);
      }
      tiles.instanceMatrix.needsUpdate = true;
    }
    const cubeVis = fade(t, A("s2:Objek") - 0.2, K.s3 - 0.4, 0.4);
    cubeMat.opacity = 0.22 * cubeVis + 0.25 * cubeVis * clamp01(1 - Math.abs(t - A("s2:dihitung") - 0.3) / 0.6);
    let n = 0;
    if (cubeVis > 0.01) {
      for (let j = 0; j < NY; j++) for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) if (occ[idx(i, j, k)] >= 0.45) cubes.setMatrixAt(n++, _m.makeTranslation(G0 + (i + 0.5) * CELL, (j + 0.5) * CELL, G0 + (k + 0.5) * CELL));
      cubes.instanceMatrix.needsUpdate = true;
    }
    cubes.count = n;
    const latV = Math.max(fade(t, A("s1:kotak") - 0.25, A("s3:ShadowMap"), 0.4), 0);
    latMat.opacity = 0.42 * latV;
    const hv = fade(t, A("s1:kotak") - 0.3, K.s3, 0.3);
    hiCell.visible = hv > 0.01; hiCell.scale.setScalar(Math.max(0.001, back(clamp01((t - A("s1:kotak") + 0.3) / 0.4), 2)));
    hiEdge.material.opacity = hv; hiFill.material.opacity = 0.18 * hv * (1 + 0.4 * Math.sin(t * 5));
    const cl = popS(t, A("s2:berukuran") - 0.1) * (1 - ramp(t, A("s2:Saat") - 0.3, A("s2:Saat") + 0.2));
    cellLab.visible = cl > 0.01; cellLab.scale.setScalar(Math.max(0.001, cl)); cellLab.position.set(-2, 10.2, 6); bb(cellLab);
    const ly = (1 - ramp(t, K.s2 + 0.6, K.s2 + 1.2));
    const y1 = popS(t, 0) * ly, y2 = popS(t, 0) * ly;
    labYes.visible = y1 > 0.01; labYes.scale.setScalar(Math.max(0.001, y1)); labYes.position.set(-11, 9.5, 4); bb(labYes);
    labNo.visible = y2 > 0.01; labNo.scale.setScalar(Math.max(0.001, y2)); labNo.position.set(-2, 6.6, 6); bb(labNo);
    crate.rotation.y = 0.2;

    // dial / stamp / lever / meter / globe rise and sink
    const dialUp = ramp(t, K.s3 - 1.4, K.s3 + 0.2) * (1 - ramp(t, K.s5 - 0.1, K.s5 + 0.6));
    dial.visible = dialUp > 0.01; dial.position.y = -14 * (1 - dialUp); dial.scale.setScalar(Math.max(0.001, dialUp));
    let na = 0.95 + 0.25 * Math.sin(t * 2.2) * (1 - ramp(t, A("s3:Voxel") - 0.2, A("s3:Voxel")));
    if (t > A("s3:ShadowMap") - 0.1) na = lerp(0.95, 0, back(clamp01((t - A("s3:ShadowMap") + 0.1) / 0.35), 2));
    if (t > A("s3:Future") - 0.1) na = lerp(0, -0.95, back(clamp01((t - A("s3:Future") + 0.1) / 0.35), 2));
    if (t > A("s4:usang")) na = lerp(-0.95, -2.6, eout(clamp01((t - A("s4:usang")) / 1.2)));
    needle.rotation.z = na;
    techLab.scale.setScalar(Math.max(0.001, popS(t, A("s3:Technology") - 0.15)));
    const stk = clamp01((t - A("s4:usang") + 0.12) / 0.2);
    stamp.visible = stk > 0; stamp.scale.setScalar(lerp(2.4, 1, stk)); stamp.rotation.z = lerp(-0.5, -0.22, stk); stamp.material.opacity = stk;
    const levUp = popS(t, A("s4:LightingStyle") - 0.3, 0.5) * (1 - ramp(t, K.s5 - 0.1, K.s5 + 0.6));
    lever.visible = levUp > 0.01; lever.scale.setScalar(Math.max(0.001, levUp));
    let lv = -1;
    for (const [w, v] of [["s4:Soft", 0], ["s4:Realistic", 1], ["s4:Soft#2", 0], ["s4:Realistic#2", 1]]) if (t >= A(w) - 0.1) lv = v;
    const tgtA = lv === 0 ? 0.55 : lv === 1 ? -0.55 : 0;
    arm.rotation.z = tgtA; levPlate.material.map = levTx[lv + 1];
    const mUp = ramp(t, K.s5 - 0.1, K.s5 + 0.8) * (1 - ramp(t, K.s6 - 0.1, K.s6 + 0.7));
    meter.visible = mUp > 0.01; meter.position.y = -14 * (1 - mUp); meter.scale.setScalar(Math.max(0.001, mUp));
    if (meter.visible) {
      const pick = t >= A("s5:atau") - 0.1 ? 2 : t >= A("s5:kualitas") - 0.1 ? 1 : 0;
      const nearV = 1 - 0.8 * fade(t, A("s5:kualitas") - 0.1, A("s5:atau") - 0.1, 0.3);
      const farV = 1 - 0.8 * ramp(t, A("s5:atau") - 0.1, A("s5:atau") + 0.3);
      drawMeter(nearV, farV, pick);
    }
    const gUp = ramp(t, K.s6 - 0.3, K.s6 + 0.7);
    globe.visible = gUp > 0.01; globe.scale.setScalar(Math.max(0.001, gUp));
    sph.rotation.y = t * 0.25;
    const rr = 4.5 * Math.cos(lat * D2R) + 0.2; latRing.scale.set(rr, rr, 1); latRing.position.y = 8.4 + 4.5 * Math.sin(lat * D2R);
    geoLab.scale.setScalar(Math.max(0.001, popS(t, A("s6:GeographicLatitude") - 0.2))); bb(geoLab);
    const jk = popS(t, A("s7:Jakarta") - 0.1) * (1 - ramp(t, K.s8 - 0.2, K.s8 + 0.3));
    jak.visible = pin.visible = jk > 0.01; jak.scale.setScalar(Math.max(0.001, jk)); jak.position.set(5, 9, 3); bb(jak);
    pin.position.set(0, 8.4 + 4.5 * Math.sin(-6 * D2R), 4.6); pin.rotation.x = -Math.PI / 2; pin.scale.setScalar(Math.max(0.001, jk));
    clockLab.scale.setScalar(Math.max(0.001, popS(t, A("s6:ClockTime") - 0.2) * (1 - ramp(t, K.s7 + 1.5, K.s7 + 2))));
    clockLab.visible = t > A("s6:ClockTime") - 0.2 && t < K.s7 + 2;

    // clock hands follow ClockTime
    const h12 = (clk % 12) / 12, mn = clk % 1;
    hourP.rotation.z = -h12 * Math.PI * 2; minP.rotation.z = -mn * Math.PI * 2;

    // sun path
    const arcV = fade(t, A("s6:GeographicLatitude") - 0.6, K.s8 + 0.6, 0.6);
    dots.material.opacity = arcV; sunBall.visible = arcV > 0.01 && sv.y > -0.05; sunBall.material.opacity = arcV; halo.material.opacity = 0.25 * arcV;
    if (arcV > 0.01) {
      const tv = new THREE.Vector3();
      for (let i = 0; i < ND; i++) { sunVec(lat, 6 + (12 * i) / (ND - 1), tv).multiplyScalar(R_ARC); dots.setMatrixAt(i, _m.makeTranslation(tv.x, tv.y + 1, tv.z)); }
      dots.instanceMatrix.needsUpdate = true;
      sunBall.position.copy(sv).multiplyScalar(R_ARC); sunBall.position.y += 1;
    }

    // villagers face the camera
    vill.forEach(([m, x, z], i) => { m.rotation.y = Math.atan2(camPos.x - x, camPos.z - z); m.position.y = 2 + Math.abs(Math.sin(t * 2 + i)) * 0.12; });

    // avatar
    const a = avState(t);
    av.G.position.set(a.x, 0, a.z); av.G.rotation.y = a.ry;
    restPose(av); av.head.rotation.set(0, 0, 0);
    if (a.mv) { runPose(av, (a.u || 0) * 1.4, a.push ? 0.6 : 0.8); av.G.position.y = Math.abs(Math.sin((a.u || 0) * 1.4)) * 0.18; }
    if (a.push) { av.armL.rotation.x = av.armR.rotation.x = -1.35; }
    phone.visible = phoneScr.visible = t > K.s5 - 0.2 && t < K.s6 + 0.1;
    if (t < N(9.2)) { av.armL.rotation.x = -1.3; av.armL.rotation.z = -0.25; av.head.rotation.y = -0.35; av.G.position.y = Math.abs(Math.sin(t * 3)) * 0.06; }
    else if (t >= N(24.6) && t < K.s4) { if (t > A("s3:Voxel") - 0.2) { av.armL.rotation.z = -1.45; av.head.rotation.y = -0.5; } }
    else if (t >= K.s4 && t < K.s5) { av.head.rotation.y = 0.45; if (t > A("s4:LightingStyle") - 0.2) { av.armR.rotation.z = 1.3; av.armR.rotation.x = -0.2 + 0.1 * Math.sin(t * 6); } }
    else if (t >= K.s5 && t < K.s6 + 0.1) { av.armR.rotation.x = -1.25; av.head.rotation.x = 0.35; }
    else if (t >= N(60.4) && t < N(77.2)) { av.armR.rotation.z = 1.2 + 0.15 * Math.sin(t * 3); av.armR.rotation.x = -0.6; av.head.rotation.y = 0.25; av.head.rotation.x = -0.15; }
    else if (t >= N(83.2)) { av.armR.rotation.z = 2.6 + 0.35 * Math.sin(t * 8); av.head.rotation.z = 0.08 * Math.sin(t * 4); av.G.position.y = Math.abs(Math.sin(t * 4)) * 0.1; }
    scarf.rotation.y = 0;

    // tilt-shift focus: tighter in close shots
    post.uniforms.uBlur.value = c[3] < 80 ? 7 : 5.5;
    comp.render();
  };
}
