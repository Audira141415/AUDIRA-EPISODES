import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Finish } from "../../core/render/Finish.tsx";
import { COLOR_PROFILES } from "../../core/render/FinishingPresets.ts";
import { PoseCamera } from "../../core/camera/PoseCamera.tsx";
import { AudiraSignature } from "../../brand/AudiraSignature.tsx";
import { AudiraOutro } from "../../brand/AudiraOutro.tsx";

export const WAPRES_MUNDUR_SECONDS = 70;

// ═══════════════════════════════════════════════════════════════
// PALETTE — SATELLITEBRIEFING adapted for berita (rule 15)
// ═══════════════════════════════════════════════════════════════
const P = {
  bg: "#0A0E12",
  primary: "#00BCD4",
  secondary: "#FFB300",
  accent: "#7B1FA2",
  danger: "#E53935",
  neutral: "#B0BEC5",
  panel: "#1976D2",
  silhouette: "#0F1418",
  white: "#F2F5F6",
};

// ═══════════════════════════════════════════════════════════════
// CAMERA RIG — orbit above pentagon, pushIn per zone
// ═══════════════════════════════════════════════════════════════
const FPS = 30;
const TAU = Math.PI * 2;

type CamPose = { pos: [number, number, number]; target: [number, number, number]; fov: number };

const ZONE_ANGLES = [0, 1, 2, 3, 4].map((i) => (i * TAU) / 5 - Math.PI / 2);
const ZONE_RADIUS = 3.2;
const zonePos = (i: number): [number, number, number] => [
  Math.cos(ZONE_ANGLES[i]) * ZONE_RADIUS,
  0.6,
  Math.sin(ZONE_ANGLES[i]) * ZONE_RADIUS,
];

function getCameraPose(t: number): CamPose {
  const beats: { start: number; end: number; zone: number; dist: number; elev: number }[] = [
    { start: 0, end: 3, zone: -1, dist: 12, elev: 8 },
    { start: 3, end: 14, zone: 0, dist: 6.5, elev: 4.5 },
    { start: 14, end: 25, zone: 1, dist: 6.5, elev: 5 },
    { start: 25, end: 36, zone: 2, dist: 6, elev: 4 },
    { start: 36, end: 47, zone: 3, dist: 6.5, elev: 5 },
    { start: 47, end: 55, zone: 4, dist: 6, elev: 4.5 },
    { start: 55, end: 58, zone: -1, dist: 13, elev: 9 },
    { start: 58, end: 70, zone: -1, dist: 15, elev: 10 },
  ];

  let beat = beats[0];
  for (const b of beats) {
    if (t >= b.start && t < b.end) {
      beat = b;
      break;
    }
  }
  if (t >= beats[beats.length - 1].start) beat = beats[beats.length - 1];

  const progress = Math.min(1, Math.max(0, (t - beat.start) / (beat.end - beat.start)));
  const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);

  let targetX = 0, targetZ = 0;
  if (beat.zone >= 0) {
    const zp = zonePos(beat.zone);
    targetX = zp[0] * 0.5;
    targetZ = zp[2] * 0.5;
  }

  const orbitAngle = beat.zone >= 0
    ? ZONE_ANGLES[beat.zone] + Math.PI + eased * 0.3
    : t * 0.08;
  const dist = beat.dist - eased * 1.2;
  const elev = beat.elev;

  const pos: [number, number, number] = [
    targetX + Math.cos(orbitAngle) * dist,
    elev + Math.sin(t * 0.15) * 0.15,
    targetZ + Math.sin(orbitAngle) * dist,
  ];
  const target: [number, number, number] = [targetX, 0.4, targetZ];
  const fov = beat.zone >= 0 ? 38 : 32;

  return { pos, target, fov };
}

// ═══════════════════════════════════════════════════════════════
// 3D OBJECTS — procedural hero meshes per zone
// ═══════════════════════════════════════════════════════════════

