import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TerrazzoPlinth3D } from "../scene/TerrazzoPlinth3D";
import { SottsassTotem3D } from "../scene/SottsassTotem3D";
import { getMemphisDioramaCamera } from "../camera/rig";
import { MemphisDioramaOverlay } from "../camera/Overlay";
import { Finish } from "../../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../../core/camera/PoseCamera.tsx";

export const MEMPHISDIORAMA_EXAMPLE_SECONDS = 12;

export const MemphisDioramaExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;

  const cam = getMemphisDioramaCamera(f);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#FFFCF6" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: cam.position,
          fov: cam.fov,
          near: 0.1,
          far: 60,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(cam.target[0], cam.target[1], cam.target[2]);
        }}
      >
        {/* drives the camera every frame; the canvas camera prop only sets frame 0 */}
        <PoseCamera position={cam.position} target={cam.target} fov={cam.fov} />
        <ambientLight intensity={0.45} color="#FFFFFF" />
        <directionalLight position={[4.5, 7.5, 5.0]} intensity={1.65} color="#FFF8E7" />
        <directionalLight position={[-4.0, 4.0, -3.5]} intensity={0.75} color="#90CAF9" />

        <TerrazzoPlinth3D f={f} />
        <SottsassTotem3D f={f} />
        {/* Finishing chain: reflections, AO, bloom, tone mapping, grade (motion-memory GLOBAL) */}
        <Finish frame={frame} background={"#FFFCF6"} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={0.82} envIntensity={0.25} />
      </ThreeCanvas>

      <MemphisDioramaOverlay f={f} />
    </div>
  );
};
