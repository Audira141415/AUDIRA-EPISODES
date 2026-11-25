// Generic CHRONICLE locations. Convention for every set: the stage is around the origin, people stand on y = 0,
// the bright background (sun, doorway, fire, sea) is toward −z and the camera works from the +z side, so the cast
// reads as black silhouettes against light. Each set exports anchors the planner/stager uses.

import React, { useMemo } from "react";
import { BufferAttribute, CanvasTexture, Color, DoubleSide, MeshStandardMaterial, QuadraticBezierCurve3, RepeatWrapping, SRGBColorSpace, TubeGeometry, Vector3 } from "three";
import { Flag, Ground, Lantern, Palm, Ship, Stilthouse, Volcano, Water, stone } from "../kits/chronicle/props.tsx";
import { AshColumn, Birds, Embers } from "../kits/chronicle/fx.tsx";
import { fbm } from "../kits/chronicle/relief.ts";
import { Candle, Flames, Shafts } from "./fxextra.tsx";
import type { MoodId, SetId } from "../director/types.ts";
import { GURUN_A, Gurun, LAUT_A, Laut, THUR_A, Thur, TUNGKU_A, Tungku } from "./sinai.tsx";

export type V3 = [number, number, number];
export type SetProps = { t: number; fire: boolean; rain: boolean; fog: boolean; candle: boolean; volcano: boolean; seed: number; mood: MoodId; extras?: string[] };
export type Anchors = {
  lead: V3; // where the lead stands
  second: V3; // a second singleton (conversation partner, opponent)
  target: V3; // what idle people look at
  rows: [number, number, number, number]; // x0, x1, z0, z1 for crowds
  guards: V3[]; // positions for guards / bystanders
  path: [V3, V3]; // movers run/walk along this
  seat?: { pos: V3; rotY: number; kind: "chair" | "floor" };
  camMaxZ?: number; // interiors: camera must stay inside
  camMinY?: number;
  interior?: boolean;
  /** override the key light direction (relative to the stage) */
  light?: V3;
};

const hsh = (n: number) => {
  const x = Math.sin(n * 91.3458 + 47.123) * 43758.5453;
  return x - Math.floor(x);
};
const M = (color: string, rough = 0.95) => new MeshStandardMaterial({ color, roughness: rough });
const wood = M("#3a2a20"), darkWood = M("#221812"), plaster = M("#7d6a56", 1), leaf = M("#161a12", 1), bark = M("#2a2019", 1);
const limestone = M("#cfc6b3", 0.9), sand = M("#7a6650", 1), canvasM = M("#6a5c4a", 1);

const canvasTex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void, rep: [number, number]) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  paint(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...rep);
  return t;
};
let planks: MeshStandardMaterial | null = null;
const plankMat = () => {
  if (planks) return planks;
  const map = canvasTex(256, 256, (g) => {
    for (let i = 0; i < 8; i++) {
      const v = 0.75 + hsh(i) * 0.3;
      g.fillStyle = `rgb(${Math.round(92 * v)},${Math.round(66 * v)},${Math.round(46 * v)})`;
      g.fillRect(0, i * 32, 256, 30);
      g.fillStyle = "rgba(0,0,0,0.5)";
      g.fillRect(0, i * 32 + 30, 256, 2);
      g.fillRect(hsh(i * 3) * 256, i * 32, 2, 30);
    }
  }, [4, 4]);
  planks = new MeshStandardMaterial({ map, roughness: 0.9 });
  return planks;
};
let tiles: MeshStandardMaterial | null = null;
const tileMat = () => {
  if (tiles) return tiles;
  const map = canvasTex(256, 256, (g) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const v = (x + y) % 2 ? 0.8 : 0.95;
      g.fillStyle = `rgb(${Math.round(150 * v)},${Math.round(110 * v)},${Math.round(80 * v)})`;
      g.fillRect(x * 64 + 1, y * 64 + 1, 62, 62);
    }
  }, [8, 8]);
  tiles = new MeshStandardMaterial({ map, roughness: 0.6 });
  return tiles;
};

