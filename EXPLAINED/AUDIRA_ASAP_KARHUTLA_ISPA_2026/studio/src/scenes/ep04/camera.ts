// EP04 film camera: one continuous rig around the hologram projector. Adjacent shots blend over
// ~0.8 s (dolly/crane between poses); the two hair cuts are hidden by a smoke wipe in the HUD.
import * as THREE from "three";
import { CUT, T, lerp, seg, SEC } from "./clock";
import { CALLOUT_LEAF, MOUTH, toWorld, type V3 } from "./lungModel";

export type Pose = { pos: V3; tgt: V3; fov: number };

const orbit = (ang: number, r: number, y: number, tgt: V3, fov: number): Pose => ({
  pos: [tgt[0] + Math.sin(ang) * r, y, tgt[2] + Math.cos(ang) * r],
  tgt,
  fov,
});
const mix = (a: Pose, b: Pose, k: number): Pose => ({
  pos: [lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k)],
  tgt: [lerp(a.tgt[0], b.tgt[0], k), lerp(a.tgt[1], b.tgt[1], k), lerp(a.tgt[2], b.tgt[2], k)],
  fov: lerp(a.fov, b.fov, k),
});

export const LEAF_W = toWorld(CALLOUT_LEAF.p);
export const MOUTH_W = toWorld(MOUTH);

/** Map plane (hologram screen above the projector). */
export const MAP = { w: 3.3, lon0: 95, lon1: 119.6, lat0: -6.4, lat1: 7.0, y: 0.15, tilt: -0.26 };
export const MAP_H = (MAP.w * (MAP.lat1 - MAP.lat0)) / (MAP.lon1 - MAP.lon0);
export const mapWorld = (lon: number, lat: number, lift = 0): V3 => {
  const x = ((lon - (MAP.lon0 + MAP.lon1) / 2) / (MAP.lon1 - MAP.lon0)) * MAP.w;
  const y = ((lat - (MAP.lat0 + MAP.lat1) / 2) / (MAP.lat1 - MAP.lat0)) * MAP_H;
  const c = Math.cos(MAP.tilt);
  const s = Math.sin(MAP.tilt);
  // local z = lift (towards the viewer), rotated about X
  return [x, MAP.y + y * c - lift * s, y * s + lift * c];
};

