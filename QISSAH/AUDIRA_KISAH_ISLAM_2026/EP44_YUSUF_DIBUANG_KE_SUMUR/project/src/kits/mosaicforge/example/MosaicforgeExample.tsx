import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TesseraeField3D } from "../scene/TesseraeField3D";
import { MosaicHall3D } from "../scene/MosaicHall3D";
import { getMosaicCamera } from "../camera/rig";
import { MosaicforgeOverlay } from "../camera/Overlay";
import { MosaicCameraRig, MosaicPost } from "../lib/post";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";

export const MOSAICFORGE_EXAMPLE_SECONDS = 12;

/**
 * MOSAICFORGE example (Style #60): thousands of tesserae rain down and settle into an original sun-bird.
 * Hook: tiles clatter past a lens skimming the grout bed. Development: the settling wave finishes by
 * ~3.8 s while the camera pulls back and rises, so the picture reads from 4 s. Payoff (~9–11 s): the
 * camera is almost overhead and the whole picture reads at once.
 *
 * FilmScene gives the canvas (dpr 1.5, antialias, PCF shadows), the HDRI reflections for the gold
 * smalti and the layout-px overlay. Post stays the kit's own chain (MosaicPost: bloom → ACES →
 * vignette/grain) so the gold glints bloom on ACES roll-off; FilmScene runs with post={false}.
 */
export const MosaicforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = getMosaicCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={shot}
      background="#2A1D14"
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.84}
      envIntensity={0.4}
      near={0.03}
      far={80}
      post={false}
      overlay={() => <MosaicforgeOverlay t={t} />}
    >
      {/* sets ACES tone mapping + exposure for MosaicPost (Finish leaves tone mapping alone when post is off) */}
      <MosaicCameraRig shot={shot} near={0.03} far={80} />
      <MosaicHall3D t={t} />
      <TesseraeField3D t={t} />
      <MosaicPost frame={frame} strength={0.22} radius={0.35} threshold={0.95} vignette={0.4} grain={0.01} />
    </FilmScene>
  );
};
