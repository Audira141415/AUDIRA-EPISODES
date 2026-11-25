// The hand-scroll world: paper sky, layered Shan Shui ranges, mist, two banks with rocks, pines and
// reeds, the river surface, and the grey-blue ink depths below it.
import React, { useMemo } from "react";
import * as THREE from "three";
import { GEO, Ink } from "./Cast";
import { G, PAL, makeBlot, makeDome, makeFill, makeLine, makeMist, makeMountain, makeSky, makeWater } from "./ink";
import { FAR_BANK_X, ROCK, STONE, hash } from "./layout";

type V3 = [number, number, number];

/** Deterministic lumpy rock: an icosphere pushed in and out by hashed vertex noise. */
const rockGeo = (seed: number, detail = 2) => {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 3.1 + seed) * Math.cos(v.z * 2.7 + seed * 1.7) * 0.12 + Math.sin(v.y * 5.3 + seed * 0.3) * 0.06;
    const flat = v.y > 0.55 ? 0.82 : 1; // weathered flat tops
    v.multiplyScalar((1 + n) * flat);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const Mountains: React.FC = () => {
  const layers = useMemo(
    () => [
      { z: -190, x: 10, w: 620, h: 95, m: makeMountain(3.1, 0.32, PAL.indigo, 0.62, 0.2, 0.8), ro: -9 },
      { z: -120, x: 20, w: 380, h: 56, m: makeMountain(7.7, 0.5, PAL.indigo, 0.58, 0.16, 1), ro: -8 },
      { z: -72, x: 0, w: 230, h: 28, m: makeMountain(12.4, 0.72, PAL.inkSoft, 0.5, 0.14, 1.2), ro: -7 },
      { z: -40, x: -18, w: 70, h: 11, m: makeMountain(21.9, 0.9, PAL.ink, 0.55, 0.1, 1.4), ro: -6 },
      { z: -44, x: 52, w: 80, h: 12, m: makeMountain(33.3, 0.85, PAL.ink, 0.5, 0.1, 1.4), ro: -6 },
    ],
    [],
  );
  return (
    <>
      {layers.map((l, i) => (
        <mesh key={i} position={[l.x, l.h / 2 - 3, l.z]} material={l.m} renderOrder={l.ro}>
          <planeGeometry args={[l.w, l.h]} />
        </mesh>
      ))}
    </>
  );
};

const Mists: React.FC = () => {
  const bands = useMemo(
    () => [
      { p: [10, 6, -150] as V3, s: [600, 40] as [number, number], m: makeMist(1, 0.9), ro: -8.5 },
      { p: [10, 4, -95] as V3, s: [360, 22] as [number, number], m: makeMist(4, 0.85), ro: -7.5 },
      { p: [10, 2.2, -58] as V3, s: [220, 12] as [number, number], m: makeMist(9, 0.8), ro: -6.5 },
      { p: [10, 1.2, -30] as V3, s: [140, 5] as [number, number], m: makeMist(14, 0.7), ro: -5.5 },
      { p: [12, 0.6, -14] as V3, s: [80, 2.4] as [number, number], m: makeMist(17, 0.55), ro: -5 },
    ],
    [],
  );
  return (
    <>
      {bands.map((b, i) => (
        <mesh key={i} position={b.p} material={b.m} renderOrder={b.ro}>
          <planeGeometry args={b.s} />
        </mesh>
      ))}
    </>
  );
};

