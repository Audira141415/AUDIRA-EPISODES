// EP21 cover (PAPERWORLD): "Keajaiban Bern 1954" — West Germany beats Hungary 3-2 despite
// losing 8-3 in the group stage. Fritz Walter weather. Paper diorama pitch in autumn rain:
// Germany cobalt pucks hold a compact line; Hungary coral pucks pushed back after Rahn goals.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { paperFace } from "../../kits/paperworld/material/paper.ts";
import { PALETTE } from "../../kits/paperworld/tokens.ts";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const W = 1080, H = 1920;
type V3 = [number, number, number];
const CAM_POS: V3 = [0.3, 7.8, 8.2];
const CAM_TARGET: V3 = [0, 0, -0.5];
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

const PaperPuck: React.FC<{ pos: V3; color: string }> = ({ pos, color }) => {
  const mat = useMemo(() => paperFace(color), [color]);
  return (
    <group position={pos}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow material={mat}>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 32]} />
      </mesh>
    </group>
  );
};

const PaperBall: React.FC<{ pos: V3 }> = ({ pos }) => {
  const mat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = PALETTE.ivoryLight;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = PALETTE.brownDeep;
    for (const [cx, cy, r] of [[64, 80, 28], [192, 80, 28], [128, 160, 32], [48, 180, 20], [210, 180, 20]] as [number, number, number][]) {
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, metalness: 0 });
  }, []);
  return (
    <mesh position={pos} castShadow material={mat}>
      <sphereGeometry args={[0.22, 32, 24]} />
    </mesh>
  );
};

const RainStreak: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const mat = useMemo(() => paperFace(PALETTE.brown, { relief: 0.3 }), []);
  return (
    <mesh position={[x, 1.2, z]} rotation={[0, 0, 0.26]} castShadow material={mat}>
      <boxGeometry args={[0.025, 0.55, 0.025]} />
    </mesh>
  );
};

const GERMANY: V3[] = [[-1.5, 0, 1.6], [-0.5, 0, 1.6], [0.5, 0, 1.6], [1.5, 0, 1.6]];
const HUNGARY: V3[] = [[-0.9, 0, -1.0], [0.1, 0, -1.5], [1.1, 0, -0.9]];
const RAIN: [number, number][] = [[-2.4, 2.5], [-1.1, 1.8], [0.3, 2.1], [1.6, 1.4], [2.3, 2.8], [-1.8, -1.2], [-0.4, -0.6], [0.8, -1.5], [2.0, -0.8], [-2.1, 0.1], [1.3, 0.5], [-0.6, -2.5], [1.9, -2.1]];

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const groundMat = useMemo(() => paperFace(PALETTE.mint), []);
  const backdropMat = useMemo(() => paperFace(PALETTE.brown), []);
  const standMat = useMemo(() => paperFace(PALETTE.brownLight), []);
  return (
    <>
      <CameraRig />
      <color attach="background" args={[PALETTE.ivory]} />
      <fog attach="fog" args={[PALETTE.ivory, 15, 32]} />
      <ambientLight intensity={0.45} color="#D4C5A9" />
      <hemisphereLight args={["#FAF0DC", "#2D3A20", 0.4]} />
      <directionalLight
        position={[-3, 8, 6]}
        intensity={2.1}
        color="#F5E6C0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0003}
      />
      <directionalLight position={[4, 3, -6]} intensity={0.65} color="#A0BDD4" />
      {/* ground pitch */}
      <mesh position={[0, -0.05, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={groundMat}>
        <planeGeometry args={[11, 9]} />
      </mesh>
      {/* centre-line */}
      <mesh position={[0, 0.001, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 0.03]} />
        <meshBasicMaterial color={PALETTE.ivoryLight} transparent opacity={0.5} />
      </mesh>
      {/* stadium backdrop wall */}
      <mesh position={[0, 1.8, -4.8]} receiveShadow castShadow material={backdropMat}>
        <boxGeometry args={[12, 3.6, 0.3]} />
      </mesh>
      {/* left stand */}
      <mesh position={[-4.5, 0.8, -3.2]} rotation={[0.15, 0, 0]} receiveShadow castShadow material={standMat}>
        <boxGeometry args={[2.8, 2.0, 1.4]} />
      </mesh>
      {/* right stand */}
      <mesh position={[4.5, 0.8, -3.2]} rotation={[0.15, 0, 0]} receiveShadow castShadow material={standMat}>
        <boxGeometry args={[2.8, 2.0, 1.4]} />
      </mesh>
      {/* Germany pucks (cobalt) */}
      {GERMANY.map((p, i) => <PaperPuck key={`de${i}`} pos={p} color={PALETTE.cobalt} />)}
      {/* Hungary pucks (coral) */}
      {HUNGARY.map((p, i) => <PaperPuck key={`hu${i}`} pos={p} color={PALETTE.coral} />)}
      {/* football */}
      <PaperBall pos={[0.4, 0.22, 0]} />
      {/* rain streaks */}
      {RAIN.map(([x, z], i) => <RainStreak key={i} x={x} z={z} />)}
      <Finish frame={Math.round(f)} profile={COLOR_PROFILES.VINTAGE_SEPIA_FILM} exposure={1.0} envIntensity={0.4} ao focus={11} aperture={0.0015} maxBlur={0.004} />
    </>
  );
};

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,22,14,0.90) 0%, rgba(30,22,14,0.65) 20%, rgba(30,22,14,0) 40%, rgba(30,22,14,0) 70%, rgba(30,22,14,0.75) 100%)" }} />
    {/* episode badge */}
    <div style={{ position: "absolute", left: 60, top: 196, display: "flex", alignItems: "stretch", borderRadius: 8, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>
      <div style={{ background: PALETTE.cobalt, color: "#FFFFFF", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
      <div style={{ background: "rgba(10,8,5,0.95)", color: PALETTE.gold, padding: "8px 16px" }}>#21</div>
    </div>
    <div style={{ position: "absolute", right: 60, top: 204, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: PALETTE.ivoryLight, border: `2px solid ${PALETTE.cobalt}`, borderRadius: 6, padding: "5px 12px", letterSpacing: 2 }}>
      AUDIRA
    </div>
    {/* main title */}
    <div style={{ position: "absolute", left: 56, top: 275, lineHeight: 0.92, textShadow: "0 8px 30px rgba(0,0,0,0.75)" }}>
      <div style={{ fontFamily: ANTON, fontSize: 136, color: PALETTE.ivoryLight, letterSpacing: 2 }}>KEAJAIBAN</div>
      <div style={{ fontFamily: ANTON, fontSize: 136, color: PALETTE.coral, letterSpacing: 2 }}>BERN</div>
      <div style={{ marginTop: 14, display: "inline-block", fontFamily: MARKER, fontSize: 52, color: PALETTE.ink, background: PALETTE.gold, padding: "2px 20px 6px", transform: "rotate(-1.8deg)" }}>1954</div>
    </div>
    {/* score badge */}
    <div style={{ position: "absolute", right: 56, bottom: 420, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 100, color: PALETTE.gold, lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>3-2</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: PALETTE.ivoryLight, letterSpacing: 3 }}>WEST GERMANY v HUNGARY</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, color: PALETTE.coralLight, letterSpacing: 2, marginTop: 2 }}>WORLD CUP FINAL · BERN</div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: PALETTE.ivory }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }} camera={{ position: CAM_POS, fov: FOV, near: 0.1, far: 80 }}>
        <Scene f={f} />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
