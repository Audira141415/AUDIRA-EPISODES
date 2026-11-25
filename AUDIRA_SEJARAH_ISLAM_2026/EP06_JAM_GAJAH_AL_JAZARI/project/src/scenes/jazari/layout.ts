// EP06 Jam Gajah Al-Jazari (INNERWORKS). One shared layout module: dimensions, attachment points,
// palette and the mechanism's single driver. Geometry, labels and animation all read these numbers.
//
// World units: the elephant's body is ~2.3 long. Head faces +X, the cutaway opens toward +Z (camera side).

export const PALETTE = {
  bg: "#F1ECE3",
  floor: "#E9E2D6",
  plinth: "#F7F4EE",
  copper: "#B87A4B",
  copperDark: "#7E4F2E",
  shellInside: "#EFE6D6",
  cut: "#EF7A43", // section faces (INNERWORKS cut colour)
  water: "#3FB8AF",
  glass: "#CFEDEA",
  brass: "#D9A441",
  gold: "#E2B44C",
  lapis: "#2F4E8C",
  red: "#B8352E",
  ivory: "#F2E8D2",
  serpent: "#3E8E5B",
  falcon: "#8A5A36",
  rope: "#4A3424",
  ink: "#14202B",
};

/** Body ellipsoid. */
export const BODY = { c: [0, 1.25, 0] as [number, number, number], r: [1.15, 0.78, 0.72] as [number, number, number] };
/** Cut wedge half-angle around +Z (radians). */
export const CUT = 0.72;
/** Cut centre azimuth (sphere-geometry phi): +Z is PI/2, turned a little toward the camera. */
export const CUT_PHI = Math.PI / 2 + 0.28;

/** Water tank inside the belly (vertical cylinder). */
export const TANK = { x: -0.05, y0: 0.66, y1: 1.3, r: 0.42 };
export const WATER_TOP = 1.1;
/** Sinking bowl (tarjahar): hemisphere, open side up. */
export const BOWL_R = 0.29;

/** Back: dais, pillars, roof, castle, dome. */
export const DAIS_Y = 2.02;
export const ROOF_Y = 2.6;
export const CASTLE = { w: 0.62, h: 0.44, d: 0.52, y0: 2.66 };
export const DOME_R = 0.28;

/** Falcon beak tip (ball release) and serpent mouth (ball catch) on the camera side of the castle. */
export const BEAK: [number, number, number] = [0.82, 2.86, 0.16];
export const MOUTH: [number, number, number] = [0.84, 2.36, 0.18];
/** Cymbal in the belly, front of the tank. */
export const CYMBAL: [number, number, number] = [0.4, 1.62, 0.36];

/** Ball path points: chute top (after the serpent drops it into the vase), cymbal face, sink below. */
export const CHUTE_TOP: [number, number, number] = [0.5, 2.05, 0.3];
export const CYMBAL_TOP: [number, number, number] = [0.4, 1.7, 0.36];
export const BALL_SINK: [number, number, number] = [0.3, 0.95, 0.3];

/** Bowl rim height from the single driver (sink 0 = floating high, 1 = sunk to the tank floor). */
export const bowlY = (sink: number) => 1.2 - sink * 0.23;

/** Manuscript book (back-left layer), basalt wall (far back layer). */
export const BOOK = { pos: [5.2, 0, -6.5] as [number, number, number], rotY: -0.05, pageW: 2.7, pageH: 3.5, lift: 2.2 };
export const WALL_Z = -19;
/** Where the adult silhouette stands in the payoff (left of the elephant). */
export const ADULT: [number, number, number] = [-1.2, 0, 1.45];

/** Cover framing (the hook starts from it). */
export const COVER = {
  pos: [9.6, 7.1, 14.6] as [number, number, number],
  target: [0.38, 2.45, 0] as [number, number, number],
  fov: 26,
};
