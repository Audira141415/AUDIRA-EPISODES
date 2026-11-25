// EP08 Petir — one world + camera pose + light per scene (multi-scene director, see PetirFilm.tsx).
// Every pose moves through its scene (push, crane, orbit, follow, crash-out, dolly); nothing is parked.
import React from "react";
import * as THREE from "three";
import type { FilmShot } from "../../core/scene/FilmScene.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { mulberry32 } from "../../kits/abyssforge/core/motion";
import {
  Bolt,
  Charge,
  CloudPuffs,
  GlowBall,
  Ground,
  LabelPlate,
  makeBolt,
  makeTower,
  Rain,
  Ring,
  StormFog,
  tipOf,
  type V3,
} from "./fx.tsx";
import { clamp01, flash, lerp, ramp, SCENES, stepped, type SceneId } from "./timeline.ts";

/** Module-level cache keyed by call site source (scene fns switch per scene, so no React hooks here). */
const CACHE = new Map<string, unknown>();
const memo = <T,>(f: () => T): T => {
  const k = f.toString();
  if (!CACHE.has(k)) CACHE.set(k, f());
  return CACHE.get(k) as T;
};

export type SceneOut = { node: React.ReactNode; shot: FilmShot; bg: string };

const span = (id: SceneId) => SCENES.find((s) => s.id === id)!;
const prog = (t: number, id: SceneId) => {
  const s = span(id);
  return clamp01((t - s.start) / (s.end - s.start));
};
const mix = (a: string, b: string, k: number) => `#${new THREE.Color(a).lerp(new THREE.Color(b), clamp01(k)).getHexString()}`;
const L = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const shake = (t: number, amp: number): V3 => [Math.sin(t * 61) * amp, Math.sin(t * 47 + 1) * amp, 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ── shared village ─────────────────────────────────────────────────────────────────────────
export const TREE_TOP: V3 = [-3.4, 5.5, -1];
export const ANT_TOP: V3 = [3.2, 4.3, -1.2];
export const TOWER_TOP: V3 = [9, 12, -16];

const Village: React.FC<{ wet?: number }> = () => (
  <group>
    <Ground />
    <AssetModel id="two-story-house-40f6dc" size={3.4} ground position={[0, 0, 0]} rotation={[0, 0.25, 0]} />
    <AssetModel id="street-tree-0d33f3" size={5.5} ground position={[TREE_TOP[0], 0, TREE_TOP[2]]} />
    <AssetModel id="rooftop-antenna-mast-6e4944" size={4.3} ground position={[ANT_TOP[0], 0, ANT_TOP[2]]} />
    <LabelPlate text="AUDIRA" sub="STASIUN CUACA" width={1.5} position={[ANT_TOP[0], 1.1, ANT_TOP[2] + 0.45]} rotation={[0, -0.15, 0]} />
    <AssetModel id="monolith-office-tower-422420" size={12} ground position={[TOWER_TOP[0], 0, TOWER_TOP[2]]} />
    <AssetModel id="pine-tree-3ea075" size={5} ground position={[-8, 0, -7]} />
    <AssetModel id="pine-tree-3ea075" size={4.2} ground position={[6.5, 0, -6]} />
    <AssetModel id="pine-tree-3ea075" size={4.6} ground position={[-1.5, 0, -10]} />
    <AssetModel id="pine-tree-3ea075" size={3.8} ground position={[-11, 0, -2]} />
    <AssetModel id="bush-8bb596" size={1.2} ground position={[2.2, 0, 2.6]} />
    <AssetModel id="bush-8bb596" size={1.0} ground position={[-2.1, 0, 2.9]} />
    <AssetModel id="bush-8bb596" size={1.1} ground position={[4.6, 0, 1.2]} />
  </group>
);

/** Flat ceiling of storm cloud above the village. */
const makeLayer = (seed: number, w: number, d: number, n: number) => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => ({ p: [(r() - 0.5) * w, r() * 1.5, (r() - 0.5) * d] as V3, r: 2.2 + r() * 2.4 }));
};
const CloudBase: React.FC<{ y: number; glow: number }> = ({ y, glow }) => {
  const puffs = memo(() => makeLayer(31, 70, 50, 70));
  return <CloudPuffs puffs={puffs} scale={1} position={[0, y, -12]} color="#3A4556" glow={glow} />;
};

