// EP02 MASJIDIL HARAM MELUAS: white architectural maquette of Masjidil Haram on a dark plinth.
// Each era's footprint is its own white mass; its outline is projected light (URBANFORGE rule:
// "model is matter, data is light"). The Ka'bah is a small dark cube with the gold band of the
// kiswah, the door and nothing else: never damaged, never a prop.
//
// Units: 1 unit ~ 43 m. Ka'bah at the origin, north = -z (top of a 9:16 frame).
// Era masses (inside out): mataf disc, Umar's low wall, Abbasid/Ottoman riwaq with its row of
// small domes, Saudi I three-storey ring + Mas'a along the east side, King Fahd's west wing,
// the third Saudi expansion to the north. Minarets: 7 + 2 + 4 = 13 (research #37 #59 #71).

import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { FX_LAYER } from "../../core/render/Post.tsx";

export const PLASTER = "#E8E5DE";
export const PLASTER_WARM = "#EEE9DF";

/** Era ramp from oldest (warm amber) to newest (cool cyan): time read as colour of light. */
export const ERA = [
  { key: "umar", color: "#ffb347", label: "17 H", name: "UMAR", note: "tembok rendah" },
  { key: "abbasi", color: "#ffd166", label: "167 H", name: "ABBASIYAH", note: "±28.000 m²" },
  { key: "utsmani", color: "#f6e7a6", label: "1576", name: "KUBAH UTSMANI", note: "±28.000 m²" },
  { key: "saudi1", color: "#9ff3e6", label: "1955–76", name: "SAUDI I", note: "±160.000 m²" },
  { key: "fahd", color: "#5fe3f0", label: "1988", name: "SAYAP FAHD", note: "±356.000 m²" },
  { key: "saudi3", color: "#36c8ff", label: "2011–", name: "PERLUASAN III", note: ">1 juta m²" },
] as const;

type V3 = [number, number, number];

const usePlaster = (color = PLASTER, seed = 7) => {
  const grain = useSurfaceGrain(seed, 0.18, 6);
  return useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, roughnessMap: grain, bumpMap: grain, bumpScale: 0.004 }),
    [color, grain],
  );
};

const glow = (color: string, k = 2.2) =>
  new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: k, roughness: 0.4, toneMapped: false });

/** A projected light outline around a rectangle (x0..x1, z0..z1) at height y. */
const Outline: React.FC<{ x0: number; x1: number; z0: number; z1: number; y: number; color: string; w?: number; k?: number }> = ({
  x0, x1, z0, z1, y, color, w = 0.06, k = 2.6,
}) => {
  const m = useMemo(() => glow(color, k), [color, k]);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lx = x1 - x0, lz = z1 - z0;
  return (
    <group position={[0, y, 0]}>
      <mesh material={m} position={[cx, 0, z0]}><boxGeometry args={[lx + w, 0.012, w]} /></mesh>
      <mesh material={m} position={[cx, 0, z1]}><boxGeometry args={[lx + w, 0.012, w]} /></mesh>
      <mesh material={m} position={[x0, 0, cz]}><boxGeometry args={[w, 0.012, lz]} /></mesh>
      <mesh material={m} position={[x1, 0, cz]}><boxGeometry args={[w, 0.012, lz]} /></mesh>
    </group>
  );
};

/** Projected light wash: a thin tinted plane laid on a roof (colour is light, never paint). */
export const Wash: React.FC<{ pos: V3; size: [number, number]; color: string; opacity?: number }> = ({ pos, size, color, opacity = 0.2 }) => {
  const m = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    [color, opacity],
  );
  return (
    <mesh material={m} position={pos} rotation={[-Math.PI / 2, 0, 0]} layers={FX_LAYER} renderOrder={2}>
      <planeGeometry args={size} />
    </mesh>
  );
};

