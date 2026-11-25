// Athlete poses for ToyPerson (core/polish/Person.tsx), shared by every sport.
//
// Two kinds of action:
//   cyclic   ("run", "sprint", "dribble", "jog", "ready", "keeperReady", "defend", "celebrate")
//            loop on the 60 fps film clock f; move the figure yourself at ACTION_SPEED units/s.
//   one-shot ("kick", "jumpShot", "spike", "smash", "serve", "keeperDive")
//            play once as u goes 0 → 1; the contact frame is ACTION_CONTACT[action].
//
// The lower foot stays on the ground automatically (legReach); `air` lifts the whole figure for
// jumps. `side` mirrors an action: kick with the left foot, dive to the right, left-handed serve.
// Angle conventions are Person.tsx's: x < 0 swings a limb forward, knees bend positive.

import { LEG_LENGTH, legReach, type Pose } from "../polish/Person.tsx";
import { lifeMotion } from "../polish/Polish.tsx";

type V3 = [number, number, number];

export type CyclicAction = "run" | "sprint" | "dribble" | "jog" | "ready" | "keeperReady" | "defend" | "celebrate";
export type OneShotAction = "kick" | "jumpShot" | "spike" | "smash" | "serve" | "keeperDive";
export type Action = CyclicAction | OneShotAction;

export const ONE_SHOT: OneShotAction[] = ["kick", "jumpShot", "spike", "smash", "serve", "keeperDive"];
export const isOneShot = (a: Action): a is OneShotAction => (ONE_SHOT as Action[]).includes(a);

/** Ground speed (world units per second at scale 1) that matches each cycle's stride. */
export const ACTION_SPEED: Record<CyclicAction, number> = {
  run: 2.6, sprint: 4.6, dribble: 2.0, jog: 1.4, ready: 0, keeperReady: 0, defend: 0, celebrate: 0,
};

/** u at which the foot, hand or racket meets the ball (or the keeper is at full stretch). */
export const ACTION_CONTACT: Record<OneShotAction, number> = {
  kick: 0.5, jumpShot: 0.6, spike: 0.65, smash: 0.6, serve: 0.62, keeperDive: 0.55,
};

export type SportPose = { pose: Pose; /** Figure-local offset (before heading and scale). */ offset: V3 };

// ---------------------------------------------------------------------------------------------
const N: Pose = {
  body: [0, 0, 0], lift: LEG_LENGTH, spine: [0.05, 0, 0], head: [0, 0, 0],
  ls: [0, 0, 0.15], le: -0.3, rs: [0, 0, -0.15], re: -0.3,
  lh: [0, 0, 0.04], lk: 0.08, rh: [0, 0, -0.04], rk: 0.08,
};

const groundLift = (p: Pose) => Math.max(legReach(p.lh, p.lk), legReach(p.rh, p.rk));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const smooth = (k: number) => k * k * (3 - 2 * k);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function mixPose(a: Pose, b: Pose, k: number): Pose {
  return {
    body: lerp3(a.body, b.body, k), lift: lerp(a.lift, b.lift, k), spine: lerp3(a.spine, b.spine, k), head: lerp3(a.head, b.head, k),
    ls: lerp3(a.ls, b.ls, k), le: lerp(a.le, b.le, k), rs: lerp3(a.rs, b.rs, k), re: lerp(a.re, b.re, k),
    lh: lerp3(a.lh, b.lh, k), lk: lerp(a.lk, b.lk, k), rh: lerp3(a.rh, b.rh, k), rk: lerp(a.rk, b.rk, k),
  };
}

/** Swap left and right (mirror across the figure's x = 0 plane). */
function mirror(p: Pose): Pose {
  const m = (v: V3): V3 => [v[0], -v[1], -v[2]];
  return {
    body: m(p.body), lift: p.lift, spine: m(p.spine), head: m(p.head),
    ls: m(p.rs), le: p.re, rs: m(p.ls), re: p.le,
    lh: m(p.rh), lk: p.rk, rh: m(p.lh), rk: p.lk,
  };
}

