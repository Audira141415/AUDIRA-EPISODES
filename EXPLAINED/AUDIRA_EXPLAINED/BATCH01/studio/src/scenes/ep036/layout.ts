// EP036 shared layout: one coordinate system for geometry, labels and camera.
// World units ~ "diorama metres". y = 0 is the street surface; +z faces the camera (front cut face at z = FRONT).

import { PerspectiveCamera, Vector3 } from "three";
import type { Shot } from "../../core/render/Post.tsx";

export const P = {
  bg: "#f3f0ea",
  skyTop: "#cfd8df",
  ink: "#1f2426",
  inkSoft: "#5d6569",
  concreteCut: "#ece8e0",
  concreteIn: "#cfc9bf",
  gasket: "#ef7a43",
  rubber: "#2a2b2d",
  water: "#5ea7dc",
  waterDeep: "#3f86bf",
  mint: "#6ccdaa",
  amber: "#f4b33f",
  asphalt: "#4a4d50",
  paver: "#d9d4ca",
  building: "#f4f2ee",
} as const;

export const BLOCK = { hw: 6.2, top: 0, bottom: -14.5, front: 4, back: -4 };
export const TUNNEL = { x: 0, y: -7.6, R: 3.4, r: 2.92, invertY: -9.85, ringLen: 1.6, rings: 5, segs: 6 };
export const SUMP = { x0: 1.0, x1: 5.0, y0: -14.0, y1: -11.3, wallZ: 1.4, waterY: -13.2 };
export const WATER_TABLE_Y = -3.4;
export const ROAD = { z0: -1.7, z1: 2.1 };

// One camera for the 3D canvas and the projected 2D labels.
const yaw = (24 * Math.PI) / 180;
const el = (17 * Math.PI) / 180;
const D = 77;
const target: [number, number, number] = [0.5, -3.0, 0];
export const COVER_SHOT: Shot = {
  pos: [target[0] + D * Math.sin(yaw) * Math.cos(el), target[1] + D * Math.sin(el), target[2] + D * Math.cos(yaw) * Math.cos(el)],
  target,
  fov: 30,
  focus: D,
  aperture: 0,
  maxBlur: 0,
  exposure: 1.0,
};

/** Project a world point to 1080 x 1920 overlay pixels with the cover camera. */
export const project = (p: [number, number, number], shot: Shot = COVER_SHOT): [number, number] => {
  const cam = new PerspectiveCamera(shot.fov, 1080 / 1920, 1, 900);
  cam.position.set(...shot.pos);
  cam.lookAt(new Vector3(...shot.target));
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new Vector3(...p).project(cam);
  return [(v.x * 0.5 + 0.5) * 1080, (1 - (v.y * 0.5 + 0.5)) * 1920];
};
