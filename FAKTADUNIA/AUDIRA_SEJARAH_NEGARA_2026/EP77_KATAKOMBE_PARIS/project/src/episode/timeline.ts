// EP77 Katakombe Paris — film clock = VO clock (offset 0). VO 89.21 s, outro 89.2–92.2 s (draft/TIMING_LOCK.md).
export const FILM_SECONDS = 92.2;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "S1" | "S2" | "S3A" | "S3B" | "S4A" | "S4B" | "S5A" | "S5B" | "S6" | "S7A" | "S7B" | "S8";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };

const k = (pos: V3, target: V3, fov = 44): CamKey => ({ pos, target, fov });

export const SHOTS: Shot[] = [
  // S1 hook — bone-lined tunnel, dolly toward the AUDIRA stone
  { from: 0, to: 5.7, scene: "S1", keys: [k([0.35, 1.5, 4.5], [0, 1.35, -10], 50), k([0, 1.5, 1.2], [0, 1.4, -11], 48), k([-0.25, 1.45, -2.4], [0.05, 1.35, -13], 46)] },
  // S2 cross-section — the city above, the limestone quarry below; crane down
  { from: 5.7, to: 17.2, scene: "S2", keys: [k([0, 9.5, 17], [0, 5, -6], 44), k([0, 5.5, 15], [0, 1.5, -4], 44), k([0.6, 0, 12.5], [0, -3.4, -2], 44), k([1.6, -3.2, 9.5], [0, -4.4, -2], 44)] },
  // S3A Rue d'Enfer at night — the road sinks into the void
  { from: 17.2, to: 20.4, scene: "S3A", keys: [k([0, 1.7, 9], [0, 2.6, -14], 46), k([0.6, 2.2, 5], [0, 1.8, -12], 46)] },
  { from: 20.4, to: 24.4, scene: "S3A", keys: [k([0.7, 2.6, 4], [0, 0.4, -9], 46), k([0.5, 3.8, 1.5], [0, -1.2, -9], 48), k([0.3, 5.2, -1.2], [0, -2.4, -9], 50)] },
  // S3B inspection — new stone pillars, inspector walks toward camera
  { from: 24.4, to: 28.8, scene: "S3B", keys: [k([0.75, 1.45, -1.5], [0, 1.2, -10], 44), k([0.5, 1.4, -3.4], [0, 1.2, -10], 42)] },
  // S4A Saints-Innocents — fog, crosses, church; push to the gate
  { from: 28.8, to: 36.6, scene: "S4A", keys: [k([0, 1.6, 9], [0, 2.2, -10], 44), k([0.3, 1.9, 5], [0, 1.6, -12], 44), k([0.8, 3.0, 1.8], [0, 0.7, -12], 46)] },
  // S4B cellar wall bursts — crane from street to the cellar
  { from: 36.6, to: 39.2, scene: "S4B", keys: [k([0.5, 6, 15], [0.5, 3.5, -4], 44), k([1.2, 1.5, 11], [1, -0.8, -2], 42)] },
  { from: 39.2, to: 43.6, scene: "S4B", keys: [k([1.4, -0.8, 9], [1.0, -1.8, -2], 42), k([2.0, -1.4, 7], [0.8, -2.0, -2.5], 40)] },
  // S5A blessing at the quarry mouth — candles, priest, kneeling crowd
  { from: 43.6, to: 52.0, scene: "S5A", keys: [k([3.2, 1.7, 5.5], [0, 1.2, -3], 42), k([0.6, 2.0, 4.6], [0, 1.2, -3], 40), k([-2.4, 1.5, 3.8], [0, 1.4, -3], 40)] },
  // S5B night convoy — black-draped wagons, torch bearers; tracking shot
  { from: 52.0, to: 58.4, scene: "S5B", keys: [k([-17, 1.8, 8], [-19, 1.3, 0], 44), k([-13, 2.0, 7.5], [-15, 1.3, 0], 44), k([-8, 2.3, 7.5], [-10, 1.3, 0], 44)] },
  // S6 the ossuary gallery — bone wall grows; Héricart
  { from: 58.4, to: 64.8, scene: "S6", keys: [k([3.0, 1.6, 4.8], [0, 1.0, -1.6], 42), k([1.0, 1.4, 3.8], [0, 1.0, -1.6], 40), k([-0.6, 1.3, 3.0], [-0.6, 1.0, -1.6], 40)] },
  { from: 64.8, to: 70.4, scene: "S6", keys: [k([-1.4, 1.2, 2.0], [-1.0, 0.8, -1.6], 38), k([-1.2, 1.15, 1.2], [-1.2, 1.0, -1.6], 34), k([-0.4, 1.3, 1.6], [-0.8, 1.15, -1.6], 36)] },
  // S7A the gate — "Arrête ! C'est ici l'empire de la Mort"
  { from: 70.4, to: 75.2, scene: "S7A", keys: [k([0, 1.4, 4.4], [0, 2.3, -4], 44), k([0, 1.8, 2.6], [0, 2.6, -4], 42), k([0, 2.1, 1.6], [0, 2.75, -4], 42)] },
  // S7B spiral stair — visitors descend; camera spirals down
  { from: 75.2, to: 84.0, scene: "S7B", keys: [k([5.5, 1.5, 3.5], [0, -1.5, 0], 46), k([-1.5, -1.5, 6], [0, -3.5, 0], 46), k([0.6, -2.6, 6.2], [0, -4.6, 0], 46), k([2.2, -3.4, 5.8], [0, -5.8, 0], 46)] },
  // S8 payoff — tunnel below, the city of light above; crane up, hold under the outro
  { from: 84.0, to: 92.2, scene: "S8", keys: [k([1.4, -4.2, 9], [0, -4.4, -2], 44), k([0.6, -1, 12.5], [0, -2, -3], 44), k([0, 4.5, 16], [0, 3, -5], 44), k([0, 8, 19], [0, 5.5, -6], 44), k([0, 8.4, 19.4], [0, 5.6, -6], 44)] },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/** Collapse / wall-burst shake envelope (world units). */
const shake = (t: number) => {
  const env = (a: number, b: number, peak: number) => (t < a || t > b ? 0 : peak * Math.sin(((t - a) / (b - a)) * Math.PI));
  return env(20.9, 23.5, 0.07) + env(39.5, 41.0, 0.05);
};

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
    const j = (s0: number) => ((Math.sin(fr * 12.9898 + s0) * 43758.5453) % 1);
    out = { ...out, pos: [out.pos[0] + j(1) * sh, out.pos[1] + j(2) * sh, out.pos[2] + j(3) * sh * 0.5] };
  }
  return out;
};

