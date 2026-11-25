// EP06 JESSICA (WATERCOLOR): staging, light, cameras, grade and overlays. Every value is a pure
// function of the film time t (seconds), keyed to clip ids in timeline.json.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { Stage3D } from "../../core/film/Stage3D";
import { Book, Fairy } from "./Book";
import { BUDI, JESSICA, Person, type Arm, type Pose } from "./Person";
import { CamRig, WatercolorPost, type Cam, type Grade } from "./Post";
import { World, type Env } from "./Set";
import { CHAIR_Z, CLIPS, DESK, E, T, TOTAL_SECONDS, TOYS, blinkAt, clamp, hash, kv, lerp, lerp3, mouthOf, ramp, type Clip, type V3 } from "./layout";

loadFraunces("italic", { weights: ["500", "600"], subsets: ["latin"] });
loadFraunces("normal", { weights: ["600"], subsets: ["latin"] });
loadNunito("normal", { weights: ["600", "800"], subsets: ["latin"] });

/* ---------- story beats ---------- */
const OUTRO = TOTAL_SECONDS - 3.2;
const ENTER = T.s2c + 0.6; // Jessica walks in
const AT_DESK = ENTER + 2.8;
const SHOUT = T.s3f;
const TO_LAP = T.s3i + 0.6;
const ON_LAP = T.s3i + 2.6;
const LEAVE = E.s3j + 0.3;
const WEEKS0 = T.s4a - 0.6;
const DAY_PERIOD = (T.s4c - 0.6 - WEEKS0) / 1.5;
const AFTERNOON = T.s4c - 0.4;
const IMPACT = T.s4c + 1.9;
const BOOK_SHOT = T.s4f - 0.5;
const GRIEF = T.s5a - 0.6;
const PICK = T.s5c + 3.6;
const KNEEL_READ = T.s5d - 0.3;
const OPEN_READ = T.s5e + 1.6;
const FREE = T.s6a + 0.4;

/* ---------- light states ---------- */
type LS = { sky: string; hemi: number; hemiSky: string; hemiGround: string; sun: number; sunColor: string; sunPos: V3; lamp: number; room: number; stars: number; win: number; hills: number };
const NIGHT: LS = { sky: "#4A5F8E", hemi: 1.7, hemiSky: "#BACAE8", hemiGround: "#6E6683", sun: 0.5, sunColor: "#B8C8F0", sunPos: [-6, 9, 7], lamp: 1, room: 0.8, stars: 1, win: 1, hills: 0 };
const DAY: LS = { sky: "#BFD7E8", hemi: 1.6, hemiSky: "#FFF6E5", hemiGround: "#B9A88C", sun: 1.5, sunColor: "#FFF1D6", sunPos: [-5, 10, 6], lamp: 0, room: 0, stars: 0, win: 0, hills: 1 };
const AFTER: LS = { sky: "#F1C27D", hemi: 1.5, hemiSky: "#FFE3B8", hemiGround: "#B99878", sun: 1.7, sunColor: "#FFC98A", sunPos: [8, 5, 6], lamp: 0, room: 0, stars: 0, win: 0, hills: 0.85 };
const GREY: LS = { sky: "#8C98AC", hemi: 1.8, hemiSky: "#D3DBE7", hemiGround: "#7C808C", sun: 0.6, sunColor: "#D3DCEA", sunPos: [6, 8, 6], lamp: 0, room: 0.15, stars: 0, win: 0, hills: 0.3 };
const END: LS = { ...NIGHT, sky: "#3E5486", lamp: 0, room: 1.3, hemi: 1.6 };

const mixLS = (a: LS, b: LS, k: number): LS => {
  const c = (x: string, y: string) => "#" + new THREE.Color(x).lerp(new THREE.Color(y), k).getHexString();
  return {
    sky: c(a.sky, b.sky), hemi: lerp(a.hemi, b.hemi, k), hemiSky: c(a.hemiSky, b.hemiSky), hemiGround: c(a.hemiGround, b.hemiGround),
    sun: lerp(a.sun, b.sun, k), sunColor: c(a.sunColor, b.sunColor), sunPos: lerp3(a.sunPos, b.sunPos, k), lamp: lerp(a.lamp, b.lamp, k),
    room: lerp(a.room, b.room, k), stars: lerp(a.stars, b.stars, k), win: lerp(a.win, b.win, k), hills: lerp(a.hills, b.hills, k),
  };
};
const lightAt = (t: number): LS => {
  if (t < WEEKS0) {
    // the lamp flares colder for a moment on the shout
    const flare = ramp(t, SHOUT, SHOUT + 0.15) * (1 - ramp(t, SHOUT + 0.6, SHOUT + 2));
    return { ...NIGHT, lamp: 1 + flare * 0.8, room: NIGHT.room * (1 - 0.5 * ramp(t, SHOUT, SHOUT + 1)) };
  }
  if (t < AFTERNOON) {
    const d = 0.5 - 0.5 * Math.cos(((t - WEEKS0) / DAY_PERIOD) * Math.PI * 2);
    return mixLS(NIGHT, DAY, d);
  }
  if (t < BOOK_SHOT) return mixLS(AFTER, GREY, ramp(t, IMPACT, IMPACT + 3.5));
  if (t < T.s6a) return mixLS(NIGHT, GREY, ramp(t, BOOK_SHOT, T.s4g + 2));
  return mixLS(GREY, END, ramp(t, T.s6a, T.s6a + 3));
};

