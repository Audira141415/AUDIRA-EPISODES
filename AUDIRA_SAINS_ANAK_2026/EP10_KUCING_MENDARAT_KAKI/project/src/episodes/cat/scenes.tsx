// EP10 Kucing Mendarat — one set + camera pose per scene (multi-scene director, see CatFilm.tsx).
// Every pose moves through its scene (push, orbit, truck, crane, tilt); nothing is parked.
import React from "react";
import type { FilmShot } from "../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { ANATOMY_PALETTE as A } from "../../kits/anatomix/lib/palette";
import { Cat, type CatPose } from "./Cat.tsx";
import { Arc, FilmStrip, grainTex, Lab, LivingRoom, Shock } from "./sets.tsx";
import { lerp, prog, ramp, type SceneId } from "./timeline.ts";

type V3 = [number, number, number];
export type SceneOut = {
  node: React.ReactNode;
  shot: FilmShot;
  profile: (typeof COLOR_PROFILES)[keyof typeof COLOR_PROFILES];
  bg: string;
};

const PI = Math.PI;
const ORANGE = "#FF9A3C";
const BLUE = "#3B7BFF";

/** room lights shared by hook / landing / outro */
const RoomLights: React.FC = () => (
  <>
    <ambientLight intensity={0.22} color="#8FA2D8" />
    <hemisphereLight args={["#9DB8FF", "#3A2A1E", 0.35]} />
    <directionalLight position={[-4, 3.2, 2.4]} intensity={1.6} color="#AFC6FF" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-0.0004} />
    <directionalLight position={[2, 1.5, 4]} intensity={0.55} color="#FFD7A8" />
  </>
);

const LabLights: React.FC = () => (
  <>
    <ambientLight intensity={0.25} color={A.holoSoft} />
    <directionalLight position={[2, 4, 3]} intensity={1.2} color="#CFFAF5" />
    <pointLight position={[0, 0.3, 0]} intensity={2} distance={4} color={A.holo} />
    <directionalLight position={[-3, 1, -2]} intensity={0.45} color="#8F7BFF" />
  </>
);

// ── 1 hook: cat drops belly-up from the bookcase, rights itself, lands ───────
const CAT_X = -0.35;
const CAT_Z = 0.55;
const hook = (t: number): SceneOut => {
  const fall = Math.min(1, Math.max(0, (t - 0.3) / (5.35 - 0.3)));
  const y = 1.95 * (1 - Math.pow(fall, 1.7));
  const pose: CatPose = {
    front: PI * (1 - ramp(t, 2.3, 3.6)),
    rear: PI * (1 - ramp(t, 3.0, 4.3)),
    foldFront: ramp(t, 2.1, 2.6) * (1 - ramp(t, 3.8, 4.4)),
    extendHind: ramp(t, 2.1, 2.6) * (1 - ramp(t, 4.0, 4.6)),
    arch: ramp(t, 4.3, 5.0) * (1 - ramp(t, 5.6, 6.2)),
    crouch: ramp(t, 5.3, 5.55) * (1 - ramp(t, 5.9, 6.6)),
    headTilt: 0.12 * Math.sin(t * 1.3) * ramp(t, 6, 7),
  };
  const x = lerp(-0.9, CAT_X, fall);
  const z = lerp(-0.25, CAT_Z, fall);
  const d = lerp(2.4, 1.45, ramp(t, 0, 8.6));
  return {
    node: (
      <group>
        <LivingRoom />
        <RoomLights />
        <Cat mode="real" pose={pose} position={[x, y, z]} rotation={[0, 0.55, 0]} />
        <Shock k={(t - 5.35) / 0.8} position={[x, 0.01, z]} />
      </group>
    ),
    shot: { pos: [x + 0.55, y + 0.45 + 0.25 * (1 - fall), z + d], target: [x, y + 0.2, z], fov: 42 },
    profile: COLOR_PROFILES.CINEMA_TEAL_ORANGE,
    bg: "#0E1220",
  };
};

