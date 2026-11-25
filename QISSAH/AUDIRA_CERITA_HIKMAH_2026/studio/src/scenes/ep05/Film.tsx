// KURA-KURA DAN KALAJENGKING (INKSTORY): staging, cameras, captions. Pure functions of film time.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont as loadBrush } from "@remotion/google-fonts/MaShanZheng";
import { loadFont as loadSerif } from "@remotion/google-fonts/ShipporiMinchoB1";
import { GEO, Scorpion, Turtle, type ScorpionPose, type TurtlePose } from "./Cast";
import { DOME_U, G, PAL, WATER_U, makeBlot } from "./ink";
import { Shafts, World } from "./World";
import { CLIPS, E, FILM_FPS, MID_X, ROCK, STONE, T, TOTAL_SECONDS, W, clamp, hash, kv, lerp, mouthOf, ramp, speaking, type Clip } from "./layout";

loadBrush("normal", { subsets: ["latin"], weights: ["400"] });
loadSerif("normal", { subsets: ["latin"], weights: ["500", "700", "800"] });
const BRUSH = "'Ma Shan Zheng', serif";
const SERIF = "'Shippori Mincho B1', serif";

type V3 = [number, number, number];

/* ================= key moments ================= */
const T_STING = W("s7a", "menyengat") + 0.05;
const T_TURN0 = E.s5c - 0.2; // turtle turns toward the far bank
const T_TURN1 = E.s5c + 0.9;
const T_CRAWL0 = T.s5d + 0.2;
const T_CRAWL1 = E.s5d + 0.4;
const T_SLIDE = E.s5d + 0.7; // into the water
const T_SWIM = T.s6a + 1.6;
const T_MID = T.s6d + 1.0;
const T_SINK0 = T.s7b + 0.8;
const T_SINK1 = E.s8f + 2.0;
const T_NAIK = W("s9f", "naik");
const T_TURUN = W("s9f", "turun");

/* ================= the turtle ================= */
const FACE_SCORP = Math.atan2(-(ROCK.z - STONE.z), ROCK.x - STONE.x);
const FACE_SCORP_FROM_ROCK = Math.atan2(-(STONE.z - ROCK.z), STONE.x - ROCK.x);

const turtleX = (t: number) =>
  kv(t, [
    [0, STONE.x],
    [T_SLIDE, STONE.x],
    [T_SWIM, STONE.x + 1.4],
    [T.s6b, STONE.x + 3.4],
    [T.s6c, STONE.x + 7.6],
    [T_MID, MID_X],
    [T_STING, MID_X + 0.35],
    [T_SINK1, MID_X + 1.2],
  ]);
const turtleY = (t: number) =>
  kv(t, [
    [0, STONE.top],
    [T_SLIDE, STONE.top],
    [T_SWIM, -0.15],
    [T_SINK0, -0.15],
    [T.s8a, -2.2],
    [T.s8c, -5.0],
    [E.s8e, -8.0],
    [T_SINK1, -15],
  ]);
const turtleZ = (t: number) => kv(t, [[0, STONE.z], [T_SLIDE, STONE.z], [T_MID, -0.7], [T_SINK1, -0.9]]);

