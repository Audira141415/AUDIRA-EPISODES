// c06 "Perjalanan setetes Zamzam": the stainless pipe runs from the hero cutaway through a trench to
// the King Abdullah Zamzam plant in Kudai (about 4–5 km, compressed). One glowing drop follows the
// process: raw-water tank → sand filters → cartridge filters → UV → two big tanks → back to the
// Haram; then the Makkah–Madinah map with a tanker truck and the thermoses in Madinah, 5 L containers.

import React, { useMemo } from "react";
import * as THREE from "three";
import { at, chapter, prog, smooth } from "./time.ts";
import { Plinth, PipeRun, alongPath, type V3 } from "./kit.tsx";
import { SET } from "./cam.ts";
import { POLISH, RoundedBoxGeo } from "../../core/polish/Polish.tsx";
import { FX_LAYER } from "../../core/render/Post.tsx";

const C = "c06_perjalanan";
export const T6 = {
  start: chapter(C).start,
  push: at(C, "Pompa listrik mendorong"),
  kudai: at(C, "ke kawasan Kudai"),
  project: at(C, "Proyek Raja Abdullah"),
  raw: at(C, "Air baku ditampung"),
  sand: at(C, "saringan pasir"),
  cart: at(C, "saringan kartrid"),
  uv: at(C, "sinar ultraviolet"),
  scada: at(C, "Seluruh alurnya"),
  tanks: at(C, "dua tangki besar"),
  back: at(C, "dialirkan kembali"),
  madinah: at(C, "dibawa ke Madinah"),
  truck: at(C, "Truk tangki"),
  termos: at(C, "Di Madinah"),
  pack: at(C, "Untuk dibawa pulang"),
  tests: at(C, "sampel air diuji"),
  end: chapter(C).end,
};

/** Local plant coordinates (relative to SET.P). */
const RAW: V3 = [-62, 0, -14];
const SANDF = [-42, -37, -32, -27].map((x) => [x, 0, -10] as V3);
const CART = Array.from({ length: 6 }, (_, i) => [-18 + i * 1.8, 0, -8] as V3);
const UV: V3 = [4, 2.4, -6];
const SCADA: V3 = [20, 0, -18];
const TANKS: V3[] = [[38, 0, -14], [58, 0, -14]];
const FILL: V3 = [62, 0, -1];
export const MAKKAH_DOT: V3 = [104, 0.6, -8];
export const MADINAH_DOT: V3 = [128, 0.6, -40];

/** Path of the drop through the process (local). */
const PROCESS: V3[] = [
  [-100, -1.45, -0.8], [-70, 1.2, -2], [-62, 8.4, -14], [-62, 1.2, -4], [-42, 1.2, -4], [-42, 6.4, -10], [-27, 1.2, -4],
  [-18, 1.2, -4], [-9, 1.2, -4], [0, 2.4, -6], [8, 2.4, -6], [38, 1.2, -4], [38, 12.4, -14],
];
const RETURN: V3[] = [[58, 1.2, -4], [58, 0.6, 2.2], [-100, 0.6, 2.2]];
const ROUTE: V3[] = [MAKKAH_DOT, [110, 0.6, -18], [116, 0.6, -24], [119, 0.6, -31], [124, 0.6, -36], MADINAH_DOT];

/** Drop position in WORLD coordinates (or null), shared with the overlay. */
export function dropAt(t: number): V3 | null {
  const P = SET.P;
  const toW = (p: V3): V3 => [p[0] + P[0], p[1] + P[1], p[2] + P[2]];
  if (t < T6.kudai || t > T6.madinah + 1) return null;
  if (t < T6.back) {
    // stage times along the process path
    const stops: [number, number][] = [[T6.kudai, 0], [T6.raw + 1, 0.2], [T6.sand + 0.5, 0.38], [T6.cart + 0.5, 0.55], [T6.uv + 0.6, 0.72], [T6.tanks + 0.5, 1]];
    let u = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const [ta, ua] = stops[i], [tb, ub] = stops[i + 1];
      if (t >= ta) u = ua + (ub - ua) * smooth(prog(t, ta, tb));
    }
    return toW(alongPath(PROCESS, u));
  }
  return toW(alongPath(RETURN, smooth(prog(t, T6.back, T6.madinah))));
}

