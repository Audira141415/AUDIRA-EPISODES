// EP23 cover (PRECISION): "Invincibles Arsenal 2004" — 49-game unbeaten run, only team to
// win PL unbeaten, Wenger, Guinness World Records, gold trophy replica. Precision studio:
// titanium-gold PL trophy with Arsenal red accent band, cyclorama stage.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { PRECISION_PALETTE as P } from "../../kits/precision/lib/palette.ts";
import { StudioStage } from "../../kits/precision/world/StudioStage.tsx";
import { createAnodizedAluminiumMaterial, createTitaniumMaterial } from "../../kits/precision/lib/materials.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const ARSENAL_RED = "#CC0000";
const ARSENAL_GOLD = "#B8862A";

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(0, 1.6, 5.2);
    c.lookAt(0, 1.8, 0);
    c.fov = 32;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const PLTrophy: React.FC = () => {
  const titanMat = useMemo(() => createTitaniumMaterial(), []);
  const anoMat = useMemo(() => createAnodizedAluminiumMaterial(ARSENAL_GOLD), []);
  const redMat = useMemo(() => new THREE.MeshStandardMaterial({ color: ARSENAL_RED, roughness: 0.35, metalness: 0.6 }), []);
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: P.spaceGray, roughness: 0.28, metalness: 0.88 }), []);
  return (
    <group position={[0, -3.0, 0]}>
      {/* base plate */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow material={baseMat}>
        <boxGeometry args={[2.0, 0.2, 1.0]} />
      </mesh>
      {/* plinth */}
      <mesh position={[0, 0.42, 0]} castShadow material={baseMat}>
        <cylinderGeometry args={[0.68, 0.76, 0.46, 32]} />
      </mesh>
      {/* lower stem */}
      <mesh position={[0, 0.95, 0]} castShadow material={titanMat}>
        <cylinderGeometry args={[0.16, 0.22, 0.6, 24]} />
      </mesh>
      {/* Arsenal band */}
      <mesh position={[0, 1.26, 0]} castShadow material={redMat}>
        <cylinderGeometry args={[0.185, 0.185, 0.14, 24]} />
      </mesh>
      {/* upper stem */}
      <mesh position={[0, 1.68, 0]} castShadow material={titanMat}>
        <cylinderGeometry args={[0.14, 0.17, 0.72, 24]} />
      </mesh>
      {/* cup bowl */}
      <mesh position={[0, 2.26, 0]} castShadow material={anoMat}>
        <cylinderGeometry args={[0.80, 0.18, 0.88, 36]} />
      </mesh>
      {/* cup rim ring */}
      <mesh position={[0, 2.72, 0]} castShadow material={anoMat}>
        <torusGeometry args={[0.80, 0.09, 12, 36]} />
      </mesh>
      {/* Arsenal red accent ring on cup */}
      <mesh position={[0, 2.3, 0]} castShadow material={redMat}>
        <cylinderGeometry args={[0.21, 0.21, 0.08, 20]} />
      </mesh>
      {/* left handle */}
      <group position={[-0.84, 2.42, 0]} rotation={[0, 0, -0.25]}>
        <mesh castShadow material={titanMat}>
          <torusGeometry args={[0.35, 0.07, 10, 20, Math.PI]} />
        </mesh>
      </group>
      {/* right handle */}
      <group position={[0.84, 2.42, 0]} rotation={[0, 0, 0.25]}>
        <mesh castShadow material={titanMat} rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[0.35, 0.07, 10, 20, Math.PI]} />
        </mesh>
      </group>
      {/* red crest cap on top */}
      <mesh position={[0, 2.84, 0]} castShadow material={redMat}>
        <sphereGeometry args={[0.14, 20, 16]} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig />
    <color attach="background" args={[P.cycloramaFloor]} />
    <StudioStage />
    {/* Arsenal red accent glow */}
    <pointLight position={[0, 2, 2]} color={ARSENAL_RED} intensity={2.5} distance={8} />
    {/* cold blue kicker */}
    <pointLight position={[-5, 3, -4]} color="#C8E8FF" intensity={2.0} distance={16} />
    {/* gold warm accent */}
    <pointLight position={[4, 1, 3]} color="#FFE0A0" intensity={1.2} distance={10} />
    <PLTrophy />
    <Finish frame={Math.round(f)} profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN} exposure={1.1} envIntensity={0.8} ao focus={5} aperture={0.002} maxBlur={0.005} />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.70) 20%, rgba(5,5,8,0) 38%, rgba(5,5,8,0) 68%, rgba(5,5,8,0.80) 100%)" }} />
    {/* episode badge */}
    <div style={{ position: "absolute", left: 60, top: 196, display: "flex", alignItems: "stretch", borderRadius: 8, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>
      <div style={{ background: ARSENAL_RED, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
      <div style={{ background: "rgba(5,5,8,0.97)", color: ARSENAL_GOLD, padding: "8px 16px" }}>#23</div>
    </div>
    <div style={{ position: "absolute", right: 60, top: 204, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.ceramicGloss, border: `2px solid ${ARSENAL_RED}`, borderRadius: 6, padding: "5px 12px", letterSpacing: 2 }}>
      AUDIRA
    </div>
    {/* main title */}
    <div style={{ position: "absolute", left: 56, top: 275, lineHeight: 0.92, textShadow: "0 8px 30px rgba(0,0,0,0.80)" }}>
      <div style={{ fontFamily: ANTON, fontSize: 136, color: P.ceramicGloss, letterSpacing: 2 }}>INVINCIBLES</div>
      <div style={{ fontFamily: ANTON, fontSize: 136, color: ARSENAL_RED, letterSpacing: 2 }}>ARSENAL</div>
      <div style={{ marginTop: 14, display: "inline-block", fontFamily: MARKER, fontSize: 52, color: "#0a0003", background: ARSENAL_GOLD, padding: "2px 20px 6px", transform: "rotate(-1.3deg)" }}>2003/04</div>
    </div>
    {/* 49 unbeaten badge */}
    <div style={{ position: "absolute", right: 56, bottom: 420, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 108, color: P.ceramicGloss, lineHeight: 1, textShadow: "0 4px 24px rgba(204,0,0,0.6)" }}>49</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: ARSENAL_RED, letterSpacing: 3, marginTop: 2 }}>PERTANDINGAN TANPA KALAH</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: P.anodizedSilver, letterSpacing: 2 }}>PREMIER LEAGUE RECORD</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: P.cycloramaFloor }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: [0, 1.6, 5.2], fov: 32, near: 0.1, far: 60 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
