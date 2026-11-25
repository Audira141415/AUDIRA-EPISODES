// EP01 MICROWAVE (ISOCRAFT): an isometric comic-ink teardown on warm paper. Flat toon shading in 3 bands with a
// screen-space halftone in the shadow band, thick inverted-hull ink outlines, cutaway walls so the insides work in view.
// Stations along one paper tabletop: 1945 radar lab (x=-24), Radarange cabinet (x=-12.5), the microwave (x=0),
// the magnified food slab (x=+14). Every value is a pure function of t (seek-safe, seeded randomness only).
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, eout, back, clamp01, canvasTex, track, stage } from "./lib3d.js";

const C = { paper: 0xf5f2eb, ink: 0x1c1e21, blue: 0x7a9bb8, coral: 0xe06d53, mint: 0x5fa084, steel: 0xd1d8e0, yellow: 0xf4c430 };
const FONT = "'Arial Black', Arial, sans-serif", MONO = "'Courier New', monospace";
const LAB = -24, RAD = -12.5, MW = 0, FOOD = 14;

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };

let GRAD = null;
function grad() {
  if (GRAD) return GRAD;
  const t = new THREE.DataTexture(new Uint8Array([105, 180, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return (GRAD = t);
}
// Toon in 3 bands; the darker bands get a halftone dot screen (comic print).
// Material cues stay comic: a hard-edged specular band (spec/shin), a rim highlight (rim) and diagonal ink hatching
// in the shadow bands for metal (hatch). All flat, no gradients.
function toon(color, o = {}) {
  const { spec = 0, shin = 40, rim = 0, hatch = 0, ...rest } = o;
  const m = new THREE.MeshToonMaterial({ color, gradientMap: grad(), ...rest });
  const f = (x) => x.toFixed(3);
  m.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace("#include <opaque_fragment>", `
      float hl = dot(outgoingLight, vec3(.299,.587,.114)) / max(dot(diffuseColor.rgb, vec3(.299,.587,.114)), 0.001);
      vec3 vv = normalize(vViewPosition);
      #if NUM_DIR_LIGHTS > 0
      vec3 hv = normalize(directionalLights[0].direction + vv);
      float sp = pow(max(dot(normal, hv), 0.0), ${f(shin)});
      outgoingLight += vec3(1.0) * ${f(spec)} * step(0.55, sp);
      #endif
      float rm = 1.0 - abs(dot(normal, vv));
      outgoingLight += vec3(1.0) * ${f(rim)} * step(0.72, rm) * step(0.75, hl);
      float hz = 1.0 - smoothstep(0.62, 0.9, hl);
      float ln = step(0.72, fract((gl_FragCoord.x + gl_FragCoord.y) / 9.0));
      outgoingLight *= 1.0 - ${f(hatch)} * hz * ln;
      vec2 hc = mod(gl_FragCoord.xy, 11.0) - 5.5;
      float hr = 3.1 * (1.0 - smoothstep(0.62, 0.93, hl)) * (1.0 - step(0.01, ${f(hatch)}));
      outgoingLight *= 1.0 - 0.2 * (1.0 - smoothstep(hr - 0.7, hr + 0.7, length(hc)));
      #include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => "isoHT" + [spec, shin, rim, hatch].join("_");
  return m;
}
const METAL = (c, x = {}) => toon(c, { spec: 0.35, shin: 30, hatch: 0.32, ...x });
function rivets(parent, pts, r = 0.05) { for (const [x, y, z] of pts) mk(SP(r, 10, 8), toon(0xe9edf1, { spec: 0.5, shin: 20 }), x, y, z, parent, 0.012); }
const INK = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });
// Inverted hull: same geometry scaled out by e on every axis around its own bbox centre.
function ink(m, e = 0.045) {
  const g = m.geometry; g.computeBoundingBox();
  const s = new THREE.Vector3(), c = new THREE.Vector3(); g.boundingBox.getSize(s); g.boundingBox.getCenter(c);
  const h = new THREE.Mesh(g, INK);
  const f = (v) => (v > 1e-3 ? (v + 2 * e) / v : 1);
  h.scale.set(f(s.x), f(s.y), f(s.z));
  h.position.set(c.x * (1 - h.scale.x), c.y * (1 - h.scale.y), c.z * (1 - h.scale.z));
  m.add(h); m.userData.hull = h;
  return m;
}
function mk(geo, mat, x, y, z, parent, e = 0.045) {
  const m = new THREE.Mesh(geo, typeof mat === "number" ? toon(mat) : mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
  if (e) ink(m, e);
  parent.add(m);
  return m;
}
const BX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const CY = (a, b, h, s = 28) => new THREE.CylinderGeometry(a, b, h, s);
const SP = (r, a = 24, b = 16) => new THREE.SphereGeometry(r, a, b);

// Comic sticker label: white (or coloured) card, thick ink border, hard offset shadow. Always faces the camera.
function tag(text, { bg = "#ffffff", fg = "#1C1E21", h = 0.8, px = 70, font = FONT, rot = 0 } = {}) {
  const mc = document.createElement("canvas").getContext("2d");
  mc.font = `900 ${px}px ${font}`;
  const tw = Math.ceil(mc.measureText(text).width);
  const W = tw + px * 1.1 + 26, H = Math.round(px * 1.55) + 26;
  const tx = canvasTex(W, H, (g) => {
    g.clearRect(0, 0, W, H);
    const w = W - 26, hh = H - 26, b = Math.max(6, px * 0.1);
    g.fillStyle = "#1C1E21"; g.fillRect(14, 14, w + 10, hh + 10);
    g.fillStyle = bg; g.fillRect(2, 2, w, hh);
    g.lineWidth = b; g.strokeStyle = "#1C1E21"; g.strokeRect(2 + b / 2, 2 + b / 2, w - b, hh - b);
    g.fillStyle = fg; g.font = `900 ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 2 + w / 2, 2 + hh / 2 + px * 0.06);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, toneMapped: false, depthTest: false, transparent: true, rotation: rot }));
  s.scale.set((h * W) / H, h, 1); s.renderOrder = 20; s.userData.base = [(h * W) / H, h];
  return s;
}
function showTag(s, a) { s.visible = a > 0.01; const k = back(a, 2.2); s.scale.set(s.userData.base[0] * k, s.userData.base[1] * k, 1); s.material.opacity = clamp01(a * 2); }

// Thick screen-facing line (with an ink border) along a sampled curve; used for waves, rays and arrows.
function ribbon(scene, n, w, color, { edge = 2.0, ro = 6 } = {}) {
  const mkM = (col, order) => {
    const pos = new Float32Array((n + 1) * 6), idx = [];
    for (let i = 0; i < n; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, toneMapped: false, transparent: true, depthWrite: false }));
    m.frustumCulled = false; m.renderOrder = order; scene.add(m);
    return { m, pos, g };
  };
  const core = mkM(new THREE.Color(color).multiplyScalar(1.25), ro + 1), brd = mkM(C.ink, ro);
  const cs = Array.from({ length: n + 1 }, () => new THREE.Vector3());
  const T = new THREE.Vector3(), V = new THREE.Vector3(), N = new THREE.Vector3();
  return {
    core, brd,
    // fn(u, out) writes the centre for u in [0,1]; drawn from u0 to u1
    set(fn, u0, u1, cam, op = 1, wm = 1) {
      const vis = u1 - u0 > 0.002 && op > 0.01;
      core.m.visible = brd.m.visible = vis;
      if (!vis) return;
      for (let i = 0; i <= n; i++) fn(u0 + (u1 - u0) * (i / n), cs[i]);
      for (let i = 0; i <= n; i++) {
        T.subVectors(cs[Math.min(n, i + 1)], cs[Math.max(0, i - 1)]);
        V.subVectors(cam.position, cs[i]);
        N.crossVectors(T, V).normalize();
        if (!(N.x === N.x)) N.set(0, 1, 0);
        const taper = Math.min(1, i / 3, (n - i) / 3 + 0.35);
        for (const [R, ww] of [[core, w * wm * taper], [brd, w * wm * edge * taper]]) {
          R.pos[i * 6] = cs[i].x + N.x * ww / 2; R.pos[i * 6 + 1] = cs[i].y + N.y * ww / 2; R.pos[i * 6 + 2] = cs[i].z + N.z * ww / 2;
          R.pos[i * 6 + 3] = cs[i].x - N.x * ww / 2; R.pos[i * 6 + 4] = cs[i].y - N.y * ww / 2; R.pos[i * 6 + 5] = cs[i].z - N.z * ww / 2;
        }
      }
      for (const R of [core, brd]) { R.g.attributes.position.needsUpdate = true; R.m.material.opacity = op; }
    },
  };
}
// Polyline with arclength parametrisation, plus a sine displacement perpendicular to each segment (in the plane with `up`).
function path(pts, up = new THREE.Vector3(0, 1, 0)) {
  const P = pts.map((p) => new THREE.Vector3(...p)), L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1]));
  const len = L[L.length - 1];
  const D = P.slice(1).map((p, i) => { const t = p.clone().sub(P[i]).normalize(); const d = up.clone().sub(t.clone().multiplyScalar(up.dot(t))); return d.lengthSq() < 1e-4 ? new THREE.Vector3(0, 0, 1) : d.normalize(); });
  return {
    len,
    at(u, out, amp = 0, lam = 1, ph = 0) {
      const s = clamp01(u) * len; let i = 0;
      while (i < L.length - 2 && L[i + 1] < s) i++;
      const k = (s - L[i]) / Math.max(1e-6, L[i + 1] - L[i]);
      out.copy(P[i]).lerp(P[i + 1], k);
      if (amp) out.addScaledVector(D[i], amp * Math.sin((2 * Math.PI * s) / lam - ph));
      return out;
    },
  };
}

