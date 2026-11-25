import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CHALK_PALETTE } from "../lib/palette";
import { ChalkClassroom } from "../world/ObjectStage";
import { ChalkOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const CHALKCRAFT_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const ChalkcraftExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, CHALKCRAFT_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={CHALK_PALETTE.slateBlack}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      envIntensity={0.4}
      ao
      near={0.05}
      far={80}
      overlay={() => <ChalkOverlay f={f} />}
    >
      {/* Warm window key from the right, cool classroom fill */}
      <KeyLight extent={5} keyPos={[4, 6, 5]} keyColor="#ffe2b8" keyIntensity={2.0} fill={0.4} fillColor="#d6e4ff" rim="#7be0ff" rimIntensity={0.5} />
      <ChalkClassroom f={f} />
    </FilmScene>
  );
};
