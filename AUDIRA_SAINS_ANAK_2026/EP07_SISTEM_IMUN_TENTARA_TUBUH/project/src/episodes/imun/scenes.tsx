// EP07 Sistem Imun — one component + camera pose + fog per scene (multi-scene director, see ImunFilm.tsx).
// Every pose moves through its scene (push, truck, crane, orbit, whip-pan); nothing is parked.
import React from "react";
import * as THREE from "three";
import type { FilmShot } from "../../core/scene/FilmScene.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { NANO_PALETTE as P } from "../../kits/nanoforge/lib/palette";
import { hash } from "../../kits/nanoforge/core/noise";
import {
  Antibody, BCell, Bacterium, InfectedCell, LabelPlate, Macrophage, Medium, MemoryCell, Neutrophil, RedCell, TCell,
  bumpyGeo, tissueGeo, vesselGeo,
} from "./cells.tsx";
import { lerp, lerp3, pop, prog, ramp, type SceneId, type V3 } from "./timeline.ts";

export type SceneOut = { node: React.ReactNode; shot: FilmShot; bg: string; fog: [string, number, number] };

const F = (t: number) => t * 60; // 60 fps film clock for cell drift / ToyPerson

// ─────────────────────────────────────────── shared sets
const Room: React.FC<{ night?: boolean }> = ({ night = false }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 12]} />
      <meshStandardMaterial color={night ? "#1e293b" : "#8b5e3c"} roughness={0.7} />
    </mesh>
    <mesh position={[0, 3, -3.2]} receiveShadow>
      <planeGeometry args={[14, 6]} />
      <meshStandardMaterial color={night ? "#1e3a5f" : "#e8c9a0"} roughness={0.9} />
    </mesh>
    <mesh position={[-3.6, 3, 1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color={night ? "#172554" : "#d9b48a"} roughness={0.9} />
    </mesh>
    {/* window */}
    <group position={[1.6, 2.6, -3.15]}>
      <mesh>
        <planeGeometry args={[2.2, 1.7]} />
        <meshBasicMaterial color={night ? "#0b1f4a" : "#ffb35c"} toneMapped={false} />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 0, 0.04]}>
          <capsuleGeometry args={[0.06, 1.7, 4, 8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.04]}>
        <capsuleGeometry args={[0.04, 1.6, 4, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      {night && (
        <mesh position={[0.5, 0.35, 0.02]}>
          <circleGeometry args={[0.28, 40]} />
          <meshBasicMaterial color="#fef9c3" toneMapped={false} />
        </mesh>
      )}
    </group>
    <AssetModel id="bed-6e10e8" assetType="prop" size={2.4} ground position={[-1.2, 0, -1.6]} />
    <AssetModel id="bedside-table-740c6b" assetType="prop" size={0.75} ground position={[0.6, 0, -2.5]} />
  </group>
);

/** Blood-vessel tunnel along -z with flowing red cells. zc = camera z. */
const Vessel: React.FC<{ t: number; alarm?: number }> = ({ t, alarm = 0 }) => {
  const f = F(t);
  return (
    <group>
      <mesh geometry={vesselGeo(4, 90)} position={[0, 0, -25]}>
        <meshPhysicalMaterial color="#9f1239" roughness={0.55} sheen={0.8} sheenColor="#fb7185" emissive="#4c0519" emissiveIntensity={0.35} side={THREE.BackSide} />
      </mesh>
      {Array.from({ length: 60 }, (_, i) => {
        const a = hash(i * 5 + 1) * Math.PI * 2;
        const r = 1.7 + hash(i * 5 + 2) * 1.6;
        const z = -66 + ((hash(i * 5 + 3) * 86 + t * 1.1) % 86);
        return <RedCell key={i} f={f} pos={[Math.cos(a) * r, Math.sin(a) * r, z]} s={0.42 + hash(i) * 0.12} rot={[t * 0.5 + i, t * 0.3 + i * 2, 0]} />;
      })}
      <pointLight position={[0, 2.5, -1.4 * (t - 6.23) - 3]} intensity={30} distance={18} color="#ffd0c0" />
      <pointLight position={[-2.5, -1.5, -1.4 * (t - 6.23) - 7]} intensity={22} distance={14} color={P.thymineCyan} />
      {alarm > 0 && <pointLight position={[1.5, 1.5, -1.4 * (t - 6.23) - 5]} intensity={60 * alarm * (0.5 + 0.5 * Math.sin(t * 14))} distance={16} color="#ff1a1a" />}
    </group>
  );
};

// ─────────────────────────────────────────── 1 hook
const hook = (t: number): SceneOut => {
  const f = F(t);
  if (t < 3.4) {
    // room at dusk, push in to the glowing forearm
    const k = ramp(t, 0, 3.4);
    const glow = ramp(t, 1.2, 2.6);
    const arm: V3 = [-0.12, 0.55, 0.75];
    return {
      node: (
        <group>
          <Room />
          <ToyPerson f={f} seed={4} pose="stand" position={[-0.35, 0, 0.6]} heading={0.35} scale={0.7} expression="neutral" />
          <mesh position={arm}>
            <sphereGeometry args={[0.022 + glow * 0.014, 20, 20]} />
            <meshBasicMaterial color={P.thymineCyan} transparent opacity={glow} toneMapped={false} />
          </mesh>
          <pointLight position={arm} intensity={6 * glow} distance={2.5} color={P.thymineCyan} />
          <ambientLight intensity={0.35} color="#ffd9b0" />
          <directionalLight position={[2.5, 4, -2]} intensity={2.6} color="#ff9f45" castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-3, 3, 4]} intensity={0.6} color="#9ec5ff" />
        </group>
      ),
      shot: { pos: lerp3([1.2, 1.6, 5.4], [0.35, 0.85, 2.3], k), target: lerp3([-0.6, 0.9, -0.6], arm, k), fov: lerp(40, 32, k) },
      bg: "#2b1a12",
      fog: ["#2b1a12", 12, 30],
    };
  }
  // inside the vessel: neutrophil chases a bacterium, red alarm
  const zc = -1.4 * (t - 6.23);
  const bz = zc - 5.5 + Math.sin(t * 3) * 0.2;
  return {
    node: (
      <group>
        <Vessel t={t} alarm={ramp(t, 3.4, 3.8)} />
        <Bacterium f={f} pos={[0.9 + Math.sin(t * 4) * 0.35, 0.2 + Math.cos(t * 3.3) * 0.3, bz]} s={0.9} rot={[0.5, 0, 1.2]} glow={0.4} />
        <Neutrophil f={f} pos={[lerp(-1.6, -0.2, ramp(t, 3.4, 6.2)), -0.5, zc - 5.2]} s={0.95} seed={2} reach={[0.4, 0.2, -1]} reachK={ramp(t, 4.6, 6)} />
        <ambientLight intensity={0.3} color="#ff9aa2" />
      </group>
    ),
    shot: { pos: [0.5, 0.35, zc], target: [0.2, 0, zc - 6], fov: 44, roll: Math.sin(t * 2) * 0.03 },
    bg: "#1a0308",
    fog: ["#1a0308", 4, 22],
  };
};

