// EP07 Sistem Imun — procedural immune-cell cast (NANOFORGE recipe: glossy membranes, bump-textured, rim-lit).
// The Polyfork catalog has no cells/bacteria (checked 2026-11-25), so cells are textured meshes, never Points/boxes.
import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NANO_PALETTE as P } from "../../kits/nanoforge/lib/palette";
import { brownianDrift, membranePulse } from "../../kits/nanoforge/core/motion";
import { hash } from "../../kits/nanoforge/core/noise";
import { FONT } from "../../core/type/fonts.ts";
import type { V3 } from "./timeline.ts";

// ---------------------------------------------------------------- geometry
const noise3 = (x: number, y: number, z: number, s: number) =>
  Math.sin(x + s) * Math.sin(y * 1.31 + s * 2.1) * Math.sin(z * 0.87 + s * 3.3) +
  0.5 * Math.sin(x * 2.3 + s * 5.1) * Math.sin(y * 2.1 + s * 1.7) * Math.sin(z * 2.6 + s * 0.3) +
  0.25 * Math.sin(x * 5.1 + y * 4.3 + s) * Math.sin(z * 4.7 - s);

const cache = new Map<string, THREE.BufferGeometry>();
const cached = (key: string, make: () => THREE.BufferGeometry) => {
  let g = cache.get(key);
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
};

/** Unit sphere with seeded bumps (pores / granules) so membranes never read as smooth plastic. */
export const bumpyGeo = (seed: number, amp = 0.06, freq = 5, detail = 5) =>
  cached(`b${seed}|${amp}|${freq}|${detail}`, () => {
    let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail);
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    g = mergeVertices(g);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      const n = noise3(v.x * freq, v.y * freq, v.z * freq, seed);
      v.multiplyScalar(1 + amp * n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  });

/** Biconcave red-blood-cell disc (Evans–Fung profile), radius 1, axis = y. */
const rbcGeo = () =>
  cached("rbc", () => {
    const zf = (x: number) => 0.5 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.207 + 2.003 * x * x - 1.123 * x ** 4);
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) pts.push(new THREE.Vector2(Math.max(0.001, i / 24), zf(i / 24) + 0.02));
    for (let i = 24; i >= 0; i--) pts.push(new THREE.Vector2(Math.max(0.001, i / 24), -zf(i / 24) - 0.02));
    const g = new THREE.LatheGeometry(pts, 48);
    g.computeVertexNormals();
    return g;
  });

/** Bumpy plane (tissue / skin), lying in XZ. */
export const tissueGeo = (seed: number, size = 40, amp = 0.35, freq = 0.9) =>
  cached(`t${seed}|${size}|${amp}|${freq}`, () => {
    const g = new THREE.PlaneGeometry(size, size, 200, 200);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, amp * noise3(x * freq, z * freq, (x + z) * 0.5 * freq, seed));
    }
    g.computeVertexNormals();
    return g;
  });

/** Inside of a blood vessel: open tube along z with bumpy wall. */
export const vesselGeo = (radius = 4, length = 80) =>
  cached(`v${radius}|${length}`, () => {
    const g = new THREE.CylinderGeometry(radius, radius, length, 96, 240, true);
    g.rotateX(Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = Math.atan2(v.y, v.x);
      const n = noise3(Math.cos(a) * 3, Math.sin(a) * 3, v.z * 0.6, 7);
      const k = 1 + 0.06 * n;
      p.setXYZ(i, v.x * k, v.y * k, v.z);
    }
    g.computeVertexNormals();
    return g;
  });

const fib = (n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });
const UP = new THREE.Vector3(0, 1, 0);
export const quatTo = (d: readonly number[]) => new THREE.Quaternion().setFromUnitVectors(UP, new THREE.Vector3(d[0], d[1], d[2]).normalize());
const VILLI = fib(46).map((d) => ({ d, q: quatTo(d) }));
const PODS = fib(7).map((d) => ({ d, q: quatTo(d) }));
const COAT = fib(10).map((d) => ({ d, q: quatTo(d) }));

const starGeo = () =>
  cached("star", () => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.45 : 1;
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 3 });
    g.center();
    return g;
  });

