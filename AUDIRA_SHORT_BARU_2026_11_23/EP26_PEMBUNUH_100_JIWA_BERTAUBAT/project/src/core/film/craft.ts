/**
 * Film-language craft as pure functions of time: stop motion on 2s, rack focus, cut-paper boil,
 * page peel, volume-kept squash, rain on glass, light streaks behind glass.
 *
 * Ported to TypeScript from motion-pack `objects/lib/scene-craft.js` (MIT, Anveshana Futurecorp,
 * https://github.com/ANVEAI/motion-pack, commit 33f36b3; see scripts/lib/THIRD_PARTY_NOTICES.md).
 * Same maths and constants; seeded values use mulberry32, never Math.random, so every frame gives
 * the same value in any render order (Remotion renders tabs out of order). Handheld drift is not
 * ported: use core/camera/handheld.ts.
 *
 * Times are seconds (pass film seconds: frame / fps).
 *
 * Which kit uses what:
 *   stepTime      clay / felt / toy stop motion (CLAYWORLD, FELTCRAFT, TOYDIORAMA, BRICKCRAFT): animate on 2s
 *   paperJitter   cut-paper and drawn layers that "boil" on twelves (PAPERWORLD, INKSTORY, SKETCHFORGE, CHALKCRAFT)
 *   peel          page-peel transition between shots (paper / manuscript / comic styles)
 *   rackFocus     focus pulled from one subject to another (FILMNOIR, VISUALINVESTIGATION, any DOF shot)
 *   impactSquash  soft bodies landing (clay, felt, toys); squash keeps the volume
 *   rainDrops / lightStreaks   rain on a window with traffic behind it (FILMNOIR, RETROWAVE, DREAMCORE)
 */

import { bezier, clamp } from "../motion/easing";

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0..1 progress of t through [a, b] (step at b when the window is empty). */
const seg01 = (t: number, a: number, b: number) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
const softEase = bezier(0.4, 0, 0.2, 1); // focus puller: a slight late settle
const moveEase = bezier(0.65, 0, 0.35, 1);

/** Seeded PRNG (mulberry32): same seed, same sequence, in every tab and process. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stop motion: the time a frame shows when the film is animated "on 2s".
 * stepFps 15 at a 30 fps film holds each pose 2 frames; at 60 fps pass 15 for "on 4s" or 30 for "on 2s".
 * Feed the result to the animation (pose, position), never to the camera: a stepped camera judders.
 */
export const stepTime = (t: number, stepFps = 15) => (stepFps > 0 ? Math.floor(t * stepFps + 1e-6) / stepFps : t);

/** Rack focus: focus distance pulled from a to b over [t0, t1] with the focus puller's ease. */
export const rackFocus = (t: number, a: number, b: number, t0: number, t1: number) => lerp(a, b, softEase(seg01(t, t0, t1)));

/**
 * Cut-paper boil: a hand-placed layer is never quite still; it hops on twelves (boilFps) by under px
 * pixels and a fraction of a degree. Returns [dx, dy, rotDeg] for layer i, constant within one boil step.
 * In 3D, convert px to world units for the layer's distance (about px * worldUnitsPerPixel).
 */
export function paperJitter(t: number, i = 0, { boilFps = 12, px = 1.5, deg = 0.25, seed = 5 } = {}): [number, number, number] {
  const s = Math.floor(t * boilFps + 1e-6);
  const r = mulberry32(((seed + i * 131) * 2654435761 + s * 40503) >>> 0);
  return [(r() * 2 - 1) * px, (r() * 2 - 1) * px, (r() * 2 - 1) * deg];
}

function peelOff(q: number, u: number, v: number, rad: number, angle: number): [number, number, number] {
  const ca = Math.cos(angle), sa = Math.sin(angle), dmax = ca + sa, d = u * ca + v * sa;
  const line = lerp(dmax + 0.01, -dmax - 0.2 - Math.PI * rad, q), over = d - line;
  if (over <= 0) return [u, v, 0];
  const arc = Math.min(over, Math.PI * rad), th = arc / rad, back = over - arc;
  const dn = line + rad * Math.sin(th) - back, z = rad * (1 - Math.cos(th)) + (back > 0 ? 0.002 : 0);
  return [u + (dn - d) * ca, v + (dn - d) * sa, z];
}

