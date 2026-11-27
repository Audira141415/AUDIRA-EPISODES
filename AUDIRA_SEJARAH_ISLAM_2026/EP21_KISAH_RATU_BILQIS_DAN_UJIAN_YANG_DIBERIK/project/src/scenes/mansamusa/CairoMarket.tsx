// EP04 hook set: a night market in Cairo, 1324, built as an HD-2D tilt-shift diorama.
// A brass balance stands in the lane: gold coins rain onto the gold pan, and that pan rises
// (gold lost value against silver dirhams). Behind it a pixel caravan enters through the city gate,
// under strings of 2400K lanterns, with domes and minarets and the Giza pyramids far away at dusk.
// Every person is a faceless pixel sprite seen from behind or in profile with a wrapped head.

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, POLISH, surfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { PixelSprite, PILGRIM_BACK, PILGRIM_BACK_WHITE, PORTER_BACK, CAMEL_GOLD } from "./pixel.tsx";
import { W, ramp, smooth } from "./time.ts";
import { MarketExtras } from "./MarketExtras.tsx";

export const MM = {
  skyTop: "#0B1230",
  skyMid: "#2B2752",
  skyHorizon: "#D9774A",
  fog: "#33294A",
  sand: "#5E4630",
  sandDark: "#5A4230",
  stone: "#866849",
  timber: "#4A2E1A",
  lantern: "#FFA347",
  lanternHot: "#FFD08A",
  gold: "#F0B93E",
  silver: "#D9DEE6",
  brass: "#B88A3E",
  red: "#9C2F2A",
  cream: "#E9DCC0",
  indigo: "#2E4C7A",
} as const;

export const grain = surfaceGrain(41, 256, 0.4, 5);
export const grainFine = surfaceGrain(42, 256, 0.3, 2);

export const GOLD_MAT = { color: MM.gold, metalness: 1, roughness: 0.22, clearcoat: 0.3, emissive: "#7A4A08", emissiveIntensity: 0.35 } as const;
export const SILVER_MAT = { color: "#ECE6DC", metalness: 1, roughness: 0.2, clearcoat: 0.4, emissive: "#3A342C", emissiveIntensity: 0.25 } as const;

/** Sky dome with a dusk gradient (not fogged). */
export const Sky: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(60, 48, 24);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const top = new THREE.Color(MM.skyTop).convertSRGBToLinear();
    const mid = new THREE.Color(MM.skyMid).convertSRGBToLinear();
    const hor = new THREE.Color(MM.skyHorizon).convertSRGBToLinear();
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 60; // -1..1
      if (y < 0.02) c.copy(hor);
      else if (y < 0.16) c.copy(hor).lerp(mid, (y - 0.02) / 0.14);
      else c.copy(mid).lerp(top, Math.min(1, (y - 0.16) / 0.5));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} toneMapped={false} />
    </mesh>
  );
};

