// Story state as pure functions of film time: where the carrier is on the hill, how full each pot
// is, how the pots feel, when the flowers sprout and open, when the crack turns to gold.
import * as THREE from "three";
import { CRACK_LEAK, POT_DROP, YOKE_HALF, yokeY, type CarrierPose, type PotPose } from "./Characters";
import { E, SPRING, T, TOTAL_SECONDS, clamp, groundY, hash, kv, lerp, mouthOf, pathAt, pathYaw, ramp, speaking, win, type V3 } from "./layout";

/* ---------- carrier travel: u < 0 is the walk out of the spring pool ---------- */
const U0 = -0.06;
/** time-lapse window ("setiap hari, selama dua tahun") */
export const TL_A = T.s3c - 0.2;
export const TL_B = T.s3d - 0.5;
const TL_CYCLES = 3;

type Seg = [number, number, number, number]; // t0, t1, u0, u1 (linear walk)
const SEGS: Seg[] = [
  [-1, T.s2d - 0.3, U0, U0],
  [T.s2d - 0.3, T.s2e - 0.05, U0, 0.13],
  [T.s2e - 0.05, T.s3a - 0.05, 0.34, 0.48],
  [T.s3a - 0.05, T.s3b - 0.05, 0.6, 0.71],
  [T.s3b - 0.05, T.s3b + 4.2, 0.83, 1],
  [T.s3b + 4.2, TL_A, 1, 1],
  // TL handled separately
  [TL_B, T.s4a - 0.05, 1, 1],
  [T.s4a - 0.05, T.s5a, U0, U0],
  [T.s5a, T.s5c - 0.05, U0, 0.33],
  [T.s5c - 0.05, T.s5c + 2.8, 0.9, 1],
  [T.s5c + 2.8, TOTAL_SECONDS + 1, 1, 1],
];
export const uAt = (t: number): number => {
  if (t >= TL_A && t < TL_B) {
    const k = ((t - TL_A) / (TL_B - TL_A)) * TL_CYCLES;
    const f = k - Math.floor(k);
    return lerp(U0, 1, f);
  }
  for (const [a, b, u0, u1] of SEGS) if (t >= a && t < b) return lerp(u0, u1, (t - a) / (b - a));
  return 1;
};
export const isTimelapse = (t: number) => t >= TL_A && t < TL_B;

export const carrierXZ = (u: number): V3 => {
  if (u >= 0) return pathAt(u);
  const k = clamp(-u / -U0);
  const p0 = pathAt(0);
  return [lerp(p0[0], SPRING[0], k), 0, lerp(p0[2], SPRING[2], k)];
};
const moving = (t: number) => {
  const d = Math.abs(uAt(t + 0.05) - uAt(t - 0.05));
  return d > 0.2 ? 0 : clamp((d / 0.1) * 48 / 1.2);
};

/* ---------- carrier pose ---------- */
const blinkAt = (t: number, seed: number) => {
  const period = 3.3 + hash(seed) * 1.5;
  const u = ((t + seed) % period) / 0.16;
  return u < 1 ? Math.sin(u * Math.PI) : 0;
};
export const carrierPose = (t: number): CarrierPose => {
  const u = uAt(t);
  const p = carrierXZ(u);
  const inPool = u < 0 ? 1 - clamp((u - U0) / 0.03) : 0;
  const gy = u < 0 ? lerp(groundY(p[0], p[2]), POOL_FLOOR, inPool) : groundY(p[0], p[2]);
  // distance walked drives the step phase
  const dist = u * 48 + (isTimelapse(t) ? 0 : 0);
  const mv = moving(t);
  const yaw = pathYaw(clamp(u, 0, 1));
  const crouch = win(t, T.s2b - 0.2, T.s2b + 1.0, E.s2b - 0.4, E.s2b + 0.8) * 0.85;
  const tk = speaking("tukang", t);
  const toPot = Math.max(speaking("retak", t) * 0.9, tk * 0.8, win(t, T.s4a + 4, T.s4a + 5, E.s4g, E.s4g + 0.6), win(t, T.s5d - 0.4, T.s5d, E.s6f + 0.8, E.s6f + 2));
  const listenUtuh = win(t, T.s3d - 0.2, T.s3d + 0.3, E.s3d, E.s3d + 0.6);
  const smile = Math.max(win(t, T.s4f - 0.2, T.s4f + 0.5, E.s4g, E.s4g + 0.5), win(t, T.s6a, T.s6a + 0.8, E.s6f + 1, E.s6f + 3)) * 0.9 - 0.1 * (1 - toPot);
  return {
    pos: [p[0], gy, p[2]],
    yaw,
    phase: dist * 3.4 + (isTimelapse(t) ? t * 30 : 0),
    stride: mv,
    crouch,
    headYaw: toPot * 0.95 - listenUtuh * 0.7 + Math.sin(t * 0.37) * 0.05,
    headPitch: toPot * 0.42 + listenUtuh * 0.2 + crouch * 0.3 + (tk > 0 ? Math.sin(t * 3.1) * 0.03 : 0),
    mouth: mouthOf("tukang", t),
    smile,
    brow: win(t, T.s4c - 0.2, T.s4c + 0.3, E.s4c, E.s4c + 0.5) * 0.8,
    gesture: tk * 0.9,
    gestureOsc: Math.sin(t * 4.2),
    blink: blinkAt(t, 3),
  };
};
export const POOL_FLOOR = -0.22;

