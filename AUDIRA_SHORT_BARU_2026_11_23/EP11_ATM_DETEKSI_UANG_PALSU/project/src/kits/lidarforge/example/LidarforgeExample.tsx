// LIDARFORGE technical example — an 8-second 3D point cloud aerial survey sequence at 60 FPS.
// Features 8,400+ elevation-colored terrain points, sweeping laser scanline curtain,
// drone flight camera trajectory, and geospatial survey HUD telemetry.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { LIDAR_PALETTE } from "../lib/palette";
import { SurveyWorld } from "../world/SurveyWorld";
import { LidarAtmosphere } from "../world/Atmosphere";
import { LidarOverlay } from "../camera/Overlay";
import { getLidarCameraPose } from "../camera/rig";

export const LIDARFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const LidarforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getLidarCameraPose(f, LIDARFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={LIDAR_PALETTE.surveyVoid}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      ao={false}
      near={0.1}
      far={500}
      overlay={() => <LidarOverlay f={f} />}
    >
      <KeyLight extent={4} keyPos={[-3, 5, 4]} keyIntensity={2.0} fill={0.4} rim="#00ff00" rimIntensity={0.6} />
      <LidarAtmosphere />
      <SurveyWorld f={f} />
    </FilmScene>
  );
};
