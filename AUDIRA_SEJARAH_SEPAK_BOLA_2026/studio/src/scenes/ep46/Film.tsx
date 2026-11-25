// EP46 film (TIMEFORGE, pearl studio of the series, pattern of ep02/Film.tsx, no <Finish>).
// Arthur Wharton's life as one time line through the studio: hook = the approved cover frame,
// then the camera walks set by set: Gold Coast 1865 → ship to England 1882 → sprint 1886 →
// bicycle + cricket → keeper under a wooden crossbar (Preston) → hero pedestal 1889 (first Black
// professional) → 1894 top flight → grey mine (1902) → nameless grave (Dec 1930) → gold light:
// new headstone 1997, Hall of Fame 2003, bronze statue 2014 → wide outro over the whole line.
// Every cut, card and caption is keyed to the locked VO (timeline.json). No audio here.
// Facts: EP46 research/SOURCE_REGISTER.md rows 1–11.
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig, FX_LAYER, Post, type Shot } from "../../core/render/Post.tsx";
import { Studio, type StudioLook } from "../../core/studio/Studio.tsx";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { ToyPerson, SKIN_TONES, poseAt, type Pose as BodyPose } from "../../core/polish/Person.tsx";
import { INK, MANROPE, manropeReady } from "../../core/type/fonts.ts";
import { Outro } from "../_shared/Outro.tsx";
import { Ball } from "../ep02/Cover.tsx";
import { glowTexture } from "../ep02/coverTextures.ts";
import {
  ASH, BronzeStatue, CAM_POS, CAM_TARGET, FOV, Grave, GRAVE, GREEN, HERO, HeroStage, Keeper, LOOK, Overlay, PITCH, RUN, SmallPedestal,
  STATUE, TimeLines, WoodGoal,
} from "./Cover.tsx";
import { smallPlaqueTexture, turfTexture, woodTexture } from "./coverTextures.ts";
import { GlbLive } from "./GlbLive.tsx";
import tl from "./timeline.json";

type V3 = [number, number, number];
type Clip = { id: string; start: number; end: number; words: { w: string; s: number; e: number }[] };
const CLIPS = tl.clips as Clip[];
const S = tl.sections as unknown as Record<string, [number, number]>;
const TOTAL = tl.total;

const GOLD = "#c9a04a";
const SEA = "#3f86c9";

