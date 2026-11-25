// EP10 story state: every uniform of the window and every camera key is derived from the locked
// voice timeline (clip ids), so nothing is hard-coded to seconds.
import timeline from "./timeline.json";
import type { GlassState, V4 } from "./Cathedral";
import { HORIZON } from "./glass";
import { track } from "../../kits/stainedglass/core/motion";
import type { StainedShot } from "../../kits/stainedglass/lib/post";

export type Word = { w: string; s: number; e: number };
export type Clip = { id: string; who: string; text: string; start: number; end: number; words: Word[] };
export const CLIPS = timeline.clips as Clip[];
export const TOTAL = timeline.total;
export const T: Record<string, number> = Object.fromEntries(CLIPS.map((c) => [c.id, c.start]));
export const E: Record<string, number> = Object.fromEntries(CLIPS.map((c) => [c.id, c.end]));
export const OUTRO = TOTAL - 3;

export const WHO: Record<string, number> = { cinta: 0, kekayaan: 1, kegembiraan: 2, kecantikan: 3, kesedihan: 4, waktu: 5, penduduk: 6 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const sm = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** eased piecewise interpolation through [time, value] keys */
const keys = (k: [number, number][], t: number) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], sm(k[i][0], k[i + 1][0], t));
  }
  return k[k.length - 1][1];
};
/** a step value that switches at given times */
const steps = (k: [number, number][], t: number) => {
  let v = k[0][1];
  for (const [tt, vv] of k) if (t >= tt) v = vv;
  return v;
};
const bump = (a: number, b: number, c: number, d: number, t: number) => sm(a, b, t) * (1 - sm(c, d, t));

// ---- character tracks: [time, x, yRel, waterFactor, scale, boat] ----
type CK = [number, number, number, number, number, number];
const OFF = 7.8; // behind the stone, outside the window
const ISLE_Y = -1.62;
const HZ = HORIZON;

const tS2 = T.s2a - 0.5; // cut from the hook to "alkisah" (hidden by the glass going dark)
const t3d = T.s3d;
const tA10 = T.s10a - 1.4;

