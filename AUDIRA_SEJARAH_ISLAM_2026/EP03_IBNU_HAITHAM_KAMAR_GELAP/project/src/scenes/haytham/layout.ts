// EP03 Ibnu al-Haitsam — shared world layout and camera for the dark-room (camera obscura) film.
// Every beat of the film is staged in and around this one room, so positions live here.

import { framingFrom, shotPlan, cameraAt, hold, pushIn, pullOut, orbit, crane, frame, type Framing, type Beat } from "../../core/camera/moves.ts";
import { at } from "./time.ts";

export const ROOM = {
  halfW: 1.9, // walls at x = ±halfW
  back: -3.6, // back wall z
  front: 6,
  height: 3.6,
};

/** The pinhole in the closed shutter on the left wall. */
export const HOLE: [number, number, number] = [-ROOM.halfW + 0.02, 2.05, -2.15];

/** Where the three candle images land on the back wall (inverted flames). */
export const SPOTS: [number, number, number][] = [
  [0.2, 1.78, ROOM.back + 0.015],
  [0.75, 1.6, ROOM.back + 0.015],
  [1.3, 1.44, ROOM.back + 0.015],
];

export const SPOT_CENTER: [number, number, number] = [0.75, 1.6, ROOM.back];

/** Candle flames outside the shutter: each lies on the straight line spot -> hole, extended to x = -4. */
export const CANDLE_X = -4.0;
export const CANDLES: [number, number, number][] = SPOTS.map((s) => {
  const d = [HOLE[0] - s[0], HOLE[1] - s[1], HOLE[2] - s[2]];
  const k = (CANDLE_X - HOLE[0]) / d[0];
  return [CANDLE_X, HOLE[1] + d[1] * k, HOLE[2] + d[2] * k];
});

/** Model table against the right wall (map of Basrah - Kairo, the eye model, the Nile rapids model). */
export const TABLE = { x: 1.4, z: 1.5, top: 0.82, w: 0.8, d: 1.36 };
export const MAP_C: [number, number, number] = [TABLE.x - 0.02, TABLE.top + 0.012, TABLE.z + 0.12];
export const EYE_C: [number, number, number] = [TABLE.x + 0.05, TABLE.top + 0.24, TABLE.z + 0.58];
export const NILE_C: [number, number, number] = [TABLE.x - 0.02, TABLE.top + 0.04, TABLE.z - 0.42];
/** Shelf with the seven volumes, on the right wall above the table. */
export const SHELF_C: [number, number, number] = [ROOM.halfW - 0.16, 1.62, TABLE.z + 0.05];
/** Door (bolted) and barred window in the front wall. */
export const DOOR_C: [number, number, number] = [-0.7, 1.05, ROOM.front - 0.02];
export const WIN_C: [number, number, number] = [0.85, 2.45, ROOM.front - 0.02];

/** Payoff: the room becomes a box, then shrinks into a phone's camera lens. */
export const PIVOT: [number, number, number] = [0, 1.8, 1.2];
export const LENS: [number, number, number] = [0, 2.0, 2.4];
export const ROOM_MIN_SCALE = 0.075;

export const PALETTE = {
  void: "#050608",
  plaster: "#4a4540",
  plasterDark: "#34312d",
  floor: "#2a2622",
  wood: "#2e2219",
  robe: "#1c1f25",
  tungsten: "#FFE3A0",
  flame: "#FFC56B",
  moon: "#A3BFDB",
  ember: "#FF8A3D",
  paper: "#e9e1cf",
  red: "#c4442e",
};

/** Cover framing: inside the dark room, looking at the back wall with the beams crossing. */
export const COVER: Framing = framingFrom([0.45, 1.78, 4.9], [-0.35, 1.58, -2.4], 46);

/** Framing from a position and target, with the azimuth unwrapped next to `near` (no 300° spins). */
const fr = (pos: [number, number, number], target: [number, number, number], fov: number, near: number): Framing => {
  const f = framingFrom(pos, target, fov);
  let az = f.az;
  while (az - near > 180) az -= 360;
  while (az - near < -180) az += 360;
  return { ...f, az };
};

/** Camera position of a framing. */
const posOf = (f: Framing): [number, number, number] => {
  const D = Math.PI / 180;
  return [
    f.target[0] + f.dist * Math.cos(f.el * D) * Math.sin(f.az * D),
    f.target[1] + f.dist * Math.sin(f.el * D),
    f.target[2] + f.dist * Math.cos(f.el * D) * Math.cos(f.az * D),
  ];
};
/**
 * Same view, with the target pulled to `d` m in front of the camera: a turn between two such framings
 * pans the camera nearly in place instead of swinging it on a wide arc (through walls or past props).
 */
const nearOf = (f: Framing, d = 0.8): Framing => {
  const p = posOf(f);
  const k = d / f.dist;
  return { ...f, dist: d, target: [p[0] + (f.target[0] - p[0]) * k, p[1] + (f.target[1] - p[1]) * k, p[2] + (f.target[2] - p[2]) * k] };
};

