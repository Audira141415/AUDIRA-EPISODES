// EP59 Finlandia 3 Juta Sauna — film clock = VO clock (offset 0). VO 78.95 s, outro 79–82 s.
export const FILM_SECONDS = 82;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

const k = (pos: V3, target: V3, fov = 38): CamKey => ({ pos, target, fov });

// One entry per SHOTLIST row; keys are spread evenly across the shot (Catmull-Rom).
export const SHOTS: Shot[] = [
  // A — hook, frozen lake + cabins popping
  { from: 0, to: 3.5, scene: "A", keys: [k([0.4, 1.6, 7.6], [0, 0.9, 0], 40), k([0.1, 1.35, 5.6], [0, 0.85, 0], 38)] },
  { from: 3.5, to: 6.6, scene: "A", keys: [k([-2.6, 2.4, 6.4], [0, 0.6, -0.5], 40), k([-1.0, 5.2, 9.5], [0, 0.4, -1.2], 42)] },
  // B — row of houses, each with its own sauna; then stitched SAUNA letters
  { from: 6.6, to: 10.4, scene: "B", keys: [k([-3.2, 1.7, 5.4], [-2.2, 0.7, 0], 40), k([1.2, 1.9, 5.6], [2.0, 0.7, 0], 40)] },
  { from: 10.4, to: 16.1, scene: "B", keys: [k([0, 1.2, 4.2], [0, 1.0, -3.0], 40), k([0, 2.4, 3.4], [0, 2.1, -3.6], 38)] },
  // C — sauna everywhere: lake, apartment, office, parliament (truck right)
  { from: 16.1, to: 23.0, scene: "C", keys: [k([-1.0, 2.0, 7.0], [-0.6, 1.2, 0], 40), k([6.0, 2.4, 7.2], [6.2, 1.6, 0], 40), k([12.0, 2.4, 7.2], [12.2, 1.6, 0], 40), k([18.6, 2.2, 7.4], [18.2, 1.5, 0], 40)] },
  // D — mine: headframe at surface, dive down the shaft into the tunnel sauna
  { from: 23.0, to: 28.7, scene: "D", keys: [k([0, 4.4, 7.5], [0, 1.8, 0], 40), k([0, 2.0, 2.4], [0, -2.0, 0], 44), k([0.2, -8.0, 0.4], [0, -12.5, -0.4], 46), k([0.5, -12.75, 3.6], [0, -13.0, -2.6], 48)] },
  // E — interior: wide, kiuas macro, steam pull-back, quiet bench
  { from: 28.7, to: 34.6, scene: "E", keys: [k([2.6, 1.5, 4.0], [0, 1.1, -0.6], 40), k([1.6, 1.4, 3.0], [-0.2, 1.1, -0.8], 38)] },
  { from: 34.6, to: 39.2, scene: "E", keys: [k([-0.6, 1.25, 0.9], [-1.5, 0.75, -0.5], 40), k([-0.9, 1.55, 1.3], [-1.6, 1.05, -0.6], 40)] },
  { from: 39.2, to: 42.6, scene: "E", keys: [k([0.2, 0.6, 2.4], [-0.3, 1.6, -0.6], 44), k([0.6, 0.8, 3.6], [-0.2, 1.5, -0.6], 44)] },
  { from: 42.6, to: 47.4, scene: "E", keys: [k([-2.4, 1.7, 2.6], [0.4, 1.3, -0.9], 36), k([2.2, 1.8, 2.8], [0.6, 1.3, -0.9], 36)] },
  // F — smoke sauna: dusk orbit, then dark interior with the hourglass
  { from: 47.4, to: 52.1, scene: "F", keys: [k([4.4, 2.0, 5.2], [0, 0.9, 0], 40), k([0, 2.3, 6.6], [0, 1.0, 0], 40), k([-4.2, 2.0, 5.0], [0, 0.9, 0], 40)] },
  { from: 52.1, to: 58.6, scene: "F", keys: [k([0.5, 1.45, -7.0], [0, 0.8, -10.8], 46), k([0.2, 1.25, -7.9], [0, 0.8, -10.7], 42)] },
  // G — Berlin 1936 athletes' village
  { from: 58.6, to: 65.1, scene: "G", keys: [k([-1.5, 7.0, 9.0], [0, 0.6, 0], 42), k([1.0, 3.0, 6.8], [0, 1.0, 0], 40)] },
  { from: 65.1, to: 68.5, scene: "G", keys: [k([1.8, 1.6, 5.6], [1.0, 1.1, 1.6], 40), k([1.3, 1.45, 4.9], [1.0, 1.15, 1.6], 38)] },
  // H — golden-hour payoff and pull-out
  { from: 68.5, to: 76.3, scene: "H", keys: [k([3.2, 0.9, 4.8], [0, 1.2, 0], 40), k([0, 0.8, 5.6], [0, 1.25, 0], 40), k([-3.0, 1.0, 4.9], [0, 1.2, 0], 40)] },
  { from: 76.3, to: 82.0, scene: "H", keys: [k([-2.0, 1.5, 6.2], [0, 1.1, 0], 40), k([-1.0, 3.6, 11.0], [0, 1.0, -1], 42)] },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/** Camera at film time t: Catmull-Rom through the shot keys, gentle ease at the shot ends only. */
export const cameraAt = (t: number): CamKey => {
  const s = shotAt(t);
  const raw = Math.min(1, Math.max(0, (t - s.from) / (s.to - s.from)));
  // 75 % linear + 25 % smoothstep: never parks at a cut
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

// HUD cards (layout px, 1080 × 1920). `at` = VO word time the number lands on.
export type Card = { from: number; to: number; title: string; sub?: string; count?: { to: number; decimals: number; suffix: string; prefix?: string }; y: number; tone?: "cream" | "blue" | "rust" };
export const CARDS: Card[] = [
  { from: 1.6, to: 3.45, title: "SAUNA", count: { to: 3.2, decimals: 1, suffix: " JUTA" }, y: 250 },
  { from: 4.3, to: 6.55, title: "PENDUDUK", count: { to: 5.7, decimals: 1, suffix: " JUTA" }, y: 250, tone: "blue" },
  { from: 8.3, to: 10.35, title: "1 SAUNA : 2 ORANG", sub: "kira-kira", y: 250 },
  { from: 14.9, to: 16.05, title: "±7.000 TAHUN", sub: "umur kata “sauna”", y: 250, tone: "rust" },
  { from: 18.8, to: 19.85, title: "DANAU", y: 250 },
  { from: 19.85, to: 21.0, title: "APARTEMEN", y: 250 },
  { from: 21.0, to: 22.25, title: "KANTOR", y: 250 },
  { from: 22.25, to: 22.98, title: "GEDUNG PARLEMEN", y: 250, tone: "blue" },
  { from: 25.4, to: 28.65, title: "KEDALAMAN", count: { to: 1400, decimals: 0, suffix: " M", prefix: "−" }, sub: "tambang Pyhäsalmi", y: 250, tone: "rust" },
  { from: 30.8, to: 33.5, title: "80–90 °C", sub: "suhu biasa", y: 250 },
  { from: 33.5, to: 34.55, title: "110 °C", sub: "bisa mencapai", y: 250, tone: "rust" },
  { from: 38.3, to: 39.15, title: "LÖYLY", sub: "uap dari batu panas", y: 250, tone: "blue" },
  { from: 39.2, to: 42.55, title: "LÖYLY = ROH · NAPAS", sub: "arti asal kata", y: 250, tone: "blue" },
  { from: 43.3, to: 47.35, title: "DUDUK TENANG", sub: "tidak bicara keras", y: 250 },
  { from: 48.5, to: 52.05, title: "SAVUSAUNA", sub: "sauna asap · tanpa cerobong", y: 250, tone: "rust" },
  { from: 53.4, to: 57.2, title: "DIPANASKAN 6–8 JAM", y: 250, tone: "rust" },
  { from: 57.2, to: 58.55, title: "HANGAT 12 JAM", y: 250 },
  { from: 59.6, to: 65.05, title: "BERLIN 1936", sub: "desa atlet · tim Finlandia", y: 250, tone: "blue" },
  { from: 66.6, to: 68.45, title: "“die Sauna”", sub: "populer di Jerman", y: 250 },
  { from: 69.9, to: 78.9, title: "17 DES 2020", sub: "UNESCO · Warisan Budaya Takbenda", y: 250, tone: "rust" },
];