const TRACKS: CK[][] = [
  // 0 Cinta
  [
    [0, 0.45, -1.6, 0, 1.6, 0],
    [tS2 - 0.45, 0.45, -1.6, 0, 1.6, 0],
    [tS2 - 0.4, 0.0, ISLE_Y, 0, 1.2, 0],
    [T.s3e, 0.0, ISLE_Y, 0, 1.2, 0],
    [E.s3e, 0.45, -1.6, 0, 1.6, 0],
    [T.s8d, 0.45, -1.6, 0, 1.6, 0],
    [T.s8d + 1.0, 0.55, -0.9, 0.5, 1.45, 0],
    [T.s8d + 2.2, 1.35 - 0.75, 0.3, 1, 1.3, 1],
    [E.s8d2, 5.0 - 0.75, 0.3, 1, 1.3, 1],
    [T.s8e + 1.5, 5.0 - 0.75, 0.3, 1, 1.3, 1],
    [T.s8e + 2.6, 4.0, -0.5, 0.5, 1.35, 0],
    [T.s8e + 3.6, 4.05, ISLE_Y + 0.05, 0, 1.4, 0],
  ],
  // 1 Kekayaan
  [
    [0, -4.5, 0, 1, 1.2, 1],
    [tS2 - 0.45, -4.5, 0, 1, 1.2, 1],
    [tS2 - 0.4, -0.75, ISLE_Y, 0, 1.15, 0],
    [t3d, -0.75, ISLE_Y, 0, 1.15, 0],
    [t3d + 0.7, -0.75, 0, 1, 1.1, 1],
    [t3d + 3.5, -OFF, 0, 1, 1.1, 1],
    [T.s4a - 0.5, -OFF, 0, 1, 1.2, 1],
    [T.s4a + 3.0, -1.1, 0, 1, 1.2, 1],
    [E.s4d, -1.1, 0, 1, 1.2, 1],
    [T.s4f + 1.5, -OFF, 0, 1, 1.2, 1],
    [tA10, -OFF, 0, 1, 1.2, 1],
    [tA10 + 0.01, -4.9, HZ - 0.08, 0, 0.6, 1],
  ],
  // 2 Kegembiraan
  [
    [0, 1.35, HZ, 0, 0.42, 1],
    [tS2 - 0.45, 1.35, HZ, 0, 0.42, 1],
    [tS2 - 0.4, 0.75, ISLE_Y, 0, 1.15, 0],
    [t3d + 0.4, 0.75, ISLE_Y, 0, 1.15, 0],
    [t3d + 1.1, 0.75, 0, 1, 1.1, 1],
    [t3d + 3.6, OFF, 0, 1, 1.1, 1],
    [T.s5a - 0.3, OFF, 0, 1, 1.15, 1],
    [T.s5c, 2.4, 0, 1, 1.15, 1],
    [E.s5d, -OFF, 0, 1, 1.15, 1],
    [tA10, -OFF, 0, 1, 1.15, 1],
    [tA10 + 0.01, -1.35, HZ - 0.02, 0, 0.5, 1],
  ],
  // 3 Kecantikan
  [
    [0, -3.45, HZ, 0, 0.42, 1],
    [tS2 - 0.45, -3.45, HZ, 0, 0.42, 1],
    [tS2 - 0.4, 1.5, ISLE_Y, 0, 1.15, 0],
    [t3d + 0.2, 1.5, ISLE_Y, 0, 1.15, 0],
    [t3d + 0.9, 1.5, 0, 1, 1.1, 1],
    [t3d + 3.8, -OFF, 0, 1, 1.1, 1],
    [T.s6a - 0.4, -OFF, 0, 1, 1.15, 1],
    [T.s6a + 3.2, -1.1, 0, 1, 1.15, 1],
    [E.s6d, -1.1, 0, 1, 1.15, 1],
    [T.s6e + 2.5, -OFF, 0, 1, 1.15, 1],
    [tA10, -OFF, 0, 1, 1.15, 1],
    [tA10 + 0.01, -3.6, HZ, 0, 0.5, 1],
  ],
  // 4 Kesedihan
  [
    [0, 6.0, HZ - 0.05, 0, 0.4, 1],
    [tS2 - 0.45, 6.0, HZ - 0.05, 0, 0.4, 1],
    [tS2 - 0.4, -1.5, ISLE_Y, 0, 1.15, 0],
    [t3d + 0.3, -1.5, ISLE_Y, 0, 1.15, 0],
    [t3d + 1.0, -1.5, 0, 1, 1.1, 1],
    [t3d + 3.7, OFF, 0, 1, 1.1, 1],
    [T.s7a - 0.4, OFF, 0, 1, 1.15, 1],
    [T.s7a + 2.5, 1.45, 0, 1, 1.15, 1],
    [E.s7c, 1.45, 0, 1, 1.15, 1],
    [E.s7d, OFF, 0, 1, 1.15, 1],
    [tA10, OFF, 0, 1, 1.15, 1],
    [tA10 + 0.01, 1.45, HZ - 0.02, 0, 0.5, 1],
  ],
  // 5 Waktu
  [
    [0, 4.0, 0, 1, 1.5, 1],
    [tS2 - 0.45, 4.0, 0, 1, 1.5, 1],
    [tS2 - 0.4, OFF + 1, 0, 1, 1.5, 1],
    [T.s8a + 1.0, OFF + 1, 0, 1, 1.5, 1],
    [T.s8b + 1.0, 1.35, 0, 1, 1.5, 1],
    [T.s8d2, 1.35, 0, 1, 1.5, 1],
    [E.s8d2, 5.0, 0, 1, 1.5, 1],
    [T.s8e2, 5.2, 0, 1, 1.5, 1],
    [E.s8e2 + 1.0, 6.05, HZ - 0.06, 0, 0.5, 1],
    [T.s9h, 6.1, HZ - 0.04, 0, 0.45, 1],
    [E.s9h, 6.3, HZ - 0.02, 0, 0.3, 1],
  ],
  // 6 Penduduk
  [
    [0, 5.45, ISLE_Y, 0, 0, 0],
    [T.s9b - 0.3, 5.45, ISLE_Y, 0, 0, 0],
    [T.s9b + 0.9, 5.45, ISLE_Y + 0.05, 0, 1.35, 0],
  ],
];

const charAt = (k: number, t: number, water: number): V4 => {
  const tr = TRACKS[k];
  const v = (i: number) => keys(tr.map((r) => [r[0], r[i]] as [number, number]), t);
  const s = v(4);
  const boat = steps(tr.map((r) => [r[0], r[5]] as [number, number]), t);
  const wf = v(3);
  const bob = 0.035 * Math.sin(t * 1.7 + k * 1.3);
  const y = v(2) + wf * (water - 0.32 * s + bob);
  return [v(1), y, s, boat];
};

