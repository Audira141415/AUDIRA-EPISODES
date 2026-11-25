// EP24 GARIS DEFOGGER (KINTSUGI). A glazed-porcelain hatchback with gold kintsugi seams on a tatami studio floor. Its
// rear window is obsidian glass whose defogger lines are liquid-gold seams: they fog over, collect dew, then carry
// current, heat orange and clear the glass.
//   CAR   x=0   rear window (fog, frost, dew, current pulses, heat shimmer), floating rear-view mirror (s2/s6),
//               defrost button pod (s5), timer dial (s6), scraper + cloth (s8), AUDIRA plate
//   LAB   x=30  porcelain plinth: ceramic + silver bowls, a glass slab printed by a squeegee, kiln glow, lines fuse to gold
//   STAGE x=60  150 W gold disc stack ~ headlamp, a generic porcelain inventor figure with a fan of 50 patent tablets
// Generic products only. Every value is a pure function of t (seeded randomness only).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage, pts } from "./lib3d.js";

const P = {
  porc: "#F7F7F9", porcS: "#E7E2D8", obs: "#141417", gold: "#E5A93C", goldE: "#FFD56B", tatami: "#EFE9DC", tatD: "#C9BC9F",
  warm: "#302B27", heat: "#FF6A2B", silver: "#C9CCD2", ice: "#EAF3F8", amber: "#FFB547",
};
const SERIF = "Georgia, 'Times New Roman', serif";
const CX = 0, LX = 30, SX = 60;

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Clean studio grade: warm lift in the shadows, cream highlights, gold flash on station cuts.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c+=vec3(0.03,0.02,0.008)*(1.0-l);c=mix(vec3(l),c,1.06);c=(c-0.5)*1.06+0.5;
  c=mix(c,vec3(1.0,0.86,0.52),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function rrect(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function slab(w, h, d, r, mat, parent, x, y, z) { const g = new THREE.ExtrudeGeometry(rrect(w, h, r), { depth: d * 0.6, bevelEnabled: true, bevelSize: Math.min(r * 0.5, d * 0.2), bevelThickness: d * 0.2, bevelSegments: 3, curveSegments: 12 }); g.translate(0, 0, -d * 0.3); return mesh(g, mat, parent, x, y, z); }
function textTex(lines, { w = 1024, h = 256, font = `700 120px ${SERIF}`, color = P.gold, bg = null } = {}) {
  return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } g.fillStyle = color; g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
    const L = [].concat(lines); L.forEach((s, i) => g.fillText(s, w / 2, h / 2 + (i - (L.length - 1) / 2) * h / (L.length + 0.4))); });
}
function print(tex, w, h, parent, x, y, z, emi = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, metalness: 0.3, depthWrite: false, emissive: new THREE.Color(emi ? P.goldE : 0), emissiveMap: emi ? tex : null, emissiveIntensity: emi }));
  m.position.set(x, y, z); m.renderOrder = 3; if (parent) parent.add(m); return m;
}
// Gold kintsugi crack network: colour map (porcelain + gold) and emissive map (gold only).
function crackTex(seed, emissive) {
  const R = mulberry(seed);
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = emissive ? "#000" : P.porc; g.fillRect(0, 0, w, h);
    if (!emissive) for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(160,150,135,${0.02 + R() * 0.03})`; g.beginPath(); g.arc(R() * w, R() * h, 20 + R() * 80, 0, 6.29); g.fill(); }
    g.lineCap = "round"; g.lineJoin = "round";
    const crack = (x, y, a, len, wd, depth) => {
      g.strokeStyle = emissive ? "#ffd56b" : P.gold; g.lineWidth = wd; g.beginPath(); g.moveTo(x, y);
      for (let i = 0; i < len; i++) { a += (R() - 0.5) * 0.7; x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y);
        if (depth < 2 && R() < 0.07) { g.stroke(); crack(x, y, a + (R() < 0.5 ? 0.9 : -0.9), len * 0.5 | 0, wd * 0.6, depth + 1); g.strokeStyle = emissive ? "#ffd56b" : P.gold; g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); } }
      g.stroke();
    };
    for (let i = 0; i < 5; i++) crack(R() * w, R() * h, R() * 6.28, 40 + (R() * 30 | 0), 5 + R() * 3, 0);
  }, [1, 1]);
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x3a322b, fog: 0.035, exp: 0.82, bloom: [0.34, 0.45, 0.82] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.82;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  { // studio softbox environment so gold and glaze reflect real highlights
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x4a4038);
    for (const [w, h, c, i, x, y, z] of [[8, 3, 0xfff3df, 2.2, -4, 5, 3], [3, 6, 0xffffff, 1.6, 5, 2, 2], [10, 2, 0xd8c39e, 0.7, 0, -3, 0], [4, 4, 0xffd9a0, 1.0, 0, 3, -6]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.25;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

  // ---------- materials ----------
  const crackA = crackTex(24, false), crackE = crackTex(24, true);
  const porcBody = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: crackA, emissive: new THREE.Color(P.goldE), emissiveMap: crackE, emissiveIntensity: 0.28, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  crackA.repeat.set(0.45, 0.45); crackE.repeat.set(0.45, 0.45);
  const porc = new THREE.MeshPhysicalMaterial({ color: P.porc, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const porcS = new THREE.MeshPhysicalMaterial({ color: P.porcS, roughness: 0.6, clearcoat: 0.4 });
  const gold = new THREE.MeshStandardMaterial({ color: P.gold, metalness: 0.92, roughness: 0.24, emissive: new THREE.Color(P.goldE), emissiveIntensity: 0.22 });
  const obs = new THREE.MeshPhysicalMaterial({ color: P.obs, roughness: 0.06, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.04 });
  const obsGlass = new THREE.MeshPhysicalMaterial({ color: 0x1b1c22, roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.94, side: THREE.DoubleSide });

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b5a48, 0.75));
  const key = new THREE.DirectionalLight(0xfff0dc, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 40 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0xcfe0ff, 1.6), fill = new THREE.DirectionalLight(0xffe2c0, 0.7);
  scene.add(key, key.target, rim, rim.target, fill, fill.target);
  const glowL = new THREE.PointLight(0xffc066, 0, 4, 1.6); scene.add(glowL);

  // ---------- floor: tatami weave ----------
  const tat = canvasTex(512, 512, (g, w, h) => { g.fillStyle = P.tatami; g.fillRect(0, 0, w, h); const R = mulberry(5);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(150,130,95,${0.08 + R() * 0.1})`; g.fillRect(0, y, w, 2); }
    g.fillStyle = "rgba(90,70,50,.35)"; g.fillRect(0, 0, w, 10); g.fillRect(0, h / 2, w, 6); }, [24, 24]);
  const floor = mesh(new THREE.PlaneGeometry(200, 60), new THREE.MeshStandardMaterial({ map: tat, roughness: 0.85 }), scene, 30, 0, -10);
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  for (const x of [CX, LX, SX]) { // warm backdrop wall per station
    const wall = mesh(new THREE.PlaneGeometry(26, 12), new THREE.MeshStandardMaterial({ color: 0x8a7760, roughness: 0.9 }), scene, x, 6, -9); wall.castShadow = false;
    const band = mesh(new THREE.PlaneGeometry(26, 0.08), gold, scene, x, 2.4, -8.98); band.castShadow = false;
  }

  // =============== CAR ===============
  const CAR = new THREE.Group(); scene.add(CAR); CAR.position.x = CX;
  { const s = new THREE.Shape(); [[0, 0.32], [0, 0.92], [0.08, 0.98], [0.52, 1.45], [2.5, 1.52], [3.25, 1.02], [4.0, 0.86], [4.08, 0.32]].forEach(([u, v], i) => (i ? s.lineTo(u, v) : s.moveTo(u, v))); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 5, curveSegments: 8 });
    g.rotateY(Math.PI / 2); g.translate(-0.85, 0, 0); mesh(g, porcBody, CAR); }
  for (const [x, z] of [[-0.92, -0.75], [0.92, -0.75], [-0.92, -3.3], [0.92, -3.3]]) {
    const wh = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32), obs, CAR, x, 0.34, z); wh.rotation.z = Math.PI / 2;
    const hub = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.26, 24), gold, CAR, x, 0.34, z); hub.rotation.z = Math.PI / 2;
  }
  for (const sx of [-1, 1]) { const tl = slab(0.32, 0.12, 0.04, 0.05, new THREE.MeshStandardMaterial({ color: 0xb8322a, emissive: 0xff4a32, emissiveIntensity: 0.6, roughness: 0.3 }), CAR, sx * 0.66, 0.84, 0.1); }
  const plate = slab(0.62, 0.17, 0.03, 0.03, porc, CAR, 0, 0.6, 0.1);
  print(textTex("AUDIRA", { font: `700 150px ${SERIF}` }), 0.58, 0.15, CAR, 0, 0.6, 0.127, 0.5);
  mesh(new THREE.BoxGeometry(0.66, 0.012, 0.012), gold, CAR, 0, 0.51, 0.11);

  // rear window: group in the slanted plane, local x across, y up the slope, z out of the glass
  const WIN = new THREE.Group(); CAR.add(WIN); WIN.position.set(0, 1.28, -0.23); WIN.rotation.x = -0.752;
  const WC = new THREE.Vector3(0, 1.28, -0.23);
  slab(1.5, 0.56, 0.012, 0.06, obsGlass, WIN, 0, 0, 0);
  const NL = 12, LY = (i) => -0.22 + i * 0.04;
  const lineM = [], lines = [];
  for (let i = 0; i < NL; i++) { const m = gold.clone(); lineM.push(m); lines.push(mesh(new THREE.BoxGeometry(1.3, 0.011, 0.004), m, WIN, 0, LY(i), 0.011)); }
  const brk = 5; // the line that gets scratched in s8: split into two halves + a bridge
  lines[brk].visible = false;
  const brA = mesh(new THREE.BoxGeometry(0.77, 0.011, 0.004), lineM[brk], WIN, -0.265, LY(brk), 0.011);
  const brB = mesh(new THREE.BoxGeometry(0.47, 0.011, 0.004), lineM[brk], WIN, 0.415, LY(brk), 0.011);
  const brC = mesh(new THREE.BoxGeometry(0.06, 0.011, 0.004), lineM[brk], WIN, 0.15, LY(brk), 0.011);
  for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(0.035, 0.5, 0.005), gold, WIN, sx * 0.67, 0, 0.011);
  // fog and frost layers
  const fogT = canvasTex(512, 256, (g, w, h) => { const R = mulberry(31); g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = R() * w, y = R() * h, rr = 6 + R() * 30, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(255,255,255,${0.25 + R() * 0.4})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); } });
  const fogM = new THREE.MeshStandardMaterial({ color: 0xe9eef2, map: fogT, transparent: true, opacity: 0, roughness: 0.9, depthWrite: false });
  const fogP = mesh(new THREE.PlaneGeometry(1.46, 0.52), fogM, WIN, 0, 0, 0.016); fogP.castShadow = false; fogP.renderOrder = 4;
  const frT = canvasTex(1024, 384, (g, w, h) => { const R = mulberry(77); g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.9)"; g.lineCap = "round";
    const den = (x, y, a, l, d) => { if (d > 3 || l < 4) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = 3.2 - d * 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      for (let k = 1; k < 4; k++) { const f = k / 4; den(x + (x2 - x) * f, y + (y2 - y) * f, a + (R() < 0.5 ? 1 : -1) * (0.9 + R() * 0.3), l * 0.38, d + 1); } den(x2, y2, a + (R() - 0.5) * 0.4, l * 0.6, d + 1); };
    for (let i = 0; i < 26; i++) { const x = R() * w, y = R() * h; for (let k = 0; k < 6; k++) den(x, y, k * 1.047 + R() * 0.2, 30 + R() * 40, 0); } });
  const frM = new THREE.MeshBasicMaterial({ color: 0xffffff, map: frT, transparent: true, opacity: 0, depthWrite: false });
  const frP = mesh(new THREE.PlaneGeometry(1.46, 0.52), frM, WIN, 0, 0, 0.019); frP.castShadow = false; frP.renderOrder = 5;
  // dew drops
  const ND = 240, dR = mulberry(9), dew = [];
  for (let i = 0; i < ND; i++) dew.push([(dR() - 0.5) * 1.42, (dR() - 0.5) * 0.5, 0.004 + dR() * 0.011, dR()]);
  const dewM = new THREE.MeshPhysicalMaterial({ color: 0xdfeaf1, roughness: 0.04, transmission: 0.0, clearcoat: 1, transparent: true, opacity: 0.88, emissive: 0x7f99aa, emissiveIntensity: 0.15 });
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), dewM, ND); drops.frustumCulled = false; WIN.add(drops);
  // vapour (s3), current pulses (s5/s6), heat shimmer (s5/s6), scratch chips (s8)
  const vap = pts(scene, 110, { color: 0xdbe9f3, size: 0.03, add: false, opacity: 0.85 }); WIN.add(vap.P);
  const cur = pts(scene, NL * 6, { color: 0xfff1b8, size: 0.035 }); WIN.add(cur.P);
  const sh = pts(scene, 90, { color: 0xff8a3a, size: 0.05 }); WIN.add(sh.P);
  const chips = pts(scene, 14, { color: 0xffd56b, size: 0.02 }); WIN.add(chips.P);
  const vR = mulberry(41), vapD = Array.from({ length: 110 }, () => [(vR() - 0.5) * 1.4, (vR() - 0.5) * 0.5, 0.15 + vR() * 0.45, vR(), 0.5 + vR() * 0.7]);
  const sR = mulberry(43), shD = Array.from({ length: 90 }, () => [(sR() - 0.5) * 1.3, (sR() * NL) | 0, sR(), 0.6 + sR() * 0.6]);

  // floating rear-view mirror (s2, s6): its face shows the road through the rear window, fogged when the glass is
  const MIR = new THREE.Group(); CAR.add(MIR); MIR.position.set(-0.72, 1.62, 1.75); MIR.rotation.y = 0.32;
  slab(0.62, 0.2, 0.06, 0.07, obs, MIR, 0, 0, 0);
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 12), porc, MIR, 0, 0.22, -0.03);
  mesh(new THREE.SphereGeometry(0.04, 16, 12), gold, MIR, 0, 0.34, -0.03);
  const view = canvasTex(620, 200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f6d9a8"); gr.addColorStop(0.55, "#d9b98a"); gr.addColorStop(0.56, "#6a625a"); gr.addColorStop(1, "#3d3833"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#f3eee4"; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.5, h * 0.56); g.lineTo(w * 0.32, h); g.moveTo(w * 0.5, h * 0.56); g.lineTo(w * 0.68, h); g.stroke();
    g.fillStyle = "#3b2f28"; g.fillRect(w * 0.46, h * 0.5, w * 0.08, h * 0.08); g.strokeStyle = "rgba(229,169,60,.55)"; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(20, 30 + i * 26); g.lineTo(w - 20, 30 + i * 26); g.stroke(); } });
  mesh(new THREE.PlaneGeometry(0.56, 0.16), new THREE.MeshBasicMaterial({ map: view }), MIR, 0, 0, 0.033);
  const mFogM = new THREE.MeshBasicMaterial({ color: 0xeef2f4, map: fogT, transparent: true, opacity: 0, depthWrite: false });
  mesh(new THREE.PlaneGeometry(0.56, 0.16), mFogM, MIR, 0, 0, 0.035).renderOrder = 4;

  // defrost button pod (s5)
  const BTN = new THREE.Group(); CAR.add(BTN); BTN.position.set(-0.62, 1.5, 1.55); BTN.rotation.set(-0.25, 0.25, 0);
  slab(0.34, 0.22, 0.08, 0.06, porc, BTN, 0, 0, 0);
  const cap = slab(0.24, 0.14, 0.05, 0.04, obs, BTN, 0, 0, 0.06);
  const icon = canvasTex(256, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = P.gold; g.lineWidth = 10; g.lineJoin = "round"; g.beginPath(); g.moveTo(40, 120); g.lineTo(216, 120); g.lineTo(196, 40); g.lineTo(60, 40); g.closePath(); g.stroke();
    for (const x of [92, 128, 164]) { g.beginPath(); g.moveTo(x, 104); g.bezierCurveTo(x - 12, 88, x + 12, 72, x, 56); g.stroke(); } });
  const iconM = print(icon, 0.2, 0.125, cap, 0, 0, 0.03, 0.4);
  const led = mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), new THREE.MeshStandardMaterial({ color: 0x5a4020, emissive: new THREE.Color(P.amber), emissiveIntensity: 0 }), BTN, 0, -0.085, 0.07);

  // timer dial (s6)
  const DIAL = new THREE.Group(); CAR.add(DIAL); DIAL.position.set(0.95, 1.95, 1.0); DIAL.rotation.y = -0.3;
  mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 48), porc, DIAL).rotation.x = Math.PI / 2;
  const arcM = new THREE.MeshStandardMaterial({ color: P.gold, metalness: 0.85, roughness: 0.25, emissive: new THREE.Color(P.goldE), emissiveIntensity: 0.6, side: THREE.DoubleSide });
  const arc = mesh(new THREE.RingGeometry(0.2, 0.26, 64, 1, 0, 0.01), arcM, DIAL, 0, 0, 0.035);
  const hand = mesh(new THREE.BoxGeometry(0.014, 0.18, 0.01), obs, DIAL, 0, 0, 0.045); hand.geometry.translate(0, 0.08, 0);
  print(textTex(["10–15", "menit"], { w: 512, h: 256, font: `700 92px ${SERIF}`, color: "#3b2f28" }), 0.3, 0.15, DIAL, 0, -0.02, 0.036);

  // scraper and cloth (s8)
  const SCR = new THREE.Group(); WIN.add(SCR);
  slab(0.16, 0.05, 0.02, 0.02, porc, SCR, 0, 0.04, 0.03); mesh(new THREE.BoxGeometry(0.15, 0.008, 0.012), gold, SCR, 0, 0.012, 0.03);
  const clothT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 6) { g.fillStyle = "rgba(120,100,70,.12)"; g.fillRect(i, 0, 2, h); g.fillRect(0, i, w, 2); } });
  const clothG = new THREE.PlaneGeometry(0.34, 0.24, 16, 12); { const p = clothG.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.012 * Math.sin(p.getX(i) * 40) + 0.006 * Math.cos(p.getY(i) * 50)); clothG.computeVertexNormals(); }
  const CL = mesh(clothG, new THREE.MeshStandardMaterial({ map: clothT, roughness: 0.95, side: THREE.DoubleSide }), WIN, 0, 0, 0.04);

  // =============== LAB ===============
  const LAB = new THREE.Group(); scene.add(LAB); LAB.position.x = LX;
  slab(3.4, 2.2, 0.8, 0.12, porcBody, LAB, 0, 0.4, 0).rotation.x = -Math.PI / 2; // plinth (top at y 0.8)
  const glass = slab(2.4, 1.1, 0.04, 0.05, obs, LAB, 0, 0.84, 0.1); glass.rotation.x = -Math.PI / 2;
  print(textTex("AUDIRA", { font: `700 120px ${SERIF}` }), 0.42, 0.1, LAB, 0.95, 0.865, 0.6, 0.4).rotation.x = -Math.PI / 2;
  const NLL = 12, LZ = (i) => -0.34 + i * 0.062;
  const labM = [], labL = [];
  for (let i = 0; i < NLL; i++) { const m = new THREE.MeshStandardMaterial({ color: P.silver, roughness: 0.8, metalness: 0.2, emissive: new THREE.Color(P.goldE), emissiveIntensity: 0 }); labM.push(m); labL.push(mesh(new THREE.BoxGeometry(2.0, 0.006, 0.016), m, LAB, 0, 0.866, LZ(i) + 0.1)); }
  const labBus = [-1, 1].map((sx) => mesh(new THREE.BoxGeometry(0.05, 0.007, 0.78), gold, LAB, sx * 1.02, 0.867, 0.1));
  const SQ = new THREE.Group(); LAB.add(SQ);
  slab(2.3, 0.1, 0.06, 0.03, porc, SQ, 0, 0.16, 0); mesh(new THREE.BoxGeometry(2.24, 0.06, 0.012), gold, SQ, 0, 0.08, 0);
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 12), porcS, SQ, 0, 0.36, 0);
  const bowls = [[-0.9, P.porc, 0xf3efe6], [-0.3, P.porcS, 0xc9ccd2]].map(([x, c, pc], i) => { const G = new THREE.Group(); LAB.add(G); G.position.set(x, 0.8, -0.85);
    const b = mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.45, clearcoat: 0.7, side: THREE.DoubleSide }), G, 0, 0.2, 0);
    mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 48), gold, G, 0, 0.2, 0).rotation.x = Math.PI / 2;
    const pile = mesh(new THREE.SphereGeometry(0.17, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: pc, roughness: i ? 0.35 : 0.9, metalness: i ? 0.8 : 0 }), G, 0, 0.12, 0); pile.scale.y = 0.45;
    print(textTex(i ? "PERAK" : "KERAMIK", { w: 512, h: 128, font: `700 76px ${SERIF}`, color: "#3b2f28" }), 0.36, 0.09, G, 0, 0.04, 0.215); return G; });
  const kiln = mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), LAB, 0, 0.815, 0.1); kiln.rotation.x = -Math.PI / 2;
  const kilnL = new THREE.PointLight(0xff7a30, 0, 5, 1.5); kilnL.position.set(0, 1.3, 0.1); LAB.add(kilnL);

  // =============== STAGE ===============
  const ST = new THREE.Group(); scene.add(ST); ST.position.x = SX;
  slab(2.2, 1.4, 0.24, 0.1, porcBody, ST, 0, 0.12, 0).rotation.x = -Math.PI / 2;
  const discs = Array.from({ length: 6 }, (_, i) => mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 48), gold, ST, -0.6, 0.3 + i * 0.12, 0));
  const lab150 = print(textTex("±150 W", { w: 1024, h: 256, font: `700 170px ${SERIF}` }), 0.9, 0.22, ST, -0.6, 1.36, 0.05, 0.6);
  const LAMP = new THREE.Group(); ST.add(LAMP); LAMP.position.set(0.62, 0.62, 0);
  slab(0.62, 0.38, 0.3, 0.12, porc, LAMP, 0, 0, -0.05);
  const lens = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 40), new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff1c8, emissiveIntensity: 0 }), LAMP, -0.12, 0, 0.13); lens.rotation.x = Math.PI / 2;
  const lens2 = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 40), lens.material, LAMP, 0.16, 0, 0.13); lens2.rotation.x = Math.PI / 2;
  const beam = mesh(new THREE.ConeGeometry(0.5, 1.6, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), LAMP, 0, 0, 0.95); beam.rotation.x = -Math.PI / 2; beam.castShadow = false;
  const approx = print(textTex("≈", { w: 256, h: 256, font: `700 220px ${SERIF}` }), 0.3, 0.3, ST, 0.02, 0.95, 0.2, 0.6);
  // inventor: generic porcelain figure with gold seams, on its own plinth to the right
  const FIG = new THREE.Group(); ST.add(FIG); FIG.position.set(3.0, 0.3, -0.1);
  slab(1.0, 1.0, 0.3, 0.08, porc, FIG, 0, -0.15, 0).rotation.x = -Math.PI / 2;
  const cap2 = (r2, l, m, p, x, y, z) => mesh(new THREE.CapsuleGeometry(r2, l, 6, 14), m, p, x, y, z);
  const legs = [-1, 1].map((sx) => { const hip = new THREE.Group(); hip.position.set(sx * 0.1, 0.95, 0); FIG.add(hip); cap2(0.075, 0.34, porc, hip, 0, -0.22, 0);
    const knee = new THREE.Group(); knee.position.set(0, -0.46, 0); hip.add(knee); cap2(0.065, 0.34, porc, knee, 0, -0.22, 0); mesh(new THREE.BoxGeometry(0.12, 0.06, 0.24), obs, knee, 0, -0.46, 0.05); return { hip, knee }; });
  mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.16, 24), porcS, FIG, 0, 0.98, 0);
  mesh(new THREE.CylinderGeometry(0.27, 0.17, 0.56, 28), porc, FIG, 0, 1.33, 0);
  mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 40), gold, FIG, 0, 1.1, 0).rotation.x = Math.PI / 2;
  const seam = mesh(new THREE.BoxGeometry(0.012, 0.5, 0.02), gold, FIG, 0.05, 1.35, 0.21); seam.rotation.z = 0.5;
  mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 16), porc, FIG, 0, 1.66, 0);
  const head = mesh(new THREE.SphereGeometry(0.14, 32, 20), porc, FIG, 0, 1.83, 0); head.scale.y = 1.12;
  mesh(new THREE.TorusGeometry(0.135, 0.008, 6, 40, Math.PI), gold, head, 0, 0.02, 0).rotation.y = 0.4;
  const arms = [-1, 1].map((sx) => { const sh2 = new THREE.Group(); sh2.position.set(sx * 0.29, 1.55, 0); FIG.add(sh2); cap2(0.055, 0.26, porc, sh2, 0, -0.17, 0);
    const el = new THREE.Group(); el.position.set(0, -0.34, 0); sh2.add(el); cap2(0.05, 0.24, porc, el, 0, -0.15, 0); mesh(new THREE.SphereGeometry(0.06, 16, 12), porcS, el, 0, -0.32, 0); return { sh: sh2, el }; });
  const tabs = Array.from({ length: 50 }, (_, i) => { const a = -1.2 + (2.4 * i) / 49, rr = 1.05 + (i % 2) * 0.16; const m = slab(0.11, 0.15, 0.015, 0.02, i % 7 === 0 ? gold : porc, FIG, Math.sin(a) * rr, 1.55 + Math.cos(a) * rr * 0.75, -0.45 - (i % 2) * 0.05); m.rotation.z = -a * 0.6; return m; });

  // ---------- camera ----------
  const kk = (t, ox, p, l) => [t, p[0] + ox, p[1], p[2], l[0] + ox, l[1], l[2]];
  const W = [WC.x, WC.y, WC.z];
  const C1 = track([ // hook macro on the glowing seams -> pull back to the car rear -> mirror in FG -> macro on dew
    kk(0, CX, [0.3, 2.05, 2.25], W),
    kk(A("s1:mobil"), CX, [0.45, 2.1, 2.7], W),
    kk(A("s1:pemanas"), CX, [1.3, 2.2, 4.7], [0, 1.05, -0.4]),
    kk(K.s1e, CX, [1.6, 2.15, 5.4], [0, 1.0, -0.5]),
    kk(A("s2:embun"), CX, [0.9, 1.95, 4.4], [-0.2, 1.3, -0.1]),
    kk(A("s2:spion"), CX, [0.25, 1.85, 3.9], [-0.55, 1.5, 1.0]),
    kk(K.s2e, CX, [0.2, 1.9, 3.7], [-0.45, 1.45, 0.9]),
    kk(A("s3:dingin"), CX, [0.5, 2.05, 1.95], [0.05, 1.28, -0.25]),
    kk(A("s3:menempel"), CX, [0.35, 1.95, 1.55], [0.1, 1.28, -0.22]),
    kk(K.s4 + 0.02, CX, [0.2, 1.9, 1.3], [0.1, 1.27, -0.22]),
  ]);
  const C2 = track([ // lab: bowls -> squeegee pass -> kiln -> top view of the parallel lines
    kk(K.s4, LX, [-0.4, 1.75, 2.6], [-0.6, 0.95, -0.6]),
    kk(A("s4:perak"), LX, [-0.2, 1.7, 2.4], [-0.55, 0.95, -0.7]),
    kk(A("s4:dicetak"), LX, [0.9, 2.3, 3.4], [0, 0.85, 0.0]),
    kk(A("s4:dipanggang"), LX, [1.2, 2.6, 3.6], [0, 0.85, 0.1]),
    kk(A("s4:sejajar"), LX, [0.3, 4.2, 2.6], [0, 0.85, 0.05]),
    kk(K.s5 + 0.02, LX, [0.1, 4.4, 2.4], [0, 0.85, 0.05]),
  ]);
  const C3 = track([ // car: button in FG -> whole window as current flows -> macro on a heating line -> pull out with timer dial
    kk(K.s5, CX, [-0.15, 2.0, 3.2], [-0.35, 1.45, 0.4]),
    kk(A("s5:tombolnya") + 0.3, CX, [-0.3, 1.85, 2.55], [-0.55, 1.5, 1.4]),
    kk(A("s5:mengalir"), CX, [0.5, 2.1, 3.3], W),
    kk(A("s5:Hambatan"), CX, [0.35, 1.75, 1.55], [0.15, 1.3, -0.22]),
    kk(K.s5e, CX, [0.3, 1.8, 1.45], [0.15, 1.3, -0.22]),
    kk(A("s6:menguap"), CX, [0.7, 2.1, 3.0], W),
    kk(A("s6:sepuluh"), CX, [1.0, 2.15, 3.6], [0.45, 1.6, 0.3]),
    kk(K.s7 + 0.02, CX, [1.1, 2.2, 3.9], [0.45, 1.6, 0.2]),
  ]);
  const C4 = track([ // stage: watt stack ~ headlamp -> truck to the inventor and his patents
    kk(K.s7, SX, [-0.1, 1.35, 4.6], [0, 0.9, 0]),
    kk(A("s7:lampu"), SX, [0.1, 1.3, 4.2], [0.02, 0.9, 0]),
    kk(A("s7:Heinz") - 0.3, SX, [2.2, 1.6, 5.0], [2.7, 1.25, -0.2]),
    kk(A("s7:paten"), SX, [2.9, 1.7, 5.4], [3.0, 1.45, -0.3]),
    kk(K.s8 + 0.02, SX, [3.0, 1.7, 5.6], [3.0, 1.45, -0.3]),
  ]);
  const C5 = track([ // car: scratch macro -> gentle wipe -> pull back to the whole car and its AUDIRA plate
    kk(K.s8, CX, [0.45, 1.95, 1.7], [0.15, 1.27, -0.22]),
    kk(A("s8:tergores") + 0.5, CX, [0.4, 1.9, 1.5], [0.15, 1.27, -0.22]),
    kk(A("s8:lembut"), CX, [0.6, 2.1, 2.9], W),
    kk(A("s8:AUDIRA"), CX, [2.6, 2.1, 6.4], [0, 0.95, -1.0]),
    kk(K.dur, CX, [3.2, 2.3, 7.4], [0, 0.95, -1.2]),
  ]);
  const camAt = (t) => (t < K.s4 ? C1(t) : t < K.s5 ? C2(t) : t < K.s7 ? C3(t) : t < K.s8 ? C4(t) : C5(t));
  const stX = (t) => (t >= K.s4 && t < K.s5 ? LX : t >= K.s7 && t < K.s8 ? SX : CX);
  const cuts = [K.s4, K.s5, K.s7, K.s8];
  const look = new THREE.Vector3(), o3 = new THREE.Object3D();
  const cA = new THREE.Color(P.goldE), cH = new THREE.Color(P.heat), cS = new THREE.Color(P.silver), cG = new THREE.Color(P.gold), tmpC = new THREE.Color();

  return (t) => {
    const c = camAt(t);
    cam.position.set(c[0] + 0.02 * Math.sin(t * 0.37), c[1] + 0.015 * Math.sin(t * 0.53 + 1), c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    let fl = 0; for (const k of cuts) { const d = t - k; if (d > -0.12 && d < 0.35) fl = Math.max(fl, d < 0 ? (d + 0.12) / 0.12 : 1 - d / 0.35); }
    gradeP.uniforms.flash.value = 0.55 * fl * fl;
    const sx = stX(t);
    key.position.set(sx - 5, 9, 8); key.target.position.set(sx, 0.8, -0.5);
    rim.position.set(sx + 4, 6, -8); rim.target.position.set(sx, 1, 0);
    fill.position.set(sx + 7, 3, 9); fill.target.position.set(sx, 1.2, 0);
    CAR.visible = sx === CX; LAB.visible = sx === LX; ST.visible = sx === SX;

    if (CAR.visible) {
      const s6 = t >= K.s6, s8 = t >= K.s8;
      const fog = s8 ? 0 : t < K.s2 ? 0 : !s6 ? ramp(t, A("s2:embun") - 0.3, A("s2:embun") + 1.2) : 1 - ramp(t, A("s6:menghangat"), A("s6:menguap") + 0.6);
      const frost = s8 ? 0 : t < K.s2 ? 0 : !s6 ? ramp(t, A("s2:es") - 0.2, A("s2:es") + 1.0) : 1 - ramp(t, A("s6:es"), A("s6:mencair") + 0.6);
      const dw = s8 || t < K.s3 ? 0 : !s6 ? ramp(t, A("s3:menempel") - 0.3, A("s3:buram")) : 1 - ramp(t, A("s6:menghangat") + 0.3, A("s6:menguap") + 0.8);
      fogM.opacity = 0.82 * fog * (1 - 0.35 * dw); frM.opacity = 0.9 * frost; mFogM.opacity = 0.92 * Math.max(fog, frost * 0.8);
      // current and heat
      const on = t >= K.s5 && t < K.s7 ? ramp(t, A("s5:tombolnya") - 0.1, A("s5:tombolnya") + 0.25) * (1 - ramp(t, A("s6:mati"), A("s6:mati") + 0.8)) : 0;
      const flow = on * (t < K.s6 ? ramp(t, A("s5:arus") - 0.2, A("s5:mengalir") + 0.4) : 1);
      const heat = t < K.s5 ? 0 : t < K.s7 ? ramp(t, A("s5:mengubah") - 0.2, A("s5:panas") + 0.3) * (1 - 0.8 * ramp(t, A("s6:mati"), A("s6:hangat") + 0.5)) : 0;
      const hook = t < K.s2 ? 0.55 + 0.45 * ramp(t, A("s1:pemanas") - 0.3, A("s1:pemanas") + 0.4) : s8 ? 0.35 : 0.12;
      const glow = Math.max(hook, flow * 0.6, heat);
      const broken = s8 ? ramp(t, A("s8:tergores") + 0.25, A("s8:tergores") + 0.45) : 0;
      lineM.forEach((m, i) => { const sweep = t < K.s2 ? ramp(t, A("s1:dicetak") - 0.2 + i * 0.06, A("s1:dicetak") + 0.2 + i * 0.06) : 1;
        tmpC.copy(cA).lerp(cH, heat); m.emissive.copy(tmpC); m.emissiveIntensity = 0.25 + 1.5 * glow * (0.75 + 0.25 * sweep) + (i === brk ? -0.2 * broken : 0); });
      brC.scale.x = Math.max(0.001, 1 - broken);
      glowL.position.set(WC.x, WC.y + 0.2, WC.z + 0.5); glowL.color.copy(tmpC.copy(cA).lerp(cH, heat)); glowL.intensity = 1.2 * glow;
      // dew
      dew.forEach((d, i) => { const g2 = clamp01(dw * 1.4 - d[3] * 0.4); const sc = d[2] * g2 + 0.00001; o3.position.set(d[0], d[1], 0.012); o3.rotation.set(0, 0, 0); o3.scale.set(sc, sc * 1.1, sc * 0.45); o3.updateMatrix(); drops.setMatrixAt(i, o3.matrix); });
      drops.instanceMatrix.needsUpdate = true;
      // vapour drifting onto the glass
      const va = t >= K.s3 && t < K.s4 ? win(t, A("s3:Uap") - 0.4, K.s3e - 0.2, 0.5) : 0;
      vapD.forEach((d, i) => { const u = (t * 0.35 * d[4] + d[3]) % 1; vap.pos[i * 3] = d[0] + 0.05 * Math.sin(t + i); vap.pos[i * 3 + 1] = d[1] + 0.04 * Math.sin(t * 0.7 + i); vap.pos[i * 3 + 2] = 0.02 + d[2] * (1 - u); });
      vap.m.opacity = 0.85 * va; vap.commit();
      // current pulses from the left busbar to the right
      for (let i = 0; i < NL; i++) for (let j = 0; j < 6; j++) { const k = i * 6 + j, u = (t * 0.5 + j / 6 + i * 0.137) % 1; cur.pos[k * 3] = -0.66 + 1.32 * u; cur.pos[k * 3 + 1] = LY(i); cur.pos[k * 3 + 2] = 0.02; }
      cur.m.opacity = flow; cur.commit();
      shD.forEach((d, i) => { const u = (t * 0.4 * d[3] + d[2]) % 1; sh.pos[i * 3] = d[0] + 0.02 * Math.sin(t * 3 + i); sh.pos[i * 3 + 1] = LY(d[1]) + 0.05 * u; sh.pos[i * 3 + 2] = 0.02 + 0.22 * u; });
      sh.m.opacity = 0.75 * heat; sh.commit();
      // mirror (s2 + s6 only), button (s5), dial (s6)
      MIR.visible = (t >= K.s2 && t < K.s3) || (t >= K.s6 && t < K.s7);
      MIR.scale.setScalar(Math.max(0.001, t < K.s3 ? back(ramp(t, A("s2:Tugasnya") - 0.3, A("s2:Tugasnya") + 0.3)) : back(ramp(t, A("s6:pandangan") - 0.4, A("s6:pandangan")))));
      MIR.position.y = 1.62 + 0.02 * Math.sin(t * 1.2);
      BTN.visible = t >= K.s5 && t < K.s6;
      const press = win(t, A("s5:tombolnya"), A("s5:tombolnya") + 0.25, 0.12);
      cap.position.z = 0.06 - 0.03 * press; led.material.emissiveIntensity = 2.2 * on; iconM.material.emissiveIntensity = 0.3 + 1.2 * on;
      DIAL.visible = t >= K.s6 && t < K.s7;
      DIAL.scale.setScalar(Math.max(0.001, back(ramp(t, A("s6:Biasanya") - 0.3, A("s6:Biasanya") + 0.3))));
      const fillA = ramp(t, A("s6:sepuluh") - 0.1, A("s6:menit") + 0.2) * Math.PI * 2 * 0.92;
      arc.geometry.dispose(); arc.geometry = new THREE.RingGeometry(0.2, 0.26, 64, 1, Math.PI / 2 - fillA, Math.max(0.01, fillA));
      hand.rotation.z = -fillA;
      // scratch and wipe (s8)
      SCR.visible = s8 && t < A("s8:tergores") + 1.4;
      const sp = ramp(t, A("s8:tergores") - 0.3, A("s8:tergores") + 0.9);
      SCR.position.set(0.15 + 0.04 * Math.sin(sp * 6), LY(brk) + 0.12 - 0.2 * sp, 0.0); SCR.rotation.z = 0.5;
      const ch = s8 ? win(t, A("s8:tergores") + 0.25, A("s8:tergores") + 1.2, 0.3) : 0;
      for (let i = 0; i < 14; i++) { const u = clamp01((t - A("s8:tergores") - 0.25) * 1.3); chips.pos[i * 3] = 0.15 + (i % 2 ? 1 : -1) * 0.05 * u * (1 + (i % 5) * 0.3); chips.pos[i * 3 + 1] = LY(brk) - 0.03 * u * (i % 3); chips.pos[i * 3 + 2] = 0.02 + 0.12 * u * (1 + (i % 4) * 0.2); }
      chips.m.opacity = ch; chips.commit();
      CL.visible = s8 && t > A("s8:jadi") - 0.4 && t < A("s8:AUDIRA") + 0.4;
      const wp = ramp(t, A("s8:bersihkan") - 0.2, A("s8:lembut") + 0.8);
      CL.position.set(-0.5 + 1.0 * wp, 0.06 * Math.sin(wp * 9), 0.04); CL.rotation.z = 0.1 * Math.sin(wp * 7);
    }

    if (LAB.visible) {
      bowls.forEach((b, i) => { const p = back(ramp(t, A(i ? "s4:perak" : "s4:keramik") - 0.35, A(i ? "s4:perak" : "s4:keramik") + 0.15)); b.scale.setScalar(Math.max(0.001, 0.6 + 0.4 * p)); b.position.y = 0.8 + 0.04 * win(t, A(i ? "s4:perak" : "s4:keramik"), A(i ? "s4:perak" : "s4:keramik") + 0.4, 0.2); });
      const sq = ramp(t, A("s4:dicetak") - 0.4, A("s4:lalu") + 0.1);
      const sqz = -0.45 + 1.1 * sq; SQ.position.set(0, 0.87, sqz); SQ.visible = t < A("s4:dipanggang") + 0.3;
      const kz = win(t, A("s4:dipanggang") - 0.1, A("s4:menyatu") + 0.6, 0.5);
      kiln.material.opacity = 0.55 * kz; kilnL.intensity = 6 * kz;
      const fused = ramp(t, A("s4:menyatu") - 0.2, A("s4:menyatu") + 0.6);
      labL.forEach((m, i) => { const z = LZ(i) + 0.1; m.visible = sqz > z - 0.02 || t > A("s4:lalu") + 0.2;
        const lit = ramp(t, A("s4:sejajar") - 0.2 + i * 0.07, A("s4:sejajar") + 0.2 + i * 0.07);
        labM[i].color.copy(cS).lerp(cG, fused); labM[i].metalness = 0.2 + 0.7 * fused; labM[i].roughness = 0.8 - 0.55 * fused;
        labM[i].emissive.copy(cA).lerp(cH, kz * 0.6); labM[i].emissiveIntensity = 0.9 * kz + 0.25 * fused + 0.8 * lit * (1 - ramp(t, A("s4:lain") + 0.6, A("s4:lain") + 1.4)) ; });
      labBus.forEach((b) => (b.scale.z = Math.max(0.001, ramp(t, A("s4:sisi#2") - 0.3, A("s4:lain") + 0.2))));
    }

    if (ST.visible) {
      discs.forEach((d, i) => { const p = back(clamp01((t - (A("s7:Dayanya") - 0.2) - i * 0.12) / 0.35), 1.4); d.scale.set(1, Math.max(0.001, p), 1); });
      lab150.material.opacity = ramp(t, A("s7:watt") - 0.3, A("s7:watt") + 0.1); lab150.position.y = 1.36 + 0.02 * Math.sin(t * 1.3);
      const lp = ramp(t, A("s7:lampu") - 0.3, A("s7:lampu") + 0.3);
      lens.material.emissiveIntensity = 2.2 * lp; beam.material.opacity = 0.18 * lp;
      approx.material.opacity = ramp(t, A("s7:setara") - 0.2, A("s7:setara") + 0.2);
      const fp = back(ramp(t, A("s7:Heinz") - 0.5, A("s7:Heinz") + 0.2));
      FIG.scale.setScalar(Math.max(0.001, fp));
      const pres = ramp(t, A("s7:Jerman") - 0.3, A("s7:Jerman") + 0.4);
      arms[1].sh.rotation.set(-0.5 * pres, 0, 0.25 + 0.6 * pres); arms[1].el.rotation.set(-1.0 * pres - 0.2, 0, 0.3 * pres);
      arms[0].sh.rotation.set(0.08, 0, -0.15); arms[0].el.rotation.set(-0.35, 0, 0);
      legs[0].hip.rotation.x = -0.12; legs[0].knee.rotation.x = 0.2; legs[1].hip.rotation.x = 0.08; legs[1].knee.rotation.x = 0.06;
      head.rotation.y = 0.15 * Math.sin(t * 0.6); FIG.rotation.y = -0.35 + 0.04 * Math.sin(t * 0.5);
      tabs.forEach((m, i) => { const p = back(clamp01((t - A("s7:paten") + 0.9 - i * 0.02) / 0.3)); m.scale.setScalar(Math.max(0.001, p)); });
    }
    comp.render();
  };
}
