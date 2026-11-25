import React, { useMemo } from "react";
import * as THREE from "three";
import { MANUSCRIPT_PALETTE as P } from "../../kits/manuscript/lib/palette.ts";
import { makeWoodTexture, makeGlowTexture, makeLeftPageTexture, makeRightPageTexture } from "../../kits/manuscript/lib/materials.ts";
import { computeState, mulberry32, candleFlicker, vnoise, type BaitulState } from "./motion.ts";

// --- Ink Bowl (Hook) ---
const InkBowl: React.FC<{ s: BaitulState }> = ({ s }) => {
  const inkSpread = s.inkSpread;
  return (
    <group position={[0, 0.62, 0.3]}>
      {/* Ceramic bowl — glazed with dark interior */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.08, 24]} />
        <meshPhysicalMaterial color="#2A1A10" roughness={0.2} metalness={0.05} clearcoat={0.6} clearcoatRoughness={0.3} />
      </mesh>
      {/* Decorative gold rim */}
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.148, 0.006, 8, 24]} />
        <meshStandardMaterial color={P.goldLeaf} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Water surface */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 24]} />
        <meshPhysicalMaterial
          color={inkSpread > 0.1 ? "#0D0D0D" : "#4A6B7A"}
          roughness={0.1}
          metalness={0.2}
          transmission={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Ink tendrils spreading */}
      {inkSpread > 0.05 &&
        Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r = inkSpread * 0.11;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, 0.036, Math.sin(angle) * r]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.02 * inkSpread, 8]} />
              <meshBasicMaterial color="#0D0D0D" transparent opacity={inkSpread * 0.8} />
            </mesh>
          );
        })}
    </group>
  );
};

// --- Miniature Baghdad ---
const BaghdadMiniature: React.FC<{ s: BaitulState }> = ({ s }) => {
  const visible = s.t > 4 && s.t < 16;
  if (!visible) return null;
  const opacity = s.t < 5 ? (s.t - 4) : s.t > 14 ? (16 - s.t) / 2 : 1;
  return (
    <group position={[-1.5, 0.62, 0]} scale={[0.3, 0.3, 0.3]}>
      {/* Map base (parchment) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color={P.parchment} roughness={0.8} />
      </mesh>
      {/* Central dome (Round City) */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={P.goldLeaf} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.4, 16]} />
        <meshStandardMaterial color="#A08060" roughness={0.6} />
      </mesh>
      {/* Minarets */}
      {[[-0.7, 0, -0.4], [0.7, 0, -0.4], [-0.5, 0, 0.6], [0.5, 0, 0.6]].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.07, 0.8, 8]} />
            <meshStandardMaterial color="#B8964F" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color={P.goldLeaf} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* City walls */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]} castShadow>
          <boxGeometry args={[0.08, 0.3, 2.5]} />
          <meshStandardMaterial color="#8A7050" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
};

// --- Scroll and Quill (Translation Beat) ---
const ScrollQuill: React.FC<{ s: BaitulState }> = ({ s }) => {
  const unroll = s.scrollUnroll;
  return (
    <group position={[0, 0.62, -0.2]}>
      {/* Scroll body unrolling */}
      <mesh position={[-0.3 * unroll, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6 + unroll * 0.4, 12]} />
        <meshStandardMaterial color={P.parchment} roughness={0.7} />
      </mesh>
      {/* Scroll end caps (wooden) */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-0.3 * unroll + side * (0.32 + unroll * 0.22), 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 8]} />
          <meshStandardMaterial color={P.deskWalnut} roughness={0.4} />
        </mesh>
      ))}
      {/* Unrolled parchment sheet — aged texture */}
      {unroll > 0.1 && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[unroll * 0.8, 0.5]} />
          <meshPhysicalMaterial
            color={P.parchment}
            roughness={0.75}
            sheen={0.3}
            sheenColor="#D4B88A"
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {/* Quill pen */}
      <group position={[0.4, 0.08, 0.15]} rotation={[0, 0, -0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.005, 0.003, 0.35, 6]} />
          <meshStandardMaterial color="#EFE7D8" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <coneGeometry args={[0.004, 0.03, 4]} />
          <meshStandardMaterial color="#1A1A10" roughness={0.3} />
        </mesh>
      </group>
      {/* Ink pot */}
      <mesh position={[0.55, 0.04, 0.1]} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
        <meshStandardMaterial color="#1A1A2E" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
};

