import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Finish } from "../../../core/render/Finish";
import { COLOR_PROFILES } from "../../../core/render/FinishingPresets";
import { Workshop3D } from "../scene/Workshop3D";
import { Machine3D } from "../scene/Machine3D";
import { getChainCamera } from "../camera/rig";
import { ChainreactionOverlay } from "../camera/Overlay";
import { ChainTiming, FLAG_UP, filmTime, machineTime } from "../core/chain";
import { CHAINREACTION_PALETTE as P } from "../lib/palette";
import { win } from "../core/motion";

export const CHAINREACTION_EXAMPLE_SECONDS = 13;
/** Machine starts at 0.9 s and runs 1.15× slower than real time (weightier, still believable). */
const TIMING: ChainTiming = { start: 0.9, scale: 1.15 };

const CameraRig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const cam = getChainCamera(t, TIMING);
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.position);
    c.fov = cam.fov;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  });
  return null;
};

export const ChainreactionExample: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const m = machineTime(t, TIMING);
  const cam = getChainCamera(t, TIMING);
  const trailBoost = win(t, filmTime(FLAG_UP, TIMING) + 0.3, filmTime(FLAG_UP, TIMING) + 1.6);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: P.bg }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [2, 3, 3], fov: 34, near: 0.03, far: 40 }}>
        <CameraRig t={t} />
        <hemisphereLight args={["#FFE9CF", "#2A1C12", 0.35]} />
        {/* desk-lamp key from the front right, cool rim from the back left */}
        <directionalLight
          position={[2.4, 4.2, 3.2]}
          intensity={2.1}
          color={P.lamp}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-2.6}
          shadow-camera-right={2.8}
          shadow-camera-top={3.4}
          shadow-camera-bottom={-0.6}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-2.5, 3.2, -1.6]} intensity={0.9} color={P.rim} />
        <pointLight position={[0.2, 3.1, 0.9]} intensity={1.4} distance={4} decay={2} color={P.lamp} />
        <Workshop3D />
        <Machine3D m={m} trailBoost={trailBoost} />
        <Finish
          frame={frame}
          background={P.bg}
          profile={COLOR_PROFILES.DOCUMENTARY_WARM}
          exposure={0.95}
          hdri="warmStudio"
          envIntensity={0.45}
          focus={cam.focus}
          aperture={0.0012}
          maxBlur={0.005}
        />
      </ThreeCanvas>
      <ChainreactionOverlay t={t} timing={TIMING} />
    </div>
  );
};
