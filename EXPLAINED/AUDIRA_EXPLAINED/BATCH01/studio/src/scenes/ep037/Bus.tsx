// EP037 hero: generic toy intercity (AKAP) coach, rear section cut away.
// Local frame: x = length (front +x), y = up from road surface, z = width (+z faces camera).
// Facts follow research/RESEARCH_REPORT.md "Saran visual": ~1 m² cubicle at the rear,
// small separate flush-water tank, short drain pipe through the floor + hose open to the road
// (no holding tank), under-floor already full (engine at the rear, luggage bay).
import React from "react";
import { Cyl, P, RBox, V3, useCanvasTexture } from "./parts.tsx";

const L0 = -2.3; // rear
const L1 = 2.3; // front
const CUT = -0.15; // front block starts here
const FLOOR = 0.66;
const ROOF = 1.8;
const W = 0.6;

const Wheel: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0.3, z]} rotation={[Math.PI / 2, 0, 0]}>
    <Cyl r={0.3} h={0.22} color={P.tyre} rough={0.85} seg={36} />
    <Cyl r={0.17} h={0.23} color={P.hub} rough={0.55} position={[0, z > 0 ? 0.004 : -0.004, 0]} seg={24} />
    <Cyl r={0.06} h={0.245} color={P.busHoney} rough={0.6} seg={16} />
  </group>
);

const Seat: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, FLOOR, z]}>
    <RBox size={[0.12, 0.2, 0.12]} r={0.02} color="#2A2F36" position={[0, 0.1, 0]} />
    <RBox size={[0.36, 0.1, 0.42]} r={0.045} color={P.seat} position={[0.02, 0.24, 0]} rough={0.84} />
    <RBox size={[0.11, 0.52, 0.42]} r={0.05} color={P.seat} position={[-0.15, 0.52, 0]} rotation={[0, 0, 0.12]} rough={0.84} />
    <RBox size={[0.125, 0.14, 0.36]} r={0.04} color={P.seatCover} position={[-0.185, 0.76, 0]} rotation={[0, 0, 0.12]} rough={0.9} />
  </group>
);

/** Tiny blocky toy passenger (no real face), seated facing +x. */
const ToyPassenger: React.FC<{ x: number; z: number; shirt: string }> = ({ x, z, shirt }) => (
  <group position={[x, FLOOR + 0.3, z]}>
    <RBox size={[0.2, 0.3, 0.26]} r={0.06} color={shirt} position={[-0.04, 0.17, 0]} rough={0.74} />
    <RBox size={[0.22, 0.2, 0.24]} r={0.07} color="#F6C8A4" position={[-0.02, 0.43, 0]} rough={0.72} />
    <RBox size={[0.24, 0.08, 0.26]} r={0.04} color="#382315" position={[-0.03, 0.53, 0]} rough={0.8} />
    <mesh position={[0.09, 0.45, 0.06]}>
      <sphereGeometry args={[0.016, 10, 10]} />
      <meshStandardMaterial color="#111827" roughness={0.3} />
    </mesh>
    <mesh position={[0.09, 0.45, -0.06]}>
      <sphereGeometry args={[0.016, 10, 10]} />
      <meshStandardMaterial color="#111827" roughness={0.3} />
    </mesh>
    <RBox size={[0.26, 0.09, 0.22]} r={0.04} color={P.carpet} position={[0.12, 0.03, 0]} rough={0.8} />
  </group>
);

const Suitcase: React.FC<{ pos: V3; size: V3; color: string; rot?: number }> = ({ pos, size, color, rot = 0 }) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <RBox size={size} r={0.035} color={color} rough={0.74} />
    <RBox size={[size[0] * 0.4, 0.03, 0.03]} r={0.012} color="#2A2F36" position={[0, size[1] / 2 + 0.012, 0]} />
  </group>
);

/** Clear water droplet / small puddle (abstract, not dirt). */
const Drop: React.FC<{ pos: V3; s: number; flat?: boolean }> = ({ pos, s, flat }) => (
  <mesh position={pos} scale={flat ? [s * 1.6, s * 0.18, s * 1.1] : [s * 0.8, s, s * 0.8]}>
    <sphereGeometry args={[1, 16, 12]} />
    <meshStandardMaterial color="#A9D6E5" roughness={0.15} metalness={0} transparent opacity={0.8} emissive="#5FA8C4" emissiveIntensity={0.25} />
  </mesh>
);

