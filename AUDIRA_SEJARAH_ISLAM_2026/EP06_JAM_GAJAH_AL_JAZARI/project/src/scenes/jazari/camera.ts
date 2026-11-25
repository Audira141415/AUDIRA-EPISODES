// EP06 camera: one continuous path from the approved cover framing. Keys are orbit parameters
// (target, distance, yaw from +Z toward +X, elevation, fov), each anchored to a word of the locked voice,
// interpolated with monotone cubic Hermite per parameter (no overshoot, no stops between keys).

import { at, TOTAL } from "./time.ts";
import { COVER, BOOK } from "./layout.ts";

type K = { t: number; tg: [number, number, number]; d: number; yaw: number; el: number; fov?: number };

const off = [COVER.pos[0] - COVER.target[0], COVER.pos[1] - COVER.target[1], COVER.pos[2] - COVER.target[2]];
const C0 = {
  d: Math.hypot(off[0], off[1], off[2]),
  yaw: Math.atan2(off[0], off[2]),
  el: Math.atan2(off[1], Math.hypot(off[0], off[2])),
};
const BOOK_C: [number, number, number] = [BOOK.pos[0], BOOK.lift + BOOK.pageH / 2, BOOK.pos[2]];

let KEYS: K[] | null = null;
const keys = (): K[] =>
  (KEYS ??= [
    { t: 0, tg: COVER.target, d: C0.d, yaw: C0.yaw, el: C0.el },
    { t: at("jam"), tg: [0.36, 2.4, 0], d: C0.d - 0.9, yaw: C0.yaw + 0.04, el: C0.el - 0.01 },
    // context: pull back, the manuscript and the basalt wall join the frame
    { t: at("pembuatnya") + 0.2, tg: [-0.4, 2.5, -0.4], d: 19.5, yaw: 0.5, el: 0.22 },
    { t: at("artuqid"), tg: [-0.5, 2.7, -2.0], d: 21, yaw: 0.42, el: 0.19 },
    { t: at("turki"), tg: [1.0, 2.8, -2.6], d: 22.5, yaw: 0.3, el: 0.17 },
    { t: at("menulis"), tg: [BOOK_C[0], BOOK_C[1] - 0.3, BOOK_C[2]], d: 16.5, yaw: BOOK.rotY - 0.05, el: 0.12 },
    { t: at("lengkap"), tg: [BOOK_C[0] - 0.2, BOOK_C[1] - 0.3, BOOK_C[2] + 0.4], d: 19, yaw: BOOK.rotY + 0.16, el: 0.12 },
    { t: at("gajah") + 0.4, tg: [0.4, 2.0, 0], d: 16.5, yaw: 0.52, el: 0.18 },
    // main: the castle and its automata
    { t: at("kastil"), tg: [0.25, 2.85, 0.1], d: 7.4, yaw: 0.6, el: 0.17 },
    { t: at("burung"), tg: [0.22, 2.9, 0.12], d: 7.0, yaw: 0.45, el: 0.2 },
    { t: at("berputar"), tg: [0.15, 2.85, 0.2], d: 6.6, yaw: 0.32, el: 0.22 },
    { t: at("setiap"), tg: [0.5, 2.25, 0.1], d: 10.5, yaw: 0.72, el: 0.16 },
    { t: at("bola"), tg: [0.6, 2.35, 0.1], d: 9.4, yaw: 0.82, el: 0.15 },
    { t: at("pawang"), tg: [0.55, 1.95, 0.1], d: 10.4, yaw: 0.86, el: 0.16 },
    // explanation: into the belly
    { t: at("perut"), tg: [-0.05, 1.12, 0.2], d: 5.6, yaw: 0.42, el: 0.24 },
    { t: at("lubang"), tg: [-0.05, 1.0, 0.15], d: 4.6, yaw: 0.36, el: 0.3 },
    { t: at("tenggelam"), tg: [-0.05, 1.0, 0.15], d: 4.8, yaw: 0.46, el: 0.28 },
    { t: at("tali"), tg: [0.45, 2.3, 0.1], d: 7.6, yaw: 0.62, el: 0.16 },
    { t: at("udara"), tg: [-0.25, 1.45, 0.2], d: 5.8, yaw: 0.28, el: 0.2 },
    { t: at("mengangkat"), tg: [-0.05, 1.3, 0.2], d: 6.4, yaw: 0.45, el: 0.22 },
    { t: at("siklus"), tg: [0.3, 2.0, 0], d: 12, yaw: 0.6, el: 0.18 },
    // payoff: the giant replica, then the original next to an adult
    { t: at("hari") + 0.2, tg: [0.4, 3.0, 0], d: 18, yaw: 0.6, el: 0.13 },
    { t: at("dubai"), tg: [0.6, 5.0, 0], d: 33, yaw: 0.55, el: 0.08 },
    { t: at("meter"), tg: [0.6, 5.0, 0], d: 34, yaw: 0.42, el: 0.08 },
    { t: at("aslinya"), tg: [-0.2, 1.9, 0.4], d: 21, yaw: 0.36, el: 0.12 },
    { t: at("dewasa", 0, "e") + 0.4, tg: [-0.15, 1.9, 0.4], d: 20.5, yaw: 0.37, el: 0.12 },
    { t: at("ulang", 0, "e") + 0.5, tg: [BOOK_C[0] - 1.6, BOOK_C[1] - 0.8, BOOK_C[2] + 2.0], d: 21, yaw: 0.32, el: 0.12 },
    // outro: back to the hero, the AUDIRA plaque in view
    { t: at("komentar"), tg: [0.3, 1.8, 0.2], d: 15, yaw: 0.62, el: 0.16 },
    { t: TOTAL, tg: [0.3, 1.9, 0.1], d: 14, yaw: 0.78, el: 0.19 },
  ]);

/** Fritsch–Carlson monotone cubic through (xs, ys). */
function mono(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (x > xs[i + 1]) i++;
  const dk = (j: number) => (ys[j + 1] - ys[j]) / (xs[j + 1] - xs[j]);
  const m = (j: number) => {
    if (j === 0) return 0;
    if (j === n - 1) return 0;
    const a = dk(j - 1), b = dk(j);
    if (a * b <= 0) return 0;
    return (3 * (xs[j + 1] - xs[j - 1])) / ((2 * xs[j + 1] - xs[j] - xs[j - 1]) / a + (xs[j + 1] + xs[j] - 2 * xs[j - 1]) / b);
  };
  const h = xs[i + 1] - xs[i];
  const s = (x - xs[i]) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  return h00 * ys[i] + h10 * h * m(i) + h01 * ys[i + 1] + h11 * h * m(i + 1);
}

export function filmCamera(t: number) {
  const ks = keys();
  const xs = ks.map((k) => k.t);
  const f = (g: (k: K) => number) => mono(xs, ks.map(g), t);
  const tg: [number, number, number] = [f((k) => k.tg[0]), f((k) => k.tg[1]), f((k) => k.tg[2])];
  const d = f((k) => k.d), yaw = f((k) => k.yaw), el = f((k) => k.el);
  const fov = f((k) => k.fov ?? COVER.fov);
  const pos: [number, number, number] = [tg[0] + d * Math.sin(yaw) * Math.cos(el), tg[1] + d * Math.sin(el), tg[2] + d * Math.cos(yaw) * Math.cos(el)];
  return { pos, target: tg, fov };
}
export const CAMERA_KEYS = keys;
