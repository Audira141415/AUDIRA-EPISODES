// EP27 cover (VINTAGEFORGE): "Nottingham Forest & Brian Clough — Raja Eropa".
// A vintage trophy cabinet still-life: the European Champion Clubs' Cup (1979–80 original design)
// on a mahogany plinth draped in Forest red, against an aged-parchment engraving-screen background.
// Different from EP06 (tavern book scene): trophy display, no book/candle/quill.
// No real badges or player likenesses. AUDIRA engraved on the plinth fascia.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { VINTAGE_PALETTE as V } from "../../kits/vintageforge/lib/palette.ts";

const { fontFamily: PLAYFAIR } = loadPlayfair("normal", { weights: ["900"], subsets: ["latin"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["600"], subsets: ["latin"] });

type V3 = [number, number, number];
const W = 1080;
const H = 1920;

export const FOREST_RED = "#CC0000";
export const TROPHY_GOLD = "#C8A84B";
export const DARK_BG = "#0D0906";

const CAM_POS: V3 = [0, 1.65, 4.6];
const CAM_TARGET: V3 = [0, 0.55, 0];
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

/** European Cup trophy: cylindrical body, two ear-handles, octagonal stepped base. */
const EuropeanCupTrophy: React.FC = () => {
  const grain = useSurfaceGrain(42, 0.09, 4);
  return (
    <group position={[0, 0.9, 0]}>
      {/* stepped base */}
      <mesh position={[0, -0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.06, 8]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.9} roughness={0.18} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, -0.84, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.44, 0.44, 0.08, 8]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.9} roughness={0.18} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, -0.76, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.08, 8]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.85} roughness={0.2} roughnessMap={grain} />
      </mesh>
      {/* neck */}
      <mesh position={[0, -0.52, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.33, 0.44, 24]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.9} roughness={0.18} roughnessMap={grain} />
      </mesh>
      {/* body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.37, 0.14, 0.72, 32]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.88} roughness={0.16} roughnessMap={grain} />
      </mesh>
      {/* shoulder ring */}
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.39, 0.37, 0.06, 32]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.92} roughness={0.14} />
      </mesh>
      {/* neck top */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.21, 0.37, 0.28, 24]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.88} roughness={0.18} roughnessMap={grain} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.64, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.21, 0.025, 10, 40]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* left handle */}
      <mesh position={[-0.42, 0.22, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <torusGeometry args={[0.22, 0.028, 8, 32, Math.PI * 1.1]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* right handle */}
      <mesh position={[0.42, 0.22, 0]} rotation={[0, 0, -Math.PI / 6 + Math.PI]} castShadow>
        <torusGeometry args={[0.22, 0.028, 8, 32, Math.PI * 1.1]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={TROPHY_GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* star on top */}
      <mesh position={[0, 0.69, 0]} castShadow>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshPhysicalMaterial color={TROPHY_GOLD} metalness={1} roughness={0.08} />
      </mesh>
    </group>
  );
};

/** Red cloth draping the plinth. */
const RedDrape: React.FC = () => {
  const grain = useSurfaceGrain(17, 0.14, 2);
  return (
    <>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.62, 0.06, 32]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={FOREST_RED} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, -0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.68, 0.14, 32]} />
        <meshPhysicalMaterial {...POLISH.fabric} color={FOREST_RED} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.68, 0.74, 0.08, 32, 1, true]} />
        <meshPhysicalMaterial {...POLISH.fabric} color="#991100" roughnessMap={grain} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