// ------------------------------------------------------------------ shared props
export const Tree: React.FC<{ pos: V3; h: number; r?: number; crown?: number; seed: number }> = ({ pos, h, r = 0.35, crown = 4, seed }) => {
  const geo = useMemo(() => {
    const c = new QuadraticBezierCurve3(new Vector3(0, 0, 0), new Vector3((hsh(seed) - 0.5) * 1.2, h * 0.5, (hsh(seed + 1) - 0.5) * 1.2), new Vector3((hsh(seed + 2) - 0.5) * 1.6, h, (hsh(seed + 3) - 0.5) * 1.6));
    return new TubeGeometry(c, 10, r, 7, false);
  }, [h, r, seed]);
  return (
    <group position={pos}>
      <mesh geometry={geo} material={bark} castShadow />
      {Array.from({ length: 7 }, (_, i) => {
        const a = hsh(seed * 7 + i) * Math.PI * 2, d = crown * (0.3 + 0.6 * hsh(seed * 5 + i));
        return (
          <mesh key={i} material={leaf} position={[Math.cos(a) * d, h * (0.8 + 0.25 * hsh(seed + i * 3)), Math.sin(a) * d]} scale={[crown * (0.6 + 0.4 * hsh(i + seed)), crown * 0.45, crown * (0.6 + 0.4 * hsh(i * 2 + seed))]} castShadow>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
        );
      })}
    </group>
  );
};

const Kamboja: React.FC<{ pos: V3; seed: number }> = ({ pos, seed }) => {
  const branches = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + hsh(seed + i);
    const end = new Vector3(Math.cos(a) * (1.6 + hsh(i) * 1.2), 3.4 + hsh(i + 9) * 1.4, Math.sin(a) * (1.6 + hsh(i + 4) * 1.2));
    const c = new QuadraticBezierCurve3(new Vector3(0, 2.0, 0), new Vector3(end.x * 0.3, end.y * 0.75, end.z * 0.3), end);
    return { geo: new TubeGeometry(c, 8, 0.09, 6, false), end };
  }), [seed]);
  const trunk = useMemo(() => new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0, 0, 0), new Vector3(0.3, 1.0, 0.1), new Vector3(0.1, 2.1, 0)), 8, 0.2, 7, false), []);
  return (
    <group position={pos}>
      <mesh geometry={trunk} material={bark} castShadow />
      {branches.map((b, i) => (
        <group key={i}>
          <mesh geometry={b.geo} material={bark} castShadow />
          <mesh material={leaf} position={b.end} scale={[0.9, 0.45, 0.9]} castShadow><icosahedronGeometry args={[1, 1]} /></mesh>
        </group>
      ))}
    </group>
  );
};

const Nisan: React.FC<{ pos: V3; rotY?: number; h?: number }> = ({ pos, rotY = 0, h = 0.75 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh material={limestone} position={[0, h / 2, 0]} castShadow><boxGeometry args={[0.3, h, 0.14]} /></mesh>
    <mesh material={limestone} position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.15, 0.15, 0.14, 14, 1, false, 0, Math.PI]} /></mesh>
  </group>
);

const Grave: React.FC<{ pos: V3; rotY?: number }> = ({ pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh material={limestone} position={[0, 0.15, 0]} castShadow receiveShadow><boxGeometry args={[1.0, 0.3, 2.1]} /></mesh>
    <mesh material={limestone} position={[0, 0.38, 0]} castShadow receiveShadow><boxGeometry args={[0.7, 0.16, 1.7]} /></mesh>
    <Nisan pos={[0, 0.46, -0.7]} />
    <Nisan pos={[0, 0.46, 0.7]} h={0.55} />
  </group>
);

const Pillar: React.FC<{ pos: V3; h: number; w?: number; mat?: MeshStandardMaterial }> = ({ pos, h, w = 0.42, mat = plaster }) => (
  <group position={pos}>
    <mesh material={mat} position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, w]} /></mesh>
    <mesh material={mat} position={[0, 0.12, 0]}><boxGeometry args={[w * 1.35, 0.24, w * 1.35]} /></mesh>
    <mesh material={mat} position={[0, h - 0.1, 0]}><boxGeometry args={[w * 1.3, 0.2, w * 1.3]} /></mesh>
  </group>
);

const Chair: React.FC<{ pos: V3; rotY: number }> = ({ pos, rotY }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh material={darkWood} position={[0, 0.44, 0]} castShadow><boxGeometry args={[0.48, 0.05, 0.46]} /></mesh>
    {[[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].map(([x, z], i) => (
      <mesh key={i} material={darkWood} position={[x, 0.22, z]}><boxGeometry args={[0.04, 0.44, 0.04]} /></mesh>
    ))}
    <mesh material={darkWood} position={[0, 0.82, -0.21]} castShadow><boxGeometry args={[0.46, 0.72, 0.04]} /></mesh>
  </group>
);

const Table: React.FC<{ pos: V3; w: number; d: number; h?: number; rotY?: number }> = ({ pos, w, d, h = 0.76, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh material={wood} position={[0, h, 0]} castShadow receiveShadow><boxGeometry args={[w, 0.05, d]} /></mesh>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
      <mesh key={i} material={darkWood} position={[sx * (w / 2 - 0.06), h / 2, sz * (d / 2 - 0.06)]}><boxGeometry args={[0.06, h, 0.06]} /></mesh>
    ))}
  </group>
);

