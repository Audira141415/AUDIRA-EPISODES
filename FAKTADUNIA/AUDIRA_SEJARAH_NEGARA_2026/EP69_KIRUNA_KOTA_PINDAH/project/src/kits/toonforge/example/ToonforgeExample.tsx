// TOONFORGE technical example — an 8-second high-octane anime action sequence at 60 FPS.
// Features cel-shaded mecha craft with inverted-hull ink outlines, thruster ignition snap,
// radial manga speed lines, impact camera shake, and dramatic comic overlays.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { TOON_PALETTE } from "../lib/palette";
import { MechaCore } from "../character/MechaCore";
import { SpeedLines } from "../effects/SpeedLines";
import { AnimeDiorama } from "../world/AnimeDiorama";
import { ToonAtmosphere } from "../world/Atmosphere";
import { ToonOverlay } from "../camera/Overlay";
import { getToonCameraPose } from "../camera/rig";
import { remap, ease } from "../core/motion";

export const TOONFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const ToonforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getToonCameraPose(f, TOONFORGE_EXAMPLE_SECONDS * FILM_FPS);

  // Mecha Aerodynamics & Boost timing
  // Frames 0-160: Idle warming up
  // Frames 160-320: Full boost speed burst
  // Frames 320-480: Cruise hero glide
  const isBoostPhase = f >= 160 && f < 320;
  const thrustPower = isBoostPhase ? 1.0 : f < 160 ? remap(f, 60, 160, 0.1, 0.4) : 0.65;
  const speedLinesIntensity = isBoostPhase ? 1.0 : f >= 320 ? remap(f, 320, 380, 0.8, 0.0) : 0.0;

  // Aerodynamic roll into bank
  const roll = isBoostPhase ? ease.animeSnap(remap(f, 160, 240, 0, 0.45)) : 0.15;
  const pitch = isBoostPhase ? -0.15 : 0.05;

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={TOON_PALETTE.animeDusk}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      ao={false}
      near={0.1}
      far={500}
      overlay={() => <ToonOverlay f={f} episodeTitle="PROJECT: VALKYRIE // EP. 01" />}
    >
      {/* Anime action key: warm rim for thruster glow, hard key for dramatic shadows */}
      <KeyLight extent={4} keyPos={[-3, 5, 4]} keyIntensity={2.4} fill={0.5} rim="#ff6b35" rimIntensity={0.5} />
      <ToonAtmosphere />
      <AnimeDiorama f={f} />
      <MechaCore f={f} pitch={pitch} roll={roll} thrustPower={thrustPower} />
      <SpeedLines f={f} count={52} intensity={speedLinesIntensity} />
    </FilmScene>
  );
};
