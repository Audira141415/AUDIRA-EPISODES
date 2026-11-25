// ORIGAMIFORGE timing. Every fold is a pure function of film time t (seconds): safe for parallel
// renders. One square sheet becomes a flapping crane in nine steps, then a tent card folds up with
// AUDIRA printed on it, and the crane lifts off the mat.

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
/** Paper folds lift quickly, then slow down as the crease is pressed flat. */
export const foldEase = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const D = Math.PI / 180;

/** Seconds of each step: [start, end]. */
export const T = {
  precrease: [0.0, 0.8] as const, // fold the diagonal...
  unfold: [0.9, 1.4] as const, // ...and open it again: the crease stays
  kiteA: [1.5, 2.2] as const,
  kiteB: [2.25, 2.95] as const,
  half: [3.05, 3.75] as const,
  stand: [3.85, 4.45] as const,
  tail: [4.55, 5.15] as const,
  neck: [5.2, 5.8] as const,
  head: [5.85, 6.3] as const,
  wings: [6.4, 7.15] as const,
  card: [7.5, 8.7] as const,
  lift: [9.5, 12] as const,
};

export const fold = (t: number, [a, b]: readonly [number, number], target: number) => target * foldEase(seg(t, a, b));

/** Diagonal pre-crease: almost flat over, then opened again. */
export const precreaseAngle = (t: number) => Math.PI * 0.985 * (1 - Math.pow(1 - seg(t, ...T.precrease), 2.2)) * (1 - foldEase(seg(t, ...T.unfold)));

/** Flap phase (radians): 1.5 Hz while it sits, ramping to 2.8 Hz as it takes off. Continuous. */
export function flapPhase(t: number) {
  const t0 = T.wings[1];
  if (t < t0) return 0;
  const f0 = 1.5, f1 = 2.8, a = T.lift[0], b = a + 0.8;
  const u = Math.min(t, a) - t0;
  let cyc = f0 * u;
  if (t > a) {
    const w = Math.min(t, b) - a;
    cyc += f0 * w + ((f1 - f0) * w * w) / (2 * (b - a));
    if (t > b) cyc += f1 * (t - b);
  }
  return cyc * Math.PI * 2;
}
export const flapAmp = (t: number) => (22 * smooth(seg(t, T.wings[1], T.wings[1] + 0.5)) + 16 * smooth(seg(t, T.lift[0], T.lift[0] + 0.7))) * D;

/** Wing angle from the body (radians, positive = the +z wing): fold out, then flap. */
export const WING_REST = 80 * D;
export const wingAngle = (t: number) => WING_REST * foldEase(seg(t, ...T.wings)) + flapAmp(t) * Math.sin(flapPhase(t));

/** Crane body transform: rests on the mat, then lifts off and climbs away, nose up. */
export function craneFlight(t: number) {
  const k = seg(t, ...T.lift);
  const e = k * k * (2.2 - 1.2 * k); // slow start, keeps climbing
  const bob = 0.012 * Math.sin(flapPhase(t) + Math.PI / 2) * smooth(seg(t, T.lift[0], T.lift[0] + 0.4));
  return {
    pos: [-0.16 * e, 0.85 * e + bob, -0.3 * e] as [number, number, number],
    pitch: 9 * D * smooth(seg(t, T.lift[0], T.lift[0] + 0.9)),
    yaw: -14 * D * e,
    roll: 4 * D * Math.sin(flapPhase(t) * 0.5) * k,
  };
}

/** Tent card: 0 = lying flat, 1 = standing as a tent (each half at 62° to the mat). */
export const cardFold = (t: number) => foldEase(seg(t, ...T.card));

/** HUD: the 9 steps, their Indonesian name and the kind of fold. */
export const STEPS: { at: number; name: string }[] = [
  { at: T.precrease[0], name: "LIPAT LEMBAH" },
  { at: T.kiteA[0], name: "LIPAT LAYANG" },
  { at: T.kiteB[0], name: "LIPAT LAYANG" },
  { at: T.half[0], name: "LIPAT DUA" },
  { at: T.stand[0], name: "BERDIRIKAN" },
  { at: T.tail[0], name: "LIPAT BALIK · EKOR" },
  { at: T.neck[0], name: "LIPAT BALIK · LEHER" },
  { at: T.head[0], name: "LIPAT BALIK · KEPALA" },
  { at: T.wings[0], name: "BUKA SAYAP" },
];
export function hudStep(t: number): { index: number; name: string; done: boolean } {
  if (t >= T.lift[0]) return { index: STEPS.length, name: "TERBANG", done: true };
  if (t >= T.wings[1] + 0.15) return { index: STEPS.length, name: "SELESAI · BANGAU", done: true };
  let i = 0;
  for (let k = 0; k < STEPS.length; k++) if (t >= STEPS[k].at - 0.05) i = k;
  return { index: i + 1, name: STEPS[i].name, done: false };
}
