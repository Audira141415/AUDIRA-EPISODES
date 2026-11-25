// EP01 cover: map projection shared by the canvas map texture and the 3D champion slabs.
// Equirectangular with a ~28° standard parallel, centred on the Atlantic (Europe + South America).

export const S = 0.04; // world units per degree of latitude
export const KX = 0.88; // cos(28°): squeeze longitude so Europe is not stretched wide
export const LON0 = -25;
export const LAT0 = 4;

/** lon/lat -> table-plane x/z (north is -z, away from the camera). */
export const proj = (lon: number, lat: number): [number, number] => [(lon - LON0) * S * KX, -(lat - LAT0) * S];

// Map sheet extent (degrees) and its size on the table.
export const MAP_LON: [number, number] = [-128, 78];
export const MAP_LAT: [number, number] = [-64, 80];
const [x0, z1] = proj(MAP_LON[0], MAP_LAT[0]);
const [x1, z0] = proj(MAP_LON[1], MAP_LAT[1]);
export const MAP_W = x1 - x0;
export const MAP_D = z1 - z0;
export const MAP_CX = (x0 + x1) / 2;
export const MAP_CZ = (z0 + z1) / 2;

/** lon/lat -> 0..1 texture coordinates (u right, v down). */
export const uv = (lon: number, lat: number): [number, number] => [
  (lon - MAP_LON[0]) / (MAP_LON[1] - MAP_LON[0]),
  (MAP_LAT[1] - lat) / (MAP_LAT[1] - MAP_LAT[0]),
];