// ---------- time helpers ----------
const W = (id: string, i: number) => CLIPS.find((c) => c.id === id)!.words[i].s;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const win = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
const bump = (t: number, a: number, len = 0.45) => {
  const x = (t - a) / len;
  return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------- key moments (VO seconds) ----------
const T = {
  tanpaHook: W("hook", 8),
  ini: W("hook", 13),
  y1865: W("konteks", 3),
  gold: W("konteks", 10),
  ghana: W("konteks", 13),
  fante: W("konteks", 16),
  y1882: W("konteks", 19),
  misi: W("konteks", 29),
  rencana: W("konteks", 36),
  y1886: W("pengembangan", 0),
  rekor: W("pengembangan", 8),
  seratus: W("pengembangan", 11),
  sepuluh: W("pengembangan", 14),
  sepeda: W("pengembangan", 18),
  kriket: W("pengembangan", 20),
  tapiKiper: W("pengembangan", 22),
  mistar: W("pengembangan", 31),
  preston: W("pengembangan", 36),
  semifinal: W("pengembangan", 40),
  y1889: W("penjelasan", 0),
  rotherham: W("penjelasan", 6),
  resmi: W("penjelasan", 10),
  pertama: W("penjelasan", 16),
  lima: W("penjelasan", 17),
  kasta: W("penjelasan", 23),
  sheffield: W("penjelasan", 26),
  tapiJatuh: W("payoff", 0),
  y1902: W("payoff", 3),
  runtuh: W("payoff", 8),
  buruh: W("payoff", 15),
  desember: W("payoff", 19),
  wafat: W("payoff", 25),
  tanpa: W("payoff", 29),
  enam: W("payoff", 31),
  kampanye: W("payoff", 36),
  memasang: W("payoff", 38),
  y2003: W("payoff", 40),
  hall: W("payoff", 46),
  y2014: W("payoff", 52),
  patung: W("payoff", 57),
  stGeorge: W("payoff", 60),
  pelopor: W("outro", 0),
  menurutmu: W("outro", 4),
  ikuti: W("outro", 15),
};
// closing card (AudiraOutro in Root.tsx) covers the last 3.8 s
const OUTRO_START = TOTAL - 3.8;

// ---------- set layout (world units; the cover cluster sits around the origin) ----------
const COAST = { x: -11, z: 9, w: 3.4, d: 2.6, h: 0.8 };
const ENGLAND = { x: -11, z: 1.4, w: 1.6, h: 1.0 };
const SEA_Z: [number, number] = [7.7, 2.2];
const SHIP_Z: [number, number] = [7.3, 2.75];
const TRACK = { x: -13, z: -9, w: 8, d: 1.4, h: 0.6 };
const RUN_X: [number, number] = [-16.6, -9.0];
const TAPE_X = -9.5;
const SIDE = { x: -6.4, z: -9, w: 2.6, d: 1.4, h: 0.7 };
const PRESTON = { x: -2.5, z: -12.5, w: 4.6, d: 2.0, h: 0.5 };
const P1894 = { x: -3.3, z: -3.0, w: 1.5, h: 2.5 };
const MINE = { x: 11, z: 4 };
// clean grave set for the 1930 → 1997 beat, far from the cover cluster (the cover grave stays for the hook)
const G2 = { x: 6.5, z: -9.5 };
// 2003 pedestal beside the new grave, so the 67.6 s move is a short slide, not a jump across the studio
const P2003 = { x: 8.7, z: -8.3, w: 0.95, h: 0.8 };

// ---------- camera ----------
type Pose = { pos: V3; target: V3; fov: number };
const COVER: Pose = { pos: CAM_POS, target: CAM_TARGET, fov: FOV };
const orbit = (target: V3, az: number, el: number, d: number, fov = 30): Pose => ({
  target,
  fov,
  pos: [target[0] + d * Math.sin(az) * Math.cos(el), target[1] + d * Math.sin(el), target[2] + d * Math.cos(az) * Math.cos(el)],
});
const GRAVE_T: V3 = [GRAVE.x, 0.85, GRAVE.z - 0.6];
const shipShot = (z: number): Pose => orbit([COAST.x, 0.55, z], 1.2, 0.22, 8);
// runner centred in frame, camera higher so the floor (not the bright backdrop) sits behind his head
const runShot = (x: number): Pose => ({ target: [x, 1.0, TRACK.z], pos: [x + 0.5, 3.5, TRACK.z + 8.8], fov: 30 });
const GRAVE_HOLD = orbit([G2.x - 0.2, 0.8, G2.z - 0.1], 0.12, 0.36, 9.6);

type Move = { a: number; b: number; from: Pose; to: Pose };
const SHOTS: Move[] = [
  { a: 0, b: 2.2, from: COVER, to: { ...COVER, pos: lerp3(CAM_POS, CAM_TARGET, 0.07) } },
  { a: 3.0, b: S.HOOK[1], from: orbit(GRAVE_T, 0.32, 0.5, 11), to: orbit(GRAVE_T, 0.26, 0.3, 7.6) },
  { a: 7.4, b: 13.6, from: orbit([COAST.x, 0.6, COAST.z], 0.45, 0.3, 12.5), to: orbit([COAST.x, 0.6, COAST.z], 0.24, 0.26, 11) },
  { a: 14.2, b: 20.0, from: shipShot(SHIP_Z[0]), to: shipShot(SHIP_Z[1]) },
  { a: 20.6, b: 26.9, from: runShot(RUN_X[0]), to: runShot(RUN_X[1]) },
  { a: 27.3, b: 29.4, from: orbit([SIDE.x, 1.25, SIDE.z], 0.12, 0.2, 7.6), to: orbit([SIDE.x, 1.25, SIDE.z], -0.06, 0.18, 7.0) },
  { a: 30.0, b: 36.4, from: orbit([PRESTON.x, 1.8, PRESTON.z], -1.0, 0.2, 11.5), to: orbit([PRESTON.x, 1.8, PRESTON.z + 0.6], 0.05, 0.14, 11) },
  // hero 1889: target low enough and camera back far enough that the "1889 · AUDIRA" plaque stays whole in frame
  { a: 37.0, b: 44.8, from: orbit([HERO.x, 2.2, HERO.z], 0.2, 0.05, 34, 22), to: orbit([HERO.x, 2.25, HERO.z], 0.08, 0.13, 31.5, 22) },
  { a: 45.3, b: 50.0, from: orbit([-1.7, 2.6, -1.2], -0.12, 0.22, 17), to: orbit([-1.7, 2.6, -1.2], -0.24, 0.2, 15.5) },
  { a: 50.6, b: 57.4, from: orbit([MINE.x, 1.0, MINE.z + 0.5], 0.12, 0.22, 12.5), to: orbit([MINE.x, 0.95, MINE.z + 0.5], 0.04, 0.14, 9) },
  { a: 58.0, b: T.tanpa, from: orbit([G2.x - 0.2, 0.9, G2.z - 0.3], 0.2, 0.6, 12.5), to: GRAVE_HOLD },
  // hold still on the plain stone (stillness before the payoff), then drift right toward the 2003 pedestal
  { a: 62.7, b: 67.1, from: GRAVE_HOLD, to: orbit([G2.x + 0.5, 0.85, G2.z - 0.4], 0.24, 0.27, 9.4) },
  { a: 67.6, b: 70.6, from: orbit([P2003.x - 0.8, 0.4, P2003.z - 0.2], 0.3, 0.3, 9.4), to: orbit([P2003.x - 0.6, 0.45, P2003.z - 0.2], 0.2, 0.28, 8.8) },
  { a: 71.0, b: 74.7, from: orbit([STATUE.x, STATUE.h + 1.0, STATUE.z], 0.3, -0.02, 9), to: orbit([STATUE.x, STATUE.h + 1.1, STATUE.z], 0.18, 0.1, 7.6) },
  // outro: one subject, the 1886 runner back on his pedestal (bookend of the sprint), slow rise and pull-out
  { a: 75.2, b: OUTRO_START, from: orbit([RUN.x, 0.95, RUN.z], 0.95, 0.1, 12.5), to: orbit([RUN.x, 0.85, RUN.z], 0.8, 0.2, 14.5) },
];

const lerpPose = (a: Pose, b: Pose, k: number): Pose => ({ pos: lerp3(a.pos, b.pos, k), target: lerp3(a.target, b.target, k), fov: lerp(a.fov, b.fov, k) });
const moveK = (s: Move, t: number) => seg(t, s.a, s.b) * 0.6 + clamp01((t - s.a) / (s.b - s.a)) * 0.4;
const camAt = (t: number): Pose => {
  for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i];
    if (t <= s.b) {
      if (t >= s.a) return lerpPose(s.from, s.to, moveK(s, t));
      // glide between the previous shot's end and this shot's start (cubic in-out)
      const prev = SHOTS[i - 1];
      return lerpPose(prev.to, s.from, smooth((t - prev.b) / (s.a - prev.b)));
    }
  }
  return SHOTS[SHOTS.length - 1].to;
};
const shotAt = (t: number): Shot => {
  const p = camAt(t);
  const d = Math.hypot(p.pos[0] - p.target[0], p.pos[1] - p.target[1], p.pos[2] - p.target[2]);
  // cover-matched lens in the hook, then a shallower one so far sets soften behind the subject
  const k = seg(t, 2.3, 3.0) * (1 - 0.6 * seg(t, 75.2, 77));
  return { pos: p.pos, target: p.target, fov: p.fov, focus: d, aperture: 0.0012 + 0.002 * k, maxBlur: 0.006 + 0.005 * k, exposure: 1.0 };
};
// subjects that travel with the camera use the same easing as their shot
const shipZ = (t: number) => lerp(SHIP_Z[0], SHIP_Z[1], moveK(SHOTS[3], t));
const runX = (t: number) => lerp(RUN_X[0], RUN_X[1], moveK(SHOTS[4], t));

