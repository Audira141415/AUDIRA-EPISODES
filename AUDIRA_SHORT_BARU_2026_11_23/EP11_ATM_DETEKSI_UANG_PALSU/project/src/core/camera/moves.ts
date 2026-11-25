// Camera moves for Remotion + React Three Fiber films: a shot list written in seconds and in film
// language (push in, orbit, crane, reveal...), compiled into one C1 keyframe track so every move hands
// over to the next without a kink. Built on director.ts (spherical rig) and track.ts.
//
// Why: measured with npm run audit:camera, finals lose points for a parked camera (whole seconds
// with no movement), long holds, and jerks where one ad-hoc lerp stops and the next starts. Here every
// beat is a key on one Catmull-Rom track (no velocity jump between moves), and `alive` adds a slow,
// seeded drift so a held frame still breathes (parallax) without looking like handheld shake.
//
//   const RIG = shotPlan(fps, { target: [0, 1, 0], az: 25, el: 18, dist: 30, fov: 32 }, [
//     { at: 0,   move: hold() },              // hook: the cover framing (use coverPose from the cover)
//     { at: 0.8, move: pushIn(0.7) },         // move toward the subject
//     { at: 3.5, move: orbit(-35) },          // reveal its side
//     { at: 6,   move: crane(18, 0.5) },      // rise for the overview
//     { at: 9,   move: settle() },            // land and stay readable
//   ]);
//   const shot = cameraAt(RIG, frame, fps, { lens: LENS, alive: true });   // -> <CameraRig shot={shot} />

import { sample, type Key } from "../motion/track.ts";
import type { Shot } from "../render/Post.tsx";
import { computeDollyZoomFov, getHandheldDrift, type HandheldConfig } from "./handheld.ts";

const D = Math.PI / 180;

/** A camera framing: what it looks at, from which direction, how far, and the lens. */
export type Framing = {
  target: [number, number, number];
  /** Degrees around the target (0 = in front on +z). */
  az: number;
  /** Degrees above the target's horizon. */
  el: number;
  /** World units from the target. */
  dist: number;
  /** Vertical field of view in degrees, authored for 9:16 (FormatFov converts for 16:9). */
  fov: number;
  /** Camera roll in degrees (Dutch angle). */
  roll?: number;
};

/** A move turns the framing at the end of the previous beat into the framing at this beat. */
export type Move = ((prev: Framing) => Framing) & { hold?: boolean; label?: string };

const mk = (label: string, f: (p: Framing) => Framing, hold = false): Move => Object.assign(f, { label, hold });

/** Keep the framing (a held key: eases in and out). */
export const hold = () => mk("hold", (p) => ({ ...p }), true);
/** Same as hold, used to name the landing of a move. */
export const settle = () => mk("settle", (p) => ({ ...p }), true);
/** Move toward the target: distance × factor (0.7 = 30 % closer). */
export const pushIn = (factor = 0.7) => mk("pushIn", (p) => ({ ...p, dist: p.dist * factor }));
/** Move away from the target: distance × factor (1.4 = 40 % further). */
export const pullOut = (factor = 1.4) => mk("pullOut", (p) => ({ ...p, dist: p.dist * factor }));
/** Circle around the target by `deg` degrees (positive = counter-clockwise seen from above). */
export const orbit = (deg: number) => mk("orbit", (p) => ({ ...p, az: p.az + deg }));
/** Change height: elevation by `deg`, optionally raise the target by `rise` units. */
export const crane = (deg: number, rise = 0) =>
  mk("crane", (p) => ({ ...p, el: Math.max(-80, Math.min(85, p.el + deg)), target: [p.target[0], p.target[1] + rise, p.target[2]] }));
/** Slide camera and target together (a dolly/truck move) by [dx, dy, dz]. */
export const truck = (dx: number, dy = 0, dz = 0) =>
  mk("truck", (p) => ({ ...p, target: [p.target[0] + dx, p.target[1] + dy, p.target[2] + dz] }));
/** Turn attention to a new subject; distance and lens may change with it. */
export const lookAt = (target: [number, number, number], over: Partial<Omit<Framing, "target">> = {}) =>
  mk("lookAt", (p) => ({ ...p, ...over, target }));
/** Go to an absolute framing (any fields given replace the previous ones). */
export const frame = (to: Partial<Framing>) => mk("frame", (p) => ({ ...p, ...to }));
/** Wide reveal: pull back and rise in one move. */
export const reveal = (factor = 1.8, rise = 10) => mk("reveal", (p) => ({ ...p, dist: p.dist * factor, el: Math.min(85, p.el + rise) }));
/** Vertigo: distance × factor while the lens compensates, so the subject keeps its size. */
export const dollyZoom = (factor = 0.6) =>
  mk("dollyZoom", (p) => ({ ...p, dist: p.dist * factor, fov: computeDollyZoomFov(p.dist * factor, p.dist, p.fov) }));
