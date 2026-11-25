import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { MarbleBust3D } from "../scene/MarbleBust3D";
import { Gallery3D } from "../scene/Gallery3D";
import { getMarbleCamera } from "../camera/rig";
import { MarblemuseumOverlay } from "../camera/Overlay";
import { MarbleCameraRig, MarblePost } from "../lib/post";
import { smooth } from "../core/motion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";

export const MARBLEMUSEUM_EXAMPLE_SECONDS = 12;

/**
 * MARBLEMUSEUM example (Style #61): an original Greco-Roman style bust in a classical gallery.
 * Hook: a hand's breadth from the carved eye, veins catching the skylight. Development: a slow
 * reverent orbit pulls back past fluted columns. Payoff (~9–11 s): the sun lands on the face,
 * the rim glows and the wall label card slides in.
 *
 * FilmScene gives the canvas (dpr 1.5, antialias, PCF shadows), the HDRI reflections and the
 * layout-px overlay. Post stays the kit's own chain (MarblePost: bloom → ACES → vignette/grain):
 * the payoff bloom ramp and ACES roll-off keep the statuary white from clipping, which the Finish
 * chain's PBR Neutral did not, so FilmScene runs with post={false} (one composer).
 */
export const MarblemuseumExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getMarbleCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={shot}
      background="#120807"
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={0.82}
      envIntensity={0.35}
      near={0.05}
      far={60}
      post={false}
      overlay={() => <MarblemuseumOverlay t={t} />}
    >
      {/* sets ACES tone mapping + exposure for MarblePost (Finish leaves tone mapping alone when post is off) */}
      <MarbleCameraRig shot={shot} near={0.05} far={60} />
      <Gallery3D t={t} />
      <MarbleBust3D t={t} />
      <MarblePost frame={frame} strength={0.15 + smooth(8.4, 10.2, t) * 0.15} radius={0.5} threshold={0.95} vignette={0.45} grain={0.01} />
    </FilmScene>
  );
};