export const Dome: React.FC<{ x: number; z: number; r: number; drum: number; color?: string; y?: number }> = ({ x, z, r, drum, color = MM.stone, y = 0 }) => (
  <group position={[x, y, z]}>
    <mesh position={[0, drum / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r * 1.02, r * 1.08, drum, 32]} />
      <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grain} bumpScale={0.4} />
    </mesh>
    <mesh position={[0, drum, 0]} castShadow>
      <sphereGeometry args={[r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial {...POLISH.stone} color={color} bumpMap={grainFine} bumpScale={0.3} />
    </mesh>
    <mesh position={[0, drum + r + 0.12, 0]}>
      <coneGeometry args={[0.03, 0.26, 8]} />
      <meshStandardMaterial color={MM.brass} metalness={0.9} roughness={0.35} />
    </mesh>
    {/* small lit windows round the drum */}
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      return (
        <mesh key={i} position={[Math.sin(a) * r * 1.03, drum * 0.55, Math.cos(a) * r * 1.03]} rotation={[0, a, 0]}>
          <planeGeometry args={[r * 0.16, drum * 0.35]} />
          <meshBasicMaterial color={MM.lantern} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

export const Minaret: React.FC<{ x: number; z: number; h: number; s?: number }> = ({ x, z, h, s = 1 }) => (
  <group position={[x, 0, z]} scale={s}>
    <mesh position={[0, h * 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.24, h * 0.7, 8]} />
      <meshPhysicalMaterial {...POLISH.stone} color={MM.stone} bumpMap={grain} bumpScale={0.4} />
    </mesh>
    <mesh position={[0, h * 0.7, 0]}>
      <cylinderGeometry args={[0.3, 0.22, 0.08, 16]} />
      <meshPhysicalMaterial {...POLISH.stone} color={MM.sandDark} />
    </mesh>
    <mesh position={[0, h * 0.84, 0]} castShadow>
      <cylinderGeometry args={[0.13, 0.16, h * 0.26, 16]} />
      <meshPhysicalMaterial {...POLISH.stone} color={MM.stone} bumpMap={grain} bumpScale={0.4} />
    </mesh>
    <mesh position={[0, h * 0.84, 0]}>
      <cylinderGeometry args={[0.135, 0.135, h * 0.06, 16, 1, true]} />
      <meshBasicMaterial color={MM.lantern} toneMapped={false} />
    </mesh>
    <mesh position={[0, h * 0.99, 0]}>
      <sphereGeometry args={[0.13, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial {...POLISH.stone} color={MM.stone} />
    </mesh>
    <mesh position={[0, h * 1.06, 0]}>
      <coneGeometry args={[0.02, 0.2, 6]} />
      <meshStandardMaterial color={MM.brass} metalness={0.9} roughness={0.35} />
    </mesh>
  </group>
);

export const Pyramid: React.FC<{ x: number; z: number; s: number }> = ({ x, z, s }) => (
  <mesh position={[x, s * 0.5, z]} rotation={[0, Math.PI / 4, 0]}>
    <coneGeometry args={[s * 0.82, s, 4]} />
    <meshStandardMaterial color="#C08A5A" roughness={0.95} flatShading />
  </mesh>
);

/** City wall with a horseshoe gate glowing from inside. */
export const CityGate: React.FC<{ z: number }> = ({ z }) => (
  <group position={[0, 0, z]}>
    {[-1, 1].map((sd) => (
      <group key={sd}>
        <mesh position={[sd * 0.95, 1.25, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[0.7, 2.5, 0.7]} radius={0.04} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.stone} bumpMap={grain} bumpScale={0.5} />
        </mesh>
        {/* ablaq: alternating dark and light masonry courses (Mamluk Cairo) */}
        {Array.from({ length: 9 }, (_, k) => (
          <mesh key={`ab${k}`} position={[sd * 0.95, 0.2 + k * 0.26, 0.355]}>
            <planeGeometry args={[0.7, 0.13]} />
            <meshPhysicalMaterial {...POLISH.stone} color={k % 2 ? "#3A2A20" : "#C9A57A"} />
          </mesh>
        ))}
        {/* arrow slit */}
        <mesh position={[sd * 0.95, 1.9, 0.36]}>
          <planeGeometry args={[0.07, 0.3]} />
          <meshBasicMaterial color={MM.lantern} toneMapped={false} />
        </mesh>
        {/* crenellations */}
        {[-0.22, 0, 0.22].map((cx) => (
          <mesh key={cx} position={[sd * 0.95 + cx, 2.6, 0]}>
            <boxGeometry args={[0.13, 0.2, 0.72]} />
            <meshPhysicalMaterial {...POLISH.stone} color={MM.stone} />
          </mesh>
        ))}
        <mesh position={[sd * 2.6, 0.9, 0.05]} receiveShadow castShadow>
          <boxGeometry args={[2.6, 1.8, 0.5]} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.sandDark} bumpMap={grain} bumpScale={0.5} />
        </mesh>
      </group>
    ))}
    {/* lintel above the arch */}
    <mesh position={[0, 2.05, 0]} castShadow>
      <boxGeometry args={[1.25, 0.9, 0.6]} />
      <meshPhysicalMaterial {...POLISH.stone} color={MM.stone} bumpMap={grain} bumpScale={0.5} />
    </mesh>
    {/* voussoirs round the arch, alternating like Mamluk ablaq */}
    {Array.from({ length: 11 }, (_, k) => {
      const a = (k / 10) * Math.PI;
      return (
        <mesh key={`v${k}`} position={[Math.cos(a) * 0.56, 1.44 + Math.sin(a) * 0.56, 0.31]} rotation={[0, 0, a - Math.PI / 2]}>
          <boxGeometry args={[0.13, 0.17, 0.04]} />
          <meshPhysicalMaterial {...POLISH.stone} color={k % 2 ? "#3A2A20" : "#D8B488"} />
        </mesh>
      );
    })}
    {/* geometric frieze above the gate */}
    {Array.from({ length: 9 }, (_, k) => (
      <mesh key={`fr${k}`} position={[-0.56 + k * 0.14, 2.32, 0.31]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.07, 0.07, 0.03]} />
        <meshStandardMaterial color={MM.brass} metalness={0.8} roughness={0.4} />
      </mesh>
    ))}
    {/* glowing opening: rectangle + half disc = horseshoe arch */}
    <mesh position={[0, 0.72, 0.31]}>
      <planeGeometry args={[0.95, 1.44]} />
      <meshBasicMaterial color="#F2A65A" toneMapped={false} />
    </mesh>
    <mesh position={[0, 1.44, 0.31]}>
      <circleGeometry args={[0.475, 32, 0, Math.PI]} />
      <meshBasicMaterial color="#F2A65A" toneMapped={false} />
    </mesh>
    <pointLight position={[0, 0.8, 1.6]} color={MM.lantern} intensity={2} distance={4} decay={2} />
  </group>
);

/** Striped cloth awning stall at the side of the lane. */
export const Stall: React.FC<{ x: number; z: number; side: 1 | -1; colors: [string, string] }> = ({ x, z, side, colors }) => (
  <group position={[x, 0, z]}>
    {[-0.55, 0.55].map((dz) => (
      <mesh key={dz} position={[-side * 0.45, 1.0, dz]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.0, 10]} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} />
      </mesh>
    ))}
    {/* awning: 6 stripes, tilted down toward the lane */}
    <group position={[-side * 0.15, 2.0, 0]} rotation={[0, 0, side * 0.32]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 0, -0.65 + i * 0.26]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.1, 0.04, 0.26]} radius={0.015} />
          <meshPhysicalMaterial {...POLISH.fabric} color={colors[i % 2]} />
        </mesh>
      ))}
    </group>
    {/* counter with goods */}
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <RoundedBoxGeo args={[0.8, 0.9, 1.3]} radius={0.04} />
      <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.6} />
    </mesh>
    {[-0.35, 0, 0.35].map((dz, i) => (
      <mesh key={dz} position={[0, 0.98, dz]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.16, 16]} />
        <meshPhysicalMaterial {...POLISH.clay} color={["#C8743A", "#9E5A2E", "#D59A4B"][i]} />
      </mesh>
    ))}
  </group>
);

