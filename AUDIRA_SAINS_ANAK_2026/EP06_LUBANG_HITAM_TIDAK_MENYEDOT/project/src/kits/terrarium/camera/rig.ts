// TERRARIUM camera — macro orbit around the jar: starts wide and a little high (whole jar + room), circles
// ~140° while descending and pushing in, ending at eye level with the snail. Also places the foreground leaf.
//
// One shot list (core/camera/moves.ts) so every kit shares one camera system. The old rig was one
// smooth function of time; its framing is sampled into keys every 1.5 s, so the look stays the same,
// and the last key lands on the 11.6 s framing so the orbit eases to rest on the snail.
import * as THREE from "three";
import { shotPlan, cameraAt, frame, framingFrom } from "../../../core/camera/moves.ts";

export type TerraPose = { position: [number, number, number]; target: [number, number, number]; fov: number };

const CLOCK = 60; // keys on a 60-units-per-second clock; the exported function takes seconds
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/** The snail's ground position at second t (mirrors snailAt in ../core/motion, which node cannot load). */
const snailXZ = (t: number) => {
  const k = smooth(t / 12) * 0.85 + (t / 12) * 0.15;
  return { x: lerp(0.18, -0.3, k), z: lerp(0.58, 0.12, k) + Math.sin(k * 3.2) * 0.05 };
};

/** The orbit framing at second t: circling, descending and pushing in, then drifting onto the snail. */
const orbitFraming = (t: number) => {
  const ang = 0.45 + t * 0.2;
  const r = 6.4 - 2.9 * seg(t, 0.5, 11.5);
  const y = 2.7 - 1.75 * seg(t, 0, 11);
  const sn = snailXZ(t);
  const k = seg(t, 5, 11.5);
  return framingFrom(
    [Math.sin(ang) * r, y, Math.cos(ang) * r],
    [lerp(0, sn.x * 0.75, k), lerp(1.35, 0.72, seg(t, 0, 11)), lerp(0, sn.z * 0.75, k)],
    34,
  );
};

// [film second, orbit second]
const BEATS: [number, number][] = [[1.5, 1.5], [3, 3], [4.5, 4.5], [6, 6], [7.5, 7.5], [9, 9], [10.5, 10.5], [12, 11.6]];
const RIG = shotPlan(CLOCK, orbitFraming(0), BEATS.map(([at, o]) => ({ at, move: frame(orbitFraming(o)) })));

const LENS = { aperture: 0, maxBlur: 0, exposure: 1 };

export const getTerraCamera = (t: number): TerraPose => {
  const shot = cameraAt(RIG, clamp(t, 0, 12) * CLOCK, CLOCK, { lens: LENS, alive: true });
  return { position: shot.pos, target: shot.target, fov: shot.fov };
};

/** Foreground fern frond: fixed in the lens' lower-left corner, ~1.1 units in front of the camera. */
export const leafPose = (t: number) => {
  const p = getTerraCamera(t);
  const cam = new THREE.PerspectiveCamera(p.fov, 9 / 16, 0.1, 100);
  cam.position.set(...p.position);
  cam.lookAt(...p.target);
  cam.updateMatrixWorld();
  const pos = new THREE.Vector3(-0.42, -0.62, -1.15).applyMatrix4(cam.matrixWorld);
  const q = cam.quaternion.clone();
  return { pos: [pos.x, pos.y, pos.z] as [number, number, number], quat: [q.x, q.y, q.z, q.w] as [number, number, number, number] };
};
