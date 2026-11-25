// EP20 cover (WATERCOLOR): "Celtic Lisbon Lions 1967"
// 11 watercolor figures in a verdant Scottish/Portuguese pastoral landscape.
// WATERCOLOR visual language: cold-press paper, translucent wash layers, pencil sketch contours.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { WATERCOLOR_PALETTE } from "../../kits/watercolor/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: LORA } = loadLora();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const CAM_POS: [number, number, number] = [0, 2.8, 7.5];
const CAM_TARGET: [number, number, number] = [0, 0.5, 0];
const CAM_FOV = 40;

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

// 11 Lisbon Lions — simplified watercolor figurines, standing in a proud line
// Each is a soft matte capsule with Celtic green & white hoops
const LionFigure: React.FC<{
  x: number;
  z: number;
  bodyColor: string;
  accentColor: string;
  skinTone: string;
  scale?: number;
}> = ({ x, z, bodyColor, accentColor, skinTone, scale = 1 }) => {
  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.92,
        metalness: 0,
        transparent: true,
        opacity: 0.88,
      }),
    [bodyColor]
  );
  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.9,
        metalness: 0,
        transparent: true,
        opacity: 0.85,
      }),
    [accentColor]
  );
  const skinMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: skinTone,
        roughness: 0.88,
        metalness: 0,
      }),
    [skinTone]
  );
  const h = scale;
  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      {/* Torso (jersey) */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.42, 6, 14]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Jersey hoop stripe */}
      <mesh position={[0, 0.68, 0]}>
        <torusGeometry args={[0.165, 0.045, 6, 20]} />
        <primitive object={accentMat} />
      </mesh>
      {/* Shorts */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.14, 4, 10]} />
        <primitive object={accentMat} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.07, 0.03, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.24, 4, 10]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.07, 0.03, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.24, 4, 10]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.165, 16, 16]} />
        <primitive object={skinMat} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.26, 0.72, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.055, 0.28, 4, 10]} />
        <primitive object={bodyMat} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.26, 0.72, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.055, 0.28, 4, 10]} />
        <primitive object={bodyMat} />
      </mesh>
    </group>
  );
};

// 11 players — alternating Celtic green/white hoop jerseys
// Arranged in a proud formation line, slightly curved
const ElevenLions: React.FC = () => {
  const positions: [number, number][] = [
    [-2.4, 0.3],
    [-1.8, -0.1],
    [-1.2, 0.2],
    [-0.6, -0.15],
    [0, 0.25],
    [0.6, -0.1],
    [1.2, 0.2],
    [1.8, -0.05],
    [2.4, 0.3],
    [-1.5, 1.1],
    [1.5, 1.1],
  ];
  const skins = ["#C68642", "#D4956A", "#B87A52", "#C68642", "#D4956A", "#B87A52", "#C68642", "#D4956A", "#C68642", "#B87A52", "#C68642"];
  return (
    <group>
      {positions.map(([x, z], i) => (
        <LionFigure
          key={i}
          x={x}
          z={z}
          bodyColor={i % 2 === 0 ? "#1a5c2a" : "#F5F5F0"}
          accentColor={i % 2 === 0 ? "#F5F5F0" : "#1a5c2a"}
          skinTone={skins[i]}
          scale={0.9 + (i === 4 ? 0.1 : 0)}
        />
      ))}
    </group>
  );
};

// Watercolor landscape environment
const Landscape: React.FC = () => {
  const paperMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WATERCOLOR_PALETTE.paperCanvas,
        roughness: 0.97,
        metalness: 0,
      }),
    []
  );
  const skyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WATERCOLOR_PALETTE.washCobaltBlue,
        transparent: true,
        opacity: 0.75,
        roughness: 0.95,
      }),
    []
  );
  const hillMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WATERCOLOR_PALETTE.washSageGreen,
        transparent: true,
        opacity: 0.84,
        roughness: 0.93,
      }),
    []
  );
  const hillFgMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WATERCOLOR_PALETTE.washPineGreen,
        transparent: true,
        opacity: 0.82,
        roughness: 0.9,
      }),
    []
  );
  const groundMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a6b35",
        roughness: 0.95,
        metalness: 0,
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  return (
    <group>
      {/* Paper backdrop */}
      <mesh position={[0, 3.0, -4.5]}>
        <planeGeometry args={[18, 15]} />
        <primitive object={paperMat} />
      </mesh>

      {/* Sky wash — distant cobalt mountains */}
      <mesh position={[0, 3.8, -3.5]}>
        <coneGeometry args={[5.0, 4.0, 5]} />
        <primitive object={skyMat} />
      </mesh>
      <mesh position={[-3.8, 3.2, -3.8]}>
        <coneGeometry args={[3.5, 3.0, 5]} />
        <primitive object={skyMat} />
      </mesh>
      <mesh position={[3.8, 3.4, -3.8]}>
        <coneGeometry args={[3.2, 3.2, 5]} />
        <primitive object={skyMat} />
      </mesh>

      {/* Middle ground hills — sage green */}
      <mesh position={[-2.5, 1.0, -2.0]}>
        <sphereGeometry args={[2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <primitive object={hillMat} />
      </mesh>
      <mesh position={[2.8, 0.9, -2.2]}>
        <sphereGeometry args={[2.0, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <primitive object={hillMat} />
      </mesh>

      {/* Ground plane — turf green */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <primitive object={groundMat} />
      </mesh>

      {/* Oak trees flanking the formation */}
      {[[-3.6, -0.8], [3.6, -0.8], [-4.5, 0.6], [4.5, 0.6]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.09, 0.14, 1.1, 8]} />
            <primitive object={useMemo(() => new THREE.MeshStandardMaterial({ color: WATERCOLOR_PALETTE.washEarthUmber, roughness: 0.9 }), [])} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.68, 14, 14]} />
            <primitive object={hillFgMat} />
          </mesh>
          <mesh position={[0.2, 1.6, 0.1]}>
            <sphereGeometry args={[0.48, 12, 12]} />
            <primitive object={hillMat} />
          </mesh>
        </group>
      ))}

      {/* AUDIRA on turf, painted like a club ground logo */}
      <AudiraTurf />
    </group>
  );
};

