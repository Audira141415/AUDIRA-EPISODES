// EP01 BOM ATOM TENNIS (FILMNOIR): a black-and-white 1958 lab at night. Hard window light through venetian blinds,
// thin haze, silhouettes with a cold rim. The only colour in the film is the green phosphor of the oscilloscope
// (plus one dim amber lamp on the analog computer). A grade pass keeps everything else true grey.
// Illustration only: generic silhouettes, own drawings, no real photos or UI. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, box as _box, cyl as _cyl, stage, pts, envStrips } from "./lib3d.js";

const GREEN = new THREE.Color(0.32, 1.7, 0.62);
const MONO = "'Courier New', monospace", SERIF = "Georgia, 'Times New Roman', serif", SANS = "'Arial Black', Arial, sans-serif";

// Ball on the scope: side-view volley, period P, bounce at u = UB. Shared with mix.py (same constants).
export const BALL = { P: 1.6, UB: 0.62 };
function ballAt(t, dir0 = 0) {
  const n = Math.floor(t / BALL.P), u = t / BALL.P - n, dir = (n + dir0) % 2 ? -1 : 1;
  let y;
  if (u < BALL.UB) { const s = u / BALL.UB; y = (1 - s) * 0.25 + 2.2 * s * (1 - s); }
  else { const s = (u - BALL.UB) / (1 - BALL.UB); y = s * 0.24 + 1.2 * s * (1 - s); }
  return [dir * (-0.84 + 1.68 * u), y];
}

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Noir grade: everything grey except phosphor green and amber, S-curve contrast, projector flicker.
const Grade = { uniforms: { tDiffuse: { value: null }, uFlick: { value: 1 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uFlick;varying vec2 vUv;
  void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);float l=dot(c,vec3(0.299,0.587,0.114));
  float gm=smoothstep(0.03,0.16,c.g-max(c.r,c.b));float am=smoothstep(0.05,0.18,c.r-c.b)*step(c.b+0.02,c.g)*(1.0-gm);
  float keep=max(gm,am*0.85);vec3 bw=vec3(l);bw=mix(bw,bw*bw*(3.0-2.0*bw),0.45);
  vec3 o=mix(bw,c,keep)*uFlick;gl_FragColor=vec4(o,1.0);}` };

// Cold fresnel rim on silhouettes so they separate from the black.
function rimMat(color, rough = 0.7, rim = 0.5, metal = 0) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  m.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace("#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>\n float frn = pow(clamp(1.0 - abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 3.0); totalEmissiveRadiance += vec3(0.8,0.86,0.96) * ${rim.toFixed(3)} * frn;`);
  };
  m.customProgramCacheKey = () => "rim" + rim;
  return m;
}