/* ---------- pots ---------- */
const fillK = (t: number) => (t < T.s2b + 0.6 ? (t < T.s2b - 1 ? 0.05 : 0.05 + 0.95 * ramp(t, T.s2b + 0.4, E.s2b)) : 1);
export const levelCracked = (t: number) => {
  const u = uAt(t);
  return fillK(t) * (1 - 0.5 * clamp(u));
};
export const levelWhole = (t: number) => fillK(t);

/** sway of the hanging pots: walking swing + a lag when he crouches */
const sway = (t: number, side: number) => {
  const c = carrierPose(t);
  return {
    roll: Math.sin(c.phase * 0.5 + side) * 0.06 * c.stride + Math.sin(t * 0.9 + side) * 0.012,
    pitch: Math.cos(c.phase + side) * 0.05 * c.stride,
  };
};

export const crackedPose = (t: number): PotPose => {
  const talk = mouthOf("retak", t);
  const sp = speaking("retak", t);
  const ashamed = Math.max(win(t, T.s3e - 0.5, T.s3f, T.s4f, T.s4f + 1.5), win(t, T.s5c + 2.5, T.s5c + 4, T.s6a + 2, T.s6a + 4));
  const looksFlowers = win(t, T.s5a + 2.2, T.s5a + 3.4, E.s5b, T.s5c + 1.5);
  const cheered = win(t, T.s5b - 0.3, T.s5b + 0.6, T.s5c + 2, T.s5c + 3.2);
  const lifted = ramp(t, T.s6d, E.s6f);
  const turnToCarrier = Math.max(sp, win(t, T.s4c - 0.3, T.s4c, E.s4g, E.s4g + 0.8), win(t, T.s6a - 0.4, T.s6a + 0.2, E.s6f, E.s6f + 1.5));
  const s = sway(t, 0);
  const sad = Math.max(ashamed, sp * 0.9) * (1 - lifted);
  return {
    level: levelCracked(t),
    yaw: -turnToCarrier * 1.15 + looksFlowers * 0.9,
    pitch: sad * 0.28 - lifted * 0.12 - cheered * 0.08 + s.pitch + (sp > 0 ? Math.sin(t * 5.3) * 0.02 : 0),
    roll: s.roll + looksFlowers * 0.1,
    mouth: talk,
    smile: lerp(lerp(0.25, -0.75, sad), 0.95, Math.max(cheered * 0.8, lifted)),
    brow: sad * 1 - lifted * 0.2,
    eye: lerp(1, 0.8, sad) * (1 - blinkAt(t, 7) * 0.92),
    gaze: sad * 1 - looksFlowers * 0.3,
  };
};

export const wholePose = (t: number): PotPose => {
  const talk = mouthOf("utuh", t);
  const proud = Math.max(win(t, T.s3a - 0.2, T.s3a + 1, E.s3a + 2, E.s3a + 3), win(t, T.s3d - 0.4, T.s3d + 0.3, E.s3e, E.s3e + 1.2));
  const humble = ramp(t, T.s7a, T.s7a + 2.5);
  const s = sway(t, 2);
  return {
    level: levelWhole(t),
    yaw: speaking("utuh", t) * 0.9 + win(t, T.s6b - 0.3, T.s6b + 0.4, E.s6b, E.s6b + 0.8) * 0.5,
    pitch: -proud * 0.22 + s.pitch + humble * 0.08,
    roll: s.roll - proud * 0.05,
    mouth: talk,
    smile: lerp(0.35, 0.85, proud),
    brow: -proud * 1 + win(t, T.s6b, T.s6b + 0.5, E.s6b, E.s6b + 1) * 0.5,
    eye: lerp(1, 0.55, proud) * (1 - blinkAt(t, 13) * 0.92),
    gaze: -proud * 0.4,
  };
};

