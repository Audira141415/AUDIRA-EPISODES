import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { FeltLandscape3D } from "../scene/FeltLandscape3D";
import { WoolFox3D, foxHandLocal } from "../scene/WoolFox3D";
import { FeltApple, YarnTree3D } from "../scene/YarnTree3D";
import { getFeltcraftCamera } from "../camera/rig";
import { FeltcraftOverlay } from "../camera/Overlay";
import { computeFoxPose } from "../core/motion";
import { FELTCRAFT_PALETTE as P } from "../lib/palette";

export const FELTCRAFT_EXAMPLE_SECONDS = 12;

export const FeltcraftExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const t = f / 60;
  const cam = getFeltcraftCamera(f);

  // world-space point of the fox's paws (where the falling apple lands)
  const pose = computeFoxPose(f);
  const hand = foxHandLocal(pose.armLift)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), pose.yaw)
    .add(new THREE.Vector3(pose.x, pose.y, pose.z));

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={P.skyFelt}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      hdri="warmStudio"
      exposure={0.82}
      envIntensity={0.25}
      ao
      near={0.05}
      far={60}
      overlay={() => <FeltcraftOverlay f={f} />}
    >
      <color attach="background" args={[P.skyFelt]} />
      <hemisphereLight args={[P.skyFill, P.groundBounce, 0.9]} />
      {/* cosy warm key, soft shadows */}
      <directionalLight
        position={[3.5, 5.5, 4.5]}
        intensity={2.1}
        color={P.keyWarm}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
        shadow-radius={5}
      />
      {/* rim from behind-left catches the fuzz edges */}
      <directionalLight position={[-3, 3, -4]} intensity={1.2} color="#FFD2A0" />
      <pointLight position={[0.6, 1.6, 2.2]} intensity={2.2} distance={6} decay={1.5} color="#FFC98A" />

      <FeltLandscape3D t={t} />
      <YarnTree3D t={t} foxHand={hand} />
      <WoolFox3D f={f}>
        <FeltApple />
      </WoolFox3D>
    </FilmScene>
  );
};
