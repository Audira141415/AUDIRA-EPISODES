import React from "react";
import { useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { QaProbe } from "../../core/qa/scene-qa.tsx";
import { PCFShadowMap } from "three";
import { Stage, type Look } from "./Stage.tsx";
import type { Shot } from "./cam.ts";

/** One CHRONICLE shot: a Remotion-synchronised canvas with the CHRONICLE Stage around the set. */
export const ShotCanvas: React.FC<{ shot: Shot; look: Look; frame: number; children: React.ReactNode }> = ({ shot, look, frame, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows={{ type: PCFShadowMap }}
      dpr={1}
      gl={{ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      camera={{ fov: shot.fov, position: shot.pos, near: 0.1, far: 4000 }}
    >
      <Stage shot={shot} look={look} frame={frame}>
        {children}
      </Stage>
      <QaProbe />
    </ThreeCanvas>
  );
};