// Generic comic figure, 7 units tall: head on a neck, shoulders wider than the waist, elbow and knee pivots. Faceless.
function person(parent, { coat, pants, skin = 0xe8b48a, hair = 0x3a2a22, h = 7, labcoat = true }) {
  const G = new THREE.Group(), B = new THREE.Group(); G.add(B); B.scale.setScalar(h / 7); parent.add(G);
  const e = 0.06;
  const leg = (x) => {
    const hip = new THREE.Group(); hip.position.set(x, 3.3, 0); B.add(hip);
    mk(new THREE.CapsuleGeometry(0.33, 1.1, 6, 14), pants, 0, -0.75, 0, hip, e);
    const kn = new THREE.Group(); kn.position.y = -1.55; hip.add(kn);
    mk(new THREE.CapsuleGeometry(0.28, 1.05, 6, 14), pants, 0, -0.72, 0, kn, e);
    mk(BX(0.56, 0.32, 1.0), 0x2a2a2e, 0, -1.58, 0.2, kn, e);
    return { hip, kn };
  };
  const legL = leg(-0.4), legR = leg(0.4);
  const pel = mk(CY(0.74, 0.7, 0.62), pants, 0, 3.45, 0, B, e); pel.scale.z = 0.66;
  const tor = mk(CY(1.0, 0.74, 2.05), coat, 0, 4.62, 0, B, e); tor.scale.z = 0.62;
  if (labcoat) { const sk = mk(CY(0.8, 0.98, 1.35), coat, 0, 3.15, 0, B, e); sk.scale.z = 0.68; }
  for (const s of [-1, 1]) mk(SP(0.42), coat, s * 0.92, 5.45, 0, B, e);
  mk(CY(0.21, 0.24, 0.42), skin, 0, 5.82, 0, B, e);
  const head = new THREE.Group(); head.position.set(0, 6.35, 0); B.add(head);
  const hd = mk(SP(0.55), skin, 0, 0.08, 0.02, head, e); hd.scale.set(0.92, 1.1, 1);
  mk(new THREE.SphereGeometry(0.6, 24, 12, 0, Math.PI * 2, 0, 1.45), hair, 0, 0.17, -0.04, head, e);
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 1.02, 5.4, 0); B.add(sh);
    mk(new THREE.CapsuleGeometry(0.25, 0.95, 6, 14), coat, 0, -0.62, 0, sh, e);
    const el = new THREE.Group(); el.position.y = -1.3; sh.add(el);
    mk(new THREE.CapsuleGeometry(0.22, 0.85, 6, 14), coat, 0, -0.58, 0, el, e);
    mk(SP(0.26), skin, 0, -1.2, 0.02, el, e);
    return { sh, el };
  };
  const armL = arm(1), armR = arm(-1);
  return { G, B, legL, legR, armL, armR, head };
}
function pose(p, { lA = 0, lE = 0.5, rA = 0, rE = 0.5, hx = 0, hy = 0, lean = 0 } = {}) {
  p.legL.hip.rotation.x = -0.05; p.legR.hip.rotation.x = -0.05; p.legL.kn.rotation.x = 0.12; p.legR.kn.rotation.x = 0.12;
  p.armL.sh.rotation.set(-lA, 0, 0.12); p.armL.el.rotation.x = -lE;
  p.armR.sh.rotation.set(-rA, 0, -0.12); p.armR.el.rotation.x = -rE;
  p.head.rotation.set(hx, hy, 0); p.B.rotation.x = lean;
}

