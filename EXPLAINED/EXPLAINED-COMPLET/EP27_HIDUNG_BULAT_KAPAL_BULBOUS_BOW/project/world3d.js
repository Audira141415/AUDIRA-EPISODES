// EP27 BULBOUS BOW (UKIYOFORGE): a woodblock-print sea built from layered paper sheets. One container ship sits at the
// centre of a cross-section "aquarium" print: in front of the hull a tinted water sheet whose top edge IS the wave
// profile H(x,t), so the bow crest, the bulb's trough and their cancellation are drawn by the sea itself.
//   SEA      far wave rows with claw foam, twin-peak mountain, vermilion sun rising, washi sky
//   SHIP     x=-7..7, bow at XB=7, bulb under the waterline (removable: ghost in s3, cut + replaced in s7)
//   DIAGRAM  three carved lines above the bow (crest vermilion, trough indigo, sum white) for s4-s5
//   DIAL     paper speed dial (s3 speed, s6 working band), fuel drums on deck (s6), funnel smoke
//   LINERS   two generic 1930s liners racing in front (s7) on their own water sheet
// Generic ships only, names only on panels. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, clamp01, canvasTex, track, stage, label } from "./lib3d.js";

const C = {
  prussian: "#1f3a5f", deep: "#13284a", indigo: "#2b4c7e", sky: "#9fb8c9", washi: "#efe3c8", washiD: "#e2d2b0",
  verm: "#d24a2c", vermD: "#a8361f", ochre: "#d9a441", ochreD: "#b07f2a", ink: "#1d1a17", foam: "#f8f3e6", teal: "#4f8a8b", green: "#6f9b5a",
};
const SERIF = "Georgia, 'Times New Roman', serif", SANS = "'Arial Black', Arial, sans-serif";
const XB = 7.0;
const g = (x, s) => Math.exp(-(x * x) / (s * s));

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Print grade: slight ink density, warm paper in the highlights, faint registration flash on cuts.
const Grade = { uniforms: { tDiffuse: { value: null }, flash: { value: 0 } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;uniform float flash;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(1.03,1.0,0.93),0.5*l);c=(c-0.5)*1.06+0.5;c=mix(c,vec3(0.97,0.93,0.84),flash);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

// ---------- paper ----------
let WASHI = null;
function washi() {
  if (WASHI) return WASHI;
  const R = mulberry(27);
  WASHI = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#f4f4f4"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) {
      const px = R() * w, py = R() * h, l = 3 + R() * R() * 30, a = R() * 6.28;
      x.strokeStyle = R() < 0.6 ? `rgba(255,255,255,${0.25 + R() * 0.3})` : `rgba(0,0,0,${0.05 + R() * 0.08})`; x.lineWidth = 0.5 + R();
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
    }
  }, [0.5, 0.5]);
  return WASHI;
}
const MC = new Map();
function pm(color, { ds = false, op = 1, flat = false } = {}) {
  const k = [color, ds, op, flat].join("|");
  if (MC.has(k)) return MC.get(k);
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), map: flat ? null : washi(), roughness: 1, metalness: 0, side: ds ? THREE.DoubleSide : THREE.FrontSide, transparent: op < 1, opacity: op });
  MC.set(k, m); return m;
}
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function shape(pts) { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; }
function ext(sh, d, color, parent, x = 0, y = 0, z = 0) {
  const geo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1, curveSegments: 24 }); geo.translate(0, 0, -d / 2);
  return mesh(geo, [pm(color), pm(C.ink, { flat: true })], parent, x, y, z);
}
function printPlane(tex, w, h, parent, x, y, z, { ds = false, lit = false } = {}) {
  const mat = lit ? new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 1, depthWrite: false, side: ds ? THREE.DoubleSide : THREE.FrontSide, alphaTest: 0.02 })
    : new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: ds ? THREE.DoubleSide : THREE.FrontSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); if (parent) parent.add(m); return m;
}
const txt = (x, s, px, py, font, color, align = "center") => { x.font = font; x.fillStyle = color; x.textAlign = align; x.textBaseline = "middle"; x.fillText(s, px, py); };

