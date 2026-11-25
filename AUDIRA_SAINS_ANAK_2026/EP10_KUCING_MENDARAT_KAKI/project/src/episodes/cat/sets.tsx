// EP10 — environments: night living room (real GLB props), Marey chronophotography strip, ANATOMIX lab.
import React, { useMemo } from "react";
import * as THREE from "three";
import { staticFile } from "remotion";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { ANATOMY_PALETTE as A } from "../../kits/anatomix/lib/palette";

const m = (f: string) => staticFile(`models/ep10/${f}.glb`);

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** A flat sign with text drawn on a canvas (brand plates, film-strip numbers). */
export const Board: React.FC<{
  text: string;
  sub?: string;
  width: number;
  color?: string;
  bg?: string;
  glow?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  opacity?: number;
}> = ({ text, sub, width, color = A.hud, bg = "rgba(3,20,26,0.85)", glow = false, position, rotation, opacity = 1 }) => {
  const tex = useMemo(
    () =>
      canvasTex(1024, 320, (g) => {
        g.fillStyle = bg;
        g.beginPath();
        g.roundRect(8, 8, 1008, 304, 36);
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 8;
        g.stroke();
        g.fillStyle = color;
        g.textAlign = "center";
        g.font = `800 ${sub ? 130 : 150}px Inter, Arial, sans-serif`;
        g.fillText(text, 512, sub ? 170 : 215);
        if (sub) {
          g.font = "600 62px Inter, Arial, sans-serif";
          g.globalAlpha = 0.8;
          g.fillText(sub, 512, 262);
        }
      }),
    [text, sub, color, bg],
  );
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width * 0.3125]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={!glow} depthWrite={false} />
    </mesh>
  );
};

// deterministic speckle + streak texture (keeps big planes from reading flat)
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
export const grainTex = (base: string, opts: { seed?: number; planks?: number; grid?: number; gridColor?: string; repeat?: number } = {}) => {
  const r = rng(opts.seed ?? 7);
  const t = canvasTex(512, 512, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
      const v = r();
      g.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.02 + 0.05 * r()})` : `rgba(0,0,0,${0.04 + 0.08 * r()})`;
      g.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3);
    }
    if (opts.planks) {
      const h = 512 / opts.planks;
      for (let i = 0; i < opts.planks; i++) {
        g.fillStyle = `rgba(0,0,0,${0.1 + 0.12 * r()})`;
        g.fillRect(0, i * h, 512, 3);
        for (let k = 0; k < 14; k++) {
          g.strokeStyle = `rgba(${r() > 0.5 ? "255,220,180" : "30,15,5"},0.10)`;
          g.lineWidth = 1 + r() * 2;
          const y = i * h + 6 + r() * (h - 10);
          g.beginPath();
          g.moveTo(0, y);
          g.bezierCurveTo(170, y + (r() - 0.5) * 8, 340, y + (r() - 0.5) * 8, 512, y);
          g.stroke();
        }
        g.fillStyle = "rgba(0,0,0,0.18)";
        g.fillRect(r() * 512, i * h, 3, h);
      }
    }
    if (opts.grid) {
      g.strokeStyle = opts.gridColor ?? "rgba(63,224,208,0.2)";
      g.lineWidth = 2;
      for (let i = 0; i <= 512; i += 512 / opts.grid) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i, 512);
        g.moveTo(0, i);
        g.lineTo(512, i);
        g.stroke();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(opts.repeat ?? 1, opts.repeat ?? 1);
  return t;
};

// ── night living room ───────────────────────────────────────────────────────
const wallTex = () =>
  canvasTex(512, 512, (g) => {
    g.fillStyle = "#2A3247";
    g.fillRect(0, 0, 512, 512);
    const r = rng(3);
    for (let i = 0; i < 6000; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${0.03 + 0.05 * r()})`;
      g.fillRect(r() * 512, r() * 512, 2, 2);
    }
    for (let x = 0; x < 512; x += 64) {
      g.fillStyle = "rgba(255,255,255,0.035)";
      g.fillRect(x, 0, 30, 512);
    }
  });

export const LivingRoom: React.FC<{ moon?: number }> = ({ moon = 1 }) => {
  const wall = useMemo(() => {
    const t = wallTex();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2);
    return t;
  }, []);
  const floor = useMemo(() => grainTex("#5A3E2B", { seed: 11, planks: 8, repeat: 5 }), []);
  return (
    <group>
      {/* floor + back wall + side wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={floor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.2, -1.6]} receiveShadow>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      <mesh position={[-3.4, 2.2, 1.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 4.4]} />
        <meshStandardMaterial map={wall} roughness={0.9} />
      </mesh>
      {/* window: cool moonlight square on the side wall */}
      <mesh position={[-3.38, 2.0, 2.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 1.6]} />
        <meshBasicMaterial color="#9DB8FF" toneMapped={false} transparent opacity={0.55 * moon} />
      </mesh>
      <AssetModel src={m("area-rug-5c56e2")} size={2.6} ground position={[0.2, 0.005, 0.6]} />
      <AssetModel src={m("alcove-bookcase-83894d")} size={2.1} ground position={[-1.15, 0, -1.25]} />
      <AssetModel src={m("lounge-sofa-c34b3e")} size={2.2} ground position={[1.9, 0, -0.95]} />
      <AssetModel src={m("floor-houseplant-8fad17")} size={1.2} ground position={[-2.6, 0, -0.9]} />
      <AssetModel src={m("arc-floor-lamp-fa0b5f")} size={2.0} ground position={[3.2, 0, -0.6]} rotation={[0, -0.6, 0]} />
      {/* brand inside the world: a framed print above the sofa */}
      <Board text="AUDIRA" sub="SAINS" width={1.1} position={[1.9, 2.25, -1.58]} bg="rgba(16,22,34,0.95)" color="#F2D6A2" />
      <pointLight position={[2.9, 1.75, -0.2]} intensity={6 * moon} distance={7} color="#FFB86B" castShadow shadow-mapSize={[1024, 1024]} />
    </group>
  );
};