/**
 * Page peel across the frame as a transition, k in 0..1. 0..0.5: the page unrolls in from the right and
 * lies flat over the frame at 0.5 (cut the shot under it); 0.5..1: it peels off to the left.
 * For a vertex (u, v) of the page (0..1 across, 0..1 up) returns [x, y, z] in page units (1 = page width):
 * an inextensible curl around a cylinder of radius rad rolling along a fold line at `angle`.
 * Apply it to a subdivided plane in front of the camera (see PagePeel in core/film/Craft.tsx).
 */
export function peel(k: number, u: number, v: number, { rad = 0.08, angle = 0.35 } = {}): [number, number, number] {
  const inPhase = k < 0.5, q = inPhase ? 1 - 2 * clamp(k) : 2 * clamp(k) - 1;
  const [x, y, z] = peelOff(q, inPhase ? 1 - u : u, v, rad, angle);
  return [inPhase ? 1 - x : x, y, z];
}

/** How much of the frame a peel at k covers (flat part only, 0..1): cut the shot when it is 1. */
export function peelCover(k: number, { rad = 0.08, angle = 0.35 } = {}) {
  let c = 0;
  const N = 12;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const p = peel(k, (i + 0.5) / N, (j + 0.5) / N, { rad, angle });
      if (p[2] === 0 && p[0] >= 0 && p[0] <= 1) c++;
    }
  return c / (N * N);
}

/** Squash and stretch that keeps the volume: amount > 0 squashes, < 0 stretches. Returns [sxz, sy]. */
export const squash = (amount: number): [number, number] => {
  const sy = clamp(1 - amount, 0.4, 1.8);
  return [1 / Math.sqrt(sy), sy];
};

/** Contact squash after an impact at t0: a soft body's spring, peak `amount`, settling in about 0.4 s. */
export function impactSquash(t: number, t0: number, amount = 0.18, hz = 3.2) {
  if (t < t0) return 0;
  const a = t - t0;
  return amount * Math.exp(-5.5 * a) * Math.cos(TAU * hz * a);
}

export type RainDrop = { x: number; y: number; r: number; run: number };
/**
 * Rain on a pane w x h (scene units, origin bottom-left): each drop holds, then slides down in short
 * jerks. run is 0..1, how fast it slides now (use it for the trail length).
 */
export function rainDrops(t: number, { n = 90, seed = 11, w = 2, h = 1.4, speed = 0.55, rMin = 0.006, rMax = 0.022 } = {}): RainDrop[] {
  const out: RainDrop[] = [];
  for (let i = 0; i < n; i++) {
    const r = mulberry32((seed * 7919 + i * 104729) >>> 0);
    const x = r() * w, rad = lerp(rMin, rMax, r() ** 2), period = 1.4 + r() * 2.6, ph = r() * period, slide = 0.25 + r() * 0.35;
    const cyc = (t + ph) / period, c = Math.floor(cyc), f = cyc - c;
    const runK = clamp((f - (1 - slide)) / slide);
    const dist = speed * period * slide * (c + moveEase(runK)) * (0.6 + (rad / rMax) * 0.8);
    const y = h - ((r() * h + dist) % (h + 0.1));
    out.push({ x, y, r: rad, run: runK > 0 && runK < 1 ? Math.sin(Math.PI * runK) : 0 });
  }
  return out;
}

export type LightStreak = { x: number; y: number; len: number; a: number; hue: 0 | 1; dir: 1 | -1 };
/** Light streaks passing behind glass (cars on a wet street) across width w, one crossing per period per lane. */
export function lightStreaks(t: number, { n = 6, seed = 23, w = 4, h = 1, period = 3.2, len = 0.7 } = {}): LightStreak[] {
  const out: LightStreak[] = [];
  for (let i = 0; i < n; i++) {
    const r = mulberry32((seed * 31 + i * 977) >>> 0);
    const dir: 1 | -1 = r() < 0.5 ? 1 : -1, p = period * (0.7 + r() * 0.8), ph = r() * p, u = ((t + ph) % p) / p;
    const x = dir > 0 ? lerp(-len, w + len, u) : lerp(w + len, -len, u);
    const edge = Math.min(seg01(u, 0, 0.12), 1 - seg01(u, 0.88, 1));
    out.push({ x, y: h * (0.15 + 0.7 * r()), len: len * (0.6 + r() * 0.8), a: edge * (0.55 + 0.45 * r()), hue: r() < 0.55 ? 0 : 1, dir });
  }
  return out;
}
