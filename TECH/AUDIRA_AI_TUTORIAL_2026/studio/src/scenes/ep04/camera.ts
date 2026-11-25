// EP04 camera: shots of Catmull-Rom keys in VO seconds. Inside a shot the camera never stops;
// between shots there is a hard cut. `aim(look, dist, dir)` places the camera `dist` units from
// `look` along `dir` (normalised), so framing reads as "how much of the desk is in view".
import { C, SEC, TOTAL, W } from "./tl.ts";

export type V3 = [number, number, number];
type Key = { t: number; p: V3; l: V3; z?: boolean };

const norm = (v: V3): V3 => {
  const m = Math.hypot(...v);
  return [v[0] / m, v[1] / m, v[2] / m];
};
const aim = (t: number, l: V3, d: number, dir: V3, z = false): Key => {
  const n = norm(dir);
  return { t, l, p: [l[0] + n[0] * d, l[1] + n[1] * d, l[2] + n[2] * d], z };
};

// Props (world units, desk at y = 0)
export const PRINT_A: V3 = [-0.4, 0, -0.62];
export const PRINT_B: V3 = [0.38, 0, 0.5];
export const TABLET: V3 = [2.5, 0, 0.0];
export const PASSPORT: V3 = [-2.4, 0, 0.05];
export const CARD: V3 = [-0.98, 0, 1.02];

const TOP: V3 = [0.05, 0.93, 0.36];
const TAB_L: V3 = [TABLET[0], 0, TABLET[2] + 0.03];
const PAS_L: V3 = [PASSPORT[0], 0, PASSPORT[2] + 0.02];
const LENS_B: V3 = [0.38, 0.3, 0.32];
const LENS_A: V3 = [-0.5, 0.3, -0.85];

