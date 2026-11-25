// EP03 KUNCI GEMBOK (INNERWORKS): a precision pin-tumbler cylinder lock in a dark studio, cut open along its axis.
// Brushed brass plug and key pins, steel housing, driver pins and springs, softbox reflections from a PMREM studio
// environment (environmentIntensity 0.55), teal-orange cinema grade. One connected table world:
// hero key (s1) -> door with the lock face (s2) -> the door lifts away, the cover slides off (s3) -> pins (s4-s6)
// -> a wooden Egyptian lock and a timeline rail with 1848 / 1861 plaques (s7) -> back to the open lock (s8).
// Illustration only: generic key, generic door, a faceless bust with a text plate. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, std, stage, pts, envStrips } from "./lib3d.js";

const MONO = "'Chakra Petch', 'Courier New', monospace", SANS = "'Saira Condensed', 'Arial Narrow', sans-serif";
const TEAL = new THREE.Color(0.25, 1.6, 1.45), ORANGE = new THREE.Color(1.9, 0.95, 0.3), RED = new THREE.Color(2.2, 0.28, 0.2);

// ---- lock geometry (lock frame: plug axis on X, plug centre at the origin, pins vertical) ----
const R = 0.45, PX = [-0.76, -0.38, 0, 0.38, 0.76], REST = -0.2, TOPY = 1.75;
const CUT_OK = [0.05, -0.12, 0.12, -0.05, 0.18], CUT_BAD = [0.2, 0.15, -0.1, 0.2, -0.08];
const KPL = CUT_OK.map((k) => R - k), DPL = [0.42, 0.38, 0.45, 0.4, 0.43];