/* ---------- grade: saturation, tint, colour bloom ---------- */
const gradeAt = (t: number, bloomC: [number, number]): Grade => {
  let sat = 0.92;
  let tint: V3 = [0.97, 0.99, 1.05];
  if (t >= AFTERNOON && t < BOOK_SHOT) {
    const k = ramp(t, IMPACT, IMPACT + 3);
    sat = lerp(1, 0.32, k);
    tint = lerp3([1.04, 1.0, 0.94], [0.92, 0.97, 1.07], k);
  } else if (t >= BOOK_SHOT && t < OUTRO) {
    const k = ramp(t, T.s4g, T.s4g + 2.5);
    const back = ramp(t, T.s6a + 1, T.s6b);
    sat = lerp(lerp(0.5, 0.12, k), 0.95, back);
    tint = lerp3(lerp3([0.95, 0.98, 1.06], [0.93, 0.97, 1.07], k), [1.0, 0.99, 1.0], back);
  }
  const bloomR = t > OPEN_READ && t < T.s6b ? kv(t, [[OPEN_READ, 0.0], [T.s5f, 0.07], [T.s5g, 0.14], [T.s5h, 0.24], [T.s5i, 0.34], [E.s5i, 0.6], [T.s6a + 1, 1.6]]) : -1;
  return { sat, tint, bloomC, bloomR };
};

/* ---------- Budi ---------- */
const WORK: Arm = [1.05, 0.12, 0.85];
const LAPHANDS: Arm = [0.5, 0.06, 1.2];
const READ: Arm = [0.75, 0.12, 1.25];
const DOWN: Arm = [0.05, 0.06, 0.15];
const arms = (t: number, list: [number, Arm][]): Arm => {
  let a = list[0][1];
  for (let i = 1; i < list.length; i++) {
    if (t < list[i][0]) break;
    const k = ramp(t, list[i][0], list[i][0] + 0.5);
    a = [lerp(a[0], list[i][1][0], k), lerp(a[1], list[i][1][1], k), lerp(a[2], list[i][1][2], k)];
  }
  return a;
};

const BUDI_KNEEL: V3 = [1.85, 0, -0.95];
const BUDI_KNEEL_YAW = 0.32;
const budiSeat = (t: number): Pose => {
  const talk = mouthOf("budi", t);
  const turn = kv(t, [[0, 0], [T.s2e - 0.3, 0], [T.s2e + 0.2, 0.45], [E.s2g + 0.3, 0.45], [E.s2g + 1, 0.05], [T.s3c - 0.2, 0.05], [T.s3c + 0.3, 0.3], [E.s3c + 0.3, 0.05], [SHOUT - 0.15, 0.05], [SHOUT + 0.1, 0.55], [T.s3i, 0.55], [T.s3i + 0.8, 0.62]]);
  const look = kv(t, [[0, 0.4], [T.s2c + 1.5, 0.4], [T.s2c + 2.5, 0.15], [T.s2e - 0.4, 0.15], [T.s2e, 0.0], [E.s2g + 0.6, 0.4], [T.s3c - 0.2, 0.4], [T.s3c + 0.2, 0.1], [E.s3c + 0.5, 0.42], [SHOUT - 0.2, 0.42], [SHOUT, -0.05], [E.s3f + 1.5, 0.25], [T.s3i + 0.5, 0.35], [E.s3j, 0.45]]);
  const shoutK = ramp(t, SHOUT - 0.1, SHOUT + 0.1) * (1 - ramp(t, E.s3f, E.s3f + 0.8));
  const working = speakingNone(t);
  return {
    pos: [DESK.x, 0, CHAIR_Z + 0.06],
    yaw: turn,
    hipY: 0.5,
    thigh: Math.PI / 2,
    knee: Math.PI / 2,
    lean: 0.18 + shoutK * 0.12 - (t > T.s3i ? 0.08 : 0),
    headPitch: look + (working ? Math.sin(t * 1.3) * 0.03 : 0),
    headYaw: turn * 0.25 + (t > T.s2c + 1.5 && t < E.s2g ? 0.2 : 0),
    armR: arms(t, [[0, WORK], [T.s3i + 1.2, [0.95, 0.05, 0.9]], [ON_LAP, LAPHANDS]]),
    armL: arms(t, [[0, WORK], [ON_LAP, LAPHANDS]]),
    mouth: talk,
    blink: blinkAt(t, 3),
    frown: shoutK * 1 + ramp(t, T.s2g, T.s2g + 0.4) * 0.3 * (1 - ramp(t, E.s2g, E.s2g + 1)),
    brow: -ramp(t, E.s3f + 1.5, T.s3i) * 0.5,
  };
};
const speakingNone = (t: number) => !CLIPS.some((c) => c.who !== "narator" && t >= c.start && t <= c.end);

