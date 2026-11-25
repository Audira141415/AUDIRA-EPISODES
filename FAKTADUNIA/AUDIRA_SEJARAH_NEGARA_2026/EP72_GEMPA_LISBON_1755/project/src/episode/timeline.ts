// EP72 Gempa Lisbon 1755 — film clock = VO clock (offset 0). VO 86.24 s, outro 86.5–89.5 s.
export const FILM_SECONDS = 89.5;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9" | "S10" | "S11";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };

const k = (pos: V3, target: V3, fov = 40): CamKey => ({ pos, target, fov });

// Scene boundaries from draft/TIMING_LOCK.md; keys spread evenly across each shot (Catmull-Rom).
export const SHOTS: Shot[] = [
  // S1 hook — three azulejo panels crack on "gempa / laut / api"
  { from: 0, to: 4.75, scene: "S1", keys: [k([-3.9, 1.3, 2.7], [0.3, 1.2, 0], 40), k([-3.1, 1.75, 3.3], [-1.3, 1.8, 0], 42), k([-2.1, 1.85, 3.3], [-2.1, 1.85, 0], 42)] },
  { from: 4.75, to: 5.95, scene: "S1", keys: [k([-0.45, 1.85, 3.35], [-0.05, 1.85, 0], 42), k([0.3, 1.85, 3.3], [0.1, 1.85, 0], 42)] },
  { from: 5.95, to: 7.0, scene: "S1", keys: [k([1.75, 1.9, 3.4], [2.05, 1.85, 0], 42), k([1.5, 2.2, 5.6], [1.3, 1.8, 0], 46)] },
  // S2 feast day — church, candles, worshippers; dolly to the door, shake from "berguncang"
  { from: 7.0, to: 12.4, scene: "S2", keys: [k([2.4, 0.7, 8.2], [0, 1.6, -3], 44), k([1.4, 0.85, 6.6], [0, 1.7, -3.2], 42), k([0.8, 0.95, 5.2], [0, 1.8, -3.5], 42)] },
  { from: 12.4, to: 17.5, scene: "S2", keys: [k([-1.3, 0.75, 3.9], [-1.0, 0.55, 2.6], 38), k([-0.2, 0.95, 3.6], [0, 1.4, -2.5], 40), k([0.2, 1.1, 2.0], [0, 1.6, -3.6], 40)] },
  // S3 shaking — azulejo map of Iberia, rings from the Atlantic epicentre
  { from: 17.5, to: 21.6, scene: "S3", keys: [k([-0.2, 6.6, 1.6], [-0.6, 0, 0.7], 44), k([-0.9, 6.0, 2.4], [-0.8, 0, 0.9], 44)] },
  { from: 21.6, to: 25.3, scene: "S3", keys: [k([-2.6, 2.6, 4.4], [-0.8, 0, 0.8], 42), k([-0.6, 3.0, 4.9], [-0.7, 0, 0.6], 42)] },
  // S4 sea withdraws — Tejo quay, exposed harbour bed
  { from: 25.3, to: 28.2, scene: "S4", keys: [k([-3.4, 1.3, 3.6], [-0.5, 0.75, 1.0], 42), k([-1.6, 1.45, 3.4], [0.2, 0.6, 0], 42)] },
  { from: 28.2, to: 31.6, scene: "S4", keys: [k([-0.8, 2.0, 2.6], [0.3, -0.1, -3.0], 44), k([0.6, 2.4, 2.2], [1.2, -0.4, -4.5], 46), k([1.6, 2.6, 1.6], [1.5, -0.5, -5.2], 46)] },
  // S5 tsunami — low POV on the quay, camera retreats as the tile wave comes
  { from: 31.6, to: 36.7, scene: "S5", keys: [k([0.6, 0.95, 2.3], [0, 1.0, -6], 48), k([0.3, 1.05, 3.2], [0, 1.3, -5], 50), k([0, 1.25, 4.8], [0, 1.5, -4], 52)] },
  // S6 fire — toppled lantern, fire spreads roof to roof, palace + library
  { from: 36.7, to: 40.6, scene: "S6", keys: [k([1.9, 0.75, 5.4], [0.7, 0.35, 3.6], 40), k([1.6, 1.6, 6.4], [0.4, 0.6, 2.4], 42), k([1.2, 3.0, 7.4], [0, 0.6, 0.6], 44)] },
  { from: 40.6, to: 45.1, scene: "S6", keys: [k([-2.4, 6.8, 6.0], [0, 0, -0.5], 44), k([-0.6, 4.6, 2.6], [0, 0.8, -3.6], 42), k([0.6, 2.6, -0.4], [0, 1.4, -5.2], 42)] },
  // S7 toll — ruined diorama, memorial candles, quiet pull-back
  { from: 45.1, to: 50.6, scene: "S7", keys: [k([0.4, 1.1, 6.6], [0, 0.6, 3.0], 40), k([0.2, 3.2, 8.4], [0, 0.6, 0.5], 42), k([0, 5.2, 10.6], [0, 0.4, -0.8], 44)] },
  // S8 Pombal — figure with the plan, quote, Baixa grid laid tile by tile
  { from: 50.6, to: 54.5, scene: "S8", keys: [k([-2.5, 1.15, 4.4], [-0.8, 0.85, 1.2], 40), k([-1.6, 1.0, 3.4], [-0.8, 0.9, 1.2], 38)] },
  { from: 54.5, to: 59.5, scene: "S8", keys: [k([1.0, 1.6, 4.2], [-0.6, 0.8, 1.2], 40), k([0.6, 3.6, 4.8], [0, 0, 0.2], 42), k([0.2, 6.8, 2.6], [0, 0, -0.3], 44)] },
  // S9 gaiola — macro orbit of the timber cage, then the marching test
  { from: 59.5, to: 63.4, scene: "S9", keys: [k([1.6, 1.7, 2.0], [0, 1.25, 0], 40), k([0.2, 1.5, 2.6], [0, 1.25, 0], 40), k([-1.5, 1.4, 2.1], [0, 1.2, 0], 40)] },
  { from: 63.4, to: 69.5, scene: "S9", keys: [k([-0.6, 1.5, 4.4], [0, 1.0, 0], 42), k([1.4, 2.6, 6.2], [0, 0.9, 0], 44), k([2.8, 3.6, 7.0], [0, 0.8, 0], 44)] },
  // S10 questionnaire — letters fly from the desk to the parish map
  { from: 69.5, to: 72.9, scene: "S10", keys: [k([3.6, 1.6, 4.4], [2.4, 0.7, 2.4], 40), k([2.6, 3.2, 5.0], [1.2, 0.3, 1.2], 42)] },
  { from: 72.9, to: 76.8, scene: "S10", keys: [k([1.2, 5.0, 4.6], [0, 0, 0.6], 44), k([0.2, 6.6, 2.2], [0, 0, -0.2], 44)] },
  // S11 payoff — tiles settle onto the gaiola frames: the new Baixa at golden hour
  { from: 76.8, to: 81.0, scene: "S11", keys: [k([0.35, 0.55, 6.2], [0, 1.4, 0], 40), k([0.25, 0.9, 4.6], [0, 1.8, -2], 40), k([0.2, 1.2, 3.4], [0, 2.0, -3], 40)] },
  { from: 81.0, to: 89.5, scene: "S11", keys: [k([0.2, 1.4, 3.6], [0, 2.0, -3], 40), k([0.1, 4.2, 6.0], [0, 1.2, -2.6], 44), k([0, 8.6, 6.4], [0, 0, -2.4], 46)] },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/** Earthquake / wave shake envelope (world units). */
const shake = (t: number) => {
  const env = (a: number, b: number, peak: number) => (t < a || t > b ? 0 : peak * Math.sin(((t - a) / (b - a)) * Math.PI));
  return env(16.45, 17.5, 0.05) + env(17.5, 21.4, 0.035) + env(34.0, 35.0, 0.04) + env(35.3, 36.3, 0.03);
};

/** Camera at film time t: Catmull-Rom through the shot keys, gentle ease at the shot ends only. */
export const cameraAt = (t: number): CamKey => {
  const s = shotAt(t);
  const raw = Math.min(1, Math.max(0, (t - s.from) / (s.to - s.from)));
  const u = raw * 0.75 + raw * raw * (3 - 2 * raw) * 0.25;
  const n = s.keys.length;
  let out: CamKey;
  if (n === 1) out = s.keys[0];
  else {
    const x = u * (n - 1);
    const i = Math.min(n - 2, Math.floor(x));
    const f = x - i;
    const g = (j: number) => s.keys[Math.max(0, Math.min(n - 1, j))];
    const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
    const v = (sel: (q: CamKey) => V3): V3 => [0, 1, 2].map((q) => cr(sel(a)[q], sel(b)[q], sel(c)[q], sel(d)[q], f)) as V3;
    out = { pos: v((q) => q.pos), target: v((q) => q.target), fov: cr(a.fov, b.fov, c.fov, d.fov, f) };
  }
  const sh = shake(t);
  if (sh > 0) {
    const fr = Math.floor(t * 30);
    const j = (s0: number) => Math.sin(fr * 12.9898 + s0) * 43758.5453 % 1;
    out = { ...out, pos: [out.pos[0] + j(1) * sh, out.pos[1] + j(2) * sh, out.pos[2] + j(3) * sh * 0.5] };
  }
  return out;
};

// HUD cards (layout px 1080 × 1920). `from` = VO word time the number lands on.
export type Card = { from: number; to: number; title: string; sub?: string; count?: { to: number; decimals: number; suffix: string; prefix?: string }; y?: number; tone?: "ochre" | "terra" | "sky" };
export const CARDS: Card[] = [
  { from: 0.4, to: 4.2, title: "LISBON · 1755", sub: "tiga bencana dalam satu pagi" },
  { from: 4.3, to: 5.35, title: "1 · GEMPA", tone: "ochre" },
  { from: 5.4, to: 6.25, title: "2 · LAUT", tone: "sky" },
  { from: 6.3, to: 7.0, title: "3 · API", tone: "terra" },
  { from: 7.1, to: 10.1, title: "1 NOVEMBER 1755" },
  { from: 10.2, to: 12.4, title: "HARI RAYA", sub: "Semua Orang Kudus" },
  { from: 13.5, to: 14.9, title: "LILIN MENYALA", sub: "gereja-gereja penuh", tone: "ochre" },
  { from: 15.0, to: 17.45, title: "PUKUL 09.40", sub: "tanah berguncang", tone: "terra" },
  { from: 18.6, to: 20.8, title: "3,5–6 MENIT", sub: "lamanya guncangan", tone: "terra" },
  { from: 20.9, to: 22.8, title: "DASAR ATLANTIK", sub: "pusat gempa", tone: "sky" },
  { from: 22.9, to: 25.3, title: "M 7,7 – ±9", sub: "kekuatan (perkiraan)", tone: "terra" },
  { from: 26.3, to: 28.1, title: "LARI KE DERMAGA", sub: "tepi Sungai Tejo", tone: "sky" },
  { from: 28.2, to: 31.6, title: "LAUT SURUT", sub: "dasar pelabuhan terlihat", tone: "sky" },
  { from: 32.2, to: 34.0, title: "±40 MENIT", sub: "setelah gempa" },
  { from: 34.1, to: 35.3, title: "TSUNAMI", tone: "sky" },
  { from: 35.4, to: 36.7, title: "+2 GELOMBANG", sub: "total tiga gelombang", tone: "sky" },
  { from: 39.9, to: 41.35, title: "KEBAKARAN", sub: "dari lilin yang roboh", tone: "terra" },
  { from: 41.4, to: 42.65, title: "BERJAM-JAM", tone: "terra" },
  { from: 42.7, to: 44.05, title: "ISTANA KERAJAAN", sub: "ikut terbakar", tone: "terra" },
  { from: 44.1, to: 45.15, title: "PERPUSTAKAAN", count: { to: 70000, decimals: 0, suffix: " JILID" }, tone: "ochre" },
  { from: 45.2, to: 48.6, title: "BANGUNAN HANCUR", count: { to: 85, decimals: 0, suffix: "%" }, tone: "terra" },
  { from: 48.7, to: 50.6, title: "30.000–40.000", sub: "jiwa (perkiraan korban)" },
  { from: 52.4, to: 54.5, title: "MARQUIS DE POMBAL", sub: "menteri raja · gelar kelak", tone: "ochre" },
  { from: 54.6, to: 57.6, title: "“KUBURKAN YANG MATI, RAWAT YANG HIDUP”", sub: "— konon", tone: "ochre" },
  { from: 57.7, to: 59.5, title: "BAIXA BARU", sub: "jalan lurus & lebar" },
  { from: 62.5, to: 64.35, title: "GAIOLA", sub: "rangka kayu bersilang", tone: "ochre" },
  { from: 64.4, to: 66.7, title: "DIUJI PASUKAN", sub: "berbaris menghentak", tone: "terra" },
  { from: 66.8, to: 69.5, title: "PERTAMA DI EROPA", sub: "salah satu bangunan tahan gempa", tone: "ochre" },
  { from: 70.5, to: 72.0, title: "KUESIONER", sub: "ke setiap paroki" },
  { from: 72.1, to: 72.85, title: "JAM BERAPA?", tone: "sky" },
  { from: 72.9, to: 74.0, title: "BERAPA LAMA?", tone: "sky" },
  { from: 74.1, to: 74.85, title: "BAGAIMANA LAUTNYA?", tone: "sky" },
  { from: 74.9, to: 76.8, title: "CIKAL BAKAL", sub: "ilmu gempa modern (seismologi)", tone: "ochre" },
  { from: 77.0, to: 80.2, title: "TIGA BENCANA", sub: "satu kota baru" },
  { from: 80.3, to: 82.8, title: "MEMBANGUN LEBIH KUAT", tone: "ochre" },
  { from: 82.9, to: 84.4, title: "RUMAHMU SIAP?", tone: "terra" },
  { from: 84.5, to: 86.45, title: "IKUTI AUDIRA", sub: "@AudiraFaktaDunia", tone: "ochre" },
];