/** A key: changes over N, plus `air` (jump height) or `liftAbs` (pelvis height, for dives). */
type Key = [number, Partial<Pose> & { air?: number; liftAbs?: number; off?: V3 }];

function keyed(keys: Key[], u: number): SportPose {
  const x = clamp01(u);
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1][0]) i++;
  const [ua, ka] = keys[i];
  const [ub, kb] = keys[Math.min(i + 1, keys.length - 1)];
  const k = ub > ua ? smooth(clamp01((x - ua) / (ub - ua))) : 0;
  const pa = { ...N, ...ka } as Pose;
  const pb = { ...N, ...kb } as Pose;
  const p = mixPose(pa, pb, k);
  const ga = ka.liftAbs === undefined;
  const gb = kb.liftAbs === undefined;
  const la = ka.liftAbs ?? groundLift(pa) + (ka.air ?? 0);
  const lb = kb.liftAbs ?? groundLift(pb) + (kb.air ?? 0);
  p.lift = ga && gb ? groundLift(p) + lerp(ka.air ?? 0, kb.air ?? 0, k) : lerp(la, lb, k);
  return { pose: p, offset: lerp3(ka.off ?? [0, 0, 0], kb.off ?? [0, 0, 0], k) };
}

// ---------------------------------------------------------------------------------------------
// Cyclic actions.
function stride(t: number, cadence: number, amp: number, lean: number, tuck: number, arms: number, spread = 0.12): Pose {
  const w = t * Math.PI * 2 * cadence;
  const s = Math.sin(w);
  const c = Math.cos(w);
  const p: Pose = {
    ...N,
    spine: [lean, -s * 0.12, 0],
    head: [-lean * 0.6, s * 0.05, 0],
    ls: [s * arms, 0, spread], le: -1.45 + c * 0.15,
    rs: [-s * arms, 0, -spread], re: -1.45 - c * 0.15,
    lh: [-s * amp - lean * 0.3, 0, 0.03], lk: 0.3 + tuck * Math.max(0, c),
    rh: [s * amp - lean * 0.3, 0, -0.03], rk: 0.3 + tuck * Math.max(0, -c),
  };
  // Flight: both feet leave the ground twice per cycle.
  p.lift = groundLift(p) + Math.abs(Math.sin(w)) * 0.035 * amp;
  return p;
}

