// The flapping crane, folded from one square sheet with the rigid fold engine:
//   1 diagonal valley fold and unfold (pre-crease)      2–3 kite folds (edges to the diagonal)
//   4 fold in half along the diagonal                    5 stand it up on its spine
//   6 outside-reverse fold: tail                         7 outside-reverse fold: neck
//   8 outside-reverse fold: head                          9 wings fold out, then flap
// Sheet coordinates: a diamond with its diagonal A→B along x; C (z < 0) and D (z > 0) halves.
// After step 5 the body stands in the xy plane (spine on the mat, y up, layers stacked along z).

import * as THREE from "three";
import { buildFold, centroid, diamond, extent, type FoldModel, type Piece, type StepDef } from "./fold.ts";
import { T, fold, precreaseAngle, wingAngle, WING_REST } from "./motion.ts";

export const SHEET = 0.72; // side of the square sheet (world units)
export const THICK = 0.003; // paper slab, slightly exaggerated so folds read at 9:16
export const R = SHEET / Math.SQRT2;

const D = Math.PI / 180;
const isC = (p: Piece) => centroid(p).z < 0;
const movedBy = (p: Piece, ...steps: number[]) => p.moves.some((k) => steps.includes(k));
const dir = (deg: number): [number, number, number] => [Math.cos(deg * D), Math.sin(deg * D), 0];
/** In-plane normal of a crease at `deg` (xy plane) pointing toward `toward` from `from`. */
const normalToward = (deg: number, from: [number, number], toward: [number, number]): [number, number, number] => {
  const [ex, ey] = [Math.cos(deg * D), Math.sin(deg * D)];
  let m: [number, number, number] = [ey, -ex, 0];
  if (m[0] * (toward[0] - from[0]) + m[1] * (toward[1] - from[1]) < 0) m = [-ey, ex, 0];
  return m;
};

// Step indices (each def may add two steps: C layers, then D layers).
export const S = { pre: 0, kiteA: 1, kiteB: 2, half: 3, stand: 4, tailC: 5, tailD: 6, neckC: 7, neckD: 8, headC: 9, headD: 10, wingC: 11, wingD: 12 } as const;
const TAIL = [S.tailC, S.tailD], NECK = [S.neckC, S.neckD], HEAD = [S.headC, S.headD];
const body = (p: Piece) => !movedBy(p, ...TAIL, ...NECK, ...HEAD);
const Z: [number, number, number] = [0, 0, 1];

const Q: [number, number] = [-0.3 * R, 0]; // neck crease foot on the spine
const NECK_DEG = 145; // reflects the A tip from 180° to 110°
const TAILQ: [number, number] = [0.3 * R, 0];
const TAIL_DEG = 30; // reflects the B tip from 0° to 60°
const WING_Y = 0.13 * R;

