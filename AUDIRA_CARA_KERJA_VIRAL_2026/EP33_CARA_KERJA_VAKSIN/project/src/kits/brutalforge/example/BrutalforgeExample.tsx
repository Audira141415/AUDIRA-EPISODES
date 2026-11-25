import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { BRUTAL_PALETTE } from "../lib/palette";
import { BrutalStage } from "../world/ObjectStage";
import { BrutalOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const BRUTALFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const BrutalforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, BRUTALFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={BRUTAL_PALETTE.neoYellow}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      ao
      near={0.05}
      far={80}
      overlay={() => <BrutalOverlay f={f} />}
    >
      {/* Hard sun key straight from the upper left: crisp shadows, no soft fill gradients */}
      <KeyLight extent={5} keyPos={[-4, 8, 5]} keyIntensity={2.6} fill={0.7} rim={null} />
      <BrutalStage f={f} />
    </FilmScene>
  );
};
