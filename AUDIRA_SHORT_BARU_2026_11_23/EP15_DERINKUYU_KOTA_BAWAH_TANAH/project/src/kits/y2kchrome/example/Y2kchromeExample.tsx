import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { KeyLight } from "../../../core/scene/KeyLight.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { SkyDome3D } from "../scene/SkyDome3D";
import { ChromeBlob3D } from "../scene/ChromeBlob3D";
import { Bubbles3D } from "../scene/Bubbles3D";
import { getY2kchromeCamera } from "../camera/rig";
import { Y2kchromeOverlay } from "../camera/Overlay";
import { makeEnvScene } from "../lib/materials";
import { Y2KCHROME_PALETTE as P } from "../lib/palette";

export const Y2KCHROME_EXAMPLE_SECONDS = 12;

/** Sky-coloured reflection environment: what makes the chrome read as Y2K chrome. */
const SkyEnv: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(makeEnvScene(), 0.02);
    pm.dispose();
    return rt;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env.texture;
    scene.environmentIntensity = 1;
  }, [scene, env]);
  return null;
};

export const Y2kchromeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const t = f / 60;
  const cam = getY2kchromeCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background={P.skyMid}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={0.86}
      envIntensity={0}
      near={0.05}
      far={120}
      overlay={() => <Y2kchromeOverlay f={f} />}
    >
      <SkyEnv />
      <KeyLight extent={5} keyPos={[3, 6, 5]} keyColor="#FFFFFF" keyIntensity={1.6} fill={0.5} rim={P.iriCyan} rimIntensity={0.8} />
      <ambientLight intensity={0.4} color="#DFF3FF" />
      <SkyDome3D t={t} />
      <ChromeBlob3D t={t} />
      <Bubbles3D t={t} />
    </FilmScene>
  );
};