const budiGrief = (t: number): Pose => {
  const talk = mouthOf("budi", t);
  // stand in the doorway, then walk to the toy chest and kneel
  const walk = ramp(t, T.s5c, T.s5c + 2.4);
  const from: V3 = [0.75, 0, -0.45], to: V3 = [2.25, 0, -1.25];
  const kneel = ramp(t, T.s5c + 2.4, T.s5c + 3.3);
  if (t < KNEEL_READ) {
    const p = lerp3(from, to, walk);
    const moving = walk > 0 && walk < 1;
    const sw = moving ? Math.sin(t * 7) : 0;
    const reach = ramp(t, T.s5c + 3.0, PICK) * (1 - ramp(t, PICK + 0.2, PICK + 0.9));
    return {
      pos: p,
      yaw: lerp(Math.PI / 2 + 0.25, Math.PI * 0.82, ramp(t, T.s5c + 1.8, T.s5c + 2.6)),
      hipY: lerp(0.9, 0.52, kneel),
      thigh: sw * 0.35 * (1 - kneel),
      knee: Math.max(0, -sw) * 0.5 * (1 - kneel) + kneel * (Math.PI / 2),
      lean: 0.12 + kneel * 0.2 + reach * 0.35,
      headPitch: 0.45 + reach * 0.2,
      headTilt: 0.06,
      armR: reach > 0 ? [lerp(0.05, 1.1, reach), 0.1, 0.3] : [0.05 + sw * 0.2, 0.08, 0.2],
      armL: t > PICK ? LAPHANDS : [0.05 - sw * 0.2, 0.08, 0.2],
      mouth: talk,
      blink: blinkAt(t, 5),
      brow: -0.8,
    };
  }
  const sob = clamp((t - T.s5e) / 1) * Math.max(0, Math.sin(t * 5.2)) * 0.035;
  const bow = ramp(t, T.s5i + 0.6, T.s5i + 3.2);
  const lookUp = ramp(t, E.s5i + 0.4, E.s5i + 3.0) * 0.5;
  return {
    pos: BUDI_KNEEL,
    yaw: BUDI_KNEEL_YAW,
    hipY: lerp(0.52, 0.4, bow),
    thigh: bow * 0.5,
    knee: Math.PI / 2 + bow * 0.4,
    lean: 0.22 + sob + bow * 1.05 - lookUp * 0.9,
    headPitch: 0.5 + bow * 0.25 - lookUp * 0.6,
    headTilt: 0.05,
    armR: bow > 0 ? [lerp(READ[0], 1.5, bow), 0.15, lerp(READ[2], 0.3, bow)] : READ,
    armL: bow > 0 ? [lerp(READ[0], 1.5, bow), 0.15, lerp(READ[2], 0.3, bow)] : READ,
    mouth: talk,
    blink: blinkAt(t, 5),
    brow: -1,
    tear: t > T.s5e ? ((t - T.s5e) % 2.6) / 2.6 : 0,
    shine: 1,
  };
};

/* ---------- Jessica ---------- */
const HOLD: Arm = [0.55, 0.08, 1.25];
const SHOW: Arm = [0.95, 0.04, 0.75];
const JS_DESK: V3 = [-0.55, 0, -1.12];
const JS_LAP: V3 = [-0.78, 0, -1.46];
const jessica = (t: number): { pose: Pose; visible: boolean } => {
  const talk = mouthOf("jessica", t);
  // night: enter from her room, stand by the desk, step to his lap, go back
  if (t < WEEKS0) {
    let pos: V3, yaw = -1.1, walking = 0;
    if (t < AT_DESK) {
      const k = ramp(t, ENTER, AT_DESK);
      const path: V3[] = [[1.55, 0, -0.55], [0.5, 0, -0.45], JS_DESK];
      pos = k < 0.5 ? lerp3(path[0], path[1], k * 2) : lerp3(path[1], path[2], (k - 0.5) * 2);
      yaw = -Math.PI / 2 + (k > 0.5 ? -0.3 * (k - 0.5) * 2 : 0.25);
      walking = k > 0 && k < 1 ? 1 : 0;
    } else if (t < LEAVE) {
      const back = ramp(t, T.s3g, T.s3g + 1.2) * (1 - ramp(t, TO_LAP, TO_LAP + 1.2));
      const lap = ramp(t, TO_LAP, TO_LAP + 1.2);
      pos = lerp3(lerp3(JS_DESK, [-0.3, 0, -0.95], back), JS_LAP, lap);
      yaw = lerp(-1.1, -1.35, lap);
      walking = (back > 0.02 && back < 0.98) || (lap > 0.02 && lap < 0.98) ? 1 : 0;
    } else {
      const k = ramp(t, LEAVE, LEAVE + 3.6);
      const path: V3[] = [JS_LAP, [0.4, 0, -0.5], [1.7, 0, -0.65]];
      pos = k < 0.5 ? lerp3(path[0], path[1], k * 2) : lerp3(path[1], path[2], (k - 0.5) * 2);
      yaw = Math.PI / 2 - 0.1;
      walking = k > 0 && k < 1 ? 1 : 0;
    }
    const sw = walking ? Math.sin(t * 10) : 0;
    const shown = t > AT_DESK && t < SHOUT;
    const showArm = shown && (t > T.s2d - 0.2 && t < E.s2d + 0.3 || t > T.s3e - 0.2 && t < E.s3e) ? SHOW : HOLD;
    const touch = ramp(t, TO_LAP + 0.9, ON_LAP) * (1 - ramp(t, LEAVE - 0.4, LEAVE + 0.2));
    const sad = ramp(t, SHOUT + 0.2, SHOUT + 0.8);
    return {
      visible: t > ENTER - 0.2,
      pose: {
        pos,
        yaw,
        thigh: sw * 0.45,
        knee: Math.max(0, -sw) * 0.6,
        lean: 0.02 + (talk > 0 ? 0.04 : 0) - sad * 0.02,
        headPitch: -0.32 + sad * 0.35 - (talk > 0 ? 0.05 : 0) + walking * 0.05,
        headYaw: 0.15 * Math.sin(t * 0.7) * (1 - sad),
        headTilt: talk > 0 ? Math.sin(t * 2.4) * 0.08 : 0.08 * sad,
        armR: t > TO_LAP + 0.6 ? [lerp(HOLD[0], 1.2, touch), 0.04, lerp(HOLD[2], 0.25, touch)] : t < ON_LAP ? arms(t, [[0, HOLD], [T.s2d - 0.2, showArm], [E.s2d + 0.3, HOLD], [T.s3e - 0.2, showArm], [E.s3e, HOLD]]) : DOWN,
        armL: t < ON_LAP ? arms(t, [[0, HOLD], [T.s2d - 0.2, showArm], [E.s2d + 0.3, HOLD], [T.s3e - 0.2, showArm], [E.s3e, HOLD]]) : DOWN,
        mouth: talk,
        blink: blinkAt(t, 9),
        brow: talk > 0 && !sad ? 0.5 : -sad * 1,
        tear: ramp(t, T.s3g + 0.6, T.s3g + 3.4) * (t < T.s3g + 3.4 ? 1 : 0),
        shine: sad,
      },
    };
  }
  // the two weeks: she sits by the toys with the closed book on her lap, looking toward the study
  const dayK = 0.5 - 0.5 * Math.cos(((t - WEEKS0) / DAY_PERIOD) * Math.PI * 2);
  return {
    visible: t < AFTERNOON && dayK > 0.35,
    pose: {
      pos: [1.95, 0, -1.2],
      yaw: -0.5,
      hipY: 0.1,
      thigh: Math.PI / 2,
      knee: 0.05,
      lean: 0.1,
      headPitch: 0.15,
      headYaw: -0.3 + Math.sin(t * 0.5) * 0.1,
      armR: LAPHANDS,
      armL: LAPHANDS,
      blink: blinkAt(t, 9),
      brow: -0.4,
    },
  };
};

