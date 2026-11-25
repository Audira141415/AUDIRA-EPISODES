// EP68 Bank Keju Credem — film clock = VO clock (offset 0). VO 73.51 s, outro card 73.5–75.5 s.
export const FILM_SECONDS = 75.5;
export const OUTRO_SECONDS = 2;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };

const k = (pos: V3, target: V3, fov = 38): CamKey => ({ pos, target, fov });

// One entry per SHOTLIST row; keys are spread evenly across the shot (Catmull-Rom).
export const SHOTS: Shot[] = [
  // A — vault door swings open, push through into the golden cheese vault
  { from: 0, to: 5.2, scene: "A", keys: [k([0.9, 1.5, 7.2], [0, 1.35, -1], 40), k([0.4, 1.45, 5.4], [0, 1.35, -1.5], 38)] },
  { from: 5.2, to: 11.0, scene: "A", keys: [k([-0.2, 1.45, 4.3], [0, 1.3, -2], 38), k([-0.15, 1.4, 1.2], [0, 1.25, -4], 40), k([0.5, 1.55, -1.6], [-0.2, 1.1, -5.5], 42)] },
  // B — Italian town square, crane down from the roofs to the bank steps
  { from: 11.0, to: 16.5, scene: "B", keys: [k([-1.0, 6.4, 9.0], [0, 2.6, -1], 42), k([0.6, 4.2, 8.2], [0, 1.8, -1], 40)] },
  { from: 16.5, to: 22.0, scene: "B", keys: [k([1.6, 1.8, 6.4], [0, 1.0, -0.5], 40), k([0.4, 1.0, 4.6], [0, 0.7, 0], 38)] },
  // C — dairy at dawn: cow + churn → copper vat + curd; then truck right to the maturing rack
  { from: 22.0, to: 27.4, scene: "C", keys: [k([-3.2, 1.6, 5.2], [-1.6, 0.9, 0], 40), k([0.9, 1.25, 3.1], [1.25, 0.6, 0.6], 36), k([0.9, 1.3, 3.2], [0.4, 0.75, 0], 38)] },
  { from: 27.4, to: 33.4, scene: "C", keys: [k([5.2, 1.5, 4.0], [6.6, 1.2, 0], 40), k([7.4, 1.4, 3.6], [8.0, 1.25, 0], 40), k([9.4, 1.6, 3.8], [8.6, 1.2, 0], 40)] },
  // D — bank credit desk: dolly to the desk, close on the serial stamp, whip to prosciutto + oil
  { from: 33.4, to: 38.6, scene: "D", keys: [k([-2.6, 1.9, 5.6], [0, 1.0, 0], 40), k([-0.8, 1.7, 4.2], [0, 1.0, 0], 38)] },
  { from: 38.6, to: 42.6, scene: "D", keys: [k([1.6, 1.6, 3.4], [0.6, 1.05, 0], 38), k([2.4, 1.5, 2.8], [0.9, 1.05, 0], 38)] },
  { from: 42.6, to: 44.2, scene: "D", keys: [k([-0.4, 1.25, 1.9], [-0.55, 1.0, 0.2], 34), k([-0.25, 1.2, 1.6], [-0.5, 1.0, 0.2], 32)] },
  { from: 44.2, to: 49.9, scene: "D", keys: [k([2.0, 1.45, 2.6], [1.7, 1.0, 0.1], 38), k([2.6, 1.6, 3.0], [1.9, 1.0, 0.1], 38), k([3.2, 1.8, 3.6], [1.9, 1.05, 0.1], 40)] },
  // E — 2009 night: tunnel under the warehouse, wheels rolling out, then up to the police lights
  { from: 49.9, to: 54.6, scene: "E", keys: [k([-3.0, 1.0, 3.2], [-1.0, -0.4, 0], 40), k([-1.0, -0.2, 2.8], [0.2, -0.6, 0], 40)] },
  { from: 54.6, to: 58.8, scene: "E", keys: [k([0.9, -0.45, 3.3], [2.0, -0.78, -0.3], 38), k([2.6, 0.45, 3.9], [3.3, -0.35, 0], 40), k([4.4, 1.9, 4.6], [4.6, 0.8, 0], 42)] },
  // F — cheese cathedral: crane up the nave, macro hammer, macro fire brand, majestic pull-back
  { from: 58.8, to: 63.4, scene: "F", keys: [k([0, 0.9, 4.2], [0, 1.6, -3], 44), k([0, 2.8, 3.2], [0, 4.6, -6], 46)] },
  { from: 63.4, to: 66.3, scene: "F", keys: [k([0.9, 1.2, 1.4], [0.05, 0.95, 0], 36), k([0.6, 1.1, 1.1], [0.05, 0.92, 0], 34)] },
  { from: 66.3, to: 68.2, scene: "F", keys: [k([-0.5, 1.0, 1.0], [0.05, 0.88, 0.1], 34), k([-0.35, 0.98, 0.85], [0.05, 0.88, 0.1], 32)] },
  { from: 68.2, to: 75.5, scene: "F", keys: [k([0.2, 1.3, 2.2], [0, 1.1, 0], 40), k([0, 1.9, 4.6], [0, 1.8, -2], 42), k([0, 2.6, 6.6], [0, 2.4, -4], 44)] },
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

// HUD cards (layout px, 1080 × 1920). `from` = VO word time the card lands on.
export type Card = { from: number; to: number; title: string; sub?: string; count?: { to: number; decimals: number; suffix: string; prefix?: string; year?: boolean }; y: number; tone?: "gold" | "red" | "blue" | "green"; stamp?: boolean };
export const CARDS: Card[] = [
  { from: 3.7, to: 4.85, title: "BRANKAS KEJU", sub: "Italia", y: 260 },
  { from: 4.9, to: 6.45, title: "BUKAN EMAS", y: 260, tone: "red", stamp: true },
  { from: 6.5, to: 8.5, title: "BUKAN UANG TUNAI", y: 260, tone: "red", stamp: true },
  { from: 8.7, to: 10.95, title: "NILAI KEJU", count: { to: 325, decimals: 0, suffix: " JUTA", prefix: "€" }, sub: "kira-kira", y: 260 },
  { from: 12.2, to: 16.4, title: "CREDEM", sub: "Reggio Emilia · utara Italia", y: 260, tone: "green" },
  { from: 16.55, to: 18.7, title: "SEJAK", count: { to: 1953, decimals: 0, suffix: "", year: true }, y: 260 },
  { from: 18.8, to: 21.95, title: "RODA KEJU = JAMINAN", sub: "Parmigiano Reggiano", y: 260 },
  { from: 23.7, to: 25.6, title: "SATU RODA", count: { to: 40, decimals: 0, suffix: " KG", prefix: "±" }, sub: "hampir", y: 260 },
  { from: 25.7, to: 27.4, title: "SUSU", count: { to: 550, decimals: 0, suffix: " L", prefix: "±" }, sub: "untuk satu roda", y: 260, tone: "blue" },
  { from: 29.2, to: 30.4, title: "MIN. 12 BULAN", sub: "dimatangkan", y: 260 },
  { from: 30.45, to: 32.3, title: "SERING 24+ BULAN", y: 260 },
  { from: 32.35, to: 33.4, title: "UANG TERTAHAN", sub: "di rak", y: 260, tone: "red" },
  { from: 35.8, to: 38.6, title: "DITITIPKAN", sub: "di gudang bank", y: 260, tone: "green" },
  { from: 38.7, to: 40.9, title: "PINJAMAN", count: { to: 80, decimals: 0, suffix: "%" }, sub: "dari nilai keju", y: 260, tone: "green" },
  { from: 40.95, to: 42.6, title: "TENOR", count: { to: 24, decimals: 0, suffix: " BULAN" }, sub: "maksimal", y: 260 },
  { from: 43.05, to: 44.3, title: "NO. SERI", sub: "tiap roda", y: 260 },
  { from: 44.4, to: 46.95, title: "PROSCIUTTO · MINYAK ZAITUN", sub: "pernah dipertimbangkan", y: 260 },
  { from: 47.0, to: 48.6, title: "DITOLAK", y: 260, tone: "red", stamp: true },
  { from: 48.6, to: 49.9, title: "MUDAH DICURI / DITUKAR", y: 260, tone: "red" },
  { from: 51.8, to: 53.3, title: "TAHUN", count: { to: 2009, decimals: 0, suffix: "", year: true }, y: 260, tone: "blue" },
  { from: 53.35, to: 55.0, title: "MENGGALI TEROWONGAN", y: 260, tone: "blue" },
  { from: 55.1, to: 57.6, title: "DIBAWA KABUR", count: { to: 570, decimals: 0, suffix: " RODA" }, y: 260, tone: "red" },
  { from: 57.65, to: 58.8, title: "TERTANGKAP", y: 260, tone: "blue", stamp: true },
  { from: 59.7, to: 62.0, title: "DI RAK SEKARANG", count: { to: 500000, decimals: 0, suffix: " RODA", prefix: "±" }, y: 260 },
  { from: 62.05, to: 63.5, title: "SEPERTI KATEDRAL", y: 260 },
  { from: 63.7, to: 65.35, title: "BULAN KE-12", sub: "uji kualitas", y: 260 },
  { from: 65.4, to: 66.7, title: "DIKETUK PALU", sub: "palu penguji", y: 260 },
  { from: 66.7, to: 68.0, title: "DICAP BAKAR", y: 260, tone: "red" },
  { from: 69.85, to: 73.4, title: "KERUGIAN BANK", count: { to: 0, decimals: 0, suffix: "", prefix: "€" }, sub: "tidak pernah rugi satu euro pun", y: 260, tone: "green" },
];
