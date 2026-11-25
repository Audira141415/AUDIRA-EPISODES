// EP34 — Drama Agüero 93:20 Man City — ARCADECRT style
// Arcade cabinet frozen at the winning moment: "AGUEROOOOO" on the CRT screen, 93:20 on the clock.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { ARCADE_PALETTE as P } from "../../kits/arcadecrt/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

type V3 = [number, number, number];
const CAM_POS: V3 = [-0.4, 1.6, 4.8];
const CAM_TARGET: V3 = [0.1, 0.9, 0.0];
const FOV = 38;

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...CAM_POS);
    c.lookAt(...CAM_TARGET);
    c.fov = FOV;
    c.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// CRT screen canvas: pixel game showing Agüero goal moment
const useCrtScreen = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const g = c.getContext("2d")!;

    // Background: dark game sky
    g.fillStyle = "#120A33";
    g.fillRect(0, 0, 512, 512);

    // Scanline overlay
    for (let y = 0; y < 512; y += 4) {
      g.fillStyle = "rgba(0,0,0,0.28)";
      g.fillRect(0, y, 512, 2);
    }

    // Top score bar
    g.fillStyle = "#2EF2FF";
    g.fillRect(0, 0, 512, 48);
    g.fillStyle = "#120A33";
    g.font = "bold 28px monospace";
    g.textAlign = "left";
    g.fillText("MAN CITY  3", 12, 34);
    g.textAlign = "right";
    g.fillText("QPR  2", 500, 34);

    // Time clock — FROZEN at 93:20
    g.fillStyle = "#FF2E88";
    g.fillRect(192, 0, 128, 48);
    g.fillStyle = "#F4F1FF";
    g.font = "bold 30px monospace";
    g.textAlign = "center";
    g.fillText("93:20", 256, 34);

    // Pixel pitch (simple rectangles)
    g.fillStyle = "#1A5C2A";
    g.fillRect(40, 60, 432, 260);
    g.strokeStyle = "#2E8B4A";
    g.lineWidth = 2;
    // Centre circle
    g.beginPath();
    g.arc(256, 190, 50, 0, Math.PI * 2);
    g.stroke();
    // Centre line
    g.beginPath(); g.moveTo(40, 190); g.lineTo(472, 190); g.stroke();
    // Goals
    g.strokeRect(40, 155, 24, 70);
    g.strokeRect(448, 155, 24, 70);

    // Pixel player (Agüero silhouette, simplified)
    g.fillStyle = P.cyan;
    // body
    g.fillRect(246, 108, 20, 32);
    // head
    g.fillRect(248, 96, 16, 14);
    // legs kicking
    g.fillRect(240, 140, 10, 18);
    g.fillRect(256, 136, 10, 22);
    // celebration arm up
    g.fillRect(232, 108, 12, 8);
    g.fillRect(232, 100, 8, 10);

    // Ball trajectory arrow
    g.strokeStyle = P.yellow;
    g.lineWidth = 3;
    g.setLineDash([6, 4]);
    g.beginPath();
    g.moveTo(260, 128);
    g.quadraticCurveTo(360, 100, 452, 170);
    g.stroke();
    g.setLineDash([]);

    // Ball
    g.fillStyle = "#F4F1FF";
    g.beginPath();
    g.arc(452, 170, 8, 0, Math.PI * 2);
    g.fill();

    // AGUEROOOOO text — big, bold pixel style
    g.fillStyle = P.yellow;
    g.font = "bold 44px monospace";
    g.textAlign = "center";
    g.fillText("AGUEROOOOO", 256, 362);

    // Subtitle
    g.fillStyle = P.phosphorGreen;
    g.font = "bold 24px monospace";
    g.fillText("GOAL! CITY CHAMPIONS!", 256, 400);

    // AUDIRA brand (small, inside the game world)
    g.fillStyle = "rgba(46,242,255,0.5)";
    g.font = "bold 18px monospace";
    g.textAlign = "right";
    g.fillText("AUDIRA", 500, 490);

    // Screen glow edges
    const grad = g.createRadialGradient(256, 256, 180, 256, 256, 256);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,20,0.55)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

