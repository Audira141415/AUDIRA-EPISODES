// EP75 Son Doong — film clock = VO clock (offset 0). VO 83.41 s, outro 83.4–86.4 s.
export const FILM_SECONDS = 86.4;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };
export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";

const k = (pos: V3, target: V3, fov = 40): CamKey => ({ pos, target, fov });

// One entry per SHOTLIST row; keys are spread evenly across the shot (Catmull-Rom).
export const SHOTS: Shot[] = [
  // S1 — cutaway: jungle on top, a city block inside the cave below; push through the hole to the skylight forest
  { from: 0, to: 5.6, scene: "S1", keys: [k([0, 14, 30], [0, 5, -2], 38), k([1.5, 11.5, 21], [0, 4.6, -4], 40)] },
  { from: 5.6, to: 9.3, scene: "S1", keys: [k([0.8, 4.2, 9], [0, 3.6, -8], 44), k([0.6, 3.2, -2], [0, 4.2, -14], 46), k([0.4, 2.6, -9.5], [0, 5.2, -20], 48)] },
  // S2 — jungle floor, limestone cliff, dark mouth; Ho Khanh walks in, then the cave breathes
  { from: 9.3, to: 13.0, scene: "S2", keys: [k([4.4, 2.3, 8.5], [0, 1.4, -2.5], 40), k([2.0, 1.6, 6.0], [0, 1.3, -3], 40)] },
  { from: 13.0, to: 17.6, scene: "S2", keys: [k([-2.6, 1.3, 4.0], [0, 1.1, -3.5], 38), k([-1.0, 1.05, 2.8], [0, 1.0, -4], 40)] },
  // S3 — top-down orbit: jungle swallows the mouth, 18 years pass
  { from: 17.6, to: 23.7, scene: "S3", keys: [k([3.5, 9.5, 4.0], [0, 0, -1.5], 42), k([0, 10.5, 5.5], [0, 0, -1.2], 42), k([-3.5, 9.0, 3.5], [0, 0.2, -1.5], 42)] },
  // S4 — dark passage, 2009 expedition with head lamps; survey beam
  { from: 23.7, to: 28.5, scene: "S4", keys: [k([0.9, 3.5, 1.2], [-1.2, 3.4, -5], 42), k([0.3, 2.3, -0.4], [-1.2, 2.0, -5], 40)] },
  { from: 28.5, to: 33.4, scene: "S4", keys: [k([-1.6, 1.5, 5.6], [0.1, 0.9, -6], 46), k([1.0, 1.7, 3.0], [0, 1.4, -12], 48)] },
  // S5 — the giant passage: tower for scale, measure lines, a 747 flies through
  { from: 33.4, to: 39.8, scene: "S5", keys: [k([0, 1.4, 10], [0, 5, -20], 50), k([-2.2, 2.4, 1], [1.5, 7, -20], 50)] },
  { from: 39.8, to: 42.9, scene: "S5", keys: [k([4.2, 2.6, 7], [0, 6.5, -24], 50), k([3.0, 2.2, 3], [0, 7.5, -4], 56)] },
  // S6 — doline: skylight, sun shaft, forest underground
  { from: 42.9, to: 46.8, scene: "S6", keys: [k([0, 2.0, 10], [0, 8, -16], 50), k([1.0, 3.0, 3], [0, 10, -16], 48)] },
  { from: 46.8, to: 50.9, scene: "S6", keys: [k([-3.4, 2.2, -5], [0, 3, -16], 44), k([3.2, 2.6, -9.5], [0, 3.8, -18], 44)] },
  // S7 — clouds inside the cave, seen from deeper in the passage
  { from: 50.9, to: 56.8, scene: "S7", keys: [k([2.2, 3.0, -42], [0, 5.5, -16], 44), k([-1.2, 2.6, -33], [0, 6.2, -16], 44)] },
  // S8 — the 60 m calcite wall, a climber; then cave pearls next to a baseball
  { from: 56.8, to: 61.7, scene: "S8", keys: [k([0, 1.4, 12.5], [0, 4.5, -10], 48), k([1.9, 4.0, 0.8], [1.9, 5.0, -6.2], 44)] },
  { from: 61.7, to: 65.0, scene: "S8", keys: [k([-1.9, 0.5, 3.4], [-2.5, 0.1, 2.0], 36), k([-2.9, 0.36, 3.0], [-2.45, 0.08, 2.0], 34)] },
  // S9 — cutaway: limestone strata, an underground river carves the void bigger
  { from: 65.0, to: 69.5, scene: "S9", keys: [k([0.6, 1.4, 15], [0, 1.6, 0], 40), k([-0.6, 1.8, 11.5], [0, 2.0, 0], 40)] },
  // S10 — camp under the skylight; the cable car plan crossed out
  { from: 69.5, to: 73.9, scene: "S10", keys: [k([5.2, 2.4, 6.5], [0, 1.0, -3], 42), k([-3.2, 2.0, 5.2], [0, 1.0, -3], 42)] },
  { from: 73.9, to: 77.9, scene: "S10", keys: [k([0, 2.6, 7.5], [0, 4.5, -6], 44), k([1.0, 3.6, 4.5], [0, 6, -6], 44)] },
  // S11 — karst landscape from above, pull back, outro
  { from: 77.9, to: 86.4, scene: "S11", keys: [k([0, 6, 10], [0, 1.2, -4], 40), k([0, 14, 20], [0, 0.6, -6], 42), k([0, 24, 31], [0, 0, -8], 44)] },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/** Camera at film time t: Catmull-Rom through the shot keys, gentle ease at the shot ends only. */
export const cameraAt = (t: number): CamKey => {
  const s = shotAt(t);
  const raw = Math.min(1, Math.max(0, (t - s.from) / (s.to - s.from)));
  const u = raw * 0.75 + raw * raw * (3 - 2 * raw) * 0.25;
  const n = s.keys.length;
  if (n === 1) return s.keys[0];
  const x = u * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const f = x - i;
  const g = (j: number) => s.keys[Math.max(0, Math.min(n - 1, j))];
  const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
  const v = (sel: (q: CamKey) => V3): V3 => [0, 1, 2].map((q) => cr(sel(a)[q], sel(b)[q], sel(c)[q], sel(d)[q], f)) as V3;
  return { pos: v((q) => q.pos), target: v((q) => q.target), fov: cr(a.fov, b.fov, c.fov, d.fov, f) };
};

// HUD cards (layout px, 1080 × 1920), timed to VO words.
export type Card = { from: number; to: number; title: string; sub?: string; count?: { from?: number; to: number; decimals: number; suffix: string; prefix?: string; dur?: number; plain?: boolean }; y: number; tone?: "cream" | "blue" | "rust" | "green" };
const Y = 260;
export const CARDS: Card[] = [
  { from: 0.4, to: 2.5, title: "VIETNAM", sub: "di bawah hutan", y: Y, tone: "green" },
  { from: 2.6, to: 5.5, title: "MUAT 1 BLOK NEW YORK", sub: "gedung pencakar langit", y: Y },
  { from: 7.8, to: 9.3, title: "HUTAN DI DALAM GUA", y: Y, tone: "green" },
  { from: 9.5, to: 11.9, title: "10 DES 1990", y: Y, tone: "rust" },
  { from: 12.0, to: 14.3, title: "HO KHANH", sub: "pencari kayu gaharu", y: Y },
  { from: 15.3, to: 17.5, title: "ANGIN + GEMURUH SUNGAI", sub: "dari mulut gua", y: Y, tone: "blue" },
  { from: 18.9, to: 20.3, title: "LUPA LETAKNYA", y: Y, tone: "rust" },
  { from: 20.4, to: 23.6, title: "18 TAHUN", count: { from: 1990, to: 2008, decimals: 0, suffix: "", dur: 2.2, plain: true }, y: Y },
  { from: 23.9, to: 27.9, title: "APRIL 2009", sub: "tim penjelajah gua Inggris", y: Y, tone: "blue" },
  { from: 30.9, to: 33.3, title: "HANG SƠN ĐOÒNG", sub: "gua terbesar di dunia", y: Y, tone: "rust" },
  { from: 34.6, to: 36.1, title: "PANJANG", count: { to: 5, decimals: 0, prefix: "> ", suffix: " KM" }, y: Y },
  { from: 36.5, to: 37.5, title: "TINGGI", count: { to: 200, decimals: 0, suffix: " M" }, y: Y, tone: "rust" },
  { from: 38.0, to: 39.8, title: "LEBAR", count: { to: 150, decimals: 0, suffix: " M" }, y: Y, tone: "blue" },
  { from: 40.2, to: 42.8, title: "BOEING 747", sub: "bisa terbang melewatinya", y: Y },
  { from: 43.3, to: 45.6, title: "2 ATAP RUNTUH", sub: "disebut doline", y: Y, tone: "rust" },
  { from: 47.5, to: 50.8, title: "HUTAN 200 M", sub: "di bawah tanah", y: Y, tone: "green" },
  { from: 52.4, to: 54.6, title: "EKOSISTEM SENDIRI", y: Y, tone: "green" },
  { from: 54.7, to: 56.7, title: "KABUT SEPERTI AWAN", y: Y, tone: "blue" },
  { from: 58.5, to: 59.6, title: "DINDING KALSIT", count: { to: 60, decimals: 0, suffix: " M" }, y: Y },
  { from: 59.8, to: 61.6, title: "TEMBOK BESAR VIETNAM", y: Y, tone: "rust" },
  { from: 63.0, to: 64.9, title: "MUTIARA GUA", sub: "≈ sebesar bola bisbol", y: Y, tone: "blue" },
  { from: 67.8, to: 69.4, title: "2–5 JUTA TAHUN", sub: "dipahat sungai bawah tanah", y: Y },
  { from: 69.7, to: 71.9, title: "SEJAK 2013", sub: "wisatawan boleh masuk", y: Y, tone: "green" },
  { from: 72.5, to: 73.7, title: "IZIN TERBATAS", y: Y, tone: "rust" },
  { from: 74.1, to: 75.9, title: "TUTUP MUSIM HUJAN", y: Y, tone: "blue" },
  { from: 76.3, to: 77.9, title: "KERETA GANTUNG", sub: "DIBATALKAN", y: Y, tone: "rust" },
  { from: 78.2, to: 80.9, title: "GUA TERBESAR DI DUNIA", sub: "ditemukan karena angin", y: Y },
  { from: 81.1, to: 83.3, title: "IKUTI AUDIRA", sub: "@AudiraFaktaDunia", y: Y, tone: "green" },
];
