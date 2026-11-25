// EP037 film hero: a longer toy AKAP coach (generic livery, no operator name) with the rear
// section cut open. Local frame: x = length (front +x), y = up from road, z = width (+z = cut side).
// Facts follow research/RESEARCH_REPORT.md "Saran visual akurat": ~1 m² cubicle at the rear,
// separate small flush tank, short drain through the floor to an open hose (most AKAP buses),
// under-floor full (luggage, diesel tank, rear engine); bio tank only as the "sebagian bus" variant.
import React from "react";
import { Cyl, P, RBox, V3, useCanvasTexture } from "./parts.tsx";

export const BUS = {
  L0: -3.2,
  L1: 3.2,
  CUT: -1.2,
  FLOOR: 0.66,
  ROOF: 1.8,
  W: 0.6,
  /** door on the cubicle's front partition (faces +x) */
  doorX: -2.3,
  doorZ0: 0.04,
  doorZ1: 0.32,
  toiletX: -2.68,
  pipeX: -2.6,
  hoseEnd: [-2.52, 0.2, 0.38] as V3,
  tankBox: { x0: -2.8, x1: -2.24, y0: 0.2, y1: 0.56, z0: -0.12, z1: 0.5 },
  flushTank: [-3.04, 1.52, 0.3] as V3,
  wheelR: 0.3,
  axleF: 2.3,
  axleR: -1.9,
};

export type StickerMode = "base" | "hl1" | "hl2" | "bio";

export type BusState = {
  /** wheel spin angle (rad) */
  spin: number;
  /** body roll (rad) */
  roll: number;
  /** body pitch (rad, brake dive) */
  pitch: number;
  sticker: StickerMode;
  /** 0..1 how see-through the near (+z) lower skirt of the front block is (1 = solid) */
  skirt: number;
  /** 0..1 glow on luggage / diesel tank / engine (payoff highlights) */
  hiLuggage: number;
  hiFuel: number;
  hiEngine: number;
  /** 0..1 glow travelling down the drain: toilet, pipe, hose */
  glowToilet: number;
  glowPipe: number;
  glowHose: number;
  /** flush water flow 0..1 */
  flush: number;
  /** bio tank slide-in 0..1 (0 = absent, hose shown) */
  bio: number;
  /** bio vent pipe growth 0..1 */
  vent: number;
  /** bacteria wiggle phase (s) */
  t: number;
  /** toy standing in the cubicle (lean in rad), null = hidden */
  standee: number | null;
  /** under-floor fill light (always mounted so the light count never changes) */
  kolongLight: number;
  kolongX: number;
};

const glowMat = (base: string, g: number) => ({ color: base, emissive: P.busHoney, emissiveIntensity: g * 1.4 });

const Wheel: React.FC<{ x: number; z: number; spin: number }> = ({ x, z, spin }) => (
  <group position={[x, BUS.wheelR, z]} rotation={[Math.PI / 2, spin, 0]}>
    <Cyl r={0.3} h={0.22} color={P.tyre} rough={0.85} seg={36} />
    <Cyl r={0.17} h={0.23} color={P.hub} rough={0.55} seg={24} />
    {[0, 1, 2, 3, 4].map((i) => (
      <Cyl key={i} r={0.022} h={0.235} color="#7D858D" position={[Math.cos((i * 2 * Math.PI) / 5) * 0.11, 0, Math.sin((i * 2 * Math.PI) / 5) * 0.11]} seg={8} />
    ))}
    <Cyl r={0.055} h={0.245} color={P.busHoney} rough={0.6} seg={16} />
  </group>
);

