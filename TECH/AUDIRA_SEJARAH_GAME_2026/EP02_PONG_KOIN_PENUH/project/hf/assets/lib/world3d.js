// EP02 PONG KOIN PENUH / SATISFYFORGE. A pastel studio sweep with three diorama plinths along x:
// the bar (x=0), the factory belt (x=X1) and the bank (x=X2). Soft clay and candy plastic, one warm key with soft VSM shadows,
// a pink rim from behind, lilac hemisphere fill. Coins are instanced and follow exact, pure-of-t paths that end on their marks.
// Illustration only: generic cabinet, generic faceless figures with name plates, no logos. Every value is a function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, clamp01, smooth, ramp, eout, back, canvasTex, track, stage, envStrips } from "./lib3d.js";
import { sched, fr, COIN, PT } from "./gsched.js";

const P = { floor: "#F2C4B8", wall: "#C9BBEE", plinth: "#FFF6F0", pink: "#FF8DB6", peach: "#FFC9A3", butter: "#FFD96A", mint: "#6FD8B0", sky: "#7FC0F5", lilac: "#A98BF0", ink: "#4B3F5C", wood: "#E3A574", woodD: "#C7875A", cream: "#FFF1DE", red: "#F2558F" };
const FONT = "'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
const PI = Math.PI;
const X1 = 8.5, X2 = 16.5;
const CAB = { x: 0, z: -0.35 };

// rounded box: inner rectangle extruded with a bevel of radius r, so every edge is soft
const geoCache = {};
function rgeo(w, h, d, r = 0.04, seg = 4) {
  const key = [w, h, d, r, seg].join("_");
  if (geoCache[key]) return geoCache[key];
  r = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const iw = w - 2 * r, ih = h - 2 * r, e = 0.0005;
  const s = new THREE.Shape();
  s.moveTo(-iw / 2 + e, -ih / 2); s.lineTo(iw / 2 - e, -ih / 2); s.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + e);
  s.lineTo(iw / 2, ih / 2 - e); s.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - e, ih / 2); s.lineTo(-iw / 2 + e, ih / 2);
  s.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - e); s.lineTo(-iw / 2, -ih / 2 + e); s.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + e, -ih / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(1e-3, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg, curveSegments: 2 });
  g.translate(0, 0, -Math.max(1e-3, d - 2 * r) / 2);
  g.computeVertexNormals();
  return (geoCache[key] = g);
}
const candy = (c, rough = 0.36, extra = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.25, ...extra });
const clay = (c, rough = 0.82) => new THREE.MeshStandardMaterial({ color: c, roughness: rough });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent, cast = true) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; if (parent) parent.add(m); return m; }
const rb = (w, h, d, r, mat, x, y, z, parent) => mesh(rgeo(w, h, d, r), mat, x, y, z, parent);
const cy = (rt, rbm, h, mat, x, y, z, parent, seg = 28) => mesh(new THREE.CylinderGeometry(rt, rbm, h, seg), mat, x, y, z, parent);
const sp = (r, mat, x, y, z, parent) => mesh(new THREE.SphereGeometry(r, 28, 18), mat, x, y, z, parent);

function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// pill label for billboards and name plates; height in world units
function pill(text, { bg = "#ffffff", fg = P.ink, h = 0.2, dot = null, border = null } = {}) {
  const c0 = document.createElement("canvas").getContext("2d"); c0.font = `800 64px ${FONT}`;
  const tw = c0.measureText(text).width, H = 112, W = Math.ceil(tw + (dot ? 130 : 90));
  const tx = canvasTex(W, H, (g) => {
    g.clearRect(0, 0, W, H); rrect(g, 4, 4, W - 8, H - 8, (H - 8) / 2); g.fillStyle = bg; g.fill();
    if (border) { g.lineWidth = 6; g.strokeStyle = border; g.stroke(); }
    if (dot) { g.fillStyle = dot; g.beginPath(); g.arc(52, H / 2, 14, 0, 7); g.fill(); }
    g.fillStyle = fg; g.font = `800 64px ${FONT}`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(text, dot ? 84 : 45, H / 2 + 4);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry((h * W) / H, h), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = 5;
  return m;
}
function board(w, h, pxw, pxh, draw, lit = true) {
  const tx = canvasTex(pxw, pxh, draw);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit ? new THREE.MeshStandardMaterial({ map: tx, roughness: 0.7, transparent: true }) : new THREE.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false }));
}

// ---- generic faceless figure: shoulders wider than hips, bent elbows and knees, skin differs from clothes
function person({ shirt, pants, skin = "#F1C7A5", hair = "#5B4636", shoe = "#4B3F5C" }) {
  const G = new THREE.Group();
  const mS = clay(shirt, 0.7), mP = clay(pants, 0.75), mK = clay(skin, 0.6), mH = clay(hair, 0.8), mF = candy(shoe, 0.4);
  const cap = (r, len, mat, parent, y) => { const m = mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat, 0, y, 0, parent); return m; };
  const leg = (sx) => {
    const hip = new THREE.Group(); hip.position.set(sx * 0.1, 0.92, 0); G.add(hip);
    cap(0.075, 0.32, mP, hip, -0.22);
    const knee = new THREE.Group(); knee.position.y = -0.45; hip.add(knee);
    cap(0.066, 0.3, mP, knee, -0.2);
    rb(0.12, 0.08, 0.22, 0.035, mF, 0, -0.43, 0.04, knee);
    return { hip, knee };
  };
  const arm = (sx) => {
    const sh = new THREE.Group(); sh.position.set(sx * 0.245, 1.41, 0); G.add(sh);
    cap(0.058, 0.2, mS, sh, -0.13);
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    cap(0.05, 0.18, mK, el, -0.12);
    sp(0.055, mK, 0, -0.27, 0, el);
    return { sh, el };
  };
  const torso = mesh(new THREE.CylinderGeometry(0.21, 0.155, 0.54, 24), mS, 0, 1.2, 0, G); torso.scale.z = 0.62;
  sp(0.2, mS, 0, 1.43, 0, G).scale.set(1.14, 0.42, 0.7);
  sp(0.165, mP, 0, 0.94, 0, G).scale.set(1, 0.6, 0.7);
  cy(0.05, 0.055, 0.1, mK, 0, 1.52, 0, G, 14);
  const head = sp(0.125, mK, 0, 1.67, 0, G); head.scale.set(0.95, 1.05, 1);
  const hr = mesh(new THREE.SphereGeometry(0.133, 24, 14, 0, PI * 2, 0, 1.45), mH, 0, 1.69, -0.012, G); hr.rotation.x = -0.25;
  const L = leg(-1), R = leg(1), AL = arm(-1), AR = arm(1);
  return { G, L, R, AL, AR };
}
function pose(f, kind, ph = 0, amt = 1) {
  const s = Math.sin(ph) * amt;
  f.L.hip.rotation.x = -0.5 * s; f.R.hip.rotation.x = 0.5 * s;
  f.L.knee.rotation.x = 0.7 * Math.max(0, Math.sin(ph + 1.3)) * amt + 0.05; f.R.knee.rotation.x = 0.7 * Math.max(0, Math.sin(ph + 1.3 + PI)) * amt + 0.05;
  f.AL.sh.rotation.set(0.35 * s, 0, -0.12); f.AR.sh.rotation.set(-0.35 * s, 0, 0.12);
  f.AL.el.rotation.x = -0.35; f.AR.el.rotation.x = -0.35;
  if (kind === "carry") { f.AL.sh.rotation.set(-1.15, 0, -0.32); f.AR.sh.rotation.set(-1.15, 0, 0.32); f.AL.el.rotation.x = -0.35; f.AR.el.rotation.x = -0.35; }
  if (kind === "reach") { f.AR.sh.rotation.set(-1.35 * amt, 0, 0.1); f.AR.el.rotation.x = -0.25; }
  if (kind === "cheer") { f.AL.sh.rotation.set(-2.6 * amt, 0, -0.25); f.AR.sh.rotation.set(-2.6 * amt, 0, 0.25); f.AL.el.rotation.x = -0.3; f.AR.el.rotation.x = -0.3; }
  if (kind === "think") { f.AR.sh.rotation.set(-2.1 * amt, 0, 0.55 * amt); f.AR.el.rotation.x = -1.9 * amt; }
}

