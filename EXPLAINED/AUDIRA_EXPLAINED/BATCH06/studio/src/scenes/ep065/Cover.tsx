// AE-065 cover (VINTAGEFORGE): bascule bridge as a 3D copper-plate engraving on parchment.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { BridgeWorld, leafPoint, pinionCenter, PIVOT, SHIP_POS, TAIL } from "./BridgeWorld.tsx";
import { COVER_POSE, makeCamera, project, type Pose } from "./camera.ts";

export const BG = "#efe3c6";
const OPEN = (68 * Math.PI) / 180;
const HAND = "'Ink Free', 'Segoe Print', cursive";
const SERIF = "'Palatino Linotype', 'Book Antiqua', Georgia, serif";
const INK = "#2b1b10";

const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pose.pos);
    c.lookAt(new THREE.Vector3(...pose.target));
    c.fov = pose.fov;
    c.near = 0.1;
    c.far = 400;
    c.updateProjectionMatrix();
  }, [camera, pose]);
  return null;
};

const Lights: React.FC = () => (
  <>
    <hemisphereLight args={["#fff4dc", "#8a6a48", 1.1]} />
    <directionalLight
      position={[-14, 22, 16]}
      intensity={2.6}
      color="#fff0d6"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-camera-near={1}
      shadow-camera-far={80}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[12, 6, -10]} intensity={0.6} color="#ffd9a8" />
  </>
);

// Label positions are fixed in 1080×1920 screen space (laid out by eye around the projected anchors).
type Note = { text: string; at: [number, number, number]; lx: number; ly: number; align?: "left" | "right" };