const PentagonTable: React.FC = () => {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    for (let i = 0; i < 5; i++) {
      const a = (i * TAU) / 5 - Math.PI / 2;
      const x = Math.cos(a) * 5;
      const z = Math.sin(a) * 5;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    shape.closePath();
    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1A1A2E" metalness={0.6} roughness={0.2} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geo, 15]} />
        <lineBasicMaterial color={P.primary} transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
};

const EmissiveGridFloor: React.FC<{ t: number }> = ({ t }) => {
  const linesMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: P.primary, transparent: true, opacity: 0.15 }),
    [],
  );
  const lines: React.ReactNode[] = [];
  for (let i = -10; i <= 10; i++) {
    lines.push(
      <mesh key={`h${i}`} position={[0, -0.01, i * 0.8]} material={linesMat}>
        <boxGeometry args={[20, 0.005, 0.01]} />
      </mesh>,
      <mesh key={`v${i}`} position={[i * 0.8, -0.01, 0]} material={linesMat}>
        <boxGeometry args={[0.01, 0.005, 20]} />
      </mesh>,
    );
  }
  return <group>{lines}</group>;
};

const BGScreenPanel: React.FC = () => (
  <mesh position={[0, 3, -8]} receiveShadow>
    <planeGeometry args={[18, 7]} />
    <meshPhysicalMaterial
      color={P.panel}
      emissive={P.panel}
      emissiveIntensity={2.2}
      transparent
      opacity={0.4}
      roughness={0.9}
    />
  </mesh>
);

const FGSilhouettes: React.FC = () => (
  <>
    {[-3.5, -1.5, 1.5, 3.5].map((x, i) => (
      <group key={i} position={[x, 0, 6]}>
        <mesh>
          <boxGeometry args={[0.6, 2.8, 0.3]} />
          <meshPhysicalMaterial color={P.silhouette} roughness={0.9} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.6, 0.06, 0.3]} />
          <meshPhysicalMaterial
            color={P.secondary}
            emissive={P.secondary}
            emissiveIntensity={2}
            roughness={0.5}
          />
        </mesh>
      </group>
    ))}
  </>
);

const ScanLine: React.FC<{ t: number }> = ({ t }) => {
  const y = -0.5 + ((t * 0.6) % 7);
  return (
    <mesh position={[0, y, 5.5]}>
      <planeGeometry args={[12, 0.04]} />
      <meshBasicMaterial color={P.secondary} transparent opacity={0.5 + 0.3 * Math.sin(t * 3)} />
    </mesh>
  );
};

