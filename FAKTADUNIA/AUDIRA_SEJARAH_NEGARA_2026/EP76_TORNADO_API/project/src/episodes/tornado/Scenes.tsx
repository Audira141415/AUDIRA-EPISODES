// EP76 scenes (multi-scene director law): each scene owns its set, lights, fog and camera rig.
// T = film seconds, t = seconds since the scene started.
import React, { useMemo } from "react";
import * as THREE from "three";
import { shotPlan, frame as fr, pushIn, orbit, crane, pullOut } from "../../core/camera/moves.ts";
import type { Key } from "../../core/motion/track.ts";
import { AssetModel } from "../../core/assets/AssetModel";
import { ToyPerson } from "../../core/polish/Person.tsx";
import { DISASTER_PALETTE as P } from "../../kits/disastersim/lib/palette";
import { clamp, lerp, prng, seg, smooth } from "../../kits/disastersim/core/motion";
import { AshPlume, fbm, fx, Glow, Label3D, Ring, SkyDome } from "./Set";
import { FireWhirl, Flame } from "./FireWhirl";
import { BEAT, SC, type SceneId } from "./timeline";

const CLOCK = 60;
type SceneDef = {
  World: React.FC<{ T: number; t: number }>;
  rig: Key[];
  bg: string;
  fog: [number, number];
  key: { pos: [number, number, number]; color: string; intensity: number; ambient: number; sky: string; ground: string };
};

// ---------- helpers ----------
const terrainH = (x: number, z: number, seed: number, height: number, flat: number) =>
  (fbm(x * 0.08, z * 0.08, seed) * 0.5 + 0.5) * height * smooth((Math.hypot(x, z) - flat) / 8);

const Terrain: React.FC<{ size: number; height: number; seed: number; low: string; high: string; y?: number; flat?: number }> = ({ size, height, seed, low, high, y = 0, flat = 6 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 90, 90);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const a = new THREE.Color(low);
    const b = new THREE.Color(high);
    const c = new THREE.Color();
    const cols: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainH(x, z, seed, height, flat);
      pos.setY(i, h);
      c.copy(a).lerp(b, clamp(h / Math.max(height, 0.01) + 0.2 * fbm(x * 0.4, z * 0.4, seed + 2)));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }, [size, height, seed, low, high, flat]);
  return (
    <mesh geometry={geo} position={[0, y, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} flatShading />
    </mesh>
  );
};

/** Seeded ring of models (forest), skipping a clear radius. */
const scatter = (n: number, seed: number, rMin: number, rMax: number, zMax = 999) => {
  const r = prng(seed);
  const out: [number, number, number, number][] = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    const a = r() * Math.PI * 2;
    const d = lerp(rMin, rMax, Math.sqrt(r()));
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (z > zMax) continue;
    out.push([x, z, r(), r()]);
  }
  return out;
};

const Model: React.FC<{ id: string; type: string; size: number; position: [number, number, number]; rot?: number; color?: string }> = ({ id, type, size, position, rot = 0, color }) => (
  <group position={position} rotation={[0, rot, 0]}>
    <AssetModel id={id} assetType={type as never} size={size} ground {...(color ? { color } : {})} />
  </group>
);

