// EP09 "Memaafkan" (Cerita Hikmah S2, POLYVERSE, 16:9 landscape).
// One continuous pastel low-poly town. Every beat is keyed to the real voice timeline (T./E. clip ids).
//   hook: feathers over the town (flash-forward, title) → the town and the teacher's house on the hill
//   → confession on the porch → the teacher's order → the walk down to the square → the pillow torn,
//   feathers over roofs, fields, river and hill → "only half" → dusk search in the empty square
//   → hikmah over the town at dusk → AUDIRA outro.

import React, { useEffect, useState } from "react";
import { AbsoluteFill, Html5Audio, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import * as THREE from "three";
import { loadFont as loadSerif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/Quicksand";
import { fontReady } from "../../core/type/fonts.ts";
import { CameraRig, type Shot } from "../../core/render/Post.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { ToyPerson, poseAt, LEG_LENGTH, type Look, type Pose } from "./Person.tsx";
import { World, HILL, BRIDGE_X, TEACHER_HOUSE, heightAt, pathPoint, riverZ, skyColors } from "./World.tsx";
import { Feathers, SettledFeathers, DriftFeathers, HandFeathers } from "./Feathers.tsx";
import { PAL } from "./palette.ts";
import { CLIPS, E, T, TOTAL_SECONDS, captionAt, clamp, kv, lerp, lerp3, mouthOf, ramp, smooth, type V3 } from "./layout.ts";

const { fontFamily: SERIF } = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SANS } = loadSans("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

const UP = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------------------------------------
// Beats
const HOOK_END = T.s2a - 0.6;
const TEAR = T.s5e - 0.25; // the pillow rips; feathers burst
const RAISE = T.s5d + 0.4; // arms go up with the pillow
const PICKUP = T.s4g + 0.6; // the man takes the pillow from the porch bench
const BACK_UP = T.s6a - 0.3; // cut: he climbs back to the teacher
const DUSK_IN = T.s7a - 0.6; // cut: back to the square at sunset
const OUTRO = TOTAL_SECONDS - 3;

// ---------------------------------------------------------------------------------------------
// Places
const HY = heightAt(HILL.x, HILL.z) - 0.05;
const hillLocal = (x: number, y: number, z: number): V3 => {
  const v = new THREE.Vector3(x, y, z).applyAxisAngle(UP, TEACHER_HOUSE.heading);
  return [HILL.x + v.x, HY + v.y, HILL.z + v.z];
};
const groundY = (x: number, z: number) => {
  const bz = riverZ(BRIDGE_X);
  if (Math.abs(x - BRIDGE_X) < 0.85 && Math.abs(z - bz) < 3.1) {
    const u = (z - bz) / 6;
    return 0.2 + (0.25 - u * u) * 1.4 + 0.05;
  }
  const r = Math.hypot(x, z);
  if (r < 4.6) return 0.08;
  if (Math.abs(x) < 1.1 && z > -13 && z < 16) return 0.055;
  return Math.max(heightAt(x, z), 0.0);
};

const TEACHER_POS: V3 = hillLocal(0.3, 0.12, 1.3);
const CONF_XZ: [number, number] = [hillLocal(-0.25, 0, 2.75)[0], hillLocal(-0.25, 0, 2.75)[2]];
const CONF_POS: V3 = [CONF_XZ[0], groundY(CONF_XZ[0], CONF_XZ[1]), CONF_XZ[1]];
const headingTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const MAN_AT_TEACHER = headingTo(CONF_POS, TEACHER_POS);
const TEACHER_AT_MAN = headingTo(TEACHER_POS, CONF_POS);
const BENCH_POS: V3 = hillLocal(-0.85, 0.12, 1.15);
const TEAR_POS: V3 = [-1.5, 0.08, 2.3];
const TEAR_HEADING = -0.25;
const SEARCH_POS: V3 = [-0.1, 0.08, 2.75];

// ---------------------------------------------------------------------------------------------
// The man's route: [time, x, z] waypoints; he walks between them and stands still at repeats.
type WP = [number, number, number];
const pathWP = (t0: number, t1: number, u0: number, u1: number, n = 10): WP[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const [x, z] = pathPoint(lerp(u0, u1, i / n));
    return [lerp(t0, t1, i / n), x, z];
  });

const ROUTE: WP[] = [
  [0, TEAR_POS[0], TEAR_POS[2]],
  [HOOK_END, TEAR_POS[0], TEAR_POS[2]],
  // climbing to the teacher
  ...pathWP(HOOK_END + 0.01, T.s3a - 0.5, 0, 1, 16),
  [T.s3a - 0.1, CONF_XZ[0], CONF_XZ[1]],
  [PICKUP + 0.9, CONF_XZ[0], CONF_XZ[1]],
  // down the hill, across the bridge, through the north street into the square
  ...pathWP(PICKUP + 1.4, T.s5a + 2.8, 1, 0, 16),
  [T.s5a + 5.4, BRIDGE_X, riverZ(BRIDGE_X) + 3.2],
  [T.s5b + 1.8, 1.0, -6.0],
  [T.s5b + 5.6, 0.2, -4.4],
  [T.s5c + 1.6, -2.3, -1.4],
  [T.s5c + 4.4, TEAR_POS[0], TEAR_POS[2]],
  [BACK_UP, TEAR_POS[0], TEAR_POS[2]],
  // back up the hill (cut), then the porch again
  ...pathWP(BACK_UP + 0.01, T.s6b - 0.5, 0.62, 1, 6),
  [T.s6b - 0.1, CONF_XZ[0], CONF_XZ[1]],
  [DUSK_IN, CONF_XZ[0], CONF_XZ[1]],
  // dusk: into the square, feather to feather
  [DUSK_IN + 0.01, 0.15, -5.2],
  [T.s7b - 0.2, 0.75, 1.15],
  [T.s7b + 2.6, 0.75, 1.15],
  [T.s7b + 3.6, -0.45, 1.35],
  [T.s7c + 1, -0.45, 1.35],
  [T.s7c + 3, -2.2, 0.2],
  [T.s7c + 5.5, -2.2, 0.2],
  [T.s7d - 0.4, SEARCH_POS[0], SEARCH_POS[2]],
  [TOTAL_SECONDS, SEARCH_POS[0], SEARCH_POS[2]],
];

const manRoute = (t: number) => {
  let i = 1;
  while (i < ROUTE.length - 1 && ROUTE[i][0] < t) i++;
  const a = ROUTE[i - 1], b = ROUTE[i];
  const k = clamp((t - a[0]) / Math.max(1e-3, b[0] - a[0]));
  const x = lerp(a[1], b[1], k), z = lerp(a[2], b[2], k);
  const dist = Math.hypot(b[1] - a[1], b[2] - a[2]);
  const moving = dist > 0.05 && t > a[0] && t < b[0] && dist / (b[0] - a[0]) < 6; // >6 u/s = a cut
  const heading = moving ? Math.atan2(b[1] - a[1], b[2] - a[2]) : 0;
  return { pos: [x, groundY(x, z), z] as V3, moving, heading, speed: moving ? dist / (b[0] - a[0]) : 0 };
};

/** Standing heading when not walking. */
const standHeading = (t: number) => {
  if (t < HOOK_END) return TEAR_HEADING;
  if (t < T.s5a) return MAN_AT_TEACHER;
  if (t < BACK_UP) return TEAR_HEADING;
  if (t < DUSK_IN) return MAN_AT_TEACHER;
  if (t < T.s7d - 0.4) return 0.9;
  return 0.05;
};

// ---------------------------------------------------------------------------------------------
// Poses
const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const m3 = (x: V3, y: V3): V3 => lerp3(x, y, k);
  return {
    body: m3(a.body, b.body), lift: lerp(a.lift, b.lift, k), spine: m3(a.spine, b.spine), head: m3(a.head, b.head),
    ls: m3(a.ls, b.ls), le: lerp(a.le, b.le, k), rs: m3(a.rs, b.rs), re: lerp(a.re, b.re, k),
    lh: m3(a.lh, b.lh), lk: lerp(a.lk, b.lk, k), rh: m3(a.rh, b.rh), rk: lerp(a.rk, b.rk, k),
  };
};
const armsHold = (p: Pose): Pose => ({ ...p, ls: [-0.95, 0, 0.3], le: -1.25, rs: [-0.95, 0, -0.3], re: -1.25 });
const armsUp = (p: Pose, f: number): Pose => {
  const shake = Math.sin((f / 60) * 9) * 0.06;
  return { ...p, head: [-0.32, 0.1, 0], spine: [-0.08, 0, 0], ls: [-2.55 + shake, 0, 0.32], le: -0.4, rs: [-2.55 - shake, 0, -0.32], re: -0.4 };
};
const crouch = (p: Pose): Pose => ({
  ...p, lift: LEG_LENGTH * 0.62, spine: [0.75, 0, 0], head: [0.2, 0, 0],
  lh: [-1.35, 0, 0.12], lk: 2.0, rh: [-0.55, 0, -0.08], rk: 1.25,
  rs: [-1.05, 0, -0.08], re: -0.25, ls: [-0.4, 0, 0.25], le: -0.6,
});

