// RAJUTFORGE timing and placement. Everything is a pure function of film time t (seconds), so
// parallel render tabs agree frame for frame.
//
//   0.0–2.6   close-up: the hook works the head's open rim, stitch by stitch, the head turns
//   2.6–6.0   time-lapse: rounds race up the head (PUTARAN 7 → 20) and the crown closes
//   6.0–7.0   assembly: ears, safety eyes, nose, cheeks pop on; the hook travels to the label
//   7.0–9.45  the hook surface-crochets AUDIRA in teal yarn cord on a cream crocheted label
//   9.45–12   the hook is laid down; the cat tilts its head and waves (three-quarter reveal)

import { glyphStrokes, strokeAt, strokeLength, type Stroke } from "../lib/letters.ts";

export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => k * k * (3 - 2 * k);
export const smoother = (k: number) => k * k * k * (k * (k * 6 - 15) + 10);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3, s = 1): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
export const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** Springy pop 0 → 1 with one overshoot, starting at t0. */
export const pop = (t: number, t0: number, dur = 0.45) => {
  const u = (t - t0) / dur;
  if (u <= 0) return 0;
  return 1 - Math.exp(-u * 6) * Math.cos(u * 9);
};

// --- The amigurumi cat -------------------------------------------------------------------------
export const BODY = { center: [0, 0.29, 0] as V3, radii: [0.34, 0.31, 0.32] as V3, rounds: 22, sts: 52 };
export const HEAD = { center: [0, 0.84, 0.02] as V3, r: 0.3, scale: [1.08, 0.92, 1.0] as V3, rounds: 20, sts: 44 };

// --- Growth of the head (rounds, from the neck up) ----------------------------------------------
export const GROW = { p0: 7, slowEnd: 2.6, pSlow: 8.6, end: 6.0 };
/** Rounds completed (float). The spiral front is at floor(P) + stitch / sts. */
export function rounds(t: number): number {
  if (t <= GROW.slowEnd) return lerp(GROW.p0, GROW.pSlow, clamp01(t / GROW.slowEnd));
  const k = seg(t, GROW.slowEnd, GROW.end);
  // keep the slow rate's slope at the seam, accelerate, then ease into the closing round
  const e = smooth(k);
  return lerp(GROW.pSlow, HEAD.rounds, 0.15 * k + 0.85 * e);
}
/** World angle (atan2(x, z)) the hook works at. */
export const WORK_AZ = (22 * Math.PI) / 180;
/** Head shell yaw: turns the working stitch to the hook while slow, then a gentle turntable. */
export function headYaw(t: number): number {
  const P = Math.min(rounds(t), GROW.pSlow);
  const extra = Math.max(0, Math.min(t, GROW.end) - GROW.slowEnd) * 0.9;
  // SphereGeometry puts u = φ/2π at world azimuth φ − π/2; yaw ψ adds to azimuth.
  return WORK_AZ + Math.PI / 2 - 2 * Math.PI * (P - GROW.p0) - extra;
}

/** A point on the head ellipsoid at height fraction g (0 = neck pole, 1 = crown) and world azimuth. */
export function headPoint(g: number, az: number, out = 0): V3 {
  const th = (1 - clamp01(g)) * Math.PI; // from the crown
  const n: V3 = [Math.sin(az) * Math.sin(th), Math.cos(th), Math.cos(az) * Math.sin(th)];
  const r = HEAD.r + out;
  return [HEAD.center[0] + n[0] * r * HEAD.scale[0], HEAD.center[1] + n[1] * r * HEAD.scale[1], HEAD.center[2] + n[2] * r * HEAD.scale[2]];
}
export const CROWN: V3 = headPoint(1, 0, 0.004);

// --- Assembly pops --------------------------------------------------------------------------------
export const PARTS = { earL: 6.12, earR: 6.22, eyeL: 6.3, eyeR: 6.36, nose: 6.44, cheeks: 6.52, muzzle: 6.06 };
/** Life after assembly: head tilt, a wave, tail sway, breathing. */
export function catLife(t: number) {
  const tilt = 0.16 * smooth(seg(t, 9.9, 10.6)) - 0.05 * smooth(seg(t, 11.3, 12));
  const waveK = seg(t, 10.1, 11.7);
  const wave = Math.sin(waveK * Math.PI) * (1.9 + 0.35 * Math.sin(t * 15) * Math.sin(waveK * Math.PI));
  const tail = Math.sin(t * 1.6) * 0.22 + Math.sin(t * 0.7) * 0.08;
  const breathe = 1 + Math.sin(t * Math.PI * 2 * 0.3) * 0.012;
  return { tilt, wave, tail, breathe };
}