const Arrow: React.FC<{ len: number; r: number; color: string; o?: number; intensity?: number }> = ({ len, r, color, o = 1, intensity = 1.6 }) => (
  <group>
    <mesh ref={fx} position={[0, len * 0.4, 0]}>
      <cylinderGeometry args={[r, r, len * 0.8, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={o} toneMapped={false} />
    </mesh>
    <mesh ref={fx} position={[0, len * 0.9, 0]}>
      <coneGeometry args={[r * 2.6, len * 0.25, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={o} toneMapped={false} />
    </mesh>
  </group>
);

const LabFloor: React.FC<{ r?: number }> = ({ r = 5 }) => (
  <group>
    <mesh position={[0, -0.15, 0]} receiveShadow>
      <cylinderGeometry args={[r, r + 0.15, 0.3, 64]} />
      <meshStandardMaterial color={P.plinth} roughness={0.5} metalness={0.35} />
    </mesh>
    <gridHelper args={[80, 80, P.grid, P.grid]} position={[0, -0.31, 0]} />
  </group>
);

const PINE = { id: "tall-pine-tree-ab4108", type: "prop" };
const YPINE = { id: "young-pine-0d7695", type: "prop" };
const DEAD = { id: "dead-tree-6795fa", type: "prop" };
const STUMP = { id: "tree-stump-ec3f48", type: "prop" };

// =============== S1 — Hook: hutan malam + kolom pusaran api ===============
const S1_TREES = scatter(26, 11, 5, 26);
const S1: React.FC<{ T: number; t: number }> = ({ T }) => (
  <group>
    <SkyDome top="#141822" horizon="#B4502A" bottom="#1A120E" />
    <Glow position={[0, 6, -30]} size={40} color="#FF7A3A" opacity={0.55} />
    <Terrain size={120} height={5} seed={3} low="#2E2620" high="#45372B" flat={8} />
    <FireWhirl t={T} height={17} r0={1.3} r1={3.2} twist={8} spin={3.4} sway={0.8} grow={0.75 + 0.25 * seg(T, 0, 2)} position={[0, 0, -4]} light={60} />
    {[-2.4, -1, 1.2, 2.6, 3.6, -3.4].map((x, i) => (
      <Flame key={i} t={T} size={0.55 + (i % 3) * 0.2} position={[x, 0, -4 + ((i * 1.7) % 3) - 1.2]} seed={i} />
    ))}
    {S1_TREES.map(([x, z, a, b], i) => (
      <Model key={i} {...(b > 0.35 ? PINE : YPINE)} size={b > 0.35 ? 5 + a * 2 : 2.6 + a} position={[x, terrainH(x, z, 3, 5, 8), z - 4]} rot={a * 6} />
    ))}
    <Model {...YPINE} size={3.4} position={[2.6, 0, 7.4]} rot={1} />
    <Model {...PINE} size={6} position={[-3.2, 0, 6.2]} rot={2} />
    <AshPlume t={T + 6} origin={[0, 14, -4]} height={10} spread={9} count={70} rise={4} color="#4A4440" seed={21} glowBase={false} />
  </group>
);
const RIG1 = shotPlan(CLOCK, { target: [0, 4.5, -4], az: 8, el: 3, dist: 17, fov: 44 }, [
  { at: 1.6, move: fr({ target: [0, 8, -4], az: 2, el: 10, dist: 25 }) },
  { at: 4.0, move: pushIn(0.88) },
]);

// =============== S2 — Redding, 26 Juli 2018 ===============
const S2_TREES = scatter(34, 22, 9, 34, 6);
const FIRE_LINE = Array.from({ length: 16 }, (_, i) => {
  const x = -18 + i * 2.4;
  const z = -15 - 3 * Math.sin(i * 0.7);
  return [x, z] as [number, number];
});
const S2: React.FC<{ T: number; t: number }> = ({ T, t }) => {
  const born = seg(T, BEAT.kolom - 0.3, BEAT.berputar + 1.2);
  const wx = -3;
  const wz = -12;
  return (
    <group>
      <SkyDome top="#2B2A33" horizon="#C9733E" bottom="#2A2218" />
      <Glow position={[-6, 5, -40]} size={46} color="#FF8A3A" opacity={0.5} />
      <Terrain size={140} height={9} seed={8} low="#4F4530" high="#6C5A3C" flat={11} />
      {FIRE_LINE.map(([x, z], i) => (
        <Flame key={i} t={T} size={0.9 + (i % 3) * 0.3} position={[x, terrainH(x, z, 8, 9, 11), z]} seed={i} />
      ))}
      <AshPlume t={T + 8} origin={[0, 2, -18]} height={16} spread={14} count={90} rise={5} color="#5A524C" seed={31} glowBase />
      {S2_TREES.map(([x, z, a, b], i) => (
        <Model key={i} {...(b > 0.3 ? PINE : YPINE)} size={b > 0.3 ? 4.5 + a * 2 : 2.4} position={[x, terrainH(x, z, 8, 9, 11), z]} rot={a * 6} />
      ))}
      <Model id="two-storey-family-house-c63c4a" type="building" size={4.2} position={[-5.5, 0, 2.5]} rot={0.4} />
      <Model id="gabled-farmhouse-c7534f" type="building" size={4.6} position={[4.8, 0, 0.5]} rot={-0.5} />
      <Model id="two-storey-family-house-c63c4a" type="building" size={3.8} position={[1, 0, -4]} rot={0.1} />
      <Model id="telegraph-pole-line-95e382" type="prop" size={9} position={[8.5, 0, -3]} rot={1.3} />
      <group position={[1.6, 0, 6 - 0.6 * smooth(clamp(t / 6))]}>
        <Model id="ranger-pickup-truck-97057d" type="vehicle" size={2.8} position={[0, 0, 0]} rot={Math.PI} />
      </group>
      <FireWhirl t={T} height={13} r0={1.0} r1={2.4} twist={7} spin={2.6 + 1.6 * born} sway={0.6} grow={born} fade={born} position={[wx, terrainH(wx, wz, 8, 9, 11), wz]} light={40} />
      <Label3D text="REDDING · CALIFORNIA" accent={P.lvlAdvisory} position={[-4.2, 4.6, -7]} h={0.55} o={seg(T, BEAT.redding, BEAT.redding + 0.5) * (1 - seg(T, BEAT.asap, BEAT.asap + 0.5))} />
    </group>
  );
};
const RIG2 = shotPlan(CLOCK, { target: [0, 1, -2], az: 14, el: 32, dist: 34, fov: 40 }, [
  { at: 3.0, move: fr({ target: [0, 1.5, -3], az: 8, el: 16, dist: 22 }) },
  { at: 7.0, move: fr({ target: [-2.5, 3.5, -10], az: 4, el: 9, dist: 18 }) },
  { at: 11.2, move: pushIn(0.78) },
  { at: 13.0, move: crane(6, 1.5) },
]);

// =============== S3 — pusaran raksasa (270 m, 5,5 km, 230 km/jam, EF3) ===============
const S3_TREES = scatter(24, 33, 12, 34, 4);
const S3: React.FC<{ T: number; t: number }> = ({ T }) => {
  const wide = seg(T, BEAT.melebar, BEAT.melebar + 1.6);
  const pole = seg(T, BEAT.menara, BEAT.menara + 0.9);
  const uproot = seg(T, BEAT.pohon, BEAT.pohon + 2.4);
  const ang = (T - BEAT.pohon) * 2.2;
  return (
    <group>
      <SkyDome top="#251B1C" horizon="#B8452A" bottom="#1E1612" />
      <Glow position={[0, 10, -40]} size={60} color="#FF6A2A" opacity={0.45} />
      <Terrain size={140} height={8} seed={13} low="#3E3326" high="#5A4632" flat={12} />
      <FireWhirl t={T} height={26} r0={lerp(1.3, 2.0, wide)} r1={lerp(2.6, 3.8, wide)} twist={9} spin={3.8} sway={1.2} position={[0, 0, -7]} light={80} />
      {[-4, -2.5, 2.4, 4.2, 0.8].map((x, i) => (
        <Flame key={i} t={T} size={0.8 + (i % 2) * 0.4} position={[x, 0, -7 + ((i * 2.3) % 4) - 2]} seed={i + 4} />
      ))}
      <AshPlume t={T + 10} origin={[0, 22, -7]} height={12} spread={16} count={80} rise={4} color="#3E3836" seed={41} glowBase={false} />
      {S3_TREES.map(([x, z, a, b], i) => (
        <Model key={i} {...(b > 0.5 ? PINE : DEAD)} size={4.5 + a * 2} position={[x, terrainH(x, z, 13, 8, 12), z]} rot={a * 6} />
      ))}
      <Model id="two-storey-family-house-c63c4a" type="building" size={4.4} position={[-7.5, 0, -1]} rot={0.6} />
      <Model id="gabled-farmhouse-c7534f" type="building" size={4.8} position={[7.5, 0, -2.5]} rot={-0.7} />
      <Model id="gabled-farmhouse-c7534f" type="building" size={4.2} position={[-4.5, 0, 5]} rot={0.2} />
      {/* utility poles: the near one topples on "Menara listrik tumbang" */}
      <group position={[3.2, 0, 2.4]} rotation={[0, 0, -1.35 * pole * pole]}>
        <Model id="timber-utility-pole-a93693" type="prop" size={5.5} position={[0, 0, 0]} />
      </group>
      <group position={[5.6, 0, 5.4]} rotation={[0.9 * seg(T, BEAT.menara + 0.3, BEAT.menara + 1.3), 0, 0]}>
        <Model id="timber-utility-pole-a93693" type="prop" size={5.5} position={[0, 0, 0]} />
      </group>
      {/* a tree torn out and carried around the column */}
      <group
        position={[lerp(-2.6, Math.cos(ang) * 4.5, uproot), lerp(0, 7 + 2 * Math.sin(ang * 0.5), uproot), lerp(-2, -7 + Math.sin(ang) * 4.5, uproot)]}
        rotation={[uproot * ang * 0.6, uproot * ang, uproot * 1.2]}
      >
        <AssetModel id={DEAD.id} assetType={"prop" as never} size={3.2} ground />
      </group>
      <Model {...STUMP} size={1.4} position={[1.8, 0, 8.6]} rot={0.5} />
      <Model {...STUMP} size={1.1} position={[-1.6, 0, 9.2]} rot={2} />
    </group>
  );
};
const RIG3 = shotPlan(CLOCK, { target: [0, 6, -7], az: -18, el: 4, dist: 22, fov: 42 }, [
  { at: 3.4, move: fr({ target: [0, 12, -7], az: -10, el: 9, dist: 42 }) },
  { at: 7.0, move: orbit(26) },
  { at: 11.2, move: fr({ target: [3, 3, 0], az: 30, el: 7, dist: 17 }) },
  { at: 13.6, move: orbit(14) },
]);

// =============== S4a — lab: udara panas naik, inflow, putaran menyempit ===============
const S4a: React.FC<{ T: number; t: number }> = ({ T }) => {
  const up = seg(T, BEAT.panasNaik - 0.3, BEAT.panasNaik + 0.4);
  const inflow = seg(T, BEAT.tersedot - 0.2, BEAT.tersedot + 0.5);
  const ringOn = seg(T, BEAT.permukaan - 0.2, BEAT.permukaan + 0.5);
  const squeeze = seg(T, BEAT.tertarik, BEAT.menyempit + 0.6);
  const R = lerp(4.2, 1.2, squeeze);
  // conservation of angular momentum: omega ~ 1 / R^2 (capped for legibility)
  const spinPhase = (T - BEAT.permukaan) * 0.6 + squeeze * squeeze * 9;
  const born = seg(T, BEAT.tertarik + 0.4, BEAT.menyempit + 0.8);
  return (
    <group>
      <SkyDome top="#0E1A24" horizon="#1A2A36" bottom={P.void} />
      <LabFloor r={5.2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Flame key={i} t={T} size={0.55 + (i % 2) * 0.25} position={[Math.cos(i * 1.05) * 0.7, 0, Math.sin(i * 1.05) * 0.7]} seed={i} />
      ))}
      <pointLight position={[0, 1.2, 0]} color="#FF8A3A" intensity={18} distance={12} />
      {/* hot air rising (orange) */}
      {up > 0.01 &&
        [0, 1, 2, 3, 4].map((i) => {
          const y = ((T * 1.8 + i * 1.3) % 6.5) + 0.6;
          const o = up * smooth(clamp(y / 1.2)) * (1 - smooth(clamp((y - 5.2) / 1.2)));
          return (
            <group key={i} position={[Math.cos(i * 2.4) * 0.45, y, Math.sin(i * 2.4) * 0.45]}>
              <Arrow len={1.1} r={0.07} color="#FF7A2E" o={o} intensity={2.2} />
            </group>
          );
        })}
      {/* inflow from every side (blue) */}
      {inflow > 0.01 &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const d = 5.4 - ((T * 1.6 + i * 0.37) % 3.6);
          const o = inflow * smooth(clamp((d - 1.4) / 0.8));
          return (
            <group key={i} position={[Math.cos(a) * d, 0.35, Math.sin(a) * d]} rotation={[0, -a - Math.PI / 2, Math.PI / 2]}>
              <Arrow len={1.0} r={0.06} color="#5EC8FF" o={o} intensity={1.8} />
            </group>
          );
        })}
      {/* surface spin ring that is drawn up and squeezed */}
      {ringOn > 0.01 && (
        <group position={[0, 0.25 + squeeze * 2.2, 0]} rotation={[0, -spinPhase, 0]}>
          <mesh ref={fx} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R, 0.05 + 0.03 * squeeze, 10, 96]} />
            <meshStandardMaterial color="#9FE3FF" emissive="#5EC8FF" emissiveIntensity={2} transparent opacity={ringOn} toneMapped={false} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} position={[Math.cos((i * Math.PI) / 2) * R, 0, Math.sin((i * Math.PI) / 2) * R]} rotation={[0, -(i * Math.PI) / 2, 0]}>
              <mesh ref={fx} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.16, 0.45, 12]} />
                <meshStandardMaterial color="#9FE3FF" emissive="#5EC8FF" emissiveIntensity={2.2} transparent opacity={ringOn} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      <FireWhirl t={T} height={6.5} r0={lerp(1.2, 0.55, squeeze)} r1={1.4} twist={8} spin={2 + 5 * squeeze} sway={0.2} grow={born} fade={born} smoke light={0} />
      <Label3D text="AUDIRA LAB · FISIKA API" accent={P.lvlInfo} position={[-4.6, 0.6, 3.2]} h={0.42} o={seg(T, SC.s4a + 0.4, SC.s4a + 1)} />
    </group>
  );
};
const RIG4a = shotPlan(CLOCK, { target: [0, 1.6, 0], az: 26, el: 16, dist: 12.5, fov: 40 }, [
  { at: 3.5, move: orbit(-20) },
  { at: 6.8, move: crane(12, 1.4) },
  { at: 10.4, move: fr({ target: [0, 2, 0], el: 34, dist: 12 }) },
  { at: 13.6, move: orbit(22) },
]);