/* ---------- the book and fairy ---------- */
const fairyLife = (t: number) => {
  if (t < WEEKS0) return kv(t, [[0, 0], [AT_DESK + 0.4, 0], [AT_DESK + 1.8, 1], [E.s2g, 1], [E.s2g + 0.6, 0.72], [E.s3c, 0.72], [E.s3c + 0.6, 0.48], [SHOUT, 0.48], [SHOUT + 0.35, 0.12], [SHOUT + 1.2, 0]]);
  return kv(t, [[OPEN_READ, 0], [T.s5f, 0.15], [T.s5g, 0.35], [T.s5h, 0.6], [T.s5i, 0.85], [E.s5i, 1]]);
};
const bookOpenNight = (t: number) => kv(t, [[0, 0], [AT_DESK + 0.1, 0], [AT_DESK + 1.0, 1], [SHOUT + 0.2, 1], [SHOUT + 0.9, 0]]);

/** World position of the open book while Budi kneels and reads (spine space -> world). */
const READ_ITEM: V3 = [0, 0.42, 0.33];
const HOLD_ITEM: V3 = [0, 0.3, 0.3];
const bookWorld = (lean: number, it: V3 = READ_ITEM): V3 => {
  const y = it[1] * Math.cos(lean) - it[2] * Math.sin(lean);
  const z = it[1] * Math.sin(lean) + it[2] * Math.cos(lean);
  return [BUDI_KNEEL[0] + z * Math.sin(BUDI_KNEEL_YAW), 0.52 + y, BUDI_KNEEL[2] + z * Math.cos(BUDI_KNEEL_YAW)];
};
const BOOK_READ_W = bookWorld(0.22);
const BOOK_HOLD_W = bookWorld(0.22, HOLD_ITEM);
const TOY_BOOK: V3 = [TOYS[0] + 0.05, 0.36, TOYS[2] - 0.08];

/** Path of the freed fairy at the end: out of the book, through the open house, up into the night. */
const freeFairy = (t: number): V3 => {
  const k = ramp(t, FREE, E.s6b);
  const a: V3 = [BOOK_READ_W[0], BOOK_READ_W[1] + 0.3, BOOK_READ_W[2]];
  const b: V3 = [1.2, 2.2, 1.4];
  const c: V3 = [0.4, 5.2, -1.0];
  const ab = lerp3(a, b, k), bc = lerp3(b, c, k);
  return lerp3(ab, bc, k);
};

/* ---------- cameras ---------- */
type Key = [number, V3, V3, number];
type Shot = { from: number; keys: Key[] };
const sh = (from: number, ...keys: Key[]): Shot => ({ from, keys });

