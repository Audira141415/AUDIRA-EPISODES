// PERSAUDARAAN: staging, light, cameras and overlays. Every value is a pure function of the film time t,
// and every beat is keyed to a clip id of timeline.json, so the film re-times itself when the real voice lands.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, Html5Audio } from "remotion";
import { loadFont } from "@remotion/google-fonts/Fraunces";
import { Stage3D } from "../../core/film/Stage3D.tsx";
import { FONT } from "../../core/type/fonts.ts";
import { Stage, mixLight, type Light, type Shot } from "../../kits/paperworld/render/Stage.tsx";
import { clamp, ease, mix, remap } from "../../kits/paperworld/motion/easing.ts";
import type { V3 } from "../../kits/paperworld/components/Paper.tsx";
import { CLIPS, E, PATH_Y, STAND_X, T, TOTAL_SECONDS, mouthOf, BENCH_A, type Clip } from "./layout.ts";
import { ADIK, ANAK, ISTRI, KAKAK, Puppet, rest, type Pose } from "./Puppet.tsx";
import { World, type WorldState } from "./Set.tsx";

const { fontFamily: SERIF } = loadFont("normal", { weights: ["400", "600"], subsets: ["latin"] });
const { fontFamily: SERIF_I } = loadFont("italic", { weights: ["400"], subsets: ["latin"] });

const ramp = (t: number, a: number, b: number, f: (x: number) => number = ease.inOut) => f(remap(t, a, b));
const win = (t: number, a: number, b: number, fin = 0.5, fout = 0.5) => clamp(Math.min(remap(t, a - fin, a), 1 - remap(t, b, b + fout)));
const blinkAt = (t: number, seed: number) => {
  const period = 3.3 + ((seed * 0.37) % 1) * 1.7;
  const u = ((t + seed) % period) / 0.15;
  return u < 1 ? Math.sin(u * Math.PI) : 0;
};

/* ---------- light ---------- */

const DAY: Light = {
  dir: [-0.55, 0.78, 0.48], key: "#ffe8c4", keyI: 2.55, fill: "#e6ecf6", fillI: 0.5, sky: "#fff2dc", ground: "#cdb08f",
  hemiI: 1.15, bg: "#f2ddb0", exposure: 1.03, shadowSize: 48, shadowSoft: 4,
};
const NIGHT: Light = {
  dir: [-0.35, 0.8, 0.5], key: "#b4c3f4", keyI: 1.35, fill: "#5a68a8", fillI: 0.55, sky: "#7b88c6", ground: "#3c3656",
  hemiI: 0.95, bg: "#28335f", exposure: 1.0, shadowSize: 48, shadowSoft: 5,
};

/* ---------- the clock of the sky ---------- */

const M0 = E.s4e + 1.4; // montage starts
const M1 = T.s5c + 1.0; // montage ends in daylight
const PI = Math.PI;
const WHEEL: [number, number][] = [
  [0, PI], [T.s2a - 1.4, PI], [T.s2a + 1.8, 2 * PI],
  [E.s2g + 0.4, 2 * PI], [T.s3a + 2.4, 3 * PI],
  [M0, 3 * PI], [M1, 8 * PI],
  [E.s5e + 0.2, 8 * PI], [T.s6a + 1.8, 9 * PI],
  [T.s7d - 1.0, 9 * PI], [TOTAL_SECONDS - 3.4, 10 * PI],
];
const wheelAt = (t: number) => {
  for (let i = 0; i < WHEEL.length - 1; i++) {
    const [a, va] = WHEEL[i], [b, vb] = WHEEL[i + 1];
    if (t <= b) return mix(va, vb, ease.inOut(remap(t, a, b)));
  }
  return WHEEL[WHEEL.length - 1][1];
};
const nightAt = (t: number) => (1 - Math.cos(wheelAt(t))) / 2;
/** Time (inside the montage) when the wheel reaches angle v. */
const solve = (v: number) => {
  let lo = M0, hi = M1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (wheelAt(m) < v) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
};
/** Montage nights: adik walks A to B in the first half, kakak walks B to A in the second. */
const NIGHTS = [5 * PI, 7 * PI].map((c) => ({ a: solve(c - 0.55 * PI), c: solve(c), b: solve(c + 0.55 * PI) }));

/* ---------- sacks ---------- */