const turtlePose = (t: number): TurtlePose => {
  const talk = mouthOf("kura", t);
  const yaw = kv(t, [
    [0, FACE_SCORP + 0.7],
    [T.s2e + 0.4, FACE_SCORP + 0.7],
    [T.s2e + 1.4, FACE_SCORP],
    [T_TURN0, FACE_SCORP],
    [T_TURN1, 0],
    [T_SINK0, 0],
    [T_SINK1, 0.5],
  ]);
  const swim = ramp(t, T_SLIDE, T_SWIM);
  const limp = ramp(t, T_STING + 0.3, T_STING + 3.5);
  const strokeRate = 2.3 * (1 - limp * 0.85);
  const sunning = 1 - ramp(t, T.s2e, T.s2e + 0.8);
  const shock = ramp(t, T.s3a - 0.15, T.s3a + 0.15) * (1 - ramp(t, E.s3a, E.s3a + 0.6));
  const think = ramp(t, T.s5a, T.s5a + 0.8) * (1 - ramp(t, T.s5c - 0.2, T.s5c + 0.4));
  const jolt = Math.exp(-Math.max(0, t - T_STING) * 5) * (t >= T_STING ? 1 : 0);
  const sinking = ramp(t, T_SINK0, T.s8a);
  return {
    pos: [turtleX(t), turtleY(t) + Math.sin(t * 2.3) * 0.012 * swim * (1 - sinking), turtleZ(t)],
    yaw,
    pitch: sinking * 0.28 + jolt * -0.12 + Math.sin(t * strokeRate) * 0.02 * swim,
    roll: sinking * 0.12 * Math.sin(t * 0.7),
    headOut: 1 - shock * 0.45 - limp * 0.15,
    headPitch: sunning * -0.2 + think * 0.18 + sinking * 0.15 + jolt * -0.5,
    headYaw: think * Math.sin(t * 0.8) * 0.15 + (speaking("kura", t) ? Math.sin(t * 2.1) * 0.05 : 0),
    jaw: Math.max(talk, jolt * 0.9),
    eyeClose: Math.max(sunning * 0.85, think * 0.75, limp * 0.4 * (1 - talk)),
    paddle: t * strokeRate,
    paddleAmt: swim,
    limp,
  };
};

/* ================= the scorpion ================= */
// riding: local to the turtle's shell group (origin = shell mount)
const RIDE = { x: 0.1, y: -0.02 };

const crawlPath: [number, V3][] = [
  [T_CRAWL0, [ROCK.x, ROCK.top, ROCK.z]],
  [T_CRAWL0 + 0.9, [ROCK.x + 0.3, ROCK.top - 0.22, ROCK.z - 0.15]],
  [T_CRAWL0 + 1.8, [ROCK.x + 0.55, STONE.top + 0.0, ROCK.z - 0.55]],
  [T_CRAWL0 + 2.9, [STONE.x - 0.45, STONE.top + 0.02, STONE.z + 0.15]],
  [T_CRAWL1, [STONE.x + 0.06 + 0.1, STONE.top + 0.37 - 0.02, STONE.z]],
];
const pathAt = (t: number): V3 => {
  for (let i = 1; i < crawlPath.length; i++) {
    const [t1, p1] = crawlPath[i];
    const [t0, p0] = crawlPath[i - 1];
    if (t <= t1) {
      const k = clamp((t - t0) / (t1 - t0));
      return [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)];
    }
  }
  return crawlPath[crawlPath.length - 1][1];
};

const scorpionPose = (t: number, riding: boolean): ScorpionPose => {
  const talk = mouthOf("kalajengking", t);
  const spk = speaking("kalajengking", t);
  const laugh = ramp(t, T.s3c, T.s3c + 0.3) * (1 - ramp(t, E.s3c + 0.6, T.s4a + 0.4));
  const peek = ramp(t, T.s2c, T.s2c + 0.6) * (1 - ramp(t, E.s2c + 0.3, T.s2d + 0.5));
  const raise = ramp(t, T.s6d, T.s6d + 2.2);
  const strike = clamp(ramp(t, T_STING - 0.12, T_STING + 0.08) - 0.6 * ramp(t, T_STING + 0.7, T_STING + 1.6));
  const droop = ramp(t, T.s8c, T.s8c + 1.2);
  const red = Math.max(raise * 0.55, ramp(t, T_STING - 0.2, T_STING) * (1 - 0.4 * ramp(t, T_STING + 2, T_STING + 8)));
  const common = {
    curl: 0.42 + raise * 0.12 + laugh * Math.sin(t * 14) * 0.05 + spk * Math.sin(t * 3) * 0.03,
    strike,
    red,
    claw: 0.15 + talk * 0.6 + laugh * Math.abs(Math.sin(t * 12)) * 0.5,
    clawRaise: spk * 0.6 + laugh * 0.5 - peek * 0.3,
    laugh: laugh * Math.abs(Math.sin(t * 13)),
    droop,
  };
  if (riding) {
    return { pos: [RIDE.x + strike * 0.04, RIDE.y, 0], scale: 1.3, yaw: 0, pitch: 0.12 + strike * 0.08 + droop * 0.1, walk: 0, walkAmt: 0, ...common };
  }
  const crawling = t >= T_CRAWL0 && t < T_CRAWL1;
  const p = t < T_CRAWL0 ? [ROCK.x, ROCK.top, ROCK.z] as V3 : pathAt(t);
  const p2 = pathAt(Math.min(T_CRAWL1, t + 0.1));
  const dirYaw = Math.atan2(-(p2[2] - p[2]), p2[0] - p[0]);
  const yaw = crawling ? dirYaw : kv(t, [[0, FACE_SCORP_FROM_ROCK - 0.5], [T.s2b + 1, FACE_SCORP_FROM_ROCK - 0.5], [T.s2d + 1.0, FACE_SCORP_FROM_ROCK]]);
  const descent = crawling ? clamp((p[1] - p2[1]) * 3) : 0;
  return {
    pos: p,
    scale: 1.3,
    yaw,
    pitch: descent * 0.5 + peek * 0.35,
    walk: t * 9,
    walkAmt: crawling ? 1 : peek * 0.3,
    ...common,
  };
};

