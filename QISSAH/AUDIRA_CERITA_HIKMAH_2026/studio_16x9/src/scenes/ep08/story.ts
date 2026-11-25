// EP08 story clock + shot list, all keyed to the REAL voice timeline (timeline.json).
import TL from "./timeline.json";

export type Clip = { id: string; who: string; text: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
export const CLIPS = TL.clips as Clip[];
export const TOTAL = TL.total;
export const T: Record<string, number> = Object.fromEntries(CLIPS.map((c) => [c.id, c.start]));
export const E: Record<string, number> = Object.fromEntries(CLIPS.map((c) => [c.id, c.end]));
export const OUTRO_START = TOTAL - 3.4;

export type V3 = [number, number, number];
export type SetId = "cafe" | "party" | "sea" | "kitchen";
/** One camera move: p0→p1, q0→q1 (look target), eased across [a, b). A new shot = a cut. */
export type Shot = { a: number; b: number; set: SetId; scene: string; p0: V3; p1: V3; q0: V3; q1: V3; fov: number; flash?: boolean };

const sh = (a: number, b: number, set: SetId, scene: string, p0: V3, p1: V3, q0: V3, q1: V3, fov = 28, flash = false): Shot => ({ a, b, set, scene, p0, p1, q0, q1, fov, flash });

// café/kitchen framing (man at x -0.86, woman at +0.86, heads ~y 1.25, table top 0.76)
const TWO_P0: V3 = [0.08, 1.64, 3.0];
const TWO_P1: V3 = [0.0, 1.6, 2.75];
const TWO_Q: V3 = [0, 1.12, 0];
const MAN_CP: V3 = [0.28, 1.42, 1.4];
const MAN_CQ: V3 = [-0.82, 1.16, 0.05];
const WOM_CP: V3 = [-0.28, 1.42, 1.4];
const WOM_CQ: V3 = [0.82, 1.16, 0.05];
const nudge = (p: V3, dx: number, dy: number, dz: number): V3 => [p[0] + dx, p[1] + dy, p[2] + dz];

const END = TOTAL;
export const SHOTS: Shot[] = [
  // 1 hook: the salt pour (cover keyframe)
  sh(0, T.s2a - 0.5, "cafe", "hook", [0.1, 1.66, 3.2], [0.02, 1.62, 2.95], TWO_Q, TWO_Q, 28),
  // 2-3 party
  sh(T.s2a - 0.5, T.s2d - 0.2, "party", "party", [-0.55, 1.55, 3.5], [-0.65, 1.48, 3.05], [-0.7, 1.08, -0.2], [-0.7, 1.1, -0.2], 30),
  sh(T.s2d - 0.2, T.s3a - 0.1, "party", "party", [0.2, 1.45, 2.9], [1.45, 1.42, 2.6], [0.3, 1.05, -0.2], [1.65, 1.08, -0.2], 30),
  sh(T.s3a - 0.1, T.s3c - 0.2, "party", "party", [0.5, 1.75, 4.4], [0.35, 1.68, 4.0], [0.35, 1.0, -0.2], [0.2, 1.0, -0.2], 32),
  sh(T.s3c - 0.2, T.s4a - 0.6, "party", "party", [-0.15, 1.62, 2.75], [-0.25, 1.6, 2.5], [-0.3, 1.3, -0.25], [-0.3, 1.3, -0.25], 28),
  // 4-5 café first night
  sh(T.s4a - 0.6, T.s4b, "cafe", "cafe", [-1.0, 1.85, 3.9], [0.0, 1.75, 3.4], [-0.2, 1.05, 0], [0, 1.08, 0], 30),
  sh(T.s4b, T.s4d - 0.3, "cafe", "cafe", MAN_CP, nudge(MAN_CP, -0.06, 0, -0.12), MAN_CQ, MAN_CQ, 28),
  sh(T.s4d - 0.3, T.s4e, "cafe", "cafe", WOM_CP, nudge(WOM_CP, 0.06, 0, -0.1), WOM_CQ, WOM_CQ, 28),
  sh(T.s4e, T.s5a, "cafe", "cafe", [0.35, 1.7, 3.2], [0.25, 1.66, 3.0], [0.1, 1.15, -0.2], [0.05, 1.15, -0.2], 30),
  sh(T.s5a, T.s5b, "cafe", "cafe", [0.9, 1.8, 3.6], [0.6, 1.78, 3.5], [-0.6, 1.05, -0.4], [-0.5, 1.05, -0.4], 32),
  sh(T.s5b, T.s5c, "cafe", "cafe", nudge(MAN_CP, 0, 0, -0.15), nudge(MAN_CP, -0.05, 0, -0.25), MAN_CQ, MAN_CQ, 26),
  sh(T.s5c, T.s5d, "cafe", "cafe", [0.1, 1.6, 2.7], [0.0, 1.55, 2.45], [-0.15, 1.08, 0], [-0.15, 1.08, 0], 26),
  sh(T.s5d, T.s6a - 0.5, "cafe", "cafe", WOM_CP, nudge(WOM_CP, 0.06, 0, -0.12), WOM_CQ, WOM_CQ, 28),
  // 6 his seaside memory
  sh(T.s6a - 0.5, T.s6c - 0.2, "sea", "sea", [-0.4, 1.4, 3.8], [0.3, 1.35, 3.4], [-0.3, 1.0, -0.3], [0.1, 0.98, -0.3], 36),
  sh(T.s6c - 0.2, T.s6d - 0.2, "sea", "sea", [0.75, 1.0, 1.9], [0.6, 0.95, 1.7], [0.3, 0.62, -0.3], [0.3, 0.62, -0.3], 30),
  sh(T.s6d - 0.2, T.s7a - 0.6, "sea", "sea", [-1.3, 1.3, 3.0], [-0.5, 1.6, 4.4], [-1.5, 0.9, 0], [-0.6, 0.9, -0.3], 32),
  // 7 back in the café: touched, her hometown, warm talk
  sh(T.s7a - 0.6, T.s7b, "cafe", "cafe2", nudge(MAN_CP, 0, 0, -0.1), nudge(MAN_CP, -0.06, -0.02, -0.25), MAN_CQ, MAN_CQ, 26),
  sh(T.s7b, T.s7c, "cafe", "cafe2", WOM_CP, nudge(WOM_CP, 0.06, 0, -0.15), WOM_CQ, WOM_CQ, 28),
  sh(T.s7c, T.s7e - 0.3, "cafe", "cafe2", TWO_P0, TWO_P1, TWO_Q, TWO_Q, 26),
  sh(T.s7e - 0.3, T.s7f, "cafe", "cafe2", [-0.35, 1.5, 1.9], [-0.45, 1.55, 1.75], [0.65, 1.4, -0.1], [0.65, 1.45, -0.1], 30),
  sh(T.s7f, T.s8a - 0.6, "cafe", "cafe2", [0.0, 1.62, 2.7], [0.0, 1.95, 4.0], TWO_Q, [0, 1.15, -0.2], 28),
  // 8 forty years in the same kitchen
  sh(T.s8a - 0.6, T.s8b, "kitchen", "years", [0.6, 1.7, 3.2], [0.1, 1.64, 3.0], TWO_Q, TWO_Q, 28),
  sh(T.s8b, T.s8d - 0.2, "kitchen", "years", [0.55, 1.35, 1.45], [0.45, 1.32, 1.25], [0.3, 0.96, 0.15], [0.25, 0.96, 0.15], 28),
  sh(T.s8d - 0.2, T.s9a - 0.6, "kitchen", "years", [0.0, 1.62, 2.9], [0.0, 1.62, 2.5], TWO_Q, TWO_Q, 26),
  // 9 he is gone
  sh(T.s9a - 0.6, T.s10a - 0.3, "kitchen", "alone", [-0.3, 1.75, 3.4], [-0.1, 1.7, 3.0], [0, 1.05, 0], [0, 1.05, 0], 28),
  // 10 the letter (with flashbacks)
  sh(T.s10a - 0.3, T.s10c - 0.3, "kitchen", "letter", [0.02, 1.38, 1.0], [0.02, 1.33, 0.9], [0.02, 0.72, 0.2], [0.02, 0.72, 0.2], 32),
  sh(T.s10c - 0.3, T.s10e - 0.2, "cafe", "flashCafe", [0.1, 1.6, 2.7], [0.0, 1.55, 2.45], [-0.15, 1.08, 0], [-0.15, 1.08, 0], 26, true),
  sh(T.s10e - 0.2, T.s10f - 0.3, "cafe", "flashCafe2", TWO_P0, TWO_P1, TWO_Q, TWO_Q, 26, true),
  sh(T.s10f - 0.3, T.s10h - 0.3, "kitchen", "reading", WOM_CP, nudge(WOM_CP, 0.05, -0.02, -0.15), [0.8, 1.08, 0.1], [0.8, 1.1, 0.1], 30),
  sh(T.s10h - 0.3, T.s10i - 0.1, "kitchen", "letter", [0.02, 1.36, 0.97], [0.02, 1.3, 0.85], [0.02, 0.72, 0.2], [0.02, 0.72, 0.2], 32),
  sh(T.s10i - 0.1, T.s10j - 0.2, "kitchen", "flashKitchen", TWO_P0, TWO_P1, TWO_Q, TWO_Q, 26, true),
  sh(T.s10j - 0.2, T.s10k - 0.3, "kitchen", "reading", nudge(WOM_CP, 0.05, -0.02, -0.1), nudge(WOM_CP, 0.1, -0.03, -0.3), [0.8, 1.12, 0.1], [0.8, 1.14, 0.1], 26),
  sh(T.s10k - 0.3, T.s11b - 0.4, "kitchen", "letter", [0.02, 1.36, 0.97], [0.02, 1.26, 0.78], [0.02, 0.72, 0.2], [0.02, 0.72, 0.2], 32),
  // 11 "manis"
  sh(T.s11b - 0.4, T.s11d - 0.3, "kitchen", "visitor", [0.1, 1.68, 3.0], [0.0, 1.64, 2.7], TWO_Q, TWO_Q, 26),
  sh(T.s11d - 0.3, T.s12a - 0.6, "kitchen", "visitor", WOM_CP, nudge(WOM_CP, 0.06, -0.02, -0.25), [0.8, 1.14, 0.1], [0.8, 1.16, 0.1], 26),
  // 12 hikmah: the two cups and the salt shaker
  sh(T.s12a - 0.6, END, "kitchen", "hikmah", [0.0, 1.2, 1.15], [0.0, 1.75, 2.4], [0, 0.84, 0], [0, 0.98, 0], 30),
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1];

/** Letter phrases stitched on the cloth, per voice line. */
export const LETTER: Record<string, string> = {
  s10a: "maafkan aku.",
  s10b: "ada satu kebohongan yang kusimpan.",
  s10h: "Aku tidak suka kopi asin.",
  s10k: "meskipun aku harus minum kopi asin itu lagi.",
  s11a: "meskipun aku harus minum kopi asin itu lagi.",
};

/** Mouth shape driven by the word times of `who`'s own lines (stop-motion: changes on twos). */
export const mouthOf = (who: string, t: number): "o" | "small" | null => {
  const c = CLIPS.find((k) => k.who === who && t >= k.start && t <= k.end);
  if (!c) return null;
  const w = c.words.find((x) => t >= x.s && t <= x.e);
  if (!w) return "small";
  return Math.floor((t - w.s) * 12) % 2 === 0 ? "o" : "small";
};
