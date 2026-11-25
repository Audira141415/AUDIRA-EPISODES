// ANJING KECIL (CLAYWORLD): staging, lights, cameras and overlays. Every value is a pure function of film time,
// and every cue is keyed to a clip id from timeline.json so the film re-times itself when the real voice arrives.
import React from "react";
import { Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { Stage3D } from "../../core/film/Stage3D";
import { CameraRig, Post, type Shot } from "../../core/render/Post";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets";
import { C, clay, lump } from "./clay";
import { CAT_S, COW_S, Farmer, HORSE_S, Hen, Horns, M, Mane, OLDDOG, PUP, Quad, SHEEP_S, Sacks, SheepTop, type FarmerPose, type QuadPose } from "./Cast";
import { FarmSet } from "./Set";
import {
  CLIPS, COW, E, FILM_FPS, HAY, HEN, HORSE, KENNEL, LANTERN, SHEEP, T, TOTAL_SECONDS, type Clip, type V3,
  clamp, during, kv, kv3, lerp, mouthOf, ramp, speaking, stepT,
} from "./layout";

const { fontFamily: DISPLAY } = loadFredoka("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
const { fontFamily: BODY } = loadNunito("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });

// voice + music mix built on the real timeline (mix.wav alone is the music bed)
const AUDIO = staticFile("audio/ep03/full.wav");

/* ---------- helpers ---------- */

const hashN = (n: number) => {
  const s = Math.sin(n * 57.3 + 11.1) * 43758.5453;
  return s - Math.floor(s);
};
/** Stop-motion blink: lids snap shut for ~2 stepped frames. */
const blinkAt = (t: number, seed: number) => {
  const period = 2.6 + hashN(seed) * 1.8;
  return (t + seed * 1.37) % period < 0.15;
};
const yawTo = (from: [number, number], to: [number, number]) => Math.atan2(to[0] - from[0], to[1] - from[1]);
const angLerp = (a: number, b: number, k: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};
type P2 = [number, number];
const path2 = (t: number, keys: [number, P2][]): P2 => [kv(t, keys.map(([k, v]) => [k, v[0]])), kv(t, keys.map(([k, v]) => [k, v[1]]))];
/** Position, heading and speed along a keyed path. */
const mover = (t: number, keys: [number, P2][]) => {
  const p = path2(t, keys);
  const q = path2(t + 0.08, keys);
  const sp = Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.08;
  return { p, sp, heading: sp > 1e-3 ? Math.atan2(q[0] - p[0], q[1] - p[1]) : 0 };
};

/* ---------- puppy ---------- */

const PUP_SCALE = 1.35;
const PUP_HOME: P2 = [0.9, 0.9];
const AT_HORSE: P2 = [-2.0, -0.75];
const AT_COW: P2 = [-0.4, -0.8];
const AT_SHEEP: P2 = [1.35, -0.6];
const AT_HEN: P2 = [2.85, 0.75];
const AT_POND: P2 = [-2.7, 1.5];
const FARMER_STOP: P2 = [2.55, 2.4];
const AT_FARMER: P2 = [2.12, 2.42];
const RUN_FROM = () => T.s8c + 0.2;
const RUN_TO = () => T.s8c + 2.3;
const JUMP_AT = () => Math.min(T.s8c + 4.9, T.s8d - 0.6);
const HELD_AT = () => JUMP_AT() + 0.7;

const pupPath = (): [number, P2][] => [
  [0, PUP_HOME], [T.s1c + 0.2, PUP_HOME], [E.s1c, AT_HORSE],
  [T.s2e + 0.4, AT_HORSE], [T.s3a + 2.6, AT_COW],
  [T.s4a + 0.3, AT_COW], [T.s4a + 3.0, AT_SHEEP],
  [T.s5a + 0.3, AT_SHEEP], [T.s5a + 3.8, AT_HEN],
  [T.s6a + 0.2, AT_HEN], [E.s6a - 0.2, AT_POND],
  [RUN_FROM(), AT_POND], [RUN_TO(), AT_FARMER],
];
/** Who the puppy looks at while standing still. */
const pupLook = (t: number): P2 => {
  if (t < T.s2a) return [1.5, 3];
  if (t < T.s3a) return [HORSE[0], HORSE[2]];
  if (t < T.s4a) return [COW[0], COW[2]];
  if (t < T.s5a) return [SHEEP[0], SHEEP[2]];
  if (t < T.s5c) return [HEN[0], HEN[2]];
  if (t < T.s5d) return [HAY[0], HAY[2]];
  if (t < T.s6a) return [1.5, 4];
  if (t < T.s8c) return [-2.0, 4.0];
  return [FARMER_STOP[0], FARMER_STOP[1]];
};

const pupPose = (t: number) => {
  const m = mover(t, pupPath());
  const running = during(t, RUN_FROM(), RUN_TO(), 0.1);
  const move = clamp(m.sp / (running > 0.5 ? 2.2 : 0.75));
  const look = pupLook(t);
  const yaw = angLerp(yawTo(m.p, look), m.heading, clamp(move * 2.5));
  // shame grows with every insult, breaks at the pond, heals with the old dog's words
  const shame = clamp(
    0.25 * ramp(t, E.s2d - 0.5, E.s2d + 0.5) + 0.25 * ramp(t, E.s3c - 0.5, E.s3c + 0.4) + 0.2 * ramp(t, E.s4c - 0.4, E.s4c + 0.4) + 0.3 * ramp(t, T.s5d, T.s5d + 1.5),
  ) * (1 - ramp(t, T.s7d, E.s7d + 1));
  const crying = during(t, E.s6a - 1.2, T.s7c, 0.5);
  const joy = ramp(t, RUN_FROM() - 0.3, RUN_FROM());
  const sit = during(t, E.s6a, RUN_FROM() - 0.2, 0.4) + during(t, 0, T.s1c, 0.3) * 0.8;
  const sniff = during(t, T.s1c + 0.3, E.s1c - 0.2, 0.2);
  const hopPhase = clamp((t - JUMP_AT()) / (HELD_AT() - JUMP_AT()));
  const lick = during(t, RUN_TO() + 0.2, RUN_TO() + 2.2, 0.15);
  const pose: QuadPose = {
    walk: t * (running > 0.5 ? 22 : 11),
    move,
    sit: clamp(sit),
    squash: -shame * 0.12 + (hopPhase > 0 && hopPhase < 1 ? 0.15 * Math.sin(hopPhase * Math.PI) : 0),
    hop: hopPhase > 0 && hopPhase < 1 ? 0 : joy * Math.max(0, Math.sin(t * 9)) * 0.06 * (1 - lick),
    headPitch: shame * 0.45 + crying * 0.2 + sniff * (0.45 + Math.sin(t * 9) * 0.12) - joy * 0.25 + lick * 0.55 - ramp(t, T.s7d, T.s7d + 1.2) * 0.25 * (1 - joy),
    headYaw: crying * Math.sin(t * 1.3) * 0.12,
    headRoll: during(t, T.s7c, E.s7d) * 0.18,
    mouth: Math.max(mouthOf("anak", t), lick * 0.7),
    lick: lick * (0.5 + 0.5 * Math.sin(t * 16)),
    blink: blinkAt(t, 3) || crying > 0.5 && Math.sin(t * 1.7) > 0.6,
    wag: joy * 1 + (1 - shame) * during(t, 0, T.s2b) * 0.4 + ramp(t, T.s7d + 2, E.s7d) * 0.35,
    tailUp: lerp(0.6, -0.4, Math.max(shame, crying)) + joy * 0.4,
    earDroop: Math.max(shame, crying),
    brow: Math.max(shame, crying) * 1 - joy * 0.3,
  };
  return { pos: m.p, yaw, pose, scale: PUP_SCALE * (1 - shame * 0.12), crying };
};

const Tears: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on < 0.3) return null;
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const side = i % 2 ? 1 : -1;
        const u = ((t * 0.9 + i * 0.27) % 1);
        return (
          <M key={i} g={lump(500 + i, 0.03, 10)} m={clay(C.tear, 0, 0.1)} p={[side * 0.075, 0.3 - u * 0.3, 0.24 + u * 0.04]} s={[0.014, 0.022, 0.014]} shadow={false} />
        );
      })}
    </>
  );
};

