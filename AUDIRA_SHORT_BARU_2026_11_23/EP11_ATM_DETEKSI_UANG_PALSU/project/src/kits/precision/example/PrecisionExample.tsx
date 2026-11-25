// PRECISION technical example — an 8-second industrial CMF showcase at 60 FPS.
// Demonstrates macro seam inspection, monotonic exploded part separation, titanium/ceramic PBR materials,
// magnetic snap reassembly, and Swiss-style technical typography callouts.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PRECISION_PALETTE } from "../lib/palette";
import { StudioStage } from "../world/StudioStage";
import { ExplodedAssembly } from "../assembly/ExplodedPart";
import { PrecisionOverlay } from "../camera/Overlay";
import { getPrecisionCameraPose } from "../camera/rig";
import { remap, ease } from "../core/motion";

export const PRECISION_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const PrecisionExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getPrecisionCameraPose(f, PRECISION_EXAMPLE_SECONDS * FILM_FPS);

  // Exploded Timing:
  // Frames 0 - 140: Closed / Docked
  // Frames 140 - 240: Exploding outward
  // Frames 240 - 320: Suspended exploded state
  // Frames 320 - 400: Magnetic snap reassembly
  // Frames 400 - 480: Hero packshot
  let explodeProgress = 0;
  if (f >= 140 && f < 240) {
    explodeProgress = ease.explodeEase(remap(f, 140, 240, 0, 1));
  } else if (f >= 240 && f < 320) {
    explodeProgress = 1;
  } else if (f >= 320 && f < 400) {
    explodeProgress = 1 - ease.magneticSnap(remap(f, 320, 400, 0, 1));
  } else if (f >= 400) {
    explodeProgress = 0;
  }

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={PRECISION_PALETTE.satinBlack}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      exposure={1.08}
      envIntensity={0.5}
      aoRadius={0.08}
      ao
      near={0.1}
      far={500}
      overlay={() => <PrecisionOverlay f={f} />}
    >
      {/* Industrial product key: crisp studio lighting for titanium/ceramic PBR */}
      <KeyLight extent={4} keyPos={[-4, 6, 3]} keyIntensity={2.2} fill={0.55} />
      <StudioStage />
      <ExplodedAssembly f={f} explodeProgress={explodeProgress} />
    </FilmScene>
  );
};
