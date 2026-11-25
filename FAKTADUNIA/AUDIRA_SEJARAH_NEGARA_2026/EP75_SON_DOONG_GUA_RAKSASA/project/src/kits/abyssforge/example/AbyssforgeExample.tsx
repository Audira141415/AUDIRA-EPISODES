import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { WaterColumn3D, waterColour } from "../scene/WaterColumn3D";
import { Jellyfish3D } from "../scene/Jellyfish3D";
import { Lanternmaw3D } from "../scene/Lanternmaw3D";
import { getAbyssCamera } from "../camera/rig";
import { AbyssforgeOverlay } from "../camera/Overlay";
import { AbyssPost, AbyssToneMap } from "../lib/post";
import { descent, smooth } from "../core/motion";

export const ABYSSFORGE_EXAMPLE_SECONDS = 12;

/**
 * ABYSSFORGE example (Style #52): a slow descent from the twilight zone into the midnight zone.
 * Hook: a cyan jelly pulses in the last god-rays. Development: the light dies, life lights itself.
 * Payoff (~9–11 s): a lure flickers on in the dark and reveals the lanternmaw waiting below.
 *
 * Post: the kit keeps its own chain (AbyssPost: selective bloom on HDR living light, ACES, vignette,
 * grain 0.012), so FilmScene runs with post={false} and only adds the canvas setup, environment and
 * the background (the same depth-ramp colour WaterColumn3D writes, so both agree every frame).
 */
export const AbyssforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getAbyssCamera(t);
  const water = `#${waterColour(descent(t)).getHexString()}`;

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={water}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      envIntensity={0.35}
      ao={false}
      near={0.05}
      far={200}
      post={false}
      overlay={() => <AbyssforgeOverlay t={t} />}
    >
      <AbyssToneMap exposure={shot.exposure} />
      <WaterColumn3D t={t} />
      <Jellyfish3D t={t} />
      <Lanternmaw3D t={t} />
      <AbyssPost frame={frame} strength={0.8 + smooth(9, 10.5, t) * 0.1} radius={0.5} threshold={0.78} vignette={0.42} grain={0.012} />
    </FilmScene>
  );
};