type Ev = [number, "A" | "B", number];
const EVENTS: Ev[] = [
  [T.s1a + 1.1, "A", -1],
  [T.s1b + 1.4, "A", +1],
  [T.s3e + 2.7, "A", -1],
  [T.s3g + 1.0, "B", +1],
  [T.s4e + 0.3, "B", -1],
  [E.s4e + 1.3, "A", +1],
  ...NIGHTS.flatMap((n): Ev[] => [[n.a + 0.05, "A", -1], [n.c - 0.1, "B", +1], [n.c + 0.05, "B", -1], [n.b - 0.1, "A", +1]]),
  [T.s6a + 0.6, "A", -1],
  [T.s6a + 0.6, "B", -1],
];
const S2_FROM = T.s2a - 0.6;
const STACKS_BACK = T.s3b - 0.3;
const countOf = (barn: "A" | "B", t: number) => {
  if (t >= S2_FROM && t < STACKS_BACK) return 0;
  let n = 10;
  for (const [at, b, d] of EVENTS) {
    if (b !== barn || t < at) continue;
    if (t >= S2_FROM && at < STACKS_BACK) continue;
    if (t >= STACKS_BACK && at < S2_FROM) continue;
    n += d < 0 ? d : clamp((t - at) / 0.55);
  }
  return n;
};

/* ---------- walking ---------- */

type Key = [number, number, number, number?]; // t, x, z, yaw at rest
const groundY = (x: number, z: number) => Math.max(PATH_Y * clamp(1 - (Math.abs(z) - 1.3) / 0.8), PATH_Y * clamp((Math.abs(x) - 19) / 1));

const trackAt = (keys: Key[], t: number) => {
  let dist = 0;
  if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], yaw: keys[0][3] ?? 0, dist, seg: 0 };
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, xa, za, ya] = keys[i];
    const [tb, xb, zb, yb] = keys[i + 1];
    const len = tb - ta < 0.05 ? 0 : Math.hypot(xb - xa, zb - za);
    if (t <= tb) {
      const u = tb - ta < 1e-3 ? 1 : (t - ta) / (tb - ta);
      // gentle start and stop only at the ends of a walk (where the neighbouring segment rests)
      const prevRest = i === 0 || Math.hypot(xa - keys[i - 1][1], za - keys[i - 1][2]) < 0.01;
      const nextRest = i + 2 >= keys.length || Math.hypot(keys[i + 2][1] - xb, keys[i + 2][2] - zb) < 0.01;
      const k = prevRest && nextRest ? ease.sine(u) : prevRest ? (u * u + u) / 2 : nextRest ? (3 * u - u * u) / 2 : u;
      return { x: mix(xa, xb, k), z: mix(za, zb, k), yaw: yb ?? ya ?? 0, dist: dist + len * k, seg: i };
    }
    dist += len;
  }
  const l = keys[keys.length - 1];
  return { x: l[1], z: l[2], yaw: l[3] ?? 0, dist, seg: keys.length - 1 };
};

type Body = { x: number; z: number; y: number; yaw: number; walk: number; stride: number };
const bodyAt = (keys: Key[], t: number): Body => {
  const p = trackAt(keys, t);
  const a = trackAt(keys, t - 0.05), b = trackAt(keys, t + 0.05);
  const vx = (b.x - a.x) / 0.1, vz = (b.z - a.z) / 0.1;
  const speed = Math.hypot(vx, vz);
  const stride = clamp(speed / 1.6);
  // yaw: rest yaw when still, heading (turned a little toward the lens) when walking; smoothed over 0.4 s
  let ys = 0;
  for (let i = 0; i < 6; i++) {
    const ti = t - i * 0.08;
    const q = trackAt(keys, ti), q0 = trackAt(keys, ti - 0.05), q1 = trackAt(keys, ti + 0.05);
    const dx = q1.x - q0.x, dz = q1.z - q0.z;
    const sp = Math.hypot(dx, dz) / 0.1;
    let head = Math.atan2(dx, dz);
    if (Math.abs(Math.sin(head)) > 0.6 && Math.cos(head) > -0.6) head -= Math.sign(Math.sin(head)) * 0.45;
    ys += mix(q.yaw, head, clamp(sp / 1.2));
  }
  return { x: p.x, z: p.z, y: groundY(p.x, p.z), yaw: ys / 6, walk: p.dist / 3.4, stride };
};

/* ---------- the brothers' paths ---------- */