/* ================= cameras ================= */
type Cam = { pos: V3; at: V3; fov: number };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const move = (t: number, t0: number, t1: number, a: Cam, b: Cam, e = (k: number) => k * k * (3 - 2 * k)): Cam => {
  const k = e(clamp((t - t0) / Math.max(0.01, t1 - t0)));
  return { pos: mix3(a.pos, b.pos, k), at: mix3(a.at, b.at, k), fov: lerp(a.fov, b.fov, k) };
};
const gentle = (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * k);

const cameraRaw = (t: number): Cam => {
  const tx = turtleX(t), ty = turtleY(t), tz = turtleZ(t);
  if (t < T.s2a) {
    return move(t, 0, T.s2a, { pos: [16, 7.5, 28], at: [9, 6.5, -60], fov: 42 }, { pos: [8, 3.6, 19], at: [2, 3.6, -60], fov: 40 }, gentle);
  }
  if (t < T.s2b) {
    return move(t, T.s2a, T.s2b, { pos: [8, 3.6, 19], at: [2, 3.6, -60], fov: 40 }, { pos: [-3.0, 1.35, 5.2], at: [-4.6, 0.05, 0.3], fov: 36 }, gentle);
  }
  if (t < T.s2d) {
    return move(t, T.s2b, T.s2d, { pos: [-3.7, 1.25, 2.6], at: [ROCK.x, ROCK.top + 0.02, ROCK.z], fov: 32 }, { pos: [-3.75, 1.05, 2.3], at: [ROCK.x + 0.15, ROCK.top - 0.05, ROCK.z - 0.1], fov: 30 });
  }
  if (t < T.s2e) {
    return move(t, T.s2d, T.s2e, { pos: [-2.4, 0.85, 2.6], at: [STONE.x + 0.1, 0.0, STONE.z], fov: 33 }, { pos: [-2.6, 0.75, 2.2], at: [STONE.x + 0.05, -0.02, STONE.z], fov: 31 });
  }
  if (t < T.s3a) {
    return move(t, T.s2e, T.s3a, { pos: [-2.7, 1.5, 4.6], at: [-3.95, 0.0, 0.25], fov: 36 }, { pos: [-2.8, 1.4, 4.2], at: [-3.95, 0.0, 0.25], fov: 35 });
  }
  if (t < T.s3c) {
    return move(t, T.s3a, T.s3c, { pos: [-2.8, 1.0, 2.1], at: [STONE.x - 0.35, 0.12, STONE.z + 0.1], fov: 34 }, { pos: [-2.9, 0.95, 1.9], at: [STONE.x - 0.35, 0.12, STONE.z + 0.1], fov: 32 });
  }
  if (t < T.s5a) {
    return move(t, T.s3c, T.s5a, { pos: [-3.5, 1.3, 2.9], at: [ROCK.x + 0.1, ROCK.top + 0.0, ROCK.z], fov: 32 }, { pos: [-3.8, 1.15, 2.3], at: [ROCK.x + 0.05, ROCK.top + 0.02, ROCK.z], fov: 29 });
  }
  if (t < T.s5c) {
    return move(t, T.s5a, T.s5c, { pos: [-2.25, 0.7, 1.9], at: [STONE.x - 0.25, 0.0, STONE.z + 0.1], fov: 32 }, { pos: [-2.5, 0.62, 1.45], at: [STONE.x - 0.3, 0.02, STONE.z + 0.15], fov: 29 });
  }
  if (t < T.s6a) {
    return move(t, T.s5c, T.s6a, { pos: [-2.4, 1.55, 4.3], at: [-3.8, 0.0, 0.1], fov: 37 }, { pos: [-2.2, 1.5, 4.0], at: [-3.5, 0.0, -0.1], fov: 36 });
  }
  if (t < T.s6d) {
    // the hand-scroll: the camera travels with them along the river
    const k1 = ramp(t, T.s6b - 0.5, T.s6b + 2.5), k2 = ramp(t, T.s6c - 0.5, T.s6c + 2.5);
    const base: Cam = { pos: [tx + 0.9, 1.3, tz + 4.4], at: [tx + 0.5, -0.05, tz], fov: 36 };
    const wide: Cam = { pos: [tx - 1.2, 3.4, tz + 10.5], at: [tx - 0.3, 0.8, tz - 2], fov: 38 };
    const low: Cam = { pos: [tx + 1.6, 0.45, tz + 2.8], at: [tx + 0.1, 0.12, tz], fov: 34 };
    const a = move(k1, 0, 1, base, wide, (k) => k);
    return move(k2, 0, 1, a, low, (k) => k);
  }
  if (t < T_STING + 0.5) {
    return move(t, T.s6d, T_STING, { pos: [tx + 1.6, 0.45, tz + 2.8], at: [tx + 0.1, 0.12, tz], fov: 34 }, { pos: [tx + 0.95, 0.62, tz + 1.55], at: [tx + 0.3, 0.3, tz], fov: 30 });
  }
  if (t < T.s8a) {
    const k = ramp(t, T_STING + 0.5, T_STING + 3.5);
    const k2 = ramp(t, T.s7b + 1.5, T.s8a);
    const top: Cam = { pos: [tx + 0.4, 3.0, tz + 3.4], at: [tx + 0.3, 0.0, tz - 0.2], fov: 36 };
    const a = move(k, 0, 1, { pos: [tx + 0.95, 0.62, tz + 1.55], at: [tx + 0.3, 0.3, tz], fov: 30 }, top, (x) => x);
    return move(k2, 0, 1, a, { pos: [tx + 0.6, ty - 0.1, tz + 2.6], at: [tx, ty + 0.05, tz], fov: 34 }, (x) => x);
  }
  if (t < E.s8f) {
    const close = ramp(t, T.s8d - 0.3, T.s8d + 0.8) * (1 - ramp(t, E.s8e, E.s8e + 1));
    const c: Cam = { pos: [tx + 0.6, ty + 0.15, tz + 2.6], at: [tx, ty + 0.15, tz], fov: 34 };
    const cl: Cam = { pos: [tx + 0.7, ty + 0.5, tz + 1.35], at: [tx + 0.1, ty + 0.35, tz], fov: 30 };
    return move(close, 0, 1, c, cl, (x) => x);
  }
  if (t < T.s9a + 1.5) {
    // hold while they sink away, then rise through the surface
    const hold: Cam = { pos: [MID_X + 1.9, -7.8, -0.6 + 2.6], at: [MID_X + 1.2, -9.5, -0.8], fov: 36 };
    const rise: Cam = { pos: [MID_X + 1.0, 1.4, 6.0], at: [MID_X + 1.0, 0.2, -6], fov: 38 };
    const k = ramp(t, E.s8f + 1.4, T.s9a + 1.5, gentle);
    return move(k, 0, 1, hold, rise, (x) => x);
  }
  if (t < T.s9c) {
    return move(t, T.s9a + 1.5, T.s9c, { pos: [MID_X + 1.0, 1.4, 6.0], at: [MID_X + 1.0, 0.2, -6], fov: 38 }, { pos: [MID_X - 1, 3.2, 14], at: [MID_X - 2, 3.5, -60], fov: 40 });
  }
  if (t < T.s9e) {
    return move(t, T.s9c, T.s9e, { pos: [MID_X - 1, 3.2, 14], at: [MID_X - 2, 3.5, -60], fov: 40 }, { pos: [MID_X + 5, 3.6, 13], at: [MID_X + 6, 3.8, -60], fov: 40 }, (x) => x);
  }
  // "naik" lifts the gaze to the peaks, "turun" drops it to the water, then rest on the whole painting
  const up = ramp(t, T_NAIK - 0.3, T_NAIK + 0.9) * (1 - ramp(t, T_TURUN - 0.4, T_TURUN + 0.9));
  const down = ramp(t, T_TURUN - 0.4, T_TURUN + 0.9) * (1 - ramp(t, E.s9f + 1.2, E.s9f + 4.5));
  const base: Cam = { pos: [MID_X + 5.5, 3.6 + (t - T.s9e) * 0.05, 13], at: [MID_X + 6.5, 3.8, -60], fov: 40 };
  return {
    pos: [base.pos[0], base.pos[1] + up * 3 - down * 2.4, base.pos[2]],
    at: [base.at[0], base.at[1] + up * 22 - down * 9, base.at[2]],
    fov: base.fov,
  };
};

