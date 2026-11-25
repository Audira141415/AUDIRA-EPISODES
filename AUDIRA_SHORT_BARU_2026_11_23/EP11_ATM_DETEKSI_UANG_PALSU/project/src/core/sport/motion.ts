// Ball and player motion helpers in world units. Pure functions of time: safe for parallel renders.

type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0 before a, 1 after b, linear in between (seconds). */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerpV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** Parabolic flight from `from` to `to` with `apex` extra height at the middle. */
export const arc = (from: V3, to: V3, u: number, apex: number): V3 => {
  const p = lerpV(from, to, u);
  p[1] += 4 * apex * u * (1 - u);
  return p;
};

/** Rolling spin (radians about the axis perpendicular to travel) for a distance travelled. */
export const rollSpin = (distance: number, radius: number) => distance / radius;

/** Heading (radians, 0 = +z) that faces from a to b on the ground. */
export const headingTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);

/** A ball that bounces `bounces` times while travelling from a to b, losing height each time. */
export const bounce = (from: V3, to: V3, u: number, height: number, bounces = 3, damping = 0.45): V3 => {
  const p = lerpV(from, to, u);
  // Segments shrink geometrically so the ball settles.
  let total = 0;
  for (let i = 0; i <= bounces; i++) total += Math.pow(damping, i * 0.5);
  let acc = 0;
  for (let i = 0; i <= bounces; i++) {
    const w = Math.pow(damping, i * 0.5) / total;
    if (u <= acc + w || i === bounces) {
      const k = clamp01((u - acc) / w);
      p[1] += 4 * height * Math.pow(damping, i) * k * (1 - k);
      break;
    }
    acc += w;
  }
  return p;
};
