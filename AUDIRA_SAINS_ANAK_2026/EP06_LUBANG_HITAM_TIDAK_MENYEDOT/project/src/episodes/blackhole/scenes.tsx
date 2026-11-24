// EP06 Lubang Hitam — one component + camera pose + key light per scene (multi-scene director, see BlackHoleFilm.tsx).
// Every pose moves through its scene (push, orbit, truck, crane); nothing is parked.
import React from "react";
import * as THREE from "three";
import type { FilmShot } from "../../core/scene/FilmScene.tsx";
import { AssetModel } from "../../core/assets/AssetModel.tsx";
import { BlackHole, Earth, LabelPlate, Ruler, StarPoint, Sun, Tube, glowTex } from "./bodies.tsx";
import { lerp, lerp3, ramp, SCENES, type SceneId } from "./timeline.ts";

type V3 = [number, number, number];
export type SceneOut = {
  node: React.ReactNode;
  shot: FilmShot;
  sunPos: V3;
  sunI: number;
  sunColor: string;
  fill: number;
  dense?: boolean;
};

const span = (id: SceneId) => SCENES.find((s) => s.id === id)!;
/** 0→1 progress through a scene. */
const prog = (t: number, id: SceneId) => {
  const s = span(id);
  return Math.min(1, Math.max(0, (t - s.start) / (s.end - s.start)));
};
const pop = (t: number, at: number, d = 0.45) => {
  const k = ramp(t, at, at + d);
  return k <= 0 ? 0.0001 : k + Math.sin(k * Math.PI) * 0.12;
};
const orbitRing = (r: number, n = 160) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
  });
const RING_SMALL = orbitRing(1.2);

// ── 1 hook: black hole + glowing disk, asteroid flies PAST (not sucked), push-in + 20° orbit ──
const hook = (t: number): SceneOut => {
  const k = prog(t, "hook");
  const a = lerp(-0.36, 0.0, k);
  const d = lerp(11.5, 8.2, k);
  const cam: V3 = [Math.sin(a) * d, lerp(1.7, 1.0, k), Math.cos(a) * d];
  const ax = lerp(-4.5, 6.0, ramp(t, 0, 5.4));
  const bend = Math.exp(-(ax * ax) / 6);
  return {
    node: (
      <group>
        <BlackHole radius={1} camPos={cam} spin={t * 0.7} heat={1} />
        <group position={[ax, 1.6 - 0.5 * bend, 1.5 - 0.6 * bend]} rotation={[t * 0.5, t * 0.3, 0]}>
          <AssetModel id="large-asteroid-391721" size={1.1} tint="#8A8178" roughness={0.95} />
        </group>
      </group>
    ),
    shot: { pos: cam, target: [0, 0.1, 0], fov: 40 },
    sunPos: [8, 4, 6],
    sunI: 2.2,
    sunColor: "#FFF4E6",
    fill: 0.08,
  };
};