// =============== S4b — penari es -> pusaran lahir (>1.000 °C) ===============
const S4b: React.FC<{ T: number; t: number }> = ({ T }) => {
  const f = Math.round(T * 60);
  // spin speeds up as the arms come in: angle = ∫ omega dt, omega 2 -> 14 rad/s
  const tt = Math.max(0, T - BEAT.penari);
  const ramp = clamp((T - (BEAT.penari + 1.4)) / (BEAT.kencang - BEAT.penari - 1.4));
  const heading = 2 * tt + 6 * ramp * ramp * Math.max(0, T - (BEAT.penari + 1.4));
  const born = seg(T, BEAT.lahirlah - 0.2, BEAT.lahirlah + 1.0);
  const armsIn = T > BEAT.penari + 1.5;
  return (
    <group>
      <SkyDome top="#0E1A24" horizon="#1A2A36" bottom={P.void} />
      <LabFloor r={5.2} />
      <mesh position={[-1.3, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 48]} />
        <meshStandardMaterial color="#DDEFF8" roughness={0.12} metalness={0.1} />
      </mesh>
      <ToyPerson f={f} seed={7} pose={armsIn ? "stand" : "cheer"} outfit="sport" position={[-1.3, 0.02, 0]} heading={heading} scale={1.7} />
      <Ring r={lerp(1.0, 0.45, ramp)} o={0.8 * seg(T, BEAT.penari, BEAT.penari + 0.4) * (1 - born)} color="#9FE3FF" width={0.08} y={0.05} center={[-1.3, 0]} />
      <FireWhirl t={T} height={7.5} r0={0.5} r1={1.1} twist={9} spin={5.5} sway={0.25} grow={born} fade={born} position={[1.0, 0, -0.4]} light={24} />
      {[0, 1, 2].map((i) => (
        <Flame key={i} t={T} size={0.5} position={[1.0 + Math.cos(i * 2.1) * 0.8, 0, -0.4 + Math.sin(i * 2.1) * 0.8]} seed={i + 9} fade={born} />
      ))}
    </group>
  );
};
const RIG4b = shotPlan(CLOCK, { target: [-1.3, 1.3, 0], az: 4, el: 6, dist: 5.4, fov: 38 }, [
  { at: 1.8, move: orbit(-14) },
  { at: 3.9, move: fr({ target: [-0.15, 3.0, -0.2], az: 0, el: 9, dist: 16 }) },
  { at: 6.0, move: orbit(10) },
]);