// first-pass shots were too tight for 9:16: back every story shot off along its own line of sight
const camera = (t: number): Cam => {
  const c = cameraRaw(t);
  const k = t >= T.s2b && t < T.s6a ? 1.3 : t >= T.s6a && t < E.s8f ? 1.6 : 1;
  if (k === 1) return c;
  return { ...c, pos: [c.at[0] + (c.pos[0] - c.at[0]) * k, c.at[1] + (c.pos[1] - c.at[1]) * k, c.at[2] + (c.pos[2] - c.at[2]) * k] };
};

const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera: c } = useThree();
  useLayoutEffect(() => {
    const pc = c as THREE.PerspectiveCamera;
    pc.position.set(...cam.pos);
    pc.lookAt(new THREE.Vector3(...cam.at));
    pc.fov = cam.fov;
    pc.near = 0.05;
    pc.far = 800;
    pc.updateProjectionMatrix();
  }, [c, cam]);
  return null;
};

/* ================= ink in the water: sting splash, red clouds, bubbles ================= */
const neckWorld = (t: number): V3 => {
  const p = turtlePose(t);
  return [p.pos[0] + 0.5 * Math.cos(p.yaw), p.pos[1] + 0.18, p.pos[2] - 0.5 * Math.sin(p.yaw)];
};
const CLOUDS = Array.from({ length: 16 }, (_, i) => ({ dt: 1.2 + i * 1.15 + hash(i) * 0.6, dx: (hash(i * 3) - 0.5) * 0.6, dz: (hash(i * 7) - 0.5) * 0.4, s: 0.5 + hash(i * 11) * 0.6 }));
const BUBBLES = Array.from({ length: 26 }, (_, i) => ({ dt: 0.4 + i * 0.75 + hash(i + 40) * 0.5, dx: (hash(i * 5 + 1) - 0.5) * 0.5, dz: (hash(i * 9 + 2) - 0.5) * 0.4, s: 0.04 + hash(i * 13) * 0.06 }));