const NightLights: React.FC<{ f: number; at?: V3 }> = ({ f, at = [-3, 14, 0] }) => (
  <>
    <ambientLight intensity={0.2} />
    <hemisphereLight args={["#3A4A66", "#0E140F", 0.7]} />
    <directionalLight position={[-6, 10, 8]} intensity={1.0} color="#9FB8D9" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
    {f > 0.01 && <pointLight position={at} intensity={900 * f} distance={90} decay={1.6} color="#DDEBFF" />}
    {f > 0.01 && <directionalLight position={[at[0], 30, at[2] + 6]} intensity={3.5 * f} color="#E6EEFF" />}
  </>
);

// ── 1 hook: storm over the village, two strikes on the tall tree ───────────────────────────
const hook = (t: number): SceneOut => {
  const k = prog(t, "hook");
  const f = flash(t, 0.9) + flash(t, 3.95) + 0.5 * flash(t, 6.9, [0, 0.1]);
  const segs = memo(() => makeBolt(11, [-2.6, 34, -3], TREE_TOP, 22, 1.3, 5));
  const far = memo(() => makeBolt(12, [14, 30, -40], [16, 0, -38], 16, 1.6, 3));
  const pos = add(L([2.8, 1.0, 12], [0.9, 1.9, 8.2], k), shake(t, 0.03 * f));
  return {
    node: (
      <group>
        <Village />
        <CloudBase y={20} glow={f * 0.6} />
        <Bolt segs={segs} intensity={f} width={0.09} />
        <Bolt segs={far} intensity={0.8 * flash(t, 6.9, [0, 0.1])} width={0.12} />
        <Rain t={t} center={[pos[0], 5, pos[2] - 5]} spread={14} />
        <StormFog color="#0F1924" density={0.018} />
        <NightLights f={f} at={[-3, 12, 1]} />
      </group>
    ),
    shot: { pos, target: L([-1.6, 4.2, -1], [-2.2, 6.8, -2], k), fov: 52 },
    bg: mix("#0B141C", "#566B92", f * 0.5),
  };
};

// ── 2 cloud: crane up the cumulonimbus tower, lightning flickers inside ────────────────────
const cloud = (t: number): SceneOut => {
  const k = ramp(t, 8.45, 12.2);
  const tower = memo(() => makeTower(7));
  const g = flash(t, 9.3) * 0.9 + flash(t, 10.7) * 0.7 + flash(t, 11.6) * 0.8;
  return {
    node: (
      <group>
        <Village />
        <CloudPuffs puffs={tower} scale={36} position={[0, 0, -62]} color="#566377" glow={g * 0.7} />
        <AssetModel id="towering-cloud-2e00f1" size={22} ground position={[-22, 2, -50]} tint="#4A5568" roughness={1} />
        <AssetModel id="towering-cloud-2e00f1" size={18} ground position={[24, 2, -58]} rotation={[0, 1.2, 0]} tint="#475264" roughness={1} />
        <Rain t={t} center={[0, 5, 0]} spread={16} opacity={0.25} />
        <StormFog color="#1A2233" density={0.006} />
        <ambientLight intensity={0.3} />
        <hemisphereLight args={["#6A6F9A", "#101418", 0.9]} />
        <directionalLight position={[20, 30, 10]} intensity={1.6} color="#B7B4E0" />
        {g > 0.01 && <pointLight position={[0, 18, -58]} intensity={2500 * g} distance={70} decay={1.4} color="#C8D4FF" />}
      </group>
    ),
    shot: { pos: L([1.6, 1.6, 12], [0, 7, 18], k), target: L([0, 9, -40], [0, 22, -55], k), fov: 52 },
    bg: mix("#1A2233", "#3A4270", g * 0.4),
  };
};

