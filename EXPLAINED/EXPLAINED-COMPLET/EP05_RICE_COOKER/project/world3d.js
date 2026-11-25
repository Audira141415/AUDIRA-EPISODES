// EP05 RICE COOKER (FOODFORGE): a warm food-commercial kitchen at dusk. One long oiled-walnut counter in a dark
// warm room, a soft window glow and defocused bokeh on the back wall, steam backlit by a hot rim light, glossy rice
// grains with their own warm envMap. Stations along the counter (left to right):
//   B  x=-4.3  history riser: a 1923 boxy cooker and a 1955 automatic cooker with years on a timeline board
//   A  x= 0    hero: steaming bowl of rice in front, a generic rice cooker behind (AUDIRA on its control pod);
//              the cooker opens into a cutaway: heater plate, inner bowl, thermostat button, lever linkage, dial gauge
//   C  x=+4.3  the problem: kitchen timer, a burnt bowl and an undercooked bowl
//   D  x=+8.8  1951 workshop: two generic figures with name plates testing small pots; a conveyor of rival cookers
// Generic products only, no logos. Foreground props (chopsticks, spoon, bowl edge / linen, paddle) ride the camera
// as pre-blurred planes to fake shallow depth of field. Every value is a pure function of t.
import * as THREE from "./three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { mulberry, ramp, back, eout, clamp01, canvasTex, track, std, stage } from "./lib3d.js";

const C = {
  void: 0x140c08, walnut: "#4A2A16", rice: 0xf7f2e7, riceRaw: 0xd6d0c0, glaze: 0x22324a, cream: 0xefe6d6,
  body: 0xeee7da, lid: 0xd8cfc0, pod: 0x2a1a12, key: 0xffd6a0, rim: 0xffb36b, cool: 0xafc6ff, heat: 0xff5a1a,
};
const SERIF = "Georgia, 'Times New Roman', serif", MONO = "'Courier New', monospace", SANS = "Arial, Helvetica, sans-serif";

const NanGuard = { uniforms: { tDiffuse: { value: null } }, vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(!(c.r==c.r&&c.g==c.g&&c.b==c.b)||c.r>1e4||c.g>1e4||c.b>1e4)c=vec4(0.0,0.0,0.0,1.0);gl_FragColor=max(c,vec4(0.0));}` };
// Warm food grade: amber shadows, cream highlights, a touch more saturation.
const Grade = { uniforms: { tDiffuse: { value: null } }, vertexShader: NanGuard.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
  float l=dot(c,vec3(0.299,0.587,0.114));c=mix(c,c*vec3(1.05,1.0,0.9),0.55);c+=vec3(0.020,0.011,0.004)*(1.0-l);
  c=mix(vec3(l),c,1.08);gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}` };

const V2 = (pts) => pts.map(([r, y]) => new THREE.Vector2(r, y));
const lathe = (pts, seg = 56, ps = 0, pl = Math.PI * 2) => new THREE.LatheGeometry(V2(pts), seg, ps, pl);
const BACK = [Math.PI / 2, Math.PI], FRONT = [-Math.PI / 2, Math.PI];
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
const phys = (color, r = 0.35, cc = 0.6, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: r, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.14, ...extra });
const metal = (color, r = 0.3) => new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0.9 });
const win = (t, a, b, f = 0.3) => ramp(t, a - f, a) * (1 - ramp(t, b, b + f));

function envFrom(r, strips, base) {
  const pm = new THREE.PMREMGenerator(r); const s = new THREE.Scene(); s.background = new THREE.Color(base);
  for (const [w, h, c, i, x, y, z] of strips) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  }
  const tx = pm.fromScene(s, 0.04).texture; pm.dispose(); return tx;
}
function textTex(w, h, draw) { return canvasTex(w, h, (g) => { g.clearRect(0, 0, w, h); draw(g, w, h); }); }

// ---------- rice ----------
const GRAIN = new THREE.CapsuleGeometry(0.0042, 0.011, 3, 6);
function grains(n, seed, mat, place) {
  const im = new THREE.InstancedMesh(GRAIN, mat, n); const R = mulberry(seed); const o = new THREE.Object3D();
  for (let i = 0; i < n; i++) { place(R, o, i); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
  im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; return im;
}
const bumpy = (x, z) => 0.006 * Math.sin(x * 41 + 1.3) * Math.cos(z * 37) + 0.004 * Math.sin(x * 97 + z * 83);
const domePlace = (Rad, H, y0, zSign = 0, bump = 0) => (R, o) => {
  let x, z, k = 0;
  do { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * Rad; x = Math.cos(a) * r; z = Math.sin(a) * r; k++; } while (zSign && Math.sign(z) !== zSign && k < 20);
  const q = Math.hypot(x, z) / Rad; const y = y0 + H * Math.pow(Math.max(0, 1 - q * q), 0.7) + (R() - 0.5) * 0.004 + bump * bumpy(x, z);
  o.position.set(x, y, z); o.rotation.set(Math.PI / 2 + (R() - 0.5) * 0.9, R() * 6.28, (R() - 0.5) * 0.9); o.scale.setScalar(0.9 + R() * 0.25);
};
function riceMound(parent, Rad, H, y0, n, seed, mat, zSign = 0, bump = 0) {
  const g = new THREE.Group(); parent.add(g);
  const base = new THREE.Mesh(new THREE.SphereGeometry(Rad * 0.97, 40, 12, zSign > 0 ? 0 : zSign < 0 ? Math.PI : 0, zSign ? Math.PI : Math.PI * 2, 0, Math.PI / 2), mat);
  base.scale.set(1, H / Rad, 1); base.position.y = y0 - 0.003; base.receiveShadow = true; g.add(base);
  g.add(grains(n, seed, mat, domePlace(Rad, H, y0, zSign, bump)));
  return g;
}
function chawan(parent, x, z, glaze = C.glaze, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  mesh(lathe([[0.0, 0.0], [0.072, 0.0], [0.076, 0.012], [0.07, 0.017], [0.1, 0.03], [0.148, 0.068], [0.17, 0.1], [0.172, 0.104]]), phys(glaze, 0.22, 1, { side: THREE.DoubleSide }), g);
  mesh(lathe([[0.168, 0.104], [0.146, 0.075], [0.1, 0.043], [0.0, 0.034]]), phys(C.cream, 0.25, 1, { side: THREE.DoubleSide }), g);
  // a brushed cream band near the rim, like a hand-glazed bowl
  const band = mesh(new THREE.TorusGeometry(0.159, 0.0035, 6, 64), phys(0xe9d9bd, 0.3, 1), g, 0, 0.088, 0); band.rotation.x = Math.PI / 2; band.scale.set(1, 1, 1);
  return g;
}

// ---------- steam / smoke sprites ----------
function steamTex(seed) {
  return canvasTex(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256); const R = mulberry(seed);
    for (let i = 0; i < 26; i++) { const x = 128 + (R() - 0.5) * 90, y = 128 + (R() - 0.5) * 140, r = 30 + R() * 60; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${0.12 + R() * 0.12})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  });
}
let STEAM = null;
function steam(parent, n, seed, { spread = 0.08, rise = 0.6, size = 0.16, color = 0xffe2c0, per = [2.4, 3.8], normal = false, op = 0.26 } = {}) {
  STEAM = STEAM || [steamTex(11), steamTex(23), steamTex(37)];
  const R = mulberry(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map: STEAM[i % 3], color, transparent: true, opacity: 0, depthWrite: false, blending: normal ? THREE.NormalBlending : THREE.AdditiveBlending, fog: false });
    const s = new THREE.Sprite(m); s.renderOrder = 5; parent.add(s);
    arr.push({ s, m, x: (R() - 0.5) * 2 * spread, z: (R() - 0.5) * 2 * spread, per: per[0] + R() * (per[1] - per[0]), ph: R(), dr: 0.4 + R() * 0.6, sz: size * (0.7 + R() * 0.6), rot: R() * 6 });
  }
  return (t, amt, ox = 0, oy = 0, oz = 0) => {
    arr.forEach((w, i) => {
      if (amt <= 0.002) { w.s.visible = false; return; }
      w.s.visible = true;
      const u = (t / w.per + w.ph) % 1, sz = w.sz * (0.5 + u * 1.5);
      w.s.position.set(ox + w.x * (1 - u * 0.3) + Math.sin(t * 0.9 + i * 1.7 + u * 3) * w.dr * u * spread * 1.6, oy + u * rise, oz + w.z);
      w.s.scale.set(sz, sz * 1.45, 1); w.m.opacity = Math.sin(Math.PI * u) * op * amt; w.m.rotation = w.rot + u * 0.8;
    });
  };
}