const speaking = (k: number, t: number) => {
  let hi = 0, talk = 0;
  for (const c of CLIPS) {
    if (WHO[c.who] !== k) continue;
    hi = Math.max(hi, bump(c.start - 0.35, c.start, c.end + 0.2, c.end + 0.7, t));
    if (t >= c.start - 0.1 && t <= c.end + 0.1)
      for (const w of c.words) if (t >= w.s && t <= w.e) talk = 0.45 + 0.55 * Math.abs(Math.sin((t - w.s) * 17));
  }
  return { hi, talk };
};

/** a name said in narration lights that figure up */
const named = (k: number, t: number) => {
  const names = ["Cinta", "Kekayaan", "Kegembiraan", "Kecantikan", "Kesedihan", "Waktu", "penduduk"];
  let hi = 0;
  for (const c of CLIPS) {
    if (c.who !== "narator" || t < c.start - 1 || t > c.end + 2) continue;
    for (const w of c.words) if (w.w.replace(/[^\p{L}]/gu, "") === names[k]) hi = Math.max(hi, bump(w.s - 0.15, w.s + 0.1, w.e + 0.8, w.e + 1.6, t));
  }
  return hi;
};

export const flashAt = (t: number) => {
  const hits = [T.s3a + 1.6, T.s3b + 0.4, T.s3b2 + 2.4, T.s3c + 0.2, T.s4a - 0.6, T.s5e + 0.3, T.s7a + 0.2, T.s7e + 0.4, T.s7e + 3.0, T.s8a + 0.2, 1.4];
  let f = 0;
  for (const h of hits) if (t >= h) f = Math.max(f, Math.exp(-(t - h) * 7) + 0.5 * Math.exp(-Math.max(0, t - h - 0.18) * 9) * (t > h + 0.18 ? 1 : 0));
  return f;
};
export const FLASH_TIMES = () => [T.s3a + 1.6, T.s3b + 0.4, T.s3b2 + 2.4, T.s3c + 0.2, T.s4a - 0.6, T.s5e + 0.3, T.s7a + 0.2, T.s7e + 0.4, T.s7e + 3.0, T.s8a + 0.2, 1.4];

