// CHAINREACTION engine: one tabletop Rube Goldberg machine, built as a vertical tower so it
// reads in 9:16. Every moving part is a pure function of machine time `m` (seconds since the
// first marble starts rolling):
//
//   red marble down a chute → 9 dominoes along a shelf → steel ball rolls off the shelf →
//   three zig-zag ramps (real gravity, rolling, bounces) → lands on a see-saw → brass ball is
//   catapulted into a hanging bucket → bucket drops, rope over a pulley hoists the AUDIRA flag.
//
// The ball's path is simulated once at module load with a fixed step (deterministic: same code,
// same numbers, every render tab). Domino, see-saw, bucket and flag timings follow from the
// simulated contacts, so cause always precedes effect. Film time maps to machine time through
// `machineTime(t, timing)`; use `fitChain` to land two chosen events on VO seconds.
//
// Units are metres on a large workbench; y is up, the machine runs in the x–y plane at z = 0.

export const G = 9.81;

// ---------------------------------------------------------------- layout
export const SHELF_Y = 2.4;
export const SHELF = { x0: -1.12, x1: 0.84, y: SHELF_Y, depth: 0.32 };

export const DOMINO = { n: 9, h: 0.26, w: 0.04, d: 0.13, depth: 0.13, x0: 0.62 };
/** Domino i stands with its centre at x = x0 − i·d and falls toward −x. */
export const dominoX = (i: number) => DOMINO.x0 - i * DOMINO.d;

export const MARBLE_R = 0.04;
export const BALL_R = 0.045;
export const BRASS_R = 0.04;

export type Seg = { a: [number, number]; b: [number, number]; closedStart?: boolean };
export type Wall = { x: number; y0: number; y1: number; side: 1 | -1 };

export const CHUTE: Seg = { a: [1.2, 2.82], b: [0.84, SHELF_Y] };
export const RAMPS: Seg[] = [
  { a: [-1.22, 2.18], b: [0.4, 1.8], closedStart: true },
  { a: [0.72, 1.5], b: [-0.9, 1.12], closedStart: true },
  { a: [-1.22, 0.9], b: [0.0, 0.58], closedStart: true },
];
/** End stops at the high end of each ramp (the ball bounces off them). */
export const WALLS: Wall[] = [
  { x: -1.25, y0: 2.18, y1: 2.44, side: 1 },
  { x: 0.75, y0: 1.5, y1: 1.76, side: -1 },
  { x: -1.25, y0: 0.9, y1: 1.16, side: 1 },
];

export const SEESAW = { px: 0.74, py: 0.19, half: 0.46, tilt: 0.24, thick: 0.035 };
export const PULLEY = { x: 1.41, y: 2.12, r: 0.09, postX: 1.56 };
export const BUCKET = { x: PULLEY.x - PULLEY.r, mouthY: 1.05, h: 0.17, r: 0.085, drop: 0.82 };
export const FLAG = { x: PULLEY.x + PULLEY.r, y0: 0.98 };

// ---------------------------------------------------------------- ball simulation
type Sample = { m: number; x: number; y: number; rot: number };
type Ev = { name: string; m: number; x: number; y: number };

const unit = (s: Seg) => {
  const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], len = Math.hypot(dx, dy);
  const dir: [number, number] = [dx / len, dy / len];
  let n: [number, number] = [-dir[1], dir[0]];
  if (n[1] < 0) n = [-n[0], -n[1]];
  return { len, dir, n };
};

/**
 * Fixed-step ball on segments: rolls with a = g·sinθ·5/7 (solid sphere), flies as a projectile,
 * lands keeping 82 % of its tangential speed, bounces off end walls. Stops when `stop` says so.
 */