const SA = -STAND_X, SB = STAND_X;
const BENCH_SPOT: [number, number] = [BENCH_A[0] + 0.15, BENCH_A[2] + 0.35];
const ADIK_KEYS: Key[] = [
  [0, SA, -0.9, -0.75], [T.s1a + 1.7, SA, -0.9, -0.75], [T.s1a + 2.3, -16.6, 0, 1.1], [E.s1a + 2.6, -4, 0, 1.1],
  // harvest
  [S2_FROM, -5.6, 6.0, 0.3], [T.s2c, -5.6, 6.0, 0.3],
  [T.s2c + 0.01, -30.0, -4.0, 0.35], [T.s2e - 0.35, -30.0, -4.0, 0.35],
  [T.s2e - 0.34, -5.7, 1.5, 0.55], [T.s2f - 1.6, -5.7, 1.5, 0.55], [T.s2f - 0.3, -2.5, 1.15, 0.55], [E.s2g + 0.3, -2.5, 1.15, 0.55],
  // home at dusk, to the bench
  [E.s2g + 0.9, -6.5, 0, 0], [E.s2g + 3.3, -20.5, 0, 0], [E.s2g + 4.6, BENCH_SPOT[0], BENCH_SPOT[1], 0.6], [T.s3e + 0.4, BENCH_SPOT[0], BENCH_SPOT[1], 0.6],
  // to his own stack
  [T.s3e + 2.6, SA, -0.9, -0.75], [T.s3e + 3.2, SA, -0.9, -0.75],
  // along the path to his brother's barn
  [T.s3e + 3.6, -16.6, 0, 1.1], [T.s3g + 0.2, 16.6, 0, 1.1], [T.s3g + 0.6, SB, -0.9, 0.75], [T.s4a - 0.02, SB, -0.9, 0.75],
  // morning count (after the montage)
  [T.s4a, SA, -0.9, -0.75], [T.s6b - 0.8, SA, -0.9, -0.75],
  // the full-moon night
  [T.s6b - 0.2, -16.6, 0, 1.1], [T.s6c + 0.6, -1.45, 0, 1.15], [T.s6g - 0.3, -1.45, 0, 1.15], [T.s6g + 1.0, -0.95, -0.25, 0.45],
];
const KAKAK_KEYS: Key[] = [
  [0, 31, -4.4, -0.35], [S2_FROM, -1.4, 7.6, -0.2], [T.s2c - 0.4, -1.4, 7.6, -0.2],
  [T.s2c - 0.39, 31.0, -4.4, -0.35], [T.s2e - 0.35, 31.0, -4.4, -0.35],
  [T.s2e - 0.34, 5.7, 1.5, -0.55], [T.s2f - 1.6, 5.7, 1.5, -0.55], [T.s2f - 0.3, 2.5, 1.15, -0.55], [E.s2g + 0.3, 2.5, 1.15, -0.55],
  [E.s2g + 0.9, 6.5, 0, 0], [E.s2g + 3.3, 20.5, 0, 0], [E.s2g + 4.8, 31.0, -4.4, -0.35],
  [T.s4e - 0.5, 31.0, -4.4, -0.45], [T.s4e - 0.49, SB, -0.9, 0.75], [T.s4e + 0.8, SB, -0.9, 0.75],
  [T.s4e + 1.2, 16.6, 0, -1.1], [E.s4e + 0.7, -16.6, 0, -1.1], [E.s4e + 1.1, SA, -0.9, -0.75], [E.s4e + 1.4, SA, -0.9, -0.75],
  [E.s4e + 1.41, SB, -0.9, 0.75], [T.s6b - 0.8, SB, -0.9, 0.75],
  [T.s6b - 0.2, 16.6, 0, -1.1], [T.s6c + 0.6, 1.45, 0, -1.15], [T.s6g - 0.3, 1.45, 0, -1.15], [T.s6g + 1.0, 0.95, 0.3, -0.45],
];

/** Montage trips override the key tracks: fast time-lapse walks, one brother per half night. */
const montageBody = (who: "adik" | "kakak", t: number): (Body & { carry: number }) | null | "hidden" => {
  if (t < M0 || t > M1) return null;
  for (const n of NIGHTS) {
    const [a, b] = who === "adik" ? [n.a, n.c] : [n.c, n.b];
    if (t >= a && t <= b) {
      const u = (t - a) / (b - a);
      const x = who === "adik" ? mix(SA, SB, u) : mix(SB, SA, u);
      return { x, z: 0, y: groundY(x, 0), yaw: who === "adik" ? 1.1 : -1.1, walk: Math.abs(x - SA) / 3.4, stride: 1, carry: 1 };
    }
  }
  return "hidden";
};

const env = (t: number, list: [number, number][], up = 0.55, down = 0.55) => {
  let v = 0;
  for (const [a, b] of list) v = Math.max(v, Math.min(ramp(t, a, a + up), 1 - ramp(t, b, b + down)));
  return v;
};

const ADIK_CARRY: [number, number][] = [[T.s1a + 1.1, 1e9 + 0], [T.s3e + 2.7, T.s3g + 0.7], [T.s6a + 0.6, T.s6f + 1.4]];
const KAKAK_CARRY: [number, number][] = [[T.s4e + 0.3, E.s4e + 1.0], [T.s6a + 0.6, T.s6f + 1.6]];
// S1 adik leaves frame still carrying; clip his first carry at the scene change
ADIK_CARRY[0][1] = S2_FROM - 0.6;
const ADIK_LAMP: [number, number][] = [[0, S2_FROM - 0.6], [T.s3e - 0.2, T.s4a], [T.s6a, T.s6f + 2.2]];
const KAKAK_LAMP: [number, number][] = [[T.s4e - 0.2, E.s4e + 1.4], [T.s6a, T.s6f + 2.4]];