const flagGeo = () =>
  cached("flag", () => {
    const pts = Array.from({ length: 14 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.9) * 0.18, -0.85 - i * 0.12, Math.cos(i * 0.9) * 0.18));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.025, 6, false);
  });

// ---------------------------------------------------------------- shared bits
type Base = { f: number; pos: V3; s?: number; q?: number; seed?: number };
const drift = (f: number, seed: number, a = 0.1): V3 => [brownianDrift(f, 0.02, a, seed), brownianDrift(f, 0.025, a, seed + 1.7), brownianDrift(f, 0.018, a * 0.6, seed + 3.1)];

/** Y-shaped antibody: glossy gold heavy chains, cyan binding tips. Origin = centre of the Y. */
export const Antibody: React.FC<{ pos: V3; s?: number; q?: number; quat?: THREE.Quaternion; rot?: V3 }> = ({ pos, s = 0.4, q = 1, quat, rot = [0, 0, 0] }) => {
  if (q <= 0.01) return null;
  const mat = <meshPhysicalMaterial color={P.lipidAmber} roughness={0.22} metalness={0.35} clearcoat={1} emissive={P.adenineGold} emissiveIntensity={0.35} />;
  const tip = <meshStandardMaterial color={P.thymineCyan} emissive={P.thymineCyan} emissiveIntensity={1.2} />;
  const arm = (side: 1 | -1) => (
    <group rotation={[0, 0, side * -0.62]}>
      <mesh position={[0, 0.42, 0]}>
        <capsuleGeometry args={[0.11, 0.6, 6, 12]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        {tip}
      </mesh>
    </group>
  );
  return (
    <group position={pos} quaternion={quat} rotation={quat ? undefined : rot} scale={s * q}>
      <mesh position={[0, -0.42, 0]}>
        <capsuleGeometry args={[0.12, 0.62, 6, 12]} />
        {mat}
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 14, 14]} />
        {mat}
      </mesh>
      {arm(1)}
      {arm(-1)}
    </group>
  );
};

// ---------------------------------------------------------------- cast
/** Neutrophil: milky granular membrane, 3-lobed violet nucleus, optional pseudopod toward `reach` (local dir). dead 0..1 → pus yellow. */
export const Neutrophil: React.FC<Base & { reach?: V3; reachK?: number; dead?: number; glow?: number }> = ({ f, pos, s = 1, q = 1, seed = 1, reach, reachK = 0, dead = 0, glow = 0 }) => {
  if (q <= 0.01) return null;
  const col = new THREE.Color("#f4f7fb").lerp(new THREE.Color("#d6b84a"), dead);
  const d = drift(f, seed);
  const pulse = membranePulse(f + seed * 37, 0.05, 0.035);
  const geo = bumpyGeo(seed % 4, 0.075, 5.5);
  const podQ = reach ? quatTo(reach) : null;
  const mat = (
    <meshPhysicalMaterial color={col} roughness={0.16} metalness={0} transmission={0.42} thickness={1.4} ior={1.38} clearcoat={1} clearcoatRoughness={0.06} iridescence={0.55} iridescenceIOR={1.3} sheen={0.8} sheenColor="#9be7ff" envMapIntensity={1.4} emissive={dead > 0.5 ? "#6b5a1a" : "#bfe3ff"} emissiveIntensity={0.1 + glow * 0.5} />
  );
  return (
    <group position={[pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]]} scale={s * q * pulse} rotation={[f * 0.003 + seed, f * 0.004, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        {mat}
      </mesh>
      {[0, 2.1, 4.2].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.3, Math.sin(a) * 0.22, 0.42]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color={P.cytosineViolet} emissive={P.cytosineViolet} emissiveIntensity={0.25 * (1 - dead)} roughness={0.4} />
        </mesh>
      ))}
      {podQ && reachK > 0.01 && (
        <group quaternion={podQ}>
          <mesh position={[0, 0.85 + reachK * 0.6, 0]} geometry={bumpyGeo(9, 0.1, 4, 4)} scale={[0.34, 0.45 + reachK * 0.9, 0.34]}>
            {mat}
          </mesh>
        </group>
      )}
    </group>
  );
};