const kedua = W("l11", "kedua").s;
const SHOTS: Key[][] = [
  // HOOK: lens over print B -> crane back over A + B -> AUDIRA evidence card
  [
    aim(0, LENS_B, 4.5, [0.06, 0.92, 0.38]),
    aim(1.95, [0.38, 0.28, 0.3], 3.9, [0.04, 0.92, 0.38]),
    aim(C("l02").start + 0.25, [0.15, 0.05, 0.2], 6.4, [0.02, 0.84, 0.54]),
    aim(3.5, [0.0, 0.05, -0.12], 8.6, [0.0, 0.72, 0.69]),
    aim(C("l03").start, [-0.25, 0.05, 0.15], 7.6, [-0.03, 0.75, 0.66]),
    aim(5.1, [CARD[0], 0.02, CARD[2] - 0.05], 3.9, [0.07, 0.88, 0.47]),
    aim(SEC.hook[1] + 0.3, [CARD[0], 0.02, CARD[2] - 0.05], 3.55, [0.1, 0.87, 0.48]),
  ],
  // KONTEKS -> LANGKAH: lens over B, lift, return; whip to the tablet; steps; whip to passport
  [
    aim(SEC.hook[1] + 0.3, LENS_B, 5.0, [0.18, 0.9, 0.4]),
    aim(11.0, LENS_B, 4.5, [0.1, 0.92, 0.38]),
    aim(C("l05").start, [0.38, 0.25, 0.3], 4.6, [0.02, 0.93, 0.37]),
    aim(15.6, [0.36, 0.25, 0.28], 4.4, [-0.08, 0.93, 0.36]),
    aim(SEC.konteks[1] - 0.1, [0.42, 0.2, 0.24], 4.6, [-0.1, 0.92, 0.38], true),
    aim(SEC.langkah[0] - 0.05, [1.7, 0, 0.3], 6.2, [0.02, 0.92, 0.38]),
    aim(SEC.langkah[0] + 0.55, TAB_L, 6.6, TOP, true),
    aim(C("l08").start, TAB_L, 6.45, [0.04, 0.93, 0.36]),
    aim(C("l09").start, TAB_L, 6.35, [0.02, 0.93, 0.36]),
    aim(kedua - 0.05, TAB_L, 6.3, [0.0, 0.93, 0.37], true),
    aim(kedua + 0.4, [0.1, 0, 0.2], 7.4, [0.0, 0.93, 0.36]),
    aim(kedua + 0.95, PAS_L, 6.0, [0.02, 0.93, 0.37], true),
    aim(SEC.langkah[1] + 0.3, PAS_L, 5.8, [-0.05, 0.93, 0.36]),
  ],
  // PENJELASAN 1: SynthID found on print B
  [
    aim(SEC.langkah[1] + 0.3, [0.4, 0.3, 0.5], 5.4, [0.2, 0.9, 0.4]),
    aim(C("l12").end + 0.25, [0.4, 0.3, 0.5], 4.5, [0.04, 0.92, 0.38]),
  ],
  // PENJELASAN 2: video segments on the tablet
  [aim(C("l12").end + 0.25, TAB_L, 6.6, [0.06, 0.93, 0.36]), aim(C("l13").end + 0.25, TAB_L, 6.3, [0.0, 0.93, 0.37])],
  // PENJELASAN 3: Content Credentials passport
  [aim(C("l13").end + 0.25, PAS_L, 6.0, [0.06, 0.93, 0.37]), aim(C("l14").end + 0.25, PAS_L, 5.8, [-0.04, 0.93, 0.36])],
  // PENJELASAN 4: photo metadata on the tablet
  [aim(C("l14").end + 0.25, TAB_L, 6.6, [-0.05, 0.93, 0.36]), aim(SEC.penjelasan[1] + 0.25, TAB_L, 6.3, [0.04, 0.93, 0.36])],
  // PAYOFF: lens slides to print A (nothing found), then wide orbit under the warning cards
  [
    aim(SEC.penjelasan[1] + 0.25, [0.0, 0.25, -0.1], 6.0, [0.15, 0.9, 0.4]),
    aim(C("l16").start + 1.1, LENS_A, 4.4, [0.08, 0.92, 0.38]),
    aim(C("l17").start, LENS_A, 4.3, [0.02, 0.92, 0.38], true),
    aim(C("l17").start + 1.2, [-0.1, 0.1, -0.1], 8.0, [0.25, 0.78, 0.58]),
    aim(70, [-0.1, 0.1, -0.1], 8.4, [0.0, 0.8, 0.6]),
    aim(SEC.payoff[1] + 0.3, [-0.1, 0.1, -0.1], 8.6, [-0.25, 0.79, 0.56]),
  ],
  // OUTRO: crane up over the whole desk, then down onto the AUDIRA card
  [
    aim(SEC.payoff[1] + 0.3, [0.0, 0, -0.1], 10.5, [0.0, 0.86, 0.5]),
    aim(C("l22").start, [0.0, 0, 0.0], 12.0, [0.03, 0.9, 0.44]),
    aim(C("l22").end - 0.6, [-0.6, 0, 0.6], 6.0, [0.05, 0.89, 0.45]),
    aim(C("l23").start + 0.2, [CARD[0], 0.02, CARD[2] - 0.05], 3.7, [0.08, 0.88, 0.47]),
    aim(TOTAL + 0.5, [CARD[0], 0.02, CARD[2] - 0.05], 3.45, [0.1, 0.87, 0.48]),
  ],
];

// Time-aware cubic Hermite: tangents in units/second from the neighbours, zero at keys flagged z
// (whip starts/landings), so a far next key never drags the camera off the current subject.
const tangent = (keys: Key[], i: number, f: "p" | "l"): V3 => {
  const k = keys[i];
  if (k.z) return [0, 0, 0];
  const a = keys[Math.max(0, i - 1)], b = keys[Math.min(keys.length - 1, i + 1)];
  const dt = b.t - a.t || 1;
  return [0, 1, 2].map((j) => (b[f][j] - a[f][j]) / dt) as V3;
};
const hermite = (keys: Key[], i: number, u: number, f: "p" | "l"): V3 => {
  const k1 = keys[i], k2 = keys[i + 1];
  const dt = k2.t - k1.t;
  const m1 = tangent(keys, i, f), m2 = tangent(keys, i + 1, f);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  return [0, 1, 2].map((j) => h00 * k1[f][j] + h10 * dt * m1[j] + h01 * k2[f][j] + h11 * dt * m2[j]) as V3;
};

export const cameraAt = (t: number): { p: V3; l: V3 } => {
  let shot = SHOTS[0];
  for (const s of SHOTS) if (t >= s[0].t) shot = s;
  const n = shot.length;
  if (t <= shot[0].t) return { p: shot[0].p, l: shot[0].l };
  if (t >= shot[n - 1].t) return { p: shot[n - 1].p, l: shot[n - 1].l };
  let i = 0;
  while (i < n - 2 && t >= shot[i + 1].t) i++;
  const u = (t - shot[i].t) / (shot[i + 1].t - shot[i].t);
  return { p: hermite(shot, i, u, "p"), l: hermite(shot, i, u, "l") };
};
