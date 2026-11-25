// Small pure helpers copied into each episode's assets/lib. No look decisions here.
import * as THREE from "./three.module.js";

export function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x) => { x = clamp01(x); return x * x * x * (x * (6 * x - 15) + 10); };
export const ramp = (t, a, b) => smooth((t - a) / (b - a));
export const eout = (x) => { x = clamp01(x); return 1 - Math.pow(1 - x, 3); };
export const back = (x, s = 1.7) => { x = clamp01(x) - 1; return x * x * ((s + 1) * x + s) + 1; };

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  if (repeat) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(repeat[0], repeat[1]); }
  return tx;
}

// Catmull-Rom over non-uniform time keys so the camera never rests at a key. keys: [t, ...values]
export function track(keys) {
  const n = keys.length;
  const tan = keys.map((k, i) => {
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)];
    return k.map((_, j) => (j === 0 ? 0 : (b[j] - a[j]) / Math.max(0.001, b[0] - a[0])));
  });
  return (t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0;
    while (keys[i + 1][0] < t) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h;
    const u2 = u * u, u3 = u2 * u;
    return k0.slice(1).map((_, jj) => {
      const j = jj + 1;
      return (2 * u3 - 3 * u2 + 1) * k0[j] + (u3 - 2 * u2 + u) * h * tan[i][j] + (-2 * u3 + 3 * u2) * k1[j] + (u3 - u2) * h * tan[i + 1][j];
    });
  };
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
export function cyl(rt, rb, h, seg, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
export const std = (color, rough = 0.5, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

// Renderer, scene, camera and bloom chain shared by the 3D episodes. Palette and lighting stay in each world.
import { EffectComposer } from "./EffectComposer.js";
import { RenderPass } from "./RenderPass.js";
import { UnrealBloomPass } from "./UnrealBloomPass.js";
import { OutputPass } from "./OutputPass.js";
export function stage(canvas, { bg, fog, exp = 1.1, bloom = [0.5, 0.6, 0.8], fov = 38, shadow = true }) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  r.setSize(1080, 1920, false);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = exp;
  if (shadow) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  if (fog) scene.fog = new THREE.FogExp2(bg, fog);
  const cam = new THREE.PerspectiveCamera(fov, 1080 / 1920, 0.1, 900);
  const comp = new EffectComposer(r);
  comp.addPass(new RenderPass(scene, cam));
  const bp = new UnrealBloomPass(new THREE.Vector2(1080, 1920), bloom[0], bloom[1], bloom[2]);
  comp.addPass(bp);
  comp.addPass(new OutputPass());
  return { r, scene, cam, comp, bp };
}

// Particles whose positions are written from timeline time every frame.
export function pts(scene, n, { color = 0xffffff, size = 0.4, add = true, opacity = 1 }) {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const c = new THREE.Color(color);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  const map = canvasTex(64, 64, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.65)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  const m = new THREE.PointsMaterial({ size, map, vertexColors: true, transparent: true, opacity, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, sizeAttenuation: true });
  const P = new THREE.Points(g, m);
  P.frustumCulled = false;
  scene.add(P);
  return { P, pos, col, m, g, commit() { g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; } };
}

// Jointed armored figure. Pivots sit at shoulders and hips so limbs swing naturally. The helm hides the face, so nothing reads as a doll.
export function figure(body, armor, skin, h = 1) {
  const G = new THREE.Group();
  const add = (geo, mat, x, y, z, p = G) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const limb = (x, y, len, w, mat) => { const piv = new THREE.Group(); piv.position.set(x, y, 0); G.add(piv); add(new THREE.CylinderGeometry(w * 1.15, w * 0.8, len, 10), mat, 0, -len / 2, 0, piv); add(new THREE.SphereGeometry(w * 1.05, 10, 8), mat, 0, 0, 0, piv); add(new THREE.BoxGeometry(w * 2.1, w * 1.2, w * 2.8), armor, 0, -len - w * 0.2, w * 0.45, piv); return piv; };
  add(new THREE.CylinderGeometry(0.98, 0.62, 1.75, 10), armor, 0, 3.15, 0);
  add(new THREE.CylinderGeometry(0.66, 0.74, 0.5, 10), body, 0, 2.3, 0);
  add(new THREE.SphereGeometry(0.46, 14, 12), skin, 0, 4.55, 0.05);
  const hd = add(new THREE.SphereGeometry(0.56, 14, 10, 0, 6.3, 0, 1.75), armor, 0, 4.62, 0);
  const helm = add(new THREE.ConeGeometry(0.16, 0.7, 6), armor, 0, 5.3, 0);
  add(new THREE.BoxGeometry(0.72, 0.1, 0.1), body, 0, 4.58, 0.5);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.48, 10, 8), armor, s * 1.08, 4.02, 0).scale.set(1, 0.72, 1.05);
  const armL = limb(-1.12, 3.9, 1.5, 0.25, body), armR = limb(1.12, 3.9, 1.5, 0.25, body);
  const legL = limb(-0.42, 2.3, 1.8, 0.31, body), legR = limb(0.42, 2.3, 1.8, 0.31, body);
  G.scale.setScalar(h);
  return { G, armL, armR, legL, legR, helm, hd };
}

// Soft strip lights baked into an environment map so metal and crystal have something to reflect. No HDR file.
export function envStrips(r, scene, strips, base = 0x050608) {
  const pm = new THREE.PMREMGenerator(r);
  const s = new THREE.Scene();
  s.background = new THREE.Color(base);
  for (const [w, h, c, i, x, y, z] of strips) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  }
  scene.environment = pm.fromScene(s, 0.04).texture;
}
