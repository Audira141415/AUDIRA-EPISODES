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

// Seeded tileable cloud noise (R: perlin-worley, G: high worley), baked once per load so frames stay pure functions of time.
export function volumeNoise(size = 64, seed = 7) {
  const rnd = mulberry(seed);
  const octave = (cells) => {
    const pts = new Float32Array(cells ** 3 * 3);
    for (let i = 0; i < pts.length; i++) pts[i] = rnd();
    return { cells, pts };
  };
  const worley = (o, x, y, z) => {
    const c = o.cells, fx = x * c, fy = y * c, fz = z * c, ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
    let m = 9;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let d = -1; d <= 1; d++) {
      const nx = (ix + a + c) % c, ny = (iy + b + c) % c, nz = (iz + d + c) % c, k = (nx + ny * c + nz * c * c) * 3;
      const dx = ix + a + o.pts[k] - fx, dy = iy + b + o.pts[k + 1] - fy, dz = iz + d + o.pts[k + 2] - fz;
      const q = dx * dx + dy * dy + dz * dz;
      if (q < m) m = q;
    }
    return 1 - Math.min(1, Math.sqrt(m));
  };
  const o1 = octave(4), o2 = octave(9), o3 = octave(18), o4 = octave(30);
  const data = new Uint8Array(size ** 3 * 4);
  let i = 0;
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, w = z / size;
    const a = worley(o1, u, v, w), b = worley(o2, u, v, w), c = worley(o3, u, v, w), d = worley(o4, u, v, w);
    data[i++] = 255 * clamp01(a * 0.62 + b * 0.27 + c * 0.11);
    data[i++] = 255 * clamp01(c * 0.62 + d * 0.38);
    data[i++] = 255 * clamp01(b * 0.6 + d * 0.4);
    data[i++] = 255;
  }
  const t = new THREE.Data3DTexture(data, size, size, size);
  t.format = THREE.RGBAFormat;
  t.minFilter = t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = t.wrapR = THREE.RepeatWrapping;
  t.unpackAlignment = 1;
  t.needsUpdate = true;
  return t;
}

// Studio-free environment from a sky gradient; gives PBR metal and concrete something real to reflect.
export function skyEnv(renderer, top, mid, low, sunDir, sunColor = 0xffffff, sunPower = 0) {
  const s = new THREE.Scene();
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { a: { value: new THREE.Color(top) }, b: { value: new THREE.Color(mid) }, c: { value: new THREE.Color(low) }, d: { value: (sunDir || new THREE.Vector3(0, 1, 0)).clone().normalize() }, e: { value: new THREE.Color(sunColor) }, p: { value: sunPower } },
    vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec3 v;uniform vec3 a,b,c,d,e;uniform float p;void main(){vec3 n=normalize(v);float y=n.y;vec3 k=y>0.?mix(b,a,pow(y,.55)):mix(b,c,pow(-y,.5));k+=e*p*pow(max(dot(n,d),0.),220.)+e*p*.03*pow(max(dot(n,d),0.),8.);gl_FragColor=vec4(k,1.);}",
  });
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), m));
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.02);
  pm.dispose();
  return rt.texture;
}

// Full-canvas pipeline shared by all episodes: scene -> bloom -> tone map. Each episode decides its own bloom and exposure.
export const noiseGLSL = `
uniform sampler3D uNoise;
float nA(vec3 p){return texture(uNoise,p).r;}
float nB(vec3 p){return texture(uNoise,p).g;}
float nC(vec3 p){return texture(uNoise,p).b;}
float fbm3(vec3 p){return nA(p)*.6+nC(p*2.03)*.28+nB(p*4.1)*.12;}
float hash12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}`;