const Tent: React.FC<{ pos: V3; rotY?: number; s?: number }> = ({ pos, rotY = 0, s = 1 }) => (
  <mesh position={[pos[0], 1.2 * s, pos[2]]} rotation={[0, rotY + Math.PI / 4, 0]} scale={[2.2 * s, 2.4 * s, 2.2 * s]} material={canvasM} castShadow>
    <coneGeometry args={[1, 1, 4]} />
  </mesh>
);

const Hills: React.FC<{ z: number; color?: string; seed?: number; h?: number }> = ({ z, color = "#2a2420", seed = 1, h = 60 }) => (
  <group>
    {Array.from({ length: 7 }, (_, i) => (
      <mesh key={i} position={[(i - 3) * 160 + (hsh(seed + i) - 0.5) * 80, -h * 0.3, z - hsh(i + seed) * 80]} scale={[120 + hsh(i) * 80, h * (0.6 + hsh(i + 3) * 0.6), 60]}>
        <sphereGeometry args={[1, 24, 10]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
    ))}
  </group>
);

const Grass: React.FC<{ x0: number; x1: number; z0: number; z1: number; n: number; seed: number; h?: number }> = ({ x0, x1, z0, z1, n, seed, h = 0.7 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const x = x0 + hsh(seed + i) * (x1 - x0), z = z0 + hsh(seed * 3 + i) * (z1 - z0);
      return (
        <group key={i} position={[x, 0, z]} userData={{ noMask: true }}>
          {Array.from({ length: 6 }, (_, j) => (
            <mesh key={j} material={leaf} position={[(hsh(i * 9 + j) - 0.5) * 0.25, 0, (hsh(i * 5 + j) - 0.5) * 0.2]} rotation={[(hsh(j + i) - 0.5) * 0.9, 0, (hsh(j * 3 + i) - 0.5) * 1.1]} scale={[0.022, h * (0.4 + hsh(j + i * 2) * 0.8), 0.022]} userData={{ noMask: true }}>
              <coneGeometry args={[1, 1, 4]} />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ sets
const Makam: React.FC<SetProps> = ({ t, seed }) => (
  <group>
    <Ground size={400} color="#2c2a1e" amp={1.0} seed={seed} />
    <Grave pos={[-0.9, 0, -2.0]} rotY={Math.PI / 2} />
    {/* low fence */}
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} material={darkWood} position={[-3.1 + i * 0.55, 0.35, -3.6]} castShadow><boxGeometry args={[0.07, 0.7, 0.07]} /></mesh>)}
    <mesh material={darkWood} position={[-0.9, 0.6, -3.6]}><boxGeometry args={[4.6, 0.06, 0.05]} /></mesh>
    <Kamboja pos={[3.2, 0, -6.5]} seed={seed} />
    {/* small shrine roof over an older grave */}
    <group position={[-5.5, 0, -7.5]}>
      <Grave pos={[0, 0, 0]} rotY={Math.PI / 2} />
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => <mesh key={i} material={darkWood} position={[x, 1.2, z]}><boxGeometry args={[0.12, 2.4, 0.12]} /></mesh>)}
      <mesh material={darkWood} position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.4, 1.3, 2.4]} castShadow><coneGeometry args={[1, 1, 4]} /></mesh>
    </group>
    <Tree pos={[-9, 0, -16]} h={11} crown={4.5} seed={seed + 3} />
    <Tree pos={[7, 0, -20]} h={13} crown={5} seed={seed + 4} />
    <Tree pos={[-2, 0, -30]} h={14} crown={5.5} seed={seed + 5} />
    <Tree pos={[16, 0, -34]} h={12} crown={5} seed={seed + 6} />
    <Grass x0={-6} x1={6} z0={1.5} z1={4} n={16} seed={seed} h={0.5} />
    <Birds t={t} start={-5} origin={[-30, 22, -60]} dir={[1, 0.08, 0.1]} count={6} speed={4} size={0.5} seed={seed} />
  </group>
);
const MAKAM_A: Anchors = { lead: [0.65, 0, -1.2], second: [1.8, 0, -0.4], target: [-0.9, 0.4, -2.0], rows: [-4, 4, -6, -3.5], guards: [[2.4, 0, -1.5], [3.0, 0, -2.4]], path: [[2, 0, -16], [-1, 0, 6]] };