// stylised wave row with claw foam, tiles horizontally
function waveRowTex(seed, body, light) {
  const R = mulberry(seed);
  return canvasTex(1024, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const n = 4;
    for (let i = 0; i < n; i++) {
      const cx = (i + 0.5) * (w / n), hw = w / n * 0.62, top = 70 + R() * 40;
      const gr = x.createLinearGradient(0, top, 0, h); gr.addColorStop(0, light); gr.addColorStop(0.35, body); gr.addColorStop(1, body);
      x.fillStyle = gr; x.beginPath(); x.moveTo(cx - hw, h); x.bezierCurveTo(cx - hw * 0.6, top + 30, cx - hw * 0.1, top - 20, cx + hw * 0.35, top + 6);
      x.bezierCurveTo(cx + hw * 0.55, top + 20, cx + hw * 0.5, top + 46, cx + hw * 0.32, top + 50); x.bezierCurveTo(cx + hw * 0.7, top + 70, cx + hw, h - 60, cx + hw * 1.1, h); x.closePath(); x.fill();
      x.strokeStyle = C.ink; x.lineWidth = 4; x.stroke();
      // carved stripes following the face
      x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 3;
      for (let k = 1; k < 5; k++) { x.beginPath(); x.moveTo(cx - hw + k * 22, h); x.bezierCurveTo(cx - hw * 0.5 + k * 16, top + 40 + k * 14, cx + k * 6, top + 14 + k * 12, cx + hw * 0.3, top + 20 + k * 12); x.stroke(); }
      // claws
      x.fillStyle = C.foam;
      for (let k = 0; k < 7; k++) { const a = -1.2 + k * 0.35, px = cx + hw * 0.2 + Math.cos(a) * 34, py = top + 6 + Math.sin(a) * 18; x.beginPath(); x.arc(px, py, 7 - k * 0.5, 0, 6.3); x.fill(); }
    }
    for (let i = 0; i < 4; i++) for (let k = 0; k < 6; k++) { x.fillStyle = C.foam; x.beginPath(); x.arc(R() * w, 60 + R() * 120, 2 + R() * 3, 0, 6.3); x.fill(); }
  }, [1, 1]);
}