function simulate(opt: {
  r: number;
  floors: Seg[];
  walls: Wall[];
  start: { seg: number; s: number; v: number } | { x: number; y: number; vx: number; vy: number };
  m0: number;
  stop: (x: number, y: number, vx: number, vy: number) => string | null;
  label: string;
}) {
  const dt = 1 / 1200, out: Sample[] = [], ev: Ev[] = [];
  const geo = opt.floors.map(unit);
  let mode: "roll" | "air" = "seg" in opt.start ? "roll" : "air";
  let k = "seg" in opt.start ? opt.start.seg : -1;
  let s = "seg" in opt.start ? opt.start.s : 0, v = "seg" in opt.start ? opt.start.v : 0;
  let x = 0, y = 0, vx = 0, vy = 0, rot = 0, left = -1, leftAt = -1;
  if (!("seg" in opt.start)) ({ x, y, vx, vy } = opt.start);
  const place = () => {
    const f = opt.floors[k], g = geo[k];
    x = f.a[0] + g.dir[0] * s + g.n[0] * opt.r;
    y = f.a[1] + g.dir[1] * s + g.n[1] * opt.r;
    vx = g.dir[0] * v;
    vy = g.dir[1] * v;
  };
  if (mode === "roll") place();
  let m = opt.m0, stopped: string | null = null;
  for (let step = 0; step < 1200 * 12 && !stopped; step++) {
    const px = x;
    if (mode === "roll") {
      const f = opt.floors[k], g = geo[k];
      v += -G * g.dir[1] * (5 / 7) * dt;
      s += v * dt;
      if (s < 0 && f.closedStart) { s = 0; v = -v * 0.3; }
      if (s > g.len || s < 0) {
        place();
        mode = "air"; left = k; leftAt = m;
        ev.push({ name: `${opt.label}:leave${k}`, m, x, y });
      } else place();
    } else {
      vy -= G * dt;
      x += vx * dt;
      y += vy * dt;
      for (const w of opt.walls) {
        if (y < w.y0 || y > w.y1) continue;
        if (w.side === 1 && x - opt.r < w.x && vx < 0) { x = w.x + opt.r; vx = -vx * 0.35; ev.push({ name: `${opt.label}:wall`, m, x, y }); }
        if (w.side === -1 && x + opt.r > w.x && vx > 0) { x = w.x - opt.r; vx = -vx * 0.35; ev.push({ name: `${opt.label}:wall`, m, x, y }); }
      }
      for (let j = 0; j < opt.floors.length; j++) {
        if (j === left && m - leftAt < 0.06) continue;
        const f = opt.floors[j], g = geo[j];
        const qx = x - f.a[0], qy = y - f.a[1];
        const along = qx * g.dir[0] + qy * g.dir[1], dist = qx * g.n[0] + qy * g.n[1] - opt.r;
        // land only when the ball has just crossed the top surface (not from far below it)
        if (along >= 0 && along <= g.len && dist <= 0 && dist > -opt.r && vx * g.n[0] + vy * g.n[1] < 0) {
          mode = "roll"; k = j; s = along;
          v = (vx * g.dir[0] + vy * g.dir[1]) * 0.82;
          place();
          ev.push({ name: `${opt.label}:land${j}`, m, x, y });
          break;
        }
      }
    }
    rot -= (x - px) / opt.r;
    m += dt;
    stopped = opt.stop(x, y, vx, vy);
    if (step % 10 === 0 || stopped) out.push({ m, x, y, rot });
  }
  return { samples: out, events: ev, end: { m, x, y, vx, vy, rot }, reason: stopped };
}

// 1) red marble: chute → shelf → touches domino 0
const shelfSeg: Seg = { a: [0.84, SHELF_Y], b: [SHELF.x0, SHELF_Y] };
const D0_FACE = dominoX(0) + DOMINO.w / 2;
const marble = simulate({
  r: MARBLE_R,
  floors: [CHUTE, shelfSeg],
  walls: [],
  start: { seg: 0, s: 0.0, v: 0.05 },
  m0: 0,
  stop: (x) => (x - MARBLE_R <= D0_FACE ? "domino0" : null),
  label: "marble",
});