const Balai: React.FC<SetProps> = ({ t }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} material={tileMat()} receiveShadow><planeGeometry args={[16, 18]} /></mesh>
    <mesh position={[0, 0.005, -3.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4.4, 3.0]} /><meshStandardMaterial color="#6e1f1a" roughness={1} /></mesh>
    {/* back wall with a big doorway, side walls with tall windows */}
    <mesh material={plaster} position={[-4.8, 2.4, -9]} receiveShadow castShadow><boxGeometry args={[6.4, 4.8, 0.3]} /></mesh>
    <mesh material={plaster} position={[4.8, 2.4, -9]} receiveShadow castShadow><boxGeometry args={[6.4, 4.8, 0.3]} /></mesh>
    <mesh material={plaster} position={[0, 4.2, -9]} castShadow><boxGeometry args={[3.2, 1.2, 0.3]} /></mesh>
    {[-1, 1].map((sx) => (
      <group key={sx}>
        <mesh material={plaster} position={[sx * 8, 2.4, -6.5]} castShadow><boxGeometry args={[0.3, 4.8, 5]} /></mesh>
        <mesh material={plaster} position={[sx * 8, 2.4, 3.5]} castShadow><boxGeometry args={[0.3, 4.8, 9]} /></mesh>
        <mesh material={plaster} position={[sx * 8, 0.5, -2.5]}><boxGeometry args={[0.3, 1.0, 3]} /></mesh>
        <mesh material={plaster} position={[sx * 8, 4.2, -2.5]}><boxGeometry args={[0.3, 1.2, 3]} /></mesh>
      </group>
    ))}
    <mesh material={darkWood} position={[0, 4.85, -2]} receiveShadow><boxGeometry args={[16.5, 0.2, 18]} /></mesh>
    {[-4, -1, 2].map((z) => <mesh key={z} material={darkWood} position={[0, 4.6, z]}><boxGeometry args={[16, 0.25, 0.3]} /></mesh>)}
    {[-3.2, 3.2].flatMap((x) => [1.2, -2.8, -6.6].map((z) => <Pillar key={`${x}${z}`} pos={[x, 0, z]} h={4.6} />))}
    {/* negotiation table, chairs */}
    <Table pos={[0, 0, -3.1]} w={1.6} d={0.9} />
    <Chair pos={[1.25, 0, -3.05]} rotY={-Math.PI / 2} />
    {/* outside, seen through the doorway */}
    <mesh position={[0, 3, -18]}><planeGeometry args={[40, 14]} /><meshBasicMaterial color={[1.25, 1.05, 0.8]} toneMapped={false} fog={false} /></mesh>
    <Shafts from={[0, 3.6, -8.9]} tilt={1.0} len={9} width={2.8} count={4} opacity={0.07} t={t} />
    <Shafts from={[-7.9, 3.4, -2.5]} yaw={Math.PI / 2} tilt={0.9} len={6} width={2.4} count={3} opacity={0.05} t={t} />
    <Lantern pos={[-3.2, 2.0, 0.9]} t={t} seed={3} light />
  </group>
);
const BALAI_A: Anchors = {
  lead: [1.2, 0, -3.05], second: [-1.15, 0, -3.15], target: [0, 1.2, -3.1], rows: [-2.6, 2.6, -7.8, -6.8],
  guards: [[-2.3, 0, -7.6], [-0.9, 0, -7.9], [0.9, 0, -7.9], [2.3, 0, -7.6], [-5.2, 0, -5.5], [5.2, 0, -5.5]], path: [[-5, 0, -7.5], [3, 0, 2]],
  seat: { pos: [1.25, 0, -3.05], rotY: -Math.PI / 2, kind: "chair" }, camMaxZ: 7.5, interior: true,
};