export const stateAt = (t: number): GlassState => {
  const hook = t < tS2 - 0.42;
  const storm = hook ? 1 : keys([[0, 0], [T.s3a, 0], [T.s3b + 1, 1], [T.s8d2, 1], [E.s8d2, 0.15], [T.s9a, 0]], t);
  const sun = hook ? 1 : keys([[0, 1], [T.s3a, 1], [T.s3b, 0], [T.s8a, 0], [T.s8a + 3, 1]], t);
  const water = hook
    ? -0.45
    : keys([[0, -2.15], [T.s3b, -2.15], [E.s3c, -1.8], [T.s3f, -1.8], [E.s3f, -1.42], [T.s5e, -1.42], [E.s5e, 0.0], [T.s7e, 0.0], [E.s7e, 0.6], [T.s8d, 0.6], [E.s8d, 1.0], [T.s8d2, 1.0], [T.s8e, -2.0]], t);
  const dim = 1 - sm(tS2 - 1.3, tS2 - 0.5, t) + sm(tS2 - 0.3, tS2 + 0.5, t);
  const reveal = hook ? keys([[0.3, 0], [5.2, 15]], t) : keys([[tS2 - 0.4, 0], [tS2 + 3.2, 15]], t);
  const isle1 = keys([[0, 0], [T.s8d, 0], [E.s8d2, -1.6]], t);
  const isle2 = sm(T.s8d2 + 1.5, T.s8e + 1, t);
  // hikmah lines: the matching figure lights up, the rest of the window dims a little
  const hikmah = [["s10a", 1], ["s10b", 2], ["s10c", 3], ["s10d", 4]] as const;
  let bg = 1;
  const po: V4[] = [];
  const ch: V4[] = [];
  for (let k = 0; k < 7; k++) ch.push(charAt(k, t, water));
  for (let k = 0; k < 7; k++) {
    const sp = speaking(k, t);
    let hi = Math.max(sp.hi, named(k, t));
    for (const [id, kk] of hikmah) if (kk === k) hi = Math.max(hi, 1.4 * bump(T[id] - 0.3, T[id], E[id] + 0.3, E[id] + 0.9, t));
    po.push([1, 0, hi, sp.talk]);
  }
  for (const [id] of hikmah) bg = Math.min(bg, 1 - 0.3 * bump(T[id] - 0.3, T[id], E[id] + 0.3, E[id] + 0.9, t));
  // facing and poses
  const love = po[0];
  const towards = (x: number) => (x >= ch[0][0] ? 1 : -1);
  love[0] = hook ? 1 : t < T.s3e ? 1 : t < E.s3e ? (Math.sin((t - T.s3e) * 1.6) > 0 ? 1 : -1) : t < T.s4a + 1 ? 1 : t < T.s5a ? -1 : t < T.s6a ? towards(ch[2][0]) : t < T.s7a ? -1 : 1;
  love[1] = hook
    ? 1
    : keys([[0, 0], [T.s3f, 0], [T.s3f + 1, 1], [T.s4a, 1], [T.s4b, 1], [E.s4e, 1], [E.s4e + 0.8, 0], [T.s5b - 0.4, 0], [T.s5b, 1], [E.s5d, 1], [E.s5d + 0.6, 0], [T.s6b - 0.4, 0], [T.s6b, 1], [E.s6d, 1], [T.s6e, 3], [T.s7a + 0.8, 3], [T.s7b - 0.2, 1], [T.s8d + 2, 1], [T.s8d + 2.6, 0], [T.s8e + 4, 0]], t);
  if (t > T.s9c - 0.3 && t < E.s9f + 0.4) love[1] = keys([[T.s9c - 0.3, 0], [T.s9c, 1], [E.s9c, 1], [E.s9c + 0.5, 0], [T.s9e, 0], [T.s9e + 0.3, 1], [E.s9f, 1], [E.s9f + 0.4, 0]], t);
  if (t >= T.s8c) love[0] = 1;
  if (t >= T.s3e && t < E.s3f) love[2] = Math.max(love[2], 0.8);
  if (t >= T.s10e) love[2] = Math.max(love[2], sm(T.s10e, T.s10e + 1, t));
  // Wealth: comes to Love facing right, leaves facing left; rows unless he is talking
  po[1][0] = t < tS2 - 0.42 ? -1 : t < t3d ? 1 : t < t3d + 0.7 ? 1 : t < T.s4a - 0.5 ? -1 : t < E.s4d ? 1 : -1;
  po[1][1] = t < tS2 - 0.42 ? 4 : t < t3d + 0.7 ? 0 : t > T.s4c - 0.3 && t < E.s4d ? 0 : 4;
  // Joy: always delighted, arms up
  po[2][0] = t < tS2 - 0.42 ? 1 : t < t3d + 1.1 ? -1 : t < T.s5a - 0.3 ? 1 : -1;
  po[2][1] = t < tS2 - 0.42 ? 2 : t < t3d + 0.4 ? keys([[0, 0], [T.s2b, 0], [T.s2b + 3, 2]], t) : 2;
  // Beauty
  po[3][0] = t < tS2 - 0.42 ? -1 : t < t3d + 0.9 ? -1 : t < T.s6a - 0.4 ? -1 : t < E.s6d ? 1 : -1;
  po[3][1] = t > T.s6c - 0.3 && t < E.s6d ? 0 : t > t3d + 0.9 ? 4 : 0;
  // Sadness: rows alone
  po[4][0] = t < tS2 - 0.42 ? 1 : t < t3d + 1 ? 1 : t < T.s7a - 0.4 ? 1 : t < E.s7c ? -1 : 1;
  po[4][1] = t > t3d + 1 ? 4 : 0;
  // Time: reaches for Love, then rows; leaves facing away
  po[5][0] = t < tS2 - 0.42 ? -1 : t < T.s8e2 ? -1 : 1;
  po[5][1] = t < tS2 - 0.42 ? 1 : t < T.s8d + 2 ? 1 : 4;
  if (t >= T.s8a) po[5][2] = Math.max(po[5][2], 0.7);
  if (t > T.s9d && t < E.s9d + 2) po[5][2] = Math.max(po[5][2], 1.6 * bump(T.s9d + 1, T.s9d + 1.6, E.s9d + 1, E.s9d + 2, t));
  if (t >= T.s9h) po[5][2] = Math.max(po[5][2], 1.4);
  if (t >= T.s10e) po[5][2] = Math.max(po[5][2], 1.6);
  // Resident
  po[6][0] = -1;
  po[6][1] = t > T.s9g - 0.2 && t < E.s9g + 0.3 ? 1 : 0;
  if (hook) {
    po[1][2] = 0.2; po[2][2] = 0; po[3][2] = 0; po[4][2] = 0; po[5][2] = 0.8; love[2] = 0.8;
  }
  const heart = 1.0 + 0.9 * bump(T.s9g + 1.5, T.s9g + 2.5, E.s9h, E.s9h + 1, t) + 1.2 * sm(T.s10e, T.s10e + 2, t) + (hook ? 0.4 : 0);
  const glow = 1.15 + 0.2 * sun * (1 - storm) - 0.15 * storm * (hook ? 0 : 1) + 0.25 * sm(T.s10e, T.s10e + 3, t);
  const pool = 0.25 + 0.75 * sm(T.s10e, T.s10f, t);
  return { glow, storm, sun, water, flash: flashAt(t), reveal, dim, bg, heart, isle1, isle2, pool, ch, po };
};

