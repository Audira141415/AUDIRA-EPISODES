// INFLATABLE motion: closed-form inflation springs, bounces and jiggles. Pure functions of time.

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Inflation from t0: 0 = flat deflated sheet, 1 = full. Air rushes in, overshoots, and the vinyl
 * settles (underdamped spring). Before t0 it is 0.
 */
export function inflate(t: number, t0: number, dur = 0.55) {
  const x = (t - t0) / dur;
  if (x <= 0) return 0;
  return 1 - Math.exp(-4.2 * x) * Math.cos(7.5 * x);
}

/** Scale of an inflating body: thin and slightly spread when empty, plump when full. */
export function inflateScale(k: number): [number, number, number] {
  const spread = 1 + 0.12 * (1 - clamp01(k));
  return [spread * (0.85 + 0.15 * k), spread * (0.85 + 0.15 * k), 0.06 + 0.94 * k];
}

export type Bounce = { y: number; impact: number };

/**
 * A drop from height h released at t0, bouncing with restitution e (closed form, no stepping).
 * Returns the height above rest and the time of the latest impact (−∞ before the first).
 */
export function bounce(t: number, t0: number, h: number, e = 0.48, g = 6.5): Bounce {
  const dt = t - t0;
  if (dt <= 0) return { y: h, impact: -Infinity };
  const tf = Math.sqrt((2 * h) / g);
  if (dt < tf) return { y: h - 0.5 * g * dt * dt, impact: -Infinity };
  let v = g * tf * e, start = tf;
  for (let n = 0; n < 7; n++) {
    const hop = (2 * v) / g;
    if (dt < start + hop) {
      const s = dt - start;
      return { y: v * s - 0.5 * g * s * s, impact: t0 + start };
    }
    start += hop;
    v *= e;
  }
  return { y: 0, impact: t0 + start };
}

/** Squash-and-stretch after an impact at `at`: [xz, y] scale, volume kept. */
export function squashAfter(t: number, at: number, amount = 0.22, hz = 3.4): [number, number] {
  const a = t - at;
  if (!(a >= 0)) return [1, 1];
  const s = Math.exp(-a * 7) * Math.cos(a * hz * Math.PI * 2) * amount;
  const y = 1 - s;
  return [1 / Math.sqrt(y), y];
}

/** A little hop at `at` (the letters' wave): height and the squash on landing. */
export function hop(t: number, at: number, h = 0.22, dur = 0.42) {
  const x = (t - at) / dur;
  const y = x > 0 && x < 1 ? h * 4 * x * (1 - x) : 0;
  return { y, land: at + dur };
}
