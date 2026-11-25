// EP33 — Mukjizat Deportivo Coruña 2004 — CHAINREACTION style
// Chain reaction: AC Milan (red) dominoes toppled, Deportivo (blue) dominoes stand triumphant.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { CHAINREACTION_PALETTE as P } from "../../kits/chainreaction/lib/palette";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"] });

const W = 1080;
const H = 1920;

type V3 = [number, number, number];
const CAM_POS: V3 = [0.3, 2.6, 5.8];
const CAM_TARGET: V3 = [0.1, 0.0, 0.0];
const FOV = 35;

// Bench geometry
const BENCH_Y = -0.52;
const BENCH_TOP = BENCH_Y + 0.05; // top surface at -0.47

// Domino dims
const DW = 0.48, DH = 1.0, DD = 0.1;
const STAND_Y = BENCH_TOP + DH / 2;   // -0.47 + 0.5 = 0.03
const FALLEN_Y = BENCH_TOP + DW / 2;  // -0.47 + 0.24 = -0.23

// Deportivo blue, AC Milan red
const DEPO_BODY = "#003DA5";
const DEPO_STRIPE = "#FFFFFF";
const MILAN_BODY = "#C8102E";
const MILAN_STRIPE = "#1A1A1A";

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

// Domino: rotZ=0 standing, rotZ=+PI/2 fully fallen to the right
const Domino: React.FC<{ x: number; y: number; z?: number; rotZ?: number; body: string; stripe: string }> = ({
  x, y, z = 0, rotZ = 0, body, stripe,
}) => {
  const stripeTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = body;
    g.fillRect(0, 0, 128, 256);
    // horizontal divider stripe
    g.fillStyle = stripe;
    g.fillRect(10, 118, 108, 20);
    // small pips
    g.beginPath(); g.arc(42, 72, 10, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(86, 72, 10, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(42, 196, 10, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [body, stripe]);

  return (
    <group position={[x, y, z]} rotation={[0, 0, rotZ]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[DW, DH, DD]} />
        <meshPhysicalMaterial {...POLISH.brickABS} color={body} />
      </mesh>
      {/* face label */}
      <mesh position={[0, 0, DD / 2 + 0.002]}>
        <planeGeometry args={[DW * 0.88, DH * 0.88]} />
        <meshBasicMaterial map={stripeTex} />
      </mesh>
    </group>
  );
};

// Workshop bench (plywood surface)
const Bench: React.FC = () => {
  const woodTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = P.plywood;
    g.fillRect(0, 0, 512, 128);
    // grain lines
    for (let i = 0; i < 20; i++) {
      g.strokeStyle = `rgba(140,100,60,${0.08 + Math.sin(i) * 0.04})`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, 10 + i * 5.5);
      g.lineTo(512, 10 + i * 5.5 + (Math.cos(i * 2.3) * 4));
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 1);
    return t;
  }, []);

  return (
    <>
      <mesh position={[0, BENCH_Y, 0]} receiveShadow>
        <boxGeometry args={[9, 0.1, 2.0]} />
        <meshPhysicalMaterial {...POLISH.brickABS} map={woodTex} roughness={0.6} />
      </mesh>
      {/* Front lip */}
      <mesh position={[0, BENCH_Y - 0.01, 0.98]}>
        <boxGeometry args={[9, 0.1, 0.06]} />
        <meshPhysicalMaterial color={P.plyEdge} roughness={0.5} />
      </mesh>
    </>
  );
};

// AUDIRA sponsor stencil on bench
const BenchBrand: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 512, 128);
    g.font = "bold 72px Arial";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(255,244,230,0.38)";
    g.fillText("AUDIRA", 256, 66);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0.6, BENCH_TOP + 0.002, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.6, 0.4]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
};

// Rolling marble (catalyst of the comeback chain)
const Marble: React.FC = () => (
  <mesh position={[0.1, BENCH_TOP + 0.09, 0.1]} castShadow>
    <sphereGeometry args={[0.09, 32, 24]} />
    <meshPhysicalMaterial color={P.marble} metalness={0.55} roughness={0.08} clearcoat={1.0} clearcoatRoughness={0.04} />
  </mesh>
);

// Rope guide channel (visual continuity from Milan to Deportivo)
const RopeSegment: React.FC<{ x1: number; x2: number; y: number }> = ({ x1, x2, y }) => {
  const len = x2 - x1;
  return (
    <mesh position={[(x1 + x2) / 2, y, 0.1]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.018, 0.018, len, 8]} />
      <meshPhysicalMaterial color={P.rope} roughness={0.7} />
    </mesh>
  );
};

