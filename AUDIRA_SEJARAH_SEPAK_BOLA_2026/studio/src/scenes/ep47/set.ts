// EP47 film sets placed in the cover world (world.ts): the pitch on the plain right of Superga
// (Filadelfia stand-in), a Turin avenue behind it for the mourners, and the relief-map table
// (rendered alone, the terrain hidden). Pure TS, no three.js.
import { FACE_YAW, FWD, MEMORIAL, RIGHT, SUMMIT, getTerrain } from "./world.ts";

export type V3 = [number, number, number];

// ── Pitch frame: local -z points at Superga, local +z at the camera; halfway line along local x.
export const PITCH_C = { x: SUMMIT.x + RIGHT.x * 640, z: SUMMIT.z + RIGHT.z * 640 }; // 640 (was 470): Superga reads as a gentle dome from the pitch, not a wall
export const PITCH_YAW = Math.atan2(RIGHT.x, RIGHT.z);
const cy = Math.cos(PITCH_YAW), sy = Math.sin(PITCH_YAW);

let base: number | null = null;
/** Platform top: above every terrain bump under the pitch, the avenue and their margins. */
export const pitchBase = () => {
  if (base !== null) return base;
  const t = getTerrain();
  let m = -1e9;
  for (let lx = -70; lx <= 70; lx += 5)
    for (let lz = -60; lz <= 380; lz += 5) {
      const x = PITCH_C.x + lx * cy + lz * sy, z = PITCH_C.z - lx * sy + lz * cy;
      m = Math.max(m, t.heightAt(x, z));
    }
  base = m + 0.3;
  return base;
};
/** Pitch-local → world. */
export const P = (lx: number, ly: number, lz: number): V3 => [PITCH_C.x + lx * cy + lz * sy, pitchBase() + ly, PITCH_C.z - lx * sy + lz * cy];

/** Lineup on the halfway line: index 0 = keeper (left), 5 = Mazzola (centre, No. 10). */
export const LINEUP_X = Array.from({ length: 11 }, (_, i) => (i - 5) * 1.6);
export const MAZZOLA = 5;
export const KEEPER = 0;
/** Five scudetto shields behind the lineup. */
export const SHIELD_X = [-8.8, -4.4, 0, 4.4, 8.8]; // wide enough that the No. 10 close-up shows one whole shield, no edge crops
export const SHIELD_Z = -9;
export const SHIELD_YEARS = ["1943", "1946", "1947", "1948", "1949"];
/** Champions board behind the junior lines (payoff). */
export const BOARD = { x: 0, z: -15 };
/** Turin avenue (mourners) behind the camera side of the pitch, along local z. */
export const AVENUE = { z0: 110, z1: 370, half: 11 };

// ── Memorial frame (cover Memorial group: local +z faces the cover camera, -z faces Superga).
const cm = Math.cos(FACE_YAW), sm = Math.sin(FACE_YAW);
export const M = (lx: number, ly: number, lz: number): V3 => {
  const y = getTerrain().heightAt(MEMORIAL.x, MEMORIAL.z);
  return [MEMORIAL.x + lx * cm + lz * sm, y + ly, MEMORIAL.z - lx * sm + lz * cm];
};

/** Around Superga: a units back along the cover line of sight, b to the right. */
export const S = (a: number, b: number, y: number): V3 => [SUMMIT.x - FWD.x * a + RIGHT.x * b, y, SUMMIT.z - FWD.z * a + RIGHT.z * b];

// ── Relief-map table (its own space at the origin; the terrain is hidden while it shows).
export const MAP_LON: [number, number] = [-12, 21];
export const MAP_LAT: [number, number] = [34.5, 50.5];
const LON0 = -1, LAT0 = 42.5, KZ = 10, KX = 10 * Math.cos((42.5 * Math.PI) / 180);
export const mapXZ = (lon: number, lat: number): [number, number] => [(lon - LON0) * KX, -(lat - LAT0) * KZ];
export const MAP_W = (MAP_LON[1] - MAP_LON[0]) * KX;
export const MAP_D = (MAP_LAT[1] - MAP_LAT[0]) * KZ;
export const MAP_CX = (mapXZ(MAP_LON[0], 0)[0] + mapXZ(MAP_LON[1], 0)[0]) / 2;
export const MAP_CZ = (mapXZ(0, MAP_LAT[0])[1] + mapXZ(0, MAP_LAT[1])[1]) / 2;
export const TURIN = mapXZ(7.68, 45.07);
export const LISBON = mapXZ(-9.14, 38.72);