// ─────────────────────────────────────────── 2 patrol
const patrol = (t: number): SceneOut => {
  const f = F(t);
  const zc = -1.4 * (t - 6.23);
  const crowd = ramp(t, 12.2, 13.4);
  const others: { kind: "t" | "b" | "m"; p: V3 }[] = [
    { kind: "t", p: [2.0, 1.3, -9] },
    { kind: "b", p: [-2.2, 1.4, -10.5] },
    { kind: "m", p: [2.3, -1.4, -12] },
    { kind: "t", p: [-2.4, -1.3, -11.5] },
    { kind: "b", p: [0.2, 2.2, -13] },
  ];
  return {
    node: (
      <group>
        <Vessel t={t} />
        {/* hero neutrophil cruising just ahead of the lens */}
        <Neutrophil f={f} pos={[-0.3 + Math.sin(t * 0.8) * 0.3, -1.0, zc - 5.8]} s={1.0} seed={2} glow={0.15} />
        {/* crowd: 7 neutrophils (white, majority) + 5 other white cells */}
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2 + 0.3;
          return (
            <Neutrophil key={i} f={f} seed={i + 3} pos={[Math.cos(a) * 1.9, Math.sin(a) * 1.6, zc - 8.5 - hash(i) * 4]} s={0.75} q={pop(t, 12.2 + i * 0.12)} glow={0.35 * ramp(t, 14.8, 15.4)} />
          );
        })}
        {others.map((o, i) => {
          const pos: V3 = [o.p[0] * 0.95, o.p[1] * 0.85, zc + o.p[2] - 2];
          const q = pop(t, 12.9 + i * 0.12);
          if (o.kind === "t") return <TCell key={i} f={f} pos={pos} s={0.5} q={q * (1 - 0.35 * crowd * ramp(t, 14.8, 15.4))} seed={i} />;
          if (o.kind === "b") return <BCell key={i} f={f} pos={pos} s={0.5} q={q} seed={i} />;
          return <Macrophage key={i} f={f} pos={pos} s={0.55} q={q} seed={i} />;
        })}
        <ambientLight intensity={0.3} color="#ff9aa2" />
      </group>
    ),
    shot: { pos: [0.5 + Math.sin(t * 0.5) * 0.3, 0.35, zc], target: [0.1, 0, zc - 6], fov: lerp(44, 50, ramp(t, 12, 15)), roll: Math.sin(t * 0.7) * 0.05 },
    bg: "#1a0308",
    fog: ["#1a0308", 4, 22],
  };
};

