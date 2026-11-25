import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { KINTSUGI_PALETTE } from "../lib/palette";
import { KintsugiStage } from "../world/ObjectStage";
import { KintsugiOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const KINTSUGI_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const KintsugiExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, KINTSUGI_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={KINTSUGI_PALETTE.tatamiBeige}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="warmStudio"
      envIntensity={0.6}
      ao
      near={0.05}
      far={60}
      overlay={() => <KintsugiOverlay f={f} />}
    >
      {/* Soft shoji-window key from the left; the HDRI gives the gold its reflections */}
      <KeyLight extent={4} keyPos={[-4, 6, 3]} keyColor="#fff1dc" keyIntensity={2.2} fill={0.55} rim="#ffd9a0" rimIntensity={0.6} />
      <fog attach="fog" args={[KINTSUGI_PALETTE.tatamiBeige, 9, 22]} />
      <KintsugiStage f={f} />
    </FilmScene>
  );
};