export function create(canvas, K, AT) {
  const A = (k) => { const v = AT[k]; if (v == null) { console.error("missing anchor", k); return 0; } return v; };
  const S = sched(A, K);
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xe8d3dc, exp: 1.0, bloom: [0.12, 0.5, 0.97] });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.95;
  r.shadowMap.type = THREE.VSMShadowMap;
  envStrips(r, scene, [[6, 3, 0xfff3ea, 2.2, -4, 6, 5], [2, 8, 0xffd6ec, 1.4, 6, 3, -4], [8, 2, 0xe9f0ff, 1.2, 0, -3, 6], [3, 3, 0xc9bbee, 1.0, 0, 8, -6]], 0x8a7c9c);
  scene.environmentIntensity = 0.5;
  const nanPass = new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: "uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(any(isnan(c))||any(isinf(c)))c=vec4(0.,0.,0.,1.);gl_FragColor=clamp(c,0.,64.);}" });
  comp.insertPass(nanPass, 1);

  // ---- lights: warm key with soft VSM shadows, pink rim from behind, lilac/peach hemisphere fill
  const hemi = new THREE.HemisphereLight(0xe9f0ff, 0xf6d7cf, 1.05); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff1e6, 2.7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5.5, right: 5.5, top: 5.5, bottom: -5.5, near: 0.5, far: 30 }); key.shadow.radius = 9; key.shadow.blurSamples = 16; key.shadow.bias = -0.0006;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffcfe6, 1.7); scene.add(rim, rim.target);
  const lampL = new THREE.PointLight(0xffc98a, 0, 6, 1.6); lampL.position.set(CAB.x, 2.8, CAB.z + 0.3); scene.add(lampL);

  // ---- seamless cyclorama sweep (no horizon), peach floor into lilac wall
  const sweepGeo = (() => {
    const W = 44, seg = 90, g = new THREE.PlaneGeometry(W, 1, 1, seg), pos = g.attributes.position, col = [];
    const cf = new THREE.Color(P.floor), cw = new THREE.Color(P.wall), R = 3, fl = 13, arc = (PI / 2) * R, wl = 14, tot = fl + arc + wl;
    for (let i = 0; i < pos.count; i++) {
      const s = (pos.getY(i) + 0.5) * tot; let y = 0, z = 0;
      if (s < fl) z = 9 - s; else if (s < fl + arc) { const a = (s - fl) / R; z = -4 - Math.sin(a) * R; y = R - Math.cos(a) * R; } else { z = -4 - R; y = R + (s - fl - arc); }
      pos.setXYZ(i, pos.getX(i) + 8, y, z);
      const k = THREE.MathUtils.smoothstep(s, fl - 2, fl + arc + 3); const c = cf.clone().lerp(cw, k); col.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
  })();
  const sweepM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, side: THREE.DoubleSide });
  const sweep = new THREE.Mesh(sweepGeo, sweepM); sweep.receiveShadow = true; scene.add(sweep);
  const rnd = mulberry(5102);
  const decoCols = [P.pink, P.mint, P.butter, P.lilac, P.sky, P.peach];
  for (let i = 0; i < 26; i++) {
    const x = -9 + i * 1.35 + (rnd() - 0.5) * 0.6, z = -3.0 - rnd() * 0.6, s = 0.35 + rnd() * 0.45, kind = i % 3, m = candy(decoCols[i % 6], 0.5);
    const geo = kind === 0 ? new THREE.SphereGeometry(s * 0.5, 28, 14, 0, PI * 2, 0, PI / 2) : kind === 1 ? new THREE.ConeGeometry(s * 0.42, s * 1.3, 4) : new THREE.TorusGeometry(s * 0.38, s * 0.15, 14, 36);
    const d = mesh(geo, m, x, kind === 1 ? s * 0.65 : kind === 2 ? s * 0.53 : 0, z, scene); d.rotation.y = rnd() * 6; if (kind === 2) d.rotation.x = 0.2;
  }
  const plinth = (x, z, R, col) => { cy(R, R + 0.04, PT, candy(col, 0.5), x, PT / 2, z, scene, 64); };

  // =========================== STATION 0: the bar ===========================
  plinth(0, -0.45, 3.5, P.plinth);
  const tileT = canvasTex(256, 256, (g, w) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#F6C6BC" : "#FBDDD3"; g.fillRect(i * 64, j * 64, 64, 64); } }, [3.5, 3.5]);
  const tiles = new THREE.Mesh(new THREE.CircleGeometry(3.42, 64), new THREE.MeshStandardMaterial({ map: tileT, roughness: 0.6 })); tiles.rotation.x = -PI / 2; tiles.position.set(0, PT + 0.002, -0.45); tiles.receiveShadow = true; scene.add(tiles);
  const wallM = clay("#FFD9C0", 0.85);
  rb(5.6, 3.0, 0.18, 0.06, wallM, 0, PT + 1.5, -2.35, scene);
  rb(5.64, 0.95, 0.22, 0.05, clay("#BDEBD8", 0.8), 0, PT + 0.48, -2.33, scene);
  // sign board
  const signG = new THREE.Group(); signG.position.set(0, PT + 2.62, -2.2); scene.add(signG);
  rb(3.3, 0.62, 0.12, 0.06, candy(P.lilac, 0.4), 0, 0, 0, signG);
  const signT = board(3.1, 0.5, 1240, 200, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#ffffff"; g.font = `800 112px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(255,141,182,.9)"; g.shadowBlur = 18; g.fillText("ANDY CAPP'S TAVERN", w / 2, h / 2 + 6); }, false);
  signT.position.z = 0.065; signG.add(signT);
  // chalkboard with AUDIRA
  const chalk = board(1.3, 0.95, 520, 380, (g, w, h) => { g.fillStyle = "#4F6E64"; rrect(g, 0, 0, w, h, 30); g.fill(); g.strokeStyle = "#E3A574"; g.lineWidth = 18; rrect(g, 9, 9, w - 18, h - 18, 24); g.stroke(); g.fillStyle = "rgba(255,255,255,.92)"; g.textAlign = "center"; g.font = `700 52px ${FONT}`; g.fillText("MALAM INI", w / 2, 92); g.font = `800 96px ${FONT}`; g.fillStyle = "#FFD96A"; g.fillText("PONG!", w / 2, 200); g.font = `800 50px ${FONT}`; g.fillStyle = "#FFB8D2"; g.fillText("~ AUDIRA ~", w / 2, 300); });
  chalk.position.set(1.85, PT + 1.72, -2.25); chalk.castShadow = false; scene.add(chalk);
  // bar counter, shelf, bottles, telephone, stools
  rb(1.9, 1.02, 0.52, 0.06, clay(P.wood, 0.7), -1.85, PT + 0.51, -1.85, scene);
  rb(2.0, 0.07, 0.6, 0.03, candy(P.cream, 0.4), -1.85, PT + 1.05, -1.85, scene);
  rb(1.8, 0.06, 0.24, 0.02, clay(P.woodD), -1.85, PT + 1.95, -2.18, scene);
  for (let i = 0; i < 6; i++) { const bc = [P.mint, P.pink, P.sky, P.butter, P.lilac, P.peach][i]; const bx = -2.55 + i * 0.28; cy(0.055, 0.06, 0.24, candy(bc, 0.2, { transmission: 0 }), bx, PT + 2.1, -2.18, scene, 16); cy(0.022, 0.03, 0.08, candy(bc, 0.2), bx, PT + 2.26, -2.18, scene, 10); }
  for (const sx of [-2.5, -1.6]) { cy(0.2, 0.2, 0.07, candy(P.pink, 0.4), sx, PT + 0.72, -1.25, scene); cy(0.035, 0.05, 0.68, candy(P.ink, 0.3, { metalness: 0.4 }), sx, PT + 0.36, -1.25, scene, 12); }
  const phone = new THREE.Group(); phone.position.set(-2.55, PT + 1.09, -1.8); scene.add(phone);
  rb(0.26, 0.1, 0.2, 0.04, candy(P.red, 0.35), 0, 0.05, 0, phone);
  const hand = rb(0.3, 0.06, 0.08, 0.03, candy(P.red, 0.35), 0, 0.14, 0, phone);
  const ringM = new THREE.MeshBasicMaterial({ color: P.red, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const rings = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 8, 40), ringM.clone()); m.position.set(-2.55, PT + 1.25, -1.8); scene.add(m); return m; });
  // jukebox (generic)
  const juke = new THREE.Group(); juke.position.set(-1.4, PT, -1.0); juke.rotation.y = 0.32; scene.add(juke);
  rb(0.9, 1.15, 0.55, 0.07, candy(P.pink, 0.35), 0, 0.575, 0, juke);
  const archGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.55, 40, 1, false, PI / 2, PI); archGeo.rotateX(PI / 2);
  mesh(archGeo, candy(P.pink, 0.35), 0, 1.15, 0, juke);
  const glowM = candy(P.butter, 0.3, { emissive: new THREE.Color(P.butter), emissiveIntensity: 0.6 });
  const archGlow = mesh(new THREE.TorusGeometry(0.36, 0.045, 12, 40, PI), glowM, 0, 1.15, 0.29, juke);
  rb(0.6, 0.4, 0.04, 0.03, candy(P.mint, 0.3, { emissive: new THREE.Color(P.mint), emissiveIntensity: 0.35 }), 0, 0.95, 0.28, juke);
  for (let i = 0; i < 5; i++) rb(0.62, 0.035, 0.03, 0.012, candy(P.cream, 0.4), 0, 0.3 + i * 0.08, 0.285, juke);
  // pinball (generic): sloped table, legs, backbox, light dots
  function pinball(parent, s = 1) {
    const G = new THREE.Group(); G.scale.setScalar(s); parent.add(G);
    const tb = new THREE.Group(); tb.position.y = 0.82; tb.rotation.x = 0.1; G.add(tb);
    rb(0.66, 0.2, 1.3, 0.05, candy(P.lilac, 0.35), 0, 0, 0, tb);
    const pf = board(0.56, 1.18, 200, 420, (g, w, h) => { g.fillStyle = "#2E2A4A"; g.fillRect(0, 0, w, h); const cs = ["#FF8DB6", "#FFD96A", "#6FD8B0", "#7FC0F5"]; [[60, 90], [140, 120], [100, 190], [50, 260], [150, 290]].forEach(([x, y], i) => { g.fillStyle = cs[i % 4]; g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.arc(x - 7, y - 7, 7, 0, 7); g.fill(); }); g.strokeStyle = "#FFD96A"; g.lineWidth = 8; g.beginPath(); g.moveTo(40, 380); g.lineTo(90, 400); g.moveTo(160, 380); g.lineTo(110, 400); g.stroke(); }, false);
    pf.rotation.x = -PI / 2; pf.position.y = 0.102; tb.add(pf);
    for (const [lx, lz] of [[-0.27, -0.55], [0.27, -0.55], [-0.27, 0.55], [0.27, 0.55]]) cy(0.03, 0.03, 0.78, candy(P.ink, 0.3, { metalness: 0.5 }), lx, 0.39, lz, G, 12);
    rb(0.68, 0.62, 0.14, 0.05, candy(P.butter, 0.35), 0, 1.25, -0.62, G);
    const bb = board(0.56, 0.46, 240, 200, (g, w, h) => { g.fillStyle = "#FF8DB6"; rrect(g, 0, 0, w, h, 24); g.fill(); g.fillStyle = "#fff"; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(30 + i * 30, 30, 9, 0, 7); g.fill(); } g.fillStyle = "#4B3F5C"; g.beginPath(); g.arc(w / 2, 120, 46, 0, 7); g.fill(); g.fillStyle = "#FFD96A"; g.beginPath(); g.arc(w / 2, 120, 26, 0, 7); g.fill(); }, false);
    bb.position.set(0, 1.25, -0.548); G.add(bb);
    return G;
  }
  const pinG = new THREE.Group(); pinG.position.set(1.45, PT, -0.8); pinG.rotation.y = -0.38; scene.add(pinG); pinball(pinG);
  // pendant lamp over the cabinet
  cy(0.006, 0.006, 1.2, clay(P.ink), CAB.x, PT + 3.4, CAB.z + 0.3, scene, 6);
  mesh(new THREE.ConeGeometry(0.26, 0.24, 32, 1, true), candy(P.mint, 0.4, { side: THREE.DoubleSide }), CAB.x, PT + 2.85, CAB.z + 0.3, scene);
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xfff1d0, toneMapped: false });
  sp(0.07, bulbM, CAB.x, PT + 2.75, CAB.z + 0.3, scene).castShadow = false;

  // ---- Pong-like screen (own drawing: two paddles, ball, dashed net)
  const scrC = document.createElement("canvas"); scrC.width = 320; scrC.height = 240;
  const scrT = new THREE.CanvasTexture(scrC); scrT.colorSpace = THREE.SRGBColorSpace;
  const tri = (x) => 1 - Math.abs(2 * fr(x) - 1);
  const ballY = (t) => 22 + 186 * tri(t / 2.3 + 0.3);
  function drawScreen(g, t, noise) {
    g.fillStyle = "#0e0c14"; g.fillRect(0, 0, 320, 240);
    if (noise) { const rr = mulberry(Math.floor(t * 20) + 7); for (let y = 0; y < 240; y += 8) for (let x = 0; x < 320; x += 8) { const v = Math.floor(rr() * 200); g.fillStyle = `rgb(${v},${v},${v + 10})`; g.fillRect(x, y, 8, 8); } return; }
    g.fillStyle = "#F4F1FF";
    for (let y = 6; y < 240; y += 22) g.fillRect(158, y, 4, 12);
    const bx = 34 + 244 * tri(t / 1.6), by = ballY(t);
    const ly = Math.min(186, Math.max(8, ballY(t - 0.16) - 22)), ry = Math.min(186, Math.max(8, ballY(t - 0.1) - 22));
    g.fillRect(20, ly, 9, 46); g.fillRect(291, ry, 9, 46); g.fillRect(bx - 5, by - 5, 10, 10);
    g.font = "700 40px monospace"; g.textAlign = "center"; g.fillText(String(Math.floor(t / 7) % 10), 110, 44); g.fillText(String(Math.floor(t / 9 + 3) % 10), 210, 44);
  }
  drawScreen(scrC.getContext("2d"), 2.0, false);
  const staticScr = canvasTex(320, 240, (g) => drawScreen(g, 3.3, false));

  // ---- the cabinet (generic wooden arcade cabinet)
  const grainT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = P.wood; g.fillRect(0, 0, w, h); const rr = mulberry(77); for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(160,96,58,${0.08 + rr() * 0.12})`; g.lineWidth = 2 + rr() * 5; g.beginPath(); const x = rr() * w; g.moveTo(x, 0); g.bezierCurveTo(x + 12, h * 0.3, x - 12, h * 0.6, x + 6, h); g.stroke(); } }, [1, 1]);
  const woodM = new THREE.MeshPhysicalMaterial({ map: grainT, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const faceTex = (txt, gold) => canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w * 0.4, w * 0.38, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, gold ? "#FFF2B8" : "#FFFFFF"); gr.addColorStop(1, gold ? "#E7B53E" : "#B9B3C9");
    g.fillStyle = gr; g.fillRect(0, 0, w, w); g.strokeStyle = gold ? "rgba(150,100,20,.55)" : "rgba(90,80,110,.45)"; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 14, 0, 7); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 30, 0, 7); g.stroke();
    g.fillStyle = gold ? "rgba(120,78,10,.85)" : "rgba(80,70,100,.55)"; g.textAlign = "center"; g.textBaseline = "middle";
    if (gold) { g.font = `800 50px ${FONT}`; g.fillText(txt, w / 2, w / 2 + 2); g.font = `700 24px ${FONT}`; g.fillText("PONG · 1972", w / 2, w / 2 + 50); } else { g.font = `800 64px ${FONT}`; g.fillText(txt, w / 2, w / 2 + 4); }
  });
  function makeCab(full) {
    const G = new THREE.Group();
    rb(0.7, 1.5, 0.62, 0.045, woodM, 0, 0.75, 0, G);
    rb(0.64, 0.7, 0.03, 0.012, candy(P.butter, 0.4), 0, 0.42, 0.31, G);
    const lid = rb(0.74, 0.07, 0.66, 0.03, candy(P.butter, 0.4), 0, 1.52, 0, G);
    rb(0.58, 0.48, 0.05, 0.03, candy(P.ink, 0.35), 0, 1.15, 0.305, G);
    mesh(new THREE.PlaneGeometry(0.47, 0.36), new THREE.MeshBasicMaterial({ color: 0x121018 }), 0, 1.15, 0.332, G, false);
    const tvG = new THREE.Group(); tvG.position.set(0, 1.15, 0); G.add(tvG);
    rb(0.52, 0.42, 0.5, 0.06, candy(P.cream, 0.4), 0, 0, 0.06, tvG);
    rb(0.5, 0.06, 0.04, 0.02, candy(P.ink, 0.4), 0, -0.24, 0.3, tvG).visible = false;
    const scr = mesh(new THREE.PlaneGeometry(0.45, 0.34), new THREE.MeshBasicMaterial({ map: full ? scrT : staticScr, toneMapped: false }), 0, 0, 0.336, tvG, false);
    const ledge = rb(0.66, 0.07, 0.2, 0.03, candy(P.butter, 0.4), 0, 0.86, 0.38, G); ledge.rotation.x = 0.2;
    for (const kx of [-0.18, 0.18]) { cy(0.038, 0.042, 0.06, candy("#FFFFFF", 0.3), kx, 0.92, 0.4, G, 20); }
    // coin housing (open box) + hinged door
    const hous = candy(P.butter, 0.4);
    rb(0.38, 0.025, 0.17, 0.01, hous, 0, 0.61, 0.395, G); rb(0.38, 0.025, 0.17, 0.01, hous, 0, 0.235, 0.395, G);
    rb(0.025, 0.4, 0.17, 0.01, hous, -0.18, 0.42, 0.395, G); rb(0.025, 0.4, 0.17, 0.01, hous, 0.18, 0.42, 0.395, G);
    mesh(new THREE.PlaneGeometry(0.34, 0.36), clay("#3A2F45", 0.9), 0, 0.42, 0.33, G, false);
    const door = new THREE.Group(); door.position.set(-0.18, 0.42, 0.485); G.add(door);
    rb(0.37, 0.39, 0.022, 0.012, candy("#D9D2E8", 0.3, { metalness: 0.55 }), 0.185, 0, 0, door);
    rb(0.11, 0.03, 0.012, 0.005, candy(P.ink, 0.4), 0.185, 0.08, 0.012, door);
    const q = pill("25¢", { bg: P.red, fg: "#fff", h: 0.07 }); q.position.set(0.185, -0.06, 0.016); door.add(q);
    // marquee icon: two paddles and a ball, no logo
    const mq = board(0.56, 0.16, 280, 80, (g, w, h) => { g.fillStyle = "#4B3F5C"; rrect(g, 0, 0, w, h, 20); g.fill(); g.fillStyle = "#fff"; g.fillRect(30, 18, 10, 44); g.fillRect(w - 40, 18, 10, 44); g.fillRect(w / 2 + 16, 34, 12, 12); for (let x = 60; x < w - 60; x += 24) g.fillRect(x, 39, 10, 3); }, false);
    mq.position.set(0, 1.44, 0.312); G.add(mq);
    return { G, door, lid, tvG, scr };
  }
  const cab = makeCab(true); scene.add(cab.G);
  const tag75 = pill("$75", { bg: P.butter, fg: P.ink, h: 0.16, border: "#ffffff" }); cab.tvG.add(tag75); tag75.position.set(0.42, 0.18, 0.2);

  // ---- people
  const B = person({ shirt: P.sky, pants: "#6C6390", hair: "#6A4B37" });
  const L = person({ shirt: P.mint, pants: "#5D6C8F", hair: "#3E3128", skin: "#E8B892" });
  scene.add(B.G, L.G);
  const plateB = pill("NOLAN BUSHNELL", { h: 0.21, dot: P.sky }), plateL = pill("ALLAN ALCORN", { h: 0.21, dot: P.mint });
  scene.add(plateB, plateL);
  const crowdCols = [[P.pink, "#6C6390"], [P.butter, "#5D6C8F"], [P.lilac, "#6C6390"], [P.peach, "#4F6E64"], [P.sky, "#7A5C70"], ["#FFB8D2", "#5D6C8F"], [P.mint, "#7A5C70"], ["#C9BBEE", "#4F6E64"], ["#FFE08A", "#6C6390"], ["#9FD9F0", "#7A5C70"]];
  const skins = ["#F1C7A5", "#D9A27C", "#C68A64", "#F4D2B8", "#B57C58"];
  const hairs = ["#3E3128", "#6A4B37", "#2E2A33", "#8A5A3A", "#4B3F5C"];
  const crowd = crowdCols.map(([s, p], i) => {
    const f = person({ shirt: s, pants: p, skin: skins[i % 5], hair: hairs[(i * 2) % 5] }); scene.add(f.G);
    const th = i === 0 ? PI : -1.3 + (i - 1) * (2.6 / 8), rr = i === 0 ? 0.85 : 1.45 + 0.35 * (i % 2);
    const x = CAB.x + Math.sin(th) * rr, z = CAB.z + Math.cos(th) * rr;
    const yaw = Math.atan2(CAB.x - x, CAB.z - z);
    return { f, x: i === 0 ? CAB.x + 0.05 : x, z: i === 0 ? CAB.z + 0.9 : z, yaw: i === 0 ? PI : yaw, i };
  });
  crowd[0].z = CAB.z + 0.82;

  // ---- coins
  const coinGeo = new THREE.CylinderGeometry(COIN.R, COIN.R, COIN.H, 30);
  const sideM = new THREE.MeshPhysicalMaterial({ color: 0xf3eff9, metalness: 0.55, roughness: 0.24, clearcoat: 0.7 });
  const faceM = new THREE.MeshPhysicalMaterial({ map: faceTex("25", false), metalness: 0.45, roughness: 0.26, clearcoat: 0.7 });
  const mkInst = (n) => { const m = new THREE.InstancedMesh(coinGeo, [sideM, faceM, faceM], n); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; };
  const I1 = mkInst(S.N1), I2 = mkInst(S.N2);
  const dummy = new THREE.Object3D();
  const mouth = new THREE.Vector3(CAB.x, PT + 0.42, CAB.z + 0.5);
  const heap = (k, N, Rm, Hm, seed) => {
    const s = Math.cbrt((k + 1) / N), ang = PI * (-0.12 + 1.24 * fr(k * 0.618034 + seed));
    let rr = Rm * s * Math.sqrt(fr(k * 0.754877 + seed)); if (fr(k * 0.31 + seed) < 0.14) rr = Rm * s * (1 + 0.35 * fr(k * 0.53));
    const y = PT + COIN.H / 2 + Math.max(0, Hm * s * (1 - rr / (Rm * s)));
    return [CAB.x + Math.cos(ang) * rr * 1.15, y, CAB.z + 0.52 + Math.sin(ang) * rr, (fr(k * 0.91) - 0.5) * 0.5, (fr(k * 0.37) - 0.5) * 0.5, k * 1.3];
  };
  const H1 = Array.from({ length: S.N1 }, (_, k) => heap(k, S.N1, 0.8, 0.16, 0.11));
  const H2 = Array.from({ length: S.N2 }, (_, k) => k < S.NB
    ? [CAB.x - 0.11 + 0.22 * fr(k * 0.618), PT + 0.255 + (k / S.NB) * 0.31, CAB.z + 0.36 + 0.1 * fr(k * 0.414), (fr(k * 0.7) - 0.5) * 1.1, (fr(k * 0.29) - 0.5) * 1.1, k]
    : heap(k - S.NB, S.N2 - S.NB, 1.2, 0.36, 0.47));
  const stackPos = (c, h) => [CAB.x + (c - 3) * 0.15, PT + COIN.H / 2 + h * COIN.H, CAB.z + 1.0];
  // flight from a to b: straight in xz, arc in y, tumble that ends flat on the mark, tiny damped settle
  const fly = (o, a, b, u, arcH, spin) => {
    const e = u, ee = eout(u);
    o.position.set(a[0] + (b[0] - a[0]) * ee, a[1] + (b[1] - a[1]) * e + arcH * 4 * e * (1 - e), a[2] + (b[2] - a[2]) * ee);
    o.rotation.set(b[3] + (1 - ee) * spin, b[5], b[4] + (1 - ee) * spin * 0.4);
  };
  const settle = (v) => (v > 0 && v < 0.6 ? 0.03 * Math.exp(-7 * v) * Math.abs(Math.sin(15 * v)) : 0);
  const mouthArr = [mouth.x, mouth.y, mouth.z];
  const heroM = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.032, 48), [new THREE.MeshPhysicalMaterial({ color: 0xf0c457, metalness: 0.9, roughness: 0.25, clearcoat: 0.6 }), new THREE.MeshPhysicalMaterial({ map: faceTex("AUDIRA", true), metalness: 0.6, roughness: 0.3, clearcoat: 0.7 }), new THREE.MeshPhysicalMaterial({ color: 0xf0c457, metalness: 0.9, roughness: 0.3 })]);
  heroM.castShadow = true; scene.add(heroM);

  // =========================== STATION 1: decision + own factory ===========================
  plinth(X1, -0.3, 3.2, "#C9EEDF");
  const belt = new THREE.Group(); belt.position.set(X1, PT, -0.55); scene.add(belt);
  rb(4.4, 0.46, 0.8, 0.08, candy(P.lilac, 0.4), 0, 0.23, 0, belt);
  const beltT = canvasTex(128, 64, (g, w, h) => { g.fillStyle = "#6FD8B0"; g.fillRect(0, 0, w, h); g.fillStyle = "#58C49D"; g.fillRect(0, 0, 18, h); }, [14, 1]);
  const beltTop = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.66), new THREE.MeshStandardMaterial({ map: beltT, roughness: 0.6 })); beltTop.rotation.x = -PI / 2; beltTop.position.y = 0.465; beltTop.receiveShadow = true; belt.add(beltTop);
  for (let i = 0; i < 9; i++) { const rl = cy(0.09, 0.09, 0.84, candy(P.butter, 0.35), -2.0 + i * 0.5, 0.23, 0, belt, 20); rl.rotation.x = PI / 2; }
  const minis = Array.from({ length: 7 }, () => { const c = makeCab(false); c.G.scale.setScalar(0.62); scene.add(c.G); return c; });
  const prodSign = new THREE.Group(); prodSign.position.set(X1, PT + 0.24, -0.1); scene.add(prodSign);
  rb(2.6, 0.42, 0.06, 0.03, candy(P.pink, 0.4), 0, 0, 0, prodSign);
  const ps = board(2.45, 0.36, 1220, 200, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = `800 120px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PRODUKSI SENDIRI", w / 2, h / 2 + 6); }, false);
  ps.position.z = 0.035; prodSign.add(ps);
  // licence document and "another company"
  const docG = new THREE.Group(); scene.add(docG);
  const doc = board(0.62, 0.82, 310, 410, (g, w, h) => { g.fillStyle = "#FFFDF8"; rrect(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = "#4B3F5C"; g.textAlign = "center"; g.font = `800 40px ${FONT}`; g.fillText("LISENSI", w / 2, 70); g.font = `800 52px ${FONT}`; g.fillStyle = "#A98BF0"; g.fillText("PONG", w / 2, 130); g.fillStyle = "rgba(75,63,92,.25)"; for (let i = 0; i < 6; i++) g.fillRect(40, 175 + i * 32, w - 80 - (i % 2) * 50, 10); g.fillStyle = "#FF8DB6"; g.beginPath(); g.arc(w - 70, h - 60, 30, 0, 7); g.fill(); });
  doc.castShadow = true; docG.add(doc);
  const batal = pill("BATAL", { bg: P.red, fg: "#fff", h: 0.17 }); batal.position.set(0, -0.05, 0.02); batal.rotation.z = -0.18; docG.add(batal);
  const stand = rb(0.4, 0.06, 0.25, 0.02, candy(P.ink, 0.4), 0, -0.44, -0.05, docG);
  const other = new THREE.Group(); other.position.set(X1 + 1.3, PT, 1.05); scene.add(other);
  rb(1.0, 1.1, 0.75, 0.08, clay("#C9C3D9", 0.7), 0, 0.55, 0, other);
  rb(1.1, 0.12, 0.85, 0.05, clay("#ADA5C2", 0.7), 0, 1.15, 0, other);
  for (let i = 0; i < 3; i++) rb(0.2, 0.24, 0.03, 0.02, candy(P.sky, 0.2), -0.3 + i * 0.3, 0.72, 0.38, other);
  const otherSign = pill("PERUSAHAAN LAIN", { bg: "#ffffff", fg: P.ink, h: 0.15 }); otherSign.position.set(0, 1.38, 0.2); other.add(otherSign);
  const bulbG = new THREE.Group(); scene.add(bulbG);
  sp(0.13, new THREE.MeshPhysicalMaterial({ color: 0xfff3b0, emissive: new THREE.Color(0xffd96a), emissiveIntensity: 1.1, roughness: 0.2, clearcoat: 1 }), 0, 0, 0, bulbG).castShadow = false;
  cy(0.06, 0.05, 0.1, candy("#CFC8DE", 0.3, { metalness: 0.6 }), 0, -0.15, 0, bulbG, 16);

  // =========================== STATION 2: the bank ===========================
  plinth(X2, -0.4, 3.2, "#D6DAF4");
  const colM = candy("#FFFDF8", 0.45);
  rb(4.4, 0.18, 1.3, 0.05, colM, X2, PT + 0.09, -1.75, scene);
  rb(4.1, 2.2, 0.2, 0.06, clay("#DCD3F5", 0.8), X2, PT + 1.2, -2.25, scene);
  for (const cx of [-1.6, -0.55, 0.55, 1.6]) { cy(0.17, 0.19, 1.95, colM, X2 + cx, PT + 1.15, -1.6, scene, 24); rb(0.46, 0.1, 0.46, 0.03, colM, X2 + cx, PT + 2.16, -1.6, scene); }
  rb(4.3, 0.34, 0.9, 0.06, colM, X2, PT + 2.37, -1.7, scene);
  const ped = new THREE.Shape(); ped.moveTo(-2.15, 0); ped.lineTo(2.15, 0); ped.lineTo(0, 0.75); ped.closePath();
  const pedG = new THREE.ExtrudeGeometry(ped, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }); pedG.translate(0, 0, -0.25);
  mesh(pedG, candy(P.sky, 0.45), X2, PT + 2.55, -1.8, scene);
  const bankSign = board(1.6, 0.3, 640, 120, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#4B3F5C"; g.font = `800 100px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BANK", w / 2, h / 2 + 6); }, false);
  bankSign.position.set(X2, PT + 2.37, -1.24); scene.add(bankSign);
  rb(2.6, 0.95, 0.62, 0.07, candy(P.sky, 0.4), X2, PT + 0.475, -0.15, scene);
  rb(2.72, 0.07, 0.72, 0.03, candy(P.butter, 0.4), X2, PT + 0.985, -0.15, scene);
  // lectern with the loan form, rubber stamp works along the lectern normal
  const lec = new THREE.Group(); lec.position.set(X2 - 0.35, PT + 1.36, 0.02); lec.rotation.x = -0.95; scene.add(lec);
  rb(0.62, 0.78, 0.05, 0.03, candy(P.woodD, 0.5), 0, 0, -0.03, lec);
  const formTex = canvasTex(300, 380, (g, w, h) => { g.fillStyle = "#FFFDF8"; rrect(g, 0, 0, w, h, 22); g.fill(); g.fillStyle = "#4B3F5C"; g.textAlign = "center"; g.font = `800 34px ${FONT}`; g.fillText("PERMOHONAN", w / 2, 60); g.fillText("PINJAMAN", w / 2, 100); g.fillStyle = "rgba(75,63,92,.25)"; for (let i = 0; i < 6; i++) g.fillRect(36, 140 + i * 34, w - 72 - (i % 3) * 40, 10); });
  const form1 = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.66), new THREE.MeshStandardMaterial({ map: formTex, roughness: 0.7 })), form2 = form1.clone();
  form1.position.z = 0.005; form2.position.z = 0.006; lec.add(form1, form2);
  const mark1 = pill("DITOLAK", { bg: "rgba(255,255,255,0.85)", fg: P.red, h: 0.17, border: P.red }), mark2 = pill("KREDIT", { bg: "rgba(255,255,255,0.85)", fg: "#2FB98A", h: 0.19, border: "#2FB98A" });
  mark1.rotation.z = 0.2; mark2.rotation.z = -0.16; form1.add(mark1); form2.add(mark2); mark1.position.set(0, 0.02, 0.004); mark2.position.set(0, 0.0, 0.004);
  const stamp = new THREE.Group(); lec.add(stamp);
  const stampBaseM = candy(P.red, 0.4);
  rb(0.3, 0.2, 0.08, 0.03, stampBaseM, 0, 0, 0.04, stamp).rotation.x = 0;
  const sh1 = cy(0.04, 0.05, 0.18, candy(P.cream, 0.35), 0, 0, 0.17, stamp, 18); sh1.rotation.x = PI / 2;
  sp(0.085, candy(P.cream, 0.35), 0, 0, 0.29, stamp);
  // mafia stigma icon: mini pinball + fedora silhouette
  const mafG = new THREE.Group(); mafG.position.set(X2 + 1.95, PT, 0.45); mafG.rotation.y = -0.5; scene.add(mafG);
  const miniPin = pinball(mafG, 0.55);
  const fedPts = [[0, 0], [0.34, 0], [0.36, 0.02], [0.2, 0.03], [0.17, 0.05], [0.16, 0.2], [0.1, 0.24], [0.03, 0.2], [0, 0.21]].map(([x, y]) => new THREE.Vector2(x, y));
  const fedora = mesh(new THREE.LatheGeometry(fedPts, 40), candy(P.ink, 0.55), 0, 0, 0, scene);
  const band = mesh(new THREE.CylinderGeometry(0.168, 0.172, 0.04, 40, 1, true), candy(P.red, 0.4, { side: THREE.DoubleSide }), 0, 0.07, 0, fedora);
  const mafRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 8, 60), new THREE.MeshBasicMaterial({ color: P.red, transparent: true, opacity: 0, toneMapped: false })); mafRing.rotation.x = -PI / 2; scene.add(mafRing);

  // ---- billboard tags
  const tags = [];
  const tag = (m, wins, pos) => { scene.add(m); tags.push({ m, wins, pos }); };
  tag(pill("JUKEBOX", { h: 0.17, dot: P.pink }), [[A("s3:jukebox") - 0.1, A("s3:Permainannya")]], () => [-1.4, PT + 1.9, -1.0]);
  tag(pill("PINBALL", { h: 0.17, dot: P.lilac }), [[A("s3:pinball") - 0.1, A("s3:Permainannya")]], () => [1.45, PT + 1.85, -0.85]);
  tag(pill("DICAP DEKAT MAFIA", { h: 0.15, bg: P.ink, fg: "#fff" }), [[A("s7:mafia") - 0.2, A("s7:Tapi") + 0.3]], () => [X2 + 1.95, PT + 1.4, 0.45]);
  tag(pill("KOIN 25 SEN", { h: 0.15, bg: P.butter, dot: P.red }), [[A("s5:koin") - 0.1, K.s5e + 0.2]], () => [CAB.x + 0.85, 1.25, CAB.z + 0.9]);

  // ---- foreground blurred DOM blobs (parallax with the camera)
  const fgs = [...document.querySelectorAll(".fg")].map((e) => ({ e, k: +e.dataset.k, x: +e.dataset.x }));

  // ---- timing
  const tR0 = S.tR0, tR1 = S.tR1;
  const cS = A("s2:Dua"), cE = A("s2:menaruh") + 0.5, START_X = 5.6;
  const cabX = (t) => {
    if (t < tR0) return 0;
    if (t < cS) return START_X * smooth((t - tR0 - 0.15) / 1.3);
    if (t < cE) { const u = clamp01((t - cS) / (cE - cS)); return START_X * (1 - (0.5 - 0.5 * Math.cos(PI * u))); }
    return 0;
  };
  const yOn = (x, z, cx, cz, R) => PT * (1 - ramp(Math.hypot(x - cx, z - cz), R - 0.15, R + 0.05));
  const tvT = A("s3:televisi"), tvIn = A("s3:dimasukkan");
  const nightT = (t) => ramp(t, K.s4 - 0.4, K.s4 + 0.9) * (1 - ramp(t, A("s5:Lalu"), A("s5:Lalu") + 1.2));
  const doorOpen = (t) => (t < tR0 ? 1 : t < K.s5 ? 1 - smooth((t - tR0) / 0.6) : back(clamp01((t - A("s5:dibuka") + 0.15) / 0.5), 1.2));
  const noiseOn = (t) => (t >= A("s1:rusak") && t < tR0 + 0.3) || (t >= A("s5:bermasalah") - 0.15 && t < K.s6);

  // camera: orbit helper; every key is a scene/word anchor
  const D2R = PI / 180;
  const O = (t, tx, ty, tz, d, az, el) => [t, tx + d * Math.cos(el * D2R) * Math.sin(az * D2R), ty + d * Math.sin(el * D2R), tz + d * Math.cos(el * D2R) * Math.cos(az * D2R), tx, ty, tz];
  const scrW = [CAB.x, 1.15, CAB.z + 0.34];
  const camT = track([
    O(0, 0, 0.62, 0.15, 5.4, 28, 24), O(K.s1e - 0.2, 0, 0.62, 0.15, 4.9, 20, 26),
    O(K.s1e + 1.3, 5.3, 0.9, -0.2, 8.0, 18, 22), O(A("s2:perusahaan"), 5.0, 0.9, -0.25, 8.2, 18, 22), O(A("s2:Nolan"), 2.1, 0.9, -0.3, 8.6, 17, 22), O(cE, 0.6, 0.95, -0.4, 9.2, 15, 21), O(A("s2:Andy"), 0, 1.45, -0.9, 11, 8, 16), O(K.s2e, 0, 1.4, -0.9, 10.6, 10, 17),
    O(A("s3:Alcorn"), 0, 1.55, -0.25, 6.8, 26, 24), O(tvIn, 0, 1.45, -0.25, 6.2, 22, 23), O(A("s3:Mesinnya"), 0, 1.0, -0.6, 8.6, -10, 20), O(A("s3:pinball") + 0.2, 0, 1.0, -0.6, 8.3, -14, 20),
    O(A("s3:sederhana"), scrW[0], scrW[1] + 0.12, scrW[2], 2.0, 4, 6), O(K.s3e, scrW[0], scrW[1] + 0.11, scrW[2], 1.85, 2, 5),
    O(K.s4 + 0.6, 0, 0.95, 0.35, 8.6, 32, 28), O(K.s4e, 0, 0.95, 0.35, 9.3, 44, 30),
    O(A("s5:bermasalah"), 0.2, 0.95, -0.4, 6.4, 22, 22), O(A("s5:menelepon") + 0.4, -1.9, 1.15, -1.5, 7.4, -24, 26), O(A("s5:memperbaikinya") + 0.2, -0.3, 1.35, 0.2, 8.0, 18, 22), O(A("s5:dibuka"), -0.2, 0.9, 0.2, 5.8, 22, 26), O(A("s5:ketemu"), -0.1, 0.7, 0.3, 4.8, 24, 30),
    O(A("s5:meluap") + 0.3, 0, 0.4, 0.55, 5.3, 30, 34), O(K.s5e, 0, 0.4, 0.55, 5.8, 36, 34),
    O(K.s6 + 1.0, X1 - 1.0, 1.05, 0.3, 9.6, 18, 24), O(A("s6:menjual"), X1 - 0.5, 1.0, 0.4, 10.6, 14, 23), O(A("s6:Mereka"), X1 + 0.6, 0.9, 0.1, 9.4, 20, 24), O(K.s6e, X1 + 0.5, 0.9, 0, 8.4, 26, 26),
    O(K.s7 + 0.6, X2, 1.15, -0.2, 7.0, 16, 22), O(A("s7:pinjaman"), X2 - 0.3, 1.2, -0.1, 4.6, 12, 26), O(A("s7:pinball"), X2 + 1.6, 1.0, 0.2, 5.6, 20, 22), O(A("s7:Tapi"), X2 + 1.4, 1.0, 0.2, 5.4, 22, 22),
    O(A("s7:kredit"), X2 - 0.3, 1.2, -0.1, 4.6, 12, 26), O(A("s7:November"), X2, 1.15, -0.1, 6.3, 18, 22), O(K.s7e, X2, 1.15, -0.1, 6.8, 20, 22),
    O(K.s8 + 1.0, 0, 0.55, 0.65, 4.6, 26, 34), O(A("s8:Kalau"), -0.15, 0.6, 0.65, 4.3, 32, 36), O(A("s8:AUDIRA"), -0.15, 0.6, 0.6, 4.6, 36, 34), O(K.dur, -0.15, 0.62, 0.6, 4.9, 40, 33),
  ]);
  const cW = new THREE.Color(1, 1, 1), cN = new THREE.Color("#A79FD8"), bgD = new THREE.Color(0xe8d3dc), bgN = new THREE.Color(0x9c8fc8);
  const sctx = scrC.getContext("2d");

  return (t) => {
    const p = camT(t); cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]);
    const n = nightT(t);
    key.position.set(p[3] - 3.6, 7.2, p[5] + 4.6); key.target.position.set(p[3], 0, p[5]); key.intensity = 2.7 * (1 - 0.55 * n);
    rim.position.set(p[3] + 2.5, 4.5, p[5] - 6); rim.target.position.set(p[3], 0.8, p[5]); rim.intensity = 1.7 + 0.6 * n;
    hemi.intensity = 1.05 * (1 - 0.45 * n); lampL.intensity = 1.2 + 5 * n;
    sweepM.color.copy(cW).lerp(cN, n); scene.background.copy(bgD).lerp(bgN, n);
    for (const f of fgs) { let x = f.x - cam.position.x * f.k * 110; x = ((x + 400) % 1880 + 1880) % 1880 - 400; f.e.style.transform = `translate3d(${x.toFixed(1)}px,${(Math.sin(t * 0.3 + f.k) * 14).toFixed(1)}px,0)`; }

    // screen
    drawScreen(sctx, t, noiseOn(t)); scrT.needsUpdate = true;

    // cabinet
    const cx = cabX(t), carrying = t >= cS && t < cE;
    const cu = carrying ? clamp01((t - cS) / (cE - cS)) : 0;
    cab.G.position.set(cx, yOn(cx, CAB.z, 0, -0.45, 3.5) + (carrying ? 0.1 * Math.sin(PI * cu) + 0.015 * Math.abs(Math.sin(cx * 6)) : 0), CAB.z);
    cab.door.rotation.y = -1.9 * doorOpen(t);
    const up = ramp(t, tvT - 0.35, tvT + 0.45) * (1 - ramp(t, tvIn - 0.1, tvIn + 0.5));
    cab.tvG.position.y = 1.15 + 0.72 * up - (t > tvIn + 0.5 ? 0.03 * Math.exp(-7 * (t - tvIn - 0.5)) * Math.sin(15 * (t - tvIn - 0.5)) : 0);
    cab.tvG.rotation.y = 0.25 * Math.sin(PI * up) * (t < tvIn ? 1 : 0.4);
    const lidO = ramp(t, tvT - 0.6, tvT - 0.2) * (1 - ramp(t, tvIn + 0.45, A("s3:kayu") + 0.3));
    cab.lid.position.set(0, 1.52 + 0.08 * lidO, -0.55 * lidO); cab.lid.rotation.x = -0.5 * lidO;
    const tg = back(clamp01((t - A("s3:seharga") + 0.1) / 0.35), 2) * (1 - ramp(t, tvIn + 0.2, tvIn + 0.5));
    tag75.visible = tg > 0.01; tag75.scale.setScalar(Math.max(0.01, tg)); tag75.quaternion.copy(cam.quaternion);

    // carriers, Bushnell, Alcorn
    const popIn = back(clamp01((t - A("s2:seribu")) / 0.4), 1.6);
    const afterCarry = (u, fromX, toX, toZ, yaw0, yaw1) => [fromX + (toX - fromX) * smooth(u), CAB.z + (toZ - CAB.z) * smooth(u), yaw0 + (yaw1 - yaw0) * smooth(u)];
    // Bushnell
    {
      let vis = 0, x = 0, z = 0, yaw = 0, kind = "stand", ph = 0, amt = 0;
      if (t >= A("s2:seribu") && t < K.s3 + 0.5) {
        vis = popIn * (1 - ramp(t, K.s3, K.s3 + 0.35));
        if (t < cE) { x = cx - 0.66; z = CAB.z; yaw = -PI / 2; kind = t >= cS ? "carry" : "stand"; ph = cx * 5.5; amt = t >= cS ? 1 : 0; if (t < cS) kind = "carry"; }
        else { const u = clamp01((t - cE) / 0.9); [x, z, yaw] = afterCarry(u, -0.66, -1.0, 0.75, -PI / 2, 0.45); ph = u * 8; amt = Math.sin(PI * u); }
      } else if (t >= K.s6 - 0.4 && t < K.s7) {
        vis = back(clamp01((t - K.s6 + 0.4) / 0.4), 1.5) * (1 - ramp(t, K.s7 - 0.3, K.s7)); x = X1 - 1.6; z = 0.95; yaw = 0.5;
        kind = t > A("s6:berubah") && t < A("s6:Atari") ? "think" : "stand"; amt = kind === "think" ? ramp(t, A("s6:berubah"), A("s6:berubah") + 0.3) * (1 - ramp(t, A("s6:Atari") - 0.3, A("s6:Atari"))) : 0;
        if (t > A("s6:memutuskan") - 0.2) { kind = "cheer"; amt = back(clamp01((t - A("s6:memutuskan") + 0.2) / 0.4)) * (1 - ramp(t, A("s6:sendiri") + 0.4, A("s6:sendiri") + 0.9)); }
      }
      B.G.visible = vis > 0.01; B.G.scale.setScalar(Math.max(0.01, vis));
      B.G.position.set(x, t >= K.s6 - 0.5 ? PT : yOn(x, z, 0, -0.45, 3.5), z); B.G.rotation.y = yaw; pose(B, kind, ph, amt);
      const pv = (t > A("s2:Nolan") - 0.1 && t < K.s2e ? back(clamp01((t - A("s2:Nolan") + 0.1) / 0.35), 1.8) * (1 - ramp(t, K.s2e - 0.3, K.s2e)) : 0) + (t > A("s6:Bushnell") - 0.1 && t < K.s6e ? back(clamp01((t - A("s6:Bushnell") + 0.1) / 0.35), 1.8) * (1 - ramp(t, K.s6e - 0.3, K.s6e)) : 0);
      plateB.visible = pv > 0.01 && B.G.visible; plateB.scale.setScalar(Math.max(0.01, pv)); plateB.position.set(x, B.G.position.y + 2.02, z); plateB.quaternion.copy(cam.quaternion);
      const bv = back(clamp01((t - A("s6:pikiran") + 0.25) / 0.35), 2) * (1 - ramp(t, A("s6:memutuskan") - 0.3, A("s6:memutuskan")));
      bulbG.visible = bv > 0.01; bulbG.scale.setScalar(Math.max(0.01, bv)); bulbG.position.set(x + 0.6, PT + 1.7 + 0.04 * Math.sin(t * 3), z); bulbG.rotation.z = 0.15 * Math.sin(t * 2);
    }
    // Alcorn
    {
      let vis = 0, x = 0, z = 0, yaw = 0, kind = "stand", ph = 0, amt = 0;
      if (t >= A("s2:seribu") && t < K.s3e) {
        vis = popIn * (1 - ramp(t, A("s3:Permainannya") - 0.4, A("s3:Permainannya")));
        if (t < cE) { x = cx + 0.66; z = CAB.z; yaw = -PI / 2; kind = "carry"; ph = cx * 5.5 + PI; amt = t >= cS ? 1 : 0; }
        else if (t < K.s3) { const u = clamp01((t - cE) / 0.9); [x, z, yaw] = afterCarry(u, 0.66, 1.05, 0.55, -PI / 2, -0.45); ph = u * 8; amt = Math.sin(PI * u); }
        else { const u = clamp01((t - K.s3) / 0.8); x = 1.05 + (-0.78 - 1.05) * smooth(u); z = 0.55 + (0.05 - 0.55) * smooth(u); yaw = -0.45 + (1.3 + 0.45) * smooth(u); ph = u * 6; amt = Math.sin(PI * u);
          if (t > tvT - 0.4 && t < tvIn + 0.6) { kind = "reach"; amt = ramp(t, tvT - 0.4, tvT) * (1 - ramp(t, tvIn + 0.2, tvIn + 0.6)); } }
      } else if (t >= A("s5:Alcorn") - 0.4 && t < K.s5e + 0.6) {
        vis = back(clamp01((t - A("s5:Alcorn") + 0.4) / 0.4), 1.5) * (1 - ramp(t, K.s5e + 0.2, K.s5e + 0.6));
        const u = clamp01((t - A("s5:Alcorn") + 0.3) / (A("s5:memperbaikinya") + 0.6 - A("s5:Alcorn") + 0.3));
        x = 0.5 + (-0.8 - 0.5) * smooth(u); z = 2.3 + (0.18 - 2.3) * smooth(u); yaw = u < 1 ? Math.atan2(-1.3, -2.1) : 1.9; ph = u * 10; amt = Math.sin(PI * u);
        if (u >= 1) { yaw = 1.9; const rr = ramp(t, A("s5:Saat") - 0.2, A("s5:dibuka")) * (1 - ramp(t, A("s5:masalahnya") + 0.2, A("s5:wadah"))); kind = "reach"; amt = rr; if (t > A("s5:meluap") - 0.2) { kind = "cheer"; amt = back(clamp01((t - A("s5:meluap") + 0.2) / 0.4)) * 0.8; } }
      }
      L.G.visible = vis > 0.01; L.G.scale.setScalar(Math.max(0.01, vis));
      L.G.position.set(x, yOn(x, z, 0, -0.45, 3.5), z); L.G.rotation.y = yaw; pose(L, kind, ph, amt);
      const win = (a, b) => (t > a && t < b ? back(clamp01((t - a) / 0.35), 1.8) * (1 - ramp(t, b - 0.3, b)) : 0);
      const pv = win(A("s2:Allan") - 0.1, K.s2e) + win(A("s3:Alcorn") - 0.1, A("s3:Mesinnya")) + win(A("s5:Alcorn") - 0.1, A("s5:Saat"));
      plateL.visible = pv > 0.01 && L.G.visible; plateL.scale.setScalar(Math.max(0.01, pv)); plateL.position.set(x, L.G.position.y + 1.97, z); plateL.quaternion.copy(cam.quaternion);
    }
    // crowd
    for (const c of crowd) {
      const tin = c.i < 4 ? A("s4:ramai") - 0.5 + c.i * 0.12 : A("s4:makin") - 0.2 + (c.i - 4) * 0.22;
      const tout = A("s5:Lalu") + 0.2 + c.i * 0.05;
      const v = back(clamp01((t - tin) / 0.4), 1.7) * (1 - ramp(t, tout, tout + 0.35));
      c.f.G.visible = v > 0.01; c.f.G.scale.setScalar(Math.max(0.01, v));
      c.f.G.position.set(c.x, PT, c.z); c.f.G.rotation.y = c.yaw;
      const ch = c.i === 0 ? 0 : ramp(t, tin + 0.2, tin + 0.5) * (1 - ramp(t, tin + 1.1, tin + 1.6));
      if (c.i === 0) { pose(c.f, "reach", 0, 0.75); c.f.AR.sh.rotation.x = -1.0; c.f.AL.sh.rotation.set(-1.0, 0, -0.1); }
      else pose(c.f, "cheer", 0, ch * (c.i % 2 ? 1 : 0.7));
    }
    // phone
    const ringOn = t > A("s5:menelepon") - 0.1 && t < A("s5:Alcorn") + 0.9;
    phone.rotation.z = ringOn ? 0.08 * Math.sin(t * 60) : 0; hand.position.y = 0.14 + (ringOn ? 0.015 * Math.abs(Math.sin(t * 30)) : 0);
    rings.forEach((m, i) => { const ph = fr((t - A("s5:menelepon")) * 1.6 + i * 0.5); m.visible = ringOn; m.scale.setScalar(0.6 + ph * 1.4); m.material.opacity = ringOn ? (1 - ph) * 0.8 : 0; m.quaternion.copy(cam.quaternion); });

    // coins: hook cascade (rewinds into the door)
    const tau = t < tR0 ? t : tR0 - (tR0 + 1.9) * smooth((t - tR0) / (tR1 - tR0));
    for (let i = 0; i < S.N1; i++) {
      const [t0, d] = S.c1[i], u = (tau - t0) / d;
      if (u <= 0) { dummy.position.copy(mouth); dummy.scale.setScalar(0.001); }
      else { dummy.scale.setScalar(1); const b = H1[i]; if (u < 1) fly(dummy, mouthArr, b, u, 0.22 + 0.1 * fr(i * 0.3), 7 * (fr(i * 0.77) - 0.5)); else { dummy.position.set(b[0], b[1] + settle(tau - t0 - d), b[2]); dummy.rotation.set(b[3], b[5], b[4]); } }
      dummy.updateMatrix(); I1.setMatrixAt(i, dummy.matrix);
    }
    I1.instanceMatrix.needsUpdate = true; I1.visible = t < tR1 + 0.05;
    // flood + s8 stacks
    for (let i = 0; i < S.N2; i++) {
      const [t0, d] = S.c2[i], [ts, ds, c, h] = S.st[i], b = H2[i];
      if (t < K.s5 - 0.5) { dummy.position.copy(mouth); dummy.scale.setScalar(0.001); }
      else if (t >= ts) { dummy.scale.setScalar(1); const sp2 = stackPos(c, h), u = (t - ts) / ds; const tgt = [sp2[0], sp2[1], sp2[2], 0, 0, i * 0.7]; if (u < 1) fly(dummy, b, tgt, u, 0.32, 5 * (fr(i * 0.41) - 0.5)); else { dummy.position.set(sp2[0], sp2[1] + settle(t - ts - ds) * 0.5, sp2[2]); dummy.rotation.set(0, i * 0.7, 0); } }
      else if (i < S.NB) { dummy.scale.setScalar(1); dummy.position.set(b[0], b[1], b[2]); dummy.rotation.set(b[3], b[5], b[4]); }
      else { const u = (t - t0) / d; if (u <= 0) { dummy.position.copy(mouth); dummy.scale.setScalar(0.001); } else { dummy.scale.setScalar(1); if (u < 1) fly(dummy, mouthArr, b, u, 0.2 + 0.12 * fr(i * 0.3), 7 * (fr(i * 0.77) - 0.5)); else { dummy.position.set(b[0], b[1] + settle(t - t0 - d), b[2]); dummy.rotation.set(b[3], b[5], b[4]); } } }
      dummy.updateMatrix(); I2.setMatrixAt(i, dummy.matrix);
    }
    I2.instanceMatrix.needsUpdate = true; I2.visible = t >= K.s5 - 0.5;
    // hero AUDIRA coin lands on the middle column
    {
      const top = stackPos(3, 60), hu = (t - S.hero) / 0.75;
      heroM.visible = hu > -0.2;
      const yEnd = top[1] - COIN.H / 2 + 0.016;
      if (hu < 1) { const e = clamp01(hu); heroM.position.set(top[0], yEnd + 1.6 * (1 - e * e), top[2]); heroM.rotation.set(-0.35 * (1 - e) + (1 - e) * 9, -0.6 + PI - 0.88, 0); }
      else { heroM.position.set(top[0], yEnd + settle(t - S.hero - 0.75) * 0.6 + 0.11 * smooth((t - S.hero - 0.75) / 0.8), top[2] + 0.06 * smooth((t - S.hero - 0.75) / 0.8)); heroM.rotation.set(0.85 * smooth((t - S.hero - 0.75) / 0.8), -0.6 + PI - 0.88 + 0.15 * smooth((t - S.hero - 0.75) / 3), 0); }
    }

    // factory: licence doc, other company, belt and own cabinets
    {
      const a = A("s6:menjual"), b = A("s6:lain"), m = A("s6:Mereka");
      const sl = smooth((t - a) / (b - 0.1 - a)), flip = ramp(t, m - 0.2, m + 0.5);
      docG.position.set(X1 - 1.1 + 1.75 * sl, PT + 0.52 + 0.1 * Math.sin(PI * sl), 0.95 + 0.15 * sl); docG.rotation.set(0, 0.3 + PI * flip, -0.06 * Math.sin(PI * sl));
      docG.scale.setScalar(Math.max(0.01, 1 - flip)); docG.visible = t > K.s6 - 1 && t < K.s7 && flip < 0.99;
      stand.visible = sl < 0.02;
      const bt = back(clamp01((t - b + 0.05) / 0.25), 2.5); batal.visible = bt > 0.01; batal.scale.setScalar(Math.max(0.01, bt));
      const ov = 1 - ramp(t, m, m + 0.5); other.scale.setScalar(Math.max(0.01, ov)); other.visible = ov > 0.01;
      const tB = A("s6:memutuskan") - 0.2;
      const pz = back(clamp01((t - tB) / 0.45), 1.6); prodSign.scale.setScalar(Math.max(0.01, pz)); prodSign.visible = pz > 0.01;
      beltT.offset.x = -Math.max(0, t - tB) * 0.9 * (14 / 4.2);
      minis.forEach((c, k) => {
        const tk = tB + k * 0.7, u = (t - tk) / 0.4;
        c.G.visible = u > 0 && t < K.s7 + 1.5;
        const x = X1 - 1.9 + 0.9 * Math.max(0, t - tk - 0.4);
        c.G.position.set(Math.min(x, X1 + 2.0), PT + 0.465 + 1.2 * (1 - eout(clamp01(u))) + settle(t - tk - 0.4) * 0.6, -0.55);
        c.G.scale.setScalar(0.62 * Math.max(0.01, back(clamp01(u * 1.4), 1.2)));
      });
    }
    // bank
    {
      const s1 = A("s7:menolak"), s2 = A("s7:kredit"), sw = A("s7:Tapi");
      const press = (ts) => ramp(t, ts - 0.2, ts) - ramp(t, ts + 0.1, ts + 0.4);
      const hover = 0.42 - 0.38 * Math.max(press(s1), press(s2));
      const idle = t < s1 - 0.6 ? ramp(t, K.s7 - 0.4, K.s7 + 0.4) : 1;
      const appr = Math.max(...[s1, s2].map((ts) => ramp(t, ts - 0.5, ts - 0.22) - ramp(t, ts + 0.3, ts + 0.6)));
      stamp.position.set(0.02 + 0.36 * (1 - appr), -0.06 + 0.12 * (1 - appr), 0.03 + hover + (1 - idle) * 0.5);
      stampBaseM.color.set(t < sw + 0.3 ? P.red : "#2FB98A");
      const m1 = t > s1 ? back(clamp01((t - s1) / 0.18), 2) : 0, m2 = t > s2 ? back(clamp01((t - s2) / 0.18), 2) : 0;
      mark1.visible = m1 > 0.01; mark1.scale.setScalar(Math.max(0.01, m1)); mark2.visible = m2 > 0.01; mark2.scale.setScalar(Math.max(0.01, m2));
      const swp = smooth((t - sw) / 0.6);
      form1.position.set(-1.1 * swp, 0, 0.005); form1.visible = swp < 0.98; form1.material.opacity = 1;
      form2.position.set(1.1 * (1 - swp), 0, 0.006); form2.visible = swp > 0.02;
      const pinV = back(clamp01((t - A("s7:pinball") + 0.15) / 0.4), 1.6) * (1 - ramp(t, A("s7:kredit") - 0.2, A("s7:kredit") + 0.2));
      miniPin.scale.setScalar(0.55 * Math.max(0.01, pinV)); miniPin.visible = pinV > 0.01;
      const fd = clamp01((t - A("s7:mafia") + 0.45) / 0.45);
      fedora.visible = fd > 0 && pinV > 0.01; const fy = PT + 0.6 + 0.9 * (1 - fd * fd);
      fedora.position.set(X2 + 1.95, fy + (fd >= 1 ? settle(t - A("s7:mafia")) : 0), 0.45 - 0.3); fedora.rotation.set(0.12, t * 0.2, 0.08); fedora.scale.setScalar(1.0 * Math.max(0.01, pinV));
      const rp = fr((t - A("s7:mafia")) * 0.8); const ron = t > A("s7:mafia") && pinV > 0.05;
      mafRing.visible = ron; mafRing.position.set(X2 + 1.95, PT + 0.02, 0.45); mafRing.scale.setScalar(0.7 + rp * 0.8); mafRing.material.opacity = ron ? (1 - rp) * 0.7 : 0;
    }
    // tags
    for (const g of tags) {
      let s = 0; for (const [a, b] of g.wins) if (t > a && t < b) s = Math.max(s, back(clamp01((t - a) / 0.35), 2) * (1 - ramp(t, b - 0.25, b)));
      g.m.visible = s > 0.01; if (g.m.visible) { const q = g.pos(); g.m.position.set(q[0], q[1], q[2]); g.m.quaternion.copy(cam.quaternion); g.m.scale.setScalar(s); }
    }
    comp.render();
  };
}
