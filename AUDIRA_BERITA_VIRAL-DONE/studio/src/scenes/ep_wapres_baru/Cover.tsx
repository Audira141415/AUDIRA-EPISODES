import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Finish } from "../../core/render/Finish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const BG = "#0A0C10";
const CYAN = "#00D4FF";
const AMBER = "#FFB020";
const SLATE = "#1A1E28";

const CoverCamera: React.FC = () => {
  const { camera } = useThree();
  React.useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0.2, 1.6, 3.8);
    cam.lookAt(0, 0.9, -0.5);
    cam.fov = 38;
    cam.layers.enable(FX_LAYER);
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const Room: React.FC = () => (
  <>
    {/* evidence desk */}
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 0.9, 1.6]} />
      <meshPhysicalMaterial color={SLATE} clearcoat={0.3} roughness={0.15} metalness={0.1} />
    </mesh>

    {/* VP chair silhouette with amber glow */}
    <group position={[0, 0.9, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.5]} />
        <meshPhysicalMaterial color="#1A1210" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.95, -0.2]}>
        <boxGeometry args={[0.65, 0.12, 0.08]} />
        <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={2.5} roughness={0.3} />
      </mesh>
    </group>

    {/* screen panel BG */}
    <mesh position={[0, 2.4, -4]} receiveShadow>
      <planeGeometry args={[8, 4]} />
      <meshStandardMaterial color="#061018" emissive={CYAN} emissiveIntensity={1.8} />
    </mesh>

    {/* grid floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[16, 16]} />
      <meshPhysicalMaterial color="#0D1014" roughness={0.9} metalness={0} />
    </mesh>
    <gridHelper args={[16, 32, CYAN, CYAN]} position={[0, 0, 0]}>
      <meshBasicMaterial attach="material" color={CYAN} transparent opacity={0.08} toneMapped={false} />
    </gridHelper>

    {/* FG silhouettes */}
    <mesh position={[-1.8, 1.0, 2.8]} castShadow>
      <boxGeometry args={[0.5, 2.0, 0.3]} />
      <meshPhysicalMaterial color="#0F1418" roughness={0.8} />
    </mesh>
    <mesh position={[-1.8, 2.05, 2.8]}>
      <boxGeometry args={[0.5, 0.1, 0.3]} />
      <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={3} roughness={0.3} />
    </mesh>
    <mesh position={[2.2, 1.1, 3.2]} castShadow>
      <boxGeometry args={[0.45, 2.2, 0.28]} />
      <meshPhysicalMaterial color="#0F1418" roughness={0.8} />
    </mesh>
    <mesh position={[2.2, 2.25, 3.2]}>
      <boxGeometry args={[0.45, 0.1, 0.28]} />
      <meshPhysicalMaterial color={AMBER} emissive={AMBER} emissiveIntensity={3} roughness={0.3} />
    </mesh>

    {/* cork board hint */}
    <mesh position={[-3.5, 1.8, -3]} rotation={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[1.8, 1.4, 0.08]} />
      <meshPhysicalMaterial color="#8B6914" roughness={0.8} />
    </mesh>
  </>
);

const CoverScene: React.FC = () => (
  <>
    <CoverCamera />
    <ambientLight intensity={0.15} color="#B0C4DE" />
    <spotLight position={[0, 5, 2]} intensity={3} angle={Math.PI / 4} color="#FFF8F0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0003} />
    <rectAreaLight position={[0, 2.4, -3.8]} width={6} height={3} intensity={2} color={CYAN} />
    <pointLight position={[0, 1.8, 0]} intensity={1.5} color={AMBER} distance={6} />
    <spotLight position={[0, 3, 5]} intensity={1.2} color="#405060" angle={Math.PI / 3} />
    <Room />
    <Finish frame={0} background={BG} profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1.35} envIntensity={0.7} ao={false} />
  </>
);

const CoverOverlay: React.FC<{ k: number }> = ({ k }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: 72 * k, left: 56 * k, right: 56 * k }}>
      <div style={{ fontSize: 14 * k, fontWeight: 700, letterSpacing: 3 * k, color: AMBER, fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>
        BRIEFING KONSTITUSIONAL // FAKTA
      </div>
      <div style={{ marginTop: 10 * k, fontSize: 52 * k, fontWeight: 900, lineHeight: 1.08, color: "#F2F5F6", fontFamily: "'Inter', sans-serif" }}>
        WAPRES<br />MUNDUR
      </div>
    </div>
    <div style={{ position: "absolute", top: 72 * k, right: 56 * k, background: "rgba(10,12,16,0.86)", border: `1px solid ${AMBER}`, color: "#FFF", padding: `${8 * k}px ${16 * k}px`, borderRadius: 4 * k, fontSize: 12 * k, fontWeight: 800, letterSpacing: 2 * k, fontFamily: "'Inter', sans-serif" }}>
      5 FAKTA
    </div>
    <div style={{ position: "absolute", bottom: 100 * k, left: 56 * k, borderLeft: `4px solid ${AMBER}`, paddingLeft: 16 * k, maxWidth: 680 * k }}>
      <div style={{ fontSize: 20 * k, fontWeight: 600, lineHeight: 1.4, color: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
        12 NOV 2026 · GIBRAN MUNDUR
      </div>
      <div style={{ fontSize: 12 * k, letterSpacing: 2 * k, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginTop: 4 * k }}>
        @AudiraExplained
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  const k = width / 1080;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0.2, 1.6, 3.8], fov: 38, near: 0.05, far: 60 }}>
        <CoverScene />
      </ThreeCanvas>
      <CoverOverlay k={k} />
    </AbsoluteFill>
  );
};