const visibleAdik = (t: number) => !(t > E.s1a + 2.5 && t < S2_FROM) && !(t >= T.s4a && t < M0) && !(t >= T.s3b - 0.3 && t < T.s3c - 0.2);
const visibleKakak = (t: number) => t >= S2_FROM && !(t > E.s2g + 4.9 && t < T.s4a - 0.5) && !(t >= T.s4d - 0.2 && t < T.s4e - 0.1);

const hug = (t: number) => ramp(t, T.s6g - 0.3, T.s6g + 1.2);

const posePuppet = (who: "adik" | "kakak", t: number): { body: Body; pose: Pose; visible: boolean } => {
  const keys = who === "adik" ? ADIK_KEYS : KAKAK_KEYS;
  const m = montageBody(who, t);
  let body = bodyAt(keys, t);
  let carry = env(t, who === "adik" ? ADIK_CARRY : KAKAK_CARRY);
  let lamp = env(t, who === "adik" ? ADIK_LAMP : KAKAK_LAMP);
  let visible = who === "adik" ? visibleAdik(t) : visibleKakak(t);
  if (m === "hidden") visible = false;
  else if (m) {
    body = m;
    carry = 1;
    lamp = 1;
    visible = true;
  }
  const talk = mouthOf(who, t);
  const sit = who === "adik" ? clamp(Math.min(ramp(t, E.s2g + 4.7, E.s2g + 5.4), 1 - ramp(t, T.s3e + 0.0, T.s3e + 0.6))) : 0;
  const harvest = clamp(Math.min(ramp(t, S2_FROM, S2_FROM + 0.6), 1 - ramp(t, T.s2c - 0.6, T.s2c - 0.4)));
  const sw = Math.sin(t * 4.2 + (who === "adik" ? 0 : 1.7));
  const scratch = who === "adik" ? win(t, T.s5d + 0.2, E.s5d - 0.4) : win(t, T.s5e + 0.2, E.s5e - 0.2);
  const count = who === "adik" ? win(t, T.s5c + 3.0, T.s5d) : win(t, E.s5d, T.s5e + 0.2);
  const surprise = win(t, T.s6c + 0.6, T.s6f, 0.4, 0.6);
  const h = hug(t);
  const cry = ramp(t, T.s6e + 0.4, T.s6g + 1.0);
  const gest = talk > 0 ? Math.sin(t * 3.1) * 0.08 + 0.18 : 0;
  const thoughtful = who === "adik" ? win(t, T.s3a, T.s3e, 0.6, 0.6) : win(t, T.s4a, T.s4e, 0.6, 0.6);
  const lookFar = who === "adik" ? win(t, T.s3b - 0.3, T.s3c - 0.2) : win(t, T.s4d - 0.2, T.s4e);
  const nodTalk = talk > 0 ? Math.sin(t * 2.4) * 0.03 : 0;
  const side = who === "adik" ? 1 : -1;
  const pose = rest({
    time: t,
    walk: body.walk,
    stride: body.stride,
    lean: harvest * 0.32 + h * 0.08 - surprise * 0.04 + count * 0.08,
    headNod: harvest * 0.25 + thoughtful * 0.1 + nodTalk + count * Math.max(0, Math.sin(t * 5)) * 0.12 + h * 0.12,
    headTilt: scratch * 0.14 * side - h * 0.32 + thoughtful * 0.06 * side,
    look: [lookFar ? 0.8 * side * lookFar : count * 0.5 * -side, -harvest * 0.6 - thoughtful * 0.3 - count * 0.6],
    blink: h > 0.8 ? 1 : blinkAt(t, who === "adik" ? 2 : 5),
    armFwd: [
      harvest * (0.7 + sw * 0.4) + gest + h * 0.55 + surprise * 0.3,
      harvest * (0.7 - sw * 0.4) + gest * 0.6 + h * 0.15 + scratch * 0.55,
    ],
    // hug: inner arm (1) reaches out round the brother's back / over his shoulder, outer arm (0) crosses in front
    armOut: [-h * 0.85 + surprise * 0.15, h * (who === "adik" ? 1.45 : 1.9) + scratch * 2.35],
    talk,
    smile: (t < T.s3a ? 0.8 : 0.2) + (h > 0.5 ? 0.6 : 0),
    sit,
    carry,
    lantern: lamp,
    tears: cry,
  });
  return { body, pose, visible };
};

/* ---------- cameras ---------- */