const PICKS = [T.s7b + 1.4, T.s7b + 4.4, T.s7c + 2.4, T.s7c + 6.2];
const crouchWeight = (t: number) => Math.max(0, ...PICKS.map((p) => clamp(1 - Math.abs(t - p) / 1.0) * 1.25)) * (t > DUSK_IN ? 1 : 0);
const pickedCount = (t: number) => PICKS.filter((p) => t > p).length;

const LOOK_MAN: Partial<Look> = { skin: "#d09a6c", hair: "#2a1c14", top: "#6f86c9", bottom: "#4b4f5c", hairStyle: 0, build: 1.02, height: 1 };
const LOOK_TEACHER: Partial<Look> = { skin: "#c58f68", hair: "#ece6dc", top: "#efe3cc", bottom: "#a48b6c", hairStyle: 3, build: 1.08, height: 0.98 };
const MAN_SCALE = 1.25;
const TEACHER_SCALE = 1.22;

const manState = (t: number, f: number) => {
  const r = manRoute(t);
  const heading = r.moving ? r.heading : standHeading(t);
  const carrying = (t > PICKUP && t < RAISE) || false;
  let pose: Pose;
  if (r.moving) {
    const w = poseAt("walk", f * clamp(r.speed / 1.1, 0.9, 1.8), 4);
    pose = carrying ? armsHold(w) : w;
    if (t > DUSK_IN || (t > T.s2a && t < T.s3a)) pose = { ...pose, head: [0.28, 0, 0] }; // head bowed
  } else {
    let p = poseAt("stand", f, 4);
    if (t < HOOK_END) p = armsUp(p, f);
    else if (t < T.s5a) p = { ...p, head: [t < T.s4a ? 0.3 : 0.08, 0, 0] };
    else if (t < BACK_UP) {
      const up = ramp(t, RAISE, RAISE + 1.4) * (1 - ramp(t, TEAR + 6.5, TEAR + 8));
      const base = t < TEAR + 7 ? armsHold(p) : { ...armsHold(p), head: [-0.1, 0, 0] as V3 };
      p = mixPose(base, armsUp(p, f), up);
    } else if (t < DUSK_IN) p = { ...p, head: [t > T.s6d ? 0.32 : -0.05, 0, 0] };
    else p = { ...p, head: [0.38, 0, 0], rs: [-0.7, 0, -0.15], re: -1.0 };
    pose = mixPose(p, crouch(p), crouchWeight(t));
  }
  const mood = t < T.s4f ? -0.5 : t < T.s5h ? -0.2 : t < T.s6d ? 0.7 : -0.9;
  return { pos: r.pos, heading, pose, mood, talk: mouthOf("pria", t), carrying };
};