const InkInWater: React.FC<{ t: number; q: THREE.Quaternion }> = ({ t, q }) => {
  const red = useMemo(() => CLOUDS.map((_, i) => makeBlot(PAL.cinnabar, 0, i * 1.7)), []);
  const bub = useMemo(() => makeBlot("#e8ecea", 2, 0), []);
  const splash = useMemo(() => makeBlot(PAL.cinnabar, 0, 9.1), []);
  const sp = t - T_STING;
  const splashA = sp > 0 && sp < 1.6 ? Math.exp(-sp * 2.2) : 0;
  (splash.uniforms.uAlpha as { value: number }).value = splashA * 0.95;
  const nkS = neckWorld(T_STING);
  return (
    <>
      {splashA > 0.01 ? (
        <mesh position={[nkS[0], nkS[1] + 0.05 + sp * 0.15, nkS[2] + 0.1]} quaternion={q} material={splash} renderOrder={6} scale={[0.15 + sp * 0.9, 0.15 + sp * 0.9, 1]}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ) : null}
      {CLOUDS.map((c, i) => {
        const t0 = T_SINK0 + c.dt;
        const age = t - t0;
        if (age < 0 || t0 > T_SINK1) return null;
        const p = neckWorld(t0);
        if (p[1] > -0.4 || G.uUnder.value < 0.5) return null;
        const a = Math.min(1, age * 1.5) * Math.exp(-age * 0.08) * 0.6;
        (red[i].uniforms.uAlpha as { value: number }).value = a;
        const s = c.s * (0.6 + age * 0.35);
        return (
          <mesh key={i} position={[p[0] + c.dx - age * 0.05, Math.min(-0.4, p[1] + age * 0.12), p[2] + c.dz]} quaternion={q} material={red[i]} renderOrder={7} scale={[s, s, 1]}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        );
      })}
      {BUBBLES.map((b, i) => {
        const t0 = T_SINK0 + b.dt;
        const age = t - t0;
        if (age < 0 || age > 6) return null;
        const p = neckWorld(t0);
        const y = p[1] + age * 0.7;
        if (y > -0.05) return null;
        return (
          <mesh key={i} position={[p[0] + b.dx + Math.sin(age * 3 + i) * 0.05, y, p[2] + b.dz]} quaternion={q} material={bub} renderOrder={8} scale={[b.s, b.s, 1]}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        );
      })}
    </>
  );
};

