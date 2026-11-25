// EP71 Baarle — Pintu Depan Menentukan Negaramu. SATELLITEBRIEFING, Remotion + R3F.
// Film clock = VO clock (offset 0). VO 90.0 s (last word ends 89.97 s), outro card 90–93 s.
export const FILM_SECONDS = 93;
export const OUTRO_SECONDS = 3;

export type V3 = [number, number, number];
export type CamKey = { pos: V3; target: V3; fov: number };
export type SceneId = "S1" | "S2" | "S3" | "S4" | "S5A" | "S5B" | "S6";
export type Shot = { from: number; to: number; scene: SceneId; keys: CamKey[] };

const k = (pos: V3, target: V3, fov = 40): CamKey => ({ pos, target, fov });

// Scene cuts follow the VO: "Namanya" 7.12, "Asalnya" 23.08, "Rumah" 45.42, "Dulu" 62.65, "Lalu" 71.05, "Satu kota" 84.72.
export const SHOTS: Shot[] = [
  // S1 hook — orbit descent onto one house, push in to the glowing door
  { from: 0, to: 2.2, scene: "S1", keys: [k([0.2, 12.5, 5.0], [0.2, 0, 0.2], 44), k([0.7, 6.4, 6.0], [0.3, 0.3, 0.9], 42)] },
  { from: 2.2, to: 6.9, scene: "S1", keys: [k([0.7, 6.4, 6.0], [0.3, 0.3, 0.9], 42), k([1.0, 3.2, 4.9], [0.3, 0.55, 1.4], 40), k([0.8, 2.1, 4.1], [0.3, 0.6, 1.5], 38)] },
  // S2 context — pull out to the patchwork map, slow truck left → right
  { from: 6.9, to: 10.7, scene: "S2", keys: [k([0.8, 2.6, 4.6], [0.3, 0.5, 1.2], 40), k([-0.6, 7.5, 8.2], [0, 0, -0.6], 44), k([-1.4, 9.6, 8.6], [0, 0, -1.0], 44)] },
  { from: 10.7, to: 22.9, scene: "S2", keys: [k([-1.4, 9.6, 8.6], [0, 0, -1.0], 44), k([0, 10.0, 8.4], [0, 0, -1.0], 44), k([1.3, 9.6, 8.4], [0.2, 0, -0.9], 44)] },
  // S3 development — fields of 1198, treaty card 1843, the neutral meadow of 1995
  { from: 22.9, to: 26.0, scene: "S3", keys: [k([0, 11.0, 7.5], [0, 0, -1.2], 44), k([-1.1, 5.6, 6.4], [0, 0.2, -0.6], 42)] },
  { from: 26.0, to: 36.2, scene: "S3", keys: [k([-1.1, 5.6, 6.4], [0, 0.2, -0.6], 42), k([0.2, 5.4, 6.2], [0, 0.2, -0.6], 42), k([1.2, 5.2, 6.0], [0.1, 0.2, -0.5], 42)] },
  { from: 36.2, to: 40.0, scene: "S3", keys: [k([1.2, 5.2, 6.0], [0.1, 0.2, -0.5], 42), k([0.5, 3.4, 4.6], [0, 0.45, 0.9], 40), k([0.2, 2.7, 4.0], [0, 0.5, 0.9], 38)] },
  { from: 40.0, to: 45.2, scene: "S3", keys: [k([0.2, 2.7, 4.0], [0, 0.5, 0.9], 38), k([2.6, 4.2, 1.6], [1.7, 0, -2.3], 40), k([2.3, 2.9, 0.7], [1.7, 0.1, -2.4], 38)] },
  // S4 explanation — Jalan Loveren, the border runs through one front door
  { from: 45.2, to: 48.0, scene: "S4", keys: [k([-3.4, 5.4, 8.0], [0, 0.8, 0], 42), k([-1.8, 3.4, 6.6], [0, 0.9, 0], 40)] },
  { from: 48.0, to: 54.3, scene: "S4", keys: [k([-1.8, 3.4, 6.6], [0, 0.9, 0], 40), k([0, 3.0, 6.4], [0, 0.9, 0], 40), k([1.6, 2.8, 6.1], [0, 0.9, 0], 40)] },
  { from: 54.3, to: 62.4, scene: "S4", keys: [k([1.6, 2.8, 6.1], [0, 0.9, 0], 40), k([0.6, 1.9, 4.9], [0, 0.75, 0.6], 38), k([-0.4, 1.85, 4.9], [0, 0.75, 0.6], 38)] },
  // S5A payoff 1 — the café table that crosses the border
  { from: 62.4, to: 70.9, scene: "S5A", keys: [k([2.8, 3.0, 5.0], [0.5, 0.45, 0], 40), k([1.0, 2.6, 4.6], [0.2, 0.45, 0.1], 40), k([-1.2, 2.5, 4.4], [-0.2, 0.45, 0.2], 40)] },
  // S5B payoff 2 — the shop split in half, the shop that turned its door
  { from: 70.9, to: 76.0, scene: "S5B", keys: [k([0.9, 6.4, 6.6], [0.9, 0, -0.2], 42), k([0.4, 4.8, 5.6], [0.4, 0.4, 0], 40)] },
  { from: 76.0, to: 81.8, scene: "S5B", keys: [k([0.4, 4.8, 5.6], [0.4, 0.4, 0], 40), k([-2.0, 3.6, 3.8], [-0.6, 0.6, -0.1], 40), k([-2.6, 3.4, 2.8], [-0.6, 0.6, -0.2], 40)] },
  { from: 81.8, to: 84.5, scene: "S5B", keys: [k([-2.6, 3.4, 2.8], [-0.6, 0.6, -0.2], 40), k([1.4, 3.8, 5.2], [2.4, 0.6, 0], 40), k([2.6, 3.5, 4.8], [2.6, 0.6, 0], 40)] },
  // S6 outro — the whole patchwork lights up, ascent back to orbit
  { from: 84.5, to: FILM_SECONDS, scene: "S6", keys: [k([0.6, 3.4, 5.6], [0.3, 0.4, 0.8], 40), k([0.2, 7.6, 8.2], [0, 0, -0.6], 44), k([0, 12.0, 8.0], [0, 0, -1.2], 46)] },
];

