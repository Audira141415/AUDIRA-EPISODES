// EP19 timing: film seconds from the locked VO (audio/vo.segments.json). VO starts at film 0.
export const FILM_SECONDS = 91.0;
export const OUTRO_SECONDS = 3.0;
/** Scene starts (s1..s8) and film end. Each cut sits >= 0.5 s after the last word of its part. */
export const CUTS = [0, 6.95, 17.35, 29.08, 41.35, 53.55, 61.7, 77.3, FILM_SECONDS] as const;

export const sceneAt = (t: number) => {
  for (let i = CUTS.length - 2; i >= 0; i--) if (t >= CUTS[i]) return i;
  return 0;
};
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0 before a, 1 after b, smoothstep between. */
export const ss = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/** Linear 0..1 between a and b. */
export const lin = (a: number, b: number, t: number) => clamp01((t - a) / (b - a));
export const easeInCubic = (x: number) => x * x * x;
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeOutBack = (x: number) => {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** true when a <= t < b */
export const within = (t: number, a: number, b: number) => t >= a && t < b;