export const Plant: React.FC<{ t: number }> = ({ t }) => {
  const m = useMemo(
    () => ({
      steel: new THREE.MeshPhysicalMaterial({ color: "#c9d0d4", metalness: 1, roughness: 0.22 }),
      concrete: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#8d8880" }),
      white: new THREE.MeshPhysicalMaterial({ color: "#e4e8ea", roughness: 0.35, clearcoat: 0.4 }),
      band: new THREE.MeshStandardMaterial({ color: "#2a86b0", roughness: 0.5 }),
      sandV: new THREE.MeshPhysicalMaterial({ color: "#d8b77f", roughness: 0.4, clearcoat: 0.3 }),
      uv: new THREE.MeshStandardMaterial({ color: "#7aa8ff", emissive: "#4a6dff", emissiveIntensity: 2.2 }),
      screen: new THREE.MeshStandardMaterial({ color: "#123", emissive: "#3fd0ff", emissiveIntensity: 0.9 }),
      flow: new THREE.MeshStandardMaterial({ color: "#7fe3ff", emissive: "#39c6f2", emissiveIntensity: 1.6 }),
      map: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#e9d6ae" }),
      road: new THREE.MeshStandardMaterial({ color: "#5c564e", roughness: 0.9 }),
      dot: new THREE.MeshStandardMaterial({ color: "#ef7a43", emissive: "#b8481c", emissiveIntensity: 0.6 }),
      truck: new THREE.MeshPhysicalMaterial({ color: "#f4f3ee", roughness: 0.3, clearcoat: 0.6 }),
      cab: new THREE.MeshPhysicalMaterial({ color: "#1e7a5a", roughness: 0.35, clearcoat: 0.6 }),
      termos: new THREE.MeshPhysicalMaterial({ color: "#efe6d2", roughness: 0.3, clearcoat: 0.6 }),
      cap: new THREE.MeshPhysicalMaterial({ color: "#2f6f5a", roughness: 0.4 }),
      jug: new THREE.MeshPhysicalMaterial({ color: "#dff3ff", roughness: 0.1, transmission: 0, transparent: true, opacity: 0.8 }),
      trench: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#d9b98a" }),
      hill: new THREE.MeshPhysicalMaterial({ ...POLISH.stone, color: "#c9a873", flatShading: true }),
    }),
    [],
  );
  const scada = smooth(prog(t, T6.scada - 0.5, T6.scada + 1.5));
  const truckU = smooth(prog(t, T6.truck, T6.termos + 1));
  const truckP = alongPath(ROUTE, truckU);
  const truckN = alongPath(ROUTE, Math.min(1, truckU + 0.02));
  const truckYaw = Math.atan2(-(truckN[2] - truckP[2]), truckN[0] - truckP[0]);
  const termos = prog(t, T6.termos + 0.5, T6.termos + 3);
  const pack = prog(t, T6.pack - 0.5, T6.pack + 3);
  const tP = (t * 0.6) % 1;

  return (
    <group>
      {/* trench from the hero cutaway's right edge to the plant (world x 110 → plant) */}
      <group position={[-250 + 0.0, 0, 0]}>
        <mesh position={[75, -5.1, -5]} material={m.trench} receiveShadow castShadow>
          <boxGeometry args={[152, 6, 10]} />
        </mesh>
        <PipeRun pts={[[0, -1.45, -0.8], [150, -1.45, -0.8]]} r={0.1} mat={m.steel} />
        <PipeRun pts={[[0, -1.8, -0.55], [150, -1.8, -0.55]]} r={0.08} mat={m.steel} />
        {Array.from({ length: 18 }, (_, i) => {
          const x = ((i / 18 + tP * 0.25) % 1) * 150;
          return (
            <mesh key={i} position={[x, -1.13, -0.6]} rotation={[0, 0, -Math.PI / 2]} material={m.flow}>
              <coneGeometry args={[0.13, 0.36, 3]} />
            </mesh>
          );
        })}
      </group>

      <group position={[10, 0, 0]}>
        <Plinth w={264} d={80} h={3.5} top="#9e9a92" side="#6f6b64" seed={41} front={10} />
      </group>

      {/* raw-water tank 5.000 m³ */}
      <mesh position={[RAW[0], 4, RAW[2]]} material={m.concrete} castShadow receiveShadow>
        <cylinderGeometry args={[7, 7.3, 8, 48]} />
      </mesh>
      {/* sand filters */}
      {SANDF.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 3, 0]} material={m.sandV} castShadow>
            <capsuleGeometry args={[1.8, 2.6, 6, 24]} />
          </mesh>
        </group>
      ))}
      {/* cartridge filters */}
      {CART.map((p, i) => (
        <mesh key={i} position={[p[0], 1.6, p[2]]} material={m.white} castShadow>
          <capsuleGeometry args={[0.6, 1.6, 6, 18]} />
        </mesh>
      ))}
      {/* UV chamber */}
      <group position={UV}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={m.steel} castShadow>
          <cylinderGeometry args={[1.0, 1.0, 8, 32]} />
        </mesh>
        {[-3, -1.5, 0, 1.5, 3].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={m.uv}>
            <torusGeometry args={[1.02, 0.07, 8, 32]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 1.01]} material={m.uv} layers={FX_LAYER}>
          <planeGeometry args={[6.5, 0.5]} />
        </mesh>
        <pointLight position={[0, 1.6, 2]} intensity={40} distance={12} color="#6f8dff" />
      </group>
      {/* SCADA control room */}
      <group position={SCADA}>
        <mesh position={[0, 2.6, 0]} material={m.white} castShadow receiveShadow>
          <RoundedBoxGeo args={[12, 5.2, 8]} radius={0.3} />
        </mesh>
        {[-3.6, 0, 3.6].map((x) => (
          <mesh key={x} position={[x, 2.8, 4.02]} material={m.screen} scale={[1, Math.max(0.01, scada), 1]}>
            <planeGeometry args={[3, 1.8]} />
          </mesh>
        ))}
      </group>
      {/* two Zamzam tanks 10.000 m³ */}
      {TANKS.map((p, i) => (
        <group key={i}>
          <mesh position={[p[0], 6.2, p[2]]} material={m.white} castShadow receiveShadow>
            <cylinderGeometry args={[8, 8, 12.4, 56]} />
          </mesh>
          {[3.5, 9.5].map((y) => (
            <mesh key={y} position={[p[0], y, p[2]]} material={m.band}>
              <cylinderGeometry args={[8.05, 8.05, 0.6, 56]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* process and return pipes */}
      <PipeRun pts={PROCESS.slice(1)} r={0.35} mat={m.steel} />
      <PipeRun pts={RETURN} r={0.35} mat={m.steel} />

      {/* filling line with 5 L containers */}
      <group position={FILL}>
        <mesh position={[0, 0.8, 0]} material={m.concrete} receiveShadow>
          <boxGeometry args={[18, 1.6, 2.2]} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const s = smooth(prog(pack, i / 12, i / 12 + 0.3));
          const x = -8 + ((i * 2 + t * 0.8) % 18);
          return s > 0.01 ? (
            <mesh key={i} position={[x, 2.15, 0]} scale={s} material={m.jug} castShadow>
              <RoundedBoxGeo args={[1.0, 1.3, 0.8]} radius={0.15} />
            </mesh>
          ) : null;
        })}
      </group>

      {/* Makkah–Madinah map board (compressed; north = -z) */}
      <group>
        <mesh position={[116, 0.25, -24]} material={m.map} receiveShadow>
          <RoundedBoxGeo args={[44, 0.5, 46]} radius={0.2} />
        </mesh>
        {[[110, -30, 3], [122, -16, 2.4], [130, -26, 2], [106, -40, 2.6]].map(([x, z, s], i) => (
          <mesh key={i} position={[x, 0.5, z]} scale={[s * 2, s * 0.6, s * 1.6]} material={m.hill} castShadow>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
        ))}
        <PipeRun pts={ROUTE} r={0.18} mat={m.road} />
        {[MAKKAH_DOT, MADINAH_DOT].map((p, i) => (
          <mesh key={i} position={p} material={m.dot}>
            <cylinderGeometry args={[0.9, 0.9, 0.5, 24]} />
          </mesh>
        ))}
        {/* tanker truck */}
        <group position={[truckP[0], 1.1, truckP[2]]} rotation={[0, truckYaw, 0]} scale={0.9}>
          <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} material={m.truck} castShadow>
            <capsuleGeometry args={[0.6, 2.2, 6, 16]} />
          </mesh>
          <mesh position={[1.4, 0.2, 0]} material={m.cab} castShadow>
            <RoundedBoxGeo args={[1.0, 1.2, 1.2]} radius={0.15} />
          </mesh>
        </group>
        {/* thermoses in Madinah */}
        {Array.from({ length: 8 }, (_, i) => {
          const s = smooth(prog(termos, i / 10, i / 10 + 0.3));
          return s > 0.01 ? (
            <group key={i} position={[MADINAH_DOT[0] - 4.2 + (i % 4) * 2.4, 0.5, MADINAH_DOT[2] + 8 + Math.floor(i / 4) * 2.4]} scale={s}>
              <mesh position={[0, 0.9, 0]} material={m.termos} castShadow>
                <cylinderGeometry args={[0.55, 0.6, 1.8, 20]} />
              </mesh>
              <mesh position={[0, 1.95, 0]} material={m.cap}>
                <cylinderGeometry args={[0.35, 0.45, 0.3, 16]} />
              </mesh>
            </group>
          ) : null;
        })}
      </group>
    </group>
  );
};