const Kamar: React.FC<SetProps> = ({ t, candle, rain }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={plankMat()} receiveShadow><planeGeometry args={[7, 8]} /></mesh>
    {/* back wall with a barred window */}
    <mesh material={plaster} position={[-2.2, 1.6, -2.6]} castShadow receiveShadow><boxGeometry args={[2.6, 3.2, 0.25]} /></mesh>
    <mesh material={plaster} position={[2.2, 1.6, -2.6]} castShadow receiveShadow><boxGeometry args={[2.6, 3.2, 0.25]} /></mesh>
    <mesh material={plaster} position={[0, 0.55, -2.6]} castShadow receiveShadow><boxGeometry args={[1.8, 1.1, 0.25]} /></mesh>
    <mesh material={plaster} position={[0, 2.85, -2.6]} castShadow receiveShadow><boxGeometry args={[1.8, 0.7, 0.25]} /></mesh>
    {[-0.6, -0.2, 0.2, 0.6].map((x) => <mesh key={x} material={darkWood} position={[x, 1.8, -2.6]}><boxGeometry args={[0.05, 1.4, 0.05]} /></mesh>)}
    <mesh material={plaster} position={[-3.4, 1.6, 0.5]} receiveShadow><boxGeometry args={[0.25, 3.2, 6.5]} /></mesh>
    <mesh material={plaster} position={[3.4, 1.6, 0.5]} receiveShadow><boxGeometry args={[0.25, 3.2, 6.5]} /></mesh>
    <mesh material={darkWood} position={[0, 3.25, 0.5]}><boxGeometry args={[7, 0.12, 7]} /></mesh>
    {/* desk side-on to the camera, writer faces −x */}
    <Table pos={[-0.15, 0, -1.25]} w={0.75} d={1.3} />
    <Chair pos={[0.55, 0, -1.25]} rotY={-Math.PI / 2} />
    <mesh material={limestone} position={[-0.1, 0.79, -1.35]} rotation={[0, 0.2, 0]}><boxGeometry args={[0.32, 0.01, 0.44]} /></mesh>
    {candle && <Candle pos={[-0.32, 0.785, -1.7]} t={t} power={1.6} />}
    {/* bed / mat */}
    <mesh material={wood} position={[-2.4, 0.22, -0.4]} castShadow><boxGeometry args={[1.0, 0.44, 2.0]} /></mesh>
    <mesh position={[0, 1.8, -6]}><planeGeometry args={[8, 4]} /><meshBasicMaterial color={rain ? [0.15, 0.2, 0.32] : [0.22, 0.3, 0.55]} toneMapped={false} fog={false} /></mesh>
    <Shafts from={[0, 2.4, -2.5]} tilt={0.85} len={4} width={1.5} count={3} color="#9fb0ff" opacity={0.06} t={t} />
  </group>
);
const KAMAR_A: Anchors = {
  lead: [0.6, 0, -1.25], second: [-1.6, 0, -1.6], target: [-0.2, 0.8, -1.3], rows: [-2, 2, -2.2, -1.8], guards: [[2.4, 0, -1.8]], path: [[2.8, 0, -1.8], [-1.5, 0, 1.5]],
  seat: { pos: [0.55, 0, -1.25], rotY: -Math.PI / 2, kind: "chair" }, camMaxZ: 3.6, interior: true,
};

const Hutan: React.FC<SetProps> = ({ t, seed }) => {
  const trees = useMemo(() => {
    const out: { p: V3; h: number; r: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const x = (hsh(seed * 11 + i) - 0.5) * 70, z = -3 - hsh(seed * 7 + i) * 60;
      if (Math.abs(x) < 4.5 && z > -11) continue;
      out.push({ p: [x, 0, z], h: 14 + hsh(i + 3) * 12, r: 0.25 + hsh(i + 5) * 0.35 });
    }
    return out;
  }, [seed]);
  return (
    <group>
      <Ground size={500} color="#2a2a20" amp={2.0} seed={seed} />
      {trees.map((tr, i) => <Tree key={i} pos={tr.p} h={tr.h} r={tr.r} crown={3 + (i % 4)} seed={seed * 13 + i} />)}
      <Shafts from={[3, 18, -24]} tilt={0.55} len={34} width={10} count={5} color="#fff0cc" opacity={0.1} t={t} />
      <Shafts from={[-8, 18, -34]} tilt={0.5} len={34} width={8} count={4} color="#fff0cc" opacity={0.08} t={t} />
      <Grass x0={-7} x1={7} z0={1.2} z1={4.5} n={20} seed={seed} h={0.8} />
      <Grass x0={-12} x1={12} z0={-14} z1={-6} n={24} seed={seed + 5} h={0.9} />
    </group>
  );
};
const HUTAN_A: Anchors = { lead: [0.6, 0, -0.6], second: [-1.5, 0, -1.4], target: [0, 1.2, -7], rows: [-3.5, 3.5, -9.5, -4.0], guards: [[-2.8, 0, -3], [2.8, 0, -3.4]], path: [[3, 0, -22], [-2, 0, 8]] };

