// EP07 camera: one key list per set (segments), Catmull-Rom / Hermite through keys tied to VO word times.
// Segment ends keep their velocity (no parking before a cut). Key 0 = the approved cover framing.
import type { Shot } from "../../kits/paperworld/render/Stage.tsx";
import type { V3 } from "../../kits/paperworld/components/Paper.tsx";
import { COVER_SHOT } from "./Cover.tsx";
import { T, CUTS, SEC, TOTAL } from "./timing.ts";
import { ORIGIN, add, shipAt, MVD } from "./sets.tsx";

type Key = { t: number; p: V3; q: V3; fov: number };
const k = (t: number, p: V3, q: V3, fov = 36): Key => ({ t, p, q, fov });
const at = (o: V3) => (t: number, p: V3, q: V3, fov = 40) => k(t, add(o, p), add(o, q), fov);

const M = at(ORIGIN.map);
const Cl = at(ORIGIN.cal);
const Se = at(ORIGIN.sea);
const Po = at(ORIGIN.pocitos);
/** Track the ship: offset from its position at time t. */
const ship = (t: number, p: V3, q: V3 = [0, 2, 0], fov = 40) => {
  const s = add(ORIGIN.sea, shipAt(t));
  return k(t, add(s, p), add(s, q), fov);
};

const mvd: V3 = [MVD[0], 0.8, MVD[2]];

const SEGMENTS: Key[][] = [
  // HOOK: cover, then a crane-down push into the two balls on the centre spot
  [k(0, COVER_SHOT.pos, COVER_SHOT.target, 36), k(1.6, [0, 38, 50], [0, 2.6, -12], 36), k(CUTS.toMap, [0, 15, 13], [0, 1.4, -6], 36)],
  // KONTEKS: map of Uruguay -> Montevideo pin -> medals pop up -> constitution scroll
  [
    M(CUTS.toMap, [0, 40, 30], [0, 0, 0.5]),
    M(T.uruguay + 0.6, add(mvd, [-1, 13, 15]), add(mvd, [0, 0.5, -1.5])),
    M(T.alasan + 0.4, [-0.5, 14, 17], [0, 2.2, -0.5]),
    M(T.y1924 + 0.6, [-0.8, 10.5, 17], [-0.3, 3.4, 0.2]),
    M(T.y1928 + 0.6, [1.0, 9.0, 17.5], [0.3, 3.0, -1.0]),
    M(T.dan2 + 0.8, [7.5, 10.5, 18], [8.6, 4.6, 2.0]),
    M(CUTS.toCal, [9.5, 9.0, 16.5], [9.2, 4.8, 2.2]),
  ],
  // PENGEMBANGAN 1: calendar flips back two months, truck right to the empty entry board
  [
    Cl(CUTS.toCal, [-1.5, 6.5, 20], [0, 4.6, 0]),
    Cl(T.belum - 0.2, [0.5, 6.0, 19], [0.5, 4.8, 0]),
    Cl(T.eropa, [8.5, 6.5, 18.5], [10.4, 5.4, -1]),
    Cl(CUTS.toSea, [11.5, 6.0, 15.5], [10.5, 5.4, -1]),
  ],
  // PENGEMBANGAN 2: the Atlantic — wide route, then ride beside the ship, then the quay with 13 flags
  [
    Se(CUTS.toSea, [16, 17, -16], [0, 1, -39]),
    Se(T.duaMinggu + 0.2, [14, 16, -8], [0, 1, -32]),
    ship(T.empat + 0.3, [-16, 14, 14], [0, 1.5, 3]),
    ship(T.belgia, [-13, 7, 8.5], [0, 2.4, 0.5]),
    ship(T.kapal + 0.2, [-12, 6.5, 6], [0, 2.4, 0]),
    ship(T.bersama + 0.3, [-9, 5, 1.5], [0, 2.4, -1.2]),
    ship(T.trofi + 0.2, [-7.5, 4.2, -2.5], [0, 2.4, -1.6]),
    Se(T.tigaBelas + 0.3, [-6, 15, 45], [0, 1.6, 24]),
    Se(CUTS.toPocitos, [-3, 13, 43], [0, 1.6, 25]),
  ],
  // PENJELASAN 1: the small Pocitos ground — run, shot, goal from behind the net
  [
    Po(CUTS.toPocitos, [-13, 11, 17], [0, 0.8, -1]),
    Po(T.lucien, [-7, 5.5, 7.5], [0.8, 1.0, -1.5]),
    Po(T.gol - 0.2, [-3.6, 5.6, 4.0], [0, 0.9, -6.4]),
    Po(T.gol + 0.45, [-2.0, 4.6, 3.8], [0.6, 1.5, -6.6]),
    Po(T.menit + 1.0, [-1.3, 4.2, 2.8], [0.65, 1.5, -6.6]),
    Po(CUTS.toBuild, [0.8, 6.0, 2.0], [0.2, 1.0, -6.0]),
  ],
  // PENJELASAN 2 + PAYOFF + OUTRO: Centenario under rain, completed, the final on the centre spot, crane out
  [
    k(CUTS.toBuild, [-34, 30, 36], [2, 5, -12]),
    k(T.hujan, [-26, 26, 34], [3, 5, -12]),
    k(T.lima + 0.4, [-8, 30, 40], [4, 6, -13]),
    k(T.konst2, [8, 28, 38], [3, 5, -12]),
    k(T.tigaPuluh + 0.4, [2, 18, 22], [0, 2.2, -8]),
    k(T.arg + 0.3, [-1.5, 11, 12.5], [0, 2.0, -7]),
    k(T.jalan, [1.5, 8.5, 9.5], [0, 1.6, -6.4]),
    k(T.argUnggul, [-3, 8.5, 9.5], [-0.3, 1.6, -6.4]),
    k(T.uruBalik, [3, 8.5, 9.5], [0.3, 1.6, -6.4]),
    k(T.juaraDunia + 0.6, [0, 10.5, 12], [0, 4.4, -6.5]),
    k(T.libur + 0.4, [-3, 16, 22], [0, 4.4, -8]),
    k(T.audira + 1.2, [-18, 18, 18], [-9, 3.5, -14]),
    k(T.maracanazo, [-12, 30, 42], [-2, 3.5, -14]),
    k(TOTAL, COVER_SHOT.pos, COVER_SHOT.target, 36),
  ],
];

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const hermite = (p0: number, p1: number, m0: number, m1: number, u: number, h: number) => {
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * h * m1;
};
const vec = (key: Key) => [...key.p, ...key.q, key.fov];