// 2) dominoes: wave of contacts. Each tips to the contact angle in TC, then leans to rest.
export const TC = 0.105; // time for one domino to reach the next (≈ 1.2 m/s wave)
const T_REST = 0.22;
const PHI_C = Math.asin((DOMINO.d - DOMINO.w) / DOMINO.h); // first contact with the next one
const ALPHA = Math.acos(DOMINO.w / DOMINO.d); // resting lean on the next one
const T_LAST = 0.3; // last domino falls flat
const PUSH_FRAC = 0.62; // the last domino's top meets the ball at h·0.62 forward
export const DOMINO_START = marble.end.m;
const lastStart = DOMINO_START + (DOMINO.n - 1) * TC;
const pushTau = T_LAST * Math.sqrt(Math.asin(PUSH_FRAC) / (Math.PI / 2));
const PUSH_M = lastStart + pushTau;

/** Fall angle (radians, toward −x) of domino i at machine time m. */
export function dominoAngle(i: number, m: number) {
  const st = DOMINO_START + i * TC, tau = m - st;
  if (tau <= 0) return 0;
  if (i === DOMINO.n - 1) return Math.min(Math.PI / 2, (Math.PI / 2) * (tau / T_LAST) ** 2);
  if (tau < TC) return PHI_C * (tau / TC) ** 2;
  const u = Math.min(1, (tau - TC) / T_REST);
  return PHI_C + (ALPHA - PHI_C) * (1 - (1 - u) ** 3);
}

// 3) steel ball: pushed off its rest spot, rolls the shelf, the three ramps, lands on the see-saw
export const BALL_REST_X = dominoX(DOMINO.n - 1) - DOMINO.w / 2 - DOMINO.h * PUSH_FRAC - BALL_R;
const seesawSurfaceY = (x: number) => SEESAW.py + SEESAW.thick / 2 + (SEESAW.px - x) * Math.sin(SEESAW.tilt);
const shelfForBall: Seg = { a: [BALL_REST_X + BALL_R, SHELF_Y], b: [SHELF.x0, SHELF_Y] };
const ball = simulate({
  r: BALL_R,
  floors: [shelfForBall, ...RAMPS],
  walls: WALLS,
  start: { seg: 0, s: 0, v: 0.62 },
  m0: PUSH_M,
  stop: (x, y) =>
    x > SEESAW.px - SEESAW.half && x < SEESAW.px + SEESAW.half && y - BALL_R <= seesawSurfaceY(x) && y < 0.6 ? "seesaw" : null,
  label: "ball",
});
export const SEESAW_HIT = ball.end.m;
const SEESAW_SWING = 0.17;
export const LAUNCH_M = SEESAW_HIT + SEESAW_SWING * 0.8;

/** See-saw tilt (radians, + = left end up) at machine time m. */
export function seesawTilt(m: number) {
  const a = m - SEESAW_HIT;
  if (a <= 0) return SEESAW.tilt;
  if (a < SEESAW_SWING) return SEESAW.tilt - 2 * SEESAW.tilt * (a / SEESAW_SWING) ** 2;
  const b = a - SEESAW_SWING;
  return -SEESAW.tilt + Math.sin(b * 26) * Math.exp(-b * 9) * 0.035;
}

// 4) brass ball: rests on the low right end, catapulted into the bucket mouth
const brassStart = (): [number, number] => {
  const ex = SEESAW.px + (SEESAW.half - 0.07) * Math.cos(SEESAW.tilt);
  return [ex, SEESAW.py + SEESAW.thick / 2 - (SEESAW.half - 0.07) * Math.sin(SEESAW.tilt) + BRASS_R];
};
export const BRASS_REST = brassStart();
const FLIGHT = 0.58;
const brassTarget: [number, number] = [BUCKET.x, BUCKET.mouthY + 0.02];
const brassLaunchPos = (): [number, number] => {
  const ex = SEESAW.px + (SEESAW.half - 0.07) * Math.cos(-SEESAW.tilt * 0.6);
  return [ex, SEESAW.py + SEESAW.thick / 2 + (SEESAW.half - 0.07) * Math.sin(SEESAW.tilt * 0.6) + BRASS_R];
};
const BL = brassLaunchPos();
const bvx = (brassTarget[0] - BL[0]) / FLIGHT, bvy = (brassTarget[1] - BL[1] + 0.5 * G * FLIGHT * FLIGHT) / FLIGHT;
export const BUCKET_LAND = LAUNCH_M + FLIGHT;

