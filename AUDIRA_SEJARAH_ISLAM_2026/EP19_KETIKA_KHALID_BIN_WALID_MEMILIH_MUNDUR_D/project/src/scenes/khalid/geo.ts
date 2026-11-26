// Map geometry for the EP19 war table (pure TS, no three): lon/lat -> table units, coastlines,
// seeded relief. North = -z. Coordinates are general geography; the Jordan/Dead Sea line is drawn
// 0.25 deg west and the Mu'tah station 0.2 deg east so the station does not sit on the water (schematic).
export const LON0 = 37.3;
export const LAT0 = 29.0;
export const KX = 1.35;
export const KZ = 1.3;
export const SHEET_W = 8.4;
export const SHEET_H = 14.8;

export const geo = (lon: number, lat: number): [number, number] => [(lon - LON0) * KX, (LAT0 - lat) * KZ];

export const MUTAH = geo(35.89, 31.09);
export const MADINAH = geo(39.61, 24.47);
export const SYRIA = geo(36.29, 33.51);
/** Off-sheet trays on the east side of the table. */
export const BOOK: [number, number] = [6.6, -3.4];
export const SAND: [number, number] = [6.6, 1.6];

/** Caravan route Madinah -> Khaybar -> Tayma -> Tabuk -> Ma'an -> Mu'tah (lon, lat). */
export const ROUTE_LL: [number, number][] = [
  [39.61, 24.47], [39.3, 25.7], [38.55, 27.6], [36.57, 28.38], [35.73, 30.19], [35.89, 31.09],
];

// Sea polygons (lon, lat), closed against the sheet edge.
export const RED_SEA: [number, number][] = [
  [34.95, 29.52], [34.72, 28.6], [35.05, 28.0], [35.6, 27.45], [36.3, 26.4], [36.9, 25.6], [37.4, 24.95],
  [37.95, 24.2], [38.4, 23.6], [38.6, 23.0], [33.5, 23.0], [33.5, 27.7], [34.25, 27.75], [34.6, 28.6],
];
export const MED_SEA: [number, number][] = [
  [33.5, 31.2], [34.25, 31.3], [34.55, 31.65], [34.9, 32.45], [35.08, 33.1], [35.45, 33.85], [35.8, 34.6],
  [35.9, 35.2], [33.5, 35.2],
];
export const DEAD_SEA = { lon: 35.25, lat: 31.5, rx: 0.09, ry: 0.36 };
export const JORDAN_LL: [number, number][] = [[35.33, 32.75], [35.3, 32.4], [35.32, 32.1], [35.27, 31.85]];
export const GALILEE = { lon: 35.33, lat: 32.82, rx: 0.07, ry: 0.11 };