// Arcade cabinet body
const Cabinet: React.FC = () => {
  const screen = useCrtScreen();

  // Neon trim texture
  const neonTrim = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = P.magenta;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  return (
    <group position={[0.1, 0, 0]}>
      {/* Cabinet body */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[1.4, 2.0, 0.7]} radius={0.04} segments={3} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={P.cabinet} />
      </mesh>

      {/* Cabinet top (angled bezel housing) */}
      <mesh position={[0, 2.1, -0.05]} rotation={[0.22, 0, 0]} castShadow>
        <RoundedBoxGeo args={[1.38, 0.5, 0.65]} radius={0.03} segments={2} />
        <meshPhysicalMaterial color={P.cabinetEdge} roughness={0.4} />
      </mesh>

      {/* CRT screen (slightly inset, tilted) */}
      <mesh position={[0, 1.26, 0.355]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>

      {/* Bezel around screen */}
      <mesh position={[0, 1.26, 0.35]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[1.22, 1.22]} />
        <meshPhysicalMaterial color={P.bezel} roughness={0.6} />
      </mesh>

      {/* Control panel (joystick area) */}
      <mesh position={[0, 0.26, 0.26]} rotation={[-0.65, 0, 0]} castShadow>
        <boxGeometry args={[1.38, 0.55, 0.08]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={P.cabinetEdge} roughness={0.5} />
      </mesh>

      {/* Joystick */}
      <mesh position={[-0.25, 0.44, 0.44]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.12, 12]} />
        <meshPhysicalMaterial color="#888" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[-0.25, 0.51, 0.44]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshPhysicalMaterial color={P.magenta} roughness={0.3} />
      </mesh>

      {/* Buttons */}
      {([0.1, 0.22, 0.34] as number[]).map((bx, i) => (
        <mesh key={i} position={[bx, 0.44, 0.44]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.03, 16]} />
          <meshPhysicalMaterial
            color={[P.cyan, P.yellow, P.magenta][i]}
            roughness={0.2}
            clearcoat={0.8}
          />
        </mesh>
      ))}

      {/* Neon T-molding strips (left and right edges) */}
      {([-0.71, 0.71] as number[]).map((nx, i) => (
        <mesh key={i} position={[nx, 1.0, 0]} castShadow>
          <boxGeometry args={[0.04, 2.1, 0.74]} />
          <meshPhysicalMaterial
            color={i === 0 ? P.magenta : P.cyan}
            emissive={i === 0 ? P.magenta : P.cyan}
            emissiveIntensity={1.4}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Marquee header with game title */}
      <mesh position={[0, 2.38, 0.24]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[1.3, 0.28]} />
        <meshBasicMaterial color={P.magenta} />
      </mesh>
    </group>
  );
};

// Floor: dark cosmic carpet
const Floor: React.FC = () => {
  const carpetTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = P.carpet;
    g.fillRect(0, 0, 256, 256);
    // star-like noise
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      g.fillStyle = `rgba(100,80,255,${0.1 + Math.random() * 0.2})`;
      g.fillRect(x, y, 2, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[12, 8]} />
      <meshPhysicalMaterial map={carpetTex} roughness={0.9} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[P.room]} />
    <fog attach="fog" args={[P.room, 8, 18]} />
    <ambientLight intensity={0.08} color="#6A5FBF" />

    {/* Key spotlight from above — illuminates cabinet top */}
    <spotLight
      position={[0.5, 5.5, 3.0]}
      angle={0.4}
      penumbra={0.75}
      intensity={12}
      color="#C0AAFF"
      distance={10}
      decay={2}
      castShadow
      shadow-mapSize={[1024, 1024]}
    />
    {/* Magenta side fill */}
    <pointLight position={[-2.5, 1.8, 1.5]} intensity={4} color={P.magenta} distance={5} decay={2} />
    {/* Cyan rim from back */}
    <pointLight position={[2.5, 2.0, -1.0]} intensity={3} color={P.cyan} distance={6} decay={2} />
    {/* Screen glow (simulated) */}
    <pointLight position={[0.1, 1.26, 0.9]} intensity={2.5} color="#2040FF" distance={3} decay={2} />

    <Floor />
    <Cabinet />

    <Finish
      frame={0}
      profile={COLOR_PROFILES.CYBER_NEON_VOID}
      exposure={1.0}
      envIntensity={0.15}
      focus={4.8}
      aperture={0.0014}
      maxBlur={0.006}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Dark vignette — extra darkness at top/bottom */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(7,6,15,0.94) 0%, rgba(7,6,15,0.55) 18%, rgba(7,6,15,0) 38%, rgba(7,6,15,0) 70%, rgba(7,6,15,0.75) 100%)",
    }} />

    {/* Episode badge */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 700, fontSize: 27, letterSpacing: 2 }}>
        <div style={{ background: P.magenta, color: "#F4F1FF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(7,6,15,0.9)", color: P.cyan, padding: "8px 16px" }}>#34</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.white, border: `2px solid ${P.cyan}`, borderRadius: 8, padding: "6px 12px" }}>
        AUDIRA
      </div>
    </div>

    {/* Main title */}
    <div style={{ position: "absolute", left: 56, top: 275, right: 56 }}>
      {/* Clock badge */}
      <div style={{ display: "inline-block", background: P.magenta, color: P.white, fontFamily: MONO, fontWeight: 700, fontSize: 52, padding: "4px 20px", borderRadius: 10, marginBottom: 10, boxShadow: `0 0 30px ${P.magenta}` }}>
        93:20
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 130, color: P.white, lineHeight: 0.88, textShadow: `0 0 40px ${P.cyan}, 0 6px 24px rgba(0,0,0,0.9)` }}>
        AGUERO
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 100, color: P.cyan, lineHeight: 0.88, textShadow: `0 0 30px ${P.cyan}`, letterSpacing: 4 }}>
        OOOOOO!
      </div>
      <div style={{ marginTop: 20, fontFamily: MONO, fontWeight: 700, fontSize: 32, color: P.yellow, letterSpacing: 1 }}>
        MAN CITY 3 – 2 QPR
      </div>
    </div>

    {/* Bottom block */}
    <div style={{ position: "absolute", left: 56, bottom: 420, right: 56 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "rgba(244,241,255,0.65)", letterSpacing: 1 }}>
        13 MEI 2012 · GELAR PERTAMA
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: P.phosphorGreen, letterSpacing: 1 }}>
        MAN CITY 44 TAHUN
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.room }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: FOV, near: 0.05, far: 25 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