type CamKey = { t: number; pos: V3; at: V3; fov: number };
type CamShot = { from: number; to: number; keys?: CamKey[]; dyn?: (t: number) => { pos: V3; at: V3; fov: number }; focus?: (t: number) => V3; aperture?: number };
const k = (t: number, pos: V3, at: V3, fov: number): CamKey => ({ t, pos, at, fov });
const lerp3 = (a: V3, b: V3, u: number): V3 => [mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)];
const head = (who: "adik" | "kakak") => (t: number): V3 => {
  const b = bodyAt(who === "adik" ? ADIK_KEYS : KAKAK_KEYS, t);
  return [b.x, b.y + 4.4, b.z];
};

const SHOTS: CamShot[] = [
  { from: 0, to: T.s2a - 1.5, keys: [k(0, [-11.6, 5.6, 14.5], [-20.4, 2.4, -2.4], 40), k(T.s2a - 1.5, [-12.6, 5.6, 13.4], [-20.4, 2.4, -2.4], 40)], focus: () => [-21, 2.5, -2.6] },
  {
    from: T.s2a - 1.5, to: T.s2c - 0.4,
    keys: [
      k(T.s2a - 1.5, [-12.6, 5.6, 13.4], [-20.4, 2.4, -2.4], 40),
      k(T.s2a + 3.2, [-8, 32, 52], [0, 3, -12], 42),
      k(T.s2b + 1.5, [-4, 15, 32], [-3.4, 2.2, 3], 40),
      k(T.s2c - 0.4, [-3.6, 8.5, 25], [-3.4, 2.8, 5], 40),
    ],
    focus: (t) => (t < T.s2b ? [0, 2, -6] : [-3.4, 3, 6.6]),
  },
  { from: T.s2c - 0.4, to: T.s2d - 0.25, keys: [k(T.s2c - 0.4, [28.5, 7.0, 15.5], [32.2, 2.9, -4.5], 40), k(T.s2d - 0.25, [29.0, 6.6, 14.0], [32.2, 2.9, -4.5], 40)], focus: () => [31.5, 3.5, -4] },
  { from: T.s2d - 0.25, to: T.s2e - 0.35, keys: [k(T.s2d - 0.25, [-25.0, 6.4, 11], [-30.5, 3.0, -5.5], 40), k(T.s2e - 0.35, [-25.8, 6.0, 9.8], [-30.5, 3.0, -5.5], 40)], focus: () => [-30, 3.6, -4] },
  { from: T.s2e - 0.35, to: T.s2f - 0.2, keys: [k(T.s2e - 0.35, [0, 12, 41], [0, 2.6, -1], 42), k(T.s2f - 0.2, [0, 10.5, 37], [0, 2.6, -1], 42)], focus: () => [0, 2, 0] },
  { from: T.s2f - 0.2, to: E.s2g + 0.3, keys: [k(T.s2f - 0.2, [1.0, 5.6, 21], [0, 2.9, 0], 40), k(E.s2g + 0.3, [0.6, 5.3, 19.5], [0, 2.9, 0], 40)], focus: () => [0, 3.8, 0.7] },
  {
    from: E.s2g + 0.3, to: T.s3b - 0.3,
    keys: [
      k(E.s2g + 0.3, [0.6, 5.3, 19.5], [0, 2.9, 0], 40),
      k(E.s2g + 1.8, [0, 24, 46], [-6, 2, -6], 42),
      k(T.s3b - 1.6, [-19, 9, 18], [-28.5, 2.6, -3], 40),
      k(T.s3b - 0.3, [-23.8, 5.8, 11.5], [-29.4, 2.6, -3.0], 40),
    ],
    focus: (t) => (t < T.s3a + 2 ? [0, 2, -4] : [-29.5, 3, -3]),
  },
  { from: T.s3b - 0.3, to: T.s3c - 0.2, keys: [k(T.s3b - 0.3, [-28.8, 7.4, -3.6], [22, 2.0, -2.5], 22), k(T.s3c - 0.2, [-28.6, 7.2, -3.5], [22, 2.2, -2.5], 20)], focus: () => [22, 3, -3], aperture: 0.0003 },
  { from: T.s3c - 0.2, to: T.s3e + 0.1, keys: [k(T.s3c - 0.2, [-24.0, 5.2, 9.0], [-29.3, 2.5, -3.0], 38), k(T.s3e + 0.1, [-24.6, 5.0, 7.8], [-29.3, 2.5, -3.0], 38)], focus: head("adik") },
  { from: T.s3e + 0.1, to: E.s3e + 0.2, keys: [k(T.s3e + 0.1, [-19.0, 7.0, 15.5], [-24.5, 2.2, -2.2], 42), k(E.s3e + 0.2, [-15.8, 6.2, 14], [-20.6, 2.4, -2.2], 42)], focus: head("adik") },
  {
    from: E.s3e + 0.2, to: T.s3g - 0.2,
    dyn: (t) => {
      const b = bodyAt(ADIK_KEYS, t);
      const x = clamp(b.x, -14, 14);
      return { pos: [x + 7.0, 6.4, 15.5], at: [x + 1.2, 2.8, -0.5], fov: 40 };
    },
    focus: head("adik"),
  },
  { from: T.s3g - 0.2, to: T.s4a - 0.3, keys: [k(T.s3g - 0.2, [13.4, 5.6, 13.5], [20.2, 2.5, -2.2], 40), k(T.s4a - 0.3, [14.0, 5.4, 12.5], [20.2, 2.5, -2.2], 40)], focus: () => [SB, 3.6, -0.9] },
  { from: T.s4a - 0.3, to: T.s4b - 0.2, keys: [k(T.s4a - 0.3, [36.6, 6.4, 12.5], [31.4, 3.0, -4.6], 40), k(T.s4b - 0.2, [35.8, 6.0, 11], [31.4, 3.0, -4.6], 40)], focus: head("kakak") },
  { from: T.s4b - 0.2, to: T.s4d - 0.2, keys: [k(T.s4b - 0.2, [34.8, 4.9, 6.8], [31.1, 2.7, -4.4], 38), k(T.s4d - 0.2, [34.3, 4.8, 5.9], [31.1, 2.7, -4.4], 38)], focus: head("kakak") },
  { from: T.s4d - 0.2, to: T.s4e - 0.1, keys: [k(T.s4d - 0.2, [31.4, 7.6, -4.2], [-22, 2.0, -2.5], 22), k(T.s4e - 0.1, [31.2, 7.4, -4.1], [-22, 2.2, -2.5], 20)], focus: () => [-22, 3, -3], aperture: 0.0003 },
  { from: T.s4e - 0.1, to: M0, keys: [k(T.s4e - 0.1, [41, 15, 10], [13, 1.6, -1.5], 40), k(M0, [37, 12.5, 8], [-4, 1.6, -2], 40)], focus: head("kakak"), aperture: 0.0004 },
  { from: M0, to: T.s5c + 2.6, keys: [k(M0, [0, 42, 64], [0, 5, -30], 50), k(T.s5c + 2.6, [0, 38, 58], [0, 5, -30], 50)], focus: () => [0, 2, -4], aperture: 0.0002 },
  { from: T.s5c + 2.6, to: T.s5e - 0.3, keys: [k(T.s5c + 2.6, [-13.4, 5.6, 13.5], [-20.2, 2.5, -2.2], 40), k(T.s5e - 0.3, [-14.0, 5.4, 12.5], [-20.2, 2.5, -2.2], 40)], focus: () => [SA, 3.6, -0.9] },
  { from: T.s5e - 0.3, to: E.s5e + 0.4, keys: [k(T.s5e - 0.3, [13.4, 5.6, 13.5], [20.2, 2.5, -2.2], 40), k(E.s5e + 0.4, [14.0, 5.4, 12.5], [20.2, 2.5, -2.2], 40)], focus: () => [SB, 3.6, -0.9] },
  { from: E.s5e + 0.4, to: T.s6b - 0.4, keys: [k(E.s5e + 0.4, [0, 1.6, 23], [0, 8.5, -40], 40), k(T.s6b - 0.4, [0, 2.2, 20.5], [0, 10, -40], 40)], focus: () => [0, 4, -40], aperture: 0.0003 },
  { from: T.s6b - 0.4, to: T.s6c - 0.3, keys: [k(T.s6b - 0.4, [-32, 12.5, 11.5], [0, 2.6, -1], 40), k(T.s6c - 0.3, [-27, 10, 9.5], [0, 2.8, -1], 40)], focus: () => [-8, 3, 0], aperture: 0.0004 },
  { from: T.s6c - 0.3, to: T.s6f - 0.3, keys: [k(T.s6c - 0.3, [0, 6.2, 19], [0, 3.2, 0], 40), k(T.s6f - 0.3, [0, 5.8, 16.5], [0, 3.2, 0], 40)], focus: () => [0, 4, 0] },
  {
    from: T.s6f - 0.3, to: TOTAL_SECONDS + 1,
    keys: [
      k(T.s6f - 0.3, [0, 5.8, 16.5], [0, 3.2, 0], 40),
      k(T.s6g + 0.6, [0, 3.4, 17], [0, 4.4, -8], 36),
      k(T.s7a + 2.0, [0, 3.0, 40], [0, 8.4, -40], 22),
      k(T.s7b + 3.0, [0, 3.4, 38], [0, 8.4, -40], 22),
      k(T.s7c + 2.0, [0, 15, 60], [0, 6, -22], 34),
      k(TOTAL_SECONDS - 3.4, [0, 23, 72], [0, 8, -26], 38),
    ],
    focus: () => [0, 4, 0],
    aperture: 0.0005,
  },
];