const AudiraTurf: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 512, 128);
    g.font = "bold 70px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,255,240,0.52)";
    g.fillText("AUDIRA", 256, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, 0.012, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.4, 0.6]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[WATERCOLOR_PALETTE.paperCanvas]} />
    <ambientLight intensity={0.75} color={WATERCOLOR_PALETTE.ambientSoft} />
    <directionalLight
      position={[3.5, 7.0, 5.5]}
      intensity={1.9}
      color={WATERCOLOR_PALETTE.sunlightMorning}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-6}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0003}
    />
    {/* Soft fill from opposite side */}
    <directionalLight position={[-3, 4, 3]} intensity={0.5} color="#E0F0D8" />
    <Landscape />
    <ElevenLions />
    <Finish
      frame={0}
      background={WATERCOLOR_PALETTE.paperCanvas}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.86}
      envIntensity={0.3}
      ao
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Soft paper vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,rgba(60,55,51,0.86) 0%,rgba(60,55,51,0.62) 20%,rgba(60,55,51,0) 40%,rgba(60,55,51,0) 78%,rgba(60,55,51,0.52) 100%)",
      }}
    />
    {/* Pencil sketch border lines */}
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <rect x={40} y={170} width={1000} height={4} fill="rgba(60,55,51,0.28)" rx={2} />
      <rect x={40} y={178} width={1000} height={1.5} fill="rgba(60,55,51,0.14)" rx={1} />
    </svg>
    {/* Episode kicker */}
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 194,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: 2.5,
      }}
    >
      <span style={{ color: "#F5F5F0", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
        SEJARAH SEPAK BOLA · #20
      </span>
      <span
        style={{
          color: "#1a5c2a",
          background: "#F5F5F0",
          padding: "4px 10px",
          borderRadius: 6,
        }}
      >
        AUDIRA
      </span>
    </div>

    {/* Main title */}
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
          fontFamily: LORA,
          fontWeight: 700,
          fontSize: 128,
          color: "#F5F5F0",
          lineHeight: 0.88,
          letterSpacing: -2,
          textShadow: "0 5px 22px rgba(0,0,0,0.65)",
        }}
      >
        CELTIC
      </div>
      <div
        style={{
          fontFamily: LORA,
          fontWeight: 700,
          fontStyle: "italic",
          fontSize: 62,
          color: "#E8F5E0",
          lineHeight: 1.05,
          textShadow: "0 4px 18px rgba(0,0,0,0.55)",
          marginTop: 6,
        }}
      >
        Lisbon Lions 1967
      </div>
      <div
        style={{
          marginTop: 18,
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 28,
          color: "#1a5c2a",
          background: "#F5F5F0",
          padding: "5px 18px 7px",
          letterSpacing: 1.5,
        }}
      >
        JUARA EROPA PERTAMA BRITAIN
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: LORA,
          fontStyle: "italic",
          fontSize: 36,
          color: "rgba(245,245,240,0.80)",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        11 pemain, dalam 30 mil dari Glasgow
      </div>
    </div>

    {/* Bottom facts */}
    <div
      style={{
        position: "absolute",
        bottom: 400,
        left: 56,
        right: 56,
        borderTop: "1.5px solid rgba(245,245,240,0.35)",
        paddingTop: 14,
        display: "flex",
        gap: 24,
      }}
    >
      {[
        ["2–1", "vs INTER MILAN"],
        ["1967", "LISBON · ESTÁDIO"],
        ["JOCK STEIN", "MANAJER"],
      ].map(([val, label]) => (
        <div key={label} style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: LORA,
              fontWeight: 700,
              fontSize: 36,
              color: "#F0FFF0",
              lineHeight: 1,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {val}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 18,
              color: "rgba(245,245,240,0.55)",
              letterSpacing: 1.5,
              marginTop: 3,
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
    <AbsoluteFill style={{ background: WATERCOLOR_PALETTE.paperCanvas }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 60 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