/* ---------- the old dog ---------- */

const DOG_SIT: P2 = [-3.45, 1.25];
const dogPose = (t: number) => {
  const keys: [number, P2][] = [[0, [KENNEL[0] + 0.55, KENNEL[2] + 0.2]], [T.s6c + 1.0, [KENNEL[0] + 0.55, KENNEL[2] + 0.2]], [E.s6c + 0.6, DOG_SIT]];
  const m = mover(t, keys);
  const move = clamp(m.sp / 0.45);
  const target = t < T.s6c + 0.5 ? [2, 6] as P2 : AT_POND;
  const yaw = angLerp(yawTo(m.p, target), m.heading, clamp(move * 2.5));
  const awake = ramp(t, T.s6c, T.s6c + 1);
  const pose: QuadPose = {
    walk: t * 6, move,
    lie: (1 - awake) + during(t, T.s8a + 3, TOTAL_SECONDS, 1) * 0.0,
    sit: ramp(t, E.s6c + 0.6, E.s6c + 1.4),
    headPitch: (1 - awake) * 0.35 + 0.1 + Math.sin(t * 0.8) * 0.03,
    headRoll: speaking("tua", t) * Math.sin(t * 0.7) * 0.08,
    mouth: mouthOf("tua", t),
    blink: blinkAt(t, 11) || (1 - awake) > 0.5,
    wag: during(t, T.s7c, E.s7d) * 0.2,
    tailUp: 0.1,
    earDroop: 0.7,
    brow: 0.35,
  };
  return { pos: m.p, yaw, pose };
};