/* ---------- pot world positions (for drips and cameras) ---------- */
/** world position of a yoke end (side +1 = cracked pot, his left) */
export const yokeEnd = (t: number, side: number): V3 => {
  const c = carrierPose(t);
  const bob = c.stride * Math.abs(Math.cos(c.phase)) * 0.035;
  const lx = side * YOKE_HALF, ly = yokeY(c.crouch, bob), lz = -0.06;
  const cs = Math.cos(c.yaw), sn = Math.sin(c.yaw);
  return [c.pos[0] + lx * cs + lz * sn, c.pos[1] + ly, c.pos[2] - lx * sn + lz * cs];
};
/** pot belly centre in world */
export const potCenter = (t: number, side: number): V3 => {
  const y = yokeEnd(t, side);
  return [y[0], y[1] - POT_DROP + 0.32, y[2]];
};
/** leak point world position (ignores the small emotional tilt) */
export const leakAt = (t: number): V3 => {
  const c = carrierPose(t);
  const p = crackedPose(t);
  const y = yokeEnd(t, 1);
  const a = c.yaw + p.yaw;
  const [lx, ly, lz] = CRACK_LEAK;
  return [y[0] + lx * Math.cos(a) + lz * Math.sin(a), y[1] - POT_DROP + ly, y[2] - lx * Math.sin(a) + lz * Math.cos(a)];
};

/** Falling drops: emitted while the cracked pot holds more than half its water and the carrier walks. */
export type Drop = { p: V3; k: number; splash: number };
export const dropsAt = (t: number): Drop[] => {
  const out: Drop[] = [];
  const dt = isTimelapse(t) ? 0.05 : 0.22;
  const base = Math.floor(t / dt);
  for (let i = 0; i < 9; i++) {
    const te = (base - i) * dt + hash(base - i) * dt * 0.5;
    if (te > t || te < 0) continue;
    const lvl = levelCracked(te);
    const walking = moving(te) > 0.3;
    const idle = (t > 0.3 && t < T.s2a) || win(te, T.s4a, T.s4a + 0.1, E.s4g, E.s4g + 0.1) > 0.5;
    if (!(lvl > 0.5 && lvl < 0.995 && walking) && !(idle && (base - i) % 5 === 0)) continue;
    const src = leakAt(te);
    const age = t - te;
    const y = src[1] - 0.6 * age - 4.9 * age * age;
    const g = groundY(src[0], src[2]);
    if (y > g) out.push({ p: [src[0], y, src[2]], k: clamp(age * 6), splash: 0 });
    else {
      // time since impact
      const tf = (-0.6 + Math.sqrt(0.36 + 19.6 * (src[1] - g))) / 9.8;
      const sa = age - tf;
      if (sa < 0.35) out.push({ p: [src[0], g + 0.01, src[2]], k: 1, splash: sa / 0.35 });
    }
  }
  return out;
};

/* ---------- flowers ---------- */
/** sprouting during the two-year time-lapse, by position along the path */
export const sproutAt = (t: number, u: number) => ramp(t, TL_A + 0.2 + u * 1.4, TL_B + 0.6 + u * 1.2);
/** blooming as the cracked pot walks past them in s5a; all open from s5c on */
export const bloomAt = (t: number, u: number) => {
  if (t < T.s5a) return 0;
  if (t >= T.s5c - 0.3) return 1;
  return clamp((uAt(t) + 0.11 - u) / 0.07);
};
export const crackGoldAt = (t: number) => clamp(ramp(t, T.s6a + 1.2, T.s6a + 3.6) * 0.75 + ramp(t, T.s6f, E.s6f + 1) * 0.25 + ramp(t, T.s7a, T.s7a + 1.5) * 0.3);
export const seamGoldAt = (t: number) => ramp(t, T.s7a + 0.6, T.s7a + 2.6);
/** gold seam drawn along the flowered edge of the path (the leak line, made visible) */
export const goldLineAt = (t: number) => ramp(t, T.s6c + 0.5, E.s6d + 0.5);
/** memory seeds falling along the edge */
export const seedsAt = (t: number) => win(t, T.s6c + 1.5, T.s6c + 2.5, E.s6c + 0.6, E.s6c + 1.6);

/* ---------- light ---------- */
export const sunDir = (t: number): THREE.Vector3 => {
  // low morning sun from the east (+x, toward the spring), sweeping during the time-lapse
  let az = 0.85, el = 0.42;
  if (isTimelapse(t)) {
    const k = ((t - TL_A) / (TL_B - TL_A)) * TL_CYCLES;
    const f = k - Math.floor(k);
    az = lerp(1.4, -1.2, f);
    el = 0.25 + Math.sin(f * Math.PI) * 0.6;
  }
  const settle = ramp(t, T.s7b, TOTAL_SECONDS);
  el = lerp(el, 0.3, settle);
  return new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
};
export const timelapseFlicker = (t: number) => {
  if (!isTimelapse(t)) return 0;
  const k = ((t - TL_A) / (TL_B - TL_A)) * TL_CYCLES;
  const f = k - Math.floor(k);
  return 1 - Math.sin(f * Math.PI);
};
export { kv };
