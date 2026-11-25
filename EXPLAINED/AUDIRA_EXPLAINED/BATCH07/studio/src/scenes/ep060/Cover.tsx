// AE-060 cover (BEDAH look-dev): the finished jetty cut open at the front, its pile forest under the sea.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { MANROPE } from "../../core/type/fonts.ts";
import "../../core/type/displayFonts.ts";
import { Scene3D } from "./Film.tsx";
import type { V3 } from "./World.tsx";

const POSE = { pos: [96, 10, 42] as V3, target: [172, -6, -8] as V3, fov: 52 };

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  return (
    <AbsoluteFill style={{ backgroundColor: "#8cc0ee" }}>
      <ThreeCanvas width={W} height={H} dpr={1} shadows camera={{ fov: POSE.fov, position: POSE.pos }}>
        <Scene3D t={0.5} frame={frame} pose={POSE} world="outro" cut fog={0.0016} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 270 * k, textAlign: "center" }}>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: 132 * k, lineHeight: 1.0, color: "#fff", letterSpacing: 2 * k, textShadow: `0 ${6 * k}px ${18 * k}px rgba(0,20,40,0.55)`, WebkitTextStroke: `${3 * k}px rgba(8,20,32,0.6)` }}>
          DERMAGA DI
          <br />
          <span style={{ color: "#ffd23f" }}>ATAS LAUT?</span>
        </div>
        <div style={{ marginTop: 18 * k, display: "inline-block", background: "rgba(10,22,34,0.82)", borderRadius: 14 * k, padding: `${8 * k}px ${24 * k}px`, fontFamily: `${MANROPE}, sans-serif`, fontWeight: 600, fontSize: 36 * k, letterSpacing: 6 * k, color: "#fff" }}>
          AUDIRA EXPLAINED
        </div>
      </div>
    </AbsoluteFill>
  );
};
