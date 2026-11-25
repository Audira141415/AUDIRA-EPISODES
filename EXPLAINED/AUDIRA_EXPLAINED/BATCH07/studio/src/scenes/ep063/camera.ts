// AE-063 camera pose + 3D→screen projection for HUD callouts.
// 9:16 framing check: visible width = 2·d·tan(fov/2)·9/16 (stadium ≈ 55 × 65 units, long axis on z).
import * as THREE from "three";

export type V3 = [number, number, number];
export type Pose = { pos: V3; target: V3; fov: number };

const DEG = Math.PI / 180;
export const orbit = (c: V3, r: number, az: number, el: number): V3 => [
  c[0] + r * Math.sin(az * DEG) * Math.cos(el * DEG),
  c[1] + r * Math.sin(el * DEG),
  c[2] + r * Math.cos(az * DEG) * Math.cos(el * DEG),
];

export const makeCamera = (pose: Pose, w = 1080, h = 1920) => {
  const c = new THREE.PerspectiveCamera(pose.fov, w / h, 0.1, 1200);
  c.position.set(...pose.pos);
  c.lookAt(new THREE.Vector3(...pose.target));
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
  return c;
};

export const project = (cam: THREE.PerspectiveCamera, p: V3, w = 1080, h = 1920): [number, number, boolean] => {
  const v = new THREE.Vector3(...p).project(cam);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h, v.z < 1];
};
