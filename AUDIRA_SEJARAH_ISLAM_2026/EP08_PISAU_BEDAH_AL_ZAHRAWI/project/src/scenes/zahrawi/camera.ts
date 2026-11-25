// EP08 camera: one continuous orbit rig over the studio table (book, map plate behind it, instrument
// tray to the right). Every key sits on a word time from the locked voice (time.ts); between keys the
// pose eases with smootherstep, so each key is a soft landing (no overshoot). Key 0 is the approved
// cover framing (style/cover.json) so the film opens on the cover picture.
import * as THREE from "three";
import { COVER } from "./framing.ts";
import { OUTRO_AT, TOTAL, VO_END, W, WE, smooth } from "./time.ts";
import { CITY, MAP, TRAY, geo } from "./world.ts";

const MX = MAP.cx;

export type Pose = { x: number; y: number; z: number; d: number; p: number; yaw: number; fov: number };
const P = (x: number, y: number, z: number, d: number, p: number, yaw: number, fov = 34): Pose => ({ x, y, z, d, p, yaw, fov });

const C0 = P(COVER.target[0], COVER.target[1], COVER.target[2], COVER.d, COVER.pitch, COVER.yaw, COVER.fov);
const K = geo(CITY.kordoba[0], CITY.kordoba[1]);
const TO = geo(CITY.toledo[0], CITY.toledo[1]);

export const KEYS: [number, Pose][] = [
  [0, C0],
  // hook: slow push on the hero scalpel while "digambar dengan tinta" is spoken
  [W("l01", "digambar"), P(-1.7, 1.0, -1.1, 10.0, 0.9, 0.18)],
  // context: glide back over the book to the map plate (Iberia), then Kordoba, then the arcade
  [W("l02", "al-zahrawi"), P(-1.6 + MX, 0.1, -6.8, 13.0, 0.84, 0.04)],
  [W("l02", "albucasis"), P(-2.5 + MX, 0.1, -6.3, 10.8, 0.68, -0.32)],
  [W("l03", "kordoba"), P(K[0] + 0.1, 0.1, K[2] - 0.25, 7.2, 0.76, -0.06)],
  [W("l03", "madinat"), P(K[0] - 0.25, 0.2, K[2] - 0.1, 3.9, 0.66, 0.22)],
  // main: back to the book (± 1000), the 30 part tabs, the last tab, the plate drawn figure by figure,
  // the tools rising as they are named, then the right page (anatomy first)
  [W("l04", "1000"), P(-0.2, 0.5, -0.8, 10.2, 0.95, 0.1)],
  [W("l04", "tiga"), P(1.7, 0.45, -2.3, 6.4, 0.6, 0.0)],
  [W("l04", "bedah"), P(2.75, 0.6, -2.35, 4.4, 0.52, -0.22)],
  [W("l05", "digambar"), P(-1.7, 0.25, -0.1, 8.2, 1.2, 0.02)],
  [W("l05", "pisau"), P(-1.7, 0.7, 0.0, 8.0, 0.98, 0.1)],
  [W("l05", "kauter"), P(-1.6, 0.7, 0.2, 7.6, 0.94, -0.06)],
  [W("l06", "dokter"), P(2.0, 0.3, -0.9, 7.8, 0.62, -0.55)],
  // explanation: the tray; knife in its sheath; scissors; gut thread spool; silk + oud strings
  [W("l07", "modern"), P(TRAY.x, 0.2, TRAY.z, 7.6, 1.0, 0.0)],
  [W("l07", "pisau"), P(TRAY.x - 0.15, 0.15, TRAY.z - 1.25, 4.6, 0.72, 0.1)],
  [W("l07", "gunting"), P(TRAY.x + 0.9, 0.15, TRAY.z + 0.1, 5.0, 0.72, -0.1)],
  [W("l08", "benangnya"), P(4.4, 0.4, 0.9, 4.4, 0.55, 0.25)],
  [W("l08", "tertua"), P(4.4, 0.4, 0.9, 3.9, 0.5, 0.4)],
  [W("l09", "darah"), P(7.0, 0.3, -2.1, 6.4, 0.84, -0.12)],
  // rise to an overview of the whole table (book, tray, map all lit) before gliding to the map
  [W("l10", "gerard"), P(2.0, 0.1, -6.3, 12.6, 1.18, -0.05)],
  // payoff: rise back to the map; Kordoba → Toledo; the whole route to Salerno and Montpellier
  [W("l10", "latin"), P(TO[0] + 0.9, 0.1, TO[2] + 0.1, 11.2, 0.98, 0.0)],
  [W("l11", "ahli"), P(0.3 + MX, 0.1, -6.9, 15.6, 1.05, 0.0)],
  [W("l11", "200"), P(0.3 + MX, 0.1, -6.9, 14.6, 1.02, 0.07)],
  [W("l11", "eropa"), P(-1.0, 0.35, -0.6, 9.8, 1.0, 0.05)],
  // outro: wide over the right page and the tray; the AUDIRA plaque reads in frame
  [WE("l12", "eropa"), P(4.0, 0.2, 1.0, 12.2, 0.98, 0.0)],
  [VO_END, P(4.6, 0.2, 1.4, 10.6, 0.94, -0.04)],
  [Math.max(TOTAL, OUTRO_AT + 3), P(4.6, 0.2, 1.4, 10.3, 0.94, -0.05)],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const poseAt = (t: number): Pose => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const [t0, a] = KEYS[i], [t1, b] = KEYS[i + 1];
  const u = smooth((t - t0) / (t1 - t0));
  const out = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (out[k] = lerp(a[k], b[k], u)));
  // alive: slow, small drift that is exactly zero at t = 0 (cover match)
  out.yaw += 0.02 * Math.sin(t * 0.23);
  out.d *= 1 + 0.01 * Math.sin(t * 0.17);
  return out;
};

export const camWorld = (q: Pose) => {
  const target = new THREE.Vector3(q.x, q.y, q.z);
  const pos = new THREE.Vector3(
    q.x + q.d * Math.cos(q.p) * Math.sin(q.yaw),
    q.y + q.d * Math.sin(q.p),
    q.z + q.d * Math.cos(q.p) * Math.cos(q.yaw),
  );
  return { pos, target };
};

/** Screen position (layout px, 1080 × 1920) of a world point for a pose; null when behind the camera. */
const scratch = new THREE.PerspectiveCamera();
export const project = (q: Pose, p: [number, number, number], w = 1080, h = 1920): [number, number] | null => {
  const { pos, target } = camWorld(q);
  scratch.fov = q.fov;
  scratch.aspect = w / h;
  scratch.near = 0.05;
  scratch.far = 120;
  scratch.position.copy(pos);
  scratch.lookAt(target);
  scratch.updateProjectionMatrix();
  scratch.updateMatrixWorld(true);
  const v = new THREE.Vector3(...p).project(scratch);
  if (v.z > 1) return null;
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
};
