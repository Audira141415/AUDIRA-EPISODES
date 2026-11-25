// EP35 GLITCHFORGE: one faulty update (19 July 2024) crashes 8.5 million Windows PCs.
// A pale product-studio world (pearl plastics, glossy black bezels, chrome, cyan/red kickers) whose feed corrupts
// with seeded 12 Hz glitches: RGB split, scanline tears, macroblocks, datamosh, a brief signal-lost frame.
// Stations along one studio floor (x axis), cut between under glitch bursts:
//   WALL  (x 0)   s1 hook: a curved wall of 72 monitors flips to an original blue error screen, cascade from centre
//                 s5 wall stays blue while the update packet flies back up its cable (pulled after 78 min)
//                 s8 restored, a last ripple ("satu kesalahan kecil bisa merambat"), AUDIRA plaque on the base
//   RACK  (x -14) s2 the update server: three pearl racks, the UPDATE packet slides out along a cable
//   STACK (x 16)  s3 exploded layer stack APLIKASI / WINDOWS / KERNEL (FALCON chip), CHANNEL FILE 291 descends,
//                 breaks, a memory pointer reads past the end, the slabs shear apart (crash)
//   BOOT  (x 31)  s4 hero monitor bootloops inside a loop ring, then the impact cluster: departure board, BANDARA,
//                 BANK, RUMAH SAKIT, DARURAT, CHECK-IN monitors
//   FIX   (x 44+) s6 a small technician walks desk to desk: blue > lock > safe mode > clean; 48-digit key strip
//   GRID  (x 70)  s7 10x10 pearl cubes = all Windows devices, one blue cube (<1%), tags BANDARA/BANK, gold loss column
// Everything is a pure function of t.

const FONTS = ['700 80px "Space Grotesk"', '500 80px "JetBrains Mono"', '700 80px "JetBrains Mono"'];
if (document.fonts && document.fonts.load) {
  try { await Promise.race([Promise.all(FONTS.map((f) => document.fonts.load(f, "UPDATE KERNEL AUDIRA 0123"))), new Promise((r) => setTimeout(r, 15000))]); } catch (e) { /* fallback */ }
}

import * as THREE from "./three.module.js";
import { mulberry, eout, clamp01, smooth, back, canvasTex, stage } from "./lib3d.js";
import { RoomEnvironment } from "./RoomEnvironment.js";
import { ShaderPass } from "./ShaderPass.js";

const SG = '"Space Grotesk", "Segoe UI", sans-serif', MONO = '"JetBrains Mono", Consolas, monospace';
const INK = "#0B0C10", RED = "#FF1E56", CYAN = "#00E5FF", BLUE = "#1747C9", GREEN = "#2BD77A";

