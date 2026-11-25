// EP36 ANODA KORBAN (ABYSSFORGE): one continuous dive along the starboard side of a steel hull.
//   HULL   side plate z=0 (x -22..22), waterline y=W(t), antifouling below, name "AUDIRA" above the waterline
//   BOW    x=-12: unprotected plate, salt ions in the water (s2), rust blooms, magnifier lens with the iron lattice (s3)
//   MID    x=0: a fresh zinc block flies in and is welded/bolted (s4), glowing electrons flow block -> hull (s5),
//          the block dissolves while the hull stays clean (s6); worn sister blocks at x=3..7 carry the hook (s1)
//   STERN  x=22..27: transom, propeller, rudder with blocks; the water drops and the dry block goes dark (s6)
//   LAB    x=31: 1 A x 1 year clock ring and 11 zinc ingots (s7)
//   1824   x=39: amber hologram of a copper-sheathed wooden hull, barnacles, generic Davy silhouette (s7)
//   DOCK   s8: the water drains, the hull stands on keel blocks in a dry dock, camera pulls back.
// Every value is a pure function of t (seek-safe). Bioluminescence = HDR basic materials so only living light blooms.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, stage } from "./lib3d.js";

const SANS = "'Arial Black', Arial, Helvetica, sans-serif", MONO = "'Courier New', monospace";
const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// teal shadows, cool highlights, gentle contrast; flash on cuts
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 }, wet: { value: 1 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;uniform float wet;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c+=wet*vec3(-0.01,0.02,0.035)*(1.0-l);c=(c-0.5)*1.06+0.5;c=mix(c,vec3(0.85,1.0,1.0),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const hdr = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: true });
const std = (c, r = 0.6, m = 0, o = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: r, metalness: m, ...o });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function rrect(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function bevelBox(w, h, d, mat, parent, x, y, z, bv = 0.04) {
  const g = new THREE.ExtrudeGeometry(rrect(w - 2 * bv, h - 2 * bv, Math.min(w, h) * 0.12), { depth: d - 2 * bv, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, -(d - 2 * bv) / 2); return mesh(g, mat, parent, x, y, z);
}
function textTex(w, h, draw) { return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); draw(g, w, h); }); }
const txt = (g, s, x, y, font, color, align = "center") => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, x, y); };
function plane(tex, w, h, parent, x, y, z, o = {}) {
  const mat = o.basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color(o.tint || 0xffffff).multiplyScalar(o.k || 1), side: THREE.DoubleSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending })
    : new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.renderOrder = 3; if (parent) parent.add(m); return m;
}
// floating HUD label (sonar style): cyan frame + text, always faces +z
function hudLabel(lines, w, parent, x, y, z, col = "#7ff3ff") {
  const H = 150 * lines.length + 40, tex = textTex(1024, H, (g, W, Hh) => {
    g.fillStyle = "rgba(2,16,28,.78)"; g.fillRect(8, 8, W - 16, Hh - 16); g.strokeStyle = col; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, Hh - 16);
    lines.forEach((s, i) => txt(g, s, W / 2, 20 + 75 + i * 150, `900 ${i ? 92 : 112}px ${SANS}`, i ? "#d8fbff" : col));
  });
  const m = plane(tex, w, (w * H) / 1024, parent, x, y, z, { basic: true, k: 1.15 }); m.renderOrder = 6; return m;
}