// --- Yarn balls -----------------------------------------------------------------------------------
export const BALL_OYEN = { pos: [-0.72, 0, 0.42] as V3, r: 0.15 };
export const BALL_TEAL = { pos: [1.5, 0, 0.55] as V3, r: 0.14 };
/** The ginger ball turns (and creeps toward the cat) as yarn is pulled off it. */
export function oyenBall(t: number) {
  const used = rounds(t) - GROW.p0;
  const s = 1 - 0.1 * clamp01(used / (HEAD.rounds - GROW.p0));
  const r = BALL_OYEN.r * s;
  const creep = used * 0.006;
  return { pos: [BALL_OYEN.pos[0] + creep, r, BALL_OYEN.pos[2]] as V3, r, spin: used * 2.1 };
}
export function tealBall(t: number) {
  const used = letterDone(t);
  const r = BALL_TEAL.r * (1 - 0.06 * used);
  return { pos: [BALL_TEAL.pos[0] - used * 0.05, r, BALL_TEAL.pos[2]] as V3, r, spin: used * 9 };
}

// --- The label and the yarn letters -----------------------------------------------------------------
export const WORD = "AUDIRA";
export const LABEL = { pos: [0.38, 0.23, 1.02] as V3, yaw: 0.24, w: 1.16, h: 0.4, d: 0.06, cap: 0.2, pitch: 0.17, cord: 0.017 };
export const LETTERS = { start: 7.0, end: 9.45, gap: 0.07 };

type Piece = { letter: number; stroke: number; s: Stroke; L: number; t0: number; t1: number };
export const PIECES: Piece[] = (() => {
  const raw: Omit<Piece, "t0" | "t1">[] = [];
  WORD.split("").forEach((ch, li) => glyphStrokes(ch).forEach((s, si) => raw.push({ letter: li, stroke: si, s, L: strokeLength(s) })));
  const total = raw.reduce((a, p) => a + p.L, 0);
  const span = LETTERS.end - LETTERS.start - LETTERS.gap * (raw.length - 1);
  let t = LETTERS.start;
  return raw.map((p) => {
    const d = (p.L / total) * span;
    const out = { ...p, t0: t, t1: t + d };
    t += d + LETTERS.gap;
    return out;
  });
})();
export const pieceK = (p: Piece, t: number) => seg(t, p.t0, p.t1);
/** 0..1 overall letter progress. */
export const letterDone = (t: number) => seg(t, LETTERS.start, LETTERS.end);
/** Letters started so far (for the HUD). */
export const lettersStarted = (t: number) => (t < LETTERS.start ? 0 : Math.min(WORD.length, 1 + Math.max(...PIECES.filter((p) => p.t0 <= t).map((p) => p.letter))));

/** Label-local point (x right, y up, z out of the face) of a unit-box glyph coordinate. */
export function letterLocal(letter: number, u: number, v: number, lift = 0): V3 {
  const span = LABEL.pitch * (WORD.length - 1) + 0.8 * LABEL.cap;
  const x0 = -span / 2 + letter * LABEL.pitch;
  return [x0 + u * LABEL.cap, -LABEL.cap / 2 + v * LABEL.cap, LABEL.d / 2 + LABEL.cord * 0.55 + lift];
}
const cy = Math.cos(LABEL.yaw), sy = Math.sin(LABEL.yaw);
export const labelToWorld = (p: V3): V3 => [LABEL.pos[0] + p[0] * cy + p[2] * sy, LABEL.pos[1] + p[1], LABEL.pos[2] - p[0] * sy + p[2] * cy];
export const LABEL_N: V3 = [sy, 0, cy];
export const LABEL_X: V3 = [cy, 0, -sy];