// ── 2 squeeze: giant star compressed to a dot → black hole; then side by side with a star, same orbit ──
const squeeze = (t: number): SceneOut => {
  const R = 2.2 * Math.pow(0.08 / 2.2, ramp(t, 9.4, 12.0));
  const sunGlow = 1 - ramp(t, 11.7, 12.4);
  const bh = ramp(t, 11.8, 12.6);
  const slide = ramp(t, 12.7, 13.6);
  const bhX = lerp(0, 1.55, slide);
  const star2 = pop(t, 13.1, 0.5);
  const orbitOn = ramp(t, 13.4, 14.0);
  const oa = (t - 13.3) * 1.6;
  const back = ramp(t, 12.4, 14.0);
  const cam = lerp3(lerp3([0, 0.6, 12.5], [0, 0.35, 6.8], ramp(t, 5.4, 12.0)), [0.2, 1.9, 12.2], back);
  const target = lerp3([0, 0, 0], [0, 0.1, 0], back);
  const rulerOn = ramp(t, 6.2, 6.8) * (1 - ramp(t, 11.4, 11.9));
  return {
    node: (
      <group>
        <Sun radius={R} position={[bhX, 0, 0]} glow={sunGlow} />
        <BlackHole radius={0.3} position={[bhX, 0, 0]} camPos={cam} spin={t * 1.2} disk={bh} />
        <Ruler length={2 * R} position={[bhX, -Math.max(R, 0.5) - 0.45, 0]} rotation={[0, 0, Math.PI / 2]} opacity={rulerOn} />
        <group position={[-1.55, 0, 0]} scale={star2}>
          <Sun radius={0.55} />
        </group>
        {[-1.55, bhX].map((x, i) => (
          <group key={i} position={[x, 0, 0]} rotation={[0.35, 0, 0]}>
            <Tube points={RING_SMALL} radius={0.018} color="#3AA8FF" opacity={0.7 * orbitOn} closed />
            <group position={[Math.cos(oa) * 1.2, 0, Math.sin(oa) * 1.2]} scale={orbitOn + 0.0001} rotation={[t, t * 0.7, 0]}>
              <AssetModel id="medium-asteroid-ba674f" assetType="prop" size={0.32} tint="#9A8F84" roughness={0.95} />
            </group>
          </group>
        ))}
        <group position={[lerp(-3.4, -2.6, ramp(t, 5.4, 12)), -2.1, 3.2]} rotation={[t * 0.25, t * 0.2, 0]} scale={1 - ramp(t, 11.5, 12.5) + 0.0001}>
          <AssetModel id="large-asteroid-391721" size={1.0} tint="#7E756C" roughness={0.95} />
        </group>
      </group>
    ),
    shot: { pos: cam, target, fov: 40 },
    sunPos: [-6, 3, 8],
    sunI: 2.0,
    sunColor: "#FFF2DC",
    fill: 0.1,
  };
};

// ── 3 sunswap: top-down Sun + Earth orbit; Sun becomes a black hole, Earth keeps its lane ──
const ORBIT_R = 3.3;
const RING_EARTH = orbitRing(ORBIT_R);
const sunswap = (t: number): SceneOut => {
  const c = ramp(t, 16.4, 32.0);
  const el = lerp(1.42, 0.86, c);
  const az = lerp(0.0, 0.55, c);
  const dist = lerp(18.5, 15.2, c);
  const cam: V3 = [Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist + 0.01];
  const collapse = ramp(t, 19.0, 19.9);
  const bh = ramp(t, 19.5, 20.3);
  const sunOn = 1 - collapse;
  const ea = 0.9 + (t - 16.4) * 0.24;
  const ep: V3 = [Math.cos(ea) * ORBIT_R, 0, Math.sin(ea) * ORBIT_R];
  const sat = t * 1.4;
  const lane = 0.45 + 0.4 * ramp(t, 28.3, 28.9) * (0.7 + 0.3 * Math.sin((t - 28.3) * 6));
  const ruler = ramp(t, 24.7, 25.1) * (1 - ramp(t, 26.2, 26.6));
  const cold = ramp(t, 30.5, 31.6);
  return {
    node: (
      <group>
        <Sun radius={0.85 * sunOn} glow={sunOn} />
        <pointLight position={[0, 0, 0]} intensity={2.8 * sunOn} decay={0} color="#FFF1DA" />
        <BlackHole radius={0.2} camPos={cam} spin={t * 1.4} disk={bh} light={0.4} />
        <Tube points={RING_EARTH} radius={0.022} color="#3AA8FF" opacity={lane} closed />
        <Earth radius={0.58} position={ep} spin={t * 0.8} glow={1 - 0.75 * cold} />
        <group position={[ep[0] + Math.cos(sat) * 0.75, 0.25, ep[2] - Math.sin(sat) * 0.75]} rotation={[0, sat, 0]}>
          <AssetModel id="comm-satellite-fdc2cd" size={0.38} metalness={0.6} roughness={0.35} />
        </group>
        <Ruler length={0.9} position={[0, 0.1, 0.75]} rotation={[0, 0, Math.PI / 2]} opacity={ruler} />
        <LabelPlate text="AUDIRA LAB" sub="ORBIT BUMI" width={1.9} position={[0, -0.02, 1.85]} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
    ),
    shot: { pos: cam, target: [0, 0, 0.3], fov: 46 },
    sunPos: [6, 8, 4],
    sunI: 0.35 * (1 - collapse) + 0.12,
    sunColor: "#FFF6EA",
    fill: lerp(0.12, 0.06, cold),
  };
};