// =============== S5 — Tokyo 1923 (kota kayu, lapangan, pusaran) ===============
const TOKYO_B = [
  { id: "machiya-townhouse-8ef64e", size: 4.2 },
  { id: "minka-farmhouse-680475", size: 5 },
  { id: "kura-storehouse-5c9631", size: 3.8 },
  { id: "open-front-teahouse-c7dd18", size: 4.2 },
];
const TOKYO_SET = (() => {
  const r = prng(51);
  const out: { x: number; z: number; rot: number; k: number; burn: boolean }[] = [];
  for (let ring = 0; ring < 2; ring++) {
    const rad = 12 + ring * 6;
    const n = 12 + ring * 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.2;
      if (Math.sin(a) > 0.55 && ring === 0) continue; // keep the camera side open
      out.push({ x: Math.cos(a) * rad, z: Math.sin(a) * rad, rot: -a - Math.PI / 2, k: Math.floor(r() * 4), burn: r() > 0.25 });
    }
  }
  return out;
})();
const CROWD = scatter(16, 61, 1.2, 6.5).map(([x, z, a]) => [x, z, a] as [number, number, number]);

const TokyoSet: React.FC<{ T: number; whirl: number; wind: number }> = ({ T, whirl, wind }) => {
  const f = Math.round(T * 60);
  const crowdOn = T < BEAT.pusaran + 0.5;
  return (
    <group>
      <SkyDome top="#2E2220" horizon="#C0583A" bottom="#1E1612" />
      <Glow position={[0, 6, -50]} size={70} color="#FF6A2A" opacity={0.5} />
      <Terrain size={150} height={2} seed={5} low="#6E5A45" high="#4E4034" flat={24} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 48]} />
        <meshStandardMaterial color="#8A745A" roughness={1} />
      </mesh>
      {TOKYO_SET.map((b, i) => {
        const B = TOKYO_B[b.k];
        return (
          <group key={i}>
            <Model id={B.id} type="building" size={B.size} position={[b.x, 0, b.z]} rot={b.rot} />
            {b.burn && <Flame t={T} size={1.1 + (i % 3) * 0.35} position={[b.x, B.size * 0.55, b.z]} seed={i} />}
          </group>
        );
      })}
      <AshPlume t={T + 9} origin={[-6, 3, -14]} height={18} spread={14} count={80} rise={5} color="#4E4642" seed={71} />
      <AshPlume t={T + 7} origin={[9, 3, -10]} height={14} spread={10} count={60} rise={5} color="#57504A" seed={73} />
      {crowdOn &&
        CROWD.map(([x, z, a], i) => (
          <ToyPerson key={i} f={f} seed={100 + i} pose={i % 3 === 0 ? "walk" : "stand"} outfit="traditional" position={[x, 0.02, z]} heading={a * 6} scale={0.95} shadows={false} />
        ))}
      <Model id="torii-gate-402f30" type="prop" size={4.6} position={[6.5, 0, 6.5]} rot={-0.5} />
      <Model id="ox-cart-9c857f" type="vehicle" size={2.4} position={[-3.6, 0, 8.4]} rot={0.9} />
      {/* typhoon wind sweeping in from the bay */}
      {wind > 0.01 &&
        Array.from({ length: 7 }, (_, i) => {
          const x = 22 - ((T * 9 + i * 4.3) % 26);
          return (
            <group key={i} position={[x, 2 + (i % 3) * 2.2, -8 + i * 2.4]} rotation={[0, 0, Math.PI / 2]}>
              <Arrow len={3.2} r={0.09} color="#CFEFFF" o={wind * smooth(clamp((22 - x) / 3)) * smooth(clamp((x + 4) / 3))} intensity={1.4} />
            </group>
          );
        })}
      <FireWhirl t={T} height={30} r0={2.4} r1={6} twist={10} spin={4} sway={1.4} grow={whirl} fade={whirl} position={[0.5, 0, -1]} light={90} />
    </group>
  );
};
const S5a: React.FC<{ T: number; t: number }> = ({ T }) => <TokyoSet T={T} whirl={0} wind={0} />;
const S5b: React.FC<{ T: number; t: number }> = ({ T }) => (
  <TokyoSet T={T} whirl={seg(T, BEAT.pusaran - 0.6, BEAT.pusaran + 1.2)} wind={seg(T, BEAT.topan - 0.4, BEAT.topan + 0.3)} />
);
const RIG5a = shotPlan(CLOCK, { target: [0, 0, 0], az: 6, el: 46, dist: 36, fov: 40 }, [
  { at: 2.8, move: fr({ el: 22, dist: 22 }) },
  { at: 6.2, move: fr({ target: [0, 1, 1], az: 16, el: 8, dist: 13 }) },
]);
const RIG5b = shotPlan(CLOCK, { target: [0, 5, -1], az: 24, el: 10, dist: 26, fov: 42 }, [
  { at: 2.6, move: fr({ target: [0, 11, -1], el: 12, dist: 38 }) },
  { at: 4.6, move: orbit(-18) },
]);

