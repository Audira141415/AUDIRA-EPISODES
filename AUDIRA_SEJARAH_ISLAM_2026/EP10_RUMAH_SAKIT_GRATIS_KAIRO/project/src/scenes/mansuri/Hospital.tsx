import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Fuzzy, SPHERE } from "../../kits/feltcraft/scene/Fuzzy";
import { FeltShape, RunningStitch, archPoints, felt, rect } from "./stitch";
import { M } from "./palette";

// Bimaristan al-Mansuri gate as a felt diorama: a Mamluk portal block with a pointed arch,
// ablaq (two-colour) voussoirs, a stitched band of abstract calligraphy-like strokes (no real
// text), open wooden doors, a warm lit hall behind, a ribbed felt dome and a minaret.

type V3 = [number, number, number];

export const PORTAL = { w: 2.2, h: 2.75, d: 0.36, archW: 1.12, spring: 1.2 };

const Voussoirs: React.FC<{ z: number }> = ({ z }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 23;
  const mats = useMemo(() => {
    const inner = archPoints(PORTAL.archW + 0.16, PORTAL.spring, 0.85, 60).slice(1, -1);
    const curve = new THREE.CatmullRomCurve3(inner.map(([x, y]) => new THREE.Vector3(x, y, z)));
    const out: THREE.Matrix4[] = [];
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      const p = curve.getPointAt(u);
      const tg = curve.getTangentAt(u);
      const ang = Math.atan2(tg.y, tg.x);
      out.push(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, ang)), new THREE.Vector3(1, 1, 1)));
    }
    return out;
  }, [z]);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    mats.forEach((mx, i) => m.setMatrixAt(i, mx));
    m.instanceMatrix.needsUpdate = true;
  }, [mats]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} castShadow material={felt(M.rust, 0.6)}>
      <boxGeometry args={[0.085, 0.2, 0.07]} />
    </instancedMesh>
  );
};

