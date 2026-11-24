// NANOFORGE technical example — an 8-second molecular nanotech sequence at 60 FPS.
// Features procedural DNA double helix with rotating base pairs, undulating cellular vesicles,
// Brownian thermal drift, bioluminescent lighting, and Cryo-EM microscopy telemetry.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { NANO_PALETTE } from "../lib/palette";
import { MicroCosmos } from "../world/MicroCosmos";
import { NanoAtmosphere } from "../world/Atmosphere";
import { NanoOverlay } from "../camera/Overlay";
import { getNanoCameraPose } from "../camera/rig";

export const NANOFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const NanoforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getNanoCameraPose(f, NANOFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={NANO_PALETTE.microscopyVoid}
      profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
      hdri="studio"
      ao
      near={0.1}
      far={500}
      overlay={() => <NanoOverlay f={f} />}
    >
      {/* Microscopy key: cool focused beam, subtle fill for bioluminescent glow */}
      <KeyLight extent={3} keyPos={[-3, 5, 3]} keyIntensity={2.0} fill={0.5} />
      <NanoAtmosphere />
      <MicroCosmos f={f} />
    </FilmScene>
  );
};
