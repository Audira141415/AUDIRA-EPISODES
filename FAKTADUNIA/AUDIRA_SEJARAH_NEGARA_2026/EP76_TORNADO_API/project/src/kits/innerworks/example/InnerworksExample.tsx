// INNERWORKS technical example — an 8-second cutaway explainer at 60 FPS.
// Hook: a closed pastel gearbox. Development (1.3–3 s): the front cover lifts away behind a cyan
// section line. Payoff (5–8 s): the whole 24 : 15 : 30 gear train turning at 3600 RPM, seen on a
// diagonal. Time runs on film frames at a 60 fps clock (`f`), so 30 fps preview and 60 fps final match.
//
// Post: FilmScene's Finish chain (AO, bloom, APPLE_STUDIO_CLEAN grade, grain 0.003). Bright studio
// backdrop after the quality-bar cover; the brass and steel gears take reflections from the studio HDRI.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { INNERWORKS_PALETTE as P } from "../lib/palette";
import { CutawayStage } from "../world/CutawayStage";
import { InnerworksOverlay } from "../camera/Overlay";
import { getInnerworksCameraPose } from "../camera/rig";
import { remap, ease } from "../core/motion";

export const INNERWORKS_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const InnerworksExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getInnerworksCameraPose(f, INNERWORKS_EXAMPLE_SECONDS * FILM_FPS);
  // Cover: closed until 1.3 s, open by 3 s.
  const cutawayProgress = ease.smooth(remap(f, 80, 180, 0, 1));

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={P.studioPaper}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      envIntensity={1.0}
      near={0.1}
      far={120}
      overlay={() => <InnerworksOverlay f={f} />}
    >
      <fog attach="fog" args={[P.studioPaper, 22, 60]} />
      <KeyLight extent={4.5} keyPos={[4, 8, 7]} keyColor="#fff6ea" keyIntensity={2.2} fill={0.5} fillColor="#f2f7ff" rim="#bfe9ff" rimIntensity={0.7} />
      <CutawayStage f={f} cutawayProgress={cutawayProgress} />
    </FilmScene>
  );
};