const Desa: React.FC<SetProps> = ({ t, fire, volcano, seed }) => (
  <group>
    <Ground size={900} color="#2d211a" amp={2.2} seed={seed} />
    <Stilthouse pos={[-12, 0, -22]} rotY={0.35} />
    <Stilthouse pos={[10, 0, -30]} rotY={-0.45} />
    <Stilthouse pos={[-28, 0, -46]} rotY={0.1} />
    <Stilthouse pos={[26, 0, -50]} rotY={-0.2} />
    <Palm pos={[-5.5, 0, -16]} h={10.5} lean={[1.4, -0.3]} t={t} seed={1} />
    <Palm pos={[17, 0, -21]} h={12} lean={[-1.8, 0.5]} t={t} seed={2} />
    <Palm pos={[-21, 0, -30]} h={9.5} lean={[2.0, 0.2]} t={t} seed={3} />
    <Palm pos={[4, 0, -44]} h={13} lean={[0.8, -0.4]} t={t} seed={4} />
    {fire && (
      <>
        <Flames t={t} at={[{ p: [-12, 4.2, -22], h: 4.5 }, { p: [-13.5, 3.2, -20.5], h: 3.2 }, { p: [-10.4, 3.6, -23], h: 3.8 }]} seed={1} />
        <Flames t={t} at={[{ p: [10, 4.0, -30], h: 5 }, { p: [11.6, 3.0, -28.8], h: 3.4 }]} seed={2} />
        <Flames t={t} at={[{ p: [-28, 4.2, -46], h: 5 }, { p: [26, 4.2, -50], h: 4.6 }]} seed={3} light={false} />
        <AshColumn t={t + 3} base={[-12, 6, -22]} height={40} width={9} count={40} life={6} wind={[0.25, 0.05]} dark="#2a2222" lit="#b04a20" hot="#ff9a4a" density={0.8} seed={2} />
        <AshColumn t={t + 7} base={[10, 6, -30]} height={44} width={10} count={40} life={6} wind={[0.25, 0.05]} dark="#2a2222" lit="#b04a20" hot="#ff9a4a" density={0.8} seed={5} />
        <Embers t={t} count={220} box={[-16, 1, -30, 14, 16, 4]} rise={1.4} size={0.12} color="#ff9a3c" scale={700} />
      </>
    )}
    {volcano && (
      <>
        <Volcano pos={[420, -60, -2700]} radius={1500} height={740} glow={1.2} />
        <AshColumn t={t + 20} base={[420, 620, -2700]} height={2300} width={900} count={170} life={9} wind={[-0.16, 0.1]} dark="#2f2626" lit="#a8401f" hot="#ff8a3a" density={0.95} />
      </>
    )}
    <Grass x0={-8} x1={8} z0={4.5} z1={7.5} n={22} seed={seed} h={0.9} />
  </group>
);
const DESA_A: Anchors = { lead: [0.8, 0, -2], second: [-1.6, 0, -3], target: [0, 1.5, -20], rows: [-5, 5, -12, -6], guards: [[4.2, 0, -13], [5.6, 0, -14.5], [3.0, 0, -15.5], [6.8, 0, -12.5]], path: [[3.5, 0, -24], [-2.5, 0, 9]] };