const cameraAt = (t: number): Shot => {
  const sh = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  let pos: V3, at: V3, fov: number;
  if (sh.dyn) ({ pos, at, fov } = sh.dyn(t));
  else {
    const ks = sh.keys!;
    let i = 0;
    while (i < ks.length - 2 && t > ks[i + 1].t) i++;
    const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)];
    const u = b.t > a.t ? ease.inOut(remap(t, a.t, b.t)) : 1;
    pos = lerp3(a.pos, b.pos, u);
    at = lerp3(a.at, b.at, u);
    fov = mix(a.fov, b.fov, u);
  }
  const f = sh.focus ? sh.focus(t) : at;
  return {
    pos,
    target: at,
    fov,
    focus: Math.hypot(pos[0] - f[0], pos[1] - f[1], pos[2] - f[2]),
    aperture: sh.aperture ?? 0.0009,
    maxBlur: 0.004,
  };
};

/* ---------- the scene ---------- */

const Scene: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const night = nightAt(t);
  const light = mixLight(DAY, NIGHT, ease.sine(night));
  const cam = cameraAt(t);
  const A = posePuppet("adik", t);
  const B = posePuppet("kakak", t);
  const mont = t > M0 && t < M1;
  const growU = remap(t, M0, M1);
  const w: WorldState = {
    t,
    night,
    wheel: wheelAt(t),
    grow: mont ? (growU < 0.12 ? mix(1, 0.15, growU / 0.12) : mix(0.15, 1, remap(growU, 0.12, 0.8))) : 1,
    ripe: mont ? (growU < 0.12 ? 1 : remap(growU, 0.6, 0.95)) : 1,
    countA: countOf("A", t),
    countB: countOf("B", t),
    pileAppear: t >= S2_FROM && t < STACKS_BACK ? remap(t, T.s2e - 1.0, T.s2e + 0.4) + (t > T.s2e + 0.4 ? 1 : 0) : 0,
    pileSplit: remap(t, T.s2e + 2.4, E.s2e - 0.3),
    glowA: night * 0.35,
    glowB: night * 0.35,
    houseGlowA: night * (t > T.s6a ? 0.4 : A.visible && t > E.s2g && t < T.s4a ? 0.5 : 0.85),
    houseGlowB: night * 0.85,
    groundSacks: ramp(t, T.s6f + 1.3, T.s6f + 1.9),
    groundLanterns: ramp(t, T.s6f + 2.1, T.s6f + 2.6) * night,
  };
  // the hook: a warm light drifts in from the path as the missing sack comes back by itself
  const ghost = Math.sin(Math.PI * remap(t, T.s1b + 0.2, T.s1b + 3.0));
  const ghostX = mix(-12, -19.5, remap(t, T.s1b + 0.2, T.s1b + 2.0));
  const family = t >= S2_FROM && t < T.s3a;
  return (
    <Stage shot={cam} light={light} frame={frame} center={[clamp(cam.target[0], -30, 30), 0, clamp(cam.target[2], -12, 6)]}>
      <World w={w} />
      <Puppet pose={A.pose} look={ADIK} position={[A.body.x, A.body.y, A.body.z]} yaw={A.body.yaw} visible={A.visible} />
      <Puppet pose={B.pose} look={KAKAK} position={[B.body.x, B.body.y, B.body.z]} yaw={B.body.yaw} visible={B.visible} scale={1.04} mirror />
      {family ? (
        <>
          <Puppet look={ISTRI} position={[33.6, PATH_Y, -4.9]} yaw={-0.35} scale={0.95} pose={rest({ time: t, blink: blinkAt(t, 9), smile: 1, headTilt: 0.06 })} />
          <Puppet look={ANAK[0]} position={[28.8, PATH_Y, -3.0]} yaw={0.15} scale={0.6} pose={rest({ time: t, blink: blinkAt(t, 3), smile: 1, armOut: [0.4 + Math.sin(t * 3) * 0.2, 0.2] })} />
          <Puppet look={ANAK[1]} position={[35.8, PATH_Y, -3.2]} yaw={-0.4} scale={0.52} pose={rest({ time: t, blink: blinkAt(t, 7), smile: 1 })} />
          <Puppet look={ANAK[2]} position={[32.6, PATH_Y, -2.6]} yaw={-0.1} scale={0.46} pose={rest({ time: t, blink: blinkAt(t, 11), smile: 1, walk: t * 0.8, stride: 0.25 })} />
        </>
      ) : null}
      {ghost > 0.01 ? <pointLight position={[ghostX, 2.6, 1.2]} color="#ffb768" intensity={30 * ghost} distance={14} decay={1.6} /> : null}
    </Stage>
  );
};

