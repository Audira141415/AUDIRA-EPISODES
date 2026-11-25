import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { GeospatialTerrain3D } from "../scene/GeospatialTerrain3D";
import { OrbitalTargetReticle3D } from "../scene/OrbitalTargetReticle3D";
import { getSatelliteBriefingCamera } from "../camera/rig";
import { SatelliteBriefingOverlay } from "../camera/Overlay";
import { Finish } from "../../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../../core/camera/PoseCamera.tsx";

export const SATELLITEBRIEFING_EXAMPLE_SECONDS = 12;

export const SatelliteBriefingExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;

  const cam = getSatelliteBriefingCamera(f);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#070B0E" }}>
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

        <GeospatialTerrain3D f={f} />
        <OrbitalTargetReticle3D f={f} />
        {/* Finishing chain: reflections, AO, bloom, tone mapping, grade (motion-memory GLOBAL) */}
        <Finish frame={frame} background={"#070B0E"} profile={COLOR_PROFILES.CYBER_NEON_VOID} ao={false} />
      </ThreeCanvas>

      <SatelliteBriefingOverlay f={f} />
    </div>
  );
};