/** Stacked floor slabs over a dark core: reads as a multi-storey building at maquette scale. */
const Storeys: React.FC<{ pos: V3; size: [number, number]; floors: number; floorH?: number; mat: THREE.Material; core: THREE.Material; wash?: string; washK?: number }> = ({
  pos, size, floors, floorH = 0.17, mat, core, wash, washK = 0.2,
}) => {
  const gap = 0.028;
  const [sx, sz] = size;
  return (
    <group position={pos}>
      <mesh material={core} position={[0, (floors * floorH - 0.04) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx - 0.05, floors * floorH - 0.04, sz - 0.05]} />
      </mesh>
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={i} material={mat} position={[0, i * floorH + (floorH - gap) / 2 + gap, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[sx, floorH - gap, sz]} radius={0.012} segments={2} />
        </mesh>
      ))}
      {wash && <Wash pos={[0, floors * floorH + 0.004, 0]} size={[sx - 0.03, sz - 0.03]} color={wash} opacity={washK} />}
    </group>
  );
};

const Minaret: React.FC<{ pos: [number, number]; base: number; h?: number; mat: THREE.Material; gold: THREE.Material }> = ({ pos, base, h = 1.9, mat, gold }) => (
  <group position={[pos[0], base, pos[1]]}>
    <mesh material={mat} position={[0, 0.18, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 0.36, 0.2]} /></mesh>
    <mesh material={mat} position={[0, 0.36 + h * 0.4, 0]} castShadow><cylinderGeometry args={[0.055, 0.07, h * 0.8, 12]} /></mesh>
    <mesh material={mat} position={[0, 0.36 + h * 0.45, 0]} castShadow><cylinderGeometry args={[0.095, 0.08, 0.035, 12]} /></mesh>
    <mesh material={mat} position={[0, 0.36 + h * 0.72, 0]} castShadow><cylinderGeometry args={[0.085, 0.07, 0.03, 12]} /></mesh>
    <mesh material={mat} position={[0, 0.36 + h * 0.86, 0]} castShadow><cylinderGeometry args={[0.04, 0.055, h * 0.12, 10]} /></mesh>
    <mesh material={mat} position={[0, 0.36 + h * 0.98, 0]} castShadow><coneGeometry args={[0.05, h * 0.14, 10]} /></mesh>
    <mesh material={gold} position={[0, 0.36 + h * 1.07, 0]}><sphereGeometry args={[0.016, 8, 6]} /></mesh>
  </group>
);

/** Ka'bah: black kiswah cube, gold band, gold door on the north-east face. */
export const Kabah: React.FC = () => {
  const cloth = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0c0c0e", roughness: 0.62, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color("#3a3a40") }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9b25a", metalness: 0.85, roughness: 0.32, emissive: new THREE.Color("#5a3d0c"), emissiveIntensity: 0.35 }), []);
  const W = 0.3, D = 0.27, H = 0.35;
  return (
    <group rotation={[0, 0.0, 0]}>
      <mesh material={cloth} position={[0, H / 2, 0]} castShadow receiveShadow><boxGeometry args={[W, H, D]} /></mesh>
      <mesh material={gold} position={[0, H * 0.72, 0]}><boxGeometry args={[W + 0.006, 0.028, D + 0.006]} /></mesh>
      <mesh material={gold} position={[0.06, H * 0.33, -D / 2 - 0.003]}><boxGeometry args={[0.055, 0.12, 0.006]} /></mesh>
    </group>
  );
};

/** Row of small domes along a straight line (Ottoman riwaq roof). */
const DomeRow: React.FC<{ from: [number, number]; to: [number, number]; y: number; r: number; mat: THREE.Material }> = ({ from, to, y, r, mat }) => {
  const n = Math.max(2, Math.round(Math.hypot(to[0] - from[0], to[1] - from[1]) / (r * 2.25)));
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        return (
          <mesh key={i} material={mat} position={[from[0] + (to[0] - from[0]) * t, y, from[1] + (to[1] - from[1]) * t]} castShadow receiveShadow>
            <sphereGeometry args={[r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        );
      })}
    </>
  );
};

// Footprints (x0, x1, z0, z1)
const UMAR = { x0: -1.35, x1: 1.35, z0: -1.25, z1: 1.25 };
const OTT_IN = { x0: -2.35, x1: 2.35, z0: -2.75, z1: 2.6 };
const OTT_OUT = { x0: -2.9, x1: 2.9, z0: -3.3, z1: 3.15 };
const S1 = { x0: -4.5, x1: 5.2, z0: -4.9, z1: 4.6 };
const FAHD = { x0: -7.3, x1: -4.5, z0: -2.6, z1: 2.4 };
const S3 = { x0: -7.3, x1: 6.6, z0: -12.5, z1: -4.9 };
const PLAZA = { x0: -8.6, x1: 7.8, z0: -13.6, z1: 6.0 };

