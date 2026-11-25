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
