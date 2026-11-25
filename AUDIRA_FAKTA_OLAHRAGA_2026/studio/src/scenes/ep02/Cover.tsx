// EP02 cover — VINTAGEFORGE. "Maraton Paling Kacau": St. Louis 1904 Olympic marathon.
// Two framings for the A/B cover gate:
//   A "debu"  — one exhausted runner on the dusty road, an early motor car looming in its dust behind.
//   B "mobil" — the motor car is the hero, a runner riding in it and waving (the car-ride twist).
// The set lives in RoadSet.tsx so the film can open on exactly the approved frame.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadRye } from "@remotion/google-fonts/Rye";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { CAR_DIM, Lights, MotorCar, RoadSet, RUNNER_LOOK, runPose, ToyPerson, VP } from "./RoadSet.tsx";
import { poseAt, type Pose } from "../../core/polish/Person.tsx";

const { fontFamily: RYE } = loadRye();
const { fontFamily: ELITE } = loadElite();
const { fontFamily: PLAYFAIR } = loadPlayfair("italic", { weights: ["400", "700"] });

type V3 = [number, number, number];
export type Framing = { pos: V3; target: V3; fov: number };

export const FRAMING_A: Framing = { pos: [1.15, 0.62, 3.1], target: [0.05, 0.78, -0.6], fov: 38 };
export const FRAMING_B: Framing = { pos: [2.55, 1.5, 4.65], target: [-0.12, 0.6, 0.0], fov: 39 };

const Cam: React.FC<{ fr: Framing }> = ({ fr }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...fr.pos);
    c.lookAt(new THREE.Vector3(...fr.target));
    c.fov = fr.fov;
    c.updateProjectionMatrix();
  }, [camera, fr]);
  return null;
};

/** Seated and waving: the sit pose with the arms of the wave pose. */
export const sitWave = (f: number, seed: number): Pose => {
  const sit = poseAt("sit", f, seed);
  const wave = poseAt("wave", f, seed);
  return { ...sit, ls: wave.ls, le: wave.le, rs: wave.rs, re: wave.re, head: wave.head };
};

const SceneA: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoadSet />
    <ToyPerson f={f} seed={4} look={{ ...RUNNER_LOOK, skin: "#e6b28c" }} poseOverride={runPose(28, 4, 0.5)} position={[0, 0, 0]} heading={0.35} />
    <MotorCar position={[-0.45, 0, -5.4]} />
  </>
);

const SceneB: React.FC<{ f: number }> = ({ f }) => (
  <>
    <RoadSet post={false} />
    <MotorCar position={[0, 0, 0]} />
    <ToyPerson f={f} seed={4} look={RUNNER_LOOK} poseOverride={sitWave(30, 4)} position={[-0.14, CAR_DIM.seatY + 0.05, CAR_DIM.seatZ]} heading={0} scale={0.8} />
    <ToyPerson f={f} seed={11} look={{ ...RUNNER_LOOK, skin: "#b47a52", top: "#e2d6bc" }} poseOverride={runPose(46, 11, 0.9)} position={[-0.8, 0, -7]} heading={0} />
  </>
);

/** Headline block, inside the 236 px top safe zone; nothing below y = 1540. */
export const CoverText: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(42,27,14,0.86) 0%, rgba(42,27,14,0.62) 22%, rgba(42,27,14,0) 40%)",
      }}
    />
    <div style={{ position: "absolute", left: 64, right: 64, top: 236, borderTop: `3px solid ${VP.agedGold}`, borderBottom: `1px solid ${VP.agedGold}`, height: 7 }} />
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        top: 262,
        display: "flex",
        justifyContent: "space-between",
        fontFamily: ELITE,
        fontSize: 36,
        letterSpacing: 2,
        color: VP.agedGold,
      }}
    >
      <span>OLIMPIADE ST. LOUIS</span>
      <span style={{ color: VP.parchmentSepia }}>1904</span>
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 322, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }}>
      <div style={{ fontFamily: RYE, fontSize: 136, lineHeight: 0.98, color: VP.parchmentSepia }}>MARATON</div>
      <div style={{ fontFamily: RYE, fontSize: 104, lineHeight: 1.02, color: VP.agedGold }}>PALING KACAU</div>
      <div style={{ marginTop: 10, fontFamily: PLAYFAIR, fontStyle: "italic", fontSize: 46, color: VP.parchmentSepia, opacity: 0.92 }}>
        dalam sejarah Olimpiade
      </div>
    </div>
  </AbsoluteFill>
);

const Chips: React.FC<{ top: number }> = ({ top }) => (
  <div style={{ position: "absolute", left: 64, right: 64, top, display: "flex", gap: 14 }}>
    {["40 KM", "32 °C", "1 TITIK AIR"].map((t) => (
      <div
        key={t}
        style={{
          fontFamily: ELITE,
          fontSize: 38,
          color: VP.engravingBrown,
          background: "rgba(243,234,214,0.92)",
          border: `2px solid ${VP.agedGold}`,
          padding: "6px 18px 8px",
          boxShadow: "0 6px 18px rgba(42,27,14,0.35)",
        }}
      >
        {t}
      </div>
    ))}
  </div>
);

/** Screen-space dust (x, y, radius in px @1080×1920, opacity): soft clouds trailing the car. */
type Puff = [number, number, number, number];
const DUST_A: Puff[] = [[800, 1080, 230, 0.55], [960, 1040, 200, 0.5], [650, 1110, 170, 0.35], [1000, 1180, 160, 0.4]];
const DUST_B: Puff[] = [[980, 1150, 260, 0.5], [860, 1060, 200, 0.4], [1060, 1300, 220, 0.4]];

const DustHaze: React.FC<{ puffs: Puff[] }> = ({ puffs }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {puffs.map(([x, y, r, o], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - r,
          top: y - r * 0.75,
          width: r * 2,
          height: r * 1.5,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, rgba(236,214,170,${o}) 0%, rgba(228,204,158,${o * 0.55}) 45%, rgba(228,204,158,0) 100%)`,
          filter: "blur(6px)",
        }}
      />
    ))}
  </AbsoluteFill>
);

const makeCover = (variant: "A" | "B"): React.FC => {
  const C: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();
    const f = (frame / fps) * 60;
    const fr = variant === "A" ? FRAMING_A : FRAMING_B;
    return (
      <AbsoluteFill style={{ background: "#e9d6ae" }}>
        <ThreeCanvas width={width} height={height} dpr={1} shadows camera={{ position: fr.pos, fov: fr.fov, near: 0.05, far: 200 }}>
          <Cam fr={fr} />
          <Lights />
          {variant === "A" ? <SceneA f={f} /> : <SceneB f={f} />}
          <Finish frame={frame} profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM} exposure={0.82} envIntensity={0.25} hdri="warmStudio" />
        </ThreeCanvas>
        <DustHaze puffs={variant === "A" ? DUST_A : DUST_B} />
        <CoverText />
        <Chips top={640} />
      </AbsoluteFill>
    );
  };
  return C;
};

export const CoverA = makeCover("A");
export const CoverB = makeCover("B");
