// AUDIRABOT technical example — an 8-second mascot robot showcase at 60 FPS.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing chain.
// The kit's own accent lights (thruster-glow directional + underlight) are kept inside FilmScene.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { AUDIRABOT_PALETTE } from "../lib/palette";
import { AudiraBotMesh } from "../robot/AudiraBotMesh";
import { AudirabotOverlay } from "../camera/Overlay";
import { getBotCameraPose } from "../camera/rig";
import { TrackedPin3D } from "../hud/TrackedPin3D";

export const AUDIRABOT_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const AudirabotExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getBotCameraPose(f, AUDIRABOT_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={AUDIRABOT_PALETTE.ambientVoid}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      exposure={0.9}
      envIntensity={1.2}
      ao
      near={0.05}
      far={80}
      overlay={() => <AudirabotOverlay f={f} />}
    >
      {/* Studio showcase key; thruster-plasma accent from the right */}
      <KeyLight extent={4} keyPos={[-4, 6, 3]} keyIntensity={2.4} fill={0.55} rim="#80d8ff" rimIntensity={0.5} />
      {/* Kit accent lights */}
      <directionalLight position={[-4, 2, -2]} intensity={1.2} color={AUDIRABOT_PALETTE.thrusterPlasma} />
      <pointLight position={[0, -1, 0]} intensity={2.5} distance={3} color={AUDIRABOT_PALETTE.thrusterPlasma} />

      {/* Mascot Robot */}
      <AudiraBotMesh f={f} />

      {/* 3D World-Space Telemetry Callout Pin */}
      <TrackedPin3D
        anchor={[0, 0.2, 0.5]}
        cardOffset={[0.75, 0.6, 0]}
        kicker="NEURAL COMPANION"
        title="COGNITION CORE"
        value="4.80 GHz"
        accentColor={AUDIRABOT_PALETTE.eyeCyan}
        f={f}
        scale={0.8}
      />
    </FilmScene>
  );
};