// ── 3 charges: cutaway cloud, ice (+) rises, graupel (−) sinks, ground turns + ─────────────
type P = { home: V3; ph: number; sp: number };
const makeSwarm = (seed: number, n: number): P[] => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => ({ home: [(r() - 0.5) * 6, 3 + r() * 5, (r() - 0.5) * 2.4] as V3, ph: r() * 6.28, sp: 0.7 + r() * 0.8 }));
};
const charges = (t: number): SceneOut => {
  const shell = memo(() => makeTower(19));
  const ice = memo(() => makeSwarm(5, 30));
  const gr = memo(() => makeSwarm(6, 22));
  const sep = ramp(t, 17.9, 20.6);
  const sepG = ramp(t, 21.3, 23.9);
  const turb = 1 - 0.6 * Math.max(sep, sepG);
  const swirl = (p: P, i: number): V3 => [
    p.home[0] + Math.sin(t * p.sp * 1.6 + p.ph) * 1.1 * turb,
    p.home[1] + Math.cos(t * p.sp * 1.9 + p.ph) * 1.3 * turb,
    p.home[2] + Math.sin(t * p.sp + i) * 0.4 * turb,
  ];
  const k = prog(t, "charges");
  const camY = lerp(5.5, 3.4, ramp(t, 23.6, 26.0));
  const tgtY = lerp(5.6, 3.6, ramp(t, 23.6, 26.0));
  const a = lerp(-0.25, 0.25, k);
  const groundX = [-4.5, -3, -1.5, 0, 1.5, 3, 4.5];
  return {
    node: (
      <group>
        <CloudPuffs puffs={shell} scale={13} position={[0, -0.6, -5]} color="#4A5568" glow={0.05} />
        <AssetModel id="towering-cloud-2e00f1" size={16} ground position={[0, -1.2, -9]} tint="#36404F" roughness={1} />
        {/* lab floor = ground under the cloud */}
        <mesh position={[0, -1.6, 0]}>
          <boxGeometry args={[14, 0.4, 4]} />
          <meshStandardMaterial color="#2F4A33" roughness={0.9} />
        </mesh>
        <AssetModel id="pine-tree-3ea075" size={1.4} ground position={[-5.5, -1.4, 0.6]} />
        <AssetModel id="two-story-house-40f6dc" size={1.3} ground position={[5.2, -1.4, 0.4]} rotation={[0, -0.4, 0]} />
        {ice.map((p, i) => {
          const s = swirl(p, i);
          const dest: V3 = [((i % 10) - 4.5) * 0.95, 9.6 + Math.floor(i / 10) * 0.55, (i % 3) * 0.4 - 0.4];
          const q = L(s, dest, sep);
          return (
            <group key={`i${i}`} position={q}>
              <mesh rotation={[t * p.sp, t * 0.7 + i, 0]}>
                <octahedronGeometry args={[0.13, 0]} />
                <meshStandardMaterial color="#DDF2FF" emissive="#7FBFFF" emissiveIntensity={0.6} roughness={0.2} />
              </mesh>
              <Charge sign="+" position={[0.22, 0.22, 0.1]} size={0.32} opacity={ramp(t, 18.1 + (i % 6) * 0.12, 18.6 + (i % 6) * 0.12)} />
            </group>
          );
        })}
        {gr.map((p, i) => {
          const s = swirl(p, i + 40);
          const dest: V3 = [((i % 11) - 5) * 0.85, 2.3 + Math.floor(i / 11) * 0.6, (i % 2) * 0.5 - 0.2];
          const q = L(s, dest, sepG);
          return (
            <group key={`g${i}`} position={q}>
              <mesh>
                <icosahedronGeometry args={[0.2, 1]} />
                <meshStandardMaterial color="#C9D2DC" roughness={0.8} flatShading />
              </mesh>
              <Charge sign="-" position={[0.26, 0.26, 0.1]} size={0.34} opacity={ramp(t, 21.5 + (i % 6) * 0.12, 22.0 + (i % 6) * 0.12)} />
            </group>
          );
        })}
        {groundX.map((x, i) => (
          <Charge key={`t${i}`} sign="+" position={[x, -1.05, 1.4]} size={0.42} opacity={ramp(t, 24.6 + i * 0.08, 25.0 + i * 0.08)} />
        ))}
        {/* collision sparks while mixing */}
        {t < 17.9 &&
          [0, 1, 2, 3].map((i) => {
            const c = ((t * 2.2 + i * 0.27) % 1);
            return <GlowBall key={i} color="#BFE4FF" r={0.06 * (1 - c)} position={[Math.sin(i * 2.1 + t) * 2, 4.5 + Math.cos(i * 1.7 + t * 0.8) * 2, 0.6]} intensity={1 - c} />;
          })}
        <LabelPlate text="AUDIRA" sub="LAB CUACA" width={1.6} position={[-5.2, 11.6, -1]} />
        <ambientLight intensity={0.45} />
        <hemisphereLight args={["#8AA0C8", "#1A1F28", 0.8]} />
        <directionalLight position={[4, 12, 10]} intensity={1.8} color="#E6EEFF" />
        <directionalLight position={[-6, 4, -8]} intensity={2.4} color="#6FD8FF" />
      </group>
    ),
    shot: { pos: [Math.sin(a) * 18, camY, Math.cos(a) * 18], target: [0, tgtY, 0], fov: 46 },
    bg: "#0E1822",
  };
};