/** Mahogany plinth with AUDIRA engraved on the front. */
const Plinth: React.FC = () => {
  const woodTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#4A1F10";
    g.fillRect(0, 0, 512, 256);
    // wood grain
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
      g.lineWidth = 1 + Math.random() * 2;
      g.beginPath();
      g.moveTo(0, Math.random() * 256);
      g.bezierCurveTo(128, Math.random() * 256, 384, Math.random() * 256, 512, Math.random() * 256);
      g.stroke();
    }
    // AUDIRA engraving on front
    g.fillStyle = "rgba(200,168,75,0.72)";
    g.font = "bold 54px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("AUDIRA", 256, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const woodSide = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#3D1A0C";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 20; i++) {
      g.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, Math.random() * 256);
      g.lineTo(256, Math.random() * 256);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[0, -0.52, 0]}>
      {/* main block */}
      <mesh castShadow receiveShadow>
        <RoundedBoxGeo args={[1.4, 0.44, 1.0]} radius={0.025} segments={2} />
        <meshPhysicalMaterial color="#4A1F10" map={woodSide} roughness={0.55} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      {/* front face */}
      <mesh position={[0, 0, 0.502]}>
        <planeGeometry args={[1.38, 0.42]} />
        <meshPhysicalMaterial map={woodTex} roughness={0.5} clearcoat={0.6} clearcoatRoughness={0.15} />
      </mesh>
      {/* gold border strip */}
      <mesh position={[0, 0, 0.504]}>
        <ringGeometry args={[0.59, 0.635, 4, 1, Math.PI / 4]} />
        <meshPhysicalMaterial color={TROPHY_GOLD} metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
};

/** Engraving-screen background: ruled horizontal lines on parchment. */
const EngravingWall: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 1024;
    const g = c.getContext("2d")!;
    g.fillStyle = V.parchmentSepia;
    g.fillRect(0, 0, 1024, 1024);
    g.strokeStyle = `rgba(59,40,24,0.14)`;
    g.lineWidth = 1;
    for (let y = 0; y < 1024; y += 6) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1024, y);
      g.stroke();
    }
    // cross-hatch in corners for depth
    g.strokeStyle = `rgba(59,40,24,0.08)`;
    for (let x = -1024; x < 1024; x += 10) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 1024, 1024);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 4);
    return t;
  }, []);
  return (
    <mesh position={[0, 1, -2.8]} receiveShadow>
      <planeGeometry args={[9, 10]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
};

const TableTop: React.FC = () => {
  const grain = useSurfaceGrain(8, 0.1, 3);
  return (
    <mesh position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[5, 4]} />
      <meshPhysicalMaterial color="#2A100A" roughnessMap={grain} roughness={0.6} clearcoat={0.4} clearcoatRoughness={0.3} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[DARK_BG]} />
    <ambientLight intensity={0.15} color={V.parchmentSepia} />
    <hemisphereLight args={[V.parchmentSepia, "#1A0A04", 0.4]} />
    {/* key: warm overhead spot */}
    <directionalLight
      position={[-1, 6, 4]}
      intensity={3.2}
      color="#FFE4B8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-3}
      shadow-camera-right={3}
      shadow-camera-top={4}
      shadow-camera-bottom={-2}
      shadow-camera-near={0.5}
      shadow-camera-far={20}
      shadow-bias={-0.0005}
    />
    {/* terracotta fill from the right */}
    <directionalLight position={[3, 2, 2]} intensity={0.9} color={V.terracottaWash} />
    {/* Forest red accent from below-front */}
    <pointLight position={[0, -0.5, 2]} intensity={2.5} color={FOREST_RED} distance={4} decay={2} />
    <EngravingWall />
    <TableTop />
    <Plinth />
    <RedDrape />
    <EuropeanCupTrophy />
    <Finish
      frame={0}
      profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM}
      exposure={0.88}
      envIntensity={0.3}
      ao
      focus={1.65}
      aperture={0.003}
      maxBlur={0.008}
    />
  </>
);

