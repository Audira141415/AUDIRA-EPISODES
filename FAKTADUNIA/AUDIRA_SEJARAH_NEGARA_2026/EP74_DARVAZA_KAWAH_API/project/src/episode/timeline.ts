// EP74 Darvaza — film clock = VO clock (offset 0). VO 77.74 s, outro 78–81 s. 1 unit = 1 m (scene B map: 1 unit ≈ 2.6 km).
export const FILM_SECONDS = 81;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[]; follow?: boolean };

const k = (pos: V3, target: V3, fov = 38): CamKey => ({ pos, target, fov });

export const SHOTS: Shot[] = [
  // A — hook: night, flying down to the burning crater
  { from: 0, to: 6.6, scene: "A", keys: [k([70, 150, 190], [0, -14, 0], 40), k([30, 60, 110], [0, -14, 0], 40), k([10, 16, 62], [0, -14, 0], 42)] },
  // B — relief map: Ashgabat → 260 km north → Darvaza
  { from: 6.6, to: 13.3, scene: "B", keys: [k([0, 70, 52], [0, 0, 36], 40), k([-10, 58, 62], [-2, 0, -14], 42), k([-4, 30, -22], [-4, 0, -62], 40)] },
  // C — 1971 Soviet drilling camp
  { from: 13.3, to: 19.8, scene: "C", keys: [k([30, 7, 44], [0, 6, 0], 38), k([6, 6, 50], [0, 6, 0], 38), k([-24, 7, 42], [0, 6, 0], 38)] },
  { from: 19.8, to: 23.6, scene: "C", keys: [k([-24, 6, 34], [0, 4, 0], 40), k([-17, 5, 29], [0, 4, 0], 40)] },
  { from: 23.6, to: 28.0, scene: "C", keys: [k([-10, 6, 30], [0, -4, 0], 44), k([-4, 22, 52], [0, -10, 0], 42), k([4, 40, 70], [0, -14, 0], 40)] },
  // D — dusk: the torch, the fire
  { from: 28.0, to: 32.6, scene: "D", keys: [k([-46, 5, 40], [0, -5, 0], 38), k([-34, 6, 46], [0, -5, 0], 38)] },
  { from: 32.6, to: 39.2, scene: "D", keys: [k([-22, 8, 50], [0, -14, 0], 40), k([-6, 14, 58], [0, -14, 0], 40), k([10, 20, 64], [0, -14, 0], 40)] },
  // E — cross-section diagram, 70 m × 30 m
  { from: 39.2, to: 44.4, scene: "E", keys: [k([-36, 10, 262], [0, -16, -20], 36), k([30, 4, 248], [0, -16, -20], 36)] },
  // F — the sealed archive at night
  { from: 44.4, to: 54.1, scene: "F", keys: [k([16, 12, 62], [6, 0.4, 42], 40), k([9, 3.4, 48], [6, 0.5, 42], 38), k([5.2, 1.9, 44.6], [6, 0.5, 42.2], 38)] },
  // G — 2013: explorer descends, then on the crater floor
  { from: 54.1, to: 59.0, scene: "G", follow: true, keys: [k([8, 0, -26], [0, -4, -34], 42), k([7, -14, -18], [0, -16, -28], 42), k([6, -24, -12], [0, -27, -21], 42)] },
  { from: 59.0, to: 62.4, scene: "G", follow: true, keys: [k([4, -27.6, -12.5], [0, -28.6, -19], 40), k([-3, -27.4, -13], [0, -28.6, -19], 40)] },
  // H — pre-dawn: new gas wells, the fire shrinks to a third
  { from: 62.4, to: 73.6, scene: "H", keys: [0.5, 0.2, -0.1, -0.4].map((a, i) => k([Math.sin(a) * 150, 70 + i * 8, Math.cos(a) * 150], [0, 4, 0], 40)) },
  // I — dawn, the fire dims; pull out
  { from: 73.6, to: 81.0, scene: "I", keys: [k([18, 16, 70], [0, -14, 0], 40), k([24, 22, 94], [0, -14, 0], 40), k([30, 32, 122], [0, -12, 0], 40)] },
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
  if (s.follow) {
    const e = explorerAt(t);
    out = { ...out, target: [e[0], e[1] + 1.3, e[2]] };
  }
  // ground shake while the drill site collapses (decaying)
  if (t > 23.7 && t < 25.8) {
    const st = Math.floor(t * 30) / 30;
    const a = 0.5 * (1 - (t - 23.7) / 2.1);
    out = { ...out, pos: [out.pos[0] + Math.sin(st * 61) * a, out.pos[1] + Math.sin(st * 47 + 1) * a, out.pos[2] + Math.cos(st * 53) * a] };
  }
  return out;
};

