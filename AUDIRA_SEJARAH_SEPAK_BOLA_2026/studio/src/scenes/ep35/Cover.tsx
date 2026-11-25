// EP35 — Inter Milan Grande Inter Treble 2010 — FILMNOIR style
// Three trophies gleam under a tungsten lamp on a wet midnight street. Mourinho's silhouette.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { FILMNOIR_PALETTE as P } from "../../kits/filmnoir/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

type V3 = [number, number, number];
const CAM_POS: V3 = [-0.3, 1.5, 5.0];
const CAM_TARGET: V3 = [0.3, 0.6, 0.0];
const FOV = 36;

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

// Wet pavement reflective plane
const WetPavement: React.FC = () => {
  const paveTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = P.pavementWet;
    g.fillRect(0, 0, 512, 512);
    // reflection patch under lamp — golden pool
    const gold = g.createRadialGradient(256, 256, 20, 256, 256, 180);
    gold.addColorStop(0, "rgba(255,220,140,0.28)");
    gold.addColorStop(0.4, "rgba(255,180,80,0.10)");
    gold.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gold;
    g.fillRect(0, 0, 512, 512);
    // accent neon puddle
    const red = g.createRadialGradient(140, 380, 5, 140, 380, 70);
    red.addColorStop(0, "rgba(255,43,67,0.22)");
    red.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = red;
    g.fillRect(0, 0, 512, 512);
    // crack lines (paving stones)
    g.strokeStyle = "rgba(30,35,45,0.9)";
    g.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
      g.beginPath(); g.moveTo(0, i * 76); g.lineTo(512, i * 76 + 10); g.stroke();
    }
    for (let i = 0; i < 5; i++) {
      g.beginPath(); g.moveTo(i * 110, 0); g.lineTo(i * 110 - 8, 512); g.stroke();
    }
    // AUDIRA stencil (brand inside the world)
    g.font = "bold 36px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,230,160,0.14)";
    g.fillText("AUDIRA", 256, 450);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.5, 2.5);
    return t;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[14, 10]} />
      <meshPhysicalMaterial
        map={paveTex}
        roughness={0.08}
        metalness={0.5}
        envMapIntensity={1.8}
        color={P.pavementWet}
      />
    </mesh>
  );
};

// UCL trophy shape (simplified elegant form)
const Trophy: React.FC<{ pos: V3; scale?: number; rotY?: number }> = ({ pos, scale = 1, rotY = 0 }) => (
  <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
    {/* Base plinth */}
    <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.28, 0.14, 0.28]} radius={0.015} segments={2} />
      <meshPhysicalMaterial {...POLISH.brickABS} color="#3A3020" roughness={0.4} />
    </mesh>
    {/* Stem lower */}
    <mesh position={[0, 0.26, 0]} castShadow>
      <cylinderGeometry args={[0.052, 0.07, 0.24, 20]} />
      <meshPhysicalMaterial color="#C8A84B" metalness={0.95} roughness={0.1} clearcoat={0.8} />
    </mesh>
    {/* Cup bowl */}
    <mesh position={[0, 0.52, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.055, 0.32, 24, 1, true]} />
      <meshPhysicalMaterial color="#C8A84B" metalness={0.95} roughness={0.08} clearcoat={1.0} clearcoatRoughness={0.04} side={THREE.DoubleSide} />
    </mesh>
    {/* Cup rim */}
    <mesh position={[0, 0.69, 0]} castShadow>
      <torusGeometry args={[0.16, 0.022, 12, 32]} />
      <meshPhysicalMaterial color="#E0BC5A" metalness={0.98} roughness={0.06} />
    </mesh>
    {/* Handle left */}
    <mesh position={[-0.21, 0.52, 0]} rotation={[0, 0, 0.3]} castShadow>
      <torusGeometry args={[0.09, 0.016, 10, 20, Math.PI]} />
      <meshPhysicalMaterial color="#C8A84B" metalness={0.95} roughness={0.1} />
    </mesh>
    {/* Handle right */}
    <mesh position={[0.21, 0.52, 0]} rotation={[0, 0, -0.3]} castShadow>
      <torusGeometry args={[0.09, 0.016, 10, 20, Math.PI]} />
      <meshPhysicalMaterial color="#C8A84B" metalness={0.95} roughness={0.1} />
    </mesh>
    {/* Star finial */}
    <mesh position={[0, 0.82, 0]} castShadow>
      <sphereGeometry args={[0.04, 12, 10]} />
      <meshPhysicalMaterial color="#E8CC66" metalness={0.98} roughness={0.05} clearcoat={1} />
    </mesh>
  </group>
);

