// AE-039 shared layout: one coordinate source for geometry, labels and camera.
// Pipe axis = world +X (flow direction). Cross-section angles are measured in the YZ plane
// with angle 0 = toward camera (+Z) and 90° = up (+Y).

import * as THREE from "three";
import type { Shot } from "../../core/render/Post.tsx";

export const P = {
  bgTop: "#1d6a83",
  bgBottom: "#04161f",
  fog: "#062433",
  sand: "#58605a",
  concrete: "#8d8f8a",
  concreteCut: "#b9b6ab",
  insulation: "#e2a33f",
  insulationCut: "#f0c16c",
  coating: "#1b1d20",
  steel: "#8b939c",
  steelCut: "#c9cfd6",
  wax: "#f3e6bf",
  oil: "#2a1408",
  oilSheen: "#6b3812",
  pigCup: "#e2552a",
  pigBody: "#b8c0c8",
  brush: "#26292d",
  anode: "#c7ccd2",
  amber: "#ffb340",
  ink: "#f4f7f8",
  cyan: "#6fe3ff",
} as const;

/** Radii (scene units). Bore ≈ 1.6 units. */
export const R = {
  steelIn: 0.8,
  steelOut: 0.88,
  coatOut: 0.905,
  insOut: 1.1,
  concOut: 1.38,
};

/** Near (camera-side) end of each layer: stepped cutaway, inner layers reach further. */
export const X = {
  conc: -0.6,
  ins: -1.7,
  coat: -2.35,
  steel: -3.6,
  cutEnd: 3.2, // wedge cut stops here; full pipe continues to far
  far: 26,
  pigBack: -0.9,
  pigFront: 1.0,
};

/** Wedge removed from the pipe, centred on the camera direction (deg). */
export const WEDGE = { center: 30, half: 60 };
export const KEEP0 = ((WEDGE.center + WEDGE.half) * Math.PI) / 180;
export const KEEP1 = ((WEDGE.center - WEDGE.half + 360) * Math.PI) / 180;

export const SEABED_Y = -1.2;

export const COVER_SHOT: Shot = {
  pos: [-16.1, 4.3, 10],
  target: [0.45, -0.5, 0],
  fov: 37,
  focus: 11,
  aperture: 0,
  maxBlur: 0,
  exposure: 1,
};

/** Project a world point to 1080×1920 overlay pixels for COVER_SHOT. */
export const project = (p: [number, number, number], shot: Shot = COVER_SHOT): [number, number] => {
  const cam = new THREE.PerspectiveCamera(shot.fov, 1080 / 1920, 0.5, 500);
  cam.position.set(...shot.pos);
  cam.lookAt(...shot.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920];
};

/** Point on a ring of radius r at angle a (rad, 0 = +Z, 90° = +Y), at axial position x. */
export const ringPt = (x: number, r: number, a: number): [number, number, number] => [x, r * Math.sin(a), r * Math.cos(a)];