// ── 4 leader: stepped leader zig-zags down, streamers rise from tree / antenna / tower ─────
const LEADER_TOP: V3 = [-2.4, 20, -2.5];
const leader = (t: number): SceneOut => {
  const segs = memo(() => makeBolt(41, LEADER_TOP, [TREE_TOP[0], 6.9, TREE_TOP[2]], 14, 1.1, 5));
  const sTree = memo(() => makeBolt(42, TREE_TOP, [TREE_TOP[0] + 0.1, 6.9, TREE_TOP[2]], 4, 0.15, 0));
  const sAnt = memo(() => makeBolt(43, ANT_TOP, [ANT_TOP[0] - 0.2, 5.6, ANT_TOP[2]], 4, 0.15, 0));
  const sTow = memo(() => makeBolt(44, TOWER_TOP, [TOWER_TOP[0] - 0.2, 13.8, TOWER_TOP[2]], 4, 0.2, 0));
  const rev = stepped(t, 28.3, 39.4, 14);
  const tip = tipOf(segs, rev);
  const step = (t - 28.3) / ((39.4 - 28.3) / 14);
  const pulse = t > 28.3 && t < 39.4 ? Math.exp(-(step % 1) * 6) : 0;
  const k1 = ramp(t, 26.6, 31.0);
  const k2 = ramp(t, 33.5, 39.5);
  const tgt: V3 = add(L([-2, 18, -2], [tip.x, tip.y - 1.5, tip.z], k1 * (1 - k2)), L([0, 0, 0], [-0.5, 7.5, -3], k2));
  const target: V3 = k2 > 0 ? L([tip.x, tip.y - 1.5, tip.z], [-0.5, 7.5, -3], k2) : L([-2, 18, -2], [tip.x, tip.y - 1.5, tip.z], k1);
  void tgt;
  const pos = L(L([5, 12, 19], [3.5, tip.y + 1, 15], k1), [6, 6.5, 20], k2);
  return {
    node: (
      <group>
        <Village />
        <CloudBase y={20.5} glow={0.15 + pulse * 0.25} />
        <Bolt segs={segs} reveal={rev} intensity={0.55 + pulse * 0.5} color="#B48CFF" core="#EDE4FF" width={0.06} />
        <Bolt segs={sTree} reveal={ramp(t, 34.7, 39.4)} intensity={0.7} color="#FF8A7A" core="#FFE8E4" width={0.05} />
        <Bolt segs={sAnt} reveal={ramp(t, 35.95, 39.4)} intensity={0.7} color="#FF8A7A" core="#FFE8E4" width={0.05} />
        <Bolt segs={sTow} reveal={ramp(t, 36.8, 39.4)} intensity={0.7} color="#FF8A7A" core="#FFE8E4" width={0.08} />
        <Charge sign="+" position={[TREE_TOP[0] + 0.5, TREE_TOP[1] + 0.2, TREE_TOP[2] + 0.4]} size={0.5} opacity={ramp(t, 34.7, 35.0)} />
        <Charge sign="+" position={[ANT_TOP[0] + 0.5, ANT_TOP[1] + 0.2, ANT_TOP[2] + 0.4]} size={0.5} opacity={ramp(t, 35.95, 36.3)} />
        <Charge sign="+" position={[TOWER_TOP[0] + 1.2, TOWER_TOP[1] + 0.4, TOWER_TOP[2]]} size={0.9} opacity={ramp(t, 36.8, 37.1)} />
        {rev > 0 && <Charge sign="-" position={[tip.x + 0.55, tip.y, tip.z + 0.3]} size={0.5} />}
        {pulse > 0.05 && <pointLight position={[tip.x, tip.y, tip.z + 1]} intensity={60 * pulse} distance={16} color="#C9A2FF" />}
        <Rain t={t} center={[pos[0], pos[1] - 2, pos[2] - 6]} spread={14} opacity={0.28} />
        <StormFog color="#0F1924" density={0.014} />
        <NightLights f={0} />
      </group>
    ),
    shot: { pos, target, fov: 54 },
    bg: "#0D1620",
  };
};