// ---- camera: [time, x, y, distance] keyed to the clips; Catmull-Rom so it never stops ----
const CAM: [number, number, number, number][] = [
  [0, 0, 4.4, 3.4],
  [T.s1b, 0, 2.8, 7.0],
  [T.s1c, 0, 1.3, 11.4],
  [tS2 - 0.6, 0, 1.2, 11.6],
  [tS2, 0, 0.6, 9.5],
  [T.s2b, 0, 0.3, 7.8],
  [E.s2b, 0.3, 0.3, 7.6],
  [T.s2c + 2, 2.2, 1.0, 8.0],
  [T.s3a, 0.6, 1.3, 11.0],
  [T.s3c, -0.4, 1.2, 10.6],
  [T.s3d + 1, 0.0, 0.9, 10.0],
  [T.s3e, 0.3, 0.1, 7.0],
  [E.s3f, 0.45, 0.2, 6.6],
  [T.s4a + 1, -0.8, 0.0, 7.4],
  [T.s4c, -0.35, 0.0, 6.8],
  [E.s4d, -0.3, 0.0, 6.8],
  [T.s4e + 1, -3.0, 0.2, 7.6],
  [T.s4f, 0.45, 0.2, 6.2],
  [T.s5a, 2.2, -0.1, 7.4],
  [T.s5c, 1.0, -0.1, 6.6],
  [T.s5d + 2, -1.6, 0.0, 7.4],
  [T.s5e, 0.45, 0.3, 6.0],
  [T.s6a + 1, -0.8, 0.1, 7.4],
  [T.s6c, -0.35, 0.1, 6.8],
  [T.s6e, 0.45, 0.5, 5.6],
  [T.s7a + 1, 1.3, 0.2, 7.4],
  [T.s7c, 1.0, 0.2, 6.8],
  [T.s7d + 2, 3.0, 0.3, 7.6],
  [T.s7e, 0.45, 0.7, 5.6],
  [E.s7e, 0.45, 0.8, 5.8],
  [T.s8a + 2, 1.5, 1.4, 10.6],
  [T.s8b + 1, 1.0, 0.5, 8.0],
  [T.s8c, 0.9, 0.4, 7.2],
  [T.s8d + 2, 1.0, 0.6, 7.2],
  [E.s8d2, 4.4, 0.2, 7.4],
  [T.s8e + 2, 4.6, -0.2, 6.8],
  [T.s8e2 + 1, 4.9, 0.3, 7.6],
  [T.s9a + 1, 4.7, -0.2, 6.2],
  [T.s9d, 4.9, 0.3, 7.0],
  [T.s9g, 4.7, 0.1, 6.4],
  [T.s9h + 1, 4.3, 0.7, 7.8],
  [T.s10a + 0.5, 0.0, 1.3, 11.6],
  [T.s10d, 0.0, 1.2, 11.9],
  [T.s10e, 0.0, 1.4, 12.2],
  [T.s10f, 0.0, -0.6, 9.8],
  [T.s10g, 0.0, -1.1, 9.0],
  [TOTAL, 0.0, -1.2, 8.8],
];

export const shotAt = (t: number): StainedShot => {
  const k = CAM.map(([tt, x, y, d]) => ({ t: tt, v: [x, y, d] as [number, number, number] }));
  const [x, y, d] = track(k, t);
  const low = sm(T.s10f - 1, T.s10g, t); // crane down to the sill: the floor pool and the plaque
  const dx = Math.sin(t * 0.21) * 0.08 + Math.sin(t * 0.53) * 0.03;
  const dy = Math.cos(t * 0.17) * 0.05;
  return {
    pos: [x + dx, y - 0.6 - 1.6 * low + dy, d],
    target: [x, y + 0.2 * low, 0],
    fov: 42 + 6 * low,
    roll: Math.sin(t * 0.13) * 0.006,
    exposure: 1.0,
  };
};
