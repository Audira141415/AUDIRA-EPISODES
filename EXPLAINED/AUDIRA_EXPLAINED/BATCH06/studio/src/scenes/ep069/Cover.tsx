// AE-069 topic cover (PAPERWORLD): stepped paper cutaway, house -> sewer -> IPAL -> river.
// Motion memory PAPERWORLD: DOCUMENTARY_WARM, exposure 0.82, envIntensity 0.25, AO on.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { Stage, type Light, type Shot } from "../../kits/paperworld/render/Stage.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Diorama } from "./Diorama.tsx";

export const DAY: Light = {
  dir: [-0.5, 0.8, 0.45],
  key: "#fff0d8",
  keyI: 2.5,
  fill: "#e8eef6",
  fillI: 0.6,
  sky: "#fdf6ea",
  ground: "#cdb08f",
  hemiI: 1.2,
  bg: "#efe5d3",
  exposure: 1.02,
  shadowSize: 34,
  shadowSoft: 4,
};

// 9:16 framing: visible width = 2·d·tan(fov/2)·9/16. fov 30, d ≈ 70 -> ~21 units wide, ~37.5 tall.
export const coverShot = (s: number): Shot => {
  const target: [number, number, number] = [0.2, 0.4, 1];
  const d = 78 - s * 0.4;
  const el = 0.36;
  const az = -0.05;
  const pos: [number, number, number] = [target[0] + Math.sin(az) * Math.cos(el) * d, target[1] + Math.sin(el) * d, target[2] + Math.cos(az) * Math.cos(el) * d];
  return { pos, target, fov: 30, focus: d, aperture: 0.0002, maxBlur: 0.002 };
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: DAY.bg }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: PCFShadowMap }} dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }} camera={{ fov: 30, position: [0, 20, 70] }}>
        <Stage shot={coverShot(s)} light={DAY} frame={frame} center={[0, -6, 0]}>
          <Diorama s={s} />
        </Stage>
        <Finish frame={frame} background={DAY.bg} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} ao />
      </ThreeCanvas>
      <CoverTitle />
    </AbsoluteFill>
  );
};

const INK = "#3b2a22";
const CoverTitle: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640, background: "linear-gradient(180deg, rgba(239,229,211,0.94) 0%, rgba(239,229,211,0.8) 55%, rgba(239,229,211,0) 100%)" }} />
    <div style={{ position: "absolute", left: 76, right: 76, top: 268, color: INK, textAlign: "center" }}>
      <div style={{ display: "inline-block", fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: 8, color: "#faf4e8", background: "#c4614f", padding: "10px 22px 8px", borderRadius: 6, boxShadow: "0 4px 0 #8f4336" }}>
        AUDIRA EXPLAINED
      </div>
      <div style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 104, lineHeight: 1.02, marginTop: 26, letterSpacing: -1, textShadow: "0 3px 0 rgba(255,250,240,0.9)" }}>
        Air Toiletmu
        <br />
        <span style={{ color: "#435e95" }}>Pergi ke Mana?</span>
      </div>
    </div>
  </AbsoluteFill>
);