// Zone 1: Surat pengunduran diri
const SuratMundur: React.FC<{ t: number; active: boolean }> = ({ t, active }) => {
  const pos = zonePos(0);
  const glow = active ? 0.8 + 0.2 * Math.sin(t * 2) : 0.2;
  return (
    <group position={pos}>
      {/* Surat 3D */}
      <mesh position={[0, 0.4, 0]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.03, 1.6]} />
        <meshPhysicalMaterial
          color="#F5F0E8"
          roughness={0.2}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          emissive={P.secondary}
          emissiveIntensity={glow * 0.3}
        />
      </mesh>
      {/* Emissive edge glow */}
      <mesh position={[0, 0.42, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.24, 0.005, 1.64]} />
        <meshBasicMaterial color={P.secondary} transparent opacity={glow} />
      </mesh>
      {/* Name plate base */}
      <mesh position={[0, 0.15, 0.6]} castShadow>
        <boxGeometry args={[1.8, 0.25, 0.08]} />
        <meshPhysicalMaterial
          color="#1A2A3A"
          transmission={0.3}
          thickness={0.5}
          roughness={0.05}
          emissive={P.primary}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Pushpins */}
      {[[-0.4, 0.46, -0.6], [0.4, 0.46, -0.6]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#E53935" />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <coneGeometry args={[0.015, 0.06, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Zone 2: Gavel MA
const GavelMA: React.FC<{ t: number; active: boolean }> = ({ t, active }) => {
  const pos = zonePos(1);
  const smashProgress = active ? Math.min(1, (t - 14) / 0.5) : 0;
  const rotation = active ? -0.4 * (1 - smashProgress) : -0.4;
  return (
    <group position={pos}>
      {/* Gavel handle */}
      <group rotation={[0, 0, rotation]} position={[0, 0.6, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.05, 1.2, 16]} />
          <meshPhysicalMaterial color="#5D3A1A" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Gavel head */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
          <meshPhysicalMaterial
            color="#888"
            metalness={0.85}
            roughness={0.15}
            envMapIntensity={0.7}
            emissive={P.danger}
            emissiveIntensity={active ? 0.6 : 0.1}
          />
        </mesh>
      </group>
      {/* Strike pad */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 24]} />
        <meshPhysicalMaterial color="#1A1A2E" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Name plate */}
      <mesh position={[0, 0.15, 0.7]} castShadow>
        <boxGeometry args={[1.6, 0.25, 0.08]} />
        <meshPhysicalMaterial
          color="#1A2A3A"
          transmission={0.3}
          thickness={0.5}
          roughness={0.05}
          emissive={P.primary}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

// Zone 3: Timeline bar
const TimelineKronologi: React.FC<{ t: number; active: boolean }> = ({ t, active }) => {
  const pos = zonePos(2);
  const fillProgress = active ? Math.min(1, (t - 25) / 4) : 0;
  return (
    <group position={pos}>
      {/* Timeline base bar */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[2.4, 0.08, 0.15]} />
        <meshPhysicalMaterial color="#1A1A2E" metalness={0.4} roughness={0.2} />
      </mesh>
      {/* Filled progress */}
      <mesh position={[-1.2 + fillProgress * 1.2, 0.31, 0]}>
        <boxGeometry args={[2.4 * fillProgress, 0.06, 0.12]} />
        <meshPhysicalMaterial
          color={P.primary}
          emissive={P.primary}
          emissiveIntensity={2}
          roughness={0.3}
        />
      </mesh>
      {/* Timeline markers */}
      {[0, 0.5, 1].map((p, i) => (
        <mesh key={i} position={[-1.2 + p * 2.4, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshPhysicalMaterial
            color={P.secondary}
            emissive={P.secondary}
            emissiveIntensity={fillProgress > p ? 1.5 : 0.2}
            metalness={0.3}
          />
        </mesh>
      ))}
      {/* Name plate MPR */}
      <mesh position={[0, 0.15, 0.6]} castShadow>
        <boxGeometry args={[1.4, 0.25, 0.08]} />
        <meshPhysicalMaterial
          color="#1A2A3A"
          transmission={0.3}
          thickness={0.5}
          roughness={0.05}
          emissive={P.primary}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

// Zone 4: Flowchart konstitusi
const FlowchartKonstitusi: React.FC<{ t: number; active: boolean }> = ({ t, active }) => {
  const pos = zonePos(3);
  const nodePositions: [number, number, number][] = [
    [-0.8, 0.5, 0], [0, 0.9, 0], [0.8, 0.5, 0], [0, 0.2, 0],
  ];
  const glowIntensity = active ? 1.2 : 0.2;
  return (
    <group position={pos}>
      {nodePositions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.25, 0.12]} />
            <meshPhysicalMaterial
              color="#1A2A3A"
              metalness={0.3}
              roughness={0.15}
              emissive={i === 0 ? P.primary : P.secondary}
              emissiveIntensity={glowIntensity}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.52, 0.27, 0.14), 15]} />
            <lineBasicMaterial color={P.primary} transparent opacity={0.8} />
          </lineSegments>
        </group>
      ))}
      {/* Connecting tubes */}
      {[[0, 1], [1, 2], [1, 3]].map(([from, to], i) => {
        const a = nodePositions[from], b = nodePositions[to];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        return (
          <mesh key={i} position={[mx, my, 0]} rotation={[0, 0, angle]}>
            <cylinderGeometry args={[0.015, 0.015, len, 8]} />
            <meshBasicMaterial color={P.primary} transparent opacity={0.5} />
          </mesh>
        );
      })}
      {/* Name plates */}
      {["DASCO", "MUZANI", "SUGIONO"].map((name, i) => (
        <mesh key={name} position={[-0.6 + i * 0.6, 0.05, 0.3]} castShadow>
          <boxGeometry args={[0.5, 0.15, 0.06]} />
          <meshPhysicalMaterial
            color="#1A2A3A"
            transmission={0.3}
            thickness={0.5}
            roughness={0.05}
            emissive={P.primary}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// Zone 5: Instagram counter
const ViralCounter: React.FC<{ t: number; active: boolean }> = ({ t, active }) => {
  const pos = zonePos(4);
  const counterProgress = active ? Math.min(1, (t - 47) / 3) : 0;
  const barHeights = [0.8, 1.2, 1.6, 2.2, 2.8].map((h) => h * counterProgress);
  return (
    <group position={pos}>
      {/* Bar chart columns */}
      {barHeights.map((h, i) => (
        <group key={i} position={[-0.8 + i * 0.4, h / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, h, 0.25]} />
            <meshPhysicalMaterial color="#1A2A3E" metalness={0.3} roughness={0.2} />
          </mesh>
          {/* Emissive top cap */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[0.27, 0.04, 0.27]} />
            <meshPhysicalMaterial
              color={P.secondary}
              emissive={P.secondary}
              emissiveIntensity={2}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}
      {/* Frame kosong (rule 15: no face) */}
      <mesh position={[0, 1.8, -0.3]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.04]} />
        <meshPhysicalMaterial color="#2A2A3E" metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.8, -0.28]}>
        <boxGeometry args={[0.6, 0.8, 0.01]} />
        <meshPhysicalMaterial
          color="#0A0E12"
          emissive={P.primary}
          emissiveIntensity={active ? 0.4 : 0.1}
          roughness={0.9}
        />
      </mesh>
      {/* Monitor screen */}
      <mesh position={[0.6, 0.6, 0.3]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshPhysicalMaterial
          color={P.panel}
          emissive={P.panel}
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════
// 3D WORLD
// ═══════════════════════════════════════════════════════════════
const World: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const cam = getCameraPose(t);
  const activeZone = t < 3 ? -1 : t < 14 ? 0 : t < 25 ? 1 : t < 36 ? 2 : t < 47 ? 3 : t < 55 ? 4 : -1;

  return (
    <>
      <PoseCamera position={cam.pos} target={cam.target} fov={cam.fov} />

      {/* Lighting: 3-point + environment (rule 19) */}
      <ambientLight intensity={0.35} color="#FFFFFF" />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#FFF8E7" castShadow />
      <directionalLight position={[-4, 5, -3]} intensity={0.65} color="#90CAF9" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color={P.primary} distance={15} />
      <pointLight position={[0, 2, -4]} intensity={0.5} color={P.accent} distance={10} />

      {/* Fog */}
      <fogExp2 attach="fog" args={[P.bg, 0.045]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshPhysicalMaterial color={P.bg} metalness={0.4} roughness={0.6} />
      </mesh>
      <EmissiveGridFloor t={t} />

      {/* Pentagon table */}
      <PentagonTable />

      {/* Background panel */}
      <BGScreenPanel />

      {/* Foreground silhouettes */}
      <FGSilhouettes />

      {/* Scan line */}
      <ScanLine t={t} />

      {/* Zone hero objects */}
      <SuratMundur t={t} active={activeZone === 0} />
      <GavelMA t={t} active={activeZone === 1} />
      <TimelineKronologi t={t} active={activeZone === 2} />
      <FlowchartKonstitusi t={t} active={activeZone === 3} />
      <ViralCounter t={t} active={activeZone === 4} />

      {/* Finish chain: CYBER_NEON_VOID */}
      <Finish
        frame={frame}
        background={P.bg}
        profile={COLOR_PROFILES.CYBER_NEON_VOID}
        exposure={1.35}
        envIntensity={0.7}
        ao={false}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// 2D HUD OVERLAY
// ═══════════════════════════════════════════════════════════════
const FONT = "'Inter', 'Segoe UI', sans-serif";

type ChapterBlock = {
  id: string;
  label: string;
  start: number;
  end: number;
  chips: string[];
};

const CHAPTERS: ChapterBlock[] = [
  { id: "c00", label: "5 FAKTA", start: 0, end: 3, chips: [] },
  { id: "c01", label: "FAKTA 1 — MUNDUR", start: 3, end: 14, chips: ["12 NOVEMBER 2026", "2 TAHUN MENJABAT"] },
  { id: "c02", label: "FAKTA 2 — PUTUSAN MA", start: 14, end: 25, chips: ["PUTUSAN MA No. 742 K/TUN/2026", "IJAZAH DIBATALKAN"] },
  { id: "c03", label: "FAKTA 3 — KRONOLOGI", start: 25, end: 36, chips: ["11.16 WIB", "4 MENIT"] },
  { id: "c04", label: "FAKTA 4 — KONSTITUSI", start: 36, end: 47, chips: ["14 HARI", "60 HARI"] },
  { id: "c05", label: "FAKTA 5 — VIRAL", start: 47, end: 55, chips: ["7,1 JUTA LIKES", "16 NOV"] },
  { id: "c06", label: "PERISTIWA BERSEJARAH", start: 55, end: 58, chips: ["25 NOV — DEADLINE"] },
];

const CAPTIONS: { start: number; end: number; text: string }[] = [
  { start: 0, end: 3, text: "Untuk pertama kalinya sejak Reformasi — seorang Wakil Presiden mengundurkan diri." },
  { start: 3, end: 9, text: "Fakta pertama. Gibran Rakabuming Raka resmi mundur pada 12 November 2026." },
  { start: 9, end: 14, text: "Ia menjabat hanya dua tahun, sejak Oktober 2024." },
  { start: 14, end: 20, text: "Fakta kedua. Mahkamah Agung membatalkan surat penyetaraan ijazah." },
  { start: 20, end: 25, text: "DPR juga mengancam Hak Menyatakan Pendapat." },
  { start: 25, end: 32, text: "Fakta ketiga. Pukul 11.16, Gibran tiba di Gedung MPR." },
  { start: 32, end: 36, text: "Empat menit kemudian, surat sudah diserahkan ke Ketua MPR." },
  { start: 36, end: 42, text: "Fakta keempat. Presiden usulkan dua nama dalam 14 hari." },
  { start: 42, end: 47, text: "MPR gelar sidang paling lambat 60 hari. Tiga nama mencuat dari Gerindra." },
  { start: 47, end: 52, text: "Fakta kelima. Video pengunduran diri meraih 7,1 juta likes." },
  { start: 52, end: 55, text: "Foto resmi dicopot serentak dari kantor pemerintahan." },
  { start: 55, end: 58, text: "Lima fakta. Satu peristiwa bersejarah. Kursi Wapres kosong — siapa yang mengisi?" },
];

const HUDOverlay: React.FC<{ t: number }> = ({ t }) => {
  const currentChapter = CHAPTERS.find((c) => t >= c.start && t < c.end);
  const currentCaption = CAPTIONS.find((c) => t >= c.start && t < c.end);

  const countdownOpacity = interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: FONT,
        color: P.white,
      }}
    >
      {/* Top safe zone: 180px */}

      {/* Countdown HUD — top right */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 44,
          opacity: countdownOpacity,
          background: "rgba(10,14,18,0.86)",
          border: `1px solid ${P.secondary}`,
          padding: "10px 20px",
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 3,
          color: P.secondary,
        }}
      >
        DEADLINE 25 NOV
      </div>

      {/* Chapter card — top left */}
      {currentChapter && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 44,
            opacity: interpolate(
              t,
              [currentChapter.start, currentChapter.start + 0.3, currentChapter.end - 0.3, currentChapter.end],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              color: P.secondary,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {"● OSINT BRIEFING // WAPRES"}
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1.08,
              color: P.white,
              textShadow: `0 0 30px ${P.primary}`,
            }}
          >
            {currentChapter.label}
          </div>
        </div>
      )}

      {/* HUD chips — data callouts, min 128px */}
      {currentChapter &&
        currentChapter.chips.map((chip, i) => (
          <div
            key={`${currentChapter.id}-${i}`}
            style={{
              position: "absolute",
              top: 240 + i * 90,
              left: 44,
              opacity: interpolate(
                t,
                [currentChapter.start + 0.5 + i * 0.3, currentChapter.start + 1 + i * 0.3],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              background: "rgba(0,188,212,0.12)",
              border: `1px solid ${P.primary}`,
              padding: "12px 24px",
              borderRadius: 6,
              fontSize: 48,
              fontWeight: 700,
              minWidth: 128,
              color: P.primary,
              letterSpacing: 1,
            }}
          >
            {chip}
          </div>
        ))}

      {/* Caption band: y 1300-1540, Inter 42px weight 600 */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            left: 44,
            right: 44,
            top: 1340,
            textAlign: "center",
            opacity: interpolate(
              t,
              [currentCaption.start, currentCaption.start + 0.2, currentCaption.end - 0.2, currentCaption.end],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          <span
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: P.secondary,
              lineHeight: 1.4,
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              padding: "8px 16px",
              background: "rgba(10,14,18,0.6)",
              borderRadius: 8,
              wordSpacing: 8,
            }}
          >
            {currentCaption.text}
          </span>
        </div>
      )}

      {/* Name plates rendered as HUD overlays for better readability */}
      {t >= 3 && t < 14 && (
        <div
          style={{
            position: "absolute",
            bottom: 500,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: interpolate(t, [3, 3.5, 13, 14], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: P.primary,
              background: "rgba(26,42,58,0.85)",
              padding: "8px 24px",
              borderRadius: 4,
              border: `1px solid rgba(0,188,212,0.3)`,
              letterSpacing: 2,
            }}
          >
            GIBRAN RAKABUMING RAKA
          </span>
        </div>
      )}

      {t >= 25 && t < 36 && (
        <div
          style={{
            position: "absolute",
            bottom: 500,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: interpolate(t, [25, 25.5, 35, 36], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: P.primary,
              background: "rgba(26,42,58,0.85)",
              padding: "8px 24px",
              borderRadius: 4,
              border: `1px solid rgba(0,188,212,0.3)`,
              letterSpacing: 2,
            }}
          >
            AHMAD MUZANI — Ketua MPR
          </span>
        </div>
      )}

      {/* Bottom: AUDIRA MOTION watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 400,
          right: 44,
          fontSize: 12,
          opacity: 0.5,
          textAlign: "right",
          letterSpacing: 1,
        }}
      >
        AUDIRA MOTION v4.0
        <br />
        EBU R128 (-14 LUFS)
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════
export const WapresMundurScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const cam = getCameraPose(t);
  const isOutro = t >= 58;

  return (
    <AbsoluteFill style={{ background: P.bg }}>
      {/* 3D Canvas */}
      {!isOutro && (
        <ThreeCanvas
          width={width}
          height={height}
          camera={{
            position: cam.pos,
            fov: cam.fov,
            near: 0.1,
            far: 100,
          }}
          onCreated={({ camera }) => {
            camera.lookAt(cam.target[0], cam.target[1], cam.target[2]);
          }}
        >
          <World t={t} frame={frame} />
        </ThreeCanvas>
      )}

      {/* 2D HUD */}
      {!isOutro && <HUDOverlay t={t} />}

      {/* Brand */}
      <AudiraSignature seed="wapres-mundur-EP01" />
      <AudiraOutro />
    </AbsoluteFill>
  );
};
