// EP08 parts: manuscript book, hero scalpel (steel blade, brass ferrules, ebony grip), table, ink motes.
import React, { useMemo } from "react";
import * as THREE from "three";
import { lathe } from "../../core/geometry/lathe.ts";
import { POLISH, RoundedBoxGeo, useSurfaceGrain } from "../../core/polish/Polish.tsx";
import { prng } from "../../core/materials/textures.ts";
import { leftPageTexture, rightPageTexture, tableTexture } from "./textures.ts";
import { GUTTER, PAGE_D, PAGE_W, PAL, STACK_H, pageCurve } from "./world.ts";

// ---------- table ----------
export const Table: React.FC = () => {
  const map = useMemo(() => tableTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshPhysicalMaterial map={map} roughness={0.42} metalness={0} clearcoat={0.35} clearcoatRoughness={0.35} />
    </mesh>
  );
};

// ---------- book ----------
/** Curved page: rises from the gutter and flattens toward the outer edge. side -1 = left, +1 = right. */
const pageGeometry = (side: -1 | 1) => {
  const g = new THREE.PlaneGeometry(PAGE_W, PAGE_D, 64, 8);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const lx = p.getX(i); // -W/2..W/2 (u 0..1)
    const u = lx / PAGE_W + 0.5;
    const xn = side < 0 ? 1 - u : u; // 0 at gutter, 1 at outer edge
    const y = pageCurve(xn);
    p.setXYZ(i, side < 0 ? -GUTTER - (1 - u) * PAGE_W : GUTTER + u * PAGE_W, y, p.getZ(i));
  }
  g.computeVertexNormals();
  return g;
};

export const Book: React.FC<{ reveal?: number[] }> = ({ reveal }) => {
  const left = useMemo(() => pageGeometry(-1), []);
  const right = useMemo(() => pageGeometry(1), []);
  const lt = leftPageTexture(reveal);
  const rt = useMemo(() => rightPageTexture(), []);
  const grain = useSurfaceGrain(31, 0.18, 4);
  return (
    <group>
      {/* leather cover board */}
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <RoundedBoxGeo args={[PAGE_W * 2 + 0.36, 0.12, PAGE_D + 0.3]} radius={0.05} />
        <meshPhysicalMaterial color={PAL.leather} roughness={0.62} roughnessMap={grain} sheen={0.3} sheenRoughness={0.6} clearcoat={0.15} />
      </mesh>
      {/* page stacks */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (PAGE_W / 2 + GUTTER), STACK_H / 2, 0]} castShadow receiveShadow>
          <RoundedBoxGeo args={[PAGE_W - 0.04, STACK_H, PAGE_D - 0.04]} radius={0.03} />
          <meshPhysicalMaterial color={PAL.pageEdge} {...POLISH.paper} />
        </mesh>
      ))}
      <mesh geometry={left} position={[0, STACK_H, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial map={lt} {...POLISH.paper} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={right} position={[0, STACK_H, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial map={rt} {...POLISH.paper} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ---------- scalpel ----------
export const bladeGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(-0.08, -0.075);
  s.lineTo(-0.08, 0.095);
  s.lineTo(0.95, 0.12);
  s.quadraticCurveTo(1.45, 0.115, 1.64, 0.02);
  s.quadraticCurveTo(1.22, -0.17, 0.56, -0.155);
  s.quadraticCurveTo(0.2, -0.13, -0.08, -0.075);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.016,
    bevelSegments: 4,
    curveSegments: 32,
  });
  g.translate(0, 0, -0.009);
  g.computeVertexNormals();
  return g;
};

// Turned handle profile (r, y), y from the blade (0) to the end knob.
const BRASS_PROFILE: [number, number][] = [
  [0, 0], [0.07, 0], [0.072, 0.03], [0.112, 0.07], [0.118, 0.13], [0.112, 0.19], [0.086, 0.24],
  [0.082, 0.62], [0.104, 0.66], [0.108, 0.72], [0.09, 0.76], [0.07, 0.8],
  [0.07, 2.32], [0.094, 2.36], [0.1, 2.44], [0.074, 2.5], [0.066, 2.62],
  [0.1, 2.7], [0.132, 2.8], [0.136, 2.88], [0.112, 2.97], [0.06, 3.04], [0, 3.06],
];
const GRIP_PROFILE: [number, number][] = (() => {
  const pts: [number, number][] = [[0.07, 0.78], [0.094, 0.82]];
  for (let i = 0; i <= 18; i++) {
    const y = 0.86 + i * 0.081;
    pts.push([i % 2 ? 0.088 : 0.096, y]);
  }
  pts.push([0.094, 2.3], [0.07, 2.33]);
  return pts;
})();

export const Scalpel: React.FC<{ glint?: number }> = () => {
  const blade = useMemo(() => bladeGeometry(), []);
  const brass = useMemo(() => lathe(BRASS_PROFILE, 72), []);
  const grip = useMemo(() => lathe(GRIP_PROFILE, 72), []);
  const grain = useSurfaceGrain(12, 0.12, 6);
  return (
    // local +X = blade direction; centred on its length
    <group position={[0.7, 0, 0]}>
      <mesh geometry={blade} castShadow>
        <meshPhysicalMaterial color={PAL.steel} metalness={1} roughness={0.3} clearcoat={0.5} clearcoatRoughness={0.08} anisotropy={0.8} envMapIntensity={1.6} />
      </mesh>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={brass} castShadow>
          <meshPhysicalMaterial color={PAL.brass} metalness={1} roughness={0.24} roughnessMap={grain} />
        </mesh>
        <mesh geometry={grip} castShadow>
          <meshPhysicalMaterial color={PAL.ebony} metalness={0} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.18} />
        </mesh>
      </group>
    </group>
  );
};