/* ---------- overlays ---------- */

const COLOR: Record<string, string> = { narator: "#A8DCC6", kakak: "#F5BE5E", adik: "#F59A80" };
const LABEL: Record<string, string> = { narator: "NARATOR", kakak: "SANG KAKAK", adik: "SANG ADIK" };

type Phrase = { who: string; id: string; words: Clip["words"]; start: number; end: number };
const PHRASES: Phrase[] = CLIPS.flatMap((c) => {
  const out: Phrase[] = [];
  let cur: Clip["words"] = [];
  c.words.forEach((w, i) => {
    cur.push(w);
    const stop = /[.,?!…]$/.test(w.w) && cur.length >= 3;
    if (stop || cur.length >= 7 || i === c.words.length - 1) {
      out.push({ who: c.who, id: c.id, words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
});
const HIKMAH = CLIPS.find((c) => c.id === "s7c")!;
const CLOSING = CLIPS.find((c) => c.id === "s7d")!;

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PHRASES.findIndex((p, n) => t >= p.start - 0.05 && t < Math.min(p.end + 0.35, PHRASES[n + 1]?.start ?? 1e9));
  if (i < 0) return null;
  const p = PHRASES[i];
  if (p.id === "s7c") return null;
  const col = COLOR[p.who];
  const closing = p.id === "s7d";
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1240, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "18px 34px 22px", borderRadius: 22, background: "rgba(30,22,16,0.62)", boxShadow: "0 8px 30px rgba(20,14,10,.35)" }}>
      <div style={{ fontFamily: FONT, fontSize: 25, letterSpacing: 5, fontWeight: 600, color: col, marginBottom: 14, textShadow: "0 2px 10px rgba(20,14,10,.9)" }}>{LABEL[p.who]}</div>
      <div style={{ fontFamily: closing ? SERIF_I : FONT, fontSize: closing ? 56 : 50, lineHeight: 1.26, fontWeight: closing ? 400 : 600, color: "#fff8ec", textShadow: "0 3px 6px rgba(20,14,10,.95), 0 0 26px rgba(20,14,10,.7)" }}>
        {p.words.map((w, n) => (
          <span key={n} style={{ color: t >= w.s && t < w.e + 0.04 ? col : "#fff8ec" }}>
            {w.w}{" "}
          </span>
        ))}
      </div>
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const title = ramp(t, 2.2, 3.2) * (1 - ramp(t, T.s2a + 2.2, T.s2a + 3.2));
  const hk = ramp(t, HIKMAH.start - 0.6, HIKMAH.start + 0.4) * (1 - ramp(t, HIKMAH.end + 0.5, CLOSING.start - 0.1));
  const outroStart = TOTAL_SECONDS - 3.2;
  const outro = ramp(t, outroStart, outroStart + 0.8);
  return (
    <>
      {t < outroStart ? <Captions t={t} /> : null}
      {title > 0 ? (
        <div style={{ position: "absolute", top: 250, left: 60, right: 60, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 14}px)` }}>
          <div style={{ display: "inline-block", padding: "26px 54px 32px", background: "#f6ecd6", boxShadow: "0 10px 0 -4px #d9c39a, 0 18px 40px rgba(20,12,6,.45)", transform: "rotate(-1.2deg)" }}>
            <div style={{ fontFamily: FONT, fontSize: 26, letterSpacing: 9, fontWeight: 600, color: "#9c4634" }}>CERITA HIKMAH</div>
            <div style={{ fontFamily: SERIF, fontSize: 92, fontWeight: 600, lineHeight: 1.05, color: "#3b2a22", marginTop: 8 }}>Persaudaraan</div>
          </div>
        </div>
      ) : null}
      {hk > 0 ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 560, opacity: hk, transform: `translateY(${(1 - hk) * 18}px) rotate(-0.8deg)` }}>
          <div style={{ background: "#f6ecd6", padding: "48px 52px 54px", boxShadow: "0 12px 0 -5px #d9c39a, 0 24px 60px rgba(10,8,20,.55)", textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: 8, fontWeight: 600, color: "#9c4634", marginBottom: 22 }}>HIKMAH</div>
            <div style={{ fontFamily: SERIF, fontSize: 60, lineHeight: 1.24, fontWeight: 400, color: "#3b2a22" }}>
              {HIKMAH.words.map((w, n) => (
                <span key={n} style={{ color: t >= w.s ? "#3b2a22" : "#b9a888" }}>
                  {w.w}{" "}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {outro > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: outro, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 430 }} />
          <div style={{ marginTop: 40, fontFamily: FONT, color: "#e8f2ec", fontSize: 32, letterSpacing: 3, fontWeight: 500 }}>Created by Agus Dwi R.</div>
        </div>
      ) : null}
    </>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      <Stage3D background="#28335f" fadeColor="#141a33" fade={1 - ramp(t, 0.05, 1.2)} overlay={() => <Overlay t={t} />}>
        <Scene t={t} frame={frame} />
      </Stage3D>
      <Html5Audio src={staticFile("audio/ep04/full.wav")} />
    </>
  );
};
