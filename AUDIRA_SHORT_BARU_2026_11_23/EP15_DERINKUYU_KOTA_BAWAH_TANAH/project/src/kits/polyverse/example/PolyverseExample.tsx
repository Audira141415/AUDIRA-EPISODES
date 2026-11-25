// POLYVERSE technical example — an 8-second cinematic low-poly floating island diorama at 60 FPS.
// Features flat-shaded faceted terrain, pine trees swaying in the wind, faceted water vertex waves,
// drifting geometric clouds, and a majestic isometric telephoto orbital camera.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { POLY_PALETTE } from "../lib/palette";
import { FloatingIsland } from "../world/FloatingIsland";
import { PolyAtmosphere } from "../world/Atmosphere";
import { PolyOverlay } from "../camera/Overlay";
import { getPolyCameraPose } from "../camera/rig";

export const POLYVERSE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const PolyverseExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getPolyCameraPose(f, POLYVERSE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={POLY_PALETTE.skyDawn}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="sky"
      exposure={0.82}
      envIntensity={0.25}
      ao
      near={0.1}
      far={500}
      overlay={() => <PolyOverlay f={f} islandName="AETHEL // ISLE OF PRISMS" />}
    >
      {/* Outdoor dawn key: high warm sun, generous fill for flat-shaded facets */}
      <KeyLight extent={5} keyPos={[-5, 8, 4]} keyIntensity={1.8} fill={0.6} />
      <PolyAtmosphere f={f} />
      <FloatingIsland f={f} />
    </FilmScene>
  );
};