// Lampost — vintage cast iron
const Lamppost: React.FC = () => (
  <group position={[2.4, 0, -0.6]}>
    {/* Post */}
    <mesh position={[0, 1.9, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.04, 3.8, 10]} />
      <meshPhysicalMaterial color={P.trimIron} roughness={0.5} metalness={0.6} />
    </mesh>
    {/* Arm curve */}
    <mesh position={[-0.28, 3.72, 0]} rotation={[0, 0, 0.42]} castShadow>
      <cylinderGeometry args={[0.016, 0.016, 0.62, 8]} />
      <meshPhysicalMaterial color={P.trimIron} roughness={0.5} metalness={0.6} />
    </mesh>
    {/* Lamp housing */}
    <mesh position={[-0.52, 3.86, 0]} castShadow>
      <sphereGeometry args={[0.09, 14, 10]} />
      <meshPhysicalMaterial color={P.streetLightTungsten} emissive={P.streetLightTungsten} emissiveIntensity={2.5} roughness={0.1} />
    </mesh>
  </group>
);

// Mourinho-style silhouette (coat, shoulders, slight head tilt)
const FigureSilhouette: React.FC = () => (
  <group position={[-1.8, 0, -0.9]}>
    {/* Legs */}
    <mesh position={[-0.07, 0.42, 0]} castShadow>
      <RoundedBoxGeo args={[0.11, 0.84, 0.1]} radius={0.03} segments={2} />
      <meshPhysicalMaterial color="#0A0B0D" roughness={0.9} />
    </mesh>
    <mesh position={[0.09, 0.42, 0]} castShadow>
      <RoundedBoxGeo args={[0.11, 0.84, 0.1]} radius={0.03} segments={2} />
      <meshPhysicalMaterial color="#0A0B0D" roughness={0.9} />
    </mesh>
    {/* Coat body */}
    <mesh position={[0, 1.08, 0]} castShadow>
      <RoundedBoxGeo args={[0.42, 0.68, 0.14]} radius={0.04} segments={2} />
      <meshPhysicalMaterial color="#0D0E12" roughness={0.85} />
    </mesh>
    {/* Shoulders (wide coat) */}
    <mesh position={[0, 1.34, 0]} castShadow>
      <RoundedBoxGeo args={[0.56, 0.18, 0.15]} radius={0.04} segments={2} />
      <meshPhysicalMaterial color="#0D0E12" roughness={0.85} />
    </mesh>
    {/* Neck */}
    <mesh position={[0, 1.5, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.065, 0.14, 10]} />
      <meshPhysicalMaterial color="#0F1015" roughness={0.9} />
    </mesh>
    {/* Head */}
    <mesh position={[0.03, 1.72, 0]} castShadow>
      <sphereGeometry args={[0.13, 16, 14]} />
      <meshPhysicalMaterial color="#0D0E12" roughness={0.85} />
    </mesh>
    {/* Left arm raised in triumph */}
    <mesh position={[-0.34, 1.26, 0.04]} rotation={[0, 0, 0.9]} castShadow>
      <RoundedBoxGeo args={[0.1, 0.42, 0.1]} radius={0.03} segments={2} />
      <meshPhysicalMaterial color="#0D0E12" roughness={0.85} />
    </mesh>
  </group>
);