const SHOTS: Shot[] = [
  sh(0, [0, [4.4, 6.0, 15.5], [0.2, 2.0, 0], 36], [T.s1b, [2.6, 3.6, 10.5], [-0.1, 1.6, -0.4], 36], [T.s2a, [0.4, 1.95, 3.9], [-1.2, 1.05, -1.2], 38]),
  sh(T.s2a, [T.s2a, [-0.55, 1.6, 1.55], [-1.45, 0.98, -1.5], 36], [T.s2c, [-0.85, 1.5, 0.95], [-1.45, 1.0, -1.5], 36]),
  sh(T.s2c, [T.s2c, [1.25, 1.7, 2.9], [-0.35, 0.85, -1.0], 40], [T.s2d, [0.75, 1.55, 2.25], [-0.5, 0.85, -1.1], 40]),
  sh(T.s2d, [T.s2d, [-1.25, 1.05, 0.35], [-0.6, 0.72, -1.15], 38], [T.s2e, [-1.2, 1.02, 0.2], [-0.6, 0.72, -1.15], 36]),
  sh(T.s2e, [T.s2e, [-0.45, 1.6, 1.15], [-1.4, 0.98, -1.5], 36], [T.s2f, [-0.5, 1.58, 1.0], [-1.4, 0.98, -1.5], 35]),
  sh(T.s2f, [T.s2f, [-1.2, 1.0, 0.25], [-0.6, 0.72, -1.15], 35], [T.s2g, [-1.18, 0.98, 0.15], [-0.6, 0.72, -1.15], 34]),
  sh(T.s2g, [T.s2g, [-0.45, 1.6, 1.15], [-1.4, 0.98, -1.5], 36], [T.s3a, [-0.55, 1.58, 0.95], [-1.4, 0.98, -1.5], 35]),
  sh(T.s3a, [T.s3a, [0.55, 1.5, 1.9], [-0.95, 0.88, -1.3], 40], [T.s3c, [0.25, 1.45, 1.45], [-0.95, 0.88, -1.3], 38]),
  sh(T.s3c, [T.s3c, [-0.5, 1.6, 1.1], [-1.4, 0.98, -1.5], 36], [T.s3d, [-0.6, 1.58, 0.92], [-1.4, 0.98, -1.5], 35]),
  sh(T.s3d, [T.s3d, [1.0, 2.5, 2.2], [-0.9, 0.7, -1.2], 40], [T.s3e, [0.6, 2.2, 1.7], [-0.9, 0.7, -1.2], 38]),
  sh(T.s3e, [T.s3e, [-1.2, 1.0, 0.25], [-0.6, 0.72, -1.15], 34], [SHOUT, [-1.15, 0.98, 0.1], [-0.6, 0.72, -1.15], 32]),
  sh(SHOUT, [SHOUT, [-0.5, 1.65, 1.35], [-1.4, 1.0, -1.5], 38], [SHOUT + 0.35, [-0.7, 1.55, 0.85], [-1.4, 1.02, -1.5], 35], [T.s3g, [-0.72, 1.55, 0.78], [-1.4, 1.02, -1.5], 34]),
  sh(T.s3g, [T.s3g, [-1.0, 0.9, 0.55], [-0.4, 0.72, -1.0], 34], [T.s3i, [-1.05, 0.9, 0.75], [-0.4, 0.72, -1.0], 36]),
  sh(T.s3i, [T.s3i, [0.1, 1.25, 0.75], [-1.05, 0.72, -1.45], 38], [T.s3j, [-0.05, 1.2, 0.5], [-1.05, 0.72, -1.45], 36]),
  sh(T.s3j, [T.s3j, [-0.45, 1.55, 1.75], [-1.12, 0.85, -1.4], 40], [LEAVE + 1, [-0.1, 1.65, 2.3], [-0.8, 0.85, -1.2], 42]),
  sh(WEEKS0, [WEEKS0, [-0.8, 2.05, 3.5], [-1.35, 0.95, -1.3], 40], [T.s4b - 0.4, [0.3, 2.0, 3.4], [0.3, 0.9, -1.2], 40], [AFTERNOON, [1.9, 1.7, 2.5], [1.95, 0.55, -1.3], 38]),
  sh(AFTERNOON, [AFTERNOON, [2.5, 1.55, 0.9], [1.1, 0.15, 3.9], 42], [IMPACT + 3, [2.4, 1.7, 1.2], [1.1, 0.15, 3.9], 40]),
  sh(T.s4d, [T.s4d, [1.3, 3.0, 11.0], [0.4, 1.3, 1.2], 38], [T.s4e, [1.0, 2.6, 9.8], [0.4, 1.3, 1.2], 38]),
  sh(T.s4e, [T.s4e, [0.9, 1.5, 7.2], [0.6, 1.4, 0.6], 40], [BOOK_SHOT, [0.8, 1.5, 6.6], [0.6, 1.4, 0.6], 40]),
  sh(BOOK_SHOT, [BOOK_SHOT, [2.05, 0.95, -0.95], [TOY_BOOK[0], 0.35, TOY_BOOK[2]], 36], [GRIEF, [2.15, 0.85, -1.15], [TOY_BOOK[0], 0.35, TOY_BOOK[2]], 32]),
  sh(GRIEF, [GRIEF, [0.4, 1.9, 3.7], [1.0, 1.0, -1.0], 40], [T.s5c, [0.7, 1.75, 3.2], [1.1, 1.0, -1.0], 40]),
  sh(T.s5c, [T.s5c, [2.9, 1.95, 3.0], [1.4, 0.85, -1.0], 42], [KNEEL_READ, [3.2, 1.7, 2.2], [2.1, 0.65, -1.3], 42]),
  sh(KNEEL_READ, [KNEEL_READ, [BOOK_HOLD_W[0] + 0.35, 1.75, BOOK_HOLD_W[2] + 1.75], [BOOK_HOLD_W[0], 0.85, BOOK_HOLD_W[2] - 0.1], 34], [OPEN_READ, [BOOK_READ_W[0] + 0.45, 1.8, BOOK_READ_W[2] + 2.0], [BOOK_READ_W[0], 0.9, BOOK_READ_W[2] - 0.15], 36]),
  sh(OPEN_READ, [OPEN_READ, [BOOK_READ_W[0] + 0.45, 1.8, BOOK_READ_W[2] + 2.0], [BOOK_READ_W[0], 0.9, BOOK_READ_W[2] - 0.15], 36], [T.s5i, [BOOK_READ_W[0] + 0.3, 1.7, BOOK_READ_W[2] + 1.7], [BOOK_READ_W[0], 0.92, BOOK_READ_W[2] - 0.15], 36]),
  sh(T.s5i, [T.s5i, [3.0, 1.3, 1.7], [1.85, 0.45, -0.85], 40], [E.s5i, [2.7, 1.9, 2.5], [1.8, 0.65, -0.9], 40]),
  sh(T.s6a, [T.s6a, [2.7, 1.9, 2.5], [1.8, 0.65, -0.9], 40], [T.s6b, [1.6, 3.6, 10.5], [0.4, 2.4, -0.5], 40], [OUTRO, [1.2, 4.2, 13.5], [0.3, 3.0, -0.6], 40]),
];

