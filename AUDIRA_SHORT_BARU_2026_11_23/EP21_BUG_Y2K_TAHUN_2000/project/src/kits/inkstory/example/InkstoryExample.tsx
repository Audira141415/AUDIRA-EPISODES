// INKSTORY technical example — an 8-second traditional ink wash painting sequence at 60 FPS.
// Features 3D layered Shan Shui mountain peaks, billowing mist, animated calligraphy stroke write-on,
// swaying ink bamboo, red cinnabar seal stamp, and traditional vertical verse.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { INK_PALETTE } from "../lib/palette";
import { InkMountainDiorama } from "../world/InkMountainDiorama";
import { InkAtmosphere } from "../world/Atmosphere";
import { InkOverlay } from "../camera/Overlay";
import { getInkCameraPose } from "../camera/rig";

export const INKSTORY_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const InkstoryExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getInkCameraPose(f, INKSTORY_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={INK_PALETTE.agedXuanPaper}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="studio"
      exposure={0.82}
      envIntensity={0.25}
      ao
      near={0.1}
      far={500}
      overlay={() => <InkOverlay f={f} />}
    >
      {/* Soft eastern window light for ink wash warmth */}
      <KeyLight extent={4} keyPos={[-4, 6, 4]} keyIntensity={1.5} fill={0.6} />
      <InkAtmosphere />
      <InkMountainDiorama f={f} />
    </FilmScene>
  );
};