function dyn(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let key = null;
  return { tex, paint(k, fn) { if (k === key) return; key = k; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; } };
}
function halftone(g, x0, y0, w, h, col, step = 12, r = 3) { g.fillStyle = col; for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2) * step / 2; x < x0 + w; x += step) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
// V-shaped water molecule: red O, two white H at 104.5 degrees. Dipole axis is local +y.
function molecule(parent, s, oMat, e) {
  const G = new THREE.Group(); parent.add(G);
  mk(SP(0.5 * s, 20, 14), oMat, 0, 0, 0, G, e);
  const hM = toon(0xdde4ea);
  for (const sg of [-1, 1]) { const a = sg * (104.5 / 2) * Math.PI / 180; mk(SP(0.32 * s, 18, 12), hM, Math.sin(a) * 0.62 * s, Math.cos(a) * 0.62 * s, 0, G, e); }
  return G;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.paper, exp: 1.0, bloom: [0.22, 0.35, 1.0], fov: 20 });
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
  scene.environmentIntensity = 0.25;
  comp.insertPass(new ShaderPass(NanGuard), 1);
  cam.setViewOffset(1080, 1920, 0, 10, 1080, 1920);
  const A = (k) => AT[k];
  const amb = new THREE.AmbientLight(0xfff6ea, 1.3); scene.add(amb);
  const sun = new THREE.DirectionalLight(0xffffff, 2.0); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 80 });
  const SUN = new THREE.Vector3(-14, 30, 18);

  // ---------- the paper tabletop with a faint iso dot grid ----------
  const gridT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#EFE9DD"; g.fillRect(0, 0, w, w); g.fillStyle = "rgba(28,30,33,.16)"; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(i * 64 + 32, j * 64 + 32, 3.2, 0, 7); g.fill(); } }, [60, 30]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 80), toon(0xffffff, { map: gridT })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.62; floor.receiveShadow = true; scene.add(floor);

  // ================= MICROWAVE (x = 0) =================
  const mw = new THREE.Group(); mw.position.set(MW, 0, 0); scene.add(mw);
  mk(BX(10, 0.6, 7), 0x9cc7b2, 0, -0.3, 0.2, mw, 0.06); // counter slab
  for (const [x, z] of [[-2.6, -1.7], [2.6, -1.7], [-2.6, 1.7], [2.6, 1.7]]) mk(CY(0.14, 0.16, 0.3, 14), C.ink, x, 0.15, z, mw, 0);
  const enamelT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#E06D53"; g.fillRect(0, 0, w, w); g.fillStyle = "#F7A58C"; g.save(); g.translate(w * 0.3, 0); g.rotate(0.5); g.fillRect(0, -40, 26, w * 2); g.fillRect(40, -40, 9, w * 2); g.restore(); });
  const caseM = toon(0xffffff, { map: enamelT, spec: 0.28, shin: 60 }), cavM = toon(0xf1ece2), bayM = toon(0x58697a);
  mk(BX(6, 0.12, 4.2), caseM, 0, 0.36, 0, mw);                  // bottom
  mk(BX(6, 3.6, 0.12), caseM, 0, 2.1, -2.04, mw);                // back
  mk(BX(0.12, 3.6, 4.2), caseM, -2.94, 2.1, 0, mw);              // left
  mk(BX(0.12, 1.25, 4.2), caseM, 2.94, 0.93, 0, mw);             // right wall, cut low
  mk(BX(6, 0.12, 0.9), caseM, 0, 3.86, -1.6, mw);                // top, cut back to a strip
  mk(BX(0.1, 2.0, 3.96), bayM, 1.0, 1.42, 0, mw, 0.035);         // divider, cut low
  // cavity liner (light enamel) and bay floor
  mk(BX(3.78, 0.04, 3.9), cavM, -0.97, 0.44, 0, mw, 0);
  mk(BX(3.78, 3.3, 0.04), cavM, -0.97, 2.1, -1.96, mw, 0);
  mk(BX(0.04, 3.3, 3.9), cavM, -2.86, 2.1, 0, mw, 0);
  mk(BX(1.8, 0.04, 3.9), toon(0x3d4a57), 1.97, 0.44, 0, mw, 0);
  // turntable: rollers ring, glass plate, white plate, bowl of food
  mk(new THREE.TorusGeometry(1.1, 0.05, 8, 40), C.ink, -0.97, 0.5, 0, mw, 0).rotation.x = Math.PI / 2;
  const tt = new THREE.Group(); tt.position.set(-0.97, 0.56, 0); tt.scale.setScalar(1.18); mw.add(tt);
  const glass = new THREE.Mesh(CY(1.5, 1.5, 0.07, 48), new THREE.MeshToonMaterial({ color: 0xbfe0e8, gradientMap: grad(), transparent: true, opacity: 0.7 })); tt.add(glass); ink(glass, 0.03);
  const plateM = toon(0xd6e6f2, { spec: 0.55, shin: 80, rim: 0.3 });
  mk(CY(1.12, 0.95, 0.12, 40), plateM, 0, 0.1, 0, tt, 0.035);
  mk(CY(0.82, 0.52, 0.62, 36), toon(0xf4f1ea, { spec: 0.5, shin: 80, rim: 0.25 }), 0, 0.47, 0, tt, 0.035);
  mk(new THREE.TorusGeometry(0.8, 0.035, 8, 40), toon(0xffffff, { spec: 0.6, shin: 60 }), 0, 0.78, 0, tt, 0).rotation.x = Math.PI / 2;
  const foodT = canvasTex(256, 256, (g, w) => { g.fillStyle = "#E7774F"; g.fillRect(0, 0, w, w); const R = mulberry(5); for (let i = 0; i < 26; i++) { g.fillStyle = ["#F4C430", "#5FA084", "#C4492F", "#F7D9A8"][i % 4]; g.beginPath(); g.ellipse(30 + R() * 196, 30 + R() * 196, 9 + R() * 12, 7 + R() * 9, R() * 3, 0, 7); g.fill(); g.strokeStyle = "#1C1E21"; g.lineWidth = 3; g.stroke(); } });
  const foodM = toon(0xffffff, { map: foodT, spec: 0.4, shin: 90 });
  const foodTop = mk(CY(0.78, 0.78, 0.04, 36), foodM, 0, 0.77, 0, tt, 0); foodTop.castShadow = false;
  { const RC = mulberry(12); for (let i = 0; i < 9; i++) { const a = RC() * 6.28, rr = 0.15 + RC() * 0.5; const ch = mk(i % 3 ? BX(0.16, 0.12, 0.16) : SP(0.1, 12, 8), toon([0xf4c430, 0x5fa084, 0xc4492f][i % 3], { spec: 0.3, shin: 50 }), Math.cos(a) * rr, 0.83, Math.sin(a) * rr, tt, 0.015); ch.rotation.y = RC() * 3; } }
  // case front: translucent door with a perforated metal mesh, coral frame, control panel with the AUDIRA display
  const meshT = canvasTex(512, 384, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "rgba(28,30,33,.62)"; g.fillRect(0, 0, w, h); g.save(); g.translate(w * 0.62, 0); g.rotate(0.45); g.fillStyle = "rgba(225,232,238,.75)"; g.fillRect(0, -60, 34, h * 2); g.fillRect(52, -60, 10, h * 2); g.restore(); g.globalCompositeOperation = "destination-out"; for (let y = 4; y < h; y += 9) for (let x = 4 + ((y / 9) % 2) * 4.5; x < w; x += 9) { g.beginPath(); g.arc(x, y, 3.3, 0, 7); g.fill(); } g.globalCompositeOperation = "source-over"; });
  const doorG = new THREE.Group(); doorG.position.set(-0.97, 2.1, 2.1); mw.add(doorG);
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.6), new THREE.MeshBasicMaterial({ map: meshT, transparent: true, depthWrite: false, toneMapped: false })); doorGlass.renderOrder = 3; doorG.add(doorGlass);
  mk(BX(3.94, 0.5, 0.16), caseM, 0, 1.55, 0, doorG); mk(BX(3.94, 0.5, 0.16), caseM, 0, -1.55, 0, doorG);
  mk(BX(0.32, 2.6, 0.16), caseM, -1.81, 0, 0, doorG); mk(BX(0.32, 2.6, 0.16), caseM, 1.81, 0, 0, doorG);
  mk(BX(0.16, 1.2, 0.22), C.ink, 1.5, 0, 0.18, doorG, 0); // handle
  const cp = new THREE.Group(); cp.position.set(1.97, 2.1, 2.1); mw.add(cp);
  mk(BX(1.94, 3.6, 0.16), toon(0xf2e6d3), 0, 0, 0, cp);
  const disp = dyn(512, 192);
  disp.paint("a", (g, w, h) => { g.fillStyle = "#16261d"; g.fillRect(0, 0, w, h); g.fillStyle = "#A3E635"; g.font = `900 92px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, h / 2 + 6); g.strokeStyle = "#A3E635"; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); });
  const dsp = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 0.6), new THREE.MeshBasicMaterial({ map: disp.tex, toneMapped: false })); dsp.position.set(0, 1.25, 0.09); cp.add(dsp);
  for (let i = 0; i < 9; i++) mk(BX(0.4, 0.26, 0.1), [C.yellow, 0xffffff, C.blue][i % 3], -0.5 + (i % 3) * 0.5, 0.55 - Math.floor(i / 3) * 0.4, 0.1, cp, 0.025);
  const dial = mk(CY(0.36, 0.36, 0.16, 30), toon(0xffffff), 0, -1.05, 0.14, cp, 0.03); dial.rotation.x = Math.PI / 2;
  mk(BX(0.08, 0.3, 0.06), C.ink, 0, 0.15, 0.08, dial, 0).rotation.x = -Math.PI / 2;
  // bay: magnetron with cooling fins and ring magnets, antenna into the yellow waveguide, transformer, capacitor
  const mag = new THREE.Group(); mag.position.set(2.05, 1.5, -0.4); mw.add(mag);
  mk(CY(0.42, 0.42, 1.0, 28), METAL(C.steel), 0, 0, 0, mag, 0.035);
  for (let i = 0; i < 6; i++) mk(BX(1.25, 0.05, 1.25), METAL(0xb9c3ce), 0, -0.38 + i * 0.15, 0, mag, 0.022);
  for (const y of [-0.62, 0.62]) mk(CY(0.52, 0.52, 0.2, 28), C.coral, 0, y, 0, mag, 0.03);
  mk(CY(0.08, 0.08, 0.55, 12), C.steel, 0, 0.98, 0, mag, 0.02);
  mk(BX(1.35, 0.55, 0.9), METAL(0xe7c35a, { spec: 0.4 }), 1.5, 2.78, -0.4, mw, 0.04); // waveguide duct (yellow metal)
  rivets(mw, [[0.95, 3.07, -0.05], [1.5, 3.07, -0.05], [2.05, 3.07, -0.05], [0.95, 3.07, -0.75], [1.5, 3.07, -0.75], [2.05, 3.07, -0.75], [2.2, 2.78, 0.06], [0.85, 2.78, 0.06]]);
  rivets(mag, [0, 1, 2, 3, 4, 5].map((i) => [Math.cos(i * 1.047) * 0.47, 0.74, Math.sin(i * 1.047) * 0.47]), 0.045);
  mk(BX(1.1, 0.8, 1.0), toon(C.blue), 2.0, 0.85, 1.25, mw, 0.035);
  mk(CY(0.22, 0.22, 0.8, 18), toon(C.mint), 2.45, 0.85, 0.2, mw, 0.03).rotation.z = Math.PI / 2;
  const lamp = new THREE.PointLight(0xffd27a, 0, 9, 1.5); lamp.position.set(-1, 3.2, -0.6); mw.add(lamp);
  // Faraday cage: the cavity's 12 edges light up as yellow bars
  const cage = new THREE.Group(); mw.add(cage);
  const cageM = new THREE.MeshBasicMaterial({ color: new THREE.Color(C.yellow).multiplyScalar(1.4), toneMapped: false, transparent: true, depthWrite: false, depthTest: false });
  { const x0 = -2.88, x1 = 0.94, y0 = 0.46, y1 = 3.78, z0 = -1.98, z1 = 2.02, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, b = 0.11;
    for (const y of [y0, y1]) for (const z of [z0, z1]) { const m = new THREE.Mesh(BX(x1 - x0, b, b), cageM); m.position.set(cx, y, z); cage.add(m); }
    for (const x of [x0, x1]) for (const z of [z0, z1]) { const m = new THREE.Mesh(BX(b, y1 - y0, b), cageM); m.position.set(x, cy, z); cage.add(m); }
    for (const x of [x0, x1]) for (const y of [y0, y1]) { const m = new THREE.Mesh(BX(b, b, z1 - z0), cageM); m.position.set(x, y, (z0 + z1) / 2); cage.add(m); } }
  // s1 molecules above the food and steam puffs
  const oM1 = toon(0x6f9fc4);
  const mols1 = [], R1 = mulberry(31);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.3; const g = molecule(mw, 0.55, oM1, 0.03); const rr = 0.35 + 0.4 * (i % 2); mols1.push({ g, x: -0.97 + Math.cos(a) * rr, z: Math.sin(a) * rr, y: 1.95 + R1() * 0.5, ph: R1() * 6 }); }
  const steamM = toon(0xe2e6ea);
  const steam = Array.from({ length: 6 }, (_, i) => mk(SP(0.3, 16, 12), steamM, 0, 0, 0, mw, 0.03));
  // ink circular arrow for "piring putar"
  const spin = ribbon(scene, 60, 0.12, C.yellow);
  const spinHead = mk(new THREE.ConeGeometry(0.22, 0.5, 14), C.yellow, 0, 0, 0, scene, 0.04);
  const hot = Array.from({ length: 3 }, (_, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.yellow).multiplyScalar(1.2), toneMapped: false, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 4; mw.add(m); return m; });
  // eye outside the door for "cahaya tetap lewat"
  const eye = new THREE.Group(); eye.position.set(MW - 0.6, 2.4, 7.2); scene.add(eye);
  mk(SP(0.75, 28, 20), toon(0xffffff), 0, 0, 0, eye, 0.05);
  const iris = mk(CY(0.36, 0.36, 0.1, 28), toon(C.blue), 0, 0, 0.7, eye, 0.03); iris.rotation.x = Math.PI / 2;
  mk(CY(0.17, 0.17, 0.12, 20), C.ink, 0, 0.02, 0.73, eye, 0).rotation.x = Math.PI / 2;
  mk(new THREE.TorusGeometry(0.78, 0.09, 10, 36, Math.PI), C.ink, 0, 0, 0, eye, 0).rotation.z = 0.15;
  eye.lookAt(MW - 0.97, 2.1, 2.1);

  // ================= 1945 RADAR LAB (x = -24) =================
  const lab = new THREE.Group(); lab.position.set(LAB, 0, 0); scene.add(lab);
  const labFloorT = canvasTex(256, 256, (g, w) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#C9D6E2" : "#B5C6D6"; g.fillRect(i * 64, j * 64, 64, 64); } }, [4, 3]);
  mk(BX(17, 0.5, 11), toon(0xffffff, { map: labFloorT }), 0, -0.25, 0, lab, 0.06);
  mk(BX(17, 9, 0.4), toon(0xe9dfcc), 0, 4.5, -5.3, lab, 0.06);
  const signT = canvasTex(640, 200, (g, w, h) => { g.fillStyle = "#1C1E21"; g.fillRect(0, 0, w, h); g.fillStyle = "#F4C430"; g.font = `900 84px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LAB RADAR", w / 2, 72); g.font = `900 56px ${MONO}`; g.fillStyle = "#F5F2EB"; g.fillText("1945", w / 2, 150); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.31), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false })); sign.position.set(4.5, 2.35, 1.6); sign.rotation.y = -0.5; sign.scale.setScalar(0.62); lab.add(sign); mk(BX(0.12, 1.9, 0.12), toon(0x6b5240), 4.5, 0.95, 1.5, lab, 0.03);
  // bench with a glowing tube
  mk(BX(5.2, 0.32, 2.4), toon(0x8a6a4f), -3.2, 3.0, -3.4, lab, 0.05);
  for (const x of [-5.5, -0.9]) for (const z of [-4.3, -2.5]) mk(BX(0.3, 2.85, 0.3), toon(0x6b5240), -3.2 + (x + 3.2), 1.42, z, lab, 0.04);
  const tubeM = new THREE.MeshToonMaterial({ color: C.coral, gradientMap: grad(), emissive: new THREE.Color(C.coral), emissiveIntensity: 0.0 });
  mk(CY(0.45, 0.45, 1.1, 24), tubeM, -2.2, 3.72, -3.4, lab, 0.04);
  for (let i = 0; i < 4; i++) mk(BX(1.2, 0.05, 1.2), METAL(0xb9c3ce), -2.2, 3.4 + i * 0.2, -3.4, lab, 0.02);
  mk(BX(1.4, 0.9, 1.0), toon(C.blue), -4.4, 3.62, -3.4, lab, 0.04);
  // radar dish on a mast, aimed across the room
  const dish = new THREE.Group(); dish.position.set(-5.6, 5.6, -0.6); lab.add(dish);
  mk(CY(0.18, 0.22, 5.6, 14), toon(0x58697a), -5.6, 2.8, -0.6, lab, 0.04);
  mk(CY(1.1, 1.3, 0.4, 24), toon(0x58697a), -5.6, 0.2, -0.6, lab, 0.04);
  const dishGeo = new THREE.LatheGeometry(Array.from({ length: 14 }, (_, i) => { const rr = (i / 13) * 2.4; return new THREE.Vector2(rr, (rr * rr) / 7); }), 40);
  const bandT = canvasTex(16, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#B9C3CE' : '#E3E8ED'; g.fillRect(0, i * 32, w, 32); } g.fillStyle = '#F8FAFC'; g.fillRect(0, 150, w, 12); });
  const dishM = toon(0xffffff, { map: bandT, side: THREE.DoubleSide, spec: 0.4, shin: 25, hatch: 0.2 });
  const dishMesh = new THREE.Mesh(dishGeo, dishM); dishMesh.castShadow = true; dishMesh.rotation.x = Math.PI / 2; dish.add(dishMesh);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.09, 10, 48), INK.clone()); rim.material.side = THREE.FrontSide; rim.position.z = 0.82; dish.add(rim);
  mk(CY(0.07, 0.07, 1.8, 10), C.ink, 0, 0, 0.9, dish, 0).rotation.x = Math.PI / 2;
  mk(BX(0.4, 0.3, 0.4), C.yellow, 0, 0, 1.8, dish, 0.03);
  const dishAim = new THREE.Vector3(LAB + 2.6, 5.0, 1.4);
  dish.lookAt(dishAim);
  const percy = person(lab, { coat: 0xf3efe6, pants: 0x3e5568, skin: 0xe8b48a, hair: 0x4a3426 });
  percy.G.position.set(2.4, 0, 0.9); percy.G.rotation.y = -0.45;
  // pocket + candy bar + drip, in the figure's body space
  mk(BX(0.52, 0.46, 0.08), toon(0xd9d2c4), 0.42, 4.95, 0.6, percy.B, 0.035);
  const candyM = toon(0x7b4a2e);
  const candy = mk(BX(0.34, 0.5, 0.14), candyM, 0.42, 5.22, 0.6, percy.B, 0.03);
  const wrap = mk(BX(0.36, 0.22, 0.16), toon(C.yellow), 0.42, 5.44, 0.6, percy.B, 0.025);
  const drip = mk(CY(0.09, 0.07, 1, 12), candyM, 0.38, 4.6, 0.66, percy.B, 0.025);
  const drop = mk(SP(0.13, 14, 10), candyM, 0.38, 4.2, 0.66, percy.B, 0.025);
  const plate1 = tag("PERCY SPENCER", { bg: "#F4C430", h: 0.62 }); scene.add(plate1);
  const arcs = Array.from({ length: 4 }, () => ribbon(scene, 40, 0.16, C.yellow));

  // ================= RADARANGE (x = -12.5) =================
  const rad = new THREE.Group(); rad.position.set(RAD, 0, 0); scene.add(rad);
  mk(BX(9, 0.5, 7.5), toon(0xd7cfe0), 0, -0.25, 0, rad, 0.06);
  const radM = METAL(0xc9d1da, { spec: 0.25, hatch: 0.22 });
  const cab = new THREE.Group(); cab.position.set(-0.6, 0, -0.6); rad.add(cab);
  mk(BX(3.6, 0.2, 3.2), radM, 0, 0.1, 0, cab); mk(BX(3.6, 0.2, 3.2), radM, 0, 7.4, 0, cab);
  mk(BX(3.6, 7.5, 0.2), radM, 0, 3.75, -1.5, cab); mk(BX(0.2, 7.5, 3.2), radM, -1.7, 3.75, 0, cab);
  mk(BX(3.6, 7.5, 0.2), radM, 0, 3.75, 1.5, cab);
  mk(BX(2.6, 2.0, 0.14), C.coral, -0.2, 4.4, 1.66, cab, 0.04);
  mk(BX(1.7, 1.2, 0.08), toon(0x2b3a48), -0.2, 4.4, 1.75, cab, 0.02);
  mk(BX(0.9, 1.6, 0.12), toon(0xf2e6d3), 1.1, 6.3, 1.65, cab, 0.03);
  // open side: a tall water-cooled magnetron, pipes and a shelf
  mk(BX(3.2, 0.12, 2.8), toon(0x58697a), 0, 3.0, 0, cab, 0.03);
  mk(CY(0.55, 0.55, 1.6, 24), METAL(C.steel), 0.4, 5.6, -0.3, cab, 0.035);
  for (const y of [4.8, 6.4]) mk(CY(0.66, 0.66, 0.26, 24), C.coral, 0.4, y, -0.3, cab, 0.03);
  for (const z of [-0.9, 0.5]) mk(CY(0.12, 0.12, 6.6, 10), toon(C.blue), 1.2, 3.7, z, cab, 0.025);
  mk(BX(2.0, 1.8, 2.0), toon(0x7a8794), 0.2, 1.1, -0.1, cab, 0.035);
  const radT = canvasTex(640, 150, (g, w, h) => { g.fillStyle = "#1C1E21"; g.fillRect(0, 0, w, h); g.fillStyle = "#F5F2EB"; g.font = `900 92px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("RADARANGE", w / 2, h / 2 + 5); });
  const radPlate = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.7), new THREE.MeshBasicMaterial({ map: radT, toneMapped: false })); radPlate.position.set(0, 6.85, 1.62); cab.add(radPlate);
  const visitor = person(rad, { coat: 0x5fa084, pants: 0x2f3b47, skin: 0xc98b62, hair: 0x22201e, labcoat: false, h: 6.4 });
  visitor.G.position.set(3.0, 0, 0.8); visitor.G.rotation.y = -0.6;
  const stamp47 = tag("1947", { bg: "#E06D53", fg: "#ffffff", h: 1.5, px: 90, rot: 0.12 }); scene.add(stamp47);

  // ================= MAGNIFIED FOOD (x = +14) =================
  const fd = new THREE.Group(); fd.position.set(FOOD, 0, 0); scene.add(fd);
  mk(BX(13, 0.4, 9), toon(0xdbe6ee), 0, -0.2, 0, fd, 0.06);
  const PRX = 4.2, PRY = 2.6, PCY = 3.0, PZ = 2.0; // potato half: ellipse radii, centre height, cut face at z = PZ
  const skinT = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#C99A55"; g.fillRect(0, 0, w, h); const R = mulberry(9); for (let i = 0; i < 70; i++) { g.fillStyle = R() > 0.5 ? "#9C7238" : "#E2BE7C"; g.beginPath(); g.ellipse(R() * w, R() * h, 2 + R() * 4, 1.5 + R() * 3, R() * 3, 0, 7); g.fill(); } });
  const skinM = toon(0xffffff, { map: skinT, spec: 0.12, shin: 20 });
  const face = dyn(512, 512);
  const faceM = toon(0xffffff, { map: face.tex });
  mk(CY(5.4, 5.0, 0.3, 64), toon(0xf4f1ea, { spec: 0.5, shin: 80, rim: 0.25 }), 0, 0.15, 0.4, fd, 0.06);
  const slab = mk(new THREE.CylinderGeometry(1, 1, 4, 64), [skinM, faceM, skinM], 0, PCY, PZ - 2, fd, 0.06);
  slab.rotation.x = Math.PI / 2; slab.scale.set(PRX, 1, PRY); slab.userData.hull.scale.set(1 + 0.12 / PRX, 1.03, 1 + 0.12 / PRY);
  const foodTag = tag("MAKANAN", { bg: "#ffffff", h: 0.8 }); scene.add(foodTag);
  const oM5 = toon(0x6f9fc4);
  const mol5 = new THREE.Group(); fd.add(mol5);
  const mols5 = [], R5 = mulberry(77);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) { const g = molecule(mol5, 0.78, oM5, 0.05); mols5.push({ g, x: -3.2 + i * 1.6 + (j % 2) * 0.4, y: 6.5 + j * 1.35, z: 0.4 + (R5() - 0.5) * 0.8, ph: (R5() - 0.5) * 1.4 }); }
  const arrows = [-4.9, 4.9].map((x) => { const g = new THREE.Group(); g.position.set(x, 7.85, 0.4); mol5.add(g); mk(BX(0.34, 2.2, 0.34), C.yellow, 0, -0.3, 0, g, 0.04); mk(new THREE.ConeGeometry(0.55, 0.9, 18), C.yellow, 0, 1.15, 0, g, 0.04); return g; });
  const lens = mk(new THREE.TorusGeometry(4.7, 0.22, 12, 64), toon(0x2f3b47), 0, 7.85, 0.2, mol5, 0);
  const heatP = Array.from({ length: 14 }, () => mk(SP(0.16, 12, 8), toon(C.coral), 0, 0, 0, mol5, 0.025));
  const fieldTag = tag("MEDAN LISTRIK", { bg: "#F4C430", h: 0.85 }); scene.add(fieldTag);
  const cmTag = tag("± 1 cm", { bg: "#F4C430", h: 1.0 }); scene.add(cmTag);
  const brk = new THREE.Group(); brk.position.set(0, PCY + PRY - 0.5, PZ + 0.08); fd.add(brk);
  mk(BX(0.12, 1.0, 0.12), C.ink, 0, 0, 0, brk, 0); for (const y of [-0.5, 0.5]) mk(BX(0.5, 0.12, 0.12), C.ink, 0, y, 0, brk, 0);
  const pen = Array.from({ length: 3 }, () => ribbon(scene, 50, 0.14, C.yellow));

  // ---------- wave ribbons for the microwave ----------
  const LAM = 1.22; // 12,2 cm at 1 unit = 10 cm
  const wv = ribbon(scene, 220, 0.13, C.yellow);
  const wvPath = path([[MW + 2.05, 2.78, -0.4], [MW + 0.85, 2.78, -0.4], [MW - 2.75, 2.78, -0.4]]);
  const wv1 = ribbon(scene, 120, 0.12, C.yellow);
  const wv1Path = path([[MW + 0.85, 2.78, -0.4], [MW - 0.97, 1.45, 0]]);
  const brk12 = new THREE.Group(); scene.add(brk12);
  mk(BX(LAM, 0.07, 0.07), C.ink, 0, 0, 0, brk12, 0); for (const x of [-LAM / 2, LAM / 2]) mk(BX(0.07, 0.36, 0.07), C.ink, x, 0, 0, brk12, 0);
  const lamTag = tag("12,2 cm", { bg: "#F4C430", h: 0.62 }); scene.add(lamTag);
  const ghzTag = tag("2,45 GHz", { bg: "#ffffff", h: 0.62 }); scene.add(ghzTag);
  const magTag = tag("MAGNETRON", { bg: "#E06D53", fg: "#ffffff", h: 0.6 }); scene.add(magTag);
  const plateTag = tag("PIRING", { bg: "#7A9BB8", fg: "#ffffff", h: 0.5 }); scene.add(plateTag);
  const airTag = tag("AIR DI MAKANAN", { bg: "#E06D53", fg: "#ffffff", h: 0.5 }); scene.add(airTag);
  const spinTag = tag("PIRING PUTAR", { bg: "#F4C430", h: 0.55 }); scene.add(spinTag);
  const faraTag = tag("SANGKAR FARADAY", { bg: "#F4C430", h: 0.6 }); scene.add(faraTag);
  const holdTag = tag("TERTAHAN", { bg: "#E06D53", fg: "#ffffff", h: 0.55 }); scene.add(holdTag);
  const passTag = tag("CAHAYA LEWAT", { bg: "#ffffff", h: 0.6 }); scene.add(passTag);
  const door12 = new THREE.Group(); scene.add(door12);
  mk(BX(LAM, 0.05, 0.05), C.ink, 0, 0, 0, door12, 0); for (const x of [-LAM / 2, LAM / 2]) mk(BX(0.05, 0.26, 0.05), C.ink, x, 0, 0, door12, 0);
  const door12Tag = tag("12,2 cm", { bg: "#F4C430", h: 0.4 }); scene.add(door12Tag);
  const bounce = [0, 1].map(() => ribbon(scene, 160, 0.11, C.yellow));
  const bPaths = [path([[MW - 1.7, 2.5, -1.7], [MW - 1.35, 2.5, 2.0], [MW - 0.9, 2.5, -1.7]]), path([[MW - 0.4, 1.8, -1.7], [MW - 0.6, 1.8, 2.0], [MW - 1.3, 1.8, -1.7]])];
  const rays = [0, 1, 2].map(() => ribbon(scene, 30, 0.09, 0xfff4c8, { edge: 1.6 }));
  const rPaths = [-0.5, 0, 0.5].map((o) => path([[MW - 1.2 + o, 1.6 + o * 0.4, -0.2], [MW - 0.97 + o * 0.6, 2.1 + o * 0.3, 2.1], [MW - 0.6, 2.4, 6.5]]));
  const hitRing = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.coral).multiplyScalar(1.2), toneMapped: false, transparent: true, depthWrite: false, side: THREE.DoubleSide })); hitRing.renderOrder = 8; scene.add(hitRing);

  // ---------- camera: one continuous track; [t, tx, ty, tz, dist, azimuth deg, elevation deg] ----------
  const kk = [
    [0, MW - 0.7, 1.5, 0.1, 43, 28, 52],
    [K.s1e - 0.3, MW - 0.8, 1.5, 0.1, 40, 34, 54],
    [K.s2 + 0.9, LAB + 0.2, 4.2, -0.4, 66, 26, 24],
    [A("s2:Percy") - 0.2, LAB + 0.9, 4.6, -0.2, 58, 34, 22],
    [A("s2:permen") - 0.3, LAB + 2.2, 4.8, 0.6, 38, 30, 18],
    [K.s3 + 0.2, LAB + 2.4, 4.7, 1.2, 31, 24, 14],
    [A("s3:Dua") - 0.1, LAB + 2.2, 4.6, 1.1, 34, 30, 16],
    [A("s3:Dua") + 0.9, RAD + 0.2, 4.3, 0, 60, 32, 24],
    [K.s3e, RAD + 0.4, 4.1, 0, 54, 40, 26],
    [K.s4 + 0.9, MW + 0.8, 1.6, -0.2, 36, 75, 70],
    [A("s4:magnetron") + 0.2, MW + 1.8, 1.6, -0.3, 24, 85, 72],
    [A("s4:membuat"), MW + 1.2, 2.0, -0.3, 28, 80, 72],
    [A("s4:gigahertz"), MW - 0.4, 2.2, -0.3, 30, 72, 74],
    [K.s4e, MW - 0.9, 2.3, -0.3, 30, 64, 72],
    [K.s5 + 1.0, FOOD, 6.6, 0.4, 70, 24, 16],
    [A("s5:Molekul"), FOOD, 7.3, 0.4, 62, 20, 14],
    [K.s5e, FOOD + 0.2, 7.3, 0.4, 56, 18, 14],
    [A("s6:makanan") + 0.5, FOOD, 3.8, 1.6, 56, 14, 18],
    [A("s6:menembus"), FOOD - 0.4, 4.0, 2.0, 50, 10, 16],
    [A("s6:merambat"), FOOD + 0.2, 3.8, 2.0, 50, 6, 14],
    [A("s6:piring") - 0.9, FOOD, 3.6, 1.8, 50, 8, 16],
    [A("s6:piring") + 0.3, MW - 0.97, 1.3, 0, 36, 30, 56],
    [K.s6e, MW - 0.97, 1.3, 0, 33, 44, 58],
    [K.s7 + 0.9, MW - 0.4, 2.0, 1.0, 40, 18, 22],
    [A("s7:sangkar"), MW - 0.2, 2.2, 0.4, 46, 34, 30],
    [A("s7:Kaca"), MW - 1.8, 2.9, 2.2, 27, -26, 12],
    [A("s7:lubang"), MW - 1.8, 3.0, 2.2, 21, -18, 8],
    [A("s7:Gelombang"), MW - 0.5, 2.2, 2.4, 34, -45, 20],
    [A("s7:cahaya"), MW - 0.4, 2.2, 4.6, 40, -55, 18],
    [K.s7e, MW - 0.4, 2.2, 4.4, 42, -50, 20],
    [K.s8 + 0.9, MW - 0.2, 1.9, 0.2, 54, 28, 36],
    [K.end, MW - 0.2, 1.9, 0.2, 49, 46, 38],
  ];
  const cv = track(kk);
  const look = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const D2R = Math.PI / 180;
  // cut face: circle in UV space becomes the potato ellipse; 1 unit = 256/PRX px across, 256/PRY px up
  const heatFace = (g, w, h, p, a) => {
    const ux = 256 / PRX, uy = 256 / PRY;
    const el = (k, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(256, 256, Math.max(1, 255 - ux * k), Math.max(1, 255 - uy * k), 0, 0, 7); g.fill(); };
    el(0, "#F3E6B5"); halftone(g, 0, 0, w, h, "rgba(201,154,85,.35)", 14, 3);
    if (a > 0.01) {
      el(0, "#E06D53");
      for (let k = 0; k < 8; k++) { const f = (k + 1) / 8; el(a + p * 1.4 * f, `rgb(${Math.round(224 + 19 * f)},${Math.round(109 + 121 * f)},${Math.round(83 + 98 * f)})`); }
      el(a + p * 1.4, "#F3E6B5");
      g.save(); g.beginPath(); g.ellipse(256, 256, 255 - ux * (a + p * 1.4), 255 - uy * (a + p * 1.4), 0, 0, 7); g.clip(); halftone(g, 0, 0, w, h, "rgba(122,155,184,.45)", 14, 3.2); g.restore();
      g.strokeStyle = "#1C1E21"; g.lineWidth = 6; g.setLineDash([16, 10]); g.beginPath(); g.ellipse(256, 256, 255 - ux * a, 255 - uy * a, 0, 0, 7); g.stroke(); g.setLineDash([]);
    }
  };

  return function draw(t) {
    // ---- camera ----
    const [tx, ty, tz, d, az, el] = cv(t);
    const ce = Math.cos(el * D2R);
    cam.position.set(tx + d * ce * Math.sin(az * D2R), ty + d * Math.sin(el * D2R), tz + d * ce * Math.cos(az * D2R));
    look.set(tx, ty, tz); cam.lookAt(look);
    sun.position.copy(look).add(SUN); sun.target.position.copy(look); sun.target.updateMatrixWorld();

    // ---- microwave state ----
    const heat1 = ramp(t, A("s1:menggoyang") - 0.4, A("s1:panas") + 0.3);
    const on = t < K.s2 + 0.4 || t > K.s4 - 0.2;
    lamp.intensity = on ? (t < K.s2 ? 0.8 : 2.6) : 0;
    tt.rotation.y = t * 0.55;
    foodM.color.setRGB(0.62 + 0.38 * heat1, 0.7 + 0.3 * heat1, 0.8 + 0.2 * heat1);
    oM1.color.set(0x6f9fc4).lerp(new THREE.Color(C.coral), heat1);
    const molVis = t < K.s2 + 0.3 || t > K.s8 - 0.2;
    mols1.forEach((m, i) => {
      m.g.visible = molVis;
      const a = tt.rotation.y; const x = -0.97 + (m.x + 0.97) * Math.cos(a) + m.z * Math.sin(a), z = -(m.x + 0.97) * Math.sin(a) + m.z * Math.cos(a);
      m.g.position.set(x, m.y + 0.06 * Math.sin(t * 2 + m.ph), z);
      m.g.rotation.set(0.4, t * 0.6 + m.ph, Math.sin(t * 8.5 + m.ph) * (0.35 + 0.7 * heat1));
    });
    const steamOn = (t < K.s2 + 0.3 ? 0.35 * heat1 : 0) + (t > K.s6 - 0.2 && t < K.s7 ? 0.7 : 0) + (t > K.s8 - 0.3 ? 1 : 0);
    steam.forEach((s, i) => {
      const u = (t * 0.32 + i / 6) % 1;
      s.position.set(-0.97 + Math.sin(u * 6 + i * 2) * 0.35, (t < K.s2 + 0.3 ? 2.6 : 1.5) + u * 2.0, Math.cos(i * 2.1) * 0.3);
      s.scale.setScalar(Math.max(0.001, steamOn * (0.4 + 0.8 * Math.sin(Math.PI * u))));
      s.visible = steamOn > 0.02;
    });
    const tg1 = (t < K.s2 - 0.1 ? 1 : 0) * clamp01(1 - (t - K.s2 + 0.4) / 0.3);
    showTag(plateTag, tg1); plateTag.position.set(MW - 0.97 + 0.9, 0.85, 1.5);
    showTag(airTag, tg1); airTag.position.set(MW - 0.97 - 0.3, 3.1, 0.2);
    // s1 hook wave from the waveguide mouth into the bowl
    const w1 = t < K.s2 + 0.2 ? 1 : 0;
    wv1.set((u, o) => wv1Path.at(u, o, 0.13, 0.55, t * 9), 0, w1, cam, w1);

    // ---- s4: magnetron + travelling wave + labels ----
    const s4 = t > K.s4 - 0.2 && t < K.s5 + 0.3;
    const wr = ramp(t, A("s4:membuat") - 0.2, A("s4:frekuensi") + 0.3);
    wv.set((u, o) => wvPath.at(u, o, 0.3, LAM, t * 6), 0, s4 ? wr : 0, cam, s4 ? 1 : 0);
    showTag(magTag, 0); // the panel card names the magnetron; a 3D tag here collided with the captions in the top-down shot magTag.position.set(MW + 2.6, 3.0, 1.0);
    showTag(ghzTag, s4 ? ramp(t, A("s4:dua") - 0.2, A("s4:dua") + 0.1) : 0); ghzTag.position.set(MW + 1.3, 3.65, -0.4);
    const lb = s4 ? ramp(t, A("s4:panjang") - 0.2, A("s4:panjang") + 0.2) : 0;
    brk12.visible = lb > 0.01; brk12.position.set(MW - 1.0 - LAM / 2 - 0.05, 3.32, -0.4); brk12.scale.set(Math.max(0.001, lb), 1, 1);
    showTag(lamTag, lb); lamTag.position.set(MW - 1.6, 3.9, -0.4);
    mag.rotation.y = s4 ? Math.sin(t * 30) * 0.004 : 0;

    // ---- s2/s3 lab: Percy, waves from the dish, melting candy ----
    const labOn = t > K.s2 - 0.4 && t < A("s3:Dua") + 1.2;
    const melt = ramp(t, A("s2:permen") + 0.3, A("s2:meleleh") + 0.4) + 0.4 * ramp(t, K.s3, A("s3:radar"));
    drip.scale.set(1, Math.max(0.001, melt * 0.9), 1); drip.position.y = 4.98 - 0.45 * melt * 0.9;
    drop.visible = melt > 0.1; drop.position.y = 4.98 - 0.9 * melt - 0.05 + 0.04 * Math.sin(t * 5);
    candy.scale.set(1 + 0.12 * melt, 1 - 0.35 * melt, 1 + 0.25 * melt); candy.position.y = 5.22 - 0.09 * melt;
    candyM.color.set(0x7b4a2e).lerp(new THREE.Color(0xa35a34), melt * 0.6);
    wrap.position.y = 5.44 - 0.17 * melt;
    const look2 = ramp(t, A("s2:permen") - 0.7, A("s2:permen") + 0.2);
    pose(percy, { lA: 0.15 + 0.5 * look2, lE: 0.5 + 0.9 * look2, rA: 0.75 - 0.3 * look2, rE: 1.25, hx: 0.05 + 0.45 * look2, hy: 0.35 * (1 - look2) - 0.15 * look2 });
    tubeM.emissiveIntensity = labOn ? 0.35 + 0.15 * Math.sin(t * 7) : 0;
    showTag(plate1, labOn ? ramp(t, A("s2:Percy") - 0.3, A("s2:Percy")) * (1 - ramp(t, A("s2:permen") - 0.9, A("s2:permen") - 0.6)) : 0);
    plate1.position.set(LAB + 0.7, 4.3, 2.4);
    const dishW = dish.getWorldPosition(tmp2).clone(), aim = dishAim.clone().sub(dishW).normalize();
    const side = new THREE.Vector3().crossVectors(aim, new THREE.Vector3(0, 1, 0)).normalize();
    const upv = new THREE.Vector3().crossVectors(side, aim);
    const arcStr = labOn ? ramp(t, A("s2:bekerja") - 0.4, A("s2:radar")) + ramp(t, K.s3, A("s3:gelombang")) : 0;
    arcs.forEach((R, i) => {
      const u = (t * 0.42 + i / 4) % 1, rr = 1.4 + u * 9.5;
      const a0 = -0.5, a1 = 0.5;
      R.set((v, o) => { const a = a0 + (a1 - a0) * v; return o.copy(dishW).addScaledVector(aim, rr * Math.cos(a)).addScaledVector(side, rr * Math.sin(a) * 0.9).addScaledVector(upv, rr * Math.sin(a) * 0.35); }, 0, 1, cam, Math.min(1, arcStr) * (1 - u) * 1.2, 1 + u);
    });

    // ---- s3 Radarange ----
    showTag(stamp47, ramp(t, A("s3:Dua") + 0.4, A("s3:Dua") + 0.8) * (1 - ramp(t, K.s4 - 0.3, K.s4)));
    stamp47.position.set(RAD - 3.4, 1.6, 2.2);
    pose(visitor, { lA: 0.1, lE: 0.4, rA: 0.9, rE: 1.0, hx: -0.05, hy: 0.5 });

    // ---- s5 molecules in the magnifier ----
    const s5on = t > K.s5 - 0.3 && t < A("s6:makanan") + 0.9;
    const shrink = 1 - ramp(t, A("s6:Tapi") - 0.1, A("s6:makanan") + 0.7);
    mol5.visible = s5on; mol5.scale.setScalar(Math.max(0.001, shrink)); mol5.position.y = -3.2 * (1 - shrink);
    lens.lookAt(tmp.set(cam.position.x, cam.position.y, cam.position.z));
    const fa = ramp(t, A("s5:medan") - 0.3, A("s5:listrik"));
    const ph5 = t - A("s5:berbalik");
    const E = fa * Math.tanh(3 * Math.sin(2 * Math.PI * 0.85 * (t - K.s5)));
    arrows.forEach((g) => { g.scale.set(1, Math.max(0.05, Math.abs(E)), 1); g.rotation.z = E < 0 ? Math.PI : 0; g.visible = fa > 0.02; });
    const follow = ramp(t, A("s5:Molekul") - 0.4, A("s5:berputar"));
    const heat5 = ramp(t, A("s5:gerakan") - 0.3, A("s5:panas") + 0.3);
    oM5.color.set(0x6f9fc4).lerp(new THREE.Color(C.coral), heat5);
    mols5.forEach((m) => {
      const target = E * 1.15;
      const idle = m.ph + 0.25 * Math.sin(t * 1.3 + m.ph * 4);
      m.g.position.set(m.x + 0.05 * heat5 * Math.sin(t * 23 + m.ph * 9), m.y, m.z);
      m.g.rotation.set(0, 0.25 * Math.sin(t + m.ph), idle * (1 - follow) + target * follow);
    });
    heatP.forEach((p, i) => { const u = (t * 0.45 + i / 14) % 1; p.visible = heat5 > 0.05; p.position.set(-3.6 + (i % 7) * 1.2 + Math.sin(u * 8 + i) * 0.2, 5.9 + u * 4.2, 1.2); p.scale.setScalar(Math.max(0.001, heat5 * Math.sin(Math.PI * u) * 1.2)); });
    showTag(fieldTag, s5on ? fa * shrink : 0); fieldTag.position.set(FOOD + 3.4, 5.7, 2.6);

    fd.visible = t > K.s4 && t < K.s7;
    // ---- s6 cross-section: 1 cm penetration, heat creeps inward ----
    const pa = ramp(t, A("s6:menembus") - 0.2, A("s6:sentimeter")), pc = ramp(t, A("s6:Bagian"), A("s6:luar") + 0.4);
    face.paint(Math.round(pa * 20) + "_" + Math.round(pc * 40), (g, w, h) => heatFace(g, w, h, Math.round(pc * 40) / 40, Math.round(pa * 20) / 20));
    const s6on = t > A("s6:Gelombang") - 0.5 && t < A("s6:piring") - 0.4;
    showTag(foodTag, t > A("s6:makanan") && t < A("s6:piring") - 0.4 ? ramp(t, A("s6:makanan"), A("s6:makanan") + 0.3) : 0); foodTag.position.set(FOOD + 3.6, PCY + 2.4, PZ + 0.4);
    pen.forEach((R, i) => {
      const xr = -2.4 + i * 2.4, x = FOOD + xr, top = PCY + PRY * Math.sqrt(1 - (xr / PRX) ** 2), y0 = top + 3.4, y1 = top - 1.0;
      const rv = ramp(t, A("s6:Gelombang") - 0.2 + i * 0.15, A("s6:menembus") + 0.4 + i * 0.15);
      R.set((u, o) => { const y = y0 + (y1 - y0) * u; const amp = y > top ? 0.28 : 0.28 * Math.max(0, (y - y1) / 1.0); return o.set(x + amp * Math.sin(y * 5.2 + t * 7), y, PZ + 0.12); }, 0, s6on ? rv : 0, cam, s6on ? 1 : 0);
    });
    brk.visible = pa > 0.02 && s6on; brk.scale.setScalar(Math.max(0.001, pa));
    showTag(cmTag, s6on ? pa : 0); cmTag.position.set(FOOD - 2.0, PCY + PRY - 0.1, PZ + 0.4);

    // ---- s6 end: turntable evens out the hot spots ----
    const sp = t > A("s6:piring") - 0.4 && t < K.s7 + 0.3 ? ramp(t, A("s6:piring") - 0.2, A("s6:putar") + 0.3) : 0;
    const spc = new THREE.Vector3(MW - 0.97, 0.75, 0);
    spin.set((u, o) => { const a = -0.3 + u * 4.6 + t * 0.55; return o.set(spc.x + Math.cos(a) * 1.85, spc.y, spc.z - Math.sin(a) * 1.85); }, 0, sp, cam, sp > 0 ? 1 : 0);
    { const a = -0.3 + 4.6 + t * 0.55; spinHead.visible = sp > 0.95; spinHead.position.set(spc.x + Math.cos(a) * 1.85, spc.y, spc.z - Math.sin(a) * 1.85); spinHead.rotation.set(0, a, Math.PI / 2); }
    hot.forEach((m, i) => { const a = i * 2.1 + 0.4; m.position.set(-0.97 + Math.cos(a) * 0.95, 0.62, Math.sin(a) * 0.95); m.material.opacity = sp * (0.55 + 0.25 * Math.sin(t * 4 + i)); m.visible = sp > 0.01; });
    showTag(spinTag, sp * (t < K.s7 ? 1 : 0)); spinTag.position.set(MW - 0.97 + 1.2, 3.4, 1.4);

    // ---- s7 door: Faraday cage, waves bounce off the mesh, light passes to the eye ----
    const s7on = t > K.s7 - 0.2 && t < K.s8 + 0.3;
    const cg = s7on ? ramp(t, A("s7:sangkar") - 0.2, A("s7:Faraday")) * (1 - ramp(t, A("s7:Kaca"), A("s7:Kaca") + 0.6)) : 0;
    cage.visible = cg > 0.01; cageM.opacity = cg; cage.children.forEach((m) => (m.renderOrder = 9));
    showTag(faraTag, s7on ? ramp(t, A("s7:sangkar") - 0.1, A("s7:Faraday")) * (1 - ramp(t, A("s7:Kaca") - 0.2, A("s7:Kaca") + 0.2)) : 0); faraTag.position.set(MW - 0.97, 0.9, 2.6);
    const bw = s7on ? ramp(t, A("s7:gelombangnya") - 0.3, A("s7:bocor")) : 0;
    bounce.forEach((R, i) => { const u1 = ((t - K.s7) * 0.32 + i * 0.5) % 1.5; R.set((u, o) => bPaths[i].at(u, o, 0.2, LAM, t * 5), Math.max(0, u1 - 0.55), Math.min(1, u1), cam, bw); });
    const hp = (((t - K.s7) * 0.32) % 1.5) / 1.5; hitRing.visible = bw > 0.05;
    hitRing.position.set(MW - 1.35, 2.5, 2.16); hitRing.scale.setScalar(0.6 + 1.2 * ((t * 1.1) % 1)); hitRing.material.opacity = bw * (1 - ((t * 1.1) % 1));
    showTag(holdTag, s7on ? ramp(t, A("s7:tertahan") - 0.3, A("s7:tertahan")) : 0); holdTag.position.set(MW - 2.5, 1.05, 2.6);
    const rv = s7on ? ramp(t, A("s7:cahaya") - 0.4, A("s7:lewat")) : 0;
    rays.forEach((R, i) => { const u = (t * 0.55 + i * 0.33) % 1; R.set((v, o) => rPaths[i].at(v, o), Math.max(0, u - 0.3), u, cam, rv); });
    eye.visible = t > A("s7:Gelombang") - 1.5 && t < K.s8 + 0.4;
    showTag(passTag, rv); passTag.position.set(MW - 0.6, 3.5, 7.2);
    const dl = s7on ? ramp(t, A("s7:lubang") - 0.2, A("s7:kecil")) * (1 - ramp(t, A("s7:Gelombang") - 0.2, A("s7:Gelombang") + 0.2)) : 0;
    door12.visible = dl > 0.01; door12.position.set(MW - 0.97 - 0.6, 3.22, 2.3); door12.scale.set(Math.max(0.001, dl), 1, 1);
    showTag(door12Tag, dl); door12Tag.position.set(MW - 0.3, 3.22, 2.45);

    comp.render();
  };
}