const teacherState = (t: number, f: number) => {
  let p = poseAt("stand", f, 9);
  // point toward the bed, then toward the town, while giving the order
  const point = ramp(t, T.s4b + 0.2, T.s4b + 0.8) * (1 - ramp(t, E.s4d - 0.4, E.s4d + 0.4));
  p = mixPose(p, { ...p, rs: [-1.35, 0.35, -0.3], re: -0.15 }, point);
  // the slow head shake: "not yet"
  const shake = ramp(t, T.s6d, T.s6d + 0.3) * (1 - ramp(t, E.s6d + 0.4, E.s6d + 0.9));
  p = { ...p, head: [0.06, p.head[1] * (1 - shake) + Math.sin((t - T.s6d) * 7) * 0.38 * shake, 0] };
  const smile = t > T.s4a && t < T.s4b + 2 ? 1 : t > T.s6d && t < E.s6f ? 0.3 : 0.6;
  return { pose: p, talk: mouthOf("guru", t), mood: smile };
};

// ---------------------------------------------------------------------------------------------
// Props
const PILLOW_HOLD = new THREE.Vector3(0, 0.66, 0.26);
const PILLOW_UP = new THREE.Vector3(0, 1.22, 0.16);
const toWorld = (local: THREE.Vector3, pos: V3, heading: number, scale: number): V3 => {
  const v = local.clone().multiplyScalar(scale).applyAxisAngle(UP, heading);
  return [pos[0] + v.x, pos[1] + v.y, pos[2] + v.z];
};
const TEAR_ORIGIN = toWorld(PILLOW_UP, TEAR_POS, TEAR_HEADING, MAN_SCALE);