/** Engraved-style SVG cross-hatch border frame. */
const EngravingFrame: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <pattern id="ep27lines" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="3" y1="0" x2="3" y2="6" stroke={`rgba(59,40,24,0.22)`} strokeWidth="0.8" />
      </pattern>
    </defs>
    {/* corners */}
    <rect x={40} y={170} width={180} height={180} fill="url(#ep27lines)" opacity={0.6} />
    <rect x={860} y={170} width={180} height={180} fill="url(#ep27lines)" opacity={0.6} />
    {/* fine border lines */}
    <rect x={36} y={36} width={W - 72} height={H - 72} fill="none" stroke={V.agedGold} strokeWidth={2.5} />
    <rect x={44} y={44} width={W - 88} height={H - 88} fill="none" stroke={V.engravingBrown} strokeWidth={0.8} />
    {/* corner ornaments */}
    {([[44, 44], [1036, 44], [44, 1876], [1036, 1876]] as const).map(([x, y], i) => (
      <g key={i} transform={`translate(${x},${y})`}>
        <circle r={6} fill={V.agedGold} />
        <circle r={3} fill={V.engravingBrown} />
      </g>
    ))}
  </svg>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* top gradient vignette */}
    <div style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(13,9,6,0.88) 0%, rgba(13,9,6,0.72) 14%, rgba(13,9,6,0) 32%, rgba(13,9,6,0) 72%, rgba(13,9,6,0.72) 88%, rgba(13,9,6,0.92) 100%)",
    }} />
    <EngravingFrame />
    {/* kicker bar */}
    <div style={{
      position: "absolute", left: 60, right: 60, top: 196,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{
        fontFamily: OSWALD, fontWeight: 600, fontSize: 26, letterSpacing: 4,
        color: V.agedGold, borderBottom: `1.5px solid ${V.agedGold}`, paddingBottom: 4,
      }}>
        SEJARAH SEPAK BOLA
      </div>
      <div style={{
        fontFamily: OSWALD, fontWeight: 600, fontSize: 26, letterSpacing: 3,
        color: V.parchmentSepia, background: FOREST_RED, padding: "5px 14px",
      }}>
        #27
      </div>
    </div>

    {/* main headline */}
    <div style={{
      position: "absolute", left: 56, top: 262,
      fontFamily: PLAYFAIR, fontWeight: 900, lineHeight: 0.92,
      textShadow: "0 6px 24px rgba(0,0,0,0.75)",
    }}>
      <div style={{ fontSize: 118, color: V.parchmentSepia, letterSpacing: -1 }}>NOTTINGHAM</div>
      <div style={{ fontSize: 118, color: FOREST_RED, letterSpacing: -1 }}>FOREST</div>
      <div style={{
        marginTop: 20, fontFamily: OSWALD, fontWeight: 600, fontSize: 46,
        color: V.agedGold, letterSpacing: 6,
      }}>
        RAJA EROPA
      </div>
    </div>

    {/* year badge */}
    <div style={{
      position: "absolute", left: 56, top: 582,
      display: "flex", gap: 12, alignItems: "center",
    }}>
      <div style={{
        fontFamily: OSWALD, fontWeight: 600, fontSize: 72, color: V.parchmentSepia,
        textShadow: "0 4px 16px rgba(0,0,0,0.6)",
        borderLeft: `5px solid ${FOREST_RED}`, paddingLeft: 18, lineHeight: 1,
      }}>1979</div>
      <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 52, color: V.agedGold, lineHeight: 1 }}>·</div>
      <div style={{
        fontFamily: OSWALD, fontWeight: 600, fontSize: 72, color: V.parchmentSepia,
        textShadow: "0 4px 16px rgba(0,0,0,0.6)", lineHeight: 1,
      }}>1980</div>
    </div>

    {/* bottom sub-line */}
    <div style={{
      position: "absolute", left: 56, right: 56, bottom: 196,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{
        fontFamily: OSWALD, fontWeight: 600, fontSize: 32, letterSpacing: 3,
        color: V.agedGold, borderTop: `1px solid ${V.agedGold}`, paddingTop: 12,
      }}>
        BRIAN CLOUGH · BACK TO BACK
      </div>
      <div style={{
        fontFamily: OSWALD, fontWeight: 600, fontSize: 26, letterSpacing: 2,
        color: V.parchmentSepia, opacity: 0.78,
      }}>
        Liga Divisi 2 → Juara Eropa · 1975–1980
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: DARK_BG }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 30 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