const Seat: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, BUS.FLOOR, z]}>
    <RBox size={[0.12, 0.2, 0.12]} r={0.02} color="#2A2F36" position={[0, 0.1, 0]} />
    <RBox size={[0.36, 0.1, 0.42]} r={0.045} color={P.seat} position={[0.02, 0.24, 0]} rough={0.84} />
    <RBox size={[0.11, 0.52, 0.42]} r={0.05} color={P.seat} position={[-0.15, 0.52, 0]} rotation={[0, 0, 0.12]} rough={0.84} />
    <RBox size={[0.125, 0.14, 0.36]} r={0.04} color={P.seatCover} position={[-0.185, 0.76, 0]} rotation={[0, 0, 0.12]} rough={0.9} />
  </group>
);

/** Blocky toy figure (no real face). */
export const Toy: React.FC<{ pos: V3; shirt: string; seated?: boolean; rotY?: number; lean?: number }> = ({ pos, shirt, seated = true, rotY = 0, lean = 0 }) => (
  <group position={pos} rotation={[lean, rotY, 0]}>
    {seated ? null : (
      <>
        <RBox size={[0.08, 0.26, 0.08]} r={0.03} color={P.carpet} position={[0, 0.13, 0.06]} />
        <RBox size={[0.08, 0.26, 0.08]} r={0.03} color={P.carpet} position={[0, 0.13, -0.06]} />
      </>
    )}
    <group position={[0, seated ? 0.3 : 0.26, 0]}>
      <RBox size={[0.2, 0.3, 0.26]} r={0.06} color={shirt} position={[-0.02, 0.17, 0]} rough={0.74} />
      <RBox size={[0.22, 0.2, 0.24]} r={0.07} color="#F6C8A4" position={[0, 0.43, 0]} rough={0.72} />
      <RBox size={[0.24, 0.08, 0.26]} r={0.04} color="#382315" position={[-0.01, 0.53, 0]} rough={0.8} />
      {[0.06, -0.06].map((z) => (
        <mesh key={z} position={[0.11, 0.45, z]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color="#111827" roughness={0.3} />
        </mesh>
      ))}
      {seated ? <RBox size={[0.26, 0.09, 0.22]} r={0.04} color={P.carpet} position={[0.12, 0.03, 0]} rough={0.8} /> : null}
      {/* mitten arms */}
      <RBox size={[0.07, 0.22, 0.07]} r={0.03} color={shirt} position={[0, 0.16, 0.16]} rotation={[seated ? 0 : -0.5, 0, 0]} />
      <RBox size={[0.07, 0.22, 0.07]} r={0.03} color={shirt} position={[0, 0.16, -0.16]} rotation={[seated ? 0 : 0.5, 0, 0]} />
    </group>
  </group>
);

const Suitcase: React.FC<{ pos: V3; size: V3; color: string; rot?: number; glow: number }> = ({ pos, size, color, rot = 0, glow }) => (
  <group position={[pos[0], pos[1] + glow * 0.03, pos[2]]} rotation={[0, rot, 0]} scale={1 + glow * 0.06}>
    <RBox size={size} r={0.035} color={color} rough={0.74} emissive="#FFF2D6" emissiveIntensity={glow * 0.18} />
    <RBox size={[size[0] * 0.4, 0.03, 0.03]} r={0.012} color="#2A2F36" position={[0, size[1] / 2 + 0.012, 0]} />
  </group>
);

/** Door sticker: generic rule text, no operator branding. */
const Sticker: React.FC<{ mode: StickerMode }> = ({ mode }) => {
  const tex = useCanvasTexture(
    480,
    640,
    (ctx) => {
      const bio = mode === "bio";
      ctx.fillStyle = "#FBF6EA";
      ctx.fillRect(0, 0, 480, 640);
      ctx.fillStyle = bio ? "#2F7D4F" : P.busCoral;
      ctx.fillRect(0, 0, 480, 96);
      ctx.fillStyle = "#FFF6E6";
      ctx.font = "62px 'Lilita One', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(bio ? "BIO TANK" : "PERHATIAN", 240, 72);
      const block = (lines: string[], y0: number, hl: boolean) => {
        if (hl) {
          ctx.fillStyle = "rgba(240,196,70,0.75)";
          ctx.fillRect(22, y0 - 58, 436, lines.length * 64 + 18);
        }
        ctx.fillStyle = P.ink;
        ctx.font = "56px 'Lilita One', sans-serif";
        lines.forEach((l, i) => ctx.fillText(l, 240, y0 + i * 64));
      };
      if (bio) {
        block(["TOILET BOLEH", "DIPAKAI LEBIH", "LELUASA"], 200, false);
        ctx.strokeStyle = "#2F7D4F";
        ctx.lineWidth = 22;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(170, 500);
        ctx.lineTo(225, 555);
        ctx.lineTo(320, 440);
        ctx.stroke();
      } else {
        block(["HANYA UNTUK", "BUANG AIR KECIL"], 180, mode === "hl1" || mode === "hl2");
        ctx.fillStyle = P.busCoral;
        ctx.beginPath();
        ctx.arc(240, 330, 12, 0, Math.PI * 2);
        ctx.fill();
        block(["GUNAKAN SAAT", "BUS BERJALAN"], 430, mode === "hl2");
        // small bus-moving pictogram
        ctx.fillStyle = P.busTeal;
        ctx.fillRect(170, 548, 130, 50);
        ctx.fillStyle = "#FBF6EA";
        ctx.fillRect(184, 558, 26, 18);
        ctx.fillRect(218, 558, 26, 18);
        ctx.fillRect(252, 558, 26, 18);
        ctx.fillStyle = P.ink;
        ctx.beginPath();
        ctx.arc(196, 600, 11, 0, Math.PI * 2);
        ctx.arc(276, 600, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = P.busTeal;
        ctx.lineWidth = 7;
        [560, 576, 592].forEach((y) => {
          ctx.beginPath();
          ctx.moveTo(312, y);
          ctx.lineTo(346, y);
          ctx.stroke();
        });
      }
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 474, 634);
    },
    [mode],
  );
  return (
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.2, 0.267]} />
      <meshStandardMaterial map={tex} roughness={0.85} />
    </mesh>
  );
};