const inside = (r: { x0: number; x1: number; z0: number; z1: number }, x: number, z: number, m = 0) =>
  x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m;

const HILLS: { x: number; z: number; r: number; layers: number; seed: number }[] = [
  { x: 9.6, z: -0.5, r: 3.6, layers: 7, seed: 3 }, // Abu Qubais (east)
  { x: -12.5, z: 5.5, r: 4.2, layers: 6, seed: 5 },
  { x: 12.5, z: -12.5, r: 4.6, layers: 8, seed: 9 },
  { x: -13.5, z: -14.5, r: 5.2, layers: 8, seed: 11 },
  { x: 2.0, z: 12.5, r: 4.0, layers: 6, seed: 13 },
  { x: -3.0, z: -22.0, r: 6.0, layers: 9, seed: 17 },
  { x: 16.5, z: 6.5, r: 5.0, layers: 7, seed: 19 },
];

/** Contour-layer hills, like a laser-cut site model. */
const ContourHill: React.FC<{ x: number; z: number; r: number; layers: number; seed: number; mat: THREE.Material }> = ({ x, z, r, layers, seed, mat }) => {
  const rnd = useMemo(() => prng(seed * 7919 + 1), [seed]);
  const rings = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => {
        const t = i / layers;
        return { rr: r * (1 - t * 0.85), dx: (rnd() - 0.5) * r * 0.18 * t, dz: (rnd() - 0.5) * r * 0.18 * t, rot: rnd() * Math.PI };
      }),
    [layers, r, rnd],
  );
  return (
    <group position={[x, 0, z]}>
      {rings.map((g, i) => (
        <mesh key={i} material={mat} position={[g.dx, 0.11 * i + 0.055, g.dz]} rotation={[0, g.rot, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[g.rr, g.rr, 0.11, 9]} />
        </mesh>
      ))}
    </group>
  );
};

const hillHeightAt = (x: number, z: number) => {
  for (const h of HILLS) if (Math.hypot(x - h.x, z - h.z) < h.r + 0.6) return 1;
  return 0;
};

/** Seeded city blocks around the mosque, instanced. */
const City: React.FC<{ mat: THREE.Material }> = ({ mat }) => {
  const mesh = useMemo(() => {
    const rnd = prng(424242);
    const m4 = new THREE.Matrix4();
    const list: THREE.Matrix4[] = [];
    const step = 0.82;
    for (let gx = -34; gx <= 34; gx++) {
      for (let gz = -40; gz <= 26; gz++) {
        const x = gx * step + (rnd() - 0.5) * 0.12, z = gz * step + (rnd() - 0.5) * 0.12;
        const k = rnd();
        if (inside(PLAZA, x, z, 0.5) || hillHeightAt(x, z)) continue;
        if (Math.abs(x + 1.0) < 0.35 || Math.abs(z - 8.2) < 0.4 || Math.abs(x - 11.5) < 0.4) continue; // avenues
        if (k < 0.08) continue; // empty lots
        const d = Math.hypot(x, z + 3);
        const near = Math.max(0, 1 - d / 22);
        const h = 0.12 + Math.pow(rnd(), 2.2) * (0.5 + near * 1.6);
        const sx = 0.5 + rnd() * 0.22, sz = 0.5 + rnd() * 0.22;
        m4.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(sx, h, sz));
        list.push(m4.clone());
      }
    }
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((m, i) => im.setMatrixAt(i, m));
    im.castShadow = true;
    im.receiveShadow = true;
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, [mat]);
  return <primitive object={mesh} />;
};

