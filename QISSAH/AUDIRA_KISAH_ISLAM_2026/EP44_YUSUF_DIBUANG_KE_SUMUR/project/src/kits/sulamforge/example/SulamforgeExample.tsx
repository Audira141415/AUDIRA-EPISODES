import React, { useLayoutEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { HoopStudio3D } from "../scene/HoopStudio3D";
import { StitchField3D } from "../scene/StitchField3D";
import { getSulamCamera } from "../camera/rig";
import { SulamOverlay } from "../camera/Overlay";
import { SULAM_PALETTE as P } from "../lib/palette";
import { computeSulamState } from "../core/motion";

export const SULAMFORGE_EXAMPLE_SECONDS = 12;

/** Soft studio reflections: gold floats, brass clamp and the steel needle need something to mirror. */
const StudioEnv: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

export const SulamforgeExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const s = computeSulamState(f);
  const cam = getSulamCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={P.backdrop}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.9}
      envIntensity={0}
      ao
      near={0.01}
      far={40}
      overlay={() => <SulamOverlay f={f} />}
    >
      <StudioEnv />
      <color attach="background" args={[P.backdrop]} />
      <fog attach="fog" args={[P.backdrop, 4.5, 9]} />
      <hemisphereLight args={["#FFE9D2", "#2A0E18", 0.4]} />
      <directionalLight
        position={[-2.2, 4, 2.2]}
        intensity={1.55}
        color="#FFD9A6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[1.5, 2, -3]} intensity={0.7} color="#B9C4FF" />
      {/* the payoff glint sweep: a warm grazing light travelling across the gold */}
      <pointLight position={[s.sweep * 1.6, 0.55, 0.9]} intensity={7 * s.sweepPower} distance={4} decay={1.5} color="#FFF0D0" />
      <HoopStudio3D f={f} />
      <StitchField3D f={f} />
    </FilmScene>
  );
};
