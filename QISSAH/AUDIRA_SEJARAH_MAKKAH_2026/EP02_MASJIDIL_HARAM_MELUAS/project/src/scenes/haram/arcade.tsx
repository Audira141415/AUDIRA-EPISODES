// The riwaq (arcade) around the courtyard: from Utsman's first roofed colonnade to the Ottoman domes.
// Close-up detail: pointed-arch courtyard facade, marble columns, piers, drums + domes + finials, lamps.
import React, { useMemo } from "react";
import * as THREE from "three";
import { arcadeWallGeometry, DomeRow, glowMat, Wash, type Rect, type useMats } from "./parts.tsx";

export const ARC_H = 0.26;
const BAY = 0.22;

type Side = "N" | "S" | "W" | "E";

export function sideFrame(R: Rect, bw: number, s: Side) {
  // returns centre-line endpoints, facade line, outward normal and length
  if (s === "N") return { a: [R.x0 + bw / 2, R.z0 + bw / 2], b: [R.x1 - bw / 2, R.z0 + bw / 2], len: R.x1 - R.x0, cx: (R.x0 + R.x1) / 2, cz: R.z0 + bw / 2, rotY: 0, facade: R.z0 + bw, horiz: true };
  if (s === "S") return { a: [R.x0 + bw / 2, R.z1 - bw / 2], b: [R.x1 - bw / 2, R.z1 - bw / 2], len: R.x1 - R.x0, cx: (R.x0 + R.x1) / 2, cz: R.z1 - bw / 2, rotY: Math.PI, facade: R.z1 - bw, horiz: true };
  if (s === "W") return { a: [R.x0 + bw / 2, R.z0 + bw], b: [R.x0 + bw / 2, R.z1 - bw], len: R.z1 - R.z0 - 2 * bw, cx: R.x0 + bw / 2, cz: (R.z0 + R.z1) / 2, rotY: Math.PI / 2, facade: R.x0 + bw, horiz: false };
  return { a: [R.x1 - bw / 2, R.z0 + bw], b: [R.x1 - bw / 2, R.z1 - bw], len: R.z1 - R.z0 - 2 * bw, cx: R.x1 - bw / 2, cz: (R.z0 + R.z1) / 2, rotY: -Math.PI / 2, facade: R.x1 - bw, horiz: false };
}

/** Column positions along a side's centre line (bay boundaries). */
export function columnPositions(R: Rect, bw: number, s: Side): [number, number][] {
  const f = sideFrame(R, bw, s);
  const n = Math.max(2, Math.round(f.len / BAY));
  const out: [number, number][] = [];
  for (let i = 1; i < n; i++) {
    const k = i / n;
    out.push([f.a[0] + (f.b[0] - f.a[0]) * k, f.a[1] + (f.b[1] - f.a[1]) * k]);
  }
  return out;
}

