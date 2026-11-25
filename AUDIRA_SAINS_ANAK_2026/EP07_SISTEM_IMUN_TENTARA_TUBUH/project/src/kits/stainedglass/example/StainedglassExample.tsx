import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { LeadlightWindow3D } from "../scene/LeadlightWindow3D";
import { Nave3D } from "../scene/Nave3D";
import { getStainedCamera } from "../camera/rig";
import { StainedglassOverlay } from "../camera/Overlay";
import { StainedExposure, StainedPost } from "../lib/post";
import { smooth } from "../core/motion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";

export const STAINEDGLASS_EXAMPLE_SECONDS = 12;

/**
 * STAINEDGLASS example (Style #58): a leadlight lancet window assembles pane by pane.
 * Hook: the rose window's golden heart and ruby petals fly into their lead. Development: quarries
 * seat top-down into an original scene (sky, fruiting tree, hills, river) as the camera pulls back
 * past a foreground arcade. Payoff (~9–11 s): the sun flares through the finished window, the beam
 * casts the tracery and saddle bars on the floor and paints jewel light on the flagstones.
 *
 * FilmScene gives dpr 1.5, antialias, PCF shadows, the HDRI and the layout-px overlay. The kit keeps
 * its own post (`post={false}` + StainedPost): bloom on the backlit glass is the look, with ACES
 * tone mapping (StainedExposure) and a 0.01 grain.
 */
export const StainedglassExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getStainedCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: shot.pos, target: shot.target, fov: shot.fov, roll: shot.roll }}
      background="#0E0B08"
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      envIntensity={0.3}
      near={0.05}
      far={80}
      post={false}
      overlay={() => <StainedglassOverlay t={t} />}
    >
      <StainedExposure exposure={shot.exposure} />
      <Nave3D t={t} />
      <LeadlightWindow3D t={t} />
      <StainedPost frame={frame} strength={0.55 + smooth(8.8, 10.4, t) * 0.35} radius={0.5} threshold={0.82} vignette={0.45} grain={0.01} />
    </FilmScene>
  );
};