/* ---------- the boasting animals ---------- */

const breath = (t: number, s: number) => Math.sin(t * 1.6 + s) * 0.015;
const boast = (who: string, t: number) => clamp(speaking(who, t, 0.4) * ramp(t, T[`s${{ kuda: 2, sapi: 3, domba: 4, ayam: 5, kucing: 5 }[who]}b`] - 0.6, T[`s${{ kuda: 2, sapi: 3, domba: 4, ayam: 5, kucing: 5 }[who]}b`] + 0.4));
const smug = (t: number) => during(t, T.s5d, E.s5d + 0.6, 0.6);
const lateLook = (t: number) => ramp(t, T.s8f - 1, T.s8f + 1);

const Animals: React.FC<{ t: number; pup: P2 }> = ({ t, pup }) => {
  const toPup = (p: V3) => yawTo([p[0], p[2]], pup);
  const toFarm = (p: V3) => yawTo([p[0], p[2]], FARMER_STOP);
  const face = (p: V3, base: number) => angLerp(angLerp(base, toPup(p), ramp(t, T.s2a - 1, T.s2a)), toFarm(p), lateLook(t));
  const horsePuff = Math.max(boast("kuda", t) * (0.7 + 0.3 * Math.sin(t * 3)), smug(t) * 0.5);
  const cowPuff = Math.max(during(t, T.s3b - 0.2, E.s3c + 0.3) * (0.75 + 0.25 * Math.sin(t * 2.5)), smug(t) * 0.5);
  const sheepPuff = Math.max(during(t, T.s4b - 0.2, E.s4c + 0.3) * (0.7 + 0.3 * Math.sin(t * 3.4)), smug(t) * 0.5);
  const henPuff = Math.max(during(t, T.s5b - 0.2, E.s5b + 0.4), smug(t) * 0.5);
  const catPuff = Math.max(during(t, T.s5c - 0.2, E.s5c + 0.4), smug(t) * 0.5);
  // the sheep turns to the cow for its first line
  const sheepYaw = angLerp(face(SHEEP, 0.3), yawTo([SHEEP[0], SHEEP[2]], [COW[0], COW[2]]), during(t, T.s4b, T.s4b + 2.2, 0.4));
  const hay: V3 = [HAY[0] - 0.05, 0.83, HAY[2] - 0.05];
  return (
    <>
      <group position={HORSE} rotation={[0, face(HORSE, 0.6), 0]}>
        <Quad spec={HORSE_S} back={<Sacks />} headTop={<Mane />} pose={{
          puff: horsePuff, squash: breath(t, 0), mouth: mouthOf("kuda", t), blink: blinkAt(t, 5),
          headPitch: -0.05 + Math.sin(t * 0.5) * 0.04 + during(t, T.s2b, E.s2d) * 0.15, headYaw: Math.sin(t * 0.35) * 0.1,
          tailUp: 0.1, brow: -horsePuff * 0.8, earDroop: 0,
        }} />
      </group>
      <group position={COW} rotation={[0, face(COW, 0.2), 0]}>
        <Quad spec={COW_S} spots headTop={<Horns />} pose={{
          puff: cowPuff, squash: breath(t, 1), mouth: Math.max(mouthOf("sapi", t), (1 - speaking("sapi", t)) * Math.max(0, Math.sin(t * 2.2)) * 0.25), blink: blinkAt(t, 7),
          headPitch: 0.15 + Math.sin(t * 0.6) * 0.04, tailUp: 0.05, brow: -cowPuff * 0.8,
        }} />
      </group>
      <group position={SHEEP} rotation={[0, sheepYaw, 0]}>
        <Quad spec={SHEEP_S} wool headTop={<SheepTop />} pose={{
          puff: sheepPuff, squash: breath(t, 2), mouth: mouthOf("domba", t), blink: blinkAt(t, 9), headPitch: 0.05, brow: -sheepPuff * 0.8,
        }} />
      </group>
      <group position={HEN} rotation={[0, face(HEN, -0.8), 0]}>
        <Hen pose={{
          puff: henPuff, mouth: mouthOf("ayam", t), blink: blinkAt(t, 13),
          flap: during(t, T.s5b, E.s5b) * Math.abs(Math.sin(t * 14)), peck: (1 - during(t, T.s5a, E.s5d + 1)) * Math.max(0, Math.sin(t * 3)) * 0.8,
        }} />
      </group>
      <group position={hay} rotation={[0, face(hay, -1.2), 0]}>
        <Quad spec={CAT_S} stripes pose={{
          puff: catPuff, sit: 1, mouth: mouthOf("kucing", t), blink: blinkAt(t, 15) || during(t, 0, T.s5a) > 0.5, headPitch: 0.05 - catPuff * 0.1,
          wag: 0.2, tailUp: 0.3, brow: -catPuff, earDroop: 0,
        }} />
      </group>
    </>
  );
};

