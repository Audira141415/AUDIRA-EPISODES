// EP19 cover (VINTAGEFORGE): "Santos FC Kerajaan Raja Pelé"
// Vintage engraving style: rotating armillary/trophy globe in warm parchment atmosphere.
// VINTAGEFORGE visual language: aged gold, engraving brown, terracotta, parchment sepia.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { VINTAGE_PALETTE } from "../../kits/vintageforge/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: PLAYFAIR } = loadPlayfair();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const W = 1080;
const H = 1920;

const CAM_POS: [number, number, number] = [0, 2.2, 5.5];
const CAM_TARGET: [number, number, number] = [0, 0.4, 0];
const CAM_FOV = 36;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...CAM_POS);
    cam.lookAt(...CAM_TARGET);
    cam.fov = CAM_FOV;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// Vintage trophy globe — a golden armillary sphere representing Pelé's era
const TrophyGlobe: React.FC = () => {
  const goldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VINTAGE_PALETTE.agedGold,
        metalness: 0.75,
        roughness: 0.3,
      }),
    []
  );
  const brownMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VINTAGE_PALETTE.engravingBrown,
        metalness: 0.5,
        roughness: 0.5,
      }),
    []
  );
  const terraMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VINTAGE_PALETTE.terracottaWash,
        metalness: 0.1,
        roughness: 0.75,
      }),
    []
  );
  const verdiMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VINTAGE_PALETTE.verdigrisGreen,
        metalness: 0.3,
        roughness: 0.65,
      }),
    []
  );

  return (
    <group position={[0, 0.5, 0]}>
      {/* Outer armillary ring — equator */}
      <mesh rotation={[0, 0.4, 0]}>
        <torusGeometry args={[1.65, 0.07, 16, 72]} />
        <primitive object={goldMat} />
      </mesh>
      {/* Meridian ring */}
      <mesh rotation={[Math.PI / 2, 0.2, 0]}>
        <torusGeometry args={[1.65, 0.055, 16, 72]} />
        <primitive object={brownMat} />
      </mesh>
      {/* Tilted ecliptic ring */}
      <mesh rotation={[0.42, 0.6, 0.15]}>
        <torusGeometry args={[1.5, 0.045, 12, 64]} />
        <primitive object={goldMat} />
      </mesh>
      {/* Inner rings */}
      <mesh rotation={[0, 0.9, 0.3]}>
        <torusGeometry args={[1.2, 0.038, 12, 56]} />
        <primitive object={verdiMat} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0.5, 0.1]}>
        <torusGeometry args={[1.1, 0.033, 12, 48]} />
        <primitive object={goldMat} />
      </mesh>
      {/* Central sphere (the globe/ball) */}
      <mesh>
        <sphereGeometry args={[0.68, 32, 32]} />
        <primitive object={terraMat} />
      </mesh>
      {/* Pole axis rods */}
      <mesh position={[0, 1.68, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 10]} />
        <primitive object={goldMat} />
      </mesh>
      <mesh position={[0, -1.68, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 10]} />
        <primitive object={goldMat} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, -2.08, 0]}>
        <cylinderGeometry args={[0.6, 0.85, 0.5, 20]} />
        <primitive object={brownMat} />
      </mesh>
      <mesh position={[0, -2.42, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.18, 20]} />
        <primitive object={goldMat} />
      </mesh>

      {/* Star detail on pedestal face — Santos FC star motif */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.42, -2.08, Math.sin(a) * 0.42]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <primitive object={goldMat} />
          </mesh>
        );
      })}
    </group>
  );
};

// Parchment backdrop — rolled manuscript behind the trophy
const ParchmentBackdrop: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1536;
    const g = c.getContext("2d")!;
    // Parchment gradient
    const grad = g.createLinearGradient(0, 0, 1024, 1536);
    grad.addColorStop(0, "#F3EAD6");
    grad.addColorStop(0.5, "#EDE0C4");
    grad.addColorStop(1, "#E5D5AE");
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 1536);
    // Engraving line pattern
    g.strokeStyle = "rgba(59,40,24,0.08)";
    g.lineWidth = 1;
    for (let y = 0; y < 1536; y += 28) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1024, y);
      g.stroke();
    }
    // AUDIRA watermark
    g.font = "bold 110px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(59,40,24,0.09)";
    g.save();
    g.translate(512, 760);
    g.rotate(-0.08);
    g.fillText("AUDIRA", 0, 0);
    g.restore();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.0, -2.6]}>
      <planeGeometry args={[9, 13.5]} />
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
  );
};