// ── 2 Marey 1894: chronophotography strip, 6 sepia frames, truck → kitten ──
const MAREY_STAGES: CatPose[] = [0, 1, 2, 3, 4, 5].map((i) => {
  const k = i / 5;
  return {
    front: PI * (1 - Math.min(1, k * 1.7)),
    rear: PI * (1 - Math.min(1, Math.max(0, k * 1.6 - 0.45))),
    foldFront: i >= 1 && i <= 3 ? 1 : 0,
    extendHind: i >= 1 && i <= 3 ? 0.8 : 0,
    arch: i === 5 ? 0.6 : 0,
  };
});
let cloth: ReturnType<typeof grainTex> | null = null;
let mfloor: ReturnType<typeof grainTex> | null = null;
const MAREY_CLOTH = () => (cloth ??= grainTex("#17110B", { seed: 21, grid: 24, gridColor: "rgba(0,0,0,0.25)", repeat: 6 }));
const MAREY_FLOOR = () => (mfloor ??= grainTex("#3A2D1E", { seed: 23, planks: 6, repeat: 4 }));
const marey = (t: number): SceneOut => {
  const k = prog(t, "marey");
  const reveal = ramp(t, 13.4, 15.4);
  const kitten = ramp(t, 23.3, 24.2);
  const x = lerp(-2.1, 1.9, ramp(t, 9.2, 22.8));
  const camY = lerp(1.15, 0.55, kitten);
  const camX = lerp(x, 0.0, kitten);
  const d = lerp(2.9, 2.1, kitten);
  return {
    node: (
      <group>
        <mesh position={[0, 1.6, -1.2]}>
          <planeGeometry args={[14, 6]} />
          <meshStandardMaterial map={MAREY_CLOTH()} roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial map={MAREY_FLOOR()} roughness={0.9} />
        </mesh>
        <FilmStrip frames={6} spacing={0.82} y={1.15} reveal={reveal} />
        {MAREY_STAGES.map((p, i) => {
          const on = Math.min(1, Math.max(0, reveal * 6 - i));
          return (
            <group key={i} position={[(i - 2.5) * 0.82, 0.86, -0.7]} scale={0.0001 + on}>
              <Cat mode="real" tint="#D9B27A" pose={p} rotation={[0, 0, 0]} scale={1.15} />
            </group>
          );
        })}
        {kitten > 0 && (
          <Cat mode="real" anim={{ name: "Walk", time: t * 1.1 }} tint="#E3C38E" position={[0, 0, lerp(0.2, 0.75, ramp(t, 23.5, 27.5))]} rotation={[0, 0.35, 0]} scale={0.6} />
        )}
        <ambientLight intensity={0.35} color="#FFE2B8" />
        <spotLight position={[x, 3.2, 2.2]} target-position={[x, 1, -0.8]} angle={0.7} penumbra={0.6} intensity={14} color="#FFE6C2" castShadow />
        <directionalLight position={[1, 2, 3]} intensity={0.8} color="#FFD9A0" />
      </group>
    ),
    shot: { pos: [camX, camY + 0.05 * Math.sin(k * 6), d], target: [camX * 0.96, camY - 0.1, -0.7], fov: 40 },
    profile: COLOR_PROFILES.VINTAGE_SEPIA_FILM,
    bg: "#0C0906",
  };
};

// ── 3 inner ear: hologram cat, push into the head, canals + fluid ───────────
const ear = (t: number): SceneOut => {
  const k = prog(t, "ear");
  const tilt = 0.38 * Math.sin((t - 34.6) * 2.4) * ramp(t, 34.6, 35.2) * (1 - ramp(t, 38.8, 39.4));
  const push = ramp(t, 28.2, 33.6);
  const a = lerp(0.65, 0.95, k);
  const d = lerp(3.6, 1.4, push) + 0.35 * ramp(t, 39.3, 40.6);
  const tgt: V3 = [0.03, lerp(0.75, 0.9, push), lerp(0.1, 0.5, push)];
  return {
    node: (
      <group>
        <Lab t={t} />
        <LabLights />
        <Cat mode="holo" pose={{ front: 0, rear: 0, headTilt: tilt }} ear={ramp(t, 27.6, 28.2)} fluid={-tilt * 2.2} spine={0.1} scale={3} />
      </group>
    ),
    shot: { pos: [tgt[0] + Math.sin(a) * d, tgt[1] + 0.25 * d, tgt[2] + Math.cos(a) * d], target: tgt, fov: 38 },
    profile: COLOR_PROFILES.CYBER_NEON_VOID,
    bg: A.void,
  };
};

