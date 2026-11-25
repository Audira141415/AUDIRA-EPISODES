// World layout for EP04: one diorama world.
//   market lane + balance  : origin (the cover)
//   map table (West Africa → Cairo → Makkah, later the Catalan Atlas vellum): centred at x = -8.5
//   Giza camp, the Nile, the Cairo palace: x ≈ +8 .. +17

/** Map cell size: one cell = 3° of longitude/latitude. */
export const CELL = 0.34;
export const MAP_X = -8.5;
export const MAP_Z = 0;
/** Longitude (°E) → world x on the map table. */
export const mapX = (lon: number) => MAP_X + ((lon - 12) / 3) * CELL;
/** Latitude (°N) → world z on the map table (north = -z). */
export const mapZ = (lat: number) => MAP_Z - ((lat - 24) / 3) * CELL;

export const PLACES = {
  mali: [-6, 15] as [number, number],
  bambuk: [-11.2, 13.6] as [number, number],
  bure: [-8.8, 11.6] as [number, number],
  salt: [-5, 22.5] as [number, number],
  cairo: [31.2, 30.0] as [number, number],
  makkah: [39.8, 21.4] as [number, number],
  majorca: [2.9, 39.6] as [number, number],
};

/** Caravan route Mali → Cairo (lon, lat), then Cairo → Makkah. */
export const ROUTE: [number, number][] = [
  [-7.5, 13.2], [-4, 17], [-1.5, 22.5], [4, 26.5], [12, 28], [20, 29], [26, 29.8], [31.2, 30],
];
export const ROUTE_MAKKAH: [number, number][] = [[31.2, 30], [33.5, 28.5], [36, 25], [39.8, 21.4]];
/** Payoff: the name travels north to Europe (Majorca, where the Catalan Atlas was made). */
export const ROUTE_EUROPE: [number, number][] = [[31.2, 30], [24, 33.6], [14, 35.8], [2.9, 39.6]];