const Door: React.FC<{ side: -1 | 1; open: number }> = ({ side, open }) => {
  const w = PORTAL.archW / 2;
  const h = PORTAL.spring + 0.05;
  return (
    <group position={[side * w, 0, PORTAL.d + 0.04]} rotation={[0, side * open, 0]}>
      <group position={[-side * w * 0.5, h / 2, 0]}>
        <mesh material={felt(M.wood, 1)} castShadow receiveShadow>
          <boxGeometry args={[w * 0.96, h, 0.07]} />
        </mesh>
        {/* stitched panels and brass studs on the face toward the camera */}
        {[0.28, -0.12].map((y, i) => (
          <RunningStitch
            key={i}
            color={M.thread}
            dash={0.05}
            gap={0.035}
            pts={[
              [-w * 0.34, y - 0.17, 0.045],
              [w * 0.34, y - 0.17, 0.045],
              [w * 0.34, y + 0.17, 0.045],
              [-w * 0.34, y + 0.17, 0.045],
              [-w * 0.34, y - 0.17, 0.045],
            ]}
            linear
          />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[(i % 2 ? 1 : -1) * w * 0.3, i < 2 ? 0.5 : -0.45, 0.05]}>
            <sphereGeometry args={[0.028, 12, 8]} />
            <meshPhysicalMaterial color={M.brass} roughness={0.35} metalness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Dome: React.FC<{ position: V3; r: number }> = ({ position, r }) => {
  const meridians = useMemo(
    () =>
      Array.from({ length: 9 }, (_, k) => {
        const a = -Math.PI / 2 + (k / 8) * Math.PI; // front half only
        return Array.from({ length: 14 }, (_, i) => {
          const el = (i / 13) * (Math.PI / 2) * 0.96;
          return [Math.sin(a) * Math.cos(el) * r * 1.02, Math.sin(el) * r * 1.3 * 1.02, Math.cos(a) * Math.cos(el) * r * 1.02] as V3;
        });
      }),
    [r],
  );
  return (
    <group position={position}>
      <mesh material={felt(M.sandDeep, 1)} position={[0, -0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 1.02, r * 1.08, 0.44, 32]} />
      </mesh>
      <RunningStitch color={M.thread} pts={Array.from({ length: 17 }, (_, i) => { const a = -Math.PI / 2 + (i / 16) * Math.PI; return [Math.sin(a) * r * 1.04, -0.08, Math.cos(a) * r * 1.04] as V3; })} />
      <Fuzzy geometry={SPHERE} color={M.dome} shells={2} spacing={0.012} scale={[r, r * 1.3, r]} />
      {meridians.map((pts, i) => (
        <RunningStitch key={i} pts={pts} color={M.thread} dash={0.06} gap={0.05} r={0.009} />
      ))}
      {/* finial */}
      <mesh position={[0, r * 1.3 + 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.26, 8]} />
        <meshPhysicalMaterial color={M.brass} roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0, r * 1.3 + 0.26, 0]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshPhysicalMaterial color={M.brass} roughness={0.35} metalness={0.6} />
      </mesh>
    </group>
  );
};

const Minaret: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh material={felt(M.sand, 1)} position={[0, 0.9, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.2, 0.23, 1.8, 8]} />
    </mesh>
    <RunningStitch color={M.rust} pts={Array.from({ length: 9 }, (_, i) => { const a = -Math.PI / 2 + (i / 8) * Math.PI; return [Math.sin(a) * 0.225, 1.3, Math.cos(a) * 0.225] as V3; })} />
    <mesh material={felt(M.sandDeep, 1)} position={[0, 1.86, 0]} castShadow>
      <cylinderGeometry args={[0.32, 0.26, 0.1, 16]} />
    </mesh>
    <mesh material={felt(M.sand, 1)} position={[0, 2.25, 0]} castShadow>
      <cylinderGeometry args={[0.15, 0.17, 0.7, 8]} />
    </mesh>
    <mesh material={felt(M.sandDeep, 1)} position={[0, 2.64, 0]} castShadow>
      <cylinderGeometry args={[0.21, 0.17, 0.08, 16]} />
    </mesh>
    <Fuzzy geometry={SPHERE} color={M.dome} shells={2} spacing={0.02} position={[0, 2.8, 0]} scale={[0.15, 0.22, 0.15]} />
    <mesh position={[0, 3.08, 0]}>
      <cylinderGeometry args={[0.012, 0.02, 0.18, 6]} />
      <meshPhysicalMaterial color={M.brass} roughness={0.35} metalness={0.6} />
    </mesh>
  </group>
);

const Wing: React.FC<{ side: -1 | 1 }> = ({ side }) => {
  const W = 1.5;
  const H = 2.05;
  const x0 = side < 0 ? -PORTAL.w / 2 - W + 0.05 : PORTAL.w / 2 - 0.05;
  const win = archPoints(0.36, 0.95, 0.8, 16).map(([x, y]) => [x + x0 + W / 2, y + 0.55] as [number, number]);
  return (
    <group position={[0, 0, -0.32]}>
      <FeltShape outline={rect(x0, 0, x0 + W, H)} holes={[win]} depth={0.3} bevel={0.035} color={M.sandWing} repeat={1.4} />
      {/* window recess with cross-stitched lattice */}
      <mesh position={[x0 + W / 2, 1.05, 0.04]} material={felt(M.shade, 1)}>
        <boxGeometry args={[0.4, 1.0, 0.04]} />
      </mesh>
      {[-0.08, 0.08].map((dx, i) => (
        <RunningStitch key={i} color={M.thread} dash={0.05} gap={0.04} pts={[[x0 + W / 2 + dx, 0.6, 0.09], [x0 + W / 2 + dx, 1.42, 0.09]]} />
      ))}
      {/* ablaq courses: stitched joints and two rust felt bands across the wall */}
      {[0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((y) => (
        <group key={y}>
          <RunningStitch linear color={M.thread} dash={0.06} gap={0.05} r={0.008} pts={[[x0 + 0.08, y, 0.345], [x0 + W / 2 - 0.26, y, 0.345]]} />
          <RunningStitch linear color={M.thread} dash={0.06} gap={0.05} r={0.008} pts={[[x0 + W / 2 + 0.26, y, 0.345], [x0 + W - 0.08, y, 0.345]]} />
        </group>
      ))}
      {[0.42, 1.62].map((y) => (
        <group key={`b${y}`}>
          <mesh material={felt(M.rust, 0.8)} position={[x0 + (W / 2 - 0.26 + 0.08) / 2, y, 0.33]}>
            <boxGeometry args={[W / 2 - 0.34, 0.09, 0.03]} />
          </mesh>
          <mesh material={felt(M.rust, 0.8)} position={[x0 + W - (W / 2 - 0.26 + 0.08) / 2, y, 0.33]}>
            <boxGeometry args={[W / 2 - 0.34, 0.09, 0.03]} />
          </mesh>
        </group>
      ))}
      {/* crenellations */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} material={felt(M.sandWing, 1)} position={[x0 + 0.13 + i * (W - 0.26) / 5, H + 0.1, 0.18]} castShadow>
          <boxGeometry args={[0.14, 0.2, 0.2]} />
        </mesh>
      ))}
      <RunningStitch color={M.rust} pts={[[x0 + 0.08, H - 0.12, 0.36], [x0 + W - 0.08, H - 0.12, 0.36]]} />
    </group>
  );
};

