// EXAMPLE: how an episode Film.tsx looks WITH the template system.
// Compare with the ~120-line manual Film.tsx in existing episodes.
//
// This file is a reference — copy and adapt, don't import from it.

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  FilmFromConfig,
  quickBeats,
  framingFrom,
  orbit,
  pushIn,
  crane,
  type FilmConfig,
  type BeatContent,
} from "../templates";

// --- Kit palette (from your chosen style kit) ---
// import { DISASTER_PALETTE as P } from "../kits/disastersim/lib/palette";
const P = { primary: "#e63946", secondary: "#457b9d", accent: "#f4a261", ground: "#264653" };

// --- Beat timings from VO duration ---
const BEATS = quickBeats(95.2); // 95.2s VO + 3s outro pad = 98.2s total

// --- Scene content: ONLY the 3D objects. No boilerplate. ---

const HookScene: BeatContent = ({ progress }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.003;
  });
  return (
    <group>
      <mesh ref={ref} scale={8}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color={P.primary} roughness={0.4} />
      </mesh>
      <pointLight position={[10, 15, 10]} intensity={2} color={P.accent} />
    </group>
  );
};

const ContextScene: BeatContent = ({ progress }) => (
  <group position={[0, -2, 0]}>
    <mesh scale={[20, 0.5, 20]}>
      <boxGeometry />
      <meshStandardMaterial color={P.ground} />
    </mesh>
    <group position={[0, 3, 0]} scale={1 + progress * 0.3}>
      {/* Subject reveals as progress goes 0→1 */}
      <mesh>
        <cylinderGeometry args={[2, 2, 6, 32]} />
        <meshStandardMaterial color={P.secondary} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  </group>
);

const MainScene: BeatContent = ({ progress, elapsed }) => (
  <group>
    {/* Multi-stage content keyed to progress */}
    {progress < 0.33 && <group>{/* Stage 1 */}</group>}
    {progress >= 0.33 && progress < 0.66 && <group>{/* Stage 2 */}</group>}
    {progress >= 0.66 && <group>{/* Stage 3 */}</group>}
  </group>
);

const ExplanationScene: BeatContent = ({ progress }) => (
  <group>{/* Detail view */}</group>
);

const PayoffScene: BeatContent = ({ progress }) => (
  <group>{/* Climax / transformation */}</group>
);

const OutroScene: BeatContent = ({ progress }) => (
  <group>{/* Brand card environment */}</group>
);

// --- Film config: the ONLY thing Film.tsx needs ---

const config: FilmConfig = {
  beats: BEATS,
  startFraming: framingFrom([15, 8, 30], [0, 1, 0], 32),
  scenes: {
    hook: HookScene,
    context: ContextScene,
    main: MainScene,
    explanation: ExplanationScene,
    payoff: PayoffScene,
    outro: OutroScene,
  },
  // Override camera for specific beats (optional — defaults are good)
  shots: {
    context: [
      { at: BEATS.context.start, move: orbit(-30) },
      { at: BEATS.context.start + 4, move: crane(12, 1) },
    ],
    main: [{ move: pushIn(0.5) }],
  },
  background: "#1a1a2e",
  hdri: "studio",
  ao: true,
};

// --- The entire Film component ---
export const Film: React.FC = () => <FilmFromConfig config={config} />;

// BEFORE (manual Film.tsx):  ~120 lines of ThreeCanvas + CameraRig + Finish + BeatSwitch
// AFTER  (with templates):   ~15 lines of config + <FilmFromConfig />
//
// BEFORE (each scene file):  ~100 lines (imports + timing + progress + camera + 3D)
// AFTER  (each BeatContent): ~40-60 lines (just 3D objects, progress pre-computed)
//
// Total reduction: ~820 lines → ~380 lines (54% fewer lines to generate)