// ── Marey chronophotography: dark backdrop + film strip frames ───────────────
export const FilmStrip: React.FC<{ frames: number; spacing: number; y: number; reveal: number }> = ({ frames, spacing, y, reveal }) => {
  const tex = useMemo(
    () =>
      canvasTex(256, 512, (g) => {
        g.fillStyle = "#14100B";
        g.fillRect(0, 0, 256, 512);
        g.fillStyle = "#E8D6B0";
        for (let i = 0; i < 8; i++) {
          g.fillRect(14, 18 + i * 62, 22, 34);
          g.fillRect(220, 18 + i * 62, 22, 34);
        }
        g.fillStyle = "#2B241A";
        g.fillRect(48, 40, 160, 432);
      }),
    [],
  );
  return (
    <group position={[0, y, -0.9]}>
      {Array.from({ length: frames }, (_, i) => {
        const x = (i - (frames - 1) / 2) * spacing;
        const k = Math.min(1, Math.max(0, reveal * frames - i));
        return (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <planeGeometry args={[spacing * 0.98, spacing * 1.96]} />
              <meshStandardMaterial map={tex} roughness={0.8} transparent opacity={0.35 + 0.65 * k} />
            </mesh>
            <Board text={`${i + 1}`} width={0.32} position={[0, -spacing * 0.86, 0.02]} bg="rgba(20,16,11,0.9)" color="#E8D6B0" opacity={k} />
          </group>
        );
      })}
    </group>
  );
};

// ── ANATOMIX lab: dark teal void, hologram plinth rings, back grid ───────────
export const Lab: React.FC<{ t: number; plinthY?: number }> = ({ t, plinthY = -0.05 }) => {
  const grid = useMemo(() => grainTex(A.void, { seed: 5, grid: 16, repeat: 3 }), []);
  const deck = useMemo(() => grainTex("#06222A", { seed: 9, grid: 8, gridColor: "rgba(63,224,208,0.12)", repeat: 4 }), []);
  return (
    <group>
      <mesh position={[0, 1.5, -2.6]}>
        <planeGeometry args={[14, 9]} />
        <meshBasicMaterial map={grid} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, plinthY - 0.06, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial map={deck} roughness={0.35} metalness={0.4} />
      </mesh>
      {[0.55, 0.75, 0.95].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, t * (0.3 + i * 0.15) * (i % 2 ? -1 : 1)]} position={[0, plinthY, 0]}>
          <ringGeometry args={[r, r + 0.012, 96, 1, 0, Math.PI * (1.4 + i * 0.2)]} />
          <meshBasicMaterial color={A.holo} toneMapped={false} transparent opacity={0.8 - i * 0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, plinthY - 0.03, 0]}>
        <cylinderGeometry args={[1.05, 1.15, 0.06, 64]} />
        <meshStandardMaterial color="#0B3A44" roughness={0.25} metalness={0.6} emissive={A.voidGlow} emissiveIntensity={0.25} />
      </mesh>
      {/* brand in the world: lab panel */}
      <Board text="AUDIRA · LAB" sub="SAINS" width={1.3} position={[1.6, 2.3, -2.4]} glow color={A.holo} opacity={0.85} />
    </group>
  );
};

/** partial ring arc (rotation indicator) around the body axis z */
export const Arc: React.FC<{ radius: number; angle: number; color: string; z: number }> = ({ radius, angle, color, z }) => (
  <group position={[0, 0, z]}>
    {angle > 0.01 && (
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[radius, radius * 0.045, 10, 80, angle]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    )}
    <mesh rotation={[0, 0, Math.PI / 2 + angle]} position={[Math.cos(Math.PI / 2 + angle) * radius, Math.sin(Math.PI / 2 + angle) * radius, 0]}>
      <coneGeometry args={[radius * 0.11, radius * 0.24, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  </group>
);

/** expanding shock ring on the floor */
export const Shock: React.FC<{ k: number; position: [number, number, number] }> = ({ k, position }) =>
  k <= 0 || k >= 1 ? null : (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <ringGeometry args={[0.04 + k * 0.3, 0.055 + k * 0.32, 48]} />
      <meshBasicMaterial color="#FFD27A" toneMapped={false} transparent opacity={1 - k} />
    </mesh>
  );