/** Clay bacteria blob (cute icon, wiggles). */
const Bacterium: React.FC<{ pos: V3; t: number; ph: number; c: string }> = ({ pos, t, ph, c }) => {
  const k = 1 + Math.sin(t * 5 + ph) * 0.12;
  return (
    <group position={pos} rotation={[0, 0, Math.sin(t * 2 + ph) * 0.4]}>
      <mesh scale={[0.05 * k, 0.03 / k, 0.03]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={c} roughness={0.7} emissive={c} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
};

export const FilmBus: React.FC<{ s: BusState }> = ({ s }) => {
  const { L0, L1, CUT, FLOOR, ROOF, W } = BUS;
  const sideTex = useCanvasTexture(1024, 512, (ctx) => {
    ctx.fillStyle = P.busCream;
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = P.busCoral;
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(1024, 90);
    ctx.lineTo(1024, 150);
    ctx.lineTo(0, 196);
    ctx.fill();
    ctx.fillStyle = P.busHoney;
    ctx.beginPath();
    ctx.moveTo(0, 204);
    ctx.lineTo(1024, 160);
    ctx.lineTo(1024, 180);
    ctx.lineTo(0, 220);
    ctx.fill();
  });
  const tileTex = useCanvasTexture(256, 256, (ctx) => {
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        ctx.fillStyle = (i + j) % 2 ? "#CFE3E8" : "#A9C9D2";
        ctx.fillRect(i * 32, j * 32, 32, 32);
      }
  });
  const winY0 = 1.02;
  const winY1 = 1.56;
  const frontLen = L1 - CUT;
  const bioIn = s.bio;
  const bioOff = (1 - bioIn) * 1.6; // slides in from +z
  const tb = BUS.tankBox;

  return (
    <group rotation={[s.roll, 0, s.pitch]}>
      {/* ---------- FRONT BLOCK (upper body) ---------- */}
      <RBox size={[frontLen, ROOF - FLOOR + 0.02, W * 2]} r={0.14} color={P.busCream} position={[(L1 + CUT) / 2, (ROOF + FLOOR) / 2, 0]} />
      {/* livery belt below windows */}
      <mesh position={[(L1 + CUT) / 2 - 0.05, 0.86, W + 0.002]}>
        <planeGeometry args={[frontLen - 0.3, 0.4]} />
        <meshStandardMaterial map={sideTex} roughness={0.74} metalness={0.03} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const x0 = CUT + 0.14 + i * 0.56;
        return (
          <RBox key={i} size={[0.5, winY1 - winY0, 0.03]} r={0.05} color="#22324D" position={[x0 + 0.25, (winY0 + winY1) / 2, W + 0.006]} rough={0.15} emissive="#FFC07A" emissiveIntensity={0.07} />
        );
      })}
      {/* passenger door (front, +z) */}
      <RBox size={[0.36, 1.1, 0.03]} r={0.04} color="#22324D" position={[2.75, 1.0, W + 0.008]} rough={0.2} emissive="#FFC07A" emissiveIntensity={0.05} />
      {/* windshield + destination board (blank) */}
      <RBox size={[0.04, 0.78, 1.04]} r={0.05} color={P.glass} position={[L1 + 0.002, 1.28, 0]} rough={0.3} emissive="#FFB862" emissiveIntensity={0.12} />
      <RBox size={[0.04, 0.12, 0.84]} r={0.03} color={P.busHoney} position={[L1 + 0.006, 1.72, 0]} emissive={P.busHoney} emissiveIntensity={0.6} />
      {[-0.4, 0.4].map((z) => (
        <RBox key={z} size={[0.04, 0.09, 0.24]} r={0.03} color="#FFF3D0" position={[L1 + 0.01, 0.52, z]} emissive="#FFE7A8" emissiveIntensity={2.2} />
      ))}
      <RBox size={[0.1, 0.12, 1.24]} r={0.05} color="#2A2F36" position={[L1 + 0.02, 0.3, 0]} />
      <RBox size={[1.8, 0.14, 0.84]} r={0.06} color={P.busCream} position={[1.2, ROOF + 0.06, 0]} />
      <RBox size={[1.6, 0.03, 0.6]} r={0.012} color="#9AA3AB" position={[1.2, ROOF + 0.14, 0]} />
      {/* front-block cross-section face */}
      <group position={[CUT - 0.003, (ROOF + FLOOR) / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[W * 2 - 0.02, ROOF - FLOOR - 0.02]} />
          <meshStandardMaterial color={P.cut} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.02, 0.002]}>
          <planeGeometry args={[W * 2 - 0.12, ROOF - FLOOR - 0.16]} />
          <meshStandardMaterial color="#3A2620" roughness={0.9} emissive="#FF9A50" emissiveIntensity={0.1} />
        </mesh>
      </group>
      {/* floor slab, full length */}
      <RBox size={[L1 - L0, 0.1, W * 2]} r={0.02} color={P.cut} position={[(L1 + L0) / 2, FLOOR - 0.05, 0]} />
      {/* far (-z) lower skirt (solid) and near (+z) lower skirt under the front block (fades for x-ray) */}
      <RBox size={[L1 - L0, 0.42, 0.05]} r={0.015} color={P.busTeal} position={[(L1 + L0) / 2, 0.41, -W + 0.03]} />
      {s.skirt > 0.02 ? (
        <RBox size={[L1 - CUT - 0.1, 0.42, 0.05]} r={0.015} color={P.busTeal} position={[(L1 + CUT) / 2 + 0.05, 0.41, W - 0.03]} opacity={s.skirt < 0.99 ? s.skirt : undefined} />
      ) : null}
      {/* wheel arches */}
      {[BUS.axleF].map((x) => (
        <mesh key={x} position={[x, 0.3, W + 0.001]}>
          <circleGeometry args={[0.37, 32, 0, Math.PI]} />
          <meshStandardMaterial color="#14171B" roughness={0.9} />
        </mesh>
      ))}

      {/* ---------- REAR SECTION (cut open) ---------- */}
      <RBox size={[CUT + 2.32, 0.012, W * 2 - 0.1]} r={0.004} color={P.carpet} position={[(CUT - 2.32) / 2, FLOOR + 0.006, 0]} rough={0.9} />
      <RBox size={[CUT - L0, ROOF - FLOOR, 0.06]} r={0.02} color={P.busCream} position={[(CUT + L0) / 2, (ROOF + FLOOR) / 2, -W + 0.03]} />
      {[-1.5, -2.05].map((x) => (
        <RBox key={x} size={[0.44, winY1 - winY0, 0.02]} r={0.04} color="#24375A" position={[x, (winY0 + winY1) / 2, -W + 0.07]} rough={0.3} emissive="#6E7FB8" emissiveIntensity={0.25} />
      ))}
      <RBox size={[CUT - L0, 0.04, 0.08]} r={0.015} color={P.cut} position={[(CUT + L0) / 2, ROOF - 0.01, -W + 0.03]} />
      {/* rear wall: full lower band, upper part only behind the aisle partition */}
      <RBox size={[0.08, ROOF - 0.58, 0.58]} r={0.04} color={P.busCream} position={[L0 + 0.04, (ROOF + 0.58) / 2, -0.31]} />
      <RBox size={[0.08, 0.44, W * 2]} r={0.04} color={P.busCream} position={[L0 + 0.04, 0.4, 0]} />
      <RBox size={[0.1, 0.04, 0.58]} r={0.015} color={P.cut} position={[L0 + 0.04, ROOF - 0.01, -0.31]} />
      <RBox size={[0.1, ROOF - 0.62, 0.04]} r={0.015} color={P.cut} position={[L0 + 0.04, (ROOF + 0.62) / 2, -0.03]} />
      <RBox size={[0.1, 0.04, 0.62]} r={0.015} color={P.cut} position={[L0 + 0.04, 0.62, 0.29]} />
      <RBox size={[0.02, 0.42, 0.42]} r={0.04} color={P.glass} position={[L0 - 0.002, 1.42, -0.3]} rough={0.3} />
      <RBox size={[0.03, 0.3, 0.1]} r={0.03} color="#C0392B" position={[L0 - 0.004, 0.72, -0.46]} emissive="#FF3B2F" emissiveIntensity={1.6} />
      <RBox size={[0.1, 0.12, 1.24]} r={0.05} color="#2A2F36" position={[L0 - 0.02, 0.26, 0]} />
      <RBox size={[0.02, 0.18, W * 2 - 0.06]} r={0.01} color={P.busTeal} position={[L0 - 0.003, 0.38, 0]} />

      {/* seats (aisle-side row) */}
      <Seat x={-1.45} z={-0.33} />
      <Toy pos={[-1.42, FLOOR, -0.33]} shirt={P.busHoney} />

      {/* ---------- TOILET CUBICLE (~1 m²) ---------- */}
      <mesh position={[-2.71, FLOOR + 0.008, 0.27]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial map={tileTex} roughness={0.55} />
      </mesh>
      <RBox size={[0.86, 1.0, 0.04]} r={0.015} color={P.cubicle} position={[-2.72, FLOOR + 0.5, -0.03]} />
      <RBox size={[0.26, 0.22, 0.012]} r={0.02} color="#B9D7E6" position={[-2.5, FLOOR + 0.72, -0.004]} rough={0.2} emissive="#9CC7DA" emissiveIntensity={0.15} />
      <RBox size={[0.24, 0.06, 0.14]} r={0.025} color={P.porcelain} position={[-2.5, FLOOR + 0.48, 0.06]} rough={0.4} />
      {/* front partition with closed teal door + sticker (faces +x) */}
      <RBox size={[0.04, 1.0, 0.25]} r={0.015} color={P.cubicle} position={[BUS.doorX, FLOOR + 0.5, 0.445]} />
      <RBox size={[0.04, 0.16, 0.62]} r={0.015} color={P.cubicle} position={[BUS.doorX, FLOOR + 0.92, 0.27]} />
      <RBox size={[0.035, 0.84, BUS.doorZ1 - BUS.doorZ0]} r={0.015} color={P.door} position={[BUS.doorX + 0.005, FLOOR + 0.42, (BUS.doorZ0 + BUS.doorZ1) / 2]} />
      <Cyl r={0.014} h={0.06} color={P.hub} position={[BUS.doorX + 0.04, FLOOR + 0.45, BUS.doorZ0 + 0.04]} rotation={[0, 0, Math.PI / 2]} seg={10} />
      <group position={[BUS.doorX + 0.026, FLOOR + 0.6, (BUS.doorZ0 + BUS.doorZ1) / 2]}>
        <Sticker mode={s.sticker} />
      </group>
      {/* toilet */}
      <group position={[BUS.toiletX, FLOOR, 0.3]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.1, 0.2, 24]} />
          <meshStandardMaterial {...glowMat(P.porcelain, s.glowToilet)} roughness={0.35} />
        </mesh>
        <mesh position={[0.02, 0.21, 0]} scale={[1.25, 0.32, 1]} castShadow>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshStandardMaterial {...glowMat(P.porcelain, s.glowToilet)} roughness={0.35} />
        </mesh>
        <mesh position={[0.03, 0.255, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]}>
          <torusGeometry args={[0.1, 0.022, 10, 28]} />
          <meshStandardMaterial color="#E9E3D8" roughness={0.5} />
        </mesh>
        <RBox size={[0.03, 0.3, 0.26]} r={0.02} color="#E9E3D8" position={[-0.12, 0.42, 0]} rotation={[0, 0, 0.12]} rough={0.5} />
      </group>
      <Cyl r={0.06} r2={0.05} h={0.12} color={P.door} position={[-2.45, FLOOR + 0.06, 0.47]} rough={0.6} />
      {/* flush tank + feed line with moving water dashes */}
      <group position={BUS.flushTank}>
        <RBox size={[0.18, 0.26, 0.46]} r={0.05} color="#E8F1F4" rough={0.45} opacity={0.92} />
        <RBox size={[0.185, 0.14 - s.flush * 0.03, 0.44]} r={0.04} color="#7CC3DA" position={[0, -0.05 - s.flush * 0.015, 0]} rough={0.3} emissive="#4FA6C4" emissiveIntensity={0.25 + s.flush * 0.5} opacity={0.85} />
        <Cyl r={0.016} h={0.36} color={P.pipe} position={[0.05, -0.3, -0.1]} rough={0.5} seg={10} />
        {s.flush > 0
          ? [0, 1, 2].map((i) => {
              const y = -0.14 - (((s.t * 1.2 + i / 3) % 1) * 0.34);
              return (
                <mesh key={i} position={[0.05, y, -0.1]}>
                  <sphereGeometry args={[0.022, 10, 10]} />
                  <meshStandardMaterial color="#9FE0F2" emissive="#5FC4E6" emissiveIntensity={1.2 * s.flush} transparent opacity={s.flush} />
                </mesh>
              );
            })
          : null}
      </group>
      {s.standee !== null ? <Toy pos={[-2.82, FLOOR, 0.12]} shirt={P.busTeal} seated={false} rotY={0} lean={s.standee} /> : null}
      <RBox size={[0.3, 0.03, 0.08]} r={0.012} color="#FFF6E0" position={[-2.7, ROOF - 0.12, -0.02]} emissive="#FFE9B8" emissiveIntensity={2} />
      <pointLight position={[-2.7, ROOF - 0.25, 0.25]} color="#FFE2B0" intensity={1.2} distance={2.2} decay={2} />
      <pointLight position={[-1.7, ROOF - 0.2, 0]} color="#FFC98A" intensity={1.0} distance={2.4} decay={2} />
      <pointLight position={[s.kolongX, 0.4, 1.15]} color="#FFF0DA" intensity={s.kolongLight} distance={3.2} decay={2} />

      {/* ---------- UNDER-FLOOR ---------- */}
      <RBox size={[L1 - L0, 0.07, 0.07]} r={0.02} color="#2A2F36" position={[(L1 + L0) / 2, 0.52, -0.3]} />
      <RBox size={[L1 - L0, 0.07, 0.07]} r={0.02} color="#2A2F36" position={[(L1 + L0) / 2, 0.52, 0.3]} />
      {/* rear engine */}
      <group position={[-2.98, 0.38, 0]} scale={1 + s.hiEngine * 0.05}>
        <RBox size={[0.36, 0.32, 0.9]} r={0.05} color="#6B747E" rough={0.62} emissive="#FFF2D6" emissiveIntensity={s.hiEngine * 0.18} />
        {/* cylinder-head ribs + fan + belt: reads as an engine */}
        {[-0.3, -0.15, 0, 0.15, 0.3].map((z) => (
          <RBox key={z} size={[0.3, 0.05, 0.08]} r={0.015} color="#8A939C" position={[0, 0.18, z]} />
        ))}
        <Cyl r={0.12} h={0.04} color="#2A2F36" position={[0.02, -0.02, 0.47]} rotation={[Math.PI / 2, 0, 0]} />
        <Cyl r={0.045} h={0.05} color={P.busCoral} position={[0.02, -0.02, 0.49]} rotation={[Math.PI / 2, 0, 0]} seg={14} />
        <RBox size={[0.06, 0.2, 0.02]} r={0.01} color="#3B4148" position={[0.02, -0.02, 0.5]} rotation={[0, 0, (s.t * 6) % Math.PI]} />
      </group>
      {/* diesel tank (between luggage bay and rear axle) */}
      <group position={[-1.25, 0.36, 0.1]} scale={1 + s.hiFuel * 0.06}>
        <Cyl r={0.15} h={0.6} color="#AEB6BE" rough={0.5} rotation={[0, 0, Math.PI / 2]} emissive="#FFF2D6" emissiveIntensity={s.hiFuel * 0.18} seg={28} />
        {[-0.18, 0.18].map((x) => (
          <Cyl key={x} r={0.158} h={0.035} color="#2A2F36" position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} seg={28} />
        ))}
        <Cyl r={0.04} h={0.07} color="#2A2F36" position={[0.12, 0.16, 0.06]} seg={14} />
      </group>
      {/* luggage bay: full */}
      <Suitcase pos={[-0.62, 0.36, 0.1]} size={[0.32, 0.3, 0.44]} color={P.busHoney} rot={0.05} glow={s.hiLuggage} />
      <Suitcase pos={[-0.22, 0.33, 0.18]} size={[0.3, 0.22, 0.36]} color={P.busCoral} rot={-0.08} glow={s.hiLuggage} />
      <Suitcase pos={[0.18, 0.36, 0.08]} size={[0.32, 0.3, 0.46]} color="#6C5B9C" rot={0.06} glow={s.hiLuggage} />
      <Suitcase pos={[0.58, 0.34, 0.16]} size={[0.3, 0.26, 0.4]} color={P.busTeal} rot={-0.04} glow={s.hiLuggage} />
      <Suitcase pos={[0.98, 0.36, 0.1]} size={[0.34, 0.3, 0.44]} color="#C9A86A" rot={0.03} glow={s.hiLuggage} />
      <Suitcase pos={[1.4, 0.33, 0.16]} size={[0.3, 0.22, 0.38]} color={P.busCoral} rot={0.1} glow={s.hiLuggage} />
      {/* drain: short pipe through the floor + hose open to the road */}
      <mesh position={[BUS.pipeX, FLOOR - 0.12, 0.3]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.36, 14]} />
        <meshStandardMaterial {...glowMat(P.pipe, s.glowPipe)} roughness={0.5} />
      </mesh>
      {bioIn < 0.98 ? (
        <group>
          <mesh position={[BUS.pipeX, 0.45, 0.3]} castShadow>
            <sphereGeometry args={[0.042, 14, 12]} />
            <meshStandardMaterial {...glowMat("#3B4148", s.glowHose)} roughness={0.75} />
          </mesh>
          <mesh position={[(BUS.pipeX + BUS.hoseEnd[0]) / 2, 0.33, 0.34]} rotation={[0.35, 0, -0.3]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.26, 14]} />
            <meshStandardMaterial {...glowMat("#3B4148", s.glowHose)} roughness={0.75} />
          </mesh>
          <mesh position={BUS.hoseEnd} rotation={[0.35, 0, -0.3]}>
            <cylinderGeometry args={[0.038, 0.038, 0.04, 14]} />
            <meshStandardMaterial color={P.busCoral} roughness={0.6} emissive={P.busCoral} emissiveIntensity={s.glowHose} />
          </mesh>
        </group>
      ) : null}
      {/* bio tank variant (sebagian bus): closed tank, bacteria window, vent pipe up */}
      {bioIn > 0.001 ? (
        <group position={[0, 0, bioOff]}>
          <RBox
            size={[tb.x1 - tb.x0, tb.y1 - tb.y0, tb.z1 - tb.z0]}
            r={0.06}
            color="#4E8F62"
            position={[(tb.x0 + tb.x1) / 2, (tb.y0 + tb.y1) / 2, (tb.z0 + tb.z1) / 2]}
            rough={0.7}
          />
          <RBox size={[0.36, 0.2, 0.01]} r={0.03} color="#DFF2E4" position={[(tb.x0 + tb.x1) / 2, (tb.y0 + tb.y1) / 2, tb.z1 + 0.006]} rough={0.3} emissive="#BFE8C8" emissiveIntensity={0.25} />
          <Bacterium pos={[(tb.x0 + tb.x1) / 2 - 0.09, 0.4, tb.z1 + 0.03]} t={s.t} ph={0} c="#E5A93C" />
          <Bacterium pos={[(tb.x0 + tb.x1) / 2 + 0.04, 0.35, tb.z1 + 0.03]} t={s.t} ph={1.7} c="#D95D39" />
          <Bacterium pos={[(tb.x0 + tb.x1) / 2 + 0.11, 0.43, tb.z1 + 0.03]} t={s.t} ph={3.1} c="#6C5B9C" />
        </group>
      ) : null}
      {s.vent > 0.001 ? (
        <group position={[L0 - 0.05, 0.56, 0.52]}>
          <mesh position={[0, (s.vent * (ROOF + 0.15 - 0.56)) / 2, 0]}>
            <cylinderGeometry args={[0.022, 0.022, Math.max(0.001, s.vent * (ROOF + 0.15 - 0.56)), 10]} />
            <meshStandardMaterial color="#6E9F7C" roughness={0.6} />
          </mesh>
          {s.vent > 0.98 ? <Cyl r={0.04} h={0.05} color="#6E9F7C" position={[0, ROOF + 0.15 - 0.56, 0]} seg={12} /> : null}
        </group>
      ) : null}

      {/* wheels */}
      <Wheel x={BUS.axleF} z={0.5} spin={s.spin} />
      <Wheel x={BUS.axleF} z={-0.5} spin={s.spin} />
      <Wheel x={BUS.axleR} z={0.5} spin={s.spin} />
      <Wheel x={BUS.axleR} z={-0.5} spin={s.spin} />
      <RBox size={[0.74, 0.05, 0.3]} r={0.02} color={P.busTeal} position={[BUS.axleR, 0.64, 0.47]} />
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.8, 1.5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
};
