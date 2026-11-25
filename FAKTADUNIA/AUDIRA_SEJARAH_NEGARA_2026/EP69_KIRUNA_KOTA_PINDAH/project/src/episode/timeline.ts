// EP69 Kiruna — film clock = VO clock (offset 0). VO 80.48 s, outro 80.6–83.6 s (docs/TIMING_LOCK.md).
export const FILM_SECONDS = 83.6;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };

const k = (pos: V3, target: V3, fov = 38): CamKey => ({ pos, target, fov });

// A S1 hook · B S2 Arctic map + snowy town · C S3 mine cross-section · D S4 town shifts east
// E S5 church 1912 · F S6 road prep · G S7 the journey · H S8 turned 180° + payoff
const RAW_SHOTS: Shot[] = [
  // A — church rolling on two trailers, side dolly then push-in to the tower
  { from: 0, to: 3.9, scene: "A", keys: [k([4.6, 1.0, 5.6], [0.2, 1.6, 0], 40), k([3.2, 0.9, 4.9], [0.5, 1.7, 0], 38)] },
  { from: 3.9, to: 7.75, scene: "A", keys: [k([-1.8, 1.0, 5.4], [0.6, 1.6, 0], 40), k([-0.6, 1.3, 4.4], [0.9, 2.2, 0], 36)] },
  // B — map of Scandinavia on the table, then glide down into the snowy town
  { from: 7.75, to: 13.4, scene: "B", keys: [k([0, 6.2, 2.6], [0, 0, -0.2], 40), k([0.6, 3.4, 2.0], [0.7, 0, -0.9], 38)] },
  { from: 13.4, to: 16.9, scene: "B", keys: [k([28.8, 1.6, 5.4], [30, 0.7, 0], 40), k([30.8, 1.2, 4.4], [30, 0.8, 0], 38)] },
  // C — cross-section: town on top, crane down to the deepest level, back up to the town
  { from: 16.9, to: 22.4, scene: "C", keys: [k([-1.4, 1.6, 7.2], [0, 0.0, 0], 40), k([0.6, 0.2, 7.6], [0.2, -1.6, 0], 42)] },
  { from: 22.4, to: 29.6, scene: "C", keys: [k([1.4, -2.4, 7.0], [0.8, -3.6, 0], 42), k([0.8, -4.4, 6.4], [0.6, -5.1, 0], 40), k([-0.4, -1.8, 7.4], [0, -2.0, 0], 42)] },
  { from: 29.6, to: 33.3, scene: "C", keys: [k([-1.4, 1.0, 3.4], [-0.7, -0.35, -0.7], 40), k([-0.2, 0.8, 2.8], [-0.4, -0.3, -0.7], 38)] },
  // D — top-down 3/4 pan west → east following the arrow
  { from: 33.3, to: 40.3, scene: "D", keys: [k([-3.4, 3.2, 6.4], [-2.6, 0.3, -0.6], 40), k([0, 3.8, 7.8], [0, 0.3, -0.4], 42), k([3.4, 3.2, 6.4], [3.0, 0.4, -0.8], 40)] },
  // E — church 1912: slow orbit to the facade, tilt up to the tower
  { from: 40.3, to: 44.1, scene: "E", keys: [k([4.6, 1.0, 4.4], [0, 1.4, 0], 40), k([3.0, 0.9, 5.4], [0, 1.6, 0], 40)] },
  { from: 44.1, to: 49.6, scene: "E", keys: [k([1.2, 0.8, 5.6], [0, 1.6, 0], 40), k([-1.6, 0.7, 5.0], [0, 2.4, 0], 38)] },
  // F — road prep: trailers under, lift, road widened, posts pulled
  { from: 49.6, to: 54.0, scene: "F", keys: [k([3.8, 0.7, 4.6], [0, 0.9, 0], 40), k([2.6, 1.1, 5.4], [0, 1.3, 0], 40)] },
  { from: 54.0, to: 59.9, scene: "F", keys: [k([5.6, 2.4, 6.2], [3.2, 0.8, 0], 42), k([8.6, 2.0, 5.6], [7.0, 1.0, 0], 40)] },
  // G — the journey: front-side dolly following the trailers
  { from: 59.9, to: 65.0, scene: "G", keys: [k([3.8, 1.0, 4.8], [0.6, 1.5, 0], 40), k([5.2, 1.1, 4.6], [1.6, 1.6, 0], 40)] },
  { from: 65.0, to: 70.9, scene: "G", keys: [k([0.6, 1.8, 6.2], [2.4, 1.4, 0], 42), k([4.8, 1.4, 5.2], [3.6, 1.5, 0], 40)] },
  // H — new site: orbit with the 180° turn, cutaway, pull back wide
  { from: 70.9, to: 74.7, scene: "H", keys: [k([4.2, 1.2, 4.4], [0, 1.5, 0], 40), k([0.8, 1.1, 5.8], [0, 1.5, 0], 40)] },
  { from: 74.7, to: 76.6, scene: "H", keys: [k([1.8, 1.7, 5.0], [0, 0.85, 0.4], 36), k([1.1, 1.6, 4.3], [0, 0.85, 0.4], 33)] },
  { from: 76.6, to: 83.6, scene: "H", keys: [k([-1.4, 1.2, 5.2], [0, 1.5, 0], 40), k([-2.2, 3.6, 11.0], [0, 1.4, -1], 42)] },
];