// ── 4 spine + clavicle: side view, spine flexes, front vs rear twist ─────────
const spine = (t: number): SceneOut => {
  const k = prog(t, "spine");
  const bend = 0.45 * Math.sin((t - 42.2) * 3.2) * ramp(t, 42.2, 42.6) * (1 - ramp(t, 43.4, 43.9));
  const twist = 0.75 * Math.sin((t - 49.5) * 2.3) * ramp(t, 49.4, 49.9) * (1 - ramp(t, 52.6, 53.3));
  const clav = ramp(t, 45.6, 46.0) * (0.6 + 0.4 * Math.sin(t * 9)) * (1 - ramp(t, 48.6, 49.2));
  const a = lerp(1.45, 0.75, k);
  const d = lerp(4.7, 3.9, k) - 1.2 * ramp(t, 45.5, 46.5) * (1 - ramp(t, 48.5, 49.5));
  const tgt: V3 = [0, 0.6, 0.1 + 0.15 * ramp(t, 45.5, 46.5) * (1 - ramp(t, 48.5, 49.5))];
  return {
    node: (
      <group>
        <Lab t={t} />
        <LabLights />
        <Cat mode="holo" pose={{ front: twist, rear: -twist * 0.15, bend, arch: 0 }} spine={ramp(t, 43.4, 44.0)} clavicle={clav} scale={3} />
      </group>
    ),
    shot: { pos: [Math.sin(a) * d, 0.95, Math.cos(a) * d], target: tgt, fov: 38 },
    profile: COLOR_PROFILES.CYBER_NEON_VOID,
    bg: A.void,
  };
};

// ── 5 angular momentum: belly-up hologram, front 90°, rear 10°, swap, upright ─
// camera sits behind the Lab wall (z < -2.6), so this scene gets its own grid wall in front of it
let mwall: ReturnType<typeof grainTex> | null = null;
const MOMENTUM_WALL = () => (mwall ??= grainTex(A.void, { seed: 7, grid: 16, gridColor: "rgba(63,224,208,0.22)", repeat: 3 }));
const momentum = (t: number): SceneOut => {
  const k = prog(t, "momentum");
  const front = PI - (PI / 2) * ramp(t, 61.0, 64.0) - (PI / 2) * ramp(t, 72.0, 73.8);
  const rear = PI - 0.1745 * ramp(t, 66.3, 68.8) - (PI / 2 - 0.1745) * ramp(t, 70.0, 71.4) - (PI / 2) * ramp(t, 72.0, 73.8);
  const fold = ramp(t, 59.2, 59.8) * (1 - ramp(t, 69.8, 70.6));
  const ext = ramp(t, 65.0, 65.7) * (1 - ramp(t, 69.8, 70.6));
  const arcs = ramp(t, 60.6, 61.0) * (1 - ramp(t, 73.9, 74.4));
  const y = 1.0 + 0.04 * Math.sin(t * 1.4);
  const a = lerp(PI + 0.35, PI + 0.15, k);
  const d = lerp(2.9, 2.5, k);
  const h = lerp(1.15, 1.9, ramp(t, 72.0, 74.4));
  return {
    node: (
      <group>
        <Lab t={t} />
        <LabLights />
        <mesh position={[0, 1.5, 2.9]} rotation={[0, PI, 0]}>
          <planeGeometry args={[14, 9]} />
          <meshBasicMaterial map={MOMENTUM_WALL()} />
        </mesh>
        <group position={[0, y, 0]}>
          <Cat
            mode="holo"
            pose={{ front, rear, foldFront: fold, extendHind: ext }}
            spine={0.9}
            scale={2.4}
            position={[0, -0.5, 0]}
          />
          {arcs > 0 && (
            <group scale={arcs}>
              <Arc radius={0.5} angle={PI - front} color={ORANGE} z={0.32} />
              <Arc radius={0.5} angle={PI - rear} color={BLUE} z={-0.32} />
            </group>
          )}
        </group>
      </group>
    ),
    shot: { pos: [Math.sin(a) * d, h, Math.cos(a) * d], target: [0, 0.95, 0], fov: 40 },
    profile: COLOR_PROFILES.CYBER_NEON_VOID,
    bg: A.void,
  };
};

