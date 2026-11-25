// EP05 camera: one continuous orbit rig over the map table. Every key sits on a word time from the
// locked voice (time.ts); between keys the pose eases (smootherstep), so each key is a soft landing,
// never an overshoot. A tiny seeded "alive" drift keeps held frames breathing. Key 0 is the approved
// cover pose (style/cover.json), so the opening frame matches the cover.
import * as THREE from "three";
import { COVER } from "./framing.ts";
import { W, WE, OUTRO_AT, VO_END, smooth, win } from "./time.ts";
import { CX, CY, wx, wz } from "./world.ts";
import { fleetP, routeC } from "./fleet.ts";

/** Map-km target (x east, y north), target height, orbit distance, pitch + yaw (rad), vertical fov. */
export type Pose = { x: number; y: number; h: number; d: number; p: number; yaw: number; fov: number };
const P = (x: number, y: number, h: number, d: number, p: number, yaw: number, fov = 36): Pose => ({ x, y, h, d, p, yaw, fov });

const C0 = P(COVER.target[0], COVER.target[1], COVER.targetY, COVER.d, COVER.pitch, COVER.yaw, COVER.fov);

export const KEYS: [number, Pose][] = [
  [0, C0],
  // hook: slow push toward the ridge while the line is spoken
  [WE("l01", "bukit"), P(0.4, 2.35, 0.25, 9.7, 0.64, -0.4)],
  // context: Constantinople overview, then the Golden Horn wall (1204), the land walls (1453 siege), the hadith card
  [W("l02", "direbut"), P(-1.7, -0.2, 0.05, 10.2, 0.88, 0.12)],
  [WE("l02", "utaranya"), P(-1.7, 0.75, 0.05, 7.6, 0.82, 0.02)],
  [W("l03", "mehmed"), P(-4.3, -0.1, 0.05, 8.6, 0.8, 0.28)],
  [WE("l03", "mengepungnya"), P(-4.4, 0.1, 0.05, 7.8, 0.82, 0.36)],
  [W("l04", "diriwayatkan"), P(-2.6, 1.4, 0.05, 9.6, 0.9, 0.12)],
  // main: the chain, from the Horn side; defenders in the foreground, the Ottoman fleet beyond
  [W("l05", "ditutup"), P(0.24, 0.2, 0.04, 3.4, 0.5, -0.95, 34)],
  [WE("l05", "galata"), P(0.12, 0.38, 0.04, 3.0, 0.46, -1.08, 34)],
  [W("l06", "pembela"), P(0.05, 0.42, 0.04, 4.3, 0.56, -0.86, 34)],
  [W("l06", "tertahan"), P(0.75, 0.8, 0.04, 5.2, 0.62, -0.92, 34)],
  // explanation: rise to the overview while the route draws, then the ridge, the greased track, the ships
  [W("l07", "rantai"), P(0.55, 0.9, 0.05, 6.4, 0.78, -0.62)],
  [WE("l08", "bosporus"), P(0.1, 1.8, 0.1, 9.4, 1.0, -0.22)],
  [W("l08", "setinggi"), P(0.6, 2.35, 0.15, 7.0, 0.55, 0.35)],
  [W("l08", "dilumasi"), P(1.1, 2.5, 0.15, 4.4, 0.6, -0.2, 34)],
  [W("l09", "dinaikkan"), P(1.62, 2.38, 0.12, 3.2, 0.6, -0.55, 34)],
  [W("l09", "sapi"), P(1.12, 2.6, 0.2, 3.0, 0.62, -0.45, 34)],
  [W("l10", "layarnya"), P(0.62, 2.62, 0.3, 2.9, 0.52, -0.3, 34)],
  [W("l10", "seolah"), P(0.42, 2.6, 0.3, 3.4, 0.5, -0.1, 34)],
  // payoff: crane up to a near top-down (ships like ants), sweep to the chain now behind the fleet,
  // the Horn walls, the whole city, the Venice inset, then pull back for the scale
  [W("l11", "tujuh"), P(-0.2, 1.75, 0.05, 9.4, 1.22, -0.3)],
  [W("l11", "belakang"), P(-0.75, 0.75, 0.05, 6.4, 0.7, 1.15)],
  [W("l12", "menjaga"), P(-1.5, 0.55, 0.05, 7.2, 0.86, 0.75)],
  [W("l12", "kota"), P(-1.4, 0.4, 0.05, 10.8, 1.0, 0.38)],
  [W("l13", "venesia"), P(-1.0, 0.9, 0.05, 11.4, 1.04, 0.12)],
  [WE("l13", "skalanya"), P(-0.6, 1.2, 0.05, 12.6, 1.08, 0.0)],
  // outro: rise over the whole table; the AUDIRA plaque on the map corner reads in frame
  [VO_END - 1.5, P(0.6, 1.9, 0.05, 14.2, 1.12, -0.08)],
  [OUTRO_AT + 3, P(0.6, 1.9, 0.05, 14.8, 1.13, -0.1)],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const poseAt = (t: number): Pose => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const [t0, a] = KEYS[i], [t1, b] = KEYS[i + 1];
  const u = smooth((t - t0) / (t1 - t0));
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (out[k] = lerp(a[k], b[k], u)));
  // explanation: follow the lead galley (ship 0) so the hauling stays centred whatever the fleet pace
  const w = win(t, W("l09", "dinaikkan") - 0.8, W("l11", "pagi") - 0.6, 1.4);
  if (w > 0) {
    const u = Math.min(1, Math.max(0, fleetP(t) + 0.045));
    const p = routeC().getPointAt(u);
    out.x = lerp(out.x, p.x + CX, w);
    out.y = lerp(out.y, -p.z + CY, w);
    out.h = lerp(out.h, p.y + 0.12, w);
  }
  // alive: a slow, small drift that is exactly zero at t = 0 (cover match)
  out.yaw += 0.025 * Math.sin(t * 0.23);
  out.d *= 1 + 0.012 * Math.sin(t * 0.17);
  return out;
};

/** World camera position + target for a pose. */
export const camWorld = (q: Pose) => {
  const target = new THREE.Vector3(wx(q.x), q.h, wz(q.y));
  const pos = new THREE.Vector3(
    target.x + q.d * Math.cos(q.p) * Math.sin(q.yaw),
    target.y + q.d * Math.sin(q.p),
    target.z + q.d * Math.cos(q.p) * Math.cos(q.yaw),
  );
  return { pos, target };
};

/** Camera basis (for camera-space cards): forward, right, up. */
export const camBasis = (q: Pose) => {
  const { pos, target } = camWorld(q);
  const m = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0));
  const quat = new THREE.Quaternion().setFromRotationMatrix(m);
  return { pos, quat };
};