/** A string of pixel lanterns across the lane. */
export const LanternString: React.FC<{ z: number; y: number; span: number; f: number }> = ({ z, y, span, f }) => {
  const n = 7;
  return (
    <group position={[0, y, z]}>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        const x = -span / 2 + u * span;
        const sag = Math.sin(u * Math.PI) * 0.28;
        const flick = 0.85 + 0.15 * Math.sin(f * 0.11 + i * 1.7) * Math.sin(f * 0.037 + i);
        return (
          <group key={i} position={[x, -sag, 0]}>
            <mesh>
              <boxGeometry args={[0.09, 0.12, 0.09]} />
              <meshBasicMaterial color={i % 3 === 1 ? MM.lanternHot : MM.lantern} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.1, 0.03, 0.1]} />
              <meshStandardMaterial color="#2A1A0E" />
            </mesh>
            {i % 2 === 0 && <pointLight color={MM.lantern} intensity={1.6 * flick} distance={2.6} decay={2} />}
          </group>
        );
      })}
      {/* the cord */}
      {Array.from({ length: n - 1 }, (_, i) => {
        const u0 = i / (n - 1), u1 = (i + 1) / (n - 1);
        const x0 = -span / 2 + u0 * span, x1 = -span / 2 + u1 * span;
        const y0 = -Math.sin(u0 * Math.PI) * 0.28 + 0.1, y1 = -Math.sin(u1 * Math.PI) * 0.28 + 0.1;
        const len = Math.hypot(x1 - x0, y1 - y0);
        return (
          <mesh key={i} position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]} rotation={[0, 0, Math.atan2(y1 - y0, x1 - x0)]}>
            <boxGeometry args={[len, 0.008, 0.008]} />
            <meshBasicMaterial color="#1A120C" />
          </mesh>
        );
      })}
    </group>
  );
};

