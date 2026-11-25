// EP70 Danau Nyos — film clock = VO clock (offset 0). VO 90.51 s, outro card 90.8–93.8 s (docs/STORYBOARD.md).
export const FILM_SECONDS = 93.8;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };

const k = (pos: V3, target: V3, fov = 38): CamKey => ({ pos, target, fov });

// World: Nyos jar at the origin (base y 0, rim 2.4, neck 2.75–3.0, cork above), valley runs down toward +x/+z,
// Monoun jar at (-3.4, 0, -1.4). Frame width in 9:16 at fov 38 ≈ 0.39 × camera distance.
export const SHOTS: Shot[] = [
  // A s1 hook — high angle over the calm surface, slow push-in
  { from: 0, to: 8.27, scene: "A", keys: [k([1.6, 9.6, 6.4], [0.5, 0.6, 0.9], 40), k([0.9, 7.4, 4.4], [0.1, 1.4, 0.3], 38), k([0.3, 5.6, 2.6], [0, 1.9, 0], 36)] },
  // B s2 — crane down through the surface to the side cross-section
  { from: 8.27, to: 19.58, scene: "B", keys: [k([0.3, 5.4, 3.4], [0, 1.8, 0], 38), k([0.2, 3.0, 6.2], [0, 1.4, 0], 38), k([-0.4, 1.7, 6.6], [0, 1.25, 0], 38)] },
  // C s3 — close on the saturated deep layer, dolly up to the neck; small snap at the cork
  { from: 19.58, to: 31.6, scene: "C", keys: [k([0.9, 0.9, 4.4], [0, 0.85, 0], 36), k([0.7, 1.7, 4.8], [0, 1.6, 0], 36), k([0.4, 2.9, 4.2], [0, 2.8, 0], 34)] },
  { from: 31.6, to: 32.96, scene: "C", keys: [k([0.4, 3.0, 3.9], [0, 2.95, 0], 34), k([0.5, 3.2, 3.5], [0, 3.15, 0], 32)] },
  // D s4 — low side, tilt up with the column, then pull back
  { from: 32.96, to: 44.83, scene: "D", keys: [k([2.4, 0.9, 7.0], [0, 2.6, 0], 40), k([1.8, 1.6, 8.6], [0, 4.4, 0], 42), k([3.2, 2.6, 11.0], [0.6, 3.0, 0.4], 42)] },
  // E s5 — gas pours over the lip, low truck down the valley with the leading edge
  { from: 44.83, to: 50.0, scene: "E", keys: [k([3.0, 3.4, 5.4], [0.4, 2.2, 0.6], 38), k([3.4, 1.6, 5.6], [1.2, 0.2, 1.4], 38)] },
  { from: 50.0, to: 58.2, scene: "E", keys: [k([3.6, 0.9, 5.4], [1.8, -0.3, 2.0], 38), k([5.4, 0.3, 7.0], [3.0, -0.75, 3.2], 38), k([7.0, 0.1, 8.0], [4.0, -0.95, 4.0], 38)] },
  // F s6 — aerial along the four villages, then crane back up to the jar at "Paginya"
  { from: 58.2, to: 67.46, scene: "F", keys: [k([0.6, 1.4, 4.6], [2.2, -0.4, 1.97], 40), k([2.2, 1.3, 6.6], [3.75, -0.7, 3.53], 40), k([4.0, 1.1, 8.0], [4.95, -0.95, 4.73], 40)] },
  { from: 67.46, to: 72.01, scene: "F", keys: [k([3.4, 2.4, 7.4], [0.4, 1.4, 0.4], 40), k([1.4, 1.9, 6.6], [0, 1.4, 0], 38)] },
  // G s7 — Monoun on the left, then orbit the hero jar up to the fountain
  { from: 72.01, to: 78.0, scene: "G", keys: [k([-1.6, 1.3, 2.6], [-3.4, 0.7, -1.4], 36), k([-2.6, 1.1, 2.4], [-3.4, 0.6, -1.4], 36)] },
  { from: 78.0, to: 85.57, scene: "G", keys: [k([3.4, 2.0, 6.4], [0, 1.9, 0], 38), k([0.4, 2.3, 7.4], [0, 2.3, 0], 38), k([-2.8, 3.0, 6.6], [0, 3.0, 0], 38)] },
  // H s8 — slow wide pull-back over jar and valley, into the outro
  { from: 85.57, to: 93.8, scene: "H", keys: [k([-1.4, 2.6, 7.6], [0.4, 1.6, 0.6], 40), k([0.6, 4.6, 12.0], [1.4, 0.6, 1.8], 42)] },
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

// ---------- story clock (all in VO seconds) ----------
export const T = {
  corkPop: 31.89, // "terbuka"
  eruptStart: 34.84, // "Air"
  eruptPeak: 37.4,
  eruptEnd: 44.0,
  gasPour: 44.4, // gas spills over the lip
  valleyFlow: 49.6, // "mengalir"
  villagesDark: [61.5, 62.4, 63.4, 64.3] as const, // Nyos, Kam, Cha, Subum — fog arrives
  rust: 67.46, // "Paginya"
  pipe: 78.13, // "Sejak"
  fountain: 83.5, // "mendorong"
};

// HUD callouts (layout px 1080 × 1920). Max 2 on screen per beat.
export type CardKind = "big" | "card" | "chip";
export type Card = { from: number; to: number; kind: CardKind; title: string; sub?: string; count?: { to: number; suffix: string } };
export const CARDS: Card[] = [
  { from: 1.36, to: 7.9, kind: "big", title: "DALAM 1 MALAM", count: { to: 1746, suffix: " JIWA" }, sub: "tanpa setetes air pun" },
  { from: 8.4, to: 12.6, kind: "chip", title: "DANAU NYOS · KAMERUN" },
  { from: 15.3, to: 19.4, kind: "card", title: "CO₂ DARI MAGMA", sub: "terkunci di lapisan dasar" },
  { from: 22.3, to: 26.6, kind: "chip", title: "SEPERTI SODA TERTUTUP" },
  { from: 28.5, to: 32.8, kind: "big", title: "21 AGT 1986" },
  { from: 33.0, to: 35.9, kind: "chip", title: "PEMICU: ?" },
  { from: 36.4, to: 37.7, kind: "big", title: "SEMBURAN AIR", count: { to: 100, suffix: " M" } },
  { from: 37.85, to: 40.4, kind: "big", title: "GELOMBANG", count: { to: 25, suffix: " M" } }, // VO "gelombang dua puluh lima meter" 37.85–39.07; count settles by 38.45
  { from: 40.6, to: 44.7, kind: "big", title: "CO₂ LEPAS", count: { to: 300000, suffix: " TON" } },
  { from: 49.6, to: 53.4, kind: "chip", title: "CO₂ · TAK TERLIHAT" },
  { from: 53.6, to: 55.6, kind: "card", title: "TEBAL 50 M" },
  { from: 55.7, to: 58.1, kind: "card", title: "≤ 50 KM/JAM" },
  { from: 65.3, to: 67.3, kind: "chip", title: "RIBUAN TERNAK IKUT MATI" },
  { from: 68.6, to: 71.9, kind: "card", title: "AIR MERAH KARAT", sub: "besi dari dasar danau" },
  { from: 73.6, to: 77.9, kind: "card", title: "MONOUN · 1984", sub: "37 orang tewas" },
  { from: 78.4, to: 84.8, kind: "big", title: "2001 · PIPA PERTAMA", sub: "gas dibuang pelan-pelan" },
];

// 3D village labels (s6)
export const VILLAGES = [
  { name: "DESA NYOS", along: 2.4, side: 0.55, dark: T.villagesDark[0] },
  { name: "DESA KAM", along: 3.6, side: -0.6, dark: T.villagesDark[1] },
  { name: "DESA CHA", along: 4.8, side: 0.6, dark: T.villagesDark[2] },
  { name: "DESA SUBUM", along: 6.1, side: -0.5, dark: T.villagesDark[3] },
] as const;