/** Red blood cell: biconcave disc, deep red clearcoat. */
export const RedCell: React.FC<Base & { rot?: V3 }> = ({ pos, s = 1, q = 1, rot = [0, 0, 0] }) => {
  if (q <= 0.01) return null;
  return (
    <mesh geometry={rbcGeo()} position={pos} rotation={rot} scale={s * q} castShadow>
      <meshPhysicalMaterial color="#c81e3a" roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.25} sheen={0.6} sheenColor="#ff6b81" emissive="#5a0612" emissiveIntensity={0.25} />
    </mesh>
  );
};

/** Rod bacterium: lime capsule with dark granules + flagellum; coat 0..1 sticks antibodies on it. */
export const Bacterium: React.FC<Base & { rot?: V3; coat?: number; dead?: number; glow?: number; ghost?: number }> = ({ f, pos, s = 1, q = 1, seed = 1, rot = [0, 0, 0], coat = 0, dead = 0, glow = 0, ghost = 0 }) => {
  if (q <= 0.01) return null;
  const col = new THREE.Color("#8bd61f").lerp(new THREE.Color("#4b5563"), dead);
  const d = drift(f, seed, 0.06);
  const op = 1 - ghost * 0.55;
  const dots = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ y: (hash(seed * 13 + i) - 0.5) * 1.2, a: hash(seed * 7 + i) * Math.PI * 2 })), [seed]);
  return (
    <group position={[pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]]} rotation={rot} scale={s * q}>
      <group rotation={[0, f * 0.01 + seed, Math.sin(f * 0.05 + seed) * 0.08]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.34, 1.15, 10, 20]} />
          <meshPhysicalMaterial color={col} roughness={0.42} sheen={1} sheenColor="#d9ff7a" clearcoat={0.4} emissive={ghost > 0 ? "#22ff88" : col} emissiveIntensity={0.14 + glow * 0.9} transparent={ghost > 0} opacity={op} />
        </mesh>
        {dots.map((p, i) => (
          <mesh key={i} position={[Math.cos(p.a) * 0.33, p.y, Math.sin(p.a) * 0.33]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#3f6212" roughness={0.6} transparent={ghost > 0} opacity={op} />
          </mesh>
        ))}
        <group rotation={[Math.sin(f * 0.2 + seed) * 0.3, 0, Math.cos(f * 0.17 + seed) * 0.3]}>
          <mesh geometry={flagGeo()}>
            <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={0.3} transparent={ghost > 0} opacity={op} />
          </mesh>
        </group>
        {COAT.map((c, i) => {
          const k = Math.min(1, Math.max(0, coat * COAT.length - i));
          if (k <= 0.01) return null;
          const p: V3 = [c.d[0] * 0.5, c.d[1] * 0.95, c.d[2] * 0.5];
          return <Antibody key={i} pos={[p[0] * 1.3, p[1] * 1.15, p[2] * 1.3]} s={0.24} q={k} quat={quatTo([-c.d[0], -c.d[1], -c.d[2]])} />;
        })}
      </group>
    </group>
  );
};

