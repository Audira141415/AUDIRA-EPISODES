import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { computeGlitchState } from "../core/motion";
import { getGlitchCamera } from "../camera/rig";
import { GlitchforgeOverlay } from "../camera/Overlay";
import { StudioSet3D } from "../scene/StudioSet3D";
import { HeroSculpture3D } from "../scene/HeroSculpture3D";
import { GlitchPost } from "../scene/GlitchPost";
import { GLITCH_PALETTE } from "../lib/palette";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";

export const GLITCHFORGE_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * GLITCHFORGE example (Style #68). FilmScene gives dpr 1.5, antialias, PCF shadows, the studio HDRI
 * and the layout-px overlay; the kit keeps its own post (`post={false}` + GlitchPost), because the
 * glitch IS the look: RGB split, tears and macroblocks are full-frame effects Finish cannot make.
 * Glitch arrives as accent bursts (core/motion.ts BURSTS); between bursts the hero reads clean.
 */
export const GlitchforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const s = computeGlitchState(f);
  const cam = getGlitchCamera(s);
  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov, roll: cam.roll }}
      background={GLITCH_PALETTE.studio}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      envIntensity={0.7}
      near={0.1}
      far={80}
      post={false}
      overlay={() => <GlitchforgeOverlay s={s} />}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={6}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0003}
      />
      {/* cyan + red kickers: the RGB signal colours as rim light on the pearl */}
      <pointLight position={[-3.5, 3, -1.5]} color={GLITCH_PALETTE.cyan} intensity={8} distance={9} decay={2} />
      <pointLight position={[3, 1.6, -2.5]} color={GLITCH_PALETTE.signalRed} intensity={5} distance={8} decay={2} />
      <StudioSet3D />
      <HeroSculpture3D s={s} />
      <GlitchPost s={s} />
    </FilmScene>
  );
};
