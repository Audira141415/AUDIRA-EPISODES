import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { computeComicState } from "../core/motion";
import { ComicCameraConfig, getComicCamera } from "../camera/rig";
import { ComicforgeOverlay } from "../camera/Overlay";
import { CityPanels3D } from "../scene/CityPanels3D";
import { Hero3D } from "../scene/Hero3D";
import { Impact3D } from "../scene/Impact3D";
import { useComicMats } from "../scene/Ink";
import { COMIC_PALETTE } from "../lib/palette";

export const COMICFORGE_EXAMPLE_SECONDS = 12;

/** Inner scene: useComicMats must be called inside the R3F canvas context. */
const SceneContent: React.FC<{
  f: number;
  dotPx: number;
  s: ReturnType<typeof computeComicState>;
  cam: ComicCameraConfig;
}> = ({ f, dotPx, s, cam }) => {
  const mats = useComicMats(dotPx);
  return (
    <>
      <CityPanels3D mats={mats} />
      <Hero3D s={s} mats={mats} />
      <Impact3D s={s} mats={mats} cam={cam.position} />
    </>
  );
};

export const ComicforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  // Ben-Day dot cell scales with output height so preview and final print the same screen
  const dotPx = Math.max(4, Math.round((11 * height) / 1920));
  const s = computeComicState(f);
  const cam = getComicCamera(s);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov, roll: cam.roll }}
      background={COMIC_PALETTE.skyTop}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      ao
      near={0.1}
      far={120}
      overlay={() => <ComicforgeOverlay f={f} width={1080} height={1920} />}
    >
      {/* Pop art punch: hard key with magenta rim for the ink outlines */}
      <KeyLight extent={4} keyPos={[-3, 5, 4]} keyIntensity={2.4} fill={0.5} rim="#ff4081" rimIntensity={0.4} />
      <SceneContent f={f} dotPx={dotPx} s={s} cam={cam} />
    </FilmScene>
  );
};
