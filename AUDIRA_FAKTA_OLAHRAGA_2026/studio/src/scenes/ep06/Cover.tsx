// EP06 cover — TOYDIORAMA. "Usain Bolt 9,58 detik" (Berlin 2009): toy stadium, eight runners out of the blocks.
// Also exports the stadium set + lights the film reuses (S1 hook, S2 konteks, S3 race, S6 outro).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { RoundedBoxGeo, POLISH } from "../../core/polish/Polish.tsx";
import { SceneText } from "../../core/polish/Drei.tsx";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { BOLT_R, COL, RUNNERS, RaceRunner, Stands, Track, WalnutStage, distAt, laneZ, xAt } from "./Set.tsx";

type V3 = [number, number, number];
export const COVER_CAMS: Record<"A", { pos: V3; target: V3; fov: number }> = {
  A: { pos: [-24, 7.5, 12], target: [-18, 0.5, 0], fov: 32 },
};
export const COVER_RT = 2.4;

/** Key + rim + fill for every set. One wide shadow-casting sun covers the whole 66-unit stage. */
export const Lights: React.FC<{ amb?: number; sun?: number; keyColor?: string }> = ({ amb = 0.35, sun = 2.4, keyColor = TP.keyLight }) => (
  <>
    <ambientLight intensity={amb} color="#F5E8D3" />
    <directionalLight
      position={[-6, 14, 10]}
      intensity={sun}
      color={keyColor}
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-bias={-0.0002}
      shadow-camera-left={-38}
      shadow-camera-right={38}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
      shadow-camera-near={1}
      shadow-camera-far={50}
    />
    <directionalLight position={[3.5, 4.5, -8]} intensity={1.4} color={TP.rimLight} />
  </>
);

/** Yellow tag floating over Bolt so the viewer always finds him among eight runners. */
export const BoltTag: React.FC<{ x: number; k?: number }> = ({ x, k = 1 }) => (
  <group position={[x, 1.62, laneZ(BOLT_R.lane)]} scale={k + 0.0001}>
    <mesh>
      <RoundedBoxGeo args={[0.62, 0.24, 0.04]} radius={0.04} />
      <meshPhysicalMaterial {...POLISH.paper} color={COL.bolt} emissive={COL.bolt} emissiveIntensity={0.25} />
    </mesh>
    <SceneText position={[0, 0, 0.03]} fontSize={0.16} color="#181a1b" anchorX="center" anchorY="middle">
      BOLT
    </SceneText>
    <mesh position={[0, -0.17, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.06, 0.1, 12]} />
      <meshStandardMaterial color={COL.bolt} />
    </mesh>
  </group>
);

/** The stadium with the race at race time rt. runners=false leaves the lanes empty (outro). */
export const Stadium: React.FC<{ f: number; rt: number; runners?: boolean; crouch?: boolean; markers?: number[]; glowMarker?: number; tape?: number; tag?: number }> = ({
  f,
  rt,
  runners = true,
  crouch = false,
  markers = [],
  glowMarker,
  tape = 1,
  tag = 1,
}) => (
  <group>
    <WalnutStage len={70} z0={-15} z1={8} />
    <Track markers={markers} glowMarker={glowMarker} tape={tape} />
    <Stands />
    {runners && RUNNERS.map((r) => <RaceRunner key={r.lane} r={r} rt={rt} f={f} crouchOnly={crouch} />)}
    {runners && tag > 0 && <BoltTag x={xAt(crouch ? 0 : distAt(BOLT_R, rt)) - (crouch ? 0.1 : 0)} k={tag} />}
  </group>
);

export const CoverText: React.FC = () => (
  <div style={{ position: "absolute", left: 64, right: 64, top: 250, color: "#fff" }}>
    <div
      style={{
        display: "inline-block",
        background: TP.paperCard,
        color: "#181a1b",
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: 2,
        padding: "8px 18px",
        transform: "rotate(-2deg)",
        boxShadow: "0 6px 18px rgba(0,0,0,.35)",
      }}
    >
      LARI TERCEPAT SEPANJANG MASA
    </div>
    <div style={{ fontFamily: FONT.display, fontSize: 200, lineHeight: 0.95, marginTop: 18, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
      9,58<span style={{ fontSize: 104, marginLeft: 14, color: COL.bolt }}>DETIK</span>
    </div>
    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, marginTop: 6, textShadow: "0 3px 12px rgba(0,0,0,.7)" }}>
      Berlin 2009. Rekor dunia 17 tahun.
    </div>
  </div>
);

export const CoverA: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = COVER_CAMS.A;
  return (
    <AbsoluteFill style={{ background: TP.stageBackdrop }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 90 }}>
        <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />
        <Lights />
        <fog attach="fog" args={[TP.stageBackdrop, 26, 60]} />
        <Stadium f={f} rt={COVER_RT} />
        <Finish frame={frame} background={TP.stageBackdrop} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 64% 42% at 50% 52%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 46%, rgba(8,10,16,.55) 80%, rgba(8,10,16,.8) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 820, background: "linear-gradient(180deg, rgba(14,20,29,.78) 0%, rgba(14,20,29,.35) 60%, rgba(14,20,29,0) 100%)" }} />
        <CoverText />
      </div>
    </AbsoluteFill>
  );
};