const Pillow: React.FC<{ torn: number; empty: number; f: number }> = ({ torn, empty, f }) => {
  const wob = Math.sin((f / 60) * 9) * 0.05 * torn;
  const sy = 1 - empty * 0.7;
  return (
    <group rotation={[0.25 + wob, 0, 0.12 * torn]}>
      <mesh castShadow scale={[1, sy, 1]}>
        <RoundedBoxGeo args={[0.6, 0.16, 0.38]} radius={0.075} segments={3} />
        <meshPhysicalMaterial {...POLISH.fabric} color={PAL.pillow} flatShading />
      </mesh>
      {[-0.2, 0, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.081 * sy, 0]}>
          <boxGeometry args={[0.06, 0.004, 0.36]} />
          <meshStandardMaterial color={PAL.pillowStripe} />
        </mesh>
      ))}
      {torn > 0 && empty < 0.5 &&
        [[-0.08, 0.1, 0.02, 0.07], [0.04, 0.12, -0.03, 0.08], [0.13, 0.09, 0.05, 0.06], [-0.16, 0.08, -0.06, 0.05]].map(([x, y, z, r], i) => (
          <mesh key={`t${i}`} position={[x, y, z]} castShadow>
            <icosahedronGeometry args={[r, 0]} />
            <meshStandardMaterial color={PAL.cotton} flatShading roughness={0.95} />
          </mesh>
        ))}
    </group>
  );
};

const Man: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = manState(t, f);
  const handful = t > PICKS[0] ? Math.min(5, 1 + pickedCount(t)) : 0;
  // pillow: on the porch bench until PICKUP, then held, raised, torn, emptied
  let pillow: React.ReactNode = null;
  if (t < HOOK_END) {
    pillow = (
      <group position={PILLOW_UP.toArray() as V3}>
        <Pillow torn={1} empty={0} f={f} />
      </group>
    );
  } else if (t > PICKUP && t < BACK_UP) {
    const up = ramp(t, RAISE, RAISE + 1.4) * (1 - ramp(t, TEAR + 6.5, TEAR + 8));
    const p = new THREE.Vector3().lerpVectors(PILLOW_HOLD, PILLOW_UP, up);
    pillow = (
      <group position={p.toArray() as V3}>
        <Pillow torn={t > TEAR ? 1 : 0} empty={ramp(t, TEAR + 3, TEAR + 7)} f={f} />
      </group>
    );
  }
  return (
    <group position={s.pos} rotation={[0, s.heading, 0]}>
      <ToyPerson
        f={f} seed={4} outfit="casual" look={LOOK_MAN} poseOverride={s.pose} scale={MAN_SCALE}
        talk={s.talk} mood={s.mood} rightHand={handful > 0 ? <HandFeathers n={handful} /> : undefined}
      />
      <group scale={MAN_SCALE}>{pillow}</group>
    </group>
  );
};

