// CIRCUITFORGE technical example — an 8-second 3D PCB electronics sequence at 60 FPS.
// Features 3D FR-4 substrate, octilinear copper traces, central BGA silicon processor,
// glowing electron current streams, gold ENIG test pads, and hardware diagnostic HUD telemetry.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing chain.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CIRCUIT_PALETTE } from "../lib/palette";
import { CircuitStage } from "../world/CircuitStage";
import { CircuitAtmosphere } from "../world/Atmosphere";
import { CircuitOverlay } from "../camera/Overlay";
import { getCircuitCameraPose } from "../camera/rig";

export const CIRCUITFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const CircuitforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCircuitCameraPose(f, CIRCUITFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={CIRCUIT_PALETTE.solderMaskDark}
      profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
      hdri="studio"
      ao
      near={0.1}
      far={500}
      overlay={() => <CircuitOverlay f={f} />}
    >
      {/* PCB green accent key from the left; HDRI gives ENIG pads their gold reflections */}
      <KeyLight extent={4} keyPos={[-3, 5, 4]} keyIntensity={2.0} fill={0.5} rim="#00ff88" rimIntensity={0.4} />
      <CircuitAtmosphere />
      <CircuitStage f={f} />
    </FilmScene>
  );
};
