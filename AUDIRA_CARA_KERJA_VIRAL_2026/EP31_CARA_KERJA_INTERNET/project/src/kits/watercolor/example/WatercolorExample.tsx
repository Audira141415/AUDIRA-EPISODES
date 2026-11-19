import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { StorybookCanvas3D } from "../scene/StorybookCanvas3D";
import { StorybookCharacter3D } from "../scene/StorybookCharacter3D";
import { getWatercolorCamera } from "../camera/rig";
import { WatercolorOverlay } from "../camera/Overlay";
import { WATERCOLOR_PALETTE } from "../lib/palette";
import { Finish } from "../../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../../core/camera/PoseCamera.tsx";

export const WATERCOLOR_EXAMPLE_SECONDS = 12;

export const WatercolorExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;

  const cam = getWatercolorCamera(f);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#FAF6EF" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: cam.position,
          fov: cam.fov,
          near: 0.1,
          far: 50,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(cam.target[0], cam.target[1], cam.target[2]);
        }}
      >
        {/* drives the camera every frame; the canvas camera prop only sets frame 0 */}
        <PoseCamera position={cam.position} target={cam.target} fov={cam.fov} />
        {/* Soft Warm Morning Sunlight */}
        <ambientLight intensity={0.7} color={WATERCOLOR_PALETTE.ambientSoft} />
        <directionalLight
          position={[3.5, 5.5, 4.0]}
          intensity={1.8}
          color={WATERCOLOR_PALETTE.sunlightMorning}
          castShadow
        />

        {/* 3D Storybook Watercolor Environment */}
        <StorybookCanvas3D f={f} />

        {/* Whimsical Hand-Drawn Character */}
        <StorybookCharacter3D f={f} />
        {/* Finishing chain: reflections, AO, bloom, tone mapping, grade (motion-memory GLOBAL) */}
        <Finish frame={frame} background={"#FAF6EF"} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.82} envIntensity={0.25} />
      </ThreeCanvas>

      {/* Gentle Fairytale Storybook Overlay */}
      <WatercolorOverlay f={f} />
    </div>
  );
};
