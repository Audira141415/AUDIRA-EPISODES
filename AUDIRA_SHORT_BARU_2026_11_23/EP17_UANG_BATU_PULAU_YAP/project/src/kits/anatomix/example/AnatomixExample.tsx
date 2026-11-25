// ANATOMIX technical example — 12 s clinical anatomy explainer of a stylised (non-gory) heart.
// Hook (0–2 s): close on an opaque beating heart. Development: wall turns translucent, blue right-heart
// circuit, then red left-heart circuit, labels with leader lines. Payoff (~8.8–11 s): both circuits flowing,
// hologram rings flare, camera keeps orbiting.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { Heart3D } from "../scene/Heart3D";
import { BloodFlow3D } from "../scene/BloodFlow3D";
import { HoloSuite3D } from "../scene/HoloSuite3D";
import { getAnatomyCamera } from "../camera/rig";
import { AnatomyOverlay } from "../camera/Overlay";
import { ANATOMY_PALETTE as P } from "../lib/palette";

export const ANATOMIX_EXAMPLE_SECONDS = 12;

export const AnatomixExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pose = getAnatomyCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={P.void}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      ao={false}
      near={0.1}
      far={80}
      overlay={() => <AnatomyOverlay t={t} width={1080} height={1920} />}
    >
      <KeyLight extent={4} keyPos={[3, 5, 5]} keyColor="#FFF3EE" keyIntensity={2.2} fill={0.35} rim={P.holo} rimIntensity={0.6} />
      <ambientLight intensity={0.35} color="#CFF7F2" />
      <directionalLight position={[-4, 2, -3]} intensity={1.4} color={P.holo} />
      <pointLight position={[0, -0.9, 0.6]} intensity={3} distance={5} color={P.holo} />
      <HoloSuite3D t={t} />
      <BloodFlow3D t={t} />
      <Heart3D t={t} />
    </FilmScene>
  );
};
