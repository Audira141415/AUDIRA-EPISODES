// One continuous camera track for the whole film (authored for 9:16; FormatFov adapts 16:9).
// Keys sit on word anchors; a cubic Hermite spline through them keeps velocity continuous, so the
// camera never parks or jerks at a handover.
import { A } from "./state.ts";
import { PLAQUE } from "./layout.ts";
import { TOTAL } from "./tl.ts";

type V = [number, number, number];
type Key = { t: number; p: V; l: V; f: number };
const K = (t: number, p: V, l: V, f = 32): Key => ({ t, p, l, f });
const PQ: V = [PLAQUE[0], PLAQUE[1], PLAQUE[2] - 0.1];

export const KEYS: Key[] = [
  // hook: the Ka'bah up close, then up and out while the eras rewind and regrow
  K(0, [1.15, 0.5, 1.85], [0, 0.26, 0], 30),
  K(A.hDulu, [2.2, 1.9, 3.9], [0, 0.12, 0], 31),
  K(A.hTembok + 1.5, [3.0, 5.8, 7.4], [0, 0, -0.4]),
  K(A.hRumah, [-1.4, 8.8, 9.6], [0, 0, -1]),
  K(A.hTumbuh, [-0.6, 15.5, 14.5], [0, 0, -2.4], 33),
  K(A.hJuta + 0.6, [0.8, 25, 20], [0, 0, -3.5], 34),
  // intro: masterplan, then down to the AUDIRA plaque
  K(A.iStart + 2, [2.2, 28, 20], [0, 0, -3.6], 34),
  K(A.iSejarah - 1, [5.5, 20, 12], [0, 0, -2.5], 34),
  K(A.iAudira + 0.3, [1.1, 1.5, PQ[2] + 2.4], PQ, 30),
  K(A.iEnd, [-1.2, 1.9, PQ[2] + 2.0], [0, 0.18, PQ[2] - 0.6], 31),
  // ch1: houses around an open courtyard, flood, Umar's wall, Utsman's roofed colonnade, Ibn Zubair
  K(A.c2 + 1, [-2.4, 3.4, 6.4], [0, 0.1, 0.6]),
  K(A.nol + 3, [-1.7, 2.1, 3.4], [0, 0.15, 0], 31),
  K(A.rumahRumah, [1.7, 1.45, 2.6], [0, 0.14, 0], 30),
  K(A.seribu, [0.7, 4.6, 4.0], [0, 0, 0]),
  K(A.banjir, [-3.2, 6.2, 5.2], [0, 0, -1.6]),
  K(A.membeli + 1, [-2.3, 3.4, 4.0], [0, 0, 0]),
  K(A.tembok + 0.5, [1.7, 2.0, 2.8], [0, 0.06, 0], 31),
  K(A.bendungan + 0.5, [1.4, 2.3, 1.6], [0, 0, -1.2], 32),
  K(A.jadi, [2.4, 4.3, 5.2], [0, 0, 0]),
  K(A.utsman, [-2.7, 4.6, 4.8], [0, 0, 0]),
  K(A.serambi + 0.8, [-1.55, 1.25, 2.45], [-0.6, 0.12, 0.4], 30),
  K(A.zubair, [2.7, 5.6, 6.2], [0, 0, 0]),
  K(A.mengubin, [0.95, 1.5, 1.9], [0, 0.1, 0], 30),
  // ch2: caliphs build; al-Mahdi's off-centre problem and the moved wadi
  K(A.c3 + 1, [-2.4, 2.9, 3.9], [0, 0.1, 0]),
  K(A.walid + 1, [-1.75, 0.85, 2.1], [-0.9, 0.16, 0.3], 30),
  K(A.abbasiyah, [3.3, 7.6, 7.6], [0, 0, -0.8]),
  K(A.menara1 + 0.5, [-0.7, 1.7, -0.5], [-2.25, 0.45, -2.45], 31),
  K(A.masalah + 1, [0.5, 9.6, 6.3], [0, 0, -0.8]),
  K(A.qubais + 0.8, [9.4, 2.4, 1.6], [0, 0.1, -0.4], 32),
  K(A.dipindahkan + 1, [1.0, 8.6, 9.8], [0, 0, 1.4]),
  K(A.y167, [-2.0, 9.6, 8.8], [0, 0, 0]),
  K(A.menara3 + 0.5, [3.3, 3.4, 5.4], [0, 0.3, 0]),
  // ch3: fire, the leaning east riwaq, timber roof out, domes in
  K(A.c4 + 1, [4.4, 4.4, 6.2], [0, 0.1, 0]),
  K(A.kebakaran + 0.8, [-4.0, 4.0, 1.4], [-1.5, 0, -1.4]),
  K(A.y1570 + 0.5, [5.0, 2.1, 1.4], [2.6, 0.15, 0]),
  K(A.miring + 1, [4.3, 1.15, 2.3], [2.6, 0.16, 0], 30),
  K(A.dibongkar + 0.5, [4.5, 3.0, 3.4], [2.0, 0.2, 0.2]),
  K(A.kubah + 1, [3.7, 1.35, 4.4], [1.6, 0.3, 2.9], 30),
  K(A.pilar + 1, [1.55, 0.5, 2.0], [2.25, 0.17, 2.9], 30),
  K(A.y1576, [-3.4, 5.3, 6.8], [0, 0, 0]),
  K(A.sinan + 1, [-4.3, 2.9, 4.0], [-1.5, 0.2, 0]),
  K(A.bertambah, [0.5, 10.5, 8.8], [0, 0, 0]),
  K(A.kubah2 + 0.5, [-3.5, 0.75, 3.6], [-1.2, 0.33, 3.0], 30),
  K(A.c4end, [-2.2, 1.2, 3.3], [0, 0.28, 1], 31),
  // ch4: electric light, Saudi I rises, the sa'i street becomes the Mas'a
  K(A.c5 + 1, [-3.0, 2.9, 4.9], [0, 0.2, 0]),
  K(A.listrik + 0.5, [1.75, 1.25, 2.55], [0, 0.2, 0], 30),
  K(A.y1955, [3.0, 11.5, 11.5], [0, 0, 0]),
  K(A.lantai3, [-6.3, 4.8, 7.8], [-2, 0.3, 0]),
  K(A.tujuhMenara + 2, [-5.8, 3.1, 6.8], [-3, 0.8, 2.5]),
  K(A.seratus + 1, [2.0, 15.5, 12.8], [0, 0, -1]),
  K(A.jarang + 1, [7.3, 3.1, 6.4], [4.85, 0.1, 1.0]),
  K(A.pasar + 0.5, [5.95, 0.95, 4.6], [4.85, 0.1, 1.4], 30),
  K(A.digabungkan + 0.5, [6.6, 2.3, 6.0], [4.85, 0.2, 0.5]),
  K(A.jalurnya + 1.5, [5.6, 2.1, 5.3], [4.9, 0.25, -1.0], 31),
  K(A.konferensi + 0.5, [5.4, 6.3, 7.4], [0.5, 0, 0]),
  K(A.menolak + 0.5, [-3.9, 5.0, 4.9], [0, 0.2, 0]),
  K(A.thassos + 0.8, [1.4, 2.1, 2.4], [0, 0.05, 0], 31),
  // ch5: King Fahd: market lot, roof, west wing, cooling, escalators
  K(A.c6 + 1, [-9.2, 5.4, 6.4], [-5.8, 0, 0]),
  K(A.y1983 + 1, [-8.8, 6.3, 4.4], [-5.9, 0, 0]),
  K(A.atap + 0.5, [-6.0, 2.0, 5.5], [-3.9, 0.5, 2.0]),
  K(A.sembilan + 0.5, [-2.0, 2.3, 6.3], [-0.5, 0.5, 4.2], 31),
  K(A.y1988 + 0.5, [-9.8, 4.9, 6.0], [-5.9, 0.2, 0]),
  K(A.ajyad + 0.5, [-4.5, 4.6, 10.4], [-3.6, 0, 4.6]),
  K(A.eskalator + 0.5, [-8.1, 1.75, 5.4], [-6.0, 0.3, 2.8], 31),
  K(A.duaMenara + 0.8, [-9.3, 1.95, 1.3], [-7.1, 0.9, 0]),
  K(A.pelataran + 0.5, [-8.0, 11.8, 11.8], [-1, 0, 0]),
  K(A.kapasitas + 1, [-2.0, 17.5, 14.8], [-1, 0, -1], 33),
  // ch6: the northern expansion, Mas'a doubled, the ring bridge, Riwaq Saudi
  K(A.c7 + 1, [1.0, 19.5, 11.5], [0, 0, -6], 33),
  K(A.properti + 1, [-4.0, 9.8, -2.0], [0, 0, -8.5]),
  K(A.beton + 1, [11.5, 8.5, 0.5], [0, 0.3, -8.5]),
  K(A.crane, [6.4, 8.2, 4.4], [0, 0, -6]),
  K(A.y2017, [6.8, 6.0, 5.2], [2.0, 0, -2.0]),
  K(A.kaliLipat + 1, [7.5, 2.5, 4.8], [5.0, 0.3, 0.6]),
  K(A.jembatan + 0.8, [2.15, 1.75, 2.55], [0, 0.22, 0], 30),
  K(A.bongkarJembatan + 1, [1.3, 3.1, 3.2], [0, 0.1, 0]),
  K(A.sembilanBelas + 0.5, [-2.0, 2.3, 2.8], [0, 0.1, 0], 31),
  K(A.riwaqSaudi + 0.8, [-4.5, 3.3, 5.3], [0, 0.3, 0]),
  K(A.c7end, [-4.0, 4.6, 5.8], [0, 0.2, 0]),
  // ch7: the historic riwaq as a museum catalogue
  K(A.c8 + 1, [4.5, 1.45, 4.5], [2.4, 0.2, 1.2]),
  K(A.abbasi + 0.5, [0.6, 2.1, 0.7], [0, 0.2, -2.9], 31),
  K(A.utsmani + 0.5, [0.9, 2.0, 0.4], [2.9, 0.2, 0], 31),
  K(A.tiang95 + 0.5, [1.25, 0.34, 0.55], [2.4, 0.16, 0.15], 30),
  K(A.dibongkar8 + 1.5, [0.55, 0.95, 1.7], [1.95, 0.05, -0.1], 30),
  K(A.isra + 0.8, [-0.9, 0.55, 1.55], [-0.6, 0.3, 2.85], 30),
  K(A.independent + 1, [-1.0, 7.8, 7.8], [0, 0, 0]),
  K(A.resmi + 1, [3.0, 6.8, 8.8], [0, 0, 0]),
  K(A.hariIni + 0.5, [-5.4, 4.1, 6.4], [0, 0.3, 0]),
  K(A.kubah8 + 0.5, [-2.35, 0.85, 4.2], [-0.6, 0.35, 3.1], 30),
  K(A.asli + 0.5, [-3.4, 2.4, 6.1], [0, 0.3, 1]),
  // payoff: rings light from the inside out, the camera rises to the full plan
  K(A.c9 + 1, [0.5, 13.5, 9.8], [0, 0, -1]),
  K(A.p2 + 0.5, [0.5, 17.5, 12], [0, 0, -1.5], 33),
  K(A.p4 + 0.5, [-1.0, 23.5, 16], [-1, 0, -3], 34),
  K(A.p5 + 0.5, [0.8, 31, 21.5], [0, 0, -4.5], 34),
  K(A.lingkaran, [0.8, 35, 23.5], [0, 0, -4.5], 34),
  // CTA, plaque, end screen
  K(A.c10 + 1, [6.0, 10, 14], [0, 0, -2]),
  K(A.subscribe + 0.5, [7.5, 8, 10], [0, 0, -2]),
  K(A.audiraEnd + 0.2, [1.9, 1.55, PQ[2] + 2.3], PQ, 30),
  K(A.voEnd + 3, [-5.5, 13.5, 19.5], [-1, 0, -3], 34),
  K(TOTAL, [5.5, 13.5, 19.5], [1, 0, -3], 34),
];