export const Coin: React.FC<{ pos: [number, number, number]; rot?: [number, number, number]; silver?: boolean; r?: number }> = ({ pos, rot = [0, 0, 0], silver, r = 0.055 }) => (
  <mesh position={pos} rotation={rot} castShadow>
    <cylinderGeometry args={[r, r, r * 0.22, 24]} />
    <meshPhysicalMaterial {...(silver ? SILVER_MAT : GOLD_MAT)} />
  </mesh>
);

// ---- The balance and its story state (all times are word times) ----

export const BAL = { z: 0.75, beamY: 1.62, half: 0.78, chain: 0.62 };

/** What the balance shows at time t (seconds of the voice). */
export function balanceState(t: number) {
  const swap = W("sebelum"); // "Sebelum Musa datang": the pile clears for one mitsqal
  const hookTilt = 0.2 + 0.1 * ramp(t, W("harga"), W("jatuh") + 0.3);
  const tilt = (hookTilt + 0.015 * Math.sin(t * 1.3)) * (1 - ramp(t, swap - 0.6, swap + 1.0));
  const goldPile = 1 - ramp(t, swap - 0.6, swap + 0.2);
  const silverOld = 1 - ramp(t, swap - 0.6, swap + 0.2);
  const mitsqal = ramp(t, W("mitsqal") - 0.2, W("mitsqal") + 0.25);
  // 25 dirhams stack up on "dua puluh lima", then fall to 22 on "turun"
  const build = ramp(t, W("dua") - 0.15, W("dirham") + 0.1);
  const drop = ramp(t, W("turun") - 0.1, W("dirham", 2) + 0.2);
  const silverN = build * 25 - drop * 3;
  // gold rain: the hook and the "emas tiba-tiba melimpah" beat
  const rain = Math.max(
    1 - ramp(t, W("namanya") - 0.5, W("namanya") + 0.6),
    ramp(t, W("emas", 6) - 0.3, W("emas", 6) + 0.3) * (1 - ramp(t, W("menurut") - 0.3, W("menurut") + 0.4)),
  );
  const heap = ramp(t, W("emas", 6), W("turun", 2));
  return { tilt, goldPile, silverOld, mitsqal, silverN, rain, heap };
}

/** World positions of the two pans (gold = left). */
export function panWorld(tilt: number) {
  const g = { x: -BAL.half * Math.cos(tilt), y: BAL.beamY + BAL.half * Math.sin(tilt) - BAL.chain };
  const s = { x: BAL.half * Math.cos(tilt), y: BAL.beamY - BAL.half * Math.sin(tilt) - BAL.chain };
  return { gold: [g.x, g.y, BAL.z] as [number, number, number], silver: [s.x, s.y, BAL.z] as [number, number, number] };
}