/** The mouse the cat brags about, scurrying off the haystack. */
const Mouse: React.FC<{ t: number }> = ({ t }) => {
  const u = clamp((t - T.s5c) / 2.4);
  if (u <= 0 || u >= 1) return null;
  const x = lerp(HAY[0] + 0.5, 6.6, u), z = lerp(HAY[2] - 0.3, 0.2, u);
  const hop = Math.abs(Math.sin(u * 40)) * 0.03;
  return (
    <group position={[x, hop, z]} rotation={[0, Math.atan2(6.6 - HAY[0], 0.2 - HAY[2]), 0]}>
      <M g={lump(520, 0.04, 14)} m={clay("#9a9590")} p={[0, 0.06, 0]} s={[0.05, 0.05, 0.09]} />
      <M g={lump(521, 0.04, 12)} m={clay("#9a9590")} p={[0, 0.08, 0.08]} s={0.04} />
      {[1, -1].map((s) => <M key={s} g={lump(522, 0.03, 10)} m={clay("#e9a7a7")} p={[s * 0.03, 0.12, 0.07]} s={[0.02, 0.025, 0.01]} />)}
    </group>
  );
};

/* ---------- the farmer ---------- */

const farmerState = (t: number) => {
  const keys: [number, P2][] = [[0, [6.7, 3.9]], [T.s8a - 1.0, [6.7, 3.9]], [E.s8b - 0.4, FARMER_STOP]];
  const m = mover(t, keys);
  const move = clamp(m.sp / 0.6);
  const yaw = angLerp(-Math.PI / 2 - 0.15, m.heading, clamp(move * 2.5));
  const wipe = during(t, E.s8b - 1.6, E.s8b + 0.2, 0.3);
  const notice = ramp(t, RUN_FROM() + 0.5, RUN_FROM() + 1.2);
  const smile = ramp(t, RUN_TO() + 1, RUN_TO() + 2.5);
  const crouch = during(t, JUMP_AT() - 0.6, T.s8d + 0.2, 0.3);
  const lie = during(t, Math.max(T.s8d + 0.3, HELD_AT() + 0.3), E.s8d + 0.4, 0.5);
  const sit = ramp(t, E.s8d, E.s8d + 0.8);
  const hug = ramp(t, HELD_AT() - 0.4, HELD_AT());
  const laugh = during(t, T.s8d, E.s8d + 0.3, 0.3);
  const pose: FarmerPose = {
    walk: t * 6.2, move, slump: (1 - smile) * (1 - sit) * (1 - lie),
    crouch: crouch * (1 - lie), lie, sit,
    roll: lie * Math.sin(t * 4) * 0.22,
    headPitch: notice * 0.35 * (1 - hug) - laugh * 0.2 + sit * 0.25 + Math.sin(t * 0.7) * 0.02,
    mouth: Math.max(mouthOf("petani", t), laugh * Math.abs(Math.sin(t * 12)) * 0.7),
    blink: blinkAt(t, 21), smile: Math.max(smile, laugh),
    armR: wipe > 0.01 ? [lerp(0.05, 2.3, wipe), lerp(0.12, 0.45, wipe)] : [lerp(0.05, 1.05, Math.max(hug, crouch * 0.8)), lerp(0.12, 0.38, hug)],
    elbowR: wipe > 0.01 ? lerp(0.15, 1.9, wipe) : lerp(0.15, 1.35, hug),
    armL: [lerp(0.05, 1.05, Math.max(hug, crouch * 0.8)), lerp(0.12, 0.38, hug)],
    elbowL: lerp(0.15, 1.35, hug),
  };
  return { pos: m.p, yaw, pose, visible: t > T.s8a - 1.2 };
};

/* ---------- fireflies ---------- */

