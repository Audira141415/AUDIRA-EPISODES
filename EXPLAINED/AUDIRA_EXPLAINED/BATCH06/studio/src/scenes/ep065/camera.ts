// AE-065 cover camera + 3D→screen projection for the ink annotations.
// 9:16 framing check: visible width = 2·d·tan(fov/2)·9/16. With fov 34 and d ≈ 27:
// height ≈ 16.5 units, width ≈ 9.3 units, so the gap, both leaves, the cut pier and the ship fit.
import * as THREE from "three";

export type Pose = { pos: [number, number, number]; target: [number, number, number]; fov: number };

export const COVER_POSE: Pose = { pos: [-15.96, 2.13, 26.77], target: [-0.5, -2.1, 0], fov: 34 };

export const makeCamera = (pose: Pose, w = 1080, h = 1920) => {
  const c = new THREE.PerspectiveCamera(pose.fov, w / h, 0.1, 400);
  c.position.set(...pose.pos);
  c.lookAt(new THREE.Vector3(...pose.target));
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
  return c;
};

export const project = (cam: THREE.PerspectiveCamera, p: THREE.Vector3 | [number, number, number], w = 1080, h = 1920): [number, number] => {
  const v = Array.isArray(p) ? new THREE.Vector3(...p) : p.clone();
  v.project(cam);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
};
