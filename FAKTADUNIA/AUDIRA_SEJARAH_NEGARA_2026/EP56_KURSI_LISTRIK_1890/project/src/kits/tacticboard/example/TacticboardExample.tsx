// TACTICBOARD technical example — 12 s broadcast tactics breakdown on a miniature 3D pitch board.
// Hook (0–2 s): overhead board, 4-3-3 vs 4-4-2. Development: switch, overlap, near-post run with
// passing lanes and run arrows. Payoff (~8–11 s): goal, net bulge, low pitch-side camera, golden replay path.
// Everything derives from useCurrentFrame(); time t is in seconds, identical at 30 fps preview and 60 fps final.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { PitchBoard3D } from "../scene/PitchBoard3D";
import { PlayerTokens3D } from "../scene/PlayerTokens3D";
import { PlayLines3D } from "../scene/PlayLines3D";
import { getTacticCamera } from "../camera/rig";
import { TacticOverlay } from "../camera/Overlay";
import { TACTIC_PALETTE as P } from "../lib/palette";

export const TACTICBOARD_EXAMPLE_SECONDS = 12;

export const TacticboardExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = getTacticCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={P.void}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      ao
      near={0.1}
      far={120}
      overlay={() => <TacticOverlay t={t} height={1920} />}
    >
      <color attach="background" args={[P.void]} />
      <fog attach="fog" args={[P.void, 16, 38]} />
      <ambientLight intensity={0.35} color="#DDE6F0" />
      <hemisphereLight args={["#CFE0FF", "#1A2A10", 0.55]} />
      <directionalLight
        position={[5, 12, 5]}
        intensity={2.4}
        color={P.flood}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 6, -12]} intensity={0.9} color="#9CC3FF" />
      <PitchBoard3D t={t} />
      <PlayerTokens3D t={t} />
      <PlayLines3D t={t} />
    </FilmScene>
  );
};
