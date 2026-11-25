// AE-063 cover (BUILDFORGE): oval stadium with a cable-wheel roof, packed stands, no column
// in front of the spectators. Force colours preview the film's legend (tarik biru, tekan oranye).
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { orbit, type Pose } from "./camera.ts";
import { FULL_ROOF, Stadium } from "./scenes.tsx";
import { useMats } from "./world.tsx";

const SKY = "#cfe3ef";
const FONT = "Manrope, 'Segoe UI', sans-serif";
export const COVER_POSE: Pose = { pos: orbit([0, 8, 6], 130, 14, 30), target: [0, 8, 6], fov: 38 };

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.lookAt(new THREE.Vector3(...pose.target));
    c.fov = pose.fov;
    c.near = 0.1;
    c.far = 1200;
    c.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

const Scene: React.FC = () => {
  const m = useMats();
  return <Stadium m={m} f={40} roof={FULL_ROOF} />;
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const k = 1;
  return (
    <AbsoluteFill style={{ backgroundColor: SKY }}>
      <ThreeCanvas width={1080} height={1920} dpr={1} shadows camera={{ fov: COVER_POSE.fov, position: COVER_POSE.pos, near: 0.1, far: 1200 }}>
        <Rig pose={COVER_POSE} />
        <fog attach="fog" args={[SKY, 140, 420]} />
        <hemisphereLight args={["#eaf4ff", "#9a8f74", 1.15]} />
        <directionalLight position={[-36, 52, 30]} intensity={2.7} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-48} shadow-camera-right={48} shadow-camera-top={48} shadow-camera-bottom={-48} shadow-camera-near={1} shadow-camera-far={160} shadow-bias={-0.0005} />
        <directionalLight position={[30, 14, -30]} intensity={0.55} color="#cfe0ff" />
        <Scene />
        <Finish frame={frame} background={SKY} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.9} envIntensity={0.4} hdri="sky" ao />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 270 * k }}>
        <div style={{ display: "inline-block", background: "rgba(12,30,38,0.84)", color: "#7fe3c4", fontFamily: FONT, fontWeight: 800, fontSize: 36 * k, letterSpacing: 4 * k, padding: `${8 * k}px ${22 * k}px`, borderRadius: 999 }}>AUDIRA EXPLAINED</div>
        <div style={{ marginTop: 22 * k, fontFamily: FONT, fontWeight: 900, fontSize: 118 * k, lineHeight: 1.0, color: "#0f2a33", letterSpacing: -2 * k, textShadow: "0 4px 0 rgba(255,255,255,0.65)" }}>
          Atap Stadion
          <br />
          <span style={{ color: "#ff7a2a" }}>Tanpa Tiang?</span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 70 * k, bottom: 420 * k, background: "rgba(12,30,38,0.84)", borderRadius: 22 * k, padding: `${14 * k}px ${28 * k}px`, fontFamily: FONT, fontWeight: 800, fontSize: 40 * k, color: "#fff" }}>
        rahasianya: <span style={{ color: "#ff8a3d" }}>roda sepeda</span>
      </div>
    </AbsoluteFill>
  );
};
