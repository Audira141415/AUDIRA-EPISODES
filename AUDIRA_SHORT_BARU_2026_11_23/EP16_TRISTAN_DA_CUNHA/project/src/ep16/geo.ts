// Hand-drawn simplified coastlines (lon, lat) for the Atlantic map. Equirectangular world space:
// x = (lon + 95) * K, y = (64 - lat) * K. No coastline dataset is available locally, so shapes are traced by hand
// from known coordinates; accuracy is "reads as Atlantic at phone size", not survey grade.

export const K = 16;
export const proj = (lon: number, lat: number): [number, number] => [(lon + 95) * K, (64 - lat) * K];

type LL = [number, number];

const AFRICA: LL[] = [
  [-5.9, 35.8], [-9.8, 31], [-13, 27.5], [-16.5, 21], [-17.2, 14.7], [-15, 11], [-13, 8.5], [-11, 6.8], [-7.5, 4.4],
  [-3, 5], [1, 6], [4.5, 6.3], [6.5, 4.3], [9.5, 3.5], [9.6, 1], [9, -1], [11.8, -4.5], [13.2, -8.8], [13.6, -12.5],
  [11.8, -17], [14.5, -22.9], [15.2, -26.6], [16.5, -28.6], [18.4, -33.9], [20, -34.8], [22.5, -34], [25.6, -33.9],
  [28, -32.7], [31, -29.5], [32.9, -26], [35.5, -24], [35.3, -21], [39, -17], [40.5, -11], [39.3, -6.5], [41, -2],
  [46, 2], [51, 11.5], [43.5, 11.8], [39.5, 15.5], [37, 21.5], [35, 24], [32.5, 30], [30, 31.2], [25, 31.6],
  [20, 30.8], [19, 30.3], [15, 32.4], [11, 33.5], [10.5, 37], [5, 36.8], [-1, 35.5],
];

const SOUTH_AMERICA: LL[] = [
  [-77.5, 8], [-75.5, 10.8], [-72, 11.8], [-66, 10.6], [-61, 10.5], [-57, 6], [-52, 5], [-50, 0], [-44, -2.5],
  [-38.5, -3.7], [-35, -5.5], [-35, -9], [-38.5, -13], [-39, -17.5], [-41, -22], [-44, -23], [-48.5, -26.5],
  [-48.7, -28.5], [-51, -31], [-53.4, -33.7], [-58, -34.5], [-57, -36.5], [-57.6, -38.2], [-62, -39], [-62.3, -40.8],
  [-65, -41.5], [-64.5, -45], [-67.5, -46.5], [-66, -48], [-68.5, -50.2], [-68.3, -52.3], [-70, -53.5], [-72, -54],
  [-75, -51], [-74, -46], [-73.5, -42], [-73.7, -37], [-71.5, -32], [-71.4, -28], [-70.3, -18.5], [-75.5, -15],
  [-78, -10], [-81, -6], [-80, -3.5], [-80, 1], [-78.8, 1.5],
];

const NORTH_AMERICA: LL[] = [
  [-80.2, 25.2], [-80.1, 27], [-81, 31], [-77, 34.5], [-76, 37], [-74, 40.5], [-70, 41.5], [-70, 43.8], [-66, 44.8],
  [-64, 45.5], [-61, 45.5], [-60, 47], [-56, 52], [-60, 55.5], [-62, 58], [-64.5, 60.5], [-70, 64], [-100, 64],
  [-100, 25], [-97, 26], [-95, 29.5], [-90, 29.5], [-85, 30], [-82.5, 27.5], [-81.2, 25.2],
];

const EUROPE: LL[] = [
  [-9.5, 38.8], [-8.9, 37], [-6, 36.2], [-2, 36.7], [0, 38.7], [3.2, 42], [6, 43.2], [9, 44.3], [12.5, 41.5],
  [16, 38], [18.5, 40.2], [13, 45.7], [19, 42], [22, 37], [26, 40], [29, 41], [32, 46], [40, 46], [40, 66], [5, 66],
  [5, 58], [8, 57], [8.5, 55.5], [8, 54], [5, 53.3], [4, 51.5], [2, 51], [-1.5, 49.7], [-4.6, 48.5], [-2, 47],
  [-1.2, 46], [-1.8, 43.4], [-8, 43.7], [-9.3, 43], [-8.8, 41],
];

const BRITAIN: LL[] = [
  [-5.7, 50], [-3, 50.6], [1.4, 51.1], [1.7, 52.7], [0.3, 53.4], [-0.2, 54.5], [-1.6, 55.6], [-2.1, 57.6],
  [-3.8, 58.6], [-5, 58.6], [-6.2, 56.9], [-5.6, 55.3], [-4.8, 54.8], [-3, 54], [-3.1, 53.3], [-4.6, 53.2],
  [-4.2, 52.3], [-5.3, 51.8], [-3, 51.4],
];

const IRELAND: LL[] = [
  [-6, 52.2], [-6, 54], [-5.5, 55], [-7.3, 55.3], [-8.4, 55], [-10, 54.2], [-9.8, 53], [-10.4, 51.8], [-8, 51.6],
];

const toPath = (pts: LL[]) => pts.map(([lo, la], i) => { const [x, y] = proj(lo, la); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("") + "Z";

export const LANDS = [AFRICA, SOUTH_AMERICA, NORTH_AMERICA, EUROPE, BRITAIN, IRELAND].map(toPath);

export const PLACES = {
  tristan: proj(-12.3, -37.1),
  nightingale: proj(-12.5, -37.4),
  stHelena: proj(-5.7, -15.9),
  capeTown: proj(18.4, -33.9),
  calshot: proj(-1.3, 50.8),
} as const;

/** Points along a quadratic arc a→b bending by `bend` (fraction of length, + = left). */
export const arc = (a: [number, number], b: [number, number], bend = 0.18, n = 48): [number, number][] => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const cx = mx - dy * bend, cy = my + dx * bend;
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]] as [number, number];
  });
};

/** Partial polyline up to fraction k (0–1) of its point list, interpolated. */
export const partial = (pts: [number, number][], k: number) => {
  const f = Math.max(0, Math.min(1, k)) * (pts.length - 1);
  const i = Math.floor(f);
  const out = pts.slice(0, i + 1);
  if (i < pts.length - 1) {
    const r = f - i;
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r]);
  }
  return out;
};

export const polyD = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
