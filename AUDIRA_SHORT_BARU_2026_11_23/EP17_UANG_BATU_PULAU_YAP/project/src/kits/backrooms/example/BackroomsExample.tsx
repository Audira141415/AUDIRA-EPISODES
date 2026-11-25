import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { LiminalMaze3D } from "../scene/LiminalMaze3D";
import { FluorescentCeiling3D } from "../scene/FluorescentCeiling3D";
import { getBackroomsCamera } from "../camera/rig";
import { BackroomsOverlay } from "../camera/Overlay";
import { computeBackroomsState } from "../core/motion";
import { BACKROOMS_PALETTE as C } from "../lib/palette";

export const BACKROOMS_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * BACKROOMS example (Style #39): a found-footage walk down the yellow corridor of Level 0.
 * Hook: the camcorder walks in under humming tubes past an abandoned office chair. Payoff
 * (~8.4–9.3 s): the tubes die from the far end toward the camera; only the red EXIT sign remains.
 *
 * Post: FilmScene's Finish chain (AO for the corridor corners, bloom on the tubes and the EXIT sign,
 * DOCUMENTARY_WARM grade, grain 0.008). The kit has no composer of its own.
 */
export const BackroomsExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getBackroomsCamera(f);
  const { blackout } = computeBackroomsState(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={C.voidDark}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      envIntensity={0.5 * (1 - blackout * 0.7)}
      near={0.05}
      far={40}
      overlay={() => <BackroomsOverlay f={f} />}
    >
      {/* Overhead office key (the tubes' combined spill) and a warm yellow bounce; both drop with the blackout */}
      <KeyLight extent={6} keyPos={[0.4, 6, 1.5]} keyColor={C.fluorescentWhite} keyIntensity={0.9 * (1 - blackout * 0.85)} fill={0.32 * (1 - blackout * 0.7)} fillColor="#e8d88a" rim={null} />
      <fog attach="fog" args={[C.voidDark, 8, 22]} />
      <LiminalMaze3D f={f} />
      <FluorescentCeiling3D f={f} />
    </FilmScene>
  );
};
