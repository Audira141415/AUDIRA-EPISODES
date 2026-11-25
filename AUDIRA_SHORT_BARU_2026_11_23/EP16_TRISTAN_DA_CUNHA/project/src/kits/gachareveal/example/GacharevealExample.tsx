import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { RevealStage3D } from "../scene/RevealStage3D";
import { Capsule3D, CAPSULE_CENTER } from "../scene/Capsule3D";
import { HoloCard3D } from "../scene/HoloCard3D";
import { Confetti3D } from "../scene/Confetti3D";
import { getGacharevealCamera } from "../camera/rig";
import { GacharevealOverlay } from "../camera/Overlay";
import { flash, rarityColor } from "../core/motion";
import { GACHAREVEAL_PALETTE as P } from "../lib/palette";

export const GACHAREVEAL_EXAMPLE_SECONDS = 12;

/** RoomEnvironment PMREM so capsule chrome and holo foil get soft studio reflections. */
const StageEnv: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(new RoomEnvironment(), 0.04);
    pm.dispose();
    return rt;
  }, [gl]);
  React.useLayoutEffect(() => {
    scene.environment = env.texture;
    scene.environmentIntensity = 0.35;
    scene.background = new THREE.Color(P.void);
  }, [scene, env]);
  return null;
};

export const GacharevealExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const t = f / 60;
  const cam = getGacharevealCamera(f);
  const col = rarityColor(t);
  const fl = flash(t);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={P.void}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      envIntensity={0}
      exposure={0.9}
      ao
      near={0.05}
      far={80}
      overlay={() => <GacharevealOverlay f={f} />}
    >
      <StageEnv />
      <ambientLight intensity={0.25} color="#8C8CFF" />
      <spotLight position={[0, 7, 3]} angle={0.5} penumbra={0.8} intensity={60} decay={1.5} color="#FFFFFF" castShadow shadow-mapSize={[1024, 1024]} />
      {/* rarity-coloured practical from the capsule core */}
      <pointLight position={[CAPSULE_CENTER.x, CAPSULE_CENTER.y + 0.3, CAPSULE_CENTER.z]} intensity={6 + fl * 20} distance={9} decay={1.6} color={col} />
      <directionalLight position={[-4, 3, -4]} intensity={1.1} color={col} />
      <directionalLight position={[3, 2, 5]} intensity={0.6} color="#FFE9C4" />
      <RevealStage3D t={t} />
      <Capsule3D t={t} />
      <HoloCard3D t={t} />
      <Confetti3D t={t} />
    </FilmScene>
  );
};