// ---------- textures ----------
function hullTex(W) {
  // side plate: navy topsides, black boot-top at the waterline, red antifouling below; welded plate seams; the ship's name
  const L = 44, Hh = 11, px = 96; // 1 unit = 96 px
  return canvasTex(L * px, Hh * px, (g, w, h) => {
    const yOf = (y) => (5 - y) * px; // world y 5 at the top of the texture, -6 at the bottom
    g.fillStyle = "#1c2c40"; g.fillRect(0, 0, w, yOf(0.35));
    g.fillStyle = "#151719"; g.fillRect(0, yOf(0.35), w, yOf(-0.45) - yOf(0.35));
    g.fillStyle = "#8a3426"; g.fillRect(0, yOf(-0.45), w, h - yOf(-0.45));
    const R = mulberry(36);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "0,0,0" : "255,255,255"},${0.02 + R() * 0.04})`; g.fillRect(R() * w, R() * h, 2 + R() * 10, 1 + R() * 3); }
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 5;
    for (let x = 0; x < w; x += 3.2 * px) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (const y of [3.4, 1.6, -1.0, -2.9, -4.6]) { g.beginPath(); g.moveTo(0, yOf(y)); g.lineTo(w, yOf(y)); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2;
    for (let x = 4; x < w; x += 3.2 * px) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    // draught marks + name
    for (let k = 0; k < 6; k++) txt(g, String(2 + k * 2), 3.0 * px, yOf(-0.9 - k * 0.8), `900 46px ${SANS}`, "#f2f2ea");
    txt(g, "AUDIRA", (22 + 2.5) * px, yOf(2.55), `900 ${2.0 * px}px ${SANS}`, "#f4f1e6");
    txt(g, "CARA KERJA BENDA", (22 + 2.5) * px, yOf(1.3), `900 ${0.46 * px}px ${SANS}`, "#c9d6e2");
  });
}
function rustTex(seed) {
  const R = mulberry(seed);
  return textTex(256, 256, (g) => {
    for (let i = 0; i < 70; i++) {
      const x = 128 + (R() - 0.5) * 150, y = 128 + (R() - 0.5) * 150, r = 10 + R() * 50;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); const c = R() < 0.6 ? "176,82,30" : "110,48,20";
      gr.addColorStop(0, `rgba(${c},.85)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "60,25,10" : "215,120,50"},.7)`; g.fillRect(128 + (R() - 0.5) * 170, 128 + (R() - 0.5) * 170, 2 + R() * 4, 2 + R() * 4); }
  });
}
const pitTex = textTex(512, 256, (g) => { const R = mulberry(9); for (let i = 0; i < 160; i++) { const x = R() * 512, y = R() * 256, r = 3 + R() * 16; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(40,44,48,.9)"); gr.addColorStop(1, "rgba(40,44,48,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } });

// ---------- zinc anode: bevelled block, steel straps, bolts, cast lettering ----------
const ZN = std("#a9b3b8", 0.42, 0.75), STEEL = std("#4b5560", 0.5, 0.8), BOLT = std("#d0d6da", 0.3, 0.9);
function anode(parent, x, y, z, s = 1, name = "AUDIRA · ZN") {
  const G = new THREE.Group(); G.position.set(x, y, z); G.scale.setScalar(s); parent.add(G);
  const body = new THREE.Group(); G.add(body);
  bevelBox(1.0, 0.4, 0.2, ZN, body, 0, 0, 0.1, 0.045);
  const cast = plane(textTex(512, 160, (g, w, h) => txt(g, name, w / 2, h / 2, `900 64px ${SANS}`, "rgba(70,78,84,.95)")), 0.86, 0.27, body, 0, 0, 0.205, { metal: 0.6, rough: 0.5 });
  const pits = plane(pitTex, 0.98, 0.4, body, 0, 0, 0.207, { metal: 0.3 }); pits.material.opacity = 0;
  for (const sx of [-0.62, 0.62]) { bevelBox(0.26, 0.14, 0.06, STEEL, G, sx, 0, 0.04, 0.015); mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6).rotateX(Math.PI / 2), BOLT, G, sx, 0, 0.09); }
  const glow = mesh(new THREE.PlaneGeometry(1.5, 0.8), hdr(0x56f0ff, 1).clone(), G, 0, 0, 0.03); glow.material.transparent = true; glow.material.blending = THREE.AdditiveBlending; glow.material.depthWrite = false; glow.material.opacity = 0; glow.castShadow = false;
  glow.material.map = textTex(256, 128, (g) => { const gr = g.createRadialGradient(128, 64, 10, 128, 64, 128); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); });
  return {
    G, set(eat, gl = 0, dark = 0) {
      const k = 1 - 0.5 * eat; body.scale.set(1 - 0.18 * eat, k, k);
      pits.material.opacity = clamp01(eat * 1.6); cast.material.opacity = 1 - 0.7 * eat;
      ZN.color.set("#a9b3b8"); glow.material.opacity = gl; body.children[0].material = dark > 0.5 ? ZN_DARK : ZN;
    },
  };
}
const ZN_DARK = std("#5f676b", 0.7, 0.5);

// ---------- human figure (generic silhouette, shoulders wider than waist, bent joints) ----------
function person(mat) {
  const G = new THREE.Group(), add = (geo, p, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  add(new THREE.CylinderGeometry(0.2, 0.15, 0.62, 12), G, 0, 1.18, 0);           // torso (wide shoulders)
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), G, 0, 1.54, 0);            // neck
  add(new THREE.SphereGeometry(0.14, 16, 12), G, 0, 1.7, 0);                     // head
  add(new THREE.CylinderGeometry(0.16, 0.17, 0.05, 16), G, 0, 1.8, 0);           // hat brim
  add(new THREE.CylinderGeometry(0.11, 0.12, 0.2, 16), G, 0, 1.9, 0);            // top hat
  add(new THREE.CylinderGeometry(0.21, 0.17, 0.22, 12), G, 0, 0.82, 0);          // coat tail / hips
  const limb = (x, y, a1, a2, len) => { const s = new THREE.Group(); s.position.set(x, y, 0); s.rotation.z = a1; G.add(s); add(new THREE.CylinderGeometry(0.05, 0.045, len, 8), s, 0, -len / 2, 0); const e = new THREE.Group(); e.position.y = -len; e.rotation.x = a2; s.add(e); add(new THREE.CylinderGeometry(0.045, 0.04, len, 8), e, 0, -len / 2, 0); return { s, e }; };
  const armL = limb(-0.24, 1.46, 0.18, -0.5, 0.3), armR = limb(0.24, 1.46, -0.18, -0.9, 0.3);
  const legL = limb(-0.09, 0.74, 0.04, 0.12, 0.38), legR = limb(0.09, 0.74, -0.04, 0.12, 0.38);
  return { G, armL, armR, legL, legR };
}

// ---------- glowing particles riding curves ----------
function riders(parent, curves, n, mat, r) {
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), mat, n); im.frustumCulled = false; parent.add(im);
  const o = new THREE.Object3D();
  return (t, amt, speed = 0.35) => {
    im.visible = amt > 0.01;
    for (let i = 0; i < n; i++) {
      const cv = curves[i % curves.length], u = ((i / n) * 3.7 + t * speed) % 1;
      cv.getPoint(u, o.position); o.scale.setScalar(Math.max(0.001, amt * Math.min(1, Math.sin(Math.PI * u) * 3))); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  };
}
const cv3 = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: 0x0b3a52, fog: 0.05, exp: 1.15, bloom: [0.55, 0.5, 0.78] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  {
    const pmg = new THREE.PMREMGenerator(r), s = new THREE.Scene(); s.background = new THREE.Color(0x0a2233);
    for (const [w, h, c, i, x, y, z] of [[8, 3, 0x9fe6ff, 1.4, 0, 6, 0], [5, 5, 0x3a7fa0, 0.7, 5, 1, 3], [6, 2, 0x10202c, 0.5, 0, -4, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); }
    scene.environment = pmg.fromScene(s, 0.04).texture; pmg.dispose();
  }
  scene.environmentIntensity = 0.35;
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  const hemi = new THREE.HemisphereLight(0x9fe2ff, 0x07131d, 1.1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xc6f0ff, 2.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 60 }); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
  scene.add(key); scene.add(key.target);
  const fill = new THREE.DirectionalLight(0x7fc4ff, 0.9); scene.add(fill); scene.add(fill.target);
  const rim = new THREE.DirectionalLight(0xc070ff, 0.7); scene.add(rim); scene.add(rim.target);
  const camLamp = new THREE.PointLight(0xd9f6ff, 3.0, 9, 1.4); scene.add(camLamp); // submersible lamp riding with the camera

  // ============ HULL ============
  const HULL = new THREE.Group(); scene.add(HULL);
  const plateMat = std(0xffffff, 0.55, 0.35, { map: hullTex() });
  mesh(new THREE.PlaneGeometry(44, 11), plateMat, HULL, 0, -0.5, 0);
  { // bilge turn + bottom (same antifouling red)
    const red = std("#7a2e22", 0.6, 0.3);
    const bil = mesh(new THREE.CylinderGeometry(3, 3, 44, 32, 1, true, -Math.PI / 2, Math.PI / 2), red, HULL, 0, -6, -3); bil.rotation.set(0, 0, Math.PI / 2);
    const bot = mesh(new THREE.PlaneGeometry(44, 6), red, HULL, 0, -9, -6); bot.rotation.x = Math.PI / 2;
    const tr = mesh(new THREE.PlaneGeometry(12, 15), std("#1c2c40", 0.55, 0.35, { side: THREE.DoubleSide }), HULL, 22, -1.5, -6); tr.rotation.y = Math.PI / 2;
    const deck = mesh(new THREE.BoxGeometry(44, 0.3, 12), std("#3a4654", 0.7, 0.2), HULL, 0, 5.15, -6);
    for (let i = 0; i < 12; i++) mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), STEEL, HULL, -20 + i * 3.6, 5.8, 0.05); // rails
    const rl = mesh(new THREE.BoxGeometry(44, 0.05, 0.05), STEEL, HULL, 0, 6.3, 0.05);
  }
  // worn sister blocks (hook) + hero block (s4)
  const sisters = [anode(HULL, 3.4, -1.7, 0, 1, "AUDIRA · ZN 02"), anode(HULL, 5.4, -1.7, 0, 1, "AUDIRA · ZN 03"), anode(HULL, 7.4, -1.7, 0, 1, "AUDIRA · ZN 04"), anode(HULL, 5.4, -3.4, 0, 1, "AUDIRA · ZN 05")];
  const hero = anode(scene, 0, -1.7, 0, 1, "AUDIRA · ZN 01");
  // rust blooms at the bow
  const rusts = []; { const R = mulberry(11); for (let i = 0; i < 14; i++) { const m = plane(rustTex(100 + i), 1, 1, HULL, -12 + (R() - 0.5) * 5, -1.7 + (R() - 0.5) * 2.6, 0.012 + i * 0.001, { rough: 0.9 }); m.userData = { s: 0.6 + R() * 1.2, d: R() * 0.6 }; rusts.push(m); } }
  // protection sheen around the hero block (s5-s6)
  const sheen = plane(textTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "rgba(120,240,255,.55)"); gr.addColorStop(1, "rgba(120,240,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), 9, 5, HULL, -0.5, -1.7, 0.02, { basic: true, add: true, k: 1 });

  // ============ WATER ============
  const surfTex = canvasTex(256, 256, (g) => { const R = mulberry(4); g.fillStyle = "#3fa9c9"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(220,255,255,${0.15 + R() * 0.3})`; g.lineWidth = 1 + R() * 3; g.beginPath(); const x = R() * 256, y = R() * 256; g.moveTo(x, y); g.bezierCurveTo(x + 20, y - 10, x + 40, y + 10, x + 60, y); g.stroke(); } }, [24, 24]);
  const surf = mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ color: 0x7fd6ee, map: surfTex, transparent: true, opacity: 0.82, side: THREE.DoubleSide, roughness: 0.15, metalness: 0.1, emissive: new THREE.Color(0x1d6d86), emissiveIntensity: 0.6, depthWrite: false }), scene, 0, 0, 0);
  surf.rotation.x = -Math.PI / 2; surf.castShadow = false; surf.receiveShadow = false;
  // god-rays from the surface (additive cones), they follow the camera in x
  const rays = new THREE.Group(); scene.add(rays);
  const rayMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x9fe9ff).multiplyScalar(0.35), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  { const R = mulberry(21); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.6 + R() * 0.9, 9, 16, 1, true), rayMat); m.position.set(-8 + i * 2.7, -4.5, 1.5 + R() * 4); m.rotation.z = 0.15 + R() * 0.1; m.userData.p = R() * 6; rays.add(m); } }
  // marine snow: tiny flakes wrapped in a box around the camera
  const NS = 1600, snowPos = new Float32Array(NS * 3), snowBase = []; { const R = mulberry(52); for (let i = 0; i < NS; i++) snowBase.push([R() * 16, R() * 12, R() * 12, R()]); }
  const snowGeo = new THREE.BufferGeometry(); snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xcfefff, size: 0.028, transparent: true, opacity: 0.75, depthWrite: false })); snow.frustumCulled = false; scene.add(snow);
  // salt ions (s2): Na+ cyan, Cl- magenta, bobbing near the bow
  const ionIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), 46); ionIM.frustumCulled = false; scene.add(ionIM);
  const ionD = []; { const R = mulberry(77); const cA = new THREE.Color(0x56f0ff).multiplyScalar(2.2), cB = new THREE.Color(0xff5ad8).multiplyScalar(2.0); for (let i = 0; i < 46; i++) { ionD.push([-15 + R() * 8, -3.2 + R() * 3.0, 0.5 + R() * 3.2, R() * 6]); ionIM.setColorAt(i, i % 2 ? cA : cB); } }
  // salt-bridge current lines in s2 (water conducts): faint arcs between ions
  const sparkCurves = [cv3([[-14, -2.6, 1.2], [-12.5, -1.6, 2.2], [-11, -2.2, 1.0]]), cv3([[-13.5, -0.8, 2.6], [-12, -1.2, 1.6], [-10.2, -0.6, 2.2]]), cv3([[-15, -1.8, 2.0], [-13, -2.8, 2.8], [-11.5, -1.4, 3.0]])];
  const sparkR = riders(scene, sparkCurves, 30, hdr(0x9ffcff, 2.0), 0.03);

  // ============ LENS (s3): iron lattice, electrons leave, Fe ions dissolve ============
  const LENS = new THREE.Group(); LENS.position.set(-12, -1.5, 1.3); scene.add(LENS);
  mesh(new THREE.TorusGeometry(1.25, 0.035, 12, 96), hdr(0x56f0ff, 2.2), LENS, 0, 0, 0).castShadow = false;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.24, 64), new THREE.MeshBasicMaterial({ color: 0x03121d, transparent: true, opacity: 0.88 })); disc.position.z = -0.02; LENS.add(disc);
  const ATOM = std("#9aa0a6", 0.35, 0.85); const atoms = [];
  for (let c = 0; c < 4; c++) for (let rr = 0; rr < 7; rr++) { const y = -0.78 + rr * 0.26, x = -0.95 + c * 0.24; if (x * x + y * y > 1.1) continue; const m = mesh(new THREE.SphereGeometry(0.11, 18, 14), ATOM, LENS, x, y, 0.05); m.userData = { c, rr }; atoms.push(m); }
  const feIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 14, 12), hdr(0xffa040, 2.3), 5); feIM.frustumCulled = false; LENS.add(feIM);
  const elIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 10, 8), hdr(0x56f0ff, 3.0), 18); elIM.frustumCulled = false; LENS.add(elIM);
  const lensLab = [hudLabel(["BESI (Fe)"], 1.1, LENS, -0.45, 0.85, 0.1), hudLabel(["ELEKTRON"], 1.1, LENS, -0.45, -0.88, 0.1), hudLabel(["IKUT LARUT"], 1.15, LENS, 0.55, 0.42, 0.1, "#ffb060")];
  lensLab[2].material.color.set(0xffffff);

  // ============ ELECTRON FLOW (s5) ============
  const eCurves = [[-3.2, -0.9], [-2.8, -2.8], [2.0, -2.9], [-4.4, -1.8], [1.6, -0.6], [-1.6, -3.4]].map(([x, y]) => cv3([[0, -1.7, 0.24], [x * 0.45, -1.7 + (y + 1.7) * 0.45, 0.16], [x, y, 0.06]]));
  const eFlow = riders(scene, eCurves, 54, hdr(0x56f0ff, 3.0), 0.045);
  const labA = hudLabel(["ANODA  −", "SENG / ALUMINIUM"], 1.0, scene, 0.15, -0.95, 0.6), labS = hudLabel(["BAJA  +"], 0.9, scene, -1.9, -2.75, 0.4);
  // zinc ions leaving the dissolving block (s6)
  const znIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), hdr(0xdbe8ff, 1.9), 16); znIM.frustumCulled = false; scene.add(znIM);
  // weld sparks (s4)
  const spIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.025, 6, 5), hdr(0xfff0b0, 3.0), 26); spIM.frustumCulled = false; scene.add(spIM);
  const weldL = new THREE.PointLight(0xfff2c0, 0, 4, 2); weldL.position.set(-0.6, -1.7, 0.4); scene.add(weldL);

  // ============ STERN ============
  const STERN = new THREE.Group(); scene.add(STERN);
  const BRONZE = std("#b8893f", 0.3, 0.9);
  mesh(new THREE.CylinderGeometry(0.22, 0.22, 3, 16).rotateZ(Math.PI / 2), STEEL, STERN, 23.3, -3.6, -6);
  const prop = new THREE.Group(); prop.position.set(24.6, -3.6, -6); STERN.add(prop);
  mesh(new THREE.SphereGeometry(0.42, 20, 16), BRONZE, prop, 0, 0, 0);
  for (let i = 0; i < 4; i++) { const b = new THREE.Group(); b.rotation.x = (i * Math.PI) / 2; prop.add(b); const bl = mesh(new THREE.SphereGeometry(1, 20, 14), BRONZE, b, 0, 1.0, 0); bl.scale.set(0.12, 0.95, 0.45); bl.rotation.y = 0.5; }
  { const ring = mesh(new THREE.TorusGeometry(0.34, 0.09, 10, 24).rotateY(Math.PI / 2), ZN, STERN, 23.7, -3.6, -6); }
  const rudder = new THREE.Group(); rudder.position.set(26.6, 0, -6); STERN.add(rudder);
  bevelBox(1.8, 5.6, 0.36, std("#7a2e22", 0.6, 0.3), rudder, 0, -3.7, 0, 0.08);
  mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.6, 12), STEEL, rudder, 0, 0, 0);
  const rudA = [anode(rudder, 0, -1.25, 0.2, 0.7, "AUDIRA · ZN 11"), anode(rudder, 0, -3.3, 0.2, 0.7, "AUDIRA · ZN 12"), anode(rudder, 0, -5.2, 0.2, 0.7, "AUDIRA · ZN 13")];
  
  const trA = [anode(STERN, 22.02, -2.4, -2.5, 0.8, "AUDIRA · ZN 09"), anode(STERN, 22.02, -4.6, -3.6, 0.8, "AUDIRA · ZN 10")]; trA.forEach((a) => (a.G.rotation.y = Math.PI / 2));
  const dryX = hudLabel(["KERING = TIDAK", "MELINDUNGI"], 1.5, scene, 27.6, -0.3, -4.5, "#ff7a8a");
  const sternLab = hudLabel(["BURITAN"], 1.4, scene, 23.6, -1.2, -3.0);

  // ============ LAB (s7): 1 A x 1 year clock ring behind a stack of 11 zinc ingots ============
  const LAB = new THREE.Group(); LAB.position.set(31, -3.6, 0); scene.add(LAB);
  mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.2, 48), std("#2b3a46", 0.6, 0.4), LAB, 0, -0.1, 0);
  const ringMat = hdr(0x56f0ff, 2.4); ringMat.side = THREE.DoubleSide;
  const year = mesh(new THREE.RingGeometry(0.9, 0.98, 96, 1, Math.PI / 2, 0.001), ringMat, LAB, 0, 0.95, -0.5); year.castShadow = false;
  const yearBase = mesh(new THREE.RingGeometry(0.9, 0.98, 96), new THREE.MeshBasicMaterial({ color: 0x1b4a5c, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), LAB, 0, 0.95, -0.52); yearBase.castShadow = false;
  const ingots = []; { const rows = [4, 3, 2, 1, 1]; let i = 0; rows.forEach((n, row) => { for (let k = 0; k < n; k++) { const m = bevelBox(0.46, 0.15, 0.24, ZN, LAB, (k - (n - 1) / 2) * 0.5 + (row === 4 ? 0.0 : 0), 0.08 + row * 0.16, row === 4 ? 0.32 : 0, 0.025); if (row === 4) m.position.y = 0.08; ingots[i++] = m; } }); }
  // ============ 1824 hologram: copper-sheathed wooden hull panel, barnacles, generic Davy silhouette ============
  const H = new THREE.Group(); H.position.set(39.5, -3.4, -0.5); scene.add(H);
  const holo = (c, o = 0.55) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.6), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const AMB = holo(0xffa04a, 0.5), COP = holo(0xff8a3a, 0.55), WOOD = holo(0x9a6a3a, 0.35);
  mesh(new THREE.PlaneGeometry(2.2, 1.95), WOOD, H, -0.5, 1.2, 0).castShadow = false;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) mesh(new THREE.PlaneGeometry(0.38, 0.4), COP, H, -1.34 + i * 0.42, 0.56 + j * 0.43, 0.02).castShadow = false;
  const barn = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.1, 7), holo(0xfff1d0, 0.85), 60); barn.frustumCulled = false; H.add(barn);
  const barnD = []; { const R = mulberry(1824); for (let i = 0; i < 60; i++) barnD.push([-1.5 + R() * 2.0, 0.4 + R() * 1.6, R()]); }
  const davy = person(AMB); davy.G.position.set(1.0, -0.2, 0.3); davy.G.rotation.y = -0.4; H.add(davy.G);
  mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.05, 64), holo(0xffa04a, 0.25), H, -0.1, -0.25, 0).castShadow = false;

  // ============ DRY DOCK (s8) ============
  const DOCK = new THREE.Group(); scene.add(DOCK);
  mesh(new THREE.BoxGeometry(80, 0.4, 40), std("#5b6168", 0.85, 0.1), DOCK, 4, -9.4, -4);
  for (let i = 0; i < 9; i++) mesh(new THREE.BoxGeometry(0.9, 0.6, 1.4), std("#6d5236", 0.8, 0), DOCK, -16 + i * 4, -9.0, -6);
  const wallM = std("#4a5058", 0.9, 0.05); mesh(new THREE.BoxGeometry(80, 12, 1), wallM, DOCK, 4, -3.5, -24); for (let i = 0; i < 8; i++) mesh(new THREE.BoxGeometry(80, 0.15, 0.4), std("#3b4047", 0.9), DOCK, 4, -8 + i * 1.5, -23.4);
  const flood = []; for (const fx of [-10, 6, 20]) { const l = new THREE.SpotLight(0xffd6a0, 0, 60, 0.6, 0.5, 1.2); l.position.set(fx, 14, 18); l.target.position.set(fx * 0.5, -2, 0); scene.add(l); scene.add(l.target); flood.push(l); mesh(new THREE.SphereGeometry(0.25, 12, 10), hdr(0xffe0b0, 3), DOCK, fx, 14, 18); }

  // ============ CAMERA ============
  const s = (k) => K[k];
  const cam1 = track([
    [0, 6.0, -1.25, 3.3, 5.2, -1.75, 0],
    [s("s2") - 0.2, 4.6, -1.0, 4.8, 4.6, -1.8, 0],
    [A("s2:Garamnya"), -9.0, -1.2, 6.6, -11, -1.7, 1.2],
    [A("s2:berkarat"), -11.8, -1.3, 8.0, -12, -1.7, 0.5],
    [s("s3") + 0.6, -12, -1.4, 9.9, -12, -1.65, 1.3],
    [s("s4") - 0.3, -11.6, -1.3, 9.4, -12, -1.6, 1.3],
    [A("s4:Penangkalnya") + 1.0, -2.6, -1.2, 5.0, -0.2, -1.6, 0.4],
    [A("s4:dilas"), 0.4, -1.3, 3.4, 0, -1.7, 0],
    [s("s5") + 0.2, 0.3, -1.1, 4.2, -0.2, -1.75, 0],
    [A("s5:mengalir"), -0.9, -1.0, 6.4, -1.0, -1.85, 0],
    [s("s6") + 0.3, 0.5, -1.4, 3.4, 0, -1.7, 0],
    [A("s6:buritan") - 0.6, 1.0, -1.6, 4.0, 0.3, -1.8, 0],
    [A("s6:buritan") + 0.8, 20.5, -2.8, 6.0, 24.2, -3.2, -4.5],
    [A("s6:terendam") - 0.3, 23.5, -3.0, 4.6, 26.4, -2.2, -5.2],
    [s("s7") - 0.3, 24.0, -3.2, 4.2, 26.6, -1.8, -5.6],
    [s("s7") + 1.0, 30.6, -2.4, 6.6, 31, -2.75, 0],
    [A("s7:seng") + 0.6, 31.3, -2.5, 6.0, 31, -2.75, 0],
    [A("s7:Davy") - 0.2, 39.2, -2.2, 8.4, 39.4, -2.45, -0.5],
    [A("s7:dihentikan"), 39.6, -2.3, 7.8, 39.4, -2.45, -0.5],
    [s("s8") + 1.4, 12, 1.6, 17, 5, -0.4, 0],
    [A("s8:naik") + 1.2, 7, 3.6, 23, 3.5, -0.6, 0],
    [s("end"), 6, 5.6, 28, 3, -1.0, 0],
  ]);
  // water level: drops at "kering" (s6) to bare the top rudder block, refills by s7, drains in s8 (dry dock)
  const W = (t) => -1.9 * (ramp(t, A("s6:udara") - 0.5, A("s6:udara") + 0.4) - ramp(t, s("s7") - 0.6, s("s7") + 0.2)) - 10 * ramp(t, s("s8") - 0.2, A("s8:naik") + 0.8);
  const o3 = new THREE.Object3D(), tmp = new THREE.Vector3();
  const fogW = new THREE.Color(0x0b3a52), fogA = new THREE.Color(0x172434), bgC = new THREE.Color();

  return (t) => {
    const [cx, cy, cz, lx, ly, lz] = cam1(t);
    const sway = 0.04 * Math.sin(t * 0.7), bob = 0.03 * Math.sin(t * 0.9 + 1);
    cam.position.set(cx + sway, cy + bob, cz); cam.lookAt(lx, ly, lz);
    const wl = W(t); surf.position.y = wl; surf.material.map.offset.set(t * 0.01, t * 0.006);
    const under = clamp01((wl - cy) / 0.6 + 0.5); // 1 = camera underwater
    bgC.copy(fogA).lerp(fogW, under); scene.background.copy(bgC); scene.fog.color.copy(bgC); scene.fog.density = 0.012 + 0.04 * under;
    gradeP.uniforms.wet.value = under;
    hemi.intensity = 0.9 + 0.3 * (1 - under);
    key.position.set(cx - 3, 12, 6); key.target.position.set(lx, ly, lz); key.color.setHex(under > 0.5 ? 0xc6f0ff : 0xffe2bc);
    fill.position.set(cx + 6, cy + 1, cz + 8); fill.target.position.set(lx, ly, lz);
    rim.position.set(lx - 6, ly + 3, lz - 8); rim.target.position.set(lx, ly, lz);
    camLamp.position.set(cx + 0.4, cy + 0.3, cz - 0.4); camLamp.intensity = 3.0 * under;
    flood.forEach((l) => (l.intensity = 900 * (1 - under) * ramp(t, s("s8"), s("s8") + 1)));
    DOCK.visible = t > s("s8") - 0.3;
    rays.visible = under > 0.05; rays.position.x = cx; rays.position.y = wl; rays.children.forEach((m) => { m.material.opacity = 0.2; m.scale.x = 1 + 0.15 * Math.sin(t * 0.8 + m.userData.p); });
    // marine snow drifts slowly down, wrapped around the camera
    for (let i = 0; i < NS; i++) { const b = snowBase[i]; const x = ((b[0] + t * 0.05 * (b[3] - 0.5) - cx) % 16 + 16) % 16 - 8 + cx; const y = ((b[1] - t * 0.08 * (0.5 + b[3]) - cy) % 12 + 12) % 12 - 6 + cy; const z = ((b[2] - cz) % 12 + 12) % 12 - 9 + cz; snowPos[i * 3] = x; snowPos[i * 3 + 1] = Math.min(y, wl - 0.05); snowPos[i * 3 + 2] = z; }
    snowGeo.attributes.position.needsUpdate = true; snow.material.opacity = 0.75 * under;

    // ---- hook: worn sister blocks, glowing on "habis"
    const hk = ramp(t, A("s1:habis") - 0.4, A("s1:habis") + 0.3) * (1 - ramp(t, s("s2"), s("s2") + 0.6));
    sisters.forEach((a, i) => a.set([0.62, 0.78, 0.4, 0.55][i] - 0.12 * (1 - ramp(t, 0, A("s1:habis") + 0.6)) , (i === 1 ? 0.6 : 0.25) * hk + 0.12 * Math.sin(t * 2 + i) * hk));

    // ---- s2: ions, conduction, rust
    const ion = ramp(t, A("s2:Garamnya") - 0.3, A("s2:Garamnya") + 0.6) * (1 - ramp(t, s("s3") + 1.5, s("s3") + 2.5));
    ionD.forEach((d, i) => { o3.position.set(d[0] + 0.3 * Math.sin(t * 0.4 + d[3]), d[1] + 0.25 * Math.sin(t * 0.6 + d[3] * 2), d[2]); o3.scale.setScalar(Math.max(0.001, ion)); o3.updateMatrix(); ionIM.setMatrixAt(i, o3.matrix); });
    ionIM.instanceMatrix.needsUpdate = true;
    sparkR(t, ramp(t, A("s2:menghantarkan") - 0.3, A("s2:listrik")) * (1 - ramp(t, s("s3") - 0.3, s("s3") + 0.3)), 0.5);
    const rg = ramp(t, A("s2:Akibatnya") - 0.2, A("s2:berkarat") + 1.4);
    rusts.forEach((m) => { const k = clamp01((rg - m.userData.d * 0.5) / 0.6) * (t > s("s8") ? 0 : 1); m.scale.setScalar(Math.max(0.001, m.userData.s * k)); m.material.opacity = k; });

    // ---- s3 lens
    const ln = back(ramp(t, s("s3") - 0.2, s("s3") + 0.6), 1.2) * (1 - ramp(t, s("s4") - 0.5, s("s4")));
    LENS.visible = ln > 0.01; LENS.scale.setScalar(Math.max(0.001, ln)); LENS.lookAt(cam.position);
    const el = ramp(t, A("s3:elektron") - 0.5, A("s3:elektron") + 0.2), dis = ramp(t, A("s3:larut") - 0.6, A("s3:larut") + 0.4);
    lensLab[0].material.opacity = ramp(t, A("s3:besi") - 0.3, A("s3:besi") + 0.2); lensLab[1].material.opacity = el; lensLab[2].material.opacity = dis;
    for (let i = 0; i < 18; i++) { const u = ((t * 0.35 + i / 18) % 1); const row = i % 6; o3.position.set(-0.3 - u * 0.75, -0.65 + row * 0.26 - 0.1 * u, 0.2); o3.scale.setScalar(Math.max(0.001, el * Math.sin(Math.PI * u))); o3.updateMatrix(); elIM.setMatrixAt(i, o3.matrix); }
    elIM.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 5; i++) { const u = ((t * 0.18 + i / 5) % 1); o3.position.set(-0.23 + u * 1.15, -0.55 + i * 0.28 + 0.15 * Math.sin(u * 5 + i), 0.15); o3.scale.setScalar(Math.max(0.001, dis * Math.min(1, u * 6) * (1 - u * 0.4))); o3.updateMatrix(); feIM.setMatrixAt(i, o3.matrix); }
    feIM.instanceMatrix.needsUpdate = true;
    atoms.forEach((a) => { const surfAtom = a.userData.c === 3; a.scale.setScalar(surfAtom ? 1 - 0.35 * dis * (0.5 + 0.5 * Math.sin(t * 2 + a.userData.rr)) : 1); });

    // ---- s4: hero block flies in, welded and bolted
    const fly = eout(ramp(t, A("s4:Balok") - 0.4, A("s4:dilas") + 0.1));
    hero.G.visible = t > s("s4") - 0.3;
    hero.G.position.set(1.8 * (1 - fly), -1.7 + 1.0 * (1 - fly), 2.4 * (1 - fly) + 0.0); hero.G.rotation.set(0.6 * (1 - fly), -0.9 * (1 - fly), 0.3 * (1 - fly));
    const weld = t > A("s4:dilas") - 0.1 && t < A("s4:dibaut") + 0.9 ? 1 : 0;
    weldL.intensity = weld * (4 + 3 * Math.sin(t * 47));
    for (let i = 0; i < 26; i++) { const ph = (t * 2.2 + i * 0.37) % 1; const side = i % 2 ? 0.62 : -0.62; const a = i * 2.4; o3.position.set(side + Math.cos(a) * ph * 0.6, -1.7 + Math.sin(a) * ph * 0.5 - ph * ph * 0.4, 0.25 + ph * 0.3); o3.scale.setScalar(Math.max(0.001, weld * (1 - ph))); o3.updateMatrix(); spIM.setMatrixAt(i, o3.matrix); }
    spIM.instanceMatrix.needsUpdate = true;
    // ---- s5: battery, electrons flow block -> hull
    const flow = ramp(t, A("s5:elektron") - 0.6, A("s5:mengalir") + 0.2) * (1 - ramp(t, A("s6:buritan") - 0.6, A("s6:buritan")));
    eFlow(t, flow, 0.45);
    labA.material.opacity = ramp(t, A("s4:seng") - 0.3, A("s4:seng") + 0.3) * (1 - ramp(t, A("s6:buritan") - 0.8, A("s6:buritan") - 0.3));
    labS.material.opacity = ramp(t, A("s5:baja") - 0.3, A("s5:baja") + 0.3) * (1 - ramp(t, A("s6:buritan") - 0.8, A("s6:buritan") - 0.3));
    const prot = ramp(t, A("s5:mengalir"), A("s5:mengalir") + 1.2) * (1 - ramp(t, A("s6:buritan") - 0.5, A("s6:buritan")));
    sheen.material.opacity = 0.5 * prot * (0.8 + 0.2 * Math.sin(t * 3));
    // ---- s6: block dissolves, zinc ions drift away
    const eat = ramp(t, A("s6:larut") - 0.6, A("s6:korban") + 0.6) * 0.6;
    hero.set(eat, 0.55 * flow + 0.15 * Math.sin(t * 4) * flow);
    for (let i = 0; i < 16; i++) { const u = ((t * 0.3 + i / 16) % 1); o3.position.set(-0.45 + (i % 4) * 0.3 + 0.15 * Math.sin(u * 6 + i), -1.6 + u * 1.3, 0.25 + u * 1.2); o3.scale.setScalar(Math.max(0.001, (eat > 0.02 && t < A("s6:buritan") ? 1 : 0) * (1 - u))); o3.updateMatrix(); znIM.setMatrixAt(i, o3.matrix); }
    znIM.instanceMatrix.needsUpdate = true;
    // ---- stern
    STERN.visible = t > A("s6:buritan") - 1.5 && t < s("s7") + 2;
    prop.rotation.x = t * 0.25;
    sternLab.material.opacity = ramp(t, A("s6:buritan"), A("s6:buritan") + 0.4) * (1 - ramp(t, A("s6:terendam") - 0.6, A("s6:terendam")));
    const dry = ramp(t, A("s6:udara") - 0.2, A("s6:udara") + 0.6) * (1 - ramp(t, s("s7") - 0.6, s("s7")));
    const sternGlow = ramp(t, A("s6:buritan"), A("s6:buritan") + 0.6) * (1 - ramp(t, s("s7") + 0.5, s("s7") + 1.2)) * (t < s("s8") ? 1 : 0);
    rudA.forEach((a, i) => a.set(0.15, i === 0 ? sternGlow * 0.5 * (1 - dry) : sternGlow * 0.5, i === 0 ? dry : 0));
    trA.forEach((a) => a.set(0.2, sternGlow * 0.45));
    dryX.material.opacity = dry;
    // ---- s7 lab: year ring sweeps, ingots appear one by one
    LAB.visible = t > s("s7") - 1.5 && t < A("s7:Davy") + 1.5;
    const yr = ramp(t, A("s7:ampere") - 0.2, A("s7:seng") + 0.2);
    year.geometry.dispose(); year.geometry = new THREE.RingGeometry(0.9, 0.98, 96, 1, Math.PI / 2, Math.max(0.001, Math.PI * 2 * yr)); year.scale.x = -1;
    ingots.forEach((m, i) => { const p = back(clamp01((yr * 11 - i) / 1.0), 1.4); m.scale.setScalar(Math.max(0.001, p)); });
    LAB.rotation.y = 0.15 * Math.sin(t * 0.3);
    // ---- 1824 hologram
    H.visible = t > A("s7:Davy") - 2.5 && t < s("s8") + 0.5;
    const hIn = ramp(t, A("s7:Davy") - 1.2, A("s7:Davy") + 0.3), stop = ramp(t, A("s7:dihentikan") - 0.2, A("s7:dihentikan") + 0.5);
    const flick = (1 - stop * (0.55 + 0.35 * Math.sin(t * 31) * Math.sin(t * 7)));
    for (const m of [AMB, COP, WOOD]) m.opacity = (m === WOOD ? 0.35 : 0.55) * hIn * flick;
    H.scale.setScalar(0.7 + 0.3 * eout(hIn));
    const grow = ramp(t, A("s7:teritip") - 0.2, A("s7:subur") + 0.6);
    barnD.forEach((d, i) => { const k = clamp01((grow * 1.4 - d[2] * 0.4)); o3.position.set(d[0], d[1], 0.18); o3.rotation.set(Math.PI / 2, 0, 0); o3.scale.setScalar(Math.max(0.001, k * (0.7 + 0.6 * d[2]))); o3.updateMatrix(); barn.setMatrixAt(i, o3.matrix); });
    barn.instanceMatrix.needsUpdate = true;
    const pt = ramp(t, A("s7:Tembaganya") - 0.4, A("s7:Tembaganya") + 0.2);
    davy.armR.s.rotation.z = -0.18 - 1.1 * pt; davy.armR.e.rotation.x = -0.9 + 0.7 * pt; davy.G.rotation.y = -0.5 + 0.1 * Math.sin(t * 0.8);
    // ---- s8: dry dock, every block in view glows once on "pengawal"
    const guard = ramp(t, A("s8:pengawal") - 0.3, A("s8:pengawal") + 0.3) * (1 - ramp(t, s("outro") - 0.5, s("outro")));
    if (t > s("s8")) { sisters.forEach((a) => a.set(0.5, 0.55 * guard)); hero.set(0.6, 0.55 * guard); }
    gradeP.uniforms.flash.value = 0.25 * Math.max(0, 1 - Math.abs(t - (A("s6:buritan") + 0.1)) / 0.25);
    comp.render();
  };
}