/** Brass ball centre at machine time m (rides the see-saw, flies, then sits in the bucket). */
export function brassPos(m: number): [number, number] {
  if (m < SEESAW_HIT) return BRASS_REST;
  if (m < LAUNCH_M) {
    const tl = seesawTilt(m), arm = SEESAW.half - 0.07;
    return [SEESAW.px + arm * Math.cos(tl), SEESAW.py + SEESAW.thick / 2 - arm * Math.sin(tl) + BRASS_R];
  }
  if (m < BUCKET_LAND) {
    const a = m - LAUNCH_M;
    return [BL[0] + bvx * a, BL[1] + bvy * a - 0.5 * G * a * a];
  }
  return [BUCKET.x, BUCKET.mouthY - BUCKET.h + BRASS_R + 0.01 - bucketDrop(m)];
}

// 5) bucket drop and flag hoist (rope over the pulley: same distance, opposite way)
const DROP_A = 2.1;
const T_DROP = Math.sqrt((2 * BUCKET.drop) / DROP_A);
export const FLAG_UP = BUCKET_LAND + T_DROP;

export function bucketDrop(m: number) {
  const a = m - BUCKET_LAND;
  if (a <= 0) return 0;
  if (a < T_DROP) return 0.5 * DROP_A * a * a;
  const b = a - T_DROP;
  return BUCKET.drop - Math.abs(Math.sin(b * 14)) * Math.exp(-b * 7) * 0.03;
}
/** Flag carriage height: rises exactly as far as the bucket falls. */
export const flagY = (m: number) => FLAG.y0 + bucketDrop(m);
/** Pulley wheel angle (radians). */
export const pulleyAngle = (m: number) => -bucketDrop(m) / PULLEY.r;
/** Bucket swing when the ball lands in it. */
export const bucketSwing = (m: number) => {
  const a = m - BUCKET_LAND;
  return a > 0 ? Math.sin(a * 11) * Math.exp(-a * 3.2) * 0.12 : 0;
};

// ---------------------------------------------------------------- sampling helpers
const sampleAt = (list: Sample[], m: number): Sample => {
  if (m <= list[0].m) return list[0];
  if (m >= list[list.length - 1].m) return list[list.length - 1];
  let lo = 0, hi = list.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (list[mid].m <= m) lo = mid; else hi = mid; }
  const a = list[lo], b = list[hi], u = (m - a.m) / (b.m - a.m);
  return { m, x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, rot: a.rot + (b.rot - a.rot) * u };
};

/** Red marble centre + roll angle. It stops against domino 0 and rocks back a little. */
export function marbleState(m: number) {
  const s = sampleAt(marble.samples, m);
  const back = m > DOMINO_START ? Math.min(0.03, (m - DOMINO_START) * 0.2) * Math.exp(-(m - DOMINO_START) * 2) : 0;
  return { x: s.x + back, y: s.y, rot: s.rot };
}

/** Steel ball centre + roll angle; after the see-saw hit it rides the plank down. */
export function ballState(m: number) {
  if (m < PUSH_M) return { x: BALL_REST_X, y: SHELF_Y + BALL_R, rot: 0 };
  if (m <= SEESAW_HIT) return sampleAt(ball.samples, m);
  const tl = seesawTilt(m), arm = SEESAW.px - ball.end.x;
  return { x: SEESAW.px - arm * Math.cos(tl), y: SEESAW.py + SEESAW.thick / 2 + arm * Math.sin(tl) + BALL_R, rot: ball.end.rot };
}

/** Points of the steel ball's whole route (for the reveal trail). */
export const BALL_ROUTE = ball.samples.filter((_, i) => i % 6 === 0).map((s) => ({ m: s.m, x: s.x, y: s.y }));

// ---------------------------------------------------------------- events and timing
export type ChainEvent = { name: string; m: number; x: number; y: number; label: string };

