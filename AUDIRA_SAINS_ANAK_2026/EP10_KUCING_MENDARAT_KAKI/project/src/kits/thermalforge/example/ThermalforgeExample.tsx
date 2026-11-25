import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { THERMAL_PALETTE } from "../lib/palette";
import { ThermalServerRoom } from "../world/ObjectStage";
import { ThermalOverlay } from "../camera/Overlay";
import { getCameraPose } from "../camera/rig";

export const THERMALFORGE_EXAMPLE_SECONDS = 8;
const FILM_FPS = 60;

export const ThermalforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * FILM_FPS;
  const pose = getCameraPose(f, THERMALFORGE_EXAMPLE_SECONDS * FILM_FPS);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background="#1a0b30"
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      hdri="studio"
      envIntensity={0.2}
      ao
      near={0.05}
      far={60}
      overlay={() => <ThermalOverlay f={f} />}
    >
      {/* Thermal imagery is self-lit: a low cool key for form, the ironbow emissives carry the picture */}
      <KeyLight extent={5} keyPos={[3, 7, 5]} keyColor="#b9a6ff" keyIntensity={0.9} fill={0.25} fillColor="#5a3d9a" rim={THERMAL_PALETTE.flirMagenta} rimIntensity={0.8} />
      <fog attach="fog" args={["#24104a", 10, 24]} />
      <ThermalServerRoom f={f} />
    </FilmScene>
  );
};