/** Brass balance. tilt > 0 lifts the left (gold) pan. */
const Balance: React.FC<{ st: ReturnType<typeof balanceState> }> = ({ st }) => {
  const { tilt } = st;
  const { beamY, half, chain } = BAL;
  const ends = [-1, 1].map((sd) => ({
    sd,
    x: sd * half * Math.cos(tilt),
    y: beamY + -sd * half * Math.sin(tilt),
  }));
  const goldPile = useMemo(() => {
    const r = prng(9);
    return Array.from({ length: 22 }, (_, i) => {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.22;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: 0.05 + (1 - d / 0.22) * 0.06 + (i % 3) * 0.012, rx: (r() - 0.5) * 0.5, rz: (r() - 0.5) * 0.5 };
    });
  }, []);
  const n = Math.max(0, st.silverN);
  const full = Math.floor(n + 1e-6);
  return (
    <group>
      {/* stepped base */}
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[0.62, 0.14, 0.5]} radius={0.03} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.5} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.1, 32]} />
        <meshStandardMaterial color={MM.brass} metalness={0.95} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1.42, 20]} />
        <meshStandardMaterial color={MM.brass} metalness={0.95} roughness={0.3} />
      </mesh>
      <mesh position={[0, beamY + 0.1, 0]}>
        <sphereGeometry args={[0.06, 20, 12]} />
        <meshStandardMaterial color={MM.brass} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, beamY + 0.15, 0]} rotation={[0, 0, -tilt]}>
        <boxGeometry args={[0.02, 0.28, 0.02]} />
        <meshStandardMaterial color={MM.brass} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, beamY, 0]} rotation={[0, 0, -tilt]} castShadow>
        <boxGeometry args={[half * 2 + 0.08, 0.045, 0.045]} />
        <meshStandardMaterial color={MM.brass} metalness={0.95} roughness={0.3} />
      </mesh>
      {ends.map(({ sd, x, y }) => {
        const panY = y - chain;
        const gold = sd < 0;
        return (
          <group key={sd}>
            {[0, 1, 2].map((k) => {
              const a = (k / 3) * Math.PI * 2 + 0.5;
              const bx = Math.cos(a) * 0.26, bz = Math.sin(a) * 0.26;
              const len = Math.hypot(bx, chain, bz);
              const dir = new THREE.Vector3(bx, -chain, bz).normalize();
              const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
              const e = new THREE.Euler().setFromQuaternion(q);
              return (
                <mesh key={k} position={[x + bx / 2, y - chain / 2, bz / 2]} rotation={[e.x, e.y, e.z]}>
                  <cylinderGeometry args={[0.006, 0.006, len, 6]} />
                  <meshStandardMaterial color={MM.brass} metalness={0.9} roughness={0.35} />
                </mesh>
              );
            })}
            <mesh position={[x, panY, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.32, 0.22, 0.07, 40, 1, false]} />
              <meshStandardMaterial color={MM.brass} metalness={0.95} roughness={0.28} />
            </mesh>
            {gold ? (
              <group>
                {st.goldPile > 0.01 &&
                  goldPile.map((c, i) => (
                    <group key={i} position={[x + c.x, panY + c.y * st.goldPile, c.z]} scale={st.goldPile}>
                      <Coin pos={[0, 0, 0]} rot={[c.rx, 0, c.rz]} />
                    </group>
                  ))}
                {st.mitsqal > 0.01 && (
                  <group position={[x, panY + 0.06, 0]} scale={st.mitsqal}>
                    <Coin pos={[0, 0, 0]} r={0.1} rot={[0.12, 0, 0]} />
                  </group>
                )}
              </group>
            ) : (
              <group>
                {st.silverOld > 0.01 &&
                  [-0.12, 0.1, 0].map((dx, i) => (
                    <group key={i} position={[x + dx, panY + 0.04, [0.08, 0.06, -0.12][i]]} scale={st.silverOld}>
                      {Array.from({ length: [9, 7, 6][i] }, (_, k) => (
                        <Coin key={k} silver r={0.05} pos={[Math.sin(k * 2.1) * 0.006, k * 0.0125, Math.cos(k * 1.7) * 0.006]} />
                      ))}
                    </group>
                  ))}
                {n > 0.01 && (
                  <group position={[x, panY + 0.045, 0]}>
                    {Array.from({ length: Math.min(25, Math.ceil(n)) }, (_, k) => {
                      // the topmost coin of a growing stack drops in from above
                      const part = k < full ? 1 : n - full;
                      return <Coin key={k} silver r={0.06} pos={[Math.sin(k * 2.1) * 0.004, k * 0.0135 + (1 - part) * 0.25, Math.cos(k * 1.7) * 0.004]} />;
                    })}
                  </group>
                )}
              </group>
            )}
          </group>
        );
      })}
      {/* cool rim from behind-left so the brass separates from the glowing gate */}
      <spotLight position={[-1.5, 3.2, -2.2]} target-position={[0, 1.2, 0]} angle={0.5} penumbra={0.8} intensity={14} color="#A8BCFF" distance={7} decay={2} />
      {/* warm light pooling on the gold, and a warm fill on the silver so it reads as silver */}
      <pointLight position={[ends[0].x, ends[0].y + 0.2, 0.5]} color={MM.lanternHot} intensity={2.2} distance={2.2} decay={2} />
      <pointLight position={[ends[1].x + 0.1, ends[1].y + 0.15, 0.6]} color="#FFE6C2" intensity={1.6} distance={1.8} decay={2} />
    </group>
  );
};