/** Abstract calligraphy-like strokes stitched into a band (decorative, not text). */
const CalligraphyBand: React.FC<{ y: number; z: number; w: number }> = ({ y, z, w }) => {
  const strokes = useMemo(() => {
    const out: V3[][] = [];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + 0.12 + (i / (n - 1)) * (w - 0.24);
      const tall = i % 3 === 0;
      out.push(tall ? [[x - 0.03, y - 0.07, z], [x, y + 0.08, z], [x + 0.01, y + 0.09, z]] : [[x - 0.07, y - 0.03, z], [x - 0.02, y - 0.06, z], [x + 0.05, y - 0.02, z], [x + 0.06, y + 0.03, z]]);
    }
    return out;
  }, [y, z, w]);
  return (
    <group>
      <mesh material={felt(M.band, 1.2)} position={[0, y, z - 0.03]} castShadow>
        <boxGeometry args={[w, 0.26, 0.05]} />
      </mesh>
      {strokes.map((pts, i) => (
        <RunningStitch key={i} pts={pts} color={M.gold} dash={0.035} gap={0.012} r={0.012} />
      ))}
      <RunningStitch color={M.thread} pts={[[-w / 2 + 0.03, y + 0.15, z], [w / 2 - 0.03, y + 0.15, z]]} />
      <RunningStitch color={M.thread} pts={[[-w / 2 + 0.03, y - 0.15, z], [w / 2 - 0.03, y - 0.15, z]]} />
    </group>
  );
};

export const Hospital: React.FC<{ doorOpen: number }> = ({ doorOpen }) => {
  const { w, h, d, archW, spring } = PORTAL;
  const arch = useMemo(() => archPoints(archW, spring, 0.85, 30), [archW, spring]);
  // portal: rectangle with the arch notched out of the bottom edge (one simple polygon)
  const outline = useMemo(() => [[-w / 2, 0], ...arch, [w / 2, 0], [w / 2, h], [-w / 2, h]] as [number, number][], [arch, w, h]);
  // arch frame: outer arch down one side, inner arch back (a U-shaped band)
  const archOutline = useMemo(() => {
    const outer = archPoints(archW + 0.34, spring, 0.85, 30);
    return [...outer, ...arch.slice().reverse()] as [number, number][];
  }, [arch, archW, spring]);
  return (
    <group>
      {/* lit hall behind the gate */}
      <mesh position={[0, 1.05, -0.75]} material={felt(M.hall, 1)} receiveShadow>
        <boxGeometry args={[archW + 0.5, 2.2, 0.08]} />
      </mesh>
      <mesh position={[0, 0.02, -0.35]} material={felt(M.hallFloor, 1)} receiveShadow>
        <boxGeometry args={[archW + 0.5, 0.04, 0.8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (archW / 2 + 0.2), 1.1, -0.35]} material={felt(M.shade, 1)}>
          <boxGeometry args={[0.08, 2.2, 0.8]} />
        </mesh>
      ))}
      {/* hanging lanterns inside */}
      {[-0.25, 0.25].map((x, i) => (
        <group key={i} position={[x, 1.55 - i * 0.12, -0.45]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.6, 4]} />
            <meshStandardMaterial color={M.thread} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.06, 0.08, 0.16, 8]} />
            <meshStandardMaterial color={M.lantern} emissive={M.lantern} emissiveIntensity={0.9} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 1.2, -0.25]} intensity={7} distance={6} decay={1.4} color={M.glow} />
      <pointLight position={[0, 0.6, 0.6]} intensity={1.6} distance={3.5} decay={1.6} color={M.glow} />

      {/* portal block with the pointed arch cut through */}
      <FeltShape outline={outline} depth={d} bevel={0.05} color={M.sand} repeat={1.2} position={[0, 0, 0]} />
      {/* raised arch frame (cream) carrying the ablaq voussoirs */}
      <FeltShape outline={archOutline} depth={0.06} bevel={0.025} color={M.cream} repeat={0.8} position={[0, 0, d + 0.02]} />
      <Voussoirs z={d + 0.11} />
      <RunningStitch color={M.rust} pts={arch.slice(1, -1).map(([x, y]) => [x * 1.12, y + (y - spring > 0 ? 0.02 : 0), d + 0.07] as V3)} dash={0.05} gap={0.035} />
      {/* stitched border along the portal edges */}
      <RunningStitch linear color={M.thread} pts={[[-w / 2 + 0.08, 0.1, d + 0.06], [-w / 2 + 0.08, h - 0.08, d + 0.06], [w / 2 - 0.08, h - 0.08, d + 0.06], [w / 2 - 0.08, 0.1, d + 0.06]]} />
      <CalligraphyBand y={2.5} z={d + 0.08} w={w - 0.3} />
      {/* small stepped cornice on top */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} material={felt(M.sand, 1)} position={[-w / 2 + 0.14 + i * (w - 0.28) / 7, h + 0.1, d * 0.5]} castShadow>
          <boxGeometry args={[0.15, 0.22, 0.22]} />
        </mesh>
      ))}
      <Door side={-1} open={doorOpen} />
      <Door side={1} open={doorOpen} />
      {/* marble threshold */}
      <mesh position={[0, 0.03, d + 0.15]} material={felt(M.cream, 1)} receiveShadow castShadow>
        <boxGeometry args={[archW + 0.2, 0.06, 0.3]} />
      </mesh>

      <Wing side={-1} />
      <Wing side={1} />
      <Dome position={[-0.35, 2.45, -1.25]} r={0.78} />
      <group scale={0.85}><Minaret position={[1.15, 1.55, -1.2]} /></group>
    </group>
  );
};