// a dynamic band whose top and bottom follow functions of x (the sea's cut edge)
function band(parent, n, x0, x1, z, mat, uvScale = 4) {
  const pos = new Float32Array((n + 1) * 6), uv = new Float32Array((n + 1) * 4), idx = [];
  for (let i = 0; i < n; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; parent.add(m);
  return { m, set(top, bot) {
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, yt = top(x), yb = bot(x);
      pos.set([x, yt, z, x, yb, z], i * 6); uv.set([x / uvScale, yt / uvScale, x / uvScale, yb / uvScale], i * 4);
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.uv.needsUpdate = true; geo.computeBoundingSphere();
  } };
}
// a carved line of fixed width that follows y=f(x)
function inkLine(parent, n, color, w, z) {
  const pos = new Float32Array((n + 1) * 6), idx = [];
  for (let i = 0; i < n; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 5; parent.add(m);
  return (f, x0, x1, op) => {
    m.visible = op > 0.01; mat.opacity = op; if (!m.visible) return;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = f(x), d = (f(x + 0.01) - f(x - 0.01)) / 0.02, l = Math.hypot(1, d), nx = -d / l * w / 2, ny = 1 / l * w / 2;
      pos.set([x + nx, y + ny, z, x - nx, y - ny, z], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
  };
}

// side-profile ship: hull extrude + boot band + superstructure + containers + funnel
function buildShip(parent) {
  const G = new THREE.Group(); parent.add(G);
  const hullPts = [[-7, 1.3], [-7.05, -0.35], [-6.5, -1.0], [5.6, -1.0], [6.25, -0.75], [6.7, -0.2], [7.0, 0.5], [7.35, 1.45], [-7, 1.45]];
  ext(shape(hullPts), 2.6, C.prussian, G);
  const bootPts = [[-7.07, 0.06], [-7.07, -0.35], [-6.5, -1.02], [5.6, -1.02], [6.27, -0.76], [6.72, -0.2], [6.86, 0.06]];
  ext(shape(bootPts), 2.66, C.verm, G);
  mesh(new THREE.BoxGeometry(14.3, 0.08, 2.68), pm(C.foam), G, 0.1, 1.45, 0);
  // superstructure aft
  ext(shape([[-6.6, 1.45], [-6.6, 3.6], [-4.4, 3.6], [-4.4, 1.45]]), 2.2, C.foam, G);
  for (let r = 0; r < 3; r++) printPlane(canvasTex(256, 32, (x, w, h) => { x.fillStyle = C.ink; for (let i = 0; i < 7; i++) x.fillRect(10 + i * 35, 8, 22, 16); }), 2.0, 0.25, G, -5.5, 2.2 + r * 0.45, 1.13, { lit: true });
  ext(shape([[-6.9, 3.6], [-6.9, 3.9], [-4.1, 3.9], [-4.1, 3.6]]), 2.5, C.ochre, G);
  ext(shape([[-5.9, 3.9], [-5.75, 4.9], [-5.05, 4.9], [-5.2, 3.9]]), 0.9, C.verm, G);
  // containers
  const R = mulberry(41), cols = [C.ochre, C.verm, C.teal, C.indigo, C.washiD];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2 + (i % 3 === 0 ? 1 : 0) + (i > 5 ? -1 : 0); j++) {
    const b = mesh(new THREE.BoxGeometry(1.15, 0.55, 2.3), pm(cols[Math.floor(R() * cols.length)]), G, -3.7 + i * 1.22, 1.75 + j * 0.57, 0);
    b.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: C.ink })));
  }
  // AUDIRA lettered on the hull, like a carved block name
  printPlane(canvasTex(1024, 160, (x, w, h) => { txt(x, "AUDIRA", w / 2, h / 2 + 4, `900 120px ${SERIF}`, C.foam); }), 3.2, 0.5, G, 2.9, 0.85, 1.34, { lit: true });
  // bulb (original) and its ghost outline, plus a slimmer replacement nose for s7
  const bulb = mesh(new THREE.SphereGeometry(0.5, 32, 20), pm(C.verm), G, 6.45, -0.62, 0); bulb.scale.set(1.55, 0.82, 0.85);
  bulb.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(0.5, 16, 6), 30), new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.5 })));
  const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 12), new THREE.MeshBasicMaterial({ color: C.foam, wireframe: true, transparent: true, opacity: 0 }));
  ghost.position.copy(bulb.position); ghost.scale.copy(bulb.scale); G.add(ghost);
  const nose = mesh(new THREE.SphereGeometry(0.5, 32, 20), pm(C.ochre), G, 6.4, -0.55, 0); nose.scale.set(1.0, 0.55, 0.6);
  return { G, bulb, ghost, nose };
}
function buildLiner(parent, hull, funnel, len) {
  const G = new THREE.Group(); parent.add(G); const L = len / 2;
  ext(shape([[-L, 0.9], [-L - 0.1, -0.2], [-L + 0.4, -0.6], [L - 0.9, -0.6], [L - 0.3, -0.1], [L + 0.2, 1.0], [-L, 1.0]]), 1.1, hull, G);
  ext(shape([[-L + 1.0, 1.0], [-L + 1.0, 1.6], [L - 1.4, 1.6], [L - 1.4, 1.0]]), 0.9, C.foam, G);
  for (let i = 0; i < 3; i++) ext(shape([[-0.25, 1.6], [-0.15, 2.5], [0.3, 2.5], [0.2, 1.6]]), 0.45, funnel, G, -L * 0.45 + i * L * 0.45, 0, 0);
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp } = stage(canvas, { bg: 0xefe3c8, fog: 0, exp: 1, bloom: [0.1, 0.4, 0.95] });
  scene.fog = null;
  r.toneMapping = THREE.NoToneMapping;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  const gradeP = new ShaderPass(Grade); comp.addPass(gradeP);
  const A = (k) => { const v = AT[k]; if (v === undefined) console.warn("missing anchor", k); return v ?? 0; };
  scene.add(new THREE.HemisphereLight(0xfff6e4, 0xc9b896, 1.55));
  const key = new THREE.DirectionalLight(0xfff0dc, 1.1); key.position.set(-8, 14, 12); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 60 }); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key); key.target.position.set(2, 0, 0); scene.add(key.target);

  // ---------- backdrop: washi sky, sun, twin peaks, far wave rows ----------
  printPlane(canvasTex(64, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#c9d5d6"); gr.addColorStop(0.55, "#efe3c8"); gr.addColorStop(1, "#f0d6a4"); x.fillStyle = gr; x.fillRect(0, 0, w, h); }), 260, 120, scene, 0, 20, -70);
  const sun = mesh(new THREE.CircleGeometry(4.2, 48), new THREE.MeshBasicMaterial({ color: C.verm }), scene, 14, 4, -62);
  printPlane(canvasTex(1024, 512, (x, w, h) => {
    const peak = (cx, hh, ww, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx - ww, h); x.quadraticCurveTo(cx - ww * 0.3, h - hh * 0.6, cx - ww * 0.12, h - hh); x.lineTo(cx + ww * 0.12, h - hh); x.quadraticCurveTo(cx + ww * 0.3, h - hh * 0.6, cx + ww, h); x.fill();
      x.fillStyle = C.foam; x.beginPath(); x.moveTo(cx - ww * 0.12, h - hh); x.lineTo(cx + ww * 0.12, h - hh); x.lineTo(cx + ww * 0.24, h - hh * 0.78); x.lineTo(cx + ww * 0.08, h - hh * 0.84); x.lineTo(cx - ww * 0.02, h - hh * 0.76); x.lineTo(cx - ww * 0.14, h - hh * 0.82); x.lineTo(cx - ww * 0.24, h - hh * 0.78); x.fill(); };
    peak(360, 380, 330, "#5b7a99"); peak(640, 300, 300, "#46668a");
  }), 80, 40, scene, -6, 14, -55);
  const rows = [];
  for (const [z, y, sc, seed, body, light, sp] of [[-30, 0.6, 3.2, 3, "#3d6189", "#a9c1cf", 0.02], [-18, 0.4, 2.4, 5, "#2f5482", "#9db7c8", 0.035], [-9, 0.2, 1.7, 9, "#24467a", "#90adc2", 0.05]]) {
    const tx = waveRowTex(seed, body, light); tx.repeat.set(6, 1);
    const p = printPlane(tx, 26 * sc, 6.5 * sc / 2.6, scene, 0, y, z, { lit: true }); rows.push({ tx, sp });
  }
  // backwater behind the ship (opaque) to make the underwater cut readable
  const backW = band(scene, 120, -40, 40, -1.6, new THREE.MeshBasicMaterial({ color: C.deep }));
  // ---------- ship ----------
  const SHIP = buildShip(scene);
  // ---------- front sea sheet ----------
  const stripeTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(20,40,80,.28)"; x.lineWidth = 3; for (let i = 0; i < 8; i++) { x.beginPath(); for (let k = 0; k <= 32; k++) { const px = (k / 32) * w, py = i * 32 + 10 + 6 * Math.sin(k / 32 * 6.283 * 2 + i); k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } }, [1, 1]);
  const under = band(scene, 240, -40, 40, 1.95, new THREE.MeshBasicMaterial({ color: "#3f6fa6", map: stripeTex, transparent: true, opacity: 0.5, depthWrite: false }), 3);
  const surf = band(scene, 240, -40, 40, 1.97, new THREE.MeshBasicMaterial({ color: C.prussian, map: stripeTex }), 2);
  const foamB = band(scene, 240, -40, 40, 1.99, new THREE.MeshBasicMaterial({ color: C.foam }));
  // second sheet in front of the liners (s7 only)
  const surf2 = band(scene, 160, -40, 40, 8.6, new THREE.MeshBasicMaterial({ color: C.prussian, map: stripeTex }), 2);
  const foam2 = band(scene, 160, -40, 40, 8.62, new THREE.MeshBasicMaterial({ color: C.foam }));
  // foreground curling crest (left), the print's signature, plus spray flecks
  const crestTex = canvasTex(512, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h); const gr = x.createLinearGradient(0, 120, 0, h); gr.addColorStop(0, "#a9c1cf"); gr.addColorStop(0.3, C.indigo); gr.addColorStop(1, C.deep); x.fillStyle = gr;
    x.beginPath(); x.moveTo(0, h); x.bezierCurveTo(40, 300, 140, 110, 330, 120); x.bezierCurveTo(430, 126, 470, 190, 420, 230); x.bezierCurveTo(390, 200, 330, 190, 300, 230); x.bezierCurveTo(330, 300, 420, 380, 512, h); x.closePath(); x.fill(); x.strokeStyle = C.ink; x.lineWidth = 6; x.stroke();
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 5; for (let k = 1; k < 6; k++) { x.beginPath(); x.moveTo(k * 40, h); x.bezierCurveTo(60 + k * 30, 320 - k * 10, 160 + k * 18, 170 + k * 14, 320, 150 + k * 14); x.stroke(); }
    x.fillStyle = C.foam; for (let k = 0; k < 11; k++) { const a = -0.4 + k * 0.33; x.beginPath(); x.arc(380 + Math.cos(a) * 60, 170 + Math.sin(a) * 50, 13 - k * 0.7, 0, 6.3); x.fill(); }
  });
  const fgCrest = printPlane(crestTex, 7, 7, scene, -1.5, 1.2, 6.5, { lit: true });
  const R = mulberry(77), spray = [];
  for (let i = 0; i < 40; i++) { const s = mesh(new THREE.CircleGeometry(0.05 + R() * 0.06, 10), new THREE.MeshBasicMaterial({ color: C.foam }), scene); s.castShadow = false; spray.push([s, R(), R(), R()]); }
  // ---------- flow dashes around the bulb (s4) ----------
  const flow = [];
  for (let i = 0; i < 36; i++) { const d = mesh(new THREE.PlaneGeometry(0.34, 0.05), new THREE.MeshBasicMaterial({ color: C.foam, transparent: true, opacity: 0 }), scene); d.castShadow = false; d.renderOrder = 4; flow.push([d, i]); }
  // ---------- wave diagram lines ----------
  const DY = 2.1;
  const lCrest = inkLine(scene, 120, C.verm, 0.09, 2.3), lTrough = inkLine(scene, 120, "#2a4f8f", 0.09, 2.32), lSum = inkLine(scene, 120, C.foam, 0.11, 2.34), lBase = inkLine(scene, 2, C.ink, 0.025, 2.28);
  const labL = label("LEMBAH", { font: `900 70px ${SANS}`, color: "#ffffff", bg: "rgba(42,79,143,.92)", w: 400, h: 110, size: 1.25 }); scene.add(labL);
  const labP = label("PUNCAK", { font: `900 70px ${SANS}`, color: "#ffffff", bg: "rgba(210,74,44,.95)", w: 400, h: 110, size: 1.25 }); scene.add(labP);
  const labB = label("HALUAN BULAT", { font: `900 72px ${SANS}`, color: C.ink, bg: "rgba(248,243,230,.96)", w: 640, h: 120, size: 2.3 }); scene.add(labB);
  const ring = mesh(new THREE.RingGeometry(0.95, 1.05, 48), new THREE.MeshBasicMaterial({ color: C.foam, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }), scene, 6.45, -0.62, 2.05); ring.castShadow = false;
  // ---------- speed dial ----------
  const DIAL = new THREE.Group(); DIAL.position.set(10.3, 2.6, 1.2); scene.add(DIAL);
  mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.06, 48), pm(C.washi), DIAL).rotation.x = Math.PI / 2;
  printPlane(canvasTex(512, 512, (x, w, h) => { x.strokeStyle = C.ink; x.lineWidth = 10; x.beginPath(); x.arc(w / 2, h / 2, 210, Math.PI * 0.8, Math.PI * 2.2); x.stroke();
    for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.8 + (i / 10) * Math.PI * 1.4; x.lineWidth = i % 5 ? 5 : 10; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * 190, h / 2 + Math.sin(a) * 190); x.lineTo(w / 2 + Math.cos(a) * 160, h / 2 + Math.sin(a) * 160); x.stroke(); }
    txt(x, "KECEPATAN", w / 2, 380, `900 46px ${SANS}`, C.ink); }), 1.9, 1.9, DIAL, 0, 0, 0.05, { lit: true });
  const bandM = mesh(new THREE.RingGeometry(0.74, 0.86, 40, 1, Math.PI * 0.95, Math.PI * 0.4), new THREE.MeshBasicMaterial({ color: C.green, transparent: true, opacity: 0, side: THREE.DoubleSide }), DIAL, 0, 0, 0.07);
  const needle = new THREE.Group(); needle.position.z = 0.09; DIAL.add(needle);
  mesh(new THREE.BoxGeometry(0.06, 0.78, 0.03), pm(C.verm, { flat: true }), needle, 0, 0.36, 0);
  mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), pm(C.ink, { flat: true }), needle).rotation.x = Math.PI / 2;
  // ---------- fuel drums on deck (s6) ----------
  const drums = [];
  for (let i = 0; i < 10; i++) {
    const d = new THREE.Group(); d.position.set(4.4 + (i % 5) * 0.48, 1.49, -0.45 + Math.floor(i / 5) * 0.9); scene.add(d);
    mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 20), pm(C.ochre), d, 0, 0.25, 0); mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.07, 20), pm(C.vermD), d, 0, 0.32, 0);
    drums.push(d);
  }
  // ---------- funnel smoke ----------
  const smoke = [];
  for (let i = 0; i < 18; i++) { const s = mesh(new THREE.CircleGeometry(0.35, 20), new THREE.MeshBasicMaterial({ color: "#8a8478", transparent: true, opacity: 0.6, depthWrite: false }), scene); s.castShadow = false; smoke.push(s); }
  // ---------- liners (s7) ----------
  const LN = new THREE.Group(); scene.add(LN);
  const lnA = buildLiner(LN, C.ink, C.verm, 7), lnB = buildLiner(LN, "#3b3b46", C.ochre, 7);
  lnA.position.set(0, 0, 7.6); lnB.position.set(0, 0, 6.6);
  // ---------- seal stamp ----------
  const seal = printPlane(canvasTex(256, 256, (x, w, h) => { x.fillStyle = C.verm; x.fillRect(16, 16, w - 32, h - 32); x.strokeStyle = C.foam; x.lineWidth = 8; x.strokeRect(36, 36, w - 72, h - 72); txt(x, "AUDI", w / 2, 100, `900 64px ${SERIF}`, C.foam); txt(x, "RA", w / 2, 168, `900 64px ${SERIF}`, C.foam); }), 1.5, 1.5, scene, 9.2, 4.2, 4.5);

  // ---------- camera: one continuous glide ----------
  const Ks = (k, d = 0) => K[k] + d;
  const cpath = track([
    [0, 11.6, 1.6, 16.5, 4.6, 0.45, 0],
    [Ks("s1e"), 10.6, 1.2, 14.2, 5.2, 0.25, 0],
    [Ks("s2", 0.9), 9.4, 0.15, 9.4, 6.3, -0.35, 0],
    [Ks("s2e"), 8.8, -0.25, 7.6, 6.5, -0.45, 0],
    [Ks("s3", 1.0), 12.8, 1.7, 13.6, 6.2, 0.55, 0],
    [Ks("s3e"), 12.0, 1.9, 12.4, 6.4, 0.65, 0],
    [Ks("s4", 0.9), 9.2, 0.0, 9.8, 6.6, -0.05, 0],
    [Ks("s4e"), 8.9, 0.2, 10.2, 6.6, 0.15, 0],
    [Ks("s5", 0.7), 8.6, 0.6, 11.4, 6.7, 0.5, 0],
    [Ks("s5e"), 8.4, 0.7, 11.8, 6.6, 0.55, 0],
    [Ks("s6", 1.0), 12.6, 2.4, 15.2, 5.2, 0.9, 0],
    [Ks("s6e"), 12.0, 2.6, 14.6, 5.6, 1.0, 0],
    [Ks("s7", 1.1), 7.0, 2.6, 22.5, 4.0, 1.0, 5.0],
    [A("s7:Sebaliknya") - 0.2, 6.0, 2.4, 22.0, 3.6, 0.9, 5.0],
    [A("s7:Sebaliknya") + 1.3, 9.8, 0.3, 10.2, 6.4, -0.3, 0],
    [Ks("s7e"), 9.4, 0.1, 9.2, 6.5, -0.4, 0],
    [Ks("s8", 1.2), 4.0, 2.6, 25.0, 2.0, 1.3, 0],
    [K.dur, 3.4, 2.4, 21.5, 2.0, 1.2, 0],
  ]);
  const _t = new THREE.Vector3();
  const win = (t, a, b, f = 0.4) => ramp(t, a - f, a) * (1 - ramp(t, b - f, b));

  return function draw(t) {
    const [px, py, pz, tx, ty, tz] = cpath(t);
    cam.position.set(px + 0.12 * Math.sin(t * 0.37), py + 0.08 * Math.sin(t * 0.53), pz); cam.lookAt(_t.set(tx, ty, tz));
    gradeP.uniforms.flash.value = Math.max(...["s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((s) => 0.16 * Math.max(0, 1 - Math.abs(t - K[s]) / 0.12)));

    // ----- states -----
    const s3 = t >= K.s3 - 0.1 && t < K.s4, s7cut = t >= A("s7:dipotong") - 0.2;
    const bulbOn = s3 ? 1 - ramp(t, K.s3 - 0.1, K.s3 + 0.6) : t < K.s4 + 0.1 ? 1 : ramp(t, A("s4:Bola") - 0.3, A("s4:Bola") + 0.4);
    const cutGo = ramp(t, A("s7:dipotong") - 0.1, A("s7:dipotong") + 0.8), newIn = ramp(t, A("s7:diganti") - 0.2, A("s7:diganti") + 0.6);
    const bulbVis = bulbOn * (1 - cutGo);
    SHIP.bulb.visible = bulbVis > 0.01; SHIP.bulb.scale.set(1.55 * Math.max(0.01, bulbVis), 0.82 * Math.max(0.01, bulbVis), 0.85 * Math.max(0.01, bulbVis));
    SHIP.bulb.position.set(6.45 + 1.2 * cutGo, -0.62 - 0.9 * cutGo, 0); SHIP.bulb.rotation.z = -0.5 * cutGo;
    SHIP.ghost.material.opacity = 0.55 * win(t, K.s3 + 0.3, K.s4 + 0.2);
    SHIP.nose.visible = newIn > 0.01; SHIP.nose.position.set(6.4 + 1.4 * (1 - newIn), -0.55 - 0.6 * (1 - newIn), 0);
    // speed (s3 grows), crest amplitude follows speed
    const speed = t < K.s3 ? 0.55 : t < K.s4 ? 0.45 + 0.5 * ramp(t, A("s3:Makin") - 0.2, A("s3:besar")) : t < K.s6 ? 0.7 : t < K.s7 ? 0.6 + 0.08 * Math.sin(t * 0.8) : 0.6;
    const crestA = 0.25 + 0.75 * speed * (t < K.s3 ? 1 : t < K.s4 ? ramp(t, K.s3, A("s3:atas")) * 0.6 + 0.4 : 1);
    // trough: the bulb's own wave. Misaligned in s4 (shift), aligned on "pas" in s5
    const trA = crestA * 0.93 * bulbVis + 0.5 * crestA * newIn * (t >= K.s7 ? 1 : 0) * 0;
    const shift = t < K.s4 ? 0 : t < K.s5 ? 1.7 * ramp(t, K.s4, A("s4:lembah")) : t < K.s6 ? 1.7 * (1 - ramp(t, A("s5:pas") - 0.3, A("s5:puncak") + 0.2)) : 0;
    const troughOnly = t >= K.s4 && t < K.s5 ? ramp(t, A("s4:mengalir") - 0.3, A("s4:lembah")) : 1;
    const trough = trA * (t >= K.s4 && t < K.s5 ? troughOnly : 1);
    const sea = (x) => 0.07 * Math.sin(0.8 * x + 1.7 * t) + 0.04 * Math.sin(1.9 * x - 1.1 * t + 1);
    const crestF = (x) => { const d = x - XB; return crestA * (g(d + 0.15, 0.85) + 0.42 * g(d + 3.3, 1.05) - 0.18 * g(d + 1.6, 0.7)); };
    const troughF = (x) => { const d = x - XB - shift; return -trough * (g(d + 0.15, 0.85) + 0.42 * g(d + 3.3, 1.05) - 0.18 * g(d + 1.6, 0.7)); };
    const H = (x) => (x > 7.6 || x < -7.6 ? sea(x) : sea(x) * 0.6) + crestF(x) + troughF(x);
    under.set(H, () => -7); surf.set(H, (x) => H(x) - 0.2); foamB.set((x) => H(x) + 0.05 + 0.04 * Math.max(0, crestF(x) + troughF(x)), H);
    backW.set((x) => sea(x * 0.7 + 3) * 0.8 + 0.02, () => -7);
    for (const rw of rows) rw.tx.offset.x = -t * rw.sp;
    // ship rides the sea a little
    SHIP.G.rotation.z = 0.008 * Math.sin(t * 0.9); SHIP.G.position.y = 0.04 * Math.sin(t * 1.1);
    // spray at the bow crest (only when the crest is not cancelled)
    const net = Math.max(0, crestF(XB - 0.15) + troughF(XB - 0.15));
    spray.forEach(([s, a, b, c]) => { const u = (t * (0.8 + a * 0.6) + c) % 1; s.position.set(XB + 0.2 + (a - 0.3) * 1.4 + u * 0.9, 0.3 + net * (0.6 + 1.6 * u - 2.2 * u * u) * (0.6 + b), 2.05 + b * 0.3); s.scale.setScalar(net > 0.12 ? 1 - u : 0.001); s.lookAt(cam.position); });
    fgCrest.visible = t < K.s2 + 0.2 || t > K.s8 - 0.3; fgCrest.position.x = -1.5 + 0.25 * Math.sin(t * 0.6); fgCrest.position.y = 1.0 + 0.12 * Math.sin(t * 0.9);
    // flow dashes over and under the bulb (s4)
    const fOn = win(t, A("s4:mengalir") - 0.3, K.s5 + 0.4) * bulbVis;
    flow.forEach(([d, i]) => { const lane = i % 6, u = ((t * 0.32 + (i * 0.618) % 1) % 1), x = 10.2 - u * 7.5, y0 = [-0.12, -0.25, -0.38, -0.86, -1.0, -1.14][lane], sg = lane < 3 ? 1 : -1;
      const bump = sg * (0.42 - Math.abs(y0 + 0.62) * 0.4) * g(x - 6.45, 0.75); d.position.set(x, y0 + bump, 2.08); d.rotation.z = Math.atan2(-sg * (0.42) * (-2 * (x - 6.45) / 0.5625) * g(x - 6.45, 0.75), -1) + Math.PI; d.material.opacity = fOn * Math.sin(Math.PI * u); });
    // diagram lines
    const diagOn = win(t, K.s4 + 0.4, K.s6 + 0.6, 0.5);
    const x0 = XB - 4.4, x1 = XB + 2.4;
    lBase((x) => DY, x0, x1, 0.6 * diagOn);
    lCrest((x) => DY + 0.75 * crestF(x) / Math.max(0.3, crestA), x0, x1, diagOn * (t < K.s5 ? 0.35 + 0.65 * ramp(t, K.s5 - 0.6, K.s5) : 1));
    lTrough((x) => DY + 0.75 * troughF(x) / Math.max(0.3, crestA), x0, x1, diagOn * ramp(t, A("s4:mengalir") - 0.4, A("s4:lembah")));
    lSum((x) => DY + 0.75 * (crestF(x) + troughF(x)) / Math.max(0.3, crestA), x0, x1, diagOn * ramp(t, A("s5:lembah") - 0.3, A("s5:puncak")));
    labL.position.set(XB - 0.15 + shift, DY - 1.2, 2.4); labL.material.opacity = diagOn * ramp(t, A("s4:lembah") - 0.3, A("s4:lembah")) * (1 - ramp(t, A("s5:meniadakan"), A("s5:meniadakan") + 0.4));
    labP.position.set(XB - 0.15, DY + 1.15, 2.4); labP.material.opacity = diagOn * ramp(t, A("s4:puncak") - 0.3, A("s4:puncak")) * (1 - ramp(t, A("s5:meniadakan"), A("s5:meniadakan") + 0.4));
    // name label + ring on the bulb (s2)
    const nm = win(t, A("s2:haluan") - 0.2, K.s3 - 0.2);
    labB.position.set(6.9, 0.55 + 0.05 * Math.sin(t * 1.4), 2.3); labB.material.opacity = nm; labB.visible = nm > 0.01;
    ring.material.opacity = Math.max(nm * (0.5 + 0.5 * Math.sin(t * 5)), win(t, A("s1:ombak") - 0.2, A("s1:hemat"), 0.3) * 0.7); ring.scale.setScalar(1 + 0.08 * Math.sin(t * 5));
    // dial: s3 speed, s6 working band
    const dOn = Math.max(win(t, K.s3 + 0.3, K.s4 + 0.1), win(t, A("s6:Tapi") - 0.3, K.s7 + 0.2));
    DIAL.visible = dOn > 0.01; DIAL.scale.setScalar(Math.max(0.001, back(dOn, 1.4)));
    needle.rotation.z = Math.PI * 0.7 - speed * Math.PI * 1.4 + 0.03 * Math.sin(t * 7);
    bandM.material.opacity = 0.9 * ramp(t, A("s6:rentang") - 0.3, A("s6:rentang") + 0.2);
    // drums (s6): 1.5 of 10 burn off on the saving
    const drOn = win(t, A("s6:menghemat") - 0.8, K.s7 + 0.1), sv = ramp(t, A("s6:sepuluh") - 0.1, A("s6:persen") + 0.2);
    drums.forEach((d, i) => { const k = i === 9 ? 1 - sv : i === 8 ? 1 - 0.5 * sv : 1; d.visible = drOn > 0.01; d.scale.set(1, Math.max(0.001, back(clamp01((drOn - i * 0.04) * 1.6), 1.3) * k), 1); });
    // smoke: thinner once waste drops (s6)
    const thin = t > A("s6:tenaga") ? 0.45 : 1;
    smoke.forEach((s, i) => { const u = (t * 0.22 + i / smoke.length) % 1; s.position.set(-5.45 - u * 3.5, 5.0 + u * 2.4, 0.1 * Math.sin(i)); s.scale.setScalar(0.4 + u * 1.6); s.material.opacity = 0.55 * (1 - u) * thin; s.lookAt(cam.position); });
    // liners (s7)
    const lnOn = t > K.s7 - 0.4 && t < A("s7:Sebaliknya") + 1.2;
    LN.visible = lnOn; surf2.m.visible = foam2.m.visible = lnOn;
    if (lnOn) {
      const u = t - K.s7;
      lnA.position.x = -6 + u * 1.5; lnB.position.x = -6.5 + u * 1.05; lnA.position.y = 0.05 * Math.sin(t * 1.3); lnB.position.y = 0.05 * Math.sin(t * 1.2 + 1);
      const sea2 = (x) => 0.08 * Math.sin(0.9 * x + 1.9 * t) + 0.12 * g(x - lnA.position.x - 3.4, 0.6) + 0.1 * g(x - lnB.position.x - 3.4, 0.6);
      surf2.set(sea2, () => -7); foam2.set((x) => sea2(x) + 0.06, sea2);
    }
    // sun rises, seal stamps
    sun.position.y = 3 + 7 * clamp01(t / K.dur);
    const st = clamp01((t - A("s8:AUDIRA") + 0.1) / 0.25);
    seal.visible = st > 0; seal.scale.setScalar(st > 0 ? 1 + 0.9 * (1 - back(st, 1.6)) : 0.001); seal.material.opacity = st;
    comp.render();
  };
}