const camAt = (t: number): Cam => {
  let s = SHOTS[0];
  for (const x of SHOTS) if (t >= x.from) s = x;
  const k = s.keys;
  let pos = k[0][1], at = k[0][2], fov = k[0][3];
  for (let i = 1; i < k.length; i++) {
    const u = clamp((t - k[i - 1][0]) / Math.max(0.01, k[i][0] - k[i - 1][0]));
    if (t < k[i - 1][0]) break;
    const e = u * u * (3 - 2 * u);
    const easeIn = i === 1 && k.length > 2 ? u : e; // first segment of a 3-key move keeps its speed
    const w = k.length > 2 ? easeIn : e;
    pos = lerp3(k[i - 1][1], k[i][1], w);
    at = lerp3(k[i - 1][2], k[i][2], w);
    fov = lerp(k[i - 1][3], k[i][3], w);
  }
  // gentle "turning a page" float
  const drift: V3 = [Math.sin(t * 0.37) * 0.02, Math.sin(t * 0.29 + 1) * 0.015, 0];
  return { pos: [pos[0] + drift[0], pos[1] + drift[1], pos[2]], at, fov, roll: Math.sin(t * 0.21) * 0.004 };
};

const projectUV = (cam: Cam, p: V3): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.at);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return [v.x * 0.5 + 0.5, v.y * 0.5 + 0.5];
};

