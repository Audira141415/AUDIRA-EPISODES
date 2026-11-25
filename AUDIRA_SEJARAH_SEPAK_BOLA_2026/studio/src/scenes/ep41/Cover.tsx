// EP41 cover (PAPERWORLD): "Peñarol, Penguasa Montevideo & Libertadores".
// Paper-craft miniature diorama: a stadium cut from card, trophy as paper sculpture.
// Peñarol colours: black (#1A1A1A) and yellow (#FFD700).
// Railway-worker heritage: a stylised locomotive motif on the platform edge.
import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { paperFace, paperEdge } from "../../kits/paperworld/material/paper.ts";
import { PALETTE } from "../../kits/paperworld/tokens.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const PEN_BLACK = "#1A1A1A";
const PEN_GOLD = "#FFD700";
const PEN_GOLD_DEEP = "#C49B00";
const W = 1080;
const H = 1920;

// ── Paper helpers ────────────────────────────────────────────────────────────

const PaperSlab: React.FC<{ w: number; h: number; d: number; color: string; position: [number, number, number]; rotation?: [number, number, number] }> = ({
  w, h, d, color, position, rotation = [0, 0, 0],
}) => {
  const faceMat = useMemo(() => paperFace(color), [color]);
  const edgeMat = useMemo(() => paperEdge(color), [color]);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow material={faceMat}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
    </group>
  );
};

// Stadium stand: tiered paper bleachers
const Stand: React.FC<{ x: number; side: 1 | -1 }> = ({ x, side }) => {
  const tiers = [
    { y: 0.3, z: -0.3 * side, h: 0.6, d: 0.5 },
    { y: 0.9, z: -0.9 * side, h: 0.4, d: 0.5 },
    { y: 1.4, z: -1.5 * side, h: 0.3, d: 0.5 },
  ];
  const faceM = useMemo(() => paperFace("ivory"), []);
  return (
    <group position={[x, 0, 0]}>
      {tiers.map((t, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, t.y, t.z]} material={faceM}>
          <boxGeometry args={[14, t.h, t.d]} />
        </mesh>
      ))}
      {/* Peñarol black stripes on the stands */}
      {tiers.map((t, i) => (
        <mesh key={`s${i}`} position={[0, t.y + t.h / 2 + 0.01, t.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, t.d]} />
          <meshBasicMaterial color={i % 2 === 0 ? PEN_BLACK : PEN_GOLD} toneMapped={false} transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
};

// Pitch: green paper rectangle
const Pitch: React.FC = () => {
  const mat = useMemo(() => paperFace("#4a8c5c", { roughness: 0.88 }), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat}>
        <planeGeometry args={[12, 7]} />
      </mesh>
      {/* Centre circle line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[1.1, 1.22, 48]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* Centre line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[0.08, 7]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// Cup trophy as stacked paper shapes
const Trophy: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const gold = useMemo(() => paperFace(PEN_GOLD, { roughness: 0.6, relief: 0.5 }), []);
  const dark = useMemo(() => paperFace(PEN_BLACK, { roughness: 0.75 }), []);
  return (
    <group position={position}>
      {/* base plinth */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]} material={dark}>
        <boxGeometry args={[0.8, 0.24, 0.5]} />
      </mesh>
      {/* stem */}
      <mesh castShadow receiveShadow position={[0, 0.44, 0]} material={dark}>
        <boxGeometry args={[0.18, 0.44, 0.18]} />
      </mesh>
      {/* cup body */}
      <mesh castShadow receiveShadow position={[0, 0.86, 0]} material={gold}>
        <cylinderGeometry args={[0.26, 0.18, 0.5, 16]} />
      </mesh>
      {/* cup handles - left and right */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.34, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]} material={gold}>
          <torusGeometry args={[0.11, 0.025, 8, 20, Math.PI]} />
        </mesh>
      ))}
      {/* star on top */}
      <mesh position={[0, 1.14, 0]} material={gold}>
        <sphereGeometry args={[0.09, 8, 8]} />
      </mesh>
    </group>
  );
};

