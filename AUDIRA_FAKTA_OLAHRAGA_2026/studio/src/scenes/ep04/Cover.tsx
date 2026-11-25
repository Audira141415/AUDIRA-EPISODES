// EP04 cover — TOYDIORAMA. Rekor pit stop F1 1,80 detik (Qatar 2023): toy F1 car in a pit box, crew around it.
// Variant A: high 3/4 overhead (car runs up the frame, all crew visible). Variant B: low nose-on hero.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { TOYDIORAMA_PALETTE as TP } from "../../kits/toydiorama/lib/palette.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { PitBox, PitLane } from "./PitSet.tsx";

type V3 = [number, number, number];
export const COVER_CAMS: Record<"A" | "B", { pos: V3; target: V3; fov: number }> = {
  A: { pos: [1.3, 10.8, 7.4], target: [0, 0, -0.4], fov: 32 },
  B: { pos: [5.6, 2.6, 7.4], target: [-0.3, 0.6, 0.9], fov: 30 },
};

export const PitScene: React.FC<{ f: number; cam: { pos: V3; target: V3; fov: number } }> = ({ f, cam }) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 60 }}>
      <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />
      <ambientLight intensity={0.35} color="#F5E8D3" />
      {/* pit-gantry key: warm, high, slightly left */}
      <spotLight position={[-2.2, 7.5, 3.5]} intensity={90} angle={0.55} penumbra={0.75} color={TP.keyLight} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
      {/* cool rim from behind the garage */}
      <directionalLight position={[3.5, 4.5, -5]} intensity={1.1} color={TP.rimLight} />
      {/* warm footlight wash along the apron */}
      <pointLight position={[0, 0.4, 4.4]} intensity={3} distance={4} color={TP.footlights} />
      <PitLane f={f} />
      <PitBox f={f} />
      <Finish frame={frame} background={TP.stageBackdrop} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1} envIntensity={0.55} />
    </ThreeCanvas>
  );
};

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
      PIT STOP TERCEPAT F1
    </div>
    <div style={{ fontFamily: FONT.display, fontSize: 200, lineHeight: 0.95, marginTop: 18, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
      1,80<span style={{ fontSize: 104, marginLeft: 14, color: "#f2c230" }}>DETIK</span>
    </div>
    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, marginTop: 6, textShadow: "0 3px 12px rgba(0,0,0,.7)" }}>
      4 ban baru. ±20 kru. Rekor F1 sejak 2023.
    </div>
  </div>
);

export const makeCover = (v: "A" | "B"): React.FC => () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: TP.stageBackdrop }}>
      <PitScene f={f} cam={COVER_CAMS[v]} />
      {/* top scrim so the headline reads over the garage */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 820, background: "linear-gradient(180deg, rgba(14,20,29,.78) 0%, rgba(14,20,29,.35) 60%, rgba(14,20,29,0) 100%)" }} />
      <CoverText />
    </AbsoluteFill>
  );
};

export const CoverA = makeCover("A");
export const CoverB = makeCover("B");