// ─────────────────────────────────────────── 3 wound
const BACT: V3[] = Array.from({ length: 8 }, (_, i) => [(hash(i + 70) - 0.5) * 5, 0.55 + hash(i + 80) * 0.5, (hash(i + 90) - 0.5) * 2.2 + 0.3]);
const NEUT_START: V3[] = [[-2.4, 0.3, -3], [-0.8, 0.3, -3], [0.8, 0.3, -3], [2.4, 0.3, -3]];
const PUS = Array.from({ length: 14 }, (_, i) => ({ p: [(hash(i + 300) - 0.5) * 3.6, 0.15, (hash(i + 310) - 0.5) * 1.6 + 0.4] as V3, s: 0.22 + hash(i + 320) * 0.25 }));

const wound = (t: number): SceneOut => {
  const f = F(t);
  const k = prog(t, "wound");
  const swallow = ramp(t, 27.0, 29.4);
  const dead = ramp(t, 29.9, 31.2);
  const pus = ramp(t, 30.6, 33.0);
  // camera: crane down 19.3–22.6, orbit 30° 22.6–29.7, push-in after
  const crane = ramp(t, 19.28, 22.6);
  const orb = ramp(t, 22.6, 29.7) * 0.52 - 0.26;
  const push = ramp(t, 29.7, 34.6);
  const r = lerp(lerp(9.5, 7.4, crane), 4.6, push);
  const h = lerp(lerp(6.5, 3.4, crane), 2.2, push);
  return {
    node: (
      <group>
        <mesh geometry={tissueGeo(3, 40, 0.3, 0.8)} receiveShadow>
          <meshPhysicalMaterial color="#f2a7b0" roughness={0.6} sheen={1} sheenColor="#ffd1d8" emissive="#5a1020" emissiveIntensity={0.12} />
        </mesh>
        {/* the scratch */}
        <mesh position={[0, 0.12, 0.4]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.6]}>
          <capsuleGeometry args={[0.32, 5.4, 8, 24]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#450a0a" emissiveIntensity={0.5} roughness={0.45} />
        </mesh>
        {/* capillary crossing the tissue */}
        <mesh position={[0, 0.3, -3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.75, 0.75, 16, 40, 1, true]} />
          <meshPhysicalMaterial color="#e11d48" roughness={0.3} transmission={0.5} thickness={0.5} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 10 }, (_, i) => (
          <RedCell key={i} f={f} pos={[-8 + ((i * 1.6 + t * 1.2) % 16), 0.3 + Math.sin(i) * 0.25, -3]} s={0.3} rot={[t + i, i, 0.5]} />
        ))}
        {/* bacteria storm in, then get swallowed */}
        {BACT.map((b, i) => {
          const fall = ramp(t, 19.6 + i * 0.25, 21.6 + i * 0.25);
          const host = NEUT_END[i % 4];
          const into = swallow * (i < 6 ? 1 : 0.0);
          const pos = lerp3(lerp3([b[0] * 1.1, 4.2, b[2] + 1.5], b, fall), host, into);
          return <Bacterium key={i} f={f} pos={pos} s={0.72 * (1 - into * 0.75)} q={into > 0.98 ? 0 : 1} seed={i} rot={[0.4 + i, 0, 1.1 + i * 0.4]} glow={0.25} dead={dead * (i >= 6 ? 1 : 0)} />;
        })}
        {/* neutrophils squeeze out of the capillary and hunt */}
        {NEUT_START.map((s0, i) => {
          const out = ramp(t, 24.6 + i * 0.25, 27.0 + i * 0.2);
          const pos = lerp3(s0, NEUT_END[i], out);
          const reach = [BACT[i][0] - pos[0], BACT[i][1] - pos[1], BACT[i][2] - pos[2]] as V3;
          return <Neutrophil key={i} f={f} seed={i + 2} pos={pos} s={0.9 * (0.7 + 0.3 * out) * (1 - dead * 0.15)} q={ramp(t, 24.4, 24.9)} reach={reach} reachK={ramp(t, 26.2, 27.4) * (1 - swallow)} dead={dead} glow={0.2} />;
        })}
        {/* pus pile */}
        {PUS.map((p, i) => (
          <mesh key={i} position={p.p} geometry={bumpyGeo(60 + (i % 5), 0.12, 4, 4)} scale={p.s * pus}>
            <meshPhysicalMaterial color="#e5c34a" roughness={0.35} clearcoat={0.6} emissive="#6b5a1a" emissiveIntensity={0.25} />
          </mesh>
        ))}
        <Medium f={f} tint={["#fda4af", P.thymineCyan, "#fde68a"]} spread={0.8} center={[0, 3, -4]} />
        <ambientLight intensity={0.45} color="#ffc4cc" />
        <directionalLight position={[3, 8, 5]} intensity={2.4} color="#ffe4d6" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-4, 2, 2]} intensity={25} distance={14} color={P.thymineCyan} />
        <pointLight position={[0, 1.5, 2]} intensity={12 * ramp(t, 19.6, 20.6) * (1 - push)} distance={8} color="#ff1a1a" />
      </group>
    ),
    shot: { pos: [Math.sin(orb) * r, h, Math.cos(orb) * r + 0.4], target: lerp3([0, 1.6, 0], [0, 0.4, 0.4], k), fov: 40 },
    bg: "#24070f",
    fog: ["#24070f", 9, 28],
  };
};
const NEUT_END: V3[] = [[-1.8, 0.75, 0.2], [-0.6, 0.75, 0.9], [0.7, 0.75, 0.3], [1.9, 0.75, 0.8]];