/** Coins raining onto the gold pan (deterministic from the film clock). */
const FallingCoins: React.FC<{ t: number; x: number; panY: number; amount: number }> = ({ t, x, panY, amount }) => {
  const coins = useMemo(() => {
    const r = prng(77);
    return Array.from({ length: 22 }, () => ({ ph: r(), dx: (r() - 0.5) * 0.5, dz: (r() - 0.5) * 0.4, sp: 2 + r() * 4, r0: r() * 6 }));
  }, []);
  if (amount < 0.01) return null;
  const top = panY + 1.5;
  const shown = Math.round(16 + 6 * amount);
  return (
    <group>
      {coins.slice(0, shown).map((c, i) => {
        const u = (t * 0.55 + c.ph) % 1;
        const y = top - u * u * (top - panY - 0.12);
        const sc = (u > 0.94 ? (1 - u) / 0.06 : 1) * amount;
        return <Coin key={i} pos={[x + c.dx * (1 - u * 0.6), y, c.dz * (1 - u * 0.6)]} rot={[c.r0 + t * c.sp, c.r0, t * c.sp * 0.6]} r={0.055 * Math.max(0.01, sc)} />;
      })}
    </group>
  );
};

/** "Emas tiba-tiba melimpah": a heap of gold that grows on the flagstones by the balance. */
const GoldHeap: React.FC<{ k: number }> = ({ k }) => {
  const coins = useMemo(() => {
    const r = prng(313);
    return Array.from({ length: 60 }, (_, i) => {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.42;
      return { x: Math.cos(a) * d, z: Math.sin(a) * d * 0.7, y: 0.012 + (1 - d / 0.42) * 0.14 * r(), rx: (r() - 0.5) * 0.9, rz: (r() - 0.5) * 0.9, at: i / 60 };
    });
  }, []);
  if (k < 0.01) return null;
  return (
    <group position={[-0.75, 0, 1.55]}>
      {coins.map((c, i) => {
        const s = smooth((k - c.at * 0.85) / 0.15);
        if (s <= 0.01) return null;
        return <Coin key={i} pos={[c.x, c.y + (1 - s) * 0.5, c.z]} rot={[c.rx, i, c.rz]} r={0.055 * s} />;
      })}
    </group>
  );
};

