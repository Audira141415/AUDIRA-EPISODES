import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette.ts";
import { getCamera } from "./motion.ts";
import { BaitulHikmahWorld } from "./World.tsx";
import { BaitulHikmahOverlay } from "./Overlay.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";

export const SHORT_SECONDS = 63;

const CameraDriver: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = getCamera(f);
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.position);
    c.fov = cam.fov;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

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

export const BaitulHikmahShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;

  return (
    <AbsoluteFill style={{ background: P.room }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{
          position: [0, 1.2, 2],
          fov: 34,
          near: 0.01,
          far: 50,
        }}
      >
        <CameraDriver f={f} />
        <StudioEnv />
        <color attach="background" args={[P.room]} />
        <fog attach="fog" args={[P.room, 6, 14]} />

        <ambientLight intensity={0.32} color="#6A4A30" />
        <hemisphereLight args={["#7A5A3A", "#120A06", 0.45]} />
        <directionalLight
          position={[-3, 4, 2]}
          intensity={0.55}
          color="#C9B8A0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.001}
        />
        <directionalLight
          position={[3, 3, 1]}
          intensity={0.25}
          color="#B8964F"
        />

        <BaitulHikmahWorld f={f} />
      </ThreeCanvas>

      <Audio src={staticFile("audio/vo.wav")} />
      <BaitulHikmahOverlay f={f} />
      <AudiraOutro />
      <AudiraSignature seed="ep01-baitul-hikmah" />
    </AbsoluteFill>
  );
};