/** Tilt the horizon to `deg` (Dutch angle) or back to 0. */
export const dutch = (deg: number) => mk("dutch", (p) => ({ ...p, roll: deg }));

export type Beat = { at: number; move: Move };

/** Track channels: target x, y, z, azimuth, elevation, distance, fov, roll. */
const toKey = (f: number, x: Framing, holdKey: boolean): Key => ({
  f,
  v: [x.target[0], x.target[1], x.target[2], x.az, x.el, x.dist, x.fov, x.roll ?? 0],
  hold: holdKey,
});

/**
 * Compile a shot list into one keyframe track. `start` is the framing at second 0 (use the cover's
 * pose so the hook opens on the approved thumbnail). Beats are reached at their `at` second; between
 * beats the camera keeps moving on a C1 curve. A hold/settle beat eases to rest.
 */
export function shotPlan(fps: number, start: Framing, beats: Beat[]): Key[] {
  const sorted = [...beats].sort((a, b) => a.at - b.at);
  let cur: Framing = { roll: 0, ...start };
  const out: Key[] = [];
  const first = sorted[0];
  if (!first || first.at > 0) out.push(toKey(0, cur, true));
  for (const b of sorted) {
    cur = { roll: 0, ...b.move(cur) };
    const f = Math.round(b.at * fps);
    if (out.length && out[out.length - 1].f === f) out[out.length - 1] = toKey(f, cur, !!b.move.hold);
    else out.push(toKey(f, cur, !!b.move.hold));
  }
  return out;
}

export type CameraOptions = {
  lens: { aperture: number; maxBlur: number; exposure: number };
  /**
   * Seeded slow drift (degrees of azimuth and a little distance) so held framings still show
   * parallax: a "parked" camera is what audit:camera penalises. true = defaults, or tune it.
   */
  alive?: boolean | { deg?: number; breath?: number; seed?: number };
  /** Optional handheld micro-shake (handheld.ts), for documentary or tense beats only. */
  handheld?: HandheldConfig;
};

/** The camera Shot at `frame`, ready for <CameraRig shot={...} /> and <Post shot={...} />. */
export function cameraAt(rig: Key[], frame: number, fps: number, opts: CameraOptions): Shot {
  let [tx, ty, tz, az, el, dist, fov, roll] = sample(rig, frame);
  if (opts.alive) {
    const a = opts.alive === true ? {} : opts.alive;
    const t = frame / fps, s = a.seed ?? 7;
    az += (a.deg ?? 1.6) * (Math.sin(t * 0.21 + s) * 0.7 + Math.sin(t * 0.13 + s * 2.1) * 0.3);
    dist *= 1 + (a.breath ?? 0.012) * Math.sin(t * 0.17 + s * 0.7);
  }
  const pos: [number, number, number] = [
    tx + dist * Math.cos(el * D) * Math.sin(az * D),
    ty + dist * Math.sin(el * D),
    tz + dist * Math.cos(el * D) * Math.cos(az * D),
  ];
  let target: [number, number, number] = [tx, ty, tz];
  if (opts.handheld) {
    const d = getHandheldDrift(frame, opts.handheld);
    for (let i = 0; i < 3; i++) pos[i] += d.posOffset[i];
    // rotational drift applied as a small target offset at the subject's distance
    target = [tx + d.rotOffset[1] * dist, ty + d.rotOffset[0] * dist, tz];
    roll += d.rotOffset[2] / D;
  }
  return { pos, target, fov, roll: roll * D, focus: dist, ...opts.lens };
}

/**
 * Distance at which a subject of `height` × `width` world units fills `fill` of the frame, for the
 * render aspect (9:16 = 0.5625, 16:9 = 1.778) and a vertical fov in degrees. The tighter of the two
 * limits wins, so a wide subject in a 9:16 frame is not cropped at the sides.
 */
export function fitDistance(height: number, width: number, fovDeg: number, aspect = 9 / 16, fill = 0.7): number {
  const halfV = Math.tan((fovDeg * D) / 2);
  const byHeight = height / fill / 2 / halfV;
  const byWidth = width / fill / 2 / (halfV * aspect);
  return Math.max(byHeight, byWidth);
}

/**
 * Framing from a camera position and a look-at target (to port an existing rig, or a cover that was
 * staged with plain position/target). Azimuth 0 looks from +z, as in director.ts.
 */
export function framingFrom(pos: [number, number, number], target: [number, number, number], fov: number, roll = 0): Framing {
  const dx = pos[0] - target[0], dy = pos[1] - target[1], dz = pos[2] - target[2];
  const dist = Math.hypot(dx, dy, dz);
  return { target, az: Math.atan2(dx, dz) / D, el: Math.asin(dy / dist) / D, dist, fov, roll };
}

/** The framing the cover still used, so the film's first frame matches the approved thumbnail. */
export const coverPose = (f: Framing): Framing => ({ roll: 0, ...f });
