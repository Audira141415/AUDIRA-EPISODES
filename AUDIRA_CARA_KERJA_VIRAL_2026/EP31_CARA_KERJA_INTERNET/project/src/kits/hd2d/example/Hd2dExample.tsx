import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { TimberTownDiorama3D } from "../scene/TimberTownDiorama3D";
import { PixelHeroBillboard3D } from "../scene/PixelHeroBillboard3D";
import { getHd2dCamera } from "../camera/rig";
import { Hd2dOverlay } from "../camera/Overlay";
import { HD2D_PALETTE } from "../lib/palette";
import { HERO_Z, computeHd2dState } from "../core/motion";

export const HD2D_EXAMPLE_SECONDS = 12;
const FILM_FPS = 60;
// DOCUMENTARY_WARM with a heavy optical vignette: the dark rim pulls the eye to the lantern pool
// (miniature look) and separates the subject from the frame edges.
const HD2D_PROFILE = { ...COLOR_PROFILES.DOCUMENTARY_WARM, vignette: 0.55 };

/**
 * HD2D example (Style #35): a flat pixel hero in a physically lit night diorama. Hook: one lantern
 * burns in a dark town. Development: the hero walks (8 fps steps) to the lantern. Payoff (8.5–10 s):
 * the windows light one by one, embers burst, the camera pushes in.
 *
 * Post: FilmScene's Finish (DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, AO, motion memory "best")
 * plus Finish's bokeh pass as the tilt-shift: focus on the hero, small aperture. The kit has no
 * composer of its own, so there is exactly one post chain.
 */
export const Hd2dExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const cam = getHd2dCamera(f);
  const s = computeHd2dState(f);
  const hero: [number, number, number] = [s.heroX, 0.5, HERO_Z];
  const focus = Math.hypot(cam.position[0] - hero[0], cam.position[1] - hero[1], cam.position[2] - hero[2]);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={HD2D_PALETTE.midnightSlate}
      profile={HD2D_PROFILE}
      hdri="studio"
      exposure={1}
      envIntensity={0.55}
      ao
      focus={focus}
      aperture={0.006}
      maxBlur={0.03}
      near={0.1}
      far={60}
      overlay={() => <Hd2dOverlay f={f} />}
    >
      {/* cool moonlight key (casts the shadows), low cool fill; the lantern is the warm practical */}
      <KeyLight extent={4} keyPos={[-4, 7, 3.5]} keyColor="#9DB8FF" keyIntensity={0.65} fill={0.22 + s.wake * 0.08} fillColor="#8EA2C8" rim={HD2D_PALETTE.lanternAmber} rimIntensity={1.1} />
      <fog attach="fog" args={[HD2D_PALETTE.midnightSlate, 9, 22]} />
      {/* lantern bounce that follows the hero: warm key on the sprite so it separates from the facades */}
      <pointLight position={[s.heroX + 0.25, 1.1, HERO_Z + 0.9]} color="#FFD08A" intensity={3.4} distance={2.6} decay={2} />
      <TimberTownDiorama3D f={f} />
      <PixelHeroBillboard3D f={f} />
    </FilmScene>
  );
};