// ---- framings ------------------------------------------------------------------------------
const MAP = fr([0.2, 2.3, 1.62], [MAP_C[0] + 0.02, MAP_C[1], MAP_C[2] - 0.02], 42, COVER.az);
const EYE = fr([0.62, 1.1, 2.45], [EYE_C[0] - 0.02, EYE_C[1] + 0.01, EYE_C[2] - 0.1], 42, MAP.az);
const MAP2 = fr([0.25, 2.15, 1.42], [MAP_C[0], MAP_C[1], MAP_C[2] - 0.18], 44, EYE.az);
const NILE = fr([0.52, 1.5, 1.05], [NILE_C[0] + 0.02, NILE_C[1], NILE_C[2]], 40, MAP2.az);
const DOOR = fr([0.75, 1.62, 2.6], [-0.05, 1.45, ROOM.front], 46, NILE.az);
// end of the door beat (after both pushes), then a pan in place to the lit pinhole plate ("Di ruang gelap")
const DOOR_END = nearOf({ ...DOOR, dist: DOOR.dist * 0.88 * 0.94 });
const HOLEV = nearOf(fr([0.5, 1.95, 2.3], [HOLE[0] + 0.05, HOLE[1] - 0.12, HOLE[2]], 44, DOOR.az));
const SECTION = fr([-6.4, 4.2, 1.5], [-2.15, 1.95, -1.95], 44, HOLEV.az);
const WALL = fr([-3.0, 2.9, 0.1], [SPOT_CENTER[0] - 0.1, 1.62, ROOM.back], 42, SECTION.az);
const EYE_IN = fr([0.62, 1.3, 2.2], [EYE_C[0], EYE_C[1], EYE_C[2] - 0.12], 40, WALL.az);
const SHELF = fr([0.35, 1.62, 2.75], [SHELF_C[0] - 0.05, SHELF_C[1] + 0.12, SHELF_C[2]], 44, EYE_IN.az);
// outside, on the -x/+z side: the open front (cutaway), the pinhole side with the candles and the plaque
// all face the camera (azimuth -32° unwrapped near SHELF); the whole box fits the 9:16 frame
const OUT: Framing = { target: [0.5, 1.3, 1.5], az: -32 + 360 * Math.round((SHELF.az + 32) / 360), el: 20, dist: 29, fov: 40 };
const PHONE: Framing = { target: [LENS[0] + 0.15, LENS[1] - 0.05, LENS[2]], az: OUT.az + 26, el: 8, dist: 3.4, fov: 40 };

const FPS = 60;
/** The whole film's shot list: every key is a word of the locked voice. */
export const beats = (): Beat[] => [
  { at: 0, move: hold() },
  { at: at("kenapa"), move: hold() },
  { at: at("kamar", 1, "e"), move: pushIn(0.8) },
  // context: turn to the model table, the map, the eye model
  { at: at("basrah"), move: frame(MAP) },
  { at: at("bertanya"), move: pushIn(0.9) },
  { at: at("mengira"), move: frame(EYE) },
  { at: at("eropa"), move: pullOut(1.15) },
  { at: at("alhazen", 0, "e"), move: orbit(-8) },
  // main: the route on the map, the Nile rapids model, the bolted door
  { at: at("khalifah"), move: frame(MAP2) },
  { at: at("aswan"), move: frame(NILE) },
  { at: at("mustahil", 0, "e"), move: pushIn(0.86) },
  { at: at("keras"), move: frame(DOOR) },
  { at: at("gila"), move: pushIn(0.88) },
  { at: at("gelap"), move: frame(DOOR_END) },
  // explanation: the experiment
  { at: at("beberapa"), move: frame(HOLEV) },
  { at: at("lubang", 0, "e"), move: frame(SECTION) },
  { at: at("dinding"), move: orbit(5) },
  { at: at("tutup"), move: pushIn(0.94) },
  { at: at("kembali", 0, "e"), move: orbit(-4) },
  { at: at("terbalik", 0, "e"), move: frame(WALL) },
  { at: at("masuk", 0, "e"), move: frame(EYE_IN) },
  // payoff: the seven volumes, then out of the room: the box, then the phone
  { at: at("jilid", 0, "e"), move: frame(SHELF) },
  { at: at("kepler", 0, "e"), move: crane(4) },
  { at: at("obscura", 0, "e"), move: frame(OUT) },
  { at: at("2015"), move: orbit(-8) },
  { at: at("karyanya", 1, "e"), move: orbit(12) },
  { at: at("ponselmu", 0, "e"), move: frame(PHONE) },
  // outro: into the lens
  { at: at("tangkap", 0, "e"), move: pushIn(0.55) },
  { at: at("audira", 0, "e"), move: pullOut(1.12) },
];

let RIG: ReturnType<typeof shotPlan> | null = null;
export const filmCamera = (f60: number) => {
  RIG ??= shotPlan(FPS, COVER, beats());
  return cameraAt(RIG, f60, FPS, { lens: { aperture: 0, maxBlur: 0, exposure: 0.72 }, alive: { deg: 0.8, breath: 0.006 } });
};
