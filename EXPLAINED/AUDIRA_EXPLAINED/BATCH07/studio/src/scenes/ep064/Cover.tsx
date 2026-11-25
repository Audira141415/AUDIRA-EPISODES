// AE-064 cover (LIDARFORGE): an airliner on final approach over a runway whose ground is cut open:
// sand blanket, wet clay pierced by vertical drains, stiff base; a coral LiDAR curtain sweeps the strip.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { Airliner, AudiraBoard, C, Drains, Runway, ScanCurtain, ScanDots, Strata, type V3 } from "./world.tsx";

const POSE = { pos: [9.5, 3.4, 26] as V3, target: [0, 3.4, -2] as V3, fov: 40 };

const Rig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...POSE.pos);
    c.lookAt(new THREE.Vector3(...POSE.target));
    c.fov = POSE.fov;
    c.near = 0.1;
    c.far = 600;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const k = 1;
  return (
    <AbsoluteFill style={{ backgroundColor: C.void }}>
      <ThreeCanvas width={1080} height={1920} dpr={1} shadows camera={{ fov: POSE.fov, position: POSE.pos, near: 0.1, far: 600 }}>
        <Rig />
        <fog attach="fog" args={[C.void, 30, 90]} />
        <hemisphereLight args={["#9fb7c4", "#1a120a", 0.75]} />
        <directionalLight position={[-12, 20, 12]} intensity={2.4} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-bias={-0.0004} />
        <directionalLight position={[10, 6, -14]} intensity={0.9} color={C.teal} />
        <pointLight position={[6, 4, 10]} intensity={18} distance={30} color="#ffd2a0" />
        <Strata w={10} d={40} top={0} z={-14} layers={[{ h: 0.35, color: C.sand }, { h: 4.2, color: C.clay, rough: 0.3, clear: 0.7 }, { h: 1.6, color: C.stiff }]} />
        <Drains cols={8} rows={1} dx={1.2} dz={0} x0={-4.2} z0={6.0} top={0} depth={4.5} grow={() => 1} glow={0.5} />
        <Runway len={38} w={4} y={0} z={-14} />
        <ScanDots w={9.6} d={40} z0={-14} nx={30} nz={110} y={() => 0} reveal={(x, z) => (z > -6 && Math.abs(x) > 2.2 ? 1 : 0)} />
        <ScanCurtain pos={[0, 0, -6]} w={10.2} h={0.01} />
        <AudiraBoard pos={[3.5, 0, 3.6]} rotY={-0.2} scale={1.0} />
        <Airliner pos={[0.6, 3.6, 2]} pitch={0.12} size={11} />
        <Finish frame={frame} background={C.void} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} hdri="studio" ao={false} />
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 70 * k, right: 70 * k, top: 270 * k }}>
        <div style={{ fontFamily: "Consolas, monospace", fontSize: 36, color: C.coral, letterSpacing: 4 }}>● LIDAR SCAN // AE-064</div>
        <div style={{ fontFamily: "Bahnschrift, 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 104, lineHeight: 0.98, color: "#f4f7f8", marginTop: 14, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
          BANDARA DI ATAS
          <br />

          <span style={{ color: C.amber }}>TANAH LUNAK</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1470, display: "flex", alignItems: "center", gap: 16, background: "rgba(5,9,12,0.82)", padding: "10px 22px" }}>
        <div style={{ width: 60, height: 6, background: C.teal }} />
        <div style={{ fontFamily: "Consolas, monospace", fontSize: 40, letterSpacing: 6, color: "#e8eef0" }}>AUDIRA EXPLAINED</div>
      </div>
    </AbsoluteFill>
  );
};