// ─────────────────────────────────────────── 4 macro
const DEBRIS = Array.from({ length: 10 }, (_, i) => ({ p: [(hash(i + 400) - 0.5) * 7, 0.4, 1.5 + hash(i + 410) * 2.5] as V3, s: 0.2 + hash(i + 420) * 0.18, at: 35.8 + i * 0.5 }));
const MAC: V3 = [0, 1.6, 0];
const HELPER: V3 = [4.2, 1.4, 0.5];

const macro = (t: number): SceneOut => {
  const f = F(t);
  const k = prog(t, "macro");
  const antigen = ramp(t, 41.6, 43.4);
  const command = ramp(t, 45.8, 47.5);
  const camX = lerp(-3.4, 4.6, ramp(t, 34.61, 47.0));
  return {
    node: (
      <group>
        <mesh geometry={tissueGeo(5, 40, 0.4, 0.7)} receiveShadow>
          <meshPhysicalMaterial color="#6d28d9" roughness={0.6} sheen={1} sheenColor="#c4b5fd" emissive="#2e1065" emissiveIntensity={0.25} />
        </mesh>
        <Macrophage f={f} pos={MAC} s={1.5} q={pop(t, 34.7, 0.6)} eat={ramp(t, 35.8, 41) * (0.6 + 0.4 * Math.sin(t * 6))} glow={0.3} />
        {DEBRIS.map((d, i) => {
          const e = ramp(t, d.at, d.at + 1.2);
          return (
            <mesh key={i} position={lerp3(d.p, MAC, e)} geometry={bumpyGeo(70 + (i % 4), 0.14, 4, 4)} scale={d.s * (1 - e * 0.9)}>
              <meshStandardMaterial color={i % 2 ? "#d6b84a" : "#64748b"} roughness={0.5} emissive={i % 2 ? "#6b5a1a" : "#1e293b"} emissiveIntensity={0.3} />
            </mesh>
          );
        })}
        {/* antigen fragment handed to the general */}
        {antigen > 0 && antigen < 1 && (
          <mesh position={lerp3([1.8, 2.6, 0.6], [HELPER[0] - 0.4, HELPER[1] + 0.3, HELPER[2] + 1.1], antigen)} rotation={[t * 3, t * 2, 0]} scale={0.28}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={1.4} metalness={0.5} roughness={0.2} />
          </mesh>
        )}
        <TCell f={f} pos={HELPER} s={1.05} q={pop(t, 40.6, 0.5)} badge seed={6} color="#2563eb" glow={ramp(t, 43.2, 43.8) * 0.8} />
        {/* command rings */}
        {[0, 0.45, 0.9].map((o, i) => {
          const c = ramp(t, 45.8 + o, 46.9 + o);
          if (c <= 0 || c >= 1) return null;
          return (
            <mesh key={i} position={HELPER} rotation={[Math.PI / 2, 0, 0]} scale={1.2 + c * 6}>
              <torusGeometry args={[1, 0.035, 12, 96]} />
              <meshBasicMaterial color={P.adenineGold} transparent opacity={(1 - c) * 0.9} toneMapped={false} />
            </mesh>
          );
        })}
        <LabelPlate text="AUDIRA LAB" sub="SEL IMUN" width={2.6} position={[-3.6, 1.0, 1.6]} rotation={[-0.35, 0.25, 0]} opacity={ramp(t, 35, 36)} />
        <Medium f={f} tint={[P.cytosineViolet, P.thymineCyan, P.adenineGold]} center={[0, 3, -3]} />
        <ambientLight intensity={0.4} color="#d8c8ff" />
        <directionalLight position={[-3, 8, 6]} intensity={2.2} color="#fff1e0" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[5, 3, 3]} intensity={30 * (0.6 + command)} distance={14} color={P.adenineGold} />
        <pointLight position={[-4, 2, -2]} intensity={25} distance={14} color={P.thymineCyan} />
      </group>
    ),
    shot: { pos: [camX, lerp(3.4, 2.8, k), lerp(11.5, 9.8, k)], target: lerp3([-0.2, 1.7, 0], [3.4, 1.6, 0.3], ramp(t, 40.5, 44.5)), fov: 40 },
    bg: "#12061f",
    fog: ["#12061f", 10, 30],
  };
};