// ── 5 return stroke: channel connects, bright stroke races up, flickers 3–4× ───────────────
const stroke = (t: number): SceneOut => {
  const segs = memo(() => makeBolt(41, LEADER_TOP, TREE_TOP, 14, 1.1, 5));
  const big = flash(t, 43.3, [0, 0.12]) + flash(t, 48.9, [0, 0.45, 0.9, 1.35]) + 0.6 * flash(t, 41.6, [0]);
  const glow = t >= 43.3 ? 0.35 * Math.exp(-(t - 43.3) * 0.25) : 0.55;
  const I = t < 43.3 ? 0.55 + 0.6 * flash(t, 41.6, [0]) : glow + big;
  const head = ramp(t, 43.3, 44.2);
  const hy = lerp(TREE_TOP[1], LEADER_TOP[1], head);
  const out = ramp(t, 43.3, 44.0);
  const k = prog(t, "stroke");
  const pos = add(L(L([5, 7, 17], [8, 11, 30], out), [6, 10, 26], ramp(t, 46, 51) * 0.5), shake(t, 0.08 * big));
  return {
    node: (
      <group>
        <Village />
        <CloudBase y={20.5} glow={0.2 + big * 0.7} />
        <Bolt segs={segs} intensity={I} color={t < 43.3 ? "#B48CFF" : "#8FB8FF"} width={t < 43.3 ? 0.06 : 0.1} />
        {t >= 43.3 && t < 44.3 && <GlowBall color="#FFFFFF" r={0.35} position={[lerp(TREE_TOP[0], LEADER_TOP[0], head), hy, -1.5]} intensity={1.5} />}
        {t >= 41.4 && t < 42.4 && <GlowBall color="#FFE6FF" r={0.3 * (1 - ramp(t, 41.6, 42.4))} position={[TREE_TOP[0], 6.9, TREE_TOP[2]]} intensity={1.4} />}
        <Rain t={t} center={[pos[0] - 3, 6, pos[2] - 10]} spread={18} opacity={0.3} />
        <StormFog color="#0F1924" density={0.012} />
        <NightLights f={big * 0.9 + (t >= 43.3 ? glow * 0.3 : 0)} at={[-3, 12, 1]} />
      </group>
    ),
    shot: { pos, target: L([-1.5, 8.5, -2], [-1.5, 11, -2], out + k * 0.1), fov: 52 },
    bg: mix("#0B141C", "#7F95C4", big * 0.5),
  };
};

