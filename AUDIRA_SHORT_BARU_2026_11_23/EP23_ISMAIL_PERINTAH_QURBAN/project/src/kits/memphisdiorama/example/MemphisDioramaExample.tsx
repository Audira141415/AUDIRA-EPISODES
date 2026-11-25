import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { TerrazzoPlinth3D } from "../scene/TerrazzoPlinth3D";
import { SottsassTotem3D } from "../scene/SottsassTotem3D";
import { getMemphisDioramaCamera } from "../camera/rig";
import { MemphisDioramaOverlay } from "../camera/Overlay";
import { MEMPHISDIORAMA_PALETTE } from "../lib/palette";

export const MEMPHISDIORAMA_EXAMPLE_SECONDS = 12;

export const MemphisDioramaExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getMemphisDioramaCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={MEMPHISDIORAMA_PALETTE.paperWarm}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="studio"
      ao
      near={0.05}
      far={80}
      overlay={() => <MemphisDioramaOverlay f={f} />}
    >
      {/* Crisp gallery key from the upper left for the hard violet shadows */}
      <KeyLight extent={4} keyPos={[-4, 7.5, 4]} keyColor="#FFF8E7" keyIntensity={2.4} fill={0.6} rim="#90CAF9" rimIntensity={0.5} />
      <TerrazzoPlinth3D f={f} />
      <SottsassTotem3D f={f} />
    </FilmScene>
  );
};