const BentengSet: React.FC<SetProps> = ({ t, seed }) => {
  const st = stone();
  const Z = -20;
  return (
    <group>
      <Ground size={500} color="#5a4a38" amp={0.6} seed={seed} />
      {/* curtain wall + gate + bastion, lit from the front-left so the black cast reads against warm stone */}
      <mesh material={st} position={[-14, 3.5, Z]} castShadow receiveShadow><boxGeometry args={[24, 7, 2]} /></mesh>
      <mesh material={st} position={[14, 3.5, Z]} castShadow receiveShadow><boxGeometry args={[24, 7, 2]} /></mesh>
      <mesh material={st} position={[0, 5.9, Z]} castShadow><boxGeometry args={[4.4, 2.2, 2]} /></mesh>
      <mesh position={[0, 2.4, Z - 0.6]}><boxGeometry args={[4.0, 4.8, 0.8]} /><meshStandardMaterial color="#120d0a" /></mesh>
      <mesh material={st} position={[-22, 3.9, Z + 5]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow><boxGeometry args={[8, 7.8, 8]} /></mesh>
      {Array.from({ length: 22 }, (_, i) => <mesh key={i} material={st} position={[-26 + i * 2.5, 7.5, Z + 0.6]} castShadow><boxGeometry args={[1.2, 1.0, 0.8]} /></mesh>)}
      <Flag pos={[3.5, 7, Z]} t={t} h={7} w={3} color="#8a2a20" />
      <Lantern pos={[-3.2, 0, Z + 1.4]} t={t} seed={4} light={false} />
      <Tree pos={[16, 0, -8]} h={9} crown={3.5} seed={seed + 2} />
      <Grass x0={-8} x1={8} z0={2.5} z1={5} n={14} seed={seed} h={0.5} />
      <Birds t={t} start={-3} origin={[-40, 18, -36]} dir={[1, 0.1, 0.05]} count={7} speed={5} size={0.5} seed={seed} />
    </group>
  );
};
const BENTENG_A: Anchors = {
  lead: [0.9, 0, -3.5], second: [-1.2, 0, -4.2], target: [0, 2, -20], rows: [-6, 6, -15, -8],
  guards: [[-1.6, 0, -8.5], [1.4, 0, -9.2], [-3.2, 0, -10.5], [3.4, 0, -11]], path: [[-3, 0, -18], [2, 0, 8]], light: [-45, 26, 38],
};

const Pelabuhan: React.FC<SetProps> = ({ t, seed }) => (
  <group>
    <Water y={-1.4} t={t} deep="#13202e" sky="#c98a68" sun="#ffa060" sunDir={[0.1, 0.06, -1]} glitter={1} />
    <mesh material={plankMat()} position={[0, -0.12, -10]} receiveShadow castShadow><boxGeometry args={[5, 0.24, 40]} /></mesh>
    {Array.from({ length: 14 }, (_, i) => [-2.4, 2.4].map((x) => <mesh key={`${i}${x}`} material={darkWood} position={[x, -0.9, 8 - i * 3]}><cylinderGeometry args={[0.12, 0.12, 1.8, 6]} /></mesh>))}
    {[[-1.6, -4], [1.7, -7.5], [-1.5, -13]].map(([x, z], i) => <mesh key={i} material={wood} position={[x, 0.35, z]} castShadow><boxGeometry args={[0.7, 0.7, 0.7]} /></mesh>)}
    <Lantern pos={[2.2, 0, -2]} t={t} seed={5} />
    <Ship pos={[-17, -1.4, -36]} rotY={0.25} t={t} seed={seed} />
    <Ship pos={[20, -1.4, -60]} rotY={-0.4} t={t} seed={seed + 1} scale={1.1} />
    <Ship pos={[-50, -1.4, -140]} rotY={0.9} t={t} seed={seed + 2} scale={1.2} />
    <Hills z={-700} color="#1b1820" seed={seed} h={50} />
  </group>
);
const PELABUHAN_A: Anchors = { lead: [0.5, 0, -1.8], second: [-1.2, 0, -2.6], target: [0, 1.5, -40], rows: [-1.9, 1.9, -12, -4.5], guards: [[-1.8, 0, -5.5], [1.8, 0, -6]], path: [[-0.5, 0, -16], [0.8, 0, 4]] };

const Dek: React.FC<SetProps> = ({ t, seed }) => {
  const roll = Math.sin(t * 0.6) * 0.012;
  return (
    <group rotation={[0, 0, roll]}>
      <Water y={-3.2} t={t} deep="#16202c" sky="#e0a070" sun="#ffb070" sunDir={[-0.15, 0.05, -1]} glitter={1.2} />
      <mesh material={plankMat()} position={[0, -0.12, 0.5]} receiveShadow castShadow><boxGeometry args={[26, 0.24, 7]} /></mesh>
      {/* rail */}
      <mesh material={darkWood} position={[0, 0.95, -2.9]} castShadow><boxGeometry args={[26, 0.1, 0.12]} /></mesh>
      {Array.from({ length: 22 }, (_, i) => <mesh key={i} material={darkWood} position={[-12.5 + i * 1.2, 0.47, -2.9]}><boxGeometry args={[0.08, 0.94, 0.08]} /></mesh>)}
      <mesh material={darkWood} position={[0, -0.6, -3.0]}><boxGeometry args={[26, 1.2, 0.2]} /></mesh>
      {/* mast + rigging */}
      <mesh material={darkWood} position={[-3.4, 9, -0.6]} castShadow><cylinderGeometry args={[0.18, 0.26, 18, 10]} /></mesh>
      <mesh material={darkWood} position={[-3.4, 12, -0.6]} rotation={[Math.PI / 2, 0, 0.0]}><cylinderGeometry args={[0.08, 0.08, 9, 6]} /></mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const x = -6 + i * 1.2;
        const a = new Vector3(-3.4, 16, -0.6), b = new Vector3(x, 0.95, -2.9);
        const d = b.clone().sub(a);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const up = new Vector3(0, 1, 0), n = d.clone().normalize();
        const ax = up.clone().cross(n).normalize();
        const ang = Math.acos(up.dot(n));
        const sn = Math.sin(ang / 2);
        return <mesh key={i} material={darkWood} position={mid} quaternion={[ax.x * sn, ax.y * sn, ax.z * sn, Math.cos(ang / 2)]} scale={[0.025, d.length(), 0.025]}><cylinderGeometry args={[1, 1, 1, 4]} /></mesh>;
      })}
      <mesh position={[-3.0, 8.5, -0.6]} rotation={[0, 0.3, 0]} castShadow><planeGeometry args={[6, 7, 8, 8]} /><meshStandardMaterial color="#6a5a4a" side={DoubleSide} roughness={1} /></mesh>
      <Ship pos={[40, -3.2, -120]} rotY={0.4} t={t} seed={seed + 3} />
      <Birds t={t} start={-4} origin={[-20, 14, -40]} dir={[1, 0.05, 0.1]} count={5} speed={4} size={0.5} seed={seed} />
    </group>
  );
};
const DEK_A: Anchors = { lead: [0.7, 0, -1.9], second: [-1.4, 0, -1.6], target: [0, 1.5, -60], rows: [-6, 6, -2.4, 2.4], guards: [[2.6, 0, -1.2], [3.6, 0, -0.4]], path: [[-8, 0, -1.6], [6, 0, 2.5]] };

