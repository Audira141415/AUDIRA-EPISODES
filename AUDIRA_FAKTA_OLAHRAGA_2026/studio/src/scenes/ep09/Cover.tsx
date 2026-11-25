// EP09 cover — CINESTORY. Tim bobsled Jamaika, Calgary 1988: the sled tipping over in the banked
// "KREISEL" curve, ice chips flying. Low 3/4 front camera so the sled, the bank and the sign all read.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { FONT, useFonts } from "../../kits/pixelstory/typography/fonts.ts";
import { Bobsled, CrashTrack, Spray } from "./Set.tsx";

type V3 = [number, number, number];
export const COVER_CAM: { pos: V3; target: V3; fov: number } = { pos: [7.2, 1.9, 4.6], target: [2.5, 1.0, -0.45], fov: 36 };
export const NIGHT = "#1b2636";

export const CoverText: React.FC = () => (
  <div style={{ position: "absolute", left: 64, right: 64, top: 250, color: "#fff" }}>
    <div
      style={{
        display: "inline-block",
        background: "#f4f1e6",
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
      TIM BOBSLED JAMAIKA
    </div>
    <div style={{ fontFamily: FONT.display, fontSize: 190, lineHeight: 0.95, marginTop: 18, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
      ±130<span style={{ fontSize: 96, marginLeft: 14, color: "#f2c230" }}>KM/JAM</span>
    </div>
    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 40, marginTop: 6, textShadow: "0 3px 12px rgba(0,0,0,.7)" }}>
      Calgary 1988. Negara tanpa salju.
    </div>
  </div>
);

export const Cover: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = COVER_CAM;
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 60 }}>
        <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />
        <ambientLight intensity={0.3} color="#dfe8f5" />
        <spotLight position={[1.5, 7.5, 4.5]} intensity={95} angle={0.45} penumbra={0.6} color="#eaf1ff" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
        <directionalLight position={[-3, 4.5, -5]} intensity={1.6} color="#ffb070" />
        <fog attach="fog" args={[NIGHT, 12, 34]} />
        <mesh position={[0, 6, -24]}>
          <planeGeometry args={[120, 50]} />
          <meshStandardMaterial color={NIGHT} roughness={1} />
        </mesh>
        <CrashTrack />
        {/* mid-flip on the bank wall */}
        <Bobsled position={[2.9, 0.42, -0.42]} roll={1.55} />
        <Spray origin={[3.4, 0.1, -0.3]} k={0.45} />
        <Finish frame={frame} background={NIGHT} profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE} exposure={1} envIntensity={0.55} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 820, background: "linear-gradient(180deg, rgba(14,20,29,.78) 0%, rgba(14,20,29,.35) 60%, rgba(14,20,29,0) 100%)" }} />
      <CoverText />
    </AbsoluteFill>
  );
};
