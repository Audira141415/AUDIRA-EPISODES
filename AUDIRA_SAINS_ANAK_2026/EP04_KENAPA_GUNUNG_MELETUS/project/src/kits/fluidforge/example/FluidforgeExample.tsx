import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CausticRingArena3D } from "../scene/CausticRingArena3D";
import { LiquidMetalOrb3D } from "../scene/LiquidMetalOrb3D";
import { getFluidforgeCamera } from "../camera/rig";
import { FluidforgeOverlay } from "../camera/Overlay";
import { FLUIDFORGE_PALETTE } from "../lib/palette";
import { computeFluidforgeState } from "../core/motion";

export const FLUIDFORGE_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;

/**
 * FLUIDFORGE example (Style #34): a chrome ferrofluid core in zero-g, orbited by iridescent droplets
 * and neon rings over a black mirror floor. Payoff (8–10.5 s): the droplets spiral in and merge, the
 * core swells and the rings flash; the camera pushes in.
 *
 * Post: FilmScene's Finish chain (APPLE_STUDIO_CLEAN: neutral grade, no tint, grain 0.003, bloom on the HDR rings).
 * The chrome needs the studio HDRI to read as metal (memory GLOBAL).
 */
export const FluidforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getFluidforgeCamera(f);
  const shock = computeFluidforgeState(f).shock;

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={FLUIDFORGE_PALETTE.voidDark}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      envIntensity={0.8}
      ao={false}
      near={0.1}
      far={60}
      overlay={() => <FluidforgeOverlay f={f} />}
    >
      <KeyLight extent={3} keyPos={[3.5, 6.5, 4]} keyColor="#fff4e6" keyIntensity={1.6} fill={0.18} fillColor="#9fb4ff" rim={FLUIDFORGE_PALETTE.cyanIridescent} rimIntensity={1.4} />
      {/* coloured practicals give the chrome its cyan / magenta reflections */}
      <pointLight position={[-2.6, 0.8, 1.6]} intensity={5} color={FLUIDFORGE_PALETTE.magentaReflect} distance={7} />
      <pointLight position={[2.6, -0.4, 1.8]} intensity={5 + shock * 10} color={FLUIDFORGE_PALETTE.cyanIridescent} distance={7} />
      <CausticRingArena3D f={f} />
      <LiquidMetalOrb3D f={f} />
    </FilmScene>
  );
};
