import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { VINTAGE_PALETTE } from "../lib/palette";
import { ScholarDesk } from "../world/ObjectStage";
import { VintageOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const VINTAGEFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const VintageforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, VINTAGEFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={VINTAGE_PALETTE.parchmentSepia}
      profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM}
      hdri="warmStudio"
      envIntensity={0.9}
      ao
      near={0.05}
      far={60}
      overlay={() => <VintageOverlay f={f} />}
    >
      {/* Candle-warm key from the upper right, parchment bounce as fill */}
      <KeyLight extent={5} keyPos={[4, 7, 4]} keyColor="#ffd9a3" keyIntensity={1.6} fill={0.18} fillColor="#f3ead6" rim="#ffcf8a" rimIntensity={0.9} />
      {/* Candle pool on the instrument: the room falls off into warm shadow around it */}
      <spotLight position={[1.5, 6, 4]} angle={0.42} penumbra={0.7} intensity={34} distance={14} decay={1.6} color="#ffd9a3" castShadow />
      <pointLight position={[-2, 2.5, 2]} intensity={1.2} color="#ffb060" distance={7} />
      <ScholarDesk f={f} />
    </FilmScene>
  );
};