// =============== S6 — pagi, hutan hangus, pyrocumulus ===============
const S6_TREES = scatter(30, 81, 4, 30, 5);
const S6: React.FC<{ T: number; t: number }> = ({ T }) => {
  const fadeWhirl = 1 - seg(T, BEAT.hilang, BEAT.hilang + 2.2);
  return (
    <group>
      <SkyDome top="#5E7896" horizon="#E2B88C" bottom="#3A3029" />
      <Glow position={[18, 9, -60]} size={34} color="#FFD9A8" opacity={0.85} />
      <Terrain size={140} height={7} seed={17} low="#2E2722" high="#4C4036" flat={8} />
      {S6_TREES.map(([x, z, a, b], i) => (
        <Model key={i} {...(b > 0.3 ? DEAD : STUMP)} size={b > 0.3 ? 3.6 + a * 2.4 : 1.2} position={[x, terrainH(x, z, 17, 7, 8), z]} rot={a * 6} />
      ))}
      <FireWhirl t={T} height={4.2} r0={0.45} r1={0.9} twist={6} spin={3} sway={0.3} grow={fadeWhirl} fade={fadeWhirl} position={[2.2, 0, -3]} light={8} />
      {/* pyrocumulus: the fire's own cloud */}
      <AshPlume t={T - SC.s6 + 8} origin={[-12, 4, -48]} height={34} spread={24} count={140} rise={6} color="#CDC3B8" seed={91} glowBase={false} />
      <Model id="ranger-pickup-truck-97057d" type="vehicle" size={2.8} position={[-1.8, 0, 3.2]} rot={-0.6} />
      <Label3D text="AUDIRA FAKTA DUNIA" accent={P.lvlAdvisory} position={[-4.2, 3.2, -1.5]} h={0.62} o={seg(T, SC.s6 + 0.6, SC.s6 + 1.2)} />
    </group>
  );
};
const RIG6 = shotPlan(CLOCK, { target: [0.4, 1.4, 0], az: 12, el: 6, dist: 10.5, fov: 40 }, [
  { at: 3.0, move: fr({ target: [-4, 8, -24], az: 6, el: 8, dist: 28 }) },
  { at: 7.0, move: crane(8, 3) },
  { at: 10.2, move: pullOut(1.12) },
]);

