// Drives the R3F camera from a pose on every frame. Put it inside <ThreeCanvas>.
//
// Why: <ThreeCanvas camera={{ position, fov }}> only sets the camera when the canvas is created, and
// onCreated={({ camera }) => camera.lookAt(...)} runs once, so a rig passed that way never moves the
// camera after frame 0. 13 kit examples had that bug: their rigs were animated, their films were not.
// (npm run audit:camera still scored them 5/5 because the scenes themselves move; see audira-camera.)

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

export const PoseCamera: React.FC<{
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  fov?: number;
  /** Roll in radians (Dutch angle). */
  roll?: number;
}> = ({ position, target, fov, roll = 0 }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.position.set(position[0], position[1], position[2]);
    cam.up.set(Math.sin(roll), Math.cos(roll), 0);
    cam.lookAt(target[0], target[1], target[2]);
    if (fov !== undefined && cam.fov !== fov) cam.fov = fov;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
  });
  return null;
};
