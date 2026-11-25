// SATISFYFORGE technical example (12 s): oddly satisfying loops — sand slicing, liquid fill, shape drops.
//
// FilmScene handles canvas, PoseCamera, font loading, and the opaque backdrop.
// Kit keeps StudioEnv (procedural PMREM for soft product reflections, envIntensity=0 in FilmScene
// to avoid doubling), its own hemisphere + 2 directional lights, and the DOCUMENTARY_WARM grade.

import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { StudioSweep3D } from "../scene/StudioSweep3D";
import { SandSlice3D } from "../scene/SandSlice3D";
import { LiquidFill3D } from "../scene/LiquidFill3D";
import { ShapeDrop3D } from "../scene/ShapeDrop3D";
import { getSatisfyforgeCamera } from "../camera/rig";
import { SatisfyforgeOverlay } from "../camera/Overlay";
import { SATISFYFORGE_PALETTE as P } from "../lib/palette";

export const SATISFYFORGE_EXAMPLE_SECONDS = 12;

const StudioEnv: React.FC = () => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(new RoomEnvironment(), 0.04);
    pm.dispose();
    return rt;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env.texture;
    scene.environmentIntensity = 0.3;
    scene.background = new THREE.Color(P.sweepWall);
  }, [scene, env]);
  return null;
};

export const SatisfyforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const t = f / 60;
  const cam = getSatisfyforgeCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position as [number, number, number], target: cam.target as [number, number, number], fov: cam.fov }}
      background={P.sweepWall}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.9}
      envIntensity={0}
      near={0.05}
      far={60}
      overlay={() => <SatisfyforgeOverlay f={f} />}
    >
      <StudioEnv />
      <hemisphereLight args={[P.sky2, P.ground, 0.55]} />
      {/* big soft overhead softbox: blurred VSM shadows */}
      <directionalLight
        position={[1.5, 6, 3.5]}
        intensity={1.45}
        color={P.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-radius={14}
        shadow-blurSamples={16}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-4, 2.5, 4]} intensity={0.45} color="#FFE7F0" />

      <StudioSweep3D t={t} />
      <SandSlice3D t={t} />
      <LiquidFill3D t={t} />
      <ShapeDrop3D t={t} />
    </FilmScene>
  );
};