// ── 4 horizon: close black hole, light rays bend / one falls in, asteroid stretched like noodles ──
const rayPath = (b: number) => {
  const pts: THREE.Vector3[] = [];
  let x = -7.5;
  let y = b;
  let vx = 1;
  let vy = 0;
  for (let i = 0; i < 1600; i++) {
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    if (r < 1.0 || x > 7.5 || y < -6) break;
    const k = 1.7 / (r2 * r);
    vx -= k * x * 0.02;
    vy -= k * y * 0.02;
    const s = Math.hypot(vx, vy);
    vx /= s;
    vy /= s;
    x += vx * 0.02;
    y += vy * 0.02;
    if (i % 6 === 0) pts.push(new THREE.Vector3(x, y, 0));
  }
  return pts;
};
const RAYS = [3.4, 2.3, 1.75, 1.2].map(rayPath);
const raySlices = new Map<string, THREE.Vector3[]>();
const raySlice = (i: number, n: number) => {
  const key = `${i}:${n}`;
  if (!raySlices.has(key)) raySlices.set(key, RAYS[i].slice(0, n));
  return raySlices.get(key)!;
};
const horizon = (t: number): SceneOut => {
  const cam = lerp3(lerp3(lerp3([0.6, 0.9, 13.5], [0, 0.4, 8.4], ramp(t, 32.0, 35.2)), [1.5, 0.6, 7.8], ramp(t, 35.2, 42.2)), [-1.3, 0.25, 6.6], ramp(t, 42.2, 47.4));
  const mark = ramp(t, 37.0, 37.5) * (1 - ramp(t, 42.0, 42.6));
  const raysOn = 1 - ramp(t, 42.4, 43.2);
  const fall = Math.pow(ramp(t, 42.3, 47.3), 1.6);
  const d = lerp(5.0, 1.25, fall);
  const ang = lerp(0.42, 0.95, fall);
  const apos: V3 = [Math.cos(ang) * d, Math.sin(ang) * d, 0.4];
  const stretch = 1 + 3.8 * ramp(t, 43.7, 46.9);
  const aOn = ramp(t, 42.2, 42.7) * (1 - ramp(t, 47.0, 47.4));
  return {
    node: (
      <group>
        <BlackHole radius={1} camPos={cam} spin={t * 0.8} />
        {/* horizon marker: orange ring on the black edge */}
        <group position={[0, 0, 0.05]}>
          <mesh>
            <ringGeometry args={[1.12, 1.17, 128]} />
            <meshBasicMaterial color="#FF6B2C" transparent opacity={0.95 * mark} toneMapped={false} />
          </mesh>
        </group>
        {RAYS.map((pts, i) => {
          const p = ramp(t, 38.9 + i * 0.35, 41.6 + i * 0.35);
          const n = Math.max(2, Math.floor(pts.length * p));
          const head = pts[Math.min(pts.length - 1, n - 1)];
          const captured = i === 3;
          return p > 0 && raysOn > 0 ? (
            <group key={i}>
              <Tube points={raySlice(i, n)} radius={0.025} color={captured ? "#FF6B2C" : "#FFE08A"} opacity={0.75 * raysOn} />
              <sprite position={head} scale={[0.5, 0.5, 1]}>
                <spriteMaterial map={glowTex()} color={captured ? "#FF8A4A" : "#FFF2B0"} transparent opacity={raysOn * (captured && p > 0.98 ? 0 : 1)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
              </sprite>
            </group>
          ) : null;
        })}
        <group position={apos} rotation={[0, 0, ang]} scale={aOn + 0.0001}>
          <group scale={[stretch, 1 / Math.sqrt(stretch), 1 / Math.sqrt(stretch)]}>
            <AssetModel id="large-asteroid-391721" size={0.75} tint="#D8C2A8" roughness={0.65} metalness={0.15} emissive="#C2501A" />
          </group>
        </group>
        <group position={[-3.2, 2.6, 1.2]} rotation={[0.1, 1.2 + Math.sin(t * 0.4) * 0.1, 0]}>
          <AssetModel id="scout-ship-289ccc" assetType="vehicle" size={1.0} metalness={0.55} roughness={0.35} />
        </group>
      </group>
    ),
    shot: { pos: cam, target: lerp3([0, 0.3, 0], [0.4, 0.8, 0], ramp(t, 42.2, 47.4)), fov: 42 },
    sunPos: [-6, 5, 7],
    sunI: 1.6,
    sunColor: "#DDE8FF",
    fill: 0.07,
  };
};

// ── 5 disk: low orbit in the disk plane; infalling rocks spiral, gas heats up and glows ──
const BLOBS = Array.from({ length: 14 }, (_, i) => ({ r: 1.5 + (i % 7) * 0.42, a0: i * 2.39, s: 0.6 + (i % 3) * 0.25 }));
const disk = (t: number): SceneOut => {
  const k = prog(t, "disk");
  const a = lerp(0.25, 1.25, k);
  const dist = lerp(10.5, 9.0, k);
  const h = lerp(1.4, 2.6, k);
  const cam: V3 = [Math.sin(a) * dist, h, Math.cos(a) * dist];
  const heat = lerp(0.12, 1, ramp(t, 49.7, 55.1));
  const hot = new THREE.Color("#7A2A0C").lerp(new THREE.Color("#FFF0C8"), heat);
  return {
    node: (
      <group>
        <BlackHole radius={0.85} camPos={cam} spin={t * 0.9} heat={heat} tilt={0.06} light={1.4} />
        {[0, 1, 2].map((i) => {
          const r = lerp(6.8 - i * 0.6, 2.6, ramp(t, 47.6 + i * 0.5, 55.4));
          const ang = 1.2 + i * 2.1 + (t - 47.4) * (2.2 / Math.pow(r, 1.1));
          return (
            <group key={i} position={[Math.cos(ang) * r, 0.15 + i * 0.12, Math.sin(ang) * r]} rotation={[t * 0.6, t * 0.4 + i, 0]}>
              <AssetModel id="medium-asteroid-ba674f" assetType="prop" size={0.45 - i * 0.06} tint="#857A70" roughness={0.95} />
            </group>
          );
        })}
        {BLOBS.map((b, i) => {
          const ang = b.a0 + (t - 47.4) * (3.2 / Math.pow(b.r, 1.5));
          return (
            <sprite key={i} position={[Math.cos(ang) * b.r, 0.04, Math.sin(ang) * b.r]} scale={[b.s, b.s * 0.6, 1]}>
              <spriteMaterial map={glowTex()} color={hot} transparent opacity={0.35 + 0.5 * heat} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          );
        })}
      </group>
    ),
    shot: { pos: cam, target: [0, 0.35, 0], fov: 44 },
    sunPos: [5, 6, -4],
    sunI: 0.8,
    sunColor: "#FFE2C4",
    fill: 0.06,
  };
};

// ── 6 sgra: galactic centre, Sgr A* + S2 on its 16-year ellipse (Kepler, e = 0.88), crane ──
const kepler = (M: number, e: number) => {
  let E = M;
  for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
};
/** Orbit point with the long axis vertical (apocentre up), focus at origin. */
const ellipsePos = (a: number, e: number, E: number): V3 => {
  const b = a * Math.sqrt(1 - e * e);
  return [b * Math.sin(E), -a * (Math.cos(E) - e), 0];
};
const ellipsePts = (a: number, e: number) => Array.from({ length: 200 }, (_, i) => new THREE.Vector3(...ellipsePos(a, e, (i / 200) * Math.PI * 2)));
const S2 = { a: 3.6, e: 0.88, P: 7.2, tp: 69.55 };
const OTHERS = [
  { a: 2.6, e: 0.6, P: 5.2, tp: 60, rot: [0.4, 0.9, 0.6] as V3, col: "#FFD9A8" },
  { a: 4.2, e: 0.45, P: 9.5, tp: 64, rot: [-0.6, -0.5, 1.4] as V3, col: "#C8DAFF" },
  { a: 3.1, e: 0.75, P: 6.6, tp: 72, rot: [1.0, 0.3, -0.9] as V3, col: "#FFE6C8" },
  { a: 5.0, e: 0.3, P: 12, tp: 58, rot: [0.2, -1.1, 2.3] as V3, col: "#D8E4FF" },
];
const S2_PTS = ellipsePts(S2.a, S2.e);
const OTHER_PTS = OTHERS.map((o) => ellipsePts(o.a, o.e));
const ORB_ROT: V3 = [0.25, 0.55, 0];
const sgra = (t: number): SceneOut => {
  const zin = ramp(t, 55.75, 62.8);
  const crane = ramp(t, 64.5, 77.3);
  const az = lerp(-0.25, 0.55, crane);
  const el = lerp(0.12, 0.4, crane);
  const dist = lerp(38, 12.5, zin) * lerp(1, 0.95, crane);
  const target: V3 = [0, lerp(0, 2.7, zin), 0];
  const cam: V3 = [target[0] + Math.sin(az) * Math.cos(el) * dist, target[1] + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist];
  const s2 = (tt: number) => ellipsePos(S2.a, S2.e, kepler((2 * Math.PI * (tt - S2.tp)) / S2.P, S2.e));
  const orbitOn = ramp(t, 64.9, 65.6);
  const peri = Math.exp(-Math.pow((t - S2.tp) / 0.35, 2));
  return {
    dense: true,
    node: (
      <group>
        <BlackHole radius={0.16} camPos={cam} spin={t * 2} disk={0.55} light={0.6} />
        <group rotation={ORB_ROT}>
          <Tube points={S2_PTS} radius={0.022} color="#3AA8FF" opacity={0.8 * orbitOn} closed />
          {Array.from({ length: 16 }, (_, i) => (
            <sprite key={i} position={s2(t - (i + 1) * 0.07)} scale={[0.36 - i * 0.018, 0.36 - i * 0.018, 1]}>
              <spriteMaterial map={glowTex()} color="#9CC8FF" transparent opacity={(0.5 - i * 0.03) * orbitOn} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          ))}
          <StarPoint position={s2(t)} size={0.42} color="#A9CCFF" />
          <sprite position={[0, 0, 0]} scale={[1.6 * peri + 0.001, 1.6 * peri + 0.001, 1]}>
            <spriteMaterial map={glowTex()} color="#FFFFFF" transparent opacity={0.6 * peri} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        </group>
        <LabelPlate text="AUDIRA LAB" sub="ORBIT BINTANG S2" width={1.8} position={[1.0, 5.0, 0]} rotation={[0, az, 0]} opacity={ramp(t, 65.4, 66.0)} />
        {OTHERS.map((o, i) => {
          const p = ellipsePos(o.a, o.e, kepler((2 * Math.PI * (t - o.tp)) / o.P, o.e));
          return (
            <group key={i} rotation={o.rot}>
              <Tube points={OTHER_PTS[i]} radius={0.012} color="#6E8FC8" opacity={0.28} closed />
              <StarPoint position={p} size={0.26} color={o.col} opacity={0.85} />
            </group>
          );
        })}
      </group>
    ),
    shot: { pos: cam, target, fov: 44 },
    sunPos: [4, 6, 8],
    sunI: 0.6,
    sunColor: "#FFF2DC",
    fill: 0.08,
  };
};

// ── 7 outro: Earth safe in the foreground, astronaut floating, black hole far away, pull-back ──
const outro = (t: number): SceneOut => {
  const k = prog(t, "outro");
  const cam = lerp3([0.2, 0.3, 6.2], [0.9, 0.9, 10.8], k);
  return {
    node: (
      <group>
        <BlackHole radius={0.95} position={[-1.0, 2.6, -9]} camPos={cam} spin={t * 0.6} light={0.3} />
        <Earth radius={1.0} position={[-1.3, -1.5, 0.2]} spin={t * 0.4} />
        <group position={[0.75, lerp(-0.4, -0.15, k) + Math.sin(t * 0.9) * 0.08, 2.0]} rotation={[0.15, 3.5 - t * 0.04, 0.3]}>
          <AssetModel id="astronaut-explorer-323482" assetType="character" size={1.05} />
        </group>
      </group>
    ),
    shot: { pos: cam, target: [0, 0.3, -2], fov: 42 },
    sunPos: [9, 4, 7],
    sunI: 2.6,
    sunColor: "#FFE4BF",
    fill: 0.12,
  };
};

export const SCENE_FN: Record<SceneId, (t: number) => SceneOut> = {
  hook,
  squeeze,
  sunswap,
  horizon,
  disk,
  sgra,
  outro,
};