/** A Shan Shui pine: crooked trunk, flat needle pads. */
const Pine: React.FC<{ at: V3; s?: number; lean?: number; seed?: number; t: number }> = ({ at, s = 1, lean = 0.25, seed = 1, t }) => {
  const m = useMemo(() => ({ trunk: makeFill({ tone: PAL.inkSoft, dark: 0.75, rim: 0.5, grain: 0.3 }), pad: makeFill({ tone: PAL.ink, dark: 0.85, rim: 0.2, grain: 0.3 }), line: makeLine(0.02) }), []);
  const segs = useMemo(() => {
    const out: { p: V3; r: V3; len: number; w: number }[] = [];
    let x = 0, y = 0, a = lean;
    for (let i = 0; i < 6; i++) {
      const len = 0.75 - i * 0.05;
      a += (hash(seed * 10 + i) - 0.5) * 0.7;
      const dx = Math.sin(a) * len, dy = Math.cos(a) * len;
      out.push({ p: [x + dx / 2, y + dy / 2, 0], r: [0, 0, -a], len, w: 0.11 - i * 0.014 });
      x += dx; y += dy;
    }
    return out;
  }, [lean, seed]);
  const pads = useMemo(
    () =>
      segs.slice(2).flatMap((sg, i) =>
        [0, 1].map((k) => ({
          p: [sg.p[0] + (k ? 1 : -1) * (0.45 + hash(seed + i * 3 + k) * 0.5), sg.p[1] + 0.1, (hash(seed + i * 7 + k) - 0.5) * 0.6] as V3,
          s: [0.55 + hash(i + k + seed) * 0.35, 0.08, 0.4] as V3,
          ph: hash(i * 5 + k),
        })),
      ),
    [segs, seed],
  );
  return (
    <group position={at} scale={[s, s, s]}>
      {segs.map((sg, i) => (
        <Ink key={i} geo={GEO.cyl} fill={m.trunk} line={m.line} position={sg.p} rotation={sg.r} scale={[sg.w, sg.len * 1.05, sg.w]} />
      ))}
      {pads.map((pd, i) => (
        <Ink key={i} geo={GEO.sphere} fill={m.pad} line={m.line} position={[pd.p[0], pd.p[1] + Math.sin(t * 0.6 + pd.ph * 6) * 0.015, pd.p[2]]} rotation={[0, pd.ph * 3, (pd.ph - 0.5) * 0.2]} scale={pd.s} />
      ))}
    </group>
  );
};

const Reeds: React.FC<{ x0: number; x1: number; z0: number; z1: number; n: number; seed: number; t: number }> = ({ x0, x1, z0, z1, n, seed, t }) => {
  const m = useMemo(() => makeFill({ tone: PAL.ink, dark: 0.9, rim: 0, grain: 0.1 }), []);
  const list = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        x: x0 + hash(seed + i * 3.1) * (x1 - x0),
        z: z0 + hash(seed + i * 5.7) * (z1 - z0),
        h: 0.5 + hash(seed + i * 9.3) * 0.7,
        lean: (hash(seed + i * 2.3) - 0.5) * 0.5,
        ph: hash(seed + i) * 6,
      })),
    [n, seed, x0, x1, z0, z1],
  );
  return (
    <>
      {list.map((r, i) => (
        <group key={i} position={[r.x, -0.05, r.z]} rotation={[0, 0, r.lean + Math.sin(t * 0.9 + r.ph) * 0.05]}>
          <mesh geometry={GEO.cone} material={m} position={[0, r.h / 2, 0]} scale={[0.008, r.h, 0.008]} />
        </group>
      ))}
    </>
  );
};

const Bank: React.FC<{ x: number; dir: 1 | -1; t: number; near?: boolean }> = ({ x, dir, t, near }) => {
  const m = useMemo(
    () => ({
      ground: makeFill({ tone: PAL.wash, dark: 0.32, rim: 0.65, grain: 0.35 }),
      rock: makeFill({ tone: PAL.inkSoft, dark: 0.5, rim: 0.7, grain: 0.4 }),
      line: makeLine(0.016),
      g: [rockGeo(1.3), rockGeo(4.1), rockGeo(7.9), rockGeo(2.2, 1), rockGeo(5.5, 1)],
    }),
    [],
  );
  // dir: which way the land extends (-1 = to the left of x)
  const sx = dir;
  return (
    <group>
      <Ink geo={m.g[0]} fill={m.ground} line={m.line} position={[x + sx * 9, -0.25, -3]} scale={[9.2, 0.6, 9]} />
      <Ink geo={m.g[1]} fill={m.rock} line={m.line} position={[x + sx * 6, -0.1, -13]} scale={[2.0, 0.9, 1.4]} />
      <Ink geo={m.g[2]} fill={m.rock} line={m.line} position={[x + sx * 10, 0.2, -19]} scale={[3.0, 1.8, 2.2]} />
      {near ? null : <Ink geo={m.g[3]} fill={m.rock} line={m.line} position={[x + sx * 0.6, -0.05, 0.6]} scale={[0.9, 0.5, 0.7]} />}
      <Reeds x0={near ? -6.6 : x - 0.4} x1={near ? -5.3 : x + 0.5} z0={near ? -2.6 : -2.5} z1={near ? -0.6 : 2.5} n={near ? 22 : 18} seed={x} t={t} />
    </group>
  );
};

