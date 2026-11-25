// EP18 cover (URBANFORGE): "Boca Juniors, La Bombonera & Maradona"
// Dark obsidian city model of La Bombonera stadium district with cyan/amber neon data projections.
// URBANFORGE visual language: matte plaster buildings on obsidian plinth, projected light layers.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { URBAN_PALETTE } from "../../kits/urbanforge/lib/palette";
import {
  createPlasterModelMaterial,
  createObsidianPlinthMaterial,
  createProjectedDataMaterial,
} from "../../kits/urbanforge/lib/materials";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: OSWALD } = loadOswald();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const W = 1080;
const H = 1920;

// Camera: elevated isometric over the stadium bowl
const CAM_POS: [number, number, number] = [5, 9, 9];
const CAM_TARGET: [number, number, number] = [0, 0, 0];
const CAM_FOV = 38;

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

// Simplified stadium bowl — La Bombonera U-shape, vertically stacked tiers
const StadiumBowl: React.FC = () => {
  const plaster = useMemo(() => createPlasterModelMaterial(URBAN_PALETTE.modelWhite), []);
  const cyan = useMemo(() => createProjectedDataMaterial(URBAN_PALETTE.projectedCyan, 1.6), []);
  const amber = useMemo(() => createProjectedDataMaterial(URBAN_PALETTE.projectedAmber, 1.8), []);

  // Three concentric rings representing tiers (La Bombonera's 3 tiers)
  const tiers = [
    { r: 2.4, h: 0.4, y: 0.2, mat: plaster },
    { r: 2.0, h: 0.4, y: 0.6, mat: plaster },
    { r: 1.6, h: 0.4, y: 1.0, mat: plaster },
  ];

  // Playing field
  const fieldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1a4a2e", roughness: 0.9 }),
    []
  );

  // Pitch markings (emissive white lines)
  const linesMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffffff" }),
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Obsidian base plinth */}
      <mesh position={[0, -0.7, 0]} material={useMemo(() => createObsidianPlinthMaterial(URBAN_PALETTE.obsidianPlinth), [])} receiveShadow>
        <boxGeometry args={[12, 1.4, 12]} />
      </mesh>

      {/* Playing field */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 1.8]} />
        <primitive object={fieldMat} />
      </mesh>

      {/* Centre circle line */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.42, 48]} />
        <primitive object={linesMat} />
      </mesh>

      {/* Centre spot */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 24]} />
        <primitive object={linesMat} />
      </mesh>

      {/* Stadium tiers — partial ring (U-shape, open on north side) */}
      {tiers.map((t, i) => (
        <mesh key={i} position={[0, t.y, 0]}>
          <cylinderGeometry args={[t.r, t.r, t.h, 64, 1, true, Math.PI * 0.15, Math.PI * 1.7]} />
          <primitive object={t.mat} />
        </mesh>
      ))}

      {/* Cyan data highlight on top tier roof edge */}
      <mesh position={[0, 1.22, 0]}>
        <torusGeometry args={[1.65, 0.025, 8, 64, Math.PI * 1.7]} />
        <primitive object={cyan} />
      </mesh>

      {/* Amber accent: La Bombonera corner towers */}
      {[[-2.1, 0, -1.0], [2.1, 0, -1.0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.3, 1.6, 0.3]} />
          <primitive object={i === 0 ? amber : cyan} />
        </mesh>
      ))}

      {/* Surrounding city blocks (neighbourhood) */}
      {[
        [-4.5, 0, -3.0, 1.2, 1.4, 1.2],
        [-4.5, 0, 0, 1.2, 1.8, 1.2],
        [4.5, 0, -3.0, 1.2, 1.3, 1.2],
        [4.5, 0, 0, 1.3, 1.6, 1.3],
        [-3.0, 0, 3.5, 1.4, 1.1, 1.0],
        [3.0, 0, 3.5, 1.4, 1.2, 1.0],
        [0, 0, 4.0, 1.5, 0.9, 1.0],
        [-4.5, 0, 3.5, 1.1, 1.0, 1.1],
        [4.5, 0, 3.5, 1.1, 1.1, 1.1],
      ].map(([x, _y, z, w, h, d], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <primitive object={plaster} />
        </mesh>
      ))}

      {/* AUDIRA on the turf */}
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
    g.font = "bold 72px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(0,240,255,0.55)";
    g.fillText("AUDIRA", 256, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.8, 0.45]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[URBAN_PALETTE.darkGallery]} />
    <fog attach="fog" args={[URBAN_PALETTE.darkGallery, 18, 36]} />
    <ambientLight intensity={0.18} color="#C8D4E8" />
    <hemisphereLight args={["#8AAAC8", "#0a0a10", 0.35]} />
    <directionalLight
      position={[-5, 12, 7]}
      intensity={2.4}
      color={URBAN_PALETTE.sunDaylight}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
      shadow-camera-near={1}
      shadow-camera-far={50}
      shadow-bias={-0.0003}
    />
    {/* Cyan rim: projected data ambience */}
    <directionalLight position={[6, 4, -8]} intensity={0.7} color={URBAN_PALETTE.projectedCyan} />
    <StadiumBowl />
    <Finish
      frame={0}
      background={URBAN_PALETTE.darkGallery}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={1.1}
      envIntensity={0.4}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Top vignette for legibility */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg,rgba(10,10,12,0.90) 0%,rgba(10,10,12,0.72) 20%,rgba(10,10,12,0) 42%,rgba(10,10,12,0) 78%,rgba(10,10,12,0.60) 100%)",
      }}
    />
    {/* Episode kicker */}
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
          borderRadius: 8,
          overflow: "hidden",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        <div style={{ background: "#00f0ff", color: "#0a0a0c", padding: "7px 14px" }}>
          SEJARAH SEPAK BOLA
        </div>
        <div style={{ background: "rgba(10,10,14,0.92)", color: "#ffb703", padding: "7px 14px" }}>
          #18
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: "#E8F4F8",
          border: "2px solid #00f0ff",
          borderRadius: 8,
          padding: "5px 11px",
        }}
      >
        BOCA · AUDIRA
      </div>
    </div>

    {/* Main title block */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 268,
        right: 56,
        lineHeight: 0.93,
        textShadow: "0 6px 24px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          fontFamily: OSWALD,
          fontWeight: 700,
          fontSize: 118,
          color: "#F5F5F2",
          letterSpacing: -1,
        }}
      >
        BOCA
      </div>
      <div
        style={{
          fontFamily: OSWALD,
          fontWeight: 700,
          fontSize: 118,
          color: "#00f0ff",
          letterSpacing: -1,
        }}
      >
        JUNIORS
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: OSWALD,
          fontWeight: 400,
          fontSize: 56,
          color: "#ffb703",
          letterSpacing: 3,
        }}
      >
        LA BOMBONERA
      </div>
      <div
        style={{
          marginTop: 10,
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 32,
          color: "#0a0a0c",
          background: "#ffb703",
          padding: "4px 16px 6px",
          letterSpacing: 2,
        }}
      >
        MARADONA 2× PULANG
      </div>
    </div>

    {/* Bottom data bar */}
    <div
      style={{
        position: "absolute",
        bottom: 400,
        left: 56,
        right: 56,
        borderTop: "1px solid rgba(0,240,255,0.35)",
        paddingTop: 12,
        display: "flex",
        gap: 32,
      }}
    >
      {[
        ["49.000", "KAPASITAS"],
        ["1940", "DIBUKA"],
        ["LA BOCA", "BUENOS AIRES"],
      ].map(([val, label]) => (
        <div key={label} style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: OSWALD,
              fontSize: 36,
              fontWeight: 600,
              color: "#00f0ff",
              lineHeight: 1,
            }}
          >
            {val}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              color: "rgba(245,245,242,0.55)",
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
    <AbsoluteFill style={{ background: URBAN_PALETTE.darkGallery }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 80 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