// ── 6 heat + thunder: close-up of the 28,000 °C channel, air expands → sound rings ────────
const heat = (t: number): SceneOut => {
  const segs = memo(() => makeBolt(61, [0, 9, 0], [0, -9, 0], 20, 0.45, 2));
  const puffs = memo(() => makeTower(23));
  const hot = 1.2 + 0.25 * Math.sin(t * 9) + 0.6 * ramp(t, 51.3, 52.5);
  const sunOp = ramp(t, 55.5, 56.1) * (1 - ramp(t, 57.9, 58.4));
  // expand 58.4–59.8, shrink 59.8–60.7, then travel outward from 61.3
  const r0 = 0.25 + 1.4 * ramp(t, 58.4, 59.7) - 0.6 * ramp(t, 59.8, 60.6);
  const travel = Math.max(0, t - 61.3);
  const ringsY = [-3, -1, 1, 3];
  const k1 = ramp(t, 51, 58);
  const k2 = ramp(t, 60.5, 63.8);
  const pos = L(L([1.6, -1.6, 4.6], [2.4, 1.2, 6.2], k1), [4.5, 2.6, 13], k2);
  return {
    node: (
      <group>
        <CloudPuffs puffs={puffs} scale={30} position={[0, -14, -26]} color="#2F3846" glow={0.1} />
        <Bolt segs={segs} intensity={hot} color="#FFB547" core="#FFF6E8" width={0.16} />
        {/* heated air sleeve */}
        <mesh>
          <cylinderGeometry args={[0.45 + Math.max(0, r0 - 0.25) * 0.6, 0.45 + Math.max(0, r0 - 0.25) * 0.6, 18, 32, 1, true]} />
          <meshBasicMaterial color="#FF8A3A" transparent opacity={0.1 + 0.08 * ramp(t, 58.4, 59.7)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />
        </mesh>
        {t < 61.3
          ? ringsY.map((y) => <Ring key={y} radius={r0} opacity={0.85 * ramp(t, 58.4, 58.8)} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} tube={0.035} />)
          : [0, 0.45, 0.9].flatMap((d) =>
              ringsY.map((y) => {
                const tt = travel - d;
                if (tt < 0) return null;
                const r = 1.0 + tt * 3.2;
                return <Ring key={`${d}${y}`} radius={r} opacity={0.9 * Math.max(0, 1 - tt / 2.4)} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} tube={0.05 + tt * 0.02} />;
              }),
            )}
        {sunOp > 0.01 && (
          <group>
            <GlowBall color="#FFD36B" r={0.55} position={[2.6, 2.6, -1.5]} intensity={0.55 * sunOp} />
            <LabelPlate text="MATAHARI" sub="permukaan" width={1.4} position={[2.6, 1.5, -1.2]} opacity={sunOp} accent="#FFD36B" />
          </group>
        )}
        <Rain t={t} center={[pos[0], pos[1], pos[2] - 4]} spread={9} height={10} opacity={0.22} />
        <StormFog color="#0B141C" density={0.03} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0.8, 0, 1.2]} intensity={40 * hot} distance={14} color="#FFB06A" />
        <directionalLight position={[-6, 4, -8]} intensity={1.6} color="#6FD8FF" />
      </group>
    ),
    shot: { pos, target: L([0, 0.4, 0], [0, 0.8, 0], k2), fov: 48 },
    bg: "#0B141C",
  };
};

// ── 7 distance: child watches a far storm; light arrives at once, sound ring takes 3 s ─────
const STRIKE: V3 = [-26, 0, -88];
const distance = (t: number): SceneOut => {
  const tower = memo(() => makeTower(29));
  const segs = memo(() => makeBolt(71, [STRIKE[0] - 1.5, 26, STRIKE[2]], STRIKE, 16, 1.4, 3));
  const f = flash(t, 64.1) + flash(t, 69.8);
  const dist = Math.hypot(STRIKE[0], STRIKE[2]);
  const speed = dist / 3.0; // 3 s from flash to child = "tiga detik ≈ satu kilometer"
  const rings = [64.1, 69.8].map((at) => {
    const tt = t - at;
    return tt > 0 ? { r: tt * speed, op: tt < 3.3 ? 0.9 : Math.max(0, 0.9 - (tt - 3.3) * 1.2) } : null;
  });
  const k = prog(t, "distance");
  const pos = L([1.3, 1.6, 4.0], [2.6, 2.3, 6.6], k);
  return {
    node: (
      <group>
        <Ground />
        <AssetModel id="neighborhood-child-8cc5ac" size={1.3} ground position={[0, 0, 0]} rotation={[0, Math.PI + 0.25, 0]} clip="Idle" clipTime={t} />
        <AssetModel id="two-story-house-40f6dc" size={3.4} ground position={[2.6, 0, -4.5]} rotation={[0, -0.3, 0]} />
        <AssetModel id="bush-8bb596" size={1.0} ground position={[-1.4, 0, -0.8]} />
        <AssetModel id="street-tree-0d33f3" size={5} ground position={[-5, 0, -8]} />
        <AssetModel id="pine-tree-3ea075" size={4.5} ground position={[8, 0, -14]} />
        <CloudPuffs puffs={tower} scale={34} position={[STRIKE[0] - 2, 0, STRIKE[2] - 12]} color="#465166" glow={f * 0.6} />
        <Bolt segs={segs} intensity={f * 1.1} width={0.25} />
        {rings.map((g, i) => g && <Ring key={i} radius={g.r} opacity={g.op} position={[STRIKE[0], 0.15, STRIKE[2]]} rotation={[-Math.PI / 2, 0, 0]} tube={0.25} />)}
        <StormFog color="#121B28" density={0.006} />
        <ambientLight intensity={0.25} />
        <hemisphereLight args={["#46557A", "#10160F", 0.8]} />
        <directionalLight position={[-6, 10, -8]} intensity={1.4} color="#9FB8D9" />
        <pointLight position={[2.4, 1.5, -2.6]} intensity={14} distance={8} color="#FFB46B" />
        {f > 0.01 && <directionalLight position={[STRIKE[0], 30, STRIKE[2]]} intensity={4 * f} color="#DDEBFF" />}
      </group>
    ),
    shot: { pos, target: L([-6, 4, -50], [-10, 5, -60], k), fov: 50 },
    bg: mix("#121B28", "#4A5C82", f * 0.45),
  };
};