/* ================= the scene ================= */
const Scene: React.FC<{ t: number }> = ({ t }) => {
  const cam = camera(t);
  const q = useMemo(() => {
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(...cam.pos), new THREE.Vector3(...cam.at), new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, [cam.pos[0], cam.pos[1], cam.pos[2], cam.at[0], cam.at[1], cam.at[2]]); // eslint-disable-line react-hooks/exhaustive-deps

  // shared uniforms for this frame
  const under = cam.pos[1] < 0;
  const depth = Math.max(0, -cam.pos[1]);
  G.uTime.value = t;
  G.uUnder.value = under ? 1 : 0;
  if (under) {
    G.uFogColor.value.set(PAL.deepMid).lerp(new THREE.Color(PAL.deep), clamp(depth / 10));
    G.uFogNear.value = 0.6;
    G.uFogFar.value = 9;
  } else {
    G.uFogColor.value.set(PAL.paper);
    G.uFogNear.value = 9;
    G.uFogFar.value = 75;
  }
  DOME_U.uDepth.value = depth;
  const tp = turtlePose(t);
  WATER_U.uWake.value.set(tp.pos[0], 0, tp.pos[2]);
  WATER_U.uWakeAmt.value = ramp(t, T_SLIDE, T_SWIM) * (1 - ramp(t, T_STING, T_SINK0 + 1));
  WATER_U.uRing.value.set(MID_X + 0.4, 0, -0.7);
  WATER_U.uRingAge.value = t >= T_SINK0 ? t - T_SINK0 : -1;
  const nk = neckWorld(T_STING);
  WATER_U.uBlot.value.set(nk[0], 0, nk[2]);
  WATER_U.uBlotAge.value = Math.max(0, t - T_STING);
  WATER_U.uBlotAmt.value = ramp(t, T_STING, T_STING + 0.25) * lerp(1, 0.25, ramp(t, T.s9a, T.s9c + 4));

  const riding = t >= T_CRAWL1;
  const sp = scorpionPose(t, riding);
  return (
    <>
      <CameraRig cam={cam} />
      <World t={t} camPos={cam.pos} camQuat={q} />
      {t < T_SINK1 + 2 ? <Turtle pose={tp} rider={riding ? <Scorpion pose={sp} /> : null} /> : null}
      {!riding ? <Scorpion pose={sp} /> : null}
      <InkInWater t={t} q={q} />
      {under ? <Shafts center={[MID_X, 0, -1]} camQuat={q} alpha={1} /> : null}
      <mesh visible={false} geometry={GEO.sphere} />
    </>
  );
};

/* ================= captions & typography ================= */
const COLOR: Record<string, string> = { narator: "#2f4a63", kura: "#46613a", kalajengking: "#a42a1a" };
const LABEL: Record<string, string> = { narator: "NARATOR", kura: "KURA-KURA", kalajengking: "KALAJENGKING" };
const HIKMAH_FROM = T.s9c - 0.3;

type Phrase = { who: string; words: Clip["words"]; start: number; end: number };
const PHRASES: Phrase[] = CLIPS.flatMap((c) => {
  const out: Phrase[] = [];
  let cur: Clip["words"] = [];
  c.words.forEach((w, i) => {
    cur.push(w);
    const stop = /[.,?!…]$/.test(w.w) && cur.length >= 3;
    if (stop || cur.length >= 6 || i === c.words.length - 1) {
      out.push({ who: c.who, words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
});

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PHRASES.findIndex((p, n) => t >= p.start - 0.05 && t < Math.min(p.end + 0.4, PHRASES[n + 1]?.start ?? 1e9));
  if (i < 0) return null;
  const p = PHRASES[i];
  const col = COLOR[p.who];
  const inA = ramp(t, p.start - 0.05, p.start + 0.15);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1255, display: "flex", flexDirection: "column", alignItems: "center", opacity: inA }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 22, height: 22, background: col, borderRadius: 3, boxShadow: "inset 0 0 0 3px rgba(239,231,214,.35)" }} />
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 25, letterSpacing: 6, color: col }}>{LABEL[p.who]}</div>
      </div>
      <div
        style={{
          padding: "22px 34px 26px",
          background: "radial-gradient(ellipse at center, rgba(242,235,220,.94) 55%, rgba(242,235,220,.0) 100%)",
          textAlign: "center",
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 50,
          lineHeight: 1.3,
          color: "#191714",
        }}
      >
        {p.words.map((w, k) => {
          const on = t >= w.s && t < w.e + 0.05;
          return (
            <React.Fragment key={k}>
              <span style={{ color: on ? col : "#191714", display: "inline-block", transform: `translateY(${on ? -3 : 0}px)` }}>{w.w}</span>{" "}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Seal: React.FC<{ size: number; lines: string[]; k: number; rot?: number }> = ({ size, lines, k, rot = -4 }) => {
  if (k <= 0) return null;
  const sc = lerp(1.5, 1, ramp(k, 0, 0.35));
  return (
    <div
      style={{
        width: size,
        height: size,
        background: PAL.cinnabar,
        borderRadius: size * 0.08,
        opacity: ramp(k, 0, 0.2),
        transform: `scale(${sc}) rotate(${rot}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `inset 0 0 0 ${size * 0.06}px ${PAL.cinnabar}, inset 0 0 0 ${size * 0.085}px rgba(239,231,214,.85)`,
        fontFamily: BRUSH,
        color: "#f3e9d6",
        fontSize: size * 0.3,
        lineHeight: 1.0,
        filter: "url(#inkbleed)",
      }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, 0.6, 1.6) * (1 - ramp(t, T.s2a + 1.0, T.s2a + 2.2));
  if (a <= 0) return null;
  const reveal = ramp(t, 0.6, 3.4, (k) => k);
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: a }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: 12, color: PAL.cinnabarDark, marginBottom: 18 }}>CERITA HIKMAH</div>
      <div style={{ position: "relative", clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`, filter: "url(#inkbleed)" }}>
        <div style={{ fontFamily: BRUSH, fontSize: 132, lineHeight: 1.0, color: "#141312", textAlign: "center" }}>
          Kura-kura
          <div style={{ fontSize: 64, margin: "6px 0 2px", color: "#3a3834" }}>dan</div>
          Kalajengking
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 330 }}>
        <Seal size={92} lines={["Hik", "mah"]} k={ramp(t, 3.4, 4.6, (k) => k)} />
      </div>
    </div>
  );
};

/** The lesson gets its own calligraphic moment: big brush words, written on as they are spoken. */
const Hikmah: React.FC<{ t: number }> = ({ t }) => {
  if (t < HIKMAH_FROM || t > E.s9f + 2.2) return null;
  const a = ramp(t, HIKMAH_FROM, HIKMAH_FROM + 0.6) * (1 - ramp(t, E.s9f + 1.4, E.s9f + 2.2));
  const block = (id: string, size: number) => {
    const c = CLIPS.find((x) => x.id === id)!;
    return c.words.map((w, k) => {
      const shown = ramp(t, w.s - 0.1, w.s + 0.25);
      const on = t >= w.s && t < w.e + 0.1;
      const lift = id === "s9f" && /^naik/i.test(w.w) ? -ramp(t, w.s, w.s + 0.6) * 22 : id === "s9f" && /^turun/i.test(w.w) ? ramp(t, w.s, w.s + 0.6) * 22 : 0;
      return (
        <React.Fragment key={k}>
          <span style={{ display: "inline-block", opacity: shown, transform: `translateY(${(1 - shown) * 10 + lift}px)`, color: on ? PAL.cinnabar : "#141312" }}>{w.w}</span>{" "}
        </React.Fragment>
      );
    });
  };
  const first = t < T.s9e - 0.2;
  const sw = first ? ramp(t, HIKMAH_FROM, T.s9e - 0.6) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: a }}>
      <div style={{ position: "absolute", left: -80, right: -80, top: 470, height: 1000, background: "radial-gradient(ellipse 55% 45% at center, rgba(242,235,220,.9) 40%, rgba(242,235,220,0) 100%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 480, height: 980, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, letterSpacing: 14, color: PAL.cinnabarDark, marginBottom: 18 }}>HIKMAH</div>
        {first ? (
          <>
            <div style={{ fontFamily: BRUSH, fontSize: 118, lineHeight: 1.12 }}>{block("s9c", 118)}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 54, lineHeight: 1.3, marginTop: 26, color: "#3a3834" }}>{block("s9d", 54)}</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: BRUSH, fontSize: 128, lineHeight: 1.1 }}>{block("s9e", 128)}</div>
            <div style={{ fontFamily: BRUSH, fontSize: 116, lineHeight: 1.5, marginTop: 24 }}>{block("s9f", 116)}</div>
          </>
        )}
        <div style={{ height: 8, margin: "26px auto 0", width: `${sw * 60}%`, background: "linear-gradient(90deg, rgba(20,19,18,0), rgba(20,19,18,.85) 20%, rgba(20,19,18,.6) 80%, rgba(20,19,18,0))", borderRadius: 3, filter: "url(#inkbleed)" }} />
      </div>
    </div>
  );
};

