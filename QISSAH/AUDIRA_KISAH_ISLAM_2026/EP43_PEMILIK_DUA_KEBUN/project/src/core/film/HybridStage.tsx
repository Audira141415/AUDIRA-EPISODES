// HybridStage — 3D environment + 2D motion graphic layers with full finishing chain.
//
// Same contract as Stage3D but makes the hybrid pattern explicit: a lightweight 3D
// environment (sky, ground, atmosphere) with the main content delivered as 2D motion
// graphic overlays. Use for narrative, historical, data-driven, or abstract topics
// where forcing full 3D objects would hurt clarity.
//
// Three composition tiers:
//   1. "full3d"  — everything in the 3D scene (use Stage3D directly).
//   2. "hybrid"  — 3D environment + 2D overlays (this component with `finish` props).
//   3. "motion"  — pure 2D motion graphics (AbsoluteFill, no ThreeCanvas).
//
// The 3D layer provides depth, lighting, and continuous camera motion so the result
// never looks like a slideshow; the 2D layer carries the information payload.
//
// Camera + Post: pass `finish` to mount a Finish chain inside ThreeCanvas (AO, bloom,
// grade, HDRI reflections). Pass `rig` to drive the camera each frame — without it the
// camera is static (fov 24, position [0,0,60]).

import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { PCFShadowMap } from "three";
import { fontReady } from "../type/fonts.ts";
import { FormatFov, useFormat } from "./format.ts";
import { PoseCamera } from "../camera/PoseCamera.tsx";
import { Finish, type HdriName } from "../render/Finish.tsx";
import type { ColorGradeProfile } from "../render/FinishingPresets.ts";
import { QaProbe, qaNoOverlay } from "../qa/scene-qa.tsx";

export type HybridTier = "full3d" | "hybrid" | "motion";

export type HybridCameraRig = {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  fov?: number;
  roll?: number;
};

export type HybridFinish = {
  frame: number;
  profile?: ColorGradeProfile;
  exposure?: number;
  envIntensity?: number;
  hdri?: HdriName;
  envRotation?: number;
  ao?: boolean;
  aoRadius?: number;
  focus?: number;
  aperture?: number;
  maxBlur?: number;
};

export const HybridStage: React.FC<{
  /** 3D environment: sky, ground, fog, atmosphere, ambient objects. Omit for pure motion tier. */
  environment?: React.ReactNode;
  /** Primary 2D content layer, laid out at layout size (1080×1920 or 1920×1080). */
  content: (scale: number) => React.ReactNode;
  /** Secondary 2D layer on top of everything (HUD, labels, subtitles). */
  hud?: (scale: number) => React.ReactNode;
  /** Page colour behind the canvas. */
  background?: string;
  /** 0…1 fade to fadeColor over everything. */
  fade?: number;
  fadeColor?: string;
  /** Camera rig pose for this frame. Without it the camera stays at the default position. */
  rig?: HybridCameraRig;
  /** Finishing chain (AO, bloom, grade, HDRI). Pass to get the same quality as Stage3D + Finish. */
  finish?: HybridFinish;
}> = ({ environment, content, hud, background = "#e9e6e0", fade = 0, fadeColor = "#ece9e3", rig, finish }) => {
  const { width, height } = useVideoConfig();
  const fmt = useFormat();
  const [handle] = useState(() => delayRender("font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontReady().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);

  const layerStyle = {
    position: "absolute" as const,
    inset: 0,
    width: fmt.layout.width,
    height: fmt.layout.height,
    transform: `scale(${fmt.scale})`,
    transformOrigin: "0 0" as const,
  };

  // Pure motion tier — no ThreeCanvas at all.
  if (!environment) {
    return (
      <AbsoluteFill style={{ backgroundColor: background }}>
        {ready ? (
          <>
            <div style={layerStyle}>{content(fmt.scale)}</div>
            {hud ? <div style={{ ...layerStyle, pointerEvents: "none" }}>{hud(fmt.scale)}</div> : null}
          </>
        ) : null}
        {fade > 0 ? <AbsoluteFill style={{ backgroundColor: fadeColor, opacity: fade }} /> : null}
      </AbsoluteFill>
    );
  }

  // Hybrid tier — 3D environment + 2D content + optional HUD.
  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {ready ? (
        <>
          <ThreeCanvas
            width={width}
            height={height}
            shadows={{ type: PCFShadowMap }}
            dpr={1.5}
            gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            camera={{ fov: rig?.fov ?? 24, near: 1, far: 900, position: rig ? [...rig.position] : [0, 0, 60] }}
          >
            {rig && <PoseCamera position={rig.position} target={rig.target} fov={rig.fov} roll={rig.roll} />}
            {environment}
            {finish ? (
              <Finish
                frame={finish.frame}
                background={background}
                profile={finish.profile}
                exposure={finish.exposure}
                envIntensity={finish.envIntensity}
                hdri={finish.hdri}
                envRotation={finish.envRotation}
                ao={finish.ao}
                aoRadius={finish.aoRadius}
                focus={finish.focus}
                aperture={finish.aperture}
                maxBlur={finish.maxBlur}
              />
            ) : (
              <FormatFov />
            )}
            <QaProbe />
          </ThreeCanvas>
          {!qaNoOverlay() && <div style={layerStyle}>{content(fmt.scale)}</div>}
          {!qaNoOverlay() && hud ? <div style={{ ...layerStyle, pointerEvents: "none" }}>{hud(fmt.scale)}</div> : null}
        </>
      ) : null}
      {fade > 0 ? <AbsoluteFill style={{ backgroundColor: fadeColor, opacity: fade }} /> : null}
    </AbsoluteFill>
  );
};
