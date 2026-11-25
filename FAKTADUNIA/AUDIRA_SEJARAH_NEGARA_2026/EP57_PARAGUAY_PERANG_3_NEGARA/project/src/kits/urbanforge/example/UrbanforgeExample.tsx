import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ArchitecturalPlinth } from "../world/ArchitecturalPlinth";
import { UrbanAtmosphere } from "../world/Atmosphere";
import { getUrbanCamera } from "../camera/rig";
import { UrbanOverlay } from "../camera/Overlay";
import { getSolarPosition, getProjectionWave } from "../core/motion";

export const URBANFORGE_EXAMPLE_SECONDS = 8;

export const UrbanforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const f = (frame / fps) * 60;
  const totalF = (durationInFrames / fps) * 60;
  const progress = Math.min(1, Math.max(0, f / totalF));

  const cam = useMemo(() => getUrbanCamera(progress), [progress]);
  const solar = getSolarPosition(progress);

  const waveProgress = Math.max(0, Math.min(1, (f - 90) / 300));
  const { waveFrontZ, pulseBrightness } = getProjectionWave(waveProgress);

  const activeLayer =
    progress < 0.45
      ? "URBAN HEIGHT CLASSIFICATION (CYAN/AMBER)"
      : progress < 0.8
      ? "CIVIC ZONING & DENSITY OCCLUSION"
      : "SOLAR SHADOW ENVELOPE (17:30 SUNSET)";

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background="#0a0a0c"
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      overlay={() => (
        <UrbanOverlay
          timeString={solar.timeString}
          activeLayer={activeLayer}
          buildingCount={24}
          maxHeight="168 M"
        />
      )}
    >
      <UrbanAtmosphere sunPosition={solar.position} sunIntensity={solar.intensity} />
      <ArchitecturalPlinth
        waveFrontZ={waveFrontZ}
        projectedLayer={progress < 0.65 ? "height" : "zoning"}
        pulseBrightness={pulseBrightness}
      />
    </FilmScene>
  );
};