// Brick wall back (receding into dark)
const Wall: React.FC = () => {
  const brickTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = P.brickWall;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "rgba(5,6,8,0.8)";
    g.lineWidth = 2;
    for (let row = 0; row < 16; row++) {
      const offset = row % 2 === 0 ? 0 : 24;
      for (let col = 0; col < 6; col++) {
        g.strokeRect(col * 48 - offset, row * 16, 44, 14);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
    return t;
  }, []);

  return (
    <mesh position={[0.5, 1.5, -2.2]} receiveShadow>
      <planeGeometry args={[12, 6]} />
      <meshPhysicalMaterial map={brickTex} roughness={0.88} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[P.voidDark]} />
    <fog attach="fog" args={[P.voidDark, 8, 16]} />
    {/* Very low ambient — Chiaroscuro approach */}
    <ambientLight intensity={0.04} color="#2A3040" />
    {/* Cold blue moonlight rim from above-behind */}
    <directionalLight position={[-3.5, 7.0, -4.0]} intensity={1.0} color={P.rimLightCool} />
    {/* Tungsten street lamp — warm, casting hard shadows */}
    <pointLight
      position={[2.0, 3.86, -0.6]}
      intensity={18}
      color={P.streetLightTungsten}
      distance={8}
      decay={2}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0005}
    />
    {/* Neon accent — selective red from diner sign reflecting in puddle */}
    <pointLight position={[-2.0, 0.8, 0.5]} intensity={2.5} color={P.accentDinerNeon} distance={4} decay={2} />

    <WetPavement />
    <Wall />
    <Lamppost />
    <FigureSilhouette />

    {/* Three trophies — Serie A, Coppa Italia, UCL — arrayed in a proud line */}
    <Trophy pos={[-0.52, 0.0, 0.3]} scale={1.0} rotY={0.3} />
    <Trophy pos={[0.3, 0.0, 0.1]} scale={1.15} rotY={0.0} />
    <Trophy pos={[1.1, 0.0, 0.25]} scale={0.95} rotY={-0.25} />

    <Finish
      frame={0}
      background={P.voidDark}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={0.68}
      envIntensity={0.12}
      focus={5.0}
      aperture={0.0014}
      maxBlur={0.006}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Heavy noir vignette */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(6,7,9,0.95) 0%, rgba(6,7,9,0.65) 20%, rgba(6,7,9,0) 42%, rgba(6,7,9,0) 68%, rgba(6,7,9,0.80) 100%)",
    }} />

    {/* Episode badge */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 700, fontSize: 27, letterSpacing: 2 }}>
        <div style={{ background: P.accentDinerNeon, color: "#F8F4EC", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(6,7,9,0.92)", color: P.streetLightTungsten, padding: "8px 16px" }}>#35</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "#F8F4EC", border: `2px solid ${P.streetLightTungsten}`, borderRadius: 8, padding: "6px 12px", opacity: 0.9 }}>
        AUDIRA
      </div>
    </div>

    {/* Main title */}
    <div style={{ position: "absolute", left: 56, top: 275, right: 56 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: P.streetLightTungsten, letterSpacing: 3, marginBottom: 4, opacity: 0.85 }}>
        INTER MILAN · 2010
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 120, color: "#F8F4EC", lineHeight: 0.88, textShadow: "0 4px 32px rgba(0,0,0,0.95), 0 0 60px rgba(255,220,140,0.15)" }}>
        IL GRANDE
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 120, color: P.streetLightTungsten, lineHeight: 0.88, textShadow: "0 4px 32px rgba(0,0,0,0.95), 0 0 50px rgba(255,220,140,0.3)" }}>
        INTER
      </div>

      {/* Treble badge */}
      <div style={{ marginTop: 24, display: "inline-flex", gap: 8, alignItems: "center" }}>
        {["SERIE A", "COPPA", "UCL"].map((t) => (
          <div key={t} style={{
            background: "rgba(255,220,140,0.12)",
            border: `1.5px solid ${P.streetLightTungsten}`,
            color: P.streetLightTungsten,
            fontFamily: MONO, fontWeight: 700, fontSize: 22,
            padding: "5px 12px", borderRadius: 6,
          }}>{t}</div>
        ))}
      </div>
    </div>

    {/* Bottom subtitle */}
    <div style={{ position: "absolute", left: 56, bottom: 420, right: 56 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "rgba(248,244,236,0.55)", letterSpacing: 1 }}>
        MOURINHO · MILITO · TREBLE
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: P.accentDinerNeon, letterSpacing: 1 }}>
        KLUB EROPA KE-6 RAIH TREBLE
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.voidDark }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: FOV, near: 0.1, far: 22 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
