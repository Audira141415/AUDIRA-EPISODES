// EP58 Mongolia — film clock: which set is on screen, where every herd is, and the camera per shot.
// Seconds of film = seconds of VO (offset 0). Pure TS, deterministic.

import { mulberry32 } from "../../kits/worldforge/noise.ts";
import { LOC, gy, type V3 } from "./terrain.ts";

export const EPISODE_SECONDS = 86;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** Ease in-out over a shot, with a little constant drift so the camera is never parked. */
const glide = (t: number, a: number, b: number) => 0.85 * ss(a, b, t) + 0.15 * clamp01((t - a) / (b - a));

// ── Sets (multi-scene director) ───────────────────────────────────────────────
export type SetId = "hook" | "valley" | "camp" | "lone" | "graze" | "war" | "airag" | "race" | "portrait" | "ridge";
export const SETS: { id: SetId; t0: number; t1: number }[] = [
  { id: "hook", t0: 0, t1: 6.7 },
  { id: "valley", t0: 6.7, t1: 12.4 },
  { id: "camp", t0: 12.4, t1: 19.5 },
  { id: "lone", t0: 19.5, t1: 27.3 },
  { id: "graze", t0: 27.3, t1: 41.5 },
  { id: "war", t0: 41.5, t1: 50.9 },
  { id: "airag", t0: 50.9, t1: 60.3 },
  { id: "race", t0: 60.3, t1: 69.6 },
  { id: "portrait", t0: 69.6, t1: 78.9 },
  { id: "ridge", t0: 78.9, t1: 999 },
];
export const setAt = (t: number): SetId => (SETS.find((s) => t < s.t1) ?? SETS[SETS.length - 1]).id;

// ── Herds ─────────────────────────────────────────────────────────────────────
export type Rider = "none" | "warrior" | "jockey";
export type HorseSpec = { model: "horse" | "wild" | "saddled" | "draft"; coat: string; phase: number; rate: number; scale: number };

const COAT_LIST = ["bay", "chestnut", "dun", "grey", "black", "bay", "dun", "chestnut", "white"] as const;
const herdSpec = (i: number, rnd: () => number, models: HorseSpec["model"][] = ["horse", "wild"]): HorseSpec => ({
  model: models[i % models.length],
  coat: COAT_LIST[Math.floor(rnd() * COAT_LIST.length)],
  phase: rnd() * 3,
  rate: 0.95 + rnd() * 0.15,
  scale: 0.92 + rnd() * 0.14,
});

/** Hook: 14 horses galloping toward +z through tall grass. */
export const HOOK_HERD = (() => {
  const rnd = mulberry32(5801);
  return Array.from({ length: 14 }, (_, i) => ({
    ...herdSpec(i, rnd),
    x: (i % 2 ? 1 : -1) * (0.6 + ((i * 1.7) % 7)) + (rnd() - 0.5) * 1.5,
    z0: -24 - (i === 0 ? 0 : 3 + rnd() * 16),
    v: 10 + rnd() * 1.2,
  }));
})();
export const hookZ = (h: { z0: number; v: number }, t: number) => h.z0 + h.v * t;
const hookCenter = (t: number) => -30 + 10.5 * t;

/** Valley: a big herd flowing +x along the trough. */
export const vzAt = (x: number) => LOC.valley.z + 25 * Math.sin(x / 180);
export const VALLEY_HERD = (() => {
  const rnd = mulberry32(5802);
  return Array.from({ length: 64 }, (_, i) => ({ ...herdSpec(i, rnd), x0: -275 + rnd() * 64, dz: (rnd() - 0.5) * 34, v: 7 + rnd() * 0.9 }));
})();
export const valleyX = (h: { x0: number; v: number }, t: number) => h.x0 + h.v * (t - 6.7);
const valleyCenter = (t: number) => -243 + 7.45 * (t - 6.7);

/** Lone horse walking +x. */
export const loneX = (t: number) => LOC.lone.x - 10 + 1.5 * (t - 19.5);