const ArcadeSide: React.FC<{
  R: Rect; bw: number; s: Side; mats: ReturnType<typeof useMats>; col: THREE.Material; flatMat: THREE.Material; lampMat: THREE.Material;
  domes: number; flatLift: number; flatVis: number; piers: number; lamps: number; skip?: Set<number>; seed: number;
}> = ({ R, bw, s, mats, col, flatMat, lampMat, domes, flatLift, flatVis, piers, lamps, skip, seed }) => {
  const f = sideFrame(R, bw, s);
  const nArch = Math.max(2, Math.round(f.len / BAY));
  const key = `${f.len.toFixed(2)}|${nArch}`;
  const wallGeo = useMemo(() => arcadeWallGeometry(f.len, ARC_H, nArch, 0.022), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const cols = columnPositions(R, bw, s);
  const H = ARC_H;
  // facade placement: along the side, on the courtyard edge, facing inward
  const fx = f.horiz ? f.cx : f.facade;
  const fz = f.horiz ? f.facade : f.cz;
  const facadeRot = s === "N" ? 0 : s === "S" ? Math.PI : s === "W" ? -Math.PI / 2 : Math.PI / 2;
  const outer = s === "N" ? [f.cx, R.z0 + 0.02] : s === "S" ? [f.cx, R.z1 - 0.02] : s === "W" ? [R.x0 + 0.02, f.cz] : [R.x1 - 0.02, f.cz];
  const len = f.horiz ? f.len : f.len + 2 * bw;
  const dims = (a: number, b: number): [number, number, number] => (f.horiz ? [a, 0, b] : [b, 0, a]);
  const bandSize = dims(f.len, bw);
  return (
    <group>
      {/* shaded floor under the band */}
      <mesh material={mats.shade} position={[f.cx, 0.006, f.cz]} receiveShadow><boxGeometry args={[bandSize[0], 0.012, bandSize[2]]} /></mesh>
      {/* solid outer wall */}
      <mesh material={mats.warm} position={[outer[0], H / 2, outer[1]]} castShadow receiveShadow>
        <boxGeometry args={f.horiz ? [len, H, 0.04] : [0.04, H, len]} />
      </mesh>
      {/* pointed-arch courtyard facade */}
      <mesh geometry={wallGeo} material={mats.warm} position={[fx, 0, fz]} rotation={[0, facadeRot, 0]} castShadow receiveShadow />
      {/* marble columns on the centre line */}
      {cols.map((p, i) =>
        skip?.has(i) ? null : (
          <mesh key={i} material={col} position={[p[0], H / 2, p[1]]} castShadow>
            <cylinderGeometry args={[0.017, 0.02, H, 10]} />
          </mesh>
        ),
      )}
      {/* Ottoman support piers between the old columns */}
      {piers > 0.01 &&
        cols.slice(0, -1).map((p, i) => {
          const q = cols[i + 1];
          return (
            <mesh key={`p${i}`} material={mats.warm} position={[(p[0] + q[0]) / 2, (H * piers) / 2, (p[1] + q[1]) / 2]} scale={[1, Math.max(0.01, piers), 1]} castShadow>
              <boxGeometry args={[0.04, H, 0.04]} />
            </mesh>
          );
        })}
      {/* roof slab */}
      <mesh material={mats.warm} position={[f.cx, H + 0.012, f.cz]} castShadow receiveShadow><boxGeometry args={[bandSize[0], 0.024, bandSize[2]]} /></mesh>
      {/* flat timber roof (before 1570s), lifts away in chapter 3 */}
      {flatVis > 0.01 && (
        <mesh material={flatMat} position={[f.cx, H + 0.04 + flatLift * 0.7, f.cz]} castShadow={flatVis > 0.5}>
          <boxGeometry args={[bandSize[0] * 1.002, 0.03, bandSize[2] * 1.002]} />
        </mesh>
      )}
      {/* domes on drums, with small finials */}
      {domes > 0.001 && <DomeRow from={f.a as [number, number]} to={f.b as [number, number]} y={H + 0.024} r={bw * 0.21} mat={mats.warm} finial={mats.gold} drop={domes} seed={seed} />}
      {/* lamps along the courtyard edge */}
      {lamps > 0.01 &&
        Array.from({ length: Math.max(2, Math.round(f.len / 0.3)) }, (_, i) => {
          const k = (i + 0.5) / Math.max(2, Math.round(f.len / 0.3));
          const off = s === "N" ? 0.02 : s === "S" ? -0.02 : s === "W" ? 0.02 : -0.02;
          const x = f.horiz ? f.a[0] - bw / 2 + f.len * k : fx + off;
          const z = f.horiz ? fz + off : f.a[1] + (f.b[1] - f.a[1]) * k;
          return (
            <mesh key={`l${i}`} material={lampMat} position={[x, H * 0.66, z]}>
              <sphereGeometry args={[0.011, 6, 5]} />
            </mesh>
          );
        })}
    </group>
  );
};

export const Arcade: React.FC<{
  R: Rect; bw: number; rise: number; mats: ReturnType<typeof useMats>; domes: number; flatLift: number; tilt: number; fire: number;
  piers: number; marble: number; lamps: number; skipE?: Set<number>; skipS?: Set<number>;
}> = ({ R, bw, rise, mats, domes, flatLift, tilt, fire, piers, marble, lamps, skipE, skipS }) => {
  const col = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: 0.45 }), []);
  col.roughness = 0.9 - 0.5 * marble;
  col.color.set(marble > 0.5 ? "#f3efe6" : "#ddd3c2");
  const flatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e4d7bf", roughness: 0.8, transparent: true }), []);
  const flatVis = (1 - domes) * (1 - flatLift);
  flatMat.opacity = Math.min(1, flatVis * 1.2);
  const lampMat = useMemo(() => glowMat("#ffcf7a", 0), []);
  lampMat.emissiveIntensity = 3.2 * lamps;
  if (rise <= 0.002) return null;
  const common = { R, bw, mats, col, flatMat, lampMat, domes, flatLift, flatVis, piers, lamps };
  return (
    <group scale={[1, Math.max(0.002, rise), 1]}>
      <ArcadeSide {...common} s="N" seed={1} />
      <ArcadeSide {...common} s="S" seed={2} skip={skipS} />
      <ArcadeSide {...common} s="W" seed={3} />
      {/* east side can lean towards the Ka'bah (the 1570s report) */}
      <group position={[R.x1, 0, 0]} rotation={[0, 0, tilt * 0.06]}>
        <group position={[-R.x1, 0, 0]}>
          <ArcadeSide {...common} s="E" seed={4} skip={skipE} />
        </group>
      </group>
      {tilt > 0.01 && <Wash pos={[R.x1 - bw / 2, ARC_H + 0.05, (R.z0 + R.z1) / 2]} size={[bw, R.z1 - R.z0 - 2 * bw]} color="#ffb347" opacity={0.35 * tilt} />}
      {fire > 0.01 && (
        <>
          <Wash pos={[(R.x0 + R.x1) / 2 - (R.x1 - R.x0) * 0.2, ARC_H + 0.06, R.z0 + bw / 2]} size={[(R.x1 - R.x0) * 0.6, bw]} color="#ff6a3d" opacity={0.42 * fire} />
          <Wash pos={[R.x0 + bw / 2, ARC_H + 0.06, (R.z0 + R.z1) / 2 - (R.z1 - R.z0) * 0.2]} size={[bw, (R.z1 - R.z0) * 0.6]} color="#ff6a3d" opacity={0.42 * fire} />
        </>
      )}
    </group>
  );
};
