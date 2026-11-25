// EP01 film camera: keys tied to VO word times, Hermite (Catmull-Rom style) interpolation so the
// camera never parks. Key 0 = the approved cover framing (CAM/LOOK in Cover.tsx).
import { proj } from "./geo.ts";
import { T, SEC, TOTAL } from "./timing.ts";

type V3 = [number, number, number];
const YAW = 0.5; // MAP_YAW in Cover.tsx
/** Map lon/lat (+height) to world, through the table's yaw. */
export const wp = (lon: number, lat: number, y = 0): V3 => {
  const [x, z] = proj(lon, lat);
  const c = Math.cos(YAW), s = Math.sin(YAW);
  return [x * c + z * s, y, -x * s + z * c];
};

type Key = { t: number; look: V3; d: number; pitch: number; yaw: number };
const k = (t: number, look: V3, d: number, pitch: number, yaw: number): Key => ({ t, look, d, pitch, yaw });

const COVER: V3 = [0, 0, -1.2];
const TROPHY: V3 = [1.5, 0.95, 1.5];
const PLAQUE: V3 = [1.42, 0.06, 2.2];

const KEYS: Key[] = [
  // HOOK: cover, slow push in
  k(0, COVER, 15.37, 48.43, 0),
  k(SEC.HOOK[1] - 0.2, [0, 0, -1.0], 14.4, 49.5, 2),
  // KONTEKS: Uruguay 1930 -> token tray 84/13/8
  k(T.uruguay + 0.3, wp(-56, -33, 0.1), 5.2, 52, 8),
  k(T.n84 + 0.6, wp(-42, -46, 0), 4.0, 60, 4),
  k(T.n8 + 0.6, wp(-45, -47, 0), 3.5, 56, -4),
  k(T.trofi + 0.2, wp(-20, 15, 0.2), 6.5, 46, -8),
  // PENGEMBANGAN
  k(T.eng + 0.6, wp(-16, 61, 0.5), 4.6, 50, -10),
  k(T.uru - 0.4, wp(-13, 60, 0.45), 4.3, 47, -3),
  k(T.fra + 0.4, wp(-25, 8, 0.3), 8.5, 50, 0),
  k(T.esp + 1.0, wp(-14, 37, 0.3), 3.6, 46, 6),
  k(T.juli + 0.2, wp(-16, 37, 0.3), 3.1, 44, 10),
  k(T.argOpp, wp(-68, 41, 0.3), 3.6, 40, 16),
  k(T.ferran + 0.4, wp(-70, 39, 0.3), 3.2, 38, 20),
  // NJ -> Argentina -> Europe flown high (larger distance = slower on screen), no spikes
  k(T.arg + 0.3, wp(-63, 4, 0.3), 7.0, 47, 12),
  k(T.argTiga + 0.6, wp(-66, -29, 0.3), 5.0, 48, 6),
  k(T.ita + 1.1, wp(-22, 14, 0.3), 9.5, 50, 0),
  k(T.empat + 0.3, wp(24, 31, 0.45), 5.6, 50, -4),
  k(T.jerBarat + 0.4, wp(22, 29, 0.5), 5.4, 48, -8),
  k(T.bra + 0.3, wp(-38, -14, 0.4), 4.2, 46, 6),
  k(SEC.PENGEMBANGAN[1] - 0.2, wp(-36, -12, 0.45), 3.8, 38, 12),
  // PENJELASAN: wide map, then hosts and France 1998
  k(T.benua + 1.0, [0, 0, -1.1], 15.0, 51, 0),
  k(T.belum, [-0.1, 0, -1.2], 15.6, 53, -2),
  k(T.tuan + 0.3, [-0.2, 0, -1.3], 15.0, 52, 2),
  k(T.y1998 + 0.3, wp(-8, 47, 0.3), 3.8, 46, -6),
  // PAYOFF: trophy, London + Pickles, Rio, back to the trophy
  k(T.drama + 1.5, TROPHY, 4.6, 26, 20),
  k(T.pertama + 0.6, wp(-3, 52, 0.15), 2.7, 32, 8),
  k(T.ditemukan + 0.6, wp(15, 47, 0.15), 2.7, 26, 0),
  k(T.y1983 - 0.3, wp(15, 47, 0.15), 2.5, 24, -10),
  k(T.dicuri2 - 0.4, wp(-43, -24, 0.25), 2.5, 32, 10),
  k(T.kini - 0.1, wp(-43, -24, 0.25), 2.2, 28, 18),
  k(T.sejak1974, TROPHY, 3.8, 18, 30),
  k(SEC.PAYOFF[1], TROPHY, 3.4, 22, 14),
  // OUTRO: AUDIRA plaque, then teaser on Brazil
  k(T.audira + 1.0, PLAQUE, 3.0, 50, 4),
  k(T.berikut - 0.1, PLAQUE, 2.8, 52, -4),
  k(T.brasilNext + 0.2, wp(-36, -12, 0.45), 3.9, 42, 10),
  k(TOTAL, wp(-36, -12, 0.45), 3.4, 38, 16),
];

const hermite = (p0: number, p1: number, m0: number, m1: number, u: number, h: number) => {
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * h * m1;
};

const param = (key: Key): number[] => [key.look[0], key.look[1], key.look[2], key.d, key.pitch, key.yaw];

const rawCam = (t: number): { pos: V3; look: V3 } => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const h = b.t - a.t;
  const u = Math.min(1, Math.max(0, (t - a.t) / h));
  const pa = param(a), pb = param(b);
  const prev = KEYS[Math.max(0, i - 1)], next = KEYS[Math.min(KEYS.length - 1, i + 2)];
  const pp = param(prev), pn = param(next);
  // tangents, damped (0.5) so long flights do not overshoot; zero at the first and last key
  const tan = (x0: number[], x1: number[], t0: number, t1: number, j: number) => (t1 > t0 ? (0.5 * (x1[j] - x0[j])) / (t1 - t0) : 0);
  const v = pa.map((_, j) =>
    hermite(pa[j], pb[j], i === 0 ? 0 : tan(pp, pb, prev.t, b.t, j), i + 2 >= KEYS.length ? 0 : tan(pa, pn, a.t, next.t, j), u, h),
  );
  const [lx, ly, lz, d, pitch, yaw] = v;
  const p = (pitch * Math.PI) / 180, y = (yaw * Math.PI) / 180;
  return {
    pos: [lx + d * Math.sin(y) * Math.cos(p), ly + d * Math.sin(p), lz + d * Math.cos(y) * Math.cos(p)],
    look: [lx, ly, lz],
  };
};

/** Camera with a triangular low-pass over +-0.7 s: removes acceleration spikes between keys. */
export const camAt = (t: number): { pos: V3; look: V3 } => {
  const r = Math.min(0.7, t * 0.4);
  if (r < 1e-3) return rawCam(t);
  const pos: V3 = [0, 0, 0], look: V3 = [0, 0, 0];
  let wsum = 0;
  for (let i = -10; i <= 10; i++) {
    const w = 11 - Math.abs(i);
    const c = rawCam(Math.min(TOTAL, Math.max(0, t + (i / 10) * r)));
    for (let j = 0; j < 3; j++) {
      pos[j] += c.pos[j] * w;
      look[j] += c.look[j] * w;
    }
    wsum += w;
  }
  for (let j = 0; j < 3; j++) {
    pos[j] /= wsum;
    look[j] /= wsum;
  }
  return { pos, look };
};