// ---------- studio mood ----------
const mixLook = (a: StudioLook, b: StudioLook, k: number): StudioLook => ({
  ...a,
  tint: [lerp(a.tint[0], b.tint[0], k), lerp(a.tint[1], b.tint[1], k), lerp(a.tint[2], b.tint[2], k)],
  tintAmount: lerp(a.tintAmount, b.tintAmount, k),
  keyIntensity: lerp(a.keyIntensity, b.keyIntensity, k),
  envIntensity: lerp(a.envIntensity, b.envIntensity, k),
});
const WARM: StudioLook = { ...LOOK, tint: [1.08, 0.99, 0.84], keyIntensity: 2.6 };
const GREY: StudioLook = { ...LOOK, tint: [0.86, 0.9, 0.96], tintAmount: 0.92, keyIntensity: 1.5, envIntensity: 0.55 };
const MINE_DARK: StudioLook = { ...GREY, keyIntensity: 0.7, envIntensity: 0.3 };
const GOLDEN: StudioLook = { ...LOOK, tint: [1.2, 1.0, 0.7], tintAmount: 0.95, keyIntensity: 2.8, envIntensity: 0.85 };
const greyK = (t: number) => win(t, T.tapiJatuh - 0.1, 62.8, 0.9, 0.7);
const mineK = (t: number) => win(t, T.tapiJatuh + 0.2, 57.9, 0.8, 0.7);
const goldK = (t: number) => win(t, 62.5, 75.6, 1.0, 1.0);
const lookAt = (t: number): StudioLook => {
  const base = mixLook(LOOK, WARM, seg(t, 2.3, 3.0));
  return mixLook(mixLook(mixLook(base, GREY, greyK(t)), MINE_DARK, mineK(t)), GOLDEN, goldK(t));
};

// ---------- small builders ----------
/** Group that rises out of the floor (the plinth hides what is below y = 0). Always mounted, so GLBs load once. */
const Rise: React.FC<{ p: number; depth: number; children: React.ReactNode }> = ({ p, depth, children }) => (
  <group position={[0, -(depth + 0.2) * (1 - p), 0]} visible={p > 0.002}>
    {children}
  </group>
);

/** Pearl satin stage with an optional top inlay and a front year plaque. */
const Stage: React.FC<{ x: number; z: number; w: number; d: number; h: number; top?: "turf" | "sand"; year?: string; accent?: string }> = ({ x, z, w, d, h, top, year, accent = PITCH }) => {
  const grain = useSurfaceGrain(x * 7 + z * 3, 0.12, 3);
  const turf = turfTexture();
  const ps = Math.min(h * 0.86, 1.0);
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <RoundedBoxGeo args={[w, h, d]} radius={0.08} segments={4} />
        <meshPhysicalMaterial color="#ecebe6" roughness={0.42} roughnessMap={grain} clearcoat={0.45} clearcoatRoughness={0.25} />
      </mesh>
      {top ? (
        <mesh receiveShadow position={[0, h + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w - 0.24, d - 0.24]} />
          {top === "turf" ? <meshPhysicalMaterial map={turf} {...POLISH.fabric} sheen={0.25} /> : <meshPhysicalMaterial color="#e2c58e" roughness={0.95} sheen={0.3} sheenColor="#fff1cf" />}
        </mesh>
      ) : null}
      {year ? (
        <mesh position={[0, h / 2, d / 2 + 0.004]}>
          <planeGeometry args={[ps, ps]} />
          <meshPhysicalMaterial map={smallPlaqueTexture(year, accent)} roughness={0.5} clearcoat={0.3} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Small 1880s steamer: dark wooden hull, deck, cabin, funnel with a red band, one mast. */
const Steamer: React.FC<{ pos: V3; t: number }> = ({ pos, t }) => {
  const wood = woodTexture();
  return (
    <group position={pos} rotation={[Math.sin(t * 2.1) * 0.03, 0, Math.sin(t * 1.7) * 0.04]}>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <RoundedBoxGeo args={[0.56, 0.32, 1.6]} radius={0.12} segments={4} />
        <meshPhysicalMaterial color="#3b2a20" roughness={0.55} clearcoat={0.4} />
      </mesh>
      <mesh receiveShadow position={[0, 0.33, 0]}>
        <boxGeometry args={[0.48, 0.03, 1.42]} />
        <meshPhysicalMaterial map={wood} color="#d8c7a6" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.47, 0.18]}>
        <RoundedBoxGeo args={[0.34, 0.26, 0.5]} radius={0.04} segments={2} />
        <meshPhysicalMaterial color="#f1ede4" roughness={0.5} clearcoat={0.3} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0.02]}>
        <cylinderGeometry args={[0.08, 0.09, 0.5, 24]} />
        <meshPhysicalMaterial color="#1f2224" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.92, 0.02]}>
        <cylinderGeometry args={[0.083, 0.083, 0.08, 24]} />
        <meshPhysicalMaterial color="#b3322a" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.85, -0.5]}>
        <cylinderGeometry args={[0.018, 0.022, 1.0, 10]} />
        <meshPhysicalMaterial color="#5a4030" roughness={0.6} />
      </mesh>
    </group>
  );
};

const CricketBat: React.FC<{ pos: V3 }> = ({ pos }) => {
  const wood = woodTexture();
  return (
    <group position={pos} rotation={[0, 0.5, -0.32]}>
      <mesh castShadow receiveShadow position={[0, 0.36, 0]}>
        <RoundedBoxGeo args={[0.2, 0.72, 0.06]} radius={0.025} segments={2} />
        <meshPhysicalMaterial map={wood} color="#f3e3c2" roughness={0.55} clearcoat={0.3} />
      </mesh>
      <mesh castShadow position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.34, 14]} />
        <meshPhysicalMaterial color="#3a3f44" roughness={0.8} />
      </mesh>
    </group>
  );
};

/** Sprint body: the walk cycle at sprint cadence with bigger swings and a forward lean. */
const sprint = (f: number, seed: number): BodyPose => {
  const p = poseAt("walk", f * 2.4, seed);
  const amp = (v: number[], k: number) => [v[0] * k, v[1], v[2]] as typeof p.ls;
  return {
    ...p,
    spine: [p.spine[0] - 0.18, p.spine[1], p.spine[2]] as typeof p.spine,
    ls: amp(p.ls, 1.8), rs: amp(p.rs, 1.8), lh: amp(p.lh, 1.6), rh: amp(p.rh, 1.6),
    lk: p.lk * 1.7, rk: p.rk * 1.7, le: p.le * 1.5, re: p.re * 1.5,
  };
};

const RUNNER_LOOK = { skin: SKIN_TONES[5], hair: "#141010", top: "#f1eee6", bottom: "#f1eee6", outfit: "casual" as const, hairStyle: 0 as const, build: 0.98, height: 1 };
const KEEPER_LOOK = { skin: SKIN_TONES[5], hair: "#141010", top: "#2b3a4f", bottom: "#f1eee6", outfit: "casual" as const, hairStyle: 0 as const, build: 1.06, height: 1.04 };