export const HaramModel: React.FC<{ glowK?: number }> = ({ glowK = 2.2 }) => {
  const plaster = usePlaster(PLASTER, 7);
  const plasterWarm = usePlaster(PLASTER_WARM, 9);
  const marble = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.42, metalness: 0 }), []);
  const core = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b2b2f", roughness: 0.9 }), []);
  const plinth = useMemo(() => new THREE.MeshStandardMaterial({ color: "#121317", roughness: 0.55, metalness: 0.15 }), []);
  const plaza = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cfcbc2", roughness: 0.85 }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9b25a", metalness: 0.85, roughness: 0.3 }), []);
  const arch = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3833", roughness: 0.9 }), []);
  const ringMat = useMemo(() => glow(ERA[0].color, glowK), [glowK]);

  const ottY = 0.26;
  const s1Floors = 3, s1H = s1Floors * 0.17;

  return (
    <group>
      {/* plinth and site plate */}
      <mesh material={plinth} position={[0, -0.5, -6]} receiveShadow><boxGeometry args={[80, 1, 80]} /></mesh>
      <mesh material={plaza} position={[(PLAZA.x0 + PLAZA.x1) / 2, 0.01, (PLAZA.z0 + PLAZA.z1) / 2]} receiveShadow>
        <boxGeometry args={[PLAZA.x1 - PLAZA.x0, 0.02, PLAZA.z1 - PLAZA.z0]} />
      </mesh>

      {/* mataf: marble disc + projected ring */}
      <mesh material={marble} position={[0, 0.03, 0]} receiveShadow><cylinderGeometry args={[1.15, 1.15, 0.02, 64]} /></mesh>
      <mesh material={ringMat} position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.15, 1.19, 96]} /></mesh>
      <mesh material={marble} position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[OTT_IN.x1 - OTT_IN.x0, 0.02, OTT_IN.z1 - OTT_IN.z0]} />
      </mesh>
      <Kabah />

      {/* Umar: low wall (era 0) */}
      {[
        [0, UMAR.z0, UMAR.x1 - UMAR.x0, 0.04],
        [0, UMAR.z1, UMAR.x1 - UMAR.x0, 0.04],
      ].map(([x, z, lx, lz], i) => (
        <mesh key={`uw${i}`} material={plasterWarm} position={[x, 0.06, z]} castShadow receiveShadow><boxGeometry args={[lx, 0.08, lz]} /></mesh>
      ))}
      {[UMAR.x0, UMAR.x1].map((x, i) => (
        <mesh key={`uv${i}`} material={plasterWarm} position={[x, 0.06, 0]} castShadow receiveShadow><boxGeometry args={[0.04, 0.08, UMAR.z1 - UMAR.z0]} /></mesh>
      ))}
      <Outline {...UMAR} y={0.105} color={ERA[0].color} k={glowK} w={0.045} />
      <Wash pos={[0, 0.034, 0]} size={[UMAR.x1 - UMAR.x0, UMAR.z1 - UMAR.z0]} color={ERA[0].color} opacity={0.16} />
      <Wash pos={[(OTT_IN.x0 + OTT_IN.x1) / 2, 0.032, (OTT_IN.z0 + OTT_IN.z1) / 2]} size={[OTT_IN.x1 - OTT_IN.x0, OTT_IN.z1 - OTT_IN.z0]} color={ERA[1].color} opacity={0.12} />

      {/* Abbasid / Ottoman riwaq: arcade band + rows of small domes (era 1-2) */}
      {(() => {
        const bands: [number, number, number, number][] = [
          [(OTT_OUT.x0 + OTT_OUT.x1) / 2, (OTT_OUT.z0 + OTT_IN.z0) / 2, OTT_OUT.x1 - OTT_OUT.x0, OTT_IN.z0 - OTT_OUT.z0],
          [(OTT_OUT.x0 + OTT_OUT.x1) / 2, (OTT_OUT.z1 + OTT_IN.z1) / 2, OTT_OUT.x1 - OTT_OUT.x0, OTT_OUT.z1 - OTT_IN.z1],
          [(OTT_OUT.x0 + OTT_IN.x0) / 2, (OTT_IN.z0 + OTT_IN.z1) / 2, OTT_IN.x0 - OTT_OUT.x0, OTT_IN.z1 - OTT_IN.z0],
          [(OTT_OUT.x1 + OTT_IN.x1) / 2, (OTT_IN.z0 + OTT_IN.z1) / 2, OTT_OUT.x1 - OTT_IN.x1, OTT_IN.z1 - OTT_IN.z0],
        ];
        return bands.map(([x, z, lx, lz], i) => (
          <group key={`ob${i}`}>
            <mesh material={plasterWarm} position={[x, ottY / 2, z]} castShadow receiveShadow><RoundedBoxGeo args={[lx, ottY, lz]} radius={0.01} segments={2} /></mesh>
            <Wash pos={[x, ottY + 0.003, z]} size={[lx, lz]} color={ERA[2].color} opacity={0.26} />
          </group>
        ));
      })()}
      {/* arch shadow strip on the courtyard-facing side */}
      <Outline x0={OTT_IN.x0 + 0.012} x1={OTT_IN.x1 - 0.012} z0={OTT_IN.z0 + 0.012} z1={OTT_IN.z1 - 0.012} y={0.1} color="#000000" k={0} w={0.02} />
      {(() => {
        const r = 0.115, y = ottY;
        const mx0 = (OTT_OUT.x0 + OTT_IN.x0) / 2, mx1 = (OTT_OUT.x1 + OTT_IN.x1) / 2;
        const mz0 = (OTT_OUT.z0 + OTT_IN.z0) / 2, mz1 = (OTT_OUT.z1 + OTT_IN.z1) / 2;
        return (
          <>
            <DomeRow from={[mx0, mz0]} to={[mx1, mz0]} y={y} r={r} mat={plasterWarm} />
            <DomeRow from={[mx0, mz1]} to={[mx1, mz1]} y={y} r={r} mat={plasterWarm} />
            <DomeRow from={[mx0, mz0 + 0.27]} to={[mx0, mz1 - 0.27]} y={y} r={r} mat={plasterWarm} />
            <DomeRow from={[mx1, mz0 + 0.27]} to={[mx1, mz1 - 0.27]} y={y} r={r} mat={plasterWarm} />
          </>
        );
      })()}
      {Array.from({ length: 22 }, (_, i) => {
        // arch openings on the courtyard face (dark recesses), north and south sides
        const t = (i + 0.5) / 22;
        const x = OTT_IN.x0 + (OTT_IN.x1 - OTT_IN.x0) * t;
        return (
          <group key={`ar${i}`}>
            <mesh material={arch} position={[x, 0.1, OTT_IN.z0 - 0.004]}><boxGeometry args={[0.12, 0.15, 0.01]} /></mesh>
            <mesh material={arch} position={[x, 0.1, OTT_IN.z1 + 0.004]}><boxGeometry args={[0.12, 0.15, 0.01]} /></mesh>
          </group>
        );
      })}
      {Array.from({ length: 25 }, (_, i) => {
        const t = (i + 0.5) / 25;
        const z = OTT_IN.z0 + (OTT_IN.z1 - OTT_IN.z0) * t;
        return (
          <group key={`az${i}`}>
            <mesh material={arch} position={[OTT_IN.x0 - 0.004, 0.1, z]}><boxGeometry args={[0.01, 0.15, 0.12]} /></mesh>
            <mesh material={arch} position={[OTT_IN.x1 + 0.004, 0.1, z]}><boxGeometry args={[0.01, 0.15, 0.12]} /></mesh>
          </group>
        );
      })}
      <Outline {...OTT_OUT} y={ottY + 0.008} color={ERA[2].color} k={glowK} />

      {/* Saudi I: three-storey ring + Mas'a bar (era 3) */}
      <Storeys pos={[(S1.x0 + S1.x1) / 2, 0, (S1.z0 + OTT_OUT.z0) / 2]} size={[S1.x1 - S1.x0, OTT_OUT.z0 - S1.z0 - 0.25]} floors={s1Floors} mat={plaster} core={core} wash={ERA[3].color} />
      <Storeys pos={[(S1.x0 + S1.x1) / 2, 0, (S1.z1 + OTT_OUT.z1) / 2]} size={[S1.x1 - S1.x0, S1.z1 - OTT_OUT.z1 - 0.25]} floors={s1Floors} mat={plaster} core={core} wash={ERA[3].color} />
      <Storeys pos={[(S1.x0 + OTT_OUT.x0 - 0.25) / 2, 0, (OTT_OUT.z0 + OTT_OUT.z1) / 2]} size={[OTT_OUT.x0 - S1.x0 - 0.25, OTT_OUT.z1 - OTT_OUT.z0]} floors={s1Floors} mat={plaster} core={core} wash={ERA[3].color} />
      <Storeys pos={[(OTT_OUT.x1 + 0.25 + 4.45) / 2, 0, (OTT_OUT.z0 + OTT_OUT.z1) / 2]} size={[4.45 - OTT_OUT.x1 - 0.25, OTT_OUT.z1 - OTT_OUT.z0]} floors={s1Floors} mat={plaster} core={core} wash={ERA[3].color} />
      {/* Mas'a: long two-storey corridor on the east side, Safa (south) to Marwah (north) */}
      <Storeys pos={[4.85, 0, -0.15]} size={[0.62, S1.z1 - S1.z0 - 0.3]} floors={2} floorH={0.22} mat={plaster} core={core} wash={ERA[3].color} />
      <mesh material={plaster} position={[4.85, 0.44, S1.z1 - 0.55]} castShadow><sphereGeometry args={[0.24, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh material={plaster} position={[4.85, 0.44, S1.z0 + 0.5]} castShadow><sphereGeometry args={[0.24, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <Outline {...S1} y={s1H + 0.01} color={ERA[3].color} k={glowK} />
      {/* 7 Saudi I minarets */}
      {([
        [S1.x0 + 0.2, S1.z0 + 0.2], [S1.x1 - 0.2, S1.z0 + 0.2], [S1.x0 + 0.2, S1.z1 - 0.2], [S1.x1 - 0.2, S1.z1 - 0.2],
        [-0.45, S1.z1 - 0.2], [0.45, S1.z1 - 0.2], [S1.x1 - 0.2, -1.4],
      ] as [number, number][]).map((p, i) => (
        <Minaret key={`m1${i}`} pos={p} base={s1H} h={1.7} mat={plaster} gold={gold} />
      ))}

      {/* King Fahd west wing (era 4) */}
      <Storeys pos={[(FAHD.x0 + FAHD.x1) / 2, 0, (FAHD.z0 + FAHD.z1) / 2]} size={[FAHD.x1 - FAHD.x0, FAHD.z1 - FAHD.z0]} floors={3} mat={plaster} core={core} wash={ERA[4].color} />
      {/* rooftop small domes over the wing (cables gathered under small domes, research #50) */}
      {Array.from({ length: 4 }, (_, i) => (
        <DomeRow key={`fd${i}`} from={[FAHD.x0 + 0.4, FAHD.z0 + 0.6 + i * 1.2]} to={[FAHD.x1 - 0.3, FAHD.z0 + 0.6 + i * 1.2]} y={s1H} r={0.09} mat={plaster} />
      ))}
      <Outline {...FAHD} y={s1H + 0.012} color={ERA[4].color} k={glowK} />
      {([[FAHD.x0 + 0.2, -0.5], [FAHD.x0 + 0.2, 0.5]] as [number, number][]).map((p, i) => (
        <Minaret key={`m2${i}`} pos={p} base={s1H} h={1.75} mat={plaster} gold={gold} />
      ))}

      {/* Third Saudi expansion to the north (era 5): large four-storey mass with light courts */}
      <Storeys pos={[(S3.x0 + S3.x1) / 2, 0, (S3.z0 + S3.z1) / 2 - 0.15]} size={[S3.x1 - S3.x0, S3.z1 - S3.z0 - 0.3]} floors={4} mat={plaster} core={core} wash={ERA[5].color} />
      {Array.from({ length: 5 }, (_, j) => (
        <DomeRow key={`s3d${j}`} from={[S3.x0 + 0.5, S3.z0 + 1.0 + j * 1.35]} to={[S3.x1 - 0.5, S3.z0 + 1.0 + j * 1.35]} y={0.68} r={0.1} mat={plaster} />
      ))}
      <Outline {...S3} y={0.69} color={ERA[5].color} k={glowK} />
      {([[-0.6, S3.z0 + 0.2], [0.6, S3.z0 + 0.2], [S3.x1 - 0.2, S3.z0 + 0.2], [S3.x0 + 0.2, S3.z0 + 0.2]] as [number, number][]).map((p, i) => (
        <Minaret key={`m3${i}`} pos={p} base={0.68} h={2.1} mat={plaster} gold={gold} />
      ))}

      {/* surrounding city and contour hills */}
      <City mat={plaster} />
      {HILLS.map((h) => (
        <ContourHill key={h.seed} {...h} mat={plasterWarm} />
      ))}
    </group>
  );
};