// ---------------------------------------------------------------- shots
const hook = (t: number) => {
  const p = orbit(-0.22 + t * 0.05, 7.1 - 0.55 * seg(t, 0.2, 9.5), 0.75 + 0.2 * seg(t, 5.5, 9.5), [0, 0.22 + 0.05 * seg(t, 5.5, 9.5), 0], 34);
  return p;
};
const map = (t: number) => {
  const pan = seg(t, T.riau - 0.6, T.kalimantan + 0.2);
  const back = seg(t, T.satuan - 0.2, T.satuan + 1.4);
  const tx = lerp(lerp(-0.08, 0.12, pan), 0.02, back);
  const z = lerp(lerp(8.6, 8.1, seg(t, CUT.map, T.riau)), 8.6, back);
  return { pos: [tx + 0.1, lerp(0.85, 1.0, back), z] as V3, tgt: [tx, 0.05, 0] as V3, fov: 46 };
};
const balita = (t: number) => orbit(0.2 + (t - CUT.balita) * 0.045, lerp(6.6, 5.7, seg(t, CUT.balita, CUT.chart)), 0.65, [0.12, 0.15, 0], 34);
const chart = (t: number) => {
  const k = (t - CUT.chart) / (CUT.memorial - CUT.chart);
  const up = seg(t, CUT.stack, CUT.stack + 1.6);
  return orbit(0.32 - 0.5 * k, lerp(lerp(6.4, 5.7, seg(t, CUT.chart, CUT.daily)), 6.1, up), lerp(0.05, 0.55, up), [0, lerp(-0.75, -0.6, up), 0], 38);
};
const memorial = (t: number) => {
  const k = seg(t, CUT.memorial, CUT.why);
  return { pos: [lerp(1.05, 0.55, k), lerp(-1.1, -1.28, k), lerp(3.4, 2.55, k)] as V3, tgt: [0.05, -1.6, 0] as V3, fov: 34 };
};
const why = (t: number) => {
  const k = seg(t, CUT.why + 0.2, CUT.hairIn + 0.05);
  const a = orbit(0.08, 6.4, 0.85, [0, 0.35, 0], 34);
  const b: Pose = { pos: [MOUTH_W[0], MOUTH_W[1] + 0.12, MOUTH_W[2] + 0.75], tgt: [MOUTH_W[0], MOUTH_W[1] - 0.15, MOUTH_W[2]], fov: 30 };
  return mix(a, b, k * k);
};
/** Hair macro world (hidden lungs). */
export const HAIR = { y: 0.85, tilt: -0.32, r: 0.9, cluster: [0.25, -1.05, 0.35] as V3 };
const hair = (t: number) => {
  const pull = seg(t, T.lebihDari - 0.3, T.sehelai + 0.2);
  const c = HAIR.cluster;
  const a: Pose = { pos: [c[0] + 0.15 - 0.15 * seg(t, CUT.hairIn, T.lebihDari), c[1] + 0.1, c[2] + 1.75 - 0.3 * seg(t, CUT.hairIn, T.lebihDari)], tgt: c, fov: 34 };
  const b: Pose = { pos: [0.3, -0.15, 8.3], tgt: [0.1, -0.12, 0], fov: 34 };
  return mix(a, b, pull);
};
const dive = (t: number) => {
  const k = seg(t, CUT.hairOut, T.ujung + 0.3);
  const a: Pose = { pos: [MOUTH_W[0] + 0.1, MOUTH_W[1] + 0.05, MOUTH_W[2] + 1.6], tgt: [0, 0.9, 0], fov: 34 };
  const b: Pose = { pos: [LEAF_W[0] + 0.6, LEAF_W[1] + 0.45, LEAF_W[2] + 3.6], tgt: [LEAF_W[0] - 0.25, LEAF_W[1] + 0.1, LEAF_W[2]], fov: 34 };
  return mix(a, b, k);
};
const compare = (t: number) => {
  const k = seg(t, CUT.compare, CUT.mask);
  return orbit(lerp(-0.08, 0.06, k), lerp(8.1, 7.8, k), 0.3, [0.05, -0.38, 0], 40);
};
const mask = (t: number) => {
  const k = seg(t, CUT.mask, CUT.room);
  const back = seg(t, T.balitaY - 0.3, T.balitaY + 1.0);
  return orbit(lerp(0.3, -0.05, k), lerp(lerp(5.0, 5.3, k), 5.9, back), lerp(0.75, 0.9, back), [0, lerp(0.0, 0.12, back), 0], 40);
};
const room = (t: number) => {
  const k = seg(t, CUT.room, CUT.outro);
  const warn = seg(t, T.bila - 0.2, T.bila + 1.2);
  return orbit(lerp(0.62, 0.3, k), lerp(5.6, 4.9, k) - 0.2 * warn, lerp(0.75, 0.55, k), [0, -1.05, 0], 40);
};
const outro = (t: number) => {
  const k = seg(t, CUT.outro, SEC.OUTRO[1] + 0.5);
  return orbit(-0.1 + (t - CUT.outro) * 0.04, lerp(6.2, 8.4, k), lerp(0.6, 0.5, k), [0, lerp(0.05, -0.82, k), 0], 34);
};

type Shot = { at: number; f: (t: number) => Pose; blend: number };
const SHOTS: Shot[] = [
  { at: 0, f: hook, blend: 0 },
  { at: CUT.map, f: map, blend: 0.9 },
  { at: CUT.balita, f: balita, blend: 0.9 },
  { at: CUT.chart, f: chart, blend: 0.8 },
  { at: CUT.memorial, f: memorial, blend: 0.9 },
  { at: CUT.why, f: why, blend: 0.9 },
  { at: CUT.hairIn, f: hair, blend: 0 },
  { at: CUT.hairOut, f: dive, blend: 0 },
  { at: CUT.compare, f: compare, blend: 0.9 },
  { at: CUT.mask, f: mask, blend: 0.9 },
  { at: CUT.room, f: room, blend: 0.9 },
  { at: CUT.outro, f: outro, blend: 0.9 },
];

export const camAt = (t: number): Pose => {
  let i = 0;
  while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].at) i++;
  const cur = SHOTS[i];
  const p = cur.f(t);
  if (i > 0 && cur.blend > 0 && t < cur.at + cur.blend) {
    const prev = SHOTS[i - 1].f(t);
    return mix(prev, p, seg(t, cur.at - 0.0, cur.at + cur.blend));
  }
  return p;
};

const _cam = new THREE.PerspectiveCamera();
const _v = new THREE.Vector3();
export const project = (t: number, p: V3, width: number, height: number) => {
  const pose = camAt(t);
  _cam.fov = pose.fov;
  _cam.aspect = width / height;
  _cam.near = 0.05;
  _cam.far = 100;
  _cam.position.set(...pose.pos);
  _cam.lookAt(...pose.tgt);
  _cam.updateMatrixWorld();
  _cam.updateProjectionMatrix();
  _v.set(...p).project(_cam);
  return { x: ((_v.x + 1) / 2) * width, y: ((1 - _v.y) / 2) * height };
};
