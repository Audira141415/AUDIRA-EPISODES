import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { RETROWAVE_PALETTE } from "../lib/palette";
import { RetroSunAndGrid as ObjectStage } from "../world/ObjectStage";
import { RetrowaveOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const RETROWAVE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const RetrowaveExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, RETROWAVE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={RETROWAVE_PALETTE.voidDark}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      envIntensity={0.7}
      ao={false}
      near={0.05}
      far={120}
      overlay={() => <RetrowaveOverlay f={f} />}
    >
      {/* Sunset key from behind the car, magenta rim from the horizon */}
      <KeyLight extent={5} keyPos={[2.5, 5, -6]} keyColor="#ffb36b" keyIntensity={1.8} fill={0.45} fillColor="#b18cff" rim={RETROWAVE_PALETTE.synthCyan} rimIntensity={1.2} />
      <pointLight position={[0, 1.2, 3]} intensity={2.5} color={RETROWAVE_PALETTE.neonMagenta} distance={6} />
      <ObjectStage f={f} />
    </FilmScene>
  );
};
