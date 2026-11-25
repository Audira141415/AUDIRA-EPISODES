import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { NoirStreet3D } from "../scene/NoirStreet3D";
import { DetectiveSilhouette3D } from "../scene/DetectiveSilhouette3D";
import { getFilmNoirCamera } from "../camera/rig";
import { FilmNoirOverlay } from "../camera/Overlay";
import { FILMNOIR_PALETTE } from "../lib/palette";

export const FILMNOIR_EXAMPLE_SECONDS = 12;

export const FilmNoirExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;

  const cam = getFilmNoirCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background="#060709"
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      hdri="night"
      exposure={0.72}
      envIntensity={0.1}
      ao
      near={0.1}
      far={50}
      overlay={() => <FilmNoirOverlay f={f} />}
    >
      {/* Very low ambient light to preserve pitch black Chiaroscuro shadows */}
      <ambientLight intensity={0.06} color="#4A5568" />

      {/* Cold Blue Moonlight Rim Light from Above-Behind */}
      <directionalLight
        position={[-3.5, 6.5, -4.0]}
        intensity={1.2}
        color={FILMNOIR_PALETTE.rimLightCool}
      />

      {/* 3D Wet Alley Street Environment */}
      <NoirStreet3D f={f} />

      {/* Brooding Detective Silhouette */}
      <DetectiveSilhouette3D f={f} />
    </FilmScene>
  );
};
