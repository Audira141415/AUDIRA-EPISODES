// EP03 Sealand — HISTORYMAP geography. World units = kilometres, origin = Roughs Tower / Sealand (51.894 N, 1.482 E),
// x east, y south (equirectangular at 52° N). Outlines are simplified by hand from public coastline shapes: they only
// have to read as Britain / the Low Countries / the Essex–Suffolk coast on a chart, not survey-grade.
export const SEALAND: [number, number] = [0, 0];
export const proj = (lon: number, lat: number): [number, number] => [(lon - 1.482) * 68.7, (51.894 - lat) * 111.2];

const path = (pts: [number, number][]) => "M" + pts.map(([lo, la]) => proj(lo, la).map((v) => v.toFixed(1)).join(",")).join("L") + "Z";

// Great Britain, with extra detail on the Thames estuary → Naze → Harwich → Felixstowe stretch.
const GB: [number, number][] = [
  [-5.7, 50.05], [-4.2, 50.35], [-3.0, 50.65], [-1.9, 50.6], [-1.0, 50.78], [0.2, 50.75], [1.0, 50.95], [1.4, 51.15],
  [1.42, 51.38], [1.0, 51.47], [0.55, 51.5], [0.75, 51.55], [0.95, 51.62], [0.92, 51.7], [1.05, 51.76], [1.18, 51.79],
  [1.25, 51.83], [1.28, 51.865], [1.27, 51.9], [1.25, 51.935], [1.29, 51.947], [1.31, 51.935], [1.33, 51.955],
  [1.39, 51.98], [1.45, 52.02], [1.53, 52.07], [1.6, 52.15], [1.63, 52.27], [1.75, 52.47], [1.72, 52.73], [1.4, 52.95],
  [0.9, 52.97], [0.38, 52.8], [0.33, 53.1], [0.25, 53.45], [0.0, 53.58], [-0.2, 54.1], [-0.6, 54.5], [-1.2, 54.65],
  [-1.6, 55.3], [-2.0, 55.8], [-2.6, 56.05], [-2.5, 56.5], [-1.8, 57.5], [-2.0, 57.7], [-3.2, 57.7], [-4.0, 57.9],
  [-3.0, 58.6], [-5.0, 58.6], [-5.6, 57.9], [-5.7, 57.0], [-5.6, 56.3], [-5.2, 55.8], [-4.9, 55.0], [-3.6, 54.9],
  [-3.4, 54.4], [-3.0, 53.9], [-3.1, 53.3], [-4.6, 53.3], [-4.2, 52.8], [-4.1, 52.3], [-5.2, 51.85], [-4.3, 51.65],
  [-3.2, 51.45], [-3.0, 51.2], [-4.2, 51.2], [-5.0, 50.9],
];

// Continent from Brittany to Denmark, closed far to the east/south so Austria and Germany are land.
const EU: [number, number][] = [
  [-4.8, 48.4], [-3.0, 48.8], [-1.6, 48.7], [-1.9, 49.7], [-1.2, 49.4], [0.1, 49.5], [1.6, 50.2], [1.6, 50.9],
  [2.5, 51.08], [3.4, 51.4], [3.7, 51.6], [4.05, 51.95], [4.5, 52.4], [4.75, 52.95], [5.5, 53.4], [6.9, 53.45],
  [8.2, 53.55], [8.6, 53.9], [8.9, 54.4], [8.6, 55.4], [8.1, 55.6], [8.2, 56.6], [8.6, 57.1], [10.5, 57.7], [10.5, 57.2],
  [10.2, 56.5], [10.9, 56.4], [10.2, 55.4], [9.9, 54.8], [10.9, 54.3], [11.5, 54.1], [13.5, 54.3], [18, 54.6],
  [22, 54.5], [22, 44], [12.4, 44.2], [13.6, 45.7], [9.0, 44.3], [7.5, 43.8], [3.2, 43.2], [3.0, 42.4], [-1.8, 43.4],
  [-1.2, 46.2], [-2.2, 47.2],
];
const IRELAND: [number, number][] = [
  [-6.0, 53.9], [-6.0, 52.2], [-6.9, 52.1], [-8.5, 51.6], [-10.2, 51.8], [-9.5, 53.3], [-10.0, 54.2], [-8.2, 55.2], [-6.2, 55.2], [-5.6, 54.5],
];

export const LAND_GB = path(GB);
export const LANDS = [LAND_GB, path(EU), path(IRELAND)];

// Places (km)
export const PLACES = {
  sealand: SEALAND,
  harwich: proj(1.285, 51.944),
  felixstowe: proj(1.35, 51.962),
  naze: proj(1.28, 51.865),
  london: proj(-0.12, 51.51),
  chelmsford: proj(0.47, 51.735),
  amsterdam: proj(4.9, 52.37),
  rotterdam: proj(4.48, 51.92),
  hamburg: proj(9.99, 53.55),
  bonn: proj(7.1, 50.73),
  wien: proj(16.37, 48.21),
  germanyMid: proj(9.5, 51.8),
  thames: proj(1.15, 51.55),
} as const;

/** 1 nautical mile in km. */
export const NM = 1.852;
