// SCALEFORGE technical example — 12 s continuous logarithmic zoom-out: ant -> person -> skyscraper ->
// mountain -> Earth -> Sun, each measured on a re-decading ground ruler with order-of-magnitude labels,
// while the white measuring studio dissolves into deep space. Hook: ant macro. Payoff (~9.7–11 s): the Sun.
//
// FilmScene handles canvas, PoseCamera, font loading, and the opaque backdrop.
// Dynamic background (studio → space) is recomputed each frame and passed to FilmScene.
// Kit keeps its own fog, ambient/hemisphere/directional lights (all animated with spaceMix),
// and ao=false in Finish.

import React from "react";
import * as THREE from "three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { ScaleObjects3D } from "../scene/ScaleObjects3D";
import { MeasureRuler3D } from "../scene/MeasureRuler3D";
import { ScaleBackdrop3D } from "../scene/ScaleBackdrop3D";
import { getScaleCamera } from "../camera/rig";
import { ScaleOverlay } from "../camera/Overlay";
import { SCALE_PALETTE as P } from "../lib/palette";
import { spaceMix, zoomAt } from "../core/motion";

export const SCALEFORGE_EXAMPLE_SECONDS = 12;

export const ScaleforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const z = zoomAt(t);
  const sm = spaceMix(z.e);
  const bg = new THREE.Color(P.studio).lerp(new THREE.Color(P.space), sm);
  const bgHex = `#${bg.getHexString()}`;
  const pose = getScaleCamera(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: pose.position, target: pose.target, fov: pose.fov }}
      background={bgHex}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      ao={false}
      near={0.05}
      far={2000}
      overlay={() => <ScaleOverlay t={t} height={height} />}
    >
      <fog attach="fog" args={[bgHex, 30, 140 + sm * 2000]} />
      <ambientLight intensity={0.55 - sm * 0.35} />
      <hemisphereLight args={["#FFFFFF", "#C9D2DC", 0.6 * (1 - sm)]} />
      <directionalLight
        position={[-5, 8, 7]}
        intensity={2.2}
        color="#FFF6EA"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[6, 2, 3]} intensity={0.6 + sm * 1.6} color={sm > 0.5 ? "#FFC27A" : "#DDE8FF"} />
      <ScaleBackdrop3D z={z} t={t} />
      <ScaleObjects3D z={z} t={t} />
      <MeasureRuler3D z={z} t={t} />
    </FilmScene>
  );
};