const Annotations: React.FC = () => {
  const cam = useMemo(() => makeCamera(COVER_POSE), []);
  const notes: Note[] = [
    { text: "daun jembatan", at: leafPoint(OPEN, 2.3, 0.45, 1.3), lx: 70, ly: 520 },
    { text: "poros (trunnion)", at: [PIVOT[0], PIVOT[1], 1.45], lx: 440, ly: 760 },
    { text: "rak gigi + pinion", at: [pinionCenter()[0], pinionCenter()[1], 1.0], lx: 400, ly: 1075 },
    { text: "pemberat", at: leafPoint(OPEN, -TAIL + 0.36, -0.36, 0.95), lx: 60, ly: 1205 },
    { text: "kapal tiang tinggi", at: [SHIP_POS[0] - 0.3, SHIP_POS[1] + 4.6, SHIP_POS[2] + 0.4], lx: 610, ly: 420 },
  ];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {notes.map((n, i) => {
        const [x, y] = project(cam, n.at);
        const align = n.align ?? "left";
        const { lx, ly } = n;
        const dy = ly - y;
        const cx = (x + lx) / 2 + (dy > 0 ? 30 : -30);
        const cy = (y + ly) / 2;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={7} fill="none" stroke={INK} strokeWidth={3} />
            <circle cx={x} cy={y} r={2.5} fill={INK} />
            <path d={`M ${x} ${y} Q ${cx} ${cy} ${lx} ${ly}`} fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
            <text
              x={align === "right" ? lx - 10 : lx + 10}
              y={ly + 12}
              textAnchor={align === "right" ? "end" : "start"}
              fontFamily={HAND}
              fontSize={40}
              fontWeight={700}
              fill={INK}
              stroke="#efe3c6"
              strokeWidth={7}
              paintOrder="stroke"
            >
              {n.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Paper: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.55 }}>
    <filter id="ep065-paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={65} />
      <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0.55 0" />
    </filter>
    <filter id="ep065-fibre">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
      <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.18 0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#ep065-paper)" />
    <rect width={1080} height={1920} filter="url(#ep065-fibre)" />
    {/* foxed, burnt edges */}
    <radialGradient id="ep065-edge" cx="50%" cy="48%" r="75%">
      <stop offset="62%" stopColor="#fff" stopOpacity={0} />
      <stop offset="100%" stopColor="#7a4a22" stopOpacity={0.55} />
    </radialGradient>
    <rect width={1080} height={1920} fill="url(#ep065-edge)" />
  </svg>
);

// Foreground plane: a brass drafting divider and ruler lying on the sheet, out of focus.
const Foreground: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="ep065-brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f0d58e" />
        <stop offset="0.45" stopColor="#c5a059" />
        <stop offset="1" stopColor="#7a5a26" />
      </linearGradient>
      <filter id="ep065-dof"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="ep065-shadow"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <g filter="url(#ep065-shadow)" opacity={0.35}>
      <path d="M 196 1612 L 70 1960 L 110 1960 Z M 196 1612 L 380 1960 L 420 1960 Z" fill="#3b2818" transform="translate(18 22)" />
    </g>
    <g filter="url(#ep065-dof)">
      <path d="M 186 1600 L 52 1960 L 92 1960 L 200 1640 Z" fill="url(#ep065-brass)" stroke="#5a3d1a" strokeWidth={3} />
      <path d="M 206 1600 L 392 1960 L 432 1960 L 196 1640 Z" fill="url(#ep065-brass)" stroke="#5a3d1a" strokeWidth={3} />
      <circle cx={196} cy={1600} r={30} fill="url(#ep065-brass)" stroke="#5a3d1a" strokeWidth={4} />
      <circle cx={196} cy={1600} r={9} fill="#5a3d1a" />
      <g transform="rotate(-14 900 1800)">
        <rect x={640} y={1760} width={560} height={86} fill="url(#ep065-brass)" stroke="#5a3d1a" strokeWidth={3} />
        {Array.from({ length: 28 }, (_, i) => (
          <line key={i} x1={650 + i * 20} y1={1760} x2={650 + i * 20} y2={1760 + (i % 5 === 0 ? 36 : 18)} stroke="#4a3010" strokeWidth={3} />
        ))}
      </g>
    </g>
  </svg>
);

const Titles: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {/* top rule + kicker */}
    <div style={{ position: "absolute", left: 70, right: 70, top: 262, display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ flex: 1, height: 3, background: INK, opacity: 0.8 }} />
      <span style={{ fontFamily: SERIF, fontSize: 34, letterSpacing: 9, color: INK, fontWeight: 700, textShadow: "0 0 10px #efe3c6, 0 0 4px #efe3c6" }}>AUDIRA EXPLAINED</span>
      <div style={{ flex: 1, height: 3, background: INK, opacity: 0.8 }} />
    </div>
    {/* title card */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 1262, bottom: 430, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 112,
          lineHeight: 1.0,
          color: INK,
          textAlign: "center",
          textShadow: "0 0 18px #efe3c6, 0 0 6px #efe3c6",
        }}
      >
        Kenapa Jembatan
        <br />
        <span style={{ color: "#8a3a22", fontStyle: "italic" }}>Bisa Terangkat?</span>
      </div>
      <svg width={620} height={34} style={{ marginTop: 14 }}>
        <path d="M 10 18 C 160 2, 300 32, 460 14 S 600 10, 610 18" fill="none" stroke="#a8803a" strokeWidth={4} strokeLinecap="round" />
        <circle cx={310} cy={18} r={6} fill="#a8803a" />
      </svg>
    </div>
  </AbsoluteFill>
);

export const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const f = (frame / 30) * 60;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <ThreeCanvas width={1080} height={1920} dpr={1} shadows camera={{ fov: COVER_POSE.fov, position: COVER_POSE.pos }}>
        <Rig pose={COVER_POSE} />
        <fog attach="fog" args={[BG, 30, 75]} />
        <Lights />
        <BridgeWorld f={f} open={OPEN} />
        <Finish frame={frame} background={BG} profile={{ ...COLOR_PROFILES.VINTAGE_SEPIA_FILM, chromaticAberration: 0.0006 }} exposure={0.82} envIntensity={0.25} hdri="warmStudio" ao />
      </ThreeCanvas>
      <Paper />
      <Foreground />
      <Annotations />
      <Titles />
    </AbsoluteFill>
  );
};
