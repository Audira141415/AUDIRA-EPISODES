// Camera keys on the voice clock. Every key time is a word or chapter anchor (W / CH), never an
// absolute second. Channels are interpolated with a monotone cubic (Fritsch–Carlson): continuous
// velocity, no overshoot, so a key is never passed through and a hold stays a hold.
import type { V3 } from "./core.tsx";

export type Key = { t: number; pos: V3; tgt: V3; fov?: number };
export type Pose = { pos: V3; tgt: V3; fov: number };

const monotone = (xs: number[], ys: number[], x: number) => {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (xs[i + 1] < x) i++;
  const d = (k: number) => (ys[k + 1] - ys[k]) / Math.max(1e-6, xs[k + 1] - xs[k]);
  const m = (k: number) => {
    if (k === 0 || k === n - 1) return 0; // ease in/out at the ends
    const a = d(k - 1), b = d(k);
    if (a * b <= 0) return 0;
    const w1 = 2 * (xs[k + 1] - xs[k]) + (xs[k] - xs[k - 1]);
    const w2 = (xs[k + 1] - xs[k]) + 2 * (xs[k] - xs[k - 1]);
    return (w1 + w2) / (w1 / a + w2 / b);
  };
  const h = xs[i + 1] - xs[i], s = (x - xs[i]) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return h00 * ys[i] + h10 * h * m(i) + h01 * ys[i + 1] + h11 * h * m(i + 1);
};

export const sampleKeys = (keys: Key[], t: number): Pose => {
  const ks = [...keys].sort((a, b) => a.t - b.t);
  // drop keys that collide in time (keeps the later one)
  const clean: Key[] = [];
  for (const k of ks) {
    if (clean.length && k.t - clean[clean.length - 1].t < 0.05) clean[clean.length - 1] = k;
    else clean.push(k);
  }
  const xs = clean.map((k) => k.t);
  const ch = (f: (k: Key) => number) => monotone(xs, clean.map(f), t);
  return {
    pos: [ch((k) => k.pos[0]), ch((k) => k.pos[1]), ch((k) => k.pos[2])],
    tgt: [ch((k) => k.tgt[0]), ch((k) => k.tgt[1]), ch((k) => k.tgt[2])],
    fov: ch((k) => k.fov ?? 34),
  };
};