function profile(c) {
  const P = [[-1.36, -0.27], [-1.14, 0.22], [PX[0] - 0.15, 0.22]];
  c.forEach((k, i) => { P.push([PX[i] - 0.04, k], [PX[i] + 0.04, k]); if (i < c.length - 1) P.push([PX[i] + 0.19, Math.min(0.25, Math.max(k, c[i + 1]) + 0.13)]); });
  P.push([PX[4] + 0.2, 0.25], [1.45, 0.25]);
  return P;
}
function fAt(P, u) {
  if (u < P[0][0]) return null;
  if (u >= P[P.length - 1][0]) return 0.25;
  let i = 0; while (P[i + 1][0] < u) i++;
  const a = P[i], b = P[i + 1];
  return a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0]);
}
const P_OK = profile(CUT_OK), P_BAD = profile(CUT_BAD);

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// CINEMA_TEAL_ORANGE: shadows lean teal, highlights lean warm, gentle S-curve.
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(0.2126,0.7152,0.0722));
  c+=vec3(-0.018,0.03,0.045)*(1.0-smoothstep(0.0,0.45,l));c+=vec3(0.045,0.012,-0.035)*smoothstep(0.3,1.0,l);
  c=mix(vec3(l),c,1.1);c=mix(c,c*c*(3.0-2.0*c),0.22);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function brushed(seed, base = 200) {
  const R0 = mulberry(seed);
  return canvasTex(512, 512, (g, w, h) => { g.fillStyle = `rgb(${base},${base},${base})`; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const v = base - 40 + R0() * 80; g.fillStyle = `rgba(${v},${v},${v},0.5)`; g.fillRect(0, R0() * h, w, 1 + R0() * 1.5); } }, [2, 2]);
}
function rbox(x0, x1, y0, y1, z0, z1, r, mat, parent) {
  const s = new THREE.Shape(), w = x1 - x0, h = y1 - y0;
  s.moveTo(r, 0); s.lineTo(w - r, 0); s.quadraticCurveTo(w, 0, w, r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(r, h); s.quadraticCurveTo(0, h, 0, h - r); s.lineTo(0, r); s.quadraticCurveTo(0, 0, r, 0);
  const b = Math.min(0.03, (z1 - z0) / 4);
  const g = new THREE.ExtrudeGeometry(s, { depth: z1 - z0 - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
  g.translate(x0, y0, z0 + b);
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m;
}
const plane = (w, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; };
function textTex(lines, { w = 512, h = 128, bg = null, color = "#fff", font = `700 60px ${SANS}`, align = "center" } = {}) {
  return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle";
    lines.forEach((ln, i) => { g.font = ln.font || font; g.fillStyle = ln.color || color; g.fillText(ln.t, ln.x ?? w / 2, ln.y ?? h / 2); }); });
}
const glowMat = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c.clone(), toneMapped: false, transparent: true, opacity: op, depthWrite: false });

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x06080b, fog: 0.028, exp: 1.18, bloom: [0.22, 0.45, 0.94] });
  r.toneMapping = THREE.NeutralToneMapping;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  // studio-HDRI-like softbox strips: metals get a real specular streak
  envStrips(r, scene, [[7, 1.3, 0xfff0dc, 3.6, -4, 5.5, 4], [1.1, 6, 0xdff6ff, 2.2, 6.5, 2, -2], [9, 0.7, 0xffffff, 3.2, 0, -2.5, 7], [3, 3, 0xffc58a, 2.4, -6, 1.5, -4], [2, 5, 0x9fefff, 2, -3, 2, -6]], 0x07090c);
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0x6f8f9c, 0x0c0806, 0.22));
  const A = (k) => AT[k];
  const rnd = mulberry(1861);

  // ---- materials ----
  const brushT = brushed(11), brushT2 = brushed(23, 190);
  const brass = std(0xc9963f, 0.3, 1, { roughnessMap: brushT });
  const brassDark = std(0x8a6428, 0.38, 1);
  const steel = std(0xa7b0ba, 0.26, 1, { roughnessMap: brushT2 });
  const darkSteel = std(0x3b424b, 0.4, 0.92, { roughnessMap: brushT2 });
  const nickel = std(0xc4ccd4, 0.22, 1);

  // ---- floor: dark machinist plate with a faint grid; backdrop bokeh ----
  const gridT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#15191d"; g.fillRect(0, 0, w, w); g.strokeStyle = "rgba(120,170,180,.10)"; g.lineWidth = 2; g.strokeRect(0, 0, w, w); g.strokeStyle = "rgba(120,170,180,.05)"; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, w); g.moveTo(0, w / 2); g.lineTo(w, w / 2); g.stroke(); }, [40, 20]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), std(0xffffff, 0.45, 0.6, { map: gridT })); floor.rotation.x = -Math.PI / 2; floor.position.set(-2, -1.75, 2); floor.receiveShadow = true; scene.add(floor);
  const bokeh = pts(scene, 70, { size: 1.1, opacity: 0.32 });
  const bseed = Array.from({ length: 70 }, () => [rnd(), rnd(), rnd(), rnd()]);
  bseed.forEach((s, i) => { const c = s[3] > 0.5 ? [1, 0.62, 0.3] : [0.3, 0.85, 0.9]; bokeh.col.set(c.map((v) => v * (0.5 + 0.5 * s[2])), i * 3); });
  const dust = pts(scene, 160, { color: 0xffe2b8, size: 0.03, opacity: 0.6 });
  const dseed = Array.from({ length: 160 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---- lights ----
  const spot = (c, I, p, tg, ang = 0.5, sh = false) => { const s = new THREE.SpotLight(c, I, 30, ang, 0.6, 2); s.position.set(...p); s.target.position.set(...tg); if (sh) { s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0004; } scene.add(s, s.target); return s; };
  spot(0xffc690, 220, [-3, 5.5, 6.5], [0, 0.4, 0], 0.45, true);
  const lockRim = spot(0x5fe6ff, 380, [3.5, 3, -4.5], [0, 0.6, 0], 0.5);
  spot(0xffe7cc, 160, [5, 1.5, 7], [0.3, 0.3, 0], 0.35);
  const hookKey = spot(0xffc690, 190, [2.6, 3.2, 6.4], [4.4, 0.5, 0], 0.4, true);
  const hookRim = spot(0x5fe6ff, 140, [6.8, 2.4, -3], [4.4, 0.5, 0], 0.3);
  spot(0xffd2a0, 420, [7.5, 5.5, 3.5], [1.4, 0.8, -0.4], 0.5, true);
  spot(0xffb070, 420, [-7.0, 4.5, 7], [-9.0, 0.3, 0], 0.45, true);
  spot(0xffd9a8, 160, [-9.0, 0.6, 8], [-9.0, 0.3, 0], 0.4);
  spot(0x5fe6ff, 220, [-10.7, 3, -4], [-9.2, 0.5, 0], 0.5);
  spot(0xffd2a0, 260, [-4.2, 3.5, 4.5], [-4.3, -1.2, 0.6], 0.55);

  // ================= THE LOCK =================
  const lock = new THREE.Group(); scene.add(lock);
  // housing section face: steel with section hatch, painted cavities, a stamped AUDIRA mark
  const HX0 = -1.35, HX1 = 1.4, HY0 = -0.65, HY1 = 1.85, PPU = 400;
  const hx = (x) => (x - HX0) * PPU, hy = (y) => (HY1 - y) * PPU;
  const cavity = (g, x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, "#050608"); gr.addColorStop(0.5, "#14181c"); gr.addColorStop(1, "#050608"); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
  // machined cut face: polished metal, fine anisotropic streaks, a soft sheen band, chamfered cavity edges, faint engraved hatch
  const machined = (g, w, h, c0, c1, streak, seed) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R3 = mulberry(seed); for (let i = 0; i < 1800; i++) { const y = R3() * h, x = R3() * w * 0.6; g.fillStyle = `rgba(${streak},${0.03 + R3() * 0.07})`; g.fillRect(x, y, w * (0.2 + R3() * 0.6), 1); }
    for (let i = 0; i < 900; i++) { const y = R3() * h; g.fillStyle = `rgba(0,0,0,${R3() * 0.06})`; g.fillRect(R3() * w * 0.5, y, w * (0.2 + R3() * 0.5), 1); }
    const sh = g.createLinearGradient(0, 0, w, h * 0.6); sh.addColorStop(0.3, "rgba(255,255,255,0)"); sh.addColorStop(0.45, "rgba(255,255,255,.16)"); sh.addColorStop(0.6, "rgba(255,255,255,0)"); g.fillStyle = sh; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,.06)"; g.lineWidth = 2; for (let i = -h; i < w; i += 34) { g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
  };
  const bore = (g, x0, y0, x1, y1) => { cavity(g, x0, y0, x1, y1); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 3; g.strokeRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4); g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 2; g.strokeRect(x0 + 1, y0 + 1, x1 - x0 - 2, y1 - y0 - 2); };
  const edge = (g, w, h, c) => { g.strokeStyle = c; g.lineWidth = 7; g.strokeRect(3.5, 3.5, w - 7, h - 7); g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2; g.strokeRect(9, 9, w - 18, h - 18); };
  const houseT = canvasTex(1100, 1000, (g, w, h) => {
    machined(g, w, h, "#b7c0c8", "#6f7881", "255,255,255", 41);
    bore(g, hx(-1.25), hy(R + 0.01), hx(1.4), hy(-R - 0.01));
    PX.forEach((x) => bore(g, hx(x - 0.1), hy(TOPY), hx(x + 0.1), hy(R)));
    edge(g, w, h, "rgba(245,250,255,.85)");
    g.fillStyle = "rgba(40,46,52,.75)"; g.font = `700 44px ${MONO}`; g.textAlign = "right"; g.fillText("AUDIRA", w - 34, 64); g.font = `500 26px ${MONO}`; g.fillText("PIN TUMBLER · 5", w - 34, 98);
  });
  plane(HX1 - HX0, HY1 - HY0, new THREE.MeshStandardMaterial({ map: houseT, roughness: 0.2, metalness: 0.88, roughnessMap: brushT2 }), (HX0 + HX1) / 2, (HY0 + HY1) / 2, -0.02, lock);
  rbox(HX0, HX1, HY0, HY1, -0.55, -0.021, 0.08, steel, lock);
  // front cover (the other half of the housing), slides off in s3
  const cover = new THREE.Group(); lock.add(cover);
  rbox(HX0, HX1, HY0, HY1, -0.021, 0.5, 0.08, steel, cover);
  const coverT = textTex([{ t: "AUDIRA", font: `700 92px ${MONO}`, color: "rgba(30,34,38,.85)" }], { w: 640, h: 160 });
  plane(1.4, 0.35, new THREE.MeshStandardMaterial({ map: coverT, transparent: true, roughness: 0.5, metalness: 0.6 }), 0.1, 1.45, 0.505, cover);
  // stand
  const stand = new THREE.Group(); lock.add(stand);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.1, 24), darkSteel); post.position.set(-0.2, -1.2, -0.28); stand.add(post);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.06, 40), darkSteel); base.position.set(-0.2, -1.72, -0.28); base.receiveShadow = true; stand.add(base);

  // plug group rotates about X
  const plug = new THREE.Group(); lock.add(plug);
  const pc = new THREE.CylinderGeometry(R, R, 2.64, 48, 1, false, Math.PI / 2, Math.PI); pc.rotateZ(-Math.PI / 2); pc.translate(0.07, 0, 0);
  const plugBack = new THREE.Mesh(pc, brass); plugBack.castShadow = true; plug.add(plugBack);
  const PL0 = -1.25, PL1 = 1.39;
  const px2 = (x) => (x - PL0) * PPU, py2 = (y) => (R - y) * PPU;
  const plugT = canvasTex(1056, 360, (g, w, h) => {
    machined(g, w, h, "#f0c878", "#a87a34", "255,240,200", 77);
    bore(g, 0, py2(0.27), w, py2(-0.34));
    PX.forEach((x) => bore(g, px2(x - 0.095), 0, px2(x + 0.095), py2(0.27)));
    edge(g, w, h, "rgba(255,240,200,.9)");
  });
  const plugFaceM = new THREE.MeshStandardMaterial({ map: plugT, roughness: 0.2, metalness: 0.88, roughnessMap: brushT, emissive: new THREE.Color(0x3fe0d0), emissiveIntensity: 0 });
  plane(PL1 - PL0, 2 * R, plugFaceM, (PL0 + PL1) / 2, 0, -0.012, plug);
  // tailpiece into the latch case
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.34), brassDark); tail.position.set(-1.42, 0, 0); plug.add(tail);
  // plug outline highlight (s3)
  const outM = glowMat(TEAL, 0);
  const outline = new THREE.Group(); plug.add(outline);
  [[PL1 - PL0, 0.018, (PL0 + PL1) / 2, R], [PL1 - PL0, 0.018, (PL0 + PL1) / 2, -R], [0.018, 2 * R, PL0, 0], [0.018, 2 * R, PL1, 0]].forEach(([w, h, x, y]) => plane(w, h, outM, x, y, 0.01, outline));
  const kwM = glowMat(ORANGE, 0);
  plane(PL1 - PL0, 0.014, kwM, (PL0 + PL1) / 2, 0.27, 0.0, plug); plane(PL1 - PL0, 0.014, kwM, (PL0 + PL1) / 2, -0.34, 0.0, plug);

  // pins
  const lathe = (p) => new THREE.LatheGeometry(p.map(([a, b]) => new THREE.Vector2(a, b)), 28);
  const keyPins = KPL.map((L, i) => {
    const m = new THREE.Mesh(lathe([[0.001, 0], [0.035, 0.004], [0.07, 0.03], [0.085, 0.06], [0.085, L - 0.012], [0.074, L], [0.001, L]]), std(0xd6a24a, 0.28, 1, { roughnessMap: brushT, emissive: new THREE.Color(0x3fe0d0), emissiveIntensity: 0 }));
    m.castShadow = true; m.position.set(PX[i], REST, 0); plug.add(m); return m;
  });
  const drivers = DPL.map((L, i) => { const m = new THREE.Mesh(lathe([[0.001, 0], [0.074, 0], [0.085, 0.012], [0.085, L - 0.012], [0.074, L], [0.001, L]]), nickel); m.castShadow = true; m.position.set(PX[i], R, 0); lock.add(m); return m; });
  const helix = []; for (let i = 0; i <= 360; i++) { const a = (i / 360) * 9 * 2 * Math.PI; helix.push(new THREE.Vector3(0.066 * Math.cos(a), i / 360, 0.066 * Math.sin(a))); }
  const springG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 540, 0.012, 6);
  const springs = PX.map((x) => { const m = new THREE.Mesh(springG, std(0xb9c2ca, 0.3, 1)); m.position.set(x, 1, 0); lock.add(m); return m; });
  // shear line + per-chamber markers
  const shearM = glowMat(TEAL, 0);
  plane(PL1 - PL0 + 0.1, 0.016, shearM, (PL0 + PL1) / 2, R, 0.1, lock);
  const marks = PX.map((x) => { const m = plane(0.3, 0.035, glowMat(RED, 0), x, R, 0.11, lock); return m; });
  // pin numbers and length brackets (s4)
  const numM = [];
  PX.forEach((x, i) => { const mm = new THREE.MeshBasicMaterial({ map: textTex([{ t: String(i + 1), font: `700 96px ${MONO}`, color: "#8ff5ea" }], { w: 128, h: 128, bg: "rgba(4,10,12,.88)" }), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }); numM.push(mm); plane(0.17, 0.17, mm, x, 1.55, 0.13, lock); });
  const brM = glowMat(TEAL, 0);
  const brackets = PX.map((x) => { const m = plane(0.018, 1, brM, x + 0.135, 0, 0.09, plug); return m; });
  // rotation arrow around the plug face
  const arrow = new THREE.Group(); arrow.position.set(1.66, 0, 0); lock.add(arrow);
  const arM = glowMat(ORANGE, 0);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.028, 10, 64, 4.4), arM); arc.rotation.y = Math.PI / 2; arrow.add(arc);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 16), arM); arrow.add(head);
  { const a = 4.4; head.position.set(0, 0.72 * Math.sin(a), 0.72 * Math.cos(a) * -1); }
  // latch case + bolt (the bolt follows the plug angle)
  rbox(-2.45, -1.47, -0.75, 0.75, -0.5, 0.3, 0.06, darkSteel, lock);
  const latch = rbox(-2.25, -1.67, -0.22, 0.22, 0.3, 0.98, 0.05, brass, lock);
  const latchHome = latch.position.clone();
  const klikM = glowMat(ORANGE, 0);
  const klik = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 40), klikM); klik.position.set(-1.96, 0, 1.0); lock.add(klik);

  // ================= KEYS =================
  function makeKey(P, mat, glow, engrave) {
    const G = new THREE.Group();
    const s = new THREE.Shape(); s.moveTo(1.5, -0.32); s.lineTo(-1.3, -0.32); s.lineTo(-1.36, -0.29);
    for (const [u, y] of P) s.lineTo(u, y);
    s.lineTo(1.5, 0.25); s.lineTo(1.5, -0.32);
    const bg = new THREE.ExtrudeGeometry(s, { depth: 0.054, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 2 }); bg.translate(0, 0, -0.035);
    const blade = new THREE.Mesh(bg, mat); blade.castShadow = true; G.add(blade);
    const groove = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.012), std(0x000000, 0.6, 0.5, { color: mat.color.clone().multiplyScalar(0.55) })); groove.position.set(0.1, -0.12, 0.034); G.add(groove);
    const b = new THREE.Shape(), x0 = 1.45, x1 = 2.75, y0 = -0.6, y1 = 0.6, rr = 0.3;
    b.moveTo(x0 + rr, y0); b.lineTo(x1 - rr, y0); b.quadraticCurveTo(x1, y0, x1, y0 + rr); b.lineTo(x1, y1 - rr); b.quadraticCurveTo(x1, y1, x1 - rr, y1); b.lineTo(x0 + rr, y1); b.quadraticCurveTo(x0, y1, x0, y1 - rr); b.lineTo(x0, y0 + rr); b.quadraticCurveTo(x0, y0, x0 + rr, y0);
    const hole = new THREE.Path(); hole.absarc(2.5, 0, 0.12, 0, Math.PI * 2, true); b.holes.push(hole);
    const bowG = new THREE.ExtrudeGeometry(b, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3, curveSegments: 10 }); bowG.translate(0, 0, -0.035);
    const bow = new THREE.Mesh(bowG, mat); bow.castShadow = true; G.add(bow);
    if (engrave) {
      const et = textTex([{ t: "AUDIRA", font: `700 84px ${MONO}`, color: "rgba(60,36,8,.92)" }], { w: 512, h: 128 });
      plane(0.78, 0.195, new THREE.MeshStandardMaterial({ map: et, transparent: true, roughness: 0.6, metalness: 0.4 }), 1.97, 0.02, 0.062, G);
      const et2 = textTex([{ t: "EP 03 · PIN 5", font: `600 54px ${MONO}`, color: "rgba(60,36,8,.75)" }], { w: 512, h: 96 });
      plane(0.7, 0.13, new THREE.MeshStandardMaterial({ map: et2, transparent: true, roughness: 0.6, metalness: 0.4 }), 1.97, -0.3, 0.062, G);
    }
    // glowing bitting profile along the top edge
    const path = new THREE.CurvePath();
    for (let i = 1; i < P.length - 1; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(P[i][0], P[i][1] + 0.004, 0.05), new THREE.Vector3(P[i + 1][0], P[i + 1][1] + 0.004, 0.05)));
    const gm = glowMat(glow, 0.9);
    const gl = new THREE.Mesh(new THREE.TubeGeometry(path, 260, 0.011, 6), gm); G.add(gl);
    return { G, gm };
  }
  const keyOk = makeKey(P_OK, brass, ORANGE, true); scene.add(keyOk.G);
  const keyBad = makeKey(P_BAD, std(0x9aa2aa, 0.34, 1), RED, false); scene.add(keyBad.G);
  // HUD code ticks on the hero key (s1)
  const tickM = glowMat(TEAL, 0.7);
  const tickNum = [];
  CUT_OK.forEach((k, i) => {
    const hgt = 0.62 - k; plane(0.012, hgt, tickM, PX[i], k + hgt / 2, 0.06, keyOk.G);
    const d = Math.round((0.25 - k) / 0.05);
    const mm = new THREE.MeshBasicMaterial({ map: textTex([{ t: String(d), font: `700 100px ${MONO}`, color: "#9ff8ee" }], { w: 128, h: 128 }), transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false });
    tickNum.push(mm); plane(0.2, 0.2, mm, PX[i], 0.74, 0.06, keyOk.G);
  });
  plane(1.75, 0.01, tickM, 0, 0.62, 0.06, keyOk.G);

  // ================= DOOR (s2) =================
  const door = new THREE.Group(); scene.add(door);
  const doorT = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = "#173840"; g.fillRect(0, 0, w, h);
    const R1 = mulberry(5); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(0,0,0,${R1() * 0.06})`; g.fillRect(R1() * w, 0, 2, h); }
    const panel = (x, y, pw, ph) => { g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 10; g.strokeRect(x, y, pw, ph); g.strokeStyle = "rgba(140,200,205,.18)"; g.lineWidth = 3; g.strokeRect(x + 8, y + 8, pw - 16, ph - 16); };
    panel(60, 60, w - 120, 380); panel(60, 560, w - 120, 400);
  });
  const doorPlain = std(0x173840, 0.55, 0.1);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.95, 4.6), [std(0xffffff, 0.5, 0.1, { map: doorT }), doorPlain, doorPlain, doorPlain, doorPlain, doorPlain]);
  slab.position.set(0.42, 2.225, -0.4); slab.castShadow = slab.receiveShadow = true; door.add(slab);
  const frameM = std(0x0f2328, 0.5, 0.15);
  [[0.4, 8.4, 0.35, -2.88], [0.4, 8.4, 0.35, 2.08]].forEach(([w, h, d, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, h, d), frameM); m.position.set(0.42, 2.45, z); door.add(m); });
  { const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 5.3), frameM); m.position.set(0.42, 6.4, -0.4); door.add(m); }
  // lock face on the door
  const faceT = canvasTex(512, 512, (g, w) => {
    const c = w / 2; const gr = g.createRadialGradient(c * 0.8, c * 0.7, 10, c, c, c); gr.addColorStop(0, "#f2cf86"); gr.addColorStop(1, "#9a6e2c"); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.75, 0, 7); g.fill();
    g.strokeStyle = "rgba(70,45,10,.6)"; g.lineWidth = 6; g.beginPath(); g.arc(c, c, c * 0.75, 0, 7); g.stroke();
    g.fillStyle = "#07080a"; g.beginPath(); g.roundRect(c - 18, c - 120, 36, 210, 12); g.fill(); g.beginPath(); g.arc(c, c - 120, 30, 0, 7); g.fill();
    g.fillStyle = "rgba(50,30,6,.85)"; g.font = `700 40px ${MONO}`; g.textAlign = "center"; g.fillText("AUDIRA", c, c + 150);
  });
  const face = plane(1.3, 1.3, new THREE.MeshStandardMaterial({ map: faceT, transparent: true, roughness: 0.32, metalness: 0.85 }), 1.437, 0, 0, door); face.rotation.y = Math.PI / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.06, 16, 64), steel); ring.rotation.y = Math.PI / 2; ring.position.set(1.44, 0, 0); door.add(ring);
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.08, 40), steel); rose.rotation.z = Math.PI / 2; rose.position.set(1.47, 1.55, 0); door.add(rose);
  const lever = rbox(-0.05, 0.12, -0.06, 0.06, -0.06, 1.1, 0.03, steel, door); lever.position.set(1.5, 1.55, -0.08);
  // faceless bust with a name plate: Linus Yale Jr.
  const bust = new THREE.Group(); bust.position.set(3.6, -0.75, -1.75); bust.rotation.y = Math.PI / 2 - 0.35; scene.add(bust);
  const bronze = std(0x3a2a1c, 0.42, 0.85);
  rbox(-0.32, 0.32, 0, 0.62, -0.32, 0.32, 0.03, std(0x1a1d21, 0.4, 0.5), bust);
  rbox(-0.24, 0.24, -1.0, 0.0, -0.24, 0.24, 0.02, std(0x14171a, 0.5, 0.4), bust);
  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.34, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), bronze); shoulders.scale.set(1.25, 0.62, 0.7); shoulders.position.y = 0.62; bust.add(shoulders);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.18, 20), bronze); neck.position.y = 0.88; bust.add(neck);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.15, 28, 20), bronze); hd.scale.set(0.9, 1.15, 1); hd.position.y = 1.1; bust.add(hd);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), bronze); beard.scale.set(1, 0.9, 0.8); beard.position.set(0, 0.99, 0.05); bust.add(beard);
  const plateT = textTex([{ t: "LINUS YALE JR.", font: `700 50px ${MONO}`, color: "#f1d79a", y: 50 }, { t: "PENYEMPURNA KUNCI PIN TUMBLER", font: `500 24px ${MONO}`, color: "#b9c6cc", y: 98 }], { w: 512, h: 128, bg: "#14181c" });
  plane(0.62, 0.155, new THREE.MeshStandardMaterial({ map: plateT, roughness: 0.4, metalness: 0.3 }), 0, 0.36, 0.326, bust);

  // ================= WOODEN EGYPTIAN LOCK (s7) =================
  const egy = new THREE.Group(); egy.position.x = -1.2; scene.add(egy);
  const woodT = (seed, base) => canvasTex(512, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const R2 = mulberry(seed); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(40,20,6,${0.08 + R2() * 0.18})`; g.lineWidth = 1 + R2() * 3; g.beginPath(); const y = R2() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4); g.stroke(); } });
  const wood = std(0xffffff, 0.72, 0, { map: woodT(3, "#8a5a32") }), woodD = std(0xffffff, 0.75, 0, { map: woodT(9, "#5c3a1e") }), woodL = std(0xffffff, 0.7, 0, { map: woodT(15, "#a77446") });
  const planks = plane(3.9, 4.8, std(0xffffff, 0.8, 0, { map: canvasTex(512, 640, (g, w, h) => { g.fillStyle = "#3f2814"; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#4a3018" : "#432a15"; g.fillRect(i * 102 + 3, 0, 98, h); } }) }), -8, 0.65, -0.42, egy);
  planks.receiveShadow = true;
  rbox(-9.95, -9.3, -0.42, 0.62, -0.4, 0.36, 0.04, woodD, egy); // jamb receiver
  const bolt = new THREE.Group(); egy.add(bolt);
  rbox(-9.5, -6.6, 0.25, 0.35, -0.2, 0.2, 0.02, wood, bolt);
  rbox(-9.5, -6.6, -0.15, -0.05, -0.2, 0.2, 0.02, wood, bolt);
  rbox(-9.5, -6.6, -0.05, 0.25, -0.2, -0.1, 0.02, woodD, bolt);
  const EPX = [-8.3, -8.0, -7.7];
  EPX.forEach((x) => { const h0 = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), std(0x120a04, 0.9)); h0.rotation.x = -Math.PI / 2; h0.position.set(x, 0.352, 0.08); bolt.add(h0); });
  rbox(-8.55, -7.45, 0.36, 1.45, -0.32, 0.02, 0.04, woodL, egy); // staple above the bolt
  rbox(-8.55, -7.45, -0.62, -0.16, -0.32, 0.02, 0.04, woodL, egy);
  const ePins = EPX.map((x) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.72, 18), woodD); m.castShadow = true; egy.add(m); m.userData.x = x; return m; });
  const ekey = new THREE.Group(); egy.add(ekey);
  rbox(-8.6, -5.0, -0.04, 0.06, -0.05, 0.05, 0.015, woodL, ekey);
  rbox(-5.2, -4.7, -0.18, 0.2, -0.08, 0.08, 0.04, woodL, ekey);
  EPX.forEach((x) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.17, 14), woodL); m.position.set(x, 0.14, 0); ekey.add(m); });
  // brass year plaques on a timeline rail
  function plaque(lines, x, z, w = 1.25, lift = 0) {
    const G = new THREE.Group(); G.position.set(x, -1.75 + lift, z); scene.add(G);
    if (lift) rbox(-0.3, 0.3, -lift, 0, -0.18, 0.18, 0.02, darkSteel, G);
    rbox(-w / 2 - 0.05, w / 2 + 0.05, 0, 0.08, -0.25, 0.25, 0.03, darkSteel, G);
    const tx = textTex(lines, { w: 640, h: 300, bg: "#b9883a" });
    const pl = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.47, 0.05), [brass, brass, brass, brass, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.32, metalness: 0.75 }), brass]);
    pl.position.set(0, 0.42, 0); pl.rotation.x = -0.32; pl.castShadow = true; G.add(pl);
    return G;
  }
  plaque([{ t: "± 2000 SM", font: `800 120px ${SANS}`, color: "#2b1a06", y: 115 }, { t: "MESIR · KUNCI KAYU", font: `700 50px ${MONO}`, color: "#3a2408", y: 225 }], -10.95, 1.0, 1.0, 0.75);
  plaque([{ t: "1848", font: `800 150px ${SANS}`, color: "#2b1a06", y: 120 }, { t: "LINUS YALE SR.", font: `700 52px ${MONO}`, color: "#3a2408", y: 235 }], -4.35, 1.0, 1.05);
  plaque([{ t: "1861", font: `800 150px ${SANS}`, color: "#2b1a06", y: 120 }, { t: "LINUS YALE JR.", font: `700 52px ${MONO}`, color: "#3a2408", y: 235 }], -2.75, 1.0, 1.05);
  const railM = glowMat(TEAL, 0);
  plane(10, 0.035, railM, -4.3, -1.744, 1.75, scene).rotation.x = -Math.PI / 2;

  // ================= CAMERA =================
  const camT = track([
    [0, 5.1, 0.9, 9.4, 4.72, 0.8, 0],
    [K.s1e, 4.95, 0.9, 8.7, 4.7, 0.8, 0],
    [K.s2 + 0.9, 10.6, 1.9, 3.2, 1.4, 1.15, -0.5],
    [A("s2:Linus"), 10.1, 1.6, 2.4, 1.8, 0.75, -0.8],
    [K.s2e, 9.9, 1.5, 2.6, 1.7, 0.75, -0.7],
    [K.s3 + 1.6, 5.7, 2.0, 7.3, 0.0, 0.55, 0],
    [K.s3e, 6.2, 2.4, 6.6, 0.1, 0.5, 0],
    [K.s4 + 0.9, 1.4, -0.3, 10.6, 0.25, 0.75, 0],
    [K.s4e, -0.9, -0.2, 10.3, -0.2, 0.78, 0],
    [K.s5 + 1.0, 3.6, 1.4, 12.4, 0.75, 0.6, 0],
    [K.s5e, 3.2, 1.3, 12.0, 0.75, 0.6, 0],
    [K.s6 + 0.5, 2.2, -0.35, 6.4, 0.45, 0.45, 0],
    [A("s6:Semua") + 0.4, -1.4, -0.25, 6.6, -0.1, 0.5, 0],
    [A("s6:berputar"), 1.3, 6.8, 10.2, 0.9, 0.3, 0],
    [K.s6e, -3.2, 2.4, 10.5, 0.2, 0.35, 0],
    [K.s7 + 1.9, -8.8, 1.3, 11.6, -8.9, 0.75, 0],
    [A("s7:Linus") - 0.1, -8.5, 1.3, 11.0, -8.7, 0.75, 0],
    [A("s7:Linus") + 2.0, -3.95, 0.3, 6.6, -4.35, -1.3, 1.0],
    [A("s7:anaknya"), -4.25, 0.25, 6.3, -4.35, -1.32, 1.0],
    [A("s7:anaknya") + 2.2, -2.35, 0.3, 6.6, -2.75, -1.3, 1.0],
    [K.s7e, -2.6, 0.25, 6.3, -2.75, -1.32, 1.0],
    [K.s8 + 1.5, -5.4, 5.6, 9.6, 0.45, 0.2, 0],
    [K.end, -4.6, 5.9, 10.2, 0.45, 0.2, 0],
    [K.dur, -4.5, 6.0, 10.3, 0.45, 0.2, 0],
  ]);
  const look = new THREE.Vector3();
  const bump = (t, a, d) => { const u = (t - a) / d; return u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0; };
  const lerp = (a, b, u) => a + (b - a) * u;

  return (t) => {
    const [px, py, pz, tx, ty, tz] = camT(t);
    cam.position.set(px, py, pz); look.set(tx, ty, tz); cam.lookAt(look);

    // ---- door lifts away, bust sinks, cover slides off ----
    const dOff = ramp(t, K.s3 - 0.05, K.s3 + 1.25);
    door.position.y = 9.5 * dOff; door.visible = dOff < 0.999;
    const bOff = ramp(t, K.s3, K.s3 + 1.2); bust.visible = false; // dropped: the s2 panel names Linus Yale Jr.
    const cOff = ramp(t, A("s3:silinder") - 0.4, A("s3:silinder") + 0.75);
    cover.position.set(0.2 * cOff, 4.6 * cOff, 1.6 * cOff); cover.rotation.x = -0.25 * cOff; cover.visible = cOff < 0.999;

    // ---- correct (brass) key ----
    const kg = keyOk.G;
    let okDx = 9, okY = 0, okVis = true;
    if (t < K.s3) {
      const fly = ramp(t, K.s2 - 0.15, K.s2 + 0.95);
      kg.position.set(4.35 + 0.6 * fly, 0.42 + 6.2 * fly * fly, 0.0);
      kg.rotation.set(0.12 * Math.sin(t * 0.7), 0.18 * Math.sin(t * 0.45) - 0.12, 1.0 + 0.04 * Math.sin(t * 0.6) + 0.9 * fly);
      okVis = fly < 0.999;
    } else if (t < K.s6 - 0.95) okVis = false;
    else {
      const rise = ramp(t, K.s6 - 0.95, K.s6 + 0.15);
      const ins = ramp(t, A("s6:kunci") - 0.1, A("s6:ketinggian") + 0.25);
      okDx = lerp(4.6, 2.9, rise) - 2.9 * ins; okY = lerp(-2.7, 0, rise);
      kg.position.set(okDx, okY, 0);
    }
    kg.visible = okVis;

    // ---- wrong (silver) key ----
    const wg = keyBad.G;
    const wa = A("s5:Kalau") - 0.55;
    const wRise = ramp(t, wa, A("s5:Kalau") + 0.05), wIns = ramp(t, A("s5:Kalau") + 0.05, A("s5:salah") + 0.25);
    const wOut = ramp(t, K.s5e - 0.15, K.s5e + 0.3), wUp = ramp(t, K.s5e + 0.25, K.s6 + 0.25);
    const bDx = lerp(4.6, 2.9, wRise) - 2.9 * wIns + 2.9 * wOut + 1.7 * wUp, bY = lerp(3.4, 0, wRise) + 3.4 * wUp;
    wg.visible = t > wa - 0.02 && t < K.s6 + 0.3;
    wg.position.set(bDx, bY, 0); wg.rotation.set(0, 0, 0);

    // ---- plug angle: blocked tries in s5, opens in s6, turns back and forth in s8 ----
    let th = 0.055 * (bump(t, A("s5:tidak"), 0.3) + bump(t, A("s5:tidak") + 0.38, 0.3) + bump(t, A("s5:tetap"), 0.3) + bump(t, A("s5:tetap") + 0.38, 0.3));
    th += 1.0 * ramp(t, A("s6:berputar") - 0.25, A("s6:berputar") + 0.5) * (1 - ramp(t, K.s7 + 2.6, K.s7 + 3.6));
    if (t > K.s8) th += 1.0 * (0.5 - 0.5 * Math.cos(2 * Math.PI * Math.max(0, t - K.s8 - 0.4) / 3.6));
    plug.rotation.x = th;
    lockRim.intensity = t < K.s4 ? 0 : 130 * ramp(t, K.s4, K.s4 + 0.8); hookRim.intensity = t < K.s2 + 1 ? 140 : 0;
    if (okVis && okY === 0 && okDx < 0.02) kg.rotation.set(th, 0, 0); else if (t >= K.s3) kg.rotation.set(0, 0, 0);
    latch.position.z = latchHome.z - 0.52 * clamp01(th / 0.9);
    const kl = bump(t, A("s6:Klik") - 0.1, 0.5) + (t > K.s8 ? 0.6 * Math.max(0, Math.sin(2 * Math.PI * Math.max(0, t - K.s8 - 0.4) / 3.6 - 1.2)) ** 6 : 0);
    klikM.opacity = kl; klik.scale.setScalar(1 + 1.4 * (1 - kl)); klik.lookAt(cam.position);

    // ---- pins ride the key profiles ----
    const push = 0.24 * bump(t, A("s4:didorong") - 0.1, 1.0);
    const glowStart = A("s6:gerigi");
    PX.forEach((x, i) => {
      let b = REST;
      if (okVis && Math.abs(okY) < 1e-6) { const f = fAt(P_OK, x - okDx); if (f !== null) b = Math.max(b, f); }
      if (wg.visible && Math.abs(bY) < 1e-6) { const f = fAt(P_BAD, x - bDx); if (f !== null) b = Math.max(b, f); }
      b += push;
      keyPins[i].position.y = b;
      const top = b + KPL[i];
      const dTop = top;
      drivers[i].position.y = dTop;
      const sTop = dTop + DPL[i];
      springs[i].position.y = sTop; springs[i].scale.y = Math.max(0.05, TOPY - sTop);
      // highlights
      const gl = ramp(t, glowStart + i * 0.42, glowStart + i * 0.42 + 0.25) * (1 - ramp(t, K.s7 + 1, K.s7 + 2)) + (t > K.s8 ? 0.7 : 0);
      keyPins[i].material.emissiveIntensity = 0.9 * gl;
      const mis = Math.abs(top - R) > 0.025;
      const redOn = ramp(t, A("s5:menahan") - 0.2, A("s5:menahan") + 0.2) * (1 - ramp(t, K.s6 + 0.3, K.s6 + 0.7));
      const tealOn = ramp(t, A("s6:sejajar") - 0.2, A("s6:sejajar") + 0.2) * (1 - ramp(t, K.s7 + 1, K.s7 + 2)) + (t > K.s8 + 0.5 ? 1 : 0);
      const mm = marks[i].material;
      if (mis) { mm.color.copy(RED); mm.opacity = redOn * (0.75 + 0.25 * Math.sin(t * 14)); }
      else { mm.color.copy(TEAL); mm.opacity = Math.min(1, tealOn); }
      brackets[i].scale.y = KPL[i]; brackets[i].position.y = b + KPL[i] / 2;
    });
    shearM.opacity = Math.min(1, ramp(t, A("s6:garis") - 0.3, A("s6:garis") + 0.2) * (1 - ramp(t, K.s7 + 1, K.s7 + 2)) + (t > K.s8 + 0.5 ? 0.85 : 0)) + 0.25 * ramp(t, A("s5:menahan") - 0.2, A("s5:menahan")) * (1 - ramp(t, K.s6, K.s6 + 0.4));
    shearM.color.copy(t < K.s6 ? RED : TEAL);
    const nOn = ramp(t, A("s4:deretan") - 0.2, A("s4:deretan") + 0.3) * (1 - ramp(t, K.s5 - 0.3, K.s5 + 0.2));
    numM.forEach((m, i) => { m.opacity = nOn * (0.5 + 0.5 * ramp(t, A("s4:lima") + i * 0.12, A("s4:lima") + i * 0.12 + 0.2)); });
    brM.opacity = ramp(t, A("s4:panjang") - 0.2, A("s4:panjang") + 0.3) * (1 - ramp(t, K.s5 - 0.3, K.s5 + 0.2));
    // plug highlight + keyway glow (s3)
    const pOn = ramp(t, A("s3:plug") - 0.2, A("s3:plug") + 0.3) * (1 - ramp(t, K.s4 + 0.4, K.s4 + 1.1));
    outM.opacity = pOn * (0.75 + 0.25 * Math.sin(t * 5)); plugFaceM.emissiveIntensity = 0.12 * pOn;
    kwM.opacity = ramp(t, A("s3:tempat") - 0.1, A("s3:tempat") + 0.3) * (1 - ramp(t, A("s3:Plug") - 0.1, A("s3:Plug") + 0.4));
    // rotation arrow
    const arOn = ramp(t, A("s3:berputar") - 0.25, A("s3:berputar") + 0.15) * (1 - ramp(t, K.s4 - 0.2, K.s4 + 0.4)) + ramp(t, A("s6:berputar") - 0.4, A("s6:berputar")) * (1 - ramp(t, K.s6e - 0.2, K.s6e + 0.4));
    arM.opacity = arOn; arrow.rotation.x = -0.5 + 0.5 * eoutm(t, A("s3:berputar") - 0.25, 0.8) + th * 0.6;
    arM.color.copy(ORANGE).multiplyScalar(1 + 0.3 * Math.sin(t * 6));
    // key glow + HUD ticks
    keyOk.gm.color.copy(ORANGE).multiplyScalar(t < K.s2 ? 0.8 + 0.25 * Math.sin(t * 3.2) : t > K.s8 ? 0.8 : 0.6);
    keyBad.gm.opacity = 0.75;
    const tOn = 1 - ramp(t, K.s2 - 0.5, K.s2);
    tickM.opacity = 0.65 * tOn;
    tickNum.forEach((m, i) => { m.opacity = tOn * (0.55 + 0.45 * ramp(t, A("s1:lekuknya") + i * 0.12, A("s1:lekuknya") + i * 0.12 + 0.2)); });

    // ---- wooden lock ----
    const eIn = ramp(t, A("s7:berupa") - 0.2, A("s7:kayu") + 0.2), eLift = ramp(t, A("s7:dengan") - 0.1, A("s7:baut") + 0.1), eSl = ramp(t, A("s7:geser") - 0.05, A("s7:geser") + 0.6);
    bolt.position.x = 0.75 * eSl;
    ekey.position.set(1.7 * (1 - eIn) + 0.75 * eSl, 0.17 * eLift, 0.02);
    ePins.forEach((m) => { m.position.set(m.userData.x, 0.1 + 0.29 * eLift + 0.36, 0.12); });
    railM.opacity = 0.8 * ramp(t, K.s7 + 0.5, K.s7 + 2) * (1 - ramp(t, K.s8 + 0.5, K.s8 + 1.5));

    // ---- bokeh + dust ----
    bseed.forEach((s, i) => { bokeh.pos[i * 3] = -14 + s[0] * 24 + Math.sin(t * 0.1 + i) * 0.3; bokeh.pos[i * 3 + 1] = -0.5 + s[1] * 6 + Math.sin(t * 0.13 + i * 2) * 0.2; bokeh.pos[i * 3 + 2] = -9 - s[2] * 7; });
    bokeh.commit();
    dseed.forEach((s, i) => { const u = (s[0] + t * 0.01 * (0.4 + s[3])) % 1; dust.pos[i * 3] = tx - 2.5 + s[1] * 5 + Math.sin(t * 0.3 + i) * 0.1; dust.pos[i * 3 + 1] = -1.5 + u * 4.5; dust.pos[i * 3 + 2] = -1 + s[2] * 4 + Math.cos(t * 0.2 + i) * 0.1; });
    dust.commit();
    comp.render();
  };
}
function eoutm(t, a, d) { const x = clamp01((t - a) / d); return 1 - Math.pow(1 - x, 3); }
