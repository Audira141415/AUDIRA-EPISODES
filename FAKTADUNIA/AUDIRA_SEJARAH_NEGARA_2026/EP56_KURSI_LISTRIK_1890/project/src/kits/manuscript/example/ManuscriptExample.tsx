import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FilmScene } from "../../../core/scene/FilmScene.tsx";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets.ts";
import { CodexLectern3D } from "../scene/CodexLectern3D";
import { LontarBundle3D } from "../scene/LontarBundle3D";
import { CandleLight3D } from "../scene/CandleLight3D";
import { getManuscriptCamera } from "../camera/rig";
import { ManuscriptOverlay } from "../camera/Overlay";
import { MANUSCRIPT_PALETTE as P } from "../lib/palette";

export const MANUSCRIPT_EXAMPLE_SECONDS = 12;

/** Dim warm reflections so the gold leaf reads as metal in candlelight. */
const StudioEnv: React.FC = () => {
  const { gl, scene } = useThree();
  React.useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.22;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

export const ManuscriptExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = (frame / fps) * 60;
  const cam = getManuscriptCamera(f);

  return (
    <FilmScene
      frame={frame}
      shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
      background={P.room}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      envIntensity={0}
      exposure={0.9}
      ao
      near={0.01}
      far={30}
      overlay={() => <ManuscriptOverlay f={f} />}
    >
      <StudioEnv />
      <color attach="background" args={[P.room]} />
      <fog attach="fog" args={[P.room, 3.2, 7]} />
      <ambientLight intensity={0.22} color="#6A4A30" />
      <hemisphereLight args={["#7A5A3A", "#120A06", 0.35]} />
      {/* soft window fill from the left, low so candles stay the hero */}
      <directionalLight position={[-3, 3, 2]} intensity={0.45} color="#C9B8A0" />
      <CodexLectern3D f={f} />
      <LontarBundle3D f={f} />
      <CandleLight3D f={f} />
    </FilmScene>
  );
};
