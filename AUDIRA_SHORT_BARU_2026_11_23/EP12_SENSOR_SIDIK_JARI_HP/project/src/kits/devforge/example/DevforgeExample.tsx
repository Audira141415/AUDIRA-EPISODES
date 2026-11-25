// DEVFORGE technical example — an 8-second 3D floating IDE window sequence at 60 FPS.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing chain.
// The kit's own accent lights (neon directional + metric point light) are kept inside FilmScene.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { DEVFORGE_PALETTE } from "../lib/palette";
import { IdeWindow3D } from "../ide/IdeWindow3D";
import { DevforgeOverlay } from "../camera/Overlay";
import { getDevCameraPose } from "../camera/rig";

export const DEVFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const DevforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getDevCameraPose(f, DEVFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={DEVFORGE_PALETTE.ambientVoid}
      profile={COLOR_PROFILES.CINEMA_TEAL_ORANGE}
      hdri="studio"
      ao
      near={0.05}
      far={80}
      overlay={() => <DevforgeOverlay f={f} />}
    >
      {/* Monitor-glow key from the left; neon accent from the right */}
      <KeyLight extent={4} keyPos={[-3, 5, 4]} keyIntensity={2.2} fill={0.45} rim="#4fc3f7" rimIntensity={0.5} />
      {/* Kit accent lights */}
      <directionalLight position={[-4, 2, -2]} intensity={1.4} color={DEVFORGE_PALETTE.accentNeon} />
      <pointLight position={[0, -1, 1]} intensity={2.0} color={DEVFORGE_PALETTE.metricProfit} />

      {/* 3D Floating IDE Window */}
      <IdeWindow3D f={f} />
    </FilmScene>
  );
};