const Ending: React.FC<{ t: number }> = ({ t }) => {
  const from = E.s9f + 2.2;
  const outro = TOTAL_SECONDS - 3.2;
  const a = ramp(t, from, from + 0.8) * (1 - ramp(t, outro - 0.3, outro));
  return (
    <>
      {a > 0 ? (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, filter: "url(#inkbleed)" }}>
          <div style={{ fontFamily: BRUSH, fontSize: 96, color: "#141312", lineHeight: 1.05, textAlign: "center" }}>
            Kenali tabiat,
            <br />
            sebelum percaya.
          </div>
          <div style={{ marginTop: 34 }}>
            <Seal size={110} lines={["Hik", "mah"]} k={ramp(t, from + 0.9, from + 2.0, (k) => k)} rot={3} />
          </div>
        </div>
      ) : null}
      {t > outro ? (
        <div style={{ position: "absolute", inset: 0, opacity: ramp(t, outro, outro + 0.8), background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 430 }} />
          <div style={{ marginTop: 42, color: "#e8f2ec", fontSize: 32, letterSpacing: 3, fontWeight: 500, fontFamily: SERIF }}>Created by Agus Dwi R.</div>
        </div>
      ) : null}
    </>
  );
};

const PaperGrain: React.FC<{ t: number }> = ({ t }) => (
  <>
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <filter id="inkbleed">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="3" seed={7} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.32  0 0 0 0.55 0" />
      </filter>
    </svg>
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.32 }}>
      <rect width="1080" height="1920" filter="url(#paper)" />
    </svg>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(70,52,30,.28) 100%)" }} />
    {t < 1.2 ? <div style={{ position: "absolute", inset: 0, background: PAL.paper, opacity: 1 - ramp(t, 0, 1.2) }} /> : null}
  </>
);

const Overlay: React.FC<{ t: number }> = ({ t }) => (
  <>
    <PaperGrain t={t} />
    <Title t={t} />
    {t < HIKMAH_FROM ? <Captions t={t} /> : null}
    <Hikmah t={t} />
    <Ending t={t} />
  </>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  void FILM_FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.paper }}>
      <ThreeCanvas width={width} height={height} dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 36, near: 0.05, far: 800, position: [0, 2, 10] }}>
        <Scene t={t} />
      </ThreeCanvas>
      <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <Overlay t={t} />
      </div>
      <Html5Audio src={staticFile("audio/ep05/full.wav")} />
    </AbsoluteFill>
  );
};