const Teacher: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const s = teacherState(t, f);
  return (
    <group>
      <ToyPerson f={f} seed={9} outfit="casual" look={LOOK_TEACHER} poseOverride={s.pose} position={TEACHER_POS} heading={TEACHER_AT_MAN} scale={TEACHER_SCALE} talk={s.talk} mood={s.mood} beard="#ece6dc" />
      {/* porch bench with the pillow from his bed */}
      <group position={BENCH_POS} rotation={[0, TEACHER_HOUSE.heading, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.8, 0.06, 0.34]} />
          <meshStandardMaterial color={PAL.woodLight} flatShading />
        </mesh>
        {[-0.32, 0.32].map((x) => (
          <mesh key={x} position={[x, 0.09, 0]}>
            <boxGeometry args={[0.06, 0.18, 0.3]} />
            <meshStandardMaterial color={PAL.wood} flatShading />
          </mesh>
        ))}
        {t > HOOK_END && t < PICKUP && (
          <group position={[0, 0.31, 0]} scale={MAN_SCALE * 0.85}>
            <Pillow torn={0} empty={0} f={f} />
          </group>
        )}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------------------------
// Camera
const sh = (pos: V3, target: V3, fov = 32): Shot => ({ pos, target, fov, focus: 20, aperture: 0, maxBlur: 0, exposure: 1 });
const mv = (t: number, t0: number, t1: number, a: Shot, b: Shot): Shot => {
  const k = smooth((t - t0) / (t1 - t0));
  return sh(lerp3(a.pos, b.pos, k), lerp3(a.target, b.target, k), lerp(a.fov, b.fov, k));
};
const add = (a: V3, b: V3, s = 1): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const head = (p: V3, h: number): V3 => [p[0], p[1] + h, p[2]];

// porch geometry for the dialogue shots
const AX = new THREE.Vector3(TEACHER_POS[0] - CONF_POS[0], 0, TEACHER_POS[2] - CONF_POS[2]).normalize(); // man → teacher
const SIDE = new THREE.Vector3().crossVectors(UP, AX).normalize(); // to the man's left
const ax: V3 = [AX.x, 0, AX.z];
const side: V3 = [SIDE.x, 0, SIDE.z];
const MID: V3 = lerp3(CONF_POS, TEACHER_POS, 0.5);
const TEACHER_HEAD = head(TEACHER_POS, 1.08);

const twoShot = (dist: number, h: number, swing = 0): Shot => {
  const d = add(side, ax, swing - 0.65);
  return sh(add(head(MID, h), d, dist), head(MID, 0.85), 30);
};
/** Over the teacher's shoulder onto the man (closer = smaller dist). */
const onMan = (dist: number, fov = 28): Shot => sh(add(add(head(CONF_POS, 1.3), ax, dist * 0.5), side, 0.95), head(CONF_POS, 0.98), fov * 1.25);
const overMan = (dist: number, fov = 28): Shot => sh(add(add(head(CONF_POS, 1.32), ax, -dist), side, -0.5), TEACHER_HEAD, fov);

const front = (p: V3, heading: number, dist: number, h: number, look: number, fov = 30, swing = 0): Shot => {
  const fwd: V3 = [Math.sin(heading + swing), 0, Math.cos(heading + swing)];
  return sh(add(head(p, h), fwd, dist), head(p, look), fov);
};

const hookShot = (t: number): Shot => {
  const k = smooth(t / 12);
  return sh([lerp(-5.6, -4.8, k), lerp(4.9, 5.1, k), lerp(12.2, 11.6, k)], [lerp(0.2, 0.8, k), lerp(1.95, 2.1, k), lerp(-4.5, -5.0, k)], 33);
};

const cameraAt = (t: number): Shot => {
  const m = manRoute(t).pos;
  if (t < HOOK_END) return hookShot(t);
  // the town and the hill: high crane from the south toward the teacher's house
  if (t < T.s2d) return mv(t, HOOK_END, T.s2d, sh([-4, 15, 24], [2, 1, -8], 36), sh([1, 13, 4], [11, 4, -24], 34));
  // follow him up the path, the house ahead
  if (t < T.s3a - 0.2) {
    const k = ramp(t, T.s2d, T.s3a);
    return sh(add(m, [-3.4 + k * 0.6, 1.9, 2.6]), add(m, [1.2, 1.0 + k * 0.5, -2.4]), 30);
  }
  // confession: side two-shot, then over the teacher's shoulder onto the man, then push in
  if (t < T.s3c) return mv(t, T.s3a - 0.2, T.s3c, twoShot(4.6, 1.3, -0.15), twoShot(4.0, 1.2, -0.05));
  if (t < T.s3e) return mv(t, T.s3c, T.s3e, onMan(2.9, 28), onMan(2.6, 27));
  if (t < T.s4a) return mv(t, T.s3e, T.s4a, onMan(2.5, 24), onMan(2.4, 19));
  // the teacher answers
  if (t < T.s4b) return mv(t, T.s4a, T.s4b, twoShot(4.2, 1.2, 0.1), twoShot(4.0, 1.25, 0.15));
  if (t < T.s4e) return mv(t, T.s4b, T.s4e, overMan(1.0, 28), overMan(0.8, 25));
  if (t < T.s4f) return mv(t, T.s4e, T.s4f, sh(add(add(head(MID, 2.4), side, 6), ax, -3), head(MID, 1.0), 32), sh(add(add(head(MID, 2.6), side, 5.6), ax, -2.4), head(MID, 1.0), 32));
  if (t < T.s4g) return mv(t, T.s4f, T.s4g, onMan(2.3, 22), onMan(2.3, 20));
  // he walks down toward the town (seen from behind the teacher's house)
  if (t < T.s5a - 0.4) return mv(t, T.s4g, T.s5a - 0.4, sh(hillLocal(3.2, 6.5, -6.5), [6, 0, -10], 36), sh(hillLocal(2.6, 6.0, -5.8), [3, 0, -6], 34));
  // across the bridge: side tracking shot
  if (t < T.s5b) return sh(add(m, [5.8, 2.0, 1.2]), add(m, [0, 0.8, 0.4]), 30);
  // through the north street: the camera walks backwards in front of him
  if (t < T.s5c) return sh(add(m, [1.2, 1.7, 3.6]), add(m, [0, 1.0, 0]), 32);
  // arrival in the windy square
  if (t < T.s5d) return mv(t, T.s5c, T.s5d, sh([3.2, 4.8, 11.5], [-0.8, 1.0, 0.4], 32), sh([2.6, 4.2, 10.2], [-1.2, 1.0, 1.4], 30));
  // he raises the pillow and tears it
  if (t < TEAR + 0.1) return mv(t, T.s5d, TEAR + 0.1, front(TEAR_POS, TEAR_HEADING, 3.8, 1.2, 1.2, 30, 0.35), front(TEAR_POS, TEAR_HEADING, 3.2, 1.3, 1.45, 30, 0.35));
  // burst: pull back and crane up with the stream
  if (t < T.s5g - 0.3) return mv(t, TEAR + 0.1, T.s5g - 0.3, front(TEAR_POS, TEAR_HEADING, 5.2, 0.9, 1.15, 34, 0.35), sh([-7.2, 7.5, 13.5], [3.5, 4.5, -8], 34));
  // over the rooftops, the fields, the river and the hill
  if (t < T.s5h - 0.2) return mv(t, T.s5g - 0.3, T.s5h - 0.2, sh([-6, 12, 9], [8, 4, -14], 36), sh([4, 13, -2], [18, 3, -28], 36));
  // left with an empty pillowcase
  if (t < BACK_UP) return mv(t, T.s5h - 0.2, BACK_UP, front(TEAR_POS, TEAR_HEADING, 3.6, 1.25, 1.0, 30, -0.3), front(TEAR_POS, TEAR_HEADING, 3.0, 1.2, 1.05, 28, -0.3));
  // back up the hill, seen from the porch
  if (t < T.s6b) return sh(head(add(TEACHER_POS, ax, 0.6), 1.9), head(m, 0.9), 34);
  if (t < T.s6d) return mv(t, T.s6b, T.s6d, onMan(2.7, 27), onMan(2.5, 24));
  if (t < T.s6e) return mv(t, T.s6d, T.s6e, overMan(0.9, 24), overMan(0.8, 21));
  if (t < T.s6f) return mv(t, T.s6e, T.s6f, overMan(1.0, 25), overMan(0.9, 23));
  if (t < DUSK_IN) return mv(t, T.s6f, DUSK_IN, twoShot(4.2, 1.3, 0.05), twoShot(6.2, 2.2, 0.2));
  // dusk: the square, wide
  if (t < T.s7b) return mv(t, DUSK_IN, T.s7b, sh([3.5, 6.8, 13.5], [0, 0.8, -1.5], 32), sh([2.6, 5.6, 11.5], [0.2, 0.8, 0], 30));
  // close: he picks a feather from the paving
  if (t < T.s7c) return sh(add(m, [2.2, 1.0, 2.6]), add(m, [0, 0.45, 0]), 30);
  // what he cannot reach: roofs, the river, the sky
  if (t < T.s7c + 2.8) return mv(t, T.s7c, T.s7c + 2.8, sh([-2, 9.5, 5], [-5, 1.4, -7], 36), sh([2, 9.5, 5], [4, 1.4, -7.5], 36));
  if (t < T.s7c + 5.4) return mv(t, T.s7c + 2.8, T.s7c + 5.4, sh([7, 9, riverZ(7) - 9], [4, -0.3, riverZ(4) + 1], 40), sh([13, 9, riverZ(13) - 9], [10, -0.3, riverZ(10) + 1], 40));
  if (t < T.s7d) return mv(t, T.s7c + 5.4, T.s7d, sh([0, 2.6, 5], [4, 8, -12], 34), sh([0, 2.6, 5], [9, 11, -16], 34));
  // alone in the empty square
  if (t < T.s7e) return mv(t, T.s7d, T.s7e, sh([0, 14, 15], [0, 0, 0.5], 32), sh([0, 16, 16.5], [0, 0, 0.5], 32));
  // close, the handful of feathers
  if (t < T.s7f) return mv(t, T.s7e, T.s7f, front(SEARCH_POS, 0.05, 2.9, 1.0, 0.9, 28, 0.25), front(SEARCH_POS, 0.05, 2.5, 0.95, 0.9, 26, 0.25));
  if (t < T.s8a - 0.3) return mv(t, T.s7f, T.s8a - 0.3, front(SEARCH_POS, 0.05, 2.5, 0.95, 0.9, 26, 0.25), sh([1.5, 7, 12], [0, 1, 0], 32));
  // the lesson, over the town at dusk
  return mv(t, T.s8a - 0.3, OUTRO, sh([-6, 8, 15], [2, 2, -8], 34), sh([-2, 16, 25], [4, 4, -16], 34));
};

// ---------------------------------------------------------------------------------------------
const DUSK_KEYS: [number, number][] = [[0, 0], [T.s5h, 0.05], [T.s6a, 0.15], [T.s6f, 0.28], [T.s7a, 0.5], [T.s7d, 0.78], [T.s8a, 0.92], [TOTAL_SECONDS, 1]];

const Lights: React.FC<{ dusk: number }> = ({ dusk }) => {
  const sun = new THREE.Color("#fff0d6").lerp(new THREE.Color("#ff9466"), dusk);
  return (
    <>
      <hemisphereLight args={[new THREE.Color("#d7ebff").lerp(new THREE.Color("#8e86c9"), dusk), new THREE.Color("#b8d99a").lerp(new THREE.Color("#6b5a6e"), dusk), lerp(1.05, 0.55, dusk)]} />
      <ambientLight color="#fff1e6" intensity={lerp(0.35, 0.25, dusk)} />
      <directionalLight
        position={[lerp(-30, -40, dusk), lerp(34, 10, dusk), lerp(22, 10, dusk)]}
        color={sun}
        intensity={lerp(2.7, 1.5, dusk)}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
    </>
  );
};

const Scene: React.FC<{ t: number; f: number; frame: number }> = ({ t, f, frame }) => {
  const dusk = kv(t, DUSK_KEYS);
  const lit = ramp(t, T.s7b, T.s7d);
  const sky = skyColors(dusk);
  const shot = cameraAt(t);
  const burst = t >= TEAR && t < BACK_UP;
  return (
    <>
      <CameraRig shot={shot} near={0.3} far={900} />
      <fog attach="fog" args={[sky.fog, 55, 240]} />
      <Lights dusk={dusk} />
      <World f={f} lit={lit} dusk={dusk} />
      <Man t={t} f={f} />
      <Teacher t={t} f={f} />
      {t < HOOK_END && <Feathers u={2.4 + t} origin={TEAR_ORIGIN} count={4000} />}
      {burst && <Feathers u={t - TEAR} origin={TEAR_ORIGIN} count={4000} />}
      {t >= BACK_UP && <SettledFeathers t={t} picked={pickedCount(t)} />}
      {t >= T.s8a - 0.3 && <DriftFeathers t={t} center={lerp3([-3, 7, 10], [0, 13, 18], ramp(t, T.s8a, OUTRO))} size={16} />}
      <Finish frame={frame} background={`#${sky.mid.getHexString()}`} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={lerp(0.92, 1.0, dusk)} envIntensity={0.3} aoRadius={0.5} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Overlays (laid out on a 1920 × 1080 page)
const SPEAKERS: Record<string, { name: string; color: string }> = {
  narator: { name: "Narator", color: "#f4b08e" },
  pria: { name: "Sang Pria", color: "#93b4ee" },
  guru: { name: "Sang Guru", color: "#ecc873" },
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [0.3, 1.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * interpolate(t, [HOOK_END - 1.2, HOOK_END - 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(t, [0.3, 1.6], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1250, height: 560, opacity: a, background: "radial-gradient(ellipse 72% 70% at 22% 30%, rgba(253,246,236,0.82) 0%, rgba(253,246,236,0.55) 45%, rgba(253,246,236,0) 100%)" }} />
      <div style={{ position: "absolute", left: 104, top: 92, opacity: a, transform: `translateY(${y}px)`, color: PAL.ink }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 54, height: 4, borderRadius: 2, background: PAL.accent }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 9, textTransform: "uppercase" }}>Cerita Hikmah</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 168, lineHeight: 1.0, marginTop: 10, letterSpacing: -1, textShadow: "0 2px 18px rgba(255,248,236,0.55)" }}>Memaafkan</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, marginTop: 14, color: PAL.inkSoft, letterSpacing: 0.5 }}>Sebuah bantal, ribuan bulu, dan angin</div>
      </div>
    </>
  );
};

