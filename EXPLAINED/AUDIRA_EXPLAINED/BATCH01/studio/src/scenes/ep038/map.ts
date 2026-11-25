// EP038 map data: an approximate Teluk Jakarta coastline (lon/lat, no surveyed precision) and a
// qualitative subsidence field. The field has NO units and is not a measured rate: it only places
// "more" vs "less" sinking over the north-coast districts reported in public InSAR studies.
// Everything is deterministic (no Math.random).

export const LON0 = 106.58;
export const LON1 = 107.06;
export const LAT0 = -5.9; // north edge
export const LAT1 = -6.38; // south edge

/** Map plane size in world units (x = east, z = south). */
export const MAP_W = 7.2;
export const MAP_H = 7.2;

// Coastline from west to east (land lies south of this line). Approximate only.
export const COAST: [number, number][] = [
  [106.56, -6.06],
  [106.6, -6.04],
  [106.625, -6.012], // Tanjung Pasir
  [106.645, -6.03],
  [106.67, -6.055],
  [106.7, -6.075], // Dadap
  [106.73, -6.092],
  [106.755, -6.1],
  [106.772, -6.103], // Muara Angke
  [106.79, -6.104],
  [106.805, -6.103], // Muara Baru / Pluit
  [106.812, -6.113], // Sunda Kelapa
  [106.825, -6.118],
  [106.835, -6.112], // Ancol
  [106.85, -6.108],
  [106.862, -6.097], // Tanjung Priok port
  [106.875, -6.095],
  [106.885, -6.104],
  [106.905, -6.103],
  [106.93, -6.096], // Marunda
  [106.955, -6.09],
  [106.975, -6.07],
  [106.99, -6.04],
  [107.002, -6.0],
  [107.012, -5.965],
  [107.022, -5.938], // Tanjung Karawang (Muara Gembong)
  [107.034, -5.932],
  [107.046, -5.952],
  [107.07, -5.985],
];

// Small offshore islands: [lon, lat, radius in degrees]
export const ISLANDS: [number, number, number][] = [
  [106.7, -5.982, 0.006],
  [106.735, -6.03, 0.004],
  [106.748, -6.04, 0.0035],
  [106.718, -6.02, 0.003],
  [106.66, -5.94, 0.005],
  [106.79, -5.955, 0.004],
];

// Reclaimed islets in front of Pluit (rough rectangles): lon0, lat0, lon1, lat1
export const RECLAIM: [number, number, number, number][] = [
  [106.758, -6.09, 106.774, -6.097],
  [106.778, -6.088, 106.796, -6.097],
];

/** Latitude of the coast at a given longitude (linear interpolation of COAST). */
export const coastLat = (lon: number): number => {
  if (lon <= COAST[0][0]) return COAST[0][1];
  for (let i = 1; i < COAST.length; i++) {
    const [x0, y0] = COAST[i - 1];
    const [x1, y1] = COAST[i];
    if (lon <= x1) return y0 + ((lon - x0) / (x1 - x0)) * (y1 - y0);
  }
  return COAST[COAST.length - 1][1];
};

const inRect = (lon: number, lat: number) =>
  RECLAIM.some(([a, b, c, d]) => lon >= a && lon <= c && lat <= b && lat >= d);
const inIsland = (lon: number, lat: number) =>
  ISLANDS.some(([x, y, r]) => (lon - x) ** 2 + (lat - y) ** 2 < r * r);

/** Port breakwaters at Tanjung Priok as thin land strips. */
const inBreakwater = (lon: number, lat: number) =>
  (Math.abs(lat + 6.09) < 0.0012 && lon > 106.852 && lon < 106.884) ||
  (Math.abs(lon - 106.852) < 0.0012 && lat > -6.1 && lat < -6.09);

/** 1 on land, 0 at sea, with a soft edge in degrees. */
export const landAt = (lon: number, lat: number, soft = 0.002): number => {
  if (inRect(lon, lat) || inIsland(lon, lat) || inBreakwater(lon, lat)) return 1;
  const d = coastLat(lon) - lat; // > 0 means south of the coast = land
  return Math.min(1, Math.max(0, 0.5 + d / soft));
};

// Qualitative subsidence bowls (lon, lat, radius deg, weight). Unitless.
export const BOWLS: [number, number, number, number][] = [
  [106.8, -6.118, 0.03, 1.0], // Muara Baru / Pluit
  [106.74, -6.112, 0.03, 0.85], // Kamal / Kapuk
  [106.895, -6.155, 0.022, 0.4], // Kelapa Gading
  [106.935, -6.115, 0.02, 0.42], // Cilincing / Marunda
  [106.84, -6.14, 0.035, 0.45],
];

/** 0..1 relative subsidence (land only). */
export const sinkAt = (lon: number, lat: number): number => Math.min(1, sinkRaw(lon, lat));

/** Unclamped field, used for the fringe phase so bowl centres keep their rings. */
export const sinkRaw = (lon: number, lat: number): number => {
  let s = 0;
  for (const [x, y, r, w] of BOWLS) {
    const d2 = ((lon - x) ** 2 + (lat - y) ** 2) / (r * r);
    s += w * Math.exp(-d2);
  }
  // broad, weak regional component across north Jakarta
  s += 0.18 * Math.exp(-(((lat + 6.14) / 0.05) ** 2)) * Math.exp(-(((lon - 106.83) / 0.12) ** 2));
  return s;
};

export const lonToX = (lon: number) => ((lon - LON0) / (LON1 - LON0) - 0.5) * MAP_W;
export const latToZ = (lat: number) => ((lat - LAT0) / (LAT1 - LAT0) - 0.5) * MAP_H;

/** Deterministic hash noise 0..1. */
export const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
export const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = smooth(x - xi), yf = smooth(y - yi);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
};
