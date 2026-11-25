// Project a 3D world point to 2D pixel coordinates for screen-space overlays.
// Generic version — works with any camera pose, not tied to a specific kit's rig.

import * as THREE from "three";

export interface ScreenPoint {
  x: number;
  y: number;
  /** true when the point is in front of the camera (visible). */
  front: boolean;
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/**
 * Project a world-space point to pixel coordinates for a 2D overlay.
 *
 * @param pose   Camera position, target and vertical fov.
 * @param point  World-space [x, y, z] to project.
 * @param width  Overlay width in pixels.
 * @param height Overlay height in pixels.
 */
export function projectToScreen(
  pose: CameraPose,
  point: [number, number, number],
  width: number,
  height: number,
): ScreenPoint {
  const cam = new THREE.PerspectiveCamera(pose.fov, width / height, 0.1, 1000);
  cam.position.set(...pose.position);
  cam.lookAt(...pose.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...point).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, front: v.z < 1 };
}

/**
 * Batch-project several points in one call (shares the virtual camera).
 */
export function projectManyToScreen(
  pose: CameraPose,
  points: [number, number, number][],
  width: number,
  height: number,
): ScreenPoint[] {
  const cam = new THREE.PerspectiveCamera(pose.fov, width / height, 0.1, 1000);
  cam.position.set(...pose.position);
  cam.lookAt(...pose.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return points.map((p) => {
    const v = new THREE.Vector3(...p).project(cam);
    return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, front: v.z < 1 };
  });
}
