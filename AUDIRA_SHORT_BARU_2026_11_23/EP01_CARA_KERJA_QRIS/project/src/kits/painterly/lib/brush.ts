// Procedural brushwork textures (seeded, no downloads).
//
// brushField(): a tileable canvas of overlapping oil strokes, all running roughly along +u. Every
//   stroke has its own tone (R), bristle streaks along its length (G) and a hue jitter (B). The
//   painted shader samples it in the surface's own frame so band edges break along stroke shapes.
// dabAtlas(): a 2×2 atlas of single brush marks with ragged alpha, for stroke "cards":
//   0 leaf dab, 1 long stroke, 2 grass tuft, 3 cloud puff. R = alpha, G = bristle value.

import * as THREE from "three";
import { prng } from "../../../core/materials/textures.ts";

const cache = new Map<string, THREE.DataTexture>();

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Tileable field of overlapping strokes. */
export function brushField(seed = 11, size = 512): THREE.DataTexture {
  const key = `field-${seed}-${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rnd = prng(seed * 7919 + 13);
  const S = size;
  const R = new Float32Array(S * S).fill(0.5);
  const G = new Float32Array(S * S).fill(0.5);
  const B = new Float32Array(S * S).fill(0.5);
  const strokes = Math.round((S * S) / 300);
  for (let k = 0; k < strokes; k++) {
    const cx = rnd() * S, cy = rnd() * S;
    const len = 36 + rnd() * 70, wid = 9 + rnd() * 13;
    const ang = (rnd() - 0.5) * 0.7;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const tone = rnd(), hue = rnd();
    const phase = rnd() * 20, freq = 0.9 + rnd() * 0.7;
    const curve = (rnd() - 0.5) * 0.012;
    const ext = Math.ceil(len / 2 + wid);
    for (let dy = -ext; dy <= ext; dy++) {
      for (let dx = -ext; dx <= ext; dx++) {
        const u = dx * ca + dy * sa; // along the stroke
        let v = -dx * sa + dy * ca; // across
        v -= curve * u * u;
        const lu = u / (len / 2);
        if (lu < -1 || lu > 1) continue;
        // tapered ends, a slightly fatter loaded start
        const halfW = (wid / 2) * Math.pow(1 - lu * lu, 0.35) * (1 + 0.15 * (-lu));
        const av = Math.abs(v);
        if (av > halfW) continue;
        const edge = smooth(halfW, halfW * 0.72, av);
        // bristles: streaks along the stroke, dry-brush break-up towards the tail
        const br = 0.5 + 0.5 * Math.sin(v * freq * 2.2 + phase) * Math.sin(v * 0.63 + phase * 1.7);
        const dry = lu > 0.4 && br < (lu - 0.4) * 1.3 ? 0 : 1;
        const a = edge * dry;
        if (a <= 0) continue;
        const x = (((Math.round(cx + dx)) % S) + S) % S;
        const y = (((Math.round(cy + dy)) % S) + S) % S;
        const i = y * S + x;
        R[i] = R[i] * (1 - a) + (tone * 0.85 + br * 0.15) * a;
        G[i] = G[i] * (1 - a) + br * a;
        B[i] = B[i] * (1 - a) + hue * a;
      }
    }
  }
  const data = new Uint8Array(S * S * 4);
  for (let i = 0; i < S * S; i++) {
    data[i * 4] = Math.round(clamp01(R[i]) * 255);
    data[i * 4 + 1] = Math.round(clamp01(G[i]) * 255);
    data[i * 4 + 2] = Math.round(clamp01(B[i]) * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

/** 2×2 atlas of single brush marks. Cell index: 0 leaf dab, 1 long stroke, 2 grass tuft, 3 cloud puff. */
export function dabAtlas(seed = 5, cell = 256): THREE.DataTexture {
  const key = `dab-${seed}-${cell}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = cell * 2;
  const data = new Uint8Array(S * S * 4);
  const rnd = prng(seed * 104729 + 7);
  const noise1 = (n: number, fine = 0.2) => {
    // smooth periodic rim noise: a few broad lobes, a little fine wobble (too much reads as jaggies)
    const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
    return (a: number) => 0.5 + (Math.sin(a * n + ph[0]) * 0.55 + Math.sin(a * (n * 2 + 1) + ph[1]) * 0.3 + Math.sin(a * (n * 4 + 3) + ph[2]) * fine + Math.sin(a * 2 + ph[3]) * 0.2) * 0.4;
  };
  const put = (cx: number, cy: number, x: number, y: number, a: number, v: number) => {
    const px = cx * cell + x, py = cy * cell + y;
    const i = (py * S + px) * 4;
    const na = Math.max(data[i] / 255, a);
    data[i] = Math.round(clamp01(na) * 255);
    if (a > 0.02) data[i + 1] = Math.round(clamp01(v) * 255);
    data[i + 2] = 0;
    data[i + 3] = 255;
  };
  // 0: leaf dab, a rounded ragged blob with bristle streaks
  {
    const ragged = noise1(4, 0.08);
    const ph = rnd() * 10;
    for (let y = 0; y < cell; y++)
      for (let x = 0; x < cell; x++) {
        const u = (x / cell - 0.5) * 2, v = (y / cell - 0.5) * 2;
        const r = Math.hypot(u * 0.92, v * 1.12);
        const ang = Math.atan2(v, u);
        const rim = 0.74 + 0.18 * (ragged(ang) - 0.5) * 2;
        const a = smooth(rim, rim - 0.1, r);
        // streaks in one direction only (a product of sines would read as a checkerboard)
        const br = 0.5 + 0.5 * Math.sin((u * 0.7 + v) * 30 + 1.6 * Math.sin(u * 5 + ph));
        put(0, 0, x, y, a, 0.35 + 0.4 * br + (1 - r) * 0.25);
      }
  }
  // 1: long stroke, tapered both ends, bristles along u
  {
    const ph = rnd() * 10;
    for (let y = 0; y < cell; y++)
      for (let x = 0; x < cell; x++) {
        const u = (x / cell - 0.5) * 2, v = (y / cell - 0.5) * 2;
        const half = 0.42 * Math.pow(Math.max(0, 1 - u * u), 0.45);
        const br = 0.5 + 0.5 * Math.sin(v * 46 + ph) * Math.sin(v * 13 + ph * 2);
        const dry = u > 0.5 && br < (u - 0.5) * 1.6 ? 0 : 1;
        const a = smooth(half, half * 0.7, Math.abs(v)) * dry;
        put(1, 0, x, y, a, 0.4 + 0.5 * br);
      }
  }
  // 2: grass tuft, five tapered blades fanning from the bottom centre
  {
    const blades = Array.from({ length: 6 }, (_, k) => ({
      lean: (k / 5 - 0.5) * 0.9 + (rnd() - 0.5) * 0.25,
      h: 0.65 + rnd() * 0.33,
      w: 0.05 + rnd() * 0.035,
      bend: (rnd() - 0.5) * 0.5,
      tone: 0.35 + rnd() * 0.6,
    }));
    for (let y = 0; y < cell; y++)
      for (let x = 0; x < cell; x++) {
        const u = (x / cell - 0.5) * 2; // -1..1
        const h = y / cell; // 0 bottom .. 1 top (DataTexture row 0 = uv v 0 = bottom of the card)
        let a = 0, v = 0;
        for (const b of blades) {
          if (h > b.h) continue;
          const s = h / b.h;
          const cxb = b.lean * s + b.bend * s * s;
          const half = b.w * (1 - s) + 0.004;
          const d = Math.abs(u - cxb);
          const ab = smooth(half, half * 0.55, d);
          if (ab > a) {
            a = ab;
            v = b.tone * (0.55 + 0.45 * s);
          }
        }
        put(0, 1, x, y, a, v);
      }
  }
  // 3: cloud puff, a big soft lumpy disc
  {
    const ragged = noise1(3, 0.03);
    const ph = rnd() * 10;
    for (let y = 0; y < cell; y++)
      for (let x = 0; x < cell; x++) {
        const u = (x / cell - 0.5) * 2, v = (y / cell - 0.5) * 2;
        const r = Math.hypot(u, v * 1.05);
        const ang = Math.atan2(v, u);
        const rim = 0.78 + 0.16 * (ragged(ang) - 0.5) * 2;
        const a = smooth(rim, rim - 0.28, r);
        const br = 0.5 + 0.5 * Math.sin((u * 0.5 + v) * 13 + 1.8 * Math.sin(u * 3 + ph));
        put(1, 1, x, y, a, 0.45 + 0.3 * br + (1 - r) * 0.2);
      }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.flipY = false;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