type Pose = { pos: V; target: V; fov: number };

function hermite(keys: Key[], t: number, get: (k: Key) => number[]): number[] {
  const n = keys.length;
  if (t <= keys[0].t) return get(keys[0]);
  if (t >= keys[n - 1].t) return get(keys[n - 1]);
  let i = 0;
  while (i < n - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(n - 1, i + 2)];
  const dt = k2.t - k1.t;
  const u = (t - k1.t) / dt;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const a = get(k0), b = get(k1), c = get(k2), d = get(k3);
  return b.map((_, j) => {
    // tangents from neighbouring keys (time-weighted), damped to avoid overshoot
    const m1 = i === 0 ? 0 : ((c[j] - a[j]) / (k2.t - k0.t)) * 0.85;
    const m2 = i + 2 >= n ? 0 : ((d[j] - b[j]) / (k3.t - k1.t)) * 0.85;
    return h00 * b[j] + h10 * dt * m1 + h01 * c[j] + h11 * dt * m2;
  });
}

/** Camera pose at film time t, plus a slow seeded drift so holds keep parallax. */
export function cameraAt(t: number, keys: Key[] = KEYS): Pose {
  const p = hermite(keys, t, (k) => k.p);
  const l = hermite(keys, t, (k) => k.l);
  const f = hermite(keys, t, (k) => [k.f])[0];
  const d = Math.hypot(p[0] - l[0], p[1] - l[1], p[2] - l[2]);
  const amp = 0.012 * d;
  const pos: V = [p[0] + Math.sin(t * 0.21) * amp, Math.max(0.28, p[1] + Math.sin(t * 0.17 + 1) * amp * 0.5), p[2] + Math.cos(t * 0.19) * amp];
  return { pos, target: [l[0], l[1], l[2]], fov: f };
}

export type { Key, Pose };
export { K };
