// EP40 cover (VINTAGEFORGE): "River Plate, La Máquina & Di Stéfano".
// Vintage antique aesthetic: armillary / astrolabe mechanism as trophy analogue.
// Parchment background, engraving-gold tones. River Plate red-and-white sash colour accent.
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { AstrolabeMechanism } from "../../kits/vintageforge/world/ObjectStage";
import { VINTAGE_PALETTE } from "../../kits/vintageforge/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const RP_RED = "#CC0000";
const W = 1080;
const H = 1920;

const CAM_POS: [number, number, number] = [0.6, 2.4, 5.0];
const CAM_TARGET: [number, number, number] = [0, 0.2, 0];
const CAM_FOV = 36;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...CAM_POS);
    c.lookAt(...CAM_TARGET);
    c.fov = CAM_FOV;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// Engraved plaque base beneath the astrolabe
const PlaquePedestal: React.FC = () => (
  <group position={[0, -1.6, 0]}>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[1.1, 1.3, 0.22, 36]} />
      <meshStandardMaterial color={VINTAGE_PALETTE.agedGold} metalness={0.7} roughness={0.4} />
    </mesh>
    <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.3, 1.3, 0.14, 36]} />
      <meshStandardMaterial color={VINTAGE_PALETTE.engravingBrown} metalness={0.3} roughness={0.7} />
    </mesh>
    {/* River Plate sash stripe on the pedestal face */}
    <mesh position={[0, 0.02, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.8, 0.14]} />
      <meshBasicMaterial color={RP_RED} toneMapped={false} />
    </mesh>
  </group>
);

// Parchment ground plane
const GroundPlane: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} receiveShadow>
    <planeGeometry args={[12, 12]} />
    <meshStandardMaterial color={VINTAGE_PALETTE.parchmentSepia} roughness={0.95} metalness={0.0} />
  </mesh>
);

const Scene: React.FC<{ f: number; frame: number }> = ({ f, frame }) => (
  <>
    <CameraRig />
    <color attach="background" args={[VINTAGE_PALETTE.parchmentSepia]} />

    <ambientLight intensity={1.1} color={VINTAGE_PALETTE.parchmentSepia} />
    <directionalLight
      position={[4, 9, 6]}
      intensity={2.0}
      color="#FFF6E8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={1}
      shadow-camera-far={30}
      shadow-camera-left={-5}
      shadow-camera-right={5}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0003}
    />
    <directionalLight position={[-5, 4, 2]} intensity={0.5} color={VINTAGE_PALETTE.agedGold} />

    <GroundPlane />
    <PlaquePedestal />
    <AstrolabeMechanism f={f} />

    <Finish
      frame={frame}
      background={VINTAGE_PALETTE.parchmentSepia}
      profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM}
      exposure={0.84}
      envIntensity={0.2}
      ao
      focus={5.0}
      aperture={0.003}
      maxBlur={0.008}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* warm sepia vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(59,40,24,0.82) 0%, rgba(59,40,24,0.55) 22%, rgba(59,40,24,0) 44%, rgba(59,40,24,0) 70%, rgba(59,40,24,0.75) 100%)",
      }}
    />
    {/* episode badge */}
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 196,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: 10,
          overflow: "hidden",
          fontFamily: MONO,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: 2,
        }}
      >
        <div style={{ background: RP_RED, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(30,27,24,0.92)", color: VINTAGE_PALETTE.agedGold, padding: "8px 16px" }}>#40</div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: VINTAGE_PALETTE.parchmentSepia,
          border: `2px solid ${RP_RED}`,
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        RIVER PLATE · AUDIRA
      </div>
    </div>

    {/* main title */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 290,
        lineHeight: 0.92,
        textShadow: "0 6px 24px rgba(30,20,10,0.75)",
      }}
    >
      <div style={{ fontFamily: ANTON, fontSize: 136, color: "#FBF5E8", letterSpacing: 1 }}>LA</div>
      <div style={{ fontFamily: ANTON, fontSize: 136, color: RP_RED, letterSpacing: 1 }}>MÁQUINA</div>
      {/* sub-label sticker */}
      <div
        style={{
          marginTop: 20,
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          color: VINTAGE_PALETTE.parchmentSepia,
          background: VINTAGE_PALETTE.engravingBrown,
          padding: "4px 18px 7px",
          borderRadius: 6,
          letterSpacing: 1,
        }}
      >
        Di Stéfano · 1947 · Pencetak Terbanyak
      </div>
    </div>

    {/* bottom copy: stat facts */}
    <div
      style={{
        position: "absolute",
        bottom: 400,
        left: 56,
        right: 56,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 22,
          color: "rgba(243,234,214,0.78)",
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        River Plate · Argentina
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 20,
          color: VINTAGE_PALETTE.agedGold,
          letterSpacing: 2,
          opacity: 0.9,
        }}
      >
        4× Liga · Monumental · 1941–47
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: VINTAGE_PALETTE.parchmentSepia }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ fov: CAM_FOV, position: CAM_POS, near: 0.1, far: 80 }}
      >
        <Scene f={f} frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