export const CairoMarket: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 60;
  const st = balanceState(t);
  const pans = panWorld(st.tilt);
  const panX = pans.gold[0];
  const panY = pans.gold[1];
  const walk = (seed: number) => Math.abs(Math.sin(t * 6 + seed)) * 0.025;
  // payoff: the caravan walks out through the gate
  // the caravan has passed out through the gate by "pulang", leaving the empty chest alone in the lane
  const leave = ramp(t, W("tapi"), W("dalam") + 0.5);
  const lz = -3.3 * leave;
  return (
    <group>
      <Sky />
      <fog attach="fog" args={[MM.fog, 7, 30]} />

      {/* ground: diorama plaza + desert beyond */}
      <mesh position={[0, -0.25, -1]} receiveShadow>
        <RoundedBoxGeo args={[7, 0.5, 9]} radius={0.06} />
        <meshPhysicalMaterial {...POLISH.stone} color={MM.sand} bumpMap={grain} bumpScale={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -10]} receiveShadow>
        <planeGeometry args={[160, 110]} />
        <meshStandardMaterial color="#6B4A35" roughness={1} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[((i * 37) % 5) * 0.06 - 0.12, 0.004, 2.0 - i * 0.55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.1, 0.48]} />
          <meshPhysicalMaterial {...POLISH.stone} color={i % 2 ? "#735739" : "#654C33"} bumpMap={grain} bumpScale={0.5} />
        </mesh>
      ))}

      {/* far: pyramids of Giza at the dusk horizon */}
      <Pyramid x={-7} z={-34} s={3.4} />
      <Pyramid x={-3.2} z={-36} s={2.8} />
      <Pyramid x={-10} z={-33} s={1.6} />

      {/* city skyline */}
      <Dome x={-1.9} z={-6.2} r={1.0} drum={1.6} />
      <Dome x={2.3} z={-7.4} r={1.3} drum={1.9} color="#8E6E4E" />
      <Dome x={0.6} z={-9.5} r={0.8} drum={2.6} color="#8A6A4A" />
      <Minaret x={-0.4} z={-6.8} h={4.6} />
      <Minaret x={3.9} z={-6.5} h={5.2} s={0.9} />
      <Minaret x={-3.6} z={-8} h={4.0} s={0.85} />
      {[-3.2, -2.4, 1.0, 3.0, 4.2].map((x, i) => (
        <mesh key={x} position={[x, 0.7 + (i % 2) * 0.3, -5 - (i % 3) * 0.6]} castShadow receiveShadow>
          <RoundedBoxGeo args={[1.0, 1.4 + (i % 2) * 0.6, 1.0]} radius={0.03} />
          <meshPhysicalMaterial {...POLISH.stone} color={i % 2 ? MM.sandDark : MM.stone} bumpMap={grain} bumpScale={0.5} />
        </mesh>
      ))}

      <CityGate z={-3.6} />

      {/* caravan entering through the gate (and leaving again in the payoff) */}
      <PixelSprite map={CAMEL_GOLD} px={0.04} position={[-0.75, 0, -2.55 + lz]} flip bob={walk(0.5) * 0.6} />
      <PixelSprite map={CAMEL_GOLD} px={0.04} position={[0.85, 0, -2.85 + lz]} flip bob={walk(2.1) * 0.6} />
      <PixelSprite map={PILGRIM_BACK} px={0.04} position={[0.25, 0, -1.6 + lz]} bob={walk(1)} />
      <PixelSprite map={PILGRIM_BACK_WHITE} px={0.04} position={[-0.32, 0, -1.25 + lz]} bob={walk(2.4)} />
      <PixelSprite map={PORTER_BACK} px={0.04} position={[0.62, 0, -0.85 + lz]} bob={walk(3.3)} />
      <PixelSprite map={PILGRIM_BACK_WHITE} px={0.04} position={[-0.9, 0, -0.55 + lz]} bob={walk(4.1)} />

      <Stall x={-1.75} z={-0.3} side={-1} colors={[MM.red, MM.cream]} />
      <Stall x={1.8} z={-1.0} side={1} colors={[MM.indigo, MM.cream]} />

      <LanternString z={-0.2} y={2.55} span={3.6} f={f} />
      <LanternString z={-2.2} y={2.75} span={3.4} f={f + 40} />

      {/* the balance in the lane */}
      <group position={[0, 0, BAL.z]}>
        <Balance st={st} />
        <FallingCoins t={t} x={panX} panY={panY - 0} amount={st.rain} />
      </group>
      <GoldHeap k={st.heap} />

      {/* foreground: spilled gold and a lantern close to the lens (blurred by the tilt-shift) */}
      {[...Array(12)].map((_, i) => (
        <Coin key={i} pos={[-0.55 + ((i * 53) % 11) * 0.1, 0.015 + (i % 3) * 0.008, 2.0 + ((i * 29) % 7) * 0.08]} rot={[(i % 4) * 0.1, i, 0]} />
      ))}
      <group position={[1.15, 0, 2.1]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <RoundedBoxGeo args={[0.5, 0.5, 0.5]} radius={0.04} />
          <meshPhysicalMaterial {...POLISH.stone} color={MM.timber} bumpMap={grain} bumpScale={0.6} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.16, 0.22, 0.16]} />
          <meshBasicMaterial color={MM.lanternHot} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.7, 0]} color={MM.lantern} intensity={2.5} distance={3} decay={2} />
      </group>

      <MarketExtras t={t} />
    </group>
  );
};