const HIKMAH_ID = "s8f";

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = captionAt(t);
  if (!c || t > OUTRO - 0.3 || c.id === HIKMAH_ID) return null;
  const sp = SPEAKERS[c.who];
  const a = interpolate(t, [c.start - 0.15, c.start + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * interpolate(t, [c.end + 0.25, c.end + 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 862, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ maxWidth: 1480, padding: "18px 34px 22px", borderRadius: 22, background: "rgba(24,36,54,0.72)", boxShadow: "0 8px 30px rgba(10,20,35,0.25)" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: sp.color, marginBottom: 6 }}>{sp.name}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, lineHeight: 1.22, color: "#f6f1e8" }}>
          {c.words.map((w, i) => {
            const active = t >= w.s && t <= w.e + 0.05;
            const spoken = t > w.e;
            const pop = active ? 1 + 0.06 * Math.sin(clamp((t - w.s) / Math.max(0.08, w.e - w.s)) * Math.PI) : 1;
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.28em", color: active ? sp.color : "#f6f1e8", opacity: active || spoken ? 1 : 0.55, transform: `scale(${pop})` }}>
                {w.w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** The hikmah line gets its own typographic moment over the town at dusk. */
const Hikmah: React.FC<{ t: number }> = ({ t }) => {
  const c = CLIPS.find((x) => x.id === HIKMAH_ID)!;
  const a = interpolate(t, [c.start - 0.3, c.start + 0.4, OUTRO - 0.6, OUTRO], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  const rise = interpolate(t, [c.start - 0.3, c.start + 1.2], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
    <div style={{ position: "absolute", inset: 0, opacity: a, background: "radial-gradient(ellipse 60% 42% at 50% 42%, rgba(40,30,70,0.42) 0%, rgba(40,30,70,0) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: a, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 10, color: "#ffe6c8", textTransform: "uppercase", textShadow: "0 2px 14px rgba(30,20,50,0.5)" }}>Hikmah</div>
      <div style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 1.1, color: "#fff8ee", marginTop: 18, textShadow: "0 4px 30px rgba(40,25,60,0.55)" }}>
        {c.words.map((w, i) => (
          <span key={i} style={{ opacity: t >= w.s - 0.05 ? 1 : 0.25, marginRight: "0.25em", display: i === 1 ? "inline" : "inline" }}>
            {w.w}
            {i === 1 ? <br /> : null}
          </span>
        ))}
      </div>
    </div>
    </>
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  const a = interpolate(t, [OUTRO, OUTRO + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 400 }} />
      <div style={{ marginTop: 44, color: "#E8F2EC", fontFamily: SANS, fontSize: 34, letterSpacing: 3, fontWeight: 600 }}>Created by Agus Dwi R.</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const f = t * 60;
  const [handle] = useState(() => delayRender("ep09 fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([fontReady(), document.fonts.ready]).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const s = width / 1920;
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.skyMid }}>
      {ready ? (
        <>
          {t < OUTRO + 0.6 && (
            <ThreeCanvas
              width={width}
              height={height}
              shadows={{ type: PCFShadowMap }}
              dpr={1}
              gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
              camera={{ fov: 33, near: 0.3, far: 900, position: [0, 5, 20] }}
            >
              <Scene t={t} f={f} frame={frame} />
            </ThreeCanvas>
          )}
          <div style={{ position: "absolute", inset: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
            <Title t={t} />
            <Hikmah t={t} />
            <Captions t={t} />
            <Outro t={t} />
          </div>
        </>
      ) : null}
      <Html5Audio src={staticFile("audio/ep09/full.wav")} />
      <AudiraSignature seed="cerita-hikmah-ep09" handle="@audira" />
    </AbsoluteFill>
  );
};
