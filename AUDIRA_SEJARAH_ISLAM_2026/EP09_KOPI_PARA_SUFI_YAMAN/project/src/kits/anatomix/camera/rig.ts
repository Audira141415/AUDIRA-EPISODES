// ANATOMIX camera — clinical orbit: opens close on the beating heart, pulls back as the wall turns translucent,
// keeps orbiting (never stops) and pushes in slightly for the payoff. Also exports a pure projector for HUD labels.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was one
// smooth function of time; its framing is sampled into keys every 1.5 s, so the look stays the same.
// The last key lands on the 11.6 s framing so the orbit eases out instead of braking in the final
// frames, and `alive` keeps it breathing. The HUD projector reads the same pose, so labels stay pinned.
import * as THREE from "three";
import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export type AnatomyPose = { position: [number, number, number]; target: [number, number, number]; fov: number };

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/** The orbit framing at second t. */
const orbitFraming = (t: number) => {
  const r = 6.3 + 1.3 * seg(t, 0, 3.8) - 0.6 * seg(t, 7.5, 12);
  const ang = -0.55 + t * 0.13;
  const y = 0.95 - 0.55 * seg(t, 0, 5) + 0.25 * seg(t, 8, 12);
  return framingFrom([Math.sin(ang) * r, y, Math.cos(ang) * r], [0.05, 0.22 - 0.1 * seg(t, 0, 4), 0], 34);
};

// [film second, orbit second]
const BEATS: [number, number][] = [[1.5, 1.5], [3, 3], [4.5, 4.5], [6, 6], [7.5, 7.5], [9, 9], [10.5, 10.5], [12, 11.6]];
const RIG = shotPlan(CLOCK, orbitFraming(0), BEATS.map(([at, o]) => ({ at, move: frame(orbitFraming(o)) })));

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getAnatomyCamera = (t: number): AnatomyPose => {
  const shot = cameraAt(RIG, clamp(t, 0, 12) * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};

/** Project a world point to pixel coordinates for the overlay (same pose as the 3D camera). */
export const projectToScreen = (t: number, p: [number, number, number], width: number, height: number) => {
  const pose = getAnatomyCamera(t);
  const cam = new THREE.PerspectiveCamera(pose.fov, width / height, 0.1, 100);
  cam.position.set(...pose.position);
  cam.lookAt(...pose.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, front: v.z < 1 };
};