// ---------- sets ----------
const HookRunner: React.FC<{ f: number }> = ({ f }) => (
  // the cover's 1886 runner, kept identical so frame 0 is the approved cover
  <ToyPerson f={f + 18} seed={1886} pose="walk" look={RUNNER_LOOK} position={[RUN.x, RUN.h, RUN.z]} heading={0.9} scale={1.35} />
);

const CoastSet: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, 6.6, 7.6);
  const sway = Math.sin(t * 1.3) * 0.035;
  return (
    <Rise p={p} depth={3.2}>
      <Stage x={COAST.x} z={COAST.z} w={COAST.w} d={COAST.d} h={COAST.h} top="sand" year="1865" accent="#D98A2B" />
      <group position={[COAST.x - 1.35, COAST.h, COAST.z - 0.6]} rotation={[0, 0, sway]}>
        <GlbLive id="palm-tree-a307da" height={2.4} rotation={[0, 0.6, 0]} />
      </group>
      <group position={[COAST.x + 0.85, COAST.h, COAST.z + 0.3]} rotation={[0, 0, -sway * 0.8]}>
        <GlbLive id="palm-tree-a307da" height={1.8} rotation={[0, 2.4, 0]} />
      </group>
      {/* young Wharton on the Gold Coast sand: the set's one subject */}
      <ToyPerson f={t * 60} seed={1865} pose="wave" look={RUNNER_LOOK} position={[COAST.x + 0.2, COAST.h, COAST.z + 0.55]} heading={0.35} scale={1.25} />
      <GlbLive id="ship-anchor-c2b4f1" position={[COAST.x + 1.15, COAST.h, COAST.z + 0.85]} rotation={[0, -0.7, 0.25]} height={0.62} />
      {/* sea ribbon from the coast to England */}
      <mesh receiveShadow position={[COAST.x, 0.025, (SEA_Z[0] + SEA_Z[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, SEA_Z[0] - SEA_Z[1]]} />
        <meshPhysicalMaterial color={SEA} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} emissive={SEA} emissiveIntensity={0.12} />
      </mesh>
      <Stage x={ENGLAND.x} z={ENGLAND.z} w={ENGLAND.w} d={ENGLAND.w} h={ENGLAND.h} year="1882" accent={SEA} />
    </Rise>
  );
};

const TrackSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const p = seg(t, 19.6, 20.5);
  const x = runX(t);
  const broke = seg(t, T.sepuluh - 0.1, T.sepuluh + 0.35);
  const bikeK = seg(t, T.sepeda - 0.4, T.sepeda + 0.2);
  const batK = seg(t, T.kriket - 0.4, T.kriket + 0.2);
  // after the line the sprinter slows to a jog
  const cadence = t < T.sepuluh + 0.4 ? f : f * 0.6;
  return (
    <Rise p={p} depth={1.0}>
      <Stage x={TRACK.x} z={TRACK.z} w={TRACK.w} d={TRACK.d} h={TRACK.h} top="turf" year="1886" />
      {/* finish posts and tape: the tape halves swing open when he breaks it */}
      {[-1, 1].map((k) => (
        <group key={k} position={[TAPE_X, TRACK.h, TRACK.z + k * 0.62]}>
          <mesh castShadow position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.9, 10]} />
            <meshPhysicalMaterial color="#f4f1ea" roughness={0.4} />
          </mesh>
          <group position={[0, 0.78, 0]} rotation={[0, -k * broke * 1.25, 0]}>
            <mesh position={[0, 0, -k * 0.31]}>
              <boxGeometry args={[0.02, 0.05, 0.62]} />
              <meshBasicMaterial color={new THREE.Color(PITCH).multiplyScalar(1.3)} toneMapped={false} />
            </mesh>
          </group>
        </group>
      ))}
      <ToyPerson f={cadence} seed={1886} poseOverride={t < T.sepuluh + 0.4 ? sprint(f, 1886) : undefined} pose="walk" look={RUNNER_LOOK} position={[x, TRACK.h, TRACK.z]} heading={Math.PI / 2} scale={1.35} />
      {/* bicycle and cricket bat beside the line (he also cycled and played cricket) */}
      <Stage x={SIDE.x} z={SIDE.z} w={SIDE.w} d={SIDE.d} h={SIDE.h} />
      <Rise p={bikeK} depth={1.2}>
        <GlbLive id="city-bicycle-5b67d1" position={[SIDE.x - 0.45, SIDE.h, SIDE.z]} rotation={[0, Math.PI / 2 - 0.25, 0]} height={0.95} />
      </Rise>
      <Rise p={batK} depth={1.2}>
        <CricketBat pos={[SIDE.x + 0.55, SIDE.h, SIDE.z + 0.1]} />
      </Rise>
    </Rise>
  );
};

const PrestonSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const p = seg(t, 29.2, 30.2);
  const roll = seg(t, 33.4, 36.6);
  const bz = lerp(PRESTON.z + 1.4, PRESTON.z + 5.4, roll);
  return (
    <Rise p={p} depth={1.0}>
      <Stage x={PRESTON.x} z={PRESTON.z} w={PRESTON.w} d={PRESTON.d} h={PRESTON.h} top="turf" />
      <WoodGoal pos={[PRESTON.x, PRESTON.h, PRESTON.z - 0.55]} width={3.6} height={2.3} />
      <ToyPerson f={f} seed={1887} pose={t > T.mistar ? "cheer" : "stand"} look={KEEPER_LOOK} position={[PRESTON.x, PRESTON.h, PRESTON.z - 0.2]} heading={0} scale={2.2} />
      <group position={[PRESTON.x + 0.5, 0.24, bz]} rotation={[(bz - PRESTON.z) / 0.24, 0.4, 0]}>
        <Ball pos={[0, 0, 0]} skin="leather" r={0.24} detail />
      </group>
    </Rise>
  );
};

/** Hero cluster of the cover: in place in the hook, sinks while the walk is elsewhere, rises for 1889. */
const HeroSet: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const p = Math.max(1 - seg(t, 7.0, 7.9), seg(t, T.y1889 - 0.1, T.y1889 + 1.5));
  const ring = seg(t, T.resmi - 0.2, T.resmi + 0.5) * (1 + 0.6 * bump(t, T.pertama, 0.6));
  return (
    <>
      <Rise p={p} depth={HERO.h + 4.6}>
        <HeroStage />
        <WoodGoal pos={[HERO.x, HERO.h, HERO.z - 0.75]} />
        <Keeper f={f} />
        {ring > 0.002 ? (
          <mesh position={[HERO.x - 0.3, HERO.h + 0.03, HERO.z - 0.05]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
            <ringGeometry args={[0.95, 1.06, 96]} />
            <meshBasicMaterial color={new THREE.Color(PITCH).multiplyScalar(1.7)} toneMapped={false} transparent opacity={Math.min(1, ring)} />
          </mesh>
        ) : null}
      </Rise>
      <group visible={p > 0.98}>
        <TimeLines />
      </group>
    </>
  );
};