let _shirt = null;
const SHIRT = () => _shirt || (_shirt = canvasTex(128, 192, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#cfcfcf"; g.beginPath(); g.moveTo(24, 0); g.lineTo(104, 0); g.lineTo(64, 150); g.closePath(); g.fill(); g.fillStyle = "#0b0b0b"; g.beginPath(); g.moveTo(56, 8); g.lineTo(72, 8); g.lineTo(69, 20); g.lineTo(76, 110); g.lineTo(64, 128); g.lineTo(52, 110); g.lineTo(59, 20); g.closePath(); g.fill(); }));
// Generic 1950s silhouette, faceless: rounded head on a neck, sloped shoulders wider than the waist, tapered lathe torso,
// capsule limbs with elbow and knee pivots, flared lab coat or skirt. Rim light from rimMat.
const lathe = (pts, seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
function person({ h = 1.8, coat = 0x1b1b1d, lab = false, hat = "fedora", rim = 0.5, dress = false }) {
  const G = new THREE.Group(), body = new THREE.Group(); G.add(body); body.scale.setScalar(h / 1.8);
  const cM = rimMat(lab ? 0x6e6e6e : coat, 0.75, rim), dM = rimMat(0x101012, 0.6, rim), sM = rimMat(0x2c2c2c, 0.6, rim);
  const add = (geo, mat, x, y, z, p = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const leg = (x) => {
    const hip = new THREE.Group(); hip.position.set(x, 0.9, 0); body.add(hip);
    add(new THREE.CapsuleGeometry(0.072, 0.32, 6, 12), dM, 0, -0.2, 0, hip);
    const kn = new THREE.Group(); kn.position.y = -0.43; hip.add(kn);
    add(new THREE.CapsuleGeometry(0.058, 0.32, 6, 12), dM, 0, -0.2, 0, kn);
    const shoe = add(new THREE.SphereGeometry(0.07, 12, 8), dM, 0, -0.43, 0.05, kn); shoe.scale.set(0.8, 0.5, 1.7);
    return { hip, kn };
  };
  const legL = leg(-0.095), legR = leg(0.095);
  // trousers seat + tapered torso with sloped shoulders
  const hips = add(lathe([[0.001, 0.84], [0.14, 0.86], [0.155, 0.95], [0.145, 1.02], [0.001, 1.02]]), dM, 0, 0, 0); hips.scale.set(1.12, 1, 0.75);
  const torso = add(lathe([[0.001, 0.95], [0.145, 0.96], [0.15, 1.08], [0.175, 1.26], [0.2, 1.4], [0.19, 1.47], [0.12, 1.53], [0.055, 1.56], [0.001, 1.565]]), cM, 0, 0, 0); torso.scale.set(1.35, 1, 0.72);
  if (lab || dress) { const sk = add(lathe(lab ? [[0.16, 1.12], [0.165, 0.95], [0.22, 0.72], [0.255, 0.52]] : [[0.15, 1.05], [0.2, 0.85], [0.28, 0.5]]), cM.clone(), 0, 0, 0); sk.material.side = THREE.DoubleSide; sk.scale.set(1.2, 1, 0.82); }
  // shirt front + tie so the silhouette reads front-facing
  add(new THREE.PlaneGeometry(0.15, 0.24), new THREE.MeshStandardMaterial({ map: SHIRT(), transparent: true, roughness: 0.8 }), 0, 1.41, 0.142);
  const hp = new THREE.Group(); hp.position.set(0, 1.55, 0); body.add(hp);
  add(new THREE.CylinderGeometry(0.042, 0.05, 0.1, 12), sM, 0, 0.03, 0, hp);
  const head = add(new THREE.SphereGeometry(0.1, 20, 16), sM, 0, 0.15, 0.01, hp); head.scale.set(0.88, 1.12, 0.98);
  const jaw = add(new THREE.SphereGeometry(0.075, 16, 12), sM, 0, 0.1, 0.03, hp); jaw.scale.set(0.95, 0.8, 1);
  if (hat === "fedora") {
    add(new THREE.CylinderGeometry(0.19, 0.19, 0.012, 28), dM, 0, 0.235, 0, hp);
    add(lathe([[0.001, 0.36], [0.07, 0.355], [0.1, 0.33], [0.108, 0.24], [0.001, 0.24]]), dM, 0, 0, 0, hp);
  } else if (hat === "cloche") {
    add(new THREE.SphereGeometry(0.125, 18, 10, 0, 6.3, 0, 1.6), dM, 0, 0.17, 0, hp);
  } else if (hat === "cap") {
    add(new THREE.SphereGeometry(0.108, 16, 10, 0, 6.3, 0, 1.45), dM, 0, 0.19, 0, hp); add(new THREE.BoxGeometry(0.13, 0.01, 0.09), dM, 0, 0.19, 0.11, hp);
  } else {
    add(new THREE.SphereGeometry(0.104, 18, 10, 0, 6.3, 0, 1.35), dM, 0, 0.175, -0.008, hp); // hair
  }
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.245, 1.43, 0); body.add(sh);
    add(new THREE.SphereGeometry(0.068, 12, 10), cM, 0, 0, 0, sh);
    add(new THREE.CapsuleGeometry(0.058, 0.22, 6, 12), cM, 0, -0.15, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
    add(new THREE.CapsuleGeometry(0.05, 0.2, 6, 12), cM, 0, -0.13, 0, el);
    const hand = add(new THREE.SphereGeometry(0.045, 12, 10), sM, 0, -0.28, 0.01, el); hand.scale.set(0.8, 1.15, 1);
    return { sh, el };
  };
  const armL = arm(-1), armR = arm(1);
  return { G, body, legL, legR, armL, armR, head: hp };
}
function pose(p, { walk = 0, ph = 0, reachR = 0, reachL = 0, chin = 0, headY = 0, headX = 0 } = {}) {
  const s = Math.sin(ph) * 0.5 * walk;
  p.legL.hip.rotation.x = s - 0.04; p.legR.hip.rotation.x = -s - 0.04;
  p.legL.kn.rotation.x = Math.max(0, -Math.sin(ph)) * 0.6 * walk + 0.1; p.legR.kn.rotation.x = Math.max(0, Math.sin(ph)) * 0.6 * walk + 0.1;
  p.armL.sh.rotation.set(-s * 0.7 - reachL * 0.9 - chin * 0.5, 0, 0.1 + chin * 0.2); p.armL.el.rotation.x = -0.45 - reachL * 0.5 - chin * 1.7;
  p.armR.sh.rotation.set(s * 0.7 - reachR * 0.9, 0, -0.1); p.armR.el.rotation.x = -0.45 - reachR * 0.5;
  p.head.rotation.set(headX, headY, 0);
}

function dyn(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let key = null;
  return { tex, g, paint(k, fn) { if (k === key) return; key = k; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; } };
}
const plane = (w, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); (parent || null) && parent.add(m); return m; };

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x030303, fog: 0.04, exp: 0.72, bloom: [0.55, 0.5, 0.9] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const grade = new ShaderPass(Grade); comp.addPass(grade);
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  envStrips(r, scene, [[4, 2, 0xffffff, 1.4, -3, 3, -2], [2, 4, 0xffffff, 0.8, 4, 2, 3]], 0x020202);
  scene.environmentIntensity = 0.1;
  scene.add(new THREE.HemisphereLight(0x9aa0aa, 0x050505, 0.06));
  const rnd = mulberry(1958);
  // lib3d box/cyl only attach to an explicit parent; default to the scene here
  const box = (w, h, d, m, x, y, z, p) => _box(w, h, d, m, x, y, z, p || scene);
  const cyl = (a, b, h, sg, m, x, y, z, p) => _cyl(a, b, h, sg, m, x, y, z, p || scene);
  const A = (k) => AT[k];

  // ---------- room shell: tiled floor, plaster wall with wainscot, dark pillars ----------
  const tileT = canvasTex(256, 256, (g, w) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#3a3a3a" : "#262626"; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = "#141414"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, w); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [30, 6]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), std(0xffffff, 0.42, 0, { map: tileT })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3.5); floor.receiveShadow = true; scene.add(floor);
  const wallT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#5c5c5c"; g.fillRect(0, 0, w, h); g.fillStyle = "#333"; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = "#1e1e1e"; g.fillRect(0, h * 0.71, w, 8); for (let i = 0; i < 4; i++) { g.strokeStyle = "#2a2a2a"; g.lineWidth = 3; g.strokeRect(i * 128 + 10, h * 0.75, 108, h * 0.2); } const R = mulberry(7); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${R() * 0.08})`; g.fillRect(R() * w, R() * h * 0.7, 3, 3); } }, [15, 1]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 4), std(0xffffff, 0.92, 0, { map: wallT })); wall.position.set(0, 2, -2.5); wall.receiveShadow = true; scene.add(wall);
  for (const x of [-7.2, 6.4]) { const c = box(0.5, 4, 0.5, std(0x161616, 0.6), x, 2, 1.9); c.castShadow = false; }
  // pendant lamps (dark shades, faint bulbs) for depth
  for (const x of [-14, -0.2, 12.6]) {
    cyl(0.006, 0.006, 1.2, 4, std(0x111111, 0.5), x, 3.4, 0.6);
    const sh = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.2, 20, 1, true), std(0x1a1a1a, 0.5, 0.4, { side: THREE.DoubleSide })); sh.position.set(x, 2.75, 0.6); scene.add(sh);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshBasicMaterial({ color: 0xbdbdbd })); b.position.set(x, 2.68, 0.6); scene.add(b);
  }

  // ---------- windows with blinds: gobo spot + glowing slats + haze shaft ----------
  const goboT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; for (let i = 0; i < 13; i++) g.fillRect(18, 16 + i * 17.6, w - 36, 10); g.fillStyle = "#000"; g.fillRect(w / 2 - 5, 0, 10, h); });
  const slatT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#101010"; g.fillRect(0, 0, w, h); g.fillStyle = "#cfcfcf"; for (let i = 0; i < 13; i++) g.fillRect(10, 12 + i * 18.4, w - 20, 8); g.fillStyle = "#101010"; g.fillRect(w / 2 - 6, 0, 12, h); g.strokeStyle = "#0a0a0a"; g.lineWidth = 12; g.strokeRect(0, 0, w, h); });
  const hazeT = canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.25, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const lamps = [];
  function windowLight(x, tx, tz, I = 340) {
    const win = plane(1.25, 1.45, new THREE.MeshBasicMaterial({ map: slatT, color: 0x8a8a8a }), x, 1.95, -2.48); scene.add(win);
    const sp = new THREE.SpotLight(0xffffff, I, 16, 0.52, 0.25, 2); sp.position.set(x, 2.6, -2.3); sp.target.position.set(tx, 0, tz);
    sp.map = goboT; sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -0.0004; sp.shadow.camera.near = 0.3;
    scene.add(sp, sp.target);
    // haze shaft from the window toward the floor
    const from = new THREE.Vector3(x, 1.95, -2.4), to = new THREE.Vector3(tx, 0, tz), len = from.distanceTo(to);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 2.1, len, 4, 1, true), new THREE.MeshBasicMaterial({ map: hazeT, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    sh.position.copy(from).lerp(to, 0.5); sh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.clone().sub(from).normalize()); sh.rotateY(Math.PI / 4); scene.add(sh);
    lamps.push({ sp, from, to });
    return sp;
  }
  const winA = windowLight(-3.2, -0.6, 2.6), winC = windowLight(-15.6, -13.4, 2.0, 300), winE = windowLight(14.7, 11.9, 1.0, 300);
  // dust motes drifting in the shafts
  const dust = pts(scene, 240, { color: 0xffffff, size: 0.018, opacity: 0.55 });
  const dustSeed = Array.from({ length: 240 }, () => [rnd(), rnd(), rnd(), rnd()]);

  // ---------- subject key + cold rim, both follow the camera's subject ----------
  const key = new THREE.SpotLight(0xfff6e8, 30, 9, 0.36, 0.55, 2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; scene.add(key, key.target);
  const rimL = new THREE.SpotLight(0xd8e4ff, 22, 8, 0.5, 0.6, 2); scene.add(rimL, rimL.target);
  const ctlL = new THREE.SpotLight(0xffffff, 0, 4, 0.4, 0.5, 2); ctlL.position.set(0.9, 1.75, 1.1); ctlL.target.position.set(0.3, 0.95, 0.3); scene.add(ctlL, ctlL.target);
  const ctlRim = new THREE.SpotLight(0xdfe8ff, 0, 4, 0.45, 0.5, 2); ctlRim.position.set(-0.2, 1.4, -0.6); ctlRim.target.position.set(0.35, 0.95, 0.3); scene.add(ctlRim, ctlRim.target);

  // ---------- STATION A: the bench, the oscilloscope, controllers, rack, poster, calendar, crate ----------
  const woodM = std(0x2e2b28, 0.55), metalM = std(0x6a6a6a, 0.42, 0.65), darkMetal = std(0x2a2a2a, 0.45, 0.6), alu = std(0xb4b4b4, 0.3, 0.8);
  box(2.5, 0.06, 0.95, woodM, 0, 0.9, 0);
  for (const x of [-1.15, 1.15]) for (const z of [-0.4, 0.4]) box(0.06, 0.88, 0.06, woodM, x, 0.44, z);
  box(2.3, 0.03, 0.8, woodM, 0, 0.28, 0);

  // oscilloscope: parts carry an explode vector for the s6 assembly and the s7 teardown
  const scope = new THREE.Group(); scope.position.set(0, 0.93, -0.15); scene.add(scope);
  const parts = [];
  const part = (m, ex) => { scope.add(m); parts.push({ m, home: m.position.clone(), ex: new THREE.Vector3(...ex) }); return m; };
  part(box(0.52, 0.46, 0.6, metalM), [0, 0, -0.1]).position.set(0, 0.23, 0);
  part(box(0.5, 0.44, 0.02, darkMetal), [0, 0.15, 0.55]).position.set(0, 0.23, 0.305);
  const bez = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.022, 12, 48), std(0x3a3a3a, 0.55, 0.5)); bez.position.set(0, 0.27, 0.325); part(bez, [0, 0.4, 0.75]);
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.06, 40, 1, true), std(0x1a1a1a, 0.5, 0.3, { side: THREE.DoubleSide })); hood.rotation.x = Math.PI / 2; hood.position.set(0, 0.27, 0.34); part(hood, [0, 0.55, 0.9]);
  const scr = dyn(512, 512);
  const screen = new THREE.Mesh(new THREE.CircleGeometry(0.155, 64), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false, color: 0xffffff })); screen.position.set(0, 0.27, 0.318); part(screen, [0, 0.3, 0.6]);
  const glow = new THREE.PointLight(0x40ff80, 0.6, 2.2, 2); glow.position.set(0, 0.27, 0.6); scope.add(glow);
  for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.03, 18), alu); k.rotation.x = Math.PI / 2; k.position.set(-0.18 + i * 0.12, 0.06, 0.33); part(k, [(i - 1.5) * 0.3, -0.2, 0.6]); }
  const plateT = canvasTex(256, 48, (g, w, h) => { g.fillStyle = "#1a1a1a"; g.fillRect(0, 0, w, h); g.fillStyle = "#cfcfcf"; g.font = `700 26px ${MONO}`; g.textAlign = "center"; g.fillText("OSCILLOSCOPE", w / 2, 33); });
  part(plane(0.26, 0.05, new THREE.MeshStandardMaterial({ map: plateT, roughness: 0.5 }), 0, 0.42, 0.317), [0, 0.7, 0.4]);

  // controllers: aluminium boxes with a knob (angle) and a button (hit)
  const ctl = [-1, 1].map((s) => {
    const G = new THREE.Group(); G.position.set(s * 0.46, 0.93, 0.3); G.rotation.y = -s * 0.25; scene.add(G);
    box(0.11, 0.07, 0.17, alu, 0, 0.035, 0, G);
    const knob = new THREE.Group(); knob.position.set(0, 0.075, -0.035); G.add(knob);
    cyl(0.026, 0.028, 0.026, 20, darkMetal, 0, 0.013, 0, knob); box(0.006, 0.006, 0.03, alu, 0, 0.028, 0.012, knob);
    const btn = cyl(0.013, 0.013, 0.016, 16, std(0x0e0e0e, 0.4), 0, 0.078, 0.045, G);
    const cv = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.46, 0.95, 0.2), new THREE.Vector3(s * 0.4, 0.935, 0.05), new THREE.Vector3(s * 0.28, 0.94, -0.05)]);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(cv, 20, 0.006, 6), std(0x0c0c0c, 0.5)); scene.add(wire);
    return { G, knob, btn, wire, home: G.position.clone() };
  });

  // analog computer rack with patch panel, meters and the one amber lamp
  const rack = new THREE.Group(); rack.position.set(1.95, 0, -1.0); scene.add(rack);
  box(0.9, 1.95, 0.6, std(0x2b2b2b, 0.5, 0.4), 0, 0.975, 0, rack);
  const patchT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#1c1c1c"; g.fillRect(0, 0, w, h); for (let i = 0; i < 10; i++) for (let j = 0; j < 9; j++) { g.fillStyle = "#8a8a8a"; g.beginPath(); g.arc(40 + i * 48, 40 + j * 50, 13, 0, 7); g.fill(); g.fillStyle = "#050505"; g.beginPath(); g.arc(40 + i * 48, 40 + j * 50, 6, 0, 7); g.fill(); } });
  plane(0.8, 0.8, new THREE.MeshStandardMaterial({ map: patchT, roughness: 0.5, metalness: 0.3 }), 0, 0.95, 0.302, rack);
  const meterT = canvasTex(128, 128, (g, w) => { g.fillStyle = "#d8d8d0"; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = "#111"; g.lineWidth = 3; g.beginPath(); g.arc(64, 84, 44, 3.6, 5.8); g.stroke(); for (let i = 0; i <= 8; i++) { const a = 3.6 + i * 0.275; g.beginPath(); g.moveTo(64 + Math.cos(a) * 44, 84 + Math.sin(a) * 44); g.lineTo(64 + Math.cos(a) * 34, 84 + Math.sin(a) * 34); g.stroke(); } });
  const needles = [];
  for (let i = 0; i < 3; i++) {
    plane(0.17, 0.17, new THREE.MeshStandardMaterial({ map: meterT, roughness: 0.4 }), -0.27 + i * 0.27, 1.62, 0.303, rack);
    const n = box(0.004, 0.065, 0.002, std(0x050505, 0.4), -0.27 + i * 0.27, 1.6, 0.306, rack); n.geometry.translate(0, 0.03, 0); needles.push(n);
  }
  const amber = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 0.55, 0.12), toneMapped: false })); amber.position.set(0.33, 1.8, 0.31); rack.add(amber);
  const amberL = new THREE.PointLight(0xffa040, 0.08, 1.2, 2); amberL.position.set(0.33, 1.8, 0.45); rack.add(amberL);
  const cableM = std(0x0d0d0d, 0.55);
  for (let i = 0; i < 8; i++) { const a = new THREE.Vector3(1.95 - 0.3 + rnd() * 0.6, 0.65 + rnd() * 0.65, -0.68), b = new THREE.Vector3(1.95 - 0.3 + rnd() * 0.6, 0.65 + rnd() * 0.65, -0.68); const m = a.clone().lerp(b, 0.5); m.z += 0.12; m.y -= 0.22 + rnd() * 0.15; scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m, b]), 24, 0.008, 6), cableM)); }
  // cable from rack to scope
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.55, 1.0, -0.8), new THREE.Vector3(1.0, 0.92, -0.5), new THREE.Vector3(0.3, 1.0, -0.4)]), 30, 0.01, 6), cableM));

  // poster: a faint mushroom-cloud diagram on the wall
  const posterT = canvasTex(400, 520, (g, w, h) => {
    g.fillStyle = "#b9b6ad"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2b2b2b"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#3a3a3a"; g.beginPath(); g.moveTo(185, 470); g.bezierCurveTo(180, 360, 172, 300, 178, 240); g.lineTo(222, 240); g.bezierCurveTo(228, 300, 220, 360, 215, 470); g.fill();
    for (const [x, y, rr] of [[200, 170, 78], [140, 190, 55], [262, 192, 56], [170, 130, 52], [236, 130, 50], [200, 110, 48]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
    g.fillStyle = "#5a5a5a"; g.beginPath(); g.ellipse(200, 250, 120, 22, 0, 0, 7); g.fill(); g.fillStyle = "#2b2b2b"; g.fillRect(40, 470, 320, 8);
    g.strokeStyle = "#555"; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(40, 60 + i * 70); g.lineTo(80, 60 + i * 70); g.stroke(); }
  });
  plane(0.8, 1.04, std(0xffffff, 0.85, 0, { map: posterT }), -0.5, 1.78, -2.47, scene).receiveShadow = true;
  const pst = new THREE.SpotLight(0xffffff, 26, 5, 0.2, 0.35, 2); pst.position.set(-1.9, 2.5, -1.0); pst.target.position.set(-0.5, 1.85, -2.47); pst.map = goboT; pst.castShadow = true; pst.shadow.mapSize.set(512, 512); scene.add(pst, pst.target);
  // name block on the bench front edge
  const nbT = canvasTex(512, 96, (g, w, h) => { g.fillStyle = "#151515"; g.fillRect(0, 0, w, h); g.fillStyle = "#dcdcdc"; g.font = `700 44px ${SERIF}`; g.textAlign = "center"; g.fillText("W. HIGINBOTHAM", w / 2, 62); });
  const nb = box(0.42, 0.08, 0.05, std(0x151515, 0.5), -0.8, 0.97, 0.38); plane(0.4, 0.075, new THREE.MeshStandardMaterial({ map: nbT, roughness: 0.5 }), -0.8, 0.97, 0.406, scene);
  // wall calendar: Oktober 1958, days crossed during the assembly, the 18th ringed
  const cal = dyn(320, 420);
  plane(0.5, 0.66, new THREE.MeshStandardMaterial({ map: cal.tex, roughness: 0.85 }), 0.82, 1.98, -2.47, scene).receiveShadow = true;
  const paintCal = (marks, ring) => cal.paint(marks + "|" + ring, (g, w, h) => {
    g.fillStyle = "#cfccc2"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.fillRect(0, 0, w, 70);
    g.fillStyle = "#e8e8e8"; g.font = `700 34px ${SERIF}`; g.textAlign = "center"; g.fillText("OKTOBER 1958", w / 2, 48);
    g.fillStyle = "#222"; g.font = `700 18px ${MONO}`; "MSSRKJS".split("").forEach((d, i) => g.fillText(d, 25 + i * 45, 98));
    const first = 3; // 1 Oktober 1958 jatuh pada hari Rabu
    for (let k = -2; k <= 31; k++) {
      const idx = first + k - 1, col = idx % 7, row = Math.floor(idx / 7), x = 25 + col * 45, y = 140 + row * 54;
      const prev = k <= 0, day = prev ? 30 + k : k;
      g.fillStyle = prev ? "#8d8a82" : "#1a1a1a"; g.font = `700 24px ${MONO}`; g.fillText(String(day), x, y);
      const order = k + 2; // crosses run from 28 Sep to 17 Oct
      if (order < marks && k < 18) { g.strokeStyle = "#202020"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x - 15, y - 22); g.lineTo(x + 15, y + 6); g.moveTo(x + 15, y - 22); g.lineTo(x - 15, y + 6); g.stroke(); }
      if (k === 18 && ring) { g.strokeStyle = "#0a0a0a"; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y - 8, 24 * ring, 21 * ring, -0.2, 0, 7); g.stroke(); }
    }
  });
  // crates with the AUDIRA stencil
  const stT = canvasTex(512, 384, (g, w, h) => { g.fillStyle = "#4a4640"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2c2925"; g.lineWidth = 5; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(0, i * h / 5); g.lineTo(w, i * h / 5); g.stroke(); } g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22); g.fillStyle = "rgba(225,225,220,.82)"; g.font = `900 112px ${SANS}`; g.textAlign = "center"; g.fillText("AUDIRA", w / 2, h / 2 + 22); g.font = `700 34px ${MONO}`; g.fillText("ARSIP LAB · RAPUH", w / 2, h / 2 + 86); });
  const crateM = [std(0x45413b, 0.8), std(0x45413b, 0.8), std(0x45413b, 0.8), std(0x45413b, 0.8), std(0xffffff, 0.8, 0, { map: stT }), std(0x45413b, 0.8)];
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.58, 0.58), crateM); crate.position.set(-2.05, 0.29, 0.35); crate.rotation.y = 0.35; crate.castShadow = crate.receiveShadow = true; scene.add(crate);
  const lidP = new THREE.Group(); lidP.position.set(-2.05 - Math.sin(0.35) * 0.29, 0.58, 0.35 - Math.cos(0.35) * 0.29); lidP.rotation.y = 0.35; scene.add(lidP);
  box(0.78, 0.04, 0.58, std(0x3d3934, 0.8), 0, 0.02, 0.29, lidP);
  const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.5), crateM); crate2.position.set(-2.45, 0.225, -1.2); crate2.rotation.y = -0.2; crate2.castShadow = true; scene.add(crate2);
  // "TENNIS FOR TWO" hand-lettered card on a stand (appears for the public day)
  const sgT = canvasTex(512, 300, (g, w, h) => { g.fillStyle = "#d6d3c9"; g.fillRect(0, 0, w, h); g.strokeStyle = "#151515"; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#151515"; g.textAlign = "center"; g.font = `900 66px ${SERIF}`; g.fillText("TENNIS", w / 2, 112); g.fillText("FOR TWO", w / 2, 190); g.font = `700 28px ${MONO}`; g.fillText("SILAKAN COBA", w / 2, 252); });
  const sign = new THREE.Group(); sign.position.set(-1.45, 0, 0.95); sign.rotation.y = 0.45; scene.add(sign);
  for (const s of [-1, 1]) box(0.025, 1.2, 0.025, woodM, s * 0.3, 0.6, -0.05, sign);
  plane(0.72, 0.42, std(0xffffff, 0.8, 0, { map: sgT }), 0, 1.25, 0, sign);

  // manual book with flipping pages (s4)
  const book = new THREE.Group(); book.position.set(0.98, 0.935, 0.25); book.rotation.y = -0.35; scene.add(book);
  box(0.6, 0.02, 0.4, std(0x1c1c1c, 0.6), 0, 0.0, 0, book);
  const pageT = (n) => canvasTex(256, 340, (g, w, h) => { g.fillStyle = "#d9d6cc"; g.fillRect(0, 0, w, h); g.strokeStyle = "#333"; g.lineWidth = 3; g.fillStyle = "#333"; g.font = `700 20px ${MONO}`; g.fillText(n ? "GBR. " + n : "MANUAL", 20, 34);
    if (n % 2) { g.beginPath(); g.moveTo(40, 120); g.lineTo(40, 220); g.lineTo(130, 170); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(130, 170); g.lineTo(220, 170); g.moveTo(10, 145); g.lineTo(40, 145); g.moveTo(10, 195); g.lineTo(40, 195); g.stroke(); }
    else { g.beginPath(); g.moveTo(20, 300); for (let i = 0; i <= 40; i++) { const s = i / 40; g.lineTo(20 + 216 * s, 300 - 200 * 4 * s * (1 - s)); } g.stroke(); g.beginPath(); g.moveTo(20, 300); g.lineTo(236, 300); g.stroke(); }
    for (let i = 0; i < 5; i++) { g.fillStyle = "#777"; g.fillRect(20, 240 + i * 14 - (n % 2 ? 0 : 200), 150 + (i % 3) * 25, 4); } });
  const pages = [];
  for (let i = 0; i < 4; i++) { const pv = new THREE.Group(); pv.position.set(0, 0.012 + i * 0.002, 0); book.add(pv); const m = plane(0.28, 0.37, std(0xffffff, 0.85, 0, { map: pageT(i), side: THREE.DoubleSide }), 0.145, 0, 0, pv); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; pages.push(pv); }
  const leftPage = plane(0.28, 0.37, std(0xffffff, 0.85, 0, { map: pageT(5) }), -0.145, 0.012, 0, book); leftPage.rotation.x = -Math.PI / 2;

  // trajectories (s4): missile arc vs bouncing ball, drawn as phosphor lines in the air
  const lineM = new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false, transparent: true });
  const arcs = new THREE.Group(); arcs.position.set(1.1, 1.08, 0.55); scene.add(arcs);
  const mk = (fn) => { const P = []; for (let i = 0; i <= 160; i++) P.push(fn(i / 160)); const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 320, 0.007, 6); const m = new THREE.Mesh(g, lineM); arcs.add(m); return { m, n: g.index.count, P }; };
  const missile = mk((s) => new THREE.Vector3(1.6 * s, 0.95 * 4 * s * (1 - s), 0));
  const bH = [0.5, 0.3, 0.18, 0.1], bW = [0.62, 0.44, 0.32, 0.22], bWs = bW.reduce((a, b) => a + b, 0);
  const bounce = mk((s) => { let x = s * bWs, k = 0; while (k < 3 && x > bW[k]) { x -= bW[k]; k++; } const u = Math.min(1, x / bW[k]); let x0 = 0; for (let j = 0; j < k; j++) x0 += bW[j]; return new THREE.Vector3((x0 + x) * 1.6 / bWs, bH[k] * 4 * u * (1 - u), 0.12); });
  const axis = box(1.7, 0.006, 0.006, new THREE.MeshBasicMaterial({ color: 0x7a7a7a }), 0.8, 0, 0.06, arcs);
  const head1 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), lineM), head2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), lineM); arcs.add(head1, head2);

  // Higinbotham: generic lab-coat silhouette, no likeness
  const hig = person({ h: 1.8, lab: true, hat: null, rim: 0.55 }); hig.G.position.set(-0.78, 0, 0.78); scene.add(hig.G);

  // ---------- STATION C: open day hall, exhibits behind ropes ----------
  const CX = -14;
  const boardT = canvasTex(1024, 360, (g, w, h) => { g.fillStyle = "#151515"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d0d0d0"; g.lineWidth = 6; g.strokeRect(16, 16, w - 32, h - 32); g.fillStyle = "#e6e6e6"; g.textAlign = "center"; g.font = `900 96px ${SERIF}`; g.fillText("HARI KUNJUNGAN", w / 2, 150); g.font = `700 44px ${MONO}`; g.fillText("LABORATORIUM BROOKHAVEN", w / 2, 230); g.fillText("NEW YORK  ·  1958", w / 2, 290); });
  plane(2.0, 0.7, std(0xffffff, 0.6, 0, { map: boardT }), CX - 0.2, 1.95, -2.46, scene);
  const bdL = new THREE.SpotLight(0xffffff, 14, 6, 0.6, 0.5, 2); bdL.position.set(CX - 0.2, 3.3, -0.6); bdL.target.position.set(CX - 0.2, 1.95, -2.46); scene.add(bdL, bdL.target);
  const pedM = std(0x3c3c3c, 0.6);
  [-1.6, 0, 1.6].forEach((dx, i) => {
    const x = CX + dx; box(0.5, 1.0, 0.5, pedM, x, 0.5, -1.25);
    const sp = new THREE.SpotLight(0xffffff, 16, 5, 0.22, 0.5, 2); sp.position.set(x, 3.4, -0.6); sp.target.position.set(x, 1.0, -1.25); scene.add(sp, sp.target);
    if (i === 0) { const at = new THREE.Group(); at.position.set(x, 1.32, -1.25); scene.add(at); at.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), std(0x9a9a9a, 0.3, 0.6))); for (let k = 0; k < 3; k++) { const o = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.006, 8, 60), std(0xbbbbbb, 0.3, 0.8)); o.rotation.set(Math.PI / 2 + k * 1.05, k * 0.7, 0); at.add(o); } }
    if (i === 1) { box(0.36, 0.22, 0.3, std(0x5a5a5a, 0.4, 0.5), x, 1.11, -1.25); const gl = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.16 })); gl.position.set(x, 1.23, -1.25); scene.add(gl); }
    if (i === 2) { const chT = canvasTex(256, 320, (g, w, h) => { g.fillStyle = "#cfcfcf"; g.fillRect(0, 0, w, h); g.strokeStyle = "#222"; g.lineWidth = 4; g.beginPath(); g.moveTo(20, 280); g.lineTo(236, 280); g.moveTo(20, 280); g.lineTo(20, 30); g.stroke(); g.beginPath(); g.moveTo(20, 260); for (let k = 0; k < 9; k++) g.lineTo(20 + k * 26, 260 - k * k * 2.6); g.stroke(); }); plane(0.42, 0.52, std(0xffffff, 0.7, 0, { map: chT }), x, 1.32, -1.2, scene).rotation.x = -0.15; }
  });
  const ropeM = std(0x262626, 0.6), postM = std(0x9c9c9c, 0.3, 0.85);
  const posts = [-2.4, -0.8, 0.8, 2.4].map((dx) => new THREE.Vector3(CX + dx, 0.9, -0.3));
  posts.forEach((p) => { cyl(0.022, 0.022, 0.9, 12, postM, p.x, 0.45, p.z); cyl(0.12, 0.13, 0.03, 20, postM, p.x, 0.015, p.z); const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), postM); b.position.set(p.x, 0.92, p.z); scene.add(b); });
  for (let i = 0; i < 3; i++) { const a = posts[i], b = posts[i + 1], m = a.clone().lerp(b, 0.5); m.y -= 0.18; scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, m, b]), 20, 0.016, 8), ropeM)); }
  const dnT = canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#e0e0e0"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.font = `700 30px ${MONO}`; g.textAlign = "center"; g.fillText("JANGAN", w / 2, 40); g.fillText("DISENTUH", w / 2, 78); });
  plane(0.34, 0.13, std(0xffffff, 0.7, 0, { map: dnT }), CX, 0.66, -0.27, scene);
  const bored = [[-1.1, 0.75, "fedora", 1.82], [0.25, 0.85, "cloche", 1.66], [1.25, 0.7, "fedora", 1.76]].map(([dx, z, hat, h]) => { const p = person({ h, hat, dress: hat === "cloche", rim: 0.6 }); p.G.position.set(CX + dx, 0, z); p.G.rotation.y = Math.PI + (dx > 0 ? 0.25 : -0.2); scene.add(p.G); pose(p, {}); return p; });

  // ---------- visitor queue (s6) ----------
  const queue = [];
  for (let i = 0; i < 11; i++) {
    const kid = i === 2 || i === 6 || i === 9, hat = kid ? "cap" : ["fedora", "cloche", "fedora", null][i % 4];
    const p = person({ h: kid ? 1.22 : 1.62 + rnd() * 0.25, hat, dress: hat === "cloche", rim: 0.6 });
    p.G.visible = false; scene.add(p.G); queue.push({ p, x: -1.65 - i * 0.95, z: 1.25 + i * 0.07, ph: rnd() * 6 });
  }

  // ---------- STATION E: courtroom, late 1970s ----------
  const EX = 12.6;
  const panT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#2a2622"; g.fillRect(0, 0, w, h); g.strokeStyle = "#16130f"; g.lineWidth = 8; for (let i = 0; i < 4; i++) g.strokeRect(i * 128 + 14, 30, 100, h - 60); }, [4, 1]);
  plane(5.6, 3.2, std(0xffffff, 0.7, 0, { map: panT }), EX, 1.6, -2.44, scene).receiveShadow = true;
  const dW = std(0x241f1b, 0.55);
  box(2.4, 1.2, 0.75, dW, EX + 0.7, 0.6, -1.65); box(2.6, 0.06, 0.85, dW, EX + 0.7, 1.22, -1.65);
  const judge = person({ h: 1.6, coat: 0x0c0c0c, hat: null, rim: 0.5 }); judge.G.position.set(EX + 0.9, 0.35, -2.15); scene.add(judge.G); pose(judge, { reachL: 0.3, reachR: 0.3 });
  const gav = new THREE.Group(); gav.position.set(EX + 0.2, 1.27, -1.5); scene.add(gav); cyl(0.03, 0.03, 0.12, 12, dW, 0, 0, 0, gav).rotation.z = Math.PI / 2; cyl(0.007, 0.007, 0.18, 8, dW, 0, 0, 0.09, gav).rotation.x = Math.PI / 2; cyl(0.06, 0.065, 0.025, 20, dW, -0.15, -0.035, 0.05);
  box(0.95, 1.0, 0.7, dW, EX - 1.1, 0.5, -0.8); box(1.05, 0.05, 0.8, dW, EX - 1.1, 1.02, -0.8);
  const old = person({ h: 1.76, coat: 0x1d1d1f, hat: null, rim: 0.6 }); old.G.position.set(EX - 1.1, 0.08, -1.3); old.G.rotation.y = 0.35; scene.add(old.G); pose(old, { reachL: 0.35, reachR: 0.35, headX: 0.12 });
  const docT = canvasTex(256, 330, (g, w, h) => { g.fillStyle = "#dedbd2"; g.fillRect(0, 0, w, h); g.fillStyle = "#111"; g.font = `900 40px ${SERIF}`; g.textAlign = "center"; g.fillText("PATEN", w / 2, 60); for (let i = 0; i < 12; i++) { g.fillStyle = "#666"; g.fillRect(28, 100 + i * 17, 140 + (i * 37) % 60, 5); } g.strokeStyle = "#222"; g.lineWidth = 3; g.strokeRect(150, 250, 80, 56); g.beginPath(); g.moveTo(160, 290); g.quadraticCurveTo(190, 255, 220, 290); g.stroke(); });
  const doc = plane(0.26, 0.34, std(0xffffff, 0.8, 0, { map: docT }), EX + 0.95, 1.252, -1.45, scene); doc.rotation.x = -Math.PI / 2; doc.rotation.z = 0.15;
  const bench2 = box(2.6, 0.45, 0.4, dW, EX + 0.3, 0.45, 1.9); bench2.castShadow = false;

  // ---------- camera: one continuous track, every key from K / AT ----------
  const cv = track([
    [0, 0.44, 1.37, 1.95, -0.06, 1.225, -0.2],
    [A("s1:fisikawan"), 0.32, 1.35, 1.72, -0.03, 1.225, -0.18],
    [K.s1e, 0.2, 1.32, 1.5, 0, 1.22, -0.15],
    [K.s2 + 0.35, 0.5, 1.45, 5.4, -0.75, 1.32, 0.4],
    [A("s2:Setelah"), 0.15, 1.45, 5.0, -0.85, 1.3, 0.3],
    [K.s2e, -0.4, 1.6, 3.9, -1.15, 1.35, -0.5],
    [K.s3 + 0.7, CX + 0.7, 2.15, 5.2, CX - 0.35, 1.55, -1.5],
    [A("s3:Setiap"), CX + 0.3, 2.05, 4.8, CX - 0.3, 1.5, -1.5],
    [K.s3e, CX - 0.5, 2.0, 4.6, CX - 0.3, 1.45, -1.5],
    [K.s4 + 0.7, 0.75, 1.5, 3.1, 0.05, 1.1, 0.1],
    [A("s4:buku"), 1.25, 1.55, 1.75, 0.95, 0.98, 0.2],
    [A("s4:analog"), 2.35, 1.55, 3.2, 1.85, 1.3, -0.3],
    [K.s4e, 2.15, 1.5, 3.05, 1.8, 1.35, 0.3],
    [K.s5 + 0.55, 0.22, 1.24, 1.42, 0, 1.19, -0.15],
    [A("s5:dua"), 0.3, 1.28, 1.6, 0.05, 1.12, -0.05],
    [A("s5:kenop"), 0.88, 1.22, 1.08, 0.42, 0.97, 0.3],
    [K.s5e, 0.7, 1.24, 1.15, 0.2, 0.98, 0.25],
    [K.s6 + 0.4, 0.5, 1.5, 2.5, 0.05, 1.2, -0.2],
    [A("s6:Delapan") - 0.3, 0.4, 1.42, 2.0, 0.05, 1.2, -0.2],
    [A("s6:Delapan") + 0.45, 0.85, 1.95, -0.5, 0.82, 2.1, -2.45],
    [A("s6:Delapan") + 0.5 * (A("s6:Tennis") - A("s6:Delapan")), 0.45, 1.5, 1.75, 0.0, 1.3, -0.3],
    [A("s6:Tennis"), 0.05, 1.5, 2.9, -0.75, 1.1, 0.2],
    [A("s6:Ratusan"), 1.4, 1.7, 3.7, -4.2, 1.0, 1.0],
    [K.s6e, 1.0, 1.65, 3.4, -5.4, 1.0, 1.1],
    [K.s7 + 0.4, 0.3, 1.6, 3.0, -0.75, 0.9, 0.0],
    [A("s7:dilupakan"), -0.25, 1.85, 4.2, -1.3, 0.75, 0.0],
    [A("s7:akhir"), EX - 0.2, 1.7, 3.9, EX - 0.6, 1.25, -1.1],
    [K.s7e, EX - 0.5, 1.55, 3.1, EX - 0.85, 1.3, -1.1],
    [K.s8 + 0.5, 0.3, 1.3, 1.85, 0, 1.18, -0.15],
    [A("s8:Kamu"), 0.7, 1.45, 2.9, -0.3, 1.18, -0.2],
    [K.end, 1.35, 1.7, 4.4, -0.55, 1.25, -0.4],
    [K.dur, 1.45, 1.75, 4.7, -0.55, 1.25, -0.4],
  ]);
  const look = new THREE.Vector3();

  const wsc = new THREE.Vector3(), tmp = new THREE.Vector3();
  return function draw(t) {
    const [px, py, pz, tx, ty, tz] = cv(t);
    cam.position.set(px, py, pz); look.set(tx, ty, tz); cam.lookAt(look);
    // projector flicker, subtle
    grade.uniforms.uFlick.value = 0.97 + 0.03 * Math.sin(t * 23.1) * Math.sin(t * 7.3 + 1.2);

    // key + rim follow the subject
    const dimK = 1 - 0.75 * ramp(t, A("s7:dibongkar"), A("s7:dilupakan") + 0.6) * (t < A("s7:Namanya") ? 1 : 0);
    key.position.set(tx - 1.0, ty + 1.7, tz + 1.9); key.target.position.set(tx, ty - 0.05, tz); key.intensity = 30 * dimK;
    rimL.position.set(tx + 1.5, ty + 1.2, tz - 1.9); rimL.target.position.set(tx, ty, tz); rimL.intensity = 22;
    winA.intensity = 340 * (0.75 + 0.25 * dimK);
    const cl = ramp(t, A("s5:dua") - 0.3, A("s5:dua") + 0.4) * (t < K.s6 ? 1 : 0);
    ctlL.intensity = 1.0 * cl; ctlRim.intensity = 1.6 * cl; key.intensity *= 1 - 0.7 * cl;

    // ---- scope power + screen ----
    const off0 = A("s7:dibongkar"), assemble0 = K.s6, on6 = A("s6:Delapan") + 0.35 * (A("s6:Tennis") - A("s6:Delapan"));
    let pw = 1;
    if (t > off0 - 0.1 && t < K.s8) pw = 1 - clamp01((t - off0) / 0.5);
    if (t > assemble0 && t < on6) pw = 0;
    if (t >= on6 && t < on6 + 0.4) pw = clamp01((t - on6) / 0.4);
    const kn = t > A("s5:kenop") && t < K.s6 ? Math.sin((t - A("s5:kenop")) * 2.2) * 0.6 : 0;
    scr.paint(Math.round(t * 30) + ":" + pw.toFixed(2), (g, w, h) => {
      g.fillStyle = "#010603"; g.fillRect(0, 0, w, h);
      if (pw <= 0) return;
      g.save(); g.translate(w / 2, h / 2);
      const col = (a) => `rgba(110,255,150,${a})`;
      if (pw < 1 && t > off0) { const k = pw; g.fillStyle = col(1); g.shadowColor = col(1); g.shadowBlur = 18; g.fillRect(-200 * k, -3, 400 * k, 6 * Math.max(0.2, k)); g.restore(); return; }
      g.globalAlpha = pw;
      g.strokeStyle = col(0.09); g.lineWidth = 2; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * 50, -230); g.lineTo(i * 50, 230); g.moveTo(-230, i * 50); g.lineTo(230, i * 50); g.stroke(); }
      g.shadowColor = col(1); g.shadowBlur = 26; g.strokeStyle = col(1); g.lineWidth = 14; g.lineCap = "round";
      const base = 95, sx = 215, sy = 230;
      g.beginPath(); g.moveTo(-sx, base); g.lineTo(sx, base); g.moveTo(0, base); g.lineTo(0, base - 62); g.stroke(); g.stroke();
      for (let k = 26; k >= 0; k--) { const [bx, by] = ballAt(t - k * 0.013); g.fillStyle = k === 0 ? "#eafff0" : col(0.75 * (1 - k / 27)); g.beginPath(); g.arc(bx * sx, base - by * sy, k === 0 ? 20 : 13 * (1 - k / 40), 0, 7); g.fill(); }
      // hit flash and racket tick at each player's side
      const [bx] = ballAt(t); g.lineWidth = 10; g.beginPath(); g.moveTo(-sx + 10, base - 52 - kn * 30); g.lineTo(-sx + 26, base - 20); g.moveTo(sx - 10, base - 52); g.lineTo(sx - 26, base - 20); g.stroke();
      g.restore();
    });
    screen.material.color.setScalar(0.35 + 0.65 * pw);
    glow.intensity = 0.6 * pw; bp.strength = 0.55;

    // ---- assembly (s6 start) and teardown (s7) ----
    const blow = t > K.s6 - 0.3 && t < K.s7 ? 1 - ramp(t, K.s6 + 0.3, A("s6:Delapan") - 0.2) : 0;
    const tear = ramp(t, off0 + 0.2, off0 + 1.4) * (t < K.s8 ? 1 : 0);
    parts.forEach((p, i) => {
      const e = Math.max(blow > 0 ? clamp01(blow * 1.4 - i * 0.04) : 0, tear);
      p.m.position.copy(p.home).addScaledVector(p.ex, e * (tear > blow ? 0.9 : 0.45));
      p.m.rotation.z = (p.m.userData.rz0 || 0) + e * (i % 2 ? 0.6 : -0.5);
    });
    // after teardown the whole scope sinks into the AUDIRA crate
    const sink = ramp(t, off0 + 1.2, A("s7:dilupakan") + 0.4) * (t < K.s8 ? 1 : 0);
    scope.position.set(0 + (-2.05 - 0) * sink, 0.93 + Math.sin(sink * Math.PI) * 0.5 - 0.6 * sink * sink, -0.15 + (0.35 + 0.15) * sink);
    scope.scale.setScalar(1 - 0.45 * sink); scope.visible = sink < 0.98;
    lidP.rotation.x = t > K.s7 && t < K.s8 ? -1.6 * (1 - ramp(t, A("s7:dilupakan") + 0.2, A("s7:dilupakan") + 0.8)) * ramp(t, off0, off0 + 0.4) : 0;
    ctl.forEach((c, i) => {
      const b6 = blow > 0 ? blow : 0;
      c.G.position.copy(c.home).add(tmp.set((i ? 1 : -1) * 0.5 * b6, 0.35 * b6, 0.4 * b6));
      const cs = ramp(t, off0 + 0.4 + i * 0.2, A("s7:dilupakan") + 0.2 + i * 0.2) * (t < K.s8 ? 1 : 0);
      c.G.position.lerp(tmp.set(-2.05, 0.75 - cs * 0.4, 0.35), cs); c.G.visible = cs < 0.97; c.wire.visible = cs < 0.05 && b6 < 0.05;
      c.knob.rotation.y = i === 0 ? kn : Math.sin(t * 1.3) * 0.15;
      // button presses on each hit, the left player hits on even volleys
      const ph = (t / BALL.P) % 2, hitPh = i === 0 ? 0 : 1, d = Math.min(Math.abs(ph - hitPh), Math.abs(ph - hitPh - 2), Math.abs(ph - hitPh + 2));
      c.btn.position.y = 0.078 - (d < 0.06 ? 0.008 : 0);
    });
    amber.material.color.setRGB(1.1 * dimK, 0.55 * dimK, 0.12 * dimK); amberL.intensity = 0.08 * dimK;
    needles.forEach((n, i) => { n.rotation.z = Math.sin(t * (0.9 + i * 0.4) + i) * 0.5 * dimK; });

    // ---- calendar ----
    const cross = Math.floor(20 * ramp(t, K.s6 + 0.3, A("s6:Delapan") - 0.1));
    const ring = t > A("s6:Delapan") && t < K.s7 + 1 ? back(clamp01((t - A("s6:Delapan") - 0.15) / 0.4)) : t > K.s7 ? 1 : 0;
    paintCal(t < K.s6 ? 0 : t > K.s7 ? 20 : cross, t < K.s6 ? 0 : +ring.toFixed(2));

    // ---- sign (from "Tennis" on) ----
    const sg = t > A("s6:Tennis") - 0.2 && t < K.s7 + 0.3 ? back(clamp01((t - A("s6:Tennis") + 0.2) / 0.5)) : t >= K.s8 ? 1 : 0;
    sign.scale.set(1, Math.max(0.001, sg), 1); sign.visible = sg > 0.01;

    // ---- pages flip (s4) ----
    const bk = A("s4:buku");
    pages.forEach((p, i) => { p.rotation.z = Math.PI * ramp(t, bk + 0.1 + i * 0.35, bk + 0.55 + i * 0.35) * (t < K.s6 ? 1 : 0); });

    // ---- trajectories (s4 into s5) ----
    const rd = A("s4:lintasan"), mm = A("s4:bola");
    const fm = ramp(t, rd, A("s4:rudal") + 0.7), fb = ramp(t, mm, A("s4:hambatan") + 0.4);
    const inA = t > rd - 0.2 && t < K.s5 + 0.8;
    arcs.visible = inA;
    missile.m.geometry.setDrawRange(0, Math.floor(missile.n * fm / 3) * 3);
    bounce.m.geometry.setDrawRange(0, Math.floor(bounce.n * fb / 3) * 3);
    const hp1 = missile.P[Math.min(160, Math.floor(fm * 160))], hp2 = bounce.P[Math.min(160, Math.floor(fb * 160))];
    head1.position.copy(hp1); head2.position.copy(hp2); head1.visible = fm > 0 && fm < 1; head2.visible = fb > 0 && fb < 1;
    // on the cut to s5 the arcs fly into the screen
    const fly = ramp(t, K.s5 - 0.2, K.s5 + 0.7);
    arcs.position.set(1.1 + (-0.15 - 1.1) * fly, 1.08 + (1.13 - 1.08) * fly, 0.55 + (0.2 - 0.55) * fly); arcs.scale.setScalar(1 - 0.82 * fly);
    lineM.opacity = 1 - fly; axis.material.opacity = 1 - fly; axis.material.transparent = true;

    // ---- Higinbotham pose ----
    const s2 = t > K.s2 - 0.3 && t < K.s3, s4a = t > K.s4 - 0.3 && t < A("s4:buku");
    const turn = s2 ? ramp(t, K.s2, K.s2 + 0.8) : 0;
    hig.G.rotation.y = 0.95 - 0.55 * turn;
    const reach = (t < K.s2) || (t > K.s5 && t < K.s6) || t > K.s8 ? 1 : 0;
    pose(hig, { reachR: reach * 0.9, reachL: reach * 0.75, chin: s4a ? 1 : 0, headX: reach ? 0.35 : s2 ? -0.05 : 0.1, headY: s2 ? 0.25 : 0 });
    hig.G.visible = !(t > K.s6 + 0.2 && t < K.s8);

    // ---- bored visitors (s3): slow weight shifts ----
    bored.forEach((p, i) => { p.head.rotation.set(0.05 + 0.05 * Math.sin(t * 0.7 + i), 0.25 * Math.sin(t * 0.33 + i * 2), 0); p.G.position.y = 0; });

    // ---- queue (s6 "Ratusan" .. s7) ----
    const qa = A("s6:Ratusan") - 0.4;
    queue.forEach((q, i) => {
      const k = eout(clamp01((t - qa - i * 0.07) / 1.1));
      const vis = t > qa - 0.1 && t < K.s7 + 0.3;
      q.p.G.visible = vis;
      if (!vis) return;
      const shuffle = 0.05 * Math.sin(t * 0.8 + q.ph);
      q.p.G.position.set(q.x - 2.2 * (1 - k) + shuffle, 0, q.z);
      q.p.G.rotation.y = Math.PI / 2 - 0.12;
      pose(q.p, { walk: 1 - k, ph: t * 7 + q.ph, headY: 0.15 * Math.sin(t * 0.5 + q.ph) });
    });

    // ---- courtroom: gavel taps on "sengketa" ----
    const gv = A("s7:sengketa"); const gd = t > gv && t < gv + 0.5 ? Math.sin((t - gv) / 0.5 * Math.PI * 2) : 0;
    gav.rotation.z = -0.4 * Math.max(0, gd);

    // ---- dust in the window shafts ----
    let n = 0;
    for (const L of lamps) for (let i = 0; i < 80; i++, n++) {
      const s = dustSeed[n], u = (s[0] + t * 0.012 * (0.5 + s[3])) % 1;
      wsc.copy(L.from).lerp(L.to, 0.15 + u * 0.75);
      dust.pos[n * 3] = wsc.x + (s[1] - 0.5) * (0.6 + u * 1.6) + Math.sin(t * 0.3 + n) * 0.05;
      dust.pos[n * 3 + 1] = wsc.y + (s[2] - 0.5) * 0.8 + Math.sin(t * 0.21 + n * 1.7) * 0.06;
      dust.pos[n * 3 + 2] = wsc.z + (s[3] - 0.5) * (0.6 + u * 1.4);
    }
    dust.commit();

    comp.render();
  };
}