/** War column: warriors on saddled horses, each with 3–4 spare horses. */
export const WAR_SPEED = 9;
export const warLead = (t: number) => -350 + WAR_SPEED * (t - 41.5);
export const WAR = (() => {
  const rnd = mulberry32(5803);
  const riders = Array.from({ length: 6 }, (_, i) => ({ dx: -(Math.floor(i / 2) * 9 + rnd() * 1.5), z: LOC.war.z + (i % 2 ? 3.2 : -3.2), phase: rnd() * 2, coat: ["#7a2e22", "#3d4d6a", "#5e4a2a", "#7a2e22", "#4a3a5c", "#2f4a3a"][i] }));
  const spares = riders.flatMap((r, ri) =>
    Array.from({ length: 3 + (ri % 2) }, (_, k) => ({
      rider: ri,
      dx: r.dx - 1.5 - k * 2.6 + (rnd() - 0.5),
      z: r.z + (r.z > LOC.war.z ? 1 : -1) * (2.6 + (k % 2) * 2.4) + (rnd() - 0.5) * 0.8,
      ...herdSpec(ri * 5 + k, rnd, ["horse", "wild"]),
    })),
  );
  return { riders, spares };
})();
/** Rider 0 swaps onto its first spare between these times. */
export const SWAP = { t0: 47.0, t1: 48.1 };

/** Naadam: seven horses with child jockeys, leader reaching the finish at 67.8 s. */
export const RACE_FINISH_T = 67.8;
export const raceLead = (t: number) => LOC.finishX - 14 * (RACE_FINISH_T - t);
export const RACERS = Array.from({ length: 7 }, (_, i) => ({
  lane: LOC.race.z + (i - 3) * 2.3,
  gap: [0, 2.2, 3.5, 5.8, 7.4, 9.6, 12][i],
  color: ["#d8342b", "#2a62c9", "#f2b51d", "#1f9a5a", "#8d3fc2", "#f07a1a", "#1aa6b7"][i],
  coat: ["bay", "chestnut", "grey", "dun", "black", "bay", "chestnut"][i],
  phase: i * 0.37,
}));
export const racerX = (r: { gap: number }, t: number) => raceLead(t) - r.gap;

/** Ridge silhouettes walking +x along the crest. */
export const RIDGE_HERD = (() => {
  const rnd = mulberry32(5804);
  return Array.from({ length: 13 }, (_, i) => ({ ...herdSpec(i, rnd), x0: -20 + i * 2.7 + rnd() * 1.2, dz: (i % 3 - 1) * 2.2 + (rnd() - 0.5), v: 1.55 }));
})();

// ── Snow / haze ───────────────────────────────────────────────────────────────
export const snowAt = (t: number) => (t < 27 || t > 41.6 ? 0 : ss(33.6, 36.6, t));
export const winterAt = (t: number) => t >= 36.0 && t < 41.5;
export const hazeAt = (t: number) => {
  // white-out carries the cut into winter (36.0) and the cut into the column (41.5)
  const w = Math.max(0, 1 - Math.abs(t - 36.0) / 0.75);
  return Math.pow(w, 0.8);
};

// ── Camera ───────────────────────────────────────────────────────────────────
export type Pose = { pos: V3; target: V3; fov: number; near: number };
const g = (x: number, z: number) => gy(x, z);