const Fireflies: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  if (on < 0.05) return null;
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const cx = lerp(-4.5, 5, hashN(i)), cz = lerp(-1, 4.2, hashN(i + 30));
        const x = cx + Math.sin(t * 0.5 + i) * 0.4, z = cz + Math.cos(t * 0.4 + i * 2) * 0.35;
        const y = 0.5 + hashN(i + 60) * 1.2 + Math.sin(t * 0.9 + i) * 0.15;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
        return <M key={i} g={lump(540, 0, 8)} m={clay("#f9f3a8", 0, 0.3, "#f6ef7a", 3 * on * pulse)} p={[x, y, z]} s={0.025} shadow={false} />;
      })}
    </>
  );
};

/* ---------- lights ---------- */

const Lights: React.FC<{ dusk: number; night: number; lantern: number }> = ({ dusk, night, lantern }) => {
  const sunCol = new ThreeColor("#fff0d4", "#ffb070", dusk);
  const sunPos: V3 = [lerp(7, 9, dusk), lerp(10, 3.2, dusk), lerp(6, -3, dusk)];
  return (
    <>
      <hemisphereLight args={[lerp3("#fff3df", "#8f9fe0", night), lerp3("#7d8f4f", "#3a3a52", night), lerp(0.9, 1.0, night)]} />
      <ambientLight color={lerp3("#fff7ed", "#5a6699", night)} intensity={lerp(0.35, 0.5, night)} />
      <directionalLight
        position={night > 0.5 ? [-6, 9, 5] : sunPos}
        color={night > 0.5 ? "#9fb2ff" : sunCol.hex}
        intensity={night > 0.5 ? lerp(0.3, 1.3, night) : lerp(2.3, 1.7, dusk) * (1 - night * 1.6)}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[-5, 2.5, 6]} color="#ffd9bf" intensity={lerp(6, 2, night)} distance={16} decay={1.6} />
      {lantern > 0.02 ? <pointLight position={[LANTERN[0] + 0.24, LANTERN[1] + 1.15, LANTERN[2] + 0.1]} color="#ffb35a" intensity={lantern * 14} distance={7.5} decay={1.4} /> : null}
      {night > 0.02 ? <pointLight position={[0.2, 2.6, 5.2]} color="#c9d4ff" intensity={night * 7} distance={9} decay={1.4} /> : null}
      {night > 0.02 ? <pointLight position={[0.9, 1.1, -3.6]} color="#ffbf6a" intensity={night * 5} distance={5} decay={1.5} /> : null}
    </>
  );
};
class ThreeColor {
  hex: string;
  constructor(a: string, b: string, k: number) {
    this.hex = lerp3(a, b, k);
  }
}
function lerp3(a: string, b: string, k: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k))).toString(16).padStart(2, "0")).join("");
}

/* ---------- cameras ---------- */