// ---------- people (generic stylised, no likeness: painted eye/brow shading, hair, clothing folds, aprons) ----------
const hex = (c) => "#" + new THREE.Color(c).getHexString();
function faceTex(skin, hair, fem) {
  return canvasTex(512, 256, (g, w, h) => {
    const sk = new THREE.Color(skin); g.fillStyle = hex(skin); g.fillRect(0, 0, w, h);
    const cx = w * 0.25, sh = (k) => "#" + sk.clone().multiplyScalar(k).getHexString();
    g.filter = "blur(2px)";
    g.fillStyle = sh(0.8); g.beginPath(); g.ellipse(cx, 150, 9, 20, 0, 0, 7); g.fill();
    g.fillStyle = sh(0.86); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 30, 128, 17, 11, 0, 0, 7); g.fill(); }
    g.fillStyle = "rgba(220,110,90,.25)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 40, 160, 14, 9, 0, 0, 7); g.fill(); }
    g.filter = "blur(0.6px)";
    g.fillStyle = "#1a100a"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 29, 130, 7, 5, 0, 0, 7); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.7)"; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 29 + 2, 128, 1.6, 0, 7); g.fill(); }
    g.strokeStyle = hex(hair); g.lineCap = "round"; g.lineWidth = fem ? 3 : 5; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 16, 112); g.quadraticCurveTo(cx + s * 30, fem ? 104 : 106, cx + s * 44, 112); g.stroke(); }
    g.strokeStyle = fem ? "#9a3a32" : sh(0.6); g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 12, 176); g.quadraticCurveTo(cx, 181, cx + 12, 176); g.stroke();
    g.filter = "none";
  });
}
function clothTex(c, { collar = false, folds = 1, pocket = false, stripe = null } = {}) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = hex(c); g.fillRect(0, 0, w, h); const R = mulberry(c & 0xffff);
    g.filter = "blur(5px)";
    for (let i = 0; i < 14 * folds; i++) { const x = R() * w, a = 0.1 + R() * 0.18; g.strokeStyle = `rgba(0,0,0,${a})`; g.lineWidth = 5 + R() * 8; g.beginPath(); g.moveTo(x, h * (0.2 + R() * 0.3)); g.quadraticCurveTo(x + (R() - 0.5) * 40, h * 0.6, x + (R() - 0.5) * 30, h); g.stroke(); g.strokeStyle = `rgba(255,255,255,${a * 0.6})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 8, h * 0.4); g.lineTo(x + 6 + (R() - 0.5) * 20, h); g.stroke(); }
    g.filter = "none";
    if (stripe) { g.fillStyle = stripe; g.fillRect(0, h * 0.08, w, 6); }
    if (collar) { g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.moveTo(0, 0); g.lineTo(22, 40); g.lineTo(0, 70); g.fill(); g.beginPath(); g.moveTo(w, 0); g.lineTo(w - 22, 40); g.lineTo(w, 70); g.fill(); g.fillStyle = "rgba(0,0,0,.35)"; for (let y = 60; y < h; y += 40) { g.beginPath(); g.arc(5, y, 3, 0, 7); g.fill(); } }
    if (pocket) { g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 3; g.strokeRect(-30, h * 0.55, 60, 50); g.strokeRect(w - 30, h * 0.55, 60, 50); }
  });
}
function person({ shirt, pants, skin = 0xc68c62, hair = 0x1c120c, skirt = false, apron = null, fem = false }) {
  const G = new THREE.Group(), add = (geo, mat, x, y, z, p = G) => mesh(geo, mat, p, x, y, z);
  const mS = std(0xffffff, 0.82, 0, { map: clothTex(shirt, { collar: true }) }), mP = std(0xffffff, 0.75, 0, { map: clothTex(pants, { folds: 0.7 }) });
  const mK = std(skin, 0.55), mSh = std(0x2a1a12, 0.5);
  const mH = std(0xffffff, 0.55, 0, { map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = hex(hair); g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,.12)"; for (let i = 0; i < 40; i++) { g.lineWidth = 1 + (i % 3); g.beginPath(); g.moveTo(i * 3.3, 0); g.lineTo(i * 3.3 + 10, h); g.stroke(); } }) });
  const leg = (x) => {
    const hip = new THREE.Group(); hip.position.set(x, 0.86, 0); G.add(hip);
    add(new THREE.CapsuleGeometry(0.068, 0.32, 6, 12), skirt ? mK : mP, 0, -0.2, 0, hip);
    const kn = new THREE.Group(); kn.position.y = -0.43; hip.add(kn);
    add(new THREE.CapsuleGeometry(0.054, 0.31, 6, 12), skirt ? mK : mP, 0, -0.2, 0, kn);
    add(new THREE.SphereGeometry(0.066, 12, 8), mSh, 0, -0.41, 0.04, kn).scale.set(0.85, 0.5, 1.6);
    return { hip, kn };
  };
  const legL = leg(-0.095), legR = leg(0.095);
  add(lathe([[0.001, 0.8], [0.14, 0.82], [0.155, 0.92], [0.15, 0.98], [0.001, 0.98]], 24), mP, 0, 0, 0).scale.set(1.12, 1, 0.78);
  add(lathe([[0.001, 0.93], [0.14, 0.94], [0.145, 1.06], [0.17, 1.24], [0.2, 1.38], [0.19, 1.45], [0.12, 1.51], [0.05, 1.54], [0.001, 1.545]], 32), mS, 0, 0, 0).scale.set(1.35, 1, 0.72);
  add(new THREE.TorusGeometry(0.055, 0.016, 8, 20), mS, 0, 1.53, 0).rotation.x = Math.PI / 2;
  if (skirt) { const sk = add(lathe([[0.15, 1.0], [0.2, 0.82], [0.27, 0.5]], 32), std(0xffffff, 0.78, 0, { side: THREE.DoubleSide, map: clothTex(pants, { folds: 1.6 }) }), 0, 0, 0); sk.scale.set(1.15, 1, 0.85); }
  if (apron) {
    const ap = add(lathe([[0.16, 1.36], [0.162, 1.2], [0.165, 1.02], [0.2, 0.8], [0.24, 0.56]], 24, -0.95, 1.9), std(0xffffff, 0.86, 0, { side: THREE.DoubleSide, map: clothTex(apron, { folds: 1.3, pocket: true, stripe: "rgba(150,70,40,.6)" }) }), 0, 0, 0.006);
    ap.scale.set(1.4, 1, 0.8);
    for (const s of [-1, 1]) { const st = add(new THREE.BoxGeometry(0.02, 0.2, 0.012), std(apron, 0.86), s * 0.11, 1.44, 0.11); st.rotation.z = s * 0.25; }
  }
  const hp = new THREE.Group(); hp.position.set(0, 1.53, 0); G.add(hp);
  add(new THREE.CylinderGeometry(0.042, 0.05, 0.1, 12), mK, 0, 0.04, 0, hp);
  add(new THREE.SphereGeometry(0.1, 32, 24), std(0xffffff, 0.55, 0, { map: faceTex(skin, hair, fem) }), 0, 0.17, 0.01, hp).scale.set(0.86, 1.1, 0.97);
  add(new THREE.SphereGeometry(0.068, 16, 12), mK, 0, 0.115, 0.03, hp).scale.set(0.95, 0.7, 0.95);
  add(new THREE.SphereGeometry(0.016, 10, 8), mK, 0, 0.165, 0.1, hp).scale.set(0.9, 1.1, 1.1);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.022, 8, 6), mK, s * 0.086, 0.165, 0.0, hp).scale.set(0.5, 1, 0.8);
  add(new THREE.SphereGeometry(0.106, 24, 12, 0, 6.3, 0, 1.3), mH, 0, 0.192, -0.012, hp);
  add(new THREE.SphereGeometry(0.104, 20, 12, Math.PI * 0.6, Math.PI * 0.8, 0.9, 1.1), mH, 0, 0.17, -0.012, hp);
  if (fem) {
    add(new THREE.SphereGeometry(0.055, 14, 10), mH, 0, 0.235, -0.095, hp);
    for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.06, 12, 8), mH, s * 0.05, 0.255, 0.05, hp).scale.set(1, 0.45, 0.7);
  } else {
    add(new THREE.SphereGeometry(0.07, 14, 10), mH, 0.025, 0.265, 0.045, hp).scale.set(1.25, 0.45, 0.9);
  }
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.245, 1.42, 0); G.add(sh);
    add(new THREE.SphereGeometry(0.066, 12, 10), mS, 0, 0, 0, sh);
    add(new THREE.CapsuleGeometry(0.056, 0.21, 6, 12), mS, 0, -0.15, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    add(new THREE.CylinderGeometry(0.054, 0.05, 0.06, 12), mS, 0, -0.02, 0, el);
    add(new THREE.CapsuleGeometry(0.044, 0.19, 6, 12), mK, 0, -0.13, 0, el);
    add(new THREE.SphereGeometry(0.045, 12, 10), mK, 0, -0.27, 0.01, el).scale.set(0.8, 1.15, 1);
    return { sh, el };
  };
  return { G, legL, legR, armL: arm(-1), armR: arm(1), head: hp };
}
function pose(p, { rL = 0, rR = 0, eL = 0.5, eR = 0.5, sL = 0.12, sR = -0.12, hx = 0, hy = 0 }) {
  p.armL.sh.rotation.set(-rL, 0, sL); p.armL.el.rotation.x = -eL;
  p.armR.sh.rotation.set(-rR, 0, sR); p.armR.el.rotation.x = -eR;
  p.legL.hip.rotation.x = -0.03; p.legR.hip.rotation.x = -0.03; p.legL.kn.rotation.x = 0.08; p.legR.kn.rotation.x = 0.1;
  p.head.rotation.set(hx, hy, 0);
}

// ---------- the generic rice cooker (used once as the hero, then simplified for the conveyor) ----------
function smallCooker(parent, x, z, col, s = 0.6) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  mesh(lathe([[0, 0], [0.3, 0], [0.345, 0.02], [0.36, 0.06], [0.36, 0.36], [0.35, 0.41], [0.32, 0.43], [0, 0.43]], 40), phys(col, 0.3, 0.8), g);
  mesh(lathe([[0, 0.56], [0.12, 0.55], [0.24, 0.51], [0.32, 0.46], [0.345, 0.43], [0, 0.43]], 40), phys(0xd8cfc0, 0.3, 0.8), g);
  mesh(new THREE.BoxGeometry(0.2, 0.13, 0.1), phys(C.pod, 0.25, 1), g, 0, 0.08, 0.35);
  mesh(new THREE.BoxGeometry(0.2, 0.03, 0.05), std(0x2a2420, 0.4), g, 0, 0.575, -0.02);
  return g;
}

export function create(canvas, K, AT) {
  const { r, scene, cam, comp, bp } = stage(canvas, { bg: C.void, fog: 0.045, exp: 0.9, bloom: [0.32, 0.6, 0.86] });
  comp.insertPass(new ShaderPass(NanGuard), 1);
  comp.addPass(new ShaderPass(Grade));
  scene.environment = envFrom(r, [[5, 2, 0xffd6a0, 1.3, -3, 3, 2], [2, 3, 0xffb36b, 1.0, 3, 1.5, -3], [3, 1, 0xafc6ff, 0.25, 4, 2, 3]], 0x0a0604);
  scene.environmentIntensity = 0.45;
  const riceEnv = envFrom(r, [[4, 2, 0xfff1dc, 2.2, -2, 3, 2], [2, 2.5, 0xffb36b, 1.6, 2.5, 1.5, -2.5], [6, 0.6, 0xffe6c4, 0.9, 0, -1, 3]], 0x120a06);
  const A = (k) => AT[k];
  const add = (o) => (scene.add(o), o);
  const W = new THREE.Group(); scene.add(W);

  // ---------- room: walnut counter, dark warm back wall with a soft window and blurred kitchen shelves ----------
  const walnutT = canvasTex(1024, 512, (g, w, h) => {
    const R = mulberry(4501), pl = 4, ph = h / pl;
    for (let p = 0; p < pl; p++) {
      const tone = 0.85 + R() * 0.3, b = new THREE.Color(C.walnut).multiplyScalar(tone); g.fillStyle = "#" + b.getHexString(); g.fillRect(0, p * ph, w, ph);
      for (let i = 0; i < 60; i++) { const y0 = p * ph + R() * ph, a = 0.08 + R() * 0.22; g.strokeStyle = R() > 0.5 ? `rgba(20,10,4,${a})` : `rgba(130,76,38,${a * 0.6})`; g.lineWidth = 0.6 + R() * 2.2; g.beginPath(); const amp = 2 + R() * 5, f = 0.004 + R() * 0.01, p0 = R() * 10; for (let x = 0; x <= w; x += 16) { const y = y0 + Math.sin(x * f + p0) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      g.fillStyle = "rgba(8,4,2,0.85)"; g.fillRect(0, p * ph, w, 3);
    }
  }, [9, 1]);
  const top = mesh(new THREE.BoxGeometry(24, 0.06, 1.8), new THREE.MeshPhysicalMaterial({ map: walnutT, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.25 }), W, 3.5, -0.03, 0.4);
  top.castShadow = false;
  mesh(new THREE.BoxGeometry(24, 0.86, 0.05), std(0x1c110a, 0.7), W, 3.5, -0.49, 1.28).castShadow = false;
  const floor = mesh(new THREE.PlaneGeometry(30, 8), std(0x120a06, 0.8), W, 3.5, -0.9, -1); floor.rotation.x = -Math.PI / 2;
  // back wall: painted dusk kitchen, pre-blurred (shallow focus), lit by its own paint
  const wallT = canvasTex(3072, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#1d120b"); gr.addColorStop(0.6, "#2a1a10"); gr.addColorStop(1, "#140c08"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.filter = "blur(10px)";
    const R = mulberry(77);
    // tiled backsplash band
    for (let x = 0; x < w; x += 46) for (let y = 400; y < h; y += 30) { g.fillStyle = `rgba(${150 + R() * 40},${110 + R() * 30},${80 + R() * 20},${0.12 + R() * 0.06})`; g.fillRect(x + 2, y + 2, 42, 26); }
    // windows: warm dusk glow with mullions and leaves
    for (const wx of [820, 2150]) {
      const wg = g.createRadialGradient(wx + 150, 200, 20, wx + 150, 200, 320); wg.addColorStop(0, "rgba(255,214,160,.95)"); wg.addColorStop(0.6, "rgba(255,170,100,.55)"); wg.addColorStop(1, "rgba(255,150,80,0)");
      g.fillStyle = wg; g.fillRect(wx - 200, -100, 700, 560);
      g.fillStyle = "rgba(255,226,184,.85)"; g.fillRect(wx, 60, 300, 300);
      g.fillStyle = "rgba(40,24,14,.9)"; g.fillRect(wx + 144, 60, 12, 300); g.fillRect(wx, 204, 300, 12); g.fillRect(wx - 10, 50, 320, 14); g.fillRect(wx - 10, 356, 320, 14);
      g.fillStyle = "rgba(50,70,30,.55)"; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(wx + 20 + R() * 120, 300 - R() * 90, 26, 12, R() * 3, 0, 7); g.fill(); }
    }
    // shelves with jars and hanging utensils
    for (let sx = 0; sx < w; sx += 520) {
      const x = sx + 60 + R() * 80; if (Math.abs(x - 900) < 300 || Math.abs(x - 2230) < 300) continue;
      g.fillStyle = "rgba(90,56,30,.8)"; g.fillRect(x, 250, 300, 12);
      for (let j = 0; j < 4; j++) { g.fillStyle = `rgba(${180 + R() * 60},${130 + R() * 50},${80 + R() * 40},.55)`; g.fillRect(x + 14 + j * 70, 190 - R() * 30, 44, 60 + R() * 30); }
      for (let j = 0; j < 3; j++) { g.fillStyle = "rgba(160,120,80,.5)"; g.fillRect(x + 40 + j * 90, 300, 8, 70); g.beginPath(); g.arc(x + 44 + j * 90, 380, 18, 0, 7); g.fill(); }
    }
    g.filter = "none";
  });
  const wall = mesh(new THREE.PlaneGeometry(30, 6.25), new THREE.MeshBasicMaterial({ map: wallT, fog: false }), W, 3.5, 1.8, -3.5); wall.castShadow = wall.receiveShadow = false;
  // bokeh practicals
  const bokT = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, "rgba(255,255,255,.5)"); gr.addColorStop(0.75, "rgba(255,255,255,.7)"); gr.addColorStop(0.92, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); });
  const bok = []; { const R = mulberry(4522); for (let i = 0; i < 46; i++) { const m = new THREE.SpriteMaterial({ map: bokT, color: R() > 0.25 ? 0xffb15c : 0xffe2b8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }); const s = new THREE.Sprite(m); s.position.set(-7 + R() * 22, 0.3 + R() * 2.6, -3.2 - R() * 0.2); const sc = 0.2 + R() * 0.5; s.scale.set(sc, sc, 1); add(s); bok.push({ s, m, o: 0.12 + R() * 0.22, ph: R() * 6.28 }); } }

  // ---------- lights: key + rim follow the camera target ----------
  add(new THREE.HemisphereLight(0xffe2c0, 0x1a0e07, 0.35));
  const keyL = add(new THREE.DirectionalLight(C.key, 2.6)); keyL.castShadow = true; keyL.shadow.mapSize.set(2048, 2048);
  Object.assign(keyL.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8, near: 0.5, far: 8 }); keyL.shadow.bias = -0.0004; keyL.shadow.normalBias = 0.02; add(keyL.target);
  const rimL = add(new THREE.SpotLight(C.rim, 14, 9, 0.75, 0.8, 1.6)); add(rimL.target);
  const kick = add(new THREE.DirectionalLight(C.cool, 0.28)); add(kick.target);

  // ---------- hero bowl of steaming rice (front-left of the cooker) ----------
  const riceMat = new THREE.MeshPhysicalMaterial({ color: C.rice, roughness: 0.3, clearcoat: 0.9, sheenRoughness: 0.5, clearcoatRoughness: 0.12, envMap: riceEnv, envMapIntensity: 1.1, emissive: 0x24180c, sheen: 0.25, sheenColor: new THREE.Color(0xfff2dc) });
  const BOWL = { x: -0.4, z: 0.62 };
  const hero = chawan(W, BOWL.x, BOWL.z, C.glaze, 1.4);
  riceMound(hero, 0.15, 0.075, 0.086, 900, 501, riceMat);
  const heroSteam = steam(hero, 16, 4590, { spread: 0.07, rise: 0.75, size: 0.17 });
  // chopsticks resting on the bowl (sharp, midground)
  const chop = new THREE.Group(); chop.position.set(0.02, 0.112, 0.03); chop.rotation.set(0, -0.5, 0.08); hero.add(chop);
  for (const s of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(0.0035, 0.006, 0.46, 10), phys(0x5a2e16, 0.35, 0.7), chop, 0, 0, s * 0.014); c.rotation.z = Math.PI / 2; }

  // ---------- the hero rice cooker (station A, cutaway-capable) ----------
  const CK = new THREE.Group(); W.add(CK);
  const bodyM = phys(C.body, 0.28, 0.8, { side: THREE.DoubleSide }), lidM = phys(C.lid, 0.3, 0.8, { side: THREE.DoubleSide });
  const shellP = [[0, 0.0], [0.3, 0.0], [0.345, 0.02], [0.36, 0.06], [0.36, 0.36], [0.35, 0.41], [0.32, 0.43], [0.285, 0.43], [0.285, 0.405], [0.33, 0.38], [0.33, 0.035], [0.0, 0.035]];
  const backG = new THREE.Group(), frontG = new THREE.Group(); CK.add(backG); CK.add(frontG);
  mesh(lathe(shellP, 64, ...BACK), bodyM, backG); mesh(lathe(shellP, 64, ...FRONT), bodyM, frontG);
  const baseRing = mesh(new THREE.TorusGeometry(0.352, 0.012, 8, 64), std(0x3a2a20, 0.5), backG, 0, 0.012, 0); baseRing.rotation.x = Math.PI / 2;
  // inner bowl
  const ibP = [[0.0, 0.07], [0.22, 0.07], [0.245, 0.083], [0.255, 0.12], [0.26, 0.36], [0.276, 0.372], [0.276, 0.378]];
  const ibM = new THREE.MeshStandardMaterial({ color: 0x4a4542, roughness: 0.38, metalness: 0.55, side: THREE.DoubleSide });
  mesh(lathe(ibP, 64, ...BACK), ibM, backG); mesh(lathe(ibP, 64, ...FRONT), ibM, frontG);
  // heater plate (back half) with glowing coil rings, sits under the bowl
  mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.024, 48, 1, false, ...BACK), std(0x3b302a, 0.45, 0.6), backG, 0, 0.047, 0);
  const coilM = new THREE.MeshStandardMaterial({ color: 0x3a1a0c, emissive: C.heat, emissiveIntensity: 1, roughness: 0.4, metalness: 0.3 });
  for (const rr of [0.08, 0.135, 0.19]) { const c = mesh(new THREE.TorusGeometry(rr, 0.0075, 8, 48, Math.PI), coilM, backG, 0, 0.061, 0); c.rotation.x = -Math.PI / 2; }
  const heatL = new THREE.PointLight(0xff6a24, 0, 0.35, 1.6); heatL.position.set(0, 0.06, -0.05); backG.add(heatL);
  // thermostat button through the plate centre, spring underneath, highlight ring
  const thermo = new THREE.Group(); backG.add(thermo);
  mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.04, 28), metal(0xd9c59a, 0.25), thermo, 0, 0.05, 0);
  mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 28), phys(0xb88a4a, 0.3, 1), thermo, 0, 0.069, 0);
  const spring = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 60 }, (_, i) => new THREE.Vector3(Math.cos(i * 0.55) * 0.022, i / 59, Math.sin(i * 0.55) * 0.022))), 120, 0.0028, 6), metal(0xbfb6a8, 0.35), backG, 0, 0.004, 0);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffc46a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const hiRing = mesh(new THREE.TorusGeometry(0.052, 0.005, 8, 48), ringM, backG, 0, 0.072, 0); hiRing.rotation.x = Math.PI / 2; hiRing.castShadow = false;
  // linkage rod from the thermostat to the lever pod
  const POD = { x: -0.17, z: 0.35, ry: Math.atan2(-0.17, 0.35) };
  const rp0 = new THREE.Vector3(0, 0.022, 0), rp1 = new THREE.Vector3(POD.x, 0.022, POD.z);
  const rod = mesh(new THREE.CylinderGeometry(0.005, 0.005, rp0.distanceTo(rp1), 8), metal(0xcaa266, 0.3), backG, POD.x / 2, 0.022, POD.z / 2);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rp1.clone().sub(rp0).normalize());
  // control pod with AUDIRA label, two lamps and the switch lever (stays in the cutaway)
  const pod = new THREE.Group(); pod.position.set(POD.x, 0, POD.z); pod.rotation.y = POD.ry; CK.add(pod);
  mesh(new THREE.BoxGeometry(0.22, 0.15, 0.11), phys(C.pod, 0.22, 1), pod, 0, 0.085, 0);
  const podLab = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.045), new THREE.MeshStandardMaterial({ map: textTex(512, 136, (g, w, h) => { g.fillStyle = "#FFF4E2"; g.font = `700 64px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AUDIRA", w / 2, 52); g.font = `400 30px ${MONO}`; g.fillStyle = "#FFB36B"; g.fillText("RICE COOKER", w / 2, 108); }), transparent: true, roughness: 0.4 }));
  podLab.position.set(0, 0.125, 0.0565); pod.add(podLab);
  const lampM = [0, 1].map(() => new THREE.MeshStandardMaterial({ color: 0x241510, emissive: 0x000000, roughness: 0.3 }));
  mesh(new THREE.SphereGeometry(0.011, 12, 8), lampM[0], pod, -0.065, 0.07, 0.056); mesh(new THREE.SphereGeometry(0.011, 12, 8), lampM[1], pod, -0.065, 0.04, 0.056);
  const lampLab = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.05), new THREE.MeshBasicMaterial({ map: textTex(128, 108, (g) => { g.fillStyle = "#E9D9BD"; g.font = `700 30px ${MONO}`; g.fillText("COOK", 6, 40); g.fillText("WARM", 6, 96); }), transparent: true }));
  lampLab.position.set(-0.02, 0.055, 0.056); pod.add(lampLab);
  const lever = new THREE.Group(); lever.position.set(0.06, 0.06, 0.056); pod.add(lever);
  mesh(new THREE.BoxGeometry(0.036, 0.075, 0.03), phys(0xf2ebdf, 0.3, 0.9), lever, 0, 0.03, 0.012);
  mesh(new THREE.BoxGeometry(0.03, 0.12, 0.004), std(0x0e0806, 0.6), pod, 0.06, 0.075, 0.0555);
  // lid: hinged at the back; back half + front half (front half slides out with the shell)
  const hinge = new THREE.Group(); hinge.position.set(0, 0.43, -0.3); CK.add(hinge);
  const lidP = [[0, 0.135], [0.12, 0.125], [0.24, 0.085], [0.32, 0.035], [0.348, 0.004], [0.34, -0.004], [0.3, 0.0], [0.0, 0.0]];
  const lidB = mesh(lathe(lidP, 64, ...BACK), lidM, hinge, 0, 0, 0.3), lidF = mesh(lathe(lidP, 64, ...FRONT), lidM, hinge, 0, 0, 0.3);
  mesh(new THREE.BoxGeometry(0.22, 0.03, 0.05), std(0x2a2420, 0.4), hinge, 0, 0.15, 0.26);
  mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 16), std(0x2a2420, 0.4), hinge, 0.13, 0.12, 0.2);
  // water, rice section and rice top inside the inner bowl
  const waterM = new THREE.MeshPhysicalMaterial({ color: 0xd6e6ec, transparent: true, opacity: 0.3, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const water = mesh(new THREE.CylinderGeometry(0.252, 0.252, 1, 48, 1, true, ...BACK), waterM, backG); water.castShadow = false;
  const waterTop = mesh(new THREE.CircleGeometry(0.252, 48, Math.PI, Math.PI), waterM, backG); waterTop.rotation.x = -Math.PI / 2; waterTop.castShadow = false;
  const waterFace = mesh(new THREE.PlaneGeometry(0.504, 1), new THREE.MeshPhysicalMaterial({ color: 0xcfe2ea, transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false }), backG); waterFace.castShadow = false;
  const secM = new THREE.MeshPhysicalMaterial({ color: 0x9a8a70, roughness: 0.7, envMap: riceEnv, envMapIntensity: 0.4 });
  const secFace = mesh(new THREE.PlaneGeometry(0.49, 1), secM, backG, 0, 0, -0.03);
  const FACE_N = 2600, faceU = []; { const R = mulberry(611); for (let i = 0; i < FACE_N; i++) { const x = (R() - 0.5) * 0.48, u = R(); faceU.push([x, u, -0.028 + R() * 0.034, R() * 6.28, (R() - 0.5) * 1.4, R() * 6.28, 0.85 + R() * 0.3]); } }
  const pockT = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(40,24,12,.85)"); gr.addColorStop(0.6, "rgba(60,40,20,.5)"); gr.addColorStop(1, "rgba(60,40,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const pockets = []; { const R = mulberry(622); for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.03 + R() * 0.02, 0.018 + R() * 0.01), new THREE.MeshBasicMaterial({ map: pockT, transparent: true, depthWrite: false })); p.renderOrder = 3; backG.add(p); pockets.push({ p, x: (R() - 0.5) * 0.4, u: 0.15 + R() * 0.75 }); } }
  const pocketSteam = steam(backG, 10, 640, { spread: 0.18, rise: 0.12, size: 0.05, per: [1.2, 2.0], op: 0.35 });
  const faceIM = new THREE.InstancedMesh(GRAIN, riceMat, FACE_N); faceIM.frustumCulled = false; faceIM.castShadow = true; backG.add(faceIM);
  const topB = riceMound(backG, 0.245, 0.02, 0, 1100, 612, riceMat, -1, 1), topF = riceMound(frontG, 0.245, 0.02, 0, 1100, 613, riceMat, 1, 1);
  const BUB = 70, bubIM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, roughness: 0.05, clearcoat: 1, depthWrite: false }), BUB);
  bubIM.frustumCulled = false; backG.add(bubIM);
  const bubS = []; { const R = mulberry(733); for (let i = 0; i < BUB; i++) bubS.push([(R() - 0.5) * 0.44, -R() * 0.2, R(), 0.6 + R() * 0.8, 0.004 + R() * 0.007]); }
  const inL = new THREE.PointLight(0xffd6a0, 0, 1.2, 1.4); inL.position.set(0, 0.62, 0.1); CK.add(inL);
  const ventSteam = steam(CK, 14, 810, { spread: 0.03, rise: 0.7, size: 0.13, per: [1.8, 2.8] });
  const openSteam = steam(CK, 18, 820, { spread: 0.14, rise: 0.9, size: 0.2, per: [2.2, 3.4], op: 0.05 });
  // dial gauge on a stand: "suhu mangkuk", boiling mark, red zone
  const gauge = new THREE.Group(); gauge.position.set(0.47, 0, 0.42); gauge.rotation.y = -0.28; W.add(gauge);
  mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.012, 24), metal(0x8a6a44, 0.35), gauge, 0, 0.006, 0);
  mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 8), metal(0x8a6a44, 0.35), gauge, 0, 0.08, 0);
  const dial = new THREE.Group(); dial.position.set(0, 0.25, 0); gauge.add(dial);
  const bez = mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 48), metal(0xb8925a, 0.25), dial); bez.rotation.x = Math.PI / 2;
  const faceT = canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#F6EEDC"; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill();
    const a0 = (-220 * Math.PI) / 180, a1 = (40 * Math.PI) / 180, arc = (u) => a0 + (a1 - a0) * u;
    const seg = (u0, u1, col) => { g.strokeStyle = col; g.lineWidth = 30; g.beginPath(); g.arc(256, 256, 196, arc(u0), arc(u1)); g.stroke(); };
    seg(0, 0.5, "#E8C9A0"); seg(0.5, 0.62, "#FF9A3D"); seg(0.62, 1, "#D8341E");
    g.strokeStyle = "#2A170D"; for (let i = 0; i <= 20; i++) { const a = arc(i / 20), L = i % 5 ? 18 : 34; g.lineWidth = i % 5 ? 3 : 6; g.beginPath(); g.moveTo(256 + Math.cos(a) * 172, 256 + Math.sin(a) * 172); g.lineTo(256 + Math.cos(a) * (172 - L), 256 + Math.sin(a) * (172 - L)); g.stroke(); }
    const ab = arc(0.56); g.strokeStyle = "#1A0E07"; g.lineWidth = 8; g.beginPath(); g.moveTo(256 + Math.cos(ab) * 214, 256 + Math.sin(ab) * 214); g.lineTo(256 + Math.cos(ab) * 150, 256 + Math.sin(ab) * 150); g.stroke();
    g.fillStyle = "#2A170D"; g.textAlign = "center"; g.font = `700 34px ${SANS}`; g.fillText("TITIK DIDIH", 256, 150);
    g.fillStyle = "#D8341E"; g.font = `700 30px ${SANS}`; g.fillText("NAIK", 400, 330);
    g.fillStyle = "#4A2A16"; g.font = `400 30px ${MONO}`; g.fillText("SUHU MANGKUK", 256, 430);
  });
  const dface = new THREE.Mesh(new THREE.CircleGeometry(0.094, 48), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.5 })); dface.position.z = 0.016; dial.add(dface);
  const needle = new THREE.Group(); needle.position.z = 0.02; dial.add(needle);
  mesh(new THREE.BoxGeometry(0.006, 0.07, 0.003), std(0x1a0e07, 0.4), needle, 0, 0.03, 0); mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 16), metal(0xb8925a), needle).rotation.x = Math.PI / 2;
  const glassD = new THREE.Mesh(new THREE.CircleGeometry(0.096, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.02, clearcoat: 1, depthWrite: false })); glassD.position.z = 0.025; dial.add(glassD);
  // serving paddle + clump (s8)
  const paddle = new THREE.Group(); W.add(paddle);
  mesh(new THREE.SphereGeometry(1, 24, 12), phys(0xf3ecdf, 0.3, 0.8), paddle).scale.set(0.055, 0.008, 0.07);
  mesh(new THREE.BoxGeometry(0.03, 0.008, 0.22), phys(0xf3ecdf, 0.3, 0.8), paddle, 0, 0.004, 0.16);
  const clump = riceMound(paddle, 0.045, 0.03, 0.006, 140, 901, riceMat);
  const bowlClump = riceMound(hero, 0.06, 0.035, 0.15, 160, 902, riceMat);

  // ---------- station B: history riser ----------
  const XB = -4.3, HB = new THREE.Group(); HB.position.x = XB; HB.scale.setScalar(1.3); W.add(HB);
  const boardT = canvasTex(1024, 420, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#3a2010"); gr.addColorStop(1, "#24130a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,200,140,.35)"; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = "#E9C682"; g.textAlign = "center"; g.font = `700 72px ${SERIF}`; g.fillText("1923", w / 2, 150); g.fillText("1955", w / 2, 360); g.strokeStyle = "#E9C682"; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2, 180); g.lineTo(w / 2, 290); g.stroke(); g.beginPath(); g.moveTo(w / 2 - 18, 270); g.lineTo(w / 2, 296); g.lineTo(w / 2 + 18, 270); g.stroke(); });
  mesh(new THREE.BoxGeometry(1.75, 0.5, 0.04), new THREE.MeshStandardMaterial({ map: boardT, roughness: 0.6 }), HB, 0, 0.42, -0.46);
  mesh(new THREE.BoxGeometry(1.75, 0.08, 0.72), phys(0x2e190d, 0.45, 0.4), HB, 0, 0.04, -0.06);
  // 1923: a boxy wooden cooker with a metal pot set in its top
  const c23 = new THREE.Group(); c23.position.set(-0.45, 0.08, -0.08); HB.add(c23);
  const woodM = phys(0x6a3a1c, 0.5, 0.4);
  mesh(new THREE.BoxGeometry(0.46, 0.3, 0.38), woodM, c23, 0, 0.15, 0);
  for (const [x, z] of [[-0.215, -0.175], [0.215, -0.175], [-0.215, 0.175], [0.215, 0.175]]) mesh(new THREE.BoxGeometry(0.04, 0.32, 0.04), phys(0x3e200e, 0.5, 0.4), c23, x, 0.16, z);
  mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 40), metal(0x9a8a78, 0.4), c23, 0, 0.32, 0);
  mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 40), phys(0x4a2810, 0.5, 0.4), c23, 0, 0.355, 0);
  mesh(new THREE.SphereGeometry(0.025, 16, 10), phys(0x2a160a, 0.4, 0.6), c23, 0, 0.375, 0);
  mesh(new THREE.BoxGeometry(0.12, 0.06, 0.006), metal(0x8a7a66, 0.4), c23, 0, 0.17, 0.193);
  // 1955: rounded aluminium cooker with lid knob, small lever box and lamp
  const c55 = new THREE.Group(); c55.position.set(0.45, 0.08, -0.08); HB.add(c55);
  const alu = new THREE.MeshStandardMaterial({ color: 0xd4d0c8, roughness: 0.28, metalness: 0.85 });
  mesh(lathe([[0, 0], [0.19, 0], [0.215, 0.02], [0.225, 0.05], [0.225, 0.27], [0.212, 0.29], [0, 0.29]], 48), alu, c55);
  mesh(lathe([[0.218, 0.29], [0.19, 0.33], [0.09, 0.365], [0, 0.37]], 48), alu, c55);
  mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 20), std(0x1a1210, 0.4), c55, 0, 0.385, 0);
  mesh(new THREE.BoxGeometry(0.13, 0.08, 0.06), std(0x1a1210, 0.4), c55, 0, 0.07, 0.215);
  mesh(new THREE.BoxGeometry(0.025, 0.05, 0.02), std(0xe9e2d2, 0.4), c55, 0.03, 0.08, 0.25);
  const lamp55 = new THREE.MeshStandardMaterial({ color: 0x241510, emissive: 0xff7a2a, emissiveIntensity: 0, roughness: 0.3 });
  mesh(new THREE.SphereGeometry(0.01, 10, 8), lamp55, c55, -0.03, 0.08, 0.247);
  const spots = [-0.585, 0.585].map((x) => { const s = new THREE.SpotLight(0xffe0b0, 0, 4, 0.42, 0.7, 1.6); s.position.set(XB + x, 1.8, 0.3); s.target.position.set(XB + x, 0.3, -0.1); add(s); add(s.target); return s; });

  // ---------- station C: the timer problem ----------
  const XC = 4.3, HC = new THREE.Group(); HC.position.x = XC; W.add(HC);
  const timer = new THREE.Group(); timer.position.set(0, 0.18, -0.15); HC.add(timer);
  const tb = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 48), phys(0xf2e3c6, 0.3, 0.8), timer); tb.rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.16, 0.04, 0.1), phys(0xf2e3c6, 0.3, 0.8), timer, 0, -0.16, 0);
  const tFaceT = canvasTex(512, 512, (g) => { g.fillStyle = "#FFF7EA"; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); g.strokeStyle = "#2A170D"; for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2 - Math.PI / 2, L = i % 5 ? 16 : 34; g.lineWidth = i % 5 ? 3 : 7; g.beginPath(); g.moveTo(256 + Math.cos(a) * 230, 256 + Math.sin(a) * 230); g.lineTo(256 + Math.cos(a) * (230 - L), 256 + Math.sin(a) * (230 - L)); g.stroke(); } g.fillStyle = "#2A170D"; g.font = `700 46px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(String(i * 5), 256 + Math.cos(a) * 160, 256 + Math.sin(a) * 160); } g.font = `400 30px ${MONO}`; g.fillText("MENIT", 256, 330); });
  const tFace = new THREE.Mesh(new THREE.CircleGeometry(0.155, 48), new THREE.MeshStandardMaterial({ map: tFaceT, roughness: 0.45 })); tFace.position.z = 0.041; timer.add(tFace);
  const knob = new THREE.Group(); knob.position.z = 0.05; timer.add(knob);
  mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.03, 24), phys(0xd8341e, 0.3, 0.9), knob).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.012, 0.11, 0.012), phys(0xd8341e, 0.3, 0.9), knob, 0, 0.06, 0.008);
  const burnt = chawan(HC, -0.32, 0.3, 0x3a2a24), raw = chawan(HC, 0.32, 0.3, 0x5a6a5a);
  const burntM = new THREE.MeshPhysicalMaterial({ color: 0x4a2a14, roughness: 0.6, clearcoat: 0.3 }), crustM = new THREE.MeshStandardMaterial({ color: 0x1a0d06, roughness: 0.8 });
  riceMound(burnt, 0.15, 0.05, 0.086, 600, 701, burntM);
  { const R = mulberry(702); for (let i = 0; i < 9; i++) { const a = R() * 6.28, rr = R() * 0.1; mesh(new THREE.SphereGeometry(0.03 + R() * 0.02, 12, 8), crustM, burnt, Math.cos(a) * rr, 0.12 + R() * 0.01, Math.sin(a) * rr).scale.set(1, 0.3, 1); } }
  const rawM = new THREE.MeshPhysicalMaterial({ color: C.riceRaw, roughness: 0.18, clearcoat: 1, transparent: true, opacity: 0.82, envMap: riceEnv, envMapIntensity: 0.9 });
  riceMound(raw, 0.13, 0.02, 0.072, 520, 703, rawM);
  const puddle = mesh(new THREE.CircleGeometry(0.135, 40), new THREE.MeshPhysicalMaterial({ color: 0xc8d6d8, transparent: true, opacity: 0.45, roughness: 0.02, clearcoat: 1, depthWrite: false }), raw, 0, 0.083, 0); puddle.rotation.x = -Math.PI / 2;
  const smoke = steam(burnt, 14, 704, { spread: 0.06, rise: 0.7, size: 0.18, color: 0x6a625a, normal: true, op: 0.5 });
  const tagTex = (s) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#E8D2AE"; g.fillRect(0, 0, w, h); g.strokeStyle = "#5A3418"; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = "#3A1E0C"; g.font = `700 60px ${SANS}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, w / 2, h / 2 + 4); });
  const tags = [["GOSONG", -0.27], ["BELUM MATANG", 0.27]].map(([s, x]) => { const m = new THREE.MeshStandardMaterial({ map: tagTex(s), roughness: 0.7, emissive: 0xffffff, emissiveIntensity: 0 }); m.emissiveMap = m.map; const p = mesh(new THREE.PlaneGeometry(0.26, 0.065), m, HC, x, 0.04, 0.58); p.rotation.x = -0.9; return m; });

  // ---------- station D: 1951 workshop + conveyor of rival cookers ----------
  const XD = 8.8, HD = new THREE.Group(); HD.position.x = XD; W.add(HD);
  const mat = mesh(new THREE.BoxGeometry(1.5, 0.006, 0.7), std(0xcdb58c, 0.9), HD, 0, 0.003, 0.0); mat.castShadow = false;
  const potM = metal(0xbfb8ae, 0.35), potLidM = metal(0x9e978c, 0.4);
  const pots = []; { const R = mulberry(950); for (let i = 0; i < 8; i++) { const x = -0.52 + (i % 4) * 0.35, z = i < 4 ? -0.16 : 0.12; const g = new THREE.Group(); g.position.set(x, 0, z); HD.add(g); mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.09, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xbfb8ae, roughness: 0.35, metalness: 0.9, side: THREE.DoubleSide }), g, 0, 0.045, 0); mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.004, 32), potM, g, 0, 0.002, 0); const lid = new THREE.Group(); lid.position.y = 0.092; g.add(lid); mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.008, 32), potLidM, lid); mesh(new THREE.SphereGeometry(0.012, 10, 8), std(0x2a1a12, 0.4), lid, 0, 0.012, 0); mesh(new THREE.BoxGeometry(0.07, 0.008, 0.012), std(0x2a1a12, 0.4), g, 0.1, 0.075, 0); const card = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.05), new THREE.MeshStandardMaterial({ map: textTex(128, 96, (gg, w, h) => { gg.fillStyle = "#FFF6E6"; gg.fillRect(0, 0, w, h); gg.font = `700 64px ${SANS}`; gg.textAlign = "center"; gg.textBaseline = "middle"; const ok = i === 6; gg.fillStyle = ok ? "#2E8B3A" : "#C8341E"; gg.fillText(ok ? "✓" : "✗", w / 2, h / 2 + 4); }), roughness: 0.8 })); card.position.set(0, 0.001, 0.12); card.rotation.x = -Math.PI / 2 + 0.25; g.add(card); pots.push({ g, lid, ph: R() * 6, st: steam(g, 5, 960 + i, { spread: 0.03, rise: 0.35, size: 0.07, op: 0.18 }) }); } }
  const minami = person({ shirt: 0xe8e2d6, pants: 0x3a3a44, hair: 0x15100c, apron: 0xb9b2a4 });
  minami.G.position.set(-0.36, -0.9, -0.82); minami.G.scale.setScalar(0.92); HD.add(minami.G);
  const fumiko = person({ shirt: 0x9a4a3a, pants: 0x4a3a5a, skirt: true, apron: 0xefe3cc, fem: true, skin: 0xd09a72 });
  fumiko.G.position.set(0.36, -0.9, -0.8); fumiko.G.scale.setScalar(0.86); HD.add(fumiko.G);
  const held = new THREE.Group(); held.position.set(0.27, 0.33, -0.52); HD.add(held);
  mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.08, 32), potM, held); mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.008, 32), potLidM, held, 0, 0.045, 0);
  const heldSteam = steam(held, 6, 970, { spread: 0.03, rise: 0.4, size: 0.08, op: 0.2 });
  const nameTex = (s, sz) => canvasTex(640, 140, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6B3E1E"); gr.addColorStop(1, "#4A2812"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "#D9A866"; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = "#FFF0D6"; g.font = `700 ${sz}px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, w / 2, h / 2 + 4); });
  const names = [["YOSHITADA MINAMI", 58, -0.26], ["FUMIKO", 72, 0.27]].map(([s, sz, x]) => { const g = new THREE.Group(); g.position.set(x, 0, 0.42); HD.add(g); mesh(new THREE.BoxGeometry(0.36, 0.08, 0.05), phys(0x4a2812, 0.4, 0.6), g, 0, 0.045, 0).rotation.x = -0.35; const m = new THREE.MeshStandardMaterial({ map: nameTex(s, sz), roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0 }); m.emissiveMap = m.map; const p = mesh(new THREE.PlaneGeometry(0.34, 0.075), m, g, 0, 0.052, 0.03); p.rotation.x = -0.35; return m; });
  // desk calendar showing 1951 (a blank page flips away on "sejak")
  const cal = new THREE.Group(); cal.position.set(0.86, 0, -0.05); cal.rotation.y = -0.35; HD.add(cal);
  const calT = canvasTex(400, 400, (g, w, h) => { g.fillStyle = "#FFF7EA"; g.fillRect(0, 0, w, h); g.fillStyle = "#C8341E"; g.fillRect(0, 0, w, 80); g.fillStyle = "#FFF7EA"; g.font = `700 44px ${SANS}`; g.textAlign = "center"; g.fillText("TAHUN", w / 2, 56); g.fillStyle = "#2A170D"; g.font = `700 150px ${SERIF}`; g.fillText("1951", w / 2, 270); });
  const calM = new THREE.MeshStandardMaterial({ map: calT, roughness: 0.8, emissive: 0xffffff, emissiveMap: calT, emissiveIntensity: 0 });
  const calBase = mesh(new THREE.BoxGeometry(0.26, 0.02, 0.12), phys(0x3a2010, 0.5, 0.4), cal, 0, 0.01, 0);
  const calPage = mesh(new THREE.PlaneGeometry(0.24, 0.24), calM, cal, 0, 0.14, 0); calPage.rotation.x = -0.18;
  const flipP = new THREE.Group(); flipP.position.set(0, 0.26, -0.02); cal.add(flipP);
  const blank = mesh(new THREE.PlaneGeometry(0.24, 0.24), std(0xf1e6d2, 0.85, 0, { side: THREE.DoubleSide }), flipP, 0, -0.12, 0.006);
  // conveyor
  const XV = 10.3, LV = 3.9;
  mesh(new THREE.BoxGeometry(LV + 0.2, 0.05, 0.42), std(0x1e1a18, 0.55), W, XV + LV / 2, 0.025, -0.15);
  for (let i = 0; i < 14; i++) { const c = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.44, 12), metal(0x8c8478, 0.35), W, XV + i * 0.3, 0.035, -0.15); c.rotation.x = Math.PI / 2; }
  const cols = [0xeee7da, 0xbfe0cf, 0xf2c6c0, 0xd4d0c8, 0xf3e2a6, 0xc9d6ee, 0xeee7da, 0xe9b98e, 0xbfe0cf, 0xf2c6c0];
  const line = cols.map((c, i) => ({ g: smallCooker(W, 0, -0.15, c, 0.42), i }));

  // ---------- camera-riding soft-focus foreground props ----------
  scene.add(cam);
  const fgTex = (v) => canvasTex(1080, 420, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.filter = "blur(9px)";
    if (v === 0) {
      g.fillStyle = "#1E3048"; g.beginPath(); g.ellipse(360, 470, 330, 150, 0, Math.PI, 0); g.fill(); // bowl edge
      g.fillStyle = "#EFE6D6"; g.beginPath(); g.ellipse(360, 330, 300, 22, 0, Math.PI, 0); g.fill();
      g.fillStyle = "#F4EEE2"; g.beginPath(); g.ellipse(120, 300, 90, 52, -0.3, 0, 7); g.fill(); g.fillRect(-40, 320, 180, 30); // spoon
      g.strokeStyle = "#6A3618"; g.lineCap = "round"; g.lineWidth = 22; g.beginPath(); g.moveTo(1120, 400); g.lineTo(640, 150); g.stroke(); g.lineWidth = 20; g.beginPath(); g.moveTo(1120, 330); g.lineTo(690, 118); g.stroke();
      g.fillStyle = "rgba(255,246,230,.9)"; const R = mulberry(5); for (let i = 0; i < 30; i++) { g.beginPath(); g.ellipse(560 + R() * 380, 330 + R() * 80, 7, 4, R() * 3, 0, 7); g.fill(); }
    } else {
      g.fillStyle = "#D9C7A6"; g.beginPath(); g.moveTo(-20, 160); g.lineTo(520, 260); g.lineTo(620, 440); g.lineTo(-20, 440); g.fill(); // linen
      g.fillStyle = "#A9472E"; g.fillRect(-20, 300, 560, 18);
      g.fillStyle = "#C79A62"; g.beginPath(); g.ellipse(900, 300, 110, 70, 0.4, 0, 7); g.fill(); g.save(); g.translate(900, 300); g.rotate(0.4); g.fillRect(60, -16, 260, 32); g.restore(); // wooden paddle
      g.fillStyle = "rgba(255,246,230,.9)"; const R = mulberry(6); for (let i = 0; i < 24; i++) { g.beginPath(); g.ellipse(560 + R() * 260, 360 + R() * 60, 7, 4, R() * 3, 0, 7); g.fill(); }
    }
    g.filter = "none";
  });
  const fg = [0, 1].map((v) => { const m = new THREE.MeshBasicMaterial({ map: fgTex(v), transparent: true, depthTest: false, depthWrite: false, fog: false, opacity: 0 }); m.color.setScalar(0.38); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.0778), m); p.renderOrder = 50; p.position.set(0, -0.172 + 0.035, -0.5); cam.add(p); return { p, m }; });

  // ---------- camera track (all keys from scene and word anchors) ----------
  const cutA = A("s2:Isinya") - 0.1, cutB = A("s2:pemanas") - 0.15;
  const k = (t, p, l) => [t, ...p, ...l];
  const camT = track([
    k(0, [-0.26, 0.7, 3.1], [-0.15, 0.2, 0.32]),
    k(A("s1:tahu"), [-0.26, 0.68, 3.0], [-0.15, 0.2, 0.32]),
    k(A("s1:matang") + 0.25, [-0.25, 0.67, 2.95], [-0.14, 0.2, 0.32]),
    k(K.s2 + 0.5, [0.75, 1.15, 2.3], [0.0, 0.2, 0.0]),
    k(A("s2:pemanas") + 0.3, [0.55, 0.6, 1.75], [0.0, 0.1, 0.0]),
    k(A("s2:termostat"), [0.24, 0.12, 1.08], [0.0, 0.065, 0.0]),
    k(A("s2:otaknya"), [0.16, 0.1, 0.92], [0.0, 0.07, 0.0]),
    k(K.s2e, [0.3, 0.22, 1.3], [0.0, 0.1, 0.0]),
    k(K.s3 + 1.0, [XB, 0.85, 3.2], [XB, 0.36, -0.1]),
    k(A("s3:Mitsubishi") + 0.4, [XB - 0.585, 0.66, 2.65], [XB - 0.585, 0.3, -0.1]),
    k(A("s3:belum") + 0.6, [XB - 0.5, 0.7, 2.75], [XB - 0.52, 0.3, -0.1]),
    k(A("s3:Toshiba"), [XB + 0.585, 0.66, 2.65], [XB + 0.585, 0.3, -0.1]),
    k(A("s3:Desember") + 0.6, [XB + 0.5, 0.7, 2.75], [XB + 0.52, 0.3, -0.1]),
    k(K.s3e, [XB + 0.05, 0.85, 3.15], [XB, 0.34, -0.1]),
    k(K.s4 + 1.1, [XC, 0.76, 3.2], [XC, 0.2, 0.12]),
    k(A("s4:timer"), [XC, 0.7, 2.85], [XC, 0.2, 0.1]),
    k(A("s4:gosong"), [XC - 0.18, 0.62, 2.45], [XC - 0.18, 0.14, 0.3]),
    k(A("s4:belum"), [XC + 0.18, 0.62, 2.45], [XC + 0.18, 0.14, 0.3]),
    k(K.s4e, [XC, 0.74, 3.1], [XC, 0.18, 0.15]),
    k(K.s5 + 1.1, [0.95, 0.9, 2.2], [0.15, 0.22, 0.05]),
    k(A("s5:titik"), [0.78, 0.5, 1.8], [0.25, 0.22, 0.15]),
    k(K.s5e, [0.62, 0.62, 2.05], [0.14, 0.24, 0.05]),
    k(A("s6:naik"), [0.68, 0.44, 1.95], [0.28, 0.22, 0.2]),
    k(A("s6:Termostat"), [0.25, 0.11, 1.0], [0.0, 0.06, 0.0]),
    k(A("s6:Klik") - 0.2, [0.28, 0.22, 1.02], [-0.15, 0.1, 0.35]),
    k(K.s6e, [0.1, 1.0, 1.75], [0.0, 0.22, 0.0]),
    k(K.s7 + 1.2, [XD, 0.98, 3.75], [XD, 0.46, -0.35]),
    k(A("s7:Fumiko"), [XD + 0.04, 0.95, 3.6], [XD + 0.02, 0.45, -0.35]),
    k(A("s7:Yoshitada"), [XD - 0.04, 0.95, 3.65], [XD - 0.02, 0.45, -0.35]),
    k(A("s7:Keberhasilannya") + 0.2, [XD + 0.9, 0.85, 3.6], [XD + 1.4, 0.28, -0.4]),
    k(K.s7e, [XV + 1.6, 1.15, 4.8], [XV + 2.0, 0.25, -0.2]),
    k(K.s8 + 1.3, [-0.2, 1.55, 2.5], [-0.12, 0.22, 0.1]),
    k(A("s8:Rice"), [-0.3, 1.4, 2.4], [-0.2, 0.2, 0.25]),
    k(K.end, [-0.42, 1.1, 2.3], [-0.28, 0.16, 0.35]),
    k(K.dur, [-0.44, 1.08, 2.25], [-0.3, 0.16, 0.36]),
  ]);
  const look = new THREE.Vector3(), tmpM = new THREE.Matrix4(), q = new THREE.Quaternion(), o3 = new THREE.Object3D();

  return function draw(t) {
    const c = camT(t);
    const hx = Math.sin(t * 0.37) * 0.012, hy = Math.sin(t * 0.29 + 1) * 0.008;
    cam.position.set(c[0] + hx, c[1] + hy, c[2]); look.set(c[3], c[4], c[5]); cam.lookAt(look);
    keyL.position.set(look.x - 1.4, 2.4, look.z + 2.2); keyL.target.position.copy(look);
    rimL.position.set(look.x + 0.7, 1.5, look.z - 2.1); rimL.target.position.set(look.x, look.y + 0.1, look.z);
    kick.position.set(look.x + 2, 0.8, look.z + 0.5); kick.target.position.copy(look);
    bok.forEach((b) => { b.m.opacity = b.o * (0.85 + 0.15 * Math.sin(t * 1.3 + b.ph)); });

    // foreground props: kitchen set at the cooker, linen + paddle at the other stations
    const away = Math.max(win(t, K.s3 + 0.5, K.s4e + 0.3, 0.6), win(t, K.s7 + 0.6, K.s7e + 0.4, 0.6));
    fg[0].m.opacity = 1 - away; fg[1].m.opacity = away;
    fg.forEach((f, i) => { f.p.position.x = Math.sin(t * 0.21 + i) * 0.004; });

    // ---- cooker state ----
    const cut = ramp(t, cutA, cutB) * (1 - ramp(t, K.s8 - 0.2, K.s8 + 0.6));
    frontG.position.set(-1.3 * cut, 0.5 * cut, 0.35 * cut); frontG.rotation.y = 0.5 * cut; frontG.visible = cut < 0.98;
    lidF.position.set(-1.3 * cut, 0.5 * cut, 0.3 + 0.35 * cut); lidF.visible = cut < 0.98;
    const tKlik = A("s6:Klik"), heat = 1 - 0.88 * ramp(t, A("s6:mematikan") + 0.1, tKlik + 0.5);
    const done = clamp01((t - tKlik) / 0.22);
    coilM.emissiveIntensity = 0.1 + 1.1 * heat * (0.92 + 0.08 * Math.sin(t * 7));
    heatL.intensity = cut * 0.25 * heat;
    lever.rotation.x = -0.5 + 0.85 * back(done);
    lampM[0].emissive.setHex(0xff6a24); lampM[0].emissiveIntensity = t < tKlik ? 2.2 : 0.05;
    lampM[1].emissive.setHex(0xffc24a); lampM[1].emissiveIntensity = t < tKlik ? 0.05 : 2.0;
    thermo.position.y = -0.022 * eout(done); spring.scale.y = 0.045 * (1 - 0.4 * eout(done)) / 1;
    const hiA = win(t, A("s2:termostat"), K.s2e, 0.25) * (0.6 + 0.4 * Math.sin(t * 6)), hiB = win(t, A("s6:Termostat"), tKlik + 0.8, 0.2) * (0.6 + 0.4 * Math.sin(t * 9));
    ringM.opacity = Math.max(hiA, hiB); ringM.color.setHex(hiB > hiA ? 0xff5a2a : 0xffc46a); hiRing.scale.setScalar(1 + 0.15 * Math.sin(t * 6));
    // water + rice
    const rt = 0.17 + 0.04 * ramp(t, K.s5, A("s6:habis")) + 0.11 * ramp(t, K.s8 - 0.2, A("s8:membaca")), wl = 0.3 + (rt - 0.3) * ramp(t, A("s5:Selama") - 0.5, A("s6:habis") + 0.2);
    const wet = wl - rt > 0.004 && cut > 0.02;
    water.visible = waterTop.visible = waterFace.visible = wet;
    const wh = Math.max(0.001, wl - 0.075); water.scale.y = wh; water.position.y = 0.075 + wh / 2; waterFace.scale.y = wh; waterFace.position.y = 0.075 + wh / 2;
    waterTop.position.y = wl + 0.002 * Math.sin(t * 9);
    secFace.visible = faceIM.visible = cut > 0.02; const sh = rt - 0.078; secFace.scale.y = sh; secFace.position.y = 0.078 + sh / 2;
    pockets.forEach((k) => { k.p.visible = cut > 0.02; k.p.position.set(k.x, 0.078 + k.u * sh, 0.009); });
    pocketSteam(t, cut > 0.02 && t < A("s6:habis") + 0.5 ? heat * 0.8 : 0, 0, rt, -0.02);
    faceU.forEach((u, i) => { const ytop = 0.078 + sh + 0.012 * Math.sin(u[0] * 41 + 1.3) + 0.005 * Math.sin(u[0] * 97); o3.position.set(u[0], 0.078 + u[1] * (ytop - 0.078), u[2]); o3.rotation.set(Math.PI / 2 + u[4], u[3], u[5]); o3.scale.setScalar(u[6]); o3.updateMatrix(); faceIM.setMatrixAt(i, o3.matrix); });
    faceIM.instanceMatrix.needsUpdate = true;
    topB.position.y = rt; topF.position.y = rt;
    riceMat.color.setHex(C.rice);
    const cookC = ramp(t, K.s5, A("s6:matang")); secM.color.setRGB(0.82 + 0.1 * cookC, 0.79 + 0.1 * cookC, 0.72 + 0.1 * cookC);
    bubIM.visible = wet; const bubAmt = heat * clamp01((wl - rt) / 0.03);
    bubS.forEach((b, i) => { const u = (t * b[3] + b[2]) % 1, y = rt + 0.005 + u * (wl - rt); o3.position.set(b[0] + 0.006 * Math.sin(t * 5 + i), y, b[1] * 0.9 - 0.01); o3.rotation.set(0, 0, 0); o3.scale.setScalar(b[4] * (0.6 + 0.6 * u) * (bubAmt > 0.05 ? 1 : 0.001)); o3.updateMatrix(); bubIM.setMatrixAt(i, o3.matrix); });
    bubIM.instanceMatrix.needsUpdate = true;
    // lid opens in s8, steam pours out; the vent steams while cooking
    const lo = ramp(t, A("s8:membaca") - 0.2, A("s8:membaca") + 0.8);
    hinge.rotation.x = -1.2 * lo; inL.intensity = 0.1 * lo; bp.strength = 0.32 - 0.2 * lo;
    ventSteam(t, (wet ? 1 : 0.25) * heat * (t < K.s8 ? 1 : 0), 0.13, 0.57, -0.1);
    openSteam(t, lo, 0, 0.42, 0);
    heroSteam(t, 1, 0, 0.15, 0);
    // gauge: rises at s5, sits on the boiling mark, jumps when the water is gone
    const gv = t > K.s5 - 0.2 && t < K.s7 + 0.5 ? back(clamp01((t - K.s5 - 0.2) / 0.5)) * (1 - ramp(t, K.s7 - 0.2, K.s7 + 0.4)) : 0;
    gauge.visible = gv > 0.01; gauge.scale.setScalar(Math.max(0.001, gv));
    let v = 0.56 + 0.008 * Math.sin(t * 3.1);
    v += 0.34 * eout(clamp01((t - A("s6:suhu")) / Math.max(0.3, A("s6:cepat") + 0.3 - A("s6:suhu"))));
    v -= 0.1 * ramp(t, tKlik + 0.3, K.s6e);
    if (t < A("s5:Selama") - 0.3) v = 0.56 * ramp(t, K.s5, A("s5:Selama") - 0.3) + 0.0;
    needle.rotation.z = -(-130 + 260 * v) * Math.PI / 180;
    // paddle scoop (s8)
    const a0 = A("s8:bukan"), dip = ramp(t, a0 - 0.2, a0 + 0.5), lift = ramp(t, a0 + 0.6, a0 + 1.6), drop = ramp(t, a0 + 1.6, a0 + 2.1);
    paddle.visible = t > a0 - 0.4 && t < K.dur;
    const px0 = 0.02, py0 = 0.62 - 0.36 * dip, pz0 = 0.05;
    paddle.position.set(px0 + (BOWL.x + 0.02 - px0) * lift, py0 + 0.25 * Math.sin(Math.PI * lift) + (0.3 - py0) * lift, pz0 + (BOWL.z - 0.06 - pz0) * lift - 0.05 * drop);
    paddle.rotation.set(-0.3 + 0.4 * dip - 0.6 * drop, 0.4 * lift, 0.25 * drop);
    clump.visible = dip > 0.98 && drop < 0.5; bowlClump.visible = drop > 0.5;

    // ---- station B ----
    const sB = t > K.s3 - 0.5 && t < K.s4 + 0.6;
    spots[0].intensity = sB ? 3.5 * ramp(t, A("s3:Mitsubishi") - 0.5, A("s3:Mitsubishi")) * (1 - 0.6 * ramp(t, A("s3:Yang") - 0.3, A("s3:Yang"))) + 1 : 0;
    spots[1].intensity = sB ? 1 + 3.5 * ramp(t, A("s3:Yang") - 0.2, A("s3:Toshiba")) : 0;
    lamp55.emissiveIntensity = 2 * ramp(t, A("s3:otomatis#2") - 0.2, A("s3:otomatis#2") + 0.2);

    // ---- station C ----
    const tr = A("s4:timer");
    knob.rotation.z = -(0.2 + (t - K.s4) * 0.08 + 2.4 * ramp(t, tr - 0.2, tr + 0.5)) - (t > tr + 0.5 ? (t - tr) * 0.35 : 0);
    timer.rotation.z = t > tr + 0.4 && t < tr + 1.2 ? 0.03 * Math.sin((t - tr) * 60) * (1 - (t - tr - 0.4) / 0.8) : 0;
    smoke(t, ramp(t, A("s4:gosong") - 0.4, A("s4:gosong")) * (t < K.s5 + 0.8 ? 1 : 0) + 0.25, 0, 0.13, 0);
    tags[0].emissiveIntensity = 0.12 * ramp(t, A("s4:gosong") - 0.1, A("s4:gosong") + 0.2);
    tags[1].emissiveIntensity = 0.12 * ramp(t, A("s4:belum") - 0.1, A("s4:belum") + 0.2);

    // ---- station D ----
    const tp = A("s7:percobaan");
    pots.forEach((p, i) => { if (i === 1) { p.st(t, 0.4 + 0.8 * (t > tp ? 0.5 - 0.5 * Math.cos((t - tp) * 2.1) : 0), 0, 0.1, 0); return; } const on = t > tp - 0.4 + i * 0.12; const rat = on ? Math.max(0, Math.sin(t * 9 + p.ph)) * 0.008 : 0; p.lid.position.y = 0.092 + rat; p.lid.rotation.z = rat * 4; p.st(t, on ? 0.8 : 0.25, 0, 0.1, 0); });
    const lid1 = t > tp ? 0.5 - 0.5 * Math.cos((t - tp) * 2.1) : 0;
    minami.G.rotation.set(0.16, 0.38, 0); fumiko.G.rotation.set(0.1, -0.42, 0);
    pose(minami, { rL: 0.35, eL: 0.9, sL: 0.2, rR: 0.6 + 0.45 * lid1, eR: 0.3 + 0.25 * lid1, sR: -0.05, hx: 0.12 - 0.06 * lid1, hy: 0.42 + 0.08 * Math.sin(t * 0.6) });
    pose(fumiko, { rL: 0.95, eL: 1.2, rR: 0.95, eR: 1.2, sL: 0.28, sR: -0.28, hx: 0.08 + 0.04 * Math.sin(t * 0.8), hy: -0.45 + 0.06 * Math.sin(t * 0.5) });
    pots[1].lid.position.y = 0.092 + 0.14 * lid1; pots[1].lid.rotation.x = -0.5 * lid1; pots[1].lid.position.z = -0.02 * lid1;
    held.position.y = 0.33 + 0.01 * Math.sin(t * 0.8); heldSteam(t, 1, 0, 0.05, 0);
    names[0].emissiveIntensity = 0.3 * ramp(t, A("s7:Yoshitada") - 0.2, A("s7:Yoshitada") + 0.2);
    names[1].emissiveIntensity = 0.3 * ramp(t, A("s7:Fumiko") - 0.2, A("s7:Fumiko") + 0.2);
    const fl = ramp(t, A("s7:sejak") - 0.1, A("s7:sejak") + 0.5); flipP.rotation.x = -Math.PI * 0.95 * fl; blank.visible = fl < 0.99;
    calM.emissiveIntensity = 0.2 * fl;
    const tk = A("s7:Keberhasilannya");
    line.forEach(({ g, i }) => {
      const show = t > tk - 0.4 + i * 0.1 && t < K.s8 + 0.5; g.visible = show; if (!show) return;
      const pop = back(clamp01((t - tk + 0.4 - i * 0.1) / 0.45));
      g.position.x = XV + 0.15 + ((i * 0.4 + 0.32 * Math.max(0, t - tk)) % (LV - 0.2)); g.position.y = 0.05; g.scale.setScalar(0.42 * Math.max(0.001, pop));
    });

    comp.render();
  };
}
