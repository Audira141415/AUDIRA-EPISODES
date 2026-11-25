import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ISOCRAFT_PALETTE } from "../lib/palette";
import { IsoKitchen } from "../world/ObjectStage";
import { IsoOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const ISOCRAFT_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const IsocraftExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, ISOCRAFT_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={ISOCRAFT_PALETTE.paperWarm}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      ao
      near={1}
      far={120}
      overlay={() => <IsoOverlay f={f} />}
    >
      {/* Flat illustration light: strong top-left key throws one clean blue-grey shadow */}
      <KeyLight extent={6} keyPos={[-5, 9, 4]} keyIntensity={2.0} fill={0.75} rim={null} />
      <IsoKitchen f={f} />
    </FilmScene>
  );
};