export const cameraAt = (t: number): Pose => {
  // S1 hook: low in the grass, crane up and back as the herd charges in
  if (t < 3.2) {
    const u = glide(t, 0, 3.2);
    const cz = lerp(7, 24, u);
    const zc = hookCenter(t);
    return { pos: [2.4, g(2.4, cz) + lerp(0.62, 5.2, u), cz], target: [0, g(0, zc) + lerp(1.15, 0.6, u), zc], fov: lerp(24, 30, u), near: 0.1 };
  }
  // S2 hook: side tracking with the herd, past the ger
  if (t < 6.7) {
    const u = glide(t, 3.2, 6.7);
    const zc = hookCenter(t) + 2;
    const cx = lerp(24, 17, u);
    return { pos: [cx, g(cx, zc) + 2.3, zc - 3], target: [-3, g(-3, zc) + 1.1, zc + 2], fov: 30, near: 0.2 };
  }
  // S3 valley: aerial drone sinking toward the flowing herd
  if (t < 12.4) {
    const u = glide(t, 6.7, 12.4);
    const xc = valleyCenter(t);
    const z = vzAt(xc);
    const gc = g(xc, z);
    return { pos: [xc + lerp(-30, 4, u), gc + lerp(30, 15, u), z + lerp(44, 28, u)], target: [xc + 4, gc + 1, z], fov: 36, near: 0.5 };
  }
  // S4 camp: slow wide orbit
  if (t < 19.5) {
    const u = glide(t, 12.4, 19.5);
    const a = lerp(0.35, 1.05, u), r = lerp(36, 30, u);
    const c = LOC.camp;
    const px = c.x + Math.sin(a) * r, pz = c.z + Math.cos(a) * r;
    return { pos: [px, g(px, pz) + lerp(11, 8.5, u), pz], target: [c.x, g(c.x, c.z) + 1.4, c.z], fov: 34, near: 0.5 };
  }
  // S5 lone: top-down high, then tilt to the horizon
  if (t < 27.3) {
    const hx = loneX(t), hz = LOC.lone.z;
    const gh = g(hx, hz);
    const top: Pose = { pos: [hx + 0.5, gh + lerp(17, 11, ss(19.5, 23.2, t)), hz + 5], target: [hx + 0.5, gh, hz], fov: 30, near: 1 };
    const low: Pose = { pos: [hx - 7, gh + 2.4, hz + 6.5], target: [hx + 160, gh + 6, hz - 40], fov: 34, near: 0.3 };
    const u = ss(23.0, 27.3, t);
    return { pos: lerp3(top.pos, low.pos, u), target: lerp3(top.target, low.target, Math.pow(u, 0.7)), fov: lerp(30, 34, u), near: 0.3 };
  }
  // S6 graze summer: side tracking low
  if (t < 36.0) {
    const u = glide(t, 27.3, 36.0);
    const c = LOC.graze;
    const cx = lerp(c.x - 16, c.x + 9, u), cz = c.z + 13;
    return { pos: [cx, g(cx, cz) + 1.5, cz], target: [cx + 2.5, g(cx + 2.5, c.z) + 0.9, c.z], fov: 32, near: 0.2 };
  }
  // S7 graze winter: macro push-in on the frosted horse
  if (t < 41.5) {
    const u = glide(t, 36.0, 41.5);
    const hx = LOC.graze.x + 2, hz = LOC.graze.z - 1;
    const gh = g(hx, hz);
    return { pos: [hx + lerp(0.9, 0.5, u), gh + lerp(2.3, 2.0, u), hz + lerp(12.5, 9.0, u)], target: [hx + 0.3, gh + 1.2, hz], fov: lerp(34, 30, u), near: 0.1 };
  }
  // S8 column: low front tracking, looking back at the riders
  if (t < 44.0) {
    const L = warLead(t);
    const u = glide(t, 41.5, 44.0);
    const cx = L + lerp(15, 11, u), cz = LOC.war.z + 4;
    return { pos: [cx, g(cx, cz) + 1.35, cz], target: [L - 4, g(L - 4, LOC.war.z) + 1.5, LOC.war.z], fov: 32, near: 0.2 };
  }
  // S9 column: crane up over the line of spare horses
  if (t < 50.9) {
    const L = warLead(t);
    const u = glide(t, 44.0, 50.9);
    const cx = L + lerp(-2, -6, u), cz = LOC.war.z + lerp(17, 26, u);
    return { pos: [cx, g(cx, cz) + lerp(3.5, 15, u), cz], target: [L - 9, g(L - 9, LOC.war.z) + 1, LOC.war.z], fov: 34, near: 0.3 };
  }
  // S10 airag: slow orbit around the tethered mares
  if (t < 57.2) {
    const u = glide(t, 50.9, 57.2);
    const c = AIRAG.center;
    const a = lerp(-0.2, 0.45, u), r = lerp(17, 13, u);
    const px = c[0] + Math.sin(a) * r, pz = c[2] + Math.cos(a) * r;
    return { pos: [px, g(px, pz) + lerp(5, 3.4, u), pz], target: [c[0], g(c[0], c[2]) + 1.1, c[2]], fov: 34, near: 0.2 };
  }
  // S11 airag: macro push-in on the bowl
  if (t < 60.3) {
    const u = glide(t, 57.2, 60.3);
    const b = AIRAG.bowl;
    return { pos: [b[0] - lerp(3.0, 2.1, u), b[1] + lerp(1.4, 1.0, u), b[2] + lerp(4.4, 3.2, u)], target: [b[0] + 0.3, b[1] + 0.35, b[2] - 1.3], fov: 40, near: 0.05 };
  }
  // S12 Naadam: fast low side tracking
  if (t < 66.6) {
    const L = raceLead(t);
    const u = glide(t, 60.3, 66.6);
    const cz = LOC.race.z + lerp(15, 12, u);
    return { pos: [L - 4, g(L - 4, cz) + 1.3, cz], target: [L - 3, g(L - 3, LOC.race.z) + 1.4, LOC.race.z], fov: 34, near: 0.2 };
  }
  // S13 Naadam: low angle at the finish line
  if (t < 69.6) {
    const u = glide(t, 66.6, 69.6);
    // head-on from beyond the finish: the AUDIRA banner frames the oncoming riders
    const fx = LOC.finishX, cz = LOC.race.z + 6;
    const cx = fx + lerp(20, 34, u);
    return { pos: [cx, g(cx, cz) + 1.2, cz], target: [fx, g(fx, LOC.race.z) + 3.0, LOC.race.z + 0.5], fov: 44, near: 0.2 };
  }
  // S14a 500 words: macro push-in on the first head
  if (t < 74.0) {
    const u = glide(t, 69.6, 74.0);
    const h = PORTRAIT[0];
    const gh = g(h.x, h.z);
    return { pos: [h.x + lerp(2.0, 1.2, u), gh + 1.75, h.z + lerp(6.5, 3.6, u)], target: [h.x + 0.6, gh + 1.35, h.z], fov: 30, near: 0.1 };
  }
  // S14b: side slide along the three coats
  if (t < 78.9) {
    const u = glide(t, 74.0, 78.9);
    const c = LOC.portrait;
    const cx = lerp(c.x + 3.4, c.x - 3.4, u), cz = c.z + 13;
    return { pos: [cx, g(cx, cz) + 1.8, cz], target: [cx - 0.5, g(cx, c.z) + 1.1, c.z], fov: 38, near: 0.2 };
  }
  // S15 ridge: crane up and back against the low sun
  const u = glide(t, 78.9, 86);
  const cx = lerp(-4, 3, u), cz = LOC.ridge.z + lerp(20, 32, u);
  const crest = g(0, LOC.ridge.z);
  return { pos: [cx, Math.max(g(cx, cz) + 1.0, crest - 0.4) + lerp(0, 3.5, u), cz], target: [cx + 2, crest + lerp(1.3, 2.0, u), LOC.ridge.z], fov: 34, near: 0.3 };
};

// ── Airag and portrait layouts (read by the camera too) ─────────────────────────
export const AIRAG = (() => {
  const cx = LOC.camp.x + 25, cz = LOC.camp.z - 25;
  const stool: V3 = [cx + 3.2, 0, cz + 2.4];
  stool[1] = gy(stool[0], stool[2]);
  const bowl: V3 = [stool[0], stool[1] + 0.46, stool[2]];
  return { center: [cx, 0, cz] as V3, tether: { a: [cx - 7, 0, cz - 1.5] as V3, b: [cx + 7, 0, cz - 1.5] as V3 }, stool, bowl };
})();

export const PORTRAIT = [
  { x: LOC.portrait.x + 2.6, z: LOC.portrait.z, coat: "bay" },
  { x: LOC.portrait.x, z: LOC.portrait.z, coat: "grey" },
  { x: LOC.portrait.x - 2.6, z: LOC.portrait.z, coat: "black" },
] as const;