const Scene: React.FC = () => (
  <>
    <CameraRig />
    <color attach="background" args={[P.bg]} />
    <fog attach="fog" args={[P.bg, 10, 22]} />
    <ambientLight intensity={0.15} color="#FFE9CF" />
    {/* Warm desk lamp — front right */}
    <directionalLight
      position={[2.5, 6.5, 4.5]}
      intensity={2.6}
      color={P.lamp}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-5.5}
      shadow-camera-right={5.5}
      shadow-camera-top={5}
      shadow-camera-bottom={-2}
      shadow-bias={-0.0003}
      shadow-normalBias={0.015}
    />
    {/* Cool blue rim — back left */}
    <directionalLight position={[-3.0, 4.0, -2.5]} intensity={0.7} color={P.rim} />

    <Bench />
    <BenchBrand />
    <Marble />
    <RopeSegment x1={-3.0} x2={3.0} y={BENCH_TOP + 0.03} />

    {/* AC Milan dominoes — fallen (rotZ ≈ PI/2) */}
    <Domino x={-2.6} y={FALLEN_Y - 0.05} rotZ={Math.PI / 2} body={MILAN_BODY} stripe={MILAN_STRIPE} />
    <Domino x={-2.0} y={FALLEN_Y - 0.03} z={0.08} rotZ={Math.PI / 2 - 0.1} body={MILAN_BODY} stripe={MILAN_STRIPE} />
    <Domino x={-1.35} y={FALLEN_Y} rotZ={Math.PI / 2 - 0.18} body={MILAN_BODY} stripe={MILAN_STRIPE} />
    {/* mid-fall Milan domino — the final domino tipping */}
    <Domino x={-0.65} y={-0.14} rotZ={1.05} body={MILAN_BODY} stripe={MILAN_STRIPE} />

    {/* Gap: marble rolls through here */}

    {/* Deportivo La Coruña dominoes — STANDING, triumphant */}
    <Domino x={0.65} y={STAND_Y} rotZ={0.0} body={DEPO_BODY} stripe={DEPO_STRIPE} />
    <Domino x={1.25} y={STAND_Y} rotZ={0.05} body={DEPO_BODY} stripe={DEPO_STRIPE} />
    <Domino x={1.85} y={STAND_Y} rotZ={-0.03} body={DEPO_BODY} stripe={DEPO_STRIPE} />
    <Domino x={2.45} y={STAND_Y} rotZ={0.02} body={DEPO_BODY} stripe={DEPO_STRIPE} />

    {/* Pegboard wall background */}
    <mesh position={[0.5, 0.8, -1.3]} receiveShadow>
      <boxGeometry args={[7.0, 3.6, 0.06]} />
      <meshPhysicalMaterial color={P.pegboard} roughness={0.75} />
    </mesh>

    <Finish
      frame={0}
      profile={COLOR_PROFILES.DOCUMENTARY_WARM}
      exposure={0.9}
      hdri="warmStudio"
      envIntensity={0.5}
      focus={5.6}
      aperture={0.0012}
      maxBlur={0.004}
    />
  </>
);

const Overlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* Gradient vignette */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(23,17,13,0.92) 0%, rgba(23,17,13,0.6) 20%, rgba(23,17,13,0) 42%, rgba(23,17,13,0) 72%, rgba(23,17,13,0.70) 100%)",
    }} />

    {/* Top badge bar */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 196, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "stretch", borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontWeight: 700, fontSize: 27, letterSpacing: 2 }}>
        <div style={{ background: P.flag, color: P.flagText, padding: "8px 16px" }}>SEJARAH SEPAK BOLA</div>
        <div style={{ background: "rgba(23,17,13,0.92)", color: P.accent, padding: "8px 16px" }}>#33</div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.ink, border: `2px solid ${P.accent}`, borderRadius: 8, padding: "6px 12px" }}>
        AUDIRA
      </div>
    </div>

    {/* Main title block */}
    <div style={{ position: "absolute", left: 56, top: 275, right: 56 }}>
      <div style={{ fontFamily: ANTON, fontSize: 120, color: DEPO_BODY, lineHeight: 0.90, textShadow: "0 6px 28px rgba(0,0,0,0.85)" }}>
        MUKJIZAT
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 96, color: P.ink, lineHeight: 0.90, textShadow: "0 6px 28px rgba(0,0,0,0.85)" }}>
        DEPORTIVO
      </div>
      <div style={{ fontFamily: ANTON, fontSize: 96, color: P.ink, lineHeight: 0.90, textShadow: "0 6px 28px rgba(0,0,0,0.85)" }}>
        CORUÑA
      </div>

      {/* Score reversal badge */}
      <div style={{ marginTop: 28, display: "inline-flex", gap: 10, alignItems: "center" }}>
        <div style={{
          background: MILAN_BODY, color: "#FFF",
          fontFamily: MONO, fontWeight: 700, fontSize: 38,
          padding: "8px 18px", borderRadius: 10,
          textDecoration: "line-through",
          textDecorationColor: "rgba(255,255,255,0.7)",
        }}>0 – 4</div>
        <div style={{ color: P.ink, fontFamily: MONO, fontWeight: 700, fontSize: 42 }}>→</div>
        <div style={{
          background: DEPO_BODY, color: "#FFF",
          fontFamily: MONO, fontWeight: 700, fontSize: 38,
          padding: "8px 18px", borderRadius: 10,
          boxShadow: `0 0 20px ${DEPO_BODY}80`,
        }}>4 – 4!</div>
      </div>
    </div>

    {/* Bottom subtitle */}
    <div style={{ position: "absolute", left: 56, bottom: 420, right: 56 }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: P.inkDim, letterSpacing: 1 }}>
        UCL QF 2004 · COMEBACK
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: P.accent, letterSpacing: 1 }}>
        TERBESAR SEJARAH
      </div>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: CAM_POS, fov: FOV, near: 0.1, far: 30 }}
      >
        <Scene />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