const Set1894: React.FC<{ t: number }> = ({ t }) => (
  <Rise p={seg(t, T.lima - 0.1, T.lima + 1.1)} depth={P1894.h}>
    <SmallPedestal x={P1894.x} z={P1894.z} w={P1894.w} h={P1894.h} year="1894" accent={PITCH} />
  </Rise>
);

const MineSet: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, 49.6, 50.6);
  const wood = woodTexture();
  const cartZ = lerp(MINE.z - 1.6, MINE.z + 1.2, seg(t, 53.6, 57.2));
  const light = mineK(t) + 0.35 * (t > 57.9 ? 1 : 0);
  return (
    <Rise p={p} depth={3.2}>
      {[-1, 1].map((k) => (
        <mesh key={k} castShadow receiveShadow position={[MINE.x + k * 1.95, 1.4, MINE.z]}>
          <RoundedBoxGeo args={[0.7, 2.8, 8.4]} radius={0.12} segments={3} />
          <meshPhysicalMaterial color="#2c2b2c" roughness={0.92} />
        </mesh>
      ))}
      {[-3, -0.6, 1.8].map((dz) => (
        <WoodGoal key={dz} pos={[MINE.x, 0, MINE.z + dz]} width={3.0} height={2.5} />
      ))}
      {[-0.42, 0.42].map((dx) => (
        <mesh key={dx} receiveShadow position={[MINE.x + dx, 0.06, MINE.z]}>
          <boxGeometry args={[0.06, 0.06, 8.2]} />
          <meshPhysicalMaterial color="#7a7f83" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} receiveShadow position={[MINE.x, 0.025, MINE.z - 3.9 + i * 0.65]}>
          <boxGeometry args={[1.2, 0.05, 0.16]} />
          <meshPhysicalMaterial map={wood} color="#6e5a44" roughness={0.85} />
        </mesh>
      ))}
      <GlbLive id="mine-cart-94bd76" position={[MINE.x, 0.08, cartZ]} rotation={[0, 0, 0]} height={1.05} />
      <mesh castShadow receiveShadow position={[MINE.x - 1.05, 0.25, MINE.z + 2.7]}>
        <RoundedBoxGeo args={[0.55, 0.5, 0.55]} radius={0.04} segments={2} />
        <meshPhysicalMaterial map={wood} color="#9c8466" roughness={0.8} />
      </mesh>
      <GlbLive id="miner-lantern-c13511" position={[MINE.x - 1.05, 0.5, MINE.z + 2.7]} rotation={[0, 0.5, 0]} height={0.6} />
      <pointLight position={[MINE.x - 1.0, 1.0, MINE.z + 2.8]} color="#ffb257" intensity={9 * light} distance={10} decay={1.6} />
      <SmallPedestal x={MINE.x + 0.95} z={MINE.z - 1.7} w={0.75} h={0.8} year="1902" accent={ASH} dark />
    </Rise>
  );
};

/** Short local path from the new grave to the 2003 pedestal, then on to the statue. */
const PATH_DOTS: V3[] = (() => {
  const leg = (a: THREE.Vector3, b: THREE.Vector3, n: number, bow: number) =>
    Array.from({ length: n }, (_, i) => {
      const q = a.clone().lerp(b, (i + 1) / (n + 1));
      q.x += Math.sin(((i + 1) / (n + 1)) * Math.PI) * bow;
      return [q.x, 0.1, q.z] as V3;
    });
  const g = new THREE.Vector3(G2.x + 0.75, 0, G2.z + 0.9);
  const p = new THREE.Vector3(P2003.x - 0.1, 0, P2003.z + 0.75);
  const s = new THREE.Vector3(STATUE.x + 0.6, 0, STATUE.z + 0.8);
  return [...leg(g, p, 4, 0.0), ...leg(p, s, 8, 0.3)];
})();

/**
 * Clean grave set for Dec 1930: earth patch, the nameless stone, a second low mound and a
 * miner's lantern (GLB), alone on the floor with nothing from the hero cluster behind it.
 * Rises while the camera leaves the mine, so the cover cluster is never in this beat.
 */
const GraveSet: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, 56.9, 57.8);
  const lamp = 0.55 + 0.45 * Math.sin(t * 7.3) * Math.sin(t * 3.1) * 0.3;
  return (
    <Rise p={p} depth={2.0}>
      <mesh receiveShadow position={[G2.x, 0.012, G2.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.1, 64]} />
        <meshPhysicalMaterial color="#8e857b" roughness={0.97} />
      </mesh>
      <Grave pos={[G2.x, 0, G2.z]} />
      {/* second, older low mound beside it */}
      <mesh castShadow receiveShadow position={[G2.x + 1.45, 0.08, G2.z + 0.25]} scale={[0.62, 0.16, 0.95]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshPhysicalMaterial color="#7a6f65" roughness={0.97} />
      </mesh>
      <GlbLive id="miner-lantern-c13511" position={[G2.x - 0.9, 0.012, G2.z + 0.7]} rotation={[0, -0.6, 0]} height={0.85} />
      <pointLight position={[G2.x - 0.85, 0.75, G2.z + 0.95]} color="#ffb257" intensity={5 * lamp * p} distance={5} decay={1.6} />
      {/* grey stepping stones: the path that turns gold from the campaign on */}
      {PATH_DOTS.slice(0, 4).map((q, i) => (
        <mesh key={i} receiveShadow position={[q[0], 0.03, q[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.13, 24]} />
          <meshPhysicalMaterial color={ASH} roughness={0.8} />
        </mesh>
      ))}
    </Rise>
  );
};

/** New headstone (1997): clean pale stone with a carved line border, no inscription text. */
const engravedTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 768;
    const c = cv.getContext("2d")!;
    c.fillStyle = "#e7e4dd";
    c.fillRect(0, 0, 512, 768);
    c.strokeStyle = "rgba(90,84,72,0.55)";
    c.lineWidth = 6;
    c.strokeRect(46, 60, 420, 650);
    c.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      const w = [280, 340, 220, 300, 180][i];
      c.beginPath();
      c.moveTo(256 - w / 2, 220 + i * 70);
      c.lineTo(256 + w / 2, 220 + i * 70);
      c.stroke();
    }
    c.fillStyle = "#c9a04a";
    c.fillRect(196, 600, 120, 8);
    tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
})();