function track(keys) {
  keys = keys.slice().sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const tan = keys.map((k, i) => k.map((v, j) => {
    if (j === 0 || i === 0 || i === n - 1) return 0;
    const a = keys[i - 1], b = keys[i + 1], d0 = (v - a[j]) / Math.max(0.001, k[0] - a[0]), d1 = (b[j] - v) / Math.max(0.001, b[0] - k[0]);
    return d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1);
  }));
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h, u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => { const j = jj + 1; return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j]; });
  };
}
const win = (t, a, b, fi = 0.3, fo = 0.3) => Math.min(clamp01((t - a) / fi), 1 - clamp01((t - b) / fo));
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const GlitchShader = {
  uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uSplit: { value: 0 }, uTear: { value: 0 }, uBlock: { value: 0 }, uMosh: { value: 0 }, uSort: { value: 0 }, uLost: { value: 0 }, uRes: { value: new THREE.Vector2(1080, 1920) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
uniform sampler2D tDiffuse; uniform float uSeed, uSplit, uTear, uBlock, uMosh, uSort, uLost; uniform vec2 uRes; varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 uv = vUv;
  float row = floor(uv.y * 64.0);
  if (hash(vec2(row, uSeed)) < uTear * 0.32) uv.x += (hash(vec2(row, uSeed + 1.7)) - 0.5) * 0.2 * uTear;
  vec2 blk = floor(uv * vec2(8.0, 14.0));
  if (hash(blk + uSeed) < uBlock * 0.26) uv += (vec2(hash(blk + uSeed + 3.1), hash(blk + uSeed + 5.3)) - 0.5) * 0.14 * uBlock;
  vec2 mb = floor(uv * vec2(12.0, 21.0));
  float mosh = step(hash(mb + floor(uSeed * 0.25)), uMosh * 0.5);
  if (mosh > 0.5) { vec2 dir = normalize(vec2(hash(mb + 11.0) - 0.5, hash(mb + 17.0) - 0.5) + 1e-4); uv -= dir * 0.08 * uMosh; vec2 q = vec2(72.0, 128.0); uv = (floor(uv * q) + 0.5) / q; }
  uv = clamp(uv, 0.001, 0.999);
  float s = uSplit * 0.02;
  vec3 c; c.r = texture2D(tDiffuse, uv + vec2(s, 0.0)).r; c.g = texture2D(tDiffuse, uv).g; c.b = texture2D(tDiffuse, uv - vec2(s, s * 0.35)).b;
  float col = floor(uv.x * uRes.x / 4.0);
  if (hash(vec2(col, floor(uSeed * 0.5))) < uSort * 0.4) {
    vec3 best = c; float bl = luma(c);
    for (int i = 1; i < 14; i++) { vec3 sc = texture2D(tDiffuse, uv + vec2(0.0, float(i) * 0.014 * uSort)).rgb; float l = luma(sc); if (l > bl && l > 0.55) { best = sc; bl = l; } }
    c = mix(c, best * vec3(1.05, 0.95, 1.1), 0.9);
  }
  if (mosh > 0.5) c = floor(c * 6.0) / 6.0 * mix(vec3(1.0), vec3(0.85, 1.1, 1.15), hash(mb));
  if (uLost > 0.0) {
    float bar = floor(vUv.x * 7.0); vec3 b = vec3(0.9);
    if (bar == 1.0) b = vec3(0.9, 0.9, 0.1); else if (bar == 2.0) b = vec3(0.1, 0.9, 0.9); else if (bar == 3.0) b = vec3(0.1, 0.9, 0.1);
    else if (bar == 4.0) b = vec3(0.9, 0.1, 0.9); else if (bar == 5.0) b = vec3(0.9, 0.1, 0.1); else if (bar == 6.0) b = vec3(0.1, 0.1, 0.9);
    float snow = hash(floor(vUv * uRes / 3.0) + uSeed * 7.0);
    vec3 lostC = vUv.y > 0.32 ? mix(b, vec3(snow), 0.35) : vec3(snow * 0.8);
    c = mix(c, lostC, uLost);
  }
  float unstable = clamp(uSplit + uTear + uLost, 0.0, 1.0);
  c *= 1.0 - unstable * 0.12 * step(0.5, fract(vUv.y * uRes.y / 3.0));
  gl_FragColor = vec4(c, 1.0);
}`,
};

export function create(canvas, K, AT) {
  const A = (k) => { if (AT[k] === undefined) throw new Error("missing anchor " + k); return AT[k]; };
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0xd8d9de, exp: 0.85, bloom: [0.06, 0.35, 0.95], fov: 38 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.85;
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;
  cam.near = 0.1; cam.far = 400; cam.updateProjectionMatrix();
  scene.add(cam);
  // backdrop darkens toward the top (memory fix for a hazy white studio)
  scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5E636E"); gr.addColorStop(0.3, "#9DA1AB"); gr.addColorStop(0.55, "#CDCFD5"); gr.addColorStop(1, "#E2E3E7"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0xb9bcc4, 45, 110);
  const glitch = new ShaderPass(GlitchShader);
  comp.addPass(glitch);
  const GU = glitch.uniforms;

  // ---------- lights: low ambient, strong side key, cyan + red kickers (follow the active station) ----------
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8f939e, 0.3));
  const key = new THREE.DirectionalLight(0xfff4ea, 3.6);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
  scene.add(key, key.target);
  const kC = new THREE.PointLight(0x00e5ff, 12, 0, 1.4), kR = new THREE.PointLight(0xff1e56, 6, 0, 1.4);
  scene.add(kC, kR);

  const std = (c, ro = 0.5, me = 0, ex = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: ro, metalness: me, ...ex });
  const add = (geo, mat, x = 0, y = 0, z = 0, p = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; p.add(m); return m; };
  const basic = (o = {}) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, ...o });
  const noiseTex = (seed, base, amp, n, rep) => canvasTex(512, 512, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); const q = mulberry(seed); for (let i = 0; i < n; i++) { const v = q() < 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${amp * (0.4 + q() * 0.6)})`; g.fillRect(q() * w, q() * w, 1 + q() * 2, 1 + q() * 1.5); } }, rep);
  const grainT = noiseTex(9, "#c8c8c8", 0.25, 26000, [3, 3]);
  const M = {
    pearl: new THREE.MeshPhysicalMaterial({ color: 0xf3f2ef, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.35, iridescenceIOR: 1.35, sheen: 0.3, sheenColor: new THREE.Color("#CFE6FF"), roughnessMap: grainT }),
    bezel: new THREE.MeshPhysicalMaterial({ color: 0x121419, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
    chrome: std(0xd9dde6, 0.12, 1),
    darkMetal: std(0x3a3e47, 0.35, 0.8),
    gold: std(0xe8b84a, 0.38, 1, { envMapIntensity: 3.0, emissive: 0x4a3208, emissiveIntensity: 0.5 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x1a1e27, roughness: 0.08, clearcoat: 1, metalness: 0.2 }),
  };

  // rounded box (extruded rounded rect with bevel)
  const RB = new Map();
  function rbox(w, h, d, r = 0.05) {
    const kk = [w, h, d, r].join("|"); if (RB.has(kk)) return RB.get(kk);
    const b = r * 0.6, W = w - 2 * b, H = h - 2 * b, rr = Math.min(r, W / 2.2, H / 2.2), s = new THREE.Shape();
    s.moveTo(-W / 2 + rr, -H / 2); s.lineTo(W / 2 - rr, -H / 2); s.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + rr); s.lineTo(W / 2, H / 2 - rr); s.quadraticCurveTo(W / 2, H / 2, W / 2 - rr, H / 2);
    s.lineTo(-W / 2 + rr, H / 2); s.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - rr); s.lineTo(-W / 2, -H / 2 + rr); s.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + rr, -H / 2);
    const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
    geo.center(); RB.set(kk, geo); return geo;
  }
  // text plate helper: paint(g,w,h) on a canvas, standing plane of world width w
  function plate(w, h, paint, cw = 1024, o = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: canvasTex(cw, Math.round((cw * h) / w), paint), ...o }));
    m.renderOrder = 6; return m;
  }
  const label = (s, { font = SG, wt = 700, fg = INK, bg = "rgba(250,250,252,.95)", bar = RED, size = 0.62 } = {}) => (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, h * 0.12); g.fill();
    if (bar) { g.fillStyle = bar; g.fillRect(0, 0, h * 0.14, h); }
    g.fillStyle = fg; g.font = `${wt} ${Math.round(h * size)}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(s, w / 2 + (bar ? h * 0.07 : 0), h * 0.54);
  };
  // soft contact shadow blob
  const blobT = canvasTex(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(10,12,18,.55)"); gr.addColorStop(0.55, "rgba(10,12,18,.22)"); gr.addColorStop(1, "rgba(10,12,18,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  function blob(x, z, w, d, o = 1, p = scene, y = 0.012) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false, opacity: o })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); p.add(m); return m; }

  // ---------- studio floor + cyclorama ----------
  const floor = add(new THREE.PlaneGeometry(500, 300), std(0xdedfe4, 0.45, 0, { roughnessMap: noiseTex(4, "#a0a0a0", 0.3, 40000, [60, 40]) }), 25, 0, 0);
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  {
    const wallT = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6C717C"); gr.addColorStop(0.6, "#B9BCC4"); gr.addColorStop(1, "#D6D8DD"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const cyc = add(new THREE.PlaneGeometry(300, 60), std(0xffffff, 0.9, 0, { map: wallT }), 25, 30, -26); cyc.castShadow = false;
    const cove = add(new THREE.CylinderGeometry(6, 6, 300, 24, 1, true, Math.PI, Math.PI / 2), std(0xd6d8dd, 0.9), 25, 6, -20);
    cove.rotation.z = Math.PI / 2; cove.castShadow = false;
  }

  // ---------- screen textures (original designs, no OS branding) ----------
  const SW = 512, SH = 320;
  const scr = (paint) => canvasTex(SW, SH, paint);
  const T = {
    clean: scr((g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#EEF2F8"); gr.addColorStop(1, "#C9D4E4"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(40, 40, 250, 170); g.fillStyle = "#DCE3EE"; g.fillRect(40, 40, 250, 22);
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#C7D0DE" : "#AFC0D8"; g.fillRect(56, 80 + i * 22, 140 + (i * 37) % 70, 10); }
      g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(310, 90, 160, 120);
      g.fillStyle = "#1C2230"; g.fillRect(0, h - 30, w, 30);
      g.fillStyle = GREEN; g.beginPath(); g.moveTo(w - 70, h - 25); g.lineTo(w - 52, h - 19); g.lineTo(w - 52, h - 11); g.quadraticCurveTo(w - 61, h - 4, w - 70, h - 2); g.quadraticCurveTo(w - 79, h - 4, w - 88, h - 11); g.lineTo(w - 88, h - 19); g.closePath(); g.fill();
      g.fillStyle = "#fff"; g.font = `700 15px ${MONO}`; g.textAlign = "right"; g.fillText("AMAN", w - 98, h - 10);
    }),
    blue: scr((g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1A52D6"); gr.addColorStop(1, "#0E36A6"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#fff"; g.lineWidth = 9; g.beginPath(); g.moveTo(80, 40); g.lineTo(130, 128); g.lineTo(30, 128); g.closePath(); g.lineJoin = "round"; g.stroke();
      g.fillStyle = "#fff"; g.fillRect(76, 68, 9, 34); g.fillRect(76, 108, 9, 9);
      g.textAlign = "left"; g.font = `700 40px ${SG}`; g.fillText("SISTEM BERHENTI", 158, 82);
      g.font = `500 21px ${SG}`; g.fillStyle = "rgba(255,255,255,.9)"; g.fillText("Galat kernel. Perlu dinyalakan ulang.", 160, 118);
      g.fillStyle = "rgba(255,255,255,.25)"; for (let i = 0; i < 4; i++) g.fillRect(32, 170 + i * 26, 300 - i * 50, 10);
      g.fillStyle = "#fff"; g.font = `700 26px ${MONO}`; g.fillText("0%", 32, 292);
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(100, 280, 380, 8);
    }),
    boot: scr((g, w, h) => {
      g.fillStyle = "#07090D"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.fillStyle = `rgba(230,236,245,${0.25 + 0.75 * (i / 7)})`; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 34, h / 2 - 20 + Math.sin(a) * 34, 7, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "#C9D1DD"; g.font = `500 24px ${SG}`; g.textAlign = "center"; g.fillText("memulai ulang…", w / 2, h / 2 + 52);
    }),
    safe: scr((g, w, h) => {
      g.fillStyle = "#0A1834"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#fff"; g.font = `700 34px ${SG}`; g.textAlign = "left"; g.fillText("MODE AMAN", 30, 58);
      g.font = `500 21px ${MONO}`; g.fillStyle = CYAN; g.fillText("> hapus C-00000291*.sys", 30, 130);
      g.fillStyle = GREEN; g.fillText("> 1 berkas dihapus", 30, 168);
      g.fillStyle = "#C9D1DD"; g.fillText("> mulai ulang normal", 30, 206);
      g.fillStyle = "#fff"; g.fillRect(30, 226, 14, 24);
    }),
    lock: scr((g, w, h) => {
      g.fillStyle = "#123A8C"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#fff"; g.lineWidth = 9; g.beginPath(); g.arc(w / 2, 92, 28, Math.PI, 0); g.stroke(); g.fillStyle = "#fff"; g.fillRect(w / 2 - 42, 92, 84, 64);
      g.fillStyle = "#123A8C"; g.beginPath(); g.arc(w / 2, 118, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff"; g.font = `700 26px ${SG}`; g.textAlign = "center"; g.fillText("MASUKKAN KUNCI PEMULIHAN", w / 2, 200);
      g.font = `500 19px ${MONO}`; g.fillStyle = "rgba(255,255,255,.75)"; g.fillText("______-______-______-______-…", w / 2, 246);
    }),
    flash: scr((g, w, h) => { g.fillStyle = "#F4FBFF"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,229,255,.5)"; g.fillRect(0, h * 0.45, w, 10); }),
  };
  const SM = {}; for (const k in T) SM[k] = new THREE.MeshBasicMaterial({ map: T[k], toneMapped: false, color: new THREE.Color(0.93, 0.93, 0.93) });

  function monitor(w, h, { stand = false, p = scene, x = 0, y = 0, z = 0, ry = 0, state = "clean" } = {}) {
    const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; p.add(G);
    add(rbox(w + 0.12, h + 0.12, 0.1, 0.05), M.bezel, 0, 0, 0, G);
    add(rbox(w * 0.55, h * 0.5, 0.14, 0.05), M.bezel, 0, 0, -0.1, G);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), SM[state]); s.position.z = 0.052; G.add(s);
    if (stand) { add(new THREE.CylinderGeometry(0.05, 0.06, h * 0.7, 12), M.chrome, 0, -h * 0.5 - h * 0.35, -0.12, G); add(rbox(w * 0.45, 0.06, 0.42, 0.03), M.chrome, 0, -h * 0.5 - h * 0.7, -0.08, G); }
    return { G, s, set(k) { if (s.material !== SM[k]) s.material = SM[k]; } };
  }

  // =================== WALL (x 0) ===================
  const WC = 9, WR = 8, MW = 1.6, MH = 1.0, PX = 1.74, PY = 1.13, WRAD = 24;
  const wall = [];
  const wq = mulberry(35);
  for (let rI = 0; rI < WR; rI++) for (let c = 0; c < WC; c++) {
    const a = ((c - 4) * PX) / WRAD;
    const mo = monitor(MW, MH, { x: Math.sin(a) * WRAD, y: 1.25 + rI * PY + MH / 2, z: -8 + WRAD * (1 - Math.cos(a)), ry: -a });
    const d = Math.hypot(c - 4, (rI - 3.5) * 1.1);
    wall.push({ mo, d, j: wq(), boot: wq() < 0.2 ? K.s5 + 0.8 + wq() * 5.6 : -1 });
  }
  // frame poles, base plinth, AUDIRA plaque
  for (let c = 0; c <= WC; c++) { const a = ((c - 4.5) * PX) / WRAD; add(new THREE.CylinderGeometry(0.045, 0.045, 10.4, 10), M.chrome, Math.sin(a) * WRAD, 5.2, -8.25 + WRAD * (1 - Math.cos(a))); }
  add(rbox(17.2, 1.1, 1.4, 0.12), M.pearl, 0, 0.55, -7.9);
  blob(0, -7.4, 19, 3.2, 0.9);
  const wallPlaque = plate(4.6, 0.62, label("AUDIRA · RUANG KONTROL", { font: MONO, size: 0.5 }), 1024); wallPlaque.position.set(0, 0.6, -7.18); scene.add(wallPlaque);
  // update packet (pearl cube, cyan edges, UPDATE label)
  const pkT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#F7F7F5"; g.fillRect(0, 0, w, w); g.strokeStyle = CYAN; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, w - 20); g.fillStyle = INK; g.font = `700 50px ${SG}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("UPDATE", w / 2, w / 2 - 10); g.font = `500 26px ${MONO}`; g.fillStyle = "#3A6BFF"; g.fillText("v. rutin", w / 2, w / 2 + 40); });
  const packet = new THREE.Group(); scene.add(packet);
  add(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: pkT, roughness: 0.25, clearcoat: 1 }), 0, 0, 0, packet);
  const pkEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.96, 0.96, 0.96)), new THREE.LineBasicMaterial({ color: 0x00e5ff, toneMapped: false })); packet.add(pkEdge);
  const pkGlow = new THREE.PointLight(0x00e5ff, 6, 6, 1.5); packet.add(pkGlow);

  // =================== RACK (x -14) ===================
  const RX = -13.6, RZ = -4.6;
  const ledM = [];
  function rack(x, z, h, hero) {
    const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
    add(rbox(1.7, h, 1.5, 0.14), M.pearl, 0, h / 2, 0, G);
    add(rbox(1.36, h - 0.5, 0.06, 0.04), M.glass, 0, h / 2, 0.75, G);
    const n = Math.floor((h - 0.8) / 0.42);
    for (let i = 0; i < n; i++) {
      add(rbox(1.2, 0.3, 0.05, 0.03), M.darkMetal, 0, 0.55 + i * 0.42, 0.79, G);
      for (let k = 0; k < 4; k++) { const m = new THREE.MeshBasicMaterial({ color: 0x2bd77a, toneMapped: false }); const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.02), m); l.position.set(-0.45 + k * 0.12, 0.55 + i * 0.42, 0.825); G.add(l); ledM.push({ m, s: hash(x * 13 + i * 7 + k), hero }); }
    }
    blob(x, z + 0.2, 3, 2.6, 0.9);
    return G;
  }
  rack(RX - 2.3, RZ - 0.6, 3.8, false); rack(RX, RZ, 4.6, true); rack(RX + 2.3, RZ - 0.6, 3.8, false);
  { const pl = plate(1.4, 0.32, label("SERVER UPDATE", { font: MONO, size: 0.5, bar: CYAN }), 512); pl.position.set(RX, 4.32, RZ + 0.77); scene.add(pl); }
  // cable from hero rack top into the wall's left edge
  const CABLE = new THREE.CatmullRomCurve3([new THREE.Vector3(RX, 4.6, RZ), new THREE.Vector3(RX + 0.6, 6.4, RZ - 0.6), new THREE.Vector3(RX + 3.2, 8.2, -6.2), new THREE.Vector3(-8.9, 8.6, -6.6), new THREE.Vector3(-7.9, 8.2, -6.8)]);
  add(new THREE.TubeGeometry(CABLE, 120, 0.09, 10), M.bezel);
  // a cyan pulse sleeve that rides the cable with the packet
  const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), basic({ color: 0x00e5ff, opacity: 0.8 })); scene.add(sleeve);

  // =================== STACK (x 16) ===================
  const SX = 16, SZ = -4;
  add(new THREE.CylinderGeometry(3.6, 3.8, 0.5, 64), M.pearl, SX, 0.25, SZ);
  { const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.025, 8, 128), new THREE.MeshBasicMaterial({ color: 0x00e5ff, toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.set(SX, 0.51, SZ); scene.add(ring); }
  blob(SX, SZ, 9, 9, 0.8);
  const slabLab = (s, dark) => canvasTex(1024, 180, (g, w, h) => { g.fillStyle = dark ? "#0E1118" : "#F4F3F0"; g.fillRect(0, 0, w, h); g.fillStyle = dark ? CYAN : INK; g.font = `700 104px ${SG}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(s, 60, h * 0.54); g.fillStyle = dark ? CYAN : RED; g.fillRect(0, 0, 22, h); });
  function slab(name, dark) {
    const G = new THREE.Group(); scene.add(G);
    const bm = dark ? new THREE.MeshPhysicalMaterial({ color: 0x0e1118, roughness: 0.15, clearcoat: 1 }) : M.pearl;
    add(rbox(5.2, 0.85, 3.2, 0.1), bm, 0, 0, 0, G);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 0.66), new THREE.MeshBasicMaterial({ map: slabLab(name, dark), toneMapped: false, color: new THREE.Color(0.95, 0.95, 0.95) })); f.position.set(0, 0, 1.61); G.add(f);
    return G;
  }
  const SL = [slab("KERNEL", true), slab("WINDOWS", false), slab("APLIKASI", false)];
  const kEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.24, 0.89, 3.24)), new THREE.LineBasicMaterial({ color: 0x00e5ff, toneMapped: false, transparent: true })); SL[0].add(kEdge);
  const falcon = new THREE.Group(); SL[0].add(falcon); falcon.position.set(1.6, 0.47, 0.4);
  add(rbox(1.2, 0.18, 0.8, 0.05), M.darkMetal, 0, 0, 0, falcon);
  { const fl = plate(1.15, 0.3, label("FALCON", { font: MONO, size: 0.62, bg: "rgba(14,17,24,.95)", fg: CYAN, bar: null }), 512); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.1; falcon.add(fl); }
  // channel file token
  const fileT = (bad) => canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = bad ? "#FFE8EC" : "#F7F7F5"; g.fillRect(0, 0, w, h); g.fillStyle = bad ? RED : "#3A6BFF"; g.fillRect(0, 0, w, 50);
    g.fillStyle = "#fff"; g.font = `700 30px ${MONO}`; g.textAlign = "left"; g.fillText(bad ? "RUSAK" : "KONFIGURASI", 20, 36);
    g.fillStyle = INK; g.font = `700 58px ${SG}`; g.fillText("CHANNEL", 22, 128); g.fillText("FILE 291", 22, 190);
    g.font = `500 22px ${MONO}`; g.fillStyle = "#5B6170"; g.fillText("C-00000291*.sys", 22, 250);
    if (bad) { g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.moveTo(330, 50); g.lineTo(300, 140); g.lineTo(360, 170); g.lineTo(320, 320); g.stroke(); }
  });
  const fileOK = fileT(false), fileBad = fileT(true);
  const fileM = new THREE.MeshPhysicalMaterial({ map: fileOK, roughness: 0.3, clearcoat: 0.8 });
  const fileTok = new THREE.Group(); scene.add(fileTok);
  add(rbox(1.9, 1.2, 0.12, 0.05), M.pearl, 0, 0, -0.01, fileTok);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.12), fileM); f.position.z = 0.065; fileTok.add(f); }
  // memory cells in front of the stack
  const memG = new THREE.Group(); memG.position.set(SX - 2.2, 0.72, SZ + 3.2); scene.add(memG);
  const cellM = std(0xe9eaee, 0.3), cellBad = new THREE.MeshStandardMaterial({ color: 0xff1e56, emissive: 0xff1e56, emissiveIntensity: 0.5, roughness: 0.4 });
  for (let i = 0; i < 8; i++) add(rbox(0.46, 0.36, 0.36, 0.05), cellM, i * 0.52, 0, 0, memG);
  const outCells = [];
  for (let i = 8; i < 11; i++) { const m = add(rbox(0.46, 0.36, 0.36, 0.05), cellBad, i * 0.52, 0, 0, memG); outCells.push(m); }
  { const pl = plate(1.7, 0.3, label("MEMORI", { font: MONO, size: 0.6, bar: CYAN }), 512); pl.position.set(0.6, 0.42, 0); memG.add(pl); }
  const outLab = plate(1.8, 0.34, label("LUAR BATAS", { font: MONO, size: 0.58, bg: RED, fg: "#fff", bar: null }), 512); outLab.position.set(4.68, 0.45, 0); memG.add(outLab);
  const ptr = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.32, 3), new THREE.MeshBasicMaterial({ color: 0xff1e56, toneMapped: false })); ptr.rotation.z = Math.PI; memG.add(ptr);

  // =================== BOOT + IMPACT (x 31) ===================
  const BX = 31, BZ = -4;
  const hero = monitor(2.6, 1.6, { stand: true, x: BX, y: 2.5, z: BZ, state: "blue" });
  blob(BX, BZ, 2.6, 1.8, 0.9);
  const loopG = new THREE.Group(); loopG.position.set(BX, 2.5, BZ + 0.3); scene.add(loopG);
  const loopM = basic({ color: 0x00e5ff, opacity: 0.95 });
  loopG.add(new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.05, 10, 128, Math.PI * 1.75), loopM));
  const loopHead = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 16), loopM); loopG.add(loopHead);
  const CL = [["BANDARA", -4.0, -1.6, 0.5], ["BANK", -2.2, -3.2, 0.3], ["RUMAH SAKIT", 2.2, -3.2, -0.3], ["DARURAT", 4.0, -1.6, -0.5], ["CHECK-IN", 0.0, -5.0, 0]];
  const clus = CL.map(([n, dx, dz, ry]) => {
    const mo = monitor(1.7, 1.06, { stand: true, x: BX + dx, y: 2.15, z: BZ + dz, ry, state: "clean" });
    const lb = plate(1.6, 0.34, label(n, { font: MONO, size: 0.52 }), 512); lb.position.set(0, 0.82, 0.06); mo.G.add(lb);
    blob(BX + dx, BZ + dz, 2, 1.4, 0.8);
    return { mo, lb, n };
  });
  // departure board
  const DEP = [["08.15", "ATLANTA"], ["08.40", "NEW YORK"], ["09.05", "LONDON"], ["09.30", "SYDNEY"], ["10.10", "AMSTERDAM"], ["10.45", "LOS ANGELES"]];
  const depT = []; for (let k = 0; k <= DEP.length; k++) depT.push(canvasTex(1024, 640, (g, w, h) => {
    g.fillStyle = "#0D1016"; g.fillRect(0, 0, w, h); g.fillStyle = "#FFC94A"; g.font = `700 54px ${SG}`; g.textAlign = "left"; g.fillText("KEBERANGKATAN", 40, 72);
    g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(40, 96, w - 80, 3);
    DEP.forEach((d, i) => { const y = 160 + i * 78; g.fillStyle = "#E8ECF2"; g.font = `500 40px ${MONO}`; g.fillText(d[0], 40, y); g.fillText(d[1], 200, y); const bad = i < k; g.fillStyle = bad ? RED : GREEN; g.font = `700 36px ${MONO}`; g.textAlign = "right"; g.fillText(bad ? "DIBATALKAN" : "TEPAT WAKTU", w - 40, y); g.textAlign = "left"; });
  }));
  const depM = new THREE.MeshBasicMaterial({ map: depT[0], toneMapped: false, color: new THREE.Color(0.95, 0.95, 0.95) });
  const depG = new THREE.Group(); depG.position.set(BX, -0.9, BZ - 7.5); scene.add(depG);
  add(rbox(5.6, 3.6, 0.25, 0.1), M.bezel, 0, 4.6, 0, depG);
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 3.31), depM); s.position.set(0, 4.6, 0.13); depG.add(s); }
  for (const s of [-2.2, 2.2]) add(new THREE.CylinderGeometry(0.07, 0.07, 2.8, 12), M.chrome, s, 1.4, -0.1, depG);
  blob(BX, BZ - 7.5, 6.5, 1.5, 0.8);

  // =================== FIX ROW (x 44..) ===================
  const FX0 = 44, FDX = 2.9, FZ = -4;
  const desks = [];
  for (let i = 0; i < 5; i++) {
    const x = FX0 + i * FDX;
    add(rbox(2.2, 0.1, 1.1, 0.04), M.pearl, x, 1.0, FZ);
    for (const s of [-0.95, 0.95]) add(new THREE.CylinderGeometry(0.035, 0.035, 0.96, 10), M.chrome, x + s, 0.5, FZ);
    const mo = monitor(1.3, 0.82, { stand: true, x, y: 1.06 + 0.82 * 0.5 + 0.82 * 0.7 + 0.06, z: FZ - 0.15, state: "blue" });
    add(rbox(0.8, 0.04, 0.28, 0.02), M.bezel, x, 1.07, FZ + 0.3);
    blob(x, FZ, 2.8, 1.6, 0.85);
    desks.push({ x, mo });
  }
  // BitLocker key strip (fake digits, 8 groups of 6)
  const kq = mulberry(291);
  const KEY = Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => Math.floor(kq() * 10)).join("")).join("-");
  const keyTex = canvasTex(4096, 200, (g, w, h) => { g.fillStyle = "#F7F7F5"; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.fillRect(0, 0, 24, h); g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = INK; g.font = `700 100px ${MONO}`; g.fillText(KEY, 70, h / 2 + 4); });
  keyTex.wrapS = THREE.ClampToEdgeWrapping;
  const KL = 12.5;
  const keyGeo = new THREE.PlaneGeometry(KL, KL * 200 / 4096); keyGeo.translate(KL / 2, 0, 0);
  const keyStrip = new THREE.Mesh(keyGeo, basic({ map: keyTex })); keyStrip.position.set(FX0 + 1.8, 3.05, FZ - 1.0); scene.add(keyStrip);

  // technician (head with face, shoulders wider than hips, bent elbows/knees, skin != clothes)
  const tech = (() => {
    const G = new THREE.Group(); scene.add(G);
    const skin = std(0xc58d68, 0.6), shirt = std(0x1f8a8a, 0.8), pants = std(0x2a3550, 0.85), shoe = std(0x16181d, 0.5), hair = std(0x22170f, 0.7);
    const torso = add(new THREE.CylinderGeometry(0.25, 0.17, 0.56, 14), shirt, 0, 1.3, 0, G); torso.scale.z = 0.62;
    add(rbox(0.36, 0.2, 0.22, 0.06), pants, 0, 0.98, 0, G);
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10), skin, 0, 1.62, 0, G);
    const head = new THREE.Group(); head.position.set(0, 1.78, 0); G.add(head);
    add(new THREE.SphereGeometry(0.15, 20, 16), skin, 0, 0, 0, head);
    const hr = add(new THREE.SphereGeometry(0.158, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.012, -0.012, head); hr.rotation.x = -0.25;
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.022, 10, 8), std(0x0b0c10, 0.2), s * 0.055, 0.015, 0.138, head);
    add(new THREE.BoxGeometry(0.06, 0.012, 0.01), std(0x6a3a2a, 0.6), 0, -0.06, 0.145, head);
    add(rbox(0.08, 0.11, 0.015, 0.01), std(0xffffff, 0.4), 0.1, 1.26, 0.16, G); // ID badge
    const limb = (x, y, l1, l2, m1, m2, r) => {
      const a = new THREE.Group(); a.position.set(x, y, 0); G.add(a);
      add(new THREE.CylinderGeometry(r, r * 0.9, l1, 10), m1, 0, -l1 / 2, 0, a); add(new THREE.SphereGeometry(r * 1.05, 10, 8), m1, 0, 0, 0, a);
      const b = new THREE.Group(); b.position.y = -l1; a.add(b);
      add(new THREE.CylinderGeometry(r * 0.9, r * 0.8, l2, 10), m2, 0, -l2 / 2, 0, b); add(new THREE.SphereGeometry(r * 0.95, 10, 8), m2, 0, 0, 0, b);
      return [a, b];
    };
    const [uaL, faL] = limb(-0.29, 1.52, 0.29, 0.27, shirt, skin, 0.055), [uaR, faR] = limb(0.29, 1.52, 0.29, 0.27, shirt, skin, 0.055);
    const [thL, shL] = limb(-0.1, 0.92, 0.43, 0.42, pants, pants, 0.075), [thR, shR] = limb(0.1, 0.92, 0.43, 0.42, pants, pants, 0.075);
    for (const s of [shL, shR]) add(rbox(0.12, 0.08, 0.24, 0.03), shoe, 0, -0.45, 0.05, s);
    const sh = blob(0, 0, 0.9, 0.9, 0.9, G, 0.01);
    return { G, uaL, faL, uaR, faR, thL, shL, thR, shR, head, sh };
  })();
  function pose(p, mode) {
    const s = Math.sin(p);
    if (mode === "walk") {
      tech.thL.rotation.x = s * 0.5; tech.thR.rotation.x = -s * 0.5;
      tech.shL.rotation.x = Math.max(0, -Math.cos(p)) * 0.8 + 0.1; tech.shR.rotation.x = Math.max(0, Math.cos(p)) * 0.8 + 0.1;
      tech.uaL.rotation.x = -s * 0.45; tech.uaR.rotation.x = s * 0.45; tech.faL.rotation.x = -0.45; tech.faR.rotation.x = -0.45;
      tech.G.position.y = Math.abs(Math.cos(p)) * 0.03;
    } else {
      tech.thL.rotation.x = tech.thR.rotation.x = 0.05; tech.shL.rotation.x = tech.shR.rotation.x = 0.12;
      tech.uaL.rotation.x = -0.75 + 0.06 * Math.sin(p * 5); tech.uaR.rotation.x = -0.75 + 0.06 * Math.sin(p * 5 + 2);
      tech.faL.rotation.x = tech.faR.rotation.x = -0.9; tech.G.position.y = 0;
    }
  }

  // =================== GRID (x 70) ===================
  const GX = 70, GZ = -4;
  add(rbox(6.6, 0.6, 6.6, 0.12), new THREE.MeshPhysicalMaterial({ color: 0x15171d, roughness: 0.2, clearcoat: 1 }), GX, 0.3, GZ);
  blob(GX, GZ, 9, 9, 0.85);
  const cubeGeo = rbox(0.44, 0.44, 0.44, 0.06);
  const cubes = new THREE.InstancedMesh(cubeGeo, M.pearl, 100); cubes.castShadow = cubes.receiveShadow = true; scene.add(cubes);
  const BI = 63, dm = new THREE.Object3D();
  const cpos = (i) => [GX - 2.52 + (i % 10) * 0.56, 0.82, GZ - 2.52 + Math.floor(i / 10) * 0.56];
  for (let i = 0; i < 100; i++) { const p = cpos(i); dm.position.set(...p); dm.scale.setScalar(i === BI ? 0.001 : 1); dm.updateMatrix(); cubes.setMatrixAt(i, dm.matrix); }
  const blueCube = add(cubeGeo, new THREE.MeshStandardMaterial({ color: 0x1a52d6, emissive: 0x1a52d6, emissiveIntensity: 0.6, roughness: 0.3 }), ...cpos(BI));
  const pctLab = plate(1.6, 0.52, label("< 1 %", { size: 0.64, bar: BLUE }), 512, { depthTest: false }); scene.add(pctLab);
  const tagB = plate(1.6, 0.36, label("BANDARA", { font: MONO, size: 0.55 }), 512, { depthTest: false }), tagK = plate(1.6, 0.36, label("BANK", { font: MONO, size: 0.55 }), 512, { depthTest: false }); scene.add(tagB, tagK);
  const goldCol = add(rbox(1.1, 1, 1.1, 0.08), M.gold, GX + 4.1, 0.5, GZ + 0.6);
  blob(GX + 4.1, GZ + 0.6, 2, 2, 0.9);
  const goldLab = plate(2.2, 0.44, label("≈ US$5,4 MILIAR", { size: 0.5, bar: "#D6AA3E" }), 768); scene.add(goldLab);
  const gridLab = plate(3.2, 0.38, label("100 KOTAK = SEMUA WINDOWS", { font: MONO, size: 0.44, bar: CYAN }), 1024); gridLab.position.set(GX + 0.4, 0.62, GZ + 3.4); scene.add(gridLab);

  // out-of-focus foreground element (blurred monitor edge on the camera)
  const fgT = canvasTex(256, 1024, (g, w, h) => { g.filter = "blur(26px)"; g.fillStyle = "rgba(14,16,22,.95)"; g.fillRect(60, 80, 160, 900); g.fillStyle = "rgba(0,229,255,.55)"; g.fillRect(70, 120, 30, 820); });
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.8), new THREE.MeshBasicMaterial({ map: fgT, transparent: true, depthTest: false, depthWrite: false, opacity: 0.6, toneMapped: false }));
  fg.renderOrder = 50; fg.position.set(0.62, -0.15, -3); cam.add(fg);

  // =================== timing ===================
  const flip0 = A("s1:software");
  wall.forEach((w) => { w.flip = flip0 + 0.1 + w.d * 0.19 + w.j * 0.15; });
  const restore0 = K.s8 + 0.4, ripple0 = A("s8:merambat") - 0.4;
  function wallState(w, t) {
    if (t < K.s2) return t < w.flip ? "clean" : t < w.flip + 0.08 ? "flash" : "blue";
    if (t < K.s8) { if (t >= K.s5 && w.boot > 0 && t > w.boot && t < w.boot + 1.0) return "boot"; return "blue"; }
    const rt = restore0 + w.d * 0.14 + w.j * 0.15;
    if (t < rt) return "blue"; if (t < rt + 0.07) return "flash";
    const pt = ripple0 + w.d * 0.1;
    if (t >= pt && t < pt + 0.45) return t < pt + 0.06 ? "flash" : "blue";
    return "clean";
  }
  // stations: [center x, z] for key light placement
  const ST = { wall: [0, -7], rack: [RX, RZ], stack: [SX, SZ], boot: [BX, BZ - 2], fix: [FX0 + 5, FZ], grid: [GX, GZ] };
  const stationAt = (t) => t < K.s2 ? "wall" : t < K.s3 ? "rack" : t < K.s4 ? "stack" : t < K.s5 ? "boot" : t < K.s6 ? "wall" : t < K.s7 ? "fix" : t < K.s8 ? "grid" : "wall";

  // technician schedule
  const ARR = [A("s6:satu") - 0.1, A("s6:Komputer") - 0.2, A("s6:empat") + 0.1, K.s7 + 0.3];
  const DEPT = [A("s6:menghapus") + 0.9, A("s6:kunci") - 0.2, A("s6:mesin") - 0.2, K.s7 + 2];
  const techX = (t) => {
    const stopX = (i) => desks[i].x - 0.15;
    if (t < ARR[0]) { const u = clamp01((t - K.s6) / (ARR[0] - K.s6)); return [stopX(0) - 3.2 * (1 - u), "walk"]; }
    for (let i = 0; i < 4; i++) {
      if (t < DEPT[i]) return [stopX(i), "work"];
      if (i < 3 && t < ARR[i + 1]) { const u = smooth((t - DEPT[i]) / (ARR[i + 1] - DEPT[i])); return [stopX(i) + (stopX(i + 1) - stopX(i)) * u, "walk"]; }
    }
    return [stopX(3), "work"];
  };
  function deskState(i, t) {
    if (i === 4) return "blue";
    const a = ARR[i], d = DEPT[i];
    if (i === 0) { if (t < A("s6:mode") - 0.1) return "blue"; if (t < A("s6:menghapus") + 0.4) return "safe"; return "clean"; }
    if (t < a + 0.2) return "blue"; if (t < a + (d - a) * 0.45) return "lock"; if (t < d - 0.35) return "safe"; return "clean";
  }

  // glitch bursts [t, dur, amp, lost]
  const BU = [[flip0 - 0.04, 0.22, 0.75, 0], [A("s1:Delapan"), 0.18, 0.5, 0], [A("s3:rusak"), 0.26, 0.65, 0], [A("s3:crash") - 0.04, 0.6, 1.0, 0.2], [A("s4:crash"), 0.3, 0.75, 0], [A("s4:berhenti"), 0.2, 0.5, 0], [A("s5:ditarik"), 0.22, 0.5, 0], [A("s8:merambat") - 0.3, 0.3, 0.6, 0]];
  for (const k of ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]) BU.push([K[k] - 0.14, 0.3, 0.7, 0]);
  function glitchAt(t) {
    const step = Math.floor(t * 12), q = mulberry(6800 + step * 13), bz = q(), on = (p) => (bz < p ? 0.5 + 0.5 * q() : 0.12 * q());
    let amp = 0, lost = 0;
    for (const [a, d, g, l] of BU) { if (t >= a && t < a + d) { amp = Math.max(amp, g); if (l && t < a + l) lost = 1; } }
    const creep = Math.max(win(t, flip0 + 0.3, K.s2 - 0.3, 0.3, 0.5) * 0.25, win(t, A("s3:rusak"), A("s3:crash"), 0.4, 0.1) * 0.5 * ramp01(t, A("s3:rusak"), A("s3:crash")), t >= K.s5 && t < K.s6 ? 0.1 : 0);
    const live = Math.max(amp, creep * on(0.5));
    return { seed: (step % 997) + 0.37, split: Math.max(amp * 0.9, creep * (0.4 + on(0.6))), tear: Math.max(amp * 0.8, creep * on(0.4)), block: amp * 0.7 * (0.5 + 0.5 * q()), mosh: amp >= 0.9 ? 0.6 : amp * 0.3 * on(0.6), sort: amp >= 0.9 ? 0.5 : 0, lost: lost * 0.85, live };
  }
  function ramp01(t, a, b) { return clamp01((t - a) / (b - a)); }

  // =================== cameras per station (cut under glitch bursts) ===================
  const CAMS = {
    s1: track([[0, 0.6, 6.0, 23, 0, 3.9, -8], [A("s1:komputer"), 1.8, 5.8, 19.5, 0.2, 3.7, -8], [K.s2, 3.2, 5.6, 17.5, 0.4, 3.6, -8]]),
    s2: track([[K.s2, RX + 5.0, 4.4, 13, RX + 0.6, 4.8, RZ], [A("s2:mengirim"), RX + 5.6, 5.0, 13.5, RX + 1.2, 5.4, RZ - 0.6], [K.s3, RX + 7.6, 6.2, 14, RX + 3.2, 6.8, RZ - 1.4]]),
    s3: track([[K.s3, SX + 5, 6.6, 12.5, SX, 3.6, SZ], [A("s3:Channel"), SX + 2.6, 7.2, 13, SX, 4.0, SZ], [A("s3:membaca"), SX - 0.6, 5.4, 13.5, SX + 0.6, 2.7, SZ + 0.8], [K.s4, SX - 1.6, 5.0, 13, SX + 0.7, 2.5, SZ + 0.8]]),
    s4: track([[K.s4, BX + 0.6, 3.2, 6.2, BX, 2.7, BZ], [A("s4:Penerbangan") - 0.2, BX + 0.8, 3.4, 7.0, BX, 2.8, BZ], [A("s4:Delta") + 0.6, BX + 2.2, 5.0, 11, BX, 2.8, BZ - 3.6], [A("s4:Bank"), BX + 1.4, 5.4, 12, BX, 2.8, BZ - 3], [K.s5, BX - 1.6, 5.4, 12, BX, 2.7, BZ - 3]]),
    s5: track([[K.s5, -4.6, 6.0, 15, -3.2, 6.6, -8], [A("s5:ditarik"), -6.2, 6.6, 14.6, -5.4, 7.0, -7], [K.s6, -3.2, 6.2, 17, -2.6, 6.4, -8]]),
    s7: track([[K.s7, GX + 2.6, 8.6, 11.5, GX + 0.6, -0.35, GZ], [A("s7:bandara"), GX + 0.8, 8.6, 12, GX + 0.6, -0.35, GZ], [A("s7:Kerugian"), GX + 3.2, 7.2, 15.5, GX + 1.3, -0.2, GZ], [K.s8, GX + 3.8, 7.0, 16.5, GX + 1.5, -0.1, GZ]]),
    s8: track([[K.s8, 2.6, 6.0, 16.5, 0.3, 6.0, -8], [K.end, 0.4, 5.6, 23, 0, 4.0, -8], [K.dur, 0.2, 5.6, 24, 0, 3.9, -8]]),
  };
  const look = new THREE.Vector3();
  let lastDep = -1, lastKF = "";

  // =================== draw ===================
  return function draw(t) {
    const stn = stationAt(t), sc = ST[stn];
    key.position.set(sc[0] - 14, 18, sc[1] + 12); key.target.position.set(sc[0], 0, sc[1]); key.target.updateMatrixWorld();
    kC.position.set(sc[0] - 6, 4, sc[1] - 2); kR.position.set(sc[0] + 6, 3, sc[1] - 1);

    // ---- wall ----
    for (const w of wall) w.mo.set(wallState(w, t));
    // packet: s1 drops into the wall centre; s2 rides the cable; s5 flies back up
    let pv = false;
    const cen = new THREE.Vector3(0, 1.25 + 4 * PY + MH / 2, -7.6);
    if (t < flip0 + 0.05) { const u = eout(clamp01(t / (flip0 - 0.05))); packet.position.set(0, 13 - (13 - cen.y) * u, cen.z + 1.2 * (1 - u)); packet.rotation.set(0.3 * (1 - u), t * 1.4, 0); packet.scale.setScalar(1.3); pv = true; }
    else if (t >= K.s2 && t < K.s3) {
      const t0 = A("s2:mengirim") - 0.3, t1 = K.s3 + 0.5;
      const u = smooth(clamp01((t - t0) / (t1 - t0)));
      if (t < t0) { packet.position.set(RX, 4.0 + 0.6 * clamp01((t - K.s2) / 1.2), RZ + 1.4); packet.rotation.set(0, -0.35 + 0.12 * Math.sin(t), 0); }
      else { const p = CABLE.getPointAt(u); packet.position.set(p.x, p.y + 0.62, p.z); packet.rotation.set(0, -0.35 + 0.12 * Math.sin(t), 0); }
      packet.scale.setScalar(1.4); pv = true;
      sleeve.visible = t > t0; if (sleeve.visible) sleeve.position.copy(CABLE.getPointAt(u));
    } else if (t >= K.s5 && t < K.s6) {
      const t0 = A("s5:ditarik") - 0.2, u = smooth(clamp01((t - t0) / 2.6));
      const p = CABLE.getPointAt(1 - u); packet.position.set(p.x, p.y + 0.62, p.z); packet.rotation.set(0, -t, 0); packet.scale.setScalar(1); pv = t > t0 - 0.6 && u < 1;
      sleeve.visible = pv; sleeve.position.copy(p);
    } else sleeve.visible = false;
    if (t < K.s2 && t > flip0 + 0.05) sleeve.visible = false;
    packet.visible = pv; pkGlow.intensity = pv ? 6 : 0;

    // ---- rack LEDs ----
    const blink = Math.floor(t * 8);
    for (const l of ledM) { const on = hash(l.s * 97 + blink * (l.hero ? 1.7 : 0.6)) > 0.35; l.m.color.setHex(on ? (l.hero && t > A("s2:mengirim") - 0.3 && t < K.s3 ? 0x00e5ff : 0x2bd77a) : 0x0b3a22); }

    // ---- stack ----
    {
      const ex = smooth(clamp01((t - A("s3:lapisan") + 0.2) / 1.0));
      const crashT = A("s3:crash"), sh = t > crashT ? eout(clamp01((t - crashT) / 0.25)) : 0;
      const shear = [-0.9, 0.7, -0.5];
      SL.forEach((s, i) => { s.position.set(SX + shear[i] * sh * (1 + 0.15 * Math.sin(t * 40 + i)), 1.55 + i * (0.86 + ex * 0.75), SZ); s.rotation.z = shear[i] * 0.06 * sh; });
      kEdge.material.opacity = win(t, A("s3:kernel") - 0.2, K.s4, 0.3, 0.2) * (0.6 + 0.4 * Math.sin(t * 6)) + 0.15;
      falcon.scale.setScalar(1 + 0.12 * win(t, A("s3:kernel"), A("s3:kernel") + 0.8, 0.2, 0.4));
      // file token: hovers above the stack, then slides down the gaps into the kernel
      const fa = A("s3:Channel") - 0.4, fr = A("s3:rusak");
      const vis = t >= fa - 0.3 && t < K.s4;
      fileTok.visible = vis;
      if (vis) {
        const topY = 1.55 + 2 * (0.86 + 0.75) + 1.6, kernY = 1.55 + 0.86 + 0.75 / 2 + 0.4;
        const u1 = eout(clamp01((t - fa + 0.3) / 0.6)), u2 = smooth(clamp01((t - fr - 0.2) / 1.4));
        const y = topY + 2 * (1 - u1) - (topY - kernY) * u2;
        const bad = t >= fr;
        const jit = bad ? (hash(Math.floor(t * 24)) - 0.5) * 0.08 : 0;
        fileTok.position.set(SX + 2.2 - 0.6 * u2 + jit + (t > crashT ? -1.2 * sh : 0), y, SZ + 1.8);
        fileTok.rotation.set(0, -0.25, bad ? 0.08 * Math.sin(t * 30) : 0);
        fileM.map = bad ? fileBad : fileOK;
      }
      const ms = A("s3:membaca") - 0.1, ob = A("s3:luar");
      const pu = t < ms ? 0 : t < ob ? 7 * clamp01((t - ms) / (ob - ms)) : 7 + 2.8 * clamp01((t - ob) / 0.7);
      ptr.position.set(pu * 0.52, 0.42, 0); ptr.visible = t > ms - 0.2 && t < K.s4;
      const ok = win(t, ob - 0.1, K.s4 + 1, 0.2, 0.2);
      outCells.forEach((c, i) => { c.visible = ok > 0.01; c.scale.setScalar(Math.max(0.001, back(clamp01((t - ob + 0.1 - i * 0.08) / 0.3)))); });
      outLab.visible = ok > 0.01; outLab.material.opacity = ok;
    }

    // ---- boot station ----
    {
      const c1 = A("s4:crash");
      let hs = "blue";
      if (t < K.s4 + 0.5) hs = "blue"; else if (t < c1 - 0.05) hs = "boot"; else if (t < c1 + 0.05) hs = "flash"; else if (t > c1 + 0.7 && t < c1 + 1.5) hs = "boot";
      hero.set(hs);
      const lk = win(t, K.s4 + 0.2, A("s4:Penerbangan") + 1.2, 0.4, 0.6);
      loopG.visible = lk > 0.01; loopM.opacity = lk * 0.95;
      loopG.rotation.z = -t * 2.4; const ha = Math.PI * 1.75; loopHead.position.set(Math.cos(ha) * 2.0, Math.sin(ha) * 2.0, 0); loopHead.rotation.z = ha;
      const ct = [A("s4:Penerbangan"), A("s4:Bank"), A("s4:rumah"), A("s4:layanan"), A("s4:AirAsia") - 0.3];
      clus.forEach((cl, i) => {
        const a = ct[i] - 0.4, k = clamp01((t - a) / 0.5);
        cl.mo.G.visible = t > a - 0.05 || t >= K.s5; cl.mo.G.scale.setScalar(Math.max(0.001, back(k, 1.2)));
        cl.mo.set(t < ct[i] + 0.3 ? "clean" : t < ct[i] + 0.38 ? "flash" : "blue");
      });
      depG.visible = t > A("s4:Penerbangan") - 0.6 || t >= K.s5;
      const nk = t < A("s4:Delta") ? 0 : Math.min(DEP.length, 1 + Math.floor((t - A("s4:Delta")) / 0.35));
      if (nk !== lastDep) { lastDep = nk; depM.map = depT[nk]; }
    }

    // ---- fix row ----
    {
      const [tx, mode] = techX(t);
      tech.G.position.x = tx; tech.G.position.z = FZ + 1.15;
      const walking = mode === "walk";
      tech.G.rotation.y = walking ? Math.PI / 2 : Math.PI;
      pose(walking ? tx * 4.2 : t, mode);
      tech.head.rotation.y = walking ? 0 : 0.15 * Math.sin(t * 0.8);
      desks.forEach((d, i) => d.mo.set(deskState(i, t)));
      const ku = smooth(clamp01((t - A("s6:kunci") + 0.2) / (A("s6:digit") - A("s6:kunci") + 0.4)));
      keyStrip.visible = ku > 0.002 && t < K.s7 + 0.5; keyStrip.scale.x = Math.max(0.001, ku); keyTex.repeat.x = Math.max(0.001, ku);
    }

    // ---- grid ----
    {
      const rk = back(clamp01((t - A("s7:kurang") + 0.1) / 0.6), 1.3), p = cpos(BI);
      blueCube.position.set(p[0], p[1] + rk * 1.0, p[2]); blueCube.material.emissiveIntensity = 0.5 + 0.4 * Math.sin(t * 5) * clamp01(rk);
      pctLab.position.set(p[0] + 1.5, p[1] + 1.55, p[2] + 0.4); pctLab.quaternion.copy(cam.quaternion);
      const pk = win(t, A("s7:satu") - 0.1, K.s8, 0.25, 0.3); pctLab.visible = pk > 0.01; pctLab.material.opacity = pk;
      const tb = win(t, A("s7:bandara"), K.s8, 0.25, 0.3), tk = win(t, A("s7:bank"), K.s8, 0.25, 0.3);
      tagB.position.set(p[0] + 1.5, p[1] + 1.0, p[2] + 0.4); tagK.position.set(p[0] + 1.5, p[1] + 0.58, p[2] + 0.4);
      tagB.quaternion.copy(cam.quaternion); tagK.quaternion.copy(cam.quaternion);
      tagB.visible = tb > 0.01; tagB.material.opacity = tb; tagK.visible = tk > 0.01; tagK.material.opacity = tk;
      const gh = 0.05 + 3.0 * eout(clamp01((t - A("s7:sekitar") + 0.3) / 1.6));
      goldCol.scale.y = gh; goldCol.position.y = gh / 2;
      goldLab.position.set(GX + 3.6, gh + 0.6, GZ + 0.9); goldLab.quaternion.copy(cam.quaternion);
      const gk = win(t, A("s7:lima#2") - 0.3, K.s8, 0.3, 0.3); goldLab.visible = gk > 0.01; goldLab.material.opacity = gk;
    }

    // ---- glitch pass ----
    const G = glitchAt(t);
    GU.uSeed.value = G.seed; GU.uSplit.value = G.split; GU.uTear.value = G.tear; GU.uBlock.value = G.block; GU.uMosh.value = G.mosh; GU.uSort.value = G.sort; GU.uLost.value = G.lost;
    glitch.enabled = G.split + G.tear + G.block + G.lost > 0.004;

    // ---- camera ----
    let c;
    if (stn === "fix") { const [tx] = techX(t); const u = clamp01((t - K.s6) / (K.s7 - K.s6)); c = [tx + 1.8 - 0.6 * u, 3.3 + 0.4 * u, FZ + 8.4 - 0.4 * u, tx + 0.4, 2.0, FZ - 0.6]; }
    else c = CAMS[t < K.s2 ? "s1" : t < K.s3 ? "s2" : t < K.s4 ? "s3" : t < K.s5 ? "s4" : t < K.s6 ? "s5" : t < K.s8 ? "s7" : "s8"](t);
    let shx = 0, shy = 0;
    for (const tt of [flip0, A("s3:crash"), A("s4:crash")]) { const d = t - tt; if (d > 0 && d < 0.35) { const a = (1 - d / 0.35) * 0.12; shx += Math.sin(d * 90) * a; shy += Math.cos(d * 77) * a * 0.6; } }
    cam.position.set(c[0] + shx, c[1] + shy, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    fg.position.x = (stn === "rack" || stn === "fix" ? -0.62 : 0.62); fg.visible = t < K.end + 0.3;
    comp.render();
  };
}