// Floor — worn wooden stage
const WoodFloor: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: VINTAGE_PALETTE.engravingBrown,
        roughness: 0.88,
        metalness: 0.0,
      }),
    []
  );
  return (
    <mesh position={[0, -1.46, 0]} receiveShadow>
      <boxGeometry args={[14, 0.12, 14]} />
      <primitive object={mat} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[VINTAGE_PALETTE.parchmentSepia]} />
    <ambientLight intensity={1.1} color="#F5EED6" />
    <directionalLight
      position={[4, 9, 7]}
      intensity={2.0}
      color="#FFF6E0"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-7}
      shadow-camera-right={7}
      shadow-camera-top={8}
      shadow-camera-bottom={-6}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0003}
    />
    {/* Warm backlight from terracotta side */}
    <directionalLight position={[-4, 5, -6]} intensity={0.65} color="#D4875C" />
    <ParchmentBackdrop />
    <WoodFloor />
    <TrophyGlobe />
    <Finish
      frame={0}
      background={VINTAGE_PALETTE.parchmentSepia}
      profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM}
      exposure={0.84}
      envIntensity={0.28}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Warm vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,rgba(59,40,24,0.88) 0%,rgba(59,40,24,0.65) 20%,rgba(59,40,24,0) 40%,rgba(59,40,24,0) 80%,rgba(59,40,24,0.55) 100%)",
      }}
    />
    {/* Engraving border lines top */}
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 180,
        borderTop: "2px solid rgba(197,160,89,0.6)",
        borderBottom: "1px solid rgba(197,160,89,0.3)",
        height: 8,
      }}
    />
    {/* Episode kicker */}
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 200,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: 3,
        color: VINTAGE_PALETTE.agedGold,
      }}
    >
      <span>SEJARAH SEPAK BOLA · #19</span>
      <span style={{ color: VINTAGE_PALETTE.parchmentSepia }}>AUDIRA</span>
    </div>

    {/* Main title block */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 258,
        right: 56,
      }}
    >
      <div
        style={{
          fontFamily: PLAYFAIR,
          fontWeight: 700,
          fontSize: 112,
          color: VINTAGE_PALETTE.parchmentSepia,
          lineHeight: 0.9,
          letterSpacing: -1,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        SANTOS
      </div>
      <div
        style={{
          fontFamily: PLAYFAIR,
          fontWeight: 700,
          fontSize: 112,
          color: VINTAGE_PALETTE.agedGold,
          lineHeight: 0.9,
          letterSpacing: -1,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        FC
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: PLAYFAIR,
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: 50,
          color: VINTAGE_PALETTE.parchmentSepia,
          opacity: 0.88,
          letterSpacing: 1,
        }}
      >
        Kerajaan Raja Pelé
      </div>
      <div
        style={{
          marginTop: 16,
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          color: VINTAGE_PALETTE.engravingBrown,
          background: VINTAGE_PALETTE.agedGold,
          padding: "4px 18px 7px",
          letterSpacing: 2,
        }}
      >
        500+ GOL · 1956–1974
      </div>
    </div>

    {/* Stats bottom bar */}
    <div
      style={{
        position: "absolute",
        bottom: 400,
        left: 56,
        right: 56,
        borderTop: `1px solid rgba(197,160,89,0.4)`,
        paddingTop: 14,
        display: "flex",
        gap: 24,
      }}
    >
      {[
        ["2×", "LIBERTADORES"],
        ["2×", "INTERCONTINENTAL"],
        ["11", "PEMAIN LEGENDA"],
      ].map(([val, label]) => (
        <div key={label} style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: PLAYFAIR,
              fontWeight: 700,
              fontSize: 40,
              color: VINTAGE_PALETTE.agedGold,
              lineHeight: 1,
            }}
          >
            {val}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 18,
              color: "rgba(243,234,214,0.6)",
              letterSpacing: 2,
              marginTop: 2,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: VINTAGE_PALETTE.parchmentSepia }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 60 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