export const shotAt = (t: number) => SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];

const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/** Camera at film time t: Catmull-Rom through the shot keys + a slow yaw sway (amplitude ≤ 1.2 deg-equivalent). */
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
  const sway = Math.sin(t * 0.45) * 0.12;
  return { ...out, pos: [out.pos[0] + sway, out.pos[1], out.pos[2]] };
};

// HUD cards (layout px 1080 × 1920). Each lands on the VO word that says it.
export type Tone = "amber" | "blue" | "red" | "white";
export type Card = { from: number; to: number; title?: string; sub?: string; tag?: string; big?: string; count?: number; tone?: Tone };
export const CARDS: Card[] = [
  // S1
  { from: 1.15, to: 4.5, tag: "TARGET TERKUNCI", title: "PINTU DEPAN", sub: "= NEGARAMU", tone: "amber" },
  // S2
  { from: 7.55, to: 10.6, tag: "LOKASI", title: "BAARLE", sub: "Belgia  ⟷  Belanda", tone: "white" },
  { from: 15.0, to: 17.6, tag: "EKSKLAVE BELGIA", big: "22", count: 22, sub: "kepingan di dalam Belanda", tone: "amber" },
  { from: 19.6, to: 20.95, tag: "KEPINGAN BELANDA", big: "7", count: 7, sub: "di dalam kepingan Belgia", tone: "blue" },
  { from: 21.0, to: 22.85, tag: "DEKAT GINHOVEN", big: "+1", sub: "kepingan Belanda lagi", tone: "blue" },
  // S3
  { from: 23.95, to: 29.9, tag: "ASAL-USUL", big: "1198", sub: "Adipati Brabant → penguasa Breda", tone: "amber" },
  { from: 30.2, to: 32.95, tag: "BIDANG BAYAR SEWA", title: "TETAP MILIK ADIPATI", tone: "amber" },
  { from: 33.0, to: 36.15, tag: "KINI", title: "ADIPATI = BELGIA", sub: "sisanya = Belanda", tone: "white" },
  { from: 36.4, to: 39.8, tag: "TRAKTAT MAASTRICHT", big: "1843", sub: "batas disahkan", tone: "white" },
  { from: 40.3, to: 45.1, tag: "PADANG NETRAL TERAKHIR", big: "1995", sub: "jadi kepingan ke-22", tone: "amber" },
  // S4
  { from: 45.5, to: 47.95, tag: "RUMAH TERBELAH", title: "IKUT NEGARA MANA?", tone: "white" },
  { from: 48.1, to: 53.6, tag: "ATURAN", title: "IKUT PINTU DEPAN", tone: "amber" },
  { from: 54.4, to: 57.35, tag: "JALAN LOVEREN", title: "BATAS TEPAT DI PINTU", tone: "white" },
  { from: 57.45, to: 59.05, tag: "SATU RUMAH", big: "2", sub: "nomor rumah", tone: "white" },
  { from: 59.1, to: 60.65, tag: "BELGIA", big: "No. 2", tone: "amber" },
  { from: 60.85, to: 62.4, tag: "BELANDA", big: "No. 19", tone: "blue" },
  // S5A
  { from: 63.6, to: 66.4, tag: "KAFE DI BELANDA", title: "TUTUP LEBIH AWAL", tone: "blue" },
  { from: 66.5, to: 68.9, tag: "PENGUNJUNG", title: "TIDAK PERLU PULANG", tone: "white" },
  { from: 68.95, to: 70.9, tag: "SOLUSI", title: "PINDAH MEJA → BELGIA", tone: "amber" },
  // S5B
  { from: 71.35, to: 73.6, tag: "PANDEMI", big: "2020", tone: "red" },
  { from: 73.65, to: 75.95, tag: "BELGIA", title: "TOKO NON-ESENSIAL TUTUP", sub: "lebih dulu", tone: "amber" },
  { from: 76.0, to: 78.1, tag: "TOKO PAKAIAN", title: "PINTU DI BELANDA", tone: "blue" },
  { from: 78.15, to: 79.95, tag: "SEPARUH BELAKANG", title: "DI BELGIA", tone: "amber" },
  { from: 80.0, to: 81.8, tag: "STATUS", title: "SEPARUH DITUTUP", tone: "red" },
  { from: 82.3, to: 84.5, tag: "TOKO LAIN", title: "PINTU DIPUTAR → BUKA", tone: "amber" },
  // S6
  { from: 84.7, to: 89.95, tag: "BAARLE", title: "1 KOTA · 2 NEGARA", sub: "1 PINTU", tone: "amber" },
];

// SFX/shotlist cut points (s): used by SHOTLIST.md.
export const CUTS = [6.9, 22.9, 45.2, 62.4, 70.9, 84.5];