const defs: StepDef[] = [
  () => ({ name: "pre", plane: { p: [0, 0, 0], m: [0, 0, -1] }, angle: 0, at: precreaseAngle, t0: T.precrease[0], kind: "valley" }),
  () => {
    const a = 22.5 * D;
    return { name: "kiteA", plane: { p: [-R, 0, 0], m: [-Math.sin(a), 0, -Math.cos(a)] }, angle: Math.PI, at: (t) => fold(t, T.kiteA, Math.PI), t0: T.kiteA[0], kind: "valley" };
  },
  () => {
    const a = 22.5 * D;
    return { name: "kiteB", plane: { p: [-R, 0, 0], m: [-Math.sin(a), 0, Math.cos(a)] }, angle: Math.PI, at: (t) => fold(t, T.kiteB, Math.PI), t0: T.kiteB[0], kind: "valley" };
  },
  () => ({ name: "half", plane: { p: [0, 0, 0], m: [0, 0, 1] }, angle: Math.PI, at: (t) => fold(t, T.half, Math.PI), t0: T.half[0], kind: "valley" }),
  () => ({ name: "stand", line: { p: [0, 0, 0], d: [1, 0, 0] }, pivot: "line", angle: Math.PI / 2, at: (t) => fold(t, T.stand, Math.PI / 2), t0: T.stand[0], kind: "turn" }),
  () => {
    const m = normalToward(TAIL_DEG, TAILQ, [R, 0]);
    const p: [number, number, number] = [TAILQ[0], TAILQ[1], 0];
    return [
      { name: "tailC", select: isC, plane: { p, m }, n: Z, angle: -Math.PI, stackOver: body, at: (t) => fold(t, T.tail, -Math.PI), t0: T.tail[0], kind: "reverse" },
      { name: "tailD", select: (q) => !isC(q), plane: { p, m }, n: Z, angle: Math.PI, stackOver: body, at: (t) => fold(t, T.tail, Math.PI), t0: T.tail[0], kind: "reverse" },
    ];
  },
  () => {
    const m = normalToward(NECK_DEG, Q, [-R, 0]);
    const p: [number, number, number] = [Q[0], Q[1], 0];
    const sel = (c: boolean) => (q: Piece) => isC(q) === c && !movedBy(q, ...TAIL);
    return [
      { name: "neckC", select: sel(true), plane: { p, m }, n: Z, angle: -Math.PI, stackOver: body, at: (t) => fold(t, T.neck, -Math.PI), t0: T.neck[0], kind: "reverse" },
      { name: "neckD", select: sel(false), plane: { p, m }, n: Z, angle: Math.PI, stackOver: body, at: (t) => fold(t, T.neck, Math.PI), t0: T.neck[0], kind: "reverse" },
    ];
  },
  () => {
    // where the neck tip is now: A reflected across the neck crease
    const u = dir(110);
    const H: [number, number, number] = [Q[0] + u[0] * 0.5 * R, Q[1] + u[1] * 0.5 * R, 0];
    const tip: [number, number] = [Q[0] + u[0] * 0.7 * R, Q[1] + u[1] * 0.7 * R];
    const m = normalToward(155, [H[0], H[1]], tip);
    const sel = (c: boolean) => (q: Piece) => isC(q) === c && movedBy(q, ...NECK);
    const neck = (q: Piece) => movedBy(q, ...NECK) && !movedBy(q, ...HEAD);
    return [
      { name: "headC", select: sel(true), plane: { p: H, m }, n: Z, angle: -Math.PI, stackOver: neck, at: (t) => fold(t, T.head, -Math.PI), t0: T.head[0], kind: "reverse" },
      { name: "headD", select: sel(false), plane: { p: H, m }, n: Z, angle: Math.PI, stackOver: neck, at: (t) => fold(t, T.head, Math.PI), t0: T.head[0], kind: "reverse" },
    ];
  },
  (model) => {
    const sel = (c: boolean) => (q: Piece) => isC(q) === c && body(q);
    // both wings hinge on the body's middle layer
    let lo = Infinity, hi = -Infinity;
    for (const q of model.pieces.filter(body)) {
      const [l, u] = extent(q, new THREE.Vector3(...Z), model.h);
      lo = Math.min(lo, l);
      hi = Math.max(hi, u);
    }
    const plane = { p: [0, WING_Y, (lo + hi) / 2] as [number, number, number], m: [0, 1, 0] as [number, number, number] };
    return [
      { name: "wingC", select: sel(true), plane, n: Z, pivot: "line", angle: -WING_REST, at: (t) => -wingAngle(t), t0: T.wings[0], kind: "open" },
      { name: "wingD", select: sel(false), plane, n: Z, pivot: "line", angle: WING_REST, at: (t) => wingAngle(t), t0: T.wings[0], kind: "open" },
    ];
  },
];

let cached: FoldModel | null = null;
/** The crane fold model (built once per render tab; deterministic). */
export function craneModel(): FoldModel {
  if (!cached) cached = buildFold(diamond(SHEET), defs, THICK);
  return cached;
}

/** A finished crane (every step complete, wings at rest), for props and the hanging strings. */
export const FINISHED_T = T.wings[1] + 0.001;