// ── 6 landing payoff: back in the room, reach, arch, spring knees, impact ────
const LAND = 79.0;
const landing = (t: number): SceneOut => {
  const fall = Math.min(1, Math.max(0, (t - 74.6) / (LAND - 74.6)));
  const y = 0.85 * (1 - Math.pow(fall, 1.8));
  const pose: CatPose = {
    front: 0.35 * (1 - ramp(t, 74.6, 75.9)),
    rear: 0.2 * (1 - ramp(t, 74.6, 75.9)),
    foldFront: 0.8 * (1 - ramp(t, 75.6, 76.6)),
    extendHind: 0.5 * (1 - ramp(t, 75.6, 76.6)),
    arch: ramp(t, 77.4, 78.2) * (1 - ramp(t, 79.6, 80.6)),
    crouch: ramp(t, LAND, LAND + 0.35) * (1 - ramp(t, 80.3, 81.2)),
  };
  const d = lerp(1.55, 1.1, ramp(t, 74.6, LAND)) + 0.25 * ramp(t, 80.0, 82.4);
  const a = lerp(-0.5, -0.15, ramp(t, 74.6, 82.4));
  const feet = [
    [0.07, 0.2],
    [-0.07, 0.2],
    [0.07, -0.18],
    [-0.07, -0.18],
  ];
  return {
    node: (
      <group>
        <LivingRoom />
        <RoomLights />
        <Cat mode="real" pose={pose} position={[CAT_X, y, CAT_Z]} rotation={[0, 0.55, 0]} />
        {feet.map(([fx, fz], i) => (
          <Shock key={i} k={(t - LAND - i * 0.04) / 0.9} position={[CAT_X + fx + fz * 0.5, 0.012, CAT_Z + fz * 0.85 - fx * 0.5]} />
        ))}
      </group>
    ),
    shot: { pos: [CAT_X + Math.sin(a) * d, 0.16 + 0.25 * (1 - fall), CAT_Z + Math.cos(a) * d], target: [CAT_X, y * 0.8 + 0.18, CAT_Z], fov: 44 },
    profile: COLOR_PROFILES.CINEMA_TEAL_ORANGE,
    bg: "#0E1220",
  };
};

// ── 7 outro: cat idles on the rug, slow orbit back, brand print in frame ─────
const outro = (t: number): SceneOut => {
  const k = prog(t, "outro");
  const a = lerp(-0.1, 0.55, k);
  const d = lerp(1.4, 2.3, k);
  return {
    node: (
      <group>
        <LivingRoom />
        <RoomLights />
        <Cat mode="real" anim={{ name: "Idle", time: t - 82.4 }} position={[CAT_X, 0, CAT_Z]} rotation={[0, 0.55, 0]} />
      </group>
    ),
    shot: { pos: [CAT_X + Math.sin(a) * d, lerp(0.45, 1.25, k), CAT_Z + Math.cos(a) * d], target: [lerp(CAT_X, CAT_X + 0.35, k), lerp(0.2, 0.55, k), lerp(CAT_Z, CAT_Z - 0.3, k)], fov: 42 },
    profile: COLOR_PROFILES.CINEMA_TEAL_ORANGE,
    bg: "#0E1220",
  };
};

export const SCENE_FN: Record<SceneId, (t: number) => SceneOut> = { hook, marey, ear, spine, momentum, landing, outro };