const sampleSeg = (keys: Key[], t: number): number[] => {
  if (t <= keys[0].t) return vec(keys[0]);
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  const h = b.t - a.t;
  const u = Math.min(1, Math.max(0, (t - a.t) / h));
  const va = vec(a), vb = vec(b);
  const prev = keys[i - 1], next = keys[i + 2];
  const tan = (x0: number[], x1: number[], t0: number, t1: number, j: number) => (0.85 * (x1[j] - x0[j])) / (t1 - t0);
  return va.map((_, j) => {
    // first key of the film starts from rest (frame 0 = cover); other segment ends keep velocity
    const m0 = prev ? tan(vec(prev), vb, prev.t, b.t, j) : a.t === 0 ? 0 : (vb[j] - va[j]) / h;
    const m1 = next ? tan(va, vec(next), a.t, next.t, j) : (vb[j] - va[j]) / h;
    return hermite(va[j], vb[j], m0, m1, u, h);
  });
};

const raw = (t: number): number[] => {
  const s = SEGMENTS.find((sg, i) => i === SEGMENTS.length - 1 || t < SEGMENTS[i + 1][0].t)!;
  return sampleSeg(s, t);
};

/** Camera shot at time t (light low-pass inside a segment to remove acceleration spikes). */
export const shotAt = (t: number): Shot => {
  const si = SEGMENTS.findIndex((sg, i) => i === SEGMENTS.length - 1 || t < SEGMENTS[i + 1][0].t);
  const s0 = SEGMENTS[si][0].t;
  const s1 = si + 1 < SEGMENTS.length ? SEGMENTS[si + 1][0].t - 1e-3 : TOTAL;
  const r = Math.min(0.45, t * 0.3);
  let acc = new Array(7).fill(0);
  let wsum = 0;
  for (let i = -6; i <= 6; i++) {
    const w = 7 - Math.abs(i);
    const v = raw(Math.min(s1, Math.max(s0, t + (i / 6) * r)));
    acc = acc.map((x, j) => x + v[j] * w);
    wsum += w;
  }
  const v = acc.map((x) => x / wsum);
  const pos: V3 = [v[0], v[1], v[2]];
  const target: V3 = [v[3], v[4], v[5]];
  const d = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  return { pos, target, fov: v[6], focus: t < 1.6 ? lerp(COVER_SHOT.focus, d, Math.min(1, t / 1.6)) : d, aperture: COVER_SHOT.aperture, maxBlur: COVER_SHOT.maxBlur };
};
export { SEC };
