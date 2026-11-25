// GLASSCRAFT technical example — an 8-second spatial computing showcase at 60 FPS.
// Features beveled frosted glass cards with transmission refraction, orbiting liquid droplets with
// dynamic surface tension wobble, iridescent rim lighting, and a modern spatial computing HUD.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { GLASS_PALETTE } from "../lib/palette";
import { GlassSanctuary } from "../world/GlassSanctuary";
import { GlassAtmosphere } from "../world/Atmosphere";
import { GlassOverlay } from "../camera/Overlay";
import { getGlassCameraPose } from "../camera/rig";
import { remap, ease } from "../core/motion";

export const GLASSCRAFT_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const GlasscraftExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getGlassCameraPose(f, GLASSCRAFT_EXAMPLE_SECONDS * FILM_FPS);

  // Spatial Gyroscopic Tilts
  // Gentle tactile parallax response
  const tiltX = Math.sin(f * 0.02) * 0.12 + (f > 150 ? ease.spatialFloat(remap(f, 150, 240, 0, 0.18)) : 0);
  const tiltY = Math.cos(f * 0.025) * 0.18 + (f > 180 ? -ease.spatialFloat(remap(f, 180, 280, 0, 0.35)) : 0);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={GLASS_PALETTE.voidDark}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      envIntensity={0.55}
      ao
      near={0.1}
      far={500}
      overlay={() => <GlassOverlay f={f} />}
    >
      {/* Cathedral light from upper left; HDRI gives glass its reflections */}
      <KeyLight extent={5} keyPos={[-5, 8, 2]} keyIntensity={1.6} fill={0.65} rim="#fff8e0" rimIntensity={0.4} />
      <GlassAtmosphere />
      <GlassSanctuary f={f} cardTiltX={tiltX} cardTiltY={tiltY} />
    </FilmScene>
  );
};