/** Explorer (2013): roped descent from the north rim to the crater floor, then sampling. */
export const explorerAt = (t: number): V3 => {
  const u = Math.min(1, Math.max(0, (t - 54.1) / 4.4));
  const e = u * u * (3 - 2 * u);
  // from hanging below the tripod at the rim to the floor (y of floor ≈ −29.6)
  return [0, -1.5 + (-29.6 + 1.5) * e, -35.5 + 16.5 * e];
};

// ---------- HUD cards (layout px, 1080 × 1920) ----------
export type Card = {
  from: number;
  to: number;
  title: string;
  sub?: string;
  count?: { from?: number; to: number; decimals: number; suffix?: string; prefix?: string; plain?: boolean };
  bar?: { from: number; to: number; label: string };
  micro?: boolean;
  tone?: "fire" | "blue" | "green" | "cream";
};
export const CARD_Y = 262;
export const CARDS: Card[] = [
  { from: 1.1, to: 4.3, title: "TURKMENISTAN", sub: "gurun Karakum", tone: "cream" },
  { from: 4.6, to: 6.55, title: "SEJAK", count: { to: 1971, decimals: 0, plain: true }, tone: "fire" },
  { from: 7.0, to: 8.8, title: "KAWAH GAS DARVAZA", tone: "fire" },
  { from: 8.9, to: 11.6, title: "JARAK", count: { to: 260, decimals: 0, suffix: " KM" }, sub: "dari Ashgabat ke utara", tone: "blue" },
  { from: 11.8, to: 13.25, title: "“GERBANG NERAKA”", sub: "julukan kawah ini", tone: "fire" },
  { from: 15.7, to: 19.7, title: "1971", sub: "insinyur Soviet mencari minyak", tone: "blue" },
  { from: 20.5, to: 23.6, title: "RONGGA GAS", sub: "di bawah rig pengeboran", tone: "cream" },
  { from: 23.7, to: 27.9, title: "TANAH RUNTUH", sub: "rig ikut terperosok", tone: "fire" },
  { from: 28.2, to: 32.7, title: "GAS METANA", sub: "CH₄ · bocor ke udara", tone: "green" },
  { from: 32.8, to: 36.0, title: "DIBAKAR", sub: "supaya gasnya habis", tone: "fire" },
  { from: 36.0, to: 37.55, title: "“BEBERAPA HARI”", sub: "perkiraan awal", tone: "cream" },
  { from: 37.6, to: 39.15, title: "MASIH MENYALA", count: { from: 1971, to: 2025, decimals: 0, plain: true, prefix: "1971 → " }, tone: "fire" },
  { from: 40.2, to: 44.35, title: "±70 M × 30 M", sub: "lebar × dalam kawah", tone: "blue" },
  { from: 45.7, to: 49.9, title: "ARSIP TIDAK DIBUKA", sub: "catatan resmi 1971 tertutup", tone: "cream" },
  { from: 50.3, to: 52.6, title: "RUNTUH 1960-AN?", sub: "menurut geolog setempat", tone: "blue" },
  { from: 52.6, to: 54.0, title: "DIBAKAR 1980-AN?", sub: "baru dinyalakan?", tone: "fire" },
  { from: 54.4, to: 59.3, title: "2013", sub: "George Kourounis · baju tahan panas", tone: "blue" },
  { from: 59.6, to: 62.3, title: "BAKTERI DITEMUKAN", sub: "hidup di tanah sepanas itu", micro: true, tone: "green" },
  { from: 62.7, to: 67.0, title: "2022", sub: "presiden: padamkan api ini", tone: "blue" },
  { from: 67.2, to: 70.2, title: "SUMUR PENYEDOT GAS", sub: "dibor di sekeliling kawah", tone: "cream" },
  { from: 70.4, to: 73.5, title: "API TINGGAL ⅓", bar: { from: 1, to: 1 / 3, label: "2025" }, tone: "fire" },
  { from: 73.9, to: 77.9, title: "MULAI MEREDUP", sub: "setelah lebih dari 50 tahun", tone: "cream" },
];

/** Fire amount 0..1 at film time t (share of flames alive). */
export const fireAt = (t: number) => {
  if (t < 28) return 0; // scene C: before the collapse there is no fire
  if (t < 33.4) return 0;
  if (t < 35.2) return (t - 33.4) / 1.8;
  if (t < 67) return 1;
  if (t < 72.6) return 1 - ((t - 67) / 5.6) * 0.67;
  return t < 73.6 ? 0.33 : 0.3;
};
