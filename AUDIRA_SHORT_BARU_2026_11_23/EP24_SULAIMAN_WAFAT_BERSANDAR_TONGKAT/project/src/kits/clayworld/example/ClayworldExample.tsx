// CLAYWORLD technical example — an 8-second stop-motion clay creature story with squash-and-stretch hops.
// Features a handcrafted plasticine character, mushroom tabletop diorama, stepped 15 FPS cadence,
// and warm miniature studio lighting.
//
// Time runs on film frames at a 60 fps clock (`f`), ensuring identical 30 fps preview and 60 fps final.
// Wrapped in FilmScene for standardised canvas, camera, environment and finishing chain.

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CLAY_PALETTE } from "../lib/palette";
import { ClayCreature } from "../character/ClayCreature";
import { ClayDiorama } from "../world/ClayDiorama";
import { ClayAtmosphere } from "../world/Atmosphere";
import { ClayOverlay } from "../camera/Overlay";
import { getClayCameraPose } from "../camera/rig";
import { stepFrame } from "../core/motion";

export const CLAYWORLD_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const ClayworldExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getClayCameraPose(f, CLAYWORLD_EXAMPLE_SECONDS * FILM_FPS);

  // Enforce authentic 15 FPS stepped animation clock for character physics
  const sf = stepFrame(f, 4);

  // Discrete stop-motion blinking at specific frame ranges
  const blinkState =
    (sf >= 60 && sf <= 72) ||
    (sf >= 220 && sf <= 232) ||
    (sf >= 410 && sf <= 422);

  // Hop 1: Frames 140 to 200
  let hopHeight = 0;
  let squashFactor = 0;

  if (sf >= 130 && sf < 144) {
    // Anticipation crouch / squash
    squashFactor = -0.22;
  } else if (sf >= 144 && sf < 180) {
    // Air jump arc with stretch
    const progress = (sf - 144) / 36;
    hopHeight = Math.sin(progress * Math.PI) * 0.9;
    squashFactor = 0.28 * Math.cos(progress * Math.PI);
  } else if (sf >= 180 && sf < 196) {
    // Impact landing squash
    squashFactor = -0.3;
  }

  // Hop 2: Frames 240 to 310
  if (sf >= 240 && sf < 252) {
    squashFactor = -0.25;
  } else if (sf >= 252 && sf < 294) {
    const progress = (sf - 252) / 42;
    hopHeight = Math.sin(progress * Math.PI) * 1.35;
    squashFactor = 0.35 * Math.cos(progress * Math.PI);
  } else if (sf >= 294 && sf < 312) {
    squashFactor = -0.32;
  }

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={CLAY_PALETTE.studioBackground}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      ao
      near={0.1}
      far={500}
      overlay={() => <ClayOverlay f={f} filmTitle="THE LITTLE CLAY CRITTER" />}
    >
      {/* Soft warm key from the left; warm-studio HDRI gives plasticine its waxy sheen */}
      <KeyLight extent={4} keyPos={[-4, 6, 3]} keyIntensity={1.8} fill={0.65} rim="#ffd4a0" rimIntensity={0.3} />
      <ClayAtmosphere />
      <ClayDiorama />
      <ClayCreature
        f={f}
        hopHeight={hopHeight}
        squashFactor={squashFactor}
        blinkState={blinkState}
        color={CLAY_PALETTE.terracotta}
      />
    </FilmScene>
  );
};
