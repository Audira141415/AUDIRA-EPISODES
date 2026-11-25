import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PoolRoom3D } from "../scene/PoolRoom3D";
import { DreamVista3D } from "../scene/DreamVista3D";
import { getDreamCamera } from "../camera/rig";
import { DreamcoreOverlay } from "../camera/Overlay";
import { DreamPost, DreamToneMap } from "../lib/post";
import { DREAM_PALETTE } from "../lib/palette";
import { smooth } from "../core/motion";

export const DREAMCORE_EXAMPLE_SECONDS = 12;

/**
 * DREAMCORE example (Style #64): a pastel pool room with clouds under its tiled ceiling.
 * Hook: a door standing in the water opens by itself and sky light spills out. Development: the
 * camera floats down the room and through a great arch. Payoff (~9–11 s): outside, stairs rise out
 * of endless water into the sky, and the door at the top lights up.
 *
 * Post: the kit keeps its own chain (DreamPost: soft bloom on the doorway light only, ACES, vignette,
 * grain 0.012), so FilmScene runs with post={false} and only adds the canvas setup (dpr 1.5, MSAA,
 * PCF shadows) and the haze background. envIntensity 0 keeps FilmScene's studio HDRI off: the kit's
 * own PMREM sky (DreamVista3D) is the environment, so water, tile and bubbles reflect the pastel sky.
 */
export const DreamcoreExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getDreamCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background={DREAM_PALETTE.haze}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      envIntensity={0}
      ao={false}
      near={0.05}
      far={200}
      post={false}
      overlay={() => <DreamcoreOverlay t={t} />}
    >
      <DreamToneMap exposure={shot.exposure} />
      <DreamVista3D t={t} />
      <PoolRoom3D t={t} />
      <DreamPost frame={frame} strength={0.25 + smooth(8.5, 10.5, t) * 0.2} radius={0.5} threshold={0.95} vignette={0.32} grain={0.012} />
    </FilmScene>
  );
};