export const Bus: React.FC<{ f: number }> = ({ f }) => {
  const sideTex = useCanvasTexture(1024, 512, (ctx) => {
    // livery on the visible +z side of the front block (generic, no operator name)
    ctx.fillStyle = P.busCream;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = P.busTeal;
    ctx.fillRect(0, 380, 1024, 132);
    ctx.fillStyle = P.busCoral;
    ctx.beginPath();
    ctx.moveTo(0, 352);
    ctx.lineTo(1024, 300);
    ctx.lineTo(1024, 334);
    ctx.lineTo(0, 374);
    ctx.fill();
    ctx.fillStyle = P.busHoney;
    ctx.beginPath();
    ctx.moveTo(0, 378);
    ctx.lineTo(1024, 340);
    ctx.lineTo(1024, 352);
    ctx.lineTo(0, 386);
    ctx.fill();
  });

  const tileTex = useCanvasTexture(256, 256, (ctx) => {
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        ctx.fillStyle = (i + j) % 2 ? "#CFE3E8" : "#A9C9D2";
        ctx.fillRect(i * 32, j * 32, 32, 32);
      }
  });

  const sway = Math.sin((f / 60) * 1.4) * 0.004;
  const winY0 = 1.02;
  const winY1 = 1.56;

  return (
    <group rotation={[0, 0, sway]}>
      {/* ---------- FRONT BLOCK (intact) ---------- */}
      <RBox size={[L1 - CUT, ROOF - 0.22, W * 2]} r={0.14} color={P.busCream} position={[(L1 + CUT) / 2, (ROOF + 0.22) / 2, 0]} />
      {/* livery panel on +z side */}
      <mesh position={[(L1 + CUT) / 2 - 0.05, 0.62, W + 0.002]}>
        <planeGeometry args={[L1 - CUT - 0.3, 0.8]} />
        <meshStandardMaterial map={sideTex} roughness={0.74} metalness={0.03} />
      </mesh>
      {/* side windows: glowing warm cabin behind tinted glass, pillars between */}
      {[0, 1, 2, 3].map((i) => {
        const x0 = CUT + 0.12 + i * 0.52;
        return (
          <RBox
            key={i}
            size={[0.46, winY1 - winY0, 0.03]}
            r={0.05}
            color="#22324D"
            position={[x0 + 0.23, (winY0 + winY1) / 2, W + 0.006]}
            rough={0.15}
            emissive="#FFC07A"
            emissiveIntensity={0.07}
          />
        );
      })}
      {/* windshield + destination board */}
      <RBox size={[0.04, 0.78, 1.04]} r={0.05} color={P.glass} position={[L1 + 0.002, 1.28, 0]} rough={0.3} emissive="#FFB862" emissiveIntensity={0.12} />
      <RBox size={[0.04, 0.12, 0.84]} r={0.03} color={P.busHoney} position={[L1 + 0.006, 1.72, 0]} emissive={P.busHoney} emissiveIntensity={0.6} />
      {/* headlights + bumper */}
      {[-0.4, 0.4].map((z) => (
        <RBox key={z} size={[0.04, 0.09, 0.24]} r={0.03} color="#FFF3D0" position={[L1 + 0.01, 0.52, z]} emissive="#FFE7A8" emissiveIntensity={2.2} />
      ))}
      <RBox size={[0.1, 0.12, 1.24]} r={0.05} color="#2A2F36" position={[L1 + 0.02, 0.3, 0]} />
      {/* roof AC pod */}
      <RBox size={[1.4, 0.14, 0.84]} r={0.06} color={P.busCream} position={[1.0, ROOF + 0.06, 0]} />
      <RBox size={[1.2, 0.03, 0.6]} r={0.012} color="#9AA3AB" position={[1.0, ROOF + 0.14, 0]} />
      {/* wheel arch shadows on side */}
      <mesh position={[1.55, 0.3, W + 0.001]}>
        <circleGeometry args={[0.37, 32, 0, Math.PI]} />
        <meshStandardMaterial color="#14171B" roughness={0.9} />
      </mesh>
      {/* cut face of the front block (cross-section) */}
      <group position={[CUT - 0.003, (ROOF + 0.22) / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[W * 2 - 0.02, ROOF - 0.24]} />
          <meshStandardMaterial color={P.cut} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.06, 0.002]}>
          <planeGeometry args={[W * 2 - 0.12, ROOF - 0.5]} />
          <meshStandardMaterial color="#3A2620" roughness={0.9} emissive="#FF9A50" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* ---------- REAR SECTION (cut away: +z wall and roof removed) ---------- */}
      {/* floor slab + carpet */}
      <RBox size={[CUT - L0, 0.1, W * 2]} r={0.02} color={P.cut} position={[(CUT + L0) / 2, FLOOR - 0.05, 0]} />
      <RBox size={[CUT + 1.4, 0.012, W * 2 - 0.1]} r={0.004} color={P.carpet} position={[(CUT - 1.4) / 2, FLOOR + 0.006, 0]} rough={0.9} />
      {/* far (-z) side wall with windows */}
      <RBox size={[CUT - L0, ROOF - 0.22, 0.06]} r={0.02} color={P.busCream} position={[(CUT + L0) / 2, (ROOF + 0.22) / 2, -W + 0.03]} />
      {[-0.95, -0.42].map((x) => (
        <RBox key={x} size={[0.44, winY1 - winY0, 0.02]} r={0.04} color="#24375A" position={[x, (winY0 + winY1) / 2, -W + 0.07]} rough={0.3} emissive="#6E7FB8" emissiveIntensity={0.25} />
      ))}
      {/* cut edges (coral) on far wall top */}
      <RBox size={[CUT - L0, 0.04, 0.08]} r={0.015} color={P.cut} position={[(CUT + L0) / 2, ROOF - 0.01, -W + 0.03]} />
      {/* rear wall */}
      <RBox size={[0.08, ROOF - 0.22, 0.58]} r={0.04} color={P.busCream} position={[L0 + 0.04, (ROOF + 0.22) / 2, -0.31]} />
      <RBox size={[0.08, 0.36, W * 2]} r={0.04} color={P.busCream} position={[L0 + 0.04, 0.4, 0]} />
      <RBox size={[0.1, 0.04, 0.58]} r={0.015} color={P.cut} position={[L0 + 0.04, ROOF - 0.01, -0.31]} />
      <RBox size={[0.1, ROOF - 0.58, 0.04]} r={0.015} color={P.cut} position={[L0 + 0.04, (ROOF + 0.58) / 2, -0.03]} />
      <RBox size={[0.1, 0.04, 0.62]} r={0.015} color={P.cut} position={[L0 + 0.04, 0.6, 0.29]} />
      {/* rear window + tail lights (outside, -x face) */}
      <RBox size={[0.02, 0.42, 0.42]} r={0.04} color={P.glass} position={[L0 - 0.002, 1.42, -0.3]} rough={0.3} />
      {[-0.46].map((z) => (
        <RBox key={z} size={[0.03, 0.34, 0.1]} r={0.03} color="#C0392B" position={[L0 - 0.004, 0.72, z]} emissive="#FF3B2F" emissiveIntensity={1.6} />
      ))}
      <RBox size={[0.1, 0.12, 1.24]} r={0.05} color="#2A2F36" position={[L0 - 0.02, 0.3, 0]} />
      {/* teal lower band on rear wall */}
      <RBox size={[0.02, 0.2, W * 2 - 0.06]} r={0.01} color={P.busTeal} position={[L0 - 0.003, 0.36, 0]} />

      {/* seats + passengers in the open section */}
      <Seat x={-0.5} z={-0.3} />
      <Seat x={-1.05} z={-0.3} />
      <Seat x={-0.5} z={0.3} />
      <Seat x={-1.05} z={0.3} />
      <ToyPassenger x={-0.47} z={-0.3} shirt={P.busHoney} />
      <ToyPassenger x={-1.02} z={0.3} shirt={P.busTeal} />

      {/* ---------- TOILET CUBICLE (~1 m², rear corner) ---------- */}
      <mesh position={[-1.82, FLOOR + 0.008, 0.27]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial map={tileTex} roughness={0.55} />
      </mesh>
      {/* partition toward aisle (z = -0.03) with mirror + sink */}
      <RBox size={[0.84, 1.0, 0.04]} r={0.015} color={P.cubicle} position={[-1.82, FLOOR + 0.5, -0.03]} />
      <RBox size={[0.26, 0.22, 0.012]} r={0.02} color="#B9D7E6" position={[-1.6, FLOOR + 0.72, -0.004]} rough={0.2} emissive="#9CC7DA" emissiveIntensity={0.15} />
      <RBox size={[0.24, 0.06, 0.14]} r={0.025} color={P.porcelain} position={[-1.6, FLOOR + 0.48, 0.06]} rough={0.4} />
      <Cyl r={0.012} h={0.08} color={P.hub} position={[-1.6, FLOOR + 0.54, 0.02]} rough={0.5} seg={10} />
      {/* front partition (x = -1.4) with door opening + open teal door */}
      <RBox size={[0.04, 1.0, 0.3]} r={0.015} color={P.cubicle} position={[-1.4, FLOOR + 0.5, 0.43]} />
      <RBox size={[0.04, 0.16, 0.6]} r={0.015} color={P.cubicle} position={[-1.4, FLOOR + 0.92, 0.27]} />
      <group position={[-1.4, FLOOR + 0.42, -0.01]} rotation={[0, -1.05, 0]}>
        <RBox size={[0.035, 0.82, 0.29]} r={0.015} color={P.door} position={[0, 0, 0.145]} />
        {/* generic door sticker (rule hint, unreadable at cover scale) */}
        <RBox size={[0.006, 0.12, 0.16]} r={0.01} color={P.paper} position={[0.02, 0.18, 0.15]} rough={0.9} />
        <RBox size={[0.008, 0.035, 0.035]} r={0.012} color={P.busCoral} position={[0.022, 0.21, 0.15]} />
      </group>
      {/* toilet: seated bowl, lid up */}
      <group position={[-1.98, FLOOR, 0.3]}>
        <Cyl r={0.085} r2={0.1} h={0.2} color={P.porcelain} position={[0, 0.1, 0]} rough={0.35} />
        <mesh position={[0.02, 0.21, 0]} scale={[1.25, 0.32, 1]} castShadow>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshStandardMaterial color={P.porcelain} roughness={0.35} />
        </mesh>
        <mesh position={[0.03, 0.255, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]}>
          <torusGeometry args={[0.1, 0.022, 10, 28]} />
          <meshStandardMaterial color="#E9E3D8" roughness={0.5} />
        </mesh>
        <RBox size={[0.03, 0.3, 0.26]} r={0.02} color="#E9E3D8" position={[-0.12, 0.42, 0]} rotation={[0, 0, 0.12]} rough={0.5} />
      </group>
      {/* small water bucket + sprayer */}
      <Cyl r={0.06} r2={0.05} h={0.12} color={P.door} position={[-1.62, FLOOR + 0.06, 0.45]} rough={0.6} />
      <Cyl r={0.012} h={0.2} color={P.hub} position={[-2.18, FLOOR + 0.4, 0.12]} rough={0.5} seg={8} />
      {/* flush-water tank (small, separate) high on the rear wall */}
      <group position={[-2.1, FLOOR + 0.88, 0.3]}>
        <RBox size={[0.18, 0.26, 0.46]} r={0.05} color="#E8F1F4" rough={0.45} opacity={0.92} />
        <RBox size={[0.185, 0.14, 0.44]} r={0.04} color="#7CC3DA" position={[0, -0.05, 0]} rough={0.3} emissive="#4FA6C4" emissiveIntensity={0.25} opacity={0.85} />
        <Cyl r={0.016} h={0.36} color={P.pipe} position={[0.05, -0.3, -0.1]} rough={0.5} seg={10} />
      </group>
      {/* cubicle ceiling lamp */}
      <RBox size={[0.3, 0.03, 0.08]} r={0.012} color="#FFF6E0" position={[-1.8, ROOF - 0.12, -0.02]} emissive="#FFE9B8" emissiveIntensity={2} />
      <pointLight position={[-1.8, ROOF - 0.25, 0.25]} color="#FFE2B0" intensity={1.2} distance={2.2} decay={2} />
      <pointLight position={[-0.8, ROOF - 0.2, 0]} color="#FFC98A" intensity={1.0} distance={2.4} decay={2} />

      {/* ---------- UNDER-FLOOR (open on +z): engine, luggage, drain ---------- */}
      {/* chassis rails */}
      <RBox size={[CUT - L0, 0.07, 0.07]} r={0.02} color="#2A2F36" position={[(CUT + L0) / 2, 0.52, -0.3]} />
      <RBox size={[CUT - L0, 0.07, 0.07]} r={0.02} color="#2A2F36" position={[(CUT + L0) / 2, 0.52, 0.3]} />
      {/* far skirt */}
      <RBox size={[CUT - L0, 0.4, 0.05]} r={0.015} color={P.busTeal} position={[(CUT + L0) / 2, 0.4, -W + 0.03]} />
      {/* rear engine block */}
      <group position={[-2.08, 0.38, 0]}>
        <RBox size={[0.3, 0.3, 0.9]} r={0.05} color="#4A525C" rough={0.7} />
        <Cyl r={0.1} h={0.04} color="#2A2F36" position={[0.0, 0.0, 0.47]} rotation={[Math.PI / 2, 0, 0]} />
        <RBox size={[0.22, 0.06, 0.6]} r={0.02} color="#6B747E" position={[0, 0.17, 0]} />
      </group>
      {/* luggage bay: already full */}
      <Suitcase pos={[-0.72, 0.36, 0.12]} size={[0.3, 0.26, 0.42]} color={P.busHoney} rot={0.05} />
      <Suitcase pos={[-0.38, 0.33, 0.2]} size={[0.26, 0.2, 0.34]} color={P.busCoral} rot={-0.08} />
      <Suitcase pos={[-0.4, 0.33, -0.22]} size={[0.28, 0.2, 0.32]} color="#6C5B9C" rot={0.1} />
      {/* drain: short pipe straight through the floor, hose open to the road (no holding tank) */}
      <Cyl r={0.03} h={0.36} color={P.pipe} position={[-1.86, FLOOR - 0.12, 0.3]} rough={0.5} seg={14} />
      <mesh position={[-1.86, 0.45, 0.3]} castShadow>
        <torusGeometry args={[0.06, 0.03, 10, 20, Math.PI / 2]} />
        <meshStandardMaterial color="#3B4148" roughness={0.75} />
      </mesh>
      <Cyl r={0.03} h={0.24} color="#3B4148" position={[-1.8, 0.33, 0.36]} rotation={[0.35, 0, 0]} rough={0.75} seg={14} />
      <Cyl r={0.036} h={0.04} color={P.busCoral} position={[-1.8, 0.21, 0.4]} rotation={[0.35, 0, 0]} rough={0.6} seg={14} />
      {/* clear drops: one falling, a trail left on the asphalt behind the moving bus */}
      <Drop pos={[-1.8, 0.13, 0.42]} s={0.035} />
      <Drop pos={[-1.83, 0.045, 0.43]} s={0.08} flat />
      <Drop pos={[-2.3, 0.045, 0.4]} s={0.07} flat />
      <Drop pos={[-2.8, 0.045, 0.45]} s={0.075} flat />
      <Drop pos={[-3.3, 0.045, 0.38]} s={0.06} flat />
      <Drop pos={[-3.8, 0.045, 0.43]} s={0.065} flat />

      {/* wheels */}
      <Wheel x={1.55} z={0.5} />
      <Wheel x={1.55} z={-0.5} />
      <Wheel x={-1.25} z={0.5} />
      <Wheel x={-1.25} z={-0.5} />
      {/* rear fender over the open wheel */}
      <RBox size={[0.74, 0.05, 0.3]} r={0.02} color={P.busTeal} position={[-1.25, 0.64, 0.47]} />
      {/* ground contact shadow */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.9, 1.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const BUS_BOUNDS = { L0, L1, FLOOR, ROOF, W, CUT } as const;