// --- Algebra Equations (Khawarizmi Beat) ---
const AlgebraEquations: React.FC<{ s: BaitulState }> = ({ s }) => {
  const floatT = s.algebraFloat;
  if (floatT < 0.01) return null;
  const leftPage = useMemo(() => makeLeftPageTexture(), []);
  const rightPage = useMemo(() => makeRightPageTexture(), []);
  return (
    <group position={[1.5, 0.62, 0]}>
      {/* Leather book cover */}
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.04, 0.32]} />
        <meshStandardMaterial color="#3A1A0E" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Gold spine emblem */}
      <mesh position={[0, 0.021, -0.16]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 16]} />
        <meshStandardMaterial color={P.goldLeaf} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Left page — illuminated manuscript */}
      <mesh position={[-0.1, 0.03, 0]} rotation={[-0.05, 0, -0.05]}>
        <boxGeometry args={[0.18, 0.015, 0.28]} />
        <meshStandardMaterial map={leftPage} roughness={0.75} />
      </mesh>
      {/* Right page — ruled with border */}
      <mesh position={[0.1, 0.03, 0]} rotation={[-0.05, 0, 0.05]}>
        <boxGeometry args={[0.18, 0.015, 0.28]} />
        <meshStandardMaterial map={rightPage} roughness={0.75} />
      </mesh>
      {/* Page edges (visible side) */}
      <mesh position={[0, 0.025, 0.155]}>
        <boxGeometry args={[0.38, 0.025, 0.005]} />
        <meshStandardMaterial color="#E8D8B8" roughness={0.9} />
      </mesh>
      {/* Floating equation symbols */}
      {["x²", "+", "10x", "=", "39"].map((_, i) => {
        const y = 0.15 + floatT * (0.4 + i * 0.08);
        const x = (i - 2) * 0.12;
        return (
          <mesh key={i} position={[x, y, 0]} scale={[0.06, 0.06, 0.01]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={P.goldLeaf}
              metalness={0.7}
              roughness={0.3}
              emissive={P.goldLeaf}
              emissiveIntensity={floatT * 0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Mechanical Device (Banu Musa Beat) ---
const MechanicalDevice: React.FC<{ s: BaitulState }> = ({ s }) => {
  const spin = s.gearSpin;
  const rot = s.t * 2;
  return (
    <group position={[3, 0.62, 0]}>
      {/* Base platform */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.03, 0.4]} />
        <meshStandardMaterial color={P.deskWalnut} roughness={0.5} />
      </mesh>
      {/* Main gear */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, rot * spin]} castShadow>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        <meshStandardMaterial color={P.goldLeaf} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Small gear */}
      <mesh position={[0.15, 0.12, 0]} rotation={[0, 0, -rot * 1.5 * spin]} castShadow>
        <torusGeometry args={[0.06, 0.015, 8, 12]} />
        <meshStandardMaterial color="#B08040" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Vertical shaft */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.16, 6]} />
        <meshStandardMaterial color="#A08050" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Mechanical bird on top */}
      <group position={[-0.05, 0.28, 0]} rotation={[0, rot * 0.3 * spin, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshStandardMaterial color={P.goldLeaf} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Wing */}
        <mesh position={[0.03, 0.01, 0]} rotation={[0, 0, Math.sin(rot * 3 * spin) * 0.4]}>
          <boxGeometry args={[0.05, 0.005, 0.02]} />
          <meshStandardMaterial color={P.goldDeep} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* Water pipe */}
      <mesh position={[0.2, 0.05, 0.1]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
        <meshStandardMaterial color="#705030" roughness={0.5} />
      </mesh>
    </group>
  );
};

// --- Flood Water (Destruction Beat) ---
const FloodWater: React.FC<{ s: BaitulState }> = ({ s }) => {
  const level = s.floodLevel;
  if (level < 0.01) return null;
  const y = 0.6 + level * 0.5;
  return (
    <mesh position={[1, y / 2, 0]} rotation={[0, 0, 0]}>
      <boxGeometry args={[12, y, 6]} />
      <meshPhysicalMaterial
        color="#1A2A3A"
        roughness={0.05}
        metalness={0.1}
        transmission={0.3}
        transparent
        opacity={0.5 + level * 0.3}
      />
    </mesh>
  );
};

// --- Rising Letters (Closing Beat) ---
const RisingLetters: React.FC<{ s: BaitulState }> = ({ s }) => {
  const rise = s.lettersRise;
  if (rise < 0.01) return null;
  const letters = useMemo(() => {
    const rnd = mulberry32(42);
    return Array.from({ length: 30 }, (_, i) => ({
      x: (rnd() - 0.5) * 4,
      z: (rnd() - 0.5) * 2.5,
      phase: rnd() * Math.PI * 2,
      size: 0.08 + rnd() * 0.14,
    }));
  }, []);

  return (
    <group>
      {letters.map((l, i) => {
        const y = 0.7 + rise * (1.8 + i * 0.1);
        const glow = rise * (0.6 + 0.4 * Math.sin(s.t * 2 + l.phase));
        return (
          <group key={i} position={[l.x + Math.sin(s.t * 0.5 + l.phase) * 0.15, y, l.z]}>
            <mesh>
              <boxGeometry args={[l.size, l.size * 1.4, 0.008]} />
              <meshStandardMaterial
                color={P.goldLeaf}
                metalness={0.8}
                roughness={0.2}
                emissive={P.goldLeaf}
                emissiveIntensity={glow * 0.5}
              />
            </mesh>
            <pointLight color={P.goldLeaf} intensity={glow * 0.6} distance={1.2} decay={2} />
          </group>
        );
      })}
    </group>
  );
};

// --- Candles along the table ---
const CANDLE_POSITIONS: [number, number, number][] = [
  [-3.0, 0.62, -0.4],
  [-1.5, 0.62, -0.5],
  [-0.3, 0.62, 0.6],
  [0.8, 0.62, -0.5],
  [1.8, 0.62, 0.5],
  [2.8, 0.62, -0.4],
  [4.0, 0.62, -0.5],
];

const Candles: React.FC<{ s: BaitulState }> = ({ s }) => {
  const glow = useMemo(() => makeGlowTexture(), []);
  // Candles go out during destruction
  const flickerMul = s.t > 42 ? Math.max(0.3, 1 - (s.t - 42) / 10) : 1;

  return (
    <group>
      {CANDLE_POSITIONS.map((pos, i) => {
        const fl = candleFlicker(s.t, i + 1) * flickerMul;
        if (fl < 0.01) return null;
        const sway = Math.sin(s.t * 2.1 + i) * 0.02;
        return (
          <group key={i} position={pos}>
            {/* Brass holder */}
            <mesh position={[0, 0.012, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.09, 0.024, 16]} />
              <meshStandardMaterial color="#B8893A" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Wax body */}
            <mesh position={[0, 0.16, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.038, 0.3, 12]} />
              <meshPhysicalMaterial color={P.candleWax} roughness={0.45} sheen={0.6} sheenColor="#FFE8C0" emissive="#5A3A10" emissiveIntensity={0.15} />
            </mesh>
            {/* Flame */}
            <group position={[0, 0.32, 0]} rotation={[0, 0, sway]}>
              <mesh scale={[1, 2.1 * fl, 1]}>
                <sphereGeometry args={[0.012, 8, 6]} />
                <meshBasicMaterial color={P.candleFlame} toneMapped={false} />
              </mesh>
              <sprite scale={[0.4 * fl, 0.5 * fl, 1]}>
                <spriteMaterial map={glow} color={P.candleAmber} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
              </sprite>
              <pointLight
                color={P.candleAmber}
                intensity={3.0 * fl}
                distance={5}
                decay={1.4}
                castShadow={i < 2}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.002}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
};

// --- Bookshelf background ---
const Bookshelf: React.FC = () => (
  <group position={[0, 0, -2]}>
    {/* Shelf frame */}
    {[-3, -1, 1, 3].map((x, i) => (
      <group key={i} position={[x, 1.5, 0]}>
        {/* Vertical side */}
        <mesh castShadow>
          <boxGeometry args={[0.08, 3, 0.4]} />
          <meshStandardMaterial color="#2A1808" roughness={0.6} />
        </mesh>
        {/* Books on shelves */}
        {[0.3, 0.9, 1.5, 2.1].map((shelfY, j) => {
          const bookCount = 5 + (i + j) % 3;
          return (
            <group key={j}>
              {/* Shelf plank */}
              <mesh position={[0.5, shelfY - 1.5, 0]}>
                <boxGeometry args={[1.8, 0.03, 0.35]} />
                <meshStandardMaterial color="#3A2416" roughness={0.5} />
              </mesh>
              {/* Books — leather bindings with varied texture */}
              {Array.from({ length: bookCount }).map((_, k) => {
                const bx = 0.5 + (k - bookCount / 2) * 0.18;
                const bh = 0.15 + ((i * 7 + j * 3 + k) % 5) * 0.04;
                const bw = 0.1 + ((i + k) % 3) * 0.02;
                const colors = ["#8B4513", "#2F1B0E", "#1A3A1A", "#3A1A1A", "#1A1A3A", "#4A3010", "#2A2A10"];
                const hasGold = (i + j + k) % 4 === 0;
                return (
                  <group key={k} position={[bx, shelfY - 1.5 + 0.015 + bh / 2, 0]}>
                    <mesh>
                      <boxGeometry args={[bw, bh, 0.25]} />
                      <meshPhysicalMaterial
                        color={colors[(i + j + k) % colors.length]}
                        roughness={0.6 + ((k * 3) % 4) * 0.08}
                        metalness={0.02}
                        sheen={0.15}
                        sheenColor="#3A2810"
                      />
                    </mesh>
                    {/* Page edges visible on top */}
                    <mesh position={[0, bh / 2 - 0.003, 0]}>
                      <boxGeometry args={[bw - 0.01, 0.005, 0.24]} />
                      <meshStandardMaterial color="#E0D4B8" roughness={0.9} />
                    </mesh>
                    {/* Gold spine line on some books */}
                    {hasGold && (
                      <mesh position={[0, 0, -0.126]}>
                        <boxGeometry args={[bw + 0.005, bh * 0.6, 0.003]} />
                        <meshStandardMaterial color={P.goldLeaf} metalness={0.8} roughness={0.2} />
                      </mesh>
                    )}
                  </group>
                );
              })}
            </group>
          );
        })}
      </group>
    ))}
  </group>
);

// --- Dust motes ---
const DustMotes: React.FC<{ s: BaitulState }> = ({ s }) => {
  const glow = useMemo(() => makeGlowTexture(), []);
  const motes = useMemo(() => {
    const rnd = mulberry32(99);
    return Array.from({ length: 120 }, () => ({
      x: (rnd() - 0.5) * 8,
      y: 0.8 + rnd() * 2,
      z: -1 + rnd() * 3,
      ph: rnd() * 6.28,
    }));
  }, []);

  return (
    <group>
      {motes.map((m, i) => (
        <sprite key={i} position={[m.x + Math.sin(s.t * 0.2 + m.ph) * 0.15, m.y + ((s.t * 0.02 + m.ph) % 0.3), m.z]}>
          <spriteMaterial
            map={glow}
            color="#FFE2B0"
            transparent
            opacity={0.4 + 0.3 * Math.sin(s.t * 1.5 + m.ph)}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
};

// --- Astrolabe (table prop) ---
const Astrolabe: React.FC<{ s: BaitulState }> = ({ s }) => (
  <group position={[-0.3, 0.65, 0.4]} rotation={[0.2, s.t * 0.1, 0]}>
    <mesh castShadow>
      <torusGeometry args={[0.08, 0.008, 12, 24]} />
      <meshStandardMaterial color={P.goldLeaf} metalness={0.9} roughness={0.15} />
    </mesh>
    <mesh>
      <ringGeometry args={[0.03, 0.075, 24]} />
      <meshStandardMaterial color={P.goldDeep} metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
    </mesh>
    {[0, Math.PI / 2].map((a, i) => (
      <mesh key={i} rotation={[0, 0, a]}>
        <boxGeometry args={[0.15, 0.003, 0.003]} />
        <meshStandardMaterial color={P.goldLeaf} metalness={0.9} roughness={0.2} />
      </mesh>
    ))}
    <mesh position={[0, 0, -0.005]}>
      <ringGeometry args={[0.05, 0.065, 24]} />
      <meshStandardMaterial color={P.goldLeaf} metalness={0.85} roughness={0.2} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// --- Scattered Books on Table ---
const SCATTERED_BOOKS: { pos: [number, number, number]; rot: number; color: string; w: number; h: number }[] = [
  { pos: [-2.5, 0.65, -0.3], rot: 0.15, color: "#8B4513", w: 0.2, h: 0.18 },
  { pos: [-2.2, 0.68, -0.1], rot: -0.3, color: "#1A3A1A", w: 0.18, h: 0.15 },
  { pos: [-2.4, 0.66, 0.2], rot: 0.6, color: "#3A1A1A", w: 0.22, h: 0.2 },
  { pos: [-0.8, 0.65, -0.5], rot: -0.1, color: "#2F1B0E", w: 0.19, h: 0.16 },
  { pos: [0.3, 0.65, 0.5], rot: 0.4, color: "#4A3010", w: 0.17, h: 0.14 },
  { pos: [2.2, 0.65, 0.3], rot: -0.2, color: "#1A1A3A", w: 0.21, h: 0.19 },
  { pos: [3.8, 0.65, -0.2], rot: 0.35, color: "#3A2416", w: 0.18, h: 0.17 },
  { pos: [-3.2, 0.66, 0.1], rot: -0.5, color: "#2A2A10", w: 0.2, h: 0.18 },
  { pos: [-3.5, 0.65, -0.4], rot: 0.8, color: "#8B4513", w: 0.16, h: 0.15 },
  { pos: [4.2, 0.65, 0.1], rot: -0.4, color: "#2F1B0E", w: 0.19, h: 0.16 },
];

const ScatteredBooks: React.FC = () => (
  <group>
    {SCATTERED_BOOKS.map((b, i) => {
      const thickness = 0.025 + (i % 4) * 0.008;
      const hasGold = i % 3 === 0;
      return (
        <group key={i} position={b.pos} rotation={[0, b.rot, (i % 3 - 1) * 0.05]}>
          <mesh castShadow>
            <boxGeometry args={[b.w, thickness, b.h]} />
            <meshPhysicalMaterial color={b.color} roughness={0.6} metalness={0.02} sheen={0.15} sheenColor="#3A2810" />
          </mesh>
          <mesh position={[0, thickness / 2 + 0.001, 0]}>
            <boxGeometry args={[b.w - 0.01, 0.003, b.h - 0.01]} />
            <meshStandardMaterial color="#E0D4B8" roughness={0.9} />
          </mesh>
          {hasGold && (
            <mesh position={[0, 0, -b.h / 2 - 0.001]}>
              <boxGeometry args={[b.w * 0.5, thickness + 0.002, 0.003]} />
              <meshStandardMaterial color={P.goldLeaf} metalness={0.8} roughness={0.2} />
            </mesh>
          )}
        </group>
      );
    })}
  </group>
);

// --- Wax Seal (MANUSCRIPT brand element) ---
const WaxSeal: React.FC = () => (
  <group position={[0.7, 0.63, 0.45]} rotation={[-Math.PI / 2 + 0.05, 0, 0.2]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.045, 0.05, 0.012, 24]} />
      <meshPhysicalMaterial color="#8B1A1A" roughness={0.35} metalness={0.05} clearcoat={0.4} clearcoatRoughness={0.5} />
    </mesh>
    <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.025, 16]} />
      <meshStandardMaterial color={P.goldLeaf} metalness={0.9} roughness={0.15} />
    </mesh>
    <mesh position={[-0.06, 0.003, 0.03]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.12, 0.004, 0.02]} />
      <meshStandardMaterial color="#D4B88A" roughness={0.7} />
    </mesh>
  </group>
);

// --- Compass/Divider tool ---
const Compass: React.FC<{ s: BaitulState }> = ({ s }) => {
  const angle = 0.3 + Math.sin(s.t * 0.3) * 0.05;
  return (
    <group position={[-1.0, 0.63, 0.35]} rotation={[0.1, 0.4, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
        <meshStandardMaterial color="#B08040" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[Math.sin(angle) * 0.08, -0.08, Math.cos(angle) * 0.02]} rotation={[0, 0, angle]} castShadow>
        <cylinderGeometry args={[0.006, 0.003, 0.18, 6]} />
        <meshStandardMaterial color="#B08040" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-Math.sin(angle) * 0.08, -0.08, -Math.cos(angle) * 0.02]} rotation={[0, 0, -angle]} castShadow>
        <cylinderGeometry args={[0.006, 0.003, 0.18, 6]} />
        <meshStandardMaterial color="#B08040" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};

// --- Extra Scrolls scattered on table ---
const ExtraScrolls: React.FC = () => {
  const positions: [number, number, number][] = [
    [-2.8, 0.63, 0.4], [1.0, 0.63, -0.4], [2.5, 0.63, -0.5], [4.5, 0.63, 0.3], [-3.8, 0.63, -0.2],
  ];
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={p} rotation={[0, i * 1.3 + 0.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.25 + (i % 3) * 0.08, 10]} />
            <meshStandardMaterial color={P.parchment} roughness={0.7} />
          </mesh>
          {[1, -1].map((side) => (
            <mesh key={side} position={[0, 0, side * (0.13 + (i % 3) * 0.04)]} castShadow>
              <cylinderGeometry args={[0.032, 0.032, 0.015, 8]} />
              <meshStandardMaterial color={P.deskWalnut} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// === MAIN WORLD ===
export const BaitulHikmahWorld: React.FC<{ f: number }> = ({ f }) => {
  const s = computeState(f);
  const woodTex = useMemo(() => makeWoodTexture(7), []);

  return (
    <group>
      {/* Long walnut table */}
      <mesh position={[0.5, 0.58, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.08, 1.8]} />
        <meshStandardMaterial map={woodTex} color={P.deskWalnut} roughness={0.4} />
      </mesh>
      {/* Table legs */}
      {[-3.5, -1, 1.5, 4].map((x, i) =>
        [-0.7, 0.7].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.29, z]} castShadow>
            <boxGeometry args={[0.08, 0.58, 0.08]} />
            <meshStandardMaterial color="#2A1808" roughness={0.5} />
          </mesh>
        )),
      )}

      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#1A1008" roughness={0.9} />
      </mesh>

      <Bookshelf />
      <ScatteredBooks />
      <ExtraScrolls />
      <WaxSeal />
      <Compass s={s} />
      <InkBowl s={s} />
      <BaghdadMiniature s={s} />
      <ScrollQuill s={s} />
      <AlgebraEquations s={s} />
      <MechanicalDevice s={s} />
      <Astrolabe s={s} />
      <Candles s={s} />
      <DustMotes s={s} />
      <FloodWater s={s} />
      <RisingLetters s={s} />
    </group>
  );
};