// ── 8 safety: the child goes indoors, warm window, distant flashes; outro card follows ─────
const safety = (t: number): SceneOut => {
  const tower = memo(() => makeTower(37));
  const segs = memo(() => makeBolt(81, [-20, 26, -40], [-18, 0, -38], 14, 1.4, 3));
  const f = flash(t, 77.6) + flash(t, 80.9);
  const w = ramp(t, 78.4, 81.8);
  const gone = ramp(t, 81.8, 82.4);
  const cpos = L([2.8, 0, 5.2], [0.5, 0, 2.1], w);
  const k = prog(t, "safety");
  return {
    node: (
      <group>
        <Ground />
        <AssetModel id="two-story-house-40f6dc" size={3.4} ground position={[0, 0, 0]} />
        <AssetModel id="street-tree-0d33f3" size={5.5} ground position={[-4, 0, -1.5]} />
        <AssetModel id="bush-8bb596" size={1.1} ground position={[2.4, 0, 2.2]} />
        <AssetModel id="bush-8bb596" size={0.9} ground position={[-2.2, 0, 2.4]} />
        {gone < 0.99 && (
          <group position={cpos} scale={1 - gone}>
            <AssetModel id="neighborhood-child-8cc5ac" size={1.3} ground rotation={[0, Math.atan2(-2.3, -3.1), 0]} clip={w > 0 && w < 1 ? "Walk" : "Idle"} clipTime={t} />
          </group>
        )}
        <CloudPuffs puffs={tower} scale={30} position={[-22, 0, -60]} color="#465166" glow={f * 0.6} />
        <Bolt segs={segs} intensity={f} width={0.18} />
        <Rain t={t} center={[2, 4, 4]} spread={12} opacity={0.3} />
        <StormFog color="#121B28" density={0.012} />
        <ambientLight intensity={0.25} />
        <hemisphereLight args={["#46557A", "#10160F", 0.8]} />
        <directionalLight position={[6, 10, 8]} intensity={1.2} color="#9FB8D9" />
        <pointLight position={[0, 1.4, 1.8]} intensity={18 + 10 * gone} distance={9} color="#FFB46B" />
        {f > 0.01 && <directionalLight position={[-20, 30, -30]} intensity={3 * f} color="#DDEBFF" />}
      </group>
    ),
    shot: { pos: L([3.6, 1.6, 9], [5.2, 3.0, 13], k), target: [0.6, 1.5, 0], fov: 46 },
    bg: mix("#121B28", "#4A5C82", f * 0.4),
  };
};

/** Scene functions call useMemo, so they are used as hooks from one component (stable order per scene id). */
export const SCENE_FN: Record<SceneId, (t: number) => SceneOut> = { hook, cloud, charges, leader, stroke, heat, distance, safety };