/* ---------- scene ---------- */
const Scene: React.FC<{ t: number; f60: number }> = ({ t, f60 }) => {
  const cam = camAt(t);
  const L = lightAt(t);
  const facade = t < AFTERNOON ? ramp(t, T.s1b + 0.4, T.s2a + 0.6) : t < BOOK_SHOT ? 0 : t < T.s6a + 2 ? 1 : 1 - ramp(t, T.s6b - 1, E.s6b + 1.5);
  const papers = clamp((t - WEEKS0) / (AFTERNOON - WEEKS0));
  // the red ball: resting in the yard, then rolling back from the street to stop at the curb
  const roll = ramp(t, IMPACT + 0.6, IMPACT + 3.8);
  const ballPos: V3 = t < IMPACT + 0.6 ? [-0.6, 0.1, 2.3] : lerp3([2.8, 0.1, 4.6], [1.05, 0.1, 3.55], 1 - (1 - roll) * (1 - roll));
  const env: Env = {
    facade,
    lamp: L.lamp,
    roomLight: L.room,
    sky: L.sky,
    hills: L.hills,
    stars: L.stars,
    winGlow: L.win,
    papers,
    bookOnDesk: false,
    ball: t < AFTERNOON ? [-0.6, 0.1, 2.3] : ballPos,
    ballRot: -roll * 9,
  };
  const js = jessica(t);
  const night = t < WEEKS0;
  const dayK = t >= WEEKS0 && t < AFTERNOON ? 0.5 - 0.5 * Math.cos(((t - WEEKS0) / DAY_PERIOD) * Math.PI * 2) : 0;
  const budiAtDesk = night || (t < AFTERNOON && dayK < 0.55);
  const grief = t >= GRIEF;
  const life = fairyLife(t);
  const openN = bookOpenNight(t);
  // book placement
  let jsBook: React.ReactNode = null, budiBook: React.ReactNode = null, worldBook: React.ReactNode = null;
  if (night && t < ON_LAP) {
    jsBook = (
      <group position={[0, 0.24, 0.17]} rotation={[-0.25 + openN * 0.1, 0, 0]} scale={0.85}>
        <group position={[-0.0, 0, 0]}><Book open={openN} t={t} fairy={life * openN} /></group>
      </group>
    );
  } else if (night) {
    budiBook = (
      <group position={[0, 0.04, 0.34]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <Book open={0} t={t} />
      </group>
    );
  } else if (t < AFTERNOON) {
    if (dayK > 0.35) {
      // on Jessica's lap, unopened
      jsBook = null;
      worldBook = (
        <group position={[1.95 + 0.06, 0.24, -1.2 + 0.2]} rotation={[-Math.PI / 2 + 0.5, -0.5, 0]} scale={0.85}>
          <Book open={0} t={t} />
        </group>
      );
    } else if (t < AFTERNOON - 1.2) {
      worldBook = (
        <group position={[DESK.x - 0.12, DESK.h + 0.015, DESK.z + 0.12]} rotation={[-Math.PI / 2, 0, 0.35]}>
          <Book open={0} t={t} />
        </group>
      );
    } else {
      worldBook = (
        <group position={TOY_BOOK} rotation={[-Math.PI / 2, 0, 0.3]}>
          <Book open={0} t={t} />
        </group>
      );
    }
  } else if (t < PICK) {
    const flick = t < T.s4g + 1.5 ? kv(t, [[T.s4f - 0.3, 0], [T.s4f + 0.6, 0.55], [T.s4g, 0.4], [T.s4g + 1.6, 0]]) * (0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 3.1)) : 0;
    worldBook = (
      <group position={TOY_BOOK}>
        <group rotation={[-Math.PI / 2, 0, 0.3]}>
          <Book open={0} t={t} worn={grief} />
        </group>
        {flick > 0.01 ? <group position={[0, 0.06 + flick * 0.06, 0.02]}><Fairy life={flick} t={t} scale={0.8} /></group> : null}
      </group>
    );
  } else {
    const reading = t >= T.s5e + 0.3;
    const open = reading ? ramp(t, T.s5e + 0.6, OPEN_READ) : 0;
    const flip = kv(t, [[T.s5g, 0], [T.s5g + 1.4, 1], [T.s5g + 2.6, 1], [T.s5g + 4.0, 2], [T.s5h + 1.5, 2], [T.s5h + 2.8, 3]]);
    budiBook = reading ? (
      <group position={READ_ITEM} rotation={[1.25 - open * 0.15, 0, 0]}>
        <group rotation={[0, Math.PI, 0]} scale={0.95}>
          <Book open={open} flip={flip} worn t={t} fairy={t < FREE ? life * open : 0} fairyLift={1} />
        </group>
      </group>
    ) : (
      <group position={HOLD_ITEM} rotation={[0.4, 0, 0]} scale={0.9}>
        <group position={[-0.095, 0, 0]}><Book open={0} worn t={t} /></group>
      </group>
    );
  }
  const bp = grief ? budiGrief(t) : budiSeat(t);
  const bookUV = projectUV(cam, BOOK_READ_W);
  const grade = gradeAt(t, bookUV);
  // ambulance light pulses wash over the house front (no vehicle in frame)
  const amb = ramp(t, T.s4e - 0.2, T.s4e + 0.6) * (1 - ramp(t, E.s4f, E.s4f + 1));
  const red = amb * Math.max(0, Math.sin(t * 7.5)) * 6;
  const blue = amb * Math.max(0, Math.sin(t * 7.5 + Math.PI)) * 6;
  // the off-screen moment: a fast light streak sweeps along the street
  const streak = clamp((t - (IMPACT - 0.35)) / 0.45);
  return (
    <>
      <CamRig cam={cam} exposure={lerp(1.08, 1.32, ramp(t, BOOK_SHOT, BOOK_SHOT + 1) * (1 - ramp(t, T.s6a, T.s6a + 3)))} />
      {grief && t < OUTRO ? <pointLight position={[BUDI_KNEEL[0] + 0.6, 1.9, BUDI_KNEEL[2] + 1.6]} color="#E6EEFA" intensity={2.2 * (1 - ramp(t, T.s6a, T.s6a + 3))} distance={4.5} decay={1.4} /> : null}
      <hemisphereLight args={[L.hemiSky, L.hemiGround, L.hemi]} />
      <directionalLight position={L.sunPos} intensity={L.sun} color={L.sunColor} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-0.0004} />
      <World env={env} t={t} />
      {budiAtDesk || grief ? <Person look={BUDI} pose={bp} torsoItem={budiBook} /> : null}
      {js.visible ? <Person look={JESSICA} pose={js.pose} torsoItem={jsBook} /> : null}
      {worldBook}
      {t >= FREE && t < OUTRO ? (
        <group position={freeFairy(t)}>
          <Fairy life={1} t={t} scale={1.2 + ramp(t, FREE, E.s6b) * 2.2} />
        </group>
      ) : null}
      {amb > 0.01 ? (
        <>
          <pointLight position={[3.8, 1.4, 3.6]} color="#FF5A5A" intensity={red * 12} distance={14} decay={1.0} />
          <pointLight position={[3.2, 1.4, 3.9]} color="#5A8CFF" intensity={blue * 12} distance={14} decay={1.0} />
        </>
      ) : null}
      {streak > 0 && streak < 1 ? (
        <mesh position={[lerp(9, -9, streak), 0.5, 4.8]} scale={[3.2, 0.45, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#FFF3DA" transparent opacity={0.55 * Math.sin(streak * Math.PI)} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
      <WatercolorPost frame60={f60} grade={grade} />
    </>
  );
};

/* ---------- overlays ---------- */
const SERIF = "Fraunces";
const SANS = "Nunito";
const COLOR: Record<string, string> = { narator: "#3F6F96", budi: "#55606F", jessica: "#D0603F" };
const LABEL: Record<string, string> = { narator: "NARATOR", budi: "BUDI", jessica: "JESSICA" };

type Phrase = { who: string; words: Clip["words"]; start: number; end: number };
const PHRASES: Phrase[] = CLIPS.flatMap((c) => {
  const out: Phrase[] = [];
  let cur: Clip["words"] = [];
  c.words.forEach((w, i) => {
    cur.push(w);
    const stop = /[.,?!…]$/.test(w.w) && cur.length >= 3;
    if (stop || cur.length >= 7 || i === c.words.length - 1) {
      out.push({ who: c.who, words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
});

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PHRASES.findIndex((p, n) => t >= p.start - 0.05 && t < Math.min(p.end + 0.35, PHRASES[n + 1]?.start ?? 1e9));
  if (i < 0) return null;
  const p = PHRASES[i];
  const col = COLOR[p.who];
  const inK = clamp((t - p.start + 0.05) / 0.18);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1265, display: "flex", justifyContent: "center", opacity: inK }}>
      <div style={{ background: "rgba(250,246,239,0.9)", borderRadius: "38px 30px 42px 28px", padding: "18px 34px 22px", boxShadow: "0 6px 22px rgba(40,35,30,.18)", border: "1.5px solid rgba(60,55,51,.25)", textAlign: "center", maxWidth: 920 }}>
        <div style={{ fontFamily: SANS, fontSize: 24, letterSpacing: 5, fontWeight: 800, color: col, marginBottom: 6 }}>{LABEL[p.who]}</div>
        <div style={{ fontFamily: SANS, fontSize: 48, lineHeight: 1.22, fontWeight: 800, color: "#2E2925" }}>
          {p.words.map((w, k) => {
            const on = t >= w.s && t < w.e + 0.04;
            return (
              <span key={k} style={{ color: on ? col : "#2E2925", display: "inline-block", transform: on ? "translateY(-3px)" : "none", marginRight: "0.26em" }}>{w.w}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const title = ramp(t, 0.6, 1.6) * (1 - ramp(t, E.s1b - 0.4, E.s1b + 0.6));
  const hik = ramp(t, T.s6b - 0.1, T.s6b + 0.8) * (1 - ramp(t, T.s6c - 0.5, T.s6c));
  const close = ramp(t, T.s6c - 0.2, T.s6c + 0.8) * (1 - ramp(t, OUTRO - 0.6, OUTRO));
  const outro = ramp(t, OUTRO, OUTRO + 0.8);
  const ink = { textShadow: "0 0 18px rgba(250,246,239,.9), 0 0 4px rgba(250,246,239,.9)" };
  return (
    <>
      {t < T.s6b - 0.2 ? <Captions t={t} /> : null}
      {title > 0 ? (
        <div style={{ position: "absolute", top: 230, left: 60, right: 60, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 14}px)` }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: 9, color: "#E8D9B8" }}>CERITA HIKMAH</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 132, lineHeight: 1.05, color: "#FBF4E4", textShadow: "0 4px 26px rgba(20,24,40,.65)" }}>Jessica</div>
          <div style={{ width: 220, height: 3, margin: "14px auto 0", background: "#E8AB48", borderRadius: 3, opacity: 0.85 }} />
        </div>
      ) : null}
      {hik > 0 ? (
        <div style={{ position: "absolute", top: 1160, left: 70, right: 70, textAlign: "center", opacity: hik }}>
          <div style={{ display: "inline-block", background: "rgba(250,246,239,0.92)", borderRadius: "48px 36px 52px 34px", padding: "34px 46px", boxShadow: "0 8px 30px rgba(20,24,40,.3)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: "#3F6F96", marginBottom: 10 }}>HIKMAH</div>
            <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 52, lineHeight: 1.2, color: "#2E2925" }}>Pekerjaan bisa menunggu.</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 66, lineHeight: 1.15, color: "#C0563F", marginTop: 8 }}>Tidak selalu ada<br />lain kali.</div>
          </div>
        </div>
      ) : null}
      {close > 0 ? (
        <div style={{ position: "absolute", top: 1180, left: 70, right: 70, textAlign: "center", opacity: close, ...ink }}>
          <div style={{ display: "inline-block", background: "rgba(250,246,239,0.92)", borderRadius: "40px 32px 46px 30px", padding: "30px 48px" }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 64, lineHeight: 1.15, color: "#2E2925" }}>Jangan tunggu lain kali.</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, marginTop: 12, color: "#3F6F96" }}>Bacakan ceritanya hari ini.</div>
          </div>
        </div>
      ) : null}
      {outro > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: outro, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 430 }} />
          <div style={{ marginTop: 44, color: "#E8F2EC", fontFamily: SANS, fontSize: 32, letterSpacing: 3, fontWeight: 600 }}>Created by Agus Dwi R.</div>
        </div>
      ) : null}
    </>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f60 = t * 60;
  return (
    <AbsoluteFill>
      <Stage3D background="#FAF6EF" fadeColor="#FAF6EF" fade={1 - ramp(t, 0.05, 1.2)} overlay={() => <Overlay t={t} />}>
        <Scene t={t} f60={f60} />
      </Stage3D>
      <Html5Audio src={staticFile("audio/ep06/full.wav")} />
    </AbsoluteFill>
  );
};
void hash;