/** Macrophage: big violet granular blob with 7 waving pseudopods. eat 0..1 widens the front. */
export const Macrophage: React.FC<Base & { eat?: number; glow?: number }> = ({ f, pos, s = 1, q = 1, seed = 3, eat = 0, glow = 0 }) => {
  if (q <= 0.01) return null;
  const d = drift(f, seed, 0.05);
  const pulse = membranePulse(f + seed * 30, 0.03, 0.04);
  const mat = <meshPhysicalMaterial color="#8b5cf6" roughness={0.34} transmission={0.3} thickness={2} ior={1.36} clearcoat={0.8} emissive="#5b21b6" emissiveIntensity={0.18 + glow * 0.4} />;
  return (
    <group position={[pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]]} scale={[s * q * pulse * (1 + eat * 0.12), s * q * pulse, s * q * pulse]}>
      <mesh geometry={bumpyGeo(11, 0.13, 3.2)} castShadow receiveShadow>
        {mat}
      </mesh>
      <mesh position={[-0.2, 0.1, 0.3]} geometry={bumpyGeo(12, 0.15, 3, 4)} scale={0.42}>
        <meshStandardMaterial color="#4c1d95" emissive="#7c3aed" emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
      {PODS.map((p, i) => {
        const len = 0.5 + 0.35 * Math.sin(f * 0.05 + i * 1.7);
        return (
          <group key={i} quaternion={p.q}>
            <mesh position={[0, 0.95 + len * 0.45, 0]} geometry={bumpyGeo(20 + i, 0.12, 4, 4)} scale={[0.22, 0.4 + len * 0.5, 0.22]}>
              {mat}
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** T cell: microvilli-covered sphere. badge = gold star (helper T "general"). */
export const TCell: React.FC<Base & { color?: string; badge?: boolean; glow?: number; squash?: number }> = ({ f, pos, s = 1, q = 1, seed = 5, color = "#3b82f6", badge = false, glow = 0, squash = 0 }) => {
  if (q <= 0.01) return null;
  const d = drift(f, seed, 0.06);
  const pulse = membranePulse(f + seed * 21, 0.05, 0.03);
  return (
    <group position={[pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]]} scale={[s * q * pulse * (1 + squash * 0.15), s * q * pulse * (1 - squash * 0.12), s * q * pulse]}>
      <group rotation={[0, Math.sin(f * 0.01 + seed) * 0.4, 0]}>
        <mesh geometry={bumpyGeo(30 + (seed % 3), 0.05, 7)} castShadow>
          <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} emissive={color} emissiveIntensity={0.12 + glow * 0.6} />
        </mesh>
        {VILLI.map((v, i) => (
          <group key={i} quaternion={v.q}>
            <mesh position={[0, 1.08, 0]}>
              <capsuleGeometry args={[0.035, 0.16, 4, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {badge && (
          <mesh geometry={starGeo()} position={[0, 0.15, 1.12]} scale={0.42}>
            <meshPhysicalMaterial color={P.adenineGold} metalness={0.8} roughness={0.2} clearcoat={1} emissive={P.adenineGold} emissiveIntensity={0.6 + glow} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/** B cell: smooth golden-yellow cell with Y receptors; fires antibodies from outside. */
export const BCell: React.FC<Base & { glow?: number }> = ({ f, pos, s = 1, q = 1, seed = 7, glow = 0 }) => {
  if (q <= 0.01) return null;
  const d = drift(f, seed, 0.06);
  const pulse = membranePulse(f + seed * 17, 0.06, 0.04 + glow * 0.04);
  return (
    <group position={[pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]]} scale={s * q * pulse}>
      <mesh geometry={bumpyGeo(40, 0.025, 6)} castShadow>
        <meshPhysicalMaterial color="#facc15" roughness={0.2} transmission={0.25} thickness={1} clearcoat={1} emissive="#f59e0b" emissiveIntensity={0.15 + glow * 0.5} />
      </mesh>
      <mesh position={[0.1, 0, 0.3]} scale={0.48} geometry={bumpyGeo(41, 0.1, 4, 4)}>
        <meshStandardMaterial color="#b45309" emissive="#f59e0b" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {COAT.map((c, i) => (
        <Antibody key={i} pos={[c.d[0] * 1.12, c.d[1] * 1.12, c.d[2] * 1.12]} s={0.2} quat={c.q} />
      ))}
    </group>
  );
};

/** Memory cell: blue membrane + gold halo ring. */
export const MemoryCell: React.FC<Base & { glow?: number }> = ({ f, pos, s = 1, q = 1, seed = 9, glow = 0 }) => {
  if (q <= 0.01) return null;
  return (
    <group position={pos} scale={s * q}>
      <TCell f={f} pos={[0, 0, 0]} seed={seed} color="#38bdf8" glow={glow * 0.6} />
      <group rotation={[1.25 + Math.sin(f * 0.01 + seed) * 0.12, f * 0.012 + seed, 0.2]}>
        <mesh>
          <torusGeometry args={[1.55, 0.06, 16, 96]} />
          <meshStandardMaterial color={P.adenineGold} emissive={P.adenineGold} emissiveIntensity={1.3 + glow} metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

/** Infected body cell: amber → red with virus-like knobs; burst 0..1 shatters it. */
export const InfectedCell: React.FC<Base & { burst?: number; sick?: number }> = ({ f, pos, s = 1, q = 1, seed = 13, burst = 0, sick = 1 }) => {
  const shards = useMemo(() => fib(18).map((d, i) => ({ d, r: 0.18 + hash(i + seed) * 0.22, spin: hash(i * 3 + seed) * 6 })), [seed]);
  if (q <= 0.01) return null;
  const col = new THREE.Color("#f59e0b").lerp(new THREE.Color("#dc2626"), sick);
  const body = 1 - Math.min(1, burst * 1.6);
  return (
    <group position={pos} scale={s * q}>
      {body > 0.02 && (
        <group scale={body * membranePulse(f + seed * 9, 0.08, 0.05 + burst * 0.2)}>
          <mesh geometry={bumpyGeo(50, 0.09, 4.5)} castShadow>
            <meshPhysicalMaterial color={col} roughness={0.3} transmission={0.3} thickness={1} clearcoat={0.8} emissive={col} emissiveIntensity={0.25 + burst} />
          </mesh>
          {fib(14).map((d, i) => (
            <mesh key={i} position={[d[0] * 1.04, d[1] * 1.04, d[2] * 1.04]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshStandardMaterial color={P.guanineRuby} emissive={P.guanineRuby} emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
      )}
      {burst > 0.01 &&
        shards.map((sh, i) => {
          const r = 0.6 + burst * 3.2;
          const fade = 1 - Math.max(0, burst - 0.55) / 0.45;
          return (
            <mesh key={i} position={[sh.d[0] * r, sh.d[1] * r, sh.d[2] * r]} rotation={[burst * sh.spin, burst * sh.spin * 0.7, 0]} scale={sh.r * Math.max(0.05, fade)}>
              <tetrahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.9} roughness={0.4} />
            </mesh>
          );
        })}
    </group>
  );
};

// ---------------------------------------------------------------- environment
/** Floating micro-medium: bokeh motes + far translucent vesicles (BG plane). */
export const Medium: React.FC<{ f: number; tint?: string[]; spread?: number; center?: V3 }> = ({ f, tint = [P.thymineCyan, P.membraneGlow, P.cytosineViolet], spread = 1, center = [0, 0, 0] }) => {
  const parts = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: (hash(i * 3 + 1) - 0.5) * 26,
        y: (hash(i * 3 + 2) - 0.5) * 22,
        z: -8 + (hash(i * 3 + 3) - 0.5) * 16,
        s: 0.04 + hash(i) * 0.09,
        v: 0.004 + hash(i + 50) * 0.01,
      })),
    [],
  );
  return (
    <group position={center} scale={spread}>
      {parts.map((p, i) => {
        const c = tint[i % tint.length];
        return (
          <mesh key={i} position={[p.x + Math.sin(f * 0.02 + i) * 0.25, ((p.y + f * p.v + 11) % 22) - 11, p.z]}>
            <sphereGeometry args={[p.s, 10, 10]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} transparent opacity={0.7} />
          </mesh>
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const c = tint[i % tint.length];
        return (
          <mesh key={`v${i}`} position={[(hash(i * 7 + 1) - 0.5) * 18 + brownianDrift(f, 0.01, 0.4, i), (hash(i * 7 + 2) - 0.5) * 16, -10 - hash(i * 7 + 3) * 8]} scale={(0.9 + hash(i * 5) * 1.5) * membranePulse(f + i * 50, 0.03, 0.05)}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.22} transparent opacity={0.3} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Canvas-texture label plate (3D, in-world brand text). */
export const LabelPlate: React.FC<{ text: string; sub?: string; width?: number; color?: string; bg?: string; position?: V3; rotation?: V3; opacity?: number }> = ({
  text,
  sub,
  width = 3,
  color = "#ffffff",
  bg = "rgba(6,14,32,0.88)",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  opacity = 1,
}) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 384;
    const g = c.getContext("2d")!;
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(8, 8, 1008, 368, 48);
    g.fill();
    g.strokeStyle = P.adenineGold;
    g.lineWidth = 10;
    g.stroke();
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    let px = sub ? 150 : 180;
    g.font = `900 ${px}px ${FONT}, sans-serif`;
    while (px > 60 && g.measureText(text).width > 880) {
      px -= 6;
      g.font = `900 ${px}px ${FONT}, sans-serif`;
    }
    g.fillText(text, 512, sub ? 150 : 192);
    if (sub) {
      g.fillStyle = P.thymineCyan;
      g.font = `800 80px ${FONT}, sans-serif`;
      g.fillText(sub, 512, 290);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [text, sub, color, bg]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width * 0.375]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
};