function cyclic(a: CyclicAction, f: number, seed: number): Pose {
  const t = f / 60 + seed * 0.731;
  const b = lifeMotion(f, seed).breathe;
  switch (a) {
    case "run":
      return stride(t, 1.35, 0.72, 0.2, 1.1, 0.75);
    case "sprint":
      return stride(t, 1.6, 0.95, 0.34, 1.5, 1.05);
    case "jog":
      return stride(t, 1.2, 0.45, 0.1, 0.7, 0.45);
    case "dribble": {
      // Short touches, head over the ball, arms out for balance.
      const p = stride(t, 1.45, 0.5, 0.26, 0.85, 0.45, 0.45);
      p.head = [0.35, Math.sin(t * 2.1) * 0.15, 0];
      return p;
    }
    case "ready":
    case "keeperReady":
    case "defend": {
      // Athletic stance: hips back, knees bent, light bounce on the toes.
      const bounce = Math.sin(t * Math.PI * 2 * 1.6) * 0.5 + 0.5;
      const wide = a === "defend" ? 0.32 : a === "keeperReady" ? 0.24 : 0.16;
      const arms: Pick<Pose, "ls" | "le" | "rs" | "re"> =
        a === "keeperReady"
          ? { ls: [-0.55, 0, 0.85], le: -0.7, rs: [-0.55, 0, -0.85], re: -0.7 }
          : a === "defend"
            ? { ls: [-0.2, 0, 1.25], le: -0.35, rs: [-0.2, 0, -1.25], re: -0.35 }
            : { ls: [-0.65, 0, 0.3], le: -1.1, rs: [-0.65, 0, -0.3], re: -1.1 };
      const p: Pose = {
        ...N,
        ...arms,
        spine: [0.38 + b * 0.02, 0, 0],
        head: [-0.3, Math.sin(t * 0.8) * 0.12, 0],
        lh: [-0.55, 0, wide], lk: 0.95 + bounce * 0.12,
        rh: [-0.55, 0, -wide], rk: 0.95 + bounce * 0.12,
      };
      p.lift = groundLift(p);
      return p;
    }
    case "celebrate": {
      const j = Math.max(0, Math.sin(t * Math.PI * 2 * 1.1));
      const p: Pose = {
        ...N,
        spine: [-0.15, 0, 0],
        head: [-0.35, 0, 0],
        ls: [-0.2, 0, 2.7 + j * 0.25], le: -0.5, rs: [-0.2, 0, -2.7 - j * 0.25], re: -0.5,
        lh: [-j * 0.3, 0, 0.05], lk: 0.2 + j * 0.6, rh: [-j * 0.1, 0, -0.05], rk: 0.2 + j * 0.9,
      };
      p.lift = groundLift(p) + j * 0.16;
      return p;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// One-shot actions (right-handed / right-footed; `side = -1` mirrors).
const KEYS: Record<OneShotAction, Key[]> = {
  kick: [
    [0, { ls: [-0.2, 0, 0.3], rs: [0.2, 0, -0.3] }],
    [0.3, { spine: [0.12, 0.25, 0], lh: [-0.15, 0, 0.05], lk: 0.35, rh: [0.75, 0, -0.06], rk: 1.65, ls: [-0.5, 0, 0.9], le: -0.4, rs: [0.6, 0, -0.5], re: -0.4 }],
    [0.5, { spine: [-0.05, -0.15, 0], lh: [0.1, 0, 0.04], lk: 0.3, rh: [-0.8, 0, -0.02], rk: 0.25, ls: [0.2, 0, 1.0], rs: [-0.6, 0, -0.7] }],
    [0.7, { spine: [-0.18, -0.3, 0], lh: [0.15, 0, 0.03], lk: 0.2, rh: [-1.45, 0, 0], rk: 0.1, ls: [0.4, 0, 1.1], rs: [-0.9, 0, -0.6] }],
    [1, {}],
  ],
  jumpShot: [
    [0, { ls: [-1.1, 0, 0.25], le: -1.7, rs: [-1.1, 0, -0.25], re: -1.7 }],
    [0.25, { spine: [0.25, 0, 0], lh: [-0.7, 0, 0.06], lk: 1.3, rh: [-0.7, 0, -0.06], rk: 1.3, ls: [-0.9, 0, 0.25], le: -1.8, rs: [-0.9, 0, -0.25], re: -1.8 }],
    [0.45, { air: 0.25, lh: [-0.1, 0, 0.04], lk: 0.15, rh: [-0.1, 0, -0.04], rk: 0.15, ls: [-2.6, 0, 0.2], le: -1.4, rs: [-2.7, 0, -0.15], re: -1.6 }],
    [0.6, { air: 0.35, lk: 0.3, rk: 0.3, ls: [-2.5, 0, 0.4], le: -0.6, rs: [-2.9, 0, -0.1], re: -0.1, head: [-0.25, 0, 0] }],
    [0.8, { air: 0.12, lk: 0.4, rk: 0.4, ls: [-2.3, 0, 0.4], le: -0.5, rs: [-2.8, 0, -0.1], re: -0.2, head: [-0.2, 0, 0] }],
    [1, { lh: [-0.4, 0, 0.05], lk: 0.6, rh: [-0.4, 0, -0.05], rk: 0.6 }],
  ],
  spike: [
    [0, { spine: [0.3, 0, 0], lh: [-0.3, 0, 0.1], lk: 0.5, rh: [-0.3, 0, -0.1], rk: 0.5 }],
    [0.2, { spine: [0.5, 0, 0], lh: [-0.8, 0, 0.06], lk: 1.4, rh: [-0.8, 0, -0.06], rk: 1.4, ls: [1.2, 0, 0.2], le: -0.2, rs: [1.2, 0, -0.2], re: -0.2 }],
    [0.4, { air: 0.35, lk: 0.2, rk: 0.2, ls: [-2.8, 0, 0.3], le: -0.2, rs: [-2.8, 0, -0.3], re: -0.2 }],
    [0.55, { air: 0.5, spine: [-0.35, 0.35, 0], lk: 0.6, rk: 0.9, ls: [-2.4, 0, 0.4], le: -0.3, rs: [-2.4, 0, -1.0], re: -2.2, head: [-0.3, 0, 0] }],
    [0.65, { air: 0.48, spine: [0.35, -0.25, 0], lk: 0.5, rk: 0.6, ls: [-1.2, 0, 0.5], le: -0.5, rs: [-2.6, 0, -0.3], re: -0.05, head: [-0.1, 0, 0] }],
    [0.78, { air: 0.25, spine: [0.45, -0.3, 0], lk: 0.5, rk: 0.5, ls: [-0.6, 0, 0.6], le: -0.6, rs: [-0.4, 0, -0.1], re: -0.3 }],
    [1, { spine: [0.3, 0, 0], lh: [-0.5, 0, 0.1], lk: 0.9, rh: [-0.5, 0, -0.1], rk: 0.9 }],
  ],
  smash: [
    [0, { spine: [0.2, 0.2, 0], lh: [-0.3, 0, 0.12], lk: 0.6, rh: [0.2, 0, -0.12], rk: 0.6, rs: [-0.6, 0, -0.5], re: -1.1, ls: [-0.6, 0, 0.4], le: -0.6 }],
    [0.3, { air: 0.08, spine: [-0.25, 0.55, 0], lh: [-0.2, 0, 0.1], lk: 0.5, rh: [0.4, 0, -0.1], rk: 0.9, ls: [-2.6, 0, 0.3], le: -0.2, rs: [-1.7, 0, -1.3], re: -2.3, head: [-0.4, 0, 0] }],
    [0.6, { air: 0.2, spine: [0.25, -0.3, 0], lh: [0.35, 0, 0.08], lk: 0.9, rh: [-0.45, 0, -0.08], rk: 0.4, ls: [-1.0, 0, 0.6], le: -0.7, rs: [-2.9, 0, -0.2], re: -0.05, head: [-0.25, 0, 0] }],
    [0.78, { air: 0.06, spine: [0.45, -0.45, 0], lh: [0.2, 0, 0.1], lk: 0.6, rh: [-0.6, 0, -0.1], rk: 0.5, ls: [-0.4, 0, 0.5], le: -0.8, rs: [-0.6, 0, 0.35], re: -0.5 }],
    [1, { spine: [0.25, 0, 0], lh: [-0.3, 0, 0.12], lk: 0.6, rh: [-0.3, 0, -0.12], rk: 0.6, rs: [-0.6, 0, -0.4], re: -1.0 }],
  ],
  serve: [
    [0, { spine: [0, 0.6, 0], ls: [-0.5, 0, 0.2], le: -0.3, rs: [-0.3, 0, -0.4], re: -0.4, lh: [-0.15, 0, 0.12], rh: [0.15, 0, -0.12] }],
    [0.3, { spine: [-0.05, 0.6, 0], ls: [-2.9, 0, 0.15], le: 0, rs: [0.4, 0, -1.3], re: -1.2, lh: [-0.4, 0, 0.12], lk: 0.8, rh: [-0.2, 0, -0.12], rk: 0.8, head: [-0.5, 0, 0] }],
    [0.5, { spine: [-0.3, 0.4, 0], ls: [-2.7, 0, 0.3], le: -0.2, rs: [-1.8, 0, -1.4], re: -2.3, lh: [-0.5, 0, 0.1], lk: 1.0, rh: [-0.3, 0, -0.1], rk: 1.0, head: [-0.6, 0, 0] }],
    [0.62, { air: 0.12, spine: [0.1, -0.2, 0], ls: [-0.6, 0, 0.4], le: -0.6, rs: [-3.0, 0, -0.25], re: -0.05, lk: 0.1, rk: 0.1, head: [-0.45, 0, 0] }],
    [0.8, { spine: [0.45, -0.5, 0], ls: [-0.3, 0, 0.5], le: -0.9, rs: [0.2, 0, 0.6], re: -0.4, lh: [-0.3, 0, 0.06], lk: 0.4, rh: [0.6, 0, -0.05], rk: 0.8 }],
    [1, { spine: [0.35, 0, 0], ls: [-0.6, 0, 0.3], le: -1.0, rs: [-0.6, 0, -0.3], re: -1.0, lh: [-0.5, 0, 0.16], lk: 0.9, rh: [-0.5, 0, -0.16], rk: 0.9 }],
  ],
  keeperDive: [
    [0, { spine: [0.3, 0, 0], lh: [-0.45, 0, 0.25], lk: 0.9, rh: [-0.45, 0, -0.25], rk: 0.9, ls: [-0.6, 0, 0.9], le: -0.6, rs: [-0.6, 0, -0.9], re: -0.6 }],
    [0.2, { spine: [0.35, 0, 0], lh: [-0.5, 0, 0.32], lk: 1.2, rh: [-0.5, 0, -0.2], rk: 1.2, ls: [-0.5, 0, 1.2], le: -0.5, rs: [-0.5, 0, -0.6], re: -0.6, off: [-0.06, 0, 0] }],
    [0.55, { body: [0, 0, -1.25], liftAbs: 0.5, spine: [0, 0, -0.2], head: [0, 0, -0.2], lh: [0, 0, 0.3], lk: 0.2, rh: [0, 0, -0.1], rk: 0.5, ls: [-0.3, 0, 2.9], le: -0.05, rs: [-0.3, 0, -2.85], re: -0.05, off: [1.05, 0, 0] }],
    [0.8, { body: [0, 0, -1.45], liftAbs: 0.13, spine: [0.1, 0, -0.1], lh: [-0.2, 0, 0.2], lk: 0.5, rh: [-0.4, 0, -0.1], rk: 0.8, ls: [-1.2, 0, 1.9], le: -0.9, rs: [-1.2, 0, -1.9], re: -0.9, off: [1.4, 0, 0] }],
    [1, { body: [0, 0, -1.5], liftAbs: 0.12, spine: [0.15, 0, -0.1], lh: [-0.3, 0, 0.2], lk: 0.7, rh: [-0.5, 0, -0.1], rk: 1.0, ls: [-1.3, 0, 1.7], le: -1.1, rs: [-1.3, 0, -1.7], re: -1.1, off: [1.45, 0, 0] }],
  ],
};

/**
 * The pose for `action` at film frame `f` (cyclic) or progress `u` (one-shot, 0..1).
 * `side = -1` mirrors (left foot, dive right, left-handed).
 */
export function sportPose(action: Action, opts: { f: number; u?: number; seed?: number; side?: 1 | -1 }): SportPose {
  const { f, u = 0, seed = 1, side = 1 } = opts;
  let out: SportPose;
  if (isOneShot(action)) {
    out = keyed(KEYS[action], u);
    // Keep a breath of life in the head between keys.
    const { breathe } = lifeMotion(f, seed);
    out.pose.spine = [out.pose.spine[0] + breathe * 0.01, out.pose.spine[1], out.pose.spine[2]];
  } else {
    out = { pose: cyclic(action, f, seed), offset: [0, 0, 0] };
  }
  if (side === -1) out = { pose: mirror(out.pose), offset: [-out.offset[0], out.offset[1], out.offset[2]] };
  return out;
}