// 9:16 is narrow (horizontal FOV ~23°): church shots pull back along the view ray so the whole hull + trailers read.
const PULL: Record<string, number> = { A: 1.35, E: 1.75, F: 1.75, G: 1.7, H: 1.75 };
const pull = (q: CamKey, m: number): CamKey => ({ ...q, pos: q.pos.map((p, i) => q.target[i] + (p - q.target[i]) * m) as V3, target: [q.target[0], q.target[1] + 0.25 * (m - 1), q.target[2]] });
export const SHOTS: Shot[] = RAW_SHOTS.map((s) => {
  const m = s.from >= 54 && s.from < 59 ? 1 : s.from >= 74.7 && s.from < 76.6 ? 1 : PULL[s.scene] ?? 1;
  return m === 1 ? s : { ...s, keys: s.keys.map((q) => pull(q, m)) };
});

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

// HUD callouts (layout px 1080 × 1920), from docs/TIMING_LOCK.md.
export type CardKind = "big" | "card" | "chip" | "stamp" | "dialog";
export type Card = { from: number; to: number; kind: CardKind; title: string; sub?: string; count?: { to: number; decimals: number; suffix: string; prefix?: string } };
export const CARDS: Card[] = [
  { from: 0.6, to: 3.75, kind: "big", title: "BERAT GEREJA", count: { to: 672, decimals: 0, suffix: " TON" } },
  { from: 3.9, to: 5.75, kind: "card", title: "500 M / JAM", sub: "kecepatan jalan" },
  { from: 5.85, to: 7.6, kind: "chip", title: "FAKTA DUNIA · AUDIRA" },
  { from: 8.1, to: 9.75, kind: "card", title: "KIRUNA · SWEDIA", sub: "kota tambang" },
  { from: 9.8, to: 13.4, kind: "big", title: "145 KM", sub: "utara Lingkar Arktik" },
  { from: 14.7, to: 16.8, kind: "card", title: "TAMBANG BIJIH BESI", sub: "di bawah kota" },
  { from: 17.07, to: 20.5, kind: "big", title: "2004 · LKAB", sub: "perusahaan tambang" },
  { from: 22.6, to: 26.3, kind: "big", title: "LEVEL TAMBANG BARU", count: { to: 1365, decimals: 0, suffix: " M", prefix: "−" } },
  { from: 26.5, to: 29.5, kind: "stamp", title: "DILARANG MENAMBANG DI BAWAH BANGUNAN", sub: "hukum Swedia" },
  { from: 29.7, to: 33.2, kind: "dialog", title: "“…jadi KOTANYA yang pindah.”" },
  { from: 33.5, to: 36.0, kind: "card", title: "SEJAK 2014", sub: "kota mulai digeser" },
  { from: 36.0, to: 37.7, kind: "big", title: "±3 KM KE TIMUR", sub: "pusat kota digeser" },
  { from: 37.8, to: 40.3, kind: "card", title: "2014 → 2100", sub: "target tuntas" },
  { from: 44.1, to: 46.6, kind: "big", title: "GEREJA KAYU · 1912" },
  { from: 46.7, to: 49.6, kind: "card", title: "BANGUNAN TERFAVORIT SWEDIA", sub: "polling 2001" },
  { from: 50.1, to: 53.8, kind: "big", title: "2 TRAILER", sub: "gereja diangkat utuh" },
  { from: 53.9, to: 55.8, kind: "big", title: "JALAN 24 M", sub: "dilebarkan" },
  { from: 55.9, to: 59.8, kind: "card", title: "TIANG · LAMPU · JEMBATAN", sub: "dibongkar" },
  { from: 60.1, to: 63.8, kind: "big", title: "19 AGUSTUS 2025" },
  { from: 64.0, to: 66.3, kind: "big", title: "30 M", sub: "di jam pertama" },
  { from: 66.4, to: 68.7, kind: "big", title: "5 KM · 2 HARI" },
  { from: 68.8, to: 70.8, kind: "chip", title: "● LIVE · televisi Swedia" },
  { from: 72.3, to: 74.6, kind: "big", title: "DIPUTAR 180°" },
  { from: 74.7, to: 76.5, kind: "card", title: "ORGEL 1.000 PIPA", sub: "ikut pindah di dalam" },
  { from: 76.6, to: 80.4, kind: "card", title: "SATU KOTA PINDAH", sub: "satu gereja berjalan" },
];