const NewStone: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, T.memasang - 0.2, T.memasang + 1.0);
  const halo = win(t, T.memasang, 75.4, 0.5, 1.0);
  return (
    <>
      <Rise p={p} depth={1.6}>
        <mesh castShadow receiveShadow position={[G2.x, 0.66, G2.z - 0.5]} rotation={[-0.02, 0, 0]}>
          <RoundedBoxGeo args={[0.95, 1.32, 0.18]} radius={0.12} segments={4} />
          <meshPhysicalMaterial map={engravedTexture()} roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.2} />
        </mesh>
      </Rise>
      {halo > 0.002 ? (
        <mesh position={[G2.x, 0.03, G2.z - 0.5]} rotation={[-Math.PI / 2, 0, 0]} onUpdate={(m) => m.layers.set(FX_LAYER)}>
          <ringGeometry args={[0.7, 0.78, 96]} />
          <meshBasicMaterial color={new THREE.Color(GOLD).multiplyScalar(1.7)} toneMapped={false} transparent opacity={halo} />
        </mesh>
      ) : null}
    </>
  );
};

/** Gold dots along the local path: new grave → 2003 pedestal → statue, lighting up in order. */
const GoldPath: React.FC<{ t: number }> = ({ t }) => {
  const dots = PATH_DOTS;
  if (t < T.kampanye) return null;
  return (
    <>
      {dots.map((q, i) => {
        const k = seg(t, T.kampanye + i * 0.42, T.kampanye + i * 0.42 + 0.4) * (1 - seg(t, 76, 78) * 0.5);
        if (k <= 0.002) return null;
        return (
          <mesh key={i} position={q} scale={0.6 + 0.6 * k} onUpdate={(m) => m.layers.set(FX_LAYER)}>
            <sphereGeometry args={[0.08, 14, 10]} />
            <meshBasicMaterial color={new THREE.Color("#FFD27A").multiplyScalar(1.6)} toneMapped={false} transparent opacity={k} />
          </mesh>
        );
      })}
    </>
  );
};

const StatueGlow: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.y2014 - 0.3, 80, 0.8, 2.0);
  if (k <= 0.002) return null;
  const s = 1 + 0.35 * bump(t, T.patung, 0.8);
  return (
    <>
      <mesh position={[STATUE.x - 0.2, STATUE.h + 1.2, STATUE.z - 0.9]} scale={s} onUpdate={(m) => m.layers.set(FX_LAYER)}>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial map={glowTexture()} color="#FFD27A" transparent opacity={0.55 * k} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[STATUE.x - 0.6, STATUE.h + 2.6, STATUE.z - 1.6]} color="#ffcf7a" intensity={14 * k * s} distance={8} decay={1.5} />
    </>
  );
};

/**
 * Separation for pale figures on a pale studio (from ep02): a cool rim light from behind the
 * subject and a grey value falloff so far sets sit darker than the subject. Off in the hook.
 */
const RimAndFog: React.FC<{ shot: Shot; t: number }> = ({ shot, t }) => {
  const { scene } = useThree();
  const k = seg(t, 2.3, 3.0);
  const tgt = useMemo(() => new THREE.Object3D(), []);
  const fog = useMemo(() => new THREE.Fog("#aaa59c", 1000, 3000), []);
  const d = new THREE.Vector3(...shot.target).sub(new THREE.Vector3(...shot.pos));
  const dist = d.length();
  d.normalize();
  const lp: V3 = [shot.target[0] + d.x * 16 + 3, shot.target[1] + 9, shot.target[2] + d.z * 16];
  tgt.position.set(...shot.target);
  tgt.updateMatrixWorld();
  const wide = seg(t, 75.2, 78);
  useLayoutEffect(() => {
    fog.color.set(goldK(t) > 0.5 ? "#b3a185" : greyK(t) > 0.5 ? "#8e9296" : "#aaa59c");
    fog.near = dist + 1 + (1 - k) * 2000 + wide * 30;
    fog.far = dist + 24 + (1 - k) * 4000 + wide * 60;
    scene.fog = fog;
  });
  const rimColor = goldK(t) > 0.3 ? "#ffd08a" : "#a9c8ff";
  return (
    <>
      <primitive object={tgt} />
      <directionalLight position={lp} target={tgt} intensity={3.0 * k} color={rimColor} />
    </>
  );
};

const FilmScene: React.FC<{ t: number }> = ({ t }) => {
  const f = t * 60;
  const shot = shotAt(t);
  return (
    <>
      <Studio look={lookAt(t)} plinth={{ top: 0, r: 90, h: 1, ring: false }} shadow={{ left: -22, right: 22, top: 22, bottom: -22, near: 4, far: 90 }} />
      {/* cover cluster */}
      <HeroSet t={t} f={f} />
      {/* cover runner + 1886 pedestal: on stage in the hook and the outro only, so they never stand in front of later shots */}
      <Rise p={Math.max(1 - seg(t, 7.0, 7.9), seg(t, 74.9, 75.8))} depth={3.0}>
        <SmallPedestal x={RUN.x} z={RUN.z} w={RUN.w} h={RUN.h} year="1886" accent={PITCH} />
        <HookRunner f={f} />
      </Rise>
      {/* cover grave: hook only; the 1930 beat plays on its own clean set (GraveSet) */}
      <Rise p={1 - seg(t, 7.0, 7.9)} depth={1.8}>
        <Grave pos={[GRAVE.x, 0, GRAVE.z]} />
        <GlbLive id="miner-lantern-c13511" position={[GRAVE.x - 0.95, 0, GRAVE.z + 0.75]} rotation={[0, -0.6, 0]} height={0.95} />
      </Rise>
      {/* statue: in the cover, then sunk so it never crowds the hero 1889 frame; rises again on "2014" */}
      <Rise p={Math.max(1 - seg(t, 7.0, 7.9), seg(t, T.y2014 - 0.4, T.y2014 + 0.8))} depth={STATUE.h + 3.6}>
        <SmallPedestal x={STATUE.x} z={STATUE.z} w={STATUE.w} h={STATUE.h} year="2014" accent={GOLD} dark />
        <BronzeStatue f={f} />
      </Rise>
      {/* foreground: out-of-focus stitched leather ball (cover), hook and outro only */}
      <group visible={t < 7.9 || t > 74.9} position={[2.3, 0.75, 12]} rotation={new THREE.Euler((-22 * Math.PI) / 180, (142 * Math.PI) / 180, 0, "YXZ")}>
        <Ball pos={[0, 0, 0]} skin="leatherLight" r={0.75} detail />
      </group>
      {/* story sets */}
      <CoastSet t={t} />
      <Steamer pos={[COAST.x, 0.03, shipZ(t)]} t={t} />
      <TrackSet t={t} f={f} />
      <PrestonSet t={t} f={f} />
      <Set1894 t={t} />
      <MineSet t={t} />
      <GraveSet t={t} />
      <NewStone t={t} />
      <GoldPath t={t} />
      <Rise p={seg(t, T.y2003 - 0.1, T.y2003 + 0.9)} depth={P2003.h}>
        <SmallPedestal x={P2003.x} z={P2003.z} w={P2003.w} h={P2003.h} year="2003" accent={GOLD} />
      </Rise>
      <StatueGlow t={t} />
      <RimAndFog shot={shot} t={t} />
      <CameraRig shot={shot} />
      <Post shot={shot} frame={Math.round(f)} aoRadius={0.45} />
    </>
  );
};