// ─────────────────────────────────────────── 5 attack
const INF: V3 = [-5, 1, 0];
const BC: V3 = [2, 0.6, 0];
const TARGETS: V3[] = [[5.5, 1, -0.5], [6.2, -0.4, 0.8], [4.8, -0.9, -1]];

const attack = (t: number): SceneOut => {
  const f = F(t);
  const approach = ramp(t, 47.7, 49.4);
  const burst = ramp(t, 50.2, 51.6);
  const killer = lerp3([-8.6, 1.2, 1.2], [-6.35, 1.05, 0.45], approach);
  const whip = ramp(t, 51.6, 52.3);
  const push = ramp(t, 53.6, 57.6);
  const coat = ramp(t, 54.4, 57.2);
  const camA = lerp3([-4.2, 1.9, 6.2], [-4.6, 1.5, 4.6], ramp(t, 47.6, 51.6));
  const camB = lerp3([3.2, 1.6, 7.2], [5.1, 0.6, 3.6], push);
  const tgtA: V3 = [-5.6, 1.0, 0.2];
  const tgtB = lerp3([3.4, 0.4, 0], [5.4, 0, -0.2], push);
  return {
    node: (
      <group>
        <mesh geometry={tissueGeo(8, 40, 0.35, 0.8)} position={[0, -2.2, 0]} receiveShadow>
          <meshPhysicalMaterial color="#7c2d12" roughness={0.6} sheen={1} sheenColor="#fdba74" emissive="#431407" emissiveIntensity={0.25} />
        </mesh>
        <InfectedCell f={f} pos={INF} s={1.2} burst={burst} sick={ramp(t, 47.6, 49.5)} />
        <TCell f={f} pos={killer} s={0.95} seed={8} color="#f97316" glow={ramp(t, 49.0, 50.2)} squash={ramp(t, 49.2, 49.6) * (1 - burst)} q={1} />
        <BCell f={f} pos={BC} s={1.1} glow={ramp(t, 52.4, 53.2)} />
        {TARGETS.map((p, i) => (
          <Bacterium key={i} f={f} pos={p} s={0.75} seed={i + 20} rot={[0.3 * i, 0, 1 + i]} coat={Math.min(1, Math.max(0, coat * 1.3 - i * 0.15))} glow={0.3} />
        ))}
        {/* antibody volley: 24 Ys from the B cell */}
        {Array.from({ length: 24 }, (_, i) => {
          const at = 52.7 + i * 0.16;
          const fl = ramp(t, at, at + 0.75);
          if (fl <= 0 || fl >= 1) return null;
          const tg = TARGETS[i % 3];
          const arc = Math.sin(fl * Math.PI) * (0.6 + hash(i) * 0.6);
          const p = lerp3([BC[0] + 1, BC[1], BC[2]], tg, fl);
          return <Antibody key={i} pos={[p[0], p[1] + arc, p[2] + (hash(i + 5) - 0.5)]} s={0.34} rot={[0, 0, -Math.PI / 2 + Math.sin(i) * 0.4]} />;
        })}
        <Medium f={f} tint={["#fdba74", P.thymineCyan, P.lipidAmber]} center={[0, 1, -3]} />
        <ambientLight intensity={0.4} color="#ffd7b5" />
        <directionalLight position={[2, 8, 6]} intensity={2.3} color="#fff4e6" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-5, 2.5, 2]} intensity={40 * (0.4 + burst)} distance={10} color="#ff5a1f" />
        <pointLight position={[4.5, 2, 2]} intensity={30} distance={12} color={P.thymineCyan} />
      </group>
    ),
    shot: { pos: lerp3(camA, camB, whip), target: lerp3(tgtA, tgtB, whip), fov: 40, roll: Math.sin(whip * Math.PI) * 0.12 },
    bg: "#1c0a04",
    fog: ["#1c0a04", 9, 26],
  };
};