type Key = [number, V3, V3, number];
const camKeys = (): Key[] => [
  [0, [0.6, 11, 16], [0, 0.2, -1], 34],
  [T.s1b - 0.3, [2.6, 2.8, 6.0], [0.9, 0.4, 0.9], 34],
  [E.s1b, [1.9, 1.05, 3.1], [0.9, 0.4, 0.9], 32],
  [T.s1c + 1.2, [1.2, 1.2, 3.2], [0.1, 0.4, 0.3], 34],
  [E.s1c, [-0.2, 1.5, 3.0], [-2.1, 0.55, -0.9], 36],
  [T.s2a + 1.2, [-0.6, 1.5, 4.2], [-2.8, 0.95, -1.3], 40],
  [T.s2b, [-1.0, 1.25, 3.6], [-2.9, 0.95, -1.4], 40],
  [E.s2d, [-1.1, 1.1, 3.2], [-2.95, 1.0, -1.5], 38],
  [T.s2e + 0.3, [-0.9, 1.1, 1.9], [-1.7, 0.35, -0.6], 38],
  [T.s3a + 1.5, [0.7, 1.3, 2.8], [-0.7, 0.6, -1.2], 38],
  [T.s3b, [-1.9, 1.1, 2.8], [-0.9, 0.7, -1.9], 40],
  [E.s3c, [-1.75, 1.0, 2.4], [-0.9, 0.72, -1.9], 38],
  [T.s4a + 0.6, [0.8, 1.2, 2.7], [1.5, 0.55, -1.2], 38],
  [T.s4b, [2.6, 1.2, 3.4], [2.0, 0.55, -1.4], 40],
  [E.s4c, [2.5, 1.1, 3.1], [2.0, 0.55, -1.4], 38],
  [T.s5a + 1, [1.3, 1.7, 4.6], [2.6, 0.3, 0.3], 40],
  [T.s5b, [3.0, 0.85, 2.5], [3.6, 0.4, 0.4], 40],
  [E.s5b, [3.0, 0.85, 2.35], [3.65, 0.4, 0.4], 38],
  [T.s5c, [2.2, 1.25, 0.0], [4.0, 0.85, 1.7], 40],
  [E.s5c, [2.25, 1.2, 0.15], [4.0, 0.85, 1.7], 38],
  [T.s5d + 0.8, [3.2, 6.2, 5.2], [1.2, 0, -0.6], 42],
  [E.s5d + 0.6, [3.0, 6.6, 5.6], [1.2, 0, -0.6], 42],
  [T.s6a + 2.5, [0.4, 2.2, 5.2], [-1.0, 0.3, 1.1], 38],
  [E.s6a, [-1.6, 1.0, 4.1], [-2.7, 0.35, 1.5], 34],
  [T.s6b, [-1.85, 0.65, 3.7], [-2.75, 0.35, 1.5], 32],
  [E.s6b, [-1.9, 0.6, 3.5], [-2.75, 0.35, 1.5], 31],
  [T.s6c + 0.8, [-1.8, 1.4, 4.6], [-3.8, 0.45, 1.2], 40],
  [E.s6c + 0.5, [-2.9, 1.05, 5.8], [-3.1, 0.4, 1.35], 38],
  [T.s7a, [-3.0, 0.95, 5.6], [-3.08, 0.4, 1.35], 38],
  [T.s7d, [-3.0, 0.85, 5.3], [-3.08, 0.42, 1.35], 38],
  [E.s7d + 0.4, [-3.0, 0.82, 5.15], [-3.08, 0.42, 1.38], 38],
  [T.s8a + 0.5, [1.8, 2.0, 8.4], [5.0, 0.9, 3.2], 40],
  [E.s8a, [1.6, 1.8, 7.8], [4.2, 1.0, 2.9], 38],
  [T.s8b + 1, [0.2, 1.4, 4.7], [2.6, 1.05, 2.4], 36],
  [RUN_FROM(), [0.2, 1.4, 4.8], [2.6, 1.0, 2.4], 36],
  [RUN_FROM() + 0.6, [0.0, 1.3, 5.6], [-1.4, 0.35, 1.8], 40],
  [RUN_TO(), [0.4, 1.5, 6.2], [1.9, 0.5, 2.4], 40],
  [JUMP_AT(), [0.9, 1.0, 4.6], [2.3, 0.75, 2.4], 40],
  [T.s8d + 0.5, [1.0, 2.2, 4.5], [2.6, 0.3, 2.3], 40],
  [E.s8d, [1.0, 2.0, 4.4], [2.6, 0.35, 2.3], 38],
  [T.s8e + 0.5, [0.1, 1.35, 3.25], [2.5, 0.8, 2.4], 36],
  [E.s8f, [0.3, 1.3, 3.15], [2.5, 0.82, 2.4], 34],
  [T.s9a + 2, [2.4, 2.8, 7.6], [1.6, 0.6, 1.6], 36],
  [T.s9c, [1.6, 6.5, 12.5], [0.6, 0.3, -0.5], 36],
  [TOTAL_SECONDS, [0.6, 10.5, 16], [0, 0.2, -1], 34],
];

const shotAt = (t: number, f: number): Shot => {
  const K = camKeys();
  const pos = kv3(t, K.map((k) => [k[0], k[1]]));
  const at = kv3(t, K.map((k) => [k[0], k[2]]));
  const fov = kv(t, K.map((k) => [k[0], k[3]]));
  // stop-motion rig: the camera nudges in stepped increments
  const sf = Math.floor(f / 4) * 4;
  const d = Math.hypot(pos[0] - at[0], pos[1] - at[1], pos[2] - at[2]);
  const jit = 0.006 * d;
  return {
    pos: [pos[0] + Math.sin(sf * 0.031) * jit, pos[1] + Math.cos(sf * 0.027) * jit, pos[2]],
    target: at, fov, focus: d, aperture: lerp(0.0035, 0.0012, clamp((d - 3) / 10)), maxBlur: 0.009, exposure: 1.0,
  };
};

/* ---------- the scene ---------- */

