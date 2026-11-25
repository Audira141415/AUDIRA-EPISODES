// EP08 "Pisau bedah Al-Zahrawi" (PRECISION) — palette and world layout shared by cover and film.
// World: an open manuscript (Kitab al-Tasrif, part 30) on a graphite studio table; ink drawings of
// instruments on the left page; the hero scalpel hovers above its own drawing as polished metal.

export const PAL = {
  table: "#151413",
  bg: "#0f0e0d",
  parchment: "#eadcbd",
  pageEdge: "#cdb98f",
  leather: "#3d2417",
  ink: "#2a1b10",
  rubric: "#8a2e1c",
  steel: "#d9dcdf",
  brass: "#c39352",
  ebony: "#1d1612",
  ivory: "#f3ead8",
  copper: "#e0a463",
} as const;

/** Page size (world units). Left page spans x [-PAGE_W, -GUTTER], right page [GUTTER, PAGE_W]. */
export const PAGE_W = 3.3;
export const PAGE_D = 4.6;
export const GUTTER = 0.04;
export const STACK_H = 0.16;

/** Hero scalpel pose above the left page (world units, radians). */
export const HERO = {
  pos: [-1.5, 1.5, -0.15] as [number, number, number],
  yaw: 0.8,
  tilt: -1.05,
  roll: 0.1,
  scale: 0.84,
};

/** Page lift above the stack: 0 at the gutter, rising fast, flattening toward the outer edge. xn = 0 gutter … 1 edge. */
export const pageCurve = (xn: number) => 0.3 * (1 - Math.pow(1 - Math.min(1, xn * 1.6), 2.4)) * (1 - 0.62 * xn);

const TEX_W = 1024, TEX_H = 1428;
/** World point on the left page surface for a canvas pixel of the left page texture. */
export const leftPagePoint = (cx: number, cy: number, lift = 0): [number, number, number] => {
  const u = cx / TEX_W;
  return [-GUTTER - PAGE_W + u * PAGE_W, STACK_H + pageCurve(1 - u) + lift, -PAGE_D / 2 + (cy / TEX_H) * PAGE_D];
};

/** Map plate (equirectangular at 41°N, lon scaled by cos 41°): lon/lat → world. Plate lies behind the book. */
export const MAP = { cx: 2.4, cz: -7.0, lon0: 4.5, lat0: 40.8, k: 0.384, top: 0.12, lonMin: -10.5, lonMax: 19.5, latMin: 35.2, latMax: 46.4 };
export const geo = (lon: number, lat: number, y = MAP.top): [number, number, number] => [
  MAP.cx + (lon - MAP.lon0) * MAP.k * 0.755,
  y,
  MAP.cz - (lat - MAP.lat0) * MAP.k,
];
export const CITY = {
  kordoba: [-4.78, 37.88] as const,
  zahra: [-4.87, 37.89] as const,
  toledo: [-4.02, 39.86] as const,
  salerno: [14.77, 40.68] as const,
  montpellier: [3.88, 43.61] as const,
};

/** Instrument tray to the right of the book (explanation + outro). */
export const TRAY = { x: 5.4, z: 0.3, w: 2.9, d: 4.1 };
export const OUD = { x: 6.9, z: -3.0 };