// ─────────────────────────────────────────── 6 memory
const MEM: V3[] = Array.from({ length: 7 }, (_, i) => {
  const a = -1.15 + (i / 6) * 2.3;
  return [Math.sin(a) * 3.6, 1.4 + (i % 2) * 0.5, -1 - Math.cos(a) * 2.4];
});
const MEM_SIEGE: V3[] = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * Math.PI * 2;
  return [3 + Math.cos(a) * 1.7, 1.8 + Math.sin(a) * 1.4, 0.4 + Math.sin(a * 2) * 0.4];
});

const memory = (t: number): SceneOut => {
  const f = F(t);
  const siege = ramp(t, 69.4, 70.4);
  const invader = lerp3([9.5, 1.8, 0.6], [3, 1.8, 0.4], ramp(t, 68.2, 69.6));
  const pull = ramp(t, 57.62, 66.5);
  const rush = ramp(t, 68.6, 70.2);
  const pos = lerp3(lerp3([0, 2.6, 5.5], [0, 3.6, 10.5], pull), [3.4, 2.2, 5.4], rush);
  const tgt = lerp3([0, 2.0, -1.5], [3, 1.8, 0.4], rush);
  return {
    node: (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[14, 80]} />
          <meshPhysicalMaterial color="#1e3a8a" roughness={0.35} clearcoat={0.6} emissive="#0c1a4a" emissiveIntensity={0.4} />
        </mesh>
        {/* golden ribs of the barracks */}
        {[-6, -3, 0, 3].map((z, i) => (
          <mesh key={i} position={[0, 0, z]}>
            <torusGeometry args={[6.2, 0.13, 16, 96, Math.PI]} />
            <meshPhysicalMaterial color={P.adenineGold} metalness={0.8} roughness={0.25} emissive={P.adenineGold} emissiveIntensity={0.35} />
          </mesh>
        ))}
        <LabelPlate text="BARAK AUDIRA" sub="SEL MEMORI" width={3.1} position={[0, 4.2, -4]} />
        {MEM.map((p, i) => (
          <MemoryCell key={i} f={f} pos={lerp3(p, MEM_SIEGE[i], siege)} s={0.72} q={pop(t, 58.8 + i * 0.3, 0.5)} seed={i + 30} glow={ramp(t, 61.7, 62.4) + siege} />
        ))}
        {/* hologram of the enemy's face */}
        <group position={[0, 2.3, -1.3]}>
          <Bacterium f={f} pos={[0, 0, 0]} s={1.1} q={ramp(t, 62.8, 63.4) * (1 - ramp(t, 67.4, 67.9))} seed={41} rot={[0.2, 0, 1.3]} ghost={1} glow={0.8} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]}>
            <ringGeometry args={[0.9, 1.05, 64]} />
            <meshBasicMaterial color={P.thymineCyan} transparent opacity={0.7 * ramp(t, 62.8, 63.4) * (1 - ramp(t, 67.4, 67.9))} toneMapped={false} />
          </mesh>
        </group>
        <Bacterium f={f} pos={invader} s={0.85} q={ramp(t, 68.1, 68.3)} seed={41} rot={[0.2, 0, 1.3]} coat={ramp(t, 70.0, 70.9)} glow={0.3} />
        <Medium f={f} tint={[P.membraneGlow, P.adenineGold, P.thymineCyan]} center={[0, 3, -4]} />
        <ambientLight intensity={0.45} color="#bfdbfe" />
        <directionalLight position={[-4, 9, 6]} intensity={2.0} color="#fff7e6" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0, 4, 1]} intensity={30} distance={14} color={P.adenineGold} />
        <pointLight position={[4, 2, 3]} intensity={50 * siege} distance={10} color="#ffffff" />
      </group>
    ),
    shot: { pos, target: tgt, fov: lerp(40, 36, rush) },
    bg: "#050c24",
    fog: ["#050c24", 12, 32],
  };
};

