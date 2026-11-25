// AE-060 procedural textures (subset copied from the BEDAH kit tex.ts: seeded value noise + albedo/normal builder).
// Deterministic: no Math.random, every map is a pure function of (u, v, seed). Cached per key.
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, SRGBColorSpace, type Texture } from "three";

export type Maps = { map: Texture; normalMap: Texture };
type Rgb = [number, number, number];
const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const hash2 = (x: number, y: number, seed = 0) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
};
const wrap = (i: number, p: number) => ((i % p) + p) % p;
const vnoise = (x: number, y: number, px: number, py: number, seed = 0) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const x0 = wrap(xi, px), x1 = wrap(xi + 1, px), y0 = wrap(yi, py), y1 = wrap(yi + 1, py);
  const a = hash2(x0, y0, seed), b = hash2(x1, y0, seed), c = hash2(x0, y1, seed), d = hash2(x1, y1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
};
export const fbm = (u: number, v: number, f: number, oct: number, seed = 0, fy = f) => {
  let a = 0.5, s = 0, n = 0, px = f, py = fy;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(u * px, v * py, px, py, seed + i * 31);
    n += a;
    a *= 0.5;
    px *= 2;
    py *= 2;
  }
  return s / n;
};
const c01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a: number, b: number, x: number) => {
  const t = c01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp3 = (o: Float32Array, a: Rgb, b: Rgb, t: number) => {
  o[0] = a[0] + (b[0] - a[0]) * t;
  o[1] = a[1] + (b[1] - a[1]) * t;
  o[2] = a[2] + (b[2] - a[2]) * t;
};
type Fill = (u: number, v: number, px: Float32Array) => void;
const fin = (t: DataTexture, srgb: boolean) => {
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  t.generateMipmaps = true;
  t.minFilter = LinearMipmapLinearFilter;
  t.magFilter = LinearFilter;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
};
const build = (w: number, h: number, fill: Fill, bump = 1): Maps => {
  const col = new Uint8Array(w * h * 4);
  const H = new Float32Array(w * h);
  const px = new Float32Array(4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      px[3] = 0;
      fill((x + 0.5) / w, (y + 0.5) / h, px);
      const k = (y * w + x) * 4;
      col[k] = Math.max(0, Math.min(255, px[0]));
      col[k + 1] = Math.max(0, Math.min(255, px[1]));
      col[k + 2] = Math.max(0, Math.min(255, px[2]));
      col[k + 3] = 255;
      H[y * w + x] = px[3];
    }
  const nrm = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = (H[y * w + ((x + 1) % w)] - H[y * w + ((x + w - 1) % w)]) * bump;
      const dy = (H[((y + 1) % h) * w + x] - H[((y + h - 1) % h) * w + x]) * bump;
      const il = 1 / Math.hypot(dx, dy, 1);
      const k = (y * w + x) * 4;
      nrm[k] = (-dx * il * 0.5 + 0.5) * 255;
      nrm[k + 1] = (-dy * il * 0.5 + 0.5) * 255;
      nrm[k + 2] = (il * 0.5 + 0.5) * 255;
      nrm[k + 3] = 255;
    }
  return { map: fin(new DataTexture(col, w, h, RGBAFormat), true), normalMap: fin(new DataTexture(nrm, w, h, RGBAFormat), false) };
};
const cache = new Map<string, Maps>();
const memo = (key: string, make: () => Maps) => {
  let m = cache.get(key);
  if (!m) cache.set(key, (m = make()));
  return m;
};

/** Neutral grain (tinted by the material colour): concrete, soil layers, steel. */
export const grain = (seed = 21, rough = 1) =>
  memo(`grain${seed}-${rough}`, () =>
    build(512, 512, (u, v, px) => {
      const a = fbm(u, v, 5, 5, seed), b = fbm(u, v, 80, 3, seed + 4);
      const sh = 215 + (a - 0.5) * 60 * rough + (b - 0.5) * 40 * rough;
      px[0] = sh; px[1] = sh; px[2] = sh;
      px[3] = b * 0.7 + a * 0.3;
    }, 1.6 * rough),
  );

/** Soil section face: clods, pale stones and (for hard ground) dark cracks. Neutral, tinted by material colour. */
export const soil = (seed: number, cracks: number) =>
  memo(`soil${seed}-${cracks}`, () => {
    const S = hex("#ffffff"), D = hex("#8a8a8a"), P = hex("#f4efe6");
    return build(512, 512, (u, v, px) => {
      const big = fbm(u, v, 6, 4, seed), mid = fbm(u, v, 36, 3, seed + 3), fine = fbm(u, v, 160, 2, seed + 6);
      lerp3(px, S, D, c01(big * 0.6 + mid * 0.6 - 0.45));
      const st = ss(0.7, 0.74, fbm(u, v, 60, 2, seed + 9));
      lerp3(px, [px[0], px[1], px[2]], P, st * 0.5);
      const crack = (1 - ss(0, 0.03, Math.abs(fbm(u, v, 8, 4, seed + 12) - 0.5))) * cracks;
      lerp3(px, [px[0], px[1], px[2]], [70, 70, 70], crack * 0.8);
      const sh = 0.86 + fine * 0.22;
      px[0] *= sh; px[1] *= sh; px[2] *= sh;
      px[3] = mid * 0.7 + fine * 0.4 + st - crack * 1.2;
    }, 3);
  });

/** Sea surface normal map: long swell + chop (tileable, scrolled by the film clock). */
export const waves = () =>
  memo("waves", () =>
    build(512, 512, (u, v, px) => {
      const a = fbm(u, v, 4, 4, 77, 8), b = fbm(u, v, 16, 3, 79);
      px[0] = 128; px[1] = 128; px[2] = 255;
      px[3] = a * 1.2 + b * 0.5;
    }, 5),
  );