const LAB_KEY = { pos: [5, 9, 7] as [number, number, number], color: "#FFF1DE", intensity: 2.2, ambient: 0.5, sky: "#CFE6FF", ground: "#2A2018" };

export const SCENES: Record<SceneId, SceneDef> = {
  s1: { World: S1, rig: RIG1, bg: "#1A1614", fog: [26, 110], key: { pos: [-8, 9, 10], color: "#FFB27A", intensity: 1.6, ambient: 0.42, sky: "#7A86A8", ground: "#3A2418" } },
  s2: { World: S2, rig: RIG2, bg: "#2A2420", fog: [40, 140], key: { pos: [-10, 12, 8], color: "#FFC48A", intensity: 2.2, ambient: 0.48, sky: "#B8B0C0", ground: "#3A2A1A" } },
  s3: { World: S3, rig: RIG3, bg: "#241A18", fog: [36, 130], key: { pos: [10, 12, 10], color: "#FFB27A", intensity: 1.9, ambient: 0.42, sky: "#A89098", ground: "#3A2418" } },
  s4a: { World: S4a, rig: RIG4a, bg: P.void, fog: [20, 60], key: LAB_KEY },
  s4b: { World: S4b, rig: RIG4b, bg: P.void, fog: [20, 60], key: LAB_KEY },
  s5a: { World: S5a, rig: RIG5a, bg: "#2A1E1A", fog: [40, 150], key: { pos: [-12, 14, 8], color: "#FFC08A", intensity: 2.2, ambient: 0.5, sky: "#C0A090", ground: "#3A2418" } },
  s5b: { World: S5b, rig: RIG5b, bg: "#2A1E1A", fog: [40, 150], key: { pos: [-12, 14, 8], color: "#FFB27A", intensity: 2.0, ambient: 0.45, sky: "#C0A090", ground: "#3A2418" } },
  s6: { World: S6, rig: RIG6, bg: "#5E7896", fog: [40, 160], key: { pos: [14, 10, -16], color: "#FFE2BE", intensity: 2.4, ambient: 0.6, sky: "#DCE6F2", ground: "#3A3029" } },
};