// ---------- HTML layer (laid out at 1080×1920, scaled) ----------
const cardStyle = (accent: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "16px 30px 18px",
  background: "rgba(250,249,246,0.93)",
  borderLeft: `6px solid ${accent}`,
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(31,36,38,0.14)",
  textAlign: "left",
  maxWidth: 940,
});
const Card: React.FC<{ title: React.ReactNode; sub?: React.ReactNode; accent?: string; big?: boolean }> = ({ title, sub, accent = PITCH, big }) => (
  <div style={cardStyle(accent)}>
    <div style={{ fontSize: big ? 66 : 54, fontWeight: 600, letterSpacing: "0.04em", color: INK, lineHeight: 1.08 }}>{title}</div>
    {sub ? <div style={{ fontSize: 40, fontWeight: 600, color: "#3d4346", marginTop: 6, lineHeight: 1.2 }}>{sub}</div> : null}
  </div>
);
const later = (t: number, at: number, node: React.ReactNode) => <span style={{ opacity: seg(t, at, at + 0.3) }}>{node}</span>;

type Cue = { a: number; b: number; row: 0 | 1; hit?: number; node: (t: number) => React.ReactNode };
const CUES: Cue[] = [
  { a: T.tanpaHook - 0.1, b: T.ini - 0.1, row: 0, hit: T.tanpaHook, node: () => <Card title="TANPA NISAN" sub="pemain pro kulit hitam pertama" accent={ASH} /> },
  { a: T.ini, b: S.HOOK[1] + 0.1, row: 0, node: () => <Card title="AUDIRA" sub="Sejarah Sepak Bola #46" /> },
  { a: T.y1865 - 0.1, b: T.fante - 0.15, row: 0, node: (t) => <Card title="1865 · GOLD COAST" sub={later(t, T.ghana - 0.1, "kini Ghana")} accent="#D98A2B" /> },
  { a: T.fante - 0.1, b: 13.7, row: 0, node: () => <Card title="BANGSAWAN FANTE" sub="keluarga sang ibu" accent="#D98A2B" /> },
  { a: T.y1882 - 0.05, b: T.rencana - 0.15, row: 0, node: (t) => <Card title="1882 · KE INGGRIS" sub={later(t, T.misi - 0.1, "belajar jadi misionaris")} accent={SEA} /> },
  { a: T.rencana - 0.1, b: S.KONTEKS[1] + 0.1, row: 0, node: () => <Card title="TAPI KAKINYA…" sub="punya rencana lain" /> },
  { a: T.y1886 - 0.1, b: T.seratus - 0.15, row: 0, node: (t) => <Card title="1886" sub={later(t, T.rekor - 0.1, "rekor dunia amatir")} /> },
  { a: T.seratus - 0.05, b: 27.2, row: 0, hit: T.sepuluh, node: () => <Card big title="100 YARD · 10 DETIK" sub="menyamai rekor dunia amatir" /> },
  { a: T.sepeda - 0.1, b: T.tapiKiper - 0.1, row: 0, node: (t) => <Card title={<>BERSEPEDA{later(t, T.kriket - 0.1, " · KRIKET")}</>} sub="atlet serba bisa" /> },
  { a: T.mistar - 0.1, b: T.preston - 0.15, row: 0, node: () => <Card title="KIPER" sub="pelari tercepat di bawah mistar" /> },
  { a: T.preston - 0.05, b: S.PENGEMBANGAN[1] + 0.1, row: 0, node: (t) => <Card title="PRESTON NORTH END" sub={later(t, T.semifinal - 0.1, "semifinal Piala FA")} /> },
  { a: T.y1889 - 0.05, b: T.resmi - 0.15, row: 0, node: (t) => <Card title="1889" sub={later(t, T.rotherham - 0.1, "Rotherham Town menggajinya")} /> },
  { a: T.resmi - 0.05, b: T.lima - 0.1, row: 0, hit: T.pertama, node: () => <Card big title="PEMAIN PRO KULIT HITAM PERTAMA" accent={GREEN} /> },
  { a: T.lima - 0.05, b: T.kasta - 0.15, row: 0, node: () => <Card title="1894" sub="lima tahun kemudian" /> },
  { a: T.kasta - 0.05, b: S.PENJELASAN[1] + 0.1, row: 0, node: (t) => <Card title="KASTA TERTINGGI" sub={later(t, T.sheffield - 0.1, "bersama Sheffield United")} /> },
  { a: T.y1902 - 0.1, b: T.runtuh - 0.1, row: 0, node: () => <Card title="1902 · PENSIUN" accent={ASH} /> },
  { a: T.runtuh - 0.05, b: T.buruh - 0.15, row: 0, node: () => <Card title="HIDUPNYA RUNTUH" sub="kecanduan minum" accent={ASH} /> },
  { a: T.buruh - 0.05, b: T.desember - 0.15, row: 0, node: () => <Card title="BURUH TAMBANG" sub="batu bara" accent={ASH} /> },
  { a: T.desember - 0.05, b: T.tanpa - 0.1, row: 0, node: (t) => <Card title="DESEMBER 1930" sub={later(t, T.wafat - 0.1, "wafat miskin")} accent={ASH} /> },
  { a: T.tanpa - 0.05, b: T.enam - 0.1, row: 0, hit: T.tanpa, node: () => <Card title="MAKAM TANPA NISAN" accent={ASH} /> },
  { a: T.enam - 0.05, b: T.kampanye - 0.1, row: 0, node: () => <Card big title="67 TAHUN KEMUDIAN" accent={GOLD} /> },
  { a: T.kampanye - 0.05, b: T.memasang - 0.1, row: 0, node: () => <Card title="KAMPANYE ANTI-RASISME" accent={GOLD} /> },
  { a: T.memasang - 0.05, b: T.y2003 - 0.15, row: 0, node: () => <Card title="1997 · NISAN DIPASANG" accent={GOLD} /> },
  { a: T.y2003 - 0.05, b: T.y2014 - 0.15, row: 0, node: (t) => <Card title="2003" sub={later(t, T.hall - 0.1, "Hall of Fame sepak bola Inggris")} accent={GOLD} /> },
  { a: T.y2014 - 0.05, b: S.PAYOFF[1] + 0.15, row: 0, hit: T.patung, node: (t) => <Card big title="2014 · PATUNG" sub={later(t, T.stGeorge - 0.1, "St George's Park")} accent={GOLD} /> },
  { a: T.pelopor - 0.05, b: T.menurutmu - 0.1, row: 0, node: () => <Card title="PELOPOR SEJATI" sub="sering dilupakan" /> },
  { a: T.menurutmu - 0.05, b: T.ikuti - 0.1, row: 0, node: () => <Card title="SIAPA LAGI?" sub="tulis di komentar" accent={GOLD} /> },
  { a: T.ikuti - 0.05, b: OUTRO_START + 0.1, row: 0, node: () => <Card title="IKUTI AUDIRA" sub="Sejarah Sepak Bola" /> },
];