const NearBankProps: React.FC = () => {
  const m = useMemo(
    () => ({
      rock: makeFill({ tone: PAL.inkSoft, dark: 0.55, rim: 0.7, grain: 0.4 }),
      stone: makeFill({ tone: PAL.wash, dark: 0.38, rim: 0.6, grain: 0.35 }),
      line: makeLine(0.012),
      a: rockGeo(9.1),
      b: rockGeo(3.3),
      c: rockGeo(6.6, 1),
    }),
    [],
  );
  return (
    <>
      {/* the scorpion's rock */}
      <Ink geo={m.a} fill={m.rock} line={m.line} position={[ROCK.x, ROCK.top - 0.4, ROCK.z]} scale={[0.36, 0.48, 0.32]} />
      {/* the flat sunning stone, half in the water */}
      <Ink geo={m.b} fill={m.stone} line={m.line} position={[STONE.x, STONE.top - 0.16, STONE.z]} scale={[0.85, 0.2, 0.7]} />
      <Ink geo={m.c} fill={m.rock} line={m.line} position={[ROCK.x - 0.7, 0.05, ROCK.z - 0.9]} scale={[0.4, 0.35, 0.35]} />
      <Ink geo={m.c} fill={m.stone} line={m.line} position={[ROCK.x + 0.45, 0.0, ROCK.z + 0.3]} scale={[0.22, 0.14, 0.2]} />
    </>
  );
};

export const World: React.FC<{ t: number; camPos: V3; camQuat: THREE.Quaternion }> = ({ t, camPos, camQuat }) => {
  const sky = useMemo(() => makeSky(), []);
  const water = useMemo(() => makeWater(), []);
  const dome = useMemo(() => makeDome(), []);
  const under = G.uUnder.value > 0.5;
  return (
    <>
      <mesh position={[camPos[0] * 0.9, 60, -260]} material={sky} renderOrder={-10}>
        <planeGeometry args={[1400, 700]} />
      </mesh>
      <Mountains />
      <Mists />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0, -60]} material={water}>
        <planeGeometry args={[500, 300]} />
      </mesh>
      <Bank x={-3.4} dir={-1} t={t} near />
      <NearBankProps />
      <Pine at={[-8.6, 0.2, -4.5]} s={1.1} lean={0.35} seed={3} t={t} />
      <Pine at={[-10.5, 0.4, -6]} s={0.8} lean={-0.2} seed={8} t={t} />
      <Bank x={FAR_BANK_X} dir={1} t={t} />
      <Pine at={[FAR_BANK_X + 3, 0.2, -3.5]} s={1.25} lean={-0.4} seed={5} t={t} />
      {under ? (
        <mesh position={camPos} material={dome} renderOrder={-10} scale={[60, 60, 60]}>
          <sphereGeometry args={[1, 32, 16]} />
        </mesh>
      ) : null}
      <Bubbles t={t} camQuat={camQuat} />
    </>
  );
};

/* ---------- underwater: light shafts are owned by Film (they follow the sinking) ---------- */
export const Shafts: React.FC<{ center: V3; camQuat: THREE.Quaternion; alpha: number }> = ({ center, camQuat, alpha }) => {
  const mats = useMemo(() => [0, 1, 2, 3].map((i) => makeBlot("#dfe6e4", 1, i * 3.3)), []);
  mats.forEach((m) => ((m.uniforms.uAlpha as { value: number }).value = alpha * 0.22));
  return (
    <>
      {mats.map((m, i) => (
        <mesh key={i} position={[center[0] - 3 + i * 2.1, -5, center[2] - 3 - i * 1.4]} rotation={[0, 0, 0.22]} material={m} renderOrder={5}>
          <planeGeometry args={[1.2 + i * 0.3, 14]} />
        </mesh>
      ))}
    </>
  );
};

// Placeholder kept for structure; bubbles are emitted by Film (they belong to the turtle).
const Bubbles: React.FC<{ t: number; camQuat: THREE.Quaternion }> = () => null;
