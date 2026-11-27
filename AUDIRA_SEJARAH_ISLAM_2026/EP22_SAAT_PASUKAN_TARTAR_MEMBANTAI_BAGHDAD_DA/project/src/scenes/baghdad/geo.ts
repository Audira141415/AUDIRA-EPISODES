// Map geometry for the EP22 war table (pure TS, no three): lon/lat -> table units, rivers, gulf,
// seeded relief (Zagros). North = -z. General geography; rivers are schematic.
export const LON0 = 45.6;
export const LAT0 = 33.2;
export const KX = 1.1;
export const KZ = 1.3;
export const SHEET_W = 9.6;
export const SHEET_H = 13.2;

export const geo = (lon: number, lat: number): [number, number] => [(lon - LON0) * KX, (LAT0 - lat) * KZ];

export const BAGHDAD = geo(44.36, 33.31);
export const HAMADAN = geo(48.51, 34.8);
/** Off-sheet trays on the east side of the table: letters (s3), carpet (s6), book dock (s7). */
export const LETTER: [number, number] = [7.6, -3.6];
export const CARPET: [number, number] = [7.6, 1.2];
export const DOCK: [number, number] = [7.6, 5.6];

/** Mongol route Hamadan -> Kermanshah -> Hulwan -> Baghdad (lon, lat). */
export const ROUTE_LL: [number, number][] = [
  [48.51, 34.8], [47.8, 34.45], [47.06, 34.31], [46.3, 34.42], [45.86, 34.46], [45.2, 33.95], [44.75, 33.5], [44.5, 33.36],
];
/** Tigris (schematic) north -> south, through Baghdad. */
export const TIGRIS_LL: [number, number][] = [
  [42.6, 37.9], [43.13, 36.34], [43.5, 35.3], [43.68, 34.6], [43.87, 34.2], [44.2, 33.7], [44.36, 33.31], [44.7, 33.0],
  [45.4, 32.75], [45.8, 32.5], [46.6, 32.1], [47.15, 31.84], [47.43, 31.0], [47.8, 30.5], [48.3, 30.0],
];
export const EUPHRATES_LL: [number, number][] = [
  [40.4, 34.6], [41.4, 34.4], [42.4, 34.05], [42.82, 33.64], [43.78, 33.35], [44.1, 33.0], [44.42, 32.48], [45.3, 31.3],
  [46.26, 31.04], [47.0, 30.98], [47.43, 31.0],
];
export const DIYALA_LL: [number, number][] = [[45.86, 34.46], [45.3, 34.0], [44.9, 33.6], [44.5, 33.22]];

export const GULF: [number, number][] = [
  [47.95, 29.4], [48.0, 30.05], [48.5, 30.0], [48.9, 30.3], [49.6, 30.15], [50.3, 29.7], [50.3, 27.8], [48.6, 27.8], [48.3, 28.7],
];

export const pip = (pt: [number, number], poly: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
export const toLL = (x: number, z: number): [number, number] => [x / KX + LON0, LAT0 - z / KZ];
export const isSea = (x: number, z: number) => pip(toLL(x, z), GULF);

// ---- seeded relief -------------------------------------------------------------------------
const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
type Peak = { x: number; z: number; r: number; a: number };
const RANGES: { pts: [number, number][]; amp: number; w: number }[] = [
  // Zagros: NW -> SE wall between Mesopotamia and Persia (the route crosses it at Hulwan)
  { pts: [[44.4, 37.6], [45.3, 36.6], [46.2, 35.6], [46.9, 34.9], [47.6, 33.9], [48.4, 32.9], [49.2, 31.8], [50.2, 30.6]], amp: 0.36, w: 1.1 },
  { pts: [[47.9, 35.6], [48.6, 34.3], [49.6, 33.3]], amp: 0.26, w: 0.6 },
  { pts: [[42.2, 37.4], [43.6, 37.3]], amp: 0.22, w: 0.4 },
  { pts: [[43.3, 35.0], [44.3, 34.7]], amp: 0.08, w: 0.3 },
];
let PEAKS: Peak[] | null = null;
const peaks = (): Peak[] => {
  if (PEAKS) return PEAKS;
  const rnd = prng(12580);
  const out: Peak[] = [];
  for (const rg of RANGES) {
    for (let i = 0; i < rg.pts.length - 1; i++) {
      const [ax, az] = geo(...rg.pts[i]);
      const [bx, bz] = geo(...rg.pts[i + 1]);
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.ceil(len / 0.12);
      for (let k = 0; k < n; k++) {
        const u = (k + rnd()) / n;
        const nx = -(bz - az) / len, nz = (bx - ax) / len;
        const off = (rnd() - 0.5) * rg.w * KX;
        out.push({ x: ax + (bx - ax) * u + nx * off, z: az + (bz - az) * u + nz * off, r: 0.16 + rnd() * 0.3, a: rg.amp * (0.45 + rnd() * 0.7) });
      }
    }
  }
  // scattered desert hills west of the Euphrates
  for (let i = 0; i < 50; i++) {
    const [x, z] = geo(40.6 + rnd() * 2.2, 29.0 + rnd() * 4.5);
    out.push({ x, z, r: 0.08 + rnd() * 0.16, a: 0.03 + rnd() * 0.06 });
  }
  return (PEAKS = out);
};
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
  { p: BAGHDAD, r: 1.6, h: 0.02 },
  { p: HAMADAN, r: 0.8, h: 0.09 },
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
  h = 0.015 + (h - 0.015) * RELIEF;
  for (const f of FLAT) {
    const d = Math.hypot(x - f.p[0], z - f.p[1]);
    const k = Math.min(1, Math.max(0, (d - f.r * 0.55) / (f.r * 0.45)));
    const s = k * k * (3 - 2 * k);
    h = f.h + (h - f.h) * s;
  }
  const m = Math.min(SHEET_W / 2 - Math.abs(x), SHEET_H / 2 - Math.abs(z));
  return Math.max(0, h) * Math.min(1, Math.max(0, m / 0.35));
};