// HUD cards (layout px 1080 × 1920). `from` = VO word time the fact lands on (TIMING_LOCK).
export type Tone = "hero" | "grief" | "foe" | "neutral";
export type Card = {
  from: number; to: number; title: string; sub?: string; tone?: Tone; y?: number; quote?: boolean;
  count?: { to: number; decimals: number; suffix: string; prefix?: string };
};
export const CARDS: Card[] = [
  { from: 0.3, to: 2.45, title: "DI BAWAH PARIS", sub: "jalanan kota", tone: "neutral" },
  { from: 2.5, to: 5.6, title: "TULANG LEBIH DARI", count: { to: 6000000, decimals: 0, suffix: "+ JIWA" }, tone: "grief" },
  { from: 6.9, to: 9.8, title: "BATU KAPUR", sub: "digali dari bawah kota", tone: "hero" },
  { from: 9.9, to: 12.2, title: "MEMBANGUN KOTA", sub: "batu untuk gedung-gedung Paris", tone: "hero" },
  { from: 13.9, to: 15.75, title: "LABIRIN TAMBANG", sub: "tersisa berabad-abad kemudian", tone: "neutral" },
  { from: 15.8, to: 17.15, title: "LUAS LORONG", count: { to: 800, decimals: 0, suffix: " HEKTARE", prefix: "±" }, tone: "neutral" },
  { from: 17.5, to: 20.3, title: "1774", sub: "tanah menyerah", tone: "foe" },
  { from: 20.45, to: 22.1, title: "RUE D'ENFER", sub: "jalan runtuh", tone: "foe" },
  { from: 22.2, to: 24.35, title: "DITELAN BUMI", count: { to: 300, decimals: 0, suffix: " METER", prefix: "±" }, tone: "foe" },
  { from: 24.7, to: 26.15, title: "LOUIS XVI", sub: "raja Prancis", tone: "hero" },
  { from: 26.2, to: 28.75, title: "1777", sub: "dinas inspeksi tambang", tone: "hero" },
  { from: 29.7, to: 31.8, title: "MASALAH DI ATAS", sub: "kuburan kota penuh sesak", tone: "grief" },
  { from: 31.9, to: 33.15, title: "SAINTS-INNOCENTS", sub: "pemakaman di jantung Paris", tone: "grief" },
  { from: 33.2, to: 34.75, title: "±10 ABAD", sub: "dipakai terus-menerus", tone: "grief" },
  { from: 34.8, to: 36.55, title: "BERISI SEKITAR", count: { to: 2000000, decimals: 0, suffix: " JENAZAH", prefix: "±" }, tone: "grief" },
  { from: 36.9, to: 39.5, title: "1780", sub: "dinding ruang bawah tanah", tone: "foe" },
  { from: 39.6, to: 42.6, title: "DINDING JEBOL", sub: "tertekan beban kuburan", tone: "foe" },
  { from: 42.7, to: 43.6, title: "DITUTUP", tone: "foe" },
  { from: 43.7, to: 47.1, title: "SOLUSINYA?", sub: "pindahkan ke bawah tanah", tone: "neutral" },
  { from: 47.2, to: 50.9, title: "7 APRIL 1786", sub: "tambang tua diberkati", tone: "hero" },
  { from: 51.0, to: 52.0, title: "OSUARIUM", sub: "rumah tulang", tone: "grief" },
  { from: 52.4, to: 53.95, title: "TIAP MALAM", sub: "konvoi gerobak", tone: "neutral" },
  { from: 54.0, to: 55.75, title: "KAIN HITAM", sub: "menutup muatan", tone: "grief" },
  { from: 55.8, to: 58.35, title: "DIAM-DIAM", sub: "agar warga tidak resah", tone: "neutral" },
  { from: 58.6, to: 62.2, title: "1786 – 1814", sub: "pemindahan berlangsung", tone: "grief" },
  { from: 62.3, to: 64.7, title: "HÉRICART DE THURY", sub: "kepala inspeksi tambang", tone: "hero" },
  { from: 65.2, to: 67.4, title: "TULANG PAHA", sub: "disusun jadi dinding", tone: "grief" },
  { from: 67.5, to: 70.3, title: "BARISAN TENGKORAK", sub: "rapi seperti relief", tone: "grief" },
  { from: 72.2, to: 75.1, title: "“BERHENTI! DI SINILAH KERAJAAN KEMATIAN”", sub: "tulisan di gerbang osuarium", tone: "foe", quote: true },
  { from: 76.2, to: 77.65, title: "PENGUNJUNG", count: { to: 550000, decimals: 0, suffix: " / TAHUN", prefix: "±" }, tone: "neutral" },
  { from: 77.7, to: 80.1, title: "131 ANAK TANGGA", sub: "turun ke bawah", tone: "neutral" },
  { from: 80.2, to: 82.1, title: "1,5 KM", sub: "lorong terbuka untuk umum", tone: "neutral" },
  { from: 82.15, to: 84.0, title: "±14 °C", sub: "suhu lorong", tone: "neutral" },
  { from: 84.1, to: 86.7, title: "KOTA CAHAYA", sub: "di atas kerajaan sunyi", tone: "hero" },
  { from: 86.8, to: 89.1, title: "IKUTI AUDIRA", sub: "@AudiraFaktaDunia", tone: "hero" },
];