export const pip = (pt: [number, number], poly: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
export const toLL = (x: number, z: number): [number, number] => [x / KX + LON0, LAT0 - z / KZ];
export const isSea = (x: number, z: number) => {
  const ll = toLL(x, z);
  if (pip(ll, RED_SEA) || pip(ll, MED_SEA)) return true;
  const d = ((ll[0] - DEAD_SEA.lon) / DEAD_SEA.rx) ** 2 + ((ll[1] - DEAD_SEA.lat) / DEAD_SEA.ry) ** 2;
  const g = ((ll[0] - GALILEE.lon) / GALILEE.rx) ** 2 + ((ll[1] - GALILEE.lat) / GALILEE.ry) ** 2;
  return d < 1 || g < 1;
};

// ---- seeded relief -------------------------------------------------------------------------
const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
type Peak = { x: number; z: number; r: number; a: number };
const RANGES: { pts: [number, number][]; amp: number; w: number }[] = [
  { pts: [[35.05, 29.0], [35.6, 27.8], [36.5, 26.6], [37.4, 25.5], [38.3, 24.55], [39.0, 23.6]], amp: 0.34, w: 0.5 },
  { pts: [[35.55, 29.7], [35.62, 30.5], [35.72, 31.2], [35.78, 31.9], [35.9, 32.6]], amp: 0.27, w: 0.3 },
  { pts: [[34.55, 30.4], [34.95, 29.75]], amp: 0.16, w: 0.3 },
  { pts: [[35.6, 33.3], [35.95, 34.3]], amp: 0.3, w: 0.25 },
  { pts: [[36.05, 33.25], [36.5, 34.2]], amp: 0.28, w: 0.25 },
  { pts: [[39.6, 23.4], [39.9, 24.0], [40.2, 25.2]], amp: 0.14, w: 0.5 },
];
let PEAKS: Peak[] | null = null;
const peaks = (): Peak[] => {
  if (PEAKS) return PEAKS;
  const rnd = prng(19629);
  const out: Peak[] = [];
  for (const rg of RANGES) {
    for (let i = 0; i < rg.pts.length - 1; i++) {
      const [ax, az] = geo(...rg.pts[i]);
      const [bx, bz] = geo(...rg.pts[i + 1]);
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.ceil(len / 0.13);
      for (let k = 0; k < n; k++) {
        const u = (k + rnd()) / n;
        const nx = -(bz - az) / len, nz = (bx - ax) / len;
        const off = (rnd() - 0.5) * rg.w * KX;
        out.push({ x: ax + (bx - ax) * u + nx * off, z: az + (bz - az) * u + nz * off, r: 0.16 + rnd() * 0.3, a: rg.amp * (0.45 + rnd() * 0.7) });
      }
    }
  }
  // scattered lava-field hills (harrat) east of the Hejaz
  for (let i = 0; i < 70; i++) {
    const [x, z] = geo(37.4 + rnd() * 2.8, 24.6 + rnd() * 3.8);
    out.push({ x, z, r: 0.08 + rnd() * 0.16, a: 0.04 + rnd() * 0.08 });
  }
  return (PEAKS = out);
};
// value noise (seeded lattice, not periodic sines)
const LAT_N = 64;
let LATTICE: Float32Array | null = null;
const lattice = () => {
  if (LATTICE) return LATTICE;
  const r = prng(4261);
  LATTICE = new Float32Array(LAT_N * LAT_N).map(() => r());
  return LATTICE;
};
const vnoise = (x: number, y: number) => {
  const L = lattice();
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const g = (i: number, j: number) => L[(((j % LAT_N) + LAT_N) % LAT_N) * LAT_N + (((i % LAT_N) + LAT_N) % LAT_N)];
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  return (g(xi, yi) * (1 - sx) + g(xi + 1, yi) * sx) * (1 - sy) + (g(xi, yi + 1) * (1 - sx) + g(xi + 1, yi + 1) * sx) * sy;
};
const FLAT = [
  { p: MUTAH, r: 0.75, h: 0.11 },
  { p: MADINAH, r: 1.25, h: 0.03 },
  { p: SYRIA, r: 1.15, h: 0.07 },
];
const RELIEF = 0.3;
/** Relief height at table point (x, z). */
export const heightAt = (x: number, z: number): number => {
  if (Math.abs(x) > SHEET_W / 2 || Math.abs(z) > SHEET_H / 2) return 0;
  if (isSea(x, z)) return -0.012;
  let h = 0.015;
  for (const p of peaks()) {
    const d2 = (x - p.x) ** 2 + (z - p.z) ** 2;
    if (d2 < 9 * p.r * p.r) h += p.a * Math.exp(-d2 / (p.r * p.r));
  }
  h += (vnoise(x * 2.2 + 11, z * 2.2 + 3) - 0.5) * 0.05 + (vnoise(x * 6 + 5, z * 6 + 9) - 0.5) * 0.018;
  h = 0.015 + (h - 0.015) * RELIEF; // s7: relief was too tall, route unreadable
  for (const f of FLAT) {
    const d = Math.hypot(x - f.p[0], z - f.p[1]);
    const k = Math.min(1, Math.max(0, (d - f.r * 0.55) / (f.r * 0.45)));
    const s = k * k * (3 - 2 * k);
    h = f.h + (h - f.h) * s;
  }
  // fade to the sheet margin
  const m = Math.min(SHEET_W / 2 - Math.abs(x), SHEET_H / 2 - Math.abs(z));
  return Math.max(0, h) * Math.min(1, Math.max(0, m / 0.35));
};