// ---------- ink → metal motes ----------
/** Flecks rising from the page drawing toward the hero: dark ink below turning to warm metal above. */
export const Motes: React.FC<{ from: [number, number, number]; to: [number, number, number]; f: number; n?: number }> = ({ from, to, f, n = 18 }) => {
  const seeds = useMemo(() => {
    const r = prng(4242);
    return Array.from({ length: n }, () => ({ u: r(), a: r() * Math.PI * 2, rad: 0.15 + r() * 0.9, sp: 0.6 + r() * 0.8, s: 0.03 + r() * 0.03, k: r() }));
  }, [n]);
  return (
    <group>
      {seeds.map((m, i) => {
        const t = (m.u + f * 0.0012 * m.sp) % 1;
        const x = from[0] + (to[0] - from[0]) * t + Math.cos(m.a + t * 2) * m.rad * (1 - t * 0.6);
        const y = from[1] + (to[1] - from[1]) * t;
        const z = from[2] + (to[2] - from[2]) * t + Math.sin(m.a + t * 2) * m.rad * (1 - t * 0.6);
        const metal = t > 0.3;
        return (
          <mesh key={i} position={[x, y, z]} scale={m.s * (1 - Math.abs(t - 0.5) * 0.8)}>
            <octahedronGeometry args={[1, 0]} />
            {metal ? (
              <meshPhysicalMaterial color={PAL.brass} metalness={1} roughness={0.25} />
            ) : (
              <meshStandardMaterial color={PAL.ink} roughness={0.8} />
            )}
          </mesh>
        );
      })}
    </group>
  );
};

/** Large bright softbox cards above and behind the camera: only visible in metal reflections. */
export const Softboxes: React.FC = () => (
  <group>
    <mesh position={[1, 15, 13]} rotation={[-0.9, 0, 0]}>
      <planeGeometry args={[12, 5]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[-8, 11, 11]} rotation={[-0.6, -0.7, 0]}>
      <planeGeometry args={[3, 10]} />
      <meshBasicMaterial color="#e8eef8" toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  </group>
);