// Railway track cross-tie: Peñarol CURCC heritage
const RailTrack: React.FC = () => {
  const sleeper = useMemo(() => paperFace(PALETTE.brown, { roughness: 0.92 }), []);
  const rail = useMemo(() => paperFace(PALETTE.brownLight, { roughness: 0.55 }), []);
  const ties = useMemo(() => Array.from({ length: 9 }, (_, i) => i - 4), []);
  return (
    <group position={[0, 0.01, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* rail beams */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0, 0]} material={rail}>
          <boxGeometry args={[0.07, 10, 0.08]} />
        </mesh>
      ))}
      {/* sleepers / ties */}
      {ties.map((z) => (
        <mesh key={z} position={[0, z * 1.1, 0]} material={sleeper}>
          <boxGeometry args={[0.9, 0.09, 0.14]} />
        </mesh>
      ))}
    </group>
  );
};

// Ground: pale paper board
const Ground: React.FC = () => {
  const mat = useMemo(() => paperFace(PALETTE.ivoryShade, { roughness: 0.96 }), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow material={mat}>
      <planeGeometry args={[24, 18]} />
    </mesh>
  );
};

// AUDIRA brand painted on the pitch (brand inside the world)
const PitchBrand: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 1024, 256);
    g.font = "bold 180px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,255,255,0.40)";
    g.fillText("AUDIRA", 512, 136);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 0.012, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.5, 1.1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const Scene: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <color attach="background" args={[PALETTE.ivoryLight]} />
    <ambientLight intensity={1.3} color="#FEFAF0" />
    <hemisphereLight args={["#FFF8E8", "#D4C8A8", 0.9]} />
    <directionalLight
      position={[-5, 11, 7]}
      intensity={2.4}
      color="#FFF6E0"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0005}
    />
    {/* yellow accent rim from behind the trophy */}
    <directionalLight position={[3, 4, -8]} intensity={0.9} color={PEN_GOLD} />

    <Ground />
    <Pitch />
    <PitchBrand />
    <Stand x={0} side={1} />
    <Stand x={0} side={-1} />
    <RailTrack />
    <Trophy position={[3.8, 0.0, -0.5]} />
    <Trophy position={[-4.5, 0.0, 1.0]} />
    <Trophy position={[0.0, 0.0, -4.2]} />

    {/* AUDIRA trophy display label — a small paper tag */}
    <PaperSlab w={2.0} h={0.4} d={0.06} color={PEN_BLACK} position={[-4.5, 0.46, 1.0]} />

    <Finish
      frame={frame}
      background={PALETTE.ivoryLight}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={1.05}
      envIntensity={0.4}
      ao
      focus={6.5}
      aperture={0.002}
      maxBlur={0.005}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* paper-white gradient at top and bottom */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(243,234,214,0.90) 0%, rgba(243,234,214,0.60) 20%, rgba(243,234,214,0) 40%, rgba(243,234,214,0) 72%, rgba(30,20,10,0.70) 100%)",
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
        <div style={{ background: PEN_BLACK, color: PEN_GOLD, padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: PEN_GOLD, color: PEN_BLACK, padding: "8px 16px" }}>#41</div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2,
          color: PEN_BLACK,
          border: `2px solid ${PEN_BLACK}`,
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        PEÑAROL · AUDIRA
      </div>
    </div>

    {/* main title */}
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 290,
        lineHeight: 0.90,
        textShadow: "0 4px 16px rgba(30,20,10,0.55)",
      }}
    >
      <div style={{ fontFamily: ANTON, fontSize: 100, color: PEN_BLACK, letterSpacing: 1 }}>PENGUASA</div>
      <div style={{ fontFamily: ANTON, fontSize: 100, color: PEN_BLACK, letterSpacing: 1 }}>MONTEVIDEO</div>
      {/* sub-label sticker */}
      <div
        style={{
          marginTop: 18,
          display: "inline-block",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          color: PEN_BLACK,
          background: PEN_GOLD,
          padding: "4px 18px 7px",
          borderRadius: 6,
          letterSpacing: 1,
        }}
      >
        3× Libertadores · CURCC 1891
      </div>
    </div>

    {/* bottom stats */}
    <div
      style={{
        position: "absolute",
        bottom: 420,
        left: 56,
        right: 56,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 22,
          color: PEN_BLACK,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Spencer · 3 Gol vs Benfica
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 20,
          color: PEN_BLACK,
          letterSpacing: 2,
          opacity: 0.75,
        }}
      >
        1961 Intercontinental · Real Madrid 4-0 · 1966
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.ivoryLight }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ fov: 42, position: [0, 7.5, 12.5], near: 0.1, far: 80 }}
        shadows={{ type: THREE.PCFSoftShadowMap }}
      >
        <Scene frame={frame} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
