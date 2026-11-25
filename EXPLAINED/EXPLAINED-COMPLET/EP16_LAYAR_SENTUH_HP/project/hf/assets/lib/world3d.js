// EP16 LAYAR SENTUH HP (CIRCUITFORGE): a dark circuit-board world. Green solder mask, gold traces, amber and cyan
// current beads, a studio environment map so the gold and metal never go black. Four stations on one long board:
//   PHONE x=0   a generic phone lying on the board; a fingertip comes down, a ripple, amber charge drawn into it
//   STACK x=30  s2 resistive: two layers, the top one bends under a finger until it touches the bottom (spark);
//               s3 capacitive: glass / clear conductive layer / display slide apart into an exploded stack
//   GRID  x=60  the hidden mesh: gold rows + teal columns etched in, capacitor nodes at the crossings, a controller chip
//               scanning rows with a pulse, column meters; fingers steal field from a node, two at once, a glove fails
//   COUNT x=90  a 12 x 16 node field lights up to 192, then a 1970s plate and a generic control-room console
// Generic products only (no brand shapes or logos). Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const C = { mask: "#06170f", maskL: "#0d3822", trace: "#1b5e3b", gold: "#d4af37", tin: "#94a3b8", die: "#1e293b", silk: "#f1f5f9", amber: "#ffb703", cyan: "#00f0ff", green: "#22c55e", red: "#ef4444", skin: "#d9a184", glove: "#3b4f7a" };
const NanGuard = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}`,
};
// Teal-orange grade: cool shadows, warm highlights, a little contrast.
const Grade = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(0.92,1.02,1.04),(1.0-l)*0.5);c=mix(c,c*vec3(1.06,1.0,0.9),l*0.5);
  c=(c-0.5)*1.06+0.5;gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}`,
};
const o3 = new THREE.Object3D();
const std = (color, rough = 0.5, metal = 0, x = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...x });
const glow = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
function add(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
function dots(n, r, color, parent) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), glow(color), n);
  m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); parent.add(m); return m;
}
function setI(m, i, x, y, z, s, sy) { o3.position.set(x, y, z); o3.rotation.set(0, 0, 0); o3.scale.set(Math.max(1e-4, s), Math.max(1e-4, sy ?? s), Math.max(1e-4, s)); o3.updateMatrix(); m.setMatrixAt(i, o3.matrix); }
function plate(text, w = 2.4, { color = C.amber, border = C.gold, px = 62 } = {}) {
  const W = 640, H = 150;
  const tx = canvasTex(W, H, (g) => {
    g.fillStyle = "rgba(4,16,10,0.94)"; g.fillRect(0, 0, W, H); g.strokeStyle = border; g.lineWidth = 6; g.strokeRect(4, 4, W - 8, H - 8);
    g.fillStyle = color; g.font = `700 ${px}px 'Courier New', monospace`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H / 2 + 4);
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, (w * H) / W), new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false }));
}
function rrect(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
// Fingertip: tip at the local origin, body along +y; skin or glove. Knuckle crease and nail so it reads as a finger.
function finger(parent, color, thick = 1) {
  const G = new THREE.Group(); parent.add(G);
  const m = std(color, color === C.glove ? 0.95 : 0.55, 0);
  const r = 0.3 * thick;
  add(new THREE.SphereGeometry(r, 24, 16), m, G, 0, r, 0);
  add(new THREE.CylinderGeometry(r * 1.05, r, 2.6, 24), m, G, 0, r + 1.3, 0);
  add(new THREE.TorusGeometry(r * 1.04, 0.025, 6, 24), std(color === C.glove ? "#2d3d60" : "#b9826a", 0.7), G, 0, r + 1.0, 0).rotation.x = Math.PI / 2;
  if (color !== C.glove) { const n = add(new THREE.SphereGeometry(r * 0.75, 16, 8), std("#f0c9b6", 0.3), G, 0, r * 1.2, r * 0.55); n.scale.set(1, 1.3, 0.35); }
  else for (let i = 0; i < 5; i++) add(new THREE.TorusGeometry(r * 1.07, 0.02, 4, 24), std("#2d3d60", 0.9), G, 0, r + 0.3 + i * 0.35, 0).rotation.x = Math.PI / 2;
  return G;
}
function aim(G, x, y, z, tilt = 0.35) { G.position.set(x, y, z); G.rotation.set(-tilt, 0, 0.15); }

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0x03100a, fog: 0.016, exp: 1.0, bloom: [0.4, 0.5, 0.82] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.insertPass(new ShaderPass(Grade), comp.passes.length - 1);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const R = mulberry(1616);
  // studio environment (memory fix: metal without an env map renders black)
  {
    const es = new THREE.Scene(); es.background = new THREE.Color(0x101418);
    const lb = (c, i, x, y, z, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
    lb(0xfff1dc, 6, 0, 8, 2, 10, 4); lb(0xffb060, 3, -9, 3, 0, 4, 8); lb(0x60e8ff, 2.5, 9, 3, -2, 4, 8); lb(0xffffff, 1.5, 0, 2, 10, 12, 3);
    const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(es, 0.04).texture; scene.environmentIntensity = 0.6;
  }
  scene.add(new THREE.HemisphereLight(0x9fe8d0, 0x0a1a10, 0.5));
  const key = new THREE.DirectionalLight(0xfff0dc, 1.8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 }); key.shadow.camera.updateProjectionMatrix(); scene.add(key, key.target);
  const rimL = new THREE.PointLight(0xffa040, 30, 20, 1.6); scene.add(rimL);
  const cyanL = new THREE.PointLight(0x00e0ff, 0, 8, 1.8); scene.add(cyanL);

  // one long board: solder mask with silkscreen + background traces (texture)
  const boardTex = canvasTex(2048, 512, (g, w, h) => {
    g.fillStyle = C.mask; g.fillRect(0, 0, w, h);
    const RR = mulberry(77); g.lineCap = "round";
    for (let i = 0; i < 140; i++) { let x = RR() * w, y = RR() * h; g.strokeStyle = RR() < 0.8 ? "rgba(27,94,59,0.9)" : "rgba(212,175,55,0.5)"; g.lineWidth = 2 + RR() * 4; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) x += (RR() - 0.5) * 260; else y += (RR() - 0.5) * 160; g.lineTo(x, y); } g.stroke(); g.fillStyle = "rgba(212,175,55,0.7)"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    g.fillStyle = "rgba(241,245,249,0.35)"; g.font = "700 22px 'Courier New', monospace"; for (let i = 0; i < 30; i++) g.fillText(["R" + (i + 3), "C" + (i * 7 % 40), "U" + i, "TP" + i][i % 4], RR() * w, RR() * h);
  }, [6, 1]);
  const board = add(new THREE.BoxGeometry(130, 0.4, 22), std("#ffffff", 0.55, 0.0, { map: boardTex }), scene, 45, -0.2, -2); board.castShadow = false;
  const bg = add(new THREE.PlaneGeometry(160, 40), std(C.mask, 0.9), scene, 45, 8, -14);

  // ---------------- PHONE ----------------
  const PH = new THREE.Group(); scene.add(PH);
  const body = new THREE.ExtrudeGeometry(rrect(3.0, 6.2, 0.45), { depth: 0.28, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 });
  const phone = add(body, std("#2a3138", 0.28, 0.85), PH, 0, 0.02, 0); phone.rotation.x = -Math.PI / 2;
  const scrTex = canvasTex(560, 1160, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0b2a3a"); gr.addColorStop(1, "#06140f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#e8f6ff"; g.font = "300 150px Arial, sans-serif"; g.textAlign = "center"; g.fillText("09:41", w / 2, 300);
    g.font = "700 46px 'Courier New', monospace"; g.fillStyle = C.amber; g.fillText("AUDIRA", w / 2, 380);
    for (let i = 0; i < 12; i++) { const x = 70 + (i % 4) * 115, y = 560 + Math.floor(i / 4) * 125; g.fillStyle = ["#1b5e3b", "#0e7490", "#7c5c12", "#334155"][i % 4]; g.fillRect(x, y, 80, 80); }
  });
  const screen = add(new THREE.PlaneGeometry(2.78, 5.96), new THREE.MeshStandardMaterial({ map: scrTex, emissive: 0xffffff, emissiveMap: scrTex, emissiveIntensity: 0.55, roughness: 0.08, metalness: 0 }), PH, 0, 0.37, 0);
  screen.rotation.x = -Math.PI / 2; screen.castShadow = false;
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 48), glow(C.cyan, 0.9)); ripple.rotation.x = -Math.PI / 2; PH.add(ripple);
  const f0 = finger(PH, C.skin);
  const NQ = 40, charge = dots(NQ, 0.045, C.amber, PH);
  const qs = []; for (let i = 0; i < NQ; i++) { const a = R() * 6.283, rr = 0.6 + R() * 1.4; qs.push([Math.cos(a) * rr, Math.sin(a) * rr, R()]); }
  const TP = [0.15, 0.4, 0.9]; // touch point on the phone screen

  // ---------------- STACK ----------------
  const ST = new THREE.Group(); ST.position.x = 30; scene.add(ST);
  // resistive pair (s2)
  const RES = new THREE.Group(); ST.add(RES);
  add(new THREE.BoxGeometry(4.2, 0.08, 3.2), std("#5b6b7a", 0.4, 0.2), RES, 0, 0.3, 0);
  const topGeo = new THREE.PlaneGeometry(4.2, 3.2, 60, 46); topGeo.rotateX(-Math.PI / 2);
  const topBase = topGeo.attributes.position.array.slice();
  const topL = add(topGeo, std("#9fb7c9", 0.35, 0.1, { transparent: true, opacity: 0.85, side: THREE.DoubleSide }), RES, 0, 0.75, 0);
  const spacer = dots(30, 0.04, "#cfd8e3", RES);
  for (let i = 0; i < 30; i++) setI(spacer, i, -1.8 + (i % 6) * 0.72, 0.38, -1.3 + Math.floor(i / 6) * 0.65, 1);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glow(C.amber)); RES.add(spark);
  const f1 = finger(ST, C.skin);
  const labRes = plate("RESISTIF", 1.8); labRes.position.set(-1.2, 2.3, -1.4); RES.add(labRes);
  // capacitive stack (s3)
  const CAP = new THREE.Group(); ST.add(CAP);
  const lyr = (y, c, op, lab, rough = 0.1) => { const m = add(new THREE.BoxGeometry(4.0, 0.1, 3.0), std(c, rough, 0.05, { transparent: true, opacity: op }), CAP, 0, y, 0); const p = plate(lab, 1.7, { color: C.silk, px: 54 }); p.position.set(2.9, y, 0.6); CAP.add(p); return { m, p }; };
  const dispTex = canvasTex(256, 192, (g, w, h) => { const RR = mulberry(5); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.fillStyle = ["#ef4444", "#22c55e", "#3b82f6"][((x + y) / 8) % 3] ; g.globalAlpha = 0.25 + 0.5 * RR(); g.fillRect(x + 1, y + 1, 6, 6); } });
  const Ldisp = lyr(0.1, "#ffffff", 1, "LAYAR", 0.6); Ldisp.m.material.map = dispTex; Ldisp.m.material.emissive = new THREE.Color(0xffffff); Ldisp.m.material.emissiveMap = dispTex; Ldisp.m.material.emissiveIntensity = 0.4;
  const Lito = lyr(0.5, "#5ff3e0", 0.35, "LAPISAN ITO");
  const Lgla = lyr(0.9, "#cfe9ff", 0.28, "KACA", 0.02);
  Lito.m.material.emissive = new THREE.Color(C.cyan); Lito.m.material.emissiveIntensity = 0;
  const itoSp = dots(60, 0.03, C.cyan, CAP);
  const itoP = []; for (let i = 0; i < 60; i++) itoP.push([(R() - 0.5) * 3.8, (R() - 0.5) * 2.8, R() * 6.28]);

  // ---------------- GRID ----------------
  const GR = new THREE.Group(); GR.position.x = 60; scene.add(GR);
  add(new THREE.BoxGeometry(5.6, 0.12, 7.0), std(C.maskL, 0.45, 0.1), GR, 0, 0.06, 0);
  const ROWS = 8, COLS = 6, rz = (i) => -2.62 + i * 0.75, cx = (j) => -2.0 + j * 0.8;
  const goldM = std(C.gold, 0.28, 0.95), tealM = std("#4fd6c4", 0.25, 0.3, { transparent: true, opacity: 0.85, emissive: new THREE.Color("#0b5a52"), emissiveIntensity: 0.6 });
  const rowsM = [], colsM = [];
  for (let i = 0; i < ROWS; i++) rowsM.push(add(new THREE.BoxGeometry(5.0, 0.03, 0.09), goldM, GR, 0, 0.14, rz(i)));
  for (let j = 0; j < COLS; j++) colsM.push(add(new THREE.BoxGeometry(0.09, 0.03, 6.0), tealM, GR, cx(j), 0.18, 0));
  const NN = ROWS * COLS;
  const nodes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), new THREE.MeshBasicMaterial({ toneMapped: false }), NN);
  nodes.frustumCulled = false; nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); GR.add(nodes);
  const nc = new THREE.Color(), cA = new THREE.Color(C.amber), cD = new THREE.Color("#7a5a10"), cR = new THREE.Color(C.red), cG = new THREE.Color(C.green);
  for (let i = 0; i < NN; i++) nodes.setColorAt(i, cD);
  const rowGlow = add(new THREE.BoxGeometry(5.1, 0.05, 0.16), glow(C.amber, 0.9), GR, 0, 0.16, 0); rowGlow.castShadow = false;
  const chip = new THREE.Group(); chip.position.set(-3.6, 0.12, -0.2); GR.add(chip);
  add(new THREE.BoxGeometry(1.1, 0.22, 1.6), std(C.die, 0.35, 0.2), chip, 0, 0.11, 0);
  for (let i = 0; i < 8; i++) { add(new THREE.BoxGeometry(0.18, 0.03, 0.06), std(C.tin, 0.3, 0.9), chip, 0.62, 0.03, -0.7 + i * 0.2); add(new THREE.BoxGeometry(0.18, 0.03, 0.06), std(C.tin, 0.3, 0.9), chip, -0.62, 0.03, -0.7 + i * 0.2); }
  const chipLab = plate("AUDIRA TC-01", 1.0, { color: C.silk, border: C.die, px: 60 }); chipLab.rotation.x = -Math.PI / 2; chipLab.position.set(0, 0.225, 0); chip.add(chipLab);
  for (let i = 0; i < ROWS; i++) add(new THREE.BoxGeometry(0.75, 0.02, 0.05), goldM, GR, -2.85, 0.13, rz(i)).castShadow = false;
  const meters = []; for (let j = 0; j < COLS; j++) meters.push(add(new THREE.BoxGeometry(0.3, 1, 0.12), glow(C.cyan, 0.95), GR, cx(j), 0.5, -3.75));
  const fA = finger(GR, C.skin), fB = finger(GR, C.skin), fG = finger(GR, C.glove, 1.35);
  const NF = 4 * 7, field = dots(NF * 2, 0.035, C.cyan, GR);
  const ringM = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.34, 40), glow(C.green, 0.9)); ringM.rotation.x = -Math.PI / 2; GR.add(ringM);
  const ringN = ringM.clone(); ringN.material = ringM.material.clone(); GR.add(ringN);
  const T1 = [3, 2], T2 = [6, 4], TG = [1, 4];
  const ni = (i, j) => i * COLS + j;

  // ---------------- COUNT ----------------
  const CO = new THREE.Group(); CO.position.x = 90; scene.add(CO);
  add(new THREE.BoxGeometry(5.6, 4.3, 0.15), std(C.maskL, 0.5, 0.1), CO, 0, 2.0, -0.6);
  const N192 = 192, grid192 = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.17, 0.04), new THREE.MeshBasicMaterial({ toneMapped: false }), N192);
  grid192.frustumCulled = false; CO.add(grid192);
  for (let i = 0; i < N192; i++) { const rr = Math.floor(i / 16), cc = i % 16; setI(grid192, i, -2.4 + cc * 0.32, 0.25 + (11 - rr) * 0.32, -0.5, 1); grid192.setColorAt(i, cD); }
  const lab192 = plate("12 × 16 = 192", 2.6, { color: C.amber }); lab192.position.set(0, 4.55, -0.45); CO.add(lab192);
  const labC = plate("1970-AN · AKSELERATOR", 2.9, { color: C.cyan, px: 50 }); labC.position.set(6.4, 3.6, -0.45); CO.add(labC);
  const con = new THREE.Group(); con.position.set(6.4, 0, 0.2); CO.add(con);
  add(new THREE.BoxGeometry(3.6, 1.0, 1.4), std("#3a4048", 0.5, 0.4), con, 0, 0.5, 0);
  const conTex = canvasTex(512, 256, (g, w, h) => { const RR = mulberry(9); g.fillStyle = "#0b1410"; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 14 + (i % 3) * 165, y = 14 + Math.floor(i / 3) * 120; g.fillStyle = "#06261a"; g.fillRect(x, y, 150, 105); g.strokeStyle = i % 2 ? C.cyan : C.green; g.lineWidth = 3; g.beginPath(); for (let k = 0; k < 30; k++) g.lineTo(x + 5 + k * 4.8, y + 52 + 30 * Math.sin(k * 0.5 + i) * RR()); g.stroke(); } });
  const conScr = add(new THREE.BoxGeometry(3.6, 1.5, 0.12), std("#ffffff", 0.3, 0.1, { map: conTex, emissive: 0xffffff, emissiveMap: conTex, emissiveIntensity: 0.7 }), con, 0, 1.55, -0.45);
  conScr.rotation.x = -0.35;
  for (let i = 0; i < 18; i++) add(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10), glow([C.amber, C.green, C.red][i % 3]), con, -1.5 + (i % 9) * 0.37, 1.03, 0.25 + Math.floor(i / 9) * 0.3);

  // ---------------- camera ----------------
  const mk = (keys) => { keys.sort((a, b) => a[0] - b[0]); for (let i = 1; i < keys.length; i++) if (keys[i][0] <= keys[i - 1][0]) keys[i][0] = keys[i - 1][0] + 0.01; return track(keys); };
  const CAM = mk([
    [0, 2.2, 6.8, 9.4, 0, 0.3, 0.3],
    [K.s2 - 0.02, 1.2, 5.8, 7.6, 0.1, 0.3, 0.6],
    [K.s2, 31.8, 4.0, 9.6, 30, 0.6, 0],
    [A("s2:ditekan"), 31.0, 2.4, 7.4, 30, 0.6, 0],
    [K.s3, 29.2, 3.2, 8.6, 30.6, 0.8, 0],
    [A("s3:menghantarkan"), 33.6, 2.6, 7.8, 31.0, 0.6, 0],
    [K.s4 - 0.02, 33.2, 3.0, 8.4, 31.0, 0.6, 0],
    [K.s4, 60.4, 11.4, 9.6, 59.6, 0, -0.4],
    [A("s4:jaring"), 59.6, 10.6, 8.2, 59.8, 0, -0.4],
    [A("s5:Chip"), 57.8, 6.6, 6.0, 58.4, 0, -0.6],
    [A("s5:mengukur"), 59.4, 7.2, 4.6, 59.4, 0, -1.6],
    [A("s6:mendekat"), 60.4, 5.4, 6.2, 59.6, 0.3, -0.4],
    [A("s6:mencatat"), 60.2, 5.0, 5.6, 59.6, 0.2, -0.4],
    [A("s6:bersamaan"), 61.4, 7.2, 8.2, 60.4, 0.2, 0.6],
    [A("s6:gagal"), 62.2, 5.6, 4.2, 61.4, 0.3, -2.0],
    [K.s7 - 0.02, 62.0, 5.8, 4.6, 61.4, 0.3, -2.0],
    [K.s7, 90, 2.4, 11.6, 90, 2.1, 0],
    [A("s7:titik"), 90.4, 2.2, 10.2, 90.2, 2.1, 0],
    [A("s7:CERN") + 0.3, 95.6, 2.6, 9.2, 96.2, 1.8, 0],
    [K.s8 - 0.02, 96.6, 2.6, 8.6, 96.4, 1.7, 0],
    [K.s8, 1.6, 5.2, 8.2, 0, 0.4, 0.4],
    [K.end, 0, 7.6, 11.0, 0, 0.3, 0.2],
    [K.dur, 0, 7.8, 11.4, 0, 0.3, 0.2],
  ]);

  return (t) => {
    const [px, py, pz, tx, ty, tz] = CAM(t);
    cam.position.set(px + 0.05 * Math.sin(t * 0.6), py + 0.04 * Math.sin(t * 0.8 + 1), pz);
    cam.lookAt(tx, ty, tz);
    const st = t < K.s2 || t >= K.s8 ? 0 : t < K.s4 ? 1 : t < K.s7 ? 2 : 3;
    const sx = [0, 30, 60, 90][st];
    PH.visible = st === 0; ST.visible = st === 1; GR.visible = st === 2; CO.visible = st === 3;
    key.position.set(sx - 6, 12, 9); key.target.position.set(sx, 0, 0); rimL.position.set(sx + 5, 4, -4);
    cyanL.intensity = 0;

    if (PH.visible) {
      // finger comes down (hook), lifts at the s1 end; returns in s8 and charge is drawn into it ("dicuri")
      const s8 = t >= K.s8;
      const d = s8 ? eout((t - K.s8 - 0.2) / 1.0) : eout((t - 0.0) / 1.4);
      aim(f0, TP[0], 0.4 + 3.6 * (1 - d), TP[2] + 0.2, 0.32);
      const touch = clamp01((d - 0.85) / 0.15);
      const rp = ((t * 0.9) % 1);
      ripple.position.set(TP[0], 0.385, TP[2]); ripple.scale.setScalar(1 + 5 * rp); ripple.material.opacity = touch * 0.9 * (1 - rp);
      const pull = s8 ? ramp(t, A("s8:dicuri") - 0.5, A("s8:dicuri") + 0.4) : ramp(t, A("s1:listrik") - 0.4, A("s1:listrik") + 0.4);
      qs.forEach(([x, z, ph], i) => { const u = (t * 0.6 + ph) % 1, k = pull * u; setI(charge, i, TP[0] + x * (1 - k), 0.4 + 0.25 * k, TP[2] + z * (1 - k), touch * pull > 0.02 ? 1 - 0.5 * k : 0); });
      charge.instanceMatrix.needsUpdate = true;
      cyanL.position.set(TP[0], 0.8, TP[2]); cyanL.intensity = 6 * touch;
    }

    if (ST.visible) {
      const s3 = t >= K.s3;
      RES.visible = !s3; CAP.visible = s3;
      if (!s3) {
        const dn = eout((t - A("s2:resistif") + 0.3) / 1.0), pr = ramp(t, A("s2:ditekan") - 0.2, A("s2:bersentuhan"));
        aim(f1, 0.3, 0.75 + 0.02 + 3.4 * (1 - dn) - 0.42 * pr, 0.2, 0.25);
        f1.visible = true;
        const p = topGeo.attributes.position.array;
        for (let v = 0; v < p.length; v += 3) { const dx = topBase[v] - 0.3, dz = topBase[v + 2] - 0.2; p[v + 1] = -0.42 * pr * Math.exp(-(dx * dx + dz * dz) / 0.5); }
        topGeo.attributes.position.needsUpdate = true; topGeo.computeVertexNormals();
        const sp = t > A("s2:bersentuhan") - 0.05 ? Math.max(0, 1 - (t - A("s2:bersentuhan")) / 0.5) + 0.25 : 0;
        spark.position.set(0.3, 0.36, 0.2); spark.scale.setScalar(Math.max(1e-3, sp * (1 + 0.2 * Math.sin(t * 30))));
        labRes.material.opacity = ramp(t, A("s2:resistif") - 0.3, A("s2:resistif") + 0.3);
      } else {
        f1.visible = false;
        const ex = eout((t - A("s3:kacanya") + 0.4) / 1.2);
        Lgla.m.position.y = 0.9 + 1.5 * ex; Lgla.p.position.y = Lgla.m.position.y; Lito.m.position.y = 0.5 + 0.75 * ex; Lito.p.position.y = Lito.m.position.y;
        const it = ramp(t, A("s3:menghantarkan") - 0.3, A("s3:menghantarkan") + 0.4);
        Lito.m.material.emissiveIntensity = 0.6 * it; Lito.m.material.opacity = 0.35 + 0.25 * it;
        itoP.forEach(([x, z, ph], i) => setI(itoSp, i, x, Lito.m.position.y + 0.07, z, it * (0.5 + 0.5 * Math.sin(t * 4 + ph))));
        itoSp.instanceMatrix.needsUpdate = true;
        [Ldisp, Lito, Lgla].forEach((l, i) => { l.p.material.opacity = ramp(t, A("s3:kacanya") + 0.2 * i, A("s3:kacanya") + 0.5 + 0.2 * i); });
      }
    }

    if (GR.visible) {
      const s5 = t >= K.s5, s6 = t >= K.s6;
      const rIn = ramp(t, A("s4:mendatar") - 0.4, A("s4:mendatar") + 0.8), cIn = ramp(t, A("s4:tegak") - 0.4, A("s4:tegak") + 0.8);
      rowsM.forEach((m, i) => { m.scale.x = Math.max(1e-3, clamp01(rIn * 1.6 - i * 0.08)); });
      colsM.forEach((m, j) => { m.scale.z = Math.max(1e-3, clamp01(cIn * 1.6 - j * 0.1)); });
      const nOn = ramp(t, A("s5:kapasitor") - 0.3, A("s5:kapasitor") + 0.6);
      const scanOn = t > A("s5:denyut") - 0.2;
      const row = Math.floor(Math.max(0, t - A("s5:denyut")) * 7) % ROWS;
      rowGlow.visible = scanOn; rowGlow.position.z = rz(row);
      const tA = ramp(t, A("s6:mendekat") - 0.6, A("s6:mendekat") + 0.4) * (1 - ramp(t, A("s6:Sarung") - 0.4, A("s6:Sarung") + 0.3));
      const tB = ramp(t, A("s6:beberapa") - 0.3, A("s6:bersamaan")) * (1 - ramp(t, A("s6:Sarung") - 0.4, A("s6:Sarung") + 0.3));
      const tG = ramp(t, A("s6:Sarung") - 0.2, A("s6:gagal") - 0.2);
      const dropA = ramp(t, A("s6:tertarik"), A("s6:turun")) * tA, dropB = ramp(t, A("s6:bersamaan") - 0.4, A("s6:bersamaan")) * tB;
      for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) {
        const k = ni(i, j), lit = scanOn && i === row ? 1 : 0;
        let dd = 0; if (i === T1[0] && j === T1[1]) dd = dropA; if (i === T2[0] && j === T2[1]) dd = dropB;
        nc.copy(cD).lerp(cA, 0.35 + 0.65 * lit).lerp(cR, dd);
        nodes.setColorAt(k, nc);
        setI(nodes, k, cx(j), 0.21, rz(i), nOn * (1 + 0.25 * lit), nOn * (1 + 0.25 * lit));
      }
      nodes.instanceMatrix.needsUpdate = true; nodes.instanceColor.needsUpdate = true;
      const mOn = ramp(t, A("s5:mengukur") - 0.3, A("s5:mengukur") + 0.4);
      meters.forEach((m, j) => { let v = 0.8 + 0.1 * Math.sin(t * 6 + j); if (j === T1[1]) v -= 0.5 * dropA; if (j === T2[1]) v -= 0.5 * dropB; m.scale.y = Math.max(1e-3, mOn * v); m.position.y = 0.2 + 0.5 * mOn * v; });
      aim(fA, cx(T1[1]), 0.32 + 4.5 * (1 - tA), rz(T1[0]) + 0.15, 0.3); fA.visible = tA > 0.01;
      aim(fB, cx(T2[1]), 0.32 + 4.5 * (1 - tB), rz(T2[0]) + 0.15, 0.3); fB.visible = tB > 0.01;
      aim(fG, cx(TG[1]), 0.36 + 4.5 * (1 - tG), rz(TG[0]) + 0.15, 0.3); fG.visible = tG > 0.01;
      // field beads leave the node and flow up into the fingertip (not into the glove)
      const ff = (n0, T, amt) => { for (let q = 0; q < NF; q++) { const lane = q % 4, a = (lane / 4) * 6.283 + 0.4, u = ((t * 0.7 + q / NF) % 1); const sx0 = cx(T[1]) + Math.cos(a) * 0.38, sz0 = rz(T[0]) + Math.sin(a) * 0.38; const x = sx0 + (cx(T[1]) - sx0) * u, z = sz0 + (rz(T[0]) + 0.1 - sz0) * u, y = 0.22 + 0.15 * u + 0.35 * Math.sin(u * Math.PI); setI(field, n0 + q, x, y, z, amt > 0.03 ? 1 : 0); } };
      ff(0, T1, dropA); ff(NF, T2, dropB);
      field.instanceMatrix.needsUpdate = true;
      const mc = clamp01((t - A("s6:mencatat")) / 0.5);
      ringM.position.set(cx(T1[1]), 0.24, rz(T1[0])); ringM.scale.setScalar(1 + mc * 0.6); ringM.material.opacity = t > A("s6:mencatat") ? 0.9 * tA : 0;
      ringN.position.set(cx(T2[1]), 0.24, rz(T2[0])); ringN.material.opacity = 0.9 * dropB;
      cyanL.position.set(cx(T1[1]) + 60, 1.2, rz(T1[0])); cyanL.intensity = 5 * dropA;
    }

    if (CO.visible) {
      const n = Math.round(N192 * ramp(t, A("s7:dua") - 0.2, A("s7:titik")));
      for (let i = 0; i < N192; i++) grid192.setColorAt(i, i < n ? (i === n - 1 ? cG : cA) : cD);
      grid192.instanceColor.needsUpdate = true;
      lab192.scale.setScalar(Math.max(1e-3, back(clamp01((t - A("s7:seratus") + 0.2) / 0.4), 1.4)));
      const cp = back(clamp01((t - A("s7:CERN") + 0.2) / 0.5), 1.3);
      labC.scale.setScalar(Math.max(1e-3, back(clamp01((t - A("s7:tujuh") + 0.2) / 0.4), 1.4)));
      con.scale.setScalar(Math.max(1e-3, cp)); con.rotation.y = -0.35 + 0.1 * Math.sin(t * 0.6);
    }
    comp.render();
  };
}
