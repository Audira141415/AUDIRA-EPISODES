// EP31 cover (TACTICBOARD): "Total Football Belanda 1974"
// Netherlands WC 1974, Johan Cruyff #14, 4-3-3 Total Football.
// Camera: [0, 11.5, 5.5] — more overhead than EP11 to show full-pitch fluid spacing.
// EP11 used elevated 3/4 from behind; this is from above-front for a different vista.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { PitchBoard3D } from "../../kits/tacticboard/scene/PitchBoard3D";
import { TACTIC_PALETTE as P } from "../../kits/tacticboard/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, useSurfaceGrain } from "../../core/polish/Polish.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MARKER } = loadMarker();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700", "800"] });

const ORANJE = "#FF6B00";
const ORANJE_DARK = "#CC4400";
const CHALK = "#FFE27A";

const CAM31 = {
  pos: [0.0, 11.5, 5.5] as [number, number, number],
  target: [0.0, 0.0, -0.5] as [number, number, number],
  fov: 38,
};

const CameraRig: React.FC = () => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...CAM31.pos);
    cam.lookAt(...CAM31.target);
    cam.fov = CAM31.fov;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
};

// 4-3-3 Netherlands 1974 — compact high-line
const DEF_Z = 1.2;
const MID_Z = -0.08;
const FWD_Z = -1.4;
const DUTCH: { p: [number, number]; n: number; isCruyff?: boolean }[] = [
  { p: [-1.42, DEF_Z], n: 12 },
  { p: [-0.5, DEF_Z - 0.08], n: 5 },
  { p: [0.5, DEF_Z - 0.08], n: 3 },
  { p: [1.42, DEF_Z], n: 2 },
  { p: [-1.0, MID_Z], n: 8 },
  { p: [0.0, MID_Z + 0.1], n: 15 },
  { p: [1.0, MID_Z], n: 6 },
  { p: [-1.5, FWD_Z + 0.2], n: 16 },
  { p: [0.0, FWD_Z], n: 14, isCruyff: true },
  { p: [1.5, FWD_Z + 0.2], n: 7 },
];

const R = 0.27;
const PH = 0.09;

const DutchPuck: React.FC<{ x: number; z: number; n: number; seed: number; isCruyff?: boolean }> = ({ x, z, n, seed, isCruyff }) => {
  const grain = useSurfaceGrain(seed, 0.12, 3);
  const topTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = ORANJE;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.beginPath();
    g.arc(128, 128, 62, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = isCruyff ? ORANJE_DARK : "#1A1200";
    g.font = "bold 72px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(String(n), 128, 134);
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 10;
    g.beginPath();
    g.arc(128, 128, 120, 0, Math.PI * 2);
    g.stroke();
    if (isCruyff) {
      // golden star for Cruyff
      g.fillStyle = "#FFD700";
      const [cx, cy, r1, r2] = [128, 24, 16, 8];
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? r1 : r2;
        g[i === 0 ? "moveTo" : "lineTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [n, isCruyff]);

  return (
    <group position={[x, 0.012, z]}>
      <mesh position={[0, PH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, PH, 48]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={ORANJE_DARK} roughnessMap={grain} />
      </mesh>
      <mesh position={[0, PH * 0.6, 0]}>
        <cylinderGeometry args={[R * 1.004, R * 1.004, PH * 0.35, 48, 1, true]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={ORANJE} />
      </mesh>
      <mesh position={[0, PH + 0.002, 0]} rotation={[-Math.PI / 2, 0, -0.3]}>
        <circleGeometry args={[R * 0.985, 64]} />
        <meshPhysicalMaterial {...POLISH.brickABS} map={topTex} />
      </mesh>
    </group>
  );
};

// AUDIRA on the turf like a sponsor stencil
const TurfBrand31: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 1024, 256);
    g.font = "bold 190px Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,255,255,0.40)";
    g.fillText("AUDIRA", 512, 136);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <mesh position={[0, 0.014, 2.3]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.1, 0.52]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

const Scene31: React.FC<{ f: number }> = ({ f }) => (
  <>
    <CameraRig />
    <color attach="background" args={[P.void]} />
    <fog attach="fog" args={[P.void, 14, 36]} />
    <ambientLight intensity={0.28} color="#E6E2DC" />
    <hemisphereLight args={["#FFE6C8", "#182A10", 0.42]} />
    <directionalLight
      position={[-3, 11, 6]}
      intensity={2.4}
      color={P.flood}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-7}
      shadow-camera-right={7}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-camera-near={1}
      shadow-camera-far={42}
      shadow-bias={-0.0004}
    />
    {/* Oranje rim from the far touchline */}
    <directionalLight position={[5, 5, -10]} intensity={1.2} color={ORANJE} />
    <PitchBoard3D t={0} />
    {DUTCH.map((m, i) => (
      <DutchPuck key={m.n} x={m.p[0]} z={m.p[1]} n={m.n} seed={71 + i * 7} isCruyff={m.isCruyff} />
    ))}
    <TurfBrand31 />
    <Finish
      frame={Math.round(f)}
      profile={COLOR_PROFILES.APPLE_STUDIO_CLEAN}
      exposure={1.05}
      envIntensity={0.5}
      ao
      focus={13}
      aperture={0.002}
      maxBlur={0.006}
    />
  </>
);

const Overlay31: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(7,11,16,0.92) 0%, rgba(7,11,16,0.76) 22%, rgba(7,11,16,0) 36%, rgba(7,11,16,0) 80%, rgba(7,11,16,0.55) 100%)",
    }} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2 }}>
        <div style={{ background: ORANJE, color: "#FFF8F0", padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(8,8,10,0.94)", color: CHALK, padding: "8px 16px" }}>#31</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: "#FFF8F0", border: `2px solid ${ORANJE}`, borderRadius: 8, padding: "6px 12px" }}>
        BELANDA · AUDIRA
      </div>
    </div>
    <div style={{ position: "absolute", left: 56, top: 290, fontFamily: ANTON, color: "#F6F8F2", lineHeight: 0.93, textShadow: "0 8px 28px rgba(0,0,0,0.65)" }}>
      <div style={{ fontSize: 128, letterSpacing: 1 }}>TOTAL</div>
      <div style={{ fontSize: 128, letterSpacing: 1, color: ORANJE }}>FOOTBALL</div>
      <div style={{ marginTop: 14, display: "inline-block", fontFamily: MARKER, fontSize: 52, color: "#1A1A1A", background: CHALK, padding: "2px 18px 6px", transform: "rotate(-1.5deg)" }}>
        Belanda 1974 · Cruyff #14
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const f = (frame / fps) * 60;
  return (
    <AbsoluteFill style={{ background: P.void }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM31.pos, fov: CAM31.fov, near: 0.1, far: 120 }}
      >
        <Scene31 f={f} />
      </ThreeCanvas>
      <Overlay31 />
    </AbsoluteFill>
  );
};
