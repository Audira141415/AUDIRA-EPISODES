// PLUSHFORGE motion: soft drops, stuffing squash, jiggle springs, hops, a wave, a hug, and the needle
// stitching the last seam. Everything is a closed-form pure function of film time t (seconds), so
// parallel render tabs agree on every frame. Plush moves smoothly (no stepped frames: that is FELTCRAFT).

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (k: number) => {
  const x = clamp01(k);
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const G = 6.2;

/** Times at which a toy dropped from height h at t0 touches down (first landing plus soft rebounds). */
export function dropImpacts(t0: number, h: number, e = 0.3, n = 3): number[] {
  const tf = Math.sqrt((2 * h) / G);
  const out = [t0 + tf];
  let v = G * tf * e, at = t0 + tf;
  for (let i = 1; i < n; i++) {
    at += (2 * v) / G;
    out.push(at);
    v *= e;
  }
  return out;
}

/** Height above rest for the same drop (closed form). */
export function dropHeight(t: number, t0: number, h: number, e = 0.3): number {
  const dt = t - t0;
  if (dt <= 0) return h;
  const tf = Math.sqrt((2 * h) / G);
  if (dt < tf) return h - 0.5 * G * dt * dt;
  let v = G * tf * e, start = tf;
  for (let n = 0; n < 6; n++) {
    const hopT = (2 * v) / G;
    if (dt < start + hopT) {
      const s = dt - start;
      return v * s - 0.5 * G * s * s;
    }
    start += hopT;
    v *= e;
  }
  return 0;
}

/** Damped spring response summed over events: amp × e^(−damp·Δ) × sin(2π·hz·Δ). */
export function spring(t: number, events: [number, number][], hz = 2.4, damp = 5): number {
  let v = 0;
  for (const [at, amp] of events) {
    const a = t - at;
    if (a >= 0 && a < 3) v += amp * Math.exp(-a * damp) * Math.sin(a * hz * Math.PI * 2);
  }
  return v;
}

/** Stuffing squash: + squashes (wide and short), − stretches. Returns [xz, y] keeping volume. */
export function squash(t: number, events: [number, number][], hz = 2.2, damp = 5.5): [number, number] {
  let s = 0;
  for (const [at, amp] of events) {
    const a = t - at;
    if (a >= 0 && a < 3) s += amp * Math.exp(-a * damp) * Math.cos(a * hz * Math.PI * 2);
  }
  const y = 1 - s;
  return [1 / Math.sqrt(y), y];
}

// --- Cast and beats ------------------------------------------------------------------------------
export type ToyCfg = { x: number; z: number; drop: number; h: number; hops: number[]; tumble: [number, number]; yaw0: number; side: 1 | -1 };
export const BEAR: ToyCfg = { x: -0.27, z: 0.1, drop: 0.0, h: 0.62, hops: [2.5, 3.4], tumble: [0.9, -0.5], yaw0: 0.18, side: -1 };
export const BUNNY: ToyCfg = { x: 0.29, z: 0.14, drop: 1.25, h: 0.8, hops: [2.95, 3.85], tumble: [-1.4, 0.7], yaw0: -0.2, side: 1 };
export const HOP = { h: 0.13, dur: 0.46 };
export const WAVE = { bear: [4.5, 6.3] as [number, number], bunny: [4.95, 6.45] as [number, number] };
export const HUG = { in0: 6.5, in1: 7.15, out0: 8.05, out1: 8.6 };
export const STITCH = { start: 8.85, every: 0.27, n: 6 };
export const STITCH_END = STITCH.start + STITCH.n * STITCH.every;
export const REVEAL = 10.55;

/** 0..1 hug pose (faces turned in, arms wrapped), and 0..1 side hug (sitting close, arm round). */
export const hugAt = (t: number) => smooth(seg(t, HUG.in0, HUG.in1)) - smooth(seg(t, HUG.out0, HUG.out1));
export const sideHugAt = (t: number) => smooth(seg(t, HUG.out0 + 0.1, HUG.out1 + 0.2));
const closeAt = (t: number) => smooth(seg(t, HUG.in0, HUG.in1));

const waveEnv = (t: number, [a, b]: [number, number]) => smooth(seg(t, a, a + 0.35)) * (1 - smooth(seg(t, b - 0.35, b)));

export type ToyState = {
  pos: [number, number, number];
  yaw: number;
  tilt: [number, number];
  squash: [number, number];
  /** Secondary jiggle (head lag, ear flop), signed. */
  jig: number;
  /** Arms: [rx, rz] for the left (−x) and right (+x) arm. */
  armL: [number, number];
  armR: [number, number];
  /** How hard the toy presses into the blanket (for the dent). */
  press: number;
  /** 0..1 waving (for ears and head tilt). */
  wave: number;
};

export function toyState(cfg: ToyCfg, t: number, isBear: boolean): ToyState {
  const lands = dropImpacts(cfg.drop, cfg.h);
  const land = lands[0];
  // Height: drop, then hops (each a parabola).
  let y = dropHeight(t, cfg.drop, cfg.h);
  const events: [number, number][] = lands.map((at, i) => [at, i === 0 ? 0.3 : 0.12 / i]);
  for (const a of cfg.hops) {
    const x = (t - a) / HOP.dur;
    if (x > 0 && x < 1) y += HOP.h * 4 * x * (1 - x);
    events.push([a - 0.12, 0.12]); // crouch before take-off
    events.push([a + 0.02, -0.16]); // stretch in the air
    events.push([a + HOP.dur, 0.2]); // land
  }
  // Hugging presses the stuffing a little.
  const hug = hugAt(t), side = sideHugAt(t), close = closeAt(t);
  const sq = squash(t, events);
  const jig = spring(t, events.map(([a, amp]) => [a, amp * 1.4] as [number, number]), 2.1, 4.2);
  // Tumble during the first fall, settling upright with a soft wobble.
  const fall = smooth(seg(t, cfg.drop, land));
  const wob = spring(t, [[land, 0.12]], 1.6, 3.5);
  const tiltX = (1 - fall) * cfg.tumble[0] + wob;
  let tiltZ = (1 - fall) * cfg.tumble[1] + wob * 0.6 * cfg.side;
  // Lean toward the partner in the hug, and rest on them in the side hug.
  tiltZ += (hug * 0.13 + side * 0.09) * cfg.side;
  const x = lerp(cfg.x, cfg.side * (isBear ? 0.155 : 0.15), close) + (side * 0.012 * cfg.side);
  const yaw = cfg.yaw0 * (1 - close) + (-cfg.side) * 0.62 * hug + (-cfg.side) * 0.12 * side;
  // Arms: hang slightly out and forward by default.
  const out = 0.38;
  let armL: [number, number] = [-0.25, -out];
  let armR: [number, number] = [-0.25, out];
  const w = waveEnv(t, isBear ? WAVE.bear : WAVE.bunny);
  const wa = Math.sin((t - (isBear ? WAVE.bear[0] : WAVE.bunny[0])) * Math.PI * 2 * 2.1);
  // Each toy waves with its outer arm (the bear's left, the bunny's right).
  if (isBear) armL = [lerp(-0.25, -0.15, w), -out - w * (2.0 + 0.38 * wa)];
  else armR = [lerp(-0.25, -0.15, w), out + w * (2.0 + 0.38 * wa)];
  // Hug: both arms forward and in, around the partner.
  armL = [lerp(armL[0], -1.25, hug), lerp(armL[1], -out + 0.85, hug)];
  armR = [lerp(armR[0], -1.25, hug), lerp(armR[1], out - 0.85, hug)];
  // Side hug: the inner arm goes round the partner's back.
  if (isBear) armR = [lerp(armR[0], 0.3, side), lerp(armR[1], 1.55, side)];
  else armL = [lerp(armL[0], 0.3, side), lerp(armL[1], -1.45, side)];
  // Breathing-like idle sway so a held toy never freezes.
  const idle = Math.sin(t * 2.1 + cfg.x * 9) * 0.012 * fall;
  const grounded = y < 0.01 ? 1 : Math.max(0, 1 - y / 0.04);
  return {
    pos: [x, Math.max(0, y), cfg.z + close * (isBear ? 0.02 : -0.02)],
    yaw,
    tilt: [tiltX + idle, tiltZ],
    squash: [sq[0] * (1 + hug * 0.03), sq[1] * (1 - hug * 0.02)],
    jig,
    armL,
    armR,
    press: grounded * (1 + Math.max(0, 1 - sq[1]) * 4),
    wave: w,
  };
}

// --- Needle and the last seam --------------------------------------------------------------------
/** Heart-patch parameter range still open, sewn shut by the needle: 6 stitches. */
export const GAP = { s0: 0.55, ds: 0.2, dash: 0.12 };

/** Stitch i is pulled tight between these times (grows from 0 to 1). */
export const stitchGrow = (i: number, t: number) =>
  smooth(seg(t, STITCH.start + (i + 0.45) * STITCH.every, STITCH.start + (i + 0.85) * STITCH.every));
/** Number of stitches finished (HUD counter 0..6). */
export const stitchesDone = (t: number) => {
  let n = 0;
  for (let i = 0; i < STITCH.n; i++) if (stitchGrow(i, t) > 0.6) n++;
  return n;
};

/**
 * Needle on the heart patch: parameter s along the outline where the tip is, its height above the
 * felt (negative = through it), and how present the needle is (flies in before, away after).
 */
export function needleAt(t: number) {
  const p = (t - STITCH.start) / STITCH.every;
  const k = Math.min(STITCH.n - 1, Math.max(0, Math.floor(p)));
  const ph = clamp01(p - k);
  const sA = GAP.s0 + k * GAP.ds;
  const sB = sA + GAP.dash;
  const sNext = sA + GAP.ds;
  let s: number, h: number;
  if (p < 0) {
    s = GAP.s0;
    h = 0.05 - p * 0.2;
  } else if (p >= STITCH.n) {
    s = GAP.s0 + STITCH.n * GAP.ds;
    h = 0.05 + (p - STITCH.n) * 0.25;
  } else if (ph < 0.4) {
    s = lerp(sA + 0.02, sB, ph / 0.4);
    h = lerp(0.05, -0.012, smooth(ph / 0.4));
  } else if (ph < 0.6) {
    s = lerp(sB, sNext, (ph - 0.4) / 0.2);
    h = -0.012 + 0.012 * smooth((ph - 0.4) / 0.2);
  } else {
    s = sNext;
    h = 0.05 * smooth((ph - 0.6) / 0.4);
  }
  const present = smooth(seg(t, STITCH.start - 0.6, STITCH.start - 0.1)) * (1 - smooth(seg(t, STITCH_END + 0.15, STITCH_END + 0.7)));
  return { s, h, present, k, ph };
}

/** Stage label for the HUD. */
export function stageAt(t: number): string {
  if (t < 2.3) return "MENDARAT";
  if (t < 4.45) return "MEMANTUL";
  if (t < HUG.in0) return "MELAMBAI";
  if (t < STITCH.start - 0.2) return "BERPELUKAN";
  if (t < STITCH_END + 0.2) return "MENJAHIT";
  return "SIAP DIPELUK";
}
