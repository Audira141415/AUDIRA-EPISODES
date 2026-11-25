// AE-067 cover (WORLDFORGE): New York on an earth cut-away; the aqueduct carries water under it.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { FONT } from "../../core/type/fonts.ts";
import { World, type Cam } from "./Film.tsx";

const COVER_CAM: Cam = { pos: [70, 8, 96], tgt: [12, -6, -14], fov: 50, set: "city", u: 0 };

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = 3 + frame / 30;
  return (
    <AbsoluteFill style={{ backgroundColor: "#cfd6d8" }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 50, near: 0.5, far: 7000, position: COVER_CAM.pos }}>
        <World frame={frame} t={t} cam={COVER_CAM} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,10,8,0.62) 0%, rgba(14,10,8,0.25) 26%, rgba(14,10,8,0) 38%)" }} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 270, fontFamily: FONT, color: "#f6efe2" }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "0.38em", color: "#ffb45c" }}>AUDIRA EXPLAINED</div>
        <div style={{ marginTop: 22, fontSize: 104, lineHeight: 1.0, fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
          Sungai di
          <br />
          Bawah Kota
        </div>
        <div style={{ marginTop: 20, display: "inline-block", fontSize: 40, fontWeight: 700, background: "rgba(20,14,12,0.82)", padding: "8px 18px", borderRadius: 8, borderLeft: "6px solid #7fe0ff" }}>
          Terowongan air 137 km
        </div>
      </div>
    </AbsoluteFill>
  );
};