const Scene: React.FC<{ t: number; st: number; f: number }> = ({ t, st, f }) => {
  const dusk = ramp(t, T.s5d, T.s6c);
  const night = ramp(t, E.s7d - 1, T.s8a + 2);
  const shot = shotAt(t, f);
  const pup = pupPose(st);
  const dog = dogPose(st);
  const farmer = farmerState(st);
  const held = st >= HELD_AT();
  const jump = clamp((st - JUMP_AT()) / (HELD_AT() - JUMP_AT()));
  const pupGroup = (
    <group scale={PUP_SCALE}>
      <Quad spec={PUP} pose={pup.pose} />
      <Tears t={st} on={pup.crying} />
    </group>
  );
  // during the jump the puppy flies from the farmer's feet to his chest
  const fy = farmer.yaw;
  const jumpPos: V3 = [lerp(AT_FARMER[0], farmer.pos[0] + Math.sin(fy) * 0.5, jump), Math.sin(jump * Math.PI) * 0.35 + jump * 0.5, lerp(AT_FARMER[1], farmer.pos[1] + Math.cos(fy) * 0.5, jump)];
  return (
    <>
      <CameraRig shot={shot} near={0.1} far={80} />
      <color attach="background" args={[lerp3("#2a211b", "#14151f", night)]} />
      <Lights dusk={dusk} night={night} lantern={night} />
      <FarmSet t={st} dusk={dusk} night={night} eggs={st > T.s5b + 1.2 ? 4 : 3} />
      <Animals t={st} pup={pup.pos} />
      <Mouse t={st} />
      <group position={[dog.pos[0], 0, dog.pos[1]]} rotation={[0, dog.yaw, 0]} scale={1.15}>
        <Quad spec={OLDDOG} pose={dog.pose} />
      </group>
      {!held ? (
        jump > 0 ? (
          <group position={jumpPos} rotation={[0, pup.yaw, 0]} scale={pup.scale / PUP_SCALE}>{pupGroup}</group>
        ) : (
          <group position={[pup.pos[0], 0, pup.pos[1]]} rotation={[0, pup.yaw, 0]} scale={pup.scale / PUP_SCALE}>{pupGroup}</group>
        )
      ) : null}
      {farmer.visible ? (
        <group position={[farmer.pos[0], 0, farmer.pos[1]]} rotation={[0, farmer.yaw, 0]}>
          <Farmer
            pose={farmer.pose}
            held={held ? (
              <group position={[0, -0.3, -0.02]} rotation={[0.05, 0, 0]} scale={0.95}>
                <group scale={PUP_SCALE}>
                  <Quad spec={PUP} pose={{ ...pup.pose, sit: 0.6, move: 0, hop: 0, walk: 0, wag: 1, headPitch: -0.35, mouth: Math.max(0, Math.sin(st * 9)) * 0.5, lick: 0, earDroop: 0.1, brow: -0.2 }} />
                </group>
              </group>
            ) : undefined}
          />
        </group>
      ) : null}
      {farmer.visible && night > 0.02 ? (
        <pointLight position={[farmer.pos[0] + Math.sin(farmer.yaw) * 1.3, 2.0, farmer.pos[1] + Math.cos(farmer.yaw) * 1.3 + 0.4]} color="#ffd2a1" intensity={night * 4} distance={4} decay={1.5} />
      ) : null}
      <Fireflies t={st} on={night} />
      <Post shot={shot} frame={f} aoRadius={0.18} profile={COLOR_PROFILES.DOCUMENTARY_WARM} />
    </>
  );
};

/* ---------- overlays ---------- */

const COLOR: Record<string, string> = {
  narator: "#FFE7B3", anak: "#FFB86B", kuda: "#E8A07A", sapi: "#F2A7B8", domba: "#CDE3F5", ayam: "#FF8A7A", kucing: "#F7C25A", tua: "#C9D7C0", petani: "#9FD3FF",
};
const LABEL: Record<string, string> = {
  narator: "NARATOR", anak: "ANJING KECIL", kuda: "KUDA", sapi: "SAPI", domba: "DOMBA", ayam: "AYAM", kucing: "KUCING", tua: "ANJING TUA", petani: "PEMILIK LADANG",
};

type Phrase = { who: string; id: string; words: Clip["words"]; start: number; end: number };
const PHRASES: Phrase[] = CLIPS.flatMap((c) => {
  const out: Phrase[] = [];
  let cur: Clip["words"] = [];
  c.words.forEach((w, i) => {
    cur.push(w);
    const stop = /[.,?!…]$/.test(w.w) && cur.length >= 3;
    if (stop || cur.length >= 7 || i === c.words.length - 1) {
      out.push({ who: c.who, id: c.id, words: cur, start: cur[0].s, end: cur[cur.length - 1].e });
      cur = [];
    }
  });
  return out;
});