/** Where the hook's tip is on the label at time t (label-local), and whether it is lifted between strokes. */
function letterTip(t: number): V3 {
  for (let i = 0; i < PIECES.length; i++) {
    const p = PIECES[i];
    if (t <= p.t1 || i === PIECES.length - 1) {
      if (t >= p.t0) {
        const [u, v] = strokeAt(p.s, pieceK(p, t));
        return letterLocal(p.letter, u, v);
      }
      // travelling from the previous stroke's end, lifted
      const prev = PIECES[i - 1];
      const a = prev ? letterLocal(prev.letter, ...prev.s[prev.s.length - 1]) : letterLocal(p.letter, ...p.s[0], 0.25);
      const b = letterLocal(p.letter, ...p.s[0]);
      const k = prev ? seg(t, prev.t1, p.t0) : 1;
      const m = lerp3(a, b, smooth(k));
      return [m[0], m[1], m[2] + Math.sin(k * Math.PI) * 0.05];
    }
  }
  const last = PIECES[PIECES.length - 1];
  return letterLocal(last.letter, ...last.s[last.s.length - 1]);
}

// --- The hook ---------------------------------------------------------------------------------------
export type HookPose = { tip: V3; dir: V3; twist: number; yarn: "oyen" | "teal" };
const UP: V3 = [0, 1, 0];
const HOOK_REST = { tip: [0.95, 0.05, 1.42] as V3, dir: norm([1, 0.05, 0.12]) };
const headDir = (): V3 => {
  const right: V3 = [Math.cos(WORK_AZ), 0, -Math.sin(WORK_AZ)];
  const out: V3 = [Math.sin(WORK_AZ), 0, Math.cos(WORK_AZ)];
  return norm(add(add(add([0, 0, 0], right, 0.78), UP, 0.58), out, 0.3));
};
const labelDir = (): V3 => norm(add(add(add([0, 0, 0], LABEL_N, 0.55), UP, 0.62), LABEL_X, 0.45));

/** Hook dip: in and out of the stitch three times a second, with a yarn-over twist. */
const dipAt = (t: number) => Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 3.1)), 2);

function headTip(t: number): V3 {
  const P = rounds(t);
  const g = Math.max(0, (P - 0.45) / HEAD.rounds);
  const rim = headPoint(g, WORK_AZ, 0.012);
  const d = headDir();
  return add(rim, d, 0.02 * (1 - dipAt(t)));
}
const labelTip = (t: number): V3 => add(labelToWorld(letterTip(t)), labelDir(), 0.012 * (1 - dipAt(t)));

export function hookPose(t: number): HookPose {
  const twist = Math.sin(t * Math.PI * 2 * 3.1) * 0.5;
  if (t < GROW.end) return { tip: headTip(t), dir: headDir(), twist, yarn: "oyen" };
  if (t < LETTERS.start) {
    const k = smoother(seg(t, GROW.end, LETTERS.start));
    const a = headTip(GROW.end), b = labelTip(LETTERS.start);
    // a wide arc up and out to the right, so the hook never crosses the cat's face
    const w: V3 = [0.95, 1.45, 0.25];
    const tip = lerp3(lerp3(a, w, k), lerp3(w, b, k), k);
    return { tip, dir: norm(lerp3(headDir(), labelDir(), k)), twist: twist * 0.3, yarn: k < 0.5 ? "oyen" : "teal" };
  }
  if (t < LETTERS.end + 0.02) return { tip: labelTip(t), dir: labelDir(), twist, yarn: "teal" };
  const k = smoother(seg(t, LETTERS.end + 0.02, 10.5));
  const a = labelTip(LETTERS.end);
  const tip = add(lerp3(a, HOOK_REST.tip, k), UP, Math.sin(k * Math.PI) * 0.22);
  return { tip, dir: norm(lerp3(labelDir(), HOOK_REST.dir, k)), twist: 0, yarn: "teal" };
}
/** The working loop sits a little up the shaft: the strand leaves the hook here. */
export const hookLoop = (h: HookPose): V3 => add(h.tip, h.dir, 0.1);

// --- HUD --------------------------------------------------------------------------------------------
export function hudState(t: number): { stage: string; count: string; k: number } {
  if (t < GROW.end) {
    const P = rounds(t);
    return { stage: "PUTARAN", count: `${Math.min(HEAD.rounds, Math.floor(P))}/${HEAD.rounds}`, k: P / HEAD.rounds };
  }
  if (t < LETTERS.start) return { stage: "MERAKIT", count: "TELINGA · MATA", k: seg(t, GROW.end, LETTERS.start) };
  if (t < LETTERS.end) return { stage: "HURUF", count: `${lettersStarted(t)}/${WORD.length}`, k: letterDone(t) };
  return { stage: "SELESAI", count: "AMIGURUMI", k: 1 };
}
