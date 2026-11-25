import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { StorybookCanvas3D } from "../scene/StorybookCanvas3D";
import { StorybookCharacter3D } from "../scene/StorybookCharacter3D";
import { getWatercolorCamera } from "../camera/rig";
import { WatercolorOverlay } from "../camera/Overlay";
import { WATERCOLOR_PALETTE } from "../lib/palette";

export const WATERCOLOR_EXAMPLE_SECONDS = 12;

export const WatercolorExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getWatercolorCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background="#FAF6EF"
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.82}
      envIntensity={0.25}
      near={0.1}
      far={50}
      overlay={() => <WatercolorOverlay f={f} />}
    >
      <KeyLight extent={5} keyPos={[3.5, 5.5, 4]} keyColor={WATERCOLOR_PALETTE.sunlightMorning} keyIntensity={1.8} fill={0.39} />
      <ambientLight intensity={0.7} color={WATERCOLOR_PALETTE.ambientSoft} />
      <StorybookCanvas3D f={f} />
      <StorybookCharacter3D f={f} />
    </FilmScene>
  );
};
