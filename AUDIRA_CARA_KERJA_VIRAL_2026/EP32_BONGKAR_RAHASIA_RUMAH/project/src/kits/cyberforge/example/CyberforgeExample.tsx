// CYBERFORGE technical example — an 8-second cinematic sci-fi hero sequence at any FPS.
// Features a quantum core activation, counter-rotating gimbal rings, expanding HUD telemetry,
// infinite cyber floor grid, upward data streams, and target lock-on telemetry.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CYBER_PALETTE } from "../lib/palette";
import { CyberAtmosphere } from "../world/Atmosphere";
import { CyberGrid } from "../world/CyberGrid";
import { HoloCore } from "../world/HoloCore";
import { DataStream } from "../world/DataStream";
import { CyberOverlay } from "../camera/Overlay";
import { getCyberCameraPose } from "../camera/rig";
import { remap, ease } from "../core/motion";

export const CYBERFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const CyberforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCyberCameraPose(f, CYBERFORGE_EXAMPLE_SECONDS * FILM_FPS);

  // Lock progress ramps up from frame 270 to 360 (approx 4.5s to 6.0s)
  const lockProgress = remap(f, 270, 360, 0, 1);

  // Core overload pulse peaks during the locked phase (frame 360 to 480)
  const coreOverload = remap(f, 350, 440, 0, 1) * ease.surge(remap(f, 350, 480, 0, 1));

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={CYBER_PALETTE.voidDeep}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      ao={false}
      near={0.1}
      far={500}
      overlay={() => <CyberOverlay f={f} lockProgress={lockProgress} brandTitle="CYBERFORGE // QUANTUM PROTOCOL" />}
    >
      {/* Neon rim light from the left; holographic glow on the core */}
      <KeyLight extent={4} keyPos={[-4, 6, 3]} keyIntensity={2.4} fill={0.4} rim="#00ffff" rimIntensity={0.6} />
      <CyberAtmosphere f={f} />
      <CyberGrid f={f} size={44} divisions={36} />
      <DataStream f={f} count={160} />
      <HoloCore f={f} lockProgress={lockProgress} coreOverload={coreOverload} />
    </FilmScene>
  );
};
