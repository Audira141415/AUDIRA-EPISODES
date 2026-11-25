// EP22 cover (FELTCRAFT): "Dongeng Leicester City 2016" — 5000-1 odds, Vardy non-league
// to PL top scorer, Ranieri, cheapest squad won PL. Felt diorama: sun rising over green hills,
// yarn-wrapped Premier League trophy in center foreground in Leicester blue and gold.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { FELTCRAFT_PALETTE as P } from "../../kits/feltcraft/lib/palette.ts";
import { feltMaterial } from "../../kits/feltcraft/lib/materials.ts";
import { FeltLandscape3D } from "../../kits/feltcraft/scene/FeltLandscape3D.tsx";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const LEICESTER_BLUE = "#1C3FA1";
const LEICESTER_GOLD = "#D4AE2A";
const LEICESTER_WHITE = "#F5F0E8";

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(-0.9, 2.4, 8.2);
    c.lookAt(-0.4, 1.2, 0);
    c.fov = 42;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const FeltTrophy: React.FC = () => {
  const goldMat = useMemo(() => feltMaterial(LEICESTER_GOLD, 1.5), []);
  const blueMat = useMemo(() => feltMaterial(LEICESTER_BLUE, 2), []);
  const whiteMat = useMemo(() => feltMaterial(LEICESTER_WHITE, 1), []);
  return (
    <group position={[0.6, 0.0, 2.2]} rotation={[0, 0.2, 0]}>
      {/* base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow material={goldMat}>
        <cylinderGeometry args={[0.52, 0.56, 0.16, 32]} />
      </mesh>
      {/* plinth */}
      <mesh position={[0, 0.26, 0]} castShadow material={blueMat}>
        <cylinderGeometry args={[0.38, 0.5, 0.2, 32]} />
      </mesh>
      {/* stem */}
      <mesh position={[0, 0.75, 0]} castShadow material={goldMat}>
        <cylinderGeometry args={[0.15, 0.17, 1.0, 20]} />
      </mesh>
      {/* cup bowl */}
      <mesh position={[0, 1.44, 0]} castShadow material={goldMat}>
        <cylinderGeometry args={[0.65, 0.2, 0.75, 32]} />
      </mesh>
      {/* cup rim */}
      <mesh position={[0, 1.84, 0]} castShadow material={goldMat}>
        <torusGeometry args={[0.65, 0.07, 10, 32]} />
      </mesh>
      {/* blue stitched band */}
      <mesh position={[0, 1.3, 0]} castShadow material={blueMat}>
        <torusGeometry args={[0.21, 0.065, 8, 20]} />
      </mesh>
      {/* left handle */}
      <group position={[-0.68, 1.5, 0]} rotation={[0, 0, -0.3]}>
        <mesh castShadow material={goldMat}>
          <torusGeometry args={[0.28, 0.065, 8, 16, Math.PI]} />
        </mesh>
      </group>
      {/* right handle */}
      <group position={[0.68, 1.5, 0]} rotation={[0, 0, 0.3]}>
        <mesh castShadow material={goldMat} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[0.28, 0.065, 8, 16, Math.PI]} />
        </mesh>
      </group>
      {/* LCFC tag at base */}
      <mesh position={[0, 0.15, 0.56]} material={whiteMat}>
        <boxGeometry args={[0.46, 0.22, 0.04]} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ t: number }> = ({ t }) => (
  <>
    <CameraRig />
    <color attach="background" args={[P.skyFelt]} />
    <ambientLight color="#FFE8C8" intensity={0.6} />
    <hemisphereLight args={[P.skyFill, P.groundBounce, 0.8]} />
    <directionalLight
      position={[3.5, 5.5, 4.5]}
      intensity={2.2}
      color={P.keyWarm}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-7}
      shadow-camera-right={7}
      shadow-camera-top={6}
      shadow-camera-bottom={-4}
      shadow-bias={-0.0005}
    />
    <directionalLight position={[-3, 2, -4]} intensity={0.5} color="#A8D8FF" />
    <FeltLandscape3D t={t} />
    <FeltTrophy />
    <Finish frame={0} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={1.0} envIntensity={0.5} ao />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,18,45,0.88) 0%, rgba(8,18,45,0.55) 22%, rgba(8,18,45,0) 42%, rgba(8,18,45,0) 68%, rgba(8,18,45,0.78) 100%)" }} />
    {/* episode badge */}
    <div style={{ position: "absolute", left: 60, top: 196, display: "flex", alignItems: "stretch", borderRadius: 8, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>
      <div style={{ background: LEICESTER_BLUE, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
      <div style={{ background: "rgba(10,10,15,0.95)", color: LEICESTER_GOLD, padding: "8px 16px" }}>#22</div>
    </div>
    <div style={{ position: "absolute", right: 60, top: 204, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: LEICESTER_WHITE, border: `2px solid ${LEICESTER_BLUE}`, borderRadius: 6, padding: "5px 12px", letterSpacing: 2 }}>
      AUDIRA
    </div>
    {/* main title */}
    <div style={{ position: "absolute", left: 56, top: 275, lineHeight: 0.92, textShadow: "0 8px 30px rgba(0,0,0,0.70)" }}>
      <div style={{ fontFamily: ANTON, fontSize: 130, color: LEICESTER_WHITE, letterSpacing: 1 }}>DONGENG</div>
      <div style={{ fontFamily: ANTON, fontSize: 130, color: LEICESTER_GOLD, letterSpacing: 1 }}>LEICESTER</div>
      <div style={{ marginTop: 14, display: "inline-block", fontFamily: MARKER, fontSize: 52, color: "#0a1830", background: LEICESTER_GOLD, padding: "2px 20px 6px", transform: "rotate(-1.5deg)" }}>2016</div>
    </div>
    {/* odds badge */}
    <div style={{ position: "absolute", right: 56, bottom: 420, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: LEICESTER_GOLD, lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>5000-1</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: LEICESTER_WHITE, letterSpacing: 3, marginTop: 4 }}>PELUANG JUARA</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, color: "#7898D4", letterSpacing: 2 }}>PREMIER LEAGUE 2015/16</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = Math.max(0.5, (frame / fps) * 60 / 60);
  return (
    <AbsoluteFill style={{ background: P.skyFelt }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [-0.9, 2.4, 8.2], fov: 42, near: 0.05, far: 60 }}>
        <Scene t={t} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