const Captions: React.FC<{ t: number; st: number }> = ({ t, st }) => {
  const i = PHRASES.findIndex((p, n) => t >= p.start - 0.05 && t < Math.min(p.end + 0.4, PHRASES[n + 1]?.start ?? 1e9));
  if (i < 0) return null;
  const p = PHRASES[i];
  if (p.id === "s9b") return null; // the hikmah line gets its own card
  const col = COLOR[p.who] ?? "#fff";
  const pop = clamp((t - p.start + 0.05) / 0.15);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1250, textAlign: "center", fontFamily: BODY }}>
      <div style={{ display: "inline-block", fontFamily: DISPLAY, fontSize: 27, fontWeight: 600, letterSpacing: 3, color: "#2b1d14", background: col, padding: "6px 22px 5px", borderRadius: 30, marginBottom: 16, boxShadow: "0 4px 0 rgba(0,0,0,.28)", transform: `rotate(${(hashN(i) - 0.5) * 3}deg) scale(${0.9 + pop * 0.1})` }}>
        {LABEL[p.who] ?? p.who.toUpperCase()}
      </div>
      <div style={{ fontSize: 52, lineHeight: 1.28, fontWeight: 800, color: "#fffaf0", textShadow: "0 3px 0 rgba(43,29,20,.85), 0 0 22px rgba(20,12,8,.75)" }}>
        {p.words.map((w, k) => {
          const on = t >= w.s && t < w.e + 0.04;
          const bounce = on ? Math.sin(clamp((st - w.s) / 0.17) * Math.PI) * -6 : 0;
          return (
            <span key={k} style={{ color: on ? col : "#fffaf0", display: "inline-block", transform: `translateY(${bounce}px)` }}>
              {w.w}&nbsp;
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Overlay: React.FC<{ t: number; st: number }> = ({ t, st }) => {
  const title = ramp(t, 0.5, 1.2) * (1 - ramp(t, T.s1c - 0.6, T.s1c + 0.2));
  const hik = during(t, T.s9b - 0.3, E.s9b + 1.0, 0.5);
  const outroStart = TOTAL_SECONDS - 3.2;
  const outro = ramp(t, outroStart, outroStart + 0.6);
  const titleWob = Math.sin(Math.floor(t * 12) * 1.3) * 0.6;
  return (
    <>
      {t < outroStart ? <Captions t={t} st={st} /> : null}
      {title > 0 ? (
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 30}px)` }}>
          <div style={{ display: "inline-block", fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, letterSpacing: 8, color: "#2b1d14", background: "#FFE7B3", padding: "8px 28px", borderRadius: 40, boxShadow: "0 5px 0 #b77a3e", transform: `rotate(${-2 + titleWob}deg)` }}>
            CERITA HIKMAH
          </div>
          <div style={{ marginTop: 26, fontFamily: DISPLAY, fontSize: 132, fontWeight: 700, lineHeight: 0.95, color: "#FFB86B", textShadow: "0 8px 0 #8a4a22, 0 14px 26px rgba(0,0,0,.45)", transform: `rotate(${1 + titleWob * 0.5}deg)` }}>
            Anjing<br />Kecil
          </div>
        </div>
      ) : null}
      {hik > 0 ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 560, opacity: hik, transform: `scale(${0.92 + hik * 0.08}) rotate(-1.5deg)` }}>
          <div style={{ background: "#FFF3DC", borderRadius: 44, padding: "56px 50px 52px", boxShadow: "0 12px 0 #c98a4b, 0 30px 60px rgba(0,0,0,.45)", textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 28, letterSpacing: 7, color: "#b5652f", fontWeight: 600, marginBottom: 22 }}>HIKMAH</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 76, lineHeight: 1.08, fontWeight: 700, color: "#3a2416" }}>
              {(CLIPS.find((c) => c.id === "s9b")?.words ?? []).map((w, k) => (
                <span key={k} style={{ color: t >= w.s ? "#d9612e" : "#3a2416", whiteSpace: w.w.includes("-") ? "nowrap" : "normal" }}>{w.w} </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {outro > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: outro, background: "#0B3D2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("brand/stacked-reversed.svg")} style={{ width: 430 }} />
          <div style={{ marginTop: 44, color: "#e8f2ec", fontSize: 34, letterSpacing: 3, fontWeight: 700, fontFamily: BODY }}>Created by Agus Dwi R.</div>
        </div>
      ) : null}
    </>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const t = f / FILM_FPS;
  const st = stepT(t);
  return (
    <>
      <Stage3D background="#1d1712" fadeColor="#1d1712" fade={1 - ramp(t, 0.05, 0.9)} overlay={() => <Overlay t={t} st={st} />}>
        <Scene t={t} st={st} f={f} />
      </Stage3D>
      <Html5Audio src={AUDIO} />
    </>
  );
};