const Medan: React.FC<SetProps> = ({ t, fire, seed }) => (
  <group>
    <Ground size={900} color="#3a2e22" amp={1.6} seed={seed} />
    <Hills z={-500} color="#2a2420" seed={seed} h={70} />
    {[[-9, -16], [8, -20], [-18, -26], [16, -30], [-4, -34]].map(([x, z], i) => <Tent key={i} pos={[x, 0, z]} rotY={hsh(i) * 2} s={1 + hsh(i + 4) * 0.4} />)}
    {[[-6, -13], [5, -15], [12, -22], [-13, -20], [0, -26]].map(([x, z], i) => <Flag key={i} pos={[x, 0, z]} t={t + i} h={6 + hsh(i) * 2} w={1.4} color="#8a1f18" />)}
    {fire && <Flames t={t} at={[{ p: [-2.6, 0, -5.5], h: 1.4 }]} seed={seed} />}
    {fire && <Embers t={t} count={60} box={[-3.5, 0.5, -6.5, -1.7, 6, -4.5]} rise={1.2} size={0.08} scale={700} />}
    <Grass x0={-8} x1={8} z0={2} z1={5} n={18} seed={seed} h={0.7} />
  </group>
);
const MEDAN_A: Anchors = { lead: [0.8, 0, -1.0], second: [-1.6, 0, -2.0], target: [0, 1.5, -12], rows: [-5.5, 5.5, -13, -5], guards: [[-3.5, 0, -4], [3.8, 0, -4.5]], path: [[4, 0, -24], [-2.5, 0, 8]] };

const Pantai: React.FC<SetProps> = ({ t, seed }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]} material={sand} receiveShadow><planeGeometry args={[400, 40]} /></mesh>
    <Water y={-0.08} t={t} deep="#17283a" sky="#e3a070" sun="#ffb070" sunDir={[0.1, 0.05, -1]} glitter={1.1} />
    <Palm pos={[-6, 0, -1]} h={10} lean={[1.6, -0.6]} t={t} seed={seed} />
    <Palm pos={[8, 0, 1]} h={11} lean={[-1.8, -0.8]} t={t} seed={seed + 1} />
    <mesh material={wood} position={[-2.5, 0.3, -2.5]} rotation={[0, 0.4, 0]} scale={[0.8, 0.5, 3.2]} castShadow><sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /></mesh>
    <Ship pos={[30, -0.1, -90]} rotY={0.6} t={t} seed={seed + 2} />
  </group>
);
const PANTAI_A: Anchors = { lead: [0.8, 0, -1.6], second: [-1.4, 0, -2.0], target: [0, 1.5, -50], rows: [-5, 5, -4, -1.5], guards: [[3, 0, -1], [-3.5, 0, -0.5]], path: [[-9, 0, -3], [7, 0, 3]] };

// the old rampart scene reads "on the fort wall" — exterior wall covers more scripts, so "benteng" uses BentengSet
export const SETS: Record<SetId, { Comp: React.FC<SetProps>; anchors: Anchors }> = {
  makam: { Comp: Makam, anchors: MAKAM_A },
  balai: { Comp: Balai, anchors: BALAI_A },
  kamar: { Comp: Kamar, anchors: KAMAR_A },
  hutan: { Comp: Hutan, anchors: HUTAN_A },
  desa: { Comp: Desa, anchors: DESA_A },
  benteng: { Comp: BentengSet, anchors: BENTENG_A },
  pelabuhan: { Comp: Pelabuhan, anchors: PELABUHAN_A },
  dek: { Comp: Dek, anchors: DEK_A },
  medan: { Comp: Medan, anchors: MEDAN_A },
  pantai: { Comp: Pantai, anchors: PANTAI_A },
  gurun: { Comp: Gurun, anchors: GURUN_A },
  thur: { Comp: Thur, anchors: THUR_A },
  tungku: { Comp: Tungku, anchors: TUNGKU_A },
  laut: { Comp: Laut, anchors: LAUT_A },
};

void Color; void BufferAttribute; void fbm;
