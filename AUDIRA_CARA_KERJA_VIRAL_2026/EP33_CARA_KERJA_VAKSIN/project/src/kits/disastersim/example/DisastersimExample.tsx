// DISASTERSIM technical example — 12 s calm geohazard explainer on a sliced earth block.
// Hook (0–2.6 s): close on the locked fault as it loads. Rupture at 2.6 s: rebound, rings, magnitude.
// Development: the wave splits, slows and steepens toward the coast; warning ramp climbs; evacuation route lights.
// Payoff (~8.6–11 s): run-up on the beach while the town's route and high-ground beacon glow.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { EarthBlock3D } from "../scene/EarthBlock3D";
import { TsunamiWater3D } from "../scene/TsunamiWater3D";
import { CoastalTown3D } from "../scene/CoastalTown3D";
import { getDisasterCamera } from "../camera/rig";
import { DisasterOverlay } from "../camera/Overlay";
import { DISASTER_PALETTE as P } from "../lib/palette";

export const DISASTERSIM_EXAMPLE_SECONDS = 12;

export const DisastersimExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = getDisasterCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={P.void}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      ao
      near={0.05}
      far={80}
      overlay={() => <DisasterOverlay t={t} height={1920} />}
    >
      <KeyLight extent={5} keyPos={[4, 8, 6]} keyColor="#FFF4E6" keyIntensity={2.1} fill={0.45} rim="#9CC8FF" rimIntensity={0.7} />
      <color attach="background" args={[P.void]} />
      <fog attach="fog" args={[P.void, 18, 46]} />
      <ambientLight intensity={0.45} color="#DCEAF2" />
      <hemisphereLight args={["#CFE6FF", "#2A2018", 0.5]} />
      <pointLight position={[0, -3.6, 3.2]} intensity={3} distance={6} color={P.mantleHot} />
      <EarthBlock3D t={t} />
      <TsunamiWater3D t={t} />
      <CoastalTown3D t={t} />
    </FilmScene>
  );
};