/** Story beats in machine time, in causal order. Use these names with `fitChain`. */
export const EVENTS: ChainEvent[] = [
  { name: "start", m: 0, x: CHUTE.a[0], y: CHUTE.a[1], label: "KELERENG" },
  { name: "dominoes", m: DOMINO_START, x: dominoX(0), y: SHELF_Y + 0.13, label: "DOMINO" },
  { name: "push", m: PUSH_M, x: BALL_REST_X, y: SHELF_Y, label: "BOLA BAJA" },
  ...ball.events.filter((e) => e.name.startsWith("ball:land")).map((e, i) => ({ name: `ramp${i + 1}`, m: e.m, x: e.x, y: e.y, label: `RAMPA ${i + 1}` })),
  { name: "seesaw", m: SEESAW_HIT, x: ball.end.x, y: ball.end.y, label: "JUNGKAT-JUNGKIT" },
  { name: "launch", m: LAUNCH_M, x: BL[0], y: BL[1], label: "KATAPEL" },
  { name: "bucket", m: BUCKET_LAND, x: BUCKET.x, y: BUCKET.mouthY, label: "EMBER" },
  { name: "flag", m: FLAG_UP, x: FLAG.x, y: FLAG.y0 + BUCKET.drop, label: "BENDERA" },
];
export const eventM = (name: string) => {
  const e = EVENTS.find((x) => x.name === name);
  if (!e) throw new Error(`chain event "${name}" not found (have: ${EVENTS.map((x) => x.name).join(", ")})`);
  return e.m;
};

/** Film-time placement: machine starts at `start` film seconds and runs `scale`× slower than real. */
export type ChainTiming = { start: number; scale: number };
export const machineTime = (t: number, tm: ChainTiming) => (t - tm.start) / tm.scale;
export const filmTime = (m: number, tm: ChainTiming) => tm.start + m * tm.scale;

/**
 * Land two events on two VO seconds (Audio Master Clock), e.g.
 *   fitChain({ event: "dominoes", at: 1.2 }, { event: "flag", at: 9.8 })
 * Physics only allows a uniform slow-down, so the scale is clamped to 0.8–2.2 (outside that the
 * machine looks fake): if clamped, the second event lands off its cue and `drift` says by how much.
 */
export function fitChain(a: { event: string; at: number }, b: { event: string; at: number }) {
  const ma = eventM(a.event), mb = eventM(b.event);
  const raw = (b.at - a.at) / (mb - ma);
  const scale = Math.min(2.2, Math.max(0.8, raw));
  const start = a.at - ma * scale;
  return { start, scale, drift: +(start + mb * scale - b.at).toFixed(3) };
}

/** Where the action is at machine time m (camera follow target). */
export function actionPoint(m: number): [number, number, number] {
  if (m < DOMINO_START) { const s = marbleState(m); return [s.x, s.y, 0]; }
  if (m < PUSH_M) {
    const i = Math.min(DOMINO.n - 1, (m - DOMINO_START) / TC);
    return [dominoX(i), SHELF_Y + DOMINO.h * 0.45, 0];
  }
  if (m < SEESAW_HIT + 0.05) { const s = ballState(m); return [s.x, s.y, 0]; }
  if (m < BUCKET_LAND) { const p = brassPos(m); return [p[0], p[1], 0]; }
  // bucket drop pulls the eye down, the rising banner pulls it back up and right
  const fy = flagY(m), u = Math.min(1, Math.max(0, (m - BUCKET_LAND) / (FLAG_UP - BUCKET_LAND)));
  const bucketPt: [number, number] = [BUCKET.x + 0.1, BUCKET.mouthY - bucketDrop(m)];
  const bannerPt: [number, number] = [PULLEY.postX + 0.3, fy - 0.08];
  const w = u * u * (3 - 2 * u);
  return [bucketPt[0] + (bannerPt[0] - bucketPt[0]) * w, bucketPt[1] + (bannerPt[1] - bucketPt[1]) * w, 0];
}

/** Machine-time length of the whole run including a short hold on the raised flag. */
export const MACHINE_END = FLAG_UP + 0.6;