// ─────────────────────────────────────────── 7 outro
const outro = (t: number): SceneOut => {
  const k = ramp(t, 71.12, 79.2);
  const bedTop = 0.8;
  return {
    node: (
      <group>
        <Room night />
        {/* child asleep on the bed */}
        <group position={[-1.2, bedTop, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ToyPerson f={0} seed={4} pose="stand" position={[0, -0.75, 0]} scale={0.7} shadows={false} expression="neutral" />
        </group>
        {/* the night patrol: cyan sparks along the body */}
        {Array.from({ length: 6 }, (_, i) => {
          const u = (t * 0.22 + i / 6) % 1;
          const p: V3 = [-1.2 + Math.sin(u * Math.PI * 4 + i) * 0.14, bedTop + 0.17, -1.95 + u * 1.25];
          return (
            <group key={i} position={p}>
              <mesh>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshBasicMaterial color={P.thymineCyan} toneMapped={false} />
              </mesh>
              <pointLight intensity={0.8} distance={0.8} color={P.thymineCyan} />
            </group>
          );
        })}
        <ambientLight intensity={0.25} color="#93c5fd" />
        <directionalLight position={[2.5, 4, -2]} intensity={1.4} color="#c7d7ff" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0.6, 1.2, -2.2]} intensity={3} distance={4} color="#fbbf24" />
      </group>
    ),
    shot: { pos: lerp3([-0.6, 1.5, 0.9], [1.6, 3.4, 4.2], k), target: lerp3([-1.2, 0.7, -1.3], [-0.6, 0.9, -1.4], k), fov: 38 },
    bg: "#0b1530",
    fog: ["#0b1530", 10, 24],
  };
};

export const SCENE_FN: Record<SceneId, (t: number) => SceneOut> = { hook, patrol, wound, macro, attack, memory, outro };