// ---------- karaoke captions ----------
type Group = { words: Clip["words"]; a: number; b: number };
const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const c of CLIPS) {
    const gs: Clip["words"][] = [];
    let cur: Clip["words"] = [];
    for (const w of c.words) {
      cur.push(w);
      if ((/[.,:;?!]$/.test(w.w) && cur.length >= 2) || cur.length >= 6) {
        gs.push(cur);
        cur = [];
      }
    }
    if (cur.length) gs.push(cur);
    // never leave one word alone
    for (let i = 0; i < gs.length; i++) {
      if (gs[i].length === 1) {
        if (i > 0 && gs[i - 1].length < 8) {
          gs[i - 1].push(...gs[i]);
          gs.splice(i, 1);
          i--;
        } else if (i + 1 < gs.length) {
          gs[i + 1].unshift(...gs[i]);
          gs.splice(i, 1);
          i--;
        }
      }
    }
    gs.forEach((g, i) => out.push({ words: g, a: g[0].s - 0.08, b: i + 1 < gs.length ? gs[i + 1][0].s - 0.08 : c.end + 0.15 }));
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const g = GROUPS.find((x) => t >= x.a && t < x.b);
  if (!g || t >= OUTRO_START) return null;
  const n = g.words.length;
  const chars = g.words.reduce((s, w) => s + w.w.length + 1, 0);
  const lines = n > 4 || (n > 1 && chars > 26) ? [g.words.slice(0, Math.ceil(n / 2)), g.words.slice(Math.ceil(n / 2))] : [g.words];
  const k = seg(t, g.a, g.a + 0.12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ padding: "12px 18px 14px", borderRadius: 18, background: "rgba(248,247,243,0.84)", boxShadow: "0 8px 26px rgba(31,36,38,0.10)", maxWidth: 1000 }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", justifyContent: "center", flexWrap: "nowrap", marginTop: li ? 6 : 0 }}>
            {ln.map((w, wi) => {
              const active = t >= w.s && t < Math.max(w.e, w.s + 0.12);
              const said = t >= w.s;
              const pop = 1 + 0.04 * bump(t, w.s, 0.22);
              return (
                <span
                  key={wi}
                  style={{
                    margin: "0 12px",
                    fontSize: 50,
                    fontWeight: 600,
                    color: active ? GREEN : said ? INK : "#5a5a5a",
                    transform: `scale(${pop})`,
                    display: "inline-block",
                    textShadow: "0 2px 14px rgba(250,249,246,0.95), 0 0 4px rgba(250,249,246,0.9)",
                    borderBottom: active ? `5px solid ${PITCH}` : "5px solid transparent",
                    paddingBottom: 2,
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const HtmlLayer: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0", fontFamily: MANROPE }}>
    {CUES.map((c, i) => {
      const o = win(t, c.a, c.b, 0.22, 0.2);
      if (o <= 0.001) return null;
      const s = c.hit !== undefined ? 1 + 0.08 * bump(t, c.hit, 0.4) : 1;
      return (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: c.row === 0 ? 372 : 560, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 16}px) scale(${s})` }}>
          {c.node(t)}
        </div>
      );
    })}
    <Captions t={t} />
  </div>
);

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = width / 1080;
  const [handle] = useState(() => delayRender("Manrope for EP46 film"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    manropeReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const headK = 1 - seg(t, 1.4, 2.0);
  const tagK = 1 - seg(t, 0.3, 0.7);
  // darker edge falloff in the mine and at the grave, softer elsewhere (off in the hook)
  const pool = 0.42 + 0.25 * greyK(t);
  return (
    <AbsoluteFill style={{ background: "#e9e6e0" }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={1}
            gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: FOV, near: 1, far: 900, position: CAM_POS }}
          >
            <FilmScene t={t} />
          </ThreeCanvas>
          {headK > 0.001 ? (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>
              <Overlay headK={headK} tagK={tagK} />
            </div>
          ) : null}
          <AbsoluteFill
            style={{
              background: `radial-gradient(62% 38% at 50% 50%, rgba(46,40,32,0) 0%, rgba(46,40,32,0) 50%, rgba(46,40,32,${pool.toFixed(3)}) 100%)`,
              opacity: seg(t, 2.3, 3.0) * (1 - seg(t, OUTRO_START - 0.2, OUTRO_START)),
            }}
          />
          <HtmlLayer t={t} k={k} />
          <Outro start={OUTRO_START} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const FILM_SECONDS = TOTAL;
