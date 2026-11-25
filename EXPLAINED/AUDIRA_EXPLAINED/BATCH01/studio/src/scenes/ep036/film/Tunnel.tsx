// EP036 film: inside one bored tunnel. A long run of segmented rings, track, lamps, a train
// that can rush past, and seepage droplets that run down to the side channel.

import React, { useMemo } from "react";
import { ExtrudeGeometry, Shape } from "three";
import { pipe } from "../World.tsx";
import { P } from "../layout.ts";
import { Rings, Train } from "./common.tsx";

export const IT = { R: 2.8, r: 2.42, len: 1.5, z0: 12, n: 46, invertY: -1.85, channelX: 1.45 };

export type TunnelState = { t: number; train: number; seep: number; glow: number };

export const TunnelInterior: React.FC<{ s: TunnelState }> = ({ s }) => {
  const inv = useMemo(() => {
    const r = IT.r + 0.01;
    const a = Math.asin(IT.invertY / r);
    const sh = new Shape();
    sh.moveTo(Math.cos(a) * r, IT.invertY);
    sh.absarc(0, 0, r, a, Math.PI - a, true);
    sh.closePath();
    const g = new ExtrudeGeometry(sh, { depth: IT.n * IT.len, bevelEnabled: false, curveSegments: 40 });
    g.translate(0, 0, IT.z0 - IT.n * IT.len);
    return g;
  }, []);
  const L = IT.n * IT.len;
  const zc = IT.z0 - L / 2;
  // seepage beads: crawl down the wall from a joint near camera, then along the channel
  const beads = Array.from({ length: 7 }, (_, i) => {
    const k = (((i / 7 + s.t * 0.22) % 1) + 1) % 1;
    const a = -0.3 - k * 0.62; // angle sliding down the right wall
    const r = IT.r - 0.03;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: 6.06 - i * 0.02, k };
  });
  const trail = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const a = -0.3 - (i / 12) * 0.62;
      pts.push([Math.cos(a) * (IT.r - 0.02), Math.sin(a) * (IT.r - 0.02), 6.06]);
    }
    pts.push([IT.channelX, IT.invertY + 0.05, 6.0]);
    return pipe(pts, 0.04);
  }, []);
  return (
    <group>
      {s.seep > 0.01 && (
        <mesh geometry={trail}>
          <meshStandardMaterial color="#8fcaff" emissive="#5ea7dc" emissiveIntensity={0.8} transparent opacity={0.75 * s.seep} />
        </mesh>
      )}
      {s.seep > 0.01 &&
        Array.from({ length: 6 }, (_, i) => {
          const k = (((i / 6 + s.t * 0.3) % 1) + 1) % 1;
          return (
            <mesh key={`ch${i}`} position={[IT.channelX, IT.invertY + 0.06, 5.6 - k * 12]} rotation={[-Math.PI / 2, 0, 0]} scale={s.seep}>
              <coneGeometry args={[0.12, 0.3, 3]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
            </mesh>
          );
        })}
      <ambientLight intensity={0.35} color="#fff4e2" />
      <hemisphereLight args={["#fff3dc", "#9a8f80", 0.6]} />
      <Rings R={IT.R} r={IT.r} len={IT.len} n={IT.n} z0={IT.z0} glow={s.glow} />
      {/* soil skin outside the rings (only seen at the open front) */}
      <mesh position={[0, 0, zc]}>
        <cylinderGeometry args={[IT.R + 0.6, IT.R + 0.6, L, 40, 1, true]} />
        <meshStandardMaterial color="#9a785c" roughness={1} side={1} />
      </mesh>
      <mesh geometry={inv} receiveShadow>
        <meshStandardMaterial color="#bdb7ad" roughness={0.9} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, IT.invertY + 0.09, zc]}>
          <boxGeometry args={[0.1, 0.18, L]} />
          <meshStandardMaterial color="#aeb5bb" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <mesh key={i} position={[0, IT.invertY + 0.02, IT.z0 - 0.4 - i * 1.1]}>
          <boxGeometry args={[1.7, 0.05, 0.22]} />
          <meshStandardMaterial color="#8d877e" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[IT.channelX, IT.invertY + 0.012, zc]}>
        <boxGeometry args={[0.26, 0.03, L]} />
        <meshStandardMaterial color={P.water} roughness={0.08} emissive={P.water} emissiveIntensity={0.3 + s.seep * 0.9} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => (
        <group key={`l${i}`}>
          <mesh position={[-1.85, 1.5, IT.z0 - 1 - i * 4]} rotation={[0, 0, 0.85]}>
            <boxGeometry args={[0.09, 0.42, 1.0]} />
            <meshStandardMaterial color="#fff6dc" emissive="#ffe9b0" emissiveIntensity={2.4} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <pointLight key={i} position={[-1.2, 1.2, IT.z0 - 2 - i * 9]} intensity={10} distance={14} decay={2} color="#ffe2a8" />
      ))}
      {/* cable trays on the left wall */}
      <mesh position={[-2.05, -0.2, zc]}>
        <boxGeometry args={[0.18, 0.08, L]} />
        <meshStandardMaterial color="#6d7378" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[0, IT.invertY + 0.2 + 1.25, s.train]}>
        <Train cars={4} lit={0.9} />
      </group>
      {s.seep > 0.01 &&
        beads.map((b, i) => (
          <mesh key={i} position={[b.x, b.y, b.z]} scale={s.seep * (0.7 + 0.3 * Math.sin(i))}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshPhysicalMaterial color="#cfe9ff" roughness={0.02} transmission={0.4} emissive="#8fcaff" emissiveIntensity={0.9} />
          </mesh>
        ))}
    </group>
  );
};
